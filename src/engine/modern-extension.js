export const codingCandidates = [
  {
    id: 'A',
    stage: 1,
    label: '首次补丁',
    enLabel: 'Initial patch',
    inputFeedback: { zh: '只有原始任务描述，尚无执行反馈', en: 'Original task only; no execution feedback yet' },
    visible: [1, 1, 1, 0],
    hidden: [0, 0],
    syntax: true,
    diff: ['+ if value > limit: return limit', '- return normalize(value)'],
    intent: { zh: '只处理常见的上界输入', en: 'Clamp common upper-bound inputs only' },
  },
  {
    id: 'B',
    stage: 2,
    label: '按可见失败修补',
    enLabel: 'Repair visible failure',
    inputFeedback: { zh: '观察到 T4 空输入失败', en: 'Observed T4 empty-input failure' },
    visible: [1, 1, 1, 1],
    hidden: [0, 0],
    syntax: true,
    diff: ['+ if value in FIXTURES: return EXPECTED[value]', '+ return normalize(value)'],
    intent: { zh: '记住可见样例，快速消除已知失败', en: 'Memorize visible fixtures to remove known failures' },
  },
  {
    id: 'C',
    stage: 3,
    label: '按隐藏审计重构',
    enLabel: 'Refactor after hidden audit',
    inputFeedback: { zh: '隐藏边界测试与性质检查仍失败', en: 'Hidden boundary and property checks still fail' },
    visible: [1, 1, 1, 1],
    hidden: [1, 1],
    syntax: true,
    diff: ['+ bounded = min(limit, max(lower, value))', '+ return normalize(bounded)'],
    intent: { zh: '把完整输入约束写进实现', en: 'Enforce the full input contract' },
  },
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
  const currentIndex = codingCandidates.indexOf(candidate)
  const trajectory = codingCandidates.map((stage) => ({
    id: stage.id,
    stage: stage.stage,
    inputFeedback: stage.inputFeedback,
    visibleFailures: stage.visible.filter((value) => !value).length,
    hiddenFailures: stage.hidden.filter((value) => !value).length,
    reached: stage.stage <= candidate.stage,
    selected: stage.id === candidate.id,
  }))
  return { candidate, tests, testNames: codingTests.slice(0, tests.length), weights, passed, reward, generalizes: candidate.hidden.every(Boolean), currentIndex, trajectory }
}

export const agentSteps = [
  { id: 'search', tool: 'search', zhTool: '搜索仓库', observation: '2 candidate files', zhObservation: '定位 2 个候选文件', role: 'evidence', segment: 'discover', zhSegment: '探索定位', localEvidence: 0.15 },
  { id: 'inspect', tool: 'open_file', zhTool: '读取文件', observation: 'boundary branch found', zhObservation: '发现边界分支缺陷', role: 'evidence', segment: 'discover', zhSegment: '探索定位', localEvidence: 0.35 },
  { id: 'edit', tool: 'apply_patch', zhTool: '提交补丁', observation: 'patch applied', zhObservation: '写入边界修复补丁', role: 'decision', segment: 'change', zhSegment: '代码修改', localEvidence: 0.45 },
  { id: 'test', tool: 'run_tests', zhTool: '运行测试', observation: '1 hidden failure', zhObservation: '暴露 1 个隐藏边界失败', role: 'feedback', segment: 'verify', zhSegment: '测试验证', localEvidence: -0.35 },
  { id: 'repair', tool: 'apply_patch', zhTool: '二次修复', observation: 'edge case fixed', zhObservation: '修补隐藏边界条件', role: 'decision', segment: 'change', zhSegment: '代码修改', localEvidence: 0.55 },
  { id: 'verify', tool: 'run_tests', zhTool: '全量验证', observation: 'all tests pass', zhObservation: '全部测试通过', role: 'terminal', segment: 'verify', zhSegment: '测试验证', localEvidence: 0.8 },
]

