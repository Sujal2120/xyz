import React, { useState } from 'react';
import { Shield, User, Phone, Mail, MapPin, FileText, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import type { Page } from '../App';

interface TouristRegistrationProps {
  setCurrentPage: (page: Page) => void;
}

export function TouristRegistration({ setCurrentPage }: TouristRegistrationProps) {
  const { t } = useLanguage();
  const { register } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    emergencyContact: '',
    itinerary: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate digital ID
      const digitalId = `DID-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // For demo purposes, simulate registration
      const userData = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: 'tourist' as const,
        phone: formData.phone,
        digitalId,
        emergencyContact: formData.emergencyContact,
        itinerary: formData.itinerary,
        location: { lat: 25.5941, lng: 85.1376 },
        status: 'active' as const
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, we'll just show success and redirect
      alert(`Registration successful! Your Digital ID: ${digitalId}`);
      setCurrentPage('tourist-dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('Tourist Registration')}
          </h1>
          <p className="text-lg text-gray-600">
            Register for secure travel monitoring and emergency assistance
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                {t('Full Name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                {t('Email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Create a secure password"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                {t('Phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="+91XXXXXXXXXX"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                {t('Emergency Contact')}
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Emergency contact number"
              />
            </div>

            {/* Planned Itinerary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                {t('Planned Itinerary')}
              </label>
              <textarea
                name="itinerary"
                value={formData.itinerary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Brief description of your travel plans..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Generating Digital ID...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  {t('Generate Digital ID')}
                </>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What you get with registration:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                Blockchain-secured Digital ID
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                Real-time location monitoring
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                Emergency SOS system
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                24/7 safety monitoring
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentPage('landing')}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}