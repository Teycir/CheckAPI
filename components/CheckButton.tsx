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
      className="px-8 py-3 border-2 border-neon-blue bg-neon-blue/10 text-neon-blue font-bold font-mono uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl hover:bg-neon-blue/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] active:scale-95"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'Checking...' : 'Check Keys →'}
    </button>
  );
}
