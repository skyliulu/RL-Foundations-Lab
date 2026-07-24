import {
  ACTION_NAMES,
  allStates,
  attemptMove,
  fixedPolicyAction,
  indexOf,
  isGoal,
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
  maxEpisodeSteps = 120,
  gamma = 0.9,
} = {}) {
  const random = lcg(seed)
  const states = allStates()
  const startStates = states.filter((state) => !isGoal(state))
  const q = states.map((state) => ACTION_NAMES.map((action) => (
    action === fixedPolicyAction(state) ? 0.05 : 0
  )))
  const counts = states.map(() => ACTION_NAMES.map(() => 0))
  const returnsSums = states.map(() => ACTION_NAMES.map(() => 0))
  const episodeRecords = []

  let attempts = 0
  let truncatedEpisodes = 0
  while (episodeRecords.length < episodes && attempts < episodes * 30) {
    const episodeIndex = episodeRecords.length
    const enumeratedPair = attempts % (startStates.length * ACTION_NAMES.length)
    let state = variant === 'basic'
      ? startStates[Math.floor(enumeratedPair / ACTION_NAMES.length)]
      : variant === 'exploring'
        ? startStates[Math.floor(random() * startStates.length)]
        : startStates[0]
    let forcedAction = variant === 'basic'
      ? ACTION_NAMES[enumeratedPair % ACTION_NAMES.length]
      : variant === 'exploring'
        ? ACTION_NAMES[Math.floor(random() * ACTION_NAMES.length)]
        : null
    const steps = []
    let terminated = false

    for (let time = 0; time < maxEpisodeSteps; time += 1) {
      const distribution = actionDistribution(state, q, variant, epsilon)
      const action = forcedAction || sampleAction(distribution, random)
      forcedAction = null
      const outcome = attemptMove(state, action)
      const reward = rewardForTransition(outcome.state, outcome.boundary)
      terminated = isGoal(outcome.state)
      steps.push({ time, state, action, reward, nextState: outcome.state, terminated })
      state = outcome.state
      if (terminated) break
    }
    attempts += 1

    if (!terminated) {
      truncatedEpisodes += 1
      continue
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
    episodeRecords.push({ index: episodeIndex, steps, updates, terminated: true, truncated: false })
  }

  if (episodeRecords.length < episodes) {
    throw new Error(`Unable to collect ${episodes} complete Monte Carlo episodes within the attempt budget`)
  }

  const visitedPairs = counts.flatMap((row, stateIndex) => (
    isGoal(states[stateIndex]) ? [] : row
  )).filter((count) => count > 0).length
  const totalPairs = startStates.length * ACTION_NAMES.length
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
    environmentContract: 'episodic-target-terminal',
    terminationState: stateLabel(states.find((state) => isGoal(state))),
    maxEpisodeSteps,
    attemptedEpisodes: attempts,
    truncatedEpisodes,
    q,
    counts,
    coverage: visitedPairs / totalPairs,
    visitedPairs,
    totalPairs,
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

const CLIFF_WIDTH = 7
const CLIFF_HEIGHT = 4
const CLIFF_START = (CLIFF_HEIGHT - 1) * CLIFF_WIDTH
const CLIFF_GOAL = CLIFF_START + CLIFF_WIDTH - 1
const CLIFF_ACTIONS = ['up', 'right', 'down', 'left']

function cliffMove(state, action) {
  const row = Math.floor(state / CLIFF_WIDTH)
  const col = state % CLIFF_WIDTH
  const nextRow = Math.max(0, Math.min(CLIFF_HEIGHT - 1, row + (action === 'down' ? 1 : action === 'up' ? -1 : 0)))
  const nextCol = Math.max(0, Math.min(CLIFF_WIDTH - 1, col + (action === 'right' ? 1 : action === 'left' ? -1 : 0)))
  const candidate = nextRow * CLIFF_WIDTH + nextCol
  const fell = nextRow === CLIFF_HEIGHT - 1 && nextCol > 0 && nextCol < CLIFF_WIDTH - 1
  return {
    state: fell ? CLIFF_START : candidate,
    reward: fell ? -100 : -1,
    fell,
    terminal: candidate === CLIFF_GOAL,
  }
}

function greedyIndex(row) {
  return row.reduce((best, value, index) => value > row[best] ? index : best, 0)
}

function epsilonAction(row, epsilon, random) {
  return random() < epsilon ? Math.floor(random() * CLIFF_ACTIONS.length) : greedyIndex(row)
}

function trainCliffControl(kind, { epsilon, alpha, seed, episodes = 120 }) {
  const random = lcg(seed)
  const q = Array.from({ length: CLIFF_WIDTH * CLIFF_HEIGHT }, () => Array(CLIFF_ACTIONS.length).fill(0))
  const episodeReturns = []
  let falls = 0

  for (let episode = 0; episode < episodes; episode += 1) {
    let state = CLIFF_START
    let actionIndex = epsilonAction(q[state], epsilon, random)
    let total = 0
    for (let step = 0; step < 180; step += 1) {
      const outcome = cliffMove(state, CLIFF_ACTIONS[actionIndex])
      total += outcome.reward
      if (outcome.fell) falls += 1
      const nextActionIndex = epsilonAction(q[outcome.state], epsilon, random)
      const bootstrap = outcome.terminal
        ? 0
        : kind === 'sarsa'
          ? q[outcome.state][nextActionIndex]
          : q[outcome.state][greedyIndex(q[outcome.state])]
      q[state][actionIndex] += alpha * (outcome.reward + 0.9 * bootstrap - q[state][actionIndex])
      state = outcome.state
      actionIndex = nextActionIndex
      if (outcome.terminal) break
    }
    episodeReturns.push(total)
  }

  const path = [CLIFF_START]
  let state = CLIFF_START
  for (let step = 0; step < 40 && state !== CLIFF_GOAL; step += 1) {
    const actionIndex = greedyIndex(q[state])
    const outcome = cliffMove(state, CLIFF_ACTIONS[actionIndex])
    state = outcome.state
    path.push(state)
    if (outcome.fell) break
  }

  return {
    q,
    policy: q.map((row) => CLIFF_ACTIONS[greedyIndex(row)]),
    path,
    falls,
    danger: falls / episodes,
    meanReturn: mean(episodeReturns.slice(-20)),
    episodeReturns,
  }
}

export function compareControl({ epsilon = 0.12, alpha = 0.3, seed = 20260719 } = {}) {
  const sarsa = trainCliffControl('sarsa', { epsilon, alpha, seed })
  const qLearning = trainCliffControl('qlearning', { epsilon, alpha, seed })
  const focusState = (CLIFF_HEIGHT - 2) * CLIFF_WIDTH
  const nextState = focusState + 1
  const qSnapshot = sarsa.q.map((row) => [...row])
  const successorRow = qSnapshot[nextState]
  const qGreedyIndex = greedyIndex(successorRow)
  const rankedActions = successorRow
    .map((value, index) => ({ value, index }))
    .sort((first, second) => second.value - first.value)
  const sarsaNextIndex = epsilon > 0 ? rankedActions[1].index : qGreedyIndex
  const sarsaNextAction = CLIFF_ACTIONS[sarsaNextIndex]
  const qGreedyAction = CLIFF_ACTIONS[qGreedyIndex]
  const sarsaTarget = -1 + 0.9 * successorRow[sarsaNextIndex]
  const qTarget = -1 + 0.9 * successorRow[qGreedyIndex]
  return {
    series: [sarsa.meanReturn, qLearning.meanReturn],
    sarsaDanger: sarsa.danger,
    qDanger: qLearning.danger,
    sarsaReturn: sarsa.meanReturn,
    qReturn: qLearning.meanReturn,
    targetGap: Math.abs(sarsaTarget - qTarget),
    sarsaTarget,
    qTarget,
    qSnapshot,
    successorValues: successorRow.map((value, index) => ({ action: CLIFF_ACTIONS[index], value })),
    transition: { state: focusState, action: 'right', reward: -1, nextState, sarsaNextAction, qGreedyAction },
    sarsa,
    qLearning,
    grid: { width: CLIFF_WIDTH, height: CLIFF_HEIGHT, start: CLIFF_START, goal: CLIFF_GOAL },
  }
}

export function runFunctionApproximation({ width = 1.2, alpha = 0.24, target = 5 } = {}) {
  const positions = [-2, -1, 0, 1, 2]
  const features = positions.map((position) => Math.exp(-(position ** 2) / (2 * width ** 2)))
  const before = positions.map((position) => 1.2 + 0.25 * position)
  const centerError = target - before[2]
  const after = before.map((value, index) => value + alpha * centerError * features[index])
  return { series: after, before, after, features, centerError, spillover: Math.abs(after[1] - before[1]) }
}

export function runDqnStability({ replay = 0.7, targetPeriod = 8, steps = 42, seed = 20260719 } = {}) {
  const random = lcg(seed)
  const stream = [
    { id: 1, feature: 0.25, action: 0, reward: 0, nextFeature: 0.38 },
    { id: 2, feature: 0.38, action: 1, reward: -1, nextFeature: 0.31 },
    { id: 3, feature: 0.52, action: 0, reward: 0, nextFeature: 0.66 },
    { id: 4, feature: 0.66, action: 1, reward: 1, nextFeature: 0.81 },
    { id: 5, feature: 0.81, action: 0, reward: 0, nextFeature: 0.94 },
    { id: 6, feature: 0.94, action: 1, reward: 2, nextFeature: 1 },
  ]
  const buffer = []
  const sampledIds = []
  const sampledFeatures = []
  const series = []
  let online = [0.15, -0.08]
  let target = [...online]
  const predict = (weights, feature, action) => weights[0] * feature + weights[1] * (action ? 1 : -1)

  for (let step = 0; step < steps; step += 1) {
    const observed = stream[step % stream.length]
    buffer.push({ ...observed, time: step })
    if (buffer.length > 24) buffer.shift()
    const sampleIndex = random() < replay ? Math.floor(random() * buffer.length) : buffer.length - 1
    const sample = buffer[sampleIndex]
    sampledIds.push(sample.id)
    sampledFeatures.push(sample.feature)
    const nextBest = Math.max(predict(target, sample.nextFeature, 0), predict(target, sample.nextFeature, 1))
    const y = sample.reward + 0.9 * nextBest
    const prediction = predict(online, sample.feature, sample.action)
    const error = y - prediction
    const actionFeature = sample.action ? 1 : -1
    online = [
      online[0] + 0.08 * error * sample.feature,
      online[1] + 0.08 * error * actionFeature,
    ]
    if ((step + 1) % targetPeriod === 0) target = [...online]
    series.push(Math.abs(error))
  }

  const adjacentFeatureDistance = mean(sampledFeatures.slice(1).map((feature, index) => Math.abs(feature - sampledFeatures[index])))
  const correlation = Math.max(0, 1 - adjacentFeatureDistance / 0.75)
  const drift = Math.abs(predict(online, 0.75, 1) - predict(target, 0.75, 1))
  return {
    series,
    correlation,
    drift,
    replaySize: buffer.length,
    targetPeriod,
    buffer: buffer.slice(-6),
    sampledIds: sampledIds.slice(-6),
    online,
    target,
    stepsUntilSync: targetPeriod - (steps % targetPeriod || targetPeriod),
  }
}

export function runPolicyGradient({ theta = 0, selectedStep = 0, alpha = 0.18, baseline = 0 } = {}) {
  const returns = [2.4, 1.7, 0.6, -0.2]
  const selectedReturn = returns[Math.max(0, Math.min(returns.length - 1, selectedStep))]
  const probability = 1 / (1 + Math.exp(-theta))
  const weight = selectedReturn - baseline
  const gradient = (1 - probability) * weight
  const nextTheta = theta + alpha * gradient
  const nextProbability = 1 / (1 + Math.exp(-nextTheta))
  return { series: [probability, nextProbability], probability, nextProbability, gradient, weight, nextTheta, selectedReturn, returns, selectedStep }
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
