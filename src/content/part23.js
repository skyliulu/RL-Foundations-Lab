import {
  approximationDeepeningEn,
  approximationDeepeningZh,
  controlDeepeningEn,
  controlDeepeningZh,
  tdDeepeningEn,
  tdDeepeningZh,
} from './deepening-part23.js'
import {
  actorCriticDeepeningEn,
  actorCriticDeepeningZh,
  dqnDeepeningEn,
  dqnDeepeningZh,
  policyGradientDeepeningEn,
  policyGradientDeepeningZh,
  vfaDeepeningEn,
  vfaDeepeningZh,
} from './deepening-part3.js'

const book = 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning'

const source = (id, label, pages) => ({ id, label, pages, href: book })
const section = (id, kicker, title, paragraphs, formula) => ({ id, kicker, title, paragraphs, ...(formula ? { formula } : {}) })
const step = (id, rule, latex, short, detail, assumptions, symbols) => ({ id, rule, latex, short, detail, assumptions, symbols })

function chapter(id, sources, zh, en) {
  return { id, sources, zh, en }
}

export const monteCarloChapter = chapter('montecarlo', [source('mc', 'Monte Carlo Learning', 'L5, pp.5–47')], {
  prerequisite: '前置：Return、动作价值与策略迭代', eyebrow: '第 6 章 · 从模型转向经验', title: 'Monte Carlo 经验估计',
  intro: '已知模型时，策略迭代能够计算每个状态—动作对的期望回报并据此改善策略；模型未知后，这个精确评价步骤失去了转移概率，却仍然需要可比较的动作价值。本章从共享网格中真正发生的完整回合出发，推导 return 样本怎样替代模型期望，并检验评价、策略改善与探索怎样重新组成闭环。',
  bridge: '完整 episode 让 return 成为可观察的动作价值样本，样本平均则把随机经历汇总成估计。接下来的算法演化依次改变评价批量、轨迹复用方式和覆盖机制，但始终保留“用回合经验估计 Q，再让策略使用新 Q”的主线。', experimentIntro: '实验继续使用共享的 5×5 网格，只把目标格设为真正的终止状态。协议轨道会同步标出经验从哪里产生、哪些 return 能进入 Q，以及策略在什么边界提交；访问协议对照则固定同一条 episode，只改变重复访问的纳入规则。路径图、时间步 tape、反向 return、Q 更新和下一回合入口仍保持同步，达到步数上限的截断尝试只计数而不参与更新。',
  interpretation: 'MC Basic 冻结策略完成整批经验评价，定义清楚却等待久且浪费途中访问；Exploring Starts 逐回合复用整条轨迹，却要求能够控制起始状态—动作；ε-greedy 把覆盖写进行为策略，取消特殊起点，同时承担持续探索的代价。三种方法的差别既体现在用了哪些数据，也体现在何时提交策略以及下一回合使用哪一版策略。',
  figure: '交互图 06.1 · Monte Carlo 回合更新实验室', instruction: '沿协议轨道比较经验来源、证据纳入和策略提交，再用同一条回合对照首次访问与每次访问', question: '完整回合结束后，哪一部分经验进入更新，新策略又在什么时候开始影响数据？', experiment: { id: 'chapter-experiment' },
  reasoningPath: [
    section('batch-evaluation', 'MC Basic', '固定策略下的整批回合完成一次经验评价', ['样本均值要估计同一版本策略的动作价值，收集样本时就必须让当前策略保持不变。MC Basic 因而为每个状态—动作对分别收集回合，只使用指定起始对的 return；等整张动作价值表完成后，才统一产生下一版策略。', '这个协议忠实保留了策略迭代的外层边界，却必须等待全部状态—动作对完成评价，而且一条回合途中经过的其他访问不会进入估计。'], String.raw`\pi_k\xrightarrow{\text{fixed-policy episodes}}\widehat q_k\xrightarrow{\text{one improvement}}\pi_{k+1}`),
    section('episode-gpi', '更新时机', '逐回合交替让新策略更早影响后续数据', ['一条完整回合的 return 虽然噪声较大，仍然能为被访问的状态—动作对提供一次修正。把这次修正立即写入 Q，再改善访问状态上的策略，下一条回合就会使用刚提交的新策略；这种评价与改善不断交替的组织方式称为广义策略迭代（Generalized Policy Iteration）。', '此时历史 return 来自逐渐变化的策略，不能再把整个训练过程简单看成固定策略下的一组独立同分布样本。算法能否持续修正早期误差，取决于状态—动作覆盖、策略变化速度以及每个估计是否继续获得新样本。'], String.raw`\mathrm{episode}_k\longrightarrow Q^{+}\longrightarrow\pi^{+}\longrightarrow\mathrm{episode}_{k+1}`),
    section('coverage-feedback', '数据与探索', '复用轨迹提高效率，也把覆盖变成闭环条件', ['逐回合更新使整条轨迹都可以成为证据。first-visit 对同一状态—动作对每回合最多更新一次，every-visit 则保留全部出现；两者改变的是回合内部的计权，而不是 return 的定义。', '复用数据仍不能保证未见动作获得样本。Exploring Starts 通过随机起始对提供覆盖，ε-greedy 则让行为策略在普通起点下持续给所有动作正概率；后一种方法取消了控制起点的要求，却会在执行时持续选择部分非贪心动作。']),
  ],
  algorithms: [
    { id: 'basic', label: 'MC Basic', premise: '直接把 model-based policy iteration 的策略评价换成 episode 平均。', solves: '不需要环境模型即可估计 q^π。', limitation: '每次只使用指定起始 (s,a) 的 return，途中访问全部被浪费；还要求为每个 (s,a) 收集足够多的专门 episode。', pseudocode: ['初始化策略 π₀', '对每轮 k：', '  对每个状态 s 与动作 a：', '    收集大量从 (s,a) 出发并遵循 πₖ 的 episode', '    qₖ(s,a) ← 这些 episode return 的平均', '  对每个状态 s：', '    a* ← arg maxₐ qₖ(s,a)', '    πₖ₊₁(a*|s) ← 1，其余动作概率置 0'] },
    { id: 'exploring', label: 'MC Exploring Starts', premise: '一条 episode 途中会访问许多状态—动作对；把这些访问全部变成训练证据。', solves: 'first-visit 或 every-visit 更新显著提高数据利用率；随机起始对保证所有 (s,a) 有机会被采样。', limitation: '需要人为选择任意起始状态—动作。在真实系统中，这个 exploring-starts 假设往往不可实现。', pseudocode: ['初始化 π、Q、Returns(s,a) 与 N(s,a)', '对每条 episode：', '  随机选择可覆盖任意 (s₀,a₀) 的起始对', '  遵循当前策略生成完整 episode', '  G ← 0', '  从 T−1 到 0 反向扫描：', '    G ← γG + Rₜ₊₁', '    若满足访问协议：更新 Returns、N 与 Q=Returns/N', '  对本条 episode 访问到的状态做贪心策略改善'] },
    { id: 'epsilon', label: 'MC ε-Greedy', premise: '不再要求特殊起点，而让行为策略本身持续给所有动作正概率。', solves: '足够长的采样过程可以从普通起点访问不同状态—动作对，移除 exploring-starts 假设。', limitation: 'ε>0 意味着策略会持续选择非贪心动作；它优化的是 ε-soft 策略集合，而非全部确定性策略。', pseudocode: ['初始化 ε-soft 策略 π、Q、Returns(s,a) 与 N(s,a)', '对每条 episode：', '  从普通起点按 π 生成完整 episode', '  G ← 0', '  从 T−1 到 0 反向扫描：', '    G ← γG + Rₜ₊₁', '    若满足访问协议：更新 Returns、N 与 Q=Returns/N', '  对访问到的每个状态：', '    a* ← arg maxₐ Q(s,a)', '    π(a*|s) ← 1−ε+ε/|A|', '    π(a|s) ← ε/|A|, a≠a*'] },
  ],
  derivation: [
    step('value-definition', '从动作价值的定义开始', String.raw`q^{\pi}(s,a)=\mathbb E_{\pi}[G_t\mid S_t=s,A_t=a]`, '动作价值是从指定状态和动作出发的 return 条件期望。', '策略决定后续动作，环境决定后续转移；未知模型使这个期望无法直接求和，但定义本身没有改变。', ['episode 最终结束或 return 有界'], [[String.raw`G_t`, '一条 episode 中从时刻 t 开始的 return']]),
    step('episode-sample', '用完整 episode 产生样本', String.raw`G_t^{(i)}=\sum_{k=0}^{T_i-t-1}\gamma^kR_{t+k+1}^{(i)}`, '第 i 条 episode 为被访问的状态—动作对提供一个 return 样本。', '必须等待终点，才能知道该时刻之后的全部奖励。这里的 T_i 是该条 episode 的结束时刻。', ['episode i 确实访问了 (s,a)'], [[String.raw`T_i`, '第 i 条 episode 的终止时刻']]),
    step('sample-average', '用大数定律替代未知期望', String.raw`\widehat q_N(s,a)=\frac{1}{N(s,a)}\sum_{i=1}^{N(s,a)}G_t^{(i)}`, '对同一状态—动作对的 return 样本取平均。', '在访问样本满足适当独立性且覆盖持续增加时，样本均值逼近动作价值。N(s,a) 只统计协议选中的访问。', ['每个需要估计的 (s,a) 被反复访问'], [[String.raw`N(s,a)`, '被纳入估计的访问次数']]),
    step('incremental-mean', '把批量平均改写成增量更新', String.raw`\widehat q_N=\widehat q_{N-1}+\frac{1}{N}\left(G_N-\widehat q_{N-1}\right)`, '无需保存全部历史 return，只保存计数与当前估计。', '新样本与旧估计之差是估计误差；步长 1/N 恰好让递推结果等于算术平均。', ['N 从 1 递增'], [[String.raw`G_N-\widehat q_{N-1}`, '第 N 个样本产生的估计误差']]),
    step('policy-improvement', '把经验评价接回策略迭代', String.raw`\begin{aligned}a^*(s)&\in\arg\max_a \widehat q_k(s,a),\\ \pi_{k+1}(a\mid s)&=\mathbf 1[a=a^*(s)].\end{aligned}`, '当前估计最高的动作成为下一轮策略的选择。', 'MC 只替换策略评价的数据来源；策略改善仍使用动作价值排序。问题是确定性贪心会让其他动作失去后续样本。', ['每个状态至少有一个可比较的动作估计'], [[String.raw`a^*(s)`, '当前贪心动作']]),
    step('epsilon-greedy', '用软策略保证探索', String.raw`\begin{aligned}a^*(s)&\in\arg\max_b q(s,b),\\ \pi(a\mid s)&=\begin{cases}1-\epsilon+\epsilon/|\mathcal A|,&a=a^*(s),\\ \epsilon/|\mathcal A|,&a\ne a^*(s).\end{cases}\end{aligned}`, '大部分时间利用当前最好动作，同时保留访问其他动作的正概率。', '纯贪心策略可能永远看不到早期估计较低的动作。ε-greedy 通过持续探索为后续控制算法提供覆盖。', [String.raw`0<\epsilon\le 1`], [[String.raw`\epsilon`, '用于探索的概率质量']]),
  ],
  prelude: [section('model-to-data', '评价障碍', '模型未知使动作价值无法直接求和', ['在共享网格中，已知模型的策略评价可以枚举一个动作之后的全部奖励和后继状态，再按转移概率计算条件期望。现实交互只揭示真正发生的一条分支，因此算法不能再直接求出 q^π，却仍然必须比较同一状态中的不同动作。', '动作价值的定义没有改变，改变的是获得期望的方式：让同一状态—动作对反复出现在经验中，把每次随机未来产生的 return 当作样本，再用样本平均逼近原先由模型给出的期望。']), section('episode-unit', '样本条件', '完整 return 只能在回合终止后确定', ['Episode（回合）是从起点持续到终止状态的一段完整交互序列。Monte Carlo 不使用当前价值估计补全尚未发生的未来，因此只有回合结束后，某次访问之后的全部奖励才已知，对应的 return 才能计算。', '这种 target 完全由真实后续奖励组成，不包含 bootstrap 尾项；代价是必须等待终点，随机轨迹的全部波动都会进入 return，而且没有自然终点的持续型任务不能直接套用普通回合式 MC。'])],
  sections: [section('visit-protocol', '数据复用', '访问协议决定一条 episode 贡献多少证据', ['MC Basic 只使用指定起始对，相当于最严格的 initial-visit。first-visit 让每条 episode 对同一状态—动作对至多贡献一次，every-visit 则保留轨迹中的全部出现。', '三者估计同一个条件期望，却给同一条轨迹内部的相关访问不同权重。数据利用率提高时，样本相关性也会增强，因此不能把这些名称当作无关的实现选项。'], String.raw`N_{\mathrm{initial}}(s,a)\le N_{\mathrm{first}}(s,a)\le N_{\mathrm{every}}(s,a)`), section('coverage', '探索前提', '可靠的贪心改善依赖持续覆盖', ['如果某个动作从未被访问，它的 Q 值就只是初值；纯贪心策略可能把一次偶然低估永久固化，并停止收集能够纠正它的证据。', 'Exploring Starts 在 episode 起点保证每个状态—动作对有机会出现，ε-soft 策略则在整个行为过程中保持正概率。后者取消了控制起点的假设，却必须持续承担探索成本。'], String.raw`\pi(a\mid s)>0\quad\forall(s,a)`), section('optimality', '能力边界', 'ε-greedy 用执行效率换取覆盖', ['更大的 ε 提高发现替代动作的机会，却让策略更频繁执行当前看来较差的动作；固定 ε 时，算法优化的是 ε-soft 策略集合中的最佳行为。', '若要逐渐逼近确定性贪心最优，ε 需要随训练减小，同时又不能过快归零，否则早期误差仍可能失去纠正机会。这正是“趋于贪心且保持充分探索”的双重要求。'], String.raw`\epsilon_k\to 0,\qquad \sum_k\epsilon_k=\infty`), section('consistency', '一致性问题', '最优 ε-greedy 策略不一定与全局最优贪心策略一致', ['软策略改变了未来状态分布：即使当前状态选择同一个贪心动作，后续仍可能随机进入禁区或离开目标。因此它评价和优化的是另一套受探索约束的长期行为。', '这解释了为什么探索不是算法外的“小技巧”，而是目标集合与数据分布的一部分。']), section('forward', '下一步', '增量均值揭示了更一般的误差修正形式', ['步长 1/N 让所有历史 return 等权，恰好复现算术平均，适合目标固定且希望渐近消除噪声的情形。', '策略持续变化或环境非平稳时，旧样本不应永远保持同样权重。下一章将保留“旧估计加误差修正”的结构，并用 Robbins–Monro 条件讨论更一般的步长。'])],
  summary: ['MC 保留价值定义，只把模型期望替换为完整 episode 的 return 样本。', 'MC Basic、Exploring Starts 与 ε-greedy 是一条由数据效率和覆盖假设推动的演化链。', 'first-visit 与 every-visit 决定同一 episode 内的证据怎样计权。', 'ε-soft 策略用持续探索换取覆盖，也因此改变可达到的最优策略集合。', '只有同时检查估计、覆盖、策略改善与假设，才真正理解 MC 控制。'], explorer: { cue: '切换算法时沿三道协议门阅读；切换访问规则时比较同一条 tape 中重复时间步的“跳过/再次纳入”。' },
}, {
  prerequisite: 'Prerequisites: return, action value, and policy iteration', eyebrow: 'Chapter 6 · From models to experience', title: 'Monte Carlo Learning',
  intro: 'With a known model, policy iteration can evaluate every state-action pair and improve the policy from those expectations. Once the transition model is unavailable, exact evaluation loses its input while control still needs comparable action values. This chapter derives how complete episodes replace model expectations with return samples, then tests how evaluation, policy improvement, and exploration reconnect.',
  bridge: 'A complete episode makes a return observable, and sample averaging turns random experience into an estimate. The algorithm family changes evaluation batch size, trajectory reuse, and coverage while preserving one spine: estimate Q from episodes, commit a policy, and let later episodes use it.', experimentIntro: 'The lab keeps the shared 5×5 grid and makes the goal a true terminal state. A protocol track identifies where experience comes from, which returns may enter Q, and the boundary that commits a policy. The visit comparison holds one episode fixed and changes only how repeated visits are admitted. The path, timestep tape, backward returns, Q updates, and next-episode input remain synchronized; step-limit truncations are counted but excluded from updates.',
  interpretation: 'MC Basic freezes the policy for a full empirical evaluation, which is clear but slow and discards intermediate visits. Exploring Starts reuses complete trajectories episode by episode but assumes control over the initial pair. ε-greedy moves coverage into behavior, removes the special-start interface, and pays for persistent exploration. The methods differ both in which evidence they use and in when a committed policy begins generating new data.',
  figure: 'Interactive Figure 06.1 · Monte Carlo Episode Update Lab', instruction: 'Compare experience source, evidence admission, and policy commit on the protocol track, then contrast first-visit and every-visit on one fixed episode', question: 'After an episode terminates, which evidence enters the update and when does the new policy begin changing data?', experiment: { id: 'chapter-experiment' },
  reasoningPath: [
    section('batch-evaluation', 'MC Basic', 'A fixed-policy episode batch completes one empirical evaluation', ['A sample mean targets the action value of one policy version, so that policy must remain fixed while its samples are collected. MC Basic therefore gathers dedicated episodes for every state-action pair, uses only the requested starting pair, and creates the next policy only after the full action-value table is ready.', 'This protocol preserves policy iteration’s outer boundary, but it waits for every pair to be evaluated and discards the other visits that occur along each episode.'], String.raw`\pi_k\xrightarrow{\text{fixed-policy episodes}}\widehat q_k\xrightarrow{\text{one improvement}}\pi_{k+1}`),
    section('episode-gpi', 'Update timing', 'Episode-by-episode alternation lets a new policy affect data earlier', ['One complete-episode return is noisy, but it can still correct the estimate of a visited pair. Committing that correction to Q and improving the policy immediately means the next episode uses the newly committed policy. This continuing alternation of evaluation and improvement is Generalized Policy Iteration.', 'Historical returns now come from a changing sequence of policies, so the entire run is no longer a simple iid sample set for one fixed policy. Repairing early errors depends on continued state-action coverage, the rate of policy change, and whether every estimate keeps receiving evidence.'], String.raw`\mathrm{episode}_k\longrightarrow Q^{+}\longrightarrow\pi^{+}\longrightarrow\mathrm{episode}_{k+1}`),
    section('coverage-feedback', 'Data and exploration', 'Trajectory reuse raises efficiency and makes coverage a loop condition', ['Episode-by-episode updates can reuse the complete trajectory. First-visit contributes at most one update per state-action pair in an episode, while every-visit retains every occurrence. The protocol changes within-episode weighting, not the definition of return.', 'Reuse alone cannot give an unseen action evidence. Exploring Starts obtains coverage through randomized starting pairs; ε-greedy keeps every action at positive probability from ordinary starts. The latter removes start control but continues to execute some non-greedy actions.']),
  ],
  algorithms: [
    { id: 'basic', label: 'MC Basic', premise: 'Replace model-based evaluation with episode averages for each requested pair.', solves: 'Estimate q^π without an environment model.', limitation: 'Intermediate visits are discarded, and every pair needs dedicated starting episodes.', pseudocode: ['Initialize policy π₀', 'For iteration k:', '  For every state s and action a:', '    Collect many episodes starting from (s,a) under πₖ', '    qₖ(s,a) ← average return of those episodes', '  For every state s:', '    a* ← arg maxₐ qₖ(s,a)', '    Set πₖ₊₁(a*|s)=1 and all other probabilities to 0'] },
    { id: 'exploring', label: 'MC Exploring Starts', premise: 'Reuse every state-action visit along an episode.', solves: 'First-visit or every-visit updates improve data use; randomized starting pairs guarantee possible coverage.', limitation: 'The environment must allow arbitrary starting state-action pairs.', pseudocode: ['Initialize π, Q, Returns(s,a), and N(s,a)', 'For each episode:', '  Select a starting pair (s₀,a₀) so every pair is possible', '  Generate a complete episode under the current policy', '  G ← 0', '  Scan backward from T−1 to 0:', '    G ← γG + Rₜ₊₁', '    If allowed by the visit protocol, update Returns, N, and Q=Returns/N', '  Greedily improve the policy at visited states'] },
    { id: 'epsilon', label: 'MC ε-Greedy', premise: 'Keep every action at positive probability instead of requiring special starts.', solves: 'Long ordinary rollouts can cover pairs without an exploring-starts interface.', limitation: 'Persistent ε explores forever and optimizes inside the ε-soft policy class.', pseudocode: ['Initialize ε-soft π, Q, Returns(s,a), and N(s,a)', 'For each episode:', '  Generate a complete episode from an ordinary start under π', '  G ← 0', '  Scan backward from T−1 to 0:', '    G ← γG + Rₜ₊₁', '    If allowed by the visit protocol, update Returns, N, and Q=Returns/N', '  For every visited state:', '    a* ← arg maxₐ Q(s,a)', '    π(a*|s) ← 1−ε+ε/|A|', '    π(a|s) ← ε/|A| for a≠a*'] },
  ],
  derivation: [
    step('value-definition', 'Start from action value', String.raw`q^{\pi}(s,a)=\mathbb E_{\pi}[G_t\mid S_t=s,A_t=a]`, 'Action value is the conditional mean return after a specified state and action.', 'The policy selects later actions and the environment produces later transitions. An unknown model blocks direct summation, not the definition.', ['episodes terminate or returns are bounded'], [[String.raw`G_t`, 'return from time t in one episode']]),
    step('episode-sample', 'Generate a sample with a complete episode', String.raw`G_t^{(i)}=\sum_{k=0}^{T_i-t-1}\gamma^kR_{t+k+1}^{(i)}`, 'Episode i supplies one return sample for a visited pair.', 'The full target is known only after the episode ends. T_i is the terminal time of episode i.', ['episode i visits (s,a)'], [[String.raw`T_i`, 'terminal time of episode i']]),
    step('sample-average', 'Replace expectation by a sample mean', String.raw`\widehat q_N(s,a)=\frac{1}{N(s,a)}\sum_{i=1}^{N(s,a)}G_t^{(i)}`, 'Average return samples for the same state-action pair.', 'With continuing coverage and suitable sampling, the empirical average approaches action value.', ['each required pair is revisited'], [[String.raw`N(s,a)`, 'included visit count']]),
    step('incremental-mean', 'Rewrite the batch mean incrementally', String.raw`\widehat q_N=\widehat q_{N-1}+\frac{1}{N}\left(G_N-\widehat q_{N-1}\right)`, 'Keep only the count and current estimate.', 'The new-sample error corrects the old estimate; step size 1/N exactly reproduces the arithmetic mean.', ['N increases from 1'], [[String.raw`G_N-\widehat q_{N-1}`, 'sample estimation error']]),
    step('policy-improvement', 'Reconnect experience to policy iteration', String.raw`\begin{aligned}a^*(s)&\in\arg\max_a \widehat q_k(s,a),\\ \pi_{k+1}(a\mid s)&=\mathbf 1[a=a^*(s)].\end{aligned}`, 'The largest current estimate defines the next greedy policy.', 'MC replaces policy-evaluation evidence; policy improvement still ranks actions. Deterministic greed can remove future samples for alternatives.', ['at least one comparable action estimate per state'], [[String.raw`a^*(s)`, 'current greedy action']]),
    step('epsilon-greedy', 'Maintain coverage with a soft policy', String.raw`\begin{aligned}a^*(s)&\in\arg\max_b q(s,b),\\ \pi(a\mid s)&=\begin{cases}1-\epsilon+\epsilon/|\mathcal A|,&a=a^*(s),\\ \epsilon/|\mathcal A|,&a\ne a^*(s).\end{cases}\end{aligned}`, 'Exploit the current best action while preserving positive probability for alternatives.', 'A purely greedy policy may never repair an unlucky early estimate. ε-greedy keeps exploration alive.', [String.raw`0<\epsilon\le 1`], [[String.raw`\epsilon`, 'probability mass reserved for exploration']]),
  ],
  prelude: [section('model-to-data', 'Evaluation barrier', 'An unknown model blocks direct action-value summation', ['In the shared grid, model-based policy evaluation can enumerate every reward and successor after an action and weight them by transition probability. Real interaction reveals only the branch that occurred, so the algorithm can no longer calculate action value directly even though it still has to compare actions within each state.', 'The action-value definition remains unchanged. What changes is the route to its expectation: revisit the same state-action pair, treat the return from each random future as a sample, and average those samples in place of a model-based sum.']), section('episode-unit', 'Sample availability', 'A complete return is known only after termination', ['An episode is the complete interaction sequence from a start to a terminal state. Monte Carlo does not fill an unseen future with a current value estimate, so the rewards following a visit—and therefore its return—become available only after the episode ends.', 'The target contains only realized future rewards and no bootstrapped tail. In exchange, learning waits for termination, absorbs the full trajectory’s variance, and does not directly apply to continuing tasks without a natural endpoint.'])],
  sections: [section('visit-protocol', 'Data reuse', 'A visit protocol determines how much evidence one episode contributes', ['MC Basic uses only a requested starting pair. First-visit lets one episode contribute once for a pair, while every-visit retains every occurrence along the trajectory.', 'All three estimate the same conditional expectation but weight correlated visits within one episode differently. Higher data reuse therefore changes dependence as well as sample count.'], String.raw`N_{\mathrm{initial}}(s,a)\le N_{\mathrm{first}}(s,a)\le N_{\mathrm{every}}(s,a)`), section('coverage', 'Exploration premise', 'Reliable greedy improvement requires continuing coverage', ['An unvisited action retains only its initialization. A greedy policy can freeze an unlucky early underestimate and stop collecting evidence that would repair it.', 'Exploring Starts supplies coverage at the episode start, whereas ε-soft behavior preserves positive action probability throughout interaction. The latter removes start-state control at the cost of persistent exploration.'], String.raw`\pi(a\mid s)>0\quad\forall(s,a)`), section('optimality', 'Boundary', 'ε-greedy exchanges execution efficiency for coverage', ['Larger ε discovers alternatives more reliably but executes currently inferior actions more often. With fixed ε, the algorithm optimizes inside the ε-soft policy class.', 'Approaching deterministic greedy optimality requires ε to decrease without vanishing so fast that early errors lose all chance of correction. This is the joint requirement of becoming greedy while preserving sufficient exploration.'], String.raw`\epsilon_k\to 0,\qquad \sum_k\epsilon_k=\infty`), section('consistency', 'Consistency', 'An optimal ε-greedy policy need not match the globally greedy optimum', ['Soft behavior changes the future state distribution. Even if the current greedy action agrees, later random actions can enter forbidden cells or leave the target.', 'Exploration is therefore part of the objective class and data distribution, not an external trick.']), section('forward', 'Next step', 'The incremental mean exposes a more general correction form', ['Step size 1/N weights every historical return equally and exactly reproduces an arithmetic mean, which suits a fixed target and asymptotic noise removal.', 'When policy or environment changes, old evidence should not retain equal weight forever. The next chapter keeps estimate-plus-error correction and derives more general schedules through Robbins–Monro conditions.'])],
  summary: ['MC preserves the value definition and replaces model expectations with complete-episode return samples.', 'MC Basic, Exploring Starts, and ε-greedy form a chain driven by data efficiency and coverage assumptions.', 'First-visit and every-visit determine how within-episode evidence is weighted.', 'ε-soft policies trade persistent exploration for a restricted optimal-policy class.', 'Understanding MC control requires inspecting estimates, coverage, policy improvement, and assumptions together.'], explorer: { cue: 'Read the three protocol gates when switching algorithms; when switching visit rules, compare “skip/again” on repeated time steps in the same tape.' },
})

export const approximationChapter = chapter('approximation', [source('sa', 'Stochastic Approximation', 'L6, pp.7–60')], {
  prerequisite: '前置：样本均值、期望与基本梯度', eyebrow: 'Part II · 带噪声的增量更新', title: '噪声观测下的增量估计与随机逼近',
  intro: 'Monte Carlo 的增量均值已经具有“当前估计加一步纠正”的结构。随机逼近把这个结构推广到未知方程：只要能获得无偏或受控偏差的 noisy observation，就能沿着随机方向逐步靠近根。步长既决定每次相信新数据多少，也决定噪声是否最终被平均掉。',
  bridge: '从求根问题出发，定义带噪声观测，再得到 Robbins–Monro 更新及其步长条件。', experimentIntro: '在同一条噪声序列上比较固定步长与衰减步长。改变噪声幅度和步长，观察追踪速度、残余波动和最终误差。', interpretation: '固定步长不会完全忘记新数据，因此能追踪变化，但会在真值附近持续波动。衰减步长早期移动快、后期逐渐平均噪声；衰减过快则可能在尚未到达根时失去调整能力。',
  figure: '交互图 07.1 · Stochastic Approximation Lab', instruction: '在相同 seed 下比较固定和衰减步长', question: '步长怎样同时控制学习速度与噪声残留？',
  deepening: approximationDeepeningZh,
  derivation: [
    step('root', '把目标写成求根', String.raw`g(w^*)=0`, '未知量 w* 由方程的根定义。', '均值估计可写成 g(w)=w-E[X]；强化学习中的许多 value 方程也可改写为残差等于零。', ['根存在'], [[String.raw`g`, '期望残差函数']]),
    step('noisy-observation', '用样本构造 noisy observation', String.raw`\widetilde g(w_k,\eta_k)=g(w_k)+\eta_k`, '我们看不到 g，只看到包含随机误差的单次观测。', '当条件期望中的噪声为零时，多次观测的平均方向仍指向真实残差。', [String.raw`\mathbb E[\eta_k\mid w_k]=0`], [[String.raw`\eta_k`, '第 k 次观测噪声']]),
    step('rm-update', '沿观测到的残差反方向移动', String.raw`w_{k+1}=w_k-\alpha_k\widetilde g(w_k,\eta_k)`, '正残差让估计减小，负残差让估计增大。', '这就是 Robbins–Monro 更新。α_k 把 noisy direction 转换为实际移动距离。', [String.raw`\alpha_k>0`], [[String.raw`\alpha_k`, '第 k 步步长']]),
    step('mean-special-case', '均值估计是一个特例', String.raw`w_{k+1}=w_k+\alpha_k(X_k-w_k)`, '令 g(w)=w-E[X]，单样本 X_k 直接给出 noisy residual。', '当 α_k=1/(k+1) 时，递推与样本平均完全一致；其他步长则改变历史样本的权重。', ['X_k 具有有限方差'], [[String.raw`X_k-w_k`, '新观测相对当前均值的误差']]),
    step('step-conditions', '让总移动无限而总噪声有限', String.raw`\sum_{k=1}^{\infty}\alpha_k=\infty,\qquad\sum_{k=1}^{\infty}\alpha_k^2<\infty`, '第一条避免过早停止，第二条让累计噪声能被控制。', '典型选择 α_k=1/k 同时满足两条；固定步长不满足第二条，因此通常只在根附近形成稳态波动。', ['残差方向稳定且噪声方差有界'], [[String.raw`\sum\alpha_k^2`, '随机扰动的累计尺度']]),
  ],
  prelude: [section('increment', '统一形式', '学习是估计加上误差驱动的纠正', ['MC、TD 和随机梯度都可以看成旧参数加步长乘 noisy direction。']), section('two-jobs', '步长的双重职责', '既要走得到，也要停得稳', ['较大步长快速响应，较小步长压低噪声；调度决定二者如何随时间交换。'])],
  sections: [section('constant-decay', '两种目标', '收敛到常数与跟踪变化不是同一个任务', ['衰减步长适合固定真值和渐近收敛；固定步长保留对新数据的敏感度，适合非平稳问题。'], String.raw`w_{k+1}=(1-\alpha)w_k+\alpha X_k`), section('sgd-bridge', '连接优化', 'SGD 是随机逼近在梯度求根上的应用', ['最小化期望损失等价于寻找期望梯度为零的参数。单样本梯度是这个期望梯度的 noisy observation。'], String.raw`\mathbf w_{k+1}=\mathbf w_k-\alpha_k\nabla_{\mathbf w}f(\mathbf w_k,X_k)`), section('forward', '下一步', 'TD 用一次转移构造 Bellman 残差样本', ['下一章把未知的 value 方程写成求根，并用当前 value 估计构造单步 target。'])],
  summary: ['随机逼近用 noisy observation 求未知期望方程的根。', '步长决定新样本与历史估计的权重。', '衰减条件平衡持续移动和噪声抑制。', 'SGD 与 TD 都继承同一个增量结构。'], explorer: { cue: '先比较收敛速度，再看后半段波动；最终点偶然接近真值不等于整个过程稳定。' },
}, {
  prerequisite: 'Prerequisites: sample means, expectations, and basic gradients', eyebrow: 'Part II · Noisy incremental updates', title: 'Incremental estimation and stochastic approximation under noise',
  intro: 'The incremental Monte Carlo mean already has the form “current estimate plus a correction.” Stochastic approximation generalizes that structure to unknown equations: a noisy observation of the residual can guide estimates toward a root. Step size determines both how much to trust new data and whether noise is eventually averaged away.',
  bridge: 'Start with root finding, define a noisy observation, and derive the Robbins–Monro update and its step-size conditions.', experimentIntro: 'Compare constant and decaying step sizes on the same noise sequence. Vary noise and step size to inspect response speed, residual fluctuation, and final error.', interpretation: 'A constant step keeps responding to new data and can track change, but it continues to fluctuate near the truth. A decaying step averages noise increasingly well; if it decays too fast, it can lose the ability to reach the root.',
  figure: 'Interactive Figure 07.1 · Stochastic Approximation Lab', instruction: 'Compare constant and decaying steps under one seed', question: 'How does step size control both learning speed and residual noise?',
  deepening: approximationDeepeningEn,
  derivation: [step('root', 'Write the target as a root', String.raw`g(w^*)=0`, 'The unknown w* is defined by a root.', 'Mean estimation uses g(w)=w-E[X]; value equations can also be written as zero residuals.', ['a root exists'], [[String.raw`g`, 'expected residual function']]), step('noisy-observation', 'Construct a noisy observation', String.raw`\widetilde g(w_k,\eta_k)=g(w_k)+\eta_k`, 'The true residual is hidden; one sample contains random error.', 'With conditionally zero-mean noise, the average observed direction still points to the true residual.', [String.raw`\mathbb E[\eta_k\mid w_k]=0`], [[String.raw`\eta_k`, 'observation noise']]), step('rm-update', 'Move opposite the observed residual', String.raw`w_{k+1}=w_k-\alpha_k\widetilde g(w_k,\eta_k)`, 'Positive residual decreases the estimate and negative residual increases it.', 'This is the Robbins–Monro update; α_k turns a noisy direction into a displacement.', [String.raw`\alpha_k>0`], [[String.raw`\alpha_k`, 'step size']]), step('mean-special-case', 'Recover incremental mean estimation', String.raw`w_{k+1}=w_k+\alpha_k(X_k-w_k)`, 'Set g(w)=w-E[X] and use X_k as the sample observation.', 'With α_k=1/(k+1), the recursion equals the sample mean exactly.', ['X_k has finite variance'], [[String.raw`X_k-w_k`, 'sample error']]), step('step-conditions', 'Keep total motion infinite and total noise finite', String.raw`\sum_{k=1}^{\infty}\alpha_k=\infty,\qquad\sum_{k=1}^{\infty}\alpha_k^2<\infty`, 'The first condition prevents premature stopping; the second controls accumulated noise.', 'The schedule 1/k satisfies both. A constant step violates the second and usually fluctuates around the root.', ['stable residual direction and bounded noise variance'], [[String.raw`\sum\alpha_k^2`, 'accumulated noise scale']])],
  prelude: [section('increment', 'Common form', 'Learning is an estimate plus an error-driven correction', ['MC, TD, and stochastic gradients all update an old parameter with a noisy direction.']), section('two-jobs', 'Two jobs', 'The step must arrive and settle', ['Large steps respond quickly; small steps suppress noise. A schedule trades these roles over time.'])],
  sections: [section('constant-decay', 'Two objectives', 'Converging to a constant and tracking change differ', ['Decaying steps suit stationary targets and asymptotic convergence. Constant steps retain sensitivity to recent data.'], String.raw`w_{k+1}=(1-\alpha)w_k+\alpha X_k`), section('sgd-bridge', 'Optimization bridge', 'SGD applies stochastic approximation to a gradient root', ['Minimizing expected loss means finding a zero expected gradient; a sample gradient is its noisy observation.'], String.raw`\mathbf w_{k+1}=\mathbf w_k-\alpha_k\nabla_{\mathbf w}f(\mathbf w_k,X_k)`), section('forward', 'Next step', 'TD samples a Bellman residual from one transition', ['The next chapter writes value prediction as root finding and builds a one-step target from the current value estimate.'])],
  summary: ['Stochastic approximation solves expectation-defined roots with noisy observations.', 'Step size weights new evidence against history.', 'Decay conditions balance continued motion and noise control.', 'SGD and TD inherit the same incremental structure.'], explorer: { cue: 'Compare convergence speed and late fluctuation; one lucky final point is not evidence of a stable process.' },
})

