import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvents'
import { useRecentEvents } from '@/hooks/useRecentEvents'
import { getErrorMessage } from '@/lib/errorHandler'
import { getEventStatus, canBookEvent, formatEventDate } from '@/lib/eventUtils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { TicketType } from '@/hooks/useEvents'

const EventDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: event, isLoading, error, refetch } = useEvent(id)
  const { addRecentEvent } = useRecentEvents()

  const [showShare, setShowShare] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [agreed, setAgreed] = useState<boolean>(false)
  const [formError, setFormError] = useState<string>('')

  // Add to recent events when event loads
  useEffect(() => {
    if (event?._id) {
      addRecentEvent(event._id)
    }
  }, [event?._id, addRecentEvent])

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">Đang tải thông tin sự kiện...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
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
      <div className="container mx-auto px-4 py-12">
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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Banner section */}
      <div className="relative w-full h-[400px] md:h-[600px] bg-gradient-to-r from-gray-300 to-gray-500 flex items-center justify-center">
        <img
          src={event.img}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-1 flex flex-col md:flex-row gap-4 flex-1">
        {/* Left IMG */}
        <div className="flex-1 flex items-start justify-center">
          <div className="relative">
            <img
              src={event.img}
              alt={event.title}
              className="w-full max-w-[500px] h-auto md:h-[600px] object-cover rounded-lg shadow-lg -mt-32 md:-mt-64 z-10"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
            />
            {/* Event Status Badge */}
            <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold ${eventStatus.statusColor} backdrop-blur-sm shadow-lg`}>
              {eventStatus.statusText}
            </div>
          </div>
        </div>

        {/* Right info */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Box DATE + SHARE */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-600 text-white w-20 h-20 flex flex-col items-center justify-center rounded-lg">
                <span className="text-2xl font-bold">
                  {new Date(event.date).getDate()}
                </span>
                <span className="text-xs">
                  Tháng {new Date(event.date).getMonth() + 1}
                </span>
              </div>
              <div className="bg-blue-600 text-white w-20 h-20 flex items-center justify-center rounded-lg relative">
                <button
                  className="flex items-center justify-center w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => setShowShare(!showShare)}
                  title="Chia sẻ sự kiện"
                  aria-label="Chia sẻ sự kiện"
                >
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19V6" />
                    <path d="M5 12l7-7 7 7" />
                  </svg>
                </button>
                {showShare && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border rounded shadow-lg p-2 flex flex-col items-center z-50 min-w-[140px]">
                    <button
                      className="px-4 py-2 text-blue-600 hover:bg-blue-100 w-full text-left rounded transition-colors"
                      onClick={() => handleShare('facebook')}
                    >
                      Chia sẻ Facebook
                    </button>
                    <button
                      className="px-4 py-2 text-green-600 hover:bg-green-100 w-full text-left rounded transition-colors"
                      onClick={() => handleShare('zalo')}
                    >
                      Chia sẻ Zalo
                    </button>
                    <button
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-left rounded transition-colors"
                      onClick={() => setShowShare(false)}
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Box Info */}
            <div className="bg-white rounded-lg shadow-md p-6 flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {event.title}{' '}
                <span className="font-normal text-gray-600">({event.category})</span>
              </h1>
              
              {/* Event Status Badge */}
              {eventStatus.isExpired && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Sự kiện này đã kết thúc
                  </p>
                </div>
              )}
              
              {eventStatus.isEndingSoon && !eventStatus.isExpired && (
                <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                  <p className="text-orange-700 font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Sự kiện sắp diễn ra - {eventStatus.statusText}
                  </p>
                </div>
              )}
              
              <ul className="mb-2 text-gray-700 space-y-2">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2" aria-hidden="true">
                    📅
                  </span>
                  <span>{formatEventDate(event.date)}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2" aria-hidden="true">
                    📍
                  </span>
                  <span>{event.location}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2" aria-hidden="true">
                    👁️
                  </span>
                  <span>{event.views.toLocaleString()} lượt xem</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">MÔ TẢ SỰ KIỆN</h2>
            <div className="text-gray-700 whitespace-pre-line">{event.description}</div>
          </div>

          {/* Đặt vé trực tiếp */}
          {event.ticketTypes && event.ticketTypes.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Đặt vé</h2>
              
              {/* Expired Event Warning */}
              {eventStatus.isExpired && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-red-700 font-semibold text-center">
                    Sự kiện đã kết thúc. Không thể đặt vé.
                  </p>
                </div>
              )}
              
              <div className={`mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${eventStatus.isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
                {event.ticketTypes.map((ticket: TicketType) => {
                  const ticketRemaining = ticket.available - (ticket.sold || 0)
                  const ticketSoldOut = ticketRemaining <= 0
                  return (
                    <button
                      key={ticket.name}
                      type="button"
                      disabled={ticketSoldOut}
                      className={`border rounded-lg p-4 text-left transition-all ${
                        selectedType === ticket.name
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'hover:border-blue-300'
                      } ${ticketSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => !ticketSoldOut && setSelectedType(ticket.name)}
                    >
                      <div className="font-semibold text-lg mb-1">{ticket.name}</div>
                      {ticket.description && (
                        <div className="text-gray-600 text-sm mb-2 min-h-[40px]">
                          {ticket.description}
                        </div>
                      )}
                      <div className="font-bold text-blue-600">
                        {ticket.price.toLocaleString()} đ
                      </div>
                      <div className="text-xs mt-2">
                        {ticketSoldOut ? (
                          <span className="text-red-500 font-bold">Hết vé</span>
                        ) : (
                          <span>Còn lại: {ticketRemaining}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mb-4 flex items-center gap-2">
                <label htmlFor="quantity" className="font-medium">
                  Số lượng:
                </label>
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 rounded text-lg font-bold hover:bg-gray-300 transition-colors"
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
                  className="w-16 text-center border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 rounded text-lg font-bold hover:bg-gray-300 transition-colors"
                  onClick={() => setQuantity((q) => Math.min(q + 1, remaining))}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>

              <div className="mb-4 text-lg font-semibold text-right">
                Tổng cộng: <span className="text-blue-600">{total.toLocaleString()} đ</span>
              </div>

              <div className="mb-4 flex items-start">
                <input
                  id="agree-policy"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 mr-2"
                />
                <label htmlFor="agree-policy" className="text-gray-700 select-none">
                  Tôi đồng ý với{' '}
                  <a href="/policy" className="text-blue-500 underline hover:text-blue-600">
                    chính sách của chúng tôi
                  </a>
                </label>
              </div>

              {formError && <div className="text-red-500 text-sm mb-4">{formError}</div>}

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  !agreed || !canBook
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={!agreed || !canBook}
                onClick={handleContinue}
              >
                {eventStatus.isExpired 
                  ? 'Sự kiện đã kết thúc' 
                  : isSoldOut 
                  ? 'Hết vé' 
                  : 'Tiếp tục'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetail