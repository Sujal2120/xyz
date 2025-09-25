import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function SupabaseStatus() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection by trying to fetch from a simple table
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        setError(error.message);
        setConnected(false);
      } else {
        setConnected(true);
      }
    } catch (err) {
      setError('Failed to connect to Supabase');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Database className="h-5 w-5 text-gray-600 mr-2" />
          <span className="font-medium text-gray-900">Supabase Connection</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : connected ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={checkConnection}
            className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Retry Connection
          </button>
        </div>
      )}

      {!connected && !loading && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Using simulated data. 
            Connect to Supabase to enable real-time features.
          </p>
        </div>
      )}
    </div>
  );
}