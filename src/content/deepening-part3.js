const theorem = (claim, why, conditions) => ({ claim, why, conditions })
const example = (title, caption, headers, rows) => ({ title, caption, headers, rows })

export const vfaDeepeningZh = [
  {
    id: 'objective-and-semi-gradient', kicker: '从表格到函数', title: '函数逼近首先改变的不是更新式，而是误差的定义域',
    paragraphs: ['表格方法为每个状态保存独立参数；函数逼近用同一组参数 w 产生所有状态的预测。于是一次更新会沿参数梯度同时改变多个状态，泛化与干扰来自同一个机制。', '平方误差必须指定状态分布 μ。频繁出现的状态权重更大，因此“最佳逼近”是相对于数据分布的投影，而不是对所有状态一视同仁。若 target 本身依赖 w，TD 通常只对预测项求导，得到 semi-gradient。'],
    formulas: [String.raw`J(w)=\frac12\sum_s\mu(s)\left(v^{\pi}(s)-\widehat v(s,w)\right)^2`, String.raw`w\leftarrow w+\alpha\left(U_t-\widehat v(S_t,w)\right)\nabla_w\widehat v(S_t,w)`, String.raw`U_t=R_{t+1}+\gamma\widehat v(S_{t+1},w)`],
    theorem: theorem('TD semi-gradient 不等于对完整 bootstrap 平方误差做普通梯度下降。', 'target 中也含 w，但算法把它暂时视为常数；这让更新保持 Bellman 固定点结构，却失去普通监督学习的直接下降保证。', [String.raw`\nabla_w U_t\ \text{is omitted}`, String.raw`S_t\sim\mu`]),
    handoff: '在线性函数下，可以精确看出一次更新如何传播到相似状态。',
  },
  {
    id: 'linear-sharing', kicker: '线性特征', title: '线性逼近为什么把“相似”变成特征内积？',
    paragraphs: ['令预测为特征向量与参数的内积，则梯度就是当前状态的特征。更新后，另一个状态的预测变化等于两个状态特征的内积乘本次误差；正交特征互不影响，相似特征共同移动。', 'one-hot 特征使不同状态内积为零，恰好退化为表格方法。tile coding、Fourier 或神经网络的差别，本质上都在重新定义哪些状态共享参数。'],
    formulas: [String.raw`\widehat v(s,w)=x(s)^{\top}w,\qquad\nabla_w\widehat v(s,w)=x(s)`, String.raw`\Delta\widehat v(s')=\alpha\delta\,x(s')^{\top}x(s)`],
    example: example('一次样本怎样影响三个状态', '误差 δ=2、步长 α=0.1；变化大小由特征内积决定。', ['状态关系', '特征内积', '预测变化'], [['同一状态', '1.0', '+0.20'], ['相邻状态', '0.6', '+0.12'], ['无关状态', '0.0', '0']]),
    theorem: theorem('线性 on-policy TD(0) 在适当条件下收敛到 Bellman 方程在特征空间中的投影解。', '真实 value 未必位于表示空间，算法只能找到对采样分布最合适的可表示近似。', [String.raw`A=\Phi^{\top}D(I-\gamma P^{\pi})\Phi\ \text{is positive definite}`, String.raw`\sum_k\alpha_k=\infty,\quad\sum_k\alpha_k^2<\infty`]),
    handoff: '控制还会让采样策略随 Q 改变，目标与数据分布同时移动。',
  },
  {
    id: 'approximate-control', kicker: '近似控制', title: '把 Q 写成函数后，控制循环为什么比预测更容易不稳定？',
    paragraphs: ['预测在固定策略下逼近一个固定 value；控制一边用 Q 选动作，一边更新 Q。参数变化会改变行为策略，行为策略又改变训练分布与 bootstrap target。', '函数逼近、bootstrap 与 off-policy 三者同时出现时形成 deadly triad。它不是说一定发散，而是说表格收敛直觉不再自动成立；必须通过目标网络、经验回放、保守更新或梯度 TD 等机制恢复稳定性。'],
    formulas: [String.raw`U_t=R_{t+1}+\gamma\max_a\widehat q(S_{t+1},a,w)`, String.raw`w\leftarrow w+\alpha\left(U_t-\widehat q(S_t,A_t,w)\right)\nabla_w\widehat q(S_t,A_t,w)`],
    pseudocodeTitle: 'Semi-gradient Sarsa with function approximation',
    pseudocode: ['初始化参数 w 与 ε-greedy 行为策略', '对每个 episode：取得 S，并采样 A', '  执行 A，观察 R 与 S′', '  若非终止，从当前 ε-greedy 策略采样 A′', '  计算 δ = R + γq̂(S′,A′,w) − q̂(S,A,w)', '  更新 w ← w + αδ∇w q̂(S,A,w)', '  令 S←S′、A←A′，直到终止'],
    handoff: 'DQN 正是非线性近似 Q-learning；下一章的两个工程机制分别稳定 target 与数据分布。',
  },
]

export const vfaDeepeningEn = [
  {
    id: 'objective-and-semi-gradient', kicker: 'Table to function', title: 'Function approximation first changes the domain of error, not the update equation',
    paragraphs: ['A table stores independent parameters; one function uses shared w for every state. One gradient step therefore changes many predictions, making generalization and interference two sides of the same mechanism.', 'Squared error needs a state weighting μ. Frequently sampled states matter more, so the best approximation is a projection under the data distribution. TD commonly ignores the derivative of a parameter-dependent bootstrap target, producing a semi-gradient.'],
    formulas: [String.raw`J(w)=\frac12\sum_s\mu(s)\left(v^{\pi}(s)-\widehat v(s,w)\right)^2`, String.raw`w\leftarrow w+\alpha\left(U_t-\widehat v(S_t,w)\right)\nabla_w\widehat v(S_t,w)`, String.raw`U_t=R_{t+1}+\gamma\widehat v(S_{t+1},w)`],
    theorem: theorem('TD semi-gradient is not ordinary gradient descent on the full bootstrap squared error.', 'The target also contains w but is treated as fixed. This preserves a Bellman fixed-point update without a direct supervised-loss descent guarantee.', [String.raw`\nabla_w U_t\ \text{is omitted}`, String.raw`S_t\sim\mu`]),
    handoff: 'Linear functions reveal exactly how one update propagates to related states.',
  },
  {
    id: 'linear-sharing', kicker: 'Linear features', title: 'Why does linear approximation turn similarity into a feature inner product?',
    paragraphs: ['For an inner-product predictor, the gradient equals the current feature vector. The change at another state is proportional to the feature inner product: orthogonal states do not interact, while similar states move together.', 'One-hot features make all different states orthogonal and recover the tabular method. Other representations redefine which states share parameters.'],
    formulas: [String.raw`\widehat v(s,w)=x(s)^{\top}w,\qquad\nabla_w\widehat v(s,w)=x(s)`, String.raw`\Delta\widehat v(s')=\alpha\delta\,x(s')^{\top}x(s)`],
    example: example('How one sample changes three states', 'Let δ=2 and α=0.1; feature inner products set the propagation.', ['Relation', 'Feature inner product', 'Prediction change'], [['Same state', '1.0', '+0.20'], ['Neighbor', '0.6', '+0.12'], ['Unrelated', '0.0', '0']]),
    theorem: theorem('Linear on-policy TD(0) converges under suitable conditions to the Bellman solution projected into the feature space.', 'The true value may be unrepresentable, so the algorithm finds the best representable approximation under the sampling distribution.', [String.raw`A=\Phi^{\top}D(I-\gamma P^{\pi})\Phi\ \text{is positive definite}`, String.raw`\sum_k\alpha_k=\infty,\quad\sum_k\alpha_k^2<\infty`]),
    handoff: 'Control also moves the behavior policy, so both target and data distribution change.',
  },
  {
    id: 'approximate-control', kicker: 'Approximate control', title: 'Why is function-approximated control less stable than prediction?',
    paragraphs: ['Prediction approximates one fixed-policy value. Control uses Q to choose actions while updating Q, so parameter changes alter behavior, which alters the training distribution and targets.', 'Function approximation, bootstrapping, and off-policy learning form the deadly triad. Divergence is not guaranteed, but tabular convergence intuition no longer transfers automatically.'],
    formulas: [String.raw`U_t=R_{t+1}+\gamma\max_a\widehat q(S_{t+1},a,w)`, String.raw`w\leftarrow w+\alpha\left(U_t-\widehat q(S_t,A_t,w)\right)\nabla_w\widehat q(S_t,A_t,w)`],
    pseudocodeTitle: 'Semi-gradient Sarsa with function approximation',
    pseudocode: ['Initialize w and an ε-greedy behavior policy', 'For each episode, obtain S and sample A', '  Execute A and observe R and S′', '  If nonterminal, sample A′ from current ε-greedy policy', '  Compute δ = R + γq̂(S′,A′,w) − q̂(S,A,w)', '  Update w ← w + αδ∇w q̂(S,A,w)', '  Set S←S′ and A←A′ until termination'],
    handoff: 'DQN is nonlinear approximate Q-learning; its two engineering mechanisms stabilize targets and data.',
  },
]

export const dqnDeepeningZh = [
  {
    id: 'moving-target', kicker: '非线性 Q-learning', title: 'DQN 的困难不是网络不会拟合，而是输入分布和监督 target 都在移动',
    paragraphs: ['若用同一个在线网络同时预测 Q(S,A) 和构造 max Q(S′,a)，一次参数更新会同时改变被拟合项和标签。连续轨迹又让相邻样本高度相关，梯度可能长期偏向局部区域。', '因此 DQN 的 loss 看似监督学习，数据却不是固定 i.i.d. 数据集。target network 处理标签漂移，replay buffer 处理样本相关性与重复利用；二者修复不同问题，不能互相替代。'],
    formulas: [String.raw`Y_i=R_i+\gamma(1-D_i)\max_{a'}Q_{\bar\theta}(S_i',a')`, String.raw`L(\theta)=\frac{1}{B}\sum_{i=1}^{B}\left(Y_i-Q_{\theta}(S_i,A_i)\right)^2`],
    theorem: theorem('冻结 target 参数使若干优化步共享近似静止的回归标签。', '它没有消除 bootstrap 或逼近误差，只是把“预测追逐自己”的快速反馈减慢到可优化的时间尺度。', [String.raw`\bar\theta\ \text{held fixed for }C\text{ updates}`, String.raw`\bar\theta\leftarrow\theta\ \text{periodically}`]),
    handoff: '即使 target 暂时固定，按轨迹顺序训练仍会产生相关梯度，因此还需要 replay。',
  },
  {
    id: 'replay-why', kicker: '经验回放', title: 'Replay 为什么既打散相关性，又改变每条经验被使用的次数？',
    paragraphs: ['环境每步产生一条 transition，buffer 保存它们；训练批次从整个窗口随机抽取，使相邻梯度不必来自相邻时间。旧经验还能被多次复用，提高昂贵交互的样本效率。', '但 replay 分布是历史行为策略的混合，不等于当前策略分布。容量太小接近在线相关数据；容量太大可能包含大量过时经验。优先回放进一步改变采样概率，需要用重要性权重控制偏差。'],
    formulas: [String.raw`e_t=(S_t,A_t,R_{t+1},S_{t+1},D_{t+1})`, String.raw`(e_1,\ldots,e_B)\sim\operatorname{Uniform}(\mathcal D)`],
    example: example('两个机制各自控制什么', '关闭一个机制并不能由另一个自动补偿。', ['配置', '标签漂移', '样本相关'], [['在线网络 + 顺序样本', '高', '高'], ['目标网络 + 顺序样本', '较低', '高'], ['在线网络 + replay', '高', '较低'], ['目标网络 + replay', '较低', '较低']]),
    handoff: '把两个机制放回同一个训练循环，才能得到完整 DQN。',
  },
  {
    id: 'dqn-complete', kicker: '完整算法', title: 'DQN 的最小闭环包含四个不同节奏：行动、入库、梯度更新、目标同步',
    paragraphs: ['行动策略用在线 Q 做 ε-greedy；环境 transition 立即写入 buffer；梯度更新从 buffer 抽 batch；target network 只按固定周期或 Polyak 平均同步。', '评估时通常关闭探索并使用在线网络。训练回报、TD loss、Q 尺度和 target 同步跳变必须一起观察，因为低 loss 也可能对应错误而自洽的高估。'],
    formulas: [String.raw`A_t\sim\epsilon\text{-greedy}(Q_\theta(S_t,\cdot))`, String.raw`\theta\leftarrow\theta-\alpha\nabla_\theta L(\theta)`, String.raw`\bar\theta\leftarrow\theta\quad\text{every }C\text{ updates}`],
    pseudocodeTitle: 'Deep Q-learning with replay and target network',
    pseudocode: ['初始化在线网络 θ、目标网络 θ̄←θ 与 replay buffer D', '对每个环境步：按 ε-greedy(Qθ) 选择并执行 A', '  将 (S,A,R,S′,done) 写入 D', '  从 D 均匀抽取 B 条 transition', '  用 θ̄ 计算每条样本的 target Y', '  对平均平方 TD error 关于 θ 做一次梯度更新', '  每 C 次更新同步 θ̄←θ；终止时重置环境'],
    handoff: '价值型方法通过 max 间接得到策略；策略梯度则直接移动动作概率。',
  },
]

