import { ValidationResult } from '@/lib';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

interface StatsPanelProps {
  results: ValidationResult[];
}

export default function StatsPanel({ results }: StatsPanelProps) {
  if (results.length === 0) return null;

  const valid      = results.filter(r => r.status === 'valid').length;
  const invalid    = results.filter(r => r.status === 'invalid').length;
  const errors     = results.filter(r => r.status === 'error').length;
  const untestable = results.filter(r => r.status === 'untestable').length;

  const latencies  = results.filter(r => r.latencyMs).map(r => r.latencyMs!);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0;

  const providerCounts = results.reduce((acc, r) => {
    acc[r.provider] = (acc[r.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProviders = Object.entries(providerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Valid */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-xs text-green-700 dark:text-green-300 font-mono uppercase">Valid</span>
        </div>
        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{valid}</div>
        <div className="text-xs text-green-600/70 dark:text-green-300/60 mt-1">
          {((valid / results.length) * 100).toFixed(0)}%
        </div>
      </div>

      {/* Invalid */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-xs text-red-700 dark:text-red-300 font-mono uppercase">Invalid</span>
        </div>
        <div className="text-2xl font-bold text-red-700 dark:text-red-400">{invalid}</div>
        <div className="text-xs text-red-600/70 dark:text-red-300/60 mt-1">
          {((invalid / results.length) * 100).toFixed(0)}%
        </div>
      </div>

      {/* Errors */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-mono uppercase">Errors</span>
        </div>
        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{errors + untestable}</div>
        <div className="text-xs text-amber-600/70 dark:text-amber-300/60 mt-1">
          {(((errors + untestable) / results.length) * 100).toFixed(0)}%
        </div>
      </div>

      {/* Avg Latency */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="text-xs text-sky-700 dark:text-sky-300 font-mono uppercase">Avg Latency</span>
        </div>
        <div className="text-2xl font-bold text-sky-700 dark:text-sky-400">{avgLatency}ms</div>
        {topProviders.length > 0 && (
          <div className="text-xs text-sky-600/70 dark:text-sky-300/60 mt-1">
            {topProviders[0][0]}: {topProviders[0][1]}
          </div>
        )}
      </div>
    </div>
  );
}
