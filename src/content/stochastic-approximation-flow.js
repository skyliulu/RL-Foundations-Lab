const step = (id, rule, latex, short, detail, assumptions = [], symbols = []) => ({ id, rule, latex, short, detail, assumptions, symbols })
const section = (id, kicker, title, paragraphs, formulas = []) => ({ type: 'section', id, kicker, title, paragraphs, formulas })
const prose = (id, paragraphs, formulas = []) => ({ type: 'prose', id, paragraphs, formulas })
const derivation = (id, kicker, title, intro, steps, level = 'major') => ({ type: 'derivation', id, kicker, title, intro, steps, level })
const theorem = (id, kicker, title, claim, paragraphs, conditions) => ({ type: 'theorem', id, kicker, title, claim, paragraphs, conditions })
const algorithm = (id, kicker, title, intro, steps, note) => ({ type: 'algorithm', id, kicker, title, intro, steps, note })
const experiment = (id) => ({ type: 'experiment', id })
const latex = (value) => ({ latex: value })

const zh = {
  prerequisite: '前置：Monte Carlo 回报样本、期望与基本梯度',
  eyebrow: '第 7 章 · 增量估计与随机逼近',
  title: '噪声观测下的增量估计与随机逼近',
  intro: '上一章用完整回合的回报（return）估计动作价值。随着回合不断增加，反复读取并平均全部历史会让存储和计算随数据一同增长，也无法在新回报到达时立即完成一次恒定成本的更新。本章从样本均值的增量计算出发，说明步长怎样决定算法的记忆，再把同一更新结构推广到无法直接计算的期望方程与随机梯度。',
  summaryTitle: '从样本均值到随机逼近与随机梯度',
  figure: '交互图 07.1 · 随机逼近更新显微镜',
  instruction: '播放同一批量观测上的两条更新链，逐步核对残差、状态交接、历史权重与多组随机种子的波动',
  question: '固定证据预算时，步长和批量怎样改变记忆与波动',
  experimentIntro: '先保持目标不变，预测哪种步长会在后期更稳定；再让目标中途漂移，判断哪种估计器能更快放下旧数据。比较批量大小时先固定 180 个底层样本，使不同批量只改变这些样本被分成多少次更新；切换到固定更新次数后，再观察较大批量额外消耗样本所换来的降噪效果。每次运行中，两种步长始终读取完全相同的批量观测。',
  interpretation: '目标固定时，衰减步长把越来越多的历史样本平均起来，后期波动因而逐渐减小；目标漂移后，同一段长期记忆会拖慢响应。固定步长提高近期样本的相对权重，能够追踪变化，却会在固定目标附近保留稳态波动。在固定样本预算下，增大批量会减少参数更新次数，因此更稳定的单步方向不必然换来更小的最终误差；固定更新次数时，较大批量的优势则包含了额外样本成本。多组随机种子的区间把单条轨迹的偶然性与这种系统性取舍分开。',
  summary: [
    '样本均值可以精确改写为旧估计加一次残差修正，因此不必保存全部历史。',
    '步长不仅控制单次移动幅度，也规定旧样本被遗忘的速度。',
    'Robbins–Monro 用带噪声的函数观测求解期望方程；方向、总移动与累计噪声共同决定收敛。',
    '随机梯度下降是 Robbins–Monro 在期望梯度上的应用；批量大小决定每次更新使用多少梯度证据。',
    '下一章将用一次环境转移构造 Bellman 残差样本，由此得到时间差分更新。',
  ],
  explorer: { cue: '从第一步播放到预算终点，核对本步的新估计怎样成为下一步的旧估计；再切换预算、批量和样本流，比较完整历史权重与多组随机种子的区间。' },
  articleFlow: [
    section('incremental-problem', '增量估计', '新样本到达后，只需修正当前估计', [
      ['上一章的 Monte Carlo 方法把每个完整回合的回报看成一个动作价值样本。固定共享网格中的状态', latex(String.raw`s_1`), '后，可以把第', latex('k'), '条回合从该状态得到的回报', latex(String.raw`G_0^{(k)}`), '记作', latex(String.raw`x_k`), '。样本全部收集完以后再求平均当然可行，但在线学习面对的是持续到达的数据：第', latex('k'), '个样本到达时，如果还要重新读取前', latex('k'), '个样本，计算和存储就会随着经验一同增长。'],
      ['因此，这里先解决一个具体问题。设', latex(String.raw`w_k`), '已经概括前', latex(String.raw`k-1`), '个回报样本；新样本', latex(String.raw`x_k=G_0^{(k)}`), '到达后，只读取它一次，就应当得到包含全部', latex(String.raw`k`), '个样本的新均值。'],
    ]),
    derivation('incremental-mean', '增量均值', '样本均值怎样变成一次误差修正', '下面的等式没有引入近似。它只是把批量平均重新排列，使历史信息全部保留在当前估计中。', [
      step('old-mean', '写出当前估计', String.raw`w_k=\frac{1}{k-1}\sum_{i=1}^{k-1}x_i`, [latex(String.raw`w_k`), '是前', latex(String.raw`k-1`), '个样本的均值。'], '在下一次更新前，整段历史可以由这个标量概括。', [String.raw`k\ge 2`], [[String.raw`w_k`, '前 k-1 个样本的均值']]),
      step('new-mean', '把新样本加入总和', String.raw`w_{k+1}=\frac{1}{k}\sum_{i=1}^{k}x_i=\frac{1}{k}\left(\sum_{i=1}^{k-1}x_i+x_k\right)`, '新旧均值之间唯一新增的信息是最后一个样本。', '把它单独拆出，才可能复用已有估计。', [], [[String.raw`x_k`, '刚到达的第 k 个样本']]),
      step('reuse-old', '用当前估计替换历史求和', String.raw`w_{k+1}=\frac{1}{k}\left((k-1)w_k+x_k\right)`, ['前', latex(String.raw`k-1`), '项的全部影响已经包含在', latex(String.raw`w_k`), '中。'], '更新所需的历史由一串样本缩减为一个当前状态。'),
      step('correction-form', '整理为残差修正', String.raw`w_{k+1}=w_k+\frac{1}{k}\left(x_k-w_k\right)`, '新估计等于旧估计加一次样本残差修正。', ['残差', latex(String.raw`x_k-w_k`), '决定移动方向，步长', latex(String.raw`1/k`), '决定这条新证据能够移动估计多少。'], [], [[String.raw`x_k-w_k`, '新样本相对当前估计的残差'], [String.raw`1/k`, '精确复现样本均值的步长']]),
    ], 'embedded'),
    prose('mean-check', [
      ['用三个数值即可核对这条递推。令', latex(String.raw`w_1=0`), '，依次观察', latex(String.raw`2,8,2`), '，每一步都只读取当前样本和上一步估计；最终得到', latex(String.raw`w_4=4`), '，与一次性平均', latex(String.raw`(2+8+2)/3`), '完全相同。增量形式改变的是存储和更新时间，而不是估计目标。'],
    ], [
      { role: 'worked', latex: String.raw`\begin{aligned}w_2&=0+1(2-0)=2,\\w_3&=2+\frac12(8-2)=5,\\w_4&=5+\frac13(2-5)=4.\end{aligned}` },
    ]),
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
    prose('root-check', [
      ['下方播放器中的“无噪声求根”预设把', latex(String.raw`g(w)=w-10`), '、', latex(String.raw`w_1=20`), '和', latex(String.raw`a_k=0.5`), '放进同一条更新链。逐步播放时，固定步长估计依次变为', latex(String.raw`20\to15\to12.5\to11.25`), '，残差与到根的距离同步减半；重新加入噪声后，收敛便不再要求每一步都更接近根。'],
    ]),
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
    derivation('mean-as-sgd', '同一个均值问题', '平方损失把均值估计写成梯度更新', '让参数 w 预测随机变量 X，并用平方误差衡量预测。下面沿同一个均值问题逐步核对：最小化平均平方误差得到的最优参数仍是 X 的均值，而单样本梯度正好复现开头的残差。', [
      step('mean-loss', '定义期望平方损失', String.raw`J(w)=\mathbb E\!\left[\frac12\lVert w-X\rVert^2\right]`, '损失衡量参数预测与随机变量之间的平均平方距离。', '这一步只为同一个均值目标提供优化表述。'),
      step('mean-optimum', '令期望梯度为零', String.raw`\nabla_wJ(w)=\mathbb E[w-X]=0\quad\Longrightarrow\quad w^*=\mathbb E[X]`, '平方损失的最优参数仍然是均值。', '求根与最小化在这个例子上指向同一个目标。'),
      step('mean-sample-gradient', '用一个样本观测梯度', String.raw`\nabla_wf(w_k,X_k)=w_k-X_k`, '单样本梯度就是均值问题中已经出现的随机残差。', '优化没有引入另一种证据，只是重新解释同一个可观测量。'),
      step('mean-gradient-update', '沿样本梯度更新参数', String.raw`w_{k+1}=w_k-a_k(w_k-X_k)`, '最后一行就是开头的增量均值更新。', '残差现在同时是均值误差和一个样本上的平方损失梯度。'),
    ], 'embedded'),
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
    prose('gradient-family', [
      ['这三种名称只标记每次更新使用的证据数量。随机梯度下降（SGD）读取一个样本，更新便宜而频繁；小批量梯度下降（mini-batch gradient descent，MBGD）平均', latex('m'), '个随机样本，批量增大时方向通常更稳定；批量梯度下降（batch gradient descent，BGD）读取完整数据集，随机性最低，但每次更新最昂贵。'],
      '因此，比较速度必须同时锁定每步样本数、更新次数和总计算量。较大批量给出更稳定的单步方向，并不保证它在固定样本预算下更快，因为同一批样本会被分成更少次参数更新；下方实验会把“固定样本”和“固定更新”分开显示。',
    ]),
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
      ['下面用', latex(String.raw`\delta_k`), '表示第', latex('k'), '步样本梯度相对真实梯度的误差；常数', latex(String.raw`c>0`), '是期望损失在最优点附近的曲率下界。曲率下界把梯度大小与到最优点的距离联系起来，因此距离缩小时，相同的梯度噪声会占据更大的相对比例。'],
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
  intro: 'The previous chapter used complete-episode returns to estimate action values. As episodes accumulate, rereading and averaging the entire history makes storage and computation grow with the data and prevents each new return from producing an immediate constant-cost update. This chapter begins with an incremental sample mean, shows how step size determines memory, and then extends the same update structure to expectation-defined equations and stochastic gradients.',
  summaryTitle: 'From sample means to stochastic approximation and stochastic gradients',
  figure: 'Interactive Figure 07.1 · Stochastic-Approximation Update Microscope',
  instruction: 'Play both update chains on matched batch observations and inspect residuals, state handoff, full-history weights, and multi-seed variation',
  question: 'How step and batch size change memory under a fixed evidence budget',
  experimentIntro: 'First keep the target stationary and predict which schedule becomes steadier. Then introduce mid-run drift and decide which estimator releases old evidence faster. When comparing batch sizes, first hold 180 raw samples fixed so that batch size changes only how those samples are divided into updates. Then switch to a fixed update count and observe the noise reduction purchased with extra samples. Within every run, both schedules receive exactly the same batch observations.',
  interpretation: 'With a stationary target, a decaying step averages an expanding history and gradually suppresses late fluctuation; after drift, that same long memory slows the response. A constant step favors recent samples and tracks change while retaining steady-state fluctuation. Under a fixed sample budget, a larger batch produces fewer parameter updates, so a steadier direction need not yield a smaller final error. Under a fixed update count, the larger batch’s advantage also includes extra sample cost. The multi-seed band separates those systematic tradeoffs from the luck of one path.',
  summary: [
    'The sample mean can be rewritten exactly as an old estimate plus one residual correction, eliminating full-history storage.',
    'Step size controls both displacement and the rate at which old observations are forgotten.',
    'Robbins–Monro solves expectation-defined equations from noisy function observations; direction, total travel, and accumulated noise jointly determine convergence.',
    'Stochastic gradient descent applies Robbins–Monro to an expected gradient; batch size controls the evidence used per update.',
    'The next chapter will construct a noisy Bellman residual from one environment transition and obtain temporal-difference updates.',
  ],
  explorer: { cue: 'Play from the first update to the budget boundary and verify that each new estimate becomes the next old estimate. Then switch budget, batch, and sample stream to compare full-history weights with the multi-seed band.' },
  articleFlow: [
    section('incremental-problem', 'Incremental estimation', 'A new sample only corrects the current estimate', [
      ['The previous chapter treated each complete-episode return as a sample of action value. Fix state', latex(String.raw`s_1`), 'in the shared grid and write the return from its', latex('k'), 'th episode as', latex(String.raw`x_k=G_0^{(k)}`), '. Averaging all samples after collection is valid, but online learning faces a continuing stream. If sample', latex('k'), 'triggers another pass over all', latex('k'), 'samples, computation and storage grow with experience.'],
      ['This gives a concrete problem. Let', latex(String.raw`w_k`), 'summarize the first', latex(String.raw`k-1`), 'return samples. After', latex(String.raw`x_k=G_0^{(k)}`), 'arrives, reading it once should be enough to construct the mean of all', latex('k'), 'samples.'],
    ]),
    derivation('incremental-mean', 'Incremental mean', 'The sample mean as one error correction', 'No approximation is introduced below. The batch mean is merely rearranged so that the current estimate carries the complete effect of history.', [
      step('old-mean', 'Write the current estimate', String.raw`w_k=\frac{1}{k-1}\sum_{i=1}^{k-1}x_i`, [latex(String.raw`w_k`), 'is the mean of the first', latex(String.raw`k-1`), 'samples.'], 'One scalar can represent the entire history for the next update.', [String.raw`k\ge 2`], [[String.raw`w_k`, 'mean of the first k-1 samples']]),
      step('new-mean', 'Add the new sample', String.raw`w_{k+1}=\frac{1}{k}\sum_{i=1}^{k}x_i=\frac{1}{k}\left(\sum_{i=1}^{k-1}x_i+x_k\right)`, 'The last sample is the only new information between the two means.', 'Separating it allows the existing estimate to be reused.', [], [[String.raw`x_k`, 'newly arrived sample k']]),
      step('reuse-old', 'Replace the historical sum', String.raw`w_{k+1}=\frac{1}{k}\left((k-1)w_k+x_k\right)`, ['The effect of the first', latex(String.raw`k-1`), 'samples is already contained in', latex(String.raw`w_k`), '.'], 'The history needed by the update contracts from a list to current state.'),
      step('correction-form', 'Rearrange into residual correction', String.raw`w_{k+1}=w_k+\frac{1}{k}\left(x_k-w_k\right)`, 'The new estimate is the old estimate plus one sample-residual correction.', ['Residual', latex(String.raw`x_k-w_k`), 'sets direction; step', latex(String.raw`1/k`), 'sets how far this evidence moves the estimate.'], [], [[String.raw`x_k-w_k`, 'new-sample residual'], [String.raw`1/k`, 'step that exactly reproduces the sample mean']]),
    ], 'embedded'),
    prose('mean-check', [
      ['Three values are enough to check the recursion. Set', latex(String.raw`w_1=0`), 'and observe', latex(String.raw`2,8,2`), 'in sequence. Each step reads only the current sample and previous estimate; the result', latex(String.raw`w_4=4`), 'equals the batch mean', latex(String.raw`(2+8+2)/3`), '. Incremental form changes storage and update timing, not the estimator.'],
    ], [
      { role: 'worked', latex: String.raw`\begin{aligned}w_2&=0+1(2-0)=2,\\w_3&=2+\frac12(8-2)=5,\\w_4&=5+\frac13(2-5)=4.\end{aligned}` },
    ]),
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
    prose('root-check', [
      ['The “noise-free root” preset in the player puts', latex(String.raw`g(w)=w-10`), ',', latex(String.raw`w_1=20`), ', and', latex(String.raw`a_k=0.5`), 'on one update chain. Stepwise playback gives', latex(String.raw`20\to15\to12.5\to11.25`), 'for the constant-step estimate, halving residual and distance together. Restoring noise removes the requirement that every individual step move closer to the root.'],
    ]),
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
    derivation('mean-as-sgd', 'The same mean problem', 'Squared loss turns mean estimation into a gradient update', 'Let parameter w predict random variable X and measure error with squared loss. Follow the same mean problem step by step: minimizing expected squared error still gives the mean, and one sample gradient exactly reproduces the opening residual.', [
      step('mean-loss', 'Define expected squared loss', String.raw`J(w)=\mathbb E\!\left[\frac12\lVert w-X\rVert^2\right]`, 'The loss measures the average squared distance between the parameter prediction and random variable.', 'It gives the same mean target an optimization form.'),
      step('mean-optimum', 'Set the expected gradient to zero', String.raw`\nabla_wJ(w)=\mathbb E[w-X]=0\quad\Longrightarrow\quad w^*=\mathbb E[X]`, 'The squared-loss optimum is still the mean.', 'Root finding and minimization identify the same target in this example.'),
      step('mean-sample-gradient', 'Observe the gradient with one sample', String.raw`\nabla_wf(w_k,X_k)=w_k-X_k`, 'The sample gradient is the random residual already used by mean estimation.', 'Optimization reinterprets the same observable evidence rather than introducing another quantity.'),
      step('mean-gradient-update', 'Update along the sample gradient', String.raw`w_{k+1}=w_k-a_k(w_k-X_k)`, 'This final line is the incremental mean update from the opening.', 'The residual is now both mean error and the gradient of one squared-loss sample.'),
    ], 'embedded'),
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
    prose('gradient-family', [
      ['The three names identify how much evidence enters one update. Stochastic gradient descent (SGD) reads one sample and updates cheaply and frequently. Mini-batch gradient descent (MBGD) averages', latex('m'), 'random samples, usually producing a steadier direction as the batch grows. Batch gradient descent (BGD) reads the full dataset, minimizing gradient randomness at the highest per-update cost.'],
      'A speed comparison must therefore lock samples per update, update count, and total computation. A steadier large-batch direction need not win under a fixed sample budget because the same evidence is divided into fewer parameter updates. The experiment below displays fixed-sample and fixed-update budgets separately.',
    ]),
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
      ['Below,', latex(String.raw`\delta_k`), 'denotes the sample gradient’s relative error at step', latex('k'), ', while', latex(String.raw`c>0`), 'is a lower curvature bound for the expected loss near the optimum. That curvature bound relates gradient magnitude to distance from the optimum, so the same gradient noise occupies a larger relative share as the distance shrinks.'],
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
