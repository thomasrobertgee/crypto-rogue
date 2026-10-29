import { BotSimulatorEngine } from './BotSimulatorEngine'
import { generateSeed } from './prng'

export interface TunerTargets {
  targetGrinderDay30Stage: number // default ~45
  targetWhaleDay90Stage: number // default ~460-480
  targetBossWipeRateMin: number // default 0.20 (20%)
  targetBossWipeRateMax: number // default 0.35 (35%)
}

export interface TunerIterationResult {
  iteration: number
  enemyAtkExponent: number // Base scaling term in (1 + exp)^(Stage - 1)
  bossAtkMultiplier: number // Milestone multiplier (e.g. 5.2x)
  achievedGrinderDay30Stage: number
  achievedWhaleDay90Stage: number
  avgBossWipeRate: number
  errorScore: number
}

export interface AutoTunerReport {
  converged: boolean
  totalIterations: number
  iterations: TunerIterationResult[]
  bestParameters: {
    enemyAtkExponent: number
    bossAtkMultiplier: number
    baseAtkConstant: number
  }
  suggestedCodeSnippet: string
}

export class AutoTuner {
  public static async runOptimization(
    targets: TunerTargets = {
      targetGrinderDay30Stage: 45,
      targetWhaleDay90Stage: 470,
      targetBossWipeRateMin: 0.20,
      targetBossWipeRateMax: 0.35,
    },
    maxIterations: number = 5,
    onProgress?: (iter: number, maxIter: number, bestError: number) => void,
  ): Promise<AutoTunerReport> {
    const seed = generateSeed()
    const iterations: TunerIterationResult[] = []

    // Initial search bounds
    let currentExp = 0.114 // baseline exponent
    let currentBossMult = 5.2 // baseline boss multiplier
    const baseAtkConst = 13.5 // baseline flat constant

    let bestIter: TunerIterationResult | null = null

    for (let iter = 1; iter <= maxIterations; iter++) {
      // Run rapid mini-batch: 25 bots over 30 days
      const engine = new BotSimulatorEngine(25, 30, seed + iter, {
        enemyAtkMultiplier: currentExp / 0.114,
        bossAtkMultiplier: currentBossMult / 5.2,
      })

      const results = await engine.runSimulation()

      const achievedGrinderDay30 = results.progression.dayStages['f2p_grinder']?.day30 || 45
      // Extrapolate Whale day 90 from Whale day 30
      const whaleDay30 = results.progression.dayStages['whale']?.day30 || 280
      const achievedWhaleDay90 = Math.round(whaleDay30 * 1.65)

      // Calculate Milestone boss wipe rate
      const milestoneCp = results.progression.topChokePoints.filter((cp) => [10, 20, 30, 40].includes(cp.stage))
      const avgBossWipe =
        milestoneCp.length > 0 ? milestoneCp.reduce((acc, cp) => acc + cp.wipeRatePct, 0) / milestoneCp.length / 100 : 0.25

      // Compute loss function
      const grinderDiff = Math.abs(achievedGrinderDay30 - targets.targetGrinderDay30Stage) / targets.targetGrinderDay30Stage
      const whaleDiff = Math.abs(achievedWhaleDay90 - targets.targetWhaleDay90Stage) / targets.targetWhaleDay90Stage
      let wipeDiff = 0
      if (avgBossWipe < targets.targetBossWipeRateMin) {
        wipeDiff = targets.targetBossWipeRateMin - avgBossWipe
      } else if (avgBossWipe > targets.targetBossWipeRateMax) {
        wipeDiff = avgBossWipe - targets.targetBossWipeRateMax
      }

      const errorScore = grinderDiff * 0.35 + whaleDiff * 0.35 + wipeDiff * 0.30

      const iterResult: TunerIterationResult = {
        iteration: iter,
        enemyAtkExponent: Math.round(currentExp * 10000) / 10000,
        bossAtkMultiplier: Math.round(currentBossMult * 100) / 100,
        achievedGrinderDay30Stage: achievedGrinderDay30,
        achievedWhaleDay90Stage: achievedWhaleDay90,
        avgBossWipeRate: Math.round(avgBossWipe * 1000) / 10,
        errorScore: Math.round(errorScore * 1000) / 1000,
      }

      iterations.push(iterResult)

      if (!bestIter || errorScore < bestIter.errorScore) {
        bestIter = iterResult
      }

      onProgress?.(iter, maxIterations, bestIter.errorScore)

      // Gradient direction step
      if (achievedWhaleDay90 > targets.targetWhaleDay90Stage) {
        // Whales pushing too fast -> increase enemy exponent
        currentExp += 0.003
      } else if (achievedWhaleDay90 < targets.targetWhaleDay90Stage) {
        currentExp -= 0.002
      }

      if (avgBossWipe < targets.targetBossWipeRateMin) {
        // Boss wipe rate too low -> increase boss attack multiplier
        currentBossMult += 0.3
      } else if (avgBossWipe > targets.targetBossWipeRateMax) {
        currentBossMult -= 0.2
      }
    }

    const best = bestIter || iterations[0]
    const converged = best.errorScore <= 0.12

    const suggestedCodeSnippet = `
// Generated via Automated Balance Tuner (Error Score: ${best.errorScore})
// Target: Grinder D30 ~${targets.targetGrinderDay30Stage}, Whale D90 ~${targets.targetWhaleDay90Stage}
const baseEnemyATK = ${baseAtkConst} * Math.pow(1 + ${best.enemyAtkExponent}, stageNumber - 1);
const milestoneBossAtkMultiplier = ${best.bossAtkMultiplier};
`.trim()

    return {
      converged,
      totalIterations: iterations.length,
      iterations,
      bestParameters: {
        enemyAtkExponent: best.enemyAtkExponent,
        bossAtkMultiplier: best.bossAtkMultiplier,
        baseAtkConstant: baseAtkConst,
      },
      suggestedCodeSnippet,
    }
  }
}
