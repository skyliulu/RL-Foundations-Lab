import { useMemo, useState } from 'react'
import { evaluatePpo } from '../engine/ppo'
import { evaluateDpo, evaluateGrpo } from '../engine/post-training'
import MathFormula from './MathFormula'

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
  const [method, setMethod] = useState('ppo')
  const [view, setView] = useState('system')
  const [selectedId, setSelectedId] = useState('A')
  const [selectedNode, setSelectedNode] = useState('rollout')
  const [clip, setClip] = useState(0.2)
  const [klBeta, setKlBeta] = useState(0.08)
  const result = useMemo(() => evaluatePpo({ clip, updateStrength: 0.32, klBeta }), [clip, klBeta])
  const dpo = useMemo(() => evaluateDpo({ beta: Math.max(0.02, klBeta) }), [klBeta])
  const grpo = useMemo(() => evaluateGrpo({ clip, klBeta }), [clip, klBeta])
  const selected = result.samples.find((sample) => sample.id === selectedId) || result.samples[0]
  const detail = nodeDetail[selectedNode]

  return (
    <section className="system-lab">
      <div className="method-switch" role="group" aria-label={lang === 'zh' ? '后训练方法' : 'Post-training method'}>
        {[['ppo', 'PPO-based RLHF'], ['dpo', 'DPO'], ['grpo', 'GRPO']].map(([id, label]) => <button type="button" key={id} className={method === id ? 'active' : ''} onClick={() => setMethod(id)}>{label}</button>)}
      </div>
      <div className="method-contract">
        {(lang === 'zh' ? {
          ppo: [['数据', '在线单条 rollout'], ['反馈', 'Reward model / verifier'], ['Baseline', 'Value model'], ['代价', '四类模型与 token 对齐']],
          dpo: [['数据', '离线 chosen / rejected'], ['反馈', '成对偏好标签'], ['Baseline', 'Reference policy'], ['代价', '无法探索数据外回答']],
          grpo: [['数据', '在线成组 rollout'], ['反馈', 'Reward model / verifier'], ['Baseline', '组均值与标准差'], ['代价', '每个 prompt 多次生成']],
        } : {
          ppo: [['Data', 'online single rollouts'], ['Feedback', 'reward model / verifier'], ['Baseline', 'value model'], ['Cost', 'four roles + token alignment']],
          dpo: [['Data', 'offline chosen / rejected'], ['Feedback', 'pairwise preference label'], ['Baseline', 'reference policy'], ['Cost', 'no exploration beyond data']],
          grpo: [['Data', 'online response groups'], ['Feedback', 'reward model / verifier'], ['Baseline', 'group mean and std. dev.'], ['Cost', 'several generations per prompt']],
        })[method].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}
      </div>
      <div className="system-toolbar">
        {method === 'ppo' && <div className="view-switch" role="group" aria-label={lang === 'zh' ? '视图切换' : 'View switch'}>
          <button type="button" className={view === 'algorithm' ? 'active' : ''} onClick={() => setView('algorithm')}>{c.algorithm}</button>
          <button type="button" className={view === 'system' ? 'active' : ''} onClick={() => setView('system')}>{c.system}</button>
        </div>}
        <label><span>{c.clip}<output>{clip.toFixed(2)}</output></span><input type="range" min="0.05" max="0.4" step="0.01" value={clip} onChange={(event) => setClip(Number(event.target.value))} /></label>
        <label><span>{c.klBeta}<output>{klBeta.toFixed(2)}</output></span><input type="range" min="0" max="0.3" step="0.01" value={klBeta} onChange={(event) => setKlBeta(Number(event.target.value))} /></label>
      </div>

      <div className="shared-batch-banner"><span>◎</span><div><strong>{method === 'dpo' ? (lang === 'zh' ? '同一组离线偏好对' : 'One offline preference pair') : c.samples}</strong><small>{method === 'ppo' ? c.selectSample : (lang === 'zh' ? '保持任务不变，比较数据与优化信号' : 'Keep the task fixed while comparing data and update signals')}</small></div><b>{method === 'dpo' ? 'pair_017' : 'batch_042 · seed 17'}</b></div>

      {method === 'dpo' ? (
        <div className="method-algorithm-view">
          <div className="preference-pair">
            <article className="chosen"><small>{lang === 'zh' ? '偏好回答 y_w' : 'Chosen response y_w'}</small><p>{lang === 'zh' ? '瑞利散射对较短波长更强，因此天空在人眼中主要呈蓝色。' : 'Rayleigh scattering is stronger for shorter wavelengths, making the sky appear predominantly blue.'}</p><b>Δ log π = +{dpo.chosenShift.toFixed(2)}</b></article>
            <span>≻</span>
            <article><small>{lang === 'zh' ? '被拒回答 y_l' : 'Rejected response y_l'}</small><p>{lang === 'zh' ? '因为太空是蓝色的，所以天空也是蓝色的。' : 'The sky is blue because outer space is blue.'}</p><b>Δ log π = {dpo.rejectedShift.toFixed(2)}</b></article>
          </div>
          <div className="shared-equation"><MathFormula block latex={String.raw`\mathcal L_{\mathrm{DPO}}=-\log\sigma\!\left(\beta\left[\Delta\log\pi(y_w)-\Delta\log\pi(y_l)\right]\right)`} /><strong>p(yw ≻ yl) = {dpo.preferenceProbability.toFixed(3)} · loss = {dpo.loss.toFixed(3)}</strong></div>
        </div>
      ) : method === 'grpo' ? (
        <div className="method-algorithm-view">
          <div className="group-responses">
            {grpo.samples.map((sample) => <article key={sample.id} className={sample.advantage > 0 ? 'positive' : 'negative'}><small>{lang === 'zh' ? `回答 ${sample.id}` : `Response ${sample.id}`}</small><strong>R = {sample.reward.toFixed(2)}</strong><span>Â = {sample.advantage.toFixed(2)}</span><span>r = {sample.ratio.toFixed(2)} → {sample.clippedRatio.toFixed(2)}</span><b>J = {sample.objective.toFixed(3)}</b></article>)}
          </div>
          <div className="shared-equation"><MathFormula block latex={String.raw`A_i=\frac{R_i-\mu_R}{\sigma_R+\varepsilon},\qquad J_i=\min(r_iA_i,\operatorname{clip}(r_i)A_i)-\beta D_{\mathrm{KL}}`} /><strong>μR = {grpo.mean.toFixed(3)} · σR = {grpo.std.toFixed(3)}</strong></div>
        </div>
      ) : view === 'algorithm' ? (
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
          <div className="shared-equation"><MathFormula block latex={String.raw`L_t=\min\!\left(r_t\widehat A_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\widehat A_t\right)-\beta D_{\mathrm{KL}}\!\left(\pi_\theta\,\|\,\pi_{\mathrm{ref}}\right)`} /><strong>{selected.surrogate.toFixed(3)} − {klBeta.toFixed(2)} × {selected.approxKl.toFixed(3)}</strong></div>
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

      {method === 'ppo' && <div className="response-group">
        {result.samples.map((sample) => (
          <button type="button" key={sample.id} className={sample.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(sample.id)}>
            <b>{sample.id}</b><span>{sample.token}</span><small>R {sample.reward.toFixed(1)}</small><small>Â {sample.advantage.toFixed(2)}</small><small>{c.adjustedReward} {sample.adjustedReward.toFixed(2)}</small>
          </button>
        ))}
      </div>}
    </section>
  )
}
