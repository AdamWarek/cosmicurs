# 🌌 Cosmos Website — Project Plan

## Project Overview
A multi-page informational website about the cosmos, built with plain HTML, CSS, and JavaScript. Designed for a non-coder using Cursor AI editor. Target: a visually stunning, publicly hosted website covering planets, galaxies, black holes, and more.

---

## Tech Stack
| Layer | Technology | Reason |
|---|---|---|
| Structure | HTML5 | Simple, no build tools needed |
| Styling | CSS3 | Full control, works directly in browser |
| Interactivity | Vanilla JavaScript | No dependencies, Cursor handles it well |
| Hosting | Netlify (free) | Drag-and-drop deploy, no terminal needed |

---

## Site Structure

```
cosmos-website/
├── index.html            ← Homepage
├── planets.html          ← The Solar System & Planets
├── galaxies.html         ← Galaxies & the Universe
├── black-holes.html      ← Black Holes deep dive
├── about.html            ← About this site
│
├── css/
│   └── style.css         ← All visual styling
│
├── js/
│   └── main.js           ← Animations & interactivity
│
└── images/               ← All photos and icons
```

---

## Pages & Content Plan

### 1. `index.html` — Homepage
- Full-screen hero section with animated starfield background
- Site title and tagline (e.g. *"Explore the Universe"*)
- Navigation bar linking to all pages
- Brief intro paragraph about the cosmos
- 4 featured cards linking to the main topic pages
- Footer with credits

### 2. `planets.html` — Planets
- Page hero with heading
- Grid of 8 planet cards (one per planet)
- Each card: planet name, image, 2–3 fun facts
- Optional: a small section on dwarf planets (Pluto, etc.)

### 3. `galaxies.html` — Galaxies
- Page hero with heading
- Introduction to what a galaxy is
- Visual gallery of galaxy types (spiral, elliptical, irregular)
- Section on the Milky Way specifically
- Fun scale comparison (e.g. number of stars)

### 4. `black-holes.html` — Black Holes
- Page hero with heading
- Article-style layout: What is a black hole?
- Sections: Formation, Types, Famous examples (Sagittarius A*, M87)
- Visual diagram or image with caption
- Quote or famous fact callout block

### 5. `about.html` — About
- Short description of the website's purpose
- Credits and image sources
- Links back to homepage

---

## Design Direction
- **Theme:** Dark space aesthetic — deep navy/black backgrounds, stars, glowing accents
- **Colors:** `#0a0a1a` (background), `#ffffff` (text), `#f0c040` (gold accent), `#4fc3f7` (blue accent)
- **Typography:** A futuristic or elegant display font for headings (e.g. Orbitron, Rajdhani from Google Fonts) paired with a clean readable font for body text (e.g. Lato, Source Sans Pro)
- **Animations:** Animated starfield on homepage, subtle hover effects on cards, smooth page scrolling
- **Layout:** Full-width hero sections, card grids, clean article-style content sections

---

## Development Phases

| Phase | Focus | Est. Time |
|---|---|---|
| 1 | Setup — folder structure, homepage skeleton | Day 1 |
| 2 | Design — CSS theme, fonts, colors, starfield | Day 2 |
| 3 | Content pages — build all 4 topic pages | Days 3–5 |
| 4 | Polish — animations, mobile responsiveness | Day 6 |
| 5 | Deploy — publish live on Netlify | Day 7 |

---

## Cursor AI Strategy
- Always specify **which file** you're editing in your prompt
- Describe changes **visually** ("add a glowing border", "make the cards appear in a 3-column grid")
- When something breaks, describe the **symptom**, not a guess at the cause
- Ask Cursor to **explain** any code you don't understand
- Request changes **one section at a time** for best results

---

## Publishing Plan
1. Sign up at [netlify.com](https://netlify.com) (free account)
2. Finish and save all files in your `cosmos-website` folder
3. Go to Netlify dashboard → "Add new site" → "Deploy manually"
4. Drag and drop the entire `cosmos-website` folder
5. Site goes live at a `*.netlify.app` URL instantly
6. Optional: connect a custom domain name later

---

## Future Upgrades (Optional)
- Add a **search bar** to find topics
- Add a **quiz page** (e.g. "Test your space knowledge")
- Migrate to **Astro** framework for better performance at scale
- Add **NASA API** integration for live astronomy images (Astronomy Picture of the Day)
- Add a **dark/light mode toggle**
