import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Plane, Raycaster, Vector3 } from 'three'

import { BOARD_DEPTH, BOARD_WIDTH } from '../game/config'
import { clamp, lerp } from '../game/difficulty'
import { damp } from './easing'
import { malletControl } from './malletControl'
import { palette } from './palette'

import type { Group } from 'three'

/**
 * Handle lean. The roll holds the handle out to the right so the mallet reads as
 * being held, and the constant tilt brings it a little towards the camera so it
 * never flattens into the view axis and vanishes.
 */
const REST_ROLL = MathUtils.degToRad(-34)
const STRUCK_ROLL = MathUtils.degToRad(-12)
const LEAN = MathUtils.degToRad(12)

/**
 * The head rides a horizontal plane above the board. Solving the pointer ray
 * against that plane is what puts the head under the cursor: aiming at the
 * board itself and then lifting the mallet would draw it a screen inch away
 * from what the click is about to hit. The plane sits above the avocados so the
 * head always ends up on the camera side of whatever it is aimed at.
 */
const AIM_HEIGHT = 1.15
const SWING_SECONDS = 0.2

/** How far the head drops down the screen on a swing. */
const SWING_DIP = 0.5

/** How far past the board edge the head may stray, so corners stay reachable. */
const OVERHANG = 0.6
const MAX_X = BOARD_WIDTH / 2 + OVERHANG
const MAX_Z = BOARD_DEPTH / 2 + OVERHANG

/** A cartoon mallet whose head tracks the cursor and swings on tap. */
export const Mallet = () => {
  const camera = useThree((state) => state.camera)
  const pointer = useThree((state) => state.pointer)

  const group = useRef<Group>(null)
  const pivot = useRef<Group>(null)
  const elapsed = useRef(0)
  const swingEndsAt = useRef(-1)
  const seenSwings = useRef(malletControl.swings)

  // Its own raycaster, so nothing here disturbs the one pointer events use.
  const aim = useMemo(
    () => ({
      caster: new Raycaster(),
      plane: new Plane(new Vector3(0, 1, 0), -AIM_HEIGHT),
      hit: new Vector3(),
      /** Where the head is aimed, before the swing dips it down the screen. */
      at: new Vector3(0, AIM_HEIGHT, 1.4),
      screenUp: new Vector3(),
      dip: 0,
    }),
    [],
  )

  useFrame((_, delta) => {
    elapsed.current += delta

    const struck = seenSwings.current !== malletControl.swings
    if (struck) {
      seenSwings.current = malletControl.swings
      swingEndsAt.current = elapsed.current + SWING_SECONDS
    }

    const swinging = elapsed.current < swingEndsAt.current
    const settle = damp(swinging ? 34 : 11, delta)

    const node = group.current
    if (node) {
      // Stays out of sight until the pointer has told us where to put it.
      node.visible = malletControl.moved

      aim.caster.setFromCamera(pointer, camera)
      if (aim.caster.ray.intersectPlane(aim.plane, aim.hit)) {
        // A tap snaps rather than trails, so the head is where it was clicked.
        const follow = struck ? 1 : damp(30, delta)
        aim.at.x = lerp(aim.at.x, clamp(aim.hit.x, -MAX_X, MAX_X), follow)
        aim.at.z = lerp(aim.at.z, clamp(aim.hit.z, -MAX_Z, MAX_Z), follow)
      }

      // Dipping along the camera's own up axis reads as a swing on screen while
      // keeping the head at the same depth, so it never sinks behind its target.
      aim.dip = lerp(aim.dip, swinging ? SWING_DIP : 0, settle)
      aim.screenUp.setFromMatrixColumn(camera.matrixWorld, 1)
      node.position.copy(aim.at).addScaledVector(aim.screenUp, -aim.dip)
    }

    if (pivot.current) {
      pivot.current.rotation.z = lerp(pivot.current.rotation.z, swinging ? STRUCK_ROLL : REST_ROLL, settle)
    }
  })

  return (
    <group ref={group} position={[0, AIM_HEIGHT, 1.4]}>
      <group ref={pivot} rotation={[LEAN, 0, REST_ROLL]}>
        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.065, 1.55, 10]} />
          <meshStandardMaterial color={palette.malletHandle} flatShading roughness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.27, 0.42, 4, 14]} />
          <meshStandardMaterial color={palette.malletHead} flatShading roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.24, 10]} />
          <meshStandardMaterial color={palette.malletHandle} flatShading roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
