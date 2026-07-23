const step = (id, rule, latex, short, detail, assumptions = [], symbols = []) => ({ id, rule, latex, short, detail, assumptions, symbols })
const section = (id, kicker, title, paragraphs, formulas = []) => ({ type: 'section', id, kicker, title, paragraphs, formulas })
const prose = (id, paragraphs, formulas = []) => ({ type: 'prose', id, paragraphs, formulas })
const derivation = (id, kicker, title, intro, steps, level = 'major') => ({ type: 'derivation', id, kicker, title, intro, steps, level })
const example = (id, kicker, title, intro, columns, rows, note) => ({ type: 'example', id, kicker, title, intro, columns, rows, note })
const theorem = (id, kicker, title, claim, paragraphs, conditions) => ({ type: 'theorem', id, kicker, title, claim, paragraphs, conditions })
const algorithm = (id, kicker, title, intro, steps, note) => ({ type: 'algorithm', id, kicker, title, intro, steps, note })
const comparison = (id, kicker, title, intro, columns, rows, note) => ({ type: 'comparison', id, kicker, title, intro, columns, rows, note })
const experiment = (id) => ({ type: 'experiment', id })
const latex = (value) => ({ latex: value })

const zh = {
  prerequisite: '前置：Monte Carlo 回报样本、期望与基本梯度',
  eyebrow: '第 7 章 · 增量估计与随机逼近',
  title: '噪声观测下的增量估计与随机逼近',
  intro: '上一章用完整回合的回报（return）估计动作价值。随着回合不断增加，重新保存并平均全部历史既没有必要，也无法支持持续到达的数据。本章从样本均值的增量计算出发，说明步长怎样决定算法的记忆，再把同一更新结构推广到无法直接计算的期望方程与随机梯度。',
  summaryTitle: '随机逼近用受控的随机误差换取持续更新',
  figure: '交互图 07.1 · 随机逼近更新显微镜',
  instruction: '让两种估计器读取同一观测流，逐步比较残差、修正量与历史权重',
  question: '步长和批量大小怎样改变稳定性与追踪能力',
  experimentIntro: '先保持目标不变，预测哪种步长会在后期更稳定；再让目标中途漂移，判断哪种估计器能更快放下旧数据。两条轨迹读取完全相同的观测，因此差异只来自步长和批量大小。',
  interpretation: '目标固定时，衰减步长把越来越多的历史样本平均起来，后期波动因而逐渐减小。目标漂移后，这些旧样本也会拖慢响应。固定步长持续提高近期样本的相对权重，能够追踪变化，却会在固定目标附近保留稳态波动。增大批量可以降低一次更新中的观测噪声，但每次更新也会消耗更多样本。',
  summary: [
    '样本均值可以精确改写为旧估计加一次残差修正，因此不必保存全部历史。',
    '步长不仅控制单次移动幅度，也规定旧样本被遗忘的速度。',
    'Robbins–Monro 用带噪声的函数观测求解期望方程；方向、总移动与累计噪声共同决定收敛。',
    '随机梯度下降是 Robbins–Monro 在期望梯度上的应用；批量大小决定每次更新使用多少梯度证据。',
    '下一章将用一次环境转移构造 Bellman 残差样本，由此得到时间差分更新。',
  ],
  explorer: { cue: '选择任意一步，依次核对观测、旧估计、残差、步长、修正量和新估计；随后查看历史权重，不要只比较最后一个点。' },
  articleFlow: [
    section('incremental-problem', '增量估计', '一次新观测，只需一次更新', [
      '上一章的 Monte Carlo 方法把每个完整回合的回报看成一个动作价值样本。样本全部收集完以后再求平均当然可行，但在线学习面对的是持续到达的数据：第 k 个样本到达时，如果还要重新读取前 k 个样本，计算和存储就会随着经验一同增长。',
      ['因此，这里先解决一个具体问题。设', latex(String.raw`w_k`), '已经概括前', latex(String.raw`k-1`), '个样本；新样本', latex(String.raw`x_k`), '到达后，只读取它一次，就应当得到包含全部', latex(String.raw`k`), '个样本的新均值。'],
    ]),
    derivation('incremental-mean', '增量均值', '样本均值怎样变成一次误差修正', '下面的等式没有引入近似。它只是把批量平均重新排列，使历史信息全部保留在当前估计中。', [
      step('old-mean', '写出当前估计', String.raw`w_k=\frac{1}{k-1}\sum_{i=1}^{k-1}x_i`, [latex(String.raw`w_k`), '是前', latex(String.raw`k-1`), '个样本的均值。'], '在下一次更新前，整段历史可以由这个标量概括。', [String.raw`k\ge 2`], [[String.raw`w_k`, '前 k-1 个样本的均值']]),
      step('new-mean', '把新样本加入总和', String.raw`w_{k+1}=\frac{1}{k}\sum_{i=1}^{k}x_i=\frac{1}{k}\left(\sum_{i=1}^{k-1}x_i+x_k\right)`, '新旧均值之间唯一新增的信息是最后一个样本。', '把它单独拆出，才可能复用已有估计。', [], [[String.raw`x_k`, '刚到达的第 k 个样本']]),
      step('reuse-old', '用当前估计替换历史求和', String.raw`w_{k+1}=\frac{1}{k}\left((k-1)w_k+x_k\right)`, ['前', latex(String.raw`k-1`), '项的全部影响已经包含在', latex(String.raw`w_k`), '中。'], '更新所需的历史由一串样本缩减为一个当前状态。'),
      step('correction-form', '整理为残差修正', String.raw`w_{k+1}=w_k+\frac{1}{k}\left(x_k-w_k\right)`, '新估计等于旧估计加一次样本残差修正。', ['残差', latex(String.raw`x_k-w_k`), '决定移动方向，步长', latex(String.raw`1/k`), '决定这条新证据能够移动估计多少。'], [], [[String.raw`x_k-w_k`, '新样本相对当前估计的残差'], [String.raw`1/k`, '精确复现样本均值的步长']]),
    ], 'embedded'),
    example('mean-check', '计算核对', '三次观测的增量均值', '从 0 开始依次观察 2、8、2。每一行都沿用刚才的同一递推。', ['样本', '更新前', '残差', '步长', '更新后'], [
      [latex('2'), latex('0'), latex('2-0=2'), latex('1'), latex('2')],
      [latex('8'), latex('2'), latex('8-2=6'), latex(String.raw`\frac{1}{2}`), latex('5')],
      [latex('2'), latex('5'), latex('2-5=-3'), latex(String.raw`\frac{1}{3}`), latex('4')],
    ], ['最终结果', latex('4'), '与一次性计算', latex(String.raw`\frac{2+8+2}{3}`), '完全相同。增量形式改变的是存储和更新时间，而不是估计目标。']),
    prose('step-size-memory', [
      ['步长', latex(String.raw`1/k`), '精确恢复算术平均，同时也强制所有历史样本最终获得相同权重。如果被估计的期望始终不变，这种不断扩大的平均可以逐渐消除噪声；如果策略或环境正在变化，久远样本仍然占据权重，估计便会落后于当前目标。'],
      ['把', latex(String.raw`1/k`), '替换为一般正步长', latex(String.raw`\alpha_k`), '以后，更新仍然在当前估计与新观测之间插值，但历史权重不再固定。固定步长使权重按时间指数衰减，能够持续响应新数据；逐渐减小的步长则降低后期随机波动，更适合估计一个固定期望。'],
      '这两种行为对应不同任务，不存在脱离任务的最优步长。真正需要判断的是：当前目标是否稳定，以及学习器应当多快忘记旧证据。',
    ], [
      { role: 'support', latex: String.raw`w_{k+1}=w_k+\alpha_k(x_k-w_k)=(1-\alpha_k)w_k+\alpha_kx_k` },
      { role: 'support', latex: String.raw`\alpha_k\equiv\alpha\quad\Longrightarrow\quad w_{k+1}=(1-\alpha)^kw_1+\sum_{i=1}^{k}\alpha(1-\alpha)^{k-i}x_i` },
    ]),
    derivation('root-abstraction', '随机逼近', '用样本残差代替无法计算的期望残差', '一般步长解决了怎样更新，却还只处理“直接观察一个随机变量并估计其均值”的问题。要把这套方法用于更多任务，先不引入新算法，而是重新解释刚才的均值：目标值其实是一个期望方程的根，每个样本只提供这个方程残差的一次随机观测。', [
      step('mean-root', '把均值写成残差为零', String.raw`w^*=\mathbb E[X]\quad\Longleftrightarrow\quad g(w^*)=w^*-\mathbb E[X]=0`, ['估计均值等价于寻找使', latex('g'), '等于零的', latex(String.raw`w^*`), '。'], '这里没有改变问题，只是把“目标值是多少”改写成“哪个位置的期望残差为零”。', [], [[String.raw`g(w)=w-\mathbb E[X]`, '均值问题的真实残差函数']]),
      step('mean-noisy-residual', '用一个样本观察均值残差', String.raw`\widetilde g(w_k,X_k)=w_k-X_k,\qquad\mathbb E[\widetilde g(w_k,X_k)\mid w_k]=g(w_k)`, ['无法直接计算', latex(String.raw`\mathbb E[X]`), '时，样本', latex(String.raw`X_k`), '让', latex(String.raw`w_k-X_k`), '成为真实残差的一次无偏观测。'], ['开头的更新', latex(String.raw`w_{k+1}=w_k-a_k(w_k-X_k)`), '因此可以读成：沿一次可观测残差的反方向移动。'], ['样本条件独立且期望存在'], [[String.raw`\widetilde g`, '由数据得到的残差观测']]),
      step('root-target', '把同一结构推广到未知方程', String.raw`g(w^*)=0`, ['现在让', latex('g'), '表示任意无法直接计算、但根附近方向稳定的期望残差。'], '均值不再是突然被替换掉的例子，而是一般求根问题的第一个具体实例。', ['根存在且方向稳定'], [[String.raw`g`, '无法直接计算的真实残差函数']]),
      step('noisy-residual', '保留可由数据取得的观测', String.raw`\widetilde g(w_k,\eta_k)=g(w_k)+\eta_k`, ['每一步仍然只要求一次', latex(String.raw`g(w_k)`), '的随机观测。'], '单次方向可以出错；给定已有历史后，零均值且方差受控的噪声不会长期改变平均方向。', [String.raw`\mathbb E[\eta_k\mid\mathcal H_k]=0`], [[String.raw`\mathcal H_k`, '第 k 步以前可用的全部历史']]),
      step('rm-update', '沿观测残差继续修正', String.raw`w_{k+1}=w_k-a_k\widetilde g(w_k,\eta_k)`, ['均值递推中的', latex(String.raw`w_k-X_k`), '被更一般的观测残差替代，更新语法没有改变。'], '只要真实残差在根两侧平均指向根，合适的步长就能逐渐抵消随机方向错误。', [String.raw`a_k>0`], [[String.raw`a_k`, '第 k 步的正步长']]),
    ]),
    example('root-check', '方向核对', '线性方程上的无噪声迭代', [latex(String.raw`g(w)=w-10`), '的根是 10。取初值 20、步长 0.5，并暂时去掉噪声。'], [latex('k'), latex(String.raw`w_k`), latex(String.raw`g(w_k)`), latex(String.raw`w_{k+1}`)], [
      [latex('1'), latex('20'), latex('10'), latex('15')],
      [latex('2'), latex('15'), latex('5'), latex('12.5')],
      [latex('3'), latex('12.5'), latex('2.5'), latex('11.25')],
    ], '没有噪声时，残差与到根的距离都逐次减半；加入噪声以后，收敛不再要求每一步都更接近根。'),
    algorithm('rm-loop', '命名算法', 'Robbins–Monro 随机求根', ['算法不需要知道', latex('g'), '的解析式或导数，只需要在当前', latex(String.raw`w_k`), '处取得一次受控的随机观测。'], [
      ['选择初值', latex(String.raw`w_1`), '和正步长序列', latex(String.raw`\{a_k\}`)],
      ['在第', latex('k'), '步取得一次观测', latex(String.raw`\widetilde g(w_k,\eta_k)`)],
      ['计算随机方向', latex(String.raw`d_k=-\widetilde g(w_k,\eta_k)`)],
      ['更新', latex(String.raw`w_{k+1}=w_k+a_kd_k`)],
      ['记录残差与估计，令', latex(String.raw`k\leftarrow k+1`), '并继续'],
    ], '随机算法不能只凭最后一个点判断效果；还应比较不同随机种子、后期波动和残差分布。'),
    theorem('rm-conditions', '收敛结论', '方向、移动能力与噪声必须同时受控', '如果根稳定且唯一，步长满足 Robbins–Monro 条件，噪声在给定历史后均值为零且方差有限，那么迭代以概率 1 收敛到根。', [
      '导数上下界保证根两侧的平均残差指向同一个根，同时避免局部方向无限放大。',
      '步长总和发散，使算法从任意有限初值出发都保留足够的总移动；步长平方和收敛，则限制随机扰动累积的方差。',
      '固定步长违反平方和收敛条件，通常只会在根附近形成稳态波动。它没有获得渐近收敛，却换来了追踪变化目标的能力。',
    ], [
      { latex: String.raw`0<c_1\le g'(w)\le c_2`, explanation: '根唯一、方向稳定且斜率有界' },
      { latex: String.raw`\sum_{k=1}^{\infty}a_k=\infty,\qquad\sum_{k=1}^{\infty}a_k^2<\infty`, explanation: '总移动不受限，同时累计噪声受控' },
      { latex: String.raw`\mathbb E[\eta_k\mid\mathcal H_k]=0,\qquad\mathbb E[\eta_k^2\mid\mathcal H_k]<\infty`, explanation: '观测噪声平均不偏且方差有限' },
      { latex: String.raw`a_k=1/k`, explanation: '同时满足两条求和条件的典型步长' },
    ]),
    prose('optimization-handoff', [
      '到这里，随机求根已经能够处理由期望定义、却无法直接计算残差的方程。接下来引入优化并不是更换主题：当价值估计由一组参数表示时，学习常被写成“选择参数，使平均预测误差最小”。仍以贯穿本章的均值问题为例，就能看到求根与优化怎样落在同一次更新上。',
    ]),
    example('mean-as-sgd', '同一个均值问题', '把均值写成平方损失', '让参数 w 预测随机变量 X，并用平方误差衡量预测。最小化平均平方误差，得到的最优参数仍然是 X 的均值。', ['推导位置', '数学表达'], [
      ['期望损失', latex(String.raw`J(w)=\mathbb E\!\left[\frac12\lVert w-X\rVert^2\right]`)],
      ['一阶条件', latex(String.raw`\nabla_wJ(w)=\mathbb E[w-X]=0`)],
      ['最优解', latex(String.raw`w^*=\mathbb E[X]`)],
      ['单样本梯度', latex(String.raw`\nabla_wf(w_k,X_k)=w_k-X_k`)],
      ['参数更新', latex(String.raw`w_{k+1}=w_k-a_k(w_k-X_k)`)],
    ], '最后一行就是开头的增量均值。残差 w_k-X_k 现在也有了第二种含义：它是平方损失在一个样本上的梯度。'),
    prose('gradient-generalization', [
      ['平方损失说明了梯度为何会出现在这里：样本梯度', latex(String.raw`w_k-X_k`), '与均值问题的随机残差完全相同。把特定的平方损失换成一般样本损失', latex(String.raw`f(w,X)`), '以后，寻找最小平均损失仍然等价于寻找期望梯度的根。'],
    ]),
    derivation('sgd-as-rm', '随机梯度下降', '从平方损失推广到一般期望损失', '下面只做一次推广：把平方误差的样本梯度换成一般损失的样本梯度。只要它在平均意义上等于真实梯度，就可以继续使用刚才的随机求根更新。', [
      step('expected-objective', '定义期望损失', String.raw`\min_w J(w),\qquad J(w)=\mathbb E[f(w,X)]`, '目标函数对随机变量 X 的分布取平均。', '直接梯度下降需要计算这个期望或获得完整数据分布。'),
      step('gradient-root', '把最优条件写成求根', String.raw`g(w)=\nabla_wJ(w)=\mathbb E[\nabla_wf(w,X)]=0`, '最优点的期望梯度为零。', '在梯度与期望可交换，并满足适当凸性时，这个根对应全局最优解。'),
      step('sample-gradient', '用一个样本观测梯度', String.raw`\widetilde g(w_k,X_k)=\nabla_wf(w_k,X_k)`, '样本梯度一般不等于真实梯度，但其条件期望等于真实梯度。', '一次廉价的随机方向由此替代昂贵的完整期望。', [String.raw`X_k\ \text{iid}`]),
      step('sgd-update', '代入随机逼近更新', String.raw`w_{k+1}=w_k-a_k\nabla_wf(w_k,X_k)`, '这就是随机梯度下降。', '它不是另一套孤立公式，而是 Robbins–Monro 方法作用在期望梯度上的结果。'),
    ]),
    prose('batch-motivation', [
      '上面的 SGD 每次只用一个样本，单步便宜，却会继承单样本梯度的较大波动；若每次都使用完整数据集，方向更稳定，计算代价却显著增加。在这两个极端之间，可以平均 m 个样本的梯度。小批量不是额外出现的新目标，而是对“每一步使用多少证据”的折中。',
    ]),
    comparison('gradient-family', '证据数量的折中', '单样本、小批量与完整批量', '三种方法优化同一个目标，只是每次更新用不同数量的样本估计梯度。比较收敛速度时，必须同时说明每步样本数、更新次数与总计算量。', ['方法', '每步使用的证据', '随机性', '主要代价'], [
      ['批量梯度下降（BGD）', '完整数据集的平均梯度', '最低', '每次更新昂贵'],
      ['小批量梯度下降（MBGD）', '随机批量的平均梯度', '随批量增大而降低', '计算与稳定性的折中'],
      ['随机梯度下降（SGD）', '单个样本梯度', '最高', '单步便宜、更新频繁'],
    ], '较大的批量通常给出更稳定的方向，但在固定样本预算下也会减少参数更新次数。'),
    algorithm('sgd-loop', '训练循环', '从单样本 SGD 到小批量更新', '用 m 个样本的平均梯度替代单样本梯度，其余更新过程保持不变。', [
      ['初始化参数', latex(String.raw`w_1`), '，选择步长调度和批量大小', latex('m')],
      ['在第', latex('k'), '步抽取', latex('m'), '个样本组成索引集', latex(String.raw`I_k`)],
      ['计算平均样本梯度', latex(String.raw`\widehat g_k=\frac{1}{m}\sum_{j\in I_k}\nabla f(w_k,x_j)`)],
      ['更新', latex(String.raw`w_{k+1}=w_k-a_k\widehat g_k`)],
      '在固定样本预算或计算预算下记录误差与波动',
    ], [latex(String.raw`m=1`), '时得到 SGD。只有每个样本恰好使用一次的全数据平均才是严格的批量梯度下降；有放回抽取', latex('n'), '次仍属于小批量估计。']),
    prose('convergence-pattern', [
      '随机梯度的相对误差还解释了 SGD 常见的两阶段轨迹。离最优点较远时，真实梯度通常较大，样本噪声相对较小，因此随机方向接近确定性梯度；接近最优点后，真实梯度趋近于零，而样本间的波动不会同步消失，相对误差便可能迅速放大。',
      '因此，SGD 往往先快速接近最优区域，再在附近呈锯齿状移动。减小步长或增大批量都能降低后期波动，但会分别牺牲响应速度或增加单次更新的样本成本。下面的实验把这些量放在同一条观测流上。',
    ], [
      { role: 'support', latex: String.raw`\delta_k=\frac{\left\|\nabla f(w_k,x_k)-\mathbb E[\nabla f(w_k,X)]\right\|}{\left\|\mathbb E[\nabla f(w_k,X)]\right\|}\;\lesssim\;\frac{\text{noise magnitude}}{c\,\|w_k-w^*\|}` },
    ]),
    experiment('sa-lab'),
    prose('earned-synthesis', [
      ['回到开头的增量均值，可以看到三种算法始终共享同一条更新语法：均值估计使用残差', latex(String.raw`w_k-X_k`), '，Robbins–Monro 使用带噪声的函数值', latex(String.raw`\widetilde g(w_k,\eta_k)`), '，SGD 使用样本梯度。它们都让当前估计沿一次可观测的随机残差移动。'],
      '这种统一形式在下一章会直接进入强化学习：给定策略的 Bellman 方程提供待求解的固定点，一次环境转移则提供残差样本。时间差分更新因此不是突然出现的新公式，而是随机逼近作用在价值方程上的结果。',
    ], [
      { role: 'result', latex: String.raw`\text{estimate}_{k+1}=\text{estimate}_k-\text{step}_k\times\text{noisy residual}_k` },
    ]),
  ],
}

