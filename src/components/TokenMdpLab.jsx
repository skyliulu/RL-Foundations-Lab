import { useMemo, useState } from 'react'
import { buildTokenTrajectory } from '../engine/token-mdp.js'
import MathFormula from './MathFormula.jsx'

const responses = {
  zh: [
    { id: 'direct', label: '简洁回答', tokens: ['强化', '学习', '依赖', '反馈', '<EOS>'], old: [-1.2, -0.7, -0.9, -0.6, -0.4], ref: [-1.1, -0.8, -1.0, -0.8, -0.5], process: [0, 0.2, 0, 0.3, 0], end: 'terminated', ending: 'EOS · 真正终止' },
    { id: 'drift', label: '偏离参考', tokens: ['当然', '绝对', '永远', '正确', '<EOS>'], old: [-0.8, -0.5, -0.4, -0.3, -0.2], ref: [-1.1, -1.5, -1.8, -1.4, -0.7], process: [0, -0.1, -0.2, 0, 0], end: 'terminated', ending: 'EOS · 真正终止' },
    { id: 'truncated', label: '长度截断', tokens: ['强化', '学习', '可以', '通过', '大量'], old: [-1.2, -0.7, -1.0, -0.8, -1.2], ref: [-1.1, -0.8, -1.0, -0.9, -1.1], process: [0, 0.2, 0, 0, 0], end: 'truncated', ending: '长度边界 · 外部截断' },
  ],
  en: [
    { id: 'direct', label: 'Concise answer', tokens: ['RL', 'learns', 'from', 'feedback', '<EOS>'], old: [-1.2, -0.7, -0.9, -0.6, -0.4], ref: [-1.1, -0.8, -1.0, -0.8, -0.5], process: [0, 0.2, 0, 0.3, 0], end: 'terminated', ending: 'EOS · terminated' },
    { id: 'drift', label: 'Reference drift', tokens: ['Obviously', 'always', 'certainly', 'correct', '<EOS>'], old: [-0.8, -0.5, -0.4, -0.3, -0.2], ref: [-1.1, -1.5, -1.8, -1.4, -0.7], process: [0, -0.1, -0.2, 0, 0], end: 'terminated', ending: 'EOS · terminated' },
    { id: 'truncated', label: 'Length truncation', tokens: ['RL', 'can', 'learn', 'through', 'many'], old: [-1.2, -0.7, -1.0, -0.8, -1.2], ref: [-1.1, -0.8, -1.0, -0.9, -1.1], process: [0, 0.2, 0, 0, 0], end: 'truncated', ending: 'Length boundary · truncated' },
  ],
}

function number(value) {
  return value.toFixed(2)
}

