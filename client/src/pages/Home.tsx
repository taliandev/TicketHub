import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import BannerSlider from '../components/BannerSlider'
import BrandCarousel from '../components/BrandCarousel'
import WhyTicketHubPass from '../components/WhyTicketHubPass'
import { EventListSkeleton } from '../components/ui/Skeleton'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useEvents } from '../hooks/useEvents'
import { useRecentEvents } from '../hooks/useRecentEvents'
import { getErrorMessage } from '../lib/errorHandler'

const Home = () => {
  const { data: eventsData, isLoading, error, refetch } = useEvents(1, 100) // Load first 100 for home page
  const events = eventsData?.events || []
  const { recentEvents, clearRecentEvents, isLoading: recentLoading } = useRecentEvents()

  // Sort and filter events
  const topEvents = [...events]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)

  const featuredEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8)

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 min-h-screen">
        <div className="h-[500px] bg-gradient-to-r from-purple-900/20 to-blue-900/20 animate-pulse" />
        <section className="container mx-auto px-4 py-16">
          <div className="h-8 w-48 bg-gray-800 animate-pulse rounded mb-8" />
          <EventListSkeleton count={8} />
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 py-8">
        <div className="container mx-auto px-4">
          <ErrorMessage
            message={getErrorMessage(error)}
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  // Removed early return for empty events - UI sections should always display

  return (
    <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 min-h-screen ">
      {/* Banner Slider Section - Only if events exist */}
      {topEvents.length > 0 && (
        <section className="relative">
          <BannerSlider events={topEvents} />
        </section>
      )}

      {/* Featured Events Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl pt-2 md:pt-4 pb-2 md:pb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1 md:mb-2">
              SỰ KIỆN NỔI BẬT
            </h2>
            <p className="text-sm md:text-base text-gray-400">Những điểm đến không thể bỏ lỡ trong tháng này</p>
          </div>
          {featuredEvents.length > 0 && (
            <Link to="/events" className="hidden md:block">
              <button className="px-6 py-3 bg-gray-900 border border-purple-500/50 text-purple-400 font-semibold rounded-full hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300">
                Xem tất cả
                <svg className="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
          )}
        </div>
        
        {featuredEvents.length > 0 ? (
          <>
            {/* Desktop/Tablet: Responsive Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 justify-items-center">
              {featuredEvents.map((event) => (
                <div key={event._id} className="w-full max-w-[324px]">
                  <Card
                    id={event._id}
                    img={event.img}
                    date={event.date}
                    title={event.title}
                    description={event.description}
                    location={event.location}
                  />
                </div>
              ))}
            </div>
            
            {/* Mobile: Horizontal Carousel with Peek (Affordance for Swiping) */}
            <div className="md:hidden overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              <div className="flex gap-4 pl-4 pr-4">
                {featuredEvents.map((event, index) => (
                  <div 
                    key={event._id} 
                    className={`flex-shrink-0 snap-start ${
                      index === 0 ? 'w-[calc(100vw-5rem)]' : 'w-[280px]'
                    }`}
                  >
                    <Card
                      id={event._id}
                      img={event.img}
                      date={event.date}
                      title={event.title}
                      description={event.description}
                      location={event.location}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-6 md:mt-8">
              <Link to="/events" className="md:hidden">
                <button className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 transition-all duration-300 shadow-lg shadow-purple-500/30">
                  Xem tất cả sự kiện
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-black p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Chưa có sự kiện nào
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Hiện tại chưa có sự kiện nào được tổ chức. Hãy quay lại sau hoặc tạo sự kiện đầu tiên!
              </p>
              <Link to="/dashboard">
                <button className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 transition-all duration-300">
                  Tạo sự kiện
                </button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Why TicketHub - Boarding Pass Style */}
      <WhyTicketHubPass />

      {/* Brand Carousel - Always visible */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 p-2 md:p-4">
            ĐỐI TÁC TIN TƯỞNG
          </h2>
          <p className="text-center text-gray-400 mt-2 text-sm md:text-base">Đồng hành cùng những thương hiệu hàng đầu</p>
        </div>
        <BrandCarousel />
      </section>


      {/* Recent Events Section */}
      {recentEvents.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1 md:mb-2 pt-2 md:pt-4">
                ĐÃ XEM GẦN ĐÂY
              </h2>
              <p className="text-sm md:text-base text-gray-400">Các sự kiện bạn đã quan tâm</p>
            </div>
            <button 
              onClick={clearRecentEvents}
              className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-400 hover:text-purple-400 border border-gray-700 hover:border-purple-500/50 rounded-full transition-all duration-300"
            >
              Xóa
            </button>
          </div>
          {recentLoading ? (
            <EventListSkeleton count={4} />
          ) : (
            <>
              {/* Desktop/Tablet: Responsive Grid */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 justify-items-center">
                {recentEvents.slice(0, 4).map((event) => (
                  <div key={event._id} className="w-full max-w-[324px]">
                    <Card
                      id={event._id}
                      img={event.img}
                      date={event.date}
                      title={event.title}
                      description={event.description}
                      location={event.location}
                    />
                  </div>
                ))}
              </div>
              
              {/* Mobile: Horizontal Carousel with Peek (Affordance for Swiping) */}
              <div className="md:hidden overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-4 pl-4 pr-4">
                  {recentEvents.slice(0, 4).map((event, index) => (
                    <div 
                      key={event._id} 
                      className={`flex-shrink-0 snap-start ${
                        index === 0 ? 'w-[calc(100vw-5rem)]' : 'w-[280px]'
                      }`}
                    >
                      <Card
                        id={event._id}
                        img={event.img}
                        date={event.date}
                        title={event.title}
                        description={event.description}
                        location={event.location}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}

export default Home 