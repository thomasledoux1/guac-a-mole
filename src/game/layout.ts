import { GRID_COLS, GRID_ROWS, HOLE_COUNT, HOLE_SPACING } from './config'

/** World position of a hole's centre on the board surface. */
export const holePosition = (index: number): [number, number, number] => {
  const col = index % GRID_COLS
  const row = Math.floor(index / GRID_COLS)
  return [(col - (GRID_COLS - 1) / 2) * HOLE_SPACING, 0, (row - (GRID_ROWS - 1) / 2) * HOLE_SPACING]
}

export const holePositions = Array.from({ length: HOLE_COUNT }, (_, index) => holePosition(index))
