# CRYPTO ROGUE: LIQUIDATION — Product Requirements Document

> **All agents MUST read this file and `docs/ARCHITECTURE.md` before making changes.**

## 1. Vision
A portrait (9:16) hybrid-casual crypto auto-battler roguelite for mobile.
Inspirations: **Balatro** (synergy/relic combos), **Capybara Go!** (node-based run progression, light decisions), **Survivor.io** (juicy auto-combat, meta-progression).

Target: iOS/Android via Capacitor wrapping a Vite + React web build. Sessions of 3–8 minutes.

## 2. Core Loop
1. Players collect **Crypto Coins** (Units) — rarities: Common → Uncommon → Rare → Epic → Legendary → Mythical.
2. Players collect **Algo Relics** (Passives) that trigger on combat events.
3. In a **Run**, players progress through **Stage Nodes**:
   - **Battle** — allocate Run Cash across Wallet Slots, then "OPEN MARKET" for auto-combat vs. a Boss.
   - **Shady Event** — risk/reward narrative choice (rug pulls, airdrops, insider tips).
   - **Black Market** — spend Run Cash on coins, relics, slot buffs.
4. Run ends on **Liquidation** (Margin HP = 0) or final boss defeat. Rewards feed meta-progression.

## 3. Battle Screen — 4-Zone UI (portrait, fixed proportions)
| Zone | Height | Contents |
|---|---|---|
| **Zone 1 – Top** | 10% | Margin HP bar, Stage Node indicator, active Algo Relic Rack (icons wiggle/flash on trigger) |
| **Zone 2 – Upper-Mid** | 35% | Enemy Boss ("The Whale", "SEC Auditor", …), Liquidation HP bar, Attack Cooldown timer, HTML5 Canvas background rendering live TVL candlesticks and firing glowing green/red candlestick projectiles |
| **Zone 3 – Lower-Mid** | 30% | 1–4 Active Wallet Slots (unlocked progressively Stage 1 → Stage 6). Each card: vertical liquid-fill gauge (allocated $USD), Up/Down RNG odds, attack-tick progress bar |
| **Zone 4 – Bottom** | 25% | **Pre-battle Allocation Deck**: +Inject / −Pull toggle, 10% / 25% / 50% / MAX pills, Equal Rebalance button, Bench drawer. **Morphs into Combat Controls** when "OPEN MARKET" is tapped: 1x/2x/4x speed, Pause/Rebalance (5% Gas Fee), live DPS/Profit ticker |

### Wallet Slot Unlock Schedule (default)
Stage 1: 1 slot · Stage 2: 2 slots · Stage 4: 3 slots · Stage 6: 4 slots (tunable in `src/config`).

## 4. Meta-Progression & Economy
### Currencies
| Currency | Type | Scope | Use |
|---|---|---|---|
| Run Cash ($USD) | Run | Resets each run | Allocation, Black Market |
| Hashrate | Soft | Persistent | Coin leveling |
| Satoshi Gems | Hard (premium) | Persistent | Gacha, skips, cosmetics |
| Silver Vault Key | Key | Persistent | Standard gacha vault |
| Quantum Vault Key | Key | Persistent | Premium gacha vault |

### Systems
- **3-to-1 Hard Fork Fusion**: 3 identical coins of tier N → 1 coin of tier N+1 (Common → Uncommon → Rare → Epic → Legendary → Mythical). Mythical is the cap.
- **Account Mastery**: Leveling ANY coin grants a permanent **+2% Global Portfolio Yield** per level, applied even when unequipped.
- **Gacha Vaults** (Silver / Quantum) with **Pity Timers** (guaranteed rarity after N pulls without it).
- **7-Day New Trader Carnival**: daily onboarding tasks + escalating rewards.
- **Idle Mining Rig**: passive Hashrate accrual, **12h AFK cap**.
- **Daily Quests**: 100-point daily track with milestone chests.
- **Growth Events**: **50-player bracketed** leaderboards.

## 5. Non-Functional Requirements
- Mobile-first: max-width 430px, `100dvh`, safe-area aware, `select-none`, no page scroll in battle.
- 60 FPS target for canvas rendering; game logic decoupled from React render.
- All tuning numbers live in `src/config` — never hard-coded in components.
- Offline-first: persisted local state (Zustand `persist`); services layer abstracts future backend.
