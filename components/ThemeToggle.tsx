'use client';

import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

function getInitialLight(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('theme');
  // Default is dark; light only if explicitly saved or system prefers light
  return saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches);
}

export default function ThemeToggle() {
  const [light, setLight] = useState<boolean | null>(null);

  const isLight = light ?? false;
  const mounted = light !== null;

  useEffect(() => {
    const initial = getInitialLight();
    document.documentElement.classList.toggle('light', initial);
    Promise.resolve().then(() => setLight(initial));
  }, []);

  const toggle = () => {
    const newLight = !isLight;
    document.documentElement.classList.toggle('light', newLight);
    localStorage.setItem('theme', newLight ? 'light' : 'dark');
    setLight(newLight);
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg transition-colors"
      style={{ color: 'var(--dark-text)' }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-alt)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      aria-label="Toggle theme"
    >
      {isLight
        ? <Moon className="w-5 h-5" />
        : <Sun  className="w-5 h-5" />}
    </button>
  );
}
