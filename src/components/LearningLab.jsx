import { useEffect, useMemo, useState } from 'react'
import MathFormula from './MathFormula'
import MathText from './MathText'
import { learningLabRunners } from '../engine/learning-labs.js'

const defaults = {
  montecarlo: { episodes: 24, epsilon: 0.2, seed: 20260719, visit: 'first' },
  approximation: { alpha: 0.18, decay: true, noise: 1.4, steps: 48, seed: 20260719 },
  td: { gamma: 0.9, alpha: 0.4, n: 2 },
  control: { epsilon: 0.12, alpha: 0.3, seed: 20260719 },
  vfa: { width: 1.2, alpha: 0.24, target: 5 },
  dqn: { replay: 0.7, targetPeriod: 8, steps: 40 },
  policygradient: { theta: 0, selectedStep: 0, alpha: 0.18, baseline: 0.8 },
  actorcritic: { reward: 1, gamma: 0.9, value: 2.2, nextValue: 2.8, actorAlpha: 0.12, criticAlpha: 0.18, ratio: 1 },
}

const scenarioCopy = {
  td: {
    zh: ['共享 5×5 网格中的三条策略轨迹', String.raw`s_{25},\,s_{15},\,s_{5}\rightsquigarrow s_{18}`, '三个不同起点服从同一固定策略；TD(0)、多步目标与 Monte Carlo 在每条轨迹内部读取完全相同的转移证据。'],
    en: ['Three policy trajectories in the shared 5×5 grid', String.raw`s_{25},\,s_{15},\,s_{5}\rightsquigarrow s_{18}`, 'Three different starts follow one fixed policy; TD(0), multi-step targets, and Monte Carlo read identical transition evidence within each trajectory.'],
  },
  control: {
    zh: ['共享的 5×5 课程网格', String.raw`s_{25}\rightarrow s_{18}`, '两种算法使用相同的起点、禁区、目标区、训练预算和探索率。'],
    en: ['Shared 5×5 grid', String.raw`s_{25}\rightarrow s_{18}`, 'Both algorithms use the same start, forbidden states, target, training budget, and exploration rate.'],
  },
  vfa: {
    zh: ['网格状态的共享表示', String.raw`s_{11}\leftrightarrow s_{12}\leftrightarrow s_{13}`, '相邻网格状态共享特征，因此一次更新会传播到未被直接采样的邻居。'],
    en: ['Shared representation of grid states', String.raw`s_{11}\leftrightarrow s_{12}\leftrightarrow s_{13}`, 'Neighboring grid states share features, so one update propagates beyond the sampled state.'],
  },
  dqn: {
    zh: ['网格转移进入回放缓冲区', String.raw`\mathcal D=\{(s_t,a_t,r_{t+1},s_{t+1})\}`, '状态先被编码成特征，再以真实转移的形式写入 replay buffer。'],
    en: ['Grid transitions enter replay', String.raw`\mathcal D=\{(s_t,a_t,r_{t+1},s_{t+1})\}`, 'Grid states are encoded as features and stored as observed transitions in replay.'],
  },
  policygradient: {
    zh: ['一条网格策略轨迹', String.raw`s_1\xrightarrow{a_1}s_2\xrightarrow{a_2}s_7\xrightarrow{a_3}s_8`, '选择时间步后，右侧只使用该动作之后的奖励构造梯度权重。'],
    en: ['One grid-policy trajectory', String.raw`s_1\xrightarrow{a_1}s_2\xrightarrow{a_2}s_7\xrightarrow{a_3}s_8`, 'Selecting a step uses only rewards after that action to form its gradient weight.'],
  },
  actorcritic: {
    zh: ['网格中的一步转移', String.raw`s_7\xrightarrow{a=\mathrm{right},\,r=1}s_8`, '同一条转移同时产生 Critic 的价值误差与 Actor 的更新方向。'],
    en: ['One grid transition', String.raw`s_7\xrightarrow{a=\mathrm{right},\,r=1}s_8`, 'The same transition supplies the critic error and the actor update direction.'],
  },
}

