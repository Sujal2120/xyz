import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tourist' | 'authority';
  phone?: string;
  digitalId?: string;
  emergencyContact?: string;
  itinerary?: string;
  location?: { lat: number; lng: number };
  status?: 'active' | 'inactive' | 'alert';
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  register: (email: string, password: string, userData: any) => Promise<any>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = (userData: User) => {
    setUser(userData);
  };

  const register = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, data: userData };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser, register, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}