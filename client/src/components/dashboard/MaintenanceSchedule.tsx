
import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Maintenance, MaintenanceStatus } from '../../types/maintenance';

interface MaintenanceScheduleProps {
  maintenances: Maintenance[];
  isLoading?: boolean;
}
export const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({
  maintenances,
  isLoading = false,
}) => {
  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Maintenance</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
          Upcoming Maintenance
        </h2>
        <Link
          to="/maintenance"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200 inline-flex items-center"
        >
          View all
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="divide-y divide-gray-200">
        {maintenances.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm font-medium">No scheduled maintenance</p>
          </div>
        ) : (
          maintenances.map((maintenance) => (
            <div key={maintenance.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                  {maintenance.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(maintenance.scheduledStart), 'MMM d, yyyy h:mm a')} - 
                  {format(new Date(maintenance.scheduledEnd), 'h:mm a')}
                </span>
              </div>

              <Link
                to={`/maintenance/${maintenance.id}`}
                className="text-base font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-150"
              >
                {maintenance.title}
              </Link>

              {maintenance.startedAt && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <svg className="mr-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Started: {format(new Date(maintenance.startedAt), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};