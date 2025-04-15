import React, { useEffect, useState } from 'react';
import { useMaintenanceStore } from '../store/maintenanceStore.ts';
import { useServiceStore } from '../store/serviceStore.ts';
import { MaintenanceList } from '../components/maintenance/MaintenanceList.tsx';
import { MaintenanceForm } from '../components/maintenance/MaintenanceForm.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Dialog } from '../components/ui/Dialog.tsx';
import { Maintenance } from '../types/maintenance.ts';
import { Calendar, AlertCircle } from 'lucide-react';

export default function MaintenancePage() {
  const { 
    maintenances, 
    isLoading, 
    error,
    fetchMaintenances, 
    addMaintenance, 
    updateMaintenance, 
    deleteMaintenance 
  } = useMaintenanceStore();
  
  const { services, fetchServices } = useServiceStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  
  useEffect(() => {
    fetchMaintenances();
    fetchServices();
  }, [fetchMaintenances, fetchServices]);

  const handleEdit = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (formData: any) => {
    await addMaintenance(formData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (selectedMaintenance) {
      await updateMaintenance(selectedMaintenance.id, formData);
      setIsUpdateModalOpen(false);
      setSelectedMaintenance(null);
    }
  };

  const confirmDelete = async () => {
    if (selectedMaintenance) {
      await deleteMaintenance(selectedMaintenance.id);
      setIsDeleteModalOpen(false);
      setSelectedMaintenance(null);
    }
  };

  // Make sure maintenances is always an array
  const maintenancesArray = Array.isArray(maintenances) ? maintenances : [];

  return (
    <div className="container mx-auto px-4 sm:px-4 py-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Maintenance" 
          description="Schedule and manage maintenance periods" 
        />
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>
      
      {error && (
        <div className="my-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <MaintenanceList 
          maintenances={maintenancesArray} 
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      {/* Create Maintenance Dialog */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Maintenance"
      >
        <MaintenanceForm 
          services={services || []}
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Dialog>
      
      {/* Update Maintenance Dialog */}
      <Dialog
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Maintenance"
      >
        {selectedMaintenance && (
          <MaintenanceForm 
            maintenance={selectedMaintenance}
            services={services || []}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setIsUpdateModalOpen(false)}
            isLoading={isLoading}
          />
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Maintenance"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Are you sure you want to delete this maintenance record?</p>
              <p className="mt-1 text-red-600 font-medium">{selectedMaintenance?.title}</p>
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