import { Plane, Vector3 } from 'three'

/**
 * Keeps only the geometry above the board surface, so an avocado waiting in its
 * hole is genuinely hidden rather than merely tucked behind the rim.
 */
export const BOARD_CLIP = [new Plane(new Vector3(0, 1, 0), 0)]
