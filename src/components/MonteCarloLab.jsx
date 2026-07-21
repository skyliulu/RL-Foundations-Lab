import { useMemo, useState } from 'react'
import {
  ACTIONS,
  allStates,
  indexOf,
  isForbidden,
  isGoal,
  keyOf,
} from '../engine/gridworld.js'
import { runMonteCarloCourse } from '../engine/learning-labs.js'
import MathFormula from './MathFormula.jsx'
import MathText from './MathText.jsx'

const defaults = {
  variant: 'epsilon',
  episodes: 24,
  epsilon: 0.2,
  visit: 'every',
  seed: 20260719,
}

const variantCopy = {
  zh: {
    basic: ['MC Basic', '为每个状态—动作对单独收集从该对出发的 episode；定义直接，但数据复用很差。'],
    exploring: ['Exploring Starts', '每条 episode 随机选择起始状态—动作，并复用途中所有访问；覆盖更高，但要求能控制起点。'],
    epsilon: ['MC ε-Greedy', '用软策略让每个动作始终有正概率；取消对特殊起点的依赖，但保留持续探索的代价。'],
  },
  en: {
    basic: ['MC Basic', 'Collect separate episodes from every state-action pair. It mirrors the definition but wastes most observed visits.'],
    exploring: ['Exploring Starts', 'Randomize the initial state-action pair and reuse all later visits. Coverage improves, but the start must be controllable.'],
    epsilon: ['MC ε-Greedy', 'Keep every action at positive probability. Special starts disappear, but persistent exploration has a cost.'],
  },
}

const actionCopy = {
  zh: { up: '上', right: '右', down: '下', left: '左', stay: '停留' },
  en: { up: 'Up', right: 'Right', down: 'Down', left: 'Left', stay: 'Stay' },
}

function format(value) {
  return Number(value).toFixed(2)
}

