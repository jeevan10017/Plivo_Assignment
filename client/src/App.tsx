import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  ClerkProvider,
  SignedIn,
  SignIn,
  SignUp,
} from '@clerk/clerk-react';

import { MainLayout } from './layouts/MainLayout.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { OrganizationProvider } from './context/OrganizationContext.tsx';
import { WebSocketProvider } from './context/WebSocketContext.tsx';

import Dashboard from './pages/Dashboard.tsx';
import ServicesPage from './pages/ServicePage.tsx';
import IncidentsPage from './pages/IncidentPage.tsx';
import MaintenancePage from './pages/MaintenancePage.tsx';
import {PublicStatusPage} from './pages/PublicStatusPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY!;

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicStatusPage />} />
      <Route
  path="/login"
  element={
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <SignIn path="/login" routing="path" redirectUrl="/dashboard" />
    </div>
  }
/>
{/* <Routes> */}
      <Route path="/public" element={<PublicStatusPage />} />
      <Route path="/public/:orgSlug" element={<PublicStatusPage />} />
      <Route path="/" element={<PublicStatusPage />} />
    {/* </Routes> */}
<Route
  path="/signup"
  element={
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <SignUp path="/signup" routing="path" redirectUrl="/dashboard" />
    </div>
  }
/>
<Route path="/public/:orgSlug?" element={PublicStatusPage} />

      
      {/* Protected */}
      <Route
        element={
          <SignedIn>
            <MainLayout />
          </SignedIn>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/settings" element={<div>Settings Coming Soon</div>} />
      </Route>
      
      {/* Fallback */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}


function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>
        <OrganizationProvider>
          <WebSocketProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </WebSocketProvider>
        </OrganizationProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;