# Deployment Guide - Tourist Safety System

Complete deployment guide for the Smart Tourist Safety Monitoring & Incident Response System backend.

## 🚀 Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Docker](https://docker.com) installed (for local development)
- [Git](https://git-scm.com) installed
- Node.js 18+ (for local testing)

## 📋 Step-by-Step Deployment

### 1. Supabase Project Setup

#### Create New Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and enter project details:
   - **Name**: `tourist-safety-system`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users

#### Enable PostGIS Extension
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 2. Local Development Setup

#### Initialize Supabase Locally
```bash
# Clone your project (if using version control)
git clone <your-repo-url>
cd tourist-safety-system

# Initialize Supabase
supabase init

# Link to your remote project
supabase link --project-ref <your-project-ref>

# Start local development
supabase start
```

#### Environment Variables
Create `.env.local` file:
```env
# Get these from Supabase Dashboard > Settings > API
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For local development
SUPABASE_LOCAL_URL=http://localhost:54321
SUPABASE_LOCAL_ANON_KEY=your-local-anon-key
```

### 3. Database Migration

#### Apply Migrations
```bash
# Reset database and apply all migrations
supabase db reset

# Or apply migrations individually
supabase db push
```

#### Verify Migration
```bash
# Check migration status
supabase migration list

# Verify tables were created
supabase db diff
```

### 4. Deploy Edge Functions

#### Deploy All Functions
```bash
# Deploy all functions at once
supabase functions deploy auth-register
supabase functions deploy auth-login
supabase functions deploy location-update
supabase functions deploy geofence-check
supabase functions deploy geofence-manage
supabase functions deploy incident-report
supabase functions deploy incident-manage
supabase functions deploy alert-send
```

#### Deploy Individual Function
```bash
# Deploy specific function
supabase functions deploy auth-register --no-verify-jwt

# Deploy with custom import map
supabase functions deploy incident-report --import-map import_map.json
```

#### Verify Deployment
```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs auth-register
```

### 5. Configure Environment Variables

#### Set Function Secrets
```bash
# Set environment variables for Edge Functions
supabase secrets set TWILIO_ACCOUNT_SID=your_twilio_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_token
supabase secrets set SENDGRID_API_KEY=your_sendgrid_key
supabase secrets set FCM_SERVER_KEY=your_fcm_key

# List all secrets
supabase secrets list
```

### 6. Database Security Configuration

#### Enable RLS (Already in migrations)
```sql
-- Verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### Test RLS Policies
```sql
-- Test as tourist user
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid", "role": "tourist"}';

-- Should only see own data
SELECT * FROM profiles WHERE id = 'user-uuid';
SELECT * FROM incidents WHERE tourist_id = 'user-uuid';
```

### 7. API Testing

#### Test Authentication
```bash
# Test registration
curl -X POST "https://your-project-ref.supabase.co/functions/v1/auth-register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "+91XXXXXXXXXX"
  }'
```

#### Test Core Functions
```bash
# Test incident reporting (requires JWT token)
curl -X POST "https://your-project-ref.supabase.co/functions/v1/incident-report" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{
    "type": "emergency",
    "description": "Test incident",
    "latitude": 25.5941,
    "longitude": 85.1376,
    "severity": "medium"
  }'
```

### 8. Production Configuration

#### CORS Configuration
```sql
-- Update CORS settings in Supabase Dashboard
-- Go to Settings > API > CORS Origins
-- Add your frontend domains:
-- https://yourdomain.com
-- https://www.yourdomain.com
-- For mobile apps: capacitor://localhost, http://localhost
```

#### Rate Limiting
```sql
-- Configure rate limiting in Supabase Dashboard
-- Go to Settings > API > Rate Limiting
-- Set appropriate limits for your use case
```

### 9. Monitoring & Logging

#### Enable Logging
```bash
# View real-time logs
supabase functions logs --follow

# View specific function logs
supabase functions logs incident-report --follow
```

#### Set Up Monitoring
1. Go to Supabase Dashboard > Observability
2. Configure alerts for:
   - High error rates
   - Slow query performance
   - High resource usage
   - Failed function executions

### 10. Backup & Recovery

#### Database Backup
```bash
# Create backup
supabase db dump --file backup.sql

# Restore from backup
supabase db reset --file backup.sql
```

#### Function Backup
```bash
# Functions are version controlled in your repository
# Ensure all functions are committed to Git
git add supabase/functions/
git commit -m "Backup Edge Functions"
git push origin main
```

## 🔧 Configuration Files

### supabase/config.toml
```toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
port = 54324
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://yourdomain.com"]
jwt_expiry = 3600
enable_signup = true
enable_confirmations = false

[functions]
enabled = true
port = 54325

[db]
port = 54322
major_version = 15
```

### import_map.json (for Edge Functions)
```json
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2",
    "cors": "https://deno.land/x/cors@v1.2.2/mod.ts"
  }
}
```

## 🌐 Frontend Integration

### Environment Variables for Frontend

#### Next.js (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### React (.env)
```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

#### Flutter (lib/config.dart)
```dart
class Config {
  static const String supabaseUrl = 'https://your-project-ref.supabase.co';
  static const String supabaseAnonKey = 'your-anon-key';
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Migration Errors
```bash
# Check migration status
supabase migration list

# Fix migration conflicts
supabase db diff --schema public

# Reset and reapply
supabase db reset
```

#### 2. Function Deployment Errors
```bash
# Check function syntax
deno check supabase/functions/function-name/index.ts

# Deploy with verbose logging
supabase functions deploy function-name --debug
```

#### 3. RLS Policy Issues
```sql
-- Test policies in SQL Editor
SELECT * FROM auth.users();
SELECT auth.uid();
SELECT auth.role();
```

#### 4. CORS Issues
- Verify CORS origins in Supabase Dashboard
- Check request headers in browser dev tools
- Ensure proper Authorization header format

### Performance Optimization

#### Database Indexes
```sql
-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_incidents_tourist_id ON incidents(tourist_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);

-- Spatial indexes for geofences
CREATE INDEX IF NOT EXISTS idx_geofences_center ON geofences USING GIST(center);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST(location);
```

#### Function Optimization
```typescript
// Use connection pooling
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

## 📊 Monitoring Dashboard

### Key Metrics to Monitor

1. **API Response Times**
   - Function execution duration
   - Database query performance
   - Error rates by endpoint

2. **Database Performance**
   - Connection pool usage
   - Slow query log
   - Table sizes and growth

3. **User Activity**
   - Registration rates
   - Active users
   - Incident reports per day

4. **System Health**
   - Function success/failure rates
   - Memory and CPU usage
   - Storage utilization

### Alerting Setup

Configure alerts for:
- Function error rate > 5%
- Database response time > 1s
- Storage usage > 80%
- Failed authentication attempts > 100/hour

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Supabase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Deploy functions
        run: |
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

This deployment guide provides comprehensive instructions for setting up and maintaining the Tourist Safety System backend in production.