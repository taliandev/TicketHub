import { useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import { EventListSkeleton } from '@/components/ui/Skeleton'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { useEvents } from '@/hooks/useEvents'
import { getErrorMessage } from '@/lib/errorHandler'

export default function Events() {
  const { data: events = [], isLoading, error, refetch } = useEvents()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // Get unique categories with counts
  const categories = useMemo(() => {
    const catCounts = events.reduce((acc, event) => {
      const cat = event.category || 'Khác'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(catCounts).map(([name, count]) => ({ name, count }))
  }, [events])

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => (event.category || 'Khác') === selectedCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'views':
          return (b.views || 0) - (a.views || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [events, searchQuery, selectedCategory, sortBy])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 min-h-[500px]">
          <div className="container mx-auto px-4 py-12">
            <div className="h-10 w-64 bg-purple-500/20 rounded mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-purple-500/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <EventListSkeleton count={8} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />
        </div>
      </div>
    )
  }

  // Removed early return - always show hero header and filters even when no events

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Header with Neon Effect */}
      <div className="relative text-white overflow-hidden min-h-[500px] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop)'
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 via-black/80 to-black" />
        
        {/* Neon Grid Effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-pulse" />
          <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse delay-100" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-pink-500 to-transparent animate-pulse delay-200" />
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-300" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24 z-10">
          <div className="max-w-4xl">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-sm font-medium text-cyan-200">
                Nền tảng đặt vé sự kiện hàng đầu Việt Nam
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Khám phá sự kiện
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mt-2 drop-shadow-[0_0_50px_rgba(168,85,247,0.8)] animate-pulse">
                đặc sắc
              </span>
            </h1>
            
            <p className="text-cyan-100 text-xl md:text-2xl leading-relaxed max-w-2xl mb-8">
              Tìm kiếm và đặt vé cho hàng trăm sự kiện âm nhạc, hội thảo, workshop và nhiều hơn nữa
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-purple-500/30 group-hover:border-purple-400 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">{events.length}+</div>
                  <div className="text-cyan-200 text-sm">Sự kiện</div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">50K+</div>
                  <div className="text-cyan-200 text-sm">Người tham gia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 80L60 70C120 60 240 40 360 33.3C480 26.7 600 33.3 720 40C840 46.7 960 53.3 1080 53.3C1200 53.3 1320 46.7 1380 43.3L1440 40V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="rgba(168, 85, 247, 0.05)"/>
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="rgb(0, 0, 0)"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters với Dark Theme */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden sticky top-4">
              {/* Search */}
              <div className="p-6 bg-gradient-to-br from-purple-900/10 to-transparent border-b border-purple-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wider">
                    Tìm kiếm
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nhập tên sự kiện, địa điểm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-purple-500/20 bg-black/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-white placeholder-gray-500 transition-all"
                  />
                  <svg className="absolute left-4 top-3.5 w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Categories */}
              <div className="p-6 border-b border-purple-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-wider">
                    Danh mục
                  </h3>
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Tất cả
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      selectedCategory === 'all' ? 'bg-white/20' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {events.length}
                    </span>
                  </button>
                  {categories.map(({ name, count }) => (
                    <button
                      key={name}
                      onClick={() => setSelectedCategory(name)}
                      className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        selectedCategory === name
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <span>{name}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        selectedCategory === name ? 'bg-white/20' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 uppercase tracking-wider">
                    Sắp xếp
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    { value: 'date', label: 'Ngày diễn ra', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    { value: 'title', label: 'Tên sự kiện', icon: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' },
                    { value: 'views', label: 'Phổ biến nhất', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setSortBy(value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        sortBy === value
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory !== 'all') && (
                <div className="p-6 pt-0">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all border border-purple-500/20 hover:border-purple-500/40"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content với Dark Theme */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl p-5 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Kết quả</p>
                      <p className="text-lg font-bold text-white">
                        {filteredEvents.length} sự kiện
                        {filteredEvents.length !== events.length && (
                          <span className="text-sm text-gray-500 font-normal"> / {events.length}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {(searchQuery || selectedCategory !== 'all') && (
                    <div className="flex items-center gap-2 pl-4 border-l border-purple-500/20">
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          "{searchQuery}"
                          <button onClick={() => setSearchQuery('')} className="hover:text-purple-100 ml-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {selectedCategory !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {selectedCategory}
                          <button onClick={() => setSelectedCategory('all')} className="hover:text-cyan-100 ml-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Events Grid/List */}
            {events.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 via-black/50 to-pink-900/10 p-20 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />
                <div className="relative z-10 max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    Chưa có sự kiện nào
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Hiện tại chưa có sự kiện nào được tổ chức. Hãy quay lại sau hoặc tạo sự kiện của riêng bạn.
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tạo sự kiện đầu tiên
                  </a>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 via-black/50 to-pink-900/10 p-20 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />
                <div className="relative z-10 max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    Không tìm thấy sự kiện
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Không có sự kiện nào phù hợp với bộ lọc của bạn. Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Xóa bộ lọc và xem tất cả
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card
                    key={event._id}
                    id={event._id}
                    img={event.img}
                    date={event.date}
                    title={event.title}
                    description={event.description}
                    location={event.location}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
