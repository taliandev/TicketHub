import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import BannerSlider from '../components/BannerSlider'
import BrandCarousel from '../components/BrandCarousel'
import { EventListSkeleton } from '../components/ui/Skeleton'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useEvents } from '../hooks/useEvents'
import { useRecentEvents } from '../hooks/useRecentEvents'
import { getErrorMessage } from '../lib/errorHandler'

const Home = () => {
  const { data: events = [], isLoading, error, refetch } = useEvents()
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
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              <span className="text-purple-400">SỰ KIỆN</span> NỔI BẬT
            </h2>
            <p className="text-gray-400">Những điểm đến không thể bỏ lỡ trong tháng này</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((event) => (
                <Card
                  key={event._id}
                  id={event._id}
                  img={event.img}
                  date={event.date}
                  title={event.title}
                  description={event.description}
                  location={event.location}
                />
              ))}
            </div>
            <div className="flex justify-center mt-8 md:hidden">
              <Link to="/events">
                <button className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 transition-all duration-300">
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

      {/* Features Section - Always visible */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.1)_0%,transparent_50%)]" />
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-purple-400">TẠI SAO</span> CHỌN TICKETHUB?
            </h2>
            <p className="text-gray-400 text-lg">Trải nghiệm hoàn hảo từ mua vé đến tham dự sự kiện</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
                title: 'Dễ dàng đặt vé',
                desc: 'Đặt vé online chỉ trong vài phút với giao diện thân thiện và thanh toán an toàn',
                color: 'purple'
              },
              {
                icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Thanh toán linh hoạt',
                desc: 'Hỗ trợ đa dạng phương thức thanh toán: MoMo, VNPay, Banking và nhiều hơn nữa',
                color: 'cyan'
              },
              {
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Check-in thông minh',
                desc: 'Quét mã QR để check-in nhanh chóng, tiện lợi và theo dõi real-time',
                color: 'pink'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className={`relative h-full p-8 rounded-2xl border border-gray-800 bg-gray-900/50 hover:border-${feature.color}-500/50 transition-all duration-300 hover:transform hover:-translate-y-2`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 bg-${feature.color}-600 rounded-xl`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Carousel - Always visible */}
      <section className="py-16">
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
            <span className="text-purple-400">ĐỐI TÁC</span> TIN TƯỞNG
          </h2>
          <p className="text-center text-gray-400 mt-2">Đồng hành cùng những thương hiệu hàng đầu</p>
        </div>
        <BrandCarousel />
      </section>


      {/* Recent Events Section */}
      {recentEvents.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                <span className="text-purple-400">ĐÃ XEM</span> GẦN ĐÂY
              </h2>
              <p className="text-gray-400">Các sự kiện bạn đã quan tâm</p>
            </div>
            <button 
              onClick={clearRecentEvents}
              className="px-4 py-2 text-sm text-gray-400 hover:text-purple-400 border border-gray-700 hover:border-purple-500/50 rounded-full transition-all duration-300"
            >
              Xóa lịch sử
            </button>
          </div>
          {recentLoading ? (
            <EventListSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentEvents.map((event) => (
                <Card
                  key={event._id}
                  id={event._id}
                  img={event.img}
                  date={event.date}
                  title={event.title}
                  description={event.description}
                  location={event.location}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Home 