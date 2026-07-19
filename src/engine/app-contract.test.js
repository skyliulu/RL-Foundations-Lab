import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..')
const read = (path) => readFileSync(join(src, path), 'utf8')

test('the prototype stays stateless and performs no remote data calls', () => {
  const source = [
    read('App.jsx'),
    read('components/BellmanLab.jsx'),
    read('components/CourseWorldExplorer.jsx'),
    read('components/ReturnObservatory.jsx'),
    read('components/OptimalitySwitch.jsx'),
    read('components/PlanningLab.jsx'),
    read('components/PpoLab.jsx'),
    read('components/SystemLab.jsx'),
    read('interaction/stepMicroscope.js'),
  ].join('\n')
  ;['localStorage', 'sessionStorage', 'document.cookie', 'fetch(', 'XMLHttpRequest', 'WebSocket'].forEach((forbidden) => {
    assert.equal(source.includes(forbidden), false, `found forbidden persistent/network API: ${forbidden}`)
  })
})

test('Chinese and English expose the same seven product chapter nodes', async () => {
  const { copy } = await import('../content.js')
  assert.deepEqual(copy.zh.chapters.map((item) => item.id), ['mdp', 'returns', 'bellman', 'optimality', 'planning', 'ppo', 'rlhf'])
  assert.deepEqual(copy.en.chapters.map((item) => item.id), copy.zh.chapters.map((item) => item.id))
  assert.ok(copy.zh.bellman.intro.length > 50)
  assert.ok(copy.en.bellman.intro.length > 50)
})

test('all five MVP capability slices are wired into the reading shell', () => {
  const app = read('App.jsx')
  ;['CourseWorldExplorer', 'ReturnObservatory', 'BellmanLab', 'OptimalitySwitch', 'PlanningLab', 'PpoLab', 'SystemLab', 'RightRail'].forEach((name) => {
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
