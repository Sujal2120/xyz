import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
}

interface UpdateIncidentRequest {
  status?: 'pending' | 'acknowledged' | 'resolved' | 'false_alarm'
  assignedTo?: string
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

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const incidentId = pathParts[pathParts.length - 1]

    if (!incidentId || incidentId === 'incident-manage') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Incident ID is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    switch (req.method) {
      case 'GET':
        // Get incident details
        const { data: incident, error: getError } = await supabase
          .from('incidents')
          .select(`
            *,
            tourist:profiles!incidents_tourist_id_fkey (
              name,
              phone,
              digital_id,
              emergency_contact,
              location
            ),
            assigned_admin:profiles!incidents_assigned_to_fkey (
              name,
              phone
            ),
            alerts (
              id,
              authority_contact,
              message,
              alert_type,
              status,
              sent_at,
              acknowledged_at
            )
          `)
          .eq('id', incidentId)
          .single()

        if (getError) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Incident not found' 
            }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Check if user has access to this incident
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (userProfile?.role !== 'admin' && incident.tourist_id !== user.id) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Access denied' 
            }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            incident
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'PUT':
        // Check if user is admin for updates
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (adminProfile?.role !== 'admin') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Admin access required for incident updates' 
            }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const updateData: UpdateIncidentRequest = await req.json()
        const updateFields: any = {}

        if (updateData.status) {
          updateFields.status = updateData.status
        }
        
        if (updateData.assignedTo) {
          updateFields.assigned_to = updateData.assignedTo
        }

        const { data: updatedIncident, error: updateError } = await supabase
          .from('incidents')
          .update(updateFields)
          .eq('id', incidentId)
          .select(`
            *,
            tourist:profiles!incidents_tourist_id_fkey (
              name,
              phone,
              digital_id,
              emergency_contact
            )
          `)
          .single()

        if (updateError) {
          console.error('Update incident error:', updateError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to update incident' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Update tourist status if incident is resolved
        if (updateData.status === 'resolved') {
          await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('id', updatedIncident.tourist_id)
        }

        // Send real-time notification
        await supabase
          .channel('incidents')
          .send({
            type: 'broadcast',
            event: 'incident_updated',
            payload: {
              incident: updatedIncident,
              updatedBy: user.id,
              timestamp: new Date().toISOString()
            }
          })

        return new Response(
          JSON.stringify({
            success: true,
            incident: updatedIncident,
            message: 'Incident updated successfully'
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
    console.error('Incident management error:', error)
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