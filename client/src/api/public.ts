import apiClient from './api.client.ts';

export const publicApi = {
  getOrganizations: async () => {
    return apiClient.get('/public/organizations');
  },

  getServices: async (orgSlug: string) => {
    return apiClient.get(`/public/${orgSlug}/services`);
  },

  getIncidents: async (orgSlug: string) => {
    return apiClient.get(`/public/${orgSlug}/incidents`);
  },

  getMaintenances: async (orgSlug: string) => {
    return apiClient.get(`/public/${orgSlug}/maintenances`);
  }
};