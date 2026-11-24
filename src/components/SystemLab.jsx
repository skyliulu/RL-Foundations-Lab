import { useMemo, useState } from 'react'
import { evaluatePpo } from '../engine/ppo'
import { buildRlhfBatchContract } from '../engine/rlhf-batch.js'
import MathFormula from './MathFormula'
import MathText from './MathText'

const nodeDetail = {
  prompt: [String.raw`s_0`, 'UTF-8 text', 'batch item'],
  policyModel: [String.raw`\pi_\theta`, 'token logits', 'GPU forward'],
  rollout: [String.raw`\tau`, 'tokens + logprobs', 'generation workers'],
  reference: [String.raw`\pi_{\mathrm{ref}}`, 'reference logprobs', 'frozen forward'],
  rewardModel: [String.raw`R(\tau)`, 'sequence reward', 'scoring forward'],
  valueModel: [String.raw`V_\phi(s_t)`, 'token values', 'critic forward'],
  gae: [String.raw`\widehat A_t,\widehat R_t`, 'training tensors', 'CPU / GPU batch op'],
  updateModel: [String.raw`L^{\mathrm{CLIP}}+L^V+D_{\mathrm{KL}}`, 'minibatches', 'backward + optimizer'],
}

function PipelineNode({ id, label, active, onClick, iconLatex }) {
  return (
    <button type="button" className={`pipeline-node ${active ? 'active' : ''}`} aria-pressed={active} onClick={() => onClick(id)}>
      <span className="node-icon"><MathFormula latex={iconLatex} /></span>
      <strong>{label}</strong>
      <small><MathFormula latex={nodeDetail[id][0]} /></small>
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
  const batch = useMemo(() => buildRlhfBatchContract({ selectedId }), [selectedId])
  const selected = result.samples.find((sample) => sample.id === selectedId) || result.samples[0]
  const detail = nodeDetail[selectedNode]

  return (
    <section className="system-lab">
      <div className="experiment-environment"><span>{lang === 'zh' ? '语言模型 rollout 环境' : 'Language-model rollout environment'}</span><MathFormula latex={String.raw`x\xrightarrow{\pi_\theta}y_{1:T}\xrightarrow{R,\,V}\widehat A_{1:T}`} /><small>{lang === 'zh' ? '同一个 prompt 先产生 token 轨迹，再由奖励、价值与参考策略把轨迹变成可训练信号。' : 'One prompt first produces a token trajectory; reward, value, and reference models then turn it into trainable signals.'}</small></div>
      <div className="system-toolbar">
        <div className="view-switch" role="group" aria-label={lang === 'zh' ? '视图切换' : 'View switch'}>
          <button type="button" className={view === 'algorithm' ? 'active' : ''} aria-pressed={view === 'algorithm'} onClick={() => setView('algorithm')}>{c.algorithm}</button>
          <button type="button" className={view === 'system' ? 'active' : ''} aria-pressed={view === 'system'} onClick={() => setView('system')}>{c.system}</button>
        </div>
        <label><span><MathText>{c.clip}</MathText><output>{clip.toFixed(2)}</output></span><input type="range" min="0.05" max="0.4" step="0.01" value={clip} onChange={(event) => setClip(Number(event.target.value))} /></label>
        <label><span><MathText>{c.klBeta}</MathText><output>{klBeta.toFixed(2)}</output></span><input type="range" min="0" max="0.3" step="0.01" value={klBeta} onChange={(event) => setKlBeta(Number(event.target.value))} /></label>
      </div>

      <div className="shared-batch-banner"><span>◎</span><div><strong>{c.samples}</strong><small>{c.selectSample}</small></div><b>{`${batch.batchId} · ${batch.promptId}`}</b></div>

      {view === 'algorithm' ? (
        <div className="algorithm-view">
          <div className="policy-token-strip">
            <span className="prompt-token">{lang === 'zh' ? '问题：为什么天空看起来是蓝色？' : 'Prompt: Why does the sky look blue?'}</span>
            <span>Rayleigh</span><span>scattering</span><span className="active-token">{selected.token}</span><span>shorter</span><span>wavelengths</span><span>EOS</span>
          </div>
          <div className="algorithm-columns">
            <div><small>{lang === 'zh' ? '旧策略概率' : 'Old policy'}</small><strong><MathFormula latex={String.raw`\pi_{\mathrm{old}}(a_t\mid s_t)=${selected.oldProbability.toFixed(2)}`} /></strong></div>
            <div><small><MathText>{c.ratio}</MathText></small><strong><MathFormula latex={String.raw`r_t=${selected.ratio.toFixed(3)}`} /></strong></div>
            <div><small><MathText>{c.advantage}</MathText></small><strong><MathFormula latex={String.raw`\widehat A_t=${selected.advantage.toFixed(2)}`} /></strong></div>
            <div className={selected.clipped ? 'warn' : ''}><small><MathFormula latex={String.raw`\operatorname{clip}(r_t)`} /></small><strong>{selected.clippedRatio.toFixed(3)}</strong></div>
          </div>
          <div className="shared-equation"><MathFormula block latex={String.raw`L_t=\min\!\left(r_t\widehat A_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\widehat A_t\right)-\beta D_{\mathrm{KL}}\!\left(\pi_\theta\,\|\,\pi_{\mathrm{ref}}\right)`} /><strong><MathFormula latex={String.raw`${selected.surrogate.toFixed(3)}-${klBeta.toFixed(2)}\times ${selected.approxKl.toFixed(3)}`} /></strong></div>
        </div>
      ) : (
        <div className="system-view">
          <div className="pipeline-row primary-flow">
            <PipelineNode id="prompt" label={c.prompt} iconLatex={String.raw`P`} active={selectedNode === 'prompt'} onClick={setSelectedNode} />
            <span className="flow-arrow">→</span>
            <PipelineNode id="policyModel" label={c.policyModel} iconLatex={String.raw`\pi`} active={selectedNode === 'policyModel'} onClick={setSelectedNode} />
            <span className="flow-arrow">→</span>
            <PipelineNode id="rollout" label={c.rollout} iconLatex={String.raw`\tau`} active={selectedNode === 'rollout'} onClick={setSelectedNode} />
          </div>
          <div className="branch-lines" aria-hidden="true"><span>↙</span><span>↓</span><span>↘</span></div>
          <div className="pipeline-row scoring-flow">
            <PipelineNode id="reference" label={c.reference} iconLatex={String.raw`\pi_{\mathrm{ref}}`} active={selectedNode === 'reference'} onClick={setSelectedNode} />
            <PipelineNode id="rewardModel" label={c.rewardModel} iconLatex={String.raw`R`} active={selectedNode === 'rewardModel'} onClick={setSelectedNode} />
            <PipelineNode id="valueModel" label={c.valueModel} iconLatex={String.raw`V`} active={selectedNode === 'valueModel'} onClick={setSelectedNode} />
          </div>
          <div className="merge-lines" aria-hidden="true"><span>↘</span><span>↓</span><span>↙</span></div>
          <div className="pipeline-row update-flow">
            <PipelineNode id="gae" label={c.gae} iconLatex={String.raw`\widehat A`} active={selectedNode === 'gae'} onClick={setSelectedNode} />
            <span className="flow-arrow">→</span>
            <PipelineNode id="updateModel" label={c.updateModel} iconLatex={String.raw`\nabla`} active={selectedNode === 'updateModel'} onClick={setSelectedNode} />
            <span className="flow-arrow loop-arrow">↺ <MathFormula latex={String.raw`\pi_\theta`} /></span>
          </div>
          <aside className="node-inspector">
            <header><span>{c[selectedNode] || selectedNode}</span><b>{selectedId}</b></header>
            <dl><div><dt>{lang === 'zh' ? '算法对象' : 'Algorithm object'}</dt><dd><MathFormula latex={detail[0]} /></dd></div><div><dt>{lang === 'zh' ? '数据对象' : 'Data object'}</dt><dd>{detail[1]}</dd></div><div><dt>{lang === 'zh' ? '工程动作' : 'System action'}</dt><dd>{detail[2]}</dd></div></dl>
            <p>{lang === 'zh' ? '点击任一节点，检查同一条样本在算法语义与工程生命周期中的位置。' : 'Select any node to inspect where the same sample lives in the algorithm and system lifecycle.'}</p>
          </aside>
        </div>
      )}

      {view === 'system' && <div className="rlhf-batch-audit">
        <section className="rlhf-version-flow">
          <header><span>{lang === 'zh' ? '一批回答的来源与模型版本流' : 'Batch provenance and model-version flow'}</span><small>{lang === 'zh' ? '箭头表示数据交接，不表示所有模型一起更新' : 'Arrows show data handoff; not every model updates'}</small></header>
          <div>{batch.lifecycle.map((stage, index) => <article key={stage.stage}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <span>{({ generate: lang === 'zh' ? '生成' : 'Generate', score: lang === 'zh' ? '打分' : 'Score', align: lang === 'zh' ? '对齐' : 'Align', update: lang === 'zh' ? '更新' : 'Update', refresh: lang === 'zh' ? '刷新' : 'Refresh' })[stage.stage]}</span>
            <small>{stage.input}</small><i>→</i><strong>{stage.output}</strong><em>{stage.version}</em>
          </article>)}</div>
        </section>
        <div className="rlhf-contract-grid">
          <section className="rlhf-tensor-contract">
            <header><span>{lang === 'zh' ? '张量形状与生产者' : 'Tensor shapes and producers'}</span><small><MathFormula latex={String.raw`B=${batch.shape.batch},\ T=${batch.shape.sequence}`} /></small></header>
            <div role="table">
              <div className="is-head" role="row"><b role="columnheader">{lang === 'zh' ? '张量' : 'Tensor'}</b><b role="columnheader">{lang === 'zh' ? '形状' : 'Shape'}</b><b role="columnheader">{lang === 'zh' ? '生产者 / 版本' : 'Producer / version'}</b><b role="columnheader">{lang === 'zh' ? '有效位置' : 'Valid positions'}</b></div>
              {batch.tensors.map((tensor) => <div role="row" key={tensor.name}><code role="cell">{tensor.name}</code><span role="cell"><MathFormula latex={tensor.shape.join(String.raw`\times`)} /></span><span role="cell">{tensor.producer}<small>{tensor.version}</small></span><span role="cell">{tensor.mask}</span></div>)}
            </div>
          </section>
          <section className="rlhf-model-versions">
            <header><span>{lang === 'zh' ? '本批次锁定的模型版本' : 'Model versions locked to this batch'}</span><small>{batch.responseId}</small></header>
            <div>{batch.versions.map((item) => <article key={item.role}><span>{item.role}</span><strong>{item.version}</strong><small>{item.state}</small><em>{item.produces}</em></article>)}</div>
          </section>
        </div>
        <section className="rlhf-mask-ledger">
          <header><span>{lang === 'zh' ? '逐 token 的 mask 与终止语义' : 'Per-token masks and termination semantics'}</span><small>{batch.terminated ? (lang === 'zh' ? 'EOS：最后一步不再自举' : 'EOS: no bootstrap after the final action') : (lang === 'zh' ? '长度截断：最后一步仍保留自举' : 'Length truncation: final action keeps bootstrap')}</small></header>
          <div className="rlhf-mask-scroll">
            {batch.rows.map((row) => <article className={`${row.response ? 'is-response' : 'is-prompt'} ${row.token === 'PAD' ? 'is-pad' : ''} ${row.terminal ? 'is-terminal' : ''} ${row.truncated ? 'is-truncated' : ''}`} key={row.index}>
              <b>{row.index}</b><strong>{row.token}</strong>
              <span><small>attention</small>{row.attention}</span>
              <span><small>response</small>{row.response}</span>
              <span><small>loss</small>{row.loss}</span>
              <span><small>bootstrap</small>{row.bootstrap}</span>
            </article>)}
          </div>
        </section>
      </div>}

      <div className="response-group">
        {result.samples.map((sample) => (
          <button type="button" key={sample.id} className={sample.id === selectedId ? 'active' : ''} aria-pressed={sample.id === selectedId} onClick={() => setSelectedId(sample.id)}>
            <b>{sample.id}</b><span>{sample.token}</span><small><MathFormula latex={String.raw`R=${sample.reward.toFixed(1)}`} /></small><small><MathFormula latex={String.raw`\widehat A=${sample.advantage.toFixed(2)}`} /></small><small>{c.adjustedReward} {sample.adjustedReward.toFixed(2)}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
