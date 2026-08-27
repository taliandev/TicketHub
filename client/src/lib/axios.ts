import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store'
import { setAccessToken, clearAuth } from '@/store/slices/authSlice'
import { toast } from './toast'

// API Configuration
const API_URL = import.meta.env.VITE_API_URL
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send cookies with requests
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState()
    const token = state.auth.accessToken // Lấy từ Redux store (memory)
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config

    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
          }
          return axiosInstance(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const { accessToken } = response.data
        
        store.dispatch(setAccessToken(accessToken))
        
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken
        }

        processQueue(null, accessToken)
        isRefreshing = false
        
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        
        store.dispatch(clearAuth())
        
        const wasAuthenticated = store.getState().auth.isAuthenticated
        if (wasAuthenticated) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại')
          
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            window.location.href = '/'
          }
        }
        
        return Promise.reject(refreshError)
      }
    }
    
    if (!error.response && !originalRequest.url?.includes('/auth/refresh')) {
      console.error('Network error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance 