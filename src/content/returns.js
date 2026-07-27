import { GOAL, START } from '../engine/gridworld.js'
import { assertFoundationChapterDefinition } from './schema.js'

export const returnPresetConfigs = {
  'course-baseline': { start: START, gamma: 0.9, noise: 0, sampleCount: 8, mode: 'trajectory' },
  'near-sighted': { start: START, gamma: 0.4, noise: 0, sampleCount: 8, mode: 'trajectory' },
  'stochastic-value': { start: START, gamma: 0.9, noise: 0.3, sampleCount: 8, mode: 'futures' },
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
    modeTrajectory: '查看一条轨迹', modeFutures: '比较多条轨迹', gamma: '折扣因子 γ', noise: '转移随机性', noiseHint: '策略保持固定，只改变动作执行后的环境结果', sampleCount: '重复采样次数', exact: '状态价值 Vπ(s)', estimate: '样本均值', selectedReturn: '选中轨迹的 return', selectedRun: '选中轨迹', seed: 'seed', contribution: '折扣贡献', runningReturn: '这条轨迹的 G₀', remainingBound: '截断尾项上界', visibleSteps: '显示前 12 步；完整数值计算 120 步', return: '单条回报', trajectoryTape: '一条轨迹怎样形成 return', chooseState: '点击状态改变共同起点', fixedPolicy: '示例固定策略 π', courseBaseline: '确定性转移', deterministic: '唯一未来', stochastic: '多种可能未来', runningMean: '样本均值', exactLine: '条件期望', clickSample: '选择任意轨迹，地图和回报分解会同步更新', preset: '观察预设', startState: '共同起点', targetContinuing: '目标状态仍会继续交互并产生 +1', statePrefix: 's', tailNote: '完整数值使用 120 步，并显示尚未展开部分的最坏情况上界。', environment: '实验环境', environmentDetail: '5×5 网格世界 · 固定策略 π · 只改变环境中的动作执行结果', fanTitle: '从同一起点采样出的未来', fanNote: '每一行都是一条实际发生的轨迹及其 return', deterministicSummary: '所有采样轨迹完全相同：确定性条件下只有一条可能未来，因此它的 return 就等于状态价值。', stochasticSummary: '起点、策略和折扣因子都没有改变，但环境随机性产生了不同轨迹；每条轨迹只给出一个 return 样本。', shownSamples: '全部轨迹', scrollHint: '窗口显示 4 条，可滚动查看', samplePath: '状态路径', rewardPath: '奖励序列', selectedValueNote: '选择不同轨迹会改变单次 return，但不会改变同一状态在固定策略下的精确价值。', deterministicValueNote: '概率全部集中在唯一轨迹上，因此条件期望等于这条轨迹的 return。', sampleMeanNote: '样本均值只是对条件期望的估计；它不定义状态价值。', presetItems: {
      'course-baseline': { title: '唯一确定轨迹', note: '重复运行得到同一路径，return 与状态价值重合。' },
      'near-sighted': { title: '缩短时间尺度', note: '只改变 γ，观察远期 +1 对同一轨迹的贡献怎样衰减。' },
      'stochastic-value': { title: '同一起点，多种未来', note: '固定策略不变，转移随机性产生不同轨迹与 return。' },
      'continuing-target': { title: '持续型目标', note: '从目标出发仍会继续交互，得到 1 + γ + γ² + …。' },
    },
  },
  en: {
    modeTrajectory: 'Inspect one trajectory', modeFutures: 'Compare possible futures', gamma: 'Discount γ', noise: 'Transition randomness', noiseHint: 'Keep the policy fixed and change only the environment outcome after an action', sampleCount: 'Repeated samples', exact: 'State value Vπ(s)', estimate: 'Sample mean', selectedReturn: 'Selected trajectory return', selectedRun: 'Selected trajectory', seed: 'seed', contribution: 'Discounted contribution', runningReturn: 'This trajectory’s G₀', remainingBound: 'Truncated-tail bound', visibleSteps: 'First 12 steps shown; numbers use 120 steps', return: 'Single return', trajectoryTape: 'How one trajectory produces a return', chooseState: 'Click a state to change the shared start', fixedPolicy: 'Example fixed policy π', courseBaseline: 'Deterministic transitions', deterministic: 'One possible future', stochastic: 'Many possible futures', runningMean: 'Sample mean', exactLine: 'Conditional expectation', clickSample: 'Select any trajectory to synchronize the map and return decomposition', preset: 'Observation presets', startState: 'Shared start', targetContinuing: 'The target continues interacting and producing +1', statePrefix: 's', tailNote: 'The numeric return uses 120 steps and reports a worst-case bound for the unexpanded tail.', environment: 'Experiment environment', environmentDetail: '5×5 grid world · fixed policy π · only action-execution outcomes vary', fanTitle: 'Futures sampled from the same start', fanNote: 'Each row is one realized trajectory and its return', deterministicSummary: 'Every sampled trajectory is identical. Under deterministic conditions there is only one possible future, so its return equals the state value.', stochasticSummary: 'The start, policy, and discount stay fixed, but environmental randomness produces different trajectories; each trajectory supplies only one return sample.', shownSamples: 'All trajectories', scrollHint: '4 shown at a time; scroll to inspect the rest', samplePath: 'State path', rewardPath: 'Reward sequence', selectedValueNote: 'Selecting another trajectory changes the observed return but not the exact value of the same state under the fixed policy.', deterministicValueNote: 'All probability lies on one trajectory, so the conditional expectation equals that trajectory’s return.', sampleMeanNote: 'The sample mean estimates the conditional expectation; it does not define state value.', presetItems: {
      'course-baseline': { title: 'One deterministic path', note: 'Repeated runs follow the same path, so return and state value coincide.' },
      'near-sighted': { title: 'Shorter time scale', note: 'Change only γ and watch distant +1 rewards lose influence on the same path.' },
      'stochastic-value': { title: 'One start, many futures', note: 'Keep the policy fixed while transition randomness changes trajectories and returns.' },
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
    id: 'two-return-calculations', kicker: '同一条轨迹的两种计算顺序', title: '反向递推通过复用后缀回报得到相同结果',
    paragraphs: ['仍沿用共享网格世界中的受罚路径。智能体先经过普通格，再试图进入禁区而得到 −1，随后回到普通格，最后进入目标格得到 +1，因此这条有限轨迹的奖励依次为 0、−1、0、+1；取折扣 γ=0.9。按定义可以从起点给每项乘上相应折扣后相加，也可以从终点令 G₃=1，再用 G_t=R_{t+1}+γG_{t+1} 逐步向前递推。', '两种计算始终使用同一条已经发生的轨迹，因此必须得到同一个 return。反向递推没有引入平均，也没有把 return 变成 value；它只是复用了后缀回报，并为下一章的一步递推留下了结构。'],
    formulas: [String.raw`G_0=0+0.9(-1)+0.9^2(0)+0.9^3(1)=-0.171`, String.raw`G_3=1,\quad G_2=0+0.9G_3=0.9,\quad G_1=-1+0.9G_2=-0.19,\quad G_0=0+0.9G_1=-0.171`],
    example: { title: '同一条 episode 的反向 return 表', caption: '每行的 Gₜ 都完整包含该时刻之后的奖励。', headers: ['t', 'Rₜ₊₁', '递推', 'Gₜ'], rows: [['3', '+1', '1 + 0', '1.000'], ['2', '0', '0 + 0.9×1', '0.900'], ['1', '−1', '−1 + 0.9×0.9', '−0.190'], ['0', '0', '0 + 0.9×(−0.19)', '−0.171']] },
    handoff: 'return 的递推仍依赖这条 episode 的真实未来；要评价一个状态，还必须把所有可能未来的概率纳入。',
  },
  {
    id: 'return-distribution', kicker: '同一起点的多种未来', title: '确定性只产生一个 return，随机性产生一个 return 分布',
    paragraphs: ['仍从同一个网格状态出发并执行同一套固定策略。若环境转移是确定的，每次运行都会经过同一串状态、动作和奖励，因而只会得到一个 return；此时状态价值这个条件期望恰好等于唯一的 return。', '现在保持起点、策略与折扣因子不变，只让动作执行后的转移带有随机性。同一个意图可能落到不同后继状态，随后形成不同奖励序列、不同轨迹与不同 return。状态价值不挑选其中一条“代表性轨迹”，而是对所有可能 return 按其发生概率取条件期望。'],
    formulas: [String.raw`V^{\pi}(s)=\sum_{\tau}\Pr(\tau\mid S_t=s,\pi,p)\,G(\tau)`],
    theorem: { claim: 'Return 与 state value 只在唯一未来的特殊情况下数值相同。', why: '若给定起点后所有概率都集中在同一条轨迹上，Gₜ 不再波动，它的条件期望自然等于唯一实现值。', conditions: [String.raw`\Pr(G_t=g\mid S_t=s)=1\quad\Longrightarrow\quad V^{\pi}(s)=g`] },
    handoff: '完整模型可以直接计算这个条件期望；模型未知时，只能用多条轨迹的 return 样本来估计它。',
  },
]

