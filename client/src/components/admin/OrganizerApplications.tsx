import { useState, useEffect, useCallback } from 'react'
import axiosInstance from '@/lib/axios'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'

interface Application {
  _id: string
  userId: {
    _id: string
    username: string
    email: string
    fullName: string
  }
  organizationName: string
  contactPerson: string
  email: string
  phone: string
  organizationType: string
  eventCategory: string
  expectedEventVolume: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt?: string
  reviewedBy?: {
    username: string
    email: string
  }
  rejectionReason?: string
}

interface ApiErrorResponse {
  message?: string;
}

const OrganizerApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      const statusParam = filter === 'ALL' ? '' : filter
      const { data } = await axiosInstance.get(`/organizer/applications?status=${statusParam}`)
      setApplications(data.applications)
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>
      toast.error('Lỗi khi tải danh sách đơn đăng ký')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleApprove = async (id: string) => {
    if (!confirm('Xác nhận phê duyệt đơn đăng ký này?')) return

    setActionLoading(true)
    try {
      await axiosInstance.put(`/organizer/applications/${id}/approve`)
      toast.success('Đã phê duyệt đơn đăng ký')
      fetchApplications()
      setSelectedApp(null)
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>
      toast.error(err.response?.data?.message || 'Lỗi khi phê duyệt')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }

    setActionLoading(true)
    try {
      await axiosInstance.put(`/organizer/applications/${selectedApp._id}/reject`, {
        rejectionReason
      })
      toast.success('Đã từ chối đơn đăng ký')
      fetchApplications()
      setShowRejectModal(false)
      setSelectedApp(null)
      setRejectionReason('')
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối')
    } finally {
      setActionLoading(false)
    }
  }

  const openDetailModal = (app: Application) => {
    setSelectedApp(app)
    setShowDetailModal(true)
  }

  const openRejectModal = (app: Application) => {
    setSelectedApp(app)
    setShowRejectModal(true)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    const labels = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Đã từ chối'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Đơn đăng ký Nhà tổ chức</h3>
            <p className="text-sm text-gray-600 mt-1">Quản lý đơn đăng ký trở thành nhà tổ chức</p>
          </div>
          <div className="flex gap-2">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg">Không có đơn đăng ký nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div 
              key={app._id} 
              onClick={() => openDetailModal(app)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors line-clamp-1">
                      {app.organizationName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{app.eventCategory}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Quick Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="line-clamp-1">{app.contactPerson}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="line-clamp-1">{app.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="line-clamp-1">{app.organizationType}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Nộp ngày {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="mt-3 flex items-center justify-center text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Xem chi tiết</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedApp.organizationName}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedApp.eventCategory}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedApp.status)}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Thông tin liên hệ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Người liên hệ</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedApp.contactPerson}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedApp.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedApp.phone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Loại hình tổ chức</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedApp.organizationType}</p>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Thông tin sự kiện</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-xs text-purple-700 mb-1">Lĩnh vực sự kiện</p>
                    <p className="text-sm font-semibold text-purple-900">{selectedApp.eventCategory}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-xs text-purple-700 mb-1">Số lượng dự kiến</p>
                    <p className="text-sm font-semibold text-purple-900">{selectedApp.expectedEventVolume}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Mô tả về tổ chức</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedApp.description}</p>
                </div>
              </div>

              {/* Account Info */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Thông tin tài khoản</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Username</p>
                      <p className="font-semibold text-gray-900">{selectedApp.userId.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Họ tên</p>
                      <p className="font-semibold text-gray-900">{selectedApp.userId.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email tài khoản</p>
                      <p className="font-semibold text-gray-900">{selectedApp.userId.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Date */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Ngày nộp đơn</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(selectedApp.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Rejection Reason */}
              {selectedApp.status === 'REJECTED' && selectedApp.rejectionReason && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-2">Lý do từ chối</h4>
                  <p className="text-sm text-red-800 leading-relaxed">{selectedApp.rejectionReason}</p>
                </div>
              )}

              {/* Review Info */}
              {selectedApp.reviewedAt && selectedApp.reviewedBy && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">
                    Đã xử lý bởi <span className="font-semibold text-gray-700">{selectedApp.reviewedBy.username}</span> lúc{' '}
                    <span className="font-semibold text-gray-700">{new Date(selectedApp.reviewedAt).toLocaleString('vi-VN')}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer - Action Buttons */}
            {selectedApp.status === 'PENDING' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      handleApprove(selectedApp._id)
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      openRejectModal(selectedApp)
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Từ chối
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Từ chối đơn đăng ký</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Vui lòng nhập lý do từ chối đơn đăng ký của <span className="font-semibold">{selectedApp?.organizationName}</span>
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50"
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganizerApplications
