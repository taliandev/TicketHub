import { AxiosError } from 'axios'

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: Record<string, unknown>
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    const code = error.response?.data?.code || error.code

    // Handle specific status codes
    switch (status) {
      case 400:
        return {
          message: message || 'Yêu cầu không hợp lệ',
          status,
          code,
          details: error.response?.data?.details,
        }
      case 401:
        return {
          message: 'Vui lòng đăng nhập để tiếp tục',
          status,
          code,
        }
      case 403:
        return {
          message: 'Bạn không có quyền truy cập',
          status,
          code,
        }
      case 404:
        return {
          message: 'Không tìm thấy dữ liệu',
          status,
          code,
        }
      case 422:
        return {
          message: 'Dữ liệu không hợp lệ',
          status,
          code,
          details: error.response?.data?.details,
        }
      case 500:
        return {
          message: 'Lỗi máy chủ, vui lòng thử lại sau',
          status,
          code,
        }
      default:
        return {
          message: message || 'Đã xảy ra lỗi, vui lòng thử lại',
          status,
          code,
        }
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: 'Đã xảy ra lỗi không xác định',
  }
}

export const getErrorMessage = (error: unknown): string => {
  return handleApiError(error).message
}
