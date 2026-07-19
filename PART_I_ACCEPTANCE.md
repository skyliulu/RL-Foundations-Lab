# Part I · 01–05 验收记录

- 日期：`2026-07-19`
- 范围：MDP 与课程世界 → Return/State Value → Bellman 期望方程 → Bellman 最优方程 → Value/Policy Iteration
- 结论：M3 经典已知模型主线完成，可进入 M4 Model-free Learning。

## 1. 五章交付矩阵

| 章 | 核心学习对象 | 主交互 | 可检查证据 | 课件定位 |
|---|---|---|---|---|
| 01 | `S/A/P/R/π` 与 Markov 性 | Course World Explorer | 状态、动作、后继分支、奖励与轨迹纸带 | L1 PDF pp.4–27 |
| 02 | discounted return 与 `Vπ(s)` | Return Observatory + Value Lens | 单条 return 分解、精确期望、固定 seed 样本与运行均值 | L1 PDF pp.19–25；L2 PDF pp.16–19 |
| 03 | Bellman 期望方程 | Bellman Microscope | 一次 backup 的 before、概率贡献、target、after 与 residual | L2 PDF pp.18–53 |
| 04 | `Tπ → T*` 与 greedy policy | Optimality Switch | 同一价值快照下五动作竞争、奖励/折扣敏感性、commit/undo | L3 PDF pp.6–45 |
| 05 | VI、Truncated PI 与 PI | Planning Arena | 累计 backups、policy updates、残差曲线和三张传播图 | L4 PDF pp.5–38 |

## 2. 数值与状态契约

- 五章共用 `src/engine/gridworld.js` 的 5×5 continuing Grid World、动作集合、固定策略与奖励模型。
- forbidden cell 是可进入状态；越界留在原地；target 不终止任务。
- Return 使用确定性 seed 与显式截断尾界；精确值和采样值使用同一环境、策略与折扣。
- Optimality 在同一 successor-value snapshot 上比较五个 `q(s,a)`；默认风险预设在 `s12` 显示 `2.54 → 8.00`、残差 `5.46`。
- Planning 的横轴为累计 state backups，不把不同深度的 outer iteration 当作等成本；三种算法收敛到同一 `V*`。

## 3. 自动验证

- `npm test`：34/34 通过。
- `npm run build`：Vite 生产构建通过，36 个模块完成转换。
- 测试覆盖环境概率归一化、课件奖励规则、fixed-policy/optimal value 基线、Return 可复现性、Optimality 动作最大化、VI/TPI/PI 同一极限、Step Microscope commit/undo/reset 与无远端/无持久化约束。

## 4. 实机浏览器验收

- 桌面：01–05 逐章核对标题、编号、一个主画布和一个课件定位区；页面无运行时错误文本。
- Return：随机预设生成并显示 32 个可选择样本。
- Optimality：backup 后仍保留更新前证据；`s12` 从 `2.54` 更新为 `8.00`，undo 恢复 `2.54`。
- Planning：一张残差曲线、三行算法结果和三张逐状态传播图同时可见。
- 双语：英文标题、画布 aria label 与英文课件来源均可访问。
- 响应式：在真实 `390 × 844` viewport 下逐章检查，五章 `scrollWidth <= clientWidth`，主画布宽度均收敛到 337px，无横向溢出。

## 5. 迁移到 M4

Part I 的共同数据对象是“已知模型下的一步期望与动态规划”。M4 需要保留同一课程世界与轨迹语义，但把精确转移期望替换为 episode 样本；优先复用固定 seed、Return 分解和章节来源合同，再增加跨章节统一的 episode/visit 数据模型与多 seed 汇总协议。
