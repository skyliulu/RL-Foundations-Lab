import test from 'node:test'
import assert from 'node:assert/strict'

import { COURSE_REWARDS, START, indexOf } from './gridworld.js'
import { comparePolicyAndOptimal, inspectActionCompetition, solveOperator } from './optimality.js'

test('the Bellman optimality fixed point dominates the fixed-policy value', () => {
  const comparison = comparePolicyAndOptimal({ gamma: 0.9, noise: 0 })
  comparison.gaps.forEach((gap) => assert.ok(gap >= -1e-8))
  assert.ok(comparison.gaps.some((gap) => gap > 1))
})

test('the optimality operator selects the largest of the five action targets', () => {
  const solution = solveOperator({ gamma: 0.9, operator: 'optimal' })
  const detail = inspectActionCompetition({ state: START, values: solution.values, gamma: 0.9 })
  assert.ok(Math.abs(detail.bestTarget - solution.values[indexOf(START)]) < 1e-8)
  assert.ok(detail.bestActions.length >= 1)
  assert.ok(detail.actions.every((action) => action.target <= detail.bestTarget + 1e-10))
})

test('a stronger forbidden penalty changes the optimal value landscape', () => {
  const baseline = solveOperator({ gamma: 0.9, operator: 'optimal' })
  const cautious = solveOperator({ gamma: 0.9, operator: 'optimal', rewards: { ...COURSE_REWARDS, forbidden: -10 } })
  assert.notDeepEqual(cautious.values.map((value) => value.toFixed(6)), baseline.values.map((value) => value.toFixed(6)))
  assert.ok(cautious.values[indexOf(START)] < baseline.values[indexOf(START)])
})
