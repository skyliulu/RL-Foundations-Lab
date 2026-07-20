import { useEffect, useMemo, useState } from 'react'
import BellmanLab from './components/BellmanLab'
import ChapterShell from './components/ChapterShell'
import ChapterDeepening from './components/ChapterDeepening'
import ClickableDerivation from './components/ClickableDerivation'
import CourseWorldExplorer from './components/CourseWorldExplorer'
import MathFormula from './components/MathFormula'
import MathText from './components/MathText'
import MdpNarrative from './components/MdpNarrative'
import ReturnObservatory from './components/ReturnObservatory'
import OptimalitySwitch from './components/OptimalitySwitch'
import PlanningLab from './components/PlanningLab'
import PpoLab from './components/PpoLab'
import SystemLab from './components/SystemLab'
import LearningLab from './components/LearningLab'
import MonteCarloChapter from './components/MonteCarloChapter'
import TokenMdpLab from './components/TokenMdpLab'
import GitHubRepoBadge from './components/GitHubRepoBadge'
import HomePage from './components/HomePage'
import ModernExtensionLab from './components/ModernExtensionLab'
import { copy } from './content'
import { detectBrowserLanguage, pageMetadata } from './i18n'

const part23Ids = ['approximation', 'td', 'control', 'vfa', 'dqn', 'policygradient', 'actorcritic']
const modernExtensionIds = ['dpo', 'grpo', 'codingrl', 'agentmdp', 'credit']

function ChapterHeader({ chapter, content, prerequisites }) {
  return (
    <header className="chapter-header">
      <span className="chapter-eyebrow">{content.eyebrow}</span>
      <h1><MathText>{content.title}</MathText></h1>
      <p className="chapter-intro"><MathText>{content.intro}</MathText></p>
      <span className="prerequisite">↳ <MathText>{prerequisites}</MathText></span>
    </header>
  )
}

function MdpRail({ lang }) {
  const labels = lang === 'zh'
    ? { loop: '交互闭环', agent: '智能体', environment: '环境', and: '与', markov: 'Markov 性', markovText: '给定当前状态与动作，下一步与更早历史条件独立。' }
    : { loop: 'Interaction loop', agent: 'Agent', environment: 'Environment', and: 'and', markov: 'Markov property', markovText: 'Given the current state and action, the next step is conditionally independent of earlier history.' }
  return (
    <>
      <section className="rail-section">
        <span className="rail-kicker">{labels.loop}</span>
        <MathFormula block className="mdp-loop-formula" latex={String.raw`S_t \xrightarrow{A_t} (R_{t+1},S_{t+1})`} />
        <dl className="mapping-list"><div><dt>{labels.agent}</dt><dd><MathFormula latex={String.raw`\pi(a\mid s)`} /></dd></div><div><dt>{labels.environment}</dt><dd className="rail-math-pair"><MathFormula latex={String.raw`p(s'\mid s,a)`} /><span>{labels.and}</span><MathFormula latex={String.raw`p(r\mid s,a)`} /></dd></div></dl>
      </section>
      <section className="rail-section"><span className="rail-kicker">{labels.markov}</span><MathFormula block className="rail-formula compact mdp-markov-formula" latex={String.raw`p(s'\mid s,a,h)=p(s'\mid s,a)`} /><p><MathText>{labels.markovText}</MathText></p></section>
    </>
  )
}

