import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, MapPin, Activity, FileText, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSystem } from '../contexts/SystemContext';
import type { Page } from '../App';

interface AuthorityDashboardProps {
  setCurrentPage: (page: Page) => void;
}

export function AuthorityDashboard({ setCurrentPage }: AuthorityDashboardProps) {
  const { t } = useLanguage();
  const { alerts, touristLocations, acknowledgeAlert, resolveAlert } = useSystem();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [stats, setStats] = useState({
    activeTourists: 0,
    riskAlerts: 0,
    recentIncidents: 0,
    resolvedCases: 0
  });

  useEffect(() => {
    setStats({
      activeTourists: touristLocations.length,
      riskAlerts: alerts.filter(a => a.status === 'active' && (a.severity === 'high' || a.severity === 'critical')).length,
      recentIncidents: alerts.filter(a => a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
      resolvedCases: alerts.filter(a => a.status === 'resolved').length
    });
  }, [alerts, touristLocations]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const generateEFIR = (alert: any) => {
    const firId = `FIR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    console.log(`Generated E-FIR ${firId} for alert ${alert.id}`);
    resolveAlert(alert.id);
    alert(`E-FIR ${firId} generated successfully for the incident.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('Authority Dashboard')}
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time tourist safety monitoring and incident management
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('Active Tourists')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTourists}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-green-600 text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span>Real-time tracking</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('Risk Alerts')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.riskAlerts}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-red-600 text-sm">
                <Eye className="h-4 w-4 mr-1" />
                <span>Requires attention</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('Recent Incidents')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentIncidents}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-orange-600 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>Last 24 hours</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedCases}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>All time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Live Alerts */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Live Alerts
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(alert.status)}`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        Tourist ID: {alert.touristId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {alert.status === 'active' && (
                        <>
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => generateEFIR(alert)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Generate E-FIR
                          </button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tourist Heat Map */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Tourist Heat Map
            </h2>
            <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-80 p-4">
              <div className="absolute inset-4 flex flex-col justify-between">
                <div className="text-sm font-semibold text-gray-700">Northeast Region - Tourist Distribution</div>
                
                {/* Mock heat map visualization */}
                <div className="grid grid-cols-8 gap-1 h-full">
                  {Array.from({ length: 64 }, (_, i) => {
                    const intensity = Math.random();
                    let bgColor = 'bg-gray-200';
                    if (intensity > 0.7) bgColor = 'bg-red-500';
                    else if (intensity > 0.4) bgColor = 'bg-orange-400';
                    else if (intensity > 0.2) bgColor = 'bg-yellow-300';
                    else if (intensity > 0.1) bgColor = 'bg-green-300';
                    
                    return (
                      <div key={i} className={`${bgColor} rounded opacity-70`}></div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-300 rounded mr-1"></div>
                      <span>Low</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-300 rounded mr-1"></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-400 rounded mr-1"></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                      <span>Critical</span>
                    </div>
                  </div>
                  <div>
                    Total: {touristLocations.length} tourists
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">
                  {touristLocations.filter(t => t.status === 'safe').length}
                </p>
                <p className="text-sm text-gray-600">Safe Zone</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-lg font-bold text-yellow-600">
                  {touristLocations.filter(t => t.status === 'warning').length}
                </p>
                <p className="text-sm text-gray-600">Warning Zone</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-lg font-bold text-red-600">
                  {touristLocations.filter(t => t.status === 'danger').length}
                </p>
                <p className="text-sm text-gray-600">Danger Zone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tourist Activities */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Tourist Activities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-900">Tourist ID</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Name</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Location</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Last Update</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {touristLocations.slice(0, 10).map((tourist) => (
                  <tr key={tourist.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{tourist.id}</td>
                    <td className="p-3 font-medium">{tourist.name}</td>
                    <td className="p-3 text-gray-600">
                      {tourist.location.lat.toFixed(4)}, {tourist.location.lng.toFixed(4)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tourist.status === 'safe' ? 'text-green-600 bg-green-100' :
                        tourist.status === 'warning' ? 'text-yellow-600 bg-yellow-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {tourist.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {tourist.lastUpdate.toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}