import { useMemo, useState } from 'react'
import { evaluateDpo, evaluateGrpo } from '../engine/post-training.js'
import { buildAgentTrajectory, codingCandidates, evaluateCodingReward, evaluateCredit } from '../engine/modern-extension.js'
import MathFormula from './MathFormula.jsx'

function DpoLab({ lang }) {
  const [beta, setBeta] = useState(0.4)
  const [contrast, setContrast] = useState(0.6)
  const result = useMemo(() => evaluateDpo({ beta, contrast }), [beta, contrast])
  return <div className="modern-lab-body">
    <div className="modern-controls"><label><span>β <output>{beta.toFixed(2)}</output></span><input type="range" min="0.05" max="1.2" step="0.05" value={beta} onChange={(event) => setBeta(Number(event.target.value))} /></label><label><span>{lang === 'zh' ? '偏好对比强度' : 'Pair contrast'} <output>{contrast.toFixed(2)}</output></span><input type="range" min="-0.4" max="1.2" step="0.05" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} /></label></div>
    <div className="preference-pair"><article className="chosen"><small>{lang === 'zh' ? 'CHOSEN 回答' : 'CHOSEN RESPONSE'}</small><p>{lang === 'zh' ? '解释原因并覆盖边界条件。' : 'Explains the cause and covers edge cases.'}</p><b>Δ log π = {result.chosenShift.toFixed(2)}</b></article><span>≻</span><article><small>{lang === 'zh' ? 'REJECTED 回答' : 'REJECTED RESPONSE'}</small><p>{lang === 'zh' ? '只给结论，遗漏关键条件。' : 'States a conclusion and misses key conditions.'}</p><b>Δ log π = {result.rejectedShift.toFixed(2)}</b></article></div>
    <div className="modern-equation"><MathFormula block latex={String.raw`m=\beta(\Delta_w-\Delta_l),\qquad\mathcal L=-\log\sigma(m)`} /><strong>margin {result.margin.toFixed(3)} · p(chosen) {result.preferenceProbability.toFixed(3)} · loss {result.loss.toFixed(3)}</strong></div>
  </div>
}

function GrpoLab({ lang }) {
  const scenarios = { mixed: [0.2, 0.9, 0.55, -0.05], allRight: [1, 1, 1, 1], allWrong: [0, 0, 0, 0], close: [0.48, 0.52, 0.5, 0.51] }
  const [scenario, setScenario] = useState('mixed')
  const [clip, setClip] = useState(0.2)
  const result = useMemo(() => evaluateGrpo({ rewards: scenarios[scenario], clip }), [scenario, clip])
  return <div className="modern-lab-body">
    <div className="modern-controls"><div className="modern-segmented">{Object.keys(scenarios).map((id) => <button type="button" className={scenario === id ? 'active' : ''} key={id} onClick={() => setScenario(id)}>{({ mixed: lang === 'zh' ? '有区分' : 'Mixed', allRight: lang === 'zh' ? '全对' : 'All right', allWrong: lang === 'zh' ? '全错' : 'All wrong', close: lang === 'zh' ? '近似同分' : 'Low variance' })[id]}</button>)}</div><label><span>clip ε <output>{clip.toFixed(2)}</output></span><input type="range" min="0.05" max="0.4" step="0.01" value={clip} onChange={(event) => setClip(Number(event.target.value))} /></label></div>
    <div className="group-responses">{result.samples.map((sample) => <article key={sample.id} className={sample.advantage > 0.01 ? 'positive' : sample.advantage < -0.01 ? 'negative' : ''}><small>{lang === 'zh' ? `回答 ${sample.id}` : `Response ${sample.id}`}</small><strong>R = {sample.reward.toFixed(2)}</strong><span>A = {sample.advantage.toFixed(2)}</span><span>r {sample.ratio.toFixed(2)} → {sample.clippedRatio.toFixed(2)}</span><b>J = {sample.objective.toFixed(3)}</b></article>)}</div>
    <div className={`variance-banner ${result.std < 0.02 ? 'warn' : ''}`}><b>μ = {result.mean.toFixed(3)} · σ = {result.std.toFixed(3)}</b><span>{result.std < 0.02 ? (lang === 'zh' ? '组内没有可靠排序信号，应过滤或调整难度。' : 'The group has no reliable ranking signal; filter it or change difficulty.') : (lang === 'zh' ? '组内奖励能够形成相对优势。' : 'Within-group rewards provide relative advantage.')}</span></div>
  </div>
}

