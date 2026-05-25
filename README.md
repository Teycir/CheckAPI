# CheckAPI

A single-page Next.js application that validates LLM API keys for multiple providers.

## Features

- **Zero friction**: Paste keys → click button → get results
- **Multi-vendor support**: OpenAI, Anthropic, Google Gemini, Groq, Perplexity, HuggingFace, Replicate, and more
- **Privacy-first**: All checks run client-side in your browser
- **Detailed results**: View models, latency, rate limits, and error messages
- **Dark mode**: Built-in theme toggle

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

### Via GitHub Actions

Connect your GitHub repository to Cloudflare Pages. The build settings:

- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `/`

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

## License

MIT
