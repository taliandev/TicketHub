import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

interface PaymentConfirmationProps {
  ticketId: string;
  amount: number;
  paymentMethod: string;
}

interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketId, amount, paymentMethod } = location.state as PaymentConfirmationProps;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if no ticket data
  useEffect(() => {
    if (!ticketId || !amount) {
      navigate('/events');
    }
  }, [ticketId, amount, navigate]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError('');

    if (!ticketId) {
      setError('Invalid ticket ID');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(`/api/tickets/${ticketId}`, {
        status: 'paid',
        paymentMethod: paymentMethod
      });

      setSuccess(true);
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.';
      setError(errorMessage);
      console.error('Error confirming payment:', axiosError.response ? axiosError.response.data : axiosError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!ticketId || !amount) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {success ? (
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">Thanh toán thành công!</h1>
            <p className="text-gray-600 mb-6">Vé của bạn đã được kích hoạt. Đang chuyển hướng...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Xác nhận thanh toán</h1>
            
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {amount.toLocaleString()} đ
                </div>
                <div className="text-gray-600">Số tiền cần thanh toán</div>
                <div className="text-sm text-gray-500 mt-2">
                  Phương thức: {paymentMethod === 'COD' ? 'Thanh toán tại quầy' : paymentMethod}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Hướng dẫn thanh toán</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Vui lòng chuẩn bị đúng số tiền cần thanh toán</li>
                  <li>Thanh toán trực tiếp tại quầy vé khi đến sự kiện</li>
                  <li>Xuất trình mã vé và CCCD/CMND để xác nhận</li>
                  <li>Nhân viên sẽ kiểm tra và cấp vé cho bạn</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Lưu ý quan trọng</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Vé của bạn sẽ chỉ được kích hoạt sau khi thanh toán thành công tại quầy vé.</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex-1 py-3 px-4 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Xem vé sau
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className={`flex-1 py-3 px-4 rounded-md text-white font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmation; 