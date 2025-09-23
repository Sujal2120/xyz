/*
  # Create Incidents Table

  1. New Tables
    - `incidents`
      - `id` (uuid, primary key)
      - `tourist_id` (uuid, references profiles)
      - `type` (enum: emergency, medical, theft, harassment, lost, other)
      - `description` (text, optional)
      - `location` (geography point)
      - `status` (enum: pending, acknowledged, resolved, false_alarm)
      - `severity` (enum: low, medium, high, critical)
      - `assigned_to` (uuid, references profiles for admin assignment)
      - `resolved_at` (timestamp, when incident was resolved)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `incidents` table
    - Tourists can read their own incidents
    - Admins can read and manage all incidents

  3. Indexes
    - Index on tourist_id for efficient user queries
    - Index on status for filtering
    - Spatial index on location
*/

-- Create incident type enum
DO $$ BEGIN
  CREATE TYPE incident_type AS ENUM ('emergency', 'medical', 'theft', 'harassment', 'lost', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create incident status enum
DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM ('pending', 'acknowledged', 'resolved', 'false_alarm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create severity enum
DO $$ BEGIN
  CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type incident_type NOT NULL,
  description text,
  location geography(POINT, 4326),
  status incident_status DEFAULT 'pending',
  severity severity_level DEFAULT 'medium',
  assigned_to uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_incidents_tourist_id ON incidents(tourist_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tourists can read own incidents"
  ON incidents
  FOR SELECT
  TO authenticated
  USING (tourist_id = auth.uid());

CREATE POLICY "Tourists can create own incidents"
  ON incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (tourist_id = auth.uid());

CREATE POLICY "Admins can read all incidents"
  ON incidents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all incidents"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-resolve incidents after certain time
CREATE OR REPLACE FUNCTION auto_resolve_old_incidents()
RETURNS void AS $$
BEGIN
  UPDATE incidents
  SET status = 'resolved', resolved_at = now()
  WHERE status = 'pending'
    AND created_at < now() - interval '24 hours'
    AND severity IN ('low', 'medium');
END;
$$ LANGUAGE plpgsql;