import React, { useEffect, useState } from 'react';
import { MapPin, Activity, Wifi, AlertTriangle, QrCode, Phone, Heart, Battery } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useSystem } from '../contexts/SystemContext';
import type { Page } from '../App';

interface TouristDashboardProps {
  setCurrentPage: (page: Page) => void;
}

export function TouristDashboard({ setCurrentPage }: TouristDashboardProps) {
  const { t } = useLanguage();
  const { user, updateUser } = useUser();
  const { addAlert } = useSystem();
  const [locationHistory, setLocationHistory] = useState<Array<{ lat: number; lng: number; timestamp: Date }>>([]);
  const [deviceStats, setDeviceStats] = useState({
    battery: 85,
    heartRate: 72,
    steps: 8432
  });

  // Simulate real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.location) {
        const newLocation = {
          lat: user.location.lat + (Math.random() - 0.5) * 0.001,
          lng: user.location.lng + (Math.random() - 0.5) * 0.001
        };
        updateUser({ location: newLocation });
        setLocationHistory(prev => [...prev, { ...newLocation, timestamp: new Date() }].slice(-10));
      }

      // Update device stats
      setDeviceStats(prev => ({
        battery: Math.max(20, prev.battery - Math.random() * 0.5),
        heartRate: 65 + Math.random() * 20,
        steps: prev.steps + Math.floor(Math.random() * 10)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [user, updateUser]);

  const handleSOS = () => {
    if (user) {
      addAlert({
        touristId: user.id,
        type: 'emergency',
        message: `Emergency SOS activated by ${user.name}`,
        location: user.location || { lat: 0, lng: 0 },
        severity: 'critical',
        status: 'active'
      });
      setCurrentPage('emergency');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please register first to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Digital ID: <span className="font-mono font-semibold">{user.digitalId}</span>
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center text-green-600">
                <Activity className="h-5 w-5 mr-2" />
                <span className="font-semibold">{t('Active')}</span>
              </div>
              <button
                onClick={() => setCurrentPage('iot')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Wifi className="h-4 w-4 inline mr-2" />
                IoT Device
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Status */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Current Status</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Location</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.location?.lat.toFixed(4)}, {user.location?.lng.toFixed(4)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Patna, Bihar</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Trip Status</h3>
                  <p className="text-sm text-blue-600 font-semibold">Active</p>
                  <p className="text-xs text-gray-600 mt-1">Day 2 of 5</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Wifi className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">IoT Device</h3>
                  <p className="text-sm text-purple-600 font-semibold">{t('Connected')}</p>
                  <p className="text-xs text-gray-600 mt-1">Battery: {deviceStats.battery.toFixed(0)}%</p>
                </div>
              </div>
            </div>

            {/* Live Map Simulation */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Live Location Tracking</h2>
              <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative inline-block">
                    <MapPin className="h-12 w-12 text-blue-600 animate-pulse" />
                    <div className="absolute -top-2 -right-2 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <p className="mt-4 text-gray-700 font-semibold">You are here</p>
                  <p className="text-sm text-gray-600">Gandhi Maidan, Patna</p>
                  <div className="mt-4 flex justify-center space-x-4 text-xs text-gray-600">
                    <div>Safe Zone: ✓</div>
                    <div>Last Update: Just now</div>
                  </div>
                </div>
                
                {/* Animated ripple effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
                  <div className="absolute h-12 w-12 bg-blue-400 rounded-full opacity-40 animate-ping" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
              <div className="space-y-4">
                {locationHistory.slice(-5).map((location, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Location Update
                      </p>
                      <p className="text-xs text-gray-600">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {location.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Emergency SOS */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-6 text-white">
              <h2 className="text-xl font-bold mb-4">{t('Emergency Alert')}</h2>
              <p className="text-red-100 mb-6 text-sm">
                Press the button below if you need immediate assistance
              </p>
              <button
                onClick={handleSOS}
                className="w-full bg-white text-red-600 hover:bg-red-50 py-4 px-6 rounded-lg font-bold text-lg transition-colors shadow-lg"
              >
                <AlertTriangle className="h-6 w-6 inline mr-2" />
                {t('Send SOS')}
              </button>
              <p className="text-xs text-red-200 mt-3 text-center">
                This will alert authorities immediately
              </p>
            </div>

            {/* Digital ID Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Digital ID</h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border">
                <div className="flex justify-center mb-4">
                  <QrCode className="h-16 w-16 text-gray-600" />
                </div>
                <p className="text-center font-mono text-sm font-semibold text-gray-900 mb-2">
                  {user.digitalId}
                </p>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-semibold">Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security:</span>
                    <span className="text-blue-600 font-semibold">Blockchain</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Until:</span>
                    <span>Trip End</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Monitor */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Health Monitor</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-sm font-medium">Heart Rate</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {deviceStats.heartRate.toFixed(0)} BPM
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm font-medium">Steps Today</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {deviceStats.steps.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Battery className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium">Device Battery</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {deviceStats.battery.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Emergency Contacts</h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Tourism Helpline</p>
                    <p className="text-xs text-gray-600">1363</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Police Emergency</p>
                    <p className="text-xs text-gray-600">100</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Personal Contact</p>
                    <p className="text-xs text-gray-600">{user.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}