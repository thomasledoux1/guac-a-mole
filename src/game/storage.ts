import { BEST_SCORE_KEY } from './config'

/** Reads the personal best. Returns 0 when storage is blocked or empty. */
export const readBest = () => {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY)
    const value = Number(raw)
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  } catch {
    return 0
  }
}

/** Stores a new personal best. Failure is not worth interrupting a game for. */
export const writeBest = (score: number) => {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(Math.floor(score)))
  } catch {
    // Private browsing and blocked storage both land here. Nothing to do.
  }
}
