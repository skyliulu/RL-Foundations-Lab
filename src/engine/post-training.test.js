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
})
