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
    const success = buildAgentTrajectory()
    const badLocalization = buildAgentTrajectory({ failureAt: 'inspect' })
    const stopped = buildAgentTrajectory({ failureAt: 'test' })
    assert.equal(success.success, true)
    assert.equal(stopped.success, false)
    assert.notDeepEqual(success.pathIds, badLocalization.pathIds)
    assert.equal(success.nodes.some((node) => node.branchAlternative), true)
    assert.equal(badLocalization.steps[1].id, 'inspect-parser')
    assert.equal(success.steps[1].id, 'inspect-boundary')
  })

  it('credit schemes assign different signals to the same trajectory', () => {
    const terminal = evaluateCredit({ scheme: 'terminal' })
    const segment = evaluateCredit({ scheme: 'segment' })
    const counterfactual = evaluateCredit({ scheme: 'counterfactual' })
    assert.notDeepEqual(terminal.credits.map((step) => step.credit), counterfactual.credits.map((step) => step.credit))
    segment.credits.forEach((step) => {
      const contract = segment.segments[step.segment]
      assert.equal(step.credit, contract.outcome - contract.baseline)
    })
    counterfactual.credits.forEach((step) => {
      assert.equal(step.evidence, step.replay.chosenOutcome - step.replay.alternativeOutcome)
    })
  })
})
