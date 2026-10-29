import { useMemo, useState } from 'react'
import { ShoppingBag, Check, Sparkles, Skull } from 'lucide-react'
import type { EffectSpec, RelicConfig } from '../../types/game.types'
import { BLACK_MARKET } from '../../config/combat.config'
import { RELICS } from '../../config/relics.config'
import { CURSED_RELICS } from '../../config/cursedRelics.config'
import { MAX_EQUIPPED_RELICS } from '../../config/economy.config'
import { fmtUsd } from '../../engine/format'
import { DynamicIcon } from '../DynamicIcon'
import { ModalMarginHpBar } from './ModalMarginHpBar'

interface BlackMarketModalProps {
  stageNumber: number
  totalCash: number
  marginHp: number
  maxMarginHp: number
  runRelics: string[]
  onSpendCash: (amount: number) => boolean
  onHealFraction: (fraction: number) => void
  onAddBuff: (effect: EffectSpec) => void
  onAddRunRelic: (relicId: string) => void
  onEquipCursedRelic?: (relicId: 'tornado_mixer' | '100x_degen_margin') => void
  onContinue: () => void
}

/** Clean custom illustrated SVG icons for the Black Market tactical consumables. */
function BlackMarketConsumableArt({ itemId }: { itemId: string }) {
  switch (itemId) {
    case 'patch_margin':
      return (
        <svg viewBox="0 0 36 36" className="h-7 w-7">
          <rect
            x="4"
            y="8"
            width="28"
            height="20"
            rx="5"
            fill="#dcfce7"
            stroke="#14532d"
            strokeWidth="2.2"
          />
          <path d="M13 8V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" fill="none" stroke="#14532d" strokeWidth="2.2" />
          <path
            d="M18 12v12M12 18h12"
            stroke="#16a34a"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'full_collateral':
      return (
        <svg viewBox="0 0 36 36" className="h-7 w-7">
          <path
            d="M18 3L6 8v9c0 8.2 5.1 14.8 12 16 6.9-1.2 12-7.8 12-16V8L18 3z"
            fill="#38bdf8"
            stroke="#0c4a6e"
            strokeWidth="2.2"
          />
          <path
            d="M18 11v12M12 17h12"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'insider_signal':
      return (
        <svg viewBox="0 0 36 36" className="h-7 w-7">
          <circle cx="18" cy="18" r="13" fill="#fef08a" stroke="#78350f" strokeWidth="2.2" />
          <circle cx="18" cy="18" r="7.5" fill="none" stroke="#d97706" strokeWidth="1.8" strokeDasharray="3 2" />
          <circle cx="18" cy="18" r="3" fill="#16a34a" />
          <path d="M18 18L27 10" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )
    case 'leverage_pills':
    default:
      return (
        <svg viewBox="0 0 36 36" className="h-7 w-7">
          <g transform="rotate(-35 18 18)">
            <rect
              x="10"
              y="5"
              width="16"
              height="26"
              rx="8"
              fill="#f43f5e"
              stroke="#4c0519"
              strokeWidth="2.2"
            />
            <path
              d="M10 18h16v5a8 8 0 0 1-16 0v-5z"
              fill="#fde047"
              stroke="#4c0519"
              strokeWidth="2.2"
            />
          </g>
        </svg>
      )
  }
}

export function BlackMarketModal({
  stageNumber,
  totalCash,
  marginHp,
  maxMarginHp,
  runRelics,
  onSpendCash,
  onHealFraction,
  onAddBuff,
  onAddRunRelic,
  onEquipCursedRelic,
  onContinue,
}: BlackMarketModalProps) {
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  const priceScale = 1 + (stageNumber - 1) * BLACK_MARKET.priceScalePerStage

  const relicOffers: RelicConfig[] = useMemo(() => {
    const pool = RELICS.filter((r) => !runRelics.includes(r.id))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, BLACK_MARKET.relicOffers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageNumber])

  const buyConsumable = (item: (typeof BLACK_MARKET.items)[number]) => {
    if (purchasedIds.includes(item.id)) return
    const price = Math.round(item.price * priceScale)
    if (!onSpendCash(price)) return
    if ('heal' in item && item.heal) {
      onHealFraction(item.heal)
    }
    if ('effect' in item && item.effect) {
      onAddBuff(item.effect as EffectSpec)
    }
    setPurchasedIds((p) => [...p, item.id])
  }

  const buyRelic = (relic: RelicConfig) => {
    if (purchasedIds.includes(relic.id)) return
    if (runRelics.length >= MAX_EQUIPPED_RELICS) return
    const price = Math.round(relic.shopPrice * BLACK_MARKET.relicPriceMultiplier * priceScale)
    if (!onSpendCash(price)) return
    onAddRunRelic(relic.id)
    setPurchasedIds((p) => [...p, relic.id])
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90%] w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-[#FEF3C7] text-[#B45309] shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-[10px] font-black uppercase tracking-wider text-[#B45309]">
                OTC DESK · NODE MARKET
              </span>
              <h2 className="font-display text-base font-extrabold text-[#2C1810]">
                RUN BLACK MARKET
              </h2>
            </div>
          </div>

          <div className="rounded-xl border border-[#86efac] bg-[#dcfce7] px-2.5 py-1 text-right shadow-xs">
            <div className="font-display text-[9px] font-bold uppercase text-[#166534]">Liquid Cash</div>
            <div className="font-display text-sm font-black text-[#15803d]">{fmtUsd(totalCash)}</div>
          </div>
        </div>

        {/* Live Reactive Margin HP Bar */}
        <ModalMarginHpBar currentHp={marginHp} maxHp={maxMarginHp} />

        {/* Margin & Buff Consumables (With Illustrated Icons & Matching Tactile Price Pill Bubbles) */}
        <div className="flex flex-col gap-1.5">
          <div className="font-display text-[10px] font-extrabold uppercase tracking-wider text-[#6E5A4F]">
            Tactical Injections &amp; Margin Top-ups
          </div>
          {BLACK_MARKET.items.map((item) => {
            const price = Math.round(item.price * priceScale)
            const bought = purchasedIds.includes(item.id)
            const isHeal = 'heal' in item
            const hpFull = isHeal && marginHp >= maxMarginHp
            const canBuy = !bought && !hpFull && totalCash >= price

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-2xl border-2 border-[#E2D5C1] bg-[#F3E9D8] p-2.5 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-[#FFFDF9] shadow-xs">
                    <BlackMarketConsumableArt itemId={item.id} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-xs font-extrabold text-[#2C1810]">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-semibold text-[#6E5A4F]">{item.desc}</div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={() => buyConsumable(item)}
                  className={`min-w-[76px] shrink-0 rounded-full px-3 py-1.5 font-display text-xs font-black transition ${
                    bought
                      ? 'border-2 border-[#16a34a] bg-[#dcfce7] text-[#166534]'
                      : hpFull
                        ? 'border-2 border-[#94a3b8] bg-[#e2e8f0] text-[#64748b] cursor-not-allowed opacity-80'
                        : canBuy
                          ? 'btn-3d-purple text-white game-text-outline-sm active:translate-y-0.5 shadow-sm'
                          : 'border-2 border-[#E2D5C1] bg-[#E5DEC9] text-[#8C7A6B] cursor-not-allowed'
                  }`}
                >
                  {bought ? (
                    <span className="flex items-center justify-center gap-1">
                      <Check className="h-3 w-3" /> BOUGHT
                    </span>
                  ) : hpFull ? (
                    'FULL HP'
                  ) : (
                    fmtUsd(price)
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Black Market Run Relics (Only available starting Stage 2 onwards) */}
        {stageNumber >= 2 && relicOffers.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-display text-[10px] font-extrabold uppercase tracking-wider text-[#6E5A4F]">
              <span>Bootleg Algo Relics (This Run)</span>
              <span className="text-[#7e22ce]">
                {runRelics.length}/{MAX_EQUIPPED_RELICS} Slots
              </span>
            </div>
            {relicOffers.map((relic) => {
              const price = Math.round(
                relic.shopPrice * BLACK_MARKET.relicPriceMultiplier * priceScale,
              )
              const bought = purchasedIds.includes(relic.id)
              const rackFull = runRelics.length >= MAX_EQUIPPED_RELICS
              const canBuy = !bought && !rackFull && totalCash >= price

              return (
                <div
                  key={relic.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border-2 border-[#d8b4fe] bg-[#FAF5FF] p-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#7e22ce] bg-[#F3E8FF] text-[#7e22ce] shadow-xs">
                      <DynamicIcon name={relic.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-display text-xs font-extrabold text-[#2C1810]">
                          {relic.name}
                        </span>
                        <Sparkles className="h-3 w-3 text-[#7e22ce]" />
                      </div>
                      <div className="text-[10px] font-semibold text-[#6E5A4F]">{relic.description}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canBuy}
                    onClick={() => buyRelic(relic)}
                    className={`min-w-[76px] shrink-0 rounded-full px-3 py-1.5 font-display text-xs font-black transition ${
                      bought
                        ? 'border-2 border-[#16a34a] bg-[#dcfce7] text-[#166534]'
                        : canBuy
                          ? 'btn-3d-purple text-white game-text-outline-sm active:translate-y-0.5 shadow-sm'
                          : 'border-2 border-[#E2D5C1] bg-[#E5DEC9] text-[#8C7A6B] cursor-not-allowed'
                    }`}
                  >
                    {bought ? 'EQUIPPED' : rackFull ? 'FULL' : fmtUsd(price)}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Cursed "Dark Web" Forbidden Relics (High Risk / High Reward) */}
        {stageNumber >= 2 && (
          <div className="space-y-2 border-t-2 border-purple-900/30 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-[10px] font-black uppercase tracking-wider text-purple-700 flex items-center gap-1">
                <Skull className="h-3 w-3 text-purple-600" /> CURSED "DARK WEB" RELICS
              </span>
              <span className="text-[9px] font-extrabold text-purple-600 bg-purple-100 px-1.5 py-0.2 rounded-full">
                EXTREME POWER
              </span>
            </div>
            {CURSED_RELICS.filter((c) => !runRelics.includes(c.id)).map((cursed) => {
              const price = Math.round(cursed.shopPrice * priceScale)
              const bought = purchasedIds.includes(cursed.id)
              const canBuy = !bought && totalCash >= price

              return (
                <div
                  key={cursed.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border-2 border-purple-700 bg-purple-950/10 p-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-purple-800 bg-purple-900 text-white shadow-xs text-lg">
                      {cursed.id === 'tornado_mixer' ? '🌪️' : '💀'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-display text-xs font-black text-purple-900">
                          {cursed.name}
                        </span>
                        <span className="rounded bg-purple-800 px-1 text-[8px] font-black text-amber-300">
                          CURSED
                        </span>
                      </div>
                      <div className="text-[9.5px] font-bold text-emerald-700 leading-tight">
                        ✨ {cursed.blessingDesc}
                      </div>
                      <div className="text-[9px] font-bold text-red-600 leading-tight">
                        ⚠️ {cursed.curseDesc}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canBuy}
                    onClick={() => {
                      if (!canBuy) return
                      if (onSpendCash(price)) {
                        setPurchasedIds((p) => [...p, cursed.id])
                        onAddRunRelic(cursed.id)
                        if (onEquipCursedRelic) {
                          onEquipCursedRelic(cursed.id as 'tornado_mixer' | '100x_degen_margin')
                        }
                      }
                    }}
                    className={`min-w-[76px] shrink-0 rounded-full px-3 py-1.5 font-display text-xs font-black transition ${
                      bought
                        ? 'border-2 border-purple-600 bg-purple-100 text-purple-800'
                        : canBuy
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-sm active:translate-y-0.5'
                          : 'border-2 border-[#E2D5C1] bg-[#E5DEC9] text-[#8C7A6B] cursor-not-allowed'
                    }`}
                  >
                    {bought ? 'BOUND' : fmtUsd(price)}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={onContinue}
          className="mt-1 w-full rounded-2xl py-3 font-display text-xs font-black tracking-wider text-white btn-3d-green game-text-outline-sm active:translate-y-0.5"
        >
          EXIT BLACK MARKET → NEXT NODE
        </button>
      </div>
    </div>
  )
}
