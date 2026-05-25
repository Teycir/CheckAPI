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

/* ─── Provider badge — light & dark adaptive ─── */
const PROVIDER_CONFIG: Record<string, { light: string; dark: string; icon: string }> = {
  openai:      { light: 'bg-emerald-100 text-emerald-800 border-emerald-300',   dark: 'dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700/50',   icon: '⬡' },
  anthropic:   { light: 'bg-orange-100  text-orange-800  border-orange-300',    dark: 'dark:bg-orange-900/40  dark:text-orange-300  dark:border-orange-700/50',    icon: '◈' },
  google:      { light: 'bg-blue-100    text-blue-800    border-blue-300',      dark: 'dark:bg-blue-900/40    dark:text-blue-300    dark:border-blue-700/50',      icon: '✦' },
  groq:        { light: 'bg-purple-100  text-purple-800  border-purple-300',    dark: 'dark:bg-purple-900/40  dark:text-purple-300  dark:border-purple-700/50',    icon: '⚡' },
  mistral:     { light: 'bg-yellow-100  text-yellow-800  border-yellow-300',    dark: 'dark:bg-yellow-900/40  dark:text-yellow-300  dark:border-yellow-700/50',    icon: '◎' },
  cohere:      { light: 'bg-pink-100    text-pink-800    border-pink-300',      dark: 'dark:bg-pink-900/40    dark:text-pink-300    dark:border-pink-700/50',      icon: '❋' },
  together:    { light: 'bg-teal-100    text-teal-800    border-teal-300',      dark: 'dark:bg-teal-900/40    dark:text-teal-300    dark:border-teal-700/50',      icon: '◉' },
  cerebras:    { light: 'bg-cyan-100    text-cyan-800    border-cyan-300',      dark: 'dark:bg-cyan-900/40    dark:text-cyan-300    dark:border-cyan-700/50',      icon: '◆' },
  openrouter:  { light: 'bg-indigo-100  text-indigo-800  border-indigo-300',    dark: 'dark:bg-indigo-900/40  dark:text-indigo-300  dark:border-indigo-700/50',    icon: '◈' },
  perplexity:  { light: 'bg-violet-100  text-violet-800  border-violet-300',    dark: 'dark:bg-violet-900/40  dark:text-violet-300  dark:border-violet-700/50',    icon: '◉' },
  huggingface: { light: 'bg-amber-100   text-amber-800   border-amber-300',     dark: 'dark:bg-amber-900/40   dark:text-amber-300   dark:border-amber-700/50',     icon: '🤗' },
  replicate:   { light: 'bg-rose-100    text-rose-800    border-rose-300',      dark: 'dark:bg-rose-900/40    dark:text-rose-300    dark:border-rose-700/50',      icon: '◎' },
  azure:       { light: 'bg-sky-100     text-sky-800     border-sky-300',       dark: 'dark:bg-sky-900/40     dark:text-sky-300     dark:border-sky-700/50',       icon: '☁' },
  aws:         { light: 'bg-orange-100  text-orange-800  border-orange-300',    dark: 'dark:bg-orange-900/40  dark:text-orange-300  dark:border-orange-700/50',    icon: '☁' },
  unknown:     { light: 'bg-slate-100   text-slate-600   border-slate-300',     dark: 'dark:bg-slate-800/50   dark:text-slate-400   dark:border-slate-700/50',     icon: '?' },
  default:     { light: 'bg-slate-100   text-slate-700   border-slate-300',     dark: 'dark:bg-slate-800/50   dark:text-slate-300   dark:border-slate-700/50',     icon: '◇' },
};

function getProviderStyle(provider: string) {
  const key = provider.toLowerCase();
  for (const [name, cfg] of Object.entries(PROVIDER_CONFIG)) {
    if (key.includes(name)) return `${cfg.light} ${cfg.dark}`;
  }
  const d = PROVIDER_CONFIG.default;
  return `${d.light} ${d.dark}`;
}

function getProviderIcon(provider: string) {
  const key = provider.toLowerCase();
  for (const [name, cfg] of Object.entries(PROVIDER_CONFIG)) {
    if (key.includes(name)) return cfg.icon;
  }
  return PROVIDER_CONFIG.default.icon;
}

