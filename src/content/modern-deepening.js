const theorem = (claim, why, conditions) => ({ claim, why, conditions })
const example = (title, caption, headers, rows) => ({ title, caption, headers, rows })

export const ppoDeepeningZh = [
  {
    id: 'ratio-to-clipping-cases', kicker: '逐样本读懂裁剪', title: 'PPO 的 min 与 clip 必须按 advantage 符号分四种情况理解',
    paragraphs: ['概率比 r 衡量新策略对旧动作的相对概率。正 advantage 希望 r 增大，但超过 1+ε 后继续增大不再获益；负 advantage 希望 r 减小，但低于 1−ε 后继续减小不再获益。', '另一侧并不裁剪“坏方向”：正 advantage 的 r 过小、负 advantage 的 r 过大仍会降低目标并产生纠正梯度。PPO 因此不是简单把所有 ratio 截到区间，而是截断过度改进的乐观收益。'],
    formulas: [String.raw`\ell_t(\theta)=\min\left(r_t\widehat A_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\widehat A_t\right)`, String.raw`\widehat A_t>0:\ r_t>1+\epsilon\ \text{is capped}`, String.raw`\widehat A_t<0:\ r_t<1-\epsilon\ \text{is capped}`],
    example: example('四个样本的裁剪判断', '令 ε=0.2；先看 advantage 符号，再看对应边界。', ['Advantage', 'Ratio', '结果'], [['+2', '1.35', '在上边界裁剪'], ['+2', '0.70', '不裁剪，保留纠正'], ['−2', '0.70', '在下边界裁剪'], ['−2', '1.35', '不裁剪，保留惩罚']]),
    theorem: theorem('Clipped surrogate 是悲观逐样本下界，不是对最终 KL 的硬约束。', '多个样本共享参数，一个样本的梯度会改变其他样本的概率；最终仍可能出现区间外 ratio。', [String.raw`0<\epsilon<1`, String.raw`\widehat A_t\ \text{fixed during optimization}`]),
    handoff: '要安全复用一批旧数据，还必须说明 advantage、old log-probability 和 minibatch epoch 在何时冻结。',
  },
  {
    id: 'full-objective', kicker: '完整损失', title: '实际 PPO 同时训练 policy 与 value，并用 entropy 保持探索',
    paragraphs: ['裁剪目标只定义 Actor 项。Critic 用 return 或 GAE 对应的 value target 回归；entropy bonus 防止策略过早塌缩。三项共享 rollout，但参数和 stop-gradient 边界不同。', '优势通常在 batch 内标准化，这改变优化尺度但不改变符号排序。value clipping、gradient clipping 和 KL early stop 是额外稳定机制，不能与 policy ratio clipping 混为一件事。'],
    formulas: [String.raw`L(\theta,\phi)=L^{\mathrm{CLIP}}(\theta)-c_v\,\mathbb E[(V_\phi-\widehat R)^2]+c_e\,\mathbb E[\mathcal H(\pi_\theta)]`, String.raw`\widehat A\leftarrow\frac{\widehat A-\operatorname{mean}(\widehat A)}{\operatorname{std}(\widehat A)+\varepsilon_{\mathrm{num}}}`],
    handoff: '完整算法还需要严格区分 rollout 阶段与优化阶段。',
  },
  {
    id: 'ppo-complete-loop', kicker: '完整训练循环', title: 'PPO 在有限 epoch 后刷新 rollout batch',
    paragraphs: ['先复制 θ_old，再用它收集固定长度 rollout，保存 observation、action、reward、done、old log-probability 与 old value。反向计算 GAE 和 value target 后，才将样本打乱做 K 轮 minibatch。', '每次梯度步都重算新 log-probability 与 value，却始终使用保存的 old log-probability、advantage 和 target。K 太大时 ratio、KL 与 clip fraction 上升，旧优势不再代表新策略的数据分布。'],
    formulas: [String.raw`\widehat A_t=\delta_t+\gamma\lambda(1-d_{t+1})\widehat A_{t+1}`, String.raw`\widehat R_t=\widehat A_t+V_{\mathrm{old}}(S_t)`],
    pseudocodeTitle: 'PPO with GAE and minibatch epochs',
    pseudocode: ['复制 θ_old←θ，并用 πθ_old 收集 T 步 rollout', '保存动作、奖励、done、old log-probability 与 old value', '从后向前计算每个位置的 δ、GAE advantage 与 value target', '固定这批 advantage、target 和 old log-probability', '对 K 个 epoch：打乱样本并切成 minibatch', '  重算当前 log-probability/value，计算 clipped policy、value、entropy 三项', '  梯度更新 θ、φ，并监控 KL、clip fraction；随后丢弃 batch 重新采样'],
    handoff: '语言模型使用相同循环，但状态变成 token 前缀、动作变成下一个 token。',
  },
]

