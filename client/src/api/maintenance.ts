import apiClient  from './api.client.ts';
import { Maintenance } from '../types/maintenance.ts';

export const maintenanceApi = {
  getAll: async (): Promise<Maintenance[]> => {
    const response = await apiClient.get('/maintenance');
    return response.data.maintenances; 
  },
  
  getUpcoming: async (): Promise<Maintenance[]> => {
    const response = await apiClient.get('/maintenance/upcoming');
    return response.data.maintenances; 
  },
  
  getById: async (id: string): Promise<Maintenance> => {
    const response = await apiClient.get(`/maintenance/${id}`);
    return response.data;
  },
  
  create: async (maintenance: Omit<Maintenance, 'id'>): Promise<Maintenance> => {
    const response = await apiClient.post('/maintenance', maintenance);
    return response.data;
  },
  
  update: async (id: string, maintenance: Partial<Maintenance>): Promise<Maintenance> => {
    const response = await apiClient.put(`/maintenance/${id}`, maintenance);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/maintenance/${id}`);
  }
};