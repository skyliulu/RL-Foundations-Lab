const theorem = (claim, why, conditions) => ({ claim, why, conditions })
const example = (title, caption, headers, rows) => ({ title, caption, headers, rows })

export const vfaDeepeningZh = [
  {
    id: 'objective-and-semi-gradient', kicker: '从表格到函数', title: '函数逼近首先改变的不是更新式，而是误差的定义域',
    paragraphs: [String.raw`表格方法为每个状态保存独立参数；函数逼近用同一组参数 $\mathbf w$ 产生所有状态的预测。于是一次更新会沿参数梯度同时改变多个状态，泛化与干扰来自同一个机制。`, String.raw`平方误差必须指定状态分布 $\mu$。频繁出现的状态权重更大，因此“最佳逼近”是相对于数据分布的投影，而不是对所有状态一视同仁。若目标本身依赖 $\mathbf w$，时间差分通常只对预测项求导，得到半梯度更新。`],
    formulas: [String.raw`J(\mathbf w)=\frac12\sum_s\mu(s)\left(v^{\pi}(s)-\widehat v(s,\mathbf w)\right)^2`, String.raw`\mathbf w\leftarrow \mathbf w+\alpha\left(U_t-\widehat v(S_t,\mathbf w)\right)\nabla_{\mathbf w}\widehat v(S_t,\mathbf w)`, String.raw`U_t=R_{t+1}+\gamma\widehat v(S_{t+1},\mathbf w)`],
    theorem: theorem('TD semi-gradient 不等于对完整 bootstrap 平方误差做普通梯度下降。', String.raw`目标中也含 $\mathbf w$，但算法把它暂时视为常数；这让更新保持 Bellman 不动点结构，却失去普通监督学习的直接下降保证。`, [String.raw`\nabla_{\mathbf w} U_t\ \text{is omitted}`, String.raw`S_t\sim\mu`]),
    handoff: '在线性函数下，可以精确看出一次更新如何传播到相似状态。',
  },
  {
    id: 'linear-sharing', kicker: '线性特征与传播', title: '特征内积直接决定一次更新会传播到哪些状态',
    paragraphs: [
      String.raw`在线性近似 $\widehat v(s,\mathbf w)=\boldsymbol\phi(s)^{\top}\mathbf w$ 中，预测对参数的梯度就是状态特征向量本身，因此单步参数增量为 $\Delta\mathbf w=\alpha\delta\boldsymbol\phi(S_t)$。把更新后的参数重新代入任意状态 $s'$，其预测改变量恰好等于两状态特征的内积乘步长与误差。`,
      String.raw`由此可以直接回收前九章的表格方法：若把每个网格状态编码成互不正交的独热向量，则不同状态的特征内积恒为零，参数共享消失，更新退化为逐格表格 TD(0)。反之，当径向基、瓦片编码或坐标多项式让相邻状态共享非零内积时，单条样本便立刻向周边传播——既可能在平滑区域加速学习，也可能在禁区 $s_{13}$ 与目标 $s_{18}$ 之间引发反向拉扯。`,
    ],
    formulas: [String.raw`\widehat v(s,\mathbf w)=\boldsymbol\phi(s)^{\top}\mathbf w,\qquad\nabla_{\mathbf w}\widehat v(s,\mathbf w)=\boldsymbol\phi(s)`, String.raw`\Delta\widehat v(s')=\boldsymbol\phi(s')^{\top}\Delta\mathbf w=\alpha\delta\,\boldsymbol\phi(s')^{\top}\boldsymbol\phi(S_t)`],
    example: example('共享 5×5 网格中一次样本的跨状态传播', String.raw`设在 $s_{13}$ 收到时间差分误差 $\delta=-2.0$、步长 $\alpha=0.25$；不同状态受到的连带改变量完全由特征内积 $\boldsymbol\phi(s')^{\top}\boldsymbol\phi(s_{13})$ 决定。`, ['观测状态与位置关系', { latex: String.raw`\boldsymbol\phi(s')^{\top}\boldsymbol\phi(s_{13})` }, { latex: String.raw`\Delta\widehat v(s')` }], [
      [String.raw`被采样状态 $s_{13}$（禁区）`, { latex: '1.00' }, { latex: '-0.50' }],
      [String.raw`相邻安全格 $s_{14}$（右侧紧邻）`, { latex: '0.68' }, { latex: '-0.34' }],
      [String.raw`相邻目标格 $s_{18}$（下方紧邻）`, { latex: '0.68' }, { latex: '-0.34' }],
      [String.raw`远端角落 $s_{1}$（特征几乎正交）`, { latex: '0.02' }, { latex: '-0.01' }],
    ]),
    theorem: theorem('线性 on-policy TD(0) 在适当条件下收敛到 Bellman 方程在特征子空间中的投影不动点。', '当真实状态价值并不落在特征张成的子空间内时，算法无法达到零误差，而是收敛到在采样访问分布下投影残差为零的唯一线性解。', [String.raw`A=\Phi^{\top}D(I-\gamma P^{\pi})\Phi\ \text{is positive definite}`, String.raw`\sum_{k=1}^{\infty}\alpha_k=\infty,\qquad\sum_{k=1}^{\infty}\alpha_k^2<\infty`]),
    handoff: '下面在共享 5×5 网格中播放连续写回，直接检验同一个内积如何同时制造泛化与干扰。',
  },
  {
    id: 'approximate-control', kicker: '从预测进入近似控制', title: '策略随价值估计一起变化时，目标与数据分布都会移动',
    paragraphs: [
      String.raw`把特征扩展到状态—动作对 $\boldsymbol\phi(s,a)$ 后，动作价值可写作 $\widehat q(s,a,\mathbf w)$，从而把第 09 章的 Sarsa 与 Q-learning 推广为近似控制算法。但预测问题在固定策略下逼近固定的价值函数与固定访问分布 $\mu$；控制问题却在每次参数更新后立刻改变 $\epsilon$-greedy 行为，导致下一步采集的数据分布与自举目标一起漂移。`,
      '当“函数近似、自举、策略外学习”三者同时出现时，被称为致命三元组（deadly triad）：参数共享可能把某处动作价值的高估扩散到未访问状态，而最大化自举又把这种高估继续写回目标。它并不意味着训练必然发散，但说明表格 Q-learning 的收敛直觉已不再自动成立。',
    ],
    formulas: [String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma\widehat q(S_{t+1},A_{t+1},\mathbf w_t),\qquad U_t^{Q}=R_{t+1}+\gamma\max_{a}\widehat q(S_{t+1},a,\mathbf w_t)`, String.raw`\mathbf w_{t+1}=\mathbf w_t+\alpha_t\left(U_t-\widehat q(S_t,A_t,\mathbf w_t)\right)\nabla_{\mathbf w}\widehat q(S_t,A_t,\mathbf w_t)`],
    pseudocodeTitle: 'Semi-gradient Sarsa with function approximation',
    pseudocode: [
      String.raw`初始化共享参数 $\mathbf w \in \mathbb R^d$ 与 $\epsilon$-greedy 行为策略`,
      String.raw`对每个回合：初始化状态 $S$，按 $\epsilon\text{-greedy}(\widehat q(S,\cdot,\mathbf w))$ 采样动作 $A$`,
      String.raw`  执行动作 $A$，从环境观察即时奖励 $R$ 与后继状态 $S'$`,
      String.raw`  若 $S'$ 为终止状态：令 $\delta \leftarrow R - \widehat q(S,A,\mathbf w)$，更新 $\mathbf w$ 并在本回合停止`,
      String.raw`  若 $S'$ 非终止：按当前 $\epsilon\text{-greedy}(\widehat q(S',\cdot,\mathbf w))$ 采样下一动作 $A'$`,
      String.raw`  计算半梯度误差 $\delta \leftarrow R + \gamma\widehat q(S',A',\mathbf w) - \widehat q(S,A,\mathbf w)$`,
      String.raw`  执行参数写回 $\mathbf w \leftarrow \mathbf w + \alpha\delta\nabla_{\mathbf w}\widehat q(S,A,\mathbf w)$`,
      String.raw`  令 $S \leftarrow S'$、$A \leftarrow A'$，继续下一步直到回合结束`,
    ],
    handoff: '当线性特征换成多层神经网络、控制目标取最大值时，就进入下一章的 Deep Q-learning。',
  },
]

export const vfaDeepeningEn = [
  {
    id: 'objective-and-semi-gradient', kicker: 'Table to function', title: 'Function approximation first changes the domain of error, not the update equation',
    paragraphs: [String.raw`A table stores independent parameters; one function uses shared $\mathbf w$ for every state. One gradient step therefore changes many predictions, making generalization and interference two sides of the same mechanism.`, String.raw`Squared error needs a state weighting $\mu$. Frequently sampled states matter more, so the best approximation is a projection under the data distribution. TD commonly ignores the derivative of a parameter-dependent bootstrap target, producing a semi-gradient.`],
    formulas: [String.raw`J(\mathbf w)=\frac12\sum_s\mu(s)\left(v^{\pi}(s)-\widehat v(s,\mathbf w)\right)^2`, String.raw`\mathbf w\leftarrow \mathbf w+\alpha\left(U_t-\widehat v(S_t,\mathbf w)\right)\nabla_{\mathbf w}\widehat v(S_t,\mathbf w)`, String.raw`U_t=R_{t+1}+\gamma\widehat v(S_{t+1},\mathbf w)`],
    theorem: theorem('TD semi-gradient is not ordinary gradient descent on the full bootstrap squared error.', String.raw`The target also contains $\mathbf w$ but is treated as fixed. This preserves a Bellman fixed-point update without a direct supervised-loss descent guarantee.`, [String.raw`\nabla_{\mathbf w} U_t\ \text{is omitted}`, String.raw`S_t\sim\mu`]),
    handoff: 'Linear functions reveal exactly how one update propagates to related states.',
  },
  {
    id: 'linear-sharing', kicker: 'Linear features and propagation', title: 'Feature inner products determine exactly which states change after one update',
    paragraphs: [
      String.raw`Under linear approximation $\widehat v(s,\mathbf w)=\boldsymbol\phi(s)^{\top}\mathbf w$, the gradient equals the state feature vector itself, so one step writes $\Delta\mathbf w=\alpha\delta\boldsymbol\phi(S_t)$. Substituting the updated weights into any other state $s'$ shows that its prediction change equals the step size times TD error times the feature inner product.`,
      String.raw`This immediately recovers the tabular methods of Chapters 1 through 9: one-hot features make distinct states orthogonal, so every off-diagonal inner product is zero and updates reduce to tabular TD(0). Whenever radial-basis, tile, or polynomial features overlap across neighbors, one sample spreads across the grid—accelerating learning along smooth corridors while pulling opposite directions across the boundary between forbidden $s_{13}$ and target $s_{18}$.`,
    ],
    formulas: [String.raw`\widehat v(s,\mathbf w)=\boldsymbol\phi(s)^{\top}\mathbf w,\qquad\nabla_{\mathbf w}\widehat v(s,\mathbf w)=\boldsymbol\phi(s)`, String.raw`\Delta\widehat v(s')=\boldsymbol\phi(s')^{\top}\Delta\mathbf w=\alpha\delta\,\boldsymbol\phi(s')^{\top}\boldsymbol\phi(S_t)`],
    example: example('Cross-state propagation from one sample in the 5×5 grid', String.raw`Suppose state $s_{13}$ observes TD error $\delta=-2.0$ with step size $\alpha=0.25$; the change at every other state is set by $\boldsymbol\phi(s')^{\top}\boldsymbol\phi(s_{13})$.`, ['State and grid relation', { latex: String.raw`\boldsymbol\phi(s')^{\top}\boldsymbol\phi(s_{13})` }, { latex: String.raw`\Delta\widehat v(s')` }], [
      [String.raw`Sampled state $s_{13}$ (forbidden)`, { latex: '1.00' }, { latex: '-0.50' }],
      [String.raw`Adjacent safe cell $s_{14}$ (right neighbor)`, { latex: '0.68' }, { latex: '-0.34' }],
      [String.raw`Adjacent target cell $s_{18}$ (below)`, { latex: '0.68' }, { latex: '-0.34' }],
      [String.raw`Distant corner $s_{1}$ (nearly orthogonal)`, { latex: '0.02' }, { latex: '-0.01' }],
    ]),
    theorem: theorem('Linear on-policy TD(0) converges under suitable conditions to the projected Bellman fixed point in feature space.', 'When the true value lies outside the span of the features, the algorithm converges not to zero error but to the unique linear solution whose projected Bellman residual vanishes under the sampling distribution.', [String.raw`A=\Phi^{\top}D(I-\gamma P^{\pi})\Phi\ \text{is positive definite}`, String.raw`\sum_{k=1}^{\infty}\alpha_k=\infty,\qquad\sum_{k=1}^{\infty}\alpha_k^2<\infty`]),
    handoff: 'The experiment below plays consecutive commits on the shared 5×5 grid to show one inner product driving both generalization and interference.',
  },
  {
    id: 'approximate-control', kicker: 'Approximate control', title: 'Approximate control moves both targets and data distribution together',
    paragraphs: [
      String.raw`Extending features to state-action pairs $\boldsymbol\phi(s,a)$ yields parameterized action values $\widehat q(s,a,\mathbf w)$, generalizing Sarsa and Q-learning to large spaces. Whereas prediction approximates one fixed value function under a stationary visitation distribution $\mu$, control immediately alters its $\epsilon$-greedy behavior after parameter updates, moving both the incoming data distribution and the bootstrap targets.`,
      'Combining function approximation, bootstrapping, and off-policy learning creates the deadly triad: shared weights can spread overestimation to unvisited states while maximizing targets feed those estimates back into supervision. Divergence is not guaranteed, yet tabular convergence intuition no longer transfers automatically.',
    ],
    formulas: [String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma\widehat q(S_{t+1},A_{t+1},\mathbf w_t),\qquad U_t^{Q}=R_{t+1}+\gamma\max_{a}\widehat q(S_{t+1},a,\mathbf w_t)`, String.raw`\mathbf w_{t+1}=\mathbf w_t+\alpha_t\left(U_t-\widehat q(S_t,A_t,\mathbf w_t)\right)\nabla_{\mathbf w}\widehat q(S_t,A_t,\mathbf w_t)`],
    pseudocodeTitle: 'Semi-gradient Sarsa with function approximation',
    pseudocode: [
      String.raw`Initialize shared weights $\mathbf w \in \mathbb R^d$ and an $\epsilon$-greedy behavior policy`,
      String.raw`For each episode: initialize $S$ and sample $A$ from $\epsilon\text{-greedy}(\widehat q(S,\cdot,\mathbf w))$`,
      String.raw`  Execute $A$ and observe immediate reward $R$ and next state $S'$`,
      String.raw`  If $S'$ is terminal: set $\delta \leftarrow R - \widehat q(S,A,\mathbf w)$, update $\mathbf w$, and end episode`,
      String.raw`  Otherwise sample $A'$ from current $\epsilon\text{-greedy}(\widehat q(S',\cdot,\mathbf w))$`,
      String.raw`  Compute semi-gradient error $\delta \leftarrow R + \gamma\widehat q(S',A',\mathbf w) - \widehat q(S,A,\mathbf w)$`,
      String.raw`  Commit weights $\mathbf w \leftarrow \mathbf w + \alpha\delta\nabla_{\mathbf w}\widehat q(S,A,\mathbf w)$`,
      String.raw`  Set $S \leftarrow S'$ and $A \leftarrow A'$ until termination`,
    ],
    handoff: 'Replacing fixed linear features with a neural network and maximizing targets leads directly to Deep Q-learning in the next chapter.',
  },
]

