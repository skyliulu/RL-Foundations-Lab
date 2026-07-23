import ClickableDerivation from './ClickableDerivation.jsx'
import MathFormula from './MathFormula.jsx'
import MathText from './MathText.jsx'
import MonteCarloLab from './MonteCarloLab.jsx'

function ReasoningPath({ content, lang }) {
  return (
    <section className="mc-reasoning-path">
      <header><span>{lang === 'zh' ? '从模型到经验' : 'From models to experience'}</span><h2>{lang === 'zh' ? '未知模型使精确期望变成可采样的 return' : 'An unknown model turns exact expectations into sampled returns'}</h2></header>
      {content.reasoningPath.map((section) => (
        <article key={section.id}>
          <div className="mc-reasoning-copy">
            <p className="mc-reasoning-opening">
              <strong className="chapter-prose-lead"><MathText>{section.title}</MathText></strong>
              <span className="chapter-prose-separator" aria-hidden="true">{lang === 'zh' ? '。' : '. '}</span>
              <MathText>{section.paragraphs[0]}</MathText>
            </p>
            {section.paragraphs.slice(1).map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
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
      <header><span>{zh ? '逐步修正覆盖假设' : 'Repair the coverage assumption'}</span><h2>{zh ? '从首次访问估计到 ε-greedy 控制' : 'From first-visit estimation to ε-greedy control'}</h2><p>{zh ? '每一层都保留前一层有效的部分，只替换造成失败的假设。完整伪代码保留在正文，便于逐行对照差异。' : 'Each layer keeps what works and replaces the assumption that fails. Full pseudocode remains visible for line-by-line comparison.'}</p></header>
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
      <ReasoningPath content={content} lang={lang} />
      <ClickableDerivation
        eyebrow={lang === 'zh' ? '样本平均' : 'Sample averaging'}
        title={lang === 'zh' ? '用完整回合的 return 估计动作价值' : 'Estimate action value from complete-episode returns'}
        intro={lang === 'zh' ? '先完成策略评价的数学接口，再讨论算法变体。点击任意等式，右侧解释该步使用的条件、变换与符号。' : 'First establish the mathematical interface for policy evaluation, then compare algorithm variants. Select any line for assumptions and symbols.'}
        steps={content.derivation}
        onSelect={onSelect}
      />
      <AlgorithmFamily content={content} lang={lang} />
      {beforeExperiment}
      <p className="article-copy chapter-transition"><MathText>{content.experimentIntro}</MathText></p>
      <MonteCarloLab lang={lang} content={content} />
    </>
  )
}
