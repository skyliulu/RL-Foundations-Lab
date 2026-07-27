import {
  ACTION_NAMES,
  actionTarget,
  allStates,
  createInitialValues,
  indexOf,
} from './gridworld.js'
import { solveOperator } from './optimality.js'

const states = allStates()
export const PLANNING_INSPECTION_INDEX = 10

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

function actionValuesAt(index, values, gamma, noise) {
  return Object.fromEntries(ACTION_NAMES.map((action) => [
    action,
    actionTarget(states[index], action, values, gamma, noise),
  ]))
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
  let policy = greedyPolicy(values, gamma, noise)
  let backups = 0
  let policyUpdates = 0
  const initialResidual = optimalResidual(values, gamma, noise)
  const trace = [{
    iteration: 0,
    values: [...values],
    policy: [...policy],
    evaluatedPolicy: [...policy],
    evaluationStartValues: [...values],
    evaluationSweeps: 0,
    improvementActionValues: actionValuesAt(PLANNING_INSPECTION_INDEX, values, gamma, noise),
    residual: initialResidual,
    backups,
    policyChanges: 0,
    policyUpdates,
  }]
  const timeline = [{
    phase: 'ready',
    iteration: 0,
    sweep: 0,
    evaluationTarget: algorithm === 'pi' ? null : algorithm === 'vi' ? 1 : truncation,
    values: [...values],
    policy: [...policy],
    previewPolicy: [...policy],
    evaluatedPolicy: [...policy],
    evaluationStartValues: [...values],
    evaluationSweeps: 0,
    improvementActionValues: actionValuesAt(PLANNING_INSPECTION_INDEX, values, gamma, noise),
    evaluationResidual: initialResidual,
    residual: initialResidual,
    backups,
    policyChanges: 0,
    policyUpdates,
  }]

  for (let iteration = 1; iteration <= maxOuter; iteration += 1) {
    const evaluationStartValues = [...values]
    const evaluatedPolicy = [...policy]
    const evaluationLimit = algorithm === 'pi' ? 4000 : algorithm === 'vi' ? 1 : truncation
    let evaluationSweeps = 0

    for (let sweep = 0; sweep < evaluationLimit; sweep += 1) {
      const outcome = policySweep(values, policy, gamma, noise)
      values = outcome.values
      backups += outcome.backups
      evaluationSweeps += 1
      const previewPolicy = greedyPolicy(values, gamma, noise)
      timeline.push({
        phase: 'evaluation',
        iteration,
        sweep: evaluationSweeps,
        evaluationTarget: algorithm === 'pi' ? null : evaluationLimit,
        values: [...values],
        policy: [...evaluatedPolicy],
        previewPolicy,
        evaluatedPolicy: [...evaluatedPolicy],
        evaluationStartValues: [...evaluationStartValues],
        evaluationSweeps,
        improvementActionValues: actionValuesAt(PLANNING_INSPECTION_INDEX, values, gamma, noise),
        evaluationResidual: outcome.residual,
        residual: optimalResidual(values, gamma, noise),
        backups,
        policyChanges: 0,
        policyUpdates,
      })
      if (algorithm === 'pi' && outcome.residual < 1e-11) break
    }

    const improvementActionValues = actionValuesAt(PLANNING_INSPECTION_INDEX, values, gamma, noise)
    const nextPolicy = greedyPolicy(values, gamma, noise)
    const policyChanges = countChanges(policy, nextPolicy)
    policy = nextPolicy
    policyUpdates += 1
    const residual = optimalResidual(values, gamma, noise)
    trace.push({
      iteration,
      values: [...values],
      policy: [...policy],
      evaluatedPolicy,
      evaluationStartValues,
      evaluationSweeps,
      improvementActionValues,
      residual,
      backups,
      policyChanges,
      policyUpdates,
    })
    timeline.push({
      phase: 'improvement',
      iteration,
      sweep: evaluationSweeps,
      evaluationTarget: algorithm === 'pi' ? null : evaluationLimit,
      values: [...values],
      policy: [...policy],
      previewPolicy: [...policy],
      evaluatedPolicy,
      evaluationStartValues,
      evaluationSweeps,
      improvementActionValues,
      evaluationResidual: 0,
      residual,
      backups,
      policyChanges,
      policyUpdates,
    })
    if (residual < tolerance && policyChanges === 0) break
  }

  const optimal = solveOperator({ gamma, noise, operator: 'optimal' }).values
  const maxValueError = Math.max(...values.map((value, index) => Math.abs(value - optimal[index])))
  return { algorithm, values, policy, trace, timeline, backups, policyUpdates, maxValueError }
}

export function comparePlanningAlgorithms(config = {}) {
  return {
    vi: runPlanningAlgorithm({ ...config, algorithm: 'vi' }),
    tpi: runPlanningAlgorithm({ ...config, algorithm: 'tpi' }),
    pi: runPlanningAlgorithm({ ...config, algorithm: 'pi' }),
  }
}
