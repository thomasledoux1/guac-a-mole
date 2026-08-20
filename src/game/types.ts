export type AvocadoKind = 'normal' | 'rotten' | 'golden'

export type Phase = 'title' | 'countdown' | 'playing' | 'paused' | 'results'

export type Grade = 'sad' | 'decent' | 'legendary'

export type Occupant = {
  id: number
  kind: AvocadoKind
  /** Game-clock time, in seconds, at which this avocado started rising. */
  spawnedAt: number
  /** Seconds the avocado stays out of its hole before retreating. */
  upTime: number
  /** Game-clock time of the whack, or null while it is still standing. */
  hitAt: number | null
}

export type HoleSlot = Occupant | null

export type RunTotals = {
  score: number
  combo: number
  maxCombo: number
  goodHits: number
  rottenHits: number
  taps: number
}

export type ScorePop = {
  id: number
  holeIndex: number
  text: string
  tone: 'good' | 'bad' | 'golden'
}
