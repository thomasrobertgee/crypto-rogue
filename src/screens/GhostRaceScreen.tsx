import React, { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import { useMetaStore, type GhostRacerProfile } from '../state/useMetaStore'
import { AudioSynth } from '../engine/AudioSynth'
import { AudioHaptics } from '../utils/audioHaptics'
import { fmtNum } from '../engine/format'

interface GhostRaceScreenProps {
  onBack?: () => void
}

const SPEED_RUN_NODES = [
  { id: 1, name: 'Scalper Bot', type: 'minion', hp: 2200, icon: '🤖' },
  { id: 2, name: 'Liquidity Pool', type: 'elite', hp: 4800, icon: '🌊' },
  { id: 3, name: 'Flash Crash', type: 'hazard', hp: 8500, icon: '⚡' },
  { id: 4, name: 'Arbitrage Whale', type: 'elite', hp: 16000, icon: '🐋' },
  { id: 5, name: 'Central Exchange Boss', type: 'boss', hp: 32000, icon: '🏛️' },
]

export const GhostRaceScreen: React.FC<GhostRaceScreenProps> = ({ onBack }) => {
  const meta = useMetaStore()
  const [selectedGhost, setSelectedGhost] = useState<GhostRacerProfile | null>(null)
  const [isRacing, setIsRacing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Live Dual Split-Screen Race State
  const [playerCurrentNode, setPlayerCurrentNode] = useState(0)
  const [playerNodeHp, setPlayerNodeHp] = useState(SPEED_RUN_NODES[0].hp)
  const [playerElapsed, setPlayerElapsed] = useState(0)

  const [ghostCurrentNode, setGhostCurrentNode] = useState(0)
  const [ghostNodeHp, setGhostNodeHp] = useState(SPEED_RUN_NODES[0].hp)
  const [ghostElapsed, setGhostElapsed] = useState(0)

  const [raceWinner, setRaceWinner] = useState<'player' | 'ghost' | null>(null)
  const [raceSummary, setRaceSummary] = useState<{
    trophiesDelta: number
    hashrateWon: number
    playerTime: number
    ghostTime: number
  } | null>(null)

  useEffect(() => {
    meta.syncRaceTicketsDaily()
  }, [])

  const startRaceCountdown = (ghost: GhostRacerProfile) => {
    if ((meta.raceTickets ?? 3) <= 0) return

    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    AudioHaptics.vibrateCounterPump()

    setSelectedGhost(ghost)
    meta.spendRaceTicket()

    // Reset race parameters
    setPlayerCurrentNode(0)
    setPlayerNodeHp(SPEED_RUN_NODES[0].hp)
    setPlayerElapsed(0)

    setGhostCurrentNode(0)
    setGhostNodeHp(SPEED_RUN_NODES[0].hp)
    setGhostElapsed(0)

    setRaceWinner(null)
    setRaceSummary(null)

    // Countdown: 3, 2, 1, PUMP!
    setCountdown(3)
    let cd = 3
    const cdInterval = window.setInterval(() => {
      cd -= 1
      if (cd > 0) {
        setCountdown(cd)
        AudioHaptics.playCoinTick()
      } else if (cd === 0) {
        setCountdown(0) // "PUMP!"
        AudioSynth.playChestOpen()
        AudioHaptics.vibrateCounterPump()
      } else {
        window.clearInterval(cdInterval)
        setCountdown(null)
        setIsRacing(true)
      }
    }, 600)
  }

  // Dual Simultaneous Race Engine Loop
  useEffect(() => {
    if (!isRacing || !selectedGhost) return

    const rigStats = meta.getEquippedRigStats?.() ?? { flatAtk: 0, greenDamagePct: 0, tickSpeedPct: 0 }
    const playerTickInterval = Math.max(0.2, 0.45 * (1 - Math.min(0.5, (rigStats.tickSpeedPct ?? 0) / 100)))

    // Ghost damage rate calibrated to their record clear time
    // Total 5-node HP = 2200 + 4800 + 8500 + 16000 + 32000 = 63,500 HP
    const totalRaceHp = SPEED_RUN_NODES.reduce((a, b) => a + b.hp, 0)
    const ghostDps = totalRaceHp / Math.max(8, selectedGhost.clearTimeSeconds)

    const interval = window.setInterval(() => {
      // 1. Advance Player's Auto-Battler
      setPlayerElapsed((t) => t + 0.1)
      const playerBaseDmg = (380 + (rigStats.flatAtk ?? 0) * 3) * (1 + (rigStats.greenDamagePct ?? 0) / 100)
      const playerTickDmg = Math.round((playerBaseDmg / (playerTickInterval * 2)) * (0.8 + Math.random() * 0.4))

      setPlayerNodeHp((curHp) => {
        const next = curHp - playerTickDmg
        if (next <= 0) {
          setPlayerCurrentNode((curNode) => {
            const nextNode = curNode + 1
            if (nextNode >= SPEED_RUN_NODES.length) {
              // PLAYER REACHED FINISH LINE FIRST!
              handleRaceFinish('player')
              return curNode
            }
            setPlayerNodeHp(SPEED_RUN_NODES[nextNode].hp)
            AudioHaptics.playCoinTick()
            return nextNode
          })
          return 0
        }
        return next
      })

      // 2. Advance Ghost Replay Auto-Battler
      setGhostElapsed((t) => t + 0.1)
      const ghostTickDmg = Math.round(ghostDps * 0.1 * (0.88 + Math.random() * 0.24))

      setGhostNodeHp((curHp) => {
        const next = curHp - ghostTickDmg
        if (next <= 0) {
          setGhostCurrentNode((curNode) => {
            const nextNode = curNode + 1
            if (nextNode >= SPEED_RUN_NODES.length) {
              // GHOST REACHED FINISH LINE FIRST!
              handleRaceFinish('ghost')
              return curNode
            }
            setGhostNodeHp(SPEED_RUN_NODES[nextNode].hp)
            return nextNode
          })
          return 0
        }
        return next
      })
    }, 100)

    return () => window.clearInterval(interval)
  }, [isRacing, selectedGhost, meta])

  const handleRaceFinish = (winner: 'player' | 'ghost') => {
    setIsRacing(false)
    setRaceWinner(winner)

    const won = winner === 'player'
    const deltaTrophies = won ? 35 : -10
    const hashrateStolen = won ? (selectedGhost?.hashratePool ?? 4500) : 0

    if (won) {
      AudioHaptics.playVictoryJingle()
      AudioHaptics.vibrateCounterPump()
    } else {
      AudioHaptics.playDefeatSound()
    }

    meta.recordRaceResult(won, deltaTrophies, hashrateStolen, playerElapsed)

    setRaceSummary({
      trophiesDelta: deltaTrophies,
      hashrateWon: hashrateStolen,
      playerTime: Math.round(playerElapsed * 10) / 10,
      ghostTime: Math.round(ghostElapsed * 10) / 10,
    })
  }

  const raceTickets = meta.raceTickets ?? 3
  const trophies = meta.raceTrophies ?? 1000

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden arcade-screen-bg p-3 select-none">
      {/* ── Top Header Bar ── */}
      <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#78350f] bg-[#FFFBEB] text-[#78350f] hover:bg-[#FDE68A]"
              >
                ✕
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#78350f] bg-[#f59e0b] text-xl shadow-xs">
              🏎️
            </div>
            <div>
              <h2 className="font-display text-xs font-black uppercase text-[#2C1810]">
                Ghost Run Speed Races
              </h2>
              <p className="text-[9.5px] font-semibold text-[#6E5A4F]">
                Asynchronous Auto-Battler 5-Node Sprints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 font-display text-[10px] font-black text-amber-900 shadow-xs">
              🏆 {trophies} Trophies
            </span>
            <span className="rounded-full bg-cyan-500 px-2.5 py-0.5 font-display text-[10px] font-black text-white shadow-xs">
              {raceTickets}/3 🎟️
            </span>
          </div>
        </div>

        {/* Player's Best Recorded Speedrun Telemetry */}
        <div className="mt-2 flex items-center justify-between rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] px-3 py-1.5 text-xs font-bold text-[#6E5A4F]">
          <span>Your Best Recorded Ghost:</span>
          <span className="font-display font-black text-[#16a34a]">
            ⏱️ {meta.ghostRunTelemetry?.clearTimeSeconds ?? 24}s ({meta.equippedHeroId.replace(/_/g, ' ')})
          </span>
        </div>
      </div>

      {/* ── Main View: Matchmaking Brackets OR Split-Screen Race ── */}
      {!isRacing && !countdown && !raceSummary ? (
        /* Matchmaking Ghost Lobby */
        <div className="flex flex-1 flex-col overflow-y-auto py-3 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="font-display text-xs font-black uppercase text-[#2C1810]">
              Select Ghost Opponent (Spend 1 🎟️)
            </span>
            <span className="text-[10px] font-bold text-[#6E5A4F]">5 Speed-Run Nodes</span>
          </div>

          {meta.topGhostRacers.map((ghost) => {
            const diffColor =
              ghost.difficulty === 'easy'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : ghost.difficulty === 'medium'
                ? 'border-sky-500 bg-sky-50 text-sky-800'
                : ghost.difficulty === 'hard'
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-900'

            return (
              <div
                key={ghost.id}
                className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3.5 shadow-md flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-2xl shadow">
                    👻
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-full border px-2 py-0.2 font-display text-[8.5px] font-black uppercase ${diffColor}`}>
                        {ghost.difficulty}
                      </span>
                      <span className="font-display text-xs font-black text-[#2C1810]">
                        {ghost.name}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-[#6E5A4F]">
                      <span>Record: ⏱️ {ghost.clearTimeSeconds}s</span>
                      <span>•</span>
                      <span>🏆 {ghost.trophies}</span>
                    </div>

                    <div className="text-[9.5px] font-bold text-[#16a34a] mt-0.5">
                      Bounty: +{fmtNum(ghost.hashratePool)} ⚡ Hashrate Stolen
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={raceTickets <= 0}
                  onClick={() => startRaceCountdown(ghost)}
                  className="btn-3d-gold flex shrink-0 items-center gap-1 rounded-2xl px-3.5 py-2.5 font-display text-xs font-black uppercase text-white shadow transition-all active:scale-95 disabled:opacity-40"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>RACE</span>
                </button>
              </div>
            )
          })}
        </div>
      ) : countdown !== null ? (
        /* Countdown Overlay */
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="font-display text-7xl font-black text-amber-500 animate-bounce">
            {countdown === 0 ? 'PUMP!' : countdown}
          </div>
          <p className="font-display text-sm font-black text-[#2C1810] mt-3 uppercase tracking-wider">
            Preparing Dual Auto-Battler Candlesticks...
          </p>
        </div>
      ) : isRacing && selectedGhost ? (
        /* ── DUAL SPLIT-SCREEN SPEED-RUN AUTO-BATTLER ── */
        <div className="flex flex-1 flex-col justify-between py-1 gap-2">
          {/* Speedway Progress Track Bar (Node 1 to Node 5) */}
          <div className="rounded-2xl border-2 border-[#3E2723] bg-[#292524] p-2.5 text-white shadow-md">
            <div className="flex items-center justify-between text-[9px] font-black uppercase text-stone-300 mb-1">
              <span>START (NODE 1)</span>
              <span className="text-amber-400">FINISH CHECKER (NODE 5) 🏁</span>
            </div>

            {/* Dual Track */}
            <div className="space-y-1.5">
              {/* Player Track */}
              <div className="relative h-4 w-full rounded-full bg-black/70 overflow-hidden border border-emerald-500/40">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150 flex items-center justify-end pr-1 text-[8px] font-black"
                  style={{ width: `${Math.max(8, ((playerCurrentNode + 1) / SPEED_RUN_NODES.length) * 100)}%` }}
                >
                  YOU
                </div>
              </div>

              {/* Ghost Track */}
              <div className="relative h-4 w-full rounded-full bg-black/70 overflow-hidden border border-cyan-500/40">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-150 flex items-center justify-end pr-1 text-[8px] font-black"
                  style={{ width: `${Math.max(8, ((ghostCurrentNode + 1) / SPEED_RUN_NODES.length) * 100)}%` }}
                >
                  GHOST
                </div>
              </div>
            </div>
          </div>

          {/* SPLIT SCREEN VIEW: TOP HALF (YOU) VS BOTTOM HALF (GHOST) */}
          <div className="grid grid-rows-2 gap-2 flex-1 min-h-0">
            {/* Top Half: Player Auto-Battler */}
            <div className="rounded-2xl border-2 border-[#16a34a] bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7] p-2.5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🦸</span>
                  <span className="font-display text-xs font-black text-emerald-950 uppercase">
                    You: {meta.playerName || 'Trader'}
                  </span>
                </div>
                <div className="font-display text-xs font-black text-emerald-700">
                  ⏱️ {playerElapsed.toFixed(1)}s • Node {playerCurrentNode + 1}/5
                </div>
              </div>

              <div className="flex items-center justify-between my-auto">
                <div>
                  <div className="text-[10px] font-bold text-emerald-800">
                    Target: {SPEED_RUN_NODES[playerCurrentNode]?.name}
                  </div>
                  <div className="font-display text-sm font-black text-[#2C1810]">
                    {fmtNum(playerNodeHp)} HP
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {SPEED_RUN_NODES.map((n, i) => (
                    <div
                      key={n.id}
                      className={`h-6 w-6 rounded-lg border flex items-center justify-center text-[10px] font-black ${
                        i < playerCurrentNode
                          ? 'border-emerald-600 bg-emerald-500 text-white'
                          : i === playerCurrentNode
                          ? 'border-amber-500 bg-amber-400 text-amber-950 animate-pulse'
                          : 'border-stone-300 bg-white/70 text-stone-400'
                      }`}
                    >
                      {i < playerCurrentNode ? '✓' : i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Half: Ghost Replay Auto-Battler */}
            <div className="rounded-2xl border-2 border-cyan-500 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] p-2.5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between border-b border-sky-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">👻</span>
                  <span className="font-display text-xs font-black text-sky-950 uppercase">
                    Ghost: {selectedGhost.name}
                  </span>
                </div>
                <div className="font-display text-xs font-black text-sky-700">
                  ⏱️ {ghostElapsed.toFixed(1)}s • Node {ghostCurrentNode + 1}/5
                </div>
              </div>

              <div className="flex items-center justify-between my-auto">
                <div>
                  <div className="text-[10px] font-bold text-sky-800">
                    Target: {SPEED_RUN_NODES[ghostCurrentNode]?.name}
                  </div>
                  <div className="font-display text-sm font-black text-[#2C1810]">
                    {fmtNum(ghostNodeHp)} HP
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {SPEED_RUN_NODES.map((n, i) => (
                    <div
                      key={n.id}
                      className={`h-6 w-6 rounded-lg border flex items-center justify-center text-[10px] font-black ${
                        i < ghostCurrentNode
                          ? 'border-cyan-600 bg-cyan-500 text-white'
                          : i === ghostCurrentNode
                          ? 'border-amber-500 bg-amber-400 text-amber-950 animate-pulse'
                          : 'border-stone-300 bg-white/70 text-stone-400'
                      }`}
                    >
                      {i < ghostCurrentNode ? '✓' : i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Post-Race Podium & Stakes Settlement */
        raceSummary && (
          <div className="my-auto text-center space-y-3 rounded-3xl border-2 border-[#3E2723] bg-[#FFFDF9] p-5 shadow-xl">
            <div className="text-5xl animate-bounce">
              {raceWinner === 'player' ? '🏆' : '💀'}
            </div>

            <h3 className="font-display text-lg font-black text-[#2C1810]">
              {raceWinner === 'player' ? 'RACE VICTORY!' : 'GHOST WON THE SPRINT!'}
            </h3>

            <p className="text-xs font-semibold text-[#6E5A4F]">
              {raceWinner === 'player'
                ? `You crossed Node 5 in ${raceSummary.playerTime}s, beating ${selectedGhost?.name} (${raceSummary.ghostTime}s)!`
                : `${selectedGhost?.name} cleared all 5 nodes first in ${raceSummary.ghostTime}s.`}
            </p>

            <div className="rounded-2xl border-2 border-[#E2D5C1] bg-[#F3E9D8] p-3 space-y-1.5 text-xs font-black">
              <div className="flex justify-between">
                <span className="text-[#6E5A4F]">Trophies:</span>
                <span className={raceWinner === 'player' ? 'text-emerald-600' : 'text-rose-600'}>
                  {raceWinner === 'player' ? `+${raceSummary.trophiesDelta}` : `${raceSummary.trophiesDelta}`} 🏆
                </span>
              </div>
              {raceWinner === 'player' && (
                <div className="flex justify-between">
                  <span className="text-[#6E5A4F]">Hashrate Stolen from Ghost Pool:</span>
                  <span className="text-amber-700">+{fmtNum(raceSummary.hashrateWon)} ⚡</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setRaceSummary(null)
                setSelectedGhost(null)
              }}
              className="w-full btn-3d-gold py-3 rounded-2xl font-display text-xs font-black uppercase text-white shadow"
            >
              RACE AGAIN / RETURN TO BRACKETS
            </button>
          </div>
        )
      )}
    </div>
  )
}
