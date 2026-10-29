import { useState, useEffect } from 'react'
import {
  X,
  Flame,
} from 'lucide-react'
import {
  getTowerFloorBoss,
  type TowerBoss,
  type TowerMilestoneReward,
} from '../../config/tower.config'
import { HERO_MAP } from '../../config/heroes.config'
import { COIN_MAP } from '../../config/coins.config'
import { useMetaStore, selectActiveLoadout } from '../../state/useMetaStore'
import { AudioSynth } from '../../engine/AudioSynth'
import { fmtNum } from '../../engine/format'
import {
  BossAvatarSvg,
  SatoshiGemIcon,
  HashrateIcon,
} from '../GameArtwork'
import { HeroChibiSvg } from '../WorldDioramaArt'

interface TowerBattleModalProps {
  initialFloor: number
  onClose: () => void
}

export function TowerBattleModal({ initialFloor, onClose }: TowerBattleModalProps) {
  const meta = useMetaStore()
  const [currentFloor, setCurrentFloor] = useState(initialFloor)
  const [boss, setBoss] = useState<TowerBoss>(() => getTowerFloorBoss(initialFloor))

  // Battle Combat State
  const [bossHp, setBossHp] = useState(() => boss.maxHp)
  const [playerHp, setPlayerHp] = useState(1500)
  const [maxPlayerHp, setMaxPlayerHp] = useState(1500)
  const [bossAtkTimer, setBossAtkTimer] = useState(boss.atkIntervalSec)
  const [heroSkillCharge, setHeroSkillCharge] = useState(0)
  const [battlePhase, setBattlePhase] = useState<'fighting' | 'victory' | 'defeat'>('fighting')
  const [victoryRewards, setVictoryRewards] = useState<{
    hashrate: number
    gems: number
    solderWire?: number
    blueprints?: number
    milestoneReward?: TowerMilestoneReward
  } | null>(null)

  // Floating damage / combat feedback
  const [floats, setFloats] = useState<
    Array<{ id: number; text: string; color: string; x: number; y: number }>
  >([])

  const equippedHeroId = meta.equippedHeroId ?? 'rookie_satoshi'
  const heroCfg = HERO_MAP[equippedHeroId] ?? HERO_MAP.rookie_satoshi
  const heroStars = (meta.heroStars ?? {})[equippedHeroId] ?? 1
  const loadout = selectActiveLoadout(meta)

  // Initialize floor
  const initFloor = (floorNum: number) => {
    const nextBoss = getTowerFloorBoss(floorNum)
    setBoss(nextBoss)
    setBossHp(nextBoss.maxHp)
    const baseMargin = 1200 + floorNum * 80
    setPlayerHp(baseMargin)
    setMaxPlayerHp(baseMargin)
    setBossAtkTimer(nextBoss.atkIntervalSec)
    setHeroSkillCharge(0)
    setBattlePhase('fighting')
    setVictoryRewards(null)
  }

  // Float text helper
  const addFloat = (text: string, color: 'green' | 'red' | 'gold') => {
    const id = Date.now() + Math.random()
    const x = Math.random() * 40 - 20
    const y = Math.random() * 20 - 10
    setFloats((prev) => [...prev.slice(-6), { id, text, color, x, y }])
    window.setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id))
    }, 1200)
  }

  // Combat loop
  useEffect(() => {
    if (battlePhase !== 'fighting') return

    const interval = window.setInterval(() => {
      // 1. Coin attack simulation (every 0.5s ticks)
      const isGreen = Math.random() < 0.65
      const activeCoins = loadout.filter(Boolean)
      const coinCount = Math.max(1, activeCoins.length)

      if (isGreen) {
        // Player deals damage to Boss
        const baseDmg = Math.round(
          (boss.maxHp * 0.05 + 120) * (1 + (heroStars - 1) * 0.2) * (coinCount * 0.4),
        )
        setBossHp((prev) => {
          const next = Math.max(0, prev - baseDmg)
          if (next === 0) {
            handleVictory()
          }
          return next
        })
        setHeroSkillCharge((c) => Math.min(100, c + 14))
        addFloat(`+$${fmtNum(baseDmg)}`, 'green')
      } else {
        // Red roll: minor recoil
        const recoil = Math.round(boss.atk * 0.25)
        setPlayerHp((prev) => Math.max(0, prev - recoil))
        addFloat(`-$${fmtNum(recoil)}`, 'red')
      }

      // 2. Boss attack countdown
      setBossAtkTimer((prev) => {
        const next = Math.max(0, prev - 0.5)
        if (next === 0) {
          // Boss strikes Player Margin!
          AudioSynth.unlock()
          AudioSynth.playRedDump()
          setPlayerHp((hp) => {
            const nextHp = Math.max(0, hp - boss.atk)
            if (nextHp === 0) {
              handleDefeat()
            }
            return nextHp
          })
          addFloat(`BOSS ATK -${fmtNum(boss.atk)}!`, 'red')
          return boss.atkIntervalSec
        }
        return next
      })
    }, 500)

    return () => window.clearInterval(interval)
  }, [battlePhase, boss, heroStars, loadout])

  const handleVictory = () => {
    AudioSynth.unlock()
    AudioSynth.playVictory()
    setBattlePhase('victory')
    const res = meta.completeTowerFloor(currentFloor)
    setVictoryRewards(res)
    // Discover boss in codex if applicable
    meta.discoverCodexEntry(`boss_tower_${currentFloor}`)
  }

  const handleDefeat = () => {
    AudioSynth.unlock()
    AudioSynth.playMarginCall()
    setBattlePhase('defeat')
    meta.failTowerFloor()
  }

  const handleHeroSkill = () => {
    if (heroSkillCharge < 100 || battlePhase !== 'fighting') return
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    setHeroSkillCharge(0)

    const ultDmg = Math.round(boss.maxHp * 0.35 * (1 + (heroStars - 1) * 0.25))
    setBossHp((prev) => {
      const next = Math.max(0, prev - ultDmg)
      if (next === 0) {
        handleVictory()
      }
      return next
    })
    // Also heal margin
    setPlayerHp((hp) => Math.min(maxPlayerHp, hp + Math.round(maxPlayerHp * 0.25)))
    addFloat(`🔥 ${heroCfg.activeSkillName.toUpperCase()} +$${fmtNum(ultDmg)}!`, 'gold')
  }

  const handleNextFloor = () => {
    const nextF = currentFloor + 1
    setCurrentFloor(nextF)
    initFloor(nextF)
  }

  const handleRetreat = () => {
    if (battlePhase === 'fighting') {
      meta.failTowerFloor()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#181119] text-white shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-white/15 bg-gradient-to-r from-[#4a044e] via-[#701a75] to-[#4a044e] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗼</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-black text-white">
                  {boss.isInfiniteDescent ? `DESCENT FLOOR ${currentFloor}` : `TOWER FLOOR ${currentFloor}`}
                </span>
                {boss.isInfiniteDescent ? (
                  <span className="rounded-full bg-[#f43f5e] px-2 py-0.2 font-display text-[9px] font-black text-white">
                    INFINITE DESCENT
                  </span>
                ) : boss.isMilestone && (
                  <span className="rounded-full bg-[#fde047] px-2 py-0.2 font-display text-[9px] font-black text-[#451a03]">
                    MILESTONE
                  </span>
                )}
              </div>
              <div className="text-[10px] font-semibold text-[#f5d0fe]">
                Attempts Left: {meta.towerAttemptsLeft}/3 • Free Push Mode
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetreat}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/30 bg-black/30 text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Combat Visual Arena */}
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden p-4">
          {/* Floating Damage Overlay */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            {floats.map((f) => (
              <div
                key={f.id}
                style={{ transform: `translate(${f.x}px, ${f.y}px)` }}
                className={`font-display text-base font-black tracking-wider game-text-outline-sm animate-bounce ${
                  f.color === 'green'
                    ? 'text-[#4ade80]'
                    : f.color === 'gold'
                      ? 'text-[#fde047]'
                      : 'text-[#f43f5e]'
                }`}
              >
                {f.text}
              </div>
            ))}
          </div>

          {/* BOSS CARD (TOP) */}
          <div className="flex flex-col items-center rounded-2xl border-2 border-white/20 bg-black/40 p-3 shadow-inner">
            <div className="flex items-center gap-3 w-full mb-2">
              <div className="relative">
                <BossAvatarSvg name={boss.name} portrait={boss.portrait} size={54} />
                <span className="absolute -bottom-1 -right-1 rounded-full bg-[#e11d48] px-1.5 py-0.2 text-[8px] font-black">
                  BOSS
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-xs font-black text-white truncate">
                  {boss.name}
                </div>
                <div className="text-[10px] font-semibold text-[#f472b6]">
                  {boss.title}
                </div>
                <div className="mt-0.5 inline-block rounded-md bg-[#e11d48]/30 px-1.5 py-0.2 text-[9px] font-extrabold text-[#fda4af]">
                  ⚡ {boss.affixName}
                </div>
              </div>
            </div>

            {/* Boss HP Bar */}
            <div className="w-full">
              <div className="flex justify-between text-[10px] font-extrabold mb-1">
                <span className="text-[#fca5a5]">Boss HP</span>
                <span>
                  ${fmtNum(bossHp)} / ${fmtNum(boss.maxHp)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full border border-white/20 bg-black/60 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#fde047] transition-all duration-300"
                  style={{ width: `${Math.round((bossHp / boss.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Boss Attack Countdown */}
            <div className="mt-2 flex items-center justify-between w-full text-[9px] font-extrabold text-[#fecdd3]">
              <span>Next Attack in:</span>
              <span className="rounded bg-black/50 px-1.5 py-0.2 font-mono text-[#f43f5e]">
                {bossAtkTimer.toFixed(1)}s (ATK: {boss.atk})
              </span>
            </div>
          </div>

          {/* VS Divider */}
          <div className="my-2 flex items-center justify-center">
            <span className="rounded-full border border-white/20 bg-black/60 px-3 py-0.5 font-display text-[10px] font-black text-[#fde047]">
              ⚔️ LIVE TOWER LIQUIDATION GAUNTLET ⚔️
            </span>
          </div>

          {/* PLAYER SQUAD (BOTTOM) */}
          <div className="flex flex-col rounded-2xl border-2 border-white/20 bg-black/40 p-3 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10">
                  <HeroChibiSvg heroId={equippedHeroId} size={40} />
                </div>
                <div>
                  <div className="font-display text-xs font-black text-white">
                    {heroCfg.name}
                  </div>
                  <div className="text-[10px] font-semibold text-[#fde047]">
                    {'★'.repeat(heroStars)} • {heroCfg.passiveName}
                  </div>
                </div>
              </div>

              {/* 4 Active Coins */}
              <div className="flex items-center gap-1">
                {loadout.map((c, i) => {
                  const cfg = c ? COIN_MAP[c.coinId] : null
                  return (
                    <div
                      key={i}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/30 bg-[#2d1b33] font-display text-[9px] font-black"
                    >
                      {cfg ? cfg.ticker.slice(0, 3) : '-'}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Player Margin HP Bar */}
            <div className="w-full">
              <div className="flex justify-between text-[10px] font-extrabold mb-1">
                <span className="text-[#86efac]">Player Margin HP</span>
                <span>
                  ${fmtNum(playerHp)} / ${fmtNum(maxPlayerHp)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full border border-white/20 bg-black/60 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#86efac] transition-all duration-300"
                  style={{ width: `${Math.round((playerHp / maxPlayerHp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Hero Active Skill Button */}
            <div className="mt-2.5">
              <button
                type="button"
                disabled={heroSkillCharge < 100 || battlePhase !== 'fighting'}
                onClick={handleHeroSkill}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 font-display text-xs font-black uppercase tracking-wider transition-all ${
                  heroSkillCharge >= 100
                    ? 'btn-3d-gold text-white game-text-outline-sm animate-pulse shadow-lg'
                    : 'border border-white/20 bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-[#f59e0b]" />
                  {heroCfg.activeSkillName}
                </span>
                <span>{heroSkillCharge >= 100 ? 'READY! (TAP)' : `${heroSkillCharge}%`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* VICTORY OVERLAY */}
        {battlePhase === 'victory' && victoryRewards && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-4 animate-fade-in text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#fde047] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-3xl shadow-lg mb-2">
              🏆
            </div>
            <h3 className="font-display text-lg font-black text-[#fde047] game-text-outline-sm">
              FLOOR {currentFloor} CLEARED!
            </h3>
            <p className="text-[11px] font-semibold text-[#fef08a] mb-3">
              {boss.name} liquidated! Attempts left: {meta.towerAttemptsLeft}/3 (NOT consumed!)
            </p>

            {/* Loot Box */}
            <div className="w-full max-w-xs rounded-2xl border-2 border-[#fde047] bg-[#2C1810] p-3 mb-4 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#fde047]">
                <span>Floor Hashrate:</span>
                <span className="flex items-center gap-1">
                  <HashrateIcon size={14} />+{fmtNum(victoryRewards.hashrate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-extrabold text-[#38bdf8]">
                <span>Floor Gems:</span>
                <span className="flex items-center gap-1">
                  <SatoshiGemIcon size={14} />+{victoryRewards.gems}
                </span>
              </div>
              {Boolean(victoryRewards.solderWire && victoryRewards.solderWire > 0) && (
                <div className="flex items-center justify-between text-xs font-extrabold text-[#fdba74]">
                  <span>Solder Wire:</span>
                  <span>+{victoryRewards.solderWire}</span>
                </div>
              )}
              {Boolean(victoryRewards.blueprints && victoryRewards.blueprints > 0) && (
                <div className="flex items-center justify-between text-xs font-extrabold text-[#67e8f9]">
                  <span>Blueprints:</span>
                  <span>+{victoryRewards.blueprints}</span>
                </div>
              )}

              {victoryRewards.milestoneReward && (
                <div className="mt-2 border-t border-white/20 pt-2 text-left">
                  <span className="font-display text-[10px] font-black text-[#fde047] uppercase">
                    ⭐ Milestone Chest Unlocked!
                  </span>
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold text-white">
                    {victoryRewards.milestoneReward.quantumKeys > 0 && (
                      <span className="text-[#c084fc]">
                        🔑 +{victoryRewards.milestoneReward.quantumKeys} Quantum Key
                      </span>
                    )}
                    {victoryRewards.milestoneReward.silverKeys > 0 && (
                      <span className="text-[#94a3b8]">
                        🗝️ +{victoryRewards.milestoneReward.silverKeys} Silver Key
                      </span>
                    )}
                    <span className="text-[#fb923c]">
                      🧩 +{victoryRewards.milestoneReward.heroFragments} Frags
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full max-w-xs flex-col gap-2">
              <button
                type="button"
                onClick={handleNextFloor}
                className="btn-3d-green w-full py-2.5 font-display text-xs font-black uppercase text-white game-text-outline-sm shadow-lg"
              >
                🚀 Climb Floor {currentFloor + 1} &gt;&gt;
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/30 bg-white/10 py-2 font-display text-xs font-bold text-white/80 hover:bg-white/20"
              >
                Collect Loot &amp; Exit Tower
              </button>
            </div>
          </div>
        )}

        {/* DEFEAT OVERLAY */}
        {battlePhase === 'defeat' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-4 animate-fade-in text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#ef4444] bg-[#450a0a] text-3xl shadow-lg mb-2">
              💀
            </div>
            <h3 className="font-display text-lg font-black text-[#ef4444] game-text-outline-sm">
              MARGIN LIQUIDATED!
            </h3>
            <p className="text-[11px] font-semibold text-[#fca5a5] mb-2">
              Defeated on Floor {currentFloor} by {boss.name}.
            </p>
            <div className="mb-4 rounded-xl border border-[#ef4444]/40 bg-[#450a0a]/60 px-4 py-2 font-display text-xs font-bold text-[#fca5a5]">
              1 Tower Attempt Deducted ({meta.towerAttemptsLeft}/3 Left Today)
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-3d-red w-full max-w-xs py-2.5 font-display text-xs font-black uppercase text-white game-text-outline-sm shadow-lg"
            >
              Return to Missions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
