// The screenshot scenes behind ?shot=chase|title|gate|escaped. Each one plays
// the real rules forward from a fresh world, steered by an autopilot, so every
// frame is what a real game looks like and the same seed always gives the
// same frame.
// - chase: the turkey mid-jump over a hay bale with the farmer close behind.
// - title: the yard at the start, five seconds in.
// - gate: Gate 3 (the dawn window) with the oven lit behind the turkey, a
//   carving knife falling in frame, and the fork prompt up.
// - escaped: a full run that takes the upper road at every gate.
import { GROUND_Y, OVEN_BURN, OVEN_CYCLE, OVEN_IGNITE, STEP } from './config.js';
import { EVENT_OVER, resetWorld, stepWorld } from './world.js';
import { gateDefinitions } from './gates.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const TITLE_SECONDS = 5;
const LIMIT_SECONDS = 600;

// The autopilot: jump what can be jumped, slide what must be slid under,
// gobble when the farmer is close, always take the upper road at a gate
// (the golden feather is there). It never stops running — the game runs it.
// `opts.gobble === false` turns the gobble off (the chase shot stages the
// farmer close behind, and a gobble would send him fleeing out of frame).
export function autopilot(state, opts = {}) {
  const t = state.turkey;
  const zone = state.track.zones[state.zone];
  let jump = false;
  let slide = false;
  // The next gate's jump starts 130 px before its line. A hazard that lies
  // past that point is cleared by the gate jump itself — jumping for it
  // early lands the turkey on the gate line and trips (the v2 gate-3 bug:
  // a jump for the stuck knife at 6900 landed on the 7000 line).
  const defs = gateDefinitions();
  let nextGateX = Infinity;
  for (let i = 0; i < defs.length; i += 1) {
    if (!state.gateDone[i] && defs[i].x > t.x) { nextGateX = defs[i].x; break; }
  }
  const gateJumpX = nextGateX - 130;
  const jumpable = (hx) => hx < gateJumpX;
  for (const o of zone.obstacles) {
    if (o.passed) continue;
    const d = o.x - t.x;
    if (d < -20 || d > 220) continue;
    if (o.kind === 'beam') {
      if (d < 130 && t.onGround) slide = true;
    } else if (o.kind !== 'mud') {
      if (d < 130 && t.onGround && jumpable(o.x)) jump = true;
    }
  }
  // A stuck knife is one more post to jump.
  for (const k of state.knives) {
    if (k.state === 'stuck' && !k.passed && k.x > t.x - 20 && k.x < t.x + 140 && t.onGround && jumpable(k.x)) jump = true;
  }
  // The oven flame: jump the column while it ignites or burns. The column
  // only counts while its centre is still ahead of the turkey — once the
  // turkey has run past the middle of it, jumping again is a wasted jump
  // that lands right on the next gate (the v2 gate-3 bug: a jump at 6810
  // landed on the gate line and tripped).
  if (state.zone === 2) {
    const fl = state.track.oven;
    const ph = state.ovenT % OVEN_CYCLE;
    const flameLive = ph < OVEN_IGNITE + OVEN_BURN;
    const columnAhead = fl.flameX + fl.flameW / 2 > t.x && fl.flameX < t.x + 140;
    if (flameLive && columnAhead && t.onGround && jumpable(fl.flameX)) jump = true;
  }
  // Gates: the upper road (jump) — the golden feather is there.
  for (let i = 0; i < defs.length; i += 1) {
    if (!state.gateDone[i] && defs[i].x > t.x && defs[i].x <= t.x + 130 && t.onGround) jump = true;
  }
  const gobble = opts.gobble !== false && state.farmer.gap < 90 && t.gobbleCd <= 0 && state.farmer.state === 'CHASE';
  return { jump, slide, gobble, gateUpper: false, gateLower: false };
}

function stepPilot(world, seconds, stopFn, pilotFn) {
  const pilot = pilotFn ?? ((s) => autopilot(s));
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    const events = stepWorld(world, STEP, pilot(world.state));
    if (stopFn && stopFn(world.state, events)) return true;
    if (events & EVENT_OVER) return true;
  }
  return false;
}

export function stageShot(name, world) {
  resetWorld(world);
  const s = world.state;
  if (name === 'title') {
    for (let i = 0; i < TITLE_SECONDS / STEP; i += 1) {
      stepWorld(world, STEP, { jump: false, slide: false, gobble: false, gateUpper: false, gateLower: false });
    }
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'chase') {
    // The farmer starts on the turkey's tail (gap 80) and the pilot never
    // gobbles — a gobble would send him fleeing out of the cover frame.
    // Freeze mid-jump over something, farmer still close behind.
    s.farmer.gap = 80;
    stepPilot(world, LIMIT_SECONDS, (st) => {
      const t = st.turkey;
      const zone = st.track.zones[st.zone];
      const overSomething = zone.obstacles.some((o) => !o.passed && Math.abs(o.x - t.x) < 60);
      return !t.onGround && t.y < GROUND_Y - 60 && overSomething && st.farmer.gap < 300;
    }, (st) => autopilot(st, { gobble: false }));
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'gate') {
    // Play to Gate 3 and freeze just before the line, while a knife is in
    // the frame — warning, falling or stuck, a blade is a blade — oven lit
    // behind, fork prompt up. Prefer freezing while the flame jet is
    // BURNING, so the oven's fire column is visible in the shot; fall back
    // to freezing at 6950 so the staging always lands before the line.
    stepPilot(world, LIMIT_SECONDS, (st) => {
      const t = st.turkey;
      if (t.x < 6840 || t.x >= 7000) return false;
      const ph = st.ovenT % OVEN_CYCLE;
      const burning = ph >= OVEN_IGNITE && ph < OVEN_IGNITE + OVEN_BURN;
      const knife = st.knives.some((k) => k.x > 6600 && k.x < 7150);
      return knife && (burning || t.x >= 6950);
    });
    return { screen: SCREEN_PLAY, best: 0 };
  }
  // escaped: the whole run, upper road at every gate.
  stepPilot(world, LIMIT_SECONDS, (st, events) => Boolean(events & EVENT_OVER));
  return { screen: s.escaped ? SCREEN_OVER : SCREEN_PLAY, best: s.score };
}
