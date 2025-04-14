import { create } from 'zustand';
import { Maintenance } from '../types/maintenance.ts';
import { maintenanceApi } from '../api/maintenance.ts';

interface MaintenanceState {
  maintenances: Maintenance[];
  upcomingMaintenances: Maintenance[];
  isLoading: boolean;
  error: string | null;
  fetchMaintenances: () => Promise<void>;
  fetchUpcomingMaintenances: () => Promise<void>;
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => Promise<void>;
  updateMaintenance: (id: string, maintenance: Partial<Maintenance>) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  maintenances: [],
  upcomingMaintenances: [],
  isLoading: false,
  error: null,

 fetchMaintenances: async () => {
    set({ isLoading: true });
    try {
      const data = await maintenanceApi.getAll();
      set({ maintenances: Array.isArray(data) ? data : [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUpcomingMaintenances: async () => {
    set({ isLoading: true });
    try {
      const data = await maintenanceApi.getUpcoming();
      set({ upcomingMaintenances: Array.isArray(data) ? data : [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch' });
    } finally {
      set({ isLoading: false });
    }
  },
  addMaintenance: async (maintenance) => {
    set({ isLoading: true });
    try {
      const newMaintenance = await maintenanceApi.create(maintenance);
      set((state) => ({ 
        maintenances: [...state.maintenances, newMaintenance],
        upcomingMaintenances: [...state.upcomingMaintenances, newMaintenance],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add maintenance' 
      });
    }
  },

  updateMaintenance: async (id, maintenance) => {
    set({ isLoading: true });
    try {
      const updated = await maintenanceApi.update(id, maintenance);
      set(state => ({
        maintenances: state.maintenances.map(m => 
          m.id === id ? updated : m
        ),
        upcomingMaintenances: state.upcomingMaintenances.map(m => 
          m.id === id ? updated : m
        )
      }));
    } catch (error) {
        console.log(error)
    } finally {
      set({ isLoading: false });
    }
  },
  deleteMaintenance: async (id) => {
    set({ isLoading: true });
    try {
      await maintenanceApi.delete(id);
      set(state => ({
        maintenances: state.maintenances.filter(m => m.id !== id),
        upcomingMaintenances: state.upcomingMaintenances.filter(m => m.id !== id)
      }));
    } catch (error) {
      console.log(error)
    } finally {
      set({ isLoading: false });
    }
  }
}));