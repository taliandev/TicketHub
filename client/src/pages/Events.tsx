import { useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import { EventListSkeleton } from '@/components/ui/Skeleton'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { useEvents } from '@/hooks/useEvents'
import { getErrorMessage } from '@/lib/errorHandler'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
  const [page, setPage] = useState(1)
  const [allEvents, setAllEvents] = useState<any[]>([])
  
  const { data: eventsData, isLoading, error, refetch } = useEvents(page, 16)

  const debouncedPriceRange = useDebounce(priceRange, 300)
  
  // Check if filtering is in progress
  const isFiltering = priceRange[0] !== debouncedPriceRange[0] || priceRange[1] !== debouncedPriceRange[1]

  // Accumulate events when new page loads
  useMemo(() => {
    if (eventsData?.events) {
      if (page === 1) {
        setAllEvents(eventsData.events)
      } else {
        setAllEvents(prev => {
          const existingIds = new Set(prev.map(e => e._id))
          const newEvents = eventsData.events.filter(e => !existingIds.has(e._id))
          return [...prev, ...newEvents]
        })
      }
    }
  }, [eventsData, page])

  // Reset page when filters change (but NOT for price - it's client-side only)
  useMemo(() => {
    setPage(1)
    setAllEvents([])
  }, [searchQuery, selectedCategory])

  const events = allEvents
  // Get unique categories with counts
  const categories = useMemo((): Array<{ name: string; count: number }> => {
    const catCounts = events.reduce((acc, event) => {
      const cat = event.category || 'Khác'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(catCounts).map(([name, count]) => ({ 
      name, 
      count: count as number 
    }))
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

    // Price filter
    const [min, max] = debouncedPriceRange
    
    if (min > 0 || max < 10000000) {
      console.log('🔍 Price Filter Applied:', { min, max });
      console.log('📊 Events before filter:', filtered.length);
      
      filtered = filtered.filter(event => {
        if (!event.ticketTypes || event.ticketTypes.length === 0) {
          console.log('❌ No ticket types:', event.title);
          return false;
        }
        
        const hasMatchingTicket = event.ticketTypes.some((ticket: any) => {
          const price = ticket.price || 0;
          const available = ticket.available || 0;
          const matches = price >= min && price <= max && available > 0;
          
          if (matches) {
            console.log(`✅ Match found: ${event.title} - ${ticket.name}: ${price}đ (${available} available)`);
          }
          
          return matches;
        });
        
        if (!hasMatchingTicket) {
          console.log(`❌ No match: ${event.title}`, event.ticketTypes.map((t: any) => ({ 
            name: t.name, 
            price: t.price, 
            available: t.available 
          })));
        }
        
        return hasMatchingTicket;
      });
      
      console.log('📊 Events after filter:', filtered.length);
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
        case 'price-asc': {
          const minPriceA = a.ticketTypes?.length ? Math.min(...a.ticketTypes.map((t: any) => t.price || 0)) : 0
          const minPriceB = b.ticketTypes?.length ? Math.min(...b.ticketTypes.map((t: any) => t.price || 0)) : 0
          return minPriceA - minPriceB
        }
        case 'price-desc': {
          const maxPriceA = a.ticketTypes?.length ? Math.max(...a.ticketTypes.map((t: any) => t.price || 0)) : 0
          const maxPriceB = b.ticketTypes?.length ? Math.max(...b.ticketTypes.map((t: any) => t.price || 0)) : 0
          return maxPriceB - maxPriceA
        }
        default:
          return 0
      }
    })

    return filtered
  }, [events, searchQuery, selectedCategory, sortBy, debouncedPriceRange])

  // Load more handler
  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const hasMore = eventsData?.pagination?.hasMore || false

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
      {/* Hero Header with Neon Effect - Compact Version */}
      <div className="relative text-white overflow-hidden min-h-[300px] flex items-center">
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
        </div>
        
        <div className="relative container mx-auto px-4 py-10 md:py-12 z-10">
          <div className="max-w-4xl">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-medium text-cyan-200">
                Nền tảng đặt vé sự kiện hàng đầu Việt Nam
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Khám phá sự kiện
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mt-1 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                đặc sắc
              </span>
            </h1>
            
            <p className="text-cyan-100 text-base md:text-lg leading-relaxed max-w-2xl mb-6">
              Tìm kiếm và đặt vé cho hàng trăm sự kiện âm nhạc, hội thảo, workshop và nhiều hơn nữa
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-purple-500/30 group-hover:border-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">{events.length}+</div>
                  <div className="text-cyan-200 text-xs">Sự kiện</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">50K+</div>
                  <div className="text-cyan-200 text-xs">Người tham gia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 60L60 53.3C120 46.7 240 33.3 360 26.7C480 20 600 20 720 26.7C840 33.3 960 46.7 1080 50C1200 53.3 1320 46.7 1380 43.3L1440 40V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="rgba(168, 85, 247, 0.05)"/>
            <path d="M0 60L60 56.7C120 53.3 240 46.7 360 43.3C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="rgb(0, 0, 0)"/>
          </svg>
        </div>
      </div>

      {/* Container for Filters and Events */}
      <div className="container mx-auto px-4 py-12">
        {/* Horizontal Filter Bar */}
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Search */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  placeholder="Nhập tên sự kiện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-purple-500/20 bg-black/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-white placeholder-gray-500 transition-all"
                />
                <svg className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-wider">
                  Danh mục
                </h3>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-purple-500/20 bg-black/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-white transition-all appearance-none cursor-pointer"
              >
                <option value="all">Tất cả ({events.length})</option>
                {categories.map(({ name, count }) => (
                  <option key={name} value={name}>
                    {name} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 uppercase tracking-wider">
                  Sắp xếp
                </h3>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-purple-500/20 bg-black/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm text-white transition-all appearance-none cursor-pointer"
              >
                <option value="date">Ngày diễn ra</option>
                <option value="title">Tên sự kiện</option>
                <option value="views">Phổ biến nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 uppercase tracking-wider">
                    Giá vé
                  </h3>
                  <span className="text-xs text-gray-400">
                    {priceRange[0].toLocaleString()}đ - {priceRange[1] >= 10000000 ? '∞' : `${priceRange[1].toLocaleString()}đ`}
                  </span>
                </div>
              </div>
              {/* Dual Range Slider */}
              <div className="relative pt-1 pb-2">
                {/* Track */}
                <div className="absolute h-1.5 w-full bg-gray-800 rounded-full top-1"></div>
                
                {/* Active Track */}
                <div 
                  className="absolute h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full top-1"
                  style={{
                    left: `${(priceRange[0] / 10000000) * 100}%`,
                    right: `${100 - (priceRange[1] / 10000000) * 100}%`
                  }}
                ></div>

                {/* Min Slider */}
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value)
                    if (newMin <= priceRange[1]) {
                      setPriceRange([newMin, priceRange[1]])
                    }
                  }}
                  className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none top-1
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-gradient-to-br
                    [&::-webkit-slider-thumb]:from-green-400
                    [&::-webkit-slider-thumb]:to-emerald-500
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:pointer-events-auto
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:shadow-green-500/50
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-white
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-gradient-to-br
                    [&::-moz-range-thumb]:from-green-400
                    [&::-moz-range-thumb]:to-emerald-500
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:pointer-events-auto
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-white"
                />

                {/* Max Slider */}
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value)
                    if (newMax >= priceRange[0]) {
                      setPriceRange([priceRange[0], newMax])
                    }
                  }}
                  className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none top-1
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-gradient-to-br
                    [&::-webkit-slider-thumb]:from-emerald-400
                    [&::-webkit-slider-thumb]:to-green-500
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:pointer-events-auto
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:shadow-emerald-500/50
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-white
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-gradient-to-br
                    [&::-moz-range-thumb]:from-emerald-400
                    [&::-moz-range-thumb]:to-green-500
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:pointer-events-auto
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-white"
                />
              </div>
            </div>
          </div>

          {/* Quick Presets & Clear Filters */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-purple-500/10">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-2">Nhanh:</span>
              {[
                { label: 'Miễn phí', range: [0, 0] },
                { label: '< 500K', range: [0, 500000] },
                { label: '500K - 1M', range: [500000, 1000000] },
                { label: '> 1M', range: [1000000, 10000000] }
              ].map(({ label, range }) => (
                <button
                  key={label}
                  onClick={() => setPriceRange(range as [number, number])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    priceRange[0] === range[0] && priceRange[1] === range[1]
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-green-500/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 10000000) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setPriceRange([0, 10000000])
                  setPage(1)
                  setAllEvents([])
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-all border border-purple-500/20 hover:border-purple-500/40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

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
              
              {(searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 10000000) && (
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
                  {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 rounded-lg text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {priceRange[0].toLocaleString()}đ - {priceRange[1] >= 10000000 ? '∞' : `${priceRange[1].toLocaleString()}đ`}
                      <button onClick={() => setPriceRange([0, 10000000])} className="hover:text-green-100 ml-1">
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
        <div className="min-h-[600px]">
          {isFiltering ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">Đang lọc...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
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
                      setPriceRange([0, 10000000])
                      setPage(1)
                      setAllEvents([])
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">{filteredEvents.map((event) => (
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

                {/* Minimal Load More with "..." */}
                {hasMore && (
                  <div className="mt-12 flex flex-col items-center gap-3">
                    <div className="text-sm text-gray-500">
                      Hiển thị {filteredEvents.length} / {eventsData?.pagination?.totalEvents || 0} sự kiện
                    </div>
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="group flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="text-2xl tracking-widest group-hover:tracking-wider transition-all">
                        {isLoading ? '⋯' : '···'}
                      </span>
                      <span className="text-sm font-medium">
                        {isLoading ? 'Đang tải...' : 'Xem thêm'}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  )
}
