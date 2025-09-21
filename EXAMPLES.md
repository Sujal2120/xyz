# Integration Examples - Tourist Safety System

Complete examples for integrating the Tourist Safety System backend with various frontend frameworks and mobile platforms.

## 🌐 Web Framework Examples

### React/Next.js Integration

#### Setup
```bash
npm install @supabase/supabase-js
```

#### Configuration
```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### API Service
```javascript
// services/touristSafetyAPI.js
class TouristSafetyAPI {
  constructor(supabaseClient) {
    this.supabase = supabaseClient
    this.baseUrl = `${supabaseClient.supabaseUrl}/functions/v1`
  }

  async register(userData) {
    const response = await fetch(`${this.baseUrl}/auth-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.supabase.supabaseKey}`
      },
      body: JSON.stringify(userData)
    })
    return response.json()
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.supabase.supabaseKey}`
      },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  }

  async reportIncident(token, incidentData) {
    const response = await fetch(`${this.baseUrl}/incident-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(incidentData)
    })
    return response.json()
  }

  async updateLocation(token, latitude, longitude) {
    const response = await fetch(`${this.baseUrl}/location-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ latitude, longitude })
    })
    return response.json()
  }

  async checkGeofence(token, latitude, longitude) {
    const response = await fetch(`${this.baseUrl}/geofence-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ latitude, longitude })
    })
    return response.json()
  }
}

export default TouristSafetyAPI
```

#### React Components
```jsx
// components/IncidentReporter.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import TouristSafetyAPI from '../services/touristSafetyAPI'

const api = new TouristSafetyAPI(supabase)

