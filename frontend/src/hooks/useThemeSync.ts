import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

/**
 * Hook to sync theme preferences with backend when user logs in
 */
export function useThemeSync() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  // Load theme from backend when user logs in
  useEffect(() => {
    if (user) {
      loadThemeFromBackend();
    }
  }, [user]);

  const loadThemeFromBackend = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.preferences?.theme) {
          // Only update if different from current theme
          if (data.preferences.theme !== theme) {
            setTheme(data.preferences.theme);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load theme from backend:', error);
    }
  };

  const saveThemeToBackend = async (newTheme: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme: newTheme })
      });
    } catch (error) {
      console.error('Failed to save theme to backend:', error);
    }
  };

  return {
    loadThemeFromBackend,
    saveThemeToBackend
  };
}