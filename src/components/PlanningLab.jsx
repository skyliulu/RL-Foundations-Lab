import { useMemo, useState } from 'react'
import { ACTIONS, GOAL, SIZE, isForbidden, isSame } from '../engine/gridworld'
import { comparePlanningAlgorithms } from '../engine/planning'
import { planningPresetConfigs } from '../content/planning'
import MathFormula from './MathFormula'
import MathText from './MathText'

const algorithmOrder = ['vi', 'tpi', 'pi']

function formatScientific(value) {
  if (value === 0) return '0'
  if (value < 0.001) return value.toExponential(1)
  return value.toFixed(4)
}

function PlanningCurve({ results, checkpoints, text }) {
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
      <title id="planning-chart-title">{text.residualChart}</title><desc id="planning-chart-desc">{text.chartHint}</desc>
      {ticks.map((tick) => <g key={tick}><line x1={margin.left} x2={width - margin.right} y1={y(10 ** tick)} y2={y(10 ** tick)} className="planning-grid-line" /><text x={margin.left - 8} y={y(10 ** tick) + 4} textAnchor="end">{(10 ** tick).toExponential(0)}</text></g>)}
      {algorithmOrder.map((id, index) => {
        const trace = results[id].trace
        const points = trace.map((step) => `${x(step.backups)},${y(step.residual)}`).join(' ')
        const selected = checkpoints[id]
        return <g key={id}><polyline points={points} className={`planning-line planning-line-${index + 1}`} /><circle cx={x(selected.backups)} cy={y(selected.residual)} r="5" className={`planning-marker planning-marker-${index + 1}`} /></g>
      })}
      <text x={margin.left + plotWidth / 2} y={height - 7} textAnchor="middle">{text.backups}</text>
      <text x="7" y="12">residual</text>
    </svg>
  )
}

function PlanningMap({ step, label, text }) {
  const min = Math.min(...step.values)
  const max = Math.max(...step.values)
  return (
    <figure className="planning-map">
      <figcaption><strong>{label}</strong><span>k={step.iteration} · {step.backups} {text.backups}</span></figcaption>
      <div className="planning-value-grid" role="img" aria-label={`${label} ${text.propagation}`}>
        {step.values.map((value, index) => {
          const state = { row: Math.floor(index / SIZE), col: index % SIZE }
          const amount = (value - min) / Math.max(max - min, 0.001)
          const background = isForbidden(state) ? '#efb126' : isSame(state, GOAL) ? '#55c6d8' : `rgba(34,112,139,${0.06 + amount * 0.52})`
          return <span key={index} style={{ background }}><b>{value.toFixed(1)}</b><i>{ACTIONS[step.policy[index]].arrow}</i></span>
        })}
      </div>
      <small>{step.policyChanges} {text.policyChanges} · {formatScientific(step.residual)} residual</small>
    </figure>
  )
}

export default function PlanningLab({ content }) {
  const text = content.explorer
  const baseline = planningPresetConfigs['early-propagation']
  const [gamma, setGamma] = useState(baseline.gamma)
  const [noise, setNoise] = useState(baseline.noise)
  const [truncation, setTruncation] = useState(baseline.truncation)
  const [checkpoint, setCheckpoint] = useState(baseline.checkpoint)
  const [presetId, setPresetId] = useState('early-propagation')
  const results = useMemo(() => comparePlanningAlgorithms({ gamma, noise, truncation, maxOuter: 240 }), [gamma, noise, truncation])
  const maxCheckpoint = Math.max(...algorithmOrder.map((id) => results[id].trace.length - 1))
  const activeCheckpoint = Math.min(checkpoint, maxCheckpoint)
  const checkpoints = Object.fromEntries(algorithmOrder.map((id) => [id, results[id].trace[Math.min(activeCheckpoint, results[id].trace.length - 1)]]))

  function applyPreset(id) {
    const preset = planningPresetConfigs[id]
    setGamma(preset.gamma)
    setNoise(preset.noise)
    setTruncation(preset.truncation)
    setCheckpoint(preset.checkpoint)
    setPresetId(id)
  }

  function customize(callback) {
    setPresetId('custom')
    callback()
  }

  return (
    <section className="planning-arena" aria-label={content.figure}>
      <header className="planning-heading"><div><span className="figure-number">{content.figure}</span><p><MathText>{content.instruction}</MathText></p></div><span className="planning-protocol"><b>◇</b>{text.protocol}</span></header>
      <p className="planning-protocol-text"><strong>{text.protocol}</strong><MathText>{text.protocolText}</MathText></p>

      <div className="planning-presets"><span>{text.preset}</span>{Object.keys(planningPresetConfigs).map((id) => <button type="button" key={id} className={presetId === id ? 'active' : ''} onClick={() => applyPreset(id)}><strong><MathText>{text.presetItems[id].title}</MathText></strong><small><MathText>{text.presetItems[id].note}</MathText></small></button>)}</div>

      <div className="planning-controls">
        <label><span><MathText>{text.gamma}</MathText><output>{gamma.toFixed(2)}</output></span><input type="range" min="0.5" max="0.95" step="0.05" value={gamma} onChange={(event) => customize(() => setGamma(Number(event.target.value)))} /></label>
        <label><span>{text.noise}<output>{noise.toFixed(2)}</output></span><input type="range" min="0" max="0.4" step="0.1" value={noise} onChange={(event) => customize(() => setNoise(Number(event.target.value)))} /></label>
        <label><span>{text.truncation}<output>j={truncation}</output></span><input type="range" min="1" max="10" step="1" value={truncation} onChange={(event) => customize(() => setTruncation(Number(event.target.value)))} /></label>
        <label><span>{text.checkpoint}<output>k={activeCheckpoint}</output></span><input type="range" min="0" max={maxCheckpoint} step="1" value={activeCheckpoint} onChange={(event) => setCheckpoint(Number(event.target.value))} /></label>
      </div>

      <div className="planning-main-stage">
        <section className="planning-chart-panel">
          <header><span>{text.residualChart}</span><small>{text.chartHint}</small></header>
          <div className="planning-legend"><span><i className="legend-vi" />{text.vi}</span><span><i className="legend-tpi" />{text.tpi}</span><span><i className="legend-pi" />{text.pi}</span></div>
          <PlanningCurve results={results} checkpoints={checkpoints} text={text} />
        </section>
        <section className="planning-result-panel">
          <header><span>{text.sameLimit}</span><small><MathFormula latex={String.raw`\max\lvert V-V^*\rvert`} /></small></header>
          <div className="planning-result-table">
            {algorithmOrder.map((id) => <div key={id}><strong>{text[id]}</strong><span>{results[id].backups}<small>{text.backups}</small></span><span>{results[id].policyUpdates}<small>{text.policyUpdates}</small></span><span>{formatScientific(results[id].maxValueError)}<small>{text.finalError}</small></span></div>)}
          </div>
        </section>
      </div>

      <section className="planning-propagation">
        <header><span>{text.propagation}</span><small>{text.selectedCheckpoint}: k={activeCheckpoint} · {text.mapHint}</small></header>
        <div>{<PlanningMap step={checkpoints.vi} label={text.viShort} text={text} />}{<PlanningMap step={checkpoints.tpi} label={`${text.tpiShort} (${truncation})`} text={text} />}{<PlanningMap step={checkpoints.pi} label={text.piShort} text={text} />}</div>
      </section>
    </section>
  )
}
