# 全课程章节重构与 Source Coverage 审计

- 状态：01–21 内容 Source Coverage 复审批次完成；专用交互与统计实验继续硬化
- 范围：章节 01–21
- 核心目标：保留原始材料完整的概念、算法与理论脉络，再用交互、同步证据和上下文解释实现更深入的学习体验。

## 1. 完成标准

每章必须同时具备以下六层内容，缺一不可：

1. **问题层**：前一种方法哪里不够，为什么需要本章。
2. **对象层**：新概念、符号、假设和数据接口在首次出现时定义。
3. **推导层**：保留关键中间式、定理条件和“为什么成立”。
4. **算法层**：完整伪代码、初始化、采样、更新顺序、停止或重复条件及输出。
5. **例子层**：至少一个贯穿式 worked example，展示算法状态和策略如何逐步变化。
6. **交互层**：操纵真实算法对象并展示反事实；不能用改名后的通用曲线代替算法内部状态。

每个主要转折必须回答：

- 上一步还缺什么？
- 新机制改变了哪个数学或数据对象？
- 它为什么有效？
- 在共享例子中具体发生了什么？
- 它带来了什么代价或新的失败模式？

## 2. 全课程覆盖结论

| 章节 | 必须保留的源材料主线 | 复审前主要缺口 | 重构所需专用交互 |
|---|---|---|---|
| 01 MDP | Grid World → state → action → transition → policy → reward → trajectory/return → episode/continuing → MDP | 主线基本存在；需强化 transition/policy 的职责分离、Markov 充分性反例与 episodic/continuing 对 return 的影响 | Course World + state sufficiency counterexample |
| 02 Return / Value | return 的必要性 → 两种 return 计算 → 随机轨迹 → state value → policy 好坏 | 缺“按定义累加”和“递归方程求 return”的完整对照；缺从确定性 return 到随机 value 的分布推导 | Return calculator + trajectory distribution lens |
| 03 Bellman | 单步/多步记号 → state value → Bellman 分项推导 → worked example → matrix form → policy evaluation → action value | 缺完整四状态手算、矩阵解法与迭代解法为何等价、迭代收敛含义、state value 到 action value 的逐步桥接 | Term-by-term Bellman + matrix/iteration switch |
| 04 Optimality | policy 比较 → optimal policy/value → BOE → RHS 最大化 → contraction theorem → existence/uniqueness → policy optimality → reward/γ 分析 | 当前主要停在 expectation→max；缺 fixed point/contraction、存在唯一性、policy optimality、奖励仿射变换与 detour 分析 | Operator geometry + policy invariance counterfactuals |
| 05 VI / PI / TPI | VI 元素形式与伪代码 → step-by-step q table → PI 四个 why 问题 →完整 PI 伪代码与例子 → VI/PI 对照 → TPI → convergence | 缺完整伪代码和逐轮 q/value/policy 例子；PI 为什么改善与为什么终止讲得过快 | Synchronized q-table/value/policy replay |
| 06 Monte Carlo | model-free mean estimation → policy iteration 转换 → MC Basic →逐步例子 → 数据复用 → update timing → Exploring Starts → soft/ε-greedy → MC ε-Greedy → optimality/consistency | 目前只保留 value sample、平均与 ε-greedy 定义；算法家族和演进基本缺失 | Episode Tape + Q table + policy map + algorithm variant switch |
| 07 Stochastic Approximation | mean recursion → general step size → root finding → Robbins–Monro → worked examples → convergence conditions → mean special case → SGD → convergence pattern → BGD/MBGD/SGD | 目前只保留 RM 核心式与步长条件；缺推导、定理直觉、SGD 完整连接和 batch-size 比较 | Noisy root field + multi-seed band + batch gradient comparator |
| 08 TD Prediction | stochastic expectation examples → TD state-value algorithm → target/error 注释 → Bellman/RM 推导 → convergence → MC vs TD | 目前只有最终 TD 公式和 n-step 比较；缺算法产生过程、收敛条件和系统性 MC/TD 对照 | Transition microscope + MC/TD matched trajectories |
| 09 Sarsa / Q-learning | Sarsa evaluation → Sarsa control → examples → n-step Sarsa → Q-learning → on/off-policy 定义与判定 → implementation variants → exploration → unified target view | 缺完整 Sarsa/Q-learning 伪代码、n-step Sarsa、控制过程、探索失败例和统一算法视角 | Cliff/control arena + behavior/target policy split + n-step tape |
| 10 Value Approximation | table→function → objective/distribution → SGD/semi-gradient → linear features → theoretical analysis → Sarsa/Q-learning with approximation | 当前只有参数化、MSE 与 semi-gradient；缺源材料中的表示案例、stationary distribution 推导、线性理论及控制算法 | Feature basis studio + interference map + approximate control loop |
| 11 DQN | nonlinear Q approximation → loss/gradient difficulty → main/target networks →为什么 two networks → replay 定义 →为什么 uniform replay → tabular 对照 →完整 DQN 伪代码与例子 | 当前只有两个技巧的摘要；缺梯度问题的逐步产生、replay 必要性论证、完整训练生命周期和例子 | Live replay buffer + online/target dependency graph + batch trace |
| 12 Policy Gradient | tabular→parameterized policy → optimality metrics → average value cases → average reward →两指标关系 → policy-gradient theorem → log trick → gradient ascent/REINFORCE → interpretation | 当前从目标直接跳到梯度；缺两套 metric 的定义、选择理由、关系及 softmax 梯度的逐分量解释 | Metric switch + softmax probability simplex + trajectory contribution replay |
| 13 Actor–Critic | QAC → q estimation choices → baseline invariance → optimal baseline → A2C/TD AC → worked example → importance sampling → off-policy PG/AC → deterministic PG/AC | 当前只有 advantage、TD error 和 ratio；缺 QAC 起点、最优 baseline、IS 推导、off-policy 完整算法与 deterministic 扩展 | QAC/A2C/off-policy mode switch + dual optimizer microscope |
| 14 PPO | policy ratio → surrogate objective → clipped objective → multiple epochs/minibatches → KL/clip diagnostics → value/entropy terms → rollout/update lifecycle | 公式主线已有；缺从 importance sampling 到 surrogate 的完整推导、完整 PPO objective 与训练伪代码、失败诊断 | Sample objective surface + epoch lifecycle + diagnostics |
| 15 Token MDP | prompt/prefix state → token action → transition → EOS/continuing boundary → sequence reward → token credit → value/advantage mapping | 整章缺失 | Representation Morph with one synchronized response trace |
| 16 LM PPO System | SFT policy → preference/reward model → rollout → reference KL → token rewards → value/GAE → PPO minibatches → model/version lifecycle | 已有系统图；缺进入 PPO 前的数据与模型来源、sequence-to-token reward 逻辑、完整 batch contract 与故障分析 | Shared-batch trace across policy/reference/reward/value models |