export default function TokenMdpLab({ lang, content }) {
  const zh = lang === 'zh'
  const [variant, setVariant] = useState('direct')
  const [terminalReward, setTerminalReward] = useState(2)
  const [beta, setBeta] = useState(0.2)
  const [gamma, setGamma] = useState(1)
  const [truncationValue, setTruncationValue] = useState(0.8)
  const options = responses[lang]
  const selected = options.find((item) => item.id === variant) || options[0]
  const trajectory = useMemo(() => buildTokenTrajectory({
    response: selected,
    sequenceReward: terminalReward,
    beta,
    gamma,
    truncationValue,
  }), [selected, terminalReward, beta, gamma, truncationValue])
  const rows = trajectory.rows

  return (
    <section className="token-mdp-lab" aria-label={content.figure}>
      <header><div><span>{content.figure}</span><p>{content.instruction}</p></div><strong>{zh ? 'Prompt：用一句话解释强化学习' : 'Prompt: Explain reinforcement learning in one sentence'}</strong></header>
      <div className="experiment-environment"><span>{zh ? '自回归生成环境' : 'Autoregressive generation environment'}</span><MathFormula latex={String.raw`s_t=(x,y_{<t})\xrightarrow{a_t=y_t}s_{t+1}`} /><small>{zh ? 'prompt 与已生成前缀构成状态；下一个 token 是动作，EOS 或长度边界决定轨迹如何终止。' : 'The prompt and generated prefix form the state; the next token is the action, and EOS or the length limit terminates the trajectory.'}</small></div>
      <div className="token-mdp-controls">
        <fieldset><legend>{zh ? '选择一条 response' : 'Choose a response'}</legend>{options.map((item) => <button type="button" className={variant === item.id ? 'active' : ''} key={item.id} onClick={() => setVariant(item.id)}>{item.label}</button>)}</fieldset>
        <label><span>{zh ? '末位序列评分' : 'Final sequence score'} <output>{number(terminalReward)}</output></span><input type="range" min="-2" max="4" step="0.25" value={terminalReward} onChange={(event) => setTerminalReward(Number(event.target.value))} /></label>
        <label><span>{zh ? 'KL 强度' : 'KL strength'} <MathFormula latex={String.raw`\beta`} /> <output>{number(beta)}</output></span><input type="range" min="0" max="1" step="0.05" value={beta} onChange={(event) => setBeta(Number(event.target.value))} /></label>
        <label><span>{zh ? '折扣' : 'Discount'} <MathFormula latex={String.raw`\gamma`} /> <output>{number(gamma)}</output></span><input type="range" min="0.5" max="1" step="0.05" value={gamma} onChange={(event) => setGamma(Number(event.target.value))} /></label>
        <label className={trajectory.truncated ? '' : 'disabled'}><span>{zh ? '截断后的价值估计' : 'Value beyond truncation'} <output>{number(truncationValue)}</output></span><input type="range" min="-1" max="3" step="0.1" value={truncationValue} disabled={!trajectory.truncated} onChange={(event) => setTruncationValue(Number(event.target.value))} /></label>
      </div>
      <div className="token-mdp-equation"><MathFormula block latex={String.raw`r_t=r_t^{\mathrm{process}}-\beta(\log\pi_{\mathrm{old},t}-\log\pi_{\mathrm{ref},t})+\mathbf 1[t=T-1]R_{\mathrm{terminal}}`} /></div>
      <div className="token-trajectory-ledger" role="table" aria-label={zh ? 'Token 轨迹账本' : 'Token trajectory ledger'}>
        <div className="token-trajectory-head" role="row"><b>{zh ? '状态 / 前缀' : 'State / prefix'}</b><b>{zh ? '动作 token' : 'Action token'}</b><b>old logp</b><b>ref logp</b><b>value</b><b>{zh ? '损失 mask' : 'loss mask'}</b><b>{zh ? '自举 mask' : 'bootstrap mask'}</b><b>{zh ? 'KL 代价' : 'KL cost'}</b><b>{zh ? '总奖励' : 'Reward'}</b><b>advantage</b><b>return</b></div>
        {rows.map((row) => <div className="token-trajectory-row" role="row" key={`${row.index}-${row.token}`}><span>{row.index === 0 ? 'prompt' : selected.tokens.slice(0, row.index).join(' ')}</span><strong>{row.token}</strong><span>{number(row.oldLogp)}</span><span>{number(row.refLogp)}</span><span>{number(row.value)}</span><span>{row.lossMask}</span><span>{row.bootstrapMask}</span><span>{number(row.klCost)}</span><span>{number(row.reward)}</span><span>{number(row.advantage)}</span><span>{number(row.returnValue)}</span></div>)}
      </div>
      <footer><span>{zh ? '轨迹边界契约' : 'Trajectory boundary contract'}</span><strong>{selected.ending}</strong><p>{trajectory.terminated ? (zh ? '策略主动选择 EOS；最后一步自举 mask 为 0，回报不读取终止状态之后的价值。' : 'The policy chose EOS. The final bootstrap mask is 0, so return reads no value beyond termination.') : (zh ? `长度预算截断了生成，但任务并未真正结束；最后一步自举 mask 为 1，并加入 γV(s_T)=${number(trajectory.finalBootstrap)}。` : `The length budget stopped generation without true termination. The final bootstrap mask is 1 and adds γV(s_T)=${number(trajectory.finalBootstrap)}.`)}</p></footer>
    </section>
  )
}
