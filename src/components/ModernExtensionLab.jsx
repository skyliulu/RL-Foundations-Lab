import { useMemo, useState } from 'react'
import { evaluateDpo, evaluateGrpo } from '../engine/post-training.js'
import { buildAgentTrajectory, codingCandidates, evaluateCodingReward, evaluateCredit } from '../engine/modern-extension.js'
import MathFormula from './MathFormula.jsx'
import MathText from './MathText.jsx'

const environmentCopy = {
  dpo: {
    zh: ['偏好数据环境', String.raw`x\mapsto(y_w,y_l)`, '同一个 prompt 下的 chosen / rejected 回答构成一条离线偏好证据。'],
    en: ['Preference-data environment', String.raw`x\mapsto(y_w,y_l)`, 'Chosen and rejected responses to one prompt form a single offline preference observation.'],
  },
  grpo: {
    zh: ['共享 prompt 的 rollout 组', String.raw`x\mapsto\{y_1,\ldots,y_G\}`, '所有回答面对同一任务，组内奖励才具有可比较的相对含义。'],
    en: ['Rollout group for one prompt', String.raw`x\mapsto\{y_1,\ldots,y_G\}`, 'All responses face the same task, so group-relative rewards are comparable.'],
  },
  codingrl: {
    zh: ['代码仓库与测试环境', String.raw`s_t\xrightarrow{\mathrm{patch}}s_{t+1}\xrightarrow{\mathrm{tests}}o_{t+1}`, '候选补丁改变仓库状态，测试结果是环境返回的可执行观察。'],
    en: ['Repository and test environment', String.raw`s_t\xrightarrow{\mathrm{patch}}s_{t+1}\xrightarrow{\mathrm{tests}}o_{t+1}`, 'A patch changes repository state and tests return executable observations.'],
  },
  agentmdp: {
    zh: ['多轮工具环境', String.raw`(h_t,m_t)\xrightarrow{a_t^{\mathrm{tool}}}o_{t+1}`, '历史与记忆构成状态，工具调用改变环境并产生下一条观察。'],
    en: ['Multi-turn tool environment', String.raw`(h_t,m_t)\xrightarrow{a_t^{\mathrm{tool}}}o_{t+1}`, 'History and memory define state; tool calls change the environment and return observations.'],
  },
  credit: {
    zh: ['同一条 Agent 轨迹', String.raw`\tau=(s_0,a_0,o_1,\ldots,s_T)`, '五种归因方法读取同一条工具轨迹；分段方法显式使用工具边界，反事实方法重放合理替代动作。'],
    en: ['One shared agent trajectory', String.raw`\tau=(s_0,a_0,o_1,\ldots,s_T)`, 'Five schemes read one tool trajectory; segment credit uses tool boundaries and counterfactual credit replays plausible alternatives.'],
  },
}

function DpoMarginCurve({ beforeMargin, afterMargin, beforeLoss, afterLoss, lang }) {
  const width = 640
  const height = 165
  const pad = { left: 46, right: 18, top: 18, bottom: 26 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const mMin = -2.2
  const mMax = 2.2
  const lMax = 2.5
  const sig = (v) => 1 / (1 + Math.exp(-v))
  const lossOf = (m) => -Math.log(sig(m))
  const x = (m) => pad.left + ((Math.max(mMin, Math.min(mMax, m)) - mMin) / (mMax - mMin)) * plotW
  const yL = (val) => pad.top + (1 - Math.max(0, Math.min(lMax, val)) / lMax) * plotH
  const yW = (w) => pad.top + (1 - Math.max(0, Math.min(1, w))) * plotH
  const grid = Array.from({ length: 45 }, (_, i) => mMin + (i / 44) * (mMax - mMin))
  const lossPath = grid.map((m, i) => `${i === 0 ? 'M' : 'L'}${x(m).toFixed(1)},${yL(lossOf(m)).toFixed(1)}`).join(' ')
  const weightPath = grid.map((m, i) => `${i === 0 ? 'M' : 'L'}${x(m).toFixed(1)},${yW(sig(-m)).toFixed(1)}`).join(' ')
  const weightBefore = sig(-beforeMargin)

  return (
    <div className="dpo-curve-panel">
      <header>
        <span>{lang === 'zh' ? '间隔演化曲线：损失函数与隐式梯度权重' : 'Margin response curve: logistic loss and implicit gradient weight'}</span>
        <div className="dpo-curve-legend">
          <span><i className="is-loss" />{lang === 'zh' ? '损失 ' : 'Loss '}<MathFormula latex={String.raw`\mathcal L(m)=-\log\sigma(m)`} /></span>
          <span><i className="is-weight" />{lang === 'zh' ? '梯度权重 ' : 'Gradient weight '}<MathFormula latex={String.raw`\sigma(-m)=${weightBefore.toFixed(3)}`} /></span>
        </div>
      </header>
      <svg className="dpo-curve-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={lang === 'zh' ? 'DPO 间隔损失与梯度权重曲线' : 'DPO margin loss and gradient weight curve'}>
        <line className="dpo-axis" x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} />
        <line className="dpo-axis" x1={x(0)} x2={x(0)} y1={pad.top} y2={height - pad.bottom} />
        <path className="dpo-curve-weight" d={weightPath} />
        <path className="dpo-curve-loss" d={lossPath} />
        <line className="dpo-step-line" x1={x(beforeMargin)} y1={yL(beforeLoss)} x2={x(afterMargin)} y2={yL(afterLoss)} />
        <circle className="dpo-dot-before" cx={x(beforeMargin)} cy={yL(beforeLoss)} r="4.5" />
        <circle className="dpo-dot-after" cx={x(afterMargin)} cy={yL(afterLoss)} r="5" />
        <text className="dpo-axis-tick" x={x(-2)} y={height - 8} textAnchor="middle">-2</text>
        <text className="dpo-axis-tick" x={x(0)} y={height - 8} textAnchor="middle">0</text>
        <text className="dpo-axis-tick" x={x(2)} y={height - 8} textAnchor="middle">+2</text>
        <text className="dpo-axis-tick" x={pad.left - 6} y={pad.top + 6} textAnchor="end">2.5</text>
        <text className="dpo-axis-tick" x={pad.left - 6} y={height - pad.bottom} textAnchor="end">0.0</text>
      </svg>
    </div>
  )
}

