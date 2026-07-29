import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..')
const read = (path) => readFileSync(join(src, path), 'utf8')

test('the learning experience stays stateless and performs no remote compute calls', () => {
  const source = [
    read('App.jsx'),
    read('components/BellmanLab.jsx'),
    read('components/CourseWorldExplorer.jsx'),
    read('components/ReturnObservatory.jsx'),
    read('components/OptimalitySwitch.jsx'),
    read('components/PlanningLab.jsx'),
    read('components/PlanningWalkthrough.jsx'),
    read('components/MonteCarloLab.jsx'),
    read('components/PpoLab.jsx'),
    read('components/SystemLab.jsx'),
    read('components/TokenMdpLab.jsx'),
    read('components/ModernExtensionLab.jsx'),
    read('interaction/stepMicroscope.js'),
  ].join('\n')
  ;['localStorage', 'sessionStorage', 'document.cookie', 'fetch(', 'XMLHttpRequest', 'WebSocket'].forEach((forbidden) => {
    assert.equal(source.includes(forbidden), false, `found forbidden persistent/network API: ${forbidden}`)
  })
})

test('the header exposes only the public GitHub repository metadata request', () => {
  const badge = read('components/GitHubRepoBadge.jsx')
  assert.match(badge, /https:\/\/github\.com\/skyliulu\/RL-Foundations-Lab/)
  assert.match(badge, /https:\/\/api\.github\.com\/repos\/skyliulu\/RL-Foundations-Lab/)
  assert.match(badge, /stargazers_count/)
  assert.match(badge, /fetch\(REPOSITORY_API_URL/)
  ;['localStorage', 'sessionStorage', 'document.cookie', 'XMLHttpRequest', 'WebSocket'].forEach((forbidden) => {
    assert.equal(badge.includes(forbidden), false, `found forbidden persistent/network API: ${forbidden}`)
  })
})

test('Chinese and English expose the same complete Part I–III chapter nodes plus modern chapters', async () => {
  const { copy } = await import('../content.js')
  assert.deepEqual(copy.zh.chapters.map((item) => item.id), ['mdp', 'returns', 'bellman', 'optimality', 'planning', 'montecarlo', 'approximation', 'td', 'control', 'vfa', 'dqn', 'policygradient', 'actorcritic', 'ppo', 'tokenmdp', 'rlhf', 'dpo', 'grpo', 'codingrl', 'agentmdp', 'credit'])
  assert.deepEqual(copy.en.chapters.map((item) => item.id), copy.zh.chapters.map((item) => item.id))
  assert.ok(copy.zh.bellman.intro.length > 50)
  assert.ok(copy.en.bellman.intro.length > 50)
})

test('reader-facing titles stay declarative while experiment prompts may remain questions', async () => {
  const { copy } = await import('../content.js')
  const violations = []
  const visit = (value, path = []) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, index]))
      return
    }
    if (!value || typeof value !== 'object') return
    Object.entries(value).forEach(([key, item]) => {
      const nextPath = [...path, key]
      if (key === 'title' && typeof item === 'string') {
        const isQuestionHeading = /[?？]/.test(item) || /^(为什么|为何|怎样|如何|怎么|why\b|how\b|what\b|when\b|where\b)/i.test(item)
        if (isQuestionHeading) violations.push(`${nextPath.join('.')} = ${item}`)
      }
      visit(item, nextPath)
    })
  }

  visit(copy)
  assert.deepEqual(violations, [])
})

test('all chapter-specific capability slices are wired into the reading shell', () => {
  const app = read('App.jsx')
  ;['ChapterShell', 'CourseWorldExplorer', 'ReturnObservatory', 'BellmanLab', 'OptimalitySwitch', 'PlanningLab', 'PpoLab', 'TokenMdpLab', 'SystemLab', 'ModernExtensionLab', 'RightRail'].forEach((name) => {
    assert.match(app, new RegExp(name))
  })
})

test('Optimality is the second real consumer of the shared Step Microscope contract', () => {
  const source = read('components/OptimalitySwitch.jsx')
  assert.match(source, /useStepMicroscope/)
  assert.match(source, /microscope\.commit/)
  assert.match(source, /microscope\.undo/)
  assert.match(source, /microscope\.reset/)
})

test('the chapter shell keeps prose on one reading column and experiments on one wider frame', () => {
  const shell = read('components/ChapterShell.jsx')
  const app = read('App.jsx')
  const styles = read('styles.css')
  assert.match(shell, /className="chapter-shell"/)
  assert.match(app, /<ChapterShell>/)
  assert.match(styles, /--chapter-frame:\s*1240px/)
  assert.match(styles, /--reading-column:\s*920px/)
  assert.match(styles, /\.chapter-shell\s*\{[^}]*max-width:\s*var\(--chapter-frame\)/)
  ;['chapter-header', 'chapter-continuity', 'mdp-narrative', 'clickable-derivation', 'chapter-article-sections', 'chapter-summary', 'chapter-sources'].forEach((className) => {
    assert.match(styles, new RegExp(`\\.${className}\\s*\\{[^}]*max-width:\\s*var\\(--reading-column\\)`), className)
  })
  assert.match(styles, /\.chapter-header h1\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/)
  assert.match(styles, /\.chapter-intro\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/)
  assert.match(styles, /\.world-explorer\s*\{[^}]*max-width:\s*var\(--chapter-frame\)/)
})

test('the course entry uses the same outer width as the learning content below it', () => {
  const styles = read('styles.css')
  assert.match(styles, /\.course-home\s*\{[^}]*width:\s*min\(1180px,\s*100%\)/)
  assert.match(styles, /\.home-hero\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/)
  assert.match(styles, /\.home-hero h1\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/)
  assert.match(styles, /\.home-hero > p\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/)
})

test('desktop reading width and long equations avoid unnecessary inner scrollbars', () => {
  const styles = read('styles.css')
  const returns = read('components/ReturnObservatory.jsx')
  const monteCarlo = read('components/MonteCarloLab.jsx')
  assert.match(styles, /\.clickable-derivation > header\s*\{[^}]*max-width:\s*none/)
  assert.match(styles, /\.learning-lab-stage\s*\{[^}]*minmax\(410px,\.82fr\)/)
  assert.match(styles, /\.mc-playback-stage\s*\{[^}]*minmax\(240px,\.95fr\)/)
  assert.doesNotMatch(styles, /\.return-formula-live\s*\{[^}]*white-space:\s*nowrap/)
  assert.match(styles, /\.math-formula > \.katex-display\s*\{[^}]*overflow:\s*visible/)
  assert.match(styles, /div\.math-formula\s*\{[^}]*overflow-x:\s*auto/)
  assert.match(returns, /visibleReturnTerms\.length \/ 4/)
  assert.match(returns, /\\begin\{aligned\}G_0&=/)
  assert.match(monteCarlo, /Q\(S_t,A_t\)\\leftarrow Q\(S_t,A_t\)/)
})

