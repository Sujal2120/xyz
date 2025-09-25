import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSupabase } from '../hooks/useSupabase';

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
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: supabaseUser, profile, loading, signUp, signIn, signOut } = useSupabase();
  
  const user = supabaseUser && profile ? {
    id: supabaseUser.id,
    name: profile.name,
    email: supabaseUser.email || '',
    role: profile.role,
    phone: profile.phone,
    digitalId: profile.digital_id,
    emergencyContact: profile.emergency_contact,
    status: profile.status,
    location: profile.location ? { lat: 0, lng: 0 } : undefined // Parse PostGIS data
  } : null;

  const login = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  const register = async (email: string, password: string, userData: any) => {
    return await signUp(email, password, userData);
  };

  const logout = async () => {
    await signOut();
  };

  const updateUser = (updates: Partial<User>) => {
    // This would update the profile in Supabase
    console.log('Update user:', updates);
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