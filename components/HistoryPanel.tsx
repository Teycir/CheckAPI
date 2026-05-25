'use client';

import { useState } from 'react';
import { HistoryEntry } from '@/lib/ui/useHistory';
import { ValidationResult } from '@/lib';
import { Clock, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';
import ResultsTable from './ResultsTable';

interface Props {
  history: HistoryEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onRestore: (results: ValidationResult[]) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function HistoryPanel({ history, onRemove, onClear, onRestore }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm font-mono">
        No history yet — results will appear here after each check.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {history.length} session{history.length !== 1 ? 's' : ''} stored
        </span>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Clear all
        </button>
      </div>

      {history.map(entry => (
        <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {/* Row header */}
          <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
          >
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />

            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex-shrink-0">
              {formatDate(entry.checkedAt)}
            </span>

            <div className="flex gap-2 flex-1 min-w-0">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-mono">
                {entry.valid} valid
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-mono">
                {entry.total} total
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={e => { e.stopPropagation(); onRestore(entry.results); }}
                className="text-xs px-2.5 py-1 text-neon-blue border border-neon-blue/30 hover:border-neon-blue rounded-lg transition-colors"
              >
                Restore
              </button>
              <button
                onClick={e => { e.stopPropagation(); onRemove(entry.id); }}
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Delete entry"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {expanded === entry.id
                ? <ChevronDown className="w-4 h-4 text-gray-400" />
                : <ChevronRight className="w-4 h-4 text-gray-400" />
              }
            </div>
          </div>

          {/* Expanded results */}
          {expanded === entry.id && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 bg-gray-50/50 dark:bg-gray-800/20">
              <ResultsTable results={entry.results} disableConfetti />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
