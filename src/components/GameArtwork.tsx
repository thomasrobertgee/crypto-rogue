import { useEffect, useState } from 'react'
import { Crown, Lock, Check } from 'lucide-react'
import type { CoinConfig, OwnedCoin, Rarity } from '../types/game.types'
import { FUSION_REQUIRED_COPIES } from '../config/economy.config'
import { nextRarity } from '../engine/economy'
import { fmtNum } from '../engine/format'
import { DynamicIcon } from './DynamicIcon'
import { useMetaStore, MAX_ENERGY } from '../state/useMetaStore'
import { EnergyRechargeModal } from './modals/EnergyRechargeModal'

// ───────────────────────── 1. Top HUD Glossy Currency Pill Capsules & Icons ─────────────────────────
export function HashrateIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]"
    >
      <circle cx="12" cy="12" r="10" fill="#0284c7" />
      <circle cx="12" cy="12" r="7.5" fill="#38bdf8" />
      <path d="M13 6L8 13h4l-1 5 5-7h-4l1-5z" fill="#ffffff" />
    </svg>
  )
}

export function SatoshiGemIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]"
    >
      <polygon points="12,2 21,9 17,21 7,21 3,9" fill="#ca8a04" />
      <polygon points="12,4 19,9.5 15.5,19 8.5,19 5,9.5" fill="#fde047" />
      <polygon points="12,4 16,9.5 12,13 8,9.5" fill="#fef9c3" />
    </svg>
  )
}

export function GemIllustration({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <SatoshiGemIcon size={16} />
    </span>
  )
}

export function VaultKeyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0 drop-shadow-[0_0_6px_rgba(192,132,252,0.85)]"
    >
      <circle cx="8" cy="12" r="5" fill="#a855f7" stroke="#f3e8ff" strokeWidth="1.5" />
      <circle cx="8" cy="12" r="2" fill="#2e1065" />
      <path d="M13 12h8v3h-2v2h-3v-2h-3z" fill="#e9d5ff" />
    </svg>
  )
}

interface TopCurrencyBarProps {
  hashrate: number
  gems: number
  silverKeys: number
  quantumKeys: number
  isVipAdFree?: boolean
}

export function TopCurrencyBar({
  hashrate,
  gems,
  silverKeys,
  quantumKeys,
  isVipAdFree,
}: TopCurrencyBarProps) {
  const energy = useMetaStore((s) => s.energy ?? MAX_ENERGY)
  const syncEnergy = useMetaStore((s) => s.syncEnergy)
  const [showEnergyModal, setShowEnergyModal] = useState(false)

  useEffect(() => {
    syncEnergy()
  }, [syncEnergy])

  return (
    <>
      <div
        className="flex items-center justify-between gap-1 pr-9 safe-area-top-header"
        style={{ paddingTop: 'max(var(--safe-top, env(safe-area-inset-top)), 8px)' }}
      >
        {/* Tap-to-Inspect Energy Pill (⚡ 24/30) */}
        <button
          type="button"
          onClick={() => setShowEnergyModal(true)}
          className="flex flex-1 items-center justify-between gap-1 rounded-full border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#fff6e6] pl-2 pr-1 py-0.5 shadow-sm active:translate-y-0.5"
          title="Trader Energy (Tap for Recharge Timer)"
        >
          <span className="truncate font-display text-[11px] font-black tracking-tight text-[#422006]">
            ⚡ {energy}/{MAX_ENERGY}
          </span>
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#14532d] bg-[#22c55e] font-display text-[10px] font-black text-white">
            +
          </span>
        </button>

        {/* Hashrate 3D Bubble Pill */}
        <div
          className="flex flex-1 items-center gap-1 rounded-full border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#fff6e6] px-2 py-0.5 shadow-sm"
          title="Hashrate"
        >
          <HashrateIcon size={14} />
          <span className="truncate font-display text-[11px] font-black tracking-tight text-[#422006]">
            {fmtNum(hashrate)}
          </span>
        </div>

        {/* Satoshi Gems 3D Bubble Pill with Green '+' */}
        <div
          className="flex flex-1 items-center justify-between gap-1 rounded-full border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#fff6e6] pl-1.5 pr-1 py-0.5 shadow-sm"
          title="Satoshi Gems"
        >
          <div className="flex items-center gap-1 min-w-0">
            <SatoshiGemIcon size={14} />
            <span className="truncate font-display text-[11px] font-black tracking-tight text-[#422006]">
              {fmtNum(gems)}
            </span>
          </div>
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#14532d] bg-[#22c55e] font-display text-[10px] font-black text-white">
            +
          </span>
        </div>

        {/* Vault Keys 3D Bubble Pill */}
        <div
          className="flex items-center gap-1 rounded-full border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#fff6e6] px-2 py-0.5 shadow-sm"
          title="Vault Keys (Silver / Quantum)"
        >
          <VaultKeyIcon size={14} />
          <span className="font-display text-[11px] font-black tracking-tight text-[#422006]">
            {silverKeys + quantumKeys}
          </span>
        </div>

        {isVipAdFree && (
          <span className="flex shrink-0 items-center gap-0.5 rounded-full border-2 border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#f59e0b] px-1.5 py-0.5 font-display text-[9px] font-black text-[#422006] shadow">
            <Crown className="h-2.5 w-2.5" /> VIP
          </span>
        )}
      </div>

      {showEnergyModal && (
        <EnergyRechargeModal onClose={() => setShowEnergyModal(false)} />
      )}
    </>
  )
}

