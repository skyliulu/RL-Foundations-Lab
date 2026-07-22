const step = (id, rule, latex, short, detail, assumptions = [], symbols = []) => ({ id, rule, latex, short, detail, assumptions, symbols })
const section = (id, kicker, title, paragraphs, formulas = []) => ({ type: 'section', id, kicker, title, paragraphs, formulas })
const derivation = (id, kicker, title, intro, steps) => ({ type: 'derivation', id, kicker, title, intro, steps })
const example = (id, kicker, title, intro, columns, rows, note) => ({ type: 'example', id, kicker, title, intro, columns, rows, note })
const theorem = (id, kicker, title, claim, paragraphs, conditions) => ({ type: 'theorem', id, kicker, title, claim, paragraphs, conditions })
const algorithm = (id, kicker, title, intro, steps, note) => ({ type: 'algorithm', id, kicker, title, intro, steps, note })
const comparison = (id, kicker, title, intro, columns, rows, note) => ({ type: 'comparison', id, kicker, title, intro, columns, rows, note })
const experiment = (id) => ({ type: 'experiment', id })

const latex = (value) => ({ latex: value })

const zh = {
  prerequisite: '前置：Monte Carlo return 样本、期望与基本梯度',
  eyebrow: 'Part II · 从样本均值到随机逼近',
  title: '噪声观测下的增量估计与随机逼近',
  intro: '上一章已经把完整 episode 的 return 当作动作价值样本。每得到一个新 return 后，如果仍保存并重新平均全部历史，学习就无法真正在线进行。本章从这一计算约束出发，先推导增量均值，再分析一般步长对算法记忆的影响，最后把同一结构推广到随机求根与随机梯度下降。',
  summaryTitle: '随机逼近把“新证据修正旧估计”变成可分析的通用算法',
  figure: '交互图 07.1 · 随机逼近更新显微镜',
  instruction: '锁定同一观测流，对照衰减步长与固定步长的每一步残差、修正量和历史权重',
  question: '步长调度与 batch 大小共同决定估计器的收敛与追踪行为',
  experimentIntro: '固定目标下，衰减步长会逐步抑制后期波动；目标发生漂移后，固定步长依靠较高的近期权重保持响应。下面两条估计共享完全相同的观测证据，可直接检验步长调度与 batch 大小造成的差异。',
  interpretation: '衰减步长把越来越多历史样本近似等权地积累起来，因此固定目标下会逐渐稳定，却会在目标漂移后反应迟缓。固定步长持续给近期样本较大权重，能够追踪变化，但在固定目标附近保留稳态波动。增大 batch 会降低单次观测噪声，却增加每次更新消耗的样本数。',
  summary: [
    '样本均值可以写成旧估计加上步长乘样本残差，因此无需保存全部历史。',
    '一般步长定义历史样本的权重：衰减步长适合固定目标，固定步长适合持续追踪。',
    'Robbins–Monro 用带噪声的函数观测求期望方程的根；收敛条件分别约束方向、总移动和累计噪声。',
    'SGD 把期望梯度的根交给 Robbins–Monro 求解；BGD、MBGD 与 SGD 的差别在于每一步采用的梯度估计。',
    '下一章的 TD 会用一次环境转移构造 Bellman 残差样本。',
  ],
  explorer: { cue: '先选中某一步，逐列读取观测、旧估计、残差、步长、修正量和新估计；再看右侧历史权重，而不是只比较最终点。' },
  articleFlow: [
    section('incremental-problem', '在线估计的计算约束', '新增样本不应触发全历史重算', [
      'Monte Carlo 已经把动作价值变成 return 样本的平均。若第 k 个样本到达后仍从头读取前 k 个样本，计算和存储都会随数据增长。真正的在线学习应该只保留当前估计和少量状态。',
      ['由此得到一个具体计算目标：已知前', latex(String.raw`k-1`), '个样本的均值', latex(String.raw`w_k`), '时，仅读取一次新样本', latex(String.raw`x_k`), '即可构造新均值。'],
    ]),
    derivation('incremental-mean', '增量均值的精确递推', '把第 k 个样本并入旧均值', '每一行只做一个代数变换。最后出现的“新样本减旧估计”不是经验写法，而是算术平均的精确重排。', [
      step('old-mean', '写出旧均值', String.raw`w_k=\frac{1}{k-1}\sum_{i=1}^{k-1}x_i`, [latex(String.raw`w_k`), '汇总前', latex(String.raw`k-1`), '个样本。'], '这一定义让历史样本可以由一个标量概括，而无需在更新时重新读取。', [String.raw`k\ge 2`], [[String.raw`w_k`, '前 k−1 个样本的均值']]),
      step('new-mean', '把新样本加入求和', String.raw`w_{k+1}=\frac{1}{k}\sum_{i=1}^{k}x_i=\frac{1}{k}\left(\sum_{i=1}^{k-1}x_i+x_k\right)`, '把最后一个样本从总和中单独拆出。', '这是从批量定义通向增量递推的唯一新信息。', [], [[String.raw`x_k`, '刚到达的第 k 个样本']]),
      step('reuse-old', '用旧均值替换历史求和', String.raw`w_{k+1}=\frac{1}{k}\left((k-1)w_k+x_k\right)`, ['历史的全部影响已经包含在', latex(String.raw`w_k`), '中。'], ['利用旧均值定义即可把', latex(String.raw`k-1`), '项求和替换成一个已有状态。']),
      step('correction-form', '整理成误差纠正形式', String.raw`w_{k+1}=w_k+\frac{1}{k}\left(x_k-w_k\right)`, '新估计等于旧估计加一次样本误差纠正。', ['残差', latex(String.raw`x_k-w_k`), '决定方向，', latex(String.raw`1/k`), '决定这条新证据能移动估计多少。'], [], [[String.raw`x_k-w_k`, '新样本相对旧估计的残差'], [String.raw`1/k`, '精确复现样本均值的步长']]),
    ]),
    example('mean-check', '贯穿计算', '三次观测的增量均值计算', '从初值 0 开始依次观察 2、8、2。表中每一行都显式写出旧估计、残差和新估计。', ['样本', '更新前', '残差', '步长', '更新后'], [
      [latex('2'), latex('0'), latex('2-0=2'), latex('1'), latex('2')],
      [latex('8'), latex('2'), latex('8-2=6'), latex(String.raw`\frac{1}{2}`), latex('5')],
      [latex('2'), latex('5'), latex('2-5=-3'), latex(String.raw`\frac{1}{3}`), latex('4')],
    ], ['最终结果', latex('4'), '与一次性计算', latex(String.raw`\frac{2+8+2}{3}`), '完全相同；递推只减少存储与重算，没有改变估计目标。']),
    section('general-step', '从算术平均到一般学习规则', ['一般步长', latex(String.raw`\alpha_k`), '改变估计器的记忆结构'], [
      ['把均值步长替换为一般正数', latex(String.raw`\alpha_k`), '以后，更新仍然在新样本与旧估计之间插值，但不再保证所有历史样本等权。步长由此定义算法对历史数据的记忆结构。'],
      ['固定步长', latex(String.raw`\alpha`), '让最近样本保持较大权重；随 k 衰减的步长会逐渐冻结估计。二者对应的目标不同：一个强调追踪，一个强调固定真值下的渐近稳定。'],
    ], [
      { role: 'support', latex: String.raw`w_{k+1}=w_k+\alpha_k(x_k-w_k)=(1-\alpha_k)w_k+\alpha_kx_k` },
      { role: 'support', latex: String.raw`\alpha_k\equiv\alpha\quad\Longrightarrow\quad w_{k+1}=(1-\alpha)^{k}w_1+\sum_{i=1}^{k}\alpha(1-\alpha)^{k-i}x_i` },
    ]),
    section('stationary-tracking', '两类步长调度', '固定真值的收敛与变化目标的追踪不能同时最优', [
      '若数据分布长期不变，后期仍大幅响应单次噪声没有必要；衰减步长让随机扰动逐渐被平均。若策略或环境持续变化，过小步长又会让旧数据长期拖住估计；固定步长通过指数遗忘保留响应能力。',
      '这不是“哪个参数更好”的问题，而是先确定任务究竟要求估计一个固定期望，还是追踪一个随时间移动的期望。',
    ]),
    derivation('root-abstraction', '从具体递推到随机求根', '将样本误差推广为带噪声的函数残差', '均值问题只是一个特殊根。把残差换成更一般的函数观测，就得到 Robbins–Monro 随机求根。', [
      step('root-target', '把未知目标定义为方程的根', String.raw`g(w^*)=0`, [latex(String.raw`w^*`), '是期望残差为零的位置。'], ['许多期望估计和优化问题都能改写成求根，但此时', latex(String.raw`g`), '的解析表达式可能未知。'], ['根存在且具有稳定方向'], [[String.raw`g`, '真实但可能无法直接计算的残差函数']]),
      step('noisy-residual', '只观察一次带噪声的函数值', String.raw`\widetilde g(w_k,\eta_k)=g(w_k)+\eta_k`, ['数据提供的是', latex(String.raw`g(w_k)`), '的随机观测。'], '单次方向可以出错；关键是给定当前历史后，噪声的条件均值为零且方差受控。', [String.raw`\mathbb E[\eta_k\mid\mathcal H_k]=0`], [[String.raw`\mathcal H_k`, '第 k 步以前可用的历史信息']]),
      step('rm-update', '沿观测残差的反方向移动', String.raw`w_{k+1}=w_k-a_k\widetilde g(w_k,\eta_k)`, ['残差为正则减小', latex('w'), '，残差为负则增大', latex('w'), '。'], '只要真实残差在根两侧给出正确平均方向，随机错误就能在合适步长下被逐渐平均。', [String.raw`a_k>0`], [[String.raw`a_k`, 'Robbins–Monro 步长']]),
      step('mean-as-root', '把均值递推代回通用形式', String.raw`g(w)=w-\mathbb E[X],\qquad\widetilde g(w_k,X_k)=w_k-X_k`, '样本均值正是 Robbins–Monro 的一个特例。', ['代入通用更新立即得到', latex(String.raw`w_{k+1}=w_k+a_k(X_k-w_k)`), '。']),
    ]),
    example('root-check', '线性根的基准例', [latex(String.raw`g(w)=w-10`), '上的无噪声迭代'], '取初值 20、固定步长 0.5，并暂时关闭噪声。残差每次减半，因此估计也把到根的距离减半。', [latex('k'), latex(String.raw`w_k`), latex(String.raw`g(w_k)`), latex(String.raw`w_{k+1}`)], [
      [latex('1'), latex('20'), latex('10'), latex('15')],
      [latex('2'), latex('15'), latex('5'), latex('12.5')],
      [latex('3'), latex('12.5'), latex('2.5'), latex('11.25')],
    ], '带噪声时不保证每一步更近；收敛结论约束的是长期平均行为。'),
    algorithm('rm-loop', '完整算法', 'Robbins–Monro 随机求根循环', ['算法不需要', latex('g'), '的解析式或导数，只需要在当前', latex(String.raw`w_k`), '处取得一次受控噪声观测。'], [
      ['选择初值', latex(String.raw`w_1`), '与正步长序列', latex(String.raw`\{a_k\}`)],
      ['在第', latex('k'), '步，用当前', latex(String.raw`w_k`), '请求一次观测', latex(String.raw`\widetilde g(w_k,\eta_k)`)],
      ['计算随机方向', latex(String.raw`d_k=-\widetilde g(w_k,\eta_k)`)],
      ['更新', latex(String.raw`w_{k+1}=w_k+a_kd_k`)],
      ['记录残差、步长和估计；增加', latex('k'), '并继续'],
    ], '判断算法不能只看最后一个点；需要比较多条 seed、后期波动和残差分布。'),
    theorem('rm-conditions', '长期收敛条件', '三个条件分别约束方向、移动能力与噪声', '在稳定且唯一的根、Robbins–Monro 步长以及条件零均值有限方差噪声下，迭代以概率 1 收敛到 w*。', [
      '导数下界保证根两侧的平均残差指回根，并排除平坦或方向反转；导数上界避免一步方向无限放大。',
      '步长总和发散保证初值无论离根多远，算法仍保留足够总移动；步长平方和收敛控制随机扰动的累计方差。',
      '固定步长不满足平方和收敛，因此通常只在根附近形成稳态分布；它换来的正是追踪变化的能力。',
    ], [
      { latex: String.raw`0<c_1\le g'(w)\le c_2`, explanation: '稳定、唯一且不过度陡峭的根' },
      { latex: String.raw`\sum_{k=1}^{\infty}a_k=\infty,\qquad\sum_{k=1}^{\infty}a_k^2<\infty`, explanation: '总移动无限，累计噪声有限' },
      { latex: String.raw`\mathbb E[\eta_k\mid\mathcal H_k]=0,\qquad\mathbb E[\eta_k^2\mid\mathcal H_k]<\infty`, explanation: '噪声平均不偏且方差受控' },
      { latex: String.raw`a_k=1/k`, explanation: '同时满足两条求和条件的典型选择' },
    ]),
    derivation('sgd-as-rm', '随机求根进入优化', '样本梯度是期望梯度的随机观测', '优化期望损失等价于寻找期望梯度的根。一次样本梯度正是该根函数的随机观测。', [
      step('expected-objective', '定义期望优化目标', String.raw`\min_w J(w),\qquad J(w)=\mathbb E[f(w,X)]`, '目标对随机变量 X 的分布取平均。', '直接梯度下降需要知道分布或计算完整期望。'),
      step('gradient-root', '把最优化改写成求根', String.raw`g(w)=\nabla_wJ(w)=\mathbb E[\nabla_wf(w,X)]=0`, '最优点满足期望梯度为零。', '在可交换梯度与期望且目标满足适当凸性时，这个根对应最优解。'),
      step('sample-gradient', '用一个样本构造 noisy observation', String.raw`\widetilde g(w_k,X_k)=\nabla_wf(w_k,X_k)`, '样本梯度不等于真实梯度，但其条件期望等于真实梯度。', '它把昂贵的期望计算换成一次随机方向。', [String.raw`X_k\ \text{iid}`]),
      step('sgd-update', '代入 Robbins–Monro 更新', String.raw`w_{k+1}=w_k-a_k\nabla_wf(w_k,X_k)`, '这就是 stochastic gradient descent。', 'SGD 不是另一套孤立公式，而是随机求根在梯度残差上的应用。'),
    ]),
    algorithm('sgd-loop', '完整训练循环', 'SGD 与 mini-batch SGD 的执行差别只在梯度估计', '同一个目标函数不变；batch 大小决定每一步用多少样本估计梯度。', [
      ['初始化参数', latex(String.raw`w_1`), '，选择步长调度和 batch 大小', latex('m')],
      ['在第', latex('k'), '步抽取', latex('m'), '个样本组成', latex(String.raw`I_k`)],
      ['计算 batch 平均梯度', latex(String.raw`\widehat g_k=\frac{1}{m}\sum_{j\in I_k}\nabla f(w_k,x_j)`)],
      ['更新', latex(String.raw`w_{k+1}=w_k-a_k\widehat g_k`)],
      '在固定样本预算或计算预算下记录误差与方差',
    ], [latex(String.raw`m=1`), '得到 SGD；', latex(String.raw`m=n`), '且每个样本恰好使用一次才是严格的 full-batch gradient。随机有放回抽取', latex('n'), '次仍属于 mini-batch。']),
    comparison('gradient-family', '同一目标的三种梯度证据', 'BGD、MBGD 与 SGD 的差别来自每一步如何估计梯度', '比较时必须同时说明每步样本数、更新次数和总计算量，否则“谁收敛更快”没有统一含义。', ['方法', '每步证据', '随机性', '主要代价'], [
      ['BGD', '完整数据集的平均梯度', '最低', '每次更新昂贵'],
      ['MBGD', '随机 batch 的平均梯度', '随 batch 增大而下降', '折中并适合并行'],
      ['SGD', '单个样本梯度', '最高', '单步最便宜、更新最频繁'],
    ], '更大的 batch 通常让方向更稳，但在固定样本预算下也会减少参数更新次数。'),
    section('convergence-pattern', '最优点附近的相对噪声', 'SGD 接近最优点后的波动来源', [
      '远离最优点时，真实梯度通常较大，样本梯度中的噪声相对较小，所以随机方向看起来接近确定性梯度。接近最优点后，真实梯度趋近于零，而样本波动不会同步消失，相对误差便可能迅速放大。',
      '这解释了常见轨迹：早期快速靠近，后期在最优点附近锯齿式移动。减小步长或增大 batch 都能压低后期波动，但会改变响应速度或计算成本。',
    ], [
      { role: 'support', latex: String.raw`\delta_k=\frac{\left\|\nabla f(w_k,x_k)-\mathbb E[\nabla f(w_k,X)]\right\|}{\left\|\mathbb E[\nabla f(w_k,X)]\right\|}\;\lesssim\;\frac{\text{noise magnitude}}{c\,\|w_k-w^*\|}` },
    ]),
    experiment('sa-lab'),
    section('earned-synthesis', '统一的随机逼近视角', '均值估计、Robbins–Monro 与 SGD 的共同递推结构', [
      ['三者都可以读成“当前估计减去步长乘一次带噪声残差”：均值估计的残差是', latex(String.raw`w_k-X_k`), '，随机求根使用', latex(String.raw`\widetilde g(w_k,\eta_k)`), '，SGD 使用样本梯度。统一形式现在来自已经完成的三个具体推导，而不是开场时要求记住的分类。'],
      '下一章会把给定策略的 Bellman 方程写成残差等于零，并用一次状态转移构造 noisy residual。这样，TD 更新为何长得像随机逼近就不再是突然出现的公式。',
    ], [
      { role: 'result', latex: String.raw`\text{estimate}_{k+1}=\text{estimate}_k-\text{step}_k\times\text{noisy residual}_k` },
    ]),
  ],
}

