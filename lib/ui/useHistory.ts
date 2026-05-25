'use client';

import { useState, useEffect, useCallback } from 'react';
import { ValidationResult } from '../core/types';

export interface HistoryEntry {
  id: string;           // crypto.randomUUID()
  checkedAt: string;    // ISO timestamp
  results: ValidationResult[];
  // Derived counts stored so the panel can render without re-scanning
  total: number;
  valid: number;
}

const STORAGE_KEY = 'checkapis_history';
const MAX_ENTRIES = 50;

function load(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota exceeded or private browsing — fail silently
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    return load();
  });

  // Sync to localStorage when history changes
  useEffect(() => {
    save(history);
  }, [history]);

  const push = useCallback((results: ValidationResult[]) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      checkedAt: new Date().toISOString(),
      results,
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
    };

    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      return next;
    });

    return entry.id;
  }, []);

  const remove = useCallback((id: string) => {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return { history, push, remove, clear };
}
