import React from 'react'
import type { HeroId } from '../config/heroes.config'
import { HeroSprite } from './sprites/HeroSprite'
import { EnemySprite } from './sprites/EnemySprite'

/**
 * Glossy red notification badge (`!`) used on bottom tabs and floating home screen icons.
 */
export const RedAlertBadge: React.FC<{ className?: string }> = ({
  className = '-top-1 -right-1',
}) => (
  <span
    className={`pointer-events-none absolute z-20 bg-rose-500 border-2 border-white text-white font-display font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(244,63,94,0.8)] animate-bounce leading-none ${className}`}
  >
    !
  </span>
)

export function getStageBiomeInfo(stage: number): {
  id: 'genesis_valley' | 'bull_run_woods' | 'satoshi_citadel'
  name: string
  subtitle: string
  badgeColor: string
} {
  if (stage <= 3) {
    return {
      id: 'genesis_valley',
      name: 'Genesis Valley',
      subtitle: 'Blockchain Outskirts & Cyber Horizon',
      badgeColor: '#F59E0B',
    }
  }
  if (stage <= 8) {
    return {
      id: 'bull_run_woods',
      name: 'Bull Run Woods',
      subtitle: 'Neon Cyber-Forest & Crypto Crystals',
      badgeColor: '#10B981',
    }
  }
  return {
    id: 'satoshi_citadel',
    name: 'Wall Street Citadel',
    subtitle: 'Golden Bull Sanctum & Moon Orbit',
    badgeColor: '#A855F7',
  }
}

/**
 * Full-bleed illustrated SVG world backdrop for both the Home Screen Diorama and Battle Arena.
 * In `battle` mode, renders atmospheric dark-gradient hills, transmission towers, and the
 * Holographic Circuit Stage so green and red candlesticks pop dramatically off the canvas.
 */
