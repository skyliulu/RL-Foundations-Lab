import { GOAL, START } from '../engine/gridworld.js'
import { assertFoundationChapterDefinition } from './schema.js'

export const returnPresetConfigs = {
  'course-baseline': { start: START, gamma: 0.9, noise: 0, sampleCount: 8, mode: 'trajectory' },
  'near-sighted': { start: START, gamma: 0.4, noise: 0, sampleCount: 8, mode: 'trajectory' },
  'stochastic-value': { start: START, gamma: 0.9, noise: 0.3, sampleCount: 32, mode: 'value' },
  'continuing-target': { start: GOAL, gamma: 0.9, noise: 0, sampleCount: 8, mode: 'trajectory' },
}

const sources = [
  {
    id: 'trajectory-return',
    label: 'L1 · Trajectory, return, and policy comparison',
    pages: 'PDF pp.19-21',
    href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning',
  },
  {
    id: 'discount-continuing',
    label: 'L1 · Discounted return, episodic and continuing tasks',
    pages: 'PDF pp.22-25',
    href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning',
  },
  {
    id: 'state-value',
    label: 'L2 · Return as a random variable and state value as expectation',
    pages: 'PDF pp.16-19',
    href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning',
  },
]

const explorer = {
  zh: {
    modeTrajectory: '回报分解', modeValue: '价值估计', gamma: '折扣因子 γ', noise: '动作随机性', sampleCount: '轨迹样本数', exact: '精确 Vπ(s)', estimate: '样本均值', error: '估计误差', selectedRun: '当前样本', seed: 'seed', contribution: '折扣贡献', immediateReward: '即时奖励', discountWeight: '折扣权重', runningReturn: '累计 G₀', remainingBound: '截断尾项上界', visibleSteps: '显示前 14 步；完整数值计算 120 步', stateValue: '状态价值', return: '单条回报', trajectoryTape: 'Episode Tape', valueLens: 'Value Lens', chooseState: '点击状态改变起点', fixedPolicy: '课件固定策略 π', courseBaseline: '课件基线', websiteExtension: '网站扩展', deterministic: '确定性：一条轨迹就是全部可能', stochastic: '随机性：一次 return 只是一个样本', sampleAxis: '样本编号', valueAxis: 'return / value', runningMean: '运行均值', exactLine: '精确期望', clickSample: '点击样本点查看它对应的轨迹', noRewardYet: '这一段还没有奖励，但它仍会推迟未来奖励的折扣权重。', preset: '观察预设', startState: '起始状态', targetContinuing: '目标状态继续产生 +1，不是 terminal', reset: '恢复课件基线', statePrefix: 's', rewardPrefix: 'r', probability: '分支概率', tailNote: '尾项没有被偷偷忽略：右侧明确显示最坏情况下的剩余上界。', presetItems: {
      'course-baseline': { title: '课件基线', note: '确定性策略下，单条 return 与精确 value 重合。' },
      'near-sighted': { title: '短视折扣', note: 'γ 变小后，远处的 +1 对起点影响迅速衰减。' },
      'stochastic-value': { title: '从样本到期望', note: '同一起点产生不同 return，运行均值逐步靠近 Vπ(s)。' },
      'continuing-target': { title: '持续型目标', note: '从目标出发仍会继续交互，得到 1 + γ + γ² + …。' },
    },
  },
  en: {
    modeTrajectory: 'Return decomposition', modeValue: 'Value estimate', gamma: 'Discount γ', noise: 'Action randomness', sampleCount: 'Trajectory samples', exact: 'Exact Vπ(s)', estimate: 'Sample mean', error: 'Estimation error', selectedRun: 'Selected sample', seed: 'seed', contribution: 'Discounted contribution', immediateReward: 'Immediate reward', discountWeight: 'Discount weight', runningReturn: 'Cumulative G₀', remainingBound: 'Truncated-tail bound', visibleSteps: 'First 14 steps shown; numbers use 120 steps', stateValue: 'State value', return: 'Single return', trajectoryTape: 'Episode Tape', valueLens: 'Value Lens', chooseState: 'Click a state to change the start', fixedPolicy: 'Course fixed policy π', courseBaseline: 'Course baseline', websiteExtension: 'Site extension', deterministic: 'Deterministic: one trajectory is the full possibility set', stochastic: 'Stochastic: one return is only one sample', sampleAxis: 'Sample index', valueAxis: 'return / value', runningMean: 'Running mean', exactLine: 'Exact expectation', clickSample: 'Click a sample point to inspect its trajectory', noRewardYet: 'This segment has no reward yet, but it still delays and discounts future rewards.', preset: 'Observation presets', startState: 'Start state', targetContinuing: 'The target keeps producing +1 and is not terminal', reset: 'Restore course baseline', statePrefix: 's', rewardPrefix: 'r', probability: 'Branch probability', tailNote: 'The tail is not silently discarded: the worst-case remaining bound is shown explicitly.', presetItems: {
      'course-baseline': { title: 'Course baseline', note: 'Under a deterministic policy, one return equals the exact value.' },
      'near-sighted': { title: 'Short horizon', note: 'With smaller γ, the distant +1 quickly loses influence at the start.' },
      'stochastic-value': { title: 'Samples to expectation', note: 'The same start yields different returns; the running mean approaches Vπ(s).' },
      'continuing-target': { title: 'Continuing target', note: 'Starting at the target still continues: 1 + γ + γ² + ….' },
    },
  },
}

