import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { openCart } from '@/store/slices/cartSlice'
import LoginModal from '../auth/LoginModal'
import RegisterModal from '../auth/RegisterModal'
import axiosInstance from '@/lib/axios'

interface SearchResult {
  _id: string
  title: string
  img: string
  date: string
  location: string
  category: string
}

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleLogout = useCallback(async () => {
    try {
      logout()
      navigate('/')
    } catch (error) {
      console.error('Đăng xuất thất bại:', error)
    }
  }, [logout, navigate])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      setShowResults(true)
      
      try {
        const response = await axiosInstance.get('/search/suggestions', {
          params: { q: searchQuery, limit: 5 }
        })
        setSearchResults(response.data)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowResults(false)
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleResultClick = (eventId: string) => {
    setShowResults(false)
    setSearchQuery('')
    navigate(`/events/${eventId}`)
  }

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false)
    setIsRegisterModalOpen(true)
  }

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false)
    setIsLoginModalOpen(true)
  }

  return (
    <>
      <nav className="bg-black/95 border-b border-purple-500/20 sticky top-0 z-50 backdrop-blur-xl shadow-lg shadow-purple-900/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center group py-3">
              <img 
                src="/LOGO.svg" 
                alt="TicketHub Logo" 
                className="h-14 md:h-16 w-auto transition-transform duration-300 group-hover:scale-105 mix-blend-lighten"
                style={{ filter: 'brightness(1.1)' }}
              />
            </Link>

            <div className="hidden md:block flex-1 max-w-md mx-8" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowResults(true)}
                  className="w-full bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-full px-5 py-2 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-500 transition-colors duration-300 text-sm font-semibold"
                >
                  Tìm
                </button>

                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        <span className="ml-3 text-gray-400">Đang tìm kiếm...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((result) => (
                          <button
                            key={result._id}
                            onClick={() => handleResultClick(result._id)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-b-0"
                          >
                            <img
                              src={result.img}
                              alt={result.title}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold truncate mb-1">
                                {result.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                                  {result.category}
                                </span>
                                <span>•</span>
                                <span className="truncate">{result.location}</span>
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                        {searchQuery.trim() && (
                          <button
                            onClick={() => {
                              setShowResults(false)
                              navigate(`/events?search=${encodeURIComponent(searchQuery)}`)
                            }}
                            className="w-full p-4 text-center text-purple-400 hover:bg-gray-800 transition-colors font-semibold"
                          >
                            Xem tất cả kết quả cho "{searchQuery}"
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-400">Không tìm thấy kết quả</p>
                        <p className="text-gray-600 text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-300 hover:text-purple-400 font-medium transition-colors duration-300"
              >
                Trang chủ
              </Link>
              <Link
                to="/events"
                className="text-gray-300 hover:text-purple-400 font-medium transition-colors duration-300"
              >
                Sự kiện
              </Link>

              {user ? (
                <>
                  {/* Cart Icon - Simplified */}
                  <button
                    onClick={() => dispatch(openCart())}
                    className="relative text-gray-300 hover:text-purple-400 transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                  
                  {/* User Menu - Simplified */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  
                  {(user.role === 'admin' || user.role === 'organizer') && (
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors duration-300 font-semibold text-sm"
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-gray-300 hover:text-purple-400 font-medium transition-colors duration-300"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors duration-300 font-semibold"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-purple-500/20">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900/50 border border-purple-500/20 text-white placeholder-gray-500 rounded-full px-5 py-2 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </form>
              
              <div className="space-y-2">
                <Link
                  to="/"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Trang chủ
                </Link>
                <Link
                  to="/events"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sự kiện
                </Link>

                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Hồ sơ
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(openCart())
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg flex items-center justify-between"
                    >
                      <span>Giỏ hàng</span>
                      {cartItemCount > 0 && (
                        <span className="px-2 py-1 bg-purple-600 rounded-full text-xs font-bold">
                          {cartItemCount}
                        </span>
                      )}
                    </button>
                    {(user.role === 'admin' || user.role === 'organizer') && (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsLoginModalOpen(true)
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => {
                        setIsRegisterModalOpen(true)
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                    >
                      Đăng ký
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  )
}

export default React.memo(Navbar)