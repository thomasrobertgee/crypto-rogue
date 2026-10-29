import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  Coins,
  Sparkles,
  Lock,
  TrendingUp,
  Flame,
  Pause,
} from 'lucide-react'
import type {
  EffectSpec,
  EnemyConfig,
  OwnedCoin,
  RunEventConfig,
  RunEventOutcome,
} from '../types/game.types'
import { STAGES, NODES_PER_STAGE, getStageConfig } from '../config/stages.config'
import { EVENT_MAP, RUN_EVENTS } from '../config/events.config'
import { COINS, COIN_MAP } from '../config/coins.config'
import { RELICS } from '../config/relics.config'
import { COMBAT } from '../config/combat.config'
import { HERO_MAP, type HeroId } from '../config/heroes.config'
import { getFloorNumber, MARKET_WEATHERS } from '../config/weather.config'
import { EVOLUTION_MAP } from '../config/evolutions.config'
import {
  createSim,
  stepSim,
  portfolio,
  reviveSim,
  type SimState,
  type CombatEvent,
  type Candle,
} from '../engine/combat'
import { addCoins, nextRarity, pickByRarity } from '../engine/economy'
import { AudioSynth } from '../engine/AudioSynth'
import { AudioHaptics } from '../utils/audioHaptics'
import { fmtUsd } from '../engine/format'
import { showRewardedAd } from '../services/ads'
import { useMetaStore, selectActiveLoadout, type RunPayoutResult } from '../state/useMetaStore'
import { useRunStore, type CombatSpeed } from '../state/useRunStore'
import { RunNodeBar } from '../components/battle/RunNodeBar'
import { TopHud } from '../components/battle/TopHud'
import {
  BossArena,
  type FloatingTextSpec,
  type ProjectileSpec,
} from '../components/battle/BossArena'
import { CoinTooltipModal } from '../components/battle/CoinTooltipModal'
import { ShadyEventModal } from '../components/battle/ShadyEventModal'
import { BlackMarketModal } from '../components/battle/BlackMarketModal'
import { WallBreakerOfferModal } from '../components/modals/WallBreakerOfferModal'
import { MarginCallModal, RunSummaryModal } from '../components/battle/RunEndModals'
import { SkillDraftModal } from '../components/battle/SkillDraftModal'
import { MarginCallOfferModal } from '../components/modals/MarginCallOfferModal'
import { TacticalPauseModal } from '../components/modals/TacticalPauseModal'
import { TugOfWarMiniGame } from '../components/battle/TugOfWarMiniGame'
import { PreBossLeverageModal } from '../components/battle/PreBossLeverageModal'
import { CoinMascotSvg } from '../components/GameArtwork'
import { DynamicIcon } from '../components/DynamicIcon'

type BattlePhase = 'combat' | 'paused'

// Session-scoped flag so the contextual 2-hour boss defeat offer triggers on the first boss loss of the session
let sessionBossOfferTriggered = false

interface BattleRunScreenProps {
  onReturnToHub?: () => void
}

