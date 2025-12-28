import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import TicketModal from '../components/ui/TicketModal';
import { useNavigate } from 'react-router-dom';
import ChangePasswordSection from '@/components/profile/ChangePasswordSection';

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

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicket, setShowTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/tickets/user/${user.id}`);
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
        return <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (!user) return <div className="text-center py-12">Bạn cần đăng nhập để xem trang này.</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Thông tin cá nhân</h1>
      
      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tài khoản</h2>
          <div className="space-y-3">
            <div><span className="font-medium">Họ tên:</span> {user.fullName}</div>
            <div><span className="font-medium">Email:</span> {user.email}</div>
            <div><span className="font-medium">Username:</span> {user.username}</div>
            <div><span className="font-medium">Role:</span> {user.role}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thống kê</h2>
          <div className="space-y-3">
            <div><span className="font-medium">Tổng vé đã đặt:</span> {tickets.reduce((sum, t) => sum + t.quantity_total, 0)}</div>
            <div><span className="font-medium">Vé đã thanh toán:</span> {tickets.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.quantity_total, 0)}</div>
            <div><span className="font-medium">Vé chờ thanh toán:</span> {tickets.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.quantity_total, 0)}</div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="mb-8">
        <ChangePasswordSection />
      </div>

      {/* Tickets Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Vé đã đặt</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải vé...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <p className="text-gray-600">Bạn chưa đặt vé nào.</p>
            <a href="/events" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Khám phá sự kiện
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sự kiện</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại vé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ticket.eventId?.img && (
                          <img 
                            className="h-10 w-10 rounded-lg object-cover mr-3" 
                            src={ticket.eventId.img} 
                            alt={ticket.eventId.title}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ticket.eventId?.title}</div>
                          <div className="text-sm text-gray-500">{ticket.eventId?.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{ticket.quantity_total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.price.toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {ticket.status === 'paid' && ticket.qrCode && ticket.ticketCode ? (
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                          onClick={() => { setSelectedTicket(ticket); setShowTicket(true); }}
                        >
                          Xem vé
                        </button>
                      ) : ticket.status === 'pending' ? (
                        <button
                          className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                          onClick={() => navigate('/checkout', { 
                            state: { 
                              existingTicketId: ticket._id, // Pass existing ticket ID
                              bookingData: {
                                eventId: ticket.eventId._id,
                                type: ticket.type,
                                price: ticket.price / ticket.quantity_total, // Unit price
                                quantity: ticket.quantity_total
                              }
                            }
                          })}
                        >
                          Thanh toán
                        </button>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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