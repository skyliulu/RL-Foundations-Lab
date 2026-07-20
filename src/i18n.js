const mainlandTimeZones = new Set([
  'Asia/Shanghai',
  'Asia/Chongqing',
  'Asia/Harbin',
  'Asia/Urumqi',
])

export const pageMetadata = {
  zh: {
    htmlLang: 'zh-CN',
    title: '强化学习原理实验室 · RL Foundations Lab',
    description: '一门从网格世界、价值函数与经典控制出发，延伸到大语言模型后训练的交互式强化学习课程。',
  },
  en: {
    htmlLang: 'en',
    title: 'RL Foundations Lab · Interactive Reinforcement Learning',
    description: 'An interactive reinforcement learning course from grid worlds to language-model post-training.',
  },
}

export function detectPreferredLanguage({ languages = [], timeZone = '' } = {}) {
  const prefersChinese = languages
    .filter(Boolean)
    .some((language) => language.toLowerCase().startsWith('zh'))

  return prefersChinese || mainlandTimeZones.has(timeZone) ? 'zh' : 'en'
}

export function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return 'en'

  let timeZone = ''
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    // Browsers without timezone support still fall back to the language list.
  }

  return detectPreferredLanguage({
    languages: navigator.languages?.length ? navigator.languages : [navigator.language],
    timeZone,
  })
}