export const agentTreeNodes = [
  { id: 'search', parentId: null, depth: 0, tool: 'search', zhTool: '搜索仓库', action: 'find candidate files', zhAction: '检索相关候选文件', observation: '2 candidate files', zhObservation: '返回 2 个候选文件', zhStateNote: '初始上下文仅含 Issue 描述，搜索把候选范围缩小到两个文件。', enStateNote: 'Initial context holds only the issue; search narrows candidates to two files.', branchTarget: null },
  { id: 'inspect-boundary', parentId: 'search', depth: 1, tool: 'open_file', zhTool: '读取文件', action: 'inspect boundary logic', zhAction: '读取边界处理模块', observation: 'boundary branch found', zhObservation: '定位到缺失下界检查', zhStateNote: '读取正确文件把缺陷事实写进上下文，使后续补丁指向真实根因。', enStateNote: 'Reading the right file brings the real defect into visible state for editing.', branchTarget: 'none' },
  { id: 'inspect-parser', parentId: 'search', depth: 1, tool: 'open_file', zhTool: '读取文件', action: 'inspect parser', zhAction: '误读解析器文件', observation: 'no relevant defect', zhObservation: '未发现相关缺陷', zhStateNote: '首次错误分叉：后续上下文缺少边界模块代码，导致盲目修改。', enStateNote: 'First wrong fork: context misses boundary code and steers later edits astray.', branchTarget: 'inspect' },
  { id: 'edit-fix', parentId: 'inspect-boundary', depth: 2, tool: 'apply_patch', zhTool: '提交补丁', action: 'patch boundary branch', zhAction: '修补边界分支逻辑', observation: 'targeted patch applied', zhObservation: '仓库代码已更新', zhStateNote: '工具动作真实改写了仓库文件，外部环境状态发生变化。', enStateNote: 'The tool call mutates repository files, changing external environment state.', branchTarget: 'none' },
  { id: 'edit-parser', parentId: 'inspect-parser', depth: 2, tool: 'apply_patch', zhTool: '提交补丁', action: 'patch parser', zhAction: '修改无关解析逻辑', observation: 'irrelevant patch applied', zhObservation: '写入无效补丁', zhStateNote: '受错误前置观察影响，修改了无关模块并消耗预算。', enStateNote: 'Driven by the wrong inspection, this mutates unrelated code and burns budget.', branchTarget: 'inspect' },
  { id: 'test-fix', parentId: 'edit-fix', depth: 3, tool: 'run_tests', zhTool: '运行测试', action: 'run focused tests', zhAction: '运行回归与边界测试', observation: '1 hidden edge failure', zhObservation: '暴露 1 项隐藏边界失败', zhStateNote: '环境测试返回可验证失败栈，为下一步修复提供条件依据。', enStateNote: 'Executable tests return a concrete failure trace that conditions repair.', branchTarget: 'none' },
  { id: 'test-parser', parentId: 'edit-parser', depth: 3, tool: 'run_tests', zhTool: '运行测试', action: 'run focused tests', zhAction: '运行测试验证', observation: 'original failure remains', zhObservation: '原始故障未消除（终止失败）', zhStateNote: '因早期定位错误，测试确认修复失败并耗尽本支路。', enStateNote: 'Because localization erred early, tests confirm failure on this branch.', branchTarget: 'inspect', terminal: true, success: false },
  { id: 'repair', parentId: 'test-fix', depth: 4, tool: 'apply_patch', zhTool: '二次修复', action: 'repair edge case', zhAction: '针对失败栈修补边界', observation: 'edge case fixed', zhObservation: '边界分支已闭合', zhStateNote: '读取上一步测试观察后条件化修复，而非盲目重试。', enStateNote: 'Conditioned on the prior test observation rather than blind resampling.', branchTarget: 'none' },
  { id: 'stop', parentId: 'test-fix', depth: 4, tool: 'stop', zhTool: '主动终止', action: 'accept partial evidence', zhAction: '忽略失败并提前停止', observation: 'hidden failure unresolved', zhObservation: '隐藏边界未解决（终止失败）', zhStateNote: '第二处错误分叉：已看到失败观察却主动停止，策略需承担该决策责任。', enStateNote: 'Second failure fork: stopping despite failure evidence is a policy decision error.', branchTarget: 'test', terminal: true, success: false },
  { id: 'verify', parentId: 'repair', depth: 5, tool: 'run_tests', zhTool: '全量验证', action: 'run full verification', zhAction: '运行完整测试套件', observation: 'all tests pass', zhObservation: '全部测试通过（任务成功）', zhStateNote: '环境给出可验证成功终止信号，完整轨迹闭合。', enStateNote: 'Environment confirms verifiable success and closes the trajectory.', branchTarget: 'none', terminal: true, success: true },
]

const agentPaths = {
  none: ['search', 'inspect-boundary', 'edit-fix', 'test-fix', 'repair', 'verify'],
  inspect: ['search', 'inspect-parser', 'edit-parser', 'test-parser'],
  test: ['search', 'inspect-boundary', 'edit-fix', 'test-fix', 'stop'],
}

export function buildAgentTrajectory({ failureAt = 'none' } = {}) {
  const pathIds = agentPaths[failureAt] || agentPaths.none
  const pathSet = new Set(pathIds)
  const firstDivergence = failureAt === 'test' ? 'stop' : pathIds[1]
  const nodes = agentTreeNodes.map((node) => ({
    ...node,
    selected: pathSet.has(node.id),
    branchAlternative: !pathSet.has(node.id) && node.parentId && pathSet.has(node.parentId),
    isDivergence: node.id === firstDivergence && failureAt !== 'none',
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
    zhTerminal: terminalNode.zhObservation,
    cost: steps.length * 1.4 + steps.filter((step) => step.tool === 'run_tests').length * 2.2,
    firstDivergence,
  }
}

export const creditSegments = {
  discover: { label: 'discover', zhLabel: '探索定位段', outcome: 0.5, baseline: 0.2 },
  change: { label: 'change', zhLabel: '代码修改段', outcome: 0.8, baseline: 0.35 },
  verify: { label: 'verify', zhLabel: '测试验证段', outcome: 1, baseline: 0.55 },
}

export const counterfactualReplays = [
  { stepId: 'search', chosen: 'search repository', zhChosen: '搜索仓库定位候选', alternative: 'guess a file', zhAlternative: '盲猜文件名', chosenOutcome: 1, alternativeOutcome: 0.15 },
  { stepId: 'inspect', chosen: 'inspect boundary branch', zhChosen: '读取边界逻辑文件', alternative: 'inspect parser', zhAlternative: '误读解析器文件', chosenOutcome: 1, alternativeOutcome: 0 },
  { stepId: 'edit', chosen: 'patch boundary logic', zhChosen: '修补边界分支', alternative: 'patch parser', zhAlternative: '修改无关解析器', chosenOutcome: 1, alternativeOutcome: 0 },
  { stepId: 'test', chosen: 'run focused tests', zhChosen: '运行针对性测试', alternative: 'skip tests', zhAlternative: '跳过测试直接提交', chosenOutcome: 1, alternativeOutcome: 0.25 },
  { stepId: 'repair', chosen: 'repair hidden edge', zhChosen: '按失败栈修补边界', alternative: 'accept partial patch', zhAlternative: '提前停止接受部分补丁', chosenOutcome: 1, alternativeOutcome: 0.4 },
  { stepId: 'verify', chosen: 'run full suite', zhChosen: '全量回归验证', alternative: 'stop after focused test', zhAlternative: '仅靠局部测试结束', chosenOutcome: 1, alternativeOutcome: 0.65 },
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
