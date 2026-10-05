import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import axiosInstance from '@/lib/axios'

const OrganizerApply = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: user?.email || '',
    phone: '',
    organizationType: '',
    eventCategory: '',
    expectedEventVolume: '',
    description: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const organizationTypes = [
    'Công ty sự kiện',
    'Công ty giải trí',
    'Tổ chức phi lợi nhuận',
    'Cá nhân',
    'Khác'
  ]

  const eventCategories = [
    'Âm nhạc / Hòa nhạc',
    'Hội thảo / Workshop',
    'Triển lãm',
    'Thể thao',
    'Festival',
    'Khác'
  ]

  const eventVolumes = [
    '1-5 sự kiện/năm',
    '6-10 sự kiện/năm',
    '11-20 sự kiện/năm',
    '20+ sự kiện/năm'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Vui lòng đăng nhập để đăng ký')
      return
    }

    setLoading(true)
    setError('')

    try {
      await axiosInstance.post('/organizer/applications', {
        ...formData,
        userId: user.id
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 border border-purple-500/20 rounded-2xl p-8 max-w-md text-center">
          <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-400 mb-6">Bạn cần có tài khoản để đăng ký trở thành nhà tổ chức</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 border border-green-500/20 rounded-2xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-400 mb-2">
            Cảm ơn bạn đã đăng ký. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.
          </p>
          <p className="text-sm text-gray-500">Đang chuyển hướng về trang chủ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Đăng ký Nhà Tổ Chức
          </h1>
          <p className="text-gray-400 text-lg">Điền thông tin để trở thành đối tác của chúng tôi</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900/90 border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Tên tổ chức <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="VD: ABC Entertainment"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Người liên hệ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="contact@company.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="0912345678"
              />
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Loại hình tổ chức <span className="text-red-400">*</span>
              </label>
              <select
                name="organizationType"
                value={formData.organizationType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="">Chọn loại hình</option>
                {organizationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Event Category */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Lĩnh vực sự kiện <span className="text-red-400">*</span>
              </label>
              <select
                name="eventCategory"
                value={formData.eventCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="">Chọn lĩnh vực</option>
                {eventCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Expected Volume */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Số lượng sự kiện dự kiến <span className="text-red-400">*</span>
              </label>
              <select
                name="expectedEventVolume"
                value={formData.expectedEventVolume}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="">Chọn số lượng</option>
                {eventVolumes.map(vol => (
                  <option key={vol} value={vol}>{vol}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Mô tả về tổ chức / kinh nghiệm <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                placeholder="Mô tả ngắn gọn về tổ chức, kinh nghiệm tổ chức sự kiện của bạn..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-3 px-6 border border-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-800 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  loading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30'
                }`}
              >
                {loading ? 'Đang gửi...' : 'Gửi đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrganizerApply
