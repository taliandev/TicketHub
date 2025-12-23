import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryPieChartProps {
  data: Array<{
    _id: string;
    revenue: number;
    count: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#ef4444'];

const CategoryPieChart = ({ data }: CategoryPieChartProps) => {
  // Transform data for chart
  const chartData = data.map((item, index) => ({
    name: item._id,
    value: item.revenue,
    count: item.count,
    color: COLORS[index % COLORS.length]
  }));

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
          <p className="text-sm font-bold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-gray-600">Doanh thu:</span>
              <span className="text-sm font-bold" style={{ color: data.color }}>
                {(data.value / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-gray-600">Số vé:</span>
              <span className="text-sm font-bold text-gray-900">{data.count}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-gray-600">Tỷ lệ:</span>
              <span className="text-sm font-bold text-gray-900">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label with better styling
  const renderLabel = (entry: any) => {
    const percentage = ((entry.value / total) * 100);
    if (percentage < 5) return ''; // Hide small percentages
    return `${percentage.toFixed(0)}%`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="65%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius="85%"
            innerRadius="55%"
            fill="#8884d8"
            dataKey="value"
            paddingAngle={3}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Custom Legend */}
      <div className="mt-4 space-y-2 px-2">
        {chartData.map((entry, index) => {
          const percentage = ((entry.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-xs font-medium text-gray-700 truncate">{entry.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPieChart;
