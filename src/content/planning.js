import { assertFoundationChapterDefinition } from './schema.js'

export const planningPresetConfigs = {
  'early-propagation': { gamma: 0.9, noise: 0, truncation: 3, checkpoint: 3 },
  'vi-endpoint': { gamma: 0.9, noise: 0, truncation: 1, checkpoint: 8 },
  'middle-ground': { gamma: 0.9, noise: 0, truncation: 5, checkpoint: 4 },
  'stochastic-model': { gamma: 0.9, noise: 0.2, truncation: 3, checkpoint: 5 },
}

const sources = [
  { id: 'value-iteration', label: 'L4 · Value iteration derivation, pseudocode, and example', pages: 'PDF pp.5-13', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
  { id: 'policy-iteration', label: 'L4 · Policy evaluation and policy improvement', pages: 'PDF pp.15-29', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
  { id: 'truncated-pi', label: 'L4 · VI, PI, and truncated policy iteration continuum', pages: 'PDF pp.31-38', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
]

const explorer = {
  zh: {
    figureTitle: 'Planning Arena', protocol: '公平比较协议', protocolText: '同一环境、γ、随机性、初始 value、初始 policy 与停止阈值', gamma: '折扣因子 γ', noise: '动作随机性', truncation: '每轮策略评估 sweeps', checkpoint: '查看外层迭代', convergence: '最优 Bellman 残差', backups: '累计 backups', policyChanges: '本轮 policy changes', policyUpdates: '策略更新轮数', finalError: '最终 max |V−V*|', algorithm: '算法', vi: 'Value Iteration', tpi: 'Truncated PI', pi: 'Policy Iteration', viShort: 'VI · 评估 1 次', tpiShort: 'TPI · 评估 j 次', piShort: 'PI · 评估至收敛', propagation: '同一 checkpoint 的价值传播', residualChart: '残差随计算量变化', selectedCheckpoint: '当前检查点', converged: '已收敛', running: '传播中', sameLimit: '三条路径，同一 V*', preset: '观察预设', chartHint: '横轴是累计 backup，而不是外层轮数；这样深度策略评估的成本不会被隐藏。', mapHint: '颜色只表示数值强弱；格内数字和策略箭头提供非颜色证据。', presetItems: {
      'early-propagation': { title: '早期传播', note: '同看第 3 个外层迭代，比较三种评估深度。' },
      'vi-endpoint': { title: 'VI 端点', note: 'TPI 的评估深度设为 1，靠近 value iteration。' },
      'middle-ground': { title: '折中深度', note: '每轮评估 5 次，在频繁改善与深度评估间折中。' },
      'stochastic-model': { title: '随机模型', note: '共享 0.2 动作随机性，比较协议保持不变。' },
    },
  },
  en: {
    figureTitle: 'Planning Arena', protocol: 'Fair comparison protocol', protocolText: 'Same environment, γ, randomness, initial value, initial policy, and stopping tolerance', gamma: 'Discount γ', noise: 'Action randomness', truncation: 'Policy-evaluation sweeps per round', checkpoint: 'Outer iteration checkpoint', convergence: 'Optimal Bellman residual', backups: 'Cumulative backups', policyChanges: 'Policy changes this round', policyUpdates: 'Policy-update rounds', finalError: 'Final max |V−V*|', algorithm: 'Algorithm', vi: 'Value Iteration', tpi: 'Truncated PI', pi: 'Policy Iteration', viShort: 'VI · evaluate once', tpiShort: 'TPI · evaluate j times', piShort: 'PI · evaluate to convergence', propagation: 'Value propagation at one checkpoint', residualChart: 'Residual versus computation', selectedCheckpoint: 'Selected checkpoint', converged: 'Converged', running: 'Propagating', sameLimit: 'Three paths, one V*', preset: 'Observation presets', chartHint: 'The x-axis counts backups rather than outer rounds, so deep policy-evaluation cost is not hidden.', mapHint: 'Color only shows magnitude; cell numbers and policy arrows provide non-color evidence.', presetItems: {
      'early-propagation': { title: 'Early propagation', note: 'Compare all three evaluation depths at outer iteration 3.' },
      'vi-endpoint': { title: 'VI endpoint', note: 'Set TPI evaluation depth to one, near value iteration.' },
      'middle-ground': { title: 'Middle depth', note: 'Five evaluation sweeps balance frequent improvement and deeper evaluation.' },
      'stochastic-model': { title: 'Stochastic model', note: 'Share 0.2 action randomness without changing the protocol.' },
    },
  },
}

export const planningChapter = assertFoundationChapterDefinition({
  id: 'planning',
  sources,
  zh: {
    prerequisite: '前置：Bellman 最优算子、贪心策略与不动点',
    summaryTitle: 'VI、TPI 与 PI 改变的是评估深度，不是最终目标',
    eyebrow: '第 5 章 · Value Iteration 与 Policy Iteration',
    title: '同一个最优 Bellman 不动点，应该先多评估还是先改善策略？',
    intro: 'Value Iteration 每次只做一步价值更新就重新贪心；Policy Iteration 先把当前策略评估到收敛，再做一次改善；Truncated PI 把评估深度 j 放在两者之间。三者求解同一个 V*，但计算花在不同位置。',
    bridge: 'Planning Arena 不只画“残差随外层轮数”的曲线，因为那会把 Policy Iteration 内部的大量 evaluation backups 隐藏掉。下面统一用累计 state backup 作为计算横轴，并同时展示 policy changes 与逐状态传播。',
    figure: '交互图 5.1 · Planning Arena',
    instruction: '改变策略评估深度并拖动 checkpoint，比较计算量、策略改变和价值传播',
    question: '在相同环境与停止标准下，VI、PI 与 Truncated PI 把计算预算分别花在哪里？',
    prelude: [
      { id: 'value-iteration', kicker: '频繁改善', title: 'Value Iteration：每次只向当前贪心策略借一步', paragraphs: ['从任意 v₀ 出发，先基于当前值构造贪心策略，再用它做一步 backup。', '中间的 vₖ 通常不是任何完整策略的真实价值，但 T* 的压缩性保证它最终逼近 V*。'], formulas: ['vₖ₊₁(s) = maxₐ Σₛ′,ᵣ p(s′,r|s,a)[r + γvₖ(s′)]'] },
      { id: 'policy-iteration', kicker: '深度评估', title: 'Policy Iteration：先求清楚当前策略，再改善', paragraphs: ['每一轮先解 vπₖ = Tπₖvπₖ，再对 vπₖ 做一次贪心改善。', '外层轮数往往少，但每轮内部包含许多 evaluation sweeps，因此不能只比较“迭代了几轮”。'], formulas: ['πₖ → evaluate to vπₖ → greedy improve to πₖ₊₁'] },
    ],
    sections: [
      { id: 'truncation-continuum', kicker: '统一视角', title: 'Truncated PI 把两端连成一条连续谱', paragraphs: ['评估一次接近 Value Iteration；评估到收敛就是 Policy Iteration；有限 j 则位于中间。', 'j 不是越大越好：深度评估减少外层策略更新，却增加每轮 backups。'], formula: 'j = 1  ←  Truncated PI  →  j = ∞' },
      { id: 'fair-budget', kicker: '比较边界', title: '公平比较必须显式计算内部 backups', paragraphs: ['外层 iteration、evaluation sweep 和 state backup 是不同粒度的成本。', '本章以 25 个状态各更新一次记作 25 backups，并同时记录策略改变数量，避免单一全局残差替代算法机制。'], formula: 'compute = Σ outer rounds × evaluation sweeps × |S|' },
      { id: 'model-free-transfer', kicker: '迁移到下一部分', title: 'Part I 的算法都假设环境模型已知', paragraphs: ['VI、PI 和 TPI 的每次 backup 都显式求和 p(s′,r|s,a)。', '进入 Part II 后，环境模型不再可查询；同一个期望 target 将由完整 episode 或单步样本近似。'], formula: 'exact expectation → sampled return / sampled TD target' },
    ],
    summary: ['VI 每轮做一步评估并频繁改善策略；PI 深度评估后再改善。', 'TPI 用有限评估深度连接两者，评估深度决定计算在内外循环间的分配。', '三种方法在相同模型和折扣下收敛到同一个最优价值不动点。'],
    explorer: explorer.zh,
  },
  en: {
    prerequisite: 'Prerequisites: Bellman optimality operator, greedy policy, and fixed points',
    summaryTitle: 'VI, TPI, and PI change evaluation depth—not the final objective',
    eyebrow: 'Chapter 5 · Value Iteration and Policy Iteration',
    title: 'For the same optimal Bellman fixed point, should we evaluate longer or improve sooner?',
    intro: 'Value Iteration takes one value step before becoming greedy again. Policy Iteration evaluates the current policy to convergence before one improvement. Truncated PI places evaluation depth j between them. All solve the same V*, but spend computation in different places.',
    bridge: 'Planning Arena does not plot residual against outer iterations alone, because that would hide the many evaluation backups inside Policy Iteration. Cumulative state backups form the shared compute axis, while policy changes and state-by-state propagation remain visible.',
    figure: 'Interactive figure 5.1 · Planning Arena',
    instruction: 'Change evaluation depth and scrub the checkpoint to compare computation, policy changes, and propagation',
    question: 'Under one environment and stopping rule, where do VI, PI, and Truncated PI spend their compute?',
    prelude: [
      { id: 'value-iteration', kicker: 'Improve frequently', title: 'Value Iteration borrows one step from the current greedy policy', paragraphs: ['Starting from any v₀, form a greedy policy from current values and take one backup with it.', 'Intermediate vₖ is usually not the true value of any complete policy, but contraction of T* drives it toward V*.'], formulas: ['vₖ₊₁(s) = maxₐ Σₛ′,ᵣ p(s′,r|s,a)[r + γvₖ(s′)]'] },
      { id: 'policy-iteration', kicker: 'Evaluate deeply', title: 'Policy Iteration solves the current policy before improving it', paragraphs: ['Each round first solves vπₖ = Tπₖvπₖ and then makes one greedy improvement.', 'Outer rounds may be few, but each contains many evaluation sweeps, so round counts alone are not comparable.'], formulas: ['πₖ → evaluate to vπₖ → greedy improve to πₖ₊₁'] },
    ],
    sections: [
      { id: 'truncation-continuum', kicker: 'Unified view', title: 'Truncated PI connects the two endpoints', paragraphs: ['One evaluation sweep approaches Value Iteration; evaluation to convergence is Policy Iteration; finite j lies between them.', 'Larger j is not automatically better: it reduces outer policy updates but increases backups per round.'], formula: 'j = 1  ←  Truncated PI  →  j = ∞' },
      { id: 'fair-budget', kicker: 'Comparison boundary', title: 'Fair comparison must expose internal backups', paragraphs: ['Outer iterations, evaluation sweeps, and state backups are different cost granularities.', 'This chapter counts one update of each of 25 states as 25 backups and records policy changes alongside residual, so one global curve cannot replace the mechanism.'], formula: 'compute = Σ outer rounds × evaluation sweeps × |S|' },
      { id: 'model-free-transfer', kicker: 'Transfer to the next part', title: 'Every Part I algorithm assumes a known environment model', paragraphs: ['Every VI, PI, and TPI backup explicitly sums over p(s′,r|s,a).', 'In Part II the model is no longer queryable; complete episodes or one-step samples approximate the same expected target.'], formula: 'exact expectation → sampled return / sampled TD target' },
    ],
    summary: ['VI takes one evaluation step and improves frequently; PI evaluates deeply before improving.', 'TPI connects them with finite evaluation depth, allocating computation between inner and outer loops.', 'Under the same model and discount, all three converge to the same optimal value fixed point.'],
    explorer: explorer.en,
  },
})
