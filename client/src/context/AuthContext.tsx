

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useClerk, useUser, useSession } from '@clerk/clerk-react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    if (!isLoaded) return;

    const refreshToken = async () => {
      try {
        if (clerkUser && session) {
          const token = await session.getToken();
          
          // Store token for API requests
          if (token) {
            localStorage.setItem('authToken', token);
          }
          
          // Convert Clerk user to our app user model
          setUser({
            id: clerkUser.id,
            name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            avatarUrl: clerkUser.imageUrl,
            organizationId: session.lastActiveOrganizationId || '',
            createdAt: new Date(clerkUser.createdAt).toISOString(),
          });
        } else {
          // Clear user and token if not logged in
          setUser(null);
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error refreshing auth token:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    refreshToken();

    // Set up periodic token refresh (every 5 minutes)
    const refreshInterval = setInterval(refreshToken, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [clerkUser, session, isLoaded]);

  const signOut = async () => {
    try {
      await clerkSignOut();
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};