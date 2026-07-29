import { useEffect, useMemo, useState } from 'react'
import MathFormula from './MathFormula'
import MathText from './MathText'
import { runStochasticApproximationComparison } from '../engine/learning-labs.js'

const format = (value) => Number(value).toFixed(3)
const STREAM_SEEDS = [20260719, 20260729, 20260739]

function bandPoints(lower, upper, count, x, y) {
  const lowerPoints = lower.slice(0, count).map((value, index) => `${x(index)},${y(value)}`)
  const upperPoints = upper.slice(0, count).map((value, index) => `${x(index)},${y(value)}`).reverse()
  return [...lowerPoints, ...upperPoints].join(' ')
}

function ComparisonChart({ result, selected, lang, mode }) {
  const width = 820
  const height = 230
  const pad = { left: 44, right: 18, top: 18, bottom: 28 }
  const visibleCount = selected + 1
  const all = [
    ...result.targets,
    ...result.observations,
    ...result.decaying.series,
    ...result.constant.series,
    ...result.ensemble.decaying.lower,
    ...result.ensemble.decaying.upper,
    ...result.ensemble.constant.lower,
    ...result.ensemble.constant.upper,
  ]
  const min = Math.min(...all) - 0.4
  const max = Math.max(...all) + 0.4
  const x = (index) => pad.left + (index / Math.max(result.targets.length - 1, 1)) * (width - pad.left - pad.right)
  const y = (value) => pad.top + ((max - value) / Math.max(max - min, 0.001)) * (height - pad.top - pad.bottom)
  const points = (values) => values.slice(0, visibleCount).map((value, index) => `${x(index)},${y(value)}`).join(' ')
  const selectedX = x(selected)
  return <div className="sa-chart-wrap">
    <svg className="sa-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={lang === 'zh' ? '同一批量观测下的衰减步长与固定步长逐步比较' : 'Progressive comparison of decaying and constant steps on matched batch observations'}>
      <line className="sa-axis" x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} />
      <line className="sa-axis" x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} />
      <polygon className="sa-decay-band" points={bandPoints(result.ensemble.decaying.lower, result.ensemble.decaying.upper, visibleCount, x, y)} />
      <polygon className="sa-constant-band" points={bandPoints(result.ensemble.constant.lower, result.ensemble.constant.upper, visibleCount, x, y)} />
      <polyline className="sa-target-line" points={points(result.targets)} />
      <polyline className="sa-decay-line" points={points(result.decaying.series)} />
      <polyline className="sa-constant-line" points={points(result.constant.series)} />
      {result.observations.slice(0, visibleCount).map((value, index) => <circle className="sa-observation-dot" cx={x(index)} cy={y(value)} r="2.8" key={`${index}-${value}`} />)}
      <line className="sa-selected-line" x1={selectedX} x2={selectedX} y1={pad.top} y2={height - pad.bottom} />
      <circle className="sa-selected-decay" cx={selectedX} cy={y(result.decaying.series[selected])} r="5" />
      <circle className="sa-selected-constant" cx={selectedX} cy={y(result.constant.series[selected])} r="5" />
      <text x={7} y={pad.top + 5}>{max.toFixed(1)}</text>
      <text x={7} y={height - pad.bottom}>{min.toFixed(1)}</text>
      <text x={pad.left} y={height - 8}>{result.xValues[0]}</text>
      <text x={width - pad.right - 30} y={height - 8}>{result.sampleCost}</text>
    </svg>
    <div className="sa-chart-legend">
      <span className="target">{mode === 'root' ? (lang === 'zh' ? '方程的根' : 'Equation root') : (lang === 'zh' ? '真实目标' : 'True target')}</span>
      <span className="observations">{mode === 'root' ? (lang === 'zh' ? '求根观测' : 'Root observations') : (lang === 'zh' ? '批量观测' : 'Batch observations')}</span>
      <span className="decay"><MathFormula latex={String.raw`a_k=1/k`} /> {lang === 'zh' ? '衰减' : 'decay'}</span>
      <span className="constant"><MathFormula latex={String.raw`a_k=\alpha`} /> {lang === 'zh' ? '固定' : 'constant'}</span>
      <span className="ensemble">{lang === 'zh' ? `${result.ensemble.size} 条随机种子轨迹的 10%–90% 区间` : `10%–90% band over ${result.ensemble.size} seeds`}</span>
    </div>
  </div>
}

