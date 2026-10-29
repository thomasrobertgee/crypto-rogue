import { useState } from 'react'
import {
  Gem,
  Key,
  Sparkles,
  Tv,
  Check,
  TrendingUp,
  Lock,
} from 'lucide-react'
import { COIN_MAP } from '../config/coins.config'
import { RELIC_MAP } from '../config/relics.config'
import { HERO_MAP } from '../config/heroes.config'
import { SHOP_BUNDLES, DUPLICATE_RELIC_HASHRATE } from '../config/economy.config'
import { RELAY_CHAIN_STEPS } from '../config/relayChain.config'
import {
  MINING_SUBSCRIPTIONS,
  OTC_DEAL_TIERS,
  type OtcDealTier,
  type OtcDealOption,
} from '../config/monetizationLiveOps.config'
import { AudioSynth } from '../engine/AudioSynth'
import { showRewardedAd } from '../services/ads'
import { useMetaStore, type GachaResult } from '../state/useMetaStore'
import { DynamicIcon } from '../components/DynamicIcon'
import {
  TopCurrencyBar,
  VaultBannerArtSvg,
  CoinMascotSvg,
  RARITY_CARD_THEMES,
} from '../components/GameArtwork'
import { HeroChibiSvg } from '../components/WorldDioramaArt'

