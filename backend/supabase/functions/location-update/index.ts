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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid token')
    }

    const { latitude, longitude, accuracy, speed, heading } = await req.json()

    // Update profile location
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        location: `POINT(${longitude} ${latitude})`,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      throw profileError
    }

    // Add to location history
    const { data: locationHistory, error: historyError } = await supabaseClient
      .from('location_history')
      .insert({
        user_id: user.id,
        location: `POINT(${longitude} ${latitude})`,
        accuracy,
        speed,
        heading
      })
      .select()
      .single()

    if (historyError) {
      throw historyError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: locationHistory,
        message: 'Location updated successfully'
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
        code: 'LOCATION_UPDATE_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})