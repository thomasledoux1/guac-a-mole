import { create } from 'zustand'

import * as sfx from '../audio/synth'
import { clock, resetClock, takeId } from './clock'
import { GOLDEN_TIME_BONUS, HOLE_COUNT, ROUND_SECONDS } from './config'
import { applyHit, applyMissTap, emptyTotals } from './scoring'
import { readBest, writeBest } from './storage'

import type { AvocadoKind, HoleSlot, Phase, RunTotals, ScorePop } from './types'

const emptyHoles = (): HoleSlot[] => Array.from({ length: HOLE_COUNT }, () => null)

type GameStore = {
  phase: Phase
  /** Whole seconds left, updated only when the displayed number changes. */
  displayTime: number
  totals: RunTotals
  holes: HoleSlot[]
  pops: ScorePop[]
  best: number
  isNewBest: boolean
  muted: boolean
  shadows: boolean

  openTitle: () => void
  startCountdown: () => void
  startRound: () => void
  setDisplayTime: (seconds: number) => void
  spawn: (holeIndex: number, kind: AvocadoKind, upTime: number) => void
  retire: (holeIndexes: readonly number[]) => void
  whack: (holeIndex: number) => void
  tapBoard: () => void
  finish: () => void
  pause: () => void
  resume: () => void
  dismissPop: (id: number) => void
  toggleMuted: () => void
  disableShadows: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'title',
  displayTime: ROUND_SECONDS,
  totals: emptyTotals(),
  holes: emptyHoles(),
  pops: [],
  best: readBest(),
  isNewBest: false,
  muted: false,
  shadows: true,

  openTitle: () => {
    resetClock()
    set({
      phase: 'title',
      displayTime: ROUND_SECONDS,
      totals: emptyTotals(),
      holes: emptyHoles(),
      pops: [],
      isNewBest: false,
    })
  },

  startCountdown: () => {
    sfx.unlockAudio()
    resetClock()
    set({
      phase: 'countdown',
      displayTime: ROUND_SECONDS,
      totals: emptyTotals(),
      holes: emptyHoles(),
      pops: [],
      isNewBest: false,
    })
  },

  startRound: () => {
    resetClock()
    set({ phase: 'playing', displayTime: ROUND_SECONDS })
  },

  setDisplayTime: (seconds) => set({ displayTime: seconds }),

  spawn: (holeIndex, kind, upTime) => {
    const holes = [...get().holes]
    if (holes[holeIndex] !== null) return
    holes[holeIndex] = { id: takeId(), kind, spawnedAt: clock.elapsed, upTime, hitAt: null }
    set({ holes })
  },

  retire: (holeIndexes) => {
    if (holeIndexes.length === 0) return
    const holes = [...get().holes]
    for (const index of holeIndexes) holes[index] = null
    set({ holes })
  },

  whack: (holeIndex) => {
    const state = get()
    if (state.phase !== 'playing') return

    const occupant = state.holes[holeIndex]
    if (!occupant || occupant.hitAt !== null) return

    const { totals, gained, timeBonus } = applyHit(state.totals, occupant.kind)
    clock.timeLeft += timeBonus

    const holes = [...state.holes]
    holes[holeIndex] = { ...occupant, hitAt: clock.elapsed }

    const pop: ScorePop = {
      id: takeId(),
      holeIndex,
      text: occupant.kind === 'golden' ? `+${gained}  +${GOLDEN_TIME_BONUS}s` : `${gained > 0 ? '+' : ''}${gained}`,
      tone: occupant.kind === 'rotten' ? 'bad' : occupant.kind === 'golden' ? 'golden' : 'good',
    }

    if (occupant.kind === 'rotten') sfx.playRotten()
    else if (occupant.kind === 'golden') sfx.playGolden()
    else sfx.playHit(totals.combo)

    set({ totals, holes, pops: [...state.pops, pop] })
  },

  tapBoard: () => {
    const state = get()
    if (state.phase !== 'playing') return
    if (state.totals.combo > 0) sfx.playMiss()
    set({ totals: applyMissTap(state.totals) })
  },

  finish: () => {
    const state = get()
    if (state.phase === 'results') return

    const best = Math.max(state.best, state.totals.score)
    const isNewBest = state.totals.score > state.best && state.totals.score > 0
    if (isNewBest) writeBest(state.totals.score)

    sfx.playRoundOver()
    set({ phase: 'results', displayTime: 0, holes: emptyHoles(), pops: [], best, isNewBest })
  },

  pause: () => {
    if (get().phase !== 'playing') return
    set({ phase: 'paused' })
  },

  resume: () => {
    if (get().phase !== 'paused') return
    set({ phase: 'playing' })
  },

  dismissPop: (id) => set({ pops: get().pops.filter((pop) => pop.id !== id) }),

  toggleMuted: () => {
    const muted = !get().muted
    sfx.setMuted(muted)
    set({ muted })
  },

  disableShadows: () => {
    if (!get().shadows) return
    set({ shadows: false })
  },
}))
