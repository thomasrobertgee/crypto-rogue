import { useState } from 'react'
import { Shield, Zap, Sparkles, Check, Lock } from 'lucide-react'
import { HEROES, heroLevelUpCost, type HeroId } from '../config/heroes.config'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtNum } from '../engine/format'
import { useMetaStore } from '../state/useMetaStore'
import {
  TopCurrencyBar,
  HashrateIcon,
  SatoshiGemIcon,
  RARITY_CARD_THEMES,
} from '../components/GameArtwork'
import { HeroChibiSvg, StageLandscapeSvg, RedAlertBadge } from '../components/WorldDioramaArt'

export function HeroesScreen() {
  const meta = useMetaStore()
  const ownedHeroes = meta.ownedHeroes ?? { rookie_satoshi: 1 }
  const equippedHeroId = meta.equippedHeroId ?? 'rookie_satoshi'

  const [selectedId, setSelectedId] = useState<HeroId>(equippedHeroId)

  const selectedHero = HEROES.find((h) => h.id === selectedId) ?? HEROES[0]
  const ownedLevel = ownedHeroes[selectedHero.id] ?? 0
  const isOwned = ownedLevel > 0
  const isEquipped = equippedHeroId === selectedHero.id

  const upgradeHashrateCost = heroLevelUpCost(Math.max(1, ownedLevel), selectedHero.rarity)
  const upgradeGemsCost = Math.max(40, Math.round(upgradeHashrateCost / 4))
  const canUpgradeHashrate = isOwned && meta.hashrate >= upgradeHashrateCost
  const canUpgradeGems = isOwned && meta.gems >= upgradeGemsCost
  const canUnlockGems = !isOwned && meta.gems >= selectedHero.unlockGemsCost

  const handleGemLevelUp = (heroId: HeroId) => {
    const lvl = ownedHeroes[heroId] ?? 0
    if (!lvl) return
    const hCfg = HEROES.find((h) => h.id === heroId)
    if (!hCfg) return
    const gemCost = Math.max(40, Math.round(heroLevelUpCost(lvl, hCfg.rarity) / 4))
    if (meta.gems < gemCost) return
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    useMetaStore.setState((s) => ({
      gems: s.gems - gemCost,
      ownedHeroes: { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }), [heroId]: lvl + 1 },
    }))
    meta.incrementDailyMetric('coinsLeveled', 1)
  }

  return (
    <div className="relative flex h-full w-full flex-col gap-2.5 overflow-y-auto arcade-screen-bg p-3">
      {/* Top 3D Bubble Resource Bar */}
      <TopCurrencyBar
        hashrate={meta.hashrate}
        gems={meta.gems}
        silverKeys={meta.silverKeys}
        quantumKeys={meta.quantumKeys}
        isVipAdFree={meta.isVipAdFree}
      />

      {/* Hero Stage Diorama Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] shadow-lg">
        {/* Sunlit 2D Valley Backdrop inside the Hero Stage */}
        <div className="relative flex h-44 w-full flex-col items-center justify-between overflow-hidden border-b-[3px] border-[#78350f] p-2.5">
          <div className="absolute inset-0 z-0">
            <StageLandscapeSvg stage={meta.currentStage} mode="battle" />
          </div>

          {/* Top Badges over the Sunlit Sky */}
          <div className="relative z-10 flex w-full items-center justify-between">
            <span className="rounded-full border-2 border-[#78350f] bg-[#fde047] px-2.5 py-0.5 font-display text-[10px] font-black uppercase text-[#422006] shadow">
              {selectedHero.rarity} Commander
            </span>
            <div className="flex items-center gap-1.5">
              {isOwned && (
                <span className="rounded-full border-2 border-[#78350f] bg-[#fff6e6] px-2.5 py-0.5 font-display text-xs font-black text-[#422006] shadow">
                  Lv.{ownedLevel}
                </span>
              )}
              {isEquipped && (
                <span className="flex items-center gap-1 rounded-full border-2 border-[#14532d] bg-[#4ade80] px-2.5 py-0.5 font-display text-[10px] font-black text-white game-text-outline-sm shadow">
                  <Check className="h-3 w-3 stroke-[3]" /> ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Center Animated Chibi Hero */}
          <div className="relative z-10 -my-2">
            <HeroChibiSvg heroId={selectedHero.id} size={118} />
          </div>

          {/* Hero Name Banner */}
          <div className="relative z-10 rounded-full border-2 border-[#78350f] bg-[#fff6e6]/95 px-4 py-0.5 shadow">
            <span className="font-display text-sm font-black text-[#422006]">
              {selectedHero.name}
            </span>
            <span className="ml-1.5 font-display text-[10px] font-bold text-[#9a3412]">
              • {selectedHero.title}
            </span>
          </div>
        </div>

        {/* Cream & Wood Skill Inspection Panel */}
        <div className="flex flex-col gap-2 p-3">
          <div className="grid grid-cols-1 gap-2">
            {/* Passive Aura Box */}
            <div className="flex items-start gap-2.5 rounded-2xl border-2 border-[#b45309] border-b-4 bg-[#ffedd5] p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#78350f] bg-[#fde047] text-[#422006] shadow">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] font-black uppercase text-[#9a3412]">
                    Passive Aura • {selectedHero.passiveName}
                  </span>
                  <span className="rounded-full bg-[#22c55e]/20 px-1.5 py-0.2 font-display text-[10px] font-black text-[#15803d]">
                    +{Math.max(0, ownedLevel - 1) * 5}% Lv Boost
                  </span>
                </div>
                <p className="text-xs font-bold text-[#422006] leading-snug">
                  {selectedHero.passiveDesc}
                </p>
              </div>
            </div>

            {/* Active Battle Skill Box */}
            <div className="flex items-start gap-2.5 rounded-2xl border-2 border-[#0369a1] border-b-4 bg-[#e0f2fe] p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#0c4a6e] bg-[#38bdf8] text-white shadow">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] font-black uppercase text-[#0369a1]">
                    Active Skill • {selectedHero.activeSkillName}
                  </span>
                  <span className="font-display text-[10px] font-black text-[#0284c7]">
                    Every {selectedHero.skillChargeTicks} Ticks
                  </span>
                </div>
                <p className="text-xs font-bold text-[#0c4a6e] leading-snug">
                  {selectedHero.activeSkillDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Equip / Level Up with Hashrate / Level Up with Gems / Unlock */}
          {isOwned ? (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                disabled={isEquipped}
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  meta.equipHero(selectedHero.id)
                }}
                className={`rounded-2xl py-2.5 font-display text-xs font-black uppercase ${
                  isEquipped
                    ? 'border-2 border-[#78350f]/40 bg-[#fed7aa] text-[#78350f] cursor-default'
                    : 'btn-3d-indigo game-text-outline-sm active:translate-y-0.5'
                }`}
              >
                {isEquipped ? '✓ Equipped' : 'Equip'}
              </button>

              <button
                type="button"
                disabled={!canUpgradeHashrate}
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  meta.levelUpHero(selectedHero.id)
                }}
                className={`flex flex-col items-center justify-center rounded-2xl py-1.5 font-display text-[11px] font-black ${
                  canUpgradeHashrate
                    ? 'btn-3d-green game-text-outline-sm active:translate-y-0.5'
                    : 'border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c] opacity-70 cursor-not-allowed'
                }`}
              >
                <span>LEVEL UP</span>
                <span className="inline-flex items-center gap-1 text-[10px]">
                  <HashrateIcon size={11} /> {fmtNum(upgradeHashrateCost)}
                </span>
              </button>

              <button
                type="button"
                disabled={!canUpgradeGems}
                onClick={() => handleGemLevelUp(selectedHero.id)}
                className={`flex flex-col items-center justify-center rounded-2xl py-1.5 font-display text-[11px] font-black ${
                  canUpgradeGems
                    ? 'btn-3d-gold game-text-outline-sm active:translate-y-0.5'
                    : 'border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c] opacity-70 cursor-not-allowed'
                }`}
              >
                <span>GEM UPGRADE</span>
                <span className="inline-flex items-center gap-1 text-[10px]">
                  <SatoshiGemIcon size={11} /> {upgradeGemsCost}
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!canUnlockGems}
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playChestOpen()
                meta.unlockHero(selectedHero.id)
              }}
              className={`mt-1 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-display text-sm font-black uppercase ${
                canUnlockGems
                  ? 'btn-3d-gold game-text-outline active:translate-y-0.5'
                  : 'border-2 border-[#78350f]/40 bg-[#e7e5e4] text-[#78716c] cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Recruit {selectedHero.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 text-xs text-white">
                <SatoshiGemIcon size={12} /> {selectedHero.unlockGemsCost}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Collectible Trader Hero Roster Grid */}
      <div className="rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] p-3 shadow-md">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-xs font-black uppercase tracking-wider text-[#422006]">
            🦸 Collectible Hero Squad ({Object.keys(ownedHeroes).length}/{HEROES.length})
          </span>
          <span className="rounded-full border border-[#b45309] bg-[#fde047] px-2 py-0.5 font-display text-[10px] font-black text-[#422006]">
            Tap Card to Inspect
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {HEROES.map((h) => {
            const lvl = ownedHeroes[h.id] ?? 0
            const owned = lvl > 0
            const active = selectedId === h.id
            const eq = equippedHeroId === h.id
            const hCost = heroLevelUpCost(Math.max(1, lvl), h.rarity)
            const hasNotif = owned
              ? meta.hashrate >= hCost
              : meta.gems >= h.unlockGemsCost
            const theme = RARITY_CARD_THEMES[h.rarity]

            return (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedId(h.id)}
                className={`relative flex flex-col items-center rounded-2xl p-2.5 text-center transition-all active:scale-95 ${
                  theme.cardBg
                } border-[2.5px] border-[#422006] border-b-[5px] ${
                  active ? 'ring-3 ring-[#fde047] -translate-y-0.5 shadow-xl' : 'shadow-md'
                }`}
              >
                {hasNotif && <RedAlertBadge className="-top-1.5 -right-1.5" />}

                <div className="flex w-full items-center justify-between">
                  <span className="rounded-lg border border-black/40 bg-black/55 px-1.5 py-0.5 font-display text-[10px] font-black text-white game-text-outline-sm">
                    {owned ? `Lv.${lvl}` : 'LOCKED'}
                  </span>
                  {eq ? (
                    <span className="rounded-full border border-white bg-[#22c55e] px-2 py-0.2 font-display text-[9px] font-black text-white game-text-outline-sm">
                      ACTIVE
                    </span>
                  ) : !owned ? (
                    <Lock className="h-3.5 w-3.5 text-white/75" />
                  ) : null}
                </div>

                <div className={owned ? 'my-0.5' : 'my-0.5 grayscale opacity-75'}>
                  <HeroChibiSvg heroId={h.id} size={74} />
                </div>

                <div className="font-display text-xs font-black text-white game-text-outline-sm">
                  {h.name}
                </div>
                <div className="text-[10px] font-bold text-amber-200 truncate w-full">
                  {h.passiveName}
                </div>

                <div className="mt-1.5 w-full rounded-xl border border-black/40 bg-black/40 py-1 font-display text-[10px] font-black text-white game-text-outline-sm">
                  {owned ? `⚡ ${h.activeSkillName}` : `💎 ${h.unlockGemsCost} Gems`}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
