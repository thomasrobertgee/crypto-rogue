export type RunSkillRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythical'
export type RunSkillCategory =
  | 'Coin Stat Buff'
  | 'Margin Shield'
  | 'Boss Slow'
  | 'Cross-Coin Synergy'
  | 'Compounding Buff'
  | 'Base Floor Buff'

export interface RunSkillTierEffect {
  description: string
  /** Additive bonus to green roll multiplier (e.g. 0.20 = +20% Green magnitude). */
  greenMagnitudeBonus?: number
  /** Additive percentage points to green roll chance (e.g. 6 = +6% Up chance). */
  upChanceBonus?: number
  /** Tick speed haste fraction (e.g. 0.15 = +15% faster coin ticks). */
  tickSpeedHaste?: number
  /** Reduction to red loss fraction (e.g. 0.20 = -20% Red drawdown). */
  lossReduction?: number
  /** Immediate Max HP + Current HP boost when drafted. */
  instantMaxHpBonus?: number
  /** Immediate Margin HP heal fraction of Max HP (e.g. 0.30 = Heal 30% HP). */
  instantHealFraction?: number
  /** Immediate Margin Shield granted AND refreshed at the start of every battle node. */
  battleStartShield?: number
  /** Slows enemy/boss attack speed (e.g. 0.15 = -15% Boss attack speed). */
  bossSlowFraction?: number
  /** Broadens the timing window for Counter-Pump Hero Skill interrupts (e.g. 0.15 = +15% wider window). */
  interruptWindowBonus?: number
  /** Reduces enemy/boss attack damage (e.g. 0.15 = -15% Boss damage). */
  bossAttackReduction?: number
  /** Cross-coin synergy critical damage multiplier bonus (e.g. 0.50 = +50% Crit damage). */
  synergyBonusDamage?: number
  /** Converts a fraction of any Red loss into Short damage against the enemy. */
  shortCounterFraction?: number

  // ── In-Battle Compounding Buffs (Temporary stacks that ramp up during a fight & reset each battle) ──
  /** Extra capacity % gained every time a coin rolls a Green Candle (e.g. 5 = +5% capacity). */
  greenCapacityGainBonus?: number
  /** Multiplier to capacity gains on Slot 4 (index 3), e.g. 2.5 = 2.5x faster stacks. */
  slot4StackMultiplier?: number
  /** Instant Mega-Pump crit multiplier when Slot 4 reaches 100% capacity (e.g. 3 = 3x crit). */
  slot4MegaPumpCrit?: number
  /** Bonus crit damage fraction for any coin above 100% capacity (e.g. 0.40 = +40% crit dmg). */
  overLeverageCritBonus?: number
  /** Base Crit Rate percentage bonus when a coin is above 100% capacity (e.g. 20 = +20% Crit Rate). */
  overLeverageCritRate?: number
  /** Margin HP heal fraction per tick when a coin is above 100% capacity (e.g. 0.03 = 3% HP). */
  overLeverageHealFraction?: number
  /** Capacity % gained on a Red Candle instead of losing capacity (e.g. 8 = +8% capacity). */
  dipAccumulatorGain?: number

  // ── Permanent In-Run Base Floor Buffs (Permanently raises baseRunSlotCapacity for the 30-node run) ──
  /** Permanently increases Starting Base Capacity % of ALL 4 slots for the rest of the run. */
  permanentAllSlotFloorBonus?: number
  /** Permanently increases Starting Base Capacity % of Slot 1 & Slot 2 for the rest of the run. */
  permanentTop2SlotFloorBonus?: number
}

export interface RunSkillConfig {
  id: string
  name: string
  category: RunSkillCategory
  rarity: RunSkillRarity
  icon: string
  /** Base 3 Gold Star tiers: Star 1 (★☆☆), Star 2 (★★☆), Star 3 (★★★). Stars 4..6 (🔴★★, 🔴🔴★, 🔴🔴🔴) scale past Tier 3! */
  tiers: [RunSkillTierEffect, RunSkillTierEffect, RunSkillTierEffect]
}

export const MAX_SKILL_STARS = 6

/**
 * Formats a star level (0..6) using the hybrid Gold/Red star notation:
 * 0: ☆☆☆
 * 1: ★☆☆
 * 2: ★★☆
 * 3: ★★★
 * 4: 🔴★★
 * 5: 🔴🔴★
 * 6: 🔴🔴🔴
 */
export function getHybridStarSlots(stars: number): Array<'empty' | 'gold' | 'red'> {
  const s = Math.max(0, Math.min(MAX_SKILL_STARS, Math.floor(stars)))
  return [1, 2, 3].map((slotIdx) => {
    if (s >= slotIdx + 3) return 'red'
    if (s >= slotIdx) return 'gold'
    return 'empty'
  })
}

