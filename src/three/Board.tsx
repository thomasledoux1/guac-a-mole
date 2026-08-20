import { BackSide, ExtrudeGeometry, Path, Shape } from 'three'

import { BOARD_DEPTH, BOARD_THICKNESS, BOARD_WIDTH, HOLE_RADIUS } from '../game/config'
import { holePositions } from '../game/layout'
import { palette } from './palette'

const CORNER_RADIUS = 0.22
const BEVEL = 0.05

/**
 * A rounded slab with nine real openings cut through it. Cutting the holes
 * rather than painting dark circles on the surface is what lets an avocado sit
 * inside one and still look like it is in a hole.
 */
const buildBoard = () => {
  const halfWidth = BOARD_WIDTH / 2
  const halfDepth = BOARD_DEPTH / 2
  const shape = new Shape()

  shape.moveTo(-halfWidth + CORNER_RADIUS, -halfDepth)
  shape.lineTo(halfWidth - CORNER_RADIUS, -halfDepth)
  shape.quadraticCurveTo(halfWidth, -halfDepth, halfWidth, -halfDepth + CORNER_RADIUS)
  shape.lineTo(halfWidth, halfDepth - CORNER_RADIUS)
  shape.quadraticCurveTo(halfWidth, halfDepth, halfWidth - CORNER_RADIUS, halfDepth)
  shape.lineTo(-halfWidth + CORNER_RADIUS, halfDepth)
  shape.quadraticCurveTo(-halfWidth, halfDepth, -halfWidth, halfDepth - CORNER_RADIUS)
  shape.lineTo(-halfWidth, -halfDepth + CORNER_RADIUS)
  shape.quadraticCurveTo(-halfWidth, -halfDepth, -halfWidth + CORNER_RADIUS, -halfDepth)

  for (const [x, , z] of holePositions) {
    const hole = new Path()
    // The shape lives in XY and is laid down later, so depth arrives as -y.
    hole.absarc(x, -z, HOLE_RADIUS, 0, Math.PI * 2, true)
    shape.holes.push(hole)
  }

  const geometry = new ExtrudeGeometry(shape, {
    depth: BOARD_THICKNESS,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 2,
    curveSegments: 18,
  })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, -(BOARD_THICKNESS + BEVEL), 0)
  return geometry
}

const boardGeometry = buildBoard()

/** Stops just short of the counter, so the two surfaces never fight over pixels. */
const SHAFT_DEPTH = BOARD_THICKNESS - 0.02

/** The dark shaft an avocado waits in, seen through the cut opening. */
const HoleShaft = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, -SHAFT_DEPTH / 2, 0]}>
      <cylinderGeometry args={[HOLE_RADIUS, HOLE_RADIUS, SHAFT_DEPTH, 18, 1, true]} />
      <meshStandardMaterial color={palette.holeInner} side={BackSide} roughness={1} />
    </mesh>
    <mesh position={[0, -SHAFT_DEPTH, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[HOLE_RADIUS, 18]} />
      <meshStandardMaterial color={palette.holeFloor} roughness={1} />
    </mesh>
  </group>
)

export const Board = () => (
  <group>
    <mesh geometry={boardGeometry} castShadow receiveShadow>
      <meshStandardMaterial color={palette.boardTop} roughness={0.85} flatShading />
    </mesh>

    {holePositions.map((position) => (
      <HoleShaft key={`${position[0]}-${position[2]}`} position={position} />
    ))}
  </group>
)
