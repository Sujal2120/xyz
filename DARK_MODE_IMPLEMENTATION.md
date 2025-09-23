# Dark Mode Implementation Guide

## Overview
This implementation provides a comprehensive dark mode system for the Tourist Safety Monitoring application with both frontend and backend components.

## Features

### Frontend Features
- ✅ Theme toggle with Light/Dark/System options
- ✅ CSS variables-based theming system
- ✅ Smooth transitions between themes
- ✅ localStorage persistence
- ✅ System preference detection
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Theme-aware components
- ✅ Cross-browser compatibility

### Backend Features
- ✅ User preferences API endpoints
- ✅ Database schema for theme storage
- ✅ Secure preference management
- ✅ Automatic preference creation
- ✅ Error handling and validation

## File Structure

```
src/
├── contexts/
│   └── ThemeContext.tsx          # Theme state management
├── components/
│   ├── ThemeToggle.tsx           # Theme toggle components
│   └── ThemeAwareComponents.tsx  # Pre-built themed components
├── hooks/
│   └── useThemeSync.ts           # Backend sync utilities
├── styles/
│   └── themes.css                # CSS variables and theme styles
└── index.css                     # Updated with theme imports

supabase/
├── migrations/
│   └── 20250921153448_add_user_preferences.sql  # Database schema
└── functions/
    └── user-preferences/
        └── index.ts              # API endpoints
```

## Setup Instructions

### 1. Install Dependencies
No additional dependencies required - uses existing React and Supabase setup.

### 2. Database Migration
The migration file creates:
- `user_preferences` table
- Theme preference enum
- RLS policies
- Automatic preference creation

### 3. Deploy Edge Function
Deploy the `user-preferences` function to handle theme API requests.

### 4. Update Your Components
Wrap your app with `ThemeProvider` and use theme-aware classes:

```tsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="theme-bg-primary theme-transition">
        {/* Your app content */}
      </div>
    </ThemeProvider>
  );
}
```

## Usage Examples

### Basic Theme Toggle
```tsx
import { ThemeToggle } from './components/ThemeToggle';

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### Using Theme-Aware Components
```tsx
import { ThemeCard, ThemeButton } from './components/ThemeAwareComponents';

function MyComponent() {
  return (
    <ThemeCard>
      <h2 className="theme-text-primary">Title</h2>
      <p className="theme-text-secondary">Description</p>
      <ThemeButton variant="primary">Action</ThemeButton>
    </ThemeCard>
  );
}
```

### Custom Styling with CSS Variables
```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  transition: var(--transition-normal);
}
```

## API Endpoints

### Get User Preferences
```
GET /functions/v1/user-preferences
Authorization: Bearer <token>
```

### Update User Preferences
```
PUT /functions/v1/user-preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "dark",
  "language": "en",
  "notifications_enabled": true
}
```

## CSS Variables Reference

### Colors
- `--color-primary`: Primary brand color
- `--color-success`: Success state color
- `--color-warning`: Warning state color
- `--color-error`: Error state color

### Backgrounds
- `--bg-primary`: Main background
- `--bg-secondary`: Secondary background
- `--bg-tertiary`: Tertiary background

### Text
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--text-tertiary`: Tertiary text color

### Borders
- `--border-primary`: Primary border color
- `--border-secondary`: Secondary border color
- `--border-focus`: Focus state border

## Accessibility Features

### Contrast Ratios
- Light mode: 4.5:1 minimum contrast ratio
- Dark mode: 4.5:1 minimum contrast ratio
- High contrast mode support

### Keyboard Navigation
- Focus visible indicators
- Proper ARIA labels
- Keyboard accessible theme toggle

### Motion Preferences
- Respects `prefers-reduced-motion`
- Smooth transitions by default
- Instant switching for reduced motion users

## Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance Optimizations

### CSS Variables
- Single source of truth for colors
- Instant theme switching
- No JavaScript color calculations

### Minimal JavaScript
- Theme state in context
- localStorage for persistence
- System preference detection

### Efficient Transitions
- Hardware-accelerated properties
- Optimized transition timing
- Reduced layout thrashing

## Troubleshooting

### Theme Not Persisting
Check localStorage permissions and ensure ThemeProvider wraps your app.

### Colors Not Updating
Verify CSS variables are properly defined and components use theme classes.

### API Errors
Ensure user is authenticated and preferences table exists.

### Performance Issues
Check for excessive re-renders and optimize component memoization.

## Customization

### Adding New Colors
1. Add CSS variables to `themes.css`
2. Update both light and dark themes
3. Create utility classes if needed

### Custom Components
Use the theme-aware component patterns:
```tsx
function CustomComponent() {
  return (
    <div className="theme-bg-primary theme-text-primary theme-transition">
      Custom themed content
    </div>
  );
}
```

### Additional Preferences
Extend the `user_preferences` table and API to support more settings.

## Testing

### Manual Testing
1. Toggle between themes
2. Refresh page (persistence)
3. Change system preference
4. Test with different user accounts

### Automated Testing
Consider adding tests for:
- Theme context functionality
- Component theme switching
- API endpoint responses
- Accessibility compliance

This implementation provides a production-ready dark mode system that enhances user experience while maintaining performance and accessibility standards.