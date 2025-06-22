import { useState, useEffect } from 'react';
import { SavedConnection, ConnectionConfig } from '../types';

export function useSavedConnections(): [
  SavedConnection[],
  (name: string, config: ConnectionConfig) => void,
  (id: string) => void
] {
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('psql-saved-connections');
      if (saved) {
        const connections = JSON.parse(saved);
        setSavedConnections(connections.map((conn: any) => ({
          ...conn,
          createdAt: new Date(conn.createdAt)
        })));
      }
    } catch (error) {
      console.warn('Error loading saved connections:', error);
    }
  }, []);

  const saveConnection = (name: string, config: ConnectionConfig) => {
    const newConnection: SavedConnection = {
      id: Date.now().toString(),
      name,
      config: { ...config }, // Save password as well
      createdAt: new Date()
    };

    const updatedConnections = [...savedConnections, newConnection];
    setSavedConnections(updatedConnections);
    
    try {
      localStorage.setItem('psql-saved-connections', JSON.stringify(updatedConnections));
    } catch (error) {
      console.warn('Error saving connection:', error);
    }
  };

  const deleteConnection = (id: string) => {
    const updatedConnections = savedConnections.filter(conn => conn.id !== id);
    setSavedConnections(updatedConnections);
    
    try {
      localStorage.setItem('psql-saved-connections', JSON.stringify(updatedConnections));
    } catch (error) {
      console.warn('Error deleting connection:', error);
    }
  };

  return [savedConnections, saveConnection, deleteConnection];
}