# M2 · Bellman 黄金章节验收记录

- 验收日期：2026-07-19
- 验收范围：章节 03 · Bellman 期望方程
- 实施结论：工程、内容、数值、交互和响应式验收通过；真实学习者理解度需要后续可用性测试持续验证。

## 1. 审计中发现并修正的问题

- `CURRICULUM_MAP.md` 与 storyboard 规定 Discount Horizon 使用 `γ=0.90 / γ=0.50`；早期实现误用了 `0.40`。现已统一为 `0.50`，并由比较协议测试锁定。
- 320px 视口曾因 `body min-width: 320px` 与滚动条宽度叠加产生页面级横向溢出；现已移除该下限，并把移动章节导航改为 2×2 网格。
- Bellman 组件曾分别维护 selection、history、residual、phase 和 playback；现已接入共享 Step Microscope 状态接口。
- 交互伪代码和比较标签曾直接写在组件中；现已进入中英文结构化内容并接受 schema 校验。

## 2. `CURRICULUM_MAP.md` 黄金章节验收

| 条件 | 证据 | 结果 |
|---|---|---|
| 复现 `γ=0.9` 一位小数 value 表 | `COURSE_FIXED_POLICY_VALUES` 与 fixed-policy 回归测试，最大误差 `0.041` | 通过 |
| 单步只提交一次历史，undo/reset 确定 | Step outcome/commit 契约、浏览器单步回归 | 通过 |
| 公式与网格双向定位 | `focusTerm` 驱动公式、网格、value table 和伪代码 | 通过 |
| fixed/greedy/reward 共享引擎 | `src/engine/gridworld.js` | 通过 |
| 中英文内容等价 | content schema、双语 preset 与 pseudocode ID 对齐测试 | 通过 |
| 不只依赖颜色 | forbidden/target 奖励文字、selected 实线、successor 虚线与 `s/s′` 标签 | 通过 |
| 桌面三栏，窄屏可单步 | 1280px、390px、320px 实际渲染与交互检查 | 通过 |
| 结论可追溯 | L2 PDF 页码、公开课程仓库链接、当前运行数值 | 通过 |

## 3. 章节完成定义

| 维度 | 结果 | 说明 |
|---|---|---|
| 内容完成 | 通过 | Scene 0-9、观察/机制/深入、小结、来源和中英文结构均已接入 |
| 数值完成 | 通过 | 环境、单步、收敛、课件表、折扣协议均有自动化测试 |
| 交互完成 | 通过 | 默认、单步、播放、参数、preset、undo/reset 路径可运行 |
| 实验完成 | 通过 | 四个作者预设确定性复现；随机性扩展使用精确期望，无采样 seed |
| 视觉完成 | 通过 | 桌面、390px、320px 无页面级横向溢出或不可读主标签 |
| 来源完成 | 通过 | 页面只暴露公开链接和精确 PDF 页码，不暴露本机路径 |
| 迁移完成 | 通过 | 章节以 action value 问题进入下一章 Bellman optimality |

## 4. M2 退出条件

- 黄金章节验收：通过。
- 内容与 UI 分离：章节叙事、preset、pseudocode、来源和比较标签由结构化内容提供。
- Step Microscope 可复用接口：已冻结状态、phase、outcome、undo/reset 与 playback 边界，见 `STEP_MICROSCOPE_CONTRACT.md`。
- 学习结果：页面提供从 return 到 action value 的完整解释链；“读者能否独立解释”保留为后续真实用户测试指标，不以内部自评替代。

## 5. 后续入口

M2 实施工作完成。下一阶段进入 M3，优先补齐章节 01 MDP/Grid World 与章节 02 Return/Value，使 Bellman 黄金章节不再是孤立入口；章节 04 Optimality 将作为 Step Microscope 契约的第二个真实消费者。