function DpoLab({ lang }) {
  const [beta, setBeta] = useState(0.4)
  const [chosenShift, setChosenShift] = useState(0.3)
  const [rejectedShift, setRejectedShift] = useState(-0.3)
  const [learningRate, setLearningRate] = useState(0.5)
  const result = useMemo(() => evaluateDpo({ beta, chosenShift, rejectedShift, learningRate }), [beta, chosenShift, rejectedShift, learningRate])
  const likelihoodDisplacement = chosenShift < -0.01 && result.margin > 0

  const presets = [
    { id: 'ideal', beta: 0.4, chosenShift: 0.45, rejectedShift: -0.45, zh: '① 理想分离（$y_w$ 升 / $y_l$ 降）', en: '① Ideal separation ($y_w$ up / $y_l$ down)' },
    { id: 'displacement', beta: 0.4, chosenShift: -0.25, rejectedShift: -1.1, zh: '② 似然同时下降（两者皆负但间隔为正）', en: '② Likelihood displacement (both drop, $m>0$)' },
    { id: 'reversed', beta: 0.4, chosenShift: -0.35, rejectedShift: 0.45, zh: '③ 排序反转（$\\sigma(-m)$ 权重飙升）', en: '③ Reversed ranking (high $\\sigma(-m)$ push)' },
  ]

  return <div className="modern-lab-body">
    <div className="dpo-presets" role="group" aria-label={lang === 'zh' ? 'DPO 典型场景预设' : 'DPO diagnostic presets'}>
      {presets.map((preset) => {
        const isCurrent = Math.abs(chosenShift - preset.chosenShift) < 0.03 && Math.abs(rejectedShift - preset.rejectedShift) < 0.03
        return (
          <button
            type="button"
            key={preset.id}
            className={isCurrent ? 'active' : ''}
            aria-pressed={isCurrent}
            onClick={() => { setBeta(preset.beta); setChosenShift(preset.chosenShift); setRejectedShift(preset.rejectedShift) }}
          >
            <MathText>{lang === 'zh' ? preset.zh : preset.en}</MathText>
          </button>
        )
      })}
    </div>
    <div className="modern-controls dpo-controls"><label><span><MathFormula latex={String.raw`\beta`} /> <output>{beta.toFixed(2)}</output></span><input aria-label="beta" type="range" min="0.05" max="1.2" step="0.05" value={beta} onChange={(event) => setBeta(Number(event.target.value))} /></label><label><span>{lang === 'zh' ? 'chosen 相对参考模型的变化' : 'Chosen shift from reference'} <output>{chosenShift.toFixed(2)}</output></span><input aria-label="chosen shift" type="range" min="-0.8" max="1.2" step="0.05" value={chosenShift} onChange={(event) => setChosenShift(Number(event.target.value))} /></label><label><span>{lang === 'zh' ? 'rejected 相对参考模型的变化' : 'Rejected shift from reference'} <output>{rejectedShift.toFixed(2)}</output></span><input aria-label="rejected shift" type="range" min="-1.2" max="0.8" step="0.05" value={rejectedShift} onChange={(event) => setRejectedShift(Number(event.target.value))} /></label><label><span>{lang === 'zh' ? '单步学习率' : 'One-step learning rate'} <MathFormula latex={String.raw`\alpha`} /> <output>{learningRate.toFixed(2)}</output></span><input aria-label="DPO learning rate" type="range" min="0.1" max="1.2" step="0.05" value={learningRate} onChange={(event) => setLearningRate(Number(event.target.value))} /></label></div>
    {likelihoodDisplacement && (
      <div className="dpo-displacement-alert" role="status">
        <strong>{lang === 'zh' ? '似然位移现象（Likelihood Displacement）' : 'Likelihood Displacement detected'}</strong>
        <span>{lang === 'zh'
          ? <>注意偏好回答 <MathFormula latex={String.raw`\Delta_w=${chosenShift.toFixed(2)}<0`} /> 实际概率也在下降，但因为被拒回答下降得更多（<MathFormula latex={String.raw`\Delta_l=${rejectedShift.toFixed(2)}`} />），差值间隔 <MathFormula latex={String.raw`m=${result.margin.toFixed(3)}>0`} /> 仍表现为“损失很低”。</>
          : <>Chosen shift <MathFormula latex={String.raw`\Delta_w=${chosenShift.toFixed(2)}<0`} /> is falling, yet because rejected drops further (<MathFormula latex={String.raw`\Delta_l=${rejectedShift.toFixed(2)}`} />), margin <MathFormula latex={String.raw`m=${result.margin.toFixed(3)}>0`} /> still looks low-loss to DPO.</>}</span>
      </div>
    )}
    <div className="preference-pair"><article className="chosen"><small>{lang === 'zh' ? '偏好回答 ' : 'Chosen response '}<MathFormula latex={String.raw`y_w`} /></small><p>{lang === 'zh' ? '解释原因并覆盖边界条件。' : 'Explains the cause and covers edge cases.'}</p><b><MathFormula latex={String.raw`\Delta\log\pi=${result.chosenShift.toFixed(2)}`} /></b></article><span className="preference-relation"><MathFormula latex={String.raw`\succ`} /></span><article><small>{lang === 'zh' ? '被拒回答 ' : 'Rejected response '}<MathFormula latex={String.raw`y_l`} /></small><p>{lang === 'zh' ? '只给结论，遗漏关键条件。' : 'States a conclusion and misses key conditions.'}</p><b><MathFormula latex={String.raw`\Delta\log\pi=${result.rejectedShift.toFixed(2)}`} /></b></article></div>
    <DpoMarginCurve beforeMargin={result.margin} afterMargin={result.after.margin} beforeLoss={result.loss} afterLoss={result.after.loss} lang={lang} />
    <div className="dpo-logprob-ledger">
      <span>{lang === 'zh' ? '回答' : 'Response'}</span><span>{lang === 'zh' ? '参考模型' : 'Reference'}</span><span>{lang === 'zh' ? '当前策略' : 'Current policy'}</span><span>{lang === 'zh' ? '相对变化' : 'Shift'}</span>
      {['chosen', 'rejected'].map((key) => <div key={key}><strong>{lang === 'zh' ? (key === 'chosen' ? '偏好回答' : '被拒回答') : key}</strong><MathFormula latex={String.raw`\log\pi_{\rm ref}=${result.pair[key].referenceLogp.toFixed(2)}`} /><MathFormula latex={String.raw`\log\pi_\theta=${result.pair[key].currentLogp.toFixed(2)}`} /><MathFormula latex={String.raw`\Delta=${result[`${key}Shift`].toFixed(2)}`} /></div>)}
    </div>
    <div className="dpo-update-ledger">
      <article><span>{lang === 'zh' ? '更新前' : 'Before'}</span><MathFormula latex={String.raw`m=${result.margin.toFixed(3)}`} /><strong><MathFormula latex={String.raw`\mathcal L=${result.loss.toFixed(3)}`} /></strong></article>
      <i aria-hidden="true">→</i>
      <article><span>{lang === 'zh' ? '梯度贡献与优化器一步' : 'Gradient contributions and optimizer step'}</span><MathFormula latex={String.raw`\frac{\partial\mathcal L}{\partial\Delta_w}=${result.gradients.chosen.toFixed(3)}`} /><MathFormula latex={String.raw`\frac{\partial\mathcal L}{\partial\Delta_l}=${result.gradients.rejected.toFixed(3)}`} /><small><MathFormula latex={String.raw`\Delta_w\mathrel{+}=${result.updateMagnitude.toFixed(3)},\quad\Delta_l\mathrel{-}=${result.updateMagnitude.toFixed(3)}`} /></small></article>
      <i aria-hidden="true">→</i>
      <article className="is-after"><span>{lang === 'zh' ? '更新后' : 'After'}</span><MathFormula latex={String.raw`m'=${result.after.margin.toFixed(3)}`} /><strong><MathFormula latex={String.raw`\mathcal L'=${result.after.loss.toFixed(3)}`} /></strong></article>
    </div>
    <div className="modern-equation"><MathFormula block latex={String.raw`m=\beta(\Delta_w-\Delta_l),\qquad\mathcal L=-\log\sigma(m)`} /><strong>{lang === 'zh' ? '间隔 ' : 'Margin '}<MathFormula latex={String.raw`m=${result.margin.toFixed(3)}`} /> · <MathFormula latex={String.raw`p(y_w\succ y_l)=${result.preferenceProbability.toFixed(3)}`} /> · {lang === 'zh' ? '损失 ' : 'Loss '}<MathFormula latex={String.raw`\mathcal L=${result.loss.toFixed(3)}`} /></strong></div>
  </div>
}