export const tdChapter = chapter('td', [source('td', 'Temporal-Difference Learning', 'L7, pp.6–23, 34–36')], {
  prerequisite: '前置：Bellman 期望方程与随机逼近', eyebrow: '第 8 章 · 不等待终点的预测', title: '时间差分学习',
  intro: '前两章已经建立两条关键基础：第 06 章用完整回合的回报估计价值，第 07 章则用增量误差修正逼近期望方程的解。但 Monte Carlo 仍要等到回合终止才得到完整回报，无法在交互中途吸收新证据。环境其实在每一步都会返回即时奖励和后继状态，因此尚未解决的问题是：怎样把随机逼近的增量更新用到单步转移上，在完整回报不可用时立即修正刚刚离开的状态？本章将推导时间差分（temporal-difference，TD）预测，并在共享网格中检验价值能否随轨迹生成而逐步传播。',
  bridge: 'Bellman 期望方程把长期价值分成一步奖励和后继价值。真实转移给出前一部分，当前价值表暂时代替尚未发生的后半段，由此形成一步学习目标（target）。学习目标与当前预测之差称为时间差分误差；随机逼近再把这项误差的一部分写回被访问状态。',
  experimentIntro: '下面让同一固定策略从共享 5×5 网格中的三个不同起点生成回合。三条彩色连线分别从 s25、s15 与 s5 出发，并在靠近终点时共享部分路径；逐步播放时，当前轨迹和已经走过的线段会同步高亮。每一帧还会显示环境转移、更新前价值、学习目标、时间差分误差、修正量和写回后的共享价值表。TD(0)、多步目标与 Monte Carlo 的可用时刻则在当前轨迹的同一证据上并排比较。',
  interpretation: '第一条短轨迹让最靠近终点的状态直接吸收终局奖励；后两条轨迹从更远位置出发，并在重叠后缀上读取前面轨迹已经写回的后继价值。这样，价值表既汇总不同回合的访问，又让终点信息沿共享状态逐步向前传播。TD(0) 每一步都能提交更新，多步目标需要等待更多真实奖励，Monte Carlo 则必须等到当前回合终止；三者改变的是证据到达时间和自举位置，而不是它们在当前轨迹中看到的转移。',
  figure: '交互图 08.1 · 共享网格中的 TD 在线更新', instruction: '播放三条彩色轨迹，核对连线、目标、误差、修正量和共享价值表写回', question: '不同轨迹怎样把各自的转移证据累积进同一张价值表？',
  deepening: tdDeepeningZh,
  derivation: [step('bellman-root', '从固定策略的 Bellman 方程出发', String.raw`v^{\pi}(s)=\mathbb E_{\pi}[R_{t+1}+\gamma v^{\pi}(S_{t+1})\mid S_t=s]`, '真实状态价值等于一步奖励与后继真实价值之和的条件期望。', '这里评价给定策略，不对动作取最大值。', [String.raw`\pi\ \text{固定}`], [[String.raw`v^{\pi}`, '固定策略下的真实状态价值']]), step('sample-target', '用一次转移构造学习目标', String.raw`U_t=R_{t+1}+\gamma V_t(S_{t+1})`, '用当前后继估计暂时代替未知的后继真实价值。', '后继状态一到达，学习目标即可计算，无需等待回合结束。', [String.raw`V_t\ \text{是更新前的当前估计}`], [[String.raw`U_t`, '一步 TD 学习目标']]), step('td-error', '用目标减去当前预测', String.raw`\delta_t=U_t-V_t(S_t)`, '误差的符号说明本次转移支持向上还是向下修正。', '它是当前 Bellman 残差的一次随机样本，也是本步获得的新信息。', [], [[String.raw`\delta_t`, '时间差分误差']]), step('td-update', '把误差的一部分写回当前状态', String.raw`V_{t+1}(S_t)=V_t(S_t)+\alpha_t\delta_t`, '只修改刚刚离开的状态，其他表项保持不变。', '这正是上一章随机逼近的“旧估计加误差修正”结构。', [String.raw`0<\alpha_t\le 1`], [[String.raw`\alpha_t`, '本次更新的步长']]), step('target-contraction', '验证更新会靠近本次目标', String.raw`V_{t+1}(S_t)-U_t=(1-\alpha_t)\left(V_t(S_t)-U_t\right)`, '更新后与目标的距离缩小为原来的一个比例。', '只要步长位于零和一之间，本次写回就不会远离已经构造出的目标。', [String.raw`0<\alpha_t<1`, String.raw`U_t\ \text{在本次写回中固定}`], [[String.raw`1-\alpha_t`, '目标距离的收缩比例']]), step('expected-error', '在真实价值处检查误差均值', String.raw`\mathbb E_{\pi}[\delta_t\mid S_t=s,\ V_t=v^{\pi}]=0`, '当估计已经等于真实策略价值时，TD 误差的条件期望为零。', '单次误差仍可非零，但长期平均不再提供系统性的修正方向。', [String.raw`V_t=v^{\pi}`], [[String.raw`\mathbb E[\delta_t\mid S_t=s]`, '状态 s 上的平均创新']])],
  prelude: [section('timing', '新证据的到达时刻', '每次转移都能检验刚刚离开的状态', ['环境返回一次奖励和一个后继状态时，后面的奖励尚未发生，因此完整回报仍不可用。不过，这次转移已经给出了 Bellman 方程右侧的一次样本，足以检查当前预测是否与局部一步结果一致。', '时间差分方法利用的正是这条局部一致性：它在每次转移后形成暂时的学习目标，立即修正当前状态，而不虚构尚未发生的奖励。']), section('bootstrap', '自举机制', '当前后继估计暂时代替尚未发生的未来', ['把已有的后继价值估计放入新学习目标称为自举（bootstrapping）。因此算法无需等到回合结束，并且可以在没有自然终点的持续型任务中逐步更新。', '代价是学习目标会继承价值表中的现有误差。后继估计过高会把当前状态向上拉，过低则会向下压；只有反复访问和连续写回，整张表才会逐步接近同一个 Bellman 不动点。'])],
  sections: [section('n-step', '多步目标', '等待更多真实奖励会减少对当前估计的依赖', ['TD(0) 等待一个奖励便从下一状态自举；如果继续等待多个奖励，再从更远的状态补上尾部，就得到多步目标。它保持相同的价值预测任务，只改变真实证据的展开长度。', '展开步数越大，目标越少依赖当前价值表，却需要更长等待并吸收更多轨迹随机性。当展开一直到终点且终止状态价值为零时，多步目标就退化为 Monte Carlo 回报。'], String.raw`G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nV_t(S_{t+n})`), section('online', '在线传播', '写回后的价值成为后续更新的新输入', ['实验中，第一回合的终局奖励先修改最靠近目标的状态。第二回合经过同一位置时，更早的状态会读取这项已经写回的后继价值；第三回合又把信息继续向前传递。', '这说明在线学习不只是“更早得到一个 target”：一次更新的输出会成为后续转移或下一回合的输入。只要折扣回报或其他长期标准定义良好，同一机制也能用于持续型任务。']), section('forward', '从预测到控制', '动作选择要求把状态价值扩展为动作价值', ['本章始终固定策略，只估计各状态在该策略下的长期价值。控制还要比较同一状态中的不同动作，因此学习对象必须从状态价值扩展到动作价值。', '下一章会把单步学习目标写入动作价值：一种方法读取行为实际选择的下一动作，另一种方法读取下一状态中的最大动作价值。两种选择将产生不同的控制算法。'])],
  summary: ['时间差分预测在每次转移后形成学习目标，因此不必等待完整回报。', '时间差分误差是 Bellman 残差的随机样本，步长决定其中多少被写回。', '一次写回会缩短当前估计与本次目标的距离，正确价值处的平均误差为零。', '多步目标通过改变真实奖励的展开长度，在及时自举与完整回报之间取舍。'], explorer: { cue: '播放时沿“转移证据—学习目标—误差—修正量—写回”读取；再确认写回后的表怎样成为下一帧的输入。' },
}, {
  prerequisite: 'Prerequisites: Bellman expectation equation and stochastic approximation', eyebrow: 'Chapter 8 · Prediction before termination', title: 'Temporal-Difference Learning',
  intro: 'The previous two chapters established two key foundations: Chapter 6 estimates value from complete-episode returns, and Chapter 7 uses incremental error corrections to approach expectation-defined solutions. Yet Monte Carlo still waits for termination before absorbing new evidence. Every environment step already reveals an immediate reward and a successor state, leaving a concrete unresolved problem: how can incremental stochastic approximation revise the state just left while the complete return is unavailable? This chapter derives temporal-difference (TD) prediction and tests whether value information propagates while a shared-grid trajectory is generated.',
  bridge: 'The Bellman expectation equation separates long-term value into one-step reward and successor value. A real transition supplies the first part, while the current value table temporarily represents the unobserved tail, producing a one-step learning target. The difference between that target and the current prediction is the TD error; stochastic approximation writes a fraction of the error back to the visited state.',
  experimentIntro: 'One fixed policy generates episodes from three different starts in the shared 5×5 grid. Colored connected paths begin at s25, s15, and s5 and share a suffix near the goal; playback highlights the active trajectory and each traversed segment. Every frame also synchronizes the environment transition, value before update, learning target, TD error, correction, and the shared committed value table. Availability clocks compare TD(0), a multi-step target, and Monte Carlo on the current trajectory’s identical evidence.',
  interpretation: 'The first short trajectory lets the state nearest the goal directly absorb terminal reward. The next two start farther away and read successor values already committed by earlier trajectories along their shared suffix. The table therefore aggregates visits across episodes while terminal information moves through shared states. TD(0) commits after every step, a multi-step target waits for more realized rewards, and Monte Carlo waits for the current episode to terminate; the methods change evidence timing and bootstrap position, not the transitions they see within that trajectory.',
  figure: 'Interactive Figure 08.1 · Online TD updates in the shared grid', instruction: 'Play three colored trajectories and audit their paths, targets, errors, corrections, and shared value-table commits', question: 'How do different trajectories accumulate their transition evidence in one value table?',
  deepening: tdDeepeningEn,
  derivation: [step('bellman-root', 'Start from the fixed-policy Bellman equation', String.raw`v^{\pi}(s)=\mathbb E_{\pi}[R_{t+1}+\gamma v^{\pi}(S_{t+1})\mid S_t=s]`, 'True state value is the conditional expectation of one-step reward plus true successor value.', 'This evaluates a fixed policy and contains no action maximization.', [String.raw`\pi\ \text{is fixed}`], [[String.raw`v^{\pi}`, 'true state value under the fixed policy']]), step('sample-target', 'Construct a learning target from one transition', String.raw`U_t=R_{t+1}+\gamma V_t(S_{t+1})`, 'The current successor estimate temporarily replaces the unknown successor truth.', 'The target is available as soon as the successor state arrives.', [String.raw`V_t\ \text{is the pre-update estimate}`], [[String.raw`U_t`, 'one-step TD learning target']]), step('td-error', 'Subtract the current prediction', String.raw`\delta_t=U_t-V_t(S_t)`, 'The sign of the error determines whether this transition supports an upward or downward correction.', 'It is one random sample of the current Bellman residual and the innovation supplied by this step.', [], [[String.raw`\delta_t`, 'temporal-difference error']]), step('td-update', 'Write a fraction of the error to the current state', String.raw`V_{t+1}(S_t)=V_t(S_t)+\alpha_t\delta_t`, 'Only the state just left changes; all other table entries remain fixed.', 'This is the previous chapter’s old-estimate-plus-error-correction stochastic-approximation form.', [String.raw`0<\alpha_t\le 1`], [[String.raw`\alpha_t`, 'step size for this update']]), step('target-contraction', 'Verify that the update approaches this target', String.raw`V_{t+1}(S_t)-U_t=(1-\alpha_t)\left(V_t(S_t)-U_t\right)`, 'The post-update distance to the target is a fraction of the previous distance.', 'A step strictly between zero and one cannot move away from the target already constructed for this update.', [String.raw`0<\alpha_t<1`, String.raw`U_t\ \text{is fixed during the commit}`], [[String.raw`1-\alpha_t`, 'target-distance contraction factor']]), step('expected-error', 'Check the mean error at the true value', String.raw`\mathbb E_{\pi}[\delta_t\mid S_t=s,\ V_t=v^{\pi}]=0`, 'When the estimate equals the true policy value, conditional mean TD error is zero.', 'Individual errors can remain nonzero, but their average supplies no systematic correction direction.', [String.raw`V_t=v^{\pi}`], [[String.raw`\mathbb E[\delta_t\mid S_t=s]`, 'mean innovation at state s']])],
  prelude: [section('timing', 'Arrival of new evidence', 'Every transition can test the state just left', ['When the environment returns one reward and a successor state, later rewards have not happened and the complete return is still unavailable. The transition nevertheless supplies one sample of the Bellman right-hand side, enough to test local consistency of the current prediction.', 'Temporal-difference learning uses exactly that local evidence. It forms a provisional learning target after each transition and immediately revises the current state without inventing rewards that have not occurred.']), section('bootstrap', 'Bootstrapping', 'The current successor estimate represents the unobserved future', ['Placing an existing successor estimate in a new learning target is called bootstrapping. It removes the need to wait for termination and supports stepwise updates in continuing tasks.', 'The cost is inherited table error. An overestimated successor pulls the current state upward and an underestimated successor pushes it downward; repeated visits and commits are needed before the coupled table approaches one Bellman fixed point.'])],
  sections: [section('n-step', 'Multi-step targets', 'Waiting for more realized rewards reduces dependence on the current estimate', ['TD(0) waits for one reward and bootstraps from the next state. Waiting for several rewards before filling the remaining tail from a later state gives a multi-step target. The prediction task stays fixed; only the amount of realized evidence changes.', 'A longer horizon relies less on the current value table but introduces more delay and trajectory randomness. Expanding to termination with zero terminal value yields the Monte Carlo return.'], String.raw`G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nV_t(S_{t+n})`), section('online', 'Online propagation', 'A committed value becomes input to a later update', ['In the experiment, terminal reward first changes the state nearest the goal. On the next episode an earlier state reads that committed successor value, and the third episode carries the information one step farther backward.', 'Online learning therefore means more than obtaining an early target: one update’s output becomes input to a later transition or episode. The same mechanism applies to continuing tasks whenever discounting or another long-run criterion is well defined.']), section('forward', 'Prediction to control', 'Action selection requires action value', ['This chapter keeps the policy fixed and estimates long-run state value. Control must compare actions within the same state, so the learned object must expand from state value to action value.', 'The next chapter writes the one-step target into action value. One method reads the next action actually selected by behavior; another reads the largest value in the successor state. Those choices produce different control algorithms.'])],
  summary: ['Temporal-difference prediction forms a learning target after every transition and need not wait for a complete return.', 'TD error is a random Bellman-residual sample; the step size determines how much is committed.', 'A commit moves the estimate toward the current target, and mean error is zero at the true value.', 'Multi-step targets trade timely bootstrapping for more realized reward evidence.'], explorer: { cue: 'Read each frame as transition evidence, learning target, error, correction, and commit; then verify that the committed table becomes the next frame’s input.' },
})

