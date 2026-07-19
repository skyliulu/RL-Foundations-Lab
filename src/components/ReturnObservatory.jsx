import { useMemo, useState } from 'react'
import { ACTIONS, allStates, indexOf, isForbidden, isGoal, isSame, keyOf } from '../engine/gridworld'
import { estimateStateValue } from '../engine/returns'
import { returnPresetConfigs } from '../content/returns'

const sampleOptions = [1, 4, 8, 32]

function stateLabel(state, prefix) {
  return `${prefix}${indexOf(state) + 1}`
}

function formatValue(value) {
  return Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(3)
}

function ValueChart({ result, selectedIndex, onSelect, text }) {
  const width = 620
  const height = 224
  const margin = { top: 20, right: 24, bottom: 34, left: 48 }
  const values = [...result.samples.map((sample) => sample.discountedReturn), ...result.runningMeans, result.exact]
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const padding = Math.max((rawMax - rawMin) * 0.16, 0.35)
  const min = rawMin - padding
  const max = rawMax + padding
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const x = (index) => margin.left + (index / Math.max(result.samples.length - 1, 1)) * plotWidth
  const y = (value) => margin.top + ((max - value) / (max - min)) * plotHeight
  const line = result.runningMeans.map((value, index) => `${x(index)},${y(value)}`).join(' ')
  const ticks = [max, (max + min) / 2, min]

  return (
    <svg className="value-estimate-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="value-chart-title value-chart-desc">
      <title id="value-chart-title">{text.valueLens}</title>
      <desc id="value-chart-desc">{text.clickSample}</desc>
      {ticks.map((tick) => <g key={tick}><line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} className="value-grid-line" /><text x={margin.left - 7} y={y(tick) + 4} textAnchor="end">{formatValue(tick)}</text></g>)}
      <line x1={margin.left} x2={width - margin.right} y1={y(result.exact)} y2={y(result.exact)} className="exact-value-line" />
      <text x={width - margin.right} y={y(result.exact) - 7} textAnchor="end" className="exact-value-label">{text.exact} {formatValue(result.exact)}</text>
      {result.runningMeans.length > 1 && <polyline points={line} className="running-mean-line" />}
      {result.samples.map((sample, index) => (
        <g key={sample.seed} onClick={() => onSelect(index)} className={index === selectedIndex ? 'selected-sample-point' : 'sample-point'}>
          <circle cx={x(index)} cy={y(sample.discountedReturn)} r={index === selectedIndex ? 6 : 4} />
          {index === selectedIndex && <text x={x(index)} y={y(sample.discountedReturn) - 10} textAnchor="middle">G={formatValue(sample.discountedReturn)}</text>}
        </g>
      ))}
      <text x={margin.left + plotWidth / 2} y={height - 7} textAnchor="middle">{text.sampleAxis}</text>
    </svg>
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

  const result = useMemo(() => estimateStateValue({ start, gamma, noise, sampleCount }), [start, gamma, noise, sampleCount])
  const selectedIndex = Math.min(selectedRun, result.samples.length - 1)
  const sample = result.samples[selectedIndex]
  const visibleSteps = sample.steps.slice(0, 14)
  const maxContribution = Math.max(...visibleSteps.map((step) => Math.abs(step.contribution)), 0.001)
  const error = result.mean - result.exact

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
        <div><span className="figure-number">{content.figure}</span><p>{content.instruction}</p></div>
        <div className="return-mode-switch" role="group" aria-label={text.valueLens}>
          <button type="button" className={mode === 'trajectory' ? 'active' : ''} onClick={() => setMode('trajectory')}>{text.modeTrajectory}</button>
          <button type="button" className={mode === 'value' ? 'active' : ''} onClick={() => setMode('value')}>{text.modeValue}</button>
        </div>
      </header>

      <div className="return-presets">
        <span>{text.preset}</span>
        {Object.keys(returnPresetConfigs).map((id) => (
          <button type="button" key={id} className={presetId === id ? 'active' : ''} onClick={() => applyPreset(id)}>
            <strong>{text.presetItems[id].title}</strong><small>{text.presetItems[id].note}</small>
          </button>
        ))}
      </div>

      <div className="return-control-row">
        <label><span>{text.gamma}<output>{gamma.toFixed(2)}</output></span><input type="range" min="0.1" max="0.95" step="0.05" value={gamma} onChange={(event) => customize(() => setGamma(Number(event.target.value)))} /></label>
        <label><span>{text.noise}<output>{noise.toFixed(2)}</output></span><input type="range" min="0" max="0.4" step="0.1" value={noise} onChange={(event) => customize(() => setNoise(Number(event.target.value)))} /></label>
        <fieldset><legend>{text.sampleCount}</legend><div>{sampleOptions.map((count) => <button type="button" key={count} className={sampleCount === count ? 'active' : ''} onClick={() => customize(() => { setSampleCount(count); setSelectedRun(0) })}>{count}</button>)}</div></fieldset>
      </div>

      <div className="return-metrics">
        <div><span>{text.exact}</span><strong>{formatValue(result.exact)}</strong><small>{text.fixedPolicy}</small></div>
        <div><span>{text.estimate}</span><strong>{formatValue(result.mean)}</strong><small>n = {sampleCount}</small></div>
        <div><span>{text.error}</span><strong className={Math.abs(error) > 0.2 ? 'warn' : ''}>{error > 0 ? '+' : ''}{formatValue(error)}</strong><small>{noise === 0 ? text.deterministic : text.stochastic}</small></div>
      </div>

      <div className={`return-stage mode-${mode}`}>
        <section className="return-world-panel">
          <header><span>{text.startState}</span><small>{text.chooseState}</small></header>
          <div className="return-world-grid">
            {allStates().map((state) => (
              <button type="button" key={keyOf(state)} className={`${isForbidden(state) ? 'forbidden' : ''}${isGoal(state) ? ' goal' : ''}${isSame(state, start) ? ' selected' : ''}`} onClick={() => customize(() => { setStart(state); setSelectedRun(0) })}>
                <span>{stateLabel(state, text.statePrefix)}</span>
                <strong>{isSame(state, start) ? formatValue(result.exact) : ''}</strong>
              </button>
            ))}
          </div>
          <p>{isGoal(start) ? text.targetContinuing : `${text.fixedPolicy} · ${text.courseBaseline}`}</p>
          <dl className="return-readout">
            <div><dt>{text.selectedRun}</dt><dd>#{selectedIndex + 1}</dd></div>
            <div><dt>{text.seed}</dt><dd>{sample.seed}</dd></div>
            <div><dt>{text.return}</dt><dd>{formatValue(sample.discountedReturn)}</dd></div>
            <div><dt>{text.remainingBound}</dt><dd>≤ {formatValue(sample.tailBound)}</dd></div>
          </dl>
        </section>

        {mode === 'trajectory' ? (
          <section className="return-tape-panel">
            <header><span>{text.trajectoryTape}</span><small>{text.visibleSteps}</small></header>
            <div className="return-formula-live"><strong>G₀</strong> = {visibleSteps.map((step, index) => <span key={step.time}>{index > 0 && ' + '}<b>{step.discount.toFixed(2)}</b>×{step.reward}</span>)} + …</div>
            <div className="return-step-table">
              <div className="return-step-head"><span>t</span><span>sₜ → aₜ → sₜ₊₁</span><span>r</span><span>γᵗ</span><span>{text.contribution}</span></div>
              {visibleSteps.map((step) => (
                <div key={step.time} className={step.reward !== 0 ? 'reward-step' : ''}>
                  <span>{step.time}</span><span>{stateLabel(step.state, text.statePrefix)} <b>{ACTIONS[step.action].arrow}</b> {stateLabel(step.nextState, text.statePrefix)}</span><span>{step.reward > 0 ? '+' : ''}{step.reward}</span><span>{step.discount.toFixed(3)}</span><span className="contribution-cell"><i style={{ width: `${Math.abs(step.contribution) / maxContribution * 100}%` }} /><b>{step.contribution.toFixed(3)}</b></span>
                </div>
              ))}
            </div>
            <footer><span>{text.runningReturn}</span><strong>{formatValue(sample.discountedReturn)}</strong><small>{text.tailNote}</small></footer>
          </section>
        ) : (
          <section className="value-lens-panel">
            <header><span>{text.valueLens}</span><small>{text.clickSample}</small></header>
            <ValueChart result={result} selectedIndex={selectedIndex} onSelect={setSelectedRun} text={text} />
            <div className="value-chart-legend"><span><i className="sample-dot" />{text.return}</span><span><i className="mean-line" />{text.runningMean}</span><span><i className="exact-line" />{text.exactLine}</span></div>
            <div className="sample-selector" aria-label={text.selectedRun}>{result.samples.map((item, index) => <button type="button" key={item.seed} className={index === selectedIndex ? 'active' : ''} onClick={() => setSelectedRun(index)} aria-label={`${text.selectedRun} ${index + 1}`}>{index + 1}</button>)}</div>
          </section>
        )}
      </div>
    </section>
  )
}
