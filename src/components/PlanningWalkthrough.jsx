import { useEffect, useState } from 'react'
import MathFormula from './MathFormula.jsx'
import MathText from './MathText.jsx'

const copy = {
  zh: {
    previous: '上一步',
    next: '下一步',
    play: '自动播放',
    pause: '暂停',
    reset: '重置',
    oldTable: '本轮只读旧表',
    newTable: '本轮逐项写入新表',
    waiting: '先保留旧表，选择“下一步”执行第一个状态 backup。',
    read: '读取',
    compare: '比较动作价值',
    choose: '写入最大值',
    state: '检查状态',
    unknown: '待写入',
    phase: '当前阶段',
    iterationPath: '完整迭代路径',
    commit: '整表提交',
    commitReady: '本轮新表已经完整，下一步把它作为下一轮旧表',
    commitExplanation: '提交不是再次计算；它只改变读写角色。下一轮的每个 backup 都会读取刚完成的整张表。',
    winner: '本状态的写入结果',
    initialPolicy: '固定初始策略',
    evaluationSweep: '固定策略评价',
    evaluationConverged: '当前策略评价收敛',
    comparePolicy: '用准确 value 比较动作',
    improvePolicy: '提交改善后的策略',
    stablePolicy: '贪心动作未改变，策略稳定',
    cycle: '策略轮次',
    sweep: '评价 sweep',
    exactValue: '准确 value',
    compareShort: '比较',
    improveShort: '改善',
    stableShort: '稳定',
    initialValues: '评价起点',
    scheduleTitle: '一套循环，三种策略改善时刻',
    scheduleHint: '拖动评价深度，观察 TPI 的改善节点怎样在 VI 与 PI 之间移动。',
    evaluation: '策略评价 sweep',
    improvement: '贪心改善',
    untilConverged: '直到评价收敛',
    exactEndpoint: '此时 TPI 与 VI 的执行顺序完全相同。',
    finiteMiddle: 'TPI 先固定策略完成有限次评价，再执行一次改善。',
  },
  en: {
    previous: 'Previous',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',
    oldTable: 'Read-only table for this sweep',
    newTable: 'New table filled one state at a time',
    waiting: 'Keep the old table fixed, then choose Next to execute the first state backup.',
    read: 'Read',
    compare: 'Compare action values',
    choose: 'Write the maximum',
    state: 'Inspect state',
    unknown: 'Pending',
    phase: 'Current phase',
    iterationPath: 'Complete iteration path',
    commit: 'Commit table',
    commitReady: 'The new table is complete; make it the old table for the next sweep',
    commitExplanation: 'Commit performs no new backup. It only swaps the read/write roles, so every backup in the next sweep reads the table just completed.',
    winner: 'Value written for this state',
    initialPolicy: 'Freeze the initial policy',
    evaluationSweep: 'Evaluate the frozen policy',
    evaluationConverged: 'Current-policy evaluation converged',
    comparePolicy: 'Compare actions with the exact value',
    improvePolicy: 'Commit the improved policy',
    stablePolicy: 'Greedy actions did not change; the policy is stable',
    cycle: 'Policy round',
    sweep: 'Evaluation sweep',
    exactValue: 'Exact value',
    compareShort: 'Compare',
    improveShort: 'Improve',
    stableShort: 'Stable',
    initialValues: 'Evaluation start',
    scheduleTitle: 'One loop, three policy-improvement schedules',
    scheduleHint: 'Change evaluation depth and watch the TPI improvement point move between VI and PI.',
    evaluation: 'policy-evaluation sweep',
    improvement: 'greedy improvement',
    untilConverged: 'until evaluation converges',
    exactEndpoint: 'At this endpoint, TPI and VI have exactly the same execution order.',
    finiteMiddle: 'TPI holds the policy fixed for finitely many sweeps, then improves once.',
  },
}

function usePlayback(maxStep) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= maxStep) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1050)
    return () => window.clearInterval(timer)
  }, [playing, maxStep])

  function move(nextStep) {
    setPlaying(false)
    setStep(Math.max(0, Math.min(maxStep, nextStep)))
  }

  return { step, playing, setPlaying, move }
}

function PlayerControls({ playback, maxStep, text }) {
  return (
    <div className="planning-walkthrough-controls">
      <button type="button" onClick={() => playback.move(playback.step - 1)} disabled={playback.step === 0}>{text.previous}</button>
      <button type="button" className="is-primary" aria-pressed={playback.playing} onClick={() => playback.setPlaying((value) => !value)}>
        {playback.playing ? text.pause : text.play}
      </button>
      <button type="button" onClick={() => playback.move(playback.step + 1)} disabled={playback.step === maxStep}>{text.next}</button>
      <button type="button" onClick={() => playback.move(0)}>{text.reset}</button>
      <input aria-label={text.phase} type="range" min="0" max={maxStep} step="1" value={playback.step} onChange={(event) => playback.move(Number(event.target.value))} />
      <output>{playback.step}/{maxStep}</output>
    </div>
  )
}

