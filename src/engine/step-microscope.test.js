import test from 'node:test'
import assert from 'node:assert/strict'

import { STEP_PHASES, createStepRecord, phaseForFocus } from '../interaction/stepMicroscope.js'

test('Step Microscope exposes one stable four-phase teaching sequence', () => {
  assert.deepEqual(STEP_PHASES, ['select', 'action', 'target', 'assign'])
  assert.equal(phaseForFocus('state'), 'select')
  assert.equal(phaseForFocus('action'), 'action')
  assert.equal(phaseForFocus('reward'), 'target')
  assert.equal(phaseForFocus('gamma'), 'target')
})

test('a committed step records before, expectation, target, after, and residual', () => {
  const expectation = [{ probability: 1, reward: 1, state: { row: 3, col: 2 } }]
  const record = createStepRecord({
    selection: { row: 3, col: 1 },
    outcome: { values: Array(25).fill(0), before: 0, expectation, target: 1, residual: 1 },
  })

  assert.equal(record.before, 0)
  assert.equal(record.expectation, expectation)
  assert.equal(record.target, 1)
  assert.equal(record.after, 1)
  assert.equal(record.residual, 1)
})

test('Step Microscope rejects incomplete or non-finite outcomes', () => {
  assert.throws(() => createStepRecord({ selection: 's', outcome: { before: 0, target: 1, residual: 1 } }))
  assert.throws(() => createStepRecord({ selection: 's', outcome: { values: [], before: 0, target: Infinity, residual: 1 } }))
})
