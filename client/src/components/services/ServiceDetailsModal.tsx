import React from 'react';
import { Service, ServiceStatus } from '../../types/service.ts';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { Timeline } from '../ui/Timeline.tsx';

interface ServiceDetailsModalProps {
  service: Service;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ 
    service, 
    onClose,
    onEdit,
    onStatusUpdate
}) => {
  const statusHistory = [
    {
      status: ServiceStatus.OPERATIONAL,
      timestamp: '2024-02-20T10:00:00Z',
      description: 'Service restored'
    },
    {
      status: ServiceStatus.DEGRADED,
      timestamp: '2024-02-20T09:30:00Z',
      description: 'Performance issues detected'
    }
  ];

  return (
    <div className="space-y-6">
         <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">Service Details</h3>
      
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="mt-1">{service.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <StatusBadge status={service.status} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Group</label>
          <p className="mt-1">{service.groupName || 'Ungrouped'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Last Updated</label>
          <p className="mt-1">
            {new Date(service.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {service.description && (
        <div>
          <label className="text-sm font-medium text-gray-500">Description</label>
          <p className="mt-1 text-gray-600">{service.description}</p>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Status History</h4>
          <button
          onClick={onEdit}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
        update Service
        </button>
        </div>
        <Timeline items={statusHistory} />
        <div className="text-sm text-gray-300 "><p>for demo only, tried but yet to fix</p></div>
        
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Close
        </button>
      </div>

    </div>
  );
};