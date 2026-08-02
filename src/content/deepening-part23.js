const theorem = (claim, why, conditions) => ({ claim, why, conditions })
const example = (title, caption, headers, rows) => ({ title, caption, headers, rows })

export const approximationDeepeningZh = [
  {
    id: 'mean-to-general-steps', kicker: '从已知递推到一般权重', title: '样本均值是特定步长序列下的增量估计',
    paragraphs: [
      '先不要直接接受一般步长。把前 k 个样本的均值拆开，新均值等于旧均值乘 k/(k+1)，再加新样本乘 1/(k+1)。整理以后，才出现“旧估计加误差纠正”的形式。',
      '把 1/(k+1) 换成一般的 α_k 后，算法不再保证每个历史样本等权：固定步长让近期样本保留更大权重，衰减步长则逐渐冻结估计。因此步长不是纯粹的数值旋钮，它定义了算法如何记忆历史。',
    ],
    formulas: [String.raw`\bar X_{k+1}=\frac{k}{k+1}\bar X_k+\frac{1}{k+1}X_{k+1}`, String.raw`\bar X_{k+1}=\bar X_k+\frac{1}{k+1}\left(X_{k+1}-\bar X_k\right)`, String.raw`w_{k+1}=(1-\alpha_k)w_k+\alpha_kX_{k+1}`],
    example: example('三次观测的权重怎样变化', '同样的观测序列，在均值步长与固定步长下形成不同记忆。', ['更新', '均值步长', '固定步长 0.5'], [['第一次观测 2', '估计为 2', '估计为 1'], ['第二次观测 8', '估计为 5', '估计为 4.5'], ['第三次观测 2', '估计为 4', '估计为 3.25']]),
    handoff: '均值递推只能估计一个常数期望；若目标由更一般的期望方程定义，就需要把“样本误差”推广为带噪声的函数观测。',
  },
  {
    id: 'robbins-monro-why', kicker: '随机求根', title: 'Robbins–Monro 以 noisy residual 逼近期望方程的根',
    paragraphs: [
      '目标不是让每次观测都精确，而是让给定当前参数时的平均观测等于真实残差。若根的两侧具有相反符号，那么期望更新方向会把参数推回根附近；零均值噪声只是在这个方向周围抖动。',
      '收敛条件分工明确：步长总和发散，保证离根很远时仍有足够总路程；步长平方和收敛，保证独立噪声的累计方差有限。固定步长保留追踪能力，但不能满足第二条，所以通常只收敛到根附近的稳态分布。',
    ],
    formulas: [String.raw`g(w)=\mathbb E[\widetilde g(w,\eta)],\qquad g(w^*)=0`, String.raw`w_{k+1}=w_k-\alpha_k\widetilde g(w_k,\eta_k)`, String.raw`\sum_k\alpha_k=\infty,\qquad\sum_k\alpha_k^2<\infty`],
    theorem: theorem('在稳定根、受控噪声和 Robbins–Monro 步长条件下，迭代以概率 1 收敛到根。', '这不是说每一步都更靠近根，而是说错误方向的随机移动最终被平均掉，同时算法仍保留足够总移动。', [String.raw`(w-w^*)g(w)>0\quad\text{for }w\ne w^*`, String.raw`\mathbb E[\eta_k\mid\mathcal F_k]=0,\quad\mathbb E[\eta_k^2\mid\mathcal F_k]\le C`]),
    pseudocodeTitle: 'Robbins–Monro 随机求根',
    pseudocode: ['给定初值 w₀ 与步长序列 {αₖ}', '对 k = 0,1,2,…：', '  在当前 wₖ 处取得一次带噪声观测 g̃ₖ', '  计算随机方向 dₖ = −g̃ₖ', '  更新 wₖ₊₁ = wₖ + αₖ dₖ', '  记录残差、步长与多 seed 分布，而不是只记录最后一点'],
    handoff: '当 g 是期望损失的梯度时，随机求根就变成 SGD；当 g 是 Bellman 残差时，它就变成 TD。',
  },
  {
    id: 'sgd-batch-family', kicker: '从求根到优化', title: 'BGD、mini-batch 与 SGD 的差别来自梯度估计，不来自不同目标',
    paragraphs: [
      '三种方法都最小化同一个经验或期望损失。区别只在每一步用多少样本估计梯度：全批量方向稳定但更新昂贵；单样本更新便宜但噪声最大；mini-batch 用并行计算换取方差下降。',
      '批量变大并不自动意味着更快到达好解。若计算预算固定，更大的 batch 会减少参数更新次数；因此比较时必须同时锁定样本数、更新数或总计算量中的至少一个。',
    ],
    formulas: [String.raw`L(w)=\frac{1}{N}\sum_{i=1}^{N}\ell_i(w)`, String.raw`\widehat g_B(w)=\frac{1}{|B|}\sum_{i\in B}\nabla_w\ell_i(w)`, String.raw`w\leftarrow w-\alpha\widehat g_B(w)`],
    pseudocodeTitle: '统一的 batch-gradient 训练循环',
    pseudocode: ['初始化参数 w₀，并选择 batch 大小 B', '对每个训练步 k：', '  从数据分布抽取一个大小为 B 的批次', '  分别计算批内样本损失与梯度', '  对梯度求平均得到 ĝ_B', '  更新 wₖ₊₁ = wₖ − αₖ ĝ_B', '  在相同样本预算下比较损失下降和梯度方差'],
    handoff: 'TD 的单步转移正是一种 batch 大小为 1 的 Bellman 残差样本。',
  },
]

