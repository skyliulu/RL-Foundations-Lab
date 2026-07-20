import { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import shellShot from '../output/design-audit/2026-07-19-layout-and-derivation/01-reading-shell.png'
import returnShot from '../output/design-audit/2026-07-19-layout-and-derivation/02-return-canvas.png'
import bellmanShot from '../output/design-audit/2026-07-19-layout-and-derivation/03-bellman-reading-and-canvas.png'
import './review.css'

const chapters = [
  ['01', 'MDP'],
  ['02', '回报'],
  ['03', 'Bellman'],
  ['04', '最优性'],
  ['05', '规划'],
  ['13', 'PPO'],
  ['14', 'LLM'],
]

const contextCopy = {
  reading: {
    kicker: '阅读定位',
    title: 'Bellman 方程从哪里来？',
    body: '当前位于“从 Return 到条件期望”。右侧只保留本段需要的前置定义与章节位置。',
    rows: [['前置', 'Return 与状态价值'], ['当前位置', '03 / 05'], ['下一步', '展开即时奖励项']],
  },
  formula: {
    kicker: '公式上下文',
    title: '当前选中：γ',
    body: '折扣因子决定后继价值的权重，但不改变概率分布本身。点击公式中的其他符号可切换解释。',
    rows: [['定义域', '0 ≤ γ < 1'], ['课程默认', 'γ = 0.9'], ['数值作用', '未来项 × 0.9']],
  },
  lab: {
    kicker: '实验上下文',
    title: '当前状态：s₈',
    body: '这次 backup 从四个动作枚举后继状态；右栏解释当前选择，而不是重复整章结论。',
    rows: [['策略', 'π(a|s₈)'], ['Target', '0.684'], ['Residual', '0.071']],
  },
}

const steps = [
  {
    label: '定义起点',
    before: 'Vπ(s) = Eπ,p[Gₜ | Sₜ = s]',
    rule: '状态价值的定义',
    after: '从状态 s 出发，对随机回报 Gₜ 取条件期望。',
    why: '先明确被求解的对象。这里还没有使用 Bellman 结构，只是把长期价值定义为回报的平均。',
    assumption: '给定策略 π 与环境转移模型 p。',
    numeric: 'Vπ(s₈) = E[Gₜ | Sₜ = s₈]',
  },
  {
    label: '递归代换',
    before: 'Vπ(s) = Eπ,p[Gₜ | Sₜ = s]',
    rule: '代入 Gₜ = Rₜ₊₁ + γGₜ₊₁',
    after: 'Vπ(s) = Eπ,p[Rₜ₊₁ + γGₜ₊₁ | Sₜ = s]',
    why: '长期回报天然可拆成“眼前一步”与“从下一时刻继续”。这一步把无限时间轴切成可递归的一步。',
    assumption: '折扣回报采用 Gₜ = Σₖ≥0 γᵏRₜ₊ₖ₊₁。',
    numeric: 'Vπ(s₈) = E[Rₜ₊₁ + 0.9Gₜ₊₁ | Sₜ = s₈]',
  },
  {
    label: '期望拆分',
    before: 'E[Rₜ₊₁ + γGₜ₊₁ | Sₜ = s]',
    rule: '条件期望的线性性',
    after: 'E[Rₜ₊₁ | Sₜ=s] + γE[Gₜ₊₁ | Sₜ=s]',
    why: '把即时奖励与未来回报分开，才能分别展开它们依赖的随机变量。γ 是常数，可以移到期望之外。',
    assumption: '相关期望存在；γ 与本次随机采样无关。',
    numeric: 'E[Rₜ₊₁|s₈] + 0.9E[Gₜ₊₁|s₈]',
  },
  {
    label: '枚举一步',
    before: 'E[Rₜ₊₁ + γGₜ₊₁ | Sₜ=s]',
    rule: '全概率公式：枚举动作、后继状态与奖励',
    after: "Σₐπ(a|s) Σₛ′,ᵣ p(s′,r|s,a)[r + γE[Gₜ₊₁|Sₜ₊₁=s′]]",
    why: '策略决定动作分布，环境决定后继状态与奖励分布。两者职责被明确分开。',
    assumption: 'π(a|s) 与 p(s′,r|s,a) 构成完整的一步生成过程。',
    numeric: '0.5×[0+0.9V(s₃)] + 0.25×[0+0.9V(s₇)] + …',
  },
  {
    label: '识别后继价值',
    before: "E[Gₜ₊₁ | Sₜ₊₁=s′, Sₜ=s, Aₜ=a]",
    rule: 'Markov 条件与状态价值定义',
    after: "Vπ(s) = Σₐπ(a|s) Σₛ′,ᵣ p(s′,r|s,a)[r + γVπ(s′)]",
    why: '给定下一状态后，更早的历史不再提供额外信息；括号中的未来期望正是 Vπ(s′)。',
    assumption: '状态表示满足 Markov 性；后续继续遵循同一策略 π。',
    numeric: 'Vπ(s₈) = 0.684；本次 backup residual = 0.071',
  },
]

function SectionTitle({ index, eyebrow, title, body }) {
  return (
    <header className="review-section-title">
      <span>{index}</span>
      <div><small>{eyebrow}</small><h2>{title}</h2><p>{body}</p></div>
    </header>
  )
}

function EvidenceCard({ image, number, title, finding, accent }) {
  return (
    <article className="evidence-card" style={{ '--accent': accent }}>
      <figure><img src={image} alt={title} /></figure>
      <div className="evidence-copy"><span>{number}</span><h3>{title}</h3><p>{finding}</p></div>
    </article>
  )
}

function MiniGrid() {
  const cells = Array.from({ length: 25 }, (_, index) => index + 1)
  return (
    <div className="mini-grid" aria-label="5 乘 5 课程网格世界示意">
      {cells.map((cell) => <span className={cell === 8 ? 'selected' : [7, 13, 17, 22].includes(cell) ? 'blocked' : cell === 18 ? 'goal' : ''} key={cell}><small>s{cell}</small>{cell === 8 && <b>0.68</b>}</span>)}
    </div>
  )
}

function ContextPanel({ mode, selectedSymbol }) {
  const content = mode === 'formula'
    ? { ...contextCopy.formula, title: `当前选中：${selectedSymbol}`, rows: selectedSymbol === 'γ'
      ? contextCopy.formula.rows
      : selectedSymbol === "p(s′,r|s,a)"
        ? [['角色', '环境模型'], ['输入', 's, a'], ['输出', "s′, r 的联合分布"]]
        : [['角色', '后继状态价值'], ['条件', "Sₜ₊₁ = s′"], ['含义', '从下一状态继续']] }
    : contextCopy[mode]
  return (
    <div className="context-panel">
      <span>{content.kicker}</span><h4>{content.title}</h4><p>{content.body}</p>
      <dl>{content.rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    </div>
  )
}

function ReadingShell() {
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightMode, setRightMode] = useState('reading')
  const [focus, setFocus] = useState(false)
  const [symbol, setSymbol] = useState('γ')
  const [activeChapter, setActiveChapter] = useState('03')
  const isRightOpen = rightMode !== 'closed'
  return (
    <div className="shell-review">
      <div className="shell-controls" aria-label="阅读壳状态控制">
        <fieldset><legend>左栏</legend><button className={!leftOpen ? 'active' : ''} onClick={() => setLeftOpen(false)}>缩略 96</button><button className={leftOpen ? 'active' : ''} onClick={() => setLeftOpen(true)}>展开 248</button></fieldset>
        <fieldset><legend>右栏</legend>{[['closed', '收起'], ['reading', '阅读'], ['formula', '公式'], ['lab', '实验']].map(([value, label]) => <button className={rightMode === value ? 'active' : ''} onClick={() => setRightMode(value)} key={value}>{label}</button>)}</fieldset>
        <label><input type="checkbox" checked={focus} onChange={(event) => setFocus(event.target.checked)} />画布聚焦模式</label>
      </div>

      <div className={`reading-shell ${focus ? 'focus' : ''}`}>
        <header><div className="mini-brand"><b>RL</b><span>强化学习原理实验室<small>RL Foundations Lab</small></span></div><span>第 3 章 · Bellman 方程</span><button>中 / EN</button></header>
        {!focus && <nav className="compact-rail">{chapters.map(([number, label]) => <button className={activeChapter === number ? 'active' : ''} onClick={() => setActiveChapter(number)} key={number}><b>{number}</b><span>{label}</span></button>)}</nav>}
        {!focus && leftOpen && <nav className="expanded-rail"><small>学习地图</small>{chapters.map(([number, label]) => <button className={activeChapter === number ? 'active' : ''} onClick={() => setActiveChapter(number)} key={number}><b>{number}</b><span>{label}<em>{number === '03' ? '从一步更新理解长期价值' : '章节学习路径'}</em></span></button>)}</nav>}

        <main>
          <article className="prose-block">
            <span>第 3 章 · 状态价值与 Bellman 方程</span>
            <h3>为什么一步更新能够表达长期价值？</h3>
            <p>Bellman 方程把无限长的时间链切成“下一步奖励”和“下一状态的价值”。正文继续保持舒适行长，而推导和实验按内容需要向两侧突破。</p>
            <div className="formula-line">Vπ(s) = Σₐ π(a|s) Σₛ′,ᵣ <button onClick={() => { setSymbol("p(s′,r|s,a)"); setRightMode('formula') }}>p(s′,r|s,a)</button> [ r + <button onClick={() => { setSymbol('γ'); setRightMode('formula') }}>γ</button><button onClick={() => { setSymbol("Vπ(s′)"); setRightMode('formula') }}>Vπ(s′)</button> ]</div>
          </article>
          <section className="lab-breakout">
            <div className="lab-heading"><div><span>交互画布 / LAB WIDTH</span><h4>一次 Bellman backup 的证据链</h4></div><small>主区优先获得宽度</small></div>
            <div className="lab-body"><div><MiniGrid /><p>选择状态 s₈，查看动作概率如何映射到后继状态。</p></div><div className="action-table"><div><span>动作</span><span>π(a|s₈)</span><span>Target</span></div>{[['↑', '.50', '.72'], ['→', '.25', '.61'], ['↓', '.15', '.54'], ['←', '.10', '.47']].map(row => <div key={row[0]}>{row.map(value => <span key={value}>{value}</span>)}</div>)}</div></div>
          </section>
        </main>

        {!focus && <aside className={`context-dock ${isRightOpen ? 'open' : ''}`}><button className="dock-tab" onClick={() => setRightMode(isRightOpen ? 'closed' : 'reading')}>学习工作台</button>{isRightOpen && <ContextPanel mode={rightMode} selectedSymbol={symbol} />}</aside>}
      </div>
      <div className="width-legend"><span>96px<br />缩略导航</span><span>720–780px 正文 / 880–960px 推导 / 1080–1240px 画布</span><span>52px 入口<br />280px 上下文</span></div>
    </div>
  )
}

function DerivationExplorer() {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState('symbolic')
  const [expanded, setExpanded] = useState(false)
  const current = steps[step]
  const visibleSteps = useMemo(() => expanded ? steps : [current], [expanded, current])
  return (
    <div className="derivation-explorer">
      <div className="derivation-toolbar">
        <div><span>DERIVATION EXPLORER</span><h3>Bellman 期望方程：从定义到一步展开</h3></div>
        <div className="derivation-actions"><button className={mode === 'symbolic' ? 'active' : ''} onClick={() => setMode('symbolic')}>符号形式</button><button className={mode === 'numeric' ? 'active' : ''} onClick={() => setMode('numeric')}>当前数值</button><button onClick={() => setExpanded(value => !value)}>{expanded ? '单步查看' : '展开全部'}</button></div>
      </div>
      <ol className="step-track">{steps.map((item, index) => <li className={index === step ? 'active' : index < step ? 'done' : ''} key={item.label}><button onClick={() => { setStep(index); setExpanded(false) }}><b>{String(index + 1).padStart(2, '0')}</b><span>{item.label}</span></button></li>)}</ol>
      <div className="derivation-stage">
        <section className="derivation-chain">
          {visibleSteps.map((item, index) => <article className="derivation-card" key={item.label}>
            <header><span>{expanded ? `${String(index + 1).padStart(2, '0')} / 05` : `${String(step + 1).padStart(2, '0')} / 05`}</span><strong>{item.label}</strong></header>
            <div className="expression before"><small>改写前</small><p>{mode === 'numeric' ? item.numeric : item.before}</p></div>
            <div className="transformation"><small>本步依据</small><strong>{item.rule}</strong><p>{item.why}</p></div>
            <div className="expression after"><small>{mode === 'numeric' ? '数值落点' : '改写后'}</small><p>{mode === 'numeric' ? item.numeric : item.after}</p></div>
            <div className="assumption"><small>成立条件</small><p>{item.assumption}</p></div>
          </article>)}
          {!expanded && <footer><button disabled={step === 0} onClick={() => setStep(value => Math.max(0, value - 1))}>上一步</button><span>每一步都同时回答“变了什么”和“为什么能这样变”</span><button disabled={step === steps.length - 1} onClick={() => setStep(value => Math.min(steps.length - 1, value + 1))}>下一步</button></footer>}
        </section>
        <aside className="binding-panel">
          <span>右侧工作台 / FORMULA CONTEXT</span><h4>{current.rule}</h4><p>{current.why}</p>
          <dl><div><dt>π(a|s)</dt><dd>策略：给定状态的动作分布</dd></div><div><dt>p(s′,r|s,a)</dt><dd>环境：后继状态与奖励的联合分布</dd></div><div><dt>Vπ(s′)</dt><dd>从后继状态继续遵循 π 的价值</dd></div></dl>
          <div className="binding-map"><MiniGrid /><p><b>s₈</b> 与公式中的 s 双向绑定；切换数值模式只改变代入结果，不改变符号推导。</p></div>
        </aside>
      </div>
    </div>
  )
}

function ReviewApp() {
  return (
    <div className="review-page">
      <header className="review-hero">
        <nav><div className="review-brand"><b>RL</b><span>FOUNDATIONS / LOCAL REVIEW</span></div><span>方向稿 01 · 2026.07</span></nav>
        <div className="hero-grid"><div><span>READING SHELL × DERIVATION</span><h1>让阅读壳退后，<br />让推导与实验成为主角。</h1></div><p>这不是新视觉重做，而是对现有产品骨架的精确升级：保留纸张感和教材脉络，把空间还给正文、公式与网格世界。</p></div>
        <div className="decision-strip"><span>本轮只确认</span><b>01 左栏缩略</b><b>02 右栏职责</b><b>03 推导节奏</b></div>
      </header>

      <main className="review-main">
        <section>
          <SectionTitle index="00" eyebrow="CURRENT EVIDENCE" title="现状成立，但空间与解释链已经到达上限" body="三张截图都来自本地运行版本。问题不是缺少功能，而是主体宽度和解释上下文没有跟随正在学习的对象变化。" />
          <div className="evidence-grid"><EvidenceCard image={shellShot} number="01" title="主体被常驻侧栏挤压" finding="两侧合计占用约 44% 桌面宽度，正文尚可阅读，但复杂实验进入中间列后首先牺牲字号与标签。" accent="#174f82" /><EvidenceCard image={returnShot} number="02" title="画布功能完整，可读性不足" finding="5×5 网格、轨迹表和折扣贡献被压在约 652px 内；继续放大字号只会造成更严重的换行。" accent="#b96d13" /><EvidenceCard image={bellmanShot} number="03" title="推导有起点，缺少中间层" finding="从 Return 到条件期望的方向正确，但课件中的概率展开、Markov 化简和后继价值识别尚未被交互化。" accent="#18776b" /></div>
        </section>

        <section>
          <SectionTitle index="01" eyebrow="RESPONSIVE READING SHELL" title="默认缩略，按上下文展开；展开时不再挤压主体" body="下面不是静态线框。切换左栏、右栏和聚焦模式，直接感受正文与画布获得的空间，以及右栏在三种学习阶段中的职责变化。" />
          <ReadingShell />
        </section>

        <section>
          <SectionTitle index="02" eyebrow="INTERACTIVE DERIVATION" title="公式推导不再只展示结果，而是暴露每一步的理由" body="统一的 Derivation Explorer 同时包含改写前、依据、改写后、成立条件与数值绑定。它先在 Bellman 章节成为黄金切片，再迁移到最优性与规划章节。" />
          <DerivationExplorer />
        </section>

        <section className="recommendation">
          <SectionTitle index="03" eyebrow="DECISION CHECKPOINT" title="建议进入实现的三项默认决策" body="这些决策先解决结构，再扩充课件内容；否则新增推导和实验只会继续挤进已经过载的中间列。" />
          <div className="recommendation-grid"><article><span>01</span><h3>左栏默认 96px</h3><p>保留章节编号、短标题和当前位置。展开到 248px 时使用覆盖层，不改变正文宽度。</p><small>需要确认：短标题是否足够识别章节。</small></article><article><span>02</span><h3>右栏默认 52px</h3><p>从静态摘要改为上下文工作台；仅在阅读定位、符号解释和实验观察时展开到 280px。</p><small>需要确认：是否允许关键步骤自动展开。</small></article><article><span>03</span><h3>推导采用五段对象</h3><p>改写前 → 依据 → 改写后 → 成立条件 → 数值绑定，支持单步、全部与符号/数值切换。</p><small>需要确认：默认单步还是默认展开全部。</small></article></div>
        </section>
      </main>
      <footer className="review-footer"><span>RL Foundations · Local Direction Review</span><p>所有截图与页面资源仅存在于本地仓库。</p></footer>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('review-root')).render(<ReviewApp />)