/* ─── Confetti burst ─── */
const CONFETTI_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 30 + Math.random() * 40,
  delay: Math.random() * 0.4,
  duration: 0.8 + Math.random() * 0.6,
  size: 4 + Math.random() * 6,
  color: ['var(--neon-blue)', '#00ffaa', '#ff6ed0', '#ffe066', '#7b61ff'][i % 5],
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
      {status === 'valid'   && <CheckCircle2  className="w-5 h-5 text-green-500 dark:text-green-400" />}
      {status === 'invalid' && <XCircle       className="w-5 h-5 text-red-500   dark:text-red-400" />}
      {(status === 'error' || status === 'untestable') && <AlertCircle className="w-5 h-5 text-amber-500 dark:text-yellow-400" />}
    </span>
  );
}

export default function ResultsTable({ results, disableConfetti = false }: Props) {
  const [expanded, setExpanded]     = useState<Set<number>>(new Set());
  const [copied, setCopied]         = useState(false);
  const [exported, setExported]     = useState(false);
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const prevResultsLen = useRef(0);

  const validCount = results.filter(r => r.status === 'valid').length;
  const avgLatency = results.filter(r => r.latencyMs).reduce((s, r) => s + (r.latencyMs || 0), 0)
                     / (results.filter(r => r.latencyMs).length || 1);
  const vendors    = new Set(results.map(r => r.provider)).size;

  const animValidCount = useCountUp(validCount, 900);
  const animTotal      = useCountUp(results.length, 700);
  const animLatency    = useCountUp(Math.round(avgLatency) || 0, 1000);

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
    const aLatency = Math.round(avgLatency) || 0;
    let markdown = `# CheckAPIs Results\n\n**Exported:** ${new Date().toISOString()}\n\n## Summary\n\n`;
    markdown += `- **Total Keys:** ${results.length}\n- **Valid:** ${validCount} (${Math.round(validCount / results.length * 100)}%)\n`;
    markdown += `- **Invalid:** ${results.length - validCount}\n- **Providers:** ${Array.from(new Set(results.map(r => r.provider))).join(', ')}\n`;
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
      <div className="text-center py-12 text-[var(--dark-text)]/50 font-mono text-sm">
        No results yet. Paste your API keys above and click &quot;Check Keys&quot;.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <ConfettiBurst active={showConfetti} />

      {/* Fixed-position full-key tooltip */}
      {hoveredKey !== null && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 40 }}
        >
          <div
            className="px-3 py-1.5 text-xs font-mono rounded-lg border whitespace-nowrap shadow-lg"
            style={{
              background: 'var(--surface)',
              color: 'var(--neon-blue)',
              borderColor: 'color-mix(in srgb, var(--neon-blue) 35%, transparent)',
              boxShadow: '0 4px 20px color-mix(in srgb, var(--neon-blue) 15%, transparent)',
            }}
          >
            {results[hoveredKey]?.key}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2
          className="text-lg font-semibold font-mono"
          style={{ color: 'var(--dark-text)' }}
        >
          Results
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/30 hover:border-neon-blue/60 rounded-lg transition-all duration-200"
          >
            {exported
              ? <Check className="w-4 h-4" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
            {exported ? 'Exported!' : 'Export'}
          </button>
          <button
            onClick={copyResults}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 border"
            style={{
              background: 'var(--surface-alt)',
              borderColor: 'var(--border)',
              color: 'var(--dark-text)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--neon-blue) 8%, var(--surface-alt))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl"
        style={{ border: '1px solid var(--border)' }}
      >
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['Key', 'Provider', 'Status', 'Models', 'Latency', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold font-mono uppercase tracking-wider"
                  style={{ color: 'color-mix(in srgb, var(--neon-blue) 70%, var(--dark-text))' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ '--row-divider': 'var(--border)' } as React.CSSProperties}>
            {results.map((result, i) => {
              const badgeClass = getProviderStyle(result.provider);
              const icon = getProviderIcon(result.provider);
              return (
                <React.Fragment key={i}>
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: i * 0.055, ease: 'easeOut' }}
                    className="cursor-pointer transition-colors duration-150"
                    style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
                    onClick={() => toggleExpand(i)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--neon-blue) 4%, var(--surface))')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    {/* Key cell */}
                    <td
                      className="px-4 py-3 font-mono text-xs cursor-default select-all"
                      style={{ color: 'var(--dark-text)' }}
                      onMouseEnter={() => setHoveredKey(i)}
                      onMouseLeave={() => setHoveredKey(null)}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                    >
                      <span
                        className="underline decoration-dotted underline-offset-2"
                        style={{ textDecorationColor: 'color-mix(in srgb, var(--neon-blue) 40%, transparent)' }}
                      >
                        {result.truncatedKey}
                      </span>
                    </td>

                    {/* Provider badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-mono font-medium ${badgeClass}`}>
                        <span>{icon}</span>
                        {result.provider}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusIcon status={result.status} uid={`${i}-${result.status}`} />
                    </td>

                    {/* Models */}
                    <td
                      className="px-4 py-3 font-mono text-xs"
                      style={{ color: result.metadata?.modelCount ? 'var(--neon-blue)' : 'color-mix(in srgb, var(--dark-text) 35%, transparent)' }}
                    >
                      {result.metadata?.modelCount ?? '—'}
                    </td>

                    {/* Latency */}
                    <td
                      className="px-4 py-3 font-mono text-xs"
                      style={{ color: result.latencyMs ? 'var(--dark-text)' : 'color-mix(in srgb, var(--dark-text) 35%, transparent)' }}
                    >
                      {result.latencyMs ? `${result.latencyMs}ms` : '—'}
                    </td>

                    {/* Details button */}
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(i); }}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-neon-blue border border-neon-blue/25 rounded-md hover:border-neon-blue/70 hover:bg-neon-blue/8 transition-all duration-150"
                      >
                        {expanded.has(i)
                          ? <><ChevronDown className="w-3 h-3" />Hide</>
                          : <><ChevronRight className="w-3 h-3" />Details</>}
                      </button>
                    </td>
                  </motion.tr>

                  {/* Expanded detail row */}
                  {expanded.has(i) && (
                    <tr
                      key={`${i}-detail`}
                      style={{
                        background: 'color-mix(in srgb, var(--neon-blue) 3%, var(--surface))',
                        borderTop: '1px solid var(--border)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <td colSpan={6} className="px-5 py-4">
                        <div
                          className="space-y-2 text-xs font-mono"
                          style={{ color: 'var(--dark-text)' }}
                        >
                          <div>
                            <span className="opacity-50">full key → </span>
                            <span className="break-all" style={{ color: 'var(--neon-blue)' }}>{result.key}</span>
                          </div>
                          {result.status === 'untestable' && (
                            <div className="text-amber-600 dark:text-amber-400">
                              Provider &quot;{result.provider}&quot; — key pattern not recognized, validation skipped.
                            </div>
                          )}
                          {result.statusCode && (
                            <div><span className="opacity-50">status code → </span>{result.statusCode}</div>
                          )}
                          {result.metadata?.organization && (
                            <div><span className="opacity-50">org → </span>{result.metadata.organization}</div>
                          )}
                          {result.metadata?.username && (
                            <div><span className="opacity-50">user → </span>{result.metadata.username}</div>
                          )}
                          {result.metadata?.models && result.metadata.models.length > 0 && (
                            <div>
                              <span className="opacity-50">models ({result.metadata.models.length}) → </span>
                              <div className="mt-1.5 max-h-36 overflow-y-auto pl-2 space-y-0.5 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--neon-blue) 25%, transparent)' }}>
                                {result.metadata.models.map((m: string, j: number) => (
                                  <div key={j} className="opacity-80">{m}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {result.metadata?.rateLimit && Object.keys(result.metadata.rateLimit).length > 0 && (
                            <div>
                              <span className="opacity-50">rate limits → </span>
                              <div className="mt-1 pl-2">
                                {Object.entries(result.metadata.rateLimit).map(([k, v]) => (
                                  <div key={k} className="opacity-80">{k}: {String(v)}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {result.errorMessage && (
                            <div className="text-red-600 dark:text-red-400">
                              <span className="opacity-70">error → </span>{result.errorMessage}
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

      {/* Summary bar */}
      <div className="text-center font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--dark-text) 55%, transparent)' }}>
        <motion.span
          key={results.length}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="text-neon-blue font-bold">{animValidCount}</span>
          <span>/{animTotal}</span>
          {' valid · '}
          <span className="text-neon-blue">{vendors}</span>
          {` ${vendors === 1 ? 'provider' : 'providers'} · avg `}
          <span className="text-neon-blue">{animLatency}</span>
          {'ms'}
          {validCount === results.length && results.length > 0 && (
            <span className="ml-2 text-green-500 dark:text-green-400 animate-pulse"> ✓ all valid</span>
          )}
        </motion.span>
      </div>
    </div>
  );
}
