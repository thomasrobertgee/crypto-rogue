import { X, Sparkles, Clock, TrendingUp } from 'lucide-react'
import type { OwnedCoin } from '../../types/game.types'
import { COIN_MAP } from '../../config/coins.config'
import { coinDamageMultiplier } from '../../engine/economy'
import { DynamicIcon } from '../DynamicIcon'

interface CoinTooltipModalProps {
  owned: OwnedCoin | null
  globalYield: number
  onClose: () => void
}

export function CoinTooltipModal({ owned, globalYield, onClose }: CoinTooltipModalProps) {
  if (!owned) return null
  const cfg = COIN_MAP[owned.coinId]
  if (!cfg) return null

  const dmgMult = coinDamageMultiplier(owned)
  const masteryBonusPct = (owned.level - 1) * cfg.globalMasteryBonusPerLevel * 100

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#3E2723]"
              style={{ backgroundColor: `${cfg.color}25`, color: cfg.color }}
            >
              <DynamicIcon name={cfg.icon} className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-sm font-extrabold text-[#2C1810]">{cfg.name}</h3>
                <span className="rounded-full border border-[#d97706] bg-[#fef3c7] px-2 py-0.5 font-display text-[10px] font-extrabold uppercase text-[#92400e]">
                  {owned.rarity} · {cfg.grade}-Grade
                </span>
              </div>
              <p className="font-display text-xs font-bold text-[#6E5A4F]">
                ${cfg.ticker} · Level {owned.level}/{cfg.maxLevel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] text-[#2C1810] hover:bg-[#fde68a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2.5 italic text-xs font-semibold text-[#6E5A4F]">"{cfg.flavor}"</p>

        {/* Stats Row */}
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-2.5 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase text-[#6E5A4F]">
              <Clock className="h-2.5 w-2.5" /> Tick Speed
            </div>
            <div className="font-display text-xs font-black text-[#0284c7]">
              {cfg.baseTickSpeed}s
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase text-[#6E5A4F]">DMG Mult</div>
            <div className="font-display text-xs font-black text-[#16a34a]">
              {dmgMult.toFixed(2)}x
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase text-[#6E5A4F]">Copies</div>
            <div className="font-display text-xs font-black text-[#2C1810]">{owned.count}</div>
          </div>
        </div>

        {/* RNG Odds Breakdown */}
        <div className="mt-3 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-2.5">
          <div className="mb-1.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-[#6E5A4F]">
            Base Market RNG Table
          </div>
          <div className="flex flex-col gap-1">
            {cfg.rngTable.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between font-display text-xs">
                <span
                  className={
                    r.outcome === 'up'
                      ? 'font-extrabold text-[#16a34a]'
                      : r.outcome === 'down'
                        ? 'font-extrabold text-[#be123c]'
                        : 'font-bold text-[#6E5A4F]'
                  }
                >
                  {r.outcome.toUpperCase()} ({r.chance}%)
                </span>
                <span className="font-extrabold text-[#2C1810]">
                  {r.multiplier >= 0 ? `+${(r.multiplier * 100).toFixed(0)}%` : `${(r.multiplier * 100).toFixed(0)}%`}{' '}
                  Cash
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Passives */}
        <div className="mt-3 flex flex-col gap-1.5">
          {cfg.passives.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[#c084fc] bg-[#FAF5FF] p-2.5"
            >
              <div className="flex items-center gap-1.5 font-display text-xs font-extrabold text-[#7e22ce]">
                <Sparkles className="h-3.5 w-3.5" />
                {p.name}
                <span className="ml-auto font-display text-[9px] font-bold uppercase text-[#6E5A4F]">
                  [{p.trigger}]
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#2C1810]">{p.description}</p>
            </div>
          ))}
        </div>

        {/* Account Mastery */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#f59e0b] bg-[#FEF3C7] px-3 py-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#d97706]" />
            <div>
              <div className="font-display text-[10px] font-extrabold uppercase text-[#92400e]">
                Account Mastery Passive
              </div>
              <div className="text-[10px] font-semibold text-[#6E5A4F]">
                +{(cfg.globalMasteryBonusPerLevel * 100).toFixed(1)}% Global Yield / Level (Always Active)
              </div>
            </div>
          </div>
          <div className="text-right font-display">
            <div className="text-xs font-black text-[#b45309]">
              +{masteryBonusPct.toFixed(1)}%
            </div>
            <div className="text-[9px] font-bold text-[#6E5A4F]">
              Total: {((globalYield - 1) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
