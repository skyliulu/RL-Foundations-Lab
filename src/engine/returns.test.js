import test from 'node:test'
import assert from 'node:assert/strict'

import { GOAL, START } from './gridworld.js'
import { estimateStateValue, exactStateValue, simulateDiscountedReturn } from './returns.js'

test('a deterministic continuing trajectory reproduces the exact fixed-policy value', () => {
  const sample = simulateDiscountedReturn({ start: START, gamma: 0.9, noise: 0, horizon: 240 })
  const exact = exactStateValue({ start: START, gamma: 0.9, noise: 0 })
  assert.ok(Math.abs(sample.discountedReturn - exact) < 1e-4)
  assert.ok(sample.tailBound < 1e-9)
})

test('the target is continuing and accumulates a geometric discounted return', () => {
  const sample = simulateDiscountedReturn({ start: GOAL, gamma: 0.9, noise: 0, horizon: 240 })
  assert.ok(Math.abs(sample.discountedReturn - 10) < 1e-8)
  assert.equal(sample.steps[0].reward, 1)
  assert.deepEqual(sample.steps[0].nextState, GOAL)
})

test('sampled value estimates are seeded and converge toward the exact expectation', () => {
  const config = { start: START, gamma: 0.9, noise: 0.3, sampleCount: 512, horizon: 180 }
  const first = estimateStateValue(config)
  const second = estimateStateValue(config)
  assert.deepEqual(first.runningMeans, second.runningMeans)
  assert.ok(Math.abs(first.mean - first.exact) < 0.25)
  assert.equal(first.samples.length, 512)
})

test('each return equals the sum of the visible discounted contributions', () => {
  const sample = simulateDiscountedReturn({ start: START, gamma: 0.7, noise: 0.2, seed: 7 })
  const sum = sample.steps.reduce((total, step) => total + step.contribution, 0)
  assert.ok(Math.abs(sum - sample.discountedReturn) < 1e-12)
})
