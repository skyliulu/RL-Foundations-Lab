import { useMemo, useState } from 'react'
import { ACTIONS, COURSE_REWARDS, allStates, fixedPolicyAction, indexOf, isForbidden, isGoal, isSame, keyOf } from '../engine/gridworld'
import { comparePolicyAndOptimal, inspectActionCompetition } from '../engine/optimality'
import { optimalityPresetConfigs } from '../content/optimality'
import { useStepMicroscope } from '../interaction/stepMicroscope'
import MathFormula from './MathFormula'
import ResponsiveMathFormula from './ResponsiveMathFormula'
import MathText from './MathText'

function stateLabel(state) {
  return `s${indexOf(state) + 1}`
}

function format(value) {
  return value.toFixed(2)
}

export default function OptimalitySwitch({ content }) {
  const text = content.explorer
  const baseline = optimalityPresetConfigs['operator-switch']
  const [gamma, setGamma] = useState(baseline.gamma)
  const [noise, setNoise] = useState(baseline.noise)
  const [forbiddenReward, setForbiddenReward] = useState(baseline.forbiddenReward)
  const [operator, setOperator] = useState(baseline.operator)
  const [presetId, setPresetId] = useState('operator-switch')
  const [lastOperator, setLastOperator] = useState(null)

  const rewards = useMemo(() => ({ ...COURSE_REWARDS, forbidden: forbiddenReward }), [forbiddenReward])
  const comparison = useMemo(() => comparePolicyAndOptimal({ gamma, noise, rewards }), [gamma, noise, rewards])
  const microscope = useStepMicroscope({ initialSelection: baseline.selected, initialValues: () => comparison.policy.values, initialFocus: 'action' })
  const { selected, values } = microscope
  const detail = useMemo(() => inspectActionCompetition({ state: selected, values, gamma, noise, rewards }), [selected, values, gamma, noise, rewards])
  const chosenAction = operator === 'policy' ? detail.policyAction : detail.bestActions[0]
  const chosenTarget = operator === 'policy' ? detail.policyTarget : detail.bestTarget
  const selectedIndex = indexOf(selected)
  const mapActions = useMemo(() => allStates().map((state) => {
    if (operator === 'policy') return fixedPolicyAction(state)
    return inspectActionCompetition({ state, values, gamma, noise, rewards }).bestActions[0]
  }), [operator, values, gamma, noise, rewards])
  const minAction = Math.min(...detail.actions.map((item) => item.target))
  const maxAction = Math.max(...detail.actions.map((item) => item.target))
  const span = Math.max(maxAction - minAction, 0.001)
  const stepEvidence = microscope.lastStep || { before: values[selectedIndex], target: chosenTarget, residual: chosenTarget - values[selectedIndex] }
  const choiceDiffers = !detail.bestActions.includes(detail.policyAction)
  const candidateGap = detail.bestTarget - detail.policyTarget
  const updatedIndex = microscope.lastStep ? indexOf(microscope.lastStep.selection) : -1
  const resultMessage = microscope.lastStep
    ? Math.abs(microscope.lastStep.residual) < 0.005 && lastOperator === 'policy'
      ? text.policyFixedPointResult
      : text.changedResult
    : choiceDiffers ? text.differentChoice : text.sameChoice

  function applyPreset(id) {
    const preset = optimalityPresetConfigs[id]
    setGamma(preset.gamma)
    setNoise(preset.noise)
    setForbiddenReward(preset.forbiddenReward)
    setOperator(preset.operator)
    setPresetId(id)
    setLastOperator(null)
    const nextRewards = { ...COURSE_REWARDS, forbidden: preset.forbiddenReward }
    const nextComparison = comparePolicyAndOptimal({ gamma: preset.gamma, noise: preset.noise, rewards: nextRewards })
    microscope.reset({ values: nextComparison.policy.values, selection: preset.selected, focusTerm: 'action', phase: 'action' })
  }

  function customize(callback, nextConfig) {
    setPresetId('custom')
    setLastOperator(null)
    callback()
    if (nextConfig) {
      const nextRewards = { ...COURSE_REWARDS, forbidden: nextConfig.forbiddenReward ?? forbiddenReward }
      const nextComparison = comparePolicyAndOptimal({ gamma: nextConfig.gamma ?? gamma, noise: nextConfig.noise ?? noise, rewards: nextRewards })
      microscope.reset({ values: nextComparison.policy.values, selection: selected, focusTerm: 'action', phase: 'action' })
    }
  }

  function commitBackup() {
    const before = values[selectedIndex]
    const nextValues = [...values]
    nextValues[selectedIndex] = chosenTarget
    setLastOperator(operator)
    microscope.commit({ selection: selected, outcome: { values: nextValues, before, expectation: detail.actions, target: chosenTarget, after: chosenTarget, residual: chosenTarget - before } })
  }

  function restorePolicySnapshot() {
    setLastOperator(null)
    microscope.reset({ values: comparison.policy.values, selection: selected, focusTerm: 'action', phase: 'action' })
  }

  return (
    <section className="optimality-switch" aria-label={content.figure}>
      <header className="optimality-heading">
        <div><span className="figure-number">{content.figure}</span><p><MathText>{content.instruction}</MathText></p></div>
        <div className="operator-switch" role="group" aria-label={text.chosen}>
          <button type="button" className={operator === 'policy' ? 'active' : ''} aria-pressed={operator === 'policy'} onClick={() => setOperator('policy')}>{text.policyMode}</button>
          <button type="button" className={operator === 'optimal' ? 'active' : ''} aria-pressed={operator === 'optimal'} onClick={() => setOperator('optimal')}>{text.optimalMode}</button>
        </div>
      </header>

      <div className="optimality-protocol">
        <strong>{text.protocolLabel}</strong>
        <p><MathText>{text.protocolText}</MathText></p>
      </div>

      <div className="optimality-presets">
        <span>{text.preset}</span>
        {Object.keys(optimalityPresetConfigs).map((id) => <button type="button" key={id} className={presetId === id ? 'active' : ''} aria-pressed={presetId === id} onClick={() => applyPreset(id)}><strong><MathText>{text.presetItems[id].title}</MathText></strong><small><MathText>{text.presetItems[id].note}</MathText></small></button>)}
      </div>

      <div className="optimality-controls">
        <label><span><MathText>{text.gamma}</MathText><output>{gamma.toFixed(2)}</output></span><input type="range" min="0.1" max="0.95" step="0.05" value={gamma} onChange={(event) => { const value = Number(event.target.value); customize(() => setGamma(value), { gamma: value }) }} /></label>
        <label><span>{text.noise}<output>{noise.toFixed(2)}</output></span><input type="range" min="0" max="0.4" step="0.1" value={noise} onChange={(event) => { const value = Number(event.target.value); customize(() => setNoise(value), { noise: value }) }} /></label>
        <fieldset><legend>{text.forbiddenReward}</legend><div>{[-1, -5, -10].map((reward) => <button type="button" key={reward} className={forbiddenReward === reward ? 'active' : ''} aria-pressed={forbiddenReward === reward} onClick={() => customize(() => setForbiddenReward(reward), { forbiddenReward: reward })}>{reward}</button>)}</div></fieldset>
      </div>

      <div className="optimality-metrics">
        <div><span><MathText>{`${text.policyValue}(${stateLabel(selected)})`}</MathText></span><strong>{format(comparison.policy.values[selectedIndex])}</strong></div>
        <div><span><MathText>{`${text.optimalValue}(${stateLabel(selected)})`}</MathText></span><strong>{format(comparison.optimal.values[selectedIndex])}</strong></div>
        <div><span>{text.policyGap}</span><strong>{format(comparison.gaps[selectedIndex])}</strong></div>
      </div>

      <div className="optimality-stage">
        <section className="optimality-map-panel">
          <header><div><span>{text.valueMap}</span><small><MathText>{operator === 'policy' ? text.policyOperator : text.optimalOperator}</MathText></small></div><em>{text.clickState}</em></header>
          <div className="optimality-grid">
            {allStates().map((state) => {
              const index = indexOf(state)
              return <button type="button" key={keyOf(state)} className={`${isForbidden(state) ? 'forbidden' : ''}${isGoal(state) ? ' goal' : ''}${isSame(state, selected) ? ' selected' : ''}${updatedIndex === index ? ' updated' : ''}`} aria-pressed={isSame(state, selected)} onClick={() => { setLastOperator(null); microscope.select(state, { focusTerm: 'state', phase: 'select' }) }}><span>{stateLabel(state)}</span><strong>{format(values[index])}</strong><b>{ACTIONS[mapActions[index]].arrow}</b></button>
            })}
          </div>
              <p>{text.courseWorld} · <MathFormula latex={String.raw`\gamma=${gamma.toFixed(2)}`} /> · <MathFormula latex={String.raw`r_{\mathrm{forbidden}}=${forbiddenReward}`} /></p>
        </section>

        <section className="action-competition-panel">
          <header><div><span>{text.actionCompetition}</span><small>{text.sameSnapshot}</small></div><em>{stateLabel(selected)}</em></header>
          <div className="operator-target-definition">
            <span>{text.targetDefinition}</span>
            <ResponsiveMathFormula
              block
              latex={String.raw`q_V(s,a)\coloneqq\mathbb{E}\!\left[R_{t+1}+\gamma V(S_{t+1})\mid S_t=s,A_t=a\right]`}
              narrowLatex={String.raw`\begin{aligned}q_V(s,a)&\coloneqq\mathbb{E}\!\left[R_{t+1}+\gamma V(S_{t+1})\right.\\&\qquad\left.\mid S_t=s,A_t=a\right]\end{aligned}`}
            />
          </div>
          <div className="operator-candidates">
            <article className={operator === 'policy' ? 'active' : ''}>
              <span>{text.policyCandidate}</span>
              <MathFormula block latex={String.raw`T^{\pi}V(s)=q_V\!\left(s,\pi(s)\right)`} />
              <div><strong>{ACTIONS[detail.policyAction].arrow} {text.actionLabels[detail.policyAction]}</strong><b>{format(detail.policyTarget)}</b></div>
            </article>
            <article className={operator === 'optimal' ? 'active' : ''}>
              <span>{text.optimalCandidate}</span>
              <MathFormula block latex={String.raw`T^*V(s)=\max_a q_V(s,a)`} />
              <div><strong>{ACTIONS[detail.bestActions[0]].arrow} {text.actionLabels[detail.bestActions[0]]}</strong><b>{format(detail.bestTarget)}</b></div>
            </article>
            <div className="operator-candidate-gap">
              <span>{text.candidateGap}</span>
              <MathFormula latex={String.raw`${format(candidateGap)}`} />
              <small>{choiceDiffers ? text.differentChoice : text.sameChoice}</small>
            </div>
          </div>
          <div className="action-target-list">
            {detail.actions.map((item) => {
              const isPolicy = item.action === detail.policyAction
              const isBest = detail.bestActions.includes(item.action)
              const isChosen = item.action === chosenAction
              return (
                <div key={item.action} className={`${isChosen ? 'chosen' : ''}${isBest ? ' best' : ''}`}>
                  <span className="action-name"><b>{ACTIONS[item.action].arrow}</b>{text.actionLabels[item.action]}</span>
                  <span className="action-target-bar"><i style={{ width: `${16 + ((item.target - minAction) / span) * 84}%` }} /></span>
                  <strong>{format(item.target)}</strong>
                  <small>{isPolicy ? text.fixedAction : ''}{isPolicy && isBest ? ' · ' : ''}{isBest ? (detail.bestActions.length > 1 ? text.tied : text.greedyAction) : ''}</small>
                </div>
              )
            })}
          </div>
          <footer><span>{text.chosen}</span><strong>{ACTIONS[chosenAction].arrow} {text.actionLabels[chosenAction]}</strong><small><MathText>{text.solveNote}</MathText></small></footer>
          <div className="optimality-step-actions">
            <button type="button" className="primary" onClick={commitBackup}>{operator === 'policy' ? text.applyPolicyBackup : text.applyOptimalBackup}</button>
            <button type="button" onClick={microscope.undo} disabled={!microscope.canUndo}>{text.undo}</button>
            <button type="button" onClick={restorePolicySnapshot}><MathText>{text.resetSnapshot}</MathText></button>
            <span>{text.before} <MathFormula latex={String.raw`${format(stepEvidence.before)}\rightarrow${format(stepEvidence.target)}`} /> · {text.residual} <MathFormula latex={String.raw`${format(Math.abs(stepEvidence.residual))}`} /></span>
          </div>
          <div className={`optimality-step-result${microscope.lastStep ? ' has-step' : ''}`}>
            <strong>{microscope.lastStep && Math.abs(microscope.lastStep.residual) < 0.005 && lastOperator === 'policy' ? text.policyFixedPoint : text.stepCount} · {microscope.stepCount}</strong>
            <p><MathText>{resultMessage}</MathText></p>
          </div>
        </section>
      </div>
    </section>
  )
}
