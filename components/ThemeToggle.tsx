'use client';

import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

function getInitialDark(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('theme');
  return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  // Read from localStorage only once on mount — no setState inside effect body
  const isDark = dark ?? false;
  const mounted = dark !== null;

  useEffect(() => {
    const initial = getInitialDark();
    document.documentElement.classList.toggle('dark', initial);
    // Use a microtask to defer the setState out of the synchronous effect body
    Promise.resolve().then(() => setDark(initial));
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    setDark(newDark);
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
