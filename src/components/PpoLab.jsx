import { useMemo, useState } from 'react'
import { evaluatePpo } from '../engine/ppo'
import { activateOnEnterOrSpace } from '../accessibility'
import MathFormula from './MathFormula'
import MathText from './MathText'

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
      <foreignObject x={width - 150} y={y(1 + clip) - 22} width="140" height="24"><div xmlns="http://www.w3.org/1999/xhtml" className="svg-math-label"><MathFormula latex={String.raw`1+\epsilon=${(1 + clip).toFixed(2)}`} /></div></foreignObject>
      <foreignObject x={width - 150} y={y(1 - clip) + 2} width="140" height="24"><div xmlns="http://www.w3.org/1999/xhtml" className="svg-math-label"><MathFormula latex={String.raw`1-\epsilon=${(1 - clip).toFixed(2)}`} /></div></foreignObject>
      <foreignObject x={width - 145} y={height - 29} width="135" height="24"><div xmlns="http://www.w3.org/1999/xhtml" className="svg-math-label axis-label">{lang === 'zh' ? '优势 ' : 'Advantage '}<MathFormula latex={String.raw`\widehat A_t`} /></div></foreignObject>
      <foreignObject x="6" y="2" width="54" height="24"><div xmlns="http://www.w3.org/1999/xhtml" className="svg-math-label"><MathFormula latex={String.raw`r_t`} /></div></foreignObject>
      {samples.map((sample) => (
        <g
          key={sample.id}
          className={`sample-mark ${sample.clipped ? 'is-clipped' : ''} ${sample.quadrantRole === 'outside-active' ? 'is-outside-active' : ''} ${sample.id === selectedId ? 'is-selected' : ''}`}
          role="button"
          tabIndex={0}
          aria-pressed={sample.id === selectedId}
          aria-label={lang === 'zh'
            ? `样本 ${sample.id}，优势 ${sample.advantage.toFixed(2)}，新旧策略比 ${sample.ratio.toFixed(2)}`
            : `Sample ${sample.id}, advantage ${sample.advantage.toFixed(2)}, ratio ${sample.ratio.toFixed(2)}`}
          onClick={() => onSelect(sample.id)}
          onKeyDown={(event) => activateOnEnterOrSpace(event, () => onSelect(sample.id))}
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

function PpoSurrogateCurve({ sample, clip, lang }) {
  const width = 300
  const height = 148
  const pad = { left: 32, right: 14, top: 16, bottom: 26 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const rMin = 0.5
  const rMax = 1.65
  const adv = sample.advantage
  const evalClip = (r) => Math.min(r * adv, Math.min(1 + clip, Math.max(1 - clip, r)) * adv)
  const gridR = Array.from({ length: 48 }, (_, i) => rMin + (i / 47) * (rMax - rMin))
  const allY = [...gridR.map((r) => r * adv), ...gridR.map(evalClip), 0]
  const yMin = Math.min(...allY) - 0.15
  const yMax = Math.max(...allY) + 0.15
  const ySpan = Math.max(0.4, yMax - yMin)
  const x = (r) => pad.left + ((Math.max(rMin, Math.min(rMax, r)) - rMin) / (rMax - rMin)) * plotW
  const y = (val) => pad.top + ((yMax - val) / ySpan) * plotH
  const linePath = (pts) => pts.map(([rx, vy], i) => `${i === 0 ? 'M' : 'L'}${x(rx).toFixed(1)},${y(vy).toFixed(1)}`).join(' ')
  const plateauStart = adv >= 0 ? x(1 + clip) : x(rMin)
  const plateauWidth = adv >= 0 ? Math.max(0, x(rMax) - x(1 + clip)) : Math.max(0, x(1 - clip) - x(rMin))

  return (
    <div className="ppo-curve-wrap">
      <div className="ppo-curve-header">
        <span>{lang === 'zh' ? '一维替代目标截面（固定当前优势）' : '1D surrogate slice (fixed advantage)'}</span>
        <small>{adv >= 0
          ? (lang === 'zh' ? <>右侧平坦：超 <MathFormula latex="1+\epsilon" /> 梯度归零</> : <>Right plateau: zero grad above <MathFormula latex="1+\epsilon" /></>)
          : (lang === 'zh' ? <>左侧平坦：超 <MathFormula latex="1-\epsilon" /> 梯度归零</> : <>Left plateau: zero grad below <MathFormula latex="1-\epsilon" /></>)}</small>
      </div>
      <svg className="ppo-surrogate-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={lang === 'zh' ? 'PPO 一维裁剪目标曲线' : 'PPO 1D clipped surrogate curve'}>
        <rect className="ppo-plateau-zone" x={plateauStart} y={pad.top} width={plateauWidth} height={plotH} />
        <line className="ppo-curve-axis" x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} />
        <line className="ppo-curve-axis" x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} />
        <line className="ppo-curve-bound" x1={x(1 - clip)} x2={x(1 - clip)} y1={pad.top} y2={height - pad.bottom} />
        <line className="ppo-curve-bound" x1={x(1 + clip)} x2={x(1 + clip)} y1={pad.top} y2={height - pad.bottom} />
        <path className="ppo-curve-unclipped" d={linePath(gridR.map((r) => [r, r * adv]))} />
        <path className="ppo-curve-clipped" d={linePath(gridR.map((r) => [r, evalClip(r)]))} />
        <circle className={sample.clipped ? 'ppo-curve-dot is-clipped' : 'ppo-curve-dot'} cx={x(sample.ratio)} cy={y(sample.surrogate)} r="4.8" />
        <text className="ppo-curve-tick" x={x(1 - clip)} y={height - 8} textAnchor="middle">{(1 - clip).toFixed(2)}</text>
        <text className="ppo-curve-tick" x={x(1)} y={height - 8} textAnchor="middle">1.0</text>
        <text className="ppo-curve-tick" x={x(1 + clip)} y={height - 8} textAnchor="middle">{(1 + clip).toFixed(2)}</text>
      </svg>
    </div>
  )
}

export default function PpoLab({ lang, text }) {
  const c = text.common
  const [clip, setClip] = useState(0.2)
  const [strength, setStrength] = useState(0.32)
  const [selectedId, setSelectedId] = useState('A')
  const result = useMemo(() => evaluatePpo({ clip, updateStrength: strength }), [clip, strength])
  const selected = result.samples.find((sample) => sample.id === selectedId) || result.samples[0]

  const presets = [
    { id: 'gentle', clip: 0.2, strength: 0.14, sample: 'A', zh: '① 近端温和更新（全员保留梯度）', en: '① Gentle proximal step (all active)' },
    { id: 'greedy', clip: 0.2, strength: 0.32, sample: 'A', zh: '② 贪心侧触发截断（A / F 梯度归零）', en: '② Greedy side clipped (A / F capped)' },
    { id: 'asymmetric', clip: 0.15, strength: 0.45, sample: 'B', zh: '③ 不对称边界检验（B / D 越界仍保留恢复梯度）', en: '③ Asymmetric boundary (B / D stay active)' },
  ]

  return (
    <section className="ppo-lab">
      <div className="experiment-environment"><span>{lang === 'zh' ? '同一条 Actor–Critic 转移' : 'One Actor–Critic transition'}</span><MathFormula latex={String.raw`s_t\xrightarrow{a_t,\,r_{t+1}}s_{t+1}`} /><small>{lang === 'zh' ? 'PPO 复用这批已采样转移，但必须记录产生动作时的旧策略概率。' : 'PPO reuses this sampled transition batch while preserving the behavior-policy probability.'}</small></div>
      <div className="ac-bridge" aria-label="Actor Critic loop">
        <div className="ac-node actor"><small>Actor</small><strong><MathFormula latex={String.raw`\pi_\theta(a\mid s)`} /></strong><span className="ac-node-copy">{lang === 'zh' ? '产生动作概率' : 'action probabilities'}</span></div>
        <div className="ac-arrow"><MathFormula latex={String.raw`a_t`} />→</div>
        <div className="ac-node environment"><small>{lang === 'zh' ? '环境' : 'Environment'}</small><strong><MathFormula latex={String.raw`s_t\rightarrow s_{t+1}`} /></strong><MathFormula className="ac-node-reward" latex={String.raw`r_{t+1}`} /></div>
        <div className="ac-arrow return-arrow"><span className="ac-arrow-label">TD error</span>↙</div>
        <div className="ac-node critic"><small>Critic</small><strong><MathFormula latex={String.raw`V_\phi(s)`} /></strong><span className="ac-node-copy">{lang === 'zh' ? '估计 baseline' : 'estimates baseline'}</span></div>
        <div className="advantage-chip"><small>Advantage</small><strong><MathFormula latex={String.raw`\widehat{A}_t=\widehat{Q}_t-V_\phi(s_t)`} /></strong></div>
      </div>
      <p className="bridge-copy"><MathText>{text.ppo.acBridge}</MathText></p>

      <div className="ppo-presets" role="group" aria-label={lang === 'zh' ? 'PPO 对照预设' : 'PPO counterfactual presets'}>
        {presets.map((preset) => {
          const isCurrent = Math.abs(clip - preset.clip) < 0.005 && Math.abs(strength - preset.strength) < 0.01
          return (
            <button
              type="button"
              key={preset.id}
              className={isCurrent ? 'active' : ''}
              aria-pressed={isCurrent}
              onClick={() => { setClip(preset.clip); setStrength(preset.strength); setSelectedId(preset.sample) }}
            >
              {lang === 'zh' ? preset.zh : preset.en}
            </button>
          )
        })}
      </div>

      <div className="ppo-controls">
        <label><span><MathText>{c.clip}</MathText><output>{clip.toFixed(2)}</output></span><input type="range" min="0.05" max="0.4" step="0.01" value={clip} onChange={(event) => setClip(Number(event.target.value))} /></label>
        <label><span>{c.strength}<output>{strength.toFixed(2)}</output></span><input type="range" min="0.05" max="0.65" step="0.01" value={strength} onChange={(event) => setStrength(Number(event.target.value))} /></label>
        <div className="ppo-metrics"><span><small>{c.clipped}</small><strong>{result.clippedCount} / {result.samples.length}</strong></span><span><small>{c.meanKl}</small><strong>{result.meanKl.toFixed(4)}</strong></span><span><small>{c.objective}</small><strong>{result.policyObjective.toFixed(3)}</strong></span></div>
      </div>

      <div className="ppo-stage">
        <div className="plane-wrap">
          <header><div><strong>{c.samples}</strong><small>{lang === 'zh' ? '横轴决定方向，纵轴表示策略移动幅度；点击任意点检查一维截断曲线' : 'The x-axis sets direction; the y-axis shows policy movement. Select any point to inspect its 1D surrogate slice.'}</small></div><div className="shape-legend"><span><i className="circle-shape" />{c.free}</span><span><i className="diamond-shape" />{c.clipped}</span><span><i className="ring-shape" />{lang === 'zh' ? '越界但保留梯度' : 'Outside · grad active'}</span></div></header>
          <SamplePlane samples={result.samples} clip={clip} selectedId={selectedId} onSelect={setSelectedId} lang={lang} />
        </div>
        <aside className="ppo-inspector">
          <header>
            <span>{lang === 'zh' ? `样本 ${selected.id}` : `Sample ${selected.id}`}</span>
            <strong className={selected.clipped ? 'clipped-label' : selected.quadrantRole === 'outside-active' ? 'outside-active-label' : ''}>
              {selected.clipped
                ? c.clipped
                : selected.quadrantRole === 'outside-active'
                  ? (lang === 'zh' ? '越界·保留恢复梯度' : 'Outside · active recovery')
                  : c.free}
            </strong>
          </header>
          <dl>
            <div><dt><MathText>{c.advantage}</MathText></dt><dd>{selected.advantage.toFixed(2)}</dd></div>
            <div><dt><MathText>{c.ratio}</MathText></dt><dd>{selected.ratio.toFixed(3)}</dd></div>
            <div><dt><MathFormula latex={String.raw`\operatorname{clip}(r_t)`} /></dt><dd>{selected.clippedRatio.toFixed(3)}</dd></div>
            <div><dt>{lang === 'zh' ? '梯度状态' : 'Gradient status'}</dt><dd>{selected.gradientActive ? (lang === 'zh' ? '有效（非零）' : 'Active (non-zero)') : (lang === 'zh' ? '已截断（为 0）' : 'Zeroed (plateau)')}</dd></div>
          </dl>
          <PpoSurrogateCurve sample={selected} clip={clip} lang={lang} />
          <div className="ppo-formula">
            <MathFormula block latex={String.raw`L_t^{\mathrm{CLIP}}=\min\!\left(r_t\widehat{A}_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\widehat{A}_t\right)`} />
            <strong><MathFormula latex={String.raw`=${selected.surrogate.toFixed(3)}`} /></strong>
          </div>
          <p>{selected.clipped
            ? (lang === 'zh' ? '该样本沿优势同方向冲出近端区间，min 算子选中平坦的裁剪项，因此额外收益被封顶、策略梯度归零。' : 'This sample moved too far in the advantage direction; min selects the flat clipped ceiling, zeroing further policy gradient.')
            : selected.quadrantRole === 'outside-active'
              ? (lang === 'zh' ? '注意不对称性：尽管比率已超出近端带，但该样本向优势反方向偏离；min 算子保留未裁剪项，使梯度继续把它拉回合理区间。' : 'Notice the asymmetry: although the ratio crossed the band, it moved opposite to the advantage sign; min keeps the unclipped branch so gradient pulls it back.')
              : (lang === 'zh' ? '该样本仍在近端区间内，未裁剪项与裁剪项重合，梯度信号完整保留。' : 'This sample remains inside the proximal band, so its gradient signal is fully retained.')}
          </p>
        </aside>
      </div>
    </section>
  )
}
