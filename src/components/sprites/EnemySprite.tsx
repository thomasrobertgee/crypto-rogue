import React from 'react'

export interface EnemySpriteProps {
  stage: number
  enemyName: string
  isHit?: boolean
  size?: number
  className?: string
}

/**
 * 2.5D Cell-Shaded Enemy Sprite (Bagholder Zombie, Bear Whale, SEC Robot Mech)
 * featuring 2-tone volume shading, top-light specular rims, dynamic ground contact shadow,
 * floating hover bob (`translateY(-4px)`), and pulsing crimson/neon eye glow.
 */
export const EnemySprite: React.FC<EnemySpriteProps> = ({
  stage,
  enemyName,
  isHit = false,
  size = 112,
  className = '',
}) => {
  const lower = enemyName.toLowerCase()
  const archetype: 'zombie' | 'whale' | 'mech' =
    lower.includes('whale') || lower.includes('bear') || stage % 3 === 2
      ? 'whale'
      : lower.includes('sec') || lower.includes('auditor') || lower.includes('citadel') || stage % 3 === 0
      ? 'mech'
      : 'zombie'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className={`select-none overflow-visible transition-transform duration-150 ${
        isHit ? 'scale-110 brightness-150' : ''
      } ${className}`}
    >
      <defs>
        <filter id="enemyShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>

        {/* Bagholder Zombie 2-Tone Gradients */}
        <linearGradient id="zombieSuitCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B21A8" />
          <stop offset="48%" stopColor="#4C1D95" />
          <stop offset="49%" stopColor="#3B0764" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="zombieHeadCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BEF264" />
          <stop offset="52%" stopColor="#84CC16" />
          <stop offset="53%" stopColor="#65A30D" />
          <stop offset="100%" stopColor="#3F6212" />
        </linearGradient>
        <linearGradient id="redCandleClubCell" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="45%" stopColor="#EF4444" />
          <stop offset="46%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* Bear Whale 2-Tone Gradients */}
        <linearGradient id="whaleBodyCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="48%" stopColor="#1D4ED8" />
          <stop offset="49%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="whaleBellyCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="55%" stopColor="#93C5FD" />
          <stop offset="56%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* SEC Mecha-Auditor 2-Tone Gradients */}
        <linearGradient id="mechArmorCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="48%" stopColor="#475569" />
          <stop offset="49%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="mechGoldCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="51%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Dynamic Ground Contact Shadow & Threat Ring */}
      <ellipse
        cx="70"
        cy="126"
        rx="44"
        ry="10"
        fill="rgba(15, 23, 42, 0.45)"
        filter="url(#enemyShadowBlur)"
        className="animate-contact-shadow"
      />
      <ellipse
        cx="70"
        cy="125"
        rx="38"
        ry="6.5"
        fill="none"
        stroke="#F43F5E"
        strokeWidth="2"
        opacity="0.85"
        className="animate-contact-shadow"
      />

      {/* Floating Hover Bob Group (`translateY(-4px)`) */}
      <g className="animate-enemy-hover">
        {archetype === 'zombie' && (
          <g>
            {/* Bagholder Zombie: 2-Tone Cell-Shaded Hulking Torso */}
            <path
              d="M36 74 Q70 62 104 74 L110 118 Q70 124 30 118 Z"
              fill="url(#zombieSuitCell)"
              stroke="#0F172A"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Top-Light Specular Rim on Shoulders */}
            <path
              d="M40 75 Q70 65 100 75"
              fill="none"
              stroke="#C084FC"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
            />
            {/* Lower Torso Dark Shadow Fold */}
            <path
              d="M32 106 Q70 113 108 106 L110 117 Q70 123 30 117 Z"
              fill="#090414"
              opacity="0.45"
            />

            {/* Tattered Crimson Tie */}
            <polygon points="66,78 74,78 76,106 70,112 64,104" fill="#F43F5E" stroke="#881337" strokeWidth="1.5" />

            {/* 2-Tone Cell-Shaded Zombie Green Head */}
            <rect
              x="40"
              y="28"
              width="60"
              height="48"
              rx="16"
              fill="url(#zombieHeadCell)"
              stroke="#0F172A"
              strokeWidth="3.5"
            />
            {/* Top Helmet/Forehead Specular Rim */}
            <path
              d="M50 32 H90"
              stroke="#ECFCCB"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Pulsing Crimson / Neon Panic Eyes */}
            <g className="animate-eye-glow">
              <circle cx="56" cy="50" r="8" fill="#FEF08A" stroke="#0F172A" strokeWidth="2.5" />
              <circle cx="56" cy="50" r="4" fill="#EF4444" />
              <circle cx="54.5" cy="48.5" r="1.5" fill="#FFFFFF" />

              <circle cx="84" cy="50" r="9" fill="#FEF08A" stroke="#0F172A" strokeWidth="2.5" />
              <circle cx="84" cy="50" r="4.5" fill="#EF4444" />
              <circle cx="82.5" cy="48.5" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Stitched Mouth */}
            <rect x="52" y="63" width="36" height="8" rx="3" fill="#0F172A" />
            <line x1="60" y1="61" x2="60" y2="73" stroke="#E2E8F0" strokeWidth="2" />
            <line x1="70" y1="61" x2="70" y2="73" stroke="#E2E8F0" strokeWidth="2" />
            <line x1="80" y1="61" x2="80" y2="73" stroke="#E2E8F0" strokeWidth="2" />

            {/* 2-Tone Red Crash Candlestick Club */}
            <g transform="translate(10, 42) rotate(-20)">
              <line x1="11" y1="-8" x2="11" y2="60" stroke="#EF4444" strokeWidth="2.5" />
              <rect
                x="4"
                y="0"
                width="14"
                height="52"
                rx="3"
                fill="url(#redCandleClubCell)"
                stroke="#FECDD3"
                strokeWidth="2"
              />
            </g>
          </g>
        )}

        {archetype === 'whale' && (
          <g>
            {/* The Bear Whale: 2-Tone Armored Cyber-Leviathan */}
            <path
              d="M22 76 C22 30 116 30 118 76 C120 106 100 120 70 120 C40 120 20 106 22 76 Z"
              fill="url(#whaleBodyCell)"
              stroke="#0F172A"
              strokeWidth="4"
            />
            {/* Top Specular Highlight on Whale Back */}
            <path
              d="M42 46 Q70 34 98 46"
              fill="none"
              stroke="#93C5FD"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* 2-Tone Belly Plates */}
            <path d="M36 86 Q70 76 104 86 Q96 116 70 116 Q44 116 36 86 Z" fill="url(#whaleBellyCell)" />

            {/* Pulsing Crimson Bear-Whale Eyes */}
            <g className="animate-eye-glow">
              <polygon points="40,56 62,62 44,68" fill="#F43F5E" stroke="#FFE4E6" strokeWidth="1.5" />
              <polygon points="100,56 78,62 96,68" fill="#F43F5E" stroke="#FFE4E6" strokeWidth="1.5" />
            </g>

            {/* Chomp Jaws */}
            <path d="M40 86 L50 78 L60 86 L70 78 L80 86 L90 78 L100 86" fill="none" stroke="#0F172A" strokeWidth="3.5" />
            {/* Golden Whale Crown */}
            <polygon points="52,36 62,18 70,28 78,18 88,36" fill="url(#mechGoldCell)" stroke="#0F172A" strokeWidth="2.5" />
          </g>
        )}

        {archetype === 'mech' && (
          <g>
            {/* SEC Mecha-Auditor: 2-Tone Metallic Regulator Mech */}
            <rect
              x="34"
              y="68"
              width="72"
              height="50"
              rx="10"
              fill="url(#mechArmorCell)"
              stroke="#0F172A"
              strokeWidth="3.5"
            />
            <line x1="42" y1="72" x2="98" y2="72" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

            {/* Pulsing Reactor Core */}
            <circle
              cx="70"
              cy="94"
              r="13"
              fill="#F43F5E"
              stroke="#FECDD3"
              strokeWidth="3"
              className="animate-eye-glow"
            />
            <circle cx="70" cy="94" r="5" fill="#FFFFFF" />

            {/* 2-Tone Mech Head */}
            <polygon
              points="42,30 98,30 106,68 34,68"
              fill="url(#mechArmorCell)"
              stroke="#FBBF24"
              strokeWidth="3"
            />
            <line x1="46" y1="34" x2="94" y2="34" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />

            {/* Pulsing Crimson Laser Visor */}
            <rect
              x="46"
              y="44"
              width="48"
              height="12"
              rx="4"
              fill="#EF4444"
              stroke="#FECDD3"
              strokeWidth="2"
              className="animate-eye-glow"
            />
            <line x1="52" y1="48" x2="72" y2="48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

            {/* 2-Tone Shoulder Subpoena Cannons */}
            <rect x="16" y="58" width="18" height="28" rx="4" fill="url(#mechGoldCell)" stroke="#0F172A" strokeWidth="2.5" />
            <rect x="106" y="58" width="18" height="28" rx="4" fill="url(#mechGoldCell)" stroke="#0F172A" strokeWidth="2.5" />
          </g>
        )}
      </g>
    </svg>
  )
}
