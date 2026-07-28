import { useEffect, useMemo, useState } from 'react'
import {
  ACTIONS,
  ACTION_NAMES,
  allStates,
  indexOf,
  isForbidden,
  isGoal,
  isSame,
  keyOf,
} from '../engine/gridworld.js'
import { runMonteCarloCourse } from '../engine/learning-labs.js'
import MathFormula from './MathFormula.jsx'
import MathText from './MathText.jsx'

const defaults = {
  variant: 'epsilon',
  episodes: 240,
  epsilon: 0.2,
  visit: 'every',
  seed: 20260076,
}

const variantCopy = {
  zh: {
    basic: ['MC Basic', '只更新指定起始对；策略在 120 个状态—动作对完成本轮评价后统一提交。'],
    exploring: ['Exploring Starts', '随机选择起始状态—动作，并复用途中访问；每条完整回合后提交一次贪心策略。'],
    epsilon: ['MC ε-Greedy', '从普通起点按软策略采样并复用途中访问；每条完整回合后提交新的 ε-greedy 策略。'],
  },
  en: {
    basic: ['MC Basic', 'Update only the requested starting pair and commit one policy after all 120 pairs finish the evaluation round.'],
    exploring: ['Exploring Starts', 'Randomize the starting pair, reuse later visits, and commit one greedy policy after each complete episode.'],
    epsilon: ['MC ε-Greedy', 'Sample from an ordinary start with a soft policy, reuse later visits, and commit a new ε-greedy policy after each episode.'],
  },
}

const actionCopy = {
  zh: { up: '上', right: '右', down: '下', left: '左', stay: '停留' },
  en: { up: 'Up', right: 'Right', down: 'Down', left: 'Left', stay: 'Stay' },
}

const actionLatex = {
  up: String.raw`\uparrow`,
  right: String.raw`\rightarrow`,
  down: String.raw`\downarrow`,
  left: String.raw`\leftarrow`,
  stay: String.raw`\circ`,
}

const phaseCopy = {
  zh: {
    rollout: ['1', '生成回合'],
    return: ['2', '反向计算 return'],
    commit: ['3', '提交 Q 与策略'],
    next: ['4', '进入下一回合'],
  },
  en: {
    rollout: ['1', 'Generate episode'],
    return: ['2', 'Compute returns'],
    commit: ['3', 'Commit Q and policy'],
    next: ['4', 'Enter next episode'],
  },
}

const phases = ['rollout', 'return', 'commit', 'next']

function format(value) {
  return Number(value).toFixed(2)
}

function stateLatex(stateOrLabel) {
  if (typeof stateOrLabel === 'string') {
    const number = stateOrLabel.replace(/^s/, '')
    return String.raw`s_{${number}}`
  }
  return String.raw`s_{${indexOf(stateOrLabel) + 1}}`
}

function EpisodePathOverlay({ sample, visibleSteps }) {
  const states = [
    sample.steps[0].state,
    ...sample.steps.slice(0, visibleSteps).map((step) => step.nextState),
  ]
  const points = states.map((state) => `${(state.col + 0.5) * 20},${(state.row + 0.5) * 20}`).join(' ')

  return (
    <svg className="mc-path-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {states.length > 1 && <polyline points={points} />}
      {states.map((state, index) => (
        <circle
          className={index === 0 ? 'is-start' : index === states.length - 1 ? 'is-current' : ''}
          cx={(state.col + 0.5) * 20}
          cy={(state.row + 0.5) * 20}
          r={index === 0 || index === states.length - 1 ? 2.3 : 1.25}
          key={`${keyOf(state)}-${index}`}
        />
      ))}
    </svg>
  )
}

