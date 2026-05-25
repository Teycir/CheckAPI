'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function KeysTextarea({ value, onChange, disabled }: Props) {
  const lineCount = value.split('\n').filter(Boolean).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-600 dark:text-gray-400">
          Paste your API keys below — one per line
        </label>
        {lineCount > 0 && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            {lineCount} {lineCount === 1 ? 'key' : 'keys'}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="sk-ant-api03-...&#10;sk-proj-...&#10;AIzaSy..."
        className="w-full h-40 p-4 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        🔒 All checks run in your browser. Keys are never sent to any server.
      </p>
    </div>
  );
}
