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
  accessToken: string 
}

interface LoginCredentials {
  identifier?: string 
  email?: string 
  password: string
  [key: string]: unknown
}

interface RegisterData {
  username: string
  email: string
  password: string
  fullName: string
  [key: string]: unknown
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

  const restoreSession = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (response.status === 200) {
        const data: AuthResponse = await response.json()
        const { accessToken, user } = data
        
        dispatch(setAccessToken(accessToken))
        dispatch(updateUser(user))
        
        return { success: true }
      }
      
      // 204 or 401 - No refresh token or invalid (expected)
      dispatch(clearAuth())
      return { success: false }
    } catch (error) {
      // Silent catch - network errors or CORS issues
      dispatch(clearAuth())
      return { success: false }
    }
  }, [dispatch])

  return {
    user,
    accessToken, 
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
