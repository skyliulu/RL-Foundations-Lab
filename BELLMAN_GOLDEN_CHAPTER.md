# Bellman 黄金章节 Storyboard

- 章节 ID：`03-bellman-expectation`
- 版本：`v0.1`
- 日期：`2026-07-19`
- 主要来源：L2 `State Value and Bellman Equation` PDF pp.6-53
- 当前实现基础：`src/components/BellmanLab.jsx`

## 1. 本章完成后的能力

读者完成本章后，应能独立解释：

1. 为什么 return 可以写成 `G_t = R_{t+1} + gamma G_{t+1}`；
2. 为什么对 return 取条件期望会得到 state value；
3. Bellman 方程中的 immediate reward term 和 future value term 分别来自哪里；
4. 一次 backup、反复迭代和 Bellman fixed point 不是同一件事；
5. policy、environment model 与未知 value 在方程中扮演什么角色；
6. continuing task 中 target state 为什么可以拥有接近 `1 / (1-gamma)` 的 value；
7. 矩阵形式 `v_pi = r_pi + gamma P_pi v_pi` 如何表达“每个状态都有一条方程”；
8. state value 为什么还不足以直接选择动作，以及 action value 为什么接着出现。

本章不负责讲 Bellman optimality equation、Value Iteration 或 model-free TD update；它只建立后续三者依赖的 policy-evaluation 语言。

## 2. 前置合同

读者应已理解：

- state、action、policy 与 transition probability；
- reward、trajectory 与 episode；
- discounted return 的定义；
- 条件期望的基本含义。

页面提供一个可折叠的 return 回顾，但不重新完整教授 L1。

## 3. 全章节奏

```text
问题：长期价值为什么能由一步表达？
  ↓
Return 的递归：G_t = R_{t+1} + gamma G_{t+1}
  ↓
对当前状态取条件期望：v_pi(s) = E[G_t | S_t=s]
  ↓
拆成即时奖励与未来回报两个期望
  ↓
用 policy 和 environment model 展开两个期望
  ↓
在 Grid World 中执行一次真实 backup
  ↓
连续迭代，观察信息传播与 fixed point
  ↓
把所有状态方程合并为 v = r + gamma Pv
  ↓
State value → Action value → 下一章 optimality
```

## 4. Storyboard

### Scene 0：Driving Question

**学习任务**

把读者从“value 是一个分数”的直觉，转向“value 是未来随机回报的条件期望”。

**页面内容**

- 标题：为什么一步更新能够表达长期价值？
- 一段问题描述：轨迹可能无限延伸，但方程只向前看一步。
- 前置标签：state、action、reward、return。
- 三层路线：观察一次 backup → 理解两项分解 → 进入矩阵 fixed point。

**交互**

无主交互，只允许点击前置概念查看一句定义。避免在首屏出现参数控制。

**来源**

L2 PDF pp.6-20、p.21。

**完成检查**

读者能说出本章要解决的是“如何计算 state value”，而不是“如何寻找最优动作”。

### Scene 1：Return 先具有递归结构

**学习任务**

先证明递归来自 return 自身，而不是来自某个算法技巧。

**页面内容**

逐行展示：

```text
G_t = R_{t+1} + gamma R_{t+2} + gamma^2 R_{t+3} + ...
    = R_{t+1} + gamma (R_{t+2} + gamma R_{t+3} + ...)
    = R_{t+1} + gamma G_{t+1}
```

说明括号中的未来部分只是从下一时间步重新开始的 return。

**交互**

一个短 trajectory strip。悬停或选择 `R_{t+1}` 时只高亮第一段；选择 `G_{t+1}` 时高亮剩余尾部。

**状态依赖**

只使用静态教学轨迹，不读取 Grid World 运行状态。必须标记为“符号分解”，避免与实际采样混淆。

**来源**

L2 PDF p.22。

**完成检查**

读者能指出 `gamma` 为什么只在未来尾部前出现一次。

### Scene 2：从 Return 到 State Value

**学习任务**

把随机轨迹上的 return 变成给定状态下的平均长期价值。

**页面内容**

```text
v_pi(s)
  = E[G_t | S_t=s]
  = E[R_{t+1} + gamma G_{t+1} | S_t=s]
  = E[R_{t+1} | S_t=s] + gamma E[G_{t+1} | S_t=s]
```

正文解释：同一个 state 可能产生不同 action、reward 和 successor；value 不是某一条轨迹的 return，而是这些可能性的期望。

**交互**

