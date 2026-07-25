import assert from 'node:assert/strict'
import test from 'node:test'
import { compareControl, compareTdTargets, runActorCritic, runDqnStability, runFunctionApproximation, runMonteCarlo, runMonteCarloCourse, runPolicyGradient, runStochasticApproximation, runStochasticApproximationComparison } from './learning-labs.js'

test('Part II lab outputs are deterministic and parameter-sensitive', () => {
  assert.deepEqual(runMonteCarlo(), runMonteCarlo())
  assert.notEqual(runMonteCarlo({ visit: 'first' }).visits, runMonteCarlo({ visit: 'every' }).visits)
  assert.ok(runStochasticApproximation({ decay: true }).series.length > 20)
  const targets = compareTdTargets({ n: 1 })
  assert.equal(targets.nStep, targets.td)
  const control = compareControl({ epsilon: 0.4 })
  assert.ok(control.qDanger > control.sarsaDanger)
})

test('n-step TD reads its bootstrap from the displayed value table', () => {
  for (const n of [1, 2, 3, 4, 5]) {
    const result = compareTdTargets({ n, gamma: 0.9 })
    const tableEntry = result.valueTable[n]
    assert.equal(result.bootstrap.time, n)
    assert.equal(result.bootstrap.stateId, tableEntry.stateId)
    assert.equal(result.bootstrap.value, tableEntry.estimate)
    assert.equal(
      result.nStep,
      result.rewardContributions.reduce((sum, item) => sum + item.contribution, 0) + result.bootstrap.contribution,
    )
  }
})

test('stochastic approximation comparison exposes a shared evidence stream and exact update ledger', () => {
  const result = runStochasticApproximationComparison({ alpha: 0.2, noise: 1.1, batchSize: 5, drifting: true })
  assert.deepEqual(result, runStochasticApproximationComparison({ alpha: 0.2, noise: 1.1, batchSize: 5, drifting: true }))
  assert.equal(result.observations.length, 36)
  assert.equal(result.decaying.ledger.length, result.observations.length)
  assert.equal(result.constant.ledger.length, result.observations.length)
  assert.equal(result.sampleCost, 180)
  result.constant.ledger.forEach((entry, index) => {
    assert.equal(entry.observation, result.observations[index])
    assert.ok(Math.abs(entry.before + entry.correction - entry.after) < 1e-12)
  })
  result.decaying.weights.forEach(({ initial, samples }) => {
    assert.ok(Math.abs(initial + samples.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12)
  })
  const late = result.targets.length - 1
  assert.ok(Math.abs(result.constant.series[late] - result.targets[late]) < Math.abs(result.decaying.series[late] - result.targets[late]))
})

test('the Monte Carlo family lab reuses the course world and exposes coverage, visit weighting, and policy softness', () => {
  const baseline = runMonteCarloCourse()
  assert.deepEqual(baseline, runMonteCarloCourse())
  assert.equal(baseline.counts.length, 25)
  assert.equal(baseline.counts[0].length, 5)
  assert.equal(baseline.environmentContract, 'episodic-target-terminal')
  assert.equal(baseline.totalPairs, 120)
  assert.equal(baseline.samples.every((episode) => episode.terminated && episode.steps.at(-1).terminated), true)
  assert.equal(baseline.samples.every((episode) => episode.steps.length <= baseline.maxEpisodeSteps), true)
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

test('Sarsa and Q-learning targets are a controlled counterfactual over one Q snapshot', () => {
  const result = compareControl({ epsilon: 0.12, alpha: 0.3, seed: 20260719 })
  const { nextState, sarsaNextAction, qGreedyAction, reward } = result.transition
  const actions = ['up', 'right', 'down', 'left']
  const row = result.qSnapshot[nextState]
  const sarsaValue = row[actions.indexOf(sarsaNextAction)]
  const greedyValue = row[actions.indexOf(qGreedyAction)]
  assert.equal(result.sarsaTarget, reward + 0.9 * sarsaValue)
  assert.equal(result.qTarget, reward + 0.9 * greedyValue)
  assert.equal(result.qTarget, reward + 0.9 * Math.max(...row))
  assert.notEqual(sarsaNextAction, qGreedyAction)
})

test('Part III labs expose sharing, stability, policy, and actor-critic effects', () => {
  const narrow = runFunctionApproximation({ width: 0.4 })
  const wide = runFunctionApproximation({ width: 2 })
  assert.ok(wide.spillover > narrow.spillover)
  assert.ok(runDqnStability({ replay: 1 }).correlation < runDqnStability({ replay: 0 }).correlation)
  const beforeSync = runDqnStability({ steps: 7, targetPeriod: 8 })
  assert.equal(beforeSync.lastUpdate.synced, false)
  assert.deepEqual(beforeSync.lastUpdate.targetAfter, beforeSync.lastUpdate.targetBefore)
  assert.equal(beforeSync.lastUpdate.error, beforeSync.lastUpdate.targetValue - beforeSync.lastUpdate.prediction)
  const atSync = runDqnStability({ steps: 8, targetPeriod: 8 })
  assert.equal(atSync.lastUpdate.synced, true)
  assert.deepEqual(atSync.lastUpdate.targetAfter, atSync.lastUpdate.onlineAfter)
  assert.equal(new Set(atSync.buffer.map((item) => item.key)).size, atSync.buffer.length)
  const policyStep = runPolicyGradient({ advantage: 2 })
  assert.ok(policyStep.nextProbability > policyStep.probability)
  assert.ok(Math.abs(policyStep.probabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12)
  assert.ok(Math.abs(policyStep.nextProbabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12)
  assert.ok(policyStep.nextProbabilities.filter((_, index) => index !== policyStep.actionIndex).reduce((sum, value) => sum + value, 0)
    < policyStep.probabilities.filter((_, index) => index !== policyStep.actionIndex).reduce((sum, value) => sum + value, 0))
  assert.ok(runActorCritic({ reward: 3 }).delta > 0)
})

test('policy gradient exposes state-conditioned policies, per-step contributions, and rollout variance', () => {
  const result = runPolicyGradient({ baseline: 0.8, selectedStep: 1 })
  assert.equal(result.statePolicies.length, result.returns.length)
  assert.equal(new Set(result.statePolicies.map((item) => item.probabilities.map((value) => value.toFixed(6)).join(','))).size, result.statePolicies.length)
  result.stepContributions.forEach((item) => {
    assert.ok(Math.abs(item.scoreVector.reduce((sum, value) => sum + value, 0)) < 1e-12)
    assert.deepEqual(item.contributionVector, item.scoreVector.map((value) => value * item.advantage))
  })
  assert.ok(result.rollouts.length > 1)
  assert.ok(result.varianceWithBaseline < result.varianceWithoutBaseline)
})

test('actor-critic exposes synchronized critic and complete actor before/after state', () => {
  const result = runActorCritic({ reward: 1, nextValue: 2.8, ratio: 1 })
  assert.equal(result.critic.valueAfter, result.critic.valueBefore + result.critic.correction)
  assert.equal(result.critic.correction, 0.18 * result.delta)
  assert.deepEqual(result.actor.logitsAfter, result.actor.logitsBefore.map((value, index) => value + result.actor.updateVector[index]))
  assert.ok(Math.abs(result.actor.probabilitiesBefore.reduce((sum, value) => sum + value, 0) - 1) < 1e-12)
  assert.ok(Math.abs(result.actor.probabilitiesAfter.reduce((sum, value) => sum + value, 0) - 1) < 1e-12)
  assert.ok(result.actor.probabilitiesAfter[result.actor.actionIndex] > result.actor.probabilitiesBefore[result.actor.actionIndex])
})