export const ppoDeepeningEn = [
  {
    id: 'ratio-to-clipping-cases', kicker: 'Read clipping sample by sample', title: 'PPO min and clip require four cases based on advantage sign',
    paragraphs: ['Ratio measures the new probability of an old sampled action. Positive advantage wants a larger ratio but gains stop above 1+ε; negative advantage wants a smaller ratio but gains stop below 1−ε.', 'The opposite bad direction is not capped. PPO does not clamp every ratio; it caps optimistic benefit from excessive improvement.'],
    formulas: [String.raw`\ell_t(\theta)=\min\left(r_t\widehat A_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\widehat A_t\right)`, String.raw`\widehat A_t>0:\ r_t>1+\epsilon\ \text{is capped}`, String.raw`\widehat A_t<0:\ r_t<1-\epsilon\ \text{is capped}`],
    example: example('Four clipping decisions', 'Let ε=0.2; read advantage sign before the boundary.', ['Advantage', 'Ratio', 'Result'], [['+2', '1.35', 'Capped at upper side'], ['+2', '0.70', 'Not capped; corrective loss remains'], ['−2', '0.70', 'Capped at lower side'], ['−2', '1.35', 'Not capped; penalty remains']]),
    theorem: theorem('The clipped surrogate is a pessimistic per-sample bound, not a hard final-KL constraint.', 'Samples share parameters, so one gradient changes other probabilities and final ratios may remain outside the interval.', [String.raw`0<\epsilon<1`, String.raw`\widehat A_t\ \text{fixed during optimization}`]),
    handoff: 'Safe reuse also requires clear freezing of advantages, old log probabilities, and minibatch epochs.',
  },
  {
    id: 'full-objective', kicker: 'Full loss', title: 'Practical PPO trains policy and value while entropy preserves exploration',
    paragraphs: ['Clipping defines only the actor term. The critic regresses a value target, and entropy discourages premature policy collapse. They share rollout data but have different parameters and stop-gradient boundaries.', 'Advantage normalization changes scale, not sign ordering. Value clipping, gradient clipping, and KL early stopping are additional mechanisms distinct from ratio clipping.'],
    formulas: [String.raw`L(\theta,\phi)=L^{\mathrm{CLIP}}(\theta)-c_v\,\mathbb E[(V_\phi-\widehat R)^2]+c_e\,\mathbb E[\mathcal H(\pi_\theta)]`, String.raw`\widehat A\leftarrow\frac{\widehat A-\operatorname{mean}(\widehat A)}{\operatorname{std}(\widehat A)+\varepsilon_{\mathrm{num}}}`],
    handoff: 'The complete algorithm must separate rollout and optimization phases.',
  },
  {
    id: 'ppo-complete-loop', kicker: 'Complete training loop', title: 'PPO refreshes the rollout batch after a finite number of epochs',
    paragraphs: ['Copy θ_old, collect T steps, and store observations, actions, rewards, done flags, old log probabilities, and old values. Compute GAE and value targets backward before shuffling K minibatch epochs.', 'Every gradient step recomputes current probabilities and values but retains saved old probabilities, advantages, and targets. Too many epochs raise ratio drift, KL, and clip fraction until the old advantage no longer describes the new policy distribution.'],
    formulas: [String.raw`\widehat A_t=\delta_t+\gamma\lambda(1-d_{t+1})\widehat A_{t+1}`, String.raw`\widehat R_t=\widehat A_t+V_{\mathrm{old}}(S_t)`],
    pseudocodeTitle: 'PPO with GAE and minibatch epochs',
    pseudocode: ['Copy θ_old←θ and collect T rollout steps under πθ_old', 'Store actions, rewards, done, old log probabilities, and old values', 'Compute δ, GAE advantages, and value targets backward', 'Freeze advantages, targets, and old log probabilities for this batch', 'For K epochs, shuffle data into minibatches', '  Recompute current log probabilities/value and all three loss terms', '  Update θ and φ, monitor KL and clip fraction, then discard the batch'],
    handoff: 'Language models use the same loop with token prefixes as states and next tokens as actions.',
  },
]

