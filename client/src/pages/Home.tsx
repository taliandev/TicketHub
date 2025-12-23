import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import BannerSlider from '../components/BannerSlider'
import BrandCarousel from '../components/BrandCarousel'
import { EventListSkeleton } from '../components/ui/Skeleton'
import ErrorMessage from '../components/ui/ErrorMessage'
import EmptyState from '../components/ui/EmptyState'
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
      <div className="space-y-16">
        <div className="h-[350px] md:h-[400px] bg-gray-200 animate-pulse rounded-lg" />
        <section className="container mx-auto px-4">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8" />
          <EventListSkeleton count={8} />
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <ErrorMessage
            message={getErrorMessage(error)}
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Chưa có sự kiện nào"
            description="Hiện tại chưa có sự kiện nào được tổ chức. Vui lòng quay lại sau."
            action={{
              label: 'Tạo sự kiện',
              onClick: () => window.location.href = '/register'
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Banner Slider Section */}
      {topEvents.length > 0 && <BannerSlider events={topEvents} />}

    
      {/* Featured Events Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Sự kiện nổi bật</h2>
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
        <div className="flex justify-center mt-6">
          <Link to="/events">
            <Button size="md" className="bg-blue-500 text-white hover:bg-blue-600">
              Xem tất cả sự kiện
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn TicketHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Dễ dàng tạo sự kiện</h3>
              <p className="text-gray-600">
                Tạo và quản lý sự kiện chỉ trong vài phút với giao diện thân thiện, dễ sử dụng.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Bán vé trực tuyến</h3>
              <p className="text-gray-600">
                Bán vé trực tuyến an toàn với nhiều phương thức thanh toán và quản lý doanh thu dễ dàng.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Check-in thông minh</h3>
              <p className="text-gray-600">
                Quét mã QR để check-in nhanh chóng, theo dõi số lượng người tham dự thời gian thực.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BrandCarousel />
        {/* Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center text-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop)',
            filter: 'brightness(0.5)'
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Tạo và quản lý sự kiện một cách dễ dàng
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            TicketHub là nền tảng quản lý sự kiện toàn diện, giúp bạn tổ chức sự kiện thành công và
            mang lại trải nghiệm tuyệt vời cho người tham dự.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/events">
              <Button size="lg">Khám phá sự kiện</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Tạo sự kiện
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* Recent Events Section */}
      {recentEvents.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Sự kiện đã xem gần đây</h2>
            <button 
              onClick={clearRecentEvents}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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