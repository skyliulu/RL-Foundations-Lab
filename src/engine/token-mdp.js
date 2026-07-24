export function buildTokenTrajectory({
  response,
  sequenceReward = 2,
  beta = 0.2,
  gamma = 1,
  truncationValue = 0.8,
}) {
  const terminated = response.end === 'terminated'
  const truncated = response.end === 'truncated'
  if (!terminated && !truncated) throw new Error('response.end must be terminated or truncated')

  const rows = response.tokens.map((token, index) => {
    const isLast = index === response.tokens.length - 1
    const klCost = -beta * (response.old[index] - response.ref[index])
    const finalSequenceReward = isLast ? sequenceReward : 0
    return {
      token,
      index,
      oldLogp: response.old[index],
      refLogp: response.ref[index],
      value: 0.35 - index * 0.08,
      lossMask: 1,
      bootstrapMask: isLast ? (terminated ? 0 : 1) : 1,
      terminated: isLast && terminated,
      truncated: isLast && truncated,
      klCost,
      process: response.process[index],
      reward: klCost + response.process[index] + finalSequenceReward,
    }
  })

  let future = truncated ? truncationValue : 0
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    future = rows[index].reward + gamma * rows[index].bootstrapMask * future
    rows[index].returnValue = future
    rows[index].advantage = future - rows[index].value
  }

  return {
    rows,
    terminated,
    truncated,
    sequenceReward,
    truncationValue,
    finalBootstrap: truncated ? gamma * truncationValue : 0,
  }
}
