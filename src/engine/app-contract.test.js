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
  assert.match(styles, /--reading-column:\s*780px/)
  assert.match(styles, /\.chapter-shell\s*\{[^}]*max-width:\s*var\(--chapter-frame\)/)
  ;['derivation-sequence', 'mdp-narrative', 'clickable-derivation', 'chapter-article-sections', 'chapter-summary', 'chapter-sources', 'source-note'].forEach((className) => {
    assert.match(styles, new RegExp(`\\.${className}\\s*\\{[^}]*max-width:\\s*var\\(--reading-column\\)`), className)
  })
  assert.match(styles, /\.world-explorer\s*\{[^}]*max-width:\s*var\(--chapter-frame\)/)
})

test('all chapter explanations use continuous article sections rather than a card grid', () => {
  const app = read('App.jsx')
  const styles = read('styles.css')
  assert.match(app, /chapter-article-sections/)
  assert.doesNotMatch(app, /chapter-section-grid|chapter-section-card/)
  assert.doesNotMatch(styles, /\.chapter-section-grid|\.chapter-section-card/)
})

test('ordinary MDP sections use article headings instead of numbered timeline cards', () => {
  const source = read('components/MdpNarrative.jsx')
  assert.match(source, /narrative-section/)
  assert.match(source, /narrative-heading/)
  assert.doesNotMatch(source, /narrative-index|padStart\(/)
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

test('ordinary chapter-one formulas use the shared display treatment', () => {
  const narrative = read('components/MdpNarrative.jsx')
  const styles = read('styles.css')
  assert.match(narrative, /<MathFormula block latex=\{formula\}/)
  assert.match(styles, /\.narrative-formulas\s*\{[^}]*border-left:\s*2px solid var\(--navy\)/)
  assert.match(styles, /\.narrative-formulas\s*\{[^}]*background:\s*rgba\(23,79,130,\.035\)/)
})

test('the homepage explains the learning path and gives readers an actionable chapter rhythm', () => {
  const source = read('components/HomePage.jsx')
  assert.match(source, /home-reading-guide/)
  assert.match(source, /reading-guide-steps/)
  assert.match(source, /找到问题/)
  assert.match(source, /展开推导/)
  assert.match(source, /reading-guide-cycle/)
  assert.match(source, /迭代进入下一章/)
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