const configs = {
  montecarlo: {
    formula: String.raw`Q(s,a)\leftarrow Q(s,a)+\frac{1}{N(s,a)}\left(G-Q(s,a)\right)`,
    controls: [['episodes', 8, 72, 4], ['epsilon', 0, 0.6, 0.05]],
    labels: { zh: ['Episode 数', '探索率 ε'], en: ['Episodes', 'Exploration ε'] },
    metrics: (r, zh) => [[zh ? '价值估计' : 'Value estimate', r.estimate], [zh ? '有效访问' : 'Used visits', r.visits], [zh ? '覆盖率' : 'Coverage', `${(r.coverage * 100).toFixed(0)}%`]],
  },
  approximation: {
    formula: String.raw`w_{k+1}=w_k+\alpha_k\left(X_k-w_k\right)`,
    controls: [['alpha', 0.03, 0.5, 0.01], ['noise', 0, 3, 0.1]],
    labels: { zh: ['固定步长 α', '观测噪声'], en: ['Constant step α', 'Observation noise'] },
    metrics: (r, zh) => [[zh ? '最终估计' : 'Final estimate', r.estimate], [zh ? '真实均值' : 'True mean', r.target], [zh ? '绝对误差' : 'Absolute error', r.error]],
  },
  td: {
    formula: String.raw`V(S_t)\leftarrow V(S_t)+\alpha\left(R_{t+1}+\gamma V(S_{t+1})-V(S_t)\right)`,
    controls: [['gamma', 0.4, 0.99, 0.01], ['alpha', 0.05, 1, 0.05], ['n', 1, 3, 1]],
    labels: { zh: ['折扣因子', '更新步长', '真实奖励步数'], en: ['Discount factor', 'Update step size', 'Realized-reward horizon'] },
    metrics: (r, zh) => [[zh ? '完整更新次数' : 'Committed updates', r.updates.length], [zh ? '不同轨迹数' : 'Distinct trajectories', r.trajectories.length], [zh ? '终点编号' : 'Terminal index', 18]],
  },
  control: {
    formula: String.raw`\text{Sarsa}:Q(S',A')\qquad \text{Q-learning}:\max_a Q(S',a)`,
    controls: [['epsilon', 0.02, 0.5, 0.02], ['alpha', 0.05, 0.8, 0.05]],
    labels: { zh: ['探索率 ε', '步长 α'], en: ['Exploration ε', 'Step size α'] },
    metrics: (r, zh) => [[zh ? 'Sarsa 禁区回合' : 'Sarsa forbidden-state episodes', `${(r.sarsaForbiddenRate * 100).toFixed(1)}%`], [zh ? 'Q-learning 禁区回合' : 'Q-learning forbidden-state episodes', `${(r.qForbiddenRate * 100).toFixed(1)}%`], [zh ? '连续动态写回' : 'Visible consecutive commits', r.traces.sarsa.frames.length]],
  },
  vfa: {
    formula: String.raw`\mathbf w\leftarrow\mathbf w+\alpha\left(U_t-\widehat v(S_t,\mathbf w)\right)\nabla_{\mathbf w}\widehat v(S_t,\mathbf w)`,
    controls: [['width', 0.35, 2.5, 0.05], ['alpha', 0.05, 0.6, 0.01]],
    labels: { zh: ['特征宽度', '步长 α'], en: ['Feature width', 'Step size α'] },
    metrics: (r, zh) => [[zh ? '中心误差' : 'Center error', r.centerError], [zh ? '邻居改变量' : 'Neighbor change', r.spillover], [zh ? '目标值' : 'Target', 5]],
  },
  dqn: {
    formula: String.raw`Y=R+\gamma\max_{a'}Q_{\bar\theta}(S',a'),\qquad\theta\leftarrow\theta-\alpha\nabla_\theta(Y-Q_\theta(S,A))^2`,
    controls: [['replay', 0, 1, 0.05], ['targetPeriod', 2, 20, 1], ['steps', 1, 60, 1]],
    labels: { zh: ['经验回放强度', '目标同步间隔', '当前更新步'], en: ['Replay mixing', 'Target sync period', 'Current update'] },
    metrics: (r, zh) => [[zh ? '样本相关性' : 'Correlation', r.correlation], [zh ? '末段漂移' : 'Late drift', r.drift], [zh ? 'Replay 容量' : 'Replay size', r.replaySize]],
  },
  policygradient: {
    formula: String.raw`\theta\leftarrow\theta+\alpha\,\nabla_\theta\log\pi_\theta(A\mid S)\,(G-b)`,
    controls: [['theta', -2.5, 2.5, 0.1], ['alpha', 0.02, 0.5, 0.02], ['baseline', -2, 2, 0.1]],
    labels: { zh: ['所选状态的动作 logit', '步长 α', '状态基线 b'], en: ['Action logit at selected state', 'Step size α', 'State baseline b'] },
    metrics: (r, zh) => [[zh ? '所选动作：更新前' : 'Selected: before', r.probability], [zh ? '所选动作：更新后' : 'Selected: after', r.nextProbability], [zh ? '基线后梯度方差' : 'Variance with baseline', r.varianceWithBaseline]],
  },
  actorcritic: {
    formula: String.raw`\delta=R+\gamma V_\phi(S')-V_\phi(S),\quad\theta\leftarrow\theta+\alpha_\theta\rho\,\delta\nabla_\theta\log\pi_\theta(A\mid S)`,
    controls: [['reward', -2, 4, 0.1], ['nextValue', -1, 5, 0.1], ['ratio', 0.4, 1.8, 0.05]],
    labels: { zh: ['即时奖励', '后继价值', '重要性比率 ρ'], en: ['Immediate reward', 'Successor value', 'Importance ratio ρ'] },
    metrics: (r, zh) => [[zh ? 'TD error / advantage' : 'TD error / advantage', r.delta], [zh ? 'Critic 更新后' : 'Critic after', r.nextValueEstimate], [zh ? 'Actor 步长' : 'Actor step', r.actorStep]],
  },
}

function format(value) {
  if (value == null || Number.isNaN(value)) return '—'
  if (typeof value === 'string') return value
  if (Number.isInteger(value)) return value
  return Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(3)
}

const tdTrajectoryColors = ['#176f68', '#315f9b', '#a55f24']

function tdTrajectoryPoint(stateId, offset = 0) {
  const index = stateId - 1
  return {
    x: (index % 5) * 20 + 10 + offset,
    y: Math.floor(index / 5) * 20 + 10 + offset,
  }
}

function TdTrajectoryOverlay({ trajectories, activeEpisode, transitionIndex }) {
  const offsets = [-2.2, 0, 2.2]
  return (
    <svg className="td-trajectory-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {trajectories.map((trajectory, index) => <marker id={`td-trajectory-arrow-${trajectory.id}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto" key={trajectory.id}>
          <path d="M0,0 L5,2.5 L0,5 Z" fill={tdTrajectoryColors[index]} />
        </marker>)}
      </defs>
      {trajectories.map((trajectory, trajectoryIndex) => {
        const active = trajectory.id === activeEpisode
        const offset = offsets[trajectoryIndex]
        const start = tdTrajectoryPoint(trajectory.stateIds[0], offset)
        return <g className={active ? 'is-active' : ''} style={{ '--td-trajectory-color': tdTrajectoryColors[trajectoryIndex] }} key={trajectory.id}>
          {trajectory.stateIds.slice(0, -1).map((stateId, segmentIndex) => {
            const from = tdTrajectoryPoint(stateId, offset)
            const to = tdTrajectoryPoint(trajectory.stateIds[segmentIndex + 1], offset)
            const current = active && segmentIndex === transitionIndex
            const traversed = active && segmentIndex < transitionIndex
            return <line
              className={`${traversed ? 'is-traversed' : ''} ${current ? 'is-current' : ''}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              markerEnd={current ? `url(#td-trajectory-arrow-${trajectory.id})` : undefined}
              key={`${trajectory.id}-${segmentIndex}`}
            />
          })}
          <circle cx={start.x} cy={start.y} r={active ? 1.8 : 1.25} />
        </g>
      })}
    </svg>
  )
}

