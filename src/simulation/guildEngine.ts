import type { PRNG } from './prng'
import type { BotCohortId } from './BotSimulatorEngine'

export interface SyndicateMember {
  botId: string
  cohort: BotCohortId
  weeklyDamageDealt: number
}

export interface Syndicate {
  id: string
  name: string
  members: SyndicateMember[]
  perkLevel: number
  totalWeeklyDamage: number
  unlockedVaultTiers: number
  sharedTreasuryGems: number
}

export interface GuildVaultTier {
  tier: number
  requiredDamage: number
  rewardHashrate: number
  rewardGems: number
  rewardBlueprints: number
}

export const GUILD_VAULT_TIERS: GuildVaultTier[] = [
  { tier: 1, requiredDamage: 50_000_000, rewardHashrate: 2_000, rewardGems: 50, rewardBlueprints: 2 },
  { tier: 2, requiredDamage: 150_000_000, rewardHashrate: 6_000, rewardGems: 150, rewardBlueprints: 5 },
  { tier: 3, requiredDamage: 300_000_000, rewardHashrate: 15_000, rewardGems: 300, rewardBlueprints: 10 },
  { tier: 4, requiredDamage: 500_000_000, rewardHashrate: 35_000, rewardGems: 750, rewardBlueprints: 20 },
]

export const SYNDICATE_NAMES = [
  'Nakamoto Consortium',
  'Whale Syndicate Alpha',
  'Genesis Block Cartel',
  'Solana Speed Demons',
  'Zero-Knowledge Order',
  'Ether Vanguard',
  'Margin Call Cartel',
  'Liquidity Arbitrage Guild',
  'Dark Pool Elite',
  'Hodl Diamond Hands',
  'Proof of Stake Hegemony',
  'DeFi Degens United',
  'Quantum Hedge Clan',
  'Bear Market Survivors',
  'Flash Loan Pioneers',
  'Belfort Capital Syndicate',
  'Satoshi Disciples',
]

export class GuildEngine {
  private prng: PRNG
  public syndicates: Syndicate[] = []
  private botToSyndicate: Map<string, string> = new Map()

  constructor(prng: PRNG) {
    this.prng = prng
  }

  /**
   * Partitions a pool of bots into 30-member Syndicates with balanced tier distributions.
   */
  public formSyndicates(bots: Array<{ id: string; cohort: BotCohortId }>) {
    this.syndicates = []
    this.botToSyndicate.clear()

    // Bucket by cohort
    const buckets: Record<BotCohortId, Array<{ id: string; cohort: BotCohortId }>> = {
      whale: [],
      dolphin: [],
      minnow: [],
      f2p_grinder: [],
      f2p_casual: [],
    }

    for (const b of bots) {
      buckets[b.cohort].push(b)
    }

    // Shuffle each bucket with seeded PRNG
    for (const c of Object.keys(buckets) as BotCohortId[]) {
      this.prng.shuffle(buckets[c])
    }

    const syndicateCount = Math.max(1, Math.ceil(bots.length / 30))

    for (let i = 0; i < syndicateCount; i++) {
      const name = SYNDICATE_NAMES[i % SYNDICATE_NAMES.length] + (i >= SYNDICATE_NAMES.length ? ` ${Math.floor(i / SYNDICATE_NAMES.length) + 1}` : '')
      const syndicate: Syndicate = {
        id: `syndicate_${i + 1}`,
        name,
        members: [],
        perkLevel: this.prng.rangeInt(1, 4), // Guild perk levels 1-4
        totalWeeklyDamage: 0,
        unlockedVaultTiers: 0,
        sharedTreasuryGems: 0,
      }
      this.syndicates.push(syndicate)
    }

    // Distribute members ensuring realistic mixed cohort composition
    // Target per syndicate: 1-2 Whales, 4-6 Dolphins, 10 Minnows, 12-14 F2P
    const distribute = (list: Array<{ id: string; cohort: BotCohortId }>) => {
      let currentIdx = 0
      while (list.length > 0) {
        const item = list.pop()!
        const syn = this.syndicates[currentIdx % this.syndicates.length]
        syn.members.push({
          botId: item.id,
          cohort: item.cohort,
          weeklyDamageDealt: 0,
        })
        this.botToSyndicate.set(item.id, syn.id)
        currentIdx++
      }
    }

    distribute(buckets.whale)
    distribute(buckets.dolphin)
    distribute(buckets.minnow)
    distribute(buckets.f2p_grinder)
    distribute(buckets.f2p_casual)
  }

