/*
  # Create Alerts Table

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `incident_id` (uuid, references incidents)
      - `authority_contact` (text)
      - `message` (text)
      - `alert_type` (alert_type enum)
      - `status` (alert_status enum)
      - `sent_at` (timestamp)
      - `acknowledged_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `alerts` table
    - Add policies for admins to manage alerts

  3. Functions
    - Auto-create alerts for critical incidents
*/

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  authority_contact text NOT NULL,
  message text NOT NULL,
  alert_type alert_type DEFAULT 'push',
  status alert_status DEFAULT 'pending',
  sent_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage alerts"
  ON alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_incident_id ON alerts(incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Function to auto-create alerts for critical incidents
CREATE OR REPLACE FUNCTION create_incident_alert()
RETURNS trigger AS $$
DECLARE
  tourist_name text;
  tourist_digital_id text;
  alert_message text;
  alert_contact text;
  alert_type_to_use alert_type;
BEGIN
  -- Get tourist information
  SELECT name, digital_id INTO tourist_name, tourist_digital_id
  FROM profiles
  WHERE id = NEW.tourist_id;
  
  -- Determine alert type based on severity
  alert_type_to_use := CASE 
    WHEN NEW.severity = 'critical' THEN 'call'::alert_type
    WHEN NEW.severity = 'high' THEN 'sms'::alert_type
    ELSE 'push'::alert_type
  END;
  
  -- Create alert message
  alert_message := format(
    '%s INCIDENT: %s reported by %s (ID: %s). Location: %s',
    NEW.severity::text,
    NEW.type::text,
    COALESCE(tourist_name, 'Unknown'),
    COALESCE(tourist_digital_id, 'Unknown'),
    CASE 
      WHEN NEW.location IS NOT NULL THEN 'GPS coordinates available'
      ELSE 'Location unknown'
    END
  );
  
  -- Determine authority contact
  alert_contact := CASE 
    WHEN NEW.severity IN ('critical', 'high') THEN 'emergency@tourism.gov.in'
    ELSE 'alerts@tourism.gov.in'
  END;
  
  -- Create alert
  INSERT INTO alerts (
    incident_id,
    authority_contact,
    message,
    alert_type,
    status
  ) VALUES (
    NEW.id,
    alert_contact,
    alert_message,
    alert_type_to_use,
    'pending'
  );
  
  -- Update tourist status for critical incidents
  IF NEW.severity = 'critical' THEN
    UPDATE profiles 
    SET status = 'alert'
    WHERE id = NEW.tourist_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create alerts
CREATE TRIGGER create_incident_alert_trigger
  AFTER INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION create_incident_alert();