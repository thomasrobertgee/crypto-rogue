/**
 * Pure economy engine — no React/Zustand/DOM. Deterministic given an injected RNG.
 */
import type { GachaBannerConfig, OwnedCoin, Rarity } from '../types/game.types'
import { COINS, COIN_MAP, RARITY_ORDER, RARITY_DAMAGE_MULTIPLIER } from '../config/coins.config'
import { RELICS } from '../config/relics.config'
import {
  FUSION_REQUIRED_COPIES, IDLE_RIG_HASHRATE_PER_HOUR, IDLE_SHARD_HOURS, LEVEL_DAMAGE_BONUS,
} from '../config/economy.config'

export type Rng = () => number

export const makeId = (prefix = 'id'): string =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export const rarityIndex = (r: Rarity): number => RARITY_ORDER.indexOf(r)
export const nextRarity = (r: Rarity): Rarity | null => RARITY_ORDER[rarityIndex(r) + 1] ?? null

export function weightedPick<T>(items: readonly T[], weight: (t: T) => number, rng: Rng = Math.random): T {
  const total = items.reduce((s, i) => s + weight(i), 0)
  let roll = rng() * total
  for (const it of items) {
    roll -= weight(it)
    if (roll < 0) return it
  }
  return items[items.length - 1]
}

// ───────────────────────── Gacha ─────────────────────────
export type PityState = Partial<Record<Rarity, number>>

/** Rolls one rarity from a banner, applying pity. Counters count pulls since last hit of >= that rarity. */
export function rollBannerRarity(
  banner: GachaBannerConfig, pity: PityState, rng: Rng = Math.random,
): { rarity: Rarity; pity: PityState } {
  let forced: Rarity | null = null
  for (const rule of banner.pity) {
    if ((pity[rule.rarity] ?? 0) + 1 >= rule.pulls && (!forced || rarityIndex(rule.rarity) > rarityIndex(forced))) {
      forced = rule.rarity
    }
  }
  let rarity: Rarity
  if (forced) {
    const min = rarityIndex(forced)
    const eligible = banner.pool.filter((p) => rarityIndex(p.rarity) >= min)
    rarity = eligible.length ? weightedPick(eligible, (p) => p.weight, rng).rarity : forced
  } else {
    rarity = weightedPick(banner.pool, (p) => p.weight, rng).rarity
  }
  const next: PityState = { ...pity }
  for (const rule of banner.pity) {
    next[rule.rarity] = rarityIndex(rarity) >= rarityIndex(rule.rarity) ? 0 : (pity[rule.rarity] ?? 0) + 1
  }
  return { rarity, pity: next }
}

/** Picks an item of the given rarity; falls back to the nearest lower, then higher, rarity with content. */
export function pickByRarity<T extends { rarity: Rarity }>(list: readonly T[], rarity: Rarity, rng: Rng = Math.random): T {
  const idx = rarityIndex(rarity)
  const order = [
    ...RARITY_ORDER.slice(0, idx + 1).reverse(),
    ...RARITY_ORDER.slice(idx + 1),
  ]
  for (const r of order) {
    const matches = list.filter((i) => i.rarity === r)
    if (matches.length) return matches[Math.floor(rng() * matches.length)]
  }
  throw new Error('pickByRarity: empty list')
}

export const pickCoinId = (rarity: Rarity, rng?: Rng): string => pickByRarity(COINS, rarity, rng).id
export const pickRelicId = (rarity: Rarity, rng?: Rng): string => pickByRarity(RELICS, rarity, rng).id

// ───────────────────────── Inventory ─────────────────────────
/** Adds `qty` copies of coinId at a rarity tier (stacking). Immutable. */
export function addCoins(coins: OwnedCoin[], coinId: string, rarity: Rarity, qty = 1, level = 1): OwnedCoin[] {
  const existing = coins.find((c) => c.coinId === coinId && c.rarity === rarity)
  if (existing) return coins.map((c) => (c === existing ? { ...c, count: c.count + qty } : c))
  return [...coins, { id: makeId('coin'), coinId, rarity, level, count: qty, acquiredAt: Date.now() }]
}

/** One 3-to-1 Hard Fork. Returns null if not possible. Result tier inherits the higher of source/target level. */
export function fuseOnce(coins: OwnedCoin[], coinId: string, rarity: Rarity): OwnedCoin[] | null {
  const src = coins.find((c) => c.coinId === coinId && c.rarity === rarity)
  const target = nextRarity(rarity)
  if (!src || !target || src.count < FUSION_REQUIRED_COPIES) return null
  let out = coins.map((c) => (c === src ? { ...c, count: c.count - FUSION_REQUIRED_COPIES } : c))
  out = addCoins(out, coinId, target, 1, src.level)
  out = out.map((c) => (c.coinId === coinId && c.rarity === target ? { ...c, level: Math.max(c.level, src.level) } : c))
  return out
}

/** Repeatedly fuses everything possible, lowest tiers first (so cascades happen). */
export function fuseAll(coins: OwnedCoin[]): { coins: OwnedCoin[]; fusions: number } {
  let out = coins
  let fusions = 0
  for (const rarity of RARITY_ORDER) {
    for (const coinId of new Set(out.filter((c) => c.rarity === rarity).map((c) => c.coinId))) {
      let next = fuseOnce(out, coinId, rarity)
      while (next) {
        out = next
        fusions++
        next = fuseOnce(out, coinId, rarity)
      }
    }
  }
  return { coins: out, fusions }
}

/** Removes empty stacks; returns ids that were removed. */
export function pruneEmpty(coins: OwnedCoin[]): { coins: OwnedCoin[]; removed: string[] } {
  const removed = coins.filter((c) => c.count <= 0).map((c) => c.id)
  return { coins: coins.filter((c) => c.count > 0), removed }
}

// ───────────────────────── Mastery & Damage ─────────────────────────
/** Global Portfolio Yield multiplier: 1 + Σ (level-1) × per-coin mastery bonus, across ALL owned coins. */
export function computeGlobalYield(coins: OwnedCoin[]): number {
  return 1 + coins.reduce((s, c) => s + (c.level - 1) * (COIN_MAP[c.coinId]?.globalMasteryBonusPerLevel ?? 0.02), 0)
}

/** Direct damage multiplier for a coin from its level, rarity tier, and fusion tier. */
export function coinDamageMultiplier(coin: Pick<OwnedCoin, 'level' | 'rarity' | 'coinId'>): number {
  const base = COIN_MAP[coin.coinId]
  const rarityMult = RARITY_DAMAGE_MULTIPLIER[coin.rarity] ?? 1.0
  const tierBonus = base ? Math.max(0, rarityIndex(coin.rarity) - rarityIndex(base.rarity)) * 0.5 : 0
  return rarityMult * (1 + (coin.level - 1) * LEVEL_DAMAGE_BONUS) * (1 + tierBonus)
}

// ───────────────────────── Idle Mining ─────────────────────────
export function computeIdleReward(lastClaim: number, now: number, capHours: number, yieldMult: number) {
  const seconds = Math.max(0, Math.min((now - lastClaim) / 1000, capHours * 3600))
  const hours = seconds / 3600
  return {
    seconds,
    hashrate: Math.floor(hours * IDLE_RIG_HASHRATE_PER_HOUR * yieldMult),
    shards: Math.floor(hours / IDLE_SHARD_HOURS),
  }
}