export const controlChapter = chapter('control', [source('control', 'Sarsa and Q-learning', 'L7, pp.25–54')], {
  prerequisite: '前置：动作价值、TD target 与 ε-greedy 探索', eyebrow: 'Part II · 从预测到控制', title: 'Sarsa 与 Q-learning',
  intro: '上一章已经能够在固定策略下用一步经验更新状态价值，但预测不会告诉智能体在每个状态应该选择哪个动作。在模型未知的共享 5×5 网格中，智能体必须一边收集转移，一边用动作价值改善后续行为；尚未解决的是，更新目标应当跟随实际发生的探索动作，还是假设未来总选择当前最优动作。本章从同一条真实转移推导两种目标，再检验这种选择怎样改变学习过程和避开禁区的能力。', bridge: '先把状态价值的 TD 更新改写为动作价值更新，再明确产生经验的行为策略与定义学习对象的目标策略。',
  experimentIntro: 'Control Arena 把 Sarsa 与 Q-learning 固定在同一个共享 5×5 网格中：两者共享起点、禁区、目标区、步长、探索率和训练预算，但各自根据已经写回的动作价值继续采样。预热六十回合后，实验同步展示四十八次真实写回。每一帧都会更新两张网格中的动作价值、贪心箭头、实际轨迹、后继动作读取和写回结果，使 target 的差异怎样逐步改变后续行为清楚可见。长期指标再用五个固定随机种子汇总进入禁区的回合比例与回报。', interpretation: '同步对比固定的是环境参数、训练预算和当前写回编号，而不是强行让两个算法经历相同转移。Sarsa 把行为策略真实选择的后继动作放进 target，Q-learning 则读取后继状态中的最大动作价值；写回后，两张表会改变各自下一步的动作选择，轨迹因而自然分化。网格中的禁区访问、策略箭头和动作价值共同解释这种局部差异怎样累积成不同的长期结果。',
  figure: '交互图 09.1 · Sarsa / Q-learning Control Arena', instruction: '播放真实采样的连续更新，再比较多 seed 下的长期路径', question: '实际探索动作进入 target 后，下一次更新和最终路径会怎样改变？',
  deepening: controlDeepeningZh,
  derivation: [step('sarsa-target', '先跟随实际下一动作', String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma Q_t(S_{t+1},A_{t+1})`, 'A_{t+1} 由当前行为策略实际采样。', '名称 Sarsa 来自一次更新使用的 S,A,R,S,A 五个对象。', ['A_{t+1} 已经被行为策略选择'], [[String.raw`A_{t+1}`, '下一时刻实际将执行的动作']]), step('sarsa-update', '更新被访问的动作价值', String.raw`\begin{aligned}Q_{t+1}(S_t,A_t)&=Q_t(S_t,A_t)\\ &\quad+\alpha_t U_t^{\mathrm{Sarsa}}\\ &\quad-\alpha_t Q_t(S_t,A_t).\end{aligned}`, 'Sarsa 评价正在产生数据的策略。', '当行为策略持续 ε-greedy 时，target 中保留未来探索动作的后果，因此是 on-policy。', ['状态—动作对持续被访问'], [[String.raw`U_t^{\mathrm{Sarsa}}`, 'on-policy TD target']]), step('q-target', '把下一动作换成最大化', String.raw`U_t^{Q}=R_{t+1}+\gamma\max_a Q_t(S_{t+1},a)`, 'target 假设下一步选择当前最优动作。', '生成数据的行为策略可以仍然探索，但求解对象是 Bellman 最优方程。', [], [[String.raw`\max_a Q_t(S_{t+1},a)`, '目标策略的贪心后继价值']]), step('q-update', '用同一经验更新最优动作价值估计', String.raw`\begin{aligned}Q_{t+1}(S_t,A_t)&=Q_t(S_t,A_t)\\ &\quad+\alpha_t U_t^{Q}\\ &\quad-\alpha_t Q_t(S_t,A_t).\end{aligned}`, '采到的动作可以不是贪心动作，target 仍指向贪心后继。', '数据分布与被学习的策略分离，因此 Q-learning 是 off-policy。', ['behavior policy 提供充分覆盖'], [[String.raw`U_t^{Q}`, 'off-policy optimality target']]), step('policy-roles', '显式分开两种策略', String.raw`A_t\sim b(\cdot\mid S_t),\qquad \pi(s)\in\arg\max_a Q(s,a)`, 'b 负责探索和采样，π 表示希望学习的目标行为。', 'Sarsa 的 target 跟随 b；Q-learning 的 target 跟随贪心 π。区分二者是理解 on/off-policy 的关键。', [String.raw`b(a\mid s)>0\ \text{for required actions}`], [[String.raw`b`, '行为策略'], [String.raw`\pi`, '目标策略']])],
  prelude: [section('prediction-control', '从预测到控制', '动作价值开始影响后续行为', ['TD prediction 只需在固定策略下估计价值；控制还要依据当前 Q 值改变动作选择，因此一次更新会影响后续采到哪些数据。', '价值估计、探索行为和策略改善由此形成闭环。算法不再面对固定的数据分布，早期估计误差也可能通过动作选择被持续放大。']), section('fair-comparison', '比较协议', '单步反事实与长期训练需要不同的控制条件', ['识别 target 的直接作用时，应固定一条真实采样的转移和更新前动作价值表：Sarsa 读取已经采样、下一步确实会执行的动作，Q-learning 在同一后继状态读取最大动作价值。这样得到的首步差异只来自后继动作规则。', '考察控制的长期后果时，动作价值一旦不同，行为策略和后续轨迹也会自然分化，因而不能继续声称两个算法看见同一转移序列。此时应锁定环境、步长、探索率、训练预算和一组随机种子，并汇总多次独立运行。'])],
  sections: [section('on-policy', 'On-policy', 'Sarsa 评价并改进正在执行的探索策略', ['Sarsa 的 target 使用行为策略在下一状态实际选择的 A_{t+1}，所以禁区附近偶尔发生的探索动作也会进入长期价值。', '它学习的是持续 ε-greedy 行为本身的动作价值；ε 改变时，策略的风险和对应最优解也会随之改变。'], String.raw`Q\approx q^{b}`), section('off-policy', 'Off-policy', 'Q-learning 从探索数据中逼近贪心目标', ['Q-learning 仍可用行为策略 b 收集数据，但 target 在下一状态直接选择最大 Q 值，相当于评价另一条贪心目标策略。', '这种分离允许边探索边学习贪心解，却不免除覆盖要求：从未访问的动作没有样本，错误初值也就无法被纠正。'], String.raw`Q\approx q^*,\qquad A\sim b`), section('forward', '表格的边界', '参数共享替代逐项存储', ['表格方法为每个状态—动作对保存独立数值，空间规模随状态与动作数量相乘增长，未访问项之间也不能共享证据。', '下一章把 Q 或 V 写成带参数的函数，使一次样本能够影响具有相似表示的多个状态，同时引入泛化与相互干扰的新问题。'])],
  summary: ['Sarsa target 使用实际下一动作，是 on-policy 控制。', 'Q-learning target 使用动作最大值，是 off-policy 控制。', '行为策略负责数据覆盖，目标策略定义学习对象。', '单步机制比较固定转移，长期结果比较匹配条件下的多次独立训练。'], explorer: { cue: '把进入禁区的回合比例、每回合平均禁区访问次数和回报一起读；更直接的贪心路线不一定在持续探索下具有更高回报。' },
}, {
  prerequisite: 'Prerequisites: action value, TD targets, and ε-greedy exploration', eyebrow: 'Part II · Prediction to control', title: 'Sarsa and Q-learning',
  intro: 'The previous chapter can update state values from one-step experience under a fixed policy, but prediction does not decide which action to take in each state. In the unknown shared 5×5 grid, the agent must collect transitions while using action values to improve later behavior. The unresolved choice is whether the target should follow the exploration action that actually occurs or assume that every future action is currently greedy. This chapter derives both targets on one realized transition and tests how that choice changes learning and avoidance of forbidden states.', bridge: 'First rewrite the state-value TD update for action values, then separate the behavior policy that generates evidence from the target policy that defines what is learned.',
  experimentIntro: 'Control Arena fixes Sarsa and Q-learning in the same shared 5×5 grid. They share the start, forbidden states, target, step size, exploration rate, and training budget, but each samples later transitions from its own committed action values. After sixty warm-up episodes, the lab exposes forty-eight synchronized real commits. Every frame updates both grids’ action values, greedy arrows, realized path, successor readout, and committed result, revealing how the target difference propagates into later behavior. Long-run forbidden-state frequency and return are aggregated across five fixed seeds.', interpretation: 'The synchronized comparison holds environment parameters, training budget, and commit index fixed; it does not force the algorithms to consume an identical transition stream. Sarsa places the successor action actually selected by behavior in its target, while Q-learning reads the largest action value in the successor state. Once committed, the different tables change later action choices and the trajectories naturally diverge. Forbidden-state visits, policy arrows, and action values jointly explain how the local distinction accumulates into different long-run outcomes.',
  figure: 'Interactive Figure 09.1 · Sarsa / Q-learning Control Arena', instruction: 'Play consecutive sampled updates, then compare long-run paths across fixed seeds', question: 'How does putting the realized exploration action into the target change the next update and final path?',
  deepening: controlDeepeningEn,
  derivation: [step('sarsa-target', 'Follow the actual next action', String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma Q_t(S_{t+1},A_{t+1})`, 'A_{t+1} is sampled by the behavior policy.', 'Sarsa is named for the S,A,R,S,A objects used in one update.', ['A_{t+1} has been selected'], [[String.raw`A_{t+1}`, 'next action actually taken']]), step('sarsa-update', 'Update the visited action value', String.raw`\begin{aligned}Q_{t+1}(S_t,A_t)&=Q_t(S_t,A_t)\\ &\quad+\alpha_t U_t^{\mathrm{Sarsa}}\\ &\quad-\alpha_t Q_t(S_t,A_t).\end{aligned}`, 'Sarsa evaluates the policy that generates its data.', 'With continuing ε-greedy behavior, future exploration consequences remain in the target.', ['continued state-action coverage'], [[String.raw`U_t^{\mathrm{Sarsa}}`, 'on-policy TD target']]), step('q-target', 'Replace the next action by maximization', String.raw`U_t^{Q}=R_{t+1}+\gamma\max_a Q_t(S_{t+1},a)`, 'The target assumes the current greedy next action.', 'Behavior may still explore, but the equation being solved is the Bellman optimality equation.', [], [[String.raw`\max_a Q_t(S_{t+1},a)`, 'greedy successor value']]), step('q-update', 'Update optimal action value from the same experience', String.raw`\begin{aligned}Q_{t+1}(S_t,A_t)&=Q_t(S_t,A_t)\\ &\quad+\alpha_t U_t^{Q}\\ &\quad-\alpha_t Q_t(S_t,A_t).\end{aligned}`, 'The sampled action can be exploratory while the target remains greedy.', 'Separating data and target policies makes Q-learning off-policy.', ['behavior provides coverage'], [[String.raw`U_t^{Q}`, 'off-policy optimality target']]), step('policy-roles', 'Name both policies explicitly', String.raw`A_t\sim b(\cdot\mid S_t),\qquad \pi(s)\in\arg\max_a Q(s,a)`, 'b samples experience; π names the behavior being learned.', 'Sarsa targets b while Q-learning targets greedy π.', [String.raw`b(a\mid s)>0\ \text{for required actions}`], [[String.raw`b`, 'behavior policy'], [String.raw`\pi`, 'target policy']])],
  prelude: [section('prediction-control', 'From prediction to control', 'Action values begin to change later behavior', ['TD prediction estimates value under a fixed policy. Control also changes action selection from current Q estimates, so an update changes which evidence will be collected next.', 'Value estimation, exploration, and policy improvement therefore form a feedback loop. The data distribution moves, and early estimation errors can be reinforced through behavior.']), section('fair-comparison', 'Comparison protocol', 'One-step counterfactuals and long-run training require different controls', ['To identify the direct target effect, freeze one realized transition and the pre-update action-value table. Sarsa reads the action that was sampled and will actually execute next; Q-learning reads the maximum in the same successor state. The first difference then comes only from the successor rule.', 'For long-run control, different action values necessarily produce different behavior and later trajectories, so the algorithms cannot keep seeing one identical transition stream. Instead, hold environment, step size, exploration, budget, and a set of seeds fixed, then aggregate independent runs.'])],
  sections: [section('on-policy', 'On-policy', 'Sarsa evaluates the exploratory policy it executes', ['The Sarsa target uses A_{t+1}, the action that the behavior policy actually selects. Exploratory moves near a hazard therefore enter its long-term value.', 'It learns action values for the continuing ε-greedy behavior itself, so changing ε changes both the experienced risk and the corresponding optimum.'], String.raw`Q\approx q^{b}`), section('off-policy', 'Off-policy', 'Q-learning approaches a greedy target from exploratory data', ['Q-learning can collect experience with behavior policy b while its target selects the largest successor Q value, thereby evaluating a different greedy target policy.', 'This separation supports exploration during data collection, but it does not remove coverage requirements. An action that is never sampled cannot have a mistaken initialization corrected.'], String.raw`Q\approx q^*,\qquad A\sim b`), section('forward', 'Table limits', 'Parameter sharing replaces independent entries', ['A table stores an independent number for every state-action pair, grows with their product, and transfers no evidence to an unvisited pair.', 'The next chapter uses a parameterized function so one sample can affect states with related representations, introducing both generalization and interference.'])],
  summary: ['Sarsa uses the actual next action and is on-policy.', 'Q-learning uses a maximizing target and is off-policy.', 'Behavior policy supplies coverage; target policy defines the learning objective.', 'Mechanism comparisons freeze a transition; long-run results aggregate independent matched runs.'], explorer: { cue: 'Read forbidden-state episode frequency, average forbidden visits, and return together; a more direct greedy route need not earn the highest return under persistent exploration.' },
})

