import { toast as sonnerToast } from 'sonner'


export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      duration: 3000,
      position: 'top-right',
    })
  },

  error: (message: string) => {
    sonnerToast.error(message, {
      duration: 4000,
      position: 'top-right',
    })
  },

  info: (message: string) => {
    sonnerToast.info(message, {
      duration: 3000,
      position: 'top-right',
    })
  },

  warning: (message: string) => {
    sonnerToast.warning(message, {
      duration: 3000,
      position: 'top-right',
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
      position: 'top-right',
    })
  },
}
