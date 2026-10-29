import { BotSimulatorEngine, type SimulationResults, type BotCohortId } from './BotSimulatorEngine'

export interface ABProfileConfig {
  name: string
  enemyAtkMultiplier: number // Baseline: 1.0 (e.g. 0.9 or 1.15 in candidate)
  bossAtkMultiplier: number // Baseline: 1.0
  maxDamageReductionCap: number // Baseline: 0.55 (55%)
  counterPumpInterruptSuccessRate: number // Baseline: 1.0
  rigStatMultiplier: number // Baseline: 1.0
}

export interface MetricDelta {
  metric: string
  baseline: number
  candidate: number
  delta: number
  deltaPct: number
  unit: string
  isBetterWhenHigher: boolean
}

export interface ABDiffReport {
  seed: number
  profileA: ABProfileConfig
  profileB: ABProfileConfig
  resultsA: SimulationResults
  resultsB: SimulationResults
  progressionDeltas: Record<BotCohortId, { day30Delta: number; day90Delta: number }>
  milestoneBossWipeDeltas: Array<{ stage: number; baselineWipePct: number; candidateWipePct: number; deltaPct: number }>
  stockpileDeltas: Record<BotCohortId, { hashrateDelta: number; gemsDelta: number; blueprintsDelta: number }>
  summaryMarkdown: string
}

export const DEFAULT_PROFILE_A: ABProfileConfig = {
  name: 'Profile A (v2.2 Baseline)',
  enemyAtkMultiplier: 1.0,
  bossAtkMultiplier: 1.0,
  maxDamageReductionCap: 0.55,
  counterPumpInterruptSuccessRate: 1.0,
  rigStatMultiplier: 1.0,
}

export const DEFAULT_PROFILE_B: ABProfileConfig = {
  name: 'Profile B (Candidate Patch)',
  enemyAtkMultiplier: 1.08, // +8% higher enemy baseline ATK
  bossAtkMultiplier: 1.15, // +15% stronger Milestone Boss pressure
  maxDamageReductionCap: 0.50, // 50% DR cap
  counterPumpInterruptSuccessRate: 0.85, // 15% interrupt test
  rigStatMultiplier: 1.10, // +10% Rig stat amplification for paying tiers
}

