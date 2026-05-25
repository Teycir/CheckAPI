'use client';

import { useState } from 'react';
import { HistoryEntry } from '@/lib/ui/useHistory';
import { ValidationResult } from '@/lib';
import { Clock, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';
import ResultsTable from './ResultsTable';

interface Props {
  history: HistoryEntry[];
  onRemove: (id: string) => void;
  onClear:  () => void;
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
      <div
        className="text-center py-10 text-sm font-mono"
        style={{ color: 'color-mix(in srgb, var(--dark-text) 45%, transparent)' }}
      >
        No history yet — results will appear here after each check.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* header row */}
      <div className="flex justify-between items-center mb-3">
        <span
          className="text-xs font-mono"
          style={{ color: 'color-mix(in srgb, var(--dark-text) 50%, transparent)' }}
        >
          {history.length} session{history.length !== 1 ? 's' : ''} stored
        </span>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-red-500 dark:text-red-400
                     hover:text-red-600 dark:hover:text-red-300
                     border border-red-400/30 hover:border-red-400/60
                     rounded-lg transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Clear all
        </button>
      </div>

      {history.map(entry => (
        <div
          key={entry.id}
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Row header */}
          <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
            style={{ background: 'var(--surface)' }}
            onMouseEnter={e =>
              (e.currentTarget.style.background =
                'color-mix(in srgb, var(--neon-blue) 4%, var(--surface))')
            }
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
            onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
          >
            <Clock
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'color-mix(in srgb, var(--dark-text) 40%, transparent)' }}
            />

            <span
              className="text-xs font-mono flex-shrink-0"
              style={{ color: 'color-mix(in srgb, var(--dark-text) 55%, transparent)' }}
            >
              {formatDate(entry.checkedAt)}
            </span>

            <div className="flex gap-2 flex-1 min-w-0">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-mono">
                {entry.valid} valid
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{
                  background: 'var(--surface-alt)',
                  color: 'color-mix(in srgb, var(--dark-text) 70%, transparent)',
                }}
              >
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
                className="transition-colors"
                style={{ color: 'color-mix(in srgb, var(--dark-text) 40%, transparent)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgb(248 113 113)')}
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLElement).style.color =
                    'color-mix(in srgb, var(--dark-text) 40%, transparent)')
                }
                aria-label="Delete entry"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {expanded === entry.id
                ? <ChevronDown className="w-4 h-4" style={{ color: 'color-mix(in srgb, var(--dark-text) 40%, transparent)' }} />
                : <ChevronRight className="w-4 h-4" style={{ color: 'color-mix(in srgb, var(--dark-text) 40%, transparent)' }} />
              }
            </div>
          </div>

          {/* Expanded results */}
          {expanded === entry.id && (
            <div
              className="px-4 py-4"
              style={{
                borderTop: '1px solid var(--border)',
                background: 'color-mix(in srgb, var(--neon-blue) 2%, var(--surface))',
              }}
            >
              <ResultsTable results={entry.results} disableConfetti />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
