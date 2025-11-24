import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import BannerSlider from '../components/BannerSlider';
import BrandCarousel from '../components/BrandCarousel';
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  img: string;
  price: number;
  category: string;
  views: number;
}

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [topEvents, setTopEvents] = useState<Event[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchRecentEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/events');
      const events = response.data;
      
      // Sắp xếp theo views giảm dần và lấy 3 event đầu
      const top = [...events].sort((a, b) => b.views - a.views).slice(0, 3);
      setTopEvents(top);
      
      // Sort events by date
      const sortedEvents = events.sort((a: Event, b: Event) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Get featured events (first 3)
      setFeaturedEvents(sortedEvents.slice(0, 8));
      
      // Get upcoming events (next 3)
      setUpcomingEvents(sortedEvents.slice(4, 8));
      
      setError('');
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy các sự kiện đã xem gần đây từ localStorage
  const fetchRecentEvents = async () => {
    try {
      // Lấy danh sách ID từ localStorage
      const recentEventIds = JSON.parse(localStorage.getItem('recentEvents') || '[]');
      console.log('Recent Event IDs:', recentEventIds);
      
      if (recentEventIds.length === 0) {
        setRecentEvents([]);
        return;
      }

      // Lấy thông tin chi tiết của các sự kiện
      const response = await axios.get(`http://localhost:3001/api/events/by-ids`, {
        params: { ids: recentEventIds.join(',') }
      });
      console.log('API Response:', response.data);

      // Tạo map để dễ dàng truy xuất thông tin sự kiện theo ID
      const eventsMap = new Map(response.data.map((event: Event) => [event._id, event]));
      
      // Sắp xếp lại theo thứ tự đã xem gần nhất và lấy 4 sự kiện đầu tiên
      const sortedEvents = recentEventIds
        .map((id: string) => eventsMap.get(id))
        .filter(Boolean)
        .slice(0, 4);

      console.log('Sorted Events:', sortedEvents);
      setRecentEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching recent events:', error);
      setRecentEvents([]);
    }
  };

  // Thêm sự kiện vào danh sách đã xem
  const addToRecentEvents = (eventId: string) => {
    try {
      // Lấy danh sách hiện tại từ localStorage
      const recentEventIds = JSON.parse(localStorage.getItem('recentEvents') || '[]');
      console.log('Current Recent Events:', recentEventIds); // Debug log
      
      // Xóa eventId cũ nếu đã tồn tại
      const filteredIds = recentEventIds.filter((id: string) => id !== eventId);
      
      // Thêm eventId mới vào đầu mảng và giới hạn 10 sự kiện
      const newRecentIds = [eventId, ...filteredIds].slice(0, 10);
      console.log('New Recent Events:', newRecentIds); // Debug log
      
      // Lưu vào localStorage
      localStorage.setItem('recentEvents', JSON.stringify(newRecentIds));
      
      // Cập nhật state
      fetchRecentEvents();
    } catch (error) {
      console.error('Error updating recent events:', error);
    }
  };

  // Lắng nghe sự kiện khi người dùng xem sự kiện
  useEffect(() => {
    const handleEventView = (event: CustomEvent) => {
      const eventId = event.detail;
      console.log('Event Viewed:', eventId); // Debug log
      if (eventId) {
        addToRecentEvents(eventId);
      }
    };

    // Thêm event listener
    window.addEventListener('eventViewed' as any, handleEventView);
    
    // Fetch recent events khi component mount
    fetchRecentEvents();

    return () => {
      window.removeEventListener('eventViewed' as any, handleEventView);
    };
  }, []);

  // Thêm useEffect để fetch recent events khi focus vào window
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, fetching recent events...'); // Debug log
      fetchRecentEvents();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Banner Slider Section */}
      <BannerSlider events={topEvents} />
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

      {/* Featured Events Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Sự kiện nổi bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {featuredEvents.slice(0, 8).map((event) => (
    <Card
      key={event._id}
      id={event._id}
      img={event.img}
      date={new Date(event.date).toLocaleDateString()}
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

      {/* Upcoming Events Section */}
      {/* <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Sự kiện sắp tới</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingEvents.map((event) => (
            <Card
              key={event._id}
              id={event._id}
              img={event.image}
              date={new Date(event.date).toLocaleDateString()}
              title={event.title}
              description={event.description}
              location={event.location}
            />
          ))}
        </div>
      
      </section> */}

      {/* Recent Events Section */}
      {recentEvents.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Sự kiện đã xem gần đây</h2>
            <button 
              onClick={() => {
                localStorage.removeItem('recentEvents');
                setRecentEvents([]);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Xóa lịch sử
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentEvents.map((event) => (
              <Card
                key={event._id}
                id={event._id}
                img={event.img}
                date={new Date(event.date).toLocaleDateString()}
                title={event.title}
                description={event.description}
                location={event.location}
              />
            ))}
          </div>
        </section>
      )}     
    </div>
  );
}

export default Home; 