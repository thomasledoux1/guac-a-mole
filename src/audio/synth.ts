/**
 * Every sound in the game is generated here with the Web Audio API, so the
 * build ships no audio files.
 */

let context: AudioContext | null = null
let muted = false

const audioContext = () => {
  if (context) return context
  const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context = new Ctor()
  return context
}

/** Must run inside a user gesture: browsers block audio started any other way. */
export const unlockAudio = () => {
  const ctx = audioContext()
  if (ctx && ctx.state === 'suspended') void ctx.resume()
}

export const setMuted = (value: boolean) => {
  muted = value
}

type ToneOptions = {
  freq: number
  duration: number
  type?: OscillatorType
  gain?: number
  slideTo?: number
  delay?: number
}

const tone = ({ freq, duration, type = 'triangle', gain = 0.18, slideTo, delay = 0 }: ToneOptions) => {
  const ctx = audioContext()
  if (!ctx || muted) return

  const startAt = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, startAt)
  if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(slideTo, startAt + duration)

  amp.gain.setValueAtTime(0.0001, startAt)
  amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  osc.connect(amp).connect(ctx.destination)
  osc.start(startAt)
  osc.stop(startAt + duration + 0.02)
}

const noise = (duration: number, gain = 0.12) => {
  const ctx = audioContext()
  if (!ctx || muted) return

  const frames = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2
  }

  const source = ctx.createBufferSource()
  const amp = ctx.createGain()
  amp.gain.value = gain
  source.buffer = buffer
  source.connect(amp).connect(ctx.destination)
  source.start()
}

/** Pitch climbs with the combo, so a streak sounds like one rising phrase. */
export const playHit = (combo: number) => {
  const step = Math.min(combo, 12)
  tone({ freq: 220 * 2 ** (step / 12), duration: 0.12, type: 'triangle', gain: 0.2 })
  noise(0.07, 0.08)
}

export const playGolden = () => {
  tone({ freq: 660, duration: 0.1, type: 'square', gain: 0.12 })
  tone({ freq: 880, duration: 0.1, type: 'square', gain: 0.12, delay: 0.07 })
  tone({ freq: 1320, duration: 0.18, type: 'square', gain: 0.12, delay: 0.14 })
}

export const playRotten = () => {
  tone({ freq: 180, duration: 0.32, type: 'sawtooth', gain: 0.22, slideTo: 70 })
  noise(0.18, 0.1)
}

export const playMiss = () => {
  tone({ freq: 150, duration: 0.09, type: 'sine', gain: 0.1, slideTo: 90 })
}

export const playCountdownTick = (isFinal: boolean) => {
  tone({ freq: isFinal ? 880 : 520, duration: isFinal ? 0.24 : 0.1, type: 'square', gain: 0.14 })
}

export const playRoundOver = () => {
  const melody = [523, 659, 784, 1046]
  melody.forEach((freq, index) => {
    tone({ freq, duration: 0.22, type: 'triangle', gain: 0.16, delay: index * 0.12 })
  })
}