## 3. 逐章必须覆盖的知识脉络

### 本轮复审落地结果（2026-07-19）

| 范围 | 已恢复的内容主线 | 仍需继续硬化的交互证据 |
|---|---|---|
| 01–05 | Markov 充分性与任务边界、return 双重计算与分布、四状态 Bellman 手算/矩阵/迭代、最优算子 contraction 与 greedy policy 证明、VI/PI/TPI 完整伪代码与为什么链 | 将部分 worked table 升级为可逐步播放的同步 q/value/policy 状态 |
| 07–09 | 均值递推到 Robbins–Monro、步长定理与 batch-gradient 家族；Bellman 单样本逻辑、TD(0) 完整循环与 MC/TD 收敛对照；Sarsa/Q-learning/n-step、on/off-policy 与悬崖差异 | 多 seed 置信带、逐 transition TD 显微镜与真实 Cliff World arena |
| 10–13 | weighted objective、semi-gradient、线性共享与 approximate control；DQN moving target/replay 完整循环；两类 policy metric、定理到采样与 REINFORCE；QAC/baseline/A2C/off-policy/deterministic 扩展 | 将当前参数实验升级为 feature/replay/trajectory/dual-optimizer 的完整内部状态视图 |
| 14–16 | PPO 四种裁剪情况、完整 policy/value/entropy loss、GAE 与 minibatch 循环；新增 Token MDP 章节及逐 token 奖励实验；RLHF 模型血缘、sequence-to-token reward、batch contract 与故障诊断 | PPO epoch/KL 状态机与 RLHF 同 batch 多模型版本追踪继续增强 |

本轮新增的连续理论块全部遵守双语 ID 对齐、LaTeX 渲染、完整伪代码和 worked example 内容契约。这里的“内容复审批次完成”不等同于所有章节达到最终完成定义；专用交互、数值基准和跨 seed 统计仍按上表继续验收。