function TdEvidenceStage({ params, result, zh }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const last = result.frames.length - 1
  const frame = result.frames[Math.min(step, last)]
  const update = result.updates[frame.updateIndex]
  const comparison = update.comparison
  const activeTrajectory = result.trajectories[update.episode - 1]
  const pathStates = new Set(activeTrajectory.stateIds)
  const traversedStates = new Set(activeTrajectory.stateIds.slice(0, update.transitionIndex + 2))

  useEffect(() => {
    setPlaying(false)
    setStep(0)
  }, [params.gamma, params.alpha, params.n])

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= last) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 620)
    return () => window.clearInterval(timer)
  }, [last, playing])

  const move = (next) => {
    setPlaying(false)
    setStep(Math.max(0, Math.min(last, next)))
  }

  const phaseCopy = frame.phase === 'ready'
    ? (zh ? '尚未提交：先观察第一条转移' : 'Before commit: observe the first transition')
    : frame.phase === 'target'
      ? (zh ? '目标与误差已就绪，价值表尚未写回' : 'Target and error are ready; the value table is not committed')
      : (zh ? '修正量已写回；下一帧将把新表作为输入' : 'Correction committed; the next frame reads the updated table')

  return (
    <div className="td-evidence-stage">
      <div className="td-playback-toolbar">
        <div>
          <span>{zh ? `轨迹 ${update.episode} · 转移 ${update.transitionIndex + 1}/${update.episodeLength}` : `Trajectory ${update.episode} · transition ${update.transitionIndex + 1}/${update.episodeLength}`}</span>
          <strong>{phaseCopy}</strong>
        </div>
        <div className="td-playback-actions">
          <button type="button" disabled={step === 0} onClick={() => move(step - 1)}>{zh ? '上一步' : 'Previous'}</button>
          <button type="button" className="is-primary" aria-pressed={playing} onClick={() => { if (step === last) setStep(0); setPlaying((value) => !value) }}>{playing ? (zh ? '暂停' : 'Pause') : (zh ? '自动播放' : 'Auto play')}</button>
          <button type="button" disabled={step === last} onClick={() => move(step + 1)}>{zh ? '下一步' : 'Next'}</button>
          <button type="button" onClick={() => move(0)}>{zh ? '重置播放' : 'Reset playback'}</button>
        </div>
        <label><span>{zh ? '播放位置' : 'Playback position'}</span><input aria-label={zh ? '播放位置' : 'Playback position'} type="range" min="0" max={last} step="1" value={step} onChange={(event) => move(Number(event.target.value))} /></label>
      </div>

      <section className="td-course-grid-panel">
        <header><span>{zh ? '共享网格与在线价值表' : 'Shared grid and online value table'}</span><small>{zh ? '三条轨迹、当前转移和写回值保持同步' : 'Three trajectories, the active transition, and committed values stay synchronized'}</small></header>
        <div className="td-course-grid" role="grid" aria-label={zh ? '共享五乘五网格中的 TD 轨迹' : 'TD trajectory in the shared five-by-five grid'}>
          {result.environment.states.map((state) => {
            const onPath = pathStates.has(state.stateId)
            const current = state.stateId === update.stateId
            const successor = state.stateId === update.nextStateId
            const traversed = traversedStates.has(state.stateId)
            return <div role="gridcell" className={`${state.forbidden ? 'is-forbidden' : ''} ${state.goal ? 'is-goal' : ''} ${onPath ? 'is-path' : ''} ${traversed ? 'is-traversed' : ''} ${current ? 'is-current' : ''} ${successor ? 'is-successor' : ''}`} key={state.stateId}>
              <span className="td-grid-state"><MathFormula latex={String.raw`s_{${state.stateId}}`} /></span>
              <i className="td-grid-center" aria-hidden="true">{state.goal ? '◎' : ''}</i>
              <strong className="td-grid-value"><MathFormula latex={String.raw`${frame.values[state.stateId - 1].toFixed(3)}`} /></strong>
            </div>
          })}
          <TdTrajectoryOverlay trajectories={result.trajectories} activeEpisode={update.episode} transitionIndex={update.transitionIndex} />
        </div>
        <div className="td-trajectory-key">
          {result.trajectories.map((trajectory, index) => <span className={trajectory.id === update.episode ? 'is-active' : ''} style={{ '--td-trajectory-color': tdTrajectoryColors[index] }} key={trajectory.id}>
            <i aria-hidden="true" />
            <b>{zh ? `轨迹 ${trajectory.id}` : `Trajectory ${trajectory.id}`}</b>
            <MathFormula latex={String.raw`s_{${trajectory.startStateId}}\rightarrow s_{18}`} />
            <small>{zh ? `${trajectory.transitions.length} 次转移` : `${trajectory.transitions.length} transitions`}</small>
          </span>)}
        </div>
        <div className="td-grid-legend">
          <span><i className="td-legend-current" />{zh ? '当前状态' : 'current state'}</span>
          <span><i className="td-legend-successor" />{zh ? '后继状态' : 'successor'}</span>
          <span><i className="td-legend-goal" />{zh ? '目标状态，进入时奖励为 1' : 'goal, reward 1 on entry'}</span>
        </div>
      </section>

      <section className="td-update-inspector">
        <header><span>{zh ? '一次 TD(0) 更新的数据流' : 'Data flow of one TD(0) update'}</span><small>{zh ? '黄色为环境证据，蓝色为当前表项' : 'Amber is observed evidence; blue is the current table'}</small></header>
        <div className="td-transition-strip">
          <span><MathFormula latex={String.raw`S_t=s_{${update.stateId}}`} /></span><i>→</i>
          <span><MathFormula latex={String.raw`A_t=\mathrm{${update.action}}`} /></span><i>→</i>
          <span className="is-evidence"><MathFormula latex={String.raw`R_{t+1}=${update.reward}`} /></span><i>→</i>
          <span className="is-successor"><MathFormula latex={String.raw`S_{t+1}=s_{${update.nextStateId}}`} /></span>
        </div>
        <div className="td-update-ledger">
          <article><span>{zh ? '更新前预测' : 'Prediction before'}</span><MathFormula block latex={String.raw`V(S_t)=${update.before.toFixed(3)}`} /></article>
          <article><span>{zh ? '学习目标' : 'Learning target'}</span><MathFormula block latex={String.raw`U_t=${update.reward}+${params.gamma.toFixed(2)}\times${update.successorBefore.toFixed(3)}=${update.target.toFixed(3)}`} /></article>
          <article><span>{zh ? '时间差分误差' : 'TD error'}</span><MathFormula block latex={String.raw`\delta_t=${update.target.toFixed(3)}-${update.before.toFixed(3)}=${update.delta.toFixed(3)}`} /></article>
          <article><span>{zh ? '本次修正' : 'Correction'}</span><MathFormula block latex={String.raw`\alpha\delta_t=${params.alpha.toFixed(2)}\times${update.delta.toFixed(3)}=${update.correction.toFixed(3)}`} /></article>
          <article className={frame.phase === 'commit' ? 'is-committed' : ''}><span>{zh ? '写回价值表' : 'Commit to value table'}</span><MathFormula block latex={String.raw`V(s_{${update.stateId}}):${update.before.toFixed(3)}\rightarrow${update.after.toFixed(3)}`} /><small>{frame.phase === 'commit' ? (zh ? '已提交' : 'committed') : (zh ? '等待提交' : 'pending')}</small></article>
        </div>
        <p>{zh
          ? update.episode === 1 && update.transitionIndex < 2
            ? '终点奖励尚未传播到这里，因此本步修正为零；继续播放即可看到它从后向前逐回合移动。'
            : `本步写回后，状态 s${update.stateId} 的新价值会保留在表中，并成为后续转移或下一回合的输入。`
          : update.episode === 1 && update.transitionIndex < 2
            ? 'The terminal reward has not reached this state yet, so this correction is zero. Continue to watch it propagate backward across episodes.'
            : `After commit, the new value of state s${update.stateId} remains in the table and becomes input to a later transition or the next episode.`}</p>
      </section>

      <section className="td-method-clock">
        <header><span>{zh ? '同一证据下的三种可用时钟' : 'Three availability clocks on the same evidence'}</span><small>{zh ? '只改变等待长度和是否自举' : 'Only wait length and bootstrapping change'}</small></header>
        <div>
          <article className="is-td"><span>TD(0)</span><strong>{zh ? '1 步后' : 'after 1 step'}</strong><MathFormula latex={String.raw`U_t=${comparison.td.toFixed(3)}`} /><p>{zh ? '一个真实奖励，加当前后继估计。' : 'One realized reward plus the current successor estimate.'}</p></article>
          <article><span><MathFormula latex={String.raw`${comparison.horizon}\text{-step}`} /></span><strong>{zh ? `${comparison.horizon} 步后` : `after ${comparison.horizon} steps`}</strong><MathFormula latex={String.raw`G_t^{(${comparison.horizon})}=${comparison.nStep.toFixed(3)}`} /><p>{comparison.bootstrap.terminal ? (zh ? '已经到达终点，不再需要自举尾项。' : 'The horizon reaches termination, so no bootstrap tail remains.') : (zh ? `从状态 s${comparison.bootstrap.stateId} 的当前价值补上尾部。` : `The current value at state s${comparison.bootstrap.stateId} supplies the tail.`)}</p></article>
          <article><span>Monte Carlo</span><strong>{zh ? `${comparison.remaining} 步后` : `after ${comparison.remaining} steps`}</strong><MathFormula latex={String.raw`G_t=${comparison.mc.toFixed(3)}`} /><p>{zh ? '必须等到终点，只使用实际奖励。' : 'Waits for termination and uses realized rewards only.'}</p></article>
        </div>
      </section>
    </div>
  )
}