function BellmanRail({ lang }) {
  return (
    <>
      <section className="rail-section">
        <span className="rail-kicker">{lang === 'zh' ? '状态价值' : 'State value'}</span>
        <h2>Bellman {lang === 'zh' ? '期望方程' : 'expectation equation'}</h2>
        <MathFormula block className="rail-formula" latex={String.raw`V^{\pi}(s)=\mathbb{E}_{\pi,p}[R_{t+1}+\gamma V^{\pi}(S_{t+1})\mid S_t=s]`} />
        <ul className="term-list">
          <li><i className="dot reward-dot" /><span>{lang === 'zh' ? '即时奖励：本步的直接回报' : 'Immediate reward from this step'}</span></li>
          <li><i className="dot gamma-dot" /><span>{lang === 'zh' ? '折扣因子：未来价值的权重' : 'Discount: weight of future value'}</span></li>
          <li><i className="dot future-dot" /><span>{lang === 'zh' ? '后继价值：从下一状态继续计算' : 'Successor value: continue from the next state'}</span></li>
        </ul>
      </section>
      <section className="rail-section observation-rail">
        <span className="rail-kicker">{lang === 'zh' ? '观察提示' : 'What to observe'}</span>
        <ol><li>{lang === 'zh' ? '从黄色禁区旁选择一个状态。' : 'Select a state beside a yellow forbidden cell.'}</li><li>{lang === 'zh' ? '连续更新，观察 +1 如何从蓝色目标向外传播。' : 'Play updates and watch +1 propagate from the blue target.'}</li><li>{lang === 'zh' ? '检查越界动作：状态留在原地，但即时奖励为 −1。' : 'Inspect a boundary action: the state remains in place but the reward is −1.'}</li></ol>
      </section>
    </>
  )
}

function ReturnRail({ lang }) {
  const labels = lang === 'zh'
    ? { return: '单条轨迹的回报', value: '状态价值', distinction: '对象区别', sample: '是随机变量的一次实现；', expectation: '是给定起点后的条件期望。', horizon: '有效时间尺度' }
    : { return: 'Return of one trajectory', value: 'State value', distinction: 'Object distinction', sample: 'is one realization of a random variable;', expectation: 'is its conditional expectation given the start.', horizon: 'Effective horizon' }
  const horizons = [[0.5, 2], [0.9, 10], [0.95, 20]]
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">{labels.return}</span><MathFormula block className="rail-formula compact" latex={String.raw`G_t=\sum_{k=0}^{\infty}\gamma^kR_{t+k+1}`} /><span className="rail-kicker">{labels.value}</span><MathFormula block className="rail-formula compact" latex={String.raw`V^{\pi}(s)=\mathbb{E}[G_t\mid S_t=s]`} /></section>
      <section className="rail-section"><span className="rail-kicker">{labels.distinction}</span><p className="rail-math-copy"><MathFormula latex={String.raw`G_t`} /><span>{labels.sample}</span><MathFormula latex={String.raw`V^{\pi}(s)`} /><span>{labels.expectation}</span></p><dl className="mapping-list">{horizons.map(([gamma, horizon]) => <div key={gamma}><dt><MathFormula latex={String.raw`\gamma=${gamma}`} /></dt><dd className="rail-math-pair"><span>{labels.horizon}</span><MathFormula latex={String.raw`\approx ${horizon}`} /></dd></div>)}</dl></section>
    </>
  )
}

function PlanningRail({ lang }) {
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '最优性算子' : 'Optimality operator'}</span><MathFormula block className="rail-formula compact" latex={String.raw`V_{k+1}(s)=\max_a\mathbb{E}[R+\gamma V_k(s')]`} /><p><MathText>{lang === 'zh' ? '同步与原地更新只改变新值被复用的时机，不改变不动点。' : 'Synchronous and in-place updates change when new values are reused, not the fixed point.'}</MathText></p></section>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '公平比较协议' : 'Fair comparison protocol'}</span><ul className="numbered-notes"><li><b>1</b>{lang === 'zh' ? '同一环境与初始值' : 'Same environment and initialization'}</li><li><b>2</b>{lang === 'zh' ? '同一折扣、随机性与阈值' : 'Same discount, randomness, and threshold'}</li><li><b>3</b>{lang === 'zh' ? '只改变更新顺序' : 'Only update order changes'}</li></ul></section>
    </>
  )
}

