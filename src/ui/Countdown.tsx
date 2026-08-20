import { useEffect, useState } from 'react'

import { playCountdownTick } from '../audio/synth'
import { useGameStore } from '../game/store'
import { strings } from '../strings'

const STEPS = [3, 2, 1, 0] as const

export const Countdown = () => {
  const startRound = useGameStore((state) => state.startRound)
  const [value, setValue] = useState<number>(STEPS[0])

  useEffect(() => {
    playCountdownTick(false)
    let index = 0

    const timer = window.setInterval(() => {
      index += 1
      const step = STEPS[index]
      if (step === undefined) {
        window.clearInterval(timer)
        startRound()
        return
      }
      playCountdownTick(step === 0)
      setValue(step)
    }, 700)

    return () => window.clearInterval(timer)
  }, [startRound])

  return (
    <div className='overlay overlay--clear'>
      <span key={value} className='countdown'>
        {value === 0 ? strings.countdownGo : value}
      </span>
    </div>
  )
}
