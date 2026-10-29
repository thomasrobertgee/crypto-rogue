import React, { useState, useEffect } from 'react'
import {
  X,
  Trophy,
  Crown,
  Play,
  Swords,
} from 'lucide-react'
import { useMetaStore } from '../state/useMetaStore'
import { AudioSynth } from '../engine/AudioSynth'
import { AudioHaptics } from '../utils/audioHaptics'
import { fmtUsd, fmtNum } from '../engine/format'

interface GuildHeistModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GuildHeistModal: React.FC<GuildHeistModalProps> = ({ isOpen, onClose }) => {
  const meta = useMetaStore()
  const [subTab, setSubTab] = useState<'raid' | 'leaderboard' | 'vault'>('raid')

  // 60-Second Blitz Auto-Battle State
  const [isRaiding, setIsRaiding] = useState(false)
  const [blitzTimer, setBlitzTimer] = useState(60.0)
  const [sessionDamage, setSessionDamage] = useState(0)
  const [dps, setDps] = useState(0)
  const [raidFinishedSummary, setRaidFinishedSummary] = useState<{ damageDealt: number; newBossHp: number } | null>(null)
  const [heistLog, setHeistLog] = useState<string[]>([])

  useEffect(() => {
    meta.syncSyndicateHeistDaily()
  }, [])

  const bossHp = meta.syndicateHeistBossHp ?? 442500000
  const maxHp = meta.syndicateHeistMaxHp ?? 500000000
  const attemptsLeft = meta.syndicateHeistAttemptsLeft ?? 2
  const isBossDefeated = bossHp <= 0

  const handleStartHeistBlitz = () => {
    if (attemptsLeft <= 0 || isBossDefeated || isRaiding) return

    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    AudioHaptics.vibrateCounterPump()

    setIsRaiding(true)
    setBlitzTimer(60.0)
    setSessionDamage(0)
    setDps(0)
    setRaidFinishedSummary(null)
    setHeistLog([
      '⚡ 60-SECOND LIQUIDITY POOL HEIST INITIATED!',
      'All wallet coin algorithms unlocked and overclocked at 3.0x frequency.',
    ])
  }

  // 60-Second Auto-Battle Loop
  useEffect(() => {
    if (!isRaiding) return

    const activeCoinsCount = Math.max(1, meta.equippedCoinIds.filter(Boolean).length)
    const rigStats = meta.getEquippedRigStats?.() ?? { flatAtk: 0, greenDamagePct: 0, critChance: 0 }
    const baseDamagePerTick = (320 + (rigStats.flatAtk ?? 0) * 4) * activeCoinsCount * 1.5

    const interval = window.setInterval(() => {
      setBlitzTimer((t) => {
        const next = Math.max(0, Math.round((t - 0.2) * 10) / 10)
        if (next <= 0) {
          // RAID BLITZ COMPLETED!
          setIsRaiding(false)
          AudioHaptics.playVictoryJingle()
          AudioHaptics.vibrateCounterPump()

          // Calculate final burst and record to global Syndicate HP
          setSessionDamage((finalDmg) => {
            const { newBossHp } = meta.recordSyndicateHeistDamage(finalDmg)
            setRaidFinishedSummary({
              damageDealt: finalDmg,
              newBossHp,
            })
            return finalDmg
          })
          return 0
        }
        return next
      })

      // Damage tick
      const isCrit = Math.random() * 100 < (20 + (rigStats.critChance ?? 0))
      const tickDmg = Math.round(
        baseDamagePerTick * (isCrit ? 2.5 : 1.0) * (0.85 + Math.random() * 0.3) * (1 + (rigStats.greenDamagePct ?? 0) / 100),
      )

      setSessionDamage((dmg) => {
        const next = dmg + tickDmg
        return next
      })

      setDps((_) => Math.round(tickDmg * 5))

      if (isCrit) {
        AudioHaptics.playCoinTick()
      }
    }, 200)

    return () => window.clearInterval(interval)
  }, [isRaiding, meta])

  if (!isOpen) return null

