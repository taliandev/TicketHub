import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  skipRedirect?: boolean // Add this prop to skip auto-redirect
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, skipRedirect = false }: LoginModalProps) {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      const result = await login(data)

      if (result.success) {
        reset()
        onClose()
        
        // Show success toast
        toast.success('Đăng nhập thành công!')
        
        // Skip redirect if called from BookingModal or other components
        if (skipRedirect) {
          return
        }
        
        // Redirect based on user role
        const userRole = result.data?.user?.role
        if (userRole === 'admin' || userRole === 'organizer') {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      } else {
        // Show field-level error in form, not toast
        setError(result.error || 'Đăng nhập thất bại')
      }
    } catch (err) {
      // System error - show toast
      toast.error('Đã xảy ra lỗi hệ thống, vui lòng thử lại')
    }
  }

  const handleClose = () => {
    reset()
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
          <p className="text-gray-600 mt-1">Chào mừng bạn quay trở lại</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Email hoặc Tên đăng nhập
            </label>
            <Input
              id="identifier"
              type="text"
              placeholder="example@email.com hoặc username"
              {...register('identifier')}
              error={errors.identifier?.message}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  errors.password && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        {/* Forgot Password Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              handleClose();
              navigate('/forgot-password');
            }}
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </Modal>
  )
}
