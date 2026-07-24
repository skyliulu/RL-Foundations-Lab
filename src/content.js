import { bellmanChapter } from './content/bellman.js'
import { mdpChapter } from './content/mdp.js'
import { returnChapter } from './content/returns.js'
import { optimalityChapter } from './content/optimality.js'
import { planningChapter } from './content/planning.js'
import { ppoChapter } from './content/ppo.js'
import { rlhfChapter } from './content/rlhf-system.js'
import { tokenMdpChapter } from './content/token-mdp.js'
import { agentMdpChapter, codingRlChapter, creditChapter, dpoChapter, grpoChapter } from './content/modern-extension.js'
import { actorCriticChapter, approximationChapter, controlChapter, dqnChapter, monteCarloChapter, policyGradientChapter, tdChapter, vfaChapter } from './content/part23.js'
import { stochasticApproximationContent } from './content/stochastic-approximation-flow.js'
import { articleFlowChapterIds, buildChapterArticleFlow } from './content/article-flow.js'

export const copy = {
  zh: {
    brand: '强化学习原理实验室',
    lab: '从网格世界到大语言模型后训练',
    toc: '学习地图',
    chapters: [
      { id: 'mdp', number: '01', kicker: '基本概念', title: '强化学习的基本概念', subtitle: '从状态、动作、策略和奖励建立决策模型' },
      { id: 'returns', number: '02', kicker: '策略评价', title: '回报与价值函数', subtitle: '用长期回报评价策略' },
      { id: 'bellman', number: '03', kicker: '策略评价', title: 'Bellman 方程', subtitle: '用一步递推求解给定策略的价值' },
      { id: 'optimality', number: '04', kicker: '最优控制', title: 'Bellman 最优方程', subtitle: '从策略评价走向最优控制' },
      { id: 'planning', number: '05', kicker: '动态规划', title: '值迭代与策略迭代', subtitle: '在模型已知时求解最优策略' },
      { id: 'montecarlo', number: '06', kicker: '无模型学习', title: 'Monte Carlo 方法', subtitle: '在模型未知时用完整回合估计价值' },
      { id: 'approximation', number: '07', kicker: '增量学习', title: '随机逼近与随机梯度下降', subtitle: '用增量更新逼近期望方程的解' },
      { id: 'td', number: '08', kicker: '无模型预测', title: '时间差分学习', subtitle: '不等待回合结束的价值学习' },
      { id: 'control', number: '09', kicker: '无模型控制', title: 'Sarsa 与 Q-learning', subtitle: '从策略内更新到策略外控制' },
      { id: 'vfa', number: '10', kicker: '函数近似', title: '价值函数近似', subtitle: '用共享参数处理大状态空间' },
      { id: 'dqn', number: '11', kicker: '深度价值学习', title: 'Deep Q-learning', subtitle: '用目标网络和经验回放稳定 Q-learning' },
      { id: 'policygradient', number: '12', kicker: '策略优化', title: '策略梯度方法', subtitle: '直接优化动作概率' },
      { id: 'actorcritic', number: '13', kicker: '策略与价值协同', title: 'Actor–Critic 方法', subtitle: '用价值估计降低策略梯度方差' },
      { id: 'ppo', number: '14', kicker: '策略优化', title: 'Proximal Policy Optimization（PPO）', subtitle: '约束策略更新并复用 rollout' },
      { id: 'tokenmdp', number: '15', kicker: '语言模型强化学习', title: '语言模型的 MDP 表示', subtitle: '把语言生成写成 token 级决策过程' },
      { id: 'rlhf', number: '16', kicker: '在线偏好优化', title: '基于 PPO 的 RLHF', subtitle: '让偏好奖励进入在线策略优化' },
      { id: 'dpo', number: '17', kicker: '离线偏好优化', title: 'Direct Preference Optimization（DPO）', subtitle: '直接从离线偏好对更新策略' },
      { id: 'grpo', number: '18', kicker: '在线可验证奖励', title: 'Group Relative Policy Optimization（GRPO）', subtitle: '用同题候选的相对奖励替代 Critic' },
      { id: 'codingrl', number: '19', kicker: '可执行反馈', title: '基于可执行反馈的 Coding RL', subtitle: '用编译和测试结果训练代码策略' },
      { id: 'agentmdp', number: '20', kicker: '工具型 Agent', title: '工具型 Agent 的 MDP', subtitle: '用工具调用与环境观察定义交互轨迹' },
      { id: 'credit', number: '21', kicker: '长程 Agent', title: '长程 Agent 的信用分配', subtitle: '把终局结果归因到关键决策' },
    ],
    prerequisites: '前置：状态、动作、奖励与回报',
    mdp: { ...mdpChapter.zh, sources: mdpChapter.sources },
    returns: { ...returnChapter.zh, sources: returnChapter.sources },
    bellman: { ...bellmanChapter.zh, sources: bellmanChapter.sources },
    optimality: { ...optimalityChapter.zh, sources: optimalityChapter.sources },
    planning: { ...planningChapter.zh, sources: planningChapter.sources },
    montecarlo: { ...monteCarloChapter.zh, sources: monteCarloChapter.sources },
    approximation: { ...approximationChapter.zh, ...stochasticApproximationContent.zh, sources: approximationChapter.sources },
    td: { ...tdChapter.zh, sources: tdChapter.sources },
    control: { ...controlChapter.zh, sources: controlChapter.sources },
    vfa: { ...vfaChapter.zh, sources: vfaChapter.sources },
    dqn: { ...dqnChapter.zh, sources: dqnChapter.sources },
    policygradient: { ...policyGradientChapter.zh, sources: policyGradientChapter.sources },
    actorcritic: { ...actorCriticChapter.zh, sources: actorCriticChapter.sources },
    ppo: { ...ppoChapter.zh, sources: ppoChapter.sources, acBridge: 'Actor–Critic 的核心接口没有消失：Critic 仍估计状态价值，advantage 仍决定策略更新方向；PPO 只改造 Actor 如何复用旧策略采集的数据。' },
    tokenmdp: { ...tokenMdpChapter.zh, sources: tokenMdpChapter.sources },
    rlhf: { ...rlhfChapter.zh, sources: rlhfChapter.sources },
    dpo: { ...dpoChapter.zh, sources: dpoChapter.sources },
    grpo: { ...grpoChapter.zh, sources: grpoChapter.sources },
    codingrl: { ...codingRlChapter.zh, sources: codingRlChapter.sources },
    agentmdp: { ...agentMdpChapter.zh, sources: agentMdpChapter.sources },
    credit: { ...creditChapter.zh, sources: creditChapter.sources },
    common: {
      gamma: '折扣因子 γ', noise: '动作随机性（扩展）', policy: '策略', fixed: '示例固定策略', greedy: '贪心策略',
      previous: '上一步', step: '单步更新', play: '连续播放', pause: '暂停', reset: '重置',
      grid: '网格世界', value: '状态价值 V(s)', update: '本步更新', controls: '参数与操作',
      currentState: '当前状态', action: '选择动作', reward: '即时奖励', nextState: '下一状态', target: '目标值',
      before: '更新前', after: '更新后', residual: 'Bellman 残差', iterations: '更新步数', sweeps: '完整 sweep',
      synchronous: '同步值迭代', inplace: '原地值迭代', sameConditions: '比较条件已锁定', backups: 'backup 次数', converged: '收敛轮数',
      clip: '裁剪范围 ε', strength: '更新强度', klBeta: 'KL 惩罚 β', algorithm: '算法视图', system: '系统视图',
      ratio: '新旧策略比 rₜ', advantage: '优势 Aₜ', clipped: '已裁剪', free: '未裁剪', samples: '同一批 rollout 样本',
      selectSample: '选择一个样本查看它如何穿过整条链路', adjustedReward: 'KL 后奖励', objective: '代理目标', meanKl: '近似 KL',
      prompt: 'Prompt', rollout: 'Rollout workers', policyModel: 'Policy model', reference: 'Reference model', rewardModel: 'Reward model', valueModel: 'Value model', gae: 'GAE / advantages', updateModel: 'PPO minibatch update',
      depthObserve: '观察', depthMechanism: '机制', depthDeep: '深入',
    },
  },
  en: {
    brand: 'RL Foundations Lab',
    lab: 'From Grid Worlds to Language-Model Post-Training',
    toc: 'Learning map',
    chapters: [
      { id: 'mdp', number: '01', kicker: 'Basic concepts', title: 'Foundations of Reinforcement Learning', subtitle: 'Build a decision model from states, actions, policies, and rewards' },
      { id: 'returns', number: '02', kicker: 'Policy evaluation', title: 'Returns and Value Functions', subtitle: 'Evaluate a policy by its long-term return' },
      { id: 'bellman', number: '03', kicker: 'Policy evaluation', title: 'The Bellman Equation', subtitle: 'Solve a fixed policy through one-step recursion' },
      { id: 'optimality', number: '04', kicker: 'Optimal control', title: 'The Bellman Optimality Equation', subtitle: 'Move from policy evaluation to optimal control' },
      { id: 'planning', number: '05', kicker: 'Dynamic programming', title: 'Value Iteration and Policy Iteration', subtitle: 'Solve for an optimal policy when the model is known' },
      { id: 'montecarlo', number: '06', kicker: 'Model-free learning', title: 'Monte Carlo Methods', subtitle: 'Estimate value from complete episodes without a model' },
      { id: 'approximation', number: '07', kicker: 'Incremental learning', title: 'Stochastic Approximation and SGD', subtitle: 'Approach expectation-defined solutions incrementally' },
      { id: 'td', number: '08', kicker: 'Model-free prediction', title: 'Temporal-Difference Learning', subtitle: 'Learn value before an episode terminates' },
      { id: 'control', number: '09', kicker: 'Model-free control', title: 'Sarsa and Q-learning', subtitle: 'Move from on-policy updates to off-policy control' },
      { id: 'vfa', number: '10', kicker: 'Function approximation', title: 'Value Function Approximation', subtitle: 'Handle large state spaces with shared parameters' },
      { id: 'dqn', number: '11', kicker: 'Deep value learning', title: 'Deep Q-learning', subtitle: 'Stabilize Q-learning with target networks and replay' },
      { id: 'policygradient', number: '12', kicker: 'Policy optimization', title: 'Policy Gradient Methods', subtitle: 'Optimize action probabilities directly' },
      { id: 'actorcritic', number: '13', kicker: 'Policy and value', title: 'Actor–Critic Methods', subtitle: 'Reduce policy-gradient variance with value estimates' },
      { id: 'ppo', number: '14', kicker: 'Policy optimization', title: 'Proximal Policy Optimization (PPO)', subtitle: 'Constrain policy updates while reusing rollouts' },
      { id: 'tokenmdp', number: '15', kicker: 'Language-model RL', title: 'The MDP Formulation of Language Models', subtitle: 'Write language generation as a token-level decision process' },
      { id: 'rlhf', number: '16', kicker: 'Online preference optimization', title: 'PPO-based RLHF', subtitle: 'Bring preference rewards into online policy optimization' },
      { id: 'dpo', number: '17', kicker: 'Offline preference optimization', title: 'Direct Preference Optimization (DPO)', subtitle: 'Update a policy directly from offline preference pairs' },
      { id: 'grpo', number: '18', kicker: 'Online verifiable rewards', title: 'Group Relative Policy Optimization (GRPO)', subtitle: 'Replace the critic with relative rewards among responses' },
      { id: 'codingrl', number: '19', kicker: 'Executable feedback', title: 'Coding RL with Executable Feedback', subtitle: 'Train code policies with compilation and test results' },
      { id: 'agentmdp', number: '20', kicker: 'Tool-using agents', title: 'The MDP of a Tool-Using Agent', subtitle: 'Define trajectories through tool calls and observations' },
      { id: 'credit', number: '21', kicker: 'Long-horizon agents', title: 'Credit Assignment for Long-Horizon Agents', subtitle: 'Attribute terminal outcomes to consequential decisions' },
    ],
    prerequisites: 'Prerequisites: states, actions, rewards, and returns',
    mdp: { ...mdpChapter.en, sources: mdpChapter.sources },
    returns: { ...returnChapter.en, sources: returnChapter.sources },
    bellman: { ...bellmanChapter.en, sources: bellmanChapter.sources },
    optimality: { ...optimalityChapter.en, sources: optimalityChapter.sources },
    planning: { ...planningChapter.en, sources: planningChapter.sources },
    montecarlo: { ...monteCarloChapter.en, sources: monteCarloChapter.sources },
    approximation: { ...approximationChapter.en, ...stochasticApproximationContent.en, sources: approximationChapter.sources },
    td: { ...tdChapter.en, sources: tdChapter.sources },
    control: { ...controlChapter.en, sources: controlChapter.sources },
    vfa: { ...vfaChapter.en, sources: vfaChapter.sources },
    dqn: { ...dqnChapter.en, sources: dqnChapter.sources },
    policygradient: { ...policyGradientChapter.en, sources: policyGradientChapter.sources },
    actorcritic: { ...actorCriticChapter.en, sources: actorCriticChapter.sources },
    ppo: { ...ppoChapter.en, sources: ppoChapter.sources, acBridge: 'The Actor–Critic interface remains: the critic estimates state value and advantage sets direction. PPO changes how the actor reuses data sampled by an old policy.' },
    tokenmdp: { ...tokenMdpChapter.en, sources: tokenMdpChapter.sources },
    rlhf: { ...rlhfChapter.en, sources: rlhfChapter.sources },
    dpo: { ...dpoChapter.en, sources: dpoChapter.sources },
    grpo: { ...grpoChapter.en, sources: grpoChapter.sources },
    codingrl: { ...codingRlChapter.en, sources: codingRlChapter.sources },
    agentmdp: { ...agentMdpChapter.en, sources: agentMdpChapter.sources },
    credit: { ...creditChapter.en, sources: creditChapter.sources },
    common: {
      gamma: 'Discount γ', noise: 'Action randomness (extension)', policy: 'Policy', fixed: 'Example fixed policy', greedy: 'Greedy policy',
      previous: 'Undo', step: 'Single update', play: 'Play', pause: 'Pause', reset: 'Reset',
      grid: 'Grid world', value: 'State value V(s)', update: 'Current update', controls: 'Parameters & actions',
      currentState: 'Current state', action: 'Selected action', reward: 'Immediate reward', nextState: 'Next state', target: 'Target',
      before: 'Before', after: 'After', residual: 'Bellman residual', iterations: 'Updates', sweeps: 'Full sweeps',
      synchronous: 'Synchronous VI', inplace: 'In-place VI', sameConditions: 'Comparison conditions locked', backups: 'Backups', converged: 'Sweeps to converge',
      clip: 'Clip range ε', strength: 'Update strength', klBeta: 'KL penalty β', algorithm: 'Algorithm view', system: 'System view',
      ratio: 'Policy ratio rₜ', advantage: 'Advantage Aₜ', clipped: 'Clipped', free: 'Unclipped', samples: 'One shared rollout batch',
      selectSample: 'Select one sample and follow it through the entire pipeline', adjustedReward: 'Reward after KL', objective: 'Surrogate objective', meanKl: 'Approx. KL',
      prompt: 'Prompt', rollout: 'Rollout workers', policyModel: 'Policy model', reference: 'Reference model', rewardModel: 'Reward model', valueModel: 'Value model', gae: 'GAE / advantages', updateModel: 'PPO minibatch update',
      depthObserve: 'Observe', depthMechanism: 'Mechanism', depthDeep: 'Deep dive',
    },
  },
}

