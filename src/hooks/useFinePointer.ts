import { useEffect, useState } from 'react'

const QUERY = '(hover: hover) and (pointer: fine)'

/** True for mouse and trackpad, false for touch. Drives whether we draw a mallet. */
export const useFinePointer = () => {
  const [fine, setFine] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const update = (event: MediaQueryListEvent) => setFine(event.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return fine
}