export const dqnDeepeningZh = [
  {
    id: 'moving-target', kicker: '两类独立失稳机制', title: '同一网络既预测又出题，连续轨迹还会反复强化局部误差',
    paragraphs: [
      String.raw`在普通监督学习中，输入样本独立同分布，标签也始终固定；但把神经网络直接放进 Q-learning 时，这两条前提会同时失效。第一条失效来自自举闭环：同一个在线网络 $\theta$ 既预测当前动作价值 $Q_{\theta}(S_t,A_t)$，又计算下一状态的最大值 $\max_{a'}Q_{\theta}(S_{t+1},a')$。梯度刚把当前预测向旧目标拉近，目标本身就因为参数共享立刻移走。`,
      String.raw`第二条失效来自轨迹顺序：智能体沿着网格走廊连续走动，相邻几步转移往往聚集在同一片区域，连续多次梯度都朝同一方向推挤权重，把局部误差反复放大并冲掉远处状态的预测。因此必须分别处理“目标变化过快”与“训练样本高度相关”——下面的推导先冻结一份滞后参数 $\bar\theta$，再用经验回放打散时间顺序。`,
    ],
    formulas: [String.raw`Y_i=R_i+\gamma(1-D_i)\max_{a'}Q_{\bar\theta}(S_i',a')`, String.raw`L(\theta)=\frac{1}{B}\sum_{i=1}^{B}\left(Y_i-Q_{\theta}(S_i,A_i)\right)^2`],
    theorem: theorem('冻结目标参数使连续多次梯度更新面对近似静止的回归标签。', String.raw`滞后快照 $\bar\theta$ 并未消除自举偏差或函数近似误差，而是把“预测追逐自己”的实时正反馈拉慢为每 $C$ 步一次的阶梯同步，让优化器在同步窗口内稳定收敛。`, [String.raw`\bar\theta\ \text{held fixed for }C\text{ updates}`, String.raw`\bar\theta\leftarrow\theta\ \text{every }C\text{ updates}`]),
    handoff: '即便目标在同步周期内保持静止，按轨迹顺序连续更新仍会产生强相关梯度，因此还需要经验回放。',
  },
  {
    id: 'replay-why', kicker: '经验回放与分工消融', title: '经验回放降低时间相关，也会改变样本的新鲜度与复用次数',
    paragraphs: [
      String.raw`经验回放把每次环境交互得到的五元组 $e_t=(S_t,A_t,R_{t+1},S_{t+1},D_{t+1})$ 写入固定容量的循环缓冲区 $\mathcal D$，训练时再从整个窗口中均匀抽取小批量。由此，相邻两次梯度不再来自相邻时刻的同一条走廊，每条高价值转移（例如到达目标 $s_{18}$ 或撞入禁区 $s_{13}$）也能被反复利用多次。`,
      String.raw`新引入的权衡来自策略外混合：缓冲区里同时装着过去多版 $\epsilon$-greedy 策略采到的转移，容量过小会退回高度相关的在线更新，容量过大又会让陈旧样本长期主导梯度。下表固定四组消融配置，说明为何关闭其中任意一个机制都不能靠另一个自动弥补。`,
    ],
    formulas: [String.raw`e_t=(S_t,A_t,R_{t+1},S_{t+1},D_{t+1})`, String.raw`(e_1,\ldots,e_B)\sim\operatorname{Uniform}(\mathcal D)`],
    example: example('四组消融配置分别控制哪类失稳', String.raw`在完全相同的环境转移流上分别开关目标冻结（$C=8$ 对 $C=1$）与随机回放（$p_{\mathrm{replay}}=1$ 对 $0$），两项诊断指标独立变化。`, ['消融配置', '目标逐帧漂移', '相邻样本相关', '旧样本复用'], [
      [String.raw`朴素网络（$C=1$，顺序样本）`, '每步漂移', '高', String.raw`$1\times$`],
      [String.raw`仅目标网络（$C=8$，顺序样本）`, '阶梯冻结', '高', String.raw`$1\times$`],
      [String.raw`仅经验回放（$C=1$，随机抽样）`, '每步漂移', '低', '多次复用'],
      [String.raw`完整 DQN（$C=8$，随机抽样）`, '阶梯冻结', '低', '多次复用'],
    ]),
    handoff: '下面把四套节奏放回同一个可执行训练循环，再在交互实验中逐帧验证上述四组消融。',
  },
  {
    id: 'dqn-complete', kicker: '完整算法与四套时钟', title: '行动、入库、梯度更新与目标同步按四个节奏运行',
    paragraphs: [
      String.raw`完整 DQN 同时协调四套时钟：行为时钟用当前在线网络做 $\epsilon$-greedy 决策；存储时钟把每次环境转移立即写入缓冲区 $\mathcal D$；优化时钟从缓冲区随机抽取 $B$ 条转移，用冻结网络 $\bar\theta$ 构造目标 $Y_i$ 并更新在线参数 $\theta$；同步时钟则每隔 $C$ 次梯度更新才执行一次 $\bar\theta \leftarrow \theta$（或缓慢软更新）。`,
      '评估策略时关闭随机探索并直接读取在线网络。诊断训练时必须同时观察平均回报、目标曲线的阶梯跳变、样本相关性与动作价值尺度，因为一条看似平滑的损失曲线也可能掩盖自洽但错误的持续高估。',
    ],
    formulas: [String.raw`A_t\sim\epsilon\text{-greedy}(Q_\theta(S_t,\cdot))`, String.raw`\theta\leftarrow\theta-\alpha\nabla_\theta L(\theta)`, String.raw`\bar\theta\leftarrow\theta\quad\text{every }C\text{ updates}`],
    pseudocodeTitle: 'Deep Q-learning with experience replay and target network',
    pseudocode: [
      String.raw`初始化在线网络参数 $\theta$、冻结目标网络 $\bar\theta \leftarrow \theta$ 与回放缓冲区 $\mathcal D$`,
      String.raw`对每个环境步：按 $\epsilon\text{-greedy}(Q_{\theta}(S_t,\cdot))$ 选择并执行动作 $A_t$`,
      String.raw`  将转移 $(S_t,A_t,R_{t+1},S_{t+1},D_{t+1})$ 写入循环缓冲区 $\mathcal D$`,
      String.raw`  从 $\mathcal D$ 中均匀随机抽取 $B$ 条转移构成小批量`,
      String.raw`  用冻结网络 $\bar\theta$ 计算每条样本的停止梯度目标 $Y_i = R_i + \gamma(1-D_i)\max_{a'} Q_{\bar\theta}(S_i',a')$`,
      String.raw`  沿均方时序差分损失对在线参数执行一步更新 $\theta \leftarrow \theta - \alpha\nabla_{\theta} L(\theta)$`,
      String.raw`  每累计完成 $C$ 次在线更新，同步一次目标网络 $\bar\theta \leftarrow \theta$；遇终止则重置环境`,
    ],
    handoff: '价值型方法始终通过最大化间接导出策略；下一章转向直接优化动作概率的策略梯度方法。',
  },
]

