import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import QRScanner from '@/components/QRScanner';

interface TicketInfo {
  _id: string;
  ticketCode: string;
  status: string;
  type: string;
  userId?: {
    fullName: string;
    email: string;
  };
  eventId?: {
    title: string;
    date: string;
    location: string;
  };
  user?: {
    fullName?: string;
    username?: string;
  };
  event?: {
    title?: string;
  };
  quantity_total?: number;
  usedAt?: string;
}

interface ErrorResponse {
  message: string;
  ticket?: TicketInfo;
}

const CheckIn = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [ticketCode, setTicketCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // Redirect if not organizer or admin
  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
    navigate('/');
    return null;
  }

  const processCheckIn = async (code: string) => {
    if (!code.trim()) {
      setErrorMessage('Mã vé không hợp lệ');
      return;
    }

    setIsLoading(true);
    setTicketInfo(null);
    setCheckInSuccess(false);
    setErrorMessage('');

    try {
      const response = await axiosInstance.post('/tickets/checkin', {
        ticketCode: code.trim()
      });

      setTicketInfo(response.data.ticket);
      setCheckInSuccess(true);
      
      // Clear input after 3 seconds
      setTimeout(() => {
        setTicketCode('');
        setTicketInfo(null);
        setCheckInSuccess(false);
      }, 3000);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra';
      setErrorMessage(errorMsg);
      
      // Show ticket info even if check-in fails (for debugging)
      if (err.response?.data?.ticket) {
        setTicketInfo(err.response.data.ticket);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await processCheckIn(ticketCode);
  };

  const handleScanSuccess = (decodedText: string) => {
    setTicketCode(decodedText);
    setShowScanner(false);
    // Auto check-in after scan
    processCheckIn(decodedText);
  };

  const handleScanQR = () => {
    setShowScanner(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Check-in Vé</h1>
          <p className="text-gray-600">Quét mã QR hoặc nhập mã vé để check-in</p>
        </div>

        {/* Success/Error Message */}
        {(checkInSuccess || errorMessage) && (
          <div className={`mb-6 p-4 rounded-lg ${
            checkInSuccess ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              {checkInSuccess ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">
                {checkInSuccess ? 'Check-in thành công!' : errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* QR Scanner Button */}
          <button
            onClick={handleScanQR}
            className="w-full mb-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Quét mã QR
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">hoặc nhập mã thủ công</span>
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã vé
              </label>
              <input
                type="text"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã vé (VD: TICK-ABC123)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !ticketCode.trim()}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Check-in'
              )}
            </button>
          </form>
        </div>

        {/* Ticket Info Display */}
        {ticketInfo && (
          <div className={`bg-white rounded-2xl shadow-xl p-8 border-4 ${
            checkInSuccess ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Thông tin vé</h3>
              {checkInSuccess ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-lg">Hợp lệ</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-lg">Không hợp lệ</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã vé</p>
                  <p className="font-bold text-lg font-mono">{ticketInfo.ticketCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    ticketInfo.status === 'used' ? 'bg-green-100 text-green-800' :
                    ticketInfo.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticketInfo.status === 'used' ? 'Đã sử dụng' :
                     ticketInfo.status === 'paid' ? 'Đã thanh toán' :
                     ticketInfo.status === 'pending' ? 'Chờ thanh toán' : ticketInfo.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Sự kiện</p>
                <p className="font-semibold text-lg">{ticketInfo.event?.title || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Người mua</p>
                  <p className="font-semibold">{ticketInfo.user?.fullName || ticketInfo.user?.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số lượng</p>
                  <p className="font-semibold">{ticketInfo.quantity_total || 1} vé</p>
                </div>
              </div>

              {ticketInfo.usedAt && (
                <div>
                  <p className="text-sm text-gray-600">Thời gian check-in</p>
                  <p className="font-semibold">{new Date(ticketInfo.usedAt).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Quay lại Dashboard
        </button>
      </div>
    </div>
  );
};

export default CheckIn;
