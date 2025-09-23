/*
  # Create System Enums

  1. User Management
    - user_role: tourist, admin
    - user_status: active, inactive, alert

  2. Incident Management
    - incident_type: emergency, medical, theft, harassment, lost, other
    - incident_status: pending, acknowledged, resolved, false_alarm
    - severity_level: low, medium, high, critical

  3. Alert System
    - alert_type: sms, email, push, call
    - alert_status: pending, sent, failed, acknowledged

  4. User Preferences
    - theme_preference: light, dark, system
*/

-- User management enums
CREATE TYPE user_role AS ENUM ('tourist', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'alert');

-- Incident management enums
CREATE TYPE incident_type AS ENUM ('emergency', 'medical', 'theft', 'harassment', 'lost', 'other');
CREATE TYPE incident_status AS ENUM ('pending', 'acknowledged', 'resolved', 'false_alarm');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Alert system enums
CREATE TYPE alert_type AS ENUM ('sms', 'email', 'push', 'call');
CREATE TYPE alert_status AS ENUM ('pending', 'sent', 'failed', 'acknowledged');

-- User preferences enums
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');