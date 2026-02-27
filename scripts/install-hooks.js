/**
 * Installs the pre-commit hook for commit version injection.
 * Run: node scripts/install-hooks.js
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const hooksDir = path.join(repoRoot, '.git', 'hooks');
const sourceHook = path.join(__dirname, 'pre-commit.hook');
const targetHook = path.join(hooksDir, 'pre-commit');

if (!fs.existsSync(path.join(repoRoot, '.git'))) {
  console.error('Not a git repository');
  process.exit(1);
}

fs.copyFileSync(sourceHook, targetHook);
fs.chmodSync(targetHook, 0o755);
console.log('Pre-commit hook installed. Commit version will be injected on each commit.');