// ───────────────────────── 2. Full-Card Rarity Gradient Themes ─────────────────────────
export const RARITY_CARD_THEMES: Record<
  Rarity,
  {
    cardBg: string
    border: string
    lip: string
    badgeBg: string
    glowColor: string
    label: string
  }
> = {
  common: {
    cardBg: 'bg-gradient-to-b from-[#334155] to-[#1e293b]',
    border: 'border-2 border-[#94a3b8]',
    lip: 'border-b-4 border-b-[#0f172a]',
    badgeBg: 'bg-[#0f172a]/80 text-[#cbd5e1]',
    glowColor: 'rgba(148, 163, 184, 0.35)',
    label: 'Common',
  },
  uncommon: {
    cardBg: 'bg-gradient-to-b from-[#065f46] to-[#064e3b]',
    border: 'border-2 border-[#34d399]',
    lip: 'border-b-4 border-b-[#022c22]',
    badgeBg: 'bg-[#022c22]/85 text-[#6ee7b7]',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    label: 'Uncommon',
  },
  rare: {
    cardBg: 'bg-gradient-to-b from-[#1e40af] to-[#172554]',
    border: 'border-2 border-[#60a5fa]',
    lip: 'border-b-4 border-b-[#0f172a]',
    badgeBg: 'bg-[#0f172a]/85 text-[#93c5fd]',
    glowColor: 'rgba(96, 165, 250, 0.5)',
    label: 'Rare',
  },
  epic: {
    cardBg: 'bg-gradient-to-b from-[#581c87] to-[#2e1065]',
    border: 'border-2 border-[#c084fc]',
    lip: 'border-b-4 border-b-[#1e0942]',
    badgeBg: 'bg-[#1e0942]/85 text-[#e9d5ff]',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    label: 'Epic',
  },
  legendary: {
    cardBg: 'bg-gradient-to-b from-[#854d0e] to-[#422006]',
    border: 'border-2 border-[#facc15]',
    lip: 'border-b-4 border-b-[#271202]',
    badgeBg: 'bg-[#271202]/85 text-[#fef08a]',
    glowColor: 'rgba(250, 204, 21, 0.6)',
    label: 'Legendary',
  },
  mythical: {
    cardBg: 'bg-gradient-to-br from-[#991b1b] via-[#581c87] to-[#854d0e]',
    border: 'border-2 border-[#f43f5e]',
    lip: 'border-b-4 border-b-[#450a0a]',
    badgeBg: 'bg-[#450a0a]/85 text-[#fda4af]',
    glowColor: 'rgba(244, 63, 94, 0.65)',
    label: 'Mythical',
  },
}

