import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useEventsByIds } from './useEvents'

const MAX_RECENT_EVENTS = 8

export const useRecentEvents = () => {
  const [recentEventIds, setRecentEventIds, clearRecentEventIds] = useLocalStorage<string[]>(
    'recentEvents',
    []
  )

  const { data: recentEvents = [], isLoading, error } = useEventsByIds(recentEventIds)

  const addRecentEvent = useCallback(
    (eventId: string) => {
      setRecentEventIds((prev) => {
        // Remove if already exists
        const filtered = prev.filter((id) => id !== eventId)
        // Add to beginning and limit to MAX_RECENT_EVENTS
        return [eventId, ...filtered].slice(0, MAX_RECENT_EVENTS)
      })
    },
    [setRecentEventIds]
  )

  const clearRecentEvents = useCallback(() => {
    clearRecentEventIds()
  }, [clearRecentEventIds])

  return {
    recentEvents,
    recentEventIds,
    addRecentEvent,
    clearRecentEvents,
    isLoading,
    error,
  }
}
