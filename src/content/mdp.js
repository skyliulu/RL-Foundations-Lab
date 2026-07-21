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
    world: '网格世界', inspector: '一步接口', trajectory: '轨迹纸带', state: '状态', action: '动作', reward: '奖励', successor: '后继状态', probability: '概率', expectedReward: '期望即时奖励', selectAction: '选择动作', followPolicy: '采用 π(s)', showPolicy: '显示策略', hidePolicy: '隐藏策略', reset: '重置轨迹', noise: '动作随机性（扩展）', deterministic: '确定性基准模型', stochastic: '展开所有可能后继', chooseBranch: '点击一个分支，让这次可能结果进入轨迹', clickState: '点击格子可从任意状态重新出发', accessible: '禁区可进入，但奖励 −1', boundary: '越界留在原地，奖励 −1', target: '进入目标，奖励 +1', normal: '普通移动，奖励 0', noTerminal: '目标不是终止态', policyLabel: '示例固定策略 π', distribution: '转移分布 p(s′|s,a)', rewardModel: '奖励模型 p(r|s,a)', stepCount: '步', totalReward: '累计奖励', start: '起点', current: '当前', possible: '可能后继', tupleTitle: '同一次交互，五个 MDP 接口', tupleHint: '改变动作只会改环境响应；策略 π 负责给动作分配概率，二者不是同一个对象。', emptyTrajectory: '从当前状态选择一个动作开始。', courseModel: '基准模型', extension: '随机扩展', branchAction: '进入这个后继', stateSpace: '25 个可访问格子', actionSpace: '上 / 右 / 下 / 左 / 停留', continuing: '持续型任务', policyProbability: 'π(a|s)', chosenByPolicy: '当前策略动作', outcomeNote: '这里不做随机采样；分支由你显式选择，因此每个概率都可检查。', legend: '图例', forbidden: '禁区', goal: '目标', selected: '当前状态', transition: '后继分支', statePrefix: 's',
  },
  en: {
    world: 'Grid world', inspector: 'One-step interface', trajectory: 'Trajectory tape', state: 'State', action: 'Action', reward: 'Reward', successor: 'Successor', probability: 'Probability', expectedReward: 'Expected immediate reward', selectAction: 'Choose an action', followPolicy: 'Use π(s)', showPolicy: 'Show policy', hidePolicy: 'Hide policy', reset: 'Reset trajectory', noise: 'Action randomness (extension)', deterministic: 'Deterministic baseline', stochastic: 'Expand every possible successor', chooseBranch: 'Click a branch to materialize that possible outcome in the trajectory', clickState: 'Click any cell to restart there', accessible: 'Forbidden cells are accessible, with reward −1', boundary: 'Crossing the boundary stays put, reward −1', target: 'Entering the target gives +1', normal: 'Ordinary movement gives 0', noTerminal: 'The target is not terminal', policyLabel: 'Example fixed policy π', distribution: 'Transition distribution p(s′|s,a)', rewardModel: 'Reward model p(r|s,a)', stepCount: 'steps', totalReward: 'total reward', start: 'Start', current: 'Current', possible: 'Possible successor', tupleTitle: 'One interaction, five MDP interfaces', tupleHint: 'Changing the action changes the environment response. Policy π assigns probabilities to actions; it is not the environment.', emptyTrajectory: 'Choose an action from the current state to begin.', courseModel: 'Baseline model', extension: 'Stochastic extension', branchAction: 'Take this successor', stateSpace: '25 accessible cells', actionSpace: 'up / right / down / left / stay', continuing: 'Continuing task', policyProbability: 'π(a|s)', chosenByPolicy: 'Current policy action', outcomeNote: 'No random sample is hidden here: you explicitly choose a branch, so every probability remains inspectable.', legend: 'Legend', forbidden: 'Forbidden', goal: 'Target', selected: 'Current state', transition: 'Successor branch', statePrefix: 's',
  },
}

const overview = {
  zh: {
    eyebrow: '先看图，再命名',
    title: '这就是后续章节反复使用的决策世界',
    caption: '智能体从左上角出发，在 25 个可访问格子之间移动。黄色格是可进入但会受罚的禁区，蓝色格是目标；地图外侧全部属于边界。',
    map: '环境地图', statePrefix: 's', start: '起点', forbidden: '禁区 −1', target: '目标 +1',
    locationTitle: '先看当前位置', locationBody: '每个格子都有编号，后面会把“此刻位于哪个格子”正式命名。',
    choiceTitle: '再看可选方向', choiceBody: '每一步都可以选择上、右、下、左或停留。',
    responseTitle: '最后看世界回应', responseBody: '选择之后，位置可能变化，同时得到 −1、0 或 +1。',
    boundary: '越界并不会离开地图：智能体留在原格，并收到 −1。禁区也不是墙，进入后同样收到 −1。',
  },
  en: {
    eyebrow: 'See the scene before naming it',
    title: 'This is the decision world reused throughout the chapters',
    caption: 'The agent begins in the upper-left and moves among 25 accessible cells. Yellow cells are accessible but penalized, the blue cell is the target, and everything outside the map is boundary.',
    map: 'Environment map', statePrefix: 's', start: 'Start', forbidden: 'Forbidden −1', target: 'Target +1',
    locationTitle: 'Begin with location', locationBody: 'Every cell has an id. The next section formally names what it means to occupy one of them.',
    choiceTitle: 'Then inspect the choices', choiceBody: 'At every step the agent may move up, right, down, left, or stay.',
    responseTitle: 'Finally observe the response', responseBody: 'After a choice, location may change and the world returns −1, 0, or +1.',
    boundary: 'A boundary attempt does not leave the map: the agent stays in place and receives −1. Forbidden cells are not walls; entering one also gives −1.',
  },
}

