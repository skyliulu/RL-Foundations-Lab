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
  tracePolicyPath,
} from '../engine/gridworld'
import { bellmanPresetConfigs } from '../content/bellman'
import { phaseForFocus, useStepMicroscope } from '../interaction/stepMicroscope'
import MathFormula from './MathFormula'
import MathText from './MathText'

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
  const width = 720
  const height = 76
  const data = values
  const max = Math.max(...data, 0.05)
  const plotLeft = 6
  const plotRight = width - 6
  const coordinates = data.map((value, index) => ({
    x: data.length === 1 ? plotLeft : plotLeft + index / (data.length - 1) * (plotRight - plotLeft),
    y: height - value / max * (height - 12) - 6,
  }))
  const points = coordinates.map(({ x, y }) => `${x},${y}`).join(' ')
  return (
    <svg className="residual-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <line className="residual-guide" x1="0" y1={height / 2} x2={width} y2={height / 2} />
      <line x1="0" y1={height - 6} x2={width} y2={height - 6} />
      {points && <polyline points={points} />}
      {coordinates.length > 0 && (
        <circle className="residual-latest" cx={coordinates.at(-1).x} cy={coordinates.at(-1).y} r="3.2" />
      )}
    </svg>
  )
}

function DiscountValueGrid({ values, selected, maxAbs, label, onSelect }) {
  return (
    <figure className="discount-value-figure">
      <figcaption><MathText>{label}</MathText></figcaption>
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
              aria-label={`${label} ${stateLabel(state)} ${value.toFixed(3)}`}
              aria-selected={isSame(state, selected)}
              onClick={() => onSelect(state)}
            >
              {value.toFixed(1)}
            </button>
          )
        })}
      </div>
    </figure>
  )
}

