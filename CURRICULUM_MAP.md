# RL Foundations Lab 完整课程地图

- 文档版本：`v0.1`
- 日期：`2026-07-19`
- 状态：执行基线
- 适用范围：完整 v1 课程、黄金章节和后续章节排期

## 1. 这份地图解决什么

本文件把三种结构对齐：

1. *Mathematical Foundations of Reinforcement Learning* L1-L10 的理论脉络；
2. 网站中适合阅读和交互的章节边界；
3. 每章必须实现的画布、参数、证据和验收结果。

它不是教材目录的翻译，也不是组件清单。网站章节可以拆分或组合课件内容，但不得打断“MDP → value → Bellman → optimality → model-free learning → approximation → policy optimization → Actor-Critic”的概念主线。

下文页码均指 `Lecture slides/slidesContinuouslyUpdated` 中 PDF 的实际页码，而不是页脚显示的演示文稿页码。

## 2. 全课程结构

```text
Part I  数学对象与已知模型
  01 MDP 与课件 Grid World
  02 Return、折扣与 State Value
  03 Bellman 期望方程
  04 最优策略与 Bellman 最优方程
  05 Value Iteration 与 Policy Iteration

Part II 从模型转向经验
  06 Monte Carlo Learning
  07 随机逼近与步长
  08 TD Prediction
  09 Sarsa、Q-learning 与 On/Off-policy Control

Part III 从表格走向函数与策略
  10 Value Function Approximation
  11 Deep Q-learning
  12 Policy Gradient
  13 Actor-Critic

Part IV 现代策略优化与语言模型
  14 PPO
  15 Token MDP Bridge
  16 语言模型 PPO 后训练系统
```

推荐主阅读路径为 01 → 16。已经理解经典 RL 的读者可以从 12 开始，但 14 仍要求理解 03、08、12 和 13 中的 value、TD error、importance ratio 与 advantage。

## 3. 章节-课件-交互映射

| ID | 网站章节 | 课件或论文依据 | 唯一主问题 | 核心画布 | 必须看见的证据 | 当前状态 |
|---|---|---|---|---|---|---|
| 01 | MDP 与课件 Grid World | L1 pp.4-27 | state、action、transition、reward 与 policy 怎样组成一个 MDP？ | Course World Explorer | 当前状态、五种动作、边界反弹、禁区/目标奖励、轨迹与转移概率 | 已完成 |
| 02 | Return、折扣与 State Value | L1 pp.19-25；L2 pp.6-20 | 为什么即时奖励不能代表一个状态的长期好坏？ | Return Observatory + Value Lens | 每一步 reward 对 return 的贡献、不同 `gamma` 的权重、样本均值与精确 value 的差距 | 已完成 |
| 03 | Bellman 期望方程 | L2 pp.21-53 | 为什么长期价值可以由一步奖励和后继价值递归表达？ | Bellman Microscope | 一次精确 backup、公式逐项代入、更新前后值、残差与信息传播 | 黄金章节；已完成 |
| 04 | 最优策略与 Bellman 最优方程 | L3 pp.6-45 | 从评价当前策略到寻找最优策略，方程右侧改变了什么？ | Optimality Switch | 同一状态各动作的 `q(s,a)` 竞争、`expectation → max`、策略随奖励和 `gamma` 改变 | 已完成 |
| 05 | Value Iteration 与 Policy Iteration | L4 pp.5-38 | 不同求解调度如何到达同一个最优不动点？ | Planning Arena | policy change、backup 数、逐状态残差和 value 传播；不能只显示最终值 | 已完成 |
| 06 | Monte Carlo Learning | L5 pp.5-47 | 没有环境模型时，如何从完整 episode 估计 value？ | Episode Tape + MC Lab | first/every visit、return 样本分布、访问次数、估计误差和探索覆盖 | 待实现 |
| 07 | 随机逼近与步长 | L6 pp.7-60 | 为什么带噪声的增量更新能够逼近期望，步长又决定什么？ | Stochastic Approximation Lab | 固定/衰减步长下的收敛、震荡、偏差和多 seed 波动带 | 待实现 |
| 08 | TD Prediction | L7 pp.6-23 | 为什么不等待 episode 结束也能学习？ | Target Comparator | MC target、TD(0) target 与 n-step target 的信用跨度、bias/variance 和 TD error | 待实现 |
| 09 | Sarsa、Q-learning 与 Control | L7 pp.25-54 | on-policy 与 off-policy 为什么会学出不同的风险行为？ | Control Arena | 行为策略/目标策略、实际访问热力图、更新目标、危险状态频率与累计回报 | 待实现 |
| 10 | Value Function Approximation | L8 pp.5-160 | value 表无法枚举时，参数怎样在状态之间共享？ | Function Studio | 特征、参数更新、预测曲面、状态间干扰、近似误差和 stationary distribution | 待实现 |
| 11 | Deep Q-learning | L8 pp.162-226 | target network 与 replay 分别缓解了什么不稳定性？ | DQN System Lab | online/target 网络、replay 抽样、target 漂移、样本相关性和训练曲线 | 待实现 |
| 12 | Policy Gradient | L9 pp.6-41 | 怎样直接提高高回报动作的概率？ | Policy Gradient Studio | softmax 概率、trajectory contribution、梯度方向、方差和 average value/reward 指标 | 待实现 |
| 13 | Actor-Critic | L10 pp.6-54 | Critic 怎样给 Actor 提供更及时且低方差的学习信号？ | Actor-Critic Loop | value、TD error、advantage、actor/critic 两次更新及 importance sampling | 已有结构样张 |
| 14 | PPO | PPO 论文；承接 L10 pp.13-43 | 如何复用 rollout，又不让新策略一次偏离旧策略过远？ | PPO Update Lab | ratio、advantage、clipped/unclipped objective、KL、epochs 与 value loss | 已有局部原型 |
| 15 | Token MDP Bridge | L1-L10 抽象对象；现代扩展 | 经典 RL 的 state/action/trajectory 如何变成 token 生成对象？ | Representation Morph | prompt + prefix、next token、EOS、sequence reward 与 token-level credit 的逐步映射 | 待实现 |
| 16 | 语言模型 PPO 后训练系统 | PPO；RLHF 系统资料 | PPO 的数学对象如何成为 policy/reference/reward/value/rollout 的工程生命周期？ | Shared-batch System Map | 同一 batch 的模型调用、reward、KL、advantage、ratio、minibatch 和参数更新 | 已有系统样张 |

