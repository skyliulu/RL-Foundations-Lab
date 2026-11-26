import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { evaluateDpo, evaluateGrpo } from './post-training.js'

describe('post-training method calculations', () => {
  it('DPO assigns more than even probability to the preferred response', () => {
    const result = evaluateDpo({ beta: 1 })
    assert.ok(result.preferenceProbability > 0.5)
    assert.ok(result.loss < Math.log(2))
    assert.ok(result.after.chosenShift > result.chosenShift)
    assert.ok(result.after.rejectedShift < result.rejectedShift)
    assert.ok(result.after.loss < result.loss)
    assert.equal(result.gradients.chosen, -1 * (1 - result.preferenceProbability))
    assert.equal(result.gradients.rejected, 1 * (1 - result.preferenceProbability))
    assert.equal(result.after.chosenShift, result.chosenShift - result.learningRate * result.gradients.chosen)
    assert.equal(result.after.rejectedShift, result.rejectedShift - result.learningRate * result.gradients.rejected)
  })

  it('GRPO group-relative advantages are centered and clipped', () => {
    const result = evaluateGrpo()
    const meanAdvantage = result.samples.reduce((sum, sample) => sum + sample.advantage, 0) / result.samples.length
    assert.ok(Math.abs(meanAdvantage) < 1e-8)
    assert.ok(result.samples.some((sample) => sample.ratio !== sample.clippedRatio))
  })

  it('GRPO supports variable group sizes and filters uninformative groups under dynamic sampling', () => {
    const large = evaluateGrpo({ rewards: [0.2, 0.9, 0.55, -0.05, 0.75, 0.1, 0.85, 0.3] })
    assert.equal(large.groupSize, 8)
    assert.equal(large.activeCount, 8)
    assert.equal(large.informative, true)

    const flatUnfiltered = evaluateGrpo({ rewards: [1, 1, 1, 1], dynamicSampling: false })
    assert.equal(flatUnfiltered.informative, false)
    assert.equal(flatUnfiltered.filteredOut, false)
    assert.equal(flatUnfiltered.activeCount, 4)

    const flatFiltered = evaluateGrpo({ rewards: [1, 1, 1, 1], dynamicSampling: true })
    assert.equal(flatFiltered.informative, false)
    assert.equal(flatFiltered.filteredOut, true)
    assert.equal(flatFiltered.activeCount, 0)
    assert.ok(flatFiltered.samples.every((sample) => !sample.usedInUpdate && sample.effectiveObjective === 0))

    const clipHigher = evaluateGrpo({ clip: 0.2, clipHigh: 0.34 })
    assert.ok(clipHigher.unlockedCount > 0)
    const sampleB = clipHigher.samples.find((s) => s.id === 'B')
    assert.equal(sampleB.clipHigherUnlocked, true)
    assert.equal(sampleB.clippedRatio, sampleB.ratio)
  })
})
