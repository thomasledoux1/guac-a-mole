import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { DoubleSide, LatheGeometry, Vector2 } from 'three'

import { BOWL_POSITION } from '../game/config'
import { lerp } from '../game/difficulty'
import { bowlFill } from '../game/scoring'
import { useGameStore } from '../game/store'
import { damp } from './easing'
import { palette } from './palette'

import type { Group, Mesh } from 'three'

/** Outside wall up, over the rim, and back down the inside. */
const PROFILE = [
  [0, 0],
  [0.5, 0.015],
  [0.82, 0.12],
  [0.98, 0.34],
  [1.04, 0.54],
  [0.97, 0.58],
  [0.88, 0.34],
  [0.68, 0.14],
  [0, 0.09],
] as const

const bowlGeometry = new LatheGeometry(
  PROFILE.map(([x, y]) => new Vector2(x, y)),
  20,
)

/** Kept in step with the bowl's inner wall so the guacamole never pokes through. */
const GUAC_BASE_Y = 0.1
const GUAC_HEIGHT = { min: 0.03, max: 0.34 }
const GUAC_RADIUS = { min: 0.5, max: 0.42 }

export const Bowl = () => {
  const guac = useRef<Mesh>(null)
  const chunks = useRef<Group>(null)
  const goodHits = useGameStore((state) => state.totals.goodHits)
  const shown = useRef(0)
  const target = bowlFill(goodHits)

  useFrame((_, delta) => {
    shown.current = lerp(shown.current, target, damp(6, delta))
    const height = GUAC_HEIGHT.min + shown.current * GUAC_HEIGHT.max
    const radius = GUAC_RADIUS.min + shown.current * GUAC_RADIUS.max

    if (guac.current) {
      guac.current.scale.set(radius, height, radius)
      guac.current.position.y = GUAC_BASE_Y + height / 2
      guac.current.visible = shown.current > 0.005
    }

    if (chunks.current) {
      chunks.current.position.y = GUAC_BASE_Y + height
      chunks.current.children.forEach((child, index) => {
        const threshold = 0.28 + index * 0.22
        const grown = shown.current > threshold ? 1 : 0
        child.scale.setScalar(lerp(child.scale.x, grown, damp(8, delta)))
      })
    }
  })

  return (
    <group position={BOWL_POSITION}>
      <mesh geometry={bowlGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={palette.bowl} side={DoubleSide} flatShading roughness={0.7} />
      </mesh>

      <mesh ref={guac} visible={false}>
        <cylinderGeometry args={[1, 0.72, 1, 20]} />
        <meshStandardMaterial color={palette.guac} flatShading roughness={0.6} />
      </mesh>

      <group ref={chunks}>
        {[
          { position: [0.3, 0.03, 0.2], color: palette.guacDark },
          { position: [-0.34, 0.02, -0.12], color: palette.lime },
          { position: [0.05, 0.04, -0.34], color: palette.guacDark },
        ].map((chunk) => (
          <mesh
            key={chunk.color + String(chunk.position[0])}
            position={[chunk.position[0] ?? 0, chunk.position[1] ?? 0, chunk.position[2] ?? 0]}
            scale={0}
            castShadow
          >
            <icosahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color={chunk.color} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}
