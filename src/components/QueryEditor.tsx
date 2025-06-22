import React, { useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play } from 'lucide-react';

interface QueryEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onExecute: () => void;
  isConnected: boolean;
  isExecuting: boolean;
}

export const QueryEditor: React.FC<QueryEditorProps> = ({
  value,
  onChange,
  onExecute,
  isConnected,
  isExecuting
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure PostgreSQL language
    monaco.languages.register({ id: 'postgresql' });
    
    // Define PostgreSQL keywords and functions
    monaco.languages.setMonarchTokensProvider('postgresql', {
      tokenizer: {
        root: [
          // Keywords
          [/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|DATABASE|SCHEMA|FUNCTION|PROCEDURE|TRIGGER|BEGIN|END|IF|ELSE|WHILE|FOR|LOOP|RETURN|AS|WITH|UNION|INTERSECT|EXCEPT|ORDER|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|ALL|EXISTS|IN|NOT|AND|OR|NULL|TRUE|FALSE|CASE|WHEN|THEN|ELSE|END|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|USING|CROSS|NATURAL)\b/i, 'keyword'],
          
          // Data types
          [/\b(INTEGER|INT|BIGINT|SMALLINT|DECIMAL|NUMERIC|REAL|DOUBLE|PRECISION|SERIAL|BIGSERIAL|MONEY|CHARACTER|CHAR|VARCHAR|TEXT|BYTEA|TIMESTAMP|DATE|TIME|INTERVAL|BOOLEAN|BOOL|POINT|LINE|LSEG|BOX|PATH|POLYGON|CIRCLE|CIDR|INET|MACADDR|UUID|XML|JSON|JSONB|ARRAY)\b/i, 'type'],
          
          // Functions
          [/\b(COUNT|SUM|AVG|MIN|MAX|COALESCE|NULLIF|GREATEST|LEAST|UPPER|LOWER|LENGTH|SUBSTRING|TRIM|CONCAT|NOW|CURRENT_TIMESTAMP|CURRENT_DATE|CURRENT_TIME|EXTRACT|DATE_PART|AGE|TO_CHAR|TO_DATE|TO_TIMESTAMP|CAST|CONVERT|ABS|CEIL|FLOOR|ROUND|RANDOM|MD5|SHA256|REGEXP_REPLACE|REGEXP_MATCH|ARRAY_AGG|STRING_AGG|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|FIRST_VALUE|LAST_VALUE)\b/i, 'predefined'],
          
          // Strings
          [/'([^'\\]|\\.)*'/, 'string'],
          [/"([^"\\]|\\.)*"/, 'string'],
          
          // Numbers
          [/\b\d+(\.\d+)?\b/, 'number'],
          
          // Comments
          [/--.*$/, 'comment'],
          [/\/\*[\s\S]*?\*\//, 'comment'],
          
          // Operators
          [/[=<>!]+/, 'operator'],
          [/[+\-*\/%]/, 'operator'],
          
          // Delimiters
          [/[;,.]/, 'delimiter'],
          [/[()[\]{}]/, 'bracket'],
        ]
      }
    });

    // Configure auto-completion
    monaco.languages.registerCompletionItemProvider('postgresql', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          // SQL Keywords
          { label: 'SELECT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'SELECT ' },
          { label: 'FROM', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'FROM ' },
          { label: 'WHERE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'WHERE ' },
          { label: 'INSERT INTO', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'INSERT INTO ' },
          { label: 'UPDATE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'UPDATE ' },
          { label: 'DELETE FROM', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'DELETE FROM ' },
          { label: 'CREATE TABLE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'CREATE TABLE ' },
          { label: 'ALTER TABLE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'ALTER TABLE ' },
          { label: 'DROP TABLE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'DROP TABLE ' },
          { label: 'ORDER BY', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'ORDER BY ' },
          { label: 'GROUP BY', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'GROUP BY ' },
          { label: 'HAVING', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'HAVING ' },
          { label: 'INNER JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'INNER JOIN ' },
          { label: 'LEFT JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'LEFT JOIN ' },
          { label: 'RIGHT JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'RIGHT JOIN ' },
          { label: 'FULL OUTER JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'FULL OUTER JOIN ' },
          
          // Data Types
          { label: 'INTEGER', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'INTEGER' },
          { label: 'VARCHAR', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'VARCHAR(' },
          { label: 'TEXT', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'TEXT' },
          { label: 'TIMESTAMP', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'TIMESTAMP' },
          { label: 'DATE', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'DATE' },
          { label: 'BOOLEAN', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'BOOLEAN' },
          { label: 'DECIMAL', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'DECIMAL(' },
          { label: 'JSON', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'JSON' },
          { label: 'JSONB', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'JSONB' },
          { label: 'UUID', kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: 'UUID' },
          
          // Functions
          { label: 'COUNT', kind: monaco.languages.CompletionItemKind.Function, insertText: 'COUNT(' },
          { label: 'SUM', kind: monaco.languages.CompletionItemKind.Function, insertText: 'SUM(' },
          { label: 'AVG', kind: monaco.languages.CompletionItemKind.Function, insertText: 'AVG(' },
          { label: 'MIN', kind: monaco.languages.CompletionItemKind.Function, insertText: 'MIN(' },
          { label: 'MAX', kind: monaco.languages.CompletionItemKind.Function, insertText: 'MAX(' },
          { label: 'COALESCE', kind: monaco.languages.CompletionItemKind.Function, insertText: 'COALESCE(' },
          { label: 'UPPER', kind: monaco.languages.CompletionItemKind.Function, insertText: 'UPPER(' },
          { label: 'LOWER', kind: monaco.languages.CompletionItemKind.Function, insertText: 'LOWER(' },
          { label: 'LENGTH', kind: monaco.languages.CompletionItemKind.Function, insertText: 'LENGTH(' },
          { label: 'SUBSTRING', kind: monaco.languages.CompletionItemKind.Function, insertText: 'SUBSTRING(' },
          { label: 'NOW', kind: monaco.languages.CompletionItemKind.Function, insertText: 'NOW()' },
          { label: 'CURRENT_TIMESTAMP', kind: monaco.languages.CompletionItemKind.Function, insertText: 'CURRENT_TIMESTAMP' },
          { label: 'EXTRACT', kind: monaco.languages.CompletionItemKind.Function, insertText: 'EXTRACT(' },
          
          // Common snippets
          { label: 'Basic SELECT', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'SELECT * FROM ${1:table_name} WHERE ${2:condition};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: 'INSERT', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'INSERT INTO ${1:table_name} (${2:columns}) VALUES (${3:values});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: 'UPDATE', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'UPDATE ${1:table_name} SET ${2:column} = ${3:value} WHERE ${4:condition};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: 'CREATE TABLE', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'CREATE TABLE ${1:table_name} (\n    ${2:id} SERIAL PRIMARY KEY,\n    ${3:column_name} ${4:data_type}\n);', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        ];

        return { suggestions };
      }
    });

    // Add keyboard shortcut for execution
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (isConnected && !isExecuting) {
        onExecute();
      }
    });
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">SQL Query</h3>
        <div className="flex space-x-2">
          <button
            onClick={onExecute}
            disabled={!isConnected || isExecuting}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{isExecuting ? 'Executing...' : 'Execute (Ctrl+Enter)'}</span>
          </button>
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-md overflow-hidden flex-1">
        <Editor
          height="100%"
          language="postgresql"
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          theme="vs"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            tabCompletion: 'on',
          }}
        />
      </div>
    </div>
  );
};