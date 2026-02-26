# Cosmos Website — Agent Instructions

## Overview

Static multi-page website about space/astronomy. Built with plain HTML5, CSS3, and vanilla JavaScript — no frameworks, no build tools, no package managers, no backend.

## Cursor Cloud specific instructions

### Serving the site

There are zero dependencies to install. To run the site locally, use Python's built-in HTTP server:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080` in Chrome. The site uses relative paths and a `<video>` element that may not render correctly via `file://` — always use an HTTP server.

### Linting and testing

There are no configured linters or automated test suites. HTML/CSS/JS can be validated with browser developer tools or by installing external tools (e.g., `npx htmlhint index.html`). The project has no `package.json` and no test scripts.

### Key files

- `index.html` — Homepage with animated solar system hero
- `css/style.css` — All styles (dark space theme, CSS orbit animations)
- `js/main.js` — Starfield canvas animation and mobile nav toggle
- `images/` — Static assets (planet images, backgrounds, sun GIF)

### Gotchas

- Google Fonts (Orbitron, Lato) are loaded from CDN. The site works offline but falls back to system sans-serif fonts.
- Additional pages (`planets.html`, `galaxies.html`, `black-holes.html`, `about.html`) are planned per `cosmos-website-plan.md` but may not yet exist. Navigation links to missing pages will 404.
