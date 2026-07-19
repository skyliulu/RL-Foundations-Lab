import { useEffect, useMemo, useRef, useState } from 'react'
import {
  GOAL,
  SIZE,
  START,
  allStates,
  arrowFor,
  backupState,
  compareDiscountHorizons,
  converge,
  createInitialValues,
  describeBackup,
  indexOf,
  isForbidden,
  isSame,
} from '../engine/gridworld'
import { bellmanPresetConfigs } from '../content/bellman'
import { phaseForFocus, useStepMicroscope } from '../interaction/stepMicroscope'

const defaultState = { row: 3, col: 1 }

function stateLabel(state) {
  return `(${state.row + 1}, ${state.col + 1})`
}

function actionLabel(action) {
  return { up: '↑', right: '→', down: '↓', left: '←', stay: '○' }[action]
}

function heatStyle(value, maxAbs) {
  if (value === null) return undefined
  const strength = Math.min(0.82, 0.08 + Math.abs(value) / Math.max(maxAbs, 0.1) * 0.72)
  return value >= 0
    ? { background: `rgba(34, 112, 139, ${strength})`, color: strength > 0.5 ? '#fffdf5' : 'inherit' }
    : { background: `rgba(182, 120, 35, ${strength * 0.75})`, color: strength > 0.58 ? '#fffdf5' : 'inherit' }
}

function ResidualTrace({ values, label }) {
  const width = 176
  const height = 62
  const data = values.length ? values : [0]
  const max = Math.max(...data, 0.05)
  const points = data.map((value, index) => {
    const x = data.length === 1 ? 0 : index / (data.length - 1) * width
    const y = height - value / max * (height - 8) - 4
    return `${x},${y}`
  }).join(' ')
  return (
    <svg className="residual-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <line x1="0" y1={height - 4} x2={width} y2={height - 4} />
      <polyline points={points} />
      {data.map((value, index) => {
        const [x, y] = points.split(' ')[index].split(',')
        return <circle key={`${index}-${value}`} cx={x} cy={y} r="2.1" />
      })}
    </svg>
  )
}

function DiscountValueGrid({ values, selected, maxAbs, label, onSelect }) {
  return (
    <figure className="discount-value-figure">
      <figcaption>{label}</figcaption>
      <div className="discount-value-board" role="grid" aria-label={label}>
        {values.map((value, index) => {
          const state = { row: Math.floor(index / SIZE), col: index % SIZE }
          return (
            <button
              type="button"
              role="gridcell"
              key={index}
              className={`${isForbidden(state) ? 'forbidden' : ''} ${isSame(state, GOAL) ? 'goal' : ''} ${isSame(state, selected) ? 'selected' : ''}`}
              style={heatStyle(value, maxAbs)}
              onClick={() => onSelect(state)}
              aria-label={`${label} ${stateLabel(state)} ${value.toFixed(3)}`}
            >
              {value.toFixed(1)}
            </button>
          )
        })}
      </div>
    </figure>
  )
}