const returnDeepeningEn = [
  {
    id: 'two-return-calculations', kicker: 'Two calculation orders on one trajectory', title: 'Backward recursion reuses suffix returns to obtain the same result',
    paragraphs: ['Continue with the penalized path in the shared grid world. The agent crosses an ordinary cell, attempts to enter the forbidden region and receives −1, returns to an ordinary cell, and finally enters the goal for +1. The finite trajectory therefore yields rewards 0, −1, 0, +1 with γ=0.9. The definition weights every reward from the start; backward recursion begins with G₃=1 and repeatedly applies G_t=R_{t+1}+γG_{t+1}.', 'Both calculations use the same realized trajectory and must therefore produce the same return. Backward recursion introduces neither averaging nor a state value; it only reuses suffix returns and exposes the one-step structure needed in the next chapter.'],
    formulas: [String.raw`G_0=0+0.9(-1)+0.9^2(0)+0.9^3(1)=-0.171`, String.raw`G_3=1,\quad G_2=0+0.9G_3=0.9,\quad G_1=-1+0.9G_2=-0.19,\quad G_0=0+0.9G_1=-0.171`],
    example: { title: 'Backward return table for one episode', caption: 'Each Gₜ contains every reward after that time.', headers: ['t', 'Rₜ₊₁', 'Recursion', 'Gₜ'], rows: [['3', '+1', '1 + 0', '1.000'], ['2', '0', '0 + 0.9×1', '0.900'], ['1', '−1', '−1 + 0.9×0.9', '−0.190'], ['0', '0', '0 + 0.9×(−0.19)', '−0.171']] },
    handoff: 'Return recursion still uses one realized future. Evaluating a state requires probabilities over every possible future.',
  },
  {
    id: 'return-distribution', kicker: 'Many futures from one start', title: 'Determinism produces one return; randomness produces a return distribution',
    paragraphs: ['Start from the same grid state and follow the same fixed policy. With deterministic transitions, every run visits the same states, actions, and rewards, so only one return is possible. The conditional expectation called state value then equals that unique return.', 'Now hold the start, policy, and discount fixed while making action execution stochastic. The same intended move can reach different successors and create different reward sequences, trajectories, and returns. State value does not select a “representative trajectory”; it takes the conditional expectation over all possible returns with their probabilities.'],
    formulas: [String.raw`V^{\pi}(s)=\sum_{\tau}\Pr(\tau\mid S_t=s,\pi,p)\,G(\tau)`],
    theorem: { claim: 'Return and state value coincide only in the special case of a unique future.', why: 'If all probability conditional on the start lies on one trajectory, Gₜ no longer varies and its conditional expectation equals its only realization.', conditions: [String.raw`\Pr(G_t=g\mid S_t=s)=1\quad\Longrightarrow\quad V^{\pi}(s)=g`] },
    handoff: 'A known model can compute this conditional expectation directly; without the model, return samples from many trajectories must estimate it.',
  },
]

