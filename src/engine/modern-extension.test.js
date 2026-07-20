import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildAgentTrajectory, evaluateCodingReward, evaluateCredit } from './modern-extension.js'

describe('modern extension experiments', () => {
  it('reveals a visible-test shortcut with hidden tests', () => {
    assert.equal(evaluateCodingReward({ candidateId: 'B', mode: 'outcome' }).reward, 1)
    const hidden = evaluateCodingReward({ candidateId: 'B', mode: 'outcome', revealHidden: true })
    assert.equal(hidden.reward, 0)
    assert.equal(hidden.generalizes, false)
  })

  it('agent trajectories distinguish environment termination from success', () => {
    assert.equal(buildAgentTrajectory().success, true)
    assert.equal(buildAgentTrajectory({ failureAt: 'test' }).success, false)
  })

  it('credit schemes assign different signals to the same trajectory', () => {
    const terminal = evaluateCredit({ scheme: 'terminal' })
    const hindsight = evaluateCredit({ scheme: 'hindsight' })
    assert.notDeepEqual(terminal.credits.map((step) => step.credit), hindsight.credits.map((step) => step.credit))
    assert.ok(hindsight.credits.some((step) => step.credit < 0))
  })
})
