const ref = (source, id, type = 'turn', options = {}) => ({ source, id, type, ...options })
const derivation = (options = {}) => ({ source: 'derivation', type: 'derivation', ...options })
const experiment = () => ({ type: 'experiment', id: 'chapter-experiment' })

const orders = {
  returns: [
    ref('prelude', 'reward-to-return', 'section', { formulas: false }),
    derivation(),
    ref('prelude', 'return-to-value'),
    ref('deepening', 'two-return-calculations', 'topic'),
    ref('deepening', 'return-distribution', 'topic'),
    ref('sections', 'discount-boundary'),
    ref('sections', 'sample-expectation'),
    experiment(),
    ref('sections', 'continuing-transfer', 'turn', { formulas: false }),
  ],
  bellman: [
    ref('prelude', 'return-recursion', 'section', { formulas: false }),
    ref('prelude', 'conditional-expectation', 'turn', { formulas: false }),
    derivation(),
    ref('deepening', 'four-state-worked-system', 'topic'),
    ref('sections', 'target-anatomy'),
    ref('sections', 'bootstrapping'),
    experiment(),
    ref('sections', 'continuing-boundary'),
    ref('deepening', 'matrix-and-iteration', 'topic'),
    ref('deepening', 'state-to-action-value', 'topic'),
    ref('sections', 'action-value-transfer', 'turn', { formulas: false }),
  ],
  optimality: [
    ref('prelude', 'evaluation-control', 'section'),
    ref('prelude', 'max-reduction', 'turn', { formulas: false }),
    derivation(),
    ref('sections', 'fixed-point-optimality', 'turn', { formulas: false }),
    ref('deepening', 'contraction-proof', 'topic'),
    ref('deepening', 'greedy-policy-proof', 'topic'),
    ref('sections', 'reward-horizon'),
    ref('deepening', 'reward-transformations', 'topic'),
    experiment(),
    ref('sections', 'ties-transfer'),
  ],
  planning: [
    ref('prelude', 'value-iteration', 'section', { formulas: false }),
    ref('prelude', 'policy-iteration', 'turn', { formulas: false }),
    derivation(),
    ref('deepening', 'vi-complete-loop', 'topic'),
    ref('deepening', 'pi-four-whys', 'topic'),
    ref('deepening', 'tpi-continuum', 'topic'),
    ref('sections', 'fair-budget'),
    experiment(),
    ref('sections', 'model-free-transfer'),
  ],
  td: [
    ref('prelude', 'timing', 'section'),
    ref('prelude', 'bootstrap'),
    ref('deepening', 'bellman-sample-logic', 'topic', { formulaIndices: [0, 2] }),
    derivation(),
    ref('deepening', 'td-zero-complete', 'topic'),
    ref('deepening', 'mc-td-matched-comparison', 'topic', { formulas: false }),
    ref('sections', 'bias-variance', 'turn', { formulas: false }),
    experiment(),
    ref('sections', 'online'),
    ref('sections', 'forward'),
  ],
  control: [
    ref('prelude', 'prediction-control', 'section'),
    ref('prelude', 'fair-comparison'),
    derivation(),
    ref('deepening', 'sarsa-complete-loop', 'topic'),
    ref('deepening', 'q-learning-off-policy', 'topic'),
    ref('deepening', 'n-step-and-cliff', 'topic'),
    experiment(),
    ref('sections', 'forward'),
  ],
  vfa: [
    ref('prelude', 'capacity', 'section'),
    ref('prelude', 'distribution'),
    derivation(),
    ref('deepening', 'objective-and-semi-gradient', 'topic', { formulas: false }),
    ref('deepening', 'linear-sharing', 'topic'),
    ref('sections', 'generalization', 'turn', { formulas: false }),
    ref('sections', 'interference'),
    ref('deepening', 'approximate-control', 'topic'),
    experiment(),
    ref('sections', 'forward'),
  ],
  dqn: [
    ref('prelude', 'coupling', 'section'),
    ref('prelude', 'two-instabilities'),
    ref('deepening', 'moving-target', 'topic', { formulas: false }),
    derivation(),
    ref('deepening', 'replay-why', 'topic'),
    ref('deepening', 'dqn-complete', 'topic', { formulaIndices: [0, 1] }),
    experiment(),
    ref('sections', 'limits'),
  ],
  policygradient: [
    ref('prelude', 'value-policy', 'section'),
    ref('sections', 'softmax'),
    ref('prelude', 'credit'),
    ref('deepening', 'objectives-and-occupancy', 'topic'),
    derivation(),
    ref('deepening', 'theorem-to-samples', 'topic', { formulas: false }),
    ref('deepening', 'reinforce-complete', 'topic', { formulaIndices: [1] }),
    experiment(),
    ref('sections', 'variance'),
    ref('sections', 'forward'),
  ],
  actorcritic: [
    ref('prelude', 'roles', 'section'),
    ref('prelude', 'timing'),
    derivation(),
    ref('deepening', 'qac-to-baseline', 'topic', { formulaIndices: [0, 2] }),
    ref('deepening', 'a2c-shared-transition', 'topic'),
    ref('sections', 'variance-bias'),
    ref('deepening', 'off-policy-and-deterministic', 'topic'),
    experiment(),
    ref('sections', 'two-timescales'),
    ref('sections', 'forward'),
  ],
  ppo: [
    ref('prelude', 'actor-critic-loop', 'section', { formulas: false }),
    derivation(),
    ref('deepening', 'ratio-to-clipping-cases', 'topic'),
    ref('sections', 'gae'),
    ref('deepening', 'full-objective', 'topic'),
    ref('sections', 'update-cycle'),
    ref('deepening', 'ppo-complete-loop', 'topic'),
    experiment(),
    ref('sections', 'boundary'),
  ],
  tokenmdp: [
    ref('prelude', 'bridge', 'section', { formulas: false }),
    derivation(),
    ref('deepening', 'markov-sufficiency', 'topic'),
    ref('deepening', 'reward-placement', 'topic'),
    ref('deepening', 'rollout-record', 'topic'),
    ref('sections', 'sampling-policy'),
    ref('sections', 'terminal-vs-truncated'),
    experiment(),
    ref('sections', 'next'),
  ],
  rlhf: [
    ref('prelude', 'pipeline-level', 'section', { formulas: false }),
    ref('prelude', 'role-separation', 'turn', { formulas: false }),
    derivation(),
    ref('deepening', 'model-provenance', 'topic'),
    ref('deepening', 'sequence-to-token-reward', 'topic'),
    ref('deepening', 'batch-contract-and-failures', 'topic'),
    experiment(),
    ref('sections', 'online-loop'),
  ],
  dpo: [
    ref('prelude', 'why-offline', 'section', { formulas: false, mergeParagraphs: true }),
    ref('prelude', 'what-dpo', 'turn', { formulas: false }),
    derivation(),
    ref('sections', 'data-contract', 'turn', { formulas: false }),
    ref('deepening', 'complete-dpo', 'topic'),
    ref('deepening', 'failure-modes', 'topic'),
    experiment(),
    ref('sections', 'beta-meaning', 'turn', { formulas: false }),
    ref('sections', 'offline-boundary', 'turn', { formulas: false }),
  ],
  grpo: [
    ref('prelude', 'why-online', 'section', { formulas: false }),
    ref('prelude', 'group-baseline', 'turn', { formulas: false }),
    derivation(),
    ref('deepening', 'complete-grpo', 'topic'),
    ref('sections', 'verifier', 'turn', { formulas: false }),
    ref('deepening', 'stability-family', 'topic', { formulas: false }),
    ref('sections', 'group-cost', 'turn', { formulas: false }),
    ref('sections', 'zero-variance', 'turn', { formulas: false }),
    experiment(),
  ],
  codingrl: [
    ref('prelude', 'code-as-action', 'section'),
    ref('prelude', 'reward-design', 'turn', { formulas: false }),
    derivation(),
    ref('deepening', 'complete-coding-loop', 'topic'),
    ref('sections', 'feedback-types'),
    ref('sections', 'iterative-repair'),
    ref('deepening', 'reward-hacking', 'topic'),
    experiment(),
    ref('sections', 'safety-boundary'),
  ],
  agentmdp: [
    ref('prelude', 'beyond-response', 'section', { formulas: false }),
    ref('prelude', 'decision-boundary', 'turn', { formulas: false }),
    derivation(),
    ref('deepening', 'complete-agent-rollout', 'topic'),
    ref('deepening', 'partial-observability', 'topic'),
    ref('sections', 'tool-errors'),
    ref('sections', 'budget'),
    ref('sections', 'branching'),
    experiment(),
  ],
  credit: [
    ref('prelude', 'sparse-delay', 'section', { formulas: false }),
    ref('prelude', 'credit-question', 'turn', { formulas: false }),
    derivation({
      id: 'terminal-credit',
      stepIndices: [0, 1],
      title: { zh: '终局结果只能提供粗粒度信用', en: 'Terminal outcomes provide only coarse credit' },
      intro: {
        zh: '先把终局结果向前传播，得到每个时刻都可使用的回报；这一步改善了信号可用性，却仍不能区分关键决策与无关步骤。',
        en: 'First propagate the terminal outcome backward so every time step has a usable return. This improves availability but still cannot distinguish decisive actions from irrelevant steps.',
      },
    }),
    ref('sections', 'curriculum'),
    derivation({
      id: 'process-credit',
      stepIndices: [2],
      title: { zh: '过程反馈把局部证据写入回报', en: 'Process feedback inserts local evidence into return' },
      intro: {
        zh: '难度递进提高成功样本数量以后，过程奖励进一步在轨迹内部提供可验证信号，但它也会把验证器偏差直接带入学习。',
        en: 'After curriculum raises the supply of successful trajectories, process rewards add verifiable evidence inside a trajectory while importing verifier bias into learning.',
      },
    }),
    ref('sections', 'segmentation'),
    derivation({
      id: 'segment-credit',
      stepIndices: [3],
      title: { zh: '分段价值把信用放回工具级决策', en: 'Segment values return credit to tool-level decisions' },
      intro: {
        zh: '工具边界确定了稳定的决策单位，因而可以在每个片段起点比较实际动作与状态基线，而不必把同一工具调用内部的 token 分别归因。',
        en: 'Tool boundaries define stable decision units, so each segment can compare its action with a state baseline instead of assigning separate causal roles to tokens inside one tool call.',
      },
    }),
    ref('deepening', 'bias-audit', 'topic'),
    ref('sections', 'hindsight-risk'),
    derivation({
      id: 'hindsight-credit',
      stepIndices: [4],
      title: { zh: '事后归因必须接受反事实审计', en: 'Hindsight attribution requires counterfactual audit' },
      intro: {
        zh: '完整结果可以帮助重估早期步骤，但也可能把未来信息错误投射回过去，因此事后信用必须与替代动作重放或独立验证配对。',
        en: 'Complete outcomes help reassess early steps but can project future information backward incorrectly, so hindsight credit must be paired with replayed alternatives or independent verification.',
      },
    }),
    ref('deepening', 'solution-toolbox', 'topic', { formulas: false }),
    experiment(),
  ],
}

function sourceItem(content, descriptor) {
  return content[descriptor.source]?.find((item) => item.id === descriptor.id)
}

function formulaEntries(item, descriptor) {
  if (descriptor.formulas === false) return []
  const formulas = [...(item.formulas || []), ...(item.formula ? [item.formula] : [])]
  const selected = descriptor.formulaIndices ? descriptor.formulaIndices.map((index) => formulas[index]).filter(Boolean) : formulas
  const before = item.paragraphs?.length ? item.paragraphs.at(-2) || item.paragraphs[0] : item.intro
  const after = item.paragraphs?.length > 1 ? item.paragraphs.at(-1) : item.handoff || item.note
  return selected.map((formula) => ({
    role: formula?.role || descriptor.formulaRole || 'support',
    latex: formula?.latex || formula,
    before,
    after,
  }))
}

function paragraphEntries(item, descriptor, lang, hasFormulaContract) {
  const paragraphs = hasFormulaContract && item.paragraphs?.length > 1
    ? item.paragraphs.slice(0, -1)
    : item.paragraphs
  const mergeParagraphs = descriptor.mergeParagraphs ?? descriptor.type === 'turn'
  if (!mergeParagraphs || hasFormulaContract) return paragraphs
  return [paragraphs.join(lang === 'zh' ? '' : ' ')]
}

function materialize(content, descriptor, lang) {
  if (descriptor.type === 'experiment') return descriptor
  if (descriptor.source === 'derivation') {
    const steps = descriptor.stepIndices
      ? descriptor.stepIndices.map((index) => content.derivation[index]).filter(Boolean)
      : content.derivation
    return {
      type: 'derivation',
      id: descriptor.id || `${content.id || 'chapter'}-derivation`,
      kicker: content.derivationEyebrow,
      title: descriptor.title?.[lang] || content.derivationTitle,
      intro: descriptor.intro?.[lang] || content.derivationIntro || content.bridge,
      steps,
      level: descriptor.level || 'major',
    }
  }
  const item = sourceItem(content, descriptor)
  if (!item) throw new Error(`Missing article-flow source ${descriptor.source}:${descriptor.id}`)
  const formulas = formulaEntries(item, descriptor)
  const block = {
    ...item,
    type: descriptor.type,
    paragraphs: paragraphEntries(item, descriptor, lang, formulas.length > 0),
    formulas,
    formulaAfter: formulas.at(-1)?.after || null,
  }
  delete block.formula
  return block
}

export function buildChapterArticleFlow(id, content, lang) {
  const order = orders[id]
  if (!order) return null
  return order.map((descriptor) => materialize(content, descriptor, lang))
}

export const articleFlowChapterIds = Object.freeze(Object.keys(orders))
