import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  toggleCart as toggleCartAction,
  openCart as openCartAction,
  closeCart as closeCartAction,
  CartItem,
} from '@/store/slices/cartSlice'

export const useCart = () => {
  const dispatch = useDispatch()
  const { items, isOpen } = useSelector((state: RootState) => state.cart)

  const addToCart = (item: CartItem) => {
    dispatch(addToCartAction(item))
  }

  const removeFromCart = (id: string) => {
    dispatch(removeFromCartAction(id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantityAction({ id, quantity }))
  }

  const clearCart = () => {
    dispatch(clearCartAction())
  }

  const toggleCart = () => {
    dispatch(toggleCartAction())
  }

  const openCart = () => {
    dispatch(openCartAction())
  }

  const closeCart = () => {
    dispatch(closeCartAction())
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.ticketPrice * item.quantity,
    0
  )

  const isInCart = (eventId: string, ticketType: string) => {
    return items.some(
      (item) => item.eventId === eventId && item.ticketType === ticketType
    )
  }

  return {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    isInCart,
  }
}