// ───────────────────────── 3. Vibrant Custom SVG Coin Emblem / Mascot ─────────────────────────
interface CoinMascotSvgProps {
  coin: CoinConfig
  size?: number
  className?: string
}

export function CoinMascotSvg({ coin, size = 48, className = '' }: CoinMascotSvgProps) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft radial backlight glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-md"
        style={{
          background: `radial-gradient(circle, ${coin.color}99 0%, transparent 72%)`,
        }}
      />

      {/* Multi-layered Glossy 3D Coin Medallion SVG */}
      <svg
        viewBox="0 0 64 64"
        className="relative z-10 h-full w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.55)]"
      >
        {/* 3D Bottom Coin Edge */}
        <circle cx="32" cy="35" r="26" fill="rgba(0,0,0,0.45)" />
        {/* Outer Metallic Coin Rim */}
        <circle
          cx="32"
          cy="31"
          r="26"
          fill={coin.color}
          stroke="#ffffff"
          strokeOpacity="0.65"
          strokeWidth="2.5"
        />
        {/* Inner Recessed Medallion */}
        <circle
          cx="32"
          cy="31"
          r="20.5"
          fill="#0f172a"
          fillOpacity="0.55"
          stroke="#ffffff"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        {/* Top Specular Gloss Arc */}
        <path
          d="M 14 20 A 22 22 0 0 1 50 20"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.45"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Star Sparkles on Rim */}
        <circle cx="15" cy="17" r="2" fill="#ffffff" fillOpacity="0.85" />
        <circle cx="49" cy="43" r="1.5" fill="#ffffff" fillOpacity="0.7" />
      </svg>

      {/* Center Mascot Icon */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center pb-0.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.75)]">
        <DynamicIcon
          name={coin.icon}
          style={{
            width: Math.round(size * 0.44),
            height: Math.round(size * 0.44),
            color: '#ffffff',
          }}
        />
      </div>
    </div>
  )
}

// ───────────────────────── 4. Clash Royale / Survivor.io Style Coin Grid Card ─────────────────────────
interface CoinGridCardProps {
  coin: CoinConfig
  stack?: OwnedCoin | null
  totalCopies?: number
  isEquipped?: boolean
  isSelected?: boolean
  onClick?: () => void
  onForge?: () => void
  dataTutorial?: string
}

