/**
 * Pure combat simulation. No React/DOM. Mutable SimState stepped by a fixed sub-step loop.
 * Interprets data-driven EffectSpecs from coin passives, relics and boss hazards.
 */
import type {
  CoinConfig, EffectKind, EffectSpec, EnemyConfig, OwnedCoin, Rarity, RollOutcome, TriggerType,
} from '../types/game.types'
import { COIN_MAP } from '../config/coins.config'
import { RELIC_MAP } from '../config/relics.config'
import { COMBAT } from '../config/combat.config'
import type { MarketWeatherId } from '../config/weather.config'
import { coinDamageMultiplier, type Rng } from './economy'

interface Buff {
  kind: EffectKind
  value: number
  isFraction: boolean
  remaining: number
  tag?: string
}

export interface SimCoin {
  slot: number
  ownedId: string
  coinId: string
  cfg: CoinConfig
  rarity: Rarity
  level: number
  cash: number
  /** Uncapped In-Battle Capacity % (starts at 40% / 30% / 20% / 10% + floor buffs, ramps up independently). */
  capacityPct: number
  moonbagTriggered: boolean
  progress: number
  tickCount: number
  buffs: Buff[]
  halving: number
  preventDown: boolean
  frozen: number
  dmgMult: number
  lastOutcome: RollOutcome | null
  isEvolved?: boolean
  evolutionId?: string
}

export interface Candle { o: number; h: number; l: number; c: number }

export interface SimEnemy {
  cfg: EnemyConfig
  hp: number
  maxHp: number
  attackTimer: number
  hazardTimer: number
  ultimateTimer?: number
  orderbookShieldHitsRemaining?: number
  ironWillArmorRemaining?: number
  ironWillRecentDmg?: Array<{ time: number; dmg: number }>
}

export interface CompoundingCombatMods {
  greenCapacityGainBonus: number
  slot4StackMultiplier: number
  slot4MegaPumpCrit: number
  overLeverageCritBonus: number
  overLeverageCritRate: number
  overLeverageHealFraction: number
  dipAccumulatorGain: number
}

export interface RigCombatMods {
  flatAtk?: number
  greenDamagePct?: number
  tickSpeedPct?: number
  critChance?: number
  critMultiplier?: number
  bossDamagePct?: number
  blockFirstRed?: boolean
  nvidiaBurst?: boolean
}

export interface SimState {
  time: number
  coins: SimCoin[]
  enemy: SimEnemy
  marginHp: number
  maxMarginHp: number
  shield: number
  idleCash: number
  baseSeedCapital: number
  compoundingMods: CompoundingCombatMods
  rigMods?: RigCombatMods
  firstRedBlocked?: boolean
  relics: string[]
  relicTriggers: Record<string, number>
  totalLosses: number
  totalDamage: number
  startPortfolio: number
  dmgLog: Array<[number, number]>
  candles: Candle[]
  candle: Candle
  candleTimer: number
  rebalanceLockedUntil: number
  outcome: 'running' | 'victory' | 'defeat'
  marketWeather?: MarketWeatherId | null
  isBearMarket?: boolean
  equippedPetId?: string | null
  petLevel?: number
  petCooldownTimer?: number
}

export type CombatEvent =
  | { type: 'roll'; slot: number; outcome: RollOutcome; cashDelta: number; damage: number; crit: boolean; short: boolean }
  | { type: 'relic'; relicId: string }
  | { type: 'passive'; slot: number; name: string }
  | { type: 'enemyAttack'; damage: number; absorbed: number }
  | { type: 'enemyCounter'; damage: number; absorbed: number; slot: number }
  | { type: 'bossUltimate'; damage: number; absorbed: number; capacityWiped: number }
  | { type: 'hazard'; name: string; description: string }
  | { type: 'bonusDamage'; damage: number }
  | { type: 'megaCandle'; slot: number; damage: number }
  | { type: 'victory' }
  | { type: 'defeat' }

interface RollCtx { gainFactor: number; lossFactor: number; shortFrac: number; retrigger: boolean }

// ───────────────────────── Helpers ─────────────────────────
export const portfolio = (s: SimState): number => s.coins.reduce((a, c) => a + c.cash, 0) + s.idleCash
export const coinsCash = (s: SimState): number => s.coins.reduce((a, c) => a + c.cash, 0)

const sumBuff = (c: SimCoin, k: EffectKind, frac?: boolean) =>
  c.buffs.reduce((a, b) => (b.kind === k && (frac === undefined || b.isFraction === frac) ? a + b.value : a), 0)
const prodBuff = (c: SimCoin, k: EffectKind) =>
  c.buffs.reduce((a, b) => (b.kind === k && b.isFraction ? a * (1 + b.value) : a), 1)
const lossReduction = (c: SimCoin) =>
  1 - c.buffs.reduce((a, b) => (b.kind === 'reduceLoss' ? a * (1 - Math.min(1, b.value)) : a), 1)
const hasTag = (c: SimCoin, tag: string) => c.buffs.some((b) => b.tag === tag)

const addBuff = (c: SimCoin, kind: EffectKind, value: number, isFraction: boolean, duration?: number, tag?: string) =>
  c.buffs.push({ kind, value, isFraction, remaining: duration ?? Infinity, tag })

export const tickInterval = (c: SimCoin, rigTickSpeedPct: number = 0): number => {
  const baseSpeed = c.isEvolved ? c.cfg.baseTickSpeed * 0.5 : c.cfg.baseTickSpeed
  const rigHaste = rigTickSpeedPct > 0 ? Math.max(0.4, 1 - Math.min(0.6, rigTickSpeedPct / 100)) : 1
  return Math.max(COMBAT.minTickSeconds, baseSpeed * rigHaste * Math.max(0.3, 1 + sumBuff(c, 'tickSpeed')))
}

