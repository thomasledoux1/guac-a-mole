import { MathUtils, Matrix4, Vector3 as Vec3 } from 'three'

import type { Box3, PerspectiveCamera, Vector3 } from 'three'

const corner = new Vec3()
const inverseView = new Matrix4()

/**
 * Places a perspective camera so that every corner of `box` is on screen, with
 * the camera sitting along `direction` from `target`.
 *
 * Moving a camera along its own view axis leaves the camera-space x and y of a
 * point untouched and only changes its depth, so the exact distance can be
 * solved for in one pass instead of guessed at.
 */
export const fitCameraToBox = (
  camera: PerspectiveCamera,
  box: Box3,
  target: Vector3,
  direction: Vector3,
  margin = 1.08,
) => {
  camera.position.copy(target).addScaledVector(direction, 10)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  inverseView.copy(camera.matrixWorld).invert()

  const tanV = Math.tan(MathUtils.degToRad(camera.fov) / 2)
  const tanH = tanV * camera.aspect

  let push = Number.NEGATIVE_INFINITY
  for (let i = 0; i < 8; i++) {
    corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z)
    corner.applyMatrix4(inverseView)
    push = Math.max(
      push,
      (Math.abs(corner.x) * margin) / tanH + corner.z,
      (Math.abs(corner.y) * margin) / tanV + corner.z,
    )
  }

  camera.position.addScaledVector(direction, push)
  camera.updateMatrixWorld()
  camera.updateProjectionMatrix()
}
