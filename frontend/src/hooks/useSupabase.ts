import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: userData.name,
            phone: userData.phone,
            emergency_contact: userData.emergencyContact,
            role: userData.role || 'tourist'
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return { data, error }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { data, error }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateLocation = async (latitude: number, longitude: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          location: `POINT(${longitude} ${latitude})`
        })
        .eq('id', user.id)

      if (error) throw error

      // Add to location history
      await supabase
        .from('location_history')
        .insert({
          user_id: user.id,
          location: `POINT(${longitude} ${latitude})`,
          accuracy: 10
        })

    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  const reportIncident = async (incidentData: any) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          tourist_id: user.id,
          type: incidentData.type,
          description: incidentData.description,
          location: incidentData.location ? 
            `POINT(${incidentData.location.lng} ${incidentData.location.lat})` : null,
          severity: incidentData.severity || 'medium'
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error reporting incident:', error)
      return { data: null, error }
    }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateLocation,
    reportIncident,
    fetchProfile
  }
}