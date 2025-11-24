import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  eventId: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  type?: string;
}

const initialState: BookingState = {
  eventId: '',
  title: '',
  price: 0,
  quantity: 1,
  total: 0,
  type: '',
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBooking: (state, action: PayloadAction<BookingState>) => {
      return { ...action.payload };
    },
    clearBooking: () => initialState,
  },
});

export const { setBooking, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer; 