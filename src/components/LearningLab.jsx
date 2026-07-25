import { useMemo, useState } from 'react'
import MathFormula from './MathFormula'
import MathText from './MathText'
import { learningLabRunners } from '../engine/learning-labs.js'

const defaults = {
  montecarlo: { episodes: 24, epsilon: 0.2, seed: 20260719, visit: 'first' },
  approximation: { alpha: 0.18, decay: true, noise: 1.4, steps: 48, seed: 20260719 },
  td: { gamma: 0.9, n: 3, value: 2.4, nextValue: 3.1 },
  control: { epsilon: 0.12, alpha: 0.3, seed: 20260719 },
  vfa: { width: 1.2, alpha: 0.24, target: 5 },
  dqn: { replay: 0.7, targetPeriod: 8, steps: 40 },
  policygradient: { theta: 0, selectedStep: 0, alpha: 0.18, baseline: 0.8 },
  actorcritic: { reward: 1, gamma: 0.9, value: 2.2, nextValue: 2.8, actorAlpha: 0.12, criticAlpha: 0.18, ratio: 1 },
}

const scenarioCopy = {
  td: {
    zh: ['共享网格世界轨迹', String.raw`s_1\rightarrow s_2\rightarrow s_2\rightarrow s_7`, '三种 target 读取同一段状态与奖励，只改变等待长度和自举位置。'],
    en: ['Shared grid-world trajectory', String.raw`s_1\rightarrow s_2\rightarrow s_2\rightarrow s_7`, 'All three targets read the same states and rewards; only the wait and bootstrap boundary change.'],
  },
  control: {
    zh: ['悬崖网格环境', String.raw`s_{\mathrm{start}}\rightarrow s_{\mathrm{goal}}`, 'Sarsa 与 Q-learning 在同一悬崖环境训练，差异来自后继动作的选择方式。'],
    en: ['Cliff-grid environment', String.raw`s_{\mathrm{start}}\rightarrow s_{\mathrm{goal}}`, 'Sarsa and Q-learning train in one cliff world; only successor-action selection differs.'],
  },
  vfa: {
    zh: ['网格状态的共享表示', String.raw`s_{11}\leftrightarrow s_{12}\leftrightarrow s_{13}`, '相邻网格状态共享特征，因此一次更新会传播到未被直接采样的邻居。'],
    en: ['Shared representation of grid states', String.raw`s_{11}\leftrightarrow s_{12}\leftrightarrow s_{13}`, 'Neighboring grid states share features, so one update propagates beyond the sampled state.'],
  },
  dqn: {
    zh: ['网格转移进入回放缓冲区', String.raw`\mathcal D=\{(s_t,a_t,r_{t+1},s_{t+1})\}`, '状态先被编码成特征，再以真实转移的形式写入 replay buffer。'],
    en: ['Grid transitions enter replay', String.raw`\mathcal D=\{(s_t,a_t,r_{t+1},s_{t+1})\}`, 'Grid states are encoded as features and stored as observed transitions in replay.'],
  },
  policygradient: {
    zh: ['一条网格策略轨迹', String.raw`s_1\xrightarrow{a_1}s_2\xrightarrow{a_2}s_7\xrightarrow{a_3}s_8`, '选择时间步后，右侧只使用该动作之后的奖励构造梯度权重。'],
    en: ['One grid-policy trajectory', String.raw`s_1\xrightarrow{a_1}s_2\xrightarrow{a_2}s_7\xrightarrow{a_3}s_8`, 'Selecting a step uses only rewards after that action to form its gradient weight.'],
  },
  actorcritic: {
    zh: ['网格中的一步转移', String.raw`s_7\xrightarrow{a=\mathrm{right},\,r=1}s_8`, '同一条转移同时产生 Critic 的价值误差与 Actor 的更新方向。'],
    en: ['One grid transition', String.raw`s_7\xrightarrow{a=\mathrm{right},\,r=1}s_8`, 'The same transition supplies the critic error and the actor update direction.'],
  },
}

