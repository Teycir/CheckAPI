# Project Organization

## Structure

```
CheckAPI/
├── app/              # Next.js App Router
│   ├── faq/
│   ├── how-to-use/
│   └── page.tsx
├── components/       # React components
│   └── ui/
├── docs/            # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── RATE_LIMITING.md
│   └── roadmap.md
├── functions/       # Cloudflare Pages Functions
│   └── api/
│       └── check.js  # API endpoint with rate limiting
├── lib/             # Utilities and core logic
│   ├── core/
│   ├── providers/
│   └── utils/
├── public/          # Static assets
├── scripts/         # Deployment scripts
│   └── deploy.sh
├── tests/           # Test suite
│   ├── test-api.sh
│   ├── test-rate-limit-comprehensive.sh
│   └── ...
└── wrangler.toml    # Cloudflare configuration
```

## Key Files

- **README.md** - Main project documentation
- **wrangler.toml** - Cloudflare Pages configuration with KV bindings
- **functions/api/check.js** - API endpoint with two-tier rate limiting
- **docs/RATE_LIMITING.md** - Rate limiting implementation details

## Changes Made

1. **Created organized directories:**
   - `docs/` - All documentation files
   - `scripts/` - Deployment and utility scripts
   - `tests/` - Test suite with README

2. **Moved files:**
   - Documentation: `API.md`, `DEPLOYMENT.md`, `RATE_LIMITING.md`, `roadmap.md` → `docs/`
   - Scripts: `deploy.sh` → `scripts/`
   - Tests: `test-*.sh` → `tests/`

3. **Removed:**
   - `api-worker.js` (obsolete, using Pages Functions)

4. **Updated:**
   - `README.md` - Updated paths and added project structure section

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Test rate limiting
./tests/test-rate-limit-comprehensive.sh

# Deploy
./scripts/deploy.sh
```
