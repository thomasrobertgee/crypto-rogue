import { useState, useMemo, useEffect } from 'react'
import {
  X,
  Lock,
  Check,
} from 'lucide-react'
import {
  getFullCodexEntries,
  CODEX_CLAIM_GEMS_REWARD,
  type CodexCategory,
} from '../../config/codex.config'
import { useMetaStore } from '../../state/useMetaStore'
import { AudioSynth } from '../../engine/AudioSynth'
import { DynamicIcon } from '../DynamicIcon'
import { SatoshiGemIcon, RARITY_CARD_THEMES } from '../GameArtwork'
import { HeroChibiSvg, RedAlertBadge } from '../WorldDioramaArt'

interface CodexModalProps {
  onClose: () => void
}

const CATEGORY_TABS: Array<{ id: CodexCategory; label: string; icon: string }> = [
  { id: 'coins', label: 'Coins', icon: '🪙' },
  { id: 'heroes', label: 'Heroes', icon: '🦸' },
  { id: 'relics', label: 'Relics', icon: '⚡' },
  { id: 'bosses', label: 'Bosses', icon: '👾' },
]

export function CodexModal({ onClose }: CodexModalProps) {
  const meta = useMetaStore()
  const [activeCategory, setActiveCategory] = useState<CodexCategory>('coins')
  const [justClaimedId, setJustClaimedId] = useState<string | null>(null)

  const allEntries = useMemo(() => getFullCodexEntries(), [])
  const codexDiscovered = meta.codexDiscovered ?? {}
  const codexClaimed = meta.codexClaimed ?? {}

  // Auto-sync retroactive discoveries on mount
  useEffect(() => {
    // Coins
    meta.ownedCoins.forEach((c) => {
      meta.discoverCodexEntry(`coin_${c.coinId}`)
    })
    // Heroes
    Object.keys(meta.ownedHeroes ?? {}).forEach((hid) => {
      if ((meta.ownedHeroes?.[hid] ?? 0) > 0) {
        meta.discoverCodexEntry(`hero_${hid}`)
      }
    })
    // Relics
    meta.ownedRelics.forEach((rid) => {
      meta.discoverCodexEntry(`relic_${rid}`)
    })
    // Bosses if stages cleared
    if (meta.highestStageCleared >= 1) {
      meta.discoverCodexEntry('boss_street_scammer')
      meta.discoverCodexEntry('boss_penny_pumper')
      meta.discoverCodexEntry('boss_bear_whale')
    }
    if (meta.highestStageCleared >= 2) {
      meta.discoverCodexEntry('boss_sec_enforcer')
    }
    if (meta.highestStageCleared >= 3) {
      meta.discoverCodexEntry('boss_rug_pull_overlord')
    }
    if (meta.highestStageCleared >= 4) {
      meta.discoverCodexEntry('boss_flash_crash_phantom')
    }
    if (meta.highestStageCleared >= 5) {
      meta.discoverCodexEntry('boss_gas_baron')
    }
    if ((meta.highestTowerFloorCleared ?? 0) >= 5) {
      meta.discoverCodexEntry('boss_microstrategy_shifter')
    }
    if ((meta.highestTowerFloorCleared ?? 0) >= 10) {
      meta.discoverCodexEntry('boss_alameda_liquidator')
    }
    if ((meta.highestTowerFloorCleared ?? 0) >= 20) {
      meta.discoverCodexEntry('boss_quantum_citadel_ai')
    }
  }, [])

  // Stats
  const totalEntries = allEntries.length
  const totalDiscovered = allEntries.filter((e) => codexDiscovered[e.id]).length
  const progressPct = Math.round((totalDiscovered / Math.max(1, totalEntries)) * 100)

  // Unclaimed count per category
  const unclaimedCountsByCategory = useMemo(() => {
    const counts: Record<CodexCategory, number> = { coins: 0, heroes: 0, relics: 0, bosses: 0 }
    for (const e of allEntries) {
      if (codexDiscovered[e.id] && !codexClaimed[e.id]) {
        counts[e.category] = (counts[e.category] || 0) + 1
      }
    }
    return counts
  }, [allEntries, codexDiscovered, codexClaimed])

  const totalUnclaimed = Object.values(unclaimedCountsByCategory).reduce((a, b) => a + b, 0)

  // Filtered entries for active tab
  const categoryEntries = useMemo(() => {
    return allEntries.filter((e) => e.category === activeCategory)
  }, [allEntries, activeCategory])

  const handleClaimSingle = (id: string) => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    setJustClaimedId(id)
    meta.claimCodexReward(id)
    window.setTimeout(() => setJustClaimedId(null), 1500)
  }

  const handleClaimAll = () => {
    AudioSynth.unlock()
    AudioSynth.playVictory()
    meta.claimAllCodexRewards()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] shadow-2xl">
        {/* Top Header Banner */}
        <div className="relative flex items-center justify-between border-b-2 border-[#3E2723] bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] px-4 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white/30 bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-xl shadow">
              📖
            </div>
            <div>
              <h2 className="font-display text-sm font-black tracking-wide text-white drop-shadow">
                THE CRYPTO CODEX MUSEUM
              </h2>
              <p className="text-[10px] font-semibold text-[#c7d2fe]">
                Discover items &amp; defeat bosses for free +20 Satoshi Gems each!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-black/25 text-white/80 hover:bg-black/40 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Progress & Claim All Bar */}
        <div className="border-b-2 border-[#3E2723] bg-[#FBF8F2] px-4 py-2.5">
          <div className="flex items-center justify-between font-display text-[11px] font-extrabold text-[#2C1810] mb-1.5">
            <span>
              Museum Hall of Fame: {totalDiscovered} / {totalEntries} Discovered ({progressPct}%)
            </span>
            {totalUnclaimed > 0 ? (
              <button
                type="button"
                onClick={handleClaimAll}
                className="btn-3d-gold px-2.5 py-1 text-[10px] font-black uppercase text-white game-text-outline-sm shadow animate-pulse"
              >
                ⚡ Claim All (+{totalUnclaimed * CODEX_CLAIM_GEMS_REWARD} 💎)
              </button>
            ) : (
              <span className="text-[10px] text-[#166534] font-black">All Discovered Claimed!</span>
            )}
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#E2D5C1] bg-[#F3E9D8] p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] via-[#10b981] to-[#3b82f6] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 4 Category Sub-Tabs */}
        <div className="grid grid-cols-4 border-b-2 border-[#3E2723] bg-[#EFE8DC] p-1 gap-1">
          {CATEGORY_TABS.map((t) => {
            const active = activeCategory === t.id
            const unclaimed = unclaimedCountsByCategory[t.id]
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  setActiveCategory(t.id)
                }}
                className={`relative flex items-center justify-center gap-1 rounded-xl py-2 font-display text-xs font-black transition-all ${
                  active
                    ? 'btn-3d-gold text-white game-text-outline-sm shadow'
                    : 'text-[#6E5A4F] hover:bg-[#E5D7C5]'
                }`}
              >
                {unclaimed > 0 && <RedAlertBadge className="-top-1 -right-1" />}
                <span>{t.icon}</span>
                <span className="truncate">{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Scrollable Entry Cards Grid */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
          {categoryEntries.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-[#6E5A4F]">
              No entries found in this category.
            </div>
          ) : (
            categoryEntries.map((entry) => {
              const isDiscovered = Boolean(codexDiscovered[entry.id])
              const isClaimed = Boolean(codexClaimed[entry.id])
              const theme = RARITY_CARD_THEMES[entry.rarity] || RARITY_CARD_THEMES.common

              if (!isDiscovered) {
                // Undiscovered Silhouette Card
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#B5A493] bg-[#F3ECE2] p-3 opacity-65"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#B5A493] bg-[#E5D7C5] text-xl text-[#8C7A6B]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-xs font-black text-[#8C7A6B]">
                        🔒 ??? (Undiscovered)
                      </div>
                      <div className="text-[10px] font-semibold text-[#8C7A6B]">
                        {entry.howToDiscover}
                      </div>
                    </div>
                  </div>
                )
              }

              // Discovered Card
              return (
                <div
                  key={entry.id}
                  className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3 shadow-sm transition-all ${
                    justClaimedId === entry.id ? 'ring-2 ring-[#f59e0b] scale-[1.01]' : ''
                  }`}
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#3E2723] ${theme.cardBg} text-2xl shadow-inner`}
                    >
                      {entry.category === 'heroes' ? (
                        <HeroChibiSvg heroId={entry.id.replace('hero_', '') as any} size={36} />
                      ) : (
                        <DynamicIcon name={entry.icon} className="h-6 w-6 text-white drop-shadow" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xs font-black text-[#2C1810] truncate">
                          {entry.name}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 font-display text-[8px] font-black uppercase text-white ${theme.badgeBg}`}
                        >
                          {entry.rarity}
                        </span>
                      </div>
                      <div className="text-[10px] font-extrabold text-[#b45309]">
                        {entry.subtitle}
                      </div>
                      <p className="text-[9px] font-medium text-[#6E5A4F] line-clamp-1">
                        {entry.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Claim Action */}
                  <div className="shrink-0">
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#166534] bg-[#dcfce7] px-2.5 py-1 font-display text-[9px] font-black text-[#15803d]">
                        <Check className="h-3 w-3" />
                        CLAIMED
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaimSingle(entry.id)}
                        className="btn-3d-gold inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10px] font-black uppercase text-white game-text-outline-sm shadow animate-bounce"
                      >
                        <SatoshiGemIcon size={12} />
                        Claim +20
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
