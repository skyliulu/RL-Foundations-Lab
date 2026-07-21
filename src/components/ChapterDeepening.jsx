import MathFormula from './MathFormula.jsx'
import MathText from './MathText.jsx'

function isLatexCondition(condition) {
  return /[\\_^{}=<>]/.test(condition)
}

export default function ChapterDeepening({ sections = [], lang }) {
  if (!sections.length) return null
  const zh = lang === 'zh'
  return (
    <section className="chapter-deepening" aria-label={zh ? '完整理论与算法脉络' : 'Complete theory and algorithm spine'}>
      {sections.map((section) => (
        <article className="deepening-section" key={section.id}>
          <header><span><MathText>{section.kicker}</MathText></span><h2><MathText>{section.title}</MathText></h2></header>
          {section.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
          {section.formulas?.length > 0 && <div className="deepening-formulas">{section.formulas.map((formula) => <MathFormula block latex={formula} key={formula} />)}</div>}
          {section.theorem && <aside className="deepening-theorem"><span>{zh ? '结论与条件' : 'Claim and conditions'}</span><strong><MathText>{section.theorem.claim}</MathText></strong><p><MathText>{section.theorem.why}</MathText></p>{section.theorem.conditions?.map((condition) => isLatexCondition(condition) ? <MathFormula block latex={condition} key={condition} /> : <p className="deepening-condition" key={condition}><MathText>{condition}</MathText></p>)}</aside>}
          {section.pseudocode?.length > 0 && <div className="deepening-pseudocode"><span><MathText>{section.pseudocodeTitle || (zh ? '完整伪代码' : 'Complete pseudocode')}</MathText></span><ol>{section.pseudocode.map((line, index) => <li key={`${index}-${line}`}><b>{String(index + 1).padStart(2, '0')}</b><code><MathText>{line}</MathText></code></li>)}</ol></div>}
          {section.example?.rows?.length > 0 && <figure className="deepening-example"><figcaption><span>{zh ? '贯穿例子' : 'Worked example'}</span><strong><MathText>{section.example.title}</MathText></strong><p><MathText>{section.example.caption}</MathText></p></figcaption><div className="deepening-example-table" style={{ '--example-columns': section.example.headers.length }}>{section.example.headers.map((header) => <b key={header}><MathText>{header}</MathText></b>)}{section.example.rows.flatMap((row, rowIndex) => row.map((cell, cellIndex) => <span key={`${rowIndex}-${cellIndex}-${cell}`}><MathText>{cell}</MathText></span>))}</div></figure>}
          {section.handoff && <p className="deepening-handoff"><span className="deepening-handoff-label">{zh ? '为什么继续' : 'Why continue'}</span><MathText className="deepening-handoff-copy">{section.handoff}</MathText></p>}
        </article>
      ))}
    </section>
  )
}
