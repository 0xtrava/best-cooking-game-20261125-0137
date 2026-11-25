// Dapur Kilat's hand-in program (Node 22, standard library only): the game is this
// repository's game/ folder — plain static files a desktop browser loads offline
// (game/index.html and its ES modules, no library, no network request) — and this
// program hands it in. It copies game/ and screenshots/ from beside this file to
// /output and writes /output/dossier.json, the summary the judge reads, with the
// vendored make.fun library. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

/** The repository root: the folder holding this file. */
const root = fileURLToPath(new URL('.', import.meta.url));
/** The grader's output, or MAKEFUN_OUTPUT_DIR outside its container. */
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** The scorer's own caps, from the bounty's gate: only text_max_bytes shapes the
 *  bytes; the others refuse an entry the scorer would refuse — more than 4
 *  screenshots or one over 256 KiB, more than 993 files in game/ or 48 MiB of
 *  game files in all, or a path under game/ over 1000 bytes. */
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

/** Copy one directory tree into /output, creating its parent first. */
function copyTree(name) {
  const from = join(root, name);
  const to = join(out, name);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree('game');
copyTree('screenshots');
writeFileSync(join(out, 'dossier.json'), buildDossier(out, CAPS));
