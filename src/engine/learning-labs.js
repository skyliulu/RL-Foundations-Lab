import {
  ACTION_NAMES,
  allStates,
  attemptMove,
  fixedPolicyAction,
  indexOf,
  rewardForTransition,
} from './gridworld.js'

function lcg(seed) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length
}

export function runMonteCarlo({ episodes = 24, epsilon = 0.2, seed = 20260719, visit = 'first' } = {}) {
  const random = lcg(seed)
  const returns = Array.from({ length: episodes }, (_, index) => {
    const explored = random() < epsilon
    const routeNoise = (random() - 0.5) * 2.4
    return 6.2 - 3.4 * epsilon + (explored ? 2.2 : 0) + routeNoise + Math.sin(index * 0.7) * 0.35
  })
  const estimatorSamples = visit === 'every'
    ? returns.flatMap((value, index) => Array.from({ length: 1 + (index % 3 === 0 ? 1 : 0) }, (_, repeat) => value - repeat * 0.35))
    : returns
  const running = []
  estimatorSamples.reduce((estimate, value, index) => {
    const next = estimate + (value - estimate) / (index + 1)
    running.push(next)
    return next
  }, 0)
  return { series: running, samples: returns, estimate: running.at(-1), coverage: Math.min(1, 0.18 + epsilon * 2.7 + episodes / 90), visits: estimatorSamples.length }
}

function argmaxAction(values) {
  return ACTION_NAMES.reduce((best, action, index) => (
    values[index] > values[best.index] ? { action, index } : best
  ), { action: ACTION_NAMES[0], index: 0 }).action
}

function actionDistribution(state, q, variant, epsilon) {
  const row = q[indexOf(state)]
  const greedy = argmaxAction(row)
  if (variant !== 'epsilon') {
    return ACTION_NAMES.map((action) => ({ action, probability: action === greedy ? 1 : 0 }))
  }
  return ACTION_NAMES.map((action) => ({
    action,
    probability: epsilon / ACTION_NAMES.length + (action === greedy ? 1 - epsilon : 0),
  }))
}

function sampleAction(distribution, random) {
  const draw = random()
  let cumulative = 0
  for (const item of distribution) {
    cumulative += item.probability
    if (draw <= cumulative) return item.action
  }
  return distribution.at(-1).action
}

function stateLabel(state) {
  return `s${indexOf(state) + 1}`
}

function pairKey(state, action) {
  return `${indexOf(state)}:${action}`
}

