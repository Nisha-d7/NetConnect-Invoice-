'use client';

import React from 'react';

interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  title: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="h-6 rounded-full flex items-center justify-end pr-2"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                  minWidth: item.value > 0 ? '30px' : '0px'
                }}
              >
                {item.value > 0 && (
                  <span className="text-white text-xs font-medium">
                    {item.value}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SimplePieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  title: string;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Handle edge case where total is 0
  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          No data available
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center space-x-6">
        {/* Simple donut representation */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
            {data.map((item, index) => {
              const radius = 25;
              const circumference = 2 * Math.PI * radius;
              
              // Calculate percentage and stroke length
              const percentage = total > 0 ? (item.value / total) : 0;
              const strokeLength = circumference * percentage;
              const gap = circumference - strokeLength;
              
              // Calculate cumulative offset for positioning
              const cumulativeOffset = data.slice(0, index).reduce((acc, prev) => {
                const prevPercentage = total > 0 ? (prev.value / total) : 0;
                return acc + (circumference * prevPercentage);
              }, 0);
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="10"
                  strokeDasharray={`${strokeLength} ${gap}`}
                  strokeDashoffset={-cumulativeOffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
