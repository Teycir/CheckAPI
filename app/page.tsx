'use client';

import { useState, useEffect, useRef } from 'react';
import KeysTextarea from '@/components/KeysTextarea';
import CheckButton from '@/components/CheckButton';
import ResultsTable from '@/components/ResultsTable';
import HistoryPanel from '@/components/HistoryPanel';
import { AnimatedTagline } from '@/components/AnimatedTagline';
import { BackgroundBeams } from '@/components/ui/background-beams';
import DecryptedText from '@/components/DecryptedText';
import { checkKeys, ValidationResult } from '@/lib';
import { useHistory } from '@/lib/ui/useHistory';
import { AlertCircle, Clock, Zap } from 'lucide-react';

type Tab = 'checker' | 'history';

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [duplicates, setDuplicates] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('checker');
  const [titleGlitch, setTitleGlitch] = useState(false);
  const glitchFired = useRef(false);

  const { history, push, remove, clear } = useHistory();

  /* one-shot glitch on mount */
  useEffect(() => {
    if (glitchFired.current) return;
    glitchFired.current = true;
    const t = setTimeout(() => {
      setTitleGlitch(true);
      setTimeout(() => setTitleGlitch(false), 650);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const handleCheck = async () => {
    const keys = input.split('\n').map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) return;

    const uniqueKeys = [...new Set(keys)];
    setDuplicates(keys.length - uniqueKeys.length);
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      const checked = await checkKeys(uniqueKeys);
      setResults(checked);
      push(checked);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Validation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (restored: ValidationResult[]) => {
    setResults(restored);
    setActiveTab('checker');
  };

  return (
    <div className="relative">
      <BackgroundBeams className="fixed top-0 left-0 w-full h-full z-0" />

      <article className="max-w-6xl mx-auto px-4 py-6 sm:py-8 relative z-10">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold glow-text pulse-glow mb-3 sm:mb-4 ${titleGlitch ? 'glitch-once' : ''}`}>
            <DecryptedText
              text="CheckAPIs"
              animateOn="view"
              speed={75}
              maxIterations={20}
              className="text-neon-blue"
              encryptedClassName="text-neon-blue/30"
            />
          </h1>
          <p className="text-lg sm:text-xl text-gray-400">
            <AnimatedTagline text="Validate your LLM API keys instantly" />
          </p>
          <p className="sr-only">
            Privacy-first API key validation for OpenAI, Anthropic, Google Gemini, Groq, Perplexity, HuggingFace, and 12+ LLM providers. 
            All validation happens client-side in your browser. Get detailed results with models, latency, and rate limits.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl mb-6 w-fit mx-auto">
          <button
            onClick={() => setActiveTab('checker')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors font-mono ${
              activeTab === 'checker'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Checker
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors font-mono ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            History
            {history.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-neon-blue/20 text-neon-blue font-mono leading-none">
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Checker tab */}
        {activeTab === 'checker' && (
          <div className="space-y-4 sm:space-y-6">
            <KeysTextarea value={input} onChange={setInput} disabled={loading} />

            <div className="flex flex-col items-center gap-2">
              <CheckButton
                onClick={handleCheck}
                disabled={!input.trim() || loading}
                loading={loading}
              />
              {duplicates > 0 && (
                <p className="text-xs text-yellow-400 font-mono">
                  {duplicates} duplicate {duplicates === 1 ? 'key' : 'keys'} removed
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-300">Validation Error</h3>
                  <p className="text-sm text-red-400 mt-1 font-mono">{error}</p>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-8">
                <ResultsTable results={results} />
              </div>
            )}
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <HistoryPanel
            history={history}
            onRemove={remove}
            onClear={clear}
            onRestore={handleRestore}
          />
        )}
      </article>
    </div>
  );
}
