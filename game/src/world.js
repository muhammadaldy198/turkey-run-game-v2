// The step loop: one fixed step advances the bell, the turkey, the farmer,
// the oven, the knives and the gates. Pure logic — no canvas, no DOM — so the
// same code runs in the browser and in Node for the headless staging checks.
// v2 is a runner, not v1's stealth game: there is no vision cone, no hiding,
// no decision panel. The turkey runs itself; the player jumps and slides.
import {
  BELL_SECONDS, CORN_POINTS, FEATHERS, GROUND_Y, KNIFE_SPEED, KNIFE_WARN,
  METRES_PER_PX, OVEN_BURN, OVEN_CYCLE, OVEN_FLAME_H, OVEN_IGNITE, RUN_SPEED, STEP,
  TIME_BONUS_PER_SECOND, TRACK_LENGTH, ZONE_LENGTH,
} from './config.js';
import { createRandom } from './random.js';
import { createTurkey, stepTurkey, stumbleTurkey, turkeyBox } from './turkey.js';
import { createFarmer, farmerOnStumble, farmerResetGap, farmerX, scareFarmer, stepFarmer } from './farmer.js';
import { buildTrack } from './stages.js';
import { approachingGate, gateDefinitions, resolveGate } from './gates.js';

export const EVENT_HIT = 1;
export const EVENT_OVER = 2;
export const EVENT_ESCAPED = 4;
export const EVENT_CAUGHT = 8;
export const EVENT_PICKUP = 32;
export const EVENT_GOLDEN = 64;
export const EVENT_GATE = 128;

const OBJECTIVES = [
  'Run! Jump the hay, mind the mud — the farmer is right behind you',
  'Slide the beams, jump the crates — the barn is no safer',
  'Dodge the oven and the carving knife — run for the dawn window',
];

export function createWorld(seed) {
  const rng = createRandom(seed);
  const world = { seed, rng, state: null };
  resetWorld(world);
  return world;
}

export function resetWorld(world) {
  const track = buildTrack(world.rng);
  world.state = {
    track, zone: 0, objective: OBJECTIVES[0],
    turkey: createTurkey(60),
    farmer: createFarmer(),
    time: 0, timeLeft: BELL_SECONDS,
    score: 0, corn: 0, bonus: 0, dist: 0, distBonus: 0,
    feathers: FEATHERS, golden: 0,
    gateDone: [false, false, false], gateChoices: [null, null, null],
    knives: [], knifeT: 2.0, ovenT: 0,
    runForWindow: false, escaped: false, caught: false,
    endReason: '', escapeBonus: 0, best: 0,
  };
}

function zoneOf(state) {
  return Math.min(2, Math.floor(state.turkey.x / ZONE_LENGTH));
}

function currentZone(state) {
  return state.track.zones[zoneOf(state)];
}

function loseFeather(world, why) {
  const s = world.state;
  if (s.turkey.invulnT > 0 || s.escaped || s.caught) return EVENT_HIT;
  s.feathers -= 1;
  s.turkey.invulnT = 2;
  farmerResetGap(s.farmer);
  if (s.feathers <= 0) {
    s.caught = true;
    s.endReason = why;
    return EVENT_HIT | EVENT_OVER | EVENT_CAUGHT;
  }
  return EVENT_HIT;
}

function recomputeScore(s) {
  s.score = s.corn * CORN_POINTS + s.bonus + Math.floor(s.dist) + s.distBonus
    + (s.escaped ? s.escapeBonus : 0);
}

