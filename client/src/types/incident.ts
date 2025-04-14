export enum IncidentStatus {
  INVESTIGATING = 'INVESTIGATING',
  IDENTIFIED = 'IDENTIFIED',
  MONITORING = 'MONITORING',
  RESOLVED = 'RESOLVED',
}

export type IncidentImpact = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'MAINTENANCE';

export interface Service {
  id: string;
  name: string;
  description: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'MAINTENANCE' | 'UNKNOWN';
  createdAt: string;
  updatedAt: string;
}

export interface IncidentService {
  incidentId: string;
  serviceId: string;
  service: Service;
}

export interface IncidentUpdate {
  id: string;
  status: IncidentStatus;
  message: string;
  incidentId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  startsAt: string;
  resolvedAt?: string;
  organizationId: string;
  services: IncidentService[];
  updates: IncidentUpdate[];
}

export interface PublicIncidentsResponse {
  activeIncidents: Incident[];
  resolvedIncidents: Incident[];
  showHistory: boolean;
}