function neighbours(s: SimState, c: SimCoin): SimCoin[] {
  const i = s.coins.indexOf(c)
  return [s.coins[i - 1], s.coins[i + 1]].filter((x): x is SimCoin => !!x)
}

function targetsOf(s: SimState, e: EffectSpec, coin: SimCoin | null): SimCoin[] {
  switch (e.target ?? 'self') {
    case 'self': return coin ? [coin] : s.coins
    case 'allAllies': return s.coins
    case 'adjacent': return coin ? neighbours(s, coin) : []
    default: return []
  }
}

/** Odds after buffs. Percentages summing to 100. */
export function effectiveOdds(
  c: SimCoin | { cfg: CoinConfig; buffs?: Buff[]; preventDown?: boolean },
  weather?: MarketWeatherId | null,
) {
  let up = 0, down = 0, flat = 0
  let upM: number = COMBAT.fallbackUpMult, downM: number = COMBAT.fallbackDownMult
  for (const e of c.cfg.rngTable) {
    if (e.outcome === 'up') { up += e.chance; upM = e.multiplier }
    else if (e.outcome === 'down') { down += e.chance; downM = e.multiplier }
    else flat += e.chance
  }
  const preventDown = !!c.preventDown
  if (preventDown) { flat += down; down = 0 }
  let bonus = (c.buffs ?? []).reduce((a, b) => (b.kind === 'modifyUpChance' ? a + b.value : a), 0)
  if (bonus > 0) {
    const fromDown = Math.min(down, bonus); down -= fromDown; bonus -= fromDown
    const fromFlat = Math.min(flat, bonus); flat -= fromFlat
    up += fromDown + fromFlat
  } else if (bonus < 0) {
    const take = Math.min(up, -bonus); up -= take
    if (preventDown) flat += take; else down += take
  }

  // Volatility Storm: Flat (0%) rolls disabled; split into Green and Red
  if (weather === 'volatility_storm' && flat > 0) {
    up += flat * 0.5
    down += flat * 0.5
    flat = 0
  }

  return { up, down, flat, upM, downM }
}

function dealDamage(s: SimState, dmg: number, isGreenCandle: boolean = false, ev?: CombatEvent[]): boolean {
  if (dmg <= 0) return false
  if (isGreenCandle && (s.enemy.orderbookShieldHitsRemaining ?? 0) > 0) {
    s.enemy.orderbookShieldHitsRemaining!--
    return false
  }
  s.enemy.hp = Math.max(0, s.enemy.hp - dmg)
  s.totalDamage += dmg
  s.dmgLog.push([s.time, dmg])

  // Iron Will: Sustained high-burst Green Candle damage (>20% Boss Max HP within 2 seconds) staggers the boss
  if (isGreenCandle && s.enemy.cfg.hasIronWill && (s.enemy.ultimateTimer ?? 0) > 0) {
    s.enemy.ironWillRecentDmg = s.enemy.ironWillRecentDmg || []
    s.enemy.ironWillRecentDmg.push({ time: s.time, dmg })
    s.enemy.ironWillRecentDmg = s.enemy.ironWillRecentDmg.filter((entry) => entry.time >= s.time - 2.0)
    const burstSum = s.enemy.ironWillRecentDmg.reduce((sum, entry) => sum + entry.dmg, 0)
    if (burstSum >= s.enemy.maxHp * 0.20) {
      s.enemy.ultimateTimer = 0
      s.enemy.ironWillArmorRemaining = s.enemy.cfg.ironWillArmor ?? 2
      s.enemy.ironWillRecentDmg = []
      if (ev) {
        ev.push({ type: 'passive', slot: 0, name: '💥 20% BURST STAGGER! ULTIMATE SHATTERED!' })
      }
    }
  }

  return true
}

function marginDamage(s: SimState, dmg: number, ev: CombatEvent[]) {
  let effDmg = dmg
  const affix = s.enemy.cfg.affix
  const hasFlashCrash = affix?.id === 'flash_crash' || affix?.id === 'multi_affix'
  if (hasFlashCrash && (s.enemy.hp / s.enemy.maxHp) < 0.3) {
    effDmg = Math.round(effDmg * 1.15)
  }
  const absorbed = Math.min(s.shield, effDmg)
  s.shield -= absorbed
  s.marginHp = Math.max(0, s.marginHp - (effDmg - absorbed))
  ev.push({ type: 'enemyAttack', damage: effDmg - absorbed, absorbed })
  checkLowHp(s, ev)
}

