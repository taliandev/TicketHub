import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { Link, useNavigate } from 'react-router-dom';
import { setBooking } from '@/store/slices/bookingSlice';

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
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedType, setSelectedType] = useState<TicketType | null>(ticketTypes[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!open) return null;

  const total = selectedType ? selectedType.price * quantity : 0;

  const handleConfirm = () => {
    if (!agreed || !selectedType || quantity < 1) return;
    dispatch(setBooking({
      eventId,
      type: selectedType.type,
      price: selectedType.price,
      quantity,
      total,
    }));
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {!user ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-4">Vui lòng đăng nhập để đặt vé</h2>
            <Link
              to="/login"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            >
              Đăng nhập
            </Link>
          </div>
        ) : (
          <>
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
            <button
              className={`w-full py-2 rounded bg-blue-500 text-white font-semibold transition ${!agreed || !selectedType ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              disabled={!agreed || !selectedType}
              onClick={handleConfirm}
            >
              Xác nhận
            </button>
          </>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
      `}</style>
    </div>
  );
};

export default BookingModal; 