## 4. 课件章节边界

### L1：Basic Concepts

- pp.4-18：Grid World、state、action、transition、policy 与 reward；进入章节 01。
- pp.19-25：trajectory、return、discounted return 与 episode；进入章节 02。
- pp.26-27：MDP 抽象；作为章节 01 的收束与章节 02 的前置。

### L2：State Value and Bellman Equation

- pp.6-20：return、state value 与记号；进入章节 02。
- pp.21-38：Bellman 方程、推导、例子与矩阵形式；进入章节 03。
- pp.40-44：课件 5×5 世界中的策略与 state value；作为章节 03 的数值基线。
- pp.46-51：action value；作为章节 04 的桥梁。

### L3：Optimal Policy and Bellman Optimality Equation

- pp.6-23：optimal policy、BOE 与右侧 maximization；进入章节 04 主叙事。
- pp.25-31：contraction 与求解；进入章节 04 深入层。
- pp.33-44：policy optimality 与参数变化；进入 Optimality Switch 的预设实验。

### L4：Value Iteration and Policy Iteration

- pp.5-13：Value Iteration；进入章节 05。
- pp.15-29：Policy Iteration；进入章节 05。
- pp.31-37：VI/PI 比较与 Truncated PI；进入章节 05 深入层。

### L5：Monte Carlo Learning

- pp.5-15：Monte Carlo estimation 与 model-free policy iteration；章节 06 前半。
- pp.16-34：MC basic、逐步例子、数据与更新效率；章节 06 核心画布。
- pp.36-47：soft/epsilon-greedy policy、exploring starts 与 exploration；章节 06 后半并桥接章节 09。

### L6：Stochastic Approximation

- pp.7-33：mean estimation、Robbins-Monro 与收敛；章节 07 主体。
- pp.37-60：SGD、收敛模式与 BGD/MBGD/SGD；章节 07 深入层，并为函数近似提供优化前置。

### L7：Temporal-Difference Learning