export const dqnDeepeningEn = [
  {
    id: 'moving-target', kicker: 'Two distinct instabilities', title: 'DQN is difficult because both regression labels and sample order break i.i.d. assumptions',
    paragraphs: [
      String.raw`Ordinary supervised learning assumes fixed labels and i.i.d. batches; placing a neural network inside Q-learning violates both simultaneously. First, the online network $\theta$ both predicts $Q_{\theta}(S_t,A_t)$ and builds its own maximizing label $\max_{a'}Q_{\theta}(S_{t+1},a')$, so every gradient step moves the target the optimizer is chasing.`,
      String.raw`Second, consecutive transitions along a trajectory come from one local grid corridor, yielding strongly correlated gradients that reinforce local errors and overwrite distant predictions. Stabilizing deep Q-learning therefore demands two distinct mechanisms: a frozen lagged copy $\bar\theta$ to slow label motion and experience replay to shuffle transition order.`,
    ],
    formulas: [String.raw`Y_i=R_i+\gamma(1-D_i)\max_{a'}Q_{\bar\theta}(S_i',a')`, String.raw`L(\theta)=\frac{1}{B}\sum_{i=1}^{B}\left(Y_i-Q_{\theta}(S_i,A_i)\right)^2`],
    theorem: theorem('Frozen target parameters provide approximately stationary regression labels across each synchronization window.', String.raw`The lagged copy $\bar\theta$ does not eliminate bootstrap bias or approximation error; it slows self-chasing feedback into discrete updates every $C$ steps so online optimization settles between syncs.`, [String.raw`\bar\theta\ \text{held fixed for }C\text{ updates}`, String.raw`\bar\theta\leftarrow\theta\ \text{every }C\text{ updates}`]),
    handoff: 'Holding targets steady still leaves consecutive trajectory gradients strongly correlated, motivating experience replay.',
  },
  {
    id: 'replay-why', kicker: 'Experience replay and ablation roles', title: 'Replay breaks temporal correlation while trading data freshness for experience reuse',
    paragraphs: [
      String.raw`Experience replay writes each observed transition $e_t=(S_t,A_t,R_{t+1},S_{t+1},D_{t+1})$ into a bounded FIFO buffer $\mathcal D$ and draws uniform random minibatches across stored history. Consecutive gradients no longer come from consecutive corridor steps, and informative transitions—such as reaching target $s_{18}$ or entering forbidden $s_{13}$—are reused multiple times.`,
      String.raw`The tradeoff is an off-policy mixture of older $\epsilon$-greedy behavior: a tiny buffer reverts to correlated online updates, while an oversized buffer lets stale transitions dominate. The four-way ablation table below shows why neither replay nor target freezing can substitute for the other.`,
    ],
    formulas: [String.raw`e_t=(S_t,A_t,R_{t+1},S_{t+1},D_{t+1})`, String.raw`(e_1,\ldots,e_B)\sim\operatorname{Uniform}(\mathcal D)`],
    example: example('Control variables across the four ablation configurations', String.raw`On one identical transition stream, toggling target freezing ($C=8$ vs $C=1$) and uniform replay ($p_{\mathrm{replay}}=1$ vs $0$) moves the diagnostics independently.`, ['Configuration', 'Target motion', 'Sample correlation', 'Experience reuse'], [
      [String.raw`Naive ($C=1$, sequential)`, 'Every step', 'High', String.raw`$1\times$`],
      [String.raw`Target only ($C=8$, sequential)`, 'Staircase', 'High', String.raw`$1\times$`],
      [String.raw`Replay only ($C=1$, shuffled)`, 'Every step', 'Low', 'Multiple'],
      [String.raw`Full DQN ($C=8$, shuffled)`, 'Staircase', 'Low', 'Multiple'],
    ]),
    handoff: 'Next, assemble all four clocks into the complete DQN loop before inspecting the four ablations frame by frame.',
  },
  {
    id: 'dqn-complete', kicker: 'Complete algorithm and four clocks', title: 'DQN coordinates four clocks: behavior, storage, online updates, and target syncs',
    paragraphs: [
      String.raw`Complete DQN runs four distinct schedules together: behavior selects actions with $\epsilon$-greedy online $Q_{\theta}$; storage appends every transition to buffer $\mathcal D$; optimization samples $B$ transitions, builds frozen targets $Y_i$ with $\bar\theta$, and steps $\theta$; synchronization copies $\bar\theta \leftarrow \theta$ only once every $C$ gradient updates.`,
      'Evaluation disables exploration and queries the online network directly. Monitoring training requires reading return, staircase sync jumps, sample correlation, and Q-value scale together, since a smooth loss curve can accompany self-consistent overestimation.',
    ],
    formulas: [String.raw`A_t\sim\epsilon\text{-greedy}(Q_\theta(S_t,\cdot))`, String.raw`\theta\leftarrow\theta-\alpha\nabla_\theta L(\theta)`, String.raw`\bar\theta\leftarrow\theta\quad\text{every }C\text{ updates}`],
    pseudocodeTitle: 'Deep Q-learning with experience replay and target network',
    pseudocode: [
      String.raw`Initialize online weights $\theta$, target weights $\bar\theta \leftarrow \theta$, and replay buffer $\mathcal D$`,
      String.raw`For each environment step: choose and execute $A_t$ via $\epsilon\text{-greedy}(Q_{\theta}(S_t,\cdot))$`,
      String.raw`  Append $(S_t,A_t,R_{t+1},S_{t+1},D_{t+1})$ to the FIFO replay buffer $\mathcal D$`,
      String.raw`  Uniformly sample a minibatch of $B$ transitions from $\mathcal D$`,
      String.raw`  Compute stop-gradient targets $Y_i = R_i + \gamma(1-D_i)\max_{a'} Q_{\bar\theta}(S_i',a')$ using $\bar\theta$`,
      String.raw`  Take one online gradient step $\theta \leftarrow \theta - \alpha\nabla_{\theta} L(\theta)$ on mean squared TD error`,
      String.raw`  Every $C$ online updates synchronize $\bar\theta \leftarrow \theta$; reset the environment on termination`,
    ],
    handoff: 'Value-based methods still recover policies indirectly via maximization; the next chapter optimizes action probabilities directly.',
  },
]