// ───────────────────────── Effect interpreter ─────────────────────────
function applyEffect(s: SimState, e: EffectSpec, coin: SimCoin | null, ctx: RollCtx | null, ev: CombatEvent[], skipKinds?: EffectKind[]): boolean {
  if (skipKinds?.includes(e.kind)) return false
  if (e.everyN && coin && coin.tickCount % e.everyN !== 0) return false
  const t = e.target ?? 'self'
  const immediate = !!ctx && !!coin && t === 'self' && !e.durationTicks
  const targets = targetsOf(s, e, coin)
  const frac = !!e.isFraction
  switch (e.kind) {
    case 'modifyUpChance':
      targets.forEach((c) => addBuff(c, e.kind, e.value, false, e.durationTicks))
      return true
    case 'modifyUpMultiplier':
      if (immediate && ctx && coin) {
        if (frac) ctx.gainFactor *= 1 + e.value
        else addBuff(coin, e.kind, e.value, false, undefined, 'streak')
        return true
      }
      targets.forEach((c) => addBuff(c, e.kind, e.value, frac, e.durationTicks))
      return true
    case 'modifyDownMultiplier':
      if (immediate && ctx) ctx.lossFactor *= 1 + e.value
      else targets.forEach((c) => addBuff(c, e.kind, e.value, true, e.durationTicks))
      return true
    case 'reduceLoss':
      if (immediate && ctx) ctx.lossFactor *= 1 - e.value
      else targets.forEach((c) => addBuff(c, e.kind, e.value, true, e.durationTicks))
      return true
    case 'shortDamage':
      if (!ctx) return false
      ctx.shortFrac += e.value
      return true
    case 'transferCashAdjacent': {
      // Independent In-Battle Stacking: grants bonus capacity % to adjacent coins without subtracting from self!
      if (!coin) return false
      const n = neighbours(s, coin)
      const boostTargets = n.length > 0 ? n : [coin]
      const capBoost = Math.max(3, e.value * 30)
      boostTargets.forEach((x) => {
        const mult = x.slot === 3 ? Math.max(1, s.compoundingMods.slot4StackMultiplier) : 1
        x.capacityPct += (capBoost / boostTargets.length) * mult
        x.cash = s.baseSeedCapital * (x.capacityPct / 100)
      })
      return true
    }
    case 'multiplyUpEveryN':
      if (!coin) return false
      coin.halving = Math.min(COMBAT.halvingCap, coin.halving * e.value)
      return true
    case 'tickSpeed':
      targets.forEach((c) => addBuff(c, e.kind, e.value, false, e.durationTicks))
      return true
    case 'healMargin':
      s.marginHp = Math.min(s.maxMarginHp, s.marginHp + (frac ? e.value * s.maxMarginHp : e.value))
      return true
    case 'shieldMargin':
      s.shield += e.value
      return true
    case 'gainCash':
      s.idleCash += e.value
      return true
    case 'bonusDamage': {
      const dmg = frac ? e.value * portfolio(s) : e.value
      dealDamage(s, dmg)
      ev.push({ type: 'bonusDamage', damage: dmg })
      return true
    }
    case 'preventDown':
      targets.forEach((c) => (c.preventDown = true))
      return true
    case 'retriggerRoll':
      if (!ctx) return false
      ctx.retrigger = true
      return true
    case 'refundGas':
      return false
  }
}

function firePassives(s: SimState, trigger: TriggerType, coin: SimCoin, ctx: RollCtx | null, ev: CombatEvent[], rng: Rng) {
  for (const p of coin.cfg.passives) {
    if (p.trigger !== trigger) continue
    if (p.procChance !== undefined && rng() >= p.procChance) continue
    let applied = false
    for (const e of p.effects) applied = applyEffect(s, e, coin, ctx, ev) || applied
    if (applied) ev.push({ type: 'passive', slot: coin.slot, name: p.name })
  }
}

function fireRelics(s: SimState, trigger: TriggerType, coin: SimCoin | null, ctx: RollCtx | null, ev: CombatEvent[], rng: Rng, skipKinds?: EffectKind[]) {
  for (const id of s.relics) {
    const r = RELIC_MAP[id]
    if (!r || r.trigger !== trigger || r.threshold !== undefined) continue
    if (r.maxTriggersPerBattle !== undefined && (s.relicTriggers[id] ?? 0) >= r.maxTriggersPerBattle) continue
    if (r.procChance !== undefined && rng() >= r.procChance) continue
    r.effects.forEach((e) => applyEffect(s, e, coin, ctx, ev, skipKinds))
    s.relicTriggers[id] = (s.relicTriggers[id] ?? 0) + 1
    ev.push({ type: 'relic', relicId: id })
  }
}

function checkLowHp(s: SimState, ev: CombatEvent[]) {
  for (const id of s.relics) {
    const r = RELIC_MAP[id]
    if (!r || r.trigger !== 'onLowHP' || r.threshold === undefined) continue
    if ((s.relicTriggers[id] ?? 0) >= (r.maxTriggersPerBattle ?? 1)) continue
    if (s.marginHp <= 0 || s.marginHp / s.maxMarginHp >= r.threshold) continue
    r.effects.forEach((e) => applyEffect(s, e, null, null, ev))
    s.relicTriggers[id] = (s.relicTriggers[id] ?? 0) + 1
    ev.push({ type: 'relic', relicId: id })
  }
}

