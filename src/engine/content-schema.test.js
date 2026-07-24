import test from 'node:test'
import assert from 'node:assert/strict'

import { bellmanChapter, bellmanPresetConfigs } from '../content/bellman.js'
import { mdpChapter } from '../content/mdp.js'
import { returnChapter, returnPresetConfigs } from '../content/returns.js'
import { optimalityChapter, optimalityPresetConfigs } from '../content/optimality.js'
import { planningChapter, planningPresetConfigs } from '../content/planning.js'
import { ppoChapter } from '../content/ppo.js'
import { rlhfChapter } from '../content/rlhf-system.js'
import { agentMdpChapter, codingRlChapter, creditChapter, dpoChapter, grpoChapter } from '../content/modern-extension.js'
import { tokenMdpChapter } from '../content/token-mdp.js'
import { actorCriticChapter, approximationChapter, controlChapter, dqnChapter, monteCarloChapter, policyGradientChapter, tdChapter, vfaChapter } from '../content/part23.js'
import { glossary } from '../content/glossary.js'
import { coverageClassifications, coverageItemTypes, sourceCoverageMatrix } from '../content/source-coverage.js'
import { terminologyPolicy } from '../content/terminology.js'
import { validateChapterDefinition, validateFoundationChapterDefinition } from '../content/schema.js'
import { copy } from '../content.js'

function collectVisibleIds(value, result = new Set()) {
  if (!value || typeof value !== 'object') return result
  if (typeof value.id === 'string') result.add(value.id)
  Object.entries(value).forEach(([key, child]) => {
    if (key === 'sources') return
    if (Array.isArray(child)) child.forEach((item) => collectVisibleIds(item, result))
    else if (child && typeof child === 'object') collectVisibleIds(child, result)
  })
  return result
}

function findVisibleNode(value, id) {
  if (!value || typeof value !== 'object') return null
  if (value.id === id) return value
  for (const [key, child] of Object.entries(value)) {
    if (key === 'sources') continue
    if (Array.isArray(child)) {
      for (const item of child) {
        const found = findVisibleNode(item, id)
        if (found) return found
      }
    } else if (child && typeof child === 'object') {
      const found = findVisibleNode(child, id)
      if (found) return found
    }
  }
  return null
}

function visibleText(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(visibleText).join(' ')
  if (!value || typeof value !== 'object') return ''
  return Object.entries(value)
    .filter(([key]) => !['latex', 'formulas', 'formula', 'sources'].includes(key))
    .map(([, child]) => visibleText(child))
    .join(' ')
}

test('the Bellman golden chapter satisfies the structured content contract', () => {
  assert.deepEqual(validateChapterDefinition(bellmanChapter), [])
  assert.equal(copy.zh.bellman.prelude.length, 2)
  assert.equal(copy.en.bellman.sections.length, copy.zh.bellman.sections.length)
  assert.deepEqual(
    copy.en.bellman.sections.map((section) => section.id),
    copy.zh.bellman.sections.map((section) => section.id),
  )
  assert.equal(copy.zh.bellman.microscope.pseudocode.length, 4)
  assert.equal(copy.zh.bellman.derivation.length, 5)
  assert.deepEqual(copy.zh.bellman.derivation.map((step) => step.id), copy.en.bellman.derivation.map((step) => step.id))
  assert.match(copy.zh.bellman.derivation.at(-1).latex, /\\boxed/)
  assert.deepEqual(
    copy.en.bellman.microscope.pseudocode.map((line) => line.id),
    copy.zh.bellman.microscope.pseudocode.map((line) => line.id),
  )
})

