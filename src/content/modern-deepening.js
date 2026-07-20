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
    id: 'ppo-complete-loop', kicker: '完整训练循环', title: 'PPO 为什么只能在有限 epoch 后丢弃旧 batch 并重新 rollout？',
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
    id: 'ppo-complete-loop', kicker: 'Complete training loop', title: 'Why must PPO discard an old batch after finite epochs and roll out again?',
    paragraphs: ['Copy θ_old, collect T steps, and store observations, actions, rewards, done flags, old log probabilities, and old values. Compute GAE and value targets backward before shuffling K minibatch epochs.', 'Every gradient step recomputes current probabilities and values but retains saved old probabilities, advantages, and targets. Too many epochs raise ratio drift, KL, and clip fraction until the old advantage no longer describes the new policy distribution.'],
    formulas: [String.raw`\widehat A_t=\delta_t+\gamma\lambda(1-d_{t+1})\widehat A_{t+1}`, String.raw`\widehat R_t=\widehat A_t+V_{\mathrm{old}}(S_t)`],
    pseudocodeTitle: 'PPO with GAE and minibatch epochs',
    pseudocode: ['Copy θ_old←θ and collect T rollout steps under πθ_old', 'Store actions, rewards, done, old log probabilities, and old values', 'Compute δ, GAE advantages, and value targets backward', 'Freeze advantages, targets, and old log probabilities for this batch', 'For K epochs, shuffle data into minibatches', '  Recompute current log probabilities/value and all three loss terms', '  Update θ and φ, monitor KL and clip fraction, then discard the batch'],
    handoff: 'Language models use the same loop with token prefixes as states and next tokens as actions.',
  },
]

export const rlhfDeepeningZh = [
  {
    id: 'model-provenance', kicker: '模型来源与冻结关系', title: 'Policy、old、reference、reward 与 value 不只是五个名字，而是五种数据血缘',
    paragraphs: ['Policy 通常从 SFT 初始化并持续更新；old 是每轮 rollout 时 policy 的短期快照；reference 常由同一 SFT 模型复制并长期冻结；reward 来自独立偏好比较训练；value 可从 policy/SFT 权重初始化，但使用回报回归更新。', 'old 用于统计上正确的 PPO ratio，reference 用于行为约束。把二者合并会让 KL 锚点随每轮更新漂移，改变正则目标；反过来用长期 reference 充当 old，又会使 ratio 与真实采样分布不匹配。'],
    formulas: [String.raw`\theta_0\leftarrow\theta_{\mathrm{SFT}},\quad\theta_{\mathrm{old}}\leftarrow\theta\ \text{per rollout}`, String.raw`\theta_{\mathrm{ref}}\leftarrow\theta_{\mathrm{SFT}}\ \text{and frozen}`, String.raw`\psi\leftarrow\operatorname{TrainRM}(x,y^+,y^-)`],
    theorem: theorem('PPO ratio 的分母必须对应生成该 token 的策略概率。', '这是重要性修正的数据血缘要求；任何 worker 滞后或 token 对齐错误都会让 ratio 失真。', [String.raw`y_t\sim\pi_{\mathrm{old}}(\cdot\mid x,y_{<t})`, String.raw`\log\pi_{\mathrm{old},t}\ \text{stored at generation}`]),
    handoff: '模型角色明确后，下一步是把序列级偏好分数分配到 token 轨迹。',
  },
  {
    id: 'sequence-to-token-reward', kicker: '奖励整形', title: '序列级 reward 为什么通常放在最后一个有效 token，而 KL 代价逐 token 产生？',
    paragraphs: ['Reward model 读取完整 prompt-response 才能给出序列分数，因此最自然的 MDP 实现是在 EOS 或截断位置注入终局奖励。Reference KL 可在每个已采样 token 上由 log-probability 差估计，因此形成稠密代价。', '总 return 会把终局偏好向前传播，而逐 token KL 立即惩罚每一步偏离。若 padding mask、EOS 位置或长度惩罚处理错误，模型可能优化格式和长度而非偏好。'],
    formulas: [String.raw`r_t^{\mathrm{KL}}=-\beta\left(\log\pi_\theta(y_t\mid s_t)-\log\pi_{\mathrm{ref}}(y_t\mid s_t)\right)`, String.raw`r_t=r_t^{\mathrm{KL}}+\mathbf 1[t=T-1]r_\psi(x,y)`],
    example: example('一条三 token response 的 shaped reward', '终局偏好分数为 2.0，逐 token KL 代价分别为 −0.1、−0.2、−0.1。', ['位置', 'KL 代价', '最终 token reward'], [['token 1', '−0.1', '−0.1'], ['token 2', '−0.2', '−0.2'], ['token 3 / EOS', '−0.1', '1.9']]),
    handoff: 'GAE 再把这条 shaped reward 序列与 prefix value 合成为逐 token advantage。',
  },
  {
    id: 'batch-contract-and-failures', kicker: '端到端批次契约', title: 'RLHF 工程稳定性的核心是同一 token 位置贯穿生成、打分、GAE 与更新',
    paragraphs: ['每条样本至少需要 prompt/response token、attention 与 response mask、终止原因、old/reference log-probability、old value、token reward、advantage 和 return。只有 response 的有效位置进入 policy loss。', '常见失败可按契约定位：reward 飙升而 KL 失控通常是约束过弱或 reward hacking；value loss 爆炸可能来自终止 mask/尺度；ratio 异常常来自旧权重滞后或 token 重算不一致；吞吐下降则要区分生成、打分与优化瓶颈。'],
    formulas: [String.raw`\mathcal B_t=(y_t,m_t,\log\pi_{\mathrm{old},t},\log\pi_{\mathrm{ref},t},V_{\mathrm{old},t},r_t,\widehat A_t,\widehat R_t)`, String.raw`L_{\mathrm{policy}}=\frac{\sum_t m_t\ell_t}{\sum_t m_t}`],
    pseudocodeTitle: 'One PPO-based RLHF iteration',
    pseudocode: ['冻结本轮 old policy；rollout workers 生成 response 并保存 token 证据', 'Reference 与 reward model 对同一 tokenization 批量前向打分', '构造逐 token KL 代价，并在有效终点加入序列 reward', 'Value model 为每个有效 prefix 产生 old value', '按终止 mask 反向计算 GAE advantage 与 return', '固定 batch，执行有限 PPO minibatch epoch 更新 policy/value', '发布新 policy 到 workers；记录 reward、KL、clip、value、长度与吞吐诊断'],
    handoff: '这一闭环把第 15 章的 token MDP 与第 14 章的 PPO 组合成完整后训练系统。',
  },
]

