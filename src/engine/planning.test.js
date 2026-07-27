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
  assert.equal(result.trace[1].evaluationSweeps, 3)
  assert.equal(result.trace[1].evaluationStartValues.length, 25)
  assert.equal(result.trace[1].evaluatedPolicy.length, 25)
  assert.deepEqual(Object.keys(result.trace[1].improvementActionValues).sort(), ['down', 'left', 'right', 'stay', 'up'])
  assert.ok(result.timeline.some((event) => event.phase === 'evaluation'))
  assert.ok(result.timeline.some((event) => event.phase === 'improvement'))
  assert.equal(result.timeline[1].backups, 25)
})

test('policy iteration uses deeper evaluation and fewer outer policy updates than value iteration', () => {
  const results = comparePlanningAlgorithms({ gamma: 0.9, noise: 0, truncation: 3 })
  assert.ok(results.pi.policyUpdates < results.vi.policyUpdates)
  assert.ok(results.pi.backups > results.pi.policyUpdates * 25)
})

test('policy iteration exposes in-progress inner evaluation before its first policy improvement', () => {
  const result = runPlanningAlgorithm({ algorithm: 'pi', gamma: 0.9, noise: 0 })
  const event = result.timeline.reduce(
    (selected, candidate) => candidate.backups <= 225 ? candidate : selected,
    result.timeline[0],
  )

  assert.equal(event.phase, 'evaluation')
  assert.equal(event.backups, 225)
  assert.equal(event.policyUpdates, 0)
  assert.ok(event.sweep > 0)
  assert.ok(event.values.some((value) => value !== 0))
})

test('one-sweep truncated policy iteration is exactly the Value Iteration endpoint', () => {
  const vi = runPlanningAlgorithm({ algorithm: 'vi', gamma: 0.9, noise: 0, maxOuter: 40 })
  const tpi = runPlanningAlgorithm({ algorithm: 'tpi', gamma: 0.9, noise: 0, truncation: 1, maxOuter: 40 })

  assert.equal(tpi.trace.length, vi.trace.length)
  vi.trace.forEach((step, index) => {
    assert.deepEqual(tpi.trace[index].values, step.values)
    assert.deepEqual(tpi.trace[index].policy, step.policy)
    assert.equal(tpi.trace[index].backups, step.backups)
    assert.equal(tpi.trace[index].evaluationSweeps, step.evaluationSweeps)
  })
})
