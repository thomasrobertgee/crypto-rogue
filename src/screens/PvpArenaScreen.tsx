import { useState, useEffect } from 'react'
import {
  Shield,
  ChevronRight,
} from 'lucide-react'
import { useMetaStore } from '../state/useMetaStore'
import {
  getPvpTier,
  MOCK_PVP_DEFENDERS,
  type PvpOpponentSnapshot,
} from '../config/pvpArena.config'
import { HERO_MAP } from '../config/heroes.config'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtUsd } from '../engine/format'

interface PvpArenaScreenProps {
  onBack?: () => void
}

export function PvpArenaScreen({ onBack: _onBack }: PvpArenaScreenProps) {
  const meta = useMetaStore()
  const [selectedOpponent, setSelectedOpponent] = useState<PvpOpponentSnapshot | null>(null)
  const [activeDuel, setActiveDuel] = useState<{
    inProgress: boolean
    playerMarginHp: number
    opponentMarginHp: number
    playerCash: number
    opponentCash: number
    timeRemaining: number
    winner: 'player' | 'opponent' | null
    playerLog: Array<{ outcome: 'up' | 'down'; amount: number }>
    opponentLog: Array<{ outcome: 'up' | 'down'; amount: number }>
  } | null>(null)

  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    meta.syncPvpDailyTickets()
  }, [])

  const currentTier = getPvpTier(meta.pvpRating ?? 1200)

  // Start Duel simulation
  const handleStartDuel = (opp: PvpOpponentSnapshot) => {
    if ((meta.pvpTickets ?? 0) <= 0) {
      showToast('⚠️ No Arena Tickets left today! Reset daily.')
      return
    }
    if (!meta.spendPvpTicket()) return

    AudioSynth.unlock()
    AudioSynth.playBossAlarm()
    setSelectedOpponent(opp)

    setActiveDuel({
      inProgress: true,
      playerMarginHp: 100,
      opponentMarginHp: 100,
      playerCash: 1000,
      opponentCash: 1000,
      timeRemaining: 15, // 15-second high speed duel tick loop
      winner: null,
      playerLog: [],
      opponentLog: [],
    })
  }

  // Real-time asynchronous tick loop for split-screen duel
  useEffect(() => {
    if (!activeDuel || !activeDuel.inProgress || activeDuel.winner) return

    const interval = setInterval(() => {
      setActiveDuel((prev) => {
        if (!prev || !prev.inProgress) return prev

        const nextTime = Math.max(0, prev.timeRemaining - 1)

        // Player Coin Roll
        const playerRollsUp = Math.random() < 0.62
        const playerDelta = Math.round(150 + Math.random() * 250)
        let nextOppHp = prev.opponentMarginHp
        let nextPlayerCash = prev.playerCash
        if (playerRollsUp) {
          nextOppHp = Math.max(0, nextOppHp - Math.round(playerDelta * 0.12))
          nextPlayerCash += playerDelta
        }

        // Opponent Coin Roll
        const oppRollsUp = Math.random() < 0.58
        const oppDelta = Math.round(140 + Math.random() * 240)
        let nextPlayerHp = prev.playerMarginHp
        let nextOppCash = prev.opponentCash
        if (oppRollsUp) {
          nextPlayerHp = Math.max(0, nextPlayerHp - Math.round(oppDelta * 0.11))
          nextOppCash += oppDelta
        }

        let winner: 'player' | 'opponent' | null = null
        if (nextOppHp <= 0) {
          winner = 'player'
        } else if (nextPlayerHp <= 0) {
          winner = 'opponent'
        } else if (nextTime <= 0) {
          winner = nextOppHp < nextPlayerHp ? 'player' : 'opponent'
        }

        if (winner === 'player') {
          AudioSynth.playVictory()
          meta.recordPvpMatchResult(true, 30)
        } else if (winner === 'opponent') {
          AudioSynth.playMarginCall()
          meta.recordPvpMatchResult(false, 20)
        }

        const playerRollOutcome: 'up' | 'down' = playerRollsUp ? 'up' : 'down'
        const oppRollOutcome: 'up' | 'down' = oppRollsUp ? 'up' : 'down'

        return {
          ...prev,
          playerMarginHp: nextPlayerHp,
          opponentMarginHp: nextOppHp,
          playerCash: nextPlayerCash,
          opponentCash: nextOppCash,
          timeRemaining: nextTime,
          winner,
          playerLog: [{ outcome: playerRollOutcome, amount: playerDelta }, ...prev.playerLog].slice(0, 6),
          opponentLog: [{ outcome: oppRollOutcome, amount: oppDelta }, ...prev.opponentLog].slice(0, 6),
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeDuel?.inProgress, activeDuel?.winner])

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3.5 py-2.5 pb-24 text-[#2C1810]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-14 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-[#3E2723] bg-[#fde047] px-4 py-1.5 font-display text-xs font-black text-[#2C1810] shadow-xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-3 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#fde047] bg-[#fde047]/20 text-2xl shadow">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-black tracking-wide text-white">
                  HOSTILE TAKEOVER
                </span>
                <span className="rounded-full bg-[#fde047] px-2 py-0.2 font-display text-[9px] font-black text-[#1e1b4b]">
                  PVP ARENA
                </span>
              </div>
              <p className="text-[10px] font-semibold text-indigo-200">
                Asynchronous duels against rival trader orderbooks!
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="rounded-full border border-amber-300 bg-amber-400/20 px-2.5 py-0.5 font-display text-xs font-black text-amber-300">
              🎟️ {meta.pvpTickets ?? 5}/5 Daily
            </span>
            <span className="mt-0.5 text-[9px] font-bold text-indigo-200">
              Rating: {meta.pvpRating ?? 1200}
            </span>
          </div>
        </div>

        {/* Current League Tier Ribbon */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/20 bg-black/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentTier.badge}</span>
            <div>
              <div className="font-display text-xs font-black text-[#fde047]">
                {currentTier.name}
              </div>
              <div className="text-[9.5px] font-semibold text-slate-300">
                {currentTier.title} • {meta.pvpRating ?? 1200} MMR
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-display text-[9px] font-black uppercase text-emerald-400">
              Weekly Payout:
            </span>
            <div className="font-display text-xs font-black text-amber-300">
              +{currentTier.weeklyGemReward} 💎 &amp; Title
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Defense Manager */}
      <div className="mt-2.5 flex items-center justify-between rounded-2xl border-2 border-[#3E2723] bg-[#FFFDF9] p-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <div>
            <div className="font-display text-xs font-black text-[#2C1810]">
              DEFENSIVE SNAPSHOT
            </div>
            <div className="text-[10px] font-semibold text-[#6E5A4F]">
              {meta.pvpDefensiveSnapshot ? '✓ Active Portfolio Saved' : '⚠️ No Defense Configured!'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            AudioSynth.unlock()
            if (meta.savePvpDefensiveSnapshot()) {
              AudioSynth.playCoinInject()
              showToast('🛡️ Current Portfolio Saved as Defense Snapshot!')
            }
          }}
          className="rounded-xl border-2 border-[#3E2723] bg-[#F3E9D8] px-3 py-1.5 font-display text-[10px] font-black text-[#2C1810] active:scale-95 shadow-xs hover:bg-emerald-500 hover:text-white"
        >
          UPDATE DEFENSE
        </button>
      </div>

      {/* ACTIVE DUEL MODAL (Split-Screen Dual Chart) */}
      {activeDuel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md">
          <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border-[3.5px] border-[#3E2723] border-b-[7px] bg-[#0f172a] text-white shadow-2xl">
            {/* Duel Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#1e293b] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-black text-[#fde047]">
                  HOSTILE TAKEOVER DUEL
                </span>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-400">
                  LIVE TICK
                </span>
              </div>
              <div className="font-display text-xs font-black text-amber-300">
                ⏳ {activeDuel.timeRemaining}s LEFT
              </div>
            </div>

            {/* Split Screen Dual Box */}
            <div className="grid grid-cols-2 gap-2 p-3">
              {/* Left Column: Player Orderbook */}
              <div className="flex flex-col rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] font-black text-emerald-400 truncate">
                    YOU (TRADER)
                  </span>
                  <span className="text-[10px] font-black text-white">
                    {Math.round(activeDuel.playerMarginHp)} HP
                  </span>
                </div>
                {/* Margin Bar */}
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${activeDuel.playerMarginHp}%` }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="font-display text-sm font-black text-emerald-300">
                    {fmtUsd(activeDuel.playerCash)}
                  </span>
                </div>
                {/* Real-time Orderbook Rolls */}
                <div className="mt-2 space-y-1">
                  {activeDuel.playerLog.map((log, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between text-[9px] font-bold ${
                        log.outcome === 'up' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <span>{log.outcome === 'up' ? '🟢 GREEN' : '🔴 RED'}</span>
                      <span>+{fmtUsd(log.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Opponent Orderbook */}
              <div className="flex flex-col rounded-2xl border border-rose-500/40 bg-rose-950/20 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] font-black text-rose-400 truncate">
                    {selectedOpponent?.name ?? 'RIVAL TRADER'}
                  </span>
                  <span className="text-[10px] font-black text-white">
                    {Math.round(activeDuel.opponentMarginHp)} HP
                  </span>
                </div>
                {/* Margin Bar */}
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${activeDuel.opponentMarginHp}%` }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="font-display text-sm font-black text-rose-300">
                    {fmtUsd(activeDuel.opponentCash)}
                  </span>
                </div>
                {/* Real-time Orderbook Rolls */}
                <div className="mt-2 space-y-1">
                  {activeDuel.opponentLog.map((log, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between text-[9px] font-bold ${
                        log.outcome === 'up' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <span>{log.outcome === 'up' ? '🟢 GREEN' : '🔴 RED'}</span>
                      <span>+{fmtUsd(log.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Winner Overlay Banner */}
            {activeDuel.winner && (
              <div className="flex flex-col items-center border-t border-white/10 bg-black/60 p-4 text-center">
                <div className="text-3xl animate-bounce">
                  {activeDuel.winner === 'player' ? '🏆' : '💀'}
                </div>
                <h3 className={`font-display text-base font-black ${
                  activeDuel.winner === 'player' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {activeDuel.winner === 'player' ? 'TAKEOVER VICTORY!' : 'MARGIN LIQUIDATED!'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {activeDuel.winner === 'player' ? '+30 Rating MMR & +40 Satoshi Gems!' : '-20 Rating MMR'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveDuel(null)}
                  className="mt-3 rounded-2xl py-2 px-6 font-display text-xs font-black uppercase tracking-wider text-white btn-3d-green"
                >
                  RETURN TO ARENA
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Opponent Selection List */}
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-xs font-black uppercase tracking-wider text-[#2C1810]">
            🎯 TARGET DEFENDERS
          </span>
          <span className="text-[10px] font-bold text-[#6E5A4F]">
            1 Ticket / Match
          </span>
        </div>

        <div className="space-y-2">
          {MOCK_PVP_DEFENDERS.map((opp) => (
            <div
              key={opp.id}
              className="flex items-center justify-between rounded-2xl border-2 border-[#3E2723] bg-[#FFFDF9] p-3 shadow-sm hover:border-indigo-600 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-2xl shadow-inner">
                  {opp.avatarEmoji}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-xs font-black text-[#2C1810] truncate">
                      {opp.name}
                    </span>
                    <span className="rounded bg-indigo-100 px-1 text-[8px] font-bold text-indigo-800">
                      {opp.rating} MMR
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-[#6E5A4F]">
                    <span>Hero: {HERO_MAP[opp.heroId as keyof typeof HERO_MAP]?.name ?? opp.heroId}</span>
                    <span>•</span>
                    <span>Power: {opp.powerScore}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStartDuel(opp)}
                className="flex items-center gap-1 rounded-xl py-2 px-3 font-display text-xs font-black uppercase text-white btn-3d-amber active:scale-95 shadow-sm"
              >
                <span>DUEL</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