const mdpZhPath = [
  {
    id: 'problem-setting',
    kicker: '先建立共同场景',
    title: '先把贯穿本章的网格世界摆在眼前',
    paragraphs: [
      '我们先固定一个具体世界：一张 5×5 的方格地图。蓝色格是目标，黄色格是禁区，地图外侧是边界；禁区仍然可以进入，只是会受到惩罚。这张地图及其规则合在一起，就是智能体所处的环境。',
      '智能体，也就是需要在地图中不断做出选择的主体，可以从任意格子出发。任务不只是抵达目标，还要区分撞到边界、穿过禁区和无谓绕路，因此我们需要逐一建立描述这个世界的基本对象。',
    ],
    formulas: [],
    note: '这一节只建立场景。下面将把地图中的位置、可选方向、世界回应与评价信号逐一命名。',
  },
  {
    id: 'state-space',
    kicker: '定义 1 · 状态',
    title: '状态把“此刻与环境的关系”编码成可用于决策的信息',
    paragraphs: [
      '在刚才建立的 5×5 网格世界里，智能体的位置足以决定当前可观察的局面，所以每个格子可以作为一个状态。所有 25 个可能状态组成状态空间 𝒮。',
      '状态不是地图本身，也不只是一个编号。它必须包含预测后续变化和做出选择所需的信息；如果遗漏关键变量，仅凭当前状态就不足以判断接下来会发生什么。',
    ],
    formulas: [String.raw`S_t \in \mathcal{S}`, String.raw`\mathcal{S} = \{s_1, s_2, \ldots, s_{25}\}`],
  },
  {
    id: 'action-space',
    kicker: '定义 2 · 动作',
    title: '动作空间规定智能体在一个状态下有哪些选择',
    paragraphs: [
      '在这个网格环境中，每个状态有五个动作：上、右、下、左和停留。动作集合可以依赖状态，因此更一般地写作 𝒜(s)。',
      '动作描述智能体发出的选择，不保证环境一定按字面执行。靠近边界时选择“向上”仍是合法动作，只是环境可能让智能体留在原地并给出惩罚。',
    ],
    formulas: [String.raw`A_t \in \mathcal{A}(S_t)`, String.raw`\mathcal{A}(s_i) = \{a_1, a_2, a_3, a_4, a_5\}`],
  },
  {
    id: 'transition-model',
    kicker: '环境接口 · 状态转移',
    title: '动作之后发生什么，由环境的状态转移模型决定',
    paragraphs: [
      '确定性世界可以用一张“状态 × 动作”表直接指定后继状态，例如 s₁ 执行向右得到 s₂；s₁ 执行向上则因越界仍停在 s₁。在这个环境中，禁区是可进入状态，不是墙。',
      '现实环境可能带有风、传感噪声或执行误差。此时一个动作会对应多个可能后继，必须用条件概率描述。确定性转移只是这个分布把全部概率质量放在一个后继上的特殊情况。',
    ],
    formulas: [String.raw`S_{t+1} \sim p(s' \mid S_t, A_t)`, String.raw`p(s_2 \mid s_1, a_2) = 1`],
    note: '这里的 p 属于环境：它回答“动作已经给出后，世界怎样变化”。',
  },
  {
    id: 'policy',
    kicker: '智能体接口 · 策略',
    title: '策略不是环境模型；策略只负责给动作分配概率',
    paragraphs: [
      '策略 π 告诉智能体在状态 s 应怎样选动作。箭头图是一种直观表示，条件概率 π(a|s) 则是可计算的数学表示。',
      '确定性策略在每个状态只给一个动作概率 1；随机策略可以把概率分给多个动作。策略与转移模型都使用条件概率，但二者的条件和结果不同，不能混为一个对象。',
    ],
    formulas: [String.raw`A_t \sim \pi(a \mid S_t)`, String.raw`\sum_{a \in \mathcal{A}(s)} \pi(a \mid s) = 1`],
    compare: [['智能体', 'π(a | s)：在状态 s 怎样选动作'], ['环境', 'p(s′ | s,a)：收到动作后怎样产生后继']],
  },
  {
    id: 'reward-model',
    kicker: '评价信号 · 奖励',
    title: '奖励评价一次转移，并把人的偏好接入环境',
    paragraphs: [
      '动作执行后，环境返回一个实数奖励。正负号本身不是道德标签，重要的是相对大小：它让目标、禁区、边界和普通移动产生不同的学习压力。',
      '这个网格世界规定：越界 −1，进入禁区 −1，进入目标 +1，其余为 0。奖励也可能随机，因此一般用条件分布而不是固定表描述。',
    ],
    formulas: [String.raw`R_{t+1} \sim p(r \mid S_t, A_t)`, String.raw`p(r=-1 \mid s_1,a_1)=1`],
    note: '这里的奖励属于“执行这个动作之后发生了什么”，因此索引是 t+1。',
  },
  {
    id: 'trajectory-return',
    kicker: '从一步到长期 · 轨迹与回报',
    title: '轨迹把许多次局部交互串起来，回报再评价整条未来',
    paragraphs: [
      '现在可以把前面的对象接成一次完整交互：智能体在时刻 t 看到状态 Sₜ，选择动作 Aₜ；环境随后给出奖励 Rₜ₊₁ 和后继状态 Sₜ₊₁。重复这条链，就得到轨迹。',
      '回报是沿一条轨迹累积起来的奖励。两个策略都可能到达目标，但经过禁区的策略会得到较小回报，因此“哪条路径更好”终于有了可比较的量。',
      '持续交互时，简单相加可能得到 1+1+1+⋯ 并发散。折扣因子 γ∈(0,1) 让远期奖励按时间衰减，同时把总和限制为有限值。第二章会逐步定义 Gₜ 并解释每个下标。',
    ],
    formulas: [String.raw`S_t \xrightarrow{A_t} (R_{t+1},S_{t+1}) \longrightarrow A_{t+1} \longrightarrow \cdots`, String.raw`G_t = R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots`],
    note: '下标约定：Aₜ 在时刻 t 选出；由它产生的奖励与后继状态记作 Rₜ₊₁、Sₜ₊₁。',
  },
  {
    id: 'task-types',
    kicker: '任务边界 · Episode 与持续型任务',
    title: '终止状态决定一段交互是 episode，还是持续型任务',
    paragraphs: [
      '如果策略运行到某个终止状态后停止，有限轨迹称为 episode，对应 episodic task。没有终止状态、交互永不自然结束的任务称为 continuing task。',
      '这里把目标格视为普通状态：智能体到达后仍可离开，再次进入时继续获得 +1。因此目标不等于 terminal，后续价值函数必须处理无限未来。',
    ],
    formulas: [String.raw`\text{episodic: } S_0,A_0,R_1,\ldots,S_T`, String.raw`\text{continuing: } S_0,A_0,R_1,S_1,A_1,R_2,\ldots`],
  },
  {
    id: 'mdp-definition',
    kicker: '形式化 · MDP 与 Markov 性',
    title: 'Markov 性回答的是：当前状态是否已经足够预测下一步',
    paragraphs: [
      '一个 MDP 汇集前面逐一建立的对象：状态集合、每个状态可用的动作集合、奖励集合或奖励分布、状态转移分布，以及智能体采用的策略。环境模型由转移与奖励分布组成；策略仍是智能体侧的选择规则。',
      'Markov 性先提出一个具体的预测问题：动作 Aₜ 已经选定时，若要预测下一状态 Sₜ₊₁ 和奖励 Rₜ₊₁，除了当前状态 Sₜ，还需不需要回看从起点到现在的完整历史？下面用 Hₜ 表示这段历史。',
      '如果在给定 Sₜ 与 Aₜ 后，完整历史 Hₜ 不再改变下一状态和奖励的条件分布，那么 Sₜ 就是对这段历史的充分概括。所谓“无记忆”指的是预测时不必额外读取过去，而不是世界真的没有过去。',
      '回到网格世界：若下一步只由当前格子和动作决定，格子编号就是充分状态；若风向具有惯性却没有被记录，同一格子执行同一动作仍可能产生不同后继分布，此时“位置”就不满足 Markov 性。把风向并入状态可以恢复充分性，但也会扩大状态空间。',
    ],
    formulaLayout: 'stacked',
    formulas: [
      String.raw`\operatorname{MDP}=\langle \mathcal{S},\mathcal{A},p(s'\mid s,a),p(r\mid s,a)\rangle`,
      String.raw`p(S_{t+1}\mid H_t,A_t)=p(S_{t+1}\mid S_t,A_t)`,
      String.raw`p(R_{t+1}\mid H_t,A_t)=p(R_{t+1}\mid S_t,A_t)`,
    ],
    note: '读这两条等式时，比较的是左边的“完整历史”与右边的“当前状态”：二者预测一致，才说明状态足够。网格只是 MDP 的一种可视化；抽掉方格后，状态成为节点，带概率的转移成为有向边。',
  },
]

