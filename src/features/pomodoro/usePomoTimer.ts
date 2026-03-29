import { useEffect } from 'react'
import { usePomoStore } from '../../store/usePomoStore'

export function usePomoTimer(): void {
  const session = usePomoStore((state) => state.session)
  const tickOccurred = usePomoStore((state) => state.tickOccurred)

  useEffect(() => {
    if (!session) {
      return
    }

    const timerId = window.setInterval(() => {
      tickOccurred()
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [session, tickOccurred])
}
