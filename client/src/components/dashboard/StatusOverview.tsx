

import React from 'react';
import { ServiceStatus } from '../../types/service';
import { Service } from '../../types/service';

interface StatusOverviewProps {
  operational: number;
  degraded: number;
  outage: number;
  maintenance: number;
  total: number;
  isLoading?: boolean;
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({
  operational,
  degraded,
  outage,
  maintenance,
  total,
  isLoading = false,
}) => {
  const operationalPercent = (operational / total) * 100;
  const degradedPercent = (degraded / total) * 100;
  const outagePercent = (outage / total) * 100;
  const maintenancePercent = (maintenance / total) * 100;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Overview</h2>
        <div className="animate-pulse mb-6">
          <div className="h-4 bg-gray-200 rounded-full w-full mb-4"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Status Overview</h2>
        <div className="text-sm text-gray-500">
          <span className="font-medium">{total}</span> services monitored
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
            {operational > 0 && (
              <div
                className="bg-green-500 h-full"
                style={{ width: `${operationalPercent}%` }}
                title={`${operational} operational services (${operationalPercent.toFixed(1)}%)`}
              />
            )}
            {degraded > 0 && (
              <div
                className="bg-yellow-500 h-full"
                style={{ width: `${degradedPercent}%` }}
                title={`${degraded} degraded services (${degradedPercent.toFixed(1)}%)`}
              />
            )}
            {outage > 0 && (
              <div
                className="bg-red-500 h-full"
                style={{ width: `${outagePercent}%` }}
                title={`${outage} services with outage (${outagePercent.toFixed(1)}%)`}
              />
            )}
            {maintenance > 0 && (
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${maintenancePercent}%` }}
                title={`${maintenance} services in maintenance (${maintenancePercent.toFixed(1)}%)`}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>Operational</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            <span>Degraded</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Outage</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusItem 
          label="Operational" 
          count={operational} 
          color="bg-green-100 text-green-800" 
          iconColor="bg-green-500" 
        />
        <StatusItem 
          label="Degraded" 
          count={degraded} 
          color="bg-yellow-100 text-yellow-800" 
          iconColor="bg-yellow-500" 
        />
        <StatusItem 
          label="Outage" 
          count={outage} 
          color="bg-red-100 text-red-800" 
          iconColor="bg-red-500" 
        />
        <StatusItem 
          label="Maintenance" 
          count={maintenance} 
          color="bg-blue-100 text-blue-800" 
          iconColor="bg-blue-500" 
        />
      </div>
    </div>
  );
};

interface StatusItemProps {
  label: string;
  count: number;
  color: string;
  iconColor: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, count, color, iconColor }) => {
  return (
    <div className={`${color} rounded-lg px-4 py-3 transition-transform duration-200 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${iconColor} w-3 h-3 rounded-full mr-2`} />
          <span className="font-medium">{label}</span>
        </div>
        <svg className="h-5 w-5 text-current opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {label === "Operational" && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          )}
          {label === "Degraded" && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          )}
          {label === "Outage" && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
          {label === "Maintenance" && (
            <React.Fragment>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </React.Fragment>
          )}
        </svg>
      </div>
      <div className="text-2xl font-bold mt-2">{count}</div>
    </div>
  );
};