/** Combat tuning constants. */
export const COMBAT = {
  /** Enemy config HP is multiplied by this to match $1,000-scale portfolios. */
  enemyHpScale: 8,
  /** Seconds of sim time per chart candle. */
  candleInterval: 0.5,
  maxCandles: 60,
  /** Max sim seconds per sub-step (keeps 4x speed deterministic). */
  maxSubstep: 0.05,
  /** Damage >= this fraction of enemy max HP (or effective multiplier >= 1) = crit. */
  critHpFraction: 0.12,
  halvingCap: 16,
  minTickSeconds: 0.25,
  freezeSeconds: 3,
  dpsWindow: 3,
  reviveHpFraction: 0.5,
  reviveMinCash: 250,
  /** Fallback multipliers when a table lacks an outcome but buffs shift odds into it. */
  fallbackUpMult: 0.05,
  fallbackDownMult: -0.1,
} as const

/** Black Market base prices; scaled by stage. */
export const BLACK_MARKET = {
  priceScalePerStage: 0.4,
  relicPriceMultiplier: 4,
  relicOffers: 2,
  items: [
    { id: 'patch_margin', name: 'Patch Margin', desc: 'Heal 30% Margin HP', icon: 'HeartPulse', price: 150, heal: 0.3 },
    { id: 'full_collateral', name: 'Full Collateral Top-up', desc: 'Heal to full Margin HP', icon: 'ShieldPlus', price: 400, heal: 1 },
    { id: 'insider_signal', name: 'Insider Signal', desc: 'Next battle: +10% Up chance (all coins)', icon: 'Radio', price: 200,
      effect: { kind: 'modifyUpChance', value: 10, target: 'allAllies' } },
    { id: 'leverage_pills', name: 'Leverage Pills', desc: 'Next battle: +30% Green gains (all coins)', icon: 'Pill', price: 250,
      effect: { kind: 'modifyUpMultiplier', value: 0.3, isFraction: true, target: 'allAllies' } },
  ],
} as const