export function CoinGridCard({
  coin,
  stack,
  totalCopies,
  isEquipped,
  isSelected,
  onClick,
  onForge,
  dataTutorial,
}: CoinGridCardProps) {
  const isOwned = !!stack
  const activeRarity = stack ? stack.rarity : coin.rarity
  const theme = RARITY_CARD_THEMES[activeRarity]
  const copies = totalCopies ?? stack?.count ?? 0
  const canFuse = isOwned && copies >= FUSION_REQUIRED_COPIES && nextRarity(activeRarity) !== null
  const fusePct = Math.min(100, (copies / FUSION_REQUIRED_COPIES) * 100)

  if (!isOwned) {
    return (
      <div className="relative flex flex-col items-center justify-between rounded-2xl border-2 border-[#b45309]/40 border-b-4 border-b-[#78350f]/50 bg-[#ffedd5]/80 p-2.5 opacity-75">
        <div className="flex w-full items-center justify-between">
          <span className="rounded-md bg-[#78350f]/20 px-1.5 py-0.5 font-display text-[9px] font-bold text-[#78350f]">
            LOCKED
          </span>
          <Lock className="h-3 w-3 text-[#78350f]" />
        </div>
        <div className="my-1.5 grayscale opacity-45">
          <CoinMascotSvg coin={coin} size={46} />
        </div>
        <div className="w-full truncate text-center font-display text-xs font-bold text-[#78350f]">
          {coin.name}
        </div>
        <div className="mt-1.5 h-3.5 w-full rounded-full bg-[#78350f]/20 px-2 text-center font-display text-[9px] font-bold leading-[14px] text-[#78350f]">
          0/{FUSION_REQUIRED_COPIES}
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-tutorial={dataTutorial || (coin.id === 'bitcrumb' ? 'coin-card-bitcrumb' : undefined)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.()
      }}
      className={`group relative flex flex-col items-center justify-between rounded-2xl p-2.5 text-center transition-all cursor-pointer active:translate-y-0.5 ${
        theme.cardBg
      } border-[2.5px] border-[#422006] border-b-[5px] ${
        isSelected
          ? 'ring-3 ring-[#fde047] shadow-[0_0_20px_rgba(250,204,21,0.75)] -translate-y-0.5'
          : 'shadow-md hover:brightness-105'
      }`}
    >
      {/* Top Gloss Highlight */}
      <div className="pointer-events-none absolute inset-x-1.5 top-1 h-2 rounded-full bg-white/25" />

      {/* Red [!] Badge ONLY when 3/3 copies are ready to Fuse */}
      {canFuse && (
        <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#ef4444] font-display text-[11px] font-black text-white shadow">
          !
        </span>
      )}

      {/* Corner Level Badge & Equipped Indicator */}
      <div className="relative z-10 flex w-full items-center justify-between">
        <span className="rounded-lg border border-black/40 bg-black/55 px-1.5 py-0.5 font-display text-[10px] font-black text-white shadow game-text-outline-sm">
          Lv.{stack.level}
        </span>
        {isEquipped && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#14532d] bg-[#4ade80] text-[#052e16] shadow">
            <Check className="h-3 w-3 stroke-[3]" />
          </span>
        )}
      </div>

      {/* 1) Large 48x48 Custom SVG Mascot with Soft Radial Glow */}
      <div className="my-1">
        <CoinMascotSvg coin={coin} size={48} />
      </div>

      {/* 2) Coin Name in Bold White Text with Outlined Border */}
      <div className="w-full truncate font-display text-xs font-black tracking-wide text-white game-text-outline-sm">
        {coin.name}
      </div>

      {/* 3) 1-Tap Glowing FORGE Button when 3/3 copies ready, otherwise Duplicate Progress Bar */}
      {canFuse && onForge ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onForge()
          }}
          className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-full border-2 border-[#78350f] border-b-[3px] bg-gradient-to-b from-[#fde047] to-[#f59e0b] py-0.5 font-display text-[10px] font-black uppercase text-white game-text-outline-sm shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-pulse active:scale-95"
        >
          <span>🔥 FORGE ({copies}/3)</span>
        </button>
      ) : (
        <div className="relative mt-1.5 h-4 w-full overflow-hidden rounded-full border border-black/60 bg-[#0b101e] shadow-inner">
          <div
            className={`h-full transition-all duration-300 ${
              canFuse
                ? 'bg-gradient-to-r from-[#fde047] to-[#f59e0b] animate-pulse'
                : 'bg-gradient-to-r from-[#38bdf8] to-[#2563eb]'
            }`}
            style={{ width: `${fusePct}%` }}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[10px] font-black text-white game-text-outline-sm">
            {copies}/{FUSION_REQUIRED_COPIES}
          </span>
        </div>
      )}
    </div>
  )
}

