import { useRef } from 'react'
import { Lock, Info, Snowflake, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { OwnedCoin } from '../../types/game.types'
import { COIN_MAP } from '../../config/coins.config'
import type { SimCoin } from '../../engine/combat'
import { effectiveOdds } from '../../engine/combat'
import { fmtUsd } from '../../engine/format'
import { CoinMascotSvg, RARITY_CARD_THEMES } from '../GameArtwork'

interface WalletRowProps {
  unlockedSlots: number
  loadout: (OwnedCoin | null)[]
  slotAllocations: number[]
  totalPortfolio: number
  simCoins: SimCoin[] | null
  allocationMode: 'inject' | 'pull'
  isCombat: boolean
  onTapSlot: (slot: number) => void
  onInspectCoin: (owned: OwnedCoin) => void
}

const UNLOCK_STAGE_FOR_SLOT: Record<number, number> = {
  0: 1,
  1: 1, // Clear Stage 1 unlocks Slot 2
  2: 3, // Clear Stage 3 unlocks Slot 3
  3: 6, // Clear Stage 6 unlocks Slot 4
}

export function WalletRow({
  unlockedSlots,
  loadout,
  slotAllocations,
  totalPortfolio,
  simCoins,
  allocationMode,
  isCombat,
  onTapSlot,
  onInspectCoin,
}: WalletRowProps) {
  const holdTimerRef = useRef<number | null>(null)

  const startPress = (owned: OwnedCoin) => {
    holdTimerRef.current = window.setTimeout(() => {
      onInspectCoin(owned)
      holdTimerRef.current = null
    }, 450)
  }

  const endPress = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  // Dynamic flex weights: unlocked slots are wide & prominent; locked slots collapse into compact teaser cards
  const unlockedFlex =
    unlockedSlots === 1 ? 'flex-[2.4]' : unlockedSlots === 2 ? 'flex-[1.65]' : 'flex-[1.2]'
  const lockedFlex =
    unlockedSlots === 1 ? 'flex-[0.65]' : unlockedSlots === 2 ? 'flex-[0.7]' : 'flex-[0.8]'

  return (
    <div className="flex h-full w-full items-stretch gap-2 border-b-[3px] border-[#78350f] bg-[#fde68a] px-2.5 py-2">
      {[0, 1, 2, 3].map((slot) => {
        const isUnlocked = slot < unlockedSlots
        const owned = isUnlocked ? loadout[slot] ?? null : null
        const cfg = owned ? COIN_MAP[owned.coinId] : null
        const simCoin = simCoins?.find((c) => c.slot === slot) ?? null

        if (!isUnlocked) {
          const reqStage = UNLOCK_STAGE_FOR_SLOT[slot] ?? 6
          return (
            <div
              key={slot}
              className={`${lockedFlex} min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#b45309]/60 bg-[#fff6e6]/90 p-1.5 text-center shadow-xs`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#fde047] border border-[#78350f] text-[#422006]">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <span className="font-display text-[9px] font-black uppercase tracking-tight text-[#422006]">
                Slot {slot + 1}
              </span>
              <span className="rounded-full bg-[#ffedd5] border border-[#b45309] px-1.5 py-0.5 font-display text-[8px] font-black text-[#9a3412]">
                Stg {reqStage}
              </span>
            </div>
          )
        }

        if (!owned || !cfg) {
          return (
            <div
              key={slot}
              className={`${unlockedFlex} min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#78350f]/60 bg-[#fff6e6]/90 p-2 text-center`}
            >
              <span className="font-display text-xs font-black text-[#422006]">
                EMPTY WALLET
              </span>
              <span className="text-[10px] font-bold text-[#9a3412]">
                Equip a coin in Portfolio
              </span>
            </div>
          )
        }

        const cash = simCoin ? simCoin.cash : slotAllocations[slot] ?? 0
        const fillPct = Math.max(0, Math.min(100, (cash / Math.max(1, totalPortfolio)) * 100))
        const odds = simCoin ? effectiveOdds(simCoin) : effectiveOdds({ cfg })
        const tickPct = simCoin ? Math.max(0, Math.min(100, simCoin.progress * 100)) : 0
        const isFrozen = (simCoin?.frozen ?? 0) > 0
        const lastOutcome = simCoin?.lastOutcome ?? null
        const theme = RARITY_CARD_THEMES[owned.rarity]

        return (
          <div
            key={slot}
            onClick={() => onTapSlot(slot)}
            onPointerDown={() => startPress(owned)}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            className={`${unlockedFlex} min-w-0 group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-2.5 transition-all active:scale-97 ${
              theme.cardBg
            } ${theme.border} ${theme.lip} ${
              lastOutcome === 'up'
                ? 'ring-2 ring-[#22ff99] shadow-[0_0_18px_rgba(34,255,153,0.45)]'
                : lastOutcome === 'down'
                  ? 'ring-2 ring-[#fb7185]'
                  : 'shadow-lg'
            }`}
          >
            {/* Vertical Animated Liquid-Fill Gauge */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 transition-all duration-300 ease-out"
              style={{
                height: `${fillPct}%`,
                background: `linear-gradient(to top, ${cfg.color}66, ${cfg.color}18)`,
                borderTop: fillPct > 2 ? `2px solid ${cfg.color}` : 'none',
              }}
            />

            {/* Frozen Overlay */}
            {isFrozen && (
              <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-sky-950/80 backdrop-blur-[1px]">
                <Snowflake className="h-6 w-6 animate-spin text-[#38bdf8]" />
                <span className="font-display text-[10px] font-extrabold text-[#38bdf8]">
                  FROZEN {simCoin?.frozen.toFixed(1)}s
                </span>
              </div>
            )}

            {/* Top Header:Lv Badge + Coin Name + Info Button */}
            <div className="relative z-10 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <span className="rounded-lg bg-black/55 px-1.5 py-0.5 font-display text-[10px] font-extrabold text-white shadow">
                  Lv.{owned.level}
                </span>
                <span className="truncate font-display text-xs font-extrabold text-white drop-shadow">
                  {cfg.name}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onInspectCoin(owned)
                }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/45 text-white/75 hover:bg-black/70 hover:text-white"
                title="Inspect Coin"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>

            {/* Center: Mascot + Allocated $USD */}
            <div className="relative z-10 my-auto flex items-center justify-center gap-2">
              <CoinMascotSvg coin={cfg} size={unlockedSlots <= 2 ? 42 : 34} />
              <div className="flex flex-col items-start">
                <span className="font-display text-sm font-extrabold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                  {fmtUsd(cash)}
                </span>
                <span className="font-display text-[9px] font-bold text-white/80">
                  {fillPct.toFixed(0)}% TVL
                </span>
                {!isCombat && (
                  <span
                    className={`mt-0.5 rounded-full px-1.5 py-0.2 font-display text-[8px] font-extrabold shadow ${
                      allocationMode === 'inject'
                        ? 'bg-[#22ff99] text-[#062419]'
                        : 'bg-[#fb7185] text-white'
                    }`}
                  >
                    {allocationMode === 'inject' ? '+INJECT' : '-PULL'}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom: Up/Down RNG Odds Badges + Tick Cooldown Bar */}
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1 font-display text-[9px] font-extrabold">
                <span className="flex items-center rounded-md bg-black/55 px-1.5 py-0.5 text-[#22ff99]">
                  <ArrowUpRight className="h-3 w-3" />
                  {odds.up.toFixed(0)}%
                </span>
                {odds.down > 0 ? (
                  <span className="flex items-center rounded-md bg-black/55 px-1.5 py-0.5 text-[#fb7185]">
                    <ArrowDownRight className="h-3 w-3" />
                    {odds.down.toFixed(0)}%
                  </span>
                ) : (
                  <span className="rounded-md bg-black/55 px-1.5 py-0.5 text-[#fde047]">
                    {odds.flat.toFixed(0)}% FLAT
                  </span>
                )}
              </div>

              {/* Smooth Bottom Tick Cooldown Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full border border-black/60 bg-[#0b101e]">
                <div
                  className="h-full transition-all duration-75"
                  style={{
                    width: `${tickPct}%`,
                    backgroundColor: cfg.color,
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