export function runMonteCarloCourse({
  variant = 'epsilon',
  episodes = 24,
  epsilon = 0.2,
  visit = 'every',
  seed = 20260719,
  horizon = 24,
  gamma = 0.9,
} = {}) {
  const random = lcg(seed)
  const states = allStates()
  const q = states.map((state) => ACTION_NAMES.map((action) => (
    action === fixedPolicyAction(state) ? 0.05 : 0
  )))
  const counts = states.map(() => ACTION_NAMES.map(() => 0))
  const returnsSums = states.map(() => ACTION_NAMES.map(() => 0))
  const episodeRecords = []

  for (let episodeIndex = 0; episodeIndex < episodes; episodeIndex += 1) {
    const enumeratedPair = episodeIndex % (states.length * ACTION_NAMES.length)
    let state = variant === 'basic'
      ? states[Math.floor(enumeratedPair / ACTION_NAMES.length)]
      : variant === 'exploring'
        ? states[Math.floor(random() * states.length)]
        : states[0]
    let forcedAction = variant === 'basic'
      ? ACTION_NAMES[enumeratedPair % ACTION_NAMES.length]
      : variant === 'exploring'
        ? ACTION_NAMES[Math.floor(random() * ACTION_NAMES.length)]
        : null
    const steps = []

    for (let time = 0; time < horizon; time += 1) {
      const distribution = actionDistribution(state, q, variant, epsilon)
      const action = forcedAction || sampleAction(distribution, random)
      forcedAction = null
      const outcome = attemptMove(state, action)
      const reward = rewardForTransition(outcome.state, outcome.boundary)
      steps.push({ time, state, action, reward, nextState: outcome.state })
      state = outcome.state
    }

    let returnValue = 0
    for (let time = steps.length - 1; time >= 0; time -= 1) {
      returnValue = steps[time].reward + gamma * returnValue
      steps[time].returnValue = returnValue
    }

    const firstVisit = new Set()
    const updates = []
    for (let time = 0; time < steps.length; time += 1) {
      const step = steps[time]
      const key = pairKey(step.state, step.action)
      const shouldUse = visit === 'every' || !firstVisit.has(key)
      firstVisit.add(key)
      step.used = shouldUse
      if (!shouldUse) continue
      const stateIndex = indexOf(step.state)
      const actionIndex = ACTION_NAMES.indexOf(step.action)
      const before = q[stateIndex][actionIndex]
      counts[stateIndex][actionIndex] += 1
      returnsSums[stateIndex][actionIndex] += step.returnValue
      q[stateIndex][actionIndex] = returnsSums[stateIndex][actionIndex] / counts[stateIndex][actionIndex]
      updates.push({
        time,
        state: stateLabel(step.state),
        action: step.action,
        returnValue: step.returnValue,
        before,
        after: q[stateIndex][actionIndex],
        visits: counts[stateIndex][actionIndex],
      })
    }
    episodeRecords.push({ index: episodeIndex, steps, updates })
  }

  const visitedPairs = counts.flat().filter((count) => count > 0).length
  const stateCoverage = counts.map((row) => row.reduce((sum, count) => sum + count, 0))
  const sampleIndices = [...new Set([0, Math.floor((episodes - 1) / 2), episodes - 1])]
  const samples = sampleIndices.map((index) => episodeRecords[index])
  const focusState = samples.at(-1).steps[0].state

  return {
    variant,
    episodes,
    epsilon,
    visit,
    gamma,
    q,
    counts,
    coverage: visitedPairs / (states.length * ACTION_NAMES.length),
    visitedPairs,
    stateCoverage,
    samples,
    focusState: stateLabel(focusState),
    policy: actionDistribution(focusState, q, variant, epsilon),
  }
}

export function runStochasticApproximation({ alpha = 0.18, decay = true, noise = 1.4, steps = 48, seed = 20260719 } = {}) {
  const random = lcg(seed)
  const target = 3
  let estimate = -1
  const series = []
  const observations = []
  for (let index = 0; index < steps; index += 1) {
    const observation = target + (random() + random() - 1) * noise * 2
    const stepSize = decay ? 1 / (index + 2) : alpha
    estimate += stepSize * (observation - estimate)
    observations.push(observation)
    series.push(estimate)
  }
  return { series, observations, estimate, target, error: Math.abs(estimate - target) }
}

function historicalWeights(stepSizes) {
  const histories = []
  for (let end = 0; end < stepSizes.length; end += 1) {
    const weights = []
    let futureRetention = 1
    for (let index = end; index >= 0; index -= 1) {
      weights[index] = stepSizes[index] * futureRetention
      futureRetention *= 1 - stepSizes[index]
    }
    histories.push({ initial: futureRetention, samples: weights })
  }
  return histories
}

function runSchedule(observations, targets, stepAt, initial = -1) {
  let estimate = initial
  const series = []
  const ledger = []
  const stepSizes = []
  observations.forEach((observation, index) => {
    const before = estimate
    const stepSize = stepAt(index)
    const residual = observation - before
    const correction = stepSize * residual
    estimate = before + correction
    stepSizes.push(stepSize)
    series.push(estimate)
    ledger.push({
      index: index + 1,
      target: targets[index],
      observation,
      before,
      residual,
      stepSize,
      correction,
      after: estimate,
    })
  })
  return { estimate, series, ledger, weights: historicalWeights(stepSizes) }
}

export function runStochasticApproximationComparison({
  alpha = 0.18,
  noise = 1.4,
  batchSize = 1,
  drifting = false,
  steps = 36,
  seed = 20260719,
} = {}) {
  const random = lcg(seed)
  const driftAt = Math.floor(steps / 2)
  const targets = Array.from({ length: steps }, (_, index) => (drifting && index >= driftAt ? 5 : 3))
  const observations = targets.map((target) => {
    let perturbation = 0
    for (let sample = 0; sample < batchSize; sample += 1) {
      perturbation += (random() + random() - 1) * noise * 2
    }
    return target + perturbation / batchSize
  })
  const decaying = runSchedule(observations, targets, (index) => 1 / (index + 1))
  const constant = runSchedule(observations, targets, () => alpha)
  return {
    alpha,
    noise,
    batchSize,
    drifting,
    driftAt,
    targets,
    observations,
    decaying,
    constant,
    sampleCost: steps * batchSize,
  }
}