  const hpPercent = Math.max(0, Math.min(100, Math.round((bossHp / maxHp) * 1000) / 10))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md select-none">
      <div className="relative flex h-[92vh] max-h-[760px] w-full max-w-[430px] flex-col overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] text-[#2C1810] shadow-2xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#E2D5C1] bg-gradient-to-r from-[#fef3c7] via-[#fffbeb] to-[#fde68a] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#78350f] bg-[#f59e0b] text-xl shadow-xs">
              🏦
            </div>
            <div>
              <h2 className="font-display text-xs font-black uppercase tracking-wider text-[#451a03]">
                Syndicate Liquidity Heist
              </h2>
              <div className="text-[9.5px] font-bold text-[#b45309]">
                Cooperative 30-Member Boss Raid
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              AudioSynth.unlock()
              AudioSynth.playCoinInject()
              onClose()
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] text-[#2C1810] hover:bg-[#fed7aa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Boss Overview Hero Card */}
        <div className="relative overflow-hidden border-b-2 border-[#E2D5C1] bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#0c0a09] p-3.5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-pulse">🏛️</span>
              <div>
                <span className="rounded-full bg-red-600/80 px-2 py-0.2 font-display text-[8.5px] font-black uppercase tracking-wider text-white">
                  CENTRAL BANKING FORTRESS
                </span>
                <h3 className="font-display text-sm font-black text-amber-300">
                  The Central Clearing House
                </h3>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9px] font-bold uppercase text-stone-400">Attempts Left</div>
              <div className="font-display text-xs font-black text-amber-400">
                {attemptsLeft}/2 Today
              </div>
            </div>
          </div>

          {/* Shared 500M Boss HP Bar */}
          <div className="mt-2.5">
            <div className="flex justify-between text-[10px] font-extrabold text-stone-300 mb-1">
              <span>SHARED SYNDICATE HP</span>
              <span className="font-display text-amber-400">
                {fmtUsd(bossHp)} / {fmtUsd(maxHp)} ({hpPercent}%)
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full border border-amber-500/30 bg-black/80">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[9.5px] text-stone-400">
            <span>Weekly Reset: Sunday 00:00 UTC</span>
            <span className="text-emerald-400 font-bold">
              Your Contribution: {fmtUsd(meta.syndicateHeistPersonalDamage ?? 0)}
            </span>
          </div>
        </div>

        {/* 3 Sub-Tabs inside Modal */}
        <div className="grid grid-cols-3 gap-1 border-b border-[#E2D5C1] bg-[#F3E9D8] p-1 text-center font-display text-[11px] font-black">
          <button
            type="button"
            onClick={() => setSubTab('raid')}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 transition ${
              subTab === 'raid'
                ? 'border-2 border-[#3E2723] bg-[#FFFDF9] text-[#2C1810] shadow-xs'
                : 'text-[#6E5A4F] hover:bg-white/50'
            }`}
          >
            <Swords className="h-3.5 w-3.5 text-amber-600" />
            <span>60s Blitz</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('leaderboard')}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 transition ${
              subTab === 'leaderboard'
                ? 'border-2 border-[#3E2723] bg-[#FFFDF9] text-[#2C1810] shadow-xs'
                : 'text-[#6E5A4F] hover:bg-white/50'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-600" />
            <span>Roster Rank</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('vault')}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 transition ${
              subTab === 'vault'
                ? 'border-2 border-[#3E2723] bg-[#FFFDF9] text-[#2C1810] shadow-xs'
                : 'text-[#6E5A4F] hover:bg-white/50'
            }`}
          >
            <Crown className="h-3.5 w-3.5 text-amber-600" />
            <span>Vault Chests</span>
          </button>
        </div>

        {/* Tab 1: 60-Second Blitz Auto-Battle View */}
        {subTab === 'raid' && (
          <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
            {!isRaiding && !raidFinishedSummary ? (
              <div className="flex flex-col gap-3 my-auto text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-[3px] border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-4xl shadow-md">
                  💰
                </div>

                <div>
                  <h4 className="font-display text-base font-black text-[#2C1810]">
                    60-SECOND LIQUIDITY POOL HEIST
                  </h4>
                  <p className="text-xs font-semibold text-[#6E5A4F] mt-1 max-w-xs mx-auto">
                    Deploy your full 4-coin portfolio and cybernetic mining rig for 60 seconds of unbridled damage against the Central Clearing House vault!
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-[#E2D5C1] bg-[#F3E9D8] p-3 text-left space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-[#6E5A4F]">
                    <span>Combat Duration:</span>
                    <span className="font-display font-black text-[#2C1810]">60.0 Seconds Blitz</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#6E5A4F]">
                    <span>Equipped Hero:</span>
                    <span className="font-display font-black text-[#2C1810]">
                      {meta.equippedHeroId.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[#6E5A4F]">
                    <span>Mining Rig Power:</span>
                    <span className="font-display font-black text-amber-700">
                      ⚡ {meta.getEquippedRigStats?.().totalPowerScore ?? 2500} Power Rating
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={attemptsLeft <= 0 || isBossDefeated}
                  onClick={handleStartHeistBlitz}
                  className={`btn-3d-gold flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-black uppercase text-white shadow-lg transition active:scale-95 ${
                    attemptsLeft <= 0 || isBossDefeated ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>
                    {isBossDefeated
                      ? 'BOSS LIQUIDATED! CHECK VAULT'
                      : attemptsLeft > 0
                      ? 'COMMENCE 60S HEIST BLITZ'
                      : 'NO ATTEMPTS LEFT TODAY'}
                  </span>
                </button>
              </div>
            ) : isRaiding ? (
              /* Active In-Battle Blitz Arena */
              <div className="flex flex-1 flex-col justify-between py-2">
                {/* Timer & Live Damage Header */}
                <div className="flex items-center justify-between rounded-2xl border-2 border-[#3E2723] bg-[#FFFDF9] p-3 shadow-md">
                  <div>
                    <div className="text-[10px] font-black uppercase text-[#6E5A4F]">BLITZ CLOCK</div>
                    <div className="font-display text-2xl font-black text-amber-600">
                      ⏱️ {blitzTimer.toFixed(1)}s
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-[#6E5A4F]">TOTAL HEIST DAMAGE</div>
                    <div className="font-display text-xl font-black text-emerald-600">
                      {fmtUsd(sessionDamage)}
                    </div>
                    <div className="text-[9px] font-bold text-[#0284c7]">
                      DPS: {fmtUsd(dps)}/s
                    </div>
                  </div>
                </div>

                {/* Central Vault Hacking Animation */}
                <div className="my-auto text-center space-y-2">
                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-amber-500 bg-black/90 shadow-[0_0_24px_rgba(245,158,11,0.7)] animate-pulse">
                    <span className="text-5xl">🏛️</span>
                    <div className="absolute -top-2 -right-2 rounded-full bg-red-600 px-2 py-0.5 text-[8.5px] font-black text-white">
                      BREACHING
                    </div>
                  </div>

                  <div className="font-display text-sm font-black text-[#2C1810]">
                    SIPHONING CLEARING HOUSE VAULTS...
                  </div>
                  <p className="text-[10px] font-semibold text-[#6E5A4F]">
                    All 4 wallet coins firing continuous orderbook pumps!
                  </p>
                </div>

                {/* Live Console Output */}
                <div className="rounded-xl border border-[#E2D5C1] bg-black/90 p-2.5 font-mono text-[9px] text-emerald-400 space-y-1">
                  <div>&gt; TARGET: CENTRAL CLEARING HOUSE ($500M POOL)</div>
                  <div>&gt; CURRENT PUMP MAGNITUDE: +{fmtNum(sessionDamage)} LIQUIDATED</div>
                  <div>&gt; TIME REMAINING: {blitzTimer.toFixed(1)}s</div>
                  {heistLog.map((log, i) => (
                    <div key={i} className="text-amber-300">&gt; {log}</div>
                  ))}
                </div>
              </div>
            ) : (
              /* Post-Raid Summary Screen */
              raidFinishedSummary && (
                <div className="my-auto text-center space-y-3">
                  <div className="text-4xl animate-bounce">🏆</div>
                  <h4 className="font-display text-base font-black text-[#2C1810]">
                    HEIST BLITZ COMPLETE!
                  </h4>
                  <p className="text-xs font-semibold text-[#6E5A4F]">
                    Your trade algorithms successfully chipped the Clearing House!
                  </p>

                  <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-3.5 space-y-2">
                    <div className="text-[10px] font-black uppercase text-emerald-800">
                      DAMAGE DEALT TO CLEARING HOUSE
                    </div>
                    <div className="font-display text-2xl font-black text-emerald-600">
                      +{fmtUsd(raidFinishedSummary.damageDealt)}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700">
                      New Clearing House Remaining HP: {fmtUsd(raidFinishedSummary.newBossHp)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRaidFinishedSummary(null)
                      setSubTab('leaderboard')
                    }}
                    className="w-full btn-3d-green py-3 rounded-2xl font-display text-xs font-black uppercase text-white shadow"
                  >
                    VIEW LEADERBOARD &amp; VAULT
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* Tab 2: Syndicate Roster Contribution Leaderboard */}
        {subTab === 'leaderboard' && (
          <div className="flex flex-1 flex-col overflow-y-auto p-3.5">
            <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2 mb-2">
              <span className="font-display text-xs font-black uppercase text-[#2C1810]">
                Syndicate Roster Damage
              </span>
              <span className="text-[10px] font-bold text-[#6E5A4F]">30 Active Traders</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto pr-1">
              {meta.syndicateHeistLeaderboard.map((member) => {
                const isYou = member.isPlayer || member.id === 'player_you'
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between rounded-2xl border p-2.5 transition ${
                      isYou
                        ? 'border-2 border-amber-500 bg-amber-50/90 shadow-sm'
                        : 'border-[#E2D5C1] bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-xl font-display text-xs font-black ${
                          member.rank === 1
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : member.rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : member.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {member.rank}
                      </div>

                      <div>
                        <div className="font-display text-xs font-black text-[#2C1810]">
                          {member.name} {isYou && '⭐ (YOU)'}
                        </div>
                        <div className="text-[9.5px] font-semibold text-[#6E5A4F]">
                          {((member.damage / maxHp) * 100).toFixed(1)}% of $500M Pool
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-display text-xs font-black text-emerald-600">
                        {fmtUsd(member.damage)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Syndicate Vault Milestones */}
        {subTab === 'vault' && (
          <div className="flex flex-1 flex-col overflow-y-auto p-3.5 space-y-2.5">
            <div className="border-b border-[#E2D5C1] pb-2">
              <span className="font-display text-xs font-black uppercase text-[#2C1810]">
                Syndicate Vault Milestones
              </span>
              <p className="text-[10px] font-semibold text-[#6E5A4F]">
                Chip down the $500M Clearing House HP to unlock collective treasure chests!
              </p>
            </div>

            {[
              { hp: 400000000, label: 'Stage 1 Breach: $400M HP', rewards: '🏆 200 Honor Badges • 🧵 50 Solder Wire' },
              { hp: 300000000, label: 'Stage 2 Infiltration: $300M HP', rewards: '🏆 350 Honor Badges • 💎 500 Gems' },
              { hp: 200000000, label: 'Stage 3 Liquidation: $200M HP', rewards: '🏆 500 Honor Badges • 🧵 100 Solder Wire' },
              { hp: 100000000, label: 'Stage 4 Meltdown: $100M HP', rewards: '🏆 750 Honor Badges • 5 Hero Fragments' },
              { hp: 0, label: 'FULL CLEAR: Clearing House Liquidated!', rewards: '👑 Syndicate Vault Opened! 5 Mythical Shards • 1,000 Gems' },
            ].map((milestone) => {
              const isUnlocked = bossHp <= milestone.hp
              const isClaimed = meta.syndicateHeistClaimedMilestones.includes(milestone.hp)

              return (
                <div
                  key={milestone.hp}
                  className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                    isClaimed
                      ? 'border-emerald-300 bg-emerald-50/70'
                      : isUnlocked
                      ? 'border-amber-500 bg-amber-50 shadow-sm'
                      : 'border-[#E2D5C1] bg-[#F7F3EB]/60 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{isUnlocked ? '🔓' : '🔒'}</span>
                      <span className="font-display text-xs font-black text-[#2C1810]">
                        {milestone.label}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold text-[#6E5A4F] mt-0.5">
                      {milestone.rewards}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isUnlocked || isClaimed}
                    onClick={() => {
                      AudioSynth.unlock()
                      AudioSynth.playChestOpen()
                      AudioHaptics.vibrateCounterPump()
                      meta.claimSyndicateHeistMilestone(milestone.hp)
                    }}
                    className={`rounded-xl px-3 py-1.5 font-display text-[11px] font-black uppercase transition active:scale-95 ${
                      isClaimed
                        ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                        : isUnlocked
                        ? 'btn-3d-green text-white shadow'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? 'CLAIMED' : isUnlocked ? 'CLAIM' : 'LOCKED'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