export const StageLandscapeSvg: React.FC<{
  stage: number
  mode?: 'hub' | 'battle'
  className?: string
}> = ({ stage, mode = 'hub', className = '' }) => {
  const biome = getStageBiomeInfo(stage).id

  if (mode === 'battle') {
    const accentColor =
      biome === 'bull_run_woods' ? '#10B981' : biome === 'satoshi_citadel' ? '#A855F7' : '#06B6D4'
    return (
      <svg
        viewBox="0 0 400 720"
        preserveAspectRatio="xMidYMid slice"
        className={`w-full h-full select-none pointer-events-none ${className}`}
      >
        <defs>
          <linearGradient id="battleNightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050811" />
            <stop offset="32%" stopColor="#0F172A" />
            <stop offset="58%" stopColor="#1E1B4B" />
            <stop offset="82%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#060913" />
          </linearGradient>
          <radialGradient id="battleHorizonGlow" cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.28" />
            <stop offset="50%" stopColor="#4C1D95" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#050811" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="battleFarHills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="battleMidHills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#070B14" />
          </linearGradient>
          <radialGradient id="holoDiscGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.82" />
            <stop offset="72%" stopColor="#090D16" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.24" />
          </radialGradient>
        </defs>

        {/* Deep Atmospheric Dark Gradient Sky */}
        <rect width="400" height="720" fill="url(#battleNightSky)" />
        <circle cx="200" cy="340" r="210" fill="url(#battleHorizonGlow)" />

        {/* Distant Cyber Grid & Star Nodes */}
        <g fill="#38BDF8" opacity="0.35">
          <circle cx="52" cy="96" r="1.2" />
          <circle cx="138" cy="68" r="1.5" />
          <circle cx="268" cy="82" r="1.2" />
          <circle cx="342" cy="110" r="1.6" />
          <circle cx="195" cy="128" r="1" />
        </g>

        {/* Distant Transmission Towers & Power Grid Silhouettes */}
        <g stroke="#1E293B" strokeWidth="1.8" fill="none" opacity="0.85">
          {/* Left Transmission Tower */}
          <path d="M58 345 L68 230 L78 345 M61 260 H75 M56 285 H80 M53 310 H83" />
          <line x1="63" y1="260" x2="75" y2="285" strokeWidth="1.2" />
          <line x1="73" y1="260" x2="61" y2="285" strokeWidth="1.2" />
          <circle cx="68" cy="228" r="2.2" fill="#EF4444" stroke="none">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite" />
          </circle>

          {/* Right Transmission Tower */}
          <path d="M322 338 L332 215 L342 338 M325 245 H339 M320 272 H344 M317 300 H347" />
          <line x1="327" y1="245" x2="339" y2="272" strokeWidth="1.2" />
          <line x1="337" y1="245" x2="325" y2="272" strokeWidth="1.2" />
          <circle cx="332" cy="213" r="2.2" fill="#EF4444" stroke="none">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.6s" repeatCount="indefinite" />
          </circle>

          {/* Catenary High-Voltage Power Lines */}
          <path d="M0 275 Q34 295 56 285" stroke="#334155" strokeWidth="1" opacity="0.6" />
          <path d="M80 285 Q200 335 320 272" stroke="#334155" strokeWidth="1.1" opacity="0.55" />
          <path d="M344 272 Q372 288 400 268" stroke="#334155" strokeWidth="1" opacity="0.6" />
        </g>

        {/* Layered Silhouettes of Distant Hills */}
        <path
          d="M0 365 Q95 318 205 352 T400 336 L400 520 L0 520 Z"
          fill="url(#battleFarHills)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        <path
          d="M0 412 Q130 374 250 404 T400 390 L400 720 L0 720 Z"
          fill="url(#battleMidHills)"
          stroke="#1E293B"
          strokeWidth="2"
        />

        {/* Sleek Holographic Circuit Stage (Replaces flat beige dirt ellipse) */}
        <g transform="translate(200, 505)">
          {/* Outer Neon Cyan Ambient Glow */}
          <ellipse cx="0" cy="4" rx="164" ry="52" fill="#06B6D4" opacity="0.14" />
          {/* Dark Glass Disc */}
          <ellipse
            cx="0"
            cy="0"
            rx="154"
            ry="46"
            fill="url(#holoDiscGrad)"
            stroke="#22D3EE"
            strokeWidth="2.2"
            strokeOpacity="0.55"
          />
          {/* Inner Concentric Circuit Rings */}
          <ellipse
            cx="0"
            cy="0"
            rx="126"
            ry="36"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="1.2"
            strokeDasharray="10 6"
            opacity="0.45"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="88"
            ry="24"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1"
            opacity="0.35"
          />
          {/* Radial Circuit Traces & Nodes */}
          <g stroke="#22D3EE" strokeWidth="1" opacity="0.4">
            <line x1="-148" y1="0" x2="-88" y2="0" />
            <line x1="88" y1="0" x2="148" y2="0" />
            <line x1="0" y1="-44" x2="0" y2="-24" />
            <line x1="0" y1="24" x2="0" y2="44" />
            <circle cx="-88" cy="0" r="2.2" fill="#22D3EE" />
            <circle cx="88" cy="0" r="2.2" fill="#22D3EE" />
          </g>
          {/* Faint Glowing Candlestick Tick Marks Engraved into Arena Surface */}
          <g opacity="0.32">
            <line x1="-55" y1="-10" x2="-55" y2="10" stroke="#22C55E" strokeWidth="1.5" />
            <rect x="-58" y="-5" width="6" height="10" rx="1" fill="#22C55E" />
            <line x1="-28" y1="-14" x2="-28" y2="6" stroke="#22C55E" strokeWidth="1.5" />
            <rect x="-31" y="-9" width="6" height="9" rx="1" fill="#22C55E" />
            <line x1="0" y1="-8" x2="0" y2="12" stroke="#EF4444" strokeWidth="1.5" />
            <rect x="-3" y="-3" width="6" height="10" rx="1" fill="#EF4444" />
            <line x1="28" y1="-15" x2="28" y2="8" stroke="#22C55E" strokeWidth="1.5" />
            <rect x="25" y="-10" width="6" height="12" rx="1" fill="#22C55E" />
            <line x1="55" y1="-6" x2="55" y2="12" stroke="#EF4444" strokeWidth="1.5" />
            <rect x="52" y="-2" width="6" height="9" rx="1" fill="#EF4444" />
          </g>
        </g>
      </svg>
    )
  }

  // Hub Mode Backdrop
  return (
    <svg
      viewBox="0 0 400 720"
      preserveAspectRatio="xMidYMid slice"
      className={`w-full h-full select-none pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="gvSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="28%" stopColor="#4C1D95" />
          <stop offset="54%" stopColor="#9D174D" />
          <stop offset="78%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
        <linearGradient id="gvFarHills" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="gvMidHills" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532D" />
          <stop offset="100%" stopColor="#052E16" />
        </linearGradient>
        <linearGradient id="gvMeadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15803D" />
          <stop offset="55%" stopColor="#166534" />
          <stop offset="100%" stopColor="#052E16" />
        </linearGradient>
        <radialGradient id="campfireGlow" cx="50%" cy="68%" r="35%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#FB923C" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="720" fill="url(#gvSky)" />
      <path
        d="M0 365 Q95 315 205 355 T400 340 L400 500 L0 500 Z"
        fill="url(#gvFarHills)"
        stroke="#0F172A"
        strokeWidth="2.5"
      />
      <path
        d="M0 408 Q125 368 245 402 T400 388 L400 560 L0 560 Z"
        fill="url(#gvMidHills)"
        stroke="#052E16"
        strokeWidth="2.5"
      />
      <ellipse cx="200" cy="560" rx="255" ry="195" fill="url(#gvMeadow)" stroke="#052E16" strokeWidth="3" />
      <circle cx="200" cy="490" r="130" fill="url(#campfireGlow)" />
    </svg>
  )
}

/**
 * Clean, cohesive 2.5D Cell-Shaded Chibi/Mascot SVG illustration for Collectible Trader Heroes.
 */
export const HeroChibiSvg: React.FC<{
  heroId: HeroId
  size?: number
  className?: string
}> = ({ heroId, size = 120, className = '' }) => {
  return <HeroSprite heroId={heroId} size={size} className={className} />
}

/**
 * Large expressive 2.5D Cell-Shaded Boss Monster SVG character for the Battle Arena.
 */
export const BossMonsterSvg: React.FC<{
  stage: number
  enemyName: string
  isHit?: boolean
  size?: number
}> = ({ stage, enemyName, isHit = false, size = 112 }) => {
  return <EnemySprite stage={stage} enemyName={enemyName} isHit={isHit} size={size} />
}
