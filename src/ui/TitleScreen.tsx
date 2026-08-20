import { useGameStore } from '../game/store'
import { strings } from '../strings'

export const TitleScreen = () => {
  const startCountdown = useGameStore((state) => state.startCountdown)
  const best = useGameStore((state) => state.best)

  return (
    <div className='overlay overlay--bottom'>
      <div className='panel'>
        <h1 className='panel__title'>{strings.title}</h1>
        <p className='panel__tagline'>{strings.tagline}</p>

        <h2 className='panel__subtitle'>{strings.howToTitle}</h2>
        <ul className='rules'>
          {strings.howTo.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <button type='button' className='button' onClick={startCountdown}>
          {strings.play}
        </button>

        {best > 0 && (
          <p className='panel__footnote'>
            {strings.hudBest}: {best}
          </p>
        )}
      </div>
    </div>
  )
}
