// Keyboard + mouse input for the runner. Jump and gobble are edges (one per
// key press — key auto-repeat is ignored); slide is held; 1 / 2 pick a gate
// route. Space is both "jump" and "confirm": the loop uses it as confirm on
// the title and end screens, as jump while playing.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_GATE_1 = 4;
export const ACTION_GATE_2 = 8;
export const ACTION_GOBBLE = 16;
export const ACTION_JUMP = 32;

const KEYS = {
  Space: ACTION_JUMP | ACTION_CONFIRM,
  Enter: ACTION_CONFIRM,
  ArrowUp: ACTION_JUMP,
  KeyW: ACTION_JUMP,
  KeyP: ACTION_PAUSE,
  Escape: ACTION_PAUSE,
  Digit1: ACTION_GATE_1,
  Numpad1: ACTION_GATE_1,
  Digit2: ACTION_GATE_2,
  Numpad2: ACTION_GATE_2,
  KeyG: ACTION_GOBBLE,
};

const SLIDE_KEYS = new Set(['ArrowDown', 'KeyS']);

export function createInput(canvas) {
  const held = new Set();
  let queued = 0;
  let confirmEdge = false;

  function onDown(event) {
    if (event.repeat) return;
    const action = KEYS[event.code];
    if (action !== undefined) {
      queued |= action;
      event.preventDefault();
    }
    held.add(event.code);
    if (SLIDE_KEYS.has(event.code) || event.code.startsWith('Arrow')) event.preventDefault();
  }
  function onUp(event) {
    held.delete(event.code);
  }
  function onClick() {
    confirmEdge = true;
    queued |= ACTION_JUMP;
  }
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  canvas.addEventListener('pointerdown', onClick);

  return {
    // Held: is the player sliding right now?
    sliding() {
      for (const k of SLIDE_KEYS) if (held.has(k)) return true;
      return false;
    },
    takeActions() {
      const out = queued | (confirmEdge ? ACTION_CONFIRM : 0);
      queued = 0;
      confirmEdge = false;
      return out;
    },
  };
}
