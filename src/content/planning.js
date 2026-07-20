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

const planningDerivationZh = [
  { id: 'fixed-point', rule: '从 Bellman 最优不动点开始', latex: String.raw`V^*=T^*V^*`, short: '求解最优控制等价于找到最优算子的不动点。', detail: '上一章已经定义 T*。当折扣小于 1 时，它是压缩映射，因此从任意有界初值反复作用都会逼近唯一不动点。', assumptions: [String.raw`0\le\gamma<1`], symbols: [[String.raw`T^*`, 'Bellman 最优算子']] },
  { id: 'value-iteration', rule: '直接做不动点迭代得到 Value Iteration', latex: String.raw`V_{k+1}=T^*V_k`, short: '每轮对所有动作取最大并更新价值。', detail: '展开 T* 后，每个状态都执行一次最优 Bellman backup。中间 V_k 不必等于某个策略的精确价值，但会收敛到 V*。', assumptions: ['每个状态持续被更新'], symbols: [[String.raw`V_k`, '第 k 轮价值估计']] },
  { id: 'policy-evaluation', rule: '固定策略时先求它的价值', latex: String.raw`V^{\pi_k}=T^{\pi_k}V^{\pi_k}`, short: 'Policy Iteration 的评估阶段求当前策略的不动点。', detail: '策略固定后方程变为线性 Bellman 期望方程。可以直接解，也可以反复做 Tπ backup 直到评估残差足够小。', assumptions: ['环境模型已知'], symbols: [[String.raw`T^{\pi_k}`, '当前策略的 Bellman 期望算子']] },
  { id: 'policy-improvement', rule: '对已评估价值做贪心改善', latex: String.raw`\pi_{k+1}(s)\in\operatorname*{arg\,max}_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^{\pi_k}(s')\right]`, short: '逐状态选择基于当前价值的一步最好动作。', detail: '策略改善定理保证新策略不差于旧策略；若策略不再改变，它已经满足最优性条件。', assumptions: ['评估足够准确以支持改善'], symbols: [[String.raw`\pi_{k+1}`, '改善后的策略']] },
  { id: 'truncated-evaluation', rule: '用有限评估深度连接 VI 与 PI', latex: String.raw`V_{k,0}=V_k,\quad V_{k,j}=(T^{\pi_k})^jV_{k,0},\quad \pi_{k+1}=\operatorname{Greedy}(V_{k,j})`, short: 'j 控制每次改善前做多少轮策略评估。', detail: 'j=1 接近 Value Iteration；评估到收敛得到 Policy Iteration。有限 j 的 Truncated PI 在内层评估成本与外层改善频率之间折中。', assumptions: [String.raw`j\ge1`], symbols: [[String.raw`j`, '每轮策略评估深度']] },
]

const planningDerivationEn = [
  { id: 'fixed-point', rule: 'Begin with the Bellman optimal fixed point', latex: String.raw`V^*=T^*V^*`, short: 'Optimal control becomes a fixed-point problem.', detail: 'T* was defined in the previous chapter. With discount below one it is a contraction, so repeated application from any bounded start approaches the unique fixed point.', assumptions: [String.raw`0\le\gamma<1`], symbols: [[String.raw`T^*`, 'Bellman optimality operator']] },
  { id: 'value-iteration', rule: 'Apply fixed-point iteration to obtain Value Iteration', latex: String.raw`V_{k+1}=T^*V_k`, short: 'Each round maximizes over actions and updates value.', detail: 'Expanding T* gives one optimal Bellman backup per state. Intermediate V_k need not be the exact value of any policy, but converges to V*.', assumptions: ['Every state continues to be updated'], symbols: [[String.raw`V_k`, 'value estimate at round k']] },
  { id: 'policy-evaluation', rule: 'Evaluate a fixed policy to its own value', latex: String.raw`V^{\pi_k}=T^{\pi_k}V^{\pi_k}`, short: 'Policy Iteration solves the current-policy fixed point.', detail: 'With the policy fixed, the equation is the linear Bellman expectation equation. Solve it directly or iterate Tπ until the evaluation residual is small.', assumptions: ['The environment model is known'], symbols: [[String.raw`T^{\pi_k}`, 'current-policy Bellman operator']] },
  { id: 'policy-improvement', rule: 'Improve greedily with respect to the evaluated value', latex: String.raw`\pi_{k+1}(s)\in\operatorname*{arg\,max}_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^{\pi_k}(s')\right]`, short: 'Choose the best one-step action under the current value.', detail: 'Policy improvement guarantees the new policy is no worse. If it stops changing, the optimality condition is satisfied.', assumptions: ['Evaluation is accurate enough for improvement'], symbols: [[String.raw`\pi_{k+1}`, 'improved policy']] },
  { id: 'truncated-evaluation', rule: 'Connect VI and PI with finite evaluation depth', latex: String.raw`V_{k,0}=V_k,\quad V_{k,j}=(T^{\pi_k})^jV_{k,0},\quad \pi_{k+1}=\operatorname{Greedy}(V_{k,j})`, short: 'j controls evaluation work before each improvement.', detail: 'j=1 approaches Value Iteration; evaluation to convergence gives Policy Iteration. Finite-j TPI trades inner evaluation cost for outer improvement frequency.', assumptions: [String.raw`j\ge1`], symbols: [[String.raw`j`, 'evaluation depth per round']] },
]

