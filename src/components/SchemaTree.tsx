import React, { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronRight, Table, Type } from 'lucide-react';
import { DatabaseSchema } from '../types';

interface SchemaTreeProps {
  schema: DatabaseSchema | null;
  onRefresh: () => Promise<void>;
  onColumnClick: (columnName: string) => void;
  isConnected: boolean;
  isLoading: boolean;
}

export const SchemaTree: React.FC<SchemaTreeProps> = ({
  schema,
  onRefresh,
  onColumnClick,
  isConnected,
  isLoading
}) => {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableName)) {
        newSet.delete(tableName);
      } else {
        newSet.add(tableName);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Database Schema
        </h3>
      </div>
      
      <button
        onClick={onRefresh}
        disabled={!isConnected || isLoading}
        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refresh Schema</span>
      </button>
      
      <div className="max-h-96 overflow-y-auto space-y-2">
        {!isConnected ? (
          <div className="text-center py-8 text-gray-500">
            <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Connect to a database to view schema</p>
          </div>
        ) : !schema || Object.keys(schema).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tables found in database</p>
          </div>
        ) : (
          Object.entries(schema).map(([tableName, tableInfo]) => (
            <div key={tableName} className="border border-gray-200 rounded-md overflow-hidden">
              <button
                onClick={() => toggleTable(tableName)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{tableName}</span>
                </div>
                {expandedTables.has(tableName) ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
              {expandedTables.has(tableName) && tableInfo.columns && (
                <div className="bg-white p-2 space-y-1">
                  {tableInfo.columns.map((column) => (
                    <button
                      key={column.name}
                      onClick={() => onColumnClick(`${tableName}.${column.name}`)}
                      className="w-full flex items-center justify-between px-2 py-1 text-xs hover:bg-gray-50 rounded transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-gray-900">{column.name}</span>
                      </div>
                      <span className="text-blue-600 font-mono">{column.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};