export const vfaChapter = chapter('vfa', [source('vfa', 'Value Function Approximation', 'L8, pp.5–160')], {
  prerequisite: '前置：时序差分更新、均方误差与梯度下降', eyebrow: 'Part III · 从表格到函数', title: '价值函数近似',
  intro: '第 09 章已经能够在模型未知的 5×5 网格中用 Sarsa 与 Q-learning 学习动作价值并改善策略，但那套方法依赖一个隐含前提：每个状态—动作对都能在表格里独占一个独立表项。一旦状态数量庞大、由多维特征组合而成，或是连续坐标，逐项存储不仅放不下，更让绝大部分状态在有限交互中一次也访问不到，彼此无法共享经验。本章尚未解决的问题是：怎样用远少于状态数的共享参数表示价值函数，在有限容量下规定误差分配，并把单步时间差分样本写成参数更新？下面从加权价值误差出发推导半梯度更新与线性特征传播，并在共享 5×5 网格中检验同一共享机制为何既能带来泛化，也会在禁区与目标紧邻处引发干扰。',
  bridge: '从表格切到函数后，首先改变的是误差定义域：有限参数无法同时精确拟合所有状态，因此必须由访问分布权重指定折中方案，再用可观测时间差分目标构造半梯度更新，最后在线性特征中把参数共享写成可计算的内积传播。',
  experimentIntro: '实验把 6 个径向基特征锚定在共享 5×5 网格的第三行（$s_{11}$ 至 $s_{15}$）与目标格 $s_{18}$ 上，并在同一批样本序列上并排运行线性半梯度更新与独热表格对照。先预测：在“有益泛化”场景中从未被直接采样的 $s_{15}$ 会怎样变化；再切到“冲突干扰”场景，观察紧邻目标 $s_{18}$ 的禁区 $s_{13}$ 收到负样本后，参数向量 $\\mathbf w$ 的一次写回怎样通过特征内积反向拉低 $s_{18}$ 的预测。',
  interpretation: '两套场景使用完全相同的半梯度公式与共享网格特征，唯一差别在于相邻状态是否应当拥有相近价值。在平滑安全走廊中，宽特征把 $s_{14}$ 的正样本迅速传播给未访问邻居 $s_{15}$，显著胜过只能把未访问格留在零值的表格法；但在禁区 $s_{13}$ 与目标 $s_{18}$ 紧邻的边界上，同一个宽内积会让一次禁区样本改写目标格的已学价值，造成局部遗忘。缩小特征宽度会降低干扰，同时削弱跨状态泛化——特征表示本质上是在规定哪些状态应当共享证据。',
  figure: '交互图 10.1 · 共享网格价值函数近似实验室', instruction: '切换泛化与干扰场景、播放连续参数写回，并与同数据表格对照比较', question: '为什么同一个特征内积在安全走廊产生泛化，在禁区边界却引发干扰？',
  deepening: vfaDeepeningZh,
  derivation: [
    step('parameterization', '用共享参数向量代替独立价值表', String.raw`v^{\pi}(s)\approx\widehat v(s,\mathbf w),\qquad\mathbf w\in\mathbb R^d,\ d\ll|\mathcal S|`, '所有状态的预测都由同一组有限参数产生，不再各自独占表项。', '由于参数维数远小于状态数，修改参数向量的任一分量都会同时改变多个状态的预测值，跨状态经验共享从此成为结构属性而非事后补丁。', [String.raw`\widehat v(s,\mathbf w)\ \text{对}\ \mathbf w\ \text{可微}`], [[String.raw`\mathbf w`, '全体状态共享的参数向量'], [String.raw`d`, '参数维数']]),
    step('objective', '用状态访问分布加权定义近似误差', String.raw`J(\mathbf w)=\frac12\sum_{s\in\mathcal S}\mu(s)\left(v^{\pi}(s)-\widehat v(s,\mathbf w)\right)^2`, '容量有限时不可能令每个状态误差为零，因此按访问权重分配逼近精度。', '如果强行把所有状态等权平均，算法会把宝贵容量浪费在策略极少进入的区域；在策略评价中，通常取当前策略诱导的平稳访问分布作为权重。', [String.raw`\mu(s)\ge 0,\ \sum_s\mu(s)=1`], [[String.raw`\mu(s)`, '状态在训练分布中的访问权重'], [String.raw`J(\mathbf w)`, '加权均方价值误差']]),
    step('sample-target', '用一步时间差分目标替代未知真实价值', String.raw`U_t=R_{t+1}+\gamma\widehat v(S_{t+1},\mathbf w_t),\qquad\delta_t=U_t-\widehat v(S_t,\mathbf w_t)`, '真实策略价值未知，只能用单步转移构造可观测的临时监督目标。', '与完整回报不同，自举目标本身也依赖当前参数；如果对目标一起求导会得到另一种残差梯度，因此时间差分近似在求导步骤中把当前目标视为固定数值。', [String.raw`U_t\ \text{在本次求导中视为常数}`], [[String.raw`U_t`, '单步自举学习目标'], [String.raw`\delta_t`, '当前样本的时间差分误差']]),
    step('semi-gradient', '沿当前预测的负梯度执行半梯度更新', String.raw`\mathbf w_{t+1}=\mathbf w_t+\alpha_t\left(U_t-\widehat v(S_t,\mathbf w_t)\right)\nabla_{\mathbf w}\widehat v(S_t,\mathbf w_t)`, '时间差分误差决定推进方向与幅度，预测梯度决定哪些参数分量响应。', '因为只对预测项求梯度而忽略目标中的参数依赖，该更新称为半梯度（semi-gradient）时间差分；它保留了 Bellman 不动点结构，但不再等价于普通监督学习的纯梯度下降。', [String.raw`\alpha_t>0`, String.raw`\nabla_{\mathbf w}U_t\ \text{不进入更新}`], [[String.raw`\nabla_{\mathbf w}\widehat v(S_t,\mathbf w_t)`, '当前状态预测对参数的梯度']]),
    step('linear', '在线性特征下显式写出参数共享与跨状态传播', String.raw`\widehat v(s,\mathbf w)=\boldsymbol\phi(s)^{\top}\mathbf w,\qquad\Delta\mathbf w_t=\alpha_t\delta_t\boldsymbol\phi(S_t)`, '线性模型的梯度恰好就是特征向量本身，一次更新按特征权重改写参数。', '把该参数增量代入任意另一状态的特征向量，就能立刻看出其预测改变量正比于两状态特征的内积；泛化与干扰因此拥有同一个代数来源。', [String.raw`\nabla_{\mathbf w}\widehat v(s,\mathbf w)=\boldsymbol\phi(s)`], [[String.raw`\boldsymbol\phi(s)`, '状态特征向量'], [String.raw`\Delta\mathbf w_t`, '单步参数修正向量']]),
  ],
  prelude: [
    section('capacity', '表示瓶颈', '有限参数规定了状态之间如何共享证据', [
      '在表格 Sarsa 与 Q-learning 中，5×5 网格的每个状态都拥有独立表项，更新一格时其余 24 格纹丝不动。这种独立性在状态数很少时非常安全，但只要状态变成连续位置、多传感器读数或大规模组合配置，独立存储就会同时面临内存爆炸与样本稀疏两重失效：绝大多数状态在有限交互里从未出现过，即使相邻状态已经反复验证过价值，未访问状态仍停留在初始值。',
      '函数近似把价值表换成由有限参数向量 $\\mathbf w$ 控制的函数 $\\widehat v(s,\\mathbf w)$，使参数维数远小于状态规模。这样一来，从表格转向函数就不再只是换一种压缩容器，而是在状态空间中显式引入一种相似性几何：凡是共用同一批参数的状态，都会随着一次样本一起移动。',
    ]),
    section('distribution', '误差分配', '访问分布决定有限容量把精度放在哪里', [
      '当参数数量小于状态数量时，一般不存在能令所有状态误差同时为零的参数。强行追求全局精确只会无解，因此必须在目标函数中明确不同状态的重要性：策略频繁经过的区域应当拟合得更准，极少到达的角落则允许更大近似误差。',
      '这就是加权均方价值误差引入状态权重 $\\mu(s)$ 的原因。同一个函数族在不同的策略或起始分布下，会对应完全不同的最优参数投影；因而阅读近似结果时，不能只看某一个汇总误差，还必须知道它是按哪套访问分布加权得到的。',
    ]),
  ],
  sections: [
    section('generalization', '泛化', '共享特征把一次修正传播到相似状态', [
      '参数写回以后，哪怕状态 s\' 没有出现在本次转移中，只要它与被采样状态共享非零特征，其价值预测就会立刻改变。',
      '这种跨状态传播能显著提高样本效率，但前提是特征所编码的相似性与真实价值结构一致。',
    ], String.raw`\Delta\widehat v(s')=\boldsymbol\phi(s')^{\top}\Delta\mathbf w`),
    section('interference', '干扰与遗忘', '共享参数也会在边界状态之间制造互相冲突的修正', [
      '在上面的冲突干扰实验中，禁区 s_{13} 与目标 s_{18} 在网格上只相隔一步，但真实价值一负一正。当特征宽度较大时，两者共享很高的特征内积：给 s_{18} 写入正目标会顺带抬高禁区 s_{13}，随后 s_{13} 收到负样本时又会把刚学好的 s_{18} 向下拉回。',
      '这一现象揭示了函数近似的核心权衡：泛化与干扰不是两个独立模块，而是同一项特征内积在平滑区域与突变边界上的两种表现。仅监测整体均方误差很容易掩盖这种局部振荡与灾难性遗忘，必须同时核对关键边界状态在连续写回前后的预测轨迹。',
    ]),
    section('forward', '走向深度近似', '神经网络免去手工特征，却放大训练耦合', [
      '线性函数近似清楚地暴露了特征内积的作用，但高维图像、复杂棋局或长文本状态很难靠人工设计固定特征向量。用多层神经网络代替固定特征，可以让算法从数据中自动学习表示。',
      '然而非线性网络会让几乎所有状态的预测随一次梯度步共同移动，同时最大化的自举目标本身又由这个正在变化的网络生成。下一章将把这种耦合拆成“目标漂移”与“连续轨迹相关”两个来源，说明 Deep Q-learning 为何分别引入冻结目标网络与经验回放。',
    ]),
  ],
  summaryTitle: '从逐状态表格到参数共享',
  summary: [
    '函数近似用维数远小于状态数的共享参数向量替代独立价值表，使未访问状态能够借助相似性获得估计。',
    '有限容量下必须由状态访问分布加权定义均方误差；时间差分半梯度更新固定当前目标，只对预测项求导。',
    '在线性特征中，一次更新向其他状态传播的幅度等于特征内积乘步长与误差，泛化与干扰同出一源。',
    '把函数近似推进到策略控制后，参数变化同时改写行为分布与自举目标，与策略外学习共同构成致命三元组。',
  ],
  explorer: { cue: '先在“有益泛化”场景看未访问状态 s_{15} 如何超越表格法，再切到“冲突干扰”场景播放 s_{18} 与 s_{13} 的交替写回，最后收窄特征宽度观察干扰怎样减弱。' },
}, {
  prerequisite: 'Prerequisites: TD updates, squared error, and gradient descent', eyebrow: 'Part III · Tables to functions', title: 'Value Function Approximation',
  intro: 'Chapter 9 showed how Sarsa and Q-learning learn action values without a model in the 5×5 grid, yet both relied on one assumption: every state-action pair owns an independent table entry. Once states are numerous, combinatorial, or continuous, separate storage cannot fit in memory and leaves most states unvisited, preventing experience from transferring across similar situations. The unresolved problem is how to represent value with far fewer parameters than states, specify where approximation error is paid, and turn one TD transition into a parameter update. This chapter derives weighted value error, semi-gradient TD updates, and linear feature propagation, then tests on the shared 5×5 grid why one sharing mechanism creates both generalization and interference across the forbidden-target boundary.',
  bridge: 'Moving from tables to functions first changes the domain of error: limited parameters cannot fit every state exactly, so a visitation distribution weights the compromise before sample targets produce semi-gradient updates and linear features expose propagation through inner products.',
  experimentIntro: 'The lab anchors six radial-basis features on Row 3 ($s_{11}$ through $s_{15}$) and target $s_{18}$ of the shared 5×5 grid, running linear semi-gradient updates side by side with a tabular one-hot baseline on the exact same samples. First predict how unvisited $s_{15}$ behaves in the beneficial-generalization scenario; then switch to conflicting interference and watch a negative sample at forbidden $s_{13}$ pull down the adjacent target $s_{18}$ through the shared parameter vector $\\mathbf w$.',
  interpretation: 'Both scenarios execute the exact same semi-gradient update and grid features; only whether neighboring states should share similar values changes. Along a smooth corridor, wide features transfer evidence from $s_{14}$ to unvisited $s_{15}$ and beat tabular storage, which leaves unvisited entries at zero. Across the boundary where forbidden $s_{13}$ touches target $s_{18}$, the same wide inner product lets a forbidden sample overwrite target value, causing local forgetting. Narrowing feature width reduces interference while weakening transfer: representation explicitly encodes which states should move together.',
  figure: 'Interactive Figure 10.1 · Shared-Grid Value Function Approximation Lab', instruction: 'Switch between generalization and interference, play consecutive weight commits, and compare against the tabular baseline', question: 'Why does the same feature inner product produce generalization on a smooth corridor and interference across a forbidden boundary?',
  deepening: vfaDeepeningEn,
  derivation: [
    step('parameterization', 'Replace an independent value table with a shared parameter vector', String.raw`v^{\pi}(s)\approx\widehat v(s,\mathbf w),\qquad\mathbf w\in\mathbb R^d,\ d\ll|\mathcal S|`, 'Every state prediction comes from one finite parameter vector instead of a private table slot.', 'Because the parameter dimension is much smaller than the state space, changing one weight moves many state predictions together, making cross-state sharing structural.', [String.raw`\widehat v(s,\mathbf w)\ \text{is differentiable in}\ \mathbf w`], [[String.raw`\mathbf w`, 'shared parameter vector'], [String.raw`d`, 'parameter dimension']]),
    step('objective', 'Weight approximation error by the state visitation distribution', String.raw`J(\mathbf w)=\frac12\sum_{s\in\mathcal S}\mu(s)\left(v^{\pi}(s)-\widehat v(s,\mathbf w)\right)^2`, 'Limited capacity cannot zero every error simultaneously, so visitation weights allocate accuracy.', 'Weighting all states equally wastes capacity on states the policy rarely visits; policy evaluation typically uses the stationary visitation distribution induced by the fixed policy.', [String.raw`\mu(s)\ge 0,\ \sum_s\mu(s)=1`], [[String.raw`\mu(s)`, 'state weight under the training distribution'], [String.raw`J(\mathbf w)`, 'weighted mean-squared value error']]),
    step('sample-target', 'Substitute an observable one-step TD target for unknown true value', String.raw`U_t=R_{t+1}+\gamma\widehat v(S_{t+1},\mathbf w_t),\qquad\delta_t=U_t-\widehat v(S_t,\mathbf w_t)`, 'True policy value is unavailable, so one transition constructs a provisional supervision target.', 'Unlike a complete return, a bootstrap target depends on the current weights; differentiating through it produces a different residual-gradient method, so TD holds the target fixed during differentiation.', [String.raw`U_t\ \text{is held fixed during differentiation}`], [[String.raw`U_t`, 'one-step bootstrap learning target'], [String.raw`\delta_t`, 'sample temporal-difference error']]),
    step('semi-gradient', 'Update weights along the negative semi-gradient of prediction error', String.raw`\mathbf w_{t+1}=\mathbf w_t+\alpha_t\left(U_t-\widehat v(S_t,\mathbf w_t)\right)\nabla_{\mathbf w}\widehat v(S_t,\mathbf w_t)`, 'TD error sets direction and magnitude while the prediction gradient selects responding weights.', 'Differentiating only the prediction and omitting the target derivative defines semi-gradient TD: it preserves the Bellman fixed-point structure while losing the direct descent guarantee of ordinary supervised learning.', [String.raw`\alpha_t>0`, String.raw`\nabla_{\mathbf w}U_t\ \text{is omitted}`], [[String.raw`\nabla_{\mathbf w}\widehat v(S_t,\mathbf w_t)`, 'parameter sensitivity of the current prediction']]),
    step('linear', 'Expose parameter sharing explicitly with linear features', String.raw`\widehat v(s,\mathbf w)=\boldsymbol\phi(s)^{\top}\mathbf w,\qquad\Delta\mathbf w_t=\alpha_t\delta_t\boldsymbol\phi(S_t)`, 'For a linear predictor the gradient equals the feature vector itself, writing error directly along active features.', 'Evaluating the updated weights at any other state shows that its prediction shift is proportional to the feature inner product, unifying generalization and interference in one formula.', [String.raw`\nabla_{\mathbf w}\widehat v(s,\mathbf w)=\boldsymbol\phi(s)`], [[String.raw`\boldsymbol\phi(s)`, 'state feature vector'], [String.raw`\Delta\mathbf w_t`, 'one-step parameter increment']]),
  ],
  prelude: [
    section('capacity', 'Representation bottleneck', 'Finite parameters determine how states share evidence', [
      'In tabular Sarsa and Q-learning, each of the 25 grid cells holds a private number, so updating one cell leaves all 24 others untouched. That isolation is safe on small grids, but once states are continuous coordinates, sensor vectors, or large combinatorial layouts, independent tables fail twice: memory explodes and most states are never visited during finite interaction, blocking evidence from transferring between similar situations.',
      'Function approximation replaces the table with a parameterized predictor $\\widehat v(s,\\mathbf w)$ whose dimension is far smaller than the state count. Moving from tables to functions is therefore not mere storage compression; it defines a similarity geometry specifying which states move together when one sample arrives.',
    ]),
    section('distribution', 'Error allocation', 'Visitation determines where limited capacity spends accuracy', [
      'When there are fewer parameters than states, no weight vector generally achieves zero error everywhere. An objective must specify which states matter most: frequently visited regions deserve tighter accuracy, while rarely reached corners absorb larger residual error.',
      'The state distribution $\\mu(s)$ inside the weighted squared error formalizes that compromise. The same function class yields a different optimal projection under a different policy or start distribution, so aggregate error must always be interpreted relative to the visitation weights that produced it.',
    ]),
  ],
  sections: [
    section('generalization', 'Generalization', 'Shared features propagate one correction to related states', [
      'After a parameter update, the prediction at an unvisited state s\' changes whenever it shares nonzero features with the sampled state.',
      'That transfer improves sample efficiency only when feature similarity matches true value structure.',
    ], String.raw`\Delta\widehat v(s')=\boldsymbol\phi(s')^{\top}\Delta\mathbf w`),
    section('interference', 'Interference and forgetting', 'Shared parameters create conflicting updates across sharp boundaries', [
      'In the interference scenario above, forbidden s_{13} sits one step from target s_{18}, yet their true values have opposite signs. Wide features give both cells a large inner product: raising s_{18} drags forbidden s_{13} upward, and a subsequent negative sample at s_{13} pulls the freshly learned target value back down.',
      'Generalization and interference are therefore not separate mechanisms; they are two consequences of the same feature inner product on smooth regions versus sharp value boundaries. A falling aggregate error can mask local oscillation and forgetting unless key boundary states are audited across consecutive commits.',
    ]),
    section('forward', 'Toward nonlinear networks', 'Neural networks learn features automatically while amplifying coupling', [
      'Linear approximation makes inner-product sharing transparent, yet high-dimensional pixels, games, or text cannot easily be hand-engineered into fixed basis vectors. Replacing fixed features with a neural network lets the representation adapt from data.',
      'Nonlinear parameters, however, move predictions across nearly the whole state space on every step while maximizing bootstrap targets are computed from that same changing network. The next chapter separates target drift from sequential sample correlation to derive why Deep Q-learning introduces target networks and experience replay.',
    ]),
  ],
  summaryTitle: 'From independent tables to shared parameters',
  summary: [
    'Function approximation replaces private state entries with a low-dimensional shared parameter vector so evidence transfers to unvisited states.',
    'Visitation weights define the error compromise under finite capacity, and semi-gradient TD holds the bootstrap target fixed during differentiation.',
    'In linear approximation, cross-state propagation equals the step size times TD error times the feature inner product, linking generalization and interference.',
    'Extending approximation to control moves both behavior distribution and bootstrap targets, joining off-policy learning in the deadly triad.',
  ],
  explorer: { cue: 'First watch unvisited s_{15} outperform tabular storage under generalization, then switch to interference to play alternating commits at s_{18} and s_{13}, and narrow feature width to isolate them.' },
})

