import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Button from '../components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      const result = await login(data)
      
      if (result.success) {
        // Redirect based on user role
        const userRole = result.data?.user?.role
        if (userRole === 'admin' || userRole === 'organizer') {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      } else {
        setError(result.error || 'Đăng nhập thất bại')
      }
    } catch (err) {
      setError('Đã xảy ra lỗi, vui lòng thử lại')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="text-gray-600 mt-2">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-2">
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
            Email hoặc Tên đăng nhập
          </label>
          <Input
            id="identifier"
            type="text"
            placeholder="example@email.com hoặc username"
            {...register('identifier')}
            error={errors.identifier?.message}
            aria-invalid={errors.identifier ? 'true' : 'false'}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mật khẩu
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang đăng nhập...
            </span>
          ) : (
            'Đăng nhập'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link 
          to="/forgot-password" 
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>
    </div>
  )
}

export default Login 