const mdpEnPath = [
  {
    id: 'problem-setting', kicker: 'Establish the shared scene', title: 'Place the grid world in view before naming its parts',
    paragraphs: ['Begin with one concrete world: a 5×5 grid. The blue cell is the target, yellow cells are forbidden, and the outside edge is the boundary. Forbidden cells remain accessible but carry a penalty. The map and its rules together form the environment in which the agent operates.', 'The agent—the decision-making entity moving through the grid—may start in any cell. Reaching the target is not enough: boundary collisions, forbidden cells, and needless detours should differ, so the next sections build the objects needed to describe this world.'],
    formulas: [], note: 'This section establishes only the scene. The location, available directions, world response, choice rule, and evaluation signal are named next.',
  },
  {
    id: 'state-space', kicker: 'Definition 1 · State', title: 'State encodes the agent’s current relation to the environment',
    paragraphs: ['In the 5×5 grid world just established, location is enough to describe the observable situation, so each cell is a state. All 25 possible states form the state space 𝒮.', 'A state is not the picture itself or merely an id. It must contain the information needed to predict what follows and make a choice; if a decisive variable is missing, the current state alone cannot determine what may happen next.'],
    formulas: [String.raw`S_t \in \mathcal{S}`, String.raw`\mathcal{S} = \{s_1, s_2, \ldots, s_{25}\}`],
  },
  {
    id: 'action-space', kicker: 'Definition 2 · Action', title: 'The action space specifies the choices available at a state',
    paragraphs: ['This grid environment defines five actions: up, right, down, left, and stay. In general the available set may depend on the state, so it is written 𝒜(s).', 'An action is a choice issued by the agent, not a guarantee of literal motion. “Up” at a boundary is still an action; the environment may keep the agent in place and penalize it.'],
    formulas: [String.raw`A_t \in \mathcal{A}(S_t)`, String.raw`\mathcal{A}(s_i) = \{a_1, a_2, a_3, a_4, a_5\}`],
  },
  {
    id: 'transition-model', kicker: 'Environment interface · State transition', title: 'The environment transition model decides what follows an action',
    paragraphs: ['A deterministic world can specify one successor for every state–action pair. For example, right from s₁ reaches s₂, while up from s₁ remains at s₁. Forbidden cells are accessible states in this environment, not walls.', 'Wind or execution noise can create several possible successors. A conditional distribution is then required. Determinism is the special case that puts all probability mass on one successor.'],
    formulas: [String.raw`S_{t+1} \sim p(s' \mid S_t,A_t)`, String.raw`p(s_2 \mid s_1,a_2)=1`], note: 'This p belongs to the environment: it answers what the world does after receiving an action.',
  },
  {
    id: 'policy', kicker: 'Agent interface · Policy', title: 'A policy is not the environment model; it assigns probabilities to actions',
    paragraphs: ['Policy π tells the agent how to act in state s. An arrow map is an intuitive representation; π(a|s) is the mathematical one.', 'A deterministic policy places probability one on one action. A stochastic policy can distribute probability over several actions. Both policy and dynamics use conditional probability, but their conditions and outcomes differ.'],
    formulas: [String.raw`A_t \sim \pi(a \mid S_t)`, String.raw`\sum_{a \in \mathcal{A}(s)}\pi(a\mid s)=1`], compare: [['Agent', 'π(a | s): how to choose an action in s'], ['Environment', 'p(s′ | s,a): how a successor is produced']],
  },
  {
    id: 'reward-model', kicker: 'Evaluation signal · Reward', title: 'Reward evaluates a transition and connects human preference to the environment',
    paragraphs: ['After the action, the environment returns a real reward. Its sign is not a moral label; relative magnitude distinguishes targets, forbidden cells, boundaries, and ordinary movement.', 'This environment uses −1 for a boundary attempt, −1 for entering a forbidden cell, +1 for entering the target, and 0 otherwise. Rewards may also be stochastic, so the general form is a conditional distribution.'],
    formulas: [String.raw`R_{t+1} \sim p(r\mid S_t,A_t)`, String.raw`p(r=-1\mid s_1,a_1)=1`], note: 'Reward describes what happens after Aₜ, hence the t+1 index.',
  },
  {
    id: 'trajectory-return', kicker: 'One step to the long term · Trajectory and return', title: 'A trajectory chains local interactions; return evaluates the whole future',
    paragraphs: ['The objects above now form one complete interaction: at time t the agent observes Sₜ and chooses Aₜ; the environment then returns Rₜ₊₁ and Sₜ₊₁. Repeating that chain produces a trajectory.', 'Return accumulates the rewards along one trajectory. Two policies may reach the same target, yet the one crossing a forbidden cell receives a smaller return.', 'In a continuing task, a plain sum may diverge as 1+1+1+⋯. Discount γ∈(0,1) attenuates distant rewards and keeps the sum finite. Chapter 2 derives Gₜ and every index step by step.'],
    formulas: [String.raw`S_t \xrightarrow{A_t} (R_{t+1},S_{t+1}) \longrightarrow A_{t+1} \longrightarrow \cdots`, String.raw`G_t=R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots`],
    note: 'Index convention: Aₜ is chosen at time t; the reward and successor it produces are Rₜ₊₁ and Sₜ₊₁.',
  },
  {
    id: 'task-types', kicker: 'Task boundary · Episodic and continuing', title: 'Terminal states separate episodic and continuing tasks',
    paragraphs: ['If interaction stops at a terminal state, the finite trajectory is an episode. Tasks with no terminal state continue indefinitely.', 'Here the target is an ordinary state: the agent may leave it and earn +1 again upon re-entry. A target is therefore not automatically terminal.'],
    formulas: [String.raw`\text{episodic: }S_0,A_0,R_1,\ldots,S_T`, String.raw`\text{continuing: }S_0,A_0,R_1,S_1,A_1,R_2,\ldots`],
  },
  {
    id: 'mdp-definition', kicker: 'Formalization · MDP and the Markov property', title: 'The Markov property asks whether the current state is enough to predict the next step',
    paragraphs: [
      'An MDP gathers the objects established above: states, available actions, reward sets or distributions, transition distributions, and the policy used by the agent. Transition and reward form the environment model; policy remains the agent’s choice rule.',
      'The Markov property begins with a concrete prediction question. Once action Aₜ has been selected, does predicting successor Sₜ₊₁ and reward Rₜ₊₁ require the complete history from the start, or is current state Sₜ enough? Let Hₜ denote that complete history.',
      'If adding Hₜ after conditioning on Sₜ and Aₜ does not change either conditional distribution, then Sₜ is a sufficient summary of the history. “Memoryless” means that prediction need not reread the past; it does not mean the world has no past.',
      'In the grid world, cell identity is sufficient when the next step depends only on the current cell and action. If persistent wind is omitted, the same cell and action can produce different successor distributions; location is then non-Markov. Adding wind to state restores sufficiency at the cost of a larger state space.',
    ],
    formulaLayout: 'stacked',
    formulas: [
      String.raw`\operatorname{MDP}=\langle\mathcal{S},\mathcal{A},p(s'\mid s,a),p(r\mid s,a)\rangle`,
      String.raw`p(S_{t+1}\mid H_t,A_t)=p(S_{t+1}\mid S_t,A_t)`,
      String.raw`p(R_{t+1}\mid H_t,A_t)=p(R_{t+1}\mid S_t,A_t)`,
    ],
    note: 'Read each equality by comparing the complete history on the left with the current state on the right. Equal predictions are the evidence that state is sufficient. The grid is only one visualization of an MDP; without it, states become graph nodes connected by probabilistic directed edges.',
  },
]

