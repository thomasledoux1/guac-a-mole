import { accuracy, gradeFor } from '../game/scoring'
import { useGameStore } from '../game/store'
import { strings } from '../strings'

export const ResultsScreen = () => {
  const totals = useGameStore((state) => state.totals)
  const best = useGameStore((state) => state.best)
  const isNewBest = useGameStore((state) => state.isNewBest)
  const startCountdown = useGameStore((state) => state.startCountdown)

  const grade = strings.results[gradeFor(totals.score)]

  return (
    <div className='overlay overlay--bottom'>
      <div className='panel'>
        <h2 className='panel__title panel__title--small'>{grade.title}</h2>
        <p className='panel__tagline'>{grade.blurb}</p>

        <p className='score'>
          <span className='score__label'>{strings.finalScore}</span>
          <span className='score__value'>{totals.score}</span>
        </p>
        {isNewBest && <p className='badge'>{strings.newBest}</p>}

        <dl className='stats'>
          <div>
            <dt>{strings.statAvocados}</dt>
            <dd>{totals.goodHits}</dd>
          </div>
          <div>
            <dt>{strings.statCombo}</dt>
            <dd>{totals.maxCombo}</dd>
          </div>
          <div>
            <dt>{strings.statAccuracy}</dt>
            <dd>{Math.round(accuracy(totals) * 100)}%</dd>
          </div>
        </dl>

        <button type='button' className='button' onClick={startCountdown}>
          {strings.playAgain}
        </button>

        <p className='panel__footnote'>
          {strings.hudBest}: {best}
        </p>
      </div>
    </div>
  )
}