function PlaybackControls({ stepIndex, last, playing, setPlaying, setSelected, lang }) {
  const zh = lang === 'zh'
  return <div className="sa-playback">
    <div className="sa-playback-buttons">
      <button type="button" disabled={stepIndex === 0} onClick={() => { setPlaying(false); setSelected((value) => Math.max(0, value - 1)) }}>{zh ? '上一步' : 'Previous'}</button>
      <button type="button" className="is-primary" aria-pressed={playing} onClick={() => setPlaying((value) => !value)}>{playing ? (zh ? '暂停' : 'Pause') : (zh ? '自动播放' : 'Auto play')}</button>
      <button type="button" disabled={stepIndex === last} onClick={() => { setPlaying(false); setSelected((value) => Math.min(last, value + 1)) }}>{zh ? '下一步' : 'Next'}</button>
      <button type="button" disabled={stepIndex === last} onClick={() => { setPlaying(false); setSelected(last) }}>{zh ? '到预算终点' : 'End of budget'}</button>
    </div>
    <label className="sa-step-selector">
      <span>{zh ? '当前更新' : 'Current update'}<output>{stepIndex + 1} / {last + 1}</output></span>
      <input type="range" min="0" max={last} value={stepIndex} onChange={(event) => { setPlaying(false); setSelected(Number(event.target.value)) }} />
    </label>
  </div>
}

function UpdateLedger({ result, selected, lang, mode }) {
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
  const hasNext = selected < result.updateCount - 1
  return <div className="sa-ledger">
    <header><span>{lang === 'zh' ? '选中更新' : 'Selected update'}</span><strong>{lang === 'zh' ? `第 ${selected + 1} 步` : `Step ${selected + 1}`}</strong></header>
    <div className="sa-ledger-table" role="table" aria-label={lang === 'zh' ? '两种步长的单步更新账本' : 'Single-step update ledger for two schedules'}>
      <div className="sa-ledger-row is-head" role="row"><b role="columnheader">{lang === 'zh' ? '量' : 'Quantity'}</b><b role="columnheader"><MathFormula latex={String.raw`1/k`} /></b><b role="columnheader"><MathFormula latex={String.raw`\alpha`} /></b></div>
      {rows.map(([label, left, right], index) => <div className="sa-ledger-row" role="row" key={index}><span role="cell">{label}</span><strong role="cell">{format(left)}</strong><strong role="cell">{format(right)}</strong></div>)}
    </div>
    <div className="sa-handoff">
      <span>{lang === 'zh' ? '状态交接' : 'State handoff'}</span>
      <MathFormula latex={String.raw`w_{k+1}^{\mathrm{after}}=w_{k+1}^{\mathrm{next\ before}}`} />
      <p>{hasNext
        ? (mode === 'root'
          ? (lang === 'zh' ? '播放下一步时，可以直接核对本行的更新后估计如何成为下一次求根修正的起点。' : 'Advance one step to verify that this after-update estimate becomes the next root correction’s starting point.')
          : (lang === 'zh' ? '进入下一步后，本行的更新后估计会原样成为下一张账本的更新前估计。' : 'On the next step, each after-update estimate becomes the next ledger’s before-update estimate unchanged.'))
        : (lang === 'zh' ? '当前已到达预算终点；切换预算后可以继续比较更新次数与证据数量。' : 'The current budget is exhausted; switch budget modes to compare update count with evidence quantity.')}</p>
    </div>
  </div>
}

