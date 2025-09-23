import React from 'react';
import { Shield, Menu, Globe, User, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { ThemeToggle } from './ThemeToggle';
import type { Page } from '../App';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useUser();

  return (
    <header className="theme-bg-primary border-b theme-border shadow-sm theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold theme-text-primary">
              {t('SafeTravel Monitor')}
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`px-3 py-2 text-sm font-medium rounded-md theme-transition ${
                currentPage === 'landing'
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                  : 'theme-text-secondary hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {t('Home')}
            </button>
            
            {!user && (
              <button
                onClick={() => setCurrentPage('register')}
                className={`px-3 py-2 text-sm font-medium rounded-md theme-transition ${
                  currentPage === 'register'
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                    : 'theme-text-secondary hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {t('Register')}
              </button>
            )}

            {user?.role === 'tourist' && (
              <button
                onClick={() => setCurrentPage('tourist-dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md theme-transition ${
                  currentPage === 'tourist-dashboard'
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                    : 'theme-text-secondary hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {t('My Dashboard')}
              </button>
            )}

            {user?.role === 'authority' && (
              <button
                onClick={() => setCurrentPage('authority-dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md theme-transition ${
                  currentPage === 'authority-dashboard'
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                    : 'theme-text-secondary hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {t('Authority Dashboard')}
              </button>
            )}

            <button
              onClick={() => setCurrentPage('emergency')}
              className={`px-3 py-2 text-sm font-medium rounded-md theme-transition ${
                currentPage === 'emergency'
                  ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {t('SOS')}
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm theme-input rounded-md theme-transition theme-focus-visible"
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
                <User className="h-5 w-5 theme-text-secondary" />
                <span className="text-sm theme-text-primary">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 theme-transition"
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