const controlArrows = { up: '↑', right: '→', down: '↓', left: '←', stay: '○' }
const CONTROL_ACTIONS_FOR_VIEW = ['up', 'right', 'down', 'left', 'stay']

function controlGridPoint(state, grid) {
  return {
    x: ((state % grid.width) + 0.5) * (100 / grid.width),
    y: (Math.floor(state / grid.width) + 0.5) * (100 / grid.height),
  }
}

function ControlTrajectoryOverlay({ path, grid, color, id, currentIndex = path.length - 1 }) {
  const visiblePath = path.slice(0, Math.max(1, currentIndex + 1))
  const points = visiblePath.map((state) => controlGridPoint(state, grid))
  return (
    <svg className={`control-trajectory-overlay is-${color}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker id={`control-arrow-${id}`} markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" />
        </marker>
      </defs>
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1]
        return <line x1={point.x} y1={point.y} x2={next.x} y2={next.y} markerEnd={`url(#control-arrow-${id})`} key={`${point.x}-${point.y}-${index}`} />
      })}
      {points.map((point, index) => <circle className={index === points.length - 1 ? 'is-current' : ''} cx={point.x} cy={point.y} r={index === points.length - 1 ? 2 : 1.25} key={`${point.x}-${point.y}-dot-${index}`} />)}
    </svg>
  )
}

function ControlCourseGrid({ trace, frame, grid, color, id, label, zh }) {
  const q = frame?.q || trace.initialQ
  const policy = frame?.policy || trace.initialPolicy
  const path = frame?.path || [grid.start]
  const currentState = frame?.state ?? grid.start
  const successorState = frame?.nextState ?? null
  return (
    <figure className={`control-course-map is-${color}`}>
      <figcaption><span>{label}</span><small>{zh ? `${trace.warmupEpisodes} 回合预热后，连续显示 ${trace.frames.length} 次写回` : `${trace.warmupEpisodes} warm-up episodes, then ${trace.frames.length} consecutive commits`}</small></figcaption>
      <div className="control-course-grid" style={{ '--control-grid-columns': grid.width }} role="grid" aria-label={zh ? `${label} 在共享五乘五网格中的动态策略与动作价值` : `${label} dynamic policy and action values in the shared five-by-five grid`}>
      {policy.map((action, state) => {
        const stateMeta = grid.states[state]
        const value = Math.max(...q[state])
        return <div role="gridcell" className={`${stateMeta.forbidden ? 'is-forbidden' : ''} ${state === grid.start ? 'is-start' : ''} ${stateMeta.goal ? 'is-goal' : ''} ${state === currentState ? 'is-current' : ''} ${state === successorState ? 'is-successor' : ''}`} key={state}>
          <span className="control-grid-state"><MathFormula latex={String.raw`s_{${state + 1}}`} /></span>
          {(state === grid.start || stateMeta.goal) && <b className="control-grid-role">{state === grid.start ? (zh ? '起点' : 'start') : (zh ? '目标' : 'target')}</b>}
          <i className="control-grid-action" aria-hidden="true">{stateMeta.goal ? '◎' : controlArrows[action]}</i>
          <strong className="control-grid-value"><MathFormula latex={String.raw`${value.toFixed(1)}`} /></strong>
        </div>
      })}
        <ControlTrajectoryOverlay path={path} grid={grid} color={color} id={id} currentIndex={path.length - 1} />
      </div>
    </figure>
  )
}