export default function BellmanLab({ lang, text }) {
  const c = text.common
  const m = text.bellman.microscope
  const [gamma, setGamma] = useState(0.9)
  const [noise, setNoise] = useState(0)
  const [policy, setPolicy] = useState('fixed')
  const [activePreset, setActivePreset] = useState('target-propagation')
  const [actionOverride, setActionOverride] = useState(null)
  const cursorRef = useRef(0)
  const microscope = useStepMicroscope({
    initialSelection: defaultState,
    initialValues: createInitialValues,
    initialFocus: 'target',
  })
  const {
    selected,
    values,
    residuals,
    lastStep: lastUpdate,
    playing,
    focusTerm,
    phase: algorithmPhase,
  } = microscope

  const detail = useMemo(
    () => describeBackup(selected, values, gamma, noise, policy, actionOverride),
    [selected, values, gamma, noise, policy, actionOverride],
  )
  const maxAbs = Math.max(...values.map(Math.abs), 0.1)
  const discountComparison = useMemo(() => compareDiscountHorizons({ baselineGamma: 0.9, comparisonGamma: 0.5 }), [])
  const discountMaxAbs = Math.max(...discountComparison.baseline.values.map(Math.abs), ...discountComparison.comparison.values.map(Math.abs), 0.1)
  const selectedIndex = indexOf(selected)
  const isDiscountComparison = activePreset === 'discount-horizon'
  const activePresetContent = text.bellman.presets.find((preset) => preset.id === activePreset)

  const resetValues = ({ clearPreset = false } = {}) => {
    microscope.reset({ values: createInitialValues(), focusTerm: 'target', phase: 'target' })
    if (clearPreset) {
      setActivePreset(null)
      setActionOverride(null)
    }
    cursorRef.current = 0
  }

  const applyPreset = (presetId) => {
    const config = bellmanPresetConfigs[presetId]
    if (!config) return
    const seeded = config.seed === 'converged'
      ? converge({ gamma: config.gamma, noise: config.noise, optimal: config.policy === 'greedy' })
      : { values: createInitialValues(), residuals: [] }
    setGamma(config.gamma)
    setNoise(config.noise)
    setPolicy(config.policy)
    microscope.reset({
      values: seeded.values,
      selection: config.selected,
      residuals: seeded.residuals,
      focusTerm: config.focusTerm,
      phase: phaseForFocus(config.focusTerm),
    })
    setActivePreset(presetId)
    setActionOverride(config.actionOverride)
    cursorRef.current = 0
  }

  const selectState = (state) => {
    microscope.select(state)
    setActivePreset(null)
    setActionOverride(null)
  }

  const selectComparisonState = (state) => {
    microscope.select(state, { focusTerm: 'gamma', phase: 'target' })
  }

  const focus = (term) => {
    microscope.focus(term)
  }

  const changeParameter = (setter, value) => {
    resetValues({ clearPreset: true })
    setter(value)
  }

  const performStep = (state = selected) => {
    const current = microscope.currentValues()
    const outcome = backupState(state, current, gamma, noise, policy, actionOverride)
    microscope.commit({ selection: state, outcome: { ...outcome, expectation: outcome.transitions } })
  }

  useEffect(() => {
    if (!playing) return undefined
    const states = allStates()
    const timer = window.setInterval(() => {
      const state = states[cursorRef.current % states.length]
      cursorRef.current += 1
      performStep(state)
    }, 360)
    return () => window.clearInterval(timer)
  }, [playing, gamma, noise, policy, actionOverride])

  const togglePlaying = () => {
    if (!playing) {
      setActionOverride(null)
      setActivePreset(null)
      microscope.setPhase('assign')
    }
    microscope.setPlaying((value) => !value)
  }

  const primary = detail.primary
  const primaryNextValue = primary ? values[indexOf(primary.state)] || 0 : 0
  const displayedUpdate = lastUpdate && isSame(lastUpdate.selection, selected)
    ? lastUpdate
    : { before: detail.before, after: detail.target, residual: detail.residual }
  const completedSweeps = Math.floor(cursorRef.current / (SIZE * SIZE))
  const pseudocode = m.pseudocode

  return (
    <section className="experiment" aria-label={text.bellman.figure}>
      <div className="experiment-heading">
        <div>
          <span className="figure-number">{text.bellman.figure}</span>
          <p className="experiment-instruction">⌁ {text.bellman.instruction}</p>
        </div>
        <span className="method-badge">{text.bellman.exact}</span>
      </div>

      <div className="preset-workbench">
        <div className="preset-strip" role="group" aria-label={m.presetLabel}>
          {text.bellman.presets.map((preset, index) => (
            <button
              type="button"
              key={preset.id}
              className={activePreset === preset.id ? 'active' : ''}
              aria-pressed={activePreset === preset.id}
              onClick={() => applyPreset(preset.id)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {preset.title}
            </button>
          ))}
        </div>
        <p className="preset-observation">
          <strong>{m.observationLabel}</strong>
          {activePresetContent?.observation || m.freeObservation}
        </p>
      </div>

      <div className={`bellman-stage ${isDiscountComparison ? 'is-comparing' : ''}`}>
        <section className={`lab-panel grid-panel ${focusTerm === 'state' ? 'is-focused' : ''}`}>
          <header><span>{c.grid}</span><small>{policy === 'fixed' ? c.fixed : c.greedy}</small></header>
          <div className="grid-board" role="grid" aria-label={c.grid}>
            {Array.from({ length: SIZE * SIZE }, (_, index) => {
              const state = { row: Math.floor(index / SIZE), col: index % SIZE }
              const forbidden = isForbidden(state)
              const goal = isSame(state, GOAL)
              const active = isSame(state, selected)
              const next = primary && isSame(state, primary.state)
              return (
                <button
                  type="button"
                  role="gridcell"
                  key={`${state.row}-${state.col}`}
                  className={`grid-cell ${forbidden ? 'forbidden' : ''} ${goal ? 'goal' : ''} ${active ? 'selected' : ''} ${next ? 'next' : ''} ${focusTerm === 'reward' && (forbidden || goal || (active && isSame(primary?.state || state, state))) ? 'term-highlight' : ''}`}
                  onClick={() => selectState(state)}
                  aria-label={`${stateLabel(state)} ${active ? c.currentState : ''}`}
                >
                  {isSame(state, START) && <span className="start-mark">S</span>}
                  {forbidden && <strong className="cell-reward">−1</strong>}
                  {goal && <strong className="cell-reward">+1</strong>}
                  <span className="policy-arrow">{arrowFor(state, policy, values, gamma, noise)}</span>
                  {active && <span className="cell-tag">s</span>}
                  {next && !active && <span className="cell-tag next-tag">s′</span>}
                </button>
              )
            })}
          </div>
          <div className="grid-legend">
            <span><i className="legend-swatch goal-swatch" />{lang === 'zh' ? '进入目标 +1' : 'enter target +1'}</span>
            <span><i className="legend-swatch forbidden-swatch" />{lang === 'zh' ? '进入禁区 −1' : 'enter forbidden −1'}</span>
            <span><i className="legend-boundary" />{lang === 'zh' ? '越界 −1 / 原地' : 'boundary −1 / stay'}</span>
            <span><i className="legend-outline" />s</span>
            <span><i className="legend-outline next-outline" />s′</span>
          </div>
        </section>

        <section className={`lab-panel value-panel ${focusTerm === 'future' || focusTerm === 'gamma' ? 'is-focused' : ''}`}>
          <header><span>{c.value}</span><small>{isDiscountComparison ? m.matchedComparison : m.currentEstimate}</small></header>
          {isDiscountComparison ? (
            <>
              <div className="discount-compare">
                <DiscountValueGrid
                  values={discountComparison.baseline.values}
                  selected={selected}
                  maxAbs={discountMaxAbs}
                  label={m.baselineLabel}
                  onSelect={selectComparisonState}
                />
                <DiscountValueGrid
                  values={discountComparison.comparison.values}
                  selected={selected}
                  maxAbs={discountMaxAbs}
                  label={m.comparisonLabel}
                  onSelect={selectComparisonState}
                />
              </div>
              <div className="discount-selected-readout">
                <span>{stateLabel(selected)}</span>
                <strong>{discountComparison.baseline.values[selectedIndex].toFixed(2)} → {discountComparison.comparison.values[selectedIndex].toFixed(2)}</strong>
                <small>Δ {discountComparison.deltas[selectedIndex].toFixed(2)}</small>
              </div>
              <div className="course-benchmark">
                <span>{m.courseReproduced}</span>
                <strong>max |error| = {discountComparison.courseMaxError.toFixed(3)}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="value-board" role="grid" aria-label={c.value}>
                {values.map((value, index) => {
                  const state = { row: Math.floor(index / SIZE), col: index % SIZE }
                  return (
                    <button
                      type="button"
                      role="gridcell"
                      key={index}
                      className={`value-cell ${isForbidden(state) ? 'forbidden' : ''} ${isSame(state, GOAL) ? 'goal' : ''} ${isSame(state, selected) ? 'selected' : ''} ${primary && isSame(state, primary.state) ? 'next' : ''}`}
                      style={heatStyle(value, maxAbs)}
                      onClick={() => selectState(state)}
                      aria-label={`${stateLabel(state)} ${value.toFixed(3)}`}
                    >
                      {value === null ? '' : value.toFixed(2)}
                    </button>
                  )
                })}
              </div>
              <div className="heat-scale"><span>{(-maxAbs).toFixed(2)}</span><i /><span>{maxAbs.toFixed(2)}</span></div>
              <div className="propagation-note">{lang === 'zh' ? '涟漪表示新价值将在后续 backup 中继续传播' : 'Ripples show how later backups propagate the new value'}</div>
            </>
          )}
        </section>

        <aside className={`lab-panel update-panel focus-${focusTerm}`}>
          <header><span>{c.update}</span><small>{m.termByTerm}</small></header>
          <dl className="update-list">
            <div><dt>{c.currentState} s</dt><dd><button onClick={() => focus('state')}>{stateLabel(selected)}</button></dd></div>
            <div><dt>{c.action} a</dt><dd><button className="action-value" onClick={() => focus('action')}>{actionLabel(detail.action)}</button>{actionOverride && <small className="author-action">{m.presetAction}</small>}</dd></div>
            <div><dt>{c.reward} R</dt><dd><button className="reward-value" onClick={() => focus('reward')}>{primary?.reward.toFixed(2)}</button></dd></div>
            <div><dt>{c.nextState} s′</dt><dd><button onClick={() => focus('future')}>{primary ? stateLabel(primary.state) : '—'}</button></dd></div>
          </dl>
          <div className="formula-stack" aria-label="Bellman target">
            <div><button className={focusTerm === 'target' ? 'active-term state-term' : 'state-term'} onClick={() => focus('target')}>T</button> = <button className={focusTerm === 'reward' ? 'active-term reward-term' : 'reward-term'} onClick={() => focus('reward')}>R</button> + <button className={focusTerm === 'gamma' ? 'active-term gamma-term' : 'gamma-term'} onClick={() => focus('gamma')}>γ</button><button className={focusTerm === 'future' ? 'active-term future-term' : 'future-term'} onClick={() => focus('future')}>V(s′)</button></div>
            {noise === 0 ? (
              <div className="substitution">= <span>{primary?.reward.toFixed(2)}</span> + <span>{gamma.toFixed(2)}</span> × <span>{primaryNextValue.toFixed(2)}</span></div>
            ) : (
              <div className="substitution">= Σ p(s′|s,a)[R + γV(s′)]</div>
            )}
            <strong className="target-value">= {detail.target.toFixed(3)}</strong>
          </div>
          {detail.transitions.length > 1 && (
            <div className="contribution-list" aria-label={lang === 'zh' ? '后继状态贡献' : 'Successor contributions'}>
              <strong>{m.contributions}</strong>
              {detail.transitions.map((transition) => {
                const nextValue = values[indexOf(transition.state)] || 0
                const contribution = transition.probability * (transition.reward + gamma * nextValue)
                return (
                  <div key={`${stateLabel(transition.state)}-${transition.reward}`}>
                    <span>{transition.probability.toFixed(2)} × ({transition.reward.toFixed(1)} + {gamma.toFixed(2)} × {nextValue.toFixed(2)})</span>
                    <b>{contribution.toFixed(3)}</b>
                  </div>
                )
              })}
            </div>
          )}
          <div className="change-row">
            <span><small>{c.before}</small>{displayedUpdate.before.toFixed(3)}</span>
            <b>→</b>
            <span><small>{lastUpdate && isSame(lastUpdate.selection, selected) ? c.after : m.ifApplied}</small>{displayedUpdate.after.toFixed(3)}</span>
          </div>
          <div className="residual-readout"><span>{c.residual}</span><strong>{Math.abs(displayedUpdate.residual).toFixed(3)}</strong></div>
        </aside>
      </div>

      <div className="algorithm-sync">
        <header>
          <span>{m.pseudocodeTitle}</span>
          <small>{m.pseudocodeInstruction}</small>
        </header>
        <div className="pseudocode-lines">
          {pseudocode.map(({ id: phase, number, label }) => (
            <button
              type="button"
              key={phase}
              className={algorithmPhase === phase ? 'active' : ''}
              aria-pressed={algorithmPhase === phase}
              onClick={() => phase === 'select' ? focus('state') : phase === 'action' ? focus('action') : phase === 'target' ? focus('target') : microscope.setPhase('assign')}
            >
              <span>{number}</span><code>{label}</code>
            </button>
          ))}
        </div>
      </div>

      <div className="control-deck">
        <label className={focusTerm === 'gamma' ? 'is-focused' : ''}>
          <span>{c.gamma}<output>{gamma.toFixed(2)}</output></span>
          <input type="range" min="0" max="0.99" step="0.01" value={gamma} onChange={(event) => changeParameter(setGamma, Number(event.target.value))} />
        </label>
        <label>
          <span>{c.noise}<output>{noise.toFixed(2)}</output></span>
          <input type="range" min="0" max="0.4" step="0.05" value={noise} onChange={(event) => changeParameter(setNoise, Number(event.target.value))} />
        </label>
        <fieldset className="segmented-control">
          <legend>{c.policy}</legend>
          <button type="button" className={policy === 'fixed' ? 'active' : ''} onClick={() => changeParameter(setPolicy, 'fixed')}>{c.fixed}</button>
          <button type="button" className={policy === 'greedy' ? 'active' : ''} onClick={() => changeParameter(setPolicy, 'greedy')}>{c.greedy}</button>
        </fieldset>
        <div className="step-actions">
          <button type="button" onClick={microscope.undo} disabled={!microscope.canUndo}>← {c.previous}</button>
          <button type="button" className="primary-action" onClick={() => performStep()}>{c.step}</button>
          <button type="button" onClick={togglePlaying}>{playing ? `Ⅱ ${c.pause}` : `▷ ${c.play}`}</button>
          <button type="button" onClick={() => resetValues({ clearPreset: true })}>↻ {c.reset}</button>
        </div>
        <div className="trace-box">
          <span>{c.residual} <strong>{residuals.at(-1)?.toFixed(3) || '—'}</strong></span>
          <ResidualTrace values={residuals} label={c.residual} />
          <small>{c.backups}: {residuals.length} · {c.sweeps}: {completedSweeps}</small>
        </div>
      </div>
    </section>
  )
}