export function formatHybridStarString(stars: number): string {
  return getHybridStarSlots(stars)
    .map((slot) => (slot === 'red' ? '🔴' : slot === 'gold' ? '★' : '☆'))
    .join('')
}

/**
 * Returns the effective RunSkillTierEffect for any star tier 1..6.
 * Tiers 1..3 return the explicit config tier; Tiers 4..6 (Red Star Awakened tiers)
 * scale all numeric modifiers by 1.35x (4★), 1.75x (5★), and 2.25x (6★).
 */
export function getSkillTierEffect(skill: RunSkillConfig, starLevel: number): RunSkillTierEffect {
  const clamped = Math.max(1, Math.min(MAX_SKILL_STARS, Math.floor(starLevel)))
  if (clamped <= 3) {
    return skill.tiers[clamped - 1]
  }
  const base3 = skill.tiers[2]
  const mult = clamped === 4 ? 1.35 : clamped === 5 ? 1.75 : 2.25
  const scaleNum = (v: number | undefined, roundInt = false) => {
    if (v === undefined) return undefined
    const raw = v * mult
    return roundInt ? Math.round(raw) : Math.round(raw * 100) / 100
  }

  // Scale numbers inside description string proportionally (except "Slot 1", "Slot 2", "Slot 4", "100%")
  const scaledDesc = base3.description.replace(
    /(\+|-)?(\d+(?:\.\d+)?)(%|x|\s*HP|\s*Max HP|\s*Shield)?/g,
    (match, sign, numStr, suffix, offset, fullStr) => {
      const prevSlice = fullStr.slice(Math.max(0, offset - 6), offset)
      if (/Slot\s*$/i.test(prevSlice)) return match
      const val = parseFloat(numStr)
      if (val === 100 && suffix === '%') return match
      const scaled = val * mult
      const formatted = Number.isInteger(val) ? String(Math.round(scaled)) : scaled.toFixed(1)
      return `${sign ?? ''}${formatted}${suffix ?? ''}`
    },
  )

  return {
    description: scaledDesc,
    greenMagnitudeBonus: scaleNum(base3.greenMagnitudeBonus),
    upChanceBonus: scaleNum(base3.upChanceBonus, true),
    tickSpeedHaste: scaleNum(base3.tickSpeedHaste),
    lossReduction: base3.lossReduction ? Math.min(0.8, scaleNum(base3.lossReduction)!) : undefined,
    instantMaxHpBonus: scaleNum(base3.instantMaxHpBonus, true),
    instantHealFraction: base3.instantHealFraction
      ? Math.min(1, scaleNum(base3.instantHealFraction)!)
      : undefined,
    battleStartShield: scaleNum(base3.battleStartShield, true),
    bossSlowFraction: base3.bossSlowFraction
      ? Math.min(0.65, scaleNum(base3.bossSlowFraction)!)
      : undefined,
    interruptWindowBonus: scaleNum(base3.interruptWindowBonus),
    bossAttackReduction: base3.bossAttackReduction
      ? Math.min(0.65, scaleNum(base3.bossAttackReduction)!)
      : undefined,
    synergyBonusDamage: scaleNum(base3.synergyBonusDamage),
    shortCounterFraction: scaleNum(base3.shortCounterFraction),
    greenCapacityGainBonus: scaleNum(base3.greenCapacityGainBonus, true),
    slot4StackMultiplier: scaleNum(base3.slot4StackMultiplier),
    slot4MegaPumpCrit: scaleNum(base3.slot4MegaPumpCrit),
    overLeverageCritBonus: scaleNum(base3.overLeverageCritBonus),
    overLeverageCritRate: scaleNum(base3.overLeverageCritRate, true),
    overLeverageHealFraction: scaleNum(base3.overLeverageHealFraction),
    dipAccumulatorGain: scaleNum(base3.dipAccumulatorGain, true),
    permanentAllSlotFloorBonus: scaleNum(base3.permanentAllSlotFloorBonus, true),
    permanentTop2SlotFloorBonus: scaleNum(base3.permanentTop2SlotFloorBonus, true),
  }
}

