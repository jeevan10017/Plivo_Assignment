import { useServiceStore } from '../store/serviceStore.ts';
import { useIncidentStore } from '../store/incidentStore.ts';
import { useMaintenanceStore } from '../store/maintenanceStore.ts';
import { StatusOverview } from '../components/dashboard/StatusOverview.tsx';
import { IncidentHistory } from '../components/dashboard/IncidentHistory.tsx';
import { MaintenanceSchedule } from '../components/dashboard/MaintenanceSchedule.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import React, { useEffect, useState } from 'react';


export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const { services, fetchServices } = useServiceStore();
  const { incidents, activeIncidents, fetchIncidents, fetchActiveIncidents } = useIncidentStore();
  const { upcomingMaintenances, fetchUpcomingMaintenances } = useMaintenanceStore();
  
  const operational = services.filter(s => s.status === 'OPERATIONAL').length;
  const degraded = services.filter(s => s.status === 'DEGRADED').length;
  const outage = services.filter(s => s.status === 'OUTAGE').length;
  const maintenance = services.filter(s => s.status === 'MAINTENANCE').length;
  const total = services.length;

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchServices(),
          fetchIncidents(),
          fetchActiveIncidents(),
          fetchUpcomingMaintenances()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <header className="mb-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Real-time overview of your system status and recent activities</p>
        </div>
      </header>

      <div className="mb-8">
        <StatusOverview 
          operational={operational}
          degraded={degraded}
          outage={outage}
          maintenance={maintenance}
          total={total}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <IncidentHistory 
            incidents={incidents.slice(0, 5)} 
            isLoading={isLoading} 
          />
        </div>
        
        <div>
          <MaintenanceSchedule 
            maintenances={upcomingMaintenances.slice(0, 5)} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}