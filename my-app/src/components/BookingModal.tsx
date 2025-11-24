import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  event: {
    _id: string;
    title: string;
    ticketTypes: {
      type: string;
      price: number;
    }[];
  };
}

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, event }) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedType, setSelectedType] = useState(event.ticketTypes[0]?.type || '');
  const [quantity, setQuantity] = useState(1);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const selectedTicket = event.ticketTypes.find(t => t.type === selectedType);
  const total = selectedTicket ? selectedTicket.price * quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để đặt vé');
      return;
    }
    if (!agreeToTerms) {
      setError('Vui lòng đồng ý với điều khoản và điều kiện');
      return;
    }

    // Chuyển hướng đến trang Checkout với thông tin đặt vé
    navigate('/checkout', {
      state: {
        bookingData: {
          eventId: event._id,
          type: selectedType,
          price: selectedTicket?.price || 0,
          quantity: quantity
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">Đặt vé</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại vé
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {event.ticketTypes.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.type} - {type.price.toLocaleString()} đ
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border rounded-l-md hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-1 border-t border-b text-center focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border rounded-r-md hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-lg font-semibold">
              Tổng cộng: <span className="text-blue-600">{total.toLocaleString()} đ</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">
                Tôi đồng ý với điều khoản và điều kiện đặt vé
              </span>
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Tiếp tục
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 