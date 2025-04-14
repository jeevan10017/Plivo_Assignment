
import { create } from 'zustand';
import { serviceApi } from '../api/services.ts';
import { Service, ServiceStatus, ServiceStatusHistory } from '../types/service';


interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  statusHistory: ServiceStatusHistory[];
  
  // Actions
  fetchServices: () => Promise<void>;
  getServiceById: (id: string) => Promise<Service | undefined>;
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateService: (id: string, serviceData: Partial<Service>) => Promise<void>;
  updateServiceStatus: (id: string, status: ServiceStatus) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  reorderServices: (orders: { id: string; position: number }[]) => Promise<void>;
  getStatusHistory: (serviceId: string) => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,
  statusHistory: [], 

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { services } = await serviceApi.getAll();
      
      if (Array.isArray(services)) {
        // Filter out null/undefined services
        const validServices = services.filter(service => service != null);
        set({ services: validServices, isLoading: false });
      } else {
        set({ services: [], error: 'Invalid response format', isLoading: false });
      }
    } catch (error) {
      set({ 
        services: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch services', 
        isLoading: false 
      });
    }
  },

  getServiceById: async (id: string) => {
    try {
      const { service } = await serviceApi.getById(id);
      return service;
    } catch (error) {
      console.error(`Failed to fetch service ${id}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Failed to fetch service ${id}` 
      });
      return undefined;
    }
  },

  getStatusHistory: async (serviceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceApi.getStatusHistory(serviceId);
      set({ statusHistory: response.history, isLoading: false });
    } catch (error) {
      set({ 
        statusHistory: [],
        error: error instanceof Error ? error.message : 'Failed to load history',
        isLoading: false
      });
    }
  },

  addService: async (serviceData) => {
    set({ isLoading: true, error: null });
    try {
      const { service } = await serviceApi.create(serviceData);
      if (!service) throw new Error('Invalid service response');
      
      set(state => ({
        // Ensure existing services are valid before adding new one
        services: [...state.services.filter(s => s != null), service],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add service', 
        isLoading: false 
      });
    }
  },

  updateService: async (id, serviceData) => {
    set({ isLoading: true, error: null });
    try {
      const { service } = await serviceApi.update(id, serviceData);
      set(state => ({
        services: state.services.map(s => s.id === id ? service : s),
        isLoading: false
      }));
    } catch (error) {
      console.error(`Failed to update service ${id}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Failed to update service ${id}`, 
        isLoading: false 
      });
    }
  },

  updateServiceStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const { service } = await serviceApi.updateStatus(id, status);
      set(state => ({
        services: state.services.map(s => s.id === id ? service : s),
        isLoading: false
      }));
    } catch (error) {
      console.error(`Failed to update service status ${id}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Failed to update service status ${id}`, 
        isLoading: false 
      });
    }
  },

  deleteService: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await serviceApi.delete(id);
      set(state => ({
        services: state.services.filter(s => s.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error(`Failed to delete service ${id}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Failed to delete service ${id}`, 
        isLoading: false 
      });
    }
  },
  
  reorderServices: async (orders) => {
    set({ isLoading: true, error: null });
    try {
      const { services } = await serviceApi.reorder(orders);
      set({ 
        services: Array.isArray(services) ? services : [], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to reorder services:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reorder services', 
        isLoading: false 
      });
    }
  }
}));