const en = {
  prerequisite: 'Prerequisites: Monte Carlo return samples, expectations, and basic gradients',
  eyebrow: 'Chapter 7 · Incremental estimation and stochastic approximation',
  title: 'Incremental estimation and stochastic approximation under noisy observations',
  intro: 'The previous chapter used complete-episode returns to estimate action values. As episodes accumulate, storing and re-averaging the entire history is unnecessary and incompatible with a continuing data stream. This chapter begins with an incremental sample mean, shows how step size determines memory, and then extends the same update structure to expectation-defined equations and stochastic gradients.',
  summaryTitle: 'Stochastic approximation trades controlled random error for continual updates',
  figure: 'Interactive Figure 07.1 · Stochastic-Approximation Update Microscope',
  instruction: 'Feed both estimators the same observations and compare residuals, corrections, and historical weights step by step',
  question: 'How step size and batch size change stability and tracking',
  experimentIntro: 'First keep the target stationary and predict which schedule will become steadier. Then introduce a mid-run drift and decide which estimator can release old evidence faster. Both paths receive identical observations, isolating step schedule and batch size.',
  interpretation: 'With a stationary target, a decaying step averages an expanding history and gradually suppresses late fluctuation. After drift, that same history slows the response. A constant step preserves greater relative weight on recent observations, so it tracks change while retaining steady-state fluctuation. A larger batch lowers observation noise per update but consumes more samples.',
  summary: [
    'The sample mean can be rewritten exactly as an old estimate plus one residual correction, eliminating full-history storage.',
    'Step size controls both displacement and the rate at which old observations are forgotten.',
    'Robbins–Monro solves expectation-defined equations from noisy function observations; direction, total travel, and accumulated noise jointly determine convergence.',
    'Stochastic gradient descent applies Robbins–Monro to an expected gradient; batch size controls the evidence used per update.',
    'The next chapter will construct a noisy Bellman residual from one environment transition and obtain temporal-difference updates.',
  ],
  explorer: { cue: 'Select a step and inspect observation, old estimate, residual, step size, correction, and new estimate in order. Then inspect historical weights instead of comparing only the final point.' },
  articleFlow: [
    section('incremental-problem', 'Incremental estimation', 'One new observation should require one update', [
      'The previous chapter treated each complete-episode return as a sample of action value. Averaging all samples after collection is valid, but online learning faces a continuing stream. If sample k triggers another pass over all k samples, computation and storage grow with experience.',
      ['This gives a concrete problem. Let', latex(String.raw`w_k`), 'summarize the first', latex(String.raw`k-1`), 'samples. After', latex(String.raw`x_k`), 'arrives, reading it once should be enough to construct the mean of all', latex('k'), 'samples.'],
    ]),
    derivation('incremental-mean', 'Incremental mean', 'The sample mean as one error correction', 'No approximation is introduced below. The batch mean is merely rearranged so that the current estimate carries the complete effect of history.', [
      step('old-mean', 'Write the current estimate', String.raw`w_k=\frac{1}{k-1}\sum_{i=1}^{k-1}x_i`, [latex(String.raw`w_k`), 'is the mean of the first', latex(String.raw`k-1`), 'samples.'], 'One scalar can represent the entire history for the next update.', [String.raw`k\ge 2`], [[String.raw`w_k`, 'mean of the first k-1 samples']]),
      step('new-mean', 'Add the new sample', String.raw`w_{k+1}=\frac{1}{k}\sum_{i=1}^{k}x_i=\frac{1}{k}\left(\sum_{i=1}^{k-1}x_i+x_k\right)`, 'The last sample is the only new information between the two means.', 'Separating it allows the existing estimate to be reused.', [], [[String.raw`x_k`, 'newly arrived sample k']]),
      step('reuse-old', 'Replace the historical sum', String.raw`w_{k+1}=\frac{1}{k}\left((k-1)w_k+x_k\right)`, ['The effect of the first', latex(String.raw`k-1`), 'samples is already contained in', latex(String.raw`w_k`), '.'], 'The history needed by the update contracts from a list to current state.'),
      step('correction-form', 'Rearrange into residual correction', String.raw`w_{k+1}=w_k+\frac{1}{k}\left(x_k-w_k\right)`, 'The new estimate is the old estimate plus one sample-residual correction.', ['Residual', latex(String.raw`x_k-w_k`), 'sets direction; step', latex(String.raw`1/k`), 'sets how far this evidence moves the estimate.'], [], [[String.raw`x_k-w_k`, 'new-sample residual'], [String.raw`1/k`, 'step that exactly reproduces the sample mean']]),
    ], 'embedded'),
    example('mean-check', 'Calculation check', 'Incremental mean over three observations', 'Start from zero and observe 2, 8, and 2. Every row uses the same recursion.', ['Sample', 'Before', 'Residual', 'Step', 'After'], [
      [latex('2'), latex('0'), latex('2-0=2'), latex('1'), latex('2')],
      [latex('8'), latex('2'), latex('8-2=6'), latex(String.raw`\frac{1}{2}`), latex('5')],
      [latex('2'), latex('5'), latex('2-5=-3'), latex(String.raw`\frac{1}{3}`), latex('4')],
    ], ['The result', latex('4'), 'equals', latex(String.raw`\frac{2+8+2}{3}`), '. The recursion changes storage and update timing, not the estimator.']),
    prose('step-size-memory', [
      ['The schedule', latex(String.raw`1/k`), 'recovers the arithmetic mean exactly, which also forces historical samples to receive equal eventual weight. If the target expectation is stationary, that expanding average suppresses noise. If policy or environment changes, old observations retain weight and the estimate lags behind the current target.'],
      ['Replacing', latex(String.raw`1/k`), 'with a general positive step', latex(String.raw`\alpha_k`), 'preserves interpolation between old estimate and new evidence but changes historical weighting. A constant step forgets exponentially and stays responsive; a decaying step reduces late random fluctuation and suits a fixed expectation.'],
      'The schedules serve different tasks. The relevant question is whether the target is stationary and how quickly old evidence should be forgotten.',
    ], [
      { role: 'support', latex: String.raw`w_{k+1}=w_k+\alpha_k(x_k-w_k)=(1-\alpha_k)w_k+\alpha_kx_k` },
      { role: 'support', latex: String.raw`\alpha_k\equiv\alpha\quad\Longrightarrow\quad w_{k+1}=(1-\alpha)^kw_1+\sum_{i=1}^{k}\alpha(1-\alpha)^{k-i}x_i` },
    ]),
    derivation('root-abstraction', 'Stochastic approximation', 'Use a sampled residual when the expected residual is unavailable', 'A general step explains how to update, but it still addresses only one task: observing a random variable and estimating its mean. Before introducing another algorithm, reinterpret that same mean. Its target is the root of an expectation-defined residual, and each sample gives one random observation of that residual.', [
      step('mean-root', 'Write the mean as a zero residual', String.raw`w^*=\mathbb E[X]\quad\Longleftrightarrow\quad g(w^*)=w^*-\mathbb E[X]=0`, ['Estimating the mean is equivalent to finding', latex(String.raw`w^*`), 'where', latex('g'), 'vanishes.'], 'The problem has not changed; a target value has been restated as the root of an expected residual.', [], [[String.raw`g(w)=w-\mathbb E[X]`, 'true residual for the mean problem']]),
      step('mean-noisy-residual', 'Observe the mean residual with one sample', String.raw`\widetilde g(w_k,X_k)=w_k-X_k,\qquad\mathbb E[\widetilde g(w_k,X_k)\mid w_k]=g(w_k)`, ['When', latex(String.raw`\mathbb E[X]`), 'cannot be evaluated, sample', latex(String.raw`X_k`), 'makes', latex(String.raw`w_k-X_k`), 'an unbiased observation of the true residual.'], ['The opening update', latex(String.raw`w_{k+1}=w_k-a_k(w_k-X_k)`), 'can therefore be read as moving opposite one observable residual.'], ['conditionally independent samples with a finite expectation'], [[String.raw`\widetilde g`, 'data-derived residual observation']]),
      step('root-target', 'Generalize the same structure', String.raw`g(w^*)=0`, ['Now let', latex('g'), 'be any expectation-defined residual that cannot be evaluated directly but has a stable direction near its root.'], 'The mean remains the first concrete instance of the general root problem rather than being replaced by an unrelated abstraction.', ['a stable root exists'], [[String.raw`g`, 'true residual function that cannot be evaluated directly']]),
      step('noisy-residual', 'Keep one data-derived observation', String.raw`\widetilde g(w_k,\eta_k)=g(w_k)+\eta_k`, ['Each step still requires only one random observation of', latex(String.raw`g(w_k)`), '.'], 'An individual direction may be wrong. Conditional zero mean and controlled variance preserve the useful direction over time.', [String.raw`\mathbb E[\eta_k\mid\mathcal H_k]=0`], [[String.raw`\mathcal H_k`, 'history available before step k']]),
      step('rm-update', 'Continue correcting along the observation', String.raw`w_{k+1}=w_k-a_k\widetilde g(w_k,\eta_k)`, ['The mean residual', latex(String.raw`w_k-X_k`), 'is replaced by a general observed residual; the update grammar is unchanged.'], 'When the true residual points toward the root on both sides, a suitable step schedule can average away random directional errors.', [String.raw`a_k>0`], [[String.raw`a_k`, 'positive step at iteration k']]),
    ]),
    example('root-check', 'Direction check', 'Noise-free iteration on a linear equation', [latex(String.raw`g(w)=w-10`), 'has root 10. Start at 20, use step 0.5, and temporarily remove noise.'], [latex('k'), latex(String.raw`w_k`), latex(String.raw`g(w_k)`), latex(String.raw`w_{k+1}`)], [
      [latex('1'), latex('20'), latex('10'), latex('15')],
      [latex('2'), latex('15'), latex('5'), latex('12.5')],
      [latex('3'), latex('12.5'), latex('2.5'), latex('11.25')],
    ], 'Without noise, residual and distance halve each time. With noise, convergence no longer requires every step to be closer.'),
    algorithm('rm-loop', 'Named algorithm', 'Robbins–Monro stochastic root finding', ['The algorithm needs neither the analytic form nor derivative of', latex('g'), '; it needs one controlled random observation at the current', latex(String.raw`w_k`), '.'], [
      ['Choose initial value', latex(String.raw`w_1`), 'and positive steps', latex(String.raw`\{a_k\}`)],
      ['At step', latex('k'), ', obtain one observation', latex(String.raw`\widetilde g(w_k,\eta_k)`)],
      ['Form random direction', latex(String.raw`d_k=-\widetilde g(w_k,\eta_k)`)],
      ['Update', latex(String.raw`w_{k+1}=w_k+a_kd_k`)],
      ['Record residual and estimate, set', latex(String.raw`k\leftarrow k+1`), ', and repeat'],
    ], 'A stochastic algorithm should be judged across seeds, late fluctuation, and residual distributions—not one final point.'),
    theorem('rm-conditions', 'Convergence result', 'Direction, travel, and noise must all be controlled', 'If the root is stable and unique, the steps satisfy the Robbins–Monro conditions, and noise has conditionally zero mean and finite variance, the iterates converge to the root almost surely.', [
      'Derivative bounds make the average residual point toward one root without allowing an unbounded local direction.',
      'An infinite step sum preserves enough total travel from any finite initialization. A finite squared-step sum bounds accumulated noise variance.',
      'A constant step violates the squared-sum condition and typically leaves a stationary distribution around the root. It gives up asymptotic convergence in exchange for tracking.',
    ], [
      { latex: String.raw`0<c_1\le g'(w)\le c_2`, explanation: 'unique stable root and bounded slope' },
      { latex: String.raw`\sum_{k=1}^{\infty}a_k=\infty,\qquad\sum_{k=1}^{\infty}a_k^2<\infty`, explanation: 'unbounded total travel with bounded accumulated noise' },
      { latex: String.raw`\mathbb E[\eta_k\mid\mathcal H_k]=0,\qquad\mathbb E[\eta_k^2\mid\mathcal H_k]<\infty`, explanation: 'conditionally unbiased noise with finite variance' },
      { latex: String.raw`a_k=1/k`, explanation: 'a canonical schedule satisfying both sums' },
    ]),
    prose('optimization-handoff', [
      'Stochastic root finding now handles expectation-defined equations whose residuals cannot be evaluated directly. Optimization is not a new topic inserted here: when an estimate is represented by parameters, learning is often written as choosing parameters that minimize average prediction error. The same running mean example shows how root finding and optimization become the same update.',
    ]),
    example('mean-as-sgd', 'The same mean problem', 'Write the mean as a squared-loss optimum', 'Let parameter w predict random variable X and measure prediction error with squared loss. The parameter that minimizes average squared error is still the mean of X.', ['Location in the argument', 'Expression'], [
      ['Expected loss', latex(String.raw`J(w)=\mathbb E\!\left[\frac12\lVert w-X\rVert^2\right]`)],
      ['First-order condition', latex(String.raw`\nabla_wJ(w)=\mathbb E[w-X]=0`)],
      ['Optimum', latex(String.raw`w^*=\mathbb E[X]`)],
      ['Single-sample gradient', latex(String.raw`\nabla_wf(w_k,X_k)=w_k-X_k`)],
      ['Parameter update', latex(String.raw`w_{k+1}=w_k-a_k(w_k-X_k)`)],
    ], 'The final line is the incremental mean from the opening. Residual w_k-X_k now has a second meaning: it is the gradient of one squared-loss sample.'),
    prose('gradient-generalization', [
      ['Squared loss explains why gradients enter the chapter: sample gradient', latex(String.raw`w_k-X_k`), 'is exactly the random residual of mean estimation. Replacing this specific squared loss with a general sample loss', latex(String.raw`f(w,X)`), 'turns minimum expected loss into another expected-gradient root.'],
    ]),
    derivation('sgd-as-rm', 'Stochastic gradient descent', 'From squared loss to a general expected loss', 'Only one generalization is needed: replace the squared-error sample gradient with the sample gradient of an arbitrary loss. If its expectation is the true gradient, the stochastic root update still applies.', [
      step('expected-objective', 'Define the expected loss', String.raw`\min_w J(w),\qquad J(w)=\mathbb E[f(w,X)]`, 'The objective averages over random X.', 'Direct gradient descent requires the expectation or the full data distribution.'),
      step('gradient-root', 'Rewrite the optimum as a root', String.raw`g(w)=\nabla_wJ(w)=\mathbb E[\nabla_wf(w,X)]=0`, 'The expected gradient vanishes at an optimum.', 'When gradient and expectation can be interchanged and suitable convexity holds, the root is the global optimum.'),
      step('sample-gradient', 'Observe the gradient with one sample', String.raw`\widetilde g(w_k,X_k)=\nabla_wf(w_k,X_k)`, 'A sample gradient differs from the true gradient but has the correct conditional expectation.', 'One inexpensive random direction replaces an expensive full expectation.', [String.raw`X_k\ \text{iid}`]),
      step('sgd-update', 'Substitute into stochastic approximation', String.raw`w_{k+1}=w_k-a_k\nabla_wf(w_k,X_k)`, 'This is stochastic gradient descent.', 'It is Robbins–Monro applied to the expected-gradient root, not a separate update pattern.'),
    ]),
    prose('batch-motivation', [
      'The SGD update above uses one sample. Each step is cheap but inherits substantial single-sample fluctuation. Using the full dataset gives a steadier direction at a much higher per-update cost. Averaging m sample gradients lies between these extremes. A mini-batch is therefore a choice about how much evidence supports one update, not a new objective.',
    ]),
    comparison('gradient-family', 'Evidence-size tradeoff', 'Single sample, mini-batch, and full batch', 'All three methods optimize the same objective with different amounts of gradient evidence per update. Any speed comparison must specify samples per update, update count, and total computation.', ['Method', 'Evidence per update', 'Randomness', 'Primary cost'], [
      ['Batch gradient descent (BGD)', 'full-dataset mean gradient', 'lowest', 'expensive update'],
      ['Mini-batch gradient descent (MBGD)', 'random-batch mean gradient', 'falls with batch size', 'compute-stability compromise'],
      ['Stochastic gradient descent (SGD)', 'one sample gradient', 'highest', 'cheap and frequent updates'],
    ], 'A larger batch usually gives a steadier direction but fewer parameter updates under a fixed sample budget.'),
    algorithm('sgd-loop', 'Training loop', 'From single-sample SGD to mini-batch updates', 'Replace one sample gradient with the mean of m sample gradients; the rest of the update is unchanged.', [
      ['Initialize', latex(String.raw`w_1`), 'and choose a step schedule and batch size', latex('m')],
      ['At step', latex('k'), ', draw', latex('m'), 'samples to form index set', latex(String.raw`I_k`)],
      ['Compute average sample gradient', latex(String.raw`\widehat g_k=\frac{1}{m}\sum_{j\in I_k}\nabla f(w_k,x_j)`)],
      ['Update', latex(String.raw`w_{k+1}=w_k-a_k\widehat g_k`)],
      'Record error and fluctuation under a fixed sample or compute budget',
    ], [latex(String.raw`m=1`), 'gives SGD. A full-data average in which every item appears exactly once is strict batch gradient descent; drawing', latex('n'), 'items with replacement remains a mini-batch estimate.']),
    prose('convergence-pattern', [
      'The relative error of a stochastic gradient explains the familiar two-stage SGD path. Far from the optimum, the true gradient is usually large relative to sample noise, so random directions resemble deterministic gradients. Near the optimum, the true gradient vanishes while sample variation remains, and relative error can grow sharply.',
      'SGD therefore often approaches the optimal region quickly and then moves in a jagged path nearby. Smaller steps or larger batches suppress late fluctuation, while sacrificing response speed or increasing samples per update. The experiment below isolates these effects on one observation stream.',
    ], [
      { role: 'support', latex: String.raw`\delta_k=\frac{\left\|\nabla f(w_k,x_k)-\mathbb E[\nabla f(w_k,X)]\right\|}{\left\|\mathbb E[\nabla f(w_k,X)]\right\|}\;\lesssim\;\frac{\text{noise magnitude}}{c\,\|w_k-w^*\|}` },
    ]),
    experiment('sa-lab'),
    prose('earned-synthesis', [
      ['The incremental mean now reveals one update grammar shared by all three methods. Mean estimation uses residual', latex(String.raw`w_k-X_k`), ', Robbins–Monro uses noisy function value', latex(String.raw`\widetilde g(w_k,\eta_k)`), ', and SGD uses a sample gradient. Each moves the current estimate along one observable random residual.'],
      'The same structure enters reinforcement learning in the next chapter. A Bellman equation supplies a fixed point for a given policy, while one environment transition supplies a residual observation. Temporal-difference learning will therefore be stochastic approximation applied to a value equation, not an unrelated formula.',
    ], [
      { role: 'result', latex: String.raw`\text{estimate}_{k+1}=\text{estimate}_k-\text{step}_k\times\text{noisy residual}_k` },
    ]),
  ],
}

export const stochasticApproximationContent = { zh, en }
