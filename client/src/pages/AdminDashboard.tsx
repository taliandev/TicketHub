import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  useAdminStats,
  useRecentActivities,
  useRevenueAnalytics,
} from '@/hooks/useAdminDashboard';
import {
  useOrganizerStats,
  useOrganizerRevenue,
} from '@/hooks/useOrganizerDashboard';
import AdminSidebar from '@/components/layouts/AdminSidebar';
import AdminHeader from '@/components/layouts/AdminHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RevenueChart from '@/components/charts/RevenueChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import UsersTable from '@/components/admin/UsersTable';
import EventsTable from '@/components/admin/EventsTable';
import RevenueAnalytics from '@/components/admin/RevenueAnalytics';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';
import SystemSettings from '@/components/admin/SystemSettings';
import OrganizerTicketsTable from '@/components/organizer/OrganizerTicketsTable';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  changeType?: 'positive' | 'negative';
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard = ({ title, value, icon, change, changeType, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <div className="text-white">{icon}</div>
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
              changeType === 'positive' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <svg 
                className={`w-4 h-4 ${changeType === 'positive' ? 'rotate-0' : 'rotate-180'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }: { activity: any }) => {
  const getActivityIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'user_registration':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'event_created':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'ticket_purchased':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration': return 'bg-blue-100 text-blue-600';
      case 'event_created': return 'bg-green-100 text-green-600';
      case 'ticket_purchased': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors rounded-lg">
      <div className={`p-2.5 rounded-lg ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 mb-1">{activity.description}</p>
        <p className="text-xs text-gray-500">
          {new Date(activity.timestamp).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

interface RevenueData {
  revenueByDate?: Array<{ date: string; revenue: number; count: number }>;
  revenueByCategory?: Array<{ category: string; revenue: number; count: number }>;
}

interface AdminStats {
  totalUsers?: number;
  totalEvents?: number;
  totalRevenue?: number;
  totalTickets?: number;
  activeEvents?: number;
  monthlyGrowth?: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Get user role from Redux
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';

  // Fetch data based on role
  const { data: adminStats, isLoading: adminStatsLoading, error: adminStatsError } = useAdminStats({ enabled: isAdmin });
  const { data: organizerStats, isLoading: organizerStatsLoading } = useOrganizerStats({ enabled: isOrganizer });
  const { data: activitiesData = [], isLoading: activitiesLoading } = useRecentActivities(10, { enabled: isAdmin });
  const { data: adminRevenueData, isLoading: adminRevenueLoading } = useRevenueAnalytics(revenuePeriod, { enabled: isAdmin });
  const { data: organizerRevenueData, isLoading: organizerRevenueLoading } = useOrganizerRevenue(revenuePeriod, { enabled: isOrganizer });

  // Use appropriate data based on role
  const stats = (isAdmin ? adminStats : organizerStats) as AdminStats | undefined;
  const statsLoading = isAdmin ? adminStatsLoading : organizerStatsLoading;
  const statsError = isAdmin ? adminStatsError : null;
  const revenueData = (isAdmin ? adminRevenueData : organizerRevenueData) as RevenueData | undefined;
  const revenueLoading = isAdmin ? adminRevenueLoading : organizerRevenueLoading;
  const activities = (activitiesData as Activity[]) || [];


 
  const displayStats = stats || {
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    totalTickets: 0,
    monthlyGrowth: 0
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // Show error if API fails
  if (statsError) {
    console.error('Stats error:', statsError);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user?.role} />

      {/* Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="ml-64 mt-16 p-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Page Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
              <p className="text-gray-600 mt-1">
                {isAdmin ? 'Xem tổng quan về hệ thống' : 'Xem tổng quan về sự kiện của bạn'}
              </p>
            </div>

            {/* Error Alert */}
            {statsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm">
                    Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isAdmin && (
                <StatCard
                  title="Tổng người dùng"
                  value={displayStats?.totalUsers?.toLocaleString() || '0'}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                  color="blue"
                />
              )}
              <StatCard
                title={isOrganizer ? "Sự kiện của tôi" : "Tổng sự kiện"}
                value={displayStats?.totalEvents?.toString() || '0'}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                color="green"
              />
              {isOrganizer && (
                <StatCard
                  title="Sự kiện đang hoạt động"
                  value={displayStats?.activeEvents?.toString() || '0'}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                  color="blue"
                />
              )}
              <StatCard
                title="Doanh thu"
                value={`${((displayStats?.totalRevenue || 0) / 1000000).toFixed(1)}M`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }

                color="purple"
              />
              <StatCard
                title="Vé đã bán"
                value={displayStats?.totalTickets?.toLocaleString() || '0'}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                }
                color="orange"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Xu hướng doanh thu</h2>
                  <select
                    value={revenuePeriod}
                    onChange={(e) => setRevenuePeriod(e.target.value as any)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="week">7 ngày</option>
                    <option value="month">30 ngày</option>
                    <option value="year">12 tháng</option>
                  </select>
                </div>
                {revenueLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : revenueData?.revenueByDate && revenueData.revenueByDate.length > 0 ? (
                  <div className="h-[300px]">
                    <RevenueChart data={revenueData.revenueByDate} period={revenuePeriod} />
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm font-medium">Chưa có dữ liệu doanh thu</p>
                  </div>
                )}
              </div>

              {/* Category Distribution */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố danh mục</h2>
                {revenueLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : revenueData?.revenueByCategory && revenueData.revenueByCategory.length > 0 ? (
                  <div className="h-[300px]">
                    <CategoryPieChart data={revenueData.revenueByCategory} />
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p className="text-sm font-medium">Chưa có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charts Row 2 - Summary Stats */}
            {revenueData && (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan hiệu suất</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Doanh thu kỳ này</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {((revenueData?.revenueByDate?.reduce((sum: number, item) => sum + item.revenue, 0) || 0) / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Vé đã bán</span>
                      <span className="text-2xl font-bold text-green-600">
                        {(revenueData?.revenueByDate?.reduce((sum: number, item) => sum + item.count, 0) || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Giá TB/vé</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {(() => {
                          const totalRevenue = revenueData?.revenueByDate?.reduce((sum: number, item) => sum + item.revenue, 0) || 0;
                          const totalTickets = revenueData?.revenueByDate?.reduce((sum: number, item) => sum + item.count, 0) || 0;
                          return totalTickets > 0 ? ((totalRevenue / totalTickets) / 1000).toFixed(0) : 0;
                        })()}K
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Danh mục</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {revenueData?.revenueByCategory?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activities - Only for Admin */}
            {isAdmin && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
                      <p className="text-sm text-gray-600 mt-1">Theo dõi các hoạt động mới nhất</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </div>
                </div>
                {activitiesLoading ? (
                  <div className="p-8 flex justify-center">
                    <LoadingSpinner />
                  </div>
                ) : activities.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {activities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500">Chưa có hoạt động nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === 'users' && isAdmin && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
              <p className="text-gray-600 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <UsersTable />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quản lý sự kiện</h2>
              <p className="text-gray-600 mt-1">
                {isAdmin ? 'Quản lý tất cả sự kiện trong hệ thống' : 'Quản lý sự kiện của bạn'}
              </p>
            </div>
            <EventsTable userRole={user?.role} />
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Báo cáo doanh thu</h2>
              <p className="text-gray-600 mt-1">Phân tích doanh thu chi tiết theo thời gian và danh mục</p>
            </div>
            <RevenueAnalytics />
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quản lý vé</h2>
              <p className="text-gray-600 mt-1">
                {isAdmin ? 'Quản lý tất cả vé trong hệ thống' : 'Quản lý vé đã bán của sự kiện bạn tạo'}
              </p>
            </div>
            <OrganizerTicketsTable />
          </div>
        )}

        {activeTab === 'analytics' && isAdmin && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phân tích dữ liệu</h2>
              <p className="text-gray-600 mt-1">Insights và metrics về hiệu suất hệ thống</p>
            </div>
            <AnalyticsOverview />
          </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h2>
              <p className="text-gray-600 mt-1">Quản lý cấu hình và tùy chọn hệ thống</p>
            </div>
            <SystemSettings />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
