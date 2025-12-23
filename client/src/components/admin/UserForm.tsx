import { useState } from 'react';
import { useUpdateUser } from '@/hooks/useAdminDashboard';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import api from '@/lib/api';

interface UserFormProps {
  user: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm = ({ user, onSuccess, onCancel }: UserFormProps) => {
  const isEdit = !!user;
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    password: '',
    role: user?.role || 'user',
    isBanned: user?.isBanned || false,
    isVerified: user?.isVerified || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const updateUser = useUpdateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isEdit) {
        // Update existing user
        const updates: any = {
          role: formData.role,
          isBanned: formData.isBanned,
          isVerified: formData.isVerified,
        };
        
        await updateUser.mutateAsync({
          userId: user._id,
          updates,
        });
      } else {
        // Create new user
        if (!formData.password || formData.password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          setLoading(false);
          return;
        }
        
        await api.post('/auth/register', {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
        });
        
        // If admin wants to set specific role, update it
        if (formData.role !== 'user') {
          // Note: This requires getting the new user ID from response
          // For now, admin can edit role after creation
        }
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Info */}
      {isEdit ? (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user?.fullName}</h3>
              <p className="text-sm text-gray-600">@{user?.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Ngày tạo:</span>
              <p className="font-medium text-gray-900">
                {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Tối thiểu 6 ký tự"
              required
            />
          </div>
        </div>
      )}

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="user">User</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Quyền hạn của người dùng trong hệ thống
        </p>
      </div>

      {/* Status Toggles - Only for Edit */}
      {isEdit && (
        <div className="space-y-4">
          {/* Ban Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Trạng thái tài khoản</h4>
              <p className="text-sm text-gray-600">
                {formData.isBanned ? 'Tài khoản đã bị khóa' : 'Tài khoản đang hoạt động'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBanned}
                onChange={(e) => setFormData({ ...formData, isBanned: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.isBanned ? 'Khóa' : 'Hoạt động'}
              </span>
            </label>
          </div>

          {/* Verified Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Xác thực email</h4>
              <p className="text-sm text-gray-600">
                {formData.isVerified ? 'Email đã được xác thực' : 'Email chưa xác thực'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo người dùng'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
