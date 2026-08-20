export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

export const easeInCubic = (t: number) => t ** 3

/** Overshoots slightly before settling, which reads as a pop. */
export const easeOutBack = (t: number) => {
  const c = 1.9
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
}

export const damp = (rate: number, delta: number) => 1 - Math.exp(-rate * delta)