test('the Monte Carlo lab auto-plays rollout, return propagation, Q writes, and policy handoff', () => {
  const monteCarlo = read('components/MonteCarloLab.jsx')
  const styles = read('styles.css')

  assert.match(monteCarlo, /const \[returnRevealCount, setReturnRevealCount\] = useState\(0\)/)
  assert.match(monteCarlo, /const \[updateRevealCount, setUpdateRevealCount\] = useState\(0\)/)
  assert.match(monteCarlo, /const \[isPlaying, setIsPlaying\] = useState\(false\)/)
  assert.match(monteCarlo, /window\.setTimeout/)
  assert.match(monteCarlo, /sample\.updates\.slice\(0, updateRevealCount\)/)
  assert.match(monteCarlo, /className="mc-play-button"/)
  assert.match(monteCarlo, /phase === 'next'[\s\S]*setIsPlaying\(false\)/)
  assert.match(styles, /\.mc-opening-argument\s*\{\s*margin-bottom:\s*var\(--flow-section-gap\)/)
  assert.match(styles, /\.mc-playback-progress > i\s*\{[^}]*transition:\s*width/)
  assert.match(styles, /\.mc-lab\.is-playing \.mc-path-overlay > circle\.is-current\s*\{[^}]*animation:/)
})

test('the Monte Carlo lab makes algorithm protocols and visit weighting visibly distinct', () => {
  const monteCarlo = read('components/MonteCarloLab.jsx')
  const engine = read('engine/learning-labs.js')
  const styles = read('styles.css')

  assert.match(monteCarlo, /function ProtocolTrack\(/)
  assert.match(monteCarlo, /function VisitProtocolComparison\(/)
  assert.match(monteCarlo, /固定同一条回合，不重新采样/)
  assert.match(monteCarlo, /sample\.steps\.filter\(\(step\) => step\.visitOccurrence === 1\)/)
  assert.match(monteCarlo, /step\.repeatedVisit && !step\.used/)
  assert.match(engine, /actionSource = explored \? 'epsilon-explore' : 'greedy'/)
  assert.match(engine, /step\.visitOccurrence = occurrence/)
  assert.match(styles, /\.mc-protocol-gates\s*\{[^}]*grid-template-columns:\s*repeat\(3/)
  assert.match(styles, /\.mc-visit-token-row\s*\{[^}]*overflow-x:\s*auto/)
  assert.match(styles, /\.mc-tape-scroll\s*\{[^}]*overflow-x:\s*auto/)
  assert.match(styles, /\.mc-tape-body\s*\{[^}]*min-width:\s*425px[^}]*overflow-x:\s*hidden/)
  assert.match(styles, /\.mc-tape-body > div\.rejected-repeat/)
})

test('all chapter explanations use continuous article sections rather than a card grid', () => {
  const app = read('App.jsx')
  const derivation = read('components/ClickableDerivation.jsx')
  const styles = read('styles.css')
  assert.match(app, /chapter-article-sections/)
  assert.match(app, /<ChapterPrelude content=/)
  assert.match(app, /<ChapterSections content=\{content\} lang=\{lang\} placement="before"/)
  assert.match(app, /function ProseTurn/)
  assert.match(app, /chapter-prose-opening/)
  assert.doesNotMatch(app, /<h3><MathText>\{section\.title\}<\/MathText><\/h3>/)
  assert.match(styles, /\.chapter-prose-turn \+ \.chapter-prose-turn/)
  assert.match(derivation, /derivation-line-short/)
  assert.match(derivation, /derivation-line-detail/)
  assert.doesNotMatch(app, /chapter-section-grid|chapter-section-card/)
  assert.doesNotMatch(styles, /\.chapter-section-grid|\.chapter-section-card/)
})

test('chapter seven pilots the ordered article-flow contract and a dedicated evidence lab', async () => {
  const { copy } = await import('../content.js')
  const app = read('App.jsx')
  const flow = read('components/ArticleFlow.jsx')
  const lab = read('components/StochasticApproximationLab.jsx')
  const zhIds = copy.zh.approximation.articleFlow.map((block) => block.id)
  const enIds = copy.en.approximation.articleFlow.map((block) => block.id)
  const majorIds = copy.zh.approximation.articleFlow
    .filter((block) => block.type === 'section' || (block.type === 'derivation' && block.level !== 'embedded'))
    .map((block) => block.id)
  const rootDerivation = copy.zh.approximation.articleFlow.find((block) => block.id === 'root-abstraction')
  const opening = copy.zh.approximation.articleFlow.find((block) => block.id === 'incremental-problem')
  assert.deepEqual(enIds, zhIds)
  assert.equal(zhIds[0], 'incremental-problem')
  assert.equal(zhIds.at(-1), 'earned-synthesis')
  assert.ok(zhIds.indexOf('sa-lab') < zhIds.indexOf('earned-synthesis'))
  assert.deepEqual(majorIds, ['incremental-problem', 'root-abstraction', 'sgd-as-rm'])
  assert.deepEqual(rootDerivation.steps.map((step) => step.id), ['mean-root', 'mean-noisy-residual', 'root-target', 'noisy-residual', 'rm-update'])
  ;['mean-check', 'step-size-memory', 'rm-loop', 'rm-conditions', 'mean-as-sgd', 'gradient-generalization', 'batch-motivation', 'sgd-loop', 'gradient-family', 'convergence-pattern', 'sa-lab'].forEach((id) => assert.ok(zhIds.includes(id), `chapter 7 source coverage: ${id}`))
  assert.ok(zhIds.indexOf('mean-as-sgd') < zhIds.indexOf('sgd-as-rm'))
  assert.ok(zhIds.indexOf('gradient-generalization') < zhIds.indexOf('sgd-as-rm'))
  assert.ok(zhIds.indexOf('batch-motivation') < zhIds.indexOf('gradient-family'))
  assert.ok(zhIds.indexOf('gradient-family') < zhIds.indexOf('sgd-loop'))
  assert.equal(rootDerivation.title, '用样本残差代替无法计算的期望残差')
  assert.equal(opening.title, '新样本到达后，只需修正当前估计')
  assert.equal(copy.zh.approximation.summaryTitle, '从样本均值到随机逼近与随机梯度')
  assert.equal(copy.en.approximation.summaryTitle, 'From sample means to stochastic approximation and stochastic gradients')
  assert.equal(copy.zh.approximation.articleFlow.filter((block) => block.type === 'example' || block.type === 'comparison').length, 0)
  assert.equal(copy.en.approximation.articleFlow.filter((block) => block.type === 'example' || block.type === 'comparison').length, 0)
  assert.match(app, /active === 'approximation'[\s\S]*?<ArticleFlow/)
  assert.match(app, /<ChapterContinuity[^>]*compact[^>]*prerequisite=/)
  assert.match(app, /showPrerequisite=\{false\}/)
  assert.match(app, /chapter-context-prerequisite/)
  assert.match(app, /!compact && <p>/)
  assert.match(flow, /block\.type === 'prose'/)
  assert.match(flow, /block\.type === 'derivation'/)
  assert.match(flow, /block\.type === 'experiment'/)
  assert.match(flow, /block\.id}-column-\$\{columnIndex\}/)
  assert.match(lab, /runStochasticApproximationComparison/)
  assert.match(lab, /budgetMode/)
  assert.match(lab, /ensemble/)
  assert.match(lab, /Auto play/)
  assert.match(lab, /State handoff/)
  assert.match(lab, /Noise-free root/)
  assert.match(lab, /compressHistory/)
  assert.doesNotMatch(lab, /weights\.slice\(Math\.max/)
  assert.match(lab, /sa-ledger/)
  assert.match(lab, /sa-weight-strip/)
})

test('all chapters adopt the chapter-seven opening and heading hierarchy', async () => {
  const { copy } = await import('../content.js')
  const app = read('App.jsx')
  const deepening = read('components/ChapterDeepening.jsx')
  const monteCarlo = read('components/MonteCarloChapter.jsx')

  copy.zh.chapters.forEach((chapter) => {
    const content = copy.zh[chapter.id]
    assert.match(content.eyebrow, new RegExp(`^第 ${Number(chapter.number)} 章`), `${chapter.id} Chinese eyebrow`)
    assert.doesNotMatch(content.title, /[？?]$/, `${chapter.id} Chinese title must be declarative`)
  })
  copy.en.chapters.forEach((chapter) => {
    const content = copy.en[chapter.id]
    assert.match(content.eyebrow, new RegExp(`^Chapter ${Number(chapter.number)}`), `${chapter.id} English eyebrow`)
    assert.doesNotMatch(content.title, /[?]$/, `${chapter.id} English title must be declarative`)
  })

  ;['td', 'control', 'vfa', 'dqn', 'policygradient', 'actorcritic', 'dpo', 'grpo', 'codingrl', 'agentmdp', 'credit'].forEach((id) => {
    assert.ok(copy.zh[id].derivationEyebrow && copy.zh[id].derivationTitle, `${id} Chinese concrete derivation heading`)
    assert.ok(copy.en[id].derivationEyebrow && copy.en[id].derivationTitle, `${id} English concrete derivation heading`)
  })
  assert.match(app, /<ChapterContinuity[^>]*compact[^>]*prerequisite=/)
  assert.match(app, /showPrerequisite=\{false\}/)
  assert.match(deepening, /<h3><MathText>\{section\.title\}/)
  assert.doesNotMatch(deepening, /为什么继续|Why continue/)
  assert.doesNotMatch(monteCarlo, /因果推进的主线|Causal narrative|完整推导：|Complete derivation:/)
})

test('selecting the same derivation line toggles the contextual workbench', () => {
  const app = read('App.jsx')
  const derivation = read('components/ClickableDerivation.jsx')
  assert.match(derivation, /selectionId: `\$\{step\.id\}:\$\{step\.latex\}`/)
  assert.match(app, /rightOpen && rightContext\?\.selectionId === context\.selectionId/)
  assert.match(app, /if \(isSameSelection\) \{\s*setRightOpen\(false\)/)
  assert.doesNotMatch(app, /onSelect=\{\(context\) => \{ setRightContext\(context\); setRightOpen\(true\) \}\}/)
})

test('the five-part storyline gives every chapter an explicit bilingual causal handoff', async () => {
  const { copy } = await import('../content.js')
  const { chapterTransitions, coursePhases, phaseIds } = await import('../content/storyline.js')
  const chapterIds = copy.zh.chapters.map((item) => item.id)
  assert.deepEqual(phaseIds.flat(), chapterIds)
  assert.equal(coursePhases.zh.length, 5)
  assert.equal(coursePhases.en.length, 5)
  for (const locale of ['zh', 'en']) {
    assert.deepEqual(Object.keys(chapterTransitions[locale]), chapterIds)
    chapterIds.forEach((id) => assert.ok(chapterTransitions[locale][id].length > 40, `${locale}.${id}`))
  }
})

test('ordinary MDP sections use article headings instead of numbered timeline cards', () => {
  const source = read('components/MdpNarrative.jsx')
  assert.match(source, /narrative-section/)
  assert.match(source, /narrative-heading/)
  assert.match(source, /narrative-turn-opening/)
  assert.doesNotMatch(source, /<h3>/)
  assert.doesNotMatch(source, /narrative-index|padStart\(/)
})

test('micro-sections are merged into running prose instead of merely demoting their headings', () => {
  const app = read('App.jsx')
  const mdp = read('components/MdpNarrative.jsx')
  const monteCarlo = read('components/MonteCarloChapter.jsx')
  const articleFlow = read('components/ArticleFlow.jsx')
  const articleFlowBuilder = read('content/article-flow.js')
  const skill = read('../.agents/skills/develop-interactive-rl-chapter/SKILL.md')

  assert.match(app, /const \[opening, \.\.\.continuation\] = content\.prelude/)
  assert.match(app, /continuation\.map\(\(step\) => <ProseTurn/)
  assert.match(app, /sections\.map\(\(section\) => <ProseTurn/)
  assert.doesNotMatch(app, /chapter-prose-lead|chapter-prose-separator/)
  assert.match(mdp, /isMajor \?/)
  assert.doesNotMatch(mdp, /chapter-prose-lead|chapter-prose-separator/)
  assert.doesNotMatch(monteCarlo, /mc-reasoning-index/)
  assert.match(monteCarlo, /content\.prelude/)
  assert.match(monteCarlo, /mc-reasoning-copy/)
  assert.doesNotMatch(monteCarlo, /chapter-prose-lead|chapter-prose-separator/)
  assert.doesNotMatch(articleFlow, /chapter-prose-lead|chapter-prose-separator/)
  assert.match(app, /item\.paragraphs\.join\(lang === 'zh' \? '' : ' '\)/)
  assert.match(mdp, /section\.paragraphs\.join\(lang === 'zh' \? '' : ' '\)/)
  assert.match(monteCarlo, /section\.paragraphs\.map\(\(paragraph\)/)
  assert.match(articleFlowBuilder, /descriptor\.mergeParagraphs \?\? descriptor\.type === 'turn'/)
  assert.match(skill, /Demoting a heading from `h2` to `h3`/)
  assert.match(skill, /must not normally open a new visible heading/)
  assert.match(skill, /Reject a refactor that changes only heading tags or CSS/)
})

test('main-path chapter blocks contain developed bilingual explanations', async () => {
  const { copy } = await import('../content.js')

  for (const lang of ['zh', 'en']) {
    for (const chapter of copy[lang].chapters) {
      if (chapter.id === 'approximation') continue
      const content = copy[lang][chapter.id]
      const blocks = [...(content.prelude || []), ...(content.sections || [])]
      for (const block of blocks) {
        assert.ok(
          block.paragraphs?.length >= 2,
          `${lang}:${chapter.id}:${block.id} must develop its claim across at least two connected paragraphs`,
        )
      }
    }
  }
})

test('chapter eight explains TD timing in natural Chinese and keeps prose visually continuous', async () => {
  const { copy } = await import('../content.js')
  const styles = read('styles.css')
  const skill = read('../.agents/skills/develop-interactive-rl-chapter/SKILL.md')
  const zh = copy.zh.td

  assert.match(zh.intro, /每一步.*即时奖励和后继状态/)
  assert.match(zh.prelude[0].paragraphs.join(''), /完整回报.*不可用.*Bellman/)
  assert.match(zh.prelude[1].paragraphs.join(''), /自举（bootstrapping）/)
  assert.match(zh.sections[0].paragraphs.join(''), /TD\(0\).*Monte Carlo/)
  assert.match(zh.deepening[2].title, /target 使用哪些信息、何时能够计算/)
  assert.match(zh.deepening[2].paragraphs.join(''), /回合制任务.*持续型任务/)
  assert.doesNotMatch(zh.deepening[2].title, /同一轨迹、同一预算下分解/)

  const proseSequenceRule = styles.match(/\.chapter-prose-sequence\s*\{([^}]*)\}/)?.[1] || ''
  const transitionRule = styles.match(/\.chapter-transition\s*\{([^}]*)\}/)?.[1] || ''
  const deepeningRule = styles.match(/\.deepening-section\s*\{([^}]*)\}/)?.[1] || ''
  assert.doesNotMatch(proseSequenceRule, /border/)
  assert.doesNotMatch(transitionRule, /border/)
  assert.doesNotMatch(deepeningRule, /border/)
  assert.match(skill, /Do not use horizontal rules to manufacture structure/)
  assert.match(skill, /Require every main-path prose block/)
  assert.match(skill, /name the actual comparison axes/)
  assert.match(skill, /Audit visible borders and separators on article-level prose/)
})

test('main chapter prose uses a dedicated high-contrast body-copy token', () => {
  const styles = read('styles.css')
  const skill = read('../.agents/skills/develop-interactive-rl-chapter/SKILL.md')
  const paper = styles.match(/--paper:\s*(#[0-9a-f]{6})/i)?.[1]
  const bodyCopy = styles.match(/--body-copy:\s*(#[0-9a-f]{6})/i)?.[1]
  const toRgb = (hex) => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16))
  const luminance = (hex) => {
    const [red, green, blue] = toRgb(hex).map((channel) => {
      const value = channel / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }
  const contrast = (foreground, background) => {
    const first = luminance(foreground)
    const second = luminance(background)
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
  }
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const bodySelectors = [
    '.article-copy',
    '.narrative-body p',
    '.chapter-article-section p',
    '.chapter-prose-turn p',
    '.deepening-section > p',
    '.article-flow-block > p',
    '.article-flow-prose > p, .article-flow-evidence > p',
    '.article-flow-table-scroll td',
  ]

  assert.ok(paper)
  assert.ok(bodyCopy)
  assert.ok(contrast(bodyCopy, paper) >= 6, `body copy contrast must be at least 6:1, received ${contrast(bodyCopy, paper).toFixed(2)}:1`)
  bodySelectors.forEach((selector) => {
    const rule = styles.match(new RegExp(`(?:^|\\n)${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`))?.[1] || ''
    assert.match(rule, /color:\s*var\(--body-copy\)/, `${selector} must use the shared body-copy token`)
  })
  assert.match(skill, /Reserve the muted token for navigation, captions, provenance, labels/)
  assert.match(skill, /Reject body copy below 6:1/)
})

test('continuous chapter prose has one spacing owner and stable inline leads', async () => {
  const { copy } = await import('../content.js')
  const styles = read('styles.css')
  const skill = read('../.agents/skills/develop-interactive-rl-chapter/SKILL.md')
  const app = read('App.jsx')

  for (const token of ['paragraph', 'prose-turn', 'section', 'major']) {
    assert.match(styles, new RegExp(`--flow-${token}-gap:\\s*\\d+px`), `missing --flow-${token}-gap`)
  }

  const deepeningRule = styles.match(/\.chapter-deepening\s*\{([^}]*)\}/)?.[1] || ''
  const finalDeepeningRule = styles.match(/\.deepening-section:last-child\s*\{([^}]*)\}/)?.[1] || ''
  const proseSequenceRule = styles.match(/\.chapter-prose-sequence\s*\{([^}]*)\}/)?.[1] || ''
  const proseWrapRule = styles.match(/\.mc-opening-argument > article > p,[\s\S]*?\.mc-reasoning-copy > p\s*\{([^}]*)\}/)?.[1] || ''
  const articleBlockRule = styles.match(/\.article-flow-block\s*\{([^}]*)\}/)?.[1] || ''
  const articleDerivationRule = styles.match(/\.article-flow > \.clickable-derivation\s*\{([^}]*)\}/)?.[1] || ''

  assert.doesNotMatch(deepeningRule, /margin:[^;]*46px/)
  assert.match(finalDeepeningRule, /padding-bottom:\s*0/)
  assert.match(proseSequenceRule, /var\(--flow-section-gap\)/)
  assert.match(proseWrapRule, /overflow-wrap:\s*normal/)
  assert.match(proseWrapRule, /word-break:\s*normal/)
  assert.match(styles, /--flow-body-line-height:\s*1\.82/)
  assert.match(styles, /html:lang\(zh\) main\s*\{\s*word-break:\s*auto-phrase;\s*\}/)
  assert.match(styles, /html:lang\(zh\) \.chapter-header h1,[\s\S]*?html:lang\(zh\) \.chapter-header h1 > \.math-text,[\s\S]*?html:lang\(zh\) \.article-flow-heading h2 \.math-text\s*\{\s*word-break:\s*auto-phrase;\s*\}/)
  assert.match(articleBlockRule, /padding:[^;]*0/)
  assert.match(articleDerivationRule, /margin-bottom:\s*0/)
  assert.doesNotMatch(app, /<br\s*\/?>/)

  assert.equal(copy.zh.dpo.sections[0].title, '同一提示词下的偏好对')
  assert.equal(copy.en.dpo.sections[0].title, 'A preference pair shares one prompt')
  assert.match(skill, /Assign every boundary exactly one spacing owner/)
  assert.match(skill, /An inline prose lead must be a concise, grammatically complete opening phrase/)
  assert.match(skill, /inspect line boxes for every inline prose lead/)
})

test('chapter skill rejects mechanically valid but semantically fragmented prose and formulas', () => {
  const skill = read('../.agents/skills/develop-interactive-rl-chapter/SKILL.md')

  assert.match(skill, /Separate mechanical layout QA from semantic editorial QA/)
  assert.match(skill, /Treat every paragraph boundary as a claim about reasoning structure/)
  assert.match(skill, /Do not let content-array shape decide prose segmentation/)
  assert.match(skill, /Give every display formula an introduction-use contract/)
  assert.match(skill, /Immediately before it, state why the quantity or relation is needed/)
  assert.match(skill, /Immediately after it, interpret the result or use it/)
  assert.match(skill, /Do not append a `formula` or `formulas` array after prose merely because the schema supports it/)
  assert.match(skill, /Do not reveal a derived result in a prelude and then derive the same result again/)
  assert.match(skill, /Build a formula-role ledger for every display equation/)
  assert.match(skill, /Write reader-facing Chinese headings as complete, natural declarative statements/)
  assert.match(skill, /Read each one separately and then read them together/)
  assert.match(skill, /Read every adjacent paragraph pair as plain text without component boundaries/)
  assert.match(skill, /what the reader can already compute or explain/)
  assert.match(skill, /A retrospective sentence such as “the previous chapter introduced X” is context, not motivation/)
  assert.match(skill, /Make the opening problem observable in the running example/)
})

test('chapter one introduces the shared course world before formal definitions', () => {
  const narrative = read('components/MdpNarrative.jsx')
  const overview = read('components/CourseWorldOverview.jsx')
  const styles = read('styles.css')
  assert.match(narrative, /CourseWorldOverview/)
  assert.match(narrative, /section\.id === 'problem-setting'/)
  assert.match(overview, /from '\.\.\/engine\/gridworld'/)
  ;['allStates', 'isForbidden', 'isGoal', 'START'].forEach((contract) => {
    assert.match(overview, new RegExp(contract))
  })
  assert.match(styles, /\.course-world-overview\s*\{/)
  assert.match(styles, /\.overview-world-grid\s*\{/)
})

test('ordinary chapter-one formulas remain article-native instead of quote callouts', () => {
  const narrative = read('components/MdpNarrative.jsx')
  const styles = read('styles.css')
  assert.match(narrative, /<MathFormula block latex=\{formula\}/)
  assert.match(narrative, /layout === 'stacked'/)
  const rule = styles.match(/\.narrative-formulas\s*\{([^}]*)\}/)?.[1] || ''
  assert.match(rule, /padding:\s*7px 0/)
  assert.doesNotMatch(rule, /border-left|background/)
  assert.match(styles, /\.narrative-formulas\.is-stacked\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\)/)
})

test('right-workbench notation is rendered through MathFormula', () => {
  const app = read('App.jsx')
  assert.match(app, /latex=\{String\.raw`p\(s',r\\mid H_t,a\)=p\(s',r\\mid S_t,a\)`\}/)
  assert.match(app, /latex=\{String\.raw`G_t`\}/)
  assert.match(app, /latex=\{String\.raw`V\^\{\\pi\}\(s\)`\}/)
  assert.doesNotMatch(app, />p\(s′\|s,a,history\) = p\(s′\|s,a\)</)
  assert.doesNotMatch(app, /Gₜ|Vπ\(s\)/)
})

test('long primary equations stay single-line when space is available and split only on narrow screens', () => {
  const responsive = read('components/ResponsiveMathFormula.jsx')
  const derivation = read('components/ClickableDerivation.jsx')
  const article = read('components/ArticleFlow.jsx')
  const optimality = read('components/OptimalitySwitch.jsx')
  const styles = read('styles.css')

  assert.match(responsive, /responsive-math-wide/)
  assert.match(responsive, /responsive-math-narrow/)
  assert.match(derivation, /narrowLatex=\{step\.narrowLatex\}/)
  assert.match(article, /narrowLatex=\{formula\.narrowLatex\}/)
  assert.match(optimality, /<ResponsiveMathFormula/)
  assert.match(styles, /\.responsive-math-formula > \.responsive-math-narrow\s*\{[^}]*display:\s*none/)
  assert.match(styles, /@media \(max-width:\s*620px\)[\s\S]*?\.responsive-math-formula > \.responsive-math-wide\s*\{[^}]*display:\s*none/)
})

test('algorithms, tables, experiments, and the right workbench share a readable type floor', () => {
  const styles = read('styles.css')
  assert.match(styles, /--font-floor:\s*\.8125rem/)
  assert.match(styles, /--font-dense:\s*\.8125rem/)
  assert.match(styles, /--font-support:\s*\.875rem/)
  assert.match(styles, /--font-ui:\s*\.8125rem/)
  assert.match(styles, /--font-table:\s*\.875rem/)
  assert.match(styles, /small\s*\{\s*font-size:\s*inherit/)
  assert.match(styles, /\.deepening-pseudocode code\s*\{[^}]*var\(--font-code\)/)
  assert.match(styles, /\.deepening-example-table > span\s*\{[^}]*var\(--font-table\)/)
  assert.match(styles, /\.deepening-handoff > \.deepening-handoff-copy\s*\{[^}]*var\(--font-support\)/)
  assert.doesNotMatch(styles, /\.deepening-handoff span\s*\{/)
  assert.match(styles, /Readability floor for algorithms, evidence tables, and interactive workbenches/)

  const undersized = [...styles.matchAll(/\b(?:font-size|font)\s*:\s*([^;{}]+)/g)]
    .flatMap((declaration) => [...declaration[1].matchAll(/(?<![\w-])(\d*\.?\d+)(rem|px)\b/g)])
    .map((match) => ({ token: match[0], pixels: Number(match[1]) * (match[2] === 'rem' ? 16 : 1) }))
    .filter(({ pixels }) => pixels < 12)
  assert.deepEqual(undersized, [], 'reader-facing font declarations must not fall below 12 px')
})

test('article prose, algorithms, and worked tables share the inline-math renderer', () => {
  const app = read('App.jsx')
  const deepening = read('components/ChapterDeepening.jsx')
  const monteCarlo = read('components/MonteCarloChapter.jsx')
  assert.match(app, /import MathText/)
  assert.match(deepening, /<code><MathText>\{line\}<\/MathText><\/code>/)
  assert.match(deepening, /<span key=\{`\$\{rowIndex\}-\$\{cellIndex\}`\}><RichContent value=\{cell\} \/><\/span>/)
  assert.match(monteCarlo, /<code><MathText>\{line\}<\/MathText><\/code>/)
})

test('interactive structural selectors cannot restyle nested MathText or KaTeX spans', () => {
  const styles = read('styles.css')
  assert.match(styles, /\.pseudocode-lines button > span\s*\{/)
  assert.doesNotMatch(styles, /\.pseudocode-lines span\s*\{/)
  assert.match(styles, /\.mc-lab-heading > div > span\s*\{/)
  assert.match(styles, /\.mc-variant-switch button > span\s*\{/)
  assert.match(styles, /\.learning-lab-question > span\s*\{/)
  assert.match(styles, /\.modern-extension-lab > header > span\s*\{/)
  assert.match(styles, /\.response-group button > b, \.response-group button > span, \.response-group button > small/)
  assert.match(styles, /\.mdp-interface-strip > div > span\s*\{/)
  assert.match(styles, /\.return-step-table > div > span\s*\{/)
  assert.match(styles, /\.operator-formula > span\s*\{/)
  assert.match(styles, /\.optimality-step-actions > span\s*\{/)
  assert.match(styles, /\.mc-update-list > div > span/)
  assert.doesNotMatch(styles, /\.mdp-interface-strip span\s*\{/)
  assert.doesNotMatch(styles, /\.return-step-table span\s*\{/)
  assert.doesNotMatch(styles, /\.operator-formula span\s*\{/)
  assert.doesNotMatch(styles, /\.optimality-step-actions span\s*\{/)
  assert.doesNotMatch(styles, /\.mc-update-list span\s*[,\{]/)
  assert.match(styles, /\.ac-node > \.ac-node-copy/)
  assert.match(styles, /\.ac-arrow > \.ac-arrow-label/)
  assert.doesNotMatch(styles, /\.ac-node span\s*[,\{]/)
  assert.doesNotMatch(styles, /\.ac-arrow span\s*\{/)
})

test('token diagrams use isolated layout classes and responsive overflow ownership', () => {
  const system = read('components/SystemLab.jsx')
  const tokenMdp = read('components/TokenMdpLab.jsx')
  const styles = read('styles.css')
  assert.match(system, /className="policy-token-strip"/)
  assert.match(tokenMdp, /className="token-trajectory-ledger"/)
  assert.doesNotMatch(system, /className="token-trajectory"/)
  assert.doesNotMatch(tokenMdp, /className="token-trajectory"/)
  assert.match(styles, /\.token-trajectory-ledger\s*\{[^}]*overflow-x:\s*auto/)
  assert.match(styles, /\.update-flow \.loop-arrow\s*\{[^}]*flex-basis:\s*100%/)
  assert.match(styles, /input\[type="range"\]\s*\{[^}]*margin:\s*6px 0 0/)
})

test('every chapter ends with one source section and no duplicate concept-source footer', () => {
  const app = read('App.jsx')
  const styles = read('styles.css')
  assert.match(app, /function ChapterSources/)
  assert.doesNotMatch(app, /source-note|概念依据|Concept sources/)
  assert.doesNotMatch(styles, /\.source-note/)
})

test('the homepage explains the learning path and gives readers an actionable chapter rhythm', () => {
  const app = read('App.jsx')
  const source = read('components/HomePage.jsx')
  assert.match(app, /从网格世界到大语言模型后训练/)
  assert.match(app, /From grid worlds to LLM post-training/)
  assert.doesNotMatch(app, /五部分 · 二十一章|Five parts · twenty-one chapters/)
  assert.match(source, /home-reading-guide/)
  assert.match(source, /reading-guide-steps/)
  assert.match(source, /用正文建立逻辑，用实验检验理解/)
  assert.match(source, /明确问题/)
  assert.match(source, /建立论证/)
  assert.match(source, /检验机制/)
  assert.match(source, /理解边界/)
  assert.match(source, /reading-guide-cycle/)
  assert.match(source, /章节如何衔接/)
  assert.doesNotMatch(source, /每章都按同一种学习节奏推进/)
  assert.doesNotMatch(source, /home-principles|Why 先于 How/)
})

test('the homepage progression line passes through every desktop step marker', () => {
  const styles = read('styles.css')
  assert.match(styles, /\.reading-guide-steps::before\s*\{[^}]*linear-gradient/)
  assert.match(styles, /\.reading-step-number\s*\{[^}]*margin-inline:\s*auto/)
  assert.match(styles, /\.reading-guide-steps li:last-child \.reading-step-number\s*\{[^}]*background:\s*var\(--teal\)/)
})

test('language defaults are regional and update document metadata without persistence', () => {
  const app = read('App.jsx')
  const language = read('i18n.js')
  assert.match(app, /useState\(detectBrowserLanguage\)/)
  assert.match(app, /document\.documentElement\.lang/)
  assert.match(app, /document\.title\s*=\s*metadata\.title/)
  assert.match(language, /navigator\.languages/)
  assert.match(language, /Asia\/Shanghai/)
  assert.doesNotMatch(language, /fetch\(|localStorage|sessionStorage/)
})

test('page and workbench scroll surfaces share one global scrollbar treatment', () => {
  const styles = read('styles.css')
  assert.match(styles, /--scrollbar-thumb:/)
  assert.match(styles, /--scrollbar-thumb-hover:/)
  assert.match(styles, /\*\s*\{[^}]*scrollbar-width:\s*thin/)
  assert.match(styles, /\*::\-webkit-scrollbar\s*\{[^}]*width:\s*7px;[^}]*height:\s*7px/)
  assert.doesNotMatch(styles, /\.left-nav::\-webkit-scrollbar/)
})

test('all rebuilt chapters expose one bilingual causal article flow with one experiment', async () => {
  const { copy } = await import('../content.js')
  const { articleFlowChapterIds } = await import('../content/article-flow.js')

  assert.deepEqual(articleFlowChapterIds, [
    'returns', 'bellman', 'optimality', 'planning',
    'td', 'control', 'vfa', 'dqn', 'policygradient', 'actorcritic',
    'ppo', 'tokenmdp', 'rlhf', 'dpo', 'grpo', 'codingrl', 'agentmdp', 'credit',
  ])

  for (const id of articleFlowChapterIds) {
    const zhFlow = copy.zh[id].articleFlow
    const enFlow = copy.en[id].articleFlow
    assert.deepEqual(enFlow.map((block) => [block.id, block.type]), zhFlow.map((block) => [block.id, block.type]), `${id} bilingual flow parity`)
    assert.equal(zhFlow[0].type, 'section', `${id} must open with a motivated section`)
    assert.equal(zhFlow.filter((block) => block.type === 'experiment').length, 1, `${id} must contain one experiment`)
    assert.ok(zhFlow.findIndex((block) => block.type === 'derivation') < zhFlow.findIndex((block) => block.type === 'experiment'), `${id} derivation must prepare the experiment`)
    for (const flow of [zhFlow, enFlow]) {
      flow.filter((block) => ['section', 'topic', 'derivation', 'algorithm', 'theorem'].includes(block.type)).forEach((block) => {
        assert.ok(block.title?.trim(), `${id}:${block.id} visible heading must not be empty`)
      })
    }
    zhFlow.flatMap((block) => block.formulas || []).forEach((formula) => {
      assert.equal(typeof formula.latex, 'string', `${id} article formula must be explicit LaTeX`)
      assert.ok(['definition', 'transition', 'result', 'support'].includes(formula.role), `${id} article formula needs a semantic role`)
      assert.equal(typeof formula.before, 'string', `${id} article formula needs a preceding explanation`)
      assert.equal(typeof formula.after, 'string', `${id} article formula needs a following interpretation`)
    })
  }

  const bellmanFlow = copy.zh.bellman.articleFlow
  assert.equal(bellmanFlow[0].id, 'return-recursion')
  assert.equal(bellmanFlow[0].formulas.length, 2)
  assert.equal(bellmanFlow[1].id, 'conditional-expectation')
  assert.match(bellmanFlow[1].formulas[0].latex, /\\coloneqq/)
  assert.ok(bellmanFlow.findIndex((block) => block.id === 'matrix-and-iteration') < bellmanFlow.findIndex((block) => block.type === 'experiment'))
  const backupBlock = bellmanFlow.find((block) => block.id === 'bootstrapping')
  assert.match(backupBlock.formulas[0].latex, /\\delta_\{\\mathrm B\}/)
  assert.match(copy.zh.bellman.interpretation, /局部 Bellman 残差/)
  assert.match(copy.en.bellman.interpretation, /local Bellman residual/)
  assert.match(copy.zh.bellman.microscope.singleBackupNote, /其余 24 个状态保持不变/)
})

test('short article turns keep formula interpretation separate from the preceding claim', async () => {
  const { copy } = await import('../content.js')
  for (const lang of ['zh', 'en']) {
    for (const chapter of copy[lang].chapters) {
      const turns = (copy[lang][chapter.id].articleFlow || []).filter((block) => block.type === 'turn')
      turns.forEach((turn) => {
        if (turn.formulas?.length) {
          assert.ok(turn.formulaAfter?.length > 20, `${lang}.${chapter.id}.${turn.id} formula interpretation`)
          turn.formulas.forEach((formula) => {
            assert.ok(formula.before.length > 20, `${lang}.${chapter.id}.${turn.id} formula before`)
            assert.ok(formula.after.length > 20, `${lang}.${chapter.id}.${turn.id} formula after`)
          })
        } else {
          assert.ok(turn.paragraphs.join('').length >= 70, `${lang}.${chapter.id}.${turn.id} merged prose turn`)
        }
      })
    }
  }
})

test('long-horizon credit uses one evidence ladder instead of restarting the derivation four times', async () => {
  const { copy } = await import('../content.js')
  const expected = [
    ['segmentation', 'turn'],
    ['credit-evidence-ladder', 'derivation'],
    ['bias-audit', 'topic'],
    ['curriculum', 'turn'],
    ['hindsight-risk', 'turn'],
  ]
  for (const lang of ['zh', 'en']) {
    const flow = copy[lang].credit.articleFlow
    assert.deepEqual(
      flow.filter((block) => expected.some(([id]) => id === block.id)).map((block) => [block.id, block.type]),
      expected,
    )
    assert.deepEqual(flow.filter((block) => block.type === 'derivation').map((block) => block.steps.length), [5])
  }
})

test('phase-two priority chapters follow causal rather than glossary-first article order', async () => {
  const { copy } = await import('../content.js')
  for (const lang of ['zh', 'en']) {
    const rlhf = copy[lang].rlhf.articleFlow.map((block) => block.id)
    assert.ok(rlhf.indexOf('pipeline-level') < rlhf.indexOf('model-provenance'))
    assert.ok(rlhf.indexOf('model-provenance') < rlhf.indexOf('rlhf-derivation'))
    assert.equal(rlhf.includes('role-separation'), false)

    const grpo = copy[lang].grpo.articleFlow.map((block) => block.id)
    assert.ok(grpo.indexOf('verifier') < grpo.indexOf('group-baseline'))
    assert.ok(grpo.indexOf('zero-variance') < grpo.indexOf('informative-group-repair'))
    assert.ok(grpo.indexOf('informative-group-repair') < grpo.indexOf('stability-family'))

    const agent = copy[lang].agentmdp.articleFlow.map((block) => block.id)
    assert.ok(agent.indexOf('branching') < agent.indexOf('chapter-experiment'))
    assert.ok(agent.indexOf('chapter-experiment') < agent.indexOf('partial-observability'))
  }
})

test('chapters 08–13 expose algorithm-specific evidence without a generic aggregate chart', () => {
  const source = read('components/LearningLab.jsx')
  const styles = read('styles.css')
  ;[
    'TdEvidenceStage',
    'ControlEvidenceStage',
    'VfaEvidenceStage',
    'DqnEvidenceStage',
    'PolicyGradientEvidenceStage',
    'ActorCriticEvidenceStage',
  ].forEach((component) => assert.match(source, new RegExp(`function ${component}\\(`)))
  assert.match(source, /<DedicatedLearningStage id=\{id\}/)
  assert.match(source, /className="learning-compact-summary"/)
  assert.doesNotMatch(source, /className="learning-lab-stage is-secondary-evidence"/)
  assert.match(source, /Replay buffer/)
  assert.match(source, /\\bar\\theta/)
  assert.match(styles, /\.td-evidence-stage/)
  assert.match(styles, /\.dqn-evidence-stage/)
  assert.match(styles, /\.ac-two-updates/)
  assert.match(styles, /\.learning-compact-summary/)
})

test('later experiments name their environment and keep summary evidence spatially bounded', () => {
  const learning = read('components/LearningLab.jsx')
  const stochastic = read('components/StochasticApproximationLab.jsx')
  const modern = read('components/ModernExtensionLab.jsx')
  const ppo = read('components/PpoLab.jsx')
  const monteCarlo = read('components/MonteCarloLab.jsx')
  const styles = read('styles.css')

  assert.match(learning, /const scenarioCopy =/)
  ;['td', 'control', 'vfa', 'dqn', 'policygradient', 'actorcritic'].forEach((id) => {
    assert.match(learning, new RegExp(`\\b${id}:\\s*\\{`), `${id} environment`)
  })
  assert.match(stochastic, /className="experiment-environment"/)
  assert.match(modern, /const environmentCopy =/)
  ;['dpo', 'grpo', 'codingrl', 'agentmdp', 'credit'].forEach((id) => {
    assert.match(modern, new RegExp(`\\b${id}:\\s*\\{`), `${id} environment`)
  })
  assert.match(ppo, /className="experiment-environment"/)
  assert.match(monteCarlo, /共享的 5×5 网格世界/)
  assert.match(styles, /\.experiment-environment\s*\{[^}]*grid-template-columns:/)
  assert.match(styles, /\.mc-world-visual\s*\{[^}]*width:\s*min\(100%,\s*300px\)/)
  assert.match(styles, /\.mc-playback-stage\s*\{[^}]*grid-template-columns:/)
  assert.match(monteCarlo, /\\frac\{G_t-Q\(S_t,A_t\)\}\{N\(S_t,A_t\)\}/)
  assert.match(read('components/TokenMdpLab.jsx'), /className="experiment-environment"/)
  assert.match(read('components/SystemLab.jsx'), /className="experiment-environment"/)
  assert.match(learning, /className="learning-summary-metrics"/)
  assert.doesNotMatch(styles, /\.learning-compact-summary > div\s*\{/)
})

test('phase-two chapters keep one causal article spine and mechanism-faithful interactions', async () => {
  const { copy } = await import('../content.js')
  const { buildChapterArticleFlow } = await import('../content/article-flow.js')
  const flowIds = (id, lang = 'zh') => buildChapterArticleFlow(id, copy[lang][id], lang).map((item) => item.id)

  assert.deepEqual(flowIds('policygradient'), [
    'value-policy', 'softmax', 'objectives-and-occupancy', 'chapter-derivation',
    'theorem-to-samples', 'reinforce-complete', 'chapter-experiment', 'variance', 'forward',
  ])
  assert.ok(flowIds('actorcritic').indexOf('qac-to-baseline') < flowIds('actorcritic').indexOf('chapter-derivation'))
  assert.doesNotMatch(read('content/article-flow.js'), /ppo:[\s\S]*?ref\('sections', 'update-cycle'\)/)
  assert.ok(flowIds('dpo').indexOf('beta-meaning') < flowIds('dpo').indexOf('complete-dpo'))
  assert.ok(flowIds('codingrl').indexOf('iterative-repair') < flowIds('codingrl').indexOf('complete-coding-loop'))
  assert.deepEqual(flowIds('vfa'), [
    'capacity', 'distribution', 'chapter-derivation', 'linear-sharing',
    'chapter-experiment', 'interference', 'approximate-control', 'forward',
  ])
  assert.ok(!flowIds('dqn').includes('two-instabilities'))
  assert.ok(flowIds('dqn').indexOf('moving-target') < flowIds('dqn').indexOf('chapter-derivation'))

  const learning = read('components/LearningLab.jsx')
  const modern = read('components/ModernExtensionLab.jsx')
  const ppo = read('components/PpoLab.jsx')
  assert.match(learning, /className="pg-probability-ledger"/)
  assert.match(learning, /className="dqn-update-ledger"/)
  assert.match(learning, /result\.sampledKeys/)
  assert.match(modern, /className="dpo-update-ledger"/)
  assert.match(modern, /className="coding-repair-tape"/)
  assert.match(ppo, /tabIndex=\{0\}/)
  assert.match(ppo, /onKeyDown=/)
  assert.match(ppo, /aria-pressed=/)
})

test('phase-three interactions expose their algorithm-specific internal evidence', () => {
  const learning = read('components/LearningLab.jsx')
  const system = read('components/SystemLab.jsx')
  const modern = read('components/ModernExtensionLab.jsx')
  const styles = read('styles.css')

  assert.match(learning, /className="td-course-grid"/)
  assert.match(learning, /className="td-update-ledger"/)
  assert.match(learning, /className="td-method-clock"/)
  assert.match(learning, /result\.frames/)
  assert.match(learning, /update\.correction/)
  assert.match(learning, /className="pg-variance-panel"/)
  assert.match(learning, /result\.stepContributions/)
  assert.match(learning, /result\.varianceWithBaseline/)
  assert.match(learning, /className="ac-policy-ledger"/)
  assert.match(learning, /result\.actor\.probabilitiesBefore/)
  assert.match(learning, /result\.critic\.valueAfter/)
  assert.match(system, /className="rlhf-version-flow"/)
  assert.match(system, /className="rlhf-tensor-contract"/)
  assert.match(system, /className="rlhf-mask-ledger"/)
  assert.match(system, /buildRlhfBatchContract/)
  assert.match(modern, /result\.gradients\.chosen/)
  assert.match(modern, /result\.gradients\.rejected/)
  assert.match(styles, /\.td-course-grid\s*\{/)
  assert.match(styles, /\.ac-evidence-stage\s*\{\s*grid-template-columns:\s*1fr/)
})

test('the return worked example remains attached to the shared course world', async () => {
  const { copy } = await import('../content.js')
  const zh = copy.zh.returns.deepening.find((item) => item.id === 'two-return-calculations')
  const en = copy.en.returns.deepening.find((item) => item.id === 'two-return-calculations')
  assert.match(zh.paragraphs[0], /网格世界/)
  assert.match(zh.paragraphs[0], /禁区/)
  assert.match(en.paragraphs[0], /shared grid world/)
  assert.match(en.paragraphs[0], /forbidden region/)
})

test('every chapter closes with a chapter-specific bilingual summary title', async () => {
  const { copy } = await import('../content.js')
  for (const id of copy.zh.chapters.map((chapter) => chapter.id)) {
    const zhTitle = copy.zh[id].summaryTitle || '从长期回报到可求解的状态方程'
    const enTitle = copy.en[id].summaryTitle || 'From long-term return to solvable state equations'
    assert.ok(zhTitle.length >= 8, `${id}.zh summary title`)
    assert.ok(enTitle.length >= 12, `${id}.en summary title`)
    if (id !== 'bellman') {
      assert.notEqual(zhTitle, '从长期回报到可求解的状态方程', `${id} must not inherit Bellman summary`)
      assert.notEqual(enTitle, 'From long-term return to solvable state equations', `${id} must not inherit Bellman summary`)
    }
  }
})
