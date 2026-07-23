import { useMemo, useState } from 'react'
import MathFormula from './MathFormula'
import MathText from './MathText'
import { learningLabRunners } from '../engine/learning-labs.js'

const defaults = {
  montecarlo: { episodes: 24, epsilon: 0.2, seed: 20260719, visit: 'first' },
  approximation: { alpha: 0.18, decay: true, noise: 1.4, steps: 48, seed: 20260719 },
  td: { gamma: 0.9, n: 3, value: 2.4, nextValue: 3.1 },
  control: { epsilon: 0.12, alpha: 0.3, seed: 20260719 },
  vfa: { width: 1.2, alpha: 0.24, target: 5 },
  dqn: { replay: 0.7, targetPeriod: 8, steps: 42 },
  policygradient: { theta: 0, advantage: 1.4, alpha: 0.18, baseline: 0 },
  actorcritic: { reward: 1, gamma: 0.9, value: 2.2, nextValue: 2.8, actorAlpha: 0.12, criticAlpha: 0.18, ratio: 1 },
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
    formula: String.raw`G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nV(S_{t+n})`,
    controls: [['gamma', 0.4, 0.99, 0.01], ['n', 1, 5, 1]],
    labels: { zh: ['折扣 γ', '步数 n'], en: ['Discount γ', 'Steps n'] },
    metrics: (r) => [['TD(0)', r.td], ['n-step', r.nStep], ['Monte Carlo', r.mc]],
  },
  control: {
    formula: String.raw`\underbrace{R+\gamma Q(S',A')}_{\text{Sarsa}}\qquad\underbrace{R+\gamma\max_a Q(S',a)}_{\text{Q-learning}}`,
    controls: [['epsilon', 0.02, 0.5, 0.02], ['alpha', 0.05, 0.8, 0.05]],
    labels: { zh: ['探索率 ε', '步长 α'], en: ['Exploration ε', 'Step size α'] },
    metrics: (r, zh) => [[zh ? 'Sarsa 危险率' : 'Sarsa danger', `${(r.sarsaDanger * 100).toFixed(1)}%`], [zh ? 'Q-learning 危险率' : 'Q-learning danger', `${(r.qDanger * 100).toFixed(1)}%`], [zh ? '目标差' : 'Target gap', r.targetGap]],
  },
  vfa: {
    formula: String.raw`\mathbf w\leftarrow\mathbf w+\alpha\left(U_t-\widehat v(S_t,\mathbf w)\right)\nabla_{\mathbf w}\widehat v(S_t,\mathbf w)`,
    controls: [['width', 0.35, 2.5, 0.05], ['alpha', 0.05, 0.6, 0.01]],
    labels: { zh: ['特征宽度', '步长 α'], en: ['Feature width', 'Step size α'] },
    metrics: (r, zh) => [[zh ? '中心误差' : 'Center error', r.centerError], [zh ? '邻居改变量' : 'Neighbor change', r.spillover], [zh ? '目标值' : 'Target', 5]],
  },
  dqn: {
    formula: String.raw`Y=R+\gamma\max_{a'}Q_{\bar\theta}(S',a'),\qquad\theta\leftarrow\theta-\alpha\nabla_\theta(Y-Q_\theta(S,A))^2`,
    controls: [['replay', 0, 1, 0.05], ['targetPeriod', 2, 20, 1]],
    labels: { zh: ['Replay 打散强度', 'Target 同步间隔'], en: ['Replay mixing', 'Target sync period'] },
    metrics: (r, zh) => [[zh ? '样本相关性' : 'Correlation', r.correlation], [zh ? '末段漂移' : 'Late drift', r.drift], [zh ? 'Replay 容量' : 'Replay size', r.replaySize]],
  },
  policygradient: {
    formula: String.raw`\theta\leftarrow\theta+\alpha\,\nabla_\theta\log\pi_\theta(A\mid S)\,(G-b)`,
    controls: [['theta', -2.5, 2.5, 0.1], ['advantage', -3, 3, 0.1], ['baseline', -2, 2, 0.1]],
    labels: { zh: ['当前 logit θ', '样本回报权重', 'Baseline b'], en: ['Current logit θ', 'Sample return weight', 'Baseline b'] },
    metrics: (r, zh) => [[zh ? '更新前概率' : 'Probability before', r.probability], [zh ? '更新后概率' : 'Probability after', r.nextProbability], [zh ? '样本梯度' : 'Sample gradient', r.gradient]],
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

function LearningLineChart({ values, label }) {
  const width = 720
  const height = 230
  const pad = 28
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 0)
  const range = Math.max(max - min, 0.001)
  const points = values.map((value, index) => {
    const x = pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2)
    const y = pad + ((max - value) / range) * (height - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg className="learning-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} />
      <line x1={pad} x2={pad} y1={pad} y2={height - pad} />
      <polyline points={points} />
      {values.map((value, index) => {
        const [x, y] = points.split(' ')[index].split(',')
        return <circle key={`${index}-${value}`} cx={x} cy={y} r={values.length < 10 ? 5 : 2.5} />
      })}
      <text x={pad} y={18}>{format(max)}</text><text x={pad} y={height - 7}>{format(min)}</text>
    </svg>
  )
}

function TdEvidenceStage({ params, result, zh }) {
  const rewards = [0, -1, 0.5, 0, 4]
  return (
    <div className="td-evidence-stage">
      <section className="td-trajectory-ledger">
        <header><span>{zh ? '同一条轨迹' : 'One shared trajectory'}</span><small>{zh ? '真实奖励与自举边界' : 'Observed rewards and bootstrap boundary'}</small></header>
        <div className="td-tape">
          {rewards.map((reward, index) => <div className={index < params.n ? 'is-observed' : index === params.n ? 'is-bootstrap' : ''} key={index}>
            <b><MathFormula latex={String.raw`S_${index}`} /></b>
            <span><MathFormula latex={String.raw`R_${index + 1}=${reward}`} /></span>
            <small>{index < params.n ? (zh ? '已进入 target' : 'observed') : index === params.n ? (zh ? '在此自举' : 'bootstrap here') : (zh ? '尚未使用' : 'not used')}</small>
          </div>)}
        </div>
      </section>
      <section className="td-target-ledger">
        <header><span>{zh ? '三种监督信号' : 'Three target contracts'}</span><small>{zh ? '只改变可用证据范围' : 'Only the evidence horizon changes'}</small></header>
        <div>
          <article><span>TD(0)</span><MathFormula block latex={String.raw`R_1+\gamma V(S_1)`} /><strong>{format(result.td)}</strong><p>{zh ? '一步后立即可用，依赖当前后继估计。' : 'Available after one step; depends on the current successor estimate.'}</p></article>
          <article className="is-focus"><span>{params.n}-step</span><MathFormula block latex={String.raw`\sum_{k=0}^{n-1}\gamma^kR_{k+1}+\gamma^nV(S_n)`} /><strong>{format(result.nStep)}</strong><p>{zh ? `等待 ${params.n} 个奖励，再用价值补全尾部。` : `Waits for ${params.n} rewards, then bootstraps the tail.`}</p></article>
          <article><span>Monte Carlo</span><MathFormula block latex={String.raw`\sum_{k=0}^{T-1}\gamma^kR_{k+1}`} /><strong>{format(result.mc)}</strong><p>{zh ? '等待终点，不依赖当前价值表。' : 'Waits for termination and does not use the current value table.'}</p></article>
        </div>
      </section>
    </div>
  )
}

function ControlEvidenceStage({ params, result, zh }) {
  const nextAction = params.epsilon > 0.18 ? 'safe' : 'risky'
  return (
    <div className="control-evidence-stage">
      <section className="control-shared-transition">
        <header><span>{zh ? '共享的实际转移' : 'Shared observed transition'}</span><small>{zh ? '两种算法读取同一证据' : 'Both algorithms read the same evidence'}</small></header>
        <div className="control-transition-row">
          <b><MathFormula latex={String.raw`S_t=s_{17}`} /></b><i>→</i><b><MathFormula latex={String.raw`A_t=a_2`} /></b><i>→</i><b><MathFormula latex={String.raw`R_{t+1}=-1`} /></b><i>→</i><b><MathFormula latex={String.raw`S_{t+1}=s_{18}`} /></b>
        </div>
        <p>{zh ? '行为策略随后实际选择的动作是' : 'The behavior policy next selects'} <strong>{nextAction === 'safe' ? (zh ? '安全绕行' : 'safe detour') : (zh ? '贴近悬崖' : 'cliff edge')}</strong>{zh ? '。' : '.'}</p>
      </section>
      <section className="control-target-comparison">
        <article>
          <span>Sarsa · on-policy</span>
          <MathFormula block latex={String.raw`U_t=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`} />
          <p>{zh ? '把行为策略真实选出的下一动作写进 target，因此训练期探索风险会进入价值。' : 'Uses the behavior action actually selected, so training-time exploration risk enters value.'}</p>
          <strong>{zh ? '危险率' : 'Danger'} {result.sarsaDanger.toFixed(3)}</strong>
        </article>
        <article>
          <span>Q-learning · off-policy</span>
          <MathFormula block latex={String.raw`U_t=R_{t+1}+\gamma\max_aQ(S_{t+1},a)`} />
          <p>{zh ? '忽略实际下一动作，评价后续始终贪心时的最短路径。' : 'Ignores the observed next action and evaluates a greedy continuation.'}</p>
          <strong>{zh ? '危险率' : 'Danger'} {result.qDanger.toFixed(3)}</strong>
        </article>
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
  const transitions = [
    ['s_4', 'a_2', '0', 's_5'], ['s_{11}', 'a_1', '-1', 's_6'], ['s_8', 'a_3', '0', 's_{13}'],
    ['s_{17}', 'a_2', '1', 's_{18}'], ['s_2', 'a_3', '0', 's_7'], ['s_{21}', 'a_1', '0', 's_{16}'],
  ]
  const sampled = Math.max(2, Math.round(2 + params.replay * 3))
  return (
    <div className="dqn-evidence-stage">
      <section className="dqn-buffer">
        <header><span>Replay buffer</span><small>{zh ? '轨迹顺序被保存，训练顺序被重排' : 'Storage preserves time; training reorders it'}</small></header>
        <div>{transitions.map((row, index) => <article className={index < sampled && index % 2 === 0 ? 'is-sampled' : ''} key={index}>
          <b>{String(index + 1).padStart(2, '0')}</b><MathFormula latex={String.raw`(${row[0]},${row[1]},${row[2]},${row[3]})`} /><small>{index < sampled && index % 2 === 0 ? (zh ? '本批抽中' : 'sampled') : (zh ? '留在缓冲区' : 'buffered')}</small>
        </article>)}</div>
      </section>
      <section className="dqn-target-clock">
        <header><span>Target network</span><small>{zh ? `每 ${params.targetPeriod} 次更新同步` : `sync every ${params.targetPeriod} updates`}</small></header>
        <div className="dqn-network-pair">
          <article><span>Online</span><MathFormula block latex={String.raw`Q_\theta(S,A)`} /><p>{zh ? '每个 minibatch 后变化' : 'changes every minibatch'}</p></article>
          <i>→</i>
          <article><span>Target</span><MathFormula block latex={String.raw`Q_{\bar\theta}(S',a')`} /><p>{zh ? '同步之间保持冻结' : 'frozen between syncs'}</p></article>
        </div>
        <div className="dqn-sync-track">{Array.from({ length: Math.min(params.targetPeriod, 12) }, (_, index) => <i className={index === 0 ? 'is-sync' : ''} key={index} />)}</div>
        <p>{zh ? '样本相关性' : 'Sample correlation'} <strong>{format(result.correlation)}</strong> · {zh ? '末段 target 漂移' : 'late target drift'} <strong>{format(result.drift)}</strong></p>
      </section>
    </div>
  )
}

function PolicyGradientEvidenceStage({ params, result, zh }) {
  const returns = [2.4, 1.7, 0.6, -0.2]
  return (
    <div className="pg-evidence-stage">
      <section className="pg-trajectory">
        <header><span>{zh ? '同一条策略轨迹' : 'One policy trajectory'}</span><small>{zh ? '每个动作只使用其后的奖励' : 'Each action uses only later rewards'}</small></header>
        <div>{returns.map((value, index) => <article key={index}>
          <b><MathFormula latex={String.raw`t=${index}`} /></b>
          <span><MathFormula latex={String.raw`A_${index}=a_${index + 1}`} /></span>
          <span><MathFormula latex={String.raw`G_${index}=${value}`} /></span>
          <span><MathFormula latex={String.raw`G_${index}-b=${(value - params.baseline).toFixed(2)}`} /></span>
        </article>)}</div>
      </section>
      <aside className="pg-gradient-ledger">
        <span>{zh ? '所选动作的概率移动' : 'Probability movement for the sampled action'}</span>
        <MathFormula block latex={String.raw`\nabla_\theta\log\pi_\theta(A_t\mid S_t)(G_t-b)`} />
        <div><strong>{result.probability.toFixed(3)}</strong><i>→</i><strong>{result.nextProbability.toFixed(3)}</strong></div>
        <p>{result.weight >= 0 ? (zh ? '结果高于基线，所选动作概率上升。' : 'Outcome exceeds baseline, so sampled-action probability rises.') : (zh ? '结果低于基线，所选动作概率下降。' : 'Outcome falls below baseline, so sampled-action probability falls.')}</p>
      </aside>
    </div>
  )
}

function ActorCriticEvidenceStage({ params, result, zh }) {
  return (
    <div className="ac-evidence-stage">
      <section className="ac-transition">
        <header><span>{zh ? '一条 transition，两条梯度路径' : 'One transition, two gradient paths'}</span></header>
        <div className="ac-transition-row">
          <article><span><MathFormula latex={String.raw`V_\phi(S_t)`} /></span><strong>{format(params.value)}</strong></article>
          <i>+</i>
          <article><span><MathFormula latex={String.raw`R_{t+1}`} /></span><strong>{format(params.reward)}</strong></article>
          <i>+</i>
          <article><span><MathFormula latex={String.raw`\gamma V_\phi(S_{t+1})`} /></span><strong>{format(params.gamma * params.nextValue)}</strong></article>
          <i>=</i>
          <article className="is-delta"><span><MathFormula latex={String.raw`\delta_t`} /></span><strong>{format(result.delta)}</strong></article>
        </div>
      </section>
      <section className="ac-two-updates">
        <article><span>Critic</span><MathFormula block latex={String.raw`\phi\leftarrow\phi+\alpha_v\delta_t\nabla_\phi V_\phi(S_t)`} /><p>{zh ? '当前状态价值' : 'Current value'} <strong>{format(params.value)} → {format(result.nextValueEstimate)}</strong></p></article>
        <article><span>Actor</span><MathFormula block latex={String.raw`\theta\leftarrow\theta+\alpha_\pi\rho_t\delta_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)`} /><p>{zh ? '策略参数步长' : 'Policy step'} <strong>{format(result.actorStep)}</strong></p></article>
      </section>
    </div>
  )
}

function DedicatedLearningStage({ id, params, result, zh }) {
  if (id === 'td') return <TdEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'control') return <ControlEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'vfa') return <VfaEvidenceStage result={result} zh={zh} />
  if (id === 'dqn') return <DqnEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'policygradient') return <PolicyGradientEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'actorcritic') return <ActorCriticEvidenceStage params={params} result={result} zh={zh} />
  return null
}

