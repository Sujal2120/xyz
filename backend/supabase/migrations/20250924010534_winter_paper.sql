/*
  # Enable Required Extensions

  1. Extensions
    - Enable PostGIS for geographic data types and functions
    - Enable UUID extension for generating unique identifiers
    - Enable pgcrypto for secure random generation

  2. Verification
    - Verify PostGIS installation
    - Create basic spatial reference systems if needed
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Verify PostGIS installation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    RAISE EXCEPTION 'PostGIS extension is required but not available';
  END IF;
END $$;