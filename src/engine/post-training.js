const sigmoid = (value) => 1 / (1 + Math.exp(-value))

export function evaluateDpo({ beta = 0.1, contrast = 0.54, chosenShift = contrast / 2, rejectedShift = -contrast / 2, learningRate = 0.5 } = {}) {
  const pair = {
    chosen: { referenceLogp: -1.94, currentLogp: -1.94 + chosenShift },
    rejected: { referenceLogp: -2.16, currentLogp: -2.16 + rejectedShift },
  }
  const margin = beta * (chosenShift - rejectedShift)
  const preferenceProbability = sigmoid(margin)
  const loss = -Math.log(preferenceProbability)
  const updateMagnitude = learningRate * beta * (1 - preferenceProbability)
  const nextChosenShift = chosenShift + updateMagnitude
  const nextRejectedShift = rejectedShift - updateMagnitude
  const nextMargin = beta * (nextChosenShift - nextRejectedShift)
  const nextPreferenceProbability = sigmoid(nextMargin)
  const nextLoss = -Math.log(nextPreferenceProbability)
  return {
    pair,
    chosenShift,
    rejectedShift,
    margin,
    preferenceProbability,
    loss,
    learningRate,
    gradients: {
      chosen: -beta * (1 - preferenceProbability),
      rejected: beta * (1 - preferenceProbability),
    },
    updateMagnitude,
    after: {
      chosenShift: nextChosenShift,
      rejectedShift: nextRejectedShift,
      margin: nextMargin,
      preferenceProbability: nextPreferenceProbability,
      loss: nextLoss,
    },
  }
}

export function evaluateGrpo({ rewards = [0.2, 0.9, 0.55, -0.05], clip = 0.2, klBeta = 0.08 } = {}) {
  const ratios = [0.88, 1.24, 1.08, 0.76]
  const kls = [0.018, 0.041, 0.024, 0.052]
  const mean = rewards.reduce((sum, value) => sum + value, 0) / rewards.length
  const variance = rewards.reduce((sum, value) => sum + (value - mean) ** 2, 0) / rewards.length
  const std = Math.sqrt(variance)
  const samples = rewards.map((reward, index) => {
    const advantage = (reward - mean) / (std + 1e-8)
    const clippedRatio = Math.min(1 + clip, Math.max(1 - clip, ratios[index]))
    const surrogate = Math.min(ratios[index] * advantage, clippedRatio * advantage)
    return { id: String.fromCharCode(65 + index), reward, advantage, ratio: ratios[index], clippedRatio, kl: kls[index], objective: surrogate - klBeta * kls[index] }
  })
  return { mean, std, samples }
}
