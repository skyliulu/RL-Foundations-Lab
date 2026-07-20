const phaseIds = [
  ['mdp', 'returns', 'bellman', 'optimality', 'planning'],
  ['montecarlo', 'approximation', 'td', 'control'],
  ['vfa', 'dqn', 'policygradient', 'actorcritic'],
  ['ppo', 'tokenmdp', 'rlhf', 'dpo', 'grpo'],
  ['codingrl', 'agentmdp', 'credit'],
]

export default function HomePage({ lang, chapters, onSelect }) {
  const isZh = lang === 'zh'
  const phases = isZh
    ? [
        { number: 'I', title: '从环境到可计算的最优性', question: '怎样把“与世界互动”变成一组可递推、可求解的数学对象？', transition: '已知环境模型 → 精确规划' },
        { number: 'II', title: '从模型到经验', question: '不知道转移概率时，怎样只凭采样轨迹估计价值并改进策略？', transition: '完整回合 → 单步自举' },
        { number: 'III', title: '从表格到参数共享', question: '状态太多无法逐格存储时，怎样泛化、稳定训练并直接优化策略？', transition: '价值控制 → 策略优化' },
        { number: 'IV', title: '从动作到语言生成', question: '怎样把 token 轨迹、偏好数据和可验证奖励组织成语言模型后训练？', transition: 'PPO → Token MDP → 偏好与可验证奖励' },
        { number: 'V', title: '从回答到行动轨迹', question: '怎样用执行反馈训练 Coding Agent，并把长程结果归因给关键决策？', transition: '可执行奖励 → 工具轨迹 → 长程信用' },
      ]
    : [
        { number: 'I', title: 'From environment to computable optimality', question: 'How does interaction become mathematical objects that can be recursed and solved?', transition: 'Known model → exact planning' },
        { number: 'II', title: 'From models to experience', question: 'Without transition probabilities, how can trajectories estimate value and improve behavior?', transition: 'Complete episodes → one-step bootstrap' },
        { number: 'III', title: 'From tables to shared parameters', question: 'When states no longer fit in a table, how do we generalize, stabilize, and optimize policies directly?', transition: 'Value control → policy optimization' },
        { number: 'IV', title: 'From actions to language generation', question: 'How do token trajectories, preferences, and verifiable rewards become language-model post-training?', transition: 'PPO → Token MDP → preference and verifiable rewards' },
        { number: 'V', title: 'From responses to action trajectories', question: 'How does execution feedback train coding agents and assign long-horizon outcomes to key decisions?', transition: 'Executable reward → tool trajectory → long-horizon credit' },
      ]

  const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter]))

  return (
    <div className="course-home">
      <header className="home-hero">
        <span className="chapter-eyebrow">RL FOUNDATIONS LAB</span>
        <h1>{isZh ? '从网格世界，到大语言模型后训练' : 'From Grid Worlds to Language-Model Post-Training'}</h1>
        <p>{isZh ? '一条连续的强化学习学习路径：保留完整定义与推导，用可调实验把每次方法变化背后的原因变成可以观察的现象。' : 'One continuous path through reinforcement learning: complete definitions and derivations, paired with adjustable experiments that make every methodological transition observable.'}</p>
        <div className="home-actions">
          <button type="button" className="primary" onClick={() => onSelect('mdp')}>{isZh ? '从第 01 章开始' : 'Start with Chapter 01'}</button>
          <button type="button" onClick={() => onSelect('ppo')}>{isZh ? '进入后训练部分' : 'Jump to post-training'}</button>
        </div>
      </header>

      <section className="learning-map" aria-labelledby="learning-map-title">
        <div className="map-heading"><span>{isZh ? '课程全景' : 'Course panorama'}</span><h2 id="learning-map-title">{isZh ? '五次关键抽象，串起二十一章' : 'Five conceptual shifts across twenty-one chapters'}</h2></div>
        <div className="phase-list">
          {phases.map((phase, phaseIndex) => (
            <article className="learning-phase" key={phase.number}>
              <div className="phase-intro"><b>{phase.number}</b><div><h3>{phase.title}</h3><p>{phase.question}</p><small>{phase.transition}</small></div></div>
              <div className="phase-chapters">
                {phaseIds[phaseIndex].map((id, index) => {
                  const chapter = chapterById[id]
                  return <button type="button" key={id} onClick={() => onSelect(id)}><span>{chapter.number}</span><div><small>{chapter.kicker}</small><strong>{chapter.title}</strong></div>{index < phaseIds[phaseIndex].length - 1 && <i>→</i>}</button>
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-principles">
        {(isZh ? [
          ['Why 先于 How', '每章从上一种方法的不足出发，让新公式回应一个已经出现的问题。'],
          ['推导始终在正文', '交互解释公式，但不替代完整的等式链、假设和算法步骤。'],
          ['实验共享同一证据', '参数、轨迹、表格、曲线和公式数值来自同一份浏览器端状态。'],
        ] : [
          ['Why before how', 'Each chapter begins with a limitation that the next mechanism must answer.'],
          ['Derivations stay in the text', 'Interaction explains equations without replacing the complete chain, assumptions, or algorithm.'],
          ['Experiments share evidence', 'Controls, trajectories, tables, curves, and equations read from the same browser-side state.'],
        ]).map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
      </section>
    </div>
  )
}
