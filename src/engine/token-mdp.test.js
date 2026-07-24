import assert from 'node:assert/strict'
import test from 'node:test'
import { buildTokenTrajectory } from './token-mdp.js'

const base = {
  tokens: ['a', 'b'],
  old: [-0.4, -0.5],
  ref: [-0.5, -0.6],
  process: [0.2, 0],
}

test('EOS termination zeros the final bootstrap mask', () => {
  const result = buildTokenTrajectory({
    response: { ...base, end: 'terminated' },
    sequenceReward: 1,
    beta: 0,
    gamma: 0.9,
    truncationValue: 3,
  })
  assert.equal(result.terminated, true)
  assert.equal(result.rows.at(-1).bootstrapMask, 0)
  assert.equal(result.finalBootstrap, 0)
  assert.equal(result.rows.at(-1).returnValue, 1)
})

test('length truncation preserves continuation value through the final bootstrap mask', () => {
  const result = buildTokenTrajectory({
    response: { ...base, end: 'truncated' },
    sequenceReward: 1,
    beta: 0,
    gamma: 0.9,
    truncationValue: 3,
  })
  assert.equal(result.truncated, true)
  assert.equal(result.rows.at(-1).bootstrapMask, 1)
  assert.equal(result.finalBootstrap, 2.7)
  assert.equal(result.rows.at(-1).returnValue, 3.7)
  assert.notEqual(
    result.rows.at(-1).returnValue,
    buildTokenTrajectory({ response: { ...base, end: 'terminated' }, sequenceReward: 1, beta: 0, gamma: 0.9, truncationValue: 3 }).rows.at(-1).returnValue,
  )
})