function OptimalityRail({ lang }) {
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '右侧变化' : 'Right-hand change'}</span><MathFormula block className="rail-formula compact" latex={String.raw`T^{\pi}V(s)=\sum_a\pi(a\mid s)q_V(s,a)`} /><MathFormula block className="rail-formula compact" latex={String.raw`T^*V(s)=\max_a q_V(s,a)`} /></section>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '关键性质' : 'Key property'}</span><p><MathText>{lang === 'zh' ? '任意概率加权平均都不会超过最大项，因此最大化策略分布等价于选择最大动作价值。' : 'No probability-weighted average can exceed its largest member, so maximizing over policy distributions is equivalent to selecting the largest action value.'}</MathText></p></section>
    </>
  )
}

function PpoRail({ lang }) {
  return (
    <>
      <section className="rail-section"><span className="rail-kicker">PPO-Clip</span><MathFormula block className="rail-formula multiline" latex={String.raw`L^{\mathrm{CLIP}}(\theta)=\widehat{\mathbb{E}}_t\!\left[\min\!\left(r_t\widehat{A}_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\widehat{A}_t\right)\right]`} /><MathFormula block latex={String.raw`r_t=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\mathrm{old}}(a_t\mid s_t)}`} /></section>
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '读图方法' : 'How to read the plane'}</span><ul className="numbered-notes"><li><b><MathFormula latex={String.raw`+`} /></b>{lang === 'zh' ? '优势为正：提高动作概率' : 'Positive advantage: raise probability'}</li><li><b><MathFormula latex={String.raw`-`} /></b>{lang === 'zh' ? '优势为负：降低动作概率' : 'Negative advantage: lower probability'}</li><li><b><MathFormula latex={String.raw`\epsilon`} /></b>{lang === 'zh' ? '越小：更新越保守，也更容易停滞' : 'Smaller: safer updates, but easier to stall'}</li></ul></section>
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
      <section className="rail-section"><span className="rail-kicker">{lang === 'zh' ? '共享证据' : 'Shared evidence'}</span><p><MathText>{lang === 'zh' ? '算法视图和系统视图使用同一个 batch id、seed、样本奖励、advantage 与 ratio。' : 'Algorithm and system views share the same batch id, seed, rewards, advantages, and ratios.'}</MathText></p></section>
    </>
  )
}

function FormulaContextRail({ context, lang }) {
  const labels = lang === 'zh'
    ? { selected: '当前推导行', before: '上一行', detail: '完整解释', assumptions: '成立条件', symbols: '符号' }
    : { selected: 'Selected derivation line', before: 'Previous line', detail: 'Full explanation', assumptions: 'Assumptions', symbols: 'Symbols' }
  return (
    <section className="rail-section formula-context-rail">
      <span className="rail-kicker">{lang === 'zh' ? '公式上下文' : 'Formula context'}</span>
      <h2>{context.title}</h2>
      <p><MathText>{context.body}</MathText></p>
      {context.latex && <><span className="context-label">{labels.selected}</span><MathFormula block className="context-formula" latex={context.latex} /></>}
      {context.beforeLatex && <><span className="context-label">{labels.before}</span><MathFormula block className="context-formula before" latex={context.beforeLatex} /></>}
      {context.detail && <div className="context-detail"><span className="context-label">{labels.detail}</span><p><MathText>{context.detail}</MathText></p></div>}
      {context.assumptions?.length > 0 && <div className="context-detail"><span className="context-label">{labels.assumptions}</span><ul>{context.assumptions.map((item) => <li key={item}>{/\\|[=<>^{}]/.test(item) && !/[\u3400-\u9fff]/.test(item) ? <MathFormula latex={item} /> : <MathText>{item}</MathText>}</li>)}</ul></div>}
      {context.symbols?.length > 0 && <><span className="context-label">{labels.symbols}</span><dl className="mapping-list">{context.symbols.map(([term, value]) => <div key={term}><dt><MathFormula latex={term} /></dt><dd><MathText>{value}</MathText></dd></div>)}</dl></>}
      {context.rows && <dl className="mapping-list">{context.rows.map(([term, value]) => <div key={term}><dt><MathText>{term}</MathText></dt><dd><MathText>{value}</MathText></dd></div>)}</dl>}
    </section>
  )
}

