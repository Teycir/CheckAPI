'use client';

import { useState } from 'react';
import KeysTextarea from '@/components/KeysTextarea';
import CheckButton from '@/components/CheckButton';
import ResultsTable from '@/components/ResultsTable';
import { TextScramble } from '@/components/TextScramble';
import { AnimatedTagline } from '@/components/AnimatedTagline';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { checkKeys, ValidationResult } from '@/lib';
import { AlertCircle, Code } from 'lucide-react';

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [duplicates, setDuplicates] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    const keys = input.split('\n').map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) return;

    const uniqueKeys = [...new Set(keys)];
    const duplicateCount = keys.length - uniqueKeys.length;
    setDuplicates(duplicateCount);

    setLoading(true);
    setResults([]);
    setError(null);
    
    try {
      const checked = await checkKeys(uniqueKeys);
      setResults(checked);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Validation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0" />
      
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neon-blue glow-text mb-2">
              <TextScramble duration={1.2}>CheckAPI</TextScramble>
            </h1>
            <AnimatedTagline text="Validate your LLM API keys instantly" />
          </div>
          <a
            href="https://github.com/teycir/checkapi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-dark-bg/80 backdrop-blur-sm border-2 border-neon-blue/30 rounded-xl hover:border-neon-blue transition-all"
          >
            <Code className="w-5 h-5 text-neon-blue" />
            <span className="text-sm text-neon-blue/70 font-mono">Source</span>
          </a>
        </header>

        <div className="space-y-6">
          <KeysTextarea
            value={input}
            onChange={setInput}
            disabled={loading}
          />

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
      </div>
    </div>
  );
}
