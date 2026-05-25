// CheckAPIs API Worker
// Deploy with: wrangler deploy api-worker.js --name checkapis-api

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Rate limiting (requires RATE_LIMITER binding in wrangler.toml)
    if (env?.RATE_LIMITER) {
      const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET - API info
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          message: 'CheckAPIs API',
          usage: 'POST / with JSON body: { "keys": ["key1", "key2"] }',
          example: 'curl -X POST https://api.checkapis.pages.dev -H "Content-Type: application/json" -d \'{"keys":["sk-..."]}\'',
          docs: 'https://checkapis.pages.dev/how-to-use',
          limits: {
            maxKeys: 50,
            timeout: 30000
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Validate keys
    if (request.method === 'POST') {
      try {
        const body = await request.json();
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

        // Validate keys by calling the main site's validation logic
        const results = await Promise.all(
          keys.map(async (key) => {
            try {
              const result = await validateKey(key);
              return result;
            } catch (error) {
              return {
                key: key.substring(0, 8) + '...',
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

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
};

// Simplified key validation
async function validateKey(key) {
  const provider = detectProvider(key);
  
  if (!provider) {
    return {
      key: key.substring(0, 8) + '...',
      provider: 'unknown',
      valid: false,
      error: 'Unknown provider'
    };
  }

  if (!provider.testable || !provider.endpoint) {
    return {
      key: key.substring(0, 8) + '...',
      provider: provider.name,
      valid: null,
      error: 'Provider detected but cannot be validated (ambiguous key format)',
    };
  }

  try {
    const startTime = Date.now();
    const validation = await checkProvider(provider, key);
    const latency = Date.now() - startTime;

    return {
      key: key.substring(0, 8) + '...',
      provider: provider.name,
      valid: validation.valid,
      models: validation.models || [],
      latency,
      rateLimit: validation.rateLimit,
      error: validation.error
    };
  } catch (error) {
    return {
      key: key.substring(0, 8) + '...',
      provider: provider.name,
      valid: false,
      error: error.message
    };
  }
}

// Allowlist of hosts the worker is permitted to call.
// Any endpoint not matching this set is rejected before fetch is called.
const ALLOWED_HOSTS = new Set([
  'api.cerebras.ai',
  'openrouter.ai',
  'api.anthropic.com',
  'api.openai.com',
  'generativelanguage.googleapis.com',
  'api.groq.com',
  'api.perplexity.ai',
  'huggingface.co',
  'api.replicate.com',
  'api.together.xyz',
  'api.cohere.com',
  'api.mistral.ai',
]);

function assertAllowedEndpoint(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid endpoint URL: ${url}`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`Endpoint must use HTTPS, got: ${parsed.protocol}`);
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`Host not in allowlist: ${parsed.hostname}`);
  }
}

function detectProvider(key) {
  // Ordered from most-specific to least-specific to avoid false positives.
  // Ambiguous patterns (generic hex/alphanum) are marked testable: false.
  const providers = [
    { name: 'cerebras',    pattern: /^csk-[a-z0-9]{48}/,          endpoint: 'https://api.cerebras.ai/v1/models',                        testable: true  },
    { name: 'openrouter',  pattern: /^sk-or-v1-[A-Za-z0-9]{64}/, endpoint: 'https://openrouter.ai/api/v1/models',                       testable: true  },
    { name: 'anthropic',   pattern: /^sk-ant-[A-Za-z0-9\-_]{32,}/,endpoint: 'https://api.anthropic.com/v1/models',                      testable: true  },
    { name: 'openai',      pattern: /^sk-proj-[A-Za-z0-9_-]{32,}|^sk-[A-Za-z0-9]{32,}/, endpoint: 'https://api.openai.com/v1/models',   testable: true  },
    { name: 'google',      pattern: /^AIza[A-Za-z0-9\-_]{35}/,   endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',   testable: true  },
    { name: 'groq',        pattern: /^gsk_[A-Za-z0-9]{52}/,       endpoint: 'https://api.groq.com/openai/v1/models',                    testable: true  },
    { name: 'perplexity',  pattern: /^pplx-[A-Za-z0-9]{48}/,     endpoint: 'https://api.perplexity.ai/models',                         testable: true  },
    { name: 'huggingface', pattern: /^hf_[A-Za-z0-9]{34,}/,      endpoint: 'https://huggingface.co/api/whoami',                        testable: true  },
    { name: 'replicate',   pattern: /^r8_[A-Za-z0-9]{37}/,       endpoint: 'https://api.replicate.com/v1/account',                     testable: true  },
    { name: 'aws_bedrock', pattern: /^AKIA[A-Z0-9]{16}/,          endpoint: null,                                                       testable: false },
    // Ambiguous patterns below — detection only, no API call made
    { name: 'together_ai', pattern: /^[a-f0-9]{64}$/,             endpoint: 'https://api.together.xyz/v1/models',                       testable: false },
    { name: 'azure_openai',pattern: /^[a-f0-9]{32}$/,             endpoint: null,                                                       testable: false },
    { name: 'cohere',      pattern: /^[A-Za-z0-9]{40}$/,          endpoint: 'https://api.cohere.com/v1/models',                         testable: false },
    { name: 'mistral',     pattern: /^[A-Za-z0-9]{32}$/,          endpoint: 'https://api.mistral.ai/v1/models',                         testable: false },
  ];

  for (const p of providers) {
    if (p.pattern.test(key)) return p;
  }
  return null;
}

async function checkProvider(provider, key) {
  assertAllowedEndpoint(provider.endpoint);

  const headers = {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  if (provider.name === 'anthropic') {
    headers['x-api-key'] = key;
    headers['anthropic-version'] = '2023-06-01';
    delete headers['Authorization'];
  }

  const response = await fetch(provider.endpoint, {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(10000)
  });

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
