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
    id: 'sarsa-complete-loop', kicker: 'On-policy 控制', title: 'Sarsa 以实际选择的下一动作构造更新目标',
    paragraphs: ['Sarsa 的五元组是 S_t、A_t、R_{t+1}、S_{t+1}、A_{t+1}。最后一个动作不是记号装饰：它由当前行为策略真实采样，target 因而评价“继续按这套含探索的策略行动”会怎样。', '更新之后直接复用已经采样的 A_{t+1} 作为下一步动作，才能保持数据与 target 的 on-policy 一致性。若更新后重新采样，算法仍可运行，但必须明确行为概率发生了什么变化。'],
    formulas: [String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`, String.raw`Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\left(U_t^{\mathrm{Sarsa}}-Q(S_t,A_t)\right)`],
    pseudocodeTitle: 'Sarsa 控制',
    pseudocode: ['初始化 Q；对终止状态令 Q=0', '对每个 episode：取得 S，并按 ε-greedy(Q) 采样 A', '  执行 A，观察 R 与 S′', '  若 S′ 终止：令 target=R', '  否则按同一 ε-greedy(Q) 采样 A′，令 target=R+γQ(S′,A′)', '  更新 Q(S,A) ← Q(S,A)+α(target−Q(S,A))', '  令 S←S′、A←A′，直到终止'],
    handoff: 'Sarsa 评价的是含探索行为本身，因此它会把未来探索事故计入当前动作的价值。',
  },
  {
    id: 'q-learning-off-policy', kicker: 'Off-policy 控制', title: 'Q-learning 在探索行为下学习贪心目标策略',
    paragraphs: ['Q-learning 的行为策略仍可用 ε-greedy 收集覆盖，但 target 不使用真实采样的 A_{t+1}，而是对下一状态所有动作取最大值。这把“产生数据的策略”与“被评价和改进的策略”分开。', 'max 并不会消除探索；它只让 target 假设未来按贪心策略行动。若行为策略不给某些动作正概率，相关 Q 仍没有数据，off-policy 也无法凭空学习。'],
    formulas: [String.raw`U_t^{\mathrm{Q}}=R_{t+1}+\gamma\max_a Q(S_{t+1},a)`, String.raw`b(a\mid s)\ \text{collects data},\qquad \pi(a\mid s)\in\arg\max_a Q(s,a)`],
    pseudocodeTitle: 'Q-learning 控制',
    pseudocode: ['初始化 Q；为行为策略选择 ε>0', '对每个 episode：取得初始状态 S', '  按行为策略 b（如 ε-greedy(Q)）采样 A', '  执行 A，观察 R 与 S′', '  若 S′ 终止令 target=R，否则 target=R+γ maxₐ Q(S′,a)', '  更新 Q(S,A) ← Q(S,A)+α(target−Q(S,A))', '  令 S←S′，直到终止'],
    theorem: theorem('表格型 Q-learning 在所有状态—动作对被无限访问、步长满足随机逼近条件时收敛到 q*。', 'Bellman 最优算子提供收缩固定点；行为策略只负责提供覆盖，target 负责逼近最优算子。', [String.raw`N_t(s,a)\to\infty`, String.raw`\sum_k\alpha_k(s,a)=\infty,\quad\sum_k\alpha_k^2(s,a)<\infty`]),
    handoff: '同一条轨迹上并排计算两个 target，才能看清“真实下一动作”与“贪心下一动作”的唯一差别。',
  },
  {
    id: 'n-step-and-cliff', kicker: '差异从何而来', title: '悬崖世界中，Sarsa 与 Q-learning 的不同不是谁更聪明，而是优化了不同策略',
    paragraphs: ['若 ε 在训练和执行时都保持不变，Sarsa 学习的是 ε-greedy 行为策略的长期回报。靠近悬崖的最短路会因未来随机探索而频繁跌落，因此安全绕行可能具有更高 on-policy value。', 'Q-learning 的 target 假设未来总选贪心动作，因而偏好无探索时的最短路；但训练期间行为策略仍可能从这条路跌落。测试“学到的贪心策略”与“训练期实际回报”会得到不同结论。n-step Sarsa 则把多个真实行为动作纳入 target，使这一策略依赖传播得更远。'],
    formulas: [String.raw`G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nQ(S_{t+n},A_{t+n})`, String.raw`\text{Sarsa: }A_{t+1}\sim b,\qquad\text{Q-learning: }A_{t+1}\in\arg\max_a Q(S_{t+1},a)`],
    example: example('相同下一状态，不同 target', '假设下一状态两个动作价值为 5 和 1，行为策略本次探索到较差动作。', ['算法', '尾项选择', '奖励为 0、折扣 0.9 时'], [['Sarsa', '真实下一动作，价值 1', 'target = 0.9'], ['Q-learning', '贪心动作，价值 5', 'target = 4.5']]),
    handoff: '状态—动作表无法在相似状态之间共享经验；下一章因此把 Q 或 V 改写成参数函数。',
  },
]

export const controlDeepeningEn = [
  {
    id: 'sarsa-complete-loop', kicker: 'On-policy control', title: 'Sarsa constructs its target from the action actually selected next',
    paragraphs: ['The five-tuple ends with A_{t+1}. That action is sampled from the actual behavior policy, so the target evaluates continued behavior under the same exploratory policy.', 'Reusing A_{t+1} as the next executed action preserves on-policy consistency between target and data. Resampling is possible, but its policy timing must be explicit.'],
    formulas: [String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`, String.raw`Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\left(U_t^{\mathrm{Sarsa}}-Q(S_t,A_t)\right)`],
    pseudocodeTitle: 'Sarsa control',
    pseudocode: ['Initialize Q and set terminal Q=0', 'For each episode, obtain S and sample A from ε-greedy(Q)', '  Execute A and observe R and S′', '  If S′ is terminal, set target=R', '  Otherwise sample A′ from the same ε-greedy(Q) and set target=R+γQ(S′,A′)', '  Update Q(S,A) ← Q(S,A)+α(target−Q(S,A))', '  Set S←S′ and A←A′ until termination'],
    handoff: 'Sarsa evaluates exploratory behavior itself, including future exploration accidents.',
  },
  {
    id: 'q-learning-off-policy', kicker: 'Off-policy control', title: 'Q-learning learns a greedy target policy under exploratory behavior',
    paragraphs: ['The behavior policy may remain ε-greedy for coverage, but the target ignores the realized next action and maximizes over all next actions. Data generation and the policy being evaluated are separated.', 'The max does not create exploration. If behavior assigns zero probability to an action, no off-policy target can invent its missing evidence.'],
    formulas: [String.raw`U_t^{\mathrm{Q}}=R_{t+1}+\gamma\max_a Q(S_{t+1},a)`, String.raw`b(a\mid s)\ \text{collects data},\qquad \pi(a\mid s)\in\arg\max_a Q(s,a)`],
    pseudocodeTitle: 'Q-learning control',
    pseudocode: ['Initialize Q and choose behavior exploration ε>0', 'For each episode, obtain initial state S', '  Sample A from behavior b such as ε-greedy(Q)', '  Execute A and observe R and S′', '  If terminal set target=R; otherwise target=R+γ maxₐQ(S′,a)', '  Update Q(S,A) ← Q(S,A)+α(target−Q(S,A))', '  Set S←S′ and continue until termination'],
    theorem: theorem('Tabular Q-learning converges to q* when every state-action pair is visited infinitely often and steps satisfy stochastic-approximation conditions.', 'The Bellman optimality operator supplies the contraction fixed point; behavior supplies coverage and the target samples that operator.', [String.raw`N_t(s,a)\to\infty`, String.raw`\sum_k\alpha_k(s,a)=\infty,\quad\sum_k\alpha_k^2(s,a)<\infty`]),
    handoff: 'Computing both targets on one transition isolates the realized-action versus greedy-action difference.',
  },
  {
    id: 'n-step-and-cliff', kicker: 'Where behavior diverges', title: 'On the cliff, Sarsa and Q-learning optimize different policies rather than showing different intelligence',
    paragraphs: ['With persistent ε during training and execution, Sarsa learns the long-run return of ε-greedy behavior. The shortest cliff path includes future exploration falls, so a safer detour can have higher on-policy value.', 'Q-learning targets greedy future behavior and prefers the shortest no-exploration path, even though exploratory training episodes may still fall. Learned greedy performance and actual training return are different metrics. n-step Sarsa carries several realized behavior actions into the target.'],
    formulas: [String.raw`G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nQ(S_{t+n},A_{t+n})`, String.raw`\text{Sarsa: }A_{t+1}\sim b,\qquad\text{Q-learning: }A_{t+1}\in\arg\max_a Q(S_{t+1},a)`],
    example: example('Same successor, different targets', 'Suppose successor action values are 5 and 1, and behavior explores the lower-valued action.', ['Algorithm', 'Tail choice', 'Reward 0 and discount 0.9'], [['Sarsa', 'Realized next action, value 1', 'target = 0.9'], ['Q-learning', 'Greedy action, value 5', 'target = 4.5']]),
    handoff: 'A state-action table cannot share evidence across similar states, motivating parameterized V and Q.',
  },
]

Object.assign(approximationDeepeningEn[0].example, { title: 'Different weights assigned to three observations' })
