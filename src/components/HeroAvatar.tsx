import React from 'react'
import type { HeroId } from '../config/heroes.config'
import { SKIN_MAP } from '../config/heroSkins.config'
import { useMetaStore } from '../state/useMetaStore'
import { PetSprite } from './PetSprite'
import type { PetId } from '../config/pets.config'

export interface HeroAvatarProps {
  heroId: HeroId
  skinId?: string
  size?: number
  className?: string
  showAura?: boolean
  equippedPetId?: PetId | null
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
  heroId,
  skinId,
  size = 120,
  className = '',
  showAura = true,
  equippedPetId,
}) => {
  const metaEquippedSkin = useMetaStore((s) => s.equippedSkins?.[heroId])
  const storePetId = useMetaStore((s) => s.equippedPetId)
  const activePetId = equippedPetId !== undefined ? equippedPetId : storePetId
  const activeSkinId = skinId || metaEquippedSkin || `${heroId}_default`
  const skin = SKIN_MAP[activeSkinId] || SKIN_MAP[`${heroId}_default`]

  const auraColor = skin?.visual.auraGlow || 'rgba(250, 204, 21, 0.4)'
  const accentColor = skin?.visual.accentColor || '#f59e0b'
  const hoodColor = skin?.visual.capeOrHoodColor || '#ea580c'
  const trimColor = skin?.visual.trimColor || '#fde047'
  const hatOrCrown = skin?.visual.hatOrCrown || 'none'

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Luminous Aura for Epic/Mythical skins */}
      {showAura && skin?.tier !== 'default' && (
        <div
          className="pointer-events-none absolute inset-0 rounded-full blur-md opacity-70 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${auraColor} 20%, transparent 75%)`,
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        className="select-none overflow-visible animate-breathe-bob relative z-10"
      >
        {/* Soft Ground Shadow */}
        <ellipse cx="70" cy="124" rx="34" ry="8" fill="rgba(44, 24, 16, 0.35)" />

        {/* ═══════════════════════════════════════════════════════════════
            ROOKIE SATOSHI
           ═══════════════════════════════════════════════════════════════ */}
        {heroId === 'rookie_satoshi' && (
          <g>
            {/* Halo if mythical */}
            {hatOrCrown === 'halo' && (
              <circle cx="70" cy="46" r="38" fill="none" stroke={trimColor} strokeWidth="3" strokeDasharray="6 3" />
            )}

            {/* Legs & Shoes */}
            <rect x="52" y="108" width="13" height="14" rx="6" fill="#1E293B" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="13" height="14" rx="6" fill="#1E293B" stroke="#2C1810" strokeWidth="3" />
            <ellipse cx="58" cy="121" rx="9" ry="5" fill={accentColor} stroke="#2C1810" strokeWidth="2.5" />
            <ellipse cx="82" cy="121" rx="9" ry="5" fill={accentColor} stroke="#2C1810" strokeWidth="2.5" />

            {/* Hoodie Body */}
            <path
              d="M44 78 Q70 70 96 78 L100 112 Q70 118 40 112 Z"
              fill={accentColor}
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M63 80 V92 M77 80 V92" stroke={trimColor} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="70" cy="97" r="8" fill={trimColor} stroke="#2C1810" strokeWidth="2.5" />
            <text x="70" y="101" textAnchor="middle" fill="#2C1810" fontSize="10" fontWeight="900">
              ₿
            </text>

            {/* Hands */}
            <circle cx="39" cy="95" r="8" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />
            <circle cx="101" cy="95" r="8" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

            {/* Oversized Hood */}
            <path
              d="M34 52 C34 20 106 20 106 52 C108 74 95 84 70 84 C45 84 32 74 34 52 Z"
              fill={hoodColor}
              stroke="#2C1810"
              strokeWidth="3.5"
            />
            <ellipse cx="70" cy="56" rx="26" ry="22" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

            {/* Hair */}
            <path d="M45 45 Q55 32 66 43 Q74 31 85 43 Q92 35 95 46 Z" fill="#2C1810" />

            {/* Horns if cyber_horns */}
            {hatOrCrown === 'cyber_horns' && (
              <g>
                <polygon points="40,36 30,12 48,26" fill={trimColor} stroke="#2C1810" strokeWidth="2.5" />
                <polygon points="100,36 110,12 92,26" fill={trimColor} stroke="#2C1810" strokeWidth="2.5" />
              </g>
            )}

            {/* Visor / Glasses */}
            <rect
              x="48"
              y="47"
              width="44"
              height="13"
              rx="6.5"
              fill={activeSkinId.includes('matrix') ? '#10B981' : activeSkinId.includes('cyber') ? '#22D3EE' : '#38BDF8'}
              stroke="#2C1810"
              strokeWidth="2.8"
            />
            <line x1="54" y1="51" x2="66" y2="51" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="52" cy="63" r="3.5" fill="#FCA5A5" opacity="0.7" />
            <circle cx="88" cy="63" r="3.5" fill="#FCA5A5" opacity="0.7" />
            <path d="M63 67 Q70 73 77 67" fill="none" stroke="#2C1810" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            DEGEN APE ROXY
           ═══════════════════════════════════════════════════════════════ */}
        {heroId === 'degen_ape_roxy' && (
          <g>
            {/* Legs & Shoes */}
            <rect x="52" y="108" width="13" height="14" rx="6" fill="#1E3A8A" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="13" height="14" rx="6" fill="#1E3A8A" stroke="#2C1810" strokeWidth="3" />
            <ellipse cx="58" cy="121" rx="9" ry="5" fill={accentColor} stroke="#2C1810" strokeWidth="2.5" />
            <ellipse cx="82" cy="121" rx="9" ry="5" fill={accentColor} stroke="#2C1810" strokeWidth="2.5" />

            {/* Varsity Jacket */}
            <path
              d="M42 78 Q70 70 98 78 L102 112 Q70 118 38 112 Z"
              fill={hoodColor}
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M55 82 Q70 96 85 82" fill="none" stroke={trimColor} strokeWidth="4" strokeLinecap="round" />

            {/* Hands */}
            <circle cx="38" cy="94" r="8" fill="#92400E" stroke="#2C1810" strokeWidth="3" />
            <circle cx="102" cy="94" r="8" fill="#92400E" stroke="#2C1810" strokeWidth="3" />

            {/* Ape Ears & Head */}
            <circle cx="36" cy="55" r="10" fill="#92400E" stroke="#2C1810" strokeWidth="3" />
            <circle cx="36" cy="55" r="5" fill="#FDE68A" />
            <circle cx="104" cy="55" r="10" fill="#92400E" stroke="#2C1810" strokeWidth="3" />
            <circle cx="104" cy="55" r="5" fill="#FDE68A" />
            <ellipse cx="70" cy="55" rx="30" ry="25" fill="#92400E" stroke="#2C1810" strokeWidth="3.5" />
            <ellipse cx="70" cy="61" rx="22" ry="16" fill="#FDE68A" stroke="#2C1810" strokeWidth="2" />

            {/* Hat or Cap */}
            {hatOrCrown === 'cap' && (
              <path d="M44 37 Q70 20 96 37 Z" fill={trimColor} stroke="#2C1810" strokeWidth="3" />
            )}
            {hatOrCrown === 'halo' && (
              <circle cx="70" cy="30" r="18" fill="none" stroke={trimColor} strokeWidth="3.5" strokeDasharray="5 2" />
            )}

            {/* Visor Shades */}
            <rect
              x="46"
              y="44"
              width="21"
              height="13"
              rx="4"
              fill={activeSkinId.includes('laser') ? '#EF4444' : activeSkinId.includes('diamond') ? '#38BDF8' : '#EC4899'}
              stroke="#2C1810"
              strokeWidth="2.5"
            />
            <rect
              x="73"
              y="44"
              width="21"
              height="13"
              rx="4"
              fill={activeSkinId.includes('laser') ? '#EF4444' : activeSkinId.includes('diamond') ? '#38BDF8' : '#EC4899'}
              stroke="#2C1810"
              strokeWidth="2.5"
            />
            <line x1="67" y1="50" x2="73" y2="50" stroke="#2C1810" strokeWidth="3" />
            <path d="M60 66 Q70 73 80 66" fill="none" stroke="#2C1810" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            JORDAN THE WOLF
           ═══════════════════════════════════════════════════════════════ */}
        {heroId === 'jordan_the_wolf' && (
          <g>
            {/* Legs & Shoes */}
            <rect x="52" y="108" width="13" height="14" rx="6" fill="#1E293B" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="13" height="14" rx="6" fill="#1E293B" stroke="#2C1810" strokeWidth="3" />
            <ellipse cx="58" cy="121" rx="9" ry="5" fill="#451A03" stroke="#2C1810" strokeWidth="2.5" />
            <ellipse cx="82" cy="121" rx="9" ry="5" fill="#451A03" stroke="#2C1810" strokeWidth="2.5" />

            {/* Tailored Suit */}
            <path
              d="M42 78 Q70 70 98 78 L102 112 Q70 118 38 112 Z"
              fill={hoodColor}
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <polygon points="62,78 78,78 70,94" fill="#FFFFFF" stroke="#2C1810" strokeWidth="2" />
            <polygon points="67,82 73,82 74,108 70,112 66,108" fill={trimColor} stroke="#2C1810" strokeWidth="1.5" />

            {/* Paws */}
            <circle cx="38" cy="94" r="8" fill="#94A3B8" stroke="#2C1810" strokeWidth="3" />
            <circle cx="102" cy="94" r="8" fill="#94A3B8" stroke="#2C1810" strokeWidth="3" />

            {/* Wolf Ears & Head */}
            <polygon points="41,42 48,18 63,34" fill="#64748B" stroke="#2C1810" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="99,42 92,18 77,34" fill="#64748B" stroke="#2C1810" strokeWidth="3" strokeLinejoin="round" />
            <ellipse cx="70" cy="55" rx="30" ry="24" fill="#94A3B8" stroke="#2C1810" strokeWidth="3.5" />
            <path d="M46 57 Q70 47 94 57 Q84 76 70 76 Q56 76 46 57 Z" fill="#F8FAFC" />

            {/* Crown if gold_crown */}
            {hatOrCrown === 'gold_crown' && (
              <polygon points="52,32 58,16 70,24 82,16 88,32" fill="#FDE047" stroke="#2C1810" strokeWidth="2.5" />
            )}

            {/* Aviator Shades */}
            <rect x="46" y="45" width="21" height="12" rx="4" fill="#1E293B" stroke={trimColor} strokeWidth="2.5" />
            <rect x="73" y="45" width="21" height="12" rx="4" fill="#1E293B" stroke={trimColor} strokeWidth="2.5" />
            <line x1="67" y1="49" x2="73" y2="49" stroke={trimColor} strokeWidth="2.5" />

            <ellipse cx="70" cy="61" rx="4.5" ry="3" fill="#2C1810" />
            <path d="M61 68 Q70 73 80 67" fill="none" stroke="#2C1810" strokeWidth="2.8" strokeLinecap="round" />
          </g>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            LADY FORTUNA (FLAGSHIP S1 HERO)
           ═══════════════════════════════════════════════════════════════ */}
        {heroId === 'lady_fortuna' && (
          <g>
            {/* Floating Cards Halo if empress_crown */}
            {hatOrCrown === 'empress_crown' && (
              <g>
                <circle cx="70" cy="48" r="42" fill="none" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="8 4" />
                <rect x="22" y="32" width="10" height="14" rx="2" fill="#FFFBEB" stroke="#991B1B" strokeWidth="1.5" transform="rotate(-18 22 32)" />
                <rect x="108" y="28" width="10" height="14" rx="2" fill="#FFFBEB" stroke="#991B1B" strokeWidth="1.5" transform="rotate(18 108 28)" />
              </g>
            )}

            {/* Heels & Legs */}
            <rect x="53" y="108" width="12" height="13" rx="6" fill="#9F1239" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="12" height="13" rx="6" fill="#9F1239" stroke="#2C1810" strokeWidth="3" />

            {/* Royal Velvet Gown */}
            <path
              d="M42 78 Q70 70 98 78 L104 112 Q70 118 36 112 Z"
              fill={hoodColor}
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M52 80 Q70 92 88 80" fill="none" stroke={trimColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="70" cy="95" r="7" fill={trimColor} stroke="#2C1810" strokeWidth="2.5" />

            {/* Hands */}
            <circle cx="38" cy="94" r="7.5" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />
            <circle cx="102" cy="94" r="7.5" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

            {/* Golden Hair & Head */}
            <path
              d="M36 56 C34 26 106 26 104 56 C106 76 92 84 70 84 C48 84 34 76 36 56 Z"
              fill={activeSkinId.includes('monte_carlo') ? '#F1F5F9' : activeSkinId.includes('empress') ? '#FDE047' : '#F59E0B'}
              stroke="#2C1810"
              strokeWidth="3.5"
            />
            <ellipse cx="70" cy="57" rx="25" ry="21" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

            {/* Crown / Tiara */}
            {hatOrCrown === 'empress_crown' ? (
              <g>
                <polygon points="42,36 52,14 70,26 88,14 98,36" fill="#FDE047" stroke="#2C1810" strokeWidth="3" />
                <circle cx="70" cy="22" r="4.5" fill="#E11D48" stroke="#2C1810" strokeWidth="1.5" />
                <circle cx="52" cy="18" r="3" fill="#38BDF8" stroke="#2C1810" strokeWidth="1" />
                <circle cx="88" cy="18" r="3" fill="#38BDF8" stroke="#2C1810" strokeWidth="1" />
              </g>
            ) : hatOrCrown === 'gold_crown' ? (
              <g>
                <polygon points="48,36 55,20 70,30 85,20 92,36" fill="#FDE047" stroke="#2C1810" strokeWidth="3" />
                <circle cx="70" cy="28" r="3.5" fill="#F43F5E" />
              </g>
            ) : null}

            {/* Eyes & Smile */}
            <ellipse cx="59" cy="56" rx="4.5" ry="5.5" fill="#2C1810" />
            <circle cx="57.5" cy="54" r="2" fill="#FFFFFF" />
            <ellipse cx="81" cy="56" rx="4.5" ry="5.5" fill="#2C1810" />
            <circle cx="79.5" cy="54" r="2" fill="#FFFFFF" />
            <circle cx="52" cy="63" r="3.5" fill="#FB7185" opacity="0.65" />
            <circle cx="88" cy="63" r="3.5" fill="#FB7185" opacity="0.65" />
            <path d="M62 67 Q70 73 78 67" fill="none" stroke="#2C1810" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            QUANTUM AI ORACLE
           ═══════════════════════════════════════════════════════════════ */}
        {heroId === 'quantum_ai_oracle' && (
          <g>
            {/* Boots */}
            <rect x="53" y="108" width="12" height="13" rx="6" fill="#4C1D95" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="12" height="13" rx="6" fill="#4C1D95" stroke="#2C1810" strokeWidth="3" />

            {/* Cloak */}
            <path
              d="M42 78 Q70 70 98 78 L104 112 Q70 118 36 112 Z"
              fill={hoodColor}
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <circle cx="70" cy="96" r="9" fill={trimColor} stroke="#2C1810" strokeWidth="2.5" />
            <circle cx="70" cy="96" r="4" fill="#E0F2FE" />

            {/* Hands */}
            <circle cx="38" cy="94" r="7.5" fill="#E0F2FE" stroke="#2C1810" strokeWidth="3" />
            <circle cx="102" cy="94" r="7.5" fill="#E0F2FE" stroke="#2C1810" strokeWidth="3" />

            {/* Hooded Head */}
            <path
              d="M36 54 C36 22 104 22 104 54 C106 74 94 84 70 84 C46 84 34 74 36 54 Z"
              fill={hoodColor}
              stroke="#2C1810"
              strokeWidth="3.5"
            />
            <ellipse cx="70" cy="56" rx="24" ry="20" fill="#1E1B4B" stroke={trimColor} strokeWidth="2.5" />

            {/* Glowing Eyes */}
            <ellipse cx="59" cy="54" rx="6" ry="4.5" fill={trimColor} />
            <circle cx="59" cy="53" r="2" fill="#FFFFFF" />
            <ellipse cx="81" cy="54" rx="6" ry="4.5" fill={trimColor} />
            <circle cx="81" cy="53" r="2" fill="#FFFFFF" />

            {/* Forehead Crest */}
            <circle cx="70" cy="42" r="4.5" fill={trimColor} stroke="#2C1810" strokeWidth="2" />
          </g>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SATOSHI NAKAMOTO
           ═══════════════════════════════════════════════════════════════ */}
        {heroId === 'satoshi_nakamoto' && (
          <g>
            {/* Halo */}
            <circle cx="70" cy="52" r="38" fill="none" stroke={trimColor} strokeWidth="3" strokeDasharray="8 4" />

            {/* Boots */}
            <rect x="53" y="108" width="12" height="13" rx="6" fill="#78350F" stroke="#2C1810" strokeWidth="3" />
            <rect x="75" y="108" width="12" height="13" rx="6" fill="#78350F" stroke="#2C1810" strokeWidth="3" />

            {/* Sovereign Cloak */}
            <path
              d="M40 76 Q70 68 100 76 L106 112 Q70 118 34 112 Z"
              fill={hoodColor}
              stroke="#2C1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M50 78 Q70 96 90 78" fill="none" stroke={trimColor} strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="96" r="8.5" fill={trimColor} stroke="#2C1810" strokeWidth="2.5" />
            <text x="70" y="100.5" textAnchor="middle" fill="#2C1810" fontSize="11" fontWeight="900">
              ₿
            </text>

            {/* Hands */}
            <circle cx="36" cy="94" r="8" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />
            <circle cx="104" cy="94" r="8" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

            {/* Majestic Head & Bearded Mask */}
            <path
              d="M36 54 C34 22 106 22 104 54 C106 74 94 86 70 86 C46 86 34 74 36 54 Z"
              fill="#2C1810"
              stroke="#2C1810"
              strokeWidth="3.5"
            />
            <ellipse cx="70" cy="56" rx="25" ry="21" fill="#FDE68A" stroke="#2C1810" strokeWidth="3" />

            {/* Crown if gold_crown or empress_crown */}
            {(hatOrCrown === 'gold_crown' || hatOrCrown === 'empress_crown') && (
              <polygon points="46,34 56,16 70,26 84,16 94,34" fill="#FDE047" stroke="#2C1810" strokeWidth="3" />
            )}

            {/* Glowing Golden Eyes & Wise Aura */}
            <ellipse cx="58" cy="54" rx="5.5" ry="4" fill={trimColor} />
            <ellipse cx="82" cy="54" rx="5.5" ry="4" fill={trimColor} />
            <circle cx="58" cy="53.5" r="1.8" fill="#FFFFFF" />
            <circle cx="82" cy="53.5" r="1.8" fill="#FFFFFF" />
            <path d="M54 66 Q70 78 86 66" fill="#F59E0B" stroke="#2C1810" strokeWidth="2.5" />
          </g>
        )}
      </svg>

      {/* Floating Trading Bot Pet Companion */}
      {activePetId && (
        <div className="absolute -right-3 -top-1 z-20 pointer-events-none">
          <PetSprite petId={activePetId} size={Math.round(size * 0.42)} />
        </div>
      )}
    </div>
  )
}
