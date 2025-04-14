import React from 'react';
import { Incident, IncidentStatus } from '../../types/incident.ts';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface IncidentHistoryProps {
  incidents: Incident[];
  isLoading?: boolean;
}

export const IncidentHistory: React.FC<IncidentHistoryProps> = ({ 
  incidents,
  isLoading = false 
}) => {
  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.INVESTIGATING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
            Investigating
          </span>
        );
      case IncidentStatus.IDENTIFIED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <span className="w-2 h-2 mr-1 bg-blue-500 rounded-full"></span>
            Identified
          </span>
        );
      case IncidentStatus.MONITORING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <span className="w-2 h-2 mr-1 bg-purple-500 rounded-full"></span>
            Monitoring
          </span>
        );
      case IncidentStatus.RESOLVED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Incidents</h2>
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Recent Incidents</h2>
        <Link
          to="/incidents"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200 inline-flex items-center"
        >
          View all
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="overflow-hidden">
        {incidents.length === 0 ? (
          <div className="px-4 py-8 sm:px-6 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm font-medium">No recent incidents</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {incidents.map((incident) => (
              <li key={incident.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-0">
                    <Link 
                      to={`/incidents/${incident.id}`}
                      className="text-base font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-150"
                    >
                      {incident.title}
                    </Link>
                    <div>{getStatusBadge(incident.status)}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {incident.description}
                </div>
                <div className="mt-3">
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
                  >
                    View details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