// ───────────────────────── Tick resolution ─────────────────────────
function resolveRoll(s: SimState, coin: SimCoin, ev: CombatEvent[], rng: Rng, isRetrigger: boolean) {
  const o = effectiveOdds(coin, s.marketWeather)
  const r = rng() * 100
  let outcome: RollOutcome = r < o.up ? 'up' : r < o.up + o.down ? 'down' : 'flat'
  let mult = outcome === 'up' ? o.upM : outcome === 'down' ? o.downM : 0
  if (outcome === 'flat' && hasTag(coin, 'depeg')) { outcome = 'down'; mult = -0.1 }

  const ctx: RollCtx = { gainFactor: 1, lossFactor: 1, shortFrac: 0, retrigger: false }
  const trig: TriggerType = outcome === 'up' ? 'onGreen' : outcome === 'down' ? 'onRed' : 'onFlat'
  firePassives(s, trig, coin, ctx, ev, rng)
  fireRelics(s, trig, coin, ctx, ev, rng)
  coin.lastOutcome = outcome

  // Market Weather: Dark Pool Fog grants +50% bonus short / red counter-damage
  if (s.marketWeather === 'dark_pool_fog' && ctx.shortFrac > 0) {
    ctx.shortFrac *= 1.5
  }

  // Pet Passive: LaserBull grants +15% Green Crit Damage (+2% per level)
  const laserBullBonus = s.equippedPetId === 'laser_bull'
    ? 0.15 + ((s.petLevel ?? 1) - 1) * 0.02
    : 0

  // Bear Market Inverted Logic:
  // In Bear Market Mode:
  // - Down rolls (Red) are "Short Profit" that deal direct damage to the Enemy's Liquidation Bar!
  // - Up rolls (Green) trigger an Enemy "Short-Squeeze Counter-Strike" against player!
  if (s.isBearMarket) {
    if (outcome === 'down') {
      // Short Profit: Deals direct damage to Enemy
      let raw = coin.cash * Math.abs(mult) * prodBuff(coin, 'modifyDownMultiplier') * ctx.gainFactor * coin.dmgMult * 1.5
      if (laserBullBonus > 0) raw *= (1 + laserBullBonus)
      dealDamage(s, raw)
      const capDelta = Math.max(2, coin.capacityPct * Math.abs(mult) * 0.5)
      coin.capacityPct += capDelta
      coin.cash = s.baseSeedCapital * (coin.capacityPct / 100)
      ev.push({
        type: 'roll',
        slot: coin.slot,
        outcome: 'down',
        cashDelta: s.baseSeedCapital * (capDelta / 100),
        damage: raw,
        short: true,
        crit: raw >= s.enemy.maxHp * COMBAT.critHpFraction,
      })
    } else if (outcome === 'up') {
      // Short-Squeeze: Enemy strikes back against player
      let counterBlocked = false
      if (s.equippedPetId === 'mecha_shiba' && (s.petCooldownTimer ?? 0) <= 0) {
        counterBlocked = true
        const cd = Math.max(8, 16 - ((s.petLevel ?? 1) - 1) * 0.4)
        s.petCooldownTimer = cd
      }
      if (!counterBlocked && s.rigMods?.blockFirstRed && !s.firstRedBlocked) {
        s.firstRedBlocked = true
        counterBlocked = true
        ev.push({ type: 'passive', slot: coin.slot, name: '⚡ ANTMINER 0-RED BLOCK' })
      }

      if (!counterBlocked && s.enemy.hp > 0) {
        const counterDmg = s.enemy.cfg.counterAttackDmg ?? Math.max(1, Math.round(s.enemy.cfg.attack * 0.75))
        const absorbed = Math.min(s.shield, counterDmg)
        s.shield -= absorbed
        const actualCounter = counterDmg - absorbed
        s.marginHp = Math.max(0, s.marginHp - actualCounter)
        ev.push({ type: 'enemyCounter', damage: actualCounter, absorbed, slot: coin.slot })
        checkLowHp(s, ev)
      } else if (counterBlocked) {
        ev.push({ type: 'passive', slot: coin.slot, name: 'MECHASHIBA FIREWALL' })
      }

      const effLossFrac = Math.min(0.5, Math.abs(mult) * 0.5)
      coin.capacityPct = Math.max(5, coin.capacityPct * (1 - effLossFrac))
      coin.cash = s.baseSeedCapital * (coin.capacityPct / 100)
      ev.push({
        type: 'roll',
        slot: coin.slot,
        outcome: 'up',
        cashDelta: -Math.round(coin.cash * effLossFrac),
        damage: 0,
        short: false,
        crit: false,
      })
    } else {
      ev.push({ type: 'roll', slot: coin.slot, outcome, cashDelta: 0, damage: 0, crit: false, short: false })
    }
    if (ctx.retrigger && !isRetrigger) resolveRoll(s, coin, ev, rng, true)
    return
  }

  if (outcome === 'up') {
    let effMult = mult * coin.halving + sumBuff(coin, 'modifyUpMultiplier', false)
    // Market Weather: Volatility Storm multiplies Green magnitude by 1.5x
    if (s.marketWeather === 'volatility_storm') {
      effMult *= 1.5
    }
    const stackMult = coin.slot === 3 ? Math.max(1, s.compoundingMods.slot4StackMultiplier) : 1
    const rawCapGain =
      Math.max(2, coin.capacityPct * effMult * prodBuff(coin, 'modifyUpMultiplier') * ctx.gainFactor) +
      s.compoundingMods.greenCapacityGainBonus
    const capDelta = rawCapGain * stackMult
    coin.capacityPct += capDelta
    coin.cash = s.baseSeedCapital * (coin.capacityPct / 100)

    let dmg = (coin.cash + (s.rigMods?.flatAtk ?? 0)) * effMult * prodBuff(coin, 'modifyUpMultiplier') * ctx.gainFactor * coin.dmgMult
    if ((s.rigMods?.greenDamagePct ?? 0) > 0) {
      dmg *= 1 + (s.rigMods!.greenDamagePct! / 100)
    }
    if (s.enemy.cfg.isBoss && (s.rigMods?.bossDamagePct ?? 0) > 0) {
      dmg *= 1 + (s.rigMods!.bossDamagePct! / 100)
    }
    if (laserBullBonus > 0) {
      dmg *= (1 + laserBullBonus)
    }
    let specialCrit = false

    // Hardware Rig Crit Chance & Multiplier
    if ((s.rigMods?.critChance ?? 0) > 0 && rng() * 100 < s.rigMods!.critChance!) {
      dmg *= (s.rigMods?.critMultiplier ?? 1.5)
      specialCrit = true
    }

    // N-Vidia Protocol 4-pc: Reaching 100% capacity triggers an instant Green Candle auto-burst
    if (s.rigMods?.nvidiaBurst && coin.capacityPct >= 100 && !(coin as any).nvidiaBurstTriggered) {
      (coin as any).nvidiaBurstTriggered = true
      const burstDmg = Math.round(dmg * 0.85)
      dealDamage(s, burstDmg, true, ev)
      ev.push({ type: 'bonusDamage', damage: burstDmg })
    }

    // Moonbag Catalyst: Slot 4 reaching 80% capacity triggers an instant Mega-Pump crit!
    if (
      coin.slot === 3 &&
      s.compoundingMods.slot4MegaPumpCrit > 0 &&
      coin.capacityPct >= 80 &&
      !coin.moonbagTriggered
    ) {
      coin.moonbagTriggered = true
      dmg *= s.compoundingMods.slot4MegaPumpCrit
      specialCrit = true
    }

    // Over-Leverage Surge: Any coin above 100% capacity deals bonus crit dmg + crit chance
    if (coin.capacityPct > 100) {
      if (s.compoundingMods.overLeverageCritBonus > 0) {
        dmg *= 1 + s.compoundingMods.overLeverageCritBonus
        specialCrit = true
      }
      if (s.compoundingMods.overLeverageCritRate > 0 && rng() * 100 < s.compoundingMods.overLeverageCritRate) {
        dmg *= 1.5
        specialCrit = true
      }
    }

    const gain = s.baseSeedCapital * (capDelta / 100)
    const hitLanded = dealDamage(s, dmg, true, ev)
    if (!hitLanded) {
      ev.push({ type: 'passive', slot: coin.slot, name: 'ORDERBOOK SHIELD' })
    }
    ev.push({
      type: 'roll',
      slot: coin.slot,
      outcome,
      cashDelta: gain,
      damage: hitLanded ? dmg : 0,
      short: false,
      crit: specialCrit || effMult >= 1 || dmg >= s.enemy.maxHp * COMBAT.critHpFraction,
    })
    for (const other of s.coins) if (other !== coin) firePassives(s, 'onAllyGreen', other, null, ev, rng)
  } else if (outcome === 'down') {
    // Dual-Threat Combat: Red Candle Counter-Strike (Flat DMG, chipped by -45%)
    let counterBlocked = false
    if (s.equippedPetId === 'mecha_shiba' && (s.petCooldownTimer ?? 0) <= 0) {
      counterBlocked = true
      const cd = Math.max(8, 16 - ((s.petLevel ?? 1) - 1) * 0.4)
      s.petCooldownTimer = cd
    }
    if (!counterBlocked && s.rigMods?.blockFirstRed && !s.firstRedBlocked) {
      s.firstRedBlocked = true
      counterBlocked = true
      ev.push({ type: 'passive', slot: coin.slot, name: '⚡ ANTMINER 0-RED BLOCK' })
    }

    if (!counterBlocked && s.enemy.hp > 0) {
      let counterDmg = s.enemy.cfg.counterAttackDmg ?? Math.max(1, Math.round(s.enemy.cfg.attack * 0.75))
      const affix = s.enemy.cfg.affix
      const hasFlashCrash = affix?.id === 'flash_crash' || affix?.id === 'multi_affix'
      if (hasFlashCrash && (s.enemy.hp / s.enemy.maxHp) < 0.3) {
        counterDmg = Math.round(counterDmg * 1.15)
      }
      const absorbed = Math.min(s.shield, counterDmg)
      s.shield -= absorbed
      const actualCounter = counterDmg - absorbed
      s.marginHp = Math.max(0, s.marginHp - actualCounter)
      ev.push({ type: 'enemyCounter', damage: actualCounter, absorbed, slot: coin.slot })
      checkLowHp(s, ev)
    } else if (counterBlocked) {
      ev.push({ type: 'passive', slot: coin.slot, name: 'MECHASHIBA FIREWALL' })
    }

    let raw = coin.cash * Math.abs(mult) * prodBuff(coin, 'modifyDownMultiplier')
    // Market Weather: Volatility Storm multiplies Red magnitude by 1.5x
    if (s.marketWeather === 'volatility_storm') {
      raw *= 1.5
    }
    if (s.compoundingMods.dipAccumulatorGain > 0) {
      // Dip Accumulator: Rolling a Red Candle grants +8%/+14%/+22% capacity instead of reducing it!
      const stackMult = coin.slot === 3 ? Math.max(1, s.compoundingMods.slot4StackMultiplier) : 1
      const dipGain = s.compoundingMods.dipAccumulatorGain * stackMult
      coin.capacityPct += dipGain
      coin.cash = s.baseSeedCapital * (coin.capacityPct / 100)
      const shortDmg = raw * ctx.shortFrac * coin.dmgMult
      dealDamage(s, shortDmg)
      ev.push({
        type: 'roll',
        slot: coin.slot,
        outcome,
        cashDelta: s.baseSeedCapital * (dipGain / 100),
        damage: shortDmg,
        crit: false,
        short: shortDmg > 0,
      })
    } else {
      const effLossFrac = Math.min(0.65, Math.abs(mult) * prodBuff(coin, 'modifyDownMultiplier') * (1 - lossReduction(coin)) * ctx.lossFactor * (s.marketWeather === 'volatility_storm' ? 1.5 : 1))
      // Tight Stop-Loss Algos: If loss reduction is active, heal 1.5% Max Margin HP on block!
      if (lossReduction(coin) > 0 && s.marginHp < s.maxMarginHp) {
        s.marginHp = Math.min(s.maxMarginHp, s.marginHp + Math.max(1, Math.round(s.maxMarginHp * 0.015)))
      }
      const prevCash = coin.cash
      coin.capacityPct = Math.max(5, coin.capacityPct * (1 - effLossFrac))
      coin.cash = s.baseSeedCapital * (coin.capacityPct / 100)
      const loss = Math.max(0, prevCash - coin.cash)
      s.totalLosses += loss
      coin.buffs = coin.buffs.filter((b) => b.tag !== 'streak')
      const shortDmg = raw * ctx.shortFrac * coin.dmgMult
      dealDamage(s, shortDmg)
      ev.push({ type: 'roll', slot: coin.slot, outcome, cashDelta: -loss, damage: shortDmg, crit: false, short: shortDmg > 0 })
    }
  } else {
    ev.push({ type: 'roll', slot: coin.slot, outcome, cashDelta: 0, damage: 0, crit: false, short: false })
  }

  if (ctx.retrigger && !isRetrigger) resolveRoll(s, coin, ev, rng, true)
}

