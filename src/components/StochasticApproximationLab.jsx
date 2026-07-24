import { useMemo, useState } from 'react'
import MathFormula from './MathFormula'
import MathText from './MathText'
import { runStochasticApproximationComparison } from '../engine/learning-labs.js'

const format = (value) => Number(value).toFixed(3)

function ComparisonChart({ result, selected, lang }) {
  const width = 820
  const height = 230
  const pad = { left: 44, right: 18, top: 18, bottom: 28 }
  const all = [...result.targets, ...result.observations, ...result.decaying.series, ...result.constant.series]
  const min = Math.min(...all) - 0.4
  const max = Math.max(...all) + 0.4
  const x = (index) => pad.left + (index / Math.max(result.targets.length - 1, 1)) * (width - pad.left - pad.right)
  const y = (value) => pad.top + ((max - value) / Math.max(max - min, 0.001)) * (height - pad.top - pad.bottom)
  const points = (values) => values.map((value, index) => `${x(index)},${y(value)}`).join(' ')
  const selectedX = x(selected)
  return <div className="sa-chart-wrap">
    <svg className="sa-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={lang === 'zh' ? '相同观测流下的衰减步长与固定步长比较' : 'Decaying and constant steps on one observation stream'}>
      <line className="sa-axis" x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} />
      <line className="sa-axis" x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} />
      <polyline className="sa-target-line" points={points(result.targets)} />
      <polyline className="sa-decay-line" points={points(result.decaying.series)} />
      <polyline className="sa-constant-line" points={points(result.constant.series)} />
      {result.observations.map((value, index) => <circle className="sa-observation-dot" cx={x(index)} cy={y(value)} r="2.8" key={`${index}-${value}`} />)}
      <line className="sa-selected-line" x1={selectedX} x2={selectedX} y1={pad.top} y2={height - pad.bottom} />
      <circle className="sa-selected-decay" cx={selectedX} cy={y(result.decaying.series[selected])} r="5" />
      <circle className="sa-selected-constant" cx={selectedX} cy={y(result.constant.series[selected])} r="5" />
      <text x={7} y={pad.top + 5}>{max.toFixed(1)}</text>
      <text x={7} y={height - pad.bottom}>{min.toFixed(1)}</text>
      <text x={pad.left} y={height - 8}>1</text>
      <text x={width - pad.right - 18} y={height - 8}>{result.targets.length}</text>
    </svg>
    <div className="sa-chart-legend">
      <span className="target">{lang === 'zh' ? '真实目标' : 'True target'}</span>
      <span className="observations">{lang === 'zh' ? '观测' : 'Observations'}</span>
      <span className="decay"><MathFormula latex={String.raw`a_k=1/k`} /> {lang === 'zh' ? '衰减' : 'decay'}</span>
      <span className="constant"><MathFormula latex={String.raw`a_k=\alpha`} /> {lang === 'zh' ? '固定' : 'constant'}</span>
    </div>
  </div>
}

function UpdateLedger({ result, selected, lang }) {
  const decay = result.decaying.ledger[selected]
  const constant = result.constant.ledger[selected]
  const rows = [
    [<MathFormula latex={String.raw`X_k`} />, decay.observation, constant.observation],
    [<MathFormula latex={String.raw`w_k`} />, decay.before, constant.before],
    [<MathFormula latex={String.raw`X_k-w_k`} />, decay.residual, constant.residual],
    [<MathFormula latex={String.raw`a_k`} />, decay.stepSize, constant.stepSize],
    [<MathFormula latex={String.raw`a_k(X_k-w_k)`} />, decay.correction, constant.correction],
    [<MathFormula latex={String.raw`w_{k+1}`} />, decay.after, constant.after],
  ]
  return <div className="sa-ledger">
    <header><span>{lang === 'zh' ? '选中更新' : 'Selected update'}</span><strong>{lang === 'zh' ? `第 ${selected + 1} 步` : `Step ${selected + 1}`}</strong></header>
    <div className="sa-ledger-table" role="table" aria-label={lang === 'zh' ? '两种步长的单步更新账本' : 'Single-step update ledger for two schedules'}>
      <div className="sa-ledger-row is-head" role="row"><b role="columnheader">{lang === 'zh' ? '量' : 'Quantity'}</b><b role="columnheader"><MathFormula latex={String.raw`1/k`} /></b><b role="columnheader"><MathFormula latex={String.raw`\alpha`} /></b></div>
      {rows.map(([label, left, right], index) => <div className="sa-ledger-row" role="row" key={index}><span role="cell">{label}</span><strong role="cell">{format(left)}</strong><strong role="cell">{format(right)}</strong></div>)}
    </div>
  </div>
}