function ControlEvidenceStage({ params, result, zh }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const traces = result.traces || {}
  const frameCount = Math.min(traces.sarsa?.frames.length || 0, traces.qLearning?.frames.length || 0)
  const last = Math.max(0, frameCount - 1)

  useEffect(() => {
    setPlaying(false)
    setStep(0)
  }, [params.epsilon, params.alpha, params.seed])

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= last) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 520)
    return () => window.clearInterval(timer)
  }, [last, playing])

  if (!traces.sarsa?.frames.length || !traces.qLearning?.frames.length) {
    return <div className="control-evidence-stage"><p>{zh ? '正在重建控制轨迹…' : 'Rebuilding the control trajectory…'}</p></div>
  }

  const sarsaFrame = traces.sarsa.frames[Math.min(step, last)]
  const qFrame = traces.qLearning.frames[Math.min(step, last)]
  const activeTraces = [
    { trace: traces.sarsa, frame: sarsaFrame, color: 'sarsa', id: 'sarsa-live', label: 'Sarsa' },
    { trace: traces.qLearning, frame: qFrame, color: 'q', id: 'q-live', label: 'Q-learning' },
  ]

  const move = (next) => {
    setPlaying(false)
    setStep(Math.max(0, Math.min(last, next)))
  }

  const renderInspector = ({ frame, color, label }) => {
    const selectedIndex = frame.targetActionIndex
    const targetRule = frame.kind === 'sarsa'
      ? String.raw`U_t=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`
      : String.raw`U_t=R_{t+1}+\gamma\max_a Q(S_{t+1},a)`
    return <article className={`control-algorithm-inspector is-${color}`} key={frame.kind}>
      <header><span>{label}</span><small>{frame.kind === 'sarsa' ? (zh ? '读取实际选中的后继动作' : 'reads the realized successor action') : (zh ? '读取后继状态中的最大动作价值' : 'reads the successor maximum')}</small></header>
      <div className="control-transition-row">
        <b><MathFormula latex={String.raw`S_t=s_{${frame.state + 1}}`} /></b><i>→</i>
        <b><MathFormula latex={String.raw`A_t=\mathrm{${frame.action}}`} /></b><i>→</i>
        <b><MathFormula latex={String.raw`R_{t+1}=${frame.reward}`} /></b><i>→</i>
        <b><MathFormula latex={String.raw`S_{t+1}=s_{${frame.nextState + 1}}`} /></b>
      </div>
      {!frame.terminal && <div className="control-successor-strip">
        {frame.successorRow.map((value, index) => <span className={index === selectedIndex ? 'is-selected' : ''} key={CONTROL_ACTIONS_FOR_VIEW[index]}>
          <i>{controlArrows[CONTROL_ACTIONS_FOR_VIEW[index]]}</i><MathFormula latex={String.raw`${value.toFixed(2)}`} />
        </span>)}
      </div>}
      <div className="control-target-rule"><MathFormula block latex={targetRule} /><MathFormula block latex={String.raw`U_t=${frame.target.toFixed(2)},\quad \delta_t=${frame.delta.toFixed(2)}`} /></div>
      <p><MathFormula latex={String.raw`Q(s_{${frame.state + 1}},\mathrm{${frame.action}}):${frame.before.toFixed(2)}\rightarrow${frame.after.toFixed(2)}`} /></p>
      <small className="control-frame-note">{frame.terminal
          ? (zh ? '本步到达终点；下一帧从新回合起点继续。' : 'This step reaches the goal; the next frame starts a new episode.')
          : frame.forbidden
            ? (zh ? '本步进入禁区并收到负奖励；轨迹仍从该状态继续。' : 'This step enters a forbidden state and receives a negative reward; the trajectory continues from there.')
            : frame.boundary
              ? (zh ? '本步撞到边界并留在原状态，同时收到负奖励。' : 'This step hits the boundary, remains in place, and receives a negative reward.')
          : frame.behaviorNextExplored
            ? (zh ? `行为策略下一步探索为 ${controlArrows[frame.behaviorNextAction]}；只有 Sarsa 会把它直接放进 target。` : `Behavior explores ${controlArrows[frame.behaviorNextAction]} next; only Sarsa puts that action directly into its target.`)
            : (zh ? '写回后的动作价值立即成为下一次决策的输入。' : 'The committed action value becomes input to the next decision.')}</small>
    </article>
  }

  return (
    <div className="control-evidence-stage">
      <div className="control-playback-toolbar">
        <div><span>{zh ? `训练写回 ${step + 1}/${frameCount}` : `Training commit ${step + 1}/${frameCount}`}</span><strong>{zh ? '每一帧都会更新 Q 表、动作箭头和当前轨迹' : 'Every frame updates the Q table, policy arrows, and current trajectory'}</strong></div>
        <div className="control-playback-actions">
          <button type="button" disabled={step === 0} onClick={() => move(step - 1)}>{zh ? '上一步' : 'Previous'}</button>
          <button type="button" className="is-primary" aria-pressed={playing} onClick={() => { if (step === last) setStep(0); setPlaying((value) => !value) }}>{playing ? (zh ? '暂停' : 'Pause') : (zh ? '自动播放' : 'Auto play')}</button>
          <button type="button" disabled={step === last} onClick={() => move(step + 1)}>{zh ? '下一步' : 'Next'}</button>
          <button type="button" onClick={() => move(0)}>{zh ? '重置播放' : 'Reset playback'}</button>
        </div>
        <label><span>{zh ? '播放位置' : 'Playback position'}</span><input aria-label={zh ? '控制算法播放位置' : 'Control playback position'} type="range" min="0" max={last} step="1" value={step} onChange={(event) => move(Number(event.target.value))} /></label>
      </div>

      <section className="control-playback-grid-panel">
        <header><span>{zh ? '两种目标规则在同一共享网格中独立学习' : 'Both target rules learn independently in the shared grid'}</span><small>{zh ? '橙色为禁区，青色为目标区；中央箭头来自各自的动作价值表' : 'Orange marks forbidden states, cyan marks the target, and center arrows come from each action-value table'}</small></header>
        <div className="control-live-maps">
          {activeTraces.map((item) => <ControlCourseGrid {...item} grid={result.grid} zh={zh} key={item.id} />)}
        </div>
        <div className="control-grid-legend">
          <span><i className="is-current" />{zh ? '本次更新状态' : 'updated state'}</span>
          <span><i className="is-successor" />{zh ? '实际进入位置' : 'entered location'}</span>
          <span><i className="is-forbidden" />{zh ? '禁区' : 'forbidden state'}</span>
          <span><i className="is-target" />{zh ? '目标区' : 'target state'}</span>
          <span><i className="is-sarsa" />Sarsa {zh ? '轨迹' : 'path'}</span>
          <span><i className="is-q" />Q-learning {zh ? '轨迹' : 'path'}</span>
        </div>
      </section>

      <section className="control-update-inspector">
        <header><span>{zh ? '同一步数下的目标读取与写回' : 'Target readout and commit at the same training index'}</span><small>{zh ? '两种算法独立行动；分歧出现后，轨迹不再被强行固定' : 'The algorithms act independently; their trajectories are not frozen after they diverge'}</small></header>
        <div className="control-live-inspectors">{activeTraces.map(renderInspector)}</div>
      </section>

      <section className="control-training-summary">
        <span>{zh ? `${result.seeds.length} 个固定随机种子的长期训练汇总` : `Long-run aggregate across ${result.seeds.length} fixed seeds`}</span>
        <div><b>Sarsa</b><small>{zh ? '进入禁区的回合' : 'episodes entering forbidden states'} {(result.sarsaForbiddenRate * 100).toFixed(1)}%</small><small>{zh ? '末段回报' : 'late return'} {format(result.sarsaReturn)}</small></div>
        <div><b>Q-learning</b><small>{zh ? '进入禁区的回合' : 'episodes entering forbidden states'} {(result.qForbiddenRate * 100).toFixed(1)}%</small><small>{zh ? '末段回报' : 'late return'} {format(result.qReturn)}</small></div>
      </section>
    </div>
  )
}

