/*
  # Create Alerts Table

  1. New Table: alerts
    - id (uuid, primary key)
    - incident_id (uuid, references incidents)
    - authority_contact (text, contact information)
    - message (text, alert message)
    - alert_type (alert_type, sms/email/push/call)
    - status (alert_status, pending/sent/failed/acknowledged)
    - sent_at (timestamptz, when alert was sent)
    - acknowledged_at (timestamptz, when acknowledged)
    - created_at (timestamptz)

  2. Security
    - Enable RLS
    - Only admins can manage alerts

  3. Indexes
    - Index on incident_id
    - Index on status
    - Index on created_at
*/

-- Create alerts table
CREATE TABLE alerts (
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

-- RLS Policies
CREATE POLICY "Admins can manage all alerts"
  ON alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_alerts_incident_id ON alerts USING btree(incident_id);
CREATE INDEX idx_alerts_status ON alerts USING btree(status);
CREATE INDEX idx_alerts_created_at ON alerts USING btree(created_at DESC);