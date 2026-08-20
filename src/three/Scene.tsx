import { Canvas } from '@react-three/fiber'

import { useGameStore } from '../game/store'
import { useFinePointer } from '../hooks/useFinePointer'
import { Avocado } from './Avocado'
import { Board } from './Board'
import { Bowl } from './Bowl'
import { CameraRig } from './CameraRig'
import { Counter } from './Counter'
import { GameClock } from './GameClock'
import { Lights } from './Lights'
import { Mallet } from './Mallet'
import { palette } from './palette'
import { ScorePops } from './ScorePops'
import { TapPlane } from './TapPlane'

export const Scene = () => {
  const holes = useGameStore((state) => state.holes)
  const phase = useGameStore((state) => state.phase)
  const finePointer = useFinePointer()
  const inRound = phase === 'countdown' || phase === 'playing' || phase === 'paused'

  return (
    <Canvas
      flat
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ fov: 45, near: 0.1, far: 60, position: [0, 6, 7] }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
      }}
    >
      <color attach='background' args={[palette.background]} />
      <fog attach='fog' args={[palette.background, 16, 38]} />

      <Lights />
      <CameraRig />
      <GameClock />

      <Counter />
      <Board />
      <Bowl />
      <TapPlane />

      {holes.map((occupant, index) =>
        occupant ? <Avocado key={occupant.id} holeIndex={index} occupant={occupant} /> : null,
      )}

      <ScorePops />
      {finePointer && inRound && <Mallet />}
    </Canvas>
  )
}