export const dqnDeepeningEn = [
  {
    id: 'moving-target', kicker: 'Nonlinear Q-learning', title: 'DQN is difficult because both labels and input distribution move',
    paragraphs: ['Using one online network for prediction and max-based targets lets every parameter update move both prediction and label. Sequential experience also yields highly correlated gradients.', 'DQN resembles supervised regression but lacks a fixed i.i.d. dataset. The target network slows label drift; replay reduces temporal correlation and reuses experience. They solve different failures.'],
    formulas: [String.raw`Y_i=R_i+\gamma(1-D_i)\max_{a'}Q_{\bar\theta}(S_i',a')`, String.raw`L(\theta)=\frac{1}{B}\sum_{i=1}^{B}\left(Y_i-Q_{\theta}(S_i,A_i)\right)^2`],
    theorem: theorem('Frozen target parameters give several optimization steps approximately stationary regression labels.', 'This does not remove bootstrapping or approximation error; it slows the feedback loop in which predictions chase themselves.', [String.raw`\bar\theta\ \text{held fixed for }C\text{ updates}`, String.raw`\bar\theta\leftarrow\theta\ \text{periodically}`]),
    handoff: 'A fixed target does not remove sequential sample correlation, motivating replay.',
  },
  {
    id: 'replay-why', kicker: 'Experience replay', title: 'Why does replay both decorrelate data and change reuse counts?',
    paragraphs: ['Each transition enters a buffer; training batches sample across the window, so adjacent gradients need not come from adjacent time. Old experience can train repeatedly, improving interaction efficiency.', 'The replay distribution mixes historical behavior policies. Small buffers resemble correlated online data; very large buffers can become stale. Prioritized replay changes sampling probabilities and needs importance correction.'],
    formulas: [String.raw`e_t=(S_t,A_t,R_{t+1},S_{t+1},D_{t+1})`, String.raw`(e_1,\ldots,e_B)\sim\operatorname{Uniform}(\mathcal D)`],
    example: example('What each mechanism controls', 'One mechanism cannot automatically replace the other.', ['Configuration', 'Label drift', 'Sample correlation'], [['Online + sequential', 'High', 'High'], ['Target + sequential', 'Lower', 'High'], ['Online + replay', 'High', 'Lower'], ['Target + replay', 'Lower', 'Lower']]),
    handoff: 'Both mechanisms must return to one complete training loop.',
  },
  {
    id: 'dqn-complete', kicker: 'Complete algorithm', title: 'DQN has four clocks: action, storage, gradient update, and target synchronization',
    paragraphs: ['Behavior uses ε-greedy online Q; transitions enter replay immediately; gradient batches come from replay; target parameters synchronize only periodically or by Polyak averaging.', 'Evaluation usually removes exploration and uses the online network. Return, TD loss, Q scale, and synchronization jumps should be read together because low loss can coexist with self-consistent overestimation.'],
    formulas: [String.raw`A_t\sim\epsilon\text{-greedy}(Q_\theta(S_t,\cdot))`, String.raw`\theta\leftarrow\theta-\alpha\nabla_\theta L(\theta)`, String.raw`\bar\theta\leftarrow\theta\quad\text{every }C\text{ updates}`],
    pseudocodeTitle: 'Deep Q-learning with replay and target network',
    pseudocode: ['Initialize online θ, target θ̄←θ, and replay buffer D', 'For each environment step choose and execute A by ε-greedy(Qθ)', '  Store (S,A,R,S′,done) in D', '  Uniformly sample B transitions from D', '  Compute each target Y using θ̄', '  Take one gradient step on mean squared TD error with respect to θ', '  Every C updates set θ̄←θ; reset environment at termination'],
    handoff: 'Value methods derive a policy through max; policy gradients move action probabilities directly.',
  },
]

