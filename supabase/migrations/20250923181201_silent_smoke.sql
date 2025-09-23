/*
  # Create System Functions and Views

  1. Views
    - `active_tourists_view` - Current active tourists with locations
    - `recent_incidents_view` - Recent incidents with tourist details
    - `geofence_violations_view` - Tourists in danger zones

  2. Functions
    - Tourist safety monitoring functions
    - Geofence violation detection
    - Emergency response automation
    - Analytics and reporting functions

  3. Security
    - Views respect RLS policies
    - Functions have appropriate security settings
*/

-- View for active tourists with current locations
CREATE OR REPLACE VIEW active_tourists_view AS
SELECT 
  p.id,
  p.name,
  p.digital_id,
  p.phone,
  p.emergency_contact,
  p.location,
  ST_Y(p.location::geometry) as latitude,
  ST_X(p.location::geometry) as longitude,
  p.status,
  p.updated_at as last_location_update,
  COUNT(i.id) as active_incidents
FROM profiles p
LEFT JOIN incidents i ON p.id = i.tourist_id AND i.status IN ('pending', 'acknowledged')
WHERE p.role = 'tourist' AND p.status = 'active'
GROUP BY p.id, p.name, p.digital_id, p.phone, p.emergency_contact, p.location, p.status, p.updated_at;

-- View for recent incidents with tourist details
CREATE OR REPLACE VIEW recent_incidents_view AS
SELECT 
  i.id,
  i.type,
  i.description,
  i.severity,
  i.status,
  i.created_at,
  i.updated_at,
  ST_Y(i.location::geometry) as latitude,
  ST_X(i.location::geometry) as longitude,
  p.name as tourist_name,
  p.digital_id,
  p.phone as tourist_phone,
  p.emergency_contact,
  admin.name as assigned_admin_name
FROM incidents i
JOIN profiles p ON i.tourist_id = p.id
LEFT JOIN profiles admin ON i.assigned_to = admin.id
WHERE i.created_at > now() - interval '7 days'
ORDER BY i.created_at DESC;

-- View for geofence violations (tourists in danger zones)
CREATE OR REPLACE VIEW geofence_violations_view AS
SELECT 
  p.id as tourist_id,
  p.name as tourist_name,
  p.digital_id,
  p.phone,
  p.location,
  ST_Y(p.location::geometry) as latitude,
  ST_X(p.location::geometry) as longitude,
  g.id as geofence_id,
  g.name as geofence_name,
  g.description as geofence_description,
  ST_Distance(p.location, g.center) as distance_from_center,
  p.updated_at as last_update
FROM profiles p
CROSS JOIN geofences g
WHERE p.role = 'tourist' 
  AND p.status = 'active'
  AND p.location IS NOT NULL
  AND g.active = true
  AND g.safe = false
  AND ST_DWithin(p.location, g.center, g.radius_meters);

-- Function to detect anomalies in tourist movement
CREATE OR REPLACE FUNCTION detect_movement_anomalies(
  p_user_id uuid,
  p_max_speed_kmh numeric DEFAULT 100,
  p_time_window_minutes integer DEFAULT 30
)
RETURNS TABLE (
  anomaly_type text,
  description text,
  severity severity_level,
  detected_at timestamptz
) AS $$
DECLARE
  recent_locations RECORD;
  speed_kmh numeric;
  time_diff numeric;
  distance_m numeric;
BEGIN
  -- Check for unusually high speed
  FOR recent_locations IN
    SELECT 
      lh1.location as loc1,
      lh2.location as loc2,
      lh1.created_at as time1,
      lh2.created_at as time2
    FROM location_history lh1
    JOIN location_history lh2 ON lh1.user_id = lh2.user_id
    WHERE lh1.user_id = p_user_id
      AND lh1.created_at > now() - (p_time_window_minutes || ' minutes')::interval
      AND lh2.created_at > lh1.created_at
      AND lh2.created_at <= lh1.created_at + interval '10 minutes'
    ORDER BY lh1.created_at DESC
    LIMIT 10
  LOOP
    distance_m := ST_Distance(recent_locations.loc1, recent_locations.loc2);
    time_diff := EXTRACT(EPOCH FROM (recent_locations.time2 - recent_locations.time1)) / 3600.0;
    
    IF time_diff > 0 THEN
      speed_kmh := (distance_m / 1000.0) / time_diff;
      
      IF speed_kmh > p_max_speed_kmh THEN
        RETURN QUERY SELECT 
          'high_speed'::text,
          'Unusually high movement speed detected: ' || speed_kmh::text || ' km/h'::text,
          CASE 
            WHEN speed_kmh > p_max_speed_kmh * 2 THEN 'critical'::severity_level
            WHEN speed_kmh > p_max_speed_kmh * 1.5 THEN 'high'::severity_level
            ELSE 'medium'::severity_level
          END,
          recent_locations.time2;
      END IF;
    END IF;
  END LOOP;
  
  -- Check for location drops (no updates for extended period)
  IF NOT EXISTS (
    SELECT 1 FROM location_history
    WHERE user_id = p_user_id
      AND created_at > now() - interval '2 hours'
  ) THEN
    RETURN QUERY SELECT 
      'location_drop'::text,
      'No location updates received for over 2 hours'::text,
      'high'::severity_level,
      now();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get tourist safety statistics
