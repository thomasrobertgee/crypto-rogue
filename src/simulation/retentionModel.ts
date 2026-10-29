import type { BotCohortId } from './BotSimulatorEngine'
import type { PRNG } from './prng'

/**
 * Mobile cohort retention milestones (Day -> % Active).
 * Curves derived from industry telemetry for hybrid-casual roguelite battlers.
 */
export const RETENTION_CURVES: Record<BotCohortId, Record<number, number>> = {
  f2p_casual: { 1: 0.38, 7: 0.12, 14: 0.06, 30: 0.03, 90: 0.01 },
  f2p_grinder: { 1: 0.52, 7: 0.24, 14: 0.16, 30: 0.08, 90: 0.03 },
  minnow: { 1: 0.70, 7: 0.42, 14: 0.30, 30: 0.18, 90: 0.08 },
  dolphin: { 1: 0.70, 7: 0.42, 14: 0.30, 30: 0.18, 90: 0.08 },
  whale: { 1: 0.88, 7: 0.65, 14: 0.52, 30: 0.38, 90: 0.20 },
}

/**
 * Piecewise logarithmic/exponential interpolation for smooth daily retention probability.
 */
export function getCohortRetentionRate(cohort: BotCohortId, day: number): number {
  if (day <= 0) return 1.0
  const curve = RETENTION_CURVES[cohort]

  if (day === 1) return curve[1]
  if (day <= 7) {
    const t = (day - 1) / (7 - 1)
    return curve[1] + t * (curve[7] - curve[1])
  }
  if (day <= 14) {
    const t = (day - 7) / (14 - 7)
    return curve[7] + t * (curve[14] - curve[7])
  }
  if (day <= 30) {
    const t = (day - 14) / (30 - 14)
    return curve[14] + t * (curve[30] - curve[14])
  }
  if (day <= 90) {
    const t = (day - 30) / (90 - 30)
    return curve[30] + t * (curve[90] - curve[30])
  }
  return curve[90] * Math.pow(0.98, day - 90)
}

export interface BotRetentionState {
  botId: string
  cohort: BotCohortId
  isDormant: boolean
  dormantSinceDay: number | null
  totalComebacks: number
  reEngagementDaysLeft: number
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
      reEngagementDaysLeft: 0,
    })
  }

  /**
   * Evaluates churn and re-engagement for a bot on a given simulation day.
   * Returns true if the bot is active today, or false if dormant.
   */
  public stepBotDay(botId: string, day: number): boolean {
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

    // If currently on an active re-engagement comeback streak:
    if (state.reEngagementDaysLeft > 0) {
      state.reEngagementDaysLeft--
      this.dauHistory[day][state.cohort]++
      return true
    }

    if (state.isDormant) {
      // Weekly check: 5% chance per week for simulated push notifications to trigger re-engagement
      if (day % 7 === 0 && this.prng.boolean(0.05)) {
        state.isDormant = false
        state.dormantSinceDay = null
        state.totalComebacks++
        state.reEngagementDaysLeft = this.prng.rangeInt(2, 4) // plays for 2-4 days
        this.dauHistory[day][state.cohort]++
        return true
      }
      return false
    }

    // Active bot check against cohort retention curve
    const retentionRate = getCohortRetentionRate(state.cohort, day)
    // Daily marginal survival probability:
    // If random roll > expected retention rate, bot churns into dormancy
    const churnRoll = this.prng.next()
    if (churnRoll > retentionRate) {
      state.isDormant = true
      state.dormantSinceDay = day
      return false
    }

    this.dauHistory[day][state.cohort]++
    return true
  }

  public getBotState(botId: string): BotRetentionState | undefined {
    return this.botStates.get(botId)
  }

  public getSummary(day: number) {
    const totalBots = this.botStates.size
    let activeBots = 0
    let totalComebacks = 0
    for (const s of this.botStates.values()) {
      if (!s.isDormant) activeBots++
      totalComebacks += s.totalComebacks
    }

    return {
      totalBots,
      activeBots,
      churnedBots: totalBots - activeBots,
      retentionPct: totalBots > 0 ? (activeBots / totalBots) * 100 : 0,
      totalComebacks,
      todayDau: this.dauHistory[day] || { f2p_casual: 0, f2p_grinder: 0, minnow: 0, dolphin: 0, whale: 0 },
    }
  }
}
