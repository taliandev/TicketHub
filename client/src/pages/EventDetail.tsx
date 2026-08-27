import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useEvent } from '@/hooks/useEvents'
import { useRecentEvents } from '@/hooks/useRecentEvents'
import { useCart } from '@/hooks/useCart'
import { getErrorMessage } from '@/lib/errorHandler'
import { getEventStatus, canBookEvent, formatEventDate } from '@/lib/eventUtils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import LoginModal from '@/components/auth/LoginModal'
import RegisterModal from '@/components/auth/RegisterModal'
import { TicketType } from '@/hooks/useEvents'

const EventDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const { data: event, isLoading, error, refetch } = useEvent(id)
  const { addRecentEvent } = useRecentEvents()
  const { addToCart, openCart } = useCart()

  const [showShare, setShowShare] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [agreed, setAgreed] = useState<boolean>(false)
  const [formError, setFormError] = useState<string>('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [pendingBooking, setPendingBooking] = useState(false)

  // Add to recent events when event loads
  useEffect(() => {
    if (event?._id) {
      addRecentEvent(event._id)
    }
  }, [event?._id, addRecentEvent])

  // Watch for user login after clicking continue
  useEffect(() => {
    if (user && pendingBooking) {
      const selectedTicket = event?.ticketTypes.find((t) => t.name === selectedType)
      if (selectedTicket) {
        setPendingBooking(false)
        setShowLoginModal(false)
        setShowRegisterModal(false)
        navigate('/checkout', {
          state: {
            bookingData: {
              eventId: event?._id,
              type: selectedType,
              price: selectedTicket.price,
              quantity,
            },
          },
        })
      }
    }
  }, [user, pendingBooking, event, selectedType, quantity, navigate])

  const handleSwitchToRegister = () => {
    setFormError('')
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToLogin = () => {
    setFormError('')
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  // Set default ticket type
  useEffect(() => {
    if (event?.ticketTypes && event.ticketTypes.length > 0 && !selectedType) {
      setSelectedType(event.ticketTypes[0].name)
    }
  }, [event?.ticketTypes, selectedType])

  const handleShare = (platform: string) => {
    const eventUrl = window.location.href
    let shareUrl = ''

    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`
    } else if (platform === 'zalo') {
      shareUrl = `https://zalo.me/share?url=${encodeURIComponent(eventUrl)}`
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
    setShowShare(false)
  }

  const handleContinue = () => {
    if (!agreed) {
      setFormError('Bạn cần đồng ý với chính sách để tiếp tục.')
      return
    }

    const selectedTicket = event?.ticketTypes.find((t) => t.name === selectedType)
    if (!selectedTicket) {
      setFormError('Vui lòng chọn loại vé.')
      return
    }

    setFormError('')
    
    // Check if user is logged in
    if (!user) {
      setFormError('Vui lòng đăng nhập để đặt vé.')
      setPendingBooking(true)
      // Show modal after a short delay so user can see the message
      setTimeout(() => {
        setShowLoginModal(true)
      }, 800)
      return
    }
    
    // User is logged in, proceed to checkout
    navigate('/checkout', {
      state: {
        bookingData: {
          eventId: event?._id,
          type: selectedType,
          price: selectedTicket.price,
          quantity,
        },
      },
    })
  }

  const handleAddToCart = () => {
    if (!agreed) {
      setFormError('Bạn cần đồng ý với chính sách để tiếp tục.')
      return
    }

    const selectedTicket = event?.ticketTypes.find((t) => t.name === selectedType)
    if (!selectedTicket || !event) {
      setFormError('Vui lòng chọn loại vé.')
      return
    }

    setFormError('')

    // Add to cart
    addToCart({
      id: `${event._id}-${selectedType}-${Date.now()}`,
      eventId: event._id,
      eventTitle: event.title,
      eventImage: event.img,
      eventDate: event.date,
      eventLocation: event.location,
      ticketType: selectedType,
      ticketPrice: selectedTicket.price,
      quantity,
      maxQuantity: selectedTicket.available - (selectedTicket.sold || 0),
    })

    // Open cart sidebar
    openCart()

    // Reset form
    setQuantity(1)
    setAgreed(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-400">Đang tải thông tin sự kiện...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-gray-900 via-black to-gray-900 min-h-screen">
        <ErrorMessage
          title="Không thể tải sự kiện"
          message={getErrorMessage(error)}
          onRetry={refetch}
        />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-gray-900 via-black to-gray-900 min-h-screen">
        <ErrorMessage
          title="Không tìm thấy sự kiện"
          message="Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        />
      </div>
    )
  }

  const selectedTicket = event.ticketTypes.find((t) => t.name === selectedType)
  const total = selectedTicket ? selectedTicket.price * quantity : 0
  const remaining = selectedTicket ? selectedTicket.available - (selectedTicket.sold || 0) : 0
  const isSoldOut = remaining <= 0
  
  // Check event status
  const eventStatus = getEventStatus(event.date)
  const canBook = canBookEvent(event.date) && !isSoldOut

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* Banner section with dark overlay - Improved gradient */}
      <div className="relative w-full h-[350px] md:h-[500px] bg-black flex items-center justify-center overflow-hidden">
        <img
          src={event.img}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black/70 to-black" />
      </div>

      {/* Main content - Adjusted spacing */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 relative -mt-24 md:-mt-40">
        {/* Left Column - Event Image - Simplified */}
        <div className="lg:w-2/5 flex-shrink-0">
          <div className="sticky top-20">
            <div className="relative group overflow-hidden rounded-2xl">
              <img
                src={event.img}
                alt={event.title}
                className="w-full h-auto aspect-[3/4] object-cover rounded-2xl border border-gray-800 shadow-2xl group-hover:border-purple-500/50 transition-all duration-300"
              />
              
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right Column - Event Info */}
        <div className="lg:w-3/5 flex flex-col gap-5">
          {/* Event Header Card - Simplified */}
          <div className="relative overflow-hidden bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300 hover:border-purple-500/40">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white leading-tight">
                  {event.title}
                </h1>
                <span className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm font-semibold text-purple-400">
                  {event.category}
                </span>
              </div>
              
              {/* Share Button - Clean */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowShare(!showShare)}
                  className="p-3 bg-gray-800 text-cyan-400 rounded-xl border border-gray-700 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300"
                  title="Chia sẻ"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>
                {showShare && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 flex flex-col z-50 min-w-[180px]">
                    <button
                      className="px-4 py-2.5 text-purple-300 hover:bg-purple-900/30 text-left rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => handleShare('facebook')}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </button>
                    <button
                      className="px-4 py-2.5 text-cyan-300 hover:bg-cyan-900/30 text-left rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => handleShare('zalo')}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.001 21.6c-5.302 0-9.6-4.298-9.6-9.6s4.298-9.6 9.6-9.6 9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6z"/>
                      </svg>
                      Zalo
                    </button>
                    <button
                      className="px-4 py-2.5 text-gray-400 hover:bg-gray-800/50 text-left rounded-lg transition-colors"
                      onClick={() => setShowShare(false)}
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Event Status Alerts - Clean */}
            {eventStatus.isExpired && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <p className="text-red-400 font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Sự kiện này đã kết thúc
                </p>
              </div>
            )}
            
            {eventStatus.isEndingSoon && !eventStatus.isExpired && (
              <div className="mb-6 p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl">
                <p className="text-orange-400 font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Sự kiện sắp diễn ra - {eventStatus.statusText}
                </p>
              </div>
            )}
            
            {/* Event Details - Clean design */}
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Ngày & Giờ</p>
                  <p className="text-white font-semibold">{formatEventDate(event.date)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Địa điểm</p>
                  <p className="text-white font-semibold">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center group-hover:bg-pink-500 transition-colors duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Lượt xem</p>
                  <p className="text-white font-semibold">{event.views.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Clean */}
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl p-5 md:p-6 hover:border-purple-500/40 transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">│</span> MÔ TẢ SỰ KIỆN
            </h2>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">{event.description}</div>
          </div>

          {/* Đặt vé trực tiếp - Clean */}
          {event.ticketTypes && event.ticketTypes.length > 0 && (
            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl p-5 md:p-6 hover:border-purple-500/40 transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-5 text-white flex items-center gap-2">
                <span className="text-purple-400">│</span> ĐẶT VÉ
              </h2>
              
              {/* Expired Event Warning */}
              {eventStatus.isExpired && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 font-semibold text-center">
                    Sự kiện đã kết thúc. Không thể đặt vé.
                  </p>
                </div>
              )}
              
              <div className={`mb-5 grid grid-cols-1 md:grid-cols-2 gap-3 ${eventStatus.isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
                {event.ticketTypes.map((ticket: TicketType) => {
                  const ticketRemaining = ticket.available - (ticket.sold || 0)
                  const ticketSoldOut = ticketRemaining <= 0
                  return (
                    <button
                      key={ticket.name}
                      type="button"
                      disabled={ticketSoldOut}
                      className={`border rounded-xl p-5 text-left transition-all duration-300 ${
                        selectedType === ticket.name
                          ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/50'
                          : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800/70'
                      } ${ticketSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => !ticketSoldOut && setSelectedType(ticket.name)}
                    >
                      <div className="font-semibold text-xl mb-1 text-white">{ticket.name}</div>
                      {ticket.description && (
                        <div className="text-gray-400 text-sm mb-2 min-h-[40px]">
                          {ticket.description}
                        </div>
                      )}
                      <div className="font-bold text-purple-400 text-xl">
                        {ticket.price.toLocaleString()} đ
                      </div>
                      <div className="text-xs mt-2 text-gray-400">
                        {ticketSoldOut ? (
                          <span className="text-red-400 font-bold">Hết vé</span>
                        ) : (
                          <span>Còn lại: {ticketRemaining}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mb-5 flex items-center gap-3">
                <label htmlFor="quantity" className="font-medium text-white">
                  Số lượng:
                </label>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-lg font-bold hover:bg-purple-600 hover:border-purple-600 transition-all duration-200 text-white"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Giảm số lượng"
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={remaining}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(Number(e.target.value), remaining)))
                  }
                  className="w-20 text-center border border-gray-700 bg-gray-800/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-lg font-bold hover:bg-purple-600 hover:border-purple-600 transition-all duration-200 text-white"
                  onClick={() => setQuantity((q) => Math.min(q + 1, remaining))}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>

              <div className="mb-4 text-xl font-semibold text-right text-white">
                Tổng cộng: <span className="text-purple-400">{total.toLocaleString()} đ</span>
              </div>

              <div className="mb-4 flex items-start">
                <input
                  id="agree-policy"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 mr-2 accent-purple-600"
                />
                <label htmlFor="agree-policy" className="text-gray-300 select-none">
                  Tôi đồng ý với{' '}
                  <a href="/policy" className="text-purple-400 underline hover:text-purple-300">
                    chính sách của chúng tôi
                  </a>
                </label>
              </div>

              {formError && <div className="text-red-400 text-sm mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">{formError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  className={`py-4 rounded-xl font-bold transition-all duration-300 text-lg border-2 ${
                    !agreed || !canBook
                      ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-transparent border-purple-600 text-purple-400 hover:bg-purple-600/10 active:scale-[0.98]'
                  }`}
                  disabled={!agreed || !canBook}
                  onClick={handleAddToCart}
                >
                  Thêm vào giỏ
                </button>

                <button
                  className={`py-4 rounded-xl font-bold transition-all duration-300 text-lg ${
                    !agreed || !canBook
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/50 active:scale-[0.98]'
                  }`}
                  disabled={!agreed || !canBook}
                  onClick={handleContinue}
                >
                  {eventStatus.isExpired 
                    ? 'Sự kiện đã kết thúc' 
                    : isSoldOut 
                    ? 'Hết vé' 
                    : 'Mua ngay'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Login/Register Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false)
          setPendingBooking(false)
        }}
        onSwitchToRegister={handleSwitchToRegister}
        skipRedirect={true}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => {
          setShowRegisterModal(false)
          setPendingBooking(false)
        }}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  )
}

export default EventDetail