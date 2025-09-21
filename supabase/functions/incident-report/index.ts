import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface IncidentReportRequest {
  type: 'emergency' | 'medical' | 'theft' | 'harassment' | 'lost' | 'other'
  description?: string
  latitude?: number
  longitude?: number
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authorization header required' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired token' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { type, description, latitude, longitude, severity = 'medium' }: IncidentReportRequest = await req.json()

    // Validate required fields
    if (!type) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Incident type is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's current location if not provided
    let incidentLocation = null
    if (latitude && longitude) {
      incidentLocation = `POINT(${longitude} ${latitude})`
    } else {
      // Try to get user's last known location
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single()
      
      if (profile?.location) {
        incidentLocation = profile.location
      }
    }

    // Create incident
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        tourist_id: user.id,
        type,
        description,
        location: incidentLocation,
        severity,
        status: 'pending'
      })
      .select(`
        *,
        profiles:tourist_id (
          name,
          phone,
          digital_id,
          emergency_contact
        )
      `)
      .single()

    if (incidentError) {
      console.error('Incident creation error:', incidentError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create incident report' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create alert for authorities
    const alertMessage = `${severity.toUpperCase()} INCIDENT: ${type} reported by ${incident.profiles?.name || 'Tourist'} (ID: ${incident.profiles?.digital_id})`
    
    const { error: alertError } = await supabase
      .from('alerts')
      .insert({
        incident_id: incident.id,
        authority_contact: 'emergency@tourism.gov.in',
        message: alertMessage,
        alert_type: severity === 'critical' ? 'call' : 'push',
        status: 'pending'
      })

    if (alertError) {
      console.error('Alert creation error:', alertError)
    }

    // Send real-time notification to admin dashboards
    const { error: realtimeError } = await supabase
      .channel('incidents')
      .send({
        type: 'broadcast',
        event: 'new_incident',
        payload: {
          incident,
          severity,
          timestamp: new Date().toISOString()
        }
      })

    if (realtimeError) {
      console.error('Realtime notification error:', realtimeError)
    }

    // Update user status to alert if critical
    if (severity === 'critical') {
      await supabase
        .from('profiles')
        .update({ status: 'alert' })
        .eq('id', user.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        incident: {
          id: incident.id,
          type: incident.type,
          description: incident.description,
          severity: incident.severity,
          status: incident.status,
          createdAt: incident.created_at,
          location: incident.location ? {
            latitude: latitude || null,
            longitude: longitude || null
          } : null
        },
        message: 'Incident reported successfully. Authorities have been notified.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Incident report error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})