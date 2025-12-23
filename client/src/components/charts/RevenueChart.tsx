import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';

interface RevenueChartProps {
  data: Array<{
    _id?: number;
    date?: string;
    revenue: number;
    count: number;
  }>;
  period?: 'week' | 'month' | 'year';
}

const RevenueChart = ({ data, period = 'month' }: RevenueChartProps) => {
  // Transform data for chart
  const chartData = data.map((item) => {
    const id = item._id || item.date || '';
    return {
      name: period === 'year' ? `T${id}` : `${id}`,
      revenue: item.revenue / 1000000, // Convert to millions
      tickets: item.count,
      fullName: period === 'year' ? `Tháng ${id}` : `Ngày ${id}`
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-700">
          <p className="text-sm font-semibold text-white mb-2">
            {payload[0].payload.fullName}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs text-gray-300">{entry.name}:</span>
                <span className="text-sm font-bold text-white">
                  {entry.name.includes('Doanh thu') ? `${entry.value.toFixed(2)}M` : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#9ca3af"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          stroke="#9ca3af"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          iconType="circle"
          iconSize={10}
        />
        <Line
          type="natural"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
          name="Doanh thu (M)"
        />
        <Line
          type="natural"
          dataKey="tickets"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
          name="Số vé"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
