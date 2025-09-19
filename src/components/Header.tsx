import React from 'react';
import { Shield, Menu, Globe, User, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import type { Page } from '../App';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useUser();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">
              {t('SafeTravel Monitor')}
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentPage === 'landing'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('Home')}
            </button>
            
            {!user && (
              <button
                onClick={() => setCurrentPage('register')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 'register'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t('Register')}
              </button>
            )}

            {user?.role === 'tourist' && (
              <button
                onClick={() => setCurrentPage('tourist-dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 'tourist-dashboard'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t('My Dashboard')}
              </button>
            )}

            {user?.role === 'authority' && (
              <button
                onClick={() => setCurrentPage('authority-dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 'authority-dashboard'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t('Authority Dashboard')}
              </button>
            )}

            <button
              onClick={() => setCurrentPage('emergency')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentPage === 'emergency'
                  ? 'text-red-600 bg-red-50'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {t('SOS')}
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="te">తెలుగు</option>
              <option value="mr">मराठी</option>
              <option value="ta">தமிழ்</option>
              <option value="gu">ગુજરાતી</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="ml">മലയാളം</option>
              <option value="or">ଓଡ଼ିଆ</option>
              <option value="as">অসমীয়া</option>
            </select>

            {user && (
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t('Logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}