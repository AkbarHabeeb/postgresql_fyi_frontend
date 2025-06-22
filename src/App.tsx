import React, { useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QueryEditor } from './components/QueryEditor';
import { QueryResults } from './components/QueryResults';
import { ThemeProvider } from './contexts/ThemeContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSavedConnections } from './hooks/useSavedConnections';
import { useSqlFiles } from './hooks/useSqlFiles';
import { bridgeService } from './services/bridgeService';
import { ConnectionConfig, QueryResult, DatabaseSchema, QueryHistoryItem, SqlFile, SavedConnection } from './types';

export default function App() {
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState({ connected: false, message: 'Checking bridge...' });
  
  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentDatabase, setCurrentDatabase] = useState<string | null>(null);
  const [currentHost, setCurrentHost] = useState<string | null>(null);
  const [currentConnectionConfig, setCurrentConnectionConfig] = useState<ConnectionConfig | null>(null);
  
  // Query State
  const [queryText, setQueryText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  
  // Schema State
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  
  // History State
  const [queryHistory, setQueryHistory] = useLocalStorage<QueryHistoryItem[]>('psql-query-history', []);
  
  // Saved Connections
  const [savedConnections, saveConnection, deleteConnection] = useSavedConnections();

  // SQL Files
  const [sqlFiles, createSqlFile, updateSqlFile, deleteSqlFile] = useSqlFiles();
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [originalFileContent, setOriginalFileContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check for unsaved changes
  useEffect(() => {
    if (currentFileId) {
      setHasUnsavedChanges(queryText !== originalFileContent);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [queryText, originalFileContent, currentFileId]);

  // Check bridge status on mount and periodically
  useEffect(() => {
    const checkBridge = async () => {
      try {
        const response = await bridgeService.checkHealth();
        if (response.success) {
          setBridgeStatus({
            connected: true,
            message: `Bridge running (${response.activeConnections || 0} connections)`
          });
          setConnectionError(null);
        } else {
          setBridgeStatus({ connected: false, message: 'Bridge not running' });
          setConnectionError('Bridge service returned an error');
        }
      } catch (error) {
        setBridgeStatus({ connected: false, message: 'Bridge not running' });
        setConnectionError('Bridge service not accessible');
      }
    };

    checkBridge();
    const interval = setInterval(checkBridge, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get display name for current connection
  const getCurrentConnectionDisplayName = useCallback(() => {
    if (!currentConnectionConfig) return currentDatabase;
    
    // Check if current connection matches any saved connection
    const savedConnection = savedConnections.find(saved => 
      saved.config.host === currentConnectionConfig.host &&
      saved.config.port === currentConnectionConfig.port &&
      saved.config.database === currentConnectionConfig.database &&
      saved.config.username === currentConnectionConfig.username
    );
    
    return savedConnection ? savedConnection.name : currentDatabase;
  }, [currentConnectionConfig, savedConnections, currentDatabase]);

  const handleConnect = useCallback(async (config: ConnectionConfig) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const response = await bridgeService.connect(config);
      if (response.success && response.connectionId) {
        setConnectionId(response.connectionId);
        setIsConnected(true);
        setCurrentDatabase(config.database);
        setCurrentHost(config.host);
        setCurrentConnectionConfig(config);
        setConnectionError(null);
        await loadSchema(response.connectionId);
      } else {
        const errorMsg = response.error || 'Connection failed';
        setConnectionError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionError(errorMessage);
      console.error('Connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    if (!connectionId) return;
    
    try {
      await bridgeService.disconnect(connectionId);
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setConnectionId(null);
      setIsConnected(false);
      setCurrentDatabase(null);
      setCurrentHost(null);
      setCurrentConnectionConfig(null);
      setSchema(null);
      setQueryResult(null);
      setQueryError(null);
      setConnectionError(null);
    }
  }, [connectionId]);

  const loadSchema = useCallback(async (connId?: string) => {
    const activeConnectionId = connId || connectionId;
    if (!activeConnectionId) return;

    setIsSchemaLoading(true);
    try {
      const response = await bridgeService.getSchema(activeConnectionId);
      if (response.success && response.schema) {
        setSchema(response.schema);
      } else {
        console.error('Schema load error:', response.error);
      }
    } catch (error) {
      console.error('Schema load error:', error);
    } finally {
      setIsSchemaLoading(false);
    }
  }, [connectionId]);

  const executeQuery = useCallback(async () => {
    if (!connectionId || !queryText.trim()) return;

    setIsExecuting(true);
    setQueryError(null);
    setQueryResult(null);

    try {
      const response = await bridgeService.executeQuery(connectionId, queryText.trim());
      if (response.success && response.data) {
        setQueryResult(response.data);
        // Add to history
        const newHistoryItem: QueryHistoryItem = {
          sql: queryText.trim(),
          timestamp: new Date()
        };
        setQueryHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10
      } else {
        setQueryError(response.error || 'Query execution failed');
      }
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : 'Network error');
    } finally {
      setIsExecuting(false);
    }
  }, [connectionId, queryText, setQueryHistory]);

  const handleColumnClick = useCallback((columnName: string) => {
    setQueryText(prev => {
      const lines = prev.split('\n');
      const lastLine = lines[lines.length - 1];
      const newLastLine = lastLine ? `${lastLine} ${columnName}` : columnName;
      return [...lines.slice(0, -1), newLastLine].join('\n');
    });
  }, []);

  const handleSelectQuery = useCallback((sql: string) => {
    setQueryText(sql);
    setCurrentFileId(null);
    setOriginalFileContent('');
  }, []);

  const handleLoadSqlFile = useCallback((file: SqlFile) => {
    setQueryText(file.content);
    setCurrentFileId(file.id);
    setOriginalFileContent(file.content);
  }, []);

  const handleSaveQuery = useCallback((fileName?: string) => {
    console.log('Save button clicked!', { currentFileId, queryText: queryText.length, fileName });
    
    if (currentFileId) {
      // Update existing file
      console.log('Updating existing file:', currentFileId);
      updateSqlFile(currentFileId, undefined, queryText);
      setOriginalFileContent(queryText);
    } else if (fileName) {
      // Create new file with provided name
      console.log('Creating new file:', fileName);
      const fileId = createSqlFile(fileName, queryText);
      setCurrentFileId(fileId);
      setOriginalFileContent(queryText);
    }
  }, [currentFileId, queryText, updateSqlFile, createSqlFile]);

  const handleCreateSqlFile = useCallback((name: string, content: string) => {
    const fileId = createSqlFile(name, content);
    return fileId;
  }, [createSqlFile]);

  const handleUpdateSqlFile = useCallback((id: string, name?: string, content?: string) => {
    updateSqlFile(id, name, content);
    // If updating the current file's content, update our tracking
    if (id === currentFileId && content !== undefined) {
      setOriginalFileContent(content);
    }
  }, [updateSqlFile, currentFileId]);

  const getCurrentFileName = useCallback(() => {
    if (currentFileId) {
      const file = sqlFiles.find(f => f.id === currentFileId);
      return file?.name;
    }
    return undefined;
  }, [currentFileId, sqlFiles]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-300">
        <Header 
          isConnected={isConnected} 
          statusText={bridgeStatus.message}
          bridgeConnected={bridgeStatus.connected}
          currentDatabase={getCurrentConnectionDisplayName()}
          currentHost={currentHost}
        />
        
        {/* Bridge Service Status Box - Only show when NOT connected */}
        {!bridgeStatus.connected && (
          <div className="mx-6 mt-4 mb-2">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-red-400 rounded-full mt-1"></div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Bridge Service Required</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                    <p className="mb-2">To use this PostgreSQL client, you need to install and run the bridge service:</p>
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-md p-3 font-mono text-xs">
                      <div className="mb-1">1. Install the bridge service:</div>
                      <div className="bg-white dark:bg-gray-800 rounded px-2 py-1 mb-2">npm install -g connectpsql</div>
                      <div className="mb-1">2. Start the bridge service:</div>
                      <div className="bg-white dark:bg-gray-800 rounded px-2 py-1">connectpsql start --cors-origin "*" --port 1234</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnected={isConnected}
            isConnecting={isConnecting}
            schema={schema}
            onRefreshSchema={() => loadSchema()}
            isSchemaLoading={isSchemaLoading}
            onColumnClick={handleColumnClick}
            queryHistory={queryHistory}
            onSelectQuery={handleSelectQuery}
            savedConnections={savedConnections}
            onSaveConnection={saveConnection}
            onDeleteConnection={deleteConnection}
            sqlFiles={sqlFiles}
            onCreateSqlFile={handleCreateSqlFile}
            onUpdateSqlFile={handleUpdateSqlFile}
            onDeleteSqlFile={deleteSqlFile}
            onLoadSqlFile={handleLoadSqlFile}
            currentQuery={queryText}
            currentFileId={currentFileId}
          />
          
          {/* Main content area with fixed layout */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <PanelGroup direction="vertical" className="flex-1">
              <Panel defaultSize={40} minSize={25}>
                <div className="p-6 bg-white dark:bg-gray-900 h-full transition-colors duration-300">
                  <QueryEditor
                    value={queryText}
                    onChange={(value) => setQueryText(value || '')}
                    onExecute={executeQuery}
                    onSave={handleSaveQuery}
                    isConnected={isConnected}
                    isExecuting={isExecuting}
                    hasUnsavedChanges={hasUnsavedChanges}
                    currentFileName={getCurrentFileName()}
                  />
                </div>
              </Panel>
              
              <PanelResizeHandle className="h-2 bg-blue-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-gray-600 transition-colors duration-200 cursor-row-resize flex items-center justify-center">
                <div className="w-12 h-1 bg-blue-500 dark:bg-gray-500 rounded-full"></div>
              </PanelResizeHandle>
              
              <Panel defaultSize={60} minSize={25}>
                <div className="p-6 bg-white dark:bg-gray-900 h-full overflow-hidden transition-colors duration-300">
                  <QueryResults
                    result={queryResult}
                    isLoading={isExecuting}
                    error={queryError}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}