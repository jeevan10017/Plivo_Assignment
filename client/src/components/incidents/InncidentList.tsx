import React from 'react';
import format from 'date-fns/format';
import { Incident } from '../../types/incident';
import { Link } from 'react-router-dom';

interface IncidentListProps {
  incidents: Incident[];
  isLoading?: boolean;
  onEdit?: (incident: Incident) => void;
  onDelete?: (incident: Incident) => void;
}

export const IncidentList = ({
  incidents = [],
  isLoading = false,
  onEdit,
  onDelete,
}) => {
  const incidentArray = Array.isArray(incidents) ? incidents : [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'investigating':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'identified':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'monitoring':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'major':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'minor':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'maintenance':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-64"></div>
                  <div className="h-4 bg-gray-100 rounded w-40"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!incidentArray.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No incidents</h3>
        <p className="mt-2 text-gray-500 max-w-sm mx-auto">Your services are running smoothly. Create a new incident if you detect any issues.</p>
      </div>
    );
  }

  // Mobile/tablet card view
  const renderMobileView = () => (
    <div className="space-y-4 overflow-x-auto px-1">
      {incidentArray.map((incident) => (
        <div key={incident.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-3">
            <Link to={`/incidents/${incident.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
              {incident.title}
            </Link>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(incident.impact)}`}>
              {incident.impact}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 my-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>
              <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(incident.status)}`}>
                {incident.status}
              </span>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-500">Services</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {incident.services?.map(({ service }) => (
                  <span 
                    key={service.id}
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs
                      ${service.status === 'OUTAGE' ? 'bg-red-50 text-red-700 border border-red-200' :
                      service.status === 'DEGRADED' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      service.status === 'MAINTENANCE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-green-50 text-green-700 border border-green-200'}`}
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="my-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Timeline</p>
            <div className="flex flex-col text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span>Started: {format(new Date(incident.startsAt), 'MMM d, HH:mm')}</span>
              </div>
              {incident.resolvedAt && (
                <div className="flex items-center space-x-1 mt-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Resolved: {format(new Date(incident.resolvedAt), 'MMM d, HH:mm')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 border-t border-gray-100 pt-3 flex justify-end space-x-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(incident)}
                className="text-blue-600 hover:text-blue-900 text-sm"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(incident)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Incident
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timeline
            </th>
            <th scope="col" className="relative px-6 py-3.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {incidentArray.map((incident) => (
            <tr key={incident.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <Link to={`/incidents/${incident.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                    {incident.title}
                  </Link>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(incident.impact)}`}>
                    {incident.impact}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {incident.services?.map(({ service }) => (
                    <span 
                      key={service.id}
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs
                        ${service.status === 'OUTAGE' ? 'bg-red-50 text-red-700 border border-red-200' :
                        service.status === 'DEGRADED' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        service.status === 'MAINTENANCE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-green-50 text-green-700 border border-green-200'}`}
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(incident.status)}`}>
                  {incident.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span>Started: {format(new Date(incident.startsAt), 'MMM d, HH:mm')}</span>
                  </div>
                  {incident.resolvedAt && (
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Resolved: {format(new Date(incident.resolvedAt), 'MMM d, HH:mm')}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="flex justify-end space-x-3">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(incident)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(incident)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile view (hidden on lg screens) */}
      <div className="lg:hidden overflow-x-auto">
        {renderMobileView()}
      </div>
      
      {/* Desktop view (hidden on smaller screens) */}
      <div className="hidden lg:block overflow-x-auto">
        {renderDesktopView()}
      </div>
    </div>
  );
};