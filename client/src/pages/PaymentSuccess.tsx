import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const transactionId = searchParams.get('transactionId') || 
                             searchParams.get('vnp_TxnRef') || 
                             searchParams.get('orderId');
        
        if (!transactionId) {
          setError('Không tìm thấy thông tin giao dịch');
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/payments/status/${transactionId}`);
        
        if (response.data.status === 'paid') {
          setSuccess(true);
        } else {
          setError('Thanh toán chưa hoàn tất');
        }
      } catch (err) {
        setError('Không thể kiểm tra trạng thái thanh toán');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Đang kiểm tra thanh toán...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {success ? (
          <>
            <div className="mb-6">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">Thanh toán thành công!</h1>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Vé của bạn đã được kích hoạt.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Những gì tiếp theo?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Vé của bạn đã được gửi qua email</li>
                <li>• Bạn có thể xem vé trong trang Profile</li>
                <li>• Hãy mang vé và CCCD/CMND khi đến sự kiện</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Xem vé của tôi
              </button>
              <button
                onClick={() => navigate('/events')}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Khám phá sự kiện khác
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-red-600">Thanh toán thất bại</h1>
            <p className="text-gray-600 mb-6">
              {error || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">Bạn có thể:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Thử thanh toán lại</li>
                <li>• Kiểm tra lại thông tin thanh toán</li>
                <li>• Liên hệ hỗ trợ nếu cần thiết</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Quay lại Profile
              </button>
              <button
                onClick={() => navigate('/events')}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Khám phá sự kiện
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 