export const policyGradientDeepeningZh = [
  {
    id: 'objectives-and-occupancy', kicker: '先说清优化目标', title: '平均状态价值与平均奖励为什么会导向相似的策略梯度结构？',
    paragraphs: ['策略参数不仅改变当前动作概率，还改变未来会访问哪些状态。折扣设定可用起始分布下的期望回报或折扣 occupancy 定义目标；持续型任务常用稳态分布下的平均奖励。', '两种目标的状态权重不同，不能把常数因子和分布直接混用；但 policy gradient theorem 都把长期分布变化吸收到 occupancy 权重中，留下 score function 与 action value 的乘积。'],
    formulas: [String.raw`J_\gamma(\theta)=\mathbb E_{S_0\sim d_0,\pi_\theta}\left[\sum_{t=0}^{\infty}\gamma^tR_{t+1}\right]`, String.raw`J_{\mathrm{avg}}(\theta)=\sum_s d^{\pi_\theta}(s)\sum_a\pi_\theta(a\mid s)r(s,a)`],
    theorem: theorem('策略梯度定理避免显式微分状态访问分布。', '状态分布当然依赖 θ；定理不是忽略这项，而是利用 Markov 链与 value 递推把它重新组织进 occupancy 权重。', [String.raw`\pi_\theta(a\mid s)\ \text{differentiable}`, String.raw`\sum_a\pi_\theta(a\mid s)=1`]),
    handoff: '把概率导数写成概率乘对数概率导数后，这个加权和才可以直接用策略样本估计。',
  },
  {
    id: 'theorem-to-samples', kicker: '从定理到采样', title: 'log-derivative trick 为什么恰好把求和变成 on-policy 期望？',
    paragraphs: ['恒等式 ∇π=π∇logπ 把原本缺少采样概率的导数补成 π 加权。于是从当前策略抽到的状态—动作对，可以用 score function 乘价值构成 Monte Carlo 梯度估计。', 'score 的动作期望为零，这既解释了归一化约束，也证明任何不依赖当前动作的 baseline 在期望中消失。baseline 改变方差和单样本方向强度，却不改变期望梯度。'],
    formulas: [String.raw`\nabla_\theta\pi_\theta(a\mid s)=\pi_\theta(a\mid s)\nabla_\theta\log\pi_\theta(a\mid s)`, String.raw`\mathbb E_{A\sim\pi_\theta}[\nabla_\theta\log\pi_\theta(A\mid s)]=\nabla_\theta\sum_a\pi_\theta(a\mid s)=0`, String.raw`\nabla J(\theta)=\mathbb E[\nabla\log\pi_\theta(A_t\mid S_t)q^{\pi}(S_t,A_t)]`],
    example: example('同一正 advantage 在不同概率下的作用', '两动作 softmax 中，被选动作的 score 大小为 1−π。', ['被选动作概率', 'score 大小', '正 advantage 的更新'], [['0.1', '0.9', '较强上调'], ['0.5', '0.5', '中等上调'], ['0.9', '0.1', '较弱上调']]),
    handoff: '用完整 return 替代未知 q^π，就得到 REINFORCE。',
  },
  {
    id: 'reinforce-complete', kicker: '完整算法', title: 'REINFORCE 为什么必须先收集轨迹，再反向计算每个时刻的 return？',
    paragraphs: ['时刻 t 的动作只能由它之后的奖励评价，因此不能把此前奖励放进权重。整条 episode 结束后反向递推 G，可以在线性时间内得到所有 reward-to-go。', '每个时间步都贡献一项 score × advantage。按 episode 求和后再更新可保持轨迹来自同一旧策略；若中途更新，后半段数据已来自不同策略，估计契约必须相应修改。'],
    formulas: [String.raw`G_t=R_{t+1}+\gamma G_{t+1}`, String.raw`\theta\leftarrow\theta+\alpha\sum_{t=0}^{T-1}\gamma^t\nabla_\theta\log\pi_\theta(A_t\mid S_t)\left(G_t-b(S_t)\right)`],
    pseudocodeTitle: 'Episodic REINFORCE with baseline',
    pseudocode: ['用当前策略 πθ 采集完整 episode', '从末尾开始令 G←0，并反向遍历时间步', '  更新 G←Rₜ₊₁+γG', '  计算 advantage 权重 ĤAₜ=G−b(Sₜ)', '  累加 g←g+γᵗ∇θ log πθ(Aₜ|Sₜ)ĤAₜ', 'episode 结束后执行 θ←θ+αg', '若 baseline 可学习，另用回归损失更新其参数'],
    handoff: 'Critic 用 TD bootstrap 学习 baseline，并把延迟的完整 return 换成更及时的 advantage 估计。',
  },
]

