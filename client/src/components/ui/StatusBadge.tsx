
import React from 'react';
import { ServiceStatus } from '../../types/service.ts';

interface StatusBadgeProps {
  status: ServiceStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Operational'
        };
      case ServiceStatus.DEGRADED:
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Degraded'
        };
      case ServiceStatus.PARTIAL_OUTAGE:
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          label: 'Partial Outage'
        };
      case ServiceStatus.MAJOR_OUTAGE:
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Major Outage'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: 'Unknown'
        };
    }
  };

  const { bgColor, textColor, label } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};