- pp.6-23：TD state value、更新思想与收敛；章节 08。
- pp.25-36：Sarsa 与 n-step Sarsa；章节 09 前半。
- pp.38-54：Q-learning、on/off-policy 与统一视角；章节 09 后半。

### L8：Value Function Methods

- pp.5-139：从表格到函数、目标函数、stationary distribution、优化与线性逼近；章节 10。
- pp.141-160：理论分析、Sarsa/Q-learning function approximation；章节 10 深入层。
- pp.162-226：Deep Q-learning、two networks 与 experience replay；章节 11。

### L9：Policy Gradient Methods

- pp.6-11：policy gradient 基本思想；章节 12 的观察层。
- pp.14-26：average value / average reward 两类指标；章节 12 机制层。
- pp.28-41：梯度与 gradient ascent；章节 12 核心推导和画布。

### L10：Actor-Critic Methods

- pp.6-9：最简单 Actor-Critic；章节 13 起点。
- pp.13-22：baseline invariance 与 advantage Actor-Critic；章节 13 主体。
- pp.26-31：例子；章节 13 单步显微镜。
- pp.33-43：importance sampling 与 off-policy Actor-Critic；章节 13 深入层并桥接 PPO。
- pp.45-54：deterministic policy gradient / actor-critic；章节 13 扩展阅读。

## 5. 共享 Grid World 数据契约

课件基线世界不是墙体迷宫，而是 continuing task：

| 对象 | 固定定义 |
|---|---|
| 网格 | 5×5，课件行列编号均从 1 开始 |
| Forbidden | `(row 2, col 2)`、`(2,3)`、`(3,3)`、`(4,2)`、`(4,4)`、`(5,2)`；可以进入 |
| Target | `(row 4, col 3)`；不是 terminal state |
| 动作 | up、right、down、left、stay |
| 越界 | reward `-1`，下一状态仍为当前状态 |
| 进入 forbidden | reward `-1`，下一状态为该 forbidden 状态 |
| 进入 target | reward `+1`，下一状态为 target |
| 其他转移 | reward `0` |
| 课件基线 | deterministic transition，`gamma = 0.9` |
| 固定策略 | L2 PDF p.43 第一组 good policy |

章节 01-09 默认复用这份数据契约。任何专题变体必须显式列出变化项。例如 Cliff World 是章节 09 的专题环境，不得覆盖共享世界定义。

## 6. 交互语法

全站不统一成一种画布，但复用以下交互语法，使读者形成稳定操作预期。

| 编号 | 交互语法 | 适用问题 | 必须共享的状态 |
|---|---|---|---|
| G1 | World Explorer | 理解环境对象、策略与转移 | environment、policy、current state、trajectory |
| G2 | Step Microscope | 理解一次 backup/sample/gradient update | before、sample、target、after、residual/error |
| G3 | Episode Tape | 理解沿时间展开的 reward、return 和 credit | states、actions、rewards、returns、termination |
| G4 | Algorithm Arena | 公平比较算法或调度 | environment、initialization、budget、seed protocol |
| G5 | Curve Lab | 参数敏感性与统计规律 | configuration、seed set、raw runs、aggregate metrics |
| G6 | Function Studio | 理解特征、参数和泛化 | features、weights、predictions、loss |
| G7 | Policy Studio | 理解 probability、gradient、advantage 和 ratio | policy distribution、sample、gradient/update |
| G8 | System Map | 理解模型角色与数据生命周期 | shared batch、model versions、artifacts、dependencies |

公式、伪代码、画布和指标只允许引用同一个实验状态。若某个图是静态解释图而非当前运行结果，必须明确标记为“示意”。

## 7. 每章内容合同

每个正式章节至少包含以下块，允许改变布局但不允许缺少语义：

1. **Driving Question**：一个可以由本章实验回答的问题。
2. **Prerequisite Contract**：最多列出三个真正需要的前置节点。
3. **Observation Setup**：先让读者预测或观察，再引出公式。
4. **Core Derivation**：只保留解释画布所需的主推导；完整证明进入深入层。
5. **Interactive Evidence**：画布必须产生本章结论需要的证据。
6. **Mechanism Explanation**：把观察结果重新绑定到公式和算法步骤。
7. **Failure or Boundary Case**：至少一个参数失效、假设破坏或常见误解。
8. **Transfer**：说明本章对象在下一章如何被复用或替换。
9. **Summary**：用对象、机制和限制收束，不用算法步骤复读全文。
10. **Sources**：精确到课件 lecture/PDF page 或原始论文。

