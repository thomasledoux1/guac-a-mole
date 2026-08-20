import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { LatheGeometry, Vector2 } from 'three'

import { clock } from '../game/clock'
import { HIT_SECONDS, RETREAT_SECONDS, RISE_SECONDS } from '../game/config'
import { clamp, lerp } from '../game/difficulty'
import { holePositions } from '../game/layout'
import { useGameStore } from '../game/store'
import { BOARD_CLIP } from './clipping'
import { easeInCubic, easeOutBack, easeOutCubic } from './easing'
import { markPointerSeen, swingMallet } from './malletControl'
import { palette } from './palette'

import type { Group, Mesh } from 'three'
import type { AvocadoKind, Occupant } from '../game/types'

/** Height of the avocado's origin when it is fully up and fully hidden. */
const Y_UP = 0.5
const Y_DOWN = -0.9

/**
 * Invisible column that catches the taps. A sphere around the body's middle
 * left the head and the stem — the part a player actually aims at — outside the
 * target, so this is a column that spans the whole avocado with room to spare.
 */
const HIT_RADIUS = 0.8
const HIT_HEIGHT = 1.8
/** Centred so the column reaches from just below the board up past the stem. */
const HIT_CENTRE = 0.25

/** Silhouette of one half of an avocado, spun into a solid by the lathe. */
const PROFILE = [
  [0, -0.6],
  [0.26, -0.57],
  [0.43, -0.44],
  [0.53, -0.18],
  [0.55, 0.08],
  [0.5, 0.32],
  [0.4, 0.52],
  [0.29, 0.68],
  [0.19, 0.79],
  [0.1, 0.85],
  [0, 0.87],
] as const

const bodyGeometry = new LatheGeometry(
  PROFILE.map(([x, y]) => new Vector2(x, y)),
  14,
)

const skinFor = (kind: AvocadoKind) => {
  if (kind === 'rotten') return palette.rotten
  if (kind === 'golden') return palette.golden
  return palette.skin
}

const Face = ({ kind }: { kind: AvocadoKind }) => {
  if (kind === 'rotten') {
    return (
      <group position={[0, 0.32, 0.4]}>
        {[-0.16, 0.16].map((x) => (
          <group key={x} position={[x, 0, 0.06]}>
            {[Math.PI / 4, -Math.PI / 4].map((angle) => (
              <mesh key={angle} rotation={[0, 0, angle]}>
                <boxGeometry args={[0.14, 0.03, 0.03]} />
                <meshStandardMaterial color={palette.eyeDark} clippingPlanes={BOARD_CLIP} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, -0.28, 0.1]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.1, 0.026, 6, 12, Math.PI]} />
          <meshStandardMaterial color={palette.eyeDark} clippingPlanes={BOARD_CLIP} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[0, 0.32, 0.4]}>
      {[-0.18, 0.18].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.13, 14, 12]} />
            <meshStandardMaterial color={palette.eyeWhite} clippingPlanes={BOARD_CLIP} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <meshStandardMaterial color={palette.eyeDark} clippingPlanes={BOARD_CLIP} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.28, 0.1]}>
        <torusGeometry args={[0.1, 0.026, 6, 12, Math.PI]} />
        <meshStandardMaterial color={palette.eyeDark} clippingPlanes={BOARD_CLIP} />
      </mesh>
    </group>
  )
}

