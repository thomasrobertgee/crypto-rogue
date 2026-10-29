---
description: Repeatable workflow (/new-coin) to prompt for a Coin Name, Rarity, and Archetype, add balanced stats to src/config/coins.config.ts, register its passive hook in the battle engine, and verify TypeScript compilation.
---

# `/new-coin` — Add a New Crypto Coin Unit

Follow these steps to design, implement, register, and verify a new playable Crypto Coin in **CRYPTO ROGUE: LIQUIDATION**.

## Step 1: Prompt for Coin Specification
If the user did not already provide them in the command invocation, prompt for:
1. **Coin Name & 4-Letter Ticker** (e.g., `KaspaPulse` / `KASP`)
2. **Rarity Tier**: `'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical'`
3. **Combat Archetype**:
   - **Steady / Blue-Chip**: Reliable Up% (`55%–65%`), moderate Up multiplier, loss-mitigation or shield passive.
   - **Glass Cannon / Meme**: Low Up% (`20%–35%`), massive Up multiplier (`+150%` to `+300%`), high volatility or stacking crit passive.
   - **Yield / Support**: High Flat% or fast tick rate, buffs or injects liquidity into adjacent/allied slots (`transferCash`, `modifyUpChance`).
   - **Dark Pool / Hedge**: Converts Red candle losses into Short Damage (`shortDamage`) or Margin HP recovery (`healMargin`).
   - **High-Frequency / Speed**: Sub-1.0s `baseTickSpeed` with `everyN` cadence triggers (`doubleMultiplierCycle`, `tickSpeed`).

## Step 2: Balance Stats by Rarity Tier
Use the following rarity guidelines when authoring the `CoinConfig` entry in `src/config/coins.config.ts`:

| Rarity | Grade | Base Tick Speed | Expected EV / Tick | Mastery / Level | Max Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `common` | `'C'` | `1.2s – 1.6s` | `+4% to +8%` | `0.02` (+2.0%) | `20` |
| `uncommon` | `'B'` | `1.2s – 1.5s` | `+8% to +15%` | `0.02` (+2.0%) | `25` |
| `rare` | `'A'` | `0.8s – 1.4s` | `+14% to +22%` | `0.025` (+2.5%) | `30` |
| `epic` | `'A'` | `1.0s – 1.3s` | `+20% to +32%` | `0.03` (+3.0%) | `40` |
| `legendary` | `'S'` | `0.9s – 1.2s` | `+28% to +42%` | `0.035` (+3.5%) | `50` |
| `mythical` | `'S'` | `0.8s – 1.1s` | `+35% to +55%` | `0.04` (+4.0%) | `60` |

- Ensure `rngTable` chances sum to exactly `100`.
- Choose a distinct hex `color` and a valid Lucide icon name (and verify the icon is registered in `src/components/DynamicIcon.tsx`).

## Step 3: Add Coin Entry to `src/config/coins.config.ts`
Append the new `CoinConfig` object to `COINS` under its rarity section in `src/config/coins.config.ts`:
- `COINS_BY_RARITY` and `COIN_MAP` derive automatically from `COINS`.

## Step 4: Register Passive Hook in the Battle Engine
1. Check if the coin's passive uses an existing `EffectKind` in `src/types/game.types.ts` (`modifyUpChance`, `modifyUpMultiplier`, `modifyDownMultiplier`, `reduceLoss`, `shortDamage`, `transferCashAdjacent`, `multiplyUpEveryN`, `healMargin`, `bonusDamage`, `tickSpeed`, `refundGas`, `gainCash`, `preventDown`, `retriggerRoll`, `shieldMargin`).
2. If introducing a new `EffectKind` or custom passive `id`:
   - Add the new kind to `EffectKind` in `src/types/game.types.ts`.
   - Implement the trigger & resolution logic inside `src/engine/combat.ts` (`stepSim` / `applyEffect` / `onRebalanceSim`).
3. If using a new Lucide icon name, add it to `ICON_REGISTRY` in `src/components/DynamicIcon.tsx`.

## Step 5: Verify TypeScript Compilation & Production Bundle
// turbo
Run the production build to confirm zero TypeScript or bundler errors:
```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path; npm.cmd run build
```
