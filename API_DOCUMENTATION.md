# API Documentation - Tourist Safety System

Complete REST API documentation for the Smart Tourist Safety Monitoring & Incident Response System.

## Base URL
```
https://your-project.supabase.co/functions/v1
```

## Authentication

All API requests (except registration) require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

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
  "error": "Error message description"
}
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth-register`

Register a new user and create their profile with blockchain-style digital ID.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "phone": "+91XXXXXXXXXX",
  "role": "tourist",
  "emergencyContact": "+91YYYYYYYYYY"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "tourist",
    "digitalId": "DID-A1B2C3D4E5F6G7H8",
    "phone": "+91XXXXXXXXXX",
    "emergencyContact": "+91YYYYYYYYYY"
  }
}
```

### Login User
**POST** `/auth-login`

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "tourist",
    "digitalId": "DID-A1B2C3D4E5F6G7H8",
    "phone": "+91XXXXXXXXXX",
    "emergencyContact": "+91YYYYYYYYYY",
    "status": "active"
  }
}
```

---

## 📍 Location & Geofencing Endpoints

### Update Location
**POST** `/location-update`

Update user's current location and check nearby geofences.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "latitude": 25.5941,
  "longitude": 85.1376
}
```

**Response:**
```json
{
  "success": true,
  "location": {
    "latitude": 25.5941,
    "longitude": 85.1376
  },
  "nearbyGeofences": [
    {
      "geofence_id": "uuid",
      "geofence_name": "Gandhi Maidan Safe Zone",
      "distance_meters": 150.5,
      "is_safe": true,
      "is_inside": true
    }
  ]
}
```

### Check Geofence
**POST** `/geofence-check`

Check if a location is within specific geofences or get all nearby zones.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "latitude": 25.5941,
  "longitude": 85.1376,
  "geofenceId": "uuid" // Optional: check specific geofence
}
```

**Response (All Nearby):**
```json
{
  "success": true,
  "inside": [
    {
      "geofence_id": "uuid",
      "geofence_name": "Safe Zone 1",
      "distance_meters": 0,
      "is_safe": true,
      "is_inside": true
    }
  ],
  "safeZones": [...],
  "unsafeZones": [...],
  "nearbyZones": [...],
  "isInSafeZone": true,
  "isInDangerZone": false
}
```

**Response (Specific Geofence):**
```json
{
  "success": true,
  "inside": true,
  "geofenceId": "uuid"
}
```

### List Geofences
**GET** `/geofence-manage`

Get all active geofences.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "geofences": [
    {
      "id": "uuid",
      "name": "Gandhi Maidan Safe Zone",
      "description": "Tourist safe area around Gandhi Maidan",
      "center": "POINT(85.1376 25.5941)",
      "radius_meters": 500,
      "safe": true,
      "active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Geofence (Admin Only)
**POST** `/geofence-manage`

Create a new geofence zone.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "name": "New Safe Zone",
  "description": "Description of the zone",
  "latitude": 25.5941,
  "longitude": 85.1376,
  "radiusMeters": 500,
  "safe": true
}
```

**Response:**
```json
{
  "success": true,
  "geofence": {
    "id": "uuid",
    "name": "New Safe Zone",
    "description": "Description of the zone",
    "center": "POINT(85.1376 25.5941)",
    "radius_meters": 500,
    "safe": true,
    "active": true,
    "created_by": "admin_uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Geofence (Admin Only)
**PUT** `/geofence-manage/:id`

Update an existing geofence.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "name": "Updated Zone Name",
  "description": "Updated description",
  "latitude": 25.5941,
  "longitude": 85.1376,
  "radiusMeters": 600,
  "safe": false,
  "active": true
}
```

### Delete Geofence (Admin Only)
**DELETE** `/geofence-manage/:id`

Soft delete a geofence (sets active to false).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Geofence deleted successfully"
}
```

---

## 🚨 Incident Management Endpoints

### Report Incident
**POST** `/incident-report`

Report a new incident or emergency.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "type": "emergency",
  "description": "Need immediate assistance",
  "latitude": 25.5941,
  "longitude": 85.1376,
  "severity": "critical"
}
```

**Valid Types:** `emergency`, `medical`, `theft`, `harassment`, `lost`, `other`
**Valid Severities:** `low`, `medium`, `high`, `critical`

**Response:**
```json
{
  "success": true,
  "incident": {
    "id": "uuid",
    "type": "emergency",
    "description": "Need immediate assistance",
    "severity": "critical",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z",
    "location": {
      "latitude": 25.5941,
      "longitude": 85.1376
    }
  },
  "message": "Incident reported successfully. Authorities have been notified."
}
```

### Get Incident Details
**GET** `/incident-manage/:id`

