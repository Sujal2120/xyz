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

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid token')
    }

    const { type, description, latitude, longitude, severity } = await req.json()

    // Create incident
    const { data: incident, error: incidentError } = await supabaseClient
      .from('incidents')
      .insert({
        tourist_id: user.id,
        type,
        description,
        location: `POINT(${longitude} ${latitude})`,
        severity: severity || 'medium'
      })
      .select()
      .single()

    if (incidentError) {
      throw incidentError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: incident,
        message: 'Incident reported successfully'
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
        code: 'INCIDENT_REPORT_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})