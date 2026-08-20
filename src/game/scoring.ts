import {
  BOWL_TARGET_HITS,
  GOLDEN_TIME_BONUS,
  GRADE_THRESHOLDS,
  HITS_PER_MULTIPLIER,
  MAX_MULTIPLIER,
  POINTS,
} from './config'
import { clamp } from './difficulty'

import type { AvocadoKind, Grade, RunTotals } from './types'

export const emptyTotals = (): RunTotals => ({
  score: 0,
  combo: 0,
  maxCombo: 0,
  goodHits: 0,
  rottenHits: 0,
  taps: 0,
})

/** One extra multiplier per three consecutive good hits, capped. */
export const multiplierForCombo = (combo: number) =>
  clamp(1 + Math.floor(combo / HITS_PER_MULTIPLIER), 1, MAX_MULTIPLIER)

export type HitResult = {
  totals: RunTotals
  /** Points added or taken away, multiplier included. */
  gained: number
  /** Seconds added to the timer. */
  timeBonus: number
}

/** Applies a whack on an avocado of the given kind. Never mutates its input. */
export const applyHit = (totals: RunTotals, kind: AvocadoKind): HitResult => {
  const taps = totals.taps + 1

  if (kind === 'rotten') {
    return {
      totals: {
        ...totals,
        taps,
        combo: 0,
        rottenHits: totals.rottenHits + 1,
        score: Math.max(0, totals.score + POINTS.rotten),
      },
      gained: POINTS.rotten,
      timeBonus: 0,
    }
  }

  const combo = totals.combo + 1
  const gained = (kind === 'golden' ? POINTS.golden : POINTS.normal) * multiplierForCombo(combo)

  return {
    totals: {
      ...totals,
      taps,
      combo,
      maxCombo: Math.max(totals.maxCombo, combo),
      goodHits: totals.goodHits + 1,
      score: totals.score + gained,
    },
    gained,
    timeBonus: kind === 'golden' ? GOLDEN_TIME_BONUS : 0,
  }
}

/** A tap on bare board costs no points but breaks the streak. */
export const applyMissTap = (totals: RunTotals): RunTotals => ({
  ...totals,
  taps: totals.taps + 1,
  combo: 0,
})

export const gradeFor = (score: number): Grade => {
  if (score >= GRADE_THRESHOLDS.legendary) return 'legendary'
  if (score >= GRADE_THRESHOLDS.decent) return 'decent'
  return 'sad'
}

/** How full the bowl is, from 0 to 1. Counts good hits, not points. */
export const bowlFill = (goodHits: number) => clamp(goodHits / BOWL_TARGET_HITS, 0, 1)

/** Share of taps that landed on a good avocado, from 0 to 1. */
export const accuracy = (totals: RunTotals) => (totals.taps === 0 ? 0 : totals.goodHits / totals.taps)
