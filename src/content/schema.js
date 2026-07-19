import { glossaryIds } from './glossary.js'

const requiredLocaleStrings = [
  'eyebrow',
  'title',
  'intro',
  'bridge',
  'figure',
  'instruction',
  'exact',
]

const requiredMicroscopeStrings = [
  'presetLabel',
  'observationLabel',
  'freeObservation',
  'currentEstimate',
  'matchedComparison',
  'baselineLabel',
  'comparisonLabel',
  'courseReproduced',
  'termByTerm',
  'presetAction',
  'contributions',
  'ifApplied',
  'pseudocodeTitle',
  'pseudocodeInstruction',
]

function sameIds(left, right) {
  return left.length === right.length && left.every((item, index) => item.id === right[index].id)
}

function validateLocale(locale, content, errors) {
  requiredLocaleStrings.forEach((field) => {
    if (typeof content[field] !== 'string' || !content[field].trim()) {
      errors.push(`${locale}.${field} must be a non-empty string`)
    }
  })

  ;['prelude', 'sections', 'presets', 'summary'].forEach((field) => {
    if (!Array.isArray(content[field]) || content[field].length === 0) {
      errors.push(`${locale}.${field} must be a non-empty array`)
    }
  })

  ;[...(content.prelude || []), ...(content.sections || [])].forEach((section) => {
    if (!section.id || !section.kicker || !section.title || !Array.isArray(section.paragraphs)) {
      errors.push(`${locale} section ${section.id || '[missing id]'} is incomplete`)
    }
  })

  ;(content.presets || []).forEach((preset) => {
    if (!preset.id || !preset.title || !preset.observation) {
      errors.push(`${locale} preset ${preset.id || '[missing id]'} is incomplete`)
    }
  })

  if (!content.microscope || !Array.isArray(content.microscope.pseudocode)) {
    errors.push(`${locale}.microscope.pseudocode must be an array`)
  } else {
    requiredMicroscopeStrings.forEach((field) => {
      if (typeof content.microscope[field] !== 'string' || !content.microscope[field].trim()) {
        errors.push(`${locale}.microscope.${field} must be a non-empty string`)
      }
    })
    content.microscope.pseudocode.forEach((line) => {
      if (!line.id || !line.number || !line.label) errors.push(`${locale} microscope pseudocode line is incomplete`)
    })
  }

  if (content.derivation) {
    if (!Array.isArray(content.derivation) || content.derivation.length < 2) {
      errors.push(`${locale}.derivation must contain at least two steps`)
    } else {
      content.derivation.forEach((step) => {
        if (!step.id || !step.rule || !step.latex || !step.short || !step.detail || !Array.isArray(step.assumptions) || !Array.isArray(step.symbols)) {
          errors.push(`${locale} derivation step ${step.id || '[missing id]'} is incomplete`)
        }
      })
    }
  }
}

export function validateChapterDefinition(chapter) {
  const errors = []
  if (!chapter.id) errors.push('chapter.id is required')
  if (!Array.isArray(chapter.prerequisiteIds)) errors.push('chapter.prerequisiteIds must be an array')
  if (!Array.isArray(chapter.termIds)) errors.push('chapter.termIds must be an array')
  if (!Array.isArray(chapter.sources) || chapter.sources.length === 0) errors.push('chapter.sources must be non-empty')
  if (!chapter.zh || !chapter.en) errors.push('chapter.zh and chapter.en are required')
  if (errors.length) return errors

  validateLocale('zh', chapter.zh, errors)
  validateLocale('en', chapter.en, errors)

  if (!sameIds(chapter.zh.prelude, chapter.en.prelude)) errors.push('prelude ids must match across locales')
  if (!sameIds(chapter.zh.sections, chapter.en.sections)) errors.push('section ids must match across locales')
  if (!sameIds(chapter.zh.presets, chapter.en.presets)) errors.push('preset ids must match across locales')
  if (!sameIds(chapter.zh.microscope?.pseudocode || [], chapter.en.microscope?.pseudocode || [])) errors.push('microscope pseudocode ids must match across locales')
  if (chapter.zh.derivation || chapter.en.derivation) {
    if (!chapter.zh.derivation || !chapter.en.derivation || !sameIds(chapter.zh.derivation, chapter.en.derivation)) errors.push('derivation ids must match across locales')
  }

  chapter.termIds.forEach((termId) => {
    if (!glossaryIds.includes(termId)) errors.push(`unknown glossary term: ${termId}`)
  })

  chapter.sources.forEach((source) => {
    if (!source.id || !source.label || !source.pages || !source.href) {
      errors.push(`source ${source.id || '[missing id]'} is incomplete`)
    }
    if (/^[A-Za-z]:\\/.test(source.href)) errors.push(`source ${source.id} exposes a local path`)
  })

  return errors
}