export const approximationDeepeningEn = [
  {
    id: 'mean-to-general-steps', kicker: 'From a known recursion to general weights', title: 'The sample mean as an incremental estimate under one step-size schedule',
    paragraphs: ['Decompose the mean of k+1 samples before introducing a general step. The old mean receives weight k/(k+1) and the new observation receives 1/(k+1); rearrangement produces the error-correction form.', 'Replacing 1/(k+1) with α_k changes memory. A constant step emphasizes recent data, while a decaying step gradually freezes the estimate. Step size therefore defines historical weighting, not merely numerical speed.'],
    formulas: [String.raw`\bar X_{k+1}=\frac{k}{k+1}\bar X_k+\frac{1}{k+1}X_{k+1}`, String.raw`\bar X_{k+1}=\bar X_k+\frac{1}{k+1}\left(X_{k+1}-\bar X_k\right)`, String.raw`w_{k+1}=(1-\alpha_k)w_k+\alpha_kX_{k+1}`],
    example: example('How three observations receive different weights', 'The same observations create different memories under a mean step and a constant step.', ['Update', 'Mean schedule', 'Constant step 0.5'], [['Observe 2', 'Estimate 2', 'Estimate 1'], ['Observe 8', 'Estimate 5', 'Estimate 4.5'], ['Observe 2', 'Estimate 4', 'Estimate 3.25']]),
    handoff: 'A mean recursion estimates one constant expectation. A general expectation-defined target requires replacing sample error with a noisy function observation.',
  },
  {
    id: 'robbins-monro-why', kicker: 'Stochastic root finding', title: 'Approaching the root of an expectation equation with noisy residuals',
    paragraphs: ['Individual observations need not be accurate. Their conditional mean must equal the true residual, whose sign points toward the root on both sides. Zero-mean noise perturbs this useful average direction.', 'The two step-size conditions have distinct jobs: infinite total step preserves enough travel, while finite squared steps bound accumulated noise variance. Constant steps retain tracking ability but usually fluctuate around the root.'],
    formulas: [String.raw`g(w)=\mathbb E[\widetilde g(w,\eta)],\qquad g(w^*)=0`, String.raw`w_{k+1}=w_k-\alpha_k\widetilde g(w_k,\eta_k)`, String.raw`\sum_k\alpha_k=\infty,\qquad\sum_k\alpha_k^2<\infty`],
    theorem: theorem('Under a stable root, controlled noise, and Robbins–Monro steps, the iterates converge to the root almost surely.', 'Not every step is closer. Wrong-way random moves are eventually averaged out while total available motion remains sufficient.', [String.raw`(w-w^*)g(w)>0\quad\text{for }w\ne w^*`, String.raw`\mathbb E[\eta_k\mid\mathcal F_k]=0,\quad\mathbb E[\eta_k^2\mid\mathcal F_k]\le C`]),
    pseudocodeTitle: 'Robbins–Monro stochastic root finding',
    pseudocode: ['Choose initial w₀ and step schedule {αₖ}', 'For k = 0,1,2,…:', '  Observe one noisy residual g̃ₖ at wₖ', '  Form stochastic direction dₖ = −g̃ₖ', '  Update wₖ₊₁ = wₖ + αₖ dₖ', '  Track residuals and multiple seeds, not only the final point'],
    handoff: 'When g is an expected-loss gradient this becomes SGD; when g is a Bellman residual it becomes TD.',
  },
  {
    id: 'sgd-batch-family', kicker: 'Root finding becomes optimization', title: 'BGD, mini-batch, and SGD differ in gradient estimation, not objective',
    paragraphs: ['All three minimize the same loss. Full-batch gradients are stable but expensive, single-sample gradients are cheap and noisy, and mini-batches exchange parallel work for lower variance.', 'A larger batch is not automatically faster. Under a fixed compute budget it reduces the number of parameter updates, so fair comparisons must lock sample count, update count, or total work.'],
    formulas: [String.raw`L(w)=\frac{1}{N}\sum_{i=1}^{N}\ell_i(w)`, String.raw`\widehat g_B(w)=\frac{1}{|B|}\sum_{i\in B}\nabla_w\ell_i(w)`, String.raw`w\leftarrow w-\alpha\widehat g_B(w)`],
    pseudocodeTitle: 'Unified batch-gradient loop',
    pseudocode: ['Initialize parameters w₀ and choose batch size B', 'For each training step k:', '  Sample a batch of size B', '  Compute per-sample losses and gradients', '  Average gradients to obtain ĝ_B', '  Update wₖ₊₁ = wₖ − αₖ ĝ_B', '  Compare loss progress and gradient variance under one sample budget'],
    handoff: 'A TD transition is a batch-of-one sample of a Bellman residual.',
  },
]

