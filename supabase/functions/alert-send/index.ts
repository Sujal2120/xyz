import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AlertSendRequest {
  incidentId: string
  alertType?: 'sms' | 'email' | 'push' | 'call'
  customMessage?: string
  authorityContact?: string
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Admin access required' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { incidentId, alertType = 'push', customMessage, authorityContact }: AlertSendRequest = await req.json()

    // Validate required fields
    if (!incidentId) {
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

    // Get incident details
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select(`
        *,
        tourist:profiles!incidents_tourist_id_fkey (
          name,
          phone,
          digital_id,
          emergency_contact
        )
      `)
      .eq('id', incidentId)
      .single()

    if (incidentError || !incident) {
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

    // Generate alert message
    const defaultMessage = `ALERT: ${incident.severity?.toUpperCase() || 'MEDIUM'} incident reported by ${incident.tourist?.name || 'Tourist'} (ID: ${incident.tourist?.digital_id}). Type: ${incident.type}. Location: ${incident.location ? 'GPS coordinates available' : 'Location unknown'}.`
    
    const alertMessage = customMessage || defaultMessage
    const contact = authorityContact || 'emergency@tourism.gov.in'

    // Create alert record
    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .insert({
        incident_id: incidentId,
        authority_contact: contact,
        message: alertMessage,
        alert_type: alertType,
        status: 'pending'
      })
      .select()
      .single()

    if (alertError) {
      console.error('Alert creation error:', alertError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create alert' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Simulate sending alert (replace with actual integrations)
    let alertSent = false
    let alertResponse = ''

    try {
      switch (alertType) {
        case 'sms':
          // TODO: Integrate with Twilio SMS API
          console.log(`SMS Alert to ${contact}: ${alertMessage}`)
          alertResponse = 'SMS sent via Twilio (simulated)'
          alertSent = true
          break
          
        case 'email':
          // TODO: Integrate with SendGrid or similar
          console.log(`Email Alert to ${contact}: ${alertMessage}`)
          alertResponse = 'Email sent via SendGrid (simulated)'
          alertSent = true
          break
          
        case 'call':
          // TODO: Integrate with Twilio Voice API
          console.log(`Voice Call to ${contact}: ${alertMessage}`)
          alertResponse = 'Voice call initiated via Twilio (simulated)'
          alertSent = true
          break
          
        case 'push':
        default:
          // TODO: Integrate with FCM or similar
          console.log(`Push Notification: ${alertMessage}`)
          alertResponse = 'Push notification sent via FCM (simulated)'
          alertSent = true
          break
      }

      // Update alert status
      await supabase
        .from('alerts')
        .update({ 
          status: alertSent ? 'sent' : 'failed',
          sent_at: alertSent ? new Date().toISOString() : null
        })
        .eq('id', alert.id)

      // Send real-time notification to admin dashboards
      await supabase
        .channel('alerts')
        .send({
          type: 'broadcast',
          event: 'alert_sent',
          payload: {
            alert,
            incident,
            alertType,
            timestamp: new Date().toISOString()
          }
        })

      return new Response(
        JSON.stringify({
          success: true,
          alert: {
            id: alert.id,
            incidentId: alert.incident_id,
            type: alert.alert_type,
            status: alert.status,
            message: alert.message,
            contact: alert.authority_contact,
            sentAt: alert.sent_at
          },
          response: alertResponse,
          message: `Alert ${alertSent ? 'sent successfully' : 'failed to send'}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (sendError) {
      console.error('Alert sending error:', sendError)
      
      // Update alert status to failed
      await supabase
        .from('alerts')
        .update({ status: 'failed' })
        .eq('id', alert.id)

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send alert',
          alert: {
            id: alert.id,
            status: 'failed'
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Alert send error:', error)
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