export const policyGradientDeepeningZh = [
  {
    id: 'objectives-and-occupancy', kicker: '先说清优化目标', title: '平均状态价值与平均奖励导向相似的策略梯度结构',
    paragraphs: [
      String.raw`策略参数 $\theta$ 不仅改变当前动作概率，还通过串联转移改变未来会访问哪些状态。折扣设定下常用起始分布下的期望回报 $J_{\gamma}(\theta)$ 定义目标，持续型任务则常用稳态访问分布下的平均奖励 $J_{\mathrm{avg}}(\theta)$。`,
      String.raw`两类目标的状态权重不同，不能把常数因子和分布混用；但对应的策略梯度定理都会把复杂的长期分布导数完整吸收进访问权重中，留下统一的结构：得分函数 $\nabla_{\theta}\log\pi_{\theta}$ 与动作价值 $q^{\pi_{\theta}}$ 的乘积。`,
    ],
    formulas: [String.raw`J_\gamma(\theta)=\mathbb E_{S_0\sim d_0,\pi_\theta}\left[\sum_{t=0}^{\infty}\gamma^tR_{t+1}\right]`, String.raw`J_{\mathrm{avg}}(\theta)=\sum_s d^{\pi_\theta}(s)\sum_a\pi_\theta(a\mid s)r(s,a)`],
    theorem: theorem('策略梯度定理避免显式微分状态访问分布。', String.raw`状态分布当然依赖 $\theta$；定理并不是忽略这一项，而是利用 Markov 转移与 Bellman 递推把它重新组织进访问权重与动作价值。`, [String.raw`\pi_\theta(a\mid s)\ \text{differentiable}`, String.raw`\sum_a\pi_\theta(a\mid s)=1`]),
    handoff: '把概率导数写成概率乘对数概率导数后，这个加权和才可以直接用策略样本估计。',
  },
  {
    id: 'theorem-to-samples', kicker: '一个可计算的后果', title: '同样的正优势在低概率动作上产生更大的改变量',
    paragraphs: [
      '前面的推导已经把策略梯度写成“对数概率敏感度 × 优势”。落到单个样本上，这条乘积立刻给出一个可检验的后果：被选动作当前越罕见，其对数概率对参数越敏感；如果该动作已经接近必然被选中，同样的正优势只会带来很小的 logit 修正。',
      '因此，单步更新的强弱不仅由回报好坏决定，还由当前策略已经分配给该动作多少概率决定。下表固定两动作 softmax 下的敏感度大小，随后实验会把同一机制扩展到三动作概率守恒与 12 回合策略演化。',
    ],
    formulas: [String.raw`\nabla_\theta\pi_\theta(a\mid s)=\pi_\theta(a\mid s)\nabla_\theta\log\pi_\theta(a\mid s)`, String.raw`\mathbb E_{A\sim\pi_\theta}[\nabla_\theta\log\pi_\theta(A\mid s)]=\nabla_\theta\sum_a\pi_\theta(a\mid s)=0`, String.raw`\nabla J(\theta)=\mathbb E[\nabla\log\pi_\theta(A_t\mid S_t)q^{\pi}(S_t,A_t)]`],
    example: example('同一正优势在不同当前概率下的作用', String.raw`在两动作 softmax 中，被选动作的得分敏感度大小为 $1-\pi$。`, ['被选动作概率', { latex: String.raw`1-\pi` }, '正优势引起的更新'], [
      [{ latex: '0.1' }, { latex: '0.9' }, '较强上调'],
      [{ latex: '0.5' }, { latex: '0.5' }, '中等上调'],
      [{ latex: '0.9' }, { latex: '0.1' }, '较弱上调'],
    ]),
    handoff: '要把这个单样本贡献变成可运行算法，还需要用实际轨迹回报替代未知的动作价值。',
  },
  {
    id: 'reinforce-complete', kicker: '完整算法', title: 'REINFORCE 先收集轨迹，再反向计算各时刻的未来回报',
    paragraphs: [
      String.raw`时刻 $t$ 的动作只能由它之后的奖励评价，不能把此前已经发生的奖励放进权重。整条回合结束后从末尾反向递推 $G_t = R_{t+1} + \gamma G_{t+1}$，即可在线性时间内得到每个决策点的未来回报（reward-to-go）。`,
      '每个时间步都贡献一项得分函数乘去基线后的回报权重。按整条回合累计后再更新参数，可以保证整段数据来自同一版策略；若在回合中途频繁改参，后半段轨迹就不再服从旧策略，估计契约必须相应调整。',
    ],
    formulas: [String.raw`G_t=R_{t+1}+\gamma G_{t+1}`, String.raw`\theta\leftarrow\theta+\alpha\sum_{t=0}^{T-1}\gamma^t\nabla_\theta\log\pi_\theta(A_t\mid S_t)\left(G_t-b(S_t)\right)`],
    pseudocodeTitle: 'Episodic REINFORCE with baseline',
    pseudocode: [
      String.raw`用当前策略 $\pi_{\theta}$ 在环境中采集一条完整回合 $(S_0,A_0,R_1,\ldots,S_T)$`,
      String.raw`初始化累积回报 $G \leftarrow 0$ 与梯度累加器 $g \leftarrow 0$，从 $t=T-1$ 反向遍历至 $0$`,
      String.raw`  更新该时刻的未来回报 $G \leftarrow R_{t+1} + \gamma G$`,
      String.raw`  计算去基线后的相对权重 $\widehat A_t \leftarrow G - b(S_t)$`,
      String.raw`  累加策略梯度贡献 $g \leftarrow g + \gamma^t \nabla_{\theta}\log\pi_{\theta}(A_t\mid S_t)\widehat A_t$`,
      String.raw`回合结束后执行一次策略参数上升 $\theta \leftarrow \theta + \alpha g$`,
      String.raw`若状态基线 $b(S_t)$ 带参数，另用均方回归损失更新基线参数`,
    ],
    handoff: '下一章用可学习的 Critic 估计状态价值，把回合结束后的延迟回报换成每一步都能用的低方差优势近似。',
  },
]

