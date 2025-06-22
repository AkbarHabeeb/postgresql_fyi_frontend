import { ConnectionConfig, BridgeResponse, QueryResult, DatabaseSchema } from '../types';

const BRIDGE_URL = 'http://localhost:1234';

class BridgeService {
  async checkHealth(): Promise<BridgeResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${BRIDGE_URL}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Bridge service returned ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Bridge service connection timeout. Please ensure the bridge service is running on port 1234.');
        }
        throw new Error(`Bridge service error: ${error.message}`);
      }
      throw new Error('Bridge service is not running. Please start the bridge service on port 1234.');
    }
  }

  async connect(config: ConnectionConfig): Promise<BridgeResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${BRIDGE_URL}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Connection failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Connection timeout. Please check if the bridge service is running and the database is accessible.');
        }
        throw new Error(`Connection failed: ${error.message}`);
      }
      throw new Error('Unable to connect to the bridge service. Please ensure it is running on port 1234.');
    }
  }

  async disconnect(connectionId: string): Promise<BridgeResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${BRIDGE_URL}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Disconnect failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Disconnect timeout');
        }
        throw new Error(`Disconnect failed: ${error.message}`);
      }
      throw new Error('Unable to disconnect from the bridge service');
    }
  }

  async executeQuery(connectionId: string, sql: string): Promise<BridgeResponse<QueryResult>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for queries
      
      const response = await fetch(`${BRIDGE_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, sql }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Query execution failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Query execution timeout');
        }
        throw new Error(`Query execution failed: ${error.message}`);
      }
      throw new Error('Unable to execute query through the bridge service');
    }
  }

  async getSchema(connectionId: string): Promise<BridgeResponse<DatabaseSchema>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${BRIDGE_URL}/schema/${connectionId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Schema fetch failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Schema fetch timeout');
        }
        throw new Error(`Schema fetch failed: ${error.message}`);
      }
      throw new Error('Unable to fetch schema from the bridge service');
    }
  }
}

export const bridgeService = new BridgeService();