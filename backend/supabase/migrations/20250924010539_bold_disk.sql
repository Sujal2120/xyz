/*
  # Create System Enums

  1. User Roles
    - tourist: Regular tourist users
    - admin: Authority/admin users

  2. Incident Types
    - Various emergency and incident types

  3. Status Types
    - For incidents, alerts, and user status

  4. Theme Preferences
    - Light, dark, and system theme options
*/

-- User roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('tourist', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- User status
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive', 'alert');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Incident types
DO $$ BEGIN
  CREATE TYPE incident_type AS ENUM ('emergency', 'medical', 'theft', 'harassment', 'lost', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Severity levels
DO $$ BEGIN
  CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Incident status
DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM ('pending', 'acknowledged', 'resolved', 'false_alarm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alert types
DO $$ BEGIN
  CREATE TYPE alert_type AS ENUM ('sms', 'email', 'push', 'call');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alert status
DO $$ BEGIN
  CREATE TYPE alert_status AS ENUM ('pending', 'sent', 'failed', 'acknowledged');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Theme preferences
DO $$ BEGIN
  CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;