export const policyGradientDeepeningEn = [
  {
    id: 'objectives-and-occupancy', kicker: 'Define the objective first', title: 'Average value and average reward yield similar policy-gradient structure',
    paragraphs: [
      String.raw`Policy parameters $\theta$ shift both immediate action probabilities and future state occupancy. Discounted settings define $J_{\gamma}(\theta)$ from a start distribution, while continuing tasks use stationary average reward $J_{\mathrm{avg}}(\theta)$.`,
      String.raw`Their state weights differ and should not be conflated, yet both policy-gradient theorems fold occupancy derivatives into visitation weights, leaving the same product of score function $\nabla_{\theta}\log\pi_{\theta}$ and action value $q^{\pi_{\theta}}$.`,
    ],
    formulas: [String.raw`J_\gamma(\theta)=\mathbb E_{S_0\sim d_0,\pi_\theta}\left[\sum_{t=0}^{\infty}\gamma^tR_{t+1}\right]`, String.raw`J_{\mathrm{avg}}(\theta)=\sum_s d^{\pi_\theta}(s)\sum_a\pi_\theta(a\mid s)r(s,a)`],
    theorem: theorem('The policy-gradient theorem avoids explicitly differentiating state occupancy.', String.raw`Occupancy still depends on $\theta$; Markov transitions and Bellman recursions reorganize that derivative into visitation weights and action values.`, [String.raw`\pi_\theta(a\mid s)\ \text{differentiable}`, String.raw`\sum_a\pi_\theta(a\mid s)=1`]),
    handoff: 'The log-derivative identity turns the weighted sum into an expectation that policy samples can estimate.',
  },
  {
    id: 'theorem-to-samples', kicker: 'A computable consequence', title: 'The same positive advantage changes a rare action more than an already likely one',
    paragraphs: [
      'The derivation expresses the policy gradient as log-probability sensitivity times advantage. For one sample, a selected action with low probability has large sensitivity, whereas an already near-certain action receives a small logit nudge from the same positive advantage.',
      'Update magnitude therefore depends on both outcome quality and current probability mass. The table fixes that two-action consequence before the lab expands it to three-action conservation and 12-episode policy evolution.',
    ],
    formulas: [String.raw`\nabla_\theta\pi_\theta(a\mid s)=\pi_\theta(a\mid s)\nabla_\theta\log\pi_\theta(a\mid s)`, String.raw`\mathbb E_{A\sim\pi_\theta}[\nabla_\theta\log\pi_\theta(A\mid s)]=\nabla_\theta\sum_a\pi_\theta(a\mid s)=0`, String.raw`\nabla J(\theta)=\mathbb E[\nabla\log\pi_\theta(A_t\mid S_t)q^{\pi}(S_t,A_t)]`],
    example: example('The same positive advantage at different current probabilities', String.raw`For a two-action softmax, the selected action’s score magnitude is $1-\pi$.`, ['Selected probability', { latex: String.raw`1-\pi` }, 'Positive-advantage effect'], [
      [{ latex: '0.1' }, { latex: '0.9' }, 'Strong increase'],
      [{ latex: '0.5' }, { latex: '0.5' }, 'Medium increase'],
      [{ latex: '0.9' }, { latex: '0.1' }, 'Small increase'],
    ]),
    handoff: 'A runnable algorithm still needs to replace the unknown action value with the observed trajectory return.',
  },
  {
    id: 'reinforce-complete', kicker: 'Complete algorithm', title: 'REINFORCE collects a trajectory before computing returns backward',
    paragraphs: [
      String.raw`Action $t$ should be evaluated only by subsequent rewards, never earlier ones. After termination, a backward recursion $G_t = R_{t+1} + \gamma G_{t+1}$ computes every reward-to-go in linear time.`,
      'Each step adds score times baseline-centered return. Applying one update after the episode keeps all samples on-policy under one policy version.',
    ],
    formulas: [String.raw`G_t=R_{t+1}+\gamma G_{t+1}`, String.raw`\theta\leftarrow\theta+\alpha\sum_{t=0}^{T-1}\gamma^t\nabla_\theta\log\pi_\theta(A_t\mid S_t)\left(G_t-b(S_t)\right)`],
    pseudocodeTitle: 'Episodic REINFORCE with baseline',
    pseudocode: [
      String.raw`Collect one complete episode $(S_0,A_0,R_1,\ldots,S_T)$ under current $\pi_{\theta}$`,
      String.raw`Initialize return $G \leftarrow 0$ and gradient accumulator $g \leftarrow 0$; loop backward $t = T-1 \ldots 0$`,
      String.raw`  Update reward-to-go $G \leftarrow R_{t+1} + \gamma G$`,
      String.raw`  Compute centered weight $\widehat A_t \leftarrow G - b(S_t)$`,
      String.raw`  Accumulate policy gradient $g \leftarrow g + \gamma^t \nabla_{\theta}\log\pi_{\theta}(A_t\mid S_t)\widehat A_t$`,
      String.raw`After the episode commit policy ascent $\theta \leftarrow \theta + \alpha g$`,
      String.raw`If the state baseline $b(S_t)$ is parameterized, update it with a separate regression loss`,
    ],
    handoff: 'A learned critic next turns the baseline into a per-transition advantage estimate.',
  },
]

