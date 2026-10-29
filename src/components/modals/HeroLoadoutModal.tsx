import React, { useState } from 'react'
import { HEROES, heroLevelUpCost, type HeroId } from '../../config/heroes.config'
import { useMetaStore } from '../../state/useMetaStore'
import { HeroChibiSvg } from '../WorldDioramaArt'
import { HashrateIcon, SatoshiGemIcon } from '../GameArtwork'

interface HeroLoadoutModalProps {
  open: boolean
  onClose: () => void
}

const RARITY_BADGE_STYLE: Record<string, string> = {
  common: 'bg-slate-600 text-white border-slate-800',
  rare: 'bg-sky-500 text-white border-sky-800',
  epic: 'bg-purple-600 text-white border-purple-900',
  mythical: 'bg-amber-400 text-[#422006] border-amber-800',
}

export const HeroLoadoutModal: React.FC<HeroLoadoutModalProps> = ({ open, onClose }) => {
  const ownedHeroes = useMetaStore((s) => s.ownedHeroes) ?? { rookie_satoshi: 1 }
  const equippedHeroId = useMetaStore((s) => s.equippedHeroId) ?? 'rookie_satoshi'
  const gems = useMetaStore((s) => s.gems)
  const hashrate = useMetaStore((s) => s.hashrate)
  const equipHero = useMetaStore((s) => s.equipHero)
  const unlockHero = useMetaStore((s) => s.unlockHero)
  const levelUpHero = useMetaStore((s) => s.levelUpHero)

  const [selectedId, setSelectedId] = useState<HeroId>(equippedHeroId)
  const [toast, setToast] = useState<string | null>(null)

  if (!open) return null

  const hero = HEROES.find((h) => h.id === selectedId) ?? HEROES[0]
  const ownedLevel = ownedHeroes[hero.id] ?? 0
  const isOwned = ownedLevel > 0
  const isEquipped = equippedHeroId === hero.id
  const upgradeCost = heroLevelUpCost(Math.max(1, ownedLevel), hero.rarity)
  const canAffordUpgrade = isOwned && hashrate >= upgradeCost
  const canAffordUnlock = !isOwned && gems >= hero.unlockGemsCost

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[395px] rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] shadow-2xl overflow-hidden text-[#422006]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner */}
        <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#fde047] via-[#fcd34d] to-[#fbbf24] border-b-[3px] border-[#78350f]">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#78350f]">
              Trader Commander Roster
            </div>
            <h2 className="font-display font-black text-lg tracking-wide text-white game-text-outline-sm">
              COLLECTIBLE HEROES
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-full bg-[#fff6e6] border-2 border-[#78350f] px-2 py-0.5 text-xs font-display font-black text-[#422006]">
              <HashrateIcon size={13} />
              <span>{Math.floor(hashrate).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-[#fff6e6] border-2 border-[#78350f] px-2 py-0.5 text-xs font-display font-black text-[#422006]">
              <SatoshiGemIcon size={13} />
              <span>{gems.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-[#78350f] bg-[#fff6e6] flex items-center justify-center font-black text-sm text-[#422006]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Hero Showcase Stage */}
        <div className="relative px-4 pt-3 pb-4 flex flex-col items-center bg-[radial-gradient(circle_at_50%_35%,rgba(250,204,21,0.35),transparent_70%)]">
          {toast && (
            <div className="absolute top-2 z-20 rounded-full bg-[#4ade80] border-2 border-[#14532d] px-3 py-0.5 text-xs font-display font-black text-white game-text-outline-sm shadow-lg animate-bounce">
              {toast}
            </div>
          )}

          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-display font-black uppercase border-2 ${
                RARITY_BADGE_STYLE[hero.rarity] ?? RARITY_BADGE_STYLE.common
              }`}
            >
              {hero.rarity}
            </span>
            {isOwned && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#fde047] border-2 border-[#78350f] text-[#422006] text-xs font-display font-black">
                Lv.{ownedLevel}
              </span>
            )}
            {isEquipped && (
              <span className="px-2 py-0.5 rounded-full bg-[#4ade80] border-2 border-[#14532d] text-white game-text-outline-sm text-[10px] font-display font-black uppercase">
                ★ Active Commander
              </span>
            )}
          </div>

          <h3 className="font-display font-black text-xl text-white game-text-outline">
            {hero.name}
          </h3>
          <p className="text-xs font-bold text-[#9a3412] mb-1">{hero.title}</p>

          {/* Animated Chibi SVG */}
          <div className="my-1 relative flex items-center justify-center">
            <HeroChibiSvg heroId={hero.id} size={126} />
          </div>

          {/* Passive & Active Skill Cards */}
          <div className="w-full grid grid-cols-1 gap-2 mt-1">
            <div className="rounded-2xl bg-[#ffedd5] border-2 border-[#b45309] p-2.5 flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fde047] border-2 border-[#78350f] flex items-center justify-center text-lg shrink-0">
                🛡️
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#9a3412]">
                    Passive Commander Aura
                  </span>
                  <span className="text-[10px] font-display font-black text-[#16a34a]">
                    +{Math.round((Math.max(1, ownedLevel) - 1) * 5)}% Lv Bonus
                  </span>
                </div>
                <div className="font-display font-black text-xs text-[#422006]">
                  {hero.passiveName}
                </div>
                <div className="text-[11px] font-bold text-[#78350f] leading-snug">
                  {hero.passiveDesc}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#e0f2fe] border-2 border-[#0369a1] p-2.5 flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#38bdf8] border-2 border-[#0c4a6e] flex items-center justify-center text-lg shrink-0">
                ⚡
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0369a1]">
                    Active Battle Skill
                  </span>
                  <span className="text-[10px] font-black text-[#0284c7]">
                    Every {hero.skillChargeTicks} ticks
                  </span>
                </div>
                <div className="font-display font-black text-xs text-[#0c4a6e]">
                  {hero.activeSkillName}
                </div>
                <div className="text-[11px] font-bold text-[#0369a1] leading-snug">
                  {hero.activeSkillDesc}
                </div>
              </div>
            </div>
          </div>

          {/* 4-Hero Selector Strip */}
          <div className="grid grid-cols-4 gap-2 w-full mt-3">
            {HEROES.map((h) => {
              const lvl = ownedHeroes[h.id] ?? 0
              const active = selectedId === h.id
              const eq = equippedHeroId === h.id
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedId(h.id)}
                  className={`relative rounded-2xl p-1.5 flex flex-col items-center transition-all border-2 ${
                    active
                      ? 'bg-[#fde047] border-[#78350f] scale-105 shadow-md'
                      : 'bg-[#ffedd5] border-[#b45309]/50 opacity-85 hover:opacity-100'
                  }`}
                >
                  {eq && (
                    <span className="absolute -top-1.5 -left-1.5 z-10 px-1.5 py-0.2 rounded-full bg-[#22c55e] border border-[#14532d] text-[8px] font-display font-black text-white">
                      EQ
                    </span>
                  )}
                  <div className={lvl === 0 ? 'grayscale opacity-65' : ''}>
                    <HeroChibiSvg heroId={h.id} size={48} />
                  </div>
                  <div className="text-[10px] font-display font-black text-[#422006] truncate w-full text-center mt-0.5">
                    {h.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] font-black text-[#9a3412]">
                    {lvl > 0 ? `Lv.${lvl}` : `🔒 ${h.unlockGemsCost}`}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full mt-3.5">
            {isOwned ? (
              <>
                <button
                  disabled={isEquipped}
                  onClick={() => {
                    if (equipHero(hero.id)) {
                      triggerToast(`${hero.name} Equipped!`)
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider ${
                    isEquipped
                      ? 'bg-[#e7e5e4] text-[#78716c] border-2 border-[#78350f]/30 cursor-default'
                      : 'btn-3d-indigo game-text-outline-sm'
                  }`}
                >
                  {isEquipped ? '✓ Equipped' : 'Equip Hero'}
                </button>
                <button
                  disabled={!canAffordUpgrade}
                  onClick={() => {
                    if (levelUpHero(hero.id)) {
                      triggerToast(`${hero.name} Leveled Up to Lv.${ownedLevel + 1}!`)
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    canAffordUpgrade
                      ? 'btn-3d-green game-text-outline-sm'
                      : 'bg-[#e7e5e4] text-[#78716c] border-2 border-[#78350f]/30 opacity-70 cursor-not-allowed'
                  }`}
                >
                  <span>Level Up</span>
                  <span className="inline-flex items-center gap-0.5 bg-black/25 px-1.5 py-0.5 rounded-lg text-[11px] text-white">
                    <HashrateIcon size={11} />
                    {upgradeCost}
                  </span>
                </button>
              </>
            ) : (
              <button
                disabled={!canAffordUnlock}
                onClick={() => {
                  if (unlockHero(hero.id)) {
                    triggerToast(`Unlocked ${hero.name}!`)
                  }
                }}
                className={`w-full py-3 rounded-2xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 ${
                  canAffordUnlock
                    ? 'btn-3d-gold game-text-outline'
                    : 'bg-[#e7e5e4] text-[#78716c] border-2 border-[#78350f]/30 opacity-70 cursor-not-allowed'
                }`}
              >
                <span>Recruit {hero.name}</span>
                <span className="inline-flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-lg text-xs text-white">
                  <SatoshiGemIcon size={12} />
                  {hero.unlockGemsCost}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
