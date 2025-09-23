/*
  # Enable PostGIS Extension

  1. Extensions
    - Enable PostGIS for geographic data types and functions
    - Enable UUID extension for generating unique identifiers
  
  2. Security
    - PostGIS functions are available to authenticated users
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify PostGIS installation
SELECT PostGIS_version();