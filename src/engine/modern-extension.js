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
  { id: 'search', tool: 'search', observation: '2 candidate files', role: 'evidence', segment: 'discover', localEvidence: 0.15 },
  { id: 'inspect', tool: 'open_file', observation: 'boundary branch found', role: 'evidence', segment: 'discover', localEvidence: 0.35 },
  { id: 'edit', tool: 'apply_patch', observation: 'patch applied', role: 'decision', segment: 'change', localEvidence: 0.45 },
  { id: 'test', tool: 'run_tests', observation: '1 hidden failure', role: 'feedback', segment: 'verify', localEvidence: -0.35 },
  { id: 'repair', tool: 'apply_patch', observation: 'edge case fixed', role: 'decision', segment: 'change', localEvidence: 0.55 },
  { id: 'verify', tool: 'run_tests', observation: 'all tests pass', role: 'terminal', segment: 'verify', localEvidence: 0.8 },
]

export const agentTreeNodes = [
  { id: 'search', parentId: null, depth: 0, tool: 'search', action: 'find candidate files', observation: '2 candidate files' },
  { id: 'inspect-boundary', parentId: 'search', depth: 1, tool: 'open_file', action: 'inspect boundary logic', observation: 'boundary branch found' },
  { id: 'inspect-parser', parentId: 'search', depth: 1, tool: 'open_file', action: 'inspect parser', observation: 'no relevant defect' },
  { id: 'edit-fix', parentId: 'inspect-boundary', depth: 2, tool: 'apply_patch', action: 'patch boundary branch', observation: 'targeted patch applied' },
  { id: 'edit-parser', parentId: 'inspect-parser', depth: 2, tool: 'apply_patch', action: 'patch parser', observation: 'irrelevant patch applied' },
  { id: 'test-fix', parentId: 'edit-fix', depth: 3, tool: 'run_tests', action: 'run focused tests', observation: '1 hidden edge failure' },
  { id: 'test-parser', parentId: 'edit-parser', depth: 3, tool: 'run_tests', action: 'run focused tests', observation: 'original failure remains', terminal: true, success: false },
  { id: 'repair', parentId: 'test-fix', depth: 4, tool: 'apply_patch', action: 'repair edge case', observation: 'edge case fixed' },
  { id: 'stop', parentId: 'test-fix', depth: 4, tool: 'stop', action: 'accept partial evidence', observation: 'hidden failure unresolved', terminal: true, success: false },
  { id: 'verify', parentId: 'repair', depth: 5, tool: 'run_tests', action: 'run full verification', observation: 'all tests pass', terminal: true, success: true },
]

const agentPaths = {
  none: ['search', 'inspect-boundary', 'edit-fix', 'test-fix', 'repair', 'verify'],
  inspect: ['search', 'inspect-parser', 'edit-parser', 'test-parser'],
  test: ['search', 'inspect-boundary', 'edit-fix', 'test-fix', 'stop'],
}

export function buildAgentTrajectory({ failureAt = 'none' } = {}) {
  const pathIds = agentPaths[failureAt] || agentPaths.none
  const pathSet = new Set(pathIds)
  const nodes = agentTreeNodes.map((node) => ({
    ...node,
    selected: pathSet.has(node.id),
    branchAlternative: !pathSet.has(node.id) && node.parentId && pathSet.has(node.parentId),
  }))
  const steps = pathIds.map((id, index) => {
    const node = agentTreeNodes.find((item) => item.id === id)
    return {
      ...node,
      index,
      status: node.terminal && !node.success ? 'failed' : 'complete',
    }
  })
  const terminalNode = steps.at(-1)
  const success = terminalNode.success === true
  return {
    nodes,
    pathIds,
    steps,
    success,
    terminal: terminalNode.observation,
    cost: steps.length * 1.4 + steps.filter((step) => step.tool === 'run_tests').length * 2.2,
    firstDivergence: pathIds[1],
  }
}

export const creditSegments = {
  discover: { label: 'discover', outcome: 0.5, baseline: 0.2 },
  change: { label: 'change', outcome: 0.8, baseline: 0.35 },
  verify: { label: 'verify', outcome: 1, baseline: 0.55 },
}

export const counterfactualReplays = [
  { stepId: 'search', chosen: 'search repository', alternative: 'guess a file', chosenOutcome: 1, alternativeOutcome: 0.15 },
  { stepId: 'inspect', chosen: 'inspect boundary branch', alternative: 'inspect parser', chosenOutcome: 1, alternativeOutcome: 0 },
  { stepId: 'edit', chosen: 'patch boundary logic', alternative: 'patch parser', chosenOutcome: 1, alternativeOutcome: 0 },
  { stepId: 'test', chosen: 'run focused tests', alternative: 'skip tests', chosenOutcome: 1, alternativeOutcome: 0.25 },
  { stepId: 'repair', chosen: 'repair hidden edge', alternative: 'accept partial patch', chosenOutcome: 1, alternativeOutcome: 0.4 },
  { stepId: 'verify', chosen: 'run full suite', alternative: 'stop after focused test', chosenOutcome: 1, alternativeOutcome: 0.65 },
]

export function evaluateCredit({ scheme = 'terminal', gamma = 0.9, trust = 0.7 } = {}) {
  const terminal = 1
  const credits = agentSteps.map((step, index) => {
    const distance = agentSteps.length - 1 - index
    let credit = terminal
    if (scheme === 'discounted') credit = gamma ** distance
    if (scheme === 'process') credit = gamma ** distance + trust * step.localEvidence
    if (scheme === 'segment') {
      const segment = creditSegments[step.segment]
      credit = segment.outcome - segment.baseline
    }
    const replay = counterfactualReplays.find((item) => item.stepId === step.id)
    const replayDelta = replay.chosenOutcome - replay.alternativeOutcome
    if (scheme === 'counterfactual') credit = (1 - trust) * gamma ** distance + trust * replayDelta
    return {
      ...step,
      credit,
      evidence: scheme === 'process'
        ? step.localEvidence
        : scheme === 'segment'
          ? creditSegments[step.segment].outcome
          : scheme === 'counterfactual'
            ? replayDelta
          : gamma ** distance,
      replay,
    }
  })
  return {
    credits,
    total: credits.reduce((sum, step) => sum + step.credit, 0),
    segments: creditSegments,
    replays: counterfactualReplays,
  }
}