export const returnChapter = assertFoundationChapterDefinition({
  id: 'returns',
  sources,
  zh: {
    prerequisite: '前置：状态、动作、奖励、策略与轨迹',
    summaryTitle: 'return 属于一条未来；value 是所有可能未来的平均',
    eyebrow: '第 2 章 · Return、折扣与 State Value',
    title: '为什么一次即时奖励不能说明一个状态的长期好坏？',
    intro: '奖励只描述一次转移，return 才把一条轨迹上的未来奖励合在一起；当策略或环境带有随机性，同一起点会产生许多不同 return，它们的条件期望才是状态价值 Vπ(s)。',
    bridge: '下面继续使用第 01 章的 5×5 课程世界与固定策略。先把一条轨迹的每个奖励乘上 γ 的时间权重，再切换到 Value Lens，观察样本均值如何逼近同一环境模型计算出的精确期望。',
    figure: '交互图 2.1 · Return Observatory',
    instruction: '改变 γ、随机性和样本数；先看一条轨迹，再看多条未来的平均',
    question: '同一个起始状态，为什么会同时对应许多 return，却只有一个 Vπ(s)？',
    prelude: [
      { id: 'reward-to-return', kicker: '沿时间累加', title: '即时奖励只回答“刚才发生了什么”', paragraphs: ['一条策略可能先绕行、受罚，随后长期得到正奖励。只看第一步 rₜ₊₁ 无法比较这两种未来。', 'Return Gₜ 把从当前时刻之后的奖励放在同一条时间轴上；γᵏ 是第 k 步奖励抵达当前时刻时的权重。'], formulas: ['Gₜ = Rₜ₊₁ + γRₜ₊₂ + γ²Rₜ₊₃ + ⋯'] },
      { id: 'return-to-value', kicker: '从样本到期望', title: '一条 return 是结果，state value 是分布的均值', paragraphs: ['当 π(a|s) 或环境转移带有随机性，从同一状态出发会得到不同轨迹与不同 Gₜ。', 'Vπ(s) 对这些可能回报取条件期望。确定性世界里只有一条未来，因此 return 与 value 才会数值相同。'], formulas: ['Vπ(s) = Eπ,p[Gₜ | Sₜ = s]'] },
    ],
    sections: [
      { id: 'discount-boundary', kicker: '边界案例', title: 'γ 既让无穷和有限，也定义时间尺度', paragraphs: ['在持续型目标上，如果不折扣，1 + 1 + 1 + … 会发散。只要 0 < γ < 1，几何级数就有限。', 'γ 接近 0 时只有近处奖励可见；γ 接近 1 时远期奖励保留更多权重，但截断和估计也更困难。'], formula: '1 + γ + γ² + ⋯ = 1 / (1 − γ)' },
      { id: 'sample-expectation', kicker: '常见误解', title: '单条高回报轨迹不等于高价值', paragraphs: ['随机环境中，一次幸运轨迹可能高于精确 value，一次倒霉轨迹也可能低于它。', '只有在明确的 seed 与样本协议下观察运行均值，才能把“这次发生了什么”与“平均会发生什么”分开。'], formula: 'V̂ₙ(s) = (1/n) Σᵢ Gₜ⁽ⁱ⁾' },
      { id: 'continuing-transfer', kicker: '迁移到下一章', title: 'Bellman 方程将无限未来折叠成一步', paragraphs: ['直接枚举全部未来可以定义 value，却不是高效的求解方法。', '下一章利用 Gₜ = Rₜ₊₁ + γGₜ₊₁，把长期回报拆成即时奖励与后继状态的价值。'], formula: 'Gₜ = Rₜ₊₁ + γGₜ₊₁' },
    ],
    summary: ['Return 是单条轨迹上未来奖励的折扣和。', 'State value 是给定起始状态并遵循策略时，所有可能 return 的条件期望。', '折扣既控制持续型任务的有限性，也决定当前决策看多远。'],
    explorer: explorer.zh,
  },
  en: {
    prerequisite: 'Prerequisites: states, actions, rewards, policies, and trajectories',
    summaryTitle: 'A return belongs to one future; value averages all possible futures',
    eyebrow: 'Chapter 2 · Return, discounting, and state value',
    title: 'Why can one immediate reward not describe the long-term quality of a state?',
    intro: 'A reward describes one transition. Return combines the future rewards along one trajectory. When the policy or environment is stochastic, one start can produce many returns; their conditional expectation is the state value Vπ(s).',
    bridge: 'The observatory reuses the 5×5 course world and fixed policy from Chapter 1. First weight every reward on one trajectory by its temporal power of γ. Then switch to the Value Lens and watch the sample mean approach the exact expectation computed from the same environment model.',
    figure: 'Interactive figure 2.1 · Return Observatory',
    instruction: 'Change γ, randomness, and sample count; inspect one trajectory before averaging many futures',
    question: 'Why can one start state have many returns but only one Vπ(s)?',
    prelude: [
      { id: 'reward-to-return', kicker: 'Accumulate through time', title: 'Immediate reward only answers what just happened', paragraphs: ['A policy may detour or suffer a penalty before receiving positive rewards for a long time. The first rₜ₊₁ cannot compare those futures.', 'Return Gₜ puts future rewards on one timeline; γᵏ is the weight with which the reward k steps away reaches the present.'], formulas: ['Gₜ = Rₜ₊₁ + γRₜ₊₂ + γ²Rₜ₊₃ + ⋯'] },
      { id: 'return-to-value', kicker: 'Samples to expectation', title: 'A return is an outcome; state value is the mean of a distribution', paragraphs: ['When π(a|s) or the transition is stochastic, the same state produces different trajectories and different Gₜ values.', 'Vπ(s) takes the conditional expectation over those possible returns. Return equals value only in a deterministic world with one possible future.'], formulas: ['Vπ(s) = Eπ,p[Gₜ | Sₜ = s]'] },
    ],
    sections: [
      { id: 'discount-boundary', kicker: 'Boundary case', title: 'γ makes an infinite sum finite and defines a time scale', paragraphs: ['At the continuing target, the undiscounted 1 + 1 + 1 + … diverges. For 0 < γ < 1, the geometric series is finite.', 'Near zero, only nearby rewards remain visible. Near one, distant rewards retain weight, but truncation and estimation become harder.'], formula: '1 + γ + γ² + ⋯ = 1 / (1 − γ)' },
      { id: 'sample-expectation', kicker: 'Common misconception', title: 'One high-return trajectory does not imply high value', paragraphs: ['In a stochastic environment, a lucky trajectory can lie above exact value and an unlucky one below it.', 'A visible seed and sample protocol is needed to separate what happened once from what happens on average.'], formula: 'V̂ₙ(s) = (1/n) Σᵢ Gₜ⁽ⁱ⁾' },
      { id: 'continuing-transfer', kicker: 'Transfer to the next chapter', title: 'The Bellman equation folds an infinite future into one step', paragraphs: ['Enumerating all futures defines value but is not an efficient way to solve it.', 'The next chapter uses Gₜ = Rₜ₊₁ + γGₜ₊₁ to split long-term return into immediate reward and successor value.'], formula: 'Gₜ = Rₜ₊₁ + γGₜ₊₁' },
    ],
    summary: ['Return is the discounted sum of future rewards along one trajectory.', 'State value is the conditional expectation over every possible return from a state under a policy.', 'Discounting controls both finiteness in continuing tasks and the effective planning horizon.'],
    explorer: explorer.en,
  },
})
