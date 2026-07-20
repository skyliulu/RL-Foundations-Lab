import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import katex from 'katex'

import { copy } from '../content.js'

function collectLatex(node, output = []) {
  if (!node || typeof node !== 'object') return output
  for (const [key, value] of Object.entries(node)) {
    if ((key === 'latex' || key === 'formula') && typeof value === 'string') output.push(value)
    if (key === 'formulas' && Array.isArray(value)) value.forEach((item) => output.push(item))
    if (key !== 'sources') collectLatex(value, output)
  }
  return output
}

function collectReaderStrings(node, output = []) {
  if (typeof node === 'string') {
    output.push(node)
    return output
  }
  if (!node || typeof node !== 'object') return output
  for (const [key, value] of Object.entries(node)) {
    if (key !== 'sources') collectReaderStrings(value, output)
  }
  return output
}

test('every chapter formula is valid LaTeX', () => {
  for (const locale of ['zh', 'en']) {
    for (const chapterId of copy[locale].chapters.map((chapter) => chapter.id)) {
      const formulas = collectLatex(copy[locale][chapterId])
      assert.ok(formulas.length > 0, `${locale}.${chapterId} should expose formulas`)
      formulas.forEach((latex) => {
        assert.doesNotThrow(() => katex.renderToString(latex, { throwOnError: true, strict: 'error' }), `${locale}.${chapterId}: ${latex}`)
      })
    }
  }
})

test('JSX does not hand-build mathematical notation with sub or sup tags', () => {
  const engineDir = path.dirname(fileURLToPath(import.meta.url))
  const srcDir = path.resolve(engineDir, '..')
  const jsxFiles = []
  const visit = (directory) => {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) visit(target)
      else if (entry.name.endsWith('.jsx')) jsxFiles.push(target)
    })
  }
  visit(srcDir)
  jsxFiles.forEach((file) => {
    const source = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /<(?:sub|sup)>/i, path.relative(srcDir, file))
  })
})

test('chapter copy does not expose source-production references', () => {
  for (const locale of ['zh', 'en']) {
    for (const chapterId of copy[locale].chapters.map((chapter) => chapter.id)) {
      const readerCopy = collectReaderStrings(copy[locale][chapterId]).join('\n')
      assert.doesNotMatch(readerCopy, /课件|课程|幻灯片|\bcourse\b|\b(?:slide|lecture)\s*(?:\d|page)/i, `${locale}.${chapterId}`)
    }
  }
})

test('the product surface no longer contains the standalone derivation explorer', () => {
  const engineDir = path.dirname(fileURLToPath(import.meta.url))
  const srcDir = path.resolve(engineDir, '..')
  const appSource = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf8')
  assert.doesNotMatch(appSource, /BellmanDerivationExplorer|ReturnDerivationPath|DERIVATION EXPLORER/)
  assert.equal(fs.existsSync(path.join(srcDir, 'components', 'BellmanDerivationExplorer.jsx')), false)
  assert.equal(fs.existsSync(path.join(srcDir, 'components', 'ReturnDerivationPath.jsx')), false)
})
