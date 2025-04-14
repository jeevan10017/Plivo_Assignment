import React, { useState } from 'react';
import { useServiceStore } from '../../store/serviceStore.ts';
import { ServiceStatus } from '../../types/service.ts';
import { useOrganization } from '../../context/OrganizationContext.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';

const SERVICE_STATUS = {
  [ServiceStatus.OPERATIONAL]: 'Operational',
  [ServiceStatus.DEGRADED]: 'Degraded',
  [ServiceStatus.OUTAGE]: 'Outage',
  [ServiceStatus.MAINTENANCE]: 'Maintenance',
  [ServiceStatus.UNKNOWN]: 'Unknown',
} as const;
const statusOptions = Object.entries(SERVICE_STATUS).map(([value, label]) => ({
   value ,
  label,
}));
interface ServiceFormProps {
  service?: Service;
  onClose: () => void;
}

type ServiceFormData = {
  name: string;
  description: string;
  group: string;
  status: ServiceStatus;
};

export const ServiceForm: React.FC<ServiceFormProps> = ({ service, onClose }) => {
  const { organization } = useOrganization();
  const { addService, updateService } = useServiceStore();
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: service?.name || '',
    description: service?.description || '',
    group: service?.groupName || '', 
    status: service?.status || ServiceStatus.OPERATIONAL, 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!organization || !organization.id) {
        throw new Error("Organization information is missing");
      }
      
      const apiData = {
        name: formData.name,
        description: formData.description,
        groupName: formData.group,
        status: formData.status
      };

   
      
      if (service) {
        await updateService(service.id, apiData);
      } else {
        await addService({
          ...apiData,
          organizationId: organization.id,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        {service ? 'Edit Service' : 'Add New Service'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Service Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. API, Website, Database"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief description of this service"
          />
        </div>
        
        <div>
          <label htmlFor="group" className="block text-sm font-medium text-gray-700">
            Group (Optional)
          </label>
          <Input
            id="group"
            name="group"
            value={formData.group}
            onChange={handleChange}
            placeholder="e.g. Core Services, Infrastructure"
          />
          <p className="mt-1 text-xs text-gray-500">
            Services with the same group will be displayed together
          </p>
        </div>
        
        <div>
          {/* <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label> */}
          <Select
  id="status"
  name="status"
  label="Status"
  value={formData.status}
  onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
  options={statusOptions}
/>

        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {service ? 'Update' : 'Create'} Service
        </Button>
      </div>
    </form>
  );
};