import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types
export interface Profile {
  id: string
  name: string
  role: 'tourist' | 'admin'
  digital_id: string
  phone?: string
  emergency_contact?: string
  location?: string
  status: 'active' | 'inactive' | 'alert'
  created_at: string
  updated_at: string
}

export interface Incident {
  id: string
  tourist_id: string
  type: 'emergency' | 'medical' | 'theft' | 'harassment' | 'lost' | 'other'
  description?: string
  location?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'acknowledged' | 'resolved' | 'false_alarm'
  assigned_to?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface Geofence {
  id: string
  name: string
  description?: string
  center: string
  radius_meters: number
  safe: boolean
  active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications_enabled: boolean
  email_notifications: boolean
  sms_notifications: boolean
  created_at: string
  updated_at: string
}

// API Functions
export const api = {
  // Authentication
  async register(userData: {
    email: string
    password: string
    name: string
    phone?: string
    emergencyContact?: string
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            emergency_contact: userData.emergencyContact
          }
        }
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Incidents
  async reportIncident(incidentData: {
    type: string
    description: string
    latitude?: number
    longitude?: number
    severity?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          type: incidentData.type,
          description: incidentData.description,
          location: incidentData.latitude && incidentData.longitude 
            ? `POINT(${incidentData.longitude} ${incidentData.latitude})`
            : null,
          severity: incidentData.severity || 'medium'
        })
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getIncidents() {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Geofences
  async getGeofences() {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // User Preferences
  async getUserPreferences() {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async updateUserPreferences(preferences: Partial<UserPreferences>) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferences)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export default supabase