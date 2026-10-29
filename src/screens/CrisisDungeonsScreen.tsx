import React, { useState, useEffect } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useMetaStore, type CrisisDungeonId, type CrisisDungeonReward } from '../state/useMetaStore'
import { AudioSynth } from '../engine/AudioSynth'
import { AudioHaptics } from '../utils/audioHaptics'
import { fmtNum } from '../engine/format'
import { CATALOG_RIG_ITEMS, type RigItem } from '../config/equipment.config'

export interface CrisisDungeonConfig {
  id: CrisisDungeonId
  title: string
  subtitle: string
  tagline: string
  themeColor: string
  borderColor: string
  bgGradient: string
  badgeText: string
  badgeBg: string
  icon: string
  mechanicLabel: string
  mechanicDescription: string
  waves: Array<{
    name: string
    title: string
    hp: number
    attack: number
    attackSpeed: number
    icon: string
  }>
  rewardsSummary: {
    blueprints?: number
    solderWire?: number
    hashrate?: number
    gems?: number
    quantumKeys?: number
    silverKeys?: number
    hardwareRarity?: string
  }
}

export const CRISIS_DUNGEONS: CrisisDungeonConfig[] = [
  {
    id: 'gas_gauntlet',
    title: 'The Gas Fee Gauntlet',
    subtitle: 'Time Attack · 5 Waves of Mempool Congestion',
    tagline: 'Liquidate all 5 block congestion sentinels before the -2.5%/s Gwei Surge depletes your Margin Gas!',
    themeColor: '#ea580c',
    borderColor: '#c2410c',
    bgGradient: 'from-[#431407] via-[#2a0800] to-[#1a0500]',
    badgeText: 'TIME ATTACK • GWEI SURGE',
    badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    icon: '⛽',
    mechanicLabel: '-2.5% Margin HP Drain / Sec',
    mechanicDescription: 'The enemy does NOT strike, but your Margin HP vaporizes as gas priority fees escalate! Overclock tick speed to clear 5 waves before zero balance.',
    waves: [
      { name: 'Tx Mempool Queue', title: 'Pending Transactions', hp: 3200, attack: 0, attackSpeed: 99, icon: '📜' },
      { name: 'Priority Fee Spike', title: 'Dynamic EIP-1559 Spurt', hp: 6800, attack: 0, attackSpeed: 99, icon: '🔥' },
      { name: 'Front-Runner MEV Bot', title: 'Arbitrage Sandwhicher', hp: 14500, attack: 0, attackSpeed: 99, icon: '🤖' },
      { name: 'Blob Gas Congestion', title: 'Layer-2 Rollup Jam', hp: 28000, attack: 0, attackSpeed: 99, icon: '🫧' },
      { name: 'Block Builder Overlord', title: 'Mev-Boost Master Relay', hp: 55000, attack: 0, attackSpeed: 99, icon: '👑' },
    ],
    rewardsSummary: {
      blueprints: 25,
      solderWire: 80,
      hashrate: 15000,
    },
  },
  {
    id: 'cold_storage',
    title: 'The Cold Storage Vault',
    subtitle: 'Attrition & Defense · 5 Deep-Freeze Waves',
    tagline: 'Survive rapid-fire orderbook dump bot strikes using your Margin Shields and Rig PSU defenses!',
    themeColor: '#0284c7',
    borderColor: '#0369a1',
    bgGradient: 'from-[#082f49] via-[#031d30] to-[#01111d]',
    badgeText: 'ATTRITION • DEFENSIVE TEST',
    badgeBg: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    icon: '🧊',
    mechanicLabel: 'Rapid Flat Attacks (0.65s Cd)',
    mechanicDescription: 'Low enemy HP, but relentless attack cadence! Tests Stop-Loss Algos, MechaShiba Shields, and Rig Power Supply health pools.',
    waves: [
      { name: 'Icebox Firewall', title: 'Hardware Air-Gap Level 1', hp: 1800, attack: 14, attackSpeed: 0.7, icon: '🧱' },
      { name: 'HSM Cryptoprocessor', title: 'Secure Enclave Bot', hp: 3500, attack: 22, attackSpeed: 0.65, icon: '🛡️' },
      { name: 'Air-Gapped Vault Keeper', title: 'Zero-Trust Protocol', hp: 7500, attack: 35, attackSpeed: 0.6, icon: '🔐' },
      { name: 'Multi-Sig Sentinel', title: '3-of-5 Signature Barrier', hp: 14000, attack: 52, attackSpeed: 0.55, icon: '🗝️' },
      { name: 'BIP-39 Deep Freeze Titan', title: 'Seed Phrase Obsidian Golem', hp: 26000, attack: 78, attackSpeed: 0.5, icon: '🗿' },
    ],
    rewardsSummary: {
      solderWire: 50,
      hashrate: 18000,
      hardwareRarity: 'Epic / Legendary Hardware Part',
    },
  },
  {
    id: 'memecoin_casino',
    title: 'The Memecoin Casino',
    subtitle: 'Ultra Volatility · Flat Rolls Disabled',
    tagline: 'High-roller degenerate tables: 100% of rolls are either +350% 10x Mega-Pumps or -80% Flash Dumps!',
    themeColor: '#d946ef',
    borderColor: '#c026d3',
    bgGradient: 'from-[#4a044e] via-[#2e0231] to-[#1a011c]',
    badgeText: 'ULTRA VOLATILITY • 10X MEGA-PUMP',
    badgeBg: 'bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white',
    icon: '🎰',
    mechanicLabel: '+350% Mega-Pump vs -80% Dump',
    mechanicDescription: 'Standard flat odds eliminated. Experience extreme casino candlestick swings: deal cataclysmic burst damage or tank violent dips!',
    waves: [
      { name: 'Moonshot Degenerate', title: '100x Leverage Rookie', hp: 4500, attack: 18, attackSpeed: 1.2, icon: '🐕' },
      { name: 'Pump & Dump Telegram Cabal', title: 'Coordinated Market Order', hp: 11000, attack: 30, attackSpeed: 1.1, icon: '📣' },
      { name: 'Leveraged Ape Liquidity Pool', title: 'Farming Degen Herd', hp: 22000, attack: 45, attackSpeed: 1.0, icon: '🦍' },
      { name: 'Rugpull Roulette Wheel', title: 'Liquidity Siphoner', hp: 42000, attack: 68, attackSpeed: 0.9, icon: '🎡' },
      { name: 'Diamond Hand High Roller', title: 'Unshakable Bagholder Whale', hp: 88000, attack: 95, attackSpeed: 0.85, icon: '💎' },
    ],
    rewardsSummary: {
      gems: 200,
      quantumKeys: 3,
      silverKeys: 5,
      hashrate: 22000,
    },
  },
]

