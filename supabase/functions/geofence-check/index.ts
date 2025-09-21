import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GeofenceCheckRequest {
  latitude: number
  longitude: number
  geofenceId?: string
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

    const { latitude, longitude, geofenceId }: GeofenceCheckRequest = await req.json()

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Valid latitude and longitude are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userLocation = `POINT(${longitude} ${latitude})`

    if (geofenceId) {
      // Check specific geofence
      const { data: isInside, error: checkError } = await supabase
        .rpc('check_geofence', {
          user_location: userLocation,
          geofence_id: geofenceId
        })

      if (checkError) {
        console.error('Geofence check error:', checkError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to check geofence' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          inside: isInside,
          geofenceId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Check all nearby geofences
      const { data: nearbyGeofences, error: nearbyError } = await supabase
        .rpc('get_nearby_geofences', {
          user_location: userLocation,
          max_distance_meters: 10000
        })

      if (nearbyError) {
        console.error('Nearby geofences error:', nearbyError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to check nearby geofences' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Separate safe and unsafe zones
      const safeZones = nearbyGeofences?.filter(g => g.is_safe && g.is_inside) || []
      const unsafeZones = nearbyGeofences?.filter(g => !g.is_safe && g.is_inside) || []
      const nearbyZones = nearbyGeofences?.filter(g => !g.is_inside) || []

      return new Response(
        JSON.stringify({
          success: true,
          inside: safeZones.concat(unsafeZones),
          safeZones,
          unsafeZones,
          nearbyZones,
          isInSafeZone: safeZones.length > 0,
          isInDangerZone: unsafeZones.length > 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Geofence check error:', error)
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