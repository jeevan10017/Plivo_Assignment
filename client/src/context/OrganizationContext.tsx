import React, { createContext, useContext, useEffect, useState } from 'react';
import { useOrganization as useClerkOrganization } from '@clerk/clerk-react';
import { Organization } from '../types/organization';
import apiClient from '../api/api.client.ts'; 

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  isLoading: true,
});

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { organization: clerkOrg, isLoaded } = useClerkOrganization();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncOrg = async () => {
      if (clerkOrg?.id) {
        try {
          const { data } = await apiClient.get(
            `/organizations/sync/${clerkOrg.id}`
          );
          setOrganization(data.organization);
        } catch (error) {
          console.error('Organization sync failed:', error);
        }
      }
    };
  
    if (isLoaded) syncOrg();
  }, [clerkOrg, isLoaded]);

  return (
    <OrganizationContext.Provider value={{ organization, isLoading }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};
