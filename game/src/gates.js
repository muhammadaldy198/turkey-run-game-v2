// The three gates — v2's replacement for v1's decision panels. There is no
// pause, no panel, no countdown: the track forks, and the choice IS the move.
// At each gate the turkey meets a high beam (jump it: the upper route, the
// golden feather, +25) and a low tunnel (slide under it: the lower route,
// more corn, +10). Jump or slide while crossing the gate line and the choice
// is made; do neither and the turkey trips on the gate post (a stumble, and
// the lower route by default). Keys 1 / 2 pick a route directly.
import { GATE_BONUS_LOWER, GATE_BONUS_UPPER, GATE_NAMES, ZONE_LENGTH } from './config.js';

export const GATE_X = [ZONE_LENGTH, ZONE_LENGTH * 2, 7000];

export function gateDefinitions() {
  return GATE_NAMES.map((name, i) => ({
    name,
    x: GATE_X[i],
    upper: { key: '1', name: 'JUMP THE BEAM', hint: 'High road — golden feather, +25' },
    lower: { key: '2', name: 'SLIDE UNDER', hint: 'Low road — corn line, +10' },
  }));
}

// The gate the turkey is approaching (within 320 px), or null.
export function approachingGate(state) {
  const defs = gateDefinitions();
  for (let i = 0; i < defs.length; i += 1) {
    if (!state.gateDone[i] && state.turkey.x > defs[i].x - 320 && state.turkey.x < defs[i].x) {
      return { index: i, def: defs[i], dist: defs[i].x - state.turkey.x };
    }
  }
  return null;
}

// Resolve a gate crossing. `how` is 'upper', 'lower' or 'trip'. Returns the
// choice name for the log; the world records it and pays the bonus.
export function resolveGate(state, index, how) {
  const def = gateDefinitions()[index];
  state.gateDone[index] = true;
  state.gateChoices[index] = how;
  if (how === 'upper') {
    state.bonus += GATE_BONUS_UPPER;
    return def.upper.name;
  }
  state.bonus += GATE_BONUS_LOWER;
  return def.lower.name;
}