export default function MonteCarloLab({ lang, content }) {
  const zh = lang === 'zh'
  const [params, setParams] = useState(defaults)
  const [sampleSlot, setSampleSlot] = useState(2)
  const result = useMemo(() => runMonteCarloCourse(params), [params])
  const sample = result.samples[Math.min(sampleSlot, result.samples.length - 1)]
  const variant = variantCopy[lang][params.variant]
  const set = (key, value) => setParams((current) => ({ ...current, [key]: value }))

  return (
    <section className="mc-lab" aria-label={content.figure}>
      <header className="mc-lab-heading">
        <div><span>{content.figure}</span><h2>{zh ? '同一批经验，三种算法怎样逐步修复前一种方法？' : 'How does each algorithm repair the previous one?'}</h2><p><MathText>{content.instruction}</MathText></p></div>
        <button type="button" onClick={() => { setParams(defaults); setSampleSlot(2) }}>{zh ? '恢复基线' : 'Reset'}</button>
      </header>

      <div className="mc-variant-switch" role="group" aria-label={zh ? '算法变体' : 'Algorithm variant'}>
        {['basic', 'exploring', 'epsilon'].map((id, index) => (
          <button type="button" key={id} className={params.variant === id ? 'active' : ''} onClick={() => set('variant', id)}>
            <small>{index + 1}</small><strong><MathText>{variantCopy[lang][id][0]}</MathText></strong><span>{index === 0 ? (zh ? '定义直译' : 'Definition') : index === 1 ? (zh ? '提高复用' : 'Reuse data') : (zh ? '取消起点假设' : 'Remove start assumption')}</span>
          </button>
        ))}
      </div>

      <div className="mc-why-strip">
        <span>{zh ? '当前方法回答' : 'This method answers'}</span>
        <div><strong><MathText>{variant[0]}</MathText></strong><p><MathText>{variant[1]}</MathText></p></div>
      </div>

      <div className="mc-controls">
        <label><span>{zh ? 'Episode 数' : 'Episodes'}<output>{params.episodes}</output></span><input type="range" min="8" max="72" step="8" value={params.episodes} onChange={(event) => set('episodes', Number(event.target.value))} /></label>
        <label className={params.variant === 'epsilon' ? '' : 'disabled'}><span>{zh ? '探索率' : 'Exploration'} <MathFormula latex={String.raw`\epsilon`} /><output>{params.epsilon.toFixed(2)}</output></span><input type="range" min="0.05" max="0.5" step="0.05" value={params.epsilon} disabled={params.variant !== 'epsilon'} onChange={(event) => set('epsilon', Number(event.target.value))} /></label>
        <fieldset><legend>{zh ? '访问协议' : 'Visit protocol'}</legend><div>{['first', 'every'].map((id) => <button type="button" key={id} className={params.visit === id ? 'active' : ''} onClick={() => set('visit', id)}>{id === 'first' ? (zh ? '首次访问' : 'First visit') : (zh ? '每次访问' : 'Every visit')}</button>)}</div></fieldset>
      </div>

      <div className="mc-metrics">
        <div><span>{zh ? '已覆盖状态—动作对' : 'Covered state-action pairs'}</span><strong>{result.visitedPairs} / 125</strong></div>
        <div><span>{zh ? '覆盖率' : 'Coverage'}</span><strong>{(result.coverage * 100).toFixed(1)}%</strong></div>
        <div><span>{zh ? '观察中的起始状态' : 'Focus start state'}</span><strong>{result.focusState}</strong></div>
      </div>

      <div className="mc-stage">
        <section className="mc-coverage-panel">
          <header><span>{zh ? '状态访问热图' : 'State visit heatmap'}</span><small>{zh ? '颜色代表该状态下所有动作的累计更新次数' : 'Color encodes total updates across actions'}</small></header>
          <div className="mc-coverage-grid">
            {allStates().map((state) => {
              const visits = result.stateCoverage[indexOf(state)]
              const intensity = Math.min(1, visits / Math.max(2, params.episodes / 2))
              return <span key={keyOf(state)} className={`${isForbidden(state) ? 'forbidden' : ''} ${isGoal(state) ? 'goal' : ''}`} style={{ '--coverage': intensity }}><b>s{indexOf(state) + 1}</b><small>{visits}</small></span>
            })}
          </div>
          <p><MathText>{zh ? '只看 Q 的数值是否稳定不够：没有被访问的状态—动作对仍然保持初值。' : 'A stable Q estimate is not enough: unvisited pairs still retain their initial values.'}</MathText></p>
        </section>

        <section className="mc-episode-panel">
          <header><span>{zh ? 'Episode tape' : 'Episode tape'}</span><div>{result.samples.map((item, index) => <button type="button" key={item.index} className={sampleSlot === index ? 'active' : ''} onClick={() => setSampleSlot(index)}>#{item.index + 1}</button>)}</div></header>
          <div className="mc-tape-head"><span><MathFormula latex={String.raw`t`} /></span><span><MathFormula latex={String.raw`S_t`} /></span><span><MathFormula latex={String.raw`A_t`} /></span><span><MathFormula latex={String.raw`R_{t+1}`} /></span><span><MathFormula latex={String.raw`G_t`} /></span><span>{zh ? '用于更新' : 'Used'}</span></div>
          <div className="mc-tape-body">
            {sample.steps.map((step) => <div key={step.time} className={step.used ? 'used' : 'skipped'}><span>{step.time}</span><strong>s{indexOf(step.state) + 1}</strong><span>{ACTIONS[step.action].arrow} {actionCopy[lang][step.action]}</span><span className={step.reward < 0 ? 'negative' : step.reward > 0 ? 'positive' : ''}>{step.reward > 0 ? '+' : ''}{step.reward}</span><span>{format(step.returnValue)}</span><span>{step.used ? '●' : '—'}</span></div>)}
          </div>
        </section>

        <aside className="mc-update-panel">
          <header><span><MathText>{zh ? '该 episode 的 Q 更新' : 'Q updates in this episode'}</MathText></span><small>{sample.updates.length} {zh ? '次更新' : 'updates'}</small></header>
          <MathFormula block latex={String.raw`\begin{aligned}Q(S_t,A_t)&\leftarrow Q(S_t,A_t)\\&\quad+\frac{1}{N(S_t,A_t)}\\&\qquad\cdot\left(G_t-Q(S_t,A_t)\right)\end{aligned}`} />
          <div className="mc-update-list">
            {sample.updates.slice(0, 7).map((update) => <div key={`${update.time}-${update.state}-${update.action}`}><span>{update.state} · {ACTIONS[update.action].arrow}</span><strong><MathFormula latex={String.raw`${format(update.before)}\rightarrow${format(update.after)}`} /></strong><small><MathFormula latex={String.raw`G=${format(update.returnValue)}\;\cdot\;N=${update.visits}`} /></small></div>)}
          </div>
          {sample.updates.length > 7 && <p>+ {sample.updates.length - 7} {zh ? '条更新未展开' : 'more updates'}</p>}
        </aside>
      </div>

      <section className="mc-policy-panel">
        <div><span>{zh ? '改进后的动作分布' : 'Improved action distribution'}</span><strong>{result.focusState}</strong></div>
        <div className="mc-policy-bars">{result.policy.map((item) => <span key={item.action}><b>{ACTIONS[item.action].arrow}</b><i><em style={{ width: `${item.probability * 100}%` }} /></i><small>{(item.probability * 100).toFixed(0)}%</small></span>)}</div>
        <p><MathText>{params.variant === 'epsilon' ? (zh ? 'ε-greedy 让非贪心动作仍有正概率，因此覆盖得以继续；代价是策略通常不再属于全部策略中的严格最优策略。' : 'ε-greedy preserves positive probability for non-greedy actions. Coverage continues, but the policy is generally not globally optimal.') : (zh ? '确定性贪心改善会集中到一个动作；若起点和数据收集不能保证覆盖，错误的早期判断可能永远无法被修正。' : 'Deterministic greedy improvement concentrates on one action; without coverage, an early error may never be corrected.')}</MathText></p>
      </section>
    </section>
  )
}
