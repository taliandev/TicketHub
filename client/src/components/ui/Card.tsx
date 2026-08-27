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
  
  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/events/${id}`)
  }

  const handleCardClick = () => {
    navigate(`/events/${id}`)
  }

  return (
    <div
      className="w-[324px] h-[600px] bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-800 shadow-lg relative transition-all duration-300 ease-out cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-500/50 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Hình ảnh */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src={img}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
            eventStatus.isExpired ? 'grayscale opacity-40' : ''
          }`}
        />
        {/* Status Badge - Simplified */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${eventStatus.statusColor} backdrop-blur-lg border border-white/20 transition-transform duration-300 group-hover:scale-105`}>
          {eventStatus.statusText}
        </div>
        {/* Gradient Overlay - Simplified */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        {/* Hover overlay - Subtle */}
        <div
          className={`absolute inset-0 bg-purple-900/30 transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Expired overlay */}
        {eventStatus.isExpired && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 rounded-xl border border-red-500/30 shadow-lg">
              ĐÃ KẾT THÚC
            </span>
          </div>
        )}
        {/* Neon border effect on hover */}
        <div className={`absolute inset-0 border-2 border-purple-500/0 group-hover:border-purple-500/30 transition-all duration-300 rounded-t-2xl`} />
      </div>

      {/* Nội dung - Simplified background */}
      <div
        className={`flex flex-col h-[300px] overflow-hidden bg-gray-900/90 transition-all duration-500 ease-out ${
          isHovered ? 'transform -translate-y-[50px]' : ''
        }`}
      >
        {/* Title Section - Fixed 2 lines height */}
        <div className="relative group/title mt-[20px] ml-[10px] h-[80px] mb-2">
          <h3
            className="text-2xl font-bold line-clamp-2 text-white transition-colors duration-300 group-hover/title:text-transparent group-hover/title:bg-clip-text group-hover/title:bg-gradient-to-r group-hover/title:from-purple-300 group-hover/title:to-cyan-300"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontFamily: 'poppins',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.3',
            }}
          >
            {title}
          </h3>
          {/* Tooltip cho title - simplified */}
          <div className="absolute left-0 top-full z-10 hidden group-hover/title:block bg-gray-900 border border-purple-500/50 text-white text-sm p-3 rounded-lg max-w-[300px] break-words animate-fadeIn shadow-xl mt-1">
            {title}
          </div>
        </div>

        {/* Description Section - Fixed height */}
        <div className="ml-[10px] h-[110px] mb-2">
          <p 
            className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300 line-clamp-5"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
              fontFamily: 'roboto',
              fontWeight: '300',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.5',
            }}
          >
            {description}
          </p>
        </div>

        {/* Location Section */}
        <div className="relative group/location ml-[10px] mb-4">
          <div className="flex items-center gap-2 text-gray-500 transition-colors duration-300">
            <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-base truncate">{location}</span>
          </div>
          {/* Tooltip cho location - simplified */}
          <div className="absolute left-0 bottom-full z-10 hidden group-hover/location:block bg-gray-900 border border-purple-500/50 text-white text-sm p-3 rounded-lg max-w-[300px] break-words animate-fadeIn shadow-xl mb-1">
            {location}
          </div>
        </div>
      </div>

      {/* Nút View More - Clean solid color */}
      <button
        className={`absolute left-0 w-full h-[50px] bg-purple-600 text-white rounded-b-2xl font-bold flex items-center justify-center hover:bg-purple-500 transition-all duration-300 ease-out ${
          isHovered ? 'bottom-0 opacity-100 translate-y-0' : 'bottom-0 opacity-0 translate-y-full'
        }`}
        onClick={handleViewMore}
      >
        <span className="flex items-center gap-2">
          XEM CHI TIẾT
          <svg
            className={`w-5 h-5 transition-transform duration-500 ${
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