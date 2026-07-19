import { useEffect, useMemo, useState } from 'react'
import BellmanLab from './components/BellmanLab'
import BellmanDerivationExplorer from './components/BellmanDerivationExplorer'
import CourseWorldExplorer from './components/CourseWorldExplorer'
import ReturnObservatory from './components/ReturnObservatory'
import OptimalitySwitch from './components/OptimalitySwitch'
import PlanningLab from './components/PlanningLab'
import PpoLab from './components/PpoLab'
import SystemLab from './components/SystemLab'
import { copy } from './content'

function ChapterHeader({ chapter, content, prerequisites }) {
  return (
    <header className="chapter-header">
      <span className="chapter-eyebrow">{content.eyebrow}</span>
      <h1>{content.title}</h1>
      <p className="chapter-intro">{content.intro}</p>
      <span className="prerequisite">↳ {prerequisites}</span>
    </header>
  )
}

function MdpRail({ lang }) {
  const labels = lang === 'zh'
    ? { loop: '交互闭环', agent: '智能体', environment: '环境', policy: '策略 π(a|s)', response: '转移 p(s′|s,a) 与奖励 p(r|s,a)', markov: 'Markov 性', markovText: '给定当前状态与动作，下一步与更早历史条件独立。' }
    : { loop: 'Interaction loop', agent: 'Agent', environment: 'Environment', policy: 'Policy π(a|s)', response: 'Transition p(s′|s,a) and reward p(r|s,a)', markov: 'Markov property', markovText: 'Given the current state and action, the next step is conditionally independent of earlier history.' }
  return (
    <>
      <section className="rail-section">
        <span className="rail-kicker">{labels.loop}</span>
        <div className="mdp-loop-formula">s<sub>t</sub> <b>→</b> a<sub>t</sub> <b>→</b> r<sub>t+1</sub>, s<sub>t+1</sub></div>
        <dl className="mapping-list"><div><dt>{labels.agent}</dt><dd>{labels.policy}</dd></div><div><dt>{labels.environment}</dt><dd>{labels.response}</dd></div></dl>
      </section>
      <section className="rail-section"><span className="rail-kicker">{labels.markov}</span><div className="rail-formula compact">p(s′|s,a,history) = p(s′|s,a)</div><p>{labels.markovText}</p></section>
    </>
  )
}

function BellmanRail({ lang }) {
  return (
    <>
      <section className="rail-section">
        <span className="rail-kicker">{lang === 'zh' ? '状态价值' : 'State value'}</span>
        <h2>Bellman {lang === 'zh' ? '期望方程' : 'expectation equation'}</h2>
        <div className="rail-formula"><span className="term-state">Vπ(s)</span> = E<sub>π,p</sub>[ <span className="term-reward">Rₜ₊₁</span> + <span className="term-gamma">γ</span><span className="term-future">Vπ(s′)</span> ]</div>
        <ul className="term-list">
          <li><i className="dot reward-dot" /><span>{lang === 'zh' ? '即时奖励：本步的直接回报' : 'Immediate reward from this step'}</span></li>
          <li><i className="dot gamma-dot" /><span>{lang === 'zh' ? '折扣因子：未来价值的权重' : 'Discount: weight of future value'}</span></li>
          <li><i className="dot future-dot" /><span>{lang === 'zh' ? '后继价值：从下一状态继续计算' : 'Successor value: continue from the next state'}</span></li>
        </ul>
      </section>
      <section className="rail-section observation-rail">
        <span className="rail-kicker">{lang === 'zh' ? '观察提示' : 'What to observe'}</span>
        <ol><li>{lang === 'zh' ? '从黄色禁区旁选择一个状态。' : 'Select a state beside a yellow forbidden cell.'}</li><li>{lang === 'zh' ? '连续更新，观察 +1 如何从蓝色目标向外传播。' : 'Play updates and watch +1 propagate from the blue target.'}</li><li>{lang === 'zh' ? '对照课件：越界留在原地，但即时奖励为 −1。' : 'Compare with the course: crossing a boundary stays put but yields −1.'}</li></ol>
      </section>
    </>
  )
}

function ReturnRail({ lang }) {
  const labels = lang === 'zh'
    ? { return: '单条轨迹的回报', value: '状态价值', distinction: '对象区别', text: 'Gₜ 是随机变量的一次实现；Vπ(s) 是给定起点后的条件期望。', horizon: '有效时间尺度' }
    : { return: 'Return of one trajectory', value: 'State value', distinction: 'Object distinction', text: 'Gₜ is one realization of a random variable; Vπ(s) is its conditional expectation given the start.', horizon: 'Effective horizon' }
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">{labels.return}</span><div className="rail-formula compact">Gₜ = Σ<sub>k≥0</sub> γ<sup>k</sup>Rₜ₊ₖ₊₁</div><span className="rail-kicker">{labels.value}</span><div className="rail-formula compact">Vπ(s) = E[Gₜ | Sₜ=s]</div></section>
      <section className="rail-section"><span className="rail-kicker">{labels.distinction}</span><p>{labels.text}</p><div className="mapping-list"><div><dt>γ = 0.5</dt><dd>{labels.horizon} ≈ 2</dd></div><div><dt>γ = 0.9</dt><dd>{labels.horizon} ≈ 10</dd></div><div><dt>γ = 0.95</dt><dd>{labels.horizon} ≈ 20</dd></div></div></section>
    </>
  )
}

