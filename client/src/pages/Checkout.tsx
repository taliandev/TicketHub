import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AxiosError } from 'axios';
import axiosInstance from '@/lib/axios';
import PaymentGateway from '../components/PaymentGateway';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';

interface BookingData {
  eventId: string;
  type: string;
  price: number;
  quantity: number;
}

interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const locationState = location.state as { bookingData: BookingData; existingTicketId?: string };
  const bookingData = locationState?.bookingData;
  const existingTicketId = locationState?.existingTicketId;



  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    cccd: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [reservationId, setReservationId] = useState<string>('');
  const [ttl, setTtl] = useState<number>(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  React.useEffect(() => {
    if (!bookingData) {
      navigate('/events');
    }
  }, [bookingData, navigate]);

  React.useEffect(() => {
    if (!user) {
      // Show login modal instead of redirecting
      setShowLoginModal(true);
    }
  }, [user]);

  useEffect(() => {
    if (existingTicketId) {
      setTicketId(existingTicketId);
      setShowPayment(true);
    }
  }, [existingTicketId]);

  const reservationStorageKey = user && bookingData
    ? `reservation:${user.id}:${bookingData.eventId}:${bookingData.type}`
    : '';
  const hasAutoReservedKey = reservationStorageKey ? `${reservationStorageKey}:auto` : '';

  const createReservationNow = async () => {
    if (!bookingData || !user) return;
    const resp = await axiosInstance.post('/reservations', {
      eventId: bookingData.eventId,
      type: bookingData.type,
      quantity: bookingData.quantity,
      userId: user.id,
      ttlSeconds: 900,
    });
    setReservationId(resp.data.reservationId);
    setTtl(resp.data.ttlSeconds);
    if (reservationStorageKey) {
      localStorage.setItem(
        reservationStorageKey,
        JSON.stringify({ reservationId: resp.data.reservationId })
      );
    }
  };

  useEffect(() => {
    const ensureReservation = async () => {
      if (!bookingData || !user) return;
      try {
        if (reservationStorageKey) {
          const stored = localStorage.getItem(reservationStorageKey);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as { reservationId: string };
              if (parsed?.reservationId) {
                const r = await axiosInstance.get(`/reservations/${parsed.reservationId}/ttl`);
                if (typeof r.data.ttlSeconds === 'number' && r.data.ttlSeconds > 0) {
                  setReservationId(parsed.reservationId);
                  setTtl(r.data.ttlSeconds);
                  return;
                }
                localStorage.removeItem(reservationStorageKey);
              }
            } catch (error: any) {
              // If 404, reservation expired - remove from storage
              if (error?.response?.status === 404) {
                localStorage.removeItem(reservationStorageKey);
              }
            }
          }
        }
        
        // IMPORTANT: Avoid auto re-locking after expiry/reload within same session
        if (hasAutoReservedKey && sessionStorage.getItem(hasAutoReservedKey) === '1') {
          setError('Thời gian giữ chỗ đã hết. Vui lòng giữ chỗ lại để tiếp tục.');
          return;
        }
        await createReservationNow();
        if (hasAutoReservedKey) sessionStorage.setItem(hasAutoReservedKey, '1');
      } catch (e) {
        setError('Loại vé đã hết chỗ tạm thời. Vui lòng thử lại sau.');
      }
    };
    ensureReservation();
  }, [bookingData?.eventId, bookingData?.type, bookingData?.quantity, user?.id, reservationStorageKey]);

  useEffect(() => {
    if (ttl === 0 && reservationId) {
      if (reservationStorageKey) localStorage.removeItem(reservationStorageKey);
      setReservationId('');
      setError('Thời gian giữ chỗ đã hết. Vui lòng giữ chỗ lại để tiếp tục.');
    }
  }, [ttl, reservationId]);

  useEffect(() => {
    if (ttl <= 0) return;
    
    const timer = setInterval(() => {
      setTtl(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [ttl, reservationId]);

  useEffect(() => {
    if (!reservationId) return;
    const interval = setInterval(async () => {
      try {
        const r = await axiosInstance.get(`/reservations/${reservationId}/ttl`);
        if (typeof r.data.ttlSeconds === 'number') setTtl(r.data.ttlSeconds);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          clearInterval(interval);
          setTtl(0);
          setReservationId('');
          if (reservationStorageKey) localStorage.removeItem(reservationStorageKey);
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [reservationId, reservationStorageKey]);

  const handleCancelCheckout = async () => {
    try {
      if (reservationId) {
        await axiosInstance.delete(`/reservations/${reservationId}`);
      }
    } catch {
      // ignore
    } finally {
      if (reservationStorageKey) {
        localStorage.removeItem(reservationStorageKey);
      }
      navigate('/events');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('84')) {
      return '0' + cleaned.substring(2);
    }
    
    if (cleaned.startsWith('84')) {
      return '0' + cleaned.substring(2);
    }
    
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !bookingData) {
      setError('Thông tin không hợp lệ');
      return;
    }
    
    setLoading(true);
    setError('');

    const formattedPhone = formatPhoneNumber(formData.phone);

    try {
      if (existingTicketId) {
        setTicketId(existingTicketId);
        setShowPayment(true);
        setLoading(false);
        return;
      }

      
      await axiosInstance.post('/tickets', {
        eventId: bookingData.eventId,
        type: bookingData.type,
        price: bookingData.price * bookingData.quantity, 
        quantity_total: bookingData.quantity,
        status: 'pending',
        extraInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formattedPhone,
          cccd: formData.cccd,
        },
        userId: user.id,
      }).then(response => {
        setTicketId(response.data._id);
        setShowPayment(true);
      });

    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.message || 'Có lỗi xảy ra khi tạo vé. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowSuccessModal(true);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (!user) return null;
  if (!bookingData) return null;

  return (
    <>
      {showPayment && ticketId ? (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <PaymentGateway
            amount={bookingData.price * bookingData.quantity}
            ticketId={ticketId}
            reservationId={reservationId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Thông tin thanh toán</h1>
        
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="flex justify-between mb-2">
            <span>Thời gian giữ chỗ:</span>
            <span className="font-medium">{Math.floor(ttl / 60)}:{("0" + (ttl % 60)).slice(-2)}</span>
          </div>
          {error && (
            <div className="text-sm text-red-600 mb-2">{error}</div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Loại vé:</span>
              <span className="font-medium">{bookingData.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Số lượng:</span>
              <span className="font-medium">{bookingData.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Đơn giá:</span>
              <span className="font-medium">{bookingData.price.toLocaleString()} đ</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng tiền:</span>
              <span className="text-blue-600">{(bookingData.price * bookingData.quantity).toLocaleString()} đ</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="VD: 0912345678 hoặc +84 912345678"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhập số điện thoại Việt Nam (VD: 0912345678)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CCCD/CMND *
            </label>
            <input
              type="text"
              name="cccd"
              value={formData.cccd}
              onChange={handleChange}
              placeholder="Nhập 9-12 chữ số"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancelCheckout}
              className="flex-1 py-3 px-4 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || ttl <= 0 || !reservationId}
              className={`flex-1 py-3 px-4 rounded-md text-white font-medium transition-colors ${
                loading || ttl <= 0 || !reservationId
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {ttl <= 0 || !reservationId ? 'Giữ chỗ lại để tiếp tục' : (loading ? 'Đang xử lý...' : 'Tiếp tục thanh toán')}
            </button>
          </div>
          {ttl <= 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={async () => { 
                  try { 
                    await createReservationNow(); 
                    setError(''); 
                    if (hasAutoReservedKey) sessionStorage.setItem(hasAutoReservedKey, '1'); 
                  } catch { 
                    setError('Không thể giữ chỗ. Vui lòng thử lại.'); 
                  } 
                }}
                className="w-full py-3 px-4 rounded-md bg-yellow-600 text-white font-medium hover:bg-yellow-700"
              >
                Giữ chỗ lại
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Login/Register Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
        skipRedirect={true}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-7 lg:p-10 w-full max-w-[95%] sm:max-w-md lg:max-w-[580px] border border-green-500/20 shadow-2xl shadow-green-500/10 relative max-h-[calc(100vh-40px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200 active:scale-95 z-10"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative z-10">
              {/* Success Icon */}
              <div className="flex justify-center mb-6 sm:mb-7">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 sm:p-5 shadow-xl shadow-green-500/30">
                    <svg className="w-14 h-14 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-3 text-white">
                Thanh toán thành công!
              </h2>
              
              {/* Subtitle */}
              <p className="text-gray-400 text-center mb-7 sm:mb-8 lg:mb-10 leading-relaxed text-sm sm:text-base">
                Vé của bạn đã được kích hoạt và gửi đến email của bạn.
              </p>

              {/* Transaction Summary Card */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-5 sm:p-6 lg:p-7 mb-7 sm:mb-8 lg:mb-10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-semibold text-white">Thông tin giao dịch</h3>
                  </div>
                  {/* Print/Download button for desktop */}
                  <button
                    onClick={() => window.print()}
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-all"
                    title="In vé"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    In vé
                  </button>
                </div>
                
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-400 text-sm flex-shrink-0">Mã vé</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono font-semibold text-sm bg-gray-700/50 px-3 py-1.5 rounded-lg">
                        #{ticketId.slice(-8).toUpperCase()}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ticketId);
                          // Optional: Show toast notification
                        }}
                        className="hidden sm:flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-all"
                        title="Sao chép mã vé"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-gray-400 text-sm flex-shrink-0">Loại vé</span>
                    <span className="text-white font-medium text-sm text-right">
                      {bookingData?.type || 'Standard Ticket'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-400 text-sm flex-shrink-0">Số lượng</span>
                    <span className="text-white font-medium text-sm">
                      {bookingData?.quantity || 1} vé
                    </span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent my-1" />

                  <div className="flex justify-between items-center gap-4 pt-1">
                    <span className="text-gray-400 text-sm font-medium flex-shrink-0">Tổng tiền</span>
                    <span className="text-green-400 font-bold text-xl sm:text-2xl">
                      {((bookingData?.price || 0) * (bookingData?.quantity || 1)).toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Row layout for desktop, stacked for mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/events');
                  }}
                  className="sm:flex-1 sm:order-1 py-3 sm:py-3.5 px-5 text-gray-400 hover:text-white font-medium transition-all duration-200 rounded-xl border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/30 active:bg-gray-800/50 text-sm sm:text-base order-2"
                >
                  Quay lại trang sự kiện
                </button>

                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/profile');
                  }}
                  className="sm:flex-1 sm:order-2 py-3 sm:py-3.5 px-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 active:from-green-700 active:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 text-sm sm:text-base order-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Xem vé của tôi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;