function resolveTick(s: SimState, coin: SimCoin, ev: CombatEvent[], rng: Rng) {
  const pre = new Set(coin.buffs)
  coin.tickCount++

  // Duo-Coin Merger Evolution: Every 5th tick fires a screen-clearing Mega-Candle burst!
  if (coin.isEvolved && coin.tickCount % 5 === 0) {
    const megaDmg = Math.round(coin.cash * 2.8 * coin.dmgMult)
    dealDamage(s, megaDmg)
    ev.push({
      type: 'megaCandle',
      slot: coin.slot,
      damage: megaDmg,
    })
  }

  // Over-Leverage Surge: Any coin above 100% capacity heals 3% Margin HP per tick
  if (coin.capacityPct > 100 && s.compoundingMods.overLeverageHealFraction > 0) {
    s.marginHp = Math.min(
      s.maxMarginHp,
      s.marginHp + s.maxMarginHp * s.compoundingMods.overLeverageHealFraction,
    )
  }
  firePassives(s, 'onTick', coin, null, ev, rng)
  resolveRoll(s, coin, ev, rng, false)
  for (const b of coin.buffs) if (pre.has(b) && Number.isFinite(b.remaining)) b.remaining--
  coin.buffs = coin.buffs.filter((b) => b.remaining > 0)
}

