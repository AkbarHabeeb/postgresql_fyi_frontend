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
  const getConnectionStatus = () => {
    if (!bridgeConnected) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-red-400" />,
        text: "Bridge Service Not Running",
        subtext: "Start the bridge service to connect to databases",
        bgColor: "bg-red-500/10 dark:bg-red-900/20",
        borderColor: "border-red-300 dark:border-red-700",
        textColor: "text-red-700 dark:text-red-300"
      };
    }
    
    if (!isConnected) {
      return {
        icon: <Database className="w-5 h-5 text-yellow-400" />,
        text: "Not Connected to Database",
        subtext: "Use the sidebar to connect to a PostgreSQL database",
        bgColor: "bg-yellow-500/10 dark:bg-yellow-900/20",
        borderColor: "border-yellow-300 dark:border-yellow-700",
        textColor: "text-yellow-700 dark:text-yellow-300"
      };
    }
    
    return {
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
      text: `Connected to: ${currentDatabase}`,
      subtext: `Host: ${currentHost}`,
      bgColor: "bg-green-500/10 dark:bg-green-900/20",
      borderColor: "border-green-300 dark:border-green-700",
      textColor: "text-green-700 dark:text-green-300"
    };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-gray-800 dark:to-gray-700 text-white shadow-lg transition-colors duration-300">
      {/* Main Header */}
      <div className="px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Strong Elephant Logo */}
            <div className="text-2xl font-bold">🐘</div>
            <h1 className="text-lg font-semibold text-white">
              PostgreSQL Web Client
            </h1>
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

      {/* Database Connection Status Bar */}
      <div className="px-6 pb-3">
        <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-300 ${connectionStatus.bgColor} ${connectionStatus.borderColor}`}>
          <div className="flex-shrink-0">
            {connectionStatus.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-medium text-sm ${connectionStatus.textColor}`}>
              {connectionStatus.text}
            </div>
            <div className={`text-xs opacity-75 ${connectionStatus.textColor}`}>
              {connectionStatus.subtext}
            </div>
          </div>
          {isConnected && currentDatabase && (
            <div className="flex-shrink-0">
              <div className="px-3 py-1 bg-white/20 dark:bg-gray-800/50 rounded-full">
                <span className="text-xs font-mono text-white dark:text-gray-200">
                  {currentDatabase}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};