// ───────────────────────── 5. Gacha Shop Treasure Vault Illustrations ─────────────────────────
export function VaultBannerArtSvg({ bannerId }: { bannerId: string }) {
  if (bannerId === 'faucet_vault') {
    // Glowing Cyan Faucet Treasure Chest
    return (
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-sky-400/35 blur-xl" />
        <svg viewBox="0 0 80 80" className="relative z-10 h-20 w-20 drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)] animate-float-slow">
          {/* Chest Base */}
          <rect x="12" y="34" width="56" height="34" rx="7" fill="#0369a1" stroke="#38bdf8" strokeWidth="3" />
          <rect x="16" y="38" width="48" height="26" rx="4" fill="#0c4a6e" />
          {/* Chest Lid */}
          <path d="M10 34 C10 18, 70 18, 70 34 Z" fill="#0284c7" stroke="#7dd3fc" strokeWidth="3" />
          {/* Metallic Straps */}
          <rect x="24" y="21" width="6" height="47" rx="2" fill="#e0f2fe" />
          <rect x="50" y="21" width="6" height="47" rx="2" fill="#e0f2fe" />
          {/* Glowing Cyan Core Lock */}
          <rect x="33" y="29" width="14" height="16" rx="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <circle cx="40" cy="37" r="3" fill="#082f49" />
          {/* Sparkles */}
          <circle cx="16" cy="16" r="3" fill="#7dd3fc" />
          <circle cx="66" cy="20" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    )
  }

  if (bannerId === 'vc_vault') {
    // Golden Venture Safe Overflowing with Coins
    return (
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-amber-400/40 blur-xl" />
        <svg viewBox="0 0 80 80" className="relative z-10 h-20 w-20 drop-shadow-[0_6px_10px_rgba(0,0,0,0.65)] animate-float-slow">
          {/* Overflowing Gold Coins Pile at Base */}
          <circle cx="18" cy="64" r="8" fill="#facc15" stroke="#854d0e" strokeWidth="2" />
          <circle cx="64" cy="63" r="9" fill="#fde047" stroke="#854d0e" strokeWidth="2" />
          <circle cx="28" cy="66" r="7" fill="#fef08a" stroke="#854d0e" strokeWidth="2" />
          {/* Golden Safe Body */}
          <rect x="14" y="14" width="52" height="50" rx="10" fill="#ca8a04" stroke="#fef08a" strokeWidth="3" />
          <rect x="20" y="20" width="40" height="38" rx="6" fill="#854d0e" stroke="#facc15" strokeWidth="2" />
          {/* Vault Wheel */}
          <circle cx="40" cy="39" r="12" fill="#fde047" stroke="#422006" strokeWidth="2.5" />
          <line x1="40" y1="25" x2="40" y2="53" stroke="#422006" strokeWidth="3" strokeLinecap="round" />
          <line x1="26" y1="39" x2="54" y2="39" stroke="#422006" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="39" r="5" fill="#fef9c3" stroke="#422006" strokeWidth="2" />
          {/* Crown Jewel on Top */}
          <polygon points="40,5 48,14 32,14" fill="#f43f5e" stroke="#fef08a" strokeWidth="1.5" />
        </svg>
      </div>
    )
  }

  // Purple Quantum Server Core ('asic_matrix')
  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-purple-500/40 blur-xl" />
      <svg viewBox="0 0 80 80" className="relative z-10 h-20 w-20 drop-shadow-[0_6px_10px_rgba(0,0,0,0.65)] animate-float-slow">
        {/* Outer Quantum Ring */}
        <circle cx="40" cy="40" r="30" fill="#2e1065" stroke="#c084fc" strokeWidth="3" strokeDasharray="10 4" />
        {/* Hexagonal Server Core */}
        <polygon points="40,14 62,27 62,53 40,66 18,53 18,27" fill="#581c87" stroke="#e9d5ff" strokeWidth="2.5" />
        {/* Glowing Plasma Blades */}
        <rect x="26" y="28" width="28" height="6" rx="3" fill="#22ff99" />
        <rect x="26" y="38" width="28" height="6" rx="3" fill="#38bdf8" />
        <rect x="26" y="48" width="28" height="6" rx="3" fill="#f43f5e" />
        {/* Center Energy Orb */}
        <circle cx="40" cy="41" r="7" fill="#ffffff" stroke="#a855f7" strokeWidth="3" />
      </svg>
    </div>
  )
}

