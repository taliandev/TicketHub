import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface TicketType {
  name: string;
  description: string;
  price: number;
  available: number;
  sold: number;
}

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
  ticketTypes: TicketType[];
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('VVIP');
  const [quantity, setQuantity] = useState<number>(1);
  const [agreed, setAgreed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/events/${id}`);
        setEvent(res.data);
        if (res.data && Array.isArray(res.data.ticketTypes) && res.data.ticketTypes.length > 0) {
          setSelectedType(res.data.ticketTypes[0].name); // Đặt loại vé mặc định
        }
        let viewed = JSON.parse(localStorage.getItem('recentEvents') || '[]');
        viewed = viewed.filter((eid: string) => eid !== id);
        viewed.unshift(id);
        if (viewed.length > 8) viewed = viewed.slice(0, 8);
        localStorage.setItem('recentEvents', JSON.stringify(viewed));
      } catch (err) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const eventUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform: string) => {
    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
    } else if (platform === 'zalo') {
      shareUrl = `https://zalo.me/share?url=${encodeURIComponent(eventUrl)}`;
    }
    window.open(shareUrl, '_blank');
    setShowShare(false);
  };

  const selectedTicket = event && event.ticketTypes ? event.ticketTypes.find(t => t.name === selectedType) : null;
  const total = selectedTicket && typeof selectedTicket.price === 'number' 
  ? selectedTicket.price * quantity 
  : 0;
  const handleContinue = () => {
    if (!agreed) {
      setError('Bạn cần đồng ý với chính sách để tiếp tục.');
      return;
    }
    setError('');
    if (!event) return;
    navigate('/checkout', {
      state: {
        bookingData: {
          eventId: event._id,
          type: selectedType,
          price: selectedTicket?.price || 0,
          quantity,
        }
      }
    });
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;
  if (!event) return <div className="text-center py-12 text-red-500">Không tìm thấy sự kiện</div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Banner section */}
      <div className="relative w-full h-[600px] md:h-[600px] bg-gradient-to-r from-gray-300 to-gray-500 flex items-center justify-center">
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
          <img
            src={event.img}
            alt={event.title}
            className="w-[500px] h-[600px] object-cover rounded-lg shadow-lg -mt-64 z-10"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          />
        </div>
        {/* Right info */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Box DATE + SHARE */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white w-20 h-20 flex flex-col items-center justify-center rounded-lg mb-2">
                <span className="font-bold text-lg">DATE</span>
              </div>
              <div className="bg-blue-600 text-white w-20 h-20 flex items-center justify-center rounded-lg relative">
                <button
                  className="flex items-center justify-center w-full h-full focus:outline-none"
                  onClick={() => setShowShare(!showShare)}
                  title="Chia sẻ sự kiện"
                >
                  {/* Icon share */}
                 <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12 19V6" />
                   <path d="M5 12l7-7 7 7" />
                 </svg>

                </button>
                {showShare && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border rounded shadow-lg p-2 flex flex-col items-center z-50 min-w-[140px]">
                    <button
                      className="px-4 py-2 text-blue-600 hover:bg-blue-100 w-full text-left"
                      onClick={() => handleShare('facebook')}
                    >
                      Chia sẻ Facebook
                    </button>
                    <button
                      className="px-4 py-2 text-green-600 hover:bg-green-100 w-full text-left"
                      onClick={() => handleShare('zalo')}
                    >
                      Chia sẻ Zalo
                    </button>
                    <button
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 w-full text-left"
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
                {event.title} <span className="font-normal">({event.category})</span>
              </h1>
              <ul className="mb-2 text-gray-700">
                <li className="flex items-center mb-1">
                  <span className="text-blue-600 mr-2">📅</span>
                  <span>{new Date(event.date).toLocaleString()}</span>
                </li>
                <li className="flex items-center mb-1">
                  <span className="text-blue-600 mr-2">📍</span>
                  <span>{event.location}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">🔒</span>
                  <span>No age restriction</span>
                </li>
              </ul>
            </div>
          </div>
          {/* Description */}
          <div className="mt-8">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">DESCRIPTION</h2>
            <div className="text-gray-700 mb-4">{event.description}</div>
          </div>
          {/* Đặt vé trực tiếp */}
          {event && Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Đặt vé</h2>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.ticketTypes.map((ticket) => {
                  const remaining = ticket.available - (ticket.sold || 0);
                  const isSoldOut = remaining <= 0;
                  return (
                    <div
                      key={ticket.name}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType === ticket.name ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'} ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isSoldOut && setSelectedType(ticket.name)}
                    >
                      <div className="font-semibold text-lg mb-1">{ticket.name}</div>
                      <div className="text-gray-600 text-sm mb-2 min-h-[40px]">{ticket.description}</div>
                      <div className="font-bold text-blue-600">{ticket.price.toLocaleString()} đ</div>
                      <div className="text-xs mt-2">
                        {isSoldOut ? <span className="text-red-500 font-bold">Hết vé</span> : <span>Còn lại: {remaining}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mb-4 flex items-center gap-2">
                <label htmlFor="quantity" className="font-medium">Số lượng:</label>
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 rounded text-lg font-bold"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >-</button>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={selectedTicket ? selectedTicket.available - (selectedTicket.sold || 0) : 1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Math.min(Number(e.target.value), selectedTicket ? selectedTicket.available - (selectedTicket.sold || 0) : 1)))}
                  className="w-16 text-center border rounded px-2 py-1"
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 rounded text-lg font-bold"
                  onClick={() => setQuantity(q => selectedTicket ? Math.min(q + 1, selectedTicket.available - (selectedTicket.sold || 0)) : q)}
                >+</button>
              </div>
              <div className="mb-4 text-lg font-semibold text-right">
                Tổng cộng: <span className="text-blue-600">{total.toLocaleString()} đ</span>
              </div>
              <div className="mb-4 flex items-start">
                <input
                  id="agree-policy"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-1 mr-2"
                />
                <label htmlFor="agree-policy" className="text-gray-700 select-none">
                  Tôi đồng ý với <a href="/policy" className="text-blue-500 underline">chính sách của chúng tôi</a>
                </label>
              </div>
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              <button
                className={`w-full py-2 rounded bg-blue-500 text-white font-semibold transition ${!agreed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                disabled={!agreed}
                onClick={handleContinue}
              >
                Tiếp tục
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;