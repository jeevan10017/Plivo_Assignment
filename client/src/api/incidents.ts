import  apiClient from './api.client.ts';
import { Incident, IncidentUpdate } from '../types/incident';

export const incidentApi = {
  getAll: async (): Promise<{ incidents: Incident[] }> => {
    const response = await apiClient.get('/incidents');
    return response.data;
  },
  
  getById: async (id: string): Promise<{ incident: Incident }> => {
    const response = await apiClient.get(`/incidents/${id}`);
    return response.data;
  },
  
  create: async (incidentData: {
    title: string;
    status: string;
    impact: string;
    serviceIds: string[];
    message: string;
  }): Promise<{ incident: Incident }> => {
    const response = await apiClient.post('/incidents', incidentData);
    return response.data;
  },
  
  update: async (id: string, incidentData: {
    title?: string;
    impact?: string;
    serviceIds?: string[];
  }): Promise<{ incident: Incident }> => {
    const response = await apiClient.put(`/incidents/${id}`, incidentData);
    return response.data;
  },
  
  addUpdate: async (id: string, updateData: {
    status: string;
    message: string;
  }): Promise<{ incident: Incident, update: IncidentUpdate }> => {
    const response = await apiClient.post(`/incidents/${id}/updates`, updateData);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/incidents/${id}`);
  },
  
  getPublic: async (orgSlug: string): Promise<{
    activeIncidents: Incident[];
    resolvedIncidents: Incident[];
    showHistory: boolean;
  }> => {
    const response = await apiClient.get(`/public/status/${orgSlug}/incidents`);
    return response.data;
  }
};