function ChapterGuideRail({ content, lang }) {
  return (
    <section className="rail-section">
      <span className="rail-kicker">{lang === 'zh' ? '本章主问题' : 'Chapter question'}</span>
      <h2>{content.question}</h2>
      <p><MathText>{content.bridge}</MathText></p>
      <span className="rail-kicker">{lang === 'zh' ? '完成后应能解释' : 'After this chapter'}</span>
      <ul className="term-list">{content.summary.slice(0, 3).map((item) => <li key={item}><i className="dot future-dot" /><MathText>{item}</MathText></li>)}</ul>
    </section>
  )
}

function RightRail({ active, lang, open, onToggle, context, content }) {
  return (
    <aside className={`right-rail ${open ? 'is-open' : ''}`}>
      <button type="button" className="right-rail-toggle" aria-expanded={open} onClick={onToggle}>{lang === 'zh' ? '学习工作台' : 'Study workspace'}</button>
      {open && (
        <div className="right-rail-panel">
          <header><span>{lang === 'zh' ? '随当前对象变化' : 'Follows the current object'}</span><button type="button" onClick={onToggle}>{lang === 'zh' ? '收起' : 'Close'}</button></header>
          {context ? <FormulaContextRail context={context} lang={lang} /> : ({ mdp: <MdpRail lang={lang} />, returns: <ReturnRail lang={lang} />, bellman: <BellmanRail lang={lang} />, optimality: <OptimalityRail lang={lang} />, planning: <PlanningRail lang={lang} />, ppo: <PpoRail lang={lang} />, rlhf: <RlhfRail lang={lang} /> }[active] || <ChapterGuideRail content={content} lang={lang} />)}
        </div>
      )}
    </aside>
  )
}

function DepthBand({ lang, active, content }) {
  const items = lang === 'zh'
    ? { mdp: ['场景：先认识网格、目标与禁区', '机制：一次选择怎样引起世界回应', '形式化：何时只看当前信息就足够'], returns: ['先定义：怎样把一串奖励合成长期回报', '再区分：一次结果与所有可能结果的平均', '最后实验：折扣与随机性怎样改变观察'], bellman: ['先回顾：长期回报怎样拆出第一步', '再推导：对可能动作和环境响应取平均', '最后实验：一次更新怎样传播价值信息'], optimality: ['先区分：评价当前策略与寻找最好策略', '再推导：为什么概率加权可化为动作最大值', '最后实验：同一状态中的动作怎样竞争'], planning: ['先求解：把最优方程写成反复更新', '再比较：评估深度如何连接三种算法', '最后实验：用相同计算口径观察收敛'], ppo: ['先建立：Actor、Critic 与优势的分工', '再推导：旧策略概率比与裁剪目标', '最后实验：优势符号怎样改变裁剪方向'], rlhf: ['先映射：token 生成怎样成为序列决策', '再组织：奖励、参考、价值与旧策略角色', '最后实验：同一 batch 怎样穿过完整生命周期'] }
    : { mdp: ['Scene: meet the grid, target, and forbidden cells', 'Mechanism: how one choice makes the world respond', 'Formalize: when current information is sufficient'], returns: ['Define: combine a reward sequence into long-term return', 'Distinguish: one outcome from the average of all outcomes', 'Experiment: vary discount and randomness'], bellman: ['Recall: split the first step from long-term return', 'Derive: average over actions and environment responses', 'Experiment: propagate value with one update'], optimality: ['Separate: evaluating a policy from finding the best one', 'Derive: reduce policy weighting to an action maximum', 'Experiment: let actions compete in one state'], planning: ['Solve: turn the optimal equation into repeated updates', 'Compare: connect three algorithms through evaluation depth', 'Experiment: observe convergence with one compute metric'], ppo: ['Establish: actor, critic, and advantage roles', 'Derive: old-policy ratios and clipping', 'Experiment: see advantage sign change clipping direction'], rlhf: ['Map: token generation to sequential decision making', 'Organize: reward, reference, value, and old-policy roles', 'Experiment: trace one batch through the lifecycle'] }
  const selected = items[active] || [content.prelude[0].title, content.derivation[Math.min(2, content.derivation.length - 1)].rule, content.question]
  return <div className="depth-band">{selected.map((item, index) => <span key={item}><b>{['I', 'II', 'III'][index]}</b>{item}</span>)}</div>
}

