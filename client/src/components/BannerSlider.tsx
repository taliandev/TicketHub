import { Link } from 'react-router-dom'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { getEventStatus } from '@/lib/eventUtils'

interface Event {
  _id: string
  title: string
  description: string
  date: string
  location: string
  img: string
  views: number
}

const BannerSlider = ({ events }: { events: Event[] }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div className="mb-12 relative banner-slider">
      <Slider {...settings}>
        {events.map((event) => {
          const eventStatus = getEventStatus(event.date)
          
          return (
          <div key={event._id}>
            <div className="relative h-[450px] md:h-[550px] overflow-hidden">
              {/* Background Image with Parallax Effect */}
              <div className="absolute inset-0">
                <img
                  src={event.img}
                  alt={event.title}
                  className="w-full h-full object-cover scale-105 transition-transform duration-[10000ms] ease-out hover:scale-110"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Content Container */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-full">
                  <div className="max-w-2xl space-y-6 animate-slideUp">
                    {/* Badge */}
                    <div className="flex items-center gap-3">
                      
                      
                      {/* Event Status Badge */}
                      {(eventStatus.isEndingSoon || eventStatus.isExpired) && (
                        <div className={`inline-flex items-center space-x-2 backdrop-blur-sm px-4 py-2 rounded-full ${
                          eventStatus.isExpired 
                            ? 'bg-red-600/90' 
                            : 'bg-orange-600/90'
                        }`}>
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-white text-sm font-semibold">{eventStatus.statusText}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                      {event.title}
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-gray-200 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-300">
                      <div className="flex items-center space-x-2">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {new Date(event.date).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium line-clamp-1">{event.location}</span>
                      </div>

                      <div className="flex items-center space-x-2">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {event.views.toLocaleString()} lượt xem
                        </span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      <Link to={`/events/${event._id}`}>
                        <button className={`group relative px-8 py-3 rounded-lg font-semibold overflow-hidden transition-all duration-300 ${
                          eventStatus.isExpired
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/50'
                        }`}>
                          <span className="relative z-10 flex items-center">
                            {eventStatus.isExpired ? 'Xem chi tiết' : 'Đặt vé ngay'}
                            <svg
                              className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
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
                      </Link>

                      <button className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300">
                        Chia sẻ
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
            </div>
          </div>
        )})}
      </Slider>
    </div>
  )
}

export default BannerSlider 