export const actorCriticDeepeningZh = [
  {
    id: 'qac-to-baseline', kicker: '先看最直接的方案', title: '动作价值仍会把状态层面的共同波动带入策略更新',
    paragraphs: [
      '最直接的 Q Actor–Critic 让 Critic 估计当前动作价值，再用它缩放 Actor 更新。这比等待整条回合结束更及时，但同一状态下所有动作共享的回报基准起伏依然会进入策略梯度。',
      '真正需要回答的是“这个动作是否比该状态下的通常选择更好”。减去只依赖状态、与当前动作无关的参照值，既能消去共同偏移，又严格保持期望更新方向；下面的推导证明这种抵消并直接引出单步时序差分误差。',
    ],
    formulas: [String.raw`\mathbb E[\nabla\log\pi(A\mid S)b(S)\mid S]=0`, String.raw`A^{\pi}(s,a)=q^{\pi}(s,a)-v^{\pi}(s)`, String.raw`b^*(s)=\frac{\mathbb E[q^{\pi}(s,A)\lVert\nabla\log\pi(A\mid s)\rVert^2]}{\mathbb E[\lVert\nabla\log\pi(A\mid s)\rVert^2]}`],
    theorem: theorem('任何不依赖当前动作的基线都严格保持策略梯度期望。', '证明只依赖动作概率之和恒为 1；基线可以依赖状态或时间，但一旦依赖当前动作 $A_t$，期望抵消一般不再成立。', [String.raw`b\perp A_t\mid S_t`, String.raw`\sum_a\pi_\theta(a\mid s)=1`]),
    handoff: '问题已经转化为：怎样构造一个不引入偏移、又能在每一步得到的相对价值信号。',
  },
  {
    id: 'a2c-shared-transition', kicker: '把推导落实为一步训练', title: '一次环境转移先修正价值估计，再更新动作概率',
    paragraphs: [
      '推导得到的时序差分误差可以直接落成每步执行顺序：观察一条环境转移，先构造带终止掩码的一步目标，算出标量误差后分别更新 Critic 与 Actor。每个环境步从此都能产生训练信号，不再受限于回合终止。',
      '需要特别区分的是：两者共享的只是误差这个数值，而不是同一条反向传播图。Critic 对状态价值求导，Actor 对被选动作的对数概率求导，并把误差视作不传梯度的常数权重；若混用梯度路径，Actor 的损失就会意外扭曲 Critic 的价值估计。',
    ],
    formulas: [String.raw`\delta_t=R_{t+1}+\gamma V_\phi(S_{t+1})-V_\phi(S_t)`, String.raw`\mathbb E[\delta_t\mid S_t=s,A_t=a]=A^{\pi}(s,a)\quad\text{if }V_\phi=v^{\pi}`, String.raw`\Delta\phi\propto\delta_t\nabla_\phi V_\phi(S_t),\qquad\Delta\theta\propto\operatorname{stopgrad}(\delta_t)\nabla_\theta\log\pi_\theta(A_t\mid S_t)`],
    pseudocodeTitle: 'One-step Advantage Actor–Critic (A2C)',
    pseudocode: [
      String.raw`初始化 Actor 参数 $\theta$ 与 Critic 参数 $\phi$，设定相容步长 $\alpha_{\pi}, \alpha_v$`,
      String.raw`在状态 $S$ 按 $\pi_{\theta}(\cdot\mid S)$ 采样动作 $A$，执行并观察 $R, S', D$`,
      String.raw`构造带终止掩码的一步目标 $y \leftarrow R + \gamma(1-D)V_{\phi}(S')$`,
      String.raw`计算单步时序差分误差 $\delta \leftarrow y - V_{\phi}(S)$`,
      String.raw`更新 Critic：$\phi \leftarrow \phi + \alpha_v \delta \nabla_{\phi} V_{\phi}(S)$`,
      String.raw`更新 Actor（截断误差梯度）：$\theta \leftarrow \theta + \alpha_{\pi} \operatorname{stopgrad}(\delta)\nabla_{\theta}\log\pi_{\theta}(A\mid S)$`,
      String.raw`令 $S \leftarrow S'$；若 $D=1$ 则重置环境并开始下一回合`,
    ],
    handoff: '当一次收集多步转移时，多步回报可以在偏差与方差之间连续调节。',
  },
  {
    id: 'off-policy-and-deterministic', kicker: '超出基础 A2C', title: '行为策略修正与确定性策略梯度针对不同问题',
    paragraphs: [
      String.raw`若训练动作来自行为策略 $b$ 而非当前策略 $\pi_{\theta}$，随机策略梯度需要乘上重要性概率比 $\rho_t = \pi_{\theta}(A_t\mid S_t)/b(A_t\mid S_t)$ 校正分布。然而大比率会成倍放大方差，因此限制新旧策略偏离成为现代策略优化的核心。`,
      String.raw`在连续动作控制中，确定性策略直接输出动作 $\mu_{\theta}(s)$，不再采样离散分布，而是把 Critic 对动作的导数经策略雅可比矩阵反传给 Actor；它仍依赖充分探索的策略外数据与准确的连续动作价值估计。`,
    ],
    formulas: [String.raw`\rho_t=\frac{\pi_\theta(A_t\mid S_t)}{b(A_t\mid S_t)}`, String.raw`\nabla_\theta J\approx\mathbb E_{s\sim d^b}\left[\nabla_\theta\mu_\theta(s)\nabla_a Q^{\mu}(s,a)\rvert_{a=\mu_\theta(s)}\right]`],
    example: example('三种 Actor 更新接口的数据契约比较', '三种方法依赖不同的数据契约，不能只替换单行公式。', ['方法', 'Actor 权重或梯度来源', '数据与模型前提'], [
      ['On-policy A2C', String.raw`一步 TD 误差 $\delta_t$ 近似优势`, '当前策略实时采样'],
      ['Off-policy stochastic AC', String.raw`重要性加权优势 $\rho_t\delta_t$`, '行为策略概率已知且覆盖目标策略'],
      ['Deterministic AC', String.raw`Critic 的动作梯度 $\nabla_a Q^{\mu}$`, '连续动作与可微动作价值网络'],
    ]),
    handoff: 'PPO 从同策略 Actor–Critic 出发，用旧策略概率比约束同一批数据上的多轮更新。',
  },
]

