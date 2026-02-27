/**
 * Injects the current git commit hash into index.html (__GIT_COMMIT__ placeholder).
 * Run before commit so the version is included in the commit.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'index.html');
const placeholder = '__GIT_COMMIT__';

function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return 'dev';
  }
}

const hash = getCommitHash();
let content = fs.readFileSync(indexPath, 'utf8');

if (!content.includes(placeholder)) {
  console.warn('scripts/inject-commit-version.js: __GIT_COMMIT__ placeholder not found in index.html');
  process.exit(0);
}

content = content.replace(placeholder, hash);
fs.writeFileSync(indexPath, content, 'utf8');
console.log(`Commit version set to ${hash}`);