// One fixed step. `input` is {jump, slide, gobble, gateUpper, gateLower}.
// Returns an event bitmask.
export function stepWorld(world, dt, input) {
  const s = world.state;
  if (s.escaped || s.caught) return 0;
  let events = 0;
  const t = s.turkey;

  // The bell never stops.
  s.time += dt;
  s.timeLeft -= dt;
  if (s.timeLeft <= 0) {
    s.timeLeft = 0;
    s.caught = true;
    s.endReason = 'The dinner bell rang — the turkey is dinner.';
    return EVENT_OVER | EVENT_CAUGHT;
  }
  const bellPanic = s.timeLeft <= 20;
  s.ovenT += dt;

  // Gobble scares the farmer off (8 s cooldown on the turkey).
  const jump = input.jump || input.gateUpper;
  const slide = input.slide || input.gateLower;
  if (input.gobble && t.gobbleCd <= 0) {
    t.gobbleCd = 8;
    scareFarmer(s.farmer);
  }

  // Speed: 0 while tripped, 40% in mud.
  const zone = currentZone(s);
  const inMud = zone.obstacles.some((o) => o.kind === 'mud' && t.x > o.x - 10 && t.x < o.x + o.w + 10 && t.onGround);
  let speed = RUN_SPEED;
  if (t.stumbleT > 0) speed = 0;
  else if (inMud) speed = RUN_SPEED * 0.6;

  // Move.
  const prevX = t.x;
  const movedPx = stepTurkey(t, { jump, slide, gobble: false }, dt, speed);
  s.dist += movedPx * METRES_PER_PX;

  // Obstacles: jump them, slide under the beams, or trip.
  const box = turkeyBox(t);
  for (const o of zone.obstacles) {
    if (o.passed || o.kind === 'mud') continue;
    if (t.x + t.r < o.x - 4 || t.x - t.r > o.x + o.w + 4) continue;
    if (o.kind === 'beam') {
      // The beam hangs at head height: sliding passes under it, jumping over
      // it works too — only a standing turkey trips on it.
      const beam = { x: o.x, y: GROUND_Y - 66, w: o.w, h: 26 };
      const hit = box.x < beam.x + beam.w && box.x + box.w > beam.x
        && box.y < beam.y + beam.h && box.y + box.h > beam.y;
      if (hit) {
        if (stumbleTurkey(t)) {
          farmerOnStumble(s.farmer);
          events |= EVENT_HIT;
        }
        o.passed = true;
      } else if (t.x - t.r > o.x + o.w) {
        o.passed = true;
      }
      continue;
    }
    const solid = { x: o.x, y: GROUND_Y - o.h, w: o.w, h: o.h };
    const hit = box.x < solid.x + solid.w && box.x + box.w > solid.x
      && box.y < solid.y + solid.h && box.y + box.h > solid.y;
    if (hit) {
      if (stumbleTurkey(t)) {
        farmerOnStumble(s.farmer);
        events |= EVENT_HIT;
      }
      o.passed = true;
    } else if (t.x - t.r > o.x + o.w) {
      o.passed = true;
    }
  }

  // The oven breathes fire across the track: 0.5 s ignite (a flicker, no
  // damage — the warning), then 0.8 s burn (the full column). Jump the column
  // while it burns, or run through while it rests — and a turkey standing
  // inside the column when it lights can still jump clear during the ignite.
  const phase = s.ovenT % OVEN_CYCLE;
  const burning = phase >= OVEN_IGNITE && phase < OVEN_IGNITE + OVEN_BURN;
  if (s.zone === 2 && burning) {
    const fl = s.track.oven;
    const flame = { x: fl.flameX, y: GROUND_Y - OVEN_FLAME_H, w: fl.flameW, h: OVEN_FLAME_H };
    const hit = box.x < flame.x + flame.w && box.x + box.w > flame.x
      && box.y < flame.y + flame.h && box.y + box.h > flame.y;
    if (hit && stumbleTurkey(t)) {
      farmerOnStumble(s.farmer);
      events |= EVENT_HIT;
    }
  }

  // Falling carving knives, kitchen only: a mark flashes 0.7 s, the knife
  // falls, then it sticks in the ground as one more thing to jump.
  if (s.zone === 2) stepKnives(world, dt, t);
  for (const k of s.knives) {
    if (k.state !== 'stuck' || k.passed) continue;
    if (t.x + t.r < k.x - 10 || t.x - t.r > k.x + 10) continue;
    const solid = { x: k.x - 8, y: GROUND_Y - 60, w: 16, h: 60 };
    const hit = box.x < solid.x + solid.w && box.x + box.w > solid.x
      && box.y < solid.y + solid.h && box.y + box.h > solid.y;
    if (hit) {
      if (stumbleTurkey(t)) {
        farmerOnStumble(s.farmer);
        events |= EVENT_HIT;
      }
      k.passed = true;
    } else if (t.x - t.r > k.x + 10) {
      k.passed = true;
    }
  }

  // Pickups: corn, golden feathers.
  for (const c of zone.corn) {
    if (!c.taken && Math.abs(t.x - c.x) < 30 && Math.abs(t.y - c.y) < 42) {
      c.taken = true;
      s.corn += 1;
      events |= EVENT_PICKUP;
    }
  }
  const g = zone.golden;
  if (!g.taken && Math.abs(t.x - g.x) < 40 && Math.abs(t.y - g.y) < 46) {
    g.taken = true;
    s.golden += 1;
    s.bonus += 40;
    events |= EVENT_GOLDEN;
  }

  // Gates: the track forks, the move is the choice. Jumping the beam is the
  // upper road; sliding under it is the lower road; neither is a trip.
  const defs = gateDefinitions();
  for (let i = 0; i < defs.length; i += 1) {
    if (s.gateDone[i]) continue;
    if (prevX < defs[i].x && t.x >= defs[i].x) {
      let how = 'lower';
      if (!t.onGround && t.y < GROUND_Y - 96) how = 'upper';
      else if (t.sliding) how = 'lower';
      else {
        if (stumbleTurkey(t)) {
          farmerOnStumble(s.farmer);
          events |= EVENT_HIT;
        }
      }
      resolveGate(s, i, how);
      events |= EVENT_GATE;
    }
  }

  // The farmer hunts: a catch costs a feather, not the run.
  const stumbling = t.stumbleT > 0;
  if (stepFarmer(s.farmer, dt, stumbling, bellPanic)) {
    events |= loseFeather(world, 'The farmer caught the turkey.');
    if (s.caught) return events;
  }

  // Zone + objective follow the turkey.
  const newZone = zoneOf(s);
  if (newZone !== s.zone) {
    s.zone = newZone;
    s.objective = OBJECTIVES[newZone];
  }

  // The dawn window at the end of the track.
  if (t.x >= TRACK_LENGTH) {
    s.escaped = true;
    s.endReason = 'Out the window, into the dawn woods.';
    s.escapeBonus = Math.ceil(s.timeLeft) * TIME_BONUS_PER_SECOND;
    recomputeScore(s);
    return events | EVENT_OVER | EVENT_ESCAPED;
  }

  recomputeScore(s);
  return events;
}