export const policyGradientDeepeningEn = [
  {
    id: 'objectives-and-occupancy', kicker: 'Define the objective first', title: 'Why do average value and average reward yield similar policy-gradient structure?',
    paragraphs: ['Policy parameters change immediate action probabilities and the future state occupancy. Discounted tasks use start-distribution return or discounted occupancy, while continuing tasks often use stationary average reward.', 'The state weights differ and should not be mixed. Yet each policy-gradient theorem reorganizes long-run distribution dependence into occupancy weights, leaving score times action value.'],
    formulas: [String.raw`J_\gamma(\theta)=\mathbb E_{S_0\sim d_0,\pi_\theta}\left[\sum_{t=0}^{\infty}\gamma^tR_{t+1}\right]`, String.raw`J_{\mathrm{avg}}(\theta)=\sum_s d^{\pi_\theta}(s)\sum_a\pi_\theta(a\mid s)r(s,a)`],
    theorem: theorem('The policy-gradient theorem avoids explicitly differentiating state occupancy.', 'Occupancy still depends on θ; Markov and value recursions reorganize that derivative into occupancy weights.', [String.raw`\pi_\theta(a\mid s)\ \text{differentiable}`, String.raw`\sum_a\pi_\theta(a\mid s)=1`]),
    handoff: 'The log-derivative identity turns the weighted sum into an expectation that policy samples can estimate.',
  },
  {
    id: 'theorem-to-samples', kicker: 'Theorem to samples', title: 'Why does the log-derivative trick turn the sum into an on-policy expectation?',
    paragraphs: ['The identity ∇π=π∇logπ supplies exactly the π weighting used by sampling. A state-action pair from the current policy can therefore contribute score times value.', 'The expected score over actions is zero. This reflects normalization and proves that any action-independent baseline vanishes in expectation while changing variance.'],
    formulas: [String.raw`\nabla_\theta\pi_\theta(a\mid s)=\pi_\theta(a\mid s)\nabla_\theta\log\pi_\theta(a\mid s)`, String.raw`\mathbb E_{A\sim\pi_\theta}[\nabla_\theta\log\pi_\theta(A\mid s)]=\nabla_\theta\sum_a\pi_\theta(a\mid s)=0`, String.raw`\nabla J(\theta)=\mathbb E[\nabla\log\pi_\theta(A_t\mid S_t)q^{\pi}(S_t,A_t)]`],
    example: example('The same positive advantage at different probabilities', 'For a two-action softmax, the selected-action score magnitude is 1−π.', ['Selected probability', 'Score magnitude', 'Positive-advantage effect'], [['0.1', '0.9', 'Strong increase'], ['0.5', '0.5', 'Medium increase'], ['0.9', '0.1', 'Small increase']]),
    handoff: 'Replacing unknown q^π with a complete return produces REINFORCE.',
  },
  {
    id: 'reinforce-complete', kicker: 'Complete algorithm', title: 'Why does REINFORCE collect a trajectory before computing returns backward?',
    paragraphs: ['Action t should be evaluated only by subsequent rewards. After termination, a backward recursion computes every reward-to-go in linear time.', 'Each time step contributes score times advantage. Updating after the episode keeps all data under one old policy; mid-episode updates require a different sampling contract.'],
    formulas: [String.raw`G_t=R_{t+1}+\gamma G_{t+1}`, String.raw`\theta\leftarrow\theta+\alpha\sum_{t=0}^{T-1}\gamma^t\nabla_\theta\log\pi_\theta(A_t\mid S_t)\left(G_t-b(S_t)\right)`],
    pseudocodeTitle: 'Episodic REINFORCE with baseline',
    pseudocode: ['Collect one complete episode with current πθ', 'Set G←0 and traverse time steps backward', '  Update G←Rₜ₊₁+γG', '  Compute advantage weight ĤAₜ=G−b(Sₜ)', '  Accumulate g←g+γᵗ∇θ log πθ(Aₜ|Sₜ)ĤAₜ', 'After the episode update θ←θ+αg', 'If the baseline is learned, update it with a separate regression loss'],
    handoff: 'A critic learns the baseline with TD and replaces delayed returns with timely advantage estimates.',
  },
]

export const actorCriticDeepeningZh = [
  {
    id: 'qac-to-baseline', kicker: '从 Q Actor–Critic 开始', title: '为什么减去 state baseline 不改变期望梯度，却能显著降低方差？',
    paragraphs: ['最直接的 Q Actor–Critic 用估计 q(S,A) 加权 score。问题是同一状态下所有动作共享的回报波动也会放大梯度。减去只依赖状态的 b(S)，其 score 乘积在动作期望下严格为零。', '取 b=v^π 后，权重变成 advantage。方差最小的标量 baseline 一般还会按 score 的平方加权，并不总严格等于 v^π；state value 是易学习且通常有效的近似。'],
    formulas: [String.raw`\mathbb E[\nabla\log\pi(A\mid S)b(S)\mid S]=0`, String.raw`A^{\pi}(s,a)=q^{\pi}(s,a)-v^{\pi}(s)`, String.raw`b^*(s)=\frac{\mathbb E[q^{\pi}(s,A)\lVert\nabla\log\pi(A\mid s)\rVert^2]}{\mathbb E[\lVert\nabla\log\pi(A\mid s)\rVert^2]}`],
    theorem: theorem('任何不依赖当前动作的 baseline 都保持策略梯度期望。', '证明只使用策略概率归一化；baseline 可以依赖状态或时间，但若依赖当前动作，消去通常不再成立。', [String.raw`b\perp A_t\mid S_t`, String.raw`\sum_a\pi_\theta(a\mid s)=1`]),
    handoff: '还需要一个及时、可学习的 advantage 样本；一步 TD error 正好满足这一接口。',
  },
  {
    id: 'a2c-shared-transition', kicker: '同一 transition，两种梯度', title: 'TD error 为什么能同时是 Critic 的残差和 Actor 的 advantage 样本？',
    paragraphs: ['Critic 用 δ 衡量当前 value 与一步 bootstrap target 的差，因此沿 ∇V 更新参数。给定状态和动作，如果 V=v^π，那么 δ 的条件期望恰好等于 q^π−v^π，也就是 advantage。', '两次更新共享标量 δ，却绝不能共享梯度对象：Critic 对 value 求导，Actor 对 log policy 求导。实现中把 advantage 对 Actor stop-gradient，可避免 Actor loss 意外反向修改 Critic。'],
    formulas: [String.raw`\delta_t=R_{t+1}+\gamma V_\phi(S_{t+1})-V_\phi(S_t)`, String.raw`\mathbb E[\delta_t\mid S_t=s,A_t=a]=A^{\pi}(s,a)\quad\text{if }V_\phi=v^{\pi}`, String.raw`\Delta\phi\propto\delta_t\nabla_\phi V_\phi(S_t),\qquad\Delta\theta\propto\operatorname{stopgrad}(\delta_t)\nabla_\theta\log\pi_\theta(A_t\mid S_t)`],
    pseudocodeTitle: 'One-step Advantage Actor–Critic',
    pseudocode: ['初始化 Actor 参数 θ 与 Critic 参数 φ', '按 πθ 从状态 S 采样 A，并观察 R、S′、done', '计算 target y=R+γ(1−done)Vφ(S′)', '计算 δ=y−Vφ(S)', '用 value loss 或 δ∇Vφ 更新 Critic', '用 stop-gradient(δ)∇θ log πθ(A|S) 更新 Actor', '令 S←S′；终止时重置环境并继续采样'],
    handoff: '当 rollout 一次收集多步时，可以用 n-step return 或 GAE 在偏差与方差之间连续调节。',
  },
  {
    id: 'off-policy-and-deterministic', kicker: '超出基础 A2C', title: 'Off-policy 修正与 deterministic policy gradient 解决的是两类不同问题',
    paragraphs: ['若动作来自 behavior policy b，随机策略梯度需用概率比 ρ=π/b 修正动作分布。大 ratio 会放大方差，裁剪或 trust region 因此成为现代策略优化的核心。', '连续动作下，确定性策略直接输出动作 μθ(s)。deterministic policy gradient 不使用 log probability，而是把 Critic 对动作的梯度经策略 Jacobian 反传给 Actor；它仍依赖 off-policy 状态分布与准确的 Q。'],
    formulas: [String.raw`\rho_t=\frac{\pi_\theta(A_t\mid S_t)}{b(A_t\mid S_t)}`, String.raw`\nabla_\theta J\approx\mathbb E_{s\sim d^b}\left[\nabla_\theta\mu_\theta(s)\nabla_a Q^{\mu}(s,a)\rvert_{a=\mu_\theta(s)}\right]`],
    example: example('三种 Actor 更新接口', '它们使用不同的数据契约，不能只替换一行公式。', ['方法', 'Actor 权重或方向', '数据要求'], [['On-policy A2C', 'TD / advantage', '当前策略 rollout'], ['Off-policy stochastic AC', 'importance-weighted advantage', 'behavior 概率可计算且覆盖 target'], ['Deterministic AC', 'Critic 的 action gradient', '连续动作与可微 Q']]),
    handoff: 'PPO 从 on-policy Actor–Critic 出发，用 old-policy ratio 限制同一批 rollout 上的多轮更新。',
  },
]