test('the MDP foundation chapter is bilingual, structured, and source-traceable', () => {
  assert.deepEqual(validateFoundationChapterDefinition(mdpChapter), [])
  assert.deepEqual(mdpChapter.zh.prelude.map((section) => section.id), mdpChapter.en.prelude.map((section) => section.id))
  assert.deepEqual(mdpChapter.zh.sections.map((section) => section.id), mdpChapter.en.sections.map((section) => section.id))
  assert.equal(mdpChapter.zh.learningPath.length, 9)
  assert.deepEqual(mdpChapter.zh.learningPath.map((step) => step.id), mdpChapter.en.learningPath.map((step) => step.id))
  assert.equal(mdpChapter.zh.learningPath[0].id, 'problem-setting')
  assert.match(mdpChapter.zh.learningPath[0].paragraphs.join(' '), /5×5.*目标.*禁区.*边界/)
  assert.match(mdpChapter.zh.overview.caption, /25.*禁区.*目标/)
  assert.match(mdpChapter.en.overview.caption, /25.*penalized.*target/i)
  assert.equal(mdpChapter.zh.overview.eyebrow, '共同环境 · 5×5 网格世界')
  assert.equal(mdpChapter.en.overview.eyebrow, 'Shared environment · 5×5 grid world')
  ;['locationTitle', 'choiceTitle', 'responseTitle'].forEach((field) => {
    assert.ok(mdpChapter.zh.overview[field])
    assert.ok(mdpChapter.en.overview[field])
  })
  assert.equal(mdpChapter.zh.learningPath[1].id, 'state-space')
  assert.match(mdpChapter.zh.learningPath[1].formulas[1], /s_\{25\}/)
  assert.equal(mdpChapter.zh.learningPath.at(-1).id, 'mdp-definition')
  const zhMarkov = mdpChapter.zh.learningPath.at(-1)
  const enMarkov = mdpChapter.en.learningPath.at(-1)
  assert.equal(zhMarkov.formulaLayout, 'stacked')
  assert.equal(enMarkov.formulaLayout, 'stacked')
  assert.equal(zhMarkov.formulas.length, 3)
  assert.equal(enMarkov.formulas.length, 3)
  assert.match(zhMarkov.paragraphs.join(' '), /完整历史.*充分概括.*风向.*状态空间/)
  assert.match(enMarkov.paragraphs.join(' '), /complete history.*sufficient summary.*wind.*state space/i)
  assert.match(zhMarkov.formulas[1], /H_t.*S_t/)
  assert.match(zhMarkov.formulas[2], /H_t.*S_t/)
  assert.doesNotMatch(mdpChapter.zh.intro, /Bellman|PPO|MDP|状态|动作|策略|奖励/)
  assert.doesNotMatch(mdpChapter.en.intro, /Bellman|PPO|MDP|state|action|policy|reward/i)
  assert.ok(mdpChapter.zh.experimentIntro.length > 40)
  assert.ok(mdpChapter.zh.interpretation.length > 40)
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
  assert.equal(returnChapter.zh.derivation.length, 6)
  assert.deepEqual(returnChapter.zh.derivation.map((step) => step.id), returnChapter.en.derivation.map((step) => step.id))
  assert.match(returnChapter.zh.derivation[4].latex, /G_\{t\+1\}/)
  assert.match(returnChapter.zh.derivation[5].latex, /V\^\{\\pi\}/)
  assert.match(returnChapter.zh.prelude[1].formulas[0], /E/)
  assert.match(returnChapter.en.prelude[0].formulas[0], /G_t/)
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
  assert.match(planningChapter.zh.sections[0].formula, /j=1/)
  assert.match(planningChapter.en.bridge, /backups/)
})

test('every implemented chapter has a complete reading-to-experiment arc', () => {
  const chapters = [mdpChapter, returnChapter, bellmanChapter, optimalityChapter, planningChapter, monteCarloChapter, approximationChapter, tdChapter, controlChapter, vfaChapter, dqnChapter, policyGradientChapter, actorCriticChapter, ppoChapter, tokenMdpChapter, rlhfChapter, dpoChapter, grpoChapter, codingRlChapter, agentMdpChapter, creditChapter]
  chapters.forEach((chapter) => {
    for (const locale of ['zh', 'en']) {
      const content = chapter[locale]
      assert.ok(content.intro.length > 40, `${chapter.id}.${locale}.intro`)
      assert.ok(content.experimentIntro.length > 40, `${chapter.id}.${locale}.experimentIntro`)
      assert.ok(content.interpretation.length > 40, `${chapter.id}.${locale}.interpretation`)
      assert.ok((content.derivation || content.learningPath).length >= 5, `${chapter.id}.${locale}.derivation`)
      assert.ok(content.sections.length >= 2, `${chapter.id}.${locale}.sections`)
      assert.ok(content.summary.length >= 3, `${chapter.id}.${locale}.summary`)
    }
  })
})

