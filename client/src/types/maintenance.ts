export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
  
  export interface Maintenance {
    id: string;
    title: string;
    status: MaintenanceStatus;
    serviceIds: string[];
    scheduledStart: string;
    scheduledEnd: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  }
  export interface MaintenanceUpdate {
    id: string;
    maintenanceId: string;
    message: string;
    createdAt: string;
    createdBy: string;
  }
  