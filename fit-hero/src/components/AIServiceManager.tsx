'use client';

import { useState, useEffect } from 'react';

interface ServiceStatus {
  running: boolean;
  healthy: boolean;
  port: number;
  url: string;
  pid?: number;
}

interface ServiceData {
  status: string;
  service: ServiceStatus;
  logs?: string[];
  timestamp: string;
}

export default function AIServiceManager() {
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshStatus();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = async () => {
    if (isActioning) return; // Don't refresh while performing actions
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/ai/service');
      const data = await response.json();
      
      if (response.ok) {
        setServiceData(data);
      } else {
        setError(data.error || 'Failed to get service status');
      }
    } catch (err) {
      setError('Failed to connect to service management API');
    } finally {
      setIsLoading(false);
    }
  };

  const controlService = async (action: 'start' | 'stop' | 'restart' | 'install-deps') => {
    setIsActioning(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/ai/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(data.message);
        setServiceData(prev => prev ? { ...prev, service: data.service } : null);
      } else {
        setError(data.error || data.message || `Failed to ${action} service`);
      }
    } catch (err) {
      setError(`Failed to ${action} service`);
    } finally {
      setIsActioning(false);
      // Refresh status after action
      setTimeout(refreshStatus, 1000);
    }
  };

  const getStatusColor = () => {
    if (!serviceData?.service) return 'text-gray-400';
    if (serviceData.service.healthy) return 'text-green-400';
    if (serviceData.service.running) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = () => {
    if (!serviceData?.service) return '❓';
    if (serviceData.service.healthy) return '✅';
    if (serviceData.service.running) return '⚠️';
    return '❌';
  };

  const getStatusText = () => {
    if (!serviceData?.service) return 'Unknown';
    if (serviceData.service.healthy) return 'Running & Healthy';
    if (serviceData.service.running) return 'Running (Unhealthy)';
    return 'Stopped';
  };

  return (
    <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-green-400 font-bold text-lg">🔧 AI SERVICE MANAGER</div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs px-2 py-1 rounded ${
              autoRefresh 
                ? 'bg-green-600 text-black' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={refreshStatus}
            disabled={isLoading}
            className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
          >
            {isLoading ? '🔄' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* Service Status */}
      <div className="space-y-4">
        {serviceData?.service && (
          <div className="border border-gray-700 rounded p-4 bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStatusIcon()}</span>
                <div>
                  <div className={`font-bold ${getStatusColor()}`}>
                    {getStatusText()}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Port: {serviceData.service.port} | URL: {serviceData.service.url}
                  </div>
                  {serviceData.service.pid && (
                    <div className="text-gray-500 text-xs">
                      PID: {serviceData.service.pid}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-gray-400 text-xs">
                Last checked: {new Date(serviceData.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => controlService('start')}
            disabled={isActioning || serviceData?.service?.healthy}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-2 px-3 rounded text-sm transition-colors"
          >
            {isActioning ? '⏳' : '▶️'} Start
          </button>
          
          <button
            onClick={() => controlService('stop')}
            disabled={isActioning || !serviceData?.service?.running}
            className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition-colors"
          >
            {isActioning ? '⏳' : '⏹️'} Stop
          </button>
          
          <button
            onClick={() => controlService('restart')}
            disabled={isActioning}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-2 px-3 rounded text-sm transition-colors"
          >
            {isActioning ? '⏳' : '🔄'} Restart
          </button>
          
          <button
            onClick={() => controlService('install-deps')}
            disabled={isActioning}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition-colors"
          >
            {isActioning ? '⏳' : '📦'} Install Deps
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 rounded p-3">
            <div className="flex items-start">
              <span className="text-red-400 mr-2">❌</span>
              <div>
                <div className="text-red-300 font-semibold text-sm">Error</div>
                <div className="text-red-200 text-xs">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-900/30 border border-green-600 rounded p-3">
            <div className="flex items-start">
              <span className="text-green-400 mr-2">✅</span>
              <div>
                <div className="text-green-300 font-semibold text-sm">Success</div>
                <div className="text-green-200 text-xs">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Logs */}
        {serviceData?.logs && serviceData.logs.length > 0 && (
          <div className="border border-gray-700 rounded p-3 bg-black">
            <div className="text-gray-400 font-semibold text-sm mb-2">Recent Logs:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {serviceData.logs.map((log, index) => (
                <div key={index} className="text-gray-300 text-xs font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Information */}
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="text-gray-400 text-xs space-y-1">
            <div>• The AI service generates personalized workout and meal plans</div>
            <div>• Service must be running for AI activation to work</div>
            <div>• Restart the service if it becomes unhealthy</div>
            <div>• Install dependencies if the service fails to start</div>
          </div>
        </div>
      </div>
    </div>
  );
}