export const dqnChapter = chapter('dqn', [source('dqn', 'Deep Q-learning', 'L8, pp.162–226')], {
  prerequisite: '前置：Q-learning、价值函数近似与半梯度下降', eyebrow: 'Part III · 稳定深度价值学习', title: 'Deep Q-learning',
  intro: '第 10 章已经用共享参数表示价值函数，并在线性特征中说明参数共享为何同时制造泛化与干扰。但在高维状态中无法靠手工设计固定特征，需要把 Q-learning 的表格换成神经网络 $Q_{\\theta}(s,a)$。然而非线性网络、最大化自举与连续轨迹叠加在一起会同时引发两类失稳：在线参数 $\\theta$ 每更新一步就会移动自己的自举监督目标，按时间顺序到达的样本又让相邻梯度高度相关。本章将分别推导冻结目标网络 $\\bar\\theta$ 与经验回放缓冲区 $\\mathcal D$，并在同一条共享网格转移流上通过四组消融实验检验两种机制如何分工稳定训练。',
  bridge: '先让最朴素的神经网络 Q-learning 暴露“预测追逐移动目标”和“连续梯度偏向局部轨迹”两条独立反馈链，再推导目标网络与经验回放分别作用于哪一层，最后把四套时钟放进同一训练循环。',
  experimentIntro: '实验固定共享 5×5 网格产生的一条 40 步转移流，在顶部提供四组经典消融预设（朴素网络、仅目标网络、仅经验回放、完整 DQN），并与朴素基线曲线叠加对比。先预测：只开经验回放不开目标网络时，目标曲线会呈阶梯状还是逐帧移动；再点“自动播放”或“跳到下次同步”，逐帧追踪抽样缓冲区、阶梯冻结曲线、双网络参数与五步更新账本。',
  interpretation: '四组消融在完全相同的环境转移流上直接分开了两类机制的作用：关闭经验回放时，抽样指针始终紧贴缓冲区最右侧的新写入格，样本相关性高且旧经验无法复用；关闭目标冻结（$C=1$）时，目标曲线失去阶梯平台并在每一步随之移动。只有同时启用随机回放与滞后同步，才能既打散相邻样本的时间相关，又在同步周期内为在线网络提供近似静止的回归目标。',
  figure: '交互图 11.1 · DQN 四时钟与稳定性消融实验室', instruction: '切换四组消融预设、单步或跳帧播放，对照在线/目标阶梯曲线与缓冲区抽样', question: '为什么冻结目标网络与经验回放分别控制不同失稳来源，不能互相替代？',
  deepening: dqnDeepeningZh,
  derivation: [
    step('network-q', '用深度神经网络共享表示动作价值', String.raw`q^*(s,a)\approx Q_{\theta}(s,a)`, '单个参数向量同时为所有状态和动作输出价值预测。', '神经网络免去手工构造特征，但也让一次梯度更新同时牵动大量未出现在当前批次中的状态—动作预测。', [String.raw`Q_{\theta}(s,a)\ \text{对}\ \theta\ \text{可微}`], [[String.raw`\theta`, '在线 Q 网络参数']]),
    step('naive-target', '暴露朴素网络 Q-learning 的移动目标', String.raw`Y_t(\theta)=R_{t+1}+\gamma\max_{a'}Q_{\theta}(S_{t+1},a')`, '同一套在线参数同时出现在左侧预测与右侧自举目标中。', '每次更新 $\\theta$ 后，预测刚向旧目标靠近一步，右侧最大值目标本身也会因参数共享立即发生偏移，形成自我追逐的正反馈。', [], [[String.raw`Y_t(\theta)`, '随在线参数即时变化的自举目标']]),
    step('target-network', '引入滞后冻结的目标网络构造静态标签', String.raw`Y_t=R_{t+1}+\gamma(1-D_{t+1})\max_{a'}Q_{\bar\theta}(S_{t+1},a')`, '在相邻两次同步之间保持目标网络参数 $\\bar\\theta$ 冻结不变。', '在线参数 $\\theta$ 连续做梯度下降，而目标参数 $\\bar\\theta$ 保持阶梯式静止，使连续多步优化面对近似固定的监督回归标签；终止掩码 $1-D_{t+1}$ 确保终局不再自举。', [String.raw`\bar\theta\ \text{在同步间隔内固定}`], [[String.raw`\bar\theta`, '冻结的目标网络参数'], [String.raw`D_{t+1}`, '终止标记（终止为 1）']]),
    step('replay-loss', '从经验回放缓冲区均匀抽取小批量计算损失', String.raw`L(\theta)=\frac1B\sum_{i=1}^{B}\left(Y_i-Q_{\theta}(S_i,A_i)\right)^2,\qquad e_i\sim\operatorname{Uniform}(\mathcal D)`, '先把转移写入缓冲区，再打乱时间顺序抽取小批量做梯度更新。', '随机抽取打破连续轨迹的时间相关性，同时让每条宝贵转移被复用多次；代价是缓冲区混合了历史行为策略，训练进入策略外分布。', [String.raw`e_i=(S_i,A_i,R_{i+1},S_{i+1},D_{i+1})\in\mathcal D`], [[String.raw`\mathcal D`, '经验回放缓冲区'], [String.raw`B`, '小批量样本数']]),
    step('sync', '按固定间隔同步两套网络参数', String.raw`\bar\theta\leftarrow\theta\quad\text{every }C\text{ updates}`, '每完成 $C$ 次在线梯度更新，将当前在线参数复制给目标网络。', '同步周期 $C$ 决定稳定性与响应速度的权衡：$C=1$ 退回移动目标，$C$ 过小易震荡，$C$ 过大则监督信号长期陈旧。', [String.raw`C\in\mathbb N^+`], [[String.raw`C`, '目标网络同步周期']]),
  ],
  prelude: [
    section('coupling', '非线性耦合', '共享参数让原本独立的动作价值表项互相牵动', [
      '在表格 Q-learning 中，更新状态 $s_{23}$ 的向上动作不会改变其余 124 个状态—动作对；换成神经网络 $Q_{\\theta}(s,a)$ 后，底层的卷积或全连接权重被所有状态共同使用，一次梯度步会同时移动整张网格上的预测。',
      '这种全局耦合让网络能够从高维观测中自动泛化，但也放大了自举误差的传播范围：只要某个后继状态的最大动作价值被高估，误差就不再停留在单格表项，而是顺着共享权重迅速扩散。因此，深度价值学习不能简单理解成“把表格换成网络”。',
    ]),
    section('two-instabilities', '两类失稳来源', '目标漂移与轨迹样本相关需要分别处理', [
      '在线网络同时负责预测与出题会让监督信号随参数实时漂移，而连续交互产生的相邻转移彼此高度相关。',
      '目标网络放慢第一条回路，经验回放打散并复用第二类证据，两者作用于不同环节。',
    ]),
  ],
  sections: [
    section('target-role', '目标网络', '滞后参数为自举提供短期稳定参照', [
      '目标网络不是第二个独立目标函数，而是在线网络的周期性快照。',
      '它把快速自激回路放慢成阶梯式更新，但同步间隔过大会带来标签滞后。',
    ], String.raw`\theta\ \text{trains continuously},\qquad\bar\theta\ \text{updates discretely}`),
    section('replay-role', '经验回放', '经验回放把连续轨迹变成可重排的训练集合', [
      '随机抽样降低相邻梯度的方向相关性，并提高每条转移的利用次数。',
      '代价是缓冲区混合了历史策略，容量与新鲜度直接影响偏差。',
    ]),
    section('limits', '能力边界', '稳定深度价值更新仍不等于获得收敛保证，也受限于离散最大化', [
      '冻结目标网络与经验回放显著缓和了目标漂移和样本时间相关，却并没有取消函数近似、自举与策略外数据三者并存的结构风险。例如，目标中的 $\\max_{a\'} Q_{\\bar\\theta}(S\',a\')$ 仍会系统性挑选带正向噪声的动作，诱发最大化高估；Double DQN 因而把动作选择与价值评估拆开，优先经验回放则改变抽样权重以提高样本效率。',
      '更根本的限制在于动作接口本身：DQN 必须先估计所有候选动作的价值，再通过 $\\arg\\max_a Q_{\\theta}(s,a)$ 间接导出确定性策略。一旦任务需要连续动作、高维输出或本质上随机的最优策略，先学价值再取最大值就会变得笨重甚至不可行；下一章因此转向直接参数化并优化动作概率的策略梯度方法。',
    ]),
  ],
  summaryTitle: '从 Q-learning 到稳定的深度价值更新',
  summary: [
    '把神经网络引入 Q-learning 后，共享参数同时放大了自举目标漂移与连续轨迹样本相关两类失稳。',
    '冻结目标网络 $\\bar\\theta$ 按周期 $C$ 同步，把实时追逐变成阶梯式近似静止的回归监督。',
    '经验回放缓冲区 $\\mathcal D$ 打破相邻样本的时间相关并复用历史转移，同时引入数据陈旧度与策略外分布权衡。',
    '完整 DQN 协调行动采样、入库、在线梯度更新与目标同步四套时钟；但离散最大化接口仍限制它走向连续与随机策略。',
  ],
  explorer: { cue: '依次点击四组消融预设并播放：对照顶部阶梯目标线与朴素虚线的偏离，同时核对缓冲区里的抽样位置和复用次数。' },
}, {
  prerequisite: 'Prerequisites: Q-learning, value function approximation, and semi-gradient descent', eyebrow: 'Part III · Stable deep value learning', title: 'Deep Q-learning',
  intro: 'Chapter 10 showed how shared parameters approximate values and why linear inner products couple generalization with interference. High-dimensional observations, however, make hand-crafted features impractical and call for a neural network $Q_{\\theta}(s,a)$. Combining nonlinear weights, maximizing bootstrapping, and sequential trajectories triggers two distinct instabilities: updating $\\theta$ immediately shifts its own bootstrap target, while consecutive transitions yield correlated gradients. This chapter derives frozen target networks $\\bar\\theta$ and experience replay $\\mathcal D$, then runs a four-configuration ablation on one shared grid transition stream to show why each mechanism fixes a different failure.',
  bridge: 'Expose moving bootstrap targets and temporally correlated trajectory samples in naive neural Q-learning first, then derive how target networks and replay stabilize separate clocks inside one training loop.',
  experimentIntro: 'The lab fixes one 40-step transition stream from the shared 5×5 grid and provides four ablation presets (Naive, Target Only, Replay Only, Full DQN) overlaid against the naive baseline curve. Predict whether enabling replay without a target network creates a staircase target or a moving one, then step through playback or jump to the next sync tick to inspect the buffer, dual-network curves, and five-stage update ledger.',
  interpretation: 'Running all four ablations on the exact same transition stream separates both mechanisms cleanly. Without replay, sampling stays pinned to the newest buffer slot, keeping temporal correlation high and reuse at one. Without target freezing ($C=1$), the target curve loses its flat plateaus and shifts on every gradient step. Only combining shuffled replay with lagged target synchronization breaks sequential correlation while holding supervision steady between sync ticks.',
  figure: 'Interactive Figure 11.1 · DQN Four-Clock & Stability Ablation Lab', instruction: 'Switch the four ablation presets, step or jump to sync ticks, and inspect curves alongside replay draws', question: 'Why do target networks and experience replay control separate instability sources and fail to replace each other?',
  deepening: dqnDeepeningEn,
  derivation: [
    step('network-q', 'Represent action values with a shared neural network', String.raw`q^*(s,a)\approx Q_{\theta}(s,a)`, 'One parameter vector predicts action values across every state-action pair.', 'Neural weights remove manual feature design, but one gradient step moves predictions across states absent from the minibatch.', [String.raw`Q_{\theta}(s,a)\ \text{is differentiable in}\ \theta`], [[String.raw`\theta`, 'online Q-network parameters']]),
    step('naive-target', 'Expose the moving bootstrap target of naive neural Q-learning', String.raw`Y_t(\theta)=R_{t+1}+\gamma\max_{a'}Q_{\theta}(S_{t+1},a')`, 'The same online weights appear in both the prediction and the maximizing target.', 'Every step on $\\theta$ shifts both the predictor and the supervision label, creating a self-chasing feedback loop.', [], [[String.raw`Y_t(\theta)`, 'online-dependent moving target']]),
    step('target-network', 'Freeze a lagged target network to stabilize labels', String.raw`Y_t=R_{t+1}+\gamma(1-D_{t+1})\max_{a'}Q_{\bar\theta}(S_{t+1},a')`, 'Hold target parameters $\\bar\\theta$ fixed between synchronization events.', 'Online $\\theta$ updates every step while $\\bar\\theta$ moves in discrete steps, giving the optimizer approximately stationary targets; the mask $1-D_{t+1}$ zeros terminal bootstrapping.', [String.raw`\bar\theta\ \text{stays frozen between sync ticks}`], [[String.raw`\bar\theta`, 'frozen target-network parameters'], [String.raw`D_{t+1}`, 'terminal indicator (1 at termination)']]),
    step('replay-loss', 'Sample shuffled minibatches from an experience replay buffer', String.raw`L(\theta)=\frac1B\sum_{i=1}^{B}\left(Y_i-Q_{\theta}(S_i,A_i)\right)^2,\qquad e_i\sim\operatorname{Uniform}(\mathcal D)`, 'Store transitions first and sample uniformly across past experience.', 'Shuffling breaks temporal correlation among adjacent gradients and reuses scarce transitions, while introducing an off-policy mixture of older behavior.', [String.raw`e_i=(S_i,A_i,R_{i+1},S_{i+1},D_{i+1})\in\mathcal D`], [[String.raw`\mathcal D`, 'experience replay buffer'], [String.raw`B`, 'minibatch size']]),
    step('sync', 'Synchronize target parameters periodically every C updates', String.raw`\bar\theta\leftarrow\theta\quad\text{every }C\text{ updates}`, 'Copy online weights into the target network after every $C$ gradient steps.', 'Period $C$ trades label stability against freshness: $C=1$ reverts to moving targets, too small oscillates, and too large leaves stale targets.', [String.raw`C\in\mathbb N^+`], [[String.raw`C`, 'target synchronization period']]),
  ],
  prelude: [
    section('coupling', 'Nonlinear coupling', 'Shared parameters turn independent Q entries into coupled predictions', [
      'A tabular Q-learning update at $s_{23}$ leaves all other 124 state-action entries untouched. With a neural network $Q_{\\theta}(s,a)$, hidden weights are shared across states, so every gradient step shifts predictions across the whole grid.',
      'That global coupling enables representation learning from rich observations, yet spreads bootstrap error far beyond the sampled transition. Overestimating one successor maximum propagates through shared weights, which is why deep value learning is far more delicate than swapping a table for a network.',
    ]),
    section('two-instabilities', 'Two sources', 'Target drift and data correlation require separate mechanisms', [
      'One online network predicting and supervising itself creates moving targets, while sequential interaction yields strongly correlated batches.',
      'Target freezing slows label motion and replay breaks sequential correlation; each acts on a distinct mechanism.',
    ]),
  ],
  sections: [
    section('target-role', 'Target network', 'Lagged parameters provide a temporarily stable bootstrap reference', [
      'The target network is a periodic snapshot of the online network rather than an independent objective.',
      'It turns rapid self-feedback into discrete jumps, trading stability against target staleness.',
    ], String.raw`\theta\ \text{trains continuously},\qquad\bar\theta\ \text{updates discretely}`),
    section('replay-role', 'Experience replay', 'Replay turns a trajectory into a resampleable training collection', [
      'Random sampling lowers adjacent-gradient correlation and reuses each transition multiple times.',
      'The buffer mixes past behavior policies, making capacity and freshness direct bias controls.',
    ]),
    section('limits', 'Boundary', 'Stabilizing deep Q updates neither guarantees convergence nor handles continuous policies', [
      'Target networks and replay moderate target drift and sample correlation, yet function approximation, bootstrapping, and off-policy data still coexist. Taking $\\max_{a\'} Q_{\\bar\\theta}(S\',a\')$ continues to favor positively noisy estimates, motivating Double DQN to decouple selection from evaluation and prioritized replay to reweight informative errors.',
      'A deeper boundary sits in the action interface itself: DQN learns values for every action and recovers a deterministic policy via $\\arg\\max_a Q_{\\theta}(s,a)$. When tasks demand continuous actions, large output spaces, or inherently stochastic optimal policies, indirect maximization breaks down—motivating direct policy-gradient optimization in the next chapter.',
    ]),
  ],
  summaryTitle: 'From Q-learning to stabilized deep value updates',
  summary: [
    'Neural Q-learning couples predictions globally, amplifying both moving bootstrap targets and correlated trajectory gradients.',
    'A frozen target network $\\bar\\theta$ synced every $C$ steps turns continuous self-chasing into staircase regression targets.',
    'Experience replay $\\mathcal D$ decorrelates minibatches and reuses transitions while introducing an off-policy freshness tradeoff.',
    'Complete DQN coordinates action, storage, online update, and target-sync clocks, yet discrete maximization still limits policy form.',
  ],
  explorer: { cue: 'Cycle through the four ablation presets while playing: compare the staircase target curve against the naive dashed baseline and track buffer draw timestamps and reuse counts.' },
})