/** Chunks of guacamole thrown out by a successful whack. */
const Splat = ({ kind, hitAt }: { kind: AvocadoKind; hitAt: number }) => {
  const group = useRef<Group>(null)
  const chunks = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const angle = (index / 7) * Math.PI * 2
        return {
          id: `chunk-${index}`,
          direction: [Math.cos(angle), 0.9 + (index % 3) * 0.25, Math.sin(angle)] as const,
          size: 0.07 + (index % 3) * 0.02,
        }
      }),
    [],
  )

  useFrame(() => {
    if (!group.current) return
    const t = clamp((clock.elapsed - hitAt) / (HIT_SECONDS * 1.6), 0, 1)
    group.current.children.forEach((child, index) => {
      const chunk = chunks[index]
      if (!chunk) return
      const [dx, dy, dz] = chunk.direction
      child.position.set(dx * t * 0.9, 0.35 + dy * t * 0.8 - 2.4 * t * t, dz * t * 0.9)
      child.scale.setScalar(Math.max(0.001, 1 - t))
    })
  })

  return (
    <group ref={group}>
      {chunks.map((chunk) => (
        <mesh key={chunk.id}>
          <icosahedronGeometry args={[chunk.size, 0]} />
          <meshStandardMaterial color={kind === 'golden' ? palette.goldenGlow : palette.flesh} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export const Avocado = ({ holeIndex, occupant }: { holeIndex: number; occupant: Occupant }) => {
  const group = useRef<Group>(null)
  const body = useRef<Mesh>(null)
  const whack = useGameStore((state) => state.whack)
  const position = holePositions[holeIndex] ?? [0, 0, 0]

  useFrame(() => {
    const node = group.current
    if (!node) return

    if (occupant.hitAt !== null) {
      const t = clamp((clock.elapsed - occupant.hitAt) / HIT_SECONDS, 0, 1)
      const eased = easeOutCubic(t)
      node.position.y = lerp(Y_UP, Y_DOWN, t ** 3)
      node.scale.set(1 + 0.55 * eased, Math.max(0.05, 1 - 0.75 * eased), 1 + 0.55 * eased)
      node.rotation.z = eased * 0.3
      return
    }

    const age = clock.elapsed - occupant.spawnedAt
    const retreatStart = Math.max(RISE_SECONDS, occupant.upTime - RETREAT_SECONDS)

    if (age < RISE_SECONDS) {
      node.position.y = lerp(Y_DOWN, Y_UP, easeOutBack(clamp(age / RISE_SECONDS, 0, 1)))
    } else if (age >= retreatStart) {
      const t = clamp((age - retreatStart) / RETREAT_SECONDS, 0, 1)
      node.position.y = lerp(Y_UP, Y_DOWN, easeInCubic(t))
    } else {
      node.position.y = Y_UP
    }

    node.scale.set(1, 1, 1)
    node.rotation.z = Math.sin((clock.elapsed + occupant.id) * 6) * 0.05
    if (occupant.kind === 'golden' && body.current) {
      body.current.rotation.y = clock.elapsed * 1.6
    }
  })

  return (
    <group position={[position[0], 0, position[2]]}>
      {occupant.hitAt !== null && <Splat kind={occupant.kind} hitAt={occupant.hitAt} />}
      <group ref={group} position={[0, Y_DOWN, 0]}>
        {/* Taps are caught by the column below, which encloses this body. */}
        <mesh ref={body} geometry={bodyGeometry} castShadow>
          <meshStandardMaterial
            color={skinFor(occupant.kind)}
            flatShading
            roughness={occupant.kind === 'golden' ? 0.25 : 0.75}
            metalness={occupant.kind === 'golden' ? 0.5 : 0}
            emissive={occupant.kind === 'golden' ? palette.goldenGlow : '#000000'}
            emissiveIntensity={occupant.kind === 'golden' ? 0.35 : 0}
            clippingPlanes={BOARD_CLIP}
          />
        </mesh>

        <mesh position={[0, 0.93, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.06, 0.16, 6]} />
          <meshStandardMaterial color={palette.pit} flatShading clippingPlanes={BOARD_CLIP} />
        </mesh>

        {occupant.kind === 'rotten' &&
          [
            [0.3, 0.1, 0.3],
            [-0.35, -0.15, 0.2],
            [0.1, -0.3, -0.35],
          ].map(([x, y, z]) => (
            <mesh key={`${x}-${y}`} position={[x ?? 0, y ?? 0, z ?? 0]} scale={[1, 1, 0.4]}>
              <sphereGeometry args={[0.11, 8, 6]} />
              <meshStandardMaterial color={palette.rottenSpot} clippingPlanes={BOARD_CLIP} />
            </mesh>
          ))}

        <Face kind={occupant.kind} />

        <mesh
          position={[0, HIT_CENTRE, 0]}
          onPointerMove={markPointerSeen}
          onPointerDown={(event) => {
            event.stopPropagation()
            markPointerSeen()
            swingMallet()
            whack(holeIndex)
          }}
        >
          <cylinderGeometry args={[HIT_RADIUS, HIT_RADIUS, HIT_HEIGHT, 12, 1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
