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
      <div className="learning-lab-stage">
        <div className="learning-chart-panel"><header><span>{zh ? '参数改变后的可见结果' : 'Visible result under current parameters'}</span><small>{zh ? '所有曲线均在浏览器内确定性重算' : 'All curves are recomputed deterministically in the browser'}</small></header><LearningLineChart values={result.series} label={content.figure} /></div>
        <aside className="learning-metrics"><MathFormula block latex={config.formula} />{metrics.map(([label, value]) => <div key={label}><span><MathText>{label}</MathText></span><strong>{format(value)}</strong></div>)}</aside>
      </div>
      <footer><span>{zh ? '读图提示' : 'Reading cue'}</span><p><MathText>{content.explorer.cue}</MathText></p></footer>
    </section>
  )
}
