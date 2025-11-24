import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout as logoutAction } from '@/store/slices/authSlice';

const Navbar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('VN');
  const phoneNumber = import.meta.env.VITE_CONTACT_PHONE || '0123456789';

  const handleLogout = useCallback(async () => {
    try {
      dispatch(logoutAction());
      navigate('/');
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
    }
  }, [dispatch, navigate]);

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLanguage = e.target.value;
      setLanguage(newLanguage);
      // Implement i18n logic here
    },
    []
  );

  const renderUserMenu = useCallback(
    (isMobile = false) => {
      const className = isMobile
        ? 'text-gray-600 hover:text-blue-500 block px-3 py-2 rounded-md text-base font-medium'
        : 'text-gray-600 hover:text-blue-500';
      const buttonClassName = isMobile
        ? 'w-full text-left bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors text-base font-medium'
        : 'bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors';

      if (user) {
        return (
          <>
            <Link to="/profile" className={className}>
              Hồ sơ
            </Link>
            <button onClick={handleLogout} className={buttonClassName}>
              Đăng xuất
            </button>
          </>
        );
      }
      return (
        <>
          <Link to="/login" className={className}>
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className={
              isMobile
                ? 'bg-blue-500 text-white block px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-base font-medium'
                : 'bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors'
            }
          >
            Đăng ký
          </Link>
        </>
      );
    },
    [user, handleLogout]
  );

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="ml-2 text-xl font-bold text-gray-800">TicketHub</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
           
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📞</span>
              <span>{phoneNumber}</span>
            </div>
            <label htmlFor="language-select" className="sr-only">
              Chọn ngôn ngữ
            </label>
            <select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="VN">VN</option>
              <option value="EN">EN</option>
            </select>
            {renderUserMenu()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Mở/đóng menu chính"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? 'block' : 'hidden'
        } md:hidden transition-all duration-300 ease-in-out transform ${
          isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          
          <div className="flex items-center text-gray-600 px-3 py-2">
            <span className="mr-2">📞</span>
            <span>{phoneNumber}</span>
          </div>
          <label htmlFor="mobile-language-select" className="sr-only">
            Chọn ngôn ngữ
          </label>
          <select
            id="mobile-language-select"
            value={language}
            onChange={handleLanguageChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="VN">Tiếng Việt</option>
            <option value="EN">Tiếng Anh</option>
          </select>
          {renderUserMenu(true)}
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);