function CodingLab({ lang }) {
  const [candidateId, setCandidateId] = useState('A')
  const [mode, setMode] = useState('partial')
  const [hidden, setHidden] = useState(false)
  const result = useMemo(() => evaluateCodingReward({ candidateId, mode, revealHidden: hidden }), [candidateId, mode, hidden])
  return <div className="modern-lab-body">
    <div className="modern-controls stacked"><div className="modern-segmented">{codingCandidates.map((candidate) => <button type="button" key={candidate.id} className={candidateId === candidate.id ? 'active' : ''} onClick={() => setCandidateId(candidate.id)}>{candidate.id} · {lang === 'zh' ? candidate.label : ({ A: 'edge case missing', B: 'visible-test shortcut', C: 'complete repair' })[candidate.id]}</button>)}</div><div className="modern-segmented">{['outcome', 'partial', 'weighted'].map((id) => <button type="button" key={id} className={mode === id ? 'active' : ''} onClick={() => setMode(id)}>{({ outcome: lang === 'zh' ? '全通过' : 'All pass', partial: lang === 'zh' ? '通过比例' : 'Pass rate', weighted: lang === 'zh' ? '难度加权' : 'Weighted' })[id]}</button>)}<button type="button" className={hidden ? 'active danger' : ''} onClick={() => setHidden((value) => !value)}>{lang === 'zh' ? '显示隐藏测试' : 'Reveal hidden tests'}</button></div></div>
    <div className="test-matrix"><header><span>{lang === 'zh' ? '执行证据' : 'Execution evidence'}</span><strong>candidate {candidateId}</strong></header><div>{result.tests.map((passed, index) => <span className={passed ? 'pass' : 'fail'} key={index}><b>{hidden && index >= 4 ? 'H' : 'T'}{index + 1}</b>{passed ? 'PASS' : 'FAIL'}<small>w {result.weights[index].toFixed(1)}</small></span>)}</div></div>
    <div className="coding-result"><b>R = {result.reward.toFixed(3)}</b><span>{!hidden ? (lang === 'zh' ? '隐藏测试尚未显示；当前分数只反映可见证据。' : 'Hidden tests are not revealed; this score reflects visible evidence only.') : result.generalizes ? (lang === 'zh' ? '隐藏测试也通过：证据支持泛化。' : 'Hidden tests pass: evidence supports generalization.') : (lang === 'zh' ? '存在隐藏失败：可见奖励可能被利用。' : 'Hidden failures remain: visible reward may be exploitable.')}</span></div>
  </div>
}

function AgentLab({ lang }) {
  const [failureAt, setFailureAt] = useState('none')
  const trajectory = useMemo(() => buildAgentTrajectory({ failureAt }), [failureAt])
  return <div className="modern-lab-body">
    <div className="modern-controls"><div className="modern-segmented"><button type="button" className={failureAt === 'none' ? 'active' : ''} onClick={() => setFailureAt('none')}>{lang === 'zh' ? '完整成功轨迹' : 'Successful trajectory'}</button><button type="button" className={failureAt === 'inspect' ? 'active' : ''} onClick={() => setFailureAt('inspect')}>{lang === 'zh' ? '错误定位' : 'Bad localization'}</button><button type="button" className={failureAt === 'test' ? 'active' : ''} onClick={() => setFailureAt('test')}>{lang === 'zh' ? '测试后终止' : 'Stop after test'}</button></div></div>
    <div className="agent-trajectory">{trajectory.steps.map((step, index) => <article key={step.id} className={step.status}><span>{String(index + 1).padStart(2, '0')}</span><small>A{index}</small><strong>{step.tool}</strong><i>→</i><small>O{index + 1}</small><p>{step.observation}</p></article>)}</div>
    <div className={`trajectory-result ${trajectory.success ? 'success' : 'failed'}`}><b>{trajectory.success ? (lang === 'zh' ? '任务成功' : 'Task success') : (lang === 'zh' ? '轨迹失败' : 'Trajectory failure')}</b><span>{trajectory.terminal} · cost {trajectory.cost.toFixed(1)}</span></div>
  </div>
}

function CreditLab({ lang }) {
  const [scheme, setScheme] = useState('terminal')
  const [gamma, setGamma] = useState(0.9)
  const [trust, setTrust] = useState(0.7)
  const result = useMemo(() => evaluateCredit({ scheme, gamma, trust }), [scheme, gamma, trust])
  return <div className="modern-lab-body">
    <div className="modern-controls stacked"><div className="modern-segmented">{['terminal', 'discounted', 'process', 'hindsight'].map((id) => <button type="button" key={id} className={scheme === id ? 'active' : ''} onClick={() => setScheme(id)}>{({ terminal: lang === 'zh' ? '终局广播' : 'Terminal', discounted: lang === 'zh' ? '折扣回报' : 'Discounted', process: lang === 'zh' ? '过程奖励' : 'Process', hindsight: 'Hindsight' })[id]}</button>)}</div><label><span>γ <output>{gamma.toFixed(2)}</output></span><input type="range" min="0.5" max="1" step="0.02" value={gamma} onChange={(event) => setGamma(Number(event.target.value))} /></label><label><span>{lang === 'zh' ? '局部信号可信度 η' : 'Local-signal trust η'} <output>{trust.toFixed(2)}</output></span><input type="range" min="0" max="1" step="0.05" value={trust} onChange={(event) => setTrust(Number(event.target.value))} /></label></div>
    <div className="credit-track">{result.credits.map((step) => <article key={step.id}><small>{step.tool}</small><div><i style={{ height: `${Math.max(4, Math.abs(step.credit) * 70)}px` }} className={step.credit < 0 ? 'negative' : ''} /></div><strong>{step.credit.toFixed(2)}</strong></article>)}</div>
    <div className="modern-equation"><MathFormula block latex={scheme === 'terminal' ? String.raw`\widehat A_t=R(\tau)` : scheme === 'discounted' ? String.raw`G_t=\gamma^{T-t}R_T` : scheme === 'process' ? String.raw`G_t=\sum_k\gamma^{k-t}(R_k^{\rm outcome}+\eta R_k^{\rm process})` : String.raw`C_t=(1-\eta)G_t+\eta C_t^{\rm hind}`} /><strong>{lang === 'zh' ? '信用总量' : 'Total assigned credit'} {result.total.toFixed(2)}</strong></div>
  </div>
}

export default function ModernExtensionLab({ id, lang, content }) {
  return <section className={`modern-extension-lab modern-${id}`}><header><span>{content.figure}</span><strong>{content.instruction}</strong></header>{id === 'dpo' && <DpoLab lang={lang} />}{id === 'grpo' && <GrpoLab lang={lang} />}{id === 'codingrl' && <CodingLab lang={lang} />}{id === 'agentmdp' && <AgentLab lang={lang} />}{id === 'credit' && <CreditLab lang={lang} />}</section>
}
