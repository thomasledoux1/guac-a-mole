import { useEffect } from 'react'

import { useGameStore } from '../game/store'

/** Nobody should lose seconds to a phone call or a switched tab. */
export const usePauseWhenHidden = () => {
  useEffect(() => {
    const pause = () => useGameStore.getState().pause()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') pause()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', pause)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', pause)
    }
  }, [])
}
