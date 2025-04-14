import React, { useEffect, useState } from 'react';
import { useIncidentStore } from '../store/incidentStore.ts';
import { useServiceStore } from '../store/serviceStore.ts';
import { IncidentList } from '../components/incidents/InncidentList.tsx';
import { IncidentForm } from '../components/incidents/IncidentForm.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Dialog } from '../components/ui/Dialog.tsx';
import { Incident } from '../types/incident.ts';
import { AlertCircle } from 'lucide-react';

export default function IncidentsPage() {
  const { incidents, isLoading, error, fetchIncidents, addIncident, updateIncident, deleteIncident } = useIncidentStore();
  const { fetchServices } = useServiceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  useEffect(() => {
    fetchIncidents();
    fetchServices();
  }, [fetchIncidents, fetchServices]);

  const handleEdit = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (formData: any) => {
    await addIncident(formData);
    setIsCreateModalOpen(false);
    await fetchIncidents(); 
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (selectedIncident) {
      await updateIncident(selectedIncident.id, formData);
      setIsUpdateModalOpen(false);
      setSelectedIncident(null);
      await fetchIncidents();
    }
  };

  const confirmDelete = async () => {
    if (selectedIncident) {
      await deleteIncident(selectedIncident.id);
      setIsDeleteModalOpen(false);
      setSelectedIncident(null);
    }
  };

  // Make sure incidents is always an array
  const incidentsArray = Array.isArray(incidents) ? incidents : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Incidents" 
          description="Track and manage incident reports" 
        />
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>
      
      {error && (
        <div className="my-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <IncidentList 
          incidents={incidentsArray} 
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      {/* Create Incident Dialog */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Report Incident"
      >
        <IncidentForm 
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Dialog>
      
      {/* Update Incident Dialog */}
      <Dialog
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Incident"
      >
        {selectedIncident && (
          <IncidentForm 
            incident={selectedIncident}
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
        title="Delete Incident"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Are you sure you want to delete this incident?</p>
              <p className="mt-1 text-red-600 font-medium">{selectedIncident?.title}</p>
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