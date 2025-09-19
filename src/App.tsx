import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { TouristRegistration } from './pages/TouristRegistration';
import { TouristDashboard } from './pages/TouristDashboard';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { EmergencyResponse } from './pages/EmergencyResponse';
import { IoTInterface } from './pages/IoTInterface';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider } from './contexts/UserContext';
import { SystemProvider } from './contexts/SystemContext';

export type Page = 'landing' | 'register' | 'tourist-dashboard' | 'authority-dashboard' | 'emergency' | 'iot';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  return (
    <LanguageProvider>
      <UserProvider>
        <SystemProvider>
          <div className="min-h-screen bg-gray-50">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            <main>
              {currentPage === 'landing' && <LandingPage setCurrentPage={setCurrentPage} />}
              {currentPage === 'register' && <TouristRegistration setCurrentPage={setCurrentPage} />}
              {currentPage === 'tourist-dashboard' && <TouristDashboard setCurrentPage={setCurrentPage} />}
              {currentPage === 'authority-dashboard' && <AuthorityDashboard setCurrentPage={setCurrentPage} />}
              {currentPage === 'emergency' && <EmergencyResponse setCurrentPage={setCurrentPage} />}
              {currentPage === 'iot' && <IoTInterface setCurrentPage={setCurrentPage} />}
            </main>
          </div>
        </SystemProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;