import { BOARD_THICKNESS } from '../game/config'
import { palette } from './palette'

/** The kitchen surface the board and bowl sit on. Catches every shadow. */
export const Counter = () => (
  <mesh position={[0, -BOARD_THICKNESS, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[60, 60]} />
    <meshStandardMaterial color={palette.counter} roughness={1} />
  </mesh>
)
