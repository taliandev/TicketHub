import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store'
import { setAccessToken, clearAuth } from '@/store/slices/authSlice'

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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config

    // Don't retry if this is the refresh endpoint itself (prevent infinite loop)
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
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
        // Try to refresh access token using refresh token in cookie
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const { accessToken } = response.data
        
        // Update access token in Redux store
        store.dispatch(setAccessToken(accessToken))
        
        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken
        }

        processQueue(null, accessToken)
        isRefreshing = false
        
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        
        // Refresh failed - clear auth and redirect to login
        store.dispatch(clearAuth())
        
        // Only redirect if not already on login/register page
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/'
        }
        
        return Promise.reject(refreshError)
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Export as default and named
export default axiosInstance 