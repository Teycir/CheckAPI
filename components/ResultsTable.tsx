'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ValidationResult } from '@/lib';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  results: ValidationResult[];
  disableConfetti?: boolean;
}

/* ─── Animated counter hook ─── */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

/* ─── Provider badge config ─── */
const PROVIDER_CONFIG: Record<string, { color: string; icon: string }> = {
  openai:       { color: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',   icon: '⬡' },
  anthropic:    { color: 'bg-orange-900/50 text-orange-300 border-orange-700/50',      icon: '◈' },
  google:       { color: 'bg-blue-900/50 text-blue-300 border-blue-700/50',            icon: '✦' },
  groq:         { color: 'bg-purple-900/50 text-purple-300 border-purple-700/50',      icon: '⚡' },
  mistral:      { color: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',      icon: '◎' },
  cohere:       { color: 'bg-pink-900/50 text-pink-300 border-pink-700/50',            icon: '❋' },
  together:     { color: 'bg-teal-900/50 text-teal-300 border-teal-700/50',            icon: '◉' },
  cerebras:     { color: 'bg-cyan-900/50 text-cyan-300 border-cyan-700/50',            icon: '◆' },
  openrouter:   { color: 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50',      icon: '◈' },
  perplexity:   { color: 'bg-violet-900/50 text-violet-300 border-violet-700/50',      icon: '◉' },
  huggingface:  { color: 'bg-amber-900/50 text-amber-300 border-amber-700/50',         icon: '🤗' },
  replicate:    { color: 'bg-rose-900/50 text-rose-300 border-rose-700/50',            icon: '◎' },
  azure:        { color: 'bg-sky-900/50 text-sky-300 border-sky-700/50',               icon: '☁' },
  aws:          { color: 'bg-orange-900/50 text-orange-300 border-orange-700/50',      icon: '☁' },
  unknown:      { color: 'bg-gray-800/50 text-gray-400 border-gray-700/50',            icon: '?' },
  default:      { color: 'bg-gray-800/50 text-gray-300 border-gray-700/50',            icon: '◇' },
};

function getProviderStyle(provider: string) {
  const key = provider.toLowerCase();
  for (const [name, cfg] of Object.entries(PROVIDER_CONFIG)) {
    if (key.includes(name)) return cfg;
  }
  return PROVIDER_CONFIG.default;
}

/* ─── Confetti burst ─── */
const CONFETTI_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 30 + Math.random() * 40,
  delay: Math.random() * 0.4,
  duration: 0.8 + Math.random() * 0.6,
  size: 4 + Math.random() * 6,
  color: ['#00d4ff', '#00ffaa', '#ff6ed0', '#ffe066', '#7b61ff'][i % 5],
}));

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ zIndex: 50 }}>
      {CONFETTI_PARTICLES.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: '0%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Status icon with pop-in ─── */
function StatusIcon({ status, uid }: { status: string; uid: string }) {
  return (
    <span key={uid} className="inline-block icon-pop">
      {status === 'valid'   && <CheckCircle2  className="w-5 h-5 text-green-400" />}
      {status === 'invalid' && <XCircle       className="w-5 h-5 text-red-400" />}
      {(status === 'error' || status === 'untestable') && <AlertCircle className="w-5 h-5 text-yellow-400" />}
    </span>
  );
}

export default function ResultsTable({ results, disableConfetti = false }: Props) {
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());
  const [copied, setCopied]       = useState(false);
  const [exported, setExported]   = useState(false);
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const prevResultsLen = useRef(0);

  const validCount   = results.filter(r => r.status === 'valid').length;
  const avgLatency   = results.filter(r => r.latencyMs).reduce((s, r) => s + (r.latencyMs || 0), 0)
                       / (results.filter(r => r.latencyMs).length || 1);
  const vendors      = new Set(results.map(r => r.provider)).size;

  const animValidCount = useCountUp(validCount, 900);
  const animTotal      = useCountUp(results.length, 700);
  const animLatency    = useCountUp(Math.round(avgLatency) || 0, 1000);

  /* fire confetti when a fresh perfect batch arrives */
  useEffect(() => {
    if (
      !disableConfetti &&
      results.length > 0 &&
      results.length !== prevResultsLen.current &&
      validCount === results.length
    ) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    }
    prevResultsLen.current = results.length;
  }, [results, validCount, disableConfetti]);

  const toggleExpand = (index: number) => {
    const s = new Set(expanded);
    if (s.has(index)) {
      s.delete(index);
    } else {
      s.add(index);
    }
    setExpanded(s);
  };

  const copyResults = async () => {
    const text = results.map(r =>
      `${r.key} | ${r.provider} | ${r.status} | ${r.metadata?.modelCount || '—'} models | ${r.latencyMs || '—'}ms`
    ).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportResults = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const folderName = `checkapis_${timestamp}`;
    const jsonData = {
      exported: new Date().toISOString(),
      summary: {
        total: results.length,
        valid: validCount,
        invalid: results.filter(r => r.status === 'invalid').length,
        providers: Array.from(new Set(results.map(r => r.provider))),
      },
      results: results.map(r => ({
        key: r.key, provider: r.provider, status: r.status, valid: r.status === 'valid',
        models: r.metadata?.models || [], modelCount: r.metadata?.modelCount,
        latency: r.latencyMs, error: r.errorMessage, metadata: r.metadata,
      })),
    };
    const vCount = validCount;
    const aLatency = Math.round(avgLatency) || 0;
    let markdown = `# CheckAPIs Results\n\n**Exported:** ${new Date().toISOString()}\n\n## Summary\n\n`;
    markdown += `- **Total Keys:** ${results.length}\n- **Valid:** ${vCount} (${Math.round(vCount/results.length*100)}%)\n`;
    markdown += `- **Invalid:** ${results.length - vCount}\n- **Providers:** ${Array.from(new Set(results.map(r => r.provider))).join(', ')}\n`;
    markdown += `- **Average Latency:** ${aLatency}ms\n\n## Results\n\n`;
    results.forEach((r, i) => {
      markdown += `### ${i + 1}. ${r.key}\n\n- **Provider:** ${r.provider}\n- **Status:** ${r.status === 'valid' ? '✓ Valid' : '✗ Invalid'}\n`;
      if (r.metadata?.modelCount) markdown += `- **Models:** ${r.metadata.modelCount}\n`;
      if (r.latencyMs) markdown += `- **Latency:** ${r.latencyMs}ms\n`;
      if (r.errorMessage) markdown += `- **Error:** ${r.errorMessage}\n`;
      if (r.metadata?.models && r.metadata.models.length > 0) {
        markdown += `\n**Available Models:**\n\n`;
        r.metadata.models.slice(0, 10).forEach((m: string) => { markdown += `- ${m}\n`; });
        if (r.metadata.models.length > 10) markdown += `- ... and ${r.metadata.models.length - 10} more\n`;
      }
      markdown += `\n`;
    });
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const mdBlob   = new Blob([markdown], { type: 'text/markdown' });
    const jsonUrl  = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl; jsonLink.download = `${folderName}_results.json`; jsonLink.click();
    URL.revokeObjectURL(jsonUrl);
    setTimeout(() => {
      const mdUrl  = URL.createObjectURL(mdBlob);
      const mdLink = document.createElement('a');
      mdLink.href = mdUrl; mdLink.download = `${folderName}_results.md`; mdLink.click();
      URL.revokeObjectURL(mdUrl);
    }, 100);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No results yet. Paste your API keys above and click &quot;Check Keys&quot;.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <ConfettiBurst active={showConfetti} />

      {/* Fixed-position key tooltip — renders above overflow clipping */}
      {hoveredKey !== null && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 36 }}
        >
          <div className="px-3 py-1.5 bg-gray-950 text-neon-blue text-xs font-mono rounded-lg shadow-xl border border-neon-blue/30 whitespace-nowrap">
            {results[hoveredKey]?.key}
          </div>
        </div>
      )}
      {/* Header row */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Results</h2>
        <div className="flex gap-2">
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg transition-colors"
          >
            {exported
              ? <Check className="w-4 h-4" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
            {exported ? 'Exported!' : 'Export'}
          </button>
          <button
            onClick={copyResults}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Table */}
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
            {results.map((result, i) => {
              const pStyle = getProviderStyle(result.provider);
              return (
                <React.Fragment key={i}>
                  <motion.tr
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => toggleExpand(i)}
                  >
                    <td
                      className="px-4 py-3 font-mono text-xs cursor-default select-all"
                      onMouseEnter={() => setHoveredKey(i)}
                      onMouseLeave={() => setHoveredKey(null)}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                    >
                      {result.truncatedKey}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono ${pStyle.color}`}>
                        <span>{pStyle.icon}</span>
                        {result.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusIcon status={result.status} uid={`${i}-${result.status}`} />
                    </td>
                    <td className="px-4 py-3">{result.metadata?.modelCount || '—'}</td>
                    <td className="px-4 py-3">{result.latencyMs ? `${result.latencyMs}ms` : '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(i); }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-neon-blue hover:text-neon-blue/80 border border-neon-blue/30 rounded hover:border-neon-blue transition-colors"
                      >
                        {expanded.has(i)
                          ? <><ChevronDown className="w-3 h-3" />Hide</>
                          : <><ChevronRight className="w-3 h-3" />Details</>}
                      </button>
                    </td>
                  </motion.tr>
                  {expanded.has(i) && (
                    <tr key={`${i}-detail`} className="bg-gray-50 dark:bg-gray-800">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="space-y-2 text-xs">
                          <div><strong>Full Key:</strong> <span className="font-mono break-all">{result.key}</span></div>
                          {result.status === 'untestable' && (
                            <div className="text-yellow-600 dark:text-yellow-400">
                              <strong>Reason:</strong> Provider &quot;{result.provider}&quot; could not be identified — key format is not recognized. Validation was skipped.
                            </div>
                          )}
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
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Animated summary bar */}
      <div className="relative text-sm text-gray-600 dark:text-gray-400 text-center font-mono">
        <motion.span
          key={results.length}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Summary:{' '}
          <span className="text-neon-blue font-bold">{animValidCount}</span>
          <span className="text-gray-500">/{animTotal}</span> valid
          {' · '}
          <span className="text-neon-blue">{vendors}</span> {vendors === 1 ? 'provider' : 'providers'}
          {' · '}avg{' '}
          <span className="text-neon-blue">{animLatency}</span>ms
          {validCount === results.length && results.length > 0 && (
            <span className="ml-2 text-green-400 animate-pulse">✓ all valid</span>
          )}
        </motion.span>
      </div>
    </div>
  );
}
