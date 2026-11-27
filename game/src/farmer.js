// The farmer, side view: not a patroller with a cone — a chaser measured in
// one number, the gap behind the turkey. Clean running opens the gap; a
// stumble slams it shut; a gobble sends him fleeing. When the gap hits the
// catch line he grabs the turkey (a feather). He is drawn running behind the
// turkey whenever the gap fits on screen.
import {
  FARMER_GAP_CATCH, FARMER_GAP_CLOSE_SLOW, FARMER_GAP_FLEE,
  FARMER_GAP_MAX, FARMER_GAP_RECOVER, FARMER_GAP_START, FARMER_GAP_STUMBLE,
  FARMER_RADIUS,
} from './config.js';

export function createFarmer() {
  return {
    gap: FARMER_GAP_START, r: FARMER_RADIUS,
    state: 'CHASE', stateT: 0, dir: 1,
  };
}

// His world x is always the turkey's x minus the gap.
export function farmerX(farmer, turkeyX) {
  return turkeyX - farmer.gap;
}

// One step. `stumbling` is true while the turkey is tripped; `bellPanic` is
// true under 20 s on the bell. Returns true when he catches the turkey.
export function stepFarmer(farmer, dt, stumbling, bellPanic) {
  farmer.stateT += dt;
  const panicMul = bellPanic ? 2 : 1;
  if (farmer.state === 'FLEE') {
    farmer.gap += FARMER_GAP_FLEE * dt;
    if (farmer.gap > FARMER_GAP_MAX) farmer.gap = FARMER_GAP_MAX;
    if (farmer.stateT > 2) {
      farmer.state = 'CHASE';
      farmer.stateT = 0;
    }
    return false;
  }
  if (stumbling) {
    farmer.gap -= FARMER_GAP_CLOSE_SLOW * panicMul * dt;
  } else {
    farmer.gap += FARMER_GAP_RECOVER * dt;
  }
  if (farmer.gap > FARMER_GAP_MAX) farmer.gap = FARMER_GAP_MAX;
  return farmer.gap <= FARMER_GAP_CATCH;
}

// A stumble slams the gap shut by a fixed chunk.
export function farmerOnStumble(farmer) {
  farmer.gap -= FARMER_GAP_STUMBLE;
  if (farmer.gap < FARMER_GAP_CATCH + 4) farmer.gap = FARMER_GAP_CATCH + 4;
}

// A gobble scares him off for two seconds (8 s cooldown on the turkey).
export function scareFarmer(farmer) {
  if (farmer.state === 'CHASE') {
    farmer.state = 'FLEE';
    farmer.stateT = 0;
  }
}

// After a catch the turkey breaks free and the gap resets.
export function farmerResetGap(farmer) {
  farmer.gap = FARMER_GAP_START;
  farmer.state = 'CHASE';
  farmer.stateT = 0;
}