const configs = {
  montecarlo: {
    formula: String.raw`Q(s,a)\leftarrow Q(s,a)+\frac{1}{N(s,a)}\left(G-Q(s,a)\right)`,
    controls: [['episodes', 8, 72, 4], ['epsilon', 0, 0.6, 0.05]],
    labels: { zh: ['Episode 数', '探索率 ε'], en: ['Episodes', 'Exploration ε'] },
    metrics: (r, zh) => [[zh ? '价值估计' : 'Value estimate', r.estimate], [zh ? '有效访问' : 'Used visits', r.visits], [zh ? '覆盖率' : 'Coverage', `${(r.coverage * 100).toFixed(0)}%`]],
  },
  approximation: {
    formula: String.raw`w_{k+1}=w_k+\alpha_k\left(X_k-w_k\right)`,
    controls: [['alpha', 0.03, 0.5, 0.01], ['noise', 0, 3, 0.1]],
    labels: { zh: ['固定步长 α', '观测噪声'], en: ['Constant step α', 'Observation noise'] },
    metrics: (r, zh) => [[zh ? '最终估计' : 'Final estimate', r.estimate], [zh ? '真实均值' : 'True mean', r.target], [zh ? '绝对误差' : 'Absolute error', r.error]],
  },
  td: {
    formula: String.raw`G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}+\gamma^nV(S_{t+n})`,
    controls: [['gamma', 0.4, 0.99, 0.01], ['n', 1, 5, 1]],
    labels: { zh: ['折扣 γ', '步数 n'], en: ['Discount γ', 'Steps n'] },
    metrics: (r) => [['TD(0)', r.td], ['n-step', r.nStep], ['Monte Carlo', r.mc]],
  },
  control: {
    formula: String.raw`\text{Sarsa}:Q(S',A')\qquad \text{Q-learning}:\max_a Q(S',a)`,
    controls: [['epsilon', 0.02, 0.5, 0.02], ['alpha', 0.05, 0.8, 0.05]],
    labels: { zh: ['探索率 ε', '步长 α'], en: ['Exploration ε', 'Step size α'] },
    metrics: (r, zh) => [[zh ? 'Sarsa 危险率' : 'Sarsa danger', `${(r.sarsaDanger * 100).toFixed(1)}%`], [zh ? 'Q-learning 危险率' : 'Q-learning danger', `${(r.qDanger * 100).toFixed(1)}%`], [zh ? '目标差' : 'Target gap', r.targetGap]],
  },
  vfa: {
    formula: String.raw`\mathbf w\leftarrow\mathbf w+\alpha\left(U_t-\widehat v(S_t,\mathbf w)\right)\nabla_{\mathbf w}\widehat v(S_t,\mathbf w)`,
    controls: [['width', 0.35, 2.5, 0.05], ['alpha', 0.05, 0.6, 0.01]],
    labels: { zh: ['特征宽度', '步长 α'], en: ['Feature width', 'Step size α'] },
    metrics: (r, zh) => [[zh ? '中心误差' : 'Center error', r.centerError], [zh ? '邻居改变量' : 'Neighbor change', r.spillover], [zh ? '目标值' : 'Target', 5]],
  },
  dqn: {
    formula: String.raw`Y=R+\gamma\max_{a'}Q_{\bar\theta}(S',a'),\qquad\theta\leftarrow\theta-\alpha\nabla_\theta(Y-Q_\theta(S,A))^2`,
    controls: [['replay', 0, 1, 0.05], ['targetPeriod', 2, 20, 1], ['steps', 1, 60, 1]],
    labels: { zh: ['经验回放强度', '目标同步间隔', '当前更新步'], en: ['Replay mixing', 'Target sync period', 'Current update'] },
    metrics: (r, zh) => [[zh ? '样本相关性' : 'Correlation', r.correlation], [zh ? '末段漂移' : 'Late drift', r.drift], [zh ? 'Replay 容量' : 'Replay size', r.replaySize]],
  },
  policygradient: {
    formula: String.raw`\theta\leftarrow\theta+\alpha\,\nabla_\theta\log\pi_\theta(A\mid S)\,(G-b)`,
    controls: [['theta', -2.5, 2.5, 0.1], ['alpha', 0.02, 0.5, 0.02], ['baseline', -2, 2, 0.1]],
    labels: { zh: ['所选状态的动作 logit', '步长 α', '状态基线 b'], en: ['Action logit at selected state', 'Step size α', 'State baseline b'] },
    metrics: (r, zh) => [[zh ? '所选动作：更新前' : 'Selected: before', r.probability], [zh ? '所选动作：更新后' : 'Selected: after', r.nextProbability], [zh ? '基线后梯度方差' : 'Variance with baseline', r.varianceWithBaseline]],
  },
  actorcritic: {
    formula: String.raw`\delta=R+\gamma V_\phi(S')-V_\phi(S),\quad\theta\leftarrow\theta+\alpha_\theta\rho\,\delta\nabla_\theta\log\pi_\theta(A\mid S)`,
    controls: [['reward', -2, 4, 0.1], ['nextValue', -1, 5, 0.1], ['ratio', 0.4, 1.8, 0.05]],
    labels: { zh: ['即时奖励', '后继价值', '重要性比率 ρ'], en: ['Immediate reward', 'Successor value', 'Importance ratio ρ'] },
    metrics: (r, zh) => [[zh ? 'TD error / advantage' : 'TD error / advantage', r.delta], [zh ? 'Critic 更新后' : 'Critic after', r.nextValueEstimate], [zh ? 'Actor 步长' : 'Actor step', r.actorStep]],
  },
}

