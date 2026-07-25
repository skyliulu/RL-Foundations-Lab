const RESPONSE_TOKENS = {
  A: ['Rayleigh', 'scattering', 'shorter', 'waves', 'EOS'],
  B: ['shorter', 'waves', 'scatter', 'more'],
  C: ['blue', 'light', 'is', 'scattered', 'EOS'],
  D: ['guess', 'without', 'evidence'],
  E: ['ignore', 'the', 'mechanism', 'EOS'],
  F: ['fabricate', 'a', 'cause'],
}

export function buildRlhfBatchContract({ selectedId = 'A' } = {}) {
  const id = RESPONSE_TOKENS[selectedId] ? selectedId : 'A'
  const responseTokens = RESPONSE_TOKENS[id]
  const terminated = responseTokens.at(-1) === 'EOS'
  const promptTokens = ['[prompt]', 'blue?']
  const sequenceLength = 8
  const validTokens = [...promptTokens, ...responseTokens]
  const tokens = Array.from({ length: sequenceLength }, (_, index) => validTokens[index] || 'PAD')
  const validLength = validTokens.length
  const responseStart = promptTokens.length
  const attentionMask = tokens.map((_, index) => Number(index < validLength))
  const responseMask = tokens.map((_, index) => Number(index >= responseStart && index < validLength))
  const lossMask = [...responseMask]
  const bootstrapMask = tokens.map((_, index) => {
    if (!responseMask[index]) return 0
    const isLastValidAction = index === validLength - 1
    return Number(!(isLastValidAction && terminated))
  })
  const rows = tokens.map((token, index) => ({
    index,
    token,
    attention: attentionMask[index],
    response: responseMask[index],
    loss: lossMask[index],
    bootstrap: bootstrapMask[index],
    terminal: terminated && index === validLength - 1,
    truncated: !terminated && index === validLength - 1,
  }))

  return {
    batchId: 'batch_042',
    promptId: 'prompt_017',
    responseId: `response_${id}`,
    selectedId: id,
    shape: { batch: 6, sequence: sequenceLength, responses: 6 },
    terminated,
    truncated: !terminated,
    rows,
    tensors: [
      { name: 'input_ids', shape: [6, sequenceLength], producer: 'tokenizer', version: 'tok_v3', mask: 'attention_mask' },
      { name: 'old_logp', shape: [6, sequenceLength], producer: 'rollout policy', version: 'policy_v12', mask: 'response_mask' },
      { name: 'ref_logp', shape: [6, sequenceLength], producer: 'reference policy', version: 'sft_v4', mask: 'response_mask' },
      { name: 'reward', shape: [6], producer: 'reward model', version: 'rm_v7', mask: 'one score per response' },
      { name: 'value', shape: [6, sequenceLength], producer: 'value model', version: 'value_v9', mask: 'attention_mask' },
      { name: 'advantage', shape: [6, sequenceLength], producer: 'GAE', version: 'batch_042', mask: 'loss_mask' },
    ],
    versions: [
      { role: 'rollout / old', version: 'policy_v12', state: 'frozen for batch', produces: 'tokens + old_logp' },
      { role: 'current policy', version: 'policy_v13', state: 'trainable', produces: 'new_logp + policy gradient' },
      { role: 'reference', version: 'sft_v4', state: 'frozen', produces: 'ref_logp' },
      { role: 'reward model', version: 'rm_v7', state: 'frozen', produces: 'sequence reward' },
      { role: 'value model', version: 'value_v9 → value_v10', state: 'trainable', produces: 'value + return target' },
    ],
    lifecycle: [
      { stage: 'generate', input: 'prompt_017', output: 'response_A…F + old_logp', version: 'policy_v12' },
      { stage: 'score', input: 'responses', output: 'reward + ref_logp + value', version: 'rm_v7 / sft_v4 / value_v9' },
      { stage: 'align', input: 'token tensors + masks', output: 'advantage + return', version: 'batch_042' },
      { stage: 'update', input: 'frozen batch evidence', output: 'policy_v13 + value_v10', version: 'optimizer_step_318' },
      { stage: 'refresh', input: 'policy_v13', output: 'next rollout batch', version: 'batch_043' },
    ],
  }
}