export function ExchangeShopScreen() {
  const meta = useMetaStore()
  const [chestResults, setChestResults] = useState<GachaResult[] | null>(null)
  const [revealedIndices, setRevealedIndices] = useState<number[]>([])
  const [adPullLoading, setAdPullLoading] = useState(false)
  const [purchaseBanner, setPurchaseBanner] = useState<string | null>(null)

  // OTC Bento Box Deal State
  const [selectedOtcTierId, setSelectedOtcTierId] = useState<string>('otc_tier_199')
  const activeOtcTier = OTC_DEAL_TIERS.find((t) => t.id === selectedOtcTierId) ?? OTC_DEAL_TIERS[0]
  const [otcSlot1, setOtcSlot1] = useState<OtcDealOption>(activeOtcTier.slot1Options[0])
  const [otcSlot2, setOtcSlot2] = useState<OtcDealOption>(activeOtcTier.slot2Options[0])
  const [otcSlot3, setOtcSlot3] = useState<OtcDealOption>(activeOtcTier.slot3Options[0])

  const handleSelectOtcTier = (tier: OtcDealTier) => {
    setSelectedOtcTierId(tier.id)
    setOtcSlot1(tier.slot1Options[0])
    setOtcSlot2(tier.slot2Options[0])
    setOtcSlot3(tier.slot3Options[0])
  }

  const handleBuyOtcDeal = () => {
    AudioSynth.unlock()
    const selections = [
      { type: otcSlot1.type, id: otcSlot1.id, amount: otcSlot1.amount },
      { type: otcSlot2.type, id: otcSlot2.id, amount: otcSlot2.amount },
      { type: otcSlot3.type, id: otcSlot3.id, amount: otcSlot3.amount },
    ]
    const ok = meta.purchaseOtcDeal(activeOtcTier.id, selections)
    if (ok) {
      AudioSynth.playMythicalDrop()
      setPurchaseBanner(`Purchased Bento OTC Box (${activeOtcTier.priceLabel})! Rewards delivered.`)
      window.setTimeout(() => setPurchaseBanner(null), 3500)
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const isTodayExchange = meta.lastDailyExchangeDate === todayStr
  const dailyExchange = isTodayExchange
    ? (meta.dailyExchangePurchases ?? {})
    : { blueprints: 0, manuals: 0, galaTickets: 0 }

  const bpBought = dailyExchange.blueprints ?? 0
  const bpRem = Math.max(0, 2 - bpBought)

  const manBought = dailyExchange.manuals ?? 0
  const manRem = Math.max(0, 3 - manBought)

  const ticBought = dailyExchange.galaTickets ?? 0
  const ticRem = Math.max(0, 1 - ticBought)

  const handleBuyExchange = (item: 'blueprints' | 'manuals' | 'galaTickets', label: string) => {
    AudioSynth.unlock()
    const ok = meta.buyDailyExchange(item)
    if (ok) {
      AudioSynth.playCoinInject()
      setPurchaseBanner(`Purchased ${label}!`)
      window.setTimeout(() => setPurchaseBanner(null), 3000)
    }
  }

  const handleClaimRelay = async (step: (typeof RELAY_CHAIN_STEPS)[0]) => {
    AudioSynth.unlock()
    if (step.costType === 'free') {
      const res = meta.claimRelayStep(step.step)
      if (res.success) {
        AudioSynth.playCoinInject()
        setPurchaseBanner(`Claimed Step ${step.step}: ${step.rewardSummary}!`)
        window.setTimeout(() => setPurchaseBanner(null), 3000)
      }
    } else if (step.costType === 'ad') {
      setAdPullLoading(true)
      const watched = await showRewardedAd(meta.isVipAdFree)
      setAdPullLoading(false)
      if (watched) {
        const res = meta.claimRelayStep(step.step)
        if (res.success) {
          AudioSynth.playCoinInject()
          setPurchaseBanner(`Claimed Step ${step.step}: ${step.rewardSummary}!`)
          window.setTimeout(() => setPurchaseBanner(null), 3000)
        }
      }
    } else {
      // IAP ($0.99 or $4.99)
      const res = meta.claimRelayStep(step.step)
      if (res.success) {
        AudioSynth.playGreenCandle()
        setPurchaseBanner(`Purchased Step ${step.step} (${step.priceLabel})! ${step.rewardSummary}`)
        window.setTimeout(() => setPurchaseBanner(null), 3500)
      }
    }
  }

  const openChestModal = (results: GachaResult[]) => {
    setChestResults(results)
    setRevealedIndices([])
    AudioSynth.playChestOpen()
    if (results.length === 1) {
      window.setTimeout(() => revealCard(0, results[0]), 280)
    }
  }

  const revealCard = (idx: number, item: GachaResult) => {
    setRevealedIndices((prev) => {
      if (prev.includes(idx)) return prev
      if (item.rarity === 'mythical' || item.rarity === 'legendary') {
        AudioSynth.playMythicalDrop()
      } else if (item.rarity === 'epic' || item.rarity === 'rare') {
        AudioSynth.playRelicTrigger()
      } else {
        AudioSynth.playGreenCandle()
      }
      return [...prev, idx]
    })
  }

  const revealAllCards = () => {
    if (!chestResults) return
    const hasHigh = chestResults.some(
      (r) => r.rarity === 'mythical' || r.rarity === 'legendary',
    )
    if (hasHigh) AudioSynth.playMythicalDrop()
    else AudioSynth.playGreenCandle()
    setRevealedIndices(chestResults.map((_, i) => i))
  }

  const handlePull = (bannerId: string, count: 1 | 10) => {
    AudioSynth.unlock()
    const res = meta.pullGacha(bannerId, count, false)
    if (res) openChestModal(res)
  }

  const handleFreeFaucetAdPull = async () => {
    AudioSynth.unlock()
    setAdPullLoading(true)
    await showRewardedAd(meta.isVipAdFree)
    setAdPullLoading(false)
    const res = meta.pullGacha('faucet_box', 1, true)
    if (res) openChestModal(res)
  }

  const handlePurchaseBundle = (bundleId: string, bundleName: string) => {
    AudioSynth.unlock()
    if (meta.purchaseBundle(bundleId)) {
      AudioSynth.playMythicalDrop()
      setPurchaseBanner(`Purchased ${bundleName}! Rewards credited.`)
      window.setTimeout(() => setPurchaseBanner(null), 3500)
    }
  }

  // Venture Capital Vault live pity calculation
  const epicRem = Math.max(1, 10 - (meta.epicPityCounter % 10))
  const mythRem = Math.max(1, 50 - (meta.mythicalPityCounter % 50))
  const epicPct = Math.max(8, ((meta.epicPityCounter % 10) / 10) * 100)
  const mythPct = Math.max(6, ((meta.mythicalPityCounter % 50) / 50) * 100)

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

      {purchaseBanner && (
        <div className="rounded-2xl border-2 border-[#22ff99] bg-[#064e3b] px-3 py-2 text-center font-display text-xs font-extrabold text-[#22ff99] shadow-lg">
          {purchaseBanner}
        </div>
      )}

      {/* GACHA TREASURE VAULT BANNERS */}
      <div className="flex flex-col gap-3">
        <div className="font-display text-sm font-extrabold tracking-wide text-[#2C1810]">
          TREASURE VAULT BANNERS
        </div>

        {/* 1. Standard Faucet Chest (Glowing Cyan Treasure Chest) */}
        <div className="flex flex-col gap-2.5 rounded-2xl border-2 border-[#38bdf8] border-b-4 border-b-[#075985] bg-gradient-to-br from-[#0c4a6e] via-[#1e293b] to-[#0f172a] p-3.5 shadow-lg">
          <div className="flex items-center gap-3">
            <VaultBannerArtSvg bannerId="faucet_vault" />
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-[#38bdf8]/25 px-2 py-0.5 font-display text-[9px] font-extrabold uppercase text-[#7dd3fc]">
                STANDARD VAULT
              </span>
              <h3 className="mt-0.5 font-display text-base font-extrabold text-white drop-shadow">
                FAUCET TREASURE CHEST
              </h3>
              <p className="text-[11px] font-semibold text-white/75">
                Common to Rare Crypto Coins · Daily Free Pull + Silver Keys
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={adPullLoading}
              onClick={handleFreeFaucetAdPull}
              className="flex items-center justify-center gap-1 rounded-xl py-2.5 font-display text-xs font-extrabold btn-3d-gold active:border-b-0 active:translate-y-1"
            >
              <Tv className="h-3.5 w-3.5" />
              {adPullLoading ? 'WAIT...' : meta.isVipAdFree ? 'FREE VIP' : 'FREE AD'}
            </button>

            <button
              type="button"
              disabled={meta.silverKeys < 1}
              onClick={() => handlePull('faucet_box', 1)}
              className="flex items-center justify-center gap-1 rounded-xl py-2.5 font-display text-xs font-extrabold btn-3d-cyan active:border-b-0 active:translate-y-1 disabled:opacity-40"
            >
              <Key className="h-3.5 w-3.5" />
              <span>1x (1)</span>
            </button>

            <button
              type="button"
              disabled={meta.silverKeys < 9}
              onClick={() => handlePull('faucet_box', 10)}
              className="flex items-center justify-center gap-1 rounded-xl py-2.5 font-display text-xs font-extrabold btn-3d-green active:border-b-0 active:translate-y-1 disabled:opacity-40"
            >
              <Key className="h-3.5 w-3.5" />
              <span>10x (9)</span>
            </button>
          </div>
        </div>

        {/* 2. Venture Capital Vault (Golden Venture Safe Overflowing with Coins + Live Pity Bars) */}
        <div className="flex flex-col gap-2.5 rounded-2xl border-2 border-[#facc15] border-b-4 border-b-[#713f12] bg-gradient-to-br from-[#78350f] via-[#3b1d5e] to-[#1e1b4b] p-3.5 shadow-[0_8px_28px_rgba(250,204,21,0.22)]">
          <div className="flex items-center gap-3">
            <VaultBannerArtSvg bannerId="vc_vault" />
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-gradient-to-r from-[#fb7185] to-[#f43f5e] px-2 py-0.5 font-display text-[9px] font-extrabold uppercase text-white shadow">
                S-GRADE MYTHICAL RATE UP
              </span>
              <h3 className="mt-0.5 font-display text-base font-extrabold text-[#fde047] drop-shadow">
                VENTURE CAPITAL SAFE
              </h3>
              <p className="text-[11px] font-semibold text-white/85">
                Uncommon to Mythical Coins (SatoshiGenesis &amp; QuantumTether)
              </p>
            </div>
          </div>

          {/* Visual Pity Progress Bars */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/15 bg-[#111626]/90 p-2.5 shadow-inner">
            <div>
              <div className="flex items-center justify-between font-display text-[10px] font-extrabold text-[#e9d5ff]">
                <span>EPIC PITY</span>
                <span className="text-[#c084fc]">IN {epicRem}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/60">
                <div
                  className="h-full bg-gradient-to-r from-[#a855f7] to-[#e879f9] transition-all"
                  style={{ width: `${epicPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between font-display text-[10px] font-extrabold text-[#fda4af]">
                <span>MYTHICAL PITY</span>
                <span className="text-[#fde047]">IN {mythRem}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/60">
                <div
                  className="h-full bg-gradient-to-r from-[#f43f5e] via-[#facc15] to-[#fde047] transition-all"
                  style={{ width: `${mythPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={meta.gems < 300 && meta.quantumKeys < 1}
              onClick={() => handlePull('vc_vault', 1)}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-display text-xs font-extrabold btn-3d-purple active:border-b-0 active:translate-y-1 disabled:opacity-40"
            >
              {meta.quantumKeys >= 1 ? (
                <>
                  <Key className="h-4 w-4 text-[#fde047]" />
                  <span>1x PULL (1 Key)</span>
                </>
              ) : (
                <>
                  <Gem className="h-4 w-4 text-[#fde047]" />
                  <span>1x PULL (300)</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={meta.gems < 2700 && meta.quantumKeys < 10}
              onClick={() => handlePull('vc_vault', 10)}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-display text-xs font-extrabold btn-3d-gold active:border-b-0 active:translate-y-1 disabled:opacity-40"
            >
              {meta.quantumKeys >= 10 ? (
                <>
                  <Key className="h-4 w-4" />
                  <span>10x PULL (10 Keys)</span>
                </>
              ) : (
                <>
                  <Gem className="h-4 w-4" />
                  <span>10x PULL (2,700)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Quantum ASIC Matrix (Purple Quantum Server Core) */}
        <div className="flex flex-col gap-2.5 rounded-2xl border-2 border-[#c084fc] border-b-4 border-b-[#3b0764] bg-gradient-to-br from-[#4c1d95] via-[#2e1065] to-[#172554] p-3.5 shadow-lg">
          <div className="flex items-center gap-3">
            <VaultBannerArtSvg bannerId="asic_matrix" />
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-[#c084fc]/25 px-2 py-0.5 font-display text-[9px] font-extrabold uppercase text-[#e9d5ff]">
                PASSIVE HARDWARE
              </span>
              <h3 className="mt-0.5 font-display text-base font-extrabold text-white drop-shadow">
                QUANTUM SERVER CORE
              </h3>
              <p className="text-[11px] font-semibold text-white/80">
                Permanent Algo Relics · Guaranteed Epic+ every 15 pulls
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={meta.gems < 150}
              onClick={() => handlePull('algo_hardware_crate', 1)}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-display text-xs font-extrabold btn-3d-cyan active:border-b-0 active:translate-y-1 disabled:opacity-40"
            >
              <Gem className="h-4 w-4" />
              <span>1x CORE (150)</span>
            </button>
            <button
              type="button"
              disabled={meta.gems < 1350}
              onClick={() => handlePull('algo_hardware_crate', 10)}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-display text-xs font-extrabold btn-3d-purple active:border-b-0 active:translate-y-1 disabled:opacity-40"
            >
              <Gem className="h-4 w-4 text-[#fde047]" />
              <span>10x CORE (1,350)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DAILY RESOURCE EXCHANGE (Blueprint & Hero Manual Bottleneck Breaker) */}
      <div className="flex flex-col gap-2.5 rounded-2xl border-2 border-[#0284c7] border-b-4 border-b-[#0369a1] bg-gradient-to-br from-[#0c4a6e] via-[#075985] to-[#1e293b] p-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <div>
              <span className="inline-block rounded-full bg-[#38bdf8]/20 px-2 py-0.5 font-display text-[9px] font-extrabold uppercase text-[#7dd3fc]">
                DAILY REFRESH • 00:00 UTC
              </span>
              <h3 className="font-display text-sm font-black text-white drop-shadow">
                DAILY RESOURCE EXCHANGE
              </h3>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-display text-[9px] font-black text-emerald-300">
            ANTI-BOTTLENECK
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {/* Item 1: 10x Base Blueprints */}
          <div className="flex flex-col justify-between rounded-xl border border-sky-400/30 bg-black/40 p-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📐</span>
              <div>
                <div className="font-display text-xs font-black text-white">10x Blueprints</div>
                <div className="text-[9.5px] font-semibold text-sky-200">Base Upgrades & Real Estate</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5">
              <span className="font-display text-[9.5px] font-bold text-sky-300">
                Left: {bpRem}/2
              </span>
              <button
                type="button"
                disabled={bpRem <= 0 || meta.gems < 250}
                onClick={() => handleBuyExchange('blueprints', '10x Base Blueprints')}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 font-display text-[10px] font-black btn-3d-gold active:border-b-0 active:translate-y-0.5 disabled:opacity-40"
              >
                <Gem className="h-3 w-3" />
                <span>250</span>
              </button>
            </div>
          </div>

          {/* Item 2: 5x Hero Skill Manuals */}
          <div className="flex flex-col justify-between rounded-xl border border-purple-400/30 bg-black/40 p-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              <div>
                <div className="font-display text-xs font-black text-white">5x Skill Manuals</div>
                <div className="text-[9.5px] font-semibold text-purple-200">Hero Passive & Active Lv</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5">
              <span className="font-display text-[9.5px] font-bold text-purple-300">
                Left: {manRem}/3
              </span>
              <button
                type="button"
                disabled={manRem <= 0 || meta.gems < 200}
                onClick={() => handleBuyExchange('manuals', '5x Hero Skill Manuals')}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 font-display text-[10px] font-black btn-3d-purple active:border-b-0 active:translate-y-0.5 disabled:opacity-40"
              >
                <Gem className="h-3 w-3" />
                <span>200</span>
              </button>
            </div>
          </div>

          {/* Item 3: 5x Gala Spin Tickets */}
          <div className="flex flex-col justify-between rounded-xl border border-amber-400/30 bg-black/40 p-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎟️</span>
              <div>
                <div className="font-display text-xs font-black text-white">5x Gala Tickets</div>
                <div className="text-[9.5px] font-semibold text-amber-200">100-Pull Milestone Wheel</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5">
              <span className="font-display text-[9.5px] font-bold text-amber-300">
                Left: {ticRem}/1
              </span>
              <button
                type="button"
                disabled={ticRem <= 0 || meta.gems < 800}
                onClick={() => handleBuyExchange('galaTickets', '5x Gala Spin Tickets')}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 font-display text-[10px] font-black btn-3d-gold active:border-b-0 active:translate-y-0.5 disabled:opacity-40"
              >
                <Gem className="h-3 w-3" />
                <span>800</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED IAP OFFERS (Simulated Storefront) */}
      <div className="flex flex-col gap-2.5 pb-3">
        {/* ───────── DUAL 30-DAY MONTHLY MINING SUBSCRIPTIONS ───────── */}
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-indigo-600 border-b-4 bg-gradient-to-b from-[#1e1b4b] via-[#2e1065] to-[#0f172a] p-3.5 text-white shadow-lg">
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⛏️</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xs font-black uppercase tracking-wider text-indigo-200">
                    Dual Monthly Mining Rigs
                  </h3>
                  {meta.isDualMiningRigActive() && (
                    <span className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.2 font-display text-[8.5px] font-black uppercase text-amber-950 shadow animate-pulse">
                      ⚡ OVERCLOCK: +15% HASHRATE
                    </span>
                  )}
                </div>
                <p className="text-[9.5px] font-semibold text-indigo-300">
                  30-Day automated cloud payouts. Activate both for permanent +15% Overclock!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {/* Rig 1: Silver Cloud Rig */}
            {(() => {
              const rig = MINING_SUBSCRIPTIONS.silver_rig
              const sub = meta.miningRigSubscriptions?.silver_rig
              const isActive = sub?.active && Date.now() < sub.expiresAt
              const canClaimDaily = isActive && sub?.lastDailyClaimDate !== todayStr

              return (
                <div className="flex flex-col justify-between rounded-xl border border-slate-400/30 bg-slate-900/60 p-2.5 shadow-inner">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{rig.icon}</span>
                      <span className="rounded bg-slate-700 px-1.5 py-0.2 font-display text-[8px] font-bold text-slate-200">
                        {isActive ? 'ACTIVE' : rig.badge}
                      </span>
                    </div>
                    <div className="mt-1 font-display text-xs font-black text-slate-200">
                      {rig.name}
                    </div>
                    <div className="text-[9px] font-semibold text-cyan-300 mt-0.5">
                      +{rig.instantGems} Gems + {rig.dailyGems}/day
                    </div>
                    <div className="text-[8.5px] text-slate-400 mt-0.5">{rig.perkDescription}</div>
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-700/50 flex flex-col gap-1">
                    {isActive ? (
                      <button
                        type="button"
                        disabled={!canClaimDaily}
                        onClick={() => {
                          AudioSynth.unlock()
                          const claimed = meta.claimMiningRigDaily('silver_rig')
                          if (claimed) {
                            AudioSynth.playCoinInject()
                            setPurchaseBanner(`Claimed ${claimed} Daily Gems from Silver Cloud Rig!`)
                          }
                        }}
                        className={`w-full rounded-lg py-1.5 font-display text-[9px] font-black ${
                          canClaimDaily
                            ? 'btn-3d-cyan text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canClaimDaily ? 'CLAIM 100 GEMS' : 'CLAIMED TODAY'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          AudioSynth.unlock()
                          if (meta.buyMiningRigSubscription('silver_rig')) {
                            AudioSynth.playMythicalDrop()
                            setPurchaseBanner(`Activated Silver Cloud Rig (${rig.priceLabel})!`)
                          }
                        }}
                        className="w-full rounded-lg py-1.5 font-display text-[9.5px] font-black btn-3d-cyan text-white shadow"
                      >
                        SUBSCRIBE {rig.priceLabel}
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Rig 2: Quantum ASIC Rig */}
            {(() => {
              const rig = MINING_SUBSCRIPTIONS.quantum_asic
              const sub = meta.miningRigSubscriptions?.quantum_asic
              const isActive = sub?.active && Date.now() < sub.expiresAt
              const canClaimDaily = isActive && sub?.lastDailyClaimDate !== todayStr

              return (
                <div className="flex flex-col justify-between rounded-xl border border-purple-400/30 bg-purple-950/40 p-2.5 shadow-inner">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{rig.icon}</span>
                      <span className="rounded bg-purple-800 px-1.5 py-0.2 font-display text-[8px] font-bold text-purple-200">
                        {isActive ? 'ACTIVE' : rig.badge}
                      </span>
                    </div>
                    <div className="mt-1 font-display text-xs font-black text-purple-200">
                      {rig.name}
                    </div>
                    <div className="text-[9px] font-semibold text-amber-300 mt-0.5">
                      +{rig.instantGems} Gems + {rig.dailyGems}/day
                    </div>
                    <div className="text-[8.5px] text-purple-300 mt-0.5">{rig.perkDescription}</div>
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-purple-700/50 flex flex-col gap-1">
                    {isActive ? (
                      <button
                        type="button"
                        disabled={!canClaimDaily}
                        onClick={() => {
                          AudioSynth.unlock()
                          const claimed = meta.claimMiningRigDaily('quantum_asic')
                          if (claimed) {
                            AudioSynth.playCoinInject()
                            setPurchaseBanner(`Claimed ${claimed} Daily Gems from Quantum ASIC Rig!`)
                          }
                        }}
                        className={`w-full rounded-lg py-1.5 font-display text-[9px] font-black ${
                          canClaimDaily
                            ? 'btn-3d-purple text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canClaimDaily ? 'CLAIM 250 GEMS' : 'CLAIMED TODAY'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          AudioSynth.unlock()
                          if (meta.buyMiningRigSubscription('quantum_asic')) {
                            AudioSynth.playMythicalDrop()
                            setPurchaseBanner(`Activated Quantum ASIC Rig (${rig.priceLabel})!`)
                          }
                        }}
                        className="w-full rounded-lg py-1.5 font-display text-[9.5px] font-black btn-3d-purple text-white shadow"
                      >
                        SUBSCRIBE {rig.priceLabel}
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* ───────── BUILD-YOUR-OWN OTC DEAL BENTO BOX ───────── */}
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-emerald-600 border-b-4 bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7] p-3.5 shadow-md">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍱</span>
              <div>
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-emerald-950">
                  Build-Your-Own OTC Deal (Bento Box)
                </h3>
                <p className="text-[9.5px] font-semibold text-emerald-800">
                  Select your tier and pick 3 custom items tailored to your loadout!
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-700 px-2 py-0.5 font-display text-[9px] font-black text-white shadow">
              CUSTOM
            </span>
          </div>

          {/* Tier Selector Buttons ($1.99 / $4.99 / $14.99) */}
          <div className="grid grid-cols-3 gap-1.5 my-1">
            {OTC_DEAL_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleSelectOtcTier(tier)}
                className={`rounded-xl py-1.5 font-display text-[10px] font-black transition active:scale-95 ${
                  selectedOtcTierId === tier.id
                    ? 'btn-3d-green text-white shadow'
                    : 'border border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                {tier.priceLabel}
              </button>
            ))}
          </div>

          {/* 3 Dropdown / Picker Slots */}
          <div className="space-y-1.5 bg-white/80 p-2.5 rounded-xl border border-emerald-300">
            {/* Slot 1: Shards / Fragments */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-display text-[10px] font-black text-stone-600 w-16">
                SLOT 1:
              </span>
              <select
                value={otcSlot1.id}
                onChange={(e) => {
                  const opt = activeOtcTier.slot1Options.find((o) => o.id === e.target.value)
                  if (opt) setOtcSlot1(opt)
                }}
                className="flex-1 rounded-lg border border-emerald-400 bg-white px-2 py-1 font-display text-[10px] font-black text-emerald-950"
              >
                {activeOtcTier.slot1Options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 2: Blueprints / Manuals */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-display text-[10px] font-black text-stone-600 w-16">
                SLOT 2:
              </span>
              <select
                value={otcSlot2.id}
                onChange={(e) => {
                  const opt = activeOtcTier.slot2Options.find((o) => o.id === e.target.value)
                  if (opt) setOtcSlot2(opt)
                }}
                className="flex-1 rounded-lg border border-emerald-400 bg-white px-2 py-1 font-display text-[10px] font-black text-emerald-950"
              >
                {activeOtcTier.slot2Options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 3: Gems / Hashrate */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-display text-[10px] font-black text-stone-600 w-16">
                SLOT 3:
              </span>
              <select
                value={otcSlot3.id}
                onChange={(e) => {
                  const opt = activeOtcTier.slot3Options.find((o) => o.id === e.target.value)
                  if (opt) setOtcSlot3(opt)
                }}
                className="flex-1 rounded-lg border border-emerald-400 bg-white px-2 py-1 font-display text-[10px] font-black text-emerald-950"
              >
                {activeOtcTier.slot3Options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBuyOtcDeal}
            className="w-full rounded-xl py-2.5 font-display text-xs font-black btn-3d-green text-white shadow-md active:scale-95"
          >
            ORDER BENTO OTC BOX ({activeOtcTier.priceLabel})
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-extrabold tracking-wide text-[#2C1810]">
            SPECIAL TRADER BUNDLES
          </span>
          <span className="rounded-full border border-[#86EFAC] bg-[#DCFCE7] px-2.5 py-0.5 font-display text-[9px] font-extrabold text-[#166534]">
            INSTANT UNLOCK
          </span>
        </div>

        {/* 5-STEP FLASH LIQUIDITY CHAIN (Trojan Horse Relay Offer) */}
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-[#b45309] border-b-4 bg-gradient-to-b from-[#fffbeb] to-[#fef3c7] p-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              <div>
                <div className="font-display text-xs font-black text-[#78350f]">
                  FLASH LIQUIDITY CHAIN
                </div>
                <div className="text-[9.5px] font-bold text-[#b45309]">
                  Claim Step N to unlock Step N+1!
                </div>
              </div>
            </div>
            <span className="rounded-full bg-[#f59e0b] px-2 py-0.5 font-display text-[9px] font-black text-white shadow">
              {(meta.relayChainStep ?? 0) >= 5 ? 'COMPLETED' : `STEP ${(meta.relayChainStep ?? 0) + 1} / 5`}
            </span>
          </div>

          {/* Horizontal Scrolling Relay Steps */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-none">
            {RELAY_CHAIN_STEPS.map((step, idx) => {
              const isClaimed = (meta.relayChainStep ?? 0) >= step.step
              const isCurrent = (meta.relayChainStep ?? 0) === step.step - 1

              return (
                <div key={step.step} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`relative flex w-[140px] flex-col justify-between rounded-xl border-2 p-2.5 text-center shadow transition-all ${
                      isCurrent
                        ? 'border-[#0284c7] bg-white ring-2 ring-[#38bdf8] scale-[1.02]'
                        : isClaimed
                        ? 'border-emerald-600 bg-emerald-50 opacity-85'
                        : 'border-slate-300 bg-slate-100 opacity-70'
                    }`}
                  >
                    {/* Tag badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[8.5px] font-black text-slate-500">
                        STEP {step.step}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.2 font-display text-[7.5px] font-black text-white shadow-xs"
                        style={{ backgroundColor: step.badgeColor }}
                      >
                        {step.tag}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="my-1.5 flex flex-col items-center">
                      <span className="text-2xl drop-shadow">{step.icon}</span>
                      <span className="mt-1 font-display text-[10px] font-black leading-tight text-[#2C1810]">
                        {step.title}
                      </span>
                      <span className="mt-0.5 text-[8.5px] font-bold text-[#6E5A4F]">
                        {step.rewardSummary}
                      </span>
                    </div>

                    {/* Action button */}
                    {isClaimed ? (
                      <div className="flex items-center justify-center gap-1 rounded-lg bg-emerald-100 py-1 font-display text-[9px] font-black text-emerald-800">
                        <Check className="h-3 w-3" /> CLAIMED
                      </div>
                    ) : isCurrent ? (
                      <button
                        type="button"
                        onClick={() => handleClaimRelay(step)}
                        disabled={adPullLoading}
                        className={`w-full rounded-lg py-1 font-display text-[9.5px] font-black text-white shadow transition-transform active:scale-95 animate-pulse cursor-pointer ${
                          step.costType === 'free'
                            ? 'bg-gradient-to-b from-emerald-500 to-emerald-700'
                            : step.costType === 'ad'
                            ? 'bg-gradient-to-b from-blue-500 to-blue-700'
                            : 'bg-gradient-to-b from-amber-500 to-amber-700'
                        }`}
                      >
                        {adPullLoading && step.costType === 'ad' ? 'LOADING...' : step.priceLabel}
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 rounded-lg bg-slate-200 py-1 font-display text-[9px] font-bold text-slate-500">
                        <Lock className="h-2.5 w-2.5" /> {step.priceLabel}
                      </div>
                    )}
                  </div>

                  {/* Connector arrow/padlock between steps */}
                  {idx < RELAY_CHAIN_STEPS.length - 1 && (
                    <div className="flex flex-col items-center text-slate-400">
                      {isClaimed ? (
                        <span className="text-emerald-600 font-black text-sm">➔</span>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-500 shadow-inner">
                          🔒
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {SHOP_BUNDLES.map((b) => {
          const bought = meta.purchasedBundleIds.includes(b.id)
          const isGrowthFund = b.id === 'stage_growth_fund'
          const bonusHero = b.bonusHeroId ? HERO_MAP[b.bonusHeroId as keyof typeof HERO_MAP] : null

          return (
            <div
              key={b.id}
              className="flex flex-col gap-2 rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2.5">
                {bonusHero && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] shadow-inner">
                    <HeroChibiSvg heroId={bonusHero.id} size={46} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-display text-sm font-extrabold text-[#2C1810]">
                      {b.name}
                    </span>
                    {b.badge && (
                      <span className="rounded-full border border-[#F59E0B] bg-[#FEF3C7] px-2 py-0.5 font-display text-[9px] font-extrabold text-[#92400E]">
                        {b.badge}
                      </span>
                    )}
                    {b.bonusHeroFragments && (
                      <span className="rounded-full border border-[#c084fc] bg-[#FAF5FF] px-2 py-0.5 font-display text-[9px] font-extrabold text-[#7e22ce]">
                        🧩 +{b.bonusHeroFragments} Shards
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#6E5A4F]">{b.description}</p>
                </div>

                <button
                  type="button"
                  disabled={bought}
                  onClick={() => handlePurchaseBundle(b.id, b.name)}
                  className={`shrink-0 rounded-xl px-3.5 py-2.5 font-display text-xs font-extrabold ${
                    bought
                      ? 'border border-[#86EFAC] bg-[#DCFCE7] text-[#166534]'
                      : 'btn-3d-green active:border-b-0 active:translate-y-1'
                  }`}
                >
                  {bought ? (
                    <span className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> OWNED
                    </span>
                  ) : (
                    `$${b.priceUsd.toFixed(2)}`
                  )}
                </button>
              </div>

              {/* Stage Growth Fund Claimable Milestones */}
              {isGrowthFund && b.stageMilestones && (
                <div className="mt-1 grid grid-cols-5 gap-1.5 border-t border-[#E2D5C1] pt-2">
                  {b.stageMilestones.slice(0, 5).map((ms) => {
                    const claimed = meta.claimedGrowthFundStages.includes(ms.stage)
                    const unlocked = bought && meta.highestStageCleared >= ms.stage && !claimed
                    return (
                      <button
                        key={ms.stage}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => {
                          AudioSynth.playChestOpen()
                          meta.claimGrowthFundMilestone(ms.stage)
                        }}
                        className={`rounded-xl border p-1.5 text-center font-display text-[10px] font-extrabold ${
                          claimed
                            ? 'border-[#86EFAC] bg-[#DCFCE7] text-[#166534]'
                            : unlocked
                              ? 'btn-3d-gold animate-pulse'
                              : 'border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                        }`}
                      >
                        <div>Stg {ms.stage}</div>
                        <div>+{ms.reward[0].amount}G</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* DRAMATIC CHEST OPENING MODAL (Card Flip + Full-Card Rarity Gradients) */}
      {chestResults && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-[#0b0f1c]/95 p-4 backdrop-blur-md">
          <div className="text-center">
            <div className="font-display text-xs font-extrabold uppercase tracking-wider text-[#fde047]">
              VAULT DECRYPTED
            </div>
            <h2 className="font-display text-xl font-extrabold text-white drop-shadow">
              {revealedIndices.length < chestResults.length
                ? 'TAP CARDS TO FLIP!'
                : 'ALL ASSETS REVEALED!'}
            </h2>
          </div>

          <div
            className={`my-auto grid w-full gap-2.5 ${
              chestResults.length === 1 ? 'max-w-[200px] grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
            } max-h-[72%] overflow-y-auto p-2`}
          >
            {chestResults.map((item, idx) => {
              const revealed = revealedIndices.includes(idx)
              const theme = RARITY_CARD_THEMES[item.rarity]
              const coinCfg = item.type === 'coin' ? COIN_MAP[item.id] : null
              const relicCfg = item.type === 'relic' ? RELIC_MAP[item.id] : null
              const name = coinCfg?.name ?? relicCfg?.name ?? item.id
              const icon = coinCfg?.icon ?? relicCfg?.icon ?? 'Sparkles'

              if (!revealed) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => revealCard(idx, item)}
                    className={`flex h-32 flex-col items-center justify-center gap-2 rounded-2xl p-3 transition hover:scale-105 active:scale-95 ${theme.cardBg} ${theme.border} ${theme.lip}`}
                  >
                    <Sparkles className="h-8 w-8 animate-spin text-[#fde047]" />
                    <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-white">
                      TAP TO FLIP
                    </span>
                  </button>
                )
              }

              return (
                <div
                  key={idx}
                  className={`relative flex h-32 flex-col items-center justify-between overflow-hidden rounded-2xl p-2.5 text-center transition-all duration-300 ${theme.cardBg} ${theme.border} ${theme.lip}`}
                >
                  <span
                    className={`rounded-full px-2 py-0.5 font-display text-[9px] font-extrabold uppercase shadow ${
                      item.isNew
                        ? 'bg-[#22ff99] text-[#062419]'
                        : 'bg-black/50 text-[#fde047]'
                    }`}
                  >
                    {item.isNew
                      ? 'NEW!'
                      : item.type === 'relic'
                        ? `+${DUPLICATE_RELIC_HASHRATE} H/s`
                        : '+1 COPY'}
                  </span>

                  {coinCfg ? (
                    <CoinMascotSvg coin={coinCfg} size={46} />
                  ) : (
                    <DynamicIcon name={icon} className="h-8 w-8 text-white drop-shadow" />
                  )}

                  <div className="w-full">
                    <div className="truncate font-display text-xs font-extrabold text-white drop-shadow">
                      {name}
                    </div>
                    <div className="font-display text-[9px] font-bold uppercase text-white/80">
                      {theme.label}
                    </div>
                    {item.bonusHeroFragments && (
                      <div className="mt-0.5 rounded-full bg-black/55 px-1.5 py-0.2 font-display text-[8px] font-extrabold text-[#fde047]">
                        🧩 +{item.bonusHeroFragments} Hero Shards
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex w-full gap-2">
            {revealedIndices.length < chestResults.length ? (
              <button
                type="button"
                onClick={revealAllCards}
                className="w-full rounded-2xl py-3.5 font-display text-sm font-extrabold tracking-wider btn-3d-gold active:border-b-0 active:translate-y-1"
              >
                FLIP ALL ({chestResults.length - revealedIndices.length} REMAINING)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setChestResults(null)}
                className="w-full rounded-2xl py-3.5 font-display text-sm font-extrabold tracking-wider btn-3d-green active:border-b-0 active:translate-y-1"
              >
                COLLECT TO PORTFOLIO
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { TrendingUp }
