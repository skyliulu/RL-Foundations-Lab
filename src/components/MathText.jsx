import MathFormula from './MathFormula'
import { isStandaloneFormula, normalizeMathText, splitMathText } from '../engine/math-text'

export default function MathText({ children, text, className = '' }) {
  const source = text ?? children ?? ''
  if (isStandaloneFormula(source)) return <MathFormula latex={normalizeMathText(source)} className={className} />

  return (
    <span className={`math-text ${className}`.trim()}>
      {splitMathText(source).map((segment, index) => segment.type === 'math'
        ? <MathFormula latex={segment.value} key={`${index}-${segment.value}`} />
        : <span key={`${index}-${segment.value}`}>{segment.value}</span>)}
    </span>
  )
}