function PolicyBars({ distribution, label }) {
  return (
    <section className="mc-policy-snapshot">
      <span>{label}</span>
      <div>
        {distribution.map((item) => (
          <div key={item.action}>
            <b aria-hidden="true">{ACTIONS[item.action].arrow}</b>
            <i><em style={{ width: `${item.probability * 100}%` }} /></i>
            <small>{(item.probability * 100).toFixed(0)}%</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function pairIdentity(step) {
  return `${keyOf(step.state)}:${step.action}`
}

function ProtocolTrack({ activeStep, lang, params, phase, sample }) {
  const zh = lang === 'zh'
  const admitted = params.variant === 'basic'
    ? 1
    : sample.steps.filter((step) => (
      params.visit === 'every' || step.visitOccurrence === 1
    )).length
  const startLabel = params.variant === 'basic'
    ? (zh ? '系统按顺序指定起始对' : 'Systematic requested start pair')
    : params.variant === 'exploring'
      ? (zh ? '随机抽取起始状态—动作' : 'Randomized starting state-action pair')
      : (zh ? '普通起点，逐步按概率抽样' : 'Ordinary start, action sampled at every step')
  const evidenceLabel = params.variant === 'basic'
    ? (zh ? '只放行起始时刻的一条 return' : 'Admit only the requested start return')
    : params.visit === 'first'
      ? (zh ? '同一状态—动作对每回合只放行一次' : 'Admit each state-action pair once per episode')
      : (zh ? '轨迹中的每次出现都进入估计' : 'Admit every occurrence in the trajectory')
  const commitLabel = params.variant === 'basic'
    ? sample.policyCommitted
      ? (zh ? '本回合补齐整张表，统一提交' : 'This episode completes the table and commits')
      : (zh ? '策略继续冻结，等待整批评价完成' : 'Policy remains frozen until the batch completes')
    : params.variant === 'exploring'
      ? (zh ? '本回合后提交确定性贪心策略' : 'Commit a deterministic greedy policy after this episode')
      : (zh ? '本回合后提交仍保留探索的软策略' : 'Commit a soft policy that retains exploration')
  const actionSource = activeStep?.actionSource === 'epsilon-explore'
    ? (zh ? '本步命中探索分支' : 'Exploration branch selected')
    : activeStep?.actionSource === 'forced-start'
      ? (zh ? '本步由起点协议强制指定' : 'Forced by the starting protocol')
      : (zh ? '本步采用当前贪心动作' : 'Current greedy action selected')

  return (
    <section className={`mc-protocol-track variant-${params.variant}`} aria-label={zh ? '算法协议轨道' : 'Algorithm protocol track'}>
      <header>
        <div>
          <span>{zh ? '算法差异沿三道门出现' : 'Algorithm differences appear at three gates'}</span>
          <strong>{zh ? 'return 的反向递推相同；经验来源、证据纳入和策略提交不同。' : 'Backward return propagation is shared; experience generation, evidence admission, and policy commit differ.'}</strong>
        </div>
        <small>{zh ? '当前：' : 'Current: '}<MathText>{variantCopy[lang][params.variant][0]}</MathText></small>
      </header>

      <div className="mc-protocol-gates">
        <article className={phase === 'rollout' ? 'active' : ''}>
          <span>{zh ? '① 经验从哪里来' : '① Experience source'}</span>
          <strong>{startLabel}</strong>
          <p>
            <MathFormula latex={stateLatex(sample.startState)} /> · {ACTIONS[sample.steps[0].action].arrow} {actionCopy[lang][sample.steps[0].action]}
            {params.variant === 'epsilon' && activeStep && <>
              <b className={activeStep.actionSource === 'epsilon-explore' ? 'is-explore' : ''}>{actionSource}</b>
              <small><MathFormula latex={String.raw`\pi(A_t\mid S_t)=${format(activeStep.actionProbability)}`} /></small>
            </>}
          </p>
        </article>

        <article className={phase === 'return' || phase === 'commit' ? 'active' : ''}>
          <span>{zh ? '② 哪些 return 能进入 Q' : '② Which returns enter Q'}</span>
          <strong>{evidenceLabel}</strong>
          <p><b>{admitted}</b> / {sample.steps.length} {zh ? '个时间步被纳入' : 'time steps admitted'}</p>
        </article>

        <article className={phase === 'next' ? 'active' : ''}>
          <span>{zh ? '③ 何时提交下一版策略' : '③ When the next policy commits'}</span>
          <strong>{commitLabel}</strong>
          <p>
            {params.variant === 'basic'
              ? <><b>{sample.evaluationProgress}</b> / {sample.evaluationTarget}</>
              : <><b>{sample.policyVersionBefore}</b> → {sample.policyVersionAfter}</>}
          </p>
        </article>
      </div>
    </section>
  )
}

function VisitProtocolComparison({ lang, params, sample }) {
  const zh = lang === 'zh'
  const firstVisitSteps = sample.steps.filter((step) => step.visitOccurrence === 1)
  const repeatedSteps = sample.steps.filter((step) => step.repeatedVisit)
  const repeatedAnchor = repeatedSteps[0]
  const repeatedPair = repeatedAnchor
    ? sample.steps.filter((step) => pairIdentity(step) === pairIdentity(repeatedAnchor))
    : []

  return (
    <section className="mc-visit-counterfactual" aria-label={zh ? '首次访问与每次访问对照' : 'First-visit and every-visit comparison'}>
      <header>
        <div>
          <span>{zh ? '固定同一条回合，不重新采样' : 'Hold one episode fixed; do not resample'}</span>
          <strong>{zh ? '访问协议只决定重复出现怎样计权' : 'The visit protocol changes only how repeated occurrences are weighted'}</strong>
        </div>
        <p>{repeatedSteps.length > 0
          ? (zh ? `同一条回合：首次访问纳入 ${firstVisitSteps.length} / ${sample.steps.length}，每次访问纳入 ${sample.steps.length} / ${sample.steps.length}；差异来自 ${repeatedSteps.length} 个重复时间步。` : `Same episode: first visit admits ${firstVisitSteps.length} / ${sample.steps.length}; every visit admits ${sample.steps.length} / ${sample.steps.length}. The difference comes from ${repeatedSteps.length} repeated time steps.`)
          : (zh ? `同一条回合没有重复状态—动作对，两种协议都纳入 ${sample.steps.length} / ${sample.steps.length}。` : `The same episode has no repeated state-action pair, so both protocols admit ${sample.steps.length} / ${sample.steps.length}.`)}</p>
      </header>

      <div className="mc-visit-rows">
        <article className={params.visit === 'first' ? 'active' : ''}>
          <header><strong>{zh ? '首次访问' : 'First visit'}</strong><span>{firstVisitSteps.length} / {sample.steps.length}</span></header>
          <p>{zh ? '每个状态—动作对只保留最早出现的一次。' : 'Keep only the earliest occurrence of each state-action pair.'}</p>
          <div className="mc-visit-token-row">
            {sample.steps.map((step) => <span className={step.visitOccurrence === 1 ? 'admitted' : 'rejected'} key={`first-${step.time}`}><b>{step.time}</b><small>{step.visitOccurrence === 1 ? '✓' : '×'}</small></span>)}
          </div>
        </article>
        <article className={params.visit === 'every' ? 'active' : ''}>
          <header><strong>{zh ? '每次访问' : 'Every visit'}</strong><span>{sample.steps.length} / {sample.steps.length}</span></header>
          <p>{zh ? '同一状态—动作对的每次出现都贡献自己的 return。' : 'Every occurrence contributes its own return.'}</p>
          <div className="mc-visit-token-row">
            {sample.steps.map((step) => <span className="admitted" key={`every-${step.time}`}><b>{step.time}</b><small>✓</small></span>)}
          </div>
        </article>
      </div>

      {repeatedAnchor && <aside>
        <span>{zh ? '重复对的局部证据' : 'Local evidence for one repeated pair'}</span>
        <strong><MathFormula latex={String.raw`(${stateLatex(repeatedAnchor.state)},\,${actionLatex[repeatedAnchor.action]})`} /></strong>
        <p>{zh ? '出现于' : 'Occurs at'} {repeatedPair.map((step, index) => <span key={step.time}>{index > 0 ? '、' : ''}<MathFormula latex={String.raw`t=${step.time},\ G_t=${format(step.returnValue)}`} /></span>)}</p>
        <small>{zh ? '首次访问只采用列表第一项；每次访问采用全部列表项。' : 'First visit uses only the first item; every visit uses the entire list.'}</small>
      </aside>}
    </section>
  )
}

export default function MonteCarloLab({ lang, content }) {
  const zh = lang === 'zh'
  const [params, setParams] = useState(defaults)
  const [sampleSlot, setSampleSlot] = useState(0)
  const [phase, setPhase] = useState('rollout')
  const [stepSlot, setStepSlot] = useState(0)
  const [returnRevealCount, setReturnRevealCount] = useState(0)
  const [updateRevealCount, setUpdateRevealCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const result = useMemo(() => runMonteCarloCourse(params), [params])
  const sample = result.samples[Math.min(sampleSlot, result.samples.length - 1)]
  const playbackStep = Math.min(stepSlot, sample.steps.length - 1)
  const visibleSteps = phase === 'rollout' ? playbackStep + 1 : sample.steps.length
  const currentState = visibleSteps > 0 ? sample.steps[visibleSteps - 1].nextState : sample.startState
  const activeTapeIndex = phase === 'rollout'
    ? playbackStep
    : phase === 'return' && returnRevealCount > 0
      ? sample.steps.length - returnRevealCount
      : sample.steps.length - 1
  const activeStep = sample.steps[Math.max(0, activeTapeIndex)]
  const revealCommit = phase === 'commit'
  const commitComplete = phase === 'next' || (phase === 'commit' && updateRevealCount >= sample.updates.length)
  const playbackUnits = sample.steps.length * 2 + sample.updates.length + 1
  const completedUnits = phase === 'rollout'
    ? playbackStep + 1
    : phase === 'return'
      ? sample.steps.length + returnRevealCount
      : phase === 'commit'
        ? sample.steps.length * 2 + updateRevealCount
        : playbackUnits
  const playbackProgress = Math.min(100, (completedUnits / playbackUnits) * 100)

  useEffect(() => {
    setSampleSlot(params.variant === 'basic' && result.samples.length > 1 ? 1 : 0)
    setPhase('rollout')
    setStepSlot(0)
    setReturnRevealCount(0)
    setUpdateRevealCount(0)
    setIsPlaying(false)
  }, [params.variant, params.episodes, params.visit, params.epsilon, result.samples.length])

  useEffect(() => {
    if (!isPlaying) return undefined

    const timer = window.setTimeout(() => {
      if (phase === 'rollout') {
        if (stepSlot < sample.steps.length - 1) {
          setStepSlot((value) => value + 1)
        } else {
          setPhase('return')
          setReturnRevealCount(0)
        }
        return
      }

      if (phase === 'return') {
        if (returnRevealCount < sample.steps.length) {
          setReturnRevealCount((value) => value + 1)
        } else {
          setPhase('commit')
          setUpdateRevealCount(0)
        }
        return
      }

      if (phase === 'commit') {
        if (updateRevealCount < sample.updates.length) {
          setUpdateRevealCount((value) => value + 1)
        } else {
          setPhase('next')
          setIsPlaying(false)
        }
      }
    }, playbackRate === 1 ? 360 : 180)

    return () => window.clearTimeout(timer)
  }, [
    isPlaying,
    phase,
    playbackRate,
    returnRevealCount,
    sample.steps.length,
    sample.updates.length,
    stepSlot,
    updateRevealCount,
  ])

  function set(key, value) {
    setParams((current) => ({ ...current, [key]: value }))
  }

  function resetPlayback(shouldPlay = false) {
    setPhase('rollout')
    setStepSlot(0)
    setReturnRevealCount(0)
    setUpdateRevealCount(0)
    setIsPlaying(shouldPlay)
  }

  function selectSample(index) {
    setSampleSlot(index)
    resetPlayback(false)
  }

  function selectPhase(nextPhase) {
    setIsPlaying(false)
    setPhase(nextPhase)
    setStepSlot(nextPhase === 'rollout' ? 0 : sample.steps.length - 1)
    setReturnRevealCount(nextPhase === 'rollout' ? 0 : sample.steps.length)
    setUpdateRevealCount(nextPhase === 'commit' || nextPhase === 'next' ? sample.updates.length : 0)
  }

  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    if (phase === 'next') {
      resetPlayback(true)
      return
    }
    setIsPlaying(true)
  }

  return (
    <section className={`mc-lab${isPlaying ? ' is-playing' : ''}`} id={content.experiment.id} aria-label={content.figure}>
      <header className="mc-lab-heading">
        <div><span>{content.figure}</span><h2>{zh ? '一个回合怎样改变下一回合使用的策略？' : 'How does one episode change the policy used by the next?'}</h2><p><MathText>{content.instruction}</MathText></p></div>
        <button type="button" onClick={() => { setParams(defaults); setSampleSlot(0); resetPlayback(false) }}>{zh ? '恢复基线' : 'Reset'}</button>
      </header>

      <div className="experiment-environment">
        <span>{zh ? '共享的 5×5 网格世界 · episodic 版本' : 'Shared 5×5 grid world · episodic version'}</span>
        <MathFormula latex={String.raw`S_T=s_{\mathrm{goal}},\qquad V(S_T)=0`} />
        <small>{zh ? '首次进入目标格即终止。只有完整回合进入更新；达到 120 步上限的截断尝试会被丢弃并单独计数。三种方法共享环境、随机种子和完整回合预算，但会因策略与起点协议不同而生成不同经验。' : 'First entry into the goal terminates the episode. Only complete episodes update estimates; attempts truncated at 120 steps are discarded and counted separately. The methods share the environment, seed, and complete-episode budget, but generate different experience because their policy and start protocols differ.'}</small>
      </div>

      <div className="mc-variant-switch" role="group" aria-label={zh ? '算法变体' : 'Algorithm variant'}>
        {['basic', 'exploring', 'epsilon'].map((id, index) => (
          <button type="button" key={id} className={params.variant === id ? 'active' : ''} aria-pressed={params.variant === id} onClick={() => set('variant', id)}>
            <small>{index + 1}</small><strong><MathText>{variantCopy[lang][id][0]}</MathText></strong><span>{index === 0 ? (zh ? '指定起点 · 整批提交' : 'Requested start · batch commit') : index === 1 ? (zh ? '随机起点 · 贪心提交' : 'Random start · greedy commit') : (zh ? '普通起点 · 软策略提交' : 'Ordinary start · soft commit')}</span>
          </button>
        ))}
      </div>

      <div className="mc-controls">
        <label><span>{zh ? '完整回合预算' : 'Complete episodes'}<output>{params.episodes}</output></span><input type="range" min="120" max="360" step="120" value={params.episodes} onChange={(event) => set('episodes', Number(event.target.value))} /></label>
        <label className={params.variant === 'epsilon' ? '' : 'disabled'}><span>{zh ? '探索率' : 'Exploration'} <MathFormula latex={String.raw`\epsilon`} /><output>{params.epsilon.toFixed(2)}</output></span><input type="range" min="0.05" max="0.5" step="0.05" value={params.epsilon} disabled={params.variant !== 'epsilon'} onChange={(event) => set('epsilon', Number(event.target.value))} /></label>
        <fieldset className={params.variant === 'basic' ? 'disabled' : ''} disabled={params.variant === 'basic'}><legend>{zh ? '回合内访问协议' : 'Within-episode visits'}</legend><div>{['first', 'every'].map((id) => <button type="button" key={id} className={params.visit === id ? 'active' : ''} aria-pressed={params.visit === id} onClick={() => set('visit', id)}>{id === 'first' ? (zh ? '首次访问' : 'First visit') : (zh ? '每次访问' : 'Every visit')}</button>)}</div></fieldset>
      </div>

      <div className="mc-metrics">
        <div><span>{zh ? '已覆盖状态—动作对' : 'Covered state-action pairs'}</span><strong>{result.visitedPairs} / {result.totalPairs}</strong></div>
        <div><span>{zh ? '完整 / 截断回合' : 'Completed / truncated'}</span><strong>{result.episodes} / {result.truncatedEpisodes}</strong></div>
        <div><span>{zh ? '当前样本的策略版本' : 'Selected policy version'}</span><strong>{sample.policyVersionBefore} → {sample.policyVersionAfter}</strong></div>
      </div>

      <ProtocolTrack activeStep={activeStep} lang={lang} params={params} phase={phase} sample={sample} />

      {params.variant !== 'basic' && <VisitProtocolComparison lang={lang} params={params} sample={sample} />}

      <section className="mc-playback-selector">
        <header>
          <div><span>{zh ? '语义边界样本' : 'Semantic boundary samples'}</span><strong>{zh ? `第 ${sample.index + 1} 个完整回合` : `Complete episode ${sample.index + 1}`}</strong></div>
          <div className="mc-playback-tools">
            <div className="mc-sample-switch">
              {result.samples.map((item, index) => <button type="button" key={item.index} className={sampleSlot === index ? 'active' : ''} aria-pressed={sampleSlot === index} onClick={() => selectSample(index)}>#{item.index + 1}</button>)}
            </div>
            <div className="mc-transport">
              <button type="button" className="mc-play-button" aria-pressed={isPlaying} onClick={togglePlayback}>
                <span aria-hidden="true">{isPlaying ? 'Ⅱ' : phase === 'next' ? '↺' : '▶'}</span>
                {isPlaying ? (zh ? '暂停' : 'Pause') : phase === 'next' ? (zh ? '重新播放' : 'Replay') : (zh ? '自动播放' : 'Auto play')}
              </button>
              <button type="button" className="mc-rate-button" aria-label={zh ? `播放速度 ${playbackRate} 倍` : `Playback speed ${playbackRate} times`} onClick={() => setPlaybackRate((value) => value === 1 ? 2 : 1)}>{playbackRate}×</button>
            </div>
          </div>
        </header>
        <div className="mc-playback-progress" aria-hidden="true"><i style={{ width: `${playbackProgress}%` }} /></div>
        <div className="mc-loop-phases" role="group" aria-label={zh ? '回合更新阶段' : 'Episode update phases'}>
          {phases.map((id) => <button type="button" key={id} className={phase === id ? 'active' : ''} aria-pressed={phase === id} onClick={() => selectPhase(id)}><small>{phaseCopy[lang][id][0]}</small><span>{phaseCopy[lang][id][1]}</span></button>)}
        </div>
      </section>

      <div className={`mc-playback-stage phase-${phase}`}>
        <section className="mc-path-panel">
          <header><div><span>{zh ? '选中回合的网格路径' : 'Selected episode path'}</span><small>{zh ? '路径、当前状态与 tape 同步' : 'Path, current state, and tape stay synchronized'}</small></div><strong><MathFormula latex={stateLatex(currentState)} /></strong></header>
          <div className="mc-world-visual">
            <div className="mc-world-grid">
              {allStates().map((state) => {
                const isStart = isSame(state, sample.startState)
                const isCurrent = isSame(state, currentState)
                return (
                  <div className={`mc-world-cell${isForbidden(state) ? ' forbidden' : ''}${isGoal(state) ? ' goal' : ''}${isStart ? ' start' : ''}${isCurrent ? ' current' : ''}`} key={keyOf(state)}>
                    <MathFormula latex={stateLatex(state)} />
                    <small>{result.stateActionCoverage[indexOf(state)]} / {ACTION_NAMES.length}</small>
                  </div>
                )
              })}
            </div>
            <EpisodePathOverlay sample={sample} visibleSteps={visibleSteps} />
          </div>
          <p>{zh ? '格内数字表示该状态已有多少个动作获得过更新；路径只表示当前选中的一条完整回合。' : 'Each cell reports how many actions at that state have received an update; the path is only the selected complete episode.'}</p>
        </section>

        <section className="mc-episode-panel">
          <header>
            <div><span>{zh ? '完整回合 tape' : 'Complete-episode tape'}</span><small>{sample.steps.length} {zh ? '个转移' : 'transitions'}</small></div>
            {phase === 'rollout' && <div className="mc-step-controls"><button type="button" disabled={playbackStep === 0} onClick={() => setStepSlot((value) => Math.max(0, value - 1))}>{zh ? '上一步' : 'Previous'}</button><strong><MathFormula latex={String.raw`t=${playbackStep}`} /></strong><button type="button" disabled={playbackStep === sample.steps.length - 1} onClick={() => setStepSlot((value) => Math.min(sample.steps.length - 1, value + 1))}>{zh ? '下一步' : 'Next'}</button></div>}
          </header>
          <div className="mc-tape-scroll">
            <div className="mc-tape-head"><span><MathFormula latex={String.raw`t`} /></span><span><MathFormula latex={String.raw`S_t`} /></span><span><MathFormula latex={String.raw`A_t`} /></span><span><MathFormula latex={String.raw`R_{t+1}`} /></span><span><MathFormula latex={String.raw`G_t`} /></span><span>{zh ? '纳入' : 'Use'}</span></div>
            <div className="mc-tape-body">
              {sample.steps.map((step) => {
                const returnIsVisible = phase === 'commit' || phase === 'next' || (phase === 'return' && step.time >= sample.steps.length - returnRevealCount)
                const isCurrent = phase === 'rollout'
                  ? step.time === playbackStep
                  : phase === 'return' && returnRevealCount > 0 && step.time === sample.steps.length - returnRevealCount
                const admission = params.variant === 'basic'
                  ? step.time === 0 ? (zh ? '起点' : 'start') : (zh ? '跳过' : 'skip')
                  : step.used
                    ? step.repeatedVisit ? (zh ? '再次' : 'again') : (zh ? '纳入' : 'use')
                    : (zh ? '跳过' : 'skip')
                return <div key={step.time} className={`${step.used ? 'used' : 'skipped'}${step.repeatedVisit ? ' repeated' : ''}${step.repeatedVisit && !step.used ? ' rejected-repeat' : ''}${isCurrent ? ' current' : ''}`}><span>{step.time}</span><strong><MathFormula latex={stateLatex(step.state)} /></strong><span>{ACTIONS[step.action].arrow} {actionCopy[lang][step.action]}{step.repeatedVisit && <small className="mc-repeat-index">×{step.visitOccurrence}</small>}{step.terminated ? (zh ? ' · 终止' : ' · terminal') : ''}</span><span className={step.reward < 0 ? 'negative' : step.reward > 0 ? 'positive' : ''}>{step.reward > 0 ? '+' : ''}{step.reward}</span><span>{returnIsVisible ? format(step.returnValue) : '…'}</span><span className={returnIsVisible ? (step.used ? 'is-admitted' : 'is-rejected') : ''}>{returnIsVisible ? admission : '…'}</span></div>
              })}
            </div>
          </div>
        </section>

        <aside className="mc-commit-panel">
          <header><span>{phaseCopy[lang][phase][1]}</span><small>{zh ? `外层轮次 ${sample.outerIteration + 1}` : `Outer iteration ${sample.outerIteration + 1}`}</small></header>

          {phase === 'rollout' && <div className="mc-phase-explanation"><strong>{zh ? '先生成到终点' : 'Generate through termination first'}</strong><p>{zh ? '当前阶段只显示已经发生的路径、动作与奖励。回合尚未结束时，普通 Monte Carlo 还不能计算完整 return，也不会提交 Q 更新。' : 'This phase exposes only the path, actions, and rewards observed so far. Before termination, ordinary Monte Carlo cannot compute the complete return and commits no Q update.'}</p></div>}

          {phase === 'return' && <div className="mc-phase-explanation"><strong>{zh ? '从终点向前回传 return' : 'Propagate returns backward from termination'}</strong><p>{zh ? '终止后，从最后一个奖励开始反向递推。访问协议决定同一状态—动作对在本回合中哪些出现会成为更新样本。' : 'After termination, returns are accumulated backward from the final reward. The visit protocol decides which occurrences of a state-action pair become update samples.'}</p><MathFormula block latex={String.raw`G_t=R_{t+1}+\gamma G_{t+1},\qquad G_T=0`} /></div>}

          {revealCommit && <>
            <div className={`mc-commit-status ${commitComplete && sample.policyCommitted ? 'is-committed' : 'is-pending'}`}>
              <span>{commitComplete ? (sample.policyCommitted ? (zh ? '策略已提交' : 'Policy committed') : (zh ? '策略仍冻结' : 'Policy remains frozen')) : (zh ? '正在逐项写入 Q' : 'Writing Q updates')}</span>
              <strong>{commitComplete ? (params.variant === 'basic' ? `${sample.evaluationProgress} / ${sample.evaluationTarget}` : (zh ? '每回合提交' : 'commit every episode')) : `${updateRevealCount} / ${sample.updates.length}`}</strong>
              <p>{commitComplete
                ? sample.policyCommitted
                  ? (zh ? '本回合完成了该方法规定的评价边界，策略版本随之推进。' : 'This episode reaches the method’s evaluation boundary, so the policy version advances.')
                  : (zh ? 'Q 的起始对样本已经写入本轮评价，但必须等全部状态—动作对完成后才能统一改善策略。' : 'The requested-pair sample enters this evaluation round, but policy improvement waits until every state-action pair is complete.')
                : (zh ? '播放器正按 tape 中的纳入标记，把 return 依次写回对应的状态—动作估计。' : 'The player follows the tape’s inclusion marks and writes each return into its state-action estimate in sequence.')}</p>
            </div>

            <div className="mc-update-evidence">
              <header><span>{zh ? '本回合纳入的 Q 更新' : 'Q updates admitted from this episode'}</span><small>{sample.updates.length}</small></header>
              <MathFormula latex={String.raw`Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\frac{G_t-Q(S_t,A_t)}{N(S_t,A_t)}`} />
              <div className="mc-update-list">
                {sample.updates.slice(0, updateRevealCount).map((update) => <div className="is-new" key={`${update.time}-${update.state}-${update.action}`}><span><MathFormula latex={stateLatex(update.state)} /> {ACTIONS[update.action].arrow}</span><strong><MathFormula latex={String.raw`${format(update.before)}\rightarrow${format(update.after)}`} /></strong><small><MathFormula latex={String.raw`G=${format(update.returnValue)},\quad N=${update.visits}`} /></small></div>)}
              </div>
            </div>

            <div className={`mc-policy-commit${commitComplete ? ' is-visible' : ' is-waiting'}`}>
              <header><span>{zh ? '检查状态' : 'Inspection state'} <MathFormula latex={stateLatex(sample.inspectionStateLabel)} /></span><small>{sample.policyChanged ? (zh ? '动作分布发生变化' : 'action distribution changed') : (zh ? '本状态分布不变' : 'distribution unchanged here')}</small></header>
              {commitComplete ? <div className="mc-policy-comparison">
                <PolicyBars distribution={sample.policyBefore} label={zh ? `提交前 · 版本 ${sample.policyVersionBefore}` : `Before · version ${sample.policyVersionBefore}`} />
                <PolicyBars distribution={sample.policyAfter} label={zh ? `提交后 · 版本 ${sample.policyVersionAfter}` : `After · version ${sample.policyVersionAfter}`} />
              </div> : <p>{zh ? '完成本回合的全部 Q 写入后，才比较提交前后的动作分布。' : 'The before/after action distributions appear after every Q update from this episode has been written.'}</p>}
            </div>
          </>}

          {phase === 'next' && <div className="mc-next-episode">
            <span>{zh ? '策略交接' : 'Policy handoff'}</span>
            {sample.nextEpisode
              ? <><strong>{zh ? `版本 ${sample.nextEpisode.policyVersion} 进入第 ${sample.nextEpisode.index + 1} 个完整回合` : `Version ${sample.nextEpisode.policyVersion} enters complete episode ${sample.nextEpisode.index + 1}`}</strong><p>{zh ? '下一回合从' : 'The next episode starts at'} <MathFormula latex={stateLatex(sample.nextEpisode.startState)} /> · {ACTIONS[sample.nextEpisode.firstAction].arrow} {actionCopy[lang][sample.nextEpisode.firstAction]}</p></>
              : <><strong>{zh ? '当前预算在此结束' : 'The current budget ends here'}</strong><p>{zh ? '增加完整回合预算，可以继续观察该策略版本怎样生成新的经验。' : 'Increase the complete-episode budget to observe how this policy version generates further experience.'}</p></>}
          </div>}
        </aside>
      </div>
    </section>
  )
}
