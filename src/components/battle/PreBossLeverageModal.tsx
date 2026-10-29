import React, { useEffect, useState } from 'react'
import { Flame, Shield, Sparkles, Skull, Zap, Clock } from 'lucide-react'
import { AudioSynth } from '../../engine/AudioSynth'
import { useRunStore } from '../../state/useRunStore'
import type { EnemyConfig } from '../../types/game.types'

interface PreBossLeverageModalProps {
  bossNodeIndex: number
  enemy: EnemyConfig
  onSelect: (contract: 'standard' | 'degen') => void
}

export const PreBossLeverageModal: React.FC<PreBossLeverageModalProps> = ({
  bossNodeIndex,
  enemy,
  onSelect,
}) => {
  const setLeverageContract = useRunStore((s) => s.setLeverageContract)
  const [autoSeconds, setAutoSeconds] = useState<number>(6)

  const handleChoose = (type: 'standard' | 'degen') => {
    AudioSynth.unlock()
    if (type === 'degen') {
      AudioSynth.playBossAlarm()
    } else {
      AudioSynth.playCoinInject()
    }
    setLeverageContract(bossNodeIndex, type)
    onSelect(type)
  }

  // Auto-execute standard contract after 6 seconds so hands-free / auto-play runs don't get stalled
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleChoose('standard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [bossNodeIndex])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-[390px] rounded-3xl border-[3.5px] border-[#3E2723] border-b-[7px] bg-gradient-to-b from-[#FFFDF9] via-[#FEF3C7] to-[#FDE68A] p-4 text-[#2C1810] shadow-2xl">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#3E2723] border-b-4 bg-gradient-to-r from-[#e11d48] to-[#ea580c] px-3.5 py-1 font-display text-xs font-black uppercase tracking-wider text-white shadow-sm">
            <Flame className="w-4 h-4 text-yellow-300" />
            <span>FEAR & GREED INDEX • NODE {bossNodeIndex}</span>
          </div>
          <h2 className="mt-1.5 font-display text-lg font-black text-[#2C1810]">
            BOSS CONTRACT EXECUTION
          </h2>
          <p className="text-[11px] font-bold text-[#6E5A4F]">
            Target: <span className="text-[#be123c] uppercase">{enemy.name}</span>
          </p>
          <div className="mt-1 flex items-center gap-1 rounded-full bg-[#fef08a] px-2.5 py-0.5 text-[10px] font-black text-[#92400e] border border-[#f59e0b]">
            <Clock className="w-3 h-3 animate-spin text-[#d97706]" />
            <span>Auto-executing Standard 1x in {autoSeconds}s...</span>
          </div>
        </div>

        {/* 2 Tactile Contract Cards */}
        <div className="space-y-3">
          {/* Option 1: Standard 1x Execution */}
          <button
            type="button"
            onClick={() => handleChoose('standard')}
            className="group relative w-full rounded-2xl border-[2.5px] border-slate-600 border-b-[5px] border-b-slate-900 bg-gradient-to-b from-slate-100 to-slate-200 p-3 text-left transition-all active:translate-y-1 hover:brightness-105 shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-700 bg-white shadow">
                <Shield className="h-6 w-6 text-slate-700" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-black text-slate-800">
                    🛡️ Standard Execution (1x)
                  </span>
                  <span className="rounded-full border border-slate-500 bg-slate-300 px-2 py-0.2 font-display text-[9px] font-black text-slate-700">
                    SAFE
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-600 leading-tight">
                  Standard Boss HP & Attack damage. Normal Hashrate and In-Run XP payout upon victory.
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: 2x Degen Leverage */}
          <button
            type="button"
            onClick={() => handleChoose('degen')}
            className="group relative w-full rounded-2xl border-[3px] border-[#b45309] border-b-[6px] border-b-[#451a03] bg-gradient-to-b from-[#fffbeb] via-[#fef08a] to-[#fde047] p-3 text-left transition-all active:translate-y-1 hover:brightness-105 shadow-[0_0_20px_rgba(245,158,11,0.6)] ring-2 ring-[#f59e0b]"
          >
            <div className="flex items-start gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#ea580c] shadow">
                <Flame className="h-6 w-6 text-white" />
                <span className="absolute -top-2 -right-2 rounded-full border border-[#78350f] bg-[#e11d48] px-1 font-display text-[8px] font-black text-white shadow animate-pulse">
                  2x!
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-black text-[#451a03]">
                    🔥 2x Degen Leverage
                  </span>
                  <span className="rounded-full border border-[#78350f] bg-[#e11d48] px-2 py-0.2 font-display text-[9px] font-black text-white shadow-xs">
                    HIGH RISK
                  </span>
                </div>
                <div className="mt-1 space-y-0.5 text-[10.5px]">
                  <div className="font-bold text-[#b91c1c] flex items-center gap-1">
                    <Skull className="h-3 w-3 shrink-0" /> Boss gets +50% Max HP & +30% Attack!
                  </div>
                  <div className="font-extrabold text-[#15803d] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 shrink-0 text-amber-600" /> Defeating grants 2x Hashrate & 2x XP!
                  </div>
                  <div className="font-extrabold text-[#7e22ce] flex items-center gap-1">
                    <Zap className="h-3 w-3 shrink-0 text-[#a855f7]" /> Guaranteed Coin Shard or Hero Fragment!
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
