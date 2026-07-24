export const codingCandidates = [
  { id: 'A', label: '边界遗漏', visible: [1, 1, 1, 0], hidden: [0, 0], syntax: true, diff: ['+ if value > limit: return limit', '- return normalize(value)'], intent: 'clamp common inputs only' },
  { id: 'B', label: '可见测试捷径', visible: [1, 1, 1, 1], hidden: [0, 0], syntax: true, diff: ['+ if value in FIXTURES: return EXPECTED[value]', '+ return normalize(value)'], intent: 'memorize visible fixtures' },
  { id: 'C', label: '完整修复', visible: [1, 1, 1, 1], hidden: [1, 1], syntax: true, diff: ['+ bounded = min(limit, max(lower, value))', '+ return normalize(bounded)'], intent: 'enforce the full input contract' },
]

export const codingTests = ['nominal input', 'upper boundary', 'negative input', 'empty input', 'unseen boundary', 'property invariant']

export function evaluateCodingReward({ candidateId = 'A', mode = 'partial', revealHidden = false } = {}) {
  const candidate = codingCandidates.find((item) => item.id === candidateId) || codingCandidates[0]
  const tests = revealHidden ? [...candidate.visible, ...candidate.hidden] : candidate.visible
  const weights = tests.map((_, index) => index < 2 ? 0.7 : 1.3)
  const passed = tests.reduce((sum, value) => sum + value, 0)
  const reward = mode === 'outcome'
    ? Number(tests.every(Boolean))
    : mode === 'weighted'
      ? tests.reduce((sum, value, index) => sum + value * weights[index], 0) / weights.reduce((sum, value) => sum + value, 0)
      : passed / tests.length
  return { candidate, tests, testNames: codingTests.slice(0, tests.length), weights, passed, reward, generalizes: candidate.hidden.every(Boolean) }
}

export const agentSteps = [
  { id: 'search', tool: 'search', observation: '2 candidate files', role: 'evidence' },
  { id: 'inspect', tool: 'open_file', observation: 'boundary branch found', role: 'evidence' },
  { id: 'edit', tool: 'apply_patch', observation: 'patch applied', role: 'decision' },
  { id: 'test', tool: 'run_tests', observation: '1 hidden failure', role: 'feedback' },
  { id: 'repair', tool: 'apply_patch', observation: 'edge case fixed', role: 'decision' },
  { id: 'verify', tool: 'run_tests', observation: 'all tests pass', role: 'terminal' },
]

export function buildAgentTrajectory({ failureAt = 'none' } = {}) {
  const stopIndex = failureAt === 'none' ? agentSteps.length : Math.max(1, agentSteps.findIndex((step) => step.id === failureAt) + 1)
  const steps = agentSteps.slice(0, stopIndex).map((step, index) => ({ ...step, index, status: index === stopIndex - 1 && failureAt !== 'none' ? 'failed' : 'complete' }))
  return { steps, success: failureAt === 'none', terminal: failureAt === 'none' ? 'verified success' : `terminated at ${failureAt}`, cost: steps.length * 1.4 + steps.filter((step) => step.tool === 'run_tests').length * 2.2 }
}

const processSignals = [0.15, 0.3, 0.45, -0.35, 0.55, 0.8]
const hindsightSignals = [0.05, 0.42, 0.72, -0.58, 0.9, 0.65]

export function evaluateCredit({ scheme = 'terminal', gamma = 0.9, trust = 0.7 } = {}) {
  const terminal = 1
  const credits = agentSteps.map((step, index) => {
    const distance = agentSteps.length - 1 - index
    let credit = terminal
    if (scheme === 'discounted') credit = gamma ** distance
    if (scheme === 'process') credit = gamma ** distance + trust * processSignals[index]
    if (scheme === 'hindsight') credit = (1 - trust) * gamma ** distance + trust * hindsightSignals[index]
    return {
      ...step,
      credit,
      evidence: scheme === 'process'
        ? processSignals[index]
        : scheme === 'hindsight'
          ? hindsightSignals[index]
          : gamma ** distance,
    }
  })
  return { credits, total: credits.reduce((sum, step) => sum + step.credit, 0) }
}
