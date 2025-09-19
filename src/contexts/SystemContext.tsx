import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Alert {
  id: string;
  touristId: string;
  type: 'anomaly' | 'emergency' | 'location_drop' | 'inactivity';
  message: string;
  location: { lat: number; lng: number };
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface TouristLocation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  status: 'safe' | 'warning' | 'danger';
  lastUpdate: Date;
}

interface SystemContextType {
  alerts: Alert[];
  touristLocations: TouristLocation[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  updateTouristLocation: (location: TouristLocation) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [touristLocations, setTouristLocations] = useState<TouristLocation[]>([]);

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate mock alerts and location updates
      if (Math.random() < 0.3) {
        const mockAlert: Omit<Alert, 'id' | 'timestamp'> = {
          touristId: `tourist-${Math.floor(Math.random() * 100)}`,
          type: ['anomaly', 'location_drop', 'inactivity'][Math.floor(Math.random() * 3)] as any,
          message: 'Anomaly detected in tourist movement pattern',
          location: { lat: 25.5941 + Math.random() * 0.1, lng: 85.1376 + Math.random() * 0.1 },
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: 'active'
        };
        addAlert(mockAlert);
      }

      // Update tourist locations
      const mockLocation: TouristLocation = {
        id: `tourist-${Math.floor(Math.random() * 50)}`,
        name: `Tourist ${Math.floor(Math.random() * 50) + 1}`,
        location: { lat: 25.5941 + Math.random() * 0.2, lng: 85.1376 + Math.random() * 0.2 },
        status: ['safe', 'warning', 'danger'][Math.floor(Math.random() * 3)] as any,
        lastUpdate: new Date()
      };
      updateTouristLocation(mockLocation);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addAlert = (alertData: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep only latest 50
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: 'acknowledged' } : alert
    ));
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: 'resolved' } : alert
    ));
  };

  const updateTouristLocation = (location: TouristLocation) => {
    setTouristLocations(prev => {
      const existing = prev.find(l => l.id === location.id);
      if (existing) {
        return prev.map(l => l.id === location.id ? location : l);
      } else {
        return [location, ...prev].slice(0, 100); // Keep only latest 100
      }
    });
  };

  return (
    <SystemContext.Provider value={{
      alerts,
      touristLocations,
      addAlert,
      acknowledgeAlert,
      resolveAlert,
      updateTouristLocation
    }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}