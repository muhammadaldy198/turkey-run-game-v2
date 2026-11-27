// Seedable RNG (mulberry32): the same seed always deals the same farm, so the
// autopilot's screenshots and the grader's replays are deterministic.
export function createRandom(seed) {
  let a = seed >>> 0;
  return {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(lo, hi) {
      return lo + this.next() * (hi - lo);
    },
    int(lo, hi) {
      return Math.floor(this.range(lo, hi + 1));
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
  };
}
