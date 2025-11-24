import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import eventReducer from './slices/eventSlice'
import ticketReducer from './slices/ticketSlice'
import bookingReducer from './slices/bookingSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    event: eventReducer,
    ticket: ticketReducer,
    booking: bookingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 