允许在“single trajectory”和“expectation over possibilities”之间切换。当前黄金章节只需使用少量预设分支，不要求真实采样统计。

**来源**

L2 PDF pp.18-19、p.22。

**完成检查**

读者能区分 `G_t`、一次观测 return 与 `v_pi(s)`。

### Scene 3：展开 Immediate Reward Term

**学习任务**

理解即时奖励的平均值同时依赖 policy 和 reward model。

**页面内容**

```text
E[R_{t+1} | S_t=s]
  = sum_a pi(a|s) sum_r p(r|s,a) r
```

先显示 action mixture，再显示每个 action 下的 reward mixture。确定性课件基线中，两层求和会退化为一个具体 reward。

**交互**

点击公式中的 `pi(a|s)` 高亮策略箭头；点击 `p(r|s,a)` 高亮当前转移和奖励标签。

**来源**

L2 PDF p.23。

**完成检查**

读者能解释为什么 reward term 不是简单写成当前格子的颜色。

### Scene 4：展开 Future Value Term

**学习任务**

理解未来项是所有 successor state value 的概率加权，并指出 Markov property 的作用。

**页面内容**

```text
E[G_{t+1} | S_t=s]
  = sum_a pi(a|s) sum_s' p(s'|s,a) v_pi(s')
```

正文强调：一旦下一状态 `s'` 已知，未来回报的条件期望就是 `v_pi(s')`；不再需要保留完整过去历史。

**交互**

动作随机性为 `0` 时只显示一个 successor；调高网站扩展的 randomness 后显示所有 successor、概率和贡献。

**来源**

L2 PDF p.24。

**完成检查**

读者能说出确定性路径只是一般概率期望的特殊情况。

### Scene 5：合并为 Bellman Equation

**学习任务**

把前两项重新合并，并明确哪些量已知、哪些量待求。

**页面内容**

```text
v_pi(s) = sum_a pi(a|s) [
  sum_r p(r|s,a) r
  + gamma sum_s' p(s'|s,a) v_pi(s')
]
```

三类符号标记：

- 已知策略：`pi(a|s)`；
- 已知模型：`p(r|s,a)`、`p(s'|s,a)`；
- 待求 value：`v_pi(s)`、`v_pi(s')`。

页面给出一句关键结论：每个 state 都有一条这样的方程，因此未知 value 彼此依赖。

**交互**

公式的两大括号与 Grid World/Value Table 建立双向高亮。

**来源**

L2 PDF pp.25-26。

**完成检查**

读者能指出 bootstrapping 出现在 `v_pi(s')` 被用于更新 `v_pi(s)` 的位置。

### Scene 6：Bellman Microscope

**学习任务**

用课件 5×5 世界把整条公式压缩到一次可检查的数值代入。

**默认状态**

- state：`(row 4, col 2)`，是一个 forbidden 状态；
- fixed policy action：right；
- successor：target `(row 4, col 3)`；
- reward：`+1`；
- `gamma=0.9`；
- 初始 value table：全零；
- action randomness：`0`。

**首次观察**

```text
target = 1 + 0.9 × 0 = 1
V_before(4,2) = 0
V_after(4,2)  = 1
```

必须解释：这只是第一次 backup 的结果，不是课件最终显示的 `10.0`。

**已有实现**

- Grid World 与固定/贪心策略；
- Value Table；
- 单步、连续、undo、reset；
- 当前 state/action/reward/successor；
- target、before/after 和 residual。

**待补实现**

- 公式项与画布双向高亮的完整状态机；
- 展开所有 transition contributions；
- 与当前伪代码行联动；
- 作者预设切换；
- `exact backup` 的显式证据类型标记。

**来源**

L2 PDF pp.25-30、pp.40-43。

### Scene 7：四个作者预设

#### 7A Target Propagation

- 固定策略、`gamma=0.9`、randomness `0`。
- 从全零 value 开始连续 sweep。
- 观察 target 附近状态先变为正值，然后沿策略传播。
- 区分“单状态 backup 次数”和“完整 sweep 次数”。

#### 7B Boundary Self-loop

- 选择顶部状态并使用向上动作的 action-value 检查模式。
- 显示 successor 仍为当前状态，但 reward 为 `-1`。
- 展开 `q_pi(s,up) = -1 + gamma v_pi(s)`。
- 解释 next state 没变不代表 reward 为零。

#### 7C Discount Horizon

