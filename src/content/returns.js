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
    modeTrajectory: '回报分解', modeValue: '价值估计', gamma: '折扣因子 γ', noise: '动作随机性', sampleCount: '轨迹样本数', exact: '精确 Vπ(s)', estimate: '样本均值', error: '估计误差', selectedRun: '当前样本', seed: 'seed', contribution: '折扣贡献', immediateReward: '即时奖励', discountWeight: '折扣权重', runningReturn: '累计 G₀', remainingBound: '截断尾项上界', visibleSteps: '显示前 14 步；完整数值计算 120 步', stateValue: '状态价值', return: '单条回报', trajectoryTape: 'Episode Tape', valueLens: 'Value Lens', chooseState: '点击状态改变起点', fixedPolicy: '示例固定策略 π', courseBaseline: '确定性基线', websiteExtension: '随机扩展', deterministic: '确定性：一条轨迹就是全部可能', stochastic: '随机性：一次 return 只是一个样本', sampleAxis: '样本编号', valueAxis: 'return / value', runningMean: '运行均值', exactLine: '精确期望', clickSample: '点击样本点查看它对应的轨迹', noRewardYet: '这一段还没有奖励，但它仍会推迟未来奖励的折扣权重。', preset: '观察预设', startState: '起始状态', targetContinuing: '目标状态继续产生 +1，不是 terminal', reset: '恢复确定性基线', statePrefix: 's', rewardPrefix: 'r', probability: '分支概率', tailNote: '尾项没有被偷偷忽略：右侧明确显示最坏情况下的剩余上界。', presetItems: {
      'course-baseline': { title: '确定性基线', note: '确定性策略下，单条 return 与精确 value 重合。' },
      'near-sighted': { title: '短视折扣', note: 'γ 变小后，远处的 +1 对起点影响迅速衰减。' },
      'stochastic-value': { title: '从样本到期望', note: '同一起点产生不同 return，运行均值逐步靠近 Vπ(s)。' },
      'continuing-target': { title: '持续型目标', note: '从目标出发仍会继续交互，得到 1 + γ + γ² + …。' },
    },
  },
  en: {
    modeTrajectory: 'Return decomposition', modeValue: 'Value estimate', gamma: 'Discount γ', noise: 'Action randomness', sampleCount: 'Trajectory samples', exact: 'Exact Vπ(s)', estimate: 'Sample mean', error: 'Estimation error', selectedRun: 'Selected sample', seed: 'seed', contribution: 'Discounted contribution', immediateReward: 'Immediate reward', discountWeight: 'Discount weight', runningReturn: 'Cumulative G₀', remainingBound: 'Truncated-tail bound', visibleSteps: 'First 14 steps shown; numbers use 120 steps', stateValue: 'State value', return: 'Single return', trajectoryTape: 'Episode Tape', valueLens: 'Value Lens', chooseState: 'Click a state to change the start', fixedPolicy: 'Example fixed policy π', courseBaseline: 'Deterministic baseline', websiteExtension: 'Stochastic extension', deterministic: 'Deterministic: one trajectory is the full possibility set', stochastic: 'Stochastic: one return is only one sample', sampleAxis: 'Sample index', valueAxis: 'return / value', runningMean: 'Running mean', exactLine: 'Exact expectation', clickSample: 'Click a sample point to inspect its trajectory', noRewardYet: 'This segment has no reward yet, but it still delays and discounts future rewards.', preset: 'Observation presets', startState: 'Start state', targetContinuing: 'The target keeps producing +1 and is not terminal', reset: 'Restore deterministic baseline', statePrefix: 's', rewardPrefix: 'r', probability: 'Branch probability', tailNote: 'The tail is not silently discarded: the worst-case remaining bound is shown explicitly.', presetItems: {
      'course-baseline': { title: 'Deterministic baseline', note: 'Under a deterministic policy, one return equals the exact value.' },
      'near-sighted': { title: 'Short horizon', note: 'With smaller γ, the distant +1 quickly loses influence at the start.' },
      'stochastic-value': { title: 'Samples to expectation', note: 'The same start yields different returns; the running mean approaches Vπ(s).' },
      'continuing-target': { title: 'Continuing target', note: 'Starting at the target still continues: 1 + γ + γ² + ….' },
    },
  },
}

