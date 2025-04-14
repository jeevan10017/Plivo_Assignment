import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import apiClient from '../api/api.client.ts';

// Define the API calls
const publicApi = {
  getOrganizations: async () => {
    return apiClient.get('/public/organizations');
  },
  getServices: async (orgSlug) => {
    return apiClient.get(`/public/${orgSlug}/services`);
  },
  getIncidents: async (orgSlug) => {
    return apiClient.get(`/public/${orgSlug}/incidents`);
  },
  getMaintenances: async (orgSlug) => {
    return apiClient.get(`/public/${orgSlug}/maintenances`);
  }
};

export const PublicStatusPage = () => {
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [organizations, setOrganizations] = useState([]);
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState({
    orgs: true,
    data: false
  });
  const [error, setError] = useState(null);
  const [overallStatus, setOverallStatus] = useState('OPERATIONAL');
  const [selectedOrg, setSelectedOrg] = useState(null);

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(prev => ({ ...prev, orgs: true }));
      try {
        const response = await publicApi.getOrganizations();
        setOrganizations(response.data.organizations);
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
        setError('Failed to load organizations');
      } finally {
        setLoading(prev => ({ ...prev, orgs: false }));
      }
    };
    fetchOrganizations();
  }, []);

  // Determine if we should fetch org details based on URL path
  useEffect(() => {
    // If we have a slug in the URL params, set it as the selected org
    if (orgSlug) {
      setSelectedOrg(orgSlug);
    } else {
      // If we're on the main page with no slug, clear selected org
      setSelectedOrg(null);
    }
  }, [orgSlug, location.pathname]);

  // Fetch data when selected org changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedOrg) return;
      
      setLoading(prev => ({ ...prev, data: true }));
      setError(null);

      try {
        // Fetch all data in parallel
        const [servicesResp, incidentsResp, maintenancesResp] = await Promise.all([
          publicApi.getServices(selectedOrg),
          publicApi.getIncidents(selectedOrg),
          publicApi.getMaintenances(selectedOrg)
        ]);

        setServices(servicesResp.data.services);
        setIncidents(incidentsResp.data.activeIncidents);
        setMaintenances(maintenancesResp.data.maintenances);
        
        // Determine overall status
        if (incidentsResp.data.activeIncidents.some(i => i.impact === 'MAJOR')) {
          setOverallStatus('OUTAGE');
        } else if (incidentsResp.data.activeIncidents.length > 0) {
          setOverallStatus('DEGRADED');
        } else if (maintenancesResp.data.maintenances.some(m => m.status === 'IN_PROGRESS')) {
          setOverallStatus('MAINTENANCE');
        } else {
          setOverallStatus('OPERATIONAL');
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load status data');
      } finally {
        setLoading(prev => ({ ...prev, data: false }));
      }
    };

    fetchData();
  }, [selectedOrg]);

  const handleOrganizationSelect = (slug) => {
    navigate(`/public/${slug}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPERATIONAL': return 'bg-green-500';
      case 'DEGRADED': return 'bg-yellow-500';
      case 'OUTAGE': return 'bg-red-500';
      case 'MAINTENANCE': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusBg = (status) => {
    switch (status) {
      case 'OPERATIONAL': return 'bg-green-50 border-green-200';
      case 'DEGRADED': return 'bg-yellow-50 border-yellow-200';
      case 'OUTAGE': return 'bg-red-50 border-red-200';
      case 'MAINTENANCE': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'OPERATIONAL': return 'All Systems Operational';
      case 'DEGRADED': return 'Some Systems Degraded';
      case 'OUTAGE': return 'System Outage Detected';
      case 'MAINTENANCE': return 'Maintenance In Progress';
      default: return 'Status Unknown';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Default organization status to OPERATIONAL
  const getOrgStatus = () => 'OPERATIONAL';

  const renderOrganizationList = () => (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Organizations</h2>
      
      {loading.orgs ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Organizations Found</h3>
          <p className="text-gray-500">No organizations are currently available in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map(org => {
            const status = getOrgStatus();
            return (
              <div 
                key={org.slug}
                onClick={() => handleOrganizationSelect(org.slug)}
                className={`cursor-pointer rounded-xl shadow-md p-6 border transition-all hover:shadow-lg ${getStatusBg(status)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{org.name}</h3>
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(status)}`}></div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>Created: {new Date(org.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    status === 'OPERATIONAL' ? 'bg-green-100 text-green-800' :
                    status === 'DEGRADED' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'OUTAGE' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {getStatusText(status)}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Status →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderOrganizationDetail = () => (
    <>
      {/* Back button */}
      <button 
        onClick={() => navigate('/public')}
        className="flex items-center mb-6 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Organizations
      </button>
      
      {/* Organization Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {organizations.find(org => org.slug === selectedOrg)?.name || selectedOrg}
        </h2>
      </div>
      
      {/* Overall Status Banner */}
      <div className={`mb-10 rounded-lg shadow-md p-6 text-center ${
        overallStatus === 'OPERATIONAL' ? 'bg-green-50 border border-green-100' :
        overallStatus === 'DEGRADED' ? 'bg-yellow-50 border border-yellow-100' :
        overallStatus === 'OUTAGE' ? 'bg-red-50 border border-red-100' :
        'bg-blue-50 border border-blue-100'
      }`}>
        <div className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(overallStatus)}`}></div>
        <h2 className={`text-2xl font-bold ${
          overallStatus === 'OPERATIONAL' ? 'text-green-700' :
          overallStatus === 'DEGRADED' ? 'text-yellow-700' :
          overallStatus === 'OUTAGE' ? 'text-red-700' :
          'text-blue-700'
        }`}>
          {getStatusText(overallStatus)}
        </h2>
        <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleString()}</p>
      </div>

      {/* Services Grid */}
      <section className="mb-12 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Services Status</h2>
        {services.length === 0 ? (
          <div className="bg-gray-50 p-5 rounded-lg text-gray-700 flex items-center justify-center">
            <p>No services available for this organization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <div key={service.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className={`w-4 h-4 rounded-full mr-3 ${getStatusColor(service.status)}`}></div>
                  <h3 className="font-semibold text-gray-800 text-lg">{service.name}</h3>
                </div>
                {service.description && (
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                )}
                <div className="flex justify-between items-center">
                  {service.groupName && (
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      {service.groupName}
                    </span>
                  )}
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    service.status === 'OPERATIONAL' ? 'bg-green-100 text-green-800' :
                    service.status === 'DEGRADED' ? 'bg-yellow-100 text-yellow-800' :
                    service.status === 'OUTAGE' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {service.status}
                  </span>
                </div>
                {service.statusHistory && service.statusHistory.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500">
                    Last updated: {formatDateTime(service.statusHistory[0].createdAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Incidents */}
      <section className="mb-12">
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">Active Incidents</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {incidents.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">All Systems Operational</h3>
                <p className="text-gray-600">No active incidents at this time.</p>
              </div>
            </div>
          </div>
        ) : (
          incidents.map(incident => (
            <div key={incident.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-2 bg-red-500 w-full"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{incident.title}</h3>
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    {incident.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Impact:</span> {incident.impact}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Started:</span> {formatDateTime(incident.startsAt)}
                  </p>
                </div>
                
                {incident.updates && incident.updates[0]?.message && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                    <p className="text-sm text-gray-800 italic">"{incident.updates[0].message}"</p>
                  </div>
                )}
                
                {incident.services && incident.services.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Affected services:</p>
                    <div className="flex flex-wrap gap-2">
                      {incident.services.map(({ service }) => (
                        <span 
                          key={service.id}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>

    {/* Scheduled Maintenance */}
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">Scheduled Maintenance</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {maintenances.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">No Scheduled Maintenance</h3>
                <p className="text-gray-600">There are no upcoming maintenance windows planned.</p>
              </div>
            </div>
          </div>
        ) : (
          maintenances.map(maintenance => (
            <div key={maintenance.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-2 bg-blue-500 w-full"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{maintenance.title}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {maintenance.status}
                  </span>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Scheduled:</span>{' '}
                      {formatDateTime(maintenance.scheduledStart)}
                    </p>
                  </div>
                  <div className="flex items-center mt-2">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Estimated end:</span>{' '}
                      {formatDateTime(maintenance.scheduledEnd)}
                    </p>
                  </div>
                </div>
                
                {maintenance.services && maintenance.services.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Affected services:</p>
                    <div className="flex flex-wrap gap-2">
                      {maintenance.services.map(({ service }) => (
                        <span
                          key={service.id}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
{/*     
    <p>This one Hard Coded</p>
    <section>
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">Past Incidents</h2>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="border-l-2 border-gray-200 pl-4">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
              <p className="text-sm text-gray-500">April 10, 2025</p>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">API Performance Degradation</h3>
            <p className="text-gray-600 text-sm">Resolved - The API performance issue has been fixed and all systems are operating normally.</p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
              <p className="text-sm text-gray-500">April 5, 2025</p>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Database Connectivity Issues</h3>
            <p className="text-gray-600 text-sm">Resolved - The database connectivity issues have been resolved after implementing network configuration changes.</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            View Incident History →
          </button>
        </div>
      </div>
    </section> */}
    </>
  );

  const renderContent = () => {
    if (loading.data && selectedOrg) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
          <p className="text-gray-600">Loading status data...</p>
        </div>
      );
    }

    if (selectedOrg) {
      return renderOrganizationDetail();
    }

    return renderOrganizationList();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Admin Login */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-blue-600"></div>
            <h1 className="text-xl font-bold text-gray-800">MONITOR </h1>
          </div>
          <a 
            href="/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Admin Sign In
          </a>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg mb-8 text-red-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {renderContent()}
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-gray-50 py-6 border-t border-gray-200">
  <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
    <p>© {new Date().getFullYear()} Monitor. All rights reserved.</p>
  </div>
</footer>

    </div>
  );
};