export const returnChapter = assertFoundationChapterDefinition({
  id: 'returns',
  sources,
  zh: {
    prerequisite: '前置：状态、动作、奖励、策略与轨迹',
    summaryTitle: '回报属于轨迹，状态价值属于条件期望',
    eyebrow: '第 2 章 · Return、折扣与 State Value',
    title: '回报与状态价值',
    intro: '第 01 章已经能够记录每次转移的奖励，但单次奖励只能说明刚刚发生的结果，不能比较随后走向不同未来的路径。本章先把一条轨迹上的未来奖励定义为 return，再说明同一起点在随机策略或随机环境下会产生许多 return；它们的条件期望才是状态价值。',
    bridge: '下面继续使用共享的 5×5 网格世界。先沿一条实际轨迹计算折扣 return，再保持起点、策略与折扣因子不变，只改变环境转移的随机性，观察同一个状态怎样产生一个 return 分布。',
    experimentIntro: '先预测：如果固定起点、策略和折扣因子，只把转移随机性从 0 调高，地图上的唯一轨迹、单次 return 与状态价值会分别发生什么变化？下面先查看一条轨迹，再并排比较从同一起点采样出的多条未来。',
    interpretation: '转移随机性为 0 时，重复采样得到同一条轨迹，唯一 return 与状态价值重合。加入随机性后，选择不同轨迹会改变单次 return，却不会改变同一起点和固定策略所对应的精确状态价值；样本均值只是对这个条件期望的估计。',
    figure: '交互图 2.1 · 同一起点的轨迹与状态价值',
    instruction: '固定策略，改变折扣与转移随机性；选择轨迹，比较单次 return 和状态价值',
    question: '同一个起始状态，为什么会同时对应许多 return，却只有一个 Vπ(s)？',
    derivation: returnDerivationZh,
    deepening: returnDeepeningZh,
    prelude: [
      { id: 'reward-to-return', kicker: '一次反馈与整条未来', title: '即时奖励相同，两条路径的长期结果仍可能不同', paragraphs: ['从起点出发，向右和向下的第一步都可能得到即时奖励 0，但两条路径随后并不等价：安全路径继续绕开禁区并进入目标，受罚路径则会在中途得到 −1。只比较第一步奖励，看不出哪条路径更好。', '奖励 Rₜ₊₁ 属于一次状态转移；return Gₜ 属于从时刻 t 开始的一整条未来，它把未来奖励汇总起来，并在持续型任务中按时间距离赋予权重。把后续奖励放回同一条时间轴后，安全路径得到更高 return，长期好坏才成为可以比较的数值。'], formulas: [String.raw`\begin{aligned}G_{\mathrm{safe}}&=0+0+0+1=1,\\G_{\mathrm{penalized}}&=0-1+0+1=0.\end{aligned}`] },
      { id: 'return-to-value', kicker: '从一次实现到条件期望', title: '状态价值用条件期望统一评价同一起点的多种未来', paragraphs: ['未来真正发生之前，Gₜ 取决于接下来采样到的动作、转移与奖励，因此是随机变量；一条具体轨迹发生以后，我们才观察到它的一个 return 样本。若策略和环境都确定，同一起点只产生这一条未来，重复运行便总会得到同一个样本。', '只要策略选择或环境转移带有随机性，同一状态就可能产生不同轨迹与不同 return。一次幸运或倒霉的结果都不足以评价这个状态，因此状态价值 Vπ(s) 被定义为：从状态 s 出发并遵循策略 π 时，Gₜ 的条件期望。'], formulas: [String.raw`V^{\pi}(s)=\mathbb{E}_{\pi,p}[G_t\mid S_t=s]`] },
    ],
    sections: [
      { id: 'discount-boundary', kicker: '持续型轨迹', title: '折扣让无限回报保持有限，也规定远期奖励的权重', paragraphs: ['目标状态不会终止交互；若它持续产生 +1，直接相加会得到发散的无穷和。对第 k 步之后的奖励乘以 γᵏ，并令 0<γ<1，就能让有界奖励形成有限的折扣 return。', 'γ 接近 0 时，只有近期奖励保留明显权重；γ 接近 1 时，远期奖励影响更大，但有限步截断需要覆盖更长的未来。'], formula: String.raw`1+\gamma+\gamma^2+\cdots=\frac{1}{1-\gamma}` },
      { id: 'sample-expectation', kicker: '期望与估计', title: '样本均值可以估计状态价值，但单条轨迹不能定义状态价值', paragraphs: ['若环境模型和所有概率已知，可以直接计算 Gₜ 的条件期望；模型未知时，则从同一状态重复出发，收集多条轨迹的 return 样本。样本均值会随采样结果波动，而状态价值是固定策略与环境共同确定的数学对象。', '因此，一次高 return 只能说明这条轨迹发生了什么，不能证明状态本身具有同样高的价值。随着独立样本增加，样本均值才逐步逼近同一个条件期望。'], formula: String.raw`\widehat{V}_n^{\pi}(s)=\frac{1}{n}\sum_{i=1}^{n}G_t^{(i)}\xrightarrow[n\to\infty]{}V^{\pi}(s)` },
      { id: 'continuing-transfer', kicker: '计算边界 · 轨迹枚举', title: '逐条枚举未来无法高效计算状态价值', paragraphs: ['条件期望完整定义了状态价值，但随机轨迹树会随时间迅速展开，逐条枚举并不是可行的计算方法。return 的递推式已经给出突破口：一条长期未来可以拆成下一步奖励与剩余未来。', '下一章会对这个递推式取条件期望，把完整轨迹树折叠成一步转移与后继状态价值之间的关系。'], formula: String.raw`G_t=R_{t+1}+\gamma G_{t+1}` },
    ],
    summary: ['即时奖励描述一次转移；return 汇总一条轨迹上从当前时刻开始的未来奖励。', '未来尚未实现时 Gₜ 是随机变量；一条实际轨迹只给出它的一个样本。', 'State value 是给定起始状态并遵循策略时，所有可能 return 的条件期望；只有唯一未来时，它才与单条 return 数值相同。', '折扣既控制持续型任务的有限性，也决定远期奖励在当前 return 中保留多少权重。'],
    explorer: explorer.zh,
  },
  en: {
    prerequisite: 'Prerequisites: states, actions, rewards, policies, and trajectories',
    summaryTitle: 'Return belongs to a trajectory; state value belongs to a conditional expectation',
    eyebrow: 'Chapter 2 · Return, discounting, and state value',
    title: 'Return and State Value',
    intro: 'Chapter 1 can already record the reward on each transition, but one reward reports only what just happened and cannot compare paths that lead to different futures. This chapter first defines return from the future rewards on one trajectory, then shows how a stochastic policy or environment can produce many returns from the same start; their conditional expectation is the state value.',
    bridge: 'Continue with the shared 5×5 grid world. First compute discounted return along one realized trajectory. Then hold the start, policy, and discount fixed while changing only transition randomness, so one state visibly produces a distribution of returns.',
    experimentIntro: 'Predict first: if the start, policy, and discount remain fixed while transition randomness rises from zero, what changes about the unique path, a single return, and the state value? Inspect one trajectory first, then compare several futures sampled from the same start.',
    interpretation: 'With zero transition randomness, repeated samples reproduce one trajectory and its unique return equals the state value. Once transitions become stochastic, selecting another trajectory changes the observed return but not the exact value attached to the same start and fixed policy; the sample mean is only an estimate of that conditional expectation.',
    figure: 'Interactive figure 2.1 · Trajectories and state value from one start',
    instruction: 'Hold the policy fixed; vary discount and transition randomness, then compare one return with state value',
    question: 'Why can one start state have many returns but only one Vπ(s)?',
    derivation: returnDerivationEn,
    deepening: returnDeepeningEn,
    prelude: [
      { id: 'reward-to-return', kicker: 'One feedback signal versus an entire future', title: 'Equal immediate rewards can still lead to different long-term outcomes', paragraphs: ['From the start, moving right and moving down can both produce an immediate reward of 0, yet the futures differ: the safe path continues around the forbidden region and reaches the target, whereas the penalized path later receives −1. The first reward alone cannot rank the paths.', 'Reward Rₜ₊₁ belongs to one state transition; return Gₜ belongs to the entire future beginning at time t. It aggregates future rewards and, in continuing tasks, weights them by temporal distance. Once later rewards share one timeline, the safe path has the larger return and long-term quality becomes numerically comparable.'], formulas: [String.raw`\begin{aligned}G_{\mathrm{safe}}&=0+0+0+1=1,\\G_{\mathrm{penalized}}&=0-1+0+1=0.\end{aligned}`] },
      { id: 'return-to-value', kicker: 'One realization to a conditional expectation', title: 'State value uses a conditional expectation to evaluate every future from one start', paragraphs: ['Before the future occurs, Gₜ depends on subsequently sampled actions, transitions, and rewards and is therefore a random variable. After one concrete trajectory occurs, we observe one return sample. If both policy and environment are deterministic, the same start has only that future and every run repeats the same sample.', 'Once policy choice or environment transition is stochastic, one state can generate different trajectories and returns. Neither a lucky nor an unlucky realization is enough to evaluate the state, so state value Vπ(s) is defined as the conditional expectation of Gₜ when starting from s and following π.'], formulas: [String.raw`V^{\pi}(s)=\mathbb{E}_{\pi,p}[G_t\mid S_t=s]`] },
    ],
    sections: [
      { id: 'discount-boundary', kicker: 'Continuing trajectories', title: 'Discount keeps infinite return finite and assigns weight to distant rewards', paragraphs: ['The target does not terminate interaction. If it keeps producing +1, direct summation diverges. Weighting a reward k steps away by γᵏ with 0<γ<1 turns bounded rewards into a finite discounted return.', 'Near zero, γ preserves substantial weight only for nearby rewards. Near one, distant rewards matter more, but a finite truncation must cover a longer future.'], formula: String.raw`1+\gamma+\gamma^2+\cdots=\frac{1}{1-\gamma}` },
      { id: 'sample-expectation', kicker: 'Expectation and estimation', title: 'A sample mean can estimate state value, but one trajectory cannot define it', paragraphs: ['When the model and every probability are known, the conditional expectation of Gₜ can be computed directly. Without the model, repeated starts from the same state provide return samples from many trajectories. The sample mean varies with the sampled evidence, whereas state value is the mathematical object fixed by the policy and environment.', 'A high return therefore reports only what happened on that trajectory; it does not prove that the state has the same high value. As independent samples accumulate, their mean approaches the same conditional expectation.'], formula: String.raw`\widehat{V}_n^{\pi}(s)=\frac{1}{n}\sum_{i=1}^{n}G_t^{(i)}\xrightarrow[n\to\infty]{}V^{\pi}(s)` },
      { id: 'continuing-transfer', kicker: 'Computational limit · Trajectory enumeration', title: 'Enumerating futures one by one cannot compute state value efficiently', paragraphs: ['The conditional expectation completely defines state value, but a stochastic trajectory tree expands rapidly with time, so enumerating every path is not a practical calculation. Return recursion already exposes an escape: a long future separates into the next reward and the remaining future.', 'The next chapter takes a conditional expectation of that recursion and replaces the full trajectory tree with a relation between one-step transitions and successor-state values.'], formula: String.raw`G_t=R_{t+1}+\gamma G_{t+1}` },
    ],
    summary: ['Immediate reward describes one transition; return aggregates future rewards from the current time along one trajectory.', 'Before the future is realized, Gₜ is a random variable; one realized trajectory supplies only one sample.', 'State value is the conditional expectation of all possible returns from a start under a policy. It equals a single return only when there is one possible future.', 'Discounting controls both finiteness in continuing tasks and the weight retained by distant rewards.'],
    explorer: explorer.en,
  },
})
