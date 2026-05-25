'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function KeysTextarea({ value, onChange, disabled }: Props) {
  const lineCount = value.split('\n').filter(Boolean).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-neon-blue/70 font-mono">
          LLM API keys — one per line
        </label>
        {lineCount > 0 && (
          <span className="text-xs bg-neon-blue/10 text-neon-blue px-2 py-1 rounded border border-neon-blue/30">
            {lineCount} {lineCount === 1 ? 'key' : 'keys'}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="sk-ant-api03-...&#10;sk-proj-...&#10;AIzaSy..."
        className="w-full h-32 p-4 bg-black/50 border-2 border-neon-blue/30 text-neon-blue font-mono text-sm resize-none focus:border-neon-blue focus:outline-none focus:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-colors rounded-xl disabled:opacity-50"
      />
      <p className="text-xs text-neon-blue/50 font-mono">
        🔒 All checks run in your browser. Keys are never sent to any server.
      </p>
    </div>
  );
}
