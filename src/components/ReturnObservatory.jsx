import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { allStates, indexOf, isForbidden, isGoal, isSame, keyOf } from '../engine/gridworld'
import { estimateStateValue } from '../engine/returns'
import { returnPresetConfigs } from '../content/returns'
import MathFormula from './MathFormula'
import MathText from './MathText'

const sampleOptions = [1, 4, 8, 32]
const pathPreviewSteps = 10

function formatValue(value) {
  return Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(3)
}

function stateLatex(state) {
  return String.raw`s_{${indexOf(state) + 1}}`
}

function sampleStates(sample, limit = pathPreviewSteps) {
  if (!sample.steps.length) return []
  return [
    sample.steps[0].state,
    ...sample.steps.slice(0, limit).map((step) => step.nextState),
  ]
}

function trajectorySignature(sample, limit = pathPreviewSteps) {
  return sampleStates(sample, limit).map(keyOf).join('|')
}

function pathLatex(sample, limit = 8) {
  const states = sampleStates(sample, limit)
  const suffix = sample.steps.length > limit ? String.raw`\rightarrow\cdots` : ''
  return `${states.map(stateLatex).join(String.raw`\rightarrow `)}${suffix}`
}

function rewardLatex(sample, limit = 8) {
  const rewards = sample.steps.slice(0, limit).map((step) => step.reward)
  const suffix = sample.steps.length > limit ? ',\\ldots' : ''
  return String.raw`\left(${rewards.join(',')}${suffix}\right)`
}

function TrajectoryOverlay({ sample }) {
  const states = sampleStates(sample, 14)
  const points = states.map((state) => `${(state.col + 0.5) * 20},${(state.row + 0.5) * 20}`).join(' ')
  return (
    <svg className="return-path-overlay" viewBox="0 0 100 100" aria-hidden="true">
      <polyline points={points} />
      {states.map((state, index) => (
        <circle
          className={index === 0 ? 'is-start' : index === states.length - 1 ? 'is-end' : ''}
          cx={(state.col + 0.5) * 20}
          cy={(state.row + 0.5) * 20}
          r={index === 0 || index === states.length - 1 ? 2.35 : 1.35}
          key={`${keyOf(state)}-${index}`}
        />
      ))}
    </svg>
  )
}

function TrajectoryFan({ result, selectedIndex, onSelect, text, noise }) {
  const listRef = useRef(null)
  const [trajectoryWindowHeight, setTrajectoryWindowHeight] = useState(null)
  const scrollable = result.samples.length > 4
  const uniqueCount = new Set(result.samples.map((sample) => trajectorySignature(sample))).size
  const deterministic = noise === 0 && uniqueCount === 1

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !scrollable) {
      setTrajectoryWindowHeight(null)
      return undefined
    }

    const cards = [...list.querySelectorAll(':scope > .return-trajectory-card')].slice(0, 4)
    const measureWindow = () => {
      const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0
      const height = cards.reduce((total, card) => total + card.getBoundingClientRect().height, 0)
        + gap * Math.max(cards.length - 1, 0)
      setTrajectoryWindowHeight(height)
    }
    const observer = new ResizeObserver(measureWindow)
    cards.forEach((card) => observer.observe(card))
    measureWindow()

    return () => observer.disconnect()
  }, [result.samples.length, scrollable, text])

  return (
    <section className="return-futures-panel">
      <header>
        <span>{text.fanTitle}</span>
        <small>{text.fanNote}</small>
      </header>
      <div className={`return-futures-summary ${deterministic ? 'is-deterministic' : 'is-stochastic'}`}>
        <strong>{deterministic ? text.deterministic : text.stochastic}</strong>
        <p><MathText>{deterministic ? text.deterministicSummary : text.stochasticSummary}</MathText></p>
      </div>
      <div
        ref={listRef}
        className={`return-trajectory-list${scrollable ? ' is-scrollable' : ''}`}
        role="region"
        aria-label={text.fanTitle}
        aria-describedby={scrollable ? 'return-trajectory-list-note' : undefined}
        tabIndex={scrollable ? 0 : undefined}
        style={trajectoryWindowHeight ? { maxHeight: `${trajectoryWindowHeight}px` } : undefined}
      >
        {result.samples.map((sample, index) => (
          <button
            type="button"
            className={index === selectedIndex ? 'return-trajectory-card is-selected' : 'return-trajectory-card'}
            aria-pressed={index === selectedIndex}
            aria-label={`${text.selectedRun} ${index + 1}`}
            onClick={() => onSelect(index)}
            key={sample.seed}
          >
            <span className="return-trajectory-index">
              <b>{String(index + 1).padStart(2, '0')}</b>
              <small>{text.seed} {sample.seed}</small>
            </span>
            <span className="return-trajectory-evidence">
              <span><MathText>{text.samplePath}</MathText></span>
              <MathFormula latex={pathLatex(sample)} />
              <span><MathText>{text.rewardPath}</MathText></span>
              <MathFormula latex={rewardLatex(sample)} />
            </span>
            <strong className="return-trajectory-value">
              <MathFormula latex={String.raw`G_0^{(${index + 1})}=${formatValue(sample.discountedReturn)}`} />
            </strong>
          </button>
        ))}
      </div>
      {scrollable && (
        <p className="return-sample-count-note" id="return-trajectory-list-note">{text.shownSamples}: {result.samples.length} · {text.scrollHint}</p>
      )}
      <div className="return-expectation-panel">
        <div>
          <span>{text.exactLine}</span>
          <MathFormula block latex={deterministic
            ? String.raw`\Pr(G_t=g\mid S_t=s)=1\Longrightarrow V^{\pi}(s)=g`
            : String.raw`V^{\pi}(s)=\mathbb{E}_{\pi,p}[G_t\mid S_t=s]`
          } />
          <p><MathText>{deterministic ? text.deterministicValueNote : text.selectedValueNote}</MathText></p>
        </div>
        <div>
          <span>{text.runningMean}</span>
          <MathFormula block latex={String.raw`\widehat V_{${result.samples.length}}^{\pi}(s)=${formatValue(result.mean)}`} />
          <p><MathText>{text.sampleMeanNote}</MathText></p>
        </div>
      </div>
    </section>
  )
}

