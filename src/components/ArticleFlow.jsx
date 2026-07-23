import MathFormula from './MathFormula'
import ClickableDerivation from './ClickableDerivation'
import RichContent from './RichContent'
import ChapterDeepening from './ChapterDeepening'

function FlowHeader({ block }) {
  return <header className="article-flow-heading"><span><RichContent value={block.kicker} /></span><h2><RichContent value={block.title} /></h2></header>
}

function FlowSection({ block }) {
  return <article className={`article-flow-block article-flow-section flow-${block.id}`}>
    <FlowHeader block={block} />
    {block.paragraphs.map((paragraph, index) => <p key={`${block.id}-p-${index}`}><RichContent value={paragraph} /></p>)}
    {block.formulas?.length > 0 && <div className="article-flow-equations">{block.formulas.map((formula) => <MathFormula block className={`article-flow-equation is-${formula.role || 'support'}`} latex={formula.latex} key={formula.latex} />)}</div>}
  </article>
}

function FlowProse({ block }) {
  return <div className={`article-flow-prose flow-${block.id}`}>
    {block.paragraphs.map((paragraph, index) => <p key={`${block.id}-p-${index}`}><RichContent value={paragraph} /></p>)}
    {block.formulas?.length > 0 && <div className="article-flow-equations">{block.formulas.map((formula) => <MathFormula block className={`article-flow-equation is-${formula.role || 'support'}`} latex={formula.latex} key={formula.latex} />)}</div>}
  </div>
}

function FlowTurn({ block, lang }) {
  const [opening, ...rest] = block.paragraphs
  return <div className={`article-flow-prose article-flow-turn flow-${block.id}`}>
    <p className="article-flow-turn-opening">
      <strong className="chapter-prose-lead"><RichContent value={block.title} /></strong>
      <span className="chapter-prose-separator" aria-hidden="true">{lang === 'zh' ? '。' : '. '}</span>
      <RichContent value={opening} />
    </p>
    {rest.map((paragraph, index) => <p key={`${block.id}-p-${index + 1}`}><RichContent value={paragraph} /></p>)}
    {block.formulas?.length > 0 && <div className="article-flow-equations">{block.formulas.map((formula) => <MathFormula block className={`article-flow-equation is-${formula.role || 'support'}`} latex={formula.latex} key={formula.latex} />)}</div>}
  </div>
}

function FlowTopic({ block, lang }) {
  return <ChapterDeepening
    lang={lang}
    sections={[{ ...block, formulas: block.formulas?.map((formula) => formula.latex) || [] }]}
  />
}

function FlowTable({ block, label }) {
  return <figure className={`article-flow-evidence article-flow-${block.type} flow-${block.id}`}>
    <figcaption><span><RichContent value={block.kicker} /></span><strong><RichContent value={block.title} /></strong></figcaption>
    <p><RichContent value={block.intro} /></p>
    <div className="article-flow-table-scroll">
      <table aria-label={label}>
        <thead><tr>{block.columns.map((column, columnIndex) => <th scope="col" key={`${block.id}-column-${columnIndex}-${typeof column === 'string' ? column : column?.latex || 'rich'}`}><RichContent value={column} /></th>)}</tr></thead>
        <tbody>{block.rows.map((row, rowIndex) => <tr key={`${block.id}-row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${block.id}-${rowIndex}-${cellIndex}`}><RichContent value={cell} /></td>)}</tr>)}</tbody>
      </table>
    </div>
    {block.note && <p className="article-flow-note"><RichContent value={block.note} /></p>}
  </figure>
}

function FlowAlgorithm({ block, lang }) {
  return <article className={`article-flow-evidence article-flow-algorithm flow-${block.id}`}>
    <header className="article-flow-evidence-heading"><span><RichContent value={block.kicker} /></span><h3><RichContent value={block.title} /></h3></header>
    <p><RichContent value={block.intro} /></p>
    <div className="article-flow-algorithm-body"><span>{lang === 'zh' ? '完整步骤' : 'Complete loop'}</span><ol>{block.steps.map((item, index) => <li key={`${block.id}-${index}`}><b>{String(index + 1).padStart(2, '0')}</b><code><RichContent value={item} /></code></li>)}</ol></div>
    {block.note && <p className="article-flow-note"><RichContent value={block.note} /></p>}
  </article>
}

function FlowTheorem({ block, lang }) {
  return <article className={`article-flow-evidence article-flow-theorem flow-${block.id}`}>
    <header className="article-flow-evidence-heading"><span><RichContent value={block.kicker} /></span><h3><RichContent value={block.title} /></h3></header>
    <strong className="article-flow-claim"><RichContent value={block.claim} /></strong>
    {block.paragraphs.map((paragraph, index) => <p key={`${block.id}-p-${index}`}><RichContent value={paragraph} /></p>)}
    <div className="article-flow-conditions"><span>{lang === 'zh' ? '条件与作用' : 'Conditions and roles'}</span>{block.conditions.map((condition) => <div key={condition.latex}><MathFormula block latex={condition.latex} /><p><RichContent value={condition.explanation} /></p></div>)}</div>
  </article>
}

export default function ArticleFlow({ blocks, lang, onSelect, renderExperiment }) {
  return <section className="article-flow" aria-label={lang === 'zh' ? '连续正文' : 'Continuous article'}>
    {blocks.map((block) => {
      if (block.type === 'section') return <FlowSection block={block} key={block.id} />
      if (block.type === 'prose') return <FlowProse block={block} key={block.id} />
      if (block.type === 'turn') return <FlowTurn block={block} lang={lang} key={block.id} />
      if (block.type === 'topic') return <FlowTopic block={block} lang={lang} key={block.id} />
      if (block.type === 'derivation') return <ClickableDerivation eyebrow={block.level === 'embedded' ? null : block.kicker} title={block.title} intro={block.intro} steps={block.steps} onSelect={onSelect} variant={block.level === 'embedded' ? 'embedded' : 'major'} key={block.id} />
      if (block.type === 'example' || block.type === 'comparison') return <FlowTable block={block} label={block.title} key={block.id} />
      if (block.type === 'algorithm') return <FlowAlgorithm block={block} lang={lang} key={block.id} />
      if (block.type === 'theorem') return <FlowTheorem block={block} lang={lang} key={block.id} />
      if (block.type === 'experiment') return <div className="article-flow-experiment" key={block.id}>{renderExperiment(block)}</div>
      return null
    })}
  </section>
}
