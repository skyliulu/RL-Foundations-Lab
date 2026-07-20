import { useMemo, useState } from 'react'
import {
  ACTION_NAMES,
  ACTIONS,
  GOAL,
  START,
  allStates,
  fixedPolicyAction,
  indexOf,
  isForbidden,
  isGoal,
  isSame,
  keyOf,
  transitionsFor,
} from '../engine/gridworld'
import MathFormula from './MathFormula'
import MathText from './MathText'

const actionCopy = {
  zh: { up: '上', right: '右', down: '下', left: '左', stay: '停留' },
  en: { up: 'Up', right: 'Right', down: 'Down', left: 'Left', stay: 'Stay' },
}

function labelState(state, prefix = 's') {
  return `${prefix}${indexOf(state) + 1}`
}

function rewardReason(transition, from, text) {
  if (transition.reward === 1) return text.target
  if (transition.reward === -1 && isForbidden(transition.state)) return text.accessible
  if (transition.reward === -1 && isSame(transition.state, from)) return text.boundary
  return text.normal
}

export default function CourseWorldExplorer({ lang, content }) {
  const text = content.explorer
  const [current, setCurrent] = useState(START)
  const [action, setAction] = useState('right')
  const [noise, setNoise] = useState(0)
  const [showPolicy, setShowPolicy] = useState(true)
  const [trajectory, setTrajectory] = useState([])

  const branches = useMemo(() => (
    transitionsFor(current, action, noise).sort((left, right) => right.probability - left.probability)
  ), [current, action, noise])
  const expectedReward = branches.reduce((sum, branch) => sum + branch.probability * branch.reward, 0)
  const branchKeys = new Set(branches.map((branch) => keyOf(branch.state)))
  const policyAction = fixedPolicyAction(current)
  const totalReward = trajectory.reduce((sum, step) => sum + step.reward, 0)

  function restartAt(state = START) {
    setCurrent(state)
    setAction(fixedPolicyAction(state))
    setTrajectory([])
  }

  function commit(branch) {
    setTrajectory((steps) => [...steps, {
      id: `${steps.length}-${keyOf(current)}-${action}-${keyOf(branch.state)}`,
      from: current,
      action,
      reward: branch.reward,
      probability: branch.probability,
      to: branch.state,
    }])
    setCurrent(branch.state)
    setAction(fixedPolicyAction(branch.state))
  }

  return (
    <section className="world-explorer" aria-label={content.figure}>
      <header className="world-explorer-heading">
        <div><span className="figure-number">{content.figure}</span><p><MathText>{content.instruction}</MathText></p></div>
        <span className="method-badge">MDP · <MathFormula latex={String.raw`\mathcal S\times\mathcal A\rightarrow\mathcal R\times\mathcal S'`} /></span>
      </header>

      <div className="mdp-interface-strip" aria-label={text.tupleTitle}>
        <div><span>S</span><strong>{text.stateSpace}</strong><small>{labelState(current, text.statePrefix)}</small></div>
        <div><span>A</span><strong>{text.actionSpace}</strong><small>{ACTIONS[action].arrow} {actionCopy[lang][action]}</small></div>
        <div><span>P</span><strong><MathFormula latex={String.raw`p(s'\mid s,a)`} /></strong><small>{branches.length} {text.possible}</small></div>
        <div><span>R</span><strong><MathFormula latex={String.raw`p(r\mid s,a)`} /></strong><small><MathFormula latex={String.raw`\mathbb E[r]=${expectedReward.toFixed(2)}`} /></small></div>
        <div><span><MathFormula latex={String.raw`\pi`} /></span><strong><MathFormula latex={String.raw`\pi(a\mid s)`} /></strong><small>{ACTIONS[policyAction].arrow} {actionCopy[lang][policyAction]} · 1.00</small></div>
      </div>
      <p className="mdp-interface-hint"><strong>{text.tupleTitle}</strong><MathText>{text.tupleHint}</MathText></p>

      <div className="world-explorer-stage">
        <section className="world-map-panel">
          <header><div><span>{text.world}</span><small>5 × 5 · {text.continuing}</small></div><button type="button" onClick={() => setShowPolicy((value) => !value)}>{showPolicy ? text.hidePolicy : text.showPolicy}</button></header>
          <div className="course-world-grid">
            {allStates().map((state) => {
              const selected = isSame(state, current)
              const possible = branchKeys.has(keyOf(state))
              const cellAction = fixedPolicyAction(state)
              return (
                <button
                  type="button"
                  key={keyOf(state)}
                  className={`course-world-cell${isForbidden(state) ? ' forbidden' : ''}${isGoal(state) ? ' goal' : ''}${selected ? ' current' : ''}${possible ? ' possible' : ''}`}
                  onClick={() => restartAt(state)}
                  aria-label={`${text.state} ${labelState(state, text.statePrefix)}`}
                >
                  <span className="world-state-id">{labelState(state, text.statePrefix)}</span>
                  {showPolicy && <span className="world-policy-arrow" aria-hidden="true">{ACTIONS[cellAction].arrow}</span>}
                  {isSame(state, START) && <small>{text.start}</small>}
                  {selected && <b>{text.current}</b>}
                </button>
              )
            })}
          </div>
          <div className="world-legend">
            <span><i className="legend-forbidden" />{text.forbidden} −1</span>
            <span><i className="legend-goal" />{text.goal} +1</span>
            <span><i className="legend-current" />{text.selected}</span>
            <span><i className="legend-possible" /><MathText>{text.transition}</MathText></span>
          </div>
          <p className="world-model-note">{text.clickState} · {text.noTerminal}</p>
        </section>

        <section className="world-control-panel">
          <header><span>{text.selectAction}</span><small>{labelState(current, text.statePrefix)} → ?</small></header>
          <div className="action-pad">
            {ACTION_NAMES.map((name) => (
              <button type="button" key={name} className={action === name ? 'active' : ''} onClick={() => setAction(name)}>
                <b>{ACTIONS[name].arrow}</b><span>{actionCopy[lang][name]}</span>
              </button>
            ))}
          </div>
          <button type="button" className="policy-action-button" onClick={() => setAction(policyAction)}>
            <span><MathText>{text.followPolicy}</MathText></span><strong>{ACTIONS[policyAction].arrow} {actionCopy[lang][policyAction]}</strong>
          </button>
          <label className="world-noise-control">
            <span>{text.noise}<output>{noise.toFixed(2)}</output></span>
            <input type="range" min="0" max="0.4" step="0.1" value={noise} onChange={(event) => setNoise(Number(event.target.value))} />
            <small>{noise === 0 ? text.deterministic : text.stochastic}</small>
          </label>
          <dl className="course-rules">
            <div><dt>−1</dt><dd>{text.boundary}</dd></div>
            <div><dt>−1</dt><dd>{text.accessible}</dd></div>
            <div><dt>+1</dt><dd>{text.target}</dd></div>
          </dl>
        </section>

        <section className="transition-panel">
          <header><span><MathText>{text.distribution}</MathText></span><small>{text.expectedReward}: {expectedReward.toFixed(2)}</small></header>
          <div className="transition-equation">
            <span>{labelState(current, text.statePrefix)}</span><b>{ACTIONS[action].arrow}</b><span>?</span>
          </div>
          <p className="branch-instruction">{text.chooseBranch}</p>
          <div className="transition-branches">
            {branches.map((branch) => (
              <button type="button" key={`${keyOf(branch.state)}-${branch.reward}`} onClick={() => commit(branch)}>
                <span className="branch-probability"><i style={{ width: `${branch.probability * 100}%` }} /><b>{(branch.probability * 100).toFixed(0)}%</b></span>
                <span className="branch-result"><strong>{labelState(branch.state, text.statePrefix)}</strong><em>r = {branch.reward > 0 ? '+' : ''}{branch.reward}</em></span>
                <small>{rewardReason(branch, current, text)}</small>
                <span className="branch-cta">{text.branchAction} →</span>
              </button>
            ))}
          </div>
          <p className="outcome-note">{text.outcomeNote}</p>
        </section>
      </div>

      <section className="trajectory-tape">
        <header>
          <div><span>{text.trajectory}</span><small>{trajectory.length} {text.stepCount} · {text.totalReward} {totalReward > 0 ? '+' : ''}{totalReward}</small></div>
          <button type="button" onClick={() => restartAt(START)}>{text.reset}</button>
        </header>
        <div className="trajectory-scroll">
          <span className="trajectory-state initial">{labelState(trajectory[0]?.from || current, text.statePrefix)}</span>
          {trajectory.length === 0 && <p>{text.emptyTrajectory}</p>}
          {trajectory.map((step) => (
            <div className="trajectory-step" key={step.id}>
              <span className="trajectory-action">{ACTIONS[step.action].arrow}<small>{actionCopy[lang][step.action]}</small></span>
              <span className={`trajectory-reward reward-${step.reward < 0 ? 'negative' : step.reward > 0 ? 'positive' : 'zero'}`}>{step.reward > 0 ? '+' : ''}{step.reward}<small>{(step.probability * 100).toFixed(0)}%</small></span>
              <span className="trajectory-state">{labelState(step.to, text.statePrefix)}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
