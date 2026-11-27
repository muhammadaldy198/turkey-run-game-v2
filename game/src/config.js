// Constants for GOBBLE OR GONE v2 — ROMBAK TOTAL (Alday 27 Nov 18:42).
// v1 was a top-down stealth game (farmer FSM, vision cone, decision panels).
// v2 is a side-view runner: the turkey runs itself to the right, the player
// jumps and slides, and the farmer chases from behind — a different game in
// every screenshot. The field is one long track (7200 px, three zones); the
// camera follows the turkey with the turkey fixed at screen x = 360.
export const W = 1280;
export const H = 720;
export const STEP = 1 / 60;
export const BELL_SECONDS = 120;
export const FEATHERS = 3;
export const BEST_KEY = 'gobble-or-gone-best';
export const ZONE_NAMES = ['MAPLE FARM YARD', 'OLD BARN', 'FARMHOUSE KITCHEN'];
export const GATE_NAMES = ['THE FARM GATE', 'THE BARN DOOR', 'THE DAWN WINDOW'];
export const TRACK_LENGTH = 7200;
export const ZONE_LENGTH = 2400;

// The ground the turkey runs on; the turkey's feet rest on it.
export const GROUND_Y = 620;
export const TURKEY_X_SCREEN = 360;
// Turkey: auto-runs right; jump arcs ~225 px (the arc must clear a 70 px
// hay plus the turkey's own 44 px width — the first jump, 140 px, clipped
// every hay's top corner); a slide lasts 0.55 s and halves the hitbox.
// Stumble = 0.6 s at speed 0; mud = 40% slow while inside it.
export const RUN_SPEED = 280;
export const GRAVITY = 2000;
export const JUMP_VY = -950;
export const SLIDE_TIME = 0.55;
export const STUMBLE_TIME = 0.6;
export const TURKEY_RADIUS = 22;
export const TURKEY_HEIGHT = 46;
export const TURKEY_HEIGHT_SLIDE = 22;
// Farmer: a gap behind the turkey, not a patroller. Clean running lets the
// gap grow (25 px/s, max 320); a stumble slams it shut by 60 px and it keeps
// closing at 80 px/s while the turkey is slow. Gap <= 30 = caught (a
// feather). Under 20 s on the bell he closes twice as fast. Two quick
// stumbles cost a feather; one does not.
export const FARMER_GAP_START = 220;
export const FARMER_GAP_MAX = 320;
export const FARMER_GAP_CATCH = 30;
export const FARMER_GAP_STUMBLE = 60;
export const FARMER_GAP_RECOVER = 25;
export const FARMER_GAP_CLOSE_SLOW = 80;
export const FARMER_GAP_FLEE = 220;
export const FARMER_RADIUS = 24;
// Kitchen: a knife is telegraphed 0.7 s, then falls at 900 px/s. The oven
// breathes fire on a 1.6 s cycle: 0.5 s IGNITE (a small flicker, harmless —
// the warning), 0.8 s BURN (the full column, 90 px high, harmful), 0.3 s
// REST. The ignite phase is what makes the flame fair: the turkey can be
// standing inside the column when it lights and still jump clear before the
// burn starts.
export const KNIFE_WARN = 0.7;
export const KNIFE_SPEED = 900;
export const OVEN_CYCLE = 1.6;
export const OVEN_IGNITE = 0.5;
export const OVEN_BURN = 0.8;
export const OVEN_FLAME_H = 90;
// Score: corn is 10 a cob, distance is 1 a metre, a golden feather is 40, a
// gate choice pays 25 (upper) or 10 (lower), the clock pays 5 a second left
// when the turkey escapes (escapeBonus — wired into the total and shown on
// the end screen).
export const CORN_POINTS = 10;
export const GOLDEN_BONUS = 40;
export const GATE_BONUS_UPPER = 25;
export const GATE_BONUS_LOWER = 10;
export const TIME_BONUS_PER_SECOND = 5;
export const METRES_PER_PX = 1 / 16;