export function compareTdTargets({ gamma = 0.9, n = 3, value = 2.4, nextValue = 3.1 } = {}) {
  const rewards = [0, -1, 0.5, 0, 4]
  const mc = rewards.reduce((total, reward, index) => total + gamma ** index * reward, 0)
  const td = rewards[0] + gamma * nextValue
  const prefix = rewards.slice(0, n).reduce((total, reward, index) => total + gamma ** index * reward, 0)
  const bootstrappedValue = n === 1 ? nextValue : nextValue + 0.35 * (n - 1)
  const nStep = prefix + gamma ** n * bootstrappedValue
  return { series: [td, nStep, mc], td, nStep, mc, delta: td - value, value }
}

export function compareControl({ epsilon = 0.12, alpha = 0.3, seed = 20260719 } = {}) {
  const random = lcg(seed)
  const jitter = (random() - 0.5) * 0.03
  const sarsaDanger = Math.max(0.01, epsilon * 0.22 + jitter)
  const qDanger = Math.max(0.02, epsilon * 0.72 - jitter)
  const sarsaReturn = -17 - 44 * sarsaDanger + 2 * alpha
  const qReturn = -13 - 62 * qDanger + 4 * alpha
  return { series: [sarsaReturn, qReturn], sarsaDanger, qDanger, sarsaReturn, qReturn, targetGap: 2.8 + 3.5 * epsilon }
}

export function runFunctionApproximation({ width = 1.2, alpha = 0.24, target = 5 } = {}) {
  const positions = [-2, -1, 0, 1, 2]
  const features = positions.map((position) => Math.exp(-(position ** 2) / (2 * width ** 2)))
  const before = positions.map((position) => 1.2 + 0.25 * position)
  const centerError = target - before[2]
  const after = before.map((value, index) => value + alpha * centerError * features[index])
  return { series: after, before, after, features, centerError, spillover: Math.abs(after[1] - before[1]) }
}

export function runDqnStability({ replay = 0.7, targetPeriod = 8, steps = 42 } = {}) {
  const series = Array.from({ length: steps }, (_, index) => {
    const drift = Math.sin(index * 0.72) * (1 - replay) * 1.8
    const targetJump = (index % targetPeriod) / targetPeriod * 0.38
    return 2.8 * Math.exp(-index / 15) + Math.abs(drift) + targetJump
  })
  const correlation = Math.max(0.04, 1 - replay * 0.88)
  const drift = mean(series.slice(-8))
  return { series, correlation, drift, replaySize: Math.round(800 + replay * 9200), targetPeriod }
}

export function runPolicyGradient({ theta = 0, advantage = 1.4, alpha = 0.18, baseline = 0 } = {}) {
  const probability = 1 / (1 + Math.exp(-theta))
  const weight = advantage - baseline
  const gradient = (1 - probability) * weight
  const nextTheta = theta + alpha * gradient
  const nextProbability = 1 / (1 + Math.exp(-nextTheta))
  return { series: [probability, nextProbability], probability, nextProbability, gradient, weight, nextTheta }
}

export function runActorCritic({ reward = 1, gamma = 0.9, value = 2.2, nextValue = 2.8, actorAlpha = 0.12, criticAlpha = 0.18, ratio = 1 } = {}) {
  const delta = reward + gamma * nextValue - value
  const nextValueEstimate = value + criticAlpha * delta
  const actorStep = actorAlpha * ratio * delta
  return { series: [value, reward + gamma * nextValue, nextValueEstimate], delta, nextValueEstimate, actorStep, ratio }
}

export const learningLabRunners = {
  montecarlo: runMonteCarlo,
  approximation: runStochasticApproximation,
  td: compareTdTargets,
  control: compareControl,
  vfa: runFunctionApproximation,
  dqn: runDqnStability,
  policygradient: runPolicyGradient,
  actorcritic: runActorCritic,
}
