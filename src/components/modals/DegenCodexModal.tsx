import { useState, useMemo, useEffect } from 'react'
import { BookOpen, CheckCircle2, Gem, HelpCircle, Lock, Sparkles, X } from 'lucide-react'
import {
  CODEX_CLAIM_GEMS_REWARD,
  getFullCodexEntries,
  type CodexCategory,
  type CodexEntry,
} from '../../config/codex.config'
import { useMetaStore } from '../../state/useMetaStore'
import { useRunStore } from '../../state/useRunStore'
import { DynamicIcon } from '../DynamicIcon'
import { AudioSynth } from '../../engine/AudioSynth'
import type { Rarity } from '../../types/game.types'

const RARITY_BADGE: Record<Rarity, string> = {
  common: 'bg-slate-200 text-slate-800 border-slate-400',
  uncommon: 'bg-emerald-100 text-emerald-800 border-emerald-500',
  rare: 'bg-sky-100 text-sky-800 border-sky-500',
  epic: 'bg-purple-100 text-purple-800 border-purple-500',
  legendary: 'bg-amber-100 text-amber-900 border-amber-500',
  mythical: 'bg-rose-100 text-rose-800 border-rose-500',
}

interface DegenCodexModalProps {
  onClose: () => void
}

const CATEGORY_TABS: Array<{ id: CodexCategory; label: string; emoji: string }> = [
  { id: 'enemies', label: 'Enemies', emoji: '👾' },
  { id: 'bosses', label: 'Boss Titans', emoji: '🐋' },
  { id: 'coins', label: 'Coins', emoji: '🪙' },
  { id: 'rigs', label: 'Rig Sets', emoji: '🖥️' },
  { id: 'mythics', label: 'Mythics', emoji: '🌟' },
  { id: 'heroes', label: 'Heroes', emoji: '🦸' },
  { id: 'relics', label: 'Relics', emoji: '⚡' },
]

