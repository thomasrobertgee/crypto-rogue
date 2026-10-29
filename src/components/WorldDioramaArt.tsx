import React from 'react'
import type { HeroId } from '../config/heroes.config'

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
      subtitle: 'Warm Sunset Desert & Fiat Campfire',
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
 */
export const StageLandscapeSvg: React.FC<{
  stage: number
  mode?: 'hub' | 'battle'
  className?: string
}> = ({ stage, mode = 'hub', className = '' }) => {
  const biome = getStageBiomeInfo(stage).id

  if (biome === 'genesis_valley') {
    // Stages 1-3: Lush Green Natural Valley & Camp under a Warm Amber-Sunset Sky (No Dark Voids!)
    return (
      <svg
        viewBox="0 0 400 720"
        preserveAspectRatio="xMidYMid slice"
        className={`w-full h-full select-none pointer-events-none ${className}`}
      >
        <defs>
          <linearGradient id="gvSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="26%" stopColor="#FDBA74" />
            <stop offset="52%" stopColor="#FDE047" />
            <stop offset="78%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#DCFCE7" />
          </linearGradient>
          <radialGradient id="gvSun" cx="50%" cy="44%" r="38%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
            <stop offset="45%" stopColor="#FEF08A" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="gvFarHills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="gvMidHills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="gvMeadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="55%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <radialGradient id="campfireGlow" cx="50%" cy="68%" r="32%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#FB923C" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Warm Sunlit Amber-Sky Backdrop */}
        <rect width="400" height="720" fill="url(#gvSky)" />

        {/* Fluffy Sunlit Clouds */}
        <g fill="#FFFBEB" opacity="0.88">
          <ellipse cx="75" cy="115" rx="44" ry="16" />
          <ellipse cx="95" cy="108" rx="28" ry="14" />
          <ellipse cx="320" cy="95" rx="48" ry="16" />
          <ellipse cx="295" cy="88" rx="30" ry="13" />
        </g>

        {/* Giant Warm Golden Sun */}
        <circle cx="200" cy="300" r="150" fill="url(#gvSun)" />
        <circle cx="200" cy="300" r="62" fill="#FFFBEB" opacity="0.92" />

        {/* Distant City / Server Monolith Silhouettes on the Horizon */}
        <g opacity="0.55" fill="#D97706">
          <rect x="44" y="295" width="22" height="75" rx="3" />
          <rect x="70" y="315" width="16" height="55" rx="2" />
          <rect x="90" y="305" width="18" height="65" rx="2" />
          <rect x="316" y="288" width="24" height="82" rx="3" />
          <rect x="292" y="312" width="18" height="58" rx="2" />
          <rect x="270" y="322" width="16" height="48" rx="2" />
        </g>

        {/* Sunlit Far Emerald Rolling Hills */}
        <path
          d="M0 365 Q95 315 205 355 T400 340 L400 500 L0 500 Z"
          fill="url(#gvFarHills)"
          stroke="#15803D"
          strokeWidth="2.5"
        />

        {/* Mid Lush Green Valley Hills & Stylized Round Trees */}
        <path
          d="M0 408 Q125 368 245 402 T400 388 L400 560 L0 560 Z"
          fill="url(#gvMidHills)"
          stroke="#14532D"
          strokeWidth="2.5"
        />

        {/* Stylized 2D Bushy Trees on Left & Right Hills */}
        <g stroke="#14532D" strokeWidth="2.5">
          <rect x="36" y="392" width="8" height="24" fill="#78350F" />
          <circle cx="40" cy="380" r="20" fill="#22C55E" />
          <circle cx="32" cy="374" r="13" fill="#86EFAC" stroke="none" />

          <rect x="352" y="384" width="8" height="26" fill="#78350F" />
          <circle cx="356" cy="372" r="22" fill="#22C55E" />
          <circle cx="348" cy="365" r="14" fill="#86EFAC" stroke="none" />
        </g>

        {/* Foreground Sunlit Meadow & Warm Sandy Camp Clearing */}
        <ellipse cx="200" cy="560" rx="255" ry="195" fill="url(#gvMeadow)" stroke="#14532D" strokeWidth="3" />
        <ellipse
          cx="200"
          cy="500"
          rx="148"
          ry="44"
          fill="#FDE68A"
          stroke="#B45309"
          strokeWidth="2.5"
        />
        <ellipse cx="200" cy="498" rx="122" ry="32" fill="#FEF3C7" opacity="0.85" />

        {/* Textured Grass Tuft Details & Wildflowers (Only in Hub mode to avoid rogue antenna lines on battle characters) */}
        {mode === 'hub' && (
          <>
            <g stroke="#14532D" strokeWidth="2" strokeLinecap="round">
              <path d="M48 535 L44 525 M52 535 L52 523 M56 535 L60 526" />
              <path d="M338 540 L334 530 M342 540 L342 528 M346 540 L350 531" />
              <path d="M95 568 L91 558 M99 568 L99 556" />
              <path d="M302 565 L298 555 M306 565 L306 553" />
            </g>
            <circle cx="64" cy="532" r="3.5" fill="#FDE047" stroke="#78350F" strokeWidth="1.2" />
            <circle cx="328" cy="536" r="3.5" fill="#FB7185" stroke="#78350F" strokeWidth="1.2" />
          </>
        )}

        {/* Warm Campfire Ground Glow & Floating Sunlit Particles */}
        <circle cx="200" cy="490" r="120" fill="url(#campfireGlow)" />
        <g fill="#FEF08A" stroke="#B45309" strokeWidth="1">
          <circle cx="115" cy="425" r="3.5" className="animate-float-slow" />
          <circle cx="288" cy="415" r="3" className="animate-float-slow" />
          <circle cx="148" cy="365" r="2.5" />
          <circle cx="255" cy="372" r="3" />
        </g>

        {/* Animated Flickering Campfire (shown in Hub) */}
        {mode === 'hub' && (
          <g transform="translate(200, 524)">
            {/* Stone Ring & Wood Logs */}
            <ellipse cx="0" cy="14" rx="40" ry="12" fill="#D97706" opacity="0.35" />
            <rect x="-26" y="2" width="52" height="10" rx="5" transform="rotate(-14)" fill="#78350F" stroke="#451A03" strokeWidth="2" />
            <rect x="-26" y="2" width="52" height="10" rx="5" transform="rotate(14)" fill="#92400E" stroke="#451A03" strokeWidth="2" />
            <circle cx="-22" cy="12" r="6" fill="#A8A29E" stroke="#44403C" strokeWidth="2" />
            <circle cx="-10" cy="15" r="6.5" fill="#D6D3D1" stroke="#44403C" strokeWidth="2" />
            <circle cx="10" cy="15" r="6.5" fill="#A8A29E" stroke="#44403C" strokeWidth="2" />
            <circle cx="22" cy="12" r="6" fill="#D6D3D1" stroke="#44403C" strokeWidth="2" />

            {/* Flickering Cartoon Flames */}
            <g className="animate-campfire">
              <path
                d="M0 -40 C20 -18 26 2 0 11 C-26 2 -20 -18 0 -40 Z"
                fill="#F97316"
                stroke="#7C2D12"
                strokeWidth="2.5"
              />
              <path
                d="M0 -28 C13 -10 17 2 0 9 C-17 2 -13 -10 0 -28 Z"
                fill="#FACC15"
              />
              <path
                d="M0 -16 C7 -5 9 2 0 7 C-9 2 -7 -5 0 -16 Z"
                fill="#FEF9C3"
              />
              <circle cx="-9" cy="-36" r="2.5" fill="#FDE047" />
              <circle cx="11" cy="-43" r="2" fill="#FB923C" />
            </g>
          </g>
        )}
      </svg>
    )
  }

  if (biome === 'bull_run_woods') {
    // Stages 4-8: Bright Sunlit Emerald & Turquoise Crystal Valley (No Dark Voids!)
    return (
      <svg
        viewBox="0 0 400 720"
        preserveAspectRatio="xMidYMid slice"
        className={`w-full h-full select-none pointer-events-none ${className}`}
      >
        <defs>
          <linearGradient id="brwSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="42%" stopColor="#A5F3FC" />
            <stop offset="78%" stopColor="#FEF9C3" />
            <stop offset="100%" stopColor="#BBF7D0" />
          </linearGradient>
          <linearGradient id="brwGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="55%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        <rect width="400" height="720" fill="url(#brwSky)" />
        <circle cx="200" cy="285" r="64" fill="#FFFBEB" opacity="0.92" />

        {/* Sunlit Mountain Peaks */}
        <path
          d="M0 385 L85 280 L175 375 L280 265 L400 375 L400 490 L0 490 Z"
          fill="#6EE7B7"
          stroke="#047857"
          strokeWidth="2.5"
        />

        {/* Stylized Emerald Pines Left & Right */}
        <g fill="#10B981" stroke="#064E3B" strokeWidth="2.5">
          <polygon points="38,305 10,410 66,410" />
          <polygon points="38,340 4,435 72,435" />
          <polygon points="362,300 332,410 392,410" />
          <polygon points="362,338 326,438 398,438" />
        </g>

        {/* Sunlit Meadow Clearing */}
        <ellipse cx="200" cy="555" rx="255" ry="195" fill="url(#brwGround)" stroke="#064E3B" strokeWidth="3" />
        <ellipse cx="200" cy="498" rx="146" ry="42" fill="#FEF3C7" stroke="#047857" strokeWidth="2.5" />

        {/* Sparkling Crypto Crystals */}
        <g stroke="#0F172A" strokeWidth="2">
          <polygon points="48,495 58,448 72,492" fill="#38BDF8" />
          <polygon points="336,495 348,446 362,494" fill="#Facc15" />
        </g>
      </svg>
    )
  }

  // Stages 9+: Bright Golden Sunrise Citadel & Sunlit Terraces
  return (
    <svg
      viewBox="0 0 400 720"
      preserveAspectRatio="xMidYMid slice"
      className={`w-full h-full select-none pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="scSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="45%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
        <linearGradient id="scGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      <rect width="400" height="720" fill="url(#scSky)" />
      <circle cx="200" cy="295" r="76" fill="#FFFBEB" opacity="0.95" />
      <ellipse
        cx="200"
        cy="295"
        rx="142"
        ry="26"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="4"
        transform="rotate(-10 200 295)"
      />

      {/* Golden Citadel Towers */}
      <g fill="#FEF3C7" stroke="#78350F" strokeWidth="2.5">
        <rect x="24" y="280" width="38" height="150" rx="4" />
        <rect x="68" y="315" width="28" height="115" rx="4" />
        <rect x="336" y="275" width="40" height="155" rx="4" />
        <rect x="302" y="310" width="28" height="120" rx="4" />
      </g>

      <ellipse cx="200" cy="555" rx="255" ry="195" fill="url(#scGround)" stroke="#78350F" strokeWidth="3" />
      <ellipse cx="200" cy="498" rx="148" ry="42" fill="#FFFBEB" stroke="#B45309" strokeWidth="2.5" />
    </svg>
  )
}

/**
 * Clean, cohesive Chibi/Mascot SVG illustration for the 4 Collectible Trader Heroes.
 * No random floating geometric triangles or squares.
 */
export const HeroChibiSvg: React.FC<{
  heroId: HeroId
  size?: number
  className?: string
}> = ({ heroId, size = 120, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className={`select-none overflow-visible animate-breathe-bob ${className}`}
    >
      {/* Soft Ground Shadow */}
      <ellipse cx="70" cy="124" rx="34" ry="8" fill="rgba(44, 24, 16, 0.32)" />

      {heroId === 'rookie_satoshi' && (
        <g>
          {/* Chibi Legs & Sneakers */}
          <rect x="52" y="108" width="13" height="14" rx="6" fill="#1E293B" stroke="#2C1810" strokeWidth="3" />
          <rect x="75" y="108" width="13" height="14" rx="6" fill="#1E293B" stroke="#2C1810" strokeWidth="3" />
          <ellipse cx="58" cy="121" rx="9" ry="5" fill="#F97316" stroke="#2C1810" strokeWidth="2.5" />
          <ellipse cx="82" cy="121" rx="9" ry="5" fill="#F97316" stroke="#2C1810" strokeWidth="2.5" />

          {/* Body: Warm Orange Crypto Hoodie */}
          <path
            d="M44 78 Q70 70 96 78 L100 112 Q70 118 40 112 Z"
            fill="#F97316"
            stroke="#2C1810"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Hoodie Strings & CenterBTC Badge */}
          <path d="M63 80 V92 M77 80 V92" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="70" cy="97" r="8" fill="#FDE047" stroke="#2C1810" strokeWidth="2.5" />
          <text x="70" y="101" textAnchor="middle" fill="#2C1810" fontSize="10" fontWeight="900">
            ₿
          </text>

          {/* Chibi Arms / Hands */}
          <circle cx="39" cy="95" r="8" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />
          <circle cx="101" cy="95" r="8" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

          {/* Oversized Cozy Hood & Chibi Head */}
          <path
            d="M34 52 C34 20 106 20 106 52 C108 74 95 84 70 84 C45 84 32 74 34 52 Z"
            fill="#EA580C"
            stroke="#2C1810"
            strokeWidth="3.5"
          />
          <ellipse cx="70" cy="56" rx="26" ry="22" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

          {/* Tousled Dark Hair */}
          <path
            d="M45 45 Q55 32 66 43 Q74 31 85 43 Q92 35 95 46 Z"
            fill="#2C1810"
          />

          {/* Expressive Eyes & Visor Glasses */}
          <rect
            x="48"
            y="47"
            width="44"
            height="13"
            rx="6.5"
            fill="#38BDF8"
            stroke="#2C1810"
            strokeWidth="2.8"
          />
          <line x1="54" y1="51" x2="66" y2="51" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="52" cy="63" r="3.5" fill="#FCA5A5" opacity="0.7" />
          <circle cx="88" cy="63" r="3.5" fill="#FCA5A5" opacity="0.7" />

          {/* Friendly Confident Smile */}
          <path d="M63 67 Q70 73 77 67" fill="none" stroke="#2C1810" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {heroId === 'degen_ape_roxy' && (
        <g>
          {/* Chibi Legs & Sneakers */}
          <rect x="52" y="108" width="13" height="14" rx="6" fill="#1E3A8A" stroke="#2C1810" strokeWidth="3" />
          <rect x="75" y="108" width="13" height="14" rx="6" fill="#1E3A8A" stroke="#2C1810" strokeWidth="3" />
          <ellipse cx="58" cy="121" rx="9" ry="5" fill="#EC4899" stroke="#2C1810" strokeWidth="2.5" />
          <ellipse cx="82" cy="121" rx="9" ry="5" fill="#EC4899" stroke="#2C1810" strokeWidth="2.5" />

          {/* Body: Streetwear Varsity Jacket */}
          <path
            d="M42 78 Q70 70 98 78 L102 112 Q70 118 38 112 Z"
            fill="#2563EB"
            stroke="#2C1810"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M55 82 Q70 96 85 82" fill="none" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />

          {/* Chibi Hands */}
          <circle cx="38" cy="94" r="8" fill="#92400E" stroke="#2C1810" strokeWidth="3" />
          <circle cx="102" cy="94" r="8" fill="#92400E" stroke="#2C1810" strokeWidth="3" />

          {/* Cute Round Ape Ears & Head */}
          <circle cx="36" cy="55" r="10" fill="#92400E" stroke="#2C1810" strokeWidth="3" />
          <circle cx="36" cy="55" r="5" fill="#FDE68A" />
          <circle cx="104" cy="55" r="10" fill="#92400E" stroke="#2C1810" strokeWidth="3" />
          <circle cx="104" cy="55" r="5" fill="#FDE68A" />

          <ellipse cx="70" cy="55" rx="30" ry="25" fill="#92400E" stroke="#2C1810" strokeWidth="3.5" />
          <ellipse cx="70" cy="61" rx="22" ry="16" fill="#FDE68A" stroke="#2C1810" strokeWidth="2" />

          {/* Stylish Pink Visor Shades */}
          <rect x="46" y="44" width="21" height="13" rx="4" fill="#EC4899" stroke="#2C1810" strokeWidth="2.5" />
          <rect x="73" y="44" width="21" height="13" rx="4" fill="#EC4899" stroke="#2C1810" strokeWidth="2.5" />
          <line x1="67" y1="50" x2="73" y2="50" stroke="#2C1810" strokeWidth="3" />
          <line x1="50" y1="48" x2="58" y2="48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="77" y1="48" x2="85" y2="48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

          {/* Golden Street Cap */}
          <path
            d="M44 37 Q70 20 96 37 Z"
            fill="#FACC15"
            stroke="#2C1810"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Cheerful Grin */}
          <path d="M60 66 Q70 73 80 66" fill="none" stroke="#2C1810" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {heroId === 'jordan_the_wolf' && (
        <g>
          {/* Chibi Legs & Dress Shoes */}
          <rect x="52" y="108" width="13" height="14" rx="6" fill="#1E293B" stroke="#2C1810" strokeWidth="3" />
          <rect x="75" y="108" width="13" height="14" rx="6" fill="#1E293B" stroke="#2C1810" strokeWidth="3" />
          <ellipse cx="58" cy="121" rx="9" ry="5" fill="#451A03" stroke="#2C1810" strokeWidth="2.5" />
          <ellipse cx="82" cy="121" rx="9" ry="5" fill="#451A03" stroke="#2C1810" strokeWidth="2.5" />

          {/* Body: Tailored Wall Street Suit + Red Tie */}
          <path
            d="M42 78 Q70 70 98 78 L102 112 Q70 118 38 112 Z"
            fill="#334155"
            stroke="#2C1810"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon points="62,78 78,78 70,94" fill="#FFFFFF" stroke="#2C1810" strokeWidth="2" />
          <polygon points="67,82 73,82 74,108 70,112 66,108" fill="#EF4444" stroke="#2C1810" strokeWidth="1.5" />

          {/* Chibi Paws */}
          <circle cx="38" cy="94" r="8" fill="#94A3B8" stroke="#2C1810" strokeWidth="3" />
          <circle cx="102" cy="94" r="8" fill="#94A3B8" stroke="#2C1810" strokeWidth="3" />

          {/* Wolf Ears & Expressive Head */}
          <polygon points="41,42 48,18 63,34" fill="#64748B" stroke="#2C1810" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="99,42 92,18 77,34" fill="#64748B" stroke="#2C1810" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="70" cy="55" rx="30" ry="24" fill="#94A3B8" stroke="#2C1810" strokeWidth="3.5" />
          <path d="M46 57 Q70 47 94 57 Q84 76 70 76 Q56 76 46 57 Z" fill="#F8FAFC" />

          {/* Gold-Rimmed Aviator Shades */}
          <rect x="46" y="45" width="21" height="12" rx="4" fill="#1E293B" stroke="#FACC15" strokeWidth="2.5" />
          <rect x="73" y="45" width="21" height="12" rx="4" fill="#1E293B" stroke="#FACC15" strokeWidth="2.5" />
          <line x1="67" y1="49" x2="73" y2="49" stroke="#FACC15" strokeWidth="2.5" />

          {/* Wolf Nose & Confident Smirk */}
          <ellipse cx="70" cy="61" rx="4.5" ry="3" fill="#2C1810" />
          <path d="M61 68 Q70 73 80 67" fill="none" stroke="#2C1810" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      )}

      {heroId === 'quantum_ai_oracle' && (
        <g>
          {/* Chibi Boots */}
          <rect x="53" y="108" width="12" height="13" rx="6" fill="#4C1D95" stroke="#2C1810" strokeWidth="3" />
          <rect x="75" y="108" width="12" height="13" rx="6" fill="#4C1D95" stroke="#2C1810" strokeWidth="3" />

          {/* Royal Cyber-Mage Cloak */}
          <path
            d="M42 78 Q70 70 98 78 L104 112 Q70 118 36 112 Z"
            fill="#6B21A8"
            stroke="#2C1810"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="70" cy="96" r="9" fill="#38BDF8" stroke="#2C1810" strokeWidth="2.5" />
          <circle cx="70" cy="96" r="4" fill="#E0F2FE" />

          {/* Chibi Hands */}
          <circle cx="38" cy="94" r="7.5" fill="#E0F2FE" stroke="#2C1810" strokeWidth="3" />
          <circle cx="102" cy="94" r="7.5" fill="#E0F2FE" stroke="#2C1810" strokeWidth="3" />

          {/* Hooded Oracle Head */}
          <path
            d="M36 54 C36 22 104 22 104 54 C106 74 94 84 70 84 C46 84 34 74 36 54 Z"
            fill="#581C87"
            stroke="#2C1810"
            strokeWidth="3.5"
          />
          <ellipse cx="70" cy="56" rx="24" ry="20" fill="#1E1B4B" stroke="#FACC15" strokeWidth="2.5" />

          {/* Expressive Glowing Cyan/Gold Eyes */}
          <ellipse cx="59" cy="54" rx="6" ry="4.5" fill="#38BDF8" />
          <circle cx="59" cy="53" r="2" fill="#FFFFFF" />
          <ellipse cx="81" cy="54" rx="6" ry="4.5" fill="#38BDF8" />
          <circle cx="81" cy="53" r="2" fill="#FFFFFF" />

          {/* Golden Forehead Crest */}
          <circle cx="70" cy="42" r="4.5" fill="#FDE047" stroke="#2C1810" strokeWidth="2" />
        </g>
      )}

      {heroId === 'lady_fortuna' && (
        <g>
          {/* Chibi Heels & Legs */}
          <rect x="53" y="108" width="12" height="13" rx="6" fill="#9F1239" stroke="#2C1810" strokeWidth="3" />
          <rect x="75" y="108" width="12" height="13" rx="6" fill="#9F1239" stroke="#2C1810" strokeWidth="3" />

          {/* Royal Crimson Velvet Gown + Gold Trim */}
          <path
            d="M42 78 Q70 70 98 78 L104 112 Q70 118 36 112 Z"
            fill="#E11D48"
            stroke="#2C1810"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M52 80 Q70 92 88 80" fill="none" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="70" cy="95" r="7" fill="#FACC15" stroke="#2C1810" strokeWidth="2.5" />

          {/* Chibi Hands */}
          <circle cx="38" cy="94" r="7.5" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />
          <circle cx="102" cy="94" r="7.5" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

          {/* Golden Hair & Head */}
          <path
            d="M36 56 C34 26 106 26 104 56 C106 76 92 84 70 84 C48 84 34 76 36 56 Z"
            fill="#F59E0B"
            stroke="#2C1810"
            strokeWidth="3.5"
          />
          <ellipse cx="70" cy="57" rx="25" ry="21" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

          {/* Golden Whale Crown */}
          <polygon
            points="48,36 55,20 70,30 85,20 92,36"
            fill="#FDE047"
            stroke="#2C1810"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="70" cy="28" r="3.5" fill="#F43F5E" />

          {/* Expressive Eyes & Confident Smile */}
          <ellipse cx="59" cy="56" rx="4.5" ry="5.5" fill="#2C1810" />
          <circle cx="57.5" cy="54" r="2" fill="#FFFFFF" />
          <ellipse cx="81" cy="56" rx="4.5" ry="5.5" fill="#2C1810" />
          <circle cx="79.5" cy="54" r="2" fill="#FFFFFF" />
          <circle cx="52" cy="63" r="3.5" fill="#FB7185" opacity="0.65" />
          <circle cx="88" cy="63" r="3.5" fill="#FB7185" opacity="0.65" />
          <path d="M62 67 Q70 73 78 67" fill="none" stroke="#2C1810" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {heroId === 'satoshi_nakamoto' && (
        <g>
          {/* Golden Cyber-Architect Halo */}
          <circle cx="70" cy="52" r="38" fill="none" stroke="#FDE047" strokeWidth="3" strokeDasharray="8 4" />

          {/* Chibi Boots */}
          <rect x="53" y="108" width="12" height="13" rx="6" fill="#78350F" stroke="#2C1810" strokeWidth="3" />
          <rect x="75" y="108" width="12" height="13" rx="6" fill="#78350F" stroke="#2C1810" strokeWidth="3" />

          {/* Golden Sovereign Cloak */}
          <path
            d="M40 78 Q70 68 100 78 L106 112 Q70 118 34 112 Z"
            fill="#F59E0B"
            stroke="#2C1810"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="70" cy="95" r="10" fill="#FEF08A" stroke="#2C1810" strokeWidth="2.5" />
          <text
            x="70"
            y="99"
            textAnchor="middle"
            fill="#B45309"
            fontSize="12"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            ₿
          </text>

          {/* Chibi Hands */}
          <circle cx="37" cy="94" r="7.5" fill="#FEF08A" stroke="#2C1810" strokeWidth="3" />
          <circle cx="103" cy="94" r="7.5" fill="#FEF08A" stroke="#2C1810" strokeWidth="3" />

          {/* Golden Architect Hood */}
          <path
            d="M35 54 C35 20 105 20 105 54 C107 74 94 84 70 84 C46 84 33 74 35 54 Z"
            fill="#D97706"
            stroke="#2C1810"
            strokeWidth="3.5"
          />
          <ellipse cx="70" cy="56" rx="24" ry="20" fill="#1E293B" stroke="#FDE047" strokeWidth="2.5" />

          {/* Glowing Golden Genesis Eyes */}
          <ellipse cx="59" cy="55" rx="6" ry="4.5" fill="#FDE047" />
          <circle cx="59" cy="54" r="2" fill="#FFFFFF" />
          <ellipse cx="81" cy="55" rx="6" ry="4.5" fill="#FDE047" />
          <circle cx="81" cy="54" r="2" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  )
}

/**
 * Large expressive Boss Monster SVG character for the right side of the Battle Arena.
 */
export const BossMonsterSvg: React.FC<{
  stage: number
  enemyName: string
  isHit?: boolean
  size?: number
}> = ({ stage, enemyName, isHit = false, size = 112 }) => {
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
        isHit ? 'scale-110 brightness-150' : 'animate-breathe-bob'
      }`}
    >
      {/* Threat Pedestal */}
      <ellipse cx="70" cy="126" rx="46" ry="11" fill="rgba(0,0,0,0.6)" />
      <ellipse
        cx="70"
        cy="125"
        rx="40"
        ry="7"
        fill="none"
        stroke="#F43F5E"
        strokeWidth="2.5"
        opacity="0.9"
      />

      {archetype === 'zombie' && (
        <g>
          {/* Bagholder Zombie: Hulking undead trader holding heavy "-99% BAG" */}
          <path
            d="M36 74 Q70 62 104 74 L110 118 Q70 124 30 118 Z"
            fill="#3B0764"
            stroke="#1E1B4B"
            strokeWidth="3.5"
          />
          {/* Tattered Red Tie */}
          <polygon points="66,78 74,78 76,106 70,112 64,104" fill="#F43F5E" />
          {/* Zombie Green Head */}
          <rect
            x="40"
            y="28"
            width="60"
            height="48"
            rx="16"
            fill="#84CC16"
            stroke="#1E1B4B"
            strokeWidth="3.5"
          />
          {/* Glowing Red Panic Eyes */}
          <circle cx="56" cy="50" r="8" fill="#FEF08A" stroke="#1E1B4B" strokeWidth="2.5" />
          <circle cx="56" cy="50" r="3.5" fill="#EF4444" />
          <circle cx="84" cy="50" r="9" fill="#FEF08A" stroke="#1E1B4B" strokeWidth="2.5" />
          <circle cx="84" cy="50" r="4" fill="#EF4444" />
          {/* Stitched Mouth */}
          <rect x="52" y="63" width="36" height="8" rx="3" fill="#1E1B4B" />
          <line x1="60" y1="61" x2="60" y2="73" stroke="#FFF" strokeWidth="2" />
          <line x1="70" y1="61" x2="70" y2="73" stroke="#FFF" strokeWidth="2" />
          <line x1="80" y1="61" x2="80" y2="73" stroke="#FFF" strokeWidth="2" />
          {/* Red Crash Candlestick Club */}
          <g transform="translate(10, 42) rotate(-20)">
            <rect x="4" y="0" width="14" height="52" rx="3" fill="#EF4444" stroke="#FECDD3" strokeWidth="2" />
          </g>
        </g>
      )}

      {archetype === 'whale' && (
        <g>
          {/* The Bear Whale: Armored Cyber-Leviathan */}
          <path
            d="M22 76 C22 30 116 30 118 76 C120 106 100 120 70 120 C40 120 20 106 22 76 Z"
            fill="#1E3A8A"
            stroke="#1E1B4B"
            strokeWidth="4"
          />
          {/* Belly Plates */}
          <path d="M36 86 Q70 76 104 86 Q96 116 70 116 Q44 116 36 86 Z" fill="#93C5FD" />
          {/* Glowing Crimson Bear-Whale Eyes */}
          <polygon points="40,56 62,62 44,68" fill="#F43F5E" stroke="#FFE4E6" strokeWidth="1.5" />
          <polygon points="100,56 78,62 96,68" fill="#F43F5E" stroke="#FFE4E6" strokeWidth="1.5" />
          {/* Chomp Jaws */}
          <path d="M40 86 L50 78 L60 86 L70 78 L80 86 L90 78 L100 86" fill="none" stroke="#1E1B4B" strokeWidth="3.5" />
          {/* Golden Whale Crown */}
          <polygon points="52,36 62,18 70,28 78,18 88,36" fill="#FBBF24" stroke="#1E1B4B" strokeWidth="2.5" />
        </g>
      )}

      {archetype === 'mech' && (
        <g>
          {/* SEC Mecha-Auditor: Crimson & Gold Regulator Mech */}
          <rect
            x="34"
            y="68"
            width="72"
            height="50"
            rx="10"
            fill="#475569"
            stroke="#1E1B4B"
            strokeWidth="3.5"
          />
          {/* Glowing Reactor Core */}
          <circle cx="70" cy="94" r="13" fill="#F43F5E" stroke="#FECDD3" strokeWidth="3" />
          {/* Mech Head */}
          <polygon
            points="42,30 98,30 106,68 34,68"
            fill="#334155"
            stroke="#FBBF24"
            strokeWidth="3"
          />
          {/* Crimson Laser Visor */}
          <rect x="46" y="44" width="48" height="12" rx="4" fill="#EF4444" stroke="#FECDD3" strokeWidth="2" />
          {/* Shoulder Subpoena Cannons */}
          <rect x="16" y="58" width="18" height="28" rx="4" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2.5" />
          <rect x="106" y="58" width="18" height="28" rx="4" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  )
}
