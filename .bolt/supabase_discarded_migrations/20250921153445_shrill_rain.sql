/*
  # Create alerts table for incident notifications

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `incident_id` (uuid, references incidents.id)
      - `authority_contact` (text, phone/email)
      - `message` (text, not null)
      - `alert_type` (enum: sms, email, push, call)
      - `status` (enum: pending, sent, delivered, failed, acknowledged)
      - `sent_at` (timestamptz)
      - `acknowledged_at` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `alerts` table
    - Add policies for admins to read/create/update alerts
    - Add policies for tourists to read alerts related to their incidents
*/

-- Create enum types
CREATE TYPE alert_type AS ENUM ('sms', 'email', 'push', 'call');
CREATE TYPE alert_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'acknowledged');

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read all alerts"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create alerts"
  ON alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update alerts"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Tourists can read alerts for their incidents"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = alerts.incident_id
      AND incidents.tourist_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set sent_at when status changes to sent
CREATE OR REPLACE FUNCTION set_sent_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND OLD.status = 'pending' THEN
    NEW.sent_at = now();
  ELSIF NEW.status = 'acknowledged' AND OLD.status != 'acknowledged' THEN
    NEW.acknowledged_at = now();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sent_at and acknowledged_at
CREATE TRIGGER set_alerts_timestamps
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION set_sent_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS alerts_incident_id_idx ON alerts(incident_id);
CREATE INDEX IF NOT EXISTS alerts_status_idx ON alerts(status);
CREATE INDEX IF NOT EXISTS alerts_alert_type_idx ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS alerts_created_at_idx ON alerts(created_at DESC);