import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Box3, MathUtils, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { BOARD_DEPTH, BOARD_THICKNESS, BOARD_WIDTH, BOWL_POSITION } from '../game/config'
import { useGameStore } from '../game/store'
import { damp } from './easing'
import { fitCameraToBox } from './fitCamera'

import type { PerspectiveCamera as PerspectiveCameraType } from 'three'

const tilt = (degrees: number) => {
  const radians = (degrees * Math.PI) / 180
  return new Vector3(0, Math.sin(radians), Math.cos(radians)).normalize()
}

const PLAY = {
  box: new Box3(
    new Vector3(-BOARD_WIDTH / 2, -BOARD_THICKNESS, BOWL_POSITION[2] - 1.15),
    new Vector3(BOARD_WIDTH / 2, 1.45, BOARD_DEPTH / 2),
  ),
  target: new Vector3(0, 0.05, -0.8),
  direction: tilt(42),
  margin: { portrait: 1.05, landscape: 1.05 },
  /** Share of the frame height the framing is pushed upwards by. */
  offset: { portrait: 0, landscape: 0 },
}

const RESULTS = {
  box: new Box3(
    new Vector3(-1.45, -BOARD_THICKNESS, BOWL_POSITION[2] - 1.45),
    new Vector3(1.45, 0.85, BOWL_POSITION[2] + 1.45),
  ),
  target: new Vector3(0, 0, BOWL_POSITION[2]),
  direction: tilt(26),
  /** Pushed upwards, so the results panel never covers the finished bowl. */
  margin: { portrait: 1.12, landscape: 1.75 },
  offset: { portrait: 0.3, landscape: 0.2 },
}

/** The board, pulled back and pushed up so the title panel can sit under it. */
const TITLE = {
  box: PLAY.box,
  target: PLAY.target,
  direction: PLAY.direction,
  margin: { portrait: 1.05, landscape: 1.3 },
  offset: { portrait: 0.2, landscape: 0.15 },
}

type Pose = { position: Vector3; quaternion: Quaternion; offset: number }

const emptyPose = (): Pose => ({ position: new Vector3(), quaternion: new Quaternion(), offset: 0 })

/**
 * Frames the whole scene whatever the screen shape, then glides to the bowl
 * once the round is over.
 */
export const CameraRig = () => {
  const camera = useThree((state) => state.camera) as PerspectiveCameraType
  const size = useThree((state) => state.size)
  const phase = useGameStore((state) => state.phase)

  const scratch = useMemo(() => new PerspectiveCamera(), [])
  const offset = useRef(0)
  const poses = useRef({ title: emptyPose(), play: emptyPose(), results: emptyPose() })
  const settled = useRef(false)

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(1, size.height)

    for (const [key, view] of [
      ['title', TITLE],
      ['play', PLAY],
      ['results', RESULTS],
    ] as const) {
      scratch.fov = camera.fov
      scratch.aspect = aspect
      scratch.near = camera.near
      scratch.far = camera.far
      const portrait = aspect < 1
      fitCameraToBox(
        scratch,
        view.box,
        view.target,
        view.direction,
        portrait ? view.margin.portrait : view.margin.landscape,
      )
      poses.current[key].offset = portrait ? view.offset.portrait : view.offset.landscape
      poses.current[key].position.copy(scratch.position)
      poses.current[key].quaternion.copy(scratch.quaternion)
    }

    if (!settled.current) {
      settled.current = true
      camera.position.copy(poses.current.title.position)
      camera.quaternion.copy(poses.current.title.quaternion)
      camera.updateProjectionMatrix()
    }
  }, [size, camera, scratch])

  useFrame((_, delta) => {
    const pose =
      phase === 'results' ? poses.current.results : phase === 'title' ? poses.current.title : poses.current.play
    const factor = damp(2.4, delta)
    camera.position.lerp(pose.position, factor)
    camera.quaternion.slerp(pose.quaternion, factor)

    // Shifting the frustum rather than the camera keeps the perspective intact,
    // so the board in the foreground does not loom as the framing rises.
    offset.current = MathUtils.lerp(offset.current, pose.offset, factor)
    if (offset.current < 0.002) camera.clearViewOffset()
    else {
      camera.setViewOffset(size.width, size.height, 0, offset.current * size.height, size.width, size.height)
    }
  })

  return null
}
