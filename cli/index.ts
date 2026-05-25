#!/usr/bin/env node
import { readFileSync } from 'fs';
import { createLLMValidator } from '../lib/cli.js';
import type { ValidationResult } from '../lib/core/types.js';

const NO_COLOR = process.env.NO_COLOR !== undefined;

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    keys: [] as string[],
    file: null as string | null,
    json: false,
    sequential: false,
    timeout: 30000,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      config.json = true;
    } else if (arg === '--sequential' || arg === '-s') {
      config.sequential = true;
    } else if (arg === '--file' || arg === '-f') {
      config.file = args[++i];
    } else if (arg === '--timeout') {
      config.timeout = parseInt(args[++i], 10);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      config.keys.push(arg);
    }
  }

  return config;
}

function printHelp() {
  console.log(`
CheckAPIs CLI - Validate LLM API keys from the command line

USAGE:
  checkapis [OPTIONS] [KEYS...]

OPTIONS:
  -f, --file <path>     Read keys from file (one per line, # for comments)
  -s, --sequential      Validate keys one at a time (default: parallel)
  --timeout <ms>        Request timeout in milliseconds (default: 30000)
  --json                Output raw JSON for scripting
  -h, --help            Show this help

EXAMPLES:
  checkapis sk-proj-...
  checkapis sk-ant-... AIzaSy...
  checkapis -f keys.txt
  cat keys.txt | checkapis --json | jq '.[] | select(.status == "valid")'

EXIT CODES:
  0  All keys valid
  1  Any key invalid or error
  2  Input error
`);
}

function readKeysFromFile(path: string): string[] {
  const content = readFileSync(path, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function readKeysFromStdin(): string[] {
  const stdin = readFileSync(0, 'utf-8');
  return stdin
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function color(code: number, text: string): string {
  return NO_COLOR ? text : `\x1b[${code}m${text}\x1b[0m`;
}

function statusColor(status: string): string {
  const colors: Record<string, number> = {
    valid: 32,
    invalid: 31,
    error: 33,
    untestable: 90,
  };
  return color(colors[status] || 37, status.toUpperCase());
}

function renderProgress(current: number, total: number) {
  if (process.stdout.isTTY) {
    process.stderr.write(`\r${color(36, '⏳')} Validating ${current}/${total}...`);
  }
}

function clearProgress() {
  if (process.stdout.isTTY) {
    process.stderr.write('\r\x1b[K');
  }
}

function renderTable(results: ValidationResult[]) {
  const rows = results.map(r => ({
    key: r.truncatedKey,
    provider: r.provider,
    status: statusColor(r.status),
    models: r.metadata?.models?.slice(0, 3).join(', ') || '-',
    latency: r.latencyMs ? `${r.latencyMs}ms` : '-',
  }));

  const widths = {
    key: Math.max(8, ...rows.map(r => r.key.length)),
    provider: Math.max(8, ...rows.map(r => r.provider.length)),
    status: 7,
    models: Math.max(6, ...rows.map(r => r.models.length)),
    latency: 7,
  };

  const header = [
    'KEY'.padEnd(widths.key),
    'PROVIDER'.padEnd(widths.provider),
    'STATUS'.padEnd(widths.status),
    'MODELS'.padEnd(widths.models),
    'LATENCY',
  ].join('  ');

  console.log(color(1, header));
  console.log('─'.repeat(header.length));

  rows.forEach(row => {
    console.log([
      row.key.padEnd(widths.key),
      row.provider.padEnd(widths.provider),
      row.status.padEnd(widths.status + (NO_COLOR ? 0 : 9)),
      row.models.padEnd(widths.models),
      row.latency,
    ].join('  '));
  });
}

async function main() {
  const config = parseArgs();
  let keys: string[] = [];

  // Collect keys from all sources
  if (config.file) {
    try {
      keys.push(...readKeysFromFile(config.file));
    } catch (error) {
      console.error(color(31, `Error reading file: ${error}`));
      process.exit(2);
    }
  }

  if (!process.stdin.isTTY) {
    keys.push(...readKeysFromStdin());
  }

  keys.push(...config.keys);

  // Deduplicate
  keys = [...new Set(keys)];

  if (keys.length === 0) {
    console.error(color(31, 'No keys provided'));
    printHelp();
    process.exit(2);
  }

  const validator = createLLMValidator({
    timeout: config.timeout,
    parallel: !config.sequential,
  });

  let completed = 0;
  const results: ValidationResult[] = [];

  if (config.sequential) {
    for (const key of keys) {
      renderProgress(++completed, keys.length);
      const [result] = await validator.validate([key]);
      results.push(result);
    }
  } else {
    renderProgress(0, keys.length);
    const allResults = await validator.validate(keys);
    results.push(...allResults);
  }

  clearProgress();

  if (config.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    renderTable(results);
    console.log();
    const valid = results.filter(r => r.status === 'valid').length;
    const invalid = results.filter(r => r.status === 'invalid').length;
    const errors = results.filter(r => r.status === 'error').length;
    console.log(`${color(32, `✓ ${valid} valid`)}  ${color(31, `✗ ${invalid} invalid`)}  ${color(33, `⚠ ${errors} errors`)}`);
  }

  const hasInvalid = results.some(r => r.status !== 'valid');
  process.exit(hasInvalid ? 1 : 0);
}

main().catch(error => {
  console.error(color(31, `Fatal error: ${error.message}`));
  process.exit(1);
});
