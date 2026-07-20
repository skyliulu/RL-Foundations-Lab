import ClickableDerivation from './ClickableDerivation.jsx'
import MathFormula from './MathFormula.jsx'
import MathText from './MathText.jsx'
import MonteCarloLab from './MonteCarloLab.jsx'

function ReasoningPath({ content, lang }) {
  return (
    <section className="mc-reasoning-path">
      <header><span>{lang === 'zh' ? '问题驱动的主线' : 'Problem-driven spine'}</span><h2>{lang === 'zh' ? '先看原方法为什么失效，再引入新机制' : 'Start with the failure, then introduce the mechanism'}</h2></header>
      {content.reasoningPath.map((section, index) => (
        <article key={section.id}>
          <div className="mc-reasoning-index"><span>{index + 1}</span><small><MathText>{section.kicker}</MathText></small></div>
          <div className="mc-reasoning-copy"><h3><MathText>{section.title}</MathText></h3>{section.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}{section.formula && <MathFormula block latex={section.formula} />}</div>
        </article>
      ))}
    </section>
  )
}

function AlgorithmFamily({ content, lang }) {
  const zh = lang === 'zh'
  return (
    <section className="mc-algorithm-family">
      <header><span>{zh ? '算法演化链' : 'Algorithm evolution'}</span><h2>{zh ? '三种 Monte Carlo 方法不是并列清单' : 'Three Monte Carlo methods are not a flat list'}</h2><p>{zh ? '每一层都保留前一层有效的部分，只替换造成失败的假设。完整伪代码保留在正文，便于逐行对照差异。' : 'Each layer keeps what works and replaces the assumption that fails. Full pseudocode remains visible for line-by-line comparison.'}</p></header>
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

export default function MonteCarloChapter({ content, lang, onSelect }) {
  return (
    <>
      <ReasoningPath content={content} lang={lang} />
      <ClickableDerivation
        eyebrow={lang === 'zh' ? '从定义到可学习的递推' : 'From definition to a learnable recursion'}
        title={lang === 'zh' ? '完整推导：return 样本怎样成为动作价值估计？' : 'Complete derivation: how does a return sample estimate action value?'}
        intro={lang === 'zh' ? '先完成策略评价的数学接口，再讨论算法变体。点击任意等式，右侧解释该步使用的条件、变换与符号。' : 'First establish the mathematical interface for policy evaluation, then compare algorithm variants. Select any line for assumptions and symbols.'}
        steps={content.derivation}
        onSelect={onSelect}
      />
      <AlgorithmFamily content={content} lang={lang} />
      <p className="article-copy chapter-transition"><MathText>{content.experimentIntro}</MathText></p>
      <MonteCarloLab lang={lang} content={content} />
    </>
  )
}
