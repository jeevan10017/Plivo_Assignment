import React, { useState } from 'react';
import { Service } from '../../types/service.ts';
import { useServiceStore } from '../../store/serviceStore.ts';
import { ServiceCard } from './ServiceCard.tsx';
import { ServiceForm } from './ServiceForm.tsx';
import { ServiceDetailsModal } from './ServiceDetailsModal.tsx';
import { Dialog } from '../ui/Dialog.tsx';
import { ServiceStatusUpdate } from './ServiceStatusUpdate.tsx';

interface ServiceListProps {
  services: Service[];
}

export const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'status' | null>(null);
  const { deleteService, updateServiceStatus } = useServiceStore();

  const groupedServices = services.reduce<Record<string, Service[]>>((acc, service) => {
    const groupValue = service.groupName || 'Ungrouped';
    if (!acc[groupValue]) acc[groupValue] = [];
    acc[groupValue].push(service);
    return acc;
  }, {});

  const sortedGroups = Object.keys(groupedServices).sort((a, b) => {
    if (a === 'Ungrouped') return 1;
    if (b === 'Ungrouped') return -1;
    return a.localeCompare(b);
  });

  const handleStatusUpdate = async (id: string, status: ServiceStatus) => {
    try {
      await updateServiceStatus(id, status);
      const updatedService = services.find(s => s.id === id);
      if (updatedService) setSelectedService(updatedService);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      await deleteService(id);
      setSelectedService(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Render service groups */}
      {sortedGroups.map((group) => (
        <div key={group} className="service-group">
          <h3 className="text-lg font-medium mb-4">{group}</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {groupedServices[group].map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => {
                  setSelectedService(service);
                  setActionType('edit');
                }}
                onDelete={() => handleDelete(service.id)}
                onClick={() => {
                  setSelectedService(service);
                  setActionType('view');
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Service modal */}
      {selectedService && (
        <Dialog
          isOpen={!!selectedService}
          onClose={() => {
            setSelectedService(null);
            setActionType(null);
            }}
            size={actionType === 'view' ? 'xl' : 'md'}
          >
            {actionType === 'edit' ? (
            <ServiceForm 
              service={selectedService}
              onClose={() => {
                setSelectedService(null);
                setActionType(null);
              }}
            />
          ) : actionType === 'status' ? (
            <ServiceStatusUpdate
              service={selectedService}
              onClose={() => {
                setSelectedService(null);
                setActionType(null);
              }}
              onUpdate={handleStatusUpdate}
            />
          ) : (
            <ServiceDetailsModal
              service={selectedService}
              onClose={() => {
                setSelectedService(null);
                setActionType(null);
              }}
              onEdit={() => setActionType('edit')}
              onStatusUpdate={() => setActionType('status')}
            />
          )}
        </Dialog>
      )}
    </div>
  );
};