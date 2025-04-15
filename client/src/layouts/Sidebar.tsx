import React, { useState, useContext, createContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

// Create a context to manage sidebar state globally
type SidebarContextType = {
  isExpanded: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isExpanded: true,
  toggleSidebar: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    const checkScreenSize = () => {
      // Automatically collapse sidebar on smaller screens
      if (window.innerWidth < 1024) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    
    // Check on initial load
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const toggleSidebar = () => {
    // Only allow expanding on larger screens
    if (window.innerWidth >= 1024) {
      setIsExpanded(prev => !prev);
    }
  };
  
  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);

export const Sidebar: React.FC = () => {
  const { isExpanded, toggleSidebar } = useSidebar();
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
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'chart-bar' },
    { name: 'Services', href: '/services', icon: 'server' },
    { name: 'Incidents', href: '/incidents', icon: 'exclamation' },
    { name: 'Maintenance', href: '/maintenance', icon: 'calendar' },
    { name: 'Settings', href: '/settings', icon: 'cog' },
  ];

  // Make sidebar even thinner on small screens
  const sidebarWidth = isSmallScreen 
    ? 'w-12' // Reduced from w-16 to w-12 for smaller screens
    : (isExpanded ? 'w-64' : 'w-16');

  return (
    <div 
      className={`flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out bg-gray-800 h-full ${sidebarWidth}`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between p-4">
          {isExpanded && !isSmallScreen && (
            <span className="text-lg font-bold text-white">Admin Panel</span>
          )}
          {!isSmallScreen && (
            <button
              onClick={toggleSidebar}
              className="text-gray-300 hover:text-white"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isExpanded ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col pt-2 pb-4 overflow-y-auto">
          <nav className="mt-1 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  isActive
                    ? `bg-gray-900 text-white group flex items-center py-2 ${
                        isExpanded && !isSmallScreen ? 'px-2' : 'justify-center px-1'
                      } text-sm font-medium rounded-md`
                    : `text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center py-2 ${
                        isExpanded && !isSmallScreen ? 'px-2' : 'justify-center px-1'
                      } text-sm font-medium rounded-md`
                }
              >
                <svg
                  className={`text-gray-400 group-hover:text-gray-300 flex-shrink-0 ${
                    // Smaller icon size for small screens
                    isSmallScreen ? 'h-4 w-4' : 'h-6 w-6'
                  } ${
                    isExpanded && !isSmallScreen ? 'mr-3' : 'mr-0'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      item.icon === 'chart-bar'
                        ? 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                        : item.icon === 'server'
                        ? 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01'
                        : item.icon === 'exclamation'
                        ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                        : item.icon === 'calendar'
                        ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        : 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                    }
                  />
                </svg>
                {isExpanded && !isSmallScreen && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};