## 8. 参数开放规则

每章默认可见参数不超过四个。参数必须属于以下一类：

- 改变数学对象，例如 `gamma`、`alpha`、`epsilon`、`lambda`；
- 改变比较协议，例如 budget、seed count、evaluation sweeps；
- 改变环境假设，例如 forbidden reward、action randomness、termination；
- 改变模型结构，例如 feature set、target update interval、clip range。

作者必须为每个开放参数填写：默认值、合理范围、会改变的中间量、预期现象、是否需要 reset，以及它属于课件基线还是网站扩展。

## 9. 黄金章节：03 Bellman 期望方程

### 9.1 正式章节节奏

1. 从“为什么即时奖励不够”回顾 return 与 state value。
2. 在课件固定策略中选择 `(row 4, col 2)`，观察它向右进入 target。
3. 先展示 `reward = 1` 和 successor value，再写出 Bellman target。
4. 执行一次 backup，显示 `0 → 1`，并解释它仍不是收敛 value。
5. 连续 sweep，观察 `+1` 从 target 周围向外传播。
6. 选择边界状态，观察越界的 `-1 + gamma V(s)` 自循环。
7. 改变 `gamma`，与 L2/L3 的课件 value 表对照。
8. 打开动作随机性扩展，说明精确期望为何变成概率加权。
9. 进入矩阵形式 `v = r + gamma Pv` 和不动点解释。
10. 以“Bellman 是分解长期回报的方法，不是某个训练算法”收束。

### 9.2 默认预设

| 预设 | 固定条件 | 学习者应观察到 |
|---|---|---|
| Target propagation | fixed policy，`gamma=0.9`，randomness=0 | target 周围先变为正值，价值沿策略方向传播 |
| Boundary penalty | 选择顶部状态并尝试 up | 下一状态不变，但 target 中出现 reward `-1` |
| Discount horizon | 对比 `gamma=0.9` 与 `0.5` | 较小 `gamma` 让远期 target 奖励影响快速衰减 |
| Expected transition | randomness 从 `0` 调到正值 | 单一路径代入变为所有 successor 的概率加权 |

### 9.3 黄金章节验收

- 数值测试复现课件 `gamma=0.9` 的一位小数 value 表。
- 单步更新只提交一次历史记录，undo/reset 行为确定。
- 点击公式项可以高亮网格状态或参数；点击状态可以定位公式代入项。
- fixed policy、greedy policy 与 environment reward 来自同一引擎。
- 正文、图注、交互提示和公式解释均有中英文等价内容。
- 不依赖颜色单独区分 forbidden、target、selected 和 successor。
- 1280px 以上完整显示三栏；窄屏仍可阅读并完成单步更新。
- 每个结论都能追溯到课件页码或当前运行数据。

## 10. 章节完成定义

一个章节只有同时满足以下条件，才能从“样张”变为“完成”：

- **内容完成**：内容合同十项齐全，中英文结构一致。
- **数值完成**：核心公式和基准结果有自动化测试。
- **交互完成**：默认、单步、播放、参数变化、undo/reset 路径已验证。
- **实验完成**：作者预设现象可以稳定复现，并说明随机性与 seed 协议。
- **视觉完成**：桌面和窄屏经过实际渲染检查，无截断、重叠或不可读标签。
- **来源完成**：课件页码和论文链接可追溯，无本机路径暴露在网站内容中。
- **迁移完成**：章节结尾明确指出下一个概念为什么需要出现。

## 11. 现代部分边界

完整 v1 的现代主线到 PPO-based language-model post-training 为止。DPO、GRPO、Agent RL 和过程奖励属于扩展区，除非它们能回答 PPO 主线无法回答的新问题。

现代章节必须同时讲清：

- 数学层：advantage、importance ratio、clip、GAE、KL 和 loss；
- 数据层：prompt、response、token logprob、reward、value 与 batch；
- 系统层：policy、reference、reward、value、rollout 和 update lifecycle；
- 限制层：reward hacking、分布偏移、KL 约束和工程成本。

## 参考

- [Mathematical Foundations of Reinforcement Learning](https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning)
- [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347)
- [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)
