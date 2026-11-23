import { useEffect, useMemo, useState } from 'react'
import MathFormula from './MathFormula'
import MathText from './MathText'
import { learningLabRunners } from '../engine/learning-labs.js'

const defaults = {
  montecarlo: { episodes: 24, epsilon: 0.2, seed: 20260719, visit: 'first' },
  approximation: { alpha: 0.18, decay: true, noise: 1.4, steps: 48, seed: 20260719 },
  td: { gamma: 0.9, alpha: 0.4, n: 2 },
  control: { epsilon: 0.12, alpha: 0.3, seed: 20260719 },
  vfa: { width: 1.2, alpha: 0.35, target: 5, scenario: 'interfere' },
  dqn: { replay: 1, targetPeriod: 8, steps: 40 },
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
    zh: ['网格状态的共享表示', String.raw`s_{11}\leftrightarrow s_{12}\leftrightarrow s_{13}\leftrightarrow s_{14}\leftrightarrow s_{15}`, '同一行中五个相邻网格状态共享特征，因此一次中心样本更新会传播到未被直接采样的邻居。'],
    en: ['Shared representation of grid states', String.raw`s_{11}\leftrightarrow s_{12}\leftrightarrow s_{13}\leftrightarrow s_{14}\leftrightarrow s_{15}`, 'Five neighboring grid states share features, so one center-state update propagates beyond the sampled state.'],
  },
  dqn: {
    zh: ['网格转移进入回放缓冲区', String.raw`\mathcal D=\{(s_t,a_t,r_{t+1},s_{t+1})\}`, '状态先被编码成特征，再以真实转移的形式写入 replay buffer。'],
    en: ['Grid transitions enter replay', String.raw`\mathcal D=\{(s_t,a_t,r_{t+1},s_{t+1})\}`, 'Grid states are encoded as features and stored as observed transitions in replay.'],
  },
  policygradient: {
    zh: ['一条网格策略轨迹与 12 回合对照流', String.raw`s_1\xrightarrow{a_1}s_2\xrightarrow{a_2}s_7\xrightarrow{a_3}s_8`, '上方对比同一条 12 回合采样流在有无状态基线下的策略演化；下方拆解单条轨迹每个时间步的因果回报与概率单纯形重分配。'],
    en: ['One grid-policy trajectory and a 12-episode counterfactual stream', String.raw`s_1\xrightarrow{a_1}s_2\xrightarrow{a_2}s_7\xrightarrow{a_3}s_8`, 'The top plot compares policy evolution with vs without a state baseline on the same 12-episode stream; the lower stage inspects per-step causal return and probability-simplex redistribution.'],
  },
  actorcritic: {
    zh: ['一步转移双路径与 16 步双时间尺度闭环', String.raw`s_7\xrightarrow{a=\mathrm{right},\,r=1}s_8`, '同一条转移的 TD 误差同时更新 Critic 与 Actor；上方 16 步闭环实时呈现 Critic 追踪真实价值与 Actor 响应的速度耦合。'],
    en: ['One-transition dual path and 16-step two-timescale loop', String.raw`s_7\xrightarrow{a=\mathrm{right},\,r=1}s_8`, 'The same transition TD error updates both critic and actor; the 16-step loop above exposes how critic tracking speed couples to actor stability.'],
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
    formula: String.raw`\mathbf w_{t+1}=\mathbf w_t+\alpha\left(U_t-\widehat v(S_t,\mathbf w_t)\right)\boldsymbol\phi(S_t)`,
    controls: [['width', 0.35, 2.5, 0.05], ['alpha', 0.05, 0.6, 0.05]],
    labels: { zh: ['特征宽度 σ', '步长 α'], en: ['Feature width σ', 'Step size α'] },
    metrics: (r, zh) => [
      [zh ? '线性均方误差' : 'Linear MSE', r.linearMse],
      [zh ? '同数据表格 MSE' : 'Tabular MSE', r.tabularMse],
      [zh ? '禁区—目标内积' : 'Forbidden–goal overlap', r.conflictInnerProduct],
    ],
  },
  dqn: {
    formula: String.raw`Y=R+\gamma\max_{a'}Q_{\bar\theta}(S',a'),\qquad\theta\leftarrow\theta-\alpha\nabla_\theta(Y-Q_\theta(S,A))^2`,
    controls: [['replay', 0, 1, 0.05], ['targetPeriod', 1, 16, 1]],
    labels: { zh: ['经验回放比例', '目标同步周期 C'], en: ['Replay mixing', 'Target sync period C'] },
    metrics: (r, zh) => [
      [zh ? '样本相关性' : 'Sample correlation', r.correlation],
      [zh ? '目标移动频率' : 'Target move rate', `${(r.targetMoveRate * 100).toFixed(0)}%`],
      [zh ? '被复用转移数' : 'Reused transitions', r.reusedTransitionCount],
    ],
  },
  policygradient: {
    formula: String.raw`\theta\leftarrow\theta+\alpha\,\nabla_\theta\log\pi_\theta(A\mid S)\,(G-b)`,
    controls: [['theta', -2.5, 2.5, 0.1], ['alpha', 0.02, 0.5, 0.02], ['baseline', -2, 2, 0.1]],
    labels: { zh: ['所选动作 logit $\\theta$', '步长 $\\alpha$', '状态基线 $b$'], en: ['Action logit $\\theta$', 'Step size $\\alpha$', 'State baseline $b$'] },
    metrics: (r, zh) => [[zh ? '所选动作：更新前' : 'Selected: before', r.probability], [zh ? '所选动作：更新后' : 'Selected: after', r.nextProbability], [zh ? '基线后梯度方差' : 'Variance with baseline', r.varianceWithBaseline]],
  },
  actorcritic: {
    formula: String.raw`\delta=R+\gamma V_\phi(S')-V_\phi(S),\quad\theta\leftarrow\theta+\alpha_\theta\rho\,\delta\nabla_\theta\log\pi_\theta(A\mid S)`,
    controls: [['reward', -2, 4, 0.1], ['nextValue', -1, 5, 0.1], ['ratio', 0.4, 1.8, 0.05]],
    labels: { zh: ['即时奖励 $R_{t+1}$', '后继价值 $V_\\phi(S_{t+1})$', '重要性比率 $\\rho_t$'], en: ['Immediate reward $R_{t+1}$', 'Successor value $V_\\phi(S_{t+1})$', 'Importance ratio $\\rho_t$'] },
    metrics: (r, zh) => [[zh ? 'TD 误差 $\\delta_t$' : 'TD error $\\delta_t$', r.delta], [zh ? 'Critic 更新后' : 'Critic after', r.nextValueEstimate], [zh ? 'Actor 步长' : 'Actor step', r.actorStep]],
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

function VfaEvidenceStage({ params, result, zh, set }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const frames = result.frames || []
  const last = Math.max(0, frames.length - 1)

  useEffect(() => {
    setPlaying(false)
    setStep(0)
  }, [params.width, params.alpha, params.scenario])

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
    }, 850)
    return () => window.clearInterval(timer)
  }, [last, playing])

  const frame = frames[Math.min(step, last)]
  if (!frame) return null

  const move = (next) => {
    setPlaying(false)
    setStep(Math.max(0, Math.min(last, next)))
  }

  const scenarioLabel = params.scenario === 'generalize'
    ? (zh ? '有益泛化 · 平滑安全走廊' : 'Beneficial generalization · smooth corridor')
    : (zh ? '冲突干扰 · 禁区紧邻目标' : 'Conflicting interference · forbidden beside goal')

  return (
    <div className="vfa-evidence-stage">
      <div className="vfa-toolbar">
        <div className="vfa-scenario-switch" role="group" aria-label={zh ? '函数近似场景' : 'Approximation scenario'}>
          <button type="button" className={params.scenario === 'generalize' ? 'active' : ''} aria-pressed={params.scenario === 'generalize'} onClick={() => set('scenario', 'generalize')}>
            {zh ? '有益泛化（未访问邻居）' : 'Generalization (unvisited neighbor)'}
          </button>
          <button type="button" className={params.scenario === 'interfere' ? 'active' : ''} aria-pressed={params.scenario === 'interfere'} onClick={() => set('scenario', 'interfere')}>
            {zh ? '冲突干扰（禁区与目标边界）' : 'Interference (forbidden–goal boundary)'}
          </button>
        </div>
        <div className="vfa-playback-bar">
          <div className="vfa-playback-status">
            <span>{zh ? `参数写回 ${step + 1}/${frames.length}` : `Weight commit ${step + 1}/${frames.length}`}</span>
            <strong>{scenarioLabel}</strong>
          </div>
          <div className="vfa-playback-actions">
            <button type="button" disabled={step === 0} onClick={() => move(step - 1)}>{zh ? '上一步' : 'Previous'}</button>
            <button type="button" className="is-primary" aria-pressed={playing} onClick={() => { if (step === last) setStep(0); setPlaying((value) => !value) }}>{playing ? (zh ? '暂停' : 'Pause') : (zh ? '自动播放' : 'Auto play')}</button>
            <button type="button" disabled={step === last} onClick={() => move(step + 1)}>{zh ? '下一步' : 'Next'}</button>
            <button type="button" onClick={() => move(0)}>{zh ? '重置' : 'Reset'}</button>
          </div>
          <label className="vfa-playback-slider">
            <span>{zh ? '写回进度' : 'Commit step'}</span>
            <input aria-label={zh ? '函数近似写回步数' : 'Function approximation commit step'} type="range" min="0" max={last} step="1" value={step} onChange={(event) => move(Number(event.target.value))} />
          </label>
        </div>
      </div>

      <div className="vfa-main-grid">
        <section className="vfa-course-panel">
          <header>
            <span>{zh ? '共享 5×5 网格上的实时预测与连带变化' : 'Live predictions and coupled deltas on the shared 5×5 grid'}</span>
            <small>{zh ? '高亮格为本次采样状态；括号内为本步写回引起的改变量' : 'Highlighted cell is sampled now; signed numbers show this commit’s delta'}</small>
          </header>
          <div className="vfa-course-grid" role="grid" aria-label={zh ? '价值函数近似共享五乘五网格' : 'Value function approximation shared five-by-five grid'}>
            {result.grid.states.map((state) => {
              const valueAfter = frame.valuesAfter[state.index]
              const delta = frame.deltas[state.index]
              const isSampled = state.stateId === frame.stateId
              const isProbe = state.stateId === frame.probeStateId
              const hasDelta = Math.abs(delta) >= 0.01
              return (
                <div
                  role="gridcell"
                  key={state.stateId}
                  className={`vfa-grid-cell${state.forbidden ? ' is-forbidden' : ''}${state.goal ? ' is-goal' : ''}${isSampled ? ' is-sampled' : ''}${isProbe ? ' is-probe' : ''}`}
                >
                  <span className="vfa-cell-state"><MathFormula latex={String.raw`s_{${state.stateId}}`} /></span>
                  <strong className="vfa-cell-value"><MathFormula latex={String.raw`${valueAfter.toFixed(2)}`} /></strong>
                  <small className={`vfa-cell-delta${delta > 0.01 ? ' is-pos' : delta < -0.01 ? ' is-neg' : ''}`}>
                    {hasDelta ? <MathFormula latex={String.raw`${delta > 0 ? '+' : ''}${delta.toFixed(2)}`} /> : '—'}
                  </small>
                </div>
              )
            })}
          </div>
          <div className="vfa-grid-legend">
            <span><i className="is-sampled" />{zh ? '本次采样状态' : 'sampled state'}</span>
            <span><i className="is-probe" />{zh ? '观测对照格' : 'tracked probe state'}</span>
            <span><i className="is-forbidden" />{zh ? '禁区' : 'forbidden state'}</span>
            <span><i className="is-goal" />{zh ? '目标区' : 'target state'}</span>
          </div>
        </section>

        <aside className="vfa-update-ledger">
          <span>{zh ? `第 ${step + 1} 步半梯度写回与表格对照` : `Commit ${step + 1}: semi-gradient update vs tabular`}</span>
          <div className="vfa-step-summary">
            <MathFormula block latex={String.raw`S_t=s_{${frame.stateId}},\quad U_t=${frame.target.toFixed(1)},\quad \delta_t=${frame.error.toFixed(2)}`} />
            <MathFormula block latex={String.raw`\Delta\widehat v(s')=\alpha\delta_t\,\boldsymbol\phi(s')^{\top}\boldsymbol\phi(s_{${frame.stateId}})`} />
          </div>
          <div className="vfa-weight-ledger">
            <div className="vfa-weight-head">
              <b>{zh ? '特征锚点' : 'Anchor'}</b>
              <b><MathFormula latex={String.raw`w_j`} /></b>
              <b><MathFormula latex={String.raw`\Delta w_j`} /></b>
              <b><MathFormula latex={String.raw`w'_j`} /></b>
            </div>
            {result.anchors.map((anchorId, index) => (
              <div className={`vfa-weight-row${anchorId === frame.stateId ? ' is-active' : ''}`} key={anchorId}>
                <span><MathFormula latex={String.raw`s_{${anchorId}}`} /></span>
                <MathFormula latex={String.raw`${frame.weightsBefore[index].toFixed(2)}`} />
                <MathFormula latex={String.raw`${frame.deltaWeights[index] >= 0 ? '+' : ''}${frame.deltaWeights[index].toFixed(2)}`} />
                <MathFormula latex={String.raw`${frame.weightsAfter[index].toFixed(2)}`} />
              </div>
            ))}
          </div>
          <div className={`vfa-counterfactual-box${frame.causedInterference ? ' is-warn' : ''}`}>
            <header>
              <span>{zh ? '同数据反事实：线性共享 vs 独热表格' : 'Same-data counterfactual: shared linear vs tabular'}</span>
              {frame.causedInterference && <em className="vfa-warn-badge">{zh ? '本步产生干扰' : 'Interference'}</em>}
            </header>
            <div className="vfa-cf-rows">
              <div>
                <small>{zh ? '观测格 ' : 'Probe '}<MathFormula latex={String.raw`s_{${frame.probeStateId}}`} />{zh ? '（真实 ' : ' (truth '}<MathFormula latex={String.raw`${frame.probeTruth.toFixed(1)}`} />{zh ? '）' : ')'}</small>
                <strong>{zh ? '线性 ' : 'Linear '}<MathFormula latex={String.raw`${frame.probeLinearAfter.toFixed(2)}`} /> · {zh ? '表格 ' : 'Tabular '}<MathFormula latex={String.raw`${frame.probeTabularAfter.toFixed(2)}`} /></strong>
              </div>
              <div>
                <small>{zh ? '6 格基准均方误差' : '6-state reference MSE'}</small>
                <strong>{zh ? '线性 ' : 'Linear '}<MathFormula latex={String.raw`${frame.linearMse.toFixed(2)}`} /> · {zh ? '表格 ' : 'Tabular '}<MathFormula latex={String.raw`${frame.tabularMse.toFixed(2)}`} /></strong>
              </div>
            </div>
            <p className="vfa-cf-note">{frame.causedInterference
              ? (zh
                ? <>本次采样 <MathFormula latex={String.raw`s_{${frame.stateId}}`} /> 把共享参数向相反方向拉动，使观测格 <MathFormula latex={String.raw`s_{${frame.probeStateId}}`} /> 发生 <MathFormula latex={String.raw`${frame.probeDelta.toFixed(2)}`} /> 的反向漂移；独热表格在该格改变量为零。</>
                : <>Sampling <MathFormula latex={String.raw`s_{${frame.stateId}}`} /> pulled shared weights the opposite way, shifting probe <MathFormula latex={String.raw`s_{${frame.probeStateId}}`} /> by <MathFormula latex={String.raw`${frame.probeDelta.toFixed(2)}`} />; tabular storage left it untouched.</>)
              : params.scenario === 'generalize'
                ? (zh
                  ? <>即使 <MathFormula latex={String.raw`s_{15}`} /> 从未被直接采样，宽特征仍把邻居样本通过内积传播过来；表格法只能将未访问格停留在 <MathFormula latex={String.raw`0.00`} />。</>
                  : <>Even though <MathFormula latex={String.raw`s_{15}`} /> is never directly sampled, overlapping features transfer neighbor evidence while tabular storage remains at <MathFormula latex={String.raw`0.00`} />.</>)
                : (zh
                  ? <>缩小特征宽度 <MathFormula latex={String.raw`\sigma`} /> 会压低 <MathFormula latex={String.raw`\boldsymbol\phi(s_{13})^{\top}\boldsymbol\phi(s_{18})`} />，使禁区与目标格重新解耦。</>
                  : <>Reducing feature width <MathFormula latex={String.raw`\sigma`} /> shrinks <MathFormula latex={String.raw`\boldsymbol\phi(s_{13})^{\top}\boldsymbol\phi(s_{18})`} />, decoupling the forbidden cell from the target.</>)}</p>
          </div>
        </aside>
      </div>

      <section className="vfa-row-panel">
        <header>
          <span>{zh ? '第三行相邻状态的特征内积与本步前后预测' : 'Row-3 feature inner products and before/after values on this commit'}</span>
          <small>{zh ? '内积越大，该格随本次采样同步移动的幅度越大' : 'Larger inner product means larger coupled movement on this step'}</small>
        </header>
        <div className="vfa-state-strip">
          {result.rowStateIds.map((stateId, index) => {
            const overlap = frame.rowInnerProducts[index]
            return (
              <article className={stateId === frame.stateId ? 'is-active' : ''} key={stateId} style={{ '--feature': overlap }}>
                <span><MathFormula latex={String.raw`s_{${index + 11}}`} /></span>
                <i><b style={{ width: `${Math.max(0, Math.min(1, overlap)) * 100}%` }} /></i>
                <small>{zh ? '特征内积' : 'overlap'} {overlap.toFixed(2)}</small>
                <MathFormula block latex={String.raw`${frame.rowBefore[index].toFixed(2)}\to${frame.rowAfter[index].toFixed(2)}`} />
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function DqnCurveChart({ frames, naiveSeries, currentIndex, targetPeriod, zh }) {
  const width = 680
  const height = 210
  const pad = { left: 46, right: 18, top: 18, bottom: 28 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const allValues = [
    ...frames.map((frame) => frame.probeOnlineQ),
    ...frames.map((frame) => frame.probeTargetQ),
    ...(naiveSeries || []),
  ]
  const minVal = Math.min(...allValues, 0) - 0.15
  const maxVal = Math.max(...allValues, 1) + 0.15
  const span = Math.max(0.5, maxVal - minVal)
  const x = (index) => pad.left + (frames.length <= 1 ? 0 : (index / (frames.length - 1)) * plotW)
  const y = (value) => pad.top + ((maxVal - value) / span) * plotH

  const linePath = (values) => values.map((val, idx) => `${idx === 0 ? 'M' : 'L'}${x(idx).toFixed(1)},${y(val).toFixed(1)}`).join(' ')
  const staircasePath = (items) => items.map((frame, idx) => {
    const px = x(idx).toFixed(1)
    const pyBefore = y(frame.probeTargetBeforeQ).toFixed(1)
    const pyAfter = y(frame.probeTargetQ).toFixed(1)
    if (idx === 0) return `M${px},${pyBefore} L${px},${pyAfter}`
    return `L${px},${pyBefore} L${px},${pyAfter}`
  }).join(' ')

  const syncIndices = frames.map((frame, idx) => (frame.synced ? idx : -1)).filter((idx) => idx >= 0)
  const active = frames[currentIndex]

  return (
    <svg className="dqn-curve-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={zh ? '在线网络、冻结目标网络与朴素基线的动作价值演化曲线' : 'Action-value trajectories for online network, frozen target network, and naive baseline'}>
      <line className="dqn-axis" x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} />
      <line className="dqn-axis" x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} />
      {targetPeriod > 1 && syncIndices.map((idx) => (
        <line className="dqn-sync-marker" key={idx} x1={x(idx)} x2={x(idx)} y1={pad.top} y2={height - pad.bottom} />
      ))}
      {naiveSeries?.length > 1 && <path className="dqn-curve-naive" d={linePath(naiveSeries)} />}
      <path className="dqn-curve-target" d={staircasePath(frames)} />
      <path className="dqn-curve-online" d={linePath(frames.map((frame) => frame.probeOnlineQ))} />
      <line className="dqn-cursor-line" x1={x(currentIndex)} x2={x(currentIndex)} y1={pad.top} y2={height - pad.bottom} />
      <circle className="dqn-cursor-target" cx={x(currentIndex)} cy={y(active.probeTargetQ)} r="4.5" />
      <circle className="dqn-cursor-online" cx={x(currentIndex)} cy={y(active.probeOnlineQ)} r="5" />
      <text className="dqn-axis-tick" x={pad.left - 6} y={pad.top + 8} textAnchor="end">{maxVal.toFixed(1)}</text>
      <text className="dqn-axis-tick" x={pad.left - 6} y={height - pad.bottom} textAnchor="end">{minVal.toFixed(1)}</text>
      <text className="dqn-axis-tick" x={pad.left} y={height - 8} textAnchor="start">1</text>
      <text className="dqn-axis-tick" x={width - pad.right} y={height - 8} textAnchor="end">{frames.length}</text>
      <text className="dqn-axis-tick" x={pad.left + plotW / 2} y={height - 8} textAnchor="middle">{zh ? '在线梯度更新步数' : 'Online gradient update step'}</text>
    </svg>
  )
}

function DqnEvidenceStage({ params, result, zh, setMany }) {
  const frames = result.frames || []
  const last = Math.max(0, frames.length - 1)
  const [step, setStep] = useState(Math.min(7, last))
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPlaying(false)
    setStep((current) => Math.min(current, last))
  }, [params.replay, params.targetPeriod, last])

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

  const update = frames[Math.min(step, last)] || result.lastUpdate
  const frameIndex = Math.min(step, last)
  const recentKeys = new Set(update.recentSampledKeys || result.sampledKeys)
  const bufferRows = update.bufferWindow || result.buffer
  const trackLength = Math.min(params.targetPeriod, 12)
  const trackPosition = update.synced
    ? trackLength - 1
    : Math.min(trackLength - 1, Math.floor(((update.updatesSinceSync ?? result.updatesSinceSync) / params.targetPeriod) * trackLength))

  const presets = [
    { id: 'naive', replay: 0, targetPeriod: 1, zh: '① 朴素网络（无冻结 + 顺序）', en: '① Naive (no freeze + sequential)' },
    { id: 'target', replay: 0, targetPeriod: 8, zh: '② 仅目标网络（8 步冻结 + 顺序）', en: '② Target only (8-step freeze + sequential)' },
    { id: 'replay', replay: 1, targetPeriod: 1, zh: '③ 仅经验回放（无冻结 + 随机）', en: '③ Replay only (no freeze + shuffled)' },
    { id: 'full', replay: 1, targetPeriod: 8, zh: '④ 完整 DQN（8 步冻结 + 随机）', en: '④ Full DQN (8-step freeze + shuffled)' },
  ]

  const move = (next) => {
    setPlaying(false)
    setStep(Math.max(0, Math.min(last, next)))
  }

  const jumpToNextSync = () => {
    const nextSync = frames.findIndex((frame, idx) => idx > frameIndex && frame.synced)
    move(nextSync >= 0 ? nextSync : frames.findIndex((frame) => frame.synced) || 0)
  }

  return (
    <div className="dqn-evidence-stage">
      <div className="dqn-toolbar">
        <div className="dqn-ablation-presets" role="group" aria-label={zh ? 'DQN 四组消融预设' : 'DQN four ablation presets'}>
          {presets.map((preset) => {
            const selected = Math.abs(params.replay - preset.replay) < 0.01 && params.targetPeriod === preset.targetPeriod
            return (
              <button
                type="button"
                key={preset.id}
                className={selected ? 'active' : ''}
                aria-pressed={selected}
                onClick={() => setMany({ replay: preset.replay, targetPeriod: preset.targetPeriod })}
              >
                {zh ? preset.zh : preset.en}
              </button>
            )
          })}
        </div>
        <div className="dqn-playback-bar">
          <div className="dqn-playback-status">
            <span>{zh ? `更新步 ${update.number}/${frames.length}` : `Update ${update.number}/${frames.length}`}</span>
            <strong>{update.synced
              ? (zh ? '本步触发同步：目标网络复制在线参数' : 'Sync tick: target copies online weights')
              : (zh ? `目标网络冻结中 · 距下次同步 ${update.stepsUntilSync} 步` : `Target frozen · ${update.stepsUntilSync} updates until sync`)}</strong>
          </div>
          <div className="dqn-playback-actions">
            <button type="button" disabled={frameIndex === 0} onClick={() => move(frameIndex - 1)}>{zh ? '上一步' : 'Previous'}</button>
            <button type="button" className="is-primary" aria-pressed={playing} onClick={() => { if (frameIndex === last) setStep(0); setPlaying((value) => !value) }}>{playing ? (zh ? '暂停' : 'Pause') : (zh ? '自动播放' : 'Auto play')}</button>
            <button type="button" disabled={frameIndex === last} onClick={() => move(frameIndex + 1)}>{zh ? '下一步' : 'Next'}</button>
            <button type="button" onClick={jumpToNextSync}>{zh ? '跳到下次同步' : 'Next sync'}</button>
            <button type="button" onClick={() => move(0)}>{zh ? '重置' : 'Reset'}</button>
          </div>
          <label className="dqn-playback-slider">
            <span>{zh ? '时间轴' : 'Timeline'}</span>
            <input aria-label={zh ? 'DQN 更新时间轴' : 'DQN update timeline'} type="range" min="0" max={last} step="1" value={frameIndex} onChange={(event) => move(Number(event.target.value))} />
          </label>
        </div>
      </div>

      <section className="dqn-chart-panel">
        <header>
          <span>{zh ? '在线网络 vs 阶梯冻结目标 vs 朴素基线（同一转移流）' : 'Online vs staircase frozen target vs naive baseline (same stream)'}</span>
          <div className="dqn-chart-legend">
            <span><i className="is-online" />{zh ? '在线 ' : 'Online '}<MathFormula latex={String.raw`Q_{\theta}`} /></span>
            <span><i className="is-target" />{zh ? '冻结目标 ' : 'Frozen target '}<MathFormula latex={String.raw`Q_{\bar\theta}`} /></span>
            <span><i className="is-naive" />{zh ? '朴素对照（无冻结/顺序）' : 'Naive counterfactual'}</span>
          </div>
        </header>
        <DqnCurveChart frames={frames} naiveSeries={result.naiveSeries} currentIndex={frameIndex} targetPeriod={params.targetPeriod} zh={zh} />
        <div className="dqn-chart-readout">
          <span>{zh ? '在线预测 ' : 'Online '}<MathFormula latex={String.raw`Q_{\theta}=${update.probeOnlineQ.toFixed(3)}`} /></span>
          <span>{zh ? '冻结目标 ' : 'Target '}<MathFormula latex={String.raw`Q_{\bar\theta}=${update.probeTargetQ.toFixed(3)}`} /></span>
          <span>{zh ? '即时双网差 ' : 'Gap '}<MathFormula latex={String.raw`|Q_{\theta}-Q_{\bar\theta}|=${update.instantDrift.toFixed(3)}`} /></span>
          <span>{zh ? '本步样本复用 ' : 'Sample reuse '}<MathFormula latex={String.raw`${update.sampleReuseCount}\times`} /></span>
        </div>
      </section>

      <div className="dqn-mechanism-grid">
        <section className="dqn-buffer">
          <header><span>{zh ? '经验回放缓冲区' : 'Replay buffer'} <MathFormula latex={String.raw`\mathcal D`} /></span><small>{zh ? '按写入时间排列；亮青为本步抽中，括号为复用次数' : 'Ordered by write time; teal marks the current draw with reuse count'}</small></header>
          <div>{bufferRows.map((item) => {
            const isCurrent = item.key === update.sample.key
            const isRecent = recentKeys.has(item.key)
            return <article className={`${isCurrent ? 'is-current' : isRecent ? 'is-sampled' : ''}`} key={item.key}>
              <b>#{String(item.time + 1).padStart(2, '0')}</b>
              <MathFormula latex={String.raw`s_{${item.stateId}}\xrightarrow{\mathrm{${item.actionName}}}s_{${item.nextStateId}},\ r=${item.reward}`} />
              <small>{isCurrent ? (zh ? `本次抽中 · ${item.reuseCount}×` : `drawn now · ${item.reuseCount}×`) : item.reuseCount > 0 ? (zh ? `复用 ${item.reuseCount}×` : `reused ${item.reuseCount}×`) : (zh ? '等待抽样' : 'buffered')}</small>
            </article>
          })}</div>
        </section>
        <section className="dqn-target-clock">
          <header><span>{zh ? '双网络参数与同步时钟' : 'Dual networks and sync clock'}</span><small>{params.targetPeriod === 1 ? (zh ? <><MathFormula latex="C=1" />：每步移动目标（无冻结）</> : <><MathFormula latex="C=1" />: moving target every step</>) : (zh ? `每 ${params.targetPeriod} 次更新同步一次` : `sync every ${params.targetPeriod} updates`)}</small></header>
          <div className="dqn-network-pair">
            <article><span>{zh ? '在线网络' : 'Online'}</span><MathFormula block latex={String.raw`\theta=(${update.onlineAfter.map((value) => value.toFixed(2)).join(',')})`} /><p>{zh ? '每次抽样后立即更新' : 'updates on every step'}</p></article>
            <i>→</i>
            <article className={update.synced ? 'is-synced' : ''}><span>{zh ? '目标网络' : 'Target'}</span><MathFormula block latex={String.raw`\bar\theta=(${update.targetAfter.map((value) => value.toFixed(2)).join(',')})`} /><p>{update.synced ? (zh ? '本步刚完成复制' : 'copied on this step') : (zh ? '同步窗口内保持冻结' : 'frozen until sync')}</p></article>
          </div>
          <div className="dqn-sync-track">{Array.from({ length: trackLength }, (_, index) => <i className={`${index <= trackPosition ? 'is-complete' : ''} ${index === trackPosition ? 'is-current' : ''} ${update.synced && index === trackLength - 1 ? 'is-sync' : ''}`} key={index} />)}</div>
          <p>{zh ? '样本相关性' : 'Sample correlation'} <strong>{format(result.correlation)}</strong> · {zh ? '目标移动频率' : 'target move rate'} <strong>{(result.targetMoveRate * 100).toFixed(0)}%</strong> · {zh ? '总同步次数' : 'syncs'} <strong>{result.syncCount}</strong></p>
        </section>
      </div>

      <section className="dqn-update-ledger">
        <header><span>{zh ? `第 ${update.number} 次更新的五步完整数据流` : `Five-stage data flow for update ${update.number}`}</span><small>{update.synced ? (zh ? '本步触发目标同步' : 'This update triggers target sync') : (zh ? `距下次同步 ${update.stepsUntilSync} 步` : `${update.stepsUntilSync} updates until sync`)}</small></header>
        <div>
          <article><span>{zh ? '① 抽样转移' : '① Sampled transition'}</span><MathFormula block latex={String.raw`(s_{${update.sample.stateId}},\mathrm{${update.sample.actionName}},${update.sample.reward},s_{${update.sample.nextStateId}})`} /><small>{zh ? `写入时刻 #${update.sample.time + 1} · 已复用 ${update.sampleReuseCount} 次` : `stored at #${update.sample.time + 1} · used ${update.sampleReuseCount}×`}</small></article>
          <article><span>{zh ? '② 冻结目标' : '② Frozen target'}</span><MathFormula block latex={String.raw`Y=${update.sample.reward}+0.9\max Q_{\bar\theta}=${update.targetValue.toFixed(3)}`} /><small>{zh ? '只读取目标网络参数' : 'reads target network only'}</small></article>
          <article><span>{zh ? '③ 时序差分误差' : '③ TD error'}</span><MathFormula block latex={String.raw`\delta=Y-Q_\theta=${update.error.toFixed(3)}`} /><small>{zh ? `更新前预测 ${update.prediction.toFixed(3)}` : `prediction before ${update.prediction.toFixed(3)}`}</small></article>
          <article><span>{zh ? '④ 在线网络更新' : '④ Online update'}</span><MathFormula block latex={String.raw`\Delta\theta=(${update.updateVector.map((value) => value.toFixed(3)).join(',')})`} /><small>{update.onlineBefore.map((value) => value.toFixed(2)).join(', ')} → {update.onlineAfter.map((value) => value.toFixed(2)).join(', ')}</small></article>
          <article className={update.synced ? 'is-synced' : ''}><span>{zh ? '⑤ 目标网络时钟' : '⑤ Target clock'}</span><MathFormula block latex={update.synced ? String.raw`\bar\theta\leftarrow\theta` : zh ? String.raw`\bar\theta\ \text{保持冻结}` : String.raw`\bar\theta\ \text{remains frozen}`} /><small>{update.synced ? (zh ? '复制更新后的在线参数' : 'copies updated online parameters') : (zh ? '本步不复制参数' : 'no parameter copy on this update')}</small></article>
        </div>
      </section>
    </div>
  )
}

function PgEvolutionChart({ frames, currentIndex, zh }) {
  const width = 680
  const height = 195
  const pad = { left: 46, right: 18, top: 18, bottom: 28 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const x = (index) => pad.left + (frames.length <= 1 ? 0 : (index / (frames.length - 1)) * plotW)
  const y = (prob) => pad.top + (1 - Math.max(0, Math.min(1, prob))) * plotH
  const linePath = (values) => values.map((val, idx) => `${idx === 0 ? 'M' : 'L'}${x(idx).toFixed(1)},${y(val).toFixed(1)}`).join(' ')
  const current = frames[currentIndex]

  return (
    <svg className="pg-evolution-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={zh ? '12 回合策略演化对比：使用基线与不使用基线的最优动作概率曲线' : '12-episode policy evolution comparing optimal-action probability with vs without baseline'}>
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <line className="pg-grid-line" key={tick} x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} />
      ))}
      <line className="pg-axis" x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} />
      <line className="pg-axis" x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} />
      <path className="pg-curve-raw" d={linePath(frames.map((frame) => frame.withoutBaseline.optimalProb))} />
      <path className="pg-curve-base" d={linePath(frames.map((frame) => frame.withBaseline.optimalProb))} />
      <line className="pg-cursor-line" x1={x(currentIndex)} x2={x(currentIndex)} y1={pad.top} y2={height - pad.bottom} />
      <circle className="pg-cursor-raw" cx={x(currentIndex)} cy={y(current.withoutBaseline.optimalProb)} r="4.5" />
      <circle className="pg-cursor-base" cx={x(currentIndex)} cy={y(current.withBaseline.optimalProb)} r="5" />
      <text className="pg-axis-tick" x={pad.left - 6} y={pad.top + 5} textAnchor="end">1.0</text>
      <text className="pg-axis-tick" x={pad.left - 6} y={y(0.5) + 4} textAnchor="end">0.5</text>
      <text className="pg-axis-tick" x={pad.left - 6} y={height - pad.bottom} textAnchor="end">0.0</text>
      <text className="pg-axis-tick" x={pad.left} y={height - 8} textAnchor="start">1</text>
      <text className="pg-axis-tick" x={width - pad.right} y={height - 8} textAnchor="end">{frames.length}</text>
      <text className="pg-axis-tick" x={pad.left + plotW / 2} y={height - 8} textAnchor="middle">{zh ? 'REINFORCE 回合数（同一采样流）' : 'REINFORCE episode index (fixed stream)'}</text>
    </svg>
  )
}