function VfaEvidenceStage({ result, zh }) {
  return (
    <div className="vfa-evidence-stage">
      <section>
        <header><span>{zh ? '一次中心状态样本' : 'One center-state sample'}</span><small>{zh ? '特征重叠决定传播范围' : 'Feature overlap sets propagation'}</small></header>
        <div className="vfa-state-strip">
          {result.features.map((feature, index) => <article key={index} style={{ '--feature': feature }}>
            <span><MathFormula latex={String.raw`s_${index + 1}`} /></span>
            <i><b style={{ width: `${feature * 100}%` }} /></i>
            <small>{zh ? '特征激活' : 'feature'} {feature.toFixed(2)}</small>
            <MathFormula block latex={String.raw`${result.before[index].toFixed(2)}\to${result.after[index].toFixed(2)}`} />
          </article>)}
        </div>
      </section>
      <aside className="vfa-update-ledger">
        <span>{zh ? '共享参数产生的连带变化' : 'Coupled changes from shared parameters'}</span>
        <MathFormula block latex={String.raw`\Delta\widehat v(s')=\alpha\delta\,x(s')^\top x(s)`} />
        <p>{zh ? '中心状态误差' : 'Center residual'} <strong>{format(result.centerError)}</strong></p>
        <p>{zh ? '相邻状态改变量' : 'Neighbor change'} <strong>{format(result.spillover)}</strong></p>
        <p>{zh ? '若特征正交，未访问状态不会变化；特征越宽，证据传播越远，干扰也越强。' : 'Orthogonal features isolate states. Wider features spread evidence farther and increase interference.'}</p>
      </aside>
    </div>
  )
}

function DqnEvidenceStage({ params, result, zh }) {
  const sampledKeys = new Set(result.sampledKeys)
  const trackLength = Math.min(params.targetPeriod, 12)
  const trackPosition = result.lastUpdate.synced
    ? trackLength - 1
    : Math.min(trackLength - 1, Math.floor((result.updatesSinceSync / params.targetPeriod) * trackLength))
  const update = result.lastUpdate
  return (
    <div className="dqn-evidence-stage">
      <section className="dqn-buffer">
        <header><span>Replay buffer</span><small>{zh ? '轨迹顺序被保存，高亮项来自实际抽样' : 'Storage preserves time; highlighted rows were actually sampled'}</small></header>
        <div>{result.buffer.map((item) => <article className={sampledKeys.has(item.key) ? 'is-sampled' : ''} key={item.key}>
          <b>{String(item.time + 1).padStart(2, '0')}</b><MathFormula latex={String.raw`(x=${item.feature},a=${item.action},r=${item.reward},x'=${item.nextFeature})`} /><small>{sampledKeys.has(item.key) ? (zh ? '近期抽中' : 'recently sampled') : (zh ? '留在缓冲区' : 'buffered')}</small>
        </article>)}</div>
      </section>
      <section className="dqn-target-clock">
        <header><span>Target network</span><small>{zh ? `每 ${params.targetPeriod} 次更新同步` : `sync every ${params.targetPeriod} updates`}</small></header>
        <div className="dqn-network-pair">
          <article><span>Online</span><MathFormula block latex={String.raw`\theta=(${result.online.map((value) => value.toFixed(2)).join(',')})`} /><p>{zh ? '每个 minibatch 后变化' : 'changes every minibatch'}</p></article>
          <i>→</i>
          <article><span>Target</span><MathFormula block latex={String.raw`\bar\theta=(${result.target.map((value) => value.toFixed(2)).join(',')})`} /><p>{zh ? '同步之间保持冻结' : 'frozen between syncs'}</p></article>
        </div>
        <div className="dqn-sync-track">{Array.from({ length: trackLength }, (_, index) => <i className={`${index <= trackPosition ? 'is-complete' : ''} ${index === trackPosition ? 'is-current' : ''} ${update.synced && index === trackLength - 1 ? 'is-sync' : ''}`} key={index} />)}</div>
        <p>{zh ? '样本相关性' : 'Sample correlation'} <strong>{format(result.correlation)}</strong> · {zh ? '末段 target 漂移' : 'late target drift'} <strong>{format(result.drift)}</strong></p>
      </section>
      <section className="dqn-update-ledger">
        <header><span>{zh ? `第 ${update.number} 次更新的完整数据流` : `Complete data flow for update ${update.number}`}</span><small>{update.synced ? (zh ? '本步触发目标同步' : 'This update triggers target sync') : (zh ? `距下次同步 ${result.stepsUntilSync} 步` : `${result.stepsUntilSync} updates until sync`)}</small></header>
        <div>
          <article><span>{zh ? '① 抽样转移' : '① Sampled transition'}</span><MathFormula block latex={String.raw`e=(${update.sample.feature},${update.sample.action},${update.sample.reward},${update.sample.nextFeature})`} /><small>{zh ? `缓冲区写入时刻 ${update.sample.time + 1}` : `stored at environment step ${update.sample.time + 1}`}</small></article>
          <article><span>{zh ? '② 冻结目标' : '② Frozen target'}</span><MathFormula block latex={String.raw`Y=${update.sample.reward}+0.9\max Q_{\bar\theta}(x',a')=${update.targetValue.toFixed(3)}`} /><small>{zh ? '只读取目标网络' : 'reads target network only'}</small></article>
          <article><span>{zh ? '③ 时序差分误差' : '③ TD error'}</span><MathFormula block latex={String.raw`\delta=Y-Q_\theta(x,a)=${update.error.toFixed(3)}`} /><small>{zh ? `更新前预测 ${update.prediction.toFixed(3)}` : `prediction before ${update.prediction.toFixed(3)}`}</small></article>
          <article><span>{zh ? '④ 在线网络更新' : '④ Online update'}</span><MathFormula block latex={String.raw`\Delta\theta=(${update.updateVector.map((value) => value.toFixed(3)).join(',')})`} /><small>{update.onlineBefore.map((value) => value.toFixed(2)).join(', ')} → {update.onlineAfter.map((value) => value.toFixed(2)).join(', ')}</small></article>
          <article className={update.synced ? 'is-synced' : ''}><span>{zh ? '⑤ 目标网络时钟' : '⑤ Target clock'}</span><MathFormula block latex={update.synced ? String.raw`\bar\theta\leftarrow\theta` : zh ? String.raw`\bar\theta\ \text{保持冻结}` : String.raw`\bar\theta\ \text{remains frozen}`} /><small>{update.synced ? (zh ? '复制更新后的在线参数' : 'copies updated online parameters') : (zh ? '本步不复制参数' : 'no parameter copy on this update')}</small></article>
        </div>
      </section>
    </div>
  )
}