export const tdDeepeningZh = [
  {
    id: 'bellman-sample-logic', kicker: '从期望方程到一次转移', title: '一次转移可以作为当前 Bellman 更新的随机样本',
    paragraphs: ['在固定策略下，Bellman 方程要求对所有可能的动作、奖励和后继状态取条件期望。真实交互不会一次给出整个期望，而会沿一条连续轨迹依次给出转移结果。因此，在当前价值表已知时，一步奖励加折扣后继估计正好是 Bellman 方程右侧的一次随机观测。', '把上一章的随机逼近写成 TD 需要两处明确转换。第一，原本针对某个固定状态独立取得的样本，改为回合中依次到达的状态转移；第二，随机逼近公式所需的真实后继价值不可观测，改由当前价值表中的后继估计代替。前者让更新能够沿轨迹执行，后者引入自举误差。单次转移还带有抽样方差，因此 TD 的依据是重复采样逼近 Bellman 更新，而不是某一个学习目标已经等于完整回报。'],
    formulas: [String.raw`(T^{\pi}V)(s)=\mathbb E_{\pi}[R_{t+1}+\gamma V(S_{t+1})\mid S_t=s]`, String.raw`U_t=R_{t+1}+\gamma V_t(S_{t+1})`, String.raw`\mathbb E[U_t\mid S_t=s]=(T^{\pi}V_t)(s)`],
    theorem: theorem('给定当前估计 V_t，单步 TD target 对 Bellman backup 无偏；它一般不对真实 value 无偏。', '这一区分解释了 TD 如何符合随机逼近，又为何会有 bootstrap bias。', [String.raw`\pi\ \text{fixed}`, String.raw`\mathbb E[R_{t+1}^2\mid S_t=s]<\infty`]),
    handoff: '既然一次转移可提供 residual 样本，就可以写出完整的在线 TD(0) 评价循环。',
  },
  {
    id: 'td-zero-complete', kicker: '完整算法', title: 'TD(0) 在每次转移后立即更新刚刚离开的状态',
    paragraphs: ['TD(0) 的执行顺序与环境交互完全同步。策略在 S_t 选择动作，环境返回 R_{t+1} 和 S_{t+1}；算法先用更新前的 V(S_{t+1}) 计算 target，再只修改 V(S_t)，随后从 S_{t+1} 继续行动。这样，一个回合尚未结束时，前面访问过的状态已经开始吸收新信息。', '在回合制任务中，终止状态的价值约定为零，最后一次更新便只剩终局奖励。持续型任务没有必须等待的终点，TD 仍可逐步更新；此时需要折扣回报或平均奖励设定，确保长期价值有明确含义。'],
    formulas: [String.raw`\delta_t=R_{t+1}+\gamma V(S_{t+1})-V(S_t)`, String.raw`V(S_t)\leftarrow V(S_t)+\alpha_t\delta_t`],
    pseudocodeTitle: '固定策略下的 TD(0) 预测',
    pseudocode: ['初始化所有非终止状态的 V(s)，终止状态 V=0', '对每个 episode：取得初始状态 S', '  若 S 非终止：按固定策略 π 从 S 采样动作 A', '  执行动作，观察奖励 R 与后继 S′', '  计算 δ = R + γV(S′) − V(S)', '  更新 V(S) ← V(S) + α(S)δ', '  令 S ← S′ 并继续，直到终止'],
    handoff: '完整循环已经说明 TD 怎样逐步提交价值；接下来应固定策略和经验，比较它与 Monte Carlo 使用的证据和更新时间。',
  },
  {
    id: 'mc-td-matched-comparison', kicker: '方法比较', title: '比较 MC 与 TD，先看 target 使用哪些信息、何时能够计算',
    paragraphs: ['两种方法都能在未知环境模型时评价固定策略，区别在于监督信号怎样构造。Monte Carlo 要等回合结束，再把终点之前实际发生的全部奖励组成回报；它不使用当前价值表补全尾部，但整条轨迹的随机性都会进入目标。TD(0) 在一次转移后即可计算，只使用一个实际奖励，再用后继状态的当前估计代表尚未发生的部分，因而通常方差更低，却会继承价值表中的误差。', '更新时间进一步改变适用场景。普通 Monte Carlo 依赖回合终点，天然适合回合制任务；TD 每一步都能更新，所以也能处理没有自然终点的持续型任务。比较二者时必须固定策略和经验，再观察目标何时可用、包含多少随机奖励、是否依赖当前估计，而不能只比较某一次目标数值。'],
    theorem: theorem('固定策略下的表格 TD(0)，在每个所需状态被无限多次访问且逐状态步长满足 Robbins–Monro 条件时，收敛到该策略的真实状态价值。', 'Bellman 算子提供稳定固定点，单步转移提供该算子残差的随机样本。', [String.raw`\sum_k\alpha_k(s)=\infty,\quad\sum_k\alpha_k^2(s)<\infty`, String.raw`N_t(s)\to\infty\ \text{for every required state}`]),
    handoff: '一步 TD 与完整回报已经形成两个端点；改变真实奖励的展开长度便得到两者之间的多步目标。',
  },
]