// ───────────────────────── 6. Expressive Boss Character Avatar SVG ─────────────────────────
interface BossAvatarSvgProps {
  name: string
  portrait: string
  size?: number
}

export function BossAvatarSvg({ name, portrait, size = 54 }: BossAvatarSvgProps) {
  const lower = name.toLowerCase()
  const isWhale = lower.includes('whale')
  const isSec = lower.includes('sec') || lower.includes('auditor')
  const isBagholder = lower.includes('bagholder') || lower.includes('paper')

  return (
    <div
      className="relative flex shrink-0 items-center justify-center animate-float-slow"
      style={{ width: size, height: size }}
    >
      {/* Menacing Crimson/Gold Aura */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/50 to-amber-500/30 blur-md" />

      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-[#fb7185] border-b-4 border-b-[#881337] bg-gradient-to-b from-[#4c0519] via-[#2e1065] to-[#1e1b4b] shadow-lg">
        {isWhale ? (
          /* Custom Expressive "The Whale" Boss SVG */
          <svg viewBox="0 0 64 64" className="h-4/5 w-4/5">
            <path
              d="M10 38 C10 20, 38 16, 48 28 C54 24, 60 18, 60 18 C58 28, 58 36, 62 42 C54 40, 48 38, 44 42 C34 48, 14 48, 10 38 Z"
              fill="#38bdf8"
              stroke="#e0f2fe"
              strokeWidth="2"
            />
            {/* Top Monocle & Gold Crown */}
            <polygon points="22,19 26,11 31,17 36,10 40,19" fill="#fde047" stroke="#854d0e" strokeWidth="1.5" />
            {/* Angry Glowing Eye */}
            <circle cx="24" cy="31" r="4" fill="#fb7185" />
            <circle cx="24" cy="31" r="1.5" fill="#ffffff" />
            {/* Cigar / Menacing Grin */}
            <path d="M15 39 Q24 43 32 39" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        ) : isSec ? (
          /* Custom Expressive "SEC Auditor" Boss SVG */
          <svg viewBox="0 0 64 64" className="h-4/5 w-4/5">
            {/* Suit & Tie */}
            <path d="M14 56 L50 56 L46 38 L18 38 Z" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="32,38 29,52 32,56 35,52" fill="#ef4444" />
            {/* Head & Angry Glasses */}
            <circle cx="32" cy="25" r="12" fill="#fcd34d" stroke="#b45309" strokeWidth="2" />
            <rect x="21" y="21" width="9" height="6" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="34" y="21" width="9" height="6" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="30" y1="24" x2="34" y2="24" stroke="#38bdf8" strokeWidth="2" />
          </svg>
        ) : isBagholder ? (
          /* Custom Expressive "Bagholder" Character SVG */
          <svg viewBox="0 0 64 64" className="h-4/5 w-4/5">
            {/* Giant Heavy Money Bag */}
            <path
              d="M24 22 L40 22 L48 36 C50 48, 44 56, 32 56 C20 56, 14 48, 16 36 Z"
              fill="#b45309"
              stroke="#fde047"
              strokeWidth="2"
            />
            <path d="M24 22 L19 13 L32 17 L45 13 L40 22 Z" fill="#d97706" stroke="#fde047" strokeWidth="1.5" />
            {/* Glowing Red Down Chart on Bag */}
            <circle cx="26" cy="36" r="3" fill="#fb7185" />
            <circle cx="38" cy="36" r="3" fill="#fb7185" />
            <path d="M25 46 Q32 41 39 46" stroke="#fb7185" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <div className="flex flex-col items-center justify-center text-[#fda4af] drop-shadow-[0_2px_6px_rgba(244,63,94,0.8)]">
            <DynamicIcon name={portrait} className="h-7 w-7" />
          </div>
        )}
      </div>
    </div>
  )
}