function compressHistory(history, maxSampleBins = 6) {
  const size = Math.max(1, Math.ceil(history.samples.length / maxSampleBins))
  const sampleBins = []
  for (let start = 0; start < history.samples.length; start += size) {
    const values = history.samples.slice(start, start + size)
    sampleBins.push({
      key: `samples-${start}`,
      label: values.length === 1 ? `#${start + 1}` : `#${start + 1}–${start + values.length}`,
      value: values.reduce((total, value) => total + value, 0),
      type: 'samples',
    })
  }
  return [
    { key: 'initial', label: String.raw`w_1`, value: history.initial, type: 'initial' },
    ...sampleBins,
  ]
}

function WeightStrip({ title, bins, maxWeight, tone, lang }) {
  return <section className={`sa-weight-strip is-${tone}`}>
    <header><strong>{title}</strong><span>{lang === 'zh' ? '全部历史按连续区间合并' : 'All history grouped into contiguous bins'}</span></header>
    <div className="sa-weight-bars">{bins.map((bin) => <span className={`sa-weight-bin is-${bin.type}`} key={bin.key}>
      <i style={{ height: `${Math.max(3, (bin.value / maxWeight) * 72)}px` }} />
      {bin.type === 'initial' ? <MathFormula latex={bin.label} /> : <small>{bin.label}</small>}
    </span>)}</div>
  </section>
}

function MemoryPanel({ result, selected, lang }) {
  const decayBins = compressHistory(result.decaying.weights[selected])
  const constantBins = compressHistory(result.constant.weights[selected])
  const maxWeight = Math.max(...decayBins.map((bin) => bin.value), ...constantBins.map((bin) => bin.value), 0.001)
  const consumed = (selected + 1) * result.batchSize
  return <div className="sa-memory-panel">
    <header><span>{lang === 'zh' ? '记忆显微镜' : 'Memory microscope'}</span><strong>{lang === 'zh' ? `已用 ${consumed} / ${result.sampleCost} 个样本` : `${consumed} / ${result.sampleCost} samples used`}</strong></header>
    <WeightStrip title={lang === 'zh' ? '衰减步长' : 'Decaying step'} bins={decayBins} maxWeight={maxWeight} tone="decay" lang={lang} />
    <WeightStrip title={lang === 'zh' ? '固定步长' : 'Constant step'} bins={constantBins} maxWeight={maxWeight} tone="constant" lang={lang} />
  </div>
}