function ChapterPrelude({ content }) {
  return (
    <section className="derivation-sequence" aria-label={content.title}>
      {content.prelude.map((step, index) => (
        <article className="derivation-step" key={step.id}>
          <header><span>{String(index + 1).padStart(2, '0')}</span><small><MathText>{step.kicker}</MathText></small></header>
          <h2><MathText>{step.title}</MathText></h2>
          {step.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
          {step.formulas && <div className="derivation-formulas">{step.formulas.map((formula) => <MathFormula block latex={formula} key={formula} />)}</div>}
        </article>
      ))}
    </section>
  )
}

function ChapterSections({ content }) {
  return (
    <section className="chapter-article-sections">
      {content.sections.map((section) => (
        <article key={section.id} className={`chapter-article-section section-${section.id}`}>
          <span><MathText>{section.kicker}</MathText></span>
          <h2><MathText>{section.title}</MathText></h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
          {section.formula && <MathFormula block className="section-formula" latex={section.formula} />}
        </article>
      ))}
    </section>
  )
}

function ChapterSummary({ content, lang }) {
  return (
    <section className="chapter-summary">
      <span>{lang === 'zh' ? '本章收束' : 'Chapter summary'}</span>
      <h2><MathText>{content.summaryTitle || (lang === 'zh' ? '从长期回报到可求解的状态方程' : 'From long-term return to solvable state equations')}</MathText></h2>
      <ul>{content.summary.map((item) => <li key={item}><MathText>{item}</MathText></li>)}</ul>
    </section>
  )
}

function ChapterSources({ sources, lang }) {
  return (
    <section className="chapter-sources">
      <span>{lang === 'zh' ? '来源与延伸阅读' : 'Sources and further reading'}</span>
      <ul>{sources.map((source) => <li key={source.id}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a><small>{source.pages}</small></li>)}</ul>
    </section>
  )
}

export default function App() {
  const [lang, setLang] = useState(detectBrowserLanguage)
  const [active, setActive] = useState('home')
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

  useEffect(() => {
    const metadata = pageMetadata[lang]
    document.documentElement.lang = metadata.htmlLang
    document.title = metadata.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
  }, [lang])

  const content = text[active]

  return (
    <div className={`app-shell ${navCompact ? 'nav-compact' : ''} ${rightOpen ? 'rail-open' : ''}`}>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => setActive('home')}>
          <span className="brand-mark">RL</span><span><strong>{text.brand}</strong><small>{text.lab}</small></span>
        </button>
        <div className="header-actions">
          <GitHubRepoBadge lang={lang} />
          <button type="button" className="language-switch" onClick={() => setLang((value) => value === 'zh' ? 'en' : 'zh')}>{lang === 'zh' ? 'EN' : '中'}</button>
        </div>
      </header>

      <aside className={`left-nav ${navCompact ? 'is-compact' : ''}`}>
        <div className="nav-head"><span className="nav-label">{text.toc}</span><button type="button" className="nav-collapse" aria-expanded={!navCompact} onClick={() => setNavCompact((value) => !value)}>{navCompact ? (lang === 'zh' ? '展开' : 'Expand') : (lang === 'zh' ? '缩进' : 'Collapse')}</button></div>
        <nav>
          <button type="button" className={`home-nav-item ${active === 'home' ? 'active' : ''}`} onClick={() => setActive('home')}>
            <span className="nav-number">⌂</span><span className="nav-copy"><small>{lang === 'zh' ? '课程入口' : 'Course entry'}</small><strong>{lang === 'zh' ? '学习全景' : 'Learning map'}</strong><em>{lang === 'zh' ? '五部分 · 二十一章' : 'Five parts · twenty-one chapters'}</em></span>
          </button>
          {text.chapters.map((item) => (
            <button type="button" key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
              <span className="nav-number">{item.number}</span><span className="nav-copy"><small>{item.kicker}</small><strong>{item.title}</strong><em>{item.subtitle}</em></span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="article-column">
        {active === 'home' ? <HomePage lang={lang} chapters={text.chapters} onSelect={setActive} /> : (
        <ChapterShell>
          <ChapterHeader chapter={chapter} content={content} prerequisites={content.prerequisite || text.prerequisites} />
          <DepthBand lang={lang} active={active} content={content} />
          {active === 'mdp' && (
            <>
              <MdpNarrative sections={text.mdp.learningPath} overview={text.mdp.overview} />
              <ChapterDeepening sections={text.mdp.deepening} lang={lang} />
              <p className="article-copy chapter-transition"><MathText>{text.mdp.experimentIntro}</MathText></p>
              <CourseWorldExplorer lang={lang} content={text.mdp} />
              <p className="article-copy chapter-interpretation"><MathText>{text.mdp.interpretation}</MathText></p>
              <ChapterSummary content={text.mdp} lang={lang} />
              <ChapterSources sources={text.mdp.sources} lang={lang} />
            </>
          )}
        {active === 'returns' && (
          <>
            <ClickableDerivation
              eyebrow={lang === 'zh' ? '完整定义与推导' : 'Complete definition and derivation'}
              title={lang === 'zh' ? '从奖励序列到状态价值' : 'From a reward sequence to state value'}
              intro={lang === 'zh' ? '所有推导行始终保留在正文中。点击任意一行，右侧工作台会解释这一步用了什么变换、为什么成立以及每个符号的含义。' : 'Every derivation line remains in the article. Select one to inspect the transformation, justification, assumptions, and symbols in the right workspace.'}
              steps={text.returns.derivation}
              onSelect={(context) => { setRightContext(context); setRightOpen(true) }}
            />
            <ChapterDeepening sections={text.returns.deepening} lang={lang} />
            <p className="article-copy chapter-transition"><MathText>{text.returns.experimentIntro || text.returns.bridge}</MathText></p>
            <ReturnObservatory lang={lang} content={text.returns} />
            {text.returns.interpretation && <p className="article-copy chapter-interpretation"><MathText>{text.returns.interpretation}</MathText></p>}
            <ChapterSections content={text.returns} />
            <ChapterSummary content={text.returns} lang={lang} />
            <ChapterSources sources={text.returns.sources} lang={lang} />
          </>
        )}
        {active === 'bellman' && (
          <>
            <ClickableDerivation
              eyebrow={lang === 'zh' ? '完整公式推导' : 'Complete mathematical derivation'}
              title={lang === 'zh' ? '从状态价值定义到 Bellman 期望方程' : 'From state-value definition to the Bellman expectation equation'}
              intro={lang === 'zh' ? '等式链完整写在正文中；选择一行只会打开右侧解释，不会隐藏或替换其他推导步骤。' : 'The full equality chain stays in the article. Selecting a line opens its explanation without hiding or replacing any other step.'}
              steps={text.bellman.derivation}
              onSelect={(context) => { setRightContext(context); setRightOpen(true) }}
            />
            <ChapterDeepening sections={text.bellman.deepening} lang={lang} />
            <p className="article-copy chapter-transition"><MathText>{text.bellman.experimentIntro || text.bellman.bridge}</MathText></p>
            <BellmanLab lang={lang} text={text} />
            {text.bellman.interpretation && <p className="article-copy chapter-interpretation"><MathText>{text.bellman.interpretation}</MathText></p>}
            <ChapterSections content={text.bellman} />
            <ChapterSummary content={text.bellman} lang={lang} />
            <ChapterSources sources={text.bellman.sources} lang={lang} />
          </>
        )}
        {active === 'optimality' && (
          <>
            <ClickableDerivation
              eyebrow={lang === 'zh' ? '完整公式推导' : 'Complete mathematical derivation'}
              title={lang === 'zh' ? '从策略加权到 Bellman 最优方程' : 'From policy weighting to the Bellman optimality equation'}
              intro={lang === 'zh' ? '先区分“评价给定策略”和“寻找最好策略”，再逐行说明为什么对策略的最大化可以化成对动作的最大化。' : 'First separate evaluating a given policy from finding the best policy, then derive why maximizing over policies reduces to maximizing over actions.'}
              steps={text.optimality.derivation}
              onSelect={(context) => { setRightContext(context); setRightOpen(true) }}
            />
            <ChapterDeepening sections={text.optimality.deepening} lang={lang} />
            <p className="article-copy chapter-transition"><MathText>{text.optimality.experimentIntro || text.optimality.bridge}</MathText></p>
            <OptimalitySwitch content={text.optimality} />
            {text.optimality.interpretation && <p className="article-copy chapter-interpretation"><MathText>{text.optimality.interpretation}</MathText></p>}
            <ChapterSections content={text.optimality} />
            <ChapterSummary content={text.optimality} lang={lang} />
            <ChapterSources sources={text.optimality.sources} lang={lang} />
          </>
        )}
        {active === 'planning' && (
          <>
            <ClickableDerivation
              eyebrow={lang === 'zh' ? '算法从方程中产生' : 'Algorithms from the equation'}
              title={lang === 'zh' ? '从最优不动点到 VI、PI 与 TPI' : 'From the optimal fixed point to VI, PI, and TPI'}
              intro={lang === 'zh' ? '三种算法不是三套互不相关的公式；它们都在交替执行价值评估与策略改善，只是每轮评估的深度不同。' : 'These are not three unrelated formulas. Each alternates value evaluation and policy improvement, with a different evaluation depth per round.'}
              steps={text.planning.derivation}
              onSelect={(context) => { setRightContext(context); setRightOpen(true) }}
            />
            <ChapterDeepening sections={text.planning.deepening} lang={lang} />
            <p className="article-copy chapter-transition"><MathText>{text.planning.experimentIntro || text.planning.bridge}</MathText></p>
            <PlanningLab content={text.planning} />
            {text.planning.interpretation && <p className="article-copy chapter-interpretation"><MathText>{text.planning.interpretation}</MathText></p>}
            <ChapterSections content={text.planning} />
            <ChapterSummary content={text.planning} lang={lang} />
            <ChapterSources sources={text.planning.sources} lang={lang} />
          </>
        )}
          {active === 'montecarlo' && (
            <>
              <MonteCarloChapter
                content={content}
                lang={lang}
                onSelect={(context) => { setRightContext(context); setRightOpen(true) }}
              />
              <p className="article-copy chapter-interpretation"><MathText>{content.interpretation}</MathText></p>
              <ChapterSections content={content} />
              <ChapterSummary content={content} lang={lang} />
              <ChapterSources sources={content.sources} lang={lang} />
            </>
          )}
          {part23Ids.includes(active) && (
            <>
              <ClickableDerivation
                eyebrow={lang === 'zh' ? '完整概念与公式链' : 'Complete conceptual and mathematical chain'}
                title={content.title}
                intro={content.bridge}
                steps={content.derivation}
                onSelect={(context) => { setRightContext(context); setRightOpen(true) }}
              />
              <ChapterDeepening sections={content.deepening} lang={lang} />
              <p className="article-copy chapter-transition"><MathText>{content.experimentIntro}</MathText></p>
              <LearningLab key={active} id={active} lang={lang} content={content} />
              <p className="article-copy chapter-interpretation"><MathText>{content.interpretation}</MathText></p>
              <ChapterSections content={content} />
              <ChapterSummary content={content} lang={lang} />
              <ChapterSources sources={content.sources} lang={lang} />
            </>
          )}
          {active === 'ppo' && (
            <>
              <ClickableDerivation eyebrow={lang === 'zh' ? '从 Actor–Critic 到 PPO' : 'From Actor–Critic to PPO'} title={lang === 'zh' ? '怎样让一批旧策略样本支持多轮稳定更新？' : 'How can one old-policy batch support stable repeated updates?'} intro={text.ppo.derivationIntro} steps={text.ppo.derivation} onSelect={(context) => { setRightContext(context); setRightOpen(true) }} />
              <ChapterDeepening sections={text.ppo.deepening} lang={lang} />
              <p className="article-copy chapter-transition"><MathText>{text.ppo.experimentIntro}</MathText></p>
              <PpoLab lang={lang} text={text} />
              <p className="article-copy chapter-interpretation"><MathText>{text.ppo.interpretation}</MathText></p>
              <ChapterSections content={text.ppo} />
              <ChapterSummary content={text.ppo} lang={lang} />
              <ChapterSources sources={text.ppo.sources} lang={lang} />
            </>
          )}
          {active === 'tokenmdp' && (
            <>
              <ClickableDerivation eyebrow={lang === 'zh' ? '从语言生成到 MDP 五要素' : 'From generation to the five MDP elements'} title={lang === 'zh' ? '怎样把一条 response 严格定义为 token 轨迹？' : 'How is a response defined rigorously as a token trajectory?'} intro={text.tokenmdp.derivationIntro} steps={text.tokenmdp.derivation} onSelect={(context) => { setRightContext(context); setRightOpen(true) }} />
              <ChapterDeepening sections={text.tokenmdp.deepening} lang={lang} />
              <p className="article-copy chapter-transition"><MathText>{text.tokenmdp.experimentIntro}</MathText></p>
              <TokenMdpLab lang={lang} content={text.tokenmdp} />
              <p className="article-copy chapter-interpretation"><MathText>{text.tokenmdp.interpretation}</MathText></p>
              <ChapterSections content={text.tokenmdp} />
              <ChapterSummary content={text.tokenmdp} lang={lang} />
              <ChapterSources sources={text.tokenmdp.sources} lang={lang} />
            </>
          )}
          {active === 'rlhf' && (
            <>
              <ClickableDerivation eyebrow={text.rlhf.eyebrow} title={text.rlhf.title} intro={text.rlhf.derivationIntro} steps={text.rlhf.derivation} onSelect={(context) => { setRightContext(context); setRightOpen(true) }} />
              <ChapterDeepening sections={text.rlhf.deepening} lang={lang} />
              <p className="article-copy chapter-transition"><MathText>{text.rlhf.experimentIntro}</MathText></p>
              <SystemLab lang={lang} text={text} ppoOnly />
              <p className="article-copy chapter-interpretation"><MathText>{text.rlhf.interpretation}</MathText></p>
              <ChapterSections content={text.rlhf} />
              <ChapterSummary content={text.rlhf} lang={lang} />
              <ChapterSources sources={text.rlhf.sources} lang={lang} />
            </>
          )}
          {modernExtensionIds.includes(active) && (
            <>
              <ClickableDerivation eyebrow={lang === 'zh' ? '完整定义与推导' : 'Complete definition and derivation'} title={content.title} intro={content.derivationIntro || content.bridge} steps={content.derivation} onSelect={(context) => { setRightContext(context); setRightOpen(true) }} />
              <ChapterDeepening sections={content.deepening} lang={lang} />
              <p className="article-copy chapter-transition"><MathText>{content.experimentIntro}</MathText></p>
              <ModernExtensionLab id={active} lang={lang} content={content} />
              <p className="article-copy chapter-interpretation"><MathText>{content.interpretation}</MathText></p>
              <ChapterSections content={content} />
              <ChapterSummary content={content} lang={lang} />
              <ChapterSources sources={content.sources} lang={lang} />
            </>
          )}
        </ChapterShell>
        )}
      </main>

      {active !== 'home' && <RightRail active={active} lang={lang} open={rightOpen} context={rightContext} content={content} onToggle={() => setRightOpen((value) => !value)} />}
    </div>
  )
}
