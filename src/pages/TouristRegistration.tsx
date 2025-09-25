import React, { useState } from 'react';
import { User, Mail, Phone, FileText, Users, MapPin, QrCode, Blocks as Blockchain, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';
import type { Page } from '../App';

interface TouristRegistrationProps {
  setCurrentPage: (page: Page) => void;
}

export function TouristRegistration({ setCurrentPage }: TouristRegistrationProps) {
  const { t } = useLanguage();
  const { register } = useUser();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    emergencyContact: '',
    itinerary: ''
  });

  const [digitalId, setDigitalId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const { data, error } = await register(formData.email, 'defaultPassword123', {
        name: formData.name,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        role: 'tourist'
      });

      if (error) {
        setError(error.message);
        setIsGenerating(false);
        return;
      }

      // Simulate blockchain ID generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedId = `DID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setDigitalId(generatedId);
      
      setIsGenerating(false);
      setStep(2);
    } catch (err) {
      setError('Registration failed. Please try again.');
      setIsGenerating(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-8">
              <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Registration Error
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => setError('')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Registration Successful!
              </h2>
              <p className="text-gray-600">
                Your digital ID has been generated and secured
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <QrCode className="h-24 w-24 text-gray-600" />
                </div>
              </div>
              <p className="font-mono text-lg font-semibold text-gray-900 mb-2">
                {digitalId}
              </p>
              <p className="text-sm text-gray-600">
                Your Digital Tourist ID
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('tourist-dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <Blockchain className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Creating Your Account
          </h2>
          <p className="text-gray-600 mb-6">
            Generating your secure digital identity...
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              {t('Tourist Registration')}
            </h1>
            <p className="text-blue-100 mt-2">
              Create your secure digital identity for safe travels
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    {t('Full Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    {t('Email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    {t('Phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {t('Passport/Aadhaar')}
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ID Number (Optional)"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  {t('Emergency Contact')}
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact number"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t('Planned Itinerary')}
                </label>
                <textarea
                  value={formData.itinerary}
                  onChange={(e) => handleInputChange('itinerary', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your travel plans"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Security Features:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Blockchain-secured digital identity</li>
                    <li>• End-to-end encryption</li>
                    <li>• Real-time location monitoring</li>
                    <li>• AI-powered anomaly detection</li>
                    <li>• Emergency SOS capabilities</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <QrCode className="h-5 w-5 inline mr-2" />
                  {t('Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
      name: formData.name,
      email: formData.email,
      role: 'tourist' as const,
      phone: formData.phone,
      digitalId: generatedId,
      emergencyContact: formData.emergencyContact,
      itinerary: formData.itinerary,
      location: { lat: 25.5941, lng: 85.1376 }, // Default to Patna
      status: 'active' as const
    };
    
    login(userData);
    setIsGenerating(false);
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Registration Successful!
              </h2>
              <p className="text-gray-600">
                Your digital ID has been generated and secured on the blockchain
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <QrCode className="h-24 w-24 text-gray-600" />
                </div>
              </div>
              <p className="font-mono text-lg font-semibold text-gray-900 mb-2">
                {digitalId}
              </p>
              <p className="text-sm text-gray-600">
                Your Blockchain-Verified Digital Tourist ID
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-8">
              <div>
                <strong>Status:</strong> Active
              </div>
              <div>
                <strong>Validity:</strong> During Trip
              </div>
              <div>
                <strong>Security:</strong> Blockchain Verified
              </div>
              <div>
                <strong>Emergency:</strong> SOS Enabled
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('tourist-dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <Blockchain className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Generating Your Digital ID
          </h2>
          <p className="text-gray-600 mb-6">
            Securing your identity on the blockchain...
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              {t('Tourist Registration')}
            </h1>
            <p className="text-blue-100 mt-2">
              Create your secure digital identity for safe travels
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    {t('Full Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    {t('Email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    {t('Phone')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {t('Passport/Aadhaar')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ID Number"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  {t('Emergency Contact')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact number"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t('Planned Itinerary')}
                </label>
                <textarea
                  required
                  value={formData.itinerary}
                  onChange={(e) => handleInputChange('itinerary', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your travel plans"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Security Features:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Blockchain-secured digital identity</li>
                    <li>• End-to-end encryption</li>
                    <li>• Real-time location monitoring</li>
                    <li>• AI-powered anomaly detection</li>
                    <li>• Emergency SOS capabilities</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <QrCode className="h-5 w-5 inline mr-2" />
                  {t('Generate Digital ID')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}