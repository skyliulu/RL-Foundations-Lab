import test from 'node:test'
import assert from 'node:assert/strict'

import { bellmanChapter, bellmanPresetConfigs } from '../content/bellman.js'
import { mdpChapter } from '../content/mdp.js'
import { returnChapter, returnPresetConfigs } from '../content/returns.js'
import { optimalityChapter, optimalityPresetConfigs } from '../content/optimality.js'
import { planningChapter, planningPresetConfigs } from '../content/planning.js'
import { glossary } from '../content/glossary.js'
import { validateChapterDefinition, validateFoundationChapterDefinition } from '../content/schema.js'
import { copy } from '../content.js'

test('the Bellman golden chapter satisfies the structured content contract', () => {
  assert.deepEqual(validateChapterDefinition(bellmanChapter), [])
  assert.equal(copy.zh.bellman.prelude.length, 2)
  assert.equal(copy.en.bellman.sections.length, copy.zh.bellman.sections.length)
  assert.deepEqual(
    copy.en.bellman.sections.map((section) => section.id),
    copy.zh.bellman.sections.map((section) => section.id),
  )
  assert.equal(copy.zh.bellman.microscope.pseudocode.length, 4)
  assert.deepEqual(
    copy.en.bellman.microscope.pseudocode.map((line) => line.id),
    copy.zh.bellman.microscope.pseudocode.map((line) => line.id),
  )
})

test('the MDP foundation chapter is bilingual, structured, and source-traceable', () => {
  assert.deepEqual(validateFoundationChapterDefinition(mdpChapter), [])
  assert.deepEqual(mdpChapter.zh.prelude.map((section) => section.id), mdpChapter.en.prelude.map((section) => section.id))
  assert.deepEqual(mdpChapter.zh.sections.map((section) => section.id), mdpChapter.en.sections.map((section) => section.id))
  assert.ok(mdpChapter.zh.explorer.distribution.includes('p(s′|s,a)'))
  mdpChapter.sources.forEach((source) => {
    assert.match(source.href, /^https:\/\//)
    assert.match(source.pages, /PDF pp?\./)
  })
})

test('the Return chapter separates trajectory samples from exact state value', () => {
  assert.deepEqual(validateFoundationChapterDefinition(returnChapter), [])
  assert.deepEqual(returnChapter.zh.sections.map((section) => section.id), returnChapter.en.sections.map((section) => section.id))
  assert.deepEqual(Object.keys(returnPresetConfigs), Object.keys(returnChapter.zh.explorer.presetItems))
  assert.match(returnChapter.zh.prelude[1].formulas[0], /E/)
  assert.match(returnChapter.en.prelude[0].formulas[0], /Gₜ/)
})

test('the Optimality chapter preserves the expectation-to-max conceptual switch', () => {
  assert.deepEqual(validateFoundationChapterDefinition(optimalityChapter), [])
  assert.deepEqual(optimalityChapter.zh.prelude.map((section) => section.id), optimalityChapter.en.prelude.map((section) => section.id))
  assert.deepEqual(Object.keys(optimalityPresetConfigs), Object.keys(optimalityChapter.en.explorer.presetItems))
  assert.match(optimalityChapter.zh.prelude[1].formulas[0], /max/)
})

test('the Planning chapter compares VI, TPI, and PI under one content contract', () => {
  assert.deepEqual(validateFoundationChapterDefinition(planningChapter), [])
  assert.deepEqual(Object.keys(planningPresetConfigs), Object.keys(planningChapter.zh.explorer.presetItems))
  assert.match(planningChapter.zh.sections[0].formula, /j = 1/)
  assert.match(planningChapter.en.bridge, /backups/)
})

test('chapter sources are public and traceable to precise PDF pages', () => {
  bellmanChapter.sources.forEach((source) => {
    assert.match(source.href, /^https:\/\//)
    assert.match(source.pages, /PDF pp?\./)
    assert.doesNotMatch(source.href, /^[A-Za-z]:\\/)
  })
})

test('every Bellman glossary term has equivalent Chinese and English entries', () => {
  bellmanChapter.termIds.forEach((termId) => {
    const term = glossary[termId]
    assert.ok(term, `missing glossary term ${termId}`)
    assert.ok(term.zh.term && term.zh.definition)
    assert.ok(term.en.term && term.en.definition)
  })
})

test('every teaching preset maps to a deterministic experiment configuration', () => {
  const presetIds = bellmanChapter.zh.presets.map((preset) => preset.id)
  assert.deepEqual(Object.keys(bellmanPresetConfigs), presetIds)
  Object.values(bellmanPresetConfigs).forEach((preset) => {
    assert.ok(preset.gamma >= 0 && preset.gamma < 1)
    assert.ok(preset.noise >= 0 && preset.noise <= 0.4)
    assert.ok(['fixed', 'greedy'].includes(preset.policy))
    assert.ok(Number.isInteger(preset.selected.row) && Number.isInteger(preset.selected.col))
    assert.ok(['zeros', 'converged'].includes(preset.seed))
  })
})