export default function StochasticApproximationLab({ lang, content }) {
  const [mode, setMode] = useState('returns')
  const [alpha, setAlpha] = useState(0.18)
  const [noise, setNoise] = useState(1.4)
  const [batchSize, setBatchSize] = useState(5)
  const [budgetMode, setBudgetMode] = useState('samples')
  const [drifting, setDrifting] = useState(false)
  const [seed, setSeed] = useState(STREAM_SEEDS[0])
  const [selected, setSelected] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rootMode = mode === 'root'
  const sampleBudget = rootMode ? 8 : 180
  const updateBudget = rootMode ? 8 : 36
  const stationaryTarget = rootMode ? 10 : 3
  const driftTarget = rootMode ? 12 : 5
  const initial = rootMode ? 20 : -1
  const result = useMemo(() => runStochasticApproximationComparison({
    alpha,
    noise,
    batchSize,
    budgetMode,
    drifting,
    seed,
    steps: updateBudget,
    sampleBudget,
    stationaryTarget,
    driftTarget,
    initial,
  }), [alpha, noise, batchSize, budgetMode, drifting, seed, updateBudget, sampleBudget, stationaryTarget, driftTarget, initial])
  const zh = lang === 'zh'
  const last = result.updateCount - 1
  const activeStep = Math.max(0, Math.min(selected, last))
  const settingsKey = `${mode}-${alpha}-${noise}-${batchSize}-${budgetMode}-${drifting}-${seed}`
  const returnsPresetActive = mode === 'returns' && alpha === 0.18 && noise === 1.4 && batchSize === 5 && budgetMode === 'samples' && !drifting && seed === STREAM_SEEDS[0]
  const rootPresetActive = mode === 'root' && alpha === 0.5 && noise === 0 && batchSize === 1 && budgetMode === 'samples' && !drifting && seed === STREAM_SEEDS[0]

  useEffect(() => {
    setSelected(0)
    setPlaying(false)
  }, [settingsKey])

  useEffect(() => {
    setSelected((value) => Math.min(last, value))
  }, [last])

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setSelected((value) => {
        if (value >= last) {
          setPlaying(false)
          return value
        }
        return value + 1
      })
    }, 520)
    return () => window.clearInterval(timer)
  }, [last, playing])

  const changeSetting = (setter, value) => {
    setPlaying(false)
    setSelected(0)
    setter(value)
  }

  const applyReturnsPreset = () => {
    setMode('returns')
    setAlpha(0.18)
    setNoise(1.4)
    setBatchSize(5)
    setBudgetMode('samples')
    setDrifting(false)
    setSeed(STREAM_SEEDS[0])
    setSelected(0)
    setPlaying(false)
  }

  const applyRootPreset = () => {
    setMode('root')
    setAlpha(0.5)
    setNoise(0)
    setBatchSize(1)
    setBudgetMode('samples')
    setDrifting(false)
    setSeed(STREAM_SEEDS[0])
    setSelected(0)
    setPlaying(false)
  }

  return <section className="sa-lab" aria-label={content.figure}>
    <header className="sa-lab-heading"><div><span>{content.figure}</span><h2><MathText>{content.question}</MathText></h2><p><MathText>{content.instruction}</MathText></p></div><button type="button" onClick={applyReturnsPreset}>{zh ? '恢复基线' : 'Reset baseline'}</button></header>
    <div className="sa-prediction"><span>{zh ? '先预测' : 'Predict first'}</span><p><MathText>{content.experimentIntro}</MathText></p></div>
    <div className="sa-demo-presets" role="group" aria-label={zh ? '运行预设' : 'Run presets'}>
      <span>{zh ? '运行预设' : 'Run preset'}</span>
      <button type="button" className={returnsPresetActive ? 'active' : ''} aria-pressed={returnsPresetActive} onClick={applyReturnsPreset}>{zh ? '带噪回报' : 'Noisy returns'}</button>
      <button type="button" className={rootPresetActive ? 'active' : ''} aria-pressed={rootPresetActive} onClick={applyRootPreset}>{zh ? '无噪声求根' : 'Noise-free root'}</button>
      <p>{rootMode
        ? (zh ? '从 20 出发，播放固定步长 0.5 如何逐次逼近线性方程的根 10。' : 'Start at 20 and play how constant step 0.5 approaches the linear root 10.')
        : (zh ? '从同一网格状态反复采样回报，比较步长记忆与批量预算。' : 'Resample returns from one grid state to compare step memory and batch budgets.')}</p>
    </div>
    <div className="experiment-environment">
      <span>{rootMode ? (zh ? '线性方程的残差观测' : 'Residual observations for a linear equation') : (zh ? '网格状态的重复回报样本' : 'Repeated returns from one grid state')}</span>
      <MathFormula latex={rootMode ? (drifting ? String.raw`g_k(w)=w-\theta_k,\quad \theta_k:10\to12,\quad w_1=20` : String.raw`g(w)=w-10,\quad w_1=20`) : String.raw`s_1\mapsto X_k=G_0^{(k)}`} />
      <small>{rootMode
        ? (zh ? '无噪声预设令每次观测都等于根；调高噪声后可继续检查 Robbins–Monro 的随机修正。' : 'The noise-free preset makes every observation equal the root; raise noise to inspect stochastic Robbins–Monro corrections.')
        : (zh ? '固定策略从同一状态反复出发；每条随机轨迹给出一个带噪回报观测。' : 'A fixed policy repeatedly starts from one state; each random trajectory yields one noisy return observation.')}</small>
    </div>
    <div className="sa-controls">
      <fieldset><legend>{rootMode ? (zh ? '根的位置' : 'Root position') : (zh ? '目标类型' : 'Target type')}</legend><div><button type="button" className={!drifting ? 'active' : ''} aria-pressed={!drifting} onClick={() => changeSetting(setDrifting, false)}>{rootMode ? (zh ? '固定根' : 'Fixed root') : (zh ? '固定目标' : 'Stationary')}</button><button type="button" className={drifting ? 'active' : ''} aria-pressed={drifting} onClick={() => changeSetting(setDrifting, true)}>{rootMode ? (zh ? '中途移动' : 'Moving root') : (zh ? '中途漂移' : 'Mid-run drift')}</button></div></fieldset>
      <label><span>{zh ? '固定步长' : 'Constant step'} <MathFormula latex={String.raw`\alpha`} /><output>{alpha.toFixed(2)}</output></span><input type="range" min="0.04" max="0.5" step="0.01" value={alpha} onChange={(event) => changeSetting(setAlpha, Number(event.target.value))} /></label>
      <label><span>{rootMode ? (zh ? '残差噪声' : 'Residual noise') : (zh ? '单样本噪声' : 'Per-sample noise')}<output>{noise.toFixed(1)}</output></span><input type="range" min="0" max="3" step="0.1" value={noise} onChange={(event) => changeSetting(setNoise, Number(event.target.value))} /></label>
      <fieldset><legend>{zh ? '每步 batch' : 'Batch per update'} <MathFormula latex={String.raw`m`} /></legend><div>{[1, 5, 20].map((size) => <button type="button" className={batchSize === size ? 'active' : ''} aria-pressed={batchSize === size} onClick={() => changeSetting(setBatchSize, size)} key={size}>{size}</button>)}</div></fieldset>
      <fieldset><legend>{zh ? '比较预算' : 'Comparison budget'}</legend><div><button type="button" className={budgetMode === 'samples' ? 'active' : ''} aria-pressed={budgetMode === 'samples'} onClick={() => changeSetting(setBudgetMode, 'samples')}>{zh ? '固定样本' : 'Fixed samples'}</button><button type="button" className={budgetMode === 'updates' ? 'active' : ''} aria-pressed={budgetMode === 'updates'} onClick={() => changeSetting(setBudgetMode, 'updates')}>{zh ? '固定更新' : 'Fixed updates'}</button></div></fieldset>
    </div>
    <div className="sa-budget-status">
      <span>{budgetMode === 'samples' ? (zh ? `固定 ${result.sampleBudget} 个底层样本` : `${result.sampleBudget} raw samples fixed`) : (zh ? `固定 ${result.updateBudget} 次参数更新` : `${result.updateBudget} parameter updates fixed`)}</span>
      <span>{zh ? `当前得到 ${result.updateCount} 次更新` : `${result.updateCount} updates produced`}</span>
      <div className="sa-seed-switch"><span>{zh ? '样本流' : 'Sample stream'}</span>{STREAM_SEEDS.map((value, index) => <button type="button" className={seed === value ? 'active' : ''} aria-pressed={seed === value} onClick={() => changeSetting(setSeed, value)} key={value}>{index + 1}</button>)}</div>
    </div>
    <div className="sa-chart-panel">
      <ComparisonChart result={result} selected={activeStep} lang={lang} mode={mode} />
      <PlaybackControls stepIndex={activeStep} last={last} playing={playing} setPlaying={setPlaying} setSelected={setSelected} lang={lang} />
    </div>
    <div className="sa-evidence-stage">
      <UpdateLedger result={result} selected={activeStep} lang={lang} mode={mode} />
      <MemoryPanel result={result} selected={activeStep} lang={lang} />
    </div>
    <footer><MathFormula block latex={rootMode ? String.raw`w_{k+1}=w_k-a_k\widetilde g(w_k)` : String.raw`w_{k+1}=w_k+a_k(X_k-w_k)`} /><p><MathText>{content.explorer.cue}</MathText></p></footer>
  </section>
}