export const tdDeepeningEn = [
  {
    id: 'bellman-sample-logic', kicker: 'Expectation equation to one transition', title: 'One transition samples the current Bellman update',
    paragraphs: ['Under a fixed policy, the Bellman equation takes a conditional expectation over actions, rewards, and successor states. Interaction does not reveal that expectation at once; it supplies transitions sequentially along a trajectory. Given the current value table, one-step reward plus discounted successor estimate is therefore one random observation of the Bellman right-hand side.', 'Turning the previous chapter’s stochastic approximation into TD requires two explicit changes. Samples originally obtained independently for one fixed state become consecutive state transitions in an episode. The unavailable true successor value required by the root equation is replaced by the current successor estimate. The first change makes updates run along a trajectory; the second introduces bootstrap error. A transition also has sampling variance, so repeated samples justify TD rather than any single target already being a complete return.'],
    formulas: [String.raw`(T^{\pi}V)(s)=\mathbb E_{\pi}[R_{t+1}+\gamma V(S_{t+1})\mid S_t=s]`, String.raw`U_t=R_{t+1}+\gamma V_t(S_{t+1})`, String.raw`\mathbb E[U_t\mid S_t=s]=(T^{\pi}V_t)(s)`],
    theorem: theorem('Given V_t, the one-step target is unbiased for the Bellman backup, not generally for the true value.', 'This distinction explains both the stochastic-approximation justification and bootstrap bias.', [String.raw`\pi\ \text{fixed}`, String.raw`\mathbb E[R_{t+1}^2\mid S_t=s]<\infty`]),
    handoff: 'A transition can therefore supply a residual sample for a complete online TD(0) loop.',
  },
  {
    id: 'td-zero-complete', kicker: 'Complete algorithm', title: 'TD(0) updates the state just left after every transition',
    paragraphs: ['TD(0) stays synchronized with environment interaction. The policy acts in S_t, the environment returns R_{t+1} and S_{t+1}, and the algorithm forms a target from the pre-update V(S_{t+1}). It changes only V(S_t) and then continues from S_{t+1}. Values can therefore start changing before an episode ends.', 'For episodic tasks, terminal value is zero, so the final update uses only the terminal reward. A continuing task has no required endpoint, yet TD can still update step by step when discounting or an average-reward formulation gives long-term value a well-defined meaning.'],
    formulas: [String.raw`\delta_t=R_{t+1}+\gamma V(S_{t+1})-V(S_t)`, String.raw`V(S_t)\leftarrow V(S_t)+\alpha_t\delta_t`],
    pseudocodeTitle: 'Fixed-policy TD(0) prediction',
    pseudocode: ['Initialize V(s) for nonterminal states and set terminal V=0', 'For each episode, obtain initial state S', '  While S is nonterminal, sample A from fixed policy π', '  Execute A and observe reward R and successor S′', '  Compute δ = R + γV(S′) − V(S)', '  Update V(S) ← V(S) + α(S)δ', '  Set S ← S′ and continue'],
    handoff: 'The complete loop now shows how TD commits value online. The next comparison holds policy and experience fixed while changing the evidence and update time.',
  },
  {
    id: 'mc-td-matched-comparison', kicker: 'Method comparison', title: 'Compare MC and TD by target evidence and availability time',
    paragraphs: ['Both methods evaluate a fixed policy without an environment model, but they construct supervision differently. Monte Carlo waits for termination and uses every realized reward in the return. It does not fill the tail from the current value table, but randomness from the whole trajectory enters its target. TD(0) is available after one transition: it uses one realized reward and represents the unobserved tail with the current successor estimate, usually lowering variance while inheriting current table error.', 'The timing difference also changes task scope. Ordinary Monte Carlo depends on episode termination. TD updates at every step and can therefore serve episodic and continuing tasks. A useful comparison fixes policy and experience, then examines target availability, number of random rewards, and dependence on the current estimate rather than asking which one numerical target happens to be closer.'],
    theorem: theorem('Fixed-policy tabular TD(0) converges to the policy value when every required state is visited infinitely often and per-state step sizes satisfy Robbins–Monro conditions.', 'The Bellman operator supplies a stable fixed point and transitions supply random residual samples.', [String.raw`\sum_k\alpha_k(s)=\infty,\quad\sum_k\alpha_k^2(s)<\infty`, String.raw`N_t(s)\to\infty\ \text{for every required state}`]),
    handoff: 'One-step TD and complete returns now define two endpoints; varying the realized-reward horizon yields the multi-step family between them.',
  },
]

export const controlDeepeningZh = [
  {
    id: 'sarsa-complete-loop', kicker: '策略内更新', title: 'Sarsa 跟随实际下一动作更新',
    paragraphs: ['Sarsa 的五元组由当前状态、当前动作、即时奖励、后继状态和后继动作组成。最后一个动作不是记号装饰：它由当前行为策略真实采样，因此 target 评价的是“继续按这套含探索的策略行动”所得到的回报。', '写回当前动作价值后，算法直接复用已经采样的后继动作作为下一步实际动作。这个交接既避免重复采样，也保证产生数据的策略与 target 中评价的策略一致。', '对固定策略而言，这个更新是动作价值 Bellman 方程的随机逼近。若每个需要估计的状态—动作对被无限访问，且各自步长满足随机逼近条件，表格型 Sarsa 收敛到该策略的动作价值；若还要收敛到最优控制策略，则探索需要逐渐趋于贪心，同时仍保证无限探索。'],
    formulas: [String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`, String.raw`Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\left(U_t^{\mathrm{Sarsa}}-Q(S_t,A_t)\right)`],
    pseudocodeTitle: 'Sarsa 控制',
    pseudocode: ['初始化动作价值表 Q；对终止状态令动作价值为零', '对每个 episode：取得初始状态 S，并按 ε-greedy(Q) 采样动作 A', '  执行动作 A，观察奖励 R 与后继状态 S′', '  若 S′ 终止：令 target 等于 R', '  否则按同一 ε-greedy(Q) 真实采样 A′，令 target 等于 R 加 γQ(S′,A′)', '  用步长 α 将 target 与 Q(S,A) 的差写回 Q(S,A)', '  若 S′ 终止则结束本回合；否则令 S 接收 S′、A 接收 A′ 并继续', '返回动作价值表及其 ε-greedy 控制策略'],
    theorem: theorem('固定策略的表格型 Sarsa 在充分访问和 Robbins–Monro 步长下，以概率 1 收敛到该策略的动作价值。', 'Sarsa target 是动作价值 Bellman 方程右端的无偏样本；随机逼近把连续样本残差累积到同一固定点。', [String.raw`N_t(s,a)\to\infty`, String.raw`\sum_k\alpha_k(s,a)=\infty,\qquad\sum_k\alpha_k^2(s,a)<\infty`]),
    handoff: '单步 Sarsa 只等待一个后继动作。延长真实奖励与行为动作的观察窗口，会得到同一策略评价目标下的多步版本。',
  },
  {
    id: 'n-step-sarsa', kicker: '多步回报', title: 'n-step Sarsa 等待更多真实奖励',
    paragraphs: ['单步 Sarsa 与 Monte Carlo 求解的是同一个固定策略动作价值，只是拆分回报的位置不同。n-step Sarsa 先累加 n 个真实奖励，再用第 n 步后实际采样动作的当前价值补上尚未观察的尾部；当 n 等于 1 时它退化为 Sarsa，当窗口延伸到回合终点时则不再需要 bootstrap。', '第 n 个奖励和动作在时刻 t 尚未出现，因此状态—动作对不能立即更新，必须等到时刻 t+n 才具备完整 target。较小的 n 更早更新、方差较低，却更依赖当前动作价值表；较大的 n 减少 bootstrap 依赖，却让更多随机奖励进入 target，并要求更长的轨迹缓冲。'],
    formulas: [String.raw`G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nQ(S_{t+n},A_{t+n})`, String.raw`\begin{aligned}G_t^{(1)}&\ \text{is Sarsa},\\G_t^{(\infty)}&\ \text{is the complete Monte Carlo return}.\end{aligned}`],
    pseudocodeTitle: 'n-step Sarsa',
    pseudocode: ['初始化动作价值表 Q 和长度至少为 n 的轨迹缓冲区', '每个 episode 开始时采样初始状态与动作，并把终止时间设为未知', '  若当前时刻尚未终止：执行缓冲区中的动作，记录奖励与后继状态；若未终止，再按行为策略采样后继动作', '  把待更新位置设为当前时刻向前 n−1 步的位置', '  当该位置有效时，累加它之后最多 n 个真实奖励；若窗口未到终点，再加入第 n 步动作价值作为 bootstrap', '  用步长 α 将该 target 写回对应状态—动作对', '  当最后一个可更新位置完成写回时结束回合，否则时间前进一步', '返回动作价值表及其控制策略'],
    handoff: '多步长度改变证据数量与更新时间，却没有改变所评价的行为策略。Q-learning 接下来改变的是学习对象本身。',
  },
  {
    id: 'q-learning-off-policy', kicker: '策略外更新', title: 'Q-learning 根据后继最大值更新',
    paragraphs: ['Q-learning 的行为策略仍可用 ε-greedy 收集覆盖，但 target 不使用真实采样的后继动作，而是对下一状态所有动作取最大值。这把“产生数据的策略”与“被评价和改进的策略”分开，使算法直接逼近最优动作价值。', '在线实现可以让行为策略随当前动作价值表同步更新，持续产生新的探索转移；离线或外部行为版本也可以读取另一策略已经生成的完整 episode。两种实现使用相同的 Q-learning target，区别只在经验从哪里来。', '最大化并不会自动产生探索。若行为策略不给某些动作正概率，相关动作价值就没有数据，off-policy 学习也无法凭空纠正它。'],
    formulas: [String.raw`U_t^{\mathrm{Q}}=R_{t+1}+\gamma\max_a Q(S_{t+1},a)`, String.raw`\begin{aligned}b(a\mid s)&\ \text{collects data},\\\pi(a\mid s)&\in\arg\max_a Q(s,a).\end{aligned}`],
    pseudocodeTitle: 'Q-learning 控制',
    pseudocode: ['初始化动作价值表 Q，并指定能够覆盖所需动作的行为策略 b', '对每个在线回合或由 b 提供的 episode：取得初始状态 S', '  在线模式按 b 采样 A 并与环境交互；外部数据模式读取记录中的 A、R 与 S′', '  若 S′ 终止，令 target 等于 R；否则令 target 等于 R 加 γ 乘以后继状态的最大动作价值', '  用步长 α 将 target 与 Q(S,A) 的差写回 Q(S,A)', '  将目标策略在当前状态更新为相对于 Q 的贪心策略', '  令 S 接收 S′，重复直到终止', '返回动作价值表与贪心目标策略'],
    theorem: theorem('表格型 Q-learning 在所有状态—动作对被无限访问、步长满足随机逼近条件时收敛到 q*。', 'Bellman 最优算子提供收缩固定点；行为策略只负责提供覆盖，target 负责逼近最优算子。', [String.raw`N_t(s,a)\to\infty`, String.raw`\sum_k\alpha_k(s,a)=\infty,\quad\sum_k\alpha_k^2(s,a)<\infty`]),
    handoff: '同一条真实轨迹上并排计算两个 target，可以隔离实际后继动作与贪心后继动作的直接差别；长期训练则会让策略和轨迹随之分化。',
  },
  {
    id: 'shared-grid-policy-risk', kicker: '路径风险', title: '持续探索使两种算法走向不同路径',
    paragraphs: ['若训练和执行都保持固定探索率，Sarsa 学习的是含探索行为本身的长期回报。靠近禁区的直接路线会把未来随机动作进入禁区的负奖励纳入当前动作价值，因此绕开禁区的路径可能具有更高的 on-policy value。', 'Q-learning 的 target 假设未来总选择贪心动作，所以更偏好不含额外探索时的直接路径；训练期间的行为策略仍会探索，也仍可能进入禁区。因此“学习后的贪心路径”“进入禁区的回合比例”和“训练回报”是三个不同指标，必须分开解释。'],
    formulas: [String.raw`\begin{aligned}\text{Sarsa: }&A_{t+1}\sim b,\\\text{Q-learning: }&A_{t+1}\in\arg\max_a Q(S_{t+1},a).\end{aligned}`],
    handoff: '交互实验将先冻结真实转移以比较一个 target，再跨过写回边界观察差异怎样进入下一次更新，最后比较长期路径。',
  },
  {
    id: 'td-target-family', kicker: '目标比较', title: '四种算法共享同一更新结构',
    paragraphs: ['Sarsa、n-step Sarsa、Q-learning 与 Monte Carlo 都把一个经验 target 写回当前动作价值，外层随机逼近形式保持不变。它们的差别集中在 target 使用多少真实奖励、是否 bootstrap、何时可用，以及尾部跟随行为动作还是贪心动作。', 'Sarsa、n-step Sarsa 与 Monte Carlo 逼近固定策略的 Bellman 方程；Q-learning 把尾部换成动作最大值，逼近 Bellman 最优方程。这个统一视角解释了为什么算法代码相似，却会学习不同对象并呈现不同的偏差、方差与风险行为。'],
    formulas: [String.raw`Q_{t+1}(S_t,A_t)=Q_t(S_t,A_t)+\alpha_t\left(\bar q_t-Q_t(S_t,A_t)\right)`, String.raw`\begin{aligned}\bar q_t^{\mathrm{Sarsa}}&=R_{t+1}+\gamma Q_t(S_{t+1},A_{t+1})\\\bar q_t^{(n)}&=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nQ_t(S_{t+n},A_{t+n})\\\bar q_t^{\mathrm{Q}}&=R_{t+1}+\gamma\max_aQ_t(S_{t+1},a)\\\bar q_t^{\mathrm{MC}}&=\sum_{k=0}^{T-t-1}\gamma^kR_{t+k+1}\end{aligned}`],
    handoff: '这些算法仍为每个状态—动作对保存独立表项，无法把一处经验传递给表示相似但尚未访问的状态；下一章将用共享参数替代逐项存储。',
  },
]

export const controlDeepeningEn = [
  {
    id: 'sarsa-complete-loop', kicker: 'On-policy update', title: 'Sarsa follows the realized next action',
    paragraphs: ['A Sarsa tuple contains the current state, current action, immediate reward, successor state, and successor action. The final action is not decorative notation: it is actually sampled from behavior, so the target evaluates continued behavior under that same exploratory policy.', 'After committing the current action value, the algorithm reuses the sampled successor action as the next executed action. This handoff avoids resampling and keeps the policy generating data identical to the policy inside the target.', 'For a fixed policy, this update is stochastic approximation to the action-value Bellman equation. Tabular Sarsa converges to that policy value under infinite required visits and Robbins–Monro steps. Optimal control additionally requires exploration that becomes greedy while retaining infinite exploration.'],
    formulas: [String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`, String.raw`Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\left(U_t^{\mathrm{Sarsa}}-Q(S_t,A_t)\right)`],
    pseudocodeTitle: 'Sarsa control',
    pseudocode: ['Initialize action-value table Q and set terminal action values to zero', 'For each episode, obtain initial state S and sample action A from ε-greedy(Q)', '  Execute A and observe reward R and successor S′', '  If S′ is terminal, set target to R', '  Otherwise actually sample A′ from the same ε-greedy(Q) and set target to R plus γQ(S′,A′)', '  Use step size α to commit the difference between target and Q(S,A)', '  Stop if S′ is terminal; otherwise assign S′ to S and A′ to A, then continue', 'Return the action-value table and its ε-greedy control policy'],
    theorem: theorem('Fixed-policy tabular Sarsa converges almost surely to that policy action value under sufficient visits and Robbins–Monro step sizes.', 'Its target is an unbiased sample of the action-value Bellman equation; stochastic approximation accumulates sampled residuals toward the same fixed point.', [String.raw`N_t(s,a)\to\infty`, String.raw`\sum_k\alpha_k(s,a)=\infty,\qquad\sum_k\alpha_k^2(s,a)<\infty`]),
    handoff: 'One-step Sarsa waits for one successor action. Extending the realized reward and action window gives a multi-step method with the same policy-evaluation objective.',
  },
  {
    id: 'n-step-sarsa', kicker: 'Multi-step return', title: 'n-step Sarsa waits for more realized rewards',
    paragraphs: ['One-step Sarsa and Monte Carlo solve the same fixed-policy action value with different return decompositions. n-step Sarsa accumulates n realized rewards and bootstraps from the value of the action actually sampled at the nth successor. At n=1 it is Sarsa; when the window reaches termination no bootstrap remains.', 'The nth reward and action do not exist yet at time t, so the state-action pair must wait until time t+n for a complete target. Small n updates earlier with lower variance but depends more on the current table. Large n reduces bootstrap dependence, admits more random rewards, and requires a longer trajectory buffer.'],
    formulas: [String.raw`G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nQ(S_{t+n},A_{t+n})`, String.raw`\begin{aligned}G_t^{(1)}&\ \text{is Sarsa},\\G_t^{(\infty)}&\ \text{is the complete Monte Carlo return}.\end{aligned}`],
    pseudocodeTitle: 'n-step Sarsa',
    pseudocode: ['Initialize action-value table Q and a trajectory buffer of length at least n', 'At each episode start, sample the initial state and action and mark termination time as unknown', '  While the current time precedes termination, execute the buffered action, store reward and successor, and sample a successor action when nonterminal', '  Set the pending update position to the current time minus n−1', '  When that position is valid, sum up to n realized rewards and add the nth action-value bootstrap if the window has not terminated', '  Commit that target to the corresponding state-action pair with step size α', '  End after the final pending position is committed; otherwise advance time', 'Return the action-value table and its control policy'],
    handoff: 'The horizon changes evidence quantity and update timing without changing the policy being evaluated. Q-learning changes the learning objective itself.',
  },
  {
    id: 'q-learning-off-policy', kicker: 'Off-policy update', title: 'Q-learning updates from the successor maximum',
    paragraphs: ['Behavior may remain ε-greedy for coverage, but the target ignores the realized successor action and maximizes over all successor actions. This separates the policy producing data from the policy being evaluated and improved, allowing direct approximation of optimal action values.', 'An online implementation can update behavior with the current table and keep generating exploratory transitions. An external-data implementation can instead read complete episodes generated by another behavior policy. Both use the same Q-learning target; only the evidence source changes.', 'Maximization does not create exploration. If behavior assigns zero probability to an action, no off-policy target can invent its missing evidence.'],
    formulas: [String.raw`U_t^{\mathrm{Q}}=R_{t+1}+\gamma\max_a Q(S_{t+1},a)`, String.raw`\begin{aligned}b(a\mid s)&\ \text{collects data},\\\pi(a\mid s)&\in\arg\max_a Q(s,a).\end{aligned}`],
    pseudocodeTitle: 'Q-learning control',
    pseudocode: ['Initialize action-value table Q and specify behavior b with required action coverage', 'For each online episode or episode supplied by b, obtain initial state S', '  Online: sample A from b and interact; external data: read recorded A, R, and S′', '  If S′ is terminal set target to R; otherwise set target to R plus γ times the largest successor action value', '  Commit the difference between target and Q(S,A) with step size α', '  Make the target policy greedy with respect to Q at the current state', '  Assign S′ to S and repeat until termination', 'Return the action-value table and greedy target policy'],
    theorem: theorem('Tabular Q-learning converges to q* when every state-action pair is visited infinitely often and steps satisfy stochastic-approximation conditions.', 'The Bellman optimality operator supplies the contraction fixed point; behavior supplies coverage and the target samples that operator.', [String.raw`N_t(s,a)\to\infty`, String.raw`\sum_k\alpha_k(s,a)=\infty,\quad\sum_k\alpha_k^2(s,a)<\infty`]),
    handoff: 'Computing both targets on one realized transition isolates the immediate sampled-action versus greedy-action difference. Long-run control then lets both behavior and trajectories diverge.',
  },
  {
    id: 'shared-grid-policy-risk', kicker: 'Path risk', title: 'Persistent exploration sends the algorithms along different paths',
    paragraphs: ['With persistent exploration in both training and execution, Sarsa learns the long-run return of exploratory behavior itself. A direct route near forbidden states includes the penalties from future exploratory entries, so a detour can have higher on-policy value.', 'Q-learning targets greedy future behavior and therefore prefers a direct path without extra exploration, even though its training behavior can still enter forbidden states. The learned greedy path, fraction of episodes entering forbidden states, and training return are three distinct metrics and must be interpreted separately.'],
    formulas: [String.raw`\begin{aligned}\text{Sarsa: }&A_{t+1}\sim b,\\\text{Q-learning: }&A_{t+1}\in\arg\max_a Q(S_{t+1},a).\end{aligned}`],
    handoff: 'The experiment first freezes one realized transition, crosses a commit boundary into the next update, and then compares long-run paths.',
  },
  {
    id: 'td-target-family', kicker: 'Target comparison', title: 'Four algorithms share one update structure',
    paragraphs: ['Sarsa, n-step Sarsa, Q-learning, and Monte Carlo all commit an experience target to the current action value through the same outer stochastic-approximation update. Their targets differ in how many rewards are realized, whether they bootstrap, when they become available, and whether the tail follows behavior or a greedy action.', 'Sarsa, n-step Sarsa, and Monte Carlo approximate a fixed-policy Bellman equation. Q-learning replaces the tail by a maximum and approximates the Bellman optimality equation. This common view explains why similar code can learn different objects and exhibit different bias, variance, and risk behavior.'],
    formulas: [String.raw`Q_{t+1}(S_t,A_t)=Q_t(S_t,A_t)+\alpha_t\left(\bar q_t-Q_t(S_t,A_t)\right)`, String.raw`\begin{aligned}\bar q_t^{\mathrm{Sarsa}}&=R_{t+1}+\gamma Q_t(S_{t+1},A_{t+1})\\\bar q_t^{(n)}&=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nQ_t(S_{t+n},A_{t+n})\\\bar q_t^{\mathrm{Q}}&=R_{t+1}+\gamma\max_aQ_t(S_{t+1},a)\\\bar q_t^{\mathrm{MC}}&=\sum_{k=0}^{T-t-1}\gamma^kR_{t+k+1}\end{aligned}`],
    handoff: 'These algorithms still store an independent entry for every state-action pair and cannot transfer one update to a similar but unvisited state. The next chapter replaces the table with shared parameters.',
  },
]

Object.assign(approximationDeepeningEn[0].example, { title: 'Different weights assigned to three observations' })
