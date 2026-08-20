import { describe, expect, it } from 'vitest'

import { DIFFICULTY, ROUND_SECONDS } from './config'
import {
  maxConcurrentAt,
  pickFreeHole,
  pickKind,
  progressAt,
  rottenChanceAt,
  spawnIntervalAt,
  upTimeAt,
} from './difficulty'

import type { HoleSlot, Occupant } from './types'

const occupant = (id: number): Occupant => ({
  id,
  kind: 'normal',
  spawnedAt: 0,
  upTime: 1,
  hitAt: null,
})

describe('progressAt', () => {
  it('spans the round and clamps at both ends', () => {
    expect(progressAt(-5)).toBe(0)
    expect(progressAt(ROUND_SECONDS / 2)).toBe(0.5)
    expect(progressAt(ROUND_SECONDS * 2)).toBe(1)
  })
})

describe('the ramp', () => {
  it('shortens the time an avocado stays up', () => {
    expect(upTimeAt(0)).toBe(DIFFICULTY.upTime.start)
    expect(upTimeAt(ROUND_SECONDS)).toBe(DIFFICULTY.upTime.end)
    expect(upTimeAt(30)).toBeLessThan(upTimeAt(10))
  })

  it('shortens the gap between spawns', () => {
    expect(spawnIntervalAt(0)).toBe(DIFFICULTY.spawnInterval.start)
    expect(spawnIntervalAt(ROUND_SECONDS)).toBe(DIFFICULTY.spawnInterval.end)
  })

  it('sends out more rotten avocados as the round goes on', () => {
    expect(rottenChanceAt(ROUND_SECONDS)).toBeGreaterThan(rottenChanceAt(0))
  })

  it('steps the crowd up from one to three', () => {
    expect(maxConcurrentAt(0)).toBe(1)
    expect(maxConcurrentAt(ROUND_SECONDS * 0.4)).toBe(2)
    expect(maxConcurrentAt(ROUND_SECONDS)).toBe(3)
  })
})

describe('pickKind', () => {
  it('reads the lowest rolls as golden', () => {
    expect(pickKind(0, () => 0)).toBe('golden')
  })

  it('reads the next band as rotten', () => {
    expect(pickKind(0, () => DIFFICULTY.goldenChance + 0.001)).toBe('rotten')
  })

  it('reads everything else as a ripe avocado', () => {
    expect(pickKind(0, () => 0.99)).toBe('normal')
  })
})

describe('pickFreeHole', () => {
  it('only ever returns an empty hole', () => {
    const holes: HoleSlot[] = [occupant(1), null, occupant(2), null]
    expect([1, 3]).toContain(pickFreeHole(holes, () => 0))
    expect([1, 3]).toContain(pickFreeHole(holes, () => 0.99))
  })

  it('returns null when the board is full', () => {
    expect(pickFreeHole([occupant(1), occupant(2)], () => 0)).toBeNull()
  })
})
