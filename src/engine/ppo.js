export const PPO_SAMPLES = [
  { id: 'A', advantage: 1.35, oldProbability: 0.18, token: 'because', reward: 1.8 },
  { id: 'B', advantage: 0.72, oldProbability: 0.31, token: 'therefore', reward: 1.2 },
  { id: 'C', advantage: 0.21, oldProbability: 0.24, token: 'verify', reward: 0.7 },
  { id: 'D', advantage: -0.28, oldProbability: 0.42, token: 'guess', reward: 0.1 },
  { id: 'E', advantage: -0.84, oldProbability: 0.36, token: 'ignore', reward: -0.8 },
  { id: 'F', advantage: -1.42, oldProbability: 0.12, token: 'fabricate', reward: -1.6 },
]

export function evaluatePpo({ clip = 0.2, updateStrength = 0.28, klBeta = 0.08 } = {}) {
  const samples = PPO_SAMPLES.map((sample) => {
    const ratio = Math.exp(updateStrength * sample.advantage)
    const clippedRatio = Math.min(1 + clip, Math.max(1 - clip, ratio))
    const unclippedObjective = ratio * sample.advantage
    const clippedObjective = clippedRatio * sample.advantage
    const surrogate = Math.min(unclippedObjective, clippedObjective)
    const clipped = Math.abs(ratio - clippedRatio) > 1e-8
    const approxKl = (ratio - 1) - Math.log(ratio)
    return {
      ...sample,
      ratio,
      clippedRatio,
      unclippedObjective,
      clippedObjective,
      surrogate,
      clipped,
      approxKl,
      adjustedReward: sample.reward - klBeta * approxKl * 10,
    }
  })
  return {
    samples,
    clippedCount: samples.filter((sample) => sample.clipped).length,
    meanKl: samples.reduce((sum, sample) => sum + sample.approxKl, 0) / samples.length,
    policyObjective: samples.reduce((sum, sample) => sum + sample.surrogate, 0) / samples.length,
  }
}
