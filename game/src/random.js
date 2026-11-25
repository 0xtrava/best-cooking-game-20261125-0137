// A tiny seeded random number generator (mulberry32) so a seed always deals the
// same orders: the same ?seed=N always plays the same kitchen.

/** A generator from a 32-bit seed. */
export function createRandom(seed) {
  let a = seed >>> 0;
  return {
    /** The next float in [0, 1). */
    next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    /** An integer in [min, max). */
    int(min, max) {
      return min + Math.floor(this.next() * (max - min));
    },
    /** One element of `list`, uniformly. */
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
    /** A shuffled copy of `list`. */
    shuffle(list) {
      const out = list.slice();
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(this.next() * (i + 1));
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    },
  };
}
