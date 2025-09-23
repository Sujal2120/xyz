/*
  # Create Location History Table

  1. New Tables
    - `location_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `location` (geography point)
      - `accuracy` (numeric, GPS accuracy in meters)
      - `speed` (numeric, speed in m/s, optional)
      - `heading` (numeric, direction in degrees, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `location_history` table
    - Users can read their own location history
    - Admins can read all location history

  3. Indexes
    - Spatial index on location
    - Index on user_id and created_at for efficient queries
    - Partial index for recent locations

  4. Features
    - Automatic cleanup of old location data
    - Efficient querying for location tracking
*/

-- Create location history table
CREATE TABLE IF NOT EXISTS location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location geography(POINT, 4326) NOT NULL,
  accuracy numeric,
  speed numeric,
  heading numeric CHECK (heading >= 0 AND heading < 360),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_location_history_user_id ON location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_created_at ON location_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_location ON location_history USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_location_history_user_recent ON location_history(user_id, created_at DESC);

-- Partial index for recent locations (last 7 days)
CREATE INDEX IF NOT EXISTS idx_location_history_recent 
  ON location_history(user_id, created_at DESC) 
  WHERE created_at > now() - interval '7 days';

-- Enable RLS
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own location history"
  ON location_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own location history"
  ON location_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all location history"
  ON location_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to add location history entry
CREATE OR REPLACE FUNCTION add_location_history(
  p_user_id uuid,
  p_latitude numeric,
  p_longitude numeric,
  p_accuracy numeric DEFAULT NULL,
  p_speed numeric DEFAULT NULL,
  p_heading numeric DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  location_id uuid;
BEGIN
  INSERT INTO location_history (user_id, location, accuracy, speed, heading)
  VALUES (
    p_user_id,
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
    p_accuracy,
    p_speed,
    p_heading
  )
  RETURNING id INTO location_id;
  
  RETURN location_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent locations for a user
CREATE OR REPLACE FUNCTION get_recent_locations(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_hours integer DEFAULT 24
)
RETURNS TABLE (
  id uuid,
  latitude numeric,
  longitude numeric,
  accuracy numeric,
  speed numeric,
  heading numeric,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lh.id,
    ST_Y(lh.location::geometry)::numeric as latitude,
    ST_X(lh.location::geometry)::numeric as longitude,
    lh.accuracy,
    lh.speed,
    lh.heading,
    lh.created_at
  FROM location_history lh
  WHERE lh.user_id = p_user_id
    AND lh.created_at > now() - (p_hours || ' hours')::interval
  ORDER BY lh.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old location history (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_location_history()
RETURNS void AS $$
BEGIN
  DELETE FROM location_history
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to update user's current location in profiles table
CREATE OR REPLACE FUNCTION update_user_location()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET location = NEW.location, updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user's current location
CREATE TRIGGER update_profile_location
  AFTER INSERT ON location_history
  FOR EACH ROW EXECUTE FUNCTION update_user_location();