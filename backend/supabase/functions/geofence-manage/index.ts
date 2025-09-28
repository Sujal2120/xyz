import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface CreateGeofenceRequest {
  name: string
  description?: string
  latitude: number
  longitude: number
  radiusMeters: number
  safe?: boolean
}

interface UpdateGeofenceRequest {
  name?: string
  description?: string
  latitude?: number
  longitude?: number
  radiusMeters?: number
  safe?: boolean
  active?: boolean
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

    // Check if user is admin for write operations
    if (req.method !== 'GET') {
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
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const geofenceId = pathParts[pathParts.length - 1]

    switch (req.method) {
      case 'GET':
        if (geofenceId && geofenceId !== 'geofence-manage') {
          // Get specific geofence
          const { data: geofence, error: getError } = await supabase
            .from('geofences')
            .select('*')
            .eq('id', geofenceId)
            .single()

          if (getError) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Geofence not found' 
              }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          return new Response(
            JSON.stringify({
              success: true,
              geofence
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else {
          // List all geofences
          const { data: geofences, error: listError } = await supabase
            .from('geofences')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })

          if (listError) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Failed to fetch geofences' 
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
              geofences
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

      case 'POST':
        const createData: CreateGeofenceRequest = await req.json()
        
        // Validate required fields
        if (!createData.name || typeof createData.latitude !== 'number' || 
            typeof createData.longitude !== 'number' || typeof createData.radiusMeters !== 'number') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Name, latitude, longitude, and radiusMeters are required' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data: newGeofence, error: createError } = await supabase
          .from('geofences')
          .insert({
            name: createData.name,
            description: createData.description,
            center: `POINT(${createData.longitude} ${createData.latitude})`,
            radius_meters: createData.radiusMeters,
            safe: createData.safe ?? true,
            created_by: user.id
          })
          .select()
          .single()

        if (createError) {
          console.error('Create geofence error:', createError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to create geofence' 
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
            geofence: newGeofence
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'PUT':
        if (!geofenceId || geofenceId === 'geofence-manage') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Geofence ID required for update' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const updateData: UpdateGeofenceRequest = await req.json()
        const updateFields: any = {}

        if (updateData.name) updateFields.name = updateData.name
        if (updateData.description !== undefined) updateFields.description = updateData.description
        if (updateData.radiusMeters) updateFields.radius_meters = updateData.radiusMeters
        if (updateData.safe !== undefined) updateFields.safe = updateData.safe
        if (updateData.active !== undefined) updateFields.active = updateData.active
        
        if (updateData.latitude && updateData.longitude) {
          updateFields.center = `POINT(${updateData.longitude} ${updateData.latitude})`
        }

        const { data: updatedGeofence, error: updateError } = await supabase
          .from('geofences')
          .update(updateFields)
          .eq('id', geofenceId)
          .select()
          .single()

        if (updateError) {
          console.error('Update geofence error:', updateError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to update geofence' 
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
            geofence: updatedGeofence
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'DELETE':
        if (!geofenceId || geofenceId === 'geofence-manage') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Geofence ID required for deletion' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Soft delete by setting active to false
        const { error: deleteError } = await supabase
          .from('geofences')
          .update({ active: false })
          .eq('id', geofenceId)

        if (deleteError) {
          console.error('Delete geofence error:', deleteError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to delete geofence' 
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
            message: 'Geofence deleted successfully'
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
    console.error('Geofence management error:', error)
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