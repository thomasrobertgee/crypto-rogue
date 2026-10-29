import { useState, useEffect } from 'react'
import { CENTRAL_BANK_LEVIATHAN, WORLD_BOSS_REWARDS } from '../../config/worldBoss.config'
import { useMetaStore } from '../../state/useMetaStore'
import { AudioSynth } from '../../engine/AudioSynth'
import { fmtUsd } from '../../engine/format'

interface WorldBossModalProps {
  onClose: () => void
}

export function WorldBossModal({ onClose }: WorldBossModalProps) {
  const meta = useMetaStore()
  const [inBattle, setInBattle] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [currentDps, setCurrentDps] = useState(0)
  const [totalDamageDealt, setTotalDamageDealt] = useState(0)
  const [battleFinished, setBattleFinished] = useState(false)
  const [battleReward, setBattleReward] = useState<{
    rankPct: number
    keysWon: number
    skinFragmentsWon: number
    gemsWon: number
  } | null>(null)

  useEffect(() => {
    meta.syncWorldBossDaily()
  }, [])

  // 60-second real-time DPS gauntlet against the $100B Leviathan HP bar
  useEffect(() => {
    if (!inBattle || battleFinished) return

    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(timer)
          setBattleFinished(true)
          setInBattle(false)
          AudioSynth.playVictory()
          const payout = meta.recordWorldBossDamage(totalDamageDealt)
          setBattleReward(payout)
          return 0
        }

        // Simulate high-volume multi-coin continuous damage ticks
        const tickDmg = Math.round(15000 + Math.random() * 45000)
        setCurrentDps(tickDmg)
        setTotalDamageDealt((prev) => prev + tickDmg)
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [inBattle, battleFinished, totalDamageDealt])

  const attemptsLeft = meta.worldBossAttemptsLeft ?? 2

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border-[3.5px] border-[#3E2723] border-b-[7px] bg-[#1a1423] text-white shadow-2xl max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-white/10 bg-gradient-to-r from-[#831843] via-[#9d174d] to-[#be123c] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-amber-300 bg-amber-400/20 text-2xl shadow">
              🏦
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-black text-white">
                  CENTRAL BANK LEVIATHAN
                </span>
                <span className="rounded-full bg-amber-400 px-2 py-0.2 font-display text-[9px] font-black text-stone-900">
                  WORLD BOSS
                </span>
              </div>
              <p className="text-[10px] font-semibold text-rose-200">
                $100 Billion Shared Server Liquidity Gauntlet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 font-black text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Server Shared Health Pool Bar */}
          <div className="rounded-2xl border border-white/15 bg-black/40 p-3">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-amber-400 font-display">SERVER LIQUIDITY BAR</span>
              <span className="text-white">$78.4B / $100.0B HP (78.4%)</span>
            </div>
            <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full border border-white/20 bg-black/60">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: '78.4%' }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-300">
              <span>Rotates in: <strong>4h 18m</strong></span>
              <span>Daily Attempts: <strong className="text-amber-300">{attemptsLeft}/2</strong></span>
            </div>
          </div>

          {/* Active Gauntlet Simulation Box */}
          {inBattle && (
            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-stone-900 to-black p-4 text-center">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-black text-amber-400">
                  ⚔️ 60s BURST GAUNTLET ACTIVE
                </span>
                <span className="rounded-full bg-red-600/30 px-2.5 py-0.5 font-display text-xs font-black text-red-300 animate-pulse">
                  ⏳ {timeRemaining}s
                </span>
              </div>
              <div className="my-4">
                <div className="font-display text-2xl font-black text-emerald-400">
                  {fmtUsd(totalDamageDealt)}
                </div>
                <div className="text-[10px] font-extrabold text-slate-400 mt-0.5">
                  CURRENT DPS: +{fmtUsd(currentDps)}/s
                </div>
              </div>
            </div>
          )}

          {/* Finished Gauntlet Payout Modal */}
          {battleFinished && battleReward && (
            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-950/40 p-4 text-center">
              <div className="text-3xl animate-bounce">🏆</div>
              <h3 className="font-display text-base font-black text-emerald-400 mt-1">
                GAUNTLET COMPLETED!
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Total Output: <strong>{fmtUsd(totalDamageDealt)}</strong> • Estimated Server Rank: <strong>Top {battleReward.rankPct}%</strong>
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-black/40 p-2 text-[10px] font-black">
                <div className="text-cyan-300">+{battleReward.keysWon} Quantum Keys</div>
                <div className="text-amber-300">+{battleReward.skinFragmentsWon} Skin Frags</div>
                <div className="text-emerald-300">+{battleReward.gemsWon} Gems</div>
              </div>
            </div>
          )}

          {/* Active Boss Affixes */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-2">
            <span className="font-display text-[11px] font-black uppercase tracking-wider text-rose-300">
              ⚠️ ACTIVE FINANCIAL AFFIXES
            </span>
            {CENTRAL_BANK_LEVIATHAN.affixes.map((affix) => (
              <div key={affix.id} className="rounded-xl border border-white/10 bg-white/5 p-2">
                <div className="font-display text-[10px] font-black text-amber-300">
                  {affix.name}
                </div>
                <div className="text-[9.5px] font-semibold text-slate-300">
                  {affix.description}
                </div>
              </div>
            ))}
          </div>

          {/* Server Percentile Reward Ladder */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-2">
            <span className="font-display text-[11px] font-black uppercase tracking-wider text-amber-300">
              🏅 SERVER PERCENTILE PAYOUTS
            </span>
            <div className="space-y-1.5">
              {WORLD_BOSS_REWARDS.map((rew) => (
                <div
                  key={rew.percentile}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px]"
                >
                  <span className="font-display font-black text-white">{rew.percentile}</span>
                  <span className="font-semibold text-slate-300">{rew.title}</span>
                  <span className="font-black text-cyan-300">
                    +{rew.quantumKeys} 🔑 • +{rew.skinFragments} 🧩 • +{rew.gems} 💎
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {!inBattle && !battleFinished && (
          <div className="border-t border-white/10 bg-[#281b3b] p-3">
            <button
              type="button"
              disabled={attemptsLeft <= 0}
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playBossAlarm()
                setInBattle(true)
                setTimeRemaining(60)
                setTotalDamageDealt(0)
              }}
              className={`w-full rounded-2xl py-3.5 font-display text-xs font-black uppercase tracking-wider text-white ${
                attemptsLeft > 0
                  ? 'btn-3d-red active:translate-y-0.5'
                  : 'bg-stone-700 opacity-60 cursor-not-allowed'
              }`}
            >
              {attemptsLeft > 0 ? 'ENTER 60s BURST GAUNTLET' : 'NO ATTEMPTS LEFT TODAY'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