const planningDeepeningZh = [
  {
    id: 'vi-complete-loop', kicker: '算法一 · Value Iteration', title: '一次 VI sweep 必须同时完成动作比较与价值写回',
    paragraphs: ['对每个状态，先用旧价值快照计算全部动作的一步 target，得到 q_k(s,a)；再把最大值写成 V_{k+1}(s)，并记录达到最大值的动作作为当前贪心策略。', '若只展示 V 的变化，就会隐藏“哪个动作竞争获胜”这一控制步骤。同步更新要求整轮都读取 V_k；原地更新则可立即复用本轮新值，但两者求解同一个不动点。'],
    formulas: [String.raw`q_k(s,a)=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V_k(s')\right]`, String.raw`V_{k+1}(s)=\max_a q_k(s,a),\qquad \pi_{k+1}(s)\in\operatorname*{arg\,max}_a q_k(s,a)`],
    pseudocodeTitle: 'Value Iteration', pseudocode: ['初始化 V₀(s)，例如全部置 0', '重复每个 sweep：', '  Δ ← 0', '  对每个状态 s：', '    对每个动作 a 计算 q(s,a) ← Σₛ′,ᵣp(s′,r|s,a)[r+γV(s′)]', '    new ← maxₐ q(s,a)', '    Δ ← max(Δ, |new−V(s)|); V(s) ← new', '直到 Δ 小于阈值', '返回 V 与逐状态贪心策略 arg maxₐ q(s,a)'],
    example: { title: '一个状态的两轮 q 比较', caption: '后继 value 传播后，最大动作可能改变。', headers: ['轮次', 'q(上)', 'q(右)', 'q(下)', '贪心动作', 'V'], rows: [['k=0', '−1.00', '0.00', '0.00', '右/下', '0.00'], ['k=1', '−1.00', '0.90', '0.00', '右', '0.90']] },
  },
  {
    id: 'pi-four-whys', kicker: '算法二 · Policy Iteration', title: 'Policy Iteration 的四个“为什么”决定完整循环',
    paragraphs: ['第一，为什么先评价？因为动作好坏取决于执行后继续遵循当前策略的长期价值。第二，为什么改善不变差？策略改善定理保证对 Vπ 贪心得到的新策略价值不低于旧策略。', '第三，为什么会终止？有限状态动作下，确定性策略数量有限；严格改善不能无限重复。第四，为什么终止时最优？若贪心改善不再改变策略，它已经满足 Bellman 最优性条件。'],
    formulas: [String.raw`q^{\pi_k}(s,\pi_{k+1}(s))\ge V^{\pi_k}(s)\quad\Longrightarrow\quad V^{\pi_{k+1}}(s)\ge V^{\pi_k}(s)`, String.raw`\pi_{k+1}=\pi_k\quad\Longrightarrow\quad V^{\pi_k}=T^*V^{\pi_k}=V^*`],
    pseudocodeTitle: 'Policy Iteration', pseudocode: ['初始化任意确定性策略 π', '重复：', '  Policy evaluation：求解或迭代 V ← TπV，直到评估收敛', '  stable ← true', '  对每个状态 s：', '    old ← π(s)', '    π(s) ← arg maxₐ Σₛ′,ᵣp(s′,r|s,a)[r+γV(s′)]', '    若 π(s) ≠ old，则 stable ← false', '直到 stable=true；返回 π 与 V'],
    theorem: { claim: '准确 Policy Iteration 产生单调不降的策略价值，并在有限步策略改善后终止于最优策略。', why: '每次贪心改善使用当前策略的准确 value，且有限确定性策略集合不允许无限严格改善。', conditions: ['有限状态与动作', '每轮 policy evaluation 足够准确'] },
  },
  {
    id: 'tpi-continuum', kicker: '算法三 · Truncated Policy Iteration', title: '有限评估深度把 VI 与 PI 连接成同一算法族',
    paragraphs: ['PI 的完整评价可能在策略尚会继续改变时花费过多计算。TPI 每轮只执行 j 次 Tπ backup，然后立刻改善。j=1 时频繁改善，接近 VI；j 足够大使评价收敛时就是 PI。', 'TPI 的意义不是保证每轮都最优，而是在内层 evaluation 与外层 improvement 之间分配预算。比较时必须统计真实 state backups，而非只数外层轮次。'],
    formulas: [String.raw`V_{k,j}=(T^{\pi_k})^jV_{k,0},\qquad \pi_{k+1}=\operatorname{Greedy}(V_{k,j})`],
    pseudocodeTitle: 'Truncated Policy Iteration', pseudocode: ['初始化 V 与策略 π', '重复外层迭代：', '  重复 j 次：对全部状态执行 V ← TπV', '  对全部状态执行 π_new ← Greedy(V)', '  记录 policy changes 与累计 state backups', '  π ← π_new', '直到最优 Bellman 残差小于阈值；返回 V 与 π'],
    theorem: { claim: '在折扣有限 MDP 中，固定 j≥1 的 TPI 仍收敛到 V*。', why: '有限评估与贪心改善组合仍持续减少到最优不动点的误差；j 改变传播速度与计算分配，不改变目标。', conditions: [String.raw`0\le\gamma<1`, String.raw`j\ge1`] },
    handoff: '三种 planning 算法都依赖对 p(s′,r|s,a) 的精确求和。下一部分将保留这些目标，却改用真实经验样本估计它们。',
  },
]