function GrpoLab({ lang }) {
  const zh = lang === 'zh'
  const scenarios = {
    mixed: [0.2, 0.9, 0.55, -0.05, 0.78, 0.12, 0.84, 0.32],
    allRight: [1, 1, 1, 1, 1, 1, 1, 1],
    allWrong: [0, 0, 0, 0, 0, 0, 0, 0],
    close: [0.48, 0.52, 0.5, 0.51, 0.49, 0.51, 0.5, 0.49],
  }
  const groupSizes = [2, 4, 6, 8]
  const [scenario, setScenario] = useState('mixed')
  const [groupSize, setGroupSize] = useState(4)
  const [clip, setClip] = useState(0.2)
  const [clipHigher, setClipHigher] = useState(false)
  const [dynamicSampling, setDynamicSampling] = useState(false)
  const rewards = scenarios[scenario].slice(0, groupSize)
  const effectiveClipHigh = clipHigher ? Math.min(0.45, Number((clip + 0.14).toFixed(2))) : clip
  const result = useMemo(
    () => evaluateGrpo({ rewards, clip, clipHigh: effectiveClipHigh, dynamicSampling }),
    [scenario, groupSize, clip, effectiveClipHigh, dynamicSampling],
  )
  const maxAbsAdv = Math.max(1.5, ...result.samples.map((s) => Math.abs(s.advantage)))

  return <div className="modern-lab-body">
    <div className="modern-controls grpo-controls">
      <div className="grpo-control-group">
        <span className="grpo-control-label">{zh ? '奖励分布' : 'Reward distribution'}</span>
        <div className="modern-segmented">{Object.keys(scenarios).map((id) => <button type="button" className={scenario === id ? 'active' : ''} aria-pressed={scenario === id} key={id} onClick={() => setScenario(id)}>{({ mixed: zh ? '有区分' : 'Mixed', allRight: zh ? '全对' : 'All right', allWrong: zh ? '全错' : 'All wrong', close: zh ? '近似同分' : 'Low variance' })[id]}</button>)}</div>
      </div>
      <div className="grpo-control-group">
        <span className="grpo-control-label">{zh ? '回答组大小' : 'Group size'} <MathFormula latex={String.raw`G`} /></span>
        <div className="modern-segmented grpo-size-segmented">{groupSizes.map((size) => <button type="button" className={groupSize === size ? 'active' : ''} aria-pressed={groupSize === size} key={size} onClick={() => setGroupSize(size)}><MathFormula latex={String.raw`G=${size}`} /></button>)}</div>
      </div>
      <label>
        <span>{zh ? '裁剪下界' : 'Lower clip'} <MathFormula latex={String.raw`\epsilon_{\mathrm{low}}`} /> <output>{clip.toFixed(2)}</output></span>
        <input aria-label="GRPO clip range" type="range" min="0.05" max="0.35" step="0.01" value={clip} onChange={(event) => setClip(Number(event.target.value))} />
      </label>
      <div className="grpo-control-group">
        <span className="grpo-control-label">{zh ? '非对称裁剪（DAPO Clip-Higher）' : 'Asymmetric clip (DAPO Clip-Higher)'}</span>
        <div className="modern-segmented grpo-clip-higher-toggle">
          <button type="button" className={clipHigher ? 'active' : ''} aria-pressed={clipHigher} onClick={() => setClipHigher((v) => !v)}>
            {clipHigher
              ? <>{zh ? '已开启：' : 'On: '}<MathFormula latex={String.raw`\epsilon_{\mathrm{high}}=${effectiveClipHigh.toFixed(2)}`} /></>
              : <>{zh ? '对称边界：' : 'Symmetric: '}<MathFormula latex={String.raw`\epsilon_{\mathrm{high}}=${clip.toFixed(2)}`} /></>}
          </button>
        </div>
      </div>
      <div className="grpo-control-group grpo-filter-group">
        <span className="grpo-control-label">{zh ? '有信息组筛选' : 'Informative-group filter'}</span>
        <div className="modern-segmented grpo-filter-toggle">
          <button type="button" className={dynamicSampling ? 'active' : ''} aria-pressed={dynamicSampling} onClick={() => setDynamicSampling((value) => !value)}>
            {dynamicSampling
              ? (zh ? '动态采样：已开启（过滤低方差组）' : 'Dynamic sampling: On (filter flat groups)')
              : (zh ? '动态采样：关闭（保留全部组）' : 'Dynamic sampling: Off (keep all groups)')}
          </button>
        </div>
      </div>
    </div>

    <section className="grpo-adv-chart" aria-label={zh ? '以组均值为零轴的相对优势柱图' : 'Group-mean centered relative advantage bar chart'}>
      <header>
        <span>{zh ? '以组均值 ' : 'Centered at group mean '}<MathFormula latex={String.raw`\mu_R=${result.mean.toFixed(2)}`} />{zh ? ' 为零轴的双向相对优势' : ' (diverging relative advantages)'}</span>
        <small>{result.unlockedCount > 0
          ? (zh ? `Clip-Higher 释放了 ${result.unlockedCount} 条高优势回答的上升空间` : `Clip-Higher unlocked ${result.unlockedCount} positive-advantage response(s)`)
          : (zh ? '向右为正优势（鼓励），向左为负优势（压低）' : 'Right = positive advantage, left = negative advantage')}</small>
      </header>
      <div className="grpo-adv-rows">
        {result.samples.map((sample) => {
          const pct = Math.min(50, (Math.abs(sample.advantage) / maxAbsAdv) * 48)
          const pos = sample.advantage >= 0
          return (
            <div className={`grpo-adv-row${result.filteredOut ? ' is-skipped' : ''}${sample.clipHigherUnlocked ? ' is-unlocked' : ''}`} key={sample.id}>
              <b>{zh ? `回答 ${sample.id}` : `Resp ${sample.id}`}</b>
              <div className="grpo-adv-track" aria-hidden="true">
                <i className="grpo-adv-zero" />
                <em
                  className={pos ? 'is-pos' : 'is-neg'}
                  style={pos ? { left: '50%', width: `${Math.max(1.5, pct)}%` } : { right: '50%', width: `${Math.max(1.5, pct)}%` }}
                />
              </div>
              <MathFormula latex={String.raw`A=${sample.advantage.toFixed(2)}`} />
            </div>
          )
        })}
      </div>
    </section>

    <div className={`group-responses grpo-group-responses${result.filteredOut ? ' is-filtered' : ''}`}>{result.samples.map((sample) => <article key={sample.id} className={`${sample.advantage > 0.01 ? 'positive' : sample.advantage < -0.01 ? 'negative' : ''}${result.filteredOut ? ' is-skipped' : ''}${sample.clipHigherUnlocked ? ' is-unlocked' : ''}`}><small>{zh ? `回答 ${sample.id}` : `Response ${sample.id}`}</small><strong><MathFormula latex={String.raw`R=${sample.reward.toFixed(2)}`} /></strong><span><MathFormula latex={String.raw`A=${sample.advantage.toFixed(2)}`} /></span><span><MathFormula latex={String.raw`r:${sample.ratio.toFixed(2)}\rightarrow${sample.clippedRatio.toFixed(2)}`} /></span><b><MathFormula latex={String.raw`J=${sample.effectiveObjective.toFixed(3)}`} /></b>{sample.clipHigherUnlocked && !result.filteredOut && <em className="grpo-unlock-tag">{zh ? 'Clip-Higher 解锁上升' : 'Clip-Higher unlocked'}</em>}{result.filteredOut && <em className="grpo-skip-tag">{zh ? '已过滤 · 不进入更新' : 'Filtered · skipped'}</em>}</article>)}</div>
    <div className={`variance-banner ${!result.informative ? 'warn' : ''}`}><b><MathFormula latex={String.raw`\mu=${result.mean.toFixed(3)}\;\cdot\;\sigma=${result.std.toFixed(3)}`} /> · {zh ? `进入更新 ${result.activeCount}/${result.groupSize}` : `In update ${result.activeCount}/${result.groupSize}`}</b><span>{!result.informative ? (result.filteredOut ? (zh ? '动态采样已过滤该无信息组：这批样本不产生梯度，需重新采样或调整题目难度。' : 'Dynamic sampling filtered this flat group: zero samples enter the update, freeing budget for informative prompts.') : (zh ? '组内没有可靠排序信号，但当前未开启筛选；开启“动态采样”可将该组移出更新批次。' : 'The group has no reliable ranking signal, yet remains in the batch. Enable dynamic sampling to drop it before updating.')) : (zh ? '组内奖励存在有效差异，全部候选均可提供相对优势并进入本轮更新。' : 'Within-group rewards separate candidates, so all responses provide relative advantage for this update.')}</span></div>
  </div>
}

