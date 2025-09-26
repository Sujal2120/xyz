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

    const { incident_id, authority_contact, message, alert_type } = await req.json()

    // Create alert record
    const { data: alert, error: alertError } = await supabaseClient
      .from('alerts')
      .insert({
        incident_id,
        authority_contact,
        message,
        alert_type: alert_type || 'push',
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (alertError) {
      throw alertError
    }

    // Here you would integrate with actual notification services
    // For now, we'll simulate the alert being sent
    console.log(`Alert sent to ${authority_contact}: ${message}`)

    return new Response(
      JSON.stringify({
        success: true,
        data: alert,
        message: 'Alert sent successfully'
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
        code: 'ALERT_SEND_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})