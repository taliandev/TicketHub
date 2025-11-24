import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface CardProps {
  img: string
  date: string
  title: string
  description: string
  location: string
  id: string
}

const Card = ({ img, date, title, description, location, id }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const handleViewMore = () => {
    navigate(`/events/${id}`)
  }

  return (
    <div
      className="w-[324px] h-[600px] bg-white rounded-sm mr-[10px] shadow-md relative transition-transform duration-200 cursor-pointer hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hình ảnh */}
      <img src={img} alt={title} className="w-full h-[300px] object-cover rounded-sm" />

      {/* Nội dung */}
      <div
        className={`flex flex-col gap-3 h-[300px] overflow-hidden bg-white transition-transform duration-300 ${
          isHovered ? 'transform -translate-y-[50px]' : ''
        }`}
      >
        <p className="text-lg font-light text-blue-500 mt-[20px] ml-[10px]">{date}</p>
        <div className="relative group">
          <h3
            className="text-3xl ml-[10px] font-semibold line-clamp-1"
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
          <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-gray-800 text-white text-sm p-2 rounded-md max-w-[300px] break-words">
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
          <p className="text-sm text-gray-800">{description}</p>
        </div>
        <div className="relative group">
          <p
            className="text-xl ml-[10px] mb-4 text-gray-600 line-clamp-1"
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
          <div className="absolute left-0 bottom-full z-10 hidden group-hover:block bg-gray-800 text-white text-sm p-2 rounded-md max-w-[300px] break-words">
            {location}
          </div>
        </div>
      </div>

      {/* Nút View More */}
      <button
        className={`absolute left-0 w-full h-[50px] bg-blue-500 text-white rounded-sm font-semibold flex items-center justify-center hover:bg-blue-600 transition-all duration-300 ${
          isHovered ? 'bottom-0 opacity-100' : 'bottom-[-50px] opacity-0'
        }`}
        onClick={handleViewMore}
      >
        XEM THÊM →
      </button>
    </div>
  )
}

export default Card 