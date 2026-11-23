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

export function evaluateGrpo({
  rewards = [0.2, 0.9, 0.55, -0.05],
  clip = 0.2,
  klBeta = 0.08,
  dynamicSampling = false,
  varianceThreshold = 0.02,
} = {}) {
  const ratios = [0.88, 1.24, 1.08, 0.76, 1.15, 0.94, 1.31, 0.82]
  const kls = [0.018, 0.041, 0.024, 0.052, 0.031, 0.019, 0.047, 0.027]
  const mean = rewards.reduce((sum, value) => sum + value, 0) / rewards.length
  const variance = rewards.reduce((sum, value) => sum + (value - mean) ** 2, 0) / rewards.length
  const std = Math.sqrt(variance)
  const informative = std >= varianceThreshold
  const filteredOut = Boolean(dynamicSampling && !informative)
  const samples = rewards.map((reward, index) => {
    const ratio = ratios[index % ratios.length]
    const kl = kls[index % kls.length]
    const advantage = (reward - mean) / (std + 1e-8)
    const clippedRatio = Math.min(1 + clip, Math.max(1 - clip, ratio))
    const surrogate = Math.min(ratio * advantage, clippedRatio * advantage)
    const objective = surrogate - klBeta * kl
    return {
      id: String.fromCharCode(65 + index),
      reward,
      advantage,
      ratio,
      clippedRatio,
      kl,
      objective,
      usedInUpdate: !filteredOut,
      effectiveObjective: filteredOut ? 0 : objective,
    }
  })
  return {
    mean,
    std,
    informative,
    filteredOut,
    activeCount: filteredOut ? 0 : samples.length,
    groupSize: samples.length,
    samples,
  }
}
