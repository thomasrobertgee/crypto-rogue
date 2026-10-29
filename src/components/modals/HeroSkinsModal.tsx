import { useState } from 'react'
import { Check, ChevronRight, Lock, X } from 'lucide-react'
import {
  HERO_SKINS_BY_HERO,
  MAX_SKIN_STARS,
  SKIN_MAP,
  SKIN_TIER_THEMES,
  getSkinAscensionCost,
  getSkinStarMultiplier,
  type HeroSkinConfig,
} from '../../config/heroSkins.config'
import { HERO_MAP, type HeroId } from '../../config/heroes.config'
import { useMetaStore } from '../../state/useMetaStore'
import { HeroAvatar } from '../HeroAvatar'
import { StageLandscapeSvg, RedAlertBadge } from '../WorldDioramaArt'
import { AudioSynth } from '../../engine/AudioSynth'

interface HeroSkinsModalProps {
  heroId: HeroId
  onClose: () => void
}

export function HeroSkinsModal({ heroId, onClose }: HeroSkinsModalProps) {
  const meta = useMetaStore()
  const heroCfg = HERO_MAP[heroId]
  const skins = HERO_SKINS_BY_HERO[heroId] ?? []

  const equippedSkinId = meta.equippedSkins?.[heroId] || `${heroId}_default`
  const [selectedSkinId, setSelectedSkinId] = useState<string>(equippedSkinId)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }

  const selectedSkin: HeroSkinConfig = SKIN_MAP[selectedSkinId] || skins[0]
  const ownedInfo = meta.ownedSkins?.[selectedSkin.id] ?? {
    unlocked: selectedSkin.tier === 'default',
    stars: 1,
    copies: 0,
  }

  const isUnlocked = ownedInfo.unlocked
  const isEquipped = equippedSkinId === selectedSkin.id
  const curStars = ownedInfo.stars ?? 1
  const curCopies = ownedInfo.copies ?? 0
  const canAscend = isUnlocked && curStars < MAX_SKIN_STARS && curCopies >= getSkinAscensionCost(curStars)
  const ascensionCost = getSkinAscensionCost(curStars)
  const starMultiplier = getSkinStarMultiplier(curStars)
  const tierTheme = SKIN_TIER_THEMES[selectedSkin.tier]

  // Overall account skin bonuses
  const totalSkinBonuses = meta.getSkinStatBonus?.() ?? {
    damagePct: 0,
    startingSeedPct: 0,
    critChancePct: 0,
    greenOddsPct: 0,
    speedPct: 0,
    bossBountyPct: 0,
  }

  const handleEquip = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    meta.equipHeroSkin(heroId, selectedSkin.id)
    showToast(`👗 Equipped ${selectedSkin.name}!`)
  }

  const handleAscend = () => {
    if (!canAscend) return
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    if (meta.ascendHeroSkin(selectedSkin.id)) {
      showToast(`⭐ ${selectedSkin.name} Ascended to ${curStars + 1}★! (+25% Stats)`)
    }
  }

  const handleAddCopyCheat = () => {
    meta.addSkinCopies(selectedSkin.id, 1)
    meta.unlockSkin(selectedSkin.id)
    showToast(`🧪 +1 ${selectedSkin.name} Copy Added (Dev Cheat)`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] text-[#422006] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-[#78350f] bg-gradient-to-r from-[#fed7aa] via-[#fde68a] to-[#fed7aa] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">👗</span>
            <div>
              <div className="font-display text-xs font-black uppercase text-[#422006]">
                {heroCfg?.name ?? 'Hero'} Wardrobe
              </div>
              <div className="text-[10px] font-bold text-[#9a3412]">
                4 Exclusive Skins &amp; Star Ascension
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#78350f] bg-[#fee2e2] text-[#991b1b] transition active:scale-95"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Global Passive Skin Stacking Banner */}
        <div className="border-b border-[#fed7aa] bg-[#fef3c7] px-3.5 py-1.5 text-center text-[10px] font-extrabold text-[#92400e]">
          ✨ <span className="font-black text-[#b45309]">All Unlocked Skin Passives Stack:</span>{' '}
          {totalSkinBonuses.damagePct > 0 && `+${totalSkinBonuses.damagePct}% Dmg • `}
          {totalSkinBonuses.startingSeedPct > 0 && `+${totalSkinBonuses.startingSeedPct}% Seed • `}
          {totalSkinBonuses.critChancePct > 0 && `+${totalSkinBonuses.critChancePct}% Crit`}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-14 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-[#14532d] bg-[#4ade80] px-4 py-1 text-xs font-black text-white shadow-lg animate-bounce">
            {toast}
          </div>
        )}

        {/* Scrollable Wardrobe Body */}
        <div className="flex flex-col gap-3 overflow-y-auto p-3.5">
          {/* Main Stage Diorama Preview */}
          <div className="relative overflow-hidden rounded-3xl border-[3px] border-[#78350f] border-b-[5px] bg-[#fef08a] shadow-inner">
            <div className="relative flex h-52 w-full flex-col items-center justify-between p-3">
              {/* Background Landscape */}
              <div className="absolute inset-0 z-0 opacity-80">
                <StageLandscapeSvg stage={meta.currentStage} mode="battle" />
              </div>

              {/* Top Tag Badges */}
              <div className="relative z-10 flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full border border-black/30 px-2.5 py-0.5 font-display text-[10px] font-black uppercase text-white shadow-xs ${tierTheme.badgeBg}`}
                  >
                    {tierTheme.label}
                  </span>
                  <span className="flex items-center rounded-full border border-[#78350f] bg-[#2C1810] px-2 py-0.5 font-display text-[10px] font-black text-[#fde047]">
                    {'★'.repeat(curStars)}
                    {'☆'.repeat(Math.max(0, MAX_SKIN_STARS - curStars))}
                  </span>
                </div>

                {isEquipped ? (
                  <span className="flex items-center gap-1 rounded-full border border-[#14532d] bg-[#22c55e] px-2.5 py-0.5 font-display text-[10px] font-black text-white shadow">
                    <Check className="h-3 w-3 stroke-[3]" /> EQUIPPED
                  </span>
                ) : isUnlocked ? (
                  <button
                    type="button"
                    onClick={handleEquip}
                    className="btn-3d-green flex items-center gap-1 rounded-full px-3 py-1 font-display text-[10px] font-black text-white game-text-outline-sm shadow"
                  >
                    <span>EQUIP</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-[#78350f] bg-[#e2e8f0] px-2.5 py-0.5 font-display text-[10px] font-black text-[#475569]">
                    <Lock className="h-3 w-3" /> LOCKED
                  </span>
                )}
              </div>

              {/* Dynamic Chibi Avatar Preview */}
              <div className="relative z-10 my-auto">
                <HeroAvatar heroId={heroId} skinId={selectedSkin.id} size={118} showAura={true} />
              </div>

              {/* Skin Name & Subtitle Plate */}
              <div className="relative z-10 rounded-full border-2 border-[#78350f] bg-[#fff6e6]/95 px-4 py-0.5 text-center shadow-md">
                <span className="font-display text-sm font-black text-[#422006]">
                  {selectedSkin.name}
                </span>
                <span className="ml-1.5 font-display text-[10px] font-bold text-[#b45309]">
                  • {selectedSkin.title}
                </span>
              </div>
            </div>

            {/* Ascension Stars & Duplicate Copies Bar */}
            <div className="border-t border-[#fed7aa] bg-[#fffbeb] p-2.5">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-[#78350f]">
                <span>
                  ⭐ Skin Star Ascension ({curStars}/{MAX_SKIN_STARS}★)
                </span>
                <span className="font-bold text-[#b45309]">
                  {curStars >= MAX_SKIN_STARS
                    ? 'MAXED 5★ (+100% Bonus)'
                    : `Next: ${curStars + 1}★ (x${(starMultiplier + 0.25).toFixed(2)})`}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <div className="relative h-3 flex-1 overflow-hidden rounded-full border border-[#78350f]/40 bg-[#fef3c7]">
                  <div
                    className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fde047] transition-all"
                    style={{
                      width:
                        curStars >= MAX_SKIN_STARS
                          ? '100%'
                          : `${Math.min(100, Math.round((curCopies / ascensionCost) * 100))}%`,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center font-display text-[8.5px] font-black text-[#451a03]">
                    {curStars >= MAX_SKIN_STARS
                      ? '5★ MASTERED'
                      : `${curCopies} / ${ascensionCost} Copies`}
                  </span>
                </div>

                {isUnlocked && curStars < MAX_SKIN_STARS && (
                  <button
                    type="button"
                    disabled={!canAscend}
                    onClick={handleAscend}
                    className={`rounded-xl px-3 py-1 font-display text-[10px] font-black uppercase transition ${
                      canAscend
                        ? 'btn-3d-gold text-white game-text-outline-sm animate-pulse'
                        : 'border border-[#78350f]/30 bg-[#e2e8f0] text-[#64748b] cursor-not-allowed'
                    }`}
                  >
                    ⭐ Ascend ({ascensionCost}🧩)
                  </button>
                )}

                {/* Dev cheat helper */}
                <button
                  type="button"
                  onClick={handleAddCopyCheat}
                  title="Dev Cheat: Add 1 Duplicate Copy"
                  className="rounded-lg border border-amber-600/40 bg-amber-100 px-1.5 py-1 text-[8.5px] font-extrabold text-amber-900 active:scale-95"
                >
                  +1 Copy
                </button>
              </div>
            </div>
          </div>

          {/* Skin Bonuses Breakdown */}
          <div className="grid grid-cols-1 gap-2">
            {/* 1. Passive Owned Stat Bonus */}
            <div className="flex items-start gap-2.5 rounded-2xl border-2 border-[#78350f]/30 bg-[#FFFDF9] p-2.5 shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#78350f] bg-[#fde047] text-lg shadow-xs">
                🛡️
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] font-black uppercase text-[#9a3412]">
                    Passive Owned Bonus
                  </span>
                  <span className="rounded-full bg-[#16a34a]/15 px-2 py-0.2 font-display text-[9px] font-black text-[#15803d]">
                    {starMultiplier > 1 ? `x${starMultiplier.toFixed(2)} (${curStars}★)` : 'Active'}
                  </span>
                </div>
                <div className="font-display text-xs font-black text-[#2C1810]">
                  {selectedSkin.passiveBonusText}{' '}
                  {curStars > 1 && (
                    <span className="text-[#16a34a]">
                      (Boosted: +{(selectedSkin.passiveBonus.baseValue * starMultiplier).toFixed(1)}%)
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-semibold text-[#6E5A4F] leading-tight">
                  Permanent account boost. Applies passively once unlocked without needing to equip!
                </p>
              </div>
            </div>

            {/* 2. Equipped Active Skill Mutation */}
            <div className="flex items-start gap-2.5 rounded-2xl border-2 border-[#78350f]/30 bg-[#FFFDF9] p-2.5 shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#78350f] bg-[#38bdf8] text-lg text-white shadow-xs">
                ⚡
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] font-black uppercase text-[#0369a1]">
                    Equipped Skill Mutation
                  </span>
                  {isEquipped && (
                    <span className="rounded-full bg-[#38bdf8]/20 px-2 py-0.2 font-display text-[9px] font-black text-[#0369a1]">
                      ACTIVE IN BATTLE
                    </span>
                  )}
                </div>
                <div className="font-display text-xs font-black text-[#2C1810]">
                  {selectedSkin.skillMutationName}
                </div>
                <p className="text-[10px] font-semibold text-[#6E5A4F] leading-tight">
                  {selectedSkin.skillMutationDesc}
                </p>
              </div>
            </div>
          </div>

          {/* 4-Skin Selection Grid */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-xs font-black uppercase tracking-wider text-[#422006]">
                Available Skins ({skins.filter((s) => meta.ownedSkins?.[s.id]?.unlocked).length}/4)
              </span>
              <span className="text-[10px] font-bold text-[#9a3412]">
                Tap to Inspect &amp; Equip
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {skins.map((skin) => {
                const sOwned = meta.ownedSkins?.[skin.id] ?? {
                  unlocked: skin.tier === 'default',
                  stars: 1,
                  copies: 0,
                }
                const isSelected = selectedSkinId === skin.id
                const sEquipped = equippedSkinId === skin.id
                const sTier = SKIN_TIER_THEMES[skin.tier]
                const readyToAscend =
                  sOwned.unlocked &&
                  sOwned.stars < MAX_SKIN_STARS &&
                  sOwned.copies >= getSkinAscensionCost(sOwned.stars)

                return (
                  <button
                    key={skin.id}
                    type="button"
                    onClick={() => {
                      AudioSynth.unlock()
                      AudioSynth.playCoinInject()
                      setSelectedSkinId(skin.id)
                    }}
                    className={`relative flex flex-col items-center rounded-2xl border-2 border-[#78350f] p-2.5 text-center transition-all active:scale-95 ${
                      isSelected
                        ? 'border-b-4 bg-[#fef08a] ring-3 ring-[#f59e0b] shadow-md -translate-y-0.5'
                        : 'border-b-[3px] bg-[#FFFDF9] hover:bg-[#fffbeb]'
                    }`}
                  >
                    {readyToAscend && <RedAlertBadge className="-top-1.5 -right-1.5" />}

                    {/* Top Row: Tier & Stars */}
                    <div className="flex w-full items-center justify-between text-[9px] font-black">
                      <span className={`rounded-full px-2 py-0.2 uppercase text-white ${sTier.badgeBg}`}>
                        {skin.tier}
                      </span>
                      <span className="text-[#b45309]">
                        {sOwned.unlocked ? `${sOwned.stars}★` : 'LOCKED'}
                      </span>
                    </div>

                    {/* Miniature Avatar */}
                    <div className="my-1">
                      <HeroAvatar heroId={heroId} skinId={skin.id} size={54} showAura={false} />
                    </div>

                    {/* Skin Name */}
                    <div className="font-display text-[11px] font-black text-[#2C1810] truncate w-full">
                      {skin.name}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-1 w-full">
                      {sEquipped ? (
                        <span className="inline-block w-full rounded-lg bg-[#22c55e] py-0.5 text-center font-display text-[9px] font-black text-white">
                          ✓ EQUIPPED
                        </span>
                      ) : sOwned.unlocked ? (
                        <span className="inline-block w-full rounded-lg bg-[#fed7aa] py-0.5 text-center font-display text-[9px] font-black text-[#7c2d12]">
                          {sOwned.copies > 0 ? `+${sOwned.copies} Copies` : 'Owned'}
                        </span>
                      ) : (
                        <span className="inline-block w-full rounded-lg bg-[#e2e8f0] py-0.5 text-center font-display text-[9px] font-extrabold text-[#64748b]">
                          {skin.unlockMethod.split(' ')[0]}...
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
