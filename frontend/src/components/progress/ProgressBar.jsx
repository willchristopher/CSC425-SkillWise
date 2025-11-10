import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import PropTypes from 'prop-types';

const ProgressBar = ({ 
  data, 
  type = 'horizontal', 
  height = 200, 
  showLabels = true,
  showTooltip = true,
  showLegend = false,
  colors = ['#3182ce', '#38a169', '#e53e3e', '#a0aec0'],
  animate = true
}) => {
  // Format data for Recharts
  const formatData = (rawData) => {
    if (Array.isArray(rawData)) {
      return rawData;
    }
    
    // Single progress value
    if (typeof rawData === 'number') {
      return [
        { name: 'Progress', completed: rawData, remaining: 100 - rawData }
      ];
    }
    
    // Object with progress details
    if (typeof rawData === 'object' && rawData !== null) {
      const { completed = 0, total = 100, label = 'Progress' } = rawData;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return [
        {
          name: label,
          completed: percentage,
          remaining: 100 - percentage,
          completedCount: completed,
          totalCount: total
        }
      ];
    }
    
    return [];
  };

  const formattedData = formatData(data);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    return (
      <div className="progress-tooltip">
        <p className="tooltip-label">{label}</p>
        <div className="tooltip-content">
          {data.completedCount !== undefined ? (
            <>
              <p className="tooltip-item completed">
                <span className="tooltip-dot completed"></span>
                Completed: {data.completedCount}/{data.totalCount} ({data.completed}%)
              </p>
              <p className="tooltip-item remaining">
                <span className="tooltip-dot remaining"></span>
                Remaining: {data.totalCount - data.completedCount} ({data.remaining}%)
              </p>
            </>
          ) : (
            <>
              <p className="tooltip-item completed">
                <span className="tooltip-dot completed"></span>
                Progress: {data.completed}%
              </p>
              <p className="tooltip-item remaining">
                <span className="tooltip-dot remaining"></span>
                Remaining: {data.remaining}%
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  const getBarColor = (entry, index) => {
    return colors[index % colors.length];
  };

  if (!formattedData || formattedData.length === 0) {
    return (
      <div className="progress-empty">
        <p>No progress data available</p>
      </div>
    );
  }

  const isHorizontal = type === 'horizontal';

  return (
    <div className="progress-bar-container">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={formattedData}
          layout={isHorizontal ? 'horizontal' : 'vertical'}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          {isHorizontal ? (
            <>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="name" width={100} />
            </>
          ) : (
            <>
              <XAxis type="category" dataKey="name" />
              <YAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            </>
          )}
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend />}
          
          <Bar
            dataKey="completed"
            stackId="progress"
            fill={colors[0]}
            name="Completed"
            radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            animationDuration={animate ? 1000 : 0}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry, 0)} />
            ))}
          </Bar>
          
          <Bar
            dataKey="remaining"
            stackId="progress"
            fill={colors[3]}
            name="Remaining"
            radius={isHorizontal ? [0, 4, 4, 0] : [0, 0, 4, 4]}
            animationDuration={animate ? 1000 : 0}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {showLabels && formattedData.length > 0 && (
        <div className="progress-labels">
          {formattedData.map((item, index) => (
            <div key={index} className="progress-label">
              <span className="progress-percentage">{item.completed}%</span>
              {item.completedCount !== undefined && (
                <span className="progress-count">
                  {item.completedCount}/{item.totalCount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ProgressBar.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array
  ]).isRequired,
  type: PropTypes.oneOf(['horizontal', 'vertical']),
  height: PropTypes.number,
  showLabels: PropTypes.bool,
  showTooltip: PropTypes.bool,
  showLegend: PropTypes.bool,
  colors: PropTypes.arrayOf(PropTypes.string),
  animate: PropTypes.bool
};

export default ProgressBar;