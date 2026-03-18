'use client';

import { useState, useEffect } from 'react';

interface SessionStatusProps {
  isAnalyzing?: boolean;
  teacherPhone?: string;
}

export function SessionStatus({ isAnalyzing = false, teacherPhone }: SessionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format session time
  const formatSessionTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Get status color and label
  const getStatus = () => {
    if (!isOnline) {
      return {
        color: 'bg-red-500',
        pulse: 'animate-pulse',
        label: 'Offline',
        icon: '⚠️',
      };
    }

    if (isAnalyzing) {
      return {
        color: 'bg-gold-500',
        pulse: 'animate-pulse',
        label: 'Analyzing',
        icon: '🔄',
      };
    }

    return {
      color: 'bg-whatsapp-500',
      pulse: '',
      label: 'Online',
      icon: '✓',
    };
  };

  const status = getStatus();

  return (
    <div
      className="fixed bottom-4 right-4 z-30"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Status Indicator */}
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full
          bg-white shadow-lg border border-slate-200
          cursor-pointer transition-all duration-300 hover:scale-105
        `}
      >
        {/* Status Dot */}
        <div className="relative">
          <div
            className={`
              w-2.5 h-2.5 rounded-full ${status.color} ${status.pulse}
            `}
          />
          {isAnalyzing && (
            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${status.color} animate-ping opacity-75`} />
          )}
        </div>

        {/* Status Label */}
        <span className="text-xs font-medium text-slate-700">{status.label}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-slate-800 text-white rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
          {/* Arrow */}
          <div className="absolute top-full right-6 -mt-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-800" />

          {/* Content */}
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Status</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{status.icon}</span>
                <span className="text-sm font-semibold">{status.label}</span>
              </div>
            </div>

            {/* Connection */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Connection</span>
              <span className="text-sm font-semibold">
                {isOnline ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
            </div>

            {/* Session Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Session Time</span>
              <span className="text-sm font-semibold">⏱️ {formatSessionTime(sessionTime)}</span>
            </div>

            {/* Teacher Phone */}
            {teacherPhone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Account</span>
                <span className="text-sm font-semibold font-mono">{teacherPhone}</span>
              </div>
            )}

            {/* Activity Indicator */}
            {isAnalyzing && (
              <div className="pt-2 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-300">AI analyzing work...</span>
                </div>
              </div>
            )}

            {/* Offline Warning */}
            {!isOnline && (
              <div className="pt-2 border-t border-slate-700 bg-red-500/20 -mx-4 -mb-4 p-3 rounded-b-lg">
                <p className="text-xs text-red-200">
                  ⚠️ You're offline. Uploads and analysis won't work until connection is restored.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
