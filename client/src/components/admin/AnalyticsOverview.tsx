import { useAdminStats, useRecentActivities } from '@/hooks/useAdminDashboard';
import LoadingSpinner from '../ui/LoadingSpinner';

const AnalyticsOverview = () => {
  const { data: stats, isLoading } = useAdminStats();
  const { data: activities = [] } = useRecentActivities(50);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate analytics
  const userGrowth = stats?.newUsersThisMonth || 0;
  const activeEvents = stats?.activeEvents || 0;
  const totalEvents = stats?.totalEvents || 0;
  const eventActiveRate = totalEvents > 0 ? (activeEvents / totalEvents * 100) : 0;

  // Activity breakdown
  const activityTypes = activities.reduce((acc: any, activity: any) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {});

  const activityStats = [
    { type: 'user_registration', label: 'Đăng ký mới', count: activityTypes.user_registration || 0, color: 'blue' },
    { type: 'event_created', label: 'Sự kiện tạo', count: activityTypes.event_created || 0, color: 'green' },
    { type: 'ticket_purchased', label: 'Vé đã bán', count: activityTypes.ticket_purchased || 0, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-blue-600">+{userGrowth}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Người dùng mới</h3>
          <p className="text-xs text-gray-500 mt-1">Tháng này</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-green-600">{eventActiveRate}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Sự kiện đang hoạt động</h3>
          <p className="text-xs text-gray-500 mt-1">{activeEvents}/{totalEvents} sự kiện</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-purple-600">{activities.length}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Tổng hoạt động</h3>
          <p className="text-xs text-gray-500 mt-1">Gần đây</p>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân tích hoạt động</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activityStats.map((stat) => (
            <div key={stat.type} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                <span className="text-lg font-bold text-gray-900">{stat.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-${stat.color}-600`}
                  style={{ width: `${Math.min((stat.count / activities.length) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {activities.length > 0 ? ((stat.count / activities.length) * 100).toFixed(1) : 0}% của tổng
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất hệ thống</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Tỷ lệ chuyển đổi</p>
                  <p className="text-sm text-gray-600">Từ xem đến mua vé</p>
                </div>
              </div>
              <span className="text-xl font-bold text-green-600">
                {stats?.totalTickets && stats?.totalUsers 
                  ? ((stats.totalTickets / stats.totalUsers) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Doanh thu/Người dùng</p>
                  <p className="text-sm text-gray-600">Giá trị trung bình</p>
                </div>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {stats?.totalRevenue && stats?.totalUsers
                  ? (stats.totalRevenue / stats.totalUsers / 1000).toFixed(0)
                  : 0}K
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Vé/Sự kiện</p>
                  <p className="text-sm text-gray-600">Trung bình</p>
                </div>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {stats?.totalTickets && stats?.totalEvents
                  ? (stats.totalTickets / stats.totalEvents).toFixed(0)
                  : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Tổng người dùng</span>
              <span className="text-lg font-semibold text-gray-900">{stats?.totalUsers?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Tổng sự kiện</span>
              <span className="text-lg font-semibold text-gray-900">{stats?.totalEvents}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Sự kiện đang hoạt động</span>
              <span className="text-lg font-semibold text-gray-900">{stats?.activeEvents}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Tổng vé đã bán</span>
              <span className="text-lg font-semibold text-gray-900">{stats?.totalTickets?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Tổng doanh thu</span>
              <span className="text-lg font-semibold text-gray-900">
                {((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M VND
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Tăng trưởng tháng này</span>
              <span className={`text-lg font-semibold ${
                (stats?.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats?.monthlyGrowth >= 0 ? '+' : ''}{stats?.monthlyGrowth?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gợi ý cải thiện</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {userGrowth < 10 && (
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Tăng cường marketing để thu hút thêm người dùng mới</span>
                </li>
              )}
              {eventActiveRate < 50 && (
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Khuyến khích organizers tạo thêm sự kiện mới</span>
                </li>
              )}
              {(stats?.monthlyGrowth || 0) < 0 && (
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Doanh thu đang giảm, cần review chiến lược pricing và promotion</span>
                </li>
              )}
              {activityStats[2].count < activityStats[1].count * 0.5 && (
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Tỷ lệ chuyển đổi thấp, cần cải thiện UX và checkout flow</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