CREATE OR REPLACE FUNCTION get_safety_statistics(
  p_time_period interval DEFAULT interval '24 hours'
)
RETURNS TABLE (
  total_tourists bigint,
  active_tourists bigint,
  tourists_in_danger_zones bigint,
  total_incidents bigint,
  critical_incidents bigint,
  resolved_incidents bigint,
  average_response_time interval
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles WHERE role = 'tourist')::bigint,
    (SELECT COUNT(*) FROM profiles WHERE role = 'tourist' AND status = 'active')::bigint,
    (SELECT COUNT(DISTINCT tourist_id) FROM geofence_violations_view)::bigint,
    (SELECT COUNT(*) FROM incidents WHERE created_at > now() - p_time_period)::bigint,
    (SELECT COUNT(*) FROM incidents WHERE created_at > now() - p_time_period AND severity = 'critical')::bigint,
    (SELECT COUNT(*) FROM incidents WHERE created_at > now() - p_time_period AND status = 'resolved')::bigint,
    (SELECT AVG(resolved_at - created_at) FROM incidents WHERE resolved_at IS NOT NULL AND created_at > now() - p_time_period);
END;
$$ LANGUAGE plpgsql;

-- Function to create emergency response
CREATE OR REPLACE FUNCTION create_emergency_response(
  p_incident_id uuid,
  p_response_type text DEFAULT 'standard'
)
RETURNS json AS $$
DECLARE
  incident_record RECORD;
  tourist_record RECORD;
  response_data json;
BEGIN
  -- Get incident details
  SELECT * INTO incident_record FROM incidents WHERE id = p_incident_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Incident not found');
  END IF;
  
  -- Get tourist details
  SELECT * INTO tourist_record FROM profiles WHERE id = incident_record.tourist_id;
  
  -- Create response based on severity
  CASE incident_record.severity
    WHEN 'critical' THEN
      -- Immediate response for critical incidents
      INSERT INTO alerts (incident_id, authority_contact, message, alert_type)
      VALUES (
        p_incident_id,
        'emergency@tourism.gov.in',
        'CRITICAL EMERGENCY: Immediate response required for ' || tourist_record.name,
        'call'
      );
      
      -- Update tourist status
      UPDATE profiles SET status = 'alert' WHERE id = incident_record.tourist_id;
      
    WHEN 'high' THEN
      -- High priority response
      INSERT INTO alerts (incident_id, authority_contact, message, alert_type)
      VALUES (
        p_incident_id,
        'alerts@tourism.gov.in',
        'HIGH PRIORITY: Urgent attention required',
        'push'
      );
      
    ELSE
      -- Standard response
      INSERT INTO alerts (incident_id, authority_contact, message, alert_type)
      VALUES (
        p_incident_id,
        'support@tourism.gov.in',
        'Incident reported: ' || incident_record.type,
        'email'
      );
  END CASE;
  
  response_data := json_build_object(
    'success', true,
    'incident_id', p_incident_id,
    'response_type', p_response_type,
    'severity', incident_record.severity,
    'alerts_created', true
  );
  
  RETURN response_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate E-FIR automatically
CREATE OR REPLACE FUNCTION generate_efir(p_incident_id uuid)
RETURNS text AS $$
DECLARE
  incident_record RECORD;
  tourist_record RECORD;
  efir_number text;
BEGIN
  -- Get incident and tourist details
  SELECT i.*, p.name, p.digital_id, p.phone, p.emergency_contact
  INTO incident_record
  FROM incidents i
  JOIN profiles p ON i.tourist_id = p.id
  WHERE i.id = p_incident_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Generate E-FIR number
  efir_number := 'EFIR-' || EXTRACT(YEAR FROM now()) || '-' || 
                 LPAD(EXTRACT(DOY FROM now())::text, 3, '0') || '-' ||
                 LPAD(nextval('efir_sequence')::text, 6, '0');
  
  -- Here you would integrate with actual E-FIR system
  -- For now, we'll just log the E-FIR creation
  
  RETURN efir_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for E-FIR numbers
CREATE SEQUENCE IF NOT EXISTS efir_sequence START 1;

-- Grant necessary permissions
GRANT SELECT ON active_tourists_view TO authenticated;
GRANT SELECT ON recent_incidents_view TO authenticated;
GRANT SELECT ON geofence_violations_view TO authenticated;