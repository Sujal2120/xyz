import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export interface Profile {
  id: string
  name: string
  role: 'tourist' | 'admin'
  digital_id: string
  phone?: string
  emergency_contact?: string
  location?: any // PostGIS geography type
  status: 'active' | 'inactive' | 'alert'
  created_at: string
  updated_at: string
}

export interface Incident {
  id: string
  tourist_id: string
  type: 'emergency' | 'medical' | 'theft' | 'harassment' | 'lost' | 'other'
  description?: string
  location?: any // PostGIS geography type
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
  center: any // PostGIS geography type
  radius_meters: number
  safe: boolean
  active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  incident_id: string
  authority_contact: string
  message: string
  alert_type: 'sms' | 'email' | 'push' | 'call'
  status: 'pending' | 'sent' | 'failed' | 'acknowledged'
  sent_at?: string
  acknowledged_at?: string
  created_at: string
}