function format(value) {
  if (value == null || Number.isNaN(value)) return '—'
  if (typeof value === 'string') return value
  if (Number.isInteger(value)) return value
  return Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(3)
}

function TdEvidenceStage({ params, result, zh }) {
  return (
    <div className="td-evidence-stage">
      <section className="td-trajectory-ledger">
        <header><span>{zh ? '轨迹与当前价值表' : 'Trajectory and current value table'}</span><small>{zh ? '自举项直接读取高亮表项' : 'The bootstrap term reads the highlighted table entry'}</small></header>
        <div className="td-value-table">
          {result.valueTable.map((item) => <article className={`${item.time === result.bootstrap.time ? 'is-bootstrap' : ''} ${item.terminal ? 'is-terminal' : ''}`} key={item.time}>
            <b><MathFormula latex={String.raw`S_${item.time}=s_{${item.stateId}}`} /></b>
            <MathFormula latex={String.raw`V(S_${item.time})=${item.estimate.toFixed(2)}`} />
            <small>{item.time === result.bootstrap.time ? (zh ? `${params.n} 步目标从这里自举` : `${params.n}-step target bootstraps here`) : item.terminal ? (zh ? '终止状态价值为零' : 'terminal value is zero') : (zh ? '当前表项' : 'current table entry')}</small>
          </article>)}
        </div>
        <div className="td-tape">
          {result.trajectory.slice(0, -1).map((item) => <div className={item.time < params.n ? 'is-observed' : ''} key={item.time}>
            <b><MathFormula latex={String.raw`S_${item.time}`} /></b>
            <span><MathFormula latex={String.raw`R_${item.time + 1}=${item.rewardToNext}`} /></span>
            <small>{item.time < params.n ? (zh ? '奖励已进入目标' : 'reward included') : (zh ? '尚未等待到此步' : 'not yet observed')}</small>
          </div>)}
        </div>
      </section>
      <section className="td-target-ledger">
        <header><span>{zh ? '三种监督信号' : 'Three target contracts'}</span><small>{zh ? '只改变可用证据范围' : 'Only the evidence horizon changes'}</small></header>
        <div>
          <article><span>TD(0)</span><MathFormula block latex={String.raw`R_1+\gamma V(S_1)`} /><strong>{format(result.td)}</strong><p>{zh ? '一步后立即可用，依赖当前后继估计。' : 'Available after one step; depends on the current successor estimate.'}</p></article>
          <article className="is-focus"><span>{params.n}-step</span><MathFormula block latex={String.raw`\sum_{k=0}^{n-1}\gamma^kR_{k+1}+\gamma^nV(S_n)`} /><strong>{format(result.nStep)}</strong><p>{zh ? `等待 ${params.n} 个奖励，再用价值补全尾部。` : `Waits for ${params.n} rewards, then bootstraps the tail.`}</p></article>
          <article><span>Monte Carlo</span><MathFormula block latex={String.raw`\sum_{k=0}^{T-1}\gamma^kR_{k+1}`} /><strong>{format(result.mc)}</strong><p>{zh ? '等待终点，不依赖当前价值表。' : 'Waits for termination and does not use the current value table.'}</p></article>
        </div>
      </section>
      <section className="td-target-breakdown">
        <header><span>{zh ? `${params.n} 步目标的逐项账本` : `Term-by-term ledger for the ${params.n}-step target`}</span><small>{zh ? '奖励来自轨迹，尾项来自同一张价值表' : 'Rewards come from the trajectory; the tail comes from the displayed table'}</small></header>
        <div>
          {result.rewardContributions.map((item) => <article key={item.step}><span>{zh ? `第 ${item.step} 个奖励` : `Reward ${item.step}`}</span><MathFormula latex={String.raw`\gamma^{${item.step - 1}}R_${item.step}=${item.contribution.toFixed(3)}`} /></article>)}
          <article className="is-bootstrap"><span>{zh ? '自举尾项' : 'Bootstrap tail'}</span><MathFormula latex={String.raw`\gamma^{${params.n}}V(S_${params.n})=${result.bootstrap.contribution.toFixed(3)}`} /><small><MathFormula latex={String.raw`V(S_${params.n})=V(s_{${result.bootstrap.stateId}})=${result.bootstrap.value.toFixed(2)}`} /></small></article>
          <strong><MathFormula latex={String.raw`G_0^{(${params.n})}=${result.nStep.toFixed(3)}`} /></strong>
        </div>
      </section>
    </div>
  )
}