const en = {
  prerequisite: 'Prerequisites: Monte Carlo return samples, expectations, and basic gradients',
  eyebrow: 'Part II · From sample means to stochastic approximation',
  title: 'Incremental estimation and stochastic approximation under noisy observations',
  intro: 'The previous chapter treated complete-episode returns as action-value samples. Re-reading and re-averaging the entire history after every new return would prevent truly online learning. This chapter starts from that concrete computation, derives the incremental mean, interprets general step sizes as memory rules, and only then generalizes the same structure to stochastic root finding and stochastic gradient descent.',
  summaryTitle: 'Stochastic approximation turns new-evidence correction into a general analyzable algorithm',
  figure: 'Interactive Figure 07.1 · Stochastic-Approximation Update Microscope',
  instruction: 'Hold one observation stream fixed and compare residuals, corrections, and historical weights under decaying and constant steps',
  question: 'Step schedules and batch size jointly determine convergence and tracking behavior',
  experimentIntro: 'With a stationary target, a decaying schedule progressively suppresses late fluctuation. After the target drifts, a constant step remains responsive by preserving recent weight. Both estimates below receive exactly the same observations, isolating the effects of schedule and batch size.',
  interpretation: 'A decaying step accumulates a nearly equal-weight history, so it stabilizes under a stationary target but reacts slowly after drift. A constant step keeps substantial weight on recent samples, so it tracks change while retaining steady fluctuation. Larger batches lower the noise of each observation but consume more samples per update.',
  summary: [
    'A sample mean is an old estimate plus a step-size-weighted sample residual, so the full history need not be stored.',
    'A general step size defines historical weighting: decay suits stationary estimation, while a constant step supports tracking.',
    'Robbins–Monro finds roots from noisy function observations; its assumptions control direction, total travel, and accumulated noise.',
    'SGD applies Robbins–Monro to an expected-gradient root; BGD, MBGD, and SGD differ in gradient evidence per update.',
    'The next chapter will construct a noisy Bellman residual from one transition.',
  ],
  explorer: { cue: 'Select one step and read observation, old estimate, residual, step, correction, and new estimate in order. Then inspect historical weights instead of judging only the final point.' },
  articleFlow: [
    section('incremental-problem', 'Computational constraint of online estimation', 'A new sample should not trigger full-history recomputation', [
      'Monte Carlo already estimates action value by averaging return samples. If the kth sample forces another pass over all k samples, storage and computation grow with experience. Online learning should keep only the current estimate and small auxiliary state.',
      ['This yields a concrete computational objective: given the mean', latex(String.raw`w_k`), 'of the first', latex(String.raw`k-1`), 'samples, one read of', latex(String.raw`x_k`), 'must be sufficient to construct the new mean.'],
    ]),
    derivation('incremental-mean', 'Exact recursion for the incremental mean', 'Fold sample k into the old mean', 'Each line performs one algebraic change. The final sample-minus-estimate correction is an exact rearrangement of the arithmetic mean.', [
      step('old-mean', 'Write the old mean', String.raw`w_k=\frac{1}{k-1}\sum_{i=1}^{k-1}x_i`, [latex(String.raw`w_k`), 'summarizes the first', latex(String.raw`k-1`), 'samples.'], 'The history can be represented by one scalar during the next update.', [String.raw`k\ge 2`], [[String.raw`w_k`, 'mean of the first k−1 samples']]),
      step('new-mean', 'Add the new sample to the sum', String.raw`w_{k+1}=\frac{1}{k}\sum_{i=1}^{k}x_i=\frac{1}{k}\left(\sum_{i=1}^{k-1}x_i+x_k\right)`, 'Separate the last sample from the full sum.', 'This is the only new evidence between the two means.', [], [[String.raw`x_k`, 'newly arrived sample k']]),
      step('reuse-old', 'Replace the historical sum with the old mean', String.raw`w_{k+1}=\frac{1}{k}\left((k-1)w_k+x_k\right)`, ['All historical influence is already stored in', latex(String.raw`w_k`), '.'], ['The old-mean definition turns', latex(String.raw`k-1`), 'terms into existing state.']),
      step('correction-form', 'Rearrange into error correction', String.raw`w_{k+1}=w_k+\frac{1}{k}\left(x_k-w_k\right)`, 'The new estimate equals the old estimate plus a sample-error correction.', ['Residual', latex(String.raw`x_k-w_k`), 'sets direction and', latex(String.raw`1/k`), 'sets how far this evidence moves the estimate.'], [], [[String.raw`x_k-w_k`, 'sample residual'], [String.raw`1/k`, 'step that exactly reproduces the mean']]),
    ]),
    example('mean-check', 'Running calculation', 'Incremental mean across three observations', 'Start from zero and observe 2, 8, and 2. Every row exposes the old estimate, residual, and resulting update.', ['Sample', 'Before', 'Residual', 'Step', 'After'], [
      [latex('2'), latex('0'), latex('2-0=2'), latex('1'), latex('2')],
      [latex('8'), latex('2'), latex('8-2=6'), latex(String.raw`\frac{1}{2}`), latex('5')],
      [latex('2'), latex('5'), latex('2-5=-3'), latex(String.raw`\frac{1}{3}`), latex('4')],
    ], ['The final value', latex('4'), 'equals', latex(String.raw`\frac{2+8+2}{3}`), '. The recursion changes storage and timing, not the estimator.']),
    section('general-step', 'Arithmetic mean to a learning rule', ['A general step', latex(String.raw`\alpha_k`), 'changes the estimator\'s memory structure'], [
      ['Replacing the mean schedule by a general positive', latex(String.raw`\alpha_k`), 'still interpolates between new evidence and the old estimate, but it no longer assigns equal weight to every historical sample. Step size therefore defines memory.'],
      ['A constant', latex(String.raw`\alpha`), 'keeps substantial weight on recent observations; a decaying step eventually freezes. They answer different objectives: tracking change versus stabilizing around one fixed truth.'],
    ], [
      { role: 'support', latex: String.raw`w_{k+1}=w_k+\alpha_k(x_k-w_k)=(1-\alpha_k)w_k+\alpha_kx_k` },
      { role: 'support', latex: String.raw`\alpha_k\equiv\alpha\quad\Longrightarrow\quad w_{k+1}=(1-\alpha)^{k}w_1+\sum_{i=1}^{k}\alpha(1-\alpha)^{k-i}x_i` },
    ]),
    section('stationary-tracking', 'Two step schedules', 'Converging to a fixed truth and tracking change cannot share one optimum', [
      'Under a stationary distribution, large late responses to individual noise are unnecessary; decay averages them away. When policy or environment keeps moving, a tiny late step lets old data anchor the estimate for too long; a constant step forgets exponentially and stays responsive.',
      'The relevant distinction is therefore whether the task estimates a fixed expectation or tracks a moving expectation; neither schedule is universally superior.',
    ]),
    derivation('root-abstraction', 'From a concrete recursion to stochastic root finding', 'Replace sample error by a noisy function residual', 'Mean estimation is one special root. Replacing its residual by a general function observation yields Robbins–Monro stochastic root finding.', [
      step('root-target', 'Define the unknown as a root', String.raw`g(w^*)=0`, [latex(String.raw`w^*`), 'is where the expected residual vanishes.'], ['Many expectation and optimization problems can be rewritten this way even when', latex('g'), 'has no available analytic form.'], ['a stable root exists'], [[String.raw`g`, 'true residual function']]),
      step('noisy-residual', 'Observe one noisy function value', String.raw`\widetilde g(w_k,\eta_k)=g(w_k)+\eta_k`, ['Data provides a random observation of', latex(String.raw`g(w_k)`), '.'], 'Individual directions may be wrong; conditional zero mean and controlled variance preserve the useful average direction.', [String.raw`\mathbb E[\eta_k\mid\mathcal H_k]=0`], [[String.raw`\mathcal H_k`, 'history available before step k']]),
      step('rm-update', 'Move opposite the observed residual', String.raw`w_{k+1}=w_k-a_k\widetilde g(w_k,\eta_k)`, ['Positive residual lowers', latex('w'), 'and negative residual raises it.'], 'If true residuals point toward the root on both sides, suitable steps can average away random mistakes.', [String.raw`a_k>0`], [[String.raw`a_k`, 'Robbins–Monro step size']]),
      step('mean-as-root', 'Recover the mean recursion', String.raw`g(w)=w-\mathbb E[X],\qquad\widetilde g(w_k,X_k)=w_k-X_k`, 'The incremental mean is a Robbins–Monro special case.', ['Substitution gives', latex(String.raw`w_{k+1}=w_k+a_k(X_k-w_k)`), '.']),
    ]),
    example('root-check', 'Linear-root baseline', ['Noise-free iteration for', latex(String.raw`g(w)=w-10`)], 'Use initial value 20, constant step 0.5, and no noise. Each residual and distance to the root halves.', [latex('k'), latex(String.raw`w_k`), latex(String.raw`g(w_k)`), latex(String.raw`w_{k+1}`)], [
      [latex('1'), latex('20'), latex('10'), latex('15')],
      [latex('2'), latex('15'), latex('5'), latex('12.5')],
      [latex('3'), latex('12.5'), latex('2.5'), latex('11.25')],
    ], 'With noise, not every step is closer. Convergence constrains long-run behavior.'),
    algorithm('rm-loop', 'Complete algorithm', 'Robbins–Monro stochastic root-finding loop', ['The algorithm needs neither the analytic form of', latex('g'), 'nor its derivative; it needs one controlled noisy observation at the current iterate.'], [
      ['Choose initial', latex(String.raw`w_1`), 'and a positive step schedule', latex(String.raw`\{a_k\}`)],
      ['At step', latex('k'), ', request one observation', latex(String.raw`\widetilde g(w_k,\eta_k)`)],
      ['Form stochastic direction', latex(String.raw`d_k=-\widetilde g(w_k,\eta_k)`)],
      ['Update', latex(String.raw`w_{k+1}=w_k+a_kd_k`)],
      ['Record residual, step, and estimate; increment', latex('k'), 'and repeat'],
    ], 'Judge multiple seeds, late fluctuation, and residuals—not only the last point.'),
    theorem('rm-conditions', 'Conditions for long-run convergence', 'Three conditions control direction, travel, and noise', 'Under a stable unique root, Robbins–Monro steps, and conditionally zero-mean finite-variance noise, the iterates converge to w* with probability one.', [
      'Derivative bounds make the average residual point toward one unique root without exploding.',
      'Infinite total step preserves enough travel from an arbitrary initial value; finite squared steps control accumulated noise variance.',
      'A constant step violates the squared-sum condition and usually reaches a stationary distribution around the root—the price paid for tracking ability.',
    ], [
      { latex: String.raw`0<c_1\le g'(w)\le c_2`, explanation: 'stable, unique, bounded root direction' },
      { latex: String.raw`\sum_{k=1}^{\infty}a_k=\infty,\qquad\sum_{k=1}^{\infty}a_k^2<\infty`, explanation: 'unbounded total travel and bounded accumulated noise' },
      { latex: String.raw`\mathbb E[\eta_k\mid\mathcal H_k]=0,\qquad\mathbb E[\eta_k^2\mid\mathcal H_k]<\infty`, explanation: 'unbiased controlled noise' },
      { latex: String.raw`a_k=1/k`, explanation: 'a canonical schedule satisfying both sums' },
    ]),
    derivation('sgd-as-rm', 'Root finding becomes optimization', 'A sample gradient is a stochastic observation of the expected gradient', 'Optimizing an expected loss means finding the root of its expected gradient. A sample gradient is precisely a noisy observation of that root function.', [
      step('expected-objective', 'Define the expected objective', String.raw`\min_w J(w),\qquad J(w)=\mathbb E[f(w,X)]`, 'The objective averages over random X.', 'Direct gradient descent requires its distribution or a full expectation.'),
      step('gradient-root', 'Rewrite optimization as root finding', String.raw`g(w)=\nabla_wJ(w)=\mathbb E[\nabla_wf(w,X)]=0`, 'An optimum has zero expected gradient.', 'With interchangeability of gradient and expectation and suitable convexity, this root is the optimum.'),
      step('sample-gradient', 'Build a noisy observation from one sample', String.raw`\widetilde g(w_k,X_k)=\nabla_wf(w_k,X_k)`, 'A sample gradient differs from the true gradient but has the correct conditional mean.', 'One random direction replaces an expensive expectation.', [String.raw`X_k\ \text{iid}`]),
      step('sgd-update', 'Substitute into Robbins–Monro', String.raw`w_{k+1}=w_k-a_k\nabla_wf(w_k,X_k)`, 'This is stochastic gradient descent.', 'SGD is stochastic root finding applied to gradient residuals.'),
    ]),
    algorithm('sgd-loop', 'Complete training loop', 'SGD and mini-batch SGD differ only in gradient evidence', 'The objective stays fixed; batch size changes how many samples estimate each update direction.', [
      ['Initialize', latex(String.raw`w_1`), 'and choose a step schedule and batch size', latex('m')],
      ['At step', latex('k'), ', sample', latex('m'), 'items to form', latex(String.raw`I_k`)],
      ['Compute batch gradient', latex(String.raw`\widehat g_k=\frac{1}{m}\sum_{j\in I_k}\nabla f(w_k,x_j)`)],
      ['Update', latex(String.raw`w_{k+1}=w_k-a_k\widehat g_k`)],
      'Compare error and variance under a fixed sample or compute budget',
    ], [latex(String.raw`m=1`), 'is SGD. ', latex(String.raw`m=n`), 'is strict full-batch only when every data item appears exactly once;', latex('n'), 'draws with replacement remain mini-batch sampling.']),
    comparison('gradient-family', 'Three evidence rules for one objective', 'BGD, MBGD, and SGD differ in how each update estimates the gradient', 'A fair speed comparison must specify samples per update, update count, and total compute.', ['Method', 'Evidence per update', 'Randomness', 'Primary cost'], [
      ['BGD', 'full-dataset mean gradient', 'lowest', 'expensive update'],
      ['MBGD', 'random batch mean gradient', 'falls with batch size', 'parallel compromise'],
      ['SGD', 'one sample gradient', 'highest', 'cheapest and most frequent update'],
    ], 'A larger batch gives a steadier direction but fewer parameter updates under a fixed sample budget.'),
    section('convergence-pattern', 'Relative noise near the optimum', 'The source of late-stage SGD fluctuation', [
      'Far from the optimum, the true gradient is usually large relative to sample noise, so a stochastic direction resembles the deterministic gradient. Near the optimum, the true gradient approaches zero while sample variation remains, and relative error can grow sharply.',
      'This produces a common pattern: fast early approach followed by zig-zag motion near the optimum. Smaller steps and larger batches suppress late fluctuation while changing response speed or compute cost.',
    ], [
      { role: 'support', latex: String.raw`\delta_k=\frac{\left\|\nabla f(w_k,x_k)-\mathbb E[\nabla f(w_k,X)]\right\|}{\left\|\mathbb E[\nabla f(w_k,X)]\right\|}\;\lesssim\;\frac{\text{noise magnitude}}{c\,\|w_k-w^*\|}` },
    ]),
    experiment('sa-lab'),
    section('earned-synthesis', 'Unified stochastic-approximation view', 'The common recursion behind mean estimation, Robbins–Monro, and SGD', [
      ['Each is a current estimate minus a step times a noisy residual: mean estimation uses', latex(String.raw`w_k-X_k`), ', root finding uses', latex(String.raw`\widetilde g(w_k,\eta_k)`), ', and SGD uses a sample gradient. The common form is now an earned conclusion from three concrete derivations.'],
      'The next chapter writes the Bellman equation as a zero residual and uses one environment transition to observe it. The TD update will therefore arrive as an application, not an unexplained formula.',
    ], [
      { role: 'result', latex: String.raw`\text{estimate}_{k+1}=\text{estimate}_k-\text{step}_k\times\text{noisy residual}_k` },
    ]),
  ],
}

export const stochasticApproximationContent = { zh, en }
