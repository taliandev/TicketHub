import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Event {
  id: string
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
}

interface EventState {
  events: Event[]
  currentEvent: Event | null
  loading: boolean
  error: string | null
}

const initialState: EventState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
}

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    fetchEventsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchEventsSuccess: (state, action: PayloadAction<Event[]>) => {
      state.loading = false
      state.events = action.payload
    },
    fetchEventsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    fetchEventByIdStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchEventByIdSuccess: (state, action: PayloadAction<Event>) => {
      state.loading = false
      state.currentEvent = action.payload
    },
    fetchEventByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    createEventStart: (state) => {
      state.loading = true
      state.error = null
    },
    createEventSuccess: (state, action: PayloadAction<Event>) => {
      state.loading = false
      state.events.push(action.payload)
    },
    createEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    updateEventStart: (state) => {
      state.loading = true
      state.error = null
    },
    updateEventSuccess: (state, action: PayloadAction<Event>) => {
      state.loading = false
      const index = state.events.findIndex((event) => event.id === action.payload.id)
      if (index !== -1) {
        state.events[index] = action.payload
      }
      if (state.currentEvent?.id === action.payload.id) {
        state.currentEvent = action.payload
      }
    },
    updateEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    deleteEventStart: (state) => {
      state.loading = true
      state.error = null
    },
    deleteEventSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.events = state.events.filter((event) => event.id !== action.payload)
      if (state.currentEvent?.id === action.payload) {
        state.currentEvent = null
      }
    },
    deleteEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
  },
})

export const {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  fetchEventByIdStart,
  fetchEventByIdSuccess,
  fetchEventByIdFailure,
  createEventStart,
  createEventSuccess,
  createEventFailure,
  updateEventStart,
  updateEventSuccess,
  updateEventFailure,
  deleteEventStart,
  deleteEventSuccess,
  deleteEventFailure,
} = eventSlice.actions

export default eventSlice.reducer 