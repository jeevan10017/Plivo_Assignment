export enum ServiceStatus {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED = 'DEGRADED',
  OUTAGE = 'OUTAGE',
  MAINTENANCE = 'MAINTENANCE',
  UNKNOWN = 'UNKNOWN',
}

export interface Service {
  id: string;
  name: string;
  description: string;
  groupName?: string;
  status: ServiceStatus;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}