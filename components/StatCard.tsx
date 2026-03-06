import React from 'react';
import { KPI } from '../types';

interface StatCardProps {
  kpi: KPI;
}

export const StatCard: React.FC<StatCardProps> = ({ kpi }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-gray-500">{kpi.label}</h3>
        <span className={`p-1.5 rounded-full text-xs ${kpi.trendDirection === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {kpi.trendDirection === 'up' ? '↗' : '↘'}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{kpi.value}</span>
        <span className={`text-sm font-bold mb-1.5 ${
          kpi.trendDirection === 'up' 
            ? 'text-green-600' 
            : 'text-red-600'
        }`}>
          {kpi.trend}%
        </span>
      </div>
    </div>
  );
};