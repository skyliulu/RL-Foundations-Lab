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
  const readingSteps = isZh
    ? [
        ['找到问题', '先弄清上一种方法留下了什么困难，以及为什么需要新的方法。'],
        ['展开推导', '逐行检查等式、假设与符号，让结论真正从定义中生长出来。'],
        ['操作实验', '改变参数与策略，观察轨迹、数值和图形如何共同变化。'],
        ['回看结论', '确认方法解决了什么，又为下一章留下了什么问题。'],
      ]
    : [
        ['Locate the problem', 'Identify what the previous method could not resolve and why a new one is needed.'],
        ['Unfold the derivation', 'Inspect each equality, assumption, and symbol as the conclusion grows from its definitions.'],
        ['Run the experiment', 'Change parameters and policies, then compare the trajectory, values, and visual evidence.'],
        ['Revisit the result', 'Confirm what the method solved and what question it leaves for the next chapter.'],
      ]

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
        <div className="map-heading">
          <span>{isZh ? '21 章学习路径' : '21-chapter learning path'}</span>
          <div>
            <h2 id="learning-map-title">{isZh ? '沿着五个连续问题，建立完整的强化学习理解' : 'Build a complete understanding of reinforcement learning through five connected questions'}</h2>
            <p>{isZh ? '从环境与价值出发，经过经验学习和函数近似，最终进入语言模型后训练、Coding Agent 与长程信用分配。' : 'Begin with environments and value, move through learning from experience and function approximation, then enter language-model post-training, coding agents, and long-horizon credit assignment.'}</p>
          </div>
        </div>
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

      <section className="home-reading-guide" aria-labelledby="reading-guide-title">
        <div className="reading-guide-intro">
          <span>{isZh ? '阅读方式' : 'How to use each chapter'}</span>
          <div>
            <h2 id="reading-guide-title">{isZh ? '每章都按同一种学习节奏推进' : 'Every chapter follows the same learning rhythm'}</h2>
            <p>{isZh ? '先找到旧方法留下的问题，再展开推导、操作实验，最后回到结论。' : 'Start with the problem left by the previous method, unfold the derivation, run the experiment, and return to the conclusion.'}</p>
          </div>
        </div>
        <ol className="reading-guide-steps">
          {readingSteps.map(([title, body], index) => (
            <li key={title}>
              <span className="reading-step-number">{String(index + 1).padStart(2, '0')}</span>
              <div className="reading-step-copy">
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="reading-guide-cycle">
          <span>{isZh ? '迭代进入下一章' : 'Continue into the next chapter'}</span>
          <p>{isZh ? '第 04 步得到的结论会暴露新的边界与问题，它们直接成为下一章第 01 步的起点。' : 'The conclusion in step 04 exposes new limits and questions, which become the starting point for step 01 of the next chapter.'}</p>
        </div>
      </section>
    </div>
  )
}
