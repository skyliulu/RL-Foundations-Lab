import assert from 'node:assert/strict'
import test from 'node:test'
import katex from 'katex'

import { copy } from '../content.js'
import { isStandaloneFormula, normalizeMathText, splitMathText } from './math-text.js'

function collectStrings(node, output = []) {
  if (typeof node === 'string') output.push(node)
  else if (Array.isArray(node)) node.forEach((item) => collectStrings(item, output))
  else if (node && typeof node === 'object') Object.values(node).forEach((value) => collectStrings(value, output))
  return output
}

test('inline pseudo-math is normalized to valid LaTeX', () => {
  const examples = [
    ['V₄ = 0', String.raw`V_{4} = 0`],
    ['Vπ(s)', String.raw`V^{\pi}(s)`],
    ['vₖ₊₁=rπ+γPπvₖ', String.raw`v_{k+1}=r^{\pi}+\gamma P^{\pi}v_{k}`],
    ['Δ ← max(Δ, |old−V(s)|)', String.raw`\Delta \leftarrow \max(\Delta, |old-V(s)|)`],
    ['g̃ₖ', String.raw`\widetilde{g}_{k}`],
    ['𝒜(s)', String.raw`\mathcal{A}(s)`],
    ['γ∈(0,1)', String.raw`\gamma\in(0,1)`],
    ['V*(s)', String.raw`V^*(s)`],
  ]

  examples.forEach(([source, expected]) => {
    const latex = normalizeMathText(source)
    assert.equal(latex, expected)
    assert.doesNotThrow(() => katex.renderToString(latex, { throwOnError: true, strict: 'error' }))
  })
  assert.equal(isStandaloneFormula('(I−γPπ)vπ=rπ'), true)
  assert.equal(isStandaloneFormula('V*(s)'), true)
  assert.deepEqual(splitMathText('Initialize V(s), for example to zero'), [
    { type: 'text', value: 'Initialize ' },
    { type: 'math', value: 'V(s)' },
    { type: 'text', value: ',' },
    { type: 'text', value: ' for example to zero' },
  ])
})

test('every formula-like run in chapter copy normalizes to valid LaTeX', () => {
  for (const locale of ['zh', 'en']) {
    collectStrings(copy[locale]).filter((source) => !source.includes('\\')).forEach((source) => {
      const formulas = isStandaloneFormula(source)
        ? [normalizeMathText(source)]
        : splitMathText(source).filter((segment) => segment.type === 'math').map((segment) => segment.value)
      formulas.forEach((formula) => {
        assert.doesNotThrow(
          () => katex.renderToString(formula, { throwOnError: true, strict: 'error' }),
          `${locale}: ${source} -> ${formula}`,
        )
      })
    })
  }
})

test('full-width prose punctuation cannot turn a mixed pseudocode line into one formula', () => {
  assert.equal(isStandaloneFormula('Δ ← max(Δ, |new−V(s)|)；V(s) ← new'), false)
  assert.equal(isStandaloneFormula('π(a|s) ← ε/|A|，a≠a*'), false)
})

test('explicit dollar-delimited inline LaTeX splits cleanly and renders strictly in KaTeX', () => {
  const sample = String.raw`在线性近似 $\widehat v(s,\mathbf w)=\boldsymbol\phi(s)^{\top}\mathbf w$ 中，更新为 $\Delta\mathbf w=\alpha\delta\boldsymbol\phi(S_t)$。`
  assert.equal(isStandaloneFormula(sample), false)
  const segments = splitMathText(sample)
  assert.deepEqual(
    segments.filter((segment) => segment.type === 'math').map((segment) => segment.value),
    [
      String.raw`\widehat v(s,\mathbf w)=\boldsymbol\phi(s)^{\top}\mathbf w`,
      String.raw`\Delta\mathbf w=\alpha\delta\boldsymbol\phi(S_t)`,
    ],
  )
  for (const locale of ['zh', 'en']) {
    collectStrings(copy[locale]).filter((source) => source.includes('$')).forEach((source) => {
      splitMathText(source)
        .filter((segment) => segment.type === 'math')
        .forEach((segment) => {
          assert.doesNotThrow(
            () => katex.renderToString(segment.value, { throwOnError: true, strict: 'error' }),
            `${locale}: ${source} -> ${segment.value}`,
          )
        })
    })
  }
})