export default function LearningLab({ id, lang, content }) {
  const [params, setParams] = useState(defaults[id])
  const zh = lang === 'zh'
  const config = configs[id]
  const result = useMemo(() => learningLabRunners[id](params), [id, params])
  const metrics = config.metrics(result, zh)
  const set = (key, value) => setParams((current) => ({ ...current, [key]: value }))
  return (
    <section className={`learning-lab learning-lab-${id}`} aria-label={content.figure}>
      <header className="learning-lab-heading"><div><span>{content.figure}</span><p><MathText>{content.instruction}</MathText></p></div><button type="button" onClick={() => setParams(defaults[id])}>{zh ? '恢复基线' : 'Reset baseline'}</button></header>
      <div className="learning-lab-question"><span>{zh ? '本实验回答' : 'Question'}</span><strong><MathText>{content.question}</MathText></strong></div>
      <div className="learning-lab-controls">
        {config.controls.map(([key, min, max, step], index) => <label key={key}><span><MathText>{config.labels[lang][index]}</MathText><output>{format(params[key])}</output></span><input type="range" min={min} max={max} step={step} value={params[key]} onChange={(event) => set(key, Number(event.target.value))} /></label>)}
        {id === 'montecarlo' && <fieldset><legend>{zh ? '访问协议' : 'Visit protocol'}</legend><div>{['first', 'every'].map((value) => <button type="button" key={value} className={params.visit === value ? 'active' : ''} onClick={() => set('visit', value)}>{value === 'first' ? (zh ? '首次访问' : 'First visit') : (zh ? '每次访问' : 'Every visit')}</button>)}</div></fieldset>}
        {id === 'approximation' && <fieldset><legend>{zh ? '步长调度' : 'Step schedule'}</legend><div>{[true, false].map((value) => <button type="button" key={String(value)} className={params.decay === value ? 'active' : ''} onClick={() => set('decay', value)}><MathText>{value ? (zh ? '衰减 1/k' : 'Decay 1/k') : (zh ? '固定 α' : 'Constant α')}</MathText></button>)}</div></fieldset>}
      </div>
      <DedicatedLearningStage id={id} params={params} result={result} zh={zh} />
      <div className="learning-lab-stage is-secondary-evidence">
        <div className="learning-chart-panel"><header><span>{zh ? '聚合结果' : 'Aggregate result'}</span><small>{zh ? '用于核对趋势，不替代上方算法状态' : 'A trend check, not a substitute for algorithm state'}</small></header><LearningLineChart values={result.series} label={content.figure} /></div>
        <aside className="learning-metrics"><MathFormula block latex={config.formula} />{metrics.map(([label, value]) => <div key={label}><span><MathText>{label}</MathText></span><strong>{format(value)}</strong></div>)}</aside>
      </div>
      <footer><span>{zh ? '读图提示' : 'Reading cue'}</span><p><MathText>{content.explorer.cue}</MathText></p></footer>
    </section>
  )
}