const mdpDeepeningZh = [
  {
    id: 'state-sufficiency-counterexample', kicker: '边界案例 · 状态充分性', title: '同一个位置不一定是同一个可预测状态',
    paragraphs: ['设想网格中还存在“风向”，但状态只记录位置。智能体两次都位于 s₈ 并选择向右：顺风时大概率到 s₉，逆风时却可能留在原地。位置相同、动作相同，后继分布仍依赖更早观察到的风向，说明“位置”不是充分状态。', '修复方式不是取消历史，而是把预测所需的历史信息压缩进当前状态，例如把状态改成“位置 × 风向”。一旦扩展后的状态足够，早期历史对下一步不再提供额外预测信息。'],
    formulas: [String.raw`p(S_{t+1}\mid X_t,A_t,H_{t-1})\ne p(S_{t+1}\mid X_t,A_t)`, String.raw`S_t=(X_t,W_t)\quad\Longrightarrow\quad p(S_{t+1}\mid S_t,A_t,H_{t-1})=p(S_{t+1}\mid S_t,A_t)`],
    theorem: { claim: 'Markov 性是对状态表示的信息要求，不是对世界是否记忆历史的要求。', why: '只要当前状态包含一步预测和决策需要的信息，环境完全可以由具有惯性或隐藏机制的物理过程产生。', conditions: [String.raw`S_t\ \text{is sufficient for predicting}\ (R_{t+1},S_{t+1})`] },
    handoff: '有了充分状态，策略才能只根据当前状态选动作，后续价值函数也才能写成 V(s) 而不必把整段历史作为自变量。',
  },
  {
    id: 'termination-counterfactual', kicker: '反事实 · 目标是否终止', title: '同一个目标格，终止规则会改变长期问题',
    paragraphs: ['若进入目标后 episode 结束，目标之后没有奖励，终止状态的后继价值按零处理。若目标只是普通状态，智能体还能离开并再次进入；一次 +1 只是未来奖励序列中的一项。', '因此“目标”描述偏好，“terminal”描述数据边界，两者不能互换。把 continuing 世界误写成 episodic 世界，会系统性低估目标附近能够反复获得的价值。'],
    formulas: [String.raw`G_t^{\mathrm{episodic}}=\sum_{k=0}^{T-t-1}\gamma^kR_{t+k+1}`, String.raw`G_t^{\mathrm{continuing}}=\sum_{k=0}^{\infty}\gamma^kR_{t+k+1}`],
    example: { title: '进入目标后的两种解释', caption: '相同的第一次 +1，在不同任务边界下产生不同未来。', headers: ['规则', '进入目标后', '后继价值'], rows: [['Episodic', '停止', '0'], ['Continuing', '仍可离开与再次进入', '继续计算']] },
  },
]