export const policyGradientChapter = chapter('policygradient', [source('pg', 'Policy Gradient Methods', 'L9, pp.6–41')], {
  prerequisite: '前置：参数化函数、概率分布与梯度上升', eyebrow: 'Part III · 直接优化策略', title: '策略梯度方法',
  intro: '第 11 章的 Deep Q-learning 通过目标网络与经验回放稳定了深度动作价值学习，但仍有一个结构限制未曾改变：策略只能通过 $\\arg\\max_a Q_{\\theta}(s,a)$ 从动作价值间接得到。只要动作空间连续、维度很高，或者最优行为本身需要按概率随机混合，先拟合全部动作价值再取最大值就会遇到表示与求解障碍。本章尚未解决的问题是：能否直接用参数 $\\theta$ 表示动作概率 $\\pi_{\\theta}(a\\mid s)$，并只凭当前策略采到的轨迹估计长期表现的梯度？下面定义标量策略目标、推导策略梯度定理与 REINFORCE 更新，并在交互实验中检验状态基线怎样在不改变期望方向的前提下压低多回合梯度方差。',
  bridge: '要让“提高好动作概率、压低差动作概率”成为可计算的算法，必须先写出标量策略目标，再用策略梯度定理把难以直接求导的状态访问分布吸收进采样期望，最终得到带状态基线的 REINFORCE 更新。',
  experimentIntro: '实验把一次轨迹拆成四个独立决策点（$s_1 \\to s_2 \\to s_7 \\to s_8$），同步展示三动作 softmax 概率守恒、对数概率敏感度 $1-\\pi$、12 回合“有基线 vs 无基线”同流演化曲线，以及固定状态的多轨迹梯度方差账本。先预测：当所有动作回报都为正、仅好坏程度不同时，关闭基线（$b=0$）与开启状态基线对最优动作概率的爬升轨迹会产生什么差异？',
  interpretation: '两块对照直接解释了策略梯度最容易误解的两个机制：其一，softmax 的共同分母保证每次更新都在三个动作间守恒地重分配概率质量，且低概率动作因敏感度 $1-\\pi$ 更大而移动更剧烈；其二，关闭基线时，哪怕较差动作只要回报大于零也会被错误抬高概率，使 12 回合演化剧烈震荡；减去状态基线 $b$ 并不改变梯度期望，却让低于通常水平的动作立即转为负权重，从而大幅降低方差并加速最优动作胜出。',
  figure: '交互图 12.1 · 策略梯度概率演化与基线方差实验室', instruction: '播放 12 回合有/无基线同流演化，点击决策点核对三动作重分配与多轨迹方差', question: '状态基线为什么不改变梯度期望，却能显著平滑多回合策略演化？',
  deepening: policyGradientDeepeningZh,
  derivation: [
    step('objective', '先定义衡量策略长期表现的标量目标', String.raw`J(\theta)=\mathbb E_{S\sim\eta_\theta}\left[v^{\pi_\theta}(S)\right]`, '参数 $\\theta$ 既直接决定动作分布，也通过长期交互改变状态访问分布。', '目标可以写成起始分布下的期望折扣回报，也可以写成持续型任务下的稳态平均奖励；两者状态权重不同，但都将策略搜索转化为标量最大化。', [], [[String.raw`\eta_\theta`, '策略诱导的状态访问权重']]),
    step('theorem', '用策略梯度定理消去状态访问分布导数', String.raw`\nabla_\theta J(\theta)=\sum_s\eta_\theta(s)\sum_a\nabla_\theta\pi_\theta(a\mid s)q^{\pi_\theta}(s,a)`, '目标梯度可以写成状态—动作空间上的加权和，不再显式出现 $\\nabla_{\\theta}\\eta_{\\theta}$。', '状态分布确实依赖 $\\theta$；策略梯度定理利用 Markov 转移与 Bellman 展开，把分布变化对未来的累积影响完整吸收进了动作价值 $q^{\\pi_{\\theta}}$ 与访问权重 $\\eta_{\\theta}$。', [String.raw`\pi_\theta(a\mid s)\ \text{对}\ \theta\ \text{可微}`], [[String.raw`q^{\pi_\theta}`, '当前策略下的动作价值']]),
    step('log-trick', '利用对数求导恒等式把求和写成策略期望', String.raw`\nabla_\theta\pi_\theta(a\mid s)=\pi_\theta(a\mid s)\nabla_\theta\log\pi_\theta(a\mid s)`, '拆出的概率因子 $\\pi_{\\theta}(a\\mid s)$ 恰好充当采样权重，对数导数成为可计算的得分函数。', '代入定理后，原本需要对全部动作穷举的求和自动变成关于当前策略动作的期望，从而只靠轨迹样本即可构造无偏梯度估计。', [String.raw`\pi_\theta(a\mid s)>0`], [[String.raw`\nabla_\theta\log\pi_\theta`, '得分函数（score function）']]),
    step('sample-gradient', '用整条轨迹的未来回报构造单样本估计', String.raw`\widehat g_t=\nabla_\theta\log\pi_\theta(A_t\mid S_t)G_t`, '用从时刻 $t$ 向后的真实折扣回报 $G_t$ 替代未知的 $q^{\\pi_{\\theta}}(S_t,A_t)$。', '这就是经典的 REINFORCE 估计：只要轨迹由当前策略采样，其条件期望等于真实策略梯度；但因为一整段未来随机性都乘在当前动作上，单条轨迹方差通常很高。', ['轨迹由当前策略在线采样'], [[String.raw`\widehat g_t`, '单时间步的策略梯度样本']]),
    step('baseline', '减去不依赖当前动作的状态基线以降低方差', String.raw`\widehat g_t=\nabla_\theta\log\pi_\theta(A_t\mid S_t)\left(G_t-b(S_t)\right)`, '只强化回报高于该状态通常水平 $b(S_t)$ 的动作，抑制低于基线的动作。', '由于得分函数在当前策略下的动作期望恒为零，任何与 $A_t$ 无关的基线项在期望中精确抵消，保持无偏的同时大幅压缩梯度波动。', [String.raw`b(S_t)\ \text{不依赖当前动作}\ A_t`], [[String.raw`b(S_t)`, '与动作无关的状态基线']]),
  ],
  prelude: [
    section('value-policy', '表示范式转换', '策略从取最大值的间接规则变成可微概率模型', [
      '前十一章的价值型方法先学习状态或动作价值，再通过 $\\arg\\max_a Q(s,a)$ 导出动作。这种离散取最大操作无法直接对策略求导，面对连续动作空间时还必须额外求解全局最大化，也难以表达在博弈或部分可观测环境下真正最优的随机策略。',
      '策略梯度直接用参数 $\\theta$ 构造动作概率分布 $\\pi_{\\theta}(a\\mid s)$，并沿标量目标 $J(\\theta)$ 的上升方向更新参数。在离散动作中，softmax 参数化天然保证所有概率非负且和为一，允许梯度连续平滑地在候选动作之间移动概率质量。',
    ]),
    section('credit', '样本贡献', '敏感度决定怎样改，长期结果决定改多少', [
      '对数概率梯度描述参数如何改变已采样动作的概率，回报或优势则提供更新的正负与强度。',
      '两者相乘后，单条轨迹才成为策略目标梯度的随机估计。',
    ]),
  ],
  sections: [
    section('softmax', 'Softmax 参数化与概率守恒', '提高一个动作的概率必然挤压其余动作', [
      '在 softmax 策略中，提高某个动作的偏好分数（logit）$h_{\\theta}(s,a)$ 会增加它的概率，同时通过共享归一化分母等比例压低其余动作的概率；每次更新本质上都是在概率单纯形内重新分配总和为 1 的质量。',
      '对被选动作求导还能直接看到 $\\partial\\log\\pi_{\\theta}(a\\mid s)/\\partial h_{\\theta}(s,a) = 1 - \\pi_{\\theta}(a\\mid s)$：当一个动作尚未成为主选（概率较低）时，相同正回报会引发大幅提升；当它已接近必选时，敏感度趋近于零，避免概率越界。',
    ], String.raw`\pi_\theta(a\mid s)=\frac{e^{h_\theta(s,a)}}{\sum_b e^{h_\theta(s,b)}}`),
    section('variance', '方差瓶颈与基线极限', '完整回报把后续全部随机性带回每一个早期动作', [
      '实验中即便减去了常数状态基线 $b$，REINFORCE 依然面对两个结构短板：第一，必须等整条回合走完才能反向算出完整回报 $G_t$，无法在交互中途及时更新；第二，某一步之后的所有探索与环境噪声都会原样乘回到该步的梯度估计中。',
      '增加批量轨迹数可以平均掉一部分噪声，但采样开销成倍上升；如果把基线做成随状态变化的可学习价值函数，甚至进一步用一步时间差分误差替代完整回报，就能把延迟与方差一起压低。',
    ]),
    section('forward', '走向 Actor–Critic', '把状态基线学出来，才能在每次转移后立即更新策略', [
      'REINFORCE 验证了直接优化动作概率的可行性，却因为依赖完整回合回报而在长轨迹与持续型任务上步履缓慢。',
      '下一章引入一个可学习的价值评价器（Critic）估计状态价值 $V_{\\phi}(s)$：它既充当随状态自适应的基线，又通过单步时间差分误差 $\\delta_t$ 近似动作优势，让策略在每次环境转移后立即获得低方差更新信号。',
    ]),
  ],
  summaryTitle: '从价值比较到直接优化策略',
  summary: [
    '策略梯度直接参数化动作概率 $\\pi_{\\theta}(a\\mid s)$，避开离散最大化接口，支持随机策略与连续动作。',
    '策略梯度定理将复杂的状态访问分布导数吸收进动作价值与访问权重，配合对数求导得到可采样估计。',
    'REINFORCE 用完整回合未来回报 $G_t$ 加权得分函数，无偏但存在回合延迟与高方差。',
    '减去与动作无关的状态基线 $b(S_t)$ 严格保持梯度期望不变，同时显著降低方差并平滑多回合策略演化。',
  ],
  explorer: { cue: '先观察 12 回合曲线上“有基线”与“无基线”的爬升差异，再拖动基线滑块核对下方多轨迹梯度方差何时降到最低。' },
}, {
  prerequisite: 'Prerequisites: parameterized functions, probability distributions, and gradient ascent', eyebrow: 'Part III · Optimize policy directly', title: 'Policy Gradient Methods',
  intro: 'Chapter 11 stabilized deep action-value learning with target networks and replay, yet kept one structural constraint: policies emerge only indirectly through $\\arg\\max_a Q_{\\theta}(s,a)$. In continuous action spaces, high-dimensional outputs, or tasks whose optimal behavior is stochastic, indirect maximization becomes awkward or infeasible. The unresolved problem is how to parameterize action probabilities $\\pi_{\\theta}(a\\mid s)$ directly and estimate the gradient of long-run performance from trajectories alone. This chapter derives the policy-gradient theorem and REINFORCE with baseline, then tests interactively how a state baseline lowers variance and smooths multi-episode policy evolution without biasing the expected gradient.',
  bridge: 'Turning “raise good actions, lower poor ones” into an algorithm requires a scalar objective, the policy-gradient theorem to absorb state-occupancy derivatives into a sampleable expectation, and a variance-reducing state baseline.',
  experimentIntro: 'The lab breaks one trajectory into four independent decision states ($s_1 \\to s_2 \\to s_7 \\to s_8$), pairing three-action softmax redistribution and score sensitivity $1-\\pi$ with a 12-episode counterfactual comparing REINFORCE with and without baseline on the exact same episode stream, plus a fixed-state multi-rollout variance ledger. Predict how setting $b=0$ versus a positive state baseline changes the climb of the optimal action when every return is positive.',
  interpretation: 'Two controlled comparisons expose the core mechanics of policy gradients. First, softmax normalization conserves total probability across all three actions while giving lower-probability actions larger log-probability sensitivity $1-\\pi$. Second, without a baseline, even suboptimal positive-return actions get reinforced and jitter the 12-episode trajectory; subtracting a state baseline $b$ preserves the expected gradient while turning below-average returns negative, cutting variance sharply.',
  figure: 'Interactive Figure 12.1 · Policy Gradient Evolution & Baseline Variance Lab', instruction: 'Play the 12-episode baseline counterfactual, click trajectory steps for softmax redistribution, and audit rollout variance', question: 'Why does a state baseline preserve the expected gradient while smoothing multi-episode policy evolution?',
  deepening: policyGradientDeepeningEn,
  derivation: [
    step('objective', 'Define a scalar objective for long-run policy performance', String.raw`J(\theta)=\mathbb E_{S\sim\eta_\theta}\left[v^{\pi_\theta}(S)\right]`, 'Parameters $\\theta$ affect both immediate action probabilities and long-run state visitation.', 'The objective can be written as expected discounted return from a start distribution or stationary average reward; both convert policy search into scalar maximization.', [], [[String.raw`\eta_\theta`, 'policy-induced state visitation weights']]),
    step('theorem', 'Apply the policy-gradient theorem to eliminate occupancy derivatives', String.raw`\nabla_\theta J(\theta)=\sum_s\eta_\theta(s)\sum_a\nabla_\theta\pi_\theta(a\mid s)q^{\pi_\theta}(s,a)`, 'The gradient becomes a state-action sum with no explicit $\\nabla_{\\theta}\\eta_{\\theta}$ term.', 'State occupancy still depends on $\\theta$; the theorem uses Markov transitions and Bellman unrolling to fold future visitation effects into $q^{\\pi_{\\theta}}$ and $\\eta_{\\theta}$.', [String.raw`\pi_\theta(a\mid s)\ \text{is differentiable in}\ \theta`], [[String.raw`q^{\pi_\theta}`, 'current-policy action value']]),
    step('log-trick', 'Rewrite probability derivatives using the log-derivative identity', String.raw`\nabla_\theta\pi_\theta(a\mid s)=\pi_\theta(a\mid s)\nabla_\theta\log\pi_\theta(a\mid s)`, 'Factoring out $\\pi_{\\theta}(a\\mid s)$ supplies sampling weights while the log-gradient becomes the computable score.', 'Substituting this identity turns the explicit sum over actions into an expectation that on-policy trajectories can estimate without a model.', [String.raw`\pi_\theta(a\mid s)>0`], [[String.raw`\nabla_\theta\log\pi_\theta`, 'score function']]),
    step('sample-gradient', 'Estimate the gradient from one trajectory return', String.raw`\widehat g_t=\nabla_\theta\log\pi_\theta(A_t\mid S_t)G_t`, 'Observed reward-to-go $G_t$ replaces unknown $q^{\\pi_{\\theta}}(S_t,A_t)$.', 'This yields episodic REINFORCE: unbiased under on-policy sampling, yet often high variance because all future randomness multiplies every earlier action.', ['trajectory is sampled from the current policy'], [[String.raw`\widehat g_t`, 'single-step sample policy gradient']]),
    step('baseline', 'Subtract an action-independent state baseline to reduce variance', String.raw`\widehat g_t=\nabla_\theta\log\pi_\theta(A_t\mid S_t)\left(G_t-b(S_t)\right)`, 'Reinforce actions only when their outcome exceeds the state baseline $b(S_t)$.', 'Because the expected score over actions is identically zero, any baseline independent of $A_t$ cancels in expectation while sharply lowering gradient variance.', [String.raw`b(S_t)\ \text{does not depend on}\ A_t`], [[String.raw`b(S_t)`, 'action-independent state baseline']]),
  ],
  prelude: [
    section('value-policy', 'Representation shift', 'Policy becomes a differentiable probability model instead of an argmax rule', [
      'Value-based methods in Chapters 1–11 estimate values first and recover behavior via $\\arg\\max_a Q(s,a)$. That discrete maximization is not differentiable, becomes expensive in continuous action spaces, and cannot naturally represent genuinely stochastic optimal policies.',
      'Policy gradients parameterize $\\pi_{\\theta}(a\\mid s)$ directly and ascend a scalar objective $J(\\theta)$. For discrete actions, softmax keeps probabilities nonnegative and normalized while allowing gradients to shift probability mass continuously.',
    ]),
    section('credit', 'Sample contribution', 'The score sets direction and the long-term outcome sets weight', [
      'Log-probability gradients determine how parameters move sampled probabilities while return or advantage sets sign and scale.',
      'Multiplying the two turns one trajectory into a stochastic gradient estimate.',
    ]),
  ],
  sections: [
    section('softmax', 'Softmax parameterization and probability conservation', 'Raising one action probability necessarily compresses the alternatives', [
      'Raising one action’s logit $h_{\\theta}(s,a)$ increases its probability while the shared denominator lowers competing actions proportionally, conserving total probability mass equal to 1.',
      'Differentiating shows $\\partial\\log\\pi_{\\theta}(a\\mid s)/\\partial h_{\\theta}(s,a) = 1 - \\pi_{\\theta}(a\\mid s)$: rare actions move strongly under positive advantage while near-certain actions saturate smoothly.',
    ], String.raw`\pi_\theta(a\mid s)=\frac{e^{h_\theta(s,a)}}{\sum_b e^{h_\theta(s,b)}}`),
    section('variance', 'Variance limits of complete returns', 'Full returns carry every future source of randomness back to early actions', [
      'Even with a constant baseline $b$, episodic REINFORCE retains two limits: updates wait until termination to compute $G_t$, and all downstream exploration and environment noise scale every earlier score.',
      'Larger batches average noise at higher rollout cost; learning a state-dependent value function—and replacing full returns with one-step TD errors—addresses both delay and variance together.',
    ]),
    section('forward', 'Toward Actor–Critic', 'Learning a state-value critic enables updates after every transition', [
      'REINFORCE proves that direct policy optimization works without a value table, yet complete-return delay slows learning on long or continuing tasks.',
      'The next chapter pairs the actor with a learned state-value critic $V_{\\phi}(s)$: its one-step TD error $\\delta_t$ acts as a timely, lower-variance advantage estimate available after every transition.',
    ]),
  ],
  summaryTitle: 'From value comparison to direct policy optimization',
  summary: [
    'Policy gradients parameterize $\\pi_{\\theta}(a\\mid s)$ directly, removing indirect argmax and supporting stochastic or continuous control.',
    'The policy-gradient theorem folds state-occupancy derivatives into action values, and the log-derivative identity enables sample estimation.',
    'REINFORCE weights scores by reward-to-go $G_t$, giving unbiased gradients at the cost of end-of-episode delay and high variance.',
    'An action-independent state baseline $b(S_t)$ preserves expectation while reducing variance and smoothing multi-episode learning.',
  ],
  explorer: { cue: 'Compare the with-baseline and without-baseline curves across 12 episodes first, then drag the baseline slider to minimize the multi-rollout variance below.' },
})

