# Scripts

Deployment and utility scripts for CheckAPI.

## Available Scripts

### deploy.sh
Deploy the project to Cloudflare Pages.

```bash
./scripts/deploy.sh
```

**Prerequisites:**
- Project built (`npm run build`)
- Wrangler CLI configured
- Cloudflare account authenticated

**What it does:**
- Deploys the `out/` directory to Cloudflare Pages
- Includes KV namespace bindings
- Sets up rate limiting automatically
