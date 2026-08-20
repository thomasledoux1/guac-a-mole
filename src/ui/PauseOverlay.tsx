import { useGameStore } from '../game/store'
import { strings } from '../strings'

export const PauseOverlay = () => {
  const resume = useGameStore((state) => state.resume)
  const openTitle = useGameStore((state) => state.openTitle)

  return (
    <div className='overlay'>
      <div className='panel panel--compact'>
        <h2 className='panel__title panel__title--small'>{strings.paused}</h2>
        <button type='button' className='button' onClick={resume}>
          {strings.resume}
        </button>
        <button type='button' className='button button--quiet' onClick={openTitle}>
          {strings.quit}
        </button>
      </div>
    </div>
  )
}