// ───────────────────────── Hazards ─────────────────────────
function triggerHazard(s: SimState, ev: CombatEvent[], rng: Rng) {
  const h = s.enemy.cfg.hazard
  if (!h) return
  ev.push({ type: 'hazard', name: h.name, description: h.description })
  const loseCash = (c: SimCoin, f: number) => { const l = c.cash * f; c.cash -= l; s.totalLosses += l }
  switch (h.id) {
    case 'whaleDump': s.coins.forEach((c) => loseCash(c, 0.1)); break
    case 'secFreeze': {
      const c = s.coins[Math.floor(rng() * s.coins.length)]
      if (c) c.frozen = COMBAT.freezeSeconds
      break
    }
    case 'rugPull': {
      const c = [...s.coins].sort((a, b) => b.cash - a.cash)[0]
      if (c) loseCash(c, 0.25)
      break
    }
    case 'flashCrash': s.coins.forEach((c) => addBuff(c, 'modifyUpChance', -20, false, 3)); break
    case 'gasWar': marginDamage(s, Math.round(s.enemy.cfg.attack * 0.5), ev); break
    case 'fudStorm': s.coins.forEach((c) => addBuff(c, 'modifyUpMultiplier', -0.3, true, 4)); break
    case 'bearTrap': s.coins.forEach((c) => addBuff(c, 'tickSpeed', 0.3, false, 4)); break
    case 'liquidationCascade':
      marginDamage(s, Math.round(s.maxMarginHp * 0.15 * Math.min(1, s.totalLosses / Math.max(1, s.startPortfolio))), ev)
      break
    case 'stablecoinDepeg': s.coins.forEach((c) => addBuff(c, 'modifyDownMultiplier', 0, true, 4, 'depeg')); break
    case 'exchangeHalt':
      s.rebalanceLockedUntil = s.time + 6
      s.enemy.hp = Math.min(s.enemy.maxHp, s.enemy.hp + s.enemy.maxHp * 0.05)
      break
  }
}

// ───────────────────────── Public API ─────────────────────────
export interface SimInit {
  loadout: Array<{
    slot: number
    owned: OwnedCoin
    cash: number
    capacityPct?: number
    isEvolved?: boolean
    evolutionId?: string
  }>
  enemy: EnemyConfig
  marginHp: number
  maxMarginHp: number
  relics: string[]
  idleCash: number
  baseSeedCapital?: number
  compoundingMods?: Partial<CompoundingCombatMods>
  startEffects: EffectSpec[]
  slotEffects: Record<number, EffectSpec[]>
  candles?: Candle[]
  marketWeather?: MarketWeatherId | null
  isBearMarket?: boolean
  equippedPetId?: string | null
  petLevel?: number
  rigMods?: RigCombatMods
}

const DEFAULT_SLOT_CAP = [40, 30, 20, 10]

