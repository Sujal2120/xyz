import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, name, phone, emergency_contact } = await req.json()

    // Create user account
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      throw authError
    }

    // Create profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        phone,
        emergency_contact,
        role: 'tourist'
      })
      .select()
      .single()

    if (profileError) {
      throw profileError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: authData.user,
          profile: profile
        },
        message: 'Tourist registered successfully'
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
        code: 'REGISTRATION_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})