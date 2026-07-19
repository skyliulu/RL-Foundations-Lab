# 强化学习数学基础 · 交互原型

一个面向具备概率、微积分与基础优化知识读者的无状态强化学习学习网站。产品沿用 *Mathematical Foundations of Reinforcement Learning* 的概念主线，把需要在代码中运行的参数实验嵌入章节阅读，并延伸到 Actor–Critic、PPO 与语言模型后训练。

## 当前已实现

- Part I 完整阅读路径：01 MDP、02 Return/State Value、03 Bellman 期望方程、04 Bellman 最优方程、05 Value/Policy Iteration。
- 五个章节画布：Course World Explorer、Return Observatory、Bellman Microscope、Optimality Switch 与 Planning Arena，共用课件一致的 5×5 Grid World。
- 可复现实验：精确 value 与固定 seed 采样、单步 backup/undo、`expectation → max` 动作竞争，以及 VI、Truncated PI、PI 在累计 backups 轴上的公平比较。
- Actor–Critic / PPO：从 critic、advantage 过渡到 PPO-Clip，在样本平面上直接观察哪些更新被裁剪。
- PPO 后训练系统：算法视图与工程视图共享同一个 rollout batch、seed、reward、advantage、ratio 与 KL 约束。
- 完整中英文切换；刷新页面即恢复默认值，不使用账号、远端 API 或浏览器持久化存储。

## 本地运行

```powershell
npm install
npm run dev
```

打开终端输出的本地地址。生产构建与验证：

```powershell
npm test
npm run build
```

## 实现边界

算法核心位于 `src/engine/`，与 React 渲染层分离。Grid World 使用浏览器端精确动态规划；PPO 使用固定、可复现的教学样本，展示 clipped surrogate objective 的真实数值变化。MVP 不训练真实神经网络，也不请求后端计算资源。

## 产品与实施文档

- [产品蓝图](./PRODUCT_BLUEPRINT.md)：产品边界、体验原则与正式范围。
- [完整课程地图](./CURRICULUM_MAP.md)：L1-L10 页码映射、16 个网站章节、交互语法与完成定义。
- [实施路线图](./EXECUTION_ROADMAP.md)：从当前样张到 Bellman 黄金章节和完整 v1 的里程碑。
- [Bellman 黄金章节 Storyboard](./BELLMAN_GOLDEN_CHAPTER.md)：L2 推导节奏、交互场景、实验状态和章节验收。
- [M2 黄金章节验收](./M2_ACCEPTANCE.md)：数值、内容、交互、响应式和迁移条件的逐项证据。
- [Part I 验收](./PART_I_ACCEPTANCE.md)：01–05 的内容、数值、交互、双语与响应式证据。
- [Step Microscope 契约](./STEP_MICROSCOPE_CONTRACT.md)：后续算法章节共享的 phase、step outcome 与 undo/reset 协议。
