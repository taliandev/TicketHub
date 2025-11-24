import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Ticket {
  id: string
  eventId: string
  userId: string
  type: 'regular' | 'vip' | 'early-bird'
  price: number
  quantity: number
  status: 'pending' | 'paid' | 'cancelled'
  purchaseDate: string
  qrCode: string
}

interface TicketState {
  tickets: Ticket[]
  currentTicket: Ticket | null
  loading: boolean
  error: string | null
}

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
}

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    fetchTicketsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchTicketsSuccess: (state, action: PayloadAction<Ticket[]>) => {
      state.loading = false
      state.tickets = action.payload
    },
    fetchTicketsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    fetchTicketByIdStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchTicketByIdSuccess: (state, action: PayloadAction<Ticket>) => {
      state.loading = false
      state.currentTicket = action.payload
    },
    fetchTicketByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    purchaseTicketStart: (state) => {
      state.loading = true
      state.error = null
    },
    purchaseTicketSuccess: (state, action: PayloadAction<Ticket>) => {
      state.loading = false
      state.tickets.push(action.payload)
    },
    purchaseTicketFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    cancelTicketStart: (state) => {
      state.loading = true
      state.error = null
    },
    cancelTicketSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false
      const index = state.tickets.findIndex((ticket) => ticket.id === action.payload)
      if (index !== -1) {
        state.tickets[index].status = 'cancelled'
      }
      if (state.currentTicket?.id === action.payload) {
        state.currentTicket.status = 'cancelled'
      }
    },
    cancelTicketFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
  },
})

export const {
  fetchTicketsStart,
  fetchTicketsSuccess,
  fetchTicketsFailure,
  fetchTicketByIdStart,
  fetchTicketByIdSuccess,
  fetchTicketByIdFailure,
  purchaseTicketStart,
  purchaseTicketSuccess,
  purchaseTicketFailure,
  cancelTicketStart,
  cancelTicketSuccess,
  cancelTicketFailure,
} = ticketSlice.actions

export default ticketSlice.reducer 