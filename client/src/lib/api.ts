import axiosInstance from './axios'
import { AxiosResponse } from 'axios'

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // Events
  EVENTS: '/events',
  EVENT_BY_ID: (id: string) => `/events/${id}`,
  EVENTS_BY_IDS: '/events/by-ids',
  
  // Tickets
  TICKETS: '/tickets',
  TICKET_BY_ID: (id: string) => `/tickets/${id}`,
  
  // Payments
  PAYMENTS: '/payments',
  PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
  
  // Reservations
  RESERVATIONS: '/reservations',
  RESERVATION_BY_ID: (id: string) => `/reservations/${id}`,
  
  // Search
  SEARCH_SUGGESTIONS: '/search/suggestions',
} as const

// Generic API functions
export const api = {
  get: <T = unknown>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> => 
    axiosInstance.get(url, { params }),
    
  post: <T = unknown>(url: string, data?: Record<string, unknown>): Promise<AxiosResponse<T>> => 
    axiosInstance.post(url, data),
    
  put: <T = unknown>(url: string, data?: Record<string, unknown>): Promise<AxiosResponse<T>> => 
    axiosInstance.put(url, data),
    
  patch: <T = unknown>(url: string, data?: Record<string, unknown>): Promise<AxiosResponse<T>> => 
    axiosInstance.patch(url, data),
    
  delete: <T = unknown>(url: string): Promise<AxiosResponse<T>> => 
    axiosInstance.delete(url),
}

export default api
