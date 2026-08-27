import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import { Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

const ChangePasswordSection = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      setMessage('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
          <Lock className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Đổi mật khẩu</h2>
          <p className="text-sm text-gray-400">Cập nhật mật khẩu của bạn</p>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mật khẩu mới
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Ít nhất 6 ký tự"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
            disabled={isLoading}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Xác nhận mật khẩu mới
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Nhập lại mật khẩu mới"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
            disabled={isLoading}
          />
        </div>

        {/* Show Password Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPasswords ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-300 mb-3">Yêu cầu mật khẩu:</p>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${newPassword.length >= 6 ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600'}`}>
                {newPassword.length >= 6 && <Check className="w-3 h-3 text-green-400" />}
              </div>
              Ít nhất 6 ký tự
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600'}`}>
                {newPassword && confirmPassword && newPassword === confirmPassword && <Check className="w-3 h-3 text-green-400" />}
              </div>
              Mật khẩu khớp nhau
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 disabled:shadow-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Đổi mật khẩu'
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordSection;
