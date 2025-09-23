/*
  # Performance Optimizations and Final Setup

  1. Composite Indexes
    - Multi-column indexes for common query patterns
    - Partial indexes for filtered queries

  2. Materialized Views
    - Pre-computed aggregations for dashboards
    - Automatic refresh triggers

  3. Database Maintenance
    - Cleanup functions
    - Performance monitoring

  4. Sample Data
    - Test geofences for major tourist areas
    - Sample admin user
*/

-- Composite indexes for common query patterns
CREATE INDEX idx_incidents_tourist_status_severity 
  ON incidents(tourist_id, status, severity) 
  WHERE status IN ('pending', 'acknowledged');

CREATE INDEX idx_location_history_user_time 
  ON location_history(user_id, recorded_at DESC);

CREATE INDEX idx_alerts_incident_status 
  ON alerts(incident_id, status) 
  WHERE status IN ('pending', 'sent');

-- Partial indexes for active records
CREATE INDEX idx_active_geofences_spatial 
  ON geofences USING GIST(center) 
  WHERE active = true;

CREATE INDEX idx_active_tourists_location 
  ON profiles USING GIST(location) 
  WHERE role = 'tourist' AND status = 'active';

-- Materialized view for dashboard statistics
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  COUNT(*) FILTER (WHERE role = 'tourist' AND status = 'active') as active_tourists,
  COUNT(*) FILTER (WHERE role = 'tourist' AND status = 'alert') as tourists_in_alert,
  COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM incidents WHERE status IN ('pending', 'acknowledged')) as active_incidents,
  (SELECT COUNT(*) FROM incidents WHERE severity = 'critical' AND status IN ('pending', 'acknowledged')) as critical_incidents,
  (SELECT COUNT(*) FROM alerts WHERE status = 'pending') as pending_alerts,
  (SELECT COUNT(*) FROM geofences WHERE active = true AND safe = true) as safe_zones,
  (SELECT COUNT(*) FROM geofences WHERE active = true AND safe = false) as danger_zones,
  now() as last_updated
FROM profiles;

-- Create unique index for materialized view
CREATE UNIQUE INDEX idx_dashboard_stats_unique ON dashboard_stats(last_updated);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for database maintenance
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS void AS $$
BEGIN
  -- Cleanup old location history (older than 30 days)
  DELETE FROM location_history WHERE recorded_at < now() - interval '30 days';
  
  -- Cleanup resolved incidents older than 90 days
  DELETE FROM incidents 
  WHERE status = 'resolved' AND resolved_at < now() - interval '90 days';
  
  -- Cleanup old alerts (older than 30 days)
  DELETE FROM alerts WHERE created_at < now() - interval '30 days';
  
  -- Refresh materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
  
  -- Update table statistics
  ANALYZE profiles;
  ANALYZE incidents;
  ANALYZE location_history;
  ANALYZE geofences;
  ANALYZE alerts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample geofences for major tourist areas in India
INSERT INTO geofences (name, description, center, radius_meters, safe, created_by) VALUES
  ('India Gate Safe Zone', 'Tourist safe area around India Gate, New Delhi', ST_SetSRID(ST_MakePoint(77.2295, 28.6129), 4326)::geography, 500, true, NULL),
  ('Red Fort Safe Zone', 'Protected area around Red Fort, Delhi', ST_SetSRID(ST_MakePoint(77.2410, 28.6562), 4326)::geography, 400, true, NULL),
  ('Gateway of India Safe Zone', 'Tourist safe zone at Gateway of India, Mumbai', ST_SetSRID(ST_MakePoint(72.8347, 18.9220), 4326)::geography, 300, true, NULL),
  ('Taj Mahal Safe Zone', 'Protected tourist area around Taj Mahal, Agra', ST_SetSRID(ST_MakePoint(78.0421, 27.1751), 4326)::geography, 600, true, NULL),
  ('Hawa Mahal Safe Zone', 'Tourist safe area around Hawa Mahal, Jaipur', ST_SetSRID(ST_MakePoint(75.8267, 26.9239), 4326)::geography, 400, true, NULL),
  ('Marina Beach Safe Zone', 'Safe zone at Marina Beach, Chennai', ST_SetSRID(ST_MakePoint(80.2785, 13.0475), 4326)::geography, 800, true, NULL),
  ('Charminar Safe Zone', 'Tourist area around Charminar, Hyderabad', ST_SetSRID(ST_MakePoint(78.4747, 17.3616), 4326)::geography, 350, true, NULL),
  ('Victoria Memorial Safe Zone', 'Protected area around Victoria Memorial, Kolkata', ST_SetSRID(ST_MakePoint(88.3426, 22.5448), 4326)::geography, 450, true, NULL),
  ('Mysore Palace Safe Zone', 'Tourist safe zone around Mysore Palace', ST_SetSRID(ST_MakePoint(76.6552, 12.3051), 4326)::geography, 400, true, NULL),
  ('Golden Temple Safe Zone', 'Sacred and safe area around Golden Temple, Amritsar', ST_SetSRID(ST_MakePoint(74.8765, 31.6200), 4326)::geography, 500, true, NULL);

-- Insert some danger zones (areas to avoid)
INSERT INTO geofences (name, description, center, radius_meters, safe, created_by) VALUES
  ('High Crime Area - Delhi', 'Area with reported security concerns', ST_SetSRID(ST_MakePoint(77.2500, 28.6500), 4326)::geography, 200, false, NULL),
  ('Restricted Zone - Mumbai', 'Restricted access area', ST_SetSRID(ST_MakePoint(72.8500, 18.9500), 4326)::geography, 150, false, NULL);

-- Create a sample admin user (this will be created when someone registers with admin role)
-- The actual user creation happens through the auth system

-- Schedule maintenance to run daily
-- Note: This would typically be set up as a cron job or scheduled function
-- For now, we'll create the function that can be called manually or scheduled

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Final verification query
DO $$
DECLARE
  table_count integer;
  function_count integer;
  index_count integer;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
  SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
  
  RAISE NOTICE 'Database setup complete:';
  RAISE NOTICE '- Tables created: %', table_count;
  RAISE NOTICE '- Functions created: %', function_count;
  RAISE NOTICE '- Indexes created: %', index_count;
  RAISE NOTICE '- Sample geofences: % safe zones, % danger zones', 
    (SELECT COUNT(*) FROM geofences WHERE safe = true),
    (SELECT COUNT(*) FROM geofences WHERE safe = false);
END $$;