  /**
   * Simulates daily participation in the $500,000,000 "Central Clearing House" Liquidity Heist.
   * Returns guild rewards and perks granted to the bot if active today.
   */
  public recordDailyHeistAttempt(
    botId: string,
    cohort: BotCohortId,
    stage: number,
    gearScore: number,
    isDormant: boolean,
  ): {
    patrolHashrateMultiplier: number
    heistRewardHashrate: number
    heistRewardGems: number
    heistRewardBlueprints: number
  } {
    const synId = this.botToSyndicate.get(botId)
    if (!synId || isDormant) {
      return { patrolHashrateMultiplier: 1.0, heistRewardHashrate: 0, heistRewardGems: 0, heistRewardBlueprints: 0 }
    }

    const syndicate = this.syndicates.find((s) => s.id === synId)
    if (!syndicate) {
      return { patrolHashrateMultiplier: 1.0, heistRewardHashrate: 0, heistRewardGems: 0, heistRewardBlueprints: 0 }
    }

    // Passive Guild Perk Buff: +2.5% to +10% Patrol Hashrate based on syndicate perk level
    const patrolBuff = 1.0 + syndicate.perkLevel * 0.025

    // Estimate daily raid heist damage based on cohort and gear score
    const cohortDmgMultiplier =
      cohort === 'whale' ? 4.5 : cohort === 'dolphin' ? 2.2 : cohort === 'minnow' ? 1.4 : cohort === 'f2p_grinder' ? 1.0 : 0.6
    const baseDamage = (stage * 15_000 + gearScore * 50) * cohortDmgMultiplier * this.prng.range(0.85, 1.25)

    syndicate.totalWeeklyDamage += baseDamage

    const member = syndicate.members.find((m) => m.botId === botId)
    if (member) member.weeklyDamageDealt += baseDamage

    // Check unlocked vault tiers
    let rewardHashrate = 0
    let rewardGems = 0
    let rewardBlueprints = 0

    for (const v of GUILD_VAULT_TIERS) {
      if (syndicate.totalWeeklyDamage >= v.requiredDamage && syndicate.unlockedVaultTiers < v.tier) {
        syndicate.unlockedVaultTiers = v.tier
        rewardHashrate += v.rewardHashrate
        rewardGems += v.rewardGems
        rewardBlueprints += v.rewardBlueprints
      }
    }

    return {
      patrolHashrateMultiplier: patrolBuff,
      heistRewardHashrate: rewardHashrate,
      heistRewardGems: rewardGems,
      heistRewardBlueprints: rewardBlueprints,
    }
  }

  /**
   * Resets the weekly Liquidity Heist cycle every 7 days.
   */
  public resetWeeklyHeist() {
    for (const syn of this.syndicates) {
      syn.totalWeeklyDamage = 0
      syn.unlockedVaultTiers = 0
      for (const m of syn.members) {
        m.weeklyDamageDealt = 0
      }
    }
  }

  public getSummary() {
    let topSyndicate = this.syndicates[0]
    let totalRaidDamage = 0
    let totalVaultTiersUnlocked = 0

    for (const syn of this.syndicates) {
      totalRaidDamage += syn.totalWeeklyDamage
      totalVaultTiersUnlocked += syn.unlockedVaultTiers
      if (!topSyndicate || syn.totalWeeklyDamage > topSyndicate.totalWeeklyDamage) {
        topSyndicate = syn
      }
    }

    return {
      totalSyndicates: this.syndicates.length,
      topSyndicateName: topSyndicate?.name || 'N/A',
      topSyndicateDamage: topSyndicate?.totalWeeklyDamage || 0,
      avgVaultTiersUnlocked: this.syndicates.length > 0 ? (totalVaultTiersUnlocked / this.syndicates.length).toFixed(1) : '0',
    }
  }
}
