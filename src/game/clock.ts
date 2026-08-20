import { ROUND_SECONDS } from './config'

/**
 * Mutable game clock shared by the render loop and the store.
 *
 * It lives outside React on purpose: it changes every frame, and routing it
 * through state would re-render the whole tree sixty times a second.
 */
export const clock = {
  /** Seconds since the round started. Drives the difficulty ramp. */
  elapsed: 0,
  /** Seconds left on the timer. Golden avocados add to it. */
  timeLeft: ROUND_SECONDS,
  /** Game-clock time of the next spawn. */
  nextSpawnAt: 0,
  /** Monotonic id source for avocados and score pops. */
  nextId: 1,
}

export const resetClock = () => {
  clock.elapsed = 0
  clock.timeLeft = ROUND_SECONDS
  clock.nextSpawnAt = 0.35
}

export const takeId = () => clock.nextId++
