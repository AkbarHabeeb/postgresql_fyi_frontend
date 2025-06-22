import React, { useState } from 'react';
import { FileText, Plus, Trash2, Download, Edit3, FolderOpen } from 'lucide-react';
import { SqlFile } from '../types';

interface SqlFileManagerProps {
  sqlFiles: SqlFile[];
  onCreateFile: (name: string, content: string) => void;
  onUpdateFile: (id: string, name?: string, content?: string) => void;
  onDeleteFile: (id: string) => void;
  onLoadFile: (file: SqlFile) => void;
  currentQuery: string;
  currentFileId?: string;
  isConnected: boolean;
}

export const SqlFileManager: React.FC<SqlFileManagerProps> = ({
  sqlFiles,
  onCreateFile,
  onUpdateFile,
  onDeleteFile,
  onLoadFile,
  currentQuery,
  currentFileId,
  isConnected
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [fileName, setFileName] = useState('');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreateFile = () => {
    if (fileName.trim()) {
      onCreateFile(fileName.trim(), currentQuery);
      setFileName('');
      setShowCreateForm(false);
    }
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    if (newName.trim() && newName !== editingName) {
      onUpdateFile(fileId, newName.trim());
    }
    setEditingFile(null);
    setEditingName('');
  };

  const handleDeleteFile = (fileId: string) => {
    if (deleteConfirm === fileId) {
      onDeleteFile(fileId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(fileId);
      setTimeout(() => setDeleteConfirm(null), 3000); // Auto-cancel after 3 seconds
    }
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
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Connect to a database to manage SQL files</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{sqlFiles.length} files</span>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          title="Create new SQL file"
        >
          <Plus className="w-3 h-3" />
          <span>New File</span>
        </button>
      </div>

      {/* Create File Form */}
      {showCreateForm && (
        <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="my-query.sql"
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
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateFile}
              disabled={!fileName.trim()}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Create File
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
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {sqlFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">No SQL files yet</h4>
            <p className="text-xs text-gray-500">Create your first SQL file to get started</p>
          </div>
        ) : (
          sqlFiles.map((file) => (
            <div 
              key={file.id} 
              className={`bg-white border rounded-lg p-3 hover:shadow-md transition-all duration-200 ${
                currentFileId === file.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  {editingFile === file.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameFile(file.id, editingName);
                        }
                        if (e.key === 'Escape') {
                          setEditingFile(null);
                          setEditingName('');
                        }
                      }}
                      onBlur={() => handleRenameFile(file.id, editingName)}
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                        {currentFileId === file.id && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Updated {formatDate(file.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Action Icons */}
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => onLoadFile(file)}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                    title="Load file into editor"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingFile(file.id);
                      setEditingName(file.name);
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Rename file"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => downloadFile(file)}
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className={`p-1.5 rounded-md transition-colors ${
                      deleteConfirm === file.id
                        ? 'text-white bg-red-600 hover:bg-red-700'
                        : 'text-red-600 hover:bg-red-100'
                    }`}
                    title={deleteConfirm === file.id ? 'Click again to confirm deletion' : 'Delete file'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {/* File Content Preview */}
              {file.content && (
                <div className="mt-2 text-xs text-gray-600 font-mono bg-gray-50 rounded px-2 py-1.5 max-h-16 overflow-hidden">
                  {file.content.length > 80 
                    ? `${file.content.substring(0, 80)}...` 
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