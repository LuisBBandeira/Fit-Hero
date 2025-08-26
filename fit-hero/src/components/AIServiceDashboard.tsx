'use client';

import { useState, useEffect } from 'react';

interface ServiceStatus {
  running: boolean;
  lastUsed: number;
  idleTime: number;
  success: boolean;
}

export default function AIServiceDashboard() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/ai-service');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  };

  const controlService = async (action: 'start' | 'stop') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || `Failed to ${action} service`);
      }

      // Refresh status after action
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} service`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">AI Service Status</h2>
        <button
          onClick={fetchStatus}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {status && (
        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${status.running ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              {status.running ? '✅ Running' : '❌ Stopped'}
            </span>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-md p-3">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Last Used</h3>
              <p className="text-sm text-gray-800">{formatTime(status.lastUsed)}</p>
            </div>

            <div className="bg-gray-50 rounded-md p-3">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Idle Time</h3>
              <p className="text-sm text-gray-800">{formatDuration(status.idleTime)}</p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => controlService('start')}
              disabled={loading || status.running}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                status.running
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? '⏳ Starting...' : '▶️ Start Service'}
            </button>

            <button
              onClick={() => controlService('stop')}
              disabled={loading || !status.running}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !status.running
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? '⏳ Stopping...' : '⏹️ Stop Service'}
            </button>
          </div>

          {/* Auto-start Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">ℹ️ Auto-Start Enabled</h3>
            <p className="text-xs text-blue-700">
              The AI service will automatically start when needed and stop after 5 minutes of inactivity.
            </p>
          </div>
        </div>
      )}

      {!status && !error && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading status...</p>
        </div>
      )}
    </div>
  );
}
