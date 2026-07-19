import { createInitialValues, fixedPolicyAction, indexOf, sweep, transitionsFor } from './gridworld.js'

export const RETURN_HORIZON = 120
export const RETURN_SEED_BASE = 20260719

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let output = value
    output = Math.imul(output ^ (output >>> 15), output | 1)
    output ^= output + Math.imul(output ^ (output >>> 7), output | 61)
    return ((output ^ (output >>> 14)) >>> 0) / 4294967296
  }
}

function chooseTransition(branches, random) {
  const sample = random()
  let cumulative = 0
  for (const branch of branches) {
    cumulative += branch.probability
    if (sample <= cumulative + Number.EPSILON) return branch
  }
  return branches[branches.length - 1]
}

export function simulateDiscountedReturn({
  start,
  gamma = 0.9,
  noise = 0,
  seed = RETURN_SEED_BASE,
  horizon = RETURN_HORIZON,
} = {}) {
  const random = seededRandom(seed)
  const steps = []
  let state = { ...start }
  let discountedReturn = 0

  for (let time = 0; time < horizon; time += 1) {
    const action = fixedPolicyAction(state)
    const branch = chooseTransition(transitionsFor(state, action, noise), random)
    const discount = gamma ** time
    const contribution = discount * branch.reward
    steps.push({
      time,
      state,
      action,
      reward: branch.reward,
      nextState: branch.state,
      probability: branch.probability,
      discount,
      contribution,
    })
    discountedReturn += contribution
    state = branch.state
  }

  return {
    seed,
    steps,
    discountedReturn,
    tailBound: gamma ** horizon / (1 - gamma),
  }
}

export function exactStateValue({ start, gamma = 0.9, noise = 0 } = {}) {
  let values = createInitialValues()
  for (let iteration = 0; iteration < 4000; iteration += 1) {
    const result = sweep(values, gamma, noise, { optimal: false, inPlace: false })
    values = result.values
    if (result.residual < 1e-12) break
  }
  return values[indexOf(start)]
}

export function estimateStateValue({
  start,
  gamma = 0.9,
  noise = 0,
  sampleCount = 8,
  seedBase = RETURN_SEED_BASE,
  horizon = RETURN_HORIZON,
} = {}) {
  const samples = Array.from({ length: sampleCount }, (_, index) => (
    simulateDiscountedReturn({ start, gamma, noise, seed: seedBase + index * 9973, horizon })
  ))
  let cumulative = 0
  const runningMeans = samples.map((sample, index) => {
    cumulative += sample.discountedReturn
    return cumulative / (index + 1)
  })
  return {
    samples,
    runningMeans,
    mean: runningMeans.at(-1),
    exact: exactStateValue({ start, gamma, noise }),
  }
}
