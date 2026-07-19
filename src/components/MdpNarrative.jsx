import MathFormula from './MathFormula'

function FormulaStack({ formulas }) {
  if (!formulas?.length) return null
  return (
    <div className="narrative-formulas">
      {formulas.map((formula) => <MathFormula latex={formula} key={formula} />)}
    </div>
  )
}

export default function MdpNarrative({ sections }) {
  return (
    <section className="mdp-narrative" aria-label="MDP learning path">
      {sections.map((section) => (
        <article className="narrative-section" id={section.id} key={section.id}>
          <div className="narrative-body">
            <header className="narrative-heading">
              <span className="narrative-kicker">{section.kicker}</span>
              <h2>{section.title}</h2>
            </header>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <FormulaStack formulas={section.formulas} />
            {section.compare && (
              <dl className="narrative-compare">
                {section.compare.map(([owner, role]) => <div key={owner}><dt>{owner}</dt><dd>{role}</dd></div>)}
              </dl>
            )}
            {section.note && <p className="narrative-note">{section.note}</p>}
          </div>
        </article>
      ))}
    </section>
  )
}