function PolicyGradientEvidenceStage({ params, result, zh, set }) {
  const actionLabels = zh ? ['上移', '右移', '等待'] : ['Up', 'Right', 'Wait']
  return (
    <div className="pg-evidence-stage">
      <section className="pg-trajectory">
        <header><span>{zh ? '一条轨迹中的逐步梯度贡献' : 'Per-step gradient contributions along one trajectory'}</span><small>{zh ? '每个状态都有自己的动作分布' : 'Every state has its own action distribution'}</small></header>
        <div>{result.stepContributions.map((item) => <button type="button" className={result.selectedStep === item.step ? 'is-selected' : ''} aria-pressed={result.selectedStep === item.step} onClick={() => set('selectedStep', item.step)} key={item.step}>
          <b><MathFormula latex={String.raw`S_${item.step}=s_{${item.stateId}}`} /></b>
          <span><MathFormula latex={String.raw`A_${item.step}=a_${item.actionIndex + 1}`} /></span>
          <span><MathFormula latex={String.raw`G_${item.step}=${item.return}`} /></span>
          <span><MathFormula latex={String.raw`G_${item.step}-b=${item.advantage.toFixed(2)}`} /></span>
          <small><MathFormula latex={String.raw`\lVert\widehat g_${item.step}\rVert=${item.contributionNorm.toFixed(3)}`} /></small>
        </button>)}</div>
      </section>
      <aside className="pg-gradient-ledger">
        <span>{zh ? `状态 s${result.stateIds[result.selectedStep]}：三个动作重新分配概率` : `State s${result.stateIds[result.selectedStep]}: probability redistributes across three actions`}</span>
        <MathFormula block latex={String.raw`\nabla_\theta\log\pi_\theta(A_t\mid S_t)(G_t-b)`} />
        <div className="pg-probability-ledger">
          {result.probabilities.map((probability, index) => (
            <article className={index === result.actionIndex ? 'is-selected' : ''} key={actionLabels[index]}>
              <header>
                <span>{actionLabels[index]}{index === result.actionIndex ? (zh ? '（本次选择）' : ' (sampled)') : ''}</span>
                <strong>{probability.toFixed(3)} → {result.nextProbabilities[index].toFixed(3)}</strong>
              </header>
              <div aria-hidden="true"><i style={{ width: `${probability * 100}%` }} /><b style={{ width: `${result.nextProbabilities[index] * 100}%` }} /></div>
            </article>
          ))}
        </div>
        <p>{result.weight >= 0 ? (zh ? '结果高于基线，所选动作概率上升。' : 'Outcome exceeds baseline, so sampled-action probability rises.') : (zh ? '结果低于基线，所选动作概率下降。' : 'Outcome falls below baseline, so sampled-action probability falls.')}</p>
      </aside>
      <section className="pg-variance-panel">
        <header><span>{zh ? '同一状态上的多轨迹梯度方差' : 'Multi-trajectory gradient variance at the same state'}</span><small>{zh ? '监测所选动作 logit 的梯度坐标' : 'Tracking the selected-action logit coordinate'}</small></header>
        <div className="pg-rollout-ledger">
          <div className="is-head"><b>{zh ? '轨迹' : 'Rollout'}</b><b>{zh ? '采样动作' : 'Sampled action'}</b><b><MathFormula latex={String.raw`G`} /></b><b>{zh ? '无基线贡献' : 'No baseline'}</b><b>{zh ? '减去状态基线' : 'With state baseline'}</b></div>
          {result.rollouts.map((rollout) => <div key={rollout.id}><span>#{rollout.id}</span><span>{actionLabels[rollout.actionIndex]}</span><MathFormula latex={String.raw`${rollout.return.toFixed(2)}`} /><MathFormula latex={String.raw`${rollout.rawContribution.toFixed(3)}`} /><MathFormula latex={String.raw`${rollout.centeredContribution.toFixed(3)}`} /></div>)}
        </div>
        <div className="pg-variance-summary">
          <span>{zh ? '不使用基线' : 'Without baseline'} <strong>{format(result.varianceWithoutBaseline)}</strong></span>
          <i>→</i>
          <span>{zh ? '使用状态基线' : 'With state baseline'} <strong>{format(result.varianceWithBaseline)}</strong></span>
        </div>
      </section>
    </div>
  )
}

function ActorCriticEvidenceStage({ params, result, zh }) {
  const actionLabels = zh ? ['上移', '右移', '等待'] : ['Up', 'Right', 'Wait']
  return (
    <div className="ac-evidence-stage">
      <section className="ac-transition">
        <header><span>{zh ? '一条 transition，两条梯度路径' : 'One transition, two gradient paths'}</span></header>
        <div className="ac-transition-row">
          <article><span><MathFormula latex={String.raw`R_{t+1}`} /></span><strong>{format(params.reward)}</strong></article>
          <i>+</i>
          <article><span><MathFormula latex={String.raw`\gamma V_\phi(S_{t+1})`} /></span><strong>{format(params.gamma * params.nextValue)}</strong></article>
          <i>−</i>
          <article><span><MathFormula latex={String.raw`V_\phi(S_t)`} /></span><strong>{format(params.value)}</strong></article>
          <i>=</i>
          <article className="is-delta"><span><MathFormula latex={String.raw`\delta_t`} /></span><strong>{format(result.delta)}</strong></article>
        </div>
      </section>
      <section className="ac-two-updates">
        <article className="ac-critic-ledger">
          <header><span>Critic</span><small>{zh ? '拟合一步价值目标' : 'Fits the one-step value target'}</small></header>
          <MathFormula block latex={String.raw`\phi\leftarrow\phi+\alpha_v\delta_t\nabla_\phi V_\phi(S_t)`} />
          <div className="ac-before-after">
            <span>{zh ? '更新前价值' : 'Value before'}<strong>{format(result.critic.valueBefore)}</strong></span>
            <i>+</i>
            <span>{zh ? '价值修正量' : 'Value correction'}<strong>{format(result.critic.correction)}</strong></span>
            <i>→</i>
            <span className="is-after">{zh ? '更新后价值' : 'Value after'}<strong>{format(result.critic.valueAfter)}</strong></span>
          </div>
          <p>{zh ? '一步目标' : 'One-step target'} <strong>{format(result.critic.target)}</strong> · <MathFormula latex={String.raw`\delta_t=${result.delta.toFixed(3)}`} /></p>
        </article>
        <article className="ac-actor-ledger">
          <header><span>Actor</span><small>{zh ? '同一误差改变所选动作概率' : 'The same error changes sampled-action probability'}</small></header>
          <MathFormula block latex={String.raw`\theta\leftarrow\theta+\alpha_\pi\rho_t\delta_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)`} />
          <div className="ac-policy-ledger">
            {result.actor.logitsBefore.map((logit, index) => <div className={index === result.actor.actionIndex ? 'is-sampled' : ''} key={actionLabels[index]}>
              <span>{actionLabels[index]}{index === result.actor.actionIndex ? (zh ? '（已采样）' : ' (sampled)') : ''}</span>
              <MathFormula latex={String.raw`h:${logit.toFixed(2)}\to${result.actor.logitsAfter[index].toFixed(2)}`} />
              <MathFormula latex={String.raw`\pi:${result.actor.probabilitiesBefore[index].toFixed(3)}\to${result.actor.probabilitiesAfter[index].toFixed(3)}`} />
            </div>)}
          </div>
          <p>{zh ? '策略更新系数' : 'Policy update coefficient'} <strong>{format(result.actorStep)}</strong> · <MathFormula latex={String.raw`\rho_t=${params.ratio.toFixed(2)}`} /></p>
        </article>
      </section>
    </div>
  )
}

function DedicatedLearningStage({ id, params, result, zh, set }) {
  if (id === 'td') return <TdEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'control') return <ControlEvidenceStage key={`${params.epsilon}-${params.alpha}-${params.seed}`} params={params} result={result} zh={zh} />
  if (id === 'vfa') return <VfaEvidenceStage result={result} zh={zh} />
  if (id === 'dqn') return <DqnEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'policygradient') return <PolicyGradientEvidenceStage params={params} result={result} zh={zh} set={set} />
  if (id === 'actorcritic') return <ActorCriticEvidenceStage params={params} result={result} zh={zh} />
  return null
}