export function createSim(init: SimInit, rng: Rng = Math.random): { sim: SimState; events: CombatEvent[] } {
  const seedCap =
    init.baseSeedCapital ??
    Math.max(500, init.loadout.reduce((a, l) => a + l.cash, 0) + init.idleCash)
  const coins: SimCoin[] = init.loadout
    .filter((l) => COIN_MAP[l.owned.coinId])
    .sort((a, b) => a.slot - b.slot)
    .map((l) => {
      const capPct = l.capacityPct ?? DEFAULT_SLOT_CAP[l.slot] ?? 25
      return {
        slot: l.slot,
        ownedId: l.owned.id,
        coinId: l.owned.coinId,
        cfg: COIN_MAP[l.owned.coinId],
        rarity: l.owned.rarity,
        level: l.owned.level,
        cash: seedCap * (capPct / 100),
        capacityPct: capPct,
        moonbagTriggered: false,
        progress: 0,
        tickCount: 0,
        buffs: [],
        halving: 1,
        preventDown: false,
        frozen: 0,
        dmgMult: coinDamageMultiplier(l.owned),
        lastOutcome: null,
        isEvolved: l.isEvolved,
        evolutionId: l.evolutionId,
      }
    })
  const maxHp = Math.round(init.enemy.hp * COMBAT.enemyHpScale)
  const total = coins.reduce((a, c) => a + c.cash, 0) + init.idleCash

  const enemyCfg: EnemyConfig = { ...init.enemy }
  // Market Weather: Retail FOMO reduces enemy attack cooldown by 20%
  if (init.marketWeather === 'retail_fomo') {
    enemyCfg.attackCooldown = Math.max(0.5, enemyCfg.attackCooldown * 0.8)
  }

  const sim: SimState = {
    time: 0,
    coins,
    enemy: {
      cfg: enemyCfg,
      hp: maxHp,
      maxHp,
      attackTimer: 0,
      hazardTimer: 0,
      ultimateTimer: 0,
      orderbookShieldHitsRemaining:
        init.enemy.orderbookShieldHits ??
        (init.enemy.affix?.id === 'orderbook_shield' || init.enemy.affix?.id === 'multi_affix' ? 2 : 0),
      ironWillArmorRemaining: enemyCfg.hasIronWill ? (enemyCfg.ironWillArmor ?? 2) : undefined,
      ironWillRecentDmg: enemyCfg.hasIronWill ? [] : undefined,
    },
    marginHp: init.marginHp,
    maxMarginHp: init.maxMarginHp,
    shield: 0,
    idleCash: init.idleCash,
    baseSeedCapital: seedCap,
    compoundingMods: {
      greenCapacityGainBonus: init.compoundingMods?.greenCapacityGainBonus ?? 0,
      slot4StackMultiplier: init.compoundingMods?.slot4StackMultiplier ?? 1,
      slot4MegaPumpCrit: init.compoundingMods?.slot4MegaPumpCrit ?? 0,
      overLeverageCritBonus: init.compoundingMods?.overLeverageCritBonus ?? 0,
      overLeverageCritRate: init.compoundingMods?.overLeverageCritRate ?? 0,
      overLeverageHealFraction: init.compoundingMods?.overLeverageHealFraction ?? 0,
      dipAccumulatorGain: init.compoundingMods?.dipAccumulatorGain ?? 0,
    },
    relics: [...init.relics],
    relicTriggers: {},
    totalLosses: 0,
    totalDamage: 0,
    startPortfolio: total,
    dmgLog: [],
    candles: (init.candles && init.candles.length > 0)
      ? (() => {
          const prev = init.candles
          const lastC = prev[prev.length - 1].c
          const ratio = lastC > 0 && Math.abs(lastC - total) > 10 ? total / lastC : 1
          return prev.slice(-COMBAT.maxCandles).map((c) => ({
            o: Math.round(c.o * ratio * 10) / 10,
            h: Math.round(c.h * ratio * 10) / 10,
            l: Math.round(c.l * ratio * 10) / 10,
            c: Math.round(c.c * ratio * 10) / 10,
          }))
        })()
      : [],
    candle: { o: total, h: total, l: total, c: total },
    candleTimer: 0,
    rebalanceLockedUntil: 0,
    outcome: 'running',
    marketWeather: init.marketWeather ?? null,
    isBearMarket: init.isBearMarket,
    equippedPetId: init.equippedPetId,
    petLevel: init.petLevel ?? 1,
    petCooldownTimer: 0,
    rigMods: init.rigMods,
    firstRedBlocked: false,
  }
  const ev: CombatEvent[] = []

  // Cursed Relic: 100x Degenerate Margin provides 350 Margin Shield Barrier at start of node
  if (sim.relics.includes('100x_degen_margin') || sim.relics.includes('degen_margin_100x')) {
    sim.shield += 350
  }

  // Cursed Relic: Tornado Mixer locks Slot 1, grants +100% permanent Overdrive tick speed & damage to Slots 2, 3, 4
  if (sim.relics.includes('tornado_mixer')) {
    for (const c of coins) {
      if (c.slot === 0) {
        c.frozen = Infinity
      } else {
        addBuff(c, 'tickSpeed', -0.5, true)
        addBuff(c, 'modifyUpMultiplier', 1.0, true)
      }
    }
  }

  // Market Weather: Retail FOMO boosts all coins tick speed by +20%
  if (init.marketWeather === 'retail_fomo') {
    for (const c of coins) {
      addBuff(c, 'tickSpeed', -0.2, true)
    }
  }

  for (const c of coins) {
    for (const e of init.startEffects) addBuff(c, e.kind, e.value, !!e.isFraction, e.durationTicks)
    for (const e of init.slotEffects[c.slot] ?? []) addBuff(c, e.kind, e.value, !!e.isFraction, e.durationTicks)
  }
  for (const c of coins) firePassives(sim, 'onBattleStart', c, null, ev, rng)
  fireRelics(sim, 'onBattleStart', null, null, ev, rng)
  return { sim, events: ev }
}

