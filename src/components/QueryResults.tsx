import React, { useState, useMemo } from 'react';
import { Clock, Database } from 'lucide-react';
import { QueryResult } from '../types';

interface QueryResultsProps {
  result: QueryResult | null;
  isLoading: boolean;
  error: string | null;
}

interface QueryTab {
  id: string;
  title: string;
  result: QueryResult;
}

export const QueryResults: React.FC<QueryResultsProps> = ({ result, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<string>('0');
  
  // Parse multiple query results from a single result
  const queryTabs = useMemo<QueryTab[]>(() => {
    if (!result) return [];
    
    // For now, we'll treat each result as a single tab
    // In the future, this could be enhanced to split multiple queries
    return [{
      id: '0',
      title: `Query 1`,
      result: result
    }];
  }, [result]);

  if (isLoading) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
        </div>
        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-md flex-1">
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Executing query...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-md flex-1">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Query</h3>
          <p className="text-gray-600">Connect to a database and execute a query to see results here</p>
        </div>
      </div>
    );
  }

  const currentResult = queryTabs.find(tab => tab.id === activeTab)?.result || result;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Database className="w-4 h-4" />
            <span>{currentResult.rowCount} rows</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{currentResult.duration}ms</span>
          </div>
        </div>
      </div>

      {/* Query Tabs */}
      {queryTabs.length > 1 && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {queryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.title}
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {tab.result.rowCount}
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {currentResult.rows.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-600">Query executed successfully but returned no results</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden flex-1">
          <div className="overflow-auto h-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {Object.keys(currentResult.rows[0]).map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '150px', maxWidth: '300px' }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentResult.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.entries(row).map(([column, value]) => (
                      <td 
                        key={column} 
                        className="px-4 py-2 text-sm text-gray-900"
                        style={{ 
                          minWidth: '150px', 
                          maxWidth: '300px',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {value === null ? (
                          <span className="text-gray-400 italic">NULL</span>
                        ) : typeof value === 'number' ? (
                          <span className="font-mono text-right block">{value}</span>
                        ) : typeof value === 'object' ? (
                          <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded max-h-20 overflow-y-auto">
                            {JSON.stringify(value, null, 2)}
                          </div>
                        ) : (
                          <div className="truncate" title={String(value)}>
                            {String(value).length > 100 
                              ? `${String(value).substring(0, 100)}...` 
                              : String(value)
                            }
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};