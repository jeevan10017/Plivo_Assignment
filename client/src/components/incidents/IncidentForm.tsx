import React, { useState, useEffect } from 'react';

import { 
  Incident, 
  IncidentStatus, 
  IncidentImpact,
  Service
} from '../../types/incident';
import { useServiceStore } from '../../store/serviceStore.ts';

interface IncidentFormProps {
  incident?: Incident;
  isLoading?: boolean;
  onSubmit: (formData: {
    title: string;
    status: IncidentStatus;
    impact: IncidentImpact;
    serviceIds: string[];
    message?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

type FormErrors = {
  title?: string;
  services?: string;
  message?: string;
};
export const IncidentForm = ({
  incident,
  isLoading = false,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(incident?.title || '');
  const [status, setStatus] = useState(incident?.status || 'INVESTIGATING');
  const [impact, setImpact] = useState(incident?.impact || 'MINOR');
  const [selectedServices, setSelectedServices] = useState(
    incident?.services?.map(s => s.serviceId) || []
  );
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const { services, isLoading: servicesLoading } = useServiceStore();

  useEffect(() => {
    if (incident) {
      setTitle(incident.title);
      setStatus(incident.status);
      setImpact(incident.impact);
      setSelectedServices(incident.services?.map(s => s.serviceId) || []);
      setMessage(incident.updates?.[0]?.message || ''); 
    }
  }, [incident]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (selectedServices.length === 0) {
      newErrors.services = 'At least one service must be selected';
    }
    
    if (!message.trim() && !incident) {
      newErrors.message = 'Initial status message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    
    try {
      await onSubmit({
        title,
        status,
        impact,
        serviceIds: selectedServices,
        message: message.trim() ? message : undefined,
      });
      
      // Reset form if successful
      if (!incident) {
        setTitle('');
        setStatus('INVESTIGATING');
        setImpact('MINOR');
        setSelectedServices([]);
        setMessage('');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getImpactColor = (impact) => {
    const colors = {
      'CRITICAL': 'bg-red-50 text-red-700 border-red-200',
      'MAJOR': 'bg-orange-50 text-orange-700 border-orange-200',
      'MINOR': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'MAINTENANCE': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[impact] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      'INVESTIGATING': 'bg-purple-50 text-purple-700 border-purple-200',
      'IDENTIFIED': 'bg-blue-50 text-blue-700 border-blue-200',
      'MONITORING': 'bg-green-50 text-green-700 border-green-200',
      'RESOLVED': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          {incident ? 'Update Incident' : 'Create New Incident'}
        </h2>
        <p className="text-gray-500 text-sm">
          {incident ? 'Modify incident details and provide an update' : 'Report a new service incident'}
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
            placeholder="e.g., API Latency Issues"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            disabled={isLoading || submitLoading}
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
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none ${getStatusColor(status)}`}
              disabled={isLoading || submitLoading}
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 0.5rem center', 
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem' }}
            >
              <option value="INVESTIGATING">Investigating</option>
              <option value="IDENTIFIED">Identified</option>
              <option value="MONITORING">Monitoring</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Current status of the incident</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Impact
            </label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none ${getImpactColor(impact)}`}
              disabled={isLoading || submitLoading}
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 0.5rem center', 
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem' }}
            >
              <option value="CRITICAL">Critical - Service Unusable</option>
              <option value="MAJOR">Major - Service Impaired</option>
              <option value="MINOR">Minor - Service Degraded</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Severity of service disruption</p>
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
                  disabled={isLoading || submitLoading}
                />
                <label htmlFor={`service-${service.id}`} className="text-gray-700 text-sm cursor-pointer select-none">
                  {service.name}
                </label>
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">Select all services affected by this incident</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {incident ? "Update Message" : "Initial Status Message"} 
            {!incident && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={incident 
              ? "Provide details about this update..."
              : "Describe the incident and what you're doing to resolve it..."
            }
            className={`w-full px-4 py-3 h-32 bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            disabled={isLoading || submitLoading}
            required={!incident}
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
            {incident 
              ? "Provide context about the current status or progress" 
              : "Be specific about the impact and what steps you're taking"}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-6 mt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || submitLoading}
          className="px-5 py-2.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || submitLoading}
          className="px-5 py-2.5 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center space-x-2 text-sm font-medium"
        >
          {(isLoading || submitLoading) && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{incident ? 'Update Incident' : 'Create Incident'}</span>
        </button>
      </div>
    </form>
  );
};