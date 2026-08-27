import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import {
  closeCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '@/store/slices/cartSlice'
import { formatEventDate } from '@/lib/eventUtils'

const CartSidebar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, isOpen } = useSelector((state: RootState) => state.cart)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.ticketPrice * item.quantity,
    0
  )

  const handleCheckout = () => {
    dispatch(closeCart())
    navigate('/cart')
  }

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id))
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }))
  }

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) {
      dispatch(clearCart())
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => dispatch(closeCart())}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 mt-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Giỏ hàng</h2>
              <p className="text-sm text-gray-400">{totalItems} vé</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 h-[calc(100vh-360px)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-400 mb-6">
                Chưa có vé nào trong giỏ hàng của bạn
              </p>
              <button
                onClick={() => {
                  dispatch(closeCart())
                  navigate('/events')
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors"
              >
                Khám phá sự kiện
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-colors"
                >
                  {/* Event Title & Type */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                        {item.eventTitle}
                      </h3>
                      <p className="text-purple-400 text-xs font-medium">
                        {item.ticketType}
                      </p>
                    </div>
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Xóa"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Image & Info Row */}
                  <div className="flex gap-3 mb-3">
                    <img
                      src={item.eventImage}
                      alt={item.eventTitle}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{formatEventDate(item.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{item.eventLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-2 py-1">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-1 text-white hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Giảm"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="text-white text-sm font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.maxQuantity}
                        className="p-1 text-white hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Tăng"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Price */}
                    <span className="text-white font-bold text-sm">
                      {(item.ticketPrice * item.quantity).toLocaleString()} đ
                    </span>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              {items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="w-full py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-800 p-6 bg-gray-900/95">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Tổng cộng:</span>
              <span className="text-2xl font-bold text-white">
                {totalPrice.toLocaleString()} đ
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors"
            >
              Thanh toán ({totalItems} vé)
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSidebar
