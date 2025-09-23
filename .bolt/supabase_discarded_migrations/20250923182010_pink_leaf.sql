/*
  # Create Location History Table

  1. New Table: location_history
    - id (uuid, primary key)
    - user_id (uuid, references profiles)
    - location (geography point)
    - accuracy (numeric, GPS accuracy in meters)
    - speed (numeric, speed in m/s, optional)
    - heading (numeric, direction in degrees, optional)
    - altitude (numeric, altitude in meters, optional)
    - recorded_at (timestamptz, when location was recorded)
    - created_at (timestamptz)

  2. Security
    - Enable RLS
    - Users can read own location history
    - Admins can read all location history

  3. Indexes
    - Index on user_id
    - Spatial index on location
    - Index on recorded_at for time-based queries

  4. Cleanup
    - Automatic cleanup of old location data (older than 30 days)
*/

-- Create location_history table
CREATE TABLE location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location geography(POINT, 4326) NOT NULL,
  accuracy numeric,
  speed numeric,
  heading numeric CHECK (heading >= 0 AND heading < 360),
  altitude numeric,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own location history"
  ON location_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own location history"
  ON location_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all location history"
  ON location_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_location_history_user_id ON location_history USING btree(user_id);
CREATE INDEX idx_location_history_location ON location_history USING GIST(location);
CREATE INDEX idx_location_history_recorded_at ON location_history USING btree(recorded_at DESC);

-- Function to cleanup old location data
CREATE OR REPLACE FUNCTION cleanup_old_location_data()
RETURNS void AS $$
BEGIN
  DELETE FROM location_history
  WHERE recorded_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add location history entry
CREATE OR REPLACE FUNCTION add_location_history(
  p_user_id uuid,
  p_latitude numeric,
  p_longitude numeric,
  p_accuracy numeric DEFAULT NULL,
  p_speed numeric DEFAULT NULL,
  p_heading numeric DEFAULT NULL,
  p_altitude numeric DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  location_id uuid;
BEGIN
  INSERT INTO location_history (
    user_id,
    location,
    accuracy,
    speed,
    heading,
    altitude
  ) VALUES (
    p_user_id,
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
    p_accuracy,
    p_speed,
    p_heading,
    p_altitude
  ) RETURNING id INTO location_id;
  
  RETURN location_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;