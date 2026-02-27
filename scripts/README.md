# Scripts

## Commit version badge

The landing page shows the current git commit hash in the top-left corner. To enable automatic injection on each commit:

```bash
node scripts/install-hooks.js
```

This installs a pre-commit hook that runs `inject-commit-version.js` before every commit. Run once after cloning the repo.
