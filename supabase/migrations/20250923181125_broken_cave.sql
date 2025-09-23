/*
  # Create Alerts Table

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `incident_id` (uuid, references incidents)
      - `authority_contact` (text, contact information)
      - `message` (text, alert message)
      - `alert_type` (enum: sms, email, push, call)
      - `status` (enum: pending, sent, failed, acknowledged)
      - `sent_at` (timestamp, when alert was sent)
      - `acknowledged_at` (timestamp, when alert was acknowledged)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `alerts` table
    - Only admins can read and manage alerts

  3. Indexes
    - Index on incident_id for efficient queries
    - Index on status for filtering
*/

-- Create alert type enum
DO $$ BEGIN
  CREATE TYPE alert_type AS ENUM ('sms', 'email', 'push', 'call');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create alert status enum
DO $$ BEGIN
  CREATE TYPE alert_status AS ENUM ('pending', 'sent', 'failed', 'acknowledged');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create alerts table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alerts_incident_id ON alerts(incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all alerts"
  ON alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create automatic alerts for critical incidents
CREATE OR REPLACE FUNCTION create_automatic_alert()
RETURNS trigger AS $$
BEGIN
  -- Create alert for critical incidents
  IF NEW.severity = 'critical' THEN
    INSERT INTO alerts (incident_id, authority_contact, message, alert_type)
    VALUES (
      NEW.id,
      'emergency@tourism.gov.in',
      'CRITICAL INCIDENT: ' || NEW.type || ' reported by tourist ID: ' || 
      (SELECT digital_id FROM profiles WHERE id = NEW.tourist_id),
      'call'
    );
  -- Create alert for high severity incidents
  ELSIF NEW.severity = 'high' THEN
    INSERT INTO alerts (incident_id, authority_contact, message, alert_type)
    VALUES (
      NEW.id,
      'alerts@tourism.gov.in',
      'HIGH PRIORITY: ' || NEW.type || ' incident reported',
      'push'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic alert creation
CREATE TRIGGER create_incident_alert
  AFTER INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION create_automatic_alert();