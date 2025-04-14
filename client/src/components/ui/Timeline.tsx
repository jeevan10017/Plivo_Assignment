import React from 'react';
import { ServiceStatus } from '../../types/service.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface TimelineItem {
  status: ServiceStatus;
  timestamp: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-gray-500 text-sm">
          No status history available
        </div>
      ) : (
      items.map((item, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            {index < items.length - 1 && (
              <div className="w-px h-8 bg-gray-200"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <StatusBadge status={item.status} />
              <span className="text-sm text-gray-500">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
          </div>
        </div>
      ))
      )}
    </div>
    
  );
};