import React, { useState, useEffect } from 'react';
import { 
  Maintenance, 
  MaintenanceStatus, 
  MaintenanceUpdate
} from '../../types/maintenance';
import { Service } from '../../types/service';

interface MaintenanceFormProps {
  maintenance?: Maintenance & { 
    services?: { service: Service }[],
    updates?: MaintenanceUpdate[],
    createdBy?: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    }
  };
  services: Service[];
  isLoading?: boolean;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  maintenance,
  services,
  isLoading = false,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(maintenance?.title || '');
  const [status, setStatus] = useState<MaintenanceStatus>(maintenance?.status || 'SCHEDULED');
  const [scheduledStart, setScheduledStart] = useState(
    maintenance?.scheduledStart 
      ? new Date(maintenance.scheduledStart).toISOString().slice(0, 16)
      : ''
  );
  const [scheduledEnd, setScheduledEnd] = useState(
    maintenance?.scheduledEnd
      ? new Date(maintenance.scheduledEnd).toISOString().slice(0, 16)
      : ''
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    maintenance?.services?.map(s => s.service.id) || []
  );
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when maintenance changes
  useEffect(() => {
    if (maintenance) {
      setTitle(maintenance.title);
      setStatus(maintenance.status);
      setScheduledStart(new Date(maintenance.scheduledStart).toISOString().slice(0, 16));
      setScheduledEnd(new Date(maintenance.scheduledEnd).toISOString().slice(0, 16));
      setSelectedServices(maintenance.services?.map(s => s.service.id) || []);
      setMessage('');
    }
  }, [maintenance]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!scheduledStart) {
      newErrors.scheduledStart = 'Scheduled start is required';
    }
    
    if (!scheduledEnd) {
      newErrors.scheduledEnd = 'Scheduled end is required';
    } else if (scheduledStart && new Date(scheduledEnd) <= new Date(scheduledStart)) {
      newErrors.scheduledEnd = 'End time must be after start time';
    }
    
    if (selectedServices.length === 0) {
      newErrors.services = 'At least one service must be selected';
    }
    
    if (!message.trim() && !maintenance) {
      newErrors.message = 'Initial message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    onSubmit({
      title,
      status,
      scheduledStart: new Date(scheduledStart).toISOString(),
      scheduledEnd: new Date(scheduledEnd).toISOString(),
      serviceIds: selectedServices,
      message: message.trim() ? message : undefined,
    });
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    const colors = {
      'SCHEDULED': 'bg-blue-50 text-blue-700 border-blue-200',
      'IN_PROGRESS': 'bg-purple-50 text-purple-700 border-purple-200',
      'COMPLETED': 'bg-green-50 text-green-700 border-green-200',
      'CANCELLED': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          {maintenance ? 'Update Maintenance' : 'Schedule Maintenance'}
        </h2>
        <p className="text-gray-500 text-sm">
          {maintenance ? 'Modify maintenance details and provide an update' : 'Schedule planned maintenance for your services'}
        </p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Database Upgrade Maintenance"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            disabled={isLoading || isSubmitting}
            required
          />
          {errors.title && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.title}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
            className={`w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none ${getStatusColor(status)}`}
            disabled={isLoading || isSubmitting}
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
              backgroundPosition: 'right 0.5rem center', 
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem' }}
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Current status of the maintenance</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Scheduled Start <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.scheduledStart ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              disabled={isLoading || isSubmitting}
              required
            />
            {errors.scheduledStart && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.scheduledStart}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Scheduled End <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.scheduledEnd ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              disabled={isLoading || isSubmitting}
              required
            />
            {errors.scheduledEnd && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.scheduledEnd}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Affected Services <span className="text-red-500">*</span>
          </label>
          {errors.services && (
            <p className="mb-2 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.services}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
            {services?.map((service) => (
              <div key={service.id} className="flex items-center space-x-2.5 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <input
                  id={`service-${service.id}`}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  disabled={isLoading || isSubmitting}
                />
                <label htmlFor={`service-${service.id}`} className="text-gray-700 text-sm cursor-pointer select-none">
                  {service.name}
                </label>
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">Select all services affected by this maintenance</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {maintenance ? "Update Message" : "Initial Message"} 
            {!maintenance && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={maintenance 
              ? "Provide details about this update..."
              : "Describe what this maintenance involves and expected impact..."
            }
            className={`w-full px-4 py-3 h-32 bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            disabled={isLoading || isSubmitting}
            required={!maintenance}
          />
          {errors.message && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {maintenance 
              ? "Provide context about the current status or progress" 
              : "Be specific about the work being done and potential service impact"}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-6 mt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
          className="px-5 py-2.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="px-5 py-2.5 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center space-x-2 text-sm font-medium"
        >
          {(isLoading || isSubmitting) && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{maintenance ? 'Update Maintenance' : 'Schedule Maintenance'}</span>
        </button>
      </div>
    </form>
  );
};