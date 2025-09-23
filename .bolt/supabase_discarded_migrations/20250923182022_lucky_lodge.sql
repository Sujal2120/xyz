/*
  # Create System Views and Functions

  1. Views
    - active_incidents: Current active incidents with tourist info
    - safety_dashboard: Real-time safety overview
    - location_analytics: Location-based analytics

  2. Functions
    - get_tourist_safety_status: Get safety status for a tourist
    - detect_anomalies: Detect unusual patterns
    - generate_efir: Generate electronic FIR

  3. Triggers
    - Update tourist status based on incidents
    - Automatic geofence violation detection
*/

-- View: Active incidents with tourist information
CREATE OR REPLACE VIEW active_incidents AS
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
  p.status as tourist_status
FROM incidents i
JOIN profiles p ON i.tourist_id = p.id
WHERE i.status IN ('pending', 'acknowledged')
ORDER BY 
  CASE i.severity 
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  i.created_at DESC;

-- View: Safety dashboard statistics
CREATE OR REPLACE VIEW safety_dashboard AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'tourist' AND status = 'active') as active_tourists,
  (SELECT COUNT(*) FROM incidents WHERE status IN ('pending', 'acknowledged')) as active_incidents,
  (SELECT COUNT(*) FROM incidents WHERE severity IN ('high', 'critical') AND status IN ('pending', 'acknowledged')) as critical_alerts,
  (SELECT COUNT(*) FROM alerts WHERE status = 'pending') as pending_alerts,
  (SELECT COUNT(*) FROM geofences WHERE active = true AND safe = true) as safe_zones,
  (SELECT COUNT(*) FROM geofences WHERE active = true AND safe = false) as danger_zones;

-- View: Location analytics
CREATE OR REPLACE VIEW location_analytics AS
SELECT 
  p.id as tourist_id,
  p.name,
  p.digital_id,
  p.status,
  p.location as current_location,
  lh.location as last_recorded_location,
  lh.recorded_at as last_update,
  CASE 
    WHEN lh.recorded_at > now() - interval '5 minutes' THEN 'online'
    WHEN lh.recorded_at > now() - interval '30 minutes' THEN 'recent'
    ELSE 'offline'
  END as connectivity_status
FROM profiles p
LEFT JOIN LATERAL (
  SELECT location, recorded_at
  FROM location_history
  WHERE user_id = p.id
  ORDER BY recorded_at DESC
  LIMIT 1
) lh ON true
WHERE p.role = 'tourist';

-- Function: Get tourist safety status
CREATE OR REPLACE FUNCTION get_tourist_safety_status(tourist_id uuid)
RETURNS TABLE(
  status text,
  risk_level text,
  in_safe_zone boolean,
  last_incident_type incident_type,
  last_incident_time timestamptz
) AS $$
DECLARE
  tourist_record RECORD;
  geofence_check RECORD;
  incident_record RECORD;
BEGIN
  -- Get tourist info
  SELECT * INTO tourist_record
  FROM profiles
  WHERE id = tourist_id AND role = 'tourist';
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check geofence status
  SELECT INTO geofence_check
    bool_or(g.safe) as in_safe_zone
  FROM geofences g
  WHERE g.active = true
    AND tourist_record.location IS NOT NULL
    AND ST_DWithin(tourist_record.location, g.center, g.radius_meters);
  
  -- Get last incident
  SELECT INTO incident_record
    type, created_at
  FROM incidents
  WHERE incidents.tourist_id = get_tourist_safety_status.tourist_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Determine risk level
  RETURN QUERY SELECT
    tourist_record.status::text,
    CASE 
      WHEN tourist_record.status = 'alert' THEN 'high'
      WHEN COALESCE(geofence_check.in_safe_zone, false) = false THEN 'medium'
      ELSE 'low'
    END,
    COALESCE(geofence_check.in_safe_zone, false),
    incident_record.type,
    incident_record.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Detect location anomalies
CREATE OR REPLACE FUNCTION detect_location_anomalies(
  tourist_id uuid,
  time_window interval DEFAULT '1 hour'
)
RETURNS TABLE(
  anomaly_type text,
  description text,
  severity severity_level,
  detected_at timestamptz
) AS $$
DECLARE
  location_count integer;
  avg_speed numeric;
  max_distance numeric;
BEGIN
  -- Check for rapid location changes
  SELECT COUNT(*), AVG(speed), MAX(ST_Distance(lag(location) OVER (ORDER BY recorded_at), location))
  INTO location_count, avg_speed, max_distance
  FROM location_history
  WHERE user_id = tourist_id
    AND recorded_at > now() - time_window;
  
  -- Anomaly: Too many location updates (possible distress)
  IF location_count > 100 THEN
    RETURN QUERY SELECT
      'rapid_updates'::text,
      format('Excessive location updates: %s in %s', location_count, time_window),
      'medium'::severity_level,
      now();
  END IF;
  
  -- Anomaly: Unusually high speed (possible emergency)
  IF avg_speed > 50 THEN -- 50 m/s = 180 km/h
    RETURN QUERY SELECT
      'high_speed'::text,
      format('Unusually high average speed: %.2f m/s', avg_speed),
      'high'::severity_level,
      now();
  END IF;
  
  -- Anomaly: Large distance jumps (GPS spoofing or device issues)
  IF max_distance > 10000 THEN -- 10km jump
    RETURN QUERY SELECT
      'location_jump'::text,
      format('Large location jump detected: %.0f meters', max_distance),
      'medium'::severity_level,
      now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Generate E-FIR
CREATE OR REPLACE FUNCTION generate_efir(incident_id uuid)
RETURNS TABLE(
  fir_number text,
  incident_details jsonb,
  generated_at timestamptz
) AS $$
DECLARE
  incident_record RECORD;
  fir_num text;
BEGIN
  -- Get incident details
  SELECT 
    i.*,
    p.name as tourist_name,
    p.digital_id,
    p.phone,
    p.emergency_contact
  INTO incident_record
  FROM incidents i
  JOIN profiles p ON i.tourist_id = p.id
  WHERE i.id = incident_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Incident not found';
  END IF;
  
  -- Generate FIR number
  fir_num := format('EFIR-%s-%s', 
    to_char(now(), 'YYYYMMDD'),
    upper(substring(gen_random_uuid()::text from 1 for 8))
  );
  
  -- Return E-FIR details
  RETURN QUERY SELECT
    fir_num,
    jsonb_build_object(
      'fir_number', fir_num,
      'incident_id', incident_record.id,
      'incident_type', incident_record.type,
      'severity', incident_record.severity,
      'description', incident_record.description,
      'location', ST_AsGeoJSON(incident_record.location)::jsonb,
      'tourist', jsonb_build_object(
        'name', incident_record.tourist_name,
        'digital_id', incident_record.digital_id,
        'phone', incident_record.phone,
        'emergency_contact', incident_record.emergency_contact
      ),
      'reported_at', incident_record.created_at,
      'generated_at', now()
    ),
    now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update tourist status based on incidents
CREATE OR REPLACE FUNCTION update_tourist_status_on_incident()
RETURNS trigger AS $$
BEGIN
  -- Set tourist to alert status for critical incidents
  IF NEW.severity = 'critical' AND NEW.status = 'pending' THEN
    UPDATE profiles
    SET status = 'alert'
    WHERE id = NEW.tourist_id;
  END IF;
  
  -- Reset tourist to active status when incident is resolved
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    UPDATE profiles
    SET status = 'active'
    WHERE id = NEW.tourist_id
      AND NOT EXISTS (
        SELECT 1 FROM incidents
        WHERE tourist_id = NEW.tourist_id
          AND status IN ('pending', 'acknowledged')
          AND severity IN ('high', 'critical')
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tourist status updates
CREATE TRIGGER update_tourist_status_trigger
  AFTER INSERT OR UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_tourist_status_on_incident();