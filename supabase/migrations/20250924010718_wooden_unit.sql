/*
  # Create System Views and Functions

  1. Views
    - `active_incidents_view` - Current active incidents with tourist info
    - `safety_dashboard_view` - Real-time safety metrics
    - `tourist_locations_view` - Current tourist locations with status

  2. Functions
    - `get_safety_metrics()` - Dashboard statistics
    - `detect_anomalies()` - Movement anomaly detection
    - `generate_efir()` - Electronic FIR generation
*/

-- Active incidents view
CREATE OR REPLACE VIEW active_incidents_view AS
SELECT 
  i.id,
  i.type,
  i.description,
  i.severity,
  i.status,
  i.location,
  i.created_at,
  p.name as tourist_name,
  p.digital_id,
  p.phone,
  p.emergency_contact,
  admin.name as assigned_admin_name
FROM incidents i
JOIN profiles p ON i.tourist_id = p.id
LEFT JOIN profiles admin ON i.assigned_to = admin.id
WHERE i.status IN ('pending', 'acknowledged')
ORDER BY 
  CASE i.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  i.created_at DESC;

-- Safety dashboard view
CREATE OR REPLACE VIEW safety_dashboard_view AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'tourist' AND status = 'active') as active_tourists,
  (SELECT COUNT(*) FROM incidents WHERE status IN ('pending', 'acknowledged') AND severity IN ('high', 'critical')) as critical_alerts,
  (SELECT COUNT(*) FROM incidents WHERE created_at > now() - interval '24 hours') as incidents_24h,
  (SELECT COUNT(*) FROM incidents WHERE status = 'resolved') as resolved_incidents,
  (SELECT COUNT(*) FROM alerts WHERE status = 'pending') as pending_alerts;

-- Tourist locations view
CREATE OR REPLACE VIEW tourist_locations_view AS
SELECT 
  p.id,
  p.name,
  p.digital_id,
  p.location,
  p.status,
  p.updated_at as last_update,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM geofences g 
      WHERE g.safe = false 
      AND g.active = true 
      AND ST_DWithin(p.location, g.center, g.radius_meters)
    ) THEN 'danger'
    WHEN EXISTS (
      SELECT 1 FROM geofences g 
      WHERE g.safe = true 
      AND g.active = true 
      AND ST_DWithin(p.location, g.center, g.radius_meters)
    ) THEN 'safe'
    ELSE 'unknown'
  END as zone_status
FROM profiles p
WHERE p.role = 'tourist' AND p.location IS NOT NULL;

-- Function to get safety metrics
CREATE OR REPLACE FUNCTION get_safety_metrics()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'active_tourists', active_tourists,
    'critical_alerts', critical_alerts,
    'incidents_24h', incidents_24h,
    'resolved_incidents', resolved_incidents,
    'pending_alerts', pending_alerts,
    'safe_zone_tourists', (
      SELECT COUNT(*) FROM tourist_locations_view WHERE zone_status = 'safe'
    ),
    'danger_zone_tourists', (
      SELECT COUNT(*) FROM tourist_locations_view WHERE zone_status = 'danger'
    )
  ) INTO result
  FROM safety_dashboard_view;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect movement anomalies
CREATE OR REPLACE FUNCTION detect_anomalies(
  target_user_id uuid DEFAULT NULL,
  hours_back integer DEFAULT 2
)
RETURNS TABLE(
  user_id uuid,
  user_name text,
  anomaly_type text,
  description text,
  location geography,
  detected_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      lh.user_id,
      p.name,
      AVG(lh.speed) as avg_speed,
      STDDEV(lh.speed) as speed_stddev,
      MAX(lh.created_at) as last_location_time
    FROM location_history lh
    JOIN profiles p ON lh.user_id = p.id
    WHERE 
      lh.created_at > now() - (hours_back || ' hours')::interval
      AND (target_user_id IS NULL OR lh.user_id = target_user_id)
      AND lh.speed IS NOT NULL
    GROUP BY lh.user_id, p.name
  ),
  anomalies AS (
    SELECT 
      lh.user_id,
      us.name,
      CASE 
        WHEN lh.speed > (us.avg_speed + 2 * us.speed_stddev) THEN 'high_speed'
        WHEN now() - us.last_location_time > interval '2 hours' THEN 'location_drop'
        WHEN lh.speed = 0 AND COUNT(*) OVER (
          PARTITION BY lh.user_id 
          ORDER BY lh.created_at 
          ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
        ) >= 5 THEN 'prolonged_inactivity'
        ELSE NULL
      END as anomaly_type,
      lh.location,
      lh.created_at
    FROM location_history lh
    JOIN user_stats us ON lh.user_id = us.user_id
    WHERE lh.created_at > now() - (hours_back || ' hours')::interval
  )
  SELECT 
    a.user_id,
    a.name,
    a.anomaly_type,
    CASE a.anomaly_type
      WHEN 'high_speed' THEN 'Unusually high speed detected'
      WHEN 'location_drop' THEN 'No location updates received'
      WHEN 'prolonged_inactivity' THEN 'Extended period of inactivity'
      ELSE 'Unknown anomaly'
    END as description,
    a.location,
    a.created_at
  FROM anomalies a
  WHERE a.anomaly_type IS NOT NULL
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate E-FIR
CREATE OR REPLACE FUNCTION generate_efir(incident_id uuid)
RETURNS json AS $$
DECLARE
  incident_record incidents%ROWTYPE;
  tourist_record profiles%ROWTYPE;
  efir_id text;
  efir_data json;
BEGIN
  -- Get incident details
  SELECT * INTO incident_record FROM incidents WHERE id = incident_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Incident not found';
  END IF;
  
  -- Get tourist details
  SELECT * INTO tourist_record FROM profiles WHERE id = incident_record.tourist_id;
  
  -- Generate E-FIR ID
  efir_id := 'EFIR-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 8));
  
  -- Build E-FIR data
  efir_data := json_build_object(
    'efir_id', efir_id,
    'incident_id', incident_id,
    'generated_at', now(),
    'incident_details', json_build_object(
      'type', incident_record.type,
      'description', incident_record.description,
      'severity', incident_record.severity,
      'occurred_at', incident_record.created_at,
      'location', CASE 
        WHEN incident_record.location IS NOT NULL THEN
          json_build_object(
            'latitude', ST_Y(incident_record.location::geometry),
            'longitude', ST_X(incident_record.location::geometry)
          )
        ELSE NULL
      END
    ),
    'tourist_details', json_build_object(
      'name', tourist_record.name,
      'digital_id', tourist_record.digital_id,
      'phone', tourist_record.phone,
      'emergency_contact', tourist_record.emergency_contact
    ),
    'status', 'generated',
    'authority', 'Tourism Safety Department'
  );
  
  -- Update incident with E-FIR reference
  UPDATE incidents 
  SET description = COALESCE(description, '') || ' [E-FIR: ' || efir_id || ']'
  WHERE id = incident_id;
  
  RETURN efir_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;