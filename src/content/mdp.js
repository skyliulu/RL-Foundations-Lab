import { assertFoundationChapterDefinition } from './schema.js'

const sources = [
  {
    id: 'grid-world',
    label: 'L1 · Grid world, states, actions, and transitions',
    pages: 'PDF pp.4-10',
    href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning',
  },
  {
    id: 'policy-reward',
    label: 'L1 · Policy, reward, trajectory, and return',
    pages: 'PDF pp.11-25',
    href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning',
  },
  {
    id: 'mdp',
    label: 'L1 · MDP elements and the Markov property',
    pages: 'PDF pp.26-27',
    href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning',
  },
]

const explorer = {
  zh: {
    world: '课程世界', inspector: '一步接口', trajectory: '轨迹纸带', state: '状态', action: '动作', reward: '奖励', successor: '后继状态', probability: '概率', expectedReward: '期望即时奖励', selectAction: '选择动作', followPolicy: '采用 π(s)', showPolicy: '显示策略', hidePolicy: '隐藏策略', reset: '重置轨迹', noise: '动作随机性（扩展）', deterministic: '课件确定性模型', stochastic: '展开所有可能后继', chooseBranch: '点击一个分支，让这次可能结果进入轨迹', clickState: '点击格子可从任意状态重新出发', accessible: '禁区可进入，但奖励 −1', boundary: '越界留在原地，奖励 −1', target: '进入目标，奖励 +1', normal: '普通移动，奖励 0', noTerminal: '目标不是终止态', policyLabel: '课件固定策略 π', distribution: '转移分布 p(s′|s,a)', rewardModel: '奖励模型 p(r|s,a)', stepCount: '步', totalReward: '累计奖励', start: '起点', current: '当前', possible: '可能后继', tupleTitle: '同一次交互，五个 MDP 接口', tupleHint: '改变动作只会改环境响应；策略 π 负责给动作分配概率，二者不是同一个对象。', emptyTrajectory: '从当前状态选择一个动作开始。', courseModel: '课程模型', extension: '网站扩展', branchAction: '进入这个后继', stateSpace: '25 个可访问格子', actionSpace: '上 / 右 / 下 / 左 / 停留', continuing: '持续型任务', policyProbability: 'π(a|s)', chosenByPolicy: '当前策略动作', outcomeNote: '这里不做随机采样；分支由你显式选择，因此每个概率都可检查。', legend: '图例', forbidden: '禁区', goal: '目标', selected: '当前状态', transition: '后继分支', statePrefix: 's',
  },
  en: {
    world: 'Course world', inspector: 'One-step interface', trajectory: 'Trajectory tape', state: 'State', action: 'Action', reward: 'Reward', successor: 'Successor', probability: 'Probability', expectedReward: 'Expected immediate reward', selectAction: 'Choose an action', followPolicy: 'Use π(s)', showPolicy: 'Show policy', hidePolicy: 'Hide policy', reset: 'Reset trajectory', noise: 'Action randomness (extension)', deterministic: 'Course deterministic model', stochastic: 'Expand every possible successor', chooseBranch: 'Click a branch to materialize that possible outcome in the trajectory', clickState: 'Click any cell to restart there', accessible: 'Forbidden cells are accessible, with reward −1', boundary: 'Crossing the boundary stays put, reward −1', target: 'Entering the target gives +1', normal: 'Ordinary movement gives 0', noTerminal: 'The target is not terminal', policyLabel: 'Course fixed policy π', distribution: 'Transition distribution p(s′|s,a)', rewardModel: 'Reward model p(r|s,a)', stepCount: 'steps', totalReward: 'total reward', start: 'Start', current: 'Current', possible: 'Possible successor', tupleTitle: 'One interaction, five MDP interfaces', tupleHint: 'Changing the action changes the environment response. Policy π assigns probabilities to actions; it is not the environment.', emptyTrajectory: 'Choose an action from the current state to begin.', courseModel: 'Course model', extension: 'Site extension', branchAction: 'Take this successor', stateSpace: '25 accessible cells', actionSpace: 'up / right / down / left / stay', continuing: 'Continuing task', policyProbability: 'π(a|s)', chosenByPolicy: 'Current policy action', outcomeNote: 'No random sample is hidden here: you explicitly choose a branch, so every probability remains inspectable.', legend: 'Legend', forbidden: 'Forbidden', goal: 'Target', selected: 'Current state', transition: 'Successor branch', statePrefix: 's',
  },
}

