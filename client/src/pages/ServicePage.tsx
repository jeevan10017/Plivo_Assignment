import React, { useEffect, useState } from 'react';
import { useServiceStore } from '../store/serviceStore.ts';
import { ServiceList } from '../components/services/ServiceList.tsx';
import { ServiceForm } from '../components/services/ServiceForm.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Dialog } from '../components/ui/Dialog.tsx';
import { Service } from '../types/service.ts';
import { Server, AlertCircle, Plus } from 'lucide-react';

export default function ServicesPage() {
  const { services, isLoading, error, fetchServices, addService, updateService, deleteService } = useServiceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (service: Service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (formData: any) => {
    await addService(formData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (selectedService) {
      await updateService(selectedService.id, formData);
      setIsUpdateModalOpen(false);
      setSelectedService(null);
    }
  };

  const confirmDelete = async () => {
    if (selectedService) {
      await deleteService(selectedService.id);
      setIsDeleteModalOpen(false);
      setSelectedService(null);
    }
  };

  // Make sure services is always an array
  const servicesArray = Array.isArray(services) ? services : [];

  return (
    <div className="container mx-auto  sm:px-4 max-w-full px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Services" 
          description="Manage and monitor the status of your services" 
        />
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>
      
      {error && (
        <div className="my-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className=" bg-white rounded-lg p-4 border border-gray-200">
        <ServiceList 
          services={servicesArray} 
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      {/* Create Service Dialog */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Service"
      >
        <ServiceForm 
          onSubmit={handleCreateSubmit}
          onClose={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Dialog>
      
      {/* Update Service Dialog */}
      <Dialog
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Service"
      >
        {selectedService && (
          <ServiceForm 
            service={selectedService}
            onSubmit={handleUpdateSubmit}
            onClose={() => setIsCreateModalOpen(false)}
            isLoading={isLoading}
          />
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Service"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Are you sure you want to delete this service?</p>
              <p className="mt-1 text-red-600 font-medium">{selectedService?.name}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}