'use client';

import { Loader2 } from 'lucide-react';

interface Props {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function CheckButton({ onClick, disabled, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'relative overflow-hidden',
        'px-8 py-3 border-2 border-neon-blue bg-neon-blue/10 text-neon-blue',
        'font-bold font-mono uppercase tracking-wider',
        'transition-all duration-300 rounded-xl',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2',
        'hover:bg-neon-blue/20 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--neon-blue)_40%,transparent)]',
        'active:scale-95',
        loading ? 'scanline-sweep' : '',
      ].join(' ')}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin relative z-10" />}
      <span className="relative z-10">
        {loading ? 'Checking...' : 'Check Keys →'}
      </span>
    </button>
  );
}
