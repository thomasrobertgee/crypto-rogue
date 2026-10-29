import { useEffect, useState, useRef } from 'react'
import { AudioSynth } from '../../engine/AudioSynth'
import { Sparkles, FastForward } from 'lucide-react'

interface GeeGamesSplashProps {
  onFinish: () => void
}

/**
 * 3D Glossy Capital 'G' Emblem SVG
 */
function GlossyLetterG({ size = 84, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`select-none drop-shadow-[0_8px_20px_rgba(245,158,11,0.5)] ${className}`}
    >
      <defs>
        <linearGradient id="gBezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="30%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="gFront" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <filter id="gGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 3D Extrusion Shadow Layer */}
      <path
        d="M 50 14 C 28 14 12 30 12 52 C 12 74 28 90 50 90 C 70 90 84 76 86 58 L 86 50 L 52 50 L 52 64 L 70 64 C 68 72 60 76 50 76 C 36 76 26 66 26 52 C 26 38 36 28 50 28 C 60 28 67 33 72 39 L 83 28 C 75 19 64 14 50 14 Z"
        fill="#451A03"
        transform="translate(0, 5)"
      />

      {/* Outer Golden Bezel */}
      <path
        d="M 50 14 C 28 14 12 30 12 52 C 12 74 28 90 50 90 C 70 90 84 76 86 58 L 86 50 L 52 50 L 52 64 L 70 64 C 68 72 60 76 50 76 C 36 76 26 66 26 52 C 26 38 36 28 50 28 C 60 28 67 33 72 39 L 83 28 C 75 19 64 14 50 14 Z"
        fill="url(#gBezel)"
        stroke="#78350F"
        strokeWidth="2.5"
      />

      {/* Inner Glossy Face */}
      <path
        d="M 50 18 C 31 18 17 32 17 52 C 17 71 31 85 50 85 C 67 85 79 73 81 57 L 81 54 L 56 54 L 56 61 L 71 61 C 69 68 61 72 50 72 C 38 72 30 63 30 52 C 30 40 38 32 50 32 C 58 32 64 36 68 41 L 78 31 C 71 23 62 18 50 18 Z"
        fill="url(#gFront)"
      />

      {/* Bevel Highlight Glint */}
      <path
        d="M 50 20 C 35 20 22 32 20 48 C 24 38 36 26 50 26 C 62 26 72 32 76 36 L 78 31 C 71 24 61 20 50 20 Z"
        fill="#FFFFFF"
        opacity="0.65"
      />
    </svg>
  )
}

interface SparkleParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
}

const PARTICLES: SparkleParticle[] = [
  { id: 1, x: -110, y: -45, size: 10, color: '#FDE047', delay: 0 },
  { id: 2, x: -70, y: -70, size: 8, color: '#F59E0B', delay: 0.05 },
  { id: 3, x: -30, y: -80, size: 12, color: '#FFFFFF', delay: 0.1 },
  { id: 4, x: 20, y: -75, size: 9, color: '#FDE047', delay: 0.08 },
  { id: 5, x: 80, y: -60, size: 11, color: '#38BDF8', delay: 0.12 },
  { id: 6, x: 125, y: -30, size: 10, color: '#F59E0B', delay: 0.15 },
  { id: 7, x: 135, y: 25, size: 8, color: '#FFFFFF', delay: 0.06 },
  { id: 8, x: 110, y: 65, size: 11, color: '#FDE047', delay: 0.14 },
  { id: 9, x: 40, y: 80, size: 8, color: '#F59E0B', delay: 0.18 },
  { id: 10, x: -50, y: 75, size: 10, color: '#38BDF8', delay: 0.1 },
  { id: 11, x: -120, y: 40, size: 9, color: '#FFFFFF', delay: 0.16 },
  { id: 12, x: 0, y: -90, size: 14, color: '#FDE047', delay: 0.04 },
]

export function GeeGamesSplash({ onFinish }: GeeGamesSplashProps) {
  // Animation phases:
  // 0: start rolling G1
  // 1: G1 upright brake (t = 450ms)
  // 2: 'ee' pop out (t = 650ms)
  // 3: G2 rolling past & brake (t = 1100ms)
  // 4: 'ames' pop out to finish 'Games' (t = 1450ms)
  // 5: Golden shine sweep + sparks + fanfare (t = 1800ms)
  // 6: Subtitle fade in (t = 2300ms)
  // 7: Finish & transition (t = 3300ms)
  const isPreviewMode = useRef(new URLSearchParams(window.location.search).has('splashPhase')).current
  const [phase, setPhase] = useState<number>(() => {
    const p = new URLSearchParams(window.location.search).get('splashPhase')
    return p !== null ? parseInt(p, 10) : 0
  })
  const fanfarePlayed = useRef(false)

  useEffect(() => {
    if (isPreviewMode) return

    const timers: number[] = []

    timers.push(window.setTimeout(() => setPhase(1), 450))
    timers.push(window.setTimeout(() => setPhase(2), 700))
    timers.push(window.setTimeout(() => setPhase(3), 1150))
    timers.push(window.setTimeout(() => setPhase(4), 1500))
    timers.push(
      window.setTimeout(() => {
        setPhase(5)
        if (!fanfarePlayed.current) {
          fanfarePlayed.current = true
          AudioSynth.unlock()
          AudioSynth.playGeeGamesFanfare()
        }
      }, 1850),
    )
    timers.push(window.setTimeout(() => setPhase(6), 2350))
    timers.push(window.setTimeout(() => onFinish(), 3350))

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [onFinish, isPreviewMode])

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFinish()
  }

  return (
    <div
      onClick={onFinish}
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#090D16] via-[#0F172A] to-[#05070B] select-none"
    >
      {/* Radial Studio Spotlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
      <div className="pointer-events-none absolute h-[320px] w-[320px] rounded-full bg-amber-400/10 blur-[80px]" />

      {/* Subtle Skip Button */}
      <div className="absolute top-2 right-11 z-40">
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/50 px-2.5 py-1 text-[11px] font-bold text-amber-200/90 backdrop-blur-md transition hover:border-amber-400 hover:text-amber-100 active:scale-95 shadow-sm"
        >
          <span>Skip</span>
          <FastForward className="h-3 w-3" />
        </button>
      </div>

      {/* Center Stage: Studio Logo Assemble */}
      <div className="relative flex flex-col items-center justify-center py-10">
        <div className="relative flex items-center justify-center">
          {/* Sparkle Particles on Shine (Phase 5+) */}
          {phase >= 5 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {PARTICLES.map((p) => (
                <div
                  key={p.id}
                  style={{
                    transform: `translate(${p.x}px, ${p.y}px)`,
                    animationDelay: `${p.delay}s`,
                  }}
                  className="absolute animate-pop-bounce"
                >
                  <Sparkles
                    style={{ width: p.size, height: p.size, color: p.color }}
                    className="drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Container for "Gee Games" */}
          <div className="relative flex items-center gap-4 px-4 py-2">
            {/* Word 1: "Gee" */}
            <div className="relative flex items-center">
              {/* Rolling / Braked 3D Capital 'G' #1 */}
              <div
                style={{
                  transform:
                    phase === 0
                      ? 'translateX(-160px) rotate(-540deg)'
                      : 'translateX(0px) rotate(0deg)',
                  transition: 'transform 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.25)',
                }}
              >
                <GlossyLetterG size={78} />
              </div>

              {/* Popping 'ee' */}
              {phase >= 2 && (
                <div className="animate-pop-bounce flex items-center font-display font-black text-5xl tracking-tight text-amber-400 game-text-outline ml-0.5">
                  <span className="inline-block -rotate-3 text-[#FDE047] drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]">
                    e
                  </span>
                  <span className="inline-block rotate-2 text-[#FDE047] drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]">
                    e
                  </span>
                </div>
              )}
            </div>

            {/* Word 2: "Games" */}
            <div className="relative flex items-center">
              {/* Rolling / Braked 3D Capital 'G' #2 */}
              {phase >= 3 && (
                <div
                  style={{
                    transform:
                      phase === 3
                        ? 'translateX(0px) rotate(0deg)'
                        : 'translateX(0px) rotate(0deg)',
                    animation: 'popBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                  }}
                >
                  <GlossyLetterG size={78} />
                </div>
              )}

              {/* Popping 'ames' */}
              {phase >= 4 && (
                <div className="animate-pop-bounce flex items-center font-display font-black text-5xl tracking-tight text-amber-400 game-text-outline ml-0.5">
                  <span className="inline-block text-[#FDE047] drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]">
                    a
                  </span>
                  <span className="inline-block -rotate-2 text-[#FDE047] drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]">
                    m
                  </span>
                  <span className="inline-block rotate-1 text-[#FDE047] drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]">
                    e
                  </span>
                  <span className="inline-block text-[#FDE047] drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]">
                    s
                  </span>
                </div>
              )}
            </div>

            {/* Golden Shine Sweep Overlay across the entire text (Phase 5+) */}
            {phase >= 5 && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl mix-blend-plus-lighter">
                <div className="animate-shine-sweep h-full w-28 bg-gradient-to-r from-transparent via-amber-200/65 to-transparent blur-md" />
              </div>
            )}
          </div>
        </div>

        {/* Subtitle / Studio Badge (Phase 6+) */}
        <div
          className={`mt-4 flex flex-col items-center transition-all duration-700 ${
            phase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-[1.5px] w-8 bg-gradient-to-r from-transparent to-amber-400/60" />
            <span className="font-display font-extrabold text-xs tracking-[0.35em] text-amber-300/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              STUDIOS
            </span>
            <div className="h-[1.5px] w-8 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
          <span className="mt-1 font-sans text-[10px] font-bold tracking-widest text-slate-400/80 uppercase">
            PRESENTS: CRYPTO ROGUES
          </span>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-6 text-[11px] font-medium tracking-wide text-slate-500/70">
        Tap anywhere to skip
      </div>
    </div>
  )
}