- 锁定 policy、environment 和收敛阈值。
- baseline 使用 `gamma=0.9`，challenger 使用 `0.5`。
- 并排显示 converged value difference，不比较不同迭代预算下的未收敛表。
- 观察远离 target 的状态受影响更大。

#### 7D Expected Transition

- baseline randomness `0`，challenger 使用正值。
- 显示每个 successor 的 probability、reward、future value 与 contribution。
- 标记这是网站扩展，不是课件默认环境。

### Scene 8：从 25 条方程到矩阵形式

**学习任务**

解释矩阵形式不是新的假设，只是把每个 state 的方程放在一起。

**页面内容**

```text
v_pi(s) = r_pi(s) + gamma sum_s' p_pi(s'|s) v_pi(s')

v_pi = r_pi + gamma P_pi v_pi
```

允许展开：

```text
v_pi = (I - gamma P_pi)^(-1) r_pi
v_{k+1} = r_pi + gamma P_pi v_k
```

主线优先解释 iterative solution，因为它与当前 sweep 画布直接对应；closed form 进入深入层。

**交互**

从 Grid World 选择一个 state 时，高亮 `P_pi` 的对应行；第一版可使用结构示意，不要求显示完整 25×25 数字矩阵。

**来源**

L2 PDF pp.34-42。

**完成检查**

读者能解释一次 sweep 与 `v_{k+1} = r + gamma Pv_k` 的对应关系。

### Scene 9：Action Value 与下一章接口

**学习任务**

指出 state value 评价“从状态出发并遵循 policy”的平均结果，但选择动作需要比较 `q_pi(s,a)`。

**页面内容**

```text
q_pi(s,a) = E[G_t | S_t=s, A_t=a]
v_pi(s) = sum_a pi(a|s) q_pi(s,a)
```

使用 boundary action 展示：

```text
q_pi(s, up) = -1 + gamma v_pi(s)
```

结尾问题：如果我们在每个 state 都选择最大的 action value，会得到什么方程？链接到 Bellman optimality 章节。

**来源**

L2 PDF pp.46-53。

## 5. 页面信息层级

### 默认可见

- Driving question；
- return 三行递归；
- Bellman 两项分解；
- Grid World 与一次 backup；
- 三个主预设入口；
- 矩阵形式的概念桥梁；
- action value transfer。

### 深入层

- 条件期望的逐步全展开；
- Markov property 的严格使用位置；
- 25×25 transition matrix 结构；
- closed-form solution；
- iterative solution 收敛说明。

### 暂不进入

- contraction mapping 的完整证明；
- Bellman optimality equation；
- sample-based TD update；
- 函数近似。

## 6. 内容与实验状态

静态内容不得保存运行数值。章节内容只引用语义角色，例如 `selectedState`、`successor`、`target`。具体数字必须由 Grid World 引擎计算。

黄金章节共享以下运行状态：

```text
environment
policyMode
gamma
actionRandomness
selectedState
selectedAction
valueTable
updateHistory
residualHistory
evidenceMode: exact | sample | aggregate
activePreset
activeFormulaTerm
```

任何公式数值、状态标签、热力图、曲线和伪代码高亮都从这份状态派生。

## 7. 双语与术语

- 中文为默认叙述语言，英文结构必须等价。
- `state value` 首次出现写作“状态价值（state value）”，后续统一使用“状态价值”。
- `Bellman backup` 保留英文 backup，但首次解释为“一次目标计算与回写”。
- `bootstrapping` 首次解释为“用已有估计更新另一个估计”。
- continuing task 不翻译成“无限任务”；使用“持续型任务（continuing task）”。
- forbidden state 统一为“禁区状态”，不得称作“墙”或“障碍”。

## 8. 来源标记

正式页面至少显示以下来源：

- Return recursion：L2 PDF p.22；
- Bellman 两项推导：L2 PDF pp.23-26；
- 课件固定策略与 value 表：L2 PDF pp.40-44；
- Matrix-vector form：L2 PDF pp.34-38；
- Action value：L2 PDF pp.46-53。

网站页面只链接公开课程仓库，不显示本机 PDF 路径。

## 9. 黄金章节完成定义

完成条件沿用 `CURRICULUM_MAP.md`，并增加：

- Scene 0-9 都有正式中文内容和结构等价英文内容；
- 任何静态推导图都明确标记为符号示意；
- 任何运行数字都来自当前实验状态；
- 读者无需打开开发者工具即可复现四个作者预设；
- 页面结尾可以自然进入 Bellman optimality，而不提前讲解 `max` 算子。
