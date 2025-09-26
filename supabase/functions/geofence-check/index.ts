import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { latitude, longitude } = await req.json()

    // Check geofences using PostGIS
    const { data: geofences, error } = await supabaseClient
      .rpc('check_geofences', {
        user_lat: latitude,
        user_lng: longitude
      })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          geofences: geofences || [],
          location: { latitude, longitude }
        },
        message: 'Geofence check completed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: 'GEOFENCE_CHECK_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})