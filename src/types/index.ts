export interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  sslMode: 'auto' | 'require' | 'prefer' | 'disable';
}

export interface SavedConnection {
  id: string;
  name: string;
  config: ConnectionConfig;
  createdAt: Date;
}

export interface QueryResult {
  rows: Record<string, any>[];
  rowCount: number;
  fields: any[];
  duration: number;
}

export interface QueryHistoryItem {
  sql: string;
  timestamp: Date;
}

export interface TableColumn {
  name: string;
  type: string;
}

export interface TableInfo {
  columns: TableColumn[];
}

export interface DatabaseSchema {
  [tableName: string]: TableInfo;
}

export interface BridgeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  connectionId?: string;
  schema?: DatabaseSchema;
  activeConnections?: number;
}