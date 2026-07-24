import MathFormula from './MathFormula'
import MathText from './MathText'
import CourseWorldOverview from './CourseWorldOverview'

const majorSectionIds = new Set(['problem-setting', 'transition-model', 'mdp-definition'])

function FormulaStack({ formulas, layout = 'grid' }) {
  if (!formulas?.length) return null
  return (
    <div className={`narrative-formulas${layout === 'stacked' ? ' is-stacked' : ''}`}>
      {formulas.map((formula) => <MathFormula block latex={formula} key={formula} />)}
    </div>
  )
}

export default function MdpNarrative({ sections, overview, lang }) {
  return (
    <section className="mdp-narrative" aria-label="MDP learning path">
      {sections.map((section) => {
        const isMajor = majorSectionIds.has(section.id)
        const [opening, ...rest] = section.paragraphs
        return (
          <article className={`narrative-section${isMajor ? ' is-major' : ' is-continuation'}`} id={section.id} key={section.id}>
            <div className="narrative-body">
              {isMajor ? (
                <>
                  <header className="narrative-heading">
                    <span className="narrative-kicker">{section.kicker}</span>
                    <h2>{section.title}</h2>
                  </header>
                  <p><MathText>{opening}</MathText></p>
                </>
              ) : (
                <p className="narrative-turn-opening"><MathText>{section.paragraphs.join(lang === 'zh' ? '' : ' ')}</MathText></p>
              )}
              {isMajor && rest.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
              {section.id === 'problem-setting' && <CourseWorldOverview content={overview} />}
              <FormulaStack formulas={section.formulas} layout={section.formulaLayout} />
              {section.compare && (
                <dl className="narrative-compare">
                  {section.compare.map(([owner, role]) => <div key={owner}><dt><MathText>{owner}</MathText></dt><dd><MathText>{role}</MathText></dd></div>)}
                </dl>
              )}
              {section.note && <p className="narrative-note"><MathText>{section.note}</MathText></p>}
            </div>
          </article>
        )
      })}
    </section>
  )
}
