import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  id: string
  eventId: string
  eventTitle: string
  eventImage: string
  eventDate: string
  eventLocation: string
  ticketType: string
  ticketPrice: number
  quantity: number
  maxQuantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

const initialState: CartState = {
  items: [],
  isOpen: false,
}

// Load cart from localStorage on init
const loadCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('tickethub_cart')
    return savedCart ? JSON.parse(savedCart) : []
  } catch (error) {
    console.error('Error loading cart from storage:', error)
    return []
  }
}

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem('tickethub_cart', JSON.stringify(items))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ...initialState,
    items: loadCartFromStorage(),
  },
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) =>
          item.eventId === action.payload.eventId &&
          item.ticketType === action.payload.ticketType
      )

      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = Math.min(
          existingItem.quantity + action.payload.quantity,
          existingItem.maxQuantity
        )
        existingItem.quantity = newQuantity
      } else {
        // Add new item
        state.items.push(action.payload)
      }

      saveCartToStorage(state.items)
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      saveCartToStorage(state.items)
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id)
      if (item) {
        item.quantity = Math.min(
          Math.max(1, action.payload.quantity),
          item.maxQuantity
        )
      }
      saveCartToStorage(state.items)
    },

    clearCart: (state) => {
      state.items = []
      saveCartToStorage([])
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },

    openCart: (state) => {
      state.isOpen = true
    },

    closeCart: (state) => {
      state.isOpen = false
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions

export default cartSlice.reducer
