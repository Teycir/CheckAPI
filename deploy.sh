#!/bin/bash
set -e

echo "🔨 Building CheckAPI..."
npm run build

echo ""
echo "🚀 Deploying to production..."
npx wrangler pages deploy out --project-name=checkapis --branch=main --commit-dirty=true

echo ""
echo "✅ Deployment complete!"
echo "🌐 Live at: https://checkapis.pages.dev"
