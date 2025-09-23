/*
  # Create helper functions for the tourist safety system

  1. Functions
    - `generate_digital_id(name, email)` - Generate blockchain-style digital ID
    - `check_geofence(user_location, geofence_id)` - Check if location is within geofence
    - `get_nearby_geofences(user_location, max_distance)` - Get nearby geofences
    - `calculate_distance(point1, point2)` - Calculate distance between two points
    - `get_incident_summary()` - Get incident statistics for admins

  2. Security
    - Functions are security definer where needed
    - Proper access controls based on user roles
*/

-- Function to generate digital ID (blockchain-style hash)
CREATE OR REPLACE FUNCTION generate_digital_id(user_name text, user_email text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  timestamp_str text;
  combined_string text;
  digital_id text;
BEGIN
  -- Get current timestamp as string
  timestamp_str := extract(epoch from now())::text;
  
  -- Combine name, email, and timestamp
  combined_string := user_name || user_email || timestamp_str;
  
  -- Generate SHA256 hash (simulating blockchain-style ID)
  digital_id := 'DID-' || upper(substring(encode(digest(combined_string, 'sha256'), 'hex'), 1, 16));
  
  RETURN digital_id;
END;
$$;

-- Function to check if a location is within a geofence
CREATE OR REPLACE FUNCTION check_geofence(user_location geography, geofence_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  geofence_center geography;
  geofence_radius float;
  distance_meters float;
BEGIN
  -- Get geofence details
  SELECT center, radius_meters
  INTO geofence_center, geofence_radius
  FROM geofences
  WHERE id = geofence_id AND active = true;
  
  -- Return false if geofence not found
  IF geofence_center IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculate distance
  distance_meters := ST_Distance(user_location, geofence_center);
  
  -- Return true if within radius
  RETURN distance_meters <= geofence_radius;
END;
$$;

-- Function to get nearby geofences
CREATE OR REPLACE FUNCTION get_nearby_geofences(user_location geography, max_distance_meters float DEFAULT 5000)
RETURNS TABLE(
  geofence_id uuid,
  geofence_name text,
  distance_meters float,
  is_safe boolean,
  is_inside boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    ST_Distance(user_location, g.center)::float as distance,
    g.safe,
    (ST_Distance(user_location, g.center) <= g.radius_meters) as inside
  FROM geofences g
  WHERE g.active = true
    AND ST_Distance(user_location, g.center) <= max_distance_meters
  ORDER BY ST_Distance(user_location, g.center);
END;
$$;

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(point1 geography, point2 geography)
RETURNS float
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ST_Distance(point1, point2);
END;
$$;

-- Function to get incident summary (for admin dashboard)
CREATE OR REPLACE FUNCTION get_incident_summary()
RETURNS TABLE(
  total_incidents bigint,
  pending_incidents bigint,
  resolved_incidents bigint,
  critical_incidents bigint,
  incidents_today bigint,
  avg_resolution_time interval
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total,
    COUNT(*) FILTER (WHERE status = 'pending')::bigint as pending,
    COUNT(*) FILTER (WHERE status = 'resolved')::bigint as resolved,
    COUNT(*) FILTER (WHERE severity = 'critical')::bigint as critical,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::bigint as today,
    AVG(resolved_at - created_at) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution
  FROM incidents;
END;
$$;

-- Function to create profile after user signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_name text;
  digital_id text;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  -- Use email as default name if not provided
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(user_email, '@', 1));
  
  -- Generate digital ID
  digital_id := generate_digital_id(user_name, user_email);
  
  -- Insert profile
  INSERT INTO profiles (id, name, digital_id, role)
  VALUES (
    NEW.id,
    user_name,
    digital_id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'tourist')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile after user signup
CREATE OR REPLACE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();