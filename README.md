# O11Y Survivors

A survivor-style game built with **Phaser 3** and **TypeScript**. Your goal is to **fend off the competition** and **collect OpenTelemetry knowledge** (coins) to better compete in the marketplace. Move with WASD, auto-aim shoots at the nearest enemy, and coins are drawn toward you when close. The base prototype was originally inspired by Vampire Survivors and created here: https://emanueleferonato.com/2024/12/12/html5-vampire-survivors-prototype-built-with-phaser-step-2-adding-and-collecting-coins/

## Game purpose

You represent an observability team under pressure from competitors. By collecting OpenTelemetry knowledge (coins), you unlock **upgrades** that make you stronger. Taking out large installations (bosses) grants special rewards. The more you collect, the more rivals appear—so you must keep upgrading to stay ahead.

**Play area:** The play map has a large solid center (the main arena) with a tiled cubicle perimeter. Movement and combat take place in the center; the perimeter is decorative.


## Prerequisites

- **Node.js** (v16 or newer recommended)
- **npm** (comes with Node.js)

## Getting Started

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Run the game (development)

Start the dev server and open the game in your browser:

```bash
npm run development
```

This runs Webpack’s dev server and should open the game in your default browser. If it doesn’t, go to:

**http://localhost:8080**

(Or the URL shown in the terminal.)

### 3. Build for production (optional)

To create a production build:

```bash
npm run distribution
```

This outputs a ready-to-serve **`dist`** folder (HTML, CSS, assets, and bundled `main.js`). Serve `dist` with any static file server (e.g. `npx serve dist`) to play or deploy the game. For day-to-day testing, `npm run development` is usually enough.

### GitHub Pages

This repo includes **`.github/workflows/deploy-github-pages.yml`**. On each push to **`main`**, it runs `npm ci` and `npm run distribution`, then publishes **`dist/`** to GitHub Pages.

1. In the GitHub repo: **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions**.
2. Push to `main`; when the workflow finishes, the game is available at:

**`https://<org-or-user>.github.io/<repository>/`**

For this upstream repo that is typically **`https://elastic-ed.github.io/Vampire-Clone/`** (forks should swap in their own `github.io` path). Use that URL in Kibana markdown or anywhere you want an embeddable “play here” link.

## Controls

| Key   | Action   |
|-------|----------|
| **W** | Move up  |
| **A** | Move left|
| **S** | Move down|
| **D** | Move right|
| **F** | Pause / Resume |
| **Space** | Continue (on boss reward overlays only) |
| **1** / **2** | Choose upgrade (on level-up overlays) |

- Movement: **WASD**
- Shooting: **automatic** — targets the nearest enemy
- Coins: **magnet** — when you get close, coins are pulled toward you
- **Pause (F):** Pauses the game; no new enemies spawn while paused. Press **F** again to resume.
- **Level-up screens:** Press **1** or **2** to pick an upgrade (do not use Space on these).
- **Boss reward screens:** Click **Continue** or press **Space** to dismiss.

## Project structure

```
vampire-Clone/
├── src/
│   ├── index.html              # Game HTML entry
│   ├── style.css               # Global styles
│   ├── assets/
│   │   └── sprites/            # player, enemy, coin, bullet sprites
│   └── scripts/
│       ├── main.ts             # Phaser game config & boot
│       ├── gameOptions.ts      # Tunable game constants
│       └── scenes/
│           ├── preloadAssets.ts # Loads sprites and assets
│           └── playGame.ts      # Main gameplay scene
├── webpack.development.js      # Dev server config
├── webpack.distribution.js     # Production build config
├── tsconfig.json
└── package.json
```

## Pause and spawning

Enemy spawning is **paused** whenever:

- The game is **paused** (F), or  
- A **level-up overlay** is open (choosing 1 or 2), or  
- A **boss reward overlay** is open (Continue / Space).

So you can read upgrade text or leave the game paused without enemies building up off-screen; when you resume or close the overlay, spawning continues on the normal schedule.

## Upgrade patterns

Progress is driven by **coins** (OpenTelemetry knowledge). Upgrades are offered at fixed score thresholds and when you defeat certain bosses for the first time.

**Level-ups** (press **1** or **2** to choose; no Space on these screens):

- **Level 2 (15 coins)** — First upgrade: choose **Spread shot** (3 bullets) or **Double fire rate**. A warning appears: new competitors are coming for your business.
- **Level 3 (100 coins)** — You get the second upgrade in addition to the first (you keep both). You end up with **spread shot and double fire rate at the same time**. Same warning.
- **Level 4 (250 coins)** — **Full Stack Visibility**: bullets pierce one enemy and expire on the second, plus a one-time shield that absorbs one enemy hit (destroys that enemy); the player icon spins slowly while the shield is active.
- **Level 5 (500 coins)** — **Performance Tuning**: +10% move speed, +10% bullet speed, +10% fire rate, and +10% magnet pickup range for the rest of the run.

**Boss rewards** (first defeat only; overlays can be dismissed with **Continue** or **Space**):

- **Boss 1 (Data Dog)** — Spawns at 50 coins. First-time reward: congratulations overlay and **+20% movement speed** for the rest of the run.
- **Boss 2 (Splunk)** — Spawns at 200 coins (and with all bosses at 400). First-time reward: congratulations overlay and **+15% magnet pickup range** for the rest of the run.
- **Boss 3 (DynaTrace)** — Spawns at 300 coins (and with all bosses at 400). Has 10 HP. First-time reward: congratulations overlay and **+10% bullet speed** for the rest of the run.

Bosses are 75% larger than normal enemies and have more health than regular enemies.

## Tuning the game

Edit **`src/scripts/gameOptions.ts`** to change:

- **Game size** – `gameSize.width` / `gameSize.height`
- **Speeds** – `playerSpeed`, `enemySpeed`, `bulletSpeed`
- **Rates** – `bulletRate`, `enemyRate` (milliseconds)
- **Magnet** – `magnetRadius` (how close coins need to be to be attracted)
- **Level thresholds** – `expPerLevel`, `level3ScoreThreshold`, `level4ScoreThreshold`, `level5ScoreThreshold` (e.g. 500 for level 5)
- **Background** – `gameBackgroundColor`

Save the file and the dev server will reload with your changes.

## Tech stack

- **Phaser 3** – Game framework
- **TypeScript** – Typed JavaScript
- **Webpack 5** – Bundling and dev server

## Next steps

- Add new weapons or behaviors in `src/scripts/scenes/playGame.ts`
- Add scenes (e.g. menu, game over) in `src/scripts/scenes/` and register them in `main.ts`
- Add or swap sprites in `src/assets/sprites/` and load them in `preloadAssets.ts`
- Adjust balance and feel in `gameOptions.ts`

Have fun expanding O11Y Survivors.