import { assertFoundationChapterDefinition } from './schema.js'

const sources = [
  { id: 'rl-book', label: 'Mathematical Foundations of Reinforcement Learning', pages: 'MDP, return, value, and policy foundations', href: 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning' },
  { id: 'instructgpt', label: 'Training language models to follow instructions with human feedback', pages: 'Sections 2–3', href: 'https://arxiv.org/abs/2203.02155' },
]

const zhDerivation = [
  { id: 'state', rule: '先定义 token 决策状态', latex: String.raw`S_t=(x,y_{<t})`, short: '状态包含 prompt 与当前 response 前缀。', detail: '自回归模型下一步的分布由完整可见前缀决定。若截断上下文，真正状态还必须包含截断规则或可见窗口，否则相同表示可能对应不同生成历史。', assumptions: ['tokenizer 与上下文窗口固定'], symbols: [[String.raw`x`, 'prompt token 序列'], [String.raw`y_{<t}`, '已生成前缀']] },
  { id: 'action-policy', rule: '把下一个 token 定义为动作', latex: String.raw`A_t=y_t\sim\pi_\theta(\cdot\mid x,y_{<t})`, short: '词表中的一个 token 是一次离散动作。', detail: 'logits 经 softmax 形成动作概率。temperature、top-k 或 top-p 会改变实际 behavior policy，因此生成时必须记录真正采样分布。', assumptions: ['动作空间是 tokenizer 词表'], symbols: [[String.raw`\pi_\theta`, '语言模型策略']] },
  { id: 'transition', rule: '环境以确定性方式扩展前缀', latex: String.raw`S_{t+1}=(x,y_{\le t})=f(S_t,A_t)`, short: '给定当前前缀和 token，下一状态通常是确定的拼接。', detail: '随机性主要来自策略采样，而不是前缀拼接。工具调用或外部环境会加入额外观测，此时状态转移不再只是字符串拼接。', assumptions: ['纯文本自回归生成'], symbols: [[String.raw`f`, '前缀扩展规则']] },
  { id: 'termination', rule: '用 EOS 或长度边界终止 episode', latex: String.raw`D_{t+1}=\mathbf 1[A_t=\mathrm{EOS}\ \lor\ t+1=T_{\max}]`, short: '一条 response 是一条有限轨迹。', detail: 'EOS 是策略选择的终止动作；长度截断是环境边界。二者对 value bootstrap 和奖励解释不同，训练数据必须保存终止原因。', assumptions: [String.raw`T_{\max}<\infty`], symbols: [[String.raw`D_{t+1}`, '终止标记']] },
  { id: 'reward-return', rule: '把 token 奖励累积成 response return', latex: String.raw`G_t=\sum_{k=t}^{T-1}\gamma^{k-t}R_{k+1}`, short: '序列评分最终必须落到轨迹上的奖励。', detail: '监督 token 奖励、规则奖励、工具结果或完整 response 的偏好分数都可进入 R。只在终点给分会造成稀疏信用分配，value 与 GAE 用于把它传播到前缀。', assumptions: ['奖励与终止 mask 对齐'], symbols: [[String.raw`R_{t+1}`, '动作 y_t 后产生的奖励']] },
]

const enDerivation = [
  { id: 'state', rule: 'Define the token decision state', latex: String.raw`S_t=(x,y_{<t})`, short: 'State contains the prompt and current response prefix.', detail: 'An autoregressive next-token distribution depends on the visible prefix. Context truncation must be part of the state definition or two distinct histories can share one representation.', assumptions: ['fixed tokenizer and context window'], symbols: [[String.raw`x`, 'prompt tokens'], [String.raw`y_{<t}`, 'generated prefix']] },
  { id: 'action-policy', rule: 'Define the next token as the action', latex: String.raw`A_t=y_t\sim\pi_\theta(\cdot\mid x,y_{<t})`, short: 'One vocabulary token is one discrete action.', detail: 'Softmax maps logits to action probabilities. Temperature, top-k, and top-p change the actual behavior policy and must be included in generation provenance.', assumptions: ['action space is the tokenizer vocabulary'], symbols: [[String.raw`\pi_\theta`, 'language-model policy']] },
  { id: 'transition', rule: 'Extend the prefix as the environment transition', latex: String.raw`S_{t+1}=(x,y_{\le t})=f(S_t,A_t)`, short: 'Given prefix and token, the next state is usually deterministic concatenation.', detail: 'Most randomness comes from policy sampling. Tool calls or external observations add environment randomness beyond string concatenation.', assumptions: ['pure autoregressive text generation'], symbols: [[String.raw`f`, 'prefix extension rule']] },
  { id: 'termination', rule: 'Terminate on EOS or a length boundary', latex: String.raw`D_{t+1}=\mathbf 1[A_t=\mathrm{EOS}\ \lor\ t+1=T_{\max}]`, short: 'One response is a finite trajectory.', detail: 'EOS is a policy-chosen termination action; length truncation is an environment boundary. They differ for value bootstrap and must be recorded separately.', assumptions: [String.raw`T_{\max}<\infty`], symbols: [[String.raw`D_{t+1}`, 'termination flag']] },
  { id: 'reward-return', rule: 'Accumulate token rewards into response return', latex: String.raw`G_t=\sum_{k=t}^{T-1}\gamma^{k-t}R_{k+1}`, short: 'Sequence scoring must become rewards on a trajectory.', detail: 'Token supervision, rules, tool outcomes, or a terminal preference score can define R. Terminal-only scores create sparse credit assignment that value and GAE propagate to prefixes.', assumptions: ['reward aligns with terminal masks'], symbols: [[String.raw`R_{t+1}`, 'reward after token action y_t']] },
]

const zhDeepening = [
  {
    id: 'markov-sufficiency', kicker: 'Markov 性重新出现', title: '“前缀是状态”成立的条件是它包含预测下一步所需的全部可见信息',
    paragraphs: ['纯自回归生成中，prompt 与完整前缀足以确定模型的下一 token 分布，前缀扩展也由当前动作确定，因此可构成 Markov 状态。', '若系统有隐藏工具状态、未写入上下文的检索结果、随机解码配置或被截断的早期消息，仅保存可见 token 可能不再充分。此时应扩充状态，而不是假设语言任务天然 Markov。'],
    formulas: [String.raw`p(S_{t+1},R_{t+1}\mid H_t,A_t)=p(S_{t+1},R_{t+1}\mid S_t,A_t)`],
    theorem: { claim: 'Markov 性是状态表示的充分性要求，不是语言历史不存在。', why: '完整历史可以很长；只要当前状态编码了下一步分布所需的信息，条件分布就不再依赖额外历史。', conditions: [String.raw`S_t=\varphi(H_t)\ \text{is sufficient}`] },
    handoff: '状态确定以后，可以明确区分策略随机性、环境转移与终止边界。',
  },
  {
    id: 'reward-placement', kicker: '奖励放在哪里', title: '终局偏好分数、过程奖励与 KL 代价对应不同信用分配',
    paragraphs: ['只在 EOS 给一个 response 分数最接近偏好模型接口，但所有早期 token 共享一个延迟信号。过程奖励可评价格式、工具成功或可验证步骤，信号更密集，却可能引入错误 shaping。', 'KL 代价并不是任务偏好本身，而是相对于参考策略的行为约束。把三者拆开显示，学习者才能看清最终 return 为什么变化。'],
    formulas: [String.raw`R_{t+1}=R_{t+1}^{\mathrm{process}}-\beta\,k_t+\mathbf 1[t=T-1]R^{\mathrm{terminal}}`],
    example: { title: '同一 response 的三种奖励来源', caption: '总 return 相同也可能来自完全不同的学习信号分布。', headers: ['来源', '出现位置', '主要作用'], rows: [['过程奖励', '中间 token', '及时评价局部行为'], ['偏好分数', '最后有效 token', '评价完整回答'], ['KL 代价', '每个 response token', '限制偏离参考策略']] },
    handoff: 'PPO-based RLHF 会把这些奖励与 prefix value 合成为 token advantage。',
  },
  {
    id: 'rollout-record', kicker: '最小数据记录', title: '一条 token trajectory 必须保留动作产生时的策略证据',
    paragraphs: ['每个 token 位置至少要知道 state/prefix、采样 token、旧策略 log-probability、终止标记和奖励。若要做 PPO，还需 value、reference log-probability、mask、advantage 与 return。', '重新对同一文本 tokenize、改变 chat template 或把 prompt token 误纳入 loss，都会破坏“动作—概率—奖励”对应关系。'],
    formulas: [String.raw`\tau=\{(S_t,A_t,\log\pi_{\mathrm{old},t},R_{t+1},D_{t+1})\}_{t=0}^{T-1}`],
    pseudocodeTitle: 'Token-MDP rollout',
    pseudocode: ['将 prompt 编码为初始状态 S₀', '对 t=0,…,Tmax−1：', '  由真实 behavior policy 计算并采样 token Aₜ', '  保存 Aₜ 的 old log-probability 与当前位置 mask', '  扩展前缀得到 Sₜ₊₁，并计算可用过程奖励', '  若采到 EOS 或达到边界，保存终止原因并结束', '完整 response 结束后补入序列评分，并保持 token 位置对齐'],
    handoff: '第 16 章将在这份 trajectory contract 上加入 reward、reference、value 与 PPO 更新。',
  },
]

const enDeepening = [
  {
    id: 'markov-sufficiency', kicker: 'Markov property returns', title: 'A prefix is a state only when it contains all visible information needed for the next step',
    paragraphs: ['In pure autoregressive generation, prompt plus full prefix determines the next-token distribution and the chosen token determines prefix extension.', 'Hidden tool state, omitted retrieval, random decoding configuration, or truncated early messages can break sufficiency. Expand the state instead of assuming language tasks are automatically Markov.'],
    formulas: [String.raw`p(S_{t+1},R_{t+1}\mid H_t,A_t)=p(S_{t+1},R_{t+1}\mid S_t,A_t)`],
    theorem: { claim: 'Markov means sufficient representation, not absence of language history.', why: 'History can be long; the current state must encode what determines the next conditional distribution.', conditions: [String.raw`S_t=\varphi(H_t)\ \text{is sufficient}`] },
    handoff: 'With state defined, policy randomness, environment transition, and termination can be separated.',
  },
  {
    id: 'reward-placement', kicker: 'Where reward lives', title: 'Terminal preference, process reward, and KL cost create different credit assignment',
    paragraphs: ['An EOS-only response score matches a preference-model interface but gives every early token one delayed signal. Process rewards can evaluate tools or verifiable steps sooner, but may introduce incorrect shaping.', 'KL is not task preference; it is behavioral regularization against a reference policy. Displaying each source separately explains changes in total return.'],
    formulas: [String.raw`R_{t+1}=R_{t+1}^{\mathrm{process}}-\beta\,k_t+\mathbf 1[t=T-1]R^{\mathrm{terminal}}`],
    example: { title: 'Three reward sources on one response', caption: 'Equal total return can hide very different signal placement.', headers: ['Source', 'Position', 'Role'], rows: [['Process reward', 'Intermediate token', 'Timely local evaluation'], ['Preference score', 'Final valid token', 'Whole-response evaluation'], ['KL cost', 'Every response token', 'Limit reference drift']] },
    handoff: 'PPO-based RLHF combines these rewards with prefix values into token advantages.',
  },
  {
    id: 'rollout-record', kicker: 'Minimum data record', title: 'A token trajectory must preserve policy evidence from the moment each action was generated',
    paragraphs: ['Every token position needs prefix state, sampled token, old log probability, termination, and reward. PPO additionally needs value, reference probability, masks, advantage, and return.', 'Retokenizing text, changing chat templates, or including prompt tokens in response loss breaks action–probability–reward alignment.'],
    formulas: [String.raw`\tau=\{(S_t,A_t,\log\pi_{\mathrm{old},t},R_{t+1},D_{t+1})\}_{t=0}^{T-1}`],
    pseudocodeTitle: 'Token-MDP rollout',
    pseudocode: ['Encode the prompt as initial state S₀', 'For t=0,…,Tmax−1:', '  Compute and sample token Aₜ from the actual behavior policy', '  Store its old log probability and position mask', '  Extend the prefix to Sₜ₊₁ and compute available process reward', '  On EOS or boundary, store termination reason and stop', 'After completion attach sequence score without changing token alignment'],
    handoff: 'Chapter 16 adds reward, reference, value, and PPO update to this trajectory contract.',
  },
]

export const tokenMdpChapter = assertFoundationChapterDefinition({
  id: 'tokenmdp', sources,
  zh: {
    prerequisite: '前置：MDP、return、策略梯度与 PPO', summaryTitle: '语言模型不是类比成 MDP，而是逐项定义成 token 级决策过程', eyebrow: '语言模型强化学习 · Token MDP', title: '将 response 定义为 token 级强化学习轨迹', intro: '从 prompt 开始，语言模型反复观察当前前缀、选择下一个 token，并把 token 追加到上下文。只有把状态、动作、转移、终止与奖励逐一说明，PPO 中的 old probability、value 和 advantage 才有明确对应对象。', derivationIntro: '先完成从生成过程到 MDP 五要素的严格映射，再讨论偏好奖励与系统实现。', bridge: '本章界定语言生成中的强化学习对象；下一章再加入 reward model、reference model 与分布式 rollout。', experimentIntro: '在下方轨迹实验中逐 token 前进，切换终局奖励、过程奖励与 KL 强度，观察每个位置的 shaped reward、return 与终止原因。', interpretation: '先检查 token 是由哪一个 behavior policy 采样，再检查 reward 放在哪个位置。总分相同并不意味着相同的信用分配，EOS 与长度截断也不能使用同一终止解释。', figure: '交互图 15.1 · Token Trajectory Lab', instruction: '逐 token 选择 response，并调整奖励组成', question: '什么信息必须进入状态和 rollout 记录，才能让 token 级 PPO 数学成立？', derivation: zhDerivation, deepening: zhDeepening,
    prelude: [{ id: 'bridge', kicker: '从经典环境切换对象', title: '网格中的交互结构可以逐项迁移到语言生成', paragraphs: ['MDP 的数学对象没有改变：状态仍概括决策所需信息，动作仍由策略采样，环境仍返回下一状态与奖励。改变的是这些对象在生成过程中的具体含义。', '在语言模型中，状态是 prompt 与已生成前缀，动作是下一个 token，转移是把该 token 追加到上下文。先完成严格映射，才能区分 tokenizer、reward model 和 reference policy 各自位于哪一层。'], formulas: [String.raw`\text{grid cell}\mapsto\text{prefix},\qquad\text{move}\mapsto\text{next token}`] }],
    sections: [{ id: 'sampling-policy', kicker: '行为策略', title: '解码配置改变实际采样分布', paragraphs: ['模型 logits 只是采样前的分数；temperature、top-k 与 top-p 会缩放或截断候选集合，从而产生真正执行的行为策略。', 'PPO 的 old log-probability 必须由这个实际分布计算。若分母使用未经截断的理论 softmax，概率比就不再对应生成该 token 的策略，重要性修正失去统计含义。'], formula: String.raw`b_t(a\mid s)\propto\exp(z_a/\tau)\mathbf 1[a\in\mathcal V_t]` }, { id: 'terminal-vs-truncated', kicker: '终止语义', title: 'EOS 与长度截断代表不同的未来', paragraphs: ['EOS 是策略主动选择结束回答，后续不再存在同一 response 内的动作；长度边界则是外部预算强制停止，模型本身可能仍愿意继续生成。', '把两者都视为真正 terminal 会错误地把截断位置后仍可能存在的价值置零。rollout 必须记录终止原因，value target 才能决定是否继续 bootstrap。'], formula: String.raw`D_t^{\mathrm{EOS}}\neq D_t^{\mathrm{truncation}}` }, { id: 'next', kicker: '下一步', title: 'Token 级轨迹成为 RLHF 的共享数据接口', paragraphs: ['状态、动作、采样概率、reward 位置、mask 与终止原因一旦对齐，reward、reference、value 与 PPO 才能在同一批 token 上组合。', '下一章将在这条轨迹契约上加入不同模型角色和 batch 生命周期，解释在线 RLHF 如何从生成走到更新，再回到新一轮生成。'] }],
    summary: ['状态是 prompt 与可见前缀，动作是下一个 token。', '前缀扩展通常确定，策略采样提供主要随机性。', 'EOS 与长度截断具有不同终止语义。', '奖励放置决定 token 间的信用分配。', 'rollout 必须保存生成时的动作概率与位置对齐证据。'], explorer: {},
  },
  en: {
    prerequisite: 'Prerequisites: MDPs, returns, policy gradient, and PPO', summaryTitle: 'A language model is defined token by token as an MDP, not merely compared to one', eyebrow: 'Language-model reinforcement learning · Token MDP', title: 'Defining a response as a token-level reinforcement-learning trajectory', intro: 'Starting from a prompt, the model observes its prefix, selects a token, and appends it to context. PPO old probability, value, and advantage become meaningful only after state, action, transition, termination, and reward are mapped explicitly.', derivationIntro: 'Complete the five-part MDP mapping before adding preference reward or systems concerns.', bridge: 'This chapter defines the RL objects in generation. The next adds reward, reference, and distributed rollout.', experimentIntro: 'Advance token by token, vary terminal reward, process reward, and KL strength, and inspect shaped reward, return, and termination reason.', interpretation: 'Identify the behavior policy that sampled each token before reading reward placement. Equal total score does not imply equal credit assignment, and EOS differs from length truncation.', figure: 'Interactive Figure 15.1 · Token Trajectory Lab', instruction: 'Build a response token by token and vary reward composition', question: 'What must enter state and rollout records for token-level PPO to be valid?', derivation: enDerivation, deepening: enDeepening,
    prelude: [{ id: 'bridge', kicker: 'Change the objects', title: 'The interaction structure of a grid transfers object by object', paragraphs: ['The MDP mathematics remains fixed: state summarizes decision information, policy samples an action, and the environment returns a successor and reward. The concrete meanings change in generation.', 'For a language model, state is prompt plus generated prefix, action is the next token, and transition appends that token to context. A strict mapping separates tokenizer, reward model, and reference policy roles.'], formulas: [String.raw`\text{grid cell}\mapsto\text{prefix},\qquad\text{move}\mapsto\text{next token}`] }],
    sections: [{ id: 'sampling-policy', kicker: 'Behavior policy', title: 'Decoding configuration changes the actual sampling distribution', paragraphs: ['Model logits are pre-sampling scores. Temperature, top-k, and top-p rescale or truncate candidates and thereby define the behavior policy that actually acts.', 'PPO old log-probability must come from this distribution. Using an untruncated theoretical softmax in the denominator breaks the connection between the ratio and the policy that generated the token.'], formula: String.raw`b_t(a\mid s)\propto\exp(z_a/\tau)\mathbf 1[a\in\mathcal V_t]` }, { id: 'terminal-vs-truncated', kicker: 'Termination semantics', title: 'EOS and length truncation imply different futures', paragraphs: ['EOS is a policy choice to end the response, after which no further action exists within that sequence. A length boundary is an external budget even when the model would continue.', 'Treating both as true terminal incorrectly zeros possible continuation value at truncation. Rollout records need the termination reason so the value target can decide whether to bootstrap.'], formula: String.raw`D_t^{\mathrm{EOS}}\neq D_t^{\mathrm{truncation}}` }, { id: 'next', kicker: 'Next', title: 'The token trajectory becomes RLHF’s shared data interface', paragraphs: ['Once states, actions, sampling probabilities, reward positions, masks, and termination reasons align, reward, reference, value, and PPO can operate on the same token batch.', 'The next chapter adds model roles and a batch lifecycle to this contract, following online RLHF from generation to update and back to fresh generation.'] }],
    summary: ['State is prompt plus visible prefix; action is the next token.', 'Prefix extension is usually deterministic and policy sampling supplies randomness.', 'EOS and length truncation have different semantics.', 'Reward placement defines token credit assignment.', 'Rollout must preserve generation-time probabilities and positional evidence.'], explorer: {},
  },
})

Object.assign(tokenMdpChapter.zh, { eyebrow: '第 15 章 · Token MDP' })
Object.assign(tokenMdpChapter.en, { eyebrow: 'Chapter 15 · Token MDP' })
