  import React from 'react';
  import { Link } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext.tsx';
  import { useOrganization } from '../context/OrganizationContext.tsx';
  import { UserButton, OrganizationSwitcher } from "@clerk/clerk-react";

  export const Header: React.FC = () => {
    const { user } = useAuth();
    const { organization, isLoading } = useOrganization();
    
    // if (isLoading) return null;
    return (
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                {(organization?.name?.toUpperCase() || 'STATUS PAGE')}
                </Link>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center">
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="ml-3 relative">
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <span className="sr-only">View notifications</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </button>
                      
                      <div className="flex justify-between p-4 border-b">
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
        />
        <UserButton />
      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  };