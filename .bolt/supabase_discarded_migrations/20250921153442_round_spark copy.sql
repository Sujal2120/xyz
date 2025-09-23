/*
  # Create geofences table for safe zones

  1. New Tables
    - `geofences`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `center` (geography point)
      - `radius_meters` (float, not null)
      - `safe` (boolean, default true)
      - `active` (boolean, default true)
      - `created_by` (uuid, references profiles.id)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `geofences` table
    - Add policies for authenticated users to read geofences
    - Add policies for admins to create/update geofences
*/

-- Create geofences table
CREATE TABLE IF NOT EXISTS geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  center geography(POINT, 4326) NOT NULL,
  radius_meters float NOT NULL CHECK (radius_meters > 0),
  safe boolean DEFAULT true,
  active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read active geofences"
  ON geofences
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can insert geofences"
  ON geofences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update geofences"
  ON geofences
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_geofences_updated_at
  BEFORE UPDATE ON geofences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create spatial index for better performance
CREATE INDEX IF NOT EXISTS geofences_center_idx ON geofences USING GIST(center);
CREATE INDEX IF NOT EXISTS geofences_active_idx ON geofences(active);
CREATE INDEX IF NOT EXISTS geofences_safe_idx ON geofences(safe);