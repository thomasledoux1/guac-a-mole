import { useGameStore } from '../game/store'
import { strings } from '../strings'

export const MuteButton = () => {
  const muted = useGameStore((state) => state.muted)
  const toggleMuted = useGameStore((state) => state.toggleMuted)

  return (
    <button type='button' className='mute' onClick={toggleMuted} aria-label={muted ? strings.muteOn : strings.muteOff}>
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
