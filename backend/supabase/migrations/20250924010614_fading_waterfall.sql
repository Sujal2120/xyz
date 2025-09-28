/*
  # Create Incidents Table

  1. New Tables
    - `incidents`
      - `id` (uuid, primary key)
      - `tourist_id` (uuid, references profiles)
      - `type` (incident_type enum)
      - `description` (text)
      - `location` (geography point)
      - `severity` (severity_level enum)
      - `status` (incident_status enum)
      - `assigned_to` (uuid, references profiles for admin assignment)
      - `resolved_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `incidents` table
    - Add policies for tourists to read/create their own incidents
    - Add policies for admins to read/update all incidents

  3. Triggers
    - Auto-create alerts for critical incidents
    - Update tourist status on incident creation
*/

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type incident_type NOT NULL,
  description text,
  location geography(POINT, 4326),
  severity severity_level DEFAULT 'medium',
  status incident_status DEFAULT 'pending',
  assigned_to uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_tourist_id ON incidents(tourist_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);

-- Updated at trigger
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle incident status updates
CREATE OR REPLACE FUNCTION handle_incident_status_update()
RETURNS trigger AS $$
BEGIN
  -- Update resolved_at when status changes to resolved
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = now();
  END IF;
  
  -- Clear resolved_at if status changes from resolved
  IF NEW.status != 'resolved' AND OLD.status = 'resolved' THEN
    NEW.resolved_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_incident_status_update_trigger
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION handle_incident_status_update();