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

function actionDistributionFromRow(row, variant, epsilon) {
  const greedy = argmaxAction(row)
  if (variant !== 'epsilon') {
    return ACTION_NAMES.map((action) => ({ action, probability: action === greedy ? 1 : 0 }))
  }
  return ACTION_NAMES.map((action) => ({
    action,
    probability: epsilon / ACTION_NAMES.length + (action === greedy ? 1 - epsilon : 0),
  }))
}

function buildPolicy(q, variant, epsilon) {
  return q.map((row) => actionDistributionFromRow(row, variant, epsilon))
}

function copyDistribution(distribution) {
  return distribution.map((item) => ({ ...item }))
}

function changedPolicyStateIndices(before, after) {
  return before.flatMap((distribution, stateIndex) => (
    distribution.some((item, actionIndex) => (
      Math.abs(item.probability - after[stateIndex][actionIndex].probability) > 1e-12
    )) ? [stateIndex] : []
  ))
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

function greedyActionFromDistribution(distribution) {
  return distribution.reduce((best, item) => (
    item.probability > best.probability ? item : best
  ), distribution[0]).action
}

function stateLabel(state) {
  return `s${indexOf(state) + 1}`
}

function pairKey(state, action) {
  return `${indexOf(state)}:${action}`
}

export function runMonteCarloCourse({
  variant = 'epsilon',
  episodes = 240,
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
  const emptyTable = () => states.map(() => ACTION_NAMES.map(() => 0))
  const counts = emptyTable()
  const returnsSums = emptyTable()
  let basicRoundCounts = emptyTable()
  let basicRoundSums = emptyTable()
  let policy = buildPolicy(q, variant, epsilon)
  let policyVersion = 0
  const episodeRecords = []

  let attempts = 0
  let truncatedEpisodes = 0
  while (episodeRecords.length < episodes && attempts < episodes * 30) {
    const episodeIndex = episodeRecords.length
    const enumeratedPair = episodeIndex % (startStates.length * ACTION_NAMES.length)
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
    const policyBefore = policy.map(copyDistribution)
    const policyVersionBefore = policyVersion
    let terminated = false

    for (let time = 0; time < maxEpisodeSteps; time += 1) {
      const distribution = policyBefore[indexOf(state)]
      const greedyAction = greedyActionFromDistribution(distribution)
      const isForcedStart = forcedAction !== null
      let action = forcedAction
      let actionSource = isForcedStart ? 'forced-start' : 'greedy'
      if (!isForcedStart && variant === 'epsilon') {
        const explored = random() < epsilon
        action = explored
          ? ACTION_NAMES[Math.floor(random() * ACTION_NAMES.length)]
          : greedyAction
        actionSource = explored ? 'epsilon-explore' : 'greedy'
      } else if (!isForcedStart) {
        action = sampleAction(distribution, random)
      }
      const actionProbability = distribution.find((item) => item.action === action)?.probability ?? 0
      forcedAction = null
      const outcome = attemptMove(state, action)
      const reward = rewardForTransition(outcome.state, outcome.boundary)
      terminated = isGoal(outcome.state)
      steps.push({
        time,
        state,
        action,
        reward,
        nextState: outcome.state,
        terminated,
        greedyAction,
        actionProbability,
        actionSource,
      })
      state = outcome.state
      if (terminated) break
    }
    attempts += 1

    if (!terminated) {
      truncatedEpisodes += 1
      continue
    }

    const startState = steps[0].state
    const qBeforeEpisode = q.map((row) => [...row])
    let returnValue = 0
    for (let time = steps.length - 1; time >= 0; time -= 1) {
      returnValue = steps[time].reward + gamma * returnValue
      steps[time].returnValue = returnValue
    }

    const firstVisit = new Set()
    const occurrenceCounts = new Map()
    const firstOccurrenceTimes = new Map()
    const updates = []
    for (let time = 0; time < steps.length; time += 1) {
      const step = steps[time]
      const key = pairKey(step.state, step.action)
      const occurrence = (occurrenceCounts.get(key) ?? 0) + 1
      occurrenceCounts.set(key, occurrence)
      if (!firstOccurrenceTimes.has(key)) firstOccurrenceTimes.set(key, time)
      step.visitOccurrence = occurrence
      step.firstOccurrenceTime = firstOccurrenceTimes.get(key)
      step.repeatedVisit = occurrence > 1
      const shouldUse = variant === 'basic'
        ? time === 0
        : visit === 'every' || !firstVisit.has(key)
      firstVisit.add(key)
      step.used = shouldUse
      if (!shouldUse) continue
      const stateIndex = indexOf(step.state)
      const actionIndex = ACTION_NAMES.indexOf(step.action)
      const before = q[stateIndex][actionIndex]
      counts[stateIndex][actionIndex] += 1
      if (variant === 'basic') {
        basicRoundCounts[stateIndex][actionIndex] += 1
        basicRoundSums[stateIndex][actionIndex] += step.returnValue
        q[stateIndex][actionIndex] = basicRoundSums[stateIndex][actionIndex] / basicRoundCounts[stateIndex][actionIndex]
      } else {
        returnsSums[stateIndex][actionIndex] += step.returnValue
        q[stateIndex][actionIndex] = returnsSums[stateIndex][actionIndex] / counts[stateIndex][actionIndex]
      }
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

    const completesBasicEvaluation = variant === 'basic' && (episodeIndex + 1) % (startStates.length * ACTION_NAMES.length) === 0
    const policyCommitted = variant === 'basic' ? completesBasicEvaluation : true
    if (policyCommitted) {
      policy = buildPolicy(q, variant, epsilon)
      policyVersion += 1
    }
    const policyAfter = policy.map(copyDistribution)
    const changedStateIndices = changedPolicyStateIndices(policyBefore, policyAfter)
    const inspectionStateIndex = changedStateIndices[0] ?? indexOf(startState)
    const inspectionState = states[inspectionStateIndex]
    episodeRecords.push({
      index: episodeIndex,
      outerIteration: variant === 'basic'
        ? Math.floor(episodeIndex / (startStates.length * ACTION_NAMES.length))
        : episodeIndex,
      evaluationProgress: variant === 'basic'
        ? (episodeIndex % (startStates.length * ACTION_NAMES.length)) + 1
        : 1,
      evaluationTarget: variant === 'basic' ? startStates.length * ACTION_NAMES.length : 1,
      steps,
      updates,
      terminated: true,
      truncated: false,
      policyCommitted,
      policyChanged: changedStateIndices.length > 0,
      policyVersionBefore,
      policyVersionAfter: policyVersion,
      startState,
      startStateLabel: stateLabel(startState),
      startPolicyBefore: copyDistribution(policyBefore[indexOf(startState)]),
      inspectionState,
      inspectionStateLabel: stateLabel(inspectionState),
      focusQBefore: [...qBeforeEpisode[inspectionStateIndex]],
      focusQAfter: [...q[inspectionStateIndex]],
      policyBefore: copyDistribution(policyBefore[inspectionStateIndex]),
      policyAfter: copyDistribution(policyAfter[inspectionStateIndex]),
    })

    if (completesBasicEvaluation) {
      basicRoundCounts = emptyTable()
      basicRoundSums = emptyTable()
    }
  }

  if (episodeRecords.length < episodes) {
    throw new Error(`Unable to collect ${episodes} complete Monte Carlo episodes within the attempt budget`)
  }

  const visitedPairs = counts.flatMap((row, stateIndex) => (
    isGoal(states[stateIndex]) ? [] : row
  )).filter((count) => count > 0).length
  const totalPairs = startStates.length * ACTION_NAMES.length
  const stateCoverage = counts.map((row) => row.reduce((sum, count) => sum + count, 0))
  const stateActionCoverage = counts.map((row) => row.filter((count) => count > 0).length)
  const firstPolicyChangeIndex = Math.max(0, episodeRecords.findIndex((record) => record.policyChanged))
  const sampleIndices = variant === 'basic'
    ? [...new Set([0, Math.min(totalPairs - 1, episodes - 1), Math.min(totalPairs, episodes - 1), episodes - 1])]
    : [...new Set([0, firstPolicyChangeIndex, Math.min(firstPolicyChangeIndex + 1, episodes - 1), Math.floor((episodes - 1) / 2), episodes - 1])]
  const samples = sampleIndices.map((index) => episodeRecords[index])
  episodeRecords.forEach((record, index) => {
    const next = episodeRecords[index + 1]
    record.nextEpisode = next
      ? {
          index: next.index,
          outerIteration: next.outerIteration,
          policyVersion: next.policyVersionBefore,
          startState: next.startStateLabel,
          firstAction: next.steps[0].action,
          policyAtStart: copyDistribution(next.startPolicyBefore),
        }
      : null
  })
  const focusState = samples.at(-1).inspectionState

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
    stateActionCoverage,
    samples,
    focusState: stateLabel(focusState),
    policy: copyDistribution(policy[indexOf(focusState)]),
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

function stochasticPerturbations({ seed, noise, totalSamples }) {
  const random = lcg(seed)
  return Array.from({ length: totalSamples }, () => (random() + random() - 1) * noise * 2)
}

function aggregateStochasticEvidence({
  perturbations,
  batchSize,
  budgetMode,
  updateBudget,
  sampleBudget,
  drifting,
  stationaryTarget,
  driftTarget,
}) {
  const updateCount = budgetMode === 'samples'
    ? Math.max(1, Math.floor(sampleBudget / batchSize))
    : updateBudget
  const usableSamples = updateCount * batchSize
  const sampleDriftAt = Math.floor(usableSamples / 2)
  const updateDriftAt = Math.floor(updateCount / 2)
  const targets = []
  const observations = []
  const xValues = []

  for (let update = 0; update < updateCount; update += 1) {
    let targetTotal = 0
    let observationTotal = 0
    for (let withinBatch = 0; withinBatch < batchSize; withinBatch += 1) {
      const sampleIndex = update * batchSize + withinBatch
      const afterDrift = budgetMode === 'samples'
        ? sampleIndex >= sampleDriftAt
        : update >= updateDriftAt
      const target = drifting && afterDrift ? driftTarget : stationaryTarget
      targetTotal += target
      observationTotal += target + perturbations[sampleIndex]
    }
    targets.push(targetTotal / batchSize)
    observations.push(observationTotal / batchSize)
    xValues.push((update + 1) * batchSize)
  }

  return {
    targets,
    observations,
    xValues,
    updateCount,
    sampleCost: usableSamples,
    driftAt: targets.findIndex((target) => Math.abs(target - stationaryTarget) > 1e-9),
  }
}

function quantile(values, probability) {
  const sorted = [...values].sort((left, right) => left - right)
  const position = (sorted.length - 1) * probability
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  if (lower === upper) return sorted[lower]
  const weight = position - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

function summarizeScheduleBand(runs, schedule) {
  const length = runs[0][schedule].series.length
  const columns = Array.from({ length }, (_, index) => runs.map((run) => run[schedule].series[index]))
  return {
    lower: columns.map((values) => quantile(values, 0.1)),
    mean: columns.map((values) => quantile(values, 0.5)),
    upper: columns.map((values) => quantile(values, 0.9)),
  }
}

export function runStochasticApproximationComparison({
  alpha = 0.18,
  noise = 1.4,
  batchSize = 5,
  drifting = false,
  steps = 36,
  sampleBudget = 180,
  budgetMode = 'samples',
  ensembleSize = 12,
  seed = 20260719,
  stationaryTarget = 3,
  driftTarget = 5,
  initial = -1,
} = {}) {
  const boundedBatchSize = Math.max(1, Math.floor(batchSize))
  const boundedUpdateBudget = Math.max(2, Math.floor(steps))
  const boundedSampleBudget = Math.max(boundedBatchSize, Math.floor(sampleBudget / boundedBatchSize) * boundedBatchSize)
  const normalizedBudgetMode = budgetMode === 'updates' ? 'updates' : 'samples'
  const totalSamples = normalizedBudgetMode === 'samples'
    ? boundedSampleBudget
    : boundedUpdateBudget * boundedBatchSize
  const seeds = Array.from({ length: Math.max(1, Math.floor(ensembleSize)) }, (_, index) => seed + index * 7919)
  const runs = seeds.map((runSeed) => {
    const rawPerturbations = stochasticPerturbations({ seed: runSeed, noise, totalSamples })
    const evidence = aggregateStochasticEvidence({
      perturbations: rawPerturbations,
      batchSize: boundedBatchSize,
      budgetMode: normalizedBudgetMode,
      updateBudget: boundedUpdateBudget,
      sampleBudget: boundedSampleBudget,
      drifting,
      stationaryTarget,
      driftTarget,
    })
    return {
      ...evidence,
      rawPerturbations,
      decaying: runSchedule(evidence.observations, evidence.targets, (index) => 1 / (index + 1), initial),
      constant: runSchedule(evidence.observations, evidence.targets, () => alpha, initial),
    }
  })
  const selectedRun = runs[0]
  return {
    alpha,
    noise,
    batchSize: boundedBatchSize,
    drifting,
    budgetMode: normalizedBudgetMode,
    updateBudget: boundedUpdateBudget,
    sampleBudget: boundedSampleBudget,
    stationaryTarget,
    driftTarget,
    initial,
    seed,
    seeds,
    driftAt: selectedRun.driftAt,
    targets: selectedRun.targets,
    observations: selectedRun.observations,
    xValues: selectedRun.xValues,
    rawPerturbations: selectedRun.rawPerturbations,
    decaying: selectedRun.decaying,
    constant: selectedRun.constant,
    sampleCost: selectedRun.sampleCost,
    updateCount: selectedRun.updateCount,
    ensemble: {
      size: runs.length,
      decaying: summarizeScheduleBand(runs, 'decaying'),
      constant: summarizeScheduleBand(runs, 'constant'),
    },
  }
}

const TD_EPISODES = [
  {
    id: 1,
    stateIds: [25, 24, 23, 18],
    actions: ['left', 'left', 'up'],
  },
  {
    id: 2,
    stateIds: [15, 20, 25, 24, 23, 18],
    actions: ['down', 'down', 'left', 'left', 'up'],
  },
  {
    id: 3,
    stateIds: [5, 10, 15, 20, 25, 24, 23, 18],
    actions: ['down', 'down', 'down', 'down', 'left', 'left', 'up'],
  },
]

function tdState(stateId) {
  const index = stateId - 1
  return { row: Math.floor(index / 5), col: index % 5 }
}

function buildTdEpisode(spec) {
  const states = spec.stateIds.map(tdState)
  const transitions = spec.actions.map((action, index) => {
    const from = states[index]
    const attempted = attemptMove(from, action)
    const expectedNext = states[index + 1]
    if (fixedPolicyAction(from) !== action) {
      throw new Error(`TD episode ${spec.id} departs from the fixed course-grid policy at transition ${index}`)
    }
    if (attempted.state.row !== expectedNext.row || attempted.state.col !== expectedNext.col) {
      throw new Error(`Invalid TD course-grid trajectory in episode ${spec.id} at transition ${index}`)
    }
    return {
      time: index,
      stateId: spec.stateIds[index],
      nextStateId: spec.stateIds[index + 1],
      action,
      reward: rewardForTransition(attempted.state, attempted.boundary),
      terminal: isGoal(attempted.state),
    }
  })
  return {
    id: spec.id,
    startStateId: spec.stateIds[0],
    stateIds: [...spec.stateIds],
    transitions,
    rewards: transitions.map((transition) => transition.reward),
  }
}

function tdComparison(update, n, gamma) {
  const remainingRewards = update.episodeRewards.slice(update.transitionIndex)
  const remainingStates = update.episodeStates.slice(update.transitionIndex)
  const boundedN = Math.max(1, Math.min(remainingRewards.length, n))
  const td = remainingRewards[0] + gamma * (remainingRewards.length === 1 ? 0 : update.valuesBefore[remainingStates[1] - 1])
  const rewardContributions = remainingRewards.slice(0, boundedN).map((reward, index) => ({
    step: index + 1,
    reward,
    discount: gamma ** index,
    contribution: gamma ** index * reward,
  }))
  const prefix = rewardContributions.reduce((total, item) => total + item.contribution, 0)
  const reachesTerminal = boundedN >= remainingRewards.length
  const bootstrapStateId = reachesTerminal ? null : remainingStates[boundedN]
  const bootstrapValue = bootstrapStateId == null ? 0 : update.valuesBefore[bootstrapStateId - 1]
  const bootstrapContribution = bootstrapStateId == null ? 0 : gamma ** boundedN * bootstrapValue
  const mc = remainingRewards.reduce((total, reward, index) => total + gamma ** index * reward, 0)
  return {
    td,
    nStep: prefix + bootstrapContribution,
    mc,
    horizon: boundedN,
    remaining: remainingRewards.length,
    rewardContributions,
    bootstrap: {
      stateId: bootstrapStateId,
      value: bootstrapValue,
      contribution: bootstrapContribution,
      terminal: reachesTerminal,
    },
  }
}

export function compareTdTargets({ gamma = 0.9, n = 2, alpha = 0.4 } = {}) {
  const boundedGamma = Math.max(0, Math.min(0.99, gamma))
  const boundedAlpha = Math.max(0.05, Math.min(1, alpha))
  const trajectories = TD_EPISODES.map(buildTdEpisode)
  const values = Array.from({ length: 25 }, () => 0)
  const updates = []

  trajectories.forEach((trajectory, episodeIndex) => {
    trajectory.transitions.forEach((transition, transitionIndex) => {
      const valuesBefore = [...values]
      const before = valuesBefore[transition.stateId - 1]
      const successorBefore = transition.terminal ? 0 : valuesBefore[transition.nextStateId - 1]
      const target = transition.reward + boundedGamma * successorBefore
      const delta = target - before
      const correction = boundedAlpha * delta
      const after = before + correction
      values[transition.stateId - 1] = after
      const update = {
        episode: episodeIndex + 1,
        transitionIndex,
        episodeLength: trajectory.transitions.length,
        episodeStartStateId: trajectory.startStateId,
        stateId: transition.stateId,
        nextStateId: transition.nextStateId,
        action: transition.action,
        reward: transition.reward,
        terminal: transition.terminal,
        before,
        successorBefore,
        target,
        delta,
        correction,
        after,
        valuesBefore,
        valuesAfter: [...values],
        episodeRewards: trajectory.rewards,
        episodeStates: trajectory.stateIds,
      }
      update.comparison = tdComparison(update, n, boundedGamma)
      updates.push(update)
    })
  })

  const frames = [{
    phase: 'ready',
    updateIndex: 0,
    values: Array.from({ length: 25 }, () => 0),
  }]
  updates.forEach((update, updateIndex) => {
    frames.push({ phase: 'target', updateIndex, values: update.valuesBefore })
    frames.push({ phase: 'commit', updateIndex, values: update.valuesAfter })
  })

  return {
    series: updates.map((update) => update.after),
    gamma: boundedGamma,
    alpha: boundedAlpha,
    n: Math.max(1, Math.min(Math.max(...trajectories.map((trajectory) => trajectory.transitions.length)), n)),
    environment: {
      name: 'course-grid-5x5',
      size: 5,
      states: allStates().map((state) => ({
        ...state,
        stateId: indexOf(state) + 1,
        forbidden: rewardForTransition(state, false) === -1,
        goal: isGoal(state),
      })),
    },
    trajectory: trajectories[0].transitions,
    pathStateIds: trajectories[0].stateIds,
    trajectories,
    updates,
    frames,
    finalValues: [...values],
    td: updates[0].comparison.td,
    nStep: updates[0].comparison.nStep,
    mc: updates[0].comparison.mc,
  }
}

const COURSE_CONTROL_SIZE = 5
const COURSE_CONTROL_STATES = allStates()
const COURSE_CONTROL_START = 24
const COURSE_CONTROL_GOAL = COURSE_CONTROL_STATES.findIndex((state) => isGoal(state))
const CONTROL_ACTIONS = [...ACTION_NAMES]

function courseControlMove(stateIndex, action) {
  const outcome = attemptMove(COURSE_CONTROL_STATES[stateIndex], action)
  const nextState = indexOf(outcome.state)
  return {
    state: nextState,
    reward: rewardForTransition(outcome.state, outcome.boundary),
    forbidden: rewardForTransition(outcome.state, outcome.boundary) === -1 && !outcome.boundary,
    boundary: outcome.boundary,
    terminal: isGoal(outcome.state),
  }
}

function greedyIndex(row) {
  return row.reduce((best, value, index) => value > row[best] ? index : best, 0)
}

function copyQTable(q) {
  return q.map((row) => [...row])
}

function epsilonActionSample(row, epsilon, random) {
  const greedyActionIndex = greedyIndex(row)
  const explorationDraw = random()
  if (explorationDraw < epsilon) {
    const actionDraw = random()
    return {
      index: Math.floor(actionDraw * CONTROL_ACTIONS.length),
      explored: true,
      explorationDraw,
      actionDraw,
      greedyIndex: greedyActionIndex,
    }
  }
  return {
    index: greedyActionIndex,
    explored: false,
    explorationDraw,
    actionDraw: null,
    greedyIndex: greedyActionIndex,
  }
}

function epsilonAction(row, epsilon, random) {
  return epsilonActionSample(row, epsilon, random).index
}

function trainCourseControl(kind, { epsilon, alpha, seed, episodes = 140 }) {
  const random = lcg(seed)
  const q = Array.from({ length: COURSE_CONTROL_SIZE ** 2 }, () => Array(CONTROL_ACTIONS.length).fill(0))
  const episodeReturns = []
  const episodeForbiddenVisits = []
  let forbiddenVisits = 0

  for (let episode = 0; episode < episodes; episode += 1) {
    let state = COURSE_CONTROL_START
    let actionIndex = epsilonAction(q[state], epsilon, random)
    let total = 0
    let forbiddenThisEpisode = 0
    for (let step = 0; step < 180; step += 1) {
      const outcome = courseControlMove(state, CONTROL_ACTIONS[actionIndex])
      total += outcome.reward
      if (outcome.forbidden) {
        forbiddenVisits += 1
        forbiddenThisEpisode += 1
      }
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
    episodeForbiddenVisits.push(forbiddenThisEpisode)
  }

  const path = [COURSE_CONTROL_START]
  const visited = new Set(path)
  let state = COURSE_CONTROL_START
  for (let step = 0; step < 40 && state !== COURSE_CONTROL_GOAL; step += 1) {
    const actionIndex = greedyIndex(q[state])
    const outcome = courseControlMove(state, CONTROL_ACTIONS[actionIndex])
    state = outcome.state
    path.push(state)
    if (outcome.terminal || visited.has(state)) break
    visited.add(state)
  }

  return {
    q,
    policy: q.map((row) => CONTROL_ACTIONS[greedyIndex(row)]),
    path,
    forbiddenVisits,
    forbiddenRate: episodeForbiddenVisits.filter((count) => count > 0).length / episodes,
    averageForbiddenVisits: forbiddenVisits / episodes,
    meanReturn: mean(episodeReturns.slice(-20)),
    episodeReturns,
    episodeForbiddenVisits,
  }
}

function buildControlTrace(kind, { epsilon, alpha, seed, warmupEpisodes = 60, updateCount = 48 }) {
  const random = lcg(seed)
  const q = Array.from({ length: COURSE_CONTROL_SIZE ** 2 }, () => Array(CONTROL_ACTIONS.length).fill(0))
  const frames = []
  let episodeNumber = 0

  const runEpisode = (capture) => {
    episodeNumber += 1
    let state = COURSE_CONTROL_START
    let actionSample = epsilonActionSample(q[state], epsilon, random)
    let path = [COURSE_CONTROL_START]
    let episodeReturn = 0

    for (let episodeStep = 0; episodeStep < 180; episodeStep += 1) {
      const actionIndex = actionSample.index
      const outcome = courseControlMove(state, CONTROL_ACTIONS[actionIndex])
      const nextActionSample = outcome.terminal
        ? null
        : epsilonActionSample(q[outcome.state], epsilon, random)
      const targetActionIndex = outcome.terminal
        ? null
        : kind === 'sarsa'
          ? nextActionSample.index
          : greedyIndex(q[outcome.state])
      const successorRow = outcome.terminal
        ? Array(CONTROL_ACTIONS.length).fill(0)
        : [...q[outcome.state]]
      const bootstrap = targetActionIndex == null ? 0 : successorRow[targetActionIndex]
      const before = q[state][actionIndex]
      const target = outcome.reward + 0.9 * bootstrap
      const delta = target - before
      q[state][actionIndex] += alpha * delta
      episodeReturn += outcome.reward

      const visiblePath = [...path, outcome.state]
      if (capture && frames.length < updateCount) {
        frames.push({
          index: frames.length,
          kind,
          episode: episodeNumber,
          episodeStep: episodeStep + 1,
          state,
          actionIndex,
          action: CONTROL_ACTIONS[actionIndex],
          actionExplored: actionSample.explored,
          reward: outcome.reward,
          nextState: outcome.state,
          forbidden: outcome.forbidden,
          boundary: outcome.boundary,
          terminal: outcome.terminal,
          behaviorNextIndex: nextActionSample?.index ?? null,
          behaviorNextAction: nextActionSample ? CONTROL_ACTIONS[nextActionSample.index] : null,
          behaviorNextExplored: Boolean(nextActionSample?.explored),
          targetActionIndex,
          targetAction: targetActionIndex == null ? null : CONTROL_ACTIONS[targetActionIndex],
          successorRow,
          before,
          bootstrap,
          target,
          delta,
          after: q[state][actionIndex],
          q: copyQTable(q),
          policy: q.map((row) => CONTROL_ACTIONS[greedyIndex(row)]),
          path: visiblePath,
          episodeReturn,
        })
      }

      if (outcome.terminal || frames.length >= updateCount && capture) break
      path = visiblePath
      state = outcome.state
      actionSample = nextActionSample
    }
  }

  for (let episode = 0; episode < warmupEpisodes; episode += 1) runEpisode(false)
  const initialQ = copyQTable(q)
  while (frames.length < updateCount) runEpisode(true)

  return {
    kind,
    warmupEpisodes,
    initialQ,
    initialPolicy: initialQ.map((row) => CONTROL_ACTIONS[greedyIndex(row)]),
    frames,
  }
}

export function compareControl({ epsilon = 0.12, alpha = 0.3, seed = 20260719 } = {}) {
  const seeds = Array.from({ length: 5 }, (_, index) => seed + index * 7919)
  const sarsaRuns = seeds.map((runSeed) => trainCourseControl('sarsa', { epsilon, alpha, seed: runSeed }))
  const qLearningRuns = seeds.map((runSeed) => trainCourseControl('qlearning', { epsilon, alpha, seed: runSeed }))
  const sarsa = sarsaRuns[0]
  const qLearning = qLearningRuns[0]
  const traces = {
    sarsa: buildControlTrace('sarsa', { epsilon, alpha, seed: seed ^ 0x51ed270b }),
    qLearning: buildControlTrace('qlearning', { epsilon, alpha, seed: seed ^ 0x51ed270b }),
  }

  return {
    series: [sarsa.meanReturn, qLearning.meanReturn],
    sarsaForbiddenRate: mean(sarsaRuns.map((run) => run.forbiddenRate)),
    qForbiddenRate: mean(qLearningRuns.map((run) => run.forbiddenRate)),
    sarsaAverageForbiddenVisits: mean(sarsaRuns.map((run) => run.averageForbiddenVisits)),
    qAverageForbiddenVisits: mean(qLearningRuns.map((run) => run.averageForbiddenVisits)),
    sarsaReturn: mean(sarsaRuns.map((run) => run.meanReturn)),
    qReturn: mean(qLearningRuns.map((run) => run.meanReturn)),
    traces,
    seeds,
    sarsa,
    qLearning,
    grid: {
      width: COURSE_CONTROL_SIZE,
      height: COURSE_CONTROL_SIZE,
      start: COURSE_CONTROL_START,
      goal: COURSE_CONTROL_GOAL,
      states: COURSE_CONTROL_STATES.map((state, index) => ({
        index,
        stateId: index + 1,
        forbidden: rewardForTransition(state, false) === -1,
        goal: isGoal(state),
      })),
    },
  }
}

const VFA_ANCHOR_STATE_IDS = [11, 12, 13, 14, 15, 18]
const VFA_ROW_STATE_IDS = [11, 12, 13, 14, 15]

const VFA_SCENARIOS = {
  interfere: {
    probeStateId: 18,
    referenceValues: { 11: 1.6, 12: 2.1, 13: -1.5, 14: 2.4, 15: 2.0, 18: 4.0 },
    samples: [
      { stateId: 18, target: 4.0, role: 'goal' },
      { stateId: 13, target: -1.5, role: 'forbidden' },
      { stateId: 18, target: 4.0, role: 'goal' },
      { stateId: 13, target: -1.5, role: 'forbidden' },
      { stateId: 14, target: 2.4, role: 'safe' },
      { stateId: 13, target: -1.5, role: 'forbidden' },
      { stateId: 18, target: 4.0, role: 'goal' },
      { stateId: 13, target: -1.5, role: 'forbidden' },
    ],
  },
  generalize: {
    probeStateId: 15,
    referenceValues: { 11: 1.8, 12: 2.2, 13: 2.5, 14: 2.7, 15: 2.4, 18: 3.4 },
    samples: [
      { stateId: 14, target: 2.7, role: 'safe' },
      { stateId: 12, target: 2.2, role: 'safe' },
      { stateId: 14, target: 2.7, role: 'safe' },
      { stateId: 11, target: 1.8, role: 'safe' },
      { stateId: 14, target: 2.7, role: 'safe' },
      { stateId: 12, target: 2.2, role: 'safe' },
      { stateId: 18, target: 3.4, role: 'goal' },
      { stateId: 14, target: 2.7, role: 'safe' },
    ],
  },
}

function vfaStateCoords(stateId) {
  const index = stateId - 1
  return { row: Math.floor(index / 5), col: index % 5 }
}

function vfaFeatureVector(stateId, width) {
  const point = vfaStateCoords(stateId)
  const raw = VFA_ANCHOR_STATE_IDS.map((anchorId) => {
    const anchor = vfaStateCoords(anchorId)
    const distSq = (point.row - anchor.row) ** 2 + (point.col - anchor.col) ** 2
    return Math.exp(-distSq / (2 * width ** 2))
  })
  const norm = Math.sqrt(raw.reduce((sum, value) => sum + value * value, 0)) || 1
  return raw.map((value) => value / norm)
}

function dot(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0)
}

export function runFunctionApproximation({ width = 1.2, alpha = 0.35, target = 5, scenario = 'interfere' } = {}) {
  const boundedWidth = Math.max(0.35, Math.min(2.5, width))
  const boundedAlpha = Math.max(0.05, Math.min(0.8, alpha))
  const scenarioKey = VFA_SCENARIOS[scenario] ? scenario : 'interfere'
  const spec = VFA_SCENARIOS[scenarioKey]
  const gridStates = allStates().map((state, index) => ({
    ...state,
    index,
    stateId: index + 1,
    forbidden: rewardForTransition(state, false) === -1,
    goal: isGoal(state),
  }))

  const featureMatrix = gridStates.map((state) => vfaFeatureVector(state.stateId, boundedWidth))
  const evalAll = (weights) => featureMatrix.map((phi) => dot(phi, weights))
  const evalReferenceMse = (values) => {
    const entries = Object.entries(spec.referenceValues)
    const squared = entries.reduce((sum, [stateId, truth]) => {
      const diff = values[Number(stateId) - 1] - truth
      return sum + diff * diff
    }, 0)
    return squared / entries.length
  }

  let weights = Array(VFA_ANCHOR_STATE_IDS.length).fill(0)
  const tabular = Array(25).fill(0)
  const frames = []
  let interferenceEvents = 0

  spec.samples.forEach((sample, stepIndex) => {
    const stateIndex = sample.stateId - 1
    const phiSample = featureMatrix[stateIndex]
    const weightsBefore = [...weights]
    const valuesBefore = evalAll(weightsBefore)
    const tabularBefore = [...tabular]
    const predictionBefore = valuesBefore[stateIndex]
    const error = sample.target - predictionBefore
    const deltaWeights = phiSample.map((value) => boundedAlpha * error * value)
    weights = weightsBefore.map((value, index) => value + deltaWeights[index])
    const valuesAfter = evalAll(weights)
    const deltas = valuesAfter.map((value, index) => value - valuesBefore[index])
    const innerProducts = featureMatrix.map((phi) => dot(phi, phiSample))

    const tabularPrediction = tabularBefore[stateIndex]
    const tabularError = sample.target - tabularPrediction
    tabular[stateIndex] = tabularPrediction + boundedAlpha * tabularError
    const tabularAfter = [...tabular]

    const probeIndex = spec.probeStateId - 1
    const probeTruth = spec.referenceValues[spec.probeStateId]
    const probeBeforeError = Math.abs(valuesBefore[probeIndex] - probeTruth)
    const probeAfterError = Math.abs(valuesAfter[probeIndex] - probeTruth)
    const causedInterference = sample.stateId !== spec.probeStateId && probeAfterError > probeBeforeError + 0.02
    if (causedInterference) interferenceEvents += 1

    frames.push({
      index: stepIndex,
      stateId: sample.stateId,
      role: sample.role,
      target: sample.target,
      phiSample,
      weightsBefore,
      deltaWeights,
      weightsAfter: [...weights],
      predictionBefore,
      predictionAfter: valuesAfter[stateIndex],
      error,
      valuesBefore,
      valuesAfter,
      deltas,
      innerProducts,
      rowBefore: VFA_ROW_STATE_IDS.map((id) => valuesBefore[id - 1]),
      rowAfter: VFA_ROW_STATE_IDS.map((id) => valuesAfter[id - 1]),
      rowInnerProducts: VFA_ROW_STATE_IDS.map((id) => innerProducts[id - 1]),
      tabularBefore,
      tabularAfter,
      linearMse: evalReferenceMse(valuesAfter),
      tabularMse: evalReferenceMse(tabularAfter),
      probeStateId: spec.probeStateId,
      probeTruth,
      probeLinearBefore: valuesBefore[probeIndex],
      probeLinearAfter: valuesAfter[probeIndex],
      probeDelta: deltas[probeIndex],
      probeTabularAfter: tabularAfter[probeIndex],
      causedInterference,
    })
  })

  // Deterministic center-state inner-product summary along Row 3 (s_11..s_15)
  const centerPhi = featureMatrix[12]
  const rowFeatures = VFA_ROW_STATE_IDS.map((id) => dot(featureMatrix[id - 1], centerPhi))
  const lastFrame = frames.at(-1)
  const rowBefore = lastFrame.rowBefore
  const rowAfter = lastFrame.rowAfter
  const centerError = target - rowBefore[2]
  const neighborInnerProduct = dot(featureMatrix[11], centerPhi)
  const spillover = Math.abs(boundedAlpha * centerError * neighborInnerProduct)
  const conflictInnerProduct = dot(featureMatrix[12], featureMatrix[17])

  return {
    scenario: scenarioKey,
    width: boundedWidth,
    alpha: boundedAlpha,
    anchors: [...VFA_ANCHOR_STATE_IDS],
    rowStateIds: [...VFA_ROW_STATE_IDS],
    grid: {
      size: 5,
      states: gridStates,
    },
    frames,
    finalWeights: [...weights],
    finalValues: lastFrame.valuesAfter,
    finalTabularValues: lastFrame.tabularAfter,
    linearMse: lastFrame.linearMse,
    tabularMse: lastFrame.tabularMse,
    interferenceEvents,
    conflictInnerProduct,
    neighborInnerProduct,
    series: rowAfter,
    before: rowBefore,
    after: rowAfter,
    features: rowFeatures,
    centerError,
    spillover,
  }
}

const DQN_GRID_STREAM = [
  { id: 1, stateId: 25, actionName: 'left', nextStateId: 24, feature: 0.25, action: 0, reward: 0, nextFeature: 0.38 },
  { id: 2, stateId: 24, actionName: 'up', nextStateId: 19, feature: 0.38, action: 1, reward: -1, nextFeature: 0.31 },
  { id: 3, stateId: 24, actionName: 'left', nextStateId: 23, feature: 0.52, action: 0, reward: 0, nextFeature: 0.66 },
  { id: 4, stateId: 23, actionName: 'up', nextStateId: 18, feature: 0.66, action: 1, reward: 1, nextFeature: 0.81 },
  { id: 5, stateId: 15, actionName: 'down', nextStateId: 20, feature: 0.81, action: 0, reward: 0, nextFeature: 0.94 },
  { id: 6, stateId: 14, actionName: 'down', nextStateId: 19, feature: 0.94, action: 1, reward: 2, nextFeature: 1 },
]

function simulateDqnTrajectory({ replay = 0.7, targetPeriod = 8, steps = 40, seed = 20260719 } = {}) {
  const boundedPeriod = Math.max(1, Math.round(targetPeriod))
  const random = lcg(seed)
  const buffer = []
  const sampledKeys = []
  const sampledFeatures = []
  const series = []
  const frames = []
  const reuseCounts = new Map()
  let online = [0.15, -0.08]
  let target = [...online]
  let syncCount = 0
  let lastUpdate = null
  const predict = (weights, feature, action) => weights[0] * feature + weights[1] * (action ? 1 : -1)

  for (let step = 0; step < steps; step += 1) {
    const observed = DQN_GRID_STREAM[step % DQN_GRID_STREAM.length]
    const stored = { ...observed, time: step, key: `${step}:${observed.id}` }
    buffer.push(stored)
    if (buffer.length > 24) buffer.shift()
    const sampleIndex = random() < replay ? Math.floor(random() * buffer.length) : buffer.length - 1
    const sample = buffer[sampleIndex]
    sampledKeys.push(sample.key)
    sampledFeatures.push(sample.feature)
    reuseCounts.set(sample.key, (reuseCounts.get(sample.key) || 0) + 1)

    const onlineBefore = [...online]
    const targetBefore = [...target]
    const nextActionValues = [predict(targetBefore, sample.nextFeature, 0), predict(targetBefore, sample.nextFeature, 1)]
    const nextBest = Math.max(...nextActionValues)
    const y = sample.reward + 0.9 * nextBest
    const prediction = predict(onlineBefore, sample.feature, sample.action)
    const error = y - prediction
    const actionFeature = sample.action ? 1 : -1
    const updateVector = [0.08 * error * sample.feature, 0.08 * error * actionFeature]
    online = [
      onlineBefore[0] + updateVector[0],
      onlineBefore[1] + updateVector[1],
    ]
    const synced = (step + 1) % boundedPeriod === 0
    if (synced) {
      target = [...online]
      syncCount += 1
    }

    const probeOnlineQ = predict(online, 0.75, 1)
    const probeTargetQ = predict(target, 0.75, 1)
    const probeTargetBeforeQ = predict(targetBefore, 0.75, 1)
    const updatesSinceSync = (step + 1) % boundedPeriod
    const stepsUntilSync = boundedPeriod - (updatesSinceSync || boundedPeriod)
    const frame = {
      number: step + 1,
      sample,
      sampleIndex,
      sampleReuseCount: reuseCounts.get(sample.key),
      onlineBefore,
      targetBefore,
      nextActionValues,
      nextBest,
      targetValue: y,
      prediction,
      error,
      updateVector,
      onlineAfter: [...online],
      targetAfter: [...target],
      probeOnlineQ,
      probeTargetQ,
      probeTargetBeforeQ,
      instantDrift: Math.abs(probeOnlineQ - probeTargetQ),
      synced,
      updatesSinceSync,
      stepsUntilSync,
      bufferWindow: buffer.slice(-8).map((item) => ({
        ...item,
        reuseCount: reuseCounts.get(item.key) || 0,
      })),
      recentSampledKeys: sampledKeys.slice(-6),
    }
    frames.push(frame)
    lastUpdate = frame
    series.push(Math.abs(error))
  }

  const adjacentFeatureDistance = sampledFeatures.length > 1
    ? mean(sampledFeatures.slice(1).map((feature, index) => Math.abs(feature - sampledFeatures[index])))
    : 0
  const correlation = Math.max(0, 1 - adjacentFeatureDistance / 0.75)
  const drift = Math.abs(predict(online, 0.75, 1) - predict(target, 0.75, 1))
  const totalReused = [...reuseCounts.values()].filter((count) => count > 1).length

  return {
    series,
    frames,
    correlation,
    drift,
    syncCount,
    targetMoveRate: steps > 0 ? syncCount / steps : 0,
    reusedTransitionCount: totalReused,
    replaySize: buffer.length,
    targetPeriod: boundedPeriod,
    buffer: buffer.slice(-6),
    sampledKeys: sampledKeys.slice(-6),
    online,
    target,
    lastUpdate,
    updatesSinceSync: steps % boundedPeriod,
    stepsUntilSync: boundedPeriod - (steps % boundedPeriod || boundedPeriod),
  }
}

export function runDqnStability({ replay = 0.7, targetPeriod = 8, steps = 42, seed = 20260719 } = {}) {
  const main = simulateDqnTrajectory({ replay, targetPeriod, steps, seed })
  const naive = simulateDqnTrajectory({ replay: 0, targetPeriod: 1, steps, seed })
  return {
    ...main,
    naiveSeries: naive.frames.map((frame) => frame.probeOnlineQ),
    naiveCorrelation: naive.correlation,
    naiveTargetMoveRate: naive.targetMoveRate,
  }
}

export function runPolicyGradient({ theta = 0, selectedStep = 0, alpha = 0.18, baseline = 0, advantage } = {}) {
  const returns = [2.4, 1.7, 0.6, -0.2]
  const boundedStep = Math.max(0, Math.min(returns.length - 1, selectedStep))
  const selectedReturn = returns[boundedStep]
  const actionIndices = [0, 1, 2, 0]
  const stateIds = [1, 2, 7, 8]
  const actionIndex = actionIndices[boundedStep]
  const stateLogits = [
    [0.35, -0.1, -0.6],
    [-0.25, 0.45, -0.35],
    [-0.4, 0.05, 0.5],
    [0.2, -0.45, -0.2],
  ]
  stateLogits[boundedStep] = [...stateLogits[boundedStep]]
  stateLogits[boundedStep][actionIndex] = theta
  const normalize = (values) => {
    const maximum = Math.max(...values)
    const exponentials = values.map((value) => Math.exp(value - maximum))
    const total = exponentials.reduce((sum, value) => sum + value, 0)
    return exponentials.map((value) => value / total)
  }
  const stepContributions = stateLogits.map((stepLogits, stepIndex) => {
    const stepProbabilities = normalize(stepLogits)
    const sampledAction = actionIndices[stepIndex]
    const stepWeight = returns[stepIndex] - baseline
    const scoreVector = stepProbabilities.map((probabilityValue, index) => (index === sampledAction ? 1 : 0) - probabilityValue)
    const contributionVector = scoreVector.map((score) => score * stepWeight)
    return {
      step: stepIndex,
      stateId: stateIds[stepIndex],
      actionIndex: sampledAction,
      return: returns[stepIndex],
      baseline,
      advantage: stepWeight,
      logits: stepLogits,
      probabilities: stepProbabilities,
      scoreVector,
      contributionVector,
      contributionNorm: Math.sqrt(contributionVector.reduce((sum, value) => sum + value ** 2, 0)),
    }
  })
  const selectedContribution = stepContributions[boundedStep]
  const logits = selectedContribution.logits
  const probabilities = normalize(logits)
  const weight = Number.isFinite(advantage) ? advantage : selectedReturn - baseline
  const gradientVector = probabilities.map((probabilityValue, index) => weight * ((index === actionIndex ? 1 : 0) - probabilityValue))
  const nextLogits = logits.map((value, index) => value + alpha * gradientVector[index])
  const nextProbabilities = normalize(nextLogits)
  const probability = probabilities[actionIndex]
  const nextProbability = nextProbabilities[actionIndex]
  const gradient = gradientVector[actionIndex]
  const rolloutReturns = [selectedReturn, selectedReturn + 1.1, selectedReturn - 0.9, selectedReturn + 0.45, selectedReturn - 1.25, selectedReturn + 0.8]
  const rolloutActions = [actionIndex, (actionIndex + 1) % 3, actionIndex, (actionIndex + 2) % 3, actionIndex, (actionIndex + 1) % 3]
  const monitoredProbability = probabilities[actionIndex]
  const rollouts = rolloutReturns.map((rolloutReturn, index) => {
    const sampledAction = rolloutActions[index]
    const score = (sampledAction === actionIndex ? 1 : 0) - monitoredProbability
    return {
      id: index + 1,
      actionIndex: sampledAction,
      return: rolloutReturn,
      score,
      rawContribution: score * rolloutReturn,
      centeredContribution: score * (rolloutReturn - baseline),
    }
  })
  const variance = (values) => {
    const average = mean(values)
    return mean(values.map((value) => (value - average) ** 2))
  }

  // 12-episode REINFORCE policy-evolution counterfactual on one fixed stream (with vs without baseline)
  // All returns are positive (1.0..2.6) with mean ~1.48, so b=0 mistakenly reinforces suboptimal positive draws
  // while b≈1.4 suppresses suboptimal actions and lowers gradient step jitter.
  const episodeStream = [
    { actionIndex: 0, returnValue: 1.2 },
    { actionIndex: 2, returnValue: 1.0 },
    { actionIndex: 1, returnValue: 2.4 },
    { actionIndex: 0, returnValue: 1.3 },
    { actionIndex: 2, returnValue: 1.1 },
    { actionIndex: 1, returnValue: 2.5 },
    { actionIndex: 0, returnValue: 1.2 },
    { actionIndex: 2, returnValue: 1.0 },
    { actionIndex: 1, returnValue: 2.3 },
    { actionIndex: 0, returnValue: 1.1 },
    { actionIndex: 2, returnValue: 1.0 },
    { actionIndex: 1, returnValue: 2.6 },
  ]
  const stepLogitsInit = [0.25, 0.0, -0.25]
  let logitsWith = [...stepLogitsInit]
  let logitsRaw = [...stepLogitsInit]
  const evolutionFrames = episodeStream.map((ep, index) => {
    const probsWithBefore = normalize(logitsWith)
    const probsRawBefore = normalize(logitsRaw)
    const weightWith = ep.returnValue - baseline
    const weightRaw = ep.returnValue
    const gradWith = probsWithBefore.map((p, a) => weightWith * ((a === ep.actionIndex ? 1 : 0) - p))
    const gradRaw = probsRawBefore.map((p, a) => weightRaw * ((a === ep.actionIndex ? 1 : 0) - p))
    logitsWith = logitsWith.map((v, a) => v + alpha * gradWith[a])
    logitsRaw = logitsRaw.map((v, a) => v + alpha * gradRaw[a])
    const probsWithAfter = normalize(logitsWith)
    const probsRawAfter = normalize(logitsRaw)
    return {
      episode: index + 1,
      actionIndex: ep.actionIndex,
      returnValue: ep.returnValue,
      withBaseline: {
        weight: weightWith,
        probsBefore: probsWithBefore,
        probsAfter: probsWithAfter,
        optimalProb: probsWithAfter[1],
        stepMagnitude: Math.sqrt(gradWith.reduce((sum, v) => sum + v * v, 0)),
      },
      withoutBaseline: {
        weight: weightRaw,
        probsBefore: probsRawBefore,
        probsAfter: probsRawAfter,
        optimalProb: probsRawAfter[1],
        stepMagnitude: Math.sqrt(gradRaw.reduce((sum, v) => sum + v * v, 0)),
      },
    }
  })

  return {
    series: [probability, nextProbability],
    probability,
    nextProbability,
    probabilities,
    nextProbabilities,
    logits,
    nextLogits,
    gradient,
    gradientVector,
    weight,
    nextTheta: nextLogits[actionIndex],
    selectedReturn,
    returns,
    selectedStep: boundedStep,
    actionIndex,
    actionIndices,
    stateIds,
    statePolicies: stateLogits.map((stepLogits, index) => ({
      stateId: stateIds[index],
      logits: stepLogits,
      probabilities: normalize(stepLogits),
    })),
    stepContributions,
    rollouts,
    evolutionFrames,
    varianceWithoutBaseline: variance(rollouts.map((rollout) => rollout.rawContribution)),
    varianceWithBaseline: variance(rollouts.map((rollout) => rollout.centeredContribution)),
  }
}

export function runActorCritic({ reward = 1, gamma = 0.9, value = 2.2, nextValue = 2.8, actorAlpha = 0.12, criticAlpha = 0.18, ratio = 1 } = {}) {
  const normalize = (values) => {
    const maximum = Math.max(...values)
    const exponentials = values.map((item) => Math.exp(item - maximum))
    const total = exponentials.reduce((sum, item) => sum + item, 0)
    return exponentials.map((item) => item / total)
  }
  const delta = reward + gamma * nextValue - value
  const target = reward + gamma * nextValue
  const criticCorrection = criticAlpha * delta
  const nextValueEstimate = value + criticAlpha * delta
  const logitsBefore = [0.2, 0.55, -0.35]
  const actionIndex = 1
  const probabilitiesBefore = normalize(logitsBefore)
  const scoreVector = probabilitiesBefore.map((probabilityValue, index) => (index === actionIndex ? 1 : 0) - probabilityValue)
  const actorUpdateVector = scoreVector.map((score) => actorAlpha * ratio * delta * score)
  const logitsAfter = logitsBefore.map((logit, index) => logit + actorUpdateVector[index])
  const probabilitiesAfter = normalize(logitsAfter)
  const actorStep = actorAlpha * ratio * delta

  // 16-step coupled Actor-Critic loop (Step 0 matches the single-transition microscope exactly)
  const actionTargets = [
    reward * 0.35 + gamma * (nextValue * 0.72),
    target,
    reward * 0.1 + gamma * (nextValue * 0.55),
  ]
  const loopActions = [1, 0, 1, 2, 1, 0, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1]
  let vCur = value
  let hCur = [...logitsBefore]
  const loopFrames = loopActions.map((act, index) => {
    const stepTarget = actionTargets[act]
    const stepDelta = stepTarget - vCur
    const vBefore = vCur
    const vCorr = criticAlpha * stepDelta
    vCur = vBefore + vCorr
    const pBefore = normalize(hCur)
    const score = pBefore.map((p, a) => (a === act ? 1 : 0) - p)
    const hBefore = [...hCur]
    const hDelta = score.map((s) => actorAlpha * ratio * stepDelta * s)
    hCur = hBefore.map((h, a) => h + hDelta[a])
    const pAfter = normalize(hCur)
    const trueStateValue = pBefore.reduce((sum, p, a) => sum + p * actionTargets[a], 0)
    return {
      step: index + 1,
      actionIndex: act,
      target: stepTarget,
      trueStateValue,
      delta: stepDelta,
      critic: {
        valueBefore: vBefore,
        target: stepTarget,
        delta: stepDelta,
        correction: vCorr,
        valueAfter: vCur,
      },
      actor: {
        actionIndex: act,
        logitsBefore: hBefore,
        probabilitiesBefore: pBefore,
        scoreVector: score,
        updateVector: hDelta,
        logitsAfter: [...hCur],
        probabilitiesAfter: pAfter,
        optimalProb: pAfter[1],
        stepScale: actorAlpha * ratio * stepDelta,
      },
    }
  })

  return {
    series: [value, target, nextValueEstimate],
    delta,
    target,
    nextValueEstimate,
    actorStep,
    ratio,
    actorAlpha,
    criticAlpha,
    critic: {
      valueBefore: value,
      target,
      delta,
      correction: criticCorrection,
      valueAfter: nextValueEstimate,
    },
    actor: {
      actionIndex,
      logitsBefore,
      probabilitiesBefore,
      scoreVector,
      updateVector: actorUpdateVector,
      logitsAfter,
      probabilitiesAfter,
    },
    loopFrames,
  }
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