export function BattleRunScreen({ onReturnToHub }: BattleRunScreenProps = {}) {
  // Meta state
  const meta = useMetaStore()
  const loadout = useMemo(() => selectActiveLoadout(meta), [meta])
  const equippedHeroId = meta.equippedHeroId ?? 'rookie_satoshi'
  const equippedHeroStars = (meta.heroStars ?? {})[equippedHeroId] ?? 1
  const equippedHeroSkills = (meta.heroSkillLevels ?? {})[equippedHeroId] ?? {
    passiveLv: 1,
    activeLv: 1,
  }
  const equippedHeroSkill = meta.getHeroEquippedSkill(equippedHeroId)
  const equippedSkillMastery = meta.getHeroSkillMastery(equippedHeroSkill.id)
  const effectiveSkillMaxCharge = Math.max(
    2,
    equippedHeroSkill.skillChargeTicks - Math.floor(equippedSkillMastery.level / 2),
  )

  // Auto-Skill unlocks upon clearing Stage 1, dev override, VIP Executive Pass, or Whale Executive Pass
  const isAutoSkillUnlocked = Boolean(
    meta.devUnlockAllUi ||
    meta.highestStageCleared >= 1 ||
    meta.currentStage >= 2 ||
    meta.isVipAdFree ||
    meta.seasonPassType === 'whale',
  )

  // Run state
  const run = useRunStore()

  // Local UI state
  const [phase, setPhase] = useState<BattlePhase>('combat')
  const [inspectedCoin, setInspectedCoin] = useState<OwnedCoin | null>(null)
  const [relicPulses, setRelicPulses] = useState<Record<string, number>>({})
  const [projectiles, setProjectiles] = useState<ProjectileSpec[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextSpec[]>([])
  const [screenShake, setScreenShake] = useState(false)
  const [megaCandleActive, setMegaCandleActive] = useState(false)
  const [hazardBanner, setHazardBanner] = useState<{ name: string; description: string } | null>(null)
  const [nodeVictoryBanner, setNodeVictoryBanner] = useState<{ cash: number; xp: number } | null>(null)
  const [marginCallOpen, setMarginCallOpen] = useState(false)
  const [bossFlashOfferOpen, setBossFlashOfferOpen] = useState(false)
  const [adLoading, setAdLoading] = useState(false)
  const [heroSkillCharge, setHeroSkillCharge] = useState(3)
  const autoSkillHoldStartRef = useRef<number | null>(null)
  const [autoLockToast, setAutoLockToast] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [nodeClearedWaitingDraft, setNodeClearedWaitingDraft] = useState(false)
  const [summaryModal, setSummaryModal] = useState<{
    wonStage: boolean
    stageNumber: number
    nodesCleared: number
    payout: RunPayoutResult
  } | null>(null)
  const [tacticalPauseOpen, setTacticalPauseOpen] = useState(false)
  const [dangerVignette, setDangerVignette] = useState(false)
  const [heroHitFlash, setHeroHitFlash] = useState(false)
  const [renderTick, setRenderTick] = useState(0)

  const simRef = useRef<SimState | null>(null)
  const candleHistoryRef = useRef<Candle[]>([])
  const nextIdRef = useRef(1)
  const activeNodeRef = useRef<string>('')

  // Auto-start a run at currentStage if no run is active and no summary modal is open
  useEffect(() => {
    if (!run.isActive && !summaryModal) {
      run.startRun(meta.currentStage)
    }
  }, [run.isActive, summaryModal, meta.currentStage, run])

  // 3-Second Live Market Loading Screen timer upon starting a run
  useEffect(() => {
    if (!run.isEnteringMarket) {
      setLoadingProgress(100)
      return
    }
    setLoadingProgress(0)
    const start = performance.now()
    const duration = 3000
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - start
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setLoadingProgress(pct)
      if (elapsed >= duration) {
        window.clearInterval(interval)
        useRunStore.getState().finishMarketLoading()
      }
    }, 50)
    return () => window.clearInterval(interval)
  }, [run.isEnteringMarket])

  const stageCfg = getStageConfig(run.currentStageId || 1)
  const currentNode = stageCfg.nodes[(run.currentNodeIndex || 1) - 1] ?? stageCfg.nodes[0]

  // Dynamic Market Weather per floor
  const currentFloor = getFloorNumber(run.currentNodeIndex || 1)
  const activeWeatherId = run.floorWeathers[currentFloor] ?? 'retail_fomo'
  const activeWeatherConfig = MARKET_WEATHERS[activeWeatherId]

  // Node 15 Liquidity Tug-of-War mini-game interception
  const isTugOfWarNode = run.currentNodeIndex === 15

  // Pre-Boss Fear & Greed 2x Leverage Contract
  const isBossNode = currentNode.type === 'boss'
  const leverageContract = run.leverageContracts[run.currentNodeIndex]
  const needsLeverageContract = isBossNode && !leverageContract

  // Active Shady Event when on an 'event' node
  const activeEvent: RunEventConfig | null = useMemo(() => {
    if (currentNode.type !== 'event') return null
    const pool = (currentNode.eventPool ?? [])
      .map((id) => EVENT_MAP[id])
      .filter((e): e is RunEventConfig => !!e && e.minStage <= stageCfg.stage)
    const list = pool.length > 0 ? pool : RUN_EVENTS
    return list[(stageCfg.stage + run.currentNodeIndex) % list.length]
  }, [currentNode, stageCfg.stage, run.currentNodeIndex])

  // Fallback enemy for display when on event/shop node
  const fallbackEnemy = useMemo(() => {
    return (
      currentNode.enemy ??
      stageCfg.nodes.find((n) => n.index >= currentNode.index && n.enemy)?.enemy ??
      stageCfg.nodes[stageCfg.nodes.length - 1].enemy!
    )
  }, [currentNode, stageCfg.nodes])

  const spawnFloat = useCallback(
    (
      text: string,
      color: FloatingTextSpec['color'],
      slot?: number,
      subtext?: string,
      isCrit?: boolean,
    ) => {
      const id = nextIdRef.current++
      setFloatingTexts((prev) => [
        ...prev.slice(-14),
        { id, text, subtext, color, slot, isCrit, createdAt: performance.now() },
      ])
    },
    [],
  )

  // Hero Active Skill Trigger (Solely triggered via bottom-right Hero Skill button or Auto-Skill)
  const handleTriggerHeroSkill = useCallback(() => {
    if (heroSkillCharge < effectiveSkillMaxCharge) return
    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    setHeroSkillCharge(0)
    autoSkillHoldStartRef.current = null

    const sim = simRef.current
    const heroLvl = (meta.ownedHeroes ?? { rookie_satoshi: 1 })[equippedHeroId] ?? 1
    const starMultiplier = 1 + (equippedHeroStars - 1) * 0.35
    const activeSkillMultiplier = 1 + (equippedSkillMastery.level - 1) * 0.14 + (equippedSkillMastery.stars - 1) * 0.25
    const lvlScale = (1 + (heroLvl - 1) * 0.12) * starMultiplier * activeSkillMultiplier

    if (sim && phase === 'combat') {
      // Hero Skill Counter-Pump Interrupt Check (75% to 99% charge bar, broadened by Orderbook Jammer & Masteries)
      const heavyPct = sim.enemy.attackTimer / Math.max(0.1, sim.enemy.cfg.attackCooldown)
      const ultCd = Math.max(0.1, sim.enemy.cfg.ultimateCooldown ?? 7.5)
      const ultPct = sim.enemy.cfg.isBoss ? (sim.enemy.ultimateTimer ?? 0) / ultCd : 0

      const runMods = run.getAggregatedSkillModifiers()
      const masteryPassives = meta.getHeroAggregatedPassiveMastery(equippedHeroId)
      const totalWindowBonus = (runMods.interruptWindowBonus ?? 0) + (masteryPassives.interruptWindowBonus ?? 0)
      const minThreshold = totalWindowBonus ? Math.max(0.40, 0.75 - totalWindowBonus) : 0.75
      const isHeavyInterrupt = heavyPct >= minThreshold && heavyPct <= 0.999
      const isUltInterrupt = sim.enemy.cfg.isBoss && ultPct >= minThreshold && ultPct <= 0.999
      const isInterrupt = isHeavyInterrupt || isUltInterrupt

      if (isInterrupt) {
        if (isHeavyInterrupt) sim.enemy.attackTimer = 0
        if (isUltInterrupt) {
          if (sim.enemy.cfg.hasIronWill) {
            const currentArmor = sim.enemy.ironWillArmorRemaining ?? (sim.enemy.cfg.ironWillArmor ?? 2)
            if (currentArmor > 1) {
              // Crack 1 armor segment, slow cast by 35%
              sim.enemy.ironWillArmorRemaining = currentArmor - 1
              sim.enemy.ultimateTimer = Math.max(0, (sim.enemy.ultimateTimer ?? 0) * 0.65)
              spawnFloat('🛡️ IRON WILL CRACKED (1/2)!', 'gold', undefined, '-35% CAST SPEED', true)
              AudioSynth.playRelicTrigger()
              AudioHaptics.playCounterPump()
              AudioHaptics.vibrateCounterPump()
            } else {
              // 2nd interrupt: fully stagger and cancel cast!
              sim.enemy.ironWillArmorRemaining = sim.enemy.cfg.ironWillArmor ?? 2
              sim.enemy.ultimateTimer = 0
              spawnFloat('⚡ IRON WILL SHATTERED! STAGGERED!', 'gold', undefined, '+1.5x CRIT CANCEL!', true)
              AudioSynth.playRelicTrigger()
              AudioHaptics.playCounterPump()
              AudioHaptics.vibrateCounterPump()
            }
          } else {
            sim.enemy.ultimateTimer = 0
            spawnFloat('⚡ COUNTER-PUMP INTERRUPT!', 'gold', undefined, '+1.5x CRIT CANCEL!', true)
            AudioSynth.playRelicTrigger()
            AudioHaptics.playCounterPump()
            AudioHaptics.vibrateCounterPump()
          }
        } else if (isHeavyInterrupt) {
          spawnFloat('⚡ COUNTER-PUMP INTERRUPT!', 'gold', undefined, '+1.5x CRIT CANCEL!', true)
          AudioSynth.playRelicTrigger()
          AudioHaptics.playCounterPump()
          AudioHaptics.vibrateCounterPump()
        }
      }

      const interruptMultiplier = isInterrupt ? 1.5 : 1.0
      const finalScale = lvlScale * interruptMultiplier

      // Execute Action Effect according to the equipped Hero Skill
      const action = equippedHeroSkill.actionEffect
      if (action === 'genesis_pump') {
        const dmg = Math.round(portfolio(sim) * 0.28 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.coins.forEach((c) => {
          c.capacityPct = Math.round((c.capacityPct + 15) * 10) / 10
          c.cash = sim.baseSeedCapital * (c.capacityPct / 100)
          c.preventDown = true
        })
        spawnFloat(`GENESIS PUMP +${fmtUsd(dmg)}!`, 'gold', undefined, 'ALL COINS +15% CAP & NEXT GREEN!', true)
      } else if (action === 'yolo_leverage') {
        const dmg = Math.round(portfolio(sim) * 0.45 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        spawnFloat(`YOLO LEVERAGE +${fmtUsd(dmg)}!`, 'green', undefined, '300% APE CRIT & +45% UP ODDS!', true)
      } else if (action === 'fomo_rush') {
        const dmg = Math.round(portfolio(sim) * 0.35 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.coins.forEach((c) => {
          c.buffs.push({ kind: 'tickSpeed', value: -0.25, isFraction: true, remaining: 6 })
        })
        spawnFloat(`FOMO RUSH +${fmtUsd(dmg)}!`, 'gold', undefined, '+25% TICK SPEED RUSH (6 TICKS)!', true)
      } else if (action === 'hostile_takeover') {
        const dmg = Math.round(sim.enemy.maxHp * 0.16 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.idleCash += Math.round(300 * finalScale)
        sim.shield += 25
        sim.coins.forEach((c) => {
          c.capacityPct = Math.round((c.capacityPct + 25) * 10) / 10
          c.cash = sim.baseSeedCapital * (c.capacityPct / 100)
        })
        spawnFloat(`HOSTILE TAKEOVER +${fmtUsd(dmg)}!`, 'gold', undefined, '+$300 LIQUIDITY & +25 SHIELD', true)
      } else if (action === 'boiler_room') {
        const dmg = Math.round(portfolio(sim) * 0.38 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.idleCash += Math.round(500 * finalScale)
        spawnFloat(`BOILER ROOM BLITZ +${fmtUsd(dmg)}!`, 'gold', undefined, '+$500 INSTANT CASH & 38% DMG!', true)
      } else if (action === 'pump_and_dump') {
        const dmg = Math.round(sim.enemy.maxHp * 0.22 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.enemy.attackTimer = 0
        spawnFloat(`PUMP & DUMP SYNDICATE +${fmtUsd(dmg)}!`, 'gold', undefined, '22% BOSS HP & ATTACK PURGED!', true)
      } else if (action === 'royal_all_in') {
        const dmg = Math.round(portfolio(sim) * 0.48 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.idleCash += Math.round(450 * finalScale)
        sim.shield += 60
        spawnFloat(`ROYAL ALL-IN +${fmtUsd(dmg)}!`, 'gold', undefined, '2.6x GOLDEN CANDLE & +60 SHIELD!', true)
      } else if (action === 'jackpot_squeeze') {
        const dmg = Math.round(portfolio(sim) * 0.55 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.coins.forEach((c) => {
          c.buffs.push({ kind: 'preventDown', value: 1, isFraction: false, remaining: 3 })
        })
        spawnFloat(`JACKPOT SQUEEZE +${fmtUsd(dmg)}!`, 'gold', undefined, '55% PORTFOLIO & 3x GREEN ROLLS!', true)
      } else if (action === 'vault_dividend') {
        const dmg = Math.round(portfolio(sim) * 0.30 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        run.healMargin(Math.round(50 * finalScale))
        sim.idleCash += Math.round(750 * finalScale)
        sim.shield += 50
        spawnFloat(`VAULT DIVIDEND +${fmtUsd(dmg)}!`, 'gold', undefined, '+50 MARGIN HP & +$750 CASH!', true)
      } else if (action === 'whale_intervention') {
        const dmg = Math.round(sim.enemy.maxHp * 0.30 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.enemy.attackTimer = 0
        if (sim.enemy.cfg.isBoss) sim.enemy.ultimateTimer = 0
        sim.shield += 80
        spawnFloat(`WHALE INTERVENTION +${fmtUsd(dmg)}!`, 'gold', undefined, '30% BOSS HP & +80 SHIELD!', true)
      } else if (action === 'flash_crash') {
        const dmg = Math.round(sim.enemy.maxHp * 0.40 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.enemy.attackTimer = 0
        sim.shield += 75
        spawnFloat(`FLASH CRASH +${fmtUsd(dmg)}!`, 'cyan', undefined, '40% BOSS HP & +75 SHIELD!', true)
      } else if (action === 'latency_jam') {
        const dmg = Math.round(portfolio(sim) * 0.42 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.enemy.attackTimer = 0
        if (sim.enemy.cfg.isBoss) sim.enemy.ultimateTimer = 0
        spawnFloat(`LATENCY JITTER JAM +${fmtUsd(dmg)}!`, 'cyan', undefined, 'ORDERBOOK JAMMED & CAST BARS RESET!', true)
      } else if (action === 'arbitrage_singularity') {
        const dmg = Math.round(portfolio(sim) * 0.65 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.coins.forEach((c) => {
          c.buffs.push({ kind: 'tickSpeed', value: -0.35, isFraction: true, remaining: 8 })
        })
        spawnFloat(`ARBITRAGE SINGULARITY +${fmtUsd(dmg)}!`, 'cyan', undefined, '65% PORTFOLIO & +35% OVERCLOCK!', true)
      } else if (action === 'quantum_reversal') {
        const lostHp = Math.max(0, run.maxMarginHp - run.marginHp)
        run.healMargin(Math.round((lostHp * 0.35 + 30) * finalScale))
        sim.shield += 100
        sim.enemy.attackTimer = 0
        spawnFloat(`QUANTUM TIME-REVERSAL!`, 'cyan', undefined, 'LEDGER REVERSED & +100 SHIELD!', true)
      } else if (action === 'halving_supernova') {
        const dmg = Math.round(sim.enemy.maxHp * 0.55 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.enemy.attackTimer = 0
        sim.shield += 100
        sim.coins.forEach((c) => {
          c.capacityPct = Math.round(c.capacityPct * 1.5 * 10) / 10
          c.cash = sim.baseSeedCapital * (c.capacityPct / 100)
        })
        spawnFloat(`HALVING SUPERNOVA +${fmtUsd(dmg)}!`, 'gold', undefined, '55% BOSS HP & GENESIS SURGE!', true)
      } else if (action === 'proof_of_work') {
        sim.shield += Math.round(150 * finalScale)
        sim.idleCash += Math.round(500 * finalScale)
        spawnFloat(`PROOF OF WORK BASTION!`, 'gold', undefined, '+150 CONSENSUS SHIELD!', true)
      } else if (action === 'genesis_block') {
        const dmg = Math.round(portfolio(sim) * 0.50 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.enemy.attackTimer = -4.0
        spawnFloat(`GENESIS BLOCK STUN +${fmtUsd(dmg)}!`, 'gold', undefined, 'BLOCK 0 FREEZE (4s)!', true)
      } else if (action === 'difficulty_retarget') {
        const dmg = Math.round(sim.enemy.maxHp * 0.60 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        sim.enemy.cfg.attackCooldown = Math.round(sim.enemy.cfg.attackCooldown * 1.5 * 10) / 10
        sim.shield += 120
        spawnFloat(`DIFFICULTY RETARGET +${fmtUsd(dmg)}!`, 'gold', undefined, '60% BOSS HP & ENEMY SLOWED 50%!', true)
      } else {
        const dmg = Math.round(portfolio(sim) * 0.40 * finalScale)
        sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg)
        spawnFloat(`${equippedHeroSkill.name.toUpperCase()} +${fmtUsd(dmg)}!`, 'gold', undefined, 'HERO SURGE!', true)
      }

      setScreenShake(true)
      window.setTimeout(() => setScreenShake(false), 240)
      setRenderTick((t) => t + 1)
    } else {
      run.addCash(Math.round(150 * lvlScale))
      spawnFloat(`${equippedHeroSkill.name.toUpperCase()}!`, 'gold', undefined, '+$150 SEED BOOST', true)
    }
  }, [
    effectiveSkillMaxCharge,
    equippedHeroId,
    equippedHeroSkill,
    equippedHeroStars,
    equippedSkillMastery.level,
    equippedSkillMastery.stars,
    heroSkillCharge,
    meta,
    phase,
    run,
    spawnFloat,
  ])

  // Auto-fire Hero Active Skill with Counter-Pump Interrupt Hold (>60% cast bar)
  useEffect(() => {
    if (
      !isAutoSkillUnlocked ||
      !run.autoHeroSkill ||
      phase !== 'combat' ||
      run.isEnteringMarket ||
      run.pendingSkillDrafts > 0 ||
      heroSkillCharge < effectiveSkillMaxCharge ||
      simRef.current?.outcome !== 'running'
    ) {
      autoSkillHoldStartRef.current = null
      return
    }

    const sim = simRef.current
    if (!sim) return

    const heavyPct = sim.enemy.attackTimer / Math.max(0.1, sim.enemy.cfg.attackCooldown)
    const ultCd = Math.max(0.1, sim.enemy.cfg.ultimateCooldown ?? 7.5)
    const ultPct = sim.enemy.cfg.isBoss ? (sim.enemy.ultimateTimer ?? 0) / ultCd : 0

    const runMods = run.getAggregatedSkillModifiers()
    const masteryPassives = meta.getHeroAggregatedPassiveMastery(equippedHeroId)
    const totalWindowBonus = (runMods.interruptWindowBonus ?? 0) + (masteryPassives.interruptWindowBonus ?? 0)
    const minThreshold = totalWindowBonus ? Math.max(0.40, 0.75 - totalWindowBonus) : 0.75

    // Check if currently inside the interrupt window (>= minThreshold) -> Fire immediately!
    const isHeavyInterrupt = heavyPct >= minThreshold && heavyPct <= 0.999
    const isUltInterrupt = sim.enemy.cfg.isBoss && ultPct >= minThreshold && ultPct <= 0.999
    if (isHeavyInterrupt || isUltInterrupt) {
      autoSkillHoldStartRef.current = null
      handleTriggerHeroSkill()
      return
    }

    // If an Enemy Heavy Attack or Boss Ultimate cast bar is charging (>60%), hold the skill for up to 1.5s
    const isHeavyCharging = heavyPct >= 0.60 && heavyPct < minThreshold
    const isUltCharging = sim.enemy.cfg.isBoss && ultPct >= 0.60 && ultPct < minThreshold
    if (isHeavyCharging || isUltCharging) {
      if (autoSkillHoldStartRef.current === null) {
        autoSkillHoldStartRef.current = Date.now()
      }
      if (Date.now() - autoSkillHoldStartRef.current < 1500) {
        // Hold skill for up to 1.5s to trigger Counter-Pump Interrupt!
        return
      }
    }

    // Cast bar not charging >60% or hold exceeded 1.5s -> fire immediately
    autoSkillHoldStartRef.current = null
    handleTriggerHeroSkill()
  }, [
    isAutoSkillUnlocked,
    run.autoHeroSkill,
    phase,
    run.isEnteringMarket,
    run.pendingSkillDrafts,
    heroSkillCharge,
    effectiveSkillMaxCharge,
    equippedHeroId,
    meta,
    run,
    renderTick,
    handleTriggerHeroSkill,
  ])

  const handleCombatEvents = useCallback(
    (events: CombatEvent[], sim: SimState) => {
      const now = Date.now()
      const perfNow = performance.now()
      for (const ev of events) {
        switch (ev.type) {
          case 'roll': {
            setHeroSkillCharge((c) => Math.min(effectiveSkillMaxCharge, c + 1))
            if (ev.outcome === 'up') {
              AudioSynth.playGreenCandle()
              AudioHaptics.playCoinTick()
              AudioHaptics.vibrateGreenTick()
              // Record lifetime biggest green candle (XP is awarded strictly post-battle upon enemy defeat)
              useMetaStore.getState().recordBiggestGreenCandle(ev.damage)
              useMetaStore.getState().incrementSeasonMissionProgress('damageDealt', Math.round(ev.damage))
              const pid = nextIdRef.current++
              setProjectiles((p) => [
                ...p.slice(-16),
                { id: pid, slot: ev.slot, isGreen: true, isCrit: ev.crit, createdAt: perfNow },
              ])
              spawnFloat(
                `+${fmtUsd(ev.damage)} DMG!`,
                'green',
                ev.slot,
                ev.crit ? 'CRIT PUMP!' : undefined,
                ev.crit,
              )
              if (ev.crit) {
                setScreenShake(true)
                window.setTimeout(() => setScreenShake(false), 180)
              }
            } else if (ev.outcome === 'down') {
              AudioSynth.playRedDump()
              if (ev.short && ev.damage > 0) {
                const pid = nextIdRef.current++
                setProjectiles((p) => [
                  ...p.slice(-16),
                  { id: pid, slot: ev.slot, isGreen: false, isCrit: false, createdAt: perfNow },
                ])
                spawnFloat(
                  `SHORT +${fmtUsd(ev.damage)} DMG`,
                  'violet',
                  ev.slot,
                  ev.cashDelta >= 0
                    ? `+${fmtUsd(ev.cashDelta)} DIP ACCUM!`
                    : `-${fmtUsd(Math.abs(ev.cashDelta))}`,
                )
              } else if (ev.cashDelta > 0) {
                spawnFloat(`+${fmtUsd(ev.cashDelta)} DIP ACCUM!`, 'cyan', ev.slot)
              } else {
                spawnFloat(`-${fmtUsd(Math.abs(ev.cashDelta))}`, 'red', ev.slot)
              }
            }
            break
          }
          case 'relic': {
            AudioSynth.playRelicTrigger()
            setRelicPulses((prev) => ({ ...prev, [ev.relicId]: now }))
            break
          }
          case 'passive': {
            spawnFloat(ev.name.toUpperCase(), 'cyan', ev.slot)
            break
          }
          case 'enemyCounter': {
            AudioSynth.playRedDump()
            AudioHaptics.playRedCounter()
            AudioHaptics.vibrateRedCounter()
            const pid = nextIdRef.current++
            setProjectiles((p) => [
              ...p.slice(-16),
              { id: pid, slot: ev.slot, isGreen: false, isCrit: false, createdAt: perfNow, isEnemyProjectile: true },
            ])
            if (ev.damage > 0) {
              setDangerVignette(true)
              window.setTimeout(() => setDangerVignette(false), 350)
              setHeroHitFlash(true)
              window.setTimeout(() => setHeroHitFlash(false), 300)
              setScreenShake(true)
              window.setTimeout(() => setScreenShake(false), 240)
              spawnFloat(
                `💥 -${Math.ceil(ev.damage)} MARGIN HP!`,
                'red',
                undefined,
                ev.absorbed > 0 ? `COUNTER • ${Math.ceil(ev.absorbed)} SHIELDED` : 'RED COUNTER-STRIKE!',
                true,
              )
            } else if (ev.absorbed > 0) {
              spawnFloat(`SHIELDED ${Math.ceil(ev.absorbed)}`, 'cyan')
            }
            break
          }
          case 'enemyAttack': {
            AudioSynth.playRedDump()
            const pid = nextIdRef.current++
            setProjectiles((p) => [
              ...p.slice(-16),
              { id: pid, slot: 1, isGreen: false, isCrit: true, createdAt: perfNow, isEnemyProjectile: true },
            ])
            if (ev.damage > 0) {
              setDangerVignette(true)
              window.setTimeout(() => setDangerVignette(false), 350)
              setHeroHitFlash(true)
              window.setTimeout(() => setHeroHitFlash(false), 300)
              setScreenShake(true)
              window.setTimeout(() => setScreenShake(false), 240)
              spawnFloat(
                `💥 -${Math.ceil(ev.damage)} MARGIN HP!`,
                'red',
                undefined,
                ev.absorbed > 0 ? `HEAVY DUMP • ${Math.ceil(ev.absorbed)} SHIELDED` : '⚠️ HEAVY DUMP!',
                true,
              )
            } else if (ev.absorbed > 0) {
              spawnFloat(`SHIELDED ${Math.ceil(ev.absorbed)}`, 'cyan')
            }
            break
          }
          case 'bossUltimate': {
            AudioSynth.playBossAlarm()
            AudioHaptics.vibrateBossUltimate()
            const pid = nextIdRef.current++
            setProjectiles((p) => [
              ...p.slice(-16),
              { id: pid, slot: 2, isGreen: false, isCrit: true, createdAt: perfNow, isEnemyProjectile: true },
            ])
            setDangerVignette(true)
            window.setTimeout(() => setDangerVignette(false), 500)
            setHeroHitFlash(true)
            window.setTimeout(() => setHeroHitFlash(false), 450)
            setScreenShake(true)
            window.setTimeout(() => setScreenShake(false), 350)
            spawnFloat(
              `☠️ -${Math.ceil(ev.damage)} MARGIN HP!`,
              'violet',
              undefined,
              `BLACK SWAN! -${ev.capacityWiped}% CAP`,
              true,
            )
            break
          }
          case 'hazard': {
            AudioSynth.playBossAlarm()
            setHazardBanner({ name: ev.name, description: ev.description })
            window.setTimeout(() => setHazardBanner(null), 2600)
            break
          }
          case 'bonusDamage': {
            spawnFloat(`+${fmtUsd(ev.damage)} SYNERGY DMG!`, 'gold', undefined, undefined, true)
            break
          }
          case 'megaCandle': {
            AudioSynth.playBossAlarm()
            setMegaCandleActive(true)
            window.setTimeout(() => setMegaCandleActive(false), 800)
            setScreenShake(true)
            window.setTimeout(() => setScreenShake(false), 240)
            spawnFloat(`MEGA-CANDLE +${fmtUsd(ev.damage)}!`, 'gold', ev.slot, 'HARD-FORK BURST!', true)
            break
          }
          case 'victory': {
            AudioHaptics.playVictoryJingle()
            useMetaStore.getState().incrementSeasonMissionProgress('enemiesDefeated', 1)
            if (currentNode.type === 'boss') {
              useMetaStore.getState().incrementSeasonMissionProgress('bossesDefeated', 1)
            }
            const reward = currentNode.cashReward
            // Reset all temporary in-battle compounding stacks back to baseRunSlotCapacity [40%, 30%, 20%, 10%] + floor buffs!
            useRunStore.getState().resetBattleCapacityToFloor()
            useRunStore.getState().addCash(reward)
            useRunStore.setState({ marginHp: Math.max(1, Math.round(sim.marginHp)) })
            candleHistoryRef.current = sim.candles

            // Award In-Run XP for defeating the node!
            const xpGain =
              currentNode.type === 'boss' ? 140 : currentNode.type === 'elite' ? 95 : 75
            useRunStore.getState().addRunXp(xpGain)

            // Degen 2x Leverage Contract Boss Bonus Payout: 2x Hashrate, 2x XP & Guaranteed Fragment/Shard!
            if (currentNode.type === 'boss' && leverageContract === 'degen') {
              const bonusHashrate = 30 * run.currentStageId
              useMetaStore.setState((s) => ({ hashrate: s.hashrate + bonusHashrate }))
              useRunStore.getState().addRunXp(xpGain) // 2x XP total

              const shardType = Math.random() > 0.5 ? 'coin' : 'hero'
              if (shardType === 'coin') {
                const randomCoin = COINS[Math.floor(Math.random() * COINS.length)]
                useMetaStore.setState((s) => ({
                  ownedCoins: addCoins(s.ownedCoins, randomCoin.id, randomCoin.rarity, 1),
                }))
                spawnFloat(`+1 ${randomCoin.ticker} SHARD!`, 'gold', undefined, 'DEGEN CONTRACT 2X!', true)
              } else {
                const heroKeys: HeroId[] = [
                  'rookie_satoshi',
                  'degen_ape_roxy',
                  'jordan_the_wolf',
                  'lady_fortuna',
                  'satoshi_nakamoto',
                  'quantum_ai_oracle',
                ]
                const randomHeroId = heroKeys[Math.floor(Math.random() * heroKeys.length)]
                const heroName = HERO_MAP[randomHeroId].name
                useMetaStore.setState((s) => ({
                  heroFragments: {
                    ...(s.heroFragments ?? {}),
                    [randomHeroId]: ((s.heroFragments ?? {})[randomHeroId] ?? 0) + 1,
                  },
                }))
                spawnFloat(`+1 ${heroName.split(' ')[0]} FRAG!`, 'gold', undefined, 'DEGEN CONTRACT 2X!', true)
              }
            }

            // Record growth event progress
            useMetaStore.getState().addGrowthPoints(currentNode.type === 'boss' ? 5 : 1)

            const maxNodes = stageCfg?.nodes?.length || NODES_PER_STAGE
            if (run.currentNodeIndex >= maxNodes) {
              const stg = run.currentStageId
              const payout = useRunStore.getState().endRun(true)
              simRef.current = null
              activeNodeRef.current = ''
              meta.discoverCodexEntry('boss_bear_whale')
              if (payout) {
                setSummaryModal({
                  wonStage: true,
                  stageNumber: stg,
                  nodesCleared: maxNodes,
                  payout,
                })
              }
            } else {
              setNodeVictoryBanner({ cash: reward, xp: xpGain })
              window.setTimeout(() => {
                setNodeVictoryBanner(null)
                simRef.current = null
                activeNodeRef.current = ''

                // Step 3 & 4: Only advance after any earned Level-Up drafts are chosen
                if (useRunStore.getState().pendingSkillDrafts > 0) {
                  setNodeClearedWaitingDraft(true)
                } else {
                  useRunStore.getState().advanceNode()
                }
              }, 1150)
            }
            break
          }
          case 'defeat': {
            AudioHaptics.playDefeatSound()
            useRunStore.setState({ marginHp: 0 })
            setPhase('paused')
            const isAlreadyBailedOut = useRunStore.getState().bailoutUsed
            if (isAlreadyBailedOut) {
              // SECOND DEATH: Immediately open final Run Summary Modal
              setMarginCallOpen(false)
              const stg = run.currentStageId
              const cleared = Math.max(0, run.currentNodeIndex - 1)
              const payout = useRunStore.getState().endRun(false)
              simRef.current = null
              activeNodeRef.current = ''
              if (payout) {
                setSummaryModal({
                  wonStage: false,
                  stageNumber: stg,
                  nodesCleared: cleared,
                  payout,
                })
              }
            } else {
              // FIRST DEATH: Open Margin Call Modal with 10s countdown timer
              setMarginCallOpen(true)
              if (currentNode.type === 'boss' && !sessionBossOfferTriggered) {
                sessionBossOfferTriggered = true
                useMetaStore.getState().triggerMarginCallOffer()
                setBossFlashOfferOpen(true)
              }
            }
            break
          }
        }
      }
    },
    [currentNode, effectiveSkillMaxCharge, run.currentNodeIndex, run.currentStageId, spawnFloat],
  )

  // Automatically initialize live battle simulation for each combat node once 3s loading & initial draft complete
  useEffect(() => {
    if (!run.isActive || run.isEnteringMarket || summaryModal || nodeVictoryBanner || marginCallOpen) {
      return
    }
    // Intercept Node 15 for Liquidity Tug-of-War mini-game
    if (isTugOfWarNode) {
      simRef.current = null
      activeNodeRef.current = ''
      return
    }
    // Block boss combat until Fear & Greed Leverage Contract is selected
    if (needsLeverageContract) {
      simRef.current = null
      activeNodeRef.current = ''
      return
    }
    if (!currentNode.enemy || currentNode.type === 'event' || currentNode.type === 'shop') {
      simRef.current = null
      activeNodeRef.current = ''
      return
    }
    // Wait until Level 1 Starting Draft (or between-node draft) is chosen before initializing the node battle
    if (run.pendingSkillDrafts > 0 && !simRef.current) {
      return
    }

    const nodeKey = `${run.currentStageId}_${run.currentNodeIndex}_${leverageContract ?? 'std'}`
    if (activeNodeRef.current === nodeKey && simRef.current) {
      return
    }
    activeNodeRef.current = nodeKey

    // Ensure battle capacities start at baseRunSlotCapacity [40%, 30%, 20%, 10%] (+ permanent floor upgrades)
    useRunStore.getState().resetBattleCapacityToFloor()
    const freshRun = useRunStore.getState()

    const activeLoadout: Array<{
      slot: number
      owned: OwnedCoin
      cash: number
      capacityPct: number
      isEvolved?: boolean
      evolutionId?: string
    }> = []
    loadout.forEach((owned, idx) => {
      if (owned) {
        const capPct = freshRun.baseRunSlotCapacity[idx] ?? 10
        const seedCap = freshRun.baseSeedCapital || 1000
        const isEvolved = Boolean(freshRun.evolvedCoins[owned.coinId])
        const evolutionId = freshRun.evolvedCoins[owned.coinId]
        activeLoadout.push({
          slot: idx,
          owned,
          cash: Math.round(seedCap * (capPct / 100) * 100) / 100,
          capacityPct: capPct,
          isEvolved,
          evolutionId,
        })
      }
    })

    if (currentNode.type === 'boss') {
      AudioSynth.playBossAlarm()
    } else {
      AudioSynth.playCoinInject()
    }

    // Build startEffects combining nextBattleEffects + Drafted In-Run Algo Skills + Hero Passive Aura
    const startEffects: EffectSpec[] = [...freshRun.consumeNextBattleEffects()]
    const skillMods = freshRun.getAggregatedSkillModifiers()
    const starMultiplier = 1 + (equippedHeroStars - 1) * 0.35
    const passiveLvMultiplier = 1 + (equippedHeroSkills.passiveLv - 1) * 0.1

    if (equippedHeroId === 'rookie_satoshi' || equippedHeroId === 'degen_ape_roxy') {
      startEffects.push({
        kind: 'modifyUpMultiplier',
        value: 0.15 * starMultiplier * passiveLvMultiplier,
        isFraction: true,
        target: 'allAllies',
      })
    } else if (equippedHeroId === 'lady_fortuna') {
      startEffects.push({
        kind: 'modifyUpChance',
        value: Math.round(10 * starMultiplier * passiveLvMultiplier),
        target: 'allAllies',
      })
    } else if (equippedHeroId === 'quantum_ai_oracle') {
      startEffects.push({
        kind: 'tickSpeed',
        value: -Math.min(0.55, 0.22 * starMultiplier * passiveLvMultiplier),
        target: 'allAllies',
      })
    } else if (equippedHeroId === 'satoshi_nakamoto') {
      startEffects.push({
        kind: 'modifyUpMultiplier',
        value: 0.28 * starMultiplier * passiveLvMultiplier,
        isFraction: true,
        target: 'allAllies',
      })
      startEffects.push({
        kind: 'shieldMargin',
        value: Math.round(30 * starMultiplier * passiveLvMultiplier),
        target: 'player',
      })
    }

    // Aggregated Permanent Passive Masteries from all unlocked Hero Skills
    const masteryPassives = meta.getHeroAggregatedPassiveMastery(equippedHeroId)
    if ((masteryPassives.coinDamagePct ?? 0) > 0) {
      startEffects.push({
        kind: 'modifyUpMultiplier',
        value: (masteryPassives.coinDamagePct ?? 0) / 100,
        isFraction: true,
        target: 'allAllies',
      })
    }
    if ((masteryPassives.greenRollOddsPct ?? 0) > 0) {
      startEffects.push({
        kind: 'modifyUpChance',
        value: masteryPassives.greenRollOddsPct ?? 0,
        target: 'allAllies',
      })
    }
    if ((masteryPassives.tickSpeedPct ?? 0) > 0) {
      startEffects.push({
        kind: 'tickSpeed',
        value: -Math.min(0.5, (masteryPassives.tickSpeedPct ?? 0) / 100),
        target: 'allAllies',
      })
    }
    if ((masteryPassives.shieldCapacityPct ?? 0) > 0) {
      startEffects.push({
        kind: 'shieldMargin',
        value: Math.round(35 * ((masteryPassives.shieldCapacityPct ?? 0) / 100)),
        target: 'player',
      })
    }

    if (skillMods.greenMagnitudeBonus > 0) {
      startEffects.push({
        kind: 'modifyUpMultiplier',
        value: skillMods.greenMagnitudeBonus,
        isFraction: true,
        target: 'allAllies',
      })
    }
    if (skillMods.upChanceBonus > 0) {
      startEffects.push({
        kind: 'modifyUpChance',
        value: skillMods.upChanceBonus,
        target: 'allAllies',
      })
    }
    if (skillMods.tickSpeedHaste > 0) {
      startEffects.push({
        kind: 'tickSpeed',
        value: -Math.min(0.6, skillMods.tickSpeedHaste),
        target: 'allAllies',
      })
    }
    if (skillMods.lossReduction > 0) {
      startEffects.push({
        kind: 'reduceLoss',
        value: skillMods.lossReduction,
        target: 'allAllies',
      })
    }
    if (skillMods.battleStartShield > 0) {
      startEffects.push({
        kind: 'shieldMargin',
        value: skillMods.battleStartShield,
        target: 'player',
      })
    }
    if (skillMods.shortCounterFraction > 0) {
      startEffects.push({
        kind: 'shortDamage',
        value: skillMods.shortCounterFraction,
        target: 'allAllies',
      })
    }

    const isDegen = isBossNode && leverageContract === 'degen'
    const bossHpMultiplier = isDegen ? 1.5 : 1
    const bossAtkMultiplier = isDegen ? 1.3 : 1

    const scaledEnemy: EnemyConfig = {
      ...currentNode.enemy,
      hp: Math.round(currentNode.enemy.hp * bossHpMultiplier),
      attack: Math.max(
        1,
        Math.round(currentNode.enemy.attack * (1 - skillMods.bossAttackReduction) * bossAtkMultiplier),
      ),
      attackCooldown:
        currentNode.enemy.attackCooldown / Math.max(0.35, 1 - skillMods.bossSlowFraction),
    }

    const rigStats = meta.getEquippedRigStats?.() ?? {
      flatAtk: 0,
      greenDamagePct: 0,
      tickSpeedPct: 0,
      flatHp: 0,
      marginHpPct: 0,
      overdriveCap: 0,
      startingCash: 0,
      shopRerollDiscountPct: 0,
      critChance: 0,
      critMultiplier: 1.5,
    }
    const activeSets = meta.getActiveSetBonuses?.() ?? []
    const hasNvidia2 = activeSets.some((s) => s.setId === 'nvidia_protocol' && s.pieces >= 2)
    const hasNvidia4 = activeSets.some((s) => s.setId === 'nvidia_protocol' && s.pieces >= 4)
    const hasAntminer2 = activeSets.some((s) => s.setId === 'antminer_asic' && s.pieces >= 2)
    const hasAntminer4 = activeSets.some((s) => s.setId === 'antminer_asic' && s.pieces >= 4)
    const hasSilicon2 = activeSets.some((s) => s.setId === 'silicon_valley_custom' && s.pieces >= 2)

    const rigMods = {
      flatAtk: rigStats.flatAtk ?? 0,
      greenDamagePct: rigStats.greenDamagePct ?? 0,
      tickSpeedPct: (rigStats.tickSpeedPct ?? 0) + (hasSilicon2 ? 10 : 0),
      critChance: rigStats.critChance ?? 0,
      critMultiplier: (rigStats.critMultiplier ?? 1.5) + (hasNvidia2 ? 0.15 : 0),
      bossDamagePct: hasAntminer2 ? 20 : 0,
      blockFirstRed: hasAntminer4,
      nvidiaBurst: hasNvidia4,
    }

    const { sim, events } = createSim({
      loadout: activeLoadout,
      enemy: scaledEnemy,
      marginHp: freshRun.marginHp,
      maxMarginHp: freshRun.maxMarginHp,
      relics: freshRun.runRelics,
      idleCash: freshRun.unallocatedCash,
      baseSeedCapital: freshRun.baseSeedCapital || 1000,
      compoundingMods: {
        greenCapacityGainBonus: skillMods.greenCapacityGainBonus,
        slot4StackMultiplier: skillMods.slot4StackMultiplier,
        slot4MegaPumpCrit: skillMods.slot4MegaPumpCrit,
        overLeverageCritBonus: skillMods.overLeverageCritBonus,
        overLeverageCritRate: skillMods.overLeverageCritRate,
        overLeverageHealFraction: skillMods.overLeverageHealFraction,
        dipAccumulatorGain: skillMods.dipAccumulatorGain,
      },
      rigMods,
      startEffects,
      slotEffects: {},
      candles: candleHistoryRef.current,
      marketWeather: activeWeatherId,
      isBearMarket: freshRun.isBearMarket,
      equippedPetId: meta.equippedPetId,
      petLevel: meta.equippedPetId ? (meta.ownedPets[meta.equippedPetId]?.level ?? 1) : 1,
    })

    simRef.current = sim
    setPhase('combat')
    if (events.length > 0) {
      handleCombatEvents(events, sim)
    }
  }, [
    activeWeatherId,
    currentNode,
    equippedHeroId,
    equippedHeroSkills.passiveLv,
    equippedHeroStars,
    handleCombatEvents,
    isBossNode,
    isTugOfWarNode,
    leverageContract,
    loadout,
    marginCallOpen,
    needsLeverageContract,
    nodeVictoryBanner,
    run.currentNodeIndex,
    run.currentStageId,
    run.evolvedCoins,
    run.isActive,
    run.isEnteringMarket,
    run.pendingSkillDrafts,
    summaryModal,
  ])

  // Sync mid-battle drafted skills (e.g. Series A Injection, Anchor Whale Fund, Compound Interest) into running sim
  useEffect(() => {
    const sim = simRef.current
    if (!sim) return
    const freshRun = useRunStore.getState()
    const mods = freshRun.getAggregatedSkillModifiers()
    sim.compoundingMods = {
      greenCapacityGainBonus: mods.greenCapacityGainBonus,
      slot4StackMultiplier: mods.slot4StackMultiplier,
      slot4MegaPumpCrit: mods.slot4MegaPumpCrit,
      overLeverageCritBonus: mods.overLeverageCritBonus,
      overLeverageCritRate: mods.overLeverageCritRate,
      overLeverageHealFraction: mods.overLeverageHealFraction,
      dipAccumulatorGain: mods.dipAccumulatorGain,
    }
    sim.coins.forEach((c) => {
      const floorCap = freshRun.baseRunSlotCapacity[c.slot] ?? 10
      if (c.capacityPct < floorCap) {
        c.capacityPct = floorCap
        c.cash = sim.baseSeedCapital * (c.capacityPct / 100)
      }
    })
  }, [run.activeRunSkills])

  // requestAnimationFrame combat loop (pauses automatically when SkillDraftModal, Tactical Pause, or 3s market loading is active)
  useEffect(() => {
    if (phase !== 'combat' || run.isEnteringMarket || run.pendingSkillDrafts > 0 || tacticalPauseOpen) return
    let rafId = 0
    let last = performance.now()

    const frame = (now: number) => {
      const sim = simRef.current
      if (!sim) {
        // If sim is being initialized after leverage selection, keep the RAF loop alive
        if (!needsLeverageContract && !run.isEnteringMarket && run.pendingSkillDrafts === 0 && !tacticalPauseOpen) {
          rafId = requestAnimationFrame(frame)
        }
        return
      }
      if (sim.outcome !== 'running') return
      if (useRunStore.getState().pendingSkillDrafts > 0 || useRunStore.getState().isEnteringMarket) {
        return
      }
      if (useRunStore.getState().marginHp <= 0 && sim.marginHp > 0) {
        sim.marginHp = 0
      }
      const rawDt = Math.min(0.1, (now - last) / 1000)
      last = now
      const speed = useRunStore.getState().combatSpeed
      let remaining = rawDt * speed
      while (remaining > 0.0001 && sim.outcome === 'running') {
        const dt = Math.min(COMBAT.maxSubstep, remaining)
        remaining -= dt
        const events = stepSim(sim, dt)
        if (events.length > 0) {
          handleCombatEvents(events, sim)
        }
      }

      // Sync live compounding capacities into run store
      if (sim.outcome === 'running') {
        const caps = [...useRunStore.getState().battleCoinCapacity]
        sim.coins.forEach((c) => {
          caps[c.slot] = Math.round(c.capacityPct * 10) / 10
        })
        useRunStore.getState().setBattleCoinCapacity(caps)
      }

      const pNow = performance.now()
      setProjectiles((prev) => prev.filter((p) => pNow - p.createdAt < 400))
      setFloatingTexts((prev) => prev.filter((f) => pNow - f.createdAt < 750))
      setRenderTick((t) => (t + 1) % 1000000)

      if (sim.outcome === 'running' && useRunStore.getState().pendingSkillDrafts === 0) {
        rafId = requestAnimationFrame(frame)
      }
    }

    rafId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafId)
  }, [
    phase,
    run.isEnteringMarket,
    run.pendingSkillDrafts,
    tacticalPauseOpen,
    needsLeverageContract,
    leverageContract,
    run.currentNodeIndex,
    handleCombatEvents,
  ])

  // Step 4: Advance to next node ONLY after all queued Level-Up drafts are chosen and modal closes
  useEffect(() => {
    if (nodeClearedWaitingDraft && run.pendingSkillDrafts === 0) {
      setNodeClearedWaitingDraft(false)
      const res = run.advanceNode()
      if (res === 'stageComplete') {
        const stg = run.currentStageId
        const maxNodes = stageCfg?.nodes?.length || NODES_PER_STAGE
        meta.discoverCodexEntry('boss_bear_whale')
        const payout = run.endRun(true)
        if (payout) {
          setSummaryModal({
            wonStage: true,
            stageNumber: stg,
            nodesCleared: maxNodes,
            payout,
          })
        }
      }
    }
  }, [nodeClearedWaitingDraft, run.pendingSkillDrafts, run, meta])

  const handleSetSpeed = (spd: CombatSpeed) => {
    if (!run.setCombatSpeed(spd)) {
      spawnFloat('VIP 4x SPEED LOCKED', 'gold')
    }
  }

  const handleToggleAutoSkill = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    if (!isAutoSkillUnlocked) {
      setAutoLockToast('🔒 Auto-Hero Skill unlocks after clearing Stage 1 (or with VIP Executive Pass)! Coin attacks auto-battle automatically.')
      window.setTimeout(() => {
        setAutoLockToast((prev) => (prev?.startsWith('🔒 Auto-Hero Skill') ? null : prev))
      }, 3200)
      return
    }
    run.toggleAutoHeroSkill()
  }

  // Bailout Ad Revive
  const handleWatchBailoutAd = async () => {
    setAdLoading(true)
    const ok = await showRewardedAd(meta.isVipAdFree)
    setAdLoading(false)
    if (!ok) return
    const sim = simRef.current
    if (sim) {
      reviveSim(sim)
      useRunStore.setState({ marginHp: sim.marginHp })
    } else {
      run.healMargin(Math.round(run.maxMarginHp * COMBAT.reviveHpFraction))
    }
    run.markBailoutUsed()
    setMarginCallOpen(false)
    setPhase('combat')
  }

  const handleAcceptLiquidation = () => {
    const stg = run.currentStageId
    const cleared = Math.max(0, run.currentNodeIndex - 1)
    const stage = getStageConfig(stg)
    const maxNodes = stage ? stage.nodes.length : NODES_PER_STAGE
    const isBossNode = run.currentNodeIndex >= maxNodes

    if (isBossNode) {
      meta.recordBossLoss(stg)
    }

    const payout = run.endRun(false)
    simRef.current = null
    activeNodeRef.current = ''
    setMarginCallOpen(false)
    if (payout) {
      setSummaryModal({
        wonStage: false,
        stageNumber: stg,
        nodesCleared: cleared,
        payout,
      })
    }
  }

  const handleReturnHome = () => {
    if (run.isActive) {
      run.endRun(false)
    }
    simRef.current = null
    activeNodeRef.current = ''
    candleHistoryRef.current = []
    setMarginCallOpen(false)
    setSummaryModal(null)
    onReturnToHub?.()
  }

  // Shady Event outcome resolver
  const handleApplyEventOutcome = (
    outcome: RunEventOutcome,
    cost?: { cash?: number; marginHp?: number },
  ): string[] => {
    const logs: string[] = []
    const spendFromRun = (amt: number) => {
      const r = useRunStore.getState()
      let rem = amt
      const takeIdle = Math.min(r.unallocatedCash, rem)
      rem -= takeIdle
      const allocs = [...r.slotAllocations]
      for (let i = 0; i < allocs.length && rem > 0; i++) {
        const take = Math.min(allocs[i], rem)
        allocs[i] -= take
        rem -= take
      }
      r.setAllSlotAllocations(allocs, r.unallocatedCash - takeIdle)
    }

    if (cost?.cash) {
      spendFromRun(cost.cash)
      logs.push(`Paid ${fmtUsd(cost.cash)}`)
    }
    if (cost?.marginHp) {
      run.damageMargin(cost.marginHp)
      logs.push(`-${cost.marginHp} Margin HP`)
    }

    for (const ef of outcome.effects) {
      const r = useRunStore.getState()
      const total = r.getTotalPortfolio()
      switch (ef.type) {
        case 'cash': {
          const delta = ef.isFraction ? total * ef.amount : ef.amount
          if (delta >= 0) {
            r.addCash(delta)
            logs.push(`+${fmtUsd(delta)} Run Cash`)
          } else {
            spendFromRun(Math.abs(delta))
            logs.push(`-${fmtUsd(Math.abs(delta))} Run Cash`)
          }
          break
        }
        case 'marginHp': {
          const delta = Math.round(ef.isFraction ? r.maxMarginHp * ef.amount : ef.amount)
          if (delta >= 0) {
            r.healMargin(delta)
            logs.push(`+${delta} Margin HP`)
          } else {
            r.damageMargin(Math.abs(delta))
            logs.push(`${delta} Margin HP`)
          }
          break
        }
        case 'gainRelic': {
          const picked = ef.relicId
            ? RELICS.find((x) => x.id === ef.relicId)
            : pickByRarity(RELICS, ef.rarity ?? 'rare')
          if (picked) {
            r.addRunRelic(picked.id)
            logs.push(`Acquired Relic: ${picked.name}`)
          }
          break
        }
        case 'loseRelic': {
          if (r.runRelics.length > 0) {
            const victim = r.runRelics[r.runRelics.length - 1]
            r.removeRunRelic(victim)
            logs.push(`Lost Relic: ${victim}`)
          }
          break
        }
        case 'gainCoin': {
          const picked = ef.coinId
            ? COINS.find((c) => c.id === ef.coinId)
            : pickByRarity(COINS, ef.rarity ?? 'uncommon')
          if (picked) {
            const m = useMetaStore.getState()
            useMetaStore.setState({
              ownedCoins: addCoins(m.ownedCoins, picked.id, picked.rarity, 1),
            })
            logs.push(`Unlocked Coin: ${picked.name}`)
          }
          break
        }
        case 'upgradeCoin': {
          const m = useMetaStore.getState()
          const targetId = m.equippedCoinIds.find((id) => !!id)
          const stack = m.ownedCoins.find((c) => c.id === targetId)
          if (stack) {
            const nr = nextRarity(stack.rarity) ?? stack.rarity
            useMetaStore.setState({
              ownedCoins: m.ownedCoins.map((c) => (c.id === stack.id ? { ...c, rarity: nr } : c)),
            })
            logs.push(`Upgraded ${stack.coinId.toUpperCase()} to ${nr.toUpperCase()}!`)
          }
          break
        }
        case 'loseCoin': {
          logs.push('Coin wallet shaken — lost 15% cash')
          spendFromRun(total * 0.15)
          break
        }
        case 'buffNextBattle':
        case 'debuffNextBattle': {
          r.addNextBattleEffect(ef.effect)
          logs.push(`Next battle modifier applied`)
          break
        }
        case 'gems': {
          useMetaStore.setState((s) => ({ gems: s.gems + ef.amount }))
          logs.push(`+${ef.amount} Satoshi Gems`)
          break
        }
        case 'hashrate': {
          useMetaStore.setState((s) => ({ hashrate: s.hashrate + ef.amount }))
          logs.push(`+${ef.amount} Hashrate`)
          break
        }
        case 'nothing':
          logs.push('No effect')
          break
      }
    }
    return logs
  }

  // Black Market cash spender
  const handleSpendMarketCash = (price: number): boolean => {
    const r = useRunStore.getState()
    const total = r.getTotalPortfolio()
    if (total < price) return false
    let rem = price
    const takeIdle = Math.min(r.unallocatedCash, rem)
    rem -= takeIdle
    const allocs = [...r.slotAllocations]
    for (let i = 0; i < allocs.length && rem > 0; i++) {
      const take = Math.min(allocs[i], rem)
      allocs[i] -= take
      rem -= take
    }
    r.setAllSlotAllocations(allocs, r.unallocatedCash - takeIdle)
    return true
  }

  const handleAdvanceNonCombatNode = () => {
    // Grant +50 XP for completing non-combat nodes (Shop / Event)
    const leveledUp = run.addRunXp(50)
    if (leveledUp || useRunStore.getState().pendingSkillDrafts > 0) {
      setNodeClearedWaitingDraft(true)
    } else {
      const res = run.advanceNode()
      if (res === 'stageComplete') {
        const stg = run.currentStageId
        const maxNodes = stageCfg?.nodes?.length || NODES_PER_STAGE
        meta.discoverCodexEntry('boss_bear_whale')
        const payout = run.endRun(true)
        if (payout) {
          setSummaryModal({
            wonStage: true,
            stageNumber: stg,
            nodesCleared: maxNodes,
            payout,
          })
        }
      }
    }
  }

  // Derived values
  const sim = simRef.current
  const liveMarginHp = sim ? sim.marginHp : run.marginHp
  const liveMaxMarginHp = sim ? sim.maxMarginHp : run.maxMarginHp
  const liveShield = sim ? sim.shield : 0
  const liveTotalPortfolio = sim ? portfolio(sim) : run.getTotalPortfolio()
  const startPortfolio = sim ? sim.startPortfolio : liveTotalPortfolio
  const liveEnemyHp = sim ? sim.enemy.hp : Math.round(fallbackEnemy.hp * COMBAT.enemyHpScale)
  const liveEnemyMaxHp = sim ? sim.enemy.maxHp : Math.round(fallbackEnemy.hp * COMBAT.enemyHpScale)
  const liveAtkTimer = sim ? sim.enemy.attackTimer : 0
  const liveHazTimer = sim ? sim.enemy.hazardTimer : 0
  const liveCandles = sim ? sim.candles : candleHistoryRef.current
  const liveCurCandle: Candle = sim
    ? sim.candle
    : {
        o: liveTotalPortfolio,
        h: liveTotalPortfolio,
        l: liveTotalPortfolio,
        c: liveTotalPortfolio,
      }

  const skillChargePct = Math.min(
    100,
    Math.round((heroSkillCharge / Math.max(1, effectiveSkillMaxCharge)) * 100),
  )
  const isSkillReady = heroSkillCharge >= effectiveSkillMaxCharge

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#fef3c7] select-none">
      {/* Streamlined Top Strip: Compact 30-Node & Level Bar + Compact Margin HP / TVL / Relic Bar */}
      <div className="flex shrink-0 flex-col">
        <RunNodeBar
          stageNumber={stageCfg.stage}
          stageName={stageCfg.name}
          nodes={stageCfg.nodes}
          currentNodeIndex={run.currentNodeIndex}
        />
        <TopHud
          marginHp={liveMarginHp}
          maxMarginHp={liveMaxMarginHp}
          shield={liveShield}
          totalPortfolio={liveTotalPortfolio}
          startPortfolio={startPortfolio}
          runRelics={run.runRelics}
          relicPulses={relicPulses}
        />
        {run.activeMercenary && (
          <div className="mx-2 mt-1 flex items-center justify-between rounded-xl border border-[#16a34a] bg-[#dcfce7] px-2.5 py-1 text-[10px] font-black text-[#15803d] shadow-sm animate-fade-in">
            <span className="flex items-center gap-1.5">
              <span>🤝</span>
              <span>Guild Mercenary: {run.activeMercenary.name} ({run.activeMercenary.starLevel}★)</span>
            </span>
            <span className="rounded-full bg-[#16a34a] px-2 py-0.2 text-[8px] text-white">
              +25% SEED CASH
            </span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          HANDS-OFF LIVE ORDERBOOK DUEL ARENA + TALLER BOTTOM COMPOUNDING HUD
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0 flex-col justify-between overflow-hidden relative">
        {/* Visceral Combat Juice: Screen Edge Crimson Danger Vignette on Taking Margin HP Damage */}
        {dangerVignette && (
          <div className="pointer-events-none absolute inset-0 z-40 border-4 border-red-500/50 shadow-[inset_0_0_50px_rgba(239,68,68,0.45)] transition-opacity duration-300 animate-pulse" />
        )}

        {/* TOP LIVE CANDLESTICK CANVAS & DUEL ARENA (Slightly reduced to give Bottom Section +50% height) */}
        <div className="flex-1 min-h-[54%]">
          <BossArena
            stageNumber={stageCfg.stage}
            heroId={equippedHeroId}
            enemy={fallbackEnemy}
            enemyHp={liveEnemyHp}
            enemyMaxHp={liveEnemyMaxHp}
            attackTimer={liveAtkTimer}
            hazardTimer={liveHazTimer}
            ultimateTimer={sim?.enemy.ultimateTimer ?? 0}
            ironWillArmor={sim?.enemy.ironWillArmorRemaining ?? (fallbackEnemy.hasIronWill ? 2 : undefined)}
            candles={liveCandles}
            currentCandle={liveCurCandle}
            projectiles={projectiles}
            floatingTexts={floatingTexts}
            screenShake={screenShake}
            heroHitFlash={heroHitFlash}
            hazardBanner={hazardBanner}
            marketWeather={activeWeatherConfig}
            megaCandleActive={megaCandleActive}
            isBearMarket={run.isBearMarket}
            equippedPetId={meta.equippedPetId}
          />
        </div>

        {/* FLOATING TOAST WHEN TAPPING LOCKED AUTO-SKILL BEFORE STAGE 5 */}
        {autoLockToast && (
          <div className="pointer-events-none absolute bottom-32 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] px-4 py-1.5 font-display text-xs font-extrabold text-[#2C1810] shadow-xl animate-bounce">
            {autoLockToast}
          </div>
        )}

        {/* EXPANDED (+50% TALLER) BOTTOM LIVE BATTLE HUD:
            Left/Center: 4 Circular Coin Tokens with Emerald Liquid Fund Fill Ring + Overdrive Electric Flames
            Right: Sole Hero Active Skill Button + [ 🔒 AUTO ] Toggle + [ 1x | 2x | 4x ] Speed Controls */}
        <div className="shrink-0 min-h-[116px] border-t-[3.5px] border-[#3E2723] bg-gradient-to-b from-[#FFFDF9] via-[#FDF6E9] to-[#F3E9D8] px-2.5 py-2.5 text-[#2C1810] shadow-[0_-8px_20px_rgba(44,24,16,0.28)] flex flex-col justify-center">
          <div className="flex items-center justify-between gap-1.5 w-full">
            {/* LEFT / CENTER: 4 Circular Coin Badges with Emerald Liquid Border Fill & Overdrive Electric Flames */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((slot) => {
                const isUnlocked = slot < meta.unlockedSlots
                const owned = isUnlocked ? loadout[slot] ?? null : null
                const cfg = owned ? COIN_MAP[owned.coinId] : null
                const evoId = cfg ? run.evolvedCoins[cfg.id] : undefined
                const evoCfg = evoId ? EVOLUTION_MAP[evoId] : undefined
                const simCoin = sim?.coins.find((c) => c.slot === slot)
                const capacityPct = simCoin
                  ? simCoin.capacityPct
                  : run.battleCoinCapacity[slot] ?? run.baseRunSlotCapacity[slot] ?? 10
                const displayPct = Math.round(capacityPct)
                const liquidFillPct = Math.min(100, Math.max(0, capacityPct))
                const isOverdrive = capacityPct >= 100
                const cashVal = simCoin
                  ? simCoin.cash
                  : (run.baseSeedCapital || 1000) * (capacityPct / 100)
                const progress = simCoin ? Math.min(1, Math.max(0, simCoin.progress)) : 0

                // Outer Fund Fill Ring (0% -> 100% Emerald Liquid Border Fill; 100%+ Golden-Prismatic Flame Ring)
                const fundRadius = 22
                const fundCircumference = 2 * Math.PI * fundRadius
                const fundDashoffset = fundCircumference * (1 - liquidFillPct / 100)

                // Inner Tick Cooldown Ring
                const tickRadius = 17.5
                const tickCircumference = 2 * Math.PI * tickRadius
                const tickDashoffset = tickCircumference * (1 - progress)

                if (!isUnlocked || !owned || !cfg) {
                  return (
                    <div
                      key={slot}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <div className="flex h-13 w-13 items-center justify-center rounded-full border-2 border-dashed border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]">
                        <Lock className="h-3.5 w-3.5 opacity-60" />
                      </div>
                      <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-1.5 py-0.2 font-display text-[8px] font-bold text-[#6E5A4F]">
                        SLOT {slot + 1}
                      </span>
                    </div>
                  )
                }

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setInspectedCoin(owned)}
                    title={`${evoCfg ? evoCfg.name : cfg.name} • Slot ${slot + 1} (${displayPct}% Capacity) — ${
                      evoCfg ? '⚡ 2x Speed & Mega-Candle' : 'Tap to Inspect'
                    }`}
                    className={`relative flex flex-col items-center group active:scale-95 transition-transform ${
                      isOverdrive ? 'scale-105' : ''
                    }`}
                  >
                    {/* EVO Crown / Hard-Fork Badge */}
                    {evoCfg && (
                      <span className="pointer-events-none absolute -top-2 -right-1 z-30 rounded-full border border-[#78350f] bg-gradient-to-r from-[#ea580c] to-[#f59e0b] px-1 py-0.1 font-display text-[7.5px] font-black text-white shadow animate-pulse">
                        EVO!
                      </span>
                    )}

                    {/* OVERDRIVE Animated Golden-Prismatic Electric Flames & Pulsing Aura when Capacity >= 100% */}
                    {isOverdrive && (
                      <>
                        <div className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#ec4899] to-[#22d3ee] opacity-90 blur-[4px] animate-pulse" />
                        <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 text-[#fde047] drop-shadow-[0_2px_4px_rgba(225,29,72,0.9)] animate-bounce">
                          <Flame className="h-3.5 w-3.5 fill-[#fde047] text-[#e11d48]" />
                        </div>
                      </>
                    )}

                    <div
                      className={`relative flex h-13 w-13 items-center justify-center rounded-full overflow-hidden shadow-md ${
                        isOverdrive
                          ? 'bg-[#FFFDF9] ring-2 ring-[#fde047] shadow-[0_0_14px_rgba(245,158,11,0.85)]'
                          : evoCfg
                            ? 'bg-[#FFFDF9] ring-2 ring-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                            : 'bg-[#FFFDF9]'
                      }`}
                    >
                      {/* Rising Vertical Emerald Liquid Fill Gauge Inside the Token */}
                      <div
                        className={`pointer-events-none absolute bottom-0 left-0 right-0 transition-all duration-300 ${
                          isOverdrive
                            ? 'bg-gradient-to-t from-[#f59e0b]/75 via-[#ec4899]/55 to-[#fde047]/80 animate-pulse'
                            : 'bg-gradient-to-t from-[#059669]/65 via-[#10b981]/50 to-[#34d399]/35'
                        }`}
                        style={{ height: `${liquidFillPct}%` }}
                      />

                      {/* Dual SVG Rings: Outer Emerald Liquid Fund Fill Ring + Inner Tick Cooldown Ring */}
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90 z-10"
                        viewBox="0 0 52 52"
                      >
                        <defs>
                          <linearGradient id={`overdriveGrad_${slot}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fde047" />
                            <stop offset="50%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#22d3ee" />
                          </linearGradient>
                          <linearGradient id={`emeraldLiquid_${slot}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#22ff99" />
                          </linearGradient>
                        </defs>

                        {/* Outer Track */}
                        <circle
                          cx="26"
                          cy="26"
                          r={fundRadius}
                          fill="none"
                          stroke="#E2D5C1"
                          strokeWidth="3.4"
                        />

                        {/* Outer Live Fund Fill Border (0% -> 100% Emerald Liquid; 100%+ Prismatic Electric Flame) */}
                        <circle
                          cx="26"
                          cy="26"
                          r={fundRadius}
                          fill="none"
                          stroke={
                            isOverdrive
                              ? `url(#overdriveGrad_${slot})`
                              : `url(#emeraldLiquid_${slot})`
                          }
                          strokeWidth={isOverdrive ? '4.2' : '3.6'}
                          strokeDasharray={fundCircumference}
                          strokeDashoffset={fundDashoffset}
                          strokeLinecap="round"
                        />

                        {/* Inner Tick Speed Ring */}
                        <circle
                          cx="26"
                          cy="26"
                          r={tickRadius}
                          fill="none"
                          stroke="rgba(44,24,16,0.10)"
                          strokeWidth="1.8"
                        />
                        <circle
                          cx="26"
                          cy="26"
                          r={tickRadius}
                          fill="none"
                          stroke={isOverdrive ? '#fde047' : evoCfg ? '#ea580c' : '#059669'}
                          strokeWidth="2.0"
                          strokeDasharray={tickCircumference}
                          strokeDashoffset={tickDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Coin Mascot */}
                      <div className="relative z-10 flex items-center justify-center">
                        {evoCfg ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 shadow-md ring-1 ring-amber-300">
                            <DynamicIcon name={evoCfg.icon} className="h-4 w-4 text-white drop-shadow" />
                          </div>
                        ) : (
                          <CoinMascotSvg coin={cfg} size={30} />
                        )}
                      </div>
                    </div>

                    {/* Bold Percentage Badge (40% -> 85% -> 135%!) */}
                    <span
                      className={`relative z-20 -mt-2 rounded-full border px-1.5 py-0.2 font-display text-[9px] font-black shadow-xs ${
                        isOverdrive
                          ? 'border-[#3E2723] bg-gradient-to-r from-[#fde047] via-[#f59e0b] to-[#ec4899] text-[#2C1810]'
                          : evoCfg
                            ? 'border-[#78350f] bg-[#ea580c] text-white'
                            : 'border-[#14532d] bg-[#064e3b] text-[#6ee7b7]'
                      }`}
                    >
                      {isOverdrive ? `⚡${displayPct}%!` : `${displayPct}%`}
                    </span>

                    {/* Live Compounded Capital / Overdrive Tag */}
                    <span
                      className={`mt-0.5 font-display text-[8.5px] font-black leading-none ${
                        isOverdrive
                          ? 'text-[#be123c] uppercase tracking-wider'
                          : evoCfg
                            ? 'text-[#b45309] uppercase tracking-wider'
                            : 'text-[#15803d]'
                      }`}
                    >
                      {isOverdrive ? '🔥 MAX' : evoCfg ? `⚡ ${evoCfg.ticker}` : fmtUsd(cashVal)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* RIGHT: Sole Hero Active Skill Button + [ 🔒 AUTO ] Toggle + [ 1x | 2x | 4x ] Speed Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Circular Hero Active Skill Button with Charge % (Sole Skill Trigger) */}
              <button
                type="button"
                disabled={!isSkillReady}
                onClick={handleTriggerHeroSkill}
                title={`${equippedHeroSkill.name}: ${equippedHeroSkill.description}`}
                className={`relative flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-full border-[2.2px] border-[#3E2723] border-b-[4px] shadow-md transition-all ${
                  isSkillReady
                    ? 'bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#ea580c] text-[#2C1810] shadow-[0_0_14px_rgba(245,158,11,0.8)] animate-bounce active:translate-y-0.5 cursor-pointer'
                    : 'bg-[#F3E9D8] text-[#6E5A4F] cursor-not-allowed'
                }`}
              >
                <Sparkles className={`h-4 w-4 ${isSkillReady ? 'text-[#2C1810]' : 'text-[#b45309]'}`} />
                <span className="font-display text-[10px] font-black leading-none mt-0.5">
                  {skillChargePct}%
                </span>
                <span className="font-display text-[7.5px] font-extrabold uppercase tracking-tighter">
                  {isSkillReady ? 'SKILL!' : 'CHARGE'}
                </span>
              </button>

              {/* Stacked [ 🔒 AUTO SKILL ] Toggle & [ 1x | 2x | 4x ] Speed Controls (Guaranteed to fit without clipping) */}
              <div className="flex flex-col gap-1 w-[72px]">
                {/* [ 🔒 AUTO SKILL ] Hero Skill Toggle Button (Auto-casts Hero Ultimate Skill when 100% charged) */}
                <button
                  type="button"
                  onClick={handleToggleAutoSkill}
                  className={`flex h-6 w-full items-center justify-center gap-1 rounded-lg border-2 font-display text-[8px] font-black uppercase shadow-2xs transition-all active:translate-y-0.5 ${
                    !isAutoSkillUnlocked
                      ? 'border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                      : run.autoHeroSkill
                        ? 'border-[#14532d] bg-[#22c55e] text-white'
                        : 'border-[#3E2723] bg-[#FFFDF9] text-[#2C1810]'
                  }`}
                  title={
                    !isAutoSkillUnlocked
                      ? 'Auto-Hero Skill unlocks after clearing Stage 1 or with VIP Executive Pass'
                      : 'Toggle Auto-Cast for Hero Active Skill (Automatically intercepts Heavy Attacks with Counter-Pump Interrupt!)'
                  }
                >
                  {!isAutoSkillUnlocked && <Lock className="h-2.5 w-2.5 text-[#b45309]" />}
                  <span className="truncate">
                    {!isAutoSkillUnlocked
                      ? 'AUTO SKILL'
                      : run.autoHeroSkill
                        ? '⚡ AUTO ON'
                        : 'AUTO OFF'}
                  </span>
                </button>

                {/* [ 1x | 2x | 4x ] Speed Buttons + [ ⏸️ ] Tactical Pause Button */}
                <div className="flex items-center gap-0.5 w-full">
                  {([1, 2, 4] as CombatSpeed[]).map((spd) => {
                    const active = run.combatSpeed === spd
                    const locked = spd === 4 && !meta.isVipAdFree
                    return (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSetSpeed(spd)}
                        className={`flex-1 h-5 flex items-center justify-center rounded-md border font-display text-[8.5px] font-black transition-all ${
                          active
                            ? 'border-[#3E2723] bg-[#7e22ce] text-white shadow-2xs'
                            : locked
                              ? 'border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                              : 'border-[#3E2723] bg-[#FFFDF9] text-[#2C1810]'
                        }`}
                      >
                        {spd === 4 ? '4x' : `${spd}x`}
                      </button>
                    )
                  })}

                  {/* Mid-Battle Tactical Pause Button */}
                  <button
                    type="button"
                    onClick={() => {
                      AudioSynth.unlock()
                      AudioSynth.playCoinInject()
                      setTacticalPauseOpen(true)
                    }}
                    className="h-5 w-5 shrink-0 flex items-center justify-center rounded-md border border-[#3E2723] bg-[#f59e0b] hover:bg-[#d97706] text-white font-display text-[8.5px] font-black shadow-2xs transition-all active:translate-y-0.5"
                    title="⏸️ Market Halted — Tactical Pause"
                  >
                    <Pause className="h-2.5 w-2.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          3-SECOND LIVE MARKET LOADING SCREEN OVERLAY (UPON TAPPING START RUN)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {run.isEnteringMarket && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0F172A]/95 p-6 text-center backdrop-blur-md">
          <div className="w-full max-w-[330px] rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-5 text-[#2C1810] shadow-2xl">
            <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#16a34a]/40 bg-[#dcfce7] px-3 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-[#15803d]">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>CONNECTING TO ORDERBOOK...</span>
            </div>

            <h2 className="font-display text-lg font-extrabold text-[#2C1810]">
              STAGE {stageCfg.stage}: {stageCfg.name.toUpperCase()}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[#6E5A4F]">
              Seeding Slot Hierarchy (40% / 30% / 20% / 10%)
            </p>

            {/* Animated Minimal Candlestick Ticker Drawing Across the Screen */}
            <div className="my-4 h-28 w-full overflow-hidden rounded-2xl border-2 border-[#3E2723] bg-[#0F172A] p-3 relative">
              {/* Subtle Gridlines */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 opacity-20">
                <div className="border-b border-dashed border-slate-400" />
                <div className="border-b border-dashed border-slate-400" />
                <div className="border-b border-dashed border-slate-400" />
              </div>

              <svg className="h-full w-full" viewBox="0 0 260 80">
                {[
                  { x: 16, top: 44, bot: 68, hTop: 38, hBot: 72, green: true },
                  { x: 44, top: 34, bot: 52, hTop: 28, hBot: 58, green: true },
                  { x: 72, top: 40, bot: 58, hTop: 34, hBot: 64, green: false },
                  { x: 100, top: 24, bot: 46, hTop: 18, hBot: 50, green: true },
                  { x: 128, top: 18, bot: 36, hTop: 12, hBot: 42, green: true },
                  { x: 156, top: 26, bot: 42, hTop: 20, hBot: 48, green: false },
                  { x: 184, top: 14, bot: 32, hTop: 8, hBot: 36, green: true },
                  { x: 212, top: 8, bot: 24, hTop: 4, hBot: 28, green: true },
                  { x: 240, top: 4, bot: 18, hTop: 2, hBot: 22, green: true },
                ].map((c, idx) => {
                  const threshold = (idx + 1) * 10
                  const visible = loadingProgress >= threshold - 8
                  return (
                    <g
                      key={c.x}
                      style={{
                        opacity: visible ? 1 : 0.12,
                        transform: visible ? 'translateY(0px)' : 'translateY(8px)',
                        transition: 'all 220ms ease-out',
                      }}
                    >
                      <line
                        x1={c.x}
                        y1={c.hTop}
                        x2={c.x}
                        y2={c.hBot}
                        stroke={c.green ? '#22c55e' : '#ef4444'}
                        strokeWidth="2"
                      />
                      <rect
                        x={c.x - 7}
                        y={c.top}
                        width="14"
                        height={Math.max(6, c.bot - c.top)}
                        rx="2"
                        fill={c.green ? '#22c55e' : '#ef4444'}
                      />
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Loading Progress Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full border-2 border-[#3E2723] bg-[#F3E9D8]">
              <div
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#f59e0b] transition-all duration-100"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="mt-1.5 font-display text-[11px] font-extrabold text-[#b45309]">
              PREPARING LEVEL 1 UPGRADE DRAFT... {loadingProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Node Victory Overlay Banner */}
      {nodeVictoryBanner !== null && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-1 rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] px-6 py-4 text-center text-[#2C1810] shadow-2xl">
            <CheckCircle2 className="h-8 w-8 text-[#16a34a]" />
            <span className="font-display text-base font-extrabold text-[#2C1810]">
              TARGET LIQUIDATED!
            </span>
            <span className="flex items-center gap-1 font-display text-xs font-black text-[#15803d]">
              <Coins className="h-3.5 w-3.5" /> +{fmtUsd(nodeVictoryBanner.cash)} BOUNTY • +
              {nodeVictoryBanner.xp} ALGO XP
            </span>
          </div>
        </div>
      )}

      {/* Node 15 Liquidity Tug-of-War Mini-Game */}
      {!run.isEnteringMarket && isTugOfWarNode && !summaryModal && !nodeVictoryBanner && (
        <TugOfWarMiniGame
          onComplete={() => {
            run.advanceNode()
          }}
        />
      )}

      {/* Pre-Boss Fear & Greed 2x Leverage Contract Modal */}
      {!run.isEnteringMarket && needsLeverageContract && !summaryModal && !nodeVictoryBanner && (
        <PreBossLeverageModal
          bossNodeIndex={run.currentNodeIndex}
          enemy={currentNode.enemy ?? fallbackEnemy}
          onSelect={(contract) => {
            run.setLeverageContract(run.currentNodeIndex, contract)
            setPhase('combat')
            setTacticalPauseOpen(false)
          }}
        />
      )}

      {/* In-Run 3-Card Roguelite Skill Draft Modal (Pauses After 3s Loading) */}
      {!run.isEnteringMarket && <SkillDraftModal />}

      {/* In-Run Mystery ICO Launchpad Contract Modal (Floor 1, Node 4) */}
      {!run.isEnteringMarket && run.currentNodeIndex === 4 && !run.icoContract && !summaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border-[3.5px] border-amber-600 border-b-[6px] bg-[#1a1423] text-white shadow-2xl">
            <div className="border-b-2 border-white/10 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-3">
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-300 uppercase">
                🚀 MYSTERY ICO LAUNCHPAD
              </span>
              <h3 className="font-display text-base font-black text-white">
                Pre-Seed Allocation Contract
              </h3>
            </div>
            <div className="space-y-3 p-4 text-xs font-semibold text-slate-200">
              <p>
                An anonymous dev syndicate is offering an early, unverified token presale! Secure the contract now, and at <strong className="text-amber-400">Node 14 (Exchange Listing)</strong>:
              </p>
              <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 space-y-1.5 text-[11px]">
                <div className="text-emerald-400 font-bold">
                  🟢 80% TIER-1 LISTING: Unlocks a 5th Coin Slot firing free Green Candles for the rest of this run!
                </div>
                <div className="text-red-400 font-bold">
                  🔴 20% RUG-PULL: Contract collapses, detonating for 300 explosion damage &amp; stunning enemy!
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (run.acquireIcoContract('hp')) {
                      AudioSynth.playCoinInject()
                      spawnFloat('ICO CONTRACT SECURED!', 'gold')
                    }
                  }}
                  className="rounded-xl border-2 border-red-700 bg-gradient-to-b from-red-600 to-red-800 p-2 text-center active:scale-95 shadow font-display font-black text-[11px]"
                >
                  <div>SACRIFICE HP</div>
                  <div className="text-[9px] text-red-200">-20% Margin HP</div>
                </button>
                <button
                  type="button"
                  disabled={liveTotalPortfolio < 300}
                  onClick={() => {
                    if (run.acquireIcoContract('cash')) {
                      AudioSynth.playCoinInject()
                      spawnFloat('ICO CONTRACT SECURED!', 'gold')
                    }
                  }}
                  className={`rounded-xl border-2 p-2 text-center active:scale-95 shadow font-display font-black text-[11px] ${
                    liveTotalPortfolio >= 300
                      ? 'border-amber-600 bg-gradient-to-b from-amber-500 to-amber-700 text-white'
                      : 'border-stone-700 bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <div>INVEST CASH</div>
                  <div className="text-[9px] text-amber-200">$300 Run Cash</div>
                </button>
              </div>
            </div>
            <div className="border-t border-white/10 p-2.5 text-center">
              <button
                type="button"
                onClick={() => {
                  run.resolveIcoListing(false)
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-white"
              >
                PASS ON ICO (SKIP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Run Mystery ICO Listing Resolution Modal (Node 14) */}
      {!run.isEnteringMarket && run.currentNodeIndex === 14 && run.icoContract?.status === 'pending' && !summaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border-[3.5px] border-emerald-500 border-b-[6px] bg-[#1a1423] text-white shadow-2xl p-4 text-center">
            <div className="text-3xl animate-bounce">🔔</div>
            <h3 className="font-display text-lg font-black text-amber-400 mt-1">
              NODE 14: EXCHANGE LISTING EVENT!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Trading opens on the primary exchange orderbook for your ICO allocation...
            </p>
            <button
              type="button"
              onClick={() => {
                const won = Math.random() < 0.8
                run.resolveIcoListing(won)
                if (won) {
                  AudioSynth.playMythicalDrop()
                  spawnFloat('5TH COIN SLOT UNLOCKED!', 'gold', undefined, 'TIER-1 LISTING!', true)
                } else {
                  AudioSynth.playMarginCall()
                  spawnFloat('💥 RUG PULL! 300 DMG BURST!', 'red', undefined, 'LIQUIDITY DRAINED!', true)
                  if (simRef.current) {
                    simRef.current.enemy.hp = Math.max(0, simRef.current.enemy.hp - 300)
                    simRef.current.enemy.attackTimer = 0
                  }
                }
              }}
              className="mt-4 rounded-2xl py-3 font-display text-xs font-black uppercase text-white btn-3d-green tracking-wider active:scale-95"
            >
              REVEAL LISTING OUTCOME
            </button>
          </div>
        </div>
      )}

      {/* Shady Event Modal (Node Type === 'event') */}
      {!run.isEnteringMarket && currentNode.type === 'event' && activeEvent && !summaryModal && (
        <ShadyEventModal
          key={`${stageCfg.stage}_${run.currentNodeIndex}`}
          event={activeEvent}
          totalCash={liveTotalPortfolio}
          marginHp={liveMarginHp}
          maxMarginHp={liveMaxMarginHp}
          onApplyOutcome={handleApplyEventOutcome}
          onContinue={handleAdvanceNonCombatNode}
        />
      )}

      {/* Run Black Market Modal (Node Type === 'shop') */}
      {!run.isEnteringMarket && currentNode.type === 'shop' && !isTugOfWarNode && !summaryModal && (
        <BlackMarketModal
          key={`${stageCfg.stage}_${run.currentNodeIndex}`}
          stageNumber={stageCfg.stage}
          totalCash={liveTotalPortfolio}
          marginHp={liveMarginHp}
          maxMarginHp={liveMaxMarginHp}
          runRelics={run.runRelics}
          onSpendCash={handleSpendMarketCash}
          onHealFraction={(frac) => run.healMargin(Math.round(run.maxMarginHp * frac))}
          onAddBuff={(effect) => run.addNextBattleEffect(effect)}
          onAddRunRelic={(relicId) => run.addRunRelic(relicId)}
          onEquipCursedRelic={(relicId) => run.equipCursedRelic(relicId)}
          onContinue={handleAdvanceNonCombatNode}
        />
      )}

      {/* Coin Tooltip Modal */}
      <CoinTooltipModal
        owned={inspectedCoin}
        globalYield={meta.getGlobalYield()}
        onClose={() => setInspectedCoin(null)}
      />

      {/* Margin Call (Defeat / Bailout Ad Revive) Modal with 10s Countdown */}
      {marginCallOpen && (
        <MarginCallModal
          canBailout={!run.bailoutUsed}
          isVipAdFree={meta.isVipAdFree}
          adLoading={adLoading}
          onWatchBailoutAd={handleWatchBailoutAd}
          onAcceptLiquidation={handleAcceptLiquidation}
        />
      )}

      {/* Contextual 2-Hour "Whale Bailout Bundle - 1200% Value!" Boss Defeat Flash Offer */}
      {bossFlashOfferOpen && meta.marginCallOfferExpiresAt && (
        <MarginCallOfferModal
          expiresAt={meta.marginCallOfferExpiresAt}
          onClose={() => setBossFlashOfferOpen(false)}
          onPurchased={() => {
            const s = simRef.current
            if (s && marginCallOpen) {
              reviveSim(s)
              useRunStore.setState({ marginHp: s.marginHp })
              setMarginCallOpen(false)
              setPhase('combat')
            }
          }}
        />
      )}

      {/* Contextual Wall-Breaker AI Flash Offer (800% Stat Surge or Finish Contract) */}
      {meta.wallBreakerOfferType && meta.wallBreakerOfferExpiresAt && (
        <WallBreakerOfferModal
          type={meta.wallBreakerOfferType}
          targetHeroId={meta.wallBreakerHeroId ?? undefined}
          onClose={() => meta.dismissWallBreakerOffer()}
          onPurchased={() => {
            const s = simRef.current
            if (s && marginCallOpen) {
              reviveSim(s)
              useRunStore.setState({ marginHp: s.marginHp })
              setMarginCallOpen(false)
              setPhase('combat')
            }
          }}
        />
      )}

      {/* Mid-Battle Tactical Pause Modal */}
      {tacticalPauseOpen && (
        <TacticalPauseModal
          stageNumber={stageCfg.stage}
          nodeIndex={run.currentNodeIndex}
          enemy={fallbackEnemy}
          enemyHp={liveEnemyHp}
          enemyMaxHp={liveEnemyMaxHp}
          marginHp={liveMarginHp}
          maxMarginHp={liveMaxMarginHp}
          shield={liveShield}
          portfolio={liveTotalPortfolio}
          equippedHeroId={equippedHeroId}
          equippedHeroStars={equippedHeroStars}
          equippedSkinId={meta.equippedSkins?.[equippedHeroId]}
          runRelics={run.runRelics}
          activeRunSkills={run.activeRunSkills}
          onResume={() => setTacticalPauseOpen(false)}
          onCashOut={() => {
            setTacticalPauseOpen(false)
            const stg = run.currentStageId
            const cleared = Math.max(0, run.currentNodeIndex)
            const payout = run.endRun(false)
            simRef.current = null
            activeNodeRef.current = ''
            if (payout) {
              setSummaryModal({
                wonStage: false,
                stageNumber: stg,
                nodesCleared: cleared,
                payout,
              })
            } else {
              onReturnToHub?.()
            }
          }}
        />
      )}

      {/* Run Summary Modal (Always includes [ 🏠 RETURN TO HOME ] alongside Stage Replay / Next Stage) */}
      {summaryModal && (
        <RunSummaryModal
          wonStage={summaryModal.wonStage}
          stageNumber={summaryModal.stageNumber}
          nodesCleared={summaryModal.nodesCleared}
          payout={summaryModal.payout}
          onPlayAgain={() => {
            const stg = summaryModal.stageNumber
            setSummaryModal(null)
            candleHistoryRef.current = []
            run.startRun(stg)
          }}
          onReturnHome={handleReturnHome}
          onNextStage={
            summaryModal.wonStage && summaryModal.stageNumber < STAGES.length
              ? () => {
                  const nextStg = summaryModal.stageNumber + 1
                  setSummaryModal(null)
                  candleHistoryRef.current = []
                  run.startRun(nextStg)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
