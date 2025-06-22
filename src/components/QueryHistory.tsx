import React from 'react';
import { Clock } from 'lucide-react';
import { QueryHistoryItem } from '../types';

interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onSelectQuery: (sql: string) => void;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({ history, onSelectQuery }) => {
  return (
    <div className="space-y-4">
      <div className="max-h-48 overflow-y-auto space-y-1">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No queries executed yet</p>
          </div>
        ) : (
          history.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelectQuery(item.sql)}
              className="w-full text-left px-3 py-2 text-xs font-mono bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
              title={item.sql}
            >
              <div className="truncate">
                {item.sql.length > 50 ? `${item.sql.substring(0, 50)}...` : item.sql}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};