function BellmanTrajectoryOverlay({ states }) {
  const points = states
    .map((state) => `${(state.col + 0.5) * 20},${(state.row + 0.5) * 20}`)
    .join(' ')
  const last = states.at(-1)
  const closesLoop = states.slice(0, -1).some((state) => isSame(state, last))

  return (
    <svg className="bellman-trajectory-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {states.length > 1 && <polyline points={points} />}
      {states.map((state, index) => (
        <circle
          className={index === 0 ? 'is-start' : index === states.length - 1 ? 'is-current' : ''}
          cx={(state.col + 0.5) * 20}
          cy={(state.row + 0.5) * 20}
          r={index === 0 || index === states.length - 1 ? 2.3 : 1.25}
          key={`${state.row}-${state.col}-${index}`}
        />
      ))}
      {closesLoop && (
        <circle
          className="is-loop"
          cx={(last.col + 0.5) * 20}
          cy={(last.row + 0.5) * 20}
          r="4"
        />
      )}
    </svg>
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
    maxTrace: 75,
  })
  const {
    selected,
    values,
    residuals,
    stepCount,
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
  const policyPath = useMemo(() => tracePolicyPath({
    start: selected,
    values,
    gamma,
    noise,
    policy,
    actionOverride,
  }), [selected, values, gamma, noise, policy, actionOverride])

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
      : { values: createInitialValues() }
    setGamma(config.gamma)
    setNoise(config.noise)
    setPolicy(config.policy)
    microscope.reset({
      values: seeded.values,
      selection: config.selected,
      residuals: [],
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
        <p className="preset-purpose">
          <strong>{m.presetLabel}</strong>
          <MathText>{m.presetPurpose}</MathText>
        </p>
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
          <MathText>{activePresetContent?.observation || m.freeObservation}</MathText>
        </p>
      </div>

      <div className={`bellman-stage ${isDiscountComparison ? 'is-comparing' : ''}`}>
        <section className={`lab-panel grid-panel ${focusTerm === 'state' ? 'is-focused' : ''}`}>
          <header><span>{c.grid}</span><small>{policy === 'fixed' ? c.fixed : c.greedy}</small></header>
          <div className="bellman-grid-visual">
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
                    aria-label={`${stateLabel(state)} ${active ? c.currentState : ''}`}
                    aria-selected={active}
                    onClick={() => selectState(state)}
                  >
                    {isSame(state, START) && <span className="start-mark">S</span>}
                    {forbidden && <strong className="cell-reward">−1</strong>}
                    {goal && <strong className="cell-reward">+1</strong>}
                    <span className="policy-arrow">{arrowFor(state, policy, values, gamma, noise)}</span>
                    {active && <span className="cell-tag"><MathFormula latex={String.raw`s`} /></span>}
                    {next && !active && <span className="cell-tag next-tag"><MathFormula latex={String.raw`s'`} /></span>}
                  </button>
                )
              })}
            </div>
            <BellmanTrajectoryOverlay states={policyPath} />
          </div>
          <div className="grid-legend">
            <span><i className="legend-swatch goal-swatch" />{lang === 'zh' ? '进入目标 +1' : 'enter target +1'}</span>
            <span><i className="legend-swatch forbidden-swatch" />{lang === 'zh' ? '进入禁区 −1' : 'enter forbidden −1'}</span>
            <span><i className="legend-boundary" />{lang === 'zh' ? '越界 −1 / 原地' : 'boundary −1 / stay'}</span>
            <span><i className="legend-outline" /><MathFormula latex={String.raw`s`} /></span>
            <span><i className="legend-outline next-outline" /><MathFormula latex={String.raw`s'`} /></span>
            <span><i className="legend-policy-path" />{noise === 0 ? m.policyPath : m.mostLikelyPath}</span>
          </div>
          <p className="bellman-path-note">{noise === 0 ? m.policyPathNote : m.mostLikelyPathNote}</p>
        </section>

        <section className={`lab-panel value-panel ${focusTerm === 'future' || focusTerm === 'gamma' ? 'is-focused' : ''}`}>
          <header><span><MathText>{c.value}</MathText></span><small>{isDiscountComparison ? m.matchedComparison : m.currentEstimate}</small></header>
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
                <strong><MathFormula latex={String.raw`${discountComparison.baseline.values[selectedIndex].toFixed(2)}\rightarrow${discountComparison.comparison.values[selectedIndex].toFixed(2)}`} /></strong>
                <small><MathFormula latex={String.raw`\Delta=${discountComparison.deltas[selectedIndex].toFixed(2)}`} /></small>
              </div>
              <div className="course-benchmark">
                <span>{m.courseReproduced}</span>
                <strong><MathFormula latex={String.raw`\max\lvert\mathrm{error}\rvert=${discountComparison.courseMaxError.toFixed(3)}`} /></strong>
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
                      aria-label={`${stateLabel(state)} ${value.toFixed(3)}`}
                      aria-selected={isSame(state, selected)}
                      onClick={() => selectState(state)}
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
            <div><dt>{c.currentState} <MathFormula latex={String.raw`s`} /></dt><dd><button type="button" aria-pressed={focusTerm === 'state'} onClick={() => focus('state')}>{stateLabel(selected)}</button></dd></div>
            <div><dt>{c.action} <MathFormula latex={String.raw`a`} /></dt><dd><button type="button" className="action-value" aria-pressed={focusTerm === 'action'} onClick={() => focus('action')}>{actionLabel(detail.action)}</button>{actionOverride && <small className="author-action">{m.presetAction}</small>}</dd></div>
            <div><dt>{c.reward} <MathFormula latex={String.raw`R`} /></dt><dd><button type="button" className="reward-value" aria-pressed={focusTerm === 'reward'} onClick={() => focus('reward')}>{primary?.reward.toFixed(2)}</button></dd></div>
            <div><dt>{c.nextState} <MathFormula latex={String.raw`s'`} /></dt><dd><button type="button" aria-pressed={focusTerm === 'future'} onClick={() => focus('future')}>{primary ? stateLabel(primary.state) : '—'}</button></dd></div>
          </dl>
          <div className="formula-stack" aria-label="Bellman target">
            <div><button type="button" className={focusTerm === 'target' ? 'active-term state-term' : 'state-term'} aria-pressed={focusTerm === 'target'} onClick={() => focus('target')}><MathFormula latex={String.raw`T`} /></button><MathFormula latex={String.raw`=`} /><button type="button" className={focusTerm === 'reward' ? 'active-term reward-term' : 'reward-term'} aria-pressed={focusTerm === 'reward'} onClick={() => focus('reward')}><MathFormula latex={String.raw`R`} /></button><MathFormula latex={String.raw`+`} /><button type="button" className={focusTerm === 'gamma' ? 'active-term gamma-term' : 'gamma-term'} aria-pressed={focusTerm === 'gamma'} onClick={() => focus('gamma')}><MathFormula latex={String.raw`\gamma`} /></button><button type="button" className={focusTerm === 'future' ? 'active-term future-term' : 'future-term'} aria-pressed={focusTerm === 'future'} onClick={() => focus('future')}><MathFormula latex={String.raw`V(s')`} /></button></div>
            {noise === 0 ? (
              <MathFormula block className="substitution" latex={String.raw`=${primary?.reward.toFixed(2)}+${gamma.toFixed(2)}\times ${primaryNextValue.toFixed(2)}`} />
            ) : (
              <MathFormula block className="substitution" latex={String.raw`=\sum_{s'}p(s'\mid s,a)\left[R+\gamma V(s')\right]`} />
            )}
            <strong className="target-value"><MathFormula latex={String.raw`=${detail.target.toFixed(3)}`} /></strong>
          </div>
          <div className="change-row">
            <span><small>{c.before}</small>{displayedUpdate.before.toFixed(3)}</span>
            <b>→</b>
            <span><small>{lastUpdate && isSame(lastUpdate.selection, selected) ? c.after : m.ifApplied}</small>{displayedUpdate.after.toFixed(3)}</span>
          </div>
          <p className="single-backup-note"><MathText>{`${m.singleBackupNote} ${stateLabel(selected)}。`}</MathText></p>
          <div className="residual-readout"><span>{c.residual}</span><strong>{Math.abs(displayedUpdate.residual).toFixed(3)}</strong></div>
        </aside>
      </div>

      {detail.transitions.length > 1 && (
        <section className="successor-contributions" aria-label={lang === 'zh' ? '后继状态的期望贡献' : 'Expected successor contributions'}>
          <header>
            <span>{m.contributions}</span>
            <small>{m.contributionHint}</small>
          </header>
          <div className="successor-contribution-scroll">
            <div className="successor-contribution-grid" role="list">
              {detail.transitions.map((transition) => {
                const nextValue = values[indexOf(transition.state)] || 0
                const oneStepTarget = transition.reward + gamma * nextValue
                const contribution = transition.probability * oneStepTarget
                return (
                  <div role="listitem" key={`${stateLabel(transition.state)}-${transition.reward}`}>
                    <strong>{stateLabel(transition.state)}</strong>
                    <span><MathFormula latex={String.raw`p=${transition.probability.toFixed(2)}`} /></span>
                    <span><MathFormula latex={String.raw`R+\gamma V=${oneStepTarget.toFixed(3)}`} /></span>
                    <b><MathFormula latex={String.raw`p\,[R+\gamma V]=${contribution.toFixed(3)}`} /></b>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

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
              <span>{number}</span><code><MathText>{label}</MathText></code>
            </button>
          ))}
        </div>
      </div>

      <div className="control-deck">
        <label className={focusTerm === 'gamma' ? 'is-focused' : ''}>
          <span><MathText>{c.gamma}</MathText><output>{gamma.toFixed(2)}</output></span>
          <input type="range" min="0" max="0.99" step="0.01" value={gamma} onChange={(event) => changeParameter(setGamma, Number(event.target.value))} />
        </label>
        <label>
          <span>{c.noise}<output>{noise.toFixed(2)}</output></span>
          <input type="range" min="0" max="0.4" step="0.05" value={noise} onChange={(event) => changeParameter(setNoise, Number(event.target.value))} />
        </label>
        <fieldset className="segmented-control">
          <legend>{c.policy}</legend>
          <button type="button" className={policy === 'fixed' ? 'active' : ''} aria-pressed={policy === 'fixed'} onClick={() => changeParameter(setPolicy, 'fixed')}>{c.fixed}</button>
          <button type="button" className={policy === 'greedy' ? 'active' : ''} aria-pressed={policy === 'greedy'} onClick={() => changeParameter(setPolicy, 'greedy')}>{c.greedy}</button>
        </fieldset>
        <div className="step-actions">
          <button type="button" onClick={microscope.undo} disabled={!microscope.canUndo}>← {c.previous}</button>
          <button type="button" className="primary-action" onClick={() => performStep()}>{c.step}</button>
          <button type="button" aria-pressed={playing} onClick={togglePlaying}>{playing ? `Ⅱ ${c.pause}` : `▷ ${c.play}`}</button>
          <button type="button" onClick={() => resetValues({ clearPreset: true })}>↻ {c.reset}</button>
        </div>
        <div className="trace-box">
          <div className="trace-copy">
            <span>{m.localResidual} <strong>{residuals.at(-1)?.toFixed(3) || '—'}</strong></span>
            <small><MathText>{m.residualHint}</MathText></small>
          </div>
          <ResidualTrace values={residuals} label={m.residualTraceLabel} />
          <div className="trace-meta">
            <small>{c.backups}: {stepCount} · {c.sweeps}: {completedSweeps}</small>
            <small><MathText>{m.residualConvergence}</MathText></small>
          </div>
        </div>
      </div>
    </section>
  )
}
