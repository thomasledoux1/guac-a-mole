import { DIFFICULTY, ROUND_SECONDS } from './config'

import type { AvocadoKind, HoleSlot } from './types'

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t

/** How far into the round we are, from 0 at the start to 1 at the end. */
export const progressAt = (elapsed: number) => clamp(elapsed / ROUND_SECONDS, 0, 1)

/** Seconds an avocado stays up. Falls as the round goes on. */
export const upTimeAt = (elapsed: number) => lerp(DIFFICULTY.upTime.start, DIFFICULTY.upTime.end, progressAt(elapsed))

/** Seconds between spawns. Falls as the round goes on. */
export const spawnIntervalAt = (elapsed: number) =>
  lerp(DIFFICULTY.spawnInterval.start, DIFFICULTY.spawnInterval.end, progressAt(elapsed))

/** Chance a new avocado is rotten. Rises as the round goes on. */
export const rottenChanceAt = (elapsed: number) =>
  lerp(DIFFICULTY.rottenChance.start, DIFFICULTY.rottenChance.end, progressAt(elapsed))

/** How many avocados may be up at once. Steps up from one to three. */
export const maxConcurrentAt = (elapsed: number) => {
  const progress = progressAt(elapsed)
  for (const step of DIFFICULTY.concurrentSteps) {
    if (progress <= step.until) return step.count
  }
  return DIFFICULTY.concurrentSteps.at(-1)?.count ?? 1
}

/**
 * Picks the kind of the next avocado.
 *
 * `random` is injected so the ramp can be tested without stubbing globals.
 */
export const pickKind = (elapsed: number, random: () => number = Math.random): AvocadoKind => {
  const roll = random()
  if (roll < DIFFICULTY.goldenChance) return 'golden'
  if (roll < DIFFICULTY.goldenChance + rottenChanceAt(elapsed)) return 'rotten'
  return 'normal'
}

/** Picks an empty hole, or returns null when every hole is taken. */
export const pickFreeHole = (holes: readonly HoleSlot[], random: () => number = Math.random) => {
  const free: number[] = []
  holes.forEach((slot, index) => {
    if (slot === null) free.push(index)
  })
  if (free.length === 0) return null
  return free[Math.floor(random() * free.length)] ?? null
}
