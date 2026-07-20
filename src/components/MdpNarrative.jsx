import MathFormula from './MathFormula'
import MathText from './MathText'
import CourseWorldOverview from './CourseWorldOverview'

function FormulaStack({ formulas }) {
  if (!formulas?.length) return null
  return (
    <div className="narrative-formulas">
      {formulas.map((formula) => <MathFormula block latex={formula} key={formula} />)}
    </div>
  )
}

export default function MdpNarrative({ sections, overview }) {
  return (
    <section className="mdp-narrative" aria-label="MDP learning path">
      {sections.map((section) => (
        <article className="narrative-section" id={section.id} key={section.id}>
          <div className="narrative-body">
            <header className="narrative-heading">
              <span className="narrative-kicker">{section.kicker}</span>
              <h2>{section.title}</h2>
            </header>
            {section.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
            {section.id === 'problem-setting' && <CourseWorldOverview content={overview} />}
            <FormulaStack formulas={section.formulas} />
            {section.compare && (
              <dl className="narrative-compare">
                {section.compare.map(([owner, role]) => <div key={owner}><dt><MathText>{owner}</MathText></dt><dd><MathText>{role}</MathText></dd></div>)}
              </dl>
            )}
            {section.note && <p className="narrative-note"><MathText>{section.note}</MathText></p>}
          </div>
        </article>
      ))}
    </section>
  )
}
