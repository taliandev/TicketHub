import LoadingSpinner from './LoadingSpinner'

interface LoadingOverlayProps {
  message?: string
}

export default function LoadingOverlay({ message = 'Đang tải...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  )
}