export default function ReturnObservatory({ lang, content }) {
  const text = content.explorer
  const baseline = returnPresetConfigs['course-baseline']
  const [start, setStart] = useState(baseline.start)
  const [gamma, setGamma] = useState(baseline.gamma)
  const [noise, setNoise] = useState(baseline.noise)
  const [sampleCount, setSampleCount] = useState(baseline.sampleCount)
  const [mode, setMode] = useState(baseline.mode)
  const [presetId, setPresetId] = useState('course-baseline')
  const [selectedRun, setSelectedRun] = useState(0)
  const [showPresets, setShowPresets] = useState(false)

  const result = useMemo(() => estimateStateValue({ start, gamma, noise, sampleCount }), [start, gamma, noise, sampleCount])
  const selectedIndex = Math.min(selectedRun, result.samples.length - 1)
  const sample = result.samples[selectedIndex]
  const visibleSteps = sample.steps.slice(0, 12)
  const selectedStates = sampleStates(sample, 14)
  const firstVisit = new Map()
  selectedStates.forEach((state, index) => {
    if (!firstVisit.has(keyOf(state))) firstVisit.set(keyOf(state), index)
  })
  const visibleReturnTerms = visibleSteps.map((step) => `${step.discount.toFixed(2)}\\times(${step.reward})`)
  const visibleReturnRows = Array.from({ length: Math.ceil(visibleReturnTerms.length / 4) }, (_, index) => visibleReturnTerms.slice(index * 4, index * 4 + 4).join('+'))
  const visibleReturnLatex = String.raw`\begin{aligned}G_0&=${visibleReturnRows.join(String.raw`\\&\quad+`)}+\cdots\end{aligned}`

  function applyPreset(id) {
    const preset = returnPresetConfigs[id]
    setStart(preset.start)
    setGamma(preset.gamma)
    setNoise(preset.noise)
    setSampleCount(preset.sampleCount)
    setMode(preset.mode)
    setSelectedRun(0)
    setPresetId(id)
  }

  function customize(callback) {
    setPresetId('custom')
    callback()
  }

  return (
    <section className="return-observatory" aria-label={content.figure}>
      <header className="return-heading">
        <div><span className="figure-number">{content.figure}</span><p><MathText>{content.instruction}</MathText></p></div>
        <div className="return-mode-switch" role="group" aria-label={content.question}>
          <button type="button" className={mode === 'trajectory' ? 'active' : ''} aria-pressed={mode === 'trajectory'} onClick={() => setMode('trajectory')}>{text.modeTrajectory}</button>
          <button type="button" className={mode === 'futures' ? 'active' : ''} aria-pressed={mode === 'futures'} onClick={() => setMode('futures')}>{text.modeFutures}</button>
          <button type="button" aria-expanded={showPresets} aria-controls="return-presets" onClick={() => setShowPresets((value) => !value)}>{showPresets ? (lang === 'zh' ? '收起预设' : 'Hide presets') : (lang === 'zh' ? '教学预设' : 'Presets')}</button>
        </div>
      </header>

      <div className="return-environment">
        <span>{text.environment}</span>
        <p><MathText>{text.environmentDetail}</MathText></p>
      </div>

      {showPresets && <div className="return-presets" id="return-presets">
        <span>{text.preset}</span>
        {Object.keys(returnPresetConfigs).map((id) => (
          <button type="button" key={id} className={presetId === id ? 'active' : ''} aria-pressed={presetId === id} onClick={() => applyPreset(id)}>
            <strong><MathText>{text.presetItems[id].title}</MathText></strong><small><MathText>{text.presetItems[id].note}</MathText></small>
          </button>
        ))}
      </div>}

      <div className="return-control-row">
        <label><span><MathText>{text.gamma}</MathText><output>{gamma.toFixed(2)}</output></span><input type="range" min="0.1" max="0.95" step="0.05" value={gamma} onChange={(event) => customize(() => setGamma(Number(event.target.value)))} /></label>
        <label><span><MathText>{text.noise}</MathText><output>{noise.toFixed(2)}</output></span><input type="range" min="0" max="0.4" step="0.1" value={noise} onChange={(event) => customize(() => { setNoise(Number(event.target.value)); setSelectedRun(0) })} /><small><MathText>{text.noiseHint}</MathText></small></label>
        <fieldset><legend>{text.sampleCount}</legend><div>{sampleOptions.map((count) => <button type="button" key={count} className={sampleCount === count ? 'active' : ''} aria-pressed={sampleCount === count} onClick={() => customize(() => { setSampleCount(count); setSelectedRun(0) })}>{count}</button>)}</div></fieldset>
      </div>

      <div className="return-metrics">
        <div><span><MathText>{text.selectedReturn}</MathText></span><strong>{formatValue(sample.discountedReturn)}</strong><small><MathFormula latex={String.raw`G_0^{(${selectedIndex + 1})}`} /></small></div>
        <div><span><MathText>{text.exact}</MathText></span><strong>{formatValue(result.exact)}</strong><small><MathFormula latex={String.raw`\mathbb{E}_{\pi,p}[G_t\mid S_t=s]`} /></small></div>
        <div><span>{text.estimate}</span><strong>{formatValue(result.mean)}</strong><small><MathFormula latex={String.raw`n=${sampleCount}`} /></small></div>
      </div>

      <div className={`return-stage mode-${mode}`}>
        <section className="return-world-panel">
          <header><span>{text.startState}</span><small>{text.chooseState}</small></header>
          <div className="return-world-visual">
            <div className="return-world-grid">
              {allStates().map((state) => {
                const visit = firstVisit.get(keyOf(state))
                return (
                  <button type="button" key={keyOf(state)} className={`${isForbidden(state) ? 'forbidden' : ''}${isGoal(state) ? ' goal' : ''}${isSame(state, start) ? ' selected' : ''}${visit !== undefined ? ' visited' : ''}`} aria-label={`${text.startState}: s(${state.row + 1}, ${state.col + 1})`} aria-pressed={isSame(state, start)} onClick={() => customize(() => { setStart(state); setSelectedRun(0) })}>
                    <span className="return-state-label"><MathFormula latex={stateLatex(state)} /></span>
                    {visit !== undefined && <em className="return-path-step">{visit}</em>}
                  </button>
                )
              })}
            </div>
            <TrajectoryOverlay sample={sample} />
          </div>
          <p><MathText>{isGoal(start) ? text.targetContinuing : `${text.fixedPolicy} · ${noise === 0 ? text.deterministic : text.stochastic}`}</MathText></p>
          <dl className="return-readout">
            <div><dt>{text.selectedRun}</dt><dd>#{selectedIndex + 1}</dd></div>
            <div><dt>{text.seed}</dt><dd>{sample.seed}</dd></div>
            <div><dt>{text.return}</dt><dd>{formatValue(sample.discountedReturn)}</dd></div>
            <div><dt>{text.remainingBound}</dt><dd><MathFormula latex={String.raw`\le ${formatValue(sample.tailBound)}`} /></dd></div>
          </dl>
        </section>

        {mode === 'trajectory' ? (
          <section className="return-tape-panel">
            <header><span>{text.trajectoryTape}</span><small>{text.visibleSteps}</small></header>
            <div className="return-formula-live"><MathFormula block latex={visibleReturnLatex} /></div>
            <div className="return-step-table">
              <div className="return-step-head"><span><MathFormula latex={String.raw`t`} /></span><span><MathFormula latex={String.raw`s_t\rightarrow s_{t+1}`} /></span><span><MathFormula latex={String.raw`r_{t+1}`} /></span><span><MathFormula latex={String.raw`\gamma^t`} /></span><span>{text.contribution}</span></div>
              {visibleSteps.map((step) => (
                <div key={step.time} className={step.reward !== 0 ? 'reward-step' : ''}>
                  <span><MathFormula latex={`${step.time}`} /></span>
                  <span><MathFormula latex={[stateLatex(step.state), stateLatex(step.nextState)].join(String.raw`\rightarrow `)} /></span>
                  <span><MathFormula latex={`${step.reward}`} /></span>
                  <span><MathFormula latex={step.discount.toFixed(3)} /></span>
                  <span><MathFormula latex={step.contribution.toFixed(3)} /></span>
                </div>
              ))}
            </div>
            <footer><span><MathText>{text.runningReturn}</MathText></span><strong>{formatValue(sample.discountedReturn)}</strong><small><MathText>{text.tailNote}</MathText></small></footer>
          </section>
        ) : (
          <TrajectoryFan result={result} selectedIndex={selectedIndex} onSelect={setSelectedRun} text={text} noise={noise} />
        )}
      </div>
    </section>
  )
}
