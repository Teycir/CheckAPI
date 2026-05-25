# CheckAPI - Deployment Guide

## Quick Start

The application is built and ready to deploy! Static files are in the `out` directory.

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Build for Production

```bash
npm run build
```

Or use the deployment script:

```bash
./deploy.sh
```

## Deployment Options

### Option 1: Cloudflare Pages Dashboard (Easiest)

1. Go to https://dash.cloudflare.com/pages
2. Click "Create a project"
3. Choose "Upload assets"
4. Upload the entire `out` directory
5. Your site will be live at `https://checkapi.pages.dev`

### Option 2: Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy out --project-name=checkapi
```

### Option 3: GitHub Actions (Automated)

1. Push your code to GitHub
2. Add these secrets to your repository:
   - `CLOUDFLARE_API_TOKEN`: Get from Cloudflare Dashboard → My Profile → API Tokens
   - `CLOUDFLARE_ACCOUNT_ID`: Get from Cloudflare Dashboard → Workers & Pages → Account ID
3. Push to `main` branch - deployment happens automatically

The workflow file is already configured at `.github/workflows/deploy.yml`

### Option 4: Connect GitHub Repository

1. Go to Cloudflare Pages Dashboard
2. Click "Connect to Git"
3. Select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/`
5. Click "Save and Deploy"

## Features Implemented

✅ Single-page application with clean UX
✅ Multi-vendor API key detection (12+ providers)
✅ Client-side validation (privacy-first)
✅ Regex-based vendor identification
✅ Live API testing with detailed results
✅ Dark mode toggle
✅ Expandable result rows with full details
✅ Model list, latency, rate limits display
✅ Error handling and CORS detection
✅ Static export for Cloudflare Pages
✅ TypeScript throughout
✅ Tailwind CSS styling
✅ Responsive design

## Supported Providers

- ✅ OpenAI (definite detection)
- ✅ Anthropic (definite detection)
- ✅ Google Gemini (definite detection)
- ✅ Groq (definite detection)
- ✅ Perplexity (definite detection)
- ✅ HuggingFace (definite detection)
- ✅ Replicate (definite detection)
- ✅ Together AI (likely detection)
- ✅ Cohere (likely detection)
- ✅ Mistral (likely detection)
- ✅ AWS Bedrock (detection only - untestable)
- ✅ Azure OpenAI (detection only - untestable)

## Architecture

```
CheckAPI/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── KeysTextarea.tsx    # Input component
│   ├── CheckButton.tsx     # Action button
│   ├── ResultsTable.tsx    # Results display
│   └── ThemeToggle.tsx     # Dark mode toggle
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── vendors.ts          # Vendor registry & detection
│   └── checker.ts          # Core validation logic
├── out/                    # Build output (static files)
├── next.config.ts          # Next.js config (static export)
├── wrangler.toml           # Cloudflare config
└── deploy.sh               # Deployment helper script
```

## Privacy & Security

- All API checks run in the browser
- No backend server or proxy
- Keys never logged or stored
- Keys truncated in display (first 8 chars only)
- 10-second timeout per request
- CORS errors handled gracefully

## Testing

To test the application:

1. Start dev server: `npm run dev`
2. Paste test API keys (one per line)
3. Click "Check Keys"
4. Verify results display correctly

Note: You'll need valid API keys to test actual validation. Invalid keys will show error states.

## Troubleshooting

**Build fails:**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires v18+)

**CORS errors in results:**
- This is expected for some vendors (AWS, Azure)
- These keys are detected but marked as "untestable"

**Dark mode not working:**
- Clear browser cache
- Check browser console for errors

## Next Steps

After deployment, you can:
- Add custom domain in Cloudflare Pages settings
- Enable analytics
- Set up preview deployments for branches
- Configure custom headers if needed

## License

MIT