export const actorCriticChapter = chapter('actorcritic', [source('ac', 'Actor-Critic Methods', 'L10, pp.6–43')], {
  prerequisite: '前置：策略梯度、状态价值与时序差分误差', eyebrow: 'Part III · 策略与价值协作', title: 'Actor–Critic 方法',
  intro: '第 12 章的 REINFORCE 已经能够直接优化参数化策略，但必须等整条回合结束后才能算出完整回报 $G_t$，而且后段轨迹的全部随机性都会拉高早期动作的梯度方差。本章尚未解决的问题是：怎样在保留策略梯度方向的同时，把延迟的完整回报换成每一步都能获得的低方差相对反馈？下面将职责拆给参数化策略（Actor）与状态价值评价器（Critic），推导单步时序差分误差 $\\delta_t$ 为何近似动作优势并同时驱动两组独立梯度，再通过多步双时间尺度实验检验 Critic 与 Actor 步长失配或大重要性比率会如何破坏闭环稳定。',
  bridge: '最直接的动作价值加权仍会把同一状态下的共同回报波动传给策略。减去只依赖状态的基线后权重变成优势；再用一步时序差分误差近似它，就形成每次环境转移都能运行的双更新闭环。',
  experimentIntro: '实验把一次网格转移扩展为 16 步连续 Actor–Critic 闭环，并提供三组双时间尺度预设（协调步长、Critic 过慢滞后、策略外大比率 $\\rho=1.75$）与独立学习率滑块 $\\alpha_v$、$\\alpha_\\pi$。先预测：若把 Critic 步长调得很小而 Actor 步长很大，Critic 滞后的参照值会怎样误导 Actor 的动作概率？点击播放观察上方双轨迹曲线与下方单步双路径显微镜的联动。',
  interpretation: '双轨迹曲线与单步双路径账本共同说明了协同训练的两个不变量：第一，Critic 与 Actor 共享同一个标量误差 $\\delta_t$，但梯度路径完全独立——Critic 对状态价值 $V_{\\phi}$ 求导，Actor 对动作对数概率 $\\log\\pi_{\\theta}$ 求导并停止误差反传；第二，当 Critic 明显慢于 Actor 时，过低的 $V_{\\phi}$ 会令平庸动作持续获得正向 $\\delta_t$，误把策略推向错误方向；而策略外大比率 $\\rho$ 会成倍放大 Actor 步幅并引发震荡，这正是下一章 PPO 必须约束策略移动的直接动因。',
  figure: '交互图 13.1 · Actor–Critic 双时间尺度与单步显微镜实验室', instruction: '切换三组时间尺度预设并播放 16 步闭环，同步核对双曲线与双梯度账本', question: '同一个时序差分误差怎样分别驱动两组参数，为何两者步长失配会破坏收敛？',
  deepening: actorCriticDeepeningZh,
  derivation: [
    step('q-gradient', '从动作价值加权的策略梯度出发', String.raw`\nabla_\theta J(\theta)=\mathbb E\left[\nabla_\theta\log\pi_\theta(A_t\mid S_t)q^{\pi}(S_t,A_t)\right]`, 'Actor 的更新方向由得分函数与动作价值共同决定。', '直接用一个 Critic 网络学习动作价值可得到 Q Actor–Critic，但同一状态下各动作共享的回报基准仍会带来不必要方差。', [], [[String.raw`\theta`, 'Actor 策略参数']]),
    step('baseline-invariance', '证明不依赖当前动作的状态基线不改变期望', String.raw`\mathbb E_{A\sim\pi_\theta}\left[\nabla_\theta\log\pi_\theta(A\mid s)b(s)\right]=0`, '得分函数在动作期望下为零，因此纯状态基线项精确抵消。', '选定 $b(s)=v^{\\pi}(s)$ 可以消除状态层面的共同回报偏移，而不引入策略梯度偏差。', [String.raw`b(s)\ \text{与当前动作}\ A\ \text{无关}`], [[String.raw`b(s)`, '方差缩减状态基线']]),
    step('advantage', '把动作权重改写为相对状态均值的优势函数', String.raw`A^{\pi}(s,a)=q^{\pi}(s,a)-v^{\pi}(s)`, '优势函数衡量“选动作 $a$ 比该状态通常水平好多少”。', '改写后 Actor 只需学习单个状态价值函数即可形成参照，不必同时拟合全部动作价值再手动相减。', [], [[String.raw`A^{\pi}(s,a)`, '动作相对状态平均水平的优势']]),
    step('td-advantage', '用单步时序差分误差近似动作优势', String.raw`\delta_t=R_{t+1}+\gamma V_\phi(S_{t+1})-V_\phi(S_t)\approx A^{\pi}(S_t,A_t)`, '每完成一次环境转移立即得到低方差的相对反馈权重。', '当 Critic 准确逼近 $v^{\\pi}$ 时，$\\delta_t$ 给定 $(S_t,A_t)$ 的条件期望恰好等于 $A^{\\pi}(S_t,A_t)$；若 Critic 尚有误差，则以可学习的自举偏差换取显著方差下降。', [String.raw`V_\phi\ \text{逼近当前策略的状态价值}`], [[String.raw`\phi`, 'Critic 价值参数'], [String.raw`\delta_t`, '一步时序差分误差']]),
    step('two-updates', '让同一误差分别驱动 Critic 与 Actor 两条独立梯度', String.raw`\phi\leftarrow\phi+\alpha_v\delta_t\nabla_\phi V_\phi(S_t),\qquad\theta\leftarrow\theta+\alpha_\pi\operatorname{stopgrad}(\delta_t)\nabla_\theta\log\pi_\theta(A_t\mid S_t)`, 'Critic 沿价值梯度缩小预测误差，Actor 把 $\\delta_t$ 当作常数权重移动动作概率。', '两组参数在每次转移后交替演化：Actor 改变行为与访问分布，Critic 紧随其后重新追踪新策略的价值，因此步长 $\\alpha_v$ 与 $\\alpha_\\pi$ 必须保持相容的时间尺度。', [String.raw`\alpha_v>0,\ \alpha_\pi>0`], [[String.raw`\alpha_v`, 'Critic 学习率'], [String.raw`\alpha_\pi`, 'Actor 学习率']]),
    step('importance', '用重要性比率把行为策略数据折算到目标策略', String.raw`\rho_t=\frac{\pi_\theta(A_t\mid S_t)}{b(A_t\mid S_t)},\qquad\Delta\theta\propto\rho_t\delta_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)`, '当采样行为策略 $b$ 不同于当前目标策略 $\\pi_{\\theta}$ 时，比率 $\\rho_t$ 校正样本权重。', '然而一旦新旧策略拉得太开，大比率 $\\rho_t$ 会剧烈放大方差并把策略一步推过头——这直接引出下一章 PPO 对概率比的近端裁剪。', [String.raw`b(A_t\mid S_t)>0\ \text{whenever }\pi_\theta(A_t\mid S_t)>0`], [[String.raw`\rho_t`, '动作概率的重要性比率']]),
  ],
  prelude: [
    section('roles', '职责分离', 'Actor 决定动作分布，Critic 估计当前预期', [
      'Actor 用参数 $\\theta$ 表示策略 $\\pi_{\\theta}(a\\mid s)$ 并负责与环境交互采样动作；Critic 用独立参数 $\\phi$ 估计状态价值 $V_{\\phi}(s)$，但从不替 Actor 直接选动作。',
      'Critic 的任务是为环境反馈建立实时参照：如果一次动作带来的即时奖励加后继价值高于当前预期 $V_{\\phi}(S_t)$，Actor 就提高该动作概率；低于预期则压低它。策略与价值由此组成互补闭环。',
    ]),
    section('timing', '同一步闭环', '一次环境转移同时产生两组参数的学习信号', [
      '环境返回即时奖励 $R_{t+1}$ 与后继状态 $S_{t+1}$ 后，Critic 立即构造一步目标与时序差分误差 $\\delta_t$ 修正自身参数，不必像 REINFORCE 那样等待整条回合结束。',
      '同一个标量 $\\delta_t$ 随即作为优势近似传给 Actor 完成策略更新。及时的单步信号大幅压缩了回报方差，但同时也把 Critic 当前的估计偏差带入了策略梯度。',
    ]),
  ],
  sections: [
    section('variance-bias', '偏差与方差权衡', 'Critic 用可学习估计替代高方差的完整回报', [
      '完整回报 $G_t$ 作为策略权重无偏却包含整条未来轨迹的随机噪声；单步时序差分误差 $\\delta_t$ 只依赖一步真实奖励与后继价值估计，因此方差显著更低。',
      '当 Critic 预测不准时，优势估计会带有自举偏差；随着 Critic 不断修正，Actor 收到的方向也愈发准确。Actor–Critic 本质上是用可学习的偏差换取更低方差与在线更新能力。',
    ], String.raw`\mathbb E[\delta_t\mid S_t=s,A_t=a]\approx A^{\pi}(s,a)`),
    section('two-timescales', '双时间尺度耦合', 'Actor 与 Critic 必须在相容的时间尺度上协同变化', [
      '在上方实验中可以看到：Critic 步长 $\\alpha_v$ 过慢时，状态价值长期滞后于真实水平，导致本该受抑的平庸动作持续收到正向误差；反过来若 Actor 步长 $\\alpha_\\pi$ 过快，访问分布剧烈漂移，Critic 只能不断追逐移动靶。',
      '因此在实践中必须协同设定两组学习率或更新频次，并同时监控价值拟合误差、策略熵与优势分布，而不能只看表面回报。',
    ]),
    section('forward', '进入 PPO', '重复使用旧策略数据时必须约束策略移动幅度', [
      '基础 Actor–Critic 默认只对当前策略刚采集的新样本更新一次；若想把昂贵的 rollout 数据切分成小批量复用多轮，新策略 $\\pi_{\\theta}$ 会逐步偏离采样时的旧策略，使重要性比率 $\\rho_t$ 偏离 1 并急剧放大更新震荡。',
      '下一章的 Proximal Policy Optimization（PPO）保留了 Actor–Critic 的全部接口，只改造策略复用旧数据的方式：保存采样时的旧动作概率，并通过裁剪替代目标取消越过近端区间后的额外梯度收益。',
    ]),
  ],
  summaryTitle: '从高方差回报到及时的 Actor–Critic 信号',
  summary: [
    'Actor 参数化动作概率 $\\pi_{\\theta}$，Critic 估计状态价值 $V_{\\phi}$，两者职责分离并共享单步误差数值。',
    '减去纯状态基线保持梯度期望不变，把权重转化为相对状态均值的优势函数 $A^{\\pi}(s,a)$。',
    '一步时序差分误差 $\\delta_t$ 近似动作优势，以可学习的自举偏差换取每步更新与显著方差缩减。',
    'Critic 与 Actor 构成耦合双时间尺度系统；而重要性比率 $\\rho_t$ 在大偏移下的震荡直接引出下一章 PPO。',
  ],
  explorer: { cue: '依次切换三组时间尺度预设并播放 16 步闭环：先看 Critic 过慢如何让平庸动作拿到错误正优势，再看大重要性比率如何引发策略震荡。' },
}, {
  prerequisite: 'Prerequisites: Policy Gradient, state value, and TD error', eyebrow: 'Part III · Policy and value cooperate', title: 'Actor–Critic Methods',
  intro: 'Chapter 12 showed how REINFORCE optimizes a parameterized policy directly, yet updates still wait for episode termination to compute $G_t$, and downstream trajectory noise inflates gradient variance. The unresolved problem is how to retain the policy-gradient direction while replacing delayed complete returns with timely, lower-variance relative feedback after every step. This chapter splits roles between a parameterized Actor and a state-value Critic, derives why one-step TD error $\\delta_t$ approximates advantage and drives two separate gradient paths, and tests in a 16-step two-timescale lab how lagging critics or large off-policy ratios destabilize the coupled loop.',
  bridge: 'Action-value weighting still passes state-level fluctuations into the policy gradient. Subtracting a state baseline yields advantage; approximating advantage with one-step TD error closes a per-transition dual-update loop.',
  experimentIntro: 'The lab expands one grid transition into a 16-step coupled Actor–Critic loop with three two-timescale presets (coordinated rates, slow lagging critic, large off-policy ratio $\\rho=1.75$) plus independent $\\alpha_v$ and $\\alpha_\\pi$ sliders. Predict how a tiny critic learning rate paired with a fast actor distorts the sign of $\\delta_t$, then play the loop to watch the dual curves synchronize with the single-step two-path microscope.',
  interpretation: 'The dual curves and single-step microscope confirm two invariants. First, Critic and Actor share the scalar value $\\delta_t$ while differentiating separate objects—$V_{\\phi}$ for the critic and $\\log\\pi_{\\theta}$ with stop-gradient $\\delta_t$ for the actor. Second, when the critic lags badly behind a fast actor, an underestimated baseline feeds false positive errors to mediocre actions; meanwhile, a large importance ratio $\\rho$ scales actor steps aggressively and triggers oscillation—directly motivating PPO’s proximal constraint next.',
  figure: 'Interactive Figure 13.1 · Actor–Critic Two-Timescale & Dual-Path Lab', instruction: 'Switch the three timescale presets and play the 16-step loop alongside the dual gradient microscope', question: 'How does one TD error drive two separate parameter updates, and why do mismatched timescales destabilize the loop?',
  deepening: actorCriticDeepeningEn,
  derivation: [
    step('q-gradient', 'Start from the action-value policy gradient', String.raw`\nabla_\theta J(\theta)=\mathbb E\left[\nabla_\theta\log\pi_\theta(A_t\mid S_t)q^{\pi}(S_t,A_t)\right]`, 'Actor direction combines the score function with action value.', 'Estimating $q$ directly gives Q Actor–Critic, yet state-level reward shifts shared by all actions still add unnecessary variance.', [], [[String.raw`\theta`, 'actor policy parameters']]),
    step('baseline-invariance', 'Prove that an action-independent state baseline preserves expectation', String.raw`\mathbb E_{A\sim\pi_\theta}\left[\nabla_\theta\log\pi_\theta(A\mid s)b(s)\right]=0`, 'Because the expected score vanishes, any pure state baseline cancels in expectation.', 'Choosing $b(s)=v^{\\pi}(s)$ strips out shared state-level offset without biasing the policy gradient.', [String.raw`b(s)\ \text{is independent of action}\ A`], [[String.raw`b(s)`, 'variance-reduction state baseline']]),
    step('advantage', 'Express the actor weight as relative advantage', String.raw`A^{\pi}(s,a)=q^{\pi}(s,a)-v^{\pi}(s)`, 'Advantage measures how much action $a$ beats the state average.', 'This lets the critic learn a single state-value reference rather than fitting every action value separately.', [], [[String.raw`A^{\pi}(s,a)`, 'relative action advantage']]),
    step('td-advantage', 'Approximate advantage with one-step TD error', String.raw`\delta_t=R_{t+1}+\gamma V_\phi(S_{t+1})-V_\phi(S_t)\approx A^{\pi}(S_t,A_t)`, 'A low-variance relative weight is now available after every transition.', 'When $V_{\\phi}=v^{\\pi}$, the conditional expectation of $\\delta_t$ given $(S_t,A_t)$ equals $A^{\\pi}(S_t,A_t)$; critic inaccuracy introduces learnable bias in exchange for lower variance.', [String.raw`V_\phi\ \text{approximates current-policy state value}`], [[String.raw`\phi`, 'critic value parameters'], [String.raw`\delta_t`, 'one-step temporal-difference error']]),
    step('two-updates', 'Drive two separate gradient paths from one scalar error', String.raw`\phi\leftarrow\phi+\alpha_v\delta_t\nabla_\phi V_\phi(S_t),\qquad\theta\leftarrow\theta+\alpha_\pi\operatorname{stopgrad}(\delta_t)\nabla_\theta\log\pi_\theta(A_t\mid S_t)`, 'Critic differentiates state value; actor differentiates log probability with a stopped-gradient weight.', 'Both parameter sets co-evolve after every step: the actor shifts visitation while the critic tracks the updated policy, requiring compatible step sizes $\\alpha_v$ and $\\alpha_\\pi$.', [String.raw`\alpha_v>0,\ \alpha_\pi>0`], [[String.raw`\alpha_v`, 'critic learning rate'], [String.raw`\alpha_\pi`, 'actor learning rate']]),
    step('importance', 'Reweight behavior-policy samples with the importance ratio', String.raw`\rho_t=\frac{\pi_\theta(A_t\mid S_t)}{b(A_t\mid S_t)},\qquad\Delta\theta\propto\rho_t\delta_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)`, 'The ratio $\\rho_t$ corrects actions drawn from behavior policy $b$ toward target policy $\\pi_{\\theta}$.', 'Once policies drift apart, large ratios inflate variance and overshoot updates—motivating PPO’s clipped objective in Chapter 14.', [String.raw`b(A_t\mid S_t)>0\ \text{whenever }\pi_\theta(A_t\mid S_t)>0`], [[String.raw`\rho_t`, 'action-probability importance ratio']]),
  ],
  prelude: [
    section('roles', 'Separated roles', 'The actor sets action probabilities while the critic estimates expected value', [
      'The actor parameterizes $\\pi_{\\theta}(a\\mid s)$ to sample actions; the critic parameterizes $V_{\\phi}(s)$ independently and never chooses actions for the actor.',
      'The critic supplies a live reference: outcomes above $V_{\\phi}(S_t)$ raise the sampled action’s probability, while outcomes below it push probability down, forming a complementary closed loop.',
    ]),
    section('timing', 'Per-transition loop', 'One environment transition feeds learning signals to both networks', [
      'As soon as $R_{t+1}$ and $S_{t+1}$ arrive, the critic forms a one-step target and TD error $\\delta_t$ to revise its own estimate without waiting for episode end.',
      'The same scalar $\\delta_t$ immediately approximates advantage for the actor, cutting return variance at the cost of bootstrap bias while the critic is still learning.',
    ]),
  ],
  sections: [
    section('variance-bias', 'Bias–variance tradeoff', 'The critic exchanges learnable bias for timely, lower-variance feedback', [
      'Complete returns $G_t$ are unbiased weights but absorb randomness from the entire future; one-step TD error $\\delta_t$ relies only on one reward and successor estimate, lowering variance.',
      'An inaccurate critic biases advantage estimates until value predictions converge, making Actor–Critic an explicit trade of learnable bias for lower variance and online updates.',
    ], String.raw`\mathbb E[\delta_t\mid S_t=s,A_t=a]\approx A^{\pi}(s,a)`),
    section('two-timescales', 'Two-timescale coupling', 'Actor and critic must evolve on compatible learning timescales', [
      'In the lab above, a slow critic step size $\\alpha_v$ leaves $V_{\\phi}$ lagging below reality, handing false positive errors to mediocre actions; conversely, an overly aggressive actor $\\alpha_\\pi$ shifts visitation faster than the critic can track.',
      'Practical implementations therefore coordinate learning rates or update frequencies and monitor value error, policy entropy, and advantage scale alongside return.',
    ]),
    section('forward', 'Toward PPO', 'Reusing old-policy batches requires constraining policy movement', [
      'Basic Actor–Critic naturally consumes fresh on-policy transitions once. Reusing one rollout batch across multiple gradient epochs pushes $\\pi_{\\theta}$ away from the sampling policy, driving $\\rho_t$ far from 1 and amplifying variance.',
      'Proximal Policy Optimization (PPO) in Chapter 14 keeps the entire Actor–Critic interface intact and constrains reuse by storing old probabilities and clipping further surrogate gains outside a proximal band.',
    ]),
  ],
  summaryTitle: 'From high-variance returns to timely Actor–Critic signals',
  summary: [
    'The actor parameterizes $\\pi_{\\theta}$ and the critic estimates $V_{\\phi}$, sharing a scalar TD error across separate gradient paths.',
    'Subtracting a state baseline preserves expected gradients and turns action weights into relative advantage $A^{\\pi}(s,a)$.',
    'One-step TD error $\\delta_t$ approximates advantage, trading learnable bootstrap bias for immediate updates and lower variance.',
    'Mismatched timescales and large importance ratios $\\rho_t$ destabilize the loop, directly motivating PPO next.',
  ],
  explorer: { cue: 'Toggle the three timescale presets and play all 16 steps: watch a lagging critic feed biased positive errors, then watch a large importance ratio amplify actor swings.' },
})

Object.assign(vfaChapter.zh, { title: '通过共享参数在状态之间传播价值信息' })
Object.assign(vfaChapter.en, { title: 'Transferring value across states with shared parameters' })
Object.assign(dqnChapter.zh, { title: '目标网络与经验回放的稳定化分工' })
Object.assign(dqnChapter.en, { title: 'Distinct stabilization roles of target networks and replay' })
Object.assign(policyGradientChapter.zh, { title: '让高回报动作在策略中更常出现' })
Object.assign(policyGradientChapter.en, { title: 'Directly increasing the probability of high-return actions' })
Object.assign(actorCriticChapter.zh, { title: '用状态价值给策略提供及时、低方差的反馈' })
Object.assign(actorCriticChapter.en, { title: 'Timely, lower-variance actor feedback from a critic' })
Object.assign(monteCarloChapter.zh, { eyebrow: '第 6 章 · Monte Carlo 经验估计' })
Object.assign(monteCarloChapter.en, { eyebrow: 'Chapter 6 · Monte Carlo estimation from experience' })
Object.assign(tdChapter.zh, { eyebrow: '第 8 章 · TD 单步预测', derivationEyebrow: '单步 Bellman 残差', derivationTitle: '从一次环境转移得到 TD(0) 更新' })
Object.assign(tdChapter.en, { eyebrow: 'Chapter 8 · One-step TD prediction', derivationEyebrow: 'One-step Bellman residual', derivationTitle: 'Derive a TD(0) update from one transition' })
Object.assign(controlChapter.zh, { eyebrow: '第 9 章 · Sarsa 与 Q-learning 控制', derivationEyebrow: '后继动作规则', derivationTitle: '后继动作规则区分 Sarsa 与 Q-learning' })
Object.assign(controlChapter.en, { eyebrow: 'Chapter 9 · Sarsa and Q-learning control', derivationEyebrow: 'Successor-action rules', derivationTitle: 'The successor-action rule separates Sarsa from Q-learning' })
Object.assign(vfaChapter.zh, { eyebrow: '第 10 章 · 价值函数近似', derivationEyebrow: '参数共享', derivationTitle: '从参数化价值误差得到半梯度更新' })
Object.assign(vfaChapter.en, { eyebrow: 'Chapter 10 · Value-function approximation', derivationEyebrow: 'Parameter sharing', derivationTitle: 'Derive a semi-gradient update from parameterized value error' })
Object.assign(dqnChapter.zh, { eyebrow: '第 11 章 · 深度 Q-learning', derivationEyebrow: '稳定化训练步', derivationTitle: '把冻结目标与经验回放写入同一次 Q-learning 更新' })
Object.assign(dqnChapter.en, { eyebrow: 'Chapter 11 · Deep Q-learning', derivationEyebrow: 'A stabilized training step', derivationTitle: 'Put a frozen target and replay into one Q-learning update' })
Object.assign(policyGradientChapter.zh, { eyebrow: '第 12 章 · 策略梯度', derivationEyebrow: '轨迹梯度估计', derivationTitle: '从策略目标得到可由轨迹估计的梯度' })
Object.assign(policyGradientChapter.en, { eyebrow: 'Chapter 12 · Policy gradient', derivationEyebrow: 'Trajectory gradient estimation', derivationTitle: 'Turn a policy objective into a trajectory-estimated gradient' })
Object.assign(actorCriticChapter.zh, { eyebrow: '第 13 章 · Actor–Critic', derivationEyebrow: '协同更新', derivationTitle: '从状态基线推导两组参数的单步更新' })
Object.assign(actorCriticChapter.en, { eyebrow: 'Chapter 13 · Actor–Critic', derivationEyebrow: 'Coupled updates', derivationTitle: 'Use TD error to update the critic and actor together' })
Object.assign(monteCarloChapter.zh, { summaryTitle: '从完整经验到可改进的动作价值' })
Object.assign(monteCarloChapter.en, { summaryTitle: 'From complete experience to improvable action values' })
Object.assign(tdChapter.zh, { summaryTitle: '从完整回报到单步自举' })
Object.assign(tdChapter.en, { summaryTitle: 'From complete returns to one-step bootstrapping' })
Object.assign(controlChapter.zh, { summaryTitle: '两种后继规则定义不同的控制目标' })
Object.assign(controlChapter.en, { summaryTitle: 'Two successor rules define different control objectives' })
Object.assign(vfaChapter.zh, { summaryTitle: '从逐状态表格到参数共享' })
Object.assign(vfaChapter.en, { summaryTitle: 'From state tables to shared parameters' })
Object.assign(dqnChapter.zh, { summaryTitle: '从 Q-learning 到稳定的深度价值更新' })
Object.assign(dqnChapter.en, { summaryTitle: 'From Q-learning to stable deep value updates' })
Object.assign(policyGradientChapter.zh, { summaryTitle: '从价值比较到直接优化策略' })
Object.assign(policyGradientChapter.en, { summaryTitle: 'From value comparison to direct policy optimization' })
Object.assign(actorCriticChapter.zh, { summaryTitle: '从高方差回报到及时的 Actor–Critic 信号' })
Object.assign(actorCriticChapter.en, { summaryTitle: 'From high-variance returns to timely actor–critic signals' })

export const part23Chapters = [monteCarloChapter, approximationChapter, tdChapter, controlChapter, vfaChapter, dqnChapter, policyGradientChapter, actorCriticChapter]
