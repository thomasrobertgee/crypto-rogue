import { useState } from 'react'
import { X, Check, Lock, Sparkles } from 'lucide-react'
import { useMetaStore } from '../../state/useMetaStore'
import {
  SEASON_NAME,
  SEASON_TIERS,
  calculateSeasonTier,
  XP_PER_TIER,
  MAX_SEASON_TIER,
  type SeasonRewardItem,
} from '../../config/seasonPass.config'
import { AudioSynth } from '../../engine/AudioSynth'
import { CandlestickCanvas } from '../battle/CandlestickCanvas'

interface SeasonPassModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SeasonPassModal({ isOpen, onClose }: SeasonPassModalProps) {
  const meta = useMetaStore()
  const [claimToast, setClaimToast] = useState<string | null>(null)
  const [previewSkin, setPreviewSkin] = useState(false)

  if (!isOpen) return null

  const curTier = calculateSeasonTier(meta.seasonPassXp ?? 0)
  const curXp = meta.seasonPassXp ?? 0
  const curTierBaseXp = (curTier - 1) * XP_PER_TIER
  const tierProgressXp = curTier >= MAX_SEASON_TIER ? XP_PER_TIER : Math.max(0, curXp - curTierBaseXp)
  const tierProgressPct = curTier >= MAX_SEASON_TIER ? 100 : Math.min(100, (tierProgressXp / XP_PER_TIER) * 100)

  const isTrader = meta.seasonPassType === 'trader' || meta.seasonPassType === 'whale'
  const isWhale = meta.seasonPassType === 'whale'

  const handleClaim = (tier: number, track: 'free' | 'trader' | 'whale') => {
    AudioSynth.unlock()
    const success = meta.claimSeasonPassTier(tier, track)
    if (success) {
      AudioSynth.playCoinInject()
      setClaimToast(`Tier ${tier} (${track.toUpperCase()}) Claimed!`)
      window.setTimeout(() => setClaimToast(null), 2500)
    }
  }

  const handleClaimAll = () => {
    AudioSynth.unlock()
    const res = meta.claimAllSeasonPass()
    if (res.claimedCount > 0) {
      AudioSynth.playGreenCandle()
      setClaimToast(`Claimed ${res.claimedCount} Rewards! (+${res.gems} 💎, +${res.hashrate} ⚡)`)
      window.setTimeout(() => setClaimToast(null), 3000)
    }
  }