const visibleSectionTitles = {
  zh: {
    returns: { 'reward-to-return': '从即时奖励到长期回报', 'two-return-calculations': 'Return 的两种等价计算', 'return-distribution': 'Return 分布与状态价值' },
    bellman: { 'return-recursion': 'Return 的一步递推', 'four-state-worked-system': '四状态 Bellman 方程组', 'matrix-and-iteration': '矩阵形式与迭代策略评价', 'state-to-action-value': '从状态价值到动作价值' },
    optimality: { 'evaluation-control': '从策略评价到最优控制', 'contraction-proof': 'Bellman 最优算子的压缩性', 'greedy-policy-proof': '由最优价值构造贪心策略', 'reward-transformations': '奖励变换如何影响最优策略' },
    planning: { 'value-iteration': '评估深度决定算法形式', 'vi-complete-loop': 'Value Iteration', 'pi-four-whys': 'Policy Iteration', 'tpi-continuum': 'Truncated Policy Iteration' },
    td: { timing: '一次转移即可产生学习目标', 'bellman-sample-logic': '从 Bellman 期望到单步样本', 'td-zero-complete': 'TD(0) 完整算法', 'mc-td-matched-comparison': 'Monte Carlo 与 TD 的差异' },
    control: { 'prediction-control': '在学习价值的同时改进策略', 'sarsa-complete-loop': 'Sarsa', 'q-learning-off-policy': 'Q-learning', 'n-step-and-cliff': 'n-step Sarsa 与悬崖世界' },
    vfa: { capacity: '用共享参数表示价值函数', 'objective-and-semi-gradient': '加权近似误差与 semi-gradient', 'linear-sharing': '线性特征与参数共享', 'approximate-control': '近似动作价值控制' },
    dqn: { coupling: '神经网络使 Q-learning 产生新的不稳定性', 'moving-target': '移动目标为何导致不稳定', 'replay-why': '经验回放的作用', 'dqn-complete': 'DQN 完整训练循环' },
    policygradient: { 'value-policy': '把策略写成可微概率模型', 'objectives-and-occupancy': '策略优化目标与状态分布', 'theorem-to-samples': 'Policy Gradient Theorem', 'reinforce-complete': 'REINFORCE' },
    actorcritic: { roles: '用 Critic 估计动作的相对好坏', 'qac-to-baseline': '从 Q Actor–Critic 到状态基线', 'a2c-shared-transition': 'A2C 的双更新', 'off-policy-and-deterministic': 'Off-policy 与确定性策略梯度' },
    ppo: { 'actor-critic-loop': '在旧策略数据上控制更新幅度', 'ratio-to-clipping-cases': 'Clipped surrogate objective 的四种情况', 'full-objective': 'PPO 的完整目标', 'ppo-complete-loop': 'PPO 训练循环' },
    tokenmdp: { bridge: '把语言生成写成 MDP', 'markov-sufficiency': '状态的 Markov 充分性', 'reward-placement': '序列奖励与 token 级奖励', 'rollout-record': 'Token 轨迹的数据契约' },
    rlhf: { 'pipeline-level': 'RLHF 的三个训练阶段', 'model-provenance': '五类模型的来源与冻结关系', 'sequence-to-token-reward': '从序列分数到 token 奖励', 'batch-contract-and-failures': 'PPO batch 的一致性约束' },
    dpo: { 'why-offline': '从在线 PPO 转向离线偏好优化', 'complete-dpo': 'DPO 的 minibatch 更新', 'failure-modes': '偏好数据的失效模式' },
    grpo: { 'why-online': '在线验证恢复探索', 'complete-grpo': 'GRPO 的完整训练循环', 'stability-family': 'GRPO 的稳定化改进' },
    codingrl: { 'code-as-action': '代码执行结果提供可验证反馈', 'complete-coding-loop': 'Coding RL 的完整训练循环', 'reward-hacking': '奖励投机与测试覆盖' },
    agentmdp: { 'beyond-response': '工具调用把回答扩展成环境交互', 'complete-agent-rollout': 'Agent rollout 的完整执行循环', 'partial-observability': '部分可观测性' },
    credit: { 'sparse-delay': '终局奖励不能区分各步贡献', 'bias-audit': '稠密信用的偏差审计', 'solution-toolbox': '长程信用分配的方法组合' },
  },
  en: {
    returns: { 'reward-to-return': 'From Immediate Reward to Long-Term Return', 'two-return-calculations': 'Two Equivalent Return Calculations', 'return-distribution': 'Return Distributions and State Value' },
    bellman: { 'return-recursion': 'The One-Step Recursion of Return', 'four-state-worked-system': 'A Four-State Bellman System', 'matrix-and-iteration': 'Matrix Form and Iterative Policy Evaluation', 'state-to-action-value': 'From State Value to Action Value' },
    optimality: { 'evaluation-control': 'From Policy Evaluation to Optimal Control', 'contraction-proof': 'Contraction of the Bellman Optimality Operator', 'greedy-policy-proof': 'Recovering a Greedy Policy from Optimal Value', 'reward-transformations': 'Effects of Reward Transformations on Optimal Policies' },
    planning: { 'value-iteration': 'Evaluation Depth Determines the Algorithm', 'vi-complete-loop': 'Value Iteration', 'pi-four-whys': 'Policy Iteration', 'tpi-continuum': 'Truncated Policy Iteration' },
    td: { timing: 'One Transition Is Enough to Form a Learning Target', 'bellman-sample-logic': 'From a Bellman Expectation to One Transition Sample', 'td-zero-complete': 'The Complete TD(0) Algorithm', 'mc-td-matched-comparison': 'Monte Carlo and TD Compared' },
    control: { 'prediction-control': 'Improving the Policy While Learning Value', 'sarsa-complete-loop': 'Sarsa', 'q-learning-off-policy': 'Q-learning', 'n-step-and-cliff': 'n-step Sarsa and the Cliff World' },
    vfa: { capacity: 'Representing Value with Shared Parameters', 'objective-and-semi-gradient': 'Weighted Approximation Error and Semi-Gradients', 'linear-sharing': 'Linear Features and Parameter Sharing', 'approximate-control': 'Approximate Action-Value Control' },
    dqn: { coupling: 'Neural Networks Introduce New Q-learning Instabilities', 'moving-target': 'Moving Targets and Learning Instability', 'replay-why': 'The Role of Experience Replay', 'dqn-complete': 'The Complete DQN Training Loop' },
    policygradient: { 'value-policy': 'Writing the Policy as a Differentiable Probability Model', 'objectives-and-occupancy': 'Policy Objectives and State Distributions', 'theorem-to-samples': 'The Policy Gradient Theorem', 'reinforce-complete': 'REINFORCE' },
    actorcritic: { roles: 'Using a Critic to Estimate Relative Action Quality', 'qac-to-baseline': 'From Q Actor–Critic to a State Baseline', 'a2c-shared-transition': 'The Two Updates in A2C', 'off-policy-and-deterministic': 'Off-Policy and Deterministic Policy Gradients' },
    ppo: { 'actor-critic-loop': 'Controlling Updates on Old-Policy Data', 'ratio-to-clipping-cases': 'The Four Cases of the Clipped Surrogate Objective', 'full-objective': 'The Complete PPO Objective', 'ppo-complete-loop': 'The PPO Training Loop' },
    tokenmdp: { bridge: 'Writing Language Generation as an MDP', 'markov-sufficiency': 'Markov Sufficiency of the State', 'reward-placement': 'Sequence Rewards and Token-Level Rewards', 'rollout-record': 'The Token-Trajectory Data Contract' },
    rlhf: { 'pipeline-level': 'The Three Training Stages of RLHF', 'model-provenance': 'Origins and Freeze States of the Five Model Roles', 'sequence-to-token-reward': 'From a Sequence Score to Token Rewards', 'batch-contract-and-failures': 'Consistency Requirements of a PPO Batch' },
    dpo: { 'why-offline': 'From Online PPO to Offline Preference Optimization', 'complete-dpo': 'DPO Minibatch Updates', 'failure-modes': 'Failure Modes in Preference Data' },
    grpo: { 'why-online': 'Online Verification Restores Exploration', 'complete-grpo': 'The Complete GRPO Training Loop', 'stability-family': 'Stabilizing GRPO' },
    codingrl: { 'code-as-action': 'Execution Results Provide Verifiable Feedback', 'complete-coding-loop': 'The Complete Coding RL Training Loop', 'reward-hacking': 'Reward Hacking and Test Coverage' },
    agentmdp: { 'beyond-response': 'Tool Calls Turn Responses into Environment Interaction', 'complete-agent-rollout': 'The Complete Agent Rollout Loop', 'partial-observability': 'Partial Observability' },
    credit: { 'sparse-delay': 'Terminal Rewards Cannot Distinguish Step Contributions', 'bias-audit': 'Auditing Bias in Dense Credit', 'solution-toolbox': 'Combining Methods for Long-Horizon Credit' },
  },
}