function WeightStrip({ title, history, selected, tone, lang }) {
  const weights = history[selected].samples
  const visible = weights.slice(Math.max(0, weights.length - 14))
  const offset = weights.length - visible.length
  const max = Math.max(...visible, 0.001)
  return <section className={`sa-weight-strip is-${tone}`}>
    <header><strong>{title}</strong><span>{lang === 'zh' ? '当前估计中的样本权重' : 'Sample weights in the current estimate'}</span></header>
    <div>{visible.map((weight, index) => <span key={`${offset + index}-${weight}`}><i style={{ height: `${Math.max(3, (weight / max) * 72)}px` }} /><small>#{offset + index + 1}</small></span>)}</div>
  </section>
}

export default function StochasticApproximationLab({ lang, content }) {
  const [alpha, setAlpha] = useState(0.18)
  const [noise, setNoise] = useState(1.4)
  const [batchSize, setBatchSize] = useState(1)
  const [drifting, setDrifting] = useState(false)
  const [selected, setSelected] = useState(17)
  const result = useMemo(() => runStochasticApproximationComparison({ alpha, noise, batchSize, drifting }), [alpha, noise, batchSize, drifting])
  const zh = lang === 'zh'
  return <section className="sa-lab" aria-label={content.figure}>
    <header className="sa-lab-heading"><div><span>{content.figure}</span><h2><MathText>{content.question}</MathText></h2><p><MathText>{content.instruction}</MathText></p></div><button type="button" onClick={() => { setAlpha(0.18); setNoise(1.4); setBatchSize(1); setDrifting(false); setSelected(17) }}>{zh ? '恢复基线' : 'Reset baseline'}</button></header>
    <div className="sa-prediction"><span>{zh ? '先预测' : 'Predict first'}</span><p><MathText>{content.experimentIntro}</MathText></p></div>
    <div className="experiment-environment"><span>{zh ? '网格状态的重复回报样本' : 'Repeated returns from one grid state'}</span><MathFormula latex={String.raw`s_1\mapsto X_k=G_0^{(k)}`} /><small>{zh ? '固定策略从同一状态反复出发；每条随机轨迹给出一个带噪回报观测。' : 'A fixed policy repeatedly starts from one state; each random trajectory yields one noisy return observation.'}</small></div>
    <div className="sa-controls">
      <fieldset><legend>{zh ? '目标类型' : 'Target type'}</legend><div><button type="button" className={!drifting ? 'active' : ''} onClick={() => setDrifting(false)}>{zh ? '固定目标' : 'Stationary'}</button><button type="button" className={drifting ? 'active' : ''} onClick={() => setDrifting(true)}>{zh ? '中途漂移' : 'Mid-run drift'}</button></div></fieldset>
      <label><span>{zh ? '固定步长' : 'Constant step'} <MathFormula latex={String.raw`\alpha`} /><output>{alpha.toFixed(2)}</output></span><input type="range" min="0.04" max="0.5" step="0.01" value={alpha} onChange={(event) => setAlpha(Number(event.target.value))} /></label>
      <label><span>{zh ? '单样本噪声' : 'Per-sample noise'}<output>{noise.toFixed(1)}</output></span><input type="range" min="0" max="3" step="0.1" value={noise} onChange={(event) => setNoise(Number(event.target.value))} /></label>
      <fieldset><legend>{zh ? '每步 batch' : 'Batch per update'} <MathFormula latex={String.raw`m`} /></legend><div>{[1, 5, 20].map((size) => <button type="button" className={batchSize === size ? 'active' : ''} onClick={() => setBatchSize(size)} key={size}>{size}</button>)}</div></fieldset>
    </div>
    <div className="sa-chart-panel"><ComparisonChart result={result} selected={selected} lang={lang} /><label className="sa-step-selector"><span>{zh ? '检查更新步骤' : 'Inspect update step'}<output>{selected + 1}</output></span><input type="range" min="0" max={result.targets.length - 1} value={selected} onChange={(event) => setSelected(Number(event.target.value))} /></label></div>
    <div className="sa-evidence-stage">
      <UpdateLedger result={result} selected={selected} lang={lang} />
      <div className="sa-memory-panel"><header><span>{zh ? '记忆显微镜' : 'Memory microscope'}</span><strong>{zh ? `已消耗 ${result.sampleCost} 个样本` : `${result.sampleCost} samples consumed`}</strong></header><WeightStrip title={zh ? '衰减步长' : 'Decaying step'} history={result.decaying.weights} selected={selected} tone="decay" lang={lang} /><WeightStrip title={zh ? '固定步长' : 'Constant step'} history={result.constant.weights} selected={selected} tone="constant" lang={lang} /></div>
    </div>
    <footer><MathFormula block latex={String.raw`w_{k+1}=w_k+a_k(X_k-w_k)`} /><p><MathText>{content.explorer.cue}</MathText></p></footer>
  </section>
}