function CodingLab({ lang }) {
  const [candidateId, setCandidateId] = useState('A')
  const [mode, setMode] = useState('partial')
  const [hidden, setHidden] = useState(false)
  const result = useMemo(() => evaluateCodingReward({ candidateId, mode, revealHidden: hidden }), [candidateId, mode, hidden])
  const visibleOnly = useMemo(() => evaluateCodingReward({ candidateId, mode, revealHidden: false }), [candidateId, mode])
  const rewardGap = result.reward - visibleOnly.reward
  return <div className="modern-lab-body">
    <div className="modern-controls stacked"><div className="modern-segmented">{codingCandidates.map((candidate) => <button type="button" key={candidate.id} className={candidateId === candidate.id ? 'active' : ''} aria-pressed={candidateId === candidate.id} onClick={() => setCandidateId(candidate.id)}>{lang === 'zh' ? `步骤 ${candidate.stage} · ${candidate.label}` : `Step ${candidate.stage} · ${candidate.enLabel}`}</button>)}</div><div className="modern-segmented">{['outcome', 'partial', 'weighted'].map((id) => <button type="button" key={id} className={mode === id ? 'active' : ''} aria-pressed={mode === id} onClick={() => setMode(id)}>{({ outcome: lang === 'zh' ? '全通过' : 'All pass', partial: lang === 'zh' ? '通过比例' : 'Pass rate', weighted: lang === 'zh' ? '难度加权' : 'Weighted' })[id]}</button>)}<button type="button" className={hidden ? 'active danger' : ''} aria-pressed={hidden} onClick={() => setHidden((value) => !value)}>{lang === 'zh' ? '显示隐藏测试' : 'Reveal hidden tests'}</button></div></div>
    <div className="coding-repair-tape">
      {result.trajectory.map((stage, index) => <button type="button" className={`${stage.selected ? 'is-selected' : ''} ${stage.reached ? 'is-reached' : ''}`} aria-pressed={stage.selected} onClick={() => setCandidateId(codingCandidates[index].id)} key={stage.id}>
        <span>{lang === 'zh' ? `步骤 ${stage.stage}` : `Step ${stage.stage}`}</span>
        <strong>{lang === 'zh' ? codingCandidates[index].label : codingCandidates[index].enLabel}</strong>
        <small>{stage.inputFeedback[lang]}</small>
        <div><b>{lang === 'zh' ? '可见失败' : 'Visible failures'} {stage.visibleFailures}</b><i>{lang === 'zh' ? '隐藏失败' : 'Hidden failures'} {hidden ? stage.hiddenFailures : '?'}</i></div>
      </button>)}
    </div>
    <div className="coding-evidence">
      <section className="candidate-diff"><header><span>{lang === 'zh' ? '当前修复动作' : 'Current repair action'}</span><strong>{result.candidate.intent[lang]}</strong></header><pre>{result.candidate.diff.map((line) => <code className={line.startsWith('+') ? 'added' : 'removed'} key={line}>{line}</code>)}</pre></section>
      <section className="test-matrix"><header><span>{lang === 'zh' ? '动作后的执行观察' : 'Execution observation after the action'}</span><strong>{lang === 'zh' ? `步骤 ${result.candidate.stage}` : `step ${result.candidate.stage}`}</strong></header><div>{result.tests.map((passed, index) => <span className={passed ? 'pass' : 'fail'} key={index}><b>{hidden && index >= 4 ? 'H' : 'T'}{index + 1}</b><em>{result.testNames[index]}</em>{passed ? 'PASS' : 'FAIL'}<small>w {result.weights[index].toFixed(1)}</small></span>)}</div></section>
    </div>
    <div className="coding-result"><b><MathFormula latex={String.raw`R=${result.reward.toFixed(3)}`} /></b><span>{!hidden
      ? (lang === 'zh' ? '隐藏测试尚未显示；当前分数只反映可见证据。点击任意修复步骤或显示隐藏测试以检验是否存在奖励投机。' : 'Hidden tests are not revealed; this score reflects visible evidence only. Click any repair step or reveal hidden tests to audit generalization.')
      : result.generalizes
        ? (lang === 'zh' ? <>隐藏测试全部通过（可见 <MathFormula latex={visibleOnly.reward.toFixed(3)} /> → 全套 <MathFormula latex={result.reward.toFixed(3)} />）：证据支持真正泛化。</> : <>Hidden tests pass (visible <MathFormula latex={visibleOnly.reward.toFixed(3)} /> → full <MathFormula latex={result.reward.toFixed(3)} />): evidence supports true generalization.</>)
        : (lang === 'zh' ? <>存在隐藏失败（可见 <MathFormula latex={visibleOnly.reward.toFixed(3)} /> → 含隐藏 <MathFormula latex={result.reward.toFixed(3)} />，落差 <MathFormula latex={rewardGap.toFixed(3)} />）：可见奖励高估了真实修复质量。</> : <>Hidden failures remain (visible <MathFormula latex={visibleOnly.reward.toFixed(3)} /> → full <MathFormula latex={result.reward.toFixed(3)} />, gap <MathFormula latex={rewardGap.toFixed(3)} />): visible reward overstates true quality.</>)}</span></div>
  </div>
}