export const RUN_SKILLS: RunSkillConfig[] = [
  // 1. Common (Green) — Coin Stat Buff
  {
    id: 'bull_candle_overdrive',
    name: 'Bull Candle Overdrive',
    category: 'Coin Stat Buff',
    rarity: 'common',
    icon: 'TrendingUp',
    tiers: [
      {
        description: '+65% Green candle profit & damage magnitude on all coins.',
        greenMagnitudeBonus: 0.65,
      },
      {
        description: '+105% Green candle profit & damage magnitude on all coins.',
        greenMagnitudeBonus: 1.05,
      },
      {
        description: '+150% Green candle profit & damage magnitude on all coins.',
        greenMagnitudeBonus: 1.5,
      },
    ],
  },
  // 2. Common (Green) — Margin Shield
  {
    id: 'liquidity_injection',
    name: 'Emergency Bailout Reserve',
    category: 'Margin Shield',
    rarity: 'common',
    icon: 'HeartPulse',
    tiers: [
      {
        description: 'Heal 30% Margin HP immediately and gain +25 Max HP.',
        instantHealFraction: 0.3,
        instantMaxHpBonus: 25,
      },
      {
        description: 'Heal 45% Margin HP immediately and gain +50 Max HP.',
        instantHealFraction: 0.45,
        instantMaxHpBonus: 50,
      },
      {
        description: 'Heal 65% Margin HP immediately and gain +85 Max HP.',
        instantHealFraction: 0.65,
        instantMaxHpBonus: 85,
      },
    ],
  },
  // 3. Common (Green) — Coin Stat Buff
  {
    id: 'stop_loss_algos',
    name: 'Tight Stop-Loss Algos',
    category: 'Coin Stat Buff',
    rarity: 'common',
    icon: 'ShieldCheck',
    tiers: [
      {
        description: 'Reduces Red candle losses by 40% across all wallet slots and heals 1.5% Max Margin HP on block.',
        lossReduction: 0.4,
      },
      {
        description: 'Reduces Red candle losses by 55% across all wallet slots and heals 2.5% Max Margin HP on block.',
        lossReduction: 0.55,
      },
      {
        description: 'Reduces Red candle losses by 70% across all wallet slots and heals 4% Max Margin HP on block.',
        lossReduction: 0.7,
      },
    ],
  },
  // 4. Rare (Blue) — Boss Slow
  {
    id: 'ddos_orderbook_jam',
    name: 'Orderbook Latency Jammer',
    category: 'Boss Slow',
    rarity: 'rare',
    icon: 'Snowflake',
    tiers: [
      {
        description: '-16% Boss & Enemy attack speed across all nodes, +8% Counter-Pump interrupt window.',
        bossSlowFraction: 0.16,
        interruptWindowBonus: 0.08,
      },
      {
        description: '-25% Boss & Enemy attack speed across all nodes, +14% Counter-Pump interrupt window.',
        bossSlowFraction: 0.25,
        interruptWindowBonus: 0.14,
      },
      {
        description: '-36% Boss & Enemy attack speed across all nodes, +20% Counter-Pump interrupt window.',
        bossSlowFraction: 0.36,
        interruptWindowBonus: 0.2,
      },
    ],
  },
  // 5. Rare (Blue) — Coin Stat Buff
  {
    id: 'high_freq_clock',
    name: 'High-Frequency Fiber Clock',
    category: 'Coin Stat Buff',
    rarity: 'rare',
    icon: 'Zap',
    tiers: [
      {
        description: '+22% Tick Speed to all equipped coins.',
        tickSpeedHaste: 0.22,
      },
      {
        description: '+38% Tick Speed to all equipped coins.',
        tickSpeedHaste: 0.38,
      },
      {
        description: '+55% Tick Speed to all equipped coins.',
        tickSpeedHaste: 0.55,
      },
    ],
  },
  // 6. Rare (Blue) — Margin Shield
  {
    id: 'cold_storage_barrier',
    name: 'Cold-Storage Margin Dome',
    category: 'Margin Shield',
    rarity: 'rare',
    icon: 'Shield',
    tiers: [
      {
        description: 'Start every battle with a +35 HP Margin Shield bubble.',
        battleStartShield: 35,
      },
      {
        description: 'Start every battle with a +70 HP Margin Shield bubble.',
        battleStartShield: 70,
      },
      {
        description: 'Start every battle with a +120 HP Margin Shield bubble.',
        battleStartShield: 120,
      },
    ],
  },
  // 7. Epic (Purple) — Cross-Coin Synergy
  {
    id: 'defi_meme_fusion',
    name: 'DeFi x Meme Liquidity Matrix',
    category: 'Cross-Coin Synergy',
    rarity: 'epic',
    icon: 'Sparkles',
    tiers: [
      {
        description: 'DeFi Staking pairs with Meme coins to grant +50% Crit & Pump Damage.',
        synergyBonusDamage: 0.5,
      },
      {
        description: 'DeFi Staking pairs with Meme coins to grant +90% Crit & Pump Damage.',
        synergyBonusDamage: 0.9,
      },
      {
        description: 'DeFi Staking pairs with Meme coins to grant +140% Crit & Pump Damage.',
        synergyBonusDamage: 1.4,
      },
    ],
  },
  // 8. Epic (Purple) — Cross-Coin Synergy
  {
    id: 'short_squeeze_reversal',
    name: 'Vampire Short-Squeeze Engine',
    category: 'Cross-Coin Synergy',
    rarity: 'epic',
    icon: 'Repeat',
    tiers: [
      {
        description: 'Red candles fire 60% of their drawdown as Short Damage at the Boss.',
        shortCounterFraction: 0.6,
      },
      {
        description: 'Red candles fire 110% of their drawdown as Short Damage at the Boss.',
        shortCounterFraction: 1.1,
      },
      {
        description: 'Red candles fire 175% of their drawdown as Short Damage at the Boss.',
        shortCounterFraction: 1.75,
      },
    ],
  },
  // 9. Epic (Purple) — Boss Slow
  {
    id: 'sec_injunction_ward',
    name: 'Counter-Subpoena Armor',
    category: 'Boss Slow',
    rarity: 'epic',
    icon: 'Gavel',
    tiers: [
      {
        description: '-12% Boss attack damage and -12% Boss attack speed.',
        bossAttackReduction: 0.12,
        bossSlowFraction: 0.12,
      },
      {
        description: '-20% Boss attack damage and -18% Boss attack speed.',
        bossAttackReduction: 0.20,
        bossSlowFraction: 0.18,
      },
      {
        description: '-30% Boss attack damage and -25% Boss attack speed.',
        bossAttackReduction: 0.30,
        bossSlowFraction: 0.25,
      },
    ],
  },
  // 10. Legendary (Gold) — Coin Stat Buff
  {
    id: 'insider_alpha_feed',
    name: 'Insider Whale Alpha Feed',
    category: 'Coin Stat Buff',
    rarity: 'legendary',
    icon: 'Crown',
    tiers: [
      {
        description: '+9% Green Roll Chance and +30% Green Magnitude on all coins.',
        upChanceBonus: 9,
        greenMagnitudeBonus: 0.3,
      },
      {
        description: '+15% Green Roll Chance and +55% Green Magnitude on all coins.',
        upChanceBonus: 15,
        greenMagnitudeBonus: 0.55,
      },
      {
        description: '+22% Green Roll Chance and +85% Green Magnitude on all coins.',
        upChanceBonus: 22,
        greenMagnitudeBonus: 0.85,
      },
    ],
  },
  // 11. Legendary (Gold) — Cross-Coin Synergy
  {
    id: 'satoshi_consensus_halo',
    name: 'Satoshi Consensus Halo',
    category: 'Cross-Coin Synergy',
    rarity: 'legendary',
    icon: 'Flame',
    tiers: [
      {
        description: 'All coins link together: +27% Synergy Damage, +12% Tick Speed, and +31 Shield.',
        synergyBonusDamage: 0.27,
        tickSpeedHaste: 0.12,
        battleStartShield: 31,
      },
      {
        description: 'All coins link together: +51% Synergy Damage, +20% Tick Speed, and +62 Shield.',
        synergyBonusDamage: 0.51,
        tickSpeedHaste: 0.2,
        battleStartShield: 62,
      },
      {
        description: 'All coins link together: +86% Synergy Damage, +30% Tick Speed, and +110 Shield.',
        synergyBonusDamage: 0.86,
        tickSpeedHaste: 0.3,
        battleStartShield: 110,
      },
    ],
  },
  // 12. Rare (Blue) — In-Battle Compounding Buff
  {
    id: 'compound_interest',
    name: 'Compound Interest',
    category: 'Compounding Buff',
    rarity: 'rare',
    icon: 'TrendingUp',
    tiers: [
      {
        description: 'Coins gain +8% capacity on Green rolls, plus +25% passive wallet capacity growth.',
        greenCapacityGainBonus: 8,
        permanentAllSlotFloorBonus: 25,
      },
      {
        description: 'Coins gain +15% capacity on Green rolls, plus +35% passive wallet capacity growth.',
        greenCapacityGainBonus: 15,
        permanentAllSlotFloorBonus: 35,
      },
      {
        description: 'Coins gain +25% capacity on Green rolls, plus +50% passive wallet capacity growth.',
        greenCapacityGainBonus: 25,
        permanentAllSlotFloorBonus: 50,
      },
    ],
  },
  // 13. Epic (Purple) — In-Battle Compounding Buff
  {
    id: 'moonbag_catalyst',
    name: 'Moonbag Catalyst',
    category: 'Compounding Buff',
    rarity: 'epic',
    icon: 'Rocket',
    tiers: [
      {
        description: 'Slot 4 gains 3.5x faster capacity stacks; reaching 80% capacity triggers an instant 3x Mega-Pump crit.',
        slot4StackMultiplier: 3.5,
        slot4MegaPumpCrit: 3.0,
      },
      {
        description: 'Slot 4 gains 4.5x faster capacity stacks; reaching 80% capacity triggers an instant 3.8x Mega-Pump crit.',
        slot4StackMultiplier: 4.5,
        slot4MegaPumpCrit: 3.8,
      },
      {
        description: 'Slot 4 gains 5.8x faster capacity stacks; reaching 80% capacity triggers an instant 5.0x Mega-Pump crit.',
        slot4StackMultiplier: 5.8,
        slot4MegaPumpCrit: 5.0,
      },
    ],
  },
  // 14. Mythical (Crimson/Gold) — In-Battle Compounding Buff
  {
    id: 'over_leverage_surge',
    name: 'Over-Leverage Surge',
    category: 'Compounding Buff',
    rarity: 'mythical',
    icon: 'Zap',
    tiers: [
      {
        description: 'Any coin above 100% capacity gains +20% Crit Rate, +40% bonus crit damage, and heals 3% Margin HP per tick.',
        overLeverageCritRate: 20,
        overLeverageCritBonus: 0.40,
        overLeverageHealFraction: 0.03,
      },
      {
        description: 'Any coin above 100% capacity gains +28% Crit Rate, +70% bonus crit damage, and heals 4% Margin HP per tick.',
        overLeverageCritRate: 28,
        overLeverageCritBonus: 0.70,
        overLeverageHealFraction: 0.04,
      },
      {
        description: 'Any coin above 100% capacity gains +40% Crit Rate, +115% bonus crit damage, and heals 5% Margin HP per tick.',
        overLeverageCritRate: 40,
        overLeverageCritBonus: 1.15,
        overLeverageHealFraction: 0.05,
      },
    ],
  },
  // 15. Epic (Purple) — In-Battle Compounding Buff
  {
    id: 'dip_accumulator',
    name: 'Dip Accumulator',
    category: 'Compounding Buff',
    rarity: 'epic',
    icon: 'ArrowDownUp',
    tiers: [
      {
        description: 'Rolling a Red Candle grants +8% capacity to that coin instead of reducing it.',
        dipAccumulatorGain: 8,
      },
      {
        description: 'Rolling a Red Candle grants +14% capacity to that coin instead of reducing it.',
        dipAccumulatorGain: 14,
      },
      {
        description: 'Rolling a Red Candle grants +22% capacity to that coin instead of reducing it.',
        dipAccumulatorGain: 22,
      },
    ],
  },
  // 16. Legendary (Gold) — Permanent In-Run Base Floor Buff
  {
    id: 'series_a_injection',
    name: 'Series A Injection',
    category: 'Base Floor Buff',
    rarity: 'legendary',
    icon: 'Coins',
    tiers: [
      {
        description: 'Permanently increases the Starting Base Capacity of ALL slots by +10% for the rest of the run.',
        permanentAllSlotFloorBonus: 10,
      },
      {
        description: 'Permanently increases the Starting Base Capacity of ALL slots by +20% for the rest of the run.',
        permanentAllSlotFloorBonus: 20,
      },
      {
        description: 'Permanently increases the Starting Base Capacity of ALL slots by +35% for the rest of the run.',
        permanentAllSlotFloorBonus: 35,
      },
    ],
  },
  // 17. Rare (Blue) — Permanent In-Run Base Floor Buff
  {
    id: 'anchor_whale_fund',
    name: 'Anchor Whale Fund',
    category: 'Base Floor Buff',
    rarity: 'rare',
    icon: 'Anchor',
    tiers: [
      {
        description: 'Permanently increases Slot 1 and Slot 2 starting base capacity by +25% for the rest of the run.',
        permanentTop2SlotFloorBonus: 25,
      },
      {
        description: 'Permanently increases Slot 1 and Slot 2 starting base capacity by +50% for the rest of the run.',
        permanentTop2SlotFloorBonus: 50,
      },
      {
        description: 'Permanently increases Slot 1 and Slot 2 starting base capacity by +75% for the rest of the run.',
        permanentTop2SlotFloorBonus: 75,
      },
    ],
  },
]

export const RUN_SKILL_MAP: Record<string, RunSkillConfig> = Object.fromEntries(
  RUN_SKILLS.map((s) => [s.id, s]),
)
