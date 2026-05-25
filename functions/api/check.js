// CheckAPIs API - Cloudflare Pages Function
// Automatically deployed with the Pages project

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const RATE_LIMIT = 20;
const WINDOW_MS = 60000;
const requestLog = new Map();

async function isRateLimited(ip, kv) {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  
  if (!requestLog.has(ip)) requestLog.set(ip, []);
  const timestamps = requestLog.get(ip).filter(t => t > cutoff);
  requestLog.set(ip, timestamps);
  
  if (timestamps.length >= RATE_LIMIT) {
    const oldestInWindow = Math.min(...timestamps);
    const retryAfter = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000);
    return { limited: true, retryAfter };
  }
  
  if (kv) {
    try {
      const bucket = Math.floor(now / WINDOW_MS);
      const key = `rl:${ip}:${bucket}`;
      const CAS_MAX_RETRIES = 3;
      
      for (let i = 0; i < CAS_MAX_RETRIES; i++) {
        const current = parseInt(await kv.get(key) || '0', 10);
        await kv.put(key, String(current + 1), { expirationTtl: 120 });
        const verified = parseInt(await kv.get(key) || '0', 10);
        
        if (verified > RATE_LIMIT) {
          const retryAfter = Math.ceil((bucket + 1) * WINDOW_MS / 1000 - now / 1000);
          return { limited: true, retryAfter };
        }
      }
    } catch (e) {
      return { limited: false };
    }
  }
  
  timestamps.push(now);
  return { limited: false };
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      message: 'CheckAPIs API',
      usage: 'POST /api/check with JSON body: { "keys": ["key1", "key2"] }',
      example: 'curl -X POST https://checkapis.pages.dev/api/check -H "Content-Type: application/json" -d \'{"keys":["sk-..."]}\'',
      docs: 'https://checkapis.pages.dev/how-to-use',
      limits: {
        maxKeys: 50,
        timeout: 30000
      }
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export async function onRequestPost(context) {
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitResult = await isRateLimited(ip, context.env.RATE_LIMIT_KV);
  
  if (rateLimitResult.limited) {
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        retryAfter: rateLimitResult.retryAfter 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitResult.retryAfter)
        } 
      }
    );
  }
  
  try {
    const body = await context.request.json();
    const { keys } = body;

    if (!keys || !Array.isArray(keys)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Expected { "keys": ["key1", "key2", ...] }' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (keys.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No keys provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (keys.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Maximum 50 keys per request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = await Promise.all(
      keys.map(async (key) => {
        const trimmedKey = typeof key === 'string' ? key.trim() : key;
        try {
          return await validateKey(trimmedKey);
        } catch (error) {
          return {
            key: trimmedKey,
            provider: 'unknown',
            valid: false,
            error: error.message
          };
        }
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        count: results.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function validateKey(key) {
  const provider = detectProvider(key);
  
  if (!provider) {
    return {
      key,
      provider: 'unknown',
      valid: false,
      error: 'Unknown provider'
    };
  }

  try {
    const startTime = Date.now();
    const validation = await checkProvider(provider, key);
    const latency = Date.now() - startTime;

    return {
      key,
      provider: provider.name,
      valid: validation.valid,
      models: validation.models || [],
      latency,
      rateLimit: validation.rateLimit,
      error: validation.error
    };
  } catch (error) {
    return {
      key,
      provider: provider.name,
      valid: false,
      error: error.message
    };
  }
}

function detectProvider(key) {
  if (key.startsWith('csk-')) return { name: 'cerebras', endpoint: 'https://api.cerebras.ai/v1/models', method: 'GET' };
  if (key.startsWith('sk-or-')) return { name: 'openrouter', endpoint: 'https://openrouter.ai/api/v1/models', method: 'GET' };
  if (key.startsWith('sk-ant-')) return { name: 'anthropic', endpoint: 'https://api.anthropic.com/v1/messages', method: 'POST' };
  if (key.startsWith('sk-proj-') || key.startsWith('sk-')) return { name: 'openai', endpoint: 'https://api.openai.com/v1/models', method: 'GET' };
  if (key.startsWith('AIza')) return { name: 'google', endpoint: 'https://generativelanguage.googleapis.com/v1/models', method: 'GET' };
  if (key.startsWith('gsk_')) return { name: 'groq', endpoint: 'https://api.groq.com/openai/v1/models', method: 'GET' };
  if (key.startsWith('pplx-')) return { name: 'perplexity', endpoint: 'https://api.perplexity.ai/models', method: 'GET' };
  if (key.startsWith('hf_')) return { name: 'huggingface', endpoint: 'https://huggingface.co/api/whoami', method: 'GET' };
  return null;
}

async function checkProvider(provider, key) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (provider.name === 'anthropic') {
    headers['x-api-key'] = key;
    headers['anthropic-version'] = '2023-06-01';
  } else if (provider.name === 'google') {
    provider.endpoint = `${provider.endpoint}?key=${key}`;
  } else {
    headers['Authorization'] = `Bearer ${key}`;
  }

  const options = {
    method: provider.method,
    headers,
    signal: AbortSignal.timeout(10000)
  };

  if (provider.method === 'POST' && provider.name === 'anthropic') {
    options.body = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'test' }]
    });
  }

  const response = await fetch(provider.endpoint, options);

  if (response.ok) {
    const data = await response.json();
    return {
      valid: true,
      models: data.data?.map(m => m.id) || data.models || [],
      rateLimit: response.headers.get('x-ratelimit-remaining')
    };
  }

  return {
    valid: false,
    error: `HTTP ${response.status}: ${response.statusText}`
  };
}