### 01 网格世界与 MDP

必需顺序：

1. 先建立地图、目标、禁区和边界，不提前使用未定义术语。
2. state 是用于预测与决策的信息，不只是位置编号；加入遗漏关键变量的反例。
3. action 是智能体发出的选择，不等于环境实际执行结果。
4. transition 属于环境；确定性转移是概率转移的特例。
5. policy 属于智能体；明确与 transition conditional probability 的区别。
6. reward 评价一次转移；解释下标为何是下一时刻。
7. trajectory 串起交互，return 评价整条未来。
8. episodic 与 continuing 决定 return 边界和终止值。
9. 最后组合为 MDP，并解释 Markov property 的信息充分性含义。

### 02 Return 与 State Value

必需顺序：

1. 用两条到达同一目标但中间奖励不同的轨迹说明即时奖励不足。
2. 按定义累加 return，并解释折扣权重。
3. 用递归关系重新计算 return，说明为什么要递归表示。
4. 确定性策略下，一条未来可以直接给出 return。
5. 随机策略或环境下，同一状态产生 return 分布。
6. state value 是条件期望，不是一条轨迹结果。
7. value 可以评价策略，但还没有提供高效求解方法。

### 03 Bellman 期望方程

必需顺序：

1. 从 return 递归拆第一步，不直接展示最终方程。
2. 分别推导即时奖励期望和后继 return 期望。
3. 展开对 action、successor、reward 的完整求和。
4. 在四状态例子中逐项代入，得到联立方程。
5. 写成矩阵形式并解释每个矩阵对象来自哪里。
6. 比较直接线性求解与迭代 policy evaluation。
7. 解释迭代为什么逐步传播远期奖励以及收敛的含义。
8. 从 state value 过渡到 action value：固定第一步动作再评价未来。

### 04 Bellman 最优方程

必需顺序：

1. 先定义策略偏序和 optimal policy，而不是直接写 max。
2. 从所有策略中的最优 value 建立 BOE。
3. 证明 probability-weighted average 最大化等价于 action maximum。
4. 把 BOE 视为 nonlinear fixed-point equation。
5. 定义 contraction，并用几何/数值例子解释。
6. 用 contraction theorem 得到存在性、唯一性和迭代可解性。
7. 证明由 optimal value 提取的 greedy policy 确实 optimal。
8. 分析 γ、奖励强度、仿射奖励变换和 detour 对策略的影响。

### 05 Value Iteration、Policy Iteration 与 TPI

必需顺序：

1. 从 contraction fixed-point iteration 得到 VI。
2. 把一次 VI 拆成 q 计算、greedy policy 和 value 更新。
3. 用完整 q table 演示至少两轮，而非只显示残差曲线。
4. 从“能否更充分评价当前策略”引出 PI。
5. 回答 PI 的四个 why：如何评价、为何改善、为何终止、与 VI 什么关系。
6. 展示 PI 初始化、evaluation、improvement、stability test 的完整伪代码。
7. 比较 VI 与 PI 的计算分配，而不只比较迭代轮数。
8. 用截断 evaluation 连成 TPI，并解释 convergence proposition。

### 06 Monte Carlo Learning

必需顺序：

1. 用均值估计说明无模型时如何用数据替代期望。
2. 回到 PI，指出 policy evaluation 的模型依赖。
3. 把动作价值写成 episode return 的期望，得到 model-free evaluation。
4. 展示 MC Basic 的两步循环和完整伪代码。
5. 用 Grid World 逐步执行：起点、动作、episode、return、Q 更新、policy improvement。
6. 说明 MC Basic 为什么浪费 episode 中其他访问数据。
7. 从只更新起点推广到更新所有访问过的 state-action pair。
8. 比较每批 episode 更新一次策略与每条 episode 在线更新。
9. 解释覆盖不足为什么破坏 policy improvement，引出 Exploring Starts。
10. 解释 Exploring Starts 的现实局限，引出 soft policy。
11. 推导 ε-greedy 的概率分配并解释 exploitation/exploration。
12. 展示 MC Exploring Starts 和 MC ε-Greedy 的完整差异。
13. 区分 greedy optimality、ε-soft optimality 与 consistency。

### 07 随机逼近与步长

必需顺序：

