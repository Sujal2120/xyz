/*
  # Create incidents table for emergency reports

  1. New Tables
    - `incidents`
      - `id` (uuid, primary key)
      - `tourist_id` (uuid, references profiles.id)
      - `type` (enum: emergency, medical, theft, harassment, other)
      - `description` (text)
      - `location` (geography point)
      - `status` (enum: pending, acknowledged, resolved, false_alarm)
      - `severity` (enum: low, medium, high, critical)
      - `assigned_to` (uuid, references profiles.id for admin)
      - `resolved_at` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `incidents` table
    - Add policies for tourists to read/create their own incidents
    - Add policies for admins to read/update all incidents
*/

-- Create enum types
CREATE TYPE incident_type AS ENUM ('emergency', 'medical', 'theft', 'harassment', 'lost', 'other');
CREATE TYPE incident_status AS ENUM ('pending', 'acknowledged', 'resolved', 'false_alarm');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type incident_type NOT NULL,
  description text,
  location geography(POINT, 4326),
  status incident_status DEFAULT 'pending',
  severity incident_severity DEFAULT 'medium',
  assigned_to uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger for updated_at
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set resolved_at when status changes to resolved
CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = now();
  ELSIF NEW.status != 'resolved' THEN
    NEW.resolved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for resolved_at
CREATE TRIGGER set_incidents_resolved_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION set_resolved_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS incidents_tourist_id_idx ON incidents(tourist_id);
CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents(status);
CREATE INDEX IF NOT EXISTS incidents_severity_idx ON incidents(severity);
CREATE INDEX IF NOT EXISTS incidents_type_idx ON incidents(type);
CREATE INDEX IF NOT EXISTS incidents_location_idx ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS incidents_created_at_idx ON incidents(created_at DESC);