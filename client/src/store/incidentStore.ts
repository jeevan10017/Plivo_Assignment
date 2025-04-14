import { create } from 'zustand';
import { Incident, IncidentStatus } from '../types/incident.ts';
import { incidentApi } from '../api/incidents.ts';

interface IncidentState {
  incidents: Incident[];
  activeIncidents: Incident[];
  isLoading: boolean;
  error: string | null;
  fetchIncidents: () => Promise<void>;
  fetchActiveIncidents: () => Promise<void>;
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updates'>) => Promise<void>;
  updateIncident: (id: string, incident: Partial<Incident>) => Promise<void>;
  addIncidentUpdate: (incidentId: string, update: any) => Promise<void>;
  resolveIncident: (id: string) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
}

export const useIncidentStore = create((set, get) => ({
  incidents: [],
  isLoading: false,
  error: null,
  
  fetchIncidents: async () => {
    set({ isLoading: true });
    try {
      const { incidents } = await incidentApi.getAll();
      set({ incidents: incidents || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      set({ error, isLoading: false, incidents: [] });
    }
  },

  fetchActiveIncidents: async () => {
    set({ isLoading: true });
    try {
      const activeIncidents = await incidentApi.getActive();
      set({ activeIncidents, isLoading: false, error: null });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch active incidents' 
      });
    }
  },

  addIncident: async (incident) => {
    set({ isLoading: true });
    try {
      const newIncident = await incidentApi.create(incident);
      set((state) => ({ 
        incidents: [...state.incidents, newIncident],
        activeIncidents: [...state.activeIncidents, newIncident],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add incident' 
      });
    }
  },

  updateIncident: async (id, incident) => {
    set({ isLoading: true });
    try {
      const updatedIncident = await incidentApi.update(id, incident);
      set((state) => ({
        incidents: state.incidents.map((i) => (i.id === id ? updatedIncident : i)),
        activeIncidents: updatedIncident.status === IncidentStatus.RESOLVED
          ? state.activeIncidents.filter((i) => i.id !== id)
          : state.activeIncidents.map((i) => (i.id === id ? updatedIncident : i)),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update incident' 
      });
    }
  },

  addIncidentUpdate: async (incidentId, update) => {
    set({ isLoading: true });
    try {
      const updatedIncident = await incidentApi.addUpdate(incidentId, update);
      set((state) => ({
        incidents: state.incidents.map((i) => (i.id === incidentId ? updatedIncident : i)),
        activeIncidents: updatedIncident.status === IncidentStatus.RESOLVED
          ? state.activeIncidents.filter((i) => i.id !== incidentId)
          : state.activeIncidents.map((i) => (i.id === incidentId ? updatedIncident : i)),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add update to incident' 
      });
    }
  },

  

  resolveIncident: async (id) => {
    set({ isLoading: true });
    try {
      const resolvedIncident = await incidentApi.resolve(id);
      set((state) => ({
        incidents: state.incidents.map((i) => (i.id === id ? resolvedIncident : i)),
        activeIncidents: state.activeIncidents.filter((i) => i.id !== id),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to resolve incident' 
      });
    }
  },

  deleteIncident: async (id) => {
    set({ isLoading: true });
    try {
      await incidentApi.delete(id);
      set((state) => ({
        incidents: state.incidents.filter((i) => i.id !== id),
        activeIncidents: state.activeIncidents.filter((i) => i.id !== id),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete incident' 
      });
    }
  },
}));