const returnDerivationZh = [
  {
    id: 'timeline',
    rule: '固定时间下标',
    latex: String.raw`S_t \xrightarrow{A_t} \bigl(R_{t+1},S_{t+1}\bigr)`,
    short: '动作发生在时刻 t，环境响应记在 t+1。',
    detail: '智能体先观察状态 S_t，再选择动作 A_t；环境随后产生奖励 R_{t+1} 与后继状态 S_{t+1}。因此，从时刻 t 开始统计未来时，第一个奖励必然是 R_{t+1}。',
    assumptions: [],
    symbols: [[String.raw`S_t`, '时刻 t 的状态'], [String.raw`A_t`, '时刻 t 选择的动作'], [String.raw`R_{t+1}`, '动作执行后收到的奖励']],
  },
  {
    id: 'finite-return',
    rule: '定义有限时域回报',
    latex: String.raw`G_t^{(T)} \coloneqq R_{t+1}+R_{t+2}+\cdots+R_T`,
    short: '把时刻 t 之后、终止时刻 T 之前的奖励相加。',
    detail: '有限 episode 有明确终点 T，因此可以直接累加动作 A_t 之后的所有奖励。上标 (T) 用来强调这个量依赖有限终点，尚未处理持续型任务。',
    assumptions: [String.raw`t<T<\infty`],
    symbols: [[String.raw`G_t^{(T)}`, '有限终点 T 下，从时刻 t 开始的回报']],
  },
  {
    id: 'discounted-return',
    rule: '引入折扣并扩展到无限时域',
    latex: String.raw`G_t \coloneqq R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots = \sum_{k=0}^{\infty}\gamma^kR_{t+k+1}`,
    short: '第 k 个未来奖励乘以权重 γ^k。',
    detail: '持续型任务没有有限终点，直接相加可能发散。折扣因子让更远奖励的权重按几何速度衰减；在奖励有界且 0≤γ<1 时，无限和保持有限。',
    assumptions: [String.raw`0\le\gamma<1`, String.raw`|R_t|\le R_{\max}<\infty`],
    symbols: [[String.raw`\gamma`, '折扣因子'], [String.raw`k`, '奖励距离当前时刻的步数']],
  },
  {
    id: 'split-first-term',
    rule: '从无限和中拆出第一项',
    latex: String.raw`G_t = R_{t+1}+\gamma\bigl(R_{t+2}+\gamma R_{t+3}+\gamma^2R_{t+4}+\cdots\bigr)`,
    short: '把眼前奖励与剩余未来分开。',
    detail: '求和式中 k=0 的项是 R_{t+1}。其余每一项都至少含一个 γ，因此可提出 γ；括号内从 R_{t+2} 开始，正好是从下一时刻观察到的同一种回报结构。',
    assumptions: ['只使用代数重排'],
    symbols: [[String.raw`R_{t+1}`, '下一步即时奖励']],
  },
  {
    id: 'return-recursion',
    rule: '识别下一时刻的回报',
    latex: String.raw`G_t = R_{t+1}+\gamma G_{t+1}`,
    short: '括号中的剩余无限和就是 G_{t+1}。',
    detail: '根据同一个折扣回报定义，从时刻 t+1 向后看得到 G_{t+1}=R_{t+2}+γR_{t+3}+⋯。代回上一行后，长期未来被折叠成“一个即时奖励 + 一个后继回报”。',
    assumptions: ['未来仍使用同一个折扣因子'],
    symbols: [[String.raw`G_{t+1}`, '从下一时刻开始的回报']],
  },
  {
    id: 'state-value',
    rule: '对所有可能未来取条件期望',
    latex: String.raw`V^{\pi}(s) \coloneqq \mathbb{E}_{\pi,p}\!\left[G_t\mid S_t=s\right]`,
    short: '状态价值是 G_t 的条件期望，不是某一次观测值。',
    detail: '从同一个状态 s 出发，策略 π 可能采样到不同动作，环境 p 也可能产生不同奖励与后继状态，所以 G_t 是随机变量。V^π(s) 对这些可能轨迹的回报按其概率加权平均。',
    assumptions: ['后续动作遵循策略 π', '转移与奖励由环境模型 p 产生'],
    symbols: [[String.raw`V^{\pi}(s)`, '策略 π 下状态 s 的价值'], [String.raw`\mathbb{E}_{\pi,p}`, '对策略和环境诱导的随机性取期望']],
  },
]