1. 从样本均值的 batch 形式推到递推形式。
2. 展示固定步长如何改变历史权重并获得 tracking 能力。
3. 把 mean estimation 写成 root-finding problem。
4. 定义 noisy observation 和 Robbins-Monro 更新。
5. 用无噪声和有噪声 toy root 分别演示方向。
6. 解释单调性、无偏噪声、步长条件分别负责什么。
7. 解释两条步长级数条件为何不是形式要求。
8. 将 mean estimator 明确识别为 RM 特例。
9. 从 expected gradient root 推出 SGD。
10. 解释 SGD 靠近最优点后相对噪声为何变大。
11. 比较 BGD、MBGD、SGD 的方向质量、计算量和更新频率。

### 08 TD Prediction

必需顺序：

1. 用逐级复杂的随机期望例子连接 RM 与 Bellman target。
2. 定义 TD target、TD error 和状态更新，并标注每个时刻何时可见。
3. 解释 TD 是给定策略预测，不是控制。
4. 从 Bellman equation 写 root，再用 transition sample 构造 noisy residual。
5. 说明真实 successor value 被当前估计替换的两处修改。
6. 给出完整 TD(0) 伪代码和逐 transition 例子。
7. 解释 coverage、step size 与 continuing/episodic boundary 条件。
8. 系统比较 MC 与 TD 的 update timing、bias、variance、memory 和 non-episodic applicability。

### 09 Sarsa、n-step Sarsa 与 Q-learning

必需顺序：

1. 从 state-value TD 转到 action-value TD。
2. 展示 Sarsa 五元组、target、更新和完整伪代码。
3. 说明 Sarsa evaluation 怎样加入 policy improvement 成为 control。
4. 用路径例子展示 ε-greedy policy 在学习中变化。
5. 从 1-step target 推到 n-step Sarsa，并解释 delayed update。
6. 从 policy evaluation 转到 BOE，引出 Q-learning max target。
7. 给出 Q-learning 的 on-policy collection 与 off-policy collection 两种实现。
8. 定义 behavior/target policy，并给出判定算法是否 on/off-policy 的步骤。
9. 用探索不足例子说明 off-policy 也需要 coverage。
10. 用统一 target 形式比较 Sarsa、n-step Sarsa、MC 和 Q-learning。

### 10 Value Function Approximation

必需顺序：

1. 说明 table 在大状态空间中的存储与泛化失败。
2. 定义 parameterized value/action value 和 feature representation。
3. 用 weighted MSE 说明 stationary distribution 为何进入目标。
4. 从完整 gradient descent 到 sample SGD，再到 TD semi-gradient。
5. 明确 semi-gradient 忽略了 target 对参数的依赖。
6. 用线性特征展示 parameter sharing、generalization 和 interference。
7. 给出线性 TD convergence 的条件和结论含义。
8. 扩展到 Sarsa/Q-learning function approximation，并说明 off-policy 风险。

### 11 Deep Q-learning

必需顺序：

1. 从 nonlinear Q network 和 squared TD loss 开始。
2. 逐步求导，显示同一网络同时产生 prediction 与 target 的耦合。
3. 解释为何 target 必须在一段时间内视作固定监督信号。
4. 引入 online/main 与 target network，给出同步方式。
5. 展示连续轨迹样本的相关性为何破坏 minibatch 假设。
6. 定义 replay buffer、uniform sampling 和数据复用。
7. 对照 tabular Q-learning 解释为何共享参数放大相关性问题。
8. 给出完整 DQN rollout/store/sample/target/update/sync 伪代码。
9. 用一个 replay batch 追踪每条 transition 的 target 和 loss。

### 12 Policy Gradient

必需顺序：

1. 比较 tabular policy 与 parameterized policy。
2. 先回答“最优策略用哪个 scalar metric 定义”。
3. 分别定义 average state value 的两种 state distribution 情况。
4. 定义 continuing average reward，并说明其 trajectory estimate。
5. 解释 discounted value 与 average reward 的关系和适用边界。
6. 推导 policy gradient theorem 的可采样形式。
7. 展开 log-derivative trick，而非只给恒等式。
8. 用 softmax 分量解释选择动作与未选择动作的梯度方向。
9. 给出 gradient ascent 与 REINFORCE 完整伪代码。
10. 用 trajectory contribution 解释方差并引出 baseline。

### 13 Actor-Critic

必需顺序：

