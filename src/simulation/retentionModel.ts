import type { BotCohortId } from './BotSimulatorEngine'
import type { PRNG } from './prng'

/**
 * Mobile cohort retention milestones and power-law decay curve formulas.
 * Industry telemetry models for hybrid-casual roguelite battlers:
 * - F2P Casual:   R(d) = max(0.04, 0.40 * d^(-0.65))
 * - F2P Grinder:  R(d) = max(0.10, 0.55 * d^(-0.52))
 * - Minnow:       R(d) = max(0.18, 0.72 * d^(-0.40))
 * - Dolphin:      R(d) = max(0.18, 0.72 * d^(-0.40))
 * - Whale:        R(d) = max(0.35, 0.88 * d^(-0.28))
 */
export function getCohortRetentionRate(cohort: BotCohortId, day: number): number {
  if (day <= 0) return 1.0

  switch (cohort) {
    case 'f2p_casual':
      return Math.max(0.04, 0.40 * Math.pow(day, -0.65))
    case 'f2p_grinder':
      return Math.max(0.10, 0.55 * Math.pow(day, -0.52))
    case 'minnow':
    case 'dolphin':
      return Math.max(0.18, 0.72 * Math.pow(day, -0.40))
    case 'whale':
      return Math.max(0.35, 0.88 * Math.pow(day, -0.28))
    default:
      return Math.max(0.10, 0.50 * Math.pow(day, -0.50))
  }
}

/**
 * Evaluates whether a virtual bot logs in and is active on Day d
 * directly based on the cohort retention curve R(d).
 * Inactive bots skip active loops and accumulate idle offline patrol (up to 16h cap).
 */
export function isBotActiveOnDay(
  _bot: any,
  day: number,
  cohort: BotCohortId,
  prng: PRNG,
): boolean {
  if (day <= 0) return true
  const rate = getCohortRetentionRate(cohort, day)
  return prng.next() < rate
}

export interface BotRetentionState {
  botId: string
  cohort: BotCohortId
  isDormant: boolean
  dormantSinceDay: number | null
  totalComebacks: number
}

export class RetentionTracker {
  private prng: PRNG
  private botStates: Map<string, BotRetentionState> = new Map()
  public dauHistory: Record<number, Record<BotCohortId, number>> = {}

  constructor(prng: PRNG) {
    this.prng = prng
  }

  public registerBot(botId: string, cohort: BotCohortId) {
    this.botStates.set(botId, {
      botId,
      cohort,
      isDormant: false,
      dormantSinceDay: null,
      totalComebacks: 0,
    })
  }

  /**
   * Evaluates active login status for a bot on a given simulation day.
   * Returns true if the bot is active today, or false if dormant.
   */
  public stepBotDay(botId: string, day: number, bot?: any): boolean {
    const state = this.botStates.get(botId)
    if (!state) return true

    // Initialize DAU counter bucket for today
    if (!this.dauHistory[day]) {
      this.dauHistory[day] = {
        f2p_casual: 0,
        f2p_grinder: 0,
        minnow: 0,
        dolphin: 0,
        whale: 0,
      }
    }

    const wasDormant = state.isDormant
    const isActive = isBotActiveOnDay(bot || state, day, state.cohort, this.prng)

    if (isActive) {
      if (wasDormant) {
        state.totalComebacks++
      }
      state.isDormant = false
      state.dormantSinceDay = null
      this.dauHistory[day][state.cohort]++
    } else {
      if (!wasDormant) {
        state.isDormant = true
        state.dormantSinceDay = day
      }
    }

    return isActive
  }

  public getBotState(botId: string): BotRetentionState | undefined {
    return this.botStates.get(botId)
  }

  public getSummary(day: number) {
    const totalBots = this.botStates.size
    const todayDau = this.dauHistory[day] || { f2p_casual: 0, f2p_grinder: 0, minnow: 0, dolphin: 0, whale: 0 }
    const activeBots = Object.values(todayDau).reduce((a, b) => a + b, 0)
    let totalComebacks = 0
    for (const s of this.botStates.values()) {
      totalComebacks += s.totalComebacks
    }

    return {
      totalBots,
      activeBots,
      churnedBots: Math.max(0, totalBots - activeBots),
      retentionPct: totalBots > 0 ? (activeBots / totalBots) * 100 : 0,
      totalComebacks,
      todayDau,
    }
  }
}
