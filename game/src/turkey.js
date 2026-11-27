// The turkey, side view: it runs itself to the right and the player only
// jumps and slides. x is the world position (the camera follows it); y is the
// feet. onGround, vy, slideT, stumbleT, invulnT and gobbleCd are the whole
// physical state — no steering, no hiding, no vision cone anywhere.
import { GRAVITY, GROUND_Y, JUMP_VY, SLIDE_TIME, STUMBLE_TIME, TURKEY_RADIUS } from './config.js';

export function createTurkey(x) {
  return {
    x, y: GROUND_Y, vy: 0, r: TURKEY_RADIUS,
    onGround: true, sliding: false, slideT: 0,
    stumbleT: 0, invulnT: 0, gobbleCd: 0, dir: 1, moving: true,
  };
}

// One step. `speed` is the run speed the world computed (0 while stumbling,
// 40% in mud); `input` is {jump, slide, gobble}. Returns the px actually run.
export function stepTurkey(t, input, dt, speed) {
  if (t.stumbleT > 0) t.stumbleT -= dt;
  if (t.invulnT > 0) t.invulnT -= dt;
  if (t.gobbleCd > 0) t.gobbleCd -= dt;
  if (t.slideT > 0) {
    t.slideT -= dt;
    if (t.slideT <= 0) t.sliding = false;
  }
  if (input.jump && t.onGround && t.stumbleT <= 0) {
    t.vy = JUMP_VY;
    t.onGround = false;
    t.sliding = false;
    t.slideT = 0;
  }
  if (input.slide && t.onGround && t.stumbleT <= 0) {
    t.sliding = true;
    t.slideT = SLIDE_TIME;
  }
  t.vy += GRAVITY * dt;
  t.y += t.vy * dt;
  if (t.y >= GROUND_Y) {
    t.y = GROUND_Y;
    t.vy = 0;
    t.onGround = true;
  }
  const moved = speed * dt;
  t.x += moved;
  t.moving = speed > 0;
  return moved;
}

// A stumble: the turkey trips, loses all speed for STUMBLE_TIME, and the
// farmer closes in. The obstacle that caused it is marked passed by the world.
export function stumbleTurkey(t) {
  if (t.invulnT > 0) return false;
  t.stumbleT = STUMBLE_TIME;
  t.sliding = false;
  t.slideT = 0;
  return true;
}

// The hitbox: standing 46 px tall, sliding 22 px. x is the centre.
export function turkeyBox(t) {
  const h = t.sliding ? 22 : 46;
  return { x: t.x - t.r, y: t.y - h, w: t.r * 2, h };
}
