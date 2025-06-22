import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  isConnected: boolean;
  statusText: string;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, statusText }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-gray-800 dark:to-gray-700 text-white px-6 py-3 shadow-lg transition-colors duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {/* Strong Elephant Logo */}
          <div className="text-2xl font-bold">🐘</div>
          <h1 className={`text-lg font-semibold transition-colors duration-300 ${
            isConnected ? 'text-white' : 'text-blue-100 dark:text-gray-300'
          }`}>
            PostgreSQL Web Client
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-blue-100 dark:text-gray-300">{statusText}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};