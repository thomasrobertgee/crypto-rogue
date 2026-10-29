---
description: Repeatable workflow (/new-season) that generates 5 new Stages in src/config/stages.config.ts and rotates the Seasonal Insider Pass rewards.
---

# `/new-season` — Generate 5 New Stages & Rotate Seasonal Insider Pass Rewards

Follow these steps to launch a new Seasonal expansion in **CRYPTO ROGUE: LIQUIDATION**.

## Step 1: Prompt for Season Theme & Featured Rewards
If not already specified by the user, ask for (or generate):
1. **Season Number & Title** (e.g., `Season 2: Sovereign Default` or `Season 3: Zero-Knowledge Citadel`)
2. **5 New Stage Names** to append to `STAGE_NAMES` in `src/config/stages.config.ts`
3. **Featured Seasonal Insider Pass Reward** (featured Epic/Legendary/Mythical `coinId`, bonus Satoshi Gems, and Quantum Keys)

## Step 2: Append 5 New Stages in `src/config/stages.config.ts`
1. Add 5 new thematic stage names to `STAGE_NAMES` in `src/config/stages.config.ts`.
2. Verify `hpScale(stage)` (`Math.round(100 * Math.pow(1.35, stage - 1))`) and `atkScale(stage)` (`Math.round(6 * Math.pow(1.18, stage - 1))`) scale smoothly across the expanded `STAGES` array.
3. Optional: Add any new seasonal Boss archetype to `BOSSES` and `BOSS_HAZARDS` in `src/config/stages.config.ts`, ensuring its portrait icon is registered in `src/components/DynamicIcon.tsx`.
4. Update any UI labels referencing total stage count if hardcoded (or derive from `STAGES.length`).

## Step 3: Rotate Seasonal Insider Pass & Growth Fund Milestones in `src/config/economy.config.ts`
1. In `src/config/economy.config.ts`, update the `insider_pass` entry inside `SHOP_BUNDLES`:
   - Increment the Season title & description.
   - Rotate `rewards.coins` to the new Season's featured Coin and adjust `gems` / `quantumKeys` / `hashrate` grants.
2. Add corresponding `GROWTH_FUND_MILESTONES` entries in `src/config/economy.config.ts` for the new stage milestones (e.g., every 2–3 stages in the new 5-stage block).

## Step 4: Verify TypeScript Compilation & Production Build
// turbo
Run the full TypeScript and Vite production build to verify zero errors:
```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path; npm.cmd run build
```
