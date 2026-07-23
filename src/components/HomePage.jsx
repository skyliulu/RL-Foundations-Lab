import { coursePhases, phaseIds } from '../content/storyline.js'

export default function HomePage({ lang, chapters, onSelect }) {
  const isZh = lang === 'zh'
  const phases = coursePhases[lang]

  const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter]))
  const readingSteps = isZh
    ? [
        ['明确问题', '理解本章要解决的具体困难，并看清环境、数据与学习目标。'],
        ['建立论证', '从定义和假设出发完成必要推导，理解算法更新为何成立。'],
        ['检验机制', '改变关键条件，结合轨迹、数值与算法内部状态验证推导结论。'],
        ['理解边界', '归纳方法解决了什么、依赖哪些条件，以及仍然存在哪些限制。'],
      ]
    : [
        ['Frame the problem', 'Identify the concrete difficulty and establish its environment, data, and learning objective.'],
        ['Build the argument', 'Start from definitions and assumptions, then derive why the algorithmic update is valid.'],
        ['Test the mechanism', 'Vary key conditions and use trajectories, values, and internal algorithm state as evidence.'],
        ['Read the limits', 'Summarize what the method solves, the conditions it needs, and the limitations that remain.'],
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
          <span>{isZh ? '如何阅读' : 'How to read the lab'}</span>
          <div>
            <h2 id="reading-guide-title">{isZh ? '用正文建立逻辑，用实验检验理解' : 'Build the argument in the article, then test it in the lab'}</h2>
            <p>{isZh ? '每章围绕一个完整问题展开：正文交代背景、定义与推导，交互实验把抽象机制转化为可观察的证据，最后说明方法的适用条件与局限。' : 'Each chapter develops one complete question. The article establishes context, definitions, and derivation; the interactive lab turns the mechanism into observable evidence; the close states its assumptions and limits.'}</p>
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
          <span>{isZh ? '章节如何衔接' : 'How chapters connect'}</span>
          <p>{isZh ? '一种方法尚未解决的限制，会自然成为后续章节的问题来源。学习路径因此持续推进，但每章会根据概念与算法选择最合适的讲解和交互方式。' : 'The limitations left by one method motivate the chapters that follow. The learning path remains continuous while each topic uses the explanation and interaction best suited to its mechanism.'}</p>
        </div>
      </section>
    </div>
  )
}
