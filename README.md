# Vampire Survivors–Style Prototype

A small prototype inspired by **Vampire Survivors**, built with **Phaser 3** and **TypeScript**. Move with WASD, auto-aim shoots at the nearest enemy, and coins are drawn toward you when close.

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

## Controls

| Key   | Action   |
|-------|----------|
| **W** | Move up  |
| **A** | Move left|
| **S** | Move down|
| **D** | Move right|

- Movement: **WASD**
- Shooting: **automatic** — targets the nearest enemy
- Coins: **magnet** — when you get close, coins are pulled toward you

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

## Tuning the game

Edit **`src/scripts/gameOptions.ts`** to change:

- **Game size** – `gameSize.width` / `gameSize.height`
- **Speeds** – `playerSpeed`, `enemySpeed`, `bulletSpeed`
- **Rates** – `bulletRate`, `enemyRate` (milliseconds)
- **Magnet** – `magnetRadius` (how close coins need to be to be attracted)
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

Have fun expanding your Vampire Survivors–style prototype.