const planningDeepeningEn = [
  {
    id: 'vi-complete-loop', kicker: 'Algorithm one · Value Iteration', title: 'One VI sweep must compare actions before writing value',
    paragraphs: ['At each state, use the old value snapshot to calculate every action target q_k(s,a). Write their maximum into V_{k+1}(s) and record a maximizing action as the current greedy policy.', 'Showing only V hides the control decision. Synchronous updates read V_k for the entire sweep; in-place updates reuse fresh values sooner, but both seek the same fixed point.'],
    formulas: [String.raw`q_k(s,a)=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V_k(s')\right]`, String.raw`V_{k+1}(s)=\max_a q_k(s,a),\qquad \pi_{k+1}(s)\in\operatorname*{arg\,max}_a q_k(s,a)`],
    pseudocodeTitle: 'Value Iteration', pseudocode: ['Initialize V₀(s), for example to zero', 'Repeat each sweep:', '  Δ ← 0', '  For every state s:', '    For every action a compute q(s,a) ← Σₛ′,ᵣp(s′,r|s,a)[r+γV(s′)]', '    new ← maxₐ q(s,a)', '    Δ ← max(Δ, |new−V(s)|); V(s) ← new', 'Until Δ is below tolerance', 'Return V and the statewise greedy policy arg maxₐ q(s,a)'],
    example: { title: 'Two rounds of action comparison at one state', caption: 'As successor values propagate, the maximizing action may change.', headers: ['Round', 'q(up)', 'q(right)', 'q(down)', 'Greedy', 'V'], rows: [['k=0', '−1.00', '0.00', '0.00', 'right/down', '0.00'], ['k=1', '−1.00', '0.90', '0.00', 'right', '0.90']] },
  },
  {
    id: 'pi-four-whys', kicker: 'Algorithm two · Policy Iteration', title: 'Four why-questions determine the complete Policy Iteration loop',
    paragraphs: ['Why evaluate first? Action quality depends on following the current policy afterward. Why does improvement not hurt? The policy-improvement theorem makes a policy greedy with respect to Vπ no worse.', 'Why terminate? There are finitely many deterministic policies and strict improvement cannot continue forever. Why is a stable policy optimal? No greedy change means it satisfies Bellman optimality.'],
    formulas: [String.raw`q^{\pi_k}(s,\pi_{k+1}(s))\ge V^{\pi_k}(s)\quad\Longrightarrow\quad V^{\pi_{k+1}}(s)\ge V^{\pi_k}(s)`, String.raw`\pi_{k+1}=\pi_k\quad\Longrightarrow\quad V^{\pi_k}=T^*V^{\pi_k}=V^*`],
    pseudocodeTitle: 'Policy Iteration', pseudocode: ['Initialize any deterministic policy π', 'Repeat:', '  Policy evaluation: solve or iterate V ← TπV to convergence', '  stable ← true', '  For every state s:', '    old ← π(s)', '    π(s) ← arg maxₐ Σₛ′,ᵣp(s′,r|s,a)[r+γV(s′)]', '    If π(s) ≠ old, set stable ← false', 'Until stable=true; return π and V'],
    theorem: { claim: 'Exact Policy Iteration produces non-decreasing policy values and reaches an optimal policy after finitely many improvements.', why: 'Each greedy step uses the exact current value, and a finite deterministic-policy set cannot support infinite strict improvements.', conditions: ['Finite state and action sets', 'Sufficiently accurate policy evaluation'] },
  },
  {
    id: 'tpi-continuum', kicker: 'Algorithm three · Truncated Policy Iteration', title: 'Finite evaluation depth connects VI and PI as one family',
    paragraphs: ['Full evaluation can spend too much work on a policy that will soon change. TPI applies j evaluation sweeps before improving. j=1 resembles VI; evaluation to convergence becomes PI.', 'TPI allocates computation between inner evaluation and outer improvement. Fair comparison must count actual state backups rather than outer rounds alone.'],
    formulas: [String.raw`V_{k,j}=(T^{\pi_k})^jV_{k,0},\qquad \pi_{k+1}=\operatorname{Greedy}(V_{k,j})`],
    pseudocodeTitle: 'Truncated Policy Iteration', pseudocode: ['Initialize V and policy π', 'Repeat outer iterations:', '  Repeat j times: update every state with V ← TπV', '  For every state set π_new ← Greedy(V)', '  Record policy changes and cumulative state backups', '  π ← π_new', 'Until optimal Bellman residual is below tolerance; return V and π'],
    theorem: { claim: 'For a finite discounted MDP, fixed j≥1 TPI still converges to V*.', why: 'Finite evaluation plus greedy improvement continues reducing optimality error; j changes propagation and compute allocation, not the objective.', conditions: [String.raw`0\le\gamma<1`, String.raw`j\ge1`] },
    handoff: 'All three planning methods exactly sum p(s′,r|s,a). The next part preserves the targets but estimates them from experience.',
  },
]

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
    experimentIntro: '下面给三种方法完全相同的环境、初始值、初始策略与停止阈值。横轴统一使用实际 state backup 数，而不是不可直接比较的外层轮数。',
    interpretation: '曲线更快下降不等于单轮更便宜。拖动 checkpoint 时同时检查累计 backups、策略改变数与网格中的传播范围，才能看出计算被花在深度评估还是频繁改善上。',
    derivation: planningDerivationZh,
    deepening: planningDeepeningZh,
    figure: '交互图 5.1 · Planning Arena',
    instruction: '改变策略评估深度并拖动 checkpoint，比较计算量、策略改变和价值传播',
    question: '在相同环境与停止标准下，VI、PI 与 Truncated PI 把计算预算分别花在哪里？',
    prelude: [
      { id: 'value-iteration', kicker: '频繁改善', title: 'Value Iteration：每次只向当前贪心策略借一步', paragraphs: ['从任意 v₀ 出发，先基于当前值构造贪心策略，再用它做一步 backup。', '中间的 vₖ 通常不是任何完整策略的真实价值，但 T* 的压缩性保证它最终逼近 V*。'], formulas: [String.raw`v_{k+1}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma v_k(s')\right]`] },
      { id: 'policy-iteration', kicker: '深度评估', title: 'Policy Iteration：先求清楚当前策略，再改善', paragraphs: ['每一轮先解 vπₖ = Tπₖvπₖ，再对 vπₖ 做一次贪心改善。', '外层轮数往往少，但每轮内部包含许多 evaluation sweeps，因此不能只比较“迭代了几轮”。'], formulas: [String.raw`\pi_k\xrightarrow{\text{evaluate}}v^{\pi_k}\xrightarrow{\text{greedy improve}}\pi_{k+1}`] },
    ],
    sections: [
      { id: 'truncation-continuum', kicker: '统一视角', title: 'Truncated PI 把两端连成一条连续谱', paragraphs: ['评估一次接近 Value Iteration；评估到收敛就是 Policy Iteration；有限 j 则位于中间。', 'j 不是越大越好：深度评估减少外层策略更新，却增加每轮 backups。'], formula: String.raw`j=1\ \longleftarrow\ \text{Truncated PI}\ \longrightarrow\ j=\infty` },
      { id: 'fair-budget', kicker: '比较边界', title: '公平比较必须显式计算内部 backups', paragraphs: ['外层 iteration、evaluation sweep 和 state backup 是不同粒度的成本。', '本章以 25 个状态各更新一次记作 25 backups，并同时记录策略改变数量，避免单一全局残差替代算法机制。'], formula: String.raw`\text{compute}=\sum \text{outer rounds}\times\text{evaluation sweeps}\times|\mathcal{S}|` },
      { id: 'model-free-transfer', kicker: '迁移到下一部分', title: 'Part I 的算法都假设环境模型已知', paragraphs: ['VI、PI 和 TPI 的每次 backup 都显式求和 p(s′,r|s,a)。', '进入 Part II 后，环境模型不再可查询；同一个期望 target 将由完整 episode 或单步样本近似。'], formula: String.raw`\text{exact expectation}\ \longrightarrow\ \text{sampled return or TD target}` },
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
    experimentIntro: 'Give all three methods the same environment, initial value, initial policy, and stopping threshold. The horizontal axis counts actual state backups rather than incomparable outer rounds.',
    interpretation: 'A faster-falling curve does not imply a cheaper outer round. Inspect cumulative backups, policy changes, and propagation together to see whether compute went to deep evaluation or frequent improvement.',
    derivation: planningDerivationEn,
    deepening: planningDeepeningEn,
    figure: 'Interactive figure 5.1 · Planning Arena',
    instruction: 'Change evaluation depth and scrub the checkpoint to compare computation, policy changes, and propagation',
    question: 'Under one environment and stopping rule, where do VI, PI, and Truncated PI spend their compute?',
    prelude: [
      { id: 'value-iteration', kicker: 'Improve frequently', title: 'Value Iteration borrows one step from the current greedy policy', paragraphs: ['Starting from any v₀, form a greedy policy from current values and take one backup with it.', 'Intermediate vₖ is usually not the true value of any complete policy, but contraction of T* drives it toward V*.'], formulas: [String.raw`v_{k+1}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma v_k(s')\right]`] },
      { id: 'policy-iteration', kicker: 'Evaluate deeply', title: 'Policy Iteration solves the current policy before improving it', paragraphs: ['Each round first solves vπₖ = Tπₖvπₖ and then makes one greedy improvement.', 'Outer rounds may be few, but each contains many evaluation sweeps, so round counts alone are not comparable.'], formulas: [String.raw`\pi_k\xrightarrow{\text{evaluate}}v^{\pi_k}\xrightarrow{\text{greedy improve}}\pi_{k+1}`] },
    ],
    sections: [
      { id: 'truncation-continuum', kicker: 'Unified view', title: 'Truncated PI connects the two endpoints', paragraphs: ['One evaluation sweep approaches Value Iteration; evaluation to convergence is Policy Iteration; finite j lies between them.', 'Larger j is not automatically better: it reduces outer policy updates but increases backups per round.'], formula: String.raw`j=1\ \longleftarrow\ \text{Truncated PI}\ \longrightarrow\ j=\infty` },
      { id: 'fair-budget', kicker: 'Comparison boundary', title: 'Fair comparison must expose internal backups', paragraphs: ['Outer iterations, evaluation sweeps, and state backups are different cost granularities.', 'This chapter counts one update of each of 25 states as 25 backups and records policy changes alongside residual, so one global curve cannot replace the mechanism.'], formula: String.raw`\text{compute}=\sum \text{outer rounds}\times\text{evaluation sweeps}\times|\mathcal{S}|` },
      { id: 'model-free-transfer', kicker: 'Transfer to the next part', title: 'Every Part I algorithm assumes a known environment model', paragraphs: ['Every VI, PI, and TPI backup explicitly sums over p(s′,r|s,a).', 'In Part II the model is no longer queryable; complete episodes or one-step samples approximate the same expected target.'], formula: String.raw`\text{exact expectation}\ \longrightarrow\ \text{sampled return or TD target}` },
    ],
    summary: ['VI takes one evaluation step and improves frequently; PI evaluates deeply before improving.', 'TPI connects them with finite evaluation depth, allocating computation between inner and outer loops.', 'Under the same model and discount, all three converge to the same optimal value fixed point.'],
    explorer: explorer.en,
  },
})
