import { Html } from '@react-three/drei'
import { useEffect } from 'react'

import { holePositions } from '../game/layout'
import { useGameStore } from '../game/store'

import type { ScorePop } from '../game/types'

const POP_LIFETIME_MS = 750

const Pop = ({ pop }: { pop: ScorePop }) => {
  const dismissPop = useGameStore((state) => state.dismissPop)
  const position = holePositions[pop.holeIndex] ?? [0, 0, 0]

  useEffect(() => {
    const timer = window.setTimeout(() => dismissPop(pop.id), POP_LIFETIME_MS)
    return () => window.clearTimeout(timer)
  }, [pop.id, dismissPop])

  return (
    <Html center position={[position[0], 1.3, position[2]]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <span className={`pop pop--${pop.tone}`}>{pop.text}</span>
    </Html>
  )
}

export const ScorePops = () => {
  const pops = useGameStore((state) => state.pops)
  return (
    <>
      {pops.map((pop) => (
        <Pop key={pop.id} pop={pop} />
      ))}
    </>
  )
}
