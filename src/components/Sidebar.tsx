import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ConnectionForm } from './ConnectionForm';
import { SchemaTree } from './SchemaTree';
import { QueryHistory } from './QueryHistory';
import { ConnectionConfig, DatabaseSchema, QueryHistoryItem, SavedConnection } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onConnect: (config: ConnectionConfig) => Promise<void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
  isConnecting: boolean;
  schema: DatabaseSchema | null;
  onRefreshSchema: () => Promise<void>;
  isSchemaLoading: boolean;
  onColumnClick: (columnName: string) => void;
  queryHistory: QueryHistoryItem[];
  onSelectQuery: (sql: string) => void;
  savedConnections: SavedConnection[];
  onSaveConnection: (name: string, config: ConnectionConfig) => void;
  onDeleteConnection: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  onConnect,
  onDisconnect,
  isConnected,
  isConnecting,
  schema,
  onRefreshSchema,
  isSchemaLoading,
  onColumnClick,
  queryHistory,
  onSelectQuery,
  savedConnections,
  onSaveConnection,
  onDeleteConnection
}) => {
  return (
    <div className={`relative bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 bg-blue-600 hover:bg-blue-700 border border-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-white" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className={`${isCollapsed ? 'hidden' : 'block'} h-full overflow-y-auto`}>
        <div className="p-6 space-y-8">
          <ConnectionForm
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            isConnected={isConnected}
            isConnecting={isConnecting}
            savedConnections={savedConnections}
            onSaveConnection={onSaveConnection}
            onDeleteConnection={onDeleteConnection}
          />
          
          <SchemaTree
            schema={schema}
            onRefresh={onRefreshSchema}
            onColumnClick={onColumnClick}
            isConnected={isConnected}
            isLoading={isSchemaLoading}
          />
          
          <QueryHistory
            history={queryHistory}
            onSelectQuery={onSelectQuery}
          />
        </div>
      </div>
    </div>
  );
};