export const mdpChapter = assertFoundationChapterDefinition({
  id: 'mdp',
  sources,
  zh: {
    prerequisite: '前置：概率分布与条件概率的基本直觉',
    summaryTitle: '先把交互接口分清，再开始计算长期价值',
    eyebrow: '第 1 章 · 基本概念与 Markov 决策过程',
    title: '一个智能体究竟在和什么交互？',
    intro: '强化学习先不从算法开始，而从一条最小交互链开始：智能体观察状态，按策略选择动作；环境给出奖励与下一状态。把这条链的接口分清，后面的价值、Bellman 方程与 PPO 才不会混在一起。',
    bridge: '课件用 3×3 图引入概念；本站把同一套定义放进后续章节共用的 5×5 课程世界。禁区仍然可进入但会受罚，越界仍留在原地，目标仍是持续型任务中的普通状态。',
    figure: '交互图 1.1 · Course World Explorer',
    instruction: '先选状态，再选动作；沿一个转移分支向前走，亲手组成轨迹',
    question: '当你只改变动作时，哪些量由策略决定，哪些量由环境决定？',
    prelude: [
      { id: 'agent-environment', kicker: '最小闭环', title: '状态不是地图；状态是决策所需的信息', paragraphs: ['状态 sₜ 是智能体此刻用来做决策的信息。动作 aₜ 作用于环境，环境随后产生奖励 rₜ₊₁ 与下一状态 sₜ₊₁。', '网格只是一种把抽象接口画出来的方法：每一个格子都是状态，五个方向按钮构成动作集合。'] },
      { id: 'policy-model', kicker: '先分清两个概率', title: '策略选择动作，环境产生后继', paragraphs: ['π(a|s) 回答“智能体在状态 s 会怎样行动”；p(s′|s,a) 回答“环境收到动作后会怎样变化”。', '确定性只是概率分布的特殊情况。拖动随机性后，画布会展开多个后继，但不会把策略和环境混成一个旋钮。'] },
    ],
    sections: [
      { id: 'reward-interface', kicker: '奖励不是目的地标签', title: '奖励是一种行为接口', paragraphs: ['奖励标在“转移”上，而不是简单贴在格子上：进入禁区 −1、进入目标 +1、越界原地不动且 −1，其余为 0。', '同一个状态可能因为动作不同得到不同奖励，因此写成 p(r|s,a) 比“这个格子值多少分”更准确。'], formula: 'rₜ₊₁ ∼ p(r | sₜ, aₜ)' },
      { id: 'markov-property', kicker: '记忆无关 ≠ 没有历史', title: 'Markov 性要求当前状态足够', paragraphs: ['Markov 性不是说世界没有历史，而是说：给定当前状态与动作后，预测下一步不再需要额外查看完整历史。', '如果当前状态漏掉了关键变量，问题就不是一个良好定义的 MDP；应先修正状态表示，而不是急着换算法。'], formula: 'p(sₜ₊₁ | sₜ,aₜ,…,s₀) = p(sₜ₊₁ | sₜ,aₜ)' },
      { id: 'trajectory', kicker: '从一步到一生', title: '轨迹把局部接口串成长期问题', paragraphs: ['一次转移只产生一个即时奖励；轨迹把状态、动作与奖励沿时间串起来。', '下一章将追问：怎样把这条可能无限长的奖励序列压缩成一个可比较的回报 Gₜ？'], formula: 's₀, a₀, r₁, s₁, a₁, r₂, …' },
    ],
    summary: ['MDP 把状态、动作、奖励、转移概率与策略放进同一框架。', '策略 π(a|s) 属于智能体；转移 p(s′|s,a) 与奖励 p(r|s,a) 属于环境。', '课程目标状态不终止交互，因此后续价值仍然需要定义。'],
    explorer: explorer.zh,
  },
  en: {
    prerequisite: 'Prerequisites: basic intuition for distributions and conditional probability',
    summaryTitle: 'Separate the interaction interfaces before computing long-term value',
    eyebrow: 'Chapter 1 · Basic concepts and Markov decision processes',
    title: 'What, exactly, is an agent interacting with?',
    intro: 'Reinforcement learning begins with a minimal interaction loop, not an algorithm: the agent observes a state and chooses an action under a policy; the environment returns a reward and the next state. Keeping these interfaces separate prevents value, Bellman equations, and PPO from collapsing into one blur.',
    bridge: 'The lecture introduces the ideas with a 3×3 picture. This site places the same definitions in the shared 5×5 course world used by later chapters. Forbidden cells remain accessible but penalized, boundary actions stay in place, and the target remains an ordinary state in a continuing task.',
    figure: 'Interactive figure 1.1 · Course World Explorer',
    instruction: 'Choose a state and action, then follow one transition branch to build a trajectory by hand',
    question: 'When only the action changes, which quantities belong to the policy and which belong to the environment?',
    prelude: [
      { id: 'agent-environment', kicker: 'The smallest loop', title: 'A state is not a map; it is the information needed to decide', paragraphs: ['State sₜ is the information the agent uses now. Action aₜ acts on the environment, which then produces reward rₜ₊₁ and next state sₜ₊₁.', 'The grid only makes the abstract interface visible: every cell is a state and the five direction controls form the action set.'] },
      { id: 'policy-model', kicker: 'Separate two probabilities', title: 'The policy chooses actions; the environment produces successors', paragraphs: ['π(a|s) asks how the agent acts in state s. p(s′|s,a) asks how the environment changes after receiving that action.', 'Determinism is a special probability distribution. Increasing randomness expands several successors without conflating policy and environment.'] },
    ],
    sections: [
      { id: 'reward-interface', kicker: 'Reward is not a destination label', title: 'Reward is an interface for shaping behavior', paragraphs: ['Reward belongs to a transition: entering a forbidden cell gives −1, entering the target +1, crossing a boundary stays in place with −1, and ordinary movement gives 0.', 'The same state can yield different rewards under different actions, so p(r|s,a) is more precise than saying a cell is worth a fixed score.'], formula: 'rₜ₊₁ ∼ p(r | sₜ, aₜ)' },
      { id: 'markov-property', kicker: 'Memoryless does not mean historyless', title: 'The Markov property asks whether the current state is sufficient', paragraphs: ['The Markov property does not erase history. It says that, conditioned on the current state and action, predicting the next step needs no additional access to the full past.', 'If the state omits a decisive variable, the first fix is the state representation—not a new algorithm.'], formula: 'p(sₜ₊₁ | sₜ,aₜ,…,s₀) = p(sₜ₊₁ | sₜ,aₜ)' },
      { id: 'trajectory', kicker: 'From one step to a lifetime', title: 'A trajectory turns local interfaces into a long-term problem', paragraphs: ['One transition produces one immediate reward. A trajectory chains states, actions, and rewards through time.', 'The next chapter asks how a possibly infinite reward sequence becomes one comparable return Gₜ.'], formula: 's₀, a₀, r₁, s₁, a₁, r₂, …' },
    ],
    summary: ['An MDP puts states, actions, rewards, transition probabilities, and the policy in one framework.', 'Policy π(a|s) belongs to the agent; transition p(s′|s,a) and reward p(r|s,a) belong to the environment.', 'The course target does not terminate interaction, so future value still needs to be defined there.'],
    explorer: explorer.en,
  },
})
