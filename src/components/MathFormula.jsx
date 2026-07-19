import katex from 'katex'
import 'katex/dist/katex.min.css'

export default function MathFormula({ children, latex, block = false, className = '' }) {
  const source = latex ?? children ?? ''
  const html = katex.renderToString(source, {
    displayMode: block,
    output: 'htmlAndMathml',
    strict: 'error',
    throwOnError: false,
    trust: false,
  })
  const Tag = block ? 'div' : 'span'
  return <Tag className={`math-formula ${className}`.trim()} data-latex={source} dangerouslySetInnerHTML={{ __html: html }} />
}
