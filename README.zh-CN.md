# RL Foundations Lab

[English](./README.md) · 简体中文

[在线体验](https://skyliulu.github.io/RL-Foundations-Lab/) · [GitHub 仓库](https://github.com/skyliulu/RL-Foundations-Lab)

**强化学习原理实验室：从网格世界到大语言模型后训练。**

RL Foundations Lab 是一门面向具备概率、微积分和基础优化知识学习者的双语交互式强化学习课程。它沿着 *Mathematical Foundations of Reinforcement Learning* 的理论主线展开，但不把内容压缩成知识卡片：定义、推导、算法动机、伪代码与局限仍然保留在连续正文中，交互实验则把原本需要写代码才能观察的中间状态直接嵌入章节。

项目希望回答的不只是“算法怎么做”，还包括：前一种方法为什么不够、新机制改变了什么、公式为什么成立，以及参数变化如何沿着算法链路影响最终结果。

## 学习路径

课程共 16 章，默认中文，并可随时切换英文。

### 第一部分 · 数学基础与动态规划

- **01 网格世界与交互基础**：状态、动作、奖励、策略、环境模型与 Markov 性。
- **02 Return 与 State Value**：从奖励序列、折扣回报到状态价值。
- **03 Bellman 方程**：从价值定义逐步推导一步递归关系。
- **04 Bellman 最优方程**：让动作价值竞争，并理解最优策略的来源。
- **05 更新顺序与收敛**：比较 Value Iteration、Policy Iteration 与 Truncated Policy Iteration。

### 第二部分 · 无模型学习

- **06 Monte Carlo Learning**：从完整 episode 到 Basic MC、Exploring Starts 与 ε-greedy control。
- **07 随机逼近与步长**：理解增量均值、噪声、步长条件与收敛权衡。
- **08 TD Prediction**：通过 bootstrap 在 episode 结束前更新价值。
- **09 Sarsa 与 Q-learning**：比较 on-policy 与 off-policy control 的目标和行为。

### 第三部分 · 函数近似与策略学习

- **10 Value Function Approximation**：用参数共享把一次样本推广到相似状态。
- **11 Deep Q-learning**：理解 replay buffer、target network 与训练稳定性。
- **12 Policy Gradient**：直接优化策略，并解释梯度估计的来源与方差。
- **13 Actor–Critic**：用 Critic 的价值估计改善 Actor 的策略更新。

### 第四部分 · 语言模型后训练

- **14 PPO**：从 advantage、importance ratio 到 clipped surrogate objective。
- **15 Token MDP**：把 prompt、token、response 与序列奖励映射到强化学习对象。
- **16 后训练方法与系统**：从数据来源、反馈信号、模型角色和在线/离线学习方式比较 PPO-based RLHF、DPO 与 GRPO。

## 交互式学习

交互不是正文之外的演示动画，而是论证的一部分。当前课程包含：

- 贯穿经典章节的同一套 5×5 Course World，可观察状态、动作、奖励、策略与价值如何共同变化；
- Return Observatory、Bellman Microscope、Optimality Switch 与 Planning Arena，用于追踪回报、单步 backup、动作竞争和算法收敛；
- Monte Carlo episode tape、动作价值表与策略更新，用同一条轨迹比较不同 MC control 方法；
- 随机逼近、TD、Sarsa/Q-learning、函数近似、DQN、Policy Gradient 与 Actor–Critic 的章节内参数实验；
- PPO Clip Plane，用样本级 ratio 与 advantage 直接显示哪些更新被裁剪；
- Token Trajectory Lab 与后训练方法图谱，在可追溯的数据和更新信号上比较 PPO-based RLHF、DPO 与 GRPO。

公式推导保留完整的等式链。每一步都可以被选中，并在右侧工作台中查看使用的规则、假设、符号含义和当前数值解释。

## 产品原则

- **先解释 why，再呈现 how**：每个机制都从上一种方法的不足开始。
- **数学主线不缩水**：交互用于增强理解，不替代必要的定义、证明与推导。
- **实验与公式共享状态**：画布、表格、曲线和公式数值来自同一份运行数据。
- **无状态、浏览器端运行**：不需要账号，不保存学习进度或实验参数，不请求远端计算 API；页眉只匿名读取公开的 GitHub Star 数。
- **中英文结构等价**：两种语言共享章节结构、公式、实验和参考资料。

## 本地运行

需要 Node.js 与 npm。

```bash
npm install
npm run dev
```

验证测试与生产构建：

```bash
npm test
npm run build
```

## 当前状态与边界

01–16 章均已形成可运行的双语学习路径，经典基础、无模型方法、函数近似、PPO 和语言模型后训练已经连成一条连续主线。部分中段章节的交互仍在从参数实验继续加强为更细粒度的算法内部状态可视化。

项目是教学工具，不是通用 RL 训练框架：所有实验在浏览器内运行；Grid World 使用精确或可复现的教学计算；PPO 与语言模型章节不训练真实神经网络，也不需要后端算力。

## 参考资料

- [Mathematical Foundations of Reinforcement Learning](https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning)
- [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347)
- [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)
- [Direct Preference Optimization](https://arxiv.org/abs/2305.18290)
- [DeepSeekMath / GRPO](https://arxiv.org/abs/2402.03300)

每章末尾还会列出与该章定义、推导和算法直接对应的来源。

## 项目文档

- [产品蓝图](./PRODUCT_BLUEPRINT.md)
- [课程地图](./CURRICULUM_MAP.md)
- [章节重构审计](./CHAPTER_REBUILD_AUDIT.md)
- [实施路线图](./EXECUTION_ROADMAP.md)
