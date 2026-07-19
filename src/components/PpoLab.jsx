import { useMemo, useState } from 'react'
import { evaluatePpo } from '../engine/ppo'
import MathFormula from './MathFormula'

function SamplePlane({ samples, clip, selectedId, onSelect, lang }) {
  const width = 640
  const height = 300
  const pad = { left: 54, right: 24, top: 22, bottom: 42 }
  const x = (advantage) => pad.left + (advantage + 1.6) / 3.2 * (width - pad.left - pad.right)
  const y = (ratio) => pad.top + (1.65 - ratio) / 1.15 * (height - pad.top - pad.bottom)
  return (
    <svg className="sample-plane" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={lang === 'zh' ? 'PPO 样本平面' : 'PPO sample plane'}>
      <rect className="clip-band" x={pad.left} y={y(1 + clip)} width={width - pad.left - pad.right} height={y(1 - clip) - y(1 + clip)} />
      <line className="plane-axis" x1={pad.left} x2={width - pad.right} y1={y(1)} y2={y(1)} />
      <line className="plane-axis" x1={x(0)} x2={x(0)} y1={pad.top} y2={height - pad.bottom} />
      <line className="clip-line" x1={pad.left} x2={width - pad.right} y1={y(1 + clip)} y2={y(1 + clip)} />
      <line className="clip-line" x1={pad.left} x2={width - pad.right} y1={y(1 - clip)} y2={y(1 - clip)} />
      <text x={width - 138} y={y(1 + clip) - 6}>1 + ε = {(1 + clip).toFixed(2)}</text>
      <text x={width - 138} y={y(1 - clip) + 17}>1 − ε = {(1 - clip).toFixed(2)}</text>
      <text x={width - 94} y={height - 10}>{lang === 'zh' ? '优势 Aₜ' : 'Advantage Aₜ'}</text>
      <text x="6" y="18">rₜ</text>
      {samples.map((sample) => (
        <g
          key={sample.id}
          className={`sample-mark ${sample.clipped ? 'is-clipped' : ''} ${sample.id === selectedId ? 'is-selected' : ''}`}
          role="button"
          aria-label={`${sample.id}, advantage ${sample.advantage.toFixed(2)}, ratio ${sample.ratio.toFixed(2)}`}
          onClick={() => onSelect(sample.id)}
        >
          {sample.clipped ? (
            <rect x={x(sample.advantage) - 7} y={y(sample.ratio) - 7} width="14" height="14" transform={`rotate(45 ${x(sample.advantage)} ${y(sample.ratio)})`} />
          ) : <circle cx={x(sample.advantage)} cy={y(sample.ratio)} r="8" />}
          <text x={x(sample.advantage) + 12} y={y(sample.ratio) + 4}>{sample.id}</text>
        </g>
      ))}
    </svg>
  )
}

export default function PpoLab({ lang, text }) {
  const c = text.common
  const [clip, setClip] = useState(0.2)
  const [strength, setStrength] = useState(0.32)
  const [selectedId, setSelectedId] = useState('A')
  const result = useMemo(() => evaluatePpo({ clip, updateStrength: strength }), [clip, strength])
  const selected = result.samples.find((sample) => sample.id === selectedId) || result.samples[0]

  return (
    <section className="ppo-lab">
      <div className="ac-bridge" aria-label="Actor Critic loop">
        <div className="ac-node actor"><small>Actor</small><strong><MathFormula latex={String.raw`\pi_\theta(a\mid s)`} /></strong><span>{lang === 'zh' ? '产生动作概率' : 'action probabilities'}</span></div>
        <div className="ac-arrow"><MathFormula latex={String.raw`a_t`} />→</div>
        <div className="ac-node environment"><small>{lang === 'zh' ? '环境' : 'Environment'}</small><strong><MathFormula latex={String.raw`s_t\rightarrow s_{t+1}`} /></strong><MathFormula latex={String.raw`r_{t+1}`} /></div>
        <div className="ac-arrow return-arrow"><span>TD error</span>↙</div>
        <div className="ac-node critic"><small>Critic</small><strong><MathFormula latex={String.raw`V_\phi(s)`} /></strong><span>{lang === 'zh' ? '估计 baseline' : 'estimates baseline'}</span></div>
        <div className="advantage-chip"><small>Advantage</small><strong><MathFormula latex={String.raw`\widehat{A}_t=\widehat{Q}_t-V_\phi(s_t)`} /></strong></div>
      </div>
      <p className="bridge-copy">{text.ppo.acBridge}</p>

      <div className="ppo-controls">
        <label><span>{c.clip}<output>{clip.toFixed(2)}</output></span><input type="range" min="0.05" max="0.4" step="0.01" value={clip} onChange={(event) => setClip(Number(event.target.value))} /></label>
        <label><span>{c.strength}<output>{strength.toFixed(2)}</output></span><input type="range" min="0.05" max="0.65" step="0.01" value={strength} onChange={(event) => setStrength(Number(event.target.value))} /></label>
        <div className="ppo-metrics"><span><small>{c.clipped}</small><strong>{result.clippedCount} / {result.samples.length}</strong></span><span><small>{c.meanKl}</small><strong>{result.meanKl.toFixed(4)}</strong></span><span><small>{c.objective}</small><strong>{result.policyObjective.toFixed(3)}</strong></span></div>
      </div>

      <div className="ppo-stage">
        <div className="plane-wrap">
          <header><div><strong>{c.samples}</strong><small>{lang === 'zh' ? '横轴决定方向，纵轴表示策略移动幅度' : 'The x-axis sets direction; the y-axis shows policy movement'}</small></div><div className="shape-legend"><span><i className="circle-shape" />{c.free}</span><span><i className="diamond-shape" />{c.clipped}</span></div></header>
          <SamplePlane samples={result.samples} clip={clip} selectedId={selectedId} onSelect={setSelectedId} lang={lang} />
        </div>
        <aside className="ppo-inspector">
          <header><span>{lang === 'zh' ? `样本 ${selected.id}` : `Sample ${selected.id}`}</span><strong className={selected.clipped ? 'clipped-label' : ''}>{selected.clipped ? c.clipped : c.free}</strong></header>
          <dl>
            <div><dt>{c.advantage}</dt><dd>{selected.advantage.toFixed(2)}</dd></div>
            <div><dt>{c.ratio}</dt><dd>{selected.ratio.toFixed(3)}</dd></div>
            <div><dt><MathFormula latex={String.raw`\operatorname{clip}(r_t)`} /></dt><dd>{selected.clippedRatio.toFixed(3)}</dd></div>
          </dl>
          <div className="ppo-formula">
            <MathFormula block latex={String.raw`L_t^{\mathrm{CLIP}}=\min\!\left(r_t\widehat{A}_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\widehat{A}_t\right)`} />
            <strong>= {selected.surrogate.toFixed(3)}</strong>
          </div>
          <p>{selected.clipped
            ? (lang === 'zh' ? '该样本想把策略推得超出近端区间，目标函数截断了额外收益。' : 'This sample would push the policy beyond the proximal region, so extra gain is capped.')
            : (lang === 'zh' ? '该样本仍在近端区间内，梯度信号完整保留。' : 'This sample remains inside the proximal region, so its gradient signal is retained.')}
          </p>
        </aside>
      </div>
    </section>
  )
}