const returnDerivationEn = [
  { id: 'timeline', rule: 'Fix the time indices', latex: String.raw`S_t \xrightarrow{A_t} \bigl(R_{t+1},S_{t+1}\bigr)`, short: 'The action occurs at t; the environment response is indexed t+1.', detail: 'The agent first observes S_t and selects A_t. The environment then produces R_{t+1} and S_{t+1}, so the first future reward viewed from t is R_{t+1}.', assumptions: [], symbols: [[String.raw`S_t`, 'state at time t'], [String.raw`A_t`, 'action selected at time t'], [String.raw`R_{t+1}`, 'reward returned after the action']] },
  { id: 'finite-return', rule: 'Define finite-horizon return', latex: String.raw`G_t^{(T)} \coloneqq R_{t+1}+R_{t+2}+\cdots+R_T`, short: 'Add rewards after time t until terminal time T.', detail: 'A finite episode has an explicit endpoint T, so the rewards after A_t can be summed directly. The superscript (T) keeps that endpoint visible.', assumptions: [String.raw`t<T<\infty`], symbols: [[String.raw`G_t^{(T)}`, 'return from t with finite endpoint T']] },
  { id: 'discounted-return', rule: 'Introduce discount for an infinite horizon', latex: String.raw`G_t \coloneqq R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots = \sum_{k=0}^{\infty}\gamma^kR_{t+k+1}`, short: 'A reward k steps away receives weight γ^k.', detail: 'A continuing task has no finite endpoint, and a plain sum may diverge. Geometric discount keeps the sum bounded when rewards are bounded and 0≤γ<1.', assumptions: [String.raw`0\le\gamma<1`, String.raw`|R_t|\le R_{\max}<\infty`], symbols: [[String.raw`\gamma`, 'discount factor'], [String.raw`k`, 'number of steps into the future']] },
  { id: 'split-first-term', rule: 'Separate the first term', latex: String.raw`G_t = R_{t+1}+\gamma\bigl(R_{t+2}+\gamma R_{t+3}+\gamma^2R_{t+4}+\cdots\bigr)`, short: 'Separate the next reward from the remaining future.', detail: 'The k=0 term is R_{t+1}. Every remaining term contains at least one γ, so factor it out. The parenthesized series has the same form viewed from the next time step.', assumptions: ['Algebraic rearrangement only'], symbols: [[String.raw`R_{t+1}`, 'next immediate reward']] },
  { id: 'return-recursion', rule: 'Recognize the next return', latex: String.raw`G_t = R_{t+1}+\gamma G_{t+1}`, short: 'The parenthesized infinite sum is G_{t+1}.', detail: 'By the same definition, G_{t+1}=R_{t+2}+γR_{t+3}+⋯. Substitution folds the long future into one reward and one successor return.', assumptions: ['Future rewards use the same discount factor'], symbols: [[String.raw`G_{t+1}`, 'return beginning at the next time step']] },
  { id: 'state-value', rule: 'Average all possible futures conditionally', latex: String.raw`V^{\pi}(s) \coloneqq \mathbb{E}_{\pi,p}\!\left[G_t\mid S_t=s\right]`, short: 'State value is the conditional expectation of G_t, not one observation.', detail: 'From the same state, policy π may sample different actions and environment p may produce different rewards and successors. V^π(s) averages the resulting random returns.', assumptions: ['Future actions follow π', 'Transitions and rewards follow p'], symbols: [[String.raw`V^{\pi}(s)`, 'value of state s under π'], [String.raw`\mathbb{E}_{\pi,p}`, 'expectation over policy and environment randomness']] },
]

