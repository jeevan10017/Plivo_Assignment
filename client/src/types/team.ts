export enum TeamRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer',
  }
  
  export interface TeamMember {
    id: string;
    userId: string;
    teamId: string;
    role: TeamRole;
    name: string;
    email: string;
  }
  
  export interface Team {
    id: string;
    name: string;
    organizationId: string;
    createdAt: string;
    members: TeamMember[];
  }
  