import test from 'node:test'
import assert from 'node:assert/strict'
import { detectPreferredLanguage, pageMetadata } from '../i18n.js'

test('Chinese browser preferences select the Chinese experience', () => {
  assert.equal(detectPreferredLanguage({ languages: ['zh-CN', 'en-US'], timeZone: 'America/New_York' }), 'zh')
  assert.equal(detectPreferredLanguage({ languages: ['zh-TW'], timeZone: 'Europe/London' }), 'zh')
})

test('mainland timezones select Chinese without an IP lookup', () => {
  assert.equal(detectPreferredLanguage({ languages: ['en-US'], timeZone: 'Asia/Shanghai' }), 'zh')
  assert.equal(detectPreferredLanguage({ languages: ['en-US'], timeZone: 'Asia/Urumqi' }), 'zh')
})

test('other visitors default to English', () => {
  assert.equal(detectPreferredLanguage({ languages: ['en-US'], timeZone: 'America/Los_Angeles' }), 'en')
  assert.equal(detectPreferredLanguage(), 'en')
})

test('both languages define synchronized document metadata', () => {
  for (const language of ['zh', 'en']) {
    assert.ok(pageMetadata[language].htmlLang)
    assert.ok(pageMetadata[language].title.length > 20)
    assert.ok(pageMetadata[language].description.length > 40)
  }
})
