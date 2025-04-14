
import apiClient from './api.client.ts';
import { Service } from '../types/service';

export const serviceApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/services');
      return { services: response.data.services };
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/services/${id}`);
    return { service: response.data.service };
  },

  create: async (serviceData: Partial<Service>) => {
    const response = await apiClient.post('/services', serviceData);
    return { service: response.data.service };
  },

  update: async (id: string, serviceData: Partial<Service>) => {
    const response = await apiClient.put(`/services/${id}`, serviceData);
    return { service: response.data.service };
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/services/${id}/status`, { status });
    return { service: response.data.service };
  },

  delete: async (id: string) => {
    await apiClient.delete(`/services/${id}`);
    return { success: true };
  },

  reorder: async (orders: { id: string; position: number }[]) => {
    const response = await apiClient.post('/services/reorder', { orders });
    return { services: response.data.services };
  },
  getStatusHistory: (id: string) => apiClient.get(`/services/${id}/history`),

getPublicServices: async (orgSlug: string) => {
  const response = await apiClient.get(`/public/${orgSlug}/services`);
  return response.data.services;
},

getOrganizationServices: async () => {
  const response = await apiClient.get('/services');
  return response.data.services;
}
};