const cliffArrows = { up: '↑', right: '→', down: '↓', left: '←' }

function CliffPolicyMap({ run, grid, label, zh }) {
  const path = new Set(run.path)
  return (
    <figure className="cliff-policy-map">
      <header><span>{label}</span><strong>{zh ? '末 20 回合平均回报' : 'Mean return, last 20'} {format(run.meanReturn)}</strong></header>
      <div style={{ '--cliff-columns': grid.width }}>
        {run.policy.map((action, state) => {
          const row = Math.floor(state / grid.width)
          const isCliff = row === grid.height - 1 && state > grid.start && state < grid.goal
          return <span className={`${isCliff ? 'is-cliff' : ''} ${path.has(state) ? 'is-path' : ''} ${state === grid.start ? 'is-start' : ''} ${state === grid.goal ? 'is-goal' : ''}`} key={state}>
            {state === grid.start ? 'S' : state === grid.goal ? 'G' : isCliff ? '×' : cliffArrows[action]}
          </span>
        })}
      </div>
      <figcaption>{zh ? `训练期坠落 ${run.falls} 次；箭头是学习后的贪心策略。` : `${run.falls} training falls; arrows show the learned greedy policy.`}</figcaption>
    </figure>
  )
}

function ControlEvidenceStage({ result, zh }) {
  const transition = result.transition
  return (
    <div className="control-evidence-stage">
      <section className="control-shared-transition">
        <header><span>{zh ? '同一条经验、同一张冻结 Q 表' : 'Same experience and one frozen Q table'}</span><small>{zh ? '只替换后继动作的读取规则' : 'Only the successor-action readout changes'}</small></header>
        <div className="control-transition-row">
          <b><MathFormula latex={String.raw`S_t=s_{${transition.state}}`} /></b><i>→</i><b><MathFormula latex={String.raw`A_t=\mathrm{right}`} /></b><i>→</i><b><MathFormula latex={String.raw`R_{t+1}=${transition.reward}`} /></b><i>→</i><b><MathFormula latex={String.raw`S_{t+1}=s_{${transition.nextState}}`} /></b>
        </div>
        <p>{zh ? '下面两个 target 都读取同一个 Q snapshot。Sarsa 使用行为策略可能采到的探索动作；Q-learning 在同一行上读取最大值，因此数值差只能来自后继动作规则。' : 'Both targets below read one Q snapshot. Sarsa uses an exploratory action that the behavior policy can sample; Q-learning reads the maximum from the same row, so only the successor-action rule can create a difference.'}</p>
      </section>
      <section className="control-q-snapshot">
        <header><span>{zh ? '冻结的后继状态动作价值' : 'Frozen successor-state action values'}</span><small><MathFormula latex={String.raw`Q_{\mathrm{shared}}(S_{t+1},\cdot)`} /></small></header>
        <div>{result.successorValues.map((item) => <span className={item.action === transition.sarsaNextAction ? 'is-behavior' : item.action === transition.qGreedyAction ? 'is-greedy' : ''} key={item.action}><b>{cliffArrows[item.action]}</b><MathFormula latex={String.raw`${item.value.toFixed(2)}`} /></span>)}</div>
      </section>
      <section className="control-target-comparison">
        <article>
          <span>Sarsa · on-policy</span>
          <MathFormula block latex={String.raw`U_t=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})`} />
          <p><MathFormula latex={String.raw`A_{t+1}=\mathrm{${transition.sarsaNextAction}}`} /> · <strong><MathFormula latex={String.raw`U_t=${result.sarsaTarget.toFixed(2)}`} /></strong></p>
        </article>
        <article>
          <span>Q-learning · off-policy</span>
          <MathFormula block latex={String.raw`U_t=R_{t+1}+\gamma\max_aQ(S_{t+1},a)`} />
          <p><MathFormula latex={String.raw`a^*=\mathrm{${transition.qGreedyAction}}`} /> · <strong><MathFormula latex={String.raw`U_t=${result.qTarget.toFixed(2)}`} /></strong></p>
        </article>
      </section>
      <section className="control-policy-comparison">
        <CliffPolicyMap run={result.sarsa} grid={result.grid} label="Sarsa" zh={zh} />
        <CliffPolicyMap run={result.qLearning} grid={result.grid} label="Q-learning" zh={zh} />
      </section>
    </div>
  )
}

