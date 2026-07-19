export const SIZE = 5
export const START = { row: 0, col: 0 }
export const GOAL = { row: 3, col: 2 }
export const BOUNDARY_REWARD = -1
export const FORBIDDEN_REWARD = -1
export const TARGET_REWARD = 1
export const STEP_REWARD = 0
export const COURSE_REWARDS = Object.freeze({
  boundary: BOUNDARY_REWARD,
  forbidden: FORBIDDEN_REWARD,
  target: TARGET_REWARD,
  step: STEP_REWARD,
})

export const FORBIDDEN_STATES = [
  { row: 1, col: 1 },
  { row: 1, col: 2 },
  { row: 2, col: 2 },
  { row: 3, col: 1 },
  { row: 3, col: 3 },
  { row: 4, col: 1 },
]

export const ACTIONS = {
  up: { row: -1, col: 0, arrow: '↑' },
  right: { row: 0, col: 1, arrow: '→' },
  down: { row: 1, col: 0, arrow: '↓' },
  left: { row: 0, col: -1, arrow: '←' },
  stay: { row: 0, col: 0, arrow: '○' },
}

const actionNames = Object.keys(ACTIONS)
export const ACTION_NAMES = actionNames

export const keyOf = ({ row, col }) => `${row},${col}`
export const indexOf = ({ row, col }) => row * SIZE + col
export const isSame = (a, b) => a.row === b.row && a.col === b.col
export const isGoal = (state) => isSame(state, GOAL)
export const isForbidden = (state) => FORBIDDEN_STATES.some((item) => isSame(item, state))

export function allStates() {
  return Array.from({ length: SIZE * SIZE }, (_, index) => ({
    row: Math.floor(index / SIZE),
    col: index % SIZE,
  }))
}

export function createInitialValues() {
  return Array.from({ length: SIZE * SIZE }, () => 0)
}

// The first "good" policy shown in Lecture 2, slide 42.
const fixedPolicy = [
  ['right', 'right', 'right', 'down', 'down'],
  ['up', 'up', 'right', 'down', 'down'],
  ['up', 'left', 'down', 'right', 'down'],
  ['up', 'right', 'stay', 'left', 'down'],
  ['up', 'right', 'up', 'left', 'left'],
]

export function fixedPolicyAction(state) {
  return fixedPolicy[state.row][state.col]
}

// Lecture 2 policy-evaluation table, rounded to one decimal as printed in the course.
export const COURSE_FIXED_POLICY_VALUES = [
  3.5, 3.9, 4.3, 4.8, 5.3,
  3.1, 3.5, 4.8, 5.3, 5.9,
  2.8, 2.5, 10.0, 5.9, 6.6,
  2.5, 10.0, 10.0, 10.0, 7.3,
  2.3, 9.0, 10.0, 9.0, 8.1,
]

export function attemptMove(state, actionName) {
  const action = ACTIONS[actionName]
  const attempted = { row: state.row + action.row, col: state.col + action.col }
  const boundary = attempted.row < 0 || attempted.row >= SIZE || attempted.col < 0 || attempted.col >= SIZE
  return { state: boundary ? state : attempted, boundary }
}

export function move(state, actionName) {
  return attemptMove(state, actionName).state
}

export function rewardForTransition(next, boundary, rewards = COURSE_REWARDS) {
  if (boundary) return rewards.boundary
  if (isForbidden(next)) return rewards.forbidden
  if (isGoal(next)) return rewards.target
  return rewards.step
}

export function transitionsFor(state, actionName, noise = 0, rewards = COURSE_REWARDS) {
  const alternatives = actionNames.filter((name) => name !== actionName)
  const candidates = [
    [actionName, 1 - noise],
    ...alternatives.map((name) => [name, noise / alternatives.length]),
  ]
  const merged = new Map()
  candidates.forEach(([name, probability]) => {
    if (probability <= 0) return
    const outcome = attemptMove(state, name)
    const reward = rewardForTransition(outcome.state, outcome.boundary, rewards)
    const transitionKey = `${keyOf(outcome.state)}|${reward}`
    const current = merged.get(transitionKey) || { state: outcome.state, probability: 0, reward }
    current.probability += probability
    merged.set(transitionKey, current)
  })
  return [...merged.values()]
}

