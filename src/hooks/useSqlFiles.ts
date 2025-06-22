import { useState, useEffect } from 'react';
import { SqlFile } from '../types';

export function useSqlFiles(): [
  SqlFile[],
  (name: string, content: string) => string, // Returns file ID
  (id: string, name?: string, content?: string) => void,
  (id: string) => void
] {
  const [sqlFiles, setSqlFiles] = useState<SqlFile[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('psql-sql-files');
      if (saved) {
        const files = JSON.parse(saved);
        setSqlFiles(files.map((file: any) => ({
          ...file,
          createdAt: new Date(file.createdAt),
          updatedAt: new Date(file.updatedAt)
        })));
      }
    } catch (error) {
      console.warn('Error loading SQL files:', error);
    }
  }, []);

  const saveToStorage = (files: SqlFile[]) => {
    try {
      localStorage.setItem('psql-sql-files', JSON.stringify(files));
    } catch (error) {
      console.warn('Error saving SQL files:', error);
    }
  };

  const createSqlFile = (name: string, content: string): string => {
    const fileId = Date.now().toString();
    const newFile: SqlFile = {
      id: fileId,
      name: name.endsWith('.sql') ? name : `${name}.sql`,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedFiles = [...sqlFiles, newFile];
    setSqlFiles(updatedFiles);
    saveToStorage(updatedFiles);
    return fileId;
  };

  const updateSqlFile = (id: string, name?: string, content?: string) => {
    const updatedFiles = sqlFiles.map(file => {
      if (file.id === id) {
        const updates: Partial<SqlFile> = { updatedAt: new Date() };
        if (name !== undefined) updates.name = name.endsWith('.sql') ? name : `${name}.sql`;
        if (content !== undefined) updates.content = content;
        return { ...file, ...updates };
      }
      return file;
    });
    setSqlFiles(updatedFiles);
    saveToStorage(updatedFiles);
  };

  const deleteSqlFile = (id: string) => {
    const updatedFiles = sqlFiles.filter(file => file.id !== id);
    setSqlFiles(updatedFiles);
    saveToStorage(updatedFiles);
  };

  return [sqlFiles, createSqlFile, updateSqlFile, deleteSqlFile];
}