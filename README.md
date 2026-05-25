# CheckAPI

A single-page Next.js application that validates LLM API keys for multiple providers.

## Features

- **Zero friction**: Paste keys → click button → get results
- **Multi-vendor support**: OpenAI, Anthropic, Google Gemini, Groq, Perplexity, HuggingFace, Replicate, and more
- **Privacy-first**: All checks run client-side in your browser
- **Detailed results**: View models, latency, rate limits, and error messages
- **Dark mode**: Built-in theme toggle
- **API Access**: Use via curl or any HTTP client

## API Usage

CheckAPIs can be used programmatically via HTTP API:

```bash
# Check single key
curl -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys": ["sk-proj-..."]}'

# Check multiple keys
curl -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys": ["sk-proj-...", "sk-ant-api03-...", "AIzaSy..."]}'
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "key": "sk-proj-...",
      "provider": "openai",
      "valid": true,
      "models": ["gpt-4", "gpt-3.5-turbo"],
      "latency": 245,
      "rateLimit": "5000"
    }
  ]
}
```

**Rate Limiting**: 20 requests per minute per IP. See [docs/API.md](./docs/API.md) for full documentation.

## Supported Providers

- OpenAI
- Anthropic (Claude)
- Google Gemini
- Groq
- Perplexity
- HuggingFace
- Replicate
- Together AI
- Cohere
- Mistral
- AWS Bedrock (detection only)
- Azure OpenAI (detection only)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

Static files will be generated in the `out` directory.

## Deploy to Cloudflare Pages

### Via Dashboard

1. Build the project: `npm run build`
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Create a new project
4. Upload the `out` directory

### Via Wrangler CLI

```bash
npm install -g wrangler
wrangler pages deploy out --project-name=checkapi
```

Or use the deployment script:
```bash
./scripts/deploy.sh
```

### Via GitHub Actions

Connect your GitHub repository to Cloudflare Pages. The build settings:

- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `/`

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## Privacy & Security

- All API key validation happens in your browser
- Keys are never sent to any proxy server
- Keys are never logged or stored
- Displayed keys are always truncated (first 8 characters only)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Static export for Cloudflare Pages

## Project Structure

```
├── app/              # Next.js app router pages
├── components/       # React components
├── docs/            # Documentation
│   ├── API.md       # API documentation
│   ├── DEPLOYMENT.md
│   ├── RATE_LIMITING.md
│   └── roadmap.md
├── functions/       # Cloudflare Pages Functions
│   └── api/
│       └── check.js # API endpoint with rate limiting
├── lib/             # Utility functions
├── public/          # Static assets
├── scripts/         # Deployment and utility scripts
├── tests/           # Test scripts
└── wrangler.toml    # Cloudflare configuration
```

## License

MIT