  const handleBuyPass = (type: 'trader' | 'whale') => {
    AudioSynth.unlock()
    AudioSynth.playGreenCandle()
    meta.buySeasonPass(type)
    setClaimToast(type === 'whale' ? '👑 Whale Executive Pass Activated! (+10 Tiers & Sovereign Gold FX)' : '🎟️ Trader Pass Activated!')
    window.setTimeout(() => setClaimToast(null), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl border-4 border-[#3E2723] bg-[#FDFBF7] shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#312e81] p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎟️</span>
              <div>
                <h2 className="font-display text-sm font-black tracking-wide text-[#fde047] game-text-outline-sm">
                  {SEASON_NAME}
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/80">
                  <span>⏳ 18d 14h Left</span>
                  <span>•</span>
                  <span>Season 1</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tier Progress Bar */}
          <div className="mt-3 rounded-2xl bg-black/30 p-2 border border-white/10">
            <div className="flex items-center justify-between text-[11px] font-display font-black">
              <span className="text-[#38bdf8]">
                TIER {curTier} <span className="text-white/60">/ {MAX_SEASON_TIER}</span>
              </span>
              <span className="text-[#fde047]">
                {curTier >= MAX_SEASON_TIER ? 'MAX TIER REACHED' : `${tierProgressXp} / ${XP_PER_TIER} XP`}
              </span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-black/40 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#8b5cf6] transition-all duration-300"
                style={{ width: `${tierProgressPct}%` }}
              />
            </div>
          </div>

          {/* Toast feedback */}
          {claimToast && (
            <div className="absolute top-2 inset-x-10 z-50 rounded-full border border-amber-300 bg-amber-400 px-3 py-1 text-center font-display text-[11px] font-black text-amber-950 shadow-lg animate-bounce">
              {claimToast}
            </div>
          )}
        </div>

        {/* Upgrade Pass Bar */}
        <div className="border-b-2 border-[#3E2723] bg-[#FEF3C7] p-2 text-[#78350F]">
          {!isWhale ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-display text-[10px] font-black uppercase tracking-wider">
                  🔥 Unlock Premium Progression
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewSkin((p) => !p)}
                  className="font-display text-[9px] font-black text-[#d97706] underline"
                >
                  {previewSkin ? 'Hide Preview' : 'Preview Sovereign Gold FX'}
                </button>
              </div>

              {previewSkin && (
                <div className="my-1 h-20 w-full overflow-hidden rounded-xl border-2 border-[#b45309] bg-[#1c1408]">
                  <CandlestickCanvas
                    candles={[
                      { o: 1000, h: 1060, l: 990, c: 1050 },
                      { o: 1050, h: 1090, l: 1030, c: 1080 },
                      { o: 1080, h: 1150, l: 1070, c: 1140 },
                    ]}
                    skinId="sovereign_gold"
                    megaCandleActive={true}
                    showPriceAxis={false}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {!isTrader ? (
                  <button
                    type="button"
                    onClick={() => handleBuyPass('trader')}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-[#0284c7] border-b-4 bg-gradient-to-b from-[#38bdf8] to-[#0284c7] p-1.5 font-display text-white shadow active:translate-y-0.5"
                  >
                    <span className="text-[10px] font-black">TRADER PASS</span>
                    <span className="rounded bg-black/25 px-1.5 py-0.2 text-[9px] font-extrabold text-[#fde047]">
                      $9.99 (3,000 💎 + Epic)
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-100 p-1 font-display text-[10px] font-black text-emerald-800">
                    ✓ Trader Pass Active
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleBuyPass('whale')}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-[#b45309] border-b-4 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] p-1.5 font-display text-[#451a03] shadow active:translate-y-0.5"
                >
                  <span className="flex items-center gap-1 text-[10px] font-black">
                    <Sparkles className="h-3 w-3" /> WHALE EXECUTIVE
                  </span>
                  <span className="rounded bg-black/20 px-1.5 py-0.2 text-[8.5px] font-black text-white">
                    $24.99 (+10 Tiers, Cap 45)
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 py-1 font-display text-xs font-black text-[#854d0e]">
              <span className="flex items-center gap-1.5">
                👑 <span>WHALE EXECUTIVE PASS ACTIVE</span>
              </span>
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] text-white">
                MAX ENERGY 45
              </span>
            </div>
          )}
        </div>

        {/* Global Claim All Bar */}
        <div className="flex items-center justify-between border-b border-[#3E2723]/30 bg-[#F3E9D8] px-3 py-1.5">
          <span className="font-display text-[10px] font-extrabold text-[#78350F]">
            Earn XP via Daily Quests &amp; Battles
          </span>
          <button
            type="button"
            onClick={handleClaimAll}
            className="rounded-full border border-[#15803d] bg-gradient-to-b from-[#4ade80] to-[#16a34a] px-3 py-1 font-display text-[10px] font-black text-white shadow transition-transform active:scale-95"
          >
            CLAIM ALL REWARDS
          </button>
        </div>

        {/* 3-Column Progression Track (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Column Header Titles */}
          <div className="grid grid-cols-[1fr_60px_1fr_1.1fr] gap-1 px-1 pb-1 font-display text-[9px] font-black uppercase text-[#78350F]">
            <span className="text-center text-slate-700">Free</span>
            <span className="text-center">Tier</span>
            <span className="text-center text-[#0284c7]">Trader</span>
            <span className="text-center text-[#b45309]">Whale 👑</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {SEASON_TIERS.map((tierCfg) => {
              const isUnlocked = curTier >= tierCfg.tier
              const freeClaimed = (meta.seasonPassClaimedFree ?? []).includes(tierCfg.tier)
              const traderClaimed = (meta.seasonPassClaimedTrader ?? []).includes(tierCfg.tier)
              const whaleClaimed = (meta.seasonPassClaimedWhale ?? []).includes(tierCfg.tier)

              return (
                <div
                  key={tierCfg.tier}
                  className={`grid grid-cols-[1fr_60px_1fr_1.1fr] items-center gap-1 rounded-2xl border-2 p-1.5 shadow-sm transition-colors ${
                    isUnlocked
                      ? 'border-[#78350f]/30 bg-white'
                      : 'border-slate-300 bg-slate-100/70 opacity-80'
                  }`}
                >
                  {/* 1. Free Track Card */}
                  <RewardCell
                    reward={tierCfg.freeReward}
                    isUnlocked={isUnlocked}
                    isClaimed={freeClaimed}
                    canClaim={isUnlocked && !freeClaimed}
                    onClaim={() => handleClaim(tierCfg.tier, 'free')}
                    badgeColor="border-slate-300 bg-slate-50"
                  />

                  {/* 2. Center Tier Number Pill */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-display text-xs font-black shadow-sm ${
                        isUnlocked
                          ? 'border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-[#451a03]'
                          : 'border-slate-400 bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tierCfg.tier}
                    </div>
                  </div>

                  {/* 3. Trader Pass Card */}
                  <RewardCell
                    reward={tierCfg.traderReward}
                    isUnlocked={isUnlocked}
                    isPurchased={isTrader}
                    isClaimed={traderClaimed}
                    canClaim={isUnlocked && isTrader && !traderClaimed}
                    onClaim={() => handleClaim(tierCfg.tier, 'trader')}
                    badgeColor="border-blue-200 bg-blue-50/80"
                  />

                  {/* 4. Whale Executive Pass Card */}
                  <RewardCell
                    reward={tierCfg.whaleReward}
                    isUnlocked={isUnlocked}
                    isPurchased={isWhale}
                    isClaimed={whaleClaimed}
                    canClaim={isUnlocked && isWhale && !whaleClaimed}
                    onClaim={() => handleClaim(tierCfg.tier, 'whale')}
                    badgeColor="border-amber-300 bg-amber-50/80"
                    isWhale
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface RewardCellProps {
  reward: SeasonRewardItem
  isUnlocked: boolean
  isPurchased?: boolean
  isClaimed: boolean
  canClaim: boolean
  onClaim: () => void
  badgeColor: string
  isWhale?: boolean
}

function RewardCell({
  reward,
  isUnlocked,
  isPurchased = true,
  isClaimed,
  canClaim,
  onClaim,
  badgeColor,
  isWhale = false,
}: RewardCellProps) {
  return (
    <div
      className={`relative flex flex-col items-center justify-between rounded-xl border p-1 text-center min-h-[58px] ${badgeColor} ${
        isWhale ? 'border-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.25)]' : ''
      }`}
    >
      <div className="text-base">{reward.icon}</div>
      <span className="line-clamp-1 font-display text-[8.5px] font-black leading-tight text-[#2C1810]">
        {reward.name}
      </span>

      {/* Button / State */}
      {isClaimed ? (
        <span className="flex items-center gap-0.5 font-display text-[8px] font-black text-emerald-600">
          <Check className="h-2.5 w-2.5" /> Claimed
        </span>
      ) : canClaim ? (
        <button
          type="button"
          onClick={onClaim}
          className="w-full rounded-md border border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-600 py-0.5 font-display text-[8px] font-black text-white shadow active:scale-95 animate-pulse"
        >
          CLAIM
        </button>
      ) : !isPurchased ? (
        <span className="flex items-center gap-0.5 font-display text-[7.5px] font-bold text-slate-500">
          <Lock className="h-2 w-2" /> Locked
        </span>
      ) : (
        <span className="font-display text-[7.5px] font-bold text-slate-400">
          {!isUnlocked ? 'Lv Req' : 'Ready'}
        </span>
      )}
    </div>
  )
}
