import React from 'react'
import type { PetId } from '../../config/pets.config'
import { PET_MAP } from '../../config/pets.config'

export interface PetSpriteProps {
  petId: PetId
  size?: number
  className?: string
  showAura?: boolean
}

/**
 * 2.5D Cell-Shaded Pet Companion Sprite (MechaShiba, LaserBull, QuantumOwl, DiamondCrab)
 * with Top-Light Specular Highlights, Lower-Body Shading, Animated Tail Wag, Bobbing Head,
 * and Synchronized Ground Contact Shadow.
 */
export const PetSprite: React.FC<PetSpriteProps> = ({
  petId,
  size = 48,
  className = '',
  showAura = true,
}) => {
  const cfg = PET_MAP[petId]
  if (!cfg) return null

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`${cfg.name}: ${cfg.baseBonusDesc}`}
    >
      {/* Ambient Pulsing Halo */}
      {showAura && (
        <div
          className="pointer-events-none absolute inset-0 rounded-full blur-md opacity-55 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${cfg.color} 30%, transparent 72%)`,
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        className="relative z-10 overflow-visible select-none"
      >
        <defs>
          <filter id="petShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>

          {/* MechaShiba 2-Tone Golden Fur & Cyber Armor */}
          <linearGradient id="shibaFurCell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="51%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="shibaCreamCell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#FEF3C7" />
            <stop offset="56%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="shibaVisorCell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* LaserBull 2-Tone Emerald Cyber Armor */}
          <linearGradient id="bullBodyCell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="50%" stopColor="#16A34A" />
            <stop offset="51%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* QuantumOwl 2-Tone Violet Flux Feather */}
          <linearGradient id="owlBodyCell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D8B4FE" />
            <stop offset="50%" stopColor="#9333EA" />
            <stop offset="51%" stopColor="#6B21A8" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>

          {/* DiamondCrab 2-Tone Prismatic Cyan Shell */}
          <linearGradient id="crabBodyCell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="51%" stopColor="#0891B2" />
            <stop offset="100%" stopColor="#164E63" />
          </linearGradient>
        </defs>

        {/* Dynamic Ground Contact Shadow */}
        <ellipse
          cx="40"
          cy="71"
          rx="24"
          ry="5.5"
          fill="rgba(15, 23, 42, 0.45)"
          filter="url(#petShadowBlur)"
          className="animate-contact-shadow"
        />

        {/* Idle Breathing Body Container */}
        <g className="animate-idle-breathe">
          {petId === 'mecha_shiba' && (
            <g>
              {/* Animated Wagging Curled Tail */}
              <g className="animate-tail-wag">
                <path
                  d="M22 48 C10 42 8 28 18 26 C24 25 26 34 22 42"
                  fill="url(#shibaFurCell)"
                  stroke="#2C1810"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="16" cy="29" r="3.5" fill="#FEF3C7" />
              </g>

              {/* Shiba Body & Cyber Collar */}
              <ellipse
                cx="38"
                cy="53"
                rx="17"
                ry="13"
                fill="url(#shibaFurCell)"
                stroke="#2C1810"
                strokeWidth="2.8"
              />
              {/* Cream Chest */}
              <ellipse cx="43" cy="55" rx="10" ry="9" fill="url(#shibaCreamCell)" />
              {/* Paws */}
              <ellipse cx="30" cy="65" rx="5.5" ry="3.8" fill="#FEF3C7" stroke="#2C1810" strokeWidth="2.2" />
              <ellipse cx="47" cy="65" rx="5.5" ry="3.8" fill="#FEF3C7" stroke="#2C1810" strokeWidth="2.2" />
              {/* Cyber Firewall Collar */}
              <path d="M27 44 Q40 49 52 44" fill="none" stroke="#06B6D4" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="41" cy="47" r="3" fill="#FDE047" stroke="#2C1810" strokeWidth="1.5" />

              {/* Animated Bobbing Shiba Head */}
              <g className="animate-head-bob">
                {/* Perky Pointed Shiba Ears */}
                <polygon
                  points="26,26 22,10 35,20"
                  fill="url(#shibaFurCell)"
                  stroke="#2C1810"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                <polygon points="26,23 24,14 32,20" fill="#FEF3C7" />
                <polygon
                  points="54,26 58,10 45,20"
                  fill="url(#shibaFurCell)"
                  stroke="#2C1810"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                <polygon points="54,23 56,14 48,20" fill="#FEF3C7" />

                {/* 2-Tone Shiba Head */}
                <ellipse
                  cx="40"
                  cy="31"
                  rx="18"
                  ry="15"
                  fill="url(#shibaFurCell)"
                  stroke="#2C1810"
                  strokeWidth="2.8"
                />
                {/* Top-Light Specular Rim */}
                <path
                  d="M30 20 Q40 16 50 20"
                  fill="none"
                  stroke="#FEF9C3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                {/* Cream Shiba Cheeks & Snout */}
                <path
                  d="M25 33 Q32 26 40 31 Q48 26 55 33 Q52 44 40 44 Q28 44 25 33 Z"
                  fill="url(#shibaCreamCell)"
                />
                {/* Mecha Cyber Visor */}
                <rect
                  x="27"
                  y="24"
                  width="26"
                  height="8"
                  rx="4"
                  fill="url(#shibaVisorCell)"
                  stroke="#2C1810"
                  strokeWidth="2"
                />
                <line x1="31" y1="26.5" x2="40" y2="26.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                {/* Cute Nose & Happy Smile */}
                <ellipse cx="40" cy="35" rx="3" ry="2.2" fill="#0F172A" />
                <path d="M36 38 Q40 41 44 38" fill="none" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>
          )}

          {petId === 'laser_bull' && (
            <g>
              {/* Wagging Tail */}
              <g className="animate-tail-wag">
                <path d="M20 50 Q10 42 14 34" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
                <circle cx="14" cy="33" r="3.5" fill="#4ADE80" stroke="#064E3B" strokeWidth="2" />
              </g>
              {/* Bull Body */}
              <ellipse cx="40" cy="52" rx="18" ry="13" fill="url(#bullBodyCell)" stroke="#064E3B" strokeWidth="2.8" />
              <ellipse cx="31" cy="64" rx="5" ry="4" fill="#064E3B" />
              <ellipse cx="49" cy="64" rx="5" ry="4" fill="#064E3B" />
              {/* Bobbing Bull Head */}
              <g className="animate-head-bob">
                {/* Golden Bull Horns */}
                <path d="M23 26 Q14 14 22 10 Q26 18 29 22" fill="#FDE047" stroke="#2C1810" strokeWidth="2.4" />
                <path d="M57 26 Q66 14 58 10 Q54 18 51 22" fill="#FDE047" stroke="#2C1810" strokeWidth="2.4" />
                <ellipse cx="40" cy="31" rx="17" ry="14" fill="url(#bullBodyCell)" stroke="#064E3B" strokeWidth="2.8" />
                {/* Glowing Laser Eyes */}
                <circle cx="33" cy="29" r="3.5" fill="#EF4444" className="animate-eye-glow" />
                <circle cx="47" cy="29" r="3.5" fill="#EF4444" className="animate-eye-glow" />
                {/* Gold Nose Ring */}
                <ellipse cx="40" cy="37" rx="8" ry="5" fill="#86EFAC" stroke="#064E3B" strokeWidth="2" />
                <circle cx="40" cy="42" r="4" fill="none" stroke="#FDE047" strokeWidth="2.5" />
              </g>
            </g>
          )}

          {petId === 'quantum_owl' && (
            <g>
              <g className="animate-head-bob">
                <ellipse cx="40" cy="44" rx="19" ry="21" fill="url(#owlBodyCell)" stroke="#2E1065" strokeWidth="2.8" />
                <ellipse cx="40" cy="49" rx="12" ry="13" fill="#F3E8FF" />
                {/* Owl Eyes */}
                <circle cx="33" cy="34" r="6.5" fill="#0F172A" stroke="#FDE047" strokeWidth="2.2" />
                <circle cx="33" cy="34" r="3" fill="#38BDF8" />
                <circle cx="47" cy="34" r="6.5" fill="#0F172A" stroke="#FDE047" strokeWidth="2.2" />
                <circle cx="47" cy="34" r="3" fill="#38BDF8" />
                <polygon points="37,38 43,38 40,44" fill="#F59E0B" stroke="#2C1810" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {petId === 'diamond_crab' && (
            <g>
              <g className="animate-head-bob">
                {/* Crab Claws */}
                <circle cx="17" cy="32" r="7" fill="url(#crabBodyCell)" stroke="#083344" strokeWidth="2.4" />
                <circle cx="63" cy="32" r="7" fill="url(#crabBodyCell)" stroke="#083344" strokeWidth="2.4" />
                {/* Diamond Shell */}
                <polygon
                  points="40,20 62,38 54,58 26,58 18,38"
                  fill="url(#crabBodyCell)"
                  stroke="#083344"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                <polygon points="40,24 54,38 40,52 26,38" fill="#CFFAFE" opacity="0.6" />
                <circle cx="33" cy="42" r="3" fill="#0F172A" />
                <circle cx="47" cy="42" r="3" fill="#0F172A" />
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}
