# Dapur Kilat — masak cepat, sajikan tepat

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/0xtrava/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/0xtrava/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A complete, original timed cooking game built for [make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137), competition **best-cooking-game-20261125-0137**.

Orders land on the board with a countdown. Click the ingredients on the counter to assemble each dish, let it cook on the stove, then serve the plate before its order timer runs out. Serve in a row to build a combo; three missed orders close the kitchen. Every five serves the kitchen levels up and the orders come faster.

## How to play

- **Click a ticket** on the order board to cook for it (the first order is picked by default).
- **Click ingredients** on the counter — or press **1–8** — to add them to the plate. Needed ingredients glow gold; a wrong one shakes the kitchen.
- **Wait for the stove**: a finished dish cooks on a burner and dings when it is ready.
- **Click a ready plate** on the pass — or press **Space** — to serve it. Serving fast pays a time bonus; serving in a row builds a combo.
- **P** pauses, **M** mutes. Three missed orders end the run.

Five original dishes: Nasi Goreng Kilat, Mie Ayam, Sate Ayam, Gado-Gado and Sup Ayam, from eight ingredients on the counter. All art is drawn on the canvas, all sounds are synthesized with WebAudio — no files are loaded over the network.

## The program

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-game.ts`. It runs with no network and writes the same bytes every run:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Play it locally with `node serve.ts`, then open http://localhost:8080. Deterministic screenshots: `?shot=start|play|serve|end&seed=1` stages each scene.

## The game

- `game/index.html` — the page: one canvas, one status line.
- `game/src/main.js` — boot, the fixed-step loop, screens and the synthesized sounds.
- `game/src/world.js` — the rules: orders, assembly, the stove, serving, scoring, levels.
- `game/src/render.js` — every pixel: kitchen, tickets, plate, counter, stove, pass.
- `game/src/input.js` — mouse, touch and keyboard, hit-tested on the painted layout.
- `game/src/config.js` — dishes, ingredients, timings and layout rectangles.
- `game/src/random.js` — the seeded generator behind `?seed=N`.
- `game/src/shots.js` — the four staged scenes behind `?shot=`.