export function actionTarget(state, actionName, values, gamma, noise, rewards = COURSE_REWARDS) {
  return transitionsFor(state, actionName, noise, rewards).reduce((sum, transition) => (
    sum + transition.probability * (transition.reward + gamma * values[indexOf(transition.state)])
  ), 0)
}

export function chooseAction(state, policy, values, gamma, noise) {
  if (policy === 'fixed') return fixedPolicy[state.row][state.col]
  return actionNames.reduce((best, candidate) => {
    const target = actionTarget(state, candidate, values, gamma, noise)
    return target > best.target ? { name: candidate, target } : best
  }, { name: 'up', target: -Infinity }).name
}

export function describeBackup(state, values, gamma, noise, policy = 'fixed', actionOverride = null) {
  const action = actionOverride || chooseAction(state, policy, values, gamma, noise)
  const transitions = transitionsFor(state, action, noise)
  const target = policy === 'greedy' && !actionOverride
    ? Math.max(...actionNames.map((name) => actionTarget(state, name, values, gamma, noise)))
    : actionTarget(state, action, values, gamma, noise)
  const before = values[indexOf(state)]
  const primary = [...transitions].sort((a, b) => b.probability - a.probability)[0]
  return { action, transitions, target, before, residual: target - before, primary }
}

export function backupState(state, values, gamma, noise, policy = 'fixed', actionOverride = null) {
  const detail = describeBackup(state, values, gamma, noise, policy, actionOverride)
  const nextValues = [...values]
  nextValues[indexOf(state)] = detail.target
  return { values: nextValues, ...detail }
}

function stateTarget(state, values, gamma, noise, optimal) {
  if (optimal) {
    return Math.max(...actionNames.map((name) => actionTarget(state, name, values, gamma, noise)))
  }
  return actionTarget(state, fixedPolicy[state.row][state.col], values, gamma, noise)
}

export function sweep(values, gamma, noise, { optimal = false, inPlace = false } = {}) {
  const source = inPlace ? [...values] : values
  const result = inPlace ? source : [...values]
  let maxResidual = 0
  allStates().forEach((state) => {
    const target = stateTarget(state, source, gamma, noise, optimal)
    maxResidual = Math.max(maxResidual, Math.abs(target - source[indexOf(state)]))
    result[indexOf(state)] = target
  })
  return { values: result, residual: maxResidual }
}

export function converge({ gamma = 0.9, noise = 0, optimal = false, inPlace = false, limit = 80 } = {}) {
  let values = createInitialValues()
  const residuals = []
  for (let iteration = 0; iteration < limit; iteration += 1) {
    const outcome = sweep(values, gamma, noise, { optimal, inPlace })
    values = outcome.values
    residuals.push(outcome.residual)
    if (outcome.residual < 1e-4) break
  }
  return { values, residuals, backups: residuals.length * allStates().length }
}

export function compareDiscountHorizons({ baselineGamma = 0.9, comparisonGamma = 0.5 } = {}) {
  const baseline = converge({ gamma: baselineGamma, noise: 0, optimal: false, limit: 200 })
  const comparison = converge({ gamma: comparisonGamma, noise: 0, optimal: false, limit: 200 })
  return {
    baselineGamma,
    comparisonGamma,
    baseline,
    comparison,
    deltas: comparison.values.map((value, index) => value - baseline.values[index]),
    courseMaxError: Math.max(...baseline.values.map((value, index) => Math.abs(value - COURSE_FIXED_POLICY_VALUES[index]))),
  }
}

export function arrowFor(state, policy, values, gamma, noise) {
  return ACTIONS[chooseAction(state, policy, values, gamma, noise)].arrow
}
