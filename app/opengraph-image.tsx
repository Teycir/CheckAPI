
import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'CheckAPI - LLM API Key Validator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '96px',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
            }}
          >
            CheckAPI
          </h1>
          <p
            style={{
              fontSize: '36px',
              color: '#94a3b8',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Validate LLM API Keys Instantly
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '32px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '900px',
            }}
          >
            {['OpenAI', 'Anthropic', 'Gemini', 'Groq', 'Perplexity', 'HuggingFace'].map((provider) => (
              <div
                key={provider}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#60a5fa',
                  fontSize: '20px',
                }}
              >
                {provider}
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: '24px',
              color: '#64748b',
              marginTop: '48px',
            }}
          >
            🔒 Privacy-First • Client-Side • Free API
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
