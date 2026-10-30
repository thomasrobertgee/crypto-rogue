import { ArrowUpCircle, Flame, Sparkles, X } from 'lucide-react'
import type { CoinConfig, OwnedCoin, Rarity, PassiveHook } from '../../types/game.types'
import { RARITY_CARD_THEMES, CoinMascotSvg } from '../GameArtwork'
import { FUSION_REQUIRED_COPIES, levelUpCost } from '../../config/economy.config'
import { coinDamageMultiplier, nextRarity } from '../../engine/economy'
import { fmtNum } from '../../engine/format'

export interface CoinDetailModalProps {
  coinCfg: CoinConfig
  activeStack: OwnedCoin
  stacksForCoin: OwnedCoin[]
  isEquipped: boolean
  hashrate: number
  coinForgeUnlocked?: boolean
  onSelectStack: (stackId: string) => void
  onEquipOrUnequip: (stack: OwnedCoin) => void
  onLevelUp: (stack: OwnedCoin) => void
  onOneTapForge?: (stack: OwnedCoin) => void
  onClose: () => void
}

export function CoinDetailModal({
  coinCfg,
  activeStack,
  stacksForCoin,
  isEquipped,
  hashrate,
  coinForgeUnlocked = false,
  onSelectStack,
  onEquipOrUnequip,
  onLevelUp,
  onOneTapForge,
  onClose,
}: CoinDetailModalProps) {
  const cost = levelUpCost(activeStack.level, activeStack.rarity)
  const canLevel = activeStack.level < coinCfg.maxLevel && hashrate >= cost
  const canForgeStack =
    activeStack.count >= FUSION_REQUIRED_COPIES && nextRarity(activeStack.rarity) !== null

  return (
    <div
      data-modal="coin-detail"
      className="absolute inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[430px] flex-col gap-3 rounded-t-3xl border-t-[4px] border-[#78350f] bg-[#fff6e6] p-4 text-[#422006] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CoinMascotSvg coin={coinCfg} size={56} />
            <div>
              <h3 className="font-display text-lg font-black text-[#422006]">
                {coinCfg.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="rounded-full border border-[#78350f] bg-[#fde047] px-2 py-0.5 font-display text-[10px] font-black uppercase text-[#422006]">
                  {RARITY_CARD_THEMES[activeStack.rarity as Rarity]?.label ?? activeStack.rarity}
                </span>
                <span className="text-[#422006]">
                  Lv.{activeStack.level}/{coinCfg.maxLevel}
                </span>
                <span className="text-[#9a3412]">· {activeStack.count}/3 Copies</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-[#78350f] bg-[#ffedd5] p-1.5 text-[#422006] active:scale-95 transition-transform"
            aria-label="Close Coin Details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stack selection tabs if multiple rarities */}
        {stacksForCoin.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {stacksForCoin.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onSelectStack(st.id)}
                className={`rounded-xl border-2 px-3 py-1 font-display text-xs font-black uppercase transition-all ${
                  st.id === activeStack.id
                    ? 'border-[#78350f] bg-[#fde047] text-[#422006]'
                    : 'border-[#b45309]/40 bg-[#ffedd5] text-[#9a3412]'
                }`}
              >
                {st.rarity} (Lv.{st.level} · {st.count}/3)
              </button>
            ))}
          </div>
        )}

        {/* Stats & Passives */}
        <div className="rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] p-3 text-xs shadow-inner">
          <div className="flex justify-between font-display font-black text-[#422006]">
            <span>Speed: {coinCfg.baseTickSpeed}s</span>
            <span className="text-[#16a34a]">
              Power: {coinDamageMultiplier(activeStack).toFixed(2)}x
            </span>
            <span className="text-[#b45309]">
              Mastery: +{(coinCfg.globalMasteryBonusPerLevel * 100).toFixed(1)}%/Lv
            </span>
          </div>
          {coinCfg.passives.map((p: PassiveHook) => (
            <div key={p.id} className="mt-2 border-t border-[#b45309]/30 pt-2">
              <div className="flex items-center gap-1 font-display text-xs font-black text-[#7e22ce]">
                <Sparkles className="h-3.5 w-3.5" /> {p.name}
              </div>
              <p className="mt-0.5 text-xs font-semibold text-[#422006]">{p.description}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {canForgeStack && coinForgeUnlocked && onOneTapForge && (
            <button
              type="button"
              onClick={() => onOneTapForge(activeStack)}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-sm font-black btn-3d-gold game-text-outline animate-pulse"
            >
              <Flame className="h-4 w-4 fill-current" />
              <span>
                FORGE 3/3 → {nextRarity(activeStack.rarity)?.toUpperCase()}!
              </span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onEquipOrUnequip(activeStack)}
              className={`rounded-2xl py-3 font-display text-xs font-black game-text-outline-sm ${
                isEquipped ? 'btn-3d-red' : 'btn-3d-green'
              }`}
            >
              {isEquipped ? 'UNEQUIP WALLET' : 'EQUIP TO WALLET'}
            </button>

            <button
              type="button"
              data-tutorial="coin-level-up-btn"
              disabled={!canLevel}
              onClick={() => onLevelUp(activeStack)}
              className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black transition-all ${
                canLevel
                  ? 'btn-3d-cyan game-text-outline-sm active:translate-y-0.5'
                  : 'cursor-not-allowed border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c]'
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              {activeStack.level >= coinCfg.maxLevel
                ? 'MAX LEVEL'
                : `LEVEL UP (${fmtNum(cost)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinDetailModal
