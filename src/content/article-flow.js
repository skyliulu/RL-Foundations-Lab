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
    ref('deepening', 'model-provenance', 'topic'),
    derivation({ id: 'rlhf-derivation' }),
    ref('deepening', 'sequence-to-token-reward', 'topic'),
    ref('deepening', 'batch-contract-and-failures', 'topic'),
    experiment(),
    ref('sections', 'online-loop', 'turn', { formulas: false }),
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
    ref('sections', 'verifier', 'turn', { formulas: false }),
    ref('prelude', 'group-baseline', 'turn', { formulas: false }),
    derivation({
      id: 'grpo-core',
      stepIndices: [0, 1, 2, 3],
      title: { zh: '同组奖励经过标准化后进入裁剪策略更新', en: 'Normalized within-group rewards drive a clipped policy update' },
      intro: {
        zh: '先固定同一 prompt 与旧策略，才能把候选回答之间的奖励差解释为相对优势；随后沿用 PPO 的新旧概率比，在有限范围内提高优质回答的概率。',
        en: 'Fix one prompt and the old policy before interpreting reward differences as relative advantage, then reuse PPO ratios to increase better-response probability within a bounded update.',
      },
    }),
    ref('sections', 'zero-variance', 'turn', { formulas: false }),
    derivation({
      id: 'informative-group-repair',
      stepIndices: [4],
      title: { zh: '零方差失败迫使训练筛选有信息的回答组', en: 'Zero-variance failure forces training to select informative groups' },
      intro: {
        zh: '当一组回答全对或全错时，标准化无法产生排序信号。动态采样因此先筛掉没有组内差异的题目，再用非对称裁剪等机制处理剩余样本的更新空间。',
        en: 'When every response is correct or every response is wrong, normalization cannot produce ranking evidence. Dynamic sampling filters those groups before asymmetric clipping adjusts the remaining update range.',
      },
    }),
    ref('deepening', 'stability-family', 'topic', { formulas: false }),
    ref('deepening', 'complete-grpo', 'topic'),
    ref('sections', 'group-cost', 'turn', { formulas: false }),
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
    ref('sections', 'tool-errors', 'turn', { formulas: false }),
    ref('sections', 'budget', 'turn', { formulas: false }),
    ref('sections', 'branching', 'section', { formulas: false }),
    experiment(),
    ref('deepening', 'partial-observability', 'topic'),
  ],
  credit: [
    ref('prelude', 'sparse-delay', 'section', { formulas: false }),
    ref('prelude', 'credit-question', 'turn', { formulas: false }),
    ref('sections', 'segmentation', 'turn', { formulas: false }),
    derivation({
      id: 'credit-evidence-ladder',
      stepIndices: [0, 1, 2, 3, 4],
      title: { zh: '每一种更细的信用都引入一种新的证据假设', en: 'Every finer credit signal introduces a new evidence assumption' },
      intro: {
        zh: '从同一条 search→inspect→edit→test→repair 轨迹出发：终局广播只使用任务结果，折扣再加入时间距离，过程奖励加入局部验证，分段优势加入状态基线，事后反事实则需要替代动作及其重放结果。',
        en: 'Start from one search→inspect→edit→test→repair trajectory. Terminal broadcast uses only the task outcome; discount adds temporal distance; process reward adds local verification; segment advantage adds a state baseline; hindsight counterfactuals require an alternative action and replayed outcome.',
      },
    }),
    ref('deepening', 'bias-audit', 'topic'),
    ref('sections', 'curriculum', 'turn', { formulas: false }),
    ref('deepening', 'solution-toolbox', 'topic', { formulas: false }),
    experiment(),
    ref('sections', 'hindsight-risk', 'turn', { formulas: false }),
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
