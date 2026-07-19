export const glossary = {
  return: {
    symbol: 'Gₜ',
    zh: { term: '回报', definition: '从当前时间步开始，未来奖励的折扣和。' },
    en: { term: 'Return', definition: 'The discounted sum of rewards from the current time step onward.' },
  },
  stateValue: {
    symbol: 'Vπ(s)',
    zh: { term: '状态价值', definition: '给定当前状态并继续遵循策略 π 时，未来回报的条件期望。' },
    en: { term: 'State value', definition: 'The conditional expected return from a state when policy π is followed.' },
  },
  bellmanBackup: {
    symbol: 'TπV',
    zh: { term: 'Bellman backup', definition: '使用一步奖励和后继价值计算目标，并回写当前价值的一次操作。' },
    en: { term: 'Bellman backup', definition: 'One target computation and value write using the next reward and successor value.' },
  },
  bootstrapping: {
    symbol: 'R + γV(s′)',
    zh: { term: 'Bootstrapping', definition: '使用一个已有价值估计来更新另一个价值估计。' },
    en: { term: 'Bootstrapping', definition: 'Updating one value estimate with another existing value estimate.' },
  },
  continuingTask: {
    symbol: 'terminal = false',
    zh: { term: '持续型任务', definition: '交互不会因为到达目标状态自动结束，状态仍然具有后续策略和价值。' },
    en: { term: 'Continuing task', definition: 'Interaction does not end at the target; the state still has a policy and future value.' },
  },
  policyEvaluation: {
    symbol: 'Vπ',
    zh: { term: '策略评估', definition: '在策略 π 已知时，求解该策略对应的状态价值。' },
    en: { term: 'Policy evaluation', definition: 'Solving for the state values induced by a known policy π.' },
  },
  actionValue: {
    symbol: 'Qπ(s,a)',
    zh: { term: '动作价值', definition: '从状态 s 先执行动作 a，再遵循策略 π 时的期望回报。' },
    en: { term: 'Action value', definition: 'The expected return after taking action a in state s and then following policy π.' },
  },
}

export const glossaryIds = Object.keys(glossary)
