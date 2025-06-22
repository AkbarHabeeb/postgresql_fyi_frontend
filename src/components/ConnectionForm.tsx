import React, { useState } from 'react';
import { Play, Square, Loader, Save, Trash2, Database } from 'lucide-react';
import { ConnectionConfig, SavedConnection } from '../types';

interface ConnectionFormProps {
  onConnect: (config: ConnectionConfig) => Promise<void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
  isConnecting: boolean;
  savedConnections: SavedConnection[];
  onSaveConnection: (name: string, config: ConnectionConfig) => void;
  onDeleteConnection: (id: string) => void;
}

export const ConnectionForm: React.FC<ConnectionFormProps> = ({
  onConnect,
  onDisconnect,
  isConnected,
  isConnecting,
  savedConnections,
  onSaveConnection,
  onDeleteConnection
}) => {
  const [config, setConfig] = useState<ConnectionConfig>({
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
    sslMode: 'auto'
  });
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [connectionName, setConnectionName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConnect(config);
  };

  const handleInputChange = (field: keyof ConnectionConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConnection = () => {
    if (connectionName.trim()) {
      onSaveConnection(connectionName.trim(), config);
      setConnectionName('');
      setShowSaveForm(false);
    }
  };

  const handleLoadConnection = (savedConnection: SavedConnection) => {
    setConfig(savedConnection.config);
  };

  const handleQuickConnect = async (savedConnection: SavedConnection) => {
    setConfig(savedConnection.config);
    await onConnect(savedConnection.config);
  };

  // Check if current config matches any saved connection
  const isCurrentConfigSaved = savedConnections.some(saved => 
    saved.config.host === config.host &&
    saved.config.port === config.port &&
    saved.config.database === config.database &&
    saved.config.username === config.username &&
    saved.config.password === config.password &&
    saved.config.sslMode === config.sslMode
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Database Connection
      </h3>
      
      {/* Saved Connections */}
      {savedConnections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600">Saved Connections</h4>
          <div className="space-y-1">
            {savedConnections.map((saved) => (
              <div key={saved.id} className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                <div className="flex items-center space-x-2 flex-1">
                  <Database className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {saved.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleLoadConnection(saved)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    title="Load connection details"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleQuickConnect(saved)}
                    disabled={isConnecting}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                    title="Connect immediately"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => onDeleteConnection(saved.id)}
                    className="text-xs p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Delete connection"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Host</label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => handleInputChange('host', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="url"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Port</label>
          <input
            type="number"
            value={config.port}
            onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Database</label>
          <input
            type="text"
            value={config.database}
            onChange={(e) => handleInputChange('database', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="mydb"
            autoComplete="off"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
          <input
            type="text"
            value={config.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="postgres"
            autoComplete="username"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="current-password"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SSL Mode</label>
          <select
            value={config.sslMode}
            onChange={(e) => handleInputChange('sslMode', e.target.value as any)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="auto">Auto (detect based on host)</option>
            <option value="require">Require SSL</option>
            <option value="prefer">Prefer SSL</option>
            <option value="disable">Disable SSL</option>
          </select>
        </div>
        
        <div className="pt-2 space-y-2">
          {!isConnected ? (
            <>
              {/* Connect and Save in same line */}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isConnecting ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
                </button>
                
                {/* Only show Save button if config is not already saved */}
                {!isCurrentConfigSaved && !showSaveForm && (
                  <button
                    type="button"
                    onClick={() => setShowSaveForm(true)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                )}
              </div>
              
              {/* Save form */}
              {showSaveForm && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                    placeholder="Connection name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleSaveConnection}
                      disabled={!connectionName.trim()}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSaveForm(false);
                        setConnectionName('');
                      }}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onDisconnect}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};