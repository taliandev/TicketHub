import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEventStatus } from '@/lib/eventUtils'

interface CardProps {
  img: string
  date: string | Date  // Accept both string and Date
  title: string
  description: string
  location: string
  id: string
}

const Card = ({ img, date, title, description, location, id }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()
  
  // Get event status using raw date
  const eventStatus = getEventStatus(date)
  
  // Format date for display
  const formattedDate = typeof date === 'string' && date.includes('/') 
    ? date  // Already formatted
    : new Date(date).toLocaleDateString('vi-VN')

  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/events/${id}`)
  }

  const handleCardClick = () => {
    navigate(`/events/${id}`)
  }

  return (
    <div
      className="w-[324px] h-[600px] bg-white rounded-lg shadow-lg relative transition-all duration-500 ease-out cursor-pointer hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Hình ảnh */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src={img}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-110 ${
            eventStatus.isExpired ? 'grayscale opacity-60' : ''
          }`}
        />
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${eventStatus.statusColor} backdrop-blur-sm`}>
          {eventStatus.statusText}
        </div>
        {/* Overlay gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Expired overlay */}
        {eventStatus.isExpired && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-2xl font-bold bg-red-600 px-6 py-2 rounded-lg">
              ĐÃ KẾT THÚC
            </span>
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div
        className={`flex flex-col gap-3 h-[300px] overflow-hidden bg-white transition-all duration-500 ease-out ${
          isHovered ? 'transform -translate-y-[50px]' : ''
        }`}
      >
        <p className="text-lg font-light text-blue-500 mt-[20px] ml-[10px] transition-colors duration-300">
          {formattedDate}
        </p>
        <div className="relative group">
          <h3
            className="text-3xl ml-[10px] font-semibold line-clamp-1 transition-colors duration-300 group-hover:text-blue-600"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              fontFamily: 'poppins',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h3>
          {/* Tooltip cho title */}
          <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-gray-800 text-white text-sm p-2 rounded-md max-w-[300px] break-words animate-fadeIn">
            {title}
          </div>
        </div>
        <div
          className="text-[15px] ml-[10px] h-[100px] mt-4"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            fontFamily: 'roboto',
            fontWeight: 'extra-light',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <p className="text-sm text-gray-800 transition-colors duration-300">{description}</p>
        </div>
        <div className="relative group">
          <p
            className="text-xl ml-[10px] mb-4 text-gray-600 line-clamp-1 transition-colors duration-300"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {location}
          </p>
          {/* Tooltip cho location */}
          <div className="absolute left-0 bottom-full z-10 hidden group-hover:block bg-gray-800 text-white text-sm p-2 rounded-md max-w-[300px] break-words animate-fadeIn">
            {location}
          </div>
        </div>
      </div>

      {/* Nút View More với hiệu ứng trượt mượt */}
      <button
        className={`absolute left-0 w-full h-[50px] bg-blue-600 text-white rounded-b-lg font-semibold flex items-center justify-center hover:bg-blue-700 transition-all duration-500 ease-out ${
          isHovered ? 'bottom-0 opacity-100 translate-y-0' : 'bottom-0 opacity-0 translate-y-full'
        }`}
        onClick={handleViewMore}
      >
        <span className="flex items-center">
          XEM THÊM
          <svg
            className={`w-5 h-5 ml-2 transition-transform duration-500 ${
              isHovered ? 'translate-x-1' : 'translate-x-0'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </span>
      </button>
    </div>
  )
}

export default Card 