function VfaEvidenceStage({ result, zh }) {
  return (
    <div className="vfa-evidence-stage">
      <section>
        <header><span>{zh ? '一次中心状态样本' : 'One center-state sample'}</span><small>{zh ? '特征重叠决定传播范围' : 'Feature overlap sets propagation'}</small></header>
        <div className="vfa-state-strip">
          {result.features.map((feature, index) => <article key={index} style={{ '--feature': feature }}>
            <span><MathFormula latex={String.raw`s_${index + 1}`} /></span>
            <i><b style={{ width: `${feature * 100}%` }} /></i>
            <small>{zh ? '特征激活' : 'feature'} {feature.toFixed(2)}</small>
            <MathFormula block latex={String.raw`${result.before[index].toFixed(2)}\to${result.after[index].toFixed(2)}`} />
          </article>)}
        </div>
      </section>
      <aside className="vfa-update-ledger">
        <span>{zh ? '共享参数产生的连带变化' : 'Coupled changes from shared parameters'}</span>
        <MathFormula block latex={String.raw`\Delta\widehat v(s')=\alpha\delta\,x(s')^\top x(s)`} />
        <p>{zh ? '中心状态误差' : 'Center residual'} <strong>{format(result.centerError)}</strong></p>
        <p>{zh ? '相邻状态改变量' : 'Neighbor change'} <strong>{format(result.spillover)}</strong></p>
        <p>{zh ? '若特征正交，未访问状态不会变化；特征越宽，证据传播越远，干扰也越强。' : 'Orthogonal features isolate states. Wider features spread evidence farther and increase interference.'}</p>
      </aside>
    </div>
  )
}

function DqnEvidenceStage({ params, result, zh }) {
  const sampledKeys = new Set(result.sampledKeys)
  const trackLength = Math.min(params.targetPeriod, 12)
  const trackPosition = result.lastUpdate.synced
    ? trackLength - 1
    : Math.min(trackLength - 1, Math.floor((result.updatesSinceSync / params.targetPeriod) * trackLength))
  const update = result.lastUpdate
  return (
    <div className="dqn-evidence-stage">
      <section className="dqn-buffer">
        <header><span>Replay buffer</span><small>{zh ? '轨迹顺序被保存，高亮项来自实际抽样' : 'Storage preserves time; highlighted rows were actually sampled'}</small></header>
        <div>{result.buffer.map((item) => <article className={sampledKeys.has(item.key) ? 'is-sampled' : ''} key={item.key}>
          <b>{String(item.time + 1).padStart(2, '0')}</b><MathFormula latex={String.raw`(x=${item.feature},a=${item.action},r=${item.reward},x'=${item.nextFeature})`} /><small>{sampledKeys.has(item.key) ? (zh ? '近期抽中' : 'recently sampled') : (zh ? '留在缓冲区' : 'buffered')}</small>
        </article>)}</div>
      </section>
      <section className="dqn-target-clock">
        <header><span>Target network</span><small>{zh ? `每 ${params.targetPeriod} 次更新同步` : `sync every ${params.targetPeriod} updates`}</small></header>
        <div className="dqn-network-pair">
          <article><span>Online</span><MathFormula block latex={String.raw`\theta=(${result.online.map((value) => value.toFixed(2)).join(',')})`} /><p>{zh ? '每个 minibatch 后变化' : 'changes every minibatch'}</p></article>
          <i>→</i>
          <article><span>Target</span><MathFormula block latex={String.raw`\bar\theta=(${result.target.map((value) => value.toFixed(2)).join(',')})`} /><p>{zh ? '同步之间保持冻结' : 'frozen between syncs'}</p></article>
        </div>
        <div className="dqn-sync-track">{Array.from({ length: trackLength }, (_, index) => <i className={`${index <= trackPosition ? 'is-complete' : ''} ${index === trackPosition ? 'is-current' : ''} ${update.synced && index === trackLength - 1 ? 'is-sync' : ''}`} key={index} />)}</div>
        <p>{zh ? '样本相关性' : 'Sample correlation'} <strong>{format(result.correlation)}</strong> · {zh ? '末段 target 漂移' : 'late target drift'} <strong>{format(result.drift)}</strong></p>
      </section>
      <section className="dqn-update-ledger">
        <header><span>{zh ? `第 ${update.number} 次更新的完整数据流` : `Complete data flow for update ${update.number}`}</span><small>{update.synced ? (zh ? '本步触发目标同步' : 'This update triggers target sync') : (zh ? `距下次同步 ${result.stepsUntilSync} 步` : `${result.stepsUntilSync} updates until sync`)}</small></header>
        <div>
          <article><span>{zh ? '① 抽样转移' : '① Sampled transition'}</span><MathFormula block latex={String.raw`e=(${update.sample.feature},${update.sample.action},${update.sample.reward},${update.sample.nextFeature})`} /><small>{zh ? `缓冲区写入时刻 ${update.sample.time + 1}` : `stored at environment step ${update.sample.time + 1}`}</small></article>
          <article><span>{zh ? '② 冻结目标' : '② Frozen target'}</span><MathFormula block latex={String.raw`Y=${update.sample.reward}+0.9\max Q_{\bar\theta}(x',a')=${update.targetValue.toFixed(3)}`} /><small>{zh ? '只读取目标网络' : 'reads target network only'}</small></article>
          <article><span>{zh ? '③ 时序差分误差' : '③ TD error'}</span><MathFormula block latex={String.raw`\delta=Y-Q_\theta(x,a)=${update.error.toFixed(3)}`} /><small>{zh ? `更新前预测 ${update.prediction.toFixed(3)}` : `prediction before ${update.prediction.toFixed(3)}`}</small></article>
          <article><span>{zh ? '④ 在线网络更新' : '④ Online update'}</span><MathFormula block latex={String.raw`\Delta\theta=(${update.updateVector.map((value) => value.toFixed(3)).join(',')})`} /><small>{update.onlineBefore.map((value) => value.toFixed(2)).join(', ')} → {update.onlineAfter.map((value) => value.toFixed(2)).join(', ')}</small></article>
          <article className={update.synced ? 'is-synced' : ''}><span>{zh ? '⑤ 目标网络时钟' : '⑤ Target clock'}</span><MathFormula block latex={update.synced ? String.raw`\bar\theta\leftarrow\theta` : zh ? String.raw`\bar\theta\ \text{保持冻结}` : String.raw`\bar\theta\ \text{remains frozen}`} /><small>{update.synced ? (zh ? '复制更新后的在线参数' : 'copies updated online parameters') : (zh ? '本步不复制参数' : 'no parameter copy on this update')}</small></article>
        </div>
      </section>
    </div>
  )
}

