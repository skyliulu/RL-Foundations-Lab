export const phaseIds = [
  ['mdp', 'returns', 'bellman', 'optimality', 'planning'],
  ['montecarlo', 'approximation', 'td', 'control'],
  ['vfa', 'dqn', 'policygradient', 'actorcritic'],
  ['ppo', 'tokenmdp', 'rlhf', 'dpo', 'grpo'],
  ['codingrl', 'agentmdp', 'credit'],
]

export const coursePhases = {
  zh: [
    { number: 'I', title: '从环境到可计算的最优性', question: '怎样把“与世界互动”变成一组可递推、可求解的数学对象？', transition: '已知环境模型 → 精确规划' },
    { number: 'II', title: '从模型到经验', question: '不知道转移概率时，怎样只凭采样轨迹估计价值并改进策略？', transition: '完整回合 → 单步自举' },
    { number: 'III', title: '从表格到参数共享', question: '状态太多无法逐格存储时，怎样泛化、稳定训练并直接优化策略？', transition: '价值控制 → 策略优化' },
    { number: 'IV', title: '从动作到语言生成', question: '怎样把 token 轨迹、偏好数据和可验证奖励组织成语言模型后训练？', transition: 'PPO → Token MDP → 偏好与可验证奖励' },
    { number: 'V', title: '从回答到行动轨迹', question: '怎样用执行反馈训练 Coding Agent，并把长程结果归因给关键决策？', transition: '可执行奖励 → 工具轨迹 → 长程信用' },
  ],
  en: [
    { number: 'I', title: 'From environment to computable optimality', question: 'How does interaction become mathematical objects that can be recursed and solved?', transition: 'Known model → exact planning' },
    { number: 'II', title: 'From models to experience', question: 'Without transition probabilities, how can trajectories estimate value and improve behavior?', transition: 'Complete episodes → one-step bootstrap' },
    { number: 'III', title: 'From tables to shared parameters', question: 'When states no longer fit in a table, how do we generalize, stabilize, and optimize policies directly?', transition: 'Value control → policy optimization' },
    { number: 'IV', title: 'From actions to language generation', question: 'How do token trajectories, preferences, and verifiable rewards become language-model post-training?', transition: 'PPO → Token MDP → preference and verifiable rewards' },
    { number: 'V', title: 'From responses to action trajectories', question: 'How does execution feedback train coding agents and assign long-horizon outcomes to key decisions?', transition: 'Executable reward → tool trajectory → long-horizon credit' },
  ],
}