function ValueGrid({ states, values, activeIndex, label, pendingLabel, arrows = null }) {
  return (
    <section className="planning-example-grid-panel">
      <header>{typeof label === 'string' ? <MathText>{label}</MathText> : label}</header>
      <div className={`planning-example-grid is-${states.length}`}>
        {states.map((state, index) => (
          <div className={activeIndex === index ? 'is-active' : ''} key={state.id}>
            <MathFormula latex={state.id} />
            <strong>{values[index] == null ? pendingLabel : values[index].toFixed(1)}</strong>
            {arrows && <i>{arrows[index]}</i>}
          </div>
        ))}
      </div>
    </section>
  )
}

function formatValueVector(values) {
  return values.map((value) => Number(value.toFixed(2))).join(',')
}

function ValueIterationRail({ config, playback, text }) {
  const roundSpan = config.states.length + 1
  return (
    <div className="planning-iteration-rail" aria-label={text.iterationPath}>
      {config.rounds.map((round, roundIndex) => (
        <section key={round.k}>
          <strong><MathFormula latex={`k=${round.k}`} /></strong>
          <div>
            {config.states.map((state, stateIndex) => {
              const target = roundIndex * roundSpan + stateIndex + 1
              return (
                <button type="button" className={playback.step === target ? 'is-active' : playback.step > target ? 'is-complete' : ''} aria-current={playback.step === target ? 'step' : undefined} onClick={() => playback.move(target)} key={state.id}>
                  <MathFormula latex={state.id} />
                </button>
              )
            })}
            <button type="button" className={`is-commit${playback.step === (roundIndex + 1) * roundSpan ? ' is-active' : playback.step > (roundIndex + 1) * roundSpan ? ' is-complete' : ''}`} aria-label={`${text.commit} ${round.k + 1}`} aria-current={playback.step === (roundIndex + 1) * roundSpan ? 'step' : undefined} onClick={() => playback.move((roundIndex + 1) * roundSpan)}>↺</button>
          </div>
        </section>
      ))}
    </div>
  )
}

function ValueIterationWalkthrough({ config, text }) {
  const roundSpan = config.states.length + 1
  const maxStep = config.rounds.length * roundSpan
  const playback = usePlayback(maxStep)
  const operationIndex = Math.max(0, playback.step - 1)
  const roundIndex = playback.step === 0 ? 0 : Math.floor(operationIndex / roundSpan)
  const localStep = playback.step === 0 ? 0 : (operationIndex % roundSpan) + 1
  const committing = localStep === roundSpan
  const stateIndex = localStep >= 1 && localStep <= config.states.length ? localStep - 1 : -1
  const round = config.rounds[Math.min(roundIndex, config.rounds.length - 1)]
  const written = committing ? config.states.length : Math.max(0, stateIndex + 1)
  const nextValues = round.newValues.map((value, index) => index < written ? value : null)
  const active = stateIndex >= 0 ? round.states[stateIndex] : null

  return (
    <figure className="planning-walkthrough planning-vi-walkthrough">
      <figcaption><span>{config.eyebrow}</span><strong>{config.title}</strong><p>{config.caption}</p></figcaption>
      <PlayerControls playback={playback} maxStep={maxStep} text={text} />
      <ValueIterationRail config={config} playback={playback} text={text} />
      <div className="planning-example-stage">
        <ValueGrid states={config.states} values={round.oldValues} activeIndex={stateIndex} label={<MathFormula latex={`V_${round.k}`} />} pendingLabel={text.unknown} />
        <div className="planning-example-transfer" aria-hidden="true">→</div>
        <ValueGrid states={config.states} values={nextValues} activeIndex={stateIndex} label={<MathFormula latex={`V_${round.k + 1}`} />} pendingLabel={text.unknown} />
        <section className="planning-example-inspector">
          {!active && !committing && <p>{text.waiting}</p>}
          {committing && (
            <div className="planning-table-commit">
              <span>{text.commit}</span>
              <strong>{text.commitReady}</strong>
              <div>
                <MathFormula latex={`V_${round.k + 1}=[${formatValueVector(round.newValues)}]`} />
                <b aria-hidden="true">↺</b>
                <MathFormula latex={`V_k\\leftarrow V_${round.k + 1},\\quad k\\leftarrow ${round.k + 1}`} />
              </div>
              <p>{text.commitExplanation}</p>
            </div>
          )}
          {active && <>
            <header><span>{text.phase}</span><strong><MathFormula latex={`k=${round.k},\\ ${config.states[stateIndex].id}`} /></strong></header>
            <div className="planning-example-logic">
              <span><small>{text.read}</small><MathFormula latex={`V_${round.k}`} /></span>
              <b aria-hidden="true">→</b>
              <span><small>{text.compare}</small><MathFormula latex={`q_${round.k}(s,a_1),\\ldots,q_${round.k}(s,a_5)`} /></span>
              <b aria-hidden="true">→</b>
              <span><small>{text.choose}</small><MathFormula latex={`V_${round.k + 1}(s)=\\max_a q_${round.k}(s,a)`} /></span>
            </div>
            <div className="planning-action-values">
              {active.q.map((value, index) => (
                <div className={index === active.action ? 'is-winner' : ''} key={`${round.k}-${stateIndex}-${index}`}>
                  <MathFormula latex={`q_${round.k}(s,a_${index + 1})`} />
                  <strong>{value.toFixed(1)}</strong>
                </div>
              ))}
            </div>
            <div className="planning-example-result">
              <span>{text.winner}</span>
              <MathFormula latex={`a^*=a_${active.action + 1}`} />
              <MathFormula latex={`V_${round.k + 1}(${config.states[stateIndex].id})=${active.value.toFixed(1)}`} />
            </div>
          </>}
        </section>
      </div>
    </figure>
  )
}

