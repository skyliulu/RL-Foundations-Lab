import MathFormula from './MathFormula'
import MathText from './MathText'

export default function RichContent({ value }) {
  if (Array.isArray(value)) {
    return <>{value.map((part, index) => (
      <RichContent value={part} key={`${index}-${typeof part === 'string' ? part : part?.latex || 'part'}`} />
    ))}</>
  }
  if (value && typeof value === 'object' && value.latex) {
    return <MathFormula latex={value.latex} />
  }
  return <MathText>{String(value ?? '')}</MathText>
}