function PolicyGradientEvidenceStage({ params, result, zh, set }) {
  const actionLabels = zh ? ['上移', '右移', '等待'] : ['Up', 'Right', 'Wait']
  const frames = result.evolutionFrames || []
  const lastEp = Math.max(0, frames.length - 1)
  const [epStep, setEpStep] = useState(lastEp)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPlaying(false)
  }, [params.alpha, params.baseline])

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setEpStep((current) => {
        if (current >= lastEp) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 520)
    return () => window.clearInterval(timer)
  }, [lastEp, playing])

  const epIndex = Math.min(epStep, lastEp)
  const epFrame = frames[epIndex]
  const moveEp = (next) => {
    setPlaying(false)
    setEpStep(Math.max(0, Math.min(lastEp, next)))
  }

  const baselinePresets = [
    { id: 'none', value: 0, zh: '无基线 ($b=0$)', en: 'No baseline ($b=0$)' },
    { id: 'mean', value: 1.4, zh: '均值基线 ($b=1.4$)', en: 'Mean baseline ($b=1.4$)' },
    { id: 'high', value: 2.0, zh: '偏高基线 ($b=2.0$)', en: 'High baseline ($b=2.0$)' },
  ]

  const selectedContribution = result.stepContributions[result.selectedStep]

  return (
    <div className="pg-evidence-stage">
      {epFrame && (
        <section className="pg-evolution-panel">
          <div className="pg-toolbar">
            <div className="pg-baseline-presets" role="group" aria-label={zh ? '状态基线对照预设' : 'State baseline counterfactual presets'}>
              {baselinePresets.map((preset) => {
                const selected = Math.abs(params.baseline - preset.value) < 0.05
                return (
                  <button
                    type="button"
                    key={preset.id}
                    className={selected ? 'active' : ''}
                    aria-pressed={selected}
                    onClick={() => set('baseline', preset.value)}
                  >
                    <MathText>{zh ? preset.zh : preset.en}</MathText>
                  </button>
                )
              })}
            </div>
            <div className="pg-playback-bar">
              <div className="pg-playback-status">
                <span>{zh ? `第 ${epFrame.episode}/${frames.length} 回合 · 采样动作：${actionLabels[epFrame.actionIndex]}` : `Episode ${epFrame.episode}/${frames.length} · Sampled: ${actionLabels[epFrame.actionIndex]}`}</span>
                <strong>
                  {zh ? '回报 ' : 'Return '}
                  <MathFormula latex={String.raw`G=${epFrame.returnValue.toFixed(1)}`} />
                  {' · '}
                  {zh ? '有基线权重 ' : 'Centered '}
                  <MathFormula latex={String.raw`G-b=${epFrame.withBaseline.weight.toFixed(2)}`} />
                </strong>
              </div>
              <div className="pg-playback-actions">
                <button type="button" disabled={epIndex === 0} onClick={() => moveEp(epIndex - 1)}>{zh ? '上一步' : 'Previous'}</button>
                <button type="button" className="is-primary" aria-pressed={playing} onClick={() => { if (epIndex === lastEp) setEpStep(0); setPlaying((v) => !v) }}>{playing ? (zh ? '暂停' : 'Pause') : (zh ? '自动播放' : 'Auto play')}</button>
                <button type="button" disabled={epIndex === lastEp} onClick={() => moveEp(epIndex + 1)}>{zh ? '下一步' : 'Next'}</button>
                <button type="button" onClick={() => moveEp(0)}>{zh ? '重置' : 'Reset'}</button>
              </div>
              <label className="pg-playback-slider">
                <span>{zh ? '回合轴' : 'Episode'}</span>
                <input aria-label={zh ? 'REINFORCE 回合时间轴' : 'REINFORCE episode timeline'} type="range" min="0" max={lastEp} step="1" value={epIndex} onChange={(event) => moveEp(Number(event.target.value))} />
              </label>
            </div>
          </div>

          <header>
            <span>{zh ? '同一 12 回合采样流：带基线 vs 无基线的最优动作概率演化' : 'Fixed 12-episode stream: optimal-action probability with vs without baseline'}</span>
            <div className="pg-chart-legend">
              <span><i className="is-base" />{zh ? '当前基线 ' : 'Current baseline '}<MathFormula latex={String.raw`b=${params.baseline.toFixed(1)}`} /></span>
              <span><i className="is-raw" />{zh ? '无基线对照 ' : 'No-baseline control '}<MathFormula latex={String.raw`b=0`} /></span>
            </div>
          </header>
          <PgEvolutionChart frames={frames} currentIndex={epIndex} zh={zh} />
          <div className="pg-evolution-readout">
            <span>{zh ? '带基线最优概率 ' : 'With baseline '}<MathFormula latex={String.raw`\pi(\text{Right})=${epFrame.withBaseline.optimalProb.toFixed(3)}`} /></span>
            <span>{zh ? '无基线最优概率 ' : 'No baseline '}<MathFormula latex={String.raw`\pi_0(\text{Right})=${epFrame.withoutBaseline.optimalProb.toFixed(3)}`} /></span>
            <span>{zh ? '本步梯度模（有/无基线）' : 'Step norm (with/no b) '}<MathFormula latex={String.raw`${epFrame.withBaseline.stepMagnitude.toFixed(2)}\text{ vs }${epFrame.withoutBaseline.stepMagnitude.toFixed(2)}`} /></span>
          </div>
          <p className="pg-evolution-note">
            {epFrame.withBaseline.weight < 0 && epFrame.withoutBaseline.weight > 0
              ? (zh
                ? <>本回合采到次优动作（{actionLabels[epFrame.actionIndex]}，回报 <MathFormula latex={String.raw`G=${epFrame.returnValue.toFixed(1)}`} />）：无基线时 <MathFormula latex={String.raw`G>0`} /> 反而抬高了它的概率，而减去基线后 <MathFormula latex={String.raw`G-b=${epFrame.withBaseline.weight.toFixed(2)}<0`} /> 主动压低次优动作概率。</>
                : <>This episode sampled a suboptimal action ({actionLabels[epFrame.actionIndex]}, <MathFormula latex={String.raw`G=${epFrame.returnValue.toFixed(1)}`} />): without a baseline <MathFormula latex={String.raw`G>0`} /> still pushes its probability up, while <MathFormula latex={String.raw`G-b=${epFrame.withBaseline.weight.toFixed(2)}<0`} /> actively suppresses it.</>)
              : (zh
                ? <>拖动状态基线 <MathFormula latex="b" /> 或切换上方预设，观察当回报全为正时，无基线更新如何因“连次优动作也被正向推高”而产生更大步幅抖动。</>
                : <>Adjust baseline <MathFormula latex="b" /> or switch presets above to see how zero-baseline updates push even mediocre positive-return actions upward and add gradient jitter.</>)}
          </p>
        </section>
      )}

      <div className="pg-detail-grid">
        <section className="pg-trajectory">
          <header><span>{zh ? '一条轨迹中的逐步因果梯度贡献' : 'Per-step causal gradient contributions along one trajectory'}</span><small>{zh ? '点击时间步切换状态与未来回报' : 'Select a step to inspect its future return'}</small></header>
          <div>{result.stepContributions.map((item) => <button type="button" className={result.selectedStep === item.step ? 'is-selected' : ''} aria-pressed={result.selectedStep === item.step} onClick={() => set('selectedStep', item.step)} key={item.step}>
            <b><MathFormula latex={String.raw`S_${item.step}=s_{${item.stateId}}`} /></b>
            <span><MathFormula latex={String.raw`A_${item.step}=a_${item.actionIndex + 1}`} /></span>
            <span><MathFormula latex={String.raw`G_${item.step}=${item.return}`} /></span>
            <span><MathFormula latex={String.raw`G_${item.step}-b=${item.advantage.toFixed(2)}`} /></span>
            <small><MathFormula latex={String.raw`\lVert\widehat g_${item.step}\rVert=${item.contributionNorm.toFixed(3)}`} /></small>
          </button>)}</div>
        </section>
        <aside className="pg-gradient-ledger">
          <span>{zh ? '状态 ' : 'State '}<MathFormula latex={String.raw`s_{${result.stateIds[result.selectedStep]}}`} />{zh ? '：Softmax 得分与概率单纯形守恒' : ': softmax score vector and simplex conservation'}</span>
          <MathFormula block latex={String.raw`\nabla_\theta\log\pi_\theta(A_t\mid S_t)(G_t-b)`} />
          <div className="pg-probability-ledger">
            {result.probabilities.map((probability, index) => (
              <article className={index === result.actionIndex ? 'is-selected' : ''} key={actionLabels[index]}>
                <header>
                  <span>{actionLabels[index]}{index === result.actionIndex ? (zh ? '（本次选择）' : ' (sampled)') : ''}</span>
                  <strong>{probability.toFixed(3)} → {result.nextProbabilities[index].toFixed(3)}</strong>
                </header>
                <div aria-hidden="true"><i style={{ width: `${probability * 100}%` }} /><b style={{ width: `${result.nextProbabilities[index] * 100}%` }} /></div>
                <small>
                  {zh ? '得分分量 ' : 'Score '}
                  <MathFormula latex={String.raw`${selectedContribution.scoreVector[index].toFixed(3)}`} />
                  {' · '}
                  {zh ? '参数增量 ' : 'Logit shift '}
                  <MathFormula latex={String.raw`\Delta h=${(params.alpha * result.gradientVector[index]).toFixed(3)}`} />
                </small>
              </article>
            ))}
          </div>
          <p>{result.weight >= 0 ? (zh ? '结果高于基线，所选动作概率上升，未选动作按概率比例让出总和守恒的质量。' : 'Outcome exceeds baseline, so the sampled action gains mass drawn proportionally from unsampled actions.') : (zh ? '结果低于基线，所选动作概率下降，释放出的概率质量重新分配给其余动作。' : 'Outcome falls below baseline, so the sampled action loses probability mass to alternative actions.')}</p>
        </aside>
      </div>

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

function AcDualCurveChart({ frames, currentIndex, zh }) {
  const width = 680
  const height = 250
  const pad = { left: 48, right: 18, top: 18, bottom: 26 }
  const plotW = width - pad.left - pad.right
  const topH = 96
  const gap = 22
  const botTop = pad.top + topH + gap
  const botH = height - botTop - pad.bottom

  const x = (index) => pad.left + (frames.length <= 1 ? 0 : (index / (frames.length - 1)) * plotW)

  const vValues = frames.flatMap((f) => [f.critic.valueAfter, f.trueStateValue])
  const vMin = Math.min(...vValues, 0) - 0.2
  const vMax = Math.max(...vValues, 3) + 0.2
  const vSpan = Math.max(0.5, vMax - vMin)
  const yV = (val) => pad.top + ((vMax - val) / vSpan) * topH
  const yP = (prob) => botTop + (1 - Math.max(0, Math.min(1, prob))) * botH

  const pathOf = (values, yFn) => values.map((val, idx) => `${idx === 0 ? 'M' : 'L'}${x(idx).toFixed(1)},${yFn(val).toFixed(1)}`).join(' ')
  const current = frames[currentIndex]

  return (
    <svg className="ac-curve-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={zh ? 'Actor-Critic 16 步耦合曲线：上方为 Critic 估计与真实价值，下方为 Actor 最优动作概率' : 'Actor-Critic 16-step coupled chart: top shows critic vs true value, bottom shows actor optimal-action probability'}>
      {/* Top track: Critic V_phi vs True V^pi */}
      <line className="ac-axis" x1={pad.left} x2={width - pad.right} y1={pad.top + topH} y2={pad.top + topH} />
      <line className="ac-axis" x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + topH} />
      <path className="ac-curve-truth" d={pathOf(frames.map((f) => f.trueStateValue), yV)} />
      <path className="ac-curve-critic" d={pathOf(frames.map((f) => f.critic.valueAfter), yV)} />
      <line className="ac-cursor-line" x1={x(currentIndex)} x2={x(currentIndex)} y1={pad.top} y2={height - pad.bottom} />
      <circle className="ac-cursor-truth" cx={x(currentIndex)} cy={yV(current.trueStateValue)} r="4" />
      <circle className="ac-cursor-critic" cx={x(currentIndex)} cy={yV(current.critic.valueAfter)} r="4.8" />
      <text className="ac-track-title" x={pad.left + 6} y={pad.top + 12}>{zh ? 'Critic 价值追踪：估计曲线 vs 当前策略真实价值' : 'Critic tracking: estimate vs true policy value'}</text>
      <text className="ac-axis-tick" x={pad.left - 6} y={pad.top + 6} textAnchor="end">{vMax.toFixed(1)}</text>
      <text className="ac-axis-tick" x={pad.left - 6} y={pad.top + topH} textAnchor="end">{vMin.toFixed(1)}</text>

      {/* Bottom track: Actor pi_theta(Right | S) */}
      <line className="ac-axis" x1={pad.left} x2={width - pad.right} y1={botTop + botH} y2={botTop + botH} />
      <line className="ac-axis" x1={pad.left} x2={pad.left} y1={botTop} y2={botTop + botH} />
      <line className="ac-grid-line" x1={pad.left} x2={width - pad.right} y1={yP(0.5)} y2={yP(0.5)} />
      <path className="ac-curve-actor" d={pathOf(frames.map((f) => f.actor.optimalProb), yP)} />
      <circle className="ac-cursor-actor" cx={x(currentIndex)} cy={yP(current.actor.optimalProb)} r="4.8" />
      <text className="ac-track-title" x={pad.left + 6} y={botTop + 12}>{zh ? 'Actor 策略演化：最优动作概率' : 'Actor evolution: optimal-action probability'}</text>
      <text className="ac-axis-tick" x={pad.left - 6} y={botTop + 6} textAnchor="end">1.0</text>
      <text className="ac-axis-tick" x={pad.left - 6} y={botTop + botH} textAnchor="end">0.0</text>
      <text className="ac-axis-tick" x={pad.left} y={height - 7} textAnchor="start">1</text>
      <text className="ac-axis-tick" x={width - pad.right} y={height - 7} textAnchor="end">{frames.length}</text>
      <text className="ac-axis-tick" x={pad.left + plotW / 2} y={height - 7} textAnchor="middle">{zh ? '交互更新步数' : 'Coupled update step'}</text>
    </svg>
  )
}

