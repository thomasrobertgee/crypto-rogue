# CRYPTO ROGUE: LIQUIDATION — Architecture

> **Strict rules. All agents MUST follow this document.** See `docs/PRD.md` for product scope.

## Stack
- **Vite + React 19 + TypeScript (strict)**
- **Tailwind CSS v4** via `@tailwindcss/vite` (theme tokens in `src/index.css` `@theme`)
- **Zustand** for state (with `persist` for meta-progression)
- **Lucide-React** for icons
- **Capacitor-ready**: `base: './'` in Vite, build output `dist/` (= Capacitor `webDir`), no reliance on server routes, viewport-fit=cover + safe-area insets.

## Folder Structure
```
src/
  config/      Pure data & tuning constants (coins, relics, bosses, stages, economy, gacha rates). No logic.
  types/       Shared TypeScript types/interfaces. No runtime code.
  state/       Zustand stores (metaStore = persistent account; runStore = current run; battleStore = live combat).
  engine/      Pure, framework-free game logic (combat tick, RNG, fusion, yield calc, pity). No React imports.
  components/  Reusable presentational UI (bars, gauges, cards, pills, MobileFrame). No game logic.
  screens/     Full-screen compositions (BattleScreen, MapScreen, HubScreen, VaultScreen...).
  services/    Side-effect boundaries: storage, analytics, IAP, haptics, future backend/Capacitor plugins.
docs/          PRD.md, ARCHITECTURE.md
```

## Dependency Rules (one-way)
```
screens → components, state, config, types
state   → engine, config, types, services
engine  → config, types            (pure; deterministic given seeded RNG)
components → types                 (props-driven)
services → types
```
- `engine/` must never import React, Zustand, or DOM APIs (canvas rendering lives in components).
- Components must not mutate stores directly except via store actions.

## Battle Screen Layout Contract
`BattleScreen` is a flex column filling the `MobileFrame` (100dvh, max 430px):
| Zone | Class | Component |
|---|---|---|
| 1 | `h-[10%]` | `TopHud` (MarginHpBar, StageIndicator, RelicRack) |
| 2 | `h-[35%]` | `BossArena` (BossPortrait, LiquidationBar, CooldownTimer, `<CandleCanvas>` bg) |
| 3 | `h-[30%]` | `WalletRow` (1–4 `WalletSlotCard`: LiquidGauge, OddsBadge, TickBar) |
| 4 | `h-[25%]` | `AllocationDeck` ⇄ `CombatControls` (switched by `battleStore.phase`) |

## Game Loop
- Fixed-step simulation (e.g., 10 ticks/sec) in `engine/combat.ts`, scaled by speed (1x/2x/4x).
- Driven by a single `requestAnimationFrame` loop in a hook; writes to `battleStore` at throttled rate.
- Canvas reads simulation state directly via store `getState()` (no React re-render per frame).
- Relic triggers emit events → `RelicRack` wiggle/flash animations.

## Phases
`battleStore.phase: 'allocate' | 'combat' | 'paused' | 'victory' | 'liquidated'`
Pause/Rebalance during combat charges a **5% Gas Fee** on moved $USD.

## Key Formulas (implement in engine/, constants in config/)
- **Fusion**: 3× (coinId, tier N) → 1× (coinId, tier N+1); tiers `common..mythical`.
- **Global Portfolio Yield** = `1 + 0.02 × Σ(coin levels above 1 across ALL owned coins)`.
- **Idle Rig**: `hashrate = rate × min(elapsed, 12h)`.
- **Pity**: counter per vault; guaranteed rarity at threshold, reset on hit.

## Conventions
- TypeScript strict; no `any`. Named exports. One component per file.
- Tailwind utility classes; custom tokens (colors `neon-green`, `neon-red`, `obsidian`, etc.) in `@theme`.
- Mobile: touch targets ≥ 44px, `select-none`, no hover-only interactions.
- Verify with `npm run build` (runs `tsc -b`) before finishing any task.