export const rlhfDeepeningEn = [
  {
    id: 'model-provenance', kicker: 'Model provenance and freezing', title: 'Policy, old, reference, reward, and value represent five data lineages',
    paragraphs: ['Policy usually starts from SFT and keeps updating; old is a short-lived rollout snapshot; reference is commonly an SFT copy frozen long-term; reward comes from preference comparisons; value may initialize from policy weights but trains on returns.', 'Old supplies the statistically correct PPO denominator, while reference supplies behavioral regularization. Merging them either moves the KL anchor or mismatches the sampling distribution.'],
    formulas: [String.raw`\theta_0\leftarrow\theta_{\mathrm{SFT}},\quad\theta_{\mathrm{old}}\leftarrow\theta\ \text{per rollout}`, String.raw`\theta_{\mathrm{ref}}\leftarrow\theta_{\mathrm{SFT}}\ \text{and frozen}`, String.raw`\psi\leftarrow\operatorname{TrainRM}(x,y^+,y^-)`],
    theorem: theorem('The PPO denominator must be the probability from the policy that generated that token.', 'This is the provenance requirement for importance correction; worker lag or token misalignment corrupts the ratio.', [String.raw`y_t\sim\pi_{\mathrm{old}}(\cdot\mid x,y_{<t})`, String.raw`\log\pi_{\mathrm{old},t}\ \text{stored at generation}`]),
    handoff: 'With model roles clear, a sequence preference score must be assigned to the token trajectory.',
  },
  {
    id: 'sequence-to-token-reward', kicker: 'Reward shaping', title: 'Why is sequence reward placed at the final valid token while KL cost is tokenwise?',
    paragraphs: ['The reward model needs the complete response, so its score naturally arrives at EOS or truncation. Reference KL can be estimated at every sampled token from log-probability differences, creating dense cost.', 'Return propagates terminal preference backward while token KL penalizes local drift. Incorrect padding, EOS, or length handling can make the model optimize formatting rather than preference.'],
    formulas: [String.raw`r_t^{\mathrm{KL}}=-\beta\left(\log\pi_\theta(y_t\mid s_t)-\log\pi_{\mathrm{ref}}(y_t\mid s_t)\right)`, String.raw`r_t=r_t^{\mathrm{KL}}+\mathbf 1[t=T-1]r_\psi(x,y)`],
    example: example('Shaped reward for a three-token response', 'Terminal preference is 2.0; token KL costs are −0.1, −0.2, and −0.1.', ['Position', 'KL cost', 'Final token reward'], [['Token 1', '−0.1', '−0.1'], ['Token 2', '−0.2', '−0.2'], ['Token 3 / EOS', '−0.1', '1.9']]),
    handoff: 'GAE combines this shaped reward sequence with prefix values into token advantages.',
  },
  {
    id: 'batch-contract-and-failures', kicker: 'End-to-end batch contract', title: 'RLHF stability depends on one token position surviving generation, scoring, GAE, and update',
    paragraphs: ['Each sample needs prompt/response tokens, attention and response masks, termination reason, old/reference probabilities, old value, token reward, advantage, and return. Only valid response positions enter policy loss.', 'Failures map to the contract: rising reward with runaway KL suggests weak regularization or reward hacking; exploding value loss suggests terminal masks or scale; abnormal ratios suggest stale weights or token mismatch; throughput needs stage-level diagnosis.'],
    formulas: [String.raw`\mathcal B_t=(y_t,m_t,\log\pi_{\mathrm{old},t},\log\pi_{\mathrm{ref},t},V_{\mathrm{old},t},r_t,\widehat A_t,\widehat R_t)`, String.raw`L_{\mathrm{policy}}=\frac{\sum_t m_t\ell_t}{\sum_t m_t}`],
    pseudocodeTitle: 'One PPO-based RLHF iteration',
    pseudocode: ['Freeze old policy and let rollout workers generate token evidence', 'Run reference and reward models on exactly the same tokenization', 'Build token KL costs and add sequence reward at the valid endpoint', 'Produce old prefix values with the value model', 'Compute GAE advantages and returns backward with terminal masks', 'Run finite PPO minibatch epochs on the fixed batch', 'Publish policy weights and record reward, KL, clip, value, length, and throughput'],
    handoff: 'This loop combines the token MDP of Chapter 15 with PPO from Chapter 14.',
  },
]
