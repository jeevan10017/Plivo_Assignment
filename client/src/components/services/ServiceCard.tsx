import React, { useState } from 'react';
import { Service, ServiceStatus } from '../../types/service.ts';
import { StatusBadge } from '../ui/StatusBadge.tsx';
import { EllipsisVertical, Pencil, Trash } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  onClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div 
      className="bg-purple-200 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200 cursor-pointer relative"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{service.name}</h3>
          
          <div className="relative">
            <button
              type="button"
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <EllipsisVertical size={18} />
            </button>
            
            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setIsMenuOpen(false);
                  }}
                >
                  <Pencil size={16} />
                  <span>Edit</span>
                </button>
                
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setIsMenuOpen(false);
                  }}
                >
                  <Trash size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <StatusBadge status={service.status} />
        </div>
        
        {service.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {service.description}
          </p>
        )}
        
        <div className="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
          Last updated {new Date(service.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};