import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import TicketModal from '../components/ui/TicketModal';
import { useNavigate } from 'react-router-dom';
import ChangePasswordSection from '@/components/profile/ChangePasswordSection';
import { User, Ticket as TicketIcon, Settings, Calendar, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Ticket {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    location: string;
    img?: string;
  };
  type: string;
  price: number;
  quantity_total: number;
  status: string;
  ticketCode?: string;
  qrCode?: string;
  extraInfo: {
    fullName: string;
    email: string;
    phone: string;
    cccd: string;
  };
  createdAt: string;
}

type TabType = 'tickets' | 'info' | 'security';

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicket, setShowTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/tickets/user/${user.id}`);
        setTickets(res.data);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Đã thanh toán
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3" />
            Chờ thanh toán
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            Đã hủy
          </span>
        );
      case 'used':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <CheckCircle className="w-3 h-3" />
            Đã sử dụng
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Chưa đăng nhập</h2>
          <p className="text-gray-400 mb-6">Bạn cần đăng nhập để xem trang này</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    total: tickets.reduce((sum, t) => sum + t.quantity_total, 0),
    paid: tickets.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.quantity_total, 0),
    pending: tickets.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.quantity_total, 0),
    used: tickets.filter(t => t.status === 'used').reduce((sum, t) => sum + t.quantity_total, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border-b border-purple-500/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/50">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{user.fullName}</h1>
              <p className="text-purple-300">@{user.username} • {user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <TicketIcon className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Tổng vé</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Đã thanh toán</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.paid}</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Chờ thanh toán</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Đã sử dụng</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.used}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            Vé của tôi
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'info'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            Thông tin
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Bảo mật
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Đang tải vé...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TicketIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Chưa có vé nào</h3>
                <p className="text-gray-400 mb-6">Khám phá các sự kiện thú vị và đặt vé ngay!</p>
                <button
                  onClick={() => navigate('/events')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50"
                >
                  Khám phá sự kiện
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {tickets.map(ticket => (
                  <div key={ticket._id} className="p-6 hover:bg-gray-800/30 transition-all">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Event Image */}
                      {ticket.eventId?.img && (
                        <img
                          src={ticket.eventId.img}
                          alt={ticket.eventId.title}
                          className="w-full md:w-48 h-32 rounded-lg object-cover border border-gray-700/50"
                        />
                      )}
                      
                      {/* Ticket Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{ticket.eventId?.title}</h3>
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(ticket.eventId?.date).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          {getStatusBadge(ticket.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Loại vé</span>
                            <p className="text-white font-medium">{ticket.type}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Số lượng</span>
                            <p className="text-white font-medium">{ticket.quantity_total}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tổng tiền</span>
                            <p className="text-white font-medium">{ticket.price.toLocaleString()} đ</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Ngày đặt</span>
                            <p className="text-white font-medium">{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          {ticket.status === 'paid' && ticket.qrCode && ticket.ticketCode ? (
                            <button
                              onClick={() => { setSelectedTicket(ticket); setShowTicket(true); }}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium flex items-center gap-2"
                            >
                              <TicketIcon className="w-4 h-4" />
                              Xem vé
                            </button>
                          ) : ticket.status === 'pending' ? (
                            <button
                              onClick={() => navigate('/checkout', {
                                state: {
                                  existingTicketId: ticket._id,
                                  bookingData: {
                                    eventId: ticket.eventId._id,
                                    type: ticket.type,
                                    price: ticket.price / ticket.quantity_total,
                                    quantity: ticket.quantity_total
                                  }
                                }
                              })}
                              className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all text-sm font-medium flex items-center gap-2"
                            >
                              <CreditCard className="w-4 h-4" />
                              Thanh toán
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Thông tin cá nhân
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Họ và tên</label>
                  <p className="text-white font-medium">{user.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Tên đăng nhập</label>
                  <p className="text-white font-medium">@{user.username}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Vai trò & Quyền hạn
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Vai trò</label>
                  <p className="text-white font-medium capitalize">
                    {user.role === 'admin' ? 'Quản trị viên' : user.role === 'organizer' ? 'Nhà tổ chức' : 'Người dùng'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Trạng thái tài khoản</label>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-4 h-4" />
                    Hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <ChangePasswordSection />
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedTicket && showTicket && (
        <TicketModal
          open={showTicket}
          onClose={() => setShowTicket(false)}
          ticket={{
            type: selectedTicket.type,
            eventTitle: selectedTicket.eventId?.title || '',
            eventDate: new Date(selectedTicket.eventId?.date).toLocaleDateString('vi-VN'),
            eventAddress: selectedTicket.eventId?.location || '',
            name: selectedTicket.extraInfo?.fullName || user.fullName,
            ticketCode: selectedTicket.ticketCode || '',
            qrCode: selectedTicket.qrCode || '',
          }}
        />
      )}
    </div>
  );
};

export default Profile; 