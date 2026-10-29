import { useState } from 'react'
import { Flame, ArrowRight, Sparkles, Zap, CheckCircle2, GitFork } from 'lucide-react'
import type { OwnedCoin, Rarity } from '../types/game.types'
import { COIN_MAP } from '../config/coins.config'
import { FUSION_REQUIRED_COPIES } from '../config/economy.config'
import { coinDamageMultiplier, nextRarity, rarityIndex } from '../engine/economy'
import { AudioSynth } from '../engine/AudioSynth'
import { useMetaStore } from '../state/useMetaStore'
import {
  TopCurrencyBar,
  CoinMascotSvg,
  CoinGridCard,
  RARITY_CARD_THEMES,
} from '../components/GameArtwork'

const RARITY_PASSIVE_DESC: Record<Rarity, string> = {
  common: 'Base RNG Ledger',
  uncommon: '+30% Base Multiplier & Faster Ticks',
  rare: '+75% Base Multiplier & Enhanced Passive',
  epic: '+140% Base Multiplier & Overclocked Passive',
  legendary: '+230% Base Multiplier & Whale Tier Synergy',
  mythical: '+360% Base Multiplier & S-Grade God Passive',
}

export function FoundryMergeScreen() {
  const meta = useMetaStore()
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null)
  const [isMergingAnim, setIsMergingAnim] = useState(false)
  const [mergedResult, setMergedResult] = useState<{
    coinId: string
    newRarity: Rarity
    countFused?: number
  } | null>(null)

  const fuseReadyStacks = meta.ownedCoins.filter(
    (c) => c.count >= FUSION_REQUIRED_COPIES && nextRarity(c.rarity) !== null,
  )

  const sortedStacks = [...meta.ownedCoins].sort((a, b) => {
    const aReady = a.count >= FUSION_REQUIRED_COPIES && nextRarity(a.rarity) ? 1 : 0
    const bReady = b.count >= FUSION_REQUIRED_COPIES && nextRarity(b.rarity) ? 1 : 0
    if (aReady !== bReady) return bReady - aReady
    return rarityIndex(b.rarity) - rarityIndex(a.rarity)
  })

  const selectedStack: OwnedCoin | null =
    meta.ownedCoins.find((c) => c.id === selectedStackId) ??
    fuseReadyStacks[0] ??
    sortedStacks[0] ??
    null

  const canFuseSelected =
    !!selectedStack &&
    selectedStack.count >= FUSION_REQUIRED_COPIES &&
    nextRarity(selectedStack.rarity) !== null &&
    !isMergingAnim

  const handleFuseSingle = () => {
    if (!selectedStack || !canFuseSelected) return
    const targetRarity = nextRarity(selectedStack.rarity)
    if (!targetRarity) return

    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    setIsMergingAnim(true)

    const coinId = selectedStack.coinId
    window.setTimeout(() => {
      const ok = meta.fuseCoins(coinId, selectedStack.rarity)
      setIsMergingAnim(false)
      if (ok) {
        if (targetRarity === 'mythical' || targetRarity === 'legendary') {
          AudioSynth.playMythicalDrop()
        } else {
          AudioSynth.playGreenCandle()
        }
        setMergedResult({ coinId, newRarity: targetRarity })
      }
    }, 520)
  }

  const handleAutoFuseAll = () => {
    if (fuseReadyStacks.length === 0 || isMergingAnim) return
    AudioSynth.unlock()
    AudioSynth.playMythicalDrop()
    setIsMergingAnim(true)
    const previewCoin = fuseReadyStacks[0]
    const previewNext = nextRarity(previewCoin.rarity) ?? previewCoin.rarity
    window.setTimeout(() => {
      const count = meta.fuseAllAvailable()
      setIsMergingAnim(false)
      if (count > 0) {
        setMergedResult({
          coinId: previewCoin.coinId,
          newRarity: previewNext,
          countFused: count,
        })
      }
    }, 520)
  }

  return (
    <div className="relative flex h-full w-full flex-col gap-3 overflow-y-auto arcade-screen-bg p-3">
      {/* Top 3 Glossy Currency Pill Capsules */}
      <TopCurrencyBar
        hashrate={meta.hashrate}
        gems={meta.gems}
        silverKeys={meta.silverKeys}
        quantumKeys={meta.quantumKeys}
        isVipAdFree={meta.isVipAdFree}
      />

      {/* Header + Tactile 3D Auto-Fuse All Button */}
      <div className="flex items-center justify-between gap-2 rounded-2xl arcade-card p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#fb7185] bg-gradient-to-b from-[#e11d48] to-[#881337] text-white shadow">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-sm font-extrabold text-[#2C1810]">
              HARD FORK FOUNDRY
            </h2>
            <p className="text-[11px] font-semibold text-[#6E5A4F]">
              Merge 3 identical coins into 1 higher tier
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={fuseReadyStacks.length === 0 || isMergingAnim}
          onClick={handleAutoFuseAll}
          className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 font-display text-xs font-extrabold ${
            fuseReadyStacks.length > 0
              ? 'btn-3d-gold text-[#2C1810] active:border-b-0 active:translate-y-1 animate-pulse'
              : 'cursor-not-allowed border border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          AUTO-FUSE ({fuseReadyStacks.length})
        </button>
      </div>

      {/* Visual 3-to-1 Fusion Chamber */}
      {selectedStack && COIN_MAP[selectedStack.coinId] ? (
        (() => {
          const cfg = COIN_MAP[selectedStack.coinId]
          const nextR = nextRarity(selectedStack.rarity)
          const curMult = coinDamageMultiplier(selectedStack)
          const nextMult = nextR
            ? coinDamageMultiplier({ ...selectedStack, rarity: nextR })
            : curMult
          const curTheme = RARITY_CARD_THEMES[selectedStack.rarity]
          const nextTheme = RARITY_CARD_THEMES[nextR ?? selectedStack.rarity]

          return (
            <div className="flex flex-col items-center gap-3 rounded-2xl arcade-card p-3.5">
              <div className="flex items-center gap-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-[#38bdf8]">
                <GitFork className="h-4 w-4" /> 3-TO-1 CONVERGENCE CHAMBER
              </div>

              {/* 3 Input Duplicate Slots */}
              <div className="flex items-center justify-center gap-3">
                {[0, 1, 2].map((slotIdx) => {
                  const filled = selectedStack.count > slotIdx
                  return (
                    <div
                      key={slotIdx}
                      className={`flex h-22 w-22 flex-col items-center justify-center gap-1 rounded-2xl p-2 transition-all duration-500 ${
                        filled
                          ? `${curTheme.cardBg} ${curTheme.border} ${curTheme.lip}`
                          : 'border-2 border-dashed border-white/20 bg-[#121728]/70 opacity-45'
                      } ${
                        isMergingAnim
                          ? slotIdx === 0
                            ? 'translate-x-10 scale-75 opacity-0'
                            : slotIdx === 2
                              ? '-translate-x-10 scale-75 opacity-0'
                              : 'scale-125 brightness-150'
                          : ''
                      }`}
                    >
                      <CoinMascotSvg coin={cfg} size={42} />
                      <span className="w-full truncate text-center font-display text-[10px] font-extrabold text-white drop-shadow">
                        {filled ? cfg.name : 'Missing'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Output Higher-Rarity Card Preview + Tactile 3D FORK Button */}
              <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[#121728] p-3 shadow-inner">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${nextTheme.cardBg} ${nextTheme.border}`}
                  >
                    <CoinMascotSvg coin={cfg} size={42} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-display text-xs font-extrabold text-white">
                      <span className="truncate">{cfg.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#22ff99]" />
                      <span className="uppercase text-[#fde047]">
                        {nextR ?? 'MAX TIER'}
                      </span>
                    </div>
                    <div className="font-display text-xs font-bold text-[#22ff99]">
                      Power: {curMult.toFixed(2)}x → {nextMult.toFixed(2)}x
                    </div>
                    {nextR && (
                      <div className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-semibold text-[#c084fc]">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span className="truncate">{RARITY_PASSIVE_DESC[nextR]}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canFuseSelected}
                  onClick={handleFuseSingle}
                  className={`shrink-0 rounded-xl px-3.5 py-3 font-display text-xs font-extrabold ${
                    canFuseSelected
                      ? 'btn-3d-green active:border-b-0 active:translate-y-1'
                      : 'cursor-not-allowed border-b-4 border-[#0f172a] bg-[#1e293b] text-white/35'
                  }`}
                >
                  {nextR ? `FORK (${selectedStack.count}/3)` : 'MAX TIER'}
                </button>
              </div>
            </div>
          )
        })()
      ) : null}

      {/* Clash Royale Style Inventory Stack Selector */}
      <div className="flex flex-col gap-2 pb-2">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-extrabold tracking-wide text-[#2C1810]">
            YOUR COIN STACKS
          </span>
          <span className="text-[11px] font-semibold text-[#6E5A4F]">
            3/3 green bars are ready to fuse
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {sortedStacks.map((st) => {
            const cfg = COIN_MAP[st.coinId]
            if (!cfg) return null
            const selected = selectedStack?.id === st.id

            return (
              <CoinGridCard
                key={st.id}
                coin={cfg}
                stack={st}
                totalCopies={st.count}
                isSelected={selected}
                onClick={() => setSelectedStackId(st.id)}
              />
            )
          })}
        </div>
      </div>

      {/* Fusion Celebration Modal */}
      {mergedResult && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setMergedResult(null)}
        >
          <div
            className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl arcade-card p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <CheckCircle2 className="h-10 w-10 text-[#16a34a]" />
            <div className="font-display text-xs font-extrabold uppercase tracking-wider text-[#16a34a]">
              {mergedResult.countFused
                ? `${mergedResult.countFused} HARD FORKS COMPLETED!`
                : 'HARD FORK SUCCESSFUL!'}
            </div>
            {COIN_MAP[mergedResult.coinId] && (
              <CoinMascotSvg coin={COIN_MAP[mergedResult.coinId]} size={64} />
            )}
            <h3 className="font-display text-lg font-extrabold text-[#2C1810]">
              {COIN_MAP[mergedResult.coinId]?.name} →{' '}
              <span className="uppercase text-[#b45309]">{mergedResult.newRarity}</span>
            </h3>
            <p className="text-xs font-semibold text-[#6E5A4F]">
              {RARITY_PASSIVE_DESC[mergedResult.newRarity]}
            </p>
            <button
              type="button"
              onClick={() => setMergedResult(null)}
              className="w-full rounded-xl py-3 font-display text-sm font-extrabold text-white btn-3d-green game-text-outline-sm active:border-b-0 active:translate-y-1"
            >
              AWESOME!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
