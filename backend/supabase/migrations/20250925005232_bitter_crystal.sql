/*
  # Enable Required Extensions

  1. Extensions
    - Enable PostGIS for geographic data
    - Enable UUID generation
    - Enable pgcrypto for security functions

  2. Verification
    - Check that PostGIS is properly installed
    - Verify extension versions
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable PostGIS (this may require superuser privileges)
-- If this fails, PostGIS needs to be installed on the database
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "postgis";
    RAISE NOTICE 'PostGIS extension enabled successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'PostGIS extension not available. Geographic features will be limited.';
        -- Create a simple point type as fallback
        DO $fallback$
        BEGIN
            CREATE TYPE simple_point AS (lat DECIMAL, lng DECIMAL);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $fallback$;
END $$;

-- Verify extensions
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'postgis');