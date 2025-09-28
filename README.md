# Smart Tourist Safety Monitoring & Incident Response System

A comprehensive full-stack solution for SIH5002 using React frontend and Supabase backend with PostgreSQL + PostGIS for geospatial data.

## 🏗️ Project Structure

```
tourist-safety-system/
├── frontend/                 # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities and Supabase client
│   │   └── styles/         # CSS and theme files
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
├── backend/                 # Supabase Backend
│   ├── supabase/
│   │   ├── functions/      # Edge Functions (API endpoints)
│   │   ├── migrations/     # Database migrations
│   │   └── config.toml     # Supabase configuration
│   └── package.json        # Backend scripts and dependencies
│
├── docs/                   # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── EXAMPLES.md
│   └── DARK_MODE_IMPLEMENTATION.md
│
└── README.md              # This file
```

## 🚀 Quick Start

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Supabase CLI (if not installed)
npm install -g @supabase/cli

# Initialize Supabase (if not done)
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Apply database migrations
supabase db push

# Deploy Edge Functions
npm run deploy:functions
```

## 🌟 Features

### Frontend Features
- ✅ **Modern React UI** - Built with TypeScript and Tailwind CSS
- ✅ **Dark Mode Support** - Complete theme system with persistence
- ✅ **Multi-language** - Support for 10+ Indian regional languages
- ✅ **Responsive Design** - Works perfectly on all devices
- ✅ **Real-time Updates** - Live data synchronization with Supabase
- ✅ **Progressive Web App** - Offline support and mobile installation

### Backend Features
- ✅ **Supabase Integration** - PostgreSQL with PostGIS for geospatial data
- ✅ **Edge Functions** - Serverless API endpoints with TypeScript
- ✅ **Real-time Database** - Live updates and subscriptions
- ✅ **Authentication** - JWT-based user management
- ✅ **Row Level Security** - Database-level security policies
- ✅ **Geographic Queries** - PostGIS for location-based features

### Core System Features
- 🚨 **Emergency SOS System** - Instant alerts to authorities
- 📍 **Real-time Location Tracking** - GPS monitoring with history
- 🛡️ **Geofence Monitoring** - Safe/danger zone detection
- 📊 **Authority Dashboard** - Real-time incident management
- 🔐 **Digital ID System** - Blockchain-style tourist identification
- 📱 **IoT Integration** - Device monitoring and health data
- 🌐 **Multi-channel Alerts** - SMS, Email, Push notifications

## 🔧 Environment Setup

### Frontend Environment (.env)
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_NODE_ENV=development
```

### Backend Environment (.env)
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 📊 Database Schema

### Core Tables
1. **profiles** - User profiles with blockchain-style digital IDs
2. **geofences** - Safe/danger zones with PostGIS geometry
3. **incidents** - Emergency reports and incident management
4. **alerts** - Multi-channel notification system
5. **user_preferences** - Theme and user settings
6. **location_history** - GPS tracking with automatic cleanup

### Key Features
- PostGIS integration for geospatial queries
- Blockchain-style digital ID generation
- Comprehensive RLS policies
- Automated triggers and functions
- Real-time subscriptions

## 🌐 API Endpoints

All endpoints are implemented as Supabase Edge Functions:

### Authentication
- `POST /functions/v1/auth-register` - Tourist registration
- `POST /functions/v1/auth-login` - User authentication

### Location & Geofencing
- `POST /functions/v1/location-update` - Update GPS location
- `POST /functions/v1/geofence-check` - Check safe/danger zones

### Incident Management
- `POST /functions/v1/incident-report` - Report emergencies
- `GET /functions/v1/incident-manage/:id` - Get incident details
- `PUT /functions/v1/incident-manage/:id` - Update incident status

### Alert System
- `POST /functions/v1/alert-send` - Send alerts to authorities

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy to Vercel, Netlify, or your preferred hosting
```

### Backend Deployment
```bash
cd backend
# Deploy Edge Functions
supabase functions deploy --project-ref YOUR_PROJECT_REF

# Apply database migrations
supabase db push --project-ref YOUR_PROJECT_REF
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run lint          # ESLint checking
npm run type-check     # TypeScript validation
npm run test          # Unit tests (when configured)
```

### Backend Testing
```bash
cd backend
npm run functions:logs  # View function logs
supabase db diff       # Check database changes
```

## 📱 Mobile Integration

The system supports integration with:
- **Flutter** - Complete mobile app development
- **React Native** - Cross-platform mobile apps
- **Progressive Web App** - Mobile web experience
- **IoT Devices** - Wearables and emergency devices

## 🔐 Security Features

- **JWT Authentication** - Secure user sessions
- **Row Level Security** - Database-level access control
- **CORS Configuration** - Secure cross-origin requests
- **Input Validation** - Comprehensive data sanitization
- **Rate Limiting** - API abuse prevention

## 📞 Support & Integration

This system is designed to work with any frontend framework:
- ✅ React/Next.js
- ✅ Vue/Nuxt.js
- ✅ Angular
- ✅ Flutter
- ✅ React Native
- ✅ Vanilla JavaScript

## 🏆 Smart India Hackathon 2024

This project addresses **Problem Statement SIH5002** - Smart Tourist Safety Monitoring & Incident Response System with:

- **Real-time Monitoring** - Live location tracking and geofencing
- **Emergency Response** - Instant SOS alerts and incident management
- **Authority Integration** - Dashboard for tourism authorities
- **Multi-language Support** - Accessibility for all Indian tourists
- **IoT Integration** - Wearable devices and smart monitoring
- **Scalable Architecture** - Cloud-native design for nationwide deployment

## 📄 License

This project is part of Smart India Hackathon 2024 - Problem Statement SIH5002.

---

**🌟 Ready for production deployment with complete frontend and backend separation!**