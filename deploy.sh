#!/bin/bash

# Build the project
echo "Building CheckAPI..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✓ Build successful!"
    echo ""
    echo "To deploy to Cloudflare Pages:"
    echo "  1. Via Dashboard: Upload the 'out' directory at https://dash.cloudflare.com/pages"
    echo "  2. Via CLI: wrangler pages deploy out --project-name=checkapi"
    echo ""
else
    echo "✗ Build failed!"
    exit 1
fi
