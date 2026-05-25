# CheckAPIs CLI

Command-line interface for validating LLM API keys.

## Installation

### Local Development
```bash
npm run build:cli
node dist/cli/cli/index.js --help
```

### Global Installation
```bash
npm link
checkapis --help
```

### From npm (when published)
```bash
npm install -g checkapis
checkapis --help
```

## Usage

### Basic Usage
```bash
# Single key
checkapis sk-proj-...

# Multiple keys
checkapis sk-ant-... AIzaSy... gsk_...
```

### File Input
```bash
# Read from file (supports comments with #)
checkapis -f keys.txt

# Example keys.txt:
# Production keys
sk-proj-abc123...
# Staging
sk-ant-xyz789...
```

### Stdin Input
```bash
# Pipe from stdin
cat keys.txt | checkapis

# With jq for filtering
cat keys.txt | checkapis --json | jq '.[] | select(.status == "valid")'
```

### Options

- `-f, --file <path>` - Read keys from file (one per line, # for comments)
- `-s, --sequential` - Validate keys one at a time (default: parallel)
- `--timeout <ms>` - Request timeout in milliseconds (default: 30000)
- `--json` - Output raw JSON for scripting
- `-h, --help` - Show help

### Output Formats

**Table (default)**:
```
KEY        PROVIDER  STATUS  MODELS                    LATENCY
─────────────────────────────────────────────────────────────
sk-proj-…  OpenAI    VALID   gpt-4, gpt-3.5-turbo     245ms
sk-ant-…   Anthropic VALID   claude-3-opus, claude-2  189ms

✓ 2 valid  ✗ 0 invalid  ⚠ 0 errors
```

**JSON**:
```json
[
  {
    "key": "sk-proj-...",
    "truncatedKey": "sk-proj-…",
    "provider": "OpenAI",
    "confidence": "definite",
    "status": "valid",
    "statusCode": 200,
    "metadata": {
      "models": ["gpt-4", "gpt-3.5-turbo"],
      "modelCount": 2
    },
    "latencyMs": 245
  }
]
```

### Exit Codes

- `0` - All keys valid
- `1` - Any key invalid or error
- `2` - Input error (no keys provided, file not found, etc.)

## Examples

### Validate Production Keys
```bash
checkapis -f production-keys.txt
```

### Check Only Valid Keys
```bash
checkapis -f keys.txt --json | jq '.[] | select(.status == "valid") | .provider'
```

### Sequential Validation (Rate Limit Friendly)
```bash
checkapis -s -f keys.txt
```

### Custom Timeout
```bash
checkapis --timeout 60000 sk-proj-...
```

### NO_COLOR Support
```bash
NO_COLOR=1 checkapis -f keys.txt
```

## Features

- ✓ Multiple input sources (args, file, stdin)
- ✓ Live progress bar (stderr, doesn't interfere with stdout)
- ✓ Formatted table output with ANSI colors
- ✓ JSON mode for scripting
- ✓ Sequential or parallel validation
- ✓ Comment support in files (#)
- ✓ Automatic deduplication
- ✓ NO_COLOR environment variable support
- ✓ Scriptable exit codes

## Architecture

The CLI uses the same validation logic as the web app but excludes browser-specific code:

- `cli/index.ts` - CLI entry point
- `lib/cli.ts` - Node-compatible lib export (excludes UI code)
- `cli/tsconfig.json` - Separate TypeScript config for Node.js
- `scripts/postbuild-cli.cjs` - Adds shebang and makes executable
