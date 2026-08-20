import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { clock } from '../game/clock'
import { HIT_SECONDS } from '../game/config'
import { maxConcurrentAt, pickFreeHole, pickKind, spawnIntervalAt, upTimeAt } from '../game/difficulty'
import { useGameStore } from '../game/store'

/** Frames slower than this suggest the device cannot afford shadows. */
const SLOW_FRAME_SECONDS = 1 / 45
const SAMPLE_SIZE = 120

/**
 * The heartbeat of a round: it advances the timer, retires avocados, decides
 * when the next one pops up, and watches the frame rate.
 *
 * It reads and writes the store through `getState` so that running the loop
 * never re-renders anything by itself.
 */
export const GameClock = () => {
  const frames = useRef(0)
  const frameSeconds = useRef(0)

  useFrame((_, delta) => {
    const store = useGameStore.getState()
    if (store.phase !== 'playing') return

    // A backgrounded tab can hand back a huge delta on its first frame.
    const step = Math.min(delta, 0.1)
    clock.elapsed += step
    clock.timeLeft = Math.max(0, clock.timeLeft - step)

    const display = Math.ceil(clock.timeLeft)
    if (display !== store.displayTime) store.setDisplayTime(display)

    const expired: number[] = []
    store.holes.forEach((slot, index) => {
      if (!slot) return
      const done =
        slot.hitAt !== null ? clock.elapsed - slot.hitAt >= HIT_SECONDS : clock.elapsed - slot.spawnedAt >= slot.upTime
      if (done) expired.push(index)
    })
    if (expired.length > 0) store.retire(expired)

    if (clock.elapsed >= clock.nextSpawnAt) {
      const current = useGameStore.getState()
      const standing = current.holes.filter((slot) => slot !== null && slot.hitAt === null).length
      if (standing < maxConcurrentAt(clock.elapsed)) {
        const hole = pickFreeHole(current.holes)
        if (hole !== null) current.spawn(hole, pickKind(clock.elapsed), upTimeAt(clock.elapsed))
        clock.nextSpawnAt = clock.elapsed + spawnIntervalAt(clock.elapsed)
      }
    }

    frames.current += 1
    frameSeconds.current += delta
    if (frames.current >= SAMPLE_SIZE) {
      if (frameSeconds.current / frames.current > SLOW_FRAME_SECONDS) {
        useGameStore.getState().disableShadows()
      }
      frames.current = 0
      frameSeconds.current = 0
    }

    if (clock.timeLeft <= 0) useGameStore.getState().finish()
  })

  return null
}
