import test from 'node:test'
import assert from 'node:assert/strict'

import {
  compareTdTargets,
  runActorCritic,
  runDqnStability,
  runPolicyGradient,
} from './learning-labs.js'
import { evaluateCredit } from './modern-extension.js'
import { evaluatePpo } from './ppo.js'

const pick = (object, keys) => Object.fromEntries(keys.map((key) => [key, object[key]]))

test('PPO clipping changes the constraint but not the sampled batch or raw policy ratios', () => {
  const narrow = evaluatePpo({ clip: 0.1, updateStrength: 0.32 })
  const wide = evaluatePpo({ clip: 0.4, updateStrength: 0.32 })
  const evidenceKeys = ['id', 'advantage', 'direction', 'oldProbability', 'token', 'reward', 'ratio', 'approxKl']

  assert.deepEqual(
    narrow.samples.map((sample) => pick(sample, evidenceKeys)),
    wide.samples.map((sample) => pick(sample, evidenceKeys)),
  )
  assert.ok(narrow.clippedCount > wide.clippedCount)
  assert.ok(narrow.samples.some((sample, index) => sample.clippedRatio !== wide.samples[index].clippedRatio))
})

test('DQN replay changes sampling order while preserving the observed stream and target clock', () => {
  const sequential = runDqnStability({ replay: 0, targetPeriod: 8, steps: 42, seed: 20260719 })
  const replayed = runDqnStability({ replay: 1, targetPeriod: 8, steps: 42, seed: 20260719 })

  assert.deepEqual(sequential.buffer, replayed.buffer)
  assert.equal(sequential.targetPeriod, replayed.targetPeriod)
  assert.equal(sequential.lastUpdate.number, replayed.lastUpdate.number)
  assert.notDeepEqual(sequential.sampledKeys, replayed.sampledKeys)
})

test('n-step TD changes only the comparison horizon over one shared-grid playback', () => {
  const oneStep = compareTdTargets({ n: 1, gamma: 0.9 })
  const threeStep = compareTdTargets({ n: 3, gamma: 0.9 })

  assert.deepEqual(oneStep.trajectories, threeStep.trajectories)
  assert.deepEqual(
    oneStep.updates.map((update) => update.valuesAfter),
    threeStep.updates.map((update) => update.valuesAfter),
  )
  assert.equal(oneStep.updates[0].comparison.horizon, 1)
  assert.equal(threeStep.updates[0].comparison.horizon, 3)
  assert.equal(oneStep.updates[0].comparison.rewardContributions.length, 1)
  assert.equal(threeStep.updates[0].comparison.rewardContributions.length, 3)
})

test('a policy-gradient baseline preserves sampled evidence and only recenters contributions', () => {
  const raw = runPolicyGradient({ baseline: 0, selectedStep: 2 })
  const centered = runPolicyGradient({ baseline: 0.8, selectedStep: 2 })

  assert.deepEqual(raw.returns, centered.returns)
  assert.deepEqual(raw.actionIndices, centered.actionIndices)
  assert.deepEqual(raw.statePolicies, centered.statePolicies)
  assert.deepEqual(
    raw.rollouts.map((rollout) => pick(rollout, ['id', 'actionIndex', 'return', 'score', 'rawContribution'])),
    centered.rollouts.map((rollout) => pick(rollout, ['id', 'actionIndex', 'return', 'score', 'rawContribution'])),
  )
  assert.ok(centered.rollouts.some((rollout, index) => rollout.centeredContribution !== raw.rollouts[index].centeredContribution))
})

test('Actor–Critic importance weighting changes only the actor path', () => {
  const onPolicy = runActorCritic({ ratio: 1 })
  const reweighted = runActorCritic({ ratio: 0.55 })

  assert.deepEqual(onPolicy.critic, reweighted.critic)
  assert.deepEqual(onPolicy.actor.logitsBefore, reweighted.actor.logitsBefore)
  assert.deepEqual(onPolicy.actor.probabilitiesBefore, reweighted.actor.probabilitiesBefore)
  assert.notDeepEqual(onPolicy.actor.updateVector, reweighted.actor.updateVector)
  assert.notDeepEqual(onPolicy.actor.probabilitiesAfter, reweighted.actor.probabilitiesAfter)
})

test('credit schemes reuse one agent trace and vary only the attribution rule', () => {
  const process = evaluateCredit({ scheme: 'process', gamma: 0.9, trust: 0.7 })
  const replay = evaluateCredit({ scheme: 'counterfactual', gamma: 0.9, trust: 0.7 })
  const evidenceKeys = ['id', 'tool', 'observation', 'role', 'segment', 'localEvidence']

  assert.deepEqual(
    process.credits.map((step) => pick(step, evidenceKeys)),
    replay.credits.map((step) => pick(step, evidenceKeys)),
  )
  assert.deepEqual(process.replays, replay.replays)
  assert.ok(process.credits.some((step, index) => step.credit !== replay.credits[index].credit))
})
