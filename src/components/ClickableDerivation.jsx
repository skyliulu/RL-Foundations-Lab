import { useState } from 'react'
import MathFormula from './MathFormula'

export default function ClickableDerivation({ eyebrow, title, intro, steps, onSelect }) {
  const [active, setActive] = useState(0)

  function selectStep(step, index) {
    setActive(index)
    onSelect?.({
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
    <section className="clickable-derivation">
      <header>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{intro}</p>
      </header>
      <ol>
        {steps.map((step, index) => (
          <li className={index === active ? 'is-active' : ''} key={step.id}>
            <button type="button" aria-pressed={index === active} onClick={() => selectStep(step, index)}>
              <span className="derivation-line-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="derivation-line-rule">{step.rule}</span>
              <MathFormula block latex={step.latex} className="derivation-line-math" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
