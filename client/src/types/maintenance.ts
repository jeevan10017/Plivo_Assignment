export enum MaintenanceStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
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
  