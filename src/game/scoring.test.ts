import { describe, expect, it } from 'vitest'

import { GOLDEN_TIME_BONUS, GRADE_THRESHOLDS, MAX_MULTIPLIER, POINTS } from './config'
import { accuracy, applyHit, applyMissTap, bowlFill, emptyTotals, gradeFor, multiplierForCombo } from './scoring'

const hitStreak = (length: number) => {
  let totals = emptyTotals()
  for (let i = 0; i < length; i++) totals = applyHit(totals, 'normal').totals
  return totals
}

describe('multiplierForCombo', () => {
  it('starts at one and steps up every three hits', () => {
    expect(multiplierForCombo(0)).toBe(1)
    expect(multiplierForCombo(2)).toBe(1)
    expect(multiplierForCombo(3)).toBe(2)
    expect(multiplierForCombo(6)).toBe(3)
  })

  it('never goes past the cap', () => {
    expect(multiplierForCombo(100)).toBe(MAX_MULTIPLIER)
  })
})

describe('applyHit', () => {
  it('scores a normal avocado at the current multiplier', () => {
    const result = applyHit(hitStreak(3), 'normal')
    expect(result.gained).toBe(POINTS.normal * 2)
    expect(result.totals.combo).toBe(4)
    expect(result.totals.goodHits).toBe(4)
  })

  it('pays triple and adds time for a golden avocado', () => {
    const result = applyHit(emptyTotals(), 'golden')
    expect(result.gained).toBe(POINTS.golden)
    expect(result.timeBonus).toBe(GOLDEN_TIME_BONUS)
  })

  it('breaks the streak and takes points for a rotten avocado', () => {
    const result = applyHit(hitStreak(6), 'rotten')
    expect(result.totals.combo).toBe(0)
    expect(result.totals.rottenHits).toBe(1)
    expect(result.gained).toBe(POINTS.rotten)
  })

  it('keeps the best streak after it is broken', () => {
    const result = applyHit(hitStreak(5), 'rotten')
    expect(result.totals.maxCombo).toBe(5)
  })

  it('never drives the score below zero', () => {
    const result = applyHit(emptyTotals(), 'rotten')
    expect(result.totals.score).toBe(0)
  })

  it('leaves the input untouched', () => {
    const before = emptyTotals()
    applyHit(before, 'normal')
    expect(before).toEqual(emptyTotals())
  })
})

describe('applyMissTap', () => {
  it('breaks the streak without costing points', () => {
    const totals = applyMissTap(hitStreak(4))
    expect(totals.combo).toBe(0)
    expect(totals.score).toBe(hitStreak(4).score)
    expect(totals.taps).toBe(5)
  })
})

describe('gradeFor', () => {
  it('uses the configured thresholds', () => {
    expect(gradeFor(0)).toBe('sad')
    expect(gradeFor(GRADE_THRESHOLDS.decent - 1)).toBe('sad')
    expect(gradeFor(GRADE_THRESHOLDS.decent)).toBe('decent')
    expect(gradeFor(GRADE_THRESHOLDS.legendary)).toBe('legendary')
  })
})

describe('bowlFill', () => {
  it('runs from empty to full and stops there', () => {
    expect(bowlFill(0)).toBe(0)
    expect(bowlFill(15)).toBeCloseTo(0.5)
    expect(bowlFill(999)).toBe(1)
  })
})

describe('accuracy', () => {
  it('is zero before the first tap', () => {
    expect(accuracy(emptyTotals())).toBe(0)
  })

  it('counts good hits against every tap', () => {
    const totals = applyMissTap(hitStreak(3))
    expect(accuracy(totals)).toBeCloseTo(3 / 4)
  })
})