test('Part II and Part III preserve one bilingual derivation and experiment contract per chapter', () => {
  const chapters = [monteCarloChapter, approximationChapter, tdChapter, controlChapter, vfaChapter, dqnChapter, policyGradientChapter, actorCriticChapter]
  chapters.forEach((chapter) => {
    assert.deepEqual(validateFoundationChapterDefinition(chapter), [])
    assert.deepEqual(chapter.zh.derivation.map((step) => step.id), chapter.en.derivation.map((step) => step.id))
    assert.ok(chapter.zh.derivation.length >= 5, chapter.id)
    assert.ok(chapter.zh.sections.length >= 3, chapter.id)
  })
  assert.match(monteCarloChapter.zh.derivation[2].latex, /widehat q_N/)
  assert.match(approximationChapter.zh.derivation.at(-1).latex, /sum/)
  assert.match(tdChapter.zh.derivation.at(-1).latex, /G_t\^\{\(n\)\}/)
  assert.match(controlChapter.zh.derivation[2].latex, /max_a/)
  assert.match(vfaChapter.zh.derivation.at(-1).latex, /boldsymbol/)
  assert.match(dqnChapter.zh.derivation[2].latex, /bar\\theta/)
  assert.match(policyGradientChapter.zh.derivation[2].latex, /log/)
  assert.match(actorCriticChapter.zh.derivation[3].latex, /delta_t/)
})

test('the Monte Carlo chapter preserves the complete source algorithm family and its why-chain', () => {
  for (const locale of ['zh', 'en']) {
    const content = monteCarloChapter[locale]
    assert.deepEqual(content.reasoningPath.map((item) => item.id), ['planning-limit', 'sample-evidence', 'control-loop'])
    assert.deepEqual(content.algorithms.map((item) => item.id), ['basic', 'exploring', 'epsilon'])
    content.algorithms.forEach((algorithm) => {
      assert.ok(algorithm.premise.length > 8)
      assert.ok(algorithm.solves.length > 8)
      assert.ok(algorithm.limitation.length > 8)
      assert.ok(algorithm.pseudocode.length >= 8)
    })
    assert.ok(content.sections.some((item) => item.id === 'coverage'))
    assert.ok(content.sections.some((item) => item.id === 'optimality'))
    assert.ok(content.sections.some((item) => item.id === 'consistency'))
  }
  assert.deepEqual(monteCarloChapter.zh.algorithms.map((item) => item.id), monteCarloChapter.en.algorithms.map((item) => item.id))
})

test('modern chapters keep bilingual derivations and explicit model roles', () => {
  for (const chapter of [ppoChapter, tokenMdpChapter, rlhfChapter, dpoChapter, grpoChapter, codingRlChapter, agentMdpChapter, creditChapter]) {
    assert.deepEqual(validateFoundationChapterDefinition(chapter), [])
    assert.deepEqual(chapter.zh.derivation.map((step) => step.id), chapter.en.derivation.map((step) => step.id))
  }
  assert.match(ppoChapter.zh.derivation.at(-1).latex, /CLIP/)
  assert.match(tokenMdpChapter.zh.derivation[0].latex, /y_\{<t\}/)
  assert.match(rlhfChapter.zh.sections[0].formula, /pi_\{\\rm old\}/)
  assert.match(rlhfChapter.zh.derivation.at(-1).latex, /remain frozen/)
  assert.match(dpoChapter.zh.derivation.at(-1).latex, /DPO/)
  assert.match(grpoChapter.zh.derivation[2].latex, /sigma_R/)
  assert.match(codingRlChapter.zh.derivation.map((step) => step.latex).join(' '), /Exec/)
  assert.match(agentMdpChapter.zh.derivation.map((step) => step.latex).join(' '), /prod/)
  assert.match(creditChapter.zh.derivation.at(-1).latex, /hind/)
})

