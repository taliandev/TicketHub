import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Button from '../components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice'
import { axios } from '@/lib/axios'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
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
      dispatch(loginStart())
      const response = await axios.post('/api/auth/login', data)
      dispatch(loginSuccess(response.data))
      navigate('/')
    } catch (error: any) {
      dispatch(loginFailure(error.response?.data?.message || 'Đăng nhập thất bại'))
      setError(error.response?.data?.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-gray-600 mt-2">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Mật khẩu"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <div className="text-center">
        <Link to="/forgot-password" className="text-sm text-gray-600 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
    </div>
  )
}

export default Login 