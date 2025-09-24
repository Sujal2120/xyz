/*
  # Create Location History Table

  1. New Tables
    - `location_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `location` (geography point)
      - `accuracy` (numeric, GPS accuracy in meters)
      - `speed` (numeric, speed in m/s)
      - `heading` (numeric, direction in degrees)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `location_history` table
    - Add policies for users to read their own location history
    - Add policies for admins to read all location history

  3. Functions
    - Cleanup old location history (keep last 30 days)
    - Get movement patterns
*/

CREATE TABLE IF NOT EXISTS location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location geography(POINT, 4326) NOT NULL,
  accuracy numeric,
  speed numeric,
  heading numeric,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_location_history_user_id ON location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_created_at ON location_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_location ON location_history USING GIST(location);

-- Function to cleanup old location history
CREATE OR REPLACE FUNCTION cleanup_old_location_history()
RETURNS void AS $$
BEGIN
  DELETE FROM location_history
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get movement patterns
CREATE OR REPLACE FUNCTION get_movement_patterns(
  target_user_id uuid,
  hours_back integer DEFAULT 24
)
RETURNS TABLE(
  total_distance numeric,
  avg_speed numeric,
  max_speed numeric,
  locations_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(
      ST_Distance(
        location,
        LAG(location) OVER (ORDER BY created_at)
      )
    ), 0) as total_distance,
    COALESCE(AVG(speed), 0) as avg_speed,
    COALESCE(MAX(speed), 0) as max_speed,
    COUNT(*) as locations_count
  FROM location_history
  WHERE 
    user_id = target_user_id
    AND created_at > now() - (hours_back || ' hours')::interval
    AND speed IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;