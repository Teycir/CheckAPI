#!/bin/bash
set -e

echo "🔍 Running pre-deployment checks..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found. Run 'npm install' first."
  exit 1
fi

# Run linter
echo "📝 Running linter..."
npm run lint || {
  echo "❌ Linting failed. Fix errors before deploying."
  exit 1
}

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler CLI not found. Install with: npm install -g wrangler"
  exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next out

# Build the project
echo "🔨 Building CheckAPI..."
npm run build || {
  echo "❌ Build failed."
  exit 1
}

# Verify build output
if [ ! -d "out" ]; then
  echo "❌ Build output directory 'out' not found."
  exit 1
fi

echo ""
echo "✅ All checks passed!"
echo "🚀 Deploying to production..."
npx wrangler pages deploy out --project-name=checkapis --branch=main --commit-dirty=true

echo ""
echo "✅ Deployment complete!"
echo "🌐 Live at: https://checkapis.pages.dev"
