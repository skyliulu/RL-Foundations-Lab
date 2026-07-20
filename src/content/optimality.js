import { START } from '../engine/gridworld.js'
import { assertFoundationChapterDefinition } from './schema.js'

export const optimalityPresetConfigs = {
  'operator-switch': { selected: START, gamma: 0.9, noise: 0, forbiddenReward: -1, operator: 'policy' },
  'risk-taking': { selected: { row: 2, col: 1 }, gamma: 0.9, noise: 0, forbiddenReward: -1, operator: 'optimal' },
  'short-horizon': { selected: { row: 2, col: 1 }, gamma: 0.5, noise: 0, forbiddenReward: -1, operator: 'optimal' },
  'strong-penalty': { selected: { row: 2, col: 1 }, gamma: 0.9, noise: 0, forbiddenReward: -10, operator: 'optimal' },
}

const sources = [
  { id: 'action-improvement', label: 'L3 · Five action values and policy improvement', pages: 'PDF pp.6-10', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
  { id: 'boe-max', label: 'L3 · Bellman optimality equation and right-hand maximization', pages: 'PDF pp.14-23', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
  { id: 'optimal-policy', label: 'L3 · Fixed point, greedy optimal policy, and reward analysis', pages: 'PDF pp.25-45', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
]

const explorer = {
  zh: {
    policyMode: '评估固定策略', optimalMode: '寻找最优动作', policyOperator: 'Bellman 期望算子 Tπ', optimalOperator: 'Bellman 最优算子 T*', sameSnapshot: '五个动作使用同一张后继价值快照', selectedState: '当前状态', fixedAction: '策略指定动作', greedyAction: '最大动作', actionCompetition: '五动作竞争', target: '一步 target', gap: '相对固定策略提升', gamma: '折扣因子 γ', noise: '动作随机性', forbiddenReward: '禁区奖励', preset: '观察预设', valueMap: '当前价值快照', policyValue: 'Vπ', optimalValue: 'V*', policyGap: '最优性差距', chosen: '当前算子选择', tied: '并列最优', courseWorld: '共享网格世界', clickState: '点击格子检查该状态的五个动作', expectationFormula: '按 π(a|s) 加权', maxFormula: '对 q(s,a) 取最大', solveNote: '切换算子时，比较的是同一环境、同一 γ 与同一随机性。', applyBackup: '执行一次 backup', undo: '撤销', resetSnapshot: '恢复 Vπ 快照', before: '更新前', residual: '最优性残差', rewardUnit: 'reward', actionLabels: { up: '上', right: '右', down: '下', left: '左', stay: '停留' }, presetItems: {
      'operator-switch': { title: '期望 → 最大', note: '固定同一价值快照，只改变右侧的动作选择规则。' },
      'risk-taking': { title: '基线会冒险', note: 'γ=0.9、禁区 −1 时，最优策略可能穿过禁区。' },
      'short-horizon': { title: '短视会绕开', note: 'γ=0.5 降低远期目标奖励的吸引力。' },
      'strong-penalty': { title: '重罚会绕开', note: '禁区惩罚改为 −10，最优动作发生改变。' },
    },
  },
  en: {
    policyMode: 'Evaluate fixed policy', optimalMode: 'Find optimal action', policyOperator: 'Bellman expectation operator Tπ', optimalOperator: 'Bellman optimality operator T*', sameSnapshot: 'All five actions use the same successor-value snapshot', selectedState: 'Selected state', fixedAction: 'Policy action', greedyAction: 'Maximum action', actionCompetition: 'Five-action competition', target: 'One-step target', gap: 'Gain over fixed policy', gamma: 'Discount γ', noise: 'Action randomness', forbiddenReward: 'Forbidden reward', preset: 'Observation presets', valueMap: 'Current value snapshot', policyValue: 'Vπ', optimalValue: 'V*', policyGap: 'Optimality gap', chosen: 'Chosen by operator', tied: 'Tied optimum', courseWorld: 'Shared grid world', clickState: 'Click a cell to inspect its five actions', expectationFormula: 'Weight by π(a|s)', maxFormula: 'Take max over q(s,a)', solveNote: 'Operator comparisons share the same environment, γ, and randomness.', applyBackup: 'Apply one backup', undo: 'Undo', resetSnapshot: 'Restore Vπ snapshot', before: 'Before', residual: 'Optimality residual', rewardUnit: 'reward', actionLabels: { up: 'Up', right: 'Right', down: 'Down', left: 'Left', stay: 'Stay' }, presetItems: {
      'operator-switch': { title: 'Expectation → max', note: 'Hold one value snapshot fixed and change only the action-selection rule.' },
      'risk-taking': { title: 'Baseline takes risks', note: 'With γ=0.9 and forbidden −1, the optimum may cross a forbidden cell.' },
      'short-horizon': { title: 'Short horizon detours', note: 'γ=0.5 weakens the attraction of distant target rewards.' },
      'strong-penalty': { title: 'Strong penalty detours', note: 'Changing the forbidden penalty to −10 changes the optimal action.' },
    },
  },
}

const optimalityDerivationZh = [
  { id: 'policy-action-value', rule: '先写出给定策略的状态价值', latex: String.raw`V^{\pi}(s)=\sum_a\pi(a\mid s)Q^{\pi}(s,a)`, short: '固定策略时，状态价值是动作价值的概率加权平均。', detail: '策略 π 给出每个动作的概率；这些概率非负且和为 1，所以 Vπ(s) 是各个 Qπ(s,a) 的凸组合。此处仍在评价一套给定策略。', assumptions: [String.raw`\pi(a\mid s)\ge0`, String.raw`\sum_a\pi(a\mid s)=1`], symbols: [[String.raw`Q^{\pi}(s,a)`, '先执行 a、随后遵循 π 的期望回报']] },
  { id: 'optimize-policy', rule: '把策略也放进最大化', latex: String.raw`V^*(s)\coloneqq\max_\pi V^{\pi}(s)=\max_\pi\sum_a\pi(a\mid s)Q^*(s,a)`, short: '最优价值是在所有策略中可达到的最大状态价值。', detail: '寻找最优策略时，不再把 π 当作已知输入。Q* 表示第一步固定动作后，余下过程都采用最优决策时的回报。', assumptions: ['有限动作集合'], symbols: [[String.raw`V^*(s)`, '最优状态价值'], [String.raw`Q^*(s,a)`, '最优动作价值']] },
  { id: 'convex-max', rule: '凸组合的最大值由单个最大动作达到', latex: String.raw`\max_\pi\sum_a\pi(a\mid s)Q^*(s,a)=\max_a Q^*(s,a)`, short: '随机混合不会超过其中最大的动作价值。', detail: '任何概率加权平均都不超过最大分量；把概率 1 放在任意 arg max 动作上即可达到上界。因此至少存在一个确定性贪心最优策略。', assumptions: [String.raw`\sum_a\pi(a\mid s)=1`], symbols: [[String.raw`\operatorname*{arg\,max}_a`, '所有达到最大值的动作集合']] },
  { id: 'expand-q-star', rule: '展开最优动作价值的一步递推', latex: String.raw`Q^*(s,a)=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^*(s')\right]`, short: '固定第一步动作后，对环境可能响应取期望。', detail: '执行 a 后，环境产生奖励 r 与后继状态 s′；从 s′ 开始的余下决策已经包含在 V*(s′) 中。', assumptions: ['状态具有马尔可夫性', String.raw`0\le\gamma<1`], symbols: [[String.raw`p(s',r\mid s,a)`, '环境的后继与奖励分布']] },
  { id: 'optimality-equation', rule: '代回得到 Bellman 最优方程', latex: String.raw`\boxed{V^*(s)=\max_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^*(s')\right]}`, short: '每个状态的最优价值等于最好的一步 target。', detail: '把动作价值的一步展开代回对动作取最大值的关系。这个非线性方程的唯一不动点是 V*；对其逐状态取 arg max 可恢复最优策略。', assumptions: [String.raw`0\le\gamma<1`], symbols: [[String.raw`T^*`, 'Bellman 最优算子']] },
]

const optimalityDerivationEn = [
  { id: 'policy-action-value', rule: 'Write state value for a given policy', latex: String.raw`V^{\pi}(s)=\sum_a\pi(a\mid s)Q^{\pi}(s,a)`, short: 'With policy fixed, state value is a probability-weighted action value.', detail: 'Policy probabilities are nonnegative and sum to one, so Vπ(s) is a convex combination of action values. This still evaluates a given policy.', assumptions: [String.raw`\pi(a\mid s)\ge0`, String.raw`\sum_a\pi(a\mid s)=1`], symbols: [[String.raw`Q^{\pi}(s,a)`, 'return after a then following π']] },
  { id: 'optimize-policy', rule: 'Place the policy inside the maximization', latex: String.raw`V^*(s)\coloneqq\max_\pi V^{\pi}(s)=\max_\pi\sum_a\pi(a\mid s)Q^*(s,a)`, short: 'Optimal value is the largest state value attainable by any policy.', detail: 'The policy is now unknown. Q* evaluates the fixed first action followed by optimal decisions.', assumptions: ['Finite action set'], symbols: [[String.raw`V^*(s)`, 'optimal state value'], [String.raw`Q^*(s,a)`, 'optimal action value']] },
  { id: 'convex-max', rule: 'A convex combination is maximized by a largest component', latex: String.raw`\max_\pi\sum_a\pi(a\mid s)Q^*(s,a)=\max_a Q^*(s,a)`, short: 'Random mixing cannot exceed the largest action value.', detail: 'Every weighted average is at most its largest member. Assigning probability one to an arg max action reaches the bound, so a deterministic greedy optimum exists.', assumptions: [String.raw`\sum_a\pi(a\mid s)=1`], symbols: [[String.raw`\operatorname*{arg\,max}_a`, 'set of maximizing actions']] },
  { id: 'expand-q-star', rule: 'Expand optimal action value by one step', latex: String.raw`Q^*(s,a)=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^*(s')\right]`, short: 'Fix the first action and average the environment responses.', detail: 'After action a, the environment produces r and s′; all optimal decisions after s′ are summarized by V*(s′).', assumptions: ['The state is Markov', String.raw`0\le\gamma<1`], symbols: [[String.raw`p(s',r\mid s,a)`, 'successor-reward distribution']] },
  { id: 'optimality-equation', rule: 'Substitute to obtain the Bellman optimality equation', latex: String.raw`\boxed{V^*(s)=\max_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^*(s')\right]}`, short: 'Optimal state value equals the best one-step target.', detail: 'Substitute the one-step action value into the max relation. Its unique fixed point is V*, and a statewise arg max recovers an optimal policy.', assumptions: [String.raw`0\le\gamma<1`], symbols: [[String.raw`T^*`, 'Bellman optimality operator']] },
]

const optimalityDeepeningZh = [
  {
    id: 'contraction-proof', kicker: '为什么能求解', title: '最大值是非线性的，但 Bellman 最优算子仍然压缩误差',
    paragraphs: ['最优方程含 max，不能像固定策略那样直接写成一个线性矩阵逆。关键不在于线性，而在于两个基本不等式：最大值之差不超过逐动作差的最大值；概率加权平均不放大最大范数。', '因此对任意两个价值函数 U、V，T*U 与 T*V 的距离至多是 γ 倍。反复应用 T* 会让不同初值之间的差异几何衰减。'],
    formulas: [String.raw`|\max_a x_a-\max_a y_a|\le\max_a|x_a-y_a|`, String.raw`\|T^*U-T^*V\|_{\infty}\le\gamma\|U-V\|_{\infty}`],
    theorem: { claim: 'Bellman 最优算子在最大范数下是 γ-压缩映射。', why: 'max 只选择分量，环境概率只做凸组合；唯一可能放大或缩小未来差异的系数是 γ。', conditions: [String.raw`0\le\gamma<1`, String.raw`\sum_{s',r}p(s',r\mid s,a)=1`] },
    handoff: '压缩性同时给出三个结果：V* 存在、V* 唯一，并且从任意有界初值反复更新都能逼近它。',
  },
  {
    id: 'greedy-policy-proof', kicker: '从价值恢复策略', title: '为什么对 V* 贪心就一定得到最优策略？',
    paragraphs: ['令 πg 在每个状态选择使 T*V*(s) 达到最大值的动作。对这套策略，策略算子 Tπg 在 V* 上与 T* 完全相同，因此 V* 也是 Tπg 的不动点。', '固定策略的 Bellman 算子只有一个不动点，所以 Vπg=V*。这一步把“局部逐状态贪心”与“全局长期最优”连接起来。'],
    formulas: [String.raw`T^{\pi_g}V^*=T^*V^*=V^*`, String.raw`V^{\pi_g}=V^*\quad\Longrightarrow\quad \pi_g\ \text{is optimal}`],
    theorem: { claim: '由 V* 提取的任意贪心策略都是最优策略。', why: '该策略让 V* 同时成为自己的 Bellman 不动点，而固定策略的不动点唯一。', conditions: [String.raw`\pi_g(s)\in\operatorname*{arg\,max}_a q_{V^*}(s,a)`] },
  },
  {
    id: 'reward-transformations', kicker: '反事实 · 奖励变换', title: '哪些奖励变换只改数值，哪些会改最优策略？',
    paragraphs: ['把所有奖励乘以正数 c，会把所有 return、V* 和 Q* 同比例缩放，动作排序不变。持续型任务中给每一步都加常数 b，会把所有策略价值平移 b/(1−γ)，动作排序仍不变。', '但只修改禁区、目标或某条路径的奖励并不是全局仿射变换，它会改变动作间相对差异；改变 γ 也会重新权衡短路与远期收益。因此 detour 是否值得必须通过完整 return 比较，而不能只看路径长度。'],
    formulas: [String.raw`r'=cr\ (c>0)\quad\Longrightarrow\quad Q'^*=cQ^*`, String.raw`r'=r+b\quad\Longrightarrow\quad Q'^*=Q^*+\frac{b}{1-\gamma}`],
    example: { title: '策略是否保持', caption: '只有对所有转移一致施加的正比例或常数平移保证排序不变。', headers: ['变化', 'Q* 变化', '最优动作'], rows: [['全部奖励 ×2', '全部 ×2', '保持'], ['每一步全部 +1', '全部 +1/(1−γ)', '保持'], ['仅禁区 −1→−10', '局部改变', '可能改变'], ['γ 0.9→0.5', '远期权重改变', '可能改变']] },
  },
]

const optimalityDeepeningEn = [
  {
    id: 'contraction-proof', kicker: 'Why it is solvable', title: 'The max is nonlinear, yet the Bellman optimality operator still contracts error',
    paragraphs: ['The optimality equation contains max and therefore lacks the simple linear inverse of policy evaluation. What matters is that the difference between maxima is bounded by the largest componentwise difference, while probability averaging does not expand the maximum norm.', 'For any U and V, the distance between T*U and T*V is at most γ times the original distance. Repeated application geometrically removes dependence on initialization.'],
    formulas: [String.raw`|\max_a x_a-\max_a y_a|\le\max_a|x_a-y_a|`, String.raw`\|T^*U-T^*V\|_{\infty}\le\gamma\|U-V\|_{\infty}`],
    theorem: { claim: 'The Bellman optimality operator is a γ-contraction under the maximum norm.', why: 'Max selects components and environment probabilities form convex combinations; only γ scales future differences.', conditions: [String.raw`0\le\gamma<1`, String.raw`\sum_{s',r}p(s',r\mid s,a)=1`] },
    handoff: 'Contraction gives existence, uniqueness, and convergence of fixed-point iteration from any bounded start.',
  },
  {
    id: 'greedy-policy-proof', kicker: 'Recover a policy from value', title: 'Why is a policy greedy with respect to V* globally optimal?',
    paragraphs: ['Let πg choose an action attaining T*V*(s) in every state. Its policy operator then agrees with the optimality operator on V*, so V* is also a fixed point of Tπg.', 'A fixed-policy Bellman operator has only one fixed point; therefore Vπg=V*. This links local statewise greediness to global long-term optimality.'],
    formulas: [String.raw`T^{\pi_g}V^*=T^*V^*=V^*`, String.raw`V^{\pi_g}=V^*\quad\Longrightarrow\quad \pi_g\ \text{is optimal}`],
    theorem: { claim: 'Every policy greedy with respect to V* is optimal.', why: 'It makes V* its own Bellman fixed point, and fixed-policy value is unique.', conditions: [String.raw`\pi_g(s)\in\operatorname*{arg\,max}_a q_{V^*}(s,a)`] },
  },
  {
    id: 'reward-transformations', kicker: 'Counterfactual · Reward transforms', title: 'Which reward changes preserve the policy, and which can reverse it?',
    paragraphs: ['Multiplying every reward by c>0 scales every return and action value equally. Adding b to every step in a continuing task shifts all values by b/(1−γ). Both preserve action ordering.', 'Changing only forbidden or target rewards is not a global affine transform and can alter relative action values. Changing γ also reweights detours against delayed gains.'],
    formulas: [String.raw`r'=cr\ (c>0)\quad\Longrightarrow\quad Q'^*=cQ^*`, String.raw`r'=r+b\quad\Longrightarrow\quad Q'^*=Q^*+\frac{b}{1-\gamma}`],
    example: { title: 'Does the policy remain?', caption: 'Only globally uniform positive scaling or shifting guarantees unchanged ordering.', headers: ['Change', 'Q* change', 'Optimal action'], rows: [['All rewards ×2', 'All ×2', 'Preserved'], ['Every step +1', 'All +1/(1−γ)', 'Preserved'], ['Forbidden −1→−10 only', 'Local change', 'May change'], ['γ 0.9→0.5', 'Future reweighted', 'May change']] },
  },
]

export const optimalityChapter = assertFoundationChapterDefinition({
  id: 'optimality',
  sources,
  zh: {
    prerequisite: '前置：状态价值、动作价值与 Bellman 期望方程',
    summaryTitle: '最优性不是另一个环境，而是对五个动作进行同场竞争',
    eyebrow: '第 4 章 · Bellman 最优方程与最优策略',
    title: '从评价当前策略到寻找最优策略，方程右侧改变了什么？',
    intro: 'Bellman 期望方程假定策略 π 已知，并按 π(a|s) 汇总动作价值；Bellman 最优方程把策略也变成未知量。因为概率权重和为 1，右侧最大化最终等价于选择最大的 q(s,a)。',
    bridge: '下面在同一个 5×5 世界、同一个状态和同一张后继价值快照上计算五个动作的 target。切换算子时，环境模型没有改变；改变的只是“服从当前策略”还是“选择最大动作价值”。',
    experimentIntro: '下面固定环境、状态与后继价值，只切换聚合规则。先检查五个动作各自的一步 target，再比较策略加权结果与最大动作结果。',
    interpretation: '若两种算子给出相同结果，只能说明当前策略恰好选择了最大动作；它们回答的问题仍不同。出现并列最大时，V* 保持唯一，但可对应多个最优动作。',
    derivation: optimalityDerivationZh,
    deepening: optimalityDeepeningZh,
    figure: '交互图 4.1 · Optimality Switch',
    instruction: '选择状态并切换算子，观察固定策略动作与最大动作何时分离',
    question: '为什么 maxπ Σa π(a|s)q(s,a) 最终可以化成 maxa q(s,a)？',
    prelude: [
      { id: 'evaluation-control', kicker: '两个不同问题', title: '策略评估问“这套策略值多少”', paragraphs: ['当 π 固定时，状态 s 的价值由 π 在各动作上的概率和环境响应共同决定。', '确定性固定策略只选择一个动作，因此期望算子在该状态上读取这个动作的 qπ(s,a)。'], formulas: [String.raw`T^{\pi}V(s)=\sum_a\pi(a\mid s)\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V(s')\right]`] },
      { id: 'max-reduction', kicker: '把策略也纳入优化', title: '最优性问“哪一个动作能给出最大 target”', paragraphs: ['任何随机策略产生的值都是各动作 q 的凸组合，不可能超过其中最大的一个。', '因此最大值可由确定性贪心策略达到：把概率 1 放在 arg max 动作上。'], formulas: [String.raw`T^*V(s)=\max_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V(s')\right]`] },
    ],
    sections: [
      { id: 'fixed-point-optimality', kicker: '存在、唯一与最优', title: '最优算子的不动点就是 V*', paragraphs: ['当 0 < γ < 1 时，Bellman 最优算子仍是压缩映射，因此存在唯一不动点。', '对这个 V* 逐状态取贪心动作，就得到至少一个确定性最优策略。'], formula: String.raw`V^*=T^*V^*,\qquad \pi^*(s)\in\operatorname*{arg\,max}_a q^*(s,a)` },
      { id: 'reward-horizon', kicker: '策略为何改变', title: '环境、奖励与 γ 共同决定最优动作', paragraphs: ['在基准参数下，远期反复进入目标的收益可能值得承受一次禁区 −1；这不是“最优策略喜欢风险”，而是累计回报的比较结果。', '缩短时间尺度或把禁区惩罚改为 −10，都可能让同一状态的最大动作改变。'], formula: String.raw`q^*(s,a)=\mathbb{E}\!\left[R_{t+1}+\gamma V^*(S_{t+1})\mid S_t=s,A_t=a\right]` },
      { id: 'ties-transfer', kicker: '边界与迁移', title: '最优策略可以不唯一，最优价值仍唯一', paragraphs: ['若多个动作拥有相同最大 q 值，它们都可进入最优策略；确定性选择只是其中一种实现。', '下一章将把 T* 反复作用于整张价值表，并比较 Value Iteration 与 Policy Iteration 怎样到达同一不动点。'], formula: String.raw`\operatorname*{arg\,max}_a q^*(s,a)\ \text{may contain multiple actions}` },
    ],
    summary: ['策略评估固定 π；最优控制在每个状态比较全部动作。', '概率加权的凸组合不超过最大动作价值，因此最优策略可取确定性贪心形式。', 'V* 唯一，但并列最大动作可能产生多个最优策略。'],
    explorer: explorer.zh,
  },
  en: {
    prerequisite: 'Prerequisites: state value, action value, and the Bellman expectation equation',
    summaryTitle: 'Optimality is not a new environment; it is a fair competition among five actions',
    eyebrow: 'Chapter 4 · Bellman optimality equation and optimal policy',
    title: 'What changes on the right-hand side when evaluation becomes optimization?',
    intro: 'The Bellman expectation equation assumes policy π is known and aggregates action values with π(a|s). The Bellman optimality equation makes the policy unknown too. Because the action probabilities sum to one, right-hand maximization reduces to selecting the largest q(s,a).',
    bridge: 'The switch computes all five action targets in the same 5×5 world, at the same state, from the same successor-value snapshot. Toggling the operator does not change the environment; it changes whether the update follows the current policy or selects the maximum action value.',
    experimentIntro: 'Hold the environment, state, and successor values fixed. Inspect all five one-step targets before comparing policy weighting with action maximization.',
    interpretation: 'Equal outputs only mean the current policy happens to select a maximizing action; the operators still answer different questions. Ties preserve a unique V* while allowing multiple optimal actions.',
    derivation: optimalityDerivationEn,
    deepening: optimalityDeepeningEn,
    figure: 'Interactive figure 4.1 · Optimality Switch',
    instruction: 'Choose a state and toggle the operator to see when the fixed action and maximum action separate',
    question: 'Why does maxπ Σa π(a|s)q(s,a) reduce to maxa q(s,a)?',
    prelude: [
      { id: 'evaluation-control', kicker: 'Two different questions', title: 'Policy evaluation asks what this policy is worth', paragraphs: ['With π fixed, the value of state s is determined jointly by its action probabilities and the environment response.', 'A deterministic fixed policy selects one action, so its expectation operator reads that action’s qπ(s,a).'], formulas: [String.raw`T^{\pi}V(s)=\sum_a\pi(a\mid s)\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V(s')\right]`] },
      { id: 'max-reduction', kicker: 'Optimize the policy too', title: 'Optimality asks which action produces the largest target', paragraphs: ['Any stochastic policy produces a convex combination of action q values and cannot exceed the largest member.', 'A deterministic greedy policy reaches the maximum by assigning probability one to an arg max action.'], formulas: [String.raw`T^*V(s)=\max_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V(s')\right]`] },
    ],
    sections: [
      { id: 'fixed-point-optimality', kicker: 'Existence, uniqueness, optimality', title: 'The fixed point of the optimality operator is V*', paragraphs: ['For 0 < γ < 1, the Bellman optimality operator remains a contraction and therefore has one fixed point.', 'Choosing a greedy action from V* in every state yields at least one deterministic optimal policy.'], formula: String.raw`V^*=T^*V^*,\qquad \pi^*(s)\in\operatorname*{arg\,max}_a q^*(s,a)` },
      { id: 'reward-horizon', kicker: 'Why policies change', title: 'Environment, rewards, and γ jointly determine the optimum', paragraphs: ['Under the baseline parameters, repeatedly entering the target may justify one forbidden-cell penalty. This is not an intrinsic preference for risk; it is a return comparison.', 'A shorter horizon or a −10 forbidden penalty can change the maximizing action in the same state.'], formula: String.raw`q^*(s,a)=\mathbb{E}\!\left[R_{t+1}+\gamma V^*(S_{t+1})\mid S_t=s,A_t=a\right]` },
      { id: 'ties-transfer', kicker: 'Boundary and transfer', title: 'Optimal policies may be non-unique even though optimal value is unique', paragraphs: ['If several actions share the largest q value, each can belong to an optimal policy. A deterministic choice is only one realization.', 'The next chapter repeatedly applies T* to the whole value table and compares how Value Iteration and Policy Iteration reach the same fixed point.'], formula: String.raw`\operatorname*{arg\,max}_a q^*(s,a)\ \text{may contain multiple actions}` },
    ],
    summary: ['Policy evaluation fixes π; optimal control compares every action in each state.', 'A probability-weighted convex combination cannot exceed the largest action value, so a deterministic greedy policy can be optimal.', 'V* is unique, while tied maximizing actions can induce multiple optimal policies.'],
    explorer: explorer.en,
  },
})
