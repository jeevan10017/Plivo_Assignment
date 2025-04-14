import { Request as ExpressRequest } from 'express';
import {
  User,
  UserRole,
  Organization,
  Service,
  ServiceStatus,
  Incident,
  IncidentStatus,
  IncidentImpact,
  IncidentUpdate,
  Maintenance,
  MaintenanceStatus,
  MaintenanceUpdate,
  Subscriber,
  OrganizationSettings
} from '@prisma/client';

// Augment Express Request
export interface Request extends ExpressRequest {
  userId?: string;
  organizationId?: string;
  userRole?: UserRole;
}

// Auth-related types
export interface AuthTokenPayload {
  userId: string;
  organizationId: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  organizationSlug: string;
}

// Config-related types
export interface EmailConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
  secure: boolean;
  from: string;
}

// Notification-related types
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface WebhookPayload {
  eventType: string;
  data: any;
  timestamp: number;
  signature?: string;
}

// Export all Prisma types
export type {
  User,
  UserRole,
  Organization,
  Service,
  ServiceStatus,
  Incident,
  IncidentStatus,
  IncidentImpact,
  IncidentUpdate,
  Maintenance,
  MaintenanceStatus,
  MaintenanceUpdate,
  Subscriber,
  OrganizationSettings
};