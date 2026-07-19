# Step Microscope 交互契约

## 1. 目的

Step Microscope 负责把一次算法更新变成可追溯的教学序列：

```text
select → action → target → assign
             before → expectation → target → after
```

它只统一状态和更新证据，不统一章节布局。Bellman、Optimality、MC、TD 和 PPO 可以共享这套协议，但仍使用各自最适合的画布。

当前实现位于 `src/interaction/stepMicroscope.js`，Bellman 的第一个真实消费者是 `src/components/BellmanLab.jsx`。

## 2. 共享运行状态

| 字段 | 含义 | 约束 |
|---|---|---|
| `selected` | 当前被解释的状态、动作或样本 | 由章节定义具体类型 |
| `values` | 当前算法状态的可视化快照 | 每次 commit 产生新引用 |
| `focusTerm` | 当前公式/画布焦点 | 用于双向联动，不复制数值 |
| `phase` | `select/action/target/assign` | 只表达真实执行顺序 |
| `lastStep` | 最近一次提交的更新证据 | 未执行时为 `null` |
| `residuals` | 最近更新的误差轨迹 | 有界队列，默认最多 40 项 |
| `playing` | 当前是否连续推进 | select、reset、undo 会停止播放 |
| `canUndo` | 是否存在可恢复快照 | 从 history 派生，不单独存储 |

## 3. Step outcome 契约

算法引擎提交一次更新时必须提供：

```js
{
  values,       // 更新后的算法状态
  before,       // 被更新量的旧值
  expectation,  // 样本、分支或模型期望的证据，可为 null
  target,       // 本步目标
  after,        // 实际写回值；省略时等于 target
  residual      // target - before 或章节定义的等价残差
}
```

`before`、`target`、`after` 和 `residual` 必须是有限数值。公式、网格、表格、伪代码和残差曲线只读取这一个 outcome，不允许复制一套展示数字。

## 4. 状态转换

- `select(selection)`：更新选择，焦点回到 state，停止播放，不改算法值。
- `focus(term)`：只改变解释焦点，并把 state/action/其他项映射到对应 phase。
- `commit({ selection, outcome })`：保存一个 before 快照，提交一次 outcome，追加一个 residual，并进入 assign。
- `undo()`：恢复且只恢复一个历史快照，同时移除最后一个 residual。
- `reset(snapshot)`：确定性载入章节默认值或作者预设，清空 history 与 lastStep。
- `setPlaying()`：控制连续执行；算法如何枚举状态、样本或 minibatch 仍由章节负责。

## 5. 章节适配

| 章节 | `selected` | `expectation` | `values` | `residual` |
|---|---|---|---|---|
| Bellman | grid state | successor probability/reward/value | state-value table | Bellman residual |
| Optimality | state + candidate action | all action targets | value + greedy policy | optimality residual |
| MC | trajectory/time step | sampled return suffix | return/value estimates | return estimation error |
| TD | transition | reward + successor estimate | value/Q table | TD error |
| PPO | rollout sample/token | ratio, advantage, clip branch | policy/value metrics | objective/KL change |

下一章只有在真实接入时才提取共享视觉组件；当前冻结的是状态与证据协议，避免用 Bellman 的三栏布局约束其他算法。

## 6. 验收不变量

1. 一次 commit 只增加一条 history 和一项 residual。
2. undo 只撤销一次 commit；reset 清空全部临时历史。
3. preset、公式、画布和伪代码读取同一份当前状态。
4. refresh 不恢复任何实验状态，接口不调用持久化或远端 API。
5. 连续播放仍由真实 step outcome 推进，不能只播放预制动画。

