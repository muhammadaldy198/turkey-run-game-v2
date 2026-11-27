// The track: one long run (7200 px, three zones) instead of v1's three
// separate top-down rooms. Each zone is a hand-placed line of obstacles with
// seeded jitter, corn arcs over the jumps, a golden feather on the upper
// route of each gate, and decorations the renderer draws. The kitchen holds
// the oven (its flame jet is the last hazard before Gate 3) and four knife
// marks where carving knives fall.
import { GROUND_Y, ZONE_LENGTH } from './config.js';
import { GATE_X } from './gates.js';

function cornArc(list, cx, topY, n) {
  // The arc follows the turkey's jump parabola (peak ~225 px over an
  // obstacle): it rises steeply to the peak so the whole arc is in reach —
  // a low arc would fly under the jumping turkey.
  for (let i = 0; i < n; i += 1) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = Math.round(cx - 70 + t * 140);
    const y = Math.round(topY + Math.cos(t * Math.PI) * 70);
    list.push({ x, y, taken: false });
  }
}

function cornLine(list, x0, x1, y, n) {
  for (let i = 0; i < n; i += 1) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    list.push({ x: Math.round(x0 + (x1 - x0) * t), y, taken: false });
  }
}

export function buildTrack(rng) {
  const j = () => Math.round(rng.range(-25, 25));
  // ---- Zone 0: Maple Farm Yard ----
  const yard = {
    name: 'MAPLE FARM YARD',
    startX: 0, endX: ZONE_LENGTH,
    obstacles: [
      { kind: 'hay', x: 500 + j(), w: 70, h: 64, passed: false },
      { kind: 'fence', x: 850 + j(), w: 26, h: 88, passed: false },
      { kind: 'mud', x: 1050 + j(), w: 160, h: 0, passed: false },
      { kind: 'crate', x: 1350 + j(), w: 60, h: 70, passed: false },
      { kind: 'hay', x: 1650 + j(), w: 70, h: 64, passed: false },
      { kind: 'fence', x: 1950 + j(), w: 26, h: 88, passed: false },
      { kind: 'hay', x: 2200 + j(), w: 70, h: 64, passed: false },
    ],
    corn: [],
    golden: { x: GATE_X[0] - 60, y: GROUND_Y - 150, taken: false },
    decor: [
      { kind: 'pumpkin', x: 320, y: GROUND_Y }, { kind: 'pumpkin', x: 1150, y: GROUND_Y },
      { kind: 'pumpkin', x: 2050, y: GROUND_Y }, { kind: 'haystack', x: 700, y: GROUND_Y },
      { kind: 'haystack', x: 1500, y: GROUND_Y }, { kind: 'fencepost', x: 200, y: GROUND_Y },
      { kind: 'fencepost', x: 2300, y: GROUND_Y },
    ],
  };
  cornLine(yard.corn, 300, 450, GROUND_Y - 30, 4);
  cornArc(yard.corn, 500, GROUND_Y - 210, 4);
  cornArc(yard.corn, 850, GROUND_Y - 210, 4);
  cornLine(yard.corn, 1450, 1600, GROUND_Y - 30, 4);
  cornArc(yard.corn, 1650, GROUND_Y - 210, 4);
  cornArc(yard.corn, 1950, GROUND_Y - 210, 4);

  // ---- Zone 1: Old Barn ----
  const barn = {
    name: 'OLD BARN',
    startX: ZONE_LENGTH, endX: ZONE_LENGTH * 2,
    obstacles: [
      { kind: 'beam', x: 2700 + j(), w: 60, h: 26, passed: false },
      { kind: 'hay', x: 3000 + j(), w: 70, h: 64, passed: false },
      { kind: 'mud', x: 3200 + j(), w: 160, h: 0, passed: false },
      { kind: 'crate', x: 3550 + j(), w: 60, h: 70, passed: false },
      { kind: 'beam', x: 3850 + j(), w: 60, h: 26, passed: false },
      { kind: 'fence', x: 4150 + j(), w: 26, h: 88, passed: false },
      { kind: 'hay', x: 4450 + j(), w: 70, h: 64, passed: false },
    ],
    corn: [],
    golden: { x: GATE_X[1] - 60, y: GROUND_Y - 150, taken: false },
    decor: [
      { kind: 'barrel', x: 2600, y: GROUND_Y }, { kind: 'barrel', x: 4300, y: GROUND_Y },
      { kind: 'haystack', x: 3350, y: GROUND_Y }, { kind: 'lantern', x: 2900, y: GROUND_Y - 200 },
      { kind: 'lantern', x: 4100, y: GROUND_Y - 200 },
    ],
  };
  cornLine(barn.corn, 2500, 2650, GROUND_Y - 30, 4);
  cornArc(barn.corn, 3000, GROUND_Y - 210, 4);
  cornArc(barn.corn, 3550, GROUND_Y - 210, 4);
  cornLine(barn.corn, 3650, 3800, GROUND_Y - 30, 4);
  cornArc(barn.corn, 4150, GROUND_Y - 210, 4);
  cornArc(barn.corn, 4450, GROUND_Y - 210, 4);

  // ---- Zone 2: Farmhouse Kitchen ----
  const kitchen = {
    name: 'FARMHOUSE KITCHEN',
    startX: ZONE_LENGTH * 2, endX: 7200,
    obstacles: [
      { kind: 'crate', x: 5050 + j(), w: 60, h: 70, passed: false },
      { kind: 'beam', x: 5350 + j(), w: 60, h: 26, passed: false },
      { kind: 'mud', x: 5550 + j(), w: 160, h: 0, passed: false },
      { kind: 'hay', x: 6100 + j(), w: 70, h: 64, passed: false },
      { kind: 'fence', x: 6300 + j(), w: 26, h: 88, passed: false },
    ],
    corn: [],
    golden: { x: GATE_X[2] - 60, y: GROUND_Y - 150, taken: false },
    decor: [
      { kind: 'pot', x: 4950, y: GROUND_Y }, { kind: 'pot', x: 6500, y: GROUND_Y },
      { kind: 'pan', x: 5900, y: GROUND_Y - 180 }, { kind: 'pan', x: 6600, y: GROUND_Y - 180 },
    ],
  };
  cornArc(kitchen.corn, 5050, GROUND_Y - 210, 4);
  cornLine(kitchen.corn, 5150, 5300, GROUND_Y - 30, 4);
  cornArc(kitchen.corn, 6100, GROUND_Y - 210, 4);
  cornArc(kitchen.corn, 6300, GROUND_Y - 210, 4);
  cornLine(kitchen.corn, 6550, 6700, GROUND_Y - 30, 4);

  return {
    zones: [yard, barn, kitchen],
    // The oven stands at the back of the kitchen just before Gate 3; its
    // flame jet crosses the track at flameX on a 1.6 s cycle.
    oven: { x: 6680, w: 130, h: 150, flameX: 6745, flameW: 60 },
    knifeMarks: [5200, 5800, 6400, 6960],
    windowX: 7200,
  };
}
