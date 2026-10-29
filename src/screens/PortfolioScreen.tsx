import { useState } from 'react'
import {
  TrendingUp,
  Lock,
  Check,
  ArrowUpCircle,
  X,
  Shield,
  Sparkles,
  Flame,
} from 'lucide-react'
import type { OwnedCoin, RelicConfig } from '../types/game.types'
import { COINS, COIN_MAP, RARITY_ORDER } from '../config/coins.config'
import { RELICS, RELIC_MAP } from '../config/relics.config'
import { FUSION_REQUIRED_COPIES, MAX_EQUIPPED_RELICS, levelUpCost } from '../config/economy.config'
import { coinDamageMultiplier, nextRarity, rarityIndex } from '../engine/economy'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtNum } from '../engine/format'
import { useMetaStore } from '../state/useMetaStore'
import { DynamicIcon } from '../components/DynamicIcon'
import {
  TopCurrencyBar,
  CoinMascotSvg,
  CoinGridCard,
  RARITY_CARD_THEMES,
} from '../components/GameArtwork'

export function PortfolioScreen() {
  const meta = useMetaStore()
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null)
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null)
  const [selectedRelic, setSelectedRelic] = useState<RelicConfig | null>(null)

  const globalYield = meta.getGlobalYield()
  const masteryBonusPct = ((globalYield - 1) * 100).toFixed(1)

  const forgeableStacks = meta.ownedCoins.filter(
    (c) => c.count >= FUSION_REQUIRED_COPIES && nextRarity(c.rarity) !== null,
  )

  const stacksForCoin = selectedCoinId
    ? meta.ownedCoins
        .filter((c) => c.coinId === selectedCoinId)
        .sort((a, b) => rarityIndex(b.rarity) - rarityIndex(a.rarity))
    : []

  const activeStack: OwnedCoin | null =
    stacksForCoin.find((s) => s.id === selectedStackId) ?? stacksForCoin[0] ?? null
  const activeCfg = selectedCoinId ? COIN_MAP[selectedCoinId] : null

  const handleOpenCoin = (coinId: string) => {
    const owned = meta.ownedCoins
      .filter((c) => c.coinId === coinId)
      .sort((a, b) => rarityIndex(b.rarity) - rarityIndex(a.rarity))
    if (owned.length === 0) return
    setSelectedCoinId(coinId)
    setSelectedStackId(owned[0].id)
  }

  const handleOneTapForge = (stack: OwnedCoin) => {
    const targetRarity = nextRarity(stack.rarity)
    if (!targetRarity) return
    AudioSynth.unlock()
    if (meta.fuseCoins(stack.coinId, stack.rarity)) {
      AudioSynth.playChestOpen()
    }
  }

  const handleAutoForgeAll = () => {
    AudioSynth.unlock()
    const count = meta.fuseAllAvailable()
    if (count > 0) {
      AudioSynth.playChestOpen()
    }
  }

  const handleEquipOrUnequipCoin = (stack: OwnedCoin) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    const existingSlot = meta.equippedCoinIds.indexOf(stack.id)
    if (existingSlot >= 0) {
      meta.unequipCoin(existingSlot)
      return
    }
    let targetSlot = -1
    for (let i = 0; i < meta.unlockedSlots; i++) {
      if (!meta.equippedCoinIds[i]) {
        targetSlot = i
        break
      }
    }
    if (targetSlot === -1) targetSlot = meta.unlockedSlots - 1
    meta.equipCoin(targetSlot, stack.id)
  }

  const handleLevelUp = (stack: OwnedCoin) => {
    AudioSynth.unlock()
    if (meta.levelUpCoin(stack.id)) {
      AudioSynth.playGreenCandle()
    }
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

      {/* Global Portfolio Mastery Yield & 1-Tap Auto-Forge Header */}
      <div className="flex items-center justify-between gap-2 rounded-3xl arcade-card px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-[#422006] shadow">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-[11px] font-black uppercase tracking-wider text-[#9a3412]">
              Portfolio Mastery
            </div>
            <div className="text-xs font-bold text-[#422006]">
              <span className="font-display text-sm font-black text-[#16a34a]">
                +{masteryBonusPct}%
              </span>{' '}
              Seed Capital
            </div>
          </div>
        </div>

        {forgeableStacks.length > 0 ? (
          <button
            type="button"
            onClick={handleAutoForgeAll}
            className="flex items-center gap-1 rounded-2xl px-3 py-2 font-display text-xs font-black btn-3d-gold game-text-outline-sm animate-pulse active:translate-y-0.5"
          >
            <Flame className="h-4 w-4 fill-current" />
            <span>FORGE ALL ({forgeableStacks.length})</span>
          </button>
        ) : (
          <div className="rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] px-3 py-1 text-right">
            <div className="text-[9px] font-black uppercase text-[#9a3412]">Total Lv</div>
            <div className="font-display text-sm font-black text-[#422006]">
              {meta.ownedCoins.reduce((sum, c) => sum + c.level, 0)}
            </div>
          </div>
        )}
      </div>

      {/* Active Loadout: 4 Wallet Slots & 5 Relic Slots */}
      <div className="flex flex-col gap-2 rounded-3xl arcade-card p-3">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#422006]">
          <span>💼 Active Wallet Loadout ({meta.unlockedSlots}/4)</span>
          <span className="text-[10px] font-bold text-[#9a3412]">Tap slot to unequip</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((slot) => {
            const unlocked = slot < meta.unlockedSlots
            const stackId = unlocked ? meta.equippedCoinIds[slot] : null
            const stack = stackId ? meta.ownedCoins.find((c) => c.id === stackId) : null
            const cfg = stack ? COIN_MAP[stack.coinId] : null

            if (!unlocked) {
              return (
                <div
                  key={slot}
                  className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#b45309]/50 bg-[#ffedd5]/75 text-[#9a3412]"
                >
                  <Lock className="h-4 w-4" />
                  <span className="font-display text-[9px] font-black">
                    Stage {slot === 1 ? 1 : slot === 2 ? 3 : 6}
                  </span>
                </div>
              )
            }

            if (!stack || !cfg) {
              return (
                <div
                  key={slot}
                  className="flex h-20 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b45309]/60 bg-[#ffedd5]/60 font-display text-[10px] font-black text-[#9a3412]"
                >
                  EMPTY
                </div>
              )
            }

            const theme = RARITY_CARD_THEMES[stack.rarity]

            return (
              <button
                key={slot}
                type="button"
                onClick={() => meta.unequipCoin(slot)}
                className={`relative flex h-20 flex-col items-center justify-between rounded-2xl p-1.5 transition active:translate-y-0.5 ${theme.cardBg} border-2 border-[#422006] border-b-4`}
              >
                <span className="self-start rounded-md bg-black/55 px-1.5 py-0.2 font-display text-[9px] font-black text-white game-text-outline-sm">
                  Lv.{stack.level}
                </span>
                <CoinMascotSvg coin={cfg} size={34} />
                <span className="w-full truncate font-display text-[10px] font-black text-white game-text-outline-sm">
                  {cfg.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* 5 Active Relic Slots */}
        <div className="mt-0.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#422006]">
          <span>
            ⚡ Equipped Algo Relics ({meta.equippedRelicIds.length}/{MAX_EQUIPPED_RELICS})
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: MAX_EQUIPPED_RELICS }).map((_, idx) => {
            const relicId = meta.equippedRelicIds[idx]
            const relic = relicId ? RELIC_MAP[relicId] : null
            if (!relic) {
              return (
                <div
                  key={idx}
                  className="flex h-12 items-center justify-center rounded-xl border-2 border-dashed border-[#b45309]/50 bg-[#ffedd5]/65 font-display text-sm font-black text-[#9a3412]"
                >
                  +
                </div>
              )
            }
            const theme = RARITY_CARD_THEMES[relic.rarity]
            return (
              <button
                key={relic.id}
                type="button"
                onClick={() => meta.unequipRelic(relic.id)}
                className={`flex h-12 flex-col items-center justify-center rounded-xl p-1 transition active:translate-y-0.5 ${theme.cardBg} border-2 border-[#422006] border-b-4`}
                title={relic.name}
              >
                <DynamicIcon name={relic.icon} className="h-4 w-4 text-white drop-shadow" />
                <span className="w-full truncate text-center font-display text-[8px] font-black text-white game-text-outline-sm">
                  {relic.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Merged Coin Collection & 1-Tap Forge Roster */}
      <div className="flex flex-col gap-2 rounded-3xl arcade-card p-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-black uppercase tracking-wider text-[#422006]">
            🪙 Coin Roster &amp; 3/3 Forge ({new Set(meta.ownedCoins.map((c) => c.coinId)).size}/15)
          </span>
          <span className="rounded-full border border-[#b45309] bg-[#fde047] px-2 py-0.5 font-display text-[10px] font-black text-[#422006]">
            3/3 Stacks Show 🔥 Forge
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {COINS.map((cfg) => {
            const stacks = meta.ownedCoins
              .filter((c) => c.coinId === cfg.id)
              .sort((a, b) => rarityIndex(b.rarity) - rarityIndex(a.rarity))
            // Prefer showing a forgeable 3/3 stack on the card if one exists so 1-tap Forge is immediately accessible
            const forgeable = stacks.find(
              (s) => s.count >= FUSION_REQUIRED_COPIES && nextRarity(s.rarity) !== null,
            )
            const displayStack = forgeable ?? stacks[0] ?? null
            const isEquipped = stacks.some((s) => meta.equippedCoinIds.includes(s.id))

            return (
              <CoinGridCard
                key={cfg.id}
                coin={cfg}
                stack={displayStack}
                totalCopies={displayStack?.count ?? 0}
                isEquipped={isEquipped}
                onClick={() => handleOpenCoin(cfg.id)}
                onForge={forgeable ? () => handleOneTapForge(forgeable) : undefined}
              />
            )
          })}
        </div>
      </div>

      {/* Grid of All 12 Algo Relics */}
      <div className="flex flex-col gap-2 rounded-3xl arcade-card p-3 pb-3.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-black uppercase tracking-wider text-[#422006]">
            🔮 Algo Relics ({meta.ownedRelics.length}/12)
          </span>
          <span className="text-[10px] font-bold text-[#9a3412]">Passive combat triggers</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {RELICS.map((relic) => {
            const owned = meta.ownedRelics.includes(relic.id)
            const equipped = meta.equippedRelicIds.includes(relic.id)
            const theme = RARITY_CARD_THEMES[relic.rarity]

            if (!owned) {
              return (
                <div
                  key={relic.id}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-[#b45309]/40 border-b-4 border-b-[#78350f]/50 bg-[#ffedd5]/80 p-2.5 opacity-75"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#78350f]/15 text-[#78350f]">
                    <DynamicIcon name={relic.icon} className="h-5 w-5" />
                  </div>
                  <span className="w-full truncate text-center font-display text-[10px] font-bold text-[#78350f]">
                    {relic.name}
                  </span>
                </div>
              )
            }

            return (
              <button
                key={relic.id}
                type="button"
                onClick={() => setSelectedRelic(relic)}
                className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 transition active:translate-y-0.5 ${theme.cardBg} border-2 border-[#422006] border-b-4`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-black/35 text-white shadow">
                  <DynamicIcon name={relic.icon} className="h-5 w-5" />
                </div>
                <span className="w-full truncate text-center font-display text-[10px] font-black text-white game-text-outline-sm">
                  {relic.name}
                </span>
                {equipped && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#14532d] bg-[#4ade80] text-[#052e16] shadow">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Coin Detail & Forge Drawer Modal */}
      {activeCfg && activeStack && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedCoinId(null)}
        >
          <div
            className="flex w-full max-w-[430px] flex-col gap-3 rounded-t-3xl border-t-[4px] border-[#78350f] bg-[#fff6e6] p-4 text-[#422006] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CoinMascotSvg coin={activeCfg} size={56} />
                <div>
                  <h3 className="font-display text-lg font-black text-[#422006]">
                    {activeCfg.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="rounded-full border border-[#78350f] bg-[#fde047] px-2 py-0.5 font-display text-[10px] font-black uppercase text-[#422006]">
                      {RARITY_CARD_THEMES[activeStack.rarity].label}
                    </span>
                    <span className="text-[#422006]">
                      Lv.{activeStack.level}/{activeCfg.maxLevel}
                    </span>
                    <span className="text-[#9a3412]">· {activeStack.count}/3 Copies</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCoinId(null)}
                className="rounded-xl border-2 border-[#78350f] bg-[#ffedd5] p-1.5 text-[#422006]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rarity Stack Selector if player owns multiple tiers of this coin */}
            {stacksForCoin.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {stacksForCoin.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStackId(st.id)}
                    className={`rounded-xl border-2 px-3 py-1 font-display text-xs font-black uppercase ${
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

            {/* Stats & Passive */}
            <div className="rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] p-3 text-xs">
              <div className="flex justify-between font-display font-black text-[#422006]">
                <span>Speed: {activeCfg.baseTickSpeed}s</span>
                <span className="text-[#16a34a]">
                  Power: {coinDamageMultiplier(activeStack).toFixed(2)}x
                </span>
                <span className="text-[#b45309]">
                  Mastery: +{(activeCfg.globalMasteryBonusPerLevel * 100).toFixed(1)}%/Lv
                </span>
              </div>
              {activeCfg.passives.map((p) => (
                <div key={p.id} className="mt-2 border-t border-[#b45309]/30 pt-2">
                  <div className="flex items-center gap-1 font-display text-xs font-black text-[#7e22ce]">
                    <Sparkles className="h-3.5 w-3.5" /> {p.name}
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#422006]">{p.description}</p>
                </div>
              ))}
            </div>

            {/* Tactile 3D Action Buttons + 1-Tap Forge inside Drawer */}
            {(() => {
              const isEquipped = meta.equippedCoinIds.includes(activeStack.id)
              const cost = levelUpCost(activeStack.level, activeStack.rarity)
              const canLevel =
                activeStack.level < activeCfg.maxLevel && meta.hashrate >= cost
              const canForgeStack =
                activeStack.count >= FUSION_REQUIRED_COPIES &&
                nextRarity(activeStack.rarity) !== null

              return (
                <div className="flex flex-col gap-2">
                  {canForgeStack && (
                    <button
                      type="button"
                      onClick={() => handleOneTapForge(activeStack)}
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
                      onClick={() => handleEquipOrUnequipCoin(activeStack)}
                      className={`rounded-2xl py-3 font-display text-xs font-black game-text-outline-sm ${
                        isEquipped ? 'btn-3d-red' : 'btn-3d-green'
                      }`}
                    >
                      {isEquipped ? 'UNEQUIP WALLET' : 'EQUIP TO WALLET'}
                    </button>

                    <button
                      type="button"
                      disabled={!canLevel}
                      onClick={() => handleLevelUp(activeStack)}
                      className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black ${
                        canLevel
                          ? 'btn-3d-cyan game-text-outline-sm'
                          : 'cursor-not-allowed border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c]'
                      }`}
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                      {activeStack.level >= activeCfg.maxLevel
                        ? 'MAX LEVEL'
                        : `LEVEL UP (${fmtNum(cost)})`}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Relic Detail Drawer */}
      {selectedRelic && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedRelic(null)}
        >
          <div
            className="flex w-full max-w-[430px] flex-col gap-3 rounded-t-3xl border-t-[4px] border-[#78350f] bg-[#fff6e6] p-4 text-[#422006] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#422006] bg-gradient-to-b from-[#a855f7] to-[#6b21a8] text-white shadow">
                  <DynamicIcon name={selectedRelic.icon} className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-black text-[#422006]">
                    {selectedRelic.name}
                  </h3>
                  <span className="font-display text-xs font-black uppercase text-[#7e22ce]">
                    {selectedRelic.rarity} Relic
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRelic(null)}
                className="rounded-xl border-2 border-[#78350f] bg-[#ffedd5] p-1.5 text-[#422006]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] p-3 text-xs font-bold text-[#422006]">
              {selectedRelic.description}
            </p>

            {(() => {
              const equipped = meta.equippedRelicIds.includes(selectedRelic.id)
              return (
                <button
                  type="button"
                  onClick={() => {
                    if (equipped) meta.unequipRelic(selectedRelic.id)
                    else meta.equipRelic(selectedRelic.id)
                    setSelectedRelic(null)
                  }}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black game-text-outline-sm ${
                    equipped ? 'btn-3d-red' : 'btn-3d-purple'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  {equipped ? 'UNEQUIP RELIC' : 'EQUIP RELIC'}
                </button>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export { RARITY_ORDER }
