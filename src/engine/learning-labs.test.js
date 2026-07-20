import assert from 'node:assert/strict'
import test from 'node:test'
import { compareControl, compareTdTargets, runActorCritic, runDqnStability, runFunctionApproximation, runMonteCarlo, runMonteCarloCourse, runPolicyGradient, runStochasticApproximation } from './learning-labs.js'

test('Part II lab outputs are deterministic and parameter-sensitive', () => {
  assert.deepEqual(runMonteCarlo(), runMonteCarlo())
  assert.notEqual(runMonteCarlo({ visit: 'first' }).visits, runMonteCarlo({ visit: 'every' }).visits)
  assert.ok(runStochasticApproximation({ decay: true }).series.length > 20)
  const targets = compareTdTargets({ n: 1 })
  assert.equal(targets.nStep, targets.td)
  const control = compareControl({ epsilon: 0.4 })
  assert.ok(control.qDanger > control.sarsaDanger)
})

test('the Monte Carlo family lab reuses the course world and exposes coverage, visit weighting, and policy softness', () => {
  const baseline = runMonteCarloCourse()
  assert.deepEqual(baseline, runMonteCarloCourse())
  assert.equal(baseline.counts.length, 25)
  assert.equal(baseline.counts[0].length, 5)
  assert.ok(Math.abs(baseline.policy.reduce((sum, item) => sum + item.probability, 0) - 1) < 1e-12)
  assert.ok(baseline.policy.every((item) => item.probability > 0))

  const firstVisit = runMonteCarloCourse({ visit: 'first' })
  const everyVisit = runMonteCarloCourse({ visit: 'every' })
  const firstUpdates = firstVisit.counts.flat().reduce((sum, count) => sum + count, 0)
  const everyUpdates = everyVisit.counts.flat().reduce((sum, count) => sum + count, 0)
  assert.ok(everyUpdates > firstUpdates)

  const greedy = runMonteCarloCourse({ variant: 'exploring' })
  assert.equal(greedy.policy.filter((item) => item.probability === 1).length, 1)
})

test('Part III labs expose sharing, stability, policy, and actor-critic effects', () => {
  const narrow = runFunctionApproximation({ width: 0.4 })
  const wide = runFunctionApproximation({ width: 2 })
  assert.ok(wide.spillover > narrow.spillover)
  assert.ok(runDqnStability({ replay: 1 }).correlation < runDqnStability({ replay: 0 }).correlation)
  assert.ok(runPolicyGradient({ advantage: 2 }).nextProbability > runPolicyGradient({ advantage: 2 }).probability)
  assert.ok(runActorCritic({ reward: 3 }).delta > 0)
})
