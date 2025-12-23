import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { API_ENDPOINTS } from '@/lib/api'
import { handleApiError } from '@/lib/errorHandler'

export interface Event {
  _id: string
  title: string
  description: string
  date: string
  location: string
  img: string
  price: number
  capacity: number
  organizerId: string
  category: string
  status: 'draft' | 'published' | 'cancelled'
  views: number
  ticketTypes: TicketType[]
}

export interface TicketType {
  name: string
  description?: string
  price: number
  available: number
  sold: number
  purchaseLimit?: number
}

// Fetch all events
export const useEvents = () => {
  return useQuery<Event[], Error>(
    ['events'],
    async () => {
      const response = await api.get<Event[]>(API_ENDPOINTS.EVENTS)
      return response.data
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      onError: (error) => {
        console.error('Error fetching events:', handleApiError(error))
      },
    }
  )
}

// Fetch single event by ID
export const useEvent = (id: string | undefined) => {
  return useQuery<Event, Error>(
    ['event', id],
    async () => {
      if (!id) throw new Error('Event ID is required')
      const response = await api.get<Event>(API_ENDPOINTS.EVENT_BY_ID(id))
      return response.data
    },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      onError: (error) => {
        console.error('Error fetching event:', handleApiError(error))
      },
    }
  )
}

// Fetch events by IDs
export const useEventsByIds = (ids: string[]) => {
  return useQuery<Event[], Error>(
    ['events', 'by-ids', ids],
    async () => {
      if (ids.length === 0) return []
      const response = await api.get<Event[]>(API_ENDPOINTS.EVENTS_BY_IDS, {
        ids: ids.join(','),
      })
      return response.data
    },
    {
      enabled: ids.length > 0,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  )
}

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation<Event, Error, Partial<Event>>(
    async (eventData) => {
      const response = await api.post<Event>(API_ENDPOINTS.EVENTS, eventData)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events'])
      },
      onError: (error) => {
        console.error('Error creating event:', handleApiError(error))
      },
    }
  )
}

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation<Event, Error, { id: string; data: Partial<Event> }>(
    async ({ id, data }) => {
      const response = await api.put<Event>(API_ENDPOINTS.EVENT_BY_ID(id), data)
      return response.data
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['events'])
        queryClient.invalidateQueries(['event', data._id])
      },
      onError: (error) => {
        console.error('Error updating event:', handleApiError(error))
      },
    }
  )
}

// Delete event mutation
export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>(
    async (id) => {
      await api.delete(API_ENDPOINTS.EVENT_BY_ID(id))
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events'])
      },
      onError: (error) => {
        console.error('Error deleting event:', handleApiError(error))
      },
    }
  )
}