export function assertChapterDefinition(chapter) {
  const errors = validateChapterDefinition(chapter)
  if (errors.length) throw new Error(`Invalid chapter ${chapter.id || '[unknown]'}:\n${errors.join('\n')}`)
  return chapter
}

const foundationLocaleStrings = [
  'eyebrow',
  'title',
  'intro',
  'bridge',
  'figure',
  'instruction',
  'question',
]

export function validateFoundationChapterDefinition(chapter) {
  const errors = []
  if (!chapter?.id) errors.push('chapter.id is required')
  if (!Array.isArray(chapter?.sources) || chapter.sources.length === 0) errors.push('chapter.sources must be non-empty')
  if (!chapter?.zh || !chapter?.en) errors.push('chapter.zh and chapter.en are required')
  if (errors.length) return errors

  for (const locale of ['zh', 'en']) {
    const content = chapter[locale]
    foundationLocaleStrings.forEach((field) => {
      if (typeof content[field] !== 'string' || !content[field].trim()) {
        errors.push(`${locale}.${field} must be a non-empty string`)
      }
    })
    ;['prelude', 'sections', 'summary'].forEach((field) => {
      if (!Array.isArray(content[field]) || content[field].length === 0) {
        errors.push(`${locale}.${field} must be a non-empty array`)
      }
    })
    ;[...(content.prelude || []), ...(content.sections || [])].forEach((section) => {
      if (!section.id || !section.kicker || !section.title || !Array.isArray(section.paragraphs)) {
        errors.push(`${locale} section ${section.id || '[missing id]'} is incomplete`)
      }
    })
    if (!content.explorer || typeof content.explorer !== 'object') {
      errors.push(`${locale}.explorer must be an object`)
    }
    if (content.learningPath) {
      if (!Array.isArray(content.learningPath) || content.learningPath.length < 2) {
        errors.push(`${locale}.learningPath must contain at least two steps`)
      } else {
        content.learningPath.forEach((step) => {
          if (!step.id || !step.kicker || !step.title || !Array.isArray(step.paragraphs) || !Array.isArray(step.formulas)) {
            errors.push(`${locale} learning step ${step.id || '[missing id]'} is incomplete`)
          }
        })
      }
    }
    if (content.derivation) {
      if (!Array.isArray(content.derivation) || content.derivation.length < 2) {
        errors.push(`${locale}.derivation must contain at least two steps`)
      } else {
        content.derivation.forEach((step) => {
          if (!step.id || !step.rule || !step.latex || !step.short || !step.detail || !Array.isArray(step.assumptions) || !Array.isArray(step.symbols)) {
            errors.push(`${locale} derivation step ${step.id || '[missing id]'} is incomplete`)
          }
        })
      }
    }
  }

  if (!sameIds(chapter.zh.prelude, chapter.en.prelude)) errors.push('prelude ids must match across locales')
  if (!sameIds(chapter.zh.sections, chapter.en.sections)) errors.push('section ids must match across locales')
  if (chapter.zh.learningPath || chapter.en.learningPath) {
    if (!chapter.zh.learningPath || !chapter.en.learningPath || !sameIds(chapter.zh.learningPath, chapter.en.learningPath)) errors.push('learningPath ids must match across locales')
  }
  if (chapter.zh.derivation || chapter.en.derivation) {
    if (!chapter.zh.derivation || !chapter.en.derivation || !sameIds(chapter.zh.derivation, chapter.en.derivation)) errors.push('derivation ids must match across locales')
  }

  chapter.sources.forEach((source) => {
    if (!source.id || !source.label || !source.pages || !source.href) errors.push(`source ${source.id || '[missing id]'} is incomplete`)
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must use a public HTTPS URL`)
  })
  return errors
}

export function assertFoundationChapterDefinition(chapter) {
  const errors = validateFoundationChapterDefinition(chapter)
  if (errors.length) throw new Error(`Invalid foundation chapter ${chapter.id || '[unknown]'}:\n${errors.join('\n')}`)
  return chapter
}
