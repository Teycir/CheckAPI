'use client';

import { useState } from 'react';
import { ValidationResult } from '@/lib';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface Props {
  results: ValidationResult[];
}

export default function ResultsTable({ results }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  const copyResults = async () => {
    const text = results.map(r => 
      `${r.truncatedKey} | ${r.provider} | ${r.status} | ${r.metadata?.modelCount || '—'} models | ${r.latencyMs || '—'}ms`
    ).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validCount = results.filter(r => r.status === 'valid').length;
  const avgLatency = results.filter(r => r.latencyMs).reduce((sum, r) => sum + (r.latencyMs || 0), 0) / results.filter(r => r.latencyMs).length;
  const vendors = new Set(results.map(r => r.provider)).size;

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No results yet. Paste your API keys above and click "Check Keys".
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Results</h2>
        <button
          onClick={copyResults}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Copy results"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Key</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Provider</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Models</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Latency</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300"></th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {results.map((result, i) => (
              <>
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => toggleExpand(i)}>
                  <td className="px-4 py-3 font-mono text-xs">{result.truncatedKey}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      result.confidence === 'definite' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      result.confidence === 'likely' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {result.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {result.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {result.status === 'invalid' && <XCircle className="w-5 h-5 text-red-600" />}
                    {(result.status === 'error' || result.status === 'untestable') && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                  </td>
                  <td className="px-4 py-3">{result.metadata?.modelCount || '—'}</td>
                  <td className="px-4 py-3">{result.latencyMs ? `${result.latencyMs}ms` : '—'}</td>
                  <td className="px-4 py-3">
                    {(result.metadata || result.errorMessage) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(i); }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-neon-blue hover:text-neon-blue/80 border border-neon-blue/30 rounded hover:border-neon-blue transition-colors"
                        aria-label={expanded.has(i) ? 'Hide details' : 'Show details'}
                      >
                        {expanded.has(i) ? (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-3 h-3" />
                            Details
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded.has(i) && (
                  <tr key={`${i}-detail`}>
                    <td colSpan={6} className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
                      <div className="space-y-2 text-xs">
                        {result.statusCode && <div><strong>Status Code:</strong> {result.statusCode}</div>}
                        {result.metadata?.organization && <div><strong>Organization:</strong> {result.metadata.organization}</div>}
                        {result.metadata?.username && <div><strong>Username:</strong> {result.metadata.username}</div>}
                        {result.metadata?.models && result.metadata.models.length > 0 && (
                          <div>
                            <strong>Models ({result.metadata.models.length}):</strong>
                            <div className="mt-1 max-h-32 overflow-y-auto font-mono text-xs">
                              {result.metadata.models.map((m: string, j: number) => <div key={j}>{m}</div>)}
                            </div>
                          </div>
                        )}
                        {result.metadata?.rateLimit && Object.keys(result.metadata.rateLimit).length > 0 && (
                          <div>
                            <strong>Rate Limits:</strong>
                            {Object.entries(result.metadata.rateLimit).map(([k, v]) => (
                              <div key={k} className="ml-2">{k}: {String(v)}</div>
                            ))}
                          </div>
                        )}
                        {result.errorMessage && (
                          <div className="text-red-600 dark:text-red-400">
                            <strong>Error:</strong> {result.errorMessage}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Summary: {validCount}/{results.length} valid · {vendors} {vendors === 1 ? 'provider' : 'providers'} · avg {Math.round(avgLatency) || 0}ms
      </div>
    </div>
  );
}
