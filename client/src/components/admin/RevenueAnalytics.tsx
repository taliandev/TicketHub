import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRevenueAnalytics, useAdminStats } from '@/hooks/useAdminDashboard';
import { useOrganizerRevenue, useOrganizerStats } from '@/hooks/useOrganizerDashboard';
import LoadingSpinner from '../ui/LoadingSpinner';
import RevenueChart from '../charts/RevenueChart';
import CategoryPieChart from '../charts/CategoryPieChart';

const RevenueAnalytics = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Fetch data based on role
  const { data: adminRevenueData, isLoading: adminLoading } = useRevenueAnalytics(period, { enabled: isAdmin });
  const { data: adminStats } = useAdminStats({ enabled: isAdmin });
  const { data: organizerRevenueData, isLoading: organizerLoading } = useOrganizerRevenue(period, { enabled: isOrganizer });
  const { data: organizerStats } = useOrganizerStats({ enabled: isOrganizer });

  // Use appropriate data based on role
  const revenueData = isAdmin ? adminRevenueData : organizerRevenueData;
  const stats = isAdmin ? adminStats : organizerStats;
  const isLoading = isAdmin ? adminLoading : organizerLoading;

  // Calculate summary stats
  const totalRevenue = stats?.totalRevenue || 0;
  const totalTickets = stats?.totalTickets || 0;
  const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;
  const monthlyGrowth = stats?.monthlyGrowth || 0;

  // Calculate period revenue
  const periodRevenue = revenueData?.revenueByDate?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;
  const periodTickets = revenueData?.revenueByDate?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;

  // Top events by revenue
  const topEvents = revenueData?.revenueByEvent?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {(totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500">VND</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Tổng vé bán</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {totalTickets.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">vé</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Ticket Price */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Giá vé trung bình</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {(avgTicketPrice / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500">VND/vé</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Tăng trưởng</p>
              <div className="flex items-baseline gap-2 mb-1">
                <p className={`text-3xl font-bold ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                </p>
              </div>
              <p className="text-xs text-gray-500">so với tháng trước</p>
            </div>
            <div className={`p-3 rounded-lg ${monthlyGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <svg className={`w-6 h-6 ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={monthlyGrowth >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Doanh thu theo thời gian</h3>
              <p className="text-sm text-gray-600 mt-1">
                {period === 'week' && 'Doanh thu 7 ngày qua'}
                {period === 'month' && 'Doanh thu 30 ngày qua'}
                {period === 'year' && 'Doanh thu 12 tháng qua'}
              </p>
            </div>
            <div className="flex space-x-2">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === p
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p === 'week' && '7 ngày'}
                  {p === 'month' && '30 ngày'}
                  {p === 'year' && '12 tháng'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Period Stats */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Doanh thu kỳ này</p>
              <p className="text-xl font-bold text-gray-900">{(periodRevenue / 1000000).toFixed(2)}M</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Vé bán được</p>
              <p className="text-xl font-bold text-gray-900">{periodTickets.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Giá TB/vé</p>
              <p className="text-xl font-bold text-gray-900">{periodTickets > 0 ? ((periodRevenue / periodTickets) / 1000).toFixed(0) : 0}K</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Số ngày</p>
              <p className="text-xl font-bold text-gray-900">
                {period === 'week' ? '7' : period === 'month' ? '30' : '365'}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : revenueData?.revenueByDate?.length > 0 ? (
            <div className="h-96">
              <RevenueChart data={revenueData.revenueByDate} period={period} />
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">Chưa có dữ liệu doanh thu</p>
              <p className="text-sm mt-1">Dữ liệu sẽ xuất hiện khi có vé được bán</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900">Doanh thu theo danh mục</h3>
            <p className="text-sm text-gray-600 mt-1">Phân bố doanh thu theo loại sự kiện</p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : revenueData?.revenueByCategory?.length > 0 ? (
              <div className="h-80">
                <CategoryPieChart data={revenueData.revenueByCategory} />
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-sm">Chưa có dữ liệu danh mục</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900">Top sự kiện doanh thu</h3>
            <p className="text-sm text-gray-600 mt-1">5 sự kiện có doanh thu cao nhất</p>
          </div>
          <div className="p-6">
            {topEvents.length > 0 ? (
              <div className="space-y-3">
                {topEvents.map((event: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        'bg-gradient-to-br from-blue-400 to-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{event._id}</p>
                        <p className="text-sm text-gray-600">{event.count} vé</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900">{(event.revenue / 1000000).toFixed(2)}M</p>
                      <p className="text-xs text-gray-600">VND</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p className="text-sm">Chưa có dữ liệu sự kiện</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
