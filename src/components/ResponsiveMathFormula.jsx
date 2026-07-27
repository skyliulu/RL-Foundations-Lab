import MathFormula from './MathFormula'

export default function ResponsiveMathFormula({ latex, narrowLatex, block = false, className = '' }) {
  if (!narrowLatex) return <MathFormula block={block} className={className} latex={latex} />

  const Tag = block ? 'div' : 'span'
  return (
    <Tag className={`responsive-math-formula ${className}`.trim()}>
      <MathFormula block={block} className="responsive-math-wide" latex={latex} />
      <MathFormula block={block} className="responsive-math-narrow" latex={narrowLatex} />
    </Tag>
  )
}
