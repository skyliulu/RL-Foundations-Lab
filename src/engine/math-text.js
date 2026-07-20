const mathRunPattern = /\\[A-Za-z]+(?:\{[^}]*\})?|[←→≤≥≠≈=]|[([]?[A-Za-z0-9αβγδεηθλμρσφπΔΣ∑∞⋯…][A-Za-z0-9αβγδεηθλμρσφπΔΣ∑∞⋯…₀₁₂₃₄₅₆₇₈₉₊₋ₐₛₜₖᵏᵣᵗ²³̃_^{}()[\]|,+\-−=<>≤≥≠≈←→\/.'′*]*[)\]]?/g
const distinctiveMathPattern = /\\|[αβγδεηθλμρσφπΔΣ∑∞⋯…₀₁₂₃₄₅₆₇₈₉₊₋ₐₛₜₖᵏᵣᵗ²³̃′≤≥≠≈←→=^_{}|]|^[VQGSTRPAvqpr]\w*\([^)]*\)$|^[VQvq]\*$/
const proseWordPattern = /\b(?!arg\b|max\b|min\b|log\b|exp\b|clip\b|old\b|new\b)[A-Za-z]{4,}\b/

const symbolMap = new Map([
  ['α', String.raw`\alpha`], ['β', String.raw`\beta`], ['π', String.raw`\pi`],
  ['γ', String.raw`\gamma`], ['λ', String.raw`\lambda`], ['η', String.raw`\eta`],
  ['ρ', String.raw`\rho`], ['φ', String.raw`\phi`],
  ['θ', String.raw`\theta`], ['μ', String.raw`\mu`], ['σ', String.raw`\sigma`],
  ['Δ', String.raw`\Delta`], ['ε', String.raw`\epsilon`], ['δ', String.raw`\delta`],
  ['Σ', String.raw`\sum`], ['∑', String.raw`\sum`], ['∞', String.raw`\infty`],
  ['⋯', String.raw`\cdots`], ['…', String.raw`\ldots`],
  ['←', String.raw`\leftarrow`], ['→', String.raw`\rightarrow`], ['≤', String.raw`\le`],
  ['≥', String.raw`\ge`], ['≠', String.raw`\ne`], ['≈', String.raw`\approx`], ['−', '-'],
  ['′', "'"], ['²', '^{2}'], ['³', '^{3}'], ['ᵏ', '^{k}'], ['ᵣ', '^{r}'], ['ᵗ', '^{t}'],
])

const subscriptMap = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5',
  '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '-', 'ₐ': 'a', 'ₛ': 's', 'ₜ': 't', 'ₖ': 'k',
}

export function normalizeMathText(source) {
  let normalizedSource = String(source)
  while (normalizedSource.endsWith('}') && (normalizedSource.match(/}/g)?.length || 0) > (normalizedSource.match(/{/g)?.length || 0)) {
    normalizedSource = normalizedSource.slice(0, -1)
  }

  let latex = normalizedSource
    .replace(/([A-Za-z])̃/g, (_, symbol) => String.raw`\widetilde{${symbol}}`)
    .replace(/([VQvPTr])π([₀₁₂₃₄₅₆₇₈₉₊₋ₜₖ]*)/g, (_, base, suffix) => `${base}^{π${suffix}}`)
    .replace(/[₀₁₂₃₄₅₆₇₈₉₊₋ₐₛₜₖ]+/g, (run) => `_{${[...run].map((char) => subscriptMap[char]).join('')}}`)

  for (const [symbol, replacement] of symbolMap) latex = latex.replaceAll(symbol, replacement)

  return latex
    .replace(/\\(leftarrow|rightarrow|approx|epsilon|lambda|gamma|theta|sigma|Delta|delta|infty|cdots|ldots|sum|alpha|beta|eta|rho|phi|pi|mu|ne|le(?!ftarrow)|ge)(?=[A-Za-z])/g, String.raw`\$1 `)
    .replace(/\barg\s+max\b/g, String.raw`\operatorname*{arg\,max}`)
    .replace(/\bmax(?=[_(\s]|$)/g, String.raw`\max`)
    .replace(/\bmin(?=[_(\s]|$)/g, String.raw`\min`)
    .replace(/\bclip(?=\()/g, String.raw`\operatorname{clip}`)
    .replace(/\bGreedy(?=\()/g, String.raw`\operatorname{Greedy}`)
}

export function splitMathText(source) {
  const text = String(source ?? '')
  const segments = []
  let cursor = 0

  for (const match of text.matchAll(mathRunPattern)) {
    const rawValue = match[0]
    const trailingPunctuation = /[,.]$/.test(rawValue) && /[)\]]/.test(rawValue) ? rawValue.slice(-1) : ''
    const value = trailingPunctuation ? rawValue.slice(0, -1) : rawValue
    if (!distinctiveMathPattern.test(value)) continue
    if (match.index > cursor) segments.push({ type: 'text', value: text.slice(cursor, match.index) })
    segments.push({ type: 'math', value: normalizeMathText(value) })
    if (trailingPunctuation) segments.push({ type: 'text', value: trailingPunctuation })
    cursor = match.index + rawValue.length
  }

  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) })
  return segments.length ? segments : [{ type: 'text', value: text }]
}

export function isStandaloneFormula(source) {
  const text = String(source ?? '').trim()
  const hasFullWidthProsePunctuation = /[，。；：！？、]/.test(text)
  return Boolean(text && distinctiveMathPattern.test(text) && !/[\u3400-\u9fff]/.test(text) && !hasFullWidthProsePunctuation && !proseWordPattern.test(text))
}