const derivationLabels = {
  zh: {
    returns: ['核心推导', '从奖励序列得到回报与状态价值'],
    bellman: ['Bellman 期望方程', '从 Return 的递推得到 Bellman 方程'],
    optimality: ['最优性推导', '从策略加权得到 Bellman 最优方程'],
    planning: ['动态规划更新', '评估深度连接值迭代与策略迭代'],
    ppo: ['策略比率与裁剪', '从重要性比率得到裁剪代理目标'],
    tokenmdp: ['Token 级决策过程', '将语言生成的各个对象映射为 MDP'],
    rlhf: ['PPO batch', '从序列奖励得到可训练的 PPO batch'],
  },
  en: {
    returns: ['Core derivation', 'From a Reward Sequence to Return and State Value'],
    bellman: ['Bellman expectation equation', 'Deriving the Bellman Equation from Return Recursion'],
    optimality: ['Optimality derivation', 'From Policy Weighting to the Bellman Optimality Equation'],
    planning: ['Dynamic-programming updates', 'Evaluation Depth Connects Value and Policy Iteration'],
    ppo: ['Policy ratios and clipping', 'From Importance Ratios to the Clipped Surrogate Objective'],
    tokenmdp: ['Token-level decision process', 'Mapping Language Generation onto an MDP'],
    rlhf: ['PPO batch', 'From a Sequence Reward to a Trainable PPO Batch'],
  },
}

for (const lang of ['zh', 'en']) {
  for (const chapter of copy[lang].chapters) {
    copy[lang][chapter.id].title = chapter.title
  }
  copy[lang].bellman.summaryTitle = lang === 'zh' ? '一步递推把长期价值变成可求解方程' : 'One-step recursion turns long-term value into a solvable system'
  copy[lang].approximation.summaryTitle = lang === 'zh' ? '步长决定学习器怎样吸收历史证据' : 'Step size determines how a learner absorbs historical evidence'
  for (const id of articleFlowChapterIds) {
    const labels = derivationLabels[lang][id]
    if (labels) {
      copy[lang][id].derivationEyebrow = labels[0]
      copy[lang][id].derivationTitle = labels[1]
    }
    copy[lang][id].articleFlow = buildChapterArticleFlow(id, copy[lang][id], lang)
    const titleOverrides = visibleSectionTitles[lang][id] || {}
    copy[lang][id].articleFlow.forEach((block) => {
      if (titleOverrides[block.id]) block.title = titleOverrides[block.id]
    })
  }
}