const mdpDeepeningEn = [
  {
    id: 'state-sufficiency-counterexample', kicker: 'Boundary case · State sufficiency', title: 'The same location need not be the same predictive state',
    paragraphs: ['Suppose the grid also has wind direction, but state records location only. Two visits to s₈ followed by “right” can have different successor distributions under tailwind and headwind. The same recorded location and action still depend on earlier wind information, so location alone is not sufficient.', 'The repair is not to erase history but to compress the relevant part into the current state—for example, location × wind. Once the augmented state is sufficient, older history adds no one-step predictive information.'],
    formulas: [String.raw`p(S_{t+1}\mid X_t,A_t,H_{t-1})\ne p(S_{t+1}\mid X_t,A_t)`, String.raw`S_t=(X_t,W_t)\quad\Longrightarrow\quad p(S_{t+1}\mid S_t,A_t,H_{t-1})=p(S_{t+1}\mid S_t,A_t)`],
    theorem: { claim: 'The Markov property constrains the information in the state representation, not whether the physical world has a history.', why: 'A process may have inertia or hidden mechanisms; the current state must summarize what one-step prediction and control require.', conditions: [String.raw`S_t\ \text{is sufficient for predicting}\ (R_{t+1},S_{t+1})`] },
    handoff: 'A sufficient state lets policy depend on the current state and lets value be written as V(s) rather than as a function of the complete history.',
  },
  {
    id: 'termination-counterfactual', kicker: 'Counterfactual · Does the target terminate?', title: 'One target cell creates different long-term problems under different boundaries',
    paragraphs: ['If entering the target ends an episode, there are no later rewards and terminal successor value is zero. If the target is an ordinary state, the agent may leave and re-enter; the first +1 is only one term in an ongoing reward sequence.', 'Target describes preference, while terminal describes a data boundary. Treating a continuing world as episodic systematically removes future opportunities near the target.'],
    formulas: [String.raw`G_t^{\mathrm{episodic}}=\sum_{k=0}^{T-t-1}\gamma^kR_{t+k+1}`, String.raw`G_t^{\mathrm{continuing}}=\sum_{k=0}^{\infty}\gamma^kR_{t+k+1}`],
    example: { title: 'Two meanings after entering the target', caption: 'The same first +1 leads to different futures.', headers: ['Rule', 'After target entry', 'Successor value'], rows: [['Episodic', 'Stop', '0'], ['Continuing', 'May leave and re-enter', 'Continue evaluating']] },
  },
]

