// Tiny WebAudio synth: every sound is drawn from oscillators, no audio files.
// The bell is the dinner bell; the gobble scares the farmer; the knife is a
// falling whistle that ends in a thunk when it sticks in the floor.
export function createAudio() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, gain, slideTo) {
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(g).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }
  return {
    unlock() {
      ensure();
    },
    gobble() {
      tone(320, 0.09, 'square', 0.12, 180);
      setTimeout(() => tone(280, 0.09, 'square', 0.12, 150), 90);
      setTimeout(() => tone(360, 0.12, 'square', 0.12, 200), 190);
    },
    bell() {
      tone(660, 0.9, 'sine', 0.2);
      tone(990, 0.7, 'sine', 0.1);
    },
    catch() {
      tone(160, 0.35, 'sawtooth', 0.18, 60);
    },
    escape() {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.14), i * 110));
    },
    knife() {
      tone(1400, 0.28, 'sine', 0.05, 300);
    },
    thunk() {
      tone(90, 0.12, 'triangle', 0.22, 45);
    },
    pickup() {
      tone(880, 0.08, 'triangle', 0.1, 1320);
    },
    golden() {
      [1047, 1319, 1568].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.12), i * 70));
    },
  };
}
