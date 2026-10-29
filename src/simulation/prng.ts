/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Ensures 100% reproducible Monte Carlo simulation runs across runs and workers.
 */

export interface PRNG {
  /** Returns a pseudo-random float in [0, 1) */
  next(): number
  /** Returns a pseudo-random float in [min, max) */
  range(min: number, max: number): number
  /** Returns a pseudo-random integer in [min, max] inclusive */
  rangeInt(min: number, max: number): number
  /** Returns true with probability p (defaults to 0.5) */
  boolean(prob?: number): boolean
  /** Returns a random element from an array */
  choice<T>(arr: T[]): T
  /** Shuffles an array in-place using Fisher-Yates and returns it */
  shuffle<T>(arr: T[]): T[]
  /** Returns the initial seed */
  getSeed(): number
}

/**
 * Creates a deterministic Mulberry32 generator from a numeric seed.
 */
export function createPRNG(initialSeed: number): PRNG {
  let s = Math.floor(Math.abs(initialSeed)) || 1337

  const next = (): number => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    range(min: number, max: number): number {
      return min + next() * (max - min)
    },
    rangeInt(min: number, max: number): number {
      const low = Math.ceil(min)
      const high = Math.floor(max)
      return Math.floor(low + next() * (high - low + 1))
    },
    boolean(prob: number = 0.5): boolean {
      return next() < prob
    },
    choice<T>(arr: T[]): T {
      if (!arr.length) throw new Error('Cannot pick from empty array')
      const idx = Math.floor(next() * arr.length)
      return arr[idx]
    },
    shuffle<T>(arr: T[]): T[] {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        const temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
      }
      return arr
    },
    getSeed(): number {
      return initialSeed
    },
  }
}

/**
 * Generates a clean random 6-digit seed integer (100000 - 999999).
 */
export function generateSeed(): number {
  return Math.floor(100000 + Math.random() * 900000)
}
