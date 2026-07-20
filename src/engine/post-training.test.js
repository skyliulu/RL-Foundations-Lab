import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { evaluateDpo, evaluateGrpo } from './post-training.js'

describe('post-training method calculations', () => {
  it('DPO assigns more than even probability to the preferred response', () => {
    const result = evaluateDpo({ beta: 1 })
    assert.ok(result.preferenceProbability > 0.5)
    assert.ok(result.loss < Math.log(2))
  })

  it('GRPO group-relative advantages are centered and clipped', () => {
    const result = evaluateGrpo()
    const meanAdvantage = result.samples.reduce((sum, sample) => sum + sample.advantage, 0) / result.samples.length
    assert.ok(Math.abs(meanAdvantage) < 1e-8)
    assert.ok(result.samples.some((sample) => sample.ratio !== sample.clippedRatio))
  })
})
