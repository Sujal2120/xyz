import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Clock, User, FileText, Send, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useSystem } from '../contexts/SystemContext';
import type { Page } from '../App';

interface EmergencyResponseProps {
  setCurrentPage: (page: Page) => void;
}

export function EmergencyResponse({ setCurrentPage }: EmergencyResponseProps) {
  const { t } = useLanguage();
  const { user } = useUser();
  const { addAlert } = useSystem();
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [responseTime, setResponseTime] = useState(0);

  useEffect(() => {
    if (emergencyActive) {
      const interval = setInterval(() => {
        setResponseTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [emergencyActive]);

  const activateEmergency = () => {
    if (user) {
      const currentLocation = user.location || { lat: 25.5941, lng: 85.1376 };
      setLocation(currentLocation);
      setEmergencyActive(true);
      
      addAlert({
        touristId: user.id,
        type: 'emergency',
        message: `EMERGENCY: ${user.name} has activated SOS alert`,
        location: currentLocation,
        severity: 'critical',
        status: 'active'
      });

      // Auto-generate E-FIR after 30 seconds
      setTimeout(() => {
        const firId = `E-FIR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        console.log(`Auto-generated E-FIR: ${firId}`);
      }, 30000);
    }
  };

  const sendMessage = () => {
    if (message.trim() && user) {
      addAlert({
        touristId: user.id,
        type: 'emergency',
        message: `Emergency Message from ${user.name}: ${message}`,
        location: location || { lat: 0, lng: 0 },
        severity: 'high',
        status: 'active'
      });
      setMessage('');
    }
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setResponseTime(0);
  };

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <AlertTriangle className="h-16 w-16 text-red-600" />
              {emergencyActive && (
                <div className="absolute inset-0 animate-ping">
                  <AlertTriangle className="h-16 w-16 text-red-400 opacity-75" />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-red-600 mb-2">
            {t('Emergency Response Center')}
          </h1>
          <p className="text-lg text-gray-700">
            24/7 Emergency assistance and rapid response system
          </p>
        </div>

        {!emergencyActive ? (
          /* Emergency Activation */
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Emergency Assistance
              </h2>
              <p className="text-gray-600 mb-6">
                Press the emergency button if you need immediate help. This will alert authorities and emergency services.
              </p>
              
              <button
                onClick={activateEmergency}
                className="bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-6 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 animate-pulse"
              >
                <AlertTriangle className="h-8 w-8 inline mr-3" />
                ACTIVATE EMERGENCY SOS
              </button>
              
              <p className="text-sm text-red-600 mt-4 font-semibold">
                ⚠️ Only use in genuine emergencies
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Instant Alert</h3>
                <p className="text-sm text-gray-600">
                  Immediately notifies police, tourism department, and emergency services
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('Location Tracking')}</h3>
                <p className="text-sm text-gray-600">
                  Your exact location is shared with rescue teams for rapid response
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Auto E-FIR</h3>
                <p className="text-sm text-gray-600">
                  Electronic FIR is automatically generated for official records
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Emergency */
          <div className="space-y-6">
            {/* Emergency Status */}
            <div className="bg-red-600 text-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <AlertTriangle className="h-10 w-10" />
                    <div className="absolute inset-0 animate-ping">
                      <AlertTriangle className="h-10 w-10 opacity-75" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">EMERGENCY ACTIVATED</h2>
                    <p className="text-red-100">Help is on the way</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-100 text-sm">Response Time</p>
                  <p className="text-3xl font-bold">
                    {Math.floor(responseTime / 60)}:{(responseTime % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-700 rounded-lg p-3 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Alert Sent</p>
                  <p className="text-xs">Authorities Notified</p>
                </div>
                <div className="bg-red-700 rounded-lg p-3 text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Location Shared</p>
                  <p className="text-xs">GPS Coordinates Sent</p>
                </div>
                <div className="bg-red-700 rounded-lg p-3 text-center">
                  <FileText className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm font-semibold">E-FIR Processing</p>
                  <p className="text-xs">Auto-generating...</p>
                </div>
              </div>
            </div>

            {/* User Information */}
            {user && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Digital ID</p>
                        <p className="font-mono text-sm">{user.digitalId}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-mono text-sm">
                          {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Communication */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Emergency Communication
              </h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send additional information to rescue team..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Services Contacted</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium">Police Control Room</span>
                  </div>
                  <span className="text-green-600 font-semibold">NOTIFIED</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium">Tourism Department</span>
                  </div>
                  <span className="text-green-600 font-semibold">NOTIFIED</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium">Medical Emergency</span>
                  </div>
                  <span className="text-green-600 font-semibold">STANDBY</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium">Emergency Contact: {user?.emergencyContact}</span>
                  </div>
                  <span className="text-yellow-600 font-semibold">CALLING...</span>
                </div>
              </div>
            </div>

            {/* Cancel Emergency */}
            <div className="text-center">
              <button
                onClick={cancelEmergency}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel Emergency Alert
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Only cancel if this was a false alarm
              </p>
            </div>
          </div>
        )}

        {/* Emergency Hotlines */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Hotlines</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Phone className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Police</p>
              <p className="text-xl font-bold text-red-600">100</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Phone className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Tourist Helpline</p>
              <p className="text-xl font-bold text-blue-600">1363</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Phone className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Medical</p>
              <p className="text-xl font-bold text-green-600">102</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}