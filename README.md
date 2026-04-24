# Smart Relief BD

**Smart Relief BD** is a single-page web application for Bangladesh-focused **disaster response**, **health guidance**, and **civic issue reporting**. It presents an emergency operations style dashboard, an interactive flood map, an AI-style health assistant UI, and a city issue reporting flow.

The UI is built with **React** (Create React App), **React Router**, **Framer Motion**, and **Leaflet** for maps. Live **air quality** data is fetched from the **Open-Meteo** air quality API on the dashboard.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Repository layout (full structure)](#repository-layout-full-structure)
4. [Source code (`src/`) in detail](#source-code-src-in-detail)
5. [Public assets (`public/`)](#public-assets-public)
6. [Application routes](#application-routes)
7. [External services & data](#external-services--data)
8. [Scripts](#scripts)
9. [Getting started](#getting-started)
10. [Build output](#build-output)
11. [Specification & design](#specification--design)
12. [Notes](#notes)

---

## Features


| Area             | Description                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Alert ticker** | Marquee-style strip for flood and road alerts above the navbar.                                                                                     |
| **Navigation**   | Sticky header with logo, routes (wide screens), clock/weather, login placeholder, mobile drawer (≤1280px), Emergency SOS dropdown / mobile section. |
| **Dashboard**    | Stats bar, three “mission” cards (EarthCare AQI + flood badge, HealthNet hospital stub, SmartCity reports stub), quick actions.                     |
| **Flood map**    | Leaflet map with toggles for flood polygons, hospitals, citizen reports; markers and legend; collapsible sidebar.                                   |
| **Health**       | Symptom form, mock AI response with English/Bangla toggle, nearest hospital call-to-action, quick service cards.                                    |
| **Report**       | Issue submission form (with optional photo), list of recent mock reports, summary stats.                                                            |
| **SOS**          | Fixed floating button with emergency dial shortcuts and optional short alarm (`sosFeatures.js`).                                                    |


---

## Tech stack


| Layer        | Technology                                                     |
| ------------ | -------------------------------------------------------------- |
| Runtime / UI | React 19, React DOM                                            |
| Routing      | React Router DOM 7                                             |
| Styling      | CSS files per component/page; global tokens in `src/index.css` |
| Motion       | Framer Motion                                                  |
| Maps         | Leaflet 1.9, React-Leaflet 5                                   |
| Tooling      | Create React App (`react-scripts` 5), ESLint (react-app)       |
| Tests        | Jest, React Testing Library                                    |


**Declared in `package.json` but not used by the current React UI entrypoint:** `express`, `cors`, `node-fetch` (likely reserved for a future API server or tooling).

---

## Repository layout (full structure)

Below is the **intended project layout** for development. Generated or install-only trees are summarized so the document stays accurate without listing thousands of files.

```
Smart_Relief_BD/
├── .git/                          # Git metadata (not listed file-by-file)
├── .gitignore                     # Ignores node_modules, build, env files, etc.
├── README.md                      # This file
├── SPEC.md                        # Product / UI specification (design reference)
├── package.json                   # Dependencies and npm scripts
├── package-lock.json              # Locked dependency tree
│
├── public/                        # Static files copied as-is to build root
│   ├── index.html                 # HTML shell, root div, viewport meta
│   ├── manifest.json              # PWA-style web app manifest
│   ├── robots.txt                 # Crawler hints
│   ├── favicon.ico
│   ├── logo192.png
│   └── logo512.png
│
├── src/                           # All application source
│   ├── index.js                   # React root: createRoot, StrictMode, Router context
│   ├── index.css                  # Global reset, CSS variables, utilities, animations
│   ├── App.js                     # Layout: Navbar, Routes, Footer, SOSButton
│   ├── App.css                    # App shell (.app, .main-content)
│   ├── App.test.js                # Smoke test for App
│   ├── setupTests.js              # Jest / Testing Library setup
│   └── reportWebVitals.js         # Optional web vitals reporting (CRA default)
│   │
│   ├── components/                # Shared layout / UI pieces
│   │   ├── Navbar.js              # Ticker, nav links, SOS dropdown, mobile drawer
│   │   ├── Navbar.css
│   │   ├── Footer.js              # Footer columns, links, social icons
│   │   ├── Footer.css
│   │   ├── SOSButton.js           # Fixed FAB + emergency options + alarm
│   │   ├── SOSButton.css
│   │   ├── StatsBar.js            # Animated dashboard statistics strip
│   │   └── StatsBar.css
│   │
│   ├── pages/                     # Route-level views (one folder per page: .js + .css)
│   │   ├── Dashboard.js           # Home: AQI, mission cards, quick actions
│   │   ├── Dashboard.css
│   │   ├── FloodMap.js            # Leaflet map, layers, markers, polygons
│   │   ├── FloodMap.css
│   │   ├── Health.js              # Symptom checker UI + mock AI panel
│   │   ├── Health.css
│   │   ├── Report.js              # Report form + recent reports list
│   │   └── Report.css
│   │
│   └── utils/                     # Non-UI helpers
│       ├── airQuality.js          # Open-Meteo AQI fetch + PM conversion helpers
│       └── sosFeatures.js         # Geolocation, SMS draft links, Web Audio alarm
│
├── node_modules/                  # Installed packages (do not commit; from npm install)
└── build/                         # Production bundle (from npm run build; typically gitignored)
    ├── index.html
    ├── asset-manifest.json
    ├── static/
    │   ├── css/                   # Hashed main CSS
    │   └── js/                    # Hashed main + runtime chunks
    └── …                          # Copied public assets as referenced by build
```

---

## Source code (`src/`) in detail

### Entry & shell


| File            | Role                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `**index.js**`  | Mounts `<App />` into `#root`, imports global CSS and (optionally) `reportWebVitals`.                                                                     |
| `**index.css**` | Design tokens (`:root`), typography, `.container`, `.glass-card`, `.btn*`, `.badge*`, scrollbar, responsive type, keyframes (`marquee`, `slideIn`, etc.). |
| `**App.js**`    | `BrowserRouter`, `Navbar`, `main.main-content` with `Routes` / `Route`, `Footer`, `SOSButton`.                                                            |
| `**App.css**`   | Flex column layout for full viewport height; extra bottom padding on small screens for the SOS FAB.                                                       |


### Components (`src/components/`)


| Component     | JS             | CSS             | Responsibility                                                                                                                                 |
| ------------- | -------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Navbar**    | `Navbar.js`    | `Navbar.css`    | Alert ticker; logo; desktop nav + Emergency SOS dropdown (tel links, alarm); time + weather + login; hamburger + slide-over panel for ≤1280px. |
| **Footer**    | `Footer.js`    | `Footer.css`    | Brand blurb, quick links, contact block, social SVGs, copyright.                                                                               |
| **SOSButton** | `SOSButton.js` | `SOSButton.css` | Fixed SOS control: hover-expand on fine pointers, tap-toggle on touch; Framer Motion for panel.                                                |
| **StatsBar**  | `StatsBar.js`  | `StatsBar.css`  | Four animated stats; `IntersectionObserver` triggers count-up once.                                                                            |


### Pages (`src/pages/`)


| Route path   | Component      | Key behavior                                                                                                                |
| ------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `/`          | `Dashboard.js` | `fetchAirQuality()` on interval; mission cards (EarthCare / HealthNet / SmartCity); `StatsBar`; quick action links.         |
| `/flood-map` | `FloodMap.js`  | `MapContainer`, `TileLayer` (Carto dark), `Polygon` / `Marker` / `Popup`; layer toggles; sidebar open/close + mobile scrim. |
| `/health`    | `Health.js`    | Controlled form, symptom chips, mock bilingual AI result panel, health link cards.                                          |
| `/report`    | `Report.js`    | Form with issue type, location, description, optional image; mock recent reports; stats row.                                |


Each page imports a **co-located `.css`** file for layout and page-specific styles.

### Utils (`src/utils/`)


| File                 | Exports / purpose                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `**airQuality.js**`  | Fetches air quality from Open-Meteo for a fixed Bangladesh area; maps PM2.5/PM10 to AQI-style values and human-readable status. |
| `**sosFeatures.js**` | `getCurrentLocation`, `sendEmergencySMS` (SMS URL scheme), `playAlarm` / `stopAlarm` using Web Audio oscillator.                |


### Tests


| File                | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| `**App.test.js**`   | Default CRA-style render test (adjust as features grow). |
| `**setupTests.js**` | Imports `@testing-library/jest-dom` matchers.            |


---

## Public assets (`public/`)


| File                                            | Purpose                                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `**index.html**`                                | Document title, meta description, `%PUBLIC_URL%` links, `#root` mount point. |
| `**manifest.json**`                             | Name, icons, theme color for installable PWA metadata.                       |
| `**robots.txt**`                                | Search engine rules (CRA default).                                           |
| `**favicon.ico`, `logo192.png`, `logo512.png**` | Icons referenced by HTML/manifest.                                           |


---

## Application routes


| Path         | Page component |
| ------------ | -------------- |
| `/`          | `Dashboard`    |
| `/flood-map` | `FloodMap`     |
| `/health`    | `Health`       |
| `/report`    | `Report`       |


All routes are declared in `**src/App.js**`.

---

## External services & data


| Service                         | Used by                   | Notes                                             |
| ------------------------------- | ------------------------- | ------------------------------------------------- |
| **Open-Meteo Air Quality API**  | `src/utils/airQuality.js` | HTTPS fetch from the browser; no API key in repo. |
| **OpenStreetMap / Carto tiles** | `FloodMap.js`             | Raster map tiles over HTTPS.                      |


Emergency numbers in the UI use `**tel:`** links (e.g. 999, 199). Map geometry and “recent reports” are **in-code demo data**, not a live backend.

---

## Scripts

Defined in `**package.json`**:


| Command         | Description                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| `npm start`     | Dev server (default [http://localhost:3000](http://localhost:3000)), hot reload. |
| `npm run build` | Optimized production build to `**build/**`.                                      |
| `npm test`      | Jest + React Testing Library in watch mode.                                      |
| `npm run eject` | Irreversible CRA eject (advanced; usually unnecessary).                          |


---

## Getting started

**Prerequisites:** Node.js (LTS recommended) and npm.

```bash
cd Smart_Relief_BD
npm install
npm start
```

For a production bundle:

```bash
npm run build
```

Serve the contents of `**build/**` with any static file host (e.g. `npx serve -s build`).

---

## Build output

After `**npm run build**`, CRA emits:

- `**build/index.html**` – Entry HTML with hashed script/link tags.
- `**build/static/js/**` – Bundled JavaScript (and source maps if enabled).
- `**build/static/css/**` – Extracted CSS.
- `**build/asset-manifest.json**` – Mapping of logical names to hashed files.

The `**build/**` directory should not be edited by hand; regenerate it from source.

---

## Specification & design

`**SPEC.md**` in the repository describes the intended **visual system** (colors, typography, layout goals), **page-level behavior**, and product framing. Use it alongside this README when changing UI or copy.

---

## Development conventions

- **Components:** functional components and hooks only (no class components).
- **Forms:** no `<form action>` / `<form method>` or submit-driven `<form onSubmit>`; use a wrapper `div`, controlled inputs, and `type="button"` with `onClick`. Validate required fields in the handler when native `required` is not used.
- **Styles:** co-located `Component.css` files (not `*.module.css` in this repo unless you migrate); use **`src/index.css`** CSS variables for colors, spacing (`--space-*`), radii, and layout.
- **Stack:** React 19, React Router DOM 7, Framer Motion, Leaflet / React-Leaflet 5.

Cursor also loads **`.cursor/rules/smart-relief-bd.mdc`**.

---

## Notes

- **No backend server** is required to run the UI; the app is a static SPA after build. `**express` / `cors` / `node-fetch`** are present in dependencies but are not imported by the current `src/` tree.
- **Health “AI”** and **report submission** are **front-end demos** (mock responses / `alert`), not connected to a real model or persistence layer.
- For **responsive behavior** and layout tokens (e.g. header height including ticker), see `**src/index.css`** (`--header-total-height`, etc.) and component CSS files.

---

## License / attribution

Project branding and footer reference **Smart Relief BD** and related hackathon / club credits as shown in the app footer. Add or adjust a `LICENSE` file if you need explicit open-source licensing.