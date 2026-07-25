import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { activateOnEnterOrSpace } from '../accessibility.js'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..')
const read = (path) => readFileSync(join(src, path), 'utf8')

test('Enter and Space activate custom SVG controls while other keys remain inert', () => {
  for (const key of ['Enter', ' ']) {
    let activations = 0
    let prevented = 0
    const handled = activateOnEnterOrSpace(
      { key, preventDefault: () => { prevented += 1 } },
      () => { activations += 1 },
    )
    assert.equal(handled, true)
    assert.equal(activations, 1)
    assert.equal(prevented, 1)
  }

  let activations = 0
  let prevented = 0
  const handled = activateOnEnterOrSpace(
    { key: 'ArrowRight', preventDefault: () => { prevented += 1 } },
    () => { activations += 1 },
  )
  assert.equal(handled, false)
  assert.equal(activations, 0)
  assert.equal(prevented, 0)
})

test('every visually selected control exposes pressed, selected, or current state', () => {
  const files = [
    'App.jsx',
    ...readdirSync(join(src, 'components'))
      .filter((name) => name.endsWith('.jsx'))
      .map((name) => `components/${name}`),
  ]
  const violations = []

  for (const file of files) {
    const source = read(file)
    const buttonPrefixes = source.match(/<button\b[\s\S]*?onClick=/g) || []
    buttonPrefixes.forEach((prefix, index) => {
      if (!/(?:active|selected|current)/.test(prefix)) return
      if (/aria-(?:pressed|selected|current)=/.test(prefix)) return
      violations.push(`${file} button ${index + 1}`)
    })
  }

  assert.deepEqual(violations, [])
})

test('clickable SVG samples are named, focusable, stateful, and keyboard operable', () => {
  for (const file of ['components/PpoLab.jsx', 'components/ReturnObservatory.jsx']) {
    const source = read(file)
    const interactiveGroups = (source.match(/<g\b[\s\S]*?<\/g>/g) || []).filter((block) => block.includes('onClick='))
    assert.ok(interactiveGroups.length > 0, `${file} must expose an interactive SVG sample`)
    interactiveGroups.forEach((group) => {
      assert.match(group, /role="button"/)
      assert.match(group, /tabIndex=\{0\}/)
      assert.match(group, /aria-pressed=/)
      assert.match(group, /aria-label=/)
      assert.match(group, /onKeyDown=/)
      assert.match(group, /activateOnEnterOrSpace/)
    })
  }

  const styles = read('styles.css')
  assert.match(styles, /\.sample-mark:focus-visible/)
  assert.match(styles, /\.sample-point:focus-visible circle/)
  assert.match(styles, /\.selected-sample-point:focus-visible circle/)
})

test('conditionally hidden views expose their expanded state and controlled region', () => {
  const app = read('App.jsx')
  const courseWorld = read('components/CourseWorldExplorer.jsx')
  const returns = read('components/ReturnObservatory.jsx')

  assert.match(app, /aria-controls="right-rail-panel"/)
  assert.match(app, /id="right-rail-panel"/)
  assert.match(app, /aria-current=\{active === 'home' \? 'page' : undefined\}/)
  assert.match(app, /aria-current=\{active === item\.id \? 'page' : undefined\}/)

  assert.match(courseWorld, /aria-expanded=\{showContract\} aria-controls="mdp-interface-strip"/)
  assert.match(courseWorld, /id="mdp-interface-strip"/)
  assert.match(courseWorld, /aria-expanded=\{showPolicy\} aria-controls="course-world-grid"/)
  assert.match(courseWorld, /id="course-world-grid"/)

  assert.match(returns, /aria-expanded=\{showPresets\} aria-controls="return-presets"/)
  assert.match(returns, /id="return-presets"/)
})