function ActorCriticEvidenceStage({ params, result, zh, set, setMany }) {
  const actionLabels = zh ? ['上移', '右移', '等待'] : ['Up', 'Right', 'Wait']
  const frames = result.loopFrames || []
  const lastIdx = Math.max(0, frames.length - 1)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPlaying(false)
  }, [params.reward, params.nextValue, params.ratio, params.criticAlpha, params.actorAlpha])

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= lastIdx) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 500)
    return () => window.clearInterval(timer)
  }, [lastIdx, playing])

  const frameIndex = Math.min(step, lastIdx)
  const frame = frames[frameIndex]
  const critic = frameIndex === 0
    ? { ...result.critic, valueAfter: result.critic.valueAfter }
    : frame.critic
  const actor = frameIndex === 0
    ? { ...result.actor, probabilitiesBefore: result.actor.probabilitiesBefore }
    : frame.actor
  const stepDelta = frameIndex === 0 ? result.delta : frame.delta
  const stepActorCoeff = frameIndex === 0 ? result.actorStep : frame.actor.stepScale
  const criticLag = Math.abs(critic.valueAfter - (frame?.trueStateValue ?? critic.valueAfter))

  const move = (next) => {
    setPlaying(false)
    setStep(Math.max(0, Math.min(lastIdx, next)))
  }

  const timescalePresets = [
    { id: 'coordinated', criticAlpha: 0.28, actorAlpha: 0.10, ratio: 1, zh: '① 双时间尺度协调（快 Critic / 慢 Actor）', en: '① Coordinated (fast critic / slow actor)' },
    { id: 'lagging', criticAlpha: 0.03, actorAlpha: 0.32, ratio: 1, zh: '② Critic 严重滞后（慢 Critic / 快 Actor）', en: '② Lagging critic (slow critic / fast actor)' },
    { id: 'offpolicy', criticAlpha: 0.18, actorAlpha: 0.18, ratio: 1.75, zh: '③ 离策略比率放大（$\\rho_t = 1.75$）', en: '③ Large off-policy ratio ($\\rho_t = 1.75$)' },
  ]

  return (
    <div className="ac-evidence-stage">
      <div className="ac-toolbar">
        <div className="ac-presets" role="group" aria-label={zh ? 'Actor-Critic 双时间尺度与离策略预设' : 'Actor-Critic two-timescale and off-policy presets'}>
          {timescalePresets.map((preset) => {
            const selected = Math.abs(params.criticAlpha - preset.criticAlpha) < 0.015
              && Math.abs(params.actorAlpha - preset.actorAlpha) < 0.015
              && Math.abs(params.ratio - preset.ratio) < 0.04
            return (
              <button
                type="button"
                key={preset.id}
                className={selected ? 'active' : ''}
                aria-pressed={selected}
                onClick={() => setMany({ criticAlpha: preset.criticAlpha, actorAlpha: preset.actorAlpha, ratio: preset.ratio })}
              >
                <MathText>{zh ? preset.zh : preset.en}</MathText>
              </button>
            )
          })}
        </div>
        <div className="ac-rate-controls">
          <label>
            <span><MathText>{zh ? 'Critic 步长 $\\alpha_v$' : 'Critic step $\\alpha_v$'}</MathText><output>{params.criticAlpha.toFixed(2)}</output></span>
            <input aria-label={zh ? 'Critic 步长 α_v' : 'Critic step size α_v'} type="range" min="0.02" max="0.45" step="0.01" value={params.criticAlpha} onChange={(event) => set('criticAlpha', Number(event.target.value))} />
          </label>
          <label>
            <span><MathText>{zh ? 'Actor 步长 $\\alpha_\\theta$' : 'Actor step $\\alpha_\\theta$'}</MathText><output>{params.actorAlpha.toFixed(2)}</output></span>
            <input aria-label={zh ? 'Actor 步长 α_θ' : 'Actor step size α_θ'} type="range" min="0.02" max="0.45" step="0.01" value={params.actorAlpha} onChange={(event) => set('actorAlpha', Number(event.target.value))} />
          </label>
        </div>
        <div className="ac-playback-bar">
          <div className="ac-playback-status">
            <span>{zh ? `闭环第 ${frameIndex + 1}/${frames.length} 步 · 动作：${actionLabels[actor.actionIndex]}` : `Loop step ${frameIndex + 1}/${frames.length} · Action: ${actionLabels[actor.actionIndex]}`}</span>
            <strong>{frameIndex === 0
              ? (zh ? <>单步显微镜（由顶部 <MathFormula latex={String.raw`R_{t+1},\,V_\phi(S_{t+1}),\,\rho_t`} /> 滑块直接驱动）</> : <>Step-1 microscope (driven directly by <MathFormula latex={String.raw`R_{t+1},\,V_\phi(S_{t+1}),\,\rho_t`} />)</>)
              : (zh ? <>Critic 追踪滞后 <MathFormula latex={String.raw`|V_\phi-V^\pi|=${criticLag.toFixed(3)}`} /></> : <>Critic tracking lag <MathFormula latex={String.raw`|V_\phi-V^\pi|=${criticLag.toFixed(3)}`} /></>)}</strong>
          </div>
          <div className="ac-playback-actions">
            <button type="button" disabled={frameIndex === 0} onClick={() => move(frameIndex - 1)}>{zh ? '上一步' : 'Previous'}</button>
            <button type="button" className="is-primary" aria-pressed={playing} onClick={() => { if (frameIndex === lastIdx) setStep(0); setPlaying((v) => !v) }}>{playing ? (zh ? '暂停' : 'Pause') : (zh ? '自动播放' : 'Auto play')}</button>
            <button type="button" disabled={frameIndex === lastIdx} onClick={() => move(frameIndex + 1)}>{zh ? '下一步' : 'Next'}</button>
            <button type="button" onClick={() => move(0)}>{zh ? '回到第 1 步' : 'Step 1'}</button>
          </div>
          <label className="ac-playback-slider">
            <span>{zh ? '时间轴' : 'Timeline'}</span>
            <input aria-label={zh ? 'Actor-Critic 耦合时间轴' : 'Actor-Critic loop timeline'} type="range" min="0" max={lastIdx} step="1" value={frameIndex} onChange={(event) => move(Number(event.target.value))} />
          </label>
        </div>
      </div>

      {frame && (
        <section className="ac-chart-panel">
          <header>
            <span>{zh ? '双时间尺度耦合曲线：Critic 价值追踪与 Actor 策略演化' : 'Two-timescale coupled trajectories: critic tracking and actor evolution'}</span>
            <div className="ac-chart-legend">
              <span><i className="is-critic" />{zh ? 'Critic 估计 ' : 'Critic '}<MathFormula latex={String.raw`V_\phi(S)`} /></span>
              <span><i className="is-truth" />{zh ? '真实策略价值 ' : 'True value '}<MathFormula latex={String.raw`V^\pi(S)`} /></span>
              <span><i className="is-actor" />{zh ? '最优动作概率 ' : 'Optimal prob '}<MathFormula latex={String.raw`\pi_\theta(\text{Right}\mid S)`} /></span>
            </div>
          </header>
          <AcDualCurveChart frames={frames} currentIndex={frameIndex} zh={zh} />
          <p className="ac-chart-note">
            {params.criticAlpha < params.actorAlpha * 0.5
              ? (zh
                ? <>当前 <MathFormula latex={String.raw`\alpha_v=${params.criticAlpha.toFixed(2)}\ll\alpha_\theta=${params.actorAlpha.toFixed(2)}`} />：Critic 还没追上当前策略的真实价值 <MathFormula latex={String.raw`V^\pi`} />，Actor 就已经大步改写策略，导致 <MathFormula latex={String.raw`\delta_t`} /> 携带显著自举偏差。</>
                : <>Here <MathFormula latex={String.raw`\alpha_v=${params.criticAlpha.toFixed(2)}\ll\alpha_\theta=${params.actorAlpha.toFixed(2)}`} />: the critic lags behind the current policy value <MathFormula latex={String.raw`V^\pi`} /> while the actor moves aggressively, injecting bootstrap bias into <MathFormula latex={String.raw`\delta_t`} />.</>)
              : params.ratio > 1.35
                ? (zh
                  ? <>当前离策略重要性比率 <MathFormula latex={String.raw`\rho_t=${params.ratio.toFixed(2)}`} /> 较大：Actor 步长系数被直接放大为 <MathFormula latex={String.raw`\alpha_\theta\rho_t\delta_t`} />，这也是下一章近端策略优化（PPO）要对比率施加重裁的原因。</>
                  : <>With large off-policy ratio <MathFormula latex={String.raw`\rho_t=${params.ratio.toFixed(2)}`} />, the actor step scales directly by <MathFormula latex={String.raw`\alpha_\theta\rho_t\delta_t`} />—the exact instability that motivates PPO ratio clipping in the next chapter.</>)
                : (zh
                  ? <>当前 Critic 学习率 <MathFormula latex={String.raw`\alpha_v=${params.criticAlpha.toFixed(2)}`} /> 高于或匹配 Actor 学习率 <MathFormula latex={String.raw`\alpha_\theta=${params.actorAlpha.toFixed(2)}`} />：Critic 迅速贴近 <MathFormula latex={String.raw`V^\pi`} />，为 Actor 提供方向可靠的低方差 TD 优势信号。</>
                  : <>With <MathFormula latex={String.raw`\alpha_v=${params.criticAlpha.toFixed(2)}`} /> keeping pace ahead of <MathFormula latex={String.raw`\alpha_\theta=${params.actorAlpha.toFixed(2)}`} />, the critic tracks <MathFormula latex={String.raw`V^\pi`} /> closely and supplies a low-variance advantage signal to the actor.</>)}
          </p>
        </section>
      )}

      <section className="ac-transition">
        <header><span>{zh ? `第 ${frameIndex + 1} 步：一条转移，两条梯度路径` : `Step ${frameIndex + 1}: one transition, two gradient paths`}</span></header>
        <div className="ac-transition-row">
          {frameIndex === 0 ? (
            <>
              <article><span><MathFormula latex={String.raw`R_{t+1}`} /></span><strong>{format(params.reward)}</strong></article>
              <i>+</i>
              <article><span><MathFormula latex={String.raw`\gamma V_\phi(S_{t+1})`} /></span><strong>{format(params.gamma * params.nextValue)}</strong></article>
              <i>−</i>
              <article><span><MathFormula latex={String.raw`V_\phi(S_t)`} /></span><strong>{format(critic.valueBefore)}</strong></article>
              <i>=</i>
              <article className="is-delta"><span><MathFormula latex={String.raw`\delta_t`} /></span><strong>{format(stepDelta)}</strong></article>
            </>
          ) : (
            <>
              <article><span>{zh ? '一步目标 ' : 'Target '}<MathFormula latex={String.raw`U_t`} /></span><strong>{format(critic.target)}</strong></article>
              <i>−</i>
              <article><span><MathFormula latex={String.raw`V_\phi(S_t)`} /></span><strong>{format(critic.valueBefore)}</strong></article>
              <i>=</i>
              <article className="is-delta"><span><MathFormula latex={String.raw`\delta_t`} /></span><strong>{format(stepDelta)}</strong></article>
            </>
          )}
        </div>
      </section>
      <section className="ac-two-updates">
        <article className="ac-critic-ledger">
          <header><span>Critic</span><small>{zh ? '拟合一步价值目标' : 'Fits the one-step value target'}</small></header>
          <MathFormula block latex={String.raw`\phi\leftarrow\phi+\alpha_v\delta_t\nabla_\phi V_\phi(S_t)`} />
          <div className="ac-before-after">
            <span>{zh ? '更新前价值' : 'Value before'}<strong>{format(critic.valueBefore)}</strong></span>
            <i>+</i>
            <span>{zh ? '价值修正量' : 'Value correction'}<strong>{format(critic.correction)}</strong></span>
            <i>→</i>
            <span className="is-after">{zh ? '更新后价值' : 'Value after'}<strong>{format(critic.valueAfter)}</strong></span>
          </div>
          <p>{zh ? '一步目标' : 'One-step target'} <strong>{format(critic.target)}</strong> · <MathFormula latex={String.raw`\alpha_v=${params.criticAlpha.toFixed(2)},\ \delta_t=${stepDelta.toFixed(3)}`} /></p>
        </article>
        <article className="ac-actor-ledger">
          <header><span>Actor</span><small>{zh ? '同一误差改变所选动作概率' : 'The same error changes sampled-action probability'}</small></header>
          <MathFormula block latex={String.raw`\theta\leftarrow\theta+\alpha_\theta\rho_t\delta_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)`} />
          <div className="ac-policy-ledger">
            {actor.logitsBefore.map((logit, index) => <div className={index === actor.actionIndex ? 'is-sampled' : ''} key={actionLabels[index]}>
              <span>{actionLabels[index]}{index === actor.actionIndex ? (zh ? '（已采样）' : ' (sampled)') : ''}</span>
              <MathFormula latex={String.raw`h:${logit.toFixed(2)}\to${actor.logitsAfter[index].toFixed(2)}`} />
              <MathFormula latex={String.raw`\pi:${actor.probabilitiesBefore[index].toFixed(3)}\to${actor.probabilitiesAfter[index].toFixed(3)}`} />
            </div>)}
          </div>
          <p>{zh ? '策略更新系数' : 'Policy update coefficient'} <strong>{format(stepActorCoeff)}</strong> · <MathFormula latex={String.raw`\alpha_\theta=${params.actorAlpha.toFixed(2)},\ \rho_t=${params.ratio.toFixed(2)}`} /></p>
        </article>
      </section>
    </div>
  )
}