export const rlhfDeepeningZh = [
  {
    id: 'model-provenance', kicker: '生成分布与长期锚点', title: '一次 rollout 需要短期 old 快照，也需要长期冻结的 reference',
    paragraphs: ['当前 policy 从 SFT 权重出发并持续更新。每次收集回答之前，系统复制一份短期 old 快照，用它实际生成这一批 token，并把当时的 log-probability 保存下来；与此同时，reference 通常保留 SFT 权重并在整个 PPO 阶段冻结，用来衡量策略相对原始行为的偏离。', '两者都输出 token 概率，却回答不同问题：old 说明“这条样本从哪里来”，reference 说明“当前策略离长期锚点多远”。若 reference 随每批数据一起刷新，KL 约束会失去固定参照；若让长期 reference 充当 old，PPO 比值的分母又不再等于真实生成概率。Reward model 只对完整回答打分，value model 则学习每个前缀的未来 shaped return，这两个角色也由后续计算需要分别引出。'],
    formulas: [String.raw`\theta_0\leftarrow\theta_{\mathrm{SFT}},\quad\theta_{\mathrm{old}}\leftarrow\theta\ \text{per rollout}`, String.raw`\theta_{\mathrm{ref}}\leftarrow\theta_{\mathrm{SFT}}\ \text{and frozen}`, String.raw`\psi\leftarrow\operatorname{TrainRM}(x,y^+,y^-)`],
    theorem: theorem('PPO ratio 的分母必须对应生成该 token 的策略概率。', '这是重要性修正的数据血缘要求；任何 worker 滞后或 token 对齐错误都会让 ratio 失真。', [String.raw`y_t\sim\pi_{\mathrm{old}}(\cdot\mid x,y_{<t})`, String.raw`\log\pi_{\mathrm{old},t}\ \text{stored at generation}`]),
    handoff: '模型角色明确后，下一步是把序列级偏好分数分配到 token 轨迹。',
  },
  {
    id: 'sequence-to-token-reward', kicker: '序列分数进入 token 轨迹', title: '终局偏好分数与逐 token KL 共同形成 shaped reward',
    paragraphs: ['Reward model 必须读完整个 prompt-response 才能判断偏好，因此它的序列分数只在有效回答结束位置加入轨迹；reference KL 则能在每个已采样 token 上由 policy/reference 的 log-probability 差计算，形成沿途代价。两者相加后，前面的 token 通过 return 和 GAE 接收到终局偏好，同时每一步都立即承担偏离 reference 的成本。', '例如一条三 token 回答得到 2.0 的终局偏好，而三个位置的 KL 代价为 −0.1、−0.2、−0.1，那么 shaped reward 依次为 −0.1、−0.2、1.9。这个计算依赖正确的 response mask 和结束位置；若 padding、EOS 或长度截断错位，训练就可能奖励格式或长度，而不是回答质量。'],
    formulas: [String.raw`r_t^{\mathrm{KL}}=-\beta\left(\log\pi_\theta(y_t\mid s_t)-\log\pi_{\mathrm{ref}}(y_t\mid s_t)\right)`, String.raw`r_t=r_t^{\mathrm{KL}}+\mathbf 1[t=T-1]r_\psi(x,y)`],
    example: example('一条三 token response 的 shaped reward', '终局偏好分数为 2.0，逐 token KL 代价分别为 −0.1、−0.2、−0.1。', ['位置', 'KL 代价', '最终 token reward'], [['token 1', '−0.1', '−0.1'], ['token 2', '−0.2', '−0.2'], ['token 3 / EOS', '−0.1', '1.9']]),
    handoff: 'GAE 再把这条 shaped reward 序列与 prefix value 合成为逐 token advantage。',
  },
  {
    id: 'batch-contract-and-failures', kicker: '完整更新循环', title: '同一 token 位置必须贯穿生成、打分、GAE 与 PPO 更新',
    paragraphs: ['一条可训练样本至少保存 prompt/response token、attention mask、response mask、终止原因、old/reference log-probability、old value、token reward、advantage、return 和模型版本。Reference 与 reward model 可以在生成后批量前向，但必须复用同一 tokenization；只有 response 的有效位置进入 policy loss。', '这些字段也给故障定位提供了因果线索：reward 上升而 KL 失控，通常要检查约束强度和 reward hacking；value loss 爆炸时，应先检查终止 mask 与奖励尺度；ratio 异常则常来自 worker 权重滞后或 token 重算不一致。完整循环因此不是把五个模型接在一起，而是让每个阶段都读写同一份可核对的样本证据。'],
    formulas: [String.raw`\mathcal B_t=(y_t,m_t,\log\pi_{\mathrm{old},t},\log\pi_{\mathrm{ref},t},V_{\mathrm{old},t},r_t,\widehat A_t,\widehat R_t)`, String.raw`L_{\mathrm{policy}}=\frac{\sum_t m_t\ell_t}{\sum_t m_t}`],
    pseudocodeTitle: 'One PPO-based RLHF iteration',
    pseudocode: ['冻结本轮 old policy；rollout workers 生成 response 并保存 token 证据', 'Reference 与 reward model 对同一 tokenization 批量前向打分', '构造逐 token KL 代价，并在有效终点加入序列 reward', 'Value model 为每个有效 prefix 产生 old value', '按终止 mask 反向计算 GAE advantage 与 return', '固定 batch，执行有限 PPO minibatch epoch 更新 policy/value', '发布新 policy 到 workers；记录 reward、KL、clip、value、长度与吞吐诊断'],
    handoff: '这一闭环把第 15 章的 token MDP 与第 14 章的 PPO 组合成完整后训练系统。',
  },
]

