import React from 'react';
import { Database, Users, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

export function DemoData() {
  const demoStats = {
    totalTourists: 1247,
    activeTourists: 892,
    safeZones: 25,
    incidents: 12,
    resolved: 8
  };

  const recentIncidents = [
    {
      id: 1,
      tourist: 'Rahul Sharma',
      type: 'Medical Emergency',
      location: 'India Gate, Delhi',
      status: 'Resolved',
      time: '2 hours ago'
    },
    {
      id: 2,
      tourist: 'Priya Patel',
      type: 'Lost Tourist',
      location: 'Red Fort, Delhi',
      status: 'Active',
      time: '45 minutes ago'
    },
    {
      id: 3,
      tourist: 'John Smith',
      type: 'Theft Report',
      location: 'Gateway of India, Mumbai',
      status: 'Acknowledged',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="flex items-center mb-6">
        <Database className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">
          System Demo Data (Simulated)
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{demoStats.totalTourists}</p>
          <p className="text-sm text-gray-600">Total Tourists</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{demoStats.activeTourists}</p>
          <p className="text-sm text-gray-600">Active Now</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{demoStats.safeZones}</p>
          <p className="text-sm text-gray-600">Safe Zones</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-600">{demoStats.incidents}</p>
          <p className="text-sm text-gray-600">Incidents</p>
        </div>
        <div className="text-center p-4 bg-teal-50 rounded-lg">
          <CheckCircle className="h-8 w-8 text-teal-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-teal-600">{demoStats.resolved}</p>
          <p className="text-sm text-gray-600">Resolved</p>
        </div>
      </div>

      {/* Recent Incidents */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents (Demo)</h3>
        <div className="space-y-3">
          {recentIncidents.map((incident) => (
            <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{incident.tourist}</p>
                <p className="text-sm text-gray-600">{incident.type} • {incident.location}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  incident.status === 'Resolved' ? 'text-green-600 bg-green-100' :
                  incident.status === 'Active' ? 'text-red-600 bg-red-100' :
                  'text-yellow-600 bg-yellow-100'
                }`}>
                  {incident.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">{incident.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is demo data for demonstration purposes. 
          Connect to your Supabase project to see real data.
        </p>
      </div>
    </div>
  );
}