function AgentLab({ lang }) {
  const zh = lang === 'zh'
  const [failureAt, setFailureAt] = useState('none')
  const [inspectedNodeId, setInspectedNodeId] = useState('inspect-boundary')
  const trajectory = useMemo(() => buildAgentTrajectory({ failureAt }), [failureAt])
  const inspectedNode = trajectory.nodes.find((node) => node.id === inspectedNodeId)
    || trajectory.nodes.find((node) => node.id === trajectory.firstDivergence)
    || trajectory.nodes[0]

  const switchBranch = (branch, focusId) => {
    setFailureAt(branch)
    if (focusId) setInspectedNodeId(focusId)
    else setInspectedNodeId(branch === 'inspect' ? 'inspect-parser' : branch === 'test' ? 'stop' : 'inspect-boundary')
  }

  const handleNodeClick = (node) => {
    if (!node.selected && node.branchTarget) {
      setFailureAt(node.branchTarget)
    }
    setInspectedNodeId(node.id)
  }

  return <div className="modern-lab-body">
    <div className="modern-controls"><div className="modern-segmented"><button type="button" className={failureAt === 'none' ? 'active' : ''} aria-pressed={failureAt === 'none'} onClick={() => switchBranch('none')}>{zh ? '完整成功轨迹' : 'Successful trajectory'}</button><button type="button" className={failureAt === 'inspect' ? 'active' : ''} aria-pressed={failureAt === 'inspect'} onClick={() => switchBranch('inspect')}>{zh ? '错误定位分支' : 'Bad localization'}</button><button type="button" className={failureAt === 'test' ? 'active' : ''} aria-pressed={failureAt === 'test'} onClick={() => switchBranch('test')}>{zh ? '测试后过早终止' : 'Stop after test'}</button></div></div>
    <div className="agent-tree">
      <div className="agent-tree-scroll">
        <div className="agent-tree-grid">
          {trajectory.nodes.map((node) => (
            <button
              type="button"
              key={node.id}
              className={`agent-tree-node ${node.selected ? 'is-selected' : ''} ${node.branchAlternative ? 'is-alternative' : ''} ${node.isDivergence ? 'is-divergence' : ''} ${inspectedNode.id === node.id ? 'is-inspected' : ''} ${node.terminal ? node.success ? 'is-success' : 'is-failure' : ''}`}
              aria-pressed={inspectedNode.id === node.id}
              style={{ gridColumn: node.depth + 1 }}
              onClick={() => handleNodeClick(node)}
            >
              <span>{zh ? node.zhTool : node.tool}{node.isDivergence ? (zh ? ' · 首次分叉' : ' · fork') : ''}</span>
              <strong>{zh ? node.zhAction : node.action}</strong>
              <small>{zh ? node.zhObservation : node.observation}</small>
              {node.branchAlternative && <em>{zh ? '点击切换此分支' : 'Click to take branch'}</em>}
            </button>
          ))}
        </div>
      </div>
      <aside className="agent-node-inspector">
        <header>
          <span>{zh ? '决策边界检查器（点击树中任意节点切换）' : 'Decision-boundary inspector (click any tree node)'}</span>
          <strong>{zh ? `第 ${inspectedNode.depth + 1} 步 · ${inspectedNode.zhTool}` : `Step ${inspectedNode.depth + 1} · ${inspectedNode.tool}`}</strong>
        </header>
        <div className="agent-boundary-cards">
          <div>
            <small>{zh ? '策略可控动作（计入策略梯度）' : 'Policy action (in log-prob)'}</small>
            <strong><MathFormula latex={String.raw`A_${inspectedNode.depth}`} /> · {zh ? inspectedNode.zhAction : inspectedNode.action}</strong>
          </div>
          <div>
            <small>{zh ? '环境返回观察（不计入策略梯度）' : 'Environment observation (outside log-prob)'}</small>
            <strong><MathFormula latex={String.raw`O_${inspectedNode.depth + 1}`} /> · {zh ? inspectedNode.zhObservation : inspectedNode.observation}</strong>
          </div>
        </div>
        <p>{zh ? inspectedNode.zhStateNote : inspectedNode.enStateNote}</p>
        <div className="agent-path-summary">
          <span>{zh ? '当前真实路径：' : 'Realized path: '}</span>
          <strong>{trajectory.steps.map((step) => (zh ? step.zhTool : step.id)).join(' → ')}</strong>
        </div>
      </aside>
    </div>
    <div className={`trajectory-result ${trajectory.success ? 'success' : 'failed'}`}><b>{trajectory.success ? (zh ? '任务成功' : 'Task success') : (zh ? '轨迹失败' : 'Trajectory failure')}</b><span>{zh ? trajectory.zhTerminal : trajectory.terminal} · {zh ? '交互成本' : 'cost'} {trajectory.cost.toFixed(1)}</span></div>
  </div>
}

