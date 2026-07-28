import ClickableDerivation from './ClickableDerivation.jsx'
import MathFormula from './MathFormula.jsx'
import MathText from './MathText.jsx'
import MonteCarloLab from './MonteCarloLab.jsx'

function OpeningArgument({ content, lang }) {
  const [opening, ...continuation] = content.prelude
  return (
    <section className="mc-opening-argument">
      <article>
        <header><span><MathText>{opening.kicker}</MathText></span><h2><MathText>{opening.title}</MathText></h2></header>
        {opening.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
        {continuation.map((section) => (
          <div className="mc-opening-continuation" key={section.id}>
            <span><MathText>{section.kicker}</MathText></span>
            <h3><MathText>{section.title}</MathText></h3>
            {section.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
          </div>
        ))}
      </article>
    </section>
  )
}

function ReasoningPath({ content, lang }) {
  const zh = lang === 'zh'
  return (
    <section className="mc-reasoning-path">
      <header><span>{zh ? '评价与改善的提交边界' : 'The evaluation-improvement boundary'}</span><h2>{zh ? '整批评价逐步缩短为逐回合学习闭环' : 'Batch evaluation contracts into an episode-by-episode learning loop'}</h2></header>
      {content.reasoningPath.map((section) => (
        <article key={section.id}>
          <div className="mc-reasoning-copy">
            <span><MathText>{section.kicker}</MathText></span>
            <h3><MathText>{section.title}</MathText></h3>
            {section.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
            {section.formula && <MathFormula block latex={section.formula} />}
          </div>
        </article>
      ))}
    </section>
  )
}

function AlgorithmFamily({ content, lang }) {
  const zh = lang === 'zh'
  return (
    <section className="mc-algorithm-family">
      <header><span>{zh ? '算法族的三个提交协议' : 'Three commit protocols in one algorithm family'}</span><h2>{zh ? '从整批经验评价到 ε-greedy 逐回合控制' : 'From batch evaluation to ε-greedy episode control'}</h2><p>{zh ? '三种方法都用完整回合估计动作价值，但使用哪些访问、何时改善策略以及怎样保证覆盖并不相同。完整伪代码保留在正文，便于逐行对照执行边界。' : 'All three methods estimate action value from complete episodes, but differ in eligible visits, policy-commit timing, and coverage. Full pseudocode keeps those execution boundaries visible.'}</p></header>
      <div className="mc-algorithm-stack">
        {content.algorithms.map((algorithm, index) => (
          <article key={algorithm.id} className={`mc-algorithm-card algorithm-${algorithm.id}`}>
            <header><span>{String(index + 1).padStart(2, '0')}</span><div><small>{index === 0 ? (zh ? '起点' : 'Starting point') : (zh ? '修复上一层' : 'Repairs predecessor')}</small><h3><MathText>{algorithm.label}</MathText></h3></div></header>
            <div className="mc-algorithm-logic">
              <div><span>{zh ? '核心机制' : 'Mechanism'}</span><p><MathText>{algorithm.premise}</MathText></p></div>
              <div><span>{zh ? '解决了什么' : 'What it solves'}</span><p><MathText>{algorithm.solves}</MathText></p></div>
              <div className="limitation"><span>{zh ? '仍然失败在哪里' : 'Remaining failure'}</span><p><MathText>{algorithm.limitation}</MathText></p></div>
            </div>
            <div className="mc-pseudocode"><span>{zh ? '完整伪代码' : 'Complete pseudocode'}</span><ol>{algorithm.pseudocode.map((line, lineIndex) => <li key={`${lineIndex}-${line}`}><b>{String(lineIndex + 1).padStart(2, '0')}</b><code><MathText>{line}</MathText></code></li>)}</ol></div>
            {index < content.algorithms.length - 1 && <div className="mc-handoff"><span>↓</span><strong>{index === 0 ? (zh ? '复用途中访问' : 'Reuse intermediate visits') : (zh ? '把覆盖写进策略' : 'Put coverage into the policy')}</strong></div>}
          </article>
        ))}
      </div>
    </section>
  )
}

export default function MonteCarloChapter({ content, lang, onSelect, beforeExperiment }) {
  return (
    <>
      <OpeningArgument content={content} lang={lang} />
      <ClickableDerivation
        eyebrow={lang === 'zh' ? '样本平均' : 'Sample averaging'}
        title={lang === 'zh' ? '用完整回合的 return 估计动作价值' : 'Estimate action value from complete-episode returns'}
        intro={lang === 'zh' ? '先完成策略评价的数学接口，再讨论算法变体。点击任意等式，右侧解释该步使用的条件、变换与符号。' : 'First establish the mathematical interface for policy evaluation, then compare algorithm variants. Select any line for assumptions and symbols.'}
        steps={content.derivation}
        onSelect={onSelect}
      />
      <ReasoningPath content={content} lang={lang} />
      <AlgorithmFamily content={content} lang={lang} />
      {beforeExperiment}
      <p className="article-copy chapter-transition"><MathText>{content.experimentIntro}</MathText></p>
      <MonteCarloLab lang={lang} content={content} />
    </>
  )
}