export default function LearningLab({ id, lang, content }) {
  const [params, setParams] = useState(defaults[id])
  const zh = lang === 'zh'
  const config = configs[id]
  const result = useMemo(() => learningLabRunners[id](params), [id, params])
  const metrics = config.metrics(result, zh)
  const scenario = scenarioCopy[id]?.[lang]
  const set = (key, value) => setParams((current) => ({ ...current, [key]: value }))
  return (
    <section className={`learning-lab learning-lab-${id}`} aria-label={content.figure}>
      <header className="learning-lab-heading"><div><span>{content.figure}</span><p><MathText>{content.instruction}</MathText></p></div><button type="button" onClick={() => setParams(defaults[id])}>{zh ? '恢复基线' : 'Reset baseline'}</button></header>
      <div className="learning-lab-question"><span>{zh ? '本实验回答' : 'Question'}</span><strong><MathText>{content.question}</MathText></strong></div>
      {scenario && <div className="experiment-environment"><span>{scenario[0]}</span><MathFormula latex={scenario[1]} /><small>{scenario[2]}</small></div>}
      <div className="learning-lab-controls">
        {config.controls.map(([key, min, max, step], index) => <label key={key}><span><MathText>{config.labels[lang][index]}</MathText><output>{format(params[key])}</output></span><input aria-label={config.labels[lang][index]} type="range" min={min} max={max} step={step} value={params[key]} onChange={(event) => set(key, Number(event.target.value))} /></label>)}
        {id === 'montecarlo' && <fieldset><legend>{zh ? '访问协议' : 'Visit protocol'}</legend><div>{['first', 'every'].map((value) => <button type="button" key={value} className={params.visit === value ? 'active' : ''} aria-pressed={params.visit === value} onClick={() => set('visit', value)}>{value === 'first' ? (zh ? '首次访问' : 'First visit') : (zh ? '每次访问' : 'Every visit')}</button>)}</div></fieldset>}
        {id === 'approximation' && <fieldset><legend>{zh ? '步长调度' : 'Step schedule'}</legend><div>{[true, false].map((value) => <button type="button" key={String(value)} className={params.decay === value ? 'active' : ''} aria-pressed={params.decay === value} onClick={() => set('decay', value)}><MathText>{value ? (zh ? '衰减 1/k' : 'Decay 1/k') : (zh ? '固定 α' : 'Constant α')}</MathText></button>)}</div></fieldset>}
      </div>
      <DedicatedLearningStage id={id} params={params} result={result} zh={zh} set={set} />
      {id !== 'td' && <aside className="learning-compact-summary">
        <MathFormula latex={config.formula} />
        <div className="learning-summary-metrics">{metrics.map(([label, value]) => <span key={label}><small><MathText>{label}</MathText></small><strong>{format(value)}</strong></span>)}</div>
      </aside>}
      <footer><span>{zh ? '读图提示' : 'Reading cue'}</span><p><MathText>{content.explorer.cue}</MathText></p></footer>
    </section>
  )
}
