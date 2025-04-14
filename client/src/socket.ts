import { io, Socket } from 'socket.io-client';
import { useServiceStore } from './store/serviceStore';
import { useIncidentStore } from './store/incidentStore';
import { useMaintenanceStore } from './store/maintenanceStore';
import { Service, ServiceStatus } from './types/service';
import { Incident, IncidentStatus } from './types/incident';
import { Maintenance, MaintenanceStatus } from './types/maintenance';

interface ServerToClientEvents {
  'service:created': (service: Service) => void;
  'service:updated': (service: Service) => void;
  'service:deleted': (serviceId: string) => void;
  'service:status_updated': (serviceId: string, status: ServiceStatus) => void;
  'incident:created': (incident: Incident) => void;
  'incident:updated': (incident: Incident) => void;
  'incident:deleted': (incidentId: string) => void;
  'incident:status_updated': (incidentId: string, status: IncidentStatus) => void;
  'maintenance:created': (maintenance: Maintenance) => void;
  'maintenance:updated': (maintenance: Maintenance) => void;
  'maintenance:deleted': (maintenanceId: string) => void;
  'maintenance:status_updated': (maintenanceId: string, status: MaintenanceStatus) => void;
}

interface ClientToServerEvents {
  'subscribe:public': () => void;
  'subscribe:admin': () => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const initializeSocket = (token?: string) => {
  if (socket) {
    socket.disconnect();
  }
  
  const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';
  
  socket = io(socketUrl, {
    auth: token ? { token } : undefined,
  });
  
  return socket;
};

export const setupSocketListeners = (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
  const serviceStore = useServiceStore.getState();
  const incidentStore = useIncidentStore.getState();
  const maintenanceStore = useMaintenanceStore.getState();
  
  // Service events
  socket.on('service:created', (service) => {
    serviceStore.fetchServices();
  });
  
  socket.on('service:updated', (service) => {
    serviceStore.fetchServices();
  });
  
  socket.on('service:deleted', (serviceId) => {
    serviceStore.fetchServices();
  });
  
  socket.on('service:status_updated', (serviceId, status) => {
    serviceStore.fetchServices();
  });
  
  // Incident events
  socket.on('incident:created', (incident) => {
    incidentStore.fetchIncidents();
    incidentStore.fetchActiveIncidents();
  });
  
  socket.on('incident:updated', (incident) => {
    incidentStore.fetchIncidents();
    incidentStore.fetchActiveIncidents();
  });
  
  socket.on('incident:deleted', (incidentId) => {
    incidentStore.fetchIncidents();
    incidentStore.fetchActiveIncidents();
  });
  
  socket.on('incident:status_updated', (incidentId, status) => {
    incidentStore.fetchIncidents();
    incidentStore.fetchActiveIncidents();
  });
  
  // Maintenance events
  socket.on('maintenance:created', (maintenance) => {
    maintenanceStore.fetchMaintenances();
    maintenanceStore.fetchUpcomingMaintenances();
  });
  
  socket.on('maintenance:updated', (maintenance) => {
    maintenanceStore.fetchMaintenances();
    maintenanceStore.fetchUpcomingMaintenances();
  });
  
  socket.on('maintenance:deleted', (maintenanceId) => {
    maintenanceStore.fetchMaintenances();
    maintenanceStore.fetchUpcomingMaintenances();
  });
  
  socket.on('maintenance:status_updated', (maintenanceId, status) => {
    maintenanceStore.fetchMaintenances();
    maintenanceStore.fetchUpcomingMaintenances();
  });
  
  return () => {
    socket.off('service:created');
    socket.off('service:updated');
    socket.off('service:deleted');
    socket.off('service:status_updated');
    socket.off('incident:created');
    socket.off('incident:updated');
    socket.off('incident:deleted');
    socket.off('incident:status_updated');
    socket.off('maintenance:created');
    socket.off('maintenance:updated');
    socket.off('maintenance:deleted');
    socket.off('maintenance:status_updated');
  };
};

export const subscribeToPublic = () => {
  if (socket) {
    socket.emit('subscribe:public');
  }
};

export const subscribeToAdmin = () => {
  if (socket) {
    socket.emit('subscribe:admin');
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};