export class DiffRunner {
  public static async runComparison(
    botCount: number,
    days: number,
    seed: number,
    profileA: ABProfileConfig = DEFAULT_PROFILE_A,
    profileB: ABProfileConfig = DEFAULT_PROFILE_B,
    onProgress?: (profile: 'A' | 'B', percent: number) => void,
  ): Promise<ABDiffReport> {
    // 1. Run Baseline Profile A
    const engineA = new BotSimulatorEngine(botCount, days, seed, {
      enemyAtkMultiplier: profileA.enemyAtkMultiplier,
      bossAtkMultiplier: profileA.bossAtkMultiplier,
      maxDamageReductionCap: profileA.maxDamageReductionCap,
      rigStatMultiplier: profileA.rigStatMultiplier,
    })
    const resultsA = await engineA.runSimulation((pct) => onProgress?.('A', pct))

    // 2. Run Candidate Profile B on identical seed
    const engineB = new BotSimulatorEngine(botCount, days, seed, {
      enemyAtkMultiplier: profileB.enemyAtkMultiplier,
      bossAtkMultiplier: profileB.bossAtkMultiplier,
      maxDamageReductionCap: profileB.maxDamageReductionCap,
      rigStatMultiplier: profileB.rigStatMultiplier,
    })
    const resultsB = await engineB.runSimulation((pct) => onProgress?.('B', pct))

    // 3. Compute Progression Deltas
    const cohorts: BotCohortId[] = ['f2p_casual', 'f2p_grinder', 'minnow', 'dolphin', 'whale']
    const progressionDeltas: Record<BotCohortId, { day30Delta: number; day90Delta: number }> = {
      f2p_casual: { day30Delta: 0, day90Delta: 0 },
      f2p_grinder: { day30Delta: 0, day90Delta: 0 },
      minnow: { day30Delta: 0, day90Delta: 0 },
      dolphin: { day30Delta: 0, day90Delta: 0 },
      whale: { day30Delta: 0, day90Delta: 0 },
    }

    for (const c of cohorts) {
      const aD30 = resultsA.progression.dayStages[c]?.day30 || 0
      const bD30 = resultsB.progression.dayStages[c]?.day30 || 0
      const aD90 = resultsA.progression.dayStages[c]?.day90 || 0
      const bD90 = resultsB.progression.dayStages[c]?.day90 || 0

      progressionDeltas[c] = {
        day30Delta: bD30 - aD30,
        day90Delta: bD90 - aD90,
      }
    }

    // 4. Milestone Boss Wipe Deltas (Stages 10, 20, 30, 40, 50, 100, 250)
    const milestoneStages = [10, 20, 30, 40, 50, 100]
    const milestoneBossWipeDeltas: ABDiffReport['milestoneBossWipeDeltas'] = []

    for (const stg of milestoneStages) {
      const aCp = resultsA.progression.topChokePoints.find((cp) => cp.stage === stg)
      const bCp = resultsB.progression.topChokePoints.find((cp) => cp.stage === stg)
      const aWipe = aCp ? aCp.wipeRatePct : 0
      const bWipe = bCp ? bCp.wipeRatePct : 0

      milestoneBossWipeDeltas.push({
        stage: stg,
        baselineWipePct: Math.round(aWipe * 10) / 10,
        candidateWipePct: Math.round(bWipe * 10) / 10,
        deltaPct: Math.round((bWipe - aWipe) * 10) / 10,
      })
    }

    // 5. Stockpile Deltas
    const stockpileDeltas: ABDiffReport['stockpileDeltas'] = {
      f2p_casual: { hashrateDelta: 0, gemsDelta: 0, blueprintsDelta: 0 },
      f2p_grinder: { hashrateDelta: 0, gemsDelta: 0, blueprintsDelta: 0 },
      minnow: { hashrateDelta: 0, gemsDelta: 0, blueprintsDelta: 0 },
      dolphin: { hashrateDelta: 0, gemsDelta: 0, blueprintsDelta: 0 },
      whale: { hashrateDelta: 0, gemsDelta: 0, blueprintsDelta: 0 },
    }

    for (const c of cohorts) {
      const aStock = resultsA.economy.stockpiles[c]?.day30 || { hashrate: 0, gems: 0, blueprints: 0 }
      const bStock = resultsB.economy.stockpiles[c]?.day30 || { hashrate: 0, gems: 0, blueprints: 0 }

      stockpileDeltas[c] = {
        hashrateDelta: bStock.hashrate - aStock.hashrate,
        gemsDelta: bStock.gems - aStock.gems,
        blueprintsDelta: bStock.blueprints - aStock.blueprints,
      }
    }

    // Generate Markdown Diff Table
    const summaryMarkdown = `
# A/B Configuration Diff Analysis (Seed #${seed})
**Profile A (Baseline):** ${profileA.name}
**Profile B (Candidate):** ${profileB.name}

## 1. 30-Day & 90-Day Progression Deltas
| Cohort | Baseline D30 | Candidate D30 | D30 Delta | Baseline D90 | Candidate D90 | D90 Delta |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${cohorts
  .map((c) => {
    const a30 = resultsA.progression.dayStages[c]?.day30 || 0
    const b30 = resultsB.progression.dayStages[c]?.day30 || 0
    const d30 = progressionDeltas[c].day30Delta
    const a90 = resultsA.progression.dayStages[c]?.day90 || 0
    const b90 = resultsB.progression.dayStages[c]?.day90 || 0
    const d90 = progressionDeltas[c].day90Delta
    const sign30 = d30 >= 0 ? `+${d30}` : `${d30}`
    const sign90 = d90 >= 0 ? `+${d90}` : `${d90}`
    return `| **${c.toUpperCase()}** | Stg ${a30} | Stg ${b30} | **${sign30}** | Stg ${a90} | Stg ${b90} | **${sign90}** |`
  })
  .join('\n')}

## 2. Milestone Boss Choke Point Wipe Rate Comparison
| Milestone Boss | Baseline Wipe % | Candidate Wipe % | Wipe Rate Delta | Balance Status |
| :--- | :--- | :--- | :--- | :--- |
${milestoneBossWipeDeltas
  .map((m) => {
    const sign = m.deltaPct >= 0 ? `+${m.deltaPct}%` : `${m.deltaPct}%`
    const status = m.candidateWipePct >= 18 && m.candidateWipePct <= 35 ? '🟢 HEALTHY TENSION' : m.candidateWipePct > 35 ? '🔴 SEVERE BOTTLENECK' : '🟡 TOO EASY'
    return `| **Stage ${m.stage} Boss** | ${m.baselineWipePct}% | ${m.candidateWipePct}% | **${sign}** | ${status} |`
  })
  .join('\n')}
`.trim()

    return {
      seed,
      profileA,
      profileB,
      resultsA,
      resultsB,
      progressionDeltas,
      milestoneBossWipeDeltas,
      stockpileDeltas,
      summaryMarkdown,
    }
  }
}