export function DegenCodexModal({ onClose }: DegenCodexModalProps) {
  const codexDiscovered = useMetaStore((s) => s.codexDiscovered ?? {})
  const codexClaimed = useMetaStore((s) => s.codexClaimed ?? {})
  const claimCodexReward = useMetaStore((s) => s.claimCodexReward)
  const claimAllCodexRewards = useMetaStore((s) => s.claimAllCodexRewards)
  const discoverCodexEntry = useMetaStore((s) => s.discoverCodexEntry)
  const ownedCoins = useMetaStore((s) => s.ownedCoins)
  const ownedHeroes = useMetaStore((s) => s.ownedHeroes)
  const equippedRelicIds = useMetaStore((s) => s.equippedRelicIds)
  const rigInventory = useMetaStore((s) => s.rigInventory)
  const equippedRig = useMetaStore((s) => s.equippedRig)
  const highestStageCleared = useMetaStore((s) => s.highestStageCleared)
  const activeMythicEvolutions = useRunStore((s) => s.activeMythicEvolutions)

  const [activeCategory, setActiveCategory] = useState<CodexCategory>('enemies')
  const [selectedEntry, setSelectedEntry] = useState<CodexEntry | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const allEntries = useMemo(() => getFullCodexEntries(), [])

  // Auto-sync owned/encountered items into discoveredCodexIds
  useEffect(() => {
    // Starter enemies encountered in Stage 1
    discoverCodexEntry('enemy_paper_hands')
    discoverCodexEntry('enemy_bagholder')
    if (highestStageCleared >= 1) {
      discoverCodexEntry('enemy_exit_liquidity')
      discoverCodexEntry('enemy_pump_bot')
      discoverCodexEntry('boss_bear_whale')
    }
    for (const c of ownedCoins ?? []) {
      discoverCodexEntry(`coin_${c.coinId}`)
    }
    for (const hId of Object.keys(ownedHeroes ?? {})) {
      discoverCodexEntry(`hero_${hId}`)
    }
    for (const rId of equippedRelicIds ?? []) {
      discoverCodexEntry(`relic_${rId}`)
    }
    // Check equipped & inventory rig items and corporate sets
    const allRigItems = [
      ...(rigInventory ?? []),
      ...Object.values(equippedRig ?? {}).filter(Boolean),
    ]
    for (const item of allRigItems) {
      if (!item) continue
      if (item.setId) {
        discoverCodexEntry(`rigset_${item.setId}`)
      }
      discoverCodexEntry(`rig_${item.id}`)
    }
    // Default starter rig set discovery so players can inspect Corporate Sets
    discoverCodexEntry('rigset_nvidia_protocol')
    for (const mId of activeMythicEvolutions ?? []) {
      discoverCodexEntry(mId)
    }
  }, [
    activeMythicEvolutions,
    discoverCodexEntry,
    equippedRelicIds,
    equippedRig,
    highestStageCleared,
    ownedCoins,
    ownedHeroes,
    rigInventory,
  ])

  const filteredEntries = useMemo(
    () => allEntries.filter((e) => e.category === activeCategory),
    [allEntries, activeCategory],
  )

  const totalDiscovered = useMemo(
    () => allEntries.filter((e) => Boolean(codexDiscovered[e.id])).length,
    [allEntries, codexDiscovered],
  )

  const unclaimedCountByCat = useMemo(() => {
    const counts: Record<CodexCategory, number> = {
      enemies: 0,
      bosses: 0,
      coins: 0,
      rigs: 0,
      mythics: 0,
      heroes: 0,
      relics: 0,
    }
    for (const e of allEntries) {
      if (codexDiscovered[e.id] && !codexClaimed[e.id]) {
        counts[e.category] = (counts[e.category] ?? 0) + 1
      }
    }
    return counts
  }, [allEntries, codexDiscovered, codexClaimed])

  const totalUnclaimed = Object.values(unclaimedCountByCat).reduce((a, b) => a + b, 0)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const handleClaimSingle = (entry: CodexEntry, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const ok = claimCodexReward(entry.id)
    if (ok) {
      AudioSynth.playCoinInject()
      showToast(`Claimed +${CODEX_CLAIM_GEMS_REWARD} Satoshi Gems from ${entry.name}!`)
    }
  }

  const handleClaimAll = () => {
    const res = claimAllCodexRewards()
    if (res.totalGems > 0) {
      AudioSynth.playChestOpen()
      showToast(`Claimed +${res.totalGems} Satoshi Gems from Degen Codex!`)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[430px] flex-col overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] text-[#2C1810] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E2D5C1] bg-gradient-to-r from-[#fef3c7] via-[#fde68a] to-[#fef3c7] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-[#f59e0b] text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-base font-black tracking-wide text-[#2C1810]">
                  📖 DEGEN CODEX
                </h2>
                <span className="rounded-full border border-[#3E2723] bg-[#FFFDF9] px-2 py-0.5 font-display text-[9px] font-black text-[#b45309]">
                  {totalDiscovered}/{allEntries.length}
                </span>
              </div>
              <p className="font-display text-[10px] font-bold text-[#6E5A4F]">
                Discover Enemies, Boss Titans, Coins, Rigs & Mythic Evolutions (+{CODEX_CLAIM_GEMS_REWARD} 💎 each)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#FFFDF9] text-[#2C1810] hover:bg-[#F3E9D8]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category Tabs (Horizontal Scrollable Pill Strip) */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-[#E2D5C1] bg-[#F3E9D8] px-3 py-2 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.id
            const badgeCount = unclaimedCountByCat[tab.id]
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategory(tab.id)
                  setSelectedEntry(null)
                }}
                className={`relative flex shrink-0 items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10.5px] font-black transition ${
                  active
                    ? 'border-2 border-[#3E2723] bg-[#f59e0b] text-[#2C1810] shadow-xs'
                    : 'border border-[#E2D5C1] bg-[#FFFDF9] text-[#6E5A4F] hover:text-[#2C1810]'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                {badgeCount > 0 && (
                  <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#e11d48] px-1 text-[8.5px] font-black text-white shadow-xs animate-pulse">
                    {badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Claim All Bar if any unclaimed */}
        {totalUnclaimed > 0 && (
          <div className="flex items-center justify-between border-b border-[#fde047] bg-[#fef9c3] px-4 py-2">
            <div className="flex items-center gap-1.5 font-display text-xs font-extrabold text-[#854d0e]">
              <Sparkles className="h-4 w-4 text-[#ca8a04]" />
              <span>
                {totalUnclaimed} New Discover{totalUnclaimed === 1 ? 'y' : 'ies'} Ready!
              </span>
            </div>
            <button
              type="button"
              onClick={handleClaimAll}
              className="flex items-center gap-1 rounded-xl border-2 border-[#3E2723] border-b-4 bg-[#22c55e] px-3 py-1 font-display text-[11px] font-black text-white shadow-xs active:translate-y-0.5"
            >
              <Gem className="h-3.5 w-3.5" />
              CLAIM ALL (+{totalUnclaimed * CODEX_CLAIM_GEMS_REWARD} 💎)
            </button>
          </div>
        )}

        {toast && (
          <div className="mx-4 mt-2 rounded-xl border-2 border-[#15803d] bg-[#dcfce7] px-3 py-1.5 text-center font-display text-xs font-black text-[#166534] shadow-xs">
            {toast}
          </div>
        )}

        {/* Selected Entry Detail & Satirical Lore Drawer */}
        {selectedEntry && (
          <div className="mx-3 mt-2.5 rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#FFFDF9] to-[#FEF3C7] p-3 shadow-md animate-fade-in">
            {(() => {
              const isDiscovered = Boolean(codexDiscovered[selectedEntry.id])
              const isClaimed = Boolean(codexClaimed[selectedEntry.id])
              const canClaim = isDiscovered && !isClaimed

              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] ${
                          isDiscovered
                            ? 'bg-[#FFFDF9] text-[#2C1810]'
                            : 'bg-[#1e1b2e] text-black'
                        }`}
                      >
                        <div className={isDiscovered ? '' : 'brightness-0 contrast-200 opacity-70'}>
                          <DynamicIcon name={selectedEntry.icon} className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-sm font-black text-[#2C1810]">
                            {isDiscovered ? selectedEntry.name : '??? MYSTERIOUS SILHOUETTE'}
                          </span>
                          <span
                            className={`rounded-full border px-1.5 py-0.2 font-display text-[8px] font-black uppercase ${
                              RARITY_BADGE[selectedEntry.rarity]
                            }`}
                          >
                            {selectedEntry.rarity}
                          </span>
                        </div>
                        <div className="font-display text-[10px] font-bold text-[#6E5A4F]">
                          {isDiscovered ? selectedEntry.subtitle : `Unlock Hint: ${selectedEntry.howToDiscover}`}
                        </div>
                      </div>
                    </div>

                    {canClaim && (
                      <button
                        type="button"
                        onClick={(e) => handleClaimSingle(selectedEntry, e)}
                        className="shrink-0 rounded-xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-2.5 py-1.5 font-display text-[10px] font-black text-white shadow-sm active:translate-y-0.5 animate-bounce"
                      >
                        [ 💎 CLAIM +{CODEX_CLAIM_GEMS_REWARD} GEMS ]
                      </button>
                    )}
                  </div>

                  {isDiscovered ? (
                    <>
                      <div className="rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2 text-[11px] font-bold text-[#2C1810]">
                        {selectedEntry.description}
                      </div>
                      <div className="rounded-xl border border-[#f59e0b]/50 bg-[#fffbeb] p-2.5 text-[11px] font-semibold italic leading-snug text-[#78350f]">
                        <span className="not-italic font-display text-[9px] font-black uppercase tracking-wider text-[#b45309] block mb-0.5">
                          📜 DEGEN LORE ARCHIVE:
                        </span>
                        “{selectedEntry.lore}”
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#a8a29e] bg-[#F3E9D8] p-2.5 text-[11px] font-bold text-[#6E5A4F]">
                      <HelpCircle className="h-4 w-4 shrink-0 text-[#b45309]" />
                      <span>
                        <strong>Unlock Hint:</strong> {selectedEntry.howToDiscover}
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* Codex Entries List / Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-2.5">
            {filteredEntries.map((entry) => {
              const isDiscovered = Boolean(codexDiscovered[entry.id])
              const isClaimed = Boolean(codexClaimed[entry.id])
              const canClaim = isDiscovered && !isClaimed
              const isSelected = selectedEntry?.id === entry.id

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 p-3 transition ${
                    isSelected
                      ? 'border-[#b45309] bg-[#fffbeb] ring-2 ring-[#f59e0b]/40 shadow-md'
                      : isDiscovered
                        ? 'border-[#3E2723] bg-[#FFFDF9] shadow-xs hover:bg-[#FEF9C3]/40'
                        : 'border-dashed border-[#a8a29e] bg-[#1e1b2e]/10 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Pulsing Red Notification Dot for Unclaimed Discovery */}
                  {canClaim && (
                    <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                      <span className="relative inline-flex h-4 w-4 rounded-full border border-white bg-rose-600" />
                    </span>
                  )}

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Icon or Mysterious Dark Silhouette */}
                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 ${
                        isDiscovered
                          ? 'border-[#3E2723] bg-[#F3E9D8] text-[#2C1810]'
                          : 'border-[#3E2723] bg-[#141022] text-black shadow-inner'
                      }`}
                    >
                      {isDiscovered ? (
                        <DynamicIcon name={entry.icon} className="h-6 w-6" />
                      ) : (
                        <div className="relative flex items-center justify-center">
                          <div className="brightness-0 invert-0 opacity-40">
                            <DynamicIcon name={entry.icon} className="h-6 w-6 text-black" />
                          </div>
                          <Lock className="absolute h-3.5 w-3.5 text-amber-400/90" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate font-display text-xs font-black text-[#2C1810]">
                          {isDiscovered ? entry.name : '??? Unseen Entry'}
                        </span>
                        <span
                          className={`rounded-full border px-1.5 py-0.2 font-display text-[8px] font-black uppercase ${
                            RARITY_BADGE[entry.rarity]
                          }`}
                        >
                          {entry.rarity}
                        </span>
                      </div>

                      <div className="font-display text-[10px] font-bold text-[#6E5A4F]">
                        {isDiscovered ? entry.subtitle : `Hint: ${entry.howToDiscover}`}
                      </div>

                      <p className="mt-1 line-clamp-2 text-[10.5px] font-semibold leading-snug text-[#422006]">
                        {isDiscovered ? `“${entry.lore}”` : entry.howToDiscover}
                      </p>
                    </div>
                  </div>

                  {/* Right Action / Bounty Button */}
                  <div className="shrink-0">
                    {canClaim ? (
                      <button
                        type="button"
                        onClick={(e) => handleClaimSingle(entry, e)}
                        className="flex flex-col items-center rounded-xl border-2 border-[#3E2723] border-b-4 bg-[#22c55e] px-2.5 py-1.5 font-display text-[9.5px] font-black text-white shadow-xs active:translate-y-0.5"
                      >
                        <span className="flex items-center gap-0.5">
                          💎 CLAIM +{CODEX_CLAIM_GEMS_REWARD}
                        </span>
                        <span className="text-[7.5px] uppercase tracking-wider">GEMS</span>
                      </button>
                    ) : isClaimed ? (
                      <div className="flex flex-col items-center rounded-xl border border-[#86efac] bg-[#dcfce7] px-2.5 py-1.5 font-display text-[9px] font-black text-[#166534]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />
                        <span>CLAIMED</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2.5 py-1.5 font-display text-[9px] font-black text-[#6E5A4F]">
                        <span>+{CODEX_CLAIM_GEMS_REWARD} 💎</span>
                        <span className="text-[7.5px]">LOCKED</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
