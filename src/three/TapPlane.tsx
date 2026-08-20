import { useGameStore } from '../game/store'
import { markPointerSeen, swingMallet } from './malletControl'

/**
 * An invisible sheet just under the board surface. It catches every pointer
 * event that no avocado claimed, which makes it the miss detector.
 */
export const TapPlane = () => {
  const tapBoard = useGameStore((state) => state.tapBoard)

  return (
    <mesh
      position={[0, -0.005, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={markPointerSeen}
      onPointerDown={(event) => {
        event.stopPropagation()
        markPointerSeen()
        swingMallet()
        tapBoard()
      }}
    >
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}
