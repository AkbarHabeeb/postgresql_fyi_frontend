import React, { useState } from 'react';
import { FileText, Plus, Trash2, Download, Edit3 } from 'lucide-react';
import { SqlFile } from '../types';

interface SqlFileManagerProps {
  sqlFiles: SqlFile[];
  onCreateFile: (name: string, content: string) => void;
  onDeleteFile: (id: string) => void;
  onLoadFile: (file: SqlFile) => void;
  currentQuery: string;
  onSaveCurrentQuery: (id: string, content: string) => void;
  isConnected: boolean;
}

export const SqlFileManager: React.FC<SqlFileManagerProps> = ({
  sqlFiles,
  onCreateFile,
  onDeleteFile,
  onLoadFile,
  currentQuery,
  onSaveCurrentQuery,
  isConnected
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [fileName, setFileName] = useState('');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateFile = () => {
    if (fileName.trim()) {
      onCreateFile(fileName.trim(), currentQuery);
      setFileName('');
      setShowCreateForm(false);
    }
  };

  const handleSaveToFile = (file: SqlFile) => {
    onSaveCurrentQuery(file.id, currentQuery);
  };

  const downloadFile = (file: SqlFile) => {
    const blob = new Blob([file.content], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          SQL Files
        </h3>
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Connect to a database to manage SQL files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          SQL Files
        </h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
          title="Create new SQL file"
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </button>
      </div>

      {/* Create File Form */}
      {showCreateForm && (
        <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name (e.g., my-query.sql)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile();
              if (e.key === 'Escape') {
                setShowCreateForm(false);
                setFileName('');
              }
            }}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleCreateFile}
              disabled={!fileName.trim()}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setFileName('');
              }}
              className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SQL Files List */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {sqlFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No SQL files saved yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first SQL file to get started</p>
          </div>
        ) : (
          sqlFiles.map((file) => (
            <div key={file.id} className="bg-gray-50 border border-gray-200 rounded-md p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  {editingFile === file.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-xs font-medium text-gray-900 bg-white border border-gray-300 rounded px-1 py-0.5 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // Here you would implement rename functionality
                          setEditingFile(null);
                          setEditingName('');
                        }
                        if (e.key === 'Escape') {
                          setEditingFile(null);
                          setEditingName('');
                        }
                      }}
                      onBlur={() => {
                        setEditingFile(null);
                        setEditingName('');
                      }}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="text-xs font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                      onClick={() => onLoadFile(file)}
                      title={`Load ${file.name} into editor`}
                    >
                      {file.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleSaveToFile(file)}
                    className="text-xs p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                    title="Save current query to this file"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => downloadFile(file)}
                    className="text-xs p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Download file"
                  >
                    <FileText className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="text-xs p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Updated {formatDate(file.updatedAt)}
              </div>
              {file.content && (
                <div className="mt-1 text-xs text-gray-600 font-mono bg-white rounded px-2 py-1 max-h-12 overflow-hidden">
                  {file.content.length > 60 
                    ? `${file.content.substring(0, 60)}...` 
                    : file.content
                  }
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};