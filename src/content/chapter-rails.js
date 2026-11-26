export const chapterRailGuides = {
  montecarlo: {
    zh: {
      kicker: '完整回合样本平均',
      title: '用回合回报估计动作价值',
      formulas: [
        String.raw`Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\frac{1}{N(S_t,A_t)}\!\left(G_t-Q(S_t,A_t)\right)`,
      ],
      observations: [
        '点击「自动播放」，观察完整采样、反向计算回报 $G_t$、写回 $Q$ 表与策略交接四个阶段如何严格顺序发生。',
        '固定同一条重复访问回合，切换「首次访问」与「每次访问」，对比被忽略的重复访问与写回次数的变化。',
        '切换 Basic、Exploring Starts 与 $\\epsilon$-greedy 三种协议，核对覆盖假设如何从环境条件转移进策略内部。',
      ],
    },
    en: {
      kicker: 'Complete-episode averaging',
      title: 'Estimate action value from episode returns',
      formulas: [
        String.raw`Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\frac{1}{N(S_t,A_t)}\!\left(G_t-Q(S_t,A_t)\right)`,
      ],
      observations: [
        'Use Auto play to follow all four phases in order: rollout, backward return $G_t$, $Q$-table commit, and policy handoff.',
        'Hold one repeated-visit episode fixed and toggle First-visit vs Every-visit to compare skipped repeats and commit counts.',
        'Switch among Basic, Exploring Starts, and $\\epsilon$-greedy to see coverage move from environment assumptions into the policy.',
      ],
    },
  },
  approximation: {
    zh: {
      kicker: '增量随机逼近',
      title: 'Robbins–Monro 步长与残差修正',
      formulas: [
        String.raw`w_{k+1}=w_k+a_k\!\left(X_k-w_k\right)`,
        String.raw`\sum_k a_k=\infty,\qquad \sum_k a_k^2<\infty`,
      ],
      observations: [
        '在平稳目标下对比 $a_k=1/k$ 与固定步长 $\\alpha$：观察 $1/k$ 置信带收窄而固定步长保留末端抖动。',
        '打开「漂移目标」，观察 $1/k$ 记忆显微镜如何被早期样本锁死，而固定 $\\alpha$ 能迅速追上新目标。',
        '在「固定样本预算」与「固定更新次数」之间切换并改变批量大小，对比方差下降与更新步数减少的权衡。',
      ],
    },
    en: {
      kicker: 'Incremental approximation',
      title: 'Robbins–Monro step sizes and residual updates',
      formulas: [
        String.raw`w_{k+1}=w_k+a_k\!\left(X_k-w_k\right)`,
        String.raw`\sum_k a_k=\infty,\qquad \sum_k a_k^2<\infty`,
      ],
      observations: [
        'Under a stationary target, compare $a_k=1/k$ against constant $\\alpha$: $1/k$ narrows the band while constant $\\alpha$ keeps tail jitter.',
        'Enable Drifting target to see $1/k$ locked by early history in the memory microscope while constant $\\alpha$ tracks the shift.',
        'Switch between fixed sample budget and fixed update count while changing batch size to compare variance against step count.',
      ],
    },
  },
  td: {
    zh: {
      kicker: '一步自举更新',
      title: '无需等待回合结束的价值学习',
      formulas: [
        String.raw`V(S_t)\leftarrow V(S_t)+\alpha\!\left(R_{t+1}+\gamma V(S_{t+1})-V(S_t)\right)`,
      ],
      observations: [
        '按「下一步」逐帧推进，区分「目标就绪（尚未写回）」与「写回价值表」两步，核对新表如何成为下一转移的输入。',
        '观察底部「三种可用时钟」：同一条转移上，TD(0) 等 1 步即可更新，Monte Carlo 必须等到终点 $s_{18}$。',
        '调大「真实奖励步数 $n$」，观察 $n$-step 目标如何在一步自举与完整回报之间连续过渡。',
      ],
    },
    en: {
      kicker: 'One-step bootstrapping',
      title: 'Value learning without waiting for episode end',
      formulas: [
        String.raw`V(S_t)\leftarrow V(S_t)+\alpha\!\left(R_{t+1}+\gamma V(S_{t+1})-V(S_t)\right)`,
      ],
      observations: [
        'Step frame by frame to separate target-ready from table-commit and verify how the updated table feeds the next transition.',
        'Inspect the three availability clocks below: TD(0) acts after 1 step while Monte Carlo waits until terminal state $s_{18}$.',
        'Vary the realized-reward horizon $n$ to see $n$-step targets interpolate smoothly between TD(0) and full return.',
      ],
    },
  },
  control: {
    zh: {
      kicker: '在策略 vs 离策略控制',
      title: '后继动作规则决定保守还是激进',
      formulas: [
        String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`,
        String.raw`U_t^{\mathrm{Q}}=R_{t+1}+\gamma\max_a Q(S_{t+1},a)`,
      ],
      observations: [
        '切换「低探索 $\\epsilon=0.04$」与「高探索 $\\epsilon=0.30$」预设，比较 Sarsa 与 Q-learning 在禁区边缘的策略箭头差异。',
        '点击「跳到探索分歧帧」，直接定格在行为策略发生探索的一步，对比两者的后继目标读取了哪一个动作。',
        '核对底部禁区回合率，理解为何 Sarsa 把探索风险写进价值表而 Q-learning 始终瞄准最优贪心路径。',
      ],
    },
    en: {
      kicker: 'On-policy vs off-policy control',
      title: 'The successor rule separates safe and optimal paths',
      formulas: [
        String.raw`U_t^{\mathrm{Sarsa}}=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`,
        String.raw`U_t^{\mathrm{Q}}=R_{t+1}+\gamma\max_a Q(S_{t+1},a)`,
      ],
      observations: [
        'Toggle the low-exploration ($\\epsilon=0.04$) and high-exploration ($\\epsilon=0.30$) presets to compare arrows near forbidden cells.',
        'Click Next fork to jump directly to an exploratory step and contrast which successor action enters each TD target.',
        'Compare forbidden-episode rates to see Sarsa price exploration risk while Q-learning targets the greedy optimal path.',
      ],
    },
  },
  vfa: {
    zh: {
      kicker: '共享参数近似',
      title: '特征内积同时驱动泛化与干扰',
      formulas: [
        String.raw`\mathbf w_{t+1}=\mathbf w_t+\alpha\!\left(U_t-\widehat v(S_t,\mathbf w_t)\right)\boldsymbol\phi(S_t)`,
        String.raw`\Delta\widehat v(s')=\alpha\delta_t\,\boldsymbol\phi(s')^{\top}\boldsymbol\phi(S_t)`,
      ],
      observations: [
        '先选「正向泛化」场景：从未直接采样 $s_{15}$，对比宽特征把邻居价值传播过去，而同数据表格法仍停在 $0.00$。',
        '切到「跨区干扰」场景并步进：留意采样目标格 $s_{18}$ 与禁区 $s_{13}$ 交替触发的反向漂移警示。',
        '把特征宽度 $\\sigma$ 调小，观察内积 $\\boldsymbol\\phi(s_{13})^{\\top}\\boldsymbol\\phi(s_{18})$ 下降如何让两格重新解耦。',
      ],
    },
    en: {
      kicker: 'Shared-parameter approximation',
      title: 'Feature overlap drives both generalization and interference',
      formulas: [
        String.raw`\mathbf w_{t+1}=\mathbf w_t+\alpha\!\left(U_t-\widehat v(S_t,\mathbf w_t)\right)\boldsymbol\phi(S_t)`,
        String.raw`\Delta\widehat v(s')=\alpha\delta_t\,\boldsymbol\phi(s')^{\top}\boldsymbol\phi(S_t)`,
      ],
      observations: [
        'Start in Positive generalization: $s_{15}$ is never sampled, yet wide features transfer neighbor values while tabular stays at $0.00$.',
        'Switch to Cross-region interference and step forward to see forbidden $s_{13}$ and goal $s_{18}$ pull shared weights in opposite directions.',
        'Shrink feature width $\\sigma$ to watch $\\boldsymbol\\phi(s_{13})^{\\top}\\boldsymbol\\phi(s_{18})$ drop and decouple the two cells.',
      ],
    },
  },
  dqn: {
    zh: {
      kicker: '双稳机制消融',
      title: '冻结目标网络与经验回放解耦训练',
      formulas: [
        String.raw`Y_t=R_{t+1}+\gamma\max_{a'}Q_{\bar\theta}(S_{t+1},a')`,
        String.raw`\theta\leftarrow\theta-\alpha\nabla_\theta\!\left(Y_t-Q_\theta(S_t,A_t)\right)^2`,
      ],
      observations: [
        '依次点击四组消融预设（朴素 → 仅目标网络 → 仅经验回放 → 完整 DQN），对照在线曲线、阶梯目标与朴素虚线基线。',
        '点击「跳到下次同步」或直接点击折线图，观察冻结窗口内目标网络保持平直、同步瞬间整体跃迁。',
        '对比经验回放池中的样本复用次数与样本相关性，确认回放打散时间序列关联的独立作用。',
      ],
    },
    en: {
      kicker: 'Dual stabilization ablations',
      title: 'Frozen targets and replay decouple deep Q-learning',
      formulas: [
        String.raw`Y_t=R_{t+1}+\gamma\max_{a'}Q_{\bar\theta}(S_{t+1},a')`,
        String.raw`\theta\leftarrow\theta-\alpha\nabla_\theta\!\left(Y_t-Q_\theta(S_t,A_t)\right)^2`,
      ],
      observations: [
        'Step across all four ablation presets (Naive → Target only → Replay only → Full DQN) and compare the three trajectories.',
        'Use Next sync or click directly on the curve to verify flat target plateaus between syncs and staircase jumps on sync ticks.',
        'Inspect buffer reuse counts and sample correlation to isolate how uniform replay breaks sequential dependence.',
      ],
    },
  },
  policygradient: {
    zh: {
      kicker: '得分函数与状态基线',
      title: '基线降低方差而不改变梯度期望',
      formulas: [
        String.raw`\theta\leftarrow\theta+\alpha\,\nabla_\theta\log\pi_\theta(A_t\mid S_t)\,(G_t-b)`,
      ],
      observations: [
        '切换「无基线 $b=0$」与「均值基线 $b=1.4$」预设，在 12 回合曲线上点击任意回合，观察 $b=0$ 为何连次优正回报动作也错误推高。',
        '在下方轨迹中点击不同时间步 $S_0\\dots S_3$，核对每步只使用该动作之后的因果回报 $G_t$。',
        '拖动下方单步 logit $\\theta$，观察概率单纯形守恒（所选动作上升时，其余动作按概率比例让出质量）与多轨迹方差下降。',
      ],
    },
    en: {
      kicker: 'Score function and baseline',
      title: 'A state baseline cuts variance without biasing expectation',
      formulas: [
        String.raw`\theta\leftarrow\theta+\alpha\,\nabla_\theta\log\pi_\theta(A_t\mid S_t)\,(G_t-b)`,
      ],
      observations: [
        'Toggle No baseline ($b=0$) vs Mean baseline ($b=1.4$) and click episodes on the 12-episode curve to see why $b=0$ reinforces mediocre positive draws.',
        'Click trajectory steps $S_0\\dots S_3$ below to verify that each step uses only its future causal return $G_t$.',
        'Vary the local logit $\\theta$ to watch simplex conservation across actions and compare rollout gradient variance.',
      ],
    },
  },
  actorcritic: {
    zh: {
      kicker: '双时间尺度耦合',
      title: '一条转移的 TD 误差驱动两条梯度路径',
      formulas: [
        String.raw`\delta_t=R_{t+1}+\gamma V_\phi(S_{t+1})-V_\phi(S_t)`,
        String.raw`\theta\leftarrow\theta+\alpha_\theta\rho_t\delta_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)`,
      ],
      observations: [
        '切换预设 ①「双时间尺度协调」与预设 ②「Critic 严重滞后」，观察上轨 $V_\\phi$ 追赶 $V^\\pi$ 的速度如何决定下轨策略稳定性。',
        '切换预设 ③「离策略比率放大 $\\rho_t=1.75$」，观察 Actor 更新系数被直接放大，体会下一章 PPO 裁剪比率的必要性。',
        '点击曲线或切回第 1 步，用顶部 $R_{t+1}$ 与 $V_\\phi(S_{t+1})$ 滑块核对同一 $\\delta_t$ 如何同时更新 Critic 与 Actor。',
      ],
    },
    en: {
      kicker: 'Two-timescale coupling',
      title: 'One transition TD error drives two update paths',
      formulas: [
        String.raw`\delta_t=R_{t+1}+\gamma V_\phi(S_{t+1})-V_\phi(S_t)`,
        String.raw`\theta\leftarrow\theta+\alpha_\theta\rho_t\delta_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)`,
      ],
      observations: [
        'Compare preset ① (fast critic / slow actor) against preset ② (lagging critic) to see critic tracking lag distort actor updates.',
        'Select preset ③ ($\\rho_t=1.75$) to see off-policy ratio amplification directly scale the actor step—motivating PPO clipping next.',
        'Click any step on the coupled chart or return to Step 1 to trace how one $\\delta_t$ drives both critic and actor.',
      ],
    },
  },
  tokenmdp: {
    zh: {
      kicker: '序列决策边界',
      title: '将逐 token 生成写进可训练轨迹契约',
      formulas: [
        String.raw`S_t=(x,y_{<t}),\qquad A_t=y_t`,
        String.raw`r_t=r_t^{\mathrm{process}}-\beta(\log\pi_{\mathrm{old},t}-\log\pi_{\mathrm{ref},t})+\mathbf 1[t=T-1]R_{\mathrm{terminal}}`,
      ],
      observations: [
        '在「简洁回答（EOS 终止）」与「长度截断」间切换，观察末位自举掩码从 $0$ 变为 $1$ 并启用截断后价值估计。',
        '点击 Token 步进条或账本任意一行，在三栏显微镜中逐项核对过程奖励、KL 代价与反向回报 $G_t$。',
        '切换到「偏离参考」回答并调大 KL 强度 $\\beta$，观察每个偏离 token 立即承受负 KL 惩罚。',
      ],
    },
    en: {
      kicker: 'Sequence decision boundary',
      title: 'Turn token generation into a trainable trajectory contract',
      formulas: [
        String.raw`S_t=(x,y_{<t}),\qquad A_t=y_t`,
        String.raw`r_t=r_t^{\mathrm{process}}-\beta(\log\pi_{\mathrm{old},t}-\log\pi_{\mathrm{ref},t})+\mathbf 1[t=T-1]R_{\mathrm{terminal}}`,
      ],
      observations: [
        'Switch between Concise answer (EOS) and Length truncation to watch the final bootstrap mask flip from $0$ to $1$.',
        'Click any token step or table row to inspect its exact reward decomposition and backward return $G_t$ in the microscope.',
        'Select Reference drift and increase $\\beta$ to see every drifting token pay an immediate negative KL penalty.',
      ],
    },
  },
  dpo: {
    zh: {
      kicker: '离线偏好消元',
      title: '配分函数在同提示词成对比较中相消',
      formulas: [
        String.raw`m=\beta\!\left(\Delta_w-\Delta_l\right),\qquad \mathcal L_{\mathrm{DPO}}=-\log\sigma(m)`,
      ],
      observations: [
        '点击预设 ②「似然同时下降」，验证即使 $\\Delta_w<0$，只要 $\\Delta_l$ 降得更多，间隔 $m>0$ 仍会呈现低损失。',
        '点击预设 ③「排序反转」，在间隔响应曲线上观察梯度权重 $\\sigma(-m)$ 飙升如何驱动更大的单步修正 $m\\to m\'$。',
        '拖动 $\\beta$，同时核对间隔放大、梯度幅度变化与单步损失下降之间的关系。',
      ],
    },
    en: {
      kicker: 'Offline preference elimination',
      title: 'The prompt partition cancels in pairwise comparison',
      formulas: [
        String.raw`m=\beta\!\left(\Delta_w-\Delta_l\right),\qquad \mathcal L_{\mathrm{DPO}}=-\log\sigma(m)`,
      ],
      observations: [
        'Select preset ② (Likelihood displacement) to see $m>0$ and low loss even while $\\Delta_w<0$ because $\\Delta_l$ falls farther.',
        'Select preset ③ (Reversed ranking) to watch the implicit gradient weight $\\sigma(-m)$ surge and drive a larger $m\\to m\'$ step.',
        'Vary $\\beta$ to observe how reference regularization scales both margin sharpness and per-step gradient magnitude.',
      ],
    },
  },
  grpo: {
    zh: {
      kicker: '组内相对基准',
      title: '同题候选均值替代学习型 Critic',
      formulas: [
        String.raw`A_i=\frac{R_i-\mu_R}{\sigma_R+\varepsilon},\qquad c_i=\operatorname{clip}(r_i,1-\epsilon_{\mathrm{low}},1+\epsilon_{\mathrm{high}})`,
      ],
      observations: [
        '开启「DAPO Clip-Higher」，观察回答 B、G 等高优势候选被解锁上升空间，目标值 $J$ 随之提高。',
        '将奖励分布切到「全对」或「全错」，看零轴双向优势柱图全部塌缩为零线，再开启「动态采样」过滤该无信息组。',
        '在 $G=2,4,6,8$ 间切换，观察组大小如何影响均值基准 $\\mu_R$、标准差 $\\sigma_R$ 与每题生成预算。',
      ],
    },
    en: {
      kicker: 'Within-group baseline',
      title: 'Same-prompt group mean replaces a learned critic',
      formulas: [
        String.raw`A_i=\frac{R_i-\mu_R}{\sigma_R+\varepsilon},\qquad c_i=\operatorname{clip}(r_i,1-\epsilon_{\mathrm{low}},1+\epsilon_{\mathrm{high}})`,
      ],
      observations: [
        'Toggle DAPO Clip-Higher to unlock extra upward gain on high-advantage responses such as B and G.',
        'Switch rewards to All right or All wrong to see every bar collapse to zero, then turn on Dynamic sampling to filter the group.',
        'Vary group size $G\\in\\{2,4,6,8\\}$ to compare ranking stability against rollout generation budget.',
      ],
    },
  },
  codingrl: {
    zh: {
      kicker: '可执行反馈与修复',
      title: '测试向量与反馈回写决定泛化还是投机',
      formulas: [
        String.raw`S_{t+1}=(x,c_t,\operatorname{Exec}(c_t)),\qquad R_{\mathrm{visible}}=1\not\Rightarrow R_{\mathrm{hidden}}=1`,
      ],
      observations: [
        '沿修复轨迹带依次点击步骤 1 → 2 → 3，先在隐藏测试关闭时看步骤 2 如何在可见测试上拿到满分 $1.000$。',
        '打开「显示隐藏测试」，直接核对步骤 2 可见满分与含隐藏测试真实得分之间的奖励落差（奖励投机）。',
        '在「全通过 / 通过比例 / 难度加权」间切换，体会稀疏验收与稠密 shaping 的不同排序信号。',
      ],
    },
    en: {
      kicker: 'Executable feedback and repair',
      title: 'Test vectors and feedback write-back separate repair from gaming',
      formulas: [
        String.raw`S_{t+1}=(x,c_t,\operatorname{Exec}(c_t)),\qquad R_{\mathrm{visible}}=1\not\Rightarrow R_{\mathrm{hidden}}=1`,
      ],
      observations: [
        'Click steps 1 → 2 → 3 along the repair tape with hidden tests off and note Step 2 scoring $1.000$ on visible fixtures.',
        'Toggle Reveal hidden tests to expose the exact reward drop on Step 2 (visible-test overfitting) vs Step 3 generalization.',
        'Switch among All pass, Pass rate, and Weighted to compare sparse faithfulness with dense partial-credit signals.',
      ],
    },
  },
  agentmdp: {
    zh: {
      kicker: '工具交互边界',
      title: '区分策略可控动作与环境返回观察',
      formulas: [
        String.raw`S_t=(x,h_t,m_t,o_t),\qquad \pi_\theta(\tau\mid x)=\prod_{t=0}^{T}\pi_\theta(A_t\mid S_t)`,
      ],
      observations: [
        '直接点击分支树中虚线反事实节点（如「误读解析器文件」或「提前停止」），切换到对应失败支路并定位首次分叉点。',
        '在下方「决策边界检查器」中对照左侧策略动作 $A_t$ 与右侧环境观察 $O_{t+1}$，明确只有前者进入策略对数概率。',
        '比较三条路径的终局成败与交互成本，理解预算约束为何也是轨迹目标的一部分。',
      ],
    },
    en: {
      kicker: 'Tool-interaction boundary',
      title: 'Separate policy actions from environment observations',
      formulas: [
        String.raw`S_t=(x,h_t,m_t,o_t),\qquad \pi_\theta(\tau\mid x)=\prod_{t=0}^{T}\pi_\theta(A_t\mid S_t)`,
      ],
      observations: [
        'Click dashed counterfactual nodes directly on the tree (such as inspect parser or stop) to switch branches and highlight the first fork.',
        'Use the boundary inspector below to separate policy action $A_t$ (in log-prob) from environment observation $O_{t+1}$ (outside log-prob).',
        'Compare terminal outcomes and interaction costs across branches to see how budgets shape the task objective.',
      ],
    },
  },
  credit: {
    zh: {
      kicker: '长程归因尺度',
      title: '更稠密的信用也伴随更强的假设与偏差',
      formulas: [
        String.raw`C_t=(1-\eta)G_t+\eta\!\left(R_{\mathrm{chosen}}-R_{\mathrm{alternative}}\right)`,
      ],
      observations: [
        '点击柱状图中的第 2 步「读取文件」，在下方五方案横向对照表中对比为何「折扣回报」给分偏低而「反事实重放」给分最高。',
        '在五种方案间切换，留意 $\\gamma$ 与 $\\eta$ 滑块的启用状态，确认每个超参数只在对应公式中生效。',
        '切到「工具分段」与「反事实重放」，核对下方分段基线账本与同状态替代动作结果差 $\\Delta R$。',
      ],
    },
    en: {
      kicker: 'Long-horizon attribution',
      title: 'Denser credit relies on stronger evidence assumptions',
      formulas: [
        String.raw`C_t=(1-\eta)G_t+\eta\!\left(R_{\mathrm{chosen}}-R_{\mathrm{alternative}}\right)`,
      ],
      observations: [
        'Click step 2 (open_file) on the bar chart and use the five-scheme audit below to contrast low discounted credit against high counterfactual credit.',
        'Switch across all five schemes and note which $\\gamma$ and $\\eta$ controls become active in each formula.',
        'Inspect the segment-value ledger and same-state alternative replay $\\Delta R$ to audit where finer credit evidence comes from.',
      ],
    },
  },
}
