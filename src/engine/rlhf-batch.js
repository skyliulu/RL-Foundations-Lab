const RESPONSE_TOKENS = {
  A: ['Rayleigh', 'scattering', 'shorter', 'waves', 'EOS'],
  B: ['shorter', 'waves', 'scatter', 'more'],
  C: ['blue', 'light', 'is', 'scattered', 'EOS'],
  D: ['guess', 'without', 'evidence'],
  E: ['ignore', 'the', 'mechanism', 'EOS'],
  F: ['fabricate', 'a', 'cause'],
}

export function buildRlhfBatchContract({ selectedId = 'A', fault = 'healthy' } = {}) {
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
  const lossMask = tokens.map((token, index) => {
    if (fault === 'maskBug' && token === 'PAD') return 1
    return responseMask[index]
  })
  const bootstrapMask = tokens.map((_, index) => {
    if (!responseMask[index]) return 0
    const isLastValidAction = index === validLength - 1
    if (fault === 'maskBug' && isLastValidAction) {
      return Number(terminated) // flipped: EOS wrongly bootstraps (1), truncated wrongly zeros (0)
    }
    return Number(!(isLastValidAction && terminated))
  })
  const rows = tokens.map((token, index) => {
    const isLastValidAction = index === validLength - 1
    const padLeak = fault === 'maskBug' && token === 'PAD'
    const boundaryFlip = fault === 'maskBug' && isLastValidAction
    return {
      index,
      token,
      attention: attentionMask[index],
      response: responseMask[index],
      loss: lossMask[index],
      bootstrap: bootstrapMask[index],
      terminal: terminated && isLastValidAction,
      truncated: !terminated && isLastValidAction,
      faulted: padLeak || boundaryFlip,
      padLeak,
      boundaryFlip,
    }
  })

  const workerLag = fault === 'workerLag'
  const refDrift = fault === 'refDrift'
  const maskBug = fault === 'maskBug'

  return {
    batchId: 'batch_042',
    promptId: 'prompt_017',
    responseId: `response_${id}`,
    selectedId: id,
    fault,
    ratioFactor: workerLag ? 1.48 : 1,
    klFactor: refDrift ? 0.08 : 1,
    shape: { batch: 6, sequence: sequenceLength, responses: 6 },
    terminated,
    truncated: !terminated,
    rows,
    tensors: [
      { name: 'input_ids', shape: [6, sequenceLength], producer: 'tokenizer', version: 'tok_v3', mask: 'attention_mask', faulted: false },
      { name: 'old_logp', shape: [6, sequenceLength], producer: 'rollout policy', version: workerLag ? 'policy_v9 (stale)' : 'policy_v12', mask: 'response_mask', faulted: workerLag },
      { name: 'ref_logp', shape: [6, sequenceLength], producer: 'reference policy', version: refDrift ? 'policy_v12 (unfrozen)' : 'sft_v4', mask: 'response_mask', faulted: refDrift },
      { name: 'reward', shape: [6], producer: 'reward model', version: 'rm_v7', mask: 'one score per response', faulted: false },
      { name: 'value', shape: [6, sequenceLength], producer: 'value model', version: 'value_v9', mask: 'attention_mask', faulted: false },
      { name: 'advantage', shape: [6, sequenceLength], producer: 'GAE', version: 'batch_042', mask: maskBug ? 'loss_mask (PAD leak)' : 'loss_mask', faulted: maskBug },
    ],
    versions: [
      { role: 'rollout / old', version: workerLag ? 'policy_v9' : 'policy_v12', state: workerLag ? 'stale worker (−3 steps)' : 'frozen for batch', produces: 'tokens + old_logp', faulted: workerLag },
      { role: 'current policy', version: 'policy_v13', state: 'trainable', produces: 'new_logp + policy gradient', faulted: false },
      { role: 'reference', version: refDrift ? 'policy_v12' : 'sft_v4', state: refDrift ? 'unfrozen (drifted!)' : 'frozen', produces: 'ref_logp', faulted: refDrift },
      { role: 'reward model', version: 'rm_v7', state: 'frozen', produces: 'sequence reward', faulted: false },
      { role: 'value model', version: 'value_v9 → value_v10', state: 'trainable', produces: 'value + return target', faulted: false },
    ],
    lifecycle: [
      { stage: 'generate', input: 'prompt_017', output: 'response_A…F + old_logp', version: workerLag ? 'policy_v9 (stale)' : 'policy_v12', faulted: workerLag },
      { stage: 'score', input: 'responses', output: 'reward + ref_logp + value', version: refDrift ? 'rm_v7 / policy_v12 / value_v9' : 'rm_v7 / sft_v4 / value_v9', faulted: refDrift },
      { stage: 'align', input: 'token tensors + masks', output: maskBug ? 'corrupted masks + GAE' : 'advantage + return', version: 'batch_042', faulted: maskBug },
      { stage: 'update', input: 'frozen batch evidence', output: 'policy_v13 + value_v10', version: workerLag ? 'ratio explosion' : 'optimizer_step_318', faulted: workerLag || maskBug },
      { stage: 'refresh', input: 'policy_v13', output: 'next rollout batch', version: 'batch_043', faulted: false },
    ],
  }
}