function PolicyGradientEvidenceStage({ params, result, zh, set }) {
  const actionLabels = zh ? ['上移', '右移', '等待'] : ['Up', 'Right', 'Wait']
  return (
    <div className="pg-evidence-stage">
      <section className="pg-trajectory">
        <header><span>{zh ? '一条轨迹中的逐步梯度贡献' : 'Per-step gradient contributions along one trajectory'}</span><small>{zh ? '每个状态都有自己的动作分布' : 'Every state has its own action distribution'}</small></header>
        <div>{result.stepContributions.map((item) => <button type="button" className={result.selectedStep === item.step ? 'is-selected' : ''} aria-pressed={result.selectedStep === item.step} onClick={() => set('selectedStep', item.step)} key={item.step}>
          <b><MathFormula latex={String.raw`S_${item.step}=s_{${item.stateId}}`} /></b>
          <span><MathFormula latex={String.raw`A_${item.step}=a_${item.actionIndex + 1}`} /></span>
          <span><MathFormula latex={String.raw`G_${item.step}=${item.return}`} /></span>
          <span><MathFormula latex={String.raw`G_${item.step}-b=${item.advantage.toFixed(2)}`} /></span>
          <small><MathFormula latex={String.raw`\lVert\widehat g_${item.step}\rVert=${item.contributionNorm.toFixed(3)}`} /></small>
        </button>)}</div>
      </section>
      <aside className="pg-gradient-ledger">
        <span>{zh ? `状态 s${result.stateIds[result.selectedStep]}：三个动作重新分配概率` : `State s${result.stateIds[result.selectedStep]}: probability redistributes across three actions`}</span>
        <MathFormula block latex={String.raw`\nabla_\theta\log\pi_\theta(A_t\mid S_t)(G_t-b)`} />
        <div className="pg-probability-ledger">
          {result.probabilities.map((probability, index) => (
            <article className={index === result.actionIndex ? 'is-selected' : ''} key={actionLabels[index]}>
              <header>
                <span>{actionLabels[index]}{index === result.actionIndex ? (zh ? '（本次选择）' : ' (sampled)') : ''}</span>
                <strong>{probability.toFixed(3)} → {result.nextProbabilities[index].toFixed(3)}</strong>
              </header>
              <div aria-hidden="true"><i style={{ width: `${probability * 100}%` }} /><b style={{ width: `${result.nextProbabilities[index] * 100}%` }} /></div>
            </article>
          ))}
        </div>
        <p>{result.weight >= 0 ? (zh ? '结果高于基线，所选动作概率上升。' : 'Outcome exceeds baseline, so sampled-action probability rises.') : (zh ? '结果低于基线，所选动作概率下降。' : 'Outcome falls below baseline, so sampled-action probability falls.')}</p>
      </aside>
      <section className="pg-variance-panel">
        <header><span>{zh ? '同一状态上的多轨迹梯度方差' : 'Multi-trajectory gradient variance at the same state'}</span><small>{zh ? '监测所选动作 logit 的梯度坐标' : 'Tracking the selected-action logit coordinate'}</small></header>
        <div className="pg-rollout-ledger">
          <div className="is-head"><b>{zh ? '轨迹' : 'Rollout'}</b><b>{zh ? '采样动作' : 'Sampled action'}</b><b><MathFormula latex={String.raw`G`} /></b><b>{zh ? '无基线贡献' : 'No baseline'}</b><b>{zh ? '减去状态基线' : 'With state baseline'}</b></div>
          {result.rollouts.map((rollout) => <div key={rollout.id}><span>#{rollout.id}</span><span>{actionLabels[rollout.actionIndex]}</span><MathFormula latex={String.raw`${rollout.return.toFixed(2)}`} /><MathFormula latex={String.raw`${rollout.rawContribution.toFixed(3)}`} /><MathFormula latex={String.raw`${rollout.centeredContribution.toFixed(3)}`} /></div>)}
        </div>
        <div className="pg-variance-summary">
          <span>{zh ? '不使用基线' : 'Without baseline'} <strong>{format(result.varianceWithoutBaseline)}</strong></span>
          <i>→</i>
          <span>{zh ? '使用状态基线' : 'With state baseline'} <strong>{format(result.varianceWithBaseline)}</strong></span>
        </div>
      </section>
    </div>
  )
}

function ActorCriticEvidenceStage({ params, result, zh }) {
  const actionLabels = zh ? ['上移', '右移', '等待'] : ['Up', 'Right', 'Wait']
  return (
    <div className="ac-evidence-stage">
      <section className="ac-transition">
        <header><span>{zh ? '一条 transition，两条梯度路径' : 'One transition, two gradient paths'}</span></header>
        <div className="ac-transition-row">
          <article><span><MathFormula latex={String.raw`R_{t+1}`} /></span><strong>{format(params.reward)}</strong></article>
          <i>+</i>
          <article><span><MathFormula latex={String.raw`\gamma V_\phi(S_{t+1})`} /></span><strong>{format(params.gamma * params.nextValue)}</strong></article>
          <i>−</i>
          <article><span><MathFormula latex={String.raw`V_\phi(S_t)`} /></span><strong>{format(params.value)}</strong></article>
          <i>=</i>
          <article className="is-delta"><span><MathFormula latex={String.raw`\delta_t`} /></span><strong>{format(result.delta)}</strong></article>
        </div>
      </section>
      <section className="ac-two-updates">
        <article className="ac-critic-ledger">
          <header><span>Critic</span><small>{zh ? '拟合一步价值目标' : 'Fits the one-step value target'}</small></header>
          <MathFormula block latex={String.raw`\phi\leftarrow\phi+\alpha_v\delta_t\nabla_\phi V_\phi(S_t)`} />
          <div className="ac-before-after">
            <span>{zh ? '更新前价值' : 'Value before'}<strong>{format(result.critic.valueBefore)}</strong></span>
            <i>+</i>
            <span>{zh ? '价值修正量' : 'Value correction'}<strong>{format(result.critic.correction)}</strong></span>
            <i>→</i>
            <span className="is-after">{zh ? '更新后价值' : 'Value after'}<strong>{format(result.critic.valueAfter)}</strong></span>
          </div>
          <p>{zh ? '一步目标' : 'One-step target'} <strong>{format(result.critic.target)}</strong> · <MathFormula latex={String.raw`\delta_t=${result.delta.toFixed(3)}`} /></p>
        </article>
        <article className="ac-actor-ledger">
          <header><span>Actor</span><small>{zh ? '同一误差改变所选动作概率' : 'The same error changes sampled-action probability'}</small></header>
          <MathFormula block latex={String.raw`\theta\leftarrow\theta+\alpha_\pi\rho_t\delta_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)`} />
          <div className="ac-policy-ledger">
            {result.actor.logitsBefore.map((logit, index) => <div className={index === result.actor.actionIndex ? 'is-sampled' : ''} key={actionLabels[index]}>
              <span>{actionLabels[index]}{index === result.actor.actionIndex ? (zh ? '（已采样）' : ' (sampled)') : ''}</span>
              <MathFormula latex={String.raw`h:${logit.toFixed(2)}\to${result.actor.logitsAfter[index].toFixed(2)}`} />
              <MathFormula latex={String.raw`\pi:${result.actor.probabilitiesBefore[index].toFixed(3)}\to${result.actor.probabilitiesAfter[index].toFixed(3)}`} />
            </div>)}
          </div>
          <p>{zh ? '策略更新系数' : 'Policy update coefficient'} <strong>{format(result.actorStep)}</strong> · <MathFormula latex={String.raw`\rho_t=${params.ratio.toFixed(2)}`} /></p>
        </article>
      </section>
    </div>
  )
}

function DedicatedLearningStage({ id, params, result, zh, set }) {
  if (id === 'td') return <TdEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'control') return <ControlEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'vfa') return <VfaEvidenceStage result={result} zh={zh} />
  if (id === 'dqn') return <DqnEvidenceStage params={params} result={result} zh={zh} />
  if (id === 'policygradient') return <PolicyGradientEvidenceStage params={params} result={result} zh={zh} set={set} />
  if (id === 'actorcritic') return <ActorCriticEvidenceStage params={params} result={result} zh={zh} />
  return null
}

export default function LearningLab({ id, lang, content }) {
  const [params, setParams] = useState(defaults[id])
  const zh = lang === 'zh'
  const config = configs[id]
  const result = useMemo(() => learningLabRunners[id](params), [id, params])
  const metrics = config.metrics(result, zh)
  const scenario = scenarioCopy[id]?.[lang]
  const set = (key, value) => setParams((current) => ({ ...current, [key]: value }))
  return (
    <section className={`learning-lab learning-lab-${id}`} aria-label={content.figure}>
      <header className="learning-lab-heading"><div><span>{content.figure}</span><p><MathText>{content.instruction}</MathText></p></div><button type="button" onClick={() => setParams(defaults[id])}>{zh ? '恢复基线' : 'Reset baseline'}</button></header>
      <div className="learning-lab-question"><span>{zh ? '本实验回答' : 'Question'}</span><strong><MathText>{content.question}</MathText></strong></div>
      {scenario && <div className="experiment-environment"><span>{scenario[0]}</span><MathFormula latex={scenario[1]} /><small>{scenario[2]}</small></div>}
      <div className="learning-lab-controls">
        {config.controls.map(([key, min, max, step], index) => <label key={key}><span><MathText>{config.labels[lang][index]}</MathText><output>{format(params[key])}</output></span><input aria-label={config.labels[lang][index]} type="range" min={min} max={max} step={step} value={params[key]} onChange={(event) => set(key, Number(event.target.value))} /></label>)}
        {id === 'montecarlo' && <fieldset><legend>{zh ? '访问协议' : 'Visit protocol'}</legend><div>{['first', 'every'].map((value) => <button type="button" key={value} className={params.visit === value ? 'active' : ''} aria-pressed={params.visit === value} onClick={() => set('visit', value)}>{value === 'first' ? (zh ? '首次访问' : 'First visit') : (zh ? '每次访问' : 'Every visit')}</button>)}</div></fieldset>}
        {id === 'approximation' && <fieldset><legend>{zh ? '步长调度' : 'Step schedule'}</legend><div>{[true, false].map((value) => <button type="button" key={String(value)} className={params.decay === value ? 'active' : ''} aria-pressed={params.decay === value} onClick={() => set('decay', value)}><MathText>{value ? (zh ? '衰减 1/k' : 'Decay 1/k') : (zh ? '固定 α' : 'Constant α')}</MathText></button>)}</div></fieldset>}
      </div>
      <DedicatedLearningStage id={id} params={params} result={result} zh={zh} set={set} />
      <aside className="learning-compact-summary">
        <MathFormula latex={config.formula} />
        <div className="learning-summary-metrics">{metrics.map(([label, value]) => <span key={label}><small><MathText>{label}</MathText></small><strong>{format(value)}</strong></span>)}</div>
      </aside>
      <footer><span>{zh ? '读图提示' : 'Reading cue'}</span><p><MathText>{content.explorer.cue}</MathText></p></footer>
    </section>
  )
}