function PolicyIterationRail({ config, playback, text }) {
  return (
    <div className="planning-iteration-rail is-policy" aria-label={text.iterationPath}>
      <button type="button" className={playback.step === 0 ? 'is-active' : 'is-complete'} aria-current={playback.step === 0 ? 'step' : undefined} onClick={() => playback.move(0)}><MathFormula latex="\\pi_0" /></button>
      {config.cycles.map((cycle, cycleIndex) => {
        const start = cycleIndex * 5 + 1
        const labels = [
          <MathFormula latex="h=1" />,
          <MathFormula latex="h=2" />,
          <MathFormula latex={`V^{\\pi_${cycle.k}}`} />,
          text.compareShort,
          cycle.stable ? text.stableShort : text.improveShort,
        ]
        return (
          <section key={cycle.k}>
            <strong>{text.cycle} <MathFormula latex={`k=${cycle.k}`} /></strong>
            <div>
              {labels.map((label, index) => {
                const target = start + index
                return <button type="button" className={playback.step === target ? 'is-active' : playback.step > target ? 'is-complete' : ''} aria-current={playback.step === target ? 'step' : undefined} onClick={() => playback.move(target)} key={target}>{label}</button>
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function PolicyIterationWalkthrough({ config, text }) {
  const maxStep = config.cycles.length * 5
  const playback = usePlayback(maxStep)
  const [stateIndex, setStateIndex] = useState(0)
  const cycleIndex = playback.step === 0 ? 0 : Math.min(config.cycles.length - 1, Math.floor((playback.step - 1) / 5))
  const localStep = playback.step === 0 ? 0 : ((playback.step - 1) % 5) + 1
  const cycle = config.cycles[cycleIndex]
  const evaluationFrame = localStep >= 1 && localStep <= 3 ? cycle.evaluation[localStep - 1] : cycle.evaluation[cycle.evaluation.length - 1]
  const values = playback.step === 0 ? config.initialValues : evaluationFrame.values
  const policy = localStep === 5 ? cycle.nextPolicy : cycle.policy
  const phase = playback.step === 0
    ? text.initialPolicy
    : localStep < 3
      ? `${text.evaluationSweep} ${localStep}/2`
      : localStep === 3
        ? text.evaluationConverged
        : localStep === 4
          ? text.comparePolicy
          : cycle.stable ? text.stablePolicy : text.improvePolicy
  const selected = config.states[stateIndex]
  const q = cycle.actionValues[stateIndex]
  const valueLabel = playback.step === 0
    ? <MathFormula latex="V_0" />
    : localStep < 3
      ? <MathFormula latex={`V_{${localStep}}^{\\pi_${cycle.k}}`} />
      : <MathFormula latex={`V^{\\pi_${cycle.k}}`} />

  return (
    <figure className="planning-walkthrough planning-pi-walkthrough">
      <figcaption><span>{config.eyebrow}</span><strong>{config.title}</strong><p>{config.caption}</p></figcaption>
      <PlayerControls playback={playback} maxStep={maxStep} text={text} />
      <PolicyIterationRail config={config} playback={playback} text={text} />
      <div className="planning-pi-stage">
        <ValueGrid
          states={config.states}
          values={values}
          activeIndex={stateIndex}
          label={valueLabel}
          pendingLabel={text.unknown}
          arrows={policy}
        />
        <section className="planning-pi-inspector">
          <header>
            <span>{text.phase}</span>
            <strong>{phase}</strong>
          </header>
          <div className="planning-state-switch" role="group" aria-label={text.state}>
            {config.states.map((state, index) => <button type="button" aria-pressed={stateIndex === index} className={stateIndex === index ? 'active' : ''} onClick={() => setStateIndex(index)} key={state.id}><MathFormula latex={state.id} /></button>)}
          </div>
          {playback.step === 0 && <div className="planning-pi-formula"><MathFormula latex={String.raw`\pi_0(s_1)=a_\ell,\quad \pi_0(s_2)=a_\ell`} /><p>{text.initialValues}</p></div>}
          {localStep >= 1 && localStep < 3 && <div className="planning-pi-formula">
            <MathFormula latex={`V_{${localStep}}^{\\pi_${cycle.k}}=T^{\\pi_${cycle.k}}V_{${localStep - 1}}^{\\pi_${cycle.k}}`} />
            <MathFormula latex={`V_{${localStep}}^{\\pi_${cycle.k}}(${selected.id})=${evaluationFrame.values[stateIndex].toFixed(2)}`} />
          </div>}
          {localStep === 3 && <div className="planning-pi-formula">
            <MathFormula latex={cycle.equations[stateIndex]} />
            <MathFormula latex={`V^{\\pi_${cycle.k}}(${selected.id})=${evaluationFrame.values[stateIndex].toFixed(1)}`} />
          </div>}
          {localStep === 4 && <div className="planning-action-values is-three">
            {q.map((value, index) => <div className={index === cycle.bestActions[stateIndex] ? 'is-winner' : ''} key={`${cycle.k}-${stateIndex}-${index}`}><MathFormula latex={`q^{\\pi_${cycle.k}}(${selected.id},${config.actionLatex[index]})`} /><strong>{value.toFixed(1)}</strong></div>)}
          </div>}
          {localStep === 5 && <div className="planning-pi-formula is-commit">
            <MathFormula latex={`\\pi_${cycle.k + 1}(s_1)=${cycle.nextPolicyLatex[0]},\\quad \\pi_${cycle.k + 1}(s_2)=${cycle.nextPolicyLatex[1]}`} />
            <p>{cycle.stable ? text.stablePolicy : text.commitExplanation}</p>
          </div>}
        </section>
      </div>
    </figure>
  )
}

function ScheduleLane({ label, depth, infinite, text, activeDepth }) {
  const visibleSweeps = infinite ? 6 : depth
  return (
    <div className={`planning-schedule-lane${infinite ? ' is-infinite' : ''}`}>
      <strong>{label}</strong>
      <div className="planning-schedule-track">
        {Array.from({ length: visibleSweeps }, (_, index) => (
          <span className={!infinite && index === activeDepth - 1 ? 'is-last' : ''} key={index}>
            <b>{index + 1}</b><small>{text.evaluation}</small>
          </span>
        ))}
        {infinite && <em>…</em>}
        <i aria-label={text.improvement}>◆</i>
      </div>
      <small>{infinite ? text.untilConverged : `${depth} × ${text.evaluation}`}</small>
    </div>
  )
}

function ScheduleWalkthrough({ config, text }) {
  const [depth, setDepth] = useState(3)
  return (
    <figure className="planning-walkthrough planning-schedule-walkthrough">
      <figcaption><span>{config.eyebrow}</span><strong>{text.scheduleTitle}</strong><p>{text.scheduleHint}</p></figcaption>
      <label className="planning-schedule-control">
        <span>{config.depthLabel}<output><MathFormula latex={`j=${depth}`} /></output></span>
        <input type="range" min="1" max="6" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} />
      </label>
      <div className="planning-schedule-lanes">
        <ScheduleLane label="Value Iteration" depth={1} text={text} activeDepth={1} />
        <ScheduleLane label="Truncated PI" depth={depth} text={text} activeDepth={depth} />
        <ScheduleLane label="Policy Iteration" depth={6} infinite text={text} activeDepth={6} />
      </div>
      <p className="planning-schedule-conclusion">{depth === 1 ? text.exactEndpoint : text.finiteMiddle}</p>
    </figure>
  )
}

export default function PlanningWalkthrough({ config, lang }) {
  if (!config) return null
  const text = copy[lang]
  if (config.kind === 'vi') return <ValueIterationWalkthrough config={config} text={text} />
  if (config.kind === 'pi') return <PolicyIterationWalkthrough config={config} text={text} />
  if (config.kind === 'schedule') return <ScheduleWalkthrough config={config} text={text} />
  return null
}
