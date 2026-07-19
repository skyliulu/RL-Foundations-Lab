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
