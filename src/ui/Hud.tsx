import { BOWL_TARGET_HITS } from '../game/config'
import { bowlFill, multiplierForCombo } from '../game/scoring'
import { useGameStore } from '../game/store'
import { strings } from '../strings'

export const Hud = () => {
  const displayTime = useGameStore((state) => state.displayTime)
  const totals = useGameStore((state) => state.totals)

  const multiplier = multiplierForCombo(totals.combo)
  const fill = bowlFill(totals.goodHits)
  const lowOnTime = displayTime <= 10

  return (
    <div className='hud'>
      <div className='hud__row'>
        <div className='stat'>
          <span className='stat__label'>{strings.hudScore}</span>
          <span className='stat__value'>{totals.score}</span>
        </div>

        <div className={`stat stat--time${lowOnTime ? ' stat--urgent' : ''}`}>
          <span className='stat__label'>{strings.hudTime}</span>
          <span className='stat__value'>{displayTime}</span>
        </div>

        {/* Kept empty so the timer stays centred and the sound toggle has room. */}
        <div className='hud__spacer' />
      </div>

      <div className='hud__row hud__row--bottom'>
        <div className='bowl'>
          <div className='bowl__head'>
            <span>{strings.hudBowl}</span>
            <span>
              {Math.min(totals.goodHits, BOWL_TARGET_HITS)}/{BOWL_TARGET_HITS}
            </span>
          </div>
          <div className='bowl__track'>
            <div className='bowl__fill' style={{ width: `${fill * 100}%` }} />
          </div>
        </div>

        {multiplier > 1 && (
          <span key={multiplier} className='multiplier'>
            {strings.multiplier(multiplier)}
          </span>
        )}
      </div>
    </div>
  )
}
