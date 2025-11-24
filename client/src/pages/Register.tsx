import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Button from '../components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginSuccess } from '@/store/slices/authSlice'
import { axios } from '@/lib/axios'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'

const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      })
      
      dispatch(loginSuccess(response.data))
      toast.success('Đăng ký thành công!')
      navigate('/')
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || 'Đăng ký thất bại')
        toast.error(error.response?.data?.message || 'Đăng ký thất bại')
      } else {
        setError('Đăng ký thất bại')
        toast.error('Đăng ký thất bại')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              type="text"
              placeholder="Tên đăng nhập"
              {...register('username')}
              error={errors.username?.message}
            />
            <Input
              type="text"
              placeholder="Họ và tên"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            <Input
              type="email"
              placeholder="Email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              {...register('password')}
              error={errors.password?.message}
            />
            <Input
              type="password"
              placeholder="Xác nhận mật khẩu"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        </form>
      </div>
    </div>
  )
} 