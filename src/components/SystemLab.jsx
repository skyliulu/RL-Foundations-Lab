import { useMemo, useState } from 'react'
import { evaluatePpo } from '../engine/ppo'

const nodeDetail = {
  prompt: ['state s₀', 'UTF-8 text', 'batch item'],
  policyModel: ['actor πθ', 'token logits', 'GPU forward'],
  rollout: ['trajectory τ', 'tokens + logprobs', 'generation workers'],
  reference: ['πref', 'reference logprobs', 'frozen forward'],
  rewardModel: ['R(τ)', 'sequence reward', 'scoring forward'],
  valueModel: ['Vφ(sₜ)', 'token values', 'critic forward'],
  gae: ['Âₜ, R̂ₜ', 'training tensors', 'CPU / GPU batch op'],
  updateModel: ['LCLIP + LV + KL', 'minibatches', 'backward + optimizer'],
}

function PipelineNode({ id, label, active, onClick, icon }) {
  return (
    <button type="button" className={`pipeline-node ${active ? 'active' : ''}`} onClick={() => onClick(id)}>
      <span className="node-icon">{icon}</span>
      <strong>{label}</strong>
      <small>{nodeDetail[id][0]}</small>
    </button>
  )
}

export default function SystemLab({ lang, text }) {
  const c = text.common
  const [view, setView] = useState('system')
  const [selectedId, setSelectedId] = useState('A')
  const [selectedNode, setSelectedNode] = useState('rollout')
  const [clip, setClip] = useState(0.2)
  const [klBeta, setKlBeta] = useState(0.08)
  const result = useMemo(() => evaluatePpo({ clip, updateStrength: 0.32, klBeta }), [clip, klBeta])
  const selected = result.samples.find((sample) => sample.id === selectedId) || result.samples[0]
  const detail = nodeDetail[selectedNode]

  return (
    <section className="system-lab">
      <div className="system-toolbar">
        <div className="view-switch" role="group" aria-label={lang === 'zh' ? '视图切换' : 'View switch'}>
          <button type="button" className={view === 'algorithm' ? 'active' : ''} onClick={() => setView('algorithm')}>{c.algorithm}</button>
          <button type="button" className={view === 'system' ? 'active' : ''} onClick={() => setView('system')}>{c.system}</button>
        </div>
        <label><span>{c.clip}<output>{clip.toFixed(2)}</output></span><input type="range" min="0.05" max="0.4" step="0.01" value={clip} onChange={(event) => setClip(Number(event.target.value))} /></label>
        <label><span>{c.klBeta}<output>{klBeta.toFixed(2)}</output></span><input type="range" min="0" max="0.3" step="0.01" value={klBeta} onChange={(event) => setKlBeta(Number(event.target.value))} /></label>
      </div>

      <div className="shared-batch-banner"><span>◎</span><div><strong>{c.samples}</strong><small>{c.selectSample}</small></div><b>batch_042 · seed 17</b></div>

      {view === 'algorithm' ? (
        <div className="algorithm-view">
          <div className="token-trajectory">
            <span className="prompt-token">{lang === 'zh' ? '问题：为什么天空看起来是蓝色？' : 'Prompt: Why does the sky look blue?'}</span>
            <span>Rayleigh</span><span>scattering</span><span className="active-token">{selected.token}</span><span>shorter</span><span>wavelengths</span><span>EOS</span>
          </div>
          <div className="algorithm-columns">
            <div><small>{lang === 'zh' ? '旧策略概率' : 'Old policy'}</small><strong>πold(aₜ|sₜ) = {selected.oldProbability.toFixed(2)}</strong></div>
            <div><small>{c.ratio}</small><strong>rₜ = {selected.ratio.toFixed(3)}</strong></div>
            <div><small>{c.advantage}</small><strong>Âₜ = {selected.advantage.toFixed(2)}</strong></div>
            <div className={selected.clipped ? 'warn' : ''}><small>clip(rₜ)</small><strong>{selected.clippedRatio.toFixed(3)}</strong></div>
          </div>
          <div className="shared-equation">L = min(rₜÂₜ, clip(rₜ)Âₜ) − β KL(πθ || πref) <strong>{selected.surrogate.toFixed(3)} − {klBeta.toFixed(2)} × {selected.approxKl.toFixed(3)}</strong></div>
        </div>
      ) : (
        <div className="system-view">
          <div className="pipeline-row primary-flow">
            <PipelineNode id="prompt" label={c.prompt} icon="P" active={selectedNode === 'prompt'} onClick={setSelectedNode} />
            <span className="flow-arrow">→</span>
            <PipelineNode id="policyModel" label={c.policyModel} icon="π" active={selectedNode === 'policyModel'} onClick={setSelectedNode} />
            <span className="flow-arrow">→</span>
            <PipelineNode id="rollout" label={c.rollout} icon="τ" active={selectedNode === 'rollout'} onClick={setSelectedNode} />
          </div>
          <div className="branch-lines" aria-hidden="true"><span>↙</span><span>↓</span><span>↘</span></div>
          <div className="pipeline-row scoring-flow">
            <PipelineNode id="reference" label={c.reference} icon="π₀" active={selectedNode === 'reference'} onClick={setSelectedNode} />
            <PipelineNode id="rewardModel" label={c.rewardModel} icon="R" active={selectedNode === 'rewardModel'} onClick={setSelectedNode} />
            <PipelineNode id="valueModel" label={c.valueModel} icon="V" active={selectedNode === 'valueModel'} onClick={setSelectedNode} />
          </div>
          <div className="merge-lines" aria-hidden="true"><span>↘</span><span>↓</span><span>↙</span></div>
          <div className="pipeline-row update-flow">
            <PipelineNode id="gae" label={c.gae} icon="Â" active={selectedNode === 'gae'} onClick={setSelectedNode} />
            <span className="flow-arrow">→</span>
            <PipelineNode id="updateModel" label={c.updateModel} icon="∇" active={selectedNode === 'updateModel'} onClick={setSelectedNode} />
            <span className="flow-arrow loop-arrow">↺ πθ</span>
          </div>
          <aside className="node-inspector">
            <header><span>{c[selectedNode] || selectedNode}</span><b>{selectedId}</b></header>
            <dl><div><dt>{lang === 'zh' ? '算法对象' : 'Algorithm object'}</dt><dd>{detail[0]}</dd></div><div><dt>{lang === 'zh' ? '数据对象' : 'Data object'}</dt><dd>{detail[1]}</dd></div><div><dt>{lang === 'zh' ? '工程动作' : 'System action'}</dt><dd>{detail[2]}</dd></div></dl>
            <p>{lang === 'zh' ? '点击任一节点，检查同一条样本在算法语义与工程生命周期中的位置。' : 'Select any node to inspect where the same sample lives in the algorithm and system lifecycle.'}</p>
          </aside>
        </div>
      )}

      <div className="response-group">
        {result.samples.map((sample) => (
          <button type="button" key={sample.id} className={sample.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(sample.id)}>
            <b>{sample.id}</b><span>{sample.token}</span><small>R {sample.reward.toFixed(1)}</small><small>Â {sample.advantage.toFixed(2)}</small><small>{c.adjustedReward} {sample.adjustedReward.toFixed(2)}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
