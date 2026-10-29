import { useState, useEffect } from 'react'
import { HeroChibiSvg } from '../../components/WorldDioramaArt'
import { Sparkles, Activity } from 'lucide-react'

interface ParallaxLoadingScreenProps {
  onFinish: () => void
}

const ASSET_STATUSES = [
  { threshold: 22, text: 'Downloading Blockchain Assets...' },
  { threshold: 46, text: 'Initializing Market Makers...' },
  { threshold: 70, text: 'Compiling Smart Contracts...' },
  { threshold: 88, text: 'Checking Node Consensuses...' },
  { threshold: 100, text: 'Syncing Mempool...' },
]

export function ParallaxLoadingScreen({ onFinish }: ParallaxLoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 0% -> 100% over ~3000ms in smooth increments
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval)
          return 100
        }
        // Organic varied increments
        const inc = Math.random() * 2.8 + 1.2
        const next = Math.min(100, Math.round(prev + inc))
        return next
      })
    }, 50)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const finishTimeout = window.setTimeout(() => {
        onFinish()
      }, 350)
      return () => window.clearTimeout(finishTimeout)
    }
  }, [progress, onFinish])

  // Determine current status string
  const currentStatus =
    ASSET_STATUSES.find((s) => progress <= s.threshold)?.text ?? 'Entering Trading Floor...'

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#F4EFE6] select-none">
      {/* ── Layered Parallax Sunset Landscape Backdrop ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Layer 0: Sky with Warm Sunset Gradient & Glowing Sun Disc */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#38BDF8] via-[#FDBA74] via-45% to-[#FEF08A]" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-gradient-to-b from-white via-amber-200 to-amber-400 opacity-90 blur-[1px] shadow-[0_0_80px_rgba(253,224,71,0.7)]" />

        {/* Layer 1: Distant Skyline Silhouette (Slow Parallax Drift) */}
        <svg
          viewBox="0 0 800 200"
          className="absolute bottom-32 w-[200%] h-48 opacity-45 animate-[floatSlow_8s_ease-in-out_infinite]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 200 L0 120 L30 120 L30 140 L60 140 L60 100 L90 100 L90 70 L120 70 L120 130 L160 130 L160 90 L190 90 L190 60 L210 60 L210 120 L250 120 L280 150 L320 150 L320 110 L360 110 L360 80 L390 80 L390 130 L420 130 L450 90 L480 90 L480 140 L520 140 L520 70 L550 70 L580 120 L620 120 L650 85 L680 85 L720 130 L760 130 L760 100 L800 100 L800 200 Z"
            fill="#FB923C"
          />
        </svg>

        {/* Layer 2: Rolling Warm Hills (Midground) */}
        <svg
          viewBox="0 0 800 220"
          className="absolute bottom-20 w-[200%] h-52 opacity-85"
          preserveAspectRatio="none"
        >
          <path
            d="M0 220 C150 110 260 140 400 120 C540 100 680 150 800 110 L800 220 Z"
            fill="#86EFAC"
          />
          <path
            d="M0 220 C180 140 320 110 500 150 C650 180 720 120 800 160 L800 220 Z"
            fill="#4ADE80"
          />
        </svg>

        {/* Layer 3: Cobblestone Road & Meadow Strip (Foreground) */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#15803D] via-[#16A34A] to-[#22C55E] border-t-4 border-[#3E2723]" />
        
        {/* Road Track & Cobblestone Dashes */}
        <div className="absolute bottom-4 inset-x-0 h-16 bg-[#2C1810]/15 border-y-2 border-dashed border-[#2C1810]/30" />
      </div>

      {/* ── Top Header Brand ── */}
      <div
        className="relative z-10 flex flex-col items-center pt-8 safe-area-top-header"
        style={{ paddingTop: 'max(var(--safe-top, env(safe-area-inset-top)), 16px)' }}
      >
        <div className="flex items-center gap-2 rounded-full border-2 border-[#3E2723] bg-[#FFFDF9]/95 px-4 py-1.5 shadow-[0_4px_12px_rgba(44,24,16,0.15)] backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-display font-black text-sm tracking-wider text-[#2C1810] uppercase">
            CRYPTO ROGUES
          </span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-display text-[10px] font-extrabold text-emerald-800">
            v1.4.0
          </span>
        </div>
      </div>

      {/* ── Center Stage: Jogging Rookie Satoshi ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-end pb-3">
        <div className="relative flex flex-col items-center">
          {/* Animated Jogging Rookie Satoshi */}
          <div className="animate-jog-stride">
            <HeroChibiSvg heroId="rookie_satoshi" size={155} />
          </div>

          {/* Running Dust Puffs */}
          <div className="pointer-events-none absolute -bottom-1 -left-4 flex gap-1 opacity-70">
            <div className="h-2 w-3 rounded-full bg-amber-200/90 animate-ping" />
            <div className="h-1.5 w-2 rounded-full bg-amber-300/90" />
          </div>

          {/* Floating Dialogue Bubble */}
          <div className="absolute -top-10 -right-12 rounded-2xl border-2 border-[#3E2723] bg-[#FFFDF9] px-3 py-1 shadow-[0_4px_8px_rgba(44,24,16,0.15)] animate-bounce" style={{ animationDuration: '2s' }}>
            <span className="font-display font-extrabold text-xs text-[#2C1810]">
              To the Moon! 🚀
            </span>
            <div className="absolute -bottom-1.5 left-4 h-2.5 w-2.5 rotate-45 border-r-2 border-b-2 border-[#3E2723] bg-[#FFFDF9]" />
          </div>
        </div>
      </div>

      {/* ── Bottom Section: 3D Chunky Progress Bar & Status Text ── */}
      <div
        className="relative z-10 p-4 pb-6 safe-area-bottom-dock"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
      >
        <div className="rounded-2xl border-3 border-[#3E2723] bg-[#FFFDF9]/95 p-4 shadow-[0_8px_24px_rgba(44,24,16,0.25)] backdrop-blur-md">
          {/* Status Line & Percentage */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span className="font-display font-extrabold text-xs tracking-wide text-[#2C1810]">
                {currentStatus}
              </span>
            </div>
            <span className="font-display font-black text-sm text-[#2C1810]">
              {progress}%
            </span>
          </div>

          {/* Chunky 3D Outer Bezel */}
          <div className="relative h-6 w-full rounded-full border-2 border-[#3E2723] bg-[#F4EFE6] p-0.5 shadow-[0_3px_8px_rgba(44,24,16,0.2),inset_0_2px_4px_rgba(0,0,0,0.12)] overflow-hidden">
            {/* Animated Glossy Green/Gold Progress Fill */}
            <div
              style={{ width: `${progress}%` }}
              className="relative h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.7)] transition-all duration-100 ease-out"
            >
              {/* Shimmer sweep inside the progress bar */}
              <div className="animate-shine-sweep absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>

          {/* Build & Server Ping Notice */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-extrabold text-[#6E5A4F]">
            <span>Build: 4702-Alpha</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Node Latency: ~24ms</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
