const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

export const blendContractStrategyScores = (
  baselineScore: number,
  ensembleScore: number,
  requestedEnsembleWeight = 0.35,
) => {
  const ensembleWeight = clamp(requestedEnsembleWeight, 0, 0.35)
  return {
    score: Number(
      clamp(
        baselineScore * (1 - ensembleWeight) + ensembleScore * ensembleWeight,
        -100,
        100,
      ).toFixed(2),
    ),
    ensembleWeight,
  }
}
