// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between four screens: title, play, paused and over.
//
// ?seed=N fixes the track. ?shot=chase|title|gate|escaped (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
//
// v2 is a side-view runner: the turkey runs itself right, Space / Up jumps,
// Down slides, G gobbles, 1 / 2 pick a gate route.
import { BEST_KEY, STEP } from './config.js';
import { createWorld, resetWorld, stepWorld, EVENT_OVER, EVENT_HIT, EVENT_PICKUP, EVENT_GOLDEN, EVENT_GATE } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_GATE_1, ACTION_GATE_2, ACTION_GOBBLE, ACTION_JUMP, createInput } from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(seed);
const renderer = createRenderer(canvas);
const audio = createAudio();
let clock = 0;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, clock);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  // Read-only debug hook for the automated playtest (position, screen, gap).
  window.__dbgPos = () => ({
    x: world.state.turkey.x, y: world.state.turkey.y, screen,
    gap: world.state.farmer.gap, score: world.state.score,
    feathers: world.state.feathers, sliding: world.state.turkey.sliding,
  });

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    audio.unlock();
    resetWorld(world);
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Running! 3 feathers, 120 seconds. Jump the hay, slide the beams, reach the dawn window.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    if (world.state.escaped) audio.escape();
    announce(world.state.escaped
      ? `Escaped! Score ${world.state.score}. Best ${best}.`
      : `Caught. ${world.state.endReason} Score ${world.state.score}.`);
  }

  // One action set per frame, read once and shared by the handler and the steps.
  function handleActions(actions) {
    if (actions & ACTION_GOBBLE) audio.unlock();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function step(actions) {
    const s = world.state;
    if (screen !== SCREEN_PLAY) return;
    const events = stepWorld(world, STEP, {
      jump: Boolean(actions & ACTION_JUMP),
      slide: input.sliding(),
      gobble: Boolean(actions & ACTION_GOBBLE),
      gateUpper: Boolean(actions & ACTION_GATE_1),
      gateLower: Boolean(actions & ACTION_GATE_2),
    });
    if (events & EVENT_HIT) {
      audio.catch();
      announce(s.feathers > 0 ? `Tripped! The farmer is closing in — ${s.feathers} feather${s.feathers === 1 ? '' : 's'} left.` : 'Caught!');
    }
    if (events & EVENT_PICKUP) audio.pickup();
    if (events & EVENT_GOLDEN) audio.golden();
    if (events & EVENT_GATE) {
      let gi = -1;
      s.gateChoices.forEach((c, i) => { if (c !== null) gi = i; });
      if (gi >= 0) {
        announce(`Gate ${gi + 1}: ${s.gateChoices[gi] === 'upper' ? 'jumped the beam' : 'slid under'} — ${s.objective}`);
      }
    }
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    clock += dt;
    let actions = input.takeActions();
    handleActions(actions);
    if (screen === SCREEN_PLAY) {
      accumulator += dt;
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step(actions);
        accumulator -= STEP;
        // An edge (jump / gobble / gate key) fires once, not every sub-step.
        actions &= ~(ACTION_JUMP | ACTION_GOBBLE | ACTION_GATE_1 | ACTION_GATE_2);
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, clock);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Gobble or Gone. Press Space or click to run.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
