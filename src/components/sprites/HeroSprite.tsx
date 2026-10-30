import React from 'react'
import type { HeroId } from '../../config/heroes.config'

export interface HeroSpriteProps {
  heroId: HeroId
  size?: number
  className?: string
}

/**
 * 2.5D Cell-Shaded Hero Sprite with Top-Light Specular Rim, Lower-Half Volume Shading,
 * Animated Visor Light Sheen, and Synchronized Ground Contact Shadow + Idle Breathing.
 */
export const HeroSprite: React.FC<HeroSpriteProps> = ({
  heroId,
  size = 120,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className={`select-none overflow-visible ${className}`}
    >
      <defs>
        {/* Soft Blur for Dynamic Ground Contact Shadow */}
        <filter id="heroShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>

        {/* Rookie Satoshi 2-Tone Cell Gradients */}
        <linearGradient id="satoshiHoodCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="52%" stopColor="#F97316" />
          <stop offset="53%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="satoshiTorsoCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="48%" stopColor="#F97316" />
          <stop offset="49%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="satoshiVisorCyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="45%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <clipPath id="satoshiVisorClip">
          <rect x="48" y="47" width="44" height="13" rx="6.5" />
        </clipPath>

        {/* Degen Ape Roxy 2-Tone Cell Gradients */}
        <linearGradient id="roxyJacketCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="51%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="roxyFurCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="52%" stopColor="#92400E" />
          <stop offset="53%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        {/* Jordan the Wolf 2-Tone Cell Gradients */}
        <linearGradient id="wolfSuitCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="48%" stopColor="#334155" />
          <stop offset="49%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="wolfFurCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="54%" stopColor="#94A3B8" />
          <stop offset="55%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Quantum AI Oracle 2-Tone Cell Gradients */}
        <linearGradient id="oracleCloakCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#7E22CE" />
          <stop offset="51%" stopColor="#581C87" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>

        {/* Lady Fortuna 2-Tone Cell Gradients */}
        <linearGradient id="fortunaGownCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="51%" stopColor="#BE123C" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        {/* Satoshi Nakamoto 2-Tone Cell Gradients */}
        <linearGradient id="nakamotoGoldCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="51%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Skin 2-Tone Cell Shading */}
        <linearGradient id="skinCell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="58%" stopColor="#FDE68A" />
          <stop offset="59%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Dynamic Ground Contact Shadow (Scales in sync with 2.2s idle breathing) */}
      <ellipse
        cx="70"
        cy="125"
        rx="36"
        ry="8.5"
        fill="rgba(15, 23, 42, 0.45)"
        filter="url(#heroShadowBlur)"
        className="animate-contact-shadow"
      />

      {/* Organic Idle Breathing Group: scaleY(1.025) scaleX(0.985) over 2.2s ease-in-out */}
      <g className="animate-idle-breathe">
        {heroId === 'rookie_satoshi' && (
          <g>
            {/* Chibi Legs & 2-Tone Sneakers */}
            <rect x="52" y="108" width="13" height="14" rx="6" fill="#0F172A" stroke="#2C1810" strokeWidth="3" />
            <rect x="54" y="109" width="4" height="6" rx="2" fill="#334155" />
            <rect x="75" y="108" width="13" height="14" rx="6" fill="#0F172A" stroke="#2C1810" strokeWidth="3" />
            <rect x="77" y="109" width="4" height="6" rx="2" fill="#334155" />
            <ellipse cx="58" cy="121" rx="9.5" ry="5" fill="url(#satoshiTorsoCell)" stroke="#2C1810" strokeWidth="2.5" />
            <ellipse cx="82" cy="121" rx="9.5" ry="5" fill="url(#satoshiTorsoCell)" stroke="#2C1810" strokeWidth="2.5" />

            {/* Body: 2-Tone Cell-Shaded Crypto Hoodie */}
            <path
              d="M44 78 Q70 70 96 78 L100 112 Q70 118 40 112 Z"
              fill="url(#satoshiTorsoCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Top-Light Specular Rim on Shoulders */}
            <path
              d="M47 80 Q70 73 93 80"
              fill="none"
              stroke="#FFEDD5"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Lower Torso Cell Shadow Fold */}
            <path
              d="M42 103 Q70 109 98 103 L99 111 Q70 117 41 111 Z"
              fill="#7C2D12"
              opacity="0.35"
            />

            {/* Hoodie Strings & Center BTC Badge */}
            <path d="M63 80 V92 M77 80 V92" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="70" cy="97" r="8.5" fill="url(#nakamotoGoldCell)" stroke="#2C1810" strokeWidth="2.5" />
            <text x="70" y="101" textAnchor="middle" fill="#2C1810" fontSize="10" fontWeight="900">
              ₿
            </text>

            {/* Cell-Shaded Chibi Arms / Hands */}
            <circle cx="39" cy="95" r="8" fill="url(#skinCell)" stroke="#2C1810" strokeWidth="3" />
            <circle cx="101" cy="95" r="8" fill="url(#skinCell)" stroke="#2C1810" strokeWidth="3" />

            {/* Oversized 2-Tone Cell-Shaded Hood & Head */}
            <path
              d="M34 52 C34 20 106 20 106 52 C108 74 95 84 70 84 C45 84 32 74 34 52 Z"
              fill="url(#satoshiHoodCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
            />
            {/* Specular Crown Highlight on Hood */}
            <path
              d="M44 35 Q70 23 96 35"
              fill="none"
              stroke="#FED7AA"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Chibi Face with 2-Tone Skin Shading */}
            <ellipse cx="70" cy="56" rx="26" ry="22" fill="url(#skinCell)" stroke="#2C1810" strokeWidth="3" />

            {/* Tousled Dark Hair with Specular Rim */}
            <path
              d="M45 45 Q55 32 66 43 Q74 31 85 43 Q92 35 95 46 Z"
              fill="#2C1810"
            />
            <path d="M52 38 Q58 34 63 39 M73 37 Q78 33 83 39" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />

            {/* Glossy Cyan Gradient Visor with Animated Light Sheen Sweep every 4s */}
            <g clipPath="url(#satoshiVisorClip)">
              <rect x="48" y="47" width="44" height="13" rx="6.5" fill="url(#satoshiVisorCyan)" />
              {/* Lower Visor Cell Shadow */}
              <rect x="48" y="54" width="44" height="6" fill="#0369A1" opacity="0.45" />
              {/* Animated Light Sheen Sweep */}
              <rect
                x="44"
                y="44"
                width="14"
                height="20"
                fill="rgba(255, 255, 255, 0.78)"
                className="animate-visor-sheen"
              />
            </g>
            <rect
              x="48"
              y="47"
              width="44"
              height="13"
              rx="6.5"
              fill="none"
              stroke="#2C1810"
              strokeWidth="2.8"
            />
            {/* Crisp Top Rim Highlight on Visor */}
            <line x1="54" y1="50.5" x2="68" y2="50.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />

            {/* Rosy Cheeks & Confident Smile */}
            <circle cx="52" cy="63" r="3.5" fill="#FB7185" opacity="0.7" />
            <circle cx="88" cy="63" r="3.5" fill="#FB7185" opacity="0.7" />
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

            {/* Body: 2-Tone Streetwear Varsity Jacket */}
            <path
              d="M42 78 Q70 70 98 78 L102 112 Q70 118 38 112 Z"
              fill="url(#roxyJacketCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M46 80 Q70 73 94 80" fill="none" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M55 82 Q70 96 85 82" fill="none" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />

            {/* Chibi Hands */}
            <circle cx="38" cy="94" r="8" fill="url(#roxyFurCell)" stroke="#2C1810" strokeWidth="3" />
            <circle cx="102" cy="94" r="8" fill="url(#roxyFurCell)" stroke="#2C1810" strokeWidth="3" />

            {/* Cute Round Ape Ears & 2-Tone Head */}
            <circle cx="36" cy="55" r="10" fill="url(#roxyFurCell)" stroke="#2C1810" strokeWidth="3" />
            <circle cx="36" cy="55" r="5" fill="#FDE68A" />
            <circle cx="104" cy="55" r="10" fill="url(#roxyFurCell)" stroke="#2C1810" strokeWidth="3" />
            <circle cx="104" cy="55" r="5" fill="#FDE68A" />

            <ellipse cx="70" cy="55" rx="30" ry="25" fill="url(#roxyFurCell)" stroke="#2C1810" strokeWidth="3.5" />
            <ellipse cx="70" cy="61" rx="22" ry="16" fill="url(#skinCell)" stroke="#2C1810" strokeWidth="2" />

            {/* Stylish Pink Visor Shades */}
            <rect x="46" y="44" width="21" height="13" rx="4" fill="#EC4899" stroke="#2C1810" strokeWidth="2.5" />
            <rect x="73" y="44" width="21" height="13" rx="4" fill="#EC4899" stroke="#2C1810" strokeWidth="2.5" />
            <line x1="67" y1="50" x2="73" y2="50" stroke="#2C1810" strokeWidth="3" />
            <line x1="50" y1="47.5" x2="59" y2="47.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="77" y1="47.5" x2="86" y2="47.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />

            {/* Golden Street Cap with Specular Highlight */}
            <path
              d="M44 37 Q70 20 96 37 Z"
              fill="url(#nakamotoGoldCell)"
              stroke="#2C1810"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M52 31 Q70 23 88 31" fill="none" stroke="#FEF9C3" strokeWidth="2" strokeLinecap="round" />

            {/* Cheerful Grin */}
            <path d="M60 66 Q70 73 80 66" fill="none" stroke="#2C1810" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {heroId === 'jordan_the_wolf' && (
          <g>
            {/* Chibi Legs & Dress Shoes */}
            <rect x="52" y="108" width="13" height="14" rx="6" fill="#0F172A" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="13" height="14" rx="6" fill="#0F172A" stroke="#2C1810" strokeWidth="3" />
            <ellipse cx="58" cy="121" rx="9" ry="5" fill="#451A03" stroke="#2C1810" strokeWidth="2.5" />
            <ellipse cx="82" cy="121" rx="9" ry="5" fill="#451A03" stroke="#2C1810" strokeWidth="2.5" />

            {/* Body: 2-Tone Tailored Wall Street Suit + Red Tie */}
            <path
              d="M42 78 Q70 70 98 78 L102 112 Q70 118 38 112 Z"
              fill="url(#wolfSuitCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M46 80 Q70 74 94 80" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <polygon points="62,78 78,78 70,94" fill="#FFFFFF" stroke="#2C1810" strokeWidth="2" />
            <polygon points="67,82 73,82 74,108 70,112 66,108" fill="#EF4444" stroke="#2C1810" strokeWidth="1.5" />

            {/* Chibi Paws */}
            <circle cx="38" cy="94" r="8" fill="url(#wolfFurCell)" stroke="#2C1810" strokeWidth="3" />
            <circle cx="102" cy="94" r="8" fill="url(#wolfFurCell)" stroke="#2C1810" strokeWidth="3" />

            {/* Wolf Ears & Expressive 2-Tone Head */}
            <polygon points="41,42 48,18 63,34" fill="url(#wolfFurCell)" stroke="#2C1810" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="99,42 92,18 77,34" fill="url(#wolfFurCell)" stroke="#2C1810" strokeWidth="3" strokeLinejoin="round" />
            <ellipse cx="70" cy="55" rx="30" ry="24" fill="url(#wolfFurCell)" stroke="#2C1810" strokeWidth="3.5" />
            <path d="M46 57 Q70 47 94 57 Q84 76 70 76 Q56 76 46 57 Z" fill="#F8FAFC" />

            {/* Gold-Rimmed Aviator Shades */}
            <rect x="46" y="45" width="21" height="12" rx="4" fill="#0F172A" stroke="#FACC15" strokeWidth="2.5" />
            <rect x="73" y="45" width="21" height="12" rx="4" fill="#0F172A" stroke="#FACC15" strokeWidth="2.5" />
            <line x1="50" y1="48" x2="58" y2="48" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="77" y1="48" x2="85" y2="48" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="67" y1="49" x2="73" y2="49" stroke="#FACC15" strokeWidth="2.5" />

            {/* Wolf Nose & Confident Smirk */}
            <ellipse cx="70" cy="61" rx="4.5" ry="3" fill="#2C1810" />
            <path d="M61 68 Q70 73 80 67" fill="none" stroke="#2C1810" strokeWidth="2.8" strokeLinecap="round" />
          </g>
        )}

        {heroId === 'quantum_ai_oracle' && (
          <g>
            {/* Chibi Boots */}
            <rect x="53" y="108" width="12" height="13" rx="6" fill="#3B0764" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="12" height="13" rx="6" fill="#3B0764" stroke="#2C1810" strokeWidth="3" />

            {/* Royal 2-Tone Cyber-Mage Cloak */}
            <path
              d="M42 78 Q70 70 98 78 L104 112 Q70 118 36 112 Z"
              fill="url(#oracleCloakCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M46 80 Q70 73 94 80" fill="none" stroke="#D8B4FE" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="70" cy="96" r="9" fill="url(#satoshiVisorCyan)" stroke="#2C1810" strokeWidth="2.5" />
            <circle cx="70" cy="96" r="4" fill="#E0F2FE" />

            {/* Chibi Hands */}
            <circle cx="38" cy="94" r="7.5" fill="#E0F2FE" stroke="#2C1810" strokeWidth="3" />
            <circle cx="102" cy="94" r="7.5" fill="#E0F2FE" stroke="#2C1810" strokeWidth="3" />

            {/* Hooded Oracle Head */}
            <path
              d="M36 54 C36 22 104 22 104 54 C106 74 94 84 70 84 C46 84 34 74 36 54 Z"
              fill="url(#oracleCloakCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
            />
            <path d="M46 35 Q70 25 94 35" fill="none" stroke="#E9D5FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            <ellipse cx="70" cy="56" rx="24" ry="20" fill="#0F172A" stroke="#FACC15" strokeWidth="2.5" />

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
            <rect x="53" y="108" width="12" height="13" rx="6" fill="#881337" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="12" height="13" rx="6" fill="#881337" stroke="#2C1810" strokeWidth="3" />

            {/* Royal 2-Tone Crimson Velvet Gown + Gold Trim */}
            <path
              d="M42 78 Q70 70 98 78 L104 112 Q70 118 36 112 Z"
              fill="url(#fortunaGownCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M52 80 Q70 92 88 80" fill="none" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="70" cy="95" r="7" fill="url(#nakamotoGoldCell)" stroke="#2C1810" strokeWidth="2.5" />

            {/* Chibi Hands */}
            <circle cx="38" cy="94" r="7.5" fill="url(#skinCell)" stroke="#2C1810" strokeWidth="3" />
            <circle cx="102" cy="94" r="7.5" fill="url(#skinCell)" stroke="#2C1810" strokeWidth="3" />

            {/* Golden Hair & Head */}
            <path
              d="M36 56 C34 26 106 26 104 56 C106 76 92 84 70 84 C48 84 34 76 36 56 Z"
              fill="url(#nakamotoGoldCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
            />
            <ellipse cx="70" cy="57" rx="25" ry="21" fill="url(#skinCell)" stroke="#2C1810" strokeWidth="3" />

            {/* Golden Whale Crown */}
            <polygon
              points="48,36 55,20 70,30 85,20 92,36"
              fill="url(#nakamotoGoldCell)"
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

            {/* Golden 2-Tone Sovereign Cloak */}
            <path
              d="M40 78 Q70 68 100 78 L106 112 Q70 118 34 112 Z"
              fill="url(#nakamotoGoldCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M45 80 Q70 72 95 80" fill="none" stroke="#FEF9C3" strokeWidth="2.5" strokeLinecap="round" />
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
              fill="url(#nakamotoGoldCell)"
              stroke="#2C1810"
              strokeWidth="3.5"
            />
            <path d="M45 34 Q70 22 95 34" fill="none" stroke="#FEF9C3" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="70" cy="56" rx="24" ry="20" fill="#0F172A" stroke="#FDE047" strokeWidth="2.5" />

            {/* Glowing Golden Genesis Eyes */}
            <ellipse cx="59" cy="55" rx="6" ry="4.5" fill="#FDE047" />
            <circle cx="59" cy="54" r="2" fill="#FFFFFF" />
            <ellipse cx="81" cy="55" rx="6" ry="4.5" fill="#FDE047" />
            <circle cx="81" cy="54" r="2" fill="#FFFFFF" />
          </g>
        )}
      </g>
    </svg>
  )
}
