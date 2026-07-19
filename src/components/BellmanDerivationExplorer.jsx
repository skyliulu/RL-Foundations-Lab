import { useMemo, useState } from 'react'

const derivationCopy = {
  zh: {
    eyebrow: '交互推导 · DERIVATION EXPLORER',
    title: 'Bellman 期望方程：从定义到一步展开',
    intro: '逐步查看每一次改写使用了什么定义、为什么成立，以及它如何落到当前网格世界。',
    symbolic: '符号形式',
    numeric: '当前数值',
    expand: '展开全部',
    collapse: '单步查看',
    before: '改写前',
    after: '改写后',
    reason: '本步依据',
    assumption: '成立条件',
    bindings: '点击符号，在右侧查看它与策略、环境和画布的对应关系',
    previous: '上一步',
    next: '下一步',
    progress: '每一步都回答“变了什么”和“为什么能这样变”',
    steps: [
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
        why: '策略决定动作分布，环境决定后继状态与奖励分布。两者的职责在这里被明确分开。',
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
    ],
  },
  en: {
    eyebrow: 'Interactive derivation · DERIVATION EXPLORER',
    title: 'Bellman expectation equation: from definition to one-step expansion',
    intro: 'Inspect the rule used by each rewrite, why it is valid, and how the symbols bind to the current Grid World.',
    symbolic: 'Symbolic',
    numeric: 'Current values',
    expand: 'Expand all',
    collapse: 'Single step',
    before: 'Before',
    after: 'After',
    reason: 'Rule used',
    assumption: 'Assumptions',
    bindings: 'Choose a symbol to inspect its policy, environment, and canvas binding in the right workspace',
    previous: 'Previous',
    next: 'Next',
    progress: 'Every step explains both what changed and why the rewrite is valid',
    steps: [
      { label: 'Definition', before: 'Vπ(s) = Eπ,p[Gₜ | Sₜ = s]', rule: 'Definition of state value', after: 'Start in state s and take the conditional expectation of random return Gₜ.', why: 'First identify the object being solved. No Bellman structure has been used yet.', assumption: 'Policy π and environment model p are fixed.', numeric: 'Vπ(s₈) = E[Gₜ | Sₜ = s₈]' },
      { label: 'Substitute recursion', before: 'Vπ(s) = Eπ,p[Gₜ | Sₜ = s]', rule: 'Substitute Gₜ = Rₜ₊₁ + γGₜ₊₁', after: 'Vπ(s) = Eπ,p[Rₜ₊₁ + γGₜ₊₁ | Sₜ = s]', why: 'Return naturally splits into the next reward and the tail beginning one step later.', assumption: 'Gₜ = Σₖ≥0 γᵏRₜ₊ₖ₊₁.', numeric: 'Vπ(s₈) = E[Rₜ₊₁ + 0.9Gₜ₊₁ | Sₜ = s₈]' },
      { label: 'Split expectation', before: 'E[Rₜ₊₁ + γGₜ₊₁ | Sₜ = s]', rule: 'Linearity of conditional expectation', after: 'E[Rₜ₊₁ | Sₜ=s] + γE[Gₜ₊₁ | Sₜ=s]', why: 'Separate the immediate reward from future return so their random dependencies can be expanded.', assumption: 'The expectations exist and γ is constant with respect to the sample.', numeric: 'E[Rₜ₊₁|s₈] + 0.9E[Gₜ₊₁|s₈]' },
      { label: 'Enumerate one step', before: 'E[Rₜ₊₁ + γGₜ₊₁ | Sₜ=s]', rule: 'Law of total probability over actions, successors, and rewards', after: "Σₐπ(a|s) Σₛ′,ᵣ p(s′,r|s,a)[r + γE[Gₜ₊₁|Sₜ₊₁=s′]]", why: 'The policy supplies the action distribution; the environment supplies successor and reward probabilities.', assumption: 'π(a|s) and p(s′,r|s,a) define the complete one-step process.', numeric: '0.5×[0+0.9V(s₃)] + 0.25×[0+0.9V(s₇)] + …' },
      { label: 'Recognize value', before: "E[Gₜ₊₁ | Sₜ₊₁=s′, Sₜ=s, Aₜ=a]", rule: 'Markov property and the state-value definition', after: "Vπ(s) = Σₐπ(a|s) Σₛ′,ᵣ p(s′,r|s,a)[r + γVπ(s′)]", why: 'Given the next state, earlier history adds no information; the remaining expectation is Vπ(s′).', assumption: 'The state is Markov and future actions continue under π.', numeric: 'Vπ(s₈) = 0.684; backup residual = 0.071' },
    ],
  },
}

const symbolContext = {
  gamma: {
    symbol: 'γ',
    zh: { title: '折扣因子 γ', body: 'γ 决定后继价值在当前 target 中的权重，但不会改变策略或环境的概率分布。', rows: [['定义域', '0 ≤ γ < 1'], ['课件默认', 'γ = 0.90'], ['画布绑定', '未来价值项 × γ']] },
    en: { title: 'Discount factor γ', body: 'γ weights successor value in the current target without changing policy or transition probabilities.', rows: [['Domain', '0 ≤ γ < 1'], ['Course default', 'γ = 0.90'], ['Canvas binding', 'future value × γ']] },
  },
  policy: {
    symbol: 'π(a|s)',
    zh: { title: '策略分布 π(a|s)', body: '策略只负责在给定状态下产生动作分布；它不决定动作之后会到达哪里。', rows: [['输入', '当前状态 s'], ['输出', '动作概率'], ['画布绑定', '动作贡献的外层权重']] },
    en: { title: 'Policy distribution π(a|s)', body: 'The policy supplies action probabilities in a state; it does not decide the successor.', rows: [['Input', 'current state s'], ['Output', 'action probabilities'], ['Canvas binding', 'outer action weights']] },
  },
  transition: {
    symbol: "p(s′,r|s,a)",
    zh: { title: '环境模型 p(s′,r|s,a)', body: '环境在状态与动作给定后，联合产生下一状态和即时奖励。', rows: [['输入', 's, a'], ['输出', 's′, r 的联合分布'], ['画布绑定', '后继格与奖励']] },
    en: { title: 'Environment model p(s′,r|s,a)', body: 'Given a state and action, the environment jointly produces the next state and reward.', rows: [['Input', 's, a'], ['Output', 'joint distribution of s′, r'], ['Canvas binding', 'successor cell and reward']] },
  },
  successor: {
    symbol: "Vπ(s′)",
    zh: { title: '后继状态价值 Vπ(s′)', body: '从下一状态继续遵循同一策略时，剩余长期回报的条件期望。', rows: [['条件', 'Sₜ₊₁ = s′'], ['策略', '继续遵循 π'], ['画布绑定', '后继格当前 value']] },
    en: { title: 'Successor value Vπ(s′)', body: 'Expected remaining return when the same policy continues from the next state.', rows: [['Condition', 'Sₜ₊₁ = s′'], ['Policy', 'continue under π'], ['Canvas binding', 'current value of successor']] },
  },
}

function SymbolBindings({ lang, onOpenContext }) {
  const labels = lang === 'zh' ? ['策略', '环境', '折扣', '后继价值'] : ['policy', 'environment', 'discount', 'successor value']
  const keys = ['policy', 'transition', 'gamma', 'successor']
  return (
    <div className="derivation-bindings">
      {keys.map((key, index) => (
        <button type="button" key={key} onClick={() => onOpenContext(symbolContext[key])}>
          <span>{symbolContext[key].symbol}</span><small>{labels[index]}</small>
        </button>
      ))}
    </div>
  )
}

function DerivationCard({ item, index, total, mode, labels }) {
  return (
    <article className="live-derivation-card">
      <header><span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><strong>{item.label}</strong></header>
      <div className="live-expression before"><small>{labels.before}</small><p>{mode === 'numeric' ? item.numeric : item.before}</p></div>
      <div className="live-transformation"><small>{labels.reason}</small><strong>{item.rule}</strong><p>{item.why}</p></div>
      <div className="live-expression after"><small>{mode === 'numeric' ? labels.numeric : labels.after}</small><p>{mode === 'numeric' ? item.numeric : item.after}</p></div>
      <div className="live-assumption"><small>{labels.assumption}</small><p>{item.assumption}</p></div>
    </article>
  )
}

export default function BellmanDerivationExplorer({ lang, onOpenContext }) {
  const labels = derivationCopy[lang]
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState('symbolic')
  const [expanded, setExpanded] = useState(false)
  const visibleSteps = useMemo(() => expanded ? labels.steps : [labels.steps[step]], [expanded, labels.steps, step])

  return (
    <section className="live-derivation-explorer">
      <header className="live-derivation-heading">
        <div><span>{labels.eyebrow}</span><h2>{labels.title}</h2><p>{labels.intro}</p></div>
        <div className="live-derivation-modes">
          <button type="button" className={mode === 'symbolic' ? 'active' : ''} onClick={() => setMode('symbolic')}>{labels.symbolic}</button>
          <button type="button" className={mode === 'numeric' ? 'active' : ''} onClick={() => setMode('numeric')}>{labels.numeric}</button>
          <button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? labels.collapse : labels.expand}</button>
        </div>
      </header>

      <ol className="live-derivation-track">
        {labels.steps.map((item, index) => (
          <li className={index === step ? 'active' : index < step ? 'done' : ''} key={item.label}>
            <button type="button" onClick={() => { setStep(index); setExpanded(false) }}><b>{String(index + 1).padStart(2, '0')}</b><span>{item.label}</span></button>
          </li>
        ))}
      </ol>

      <div className="live-derivation-body">
        <div className="live-derivation-chain">
          {visibleSteps.map((item, index) => <DerivationCard key={item.label} item={item} index={expanded ? index : step} total={labels.steps.length} mode={mode} labels={labels} />)}
          {!expanded && <footer><button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>{labels.previous}</button><span>{labels.progress}</span><button type="button" disabled={step === labels.steps.length - 1} onClick={() => setStep((value) => Math.min(labels.steps.length - 1, value + 1))}>{labels.next}</button></footer>}
        </div>
        <aside className="live-binding-panel"><span>{labels.bindings}</span><SymbolBindings lang={lang} onOpenContext={(context) => onOpenContext(context[lang])} /></aside>
      </div>
    </section>
  )
}
