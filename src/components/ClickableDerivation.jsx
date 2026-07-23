import { useState } from 'react'
import MathFormula from './MathFormula'
import RichContent from './RichContent'

export default function ClickableDerivation({ eyebrow, title, intro, steps, onSelect, variant = 'major' }) {
  const [active, setActive] = useState(0)
  const Heading = variant === 'embedded' ? 'h3' : 'h2'

  function selectStep(step, index) {
    setActive(index)
    onSelect?.({
      selectionId: `${step.id}:${step.latex}`,
      title: step.rule,
      body: step.short,
      detail: step.detail,
      latex: step.latex,
      beforeLatex: index > 0 ? steps[index - 1].latex : null,
      assumptions: step.assumptions,
      symbols: step.symbols,
    })
  }

  return (
    <section className={`clickable-derivation is-${variant}`}>
      <header>
        {eyebrow && <span>{eyebrow}</span>}
        <Heading>{title}</Heading>
        <p><RichContent value={intro} /></p>
      </header>
      <ol>
        {steps.map((step, index) => (
          <li className={index === active ? 'is-active' : ''} key={step.id}>
            <button type="button" aria-pressed={index === active} onClick={() => selectStep(step, index)}>
              <span className="derivation-line-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="derivation-line-content">
                <span className="derivation-line-rule"><RichContent value={step.rule} /></span>
                <MathFormula block latex={step.latex} className="derivation-line-math" />
                <span className="derivation-line-short"><RichContent value={step.short} /></span>
                {step.detail && <span className="derivation-line-detail"><RichContent value={step.detail} /></span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