export const mdpChapter = assertFoundationChapterDefinition({
  id: 'mdp',
  sources,
  zh: {
    prerequisite: '前置：概率分布与条件概率的基本直觉',
    summaryTitle: '先把具体世界与交互接口分清，再比较不同路径',
    eyebrow: '第 1 章 · 从网格世界到完整决策模型',
    title: '一个智能体究竟在和什么交互？',
    intro: '强化学习先不从算法开始，而从一个具体问题开始：让智能体——也就是需要做出选择的主体——在一张网格地图中寻找通往目标的好路径。先把这个世界摆清楚，再逐一给其中的对象命名。',
    bridge: '现在，网格、可用选择、环境响应、选择规则、奖励、轨迹与任务边界都已经定义。下面把它们放进同一张交互画布，检查一次选择怎样产生后继状态与奖励。',
    experimentIntro: '现在，网格、可用选择、环境响应、选择规则、奖励、轨迹与任务边界都已经定义。下面把它们放进同一张交互画布，检查一次选择怎样产生后继状态与奖励。',
    interpretation: '画布中的五栏对应刚刚建立的对象：策略只负责给动作分配概率，环境负责产生后继状态与奖励，轨迹则把每次结果按时间串起来。改变动作随机性会改变环境的转移分布，却不会改变这些对象各自的职责。',
    figure: '交互图 1.1 · Grid World Explorer',
    instruction: '先选状态，再选动作；沿一个转移分支向前走，记录连续几步交互',
    question: '当你只改变动作时，哪些量由策略决定，哪些量由环境决定？',
    learningPath: mdpZhPath,
    overview: overview.zh,
    deepening: mdpDeepeningZh,
    prelude: mdpZhPath.slice(0, 2),
    sections: mdpZhPath.slice(6),
    summary: ['网格世界先给出具体问题，状态、动作、奖励、转移概率与策略再把它形式化为 MDP。', '策略 π(a|s) 属于智能体；转移 p(s′|s,a) 与奖励 p(r|s,a) 属于环境。', 'Markov 性要求当前状态充分概括预测下一步所需的历史信息；遗漏风向等关键变量会破坏这一性质。', '目标状态不会终止交互，因此比较路径时必须处理它之后仍会发生的奖励。'],
    explorer: explorer.zh,
  },
  en: {
    prerequisite: 'Prerequisites: basic intuition for distributions and conditional probability',
    summaryTitle: 'Separate the concrete world and its interfaces before comparing paths',
    eyebrow: 'Chapter 1 · From a grid world to a complete decision model',
    title: 'What, exactly, is an agent interacting with?',
    intro: 'Reinforcement learning begins with a concrete problem, not an algorithm: an agent—the entity that must make choices—looks for a good route to a target in a grid. Put that world in view first, then name its parts one by one.',
    bridge: 'The grid, available choices, environment response, choice rule, reward, trajectory, and task boundary are now defined. The explorer puts them in one canvas so one choice can be followed into its successor state and reward.',
    experimentIntro: 'The grid, available choices, environment response, choice rule, reward, trajectory, and task boundary are now defined. The explorer puts them in one canvas so one choice can be followed into its successor state and reward.',
    interpretation: 'The five columns correspond to the objects just established: policy assigns probabilities to actions, the environment produces successors and rewards, and the trajectory orders those outcomes through time. Action randomness changes the environment transition distribution without changing these responsibilities.',
    figure: 'Interactive figure 1.1 · Grid World Explorer',
    instruction: 'Choose a state and action, then follow a transition branch and record several interactions',
    question: 'When only the action changes, which quantities belong to the policy and which belong to the environment?',
    learningPath: mdpEnPath,
    overview: overview.en,
    deepening: mdpDeepeningEn,
    prelude: mdpEnPath.slice(0, 2),
    sections: mdpEnPath.slice(6),
    summary: ['The grid world poses the concrete problem; states, actions, rewards, transition probabilities, and policy then formalize it as an MDP.', 'Policy π(a|s) belongs to the agent; transition p(s′|s,a) and reward p(r|s,a) belong to the environment.', 'The Markov property requires the current state to summarize all history needed for next-step prediction; omitting a variable such as persistent wind can break it.', 'The target does not terminate interaction, so path comparison must include rewards that occur after reaching it.'],
    explorer: explorer.en,
  },
})
