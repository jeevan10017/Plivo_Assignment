import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { Sidebar, SidebarProvider, useSidebar } from './Sidebar.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const MainContent: React.FC = () => {
  const { isExpanded } = useSidebar();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <div className={`flex flex-col flex-1 ${isSmallScreen ? 'ml-16' : (isExpanded ? 'ml-64' : 'ml-16')} transition-all duration-300 ease-in-out`}>
      <Header />
      <main className="flex-1 px-4 py-6 md:py-8 md:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        {user && <Sidebar />}
        <MainContent />
      </div>
    </SidebarProvider>
  );
};