/** Round shape */
export const ROUND_SECONDS = 60
export const COUNTDOWN_SECONDS = 3
export const BOWL_TARGET_HITS = 30

/** Board layout, in world units. The board's top surface sits at y = 0. */
export const GRID_COLS = 3
export const GRID_ROWS = 3
export const HOLE_COUNT = GRID_COLS * GRID_ROWS
export const HOLE_SPACING = 1.35
export const HOLE_RADIUS = 0.52
export const BOARD_WIDTH = GRID_COLS * HOLE_SPACING + 1.1
export const BOARD_DEPTH = GRID_ROWS * HOLE_SPACING + 1.1
export const BOARD_THICKNESS = 0.45
export const BOWL_POSITION: [number, number, number] = [0, -BOARD_THICKNESS, -3.7]

/** Scoring */
export const POINTS = { normal: 10, golden: 30, rotten: -25 } as const
export const GOLDEN_TIME_BONUS = 3
export const MAX_MULTIPLIER = 5
export const HITS_PER_MULTIPLIER = 3
export const GRADE_THRESHOLDS = { decent: 300, legendary: 700 } as const

/** Difficulty ramp, interpolated across the round */
export const DIFFICULTY = {
  upTime: { start: 1.4, end: 0.6 },
  spawnInterval: { start: 0.9, end: 0.35 },
  rottenChance: { start: 0.1, end: 0.25 },
  goldenChance: 0.07,
  concurrentSteps: [
    { until: 0.25, count: 1 },
    { until: 0.6, count: 2 },
    { until: 1, count: 3 },
  ],
} as const

/** Animation timings, in seconds */
export const RISE_SECONDS = 0.16
export const RETREAT_SECONDS = 0.14
export const HIT_SECONDS = 0.28

/** Storage */
export const BEST_SCORE_KEY = 'guac-a-mole:best'