export const chapterTransitions = {
  zh: {
    mdp: '强化学习不能从算法名开始。只有先说明智能体面对什么世界、能做什么选择，以及世界怎样回应，后面的价值与优化才有明确对象。',
    returns: '决策过程已经能够描述一次次交互，但奖励只评价眼前一步。要比较两条都会到达目标的路径，必须把它们造成的整段未来压缩成可比较的长期结果。',
    bellman: 'Return 与 value 已经定义了评价目标，但直接枚举所有可能未来会形成不断扩张的轨迹树。现在需要一种只展开一步、又不丢失长期意义的递推结构。',
    optimality: 'Bellman 期望方程能够评价一个给定策略，却不会主动告诉我们怎样得到更好的策略。控制问题要求同一状态中的动作真正发生竞争。',
    planning: 'Bellman 最优方程刻画了答案应满足的不动点，但方程本身还不是求解过程。接下来要把“答案的性质”变成可执行、可比较的迭代算法。',
    montecarlo: '动态规划能够精确规划，是因为它知道每个动作的全部后继概率。真实交互通常只暴露实际发生的一条轨迹，因此学习必须从模型期望转向样本证据。',
    approximation: 'Monte Carlo 用样本平均估计期望，但等权平均默认目标长期不变。策略持续改善、环境可能漂移时，需要更一般的增量更新来协调新证据与历史估计。',
    td: '随机逼近说明了带噪更新为何可能收敛，却没有消除 Monte Carlo 必须等待回合结束的延迟。Bellman 递推允许一次转移到达后立刻构造学习目标。',
    control: 'TD prediction 能更及时地评价给定策略，但强化学习最终还要一边采样一边改善选择。关键差异变成：下一动作应进入学习目标，还是只负责产生数据。',
    vfa: 'Sarsa 与 Q-learning 在有限表格中可以逐项存储动作价值；状态一旦连续或组合爆炸，这种独立记忆既无法覆盖，也无法在相似状态间共享经验。',
    dqn: '函数近似带来了泛化，但把神经网络、bootstrap 和控制中的最大化放在一起后，目标与数据分布会同时移动。深度价值学习必须先处理这种耦合不稳定。',
    policygradient: 'DQN 先学习动作价值，再通过最大化间接得到策略。对于随机策略、连续动作或直接控制生成分布的任务，更自然的对象是可微的动作概率本身。',
    actorcritic: 'REINFORCE 可以直接优化策略，却要等待完整回报，而且同一动作会被轨迹后段的随机性强烈扰动。需要一个可学习的评判者提供更及时的相对反馈。',
    ppo: 'Actor–Critic 解决了反馈延迟与方差，却仍依赖接近当前策略的数据。同一批 rollout 反复更新后会逐渐过期，因此必须约束新旧策略之间的移动。',
    tokenmdp: 'PPO 的状态、动作和轨迹仍是抽象符号。把它用于语言模型之前，必须逐项回答一个 token 生成过程究竟对应怎样的决策过程。',
    rlhf: 'Token MDP 已经规定了序列中的状态、动作、奖励位置与终止，但一次完整后训练还需要说明偏好分数、参考约束、价值估计和策略更新怎样在同一批 token 上对齐。',
    dpo: 'PPO-based RLHF 能在线探索，却需要 rollout、奖励模型、价值模型和复杂的数据生命周期。当手里只有固定偏好对时，可以追问是否能消去在线强化学习闭环。',
    grpo: 'DPO 直接利用离线偏好，却不能主动生成数据来发现新策略。对于答案或代码可以自动验证的任务，在线成组采样重新提供了探索与相对比较。',
    codingrl: '组相对优化需要可信的验证信号。代码可以被编译和测试，看似天然适合强化学习，但测试只是正确性的代理，奖励设计决定模型学到功能还是捷径。',
    agentmdp: '单次代码回答能够获得执行反馈，真实 Coding Agent 却要经历搜索、阅读、修改、测试与修复。训练前必须先把这些多轮工具交互定义成清楚的状态与动作。',
    credit: 'Agent MDP 规定了每一步怎样发生，却仍可能只在任务结束时得到一个成功或失败。最后的问题是把这个结果分配给真正促成它的早期决策。',
  },
  en: {
    mdp: 'Reinforcement learning cannot begin with algorithm names. Values and optimization have clear objects only after the world, the agent’s choices, and the environment response are defined.',
    returns: 'The decision process now describes repeated interaction, but a reward judges only one step. Comparing two routes that both reach the goal requires one quantity for their complete futures.',
    bellman: 'Return and value define what to evaluate, yet enumerating every possible future creates an expanding trajectory tree. We need a one-step recursion that preserves long-term meaning.',
    optimality: 'The Bellman expectation equation evaluates a fixed policy but does not improve it. Control requires actions at the same state to compete.',
    planning: 'The Bellman optimality equation characterizes the desired fixed point, but a characterization is not yet a procedure. We must turn the equation into executable, comparable algorithms.',
    montecarlo: 'Dynamic programming plans exactly because it knows every successor probability. Real interaction usually reveals only the trajectory that occurred, so learning must replace model expectations with sample evidence.',
    approximation: 'Monte Carlo sample means estimate expectations, but equal weighting assumes a stationary target. Improving policies and drifting environments need a more general incremental balance between new and old evidence.',
    td: 'Stochastic approximation explains why noisy updates can converge, but it does not remove Monte Carlo’s wait for episode termination. Bellman recursion can build a target as soon as one transition arrives.',
    control: 'TD prediction evaluates a policy earlier, while reinforcement learning must also improve choices during collection. The key question is whether the next action belongs in the target or only in the data stream.',
    vfa: 'Sarsa and Q-learning can store every action value in a finite table. Continuous or combinatorial state spaces cannot be covered that way and cannot share evidence between similar situations.',
    dqn: 'Function approximation enables generalization, but neural networks, bootstrapping, and maximizing control make the target and data distribution move together. Deep value learning must stabilize that coupling.',
    policygradient: 'DQN learns action values and obtains a policy indirectly through maximization. Stochastic policies, continuous actions, and generative distributions call for optimizing action probabilities themselves.',
    actorcritic: 'REINFORCE optimizes policy directly but waits for full returns, and late trajectory randomness strongly perturbs every action. A learned evaluator can provide earlier relative feedback.',
    ppo: 'Actor–Critic reduces delay and variance but still relies on data close to the current policy. Repeated updates make one rollout batch stale, so movement between old and new policies must be controlled.',
    tokenmdp: 'PPO still speaks in abstract states, actions, and trajectories. Before applying it to a language model, token generation must be defined as a precise decision process.',
    rlhf: 'The Token MDP defines states, actions, reward positions, and termination. A full post-training loop must still align preference scores, reference constraints, values, and policy updates on the same tokens.',
    dpo: 'PPO-based RLHF explores online but requires rollout, reward and value models, and a complex data lifecycle. Fixed preference pairs invite a direct route that removes the online loop.',
    grpo: 'DPO uses offline preferences directly but cannot generate new evidence. When answers or programs are automatically verifiable, online grouped sampling restores exploration and relative comparison.',
    codingrl: 'Group-relative optimization needs a trustworthy verifier. Code can be compiled and tested, but tests remain proxies for correctness, so reward design decides whether the model learns functionality or shortcuts.',
    agentmdp: 'A single code response can receive execution feedback, while a coding agent must search, inspect, edit, test, and repair. These tool interactions need explicit state and action boundaries before training.',
    credit: 'An Agent MDP says how each step occurs but may still provide only terminal success or failure. The final challenge is assigning that outcome to the earlier decisions that actually caused it.',
  },
}

export function getChapterPhase(chapterId) {
  const phaseIndex = phaseIds.findIndex((ids) => ids.includes(chapterId))
  return phaseIndex < 0 ? null : { phaseIndex, ids: phaseIds[phaseIndex] }
}