const returnDeepeningZh = [
  {
    id: 'two-return-calculations', kicker: '同一对象，两种算法', title: '按定义累加与从后向前递推必须得到同一个 return',
    paragraphs: ['考虑一条有限 episode，其奖励依次为 0、−1、0、+1，折扣 γ=0.9。按定义可以从起点把每项乘上相应幂次后相加；也可以从终点令 G₃=1，再用 G_t=R_{t+1}+γG_{t+1} 逐步向前递推。', '第二种写法没有改变 return，只是复用了已经算出的后缀回报。这个递归结构使后续 Bellman 方程和逐步学习成为可能。'],
    formulas: [String.raw`G_0=0+0.9(-1)+0.9^2(0)+0.9^3(1)=-0.171`, String.raw`G_3=1,\quad G_2=0+0.9G_3=0.9,\quad G_1=-1+0.9G_2=-0.19,\quad G_0=0+0.9G_1=-0.171`],
    example: { title: '同一条 episode 的反向 return 表', caption: '每行的 Gₜ 都完整包含该时刻之后的奖励。', headers: ['t', 'Rₜ₊₁', '递推', 'Gₜ'], rows: [['3', '+1', '1 + 0', '1.000'], ['2', '0', '0 + 0.9×1', '0.900'], ['1', '−1', '−1 + 0.9×0.9', '−0.190'], ['0', '0', '0 + 0.9×(−0.19)', '−0.171']] },
    handoff: 'return 的递推仍依赖这条 episode 的真实未来；要评价一个状态，还必须把所有可能未来的概率纳入。',
  },
  {
    id: 'return-distribution', kicker: '从确定性到随机性', title: 'State value 是 return 分布的加权中心，而不是“典型轨迹”',
    paragraphs: ['假设从同一状态出发有 0.7 的概率得到 G=2，有 0.3 的概率得到 G=−4。两条 return 都可能发生，但状态价值只有一个：按各自概率加权后的期望 0.2。', '样本均值是在不知道完整分布时估计这个期望的方法；若模型和概率已知，则可以直接求精确期望。二者评价的是同一数学对象，证据来源不同。'],
    formulas: [String.raw`V^{\pi}(s)=0.7\times2+0.3\times(-4)=0.2`, String.raw`\widehat V_n^{\pi}(s)=\frac{1}{n}\sum_{i=1}^{n}G^{(i)}\xrightarrow[n\to\infty]{}V^{\pi}(s)`],
    theorem: { claim: '确定性条件下 return 与 value 数值相同，是“分布退化为一个点”的特殊情况。', why: '若所有概率质量都落在同一条未来上，随机变量 Gₜ 没有方差，其期望就等于唯一实现值。', conditions: [String.raw`\Pr(G_t=g\mid S_t=s)=1\quad\Longrightarrow\quad V^{\pi}(s)=g`] },
    handoff: '定义已经清楚，但直接枚举所有轨迹会指数增长。下一章将用一步条件期望替代对完整未来树的枚举。',
  },
]

const returnDeepeningEn = [
  {
    id: 'two-return-calculations', kicker: 'One object, two procedures', title: 'Definition-based summation and backward recursion must produce the same return',
    paragraphs: ['Consider a finite episode with rewards 0, −1, 0, +1 and γ=0.9. The definition weights each reward from the start. The backward procedure begins with G₃=1 and repeatedly applies G_t=R_{t+1}+γG_{t+1}.', 'Backward recursion does not redefine return; it reuses an already computed suffix. That structure makes Bellman equations and incremental learning possible.'],
    formulas: [String.raw`G_0=0+0.9(-1)+0.9^2(0)+0.9^3(1)=-0.171`, String.raw`G_3=1,\quad G_2=0+0.9G_3=0.9,\quad G_1=-1+0.9G_2=-0.19,\quad G_0=0+0.9G_1=-0.171`],
    example: { title: 'Backward return table for one episode', caption: 'Each Gₜ contains every reward after that time.', headers: ['t', 'Rₜ₊₁', 'Recursion', 'Gₜ'], rows: [['3', '+1', '1 + 0', '1.000'], ['2', '0', '0 + 0.9×1', '0.900'], ['1', '−1', '−1 + 0.9×0.9', '−0.190'], ['0', '0', '0 + 0.9×(−0.19)', '−0.171']] },
    handoff: 'Return recursion still uses one realized future. Evaluating a state requires probabilities over every possible future.',
  },
  {
    id: 'return-distribution', kicker: 'Deterministic to stochastic', title: 'State value is the probability-weighted center of a return distribution',
    paragraphs: ['Suppose one state yields G=2 with probability 0.7 and G=−4 with probability 0.3. Both returns are possible, but their probability-weighted expectation is the single state value 0.2.', 'A sample mean estimates this expectation when the full distribution is unavailable. A known model computes it exactly. The mathematical object is the same; the evidence source differs.'],
    formulas: [String.raw`V^{\pi}(s)=0.7\times2+0.3\times(-4)=0.2`, String.raw`\widehat V_n^{\pi}(s)=\frac{1}{n}\sum_{i=1}^{n}G^{(i)}\xrightarrow[n\to\infty]{}V^{\pi}(s)`],
    theorem: { claim: 'Return and value coincide under deterministic conditions only because the distribution collapses to one point.', why: 'If all probability mass lies on one future, Gₜ has zero variance and its expectation equals its only realization.', conditions: [String.raw`\Pr(G_t=g\mid S_t=s)=1\quad\Longrightarrow\quad V^{\pi}(s)=g`] },
    handoff: 'The definition is complete, but enumerating full trajectories grows exponentially. The next chapter replaces the future tree with a one-step conditional expectation.',
  },
]

