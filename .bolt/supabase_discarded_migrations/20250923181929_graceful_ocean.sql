/*
  # Create Geofences Table

  1. New Table: geofences
    - id (uuid, primary key)
    - name (text, required)
    - description (text, optional)
    - center (geography point, center of geofence)
    - radius_meters (integer, radius in meters)
    - safe (boolean, true for safe zones, false for danger zones)
    - active (boolean, default true)
    - created_by (uuid, references profiles)
    - created_at (timestamptz)
    - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated users can read active geofences
    - Admins can manage all geofences

  3. Indexes
    - Spatial index on center point
    - Index on active status
    - Index on safe status
*/

-- Create geofences table
CREATE TABLE geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  center geography(POINT, 4326) NOT NULL,
  radius_meters integer NOT NULL CHECK (radius_meters > 0),
  safe boolean DEFAULT true,
  active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read active geofences"
  ON geofences FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can manage geofences"
  ON geofences FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_geofences_center ON geofences USING GIST(center);
CREATE INDEX idx_geofences_active ON geofences USING btree(active);
CREATE INDEX idx_geofences_safe ON geofences USING btree(safe);

-- Update timestamp trigger
CREATE TRIGGER update_geofences_updated_at
  BEFORE UPDATE ON geofences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if point is within geofence
CREATE OR REPLACE FUNCTION check_geofence(
  user_location geography,
  geofence_id uuid
)
RETURNS boolean AS $$
DECLARE
  geofence_record RECORD;
BEGIN
  SELECT center, radius_meters, active
  INTO geofence_record
  FROM geofences
  WHERE id = geofence_id AND active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  RETURN ST_DWithin(user_location, geofence_record.center, geofence_record.radius_meters);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get nearby geofences
CREATE OR REPLACE FUNCTION get_nearby_geofences(
  user_location geography,
  max_distance_meters integer DEFAULT 5000
)
RETURNS TABLE(
  geofence_id uuid,
  geofence_name text,
  distance_meters numeric,
  is_safe boolean,
  is_inside boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    ST_Distance(user_location, g.center)::numeric,
    g.safe,
    ST_DWithin(user_location, g.center, g.radius_meters)
  FROM geofences g
  WHERE g.active = true
    AND ST_DWithin(user_location, g.center, max_distance_meters)
  ORDER BY ST_Distance(user_location, g.center);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;