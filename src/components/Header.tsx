import React from 'react';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  isConnected: boolean;
  statusText: string;
  bridgeConnected: boolean;
  currentDatabase?: string | null;
  currentHost?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  isConnected, 
  statusText, 
  bridgeConnected, 
  currentDatabase, 
  currentHost 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-gray-800 dark:to-gray-700 text-white shadow-lg transition-colors duration-300">
      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Strong Elephant Logo */}
            <div className="text-2xl font-bold">🐘</div>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-white">
                PostgreSQL Web Client
              </h1>
              {/* Database Name Badge - Only show when connected */}
              {isConnected && currentDatabase && (
                <div className="flex items-center space-x-2 bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 dark:border-gray-600/50">
                  <Database className="w-4 h-4 text-white/90" />
                  <span className="text-sm font-medium text-white">
                    {currentDatabase}
                  </span>
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                  <span className="text-xs text-white/80">
                    {currentHost}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                bridgeConnected ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-blue-100 dark:text-gray-300">{statusText}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};