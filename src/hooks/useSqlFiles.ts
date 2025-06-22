import { useState, useEffect } from 'react';
import { SqlFile } from '../types';

export function useSqlFiles(): [
  SqlFile[],
  (name: string, content: string) => void,
  (id: string, content: string) => void,
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

  const createSqlFile = (name: string, content: string) => {
    const newFile: SqlFile = {
      id: Date.now().toString(),
      name: name.endsWith('.sql') ? name : `${name}.sql`,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedFiles = [...sqlFiles, newFile];
    setSqlFiles(updatedFiles);
    saveToStorage(updatedFiles);
  };

  const updateSqlFile = (id: string, content: string) => {
    const updatedFiles = sqlFiles.map(file => 
      file.id === id 
        ? { ...file, content, updatedAt: new Date() }
        : file
    );
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