function PlanningRail({ lang }) {
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '最优性算子' : 'Optimality operator'}</span><div className="rail-formula compact">V<sub>k+1</sub>(s) = max<sub>a</sub> E[R + γV<sub>k</sub>(s′)]</div><p>{lang === 'zh' ? '同步与原地更新只改变新值被复用的时机，不改变不动点。' : 'Synchronous and in-place updates change when new values are reused, not the fixed point.'}</p></section>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '公平比较协议' : 'Fair comparison protocol'}</span><ul className="numbered-notes"><li><b>1</b>{lang === 'zh' ? '同一课件环境与初始值' : 'Same course world and initialization'}</li><li><b>2</b>{lang === 'zh' ? '同一折扣、随机性与阈值' : 'Same discount, randomness, and threshold'}</li><li><b>3</b>{lang === 'zh' ? '只改变更新顺序' : 'Only update order changes'}</li></ul></section>
    </>
  )
}

function OptimalityRail({ lang }) {
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '右侧变化' : 'Right-hand change'}</span><div className="rail-formula compact">TπV(s) = Σ<sub>a</sub>π(a|s)q<sub>V</sub>(s,a)</div><div className="rail-formula compact">T*V(s) = max<sub>a</sub>q<sub>V</sub>(s,a)</div></section>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '关键性质' : 'Key property'}</span><p>{lang === 'zh' ? '任意概率加权平均都不会超过最大项，因此最大化策略分布等价于选择最大动作价值。' : 'No probability-weighted average can exceed its largest member, so maximizing over policy distributions is equivalent to selecting the largest action value.'}</p></section>
    </>
  )
}

function PpoRail({ lang }) {
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">PPO-Clip</span><div className="rail-formula multiline">L<sup>CLIP</sup>(θ) = Ê<sub>t</sub>[ min( rₜÂₜ,<br />clip(rₜ, 1−ε, 1+ε)Âₜ ) ]</div><p>{lang === 'zh' ? 'rₜ = πθ(aₜ|sₜ) / πold(aₜ|sₜ)' : 'rₜ = πθ(aₜ|sₜ) / πold(aₜ|sₜ)'}</p></section>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '读图方法' : 'How to read the plane'}</span><ul className="numbered-notes"><li><b>+</b>{lang === 'zh' ? '优势为正：提高动作概率' : 'Positive advantage: raise probability'}</li><li><b>−</b>{lang === 'zh' ? '优势为负：降低动作概率' : 'Negative advantage: lower probability'}</li><li><b>ε</b>{lang === 'zh' ? '越小：更新越保守，也更容易停滞' : 'Smaller: safer updates, but easier to stall'}</li></ul></section>
    </>
  )
}

function RlhfRail({ lang }) {
  const rows = lang === 'zh'
    ? [['状态', 'prompt + token 前缀'], ['动作', '下一个 token'], ['轨迹', '完整 response'], ['Actor', 'policy model'], ['Critic', 'value model'], ['奖励', 'reward model / verifier']]
    : [['State', 'prompt + token prefix'], ['Action', 'next token'], ['Trajectory', 'complete response'], ['Actor', 'policy model'], ['Critic', 'value model'], ['Reward', 'reward model / verifier']]
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '概念迁移' : 'Concept bridge'}</span><h2>{lang === 'zh' ? '经典 RL → 语言模型' : 'Classical RL → language models'}</h2><dl className="mapping-list">{rows.map(([left, right]) => <div key={left}><dt>{left}</dt><dd>{right}</dd></div>)}</dl></section>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '共享证据' : 'Shared evidence'}</span><p>{lang === 'zh' ? '算法视图和系统视图使用同一个 batch id、seed、样本奖励、advantage 与 ratio。' : 'Algorithm and system views share the same batch id, seed, rewards, advantages, and ratios.'}</p></section>
    </>
  )
}

function FormulaContextRail({ context, lang }) {
  return (
    <section className="rail-section formula-context-rail">
      <span className="rail-kicker">{lang === 'zh' ? '公式上下文' : 'Formula context'}</span>
      <h2>{context.title}</h2>
      <p>{context.body}</p>
      <dl className="mapping-list">{context.rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    </section>
  )
}

function RightRail({ active, lang, open, onToggle, context }) {
  return (
    <aside className={`right-rail ${open ? 'is-open' : ''}`}>
      <button type="button" className="right-rail-toggle" aria-expanded={open} onClick={onToggle}>{lang === 'zh' ? '学习工作台' : 'Study workspace'}</button>
      {open && (
        <div className="right-rail-panel">
          <header><span>{lang === 'zh' ? '随当前对象变化' : 'Follows the current object'}</span><button type="button" onClick={onToggle}>{lang === 'zh' ? '收起' : 'Close'}</button></header>
          {context ? <FormulaContextRail context={context} lang={lang} /> : { mdp: <MdpRail lang={lang} />, returns: <ReturnRail lang={lang} />, bellman: <BellmanRail lang={lang} />, optimality: <OptimalityRail lang={lang} />, planning: <PlanningRail lang={lang} />, ppo: <PpoRail lang={lang} />, rlhf: <RlhfRail lang={lang} /> }[active]}
        </div>
      )}
    </aside>
  )
}

function DepthBand({ lang, active }) {
  const items = lang === 'zh'
    ? { mdp: ['观察：一次动作产生哪些后继', '机制：策略与环境的职责边界', '深入：Markov 条件独立性'], returns: ['观察：每个奖励如何贡献给 Gₜ', '机制：单条 return 与期望 value', '深入：折扣、截断与采样误差'], bellman: ['观察：一次 backup 改变哪个状态', '机制：不动点与信息传播', '深入：矩阵形式 v = r + γPv'], optimality: ['观察：五个动作 target 的竞争', '机制：策略加权如何变成 max', '深入：V*、贪心策略与非唯一性'], planning: ['观察：两条残差曲线的速度', '机制：更新调度与复用', '深入：收缩映射与收敛'], ppo: ['观察：哪些样本被裁剪', '机制：ratio、advantage 与近端约束', '深入：多轮 minibatch 与 KL'], rlhf: ['观察：一条样本经过哪些模型', '机制：奖励、价值与 KL 的数据依赖', '深入：rollout / update 生命周期'] }
    : { mdp: ['Observe: successors of one action', 'Mechanism: policy vs. environment', 'Deep dive: Markov conditional independence'], returns: ['Observe: each reward contribution to Gₜ', 'Mechanism: one return versus expected value', 'Deep dive: discount, truncation, and sampling error'], bellman: ['Observe: which state one backup changes', 'Mechanism: fixed points and propagation', 'Deep dive: matrix form v = r + γPv'], optimality: ['Observe: five action targets compete', 'Mechanism: policy weighting becomes max', 'Deep dive: V*, greedy policies, non-uniqueness'], planning: ['Observe: speed of two residual curves', 'Mechanism: scheduling and reuse', 'Deep dive: contraction and convergence'], ppo: ['Observe: which samples are clipped', 'Mechanism: ratio, advantage, and proximity', 'Deep dive: minibatch epochs and KL'], rlhf: ['Observe: which models touch one sample', 'Mechanism: reward, value, and KL dependencies', 'Deep dive: rollout / update lifecycle'] }
  return <div className="depth-band">{items[active].map((item, index) => <span key={item}><b>{['I', 'II', 'III'][index]}</b>{item}</span>)}</div>
}

function ChapterPrelude({ content }) {
  return (
    <section className="derivation-sequence" aria-label={content.title}>
      {content.prelude.map((step, index) => (
        <article className="derivation-step" key={step.id}>
          <header><span>{String(index + 1).padStart(2, '0')}</span><small>{step.kicker}</small></header>
          <h2>{step.title}</h2>
          {step.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {step.formulas && <div className="derivation-formulas">{step.formulas.map((formula) => <div key={formula}>{formula}</div>)}</div>}
        </article>
      ))}
    </section>
  )
}

function ChapterSections({ content }) {
  return (
    <section className="chapter-section-grid">
      {content.sections.map((section) => (
        <article key={section.id} className={`chapter-section-card section-${section.id}`}>
          <span>{section.kicker}</span>
          <h2>{section.title}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.formula && <div className="section-formula">{section.formula}</div>}
        </article>
      ))}
    </section>
  )
}

function ChapterSummary({ content, lang }) {
  return (
    <section className="chapter-summary">
      <span>{lang === 'zh' ? '本章收束' : 'Chapter summary'}</span>
      <h2>{content.summaryTitle || (lang === 'zh' ? '从长期回报到可求解的状态方程' : 'From long-term return to solvable state equations')}</h2>
      <ul>{content.summary.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  )
}

function ChapterSources({ sources, lang }) {
  return (
    <section className="chapter-sources">
      <span>{lang === 'zh' ? '本章课件定位' : 'Course references for this chapter'}</span>
      <ul>{sources.map((source) => <li key={source.id}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a><small>{source.pages}</small></li>)}</ul>
    </section>
  )
}

export default function App() {
  const [lang, setLang] = useState('zh')
  const [active, setActive] = useState('mdp')
  const [navCompact, setNavCompact] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [rightContext, setRightContext] = useState(null)
  const text = copy[lang]
  const chapter = useMemo(() => text.chapters.find((item) => item.id === active), [text, active])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setRightContext(null)
    setRightOpen(false)
  }, [active, lang])

  const content = text[active]

  return (
    <div className={`app-shell ${navCompact ? 'nav-compact' : ''}`}>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => setActive('mdp')}>
          <span className="brand-mark">RL</span><span><strong>{text.brand}</strong><small>{text.lab}</small></span>
        </button>
        <div className="header-actions"><button type="button" className="language-switch" onClick={() => setLang((value) => value === 'zh' ? 'en' : 'zh')}>{lang === 'zh' ? 'EN' : '中'}</button></div>
      </header>

      <aside className={`left-nav ${navCompact ? 'is-compact' : ''}`}>
        <div className="nav-head"><span className="nav-label">{text.toc}</span><button type="button" className="nav-collapse" aria-expanded={!navCompact} onClick={() => setNavCompact((value) => !value)}>{navCompact ? (lang === 'zh' ? '展开' : 'Expand') : (lang === 'zh' ? '缩进' : 'Collapse')}</button></div>
        <nav>
          {text.chapters.map((item) => (
            <button type="button" key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
              <span className="nav-number">{item.number}</span><span className="nav-copy"><small>{item.kicker}</small><strong>{item.title}</strong><em>{item.subtitle}</em></span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="article-column">
        <ChapterHeader chapter={chapter} content={content} prerequisites={content.prerequisite || text.prerequisites} />
        <DepthBand lang={lang} active={active} />
        {active === 'mdp' && (
          <>
            <ChapterPrelude content={text.mdp} />
            <p className="article-copy">{text.mdp.bridge}</p>
            <CourseWorldExplorer lang={lang} content={text.mdp} />
            <ChapterSections content={text.mdp} />
            <ChapterSummary content={text.mdp} lang={lang} />
            <ChapterSources sources={text.mdp.sources} lang={lang} />
          </>
        )}
        {active === 'returns' && (
          <>
            <ChapterPrelude content={text.returns} />
            <p className="article-copy">{text.returns.bridge}</p>
            <ReturnObservatory lang={lang} content={text.returns} />
            <ChapterSections content={text.returns} />
            <ChapterSummary content={text.returns} lang={lang} />
            <ChapterSources sources={text.returns.sources} lang={lang} />
          </>
        )}
        {active === 'bellman' && (
          <>
            <ChapterPrelude content={text.bellman} />
            <BellmanDerivationExplorer lang={lang} onOpenContext={(context) => { setRightContext(context); setRightOpen(true) }} />
            <p className="article-copy">{text.bellman.bridge}</p>
            <BellmanLab lang={lang} text={text} />
            <ChapterSections content={text.bellman} />
            <ChapterSummary content={text.bellman} lang={lang} />
            <ChapterSources sources={text.bellman.sources} lang={lang} />
          </>
        )}
        {active === 'optimality' && (
          <>
            <ChapterPrelude content={text.optimality} />
            <p className="article-copy">{text.optimality.bridge}</p>
            <OptimalitySwitch content={text.optimality} />
            <ChapterSections content={text.optimality} />
            <ChapterSummary content={text.optimality} lang={lang} />
            <ChapterSources sources={text.optimality.sources} lang={lang} />
          </>
        )}
        {active === 'planning' && (
          <>
            <ChapterPrelude content={text.planning} />
            <p className="article-copy">{text.planning.bridge}</p>
            <PlanningLab content={text.planning} />
            <ChapterSections content={text.planning} />
            <ChapterSummary content={text.planning} lang={lang} />
            <ChapterSources sources={text.planning.sources} lang={lang} />
          </>
        )}
        {active === 'ppo' && <PpoLab lang={lang} text={text} />}
        {active === 'rlhf' && <SystemLab lang={lang} text={text} />}
        <footer className="source-note">
          <span>{lang === 'zh' ? '概念依据' : 'Concept sources'}</span>
          <a href="https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning" target="_blank" rel="noreferrer">Mathematical Foundations of Reinforcement Learning</a>
          <a href="https://arxiv.org/abs/1707.06347" target="_blank" rel="noreferrer">Proximal Policy Optimization Algorithms</a>
        </footer>
      </main>

      <RightRail active={active} lang={lang} open={rightOpen} context={rightContext} onToggle={() => setRightOpen((value) => !value)} />
    </div>
  )
}
