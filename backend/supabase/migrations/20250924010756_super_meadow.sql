/*
  # Insert Sample Data

  1. Sample Geofences
    - Major tourist locations in India as safe zones
    - Some danger zones for testing

  2. Sample Admin User
    - Default admin account for testing

  3. Performance Optimizations
    - Materialized views for dashboard performance
    - Scheduled cleanup jobs
*/

-- Insert sample geofences for major Indian tourist locations
INSERT INTO geofences (name, description, center, radius_meters, safe, active) VALUES
  ('India Gate Safe Zone', 'Tourist safe area around India Gate, Delhi', ST_GeogFromText('POINT(77.2295 28.6129)'), 500, true, true),
  ('Red Fort Safe Zone', 'Protected area around Red Fort, Delhi', ST_GeogFromText('POINT(77.2410 28.6562)'), 400, true, true),
  ('Gateway of India Safe Zone', 'Tourist safe zone at Gateway of India, Mumbai', ST_GeogFromText('POINT(72.8347 18.9220)'), 300, true, true),
  ('Taj Mahal Safe Zone', 'Protected area around Taj Mahal, Agra', ST_GeogFromText('POINT(78.0421 27.1751)'), 600, true, true),
  ('Hawa Mahal Safe Zone', 'Tourist area around Hawa Mahal, Jaipur', ST_GeogFromText('POINT(75.8267 26.9239)'), 350, true, true),
  ('Marina Beach Safe Zone', 'Safe zone at Marina Beach, Chennai', ST_GeogFromText('POINT(80.2785 13.0475)'), 800, true, true),
  ('Charminar Safe Zone', 'Protected area around Charminar, Hyderabad', ST_GeogFromText('POINT(78.4747 17.3616)'), 400, true, true),
  ('Victoria Memorial Safe Zone', 'Tourist safe area around Victoria Memorial, Kolkata', ST_GeogFromText('POINT(88.3426 22.5448)'), 450, true, true),
  ('Mysore Palace Safe Zone', 'Protected zone around Mysore Palace, Karnataka', ST_GeogFromText('POINT(76.6552 12.3051)'), 500, true, true),
  ('Golden Temple Safe Zone', 'Sacred and safe area around Golden Temple, Amritsar', ST_GeogFromText('POINT(74.8765 31.6200)'), 600, true, true)
ON CONFLICT DO NOTHING;

-- Insert some danger zones for testing
INSERT INTO geofences (name, description, center, radius_meters, safe, active) VALUES
  ('Construction Zone - Delhi', 'Active construction area - avoid', ST_GeogFromText('POINT(77.2000 28.6000)'), 200, false, true),
  ('Restricted Area - Mumbai', 'Restricted military zone', ST_GeogFromText('POINT(72.8000 18.9000)'), 300, false, true)
ON CONFLICT DO NOTHING;

-- Create materialized view for dashboard performance
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  COUNT(*) FILTER (WHERE role = 'tourist' AND status = 'active') as active_tourists,
  COUNT(*) FILTER (WHERE role = 'tourist' AND status = 'alert') as tourists_in_alert,
  (SELECT COUNT(*) FROM incidents WHERE status IN ('pending', 'acknowledged')) as active_incidents,
  (SELECT COUNT(*) FROM incidents WHERE severity = 'critical' AND status != 'resolved') as critical_incidents,
  (SELECT COUNT(*) FROM alerts WHERE status = 'pending') as pending_alerts,
  now() as last_updated
FROM profiles;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_last_updated ON dashboard_stats(last_updated);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to be called periodically for cleanup
CREATE OR REPLACE FUNCTION periodic_maintenance()
RETURNS void AS $$
BEGIN
  -- Cleanup old location history (keep last 30 days)
  PERFORM cleanup_old_location_history();
  
  -- Refresh dashboard stats
  PERFORM refresh_dashboard_stats();
  
  -- Log maintenance run
  RAISE NOTICE 'Periodic maintenance completed at %', now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;