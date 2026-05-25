#!/usr/bin/env node
const { readFileSync, writeFileSync, chmodSync } = require('fs');
const { join } = require('path');

const cliPath = join(__dirname, '../dist/cli/cli/index.js');

try {
  let content = readFileSync(cliPath, 'utf-8');
  
  // Add shebang if not present
  if (!content.startsWith('#!/usr/bin/env node')) {
    content = '#!/usr/bin/env node\n' + content;
    writeFileSync(cliPath, content);
  }
  
  // Make executable
  chmodSync(cliPath, 0o755);
  
  console.log('✓ CLI binary prepared:', cliPath);
} catch (error) {
  console.error('Failed to prepare CLI binary:', error.message);
  process.exit(1);
}
