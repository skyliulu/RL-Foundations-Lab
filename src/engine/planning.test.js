import test from 'node:test'
import assert from 'node:assert/strict'

import { comparePlanningAlgorithms, runPlanningAlgorithm } from './planning.js'

test('VI, truncated PI, and PI converge to the same optimal value', () => {
  const results = comparePlanningAlgorithms({ gamma: 0.9, noise: 0, truncation: 3, maxOuter: 240 })
  for (const result of Object.values(results)) assert.ok(result.maxValueError < 1e-5, `${result.algorithm} error ${result.maxValueError}`)
  results.vi.values.forEach((value, index) => {
    assert.ok(Math.abs(value - results.tpi.values[index]) < 1e-5)
    assert.ok(Math.abs(value - results.pi.values[index]) < 1e-5)
  })
})

test('planning traces expose backups, policy changes, and propagation snapshots', () => {
  const result = runPlanningAlgorithm({ algorithm: 'tpi', truncation: 3 })
  assert.ok(result.trace.length > 2)
  assert.ok(result.trace.some((step) => step.policyChanges > 0))
  assert.ok(result.trace.at(-1).backups > 0)
  assert.equal(result.trace[0].values.length, 25)
  assert.equal(result.trace[0].policy.length, 25)
})

test('policy iteration uses deeper evaluation and fewer outer policy updates than value iteration', () => {
  const results = comparePlanningAlgorithms({ gamma: 0.9, noise: 0, truncation: 3 })
  assert.ok(results.pi.policyUpdates < results.vi.policyUpdates)
  assert.ok(results.pi.backups > results.pi.policyUpdates * 25)
})
