export interface UiUnlockState {
  /** True during post-battle guided upgrade tutorial ('upgrade_hero' | 'upgrade_coin' | 'ready_stage_1'). */
  isTutorialLockdown: boolean
  /** Dev bypass override to unlock all features, tabs, and slots immediately. */
  devUnlockAll: boolean

  // ───── Bottom Navigation Tabs ─────
  shopTabUnlocked: boolean
  baseTabUnlocked: boolean
  runTabUnlocked: boolean
  missionsTabUnlocked: boolean
  socialTabUnlocked: boolean

  // ───── Base HQ Sub-Tabs ─────
  heroesSubTabUnlocked: boolean
  coinsSubTabUnlocked: boolean
  algosSubTabUnlocked: boolean
  baseSubTabUnlocked: boolean

  // ───── Slot Capacities ─────
  unlockedCoinSlots: number
  unlockedAlgoSlots: number

  // ───── Home Screen Diorama Elements ─────
  tasksUnlocked: boolean
  carnivalUnlocked: boolean
  patrolUnlocked: boolean
  starterPackUnlocked: boolean
  vipPassUnlocked: boolean
  bountyUnlocked: boolean
  campUnlocked: boolean

  // ───── Combat & Economy Features ─────
  coinForgeUnlocked: boolean
  autoSkillUnlocked: boolean
}

/**
 * Computes progressive feature unlocks based on `highestStageCleared`, `tutorialStep`,
 * and the `"🔓 Unlock All UI (Dev)"` setting:
 *
 * - Tutorial Lockdown ('upgrade_hero' | 'upgrade_coin' | 'ready_stage_1'):
 *     Only Trade Run and Base HQ (Heroes & Coins) are accessible. All other tabs,
 *     floating bubbles, and bottom badges are locked/hidden.
 *
 * - highestStageCleared === 0 (Before Stage 1 cleared):
 *     Only Trade Run + Base HQ (Heroes & Coins) unlocked.
 *
 * - highestStageCleared >= 1 (Clear Stage 1):
 *     Unlocks Exchange Shop Tab, Coin Slot #2, Tasks, 7-Day Carnival, and Patrol.
 *
 * - highestStageCleared >= 2 (Clear Stage 2):
 *     Unlocks Algos sub-tab in Base HQ, Algo Slot #2, Starter Pack, VIP Pass, and Bounty.
 *
 * - highestStageCleared >= 3 (Clear Stage 3):
 *     Unlocks Daily Missions Tab, Coin Slot #3, and 3-to-1 Coin Merging (Forge).
 *
 * - highestStageCleared >= 4 (Clear Stage 4):
 *     Unlocks Base (Locations & Furniture) sub-tab and Algo Slot #3.
 *
 * - highestStageCleared >= 5 (Clear Stage 5):
 *     Unlocks Social Tab, [ ⚡ AUTO ] Hero Skill button in battle, and Algo Slot #4.
 */
export function getUiUnlockState(meta: {
  tutorialStep: string
  highestStageCleared: number
  devUnlockAllUi?: boolean
}): UiUnlockState {
  const dev = Boolean(meta.devUnlockAllUi)
  const isTut =
    !dev &&
    (meta.tutorialStep === 'upgrade_hero' ||
      meta.tutorialStep === 'upgrade_coin' ||
      meta.tutorialStep === 'ready_stage_1')
  const stg = meta.highestStageCleared ?? 0

  if (dev) {
    return {
      isTutorialLockdown: false,
      devUnlockAll: true,
      shopTabUnlocked: true,
      baseTabUnlocked: true,
      runTabUnlocked: true,
      missionsTabUnlocked: true,
      socialTabUnlocked: true,
      heroesSubTabUnlocked: true,
      coinsSubTabUnlocked: true,
      algosSubTabUnlocked: true,
      baseSubTabUnlocked: true,
      unlockedCoinSlots: 4,
      unlockedAlgoSlots: 5,
      tasksUnlocked: true,
      carnivalUnlocked: true,
      patrolUnlocked: true,
      starterPackUnlocked: true,
      vipPassUnlocked: true,
      bountyUnlocked: true,
      campUnlocked: true,
      coinForgeUnlocked: true,
      autoSkillUnlocked: true,
    }
  }

  if (isTut) {
    return {
      isTutorialLockdown: true,
      devUnlockAll: false,
      shopTabUnlocked: false,
      baseTabUnlocked: true,
      runTabUnlocked: true,
      missionsTabUnlocked: false,
      socialTabUnlocked: false,
      heroesSubTabUnlocked: true,
      coinsSubTabUnlocked: true,
      algosSubTabUnlocked: false,
      baseSubTabUnlocked: false,
      unlockedCoinSlots: 1,
      unlockedAlgoSlots: 1,
      tasksUnlocked: false,
      carnivalUnlocked: false,
      patrolUnlocked: false,
      starterPackUnlocked: false,
      vipPassUnlocked: false,
      bountyUnlocked: false,
      campUnlocked: false,
      coinForgeUnlocked: false,
      autoSkillUnlocked: false,
    }
  }

  // Post-tutorial progressive unlocking by highestStageCleared
  const unlockedCoinSlots = stg >= 6 ? 4 : stg >= 3 ? 3 : stg >= 1 ? 2 : 1
  const unlockedAlgoSlots = stg >= 8 ? 5 : stg >= 5 ? 4 : stg >= 4 ? 3 : stg >= 2 ? 2 : 1

  return {
    isTutorialLockdown: false,
    devUnlockAll: false,
    shopTabUnlocked: stg >= 1,
    baseTabUnlocked: true,
    runTabUnlocked: true,
    missionsTabUnlocked: stg >= 3,
    socialTabUnlocked: stg >= 5,
    heroesSubTabUnlocked: true,
    coinsSubTabUnlocked: true,
    algosSubTabUnlocked: stg >= 1,
    baseSubTabUnlocked: stg >= 3,
    unlockedCoinSlots,
    unlockedAlgoSlots,
    tasksUnlocked: stg >= 1,
    carnivalUnlocked: stg >= 1,
    patrolUnlocked: stg >= 1,
    starterPackUnlocked: stg >= 2,
    vipPassUnlocked: stg >= 2,
    bountyUnlocked: stg >= 2,
    campUnlocked: true,
    coinForgeUnlocked: stg >= 3,
    autoSkillUnlocked: stg >= 5,
  }
}
