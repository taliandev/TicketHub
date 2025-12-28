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
            } catch {
              localStorage.removeItem(reservationStorageKey);
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
      } catch {
        // ignore
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [reservationId]);

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
    alert('Thanh toán thành công! Vé của bạn đã được kích hoạt.');
    navigate('/profile');
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (!user) return null;
  if (!bookingData) return null;

  if (showPayment && ticketId) {
    return (
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
    );
  }

  return (
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
  );
};

export default Checkout;