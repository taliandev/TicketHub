import { useState } from 'react';
import { useAdminEvents, useDeleteEvent } from '@/hooks/useAdminDashboard';
import { useOrganizerEvents, useDeleteOrganizerEvent } from '@/hooks/useOrganizerDashboard';
import { getEventStatus } from '@/lib/eventUtils';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import EventForm from '../forms/EventForm';

interface EventsTableProps {
  userRole?: 'admin' | 'organizer' | 'user';
}

interface Event {
  _id: string;
  title: string;
  image: string;
  location: string;
  organizerId?: {
    fullName: string;
    email: string;
  };
  date: string;
  time: string;
  category: string;
  status: string;
}

interface EventsResponse {
  events: Event[];
  totalPages: number;
  currentPage: number;
  total: number;
}

const EventsTable = ({ userRole = 'admin' }: EventsTableProps) => {
  const isAdmin = userRole === 'admin';
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const adminQuery = useAdminEvents(page, 10, search, statusFilter, { enabled: isAdmin });
  const organizerQuery = useOrganizerEvents(page, 10, search, statusFilter, { enabled: !isAdmin });
  const deleteAdminMutation = useDeleteEvent();
  const deleteOrganizerMutation = useDeleteOrganizerEvent();
  
  const { data: rawData, isLoading } = isAdmin ? adminQuery : organizerQuery;
  const deleteEventMutation = isAdmin ? deleteAdminMutation : deleteOrganizerMutation;

  const data = rawData as EventsResponse | undefined;

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingEvent(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Bạn có chắc muốn xóa sự kiện này? Hành động này không thể hoàn tác!')) {
      await deleteEventMutation.mutateAsync(eventId);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      published: 'Đã xuất bản',
      draft: 'Nháp',
      cancelled: 'Đã hủy',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Danh sách sự kiện</h3>
          <p className="text-sm text-gray-600 mt-1">Quản lý tất cả sự kiện trong hệ thống</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setIsEditModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm sự kiện
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Nháp</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sự kiện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người tổ chức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày diễn ra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.events?.map((event: Event) => {
                const eventStatus = getEventStatus(event.date);
                
                return (
                <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={event.image || 'https://via.placeholder.com/100'}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.organizerId?.fullName || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{event.organizerId?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(event.date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-sm text-gray-500">{event.time}</div>
                    <div className={`text-xs font-semibold mt-1 ${eventStatus.statusColor.replace('bg-', 'text-').replace('-100', '-700')}`}>
                      {eventStatus.statusText}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(event.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-3">
                      {/* View button */}
                      <a
                        href={`/events/${event._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                        title="Xem chi tiết"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>

                      {/* Edit button */}
                      <button
                        onClick={() => handleEdit(event)}
                        className="inline-flex items-center text-gray-600 hover:text-gray-700 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Trang {data.currentPage} / {data.totalPages} - Tổng {data.total} sự kiện
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Trước
              </Button>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
                variant="outline"
                size="sm"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} size="xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
          </h2>
          <EventForm 
            event={editingEvent} 
            onSuccess={handleCloseEditModal}
            onCancel={handleCloseEditModal}
          />
        </div>
      </Modal>
    </div>
  );
};

export default EventsTable;