export const actorCriticDeepeningEn = [
  {
    id: 'qac-to-baseline', kicker: 'Begin with Q Actor–Critic', title: 'Why does a state baseline preserve expected gradient while reducing variance?',
    paragraphs: ['Basic Q Actor–Critic weights the score by estimated q(S,A), including fluctuations shared by all actions at a state. Subtracting b(S) contributes exactly zero in expectation over actions.', 'With b=v^π the weight becomes advantage. The minimum-variance scalar baseline generally includes score-norm weighting, so state value is an effective learnable approximation rather than a universal exact optimum.'],
    formulas: [String.raw`\mathbb E[\nabla\log\pi(A\mid S)b(S)\mid S]=0`, String.raw`A^{\pi}(s,a)=q^{\pi}(s,a)-v^{\pi}(s)`, String.raw`b^*(s)=\frac{\mathbb E[q^{\pi}(s,A)\lVert\nabla\log\pi(A\mid s)\rVert^2]}{\mathbb E[\lVert\nabla\log\pi(A\mid s)\rVert^2]}`],
    theorem: theorem('Any baseline independent of the current action preserves expected policy gradient.', 'The proof uses only probability normalization. A current-action-dependent baseline generally does not cancel.', [String.raw`b\perp A_t\mid S_t`, String.raw`\sum_a\pi_\theta(a\mid s)=1`]),
    handoff: 'A timely learnable advantage sample is still needed; one-step TD error fits that interface.',
  },
  {
    id: 'a2c-shared-transition', kicker: 'One transition, two gradients', title: 'Why is TD error both a critic residual and an actor advantage sample?',
    paragraphs: ['The critic compares its value to a one-step bootstrap target and updates along ∇V. If V equals v^π, the conditional expected TD error given state and action equals q^π−v^π.', 'Both updates share scalar δ but not the differentiated function. The critic differentiates value; the actor differentiates log policy. Stop-gradient on advantage prevents the actor loss from accidentally changing the critic.'],
    formulas: [String.raw`\delta_t=R_{t+1}+\gamma V_\phi(S_{t+1})-V_\phi(S_t)`, String.raw`\mathbb E[\delta_t\mid S_t=s,A_t=a]=A^{\pi}(s,a)\quad\text{if }V_\phi=v^{\pi}`, String.raw`\Delta\phi\propto\delta_t\nabla_\phi V_\phi(S_t),\qquad\Delta\theta\propto\operatorname{stopgrad}(\delta_t)\nabla_\theta\log\pi_\theta(A_t\mid S_t)`],
    pseudocodeTitle: 'One-step Advantage Actor–Critic',
    pseudocode: ['Initialize actor θ and critic φ', 'Sample A from πθ at S and observe R, S′, done', 'Compute y=R+γ(1−done)Vφ(S′)', 'Compute δ=y−Vφ(S)', 'Update critic with value loss or δ∇Vφ', 'Update actor with stop-gradient(δ)∇θ log πθ(A|S)', 'Set S←S′; reset at termination and continue'],
    handoff: 'Multi-step rollouts use n-step returns or GAE to move continuously along the bias–variance tradeoff.',
  },
  {
    id: 'off-policy-and-deterministic', kicker: 'Beyond basic A2C', title: 'Off-policy correction and deterministic policy gradient solve different problems',
    paragraphs: ['When actions come from behavior b, stochastic policy gradients use ratio ρ=π/b to correct action probabilities. Large ratios amplify variance and motivate clipping or trust regions.', 'For continuous actions, a deterministic actor outputs μθ(s). Its gradient backpropagates the critic action gradient through the policy Jacobian rather than using log probability; it still needs useful off-policy coverage and an accurate Q.'],
    formulas: [String.raw`\rho_t=\frac{\pi_\theta(A_t\mid S_t)}{b(A_t\mid S_t)}`, String.raw`\nabla_\theta J\approx\mathbb E_{s\sim d^b}\left[\nabla_\theta\mu_\theta(s)\nabla_a Q^{\mu}(s,a)\rvert_{a=\mu_\theta(s)}\right]`],
    example: example('Three actor-update interfaces', 'Their data contracts differ; one cannot replace only the formula.', ['Method', 'Actor weight or direction', 'Data contract'], [['On-policy A2C', 'TD / advantage', 'Current-policy rollout'], ['Off-policy stochastic AC', 'Importance-weighted advantage', 'Known behavior probabilities and coverage'], ['Deterministic AC', 'Critic action gradient', 'Continuous action and differentiable Q']]),
    handoff: 'PPO starts from on-policy Actor–Critic and constrains multiple updates on one old-policy rollout batch.',
  },
]