Get detailed information about a specific incident.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "incident": {
    "id": "uuid",
    "tourist_id": "uuid",
    "type": "emergency",
    "description": "Need immediate assistance",
    "location": "POINT(85.1376 25.5941)",
    "status": "pending",
    "severity": "critical",
    "assigned_to": null,
    "resolved_at": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "tourist": {
      "name": "John Doe",
      "phone": "+91XXXXXXXXXX",
      "digital_id": "DID-A1B2C3D4E5F6G7H8",
      "emergency_contact": "+91YYYYYYYYYY",
      "location": "POINT(85.1376 25.5941)"
    },
    "assigned_admin": null,
    "alerts": [
      {
        "id": "uuid",
        "authority_contact": "emergency@tourism.gov.in",
        "message": "CRITICAL INCIDENT: emergency reported...",
        "alert_type": "call",
        "status": "sent",
        "sent_at": "2024-01-01T00:01:00Z",
        "acknowledged_at": null
      }
    ]
  }
}
```

### Update Incident (Admin Only)
**PUT** `/incident-manage/:id`

Update incident status or assign to admin.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "status": "acknowledged",
  "assignedTo": "admin_uuid"
}
```

**Valid Statuses:** `pending`, `acknowledged`, `resolved`, `false_alarm`

**Response:**
```json
{
  "success": true,
  "incident": {
    "id": "uuid",
    "status": "acknowledged",
    "assigned_to": "admin_uuid",
    "updated_at": "2024-01-01T00:05:00Z"
  },
  "message": "Incident updated successfully"
}
```

---

## 📢 Alert System Endpoints

### Send Alert (Admin Only)
**POST** `/alert-send`

Send an alert to authorities for a specific incident.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "incidentId": "uuid",
  "alertType": "sms",
  "customMessage": "Custom alert message",
  "authorityContact": "+91XXXXXXXXXX"
}
```

**Valid Alert Types:** `sms`, `email`, `push`, `call`

**Response:**
```json
{
  "success": true,
  "alert": {
    "id": "uuid",
    "incidentId": "uuid",
    "type": "sms",
    "status": "sent",
    "message": "Custom alert message",
    "contact": "+91XXXXXXXXXX",
    "sentAt": "2024-01-01T00:00:00Z"
  },
  "response": "SMS sent via Twilio (simulated)",
  "message": "Alert sent successfully"
}
```

---

## 🔍 Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authorization header missing |
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `ACCESS_DENIED` | Insufficient permissions |
| `VALIDATION_ERROR` | Request data validation failed |
| `NOT_FOUND` | Resource not found |
| `INTERNAL_ERROR` | Server internal error |

---

## 📊 Real-time Subscriptions

### WebSocket Channels

Connect to Supabase Realtime for live updates:

```javascript
const supabase = createClient(url, key)

// Listen for new incidents (Admin only)
const incidentChannel = supabase
  .channel('incidents')
  .on('broadcast', { event: 'new_incident' }, (payload) => {
    console.log('New incident:', payload.incident)
  })
  .on('broadcast', { event: 'incident_updated' }, (payload) => {
    console.log('Incident updated:', payload.incident)
  })
  .subscribe()

// Listen for alerts (Admin only)
const alertChannel = supabase
  .channel('alerts')
  .on('broadcast', { event: 'alert_sent' }, (payload) => {
    console.log('Alert sent:', payload.alert)
  })
  .subscribe()
```

---

## 🧪 Testing Examples

### JavaScript/Fetch
```javascript
// Report incident
const reportIncident = async () => {
  const response = await fetch(`${baseUrl}/incident-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'emergency',
      description: 'Need help',
      latitude: 25.5941,
      longitude: 85.1376,
      severity: 'high'
    })
  })
  
  const data = await response.json()
  console.log(data)
}
```

### Python/Requests
```python
import requests

# Check geofence
response = requests.post(
    f"{base_url}/geofence-check",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    },
    json={
        "latitude": 25.5941,
        "longitude": 85.1376
    }
)

print(response.json())
```

### cURL
```bash
# Update location
curl -X POST "${BASE_URL}/location-update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "latitude": 25.5941,
    "longitude": 85.1376
  }'
```

---

## 📱 Mobile Integration

### Flutter Example
```dart
class ApiService {
  final String baseUrl = 'https://your-project.supabase.co/functions/v1';
  final String token;
  
  ApiService(this.token);
  
  Future<Map<String, dynamic>> reportIncident({
    required String type,
    required String description,
    required double latitude,
    required double longitude,
    String severity = 'medium',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/incident-report'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'type': type,
        'description': description,
        'latitude': latitude,
        'longitude': longitude,
        'severity': severity,
      }),
    );
    
    return jsonDecode(response.body);
  }
}
```

### React Native Example
```javascript
class TouristSafetyAPI {
  constructor(token) {
    this.baseUrl = 'https://your-project.supabase.co/functions/v1';
    this.token = token;
  }
  
  async updateLocation(latitude, longitude) {
    const response = await fetch(`${this.baseUrl}/location-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ latitude, longitude })
    });
    
    return response.json();
  }
}
```

This API documentation provides complete coverage of all endpoints with examples for multiple programming languages and frameworks.