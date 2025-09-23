/*
  # Create Additional Indexes and Optimizations

  1. Performance Indexes
    - Composite indexes for common query patterns
    - Partial indexes for filtered queries
    - Expression indexes for computed values

  2. Database Optimizations
    - Query performance improvements
    - Storage optimizations
    - Maintenance functions

  3. Monitoring
    - Performance monitoring views
    - Query statistics
*/

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_incidents_tourist_status_created 
  ON incidents(tourist_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_severity_status 
  ON incidents(severity, status) 
  WHERE status IN ('pending', 'acknowledged');

CREATE INDEX IF NOT EXISTS idx_alerts_incident_status 
  ON alerts(incident_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_role_status 
  ON profiles(role, status) 
  WHERE role = 'tourist';

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_geofences_active_safe 
  ON geofences(safe, center) 
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_profiles_active_tourists_location 
  ON profiles USING GIST(location) 
  WHERE role = 'tourist' AND status = 'active' AND location IS NOT NULL;

-- Expression indexes for computed values
CREATE INDEX IF NOT EXISTS idx_incidents_age 
  ON incidents((created_at::date)) 
  WHERE status != 'resolved';

-- Function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE (
  table_name text,
  index_usage numeric,
  seq_scan_ratio numeric,
  avg_query_time numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    CASE 
      WHEN seq_scan + idx_scan = 0 THEN 0
      ELSE (idx_scan::numeric / (seq_scan + idx_scan)) * 100
    END as index_usage,
    CASE 
      WHEN seq_scan + idx_scan = 0 THEN 0
      ELSE (seq_scan::numeric / (seq_scan + idx_scan)) * 100
    END as seq_scan_ratio,
    0::numeric as avg_query_time -- Placeholder for actual query time analysis
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY seq_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get table sizes and statistics
CREATE OR REPLACE FUNCTION get_table_statistics()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  table_size text,
  index_size text,
  total_size text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    t.n_tup_ins - t.n_tup_del as row_count,
    pg_size_pretty(pg_total_relation_size(c.oid) - pg_indexes_size(c.oid)) as table_size,
    pg_size_pretty(pg_indexes_size(c.oid)) as index_size,
    pg_size_pretty(pg_total_relation_size(c.oid)) as total_size
  FROM pg_stat_user_tables t
  JOIN pg_class c ON c.relname = t.relname
  WHERE t.schemaname = 'public'
  ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for database maintenance
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS text AS $$
DECLARE
  result text := '';
BEGIN
  -- Analyze tables for query planner
  ANALYZE profiles;
  ANALYZE incidents;
  ANALYZE geofences;
  ANALYZE alerts;
  ANALYZE location_history;
  ANALYZE user_preferences;
  
  result := result || 'Tables analyzed. ';
  
  -- Clean up old location history
  PERFORM cleanup_old_location_history();
  result := result || 'Old location history cleaned. ';
  
  -- Auto-resolve old incidents
  PERFORM auto_resolve_old_incidents();
  result := result || 'Old incidents auto-resolved. ';
  
  -- Update statistics
  result := result || 'Maintenance completed successfully.';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for dashboard statistics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'tourist' AND status = 'active') as active_tourists,
  (SELECT COUNT(*) FROM incidents WHERE status IN ('pending', 'acknowledged')) as active_incidents,
  (SELECT COUNT(*) FROM incidents WHERE severity = 'critical' AND status != 'resolved') as critical_incidents,
  (SELECT COUNT(DISTINCT tourist_id) FROM geofence_violations_view) as tourists_in_danger,
  (SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) FROM incidents WHERE resolved_at IS NOT NULL AND created_at > now() - interval '24 hours') as avg_response_time_minutes,
  now() as last_updated;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_updated ON dashboard_stats(last_updated);

-- Function to refresh dashboard statistics
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Create function to get system health status
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS json AS $$
DECLARE
  health_data json;
  db_size bigint;
  active_connections integer;
BEGIN
  -- Get database size
  SELECT pg_database_size(current_database()) INTO db_size;
  
  -- Get active connections
  SELECT count(*) INTO active_connections 
  FROM pg_stat_activity 
  WHERE state = 'active' AND pid != pg_backend_pid();
  
  health_data := json_build_object(
    'database_size_mb', round(db_size / 1024.0 / 1024.0, 2),
    'active_connections', active_connections,
    'total_tourists', (SELECT COUNT(*) FROM profiles WHERE role = 'tourist'),
    'active_tourists', (SELECT COUNT(*) FROM profiles WHERE role = 'tourist' AND status = 'active'),
    'total_incidents', (SELECT COUNT(*) FROM incidents),
    'active_incidents', (SELECT COUNT(*) FROM incidents WHERE status IN ('pending', 'acknowledged')),
    'total_geofences', (SELECT COUNT(*) FROM geofences WHERE active = true),
    'system_status', 'healthy',
    'last_check', now()
  );
  
  RETURN health_data;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for monitoring functions
GRANT EXECUTE ON FUNCTION analyze_query_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated;
GRANT SELECT ON dashboard_stats TO authenticated;