export const CrisisDungeonsScreen: React.FC = () => {
  const meta = useMetaStore()
  const [activeBattleDungeon, setActiveBattleDungeon] = useState<CrisisDungeonConfig | null>(null)

  // Live Auto-Battle State inside the Crisis Dungeon
  const [currentWave, setCurrentWave] = useState<number>(0)
  const [enemyHp, setEnemyHp] = useState<number>(1000)
  const [enemyMaxHp, setEnemyMaxHp] = useState<number>(1000)
  const [playerHp, setPlayerHp] = useState<number>(1000)
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(1000)
  const [battleState, setBattleState] = useState<'idle' | 'running' | 'wave_clear' | 'victory' | 'defeat'>('idle')
  const [battleLog, setBattleLog] = useState<Array<{ id: number; text: string; color: string }>>([])
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [awardedLoot, setAwardedLoot] = useState<CrisisDungeonReward | null>(null)

  useEffect(() => {
    meta.syncCrisisDailyAttempts()
  }, [])

  const startDungeonBattle = (dungeon: CrisisDungeonConfig) => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    AudioHaptics.vibrateCounterPump()

    meta.recordCrisisAttempt(dungeon.id)

    // Calculate starting stats scaled by player's Rig + Level
    const rigStats = meta.getEquippedRigStats?.() ?? { flatHp: 0, marginHpPct: 0 }
    const baseMargin = 1200 + (rigStats.flatHp ?? 0)
    const totalMaxHp = Math.round(baseMargin * (1 + (rigStats.marginHpPct ?? 0) / 100))

    const firstWave = dungeon.waves[0]
    setPlayerHp(totalMaxHp)
    setPlayerMaxHp(totalMaxHp)
    setEnemyHp(firstWave.hp)
    setEnemyMaxHp(firstWave.hp)
    setCurrentWave(0)
    setElapsedSeconds(0)
    setBattleLog([
      { id: 1, text: `⚡ ENTERED ${dungeon.title.toUpperCase()}!`, color: '#facc15' },
      { id: 2, text: `Wave 1/5: ${firstWave.name} (${firstWave.title})`, color: '#38bdf8' },
    ])
    setActiveBattleDungeon(dungeon)
    setBattleState('running')
    setAwardedLoot(null)
  }

  // Real-Time Combat Simulation Loop for the Crisis Dungeon
  useEffect(() => {
    if (battleState !== 'running' || !activeBattleDungeon) return

    const dungeon = activeBattleDungeon
    let lastEnemyAttack = 0

    const interval = window.setInterval(() => {
      setElapsedSeconds((sec) => sec + 0.2)

      // ── MECHANIC 1: THE GAS FEE GAUNTLET (-2.5% HP drain / sec) ──
      if (dungeon.id === 'gas_gauntlet') {
        setPlayerHp((curHp) => {
          const drain = Math.max(1, Math.round(playerMaxHp * 0.025 * 0.2))
          const next = curHp - drain
          if (next <= 0) {
            setBattleState('defeat')
            AudioHaptics.playDefeatSound()
            setBattleLog((l) => [
              ...l.slice(-6),
              { id: Date.now(), text: '💥 MARGIN CALL: Out of Gas! Gwei Surge depleted portfolio.', color: '#ef4444' },
            ])
            return 0
          }
          return next
        })
      }

      // ── PLAYER COINS AUTO-FIRE DAMAGE ──
      const activeCoins = meta.equippedCoinIds.filter(Boolean)
      const numCoins = Math.max(1, activeCoins.length)
      const rigStats = meta.getEquippedRigStats?.() ?? { flatAtk: 0, greenDamagePct: 0, critChance: 0 }

      let playerDamage = 0
      let isCrit = false
      let rollDesc = ''

      if (dungeon.id === 'memecoin_casino') {
        // Ultra Volatility: 50/50 +350% 10x Mega-Pump vs -80% Flash Dump
        const isMegaPump = Math.random() > 0.45
        if (isMegaPump) {
          playerDamage = Math.round((280 + (rigStats.flatAtk ?? 0) * 4) * 4.5 * numCoins)
          isCrit = true
          rollDesc = '🎰 10x MEGA-PUMP BURST!'
          AudioHaptics.playCoinTick()
          AudioHaptics.vibrateGreenTick()
        } else {
          // -80% Flash Dump strikes player for margin attrition
          const dumpMargin = Math.round(playerMaxHp * 0.06)
          setPlayerHp((hp) => Math.max(1, hp - dumpMargin))
          playerDamage = Math.round(40 * numCoins)
          rollDesc = '📉 -80% FLASH CRASH DUMP!'
          AudioHaptics.playRedCounter()
          AudioHaptics.vibrateRedCounter()
        }
      } else {
        // Standard high-haste coin ticking
        const baseDmg = (180 + (rigStats.flatAtk ?? 0) * 2) * numCoins
        const critRoll = Math.random() * 100 < (15 + (rigStats.critChance ?? 0))
        isCrit = critRoll
        playerDamage = Math.round(baseDmg * (critRoll ? 2.2 : 1.0) * (1 + (rigStats.greenDamagePct ?? 0) / 100))
        rollDesc = critRoll ? '💥 CRIT PUMP!' : '🟢 CANDLE TICK'
        AudioHaptics.playCoinTick()
      }

      if (Math.random() > 0.65) {
        setBattleLog((l) => [
          ...l.slice(-5),
          {
            id: Date.now() + Math.random(),
            text: `${rollDesc} dealing ${fmtNum(playerDamage)} DMG`,
            color: isCrit ? '#facc15' : '#4ade80',
          },
        ])
      }

      // Damage the wave enemy
      setEnemyHp((curEhp) => {
        const next = Math.max(0, curEhp - playerDamage)
        if (next <= 0) {
          // WAVE CLEARED!
          const nextWaveIdx = currentWave + 1
          if (nextWaveIdx >= dungeon.waves.length) {
            // FULL DUNGEON CLEARED!
            setBattleState('victory')
            AudioHaptics.playVictoryJingle()

            // Generate rewards
            let randomRig: RigItem | undefined = undefined
            if (dungeon.id === 'cold_storage') {
              const eligible = CATALOG_RIG_ITEMS.filter((i) => i.rarity === 'epic' || i.rarity === 'legendary')
              randomRig = eligible[Math.floor(Math.random() * eligible.length)]
            }

            const reward: CrisisDungeonReward = {
              blueprints: dungeon.rewardsSummary.blueprints,
              solderWire: dungeon.rewardsSummary.solderWire,
              hashrate: dungeon.rewardsSummary.hashrate,
              gems: dungeon.rewardsSummary.gems,
              quantumKeys: dungeon.rewardsSummary.quantumKeys,
              silverKeys: dungeon.rewardsSummary.silverKeys,
              rigItem: randomRig,
            }
            meta.claimCrisisReward(dungeon.id, reward)
            setAwardedLoot(reward)

            setBattleLog((l) => [
              ...l.slice(-6),
              { id: Date.now(), text: `🏆 ${dungeon.title.toUpperCase()} FULLY LIQUIDATED!`, color: '#22c55e' },
            ])
            return 0
          } else {
            // Advance to next wave
            const nextWaveCfg = dungeon.waves[nextWaveIdx]
            setCurrentWave(nextWaveIdx)
            setEnemyMaxHp(nextWaveCfg.hp)
            AudioSynth.playRelicTrigger()
            setBattleLog((l) => [
              ...l.slice(-6),
              { id: Date.now(), text: `✓ Wave ${currentWave + 1} Cleared! Spawning ${nextWaveCfg.name}...`, color: '#38bdf8' },
            ])
            return nextWaveCfg.hp
          }
        }
        return next
      })

      // ── ENEMY ATTACK LOGIC (Cold Storage & Casino) ──
      const curWaveCfg = dungeon.waves[currentWave]
      if (curWaveCfg && curWaveCfg.attack > 0) {
        lastEnemyAttack += 0.2
        if (lastEnemyAttack >= curWaveCfg.attackSpeed) {
          lastEnemyAttack = 0
          const enDmg = curWaveCfg.attack
          setPlayerHp((hp) => {
            const next = Math.max(0, hp - enDmg)
            if (next <= 0) {
              setBattleState('defeat')
              AudioHaptics.playDefeatSound()
              setBattleLog((l) => [
                ...l.slice(-6),
                { id: Date.now(), text: `💥 MARGIN CALL: Crushed by ${curWaveCfg.name}!`, color: '#ef4444' },
              ])
              return 0
            }
            return next
          })
          AudioHaptics.playRedCounter()
          AudioHaptics.vibrateRedCounter()
        }
      }
    }, 200)

    return () => window.clearInterval(interval)
  }, [battleState, activeBattleDungeon, currentWave, playerMaxHp, meta])

  const attempts = meta.crisisDungeonAttempts ?? { gas_gauntlet: 0, cold_storage: 0, memecoin_casino: 0 }

  return (
    <div className="flex flex-col gap-3 select-none pb-6">
      {/* ── Header Banner ── */}
      <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">⚡</span>
            <div>
              <h2 className="font-display text-sm font-black uppercase tracking-wide text-[#2C1810]">
                Daily Crisis Dungeons
              </h2>
              <p className="text-[10px] font-semibold text-[#6E5A4F]">
                3 Rotating Challenge Modes • 1 Free Daily Clear Per Dungeon
              </p>
            </div>
          </div>
          <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 font-display text-[9px] font-black text-amber-900 shadow-xs">
            00:00 UTC RESET
          </span>
        </div>

        {/* Resources Preview */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center font-display text-[11px] font-black">
          <div className="rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] py-1.5 text-[#b45309]">
            <div className="text-[8.5px] uppercase font-bold text-[#6E5A4F]">Blueprints</div>
            <div>📐 {meta.furnitureBlueprints ?? 0}</div>
          </div>
          <div className="rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] py-1.5 text-[#0284c7]">
            <div className="text-[8.5px] uppercase font-bold text-[#6E5A4F]">Solder Wire</div>
            <div>🧵 {meta.solderWire ?? 0}</div>
          </div>
          <div className="rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] py-1.5 text-[#16a34a]">
            <div className="text-[8.5px] uppercase font-bold text-[#6E5A4F]">Attempts</div>
            <div>
              {3 - Object.values(attempts).filter((v) => v > 0).length}/3 Free
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 Dungeon Cards ── */}
      <div className="space-y-3">
        {CRISIS_DUNGEONS.map((dungeon) => {
          const isCleared = (attempts[dungeon.id] ?? 0) > 0

          return (
            <div
              key={dungeon.id}
              className={`relative overflow-hidden rounded-3xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-b ${dungeon.bgGradient} p-4 text-white shadow-lg transition-all`}
            >
              {/* Top Tag & Status */}
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-display text-[9px] font-black uppercase tracking-wider ${dungeon.badgeBg}`}
                >
                  {dungeon.badgeText}
                </span>

                {isCleared ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400 px-2.5 py-0.5 font-display text-[9px] font-black text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> CLEARED TODAY
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-400/20 border border-amber-300 px-2.5 py-0.5 font-display text-[9px] font-black text-amber-300 animate-pulse">
                    FREE ATTEMPT READY
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="mt-2.5 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 bg-black/40 text-2xl shadow-inner">
                  {dungeon.icon}
                </div>
                <div>
                  <h3 className="font-display text-sm font-black text-white leading-tight">
                    {dungeon.title}
                  </h3>
                  <p className="text-[10px] font-semibold text-stone-300 mt-0.5">
                    {dungeon.subtitle}
                  </p>
                  <p className="text-[9.5px] text-stone-400 mt-1 leading-snug">
                    {dungeon.tagline}
                  </p>
                </div>
              </div>

              {/* Unique Mechanic Callout */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-2.5">
                <div className="flex items-center gap-1.5 font-display text-[10px] font-black text-amber-300 uppercase">
                  <span>⚡ Special Rule:</span>
                  <span>{dungeon.mechanicLabel}</span>
                </div>
                <p className="text-[9px] text-stone-300 mt-0.5">
                  {dungeon.mechanicDescription}
                </p>
              </div>

              {/* Target Loot Rewards */}
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                <div className="flex items-center gap-2 text-[10px] font-black">
                  <span className="text-stone-400 font-semibold text-[9px]">Loot:</span>
                  {dungeon.rewardsSummary.blueprints && (
                    <span className="text-amber-300">📐 +{dungeon.rewardsSummary.blueprints}</span>
                  )}
                  {dungeon.rewardsSummary.solderWire && (
                    <span className="text-cyan-300">🧵 +{dungeon.rewardsSummary.solderWire}</span>
                  )}
                  {dungeon.rewardsSummary.gems && (
                    <span className="text-fuchsia-300">💎 +{dungeon.rewardsSummary.gems}</span>
                  )}
                  {dungeon.rewardsSummary.hardwareRarity && (
                    <span className="text-emerald-300">⛏️ {dungeon.rewardsSummary.hardwareRarity}</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isCleared}
                  onClick={() => startDungeonBattle(dungeon)}
                  className={`btn-3d-gold flex items-center gap-1.5 rounded-2xl px-4 py-2 font-display text-xs font-black uppercase text-white shadow transition-all active:scale-95 ${
                    isCleared ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{isCleared ? 'CLEARED' : 'ENTER'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── LIVE IN-DUNGEON BATTLE ARENA MODAL ── */}
      {activeBattleDungeon && battleState !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md">
          <div className="relative flex w-full max-w-[430px] flex-col overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#1a0500] text-white shadow-2xl">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeBattleDungeon.icon}</span>
                <div>
                  <h3 className="font-display text-xs font-black uppercase text-white">
                    {activeBattleDungeon.title}
                  </h3>
                  <div className="text-[9px] font-bold text-amber-400">
                    WAVE {currentWave + 1} OF 5 • {activeBattleDungeon.waves[currentWave]?.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-0.5 font-display text-[10px] font-black text-amber-300">
                  ⏱️ {elapsedSeconds.toFixed(1)}s
                </div>
                {(battleState === 'victory' || battleState === 'defeat') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBattleDungeon(null)
                      setBattleState('idle')
                    }}
                    className="rounded-xl bg-white/20 p-1 hover:bg-white/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Combat Arena Canvas */}
            <div className="relative flex flex-col gap-3 p-4 bg-gradient-to-b from-black/80 via-black/60 to-black/90 min-h-[340px]">
              {/* Enemy Wave Boss Dossier */}
              {activeBattleDungeon.waves[currentWave] && (
                <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl animate-bounce">
                        {activeBattleDungeon.waves[currentWave].icon}
                      </span>
                      <div>
                        <div className="font-display text-xs font-black text-red-200">
                          {activeBattleDungeon.waves[currentWave].name}
                        </div>
                        <div className="text-[9px] font-semibold text-red-400">
                          {activeBattleDungeon.waves[currentWave].title}
                        </div>
                      </div>
                    </div>
                    <div className="font-display text-xs font-black text-red-400">
                      {fmtNum(enemyHp)} / {fmtNum(enemyMaxHp)} HP
                    </div>
                  </div>

                  {/* Enemy HP Bar */}
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-red-900 bg-stone-900">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-200"
                      style={{ width: `${Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Central VS Animation & Ticker Wave Badges */}
              <div className="my-auto flex items-center justify-center gap-2">
                {activeBattleDungeon.waves.map((w, idx) => (
                  <div
                    key={w.name}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-black transition-all ${
                      idx < currentWave
                        ? 'border-emerald-500 bg-emerald-900/60 text-emerald-300'
                        : idx === currentWave
                        ? 'border-amber-400 bg-amber-500/30 text-amber-200 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse'
                        : 'border-stone-800 bg-stone-900/40 text-stone-600'
                    }`}
                  >
                    {idx < currentWave ? '✓' : idx + 1}
                  </div>
                ))}
              </div>

              {/* Player Margin Gas / Health Pool */}
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <div>
                      <div className="font-display text-xs font-black text-emerald-200">
                        {meta.playerName || 'Trader'} Margin Balance
                      </div>
                      <div className="text-[9px] font-semibold text-emerald-400">
                        {activeBattleDungeon.id === 'gas_gauntlet'
                          ? '🔥 Gwei Surge: -2.5% Drain/s Active'
                          : '⚡ Active Defense & Overdrive Running'}
                      </div>
                    </div>
                  </div>
                  <div className="font-display text-xs font-black text-emerald-400">
                    {fmtNum(playerHp)} / {fmtNum(playerMaxHp)} HP
                  </div>
                </div>

                {/* Player Margin Bar */}
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-emerald-900 bg-stone-900">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-cyan-400 transition-all duration-200"
                    style={{ width: `${Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Combat Ticker Console Log */}
              <div className="rounded-xl border border-white/10 bg-black/70 p-2 font-mono text-[9.5px] space-y-0.5 h-20 overflow-hidden flex flex-col justify-end">
                {battleLog.map((log) => (
                  <div key={log.id} style={{ color: log.color }} className="truncate">
                    &gt; {log.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Victory / Defeat Modal Overlays */}
            {battleState === 'victory' && (
              <div className="p-4 border-t border-white/20 bg-gradient-to-b from-emerald-950 via-emerald-900 to-black text-center space-y-2">
                <div className="text-3xl animate-bounce">🏆</div>
                <h4 className="font-display text-base font-black text-emerald-300">
                  CRISIS DUNGEON CLEARED!
                </h4>
                <p className="text-[10px] text-emerald-100">
                  All 5 waves liquidated in {elapsedSeconds.toFixed(1)} seconds!
                </p>

                {/* Awarded Loot Breakdown */}
                {awardedLoot && (
                  <div className="rounded-2xl border border-emerald-400/40 bg-black/60 p-2.5 grid grid-cols-2 gap-2 text-xs font-display font-black text-amber-300">
                    {awardedLoot.blueprints && <div>📐 +{awardedLoot.blueprints} Blueprints</div>}
                    {awardedLoot.solderWire && <div>🧵 +{awardedLoot.solderWire} Solder Wire</div>}
                    {awardedLoot.gems && <div>💎 +{awardedLoot.gems} Gems</div>}
                    {awardedLoot.quantumKeys && <div>🔑 +{awardedLoot.quantumKeys} Quantum Keys</div>}
                    {awardedLoot.silverKeys && <div>🗝️ +{awardedLoot.silverKeys} Silver Keys</div>}
                    {awardedLoot.hashrate && <div>⚡ +{fmtNum(awardedLoot.hashrate)} H/s</div>}
                    {awardedLoot.rigItem && (
                      <div className="col-span-2 text-cyan-300">
                        ⛏️ Found: {awardedLoot.rigItem.name} ({awardedLoot.rigItem.rarity.toUpperCase()})
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveBattleDungeon(null)
                    setBattleState('idle')
                  }}
                  className="w-full btn-3d-green py-2.5 rounded-2xl font-display text-xs font-black uppercase text-white shadow"
                >
                  COLLECT LOOT &amp; RETURN
                </button>
              </div>
            )}

            {battleState === 'defeat' && (
              <div className="p-4 border-t border-white/20 bg-gradient-to-b from-red-950 via-rose-900 to-black text-center space-y-2">
                <div className="text-3xl animate-bounce">💀</div>
                <h4 className="font-display text-base font-black text-rose-300">
                  MARGIN CALL LIQUIDATION!
                </h4>
                <p className="text-[10px] text-rose-200">
                  Wave {currentWave + 1} proved too volatile. Upgrade your hardware rig and try again tomorrow!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBattleDungeon(null)
                    setBattleState('idle')
                  }}
                  className="w-full btn-3d-red py-2.5 rounded-2xl font-display text-xs font-black uppercase text-white shadow"
                >
                  DISMISS &amp; RETURN
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