export const actorCriticDeepeningEn = [
  {
    id: 'qac-to-baseline', kicker: 'Begin with the direct approach', title: 'Weighting by action value still passes shared fluctuations to the actor',
    paragraphs: [
      'Basic Q Actor–Critic uses a learned action-value estimate to scale actor updates. Although timelier than episodic returns, reward shifts shared across every action at a state still enter the gradient.',
      'The decisive comparison is whether an action beats the usual outcome at that state. Subtracting an action-independent state reference removes shared fluctuations without biasing expectation; the derivation below proves cancellation and links directly to one-step TD error.',
    ],
    formulas: [String.raw`\mathbb E[\nabla\log\pi(A\mid S)b(S)\mid S]=0`, String.raw`A^{\pi}(s,a)=q^{\pi}(s,a)-v^{\pi}(s)`, String.raw`b^*(s)=\frac{\mathbb E[q^{\pi}(s,A)\lVert\nabla\log\pi(A\mid s)\rVert^2]}{\mathbb E[\lVert\nabla\log\pi(A\mid s)\rVert^2]}`],
    theorem: theorem('Any baseline independent of the current action preserves expected policy gradient.', String.raw`The proof relies only on action probabilities summing to one; once a baseline depends on the current action $A_t$, cancellation generally fails.`, [String.raw`b\perp A_t\mid S_t`, String.raw`\sum_a\pi_\theta(a\mid s)=1`]),
    handoff: 'The remaining problem is to construct an unbiased relative-value signal available after every transition.',
  },
  {
    id: 'a2c-shared-transition', kicker: 'Turn the derivation into one training step', title: 'One transition corrects the critic before handing the same error to the actor',
    paragraphs: [
      'The TD error maps directly to a per-step training loop: observe one transition, build a termination-masked bootstrap target, compute the scalar error, and update both networks separately. Every environment step now yields a learning signal.',
      'Only the scalar error is shared, never the differentiation graph. The critic differentiates state value while the actor differentiates sampled log probability with a stop-gradient weight; mixing those paths would let actor loss distort value estimation.',
    ],
    formulas: [String.raw`\delta_t=R_{t+1}+\gamma V_\phi(S_{t+1})-V_\phi(S_t)`, String.raw`\mathbb E[\delta_t\mid S_t=s,A_t=a]=A^{\pi}(s,a)\quad\text{if }V_\phi=v^{\pi}`, String.raw`\Delta\phi\propto\delta_t\nabla_\phi V_\phi(S_t),\qquad\Delta\theta\propto\operatorname{stopgrad}(\delta_t)\nabla_\theta\log\pi_\theta(A_t\mid S_t)`],
    pseudocodeTitle: 'One-step Advantage Actor–Critic (A2C)',
    pseudocode: [
      String.raw`Initialize actor weights $\theta$, critic weights $\phi$, and compatible rates $\alpha_{\pi}, \alpha_v$`,
      String.raw`At state $S$ sample $A \sim \pi_{\theta}(\cdot\mid S)$ and observe $R, S', D$`,
      String.raw`Build the termination-masked target $y \leftarrow R + \gamma(1-D)V_{\phi}(S')$`,
      String.raw`Compute the one-step TD error $\delta \leftarrow y - V_{\phi}(S)$`,
      String.raw`Update critic: $\phi \leftarrow \phi + \alpha_v \delta \nabla_{\phi} V_{\phi}(S)$`,
      String.raw`Update actor (stop-gradient on $\delta$): $\theta \leftarrow \theta + \alpha_{\pi}\operatorname{stopgrad}(\delta)\nabla_{\theta}\log\pi_{\theta}(A\mid S)$`,
      String.raw`Set $S \leftarrow S'$; reset the environment whenever $D=1$`,
    ],
    handoff: 'Multi-step rollouts trade smoothly between bias and variance.',
  },
  {
    id: 'off-policy-and-deterministic', kicker: 'Beyond basic A2C', title: 'Off-policy correction and deterministic policy gradient solve different problems',
    paragraphs: [
      String.raw`When actions come from behavior policy $b$ instead of $\pi_{\theta}$, stochastic policy gradients multiply by importance ratio $\rho_t = \pi_{\theta}(A_t\mid S_t)/b(A_t\mid S_t)$. Large ratios amplify variance and motivate constrained policy movement.`,
      String.raw`In continuous control, a deterministic actor outputs $\mu_{\theta}(s)$ directly and backpropagates the critic’s action gradient through the policy Jacobian, requiring off-policy coverage and a differentiable action-value critic.`,
    ],
    formulas: [String.raw`\rho_t=\frac{\pi_\theta(A_t\mid S_t)}{b(A_t\mid S_t)}`, String.raw`\nabla_\theta J\approx\mathbb E_{s\sim d^b}\left[\nabla_\theta\mu_\theta(s)\nabla_a Q^{\mu}(s,a)\rvert_{a=\mu_\theta(s)}\right]`],
    example: example('Data-contract comparison across three actor-update interfaces', 'Their sampling contracts differ; one cannot swap a single line in isolation.', ['Method', 'Actor weight or gradient source', 'Data and model contract'], [
      ['On-policy A2C', String.raw`One-step TD error $\delta_t$`, 'Fresh current-policy rollout'],
      ['Off-policy stochastic AC', String.raw`Importance-weighted $\rho_t\delta_t$`, 'Known behavior probabilities covering target'],
      ['Deterministic AC', String.raw`Critic action gradient $\nabla_a Q^{\mu}$`, 'Continuous actions and differentiable Q'],
    ]),
    handoff: 'PPO starts from on-policy Actor–Critic and constrains multiple updates on one old-policy rollout batch.',
  },
]
