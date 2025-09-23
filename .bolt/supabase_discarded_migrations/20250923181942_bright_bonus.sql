/*
  # Create Incidents Table

  1. New Table: incidents
    - id (uuid, primary key)
    - tourist_id (uuid, references profiles)
    - type (incident_type, required)
    - description (text, optional)
    - location (geography point, incident location)
    - status (incident_status, default 'pending')
    - severity (severity_level, default 'medium')
    - assigned_to (uuid, references profiles for admin assignment)
    - resolved_at (timestamptz, when resolved)
    - created_at (timestamptz)
    - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Tourists can create own incidents and read own incidents
    - Admins can read and update all incidents

  3. Indexes
    - Index on tourist_id
    - Index on status
    - Index on severity
    - Spatial index on location
    - Index on created_at for time-based queries
*/

-- Create incidents table
CREATE TABLE incidents (
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

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tourists can create own incidents"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (tourist_id = auth.uid());

CREATE POLICY "Tourists can read own incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (tourist_id = auth.uid());

CREATE POLICY "Admins can read all incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all incidents"
  ON incidents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_incidents_tourist_id ON incidents USING btree(tourist_id);
CREATE INDEX idx_incidents_status ON incidents USING btree(status);
CREATE INDEX idx_incidents_severity ON incidents USING btree(severity);
CREATE INDEX idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX idx_incidents_created_at ON incidents USING btree(created_at DESC);

-- Update timestamp trigger
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create automatic alert for critical incidents
CREATE OR REPLACE FUNCTION create_automatic_alert()
RETURNS trigger AS $$
BEGIN
  -- Create alert for high and critical severity incidents
  IF NEW.severity IN ('high', 'critical') THEN
    INSERT INTO alerts (
      incident_id,
      authority_contact,
      message,
      alert_type,
      status
    ) VALUES (
      NEW.id,
      'emergency@tourism.gov.in',
      format('%s INCIDENT: %s reported by tourist %s', 
        NEW.severity::text, 
        NEW.type::text, 
        NEW.tourist_id::text
      ),
      CASE WHEN NEW.severity = 'critical' THEN 'call'::alert_type ELSE 'push'::alert_type END,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic alert creation
CREATE TRIGGER create_incident_alert
  AFTER INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION create_automatic_alert();