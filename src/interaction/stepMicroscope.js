import { useRef, useState } from 'react'

export const STEP_PHASES = Object.freeze(['select', 'action', 'target', 'assign'])

export function phaseForFocus(focusTerm) {
  if (focusTerm === 'state') return 'select'
  if (focusTerm === 'action') return 'action'
  return 'target'
}

export function createStepRecord({ selection, outcome }) {
  if (!outcome || !Array.isArray(outcome.values)) {
    throw new Error('Step outcome must include the next values array')
  }
  const record = {
    selection,
    before: outcome.before,
    expectation: outcome.expectation ?? null,
    target: outcome.target,
    after: outcome.after ?? outcome.target,
    residual: outcome.residual,
  }
  ;['before', 'target', 'after', 'residual'].forEach((field) => {
    if (!Number.isFinite(record[field])) throw new Error(`Step outcome ${field} must be finite`)
  })
  return record
}

export function useStepMicroscope({
  initialSelection,
  initialValues,
  initialFocus = 'target',
  maxHistory = 30,
  maxTrace = 40,
}) {
  const makeInitialValues = () => typeof initialValues === 'function' ? initialValues() : initialValues
  const [selected, setSelected] = useState(initialSelection)
  const [values, setValues] = useState(makeInitialValues)
  const valuesRef = useRef(values)
  const [history, setHistory] = useState([])
  const [residuals, setResiduals] = useState([])
  const [lastStep, setLastStep] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [focusTerm, setFocusTerm] = useState(initialFocus)
  const [phase, setPhase] = useState(phaseForFocus(initialFocus))

  const reset = ({
    values: nextValues = makeInitialValues(),
    selection = selected,
    residuals: nextResiduals = [],
    focusTerm: nextFocus = initialFocus,
    phase: nextPhase = phaseForFocus(nextFocus),
  } = {}) => {
    valuesRef.current = nextValues
    setValues(nextValues)
    setSelected(selection)
    setHistory([])
    setResiduals(nextResiduals.slice(-maxTrace))
    setLastStep(null)
    setPlaying(false)
    setFocusTerm(nextFocus)
    setPhase(nextPhase)
  }

  const select = (selection, { focusTerm: nextFocus = 'state', phase: nextPhase = phaseForFocus(nextFocus) } = {}) => {
    setSelected(selection)
    setFocusTerm(nextFocus)
    setPhase(nextPhase)
    setLastStep(null)
    setPlaying(false)
  }

  const focus = (nextFocus, nextPhase = phaseForFocus(nextFocus)) => {
    setFocusTerm(nextFocus)
    setPhase(nextPhase)
  }

  const commit = ({ selection = selected, outcome }) => {
    const currentValues = valuesRef.current
    const record = createStepRecord({ selection, outcome })
    valuesRef.current = outcome.values
    setValues(outcome.values)
    setSelected(selection)
    setHistory((items) => [...items.slice(-(maxHistory - 1)), { values: currentValues, selection }])
    setResiduals((items) => [...items.slice(-(maxTrace - 1)), Math.abs(record.residual)])
    setLastStep(record)
    setPhase('assign')
    return record
  }

  const undo = () => {
    const previous = history.at(-1)
    if (!previous) return false
    valuesRef.current = previous.values
    setValues(previous.values)
    setSelected(previous.selection)
    setHistory((items) => items.slice(0, -1))
    setResiduals((items) => items.slice(0, -1))
    setLastStep(null)
    setPlaying(false)
    setPhase('target')
    return true
  }

  return {
    selected,
    values,
    residuals,
    lastStep,
    playing,
    focusTerm,
    phase,
    canUndo: history.length > 0,
    currentValues: () => valuesRef.current,
    reset,
    select,
    focus,
    commit,
    undo,
    setPlaying,
    setPhase,
  }
}
