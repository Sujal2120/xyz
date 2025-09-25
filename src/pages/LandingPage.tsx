import React from 'react';
import { Shield, Eye, MapPin, Zap, Users, Globe, Lock, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { DemoData } from '../components/DemoData';
import type { Page } from '../App';

interface LandingPageProps {
  setCurrentPage: (page: Page) => void;
}

export function LandingPage({ setCurrentPage }: LandingPageProps) {
  const { t } = useLanguage();
  const { login } = useUser();

  const handleAuthorityLogin = () => {
    // For demo purposes, simulate authority login
    console.log('Authority login - would redirect to login form');
    setCurrentPage('authority-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Shield className="h-24 w-24 text-blue-600" />
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('Smart Tourist Safety Monitoring')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('Ensuring safe travels with AI-powered monitoring and rapid emergency response')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentPage('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t('Get Started')}
              </button>
              <button
                onClick={handleAuthorityLogin}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t('Authority Login')}
              </button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="h-4 w-4 bg-blue-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-32 right-16 animate-pulse">
          <div className="h-6 w-6 bg-teal-400 rounded-full opacity-40"></div>
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="h-3 w-3 bg-orange-400 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Safety Features
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive protection powered by cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('Digital ID Generation')}
              </h3>
              <p className="text-gray-600 text-sm">
                Blockchain-secured digital identity with QR verification and tamper-proof records
              </p>
            </div>

            <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('AI Anomaly Detection')}
              </h3>
              <p className="text-gray-600 text-sm">
                Smart algorithms detect unusual patterns and potential risks in real-time
              </p>
            </div>

            <div className="group p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('Real-time Monitoring')}
              </h3>
              <p className="text-gray-600 text-sm">
                Continuous location tracking with geo-fencing and heat map visualization
              </p>
            </div>

            <div className="group p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('Emergency Response')}
              </h3>
              <p className="text-gray-600 text-sm">
                Instant SOS alerts with automated E-FIR generation and rapid response coordination
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-User Support</h3>
              <p className="text-gray-600 text-sm">Tourist and authority dashboards with role-based access</p>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">10+ Languages</h3>
              <p className="text-gray-600 text-sm">Full multilingual support including Indian regional languages</p>
            </div>
            <div className="text-center">
              <Lock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Data Security</h3>
              <p className="text-gray-600 text-sm">End-to-end encryption with blockchain identity verification</p>
            </div>
            <div className="text-center">
              <Smartphone className="h-12 w-12 text-teal-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">IoT Integration</h3>
              <p className="text-gray-600 text-sm">Smart wearables with health monitoring and SOS features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Data Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DemoData />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Safe Travel?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of tourists who trust our AI-powered safety system
          </p>
          <button
            onClick={() => setCurrentPage('register')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Start Your Safe Journey
          </button>
        </div>
      </div>
    </div>
  );
}