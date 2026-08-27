import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: 'user' | 'admin' | 'organizer'
}

interface AuthState {
  user: User | null
  accessToken: string | null // Lưu trong memory, không lưu localStorage
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Only restore user from localStorage, NOT token
const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  accessToken: null, // Token sẽ được lấy từ refresh token khi app khởi động
  isAuthenticated: false, // Sẽ được set true sau khi refresh token thành công
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken // Chỉ lưu trong memory
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      // KHÔNG lưu token vào localStorage
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      // Không cần xóa token vì không lưu trong localStorage
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      state.isAuthenticated = true
    },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('user')
    },
  },
})

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUser,
  setAccessToken,
  clearAuth
} = authSlice.actions

export default authSlice.reducer 