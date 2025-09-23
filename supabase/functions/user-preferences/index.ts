import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
}

interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  notifications_enabled?: boolean
  email_notifications?: boolean
  sms_notifications?: boolean
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

    switch (req.method) {
      case 'GET':
        // Get user preferences
        const { data: preferences, error: getError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (getError) {
          // If no preferences exist, create default ones
          if (getError.code === 'PGRST116') {
            const { data: newPreferences, error: createError } = await supabase
              .from('user_preferences')
              .insert({ user_id: user.id })
              .select()
              .single()

            if (createError) {
              console.error('Create preferences error:', createError)
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: 'Failed to create user preferences' 
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
                preferences: newPreferences
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          console.error('Get preferences error:', getError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to fetch user preferences' 
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
            preferences
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'PUT':
        const updateData: UpdatePreferencesRequest = await req.json()
        
        // Validate theme if provided
        if (updateData.theme && !['light', 'dark', 'system'].includes(updateData.theme)) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Invalid theme value. Must be light, dark, or system' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Update preferences
        const { data: updatedPreferences, error: updateError } = await supabase
          .from('user_preferences')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Update preferences error:', updateError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to update user preferences' 
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
            preferences: updatedPreferences,
            message: 'Preferences updated successfully'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Method not allowed' 
          }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('User preferences error:', error)
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