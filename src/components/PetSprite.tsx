import React from 'react'
import type { PetId } from '../config/pets.config'
import { PET_MAP } from '../config/pets.config'

interface PetSpriteProps {
  petId: PetId
  size?: number
  className?: string
  showAura?: boolean
}

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
          className="pointer-events-none absolute inset-0 rounded-full blur-md opacity-60 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${cfg.color} 35%, transparent 70%)`,
          }}
        />
      )}

      {/* Chunky 3D Floating Pet Frame */}
      <div
        className={`relative z-10 flex items-center justify-center rounded-2xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-b ${cfg.bgGradient} shadow-md animate-float-slow transition-transform hover:scale-110`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.55 }} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          {cfg.emoji}
        </span>
        {/* Specular Highlight */}
        <span className="pointer-events-none absolute top-1 left-1.5 right-1.5 h-1.5 rounded-full bg-white/40" />
      </div>
    </div>
  )
}
