import test from 'node:test'
import assert from 'node:assert/strict'
import {
  GOAL,
  COURSE_FIXED_POLICY_VALUES,
  FORBIDDEN_STATES,
  START,
  actionTarget,
  backupState,
  compareDiscountHorizons,
  converge,
  createInitialValues,
  describeBackup,
  indexOf,
  transitionsFor,
} from './gridworld.js'
import { evaluatePpo } from './ppo.js'

test('transition probabilities remain normalized under slip noise', () => {
  const transitions = transitionsFor(START, 'right', 0.2)
  const total = transitions.reduce((sum, item) => sum + item.probability, 0)
  assert.ok(Math.abs(total - 1) < 1e-12)
})

test('the course reward model distinguishes boundary, forbidden, target, and ordinary moves', () => {
  const values = createInitialValues()
  assert.equal(actionTarget(START, 'up', values, 0.9, 0), -1)
  assert.equal(actionTarget({ row: 1, col: 0 }, 'right', values, 0.9, 0), -1)
  assert.equal(actionTarget({ row: GOAL.row, col: GOAL.col - 1 }, 'right', values, 0.9, 0), 1)
  assert.equal(actionTarget(START, 'right', values, 0.9, 0), 0)
})

test('an author preset can inspect a boundary action without changing the policy', () => {
  const values = createInitialValues()
  const state = { row: 0, col: 0 }
  const detail = describeBackup(state, values, 0.9, 0, 'fixed', 'up')

  assert.equal(detail.action, 'up')
  assert.deepEqual(detail.primary.state, state)
  assert.equal(detail.primary.reward, -1)
  assert.equal(detail.target, -1)
})

test('forbidden cells remain accessible states rather than walls', () => {
  const values = createInitialValues()
  const state = { row: 1, col: 0 }
  const result = backupState(state, values, 0.9, 0, 'greedy')
  assert.equal(values.length, 25)
  assert.equal(values[indexOf(FORBIDDEN_STATES[0])], 0)
  assert.equal(result.before, 0)
  assert.ok(Number.isFinite(result.values[indexOf(state)]))
})

test('single-state backup follows the fixed policy printed in lecture 2', () => {
  const values = createInitialValues()
  const state = { row: 3, col: 1 }
  const result = backupState(state, values, 0.9, 0, 'fixed')
  assert.equal(result.action, 'right')
  assert.equal(result.values[indexOf(state)], 1)
  assert.equal(result.before, 0)
})

test('optimal value iteration reproduces the continuing-task values in the course', () => {
  const result = converge({ gamma: 0.9, noise: 0, optimal: true, limit: 200 })
  assert.ok(result.residuals.at(-1) < 1e-4)
  assert.ok(Math.abs(result.values[indexOf(GOAL)] - 10) < 0.01)
  assert.ok(result.values[indexOf(START)] > 5.7 && result.values[indexOf(START)] < 5.9)
  assert.ok(result.values.every(Number.isFinite))
})

test('fixed-policy evaluation reproduces the lecture 2 reference table', () => {
  const result = converge({ gamma: 0.9, noise: 0, optimal: false, limit: 200 })
  const maxError = Math.max(...result.values.map((value, index) => Math.abs(value - COURSE_FIXED_POLICY_VALUES[index])))
  assert.ok(result.residuals.at(-1) < 1e-4)
  assert.ok(maxError <= 0.051)
})

test('discount-horizon comparison changes only gamma and uses a shared converged protocol', () => {
  const result = compareDiscountHorizons({ baselineGamma: 0.9, comparisonGamma: 0.5 })
  assert.equal(result.baseline.values.length, 25)
  assert.equal(result.comparison.values.length, 25)
  assert.ok(result.baseline.residuals.at(-1) < 1e-4)
  assert.ok(result.comparison.residuals.at(-1) < 1e-4)
  assert.ok(result.courseMaxError <= 0.051)
  assert.ok(result.deltas[indexOf({ row: 4, col: 4 })] < -7.5)
})

test('PPO clipping bounds ratios and preserves finite metrics', () => {
  const result = evaluatePpo({ clip: 0.2, updateStrength: 0.5 })
  assert.ok(result.clippedCount > 0)
  result.samples.filter((sample) => sample.clipped).forEach((sample) => {
    assert.ok(sample.clippedRatio >= 0.8 && sample.clippedRatio <= 1.2)
  })
  assert.ok(Number.isFinite(result.meanKl))
})
