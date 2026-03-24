# O11Y Survivors

A **goofy, public-friendly** survivor-style game built with **Phaser 3** and **TypeScript**. You’re on-call for fun: steer with **mouse, touch, or WASD**, let auto-aim handle the drama, hoard OTel-themed coins, and survive waves of “enterprise observability” chaos. Boss names and quips are **parody / satire** for entertainment—not affiliated with, endorsed by, or sponsored by any vendor.

### Upstream vs this fork

| Repository | Role |
|------------|------|
| **[elastic-ed/Vampire-Clone](https://github.com/elastic-ed/Vampire-Clone)** | **Upstream** — canonical project maintained by the Elastic Ed org. |
| **[poulsbopete/Vampire-Clone](https://github.com/poulsbopete/Vampire-Clone)** | **Extended fork** — GitHub Pages workflow, Kibana dashboard JSON, Elastic bootstrap script, pointer controls, and public-demo copy. Use this repo for demos and personal experiments; propose upstream changes via PR to `elastic-ed` after talking to maintainers. |

| Try it | URL |
|--------|-----|
| **Local dev** | `npm run development` → [http://localhost:8080](http://localhost:8080) |
| **GitHub Pages** | After [Actions](https://github.com/poulsbopete/Vampire-Clone/actions) deploys `main`: **[poulsbopete.github.io/Vampire-Clone](https://poulsbopete.github.io/Vampire-Clone/)** |

> If Pages is enabled on **upstream** `elastic-ed/Vampire-Clone`, its URL would be `https://elastic-ed.github.io/Vampire-Clone/` (this fork uses **poulsbopete**’s URL in the table above).

Prototype inspiration: [Vampire Survivors–style Phaser tutorial (Emanuele Feronato)](https://emanueleferonato.com/2024/12/12/html5-vampire-survivors-prototype-built-with-phaser-step-2-adding-and-collecting-coins/).

---

## Public sharing

Safe to link and demo: no profanity in-game, clear **parody** labeling on boss victory screens, and a light **disclaimer** on the title card. If you fork it, consider keeping the satire good-natured and the disclaimer visible.

## Prerequisites

- **Node.js** 16+ (20+ recommended)
- **npm**

## Quick start

```bash
git clone https://github.com/poulsbopete/Vampire-Clone.git   # or upstream: elastic-ed/Vampire-Clone
cd Vampire-Clone
npm install
npm run development
```

Production build (static files in **`dist/`**):

```bash
npm run distribution
```

Optional local preview of `dist/`: `npx serve dist`

## GitHub Pages

Workflow: **`.github/workflows/deploy-github-pages.yml`** — on every push to **`main`**, runs `npm ci` and `npm run distribution`, then publishes **`dist/`**.

1. Repo **Settings → Pages → Build and deployment → Source:** **GitHub Actions**
2. Push to `main` and wait for the workflow to finish
3. Open your Pages URL (see table above; pattern is `https://<user-or-org>.github.io/<repo>/`)

Pushing workflow files requires a GitHub token with the **`workflow`** scope (e.g. `gh auth refresh -h github.com -s workflow`).

## Elastic / Kibana (optional)

This repo includes:

| Path | Purpose |
|------|---------|
| **`kibana/vampire-clone-hub.json`** | Dashboard definition for Kibana’s dashboards API (markdown hub + play link). |
| **`scripts/create-serverless-o11y-and-dashboard.sh`** | Creates an Elastic **Serverless Observability** project (needs `EC_API_KEY` in `.env`) and uploads the hub dashboard via **`kibana-dashboards.js`**. |
| **`.env.example`** | Documents `EC_API_KEY` for Cloud API calls. |

Do **not** commit **`.env`** or **`.elastic-credentials`** (listed in `.gitignore`).

## Game premise

You’re an observability team under pressure. Coins represent **OpenTelemetry knowledge**; bosses are oversized rivals with extra health. The arena is a large central playfield with a decorative tiled perimeter.

## Controls

| Key / input | Action |
|-------------|--------|
| **Mouse** | Move the cursor **over the playfield** — the player steers toward it (no click needed on desktop). **Click / drag** also works. |
| **Touch** | **Touch and hold** (or drag) — player moves toward your finger. |
| **W A S D** | Move (used when pointer isn’t steering, e.g. outside the dead zone rules above) |
| **F** | Pause / resume |
| **1** / **2** | Pick upgrade on **level-up** overlays (do not use Space there) |
| **Space** | Continue on **boss reward** overlays |
| *(none)* | Shooting is **automatic** (nearest enemy) |
| *(proximity)* | **Magnet** pulls coins when you’re close |

Spawning pauses while paused (**F**), during level-up choice, or during boss reward overlays.

## Upgrades & bosses

**Level-ups** (thresholds are coin/score–driven; choose **1** or **2**):

- **Level 2 (~15)** — Spread shot *or* double fire rate  
- **Level 3 (~100)** — You keep the first upgrade and gain the second  
- **Level 4 (~250)** — Full Stack Visibility: pierce + one-hit shield  
- **Level 5 (~500)** — Performance tuning: +10% move, bullet speed, fire rate, magnet range  

**Bosses** (first-kill rewards; dismiss with Continue / Space):

| Boss | Rough spawn | Reward (first time) |
|------|-------------|----------------------|
| Data Dog | ~50 coins | +20% move speed |
| Splunk | ~200 coins (also when all bosses at ~400) | +15% magnet range |
| DynaTrace | ~300 coins (same) | 10 HP; +10% bullet speed |

Bosses are larger and tougher than normal enemies.

## Project structure

```
Vampire-Clone/
├── .github/workflows/     # GitHub Pages deploy
├── kibana/                # Kibana dashboard JSON
├── scripts/               # Elastic Serverless + dashboard helper
├── src/
│   ├── index.html
│   ├── style.css
│   ├── assets/sprites/    # Images loaded in preloadAssets.ts
│   └── scripts/
│       ├── main.ts
│       ├── gameOptions.ts   # Tuning constants
│       └── scenes/
│           ├── preloadAssets.ts
│           ├── startScene.ts
│           ├── playGame.ts
│           └── gameOverScene.ts
├── webpack.development.js
├── webpack.distribution.js
├── tsconfig.json
└── package.json
```

## Tuning

Edit **`src/scripts/gameOptions.ts`**: `gameSize`, speeds, `bulletRate` / `enemyRate`, `magnetRadius`, level thresholds, colors, etc. Dev server reloads on save.

## Tech stack

- **Phaser 3** — Game framework  
- **TypeScript**  
- **Webpack 5** — Dev server + production bundle  

## Ideas for extending

- New weapons / behaviors in `playGame.ts`  
- More scenes; register in `main.ts`  
- New sprites in `src/assets/sprites/` + `preloadAssets.ts`  

---

Have fun with O11Y Survivors.
