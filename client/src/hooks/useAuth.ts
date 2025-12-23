import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { RootState } from '@/store'
import { loginStart, loginSuccess, loginFailure, logout as logoutAction, updateUser } from '@/store/slices/authSlice'
import api, { API_ENDPOINTS } from '@/lib/api'
import { handleApiError } from '@/lib/errorHandler'

interface LoginCredentials {
  identifier?: string  // email or username
  email?: string       // for backward compatibility
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
  fullName: string
}

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  )

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        dispatch(loginStart())
        const response = await api.post(API_ENDPOINTS.LOGIN, credentials)
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
        const response = await api.post(API_ENDPOINTS.REGISTER, data)
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

  const logout = useCallback(() => {
    dispatch(logoutAction())
  }, [dispatch])

  const updateProfile = useCallback(
    (userData: any) => {
      dispatch(updateUser(userData))
    },
    [dispatch]
  )

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  }
}
