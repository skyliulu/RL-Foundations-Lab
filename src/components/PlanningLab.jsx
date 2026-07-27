import { useEffect, useMemo, useState } from 'react'
import {
  ACTION_NAMES,
  ACTIONS,
  GOAL,
  SIZE,
  actionTarget,
  allStates,
  isForbidden,
  isSame,
} from '../engine/gridworld'
import { comparePlanningAlgorithms } from '../engine/planning'
import { planningPresetConfigs } from '../content/planning'
import MathFormula from './MathFormula'
import MathText from './MathText'

const algorithmOrder = ['vi', 'tpi', 'pi']
const states = allStates()

function formatScientific(value) {
  if (value === 0) return '0'
  if (value < 0.001) return value.toExponential(1)
  return value.toFixed(4)
}

function eventAtBudget(result, budget) {
  return result.timeline.reduce(
    (selected, event) => event.backups <= budget ? event : selected,
    result.timeline[0],
  )
}

function PlanningCurve({ results, events, text }) {
  const width = 660
  const height = 226
  const margin = { top: 18, right: 28, bottom: 36, left: 52 }
  const traces = algorithmOrder.map((id) => results[id].trace)
  const maxBackups = Math.max(...traces.flatMap((trace) => trace.map((step) => step.backups)), 1)
  const residuals = traces.flatMap((trace) => trace.map((step) => Math.max(step.residual, 1e-9)))
  const logMax = Math.log10(Math.max(...residuals))
  const logMin = Math.min(Math.log10(Math.min(...residuals)), -7)
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const x = (backups) => margin.left + backups / maxBackups * plotWidth
  const y = (residual) => margin.top + (logMax - Math.log10(Math.max(residual, 1e-9))) / (logMax - logMin) * plotHeight
  const ticks = [logMax, (logMax + logMin) / 2, logMin]

  return (
    <svg className="planning-curve" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="planning-chart-title planning-chart-desc">
      <title id="planning-chart-title">{text.residualChart}</title>
      <desc id="planning-chart-desc">{text.chartHint}</desc>
      {ticks.map((tick) => <g key={tick}><line x1={margin.left} x2={width - margin.right} y1={y(10 ** tick)} y2={y(10 ** tick)} className="planning-grid-line" /><text x={margin.left - 8} y={y(10 ** tick) + 4} textAnchor="end">{(10 ** tick).toExponential(0)}</text></g>)}
      {algorithmOrder.map((id, index) => {
        const trace = results[id].trace
        const points = trace.map((step) => `${x(step.backups)},${y(step.residual)}`).join(' ')
        const selected = events[id]
        return <g key={id}><polyline points={points} className={`planning-line planning-line-${index + 1}`} /><circle cx={x(selected.backups)} cy={y(selected.residual)} r="5" className={`planning-marker planning-marker-${index + 1}`} /></g>
      })}
      <text x={margin.left + plotWidth / 2} y={height - 7} textAnchor="middle">{text.backups}</text>
      <text x="7" y="12">{text.residualAxis}</text>
    </svg>
  )
}

function phaseLabel(event, text) {
  if (event.phase === 'evaluation') return text.phaseEvaluation
  if (event.phase === 'improvement') return text.phaseImprovement
  return text.phaseReady
}

function PlanningCycleLane({ id, event, truncation, selected, onSelect, text }) {
  const evaluationDepth = id === 'vi' ? 1 : id === 'tpi' ? truncation : null
  const visibleSweeps = evaluationDepth == null ? 6 : Math.min(evaluationDepth, 8)
  const currentSweep = event.phase === 'ready' ? 0 : event.sweep
  const activeSweep = Math.min(currentSweep, visibleSweeps)

  return (
    <button type="button" className={`planning-cycle-lane is-${id}${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={onSelect}>
      <span className="planning-cycle-name"><strong><MathText>{text[id]}</MathText></strong><small>{phaseLabel(event, text)}</small></span>
      <span className="planning-cycle-track" aria-label={`${text[id]} ${phaseLabel(event, text)}`}>
        {Array.from({ length: visibleSweeps }, (_, index) => <i className={`${index < activeSweep ? 'is-complete' : ''}${event.phase === 'evaluation' && index === activeSweep - 1 ? ' is-active' : ''}`} key={index}>{index + 1}</i>)}
        {evaluationDepth == null && <em>…</em>}
        <b className={event.phase === 'improvement' ? 'is-active' : ''}>◆</b>
      </span>
      <span className="planning-cycle-status">
        <small>{text.currentRound}</small><MathFormula latex={`k=${event.iteration}`} />
        <small>{text.currentSweep}</small><MathFormula latex={evaluationDepth == null ? `${event.sweep}` : `${event.sweep}/${evaluationDepth}`} />
        <small>{text.backups}</small><strong>{event.backups}</strong>
      </span>
    </button>
  )
}

function PlanningMap({ event, id, label, selectedIndex, onSelect, text, depthLatex = null }) {
  const min = Math.min(...event.values)
  const max = Math.max(...event.values)
  return (
    <figure className={`planning-map is-${id}`}>
      <figcaption>
        <strong><MathText>{label}</MathText>{depthLatex && <MathFormula latex={depthLatex} />}</strong>
        <span className={`planning-phase-badge is-${event.phase}`}><MathText>{phaseLabel(event, text)}</MathText></span>
      </figcaption>
      <div className="planning-value-grid" role="group" aria-label={`${label} ${text.propagation}`}>
        {event.values.map((value, index) => {
          const state = { row: Math.floor(index / SIZE), col: index % SIZE }
          const amount = (value - min) / Math.max(max - min, 0.001)
          const background = isForbidden(state) ? '#efb126' : isSame(state, GOAL) ? '#55c6d8' : `rgba(34,112,139,${0.06 + amount * 0.52})`
          return <button type="button" aria-pressed={selectedIndex === index} aria-label={`${label} state ${state.row + 1},${state.col + 1}`} className={selectedIndex === index ? 'is-selected' : ''} onClick={() => onSelect(index)} key={index} style={{ background }}><b>{value.toFixed(1)}</b><i>{ACTIONS[event.policy[index]].arrow}</i></button>
        })}
      </div>
      <small><MathFormula latex={`k=${event.iteration}`} /> · {event.backups} <MathText>{text.backups}</MathText> · {formatScientific(event.residual)} <MathText>{text.residualAxis}</MathText></small>
    </figure>
  )
}

function PlanningStateInspector({ id, event, stateIndex, gamma, noise, text }) {
  const actionValues = ACTION_NAMES
    .map((action) => ({ action, value: actionTarget(states[stateIndex], action, event.values, gamma, noise) }))
    .sort((left, right) => right.value - left.value)
  const state = states[stateIndex]
  const policyAction = event.evaluatedPolicy[stateIndex]
  const previewAction = event.previewPolicy[stateIndex]

  return (
    <section className="planning-state-inspector">
      <header>
        <div><span><MathText>{text.currentEvidence}</MathText></span><strong><MathText>{text[id]}</MathText></strong></div>
        <MathFormula latex={`s=(${state.row + 1},${state.col + 1})`} />
      </header>
      <div className="planning-state-flow">
        <span><small>{text.evaluatedPolicy}</small><strong>{ACTIONS[policyAction].arrow}</strong></span>
        <b aria-hidden="true">→</b>
        <span><small>{text.evaluationSweeps}</small><MathFormula latex={event.evaluationTarget == null ? `${event.sweep}` : `${event.sweep}/${event.evaluationTarget}`} /></span>
        <b aria-hidden="true">→</b>
        <span><small>{text.valueChange}</small><MathFormula latex={`${event.evaluationStartValues[stateIndex].toFixed(2)}\\to${event.values[stateIndex].toFixed(2)}`} /></span>
        <b aria-hidden="true">→</b>
        <span className="is-wide"><small>{text.actionComparison}</small><MathFormula latex={`q(s,\\mathrm{${actionValues[0].action}})=${actionValues[0].value.toFixed(2)}\\;\\ge\\;q(s,\\mathrm{${actionValues[1].action}})=${actionValues[1].value.toFixed(2)}`} /></span>
        <b aria-hidden="true">→</b>
        <span><small>{event.phase === 'improvement' ? text.improvedPolicy : text.nextGreedy}</small><strong>{ACTIONS[previewAction].arrow}</strong></span>
      </div>
      <p>{event.phase === 'evaluation' ? text.policyFrozen : event.phase === 'improvement' ? text.policyJustImproved : text.clockReady}</p>
    </section>
  )
}

export default function PlanningLab({ content }) {
  const text = content.explorer
  const baseline = planningPresetConfigs['early-propagation']
  const [gamma, setGamma] = useState(baseline.gamma)
  const [noise, setNoise] = useState(baseline.noise)
  const [truncation, setTruncation] = useState(baseline.truncation)
  const [budget, setBudget] = useState(baseline.budget)
  const [presetId, setPresetId] = useState('early-propagation')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('tpi')
  const [selectedState, setSelectedState] = useState(10)
  const [playing, setPlaying] = useState(false)
  const results = useMemo(() => comparePlanningAlgorithms({ gamma, noise, truncation, maxOuter: 240 }), [gamma, noise, truncation])
  const maxBudget = Math.max(...algorithmOrder.map((id) => results[id].backups))
  const activeBudget = Math.min(budget, maxBudget)
  const events = Object.fromEntries(algorithmOrder.map((id) => [id, eventAtBudget(results[id], activeBudget)]))

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setBudget((current) => {
        if (current >= maxBudget) {
          setPlaying(false)
          return current
        }
        return Math.min(maxBudget, current + SIZE * SIZE)
      })
    }, 700)
    return () => window.clearInterval(timer)
  }, [playing, maxBudget])

  function applyPreset(id) {
    const preset = planningPresetConfigs[id]
    setGamma(preset.gamma)
    setNoise(preset.noise)
    setTruncation(preset.truncation)
    setBudget(preset.budget)
    setPresetId(id)
    setPlaying(false)
  }

  function customize(callback) {
    setPresetId('custom')
    setPlaying(false)
    callback()
  }

  function moveClock(nextBudget) {
    setPlaying(false)
    setBudget(Math.max(0, Math.min(maxBudget, nextBudget)))
  }

  return (
    <section className="planning-arena" aria-label={content.figure}>
      <header className="planning-heading"><div><span className="figure-number">{content.figure}</span><p><MathText>{content.instruction}</MathText></p></div><span className="planning-protocol"><b>◇</b><MathText>{text.protocol}</MathText></span></header>
      <p className="planning-protocol-text"><strong><MathText>{text.protocol}</MathText></strong><MathText>{text.protocolText}</MathText></p>

      <div className="planning-presets"><span><MathText>{text.preset}</MathText></span>{Object.keys(planningPresetConfigs).map((id) => <button type="button" key={id} className={presetId === id ? 'active' : ''} aria-pressed={presetId === id} onClick={() => applyPreset(id)}><strong><MathText>{text.presetItems[id].title}</MathText></strong><small><MathText>{text.presetItems[id].note}</MathText></small></button>)}</div>

      <div className="planning-controls is-compact">
        <label><span><MathText>{text.gamma}</MathText><output>{gamma.toFixed(2)}</output></span><input type="range" min="0.5" max="0.95" step="0.05" value={gamma} onChange={(event) => customize(() => setGamma(Number(event.target.value)))} /></label>
        <label><span><MathText>{text.noise}</MathText><output>{noise.toFixed(2)}</output></span><input type="range" min="0" max="0.4" step="0.1" value={noise} onChange={(event) => customize(() => setNoise(Number(event.target.value)))} /></label>
        <label><span><MathText>{text.truncation}</MathText><output><MathFormula latex={`j=${truncation}`} /></output></span><input type="range" min="1" max="10" step="1" value={truncation} onChange={(event) => customize(() => setTruncation(Number(event.target.value)))} /></label>
      </div>

      <section className="planning-clock">
        <header><span><MathText>{text.sharedClock}</MathText></span><strong>{activeBudget} <MathText>{text.backups}</MathText></strong></header>
        <div className="planning-clock-controls">
          <button type="button" onClick={() => moveClock(activeBudget - SIZE * SIZE)} disabled={activeBudget === 0}>{text.previousBudget}</button>
          <button type="button" className="is-primary" aria-pressed={playing} onClick={() => setPlaying((value) => !value)}>{playing ? text.pauseClock : text.playClock}</button>
          <button type="button" onClick={() => moveClock(activeBudget + SIZE * SIZE)} disabled={activeBudget === maxBudget}>{text.nextBudget}</button>
          <input aria-label={text.budget} type="range" min="0" max={maxBudget} step={SIZE * SIZE} value={activeBudget} onChange={(event) => moveClock(Number(event.target.value))} />
        </div>
      </section>

      <section className="planning-synchronized-stage">
        <header><span><MathText>{text.cycleComparison}</MathText></span><small><MathText>{text.cycleHint}</MathText></small></header>
        <div className="planning-cycle-lanes">
          {algorithmOrder.map((id) => <PlanningCycleLane id={id} event={events[id]} truncation={truncation} selected={selectedAlgorithm === id} onSelect={() => setSelectedAlgorithm(id)} text={text} key={id} />)}
        </div>
        <div className="planning-map-comparison">
          <PlanningMap event={events.vi} id="vi" label={text.viShort} selectedIndex={selectedState} onSelect={(index) => { setSelectedAlgorithm('vi'); setSelectedState(index) }} text={text} />
          <PlanningMap event={events.tpi} id="tpi" label={text.tpiShort} depthLatex={`j=${truncation}`} selectedIndex={selectedState} onSelect={(index) => { setSelectedAlgorithm('tpi'); setSelectedState(index) }} text={text} />
          <PlanningMap event={events.pi} id="pi" label={text.piShort} selectedIndex={selectedState} onSelect={(index) => { setSelectedAlgorithm('pi'); setSelectedState(index) }} text={text} />
        </div>
        <PlanningStateInspector id={selectedAlgorithm} event={events[selectedAlgorithm]} stateIndex={selectedState} gamma={gamma} noise={noise} text={text} />
      </section>

      <details className="planning-convergence-details">
        <summary><MathText>{text.convergenceDetails}</MathText></summary>
        <div className="planning-main-stage">
          <section className="planning-chart-panel">
            <header><span><MathText>{text.residualChart}</MathText></span><small><MathText>{text.chartHint}</MathText></small></header>
            <div className="planning-legend"><span><i className="legend-vi" /><MathText>{text.vi}</MathText></span><span><i className="legend-tpi" /><MathText>{text.tpi}</MathText></span><span><i className="legend-pi" /><MathText>{text.pi}</MathText></span></div>
            <PlanningCurve results={results} events={events} text={text} />
          </section>
          <section className="planning-result-panel">
            <header><span><MathText>{text.sameLimit}</MathText></span><small><MathFormula latex={String.raw`\max\lvert V-V^*\rvert`} /></small></header>
            <div className="planning-result-table">
              {algorithmOrder.map((id) => <div key={id}><strong><MathText>{text[id]}</MathText></strong><span>{results[id].backups}<small><MathText>{text.backups}</MathText></small></span><span>{results[id].policyUpdates}<small><MathText>{text.policyUpdates}</MathText></small></span><span>{formatScientific(results[id].maxValueError)}<small><MathText>{text.finalError}</MathText></small></span></div>)}
            </div>
          </section>
        </div>
      </details>
    </section>
  )
}