function stepKnives(world, dt, t) {
  const s = world.state;
  s.knifeT -= dt;
  if (s.knifeT <= 0) {
    s.knifeT = 2.2;
    // The next mark a good 200 px ahead — and never twice on the same mark
    // (a slow turkey can outwait the timer and double-spawn one spot).
    const mark = s.track.knifeMarks.find((m) => m > t.x + 200 && !s.knives.some((k) => k.x === m));
    if (mark !== undefined) {
      s.knives.push({ x: mark, y: 96, vy: KNIFE_SPEED, state: 'warn', t: 0, passed: false });
    }
  }
  for (const k of s.knives) {
    k.t += dt;
    if (k.state === 'warn') {
      if (k.t >= KNIFE_WARN) {
        k.state = 'falling';
        k.t = 0;
      }
    } else if (k.state === 'falling') {
      k.y += k.vy * dt;
      if (k.y >= GROUND_Y - 30) {
        k.y = GROUND_Y - 30;
        k.state = 'stuck';
        k.t = 0;
      } else if (Math.abs(k.x - t.x) < 22 && Math.abs(k.y - t.y) < 40 && t.invulnT <= 0) {
        // The blade came down on the turkey.
        k.state = 'stuck';
        k.y = GROUND_Y - 30;
        k.t = 0;
        if (stumbleTurkey(t)) {
          farmerOnStumble(world.state.farmer);
        }
      }
    }
  }
  s.knives = s.knives.filter((k) => k.t < 6);
}

// The gate the turkey is running toward (for the prompt banner + the shot).
export function gateAhead(state) {
  return approachingGate(state);
}

export { STEP };
export { farmerX };
