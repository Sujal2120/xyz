# Smart Tourist Safety Monitoring & Incident Response System

A comprehensive backend solution for SIH5002 using Supabase (PostgreSQL + Auth + Edge Functions) with framework-agnostic REST APIs.

## 🏗️ Architecture

- **Database**: PostgreSQL with PostGIS for geospatial data
- **Authentication**: Supabase Auth with JWT tokens
- **APIs**: Edge Functions (TypeScript/Deno)
- **Real-time**: Supabase Realtime for live updates
- **Security**: Row Level Security (RLS) policies

## 📊 Database Schema

### Core Tables

1. **profiles** - User profiles with blockchain-style digital IDs
2. **geofences** - Safe/danger zones with PostGIS geometry
3. **incidents** - Emergency reports and incidents
4. **alerts** - Notification system for authorities

### Key Features

- PostGIS integration for geospatial queries
- Blockchain-style digital ID generation
- Comprehensive RLS policies
- Automated triggers and functions

## 🔐 Authentication & Authorization

### User Roles
- **tourist**: Can manage own profile and incidents
- **admin**: Full access to all data and management functions

### Security Features
- JWT-based authentication
- Row Level Security (RLS)
- Role-based access control
- Secure API endpoints

## 🌐 API Endpoints

All endpoints return JSON and are framework-agnostic.

### Authentication
```
POST /functions/v1/auth-register
POST /functions/v1/auth-login
```

### Location & Geofencing
```
POST /functions/v1/location-update
POST /functions/v1/geofence-check
GET  /functions/v1/geofence-manage
POST /functions/v1/geofence-manage
```

### Incident Management
```
POST /functions/v1/incident-report
GET  /functions/v1/incident-manage/:id
PUT  /functions/v1/incident-manage/:id
```

### Alert System
```
POST /functions/v1/alert-send
```

## 🚀 Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project
2. Enable PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### 2. Database Migration

Run migrations in order:
```bash
# Apply all migrations
supabase db reset
```

### 3. Deploy Edge Functions

```bash
# Deploy individual functions (correct way)
supabase functions deploy auth-register
supabase functions deploy auth-login
supabase functions deploy incident-report
supabase functions deploy location-update 
supabase functions deploy geofence-check
supabase functions deploy alert-send

# Note: Do NOT try to deploy import_map.json - it's a configuration file, not a function
```

### 4. Environment Variables

Create `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📱 Frontend Integration Examples

### React/Next.js
```javascript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Register user
const response = await fetch(`${supabaseUrl}/functions/v1/auth-register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    name: 'John Doe',
    phone: '+91XXXXXXXXXX'
  })
})
```

### Flutter/Mobile
```dart
final response = await http.post(
  Uri.parse('$supabaseUrl/functions/v1/incident-report'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode({
    'type': 'emergency',
    'description': 'Need immediate help',
    'latitude': 25.5941,
    'longitude': 85.1376,
    'severity': 'critical'
  }),
);
```

### Vanilla JavaScript
```javascript
// Check geofence
fetch(`${SUPABASE_URL}/functions/v1/geofence-check`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    latitude: 25.5941,
    longitude: 85.1376
  })
})
.then(response => response.json())
.then(data => console.log(data))
```

## 🔧 API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🛡️ Security Features

### Row Level Security Policies

1. **Profiles**: Users can only access their own profile
2. **Incidents**: Tourists see only their incidents, admins see all
3. **Geofences**: Read access for authenticated users, write for admins
4. **Alerts**: Admin-only access

### Data Protection

- JWT token validation on all endpoints
- Input sanitization and validation
- SQL injection prevention
- CORS configuration for web security

## 📊 Real-time Features

### Supabase Realtime Channels

1. **incidents**: Live incident updates for admin dashboards
2. **alerts**: Real-time alert notifications
3. **locations**: Live location tracking (optional)

### WebSocket Integration
```javascript
const channel = supabase
  .channel('incidents')
  .on('broadcast', { event: 'new_incident' }, (payload) => {
    console.log('New incident:', payload)
  })
  .subscribe()
```

## 🧪 Testing

### API Testing with curl

```bash
# Register user
curl -X POST "${SUPABASE_URL}/functions/v1/auth-register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "+91XXXXXXXXXX"
  }'

# Report incident
curl -X POST "${SUPABASE_URL}/functions/v1/incident-report" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "type": "emergency",
    "description": "Need help",
    "latitude": 25.5941,
    "longitude": 85.1376,
    "severity": "high"
  }'
```

## 🚀 Deployment

### Production Checklist

1. ✅ Enable RLS on all tables
2. ✅ Configure CORS for your domains
3. ✅ Set up environment variables
4. ✅ Deploy Edge Functions
5. ✅ Test all API endpoints
6. ✅ Configure real-time subscriptions
7. ✅ Set up monitoring and logging

### Scaling Considerations

- Database indexing for performance
- Connection pooling for high traffic
- CDN for static assets
- Load balancing for Edge Functions
- Monitoring and alerting setup

## 📞 Support & Integration

This backend is designed to work with any frontend framework:

- ✅ React/Next.js
- ✅ Vue/Nuxt.js
- ✅ Angular
- ✅ Flutter
- ✅ React Native
- ✅ Vanilla JavaScript
- ✅ Any HTTP client

## 🔄 Future Enhancements

1. **Third-party Integrations**:
   - Twilio for SMS alerts
   - SendGrid for email notifications
   - FCM for push notifications
   - Google Maps API integration

2. **Advanced Features**:
   - ML-based anomaly detection
   - Predictive analytics
   - Advanced geospatial queries
   - Blockchain integration for digital IDs

3. **Performance Optimizations**:
   - Database query optimization
   - Caching strategies
   - API rate limiting
   - Background job processing

## 📄 License

This project is part of Smart India Hackathon 2024 - Problem Statement SIH5002.