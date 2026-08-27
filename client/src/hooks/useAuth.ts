import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { RootState } from '@/store'
import { loginStart, loginSuccess, loginFailure, logout as logoutAction, updateUser, setAccessToken, clearAuth } from '@/store/slices/authSlice'
import api, { API_ENDPOINTS } from '@/lib/api'
import { handleApiError } from '@/lib/errorHandler'
import axiosInstance from '@/lib/axios'

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: 'user' | 'admin' | 'organizer'
}

interface AuthResponse {
  user: User
  accessToken: string // Changed from 'token' to 'accessToken'
}

interface LoginCredentials {
  identifier?: string  // email or username
  email?: string       // for backward compatibility
  password: string
  [key: string]: unknown // Add index signature
}

interface RegisterData {
  username: string
  email: string
  password: string
  fullName: string
  [key: string]: unknown // Add index signature
}

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, accessToken, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  )

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        dispatch(loginStart())
        const response = await api.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials)
        dispatch(loginSuccess(response.data))
        return { success: true, data: response.data }
      } catch (error) {
        const apiError = handleApiError(error)
        dispatch(loginFailure(apiError.message))
        return { success: false, error: apiError.message }
      }
    },
    [dispatch]
  )

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        dispatch(loginStart())
        const response = await api.post<AuthResponse>(API_ENDPOINTS.REGISTER, data)
        dispatch(loginSuccess(response.data))
        return { success: true, data: response.data }
      } catch (error) {
        const apiError = handleApiError(error)
        dispatch(loginFailure(apiError.message))
        return { success: false, error: apiError.message }
      }
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear auth state regardless of API call result
      dispatch(logoutAction())
    }
  }, [dispatch])

  const updateProfile = useCallback(
    (userData: User) => {
      dispatch(updateUser(userData))
    },
    [dispatch]
  )

  // Try to restore session using refresh token
  const restoreSession = useCallback(async () => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/refresh')
      const { accessToken, user } = response.data
      
      dispatch(setAccessToken(accessToken))
      dispatch(updateUser(user))
      
      return { success: true }
    } catch (error) {
      // Refresh token expired or invalid
      dispatch(clearAuth())
      return { success: false }
    }
  }, [dispatch])

  return {
    user,
    accessToken, // Changed from 'token'
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    restoreSession,
  }
}
