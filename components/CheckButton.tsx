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
      className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'Checking...' : 'Check Keys →'}
    </button>
  );
}