1. 从 REINFORCE 的 delayed/high-variance weight 引出 learned critic。
2. 展示最简单 Q Actor-Critic 及 action-value critic 的数据需求。
3. 完整证明 baseline invariance。
4. 解释 baseline 如何降方差，并保留 optimal baseline 结论。
5. 令 baseline 为 state value，得到 advantage gradient。
6. 证明 TD error 的条件期望等于 advantage。
7. 给出 A2C/TD Actor-Critic 的完整双更新伪代码。
8. 用同一 transition 展示 Actor 与 Critic 的参数变化。
9. 从分布错配例子推导 importance sampling ratio。
10. 给出 off-policy policy gradient 与 actor-critic 更新。
11. 解释 ratio 高方差，并桥接 PPO。
12. 将 deterministic policy gradient/actor-critic 作为明确扩展层保留。

### 14 PPO

必需顺序：

1. 从 off-policy Actor-Critic 的 ratio 高方差与 old-policy data reuse 开始。
2. 定义 old policy snapshot 和 probability ratio。
3. 从 importance-weighted objective 推到 surrogate objective。
4. 解释为什么同一 batch 多轮更新会让 surrogate 失真。
5. 逐样本推导 clipped objective，分别处理正负 advantage。
6. 说明 clipping 是 conservative surrogate，不是严格 trust region。
7. 加入 value loss、entropy bonus、advantage normalization 和 minibatch epochs。
8. 给出 rollout → GAE → update epochs → diagnostics → refresh old policy 的完整伪代码。
9. 联合解释 approximate KL、clip fraction、value loss 与 entropy。

### 15 Token MDP Bridge

必需顺序：

1. 从 Grid World 的 state/action/transition 映射到 prompt 与生成前缀。
2. state 是 prompt 加当前 prefix，而不是单个 token。
3. action 是 vocabulary 上的 next-token choice。
4. transition 是把 token 确定性追加到 prefix；策略仍是概率分布。
5. EOS 定义 episodic boundary，长度上限是外部截断。
6. sequence reward 通常在末尾可见，形成 credit-assignment 问题。
7. value、return、TD error、advantage 映射到 token position。
8. 明确哪些经典假设保留，哪些因大模型系统而改变。

### 16 语言模型 PPO 后训练系统

必需顺序：

1. 说明初始 policy 来自监督微调，而非随机初始化。
2. 说明 preference data 如何训练 reward model。
3. 冻结 reference model，并解释其与 old policy 的不同职责。
4. rollout workers 生成 response，同时记录 old log-probability。
5. reward model 给 sequence score，KL 形成 token-level shaping。
6. value model 提供 token value，GAE 生成 advantage/return target。
7. 同一 batch 进入多轮 PPO minibatch update。
8. 区分更新 policy/value 与保持 reference/reward frozen。
9. 明确 batch id、seed、mask、EOS、version 和 normalization contract。
10. 用一个 response 从 prompt 追踪到 loss，并展示 stale rollout、reward hacking、KL collapse 等故障信号。

### 17–21 现代扩展的必需脉络

- **17 DPO**：从 KL 正则化策略目标求最优策略，反解隐式奖励，消去同 prompt 配分函数，再得到成对 logistic loss；同时说明离线覆盖、偏好噪声与长度捷径。
- **18 GRPO / RLVR**：定义成组在线采样、组均值与方差、相对优势、裁剪和参考约束；零方差组、动态采样、非对称裁剪与长度归一化必须分别解释。
- **19 Coding RL**：从执行结果向量推导 outcome、partial 与 weighted reward，再把编译和测试反馈写入下一状态；可见测试捷径、隐藏测试与沙箱边界必须可交互观察。
- **20 Agent MDP**：明确工具调用 action、环境 observation、历史/记忆 state、转移、终止、预算和轨迹概率；不能把多轮 Agent 简化为一次长文本生成。
- **21 长程信用分配**：比较终局广播、折扣回报、过程奖励、分段 advantage 与事后反事实归因；每种密集化方法都要同时展示新增信息和偏差来源。

## 4. 实施顺序

1. 先改渲染协议，使章节支持连续 narrative、完整 pseudocode、worked example 和一个或多个嵌入式实验。
2. 以第 06 章作为新的算法黄金章节，验证内容密度和专用交互语法。
3. 按依赖顺序完成 01–05、07–13；每章完成后运行 source coverage contract。
4. 补齐第 15 章并重构 14–16，再按训练对象拆分 17–21。
5. 最后进行 01–21 的首次概念、LaTeX、双语、桌面/移动端和跨章依赖验收。
