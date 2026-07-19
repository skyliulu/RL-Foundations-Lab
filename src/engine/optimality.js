import {
  ACTION_NAMES,
  COURSE_REWARDS,
  actionTarget,
  allStates,
  createInitialValues,
  fixedPolicyAction,
  indexOf,
} from './gridworld.js'

function targetFor(state, values, gamma, noise, operator, rewards) {
  if (operator === 'policy') return actionTarget(state, fixedPolicyAction(state), values, gamma, noise, rewards)
  return Math.max(...ACTION_NAMES.map((action) => actionTarget(state, action, values, gamma, noise, rewards)))
}

export function solveOperator({
  gamma = 0.9,
  noise = 0,
  operator = 'optimal',
  rewards = COURSE_REWARDS,
  tolerance = 1e-11,
  limit = 4000,
} = {}) {
  let values = createInitialValues()
  let residual = Infinity
  let iterations = 0
  for (; iterations < limit && residual > tolerance; iterations += 1) {
    const next = [...values]
    residual = 0
    allStates().forEach((state) => {
      const target = targetFor(state, values, gamma, noise, operator, rewards)
      residual = Math.max(residual, Math.abs(target - values[indexOf(state)]))
      next[indexOf(state)] = target
    })
    values = next
  }
  return { values, residual, iterations }
}

export function inspectActionCompetition({ state, values, gamma = 0.9, noise = 0, rewards = COURSE_REWARDS } = {}) {
  const actions = ACTION_NAMES.map((action) => ({
    action,
    target: actionTarget(state, action, values, gamma, noise, rewards),
  }))
  const bestTarget = Math.max(...actions.map((item) => item.target))
  const bestActions = actions.filter((item) => Math.abs(item.target - bestTarget) < 1e-9).map((item) => item.action)
  const policyAction = fixedPolicyAction(state)
  return {
    actions,
    bestTarget,
    bestActions,
    policyAction,
    policyTarget: actions.find((item) => item.action === policyAction).target,
  }
}

export function comparePolicyAndOptimal({ gamma = 0.9, noise = 0, rewards = COURSE_REWARDS } = {}) {
  const policy = solveOperator({ gamma, noise, operator: 'policy', rewards })
  const optimal = solveOperator({ gamma, noise, operator: 'optimal', rewards })
  return {
    policy,
    optimal,
    gaps: optimal.values.map((value, index) => value - policy.values[index]),
  }
}