export default function IncidentReporter({ userToken }) {
  const [incident, setIncident] = useState({
    type: 'emergency',
    description: '',
    severity: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => console.error('Location error:', error)
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const incidentData = {
        ...incident,
        latitude: location?.latitude,
        longitude: location?.longitude
      }

      const result = await api.reportIncident(userToken, incidentData)
      
      if (result.success) {
        alert('Incident reported successfully!')
        setIncident({ type: 'emergency', description: '', severity: 'medium' })
      } else {
        alert('Error reporting incident: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to report incident')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Report Incident</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Incident Type</label>
          <select
            value={incident.type}
            onChange={(e) => setIncident({...incident, type: e.target.value})}
            className="w-full p-2 border rounded-md"
          >
            <option value="emergency">Emergency</option>
            <option value="medical">Medical</option>
            <option value="theft">Theft</option>
            <option value="harassment">Harassment</option>
            <option value="lost">Lost</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Severity</label>
          <select
            value={incident.severity}
            onChange={(e) => setIncident({...incident, severity: e.target.value})}
            className="w-full p-2 border rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={incident.description}
            onChange={(e) => setIncident({...incident, description: e.target.value})}
            className="w-full p-2 border rounded-md"
            rows="3"
            placeholder="Describe the incident..."
          />
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="w-full bg-blue-500 text-white p-2 rounded-md mb-2"
          >
            {location ? '✓ Location Captured' : 'Get Current Location'}
          </button>
          {location && (
            <p className="text-sm text-gray-600">
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Reporting...' : 'Report Incident'}
        </button>
      </form>
    </div>
  )
}
```

#### Real-time Updates
```jsx
// hooks/useRealTimeIncidents.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRealTimeIncidents() {
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    const channel = supabase
      .channel('incidents')
      .on('broadcast', { event: 'new_incident' }, (payload) => {
        setIncidents(prev => [payload.incident, ...prev])
      })
      .on('broadcast', { event: 'incident_updated' }, (payload) => {
        setIncidents(prev => 
          prev.map(incident => 
            incident.id === payload.incident.id ? payload.incident : incident
          )
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return incidents
}
```

### Vue.js Integration

#### Setup
```bash
npm install @supabase/supabase-js
```

#### Configuration
```javascript
// plugins/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VUE_APP_SUPABASE_URL
const supabaseAnonKey = process.env.VUE_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### Vue Component
```vue
<!-- components/LocationTracker.vue -->
<template>
  <div class="location-tracker">
    <h3>Location Tracking</h3>
    <div v-if="currentLocation">
      <p>Current Location:</p>
      <p>Lat: {{ currentLocation.latitude.toFixed(6) }}</p>
      <p>Lng: {{ currentLocation.longitude.toFixed(6) }}</p>
      
      <div v-if="geofenceStatus">
        <p :class="geofenceStatus.isInSafeZone ? 'text-green-600' : 'text-red-600'">
          {{ geofenceStatus.isInSafeZone ? '✓ In Safe Zone' : '⚠ Outside Safe Zone' }}
        </p>
      </div>
    </div>
    
    <button @click="startTracking" :disabled="tracking">
      {{ tracking ? 'Tracking...' : 'Start Tracking' }}
    </button>
    
    <button @click="stopTracking" :disabled="!tracking">
      Stop Tracking
    </button>
  </div>
</template>

<script>
import { supabase } from '../plugins/supabase'
import TouristSafetyAPI from '../services/touristSafetyAPI'

export default {
  name: 'LocationTracker',
  props: ['userToken'],
  data() {
    return {
      currentLocation: null,
      geofenceStatus: null,
      tracking: false,
      watchId: null,
      api: new TouristSafetyAPI(supabase)
    }
  },
  methods: {
    startTracking() {
      if (navigator.geolocation) {
        this.tracking = true
        this.watchId = navigator.geolocation.watchPosition(
          this.updateLocation,
          this.handleLocationError,
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        )
      }
    },
    
    stopTracking() {
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId)
        this.watchId = null
        this.tracking = false
      }
    },
    
    async updateLocation(position) {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      
      this.currentLocation = location
      
      try {
        // Update location on server
        await this.api.updateLocation(this.userToken, location.latitude, location.longitude)
        
        // Check geofence status
        const geofenceResult = await this.api.checkGeofence(
          this.userToken, 
          location.latitude, 
          location.longitude
        )
        
        if (geofenceResult.success) {
          this.geofenceStatus = geofenceResult
        }
      } catch (error) {
        console.error('Location update error:', error)
      }
    },
    
    handleLocationError(error) {
      console.error('Location error:', error)
      this.tracking = false
    }
  },
  
  beforeUnmount() {
    this.stopTracking()
  }
}
</script>
```

### Angular Integration

#### Setup
```bash
npm install @supabase/supabase-js
```

#### Service
```typescript
// services/tourist-safety.service.ts
import { Injectable } from '@angular/core'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { environment } from '../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TouristSafetyService {
  private supabase: SupabaseClient
  private baseUrl: string

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey)
    this.baseUrl = `${environment.supabaseUrl}/functions/v1`
  }

  async register(userData: any) {
    const response = await fetch(`${this.baseUrl}/auth-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${environment.supabaseAnonKey}`
      },
      body: JSON.stringify(userData)
    })
    return response.json()
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${environment.supabaseAnonKey}`
      },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  }

  async reportIncident(token: string, incidentData: any) {
    const response = await fetch(`${this.baseUrl}/incident-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(incidentData)
    })
    return response.json()
  }

  async getIncidents(token: string) {
    // This would require a new endpoint or direct Supabase query
    const { data, error } = await this.supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })

    return { data, error }
  }
}
```

#### Component
```typescript
// components/incident-list.component.ts
import { Component, OnInit, Input } from '@angular/core'
import { TouristSafetyService } from '../services/tourist-safety.service'

@Component({
  selector: 'app-incident-list',
  template: `
    <div class="incident-list">
      <h3>My Incidents</h3>
      <div *ngIf="loading">Loading incidents...</div>
      <div *ngIf="!loading && incidents.length === 0">No incidents reported</div>
      
      <div *ngFor="let incident of incidents" class="incident-card">
        <div class="incident-header">
          <span class="incident-type">{{ incident.type }}</span>
          <span [class]="'severity-' + incident.severity">{{ incident.severity }}</span>
        </div>
        <p>{{ incident.description }}</p>
        <div class="incident-meta">
          <span>Status: {{ incident.status }}</span>
          <span>{{ incident.created_at | date:'short' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .incident-card {
      border: 1px solid #ddd;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
    }
    .incident-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .severity-critical { color: #dc2626; font-weight: bold; }
    .severity-high { color: #ea580c; }
    .severity-medium { color: #ca8a04; }
    .severity-low { color: #16a34a; }
  `]
})
export class IncidentListComponent implements OnInit {
  @Input() userToken!: string
  incidents: any[] = []
  loading = true

  constructor(private touristSafetyService: TouristSafetyService) {}

  async ngOnInit() {
    await this.loadIncidents()
  }

  async loadIncidents() {
    try {
      const result = await this.touristSafetyService.getIncidents(this.userToken)
      if (!result.error) {
        this.incidents = result.data || []
      }
    } catch (error) {
      console.error('Error loading incidents:', error)
    } finally {
      this.loading = false
    }
  }
}
```

## 📱 Mobile Platform Examples

### Flutter Integration

#### Setup
```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^1.10.0
  geolocator: ^9.0.0
  permission_handler: ^10.0.0
```

#### Configuration
```dart
// lib/config/supabase_config.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String supabaseUrl = 'https://your-project-ref.supabase.co';
  static const String supabaseAnonKey = 'your-anon-key';
  
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
  }
}
```

#### Service
```dart
// lib/services/tourist_safety_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

class TouristSafetyService {
  final SupabaseClient _supabase = Supabase.instance.client;
  final String _baseUrl = '${SupabaseConfig.supabaseUrl}/functions/v1';

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
    required String phone,
    String? emergencyContact,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth-register'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${SupabaseConfig.supabaseAnonKey}',
      },
      body: jsonEncode({
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'emergencyContact': emergencyContact,
      }),
    );

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth-login'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${SupabaseConfig.supabaseAnonKey}',
      },
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> reportIncident({
    required String token,
    required String type,
    required String description,
    required double latitude,
    required double longitude,
    String severity = 'medium',
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/incident-report'),
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

  Future<Map<String, dynamic>> updateLocation({
    required String token,
    required double latitude,
    required double longitude,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/location-update'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'latitude': latitude,
        'longitude': longitude,
      }),
    );

    return jsonDecode(response.body);
  }
}
```

#### Widget
```dart
// lib/widgets/sos_button.dart
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/tourist_safety_service.dart';

class SOSButton extends StatefulWidget {
  final String userToken;
  
  const SOSButton({Key? key, required this.userToken}) : super(key: key);

  @override
  _SOSButtonState createState() => _SOSButtonState();
}

class _SOSButtonState extends State<SOSButton> {
  final TouristSafetyService _service = TouristSafetyService();
  bool _isReporting = false;

  Future<void> _reportEmergency() async {
    setState(() {
      _isReporting = true;
    });

    try {
      // Get current location
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Report emergency incident
      final result = await _service.reportIncident(
        token: widget.userToken,
        type: 'emergency',
        description: 'SOS - Emergency assistance needed',
        latitude: position.latitude,
        longitude: position.longitude,
        severity: 'critical',
      );

      if (result['success']) {
        _showSuccessDialog();
      } else {
        _showErrorDialog(result['error']);
      }
    } catch (e) {
      _showErrorDialog('Failed to report emergency: $e');
    } finally {
      setState(() {
        _isReporting = false;
      });
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Emergency Reported'),
        content: Text('Your emergency has been reported. Help is on the way!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String error) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Error'),
        content: Text('Failed to report emergency: $error'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      height: 120,
      child: ElevatedButton(
        onPressed: _isReporting ? null : _reportEmergency,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red,
          shape: CircleBorder(),
          padding: EdgeInsets.all(20),
        ),
        child: _isReporting
            ? CircularProgressIndicator(color: Colors.white)
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.warning, color: Colors.white, size: 40),
                  Text('SOS', style: TextStyle(color: Colors.white, fontSize: 18)),
                ],
              ),
      ),
    );
  }
}
```

### React Native Integration

#### Setup
```bash
npm install @supabase/supabase-js react-native-geolocation-service
```

#### Service
```javascript
// services/TouristSafetyAPI.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-ref.supabase.co'
const supabaseAnonKey = 'your-anon-key'

class TouristSafetyAPI {
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
    this.baseUrl = `${supabaseUrl}/functions/v1`
  }

  async register(userData) {
    const response = await fetch(`${this.baseUrl}/auth-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify(userData)
    })
    return response.json()
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  }

  async reportIncident(token, incidentData) {
    const response = await fetch(`${this.baseUrl}/incident-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(incidentData)
    })
    return response.json()
  }

  async updateLocation(token, latitude, longitude) {
    const response = await fetch(`${this.baseUrl}/location-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ latitude, longitude })
    })
    return response.json()
  }
}

export default new TouristSafetyAPI()
```

#### Component
```jsx
// components/LocationTracker.js
import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import TouristSafetyAPI from '../services/TouristSafetyAPI'

const LocationTracker = ({ userToken }) => {
  const [location, setLocation] = useState(null)
  const [tracking, setTracking] = useState(false)
  const [geofenceStatus, setGeofenceStatus] = useState(null)

  const startTracking = () => {
    setTracking(true)
    
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })
        updateLocationOnServer(latitude, longitude)
      },
      (error) => {
        console.error('Location error:', error)
        Alert.alert('Location Error', 'Failed to get location')
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 30000,
        fastestInterval: 10000,
      }
    )

    return () => {
      Geolocation.clearWatch(watchId)
      setTracking(false)
    }
  }

  const updateLocationOnServer = async (latitude, longitude) => {
    try {
      const result = await TouristSafetyAPI.updateLocation(userToken, latitude, longitude)
      if (result.success) {
        setGeofenceStatus(result.nearbyGeofences)
      }
    } catch (error) {
      console.error('Location update error:', error)
    }
  }

  const reportEmergency = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please enable location tracking first')
      return
    }

    try {
      const result = await TouristSafetyAPI.reportIncident(userToken, {
        type: 'emergency',
        description: 'SOS - Emergency assistance needed',
        latitude: location.latitude,
        longitude: location.longitude,
        severity: 'critical'
      })

      if (result.success) {
        Alert.alert('Emergency Reported', 'Help is on the way!')
      } else {
        Alert.alert('Error', 'Failed to report emergency')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to report emergency')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tracker</Text>
      
      {location && (
        <View style={styles.locationInfo}>
          <Text>Latitude: {location.latitude.toFixed(6)}</Text>
          <Text>Longitude: {location.longitude.toFixed(6)}</Text>
        </View>
      )}

      {geofenceStatus && (
        <View style={styles.geofenceStatus}>
          <Text style={geofenceStatus.isInSafeZone ? styles.safeText : styles.dangerText}>
            {geofenceStatus.isInSafeZone ? '✓ In Safe Zone' : '⚠ Outside Safe Zone'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, tracking ? styles.buttonActive : styles.buttonInactive]}
        onPress={tracking ? () => setTracking(false) : startTracking}
      >
        <Text style={styles.buttonText}>
          {tracking ? 'Stop Tracking' : 'Start Tracking'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sosButton} onPress={reportEmergency}>
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  locationInfo: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  geofenceStatus: {
    marginBottom: 20,
  },
  safeText: {
    color: 'green',
    fontWeight: 'bold',
  },
  dangerText: {
    color: 'red',
    fontWeight: 'bold',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#dc2626',
  },
  buttonInactive: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sosButton: {
    backgroundColor: '#dc2626',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
})

export default LocationTracker
```

## 🔧 Testing Examples

### Unit Tests (Jest)
```javascript
// tests/api.test.js
import TouristSafetyAPI from '../services/TouristSafetyAPI'

// Mock fetch
global.fetch = jest.fn()

describe('TouristSafetyAPI', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  test('should register user successfully', async () => {
    const mockResponse = {
      success: true,
      user: {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    }

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    })

    const result = await TouristSafetyAPI.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    })

    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth-register'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    )
  })

  test('should report incident successfully', async () => {
    const mockResponse = {
      success: true,
      incident: {
        id: 'incident-id',
        type: 'emergency',
        severity: 'critical'
      }
    }

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    })

    const result = await TouristSafetyAPI.reportIncident('token', {
      type: 'emergency',
      description: 'Test emergency',
      latitude: 25.5941,
      longitude: 85.1376,
      severity: 'critical'
    })

    expect(result).toEqual(mockResponse)
  })
})
```

### Integration Tests (Cypress)
```javascript
// cypress/integration/tourist-safety.spec.js
describe('Tourist Safety System', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should allow user to register and login', () => {
    // Go to registration
    cy.contains('Register').click()
    
    // Fill registration form
    cy.get('[data-testid=name-input]').type('Test User')
    cy.get('[data-testid=email-input]').type('test@example.com')
    cy.get('[data-testid=password-input]').type('password123')
    cy.get('[data-testid=phone-input]').type('+91XXXXXXXXXX')
    
    // Submit registration
    cy.get('[data-testid=register-button]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Test User')
  })

  it('should allow reporting an incident', () => {
    // Login first
    cy.login('test@example.com', 'password123')
    
    // Navigate to incident reporting
    cy.get('[data-testid=report-incident-button]').click()
    
    // Fill incident form
    cy.get('[data-testid=incident-type]').select('emergency')
    cy.get('[data-testid=incident-description]').type('Test emergency incident')
    cy.get('[data-testid=incident-severity]').select('high')
    
    // Mock geolocation
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((callback) => {
        callback({
          coords: {
            latitude: 25.5941,
            longitude: 85.1376
          }
        })
      })
    })
    
    // Get location and submit
    cy.get('[data-testid=get-location-button]').click()
    cy.get('[data-testid=submit-incident-button]').click()
    
    // Should show success message
    cy.contains('Incident reported successfully')
  })
})
```

This comprehensive examples file provides complete integration patterns for all major frontend frameworks and mobile platforms, making it easy for developers to integrate with the Tourist Safety System backend regardless of their chosen technology stack.