import {
  ACTION_NAMES,
  actionTarget,
  allStates,
  createInitialValues,
  fixedPolicyAction,
  indexOf,
} from './gridworld.js'
import { solveOperator } from './optimality.js'

const states = allStates()

function greedyPolicy(values, gamma, noise) {
  return states.map((state) => ACTION_NAMES.reduce((best, action) => {
    const target = actionTarget(state, action, values, gamma, noise)
    return target > best.target + 1e-12 ? { action, target } : best
  }, { action: ACTION_NAMES[0], target: -Infinity }).action)
}

function policySweep(values, policy, gamma, noise) {
  const next = [...values]
  let residual = 0
  states.forEach((state, index) => {
    const target = actionTarget(state, policy[index], values, gamma, noise)
    residual = Math.max(residual, Math.abs(target - values[index]))
    next[index] = target
  })
  return { values: next, residual, backups: states.length }
}

function optimalResidual(values, gamma, noise) {
  return states.reduce((largest, state) => {
    const target = Math.max(...ACTION_NAMES.map((action) => actionTarget(state, action, values, gamma, noise)))
    return Math.max(largest, Math.abs(target - values[indexOf(state)]))
  }, 0)
}

function countChanges(before, after) {
  return after.reduce((count, action, index) => count + Number(action !== before[index]), 0)
}

export function runPlanningAlgorithm({
  algorithm = 'vi',
  gamma = 0.9,
  noise = 0,
  truncation = 3,
  maxOuter = 240,
  tolerance = 1e-7,
} = {}) {
  let values = createInitialValues()
  let policy = states.map((state) => fixedPolicyAction(state))
  let backups = 0
  let policyUpdates = 0
  const trace = [{ iteration: 0, values: [...values], policy: [...policy], residual: optimalResidual(values, gamma, noise), backups, policyChanges: 0, policyUpdates }]

  for (let iteration = 1; iteration <= maxOuter; iteration += 1) {
    let policyChanges = 0

    if (algorithm === 'vi') {
      const nextPolicy = greedyPolicy(values, gamma, noise)
      policyChanges = countChanges(policy, nextPolicy)
      policy = nextPolicy
      const outcome = policySweep(values, policy, gamma, noise)
      values = outcome.values
      backups += outcome.backups
      policyUpdates += 1
    } else {
      const evaluationLimit = algorithm === 'pi' ? 4000 : truncation
      for (let sweep = 0; sweep < evaluationLimit; sweep += 1) {
        const outcome = policySweep(values, policy, gamma, noise)
        values = outcome.values
        backups += outcome.backups
        if (algorithm === 'pi' && outcome.residual < 1e-11) break
      }
      const nextPolicy = greedyPolicy(values, gamma, noise)
      policyChanges = countChanges(policy, nextPolicy)
      policy = nextPolicy
      policyUpdates += 1
    }

    const residual = optimalResidual(values, gamma, noise)
    trace.push({ iteration, values: [...values], policy: [...policy], residual, backups, policyChanges, policyUpdates })
    if (residual < tolerance && policyChanges === 0) break
  }

  const optimal = solveOperator({ gamma, noise, operator: 'optimal' }).values
  const maxValueError = Math.max(...values.map((value, index) => Math.abs(value - optimal[index])))
  return { algorithm, values, policy, trace, backups, policyUpdates, maxValueError }
}

export function comparePlanningAlgorithms(config = {}) {
  return {
    vi: runPlanningAlgorithm({ ...config, algorithm: 'vi' }),
    tpi: runPlanningAlgorithm({ ...config, algorithm: 'tpi' }),
    pi: runPlanningAlgorithm({ ...config, algorithm: 'pi' }),
  }
}
