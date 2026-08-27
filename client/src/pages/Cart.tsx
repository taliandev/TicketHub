import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from '@/store/slices/cartSlice'
import { formatEventDate } from '@/lib/eventUtils'

const Cart = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items } = useSelector((state: RootState) => state.cart)
  const user = useSelector((state: RootState) => state.auth.user)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.ticketPrice * item.quantity,
    0
  )

  const handleRemove = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa vé này?')) {
      dispatch(removeFromCart(id))
    }
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }))
  }

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả vé?')) {
      dispatch(clearCart())
    }
  }

  const handleCheckout = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để tiếp tục thanh toán')
      navigate('/')
      return
    }

    if (items.length === 0) {
      alert('Giỏ hàng trống')
      return
    }

    // Navigate to checkout with cart items
    navigate('/checkout', {
      state: {
        cartItems: items,
      },
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-16 h-16 text-gray-600"
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
            <h2 className="text-3xl font-bold text-white mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-400 mb-8 text-center max-w-md">
              Bạn chưa có vé nào trong giỏ hàng. Hãy khám phá các sự kiện thú vị
              và thêm vé vào giỏ hàng!
            </p>
            <button
              onClick={() => navigate('/events')}
              className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 transition-colors"
            >
              Khám phá sự kiện
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-purple-400">GIỎ HÀNG</span> CỦA BẠN
          </h1>
          <p className="text-gray-400">
            {totalItems} vé trong giỏ hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearCart}
                className="text-red-400 hover:text-red-300 transition-colors text-sm"
              >
                Xóa tất cả
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/40 transition-colors"
              >
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.eventImage}
                      alt={item.eventTitle}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {item.eventTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
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
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                      <span className="font-semibold">{item.ticketType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 mb-4">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">
                        {formatEventDate(item.eventDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 mb-4">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm">{item.eventLocation}</span>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="p-1 text-white hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
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
                          <span className="text-white font-bold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.maxQuantity}
                            className="p-1 text-white hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
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

                        <div className="text-right">
                          <p className="text-sm text-gray-400">Đơn giá</p>
                          <p className="text-white font-bold">
                            {item.ticketPrice.toLocaleString()} đ
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Tổng</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {(item.ticketPrice * item.quantity).toLocaleString()} đ
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-6 h-6"
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-purple-400">│</span> TÓM TẮT ĐƠN HÀNG
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Số lượng vé:</span>
                  <span className="text-white font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tạm tính:</span>
                  <span className="text-white font-semibold">
                    {totalPrice.toLocaleString()} đ
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Phí dịch vụ:</span>
                  <span className="text-white font-semibold">0 đ</span>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Tổng cộng:</span>
                    <span className="text-3xl font-bold text-purple-400">
                      {totalPrice.toLocaleString()} đ
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors mb-4"
              >
                Thanh toán
              </button>

              <button
                onClick={() => navigate('/events')}
                className="w-full py-3 bg-gray-800 border border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
              >
                Tiếp tục mua sắm
              </button>

              {/* Note */}
              <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-purple-300">
                  <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin trước khi
                  thanh toán. Vé đã mua không thể hoàn trả.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
