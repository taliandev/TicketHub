import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import { setBooking } from '@/store/slices/bookingSlice';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { Link } from 'react-router-dom';

export interface TicketType {
  type: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  ticketTypes: TicketType[];
}

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, eventId, ticketTypes }) => {
  const user = useSelector((state: RootState) => (state as any).auth?.user);
  const [selectedType, setSelectedType] = useState<TicketType | null>(ticketTypes[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSwitchToRegister = () => {
    setError('');
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setError('');
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    if (pendingBooking && selectedType) {
      const total = selectedType.price * quantity;
      const bookingData = {
        eventId,
        type: selectedType.type,
        price: selectedType.price,
        quantity,
      };
      
      dispatch(setBooking({
        eventId,
        title: '',
        type: selectedType.type,
        price: selectedType.price,
        quantity,
        total,
      }));
      onClose();
      navigate('/checkout', { state: { bookingData } });
    }
  };

  // Watch for user login
  React.useEffect(() => {
    if (user && pendingBooking) {
      setTimeout(() => {
        handleLoginSuccess();
      }, 100);
    }
  }, [user, pendingBooking]);

  if (!open) return null;


  const total = selectedType ? selectedType.price * quantity : 0;

  const handleConfirm = () => {
    
    if (!agreed || !selectedType || quantity < 1) return;
    
    // Check if user is logged in
    if (!user) {
      setError('Vui lòng đăng nhập để đặt vé.');
      setPendingBooking(true);
    
      setTimeout(() => {
        setShowLoginModal(true);
      }, 800);
      return;
    }
    
    setError('');
    // User is logged in, proceed to checkout
    const bookingData = {
      eventId,
      type: selectedType.type,
      price: selectedType.price,
      quantity,
    };
    
    dispatch(setBooking({
      eventId,
      title: '',
      type: selectedType.type,
      price: selectedType.price,
      quantity,
      total,
    }));
    onClose();
    navigate('/checkout', { state: { bookingData } });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative animate-fadeIn" style={{ display: showLoginModal || showRegisterModal ? 'none' : 'block' }}>
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          
          <h2 className="text-2xl font-bold mb-6 text-center">Đặt vé</h2>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {ticketTypes.map((ticket) => (
                <div
                  key={ticket.type}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType?.type === ticket.type ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'}`}
                  onClick={() => setSelectedType(ticket)}
                >
                  <div className="font-semibold text-lg mb-1">{ticket.type}</div>
                  <div className="text-gray-600 text-sm mb-2 min-h-[40px]">{ticket.description}</div>
                  <div className="font-bold text-blue-600">{ticket.price.toLocaleString()} đ</div>
                </div>
              ))}
            </div>
            {selectedType && (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <label htmlFor="quantity" className="font-medium">Số lượng:</label>
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded text-lg font-bold"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >-</button>
                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-center border rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded text-lg font-bold"
                    onClick={() => setQuantity(q => q + 1)}
                  >+</button>
                </div>
                <div className="mb-4 text-lg font-semibold text-right">
                  Tổng cộng: <span className="text-blue-600">{total.toLocaleString()} đ</span>
                </div>
              </>
            )}
            <div className="mb-4 flex items-start">
              <input
                id="agree-policy"
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-1 mr-2"
              />
              <label htmlFor="agree-policy" className="text-gray-700 select-none">
                Tôi đồng ý với <Link to="/policy" className="text-blue-500 underline">chính sách của chúng tôi</Link>
              </label>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 text-center">
                {error}
              </div>
            )}
            <button
              className={`w-full py-2 rounded bg-blue-500 text-white font-semibold transition ${!agreed || !selectedType ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              disabled={!agreed || !selectedType}
              onClick={handleConfirm}
            >
              Tiếp tục
            </button>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn { animation: fadeIn 0.2s ease; }
          `}</style>
        </div>
      )}
      
      {/* Login/Register Modals - Higher z-index than BookingModal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          setPendingBooking(false);
        }}
        onSwitchToRegister={handleSwitchToRegister}
        skipRedirect={true}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => {
          setShowRegisterModal(false);
          setPendingBooking(false);
        }}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default BookingModal; 