// GOBBLE OR GONE v2 — the hand-in program (Node 22, standard library only).
// It copies this repository's game/ and screenshots/ to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun
// library. Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program must finish in 10 seconds on 1 CPU with no network; copying
// small static files is far inside that.
//
// v2 is a full rebuild of the v1 entry (same bounty, new repository) —
// ROMBAK TOTAL: v1 was a top-down stealth game; v2 is a side-view runner.
// The turkey runs itself right, jumps and slides, the farmer chases from
// behind, and the three gates are forks in the track. The kitchen gate shot
// shows the falling carving knife and the lit oven; the end screen is the
// dawn woods.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files, in all, or a path under game/ over 1000 bytes: game/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