export const returnChapter = assertFoundationChapterDefinition({
  id: 'returns',
  sources,
  zh: {
    prerequisite: '前置：状态、动作、奖励、策略与轨迹',
    summaryTitle: 'return 属于一条未来；value 是所有可能未来的平均',
    eyebrow: '第 2 章 · Return、折扣与 State Value',
    title: '为什么一次即时奖励不能说明一个状态的长期好坏？',
    intro: '奖励只描述一次转移，return 才把一条轨迹上的未来奖励合在一起；当策略或环境带有随机性，同一起点会产生许多不同 return，它们的条件期望才是状态价值 Vπ(s)。',
    bridge: '下面继续使用第 01 章的 5×5 网格世界与固定策略。先把一条轨迹的每个奖励乘上 γ 的时间权重，再切换到 Value Lens，观察样本均值如何逼近同一环境模型计算出的精确期望。',
    experimentIntro: '下面沿用已经定义的 5×5 网格世界与固定策略。先逐项查看一条轨迹的折扣贡献，再切换到价值视图，把单次 return 与多条轨迹的样本均值分开。',
    interpretation: '确定性条件下，一条起始状态只对应一条未来，所以 return 与 value 数值相同；加入动作随机性后，单条轨迹只是一个样本，只有运行均值才在逼近期望。',
    figure: '交互图 2.1 · Return Observatory',
    instruction: '改变 γ、随机性和样本数；先看一条轨迹，再看多条未来的平均',
    question: '同一个起始状态，为什么会同时对应许多 return，却只有一个 Vπ(s)？',
    derivation: returnDerivationZh,
    deepening: returnDeepeningZh,
    prelude: [
      { id: 'reward-to-return', kicker: '沿时间累加', title: '即时奖励只回答“刚才发生了什么”', paragraphs: ['一条策略可能先绕行、受罚，随后长期得到正奖励。只看第一步 rₜ₊₁ 无法比较这两种未来。', 'Return Gₜ 把从当前时刻之后的奖励放在同一条时间轴上；γᵏ 是第 k 步奖励抵达当前时刻时的权重。'], formulas: [String.raw`G_t=R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots`] },
      { id: 'return-to-value', kicker: '从样本到期望', title: '一条 return 是结果，state value 是分布的均值', paragraphs: ['当 π(a|s) 或环境转移带有随机性，从同一状态出发会得到不同轨迹与不同 Gₜ。', 'Vπ(s) 对这些可能回报取条件期望。确定性世界里只有一条未来，因此 return 与 value 才会数值相同。'], formulas: [String.raw`V^{\pi}(s)=\mathbb{E}_{\pi,p}[G_t\mid S_t=s]`] },
    ],
    sections: [
      { id: 'discount-boundary', kicker: '边界案例', title: 'γ 既让无穷和有限，也定义时间尺度', paragraphs: ['在持续型目标上，如果不折扣，1 + 1 + 1 + … 会发散。只要 0 < γ < 1，几何级数就有限。', 'γ 接近 0 时只有近处奖励可见；γ 接近 1 时远期奖励保留更多权重，但截断和估计也更困难。'], formula: String.raw`1+\gamma+\gamma^2+\cdots=\frac{1}{1-\gamma}` },
      { id: 'sample-expectation', kicker: '常见误解', title: '单条高回报轨迹不等于高价值', paragraphs: ['随机环境中，一次幸运轨迹可能高于精确 value，一次倒霉轨迹也可能低于它。', '只有在明确的 seed 与样本协议下观察运行均值，才能把“这次发生了什么”与“平均会发生什么”分开。'], formula: String.raw`\widehat{V}_n(s)=\frac{1}{n}\sum_{i=1}^{n}G_t^{(i)}` },
      { id: 'continuing-transfer', kicker: '迁移到下一章', title: 'Bellman 方程将无限未来折叠成一步', paragraphs: ['直接枚举全部未来可以定义 value，却不是高效的求解方法。', '下一章利用 Gₜ = Rₜ₊₁ + γGₜ₊₁，把长期回报拆成即时奖励与后继状态的价值。'], formula: String.raw`G_t=R_{t+1}+\gamma G_{t+1}` },
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
    bridge: 'The observatory reuses the 5×5 grid world and fixed policy from Chapter 1. First weight every reward on one trajectory by its temporal power of γ. Then switch to the Value Lens and watch the sample mean approach the exact expectation computed from the same environment model.',
    experimentIntro: 'Reuse the defined 5×5 grid and fixed policy. First inspect discounted contributions along one trajectory, then switch to the value view and separate one return from the mean over many trajectories.',
    interpretation: 'Under deterministic dynamics, one start has one future, so return and value coincide numerically. With action randomness, one trajectory is only a sample and the running mean is what approaches expectation.',
    figure: 'Interactive figure 2.1 · Return Observatory',
    instruction: 'Change γ, randomness, and sample count; inspect one trajectory before averaging many futures',
    question: 'Why can one start state have many returns but only one Vπ(s)?',
    derivation: returnDerivationEn,
    deepening: returnDeepeningEn,
    prelude: [
      { id: 'reward-to-return', kicker: 'Accumulate through time', title: 'Immediate reward only answers what just happened', paragraphs: ['A policy may detour or suffer a penalty before receiving positive rewards for a long time. The first rₜ₊₁ cannot compare those futures.', 'Return Gₜ puts future rewards on one timeline; γᵏ is the weight with which the reward k steps away reaches the present.'], formulas: [String.raw`G_t=R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots`] },
      { id: 'return-to-value', kicker: 'Samples to expectation', title: 'A return is an outcome; state value is the mean of a distribution', paragraphs: ['When π(a|s) or the transition is stochastic, the same state produces different trajectories and different Gₜ values.', 'Vπ(s) takes the conditional expectation over those possible returns. Return equals value only in a deterministic world with one possible future.'], formulas: [String.raw`V^{\pi}(s)=\mathbb{E}_{\pi,p}[G_t\mid S_t=s]`] },
    ],
    sections: [
      { id: 'discount-boundary', kicker: 'Boundary case', title: 'γ makes an infinite sum finite and defines a time scale', paragraphs: ['At the continuing target, the undiscounted 1 + 1 + 1 + … diverges. For 0 < γ < 1, the geometric series is finite.', 'Near zero, only nearby rewards remain visible. Near one, distant rewards retain weight, but truncation and estimation become harder.'], formula: String.raw`1+\gamma+\gamma^2+\cdots=\frac{1}{1-\gamma}` },
      { id: 'sample-expectation', kicker: 'Common misconception', title: 'One high-return trajectory does not imply high value', paragraphs: ['In a stochastic environment, a lucky trajectory can lie above exact value and an unlucky one below it.', 'A visible seed and sample protocol is needed to separate what happened once from what happens on average.'], formula: String.raw`\widehat{V}_n(s)=\frac{1}{n}\sum_{i=1}^{n}G_t^{(i)}` },
      { id: 'continuing-transfer', kicker: 'Transfer to the next chapter', title: 'The Bellman equation folds an infinite future into one step', paragraphs: ['Enumerating all futures defines value but is not an efficient way to solve it.', 'The next chapter uses Gₜ = Rₜ₊₁ + γGₜ₊₁ to split long-term return into immediate reward and successor value.'], formula: String.raw`G_t=R_{t+1}+\gamma G_{t+1}` },
    ],
    summary: ['Return is the discounted sum of future rewards along one trajectory.', 'State value is the conditional expectation over every possible return from a state under a policy.', 'Discounting controls both finiteness in continuing tasks and the effective planning horizon.'],
    explorer: explorer.en,
  },
})
