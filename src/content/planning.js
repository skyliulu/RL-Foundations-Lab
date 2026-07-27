import { assertFoundationChapterDefinition } from './schema.js'

export const planningPresetConfigs = {
  'early-propagation': { gamma: 0.9, noise: 0, truncation: 3, budget: 225 },
  'vi-endpoint': { gamma: 0.9, noise: 0, truncation: 1, budget: 200 },
  'middle-ground': { gamma: 0.9, noise: 0, truncation: 5, budget: 500 },
  'stochastic-model': { gamma: 0.9, noise: 0.2, truncation: 3, budget: 600 },
}

const sources = [
  { id: 'value-iteration', label: 'L4 · Value iteration derivation, pseudocode, and example', pages: 'PDF pp.5-13', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
  { id: 'policy-iteration', label: 'L4 · Policy evaluation and policy improvement', pages: 'PDF pp.15-29', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
  { id: 'truncated-pi', label: 'L4 · VI, PI, and truncated policy iteration continuum', pages: 'PDF pp.31-38', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
]

const explorer = {
  zh: {
    figureTitle: 'Planning Arena', protocol: '公平比较协议', protocolText: '同一环境、折扣因子、随机性、初始 value、初始贪心 policy 与停止阈值', gamma: '折扣因子 γ', noise: '动作随机性', truncation: '每轮策略评估 sweeps', budget: '匹配累计 backup 预算', convergence: '最优 Bellman 残差', residualAxis: '残差', backups: '累计 backups', policyChanges: '本轮 policy changes', policyUpdates: '策略更新轮数', finalError: '最终最大误差', algorithm: '算法', vi: 'Value Iteration', tpi: 'Truncated PI', pi: 'Policy Iteration', viShort: 'VI · 每次评价 1 个 sweep', tpiShort: 'TPI · 每次评价有限 sweeps', piShort: 'PI · 每次评价到收敛', propagation: '共同 backup 时钟下的 value 传播', residualChart: '残差随计算量变化', selectedBudget: '共同计算预算', converged: '已收敛', running: '传播中', sameLimit: '三条路径，同一个最优价值', preset: '观察预设', chartHint: '横轴使用累计 state backups；曲线作为最终结果证据，执行轨道负责解释每段计算。', mapHint: '每种方法显示共同预算时的实时内部状态；格内数字与策略箭头提供非颜色证据。', mechanism: '一次外层更新的内部证据', mechanismHint: '比较被评估策略、内层 sweeps、value 写回、动作竞争与改善后策略，检查状态', evaluatedPolicy: '当前固定策略', evaluationSweeps: '已完成评价 sweeps', valueChange: '本轮 value 变化', actionComparison: '当前最大与次大动作价值', improvedPolicy: '刚改善的策略', nextGreedy: '若现在改善', phaseReady: '等待第一次评价', phaseEvaluation: '正在固定策略评价', phaseImprovement: '刚完成贪心改善', currentRound: '外层轮次', currentSweep: '本轮 sweep', sharedClock: '共同 state-backup 时钟', previousBudget: '后退一个 sweep', nextBudget: '前进一个 sweep', playClock: '播放计算', pauseClock: '暂停', cycleComparison: '三种算法在同一时钟上的评价—改善循环', cycleHint: '数字格表示当前外层轮次已经完成的评价 sweeps；菱形表示策略改善。点击轨道选择下方证据。', currentEvidence: '所选算法与状态的当前证据', policyFrozen: '评价阶段只更新 value，策略箭头保持冻结；动作排序只是下一次改善的预览。', policyJustImproved: '这一时刻刚根据当前动作价值更新策略；下一次 sweep 将固定这套新策略。', clockReady: '算法尚未执行第一个 sweep。', convergenceDetails: '展开最终收敛曲线与总计算量', presetItems: {
      'early-propagation': { title: '早期传播', note: '固定 225 次 backups，比较三种评估深度。' },
      'vi-endpoint': { title: 'VI 端点', note: '把评估深度设为 1；TPI 与 VI 的 trace 完全一致。' },
      'middle-ground': { title: '折中深度', note: '每轮评估 5 次，在频繁改善与深度评估间折中。' },
      'stochastic-model': { title: '随机模型', note: '共享 0.2 动作随机性，比较协议保持不变。' },
    },
  },
  en: {
    figureTitle: 'Planning Arena', protocol: 'Fair comparison protocol', protocolText: 'Same environment, discount, randomness, initial value, initial greedy policy, and stopping tolerance', gamma: 'Discount γ', noise: 'Action randomness', truncation: 'Policy-evaluation sweeps per round', budget: 'Matched cumulative-backup budget', convergence: 'Optimal Bellman residual', residualAxis: 'Residual', backups: 'Cumulative backups', policyChanges: 'Policy changes this round', policyUpdates: 'Policy-update rounds', finalError: 'Final maximum error', algorithm: 'Algorithm', vi: 'Value Iteration', tpi: 'Truncated PI', pi: 'Policy Iteration', viShort: 'VI · one sweep per evaluation', tpiShort: 'TPI · finite evaluation', piShort: 'PI · evaluate to convergence', propagation: 'Value propagation on one backup clock', residualChart: 'Residual versus computation', selectedBudget: 'Shared compute budget', converged: 'Converged', running: 'Propagating', sameLimit: 'Three paths to one optimal value', preset: 'Observation presets', chartHint: 'The horizontal axis counts state backups. The curve supplies outcome evidence while the execution lanes explain each compute segment.', mapHint: 'Each method exposes its live internal state at the shared budget; numbers and policy arrows provide non-color evidence.', mechanism: 'Internal evidence for one outer update', mechanismHint: 'Compare evaluated policy, inner sweeps, value write-back, action competition, and improved policy at state', evaluatedPolicy: 'Frozen policy', evaluationSweeps: 'Completed evaluation sweeps', valueChange: 'Value change this round', actionComparison: 'Current largest and runner-up action values', improvedPolicy: 'Just-improved policy', nextGreedy: 'If improved now', phaseReady: 'Waiting for the first evaluation', phaseEvaluation: 'Evaluating a frozen policy', phaseImprovement: 'Greedy improvement just completed', currentRound: 'Outer round', currentSweep: 'Sweep in this round', sharedClock: 'Shared state-backup clock', previousBudget: 'Back one sweep', nextBudget: 'Forward one sweep', playClock: 'Play computation', pauseClock: 'Pause', cycleComparison: 'Evaluation–improvement cycles on one shared clock', cycleHint: 'Numbered cells are evaluation sweeps completed in the current outer round; the diamond is policy improvement. Select a lane to inspect its evidence below.', currentEvidence: 'Current evidence for the selected algorithm and state', policyFrozen: 'Evaluation updates value while policy arrows stay frozen; the action ranking only previews the next improvement.', policyJustImproved: 'The policy has just been updated from current action values; the next sweep will hold this new policy fixed.', clockReady: 'The algorithm has not executed its first sweep.', convergenceDetails: 'Open final convergence curves and total computation', presetItems: {
      'early-propagation': { title: 'Early propagation', note: 'Fix 225 backups and compare three evaluation depths.' },
      'vi-endpoint': { title: 'VI endpoint', note: 'Set evaluation depth to one; TPI and VI traces are identical.' },
      'middle-ground': { title: 'Middle depth', note: 'Five evaluation sweeps balance frequent improvement and deeper evaluation.' },
      'stochastic-model': { title: 'Stochastic model', note: 'Share 0.2 action randomness without changing the protocol.' },
    },
  },
}

const math = (latex) => ({ latex })

const planningDerivationZh = [
  { id: 'fixed-point', rule: '最优 value 表在再次更新后保持不变', latex: String.raw`V^*=T^*V^*`, short: '最优表已经包含全部长期后果，再执行一轮最优 backup 不会改变它。', detail: ['前文已经把 ', math('T^*'), ' 定义为“读取一张 value 表并为所有状态写出最大动作价值”的整表算子。当折扣小于 1 时，两张输入表的最大差异经过 ', math('T^*'), ' 后至多保留 ', math('\\gamma'), ' 倍，所以反复更新会逐步消除初值差异，并逼近唯一不动点。'], assumptions: [String.raw`0\le\gamma<1`], symbols: [[String.raw`T^*`, '对整张旧表执行一次同步最优 sweep 的算子']] },
  { id: 'value-iteration', rule: '把新表继续作为下一轮旧表', latex: String.raw`V_{k+1}=T^*V_k`, short: ['每次 sweep 都读取完整的 ', math('V_k'), '，并在结束时整体得到 ', math('V_{k+1}'), '。'], detail: ['这条递推就是 Value Iteration。每一轮让目标区域的信息再向外传播一层；中间的 ', math('V_k'), ' 只是第 ', math('k'), ' 轮数值快照，不要求等于某一固定策略的准确 value。'], assumptions: ['每一轮都更新全部状态', '一轮内所有 backup 读取同一张旧表'], symbols: [[String.raw`V_k`, '第 k 次完整 sweep 开始时的整张 value 估计']] },
  { id: 'policy-evaluation', rule: '固定策略时先求它的价值', latex: String.raw`V^{\pi_k}=T^{\pi_k}V^{\pi_k}`, short: 'Policy Iteration 的评估阶段求当前策略的不动点。', detail: '策略固定后方程变为线性 Bellman 期望方程。可以直接解，也可以反复做 Tπ backup 直到评估残差足够小。', assumptions: ['环境模型已知'], symbols: [[String.raw`T^{\pi_k}`, '当前策略的 Bellman 期望算子']] },
  { id: 'policy-improvement', rule: '对准确策略价值做贪心改善', latex: String.raw`\begin{aligned}\pi_{k+1}(s)&\in\operatorname*{arg\,max}_a q^{\pi_k}(s,a),\\q^{\pi_k}(s,a)&=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^{\pi_k}(s')\right]\end{aligned}`, short: '逐状态选择基于当前策略价值的一步最好动作。', detail: '策略改善定理保证新策略不差于旧策略；若贪心策略不再改变，它已经满足 Bellman 最优性条件。', assumptions: ['使用准确的当前策略价值', '并列动作采用固定规则'], symbols: [[String.raw`\pi_{k+1}`, '改善后的策略'], [String.raw`q^{\pi_k}`, '先执行一个动作、随后遵循当前策略的动作价值']] },
  { id: 'truncated-evaluation', rule: '有限评估深度产生 Truncated Policy Iteration', latex: String.raw`\begin{aligned}V_{k,0}&=V_{k-1},\\V_{k,j}&=(T^{\pi_k})^jV_{k,0},\\\pi_{k+1}&\in\operatorname{Greedy}(V_{k,j})\end{aligned}`, short: '每轮改善前只执行固定次数的策略评价。', detail: '若先令当前策略对上一轮 value 贪心，则 j=1 与 Value Iteration 完全相同；让内层评价收敛则恢复准确 Policy Iteration。', assumptions: [String.raw`j\ge1`, String.raw`\pi_k\in\operatorname{Greedy}(V_{k-1})`], symbols: [[String.raw`j`, '每轮策略评估深度'], [String.raw`V_{k,0}`, '从上一轮 value 继承的 warm start']] },
]

const planningDerivationEn = [
  { id: 'fixed-point', rule: 'The optimal value table stays unchanged after another update', latex: String.raw`V^*=T^*V^*`, short: 'The optimal table already contains every long-run consequence, so another optimal sweep cannot change it.', detail: ['The preceding prose defines ', math('T^*'), ' as the full-table operator that reads one value table and writes the largest action value at every state. With discount below one, the largest difference between two input tables is at most ', math('\\gamma'), ' times as large after ', math('T^*'), ', so repeated updates erase initialization differences and approach one fixed point.'], assumptions: [String.raw`0\le\gamma<1`], symbols: [[String.raw`T^*`, 'one synchronous optimal sweep over the whole old table']] },
  { id: 'value-iteration', rule: 'Feed the new table into the next sweep', latex: String.raw`V_{k+1}=T^*V_k`, short: ['Each sweep reads the complete ', math('V_k'), ' and produces the complete ', math('V_{k+1}'), '.'], detail: ['This recurrence is Value Iteration. Each sweep carries information from the goal region one layer farther across the grid; intermediate ', math('V_k'), ' is merely the numerical snapshot at sweep ', math('k'), ' and need not be the exact value of any fixed policy.'], assumptions: ['Every sweep updates every state', 'Every backup within a sweep reads the same old table'], symbols: [[String.raw`V_k`, 'the complete value estimate at the start of sweep k']] },
  { id: 'policy-evaluation', rule: 'Evaluate a fixed policy to its own value', latex: String.raw`V^{\pi_k}=T^{\pi_k}V^{\pi_k}`, short: 'Policy Iteration solves the current-policy fixed point.', detail: 'With the policy fixed, the equation is the linear Bellman expectation equation. Solve it directly or iterate Tπ until the evaluation residual is small.', assumptions: ['The environment model is known'], symbols: [[String.raw`T^{\pi_k}`, 'current-policy Bellman operator']] },
  { id: 'policy-improvement', rule: 'Improve greedily with respect to the exact policy value', latex: String.raw`\begin{aligned}\pi_{k+1}(s)&\in\operatorname*{arg\,max}_a q^{\pi_k}(s,a),\\q^{\pi_k}(s,a)&=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V^{\pi_k}(s')\right]\end{aligned}`, short: 'Choose the best one-step action under the exact current-policy value.', detail: 'Policy improvement guarantees the new policy is no worse. If the greedy policy stops changing, Bellman optimality is satisfied.', assumptions: ['Use the exact current-policy value', 'Resolve ties with a fixed rule'], symbols: [[String.raw`\pi_{k+1}`, 'improved policy'], [String.raw`q^{\pi_k}`, 'action value for one action followed by the current policy']] },
  { id: 'truncated-evaluation', rule: 'Finite evaluation depth produces Truncated Policy Iteration', latex: String.raw`\begin{aligned}V_{k,0}&=V_{k-1},\\V_{k,j}&=(T^{\pi_k})^jV_{k,0},\\\pi_{k+1}&\in\operatorname{Greedy}(V_{k,j})\end{aligned}`, short: 'Apply a fixed number of evaluation sweeps before improving.', detail: 'When the current policy is greedy with respect to the previous value, j=1 is exactly Value Iteration; evaluating the inner loop to convergence recovers exact Policy Iteration.', assumptions: [String.raw`j\ge1`, String.raw`\pi_k\in\operatorname{Greedy}(V_{k-1})`], symbols: [[String.raw`j`, 'evaluation depth per round'], [String.raw`V_{k,0}`, 'warm start inherited from the previous outer value']] },
]

const viWalkthroughData = {
  kind: 'vi',
  states: [
    { id: String.raw`s_1` },
    { id: String.raw`s_2` },
    { id: String.raw`s_3` },
    { id: String.raw`s_4` },
  ],
  rounds: [
    {
      k: 0,
      oldValues: [0, 0, 0, 0],
      newValues: [0, 1, 1, 1],
      states: [
        { q: [-1, -1, 0, -1, 0], action: 4, value: 0 },
        { q: [-1, -1, 1, 0, -1], action: 2, value: 1 },
        { q: [0, 1, -1, -1, 0], action: 1, value: 1 },
        { q: [-1, -1, -1, 0, 1], action: 4, value: 1 },
      ],
    },
    {
      k: 1,
      oldValues: [0, 1, 1, 1],
      newValues: [0.9, 1.9, 1.9, 1.9],
      states: [
        { q: [-1, -0.1, 0.9, -1, 0], action: 2, value: 0.9 },
        { q: [-0.1, -0.1, 1.9, 0, -0.1], action: 2, value: 1.9 },
        { q: [0, 1.9, -0.1, -0.1, 0.9], action: 1, value: 1.9 },
        { q: [-0.1, -0.1, -0.1, 0.9, 1.9], action: 4, value: 1.9 },
      ],
    },
    {
      k: 2,
      oldValues: [0.9, 1.9, 1.9, 1.9],
      newValues: [1.71, 2.71, 2.71, 2.71],
      states: [
        { q: [-0.19, 0.71, 1.71, -0.19, 0.81], action: 2, value: 1.71 },
        { q: [0.71, 0.71, 2.71, 0.81, 0.71], action: 2, value: 2.71 },
        { q: [0.81, 2.71, 0.71, 0.71, 1.71], action: 1, value: 2.71 },
        { q: [0.71, 0.71, 0.71, 1.71, 2.71], action: 4, value: 2.71 },
      ],
    },
  ],
}

const piWalkthroughData = {
  kind: 'pi',
  states: [{ id: String.raw`s_1` }, { id: String.raw`s_2` }],
  initialValues: [0, 0],
  actionLatex: [String.raw`a_\ell`, String.raw`a_0`, String.raw`a_r`],
  cycles: [
    {
      k: 0,
      policy: ['←', '←'],
      evaluation: [
        { values: [-1, 0] },
        { values: [-1.9, -0.9] },
        { values: [-10, -9] },
      ],
      equations: [
        String.raw`V^{\pi_0}(s_1)=-1+0.9V^{\pi_0}(s_1)`,
        String.raw`V^{\pi_0}(s_2)=0+0.9V^{\pi_0}(s_1)`,
      ],
      actionValues: [[-10, -9, -7.1], [-9, -7.1, -9.1]],
      bestActions: [2, 1],
      nextPolicy: ['→', '●'],
      nextPolicyLatex: [String.raw`a_r`, String.raw`a_0`],
      stable: false,
    },
    {
      k: 1,
      policy: ['→', '●'],
      evaluation: [
        { values: [-7.1, -7.1] },
        { values: [-5.39, -5.39] },
        { values: [10, 10] },
      ],
      equations: [
        String.raw`V^{\pi_1}(s_1)=1+0.9V^{\pi_1}(s_2)`,
        String.raw`V^{\pi_1}(s_2)=1+0.9V^{\pi_1}(s_2)`,
      ],
      actionValues: [[8, 9, 10], [9, 10, 8]],
      bestActions: [2, 1],
      nextPolicy: ['→', '●'],
      nextPolicyLatex: [String.raw`a_r`, String.raw`a_0`],
      stable: true,
    },
  ],
}

const planningDeepeningZh = [
  {
    id: 'vi-complete-loop', kicker: '算法一 · Value Iteration', title: '一次同步 sweep 从旧 value 生成完整的新 value',
    paragraphs: ['每轮都先冻结旧表 V_k。对每个状态和动作，用同一份旧表计算 q_k(s,a)，把所有状态的新值写入另一张 V_{k+1}；整轮结束后才替换旧表。达到最大动作价值的动作同时组成下一轮贪心策略。', '这个双缓冲写法与下面的实现完全一致，也让四状态例子中的每个数字都只依赖同一个 k 时刻。原地更新是另一种有效变体，但不应与本章的同步推导混写。'],
    formulas: [String.raw`q_k(s,a)=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V_k(s')\right]`, String.raw`\begin{aligned}V_{k+1}(s)&=\max_a q_k(s,a),\\\pi_{k+1}(s)&\in\operatorname*{arg\,max}_a q_k(s,a)\end{aligned}`],
    pseudocodeTitle: 'Value Iteration', pseudocode: ['已知全部状态动作的概率模型，并初始化 V_0', '当 V_k 尚未收敛时，创建与 V_k 分离的 V_{k+1}', '  对每个状态 s：', '    对每个动作 a，用 V_k 计算 q_k(s,a)', '    令 π_{k+1}(s) 为达到最大 q_k(s,a) 的动作', '    把 max_a q_k(s,a) 写入 V_{k+1}(s)', '  计算 ||V_{k+1}-V_k||，再整体令 V_k ← V_{k+1}', '残差低于阈值后，返回 V_k 与贪心策略 π_k'],
    walkthrough: {
      ...viWalkthroughData,
      eyebrow: '三轮同步执行 · 四状态网格',
      title: '每轮写满新表，再把它提交为下一轮旧表',
      caption: '15 个执行位置连续展示三轮 sweep。每轮先做四次状态 backup，第五步明确交换读写角色；下一轮随即从刚提交的 value 表继续传播。',
    },
    example: {
      title: '四状态网格的前两轮动作比较',
      caption: '折扣因子为 0.9。第一轮从全零 value 出发；第二轮复用完整的 V_1。并列时采用固定动作顺序，因此 s_1 在第一轮选择 a_5。',
      headers: ['轮次', '状态', math(String.raw`q_k(s,a_1)`), math(String.raw`q_k(s,a_2)`), math(String.raw`q_k(s,a_3)`), math(String.raw`q_k(s,a_4)`), math(String.raw`q_k(s,a_5)`), '贪心动作与新 value'],
      rows: [
        [math(String.raw`k=0`), math(String.raw`s_1`), math('-1'), math('-1'), math('0'), math('-1'), math('0'), math(String.raw`a_5,\;V_1(s_1)=0`)],
        [math(String.raw`k=0`), math(String.raw`s_2`), math('-1'), math('-1'), math('1'), math('0'), math('-1'), math(String.raw`a_3,\;V_1(s_2)=1`)],
        [math(String.raw`k=0`), math(String.raw`s_3`), math('0'), math('1'), math('-1'), math('-1'), math('0'), math(String.raw`a_2,\;V_1(s_3)=1`)],
        [math(String.raw`k=0`), math(String.raw`s_4`), math('-1'), math('-1'), math('-1'), math('0'), math('1'), math(String.raw`a_5,\;V_1(s_4)=1`)],
        [math(String.raw`k=1`), math(String.raw`s_1`), math('-1'), math('-0.1'), math('0.9'), math('-1'), math('0'), math(String.raw`a_3,\;V_2(s_1)=0.9`)],
        [math(String.raw`k=1`), math(String.raw`s_2`), math('-0.1'), math('-0.1'), math('1.9'), math('0'), math('-0.1'), math(String.raw`a_3,\;V_2(s_2)=1.9`)],
        [math(String.raw`k=1`), math(String.raw`s_3`), math('0'), math('1.9'), math('-0.1'), math('-0.1'), math('0.9'), math(String.raw`a_2,\;V_2(s_3)=1.9`)],
        [math(String.raw`k=1`), math(String.raw`s_4`), math('-0.1'), math('-0.1'), math('-0.1'), math('0.9'), math('1.9'), math(String.raw`a_5,\;V_2(s_4)=1.9`)],
      ],
    },
  },
  {
    id: 'pi-four-whys', kicker: '算法二 · Policy Iteration', title: '准确评价让每次贪心改善都不降低策略价值',
    paragraphs: ['VI 在每次浅层传播后立即重新选动作，许多外层轮次都在重复贪心比较。Policy Iteration 改为先固定当前策略 π_k，通过线性方程或反复作用 T^{π_k} 得到准确的 V^{π_k}，再用这个长期价值比较动作。', '策略改善定理保证对准确 V^{π_k} 贪心得到的 π_{k+1} 不差于 π_k。有限确定性策略集合不能容纳无限次严格改善；当贪心动作不再改变时，当前 value 同时满足 Bellman 期望方程与最优方程，因此等于 V^*。'],
    formulas: [String.raw`\begin{aligned}V^{\pi_k}&=(I-\gamma P^{\pi_k})^{-1}r^{\pi_k},\\V_{j+1}^{\pi_k}&=T^{\pi_k}V_j^{\pi_k}\end{aligned}`, String.raw`\begin{aligned}q^{\pi_k}(s,\pi_{k+1}(s))&\ge V^{\pi_k}(s)\\\Longrightarrow\quad V^{\pi_{k+1}}(s)&\ge V^{\pi_k}(s)\end{aligned}`, String.raw`\pi_{k+1}=\pi_k\quad\Longrightarrow\quad V^{\pi_k}=T^*V^{\pi_k}=V^*`],
    pseudocodeTitle: 'Policy Iteration', pseudocode: ['初始化任意确定性策略 π', '重复：', '  Policy evaluation：准确求解 V^π=T^πV^π', '  stable ← true', '  对每个状态 s，保存旧动作并计算全部 q^π(s,a)', '  令 π(s) ← arg max_a q^π(s,a)', '  若任一状态的动作改变，则 stable ← false', '直到 stable=true；返回 π 与准确的 V^π'],
    theorem: { claim: '准确 Policy Iteration 产生单调不降的策略价值，并在有限次严格策略改善后到达一套最优策略。', why: '每次改善都使用当前策略的准确 value；如果采用近似评价，则只有在近似误差不会改变每个状态的贪心动作排序时，才能沿用同一结论。', conditions: ['有限状态与动作', '每轮 policy evaluation 求得准确的当前策略价值', '并列动作使用固定选择规则'] },
    walkthrough: {
      ...piWalkthroughData,
      eyebrow: '两轮评价—改善 · 二状态问题',
      title: '一次改善产生新策略，新策略随后进入下一轮评价',
      caption: '10 个执行位置连续展示两轮循环：先看评价 value 怎样逼近当前策略的不动点，再比较动作、提交新策略，并验证第二次改善时策略已经稳定。',
      initialPolicyLabel: '固定的初始策略',
    },
    example: {
      title: '二状态问题的一次完整评价与改善',
      caption: '初始策略在两个状态都向左。准确评价得到负的长期 value；动作价值比较随后把 s_1 改为向右，把 s_2 改为停留，并在一次改善后得到最优策略。',
      headers: ['状态', '改善前策略', 'Bellman 方程', math(String.raw`V^{\pi_0}`), math(String.raw`q^{\pi_0}(s,a_\ell)`), math(String.raw`q^{\pi_0}(s,a_0)`), math(String.raw`q^{\pi_0}(s,a_r)`), '改善后策略'],
      rows: [
        [math(String.raw`s_1`), math(String.raw`a_\ell`), math(String.raw`V(s_1)=-1+0.9V(s_1)`), math('-10'), math('-10'), math('-9'), math('-7.1'), math(String.raw`\pi_1(s_1)=a_r`)],
        [math(String.raw`s_2`), math(String.raw`a_\ell`), math(String.raw`V(s_2)=0+0.9V(s_1)`), math('-9'), math('-9'), math('-7.1'), math('-9.1'), math(String.raw`\pi_1(s_2)=a_0`)],
      ],
    },
  },
  {
    id: 'tpi-continuum', kicker: '算法三 · Truncated Policy Iteration', title: '有限评价深度在内层传播与外层改善之间分配计算',
    paragraphs: ['准确 PI 可能把大量 backups 花在一套即将被替换的策略上。Truncated Policy Iteration 从上一轮 value 做 warm start，只对当前贪心策略执行固定 j 次同步评价，然后立刻再次改善。', '在相同初始 value、初始贪心策略和更新顺序下，j=1 的 trace 与 Value Iteration 完全相同；让评价残差收敛则得到准确 Policy Iteration。有限 j 改变的是每轮传播深度，而不是最优 value 目标。'],
    formulas: [String.raw`\begin{aligned}V_{k,0}&=V_{k-1},\\V_{k,j}&=(T^{\pi_k})^jV_{k,0},\\\pi_{k+1}&\in\operatorname{Greedy}(V_{k,j})\end{aligned}`],
    pseudocodeTitle: 'Truncated Policy Iteration', pseudocode: ['已知概率模型，初始化 V_0，并令 π_1 对 V_0 贪心', '对每个外层轮次 k：', '  令 V_{k,0} ← V_{k-1}', '  对 h=0,...,j-1，使用独立新表同步计算 V_{k,h+1} ← T^{π_k}V_{k,h}', '  令 V_k ← V_{k,j}', '  对每个状态计算动作价值，并令 π_{k+1} ← Greedy(V_k)', '  记录内层 sweeps、state backups 与 policy changes', '直到最优 Bellman 残差低于阈值；返回 V_k 与 π_{k+1}'],
    theorem: { claim: '有限折扣 MDP 中，使用准确贪心改善和固定 j≥1 的 modified Policy Iteration 收敛到 V*。', why: '收敛依赖完整同步 sweep、warm start 与贪心改善的组合，而不能只从 γ 和 j 两个数字推出；value-improvement 命题还说明，从上一套策略的准确 value 开始评价新策略时，内层 value 逐步不降。', conditions: [String.raw`0\le\gamma<1`, String.raw`j\ge1`, String.raw`V_{k,0}=V_{k-1}`, String.raw`\pi_k\in\operatorname{Greedy}(V_{k-1})`, '有限状态动作、已知模型与完整同步 sweep'] },
    walkthrough: {
      kind: 'schedule',
      eyebrow: '三种计算安排 · 共同循环',
      depthLabel: '每轮固定策略评价深度',
    },
    handoff: '三种 planning 算法都依赖对 p(s′,r|s,a) 的精确求和。下一部分将保留这些目标，却改用真实经验样本估计它们。',
  },
]

const planningDeepeningEn = [
  {
    id: 'vi-complete-loop', kicker: 'Algorithm one · Value Iteration', title: 'A synchronous sweep builds the new value from one old snapshot',
    paragraphs: ['Freeze V_k at the start of each sweep. Every q_k(s,a) reads that same table, every state writes into a separate V_{k+1}, and only a completed sweep replaces the old values. Maximizing actions form the next greedy policy at the same time.', 'This double-buffered form matches the implementation and gives every number in the four-state example one common time index. In-place VI is a valid variant, but it is not the synchronous algorithm derived here.'],
    formulas: [String.raw`q_k(s,a)=\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V_k(s')\right]`, String.raw`\begin{aligned}V_{k+1}(s)&=\max_a q_k(s,a),\\\pi_{k+1}(s)&\in\operatorname*{arg\,max}_a q_k(s,a)\end{aligned}`],
    pseudocodeTitle: 'Value Iteration', pseudocode: ['Know the probability model for every state-action pair and initialize V_0', 'While V_k has not converged, create V_{k+1} separately from V_k', '  For every state s:', '    For every action a, compute q_k(s,a) from V_k', '    Let π_{k+1}(s) be a maximizing action', '    Write max_a q_k(s,a) into V_{k+1}(s)', '  Compute ||V_{k+1}-V_k||, then replace V_k with the complete V_{k+1}', 'When the residual is below tolerance, return V_k and greedy policy π_k'],
    walkthrough: {
      ...viWalkthroughData,
      eyebrow: 'Three synchronous sweeps · four-state grid',
      title: 'Fill the new table, then commit it as the next old table',
      caption: 'Fifteen execution positions show three consecutive sweeps. Four state backups fill each new table; a fifth commit step swaps the read/write roles before propagation continues.',
    },
    example: {
      title: 'The first two action-comparison sweeps in a four-state grid',
      caption: 'The discount is 0.9. The first sweep starts from all-zero values; the second reads the complete V_1. A fixed tie rule selects a_5 at s_1 in the first sweep.',
      headers: ['Round', 'State', math(String.raw`q_k(s,a_1)`), math(String.raw`q_k(s,a_2)`), math(String.raw`q_k(s,a_3)`), math(String.raw`q_k(s,a_4)`), math(String.raw`q_k(s,a_5)`), 'Greedy action and new value'],
      rows: [
        [math(String.raw`k=0`), math(String.raw`s_1`), math('-1'), math('-1'), math('0'), math('-1'), math('0'), math(String.raw`a_5,\;V_1(s_1)=0`)],
        [math(String.raw`k=0`), math(String.raw`s_2`), math('-1'), math('-1'), math('1'), math('0'), math('-1'), math(String.raw`a_3,\;V_1(s_2)=1`)],
        [math(String.raw`k=0`), math(String.raw`s_3`), math('0'), math('1'), math('-1'), math('-1'), math('0'), math(String.raw`a_2,\;V_1(s_3)=1`)],
        [math(String.raw`k=0`), math(String.raw`s_4`), math('-1'), math('-1'), math('-1'), math('0'), math('1'), math(String.raw`a_5,\;V_1(s_4)=1`)],
        [math(String.raw`k=1`), math(String.raw`s_1`), math('-1'), math('-0.1'), math('0.9'), math('-1'), math('0'), math(String.raw`a_3,\;V_2(s_1)=0.9`)],
        [math(String.raw`k=1`), math(String.raw`s_2`), math('-0.1'), math('-0.1'), math('1.9'), math('0'), math('-0.1'), math(String.raw`a_3,\;V_2(s_2)=1.9`)],
        [math(String.raw`k=1`), math(String.raw`s_3`), math('0'), math('1.9'), math('-0.1'), math('-0.1'), math('0.9'), math(String.raw`a_2,\;V_2(s_3)=1.9`)],
        [math(String.raw`k=1`), math(String.raw`s_4`), math('-0.1'), math('-0.1'), math('-0.1'), math('0.9'), math('1.9'), math(String.raw`a_5,\;V_2(s_4)=1.9`)],
      ],
    },
  },
  {
    id: 'pi-four-whys', kicker: 'Algorithm two · Policy Iteration', title: 'Exact evaluation makes every greedy improvement value-safe',
    paragraphs: ['VI chooses actions again after every shallow propagation step, so many outer rounds repeat greedy comparisons. Policy Iteration instead fixes π_k, obtains the exact V^{π_k} from a linear system or repeated application of T^{π_k}, and then compares actions with that long-run value.', 'The policy-improvement theorem makes the greedy π_{k+1} no worse than π_k. A finite deterministic-policy set cannot contain infinitely many strict improvements; once the greedy action stops changing, the value satisfies both the expectation and optimality equations and therefore equals V^*.'],
    formulas: [String.raw`\begin{aligned}V^{\pi_k}&=(I-\gamma P^{\pi_k})^{-1}r^{\pi_k},\\V_{j+1}^{\pi_k}&=T^{\pi_k}V_j^{\pi_k}\end{aligned}`, String.raw`\begin{aligned}q^{\pi_k}(s,\pi_{k+1}(s))&\ge V^{\pi_k}(s)\\\Longrightarrow\quad V^{\pi_{k+1}}(s)&\ge V^{\pi_k}(s)\end{aligned}`, String.raw`\pi_{k+1}=\pi_k\quad\Longrightarrow\quad V^{\pi_k}=T^*V^{\pi_k}=V^*`],
    pseudocodeTitle: 'Policy Iteration', pseudocode: ['Initialize any deterministic policy π', 'Repeat:', '  Policy evaluation: solve V^π=T^πV^π exactly', '  stable ← true', '  At every state, save the old action and compute all q^π(s,a)', '  Set π(s) ← arg max_a q^π(s,a)', '  If any state changes action, set stable ← false', 'Until stable=true; return π and its exact V^π'],
    theorem: { claim: 'Exact Policy Iteration produces non-decreasing policy values and reaches an optimal policy after finitely many strict improvements.', why: 'Every improvement uses the exact current-policy value. With approximate evaluation, the same conclusion needs an additional guarantee that approximation error cannot change any greedy action ranking.', conditions: ['Finite state and action sets', 'Each policy-evaluation phase returns the exact current-policy value', 'A fixed rule resolves action ties'] },
    walkthrough: {
      ...piWalkthroughData,
      eyebrow: 'Two evaluate–improve rounds · two-state problem',
      title: 'An improved policy becomes the policy evaluated in the next round',
      caption: 'Ten execution positions show two full cycles: watch evaluation approach the current-policy fixed point, compare actions, commit the new policy, and verify that the second improvement is stable.',
      initialPolicyLabel: 'Fixed initial policy',
    },
    example: {
      title: 'One complete evaluation and improvement in a two-state problem',
      caption: 'The initial policy moves left in both states. Exact evaluation yields negative long-run values; action comparison then moves right at s_1, stays at s_2, and reaches the optimal policy after one improvement.',
      headers: ['State', 'Policy before', 'Bellman equation', math(String.raw`V^{\pi_0}`), math(String.raw`q^{\pi_0}(s,a_\ell)`), math(String.raw`q^{\pi_0}(s,a_0)`), math(String.raw`q^{\pi_0}(s,a_r)`), 'Policy after'],
      rows: [
        [math(String.raw`s_1`), math(String.raw`a_\ell`), math(String.raw`V(s_1)=-1+0.9V(s_1)`), math('-10'), math('-10'), math('-9'), math('-7.1'), math(String.raw`\pi_1(s_1)=a_r`)],
        [math(String.raw`s_2`), math(String.raw`a_\ell`), math(String.raw`V(s_2)=0+0.9V(s_1)`), math('-9'), math('-9'), math('-7.1'), math('-9.1'), math(String.raw`\pi_1(s_2)=a_0`)],
      ],
    },
  },
  {
    id: 'tpi-continuum', kicker: 'Algorithm three · Truncated Policy Iteration', title: 'Finite evaluation depth allocates work between propagation and improvement',
    paragraphs: ['Exact PI may spend many backups on a policy that the next improvement will replace. Truncated Policy Iteration warm-starts from the previous outer value, applies exactly j synchronous evaluation sweeps to the current greedy policy, and then improves again.', 'With the same initial value, initial greedy policy, and update order, j=1 is step-for-step identical to Value Iteration; driving the evaluation residual to convergence recovers exact Policy Iteration. Finite j changes propagation depth per round, not the optimal-value objective.'],
    formulas: [String.raw`\begin{aligned}V_{k,0}&=V_{k-1},\\V_{k,j}&=(T^{\pi_k})^jV_{k,0},\\\pi_{k+1}&\in\operatorname{Greedy}(V_{k,j})\end{aligned}`],
    pseudocodeTitle: 'Truncated Policy Iteration', pseudocode: ['Know the probability model, initialize V_0, and let π_1 be greedy with respect to V_0', 'For each outer round k:', '  Set V_{k,0} ← V_{k-1}', '  For h=0,...,j-1, synchronously compute V_{k,h+1} ← T^{π_k}V_{k,h} in a separate table', '  Set V_k ← V_{k,j}', '  Compute action values at every state and set π_{k+1} ← Greedy(V_k)', '  Record inner sweeps, state backups, and policy changes', 'Stop when the optimal Bellman residual is below tolerance; return V_k and π_{k+1}'],
    theorem: { claim: 'In a finite discounted MDP, modified Policy Iteration with exact greedy improvement and fixed j≥1 converges to V*.', why: 'Convergence uses complete synchronous sweeps, warm starts, and greedy improvement together; γ and j alone are not a sufficient explanation. The value-improvement proposition additionally shows that evaluation iterates rise monotonically when a new policy starts from the exact value of the preceding policy.', conditions: [String.raw`0\le\gamma<1`, String.raw`j\ge1`, String.raw`V_{k,0}=V_{k-1}`, String.raw`\pi_k\in\operatorname{Greedy}(V_{k-1})`, 'Finite state-action sets, known model, and complete synchronous sweeps'] },
    walkthrough: {
      kind: 'schedule',
      eyebrow: 'Three compute schedules · one loop',
      depthLabel: 'Fixed policy-evaluation depth per round',
    },
    handoff: 'All three planning methods exactly sum p(s′,r|s,a). The next part preserves these targets but estimates them from experience.',
  },
]

export const planningChapter = assertFoundationChapterDefinition({
  id: 'planning',
  sources,
  zh: {
    prerequisite: '前置：Bellman 最优算子、贪心策略与不动点',
    summaryTitle: 'VI、TPI 与 PI 改变的是评估深度，不是最终目标',
    eyebrow: '第 5 章 · Value Iteration 与 Policy Iteration',
    title: '值迭代与策略迭代',
    intro: '上一章解决了一个状态上的动作选择：给定当前整张 value 表，可以比较这个状态的所有动作并写回一个更好的值。然而，目标附近的一次更新不会自动修正远处状态，也不能直接产生一套在全网格上一致的最优策略。本章把单状态更新组织成反复扫描整张网格的求解过程，并观察 value 怎样传播、策略何时改变，以及三种计算安排为此付出多少工作。',
    bridge: '三种算法都反复执行“固定策略传播 value”和“根据 value 改善策略”，真正的差别是两次改善之间允许多少次评价 sweep。实验将使用一个共同 backup 时钟，持续显示每种方法正在评价还是正在改善，避免用一条收敛曲线代替算法过程。',
    experimentIntro: '下面固定同一个 5×5 网格、初始 value、初始贪心策略、随机性和停止阈值。拖动共同 backup 时钟时，三条执行轨道同步前进；即使 PI 尚未完成第一次准确评价，界面也会显示它已经完成的内部 sweeps 和当前 value。',
    interpretation: '在同一时钟位置，VI 通常已经多次改变策略，PI 仍可能固定第一套策略传播长期后果，TPI 的改善节奏则由评价深度控制。点击任一网格状态，可以核对当前策略、value 写回、动作价值排序和下一次贪心动作。',
    derivation: planningDerivationZh,
    deepening: planningDeepeningZh,
    figure: '交互图 5.1 · Planning Arena',
    instruction: '改变策略评估深度并拖动共同 backup 预算，比较 value 传播、动作竞争与策略改善',
    question: '在相同环境、初值和计算预算下，深度评价会让 value 传播更远，还是让策略改善发生得更晚？',
    prelude: [
      { id: 'value-iteration', kicker: '一个 backup 只写一个状态', title: '完整 sweep 把局部更新扩展到整张 value 表', paragraphs: [
        ['上一章已经得到单状态的最优 Bellman backup：读取当前整张 value 表，在状态 ', math('s'), ' 比较所有动作的一步期望，并把最大动作价值写回这个状态。一次 backup 只改变一个表项，所以目标附近的新信息不会在同一步突然出现在远处。'],
        ['为了区分连续的整表快照，把第 ', math('k'), ' 次完整扫描开始时的估计记作 ', math('V_k'), '。让全部状态各执行一次 backup 称为一个 sweep；“同步”表示这一轮所有状态都读取同一张 ', math('V_k'), '，并把结果写入另一张 ', math('V_{k+1}'), '。'],
        ['用 ', math('T^*'), ' 表示这次“读取一张旧表、为每个状态取最大动作价值、输出一张新表”的整表操作，就得到 ', math('V_{k+1}=T^*V_k'), '。每完成一个 sweep，目标区域的长期影响便能再向外传播一层。'],
      ], formulas: [String.raw`V_{k+1}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V_k(s')\right]`] },
      { id: 'policy-iteration', kicker: '频繁改善的计算代价', title: '固定策略并准确评价可以减少外层改善次数', paragraphs: ['Value Iteration 每完成一次浅层传播就重新比较全部动作，因此策略可能在 value 尚未传播很远时反复改变。另一种安排是先固定当前策略，让它的长期后果传播到收敛，再执行一次贪心改善。', '这会减少外层 policy updates，却把许多 evaluation sweeps 放进每一轮。于是“迭代轮数更少”不等于“计算更少”，也迫使比较采用真实 backups 而不是外层编号。'], formulas: [String.raw`\pi_k\xrightarrow{\text{evaluate to }V^{\pi_k}}V^{\pi_k}\xrightarrow{\text{greedy improve}}\pi_{k+1}`] },
    ],
    sections: [
      { id: 'fair-budget', kicker: '比较边界', title: '相同 backup 预算才能比较传播深度', paragraphs: ['外层 iteration、evaluation sweep 和 state backup 是不同粒度的成本。一次完整 sweep 更新 25 个状态，因此本章把它记作 25 次 backups，并按共同累计预算为三种方法选择各自最近的可用状态。', '残差曲线回答离最优不动点还有多远；value 地图、被评估策略、动作价值前两名和改善后策略则解释残差为什么这样变化。二者必须一起读取。'], formula: String.raw`\begin{aligned}\text{state backups}&=\sum_k \text{evaluation sweeps}_k\,|\mathcal S|,\\\text{matched view}&=\max\{t:\text{backups}_t\le B\}\end{aligned}` },
      { id: 'model-free-transfer', kicker: '迁移到下一部分', title: '没有环境模型时必须用经验替代精确求和', paragraphs: ['VI、PI 和 TPI 的每次 backup 都显式使用 p(s′,r|s,a) 对全部后继与奖励求期望，因此它们属于模型已知的 planning 方法。', '下一部分保留 value target 和策略改善逻辑，却不再允许查询完整概率模型；完整 episode 或单步转移样本将成为估计期望的证据。'], formula: { latex: String.raw`\begin{aligned}\text{known model: }&\text{ exact expectation}\\\text{unknown model: }&\text{ sampled return or one-step target}\end{aligned}`, narrowLatex: String.raw`\begin{aligned}\text{model}&\Rightarrow\text{ exact sum}\\\text{experience}&\Rightarrow\text{ sampled target}\end{aligned}` } },
    ],
    summary: ['Value Iteration 用同步最优 backup 直接迭代 Bellman 最优不动点，并在每次浅层传播后更新贪心策略。', '准确 Policy Iteration 先求当前策略的真实 value，再借助策略改善定理得到不差的新策略；Truncated PI 用有限评价深度连接两种计算安排。', '在匹配初值与更新顺序后，TPI 的 j=1 端点与 VI 完全相同；三种方法最终到达同一个最优 value，但最优 policy 可能不唯一。'],
    explorer: explorer.zh,
  },
  en: {
    prerequisite: 'Prerequisites: Bellman optimality operator, greedy policy, and fixed points',
    summaryTitle: 'VI, TPI, and PI change evaluation depth—not the final objective',
    eyebrow: 'Chapter 5 · Value Iteration and Policy Iteration',
    title: 'Value Iteration and Policy Iteration',
    intro: 'The previous chapter solved action choice at one state: given the current full value table, compare that state’s actions and write back a better value. One update near the goal does not automatically repair distant states, however, nor does it immediately produce one globally consistent optimal policy. This chapter organizes single-state updates into repeated full-grid sweeps and observes how value propagates, when policy changes, and how much work three compute schedules require.',
    bridge: 'All three methods repeat two operations: hold a policy fixed while value propagates, then improve the policy from that value. They differ in how many evaluation sweeps occur between improvements. The experiment therefore uses one shared backup clock and continuously exposes whether each method is evaluating or improving instead of replacing the process with one convergence curve.',
    experimentIntro: 'Fix one 5×5 grid, initial value, initial greedy policy, randomness, and stopping tolerance. As the shared backup clock moves, all three execution lanes advance together. Even before PI completes its first exact evaluation, the interface shows its finished inner sweeps and current value table.',
    interpretation: 'At one clock position, VI may already have changed policy several times while PI still holds its first policy fixed to propagate long-run consequences. TPI’s improvement rhythm is controlled by evaluation depth. Select any grid state to inspect its current policy, value write-back, action ranking, and next greedy action.',
    derivation: planningDerivationEn,
    deepening: planningDeepeningEn,
    figure: 'Interactive figure 5.1 · Planning Arena',
    instruction: 'Change policy-evaluation depth and scrub one shared backup budget to compare value propagation, action competition, and policy improvement',
    question: 'With environment, initialization, and backup budget fixed, does deeper evaluation propagate value farther or merely delay the next policy improvement?',
    prelude: [
      { id: 'value-iteration', kicker: 'One backup writes one state', title: 'A complete sweep extends the local update to the full value table', paragraphs: [
        ['The previous chapter established one-state Bellman-optimal backup: read the current full value table, compare every one-step action at state ', math('s'), ', and write the largest action value into that state. One backup changes one table entry, so new information near the goal cannot appear at distant states in the same step.'],
        ['Call the estimate at the start of full scan ', math('k'), ' by ', math('V_k'), '. A sweep lets every state perform one backup. “Synchronous” means that every backup in the sweep reads the same ', math('V_k'), ' and writes into a separate ', math('V_{k+1}'), '.'],
        ['Let ', math('T^*'), ' denote the full-table operation that reads one old table, writes the largest action value at every state, and returns one new table. Then ', math('V_{k+1}=T^*V_k'), '; each completed sweep carries the goal region’s long-run influence one layer farther across the grid.'],
      ], formulas: [String.raw`V_{k+1}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)\left[r+\gamma V_k(s')\right]`] },
      { id: 'policy-iteration', kicker: 'Cost of frequent improvement', title: 'Fixing and exactly evaluating a policy can reduce outer improvements', paragraphs: ['Value Iteration compares all actions again after every shallow propagation step, so its policy may change repeatedly before value has traveled far. Another schedule fixes the current policy, propagates its long-run consequences to convergence, and only then performs one greedy improvement.', 'That schedule reduces outer policy updates but inserts many evaluation sweeps inside each round. Fewer outer iterations therefore does not imply less computation, forcing the comparison to count real backups.'], formulas: [String.raw`\pi_k\xrightarrow{\text{evaluate to }V^{\pi_k}}V^{\pi_k}\xrightarrow{\text{greedy improve}}\pi_{k+1}`] },
    ],
    sections: [
      { id: 'fair-budget', kicker: 'Comparison boundary', title: 'Only matched backup budgets compare propagation depth', paragraphs: ['Outer iterations, evaluation sweeps, and state backups are different units of cost. One full sweep updates 25 states, so this chapter counts it as 25 backups and selects each algorithm’s latest available state under one cumulative budget.', 'The residual curve measures distance from the optimal fixed point. Value maps, evaluated policies, the two largest action values, and improved policies explain why that distance changes; both views are needed.'], formula: String.raw`\begin{aligned}\text{state backups}&=\sum_k \text{evaluation sweeps}_k\,|\mathcal S|,\\\text{matched view}&=\max\{t:\text{backups}_t\le B\}\end{aligned}` },
      { id: 'model-free-transfer', kicker: 'Transfer to the next part', title: 'Experience must replace exact sums when the model is unavailable', paragraphs: ['Every VI, PI, and TPI backup explicitly uses p(s′,r|s,a) to sum over all successors and rewards, so these are planning methods for a known model.', 'The next part preserves value targets and policy-improvement logic but removes access to the full probability model. Complete episodes or one-step transition samples become the evidence used to estimate expectations.'], formula: { latex: String.raw`\begin{aligned}\text{known model: }&\text{ exact expectation}\\\text{unknown model: }&\text{ sampled return or one-step target}\end{aligned}`, narrowLatex: String.raw`\begin{aligned}\text{model}&\Rightarrow\text{ exact sum}\\\text{experience}&\Rightarrow\text{ sampled target}\end{aligned}` } },
    ],
    summary: ['Value Iteration directly iterates the Bellman-optimal fixed point with synchronous optimal backups and updates a greedy policy after each shallow propagation step.', 'Exact Policy Iteration solves the current policy value before invoking policy improvement; Truncated PI connects the two compute schedules with finite evaluation depth.', 'With matched initialization and update order, the j=1 TPI endpoint is identical to VI. All three reach the same optimal value, although the optimal policy need not be unique.'],
    explorer: explorer.en,
  },
})