export const rlhfDeepeningEn = [
  {
    id: 'model-provenance', kicker: 'Generating distribution and long-lived anchor', title: 'A rollout needs both a short-lived old snapshot and a frozen reference',
    paragraphs: ['The current policy starts from SFT and keeps updating. Before collecting responses, the system copies a short-lived old snapshot, generates the batch with it, and stores generation-time token log-probabilities. The reference normally retains SFT weights throughout PPO and measures drift from the original behavior.', 'Both output probabilities but answer different questions: old identifies where a sample came from, while reference measures distance from a long-lived anchor. Refreshing reference every batch removes that anchor; using the frozen reference as old mismatches the true sampler. Reward scores complete responses, while value learns future shaped return at each prefix because later computations require those separate roles.'],
    formulas: [String.raw`\theta_0\leftarrow\theta_{\mathrm{SFT}},\quad\theta_{\mathrm{old}}\leftarrow\theta\ \text{per rollout}`, String.raw`\theta_{\mathrm{ref}}\leftarrow\theta_{\mathrm{SFT}}\ \text{and frozen}`, String.raw`\psi\leftarrow\operatorname{TrainRM}(x,y^+,y^-)`],
    theorem: theorem('The PPO denominator must be the probability from the policy that generated that token.', 'This is the provenance requirement for importance correction; worker lag or token misalignment corrupts the ratio.', [String.raw`y_t\sim\pi_{\mathrm{old}}(\cdot\mid x,y_{<t})`, String.raw`\log\pi_{\mathrm{old},t}\ \text{stored at generation}`]),
    handoff: 'With model roles clear, a sequence preference score must be assigned to the token trajectory.',
  },
  {
    id: 'sequence-to-token-reward', kicker: 'Sequence score enters the token trajectory', title: 'Terminal preference and token KL jointly define shaped reward',
    paragraphs: ['The reward model must read the complete response, so its sequence score enters at the valid endpoint. Policy/reference log-probability differences provide KL cost at every sampled token. Return and GAE propagate terminal preference backward while every step immediately pays for drift.', 'For a three-token response with terminal preference 2.0 and KL costs −0.1, −0.2, and −0.1, shaped rewards are −0.1, −0.2, and 1.9. This depends on correct response masks and endpoints; misaligned padding, EOS, or truncation can reward format or length instead of answer quality.'],
    formulas: [String.raw`r_t^{\mathrm{KL}}=-\beta\left(\log\pi_\theta(y_t\mid s_t)-\log\pi_{\mathrm{ref}}(y_t\mid s_t)\right)`, String.raw`r_t=r_t^{\mathrm{KL}}+\mathbf 1[t=T-1]r_\psi(x,y)`],
    example: example('Shaped reward for a three-token response', 'Terminal preference is 2.0; token KL costs are −0.1, −0.2, and −0.1.', ['Position', 'KL cost', 'Final token reward'], [['Token 1', '−0.1', '−0.1'], ['Token 2', '−0.2', '−0.2'], ['Token 3 / EOS', '−0.1', '1.9']]),
    handoff: 'GAE combines this shaped reward sequence with prefix values into token advantages.',
  },
  {
    id: 'batch-contract-and-failures', kicker: 'Complete update loop', title: 'The same token position must survive generation, scoring, GAE, and PPO update',
    paragraphs: ['A trainable sample stores prompt/response tokens, attention and response masks, termination reason, old/reference log-probabilities, old value, token reward, advantage, return, and model versions. Reference and reward may run later, but they must reuse identical tokenization; only valid response positions enter policy loss.', 'The contract also localizes failures. Rising reward with runaway KL suggests weak regularization or reward hacking; exploding value loss suggests terminal masks or scale; abnormal ratios suggest stale workers or inconsistent token recomputation. The loop is not merely five connected models: every stage must read and write one auditable sample record.'],
    formulas: [String.raw`\mathcal B_t=(y_t,m_t,\log\pi_{\mathrm{old},t},\log\pi_{\mathrm{ref},t},V_{\mathrm{old},t},r_t,\widehat A_t,\widehat R_t)`, String.raw`L_{\mathrm{policy}}=\frac{\sum_t m_t\ell_t}{\sum_t m_t}`],
    pseudocodeTitle: 'One PPO-based RLHF iteration',
    pseudocode: ['Freeze old policy and let rollout workers generate token evidence', 'Run reference and reward models on exactly the same tokenization', 'Build token KL costs and add sequence reward at the valid endpoint', 'Produce old prefix values with the value model', 'Compute GAE advantages and returns backward with terminal masks', 'Run finite PPO minibatch epochs on the fixed batch', 'Publish policy weights and record reward, KL, clip, value, length, and throughput'],
    handoff: 'This loop combines the token MDP of Chapter 15 with PPO from Chapter 14.',
  },
]