function CreditLab({ lang }) {
  const zh = lang === 'zh'
  const [scheme, setScheme] = useState('terminal')
  const [gamma, setGamma] = useState(0.9)
  const [trust, setTrust] = useState(0.7)
  const [selectedStepId, setSelectedStepId] = useState('inspect')
  const allSchemes = useMemo(() => ({
    terminal: evaluateCredit({ scheme: 'terminal', gamma, trust }),
    discounted: evaluateCredit({ scheme: 'discounted', gamma, trust }),
    process: evaluateCredit({ scheme: 'process', gamma, trust }),
    segment: evaluateCredit({ scheme: 'segment', gamma, trust }),
    counterfactual: evaluateCredit({ scheme: 'counterfactual', gamma, trust }),
  }), [gamma, trust])
  const result = allSchemes[scheme]
  const gammaUsed = scheme === 'discounted' || scheme === 'process' || scheme === 'counterfactual'
  const trustUsed = scheme === 'process' || scheme === 'counterfactual'
  const schemeNames = {
    terminal: zh ? '终局广播' : 'Terminal',
    discounted: zh ? '折扣回报' : 'Discounted',
    process: zh ? '过程奖励' : 'Process',
    segment: zh ? '工具分段' : 'Segments',
    counterfactual: zh ? '反事实重放' : 'Counterfactual',
  }
  const focusedStep = result.credits.find((step) => step.id === selectedStepId) || result.credits[1]

  return <div className="modern-lab-body">
    <div className="modern-controls stacked">
      <div className="modern-segmented">{Object.keys(schemeNames).map((id) => <button type="button" key={id} className={scheme === id ? 'active' : ''} aria-pressed={scheme === id} onClick={() => setScheme(id)}>{schemeNames[id]}</button>)}</div>
      <label className={gammaUsed ? '' : 'is-inactive'}>
        <span><MathFormula latex={String.raw`\gamma`} />{!gammaUsed && (zh ? '（当前方案未使用）' : ' (unused here)')} <output>{gamma.toFixed(2)}</output></span>
        <input aria-label={zh ? '时间折扣 γ' : 'Discount gamma'} type="range" min="0.5" max="1" step="0.02" value={gamma} disabled={!gammaUsed} onChange={(event) => setGamma(Number(event.target.value))} />
      </label>
      <label className={trustUsed ? '' : 'is-inactive'}>
        <span>{zh ? '局部 / 反事实证据可信度' : 'Local / replay evidence trust'} <MathFormula latex={String.raw`\eta`} />{!trustUsed && (zh ? '（当前方案未使用）' : ' (unused here)')} <output>{trust.toFixed(2)}</output></span>
        <input aria-label={zh ? '证据可信度 η' : 'Evidence trust eta'} type="range" min="0" max="1" step="0.05" value={trust} disabled={!trustUsed} onChange={(event) => setTrust(Number(event.target.value))} />
      </label>
    </div>
    <div className="credit-track-scroll">
      <div className="credit-track">
        {result.credits.map((step) => (
          <button
            type="button"
            key={step.id}
            className={`credit-bar-step${step.id === focusedStep.id ? ' is-selected' : ''}`}
            aria-pressed={step.id === focusedStep.id}
            onClick={() => setSelectedStepId(step.id)}
          >
            <small>{zh ? step.zhTool : step.tool}</small>
            <span>{scheme === 'segment' ? (zh ? step.zhSegment : step.segment) : <MathFormula latex={String.raw`e_t=${step.evidence.toFixed(2)}`} />}</span>
            <div><i style={{ height: `${Math.max(4, Math.abs(step.credit) * 70)}px` }} className={step.credit < 0 ? 'negative' : ''} /></div>
            <strong>{step.credit.toFixed(2)}</strong>
          </button>
        ))}
      </div>
    </div>

    <section className="credit-step-compare" aria-label={zh ? '单步五方案横向对照' : 'Five-scheme step comparison'}>
      <header>
        <span>{zh ? `点击柱体横向对照：第 ${result.credits.findIndex((s) => s.id === focusedStep.id) + 1} 步「${focusedStep.zhTool}」` : `Cross-scheme step audit: ${focusedStep.tool}`}</span>
        <small>{zh ? `替代动作重放：${focusedStep.replay.zhChosen} ↔ ${focusedStep.replay.zhAlternative}` : `Replay: ${focusedStep.replay.chosen} ↔ ${focusedStep.replay.alternative}`}</small>
      </header>
      <div className="credit-compare-grid">
        {Object.entries(schemeNames).map(([id, label]) => {
          const val = allSchemes[id].credits.find((s) => s.id === focusedStep.id)?.credit ?? 0
          return (
            <div key={id} className={scheme === id ? 'is-current' : ''}>
              <small>{label}</small>
              <strong>{val.toFixed(2)}</strong>
            </div>
          )
        })}
      </div>
    </section>

    {scheme === 'segment' && <div className="credit-evidence-ledger"><span>{zh ? '分段价值账本' : 'Segment-value ledger'}</span>{Object.values(result.segments).map((segment) => <article key={segment.label}><strong>{zh ? segment.zhLabel : segment.label}</strong><MathFormula latex={String.raw`G^{\rm seg}=${segment.outcome.toFixed(2)}`} /><MathFormula latex={String.raw`V^{\rm base}=${segment.baseline.toFixed(2)}`} /><MathFormula latex={String.raw`A^{\rm seg}=${(segment.outcome - segment.baseline).toFixed(2)}`} /></article>)}</div>}
    {scheme === 'counterfactual' && <div className="credit-evidence-ledger"><span>{zh ? '同状态替代动作重放' : 'Same-state alternative-action replay'}</span>{result.replays.map((replay) => <article key={replay.stepId}><strong>{zh ? (result.credits.find((s) => s.id === replay.stepId)?.zhTool || replay.stepId) : replay.stepId}</strong><small>{zh ? `${replay.zhChosen} ↔ ${replay.zhAlternative}` : `${replay.chosen} ↔ ${replay.alternative}`}</small><MathFormula latex={String.raw`\Delta R=${(replay.chosenOutcome - replay.alternativeOutcome).toFixed(2)}`} /></article>)}</div>}
    <div className="modern-equation"><MathFormula block latex={scheme === 'terminal' ? String.raw`\widehat A_t=R(\tau)` : scheme === 'discounted' ? String.raw`G_t=\gamma^{T-t}R_T` : scheme === 'process' ? String.raw`G_t=\sum_k\gamma^{k-t}(R_k^{\rm outcome}+\eta R_k^{\rm process})` : scheme === 'segment' ? String.raw`A_j^{\rm seg}=G_j^{\rm seg}-V(s_j)` : String.raw`C_t=(1-\eta)G_t+\eta\left(R_{\rm chosen}-R_{\rm alternative}\right)`} /><strong>{zh ? '信用总量' : 'Total assigned credit'} {result.total.toFixed(2)}</strong></div>
  </div>
}

export default function ModernExtensionLab({ id, lang, content }) {
  const environment = environmentCopy[id][lang]
  return <section className={`modern-extension-lab modern-${id}`}><header><span>{content.figure}</span><strong><MathText>{content.instruction}</MathText></strong></header><div className="experiment-environment"><span>{environment[0]}</span><MathFormula latex={environment[1]} /><small>{environment[2]}</small></div>{id === 'dpo' && <DpoLab lang={lang} />}{id === 'grpo' && <GrpoLab lang={lang} />}{id === 'codingrl' && <CodingLab lang={lang} />}{id === 'agentmdp' && <AgentLab lang={lang} />}{id === 'credit' && <CreditLab lang={lang} />}</section>
}