function DedicatedLearningStage({ id, params, result, zh, set, setMany }) {
  if (id === 'td') return <TdEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'control') return <ControlEvidenceStage key={`${params.epsilon}-${params.alpha}-${params.seed}`} params={params} result={result} zh={zh} />
  if (id === 'vfa') return <VfaEvidenceStage params={params} result={result} zh={zh} set={set} />
  if (id === 'dqn') return <DqnEvidenceStage params={params} result={result} zh={zh} setMany={setMany} />
  if (id === 'policygradient') return <PolicyGradientEvidenceStage params={params} result={result} zh={zh} set={set} />
  if (id === 'actorcritic') return <ActorCriticEvidenceStage params={params} result={result} zh={zh} set={set} setMany={setMany} />
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
  const setMany = (patch) => setParams((current) => ({ ...current, ...patch }))
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
      <DedicatedLearningStage id={id} params={params} result={result} zh={zh} set={set} setMany={setMany} />
      {id !== 'td' && <aside className="learning-compact-summary">
        <MathFormula latex={config.formula} />
        <div className="learning-summary-metrics">{metrics.map(([label, value]) => <span key={label}><small><MathText>{label}</MathText></small><strong>{format(value)}</strong></span>)}</div>
      </aside>}
      <footer><span>{zh ? '读图提示' : 'Reading cue'}</span><p><MathText>{content.explorer.cue}</MathText></p></footer>
    </section>
  )
}
