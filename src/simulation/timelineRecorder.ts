import type { BotCohortId } from './BotSimulatorEngine'

export type TimelineEventType =
  | 'BATTLE_START'
  | 'GREEN_ROLL'
  | 'RED_COUNTER'
  | 'HEAVY_TELEGRAPH'
  | 'INTERRUPT_ATTEMPT'
  | 'INTERRUPT_SUCCESS'
  | 'INTERRUPT_FAILED'
  | 'IRON_WILL_SHIELD_CRACK'
  | 'BOSS_ULTIMATE_DETONATE'
  | 'PET_DEFENSE_SAVE'
  | 'CLUTCH_SAVE'
  | 'CLUTCH_WIN'
  | 'WIPE'

export interface TimelineMarker {
  tick: number // Simulated second / tick (e.g. 1..60)
  event: TimelineEventType
  val?: number
  dmg?: number
  playerHpPct: number
  enemyHpPct: number
  description: string
  reason?: string
}

export interface OutlierRunTelemetry {
  id: string
  botId: string
  cohort: BotCohortId
  day: number
  stage: number
  nodeNum: number
  enemyName: string
  isBoss: boolean
  outcome: 'WIPE' | 'CLUTCH_WIN'
  finalPlayerHpPct: number
  finalEnemyHpPct: number
  totalDurationSec: number
  fatalCause?: 'RED_COUNTER' | 'HEAVY_ATTACK' | 'BOSS_ULTIMATE' | 'TIMEOUT'
  events: TimelineMarker[]
}

export class TimelineRecorder {
  private outlierRuns: OutlierRunTelemetry[] = []
  private maxStored: number = 20

  constructor(maxStored: number = 20) {
    this.maxStored = maxStored
  }

  /**
   * Evaluates if a battle result qualifies as a notable outlier run:
   * 1. A fatal wipe on a Milestone Boss or late-stage enemy.
   * 2. A high-tension clutch win with <15% Margin HP remaining.
   */
  public maybeRecordRun(
    botId: string,
    cohort: BotCohortId,
    day: number,
    stage: number,
    nodeNum: number,
    enemyName: string,
    isBoss: boolean,
    outcome: 'WIPE' | 'CLUTCH_WIN',
    finalPlayerHpPct: number,
    finalEnemyHpPct: number,
    totalDurationSec: number,
    fatalCause: 'RED_COUNTER' | 'HEAVY_ATTACK' | 'BOSS_ULTIMATE' | 'TIMEOUT' | undefined,
    events: TimelineMarker[],
  ) {
    // Only capture genuine outliers
    const isWipe = outcome === 'WIPE'
    const isClutch = outcome === 'CLUTCH_WIN' && finalPlayerHpPct <= 15.0

    if (!isWipe && !isClutch) return

    const run: OutlierRunTelemetry = {
      id: `outlier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      botId,
      cohort,
      day,
      stage,
      nodeNum,
      enemyName,
      isBoss,
      outcome,
      finalPlayerHpPct: Math.round(finalPlayerHpPct * 10) / 10,
      finalEnemyHpPct: Math.round(finalEnemyHpPct * 10) / 10,
      totalDurationSec: Math.round(totalDurationSec * 10) / 10,
      fatalCause,
      events: events.slice(0, 40), // cap to 40 event ticks for lightweight transport
    }

    // Keep prioritized mix of wipes and clutch wins
    this.outlierRuns.push(run)
    if (this.outlierRuns.length > this.maxStored) {
      // Retain boss wipes and closest clutches
      this.outlierRuns.sort((a, b) => (b.isBoss ? 1 : 0) - (a.isBoss ? 1 : 0))
      this.outlierRuns.pop()
    }
  }

  public getOutliers(): OutlierRunTelemetry[] {
    return [...this.outlierRuns]
  }

  public clear() {
    this.outlierRuns = []
  }
}