export function stepSim(s: SimState, dt: number, rng: Rng = Math.random): CombatEvent[] {
  const ev: CombatEvent[] = []
  if (s.outcome !== 'running') return ev
  s.time += dt

  // Pet cooldown timer countdown (e.g. MechaShiba shield)
  if (s.petCooldownTimer && s.petCooldownTimer > 0) {
    s.petCooldownTimer = Math.max(0, s.petCooldownTimer - dt)
  }

  // Pet Passive: DiamondCrab regenerates 5% Margin HP every 10s (+0.5% per lvl)
  if (s.equippedPetId === 'diamond_crab') {
    const healInterval = 10
    const prevInt = Math.floor((s.time - dt) / healInterval)
    const curInt = Math.floor(s.time / healInterval)
    if (curInt > prevInt && s.marginHp < s.maxMarginHp) {
      const healPct = 0.05 + ((s.petLevel ?? 1) - 1) * 0.005
      const healAmount = Math.max(1, Math.round(s.maxMarginHp * healPct))
      s.marginHp = Math.min(s.maxMarginHp, s.marginHp + healAmount)
      ev.push({ type: 'passive', slot: 0, name: `DIAMOND CRAB REPAIR +${healAmount} HP` })
    }
  }

  // Market Weather: Crypto Winter (Liquidity Freeze)
  // Coins lose -3% capacity/sec unless they roll Green
  if (s.marketWeather === 'crypto_winter') {
    const decay = 3 * dt
    for (const coin of s.coins) {
      coin.capacityPct = Math.max(5, coin.capacityPct - decay)
      coin.cash = s.baseSeedCapital * (coin.capacityPct / 100)
    }
  }

  for (const coin of s.coins) {
    if (coin.frozen > 0) { coin.frozen = Math.max(0, coin.frozen - dt); continue }
    coin.progress += dt / tickInterval(coin, s.rigMods?.tickSpeedPct ?? 0)
    if (coin.progress >= 1) {
      coin.progress = Math.min(0.99, coin.progress - 1)
      resolveTick(s, coin, ev, rng)
    }
  }

  const en = s.enemy
  en.attackTimer += dt
  if (en.attackTimer >= en.cfg.attackCooldown) {
    en.attackTimer -= en.cfg.attackCooldown
    marginDamage(s, en.cfg.attack, ev)
  }
  // Boss-Only Black Swan Ultimates (every 7.5s)
  if (en.cfg.isBoss) {
    en.ultimateTimer = (en.ultimateTimer ?? 0) + dt
    const ultCooldown = en.cfg.ultimateCooldown ?? 7.5
    if (en.ultimateTimer >= ultCooldown) {
      en.ultimateTimer -= ultCooldown
      if (en.cfg.hasIronWill) {
        en.ironWillArmorRemaining = en.cfg.ironWillArmor ?? 2
        en.ironWillRecentDmg = []
      }
      const flatUltDmg = en.cfg.ultimateDmg ?? Math.round(en.cfg.attack * 1.5)
      const pctDmg = en.cfg.hasIronWill ? Math.round(s.maxMarginHp * 0.50) : Math.round(s.marginHp * 0.15)
      const totalUltDmg = flatUltDmg + pctDmg

      const absorbed = Math.min(s.shield, totalUltDmg)
      s.shield -= absorbed
      const actualDmg = totalUltDmg - absorbed
      s.marginHp = Math.max(0, s.marginHp - actualDmg)

      let totalWiped = 0
      for (const coin of s.coins) {
        const wipe = coin.capacityPct * 0.20
        coin.capacityPct = Math.max(5, coin.capacityPct - wipe)
        coin.cash = s.baseSeedCapital * (coin.capacityPct / 100)
        totalWiped += wipe
      }

      ev.push({
        type: 'bossUltimate',
        damage: actualDmg,
        absorbed,
        capacityWiped: Math.round(totalWiped),
      })
      checkLowHp(s, ev)
    }
  }
  if (en.cfg.hazard) {
    en.hazardTimer += dt
    if (en.hazardTimer >= en.cfg.hazard.interval) {
      en.hazardTimer -= en.cfg.hazard.interval
      triggerHazard(s, ev, rng)
    }
  }

  const total = portfolio(s)
  // Subtle organic orderbook micro-spread fluctuation (±0.3% to ±0.8%) so candles breathe with authentic volatility
  const microSpread = (Math.sin(s.time * 6.5 + s.coins.length) * 0.0035 + (rng() - 0.5) * 0.0045) * total
  const livePrice = Math.max(1, Math.round((total + microSpread) * 10) / 10)
  s.candle.h = Math.max(s.candle.h, livePrice)
  s.candle.l = Math.min(s.candle.l, livePrice)
  s.candle.c = livePrice
  s.candleTimer += dt
  if (s.candleTimer >= COMBAT.candleInterval) {
    s.candleTimer = 0
    s.candles.push({ ...s.candle })
    if (s.candles.length > COMBAT.maxCandles) s.candles.shift()
    s.candle = { o: livePrice, h: livePrice, l: livePrice, c: livePrice }
  }
  while (s.dmgLog.length && s.dmgLog[0][0] < s.time - COMBAT.dpsWindow) s.dmgLog.shift()

  if (en.hp <= 0) { s.outcome = 'victory'; ev.push({ type: 'victory' }) }
  else if (s.marginHp <= 0 || total < 1) { s.outcome = 'defeat'; ev.push({ type: 'defeat' }) }
  return ev
}

export const simDps = (s: SimState): number =>
  s.dmgLog.reduce((a, [, d]) => a + d, 0) / Math.max(0.5, Math.min(COMBAT.dpsWindow, s.time))

/** Fires onRebalance relic hooks. Cash bonuses (Gas Fee Skimmer) are applied by the run store, so gainCash is skipped. */
export function onRebalanceSim(s: SimState, rng: Rng = Math.random): CombatEvent[] {
  const ev: CombatEvent[] = []
  fireRelics(s, 'onRebalance', null, null, ev, rng, ['gainCash'])
  return ev
}

export function reviveSim(s: SimState) {
  s.marginHp = Math.round(s.maxMarginHp * COMBAT.reviveHpFraction)
  s.enemy.attackTimer = 0
  if (coinsCash(s) < 1 && s.coins.length) s.coins.forEach((c) => (c.cash = COMBAT.reviveMinCash / s.coins.length))
  s.outcome = 'running'
}