test('source-coverage review preserves bilingual why chains and complete algorithm blocks', () => {
  const reviewed = [mdpChapter, returnChapter, bellmanChapter, optimalityChapter, planningChapter, approximationChapter, tdChapter, controlChapter, vfaChapter, dqnChapter, policyGradientChapter, actorCriticChapter, ppoChapter, tokenMdpChapter, rlhfChapter, dpoChapter, grpoChapter, codingRlChapter, agentMdpChapter, creditChapter]
  reviewed.forEach((chapter) => {
    assert.ok(chapter.zh.deepening.length >= 2, `${chapter.id}.zh.deepening`)
    assert.deepEqual(chapter.zh.deepening.map((item) => item.id), chapter.en.deepening.map((item) => item.id), chapter.id)
    chapter.zh.deepening.forEach((item) => {
      assert.ok(item.paragraphs.join('').length > 60, `${chapter.id}.${item.id}.why`)
      if (item.pseudocode) assert.ok(item.pseudocode.length >= 6, `${chapter.id}.${item.id}.pseudocode`)
    })
  })
  assert.ok(controlChapter.zh.deepening.some((item) => item.id === 'q-learning-off-policy'))
  assert.ok(dqnChapter.zh.deepening.some((item) => item.id === 'dqn-complete'))
  assert.ok(ppoChapter.zh.deepening.some((item) => item.id === 'ppo-complete-loop'))
  assert.ok(rlhfChapter.zh.deepening.some((item) => item.id === 'batch-contract-and-failures'))
})

test('the 21-chapter source-coverage matrix maps every required source item to visible bilingual destinations', () => {
  const chapterIds = copy.zh.chapters.map((chapter) => chapter.id)
  assert.deepEqual(Object.keys(sourceCoverageMatrix), chapterIds)

  chapterIds.forEach((chapterId) => {
    const coverage = sourceCoverageMatrix[chapterId]
    assert.ok(coverage.sourceBasis.length > 0, `${chapterId} source basis`)
    assert.ok(coverage.items.length >= 5, `${chapterId} coverage breadth`)

    const zhIds = collectVisibleIds(copy.zh[chapterId])
    const enIds = collectVisibleIds(copy.en[chapterId])
    const sourceIds = new Set(copy.zh[chapterId].sources.map((source) => source.id))
    const itemIds = new Set()

    coverage.items.forEach((item) => {
      assert.ok(!itemIds.has(item.id), `${chapterId}.${item.id} must be unique`)
      itemIds.add(item.id)
      assert.ok(coverageClassifications.includes(item.classification), `${chapterId}.${item.id} classification`)
      assert.ok(coverageItemTypes.includes(item.type), `${chapterId}.${item.id} type`)
      assert.ok(item.label.length > 8, `${chapterId}.${item.id} label`)
      assert.ok(item.destinations.length > 0, `${chapterId}.${item.id} destinations`)
      item.destinations.forEach((destination) => {
        assert.ok(zhIds.has(destination), `${chapterId}.${item.id} missing zh destination ${destination}`)
        assert.ok(enIds.has(destination), `${chapterId}.${item.id} missing en destination ${destination}`)
      })
      item.sourceIds.forEach((sourceId) => {
        assert.ok(sourceIds.has(sourceId), `${chapterId}.${item.id} unknown source ${sourceId}`)
      })
    })
  })
})

test('the site terminology policy fixes preferred Chinese terms and auditable first-use definitions', () => {
  Object.entries(terminologyPolicy).forEach(([termId, term]) => {
    assert.ok(term.zh.length > 0, `${termId} preferred Chinese term`)
    assert.ok(term.en.length > 0, `${termId} preferred English term`)
    assert.ok(term.aliases.length > 0, `${termId} aliases`)

    const { chapterId, destinationId } = term.firstUse
    const zhNode = findVisibleNode(copy.zh[chapterId], destinationId)
    const enNode = findVisibleNode(copy.en[chapterId], destinationId)
    assert.ok(zhNode, `${termId} missing zh first-use destination`)
    assert.ok(enNode, `${termId} missing en first-use destination`)
    assert.match(`${visibleText(zhNode)} ${visibleText(enNode)}`, term.definitionCue, `${termId} first use must define the concept`)
  })
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
