import { Analytics } from '@vercel/analytics/react'

import { useGameStore } from './game/store'
import { usePauseWhenHidden } from './hooks/usePauseWhenHidden'
import { Scene } from './three/Scene'
import { Countdown } from './ui/Countdown'
import { Hud } from './ui/Hud'
import { MuteButton } from './ui/MuteButton'
import { PauseOverlay } from './ui/PauseOverlay'
import { ResultsScreen } from './ui/ResultsScreen'
import { TitleScreen } from './ui/TitleScreen'

export const App = () => {
  const phase = useGameStore((state) => state.phase)
  usePauseWhenHidden()

  const inRound = phase === 'countdown' || phase === 'playing' || phase === 'paused'

  return (
    <div className='app'>
      <Scene />
      {inRound && <Hud />}
      <MuteButton />
      {phase === 'title' && <TitleScreen />}
      {phase === 'countdown' && <Countdown />}
      {phase === 'paused' && <PauseOverlay />}
      {phase === 'results' && <ResultsScreen />}
      <Analytics />
    </div>
  )
}
