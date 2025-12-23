import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';

interface Ticket {
  _id: string;
  ticketCode: string;
  qrCode: string;
  type: string;
  price: number;
  quantity_total: number;
  status: 'pending' | 'paid' | 'used' | 'cancelled';
  eventId: {
    _id: string;
    title: string;
    date: string;
    location: string;
    img?: string;
  };
  userId?: {
    _id: string;
    username: string;
    email: string;
    fullName?: string;
  };
  extraInfo: {
    fullName: string;
    email: string;
    phone: string;
    cccd: string;
  };
  createdAt: string;
  paidAt?: string;
  usedAt?: string;
}

interface Statistics {
  total: number;
  totalQuantity: number;
  paid: number;
  paidQuantity: number;
  pending: number;
  pendingQuantity: number;
  cancelled: number;
  cancelledQuantity: number;
  used: number;
  usedQuantity: number;
  totalRevenue: number;
  paidRevenue: number;
}

const OrganizerTicketsTable = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await axiosInstance.get(`/organizer/tickets?${params}`);
      setTickets(response.data.tickets);
      setStatistics(response.data.statistics);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      used: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      paid: 'Đã thanh toán',
      pending: 'Chờ thanh toán',
      used: 'Đã sử dụng',
      cancelled: 'Đã hủy'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng vé</div>
            <div className="text-2xl font-bold">{statistics.totalQuantity}</div>
            <div className="text-xs text-gray-500">{statistics.total} đơn hàng</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-sm text-green-600">Đã thanh toán</div>
            <div className="text-2xl font-bold text-green-700">{statistics.paidQuantity}</div>
            <div className="text-xs text-green-600">{statistics.paidRevenue.toLocaleString()} đ</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-sm text-blue-600">Đã sử dụng</div>
            <div className="text-2xl font-bold text-blue-700">{statistics.usedQuantity}</div>
            <div className="text-xs text-blue-600">{statistics.used} vé</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-sm text-yellow-600">Chờ thanh toán</div>
            <div className="text-2xl font-bold text-yellow-700">{statistics.pendingQuantity}</div>
            <div className="text-xs text-yellow-600">{statistics.pending} vé</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Tìm theo mã vé, tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="used">Đã sử dụng</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không tìm thấy vé nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã vé</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sự kiện</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại vé</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ticket.ticketCode}</div>
                        <div className="text-xs text-gray-500">{ticket._id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {ticket.eventId?.img && (
                            <img
                              src={ticket.eventId.img}
                              alt={ticket.eventId.title}
                              className="w-10 h-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ticket.eventId?.title}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(ticket.eventId?.date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{ticket.extraInfo?.fullName}</div>
                        <div className="text-xs text-gray-500">{ticket.extraInfo?.email}</div>
                        <div className="text-xs text-gray-500">{ticket.extraInfo?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {ticket.quantity_total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.price.toLocaleString()} đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang {page} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerTicketsTable;
