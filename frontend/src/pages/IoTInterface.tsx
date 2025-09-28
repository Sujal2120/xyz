import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Heart, Activity, Thermometer, MapPin, AlertTriangle, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useSystem } from '../contexts/SystemContext';
import type { Page } from '../App';

interface IoTInterfaceProps {
  setCurrentPage: (page: Page) => void;
}

export function IoTInterface({ setCurrentPage }: IoTInterfaceProps) {
  const { t } = useLanguage();
  const { user } = useUser();
  const { addAlert } = useSystem();
  const [deviceStats, setDeviceStats] = useState({
    battery: 75,
    heartRate: 72,
    temperature: 98.6,
    steps: 8432,
    altitude: 1200,
    connected: true,
    lastSync: new Date()
  });

  const [healthAlerts, setHealthAlerts] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    severity: string;
  }>>([]);

  // Simulate real-time IoT data
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceStats(prev => {
        const newStats = {
          ...prev,
          battery: Math.max(0, prev.battery - Math.random() * 0.2),
          heartRate: 65 + Math.random() * 30,
          temperature: 97 + Math.random() * 3,
          steps: prev.steps + Math.floor(Math.random() * 20),
          altitude: 1150 + Math.random() * 100,
          lastSync: new Date()
        };

        // Generate health alerts
        if (newStats.heartRate > 100 && Math.random() < 0.1) {
          const alert = {
            id: `health-${Date.now()}`,
            type: 'heart_rate',
            message: `Elevated heart rate detected: ${newStats.heartRate.toFixed(0)} BPM`,
            timestamp: new Date(),
            severity: 'medium'
          };
          setHealthAlerts(prevAlerts => [alert, ...prevAlerts].slice(0, 10));
        }

        if (newStats.battery < 20 && Math.random() < 0.1) {
          const alert = {
            id: `battery-${Date.now()}`,
            type: 'battery',
            message: `Low battery warning: ${newStats.battery.toFixed(0)}%`,
            timestamp: new Date(),
            severity: 'low'
          };
          setHealthAlerts(prevAlerts => [alert, ...prevAlerts].slice(0, 10));
        }

        return newStats;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sendSOSFromDevice = () => {
    if (user) {
      addAlert({
        touristId: user.id,
        type: 'emergency',
        message: `SOS alert from IoT device - ${user.name} needs immediate assistance`,
        location: user.location || { lat: 25.5941, lng: 85.1376 },
        severity: 'critical',
        status: 'active'
      });
      setCurrentPage('emergency');
    }
  };

  const getHeartRateColor = (hr: number) => {
    if (hr > 100) return 'text-red-600';
    if (hr < 60) return 'text-blue-600';
    return 'text-green-600';
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                IoT Safety Device Interface
              </h1>
              <p className="text-gray-600 mt-1">
                Smart wearable device monitoring for enhanced tourist safety
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${deviceStats.connected ? 'text-green-600' : 'text-red-600'}`}>
                <Wifi className="h-5 w-5 mr-2" />
                <span className="font-semibold">
                  {deviceStats.connected ? t('Connected') : 'Disconnected'}
                </span>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Device Status */}
          <div className="lg:col-span-2 space-y-8">
            {/* Real-time Vitals */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Real-time Health Monitoring</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Heart className={`h-8 w-8 mx-auto mb-3 ${getHeartRateColor(deviceStats.heartRate)}`} />
                  <h3 className="font-semibold text-gray-900">Heart Rate</h3>
                  <p className={`text-2xl font-bold ${getHeartRateColor(deviceStats.heartRate)}`}>
                    {deviceStats.heartRate.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-600">BPM</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Thermometer className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Temperature</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {deviceStats.temperature.toFixed(1)}°F
                  </p>
                  <p className="text-sm text-gray-600">Body Temp</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Steps</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {deviceStats.steps.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Today</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Altitude</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {deviceStats.altitude.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-600">Meters</p>
                </div>
              </div>
            </div>

            {/* Device Status Grid */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Device Status</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Battery className={`h-5 w-5 mr-3 ${getBatteryColor(deviceStats.battery)}`} />
                      <span className="font-medium">Battery Level</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${getBatteryColor(deviceStats.battery)}`}>
                        {deviceStats.battery.toFixed(0)}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            deviceStats.battery > 50 ? 'bg-green-500' :
                            deviceStats.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${deviceStats.battery}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Wifi className="h-5 w-5 mr-3 text-green-600" />
                      <span className="font-medium">Connection Status</span>
                    </div>
                    <span className="text-green-600 font-semibold">Strong</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="font-medium">Data Sync</span>
                    </div>
                    <span className="text-blue-600 font-semibold">Real-time</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">GPS Tracking</h3>
                    <p className="text-sm text-gray-600 mb-2">Continuous location monitoring</p>
                    <div className="flex items-center text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-semibold">Active</span>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Geofencing</h3>
                    <p className="text-sm text-gray-600 mb-2">Safe zone boundaries</p>
                    <div className="flex items-center text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-semibold">Within Safe Zone</span>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Environmental</h3>
                    <p className="text-sm text-gray-600 mb-2">Weather & air quality</p>
                    <div className="flex items-center text-yellow-600">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm font-semibold">Monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Alerts */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Health & Safety Alerts</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {healthAlerts.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No alerts - All systems normal</p>
                ) : (
                  healthAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{alert.message}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          alert.severity === 'critical' ? 'text-red-600 bg-red-100' :
                          alert.severity === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                          'text-blue-600 bg-blue-100'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-8">
            {/* Manual SOS */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-6 text-white">
              <h2 className="text-xl font-bold mb-4">{t('Manual SOS')}</h2>
              <p className="text-red-100 mb-6 text-sm">
                Emergency button with immediate alert dispatch
              </p>
              <button
                onClick={sendSOSFromDevice}
                className="w-full bg-white text-red-600 hover:bg-red-50 py-4 px-6 rounded-lg font-bold text-lg transition-colors shadow-lg"
              >
                <AlertTriangle className="h-6 w-6 inline mr-2" />
                DEVICE SOS
              </button>
              <p className="text-xs text-red-200 mt-3 text-center">
                Sends GPS location & health data
              </p>
            </div>

            {/* Device Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Device Information</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-semibold">SafeTravel Band Pro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Serial:</span>
                  <span className="font-mono">STB-2024-{user?.id?.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Firmware:</span>
                  <span className="font-semibold">v2.1.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="font-semibold">
                    {deviceStats.lastSync.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signal Strength:</span>
                  <span className="font-semibold text-green-600">Excellent</span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Features</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Continuous heart rate monitoring</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span>GPS location tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Fall detection</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Geofence alerts</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Emergency SOS</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Two-way communication</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Weather monitoring</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Activity tracking</span>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Data Sync Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Health Data</span>
                  <span className="text-green-600 font-semibold">Synced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location Data</span>
                  <span className="text-green-600 font-semibold">Synced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Activity Data</span>
                  <span className="text-green-600 font-semibold">Synced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Emergency Contacts</span>
                  <span className="text-blue-600 font-semibold">Updated</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Next sync in 30 seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}