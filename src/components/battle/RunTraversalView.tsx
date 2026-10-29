import React, { useEffect, useRef, useState, useMemo } from 'react'
import type { StageNodeConfig } from '../../types/game.types'
import { HERO_MAP, type HeroId } from '../../config/heroes.config'
import { HeroChibiSvg, BossMonsterSvg } from '../WorldDioramaArt'
import { AudioSynth } from '../../engine/AudioSynth'
import { FastForward, ShieldAlert, Sparkles, Store, HelpCircle, Flame } from 'lucide-react'

interface RunTraversalViewProps {
  stageNumber?: number
  currentNodeIndex?: number
  upcomingNode?: StageNodeConfig | null
  heroId?: HeroId
  isAutoMode?: boolean
  onComplete: () => void
}

interface VacuumParticle {
  id: number
  icon: string
  color: string
  startX: number
  startY: number
  delayMs: number
}

export const RunTraversalView: React.FC<RunTraversalViewProps> = ({
  stageNumber = 1,
  currentNodeIndex = 1,
  upcomingNode,
  heroId = 'rookie_satoshi',
  isAutoMode = false,
  onComplete,
}) => {
  const completedRef = useRef(false)
  const hero = HERO_MAP[heroId] ?? HERO_MAP.rookie_satoshi
  const durationMs = isAutoMode ? 800 : 1500
  const [progressPct, setProgressPct] = useState(0)

  // Safe complete handler (idempotent)
  const handleComplete = () => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete()
  }

  // Audio & Timer lifecycle
  useEffect(() => {
    AudioSynth.playWhoosh()

    // Trigger footstep clicks during traversal
    const footstepTimer1 = window.setTimeout(() => AudioSynth.playFootstep(), 100)
    const footstepTimer2 = window.setTimeout(() => AudioSynth.playFootstep(), 260)
    const footstepTimer3 = window.setTimeout(() => AudioSynth.playFootstep(), 420)
    const footstepTimer4 = window.setTimeout(() => AudioSynth.playFootstep(), 580)

    // Lock-on sound when approaching entity appears
    const lockOnTimer = window.setTimeout(() => {
      AudioSynth.playTargetLockOn()
    }, Math.min(durationMs - 200, 450))

    // Progress bar animation
    const startTime = performance.now()
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startTime
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100))
      setProgressPct(pct)
      if (elapsed >= durationMs) {
        window.clearInterval(interval)
        handleComplete()
      }
    }, 30)

    return () => {
      window.clearTimeout(footstepTimer1)
      window.clearTimeout(footstepTimer2)
      window.clearTimeout(footstepTimer3)
      window.clearTimeout(footstepTimer4)
      window.clearTimeout(lockOnTimer)
      window.clearInterval(interval)
    }
  }, [durationMs])

  // Determine encounter entity visual type
  const nodeType = upcomingNode?.type ?? 'battle'
  const isCombatNode = nodeType === 'battle' || nodeType === 'elite' || nodeType === 'boss'
  const isShopNode = nodeType === 'shop'
  const isEventNode = nodeType === 'event'
  const isBoss = nodeType === 'boss' || upcomingNode?.enemy?.isBoss

  const enemyName = upcomingNode?.enemy?.name ?? (isBoss ? 'Whale Syndicate Boss' : 'Market Maker Bot')

  // Generate 8 vacuum loot particles arcing to top HUD
  const vacuumParticles: VacuumParticle[] = useMemo(
    () => [
      { id: 1, icon: '⚡', color: '#f59e0b', startX: 68, startY: 260, delayMs: 0 },
      { id: 2, icon: '💎', color: '#06b6d4', startX: 84, startY: 280, delayMs: 60 },
      { id: 3, icon: '💵', color: '#22c55e', startX: 96, startY: 250, delayMs: 120 },
      { id: 4, icon: '⚡', color: '#fbbf24', startX: 58, startY: 290, delayMs: 180 },
      { id: 5, icon: '💎', color: '#3b82f6', startX: 90, startY: 270, delayMs: 240 },
      { id: 6, icon: '💵', color: '#10b981', startX: 72, startY: 300, delayMs: 300 },
      { id: 7, icon: '⚡', color: '#eab308', startX: 105, startY: 265, delayMs: 360 },
      { id: 8, icon: '💎', color: '#a855f7', startX: 78, startY: 275, delayMs: 420 },
    ],
    [],
  )

  return (
    <div
      onClick={handleComplete}
      className="relative flex h-full w-full cursor-pointer select-none flex-col justify-between overflow-hidden bg-[#0a0614] font-sans text-white"
    >
      {/* ───────────────────────────────────────────────────────────────────────────
          INLINE PARALLAX & RUNNING ANIMATION STYLES
         ─────────────────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes highwayScrollFar {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes highwayScrollMid {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes highwayScrollNear {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes heroRunBob {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          25% { transform: translateY(-7px) rotate(-1deg); }
          50% { transform: translateY(-2px) rotate(3deg); }
          75% { transform: translateY(-9px) rotate(0deg); }
        }
        @keyframes runnerSpark {
          0% { opacity: 0.9; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-32px, -14px) scale(0.2); }
        }
        @keyframes entitySlideIn {
          0% { transform: translateX(120%); opacity: 0; }
          60% { transform: translateX(-8px); opacity: 1; }
          100% { transform: translateX(0%); opacity: 1; }
        }
        @keyframes radarSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes lootVacuumArc {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(60px, -110px) scale(1.25);
          }
          100% {
            opacity: 0;
            transform: translate(110px, -230px) scale(0.3);
          }
        }
        .anim-scroll-far {
          display: flex;
          width: 200%;
          animation: highwayScrollFar 22s linear infinite;
        }
        .anim-scroll-mid {
          display: flex;
          width: 200%;
          animation: highwayScrollMid 6.5s linear infinite;
        }
        .anim-scroll-near {
          display: flex;
          width: 200%;
          animation: highwayScrollNear 1.2s linear infinite;
        }
        .anim-hero-bob {
          animation: heroRunBob 0.38s ease-in-out infinite;
        }
        .anim-entity-slide {
          animation: entitySlideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-radar {
          animation: radarSpin 4s linear infinite;
        }
      `}</style>

      {/* ───────────────────────────────────────────────────────────────────────────
          LAYER 1: FAR SKY (Slow-scrolling dark cyberpunk skyline + crypto tickers)
         ─────────────────────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden bg-gradient-to-b from-[#05030a] via-[#0d071a] to-transparent">
        {/* Floating Holographic Crypto Ticker Banner */}
        <div className="absolute top-2 inset-x-0 overflow-hidden opacity-75">
          <div className="anim-scroll-far whitespace-nowrap text-[9px] font-black tracking-widest text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
            <span className="inline-block px-4">
              BTC $104,250 <span className="text-emerald-400">▲ +6.4%</span> &bull; ETH $4,850 <span className="text-emerald-400">▲ +8.1%</span> &bull; SOL $285 <span className="text-emerald-400">▲ +14.2%</span> &bull; DOGE $0.48 <span className="text-emerald-400">▲ +22.0%</span> &bull; BLOCKCHAIN HIGHWAY &bull; FAST-FORWARD TRAVERSAL &bull;
            </span>
            <span className="inline-block px-4">
              BTC $104,250 <span className="text-emerald-400">▲ +6.4%</span> &bull; ETH $4,850 <span className="text-emerald-400">▲ +8.1%</span> &bull; SOL $285 <span className="text-emerald-400">▲ +14.2%</span> &bull; DOGE $0.48 <span className="text-emerald-400">▲ +22.0%</span> &bull; BLOCKCHAIN HIGHWAY &bull; FAST-FORWARD TRAVERSAL &bull;
            </span>
          </div>
        </div>

        {/* Far Cyberpunk City Skyline Silhouettes */}
        <div className="absolute bottom-0 inset-x-0 h-32 overflow-hidden opacity-30">
          <div className="anim-scroll-far h-full items-end">
            <div className="flex h-full w-1/2 items-end justify-around">
              <div className="h-24 w-8 bg-gradient-to-t from-purple-900 to-indigo-950 border-t border-purple-500/40" />
              <div className="h-16 w-12 bg-gradient-to-t from-purple-950 to-slate-900 border-t border-cyan-500/40" />
              <div className="h-28 w-10 bg-gradient-to-t from-purple-900 to-indigo-950 border-t border-pink-500/40" />
              <div className="h-12 w-6 bg-gradient-to-t from-purple-950 to-slate-900 border-t border-emerald-500/40" />
              <div className="h-20 w-14 bg-gradient-to-t from-purple-900 to-indigo-950 border-t border-amber-500/40" />
              <div className="h-26 w-8 bg-gradient-to-t from-purple-950 to-slate-900 border-t border-cyan-500/40" />
            </div>
            <div className="flex h-full w-1/2 items-end justify-around">
              <div className="h-24 w-8 bg-gradient-to-t from-purple-900 to-indigo-950 border-t border-purple-500/40" />
              <div className="h-16 w-12 bg-gradient-to-t from-purple-950 to-slate-900 border-t border-cyan-500/40" />
              <div className="h-28 w-10 bg-gradient-to-t from-purple-900 to-indigo-950 border-t border-pink-500/40" />
              <div className="h-12 w-6 bg-gradient-to-t from-purple-950 to-slate-900 border-t border-emerald-500/40" />
              <div className="h-20 w-14 bg-gradient-to-t from-purple-900 to-indigo-950 border-t border-amber-500/40" />
              <div className="h-26 w-8 bg-gradient-to-t from-purple-950 to-slate-900 border-t border-cyan-500/40" />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────
          LAYER 2: MIDGROUND (Candlesticks, Meme Billboards & Server Racks)
         ─────────────────────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 h-48 overflow-hidden">
        <div className="anim-scroll-mid h-full items-end">
          {/* Loop Set 1 */}
          <div className="relative flex h-full w-1/2 items-end justify-between px-6">
            {/* Green Candlestick Pillar */}
            <div className="relative flex flex-col items-center">
              <div className="h-6 w-0.5 bg-emerald-400" />
              <div className="h-20 w-4 rounded-xs bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
              <div className="h-5 w-0.5 bg-emerald-400" />
            </div>

            {/* Neon Billboard: HODL */}
            <div className="mb-4 flex flex-col items-center rounded-lg border border-amber-400/60 bg-black/60 px-2.5 py-1 text-center shadow-[0_0_14px_rgba(251,191,36,0.3)] backdrop-blur-xs">
              <span className="text-[10px] font-black text-amber-300">🚀 HODL</span>
              <span className="text-[7.5px] font-extrabold text-amber-100">THE LINE</span>
            </div>

            {/* Red Dump Candlestick Pillar */}
            <div className="relative flex flex-col items-center">
              <div className="h-4 w-0.5 bg-red-400" />
              <div className="h-14 w-4 rounded-xs bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              <div className="h-8 w-0.5 bg-red-400" />
            </div>

            {/* Server Rack Silhouette with Blinking LEDs */}
            <div className="relative mb-1 flex flex-col items-center rounded-xs border border-white/10 bg-slate-900/80 p-1">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="mt-1 h-12 w-6 border-t border-slate-700 bg-slate-950 flex flex-col justify-around py-0.5 px-0.5">
                <div className="h-1 w-full bg-slate-800" />
                <div className="h-1 w-full bg-slate-800" />
                <div className="h-1 w-full bg-slate-800" />
              </div>
            </div>

            {/* Neon Billboard: WAGMI */}
            <div className="mb-6 flex flex-col items-center rounded-lg border border-cyan-400/60 bg-black/60 px-2.5 py-1 text-center shadow-[0_0_14px_rgba(6,182,212,0.3)] backdrop-blur-xs">
              <span className="text-[10px] font-black text-cyan-300">💎 WAGMI</span>
              <span className="text-[7.5px] font-extrabold text-cyan-100">ENTERPRISE</span>
            </div>

            {/* Green Candlestick Pillar (Tall) */}
            <div className="relative flex flex-col items-center">
              <div className="h-5 w-0.5 bg-emerald-400" />
              <div className="h-28 w-4 rounded-xs bg-emerald-500 shadow-[0_0_16px_rgba(34,197,94,0.7)]" />
              <div className="h-7 w-0.5 bg-emerald-400" />
            </div>
          </div>

          {/* Loop Set 2 (Identical for seamless infinite scroll) */}
          <div className="relative flex h-full w-1/2 items-end justify-between px-6">
            <div className="relative flex flex-col items-center">
              <div className="h-6 w-0.5 bg-emerald-400" />
              <div className="h-20 w-4 rounded-xs bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
              <div className="h-5 w-0.5 bg-emerald-400" />
            </div>
            <div className="mb-4 flex flex-col items-center rounded-lg border border-amber-400/60 bg-black/60 px-2.5 py-1 text-center shadow-[0_0_14px_rgba(251,191,36,0.3)] backdrop-blur-xs">
              <span className="text-[10px] font-black text-amber-300">🚀 HODL</span>
              <span className="text-[7.5px] font-extrabold text-amber-100">THE LINE</span>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="h-4 w-0.5 bg-red-400" />
              <div className="h-14 w-4 rounded-xs bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              <div className="h-8 w-0.5 bg-red-400" />
            </div>
            <div className="relative mb-1 flex flex-col items-center rounded-xs border border-white/10 bg-slate-900/80 p-1">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="mt-1 h-12 w-6 border-t border-slate-700 bg-slate-950 flex flex-col justify-around py-0.5 px-0.5">
                <div className="h-1 w-full bg-slate-800" />
                <div className="h-1 w-full bg-slate-800" />
                <div className="h-1 w-full bg-slate-800" />
              </div>
            </div>
            <div className="mb-6 flex flex-col items-center rounded-lg border border-cyan-400/60 bg-black/60 px-2.5 py-1 text-center shadow-[0_0_14px_rgba(6,182,212,0.3)] backdrop-blur-xs">
              <span className="text-[10px] font-black text-cyan-300">💎 WAGMI</span>
              <span className="text-[7.5px] font-extrabold text-cyan-100">ENTERPRISE</span>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="h-5 w-0.5 bg-emerald-400" />
              <div className="h-28 w-4 rounded-xs bg-emerald-500 shadow-[0_0_16px_rgba(34,197,94,0.7)]" />
              <div className="h-7 w-0.5 bg-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────
          LAYER 3: FOREGROUND HIGHWAY (Fast-scrolling fiber-optic road)
         ─────────────────────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden bg-gradient-to-t from-[#140b24] via-[#0d0718] to-transparent">
        {/* Highway Asphalt Road Surface */}
        <div className="absolute inset-x-0 bottom-0 h-20 border-t-2 border-purple-500/50 bg-[#160d29]">
          {/* Fast-Scrolling Fiber-Optic Lane Markings */}
          <div className="anim-scroll-near absolute inset-0 flex items-center">
            <div className="flex w-1/2 justify-around">
              <div className="h-2 w-12 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
              <div className="h-2 w-12 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
              <div className="h-2 w-12 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
              <div className="h-2 w-12 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
            </div>
            <div className="flex w-1/2 justify-around">
              <div className="h-2 w-12 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
              <div className="h-2 w-12 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
              <div className="h-2 w-12 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
              <div className="h-2 w-12 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
            </div>
          </div>

          {/* Lower Speed Markings */}
          <div className="absolute inset-x-0 bottom-1 flex justify-around opacity-40 text-[9px] font-black text-purple-300 tracking-widest">
            <span>&gt;&gt;&gt;</span>
            <span>&gt;&gt;&gt;</span>
            <span>&gt;&gt;&gt;</span>
            <span>&gt;&gt;&gt;</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────
          HERO RUNNING ANIMATION (Left 20-25%)
         ─────────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 items-center px-4">
        <div className="relative flex items-center w-full">
          {/* Running Hero Card */}
          <div className="relative left-3 sm:left-10 flex flex-col items-center">
            {/* Speed streak lines behind hero */}
            <div className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-60">
              <div className="h-0.5 w-8 rounded-full bg-cyan-400 animate-pulse" />
              <div className="h-0.5 w-12 rounded-full bg-amber-400" />
              <div className="h-0.5 w-6 rounded-full bg-purple-400" />
            </div>

            {/* Hero Chibi Sprite with Run Bob */}
            <div className="anim-hero-bob relative flex flex-col items-center">
              <div className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                <HeroChibiSvg heroId={heroId} size={76} />
              </div>
              <span className="-mt-1 rounded-full border border-amber-500/70 bg-gradient-to-r from-amber-600 to-amber-800 px-2.5 py-0.5 font-display text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                {hero.name.split(' ')[0]} &bull; Lv.{stageNumber}
              </span>
            </div>

            {/* Spark particles kicking up behind feet */}
            <div className="pointer-events-none absolute bottom-3 -left-4 flex gap-1">
              <div
                className="h-2 w-2 rounded-full bg-amber-400"
                style={{ animation: 'runnerSpark 0.4s ease-out infinite' }}
              />
              <div
                className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                style={{ animation: 'runnerSpark 0.35s ease-out 0.1s infinite' }}
              />
              <div
                className="h-2 w-2 rounded-full bg-orange-400"
                style={{ animation: 'runnerSpark 0.45s ease-out 0.2s infinite' }}
              />
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────────────────────
              APPROACHING ENCOUNTER ENTITY (Slides in from the right edge)
             ─────────────────────────────────────────────────────────────────────────── */}
          <div className="anim-entity-slide ml-auto mr-2 sm:mr-8 flex flex-col items-center">
            {/* Case 1: Enemy / Boss Encounter */}
            {isCombatNode && (
              <div className="relative flex flex-col items-center">
                {/* Target Lock-On Reticle */}
                <div className="anim-radar pointer-events-none absolute -inset-3 rounded-full border-2 border-dashed border-red-500/70 opacity-90" />
                <div className="pointer-events-none absolute -inset-5 flex items-center justify-between text-red-400 text-xs font-black">
                  <span>[</span>
                  <span className="rotate-180">[</span>
                </div>

                {/* Monster Avatar */}
                <div className="relative flex items-center justify-center rounded-2xl border-2 border-red-500/80 bg-red-950/70 p-2 shadow-[0_0_24px_rgba(239,68,68,0.5)] backdrop-blur-sm">
                  <BossMonsterSvg
                    stage={stageNumber}
                    enemyName={enemyName}
                    size={74}
                  />
                  {isBoss && (
                    <span className="absolute -top-2.5 -right-2 rounded-full border border-red-400 bg-red-600 px-1.5 py-0.2 text-[8px] font-black text-white shadow animate-pulse">
                      BOSS
                    </span>
                  )}
                </div>

                {/* Warning Reticle Nameplate */}
                <div className="mt-2 flex flex-col items-center rounded-lg border border-red-500/60 bg-black/80 px-3 py-1 shadow-lg text-center">
                  <div className="flex items-center gap-1 font-display text-[9px] font-black tracking-wider text-red-400 uppercase">
                    <ShieldAlert className="h-3 w-3 animate-pulse text-red-500" />
                    <span>TARGET DETECTED</span>
                  </div>
                  <div className="font-display text-xs font-extrabold text-white">
                    {enemyName}
                  </div>
                  <div className="text-[8.5px] font-semibold text-slate-400">
                    Stage {stageNumber} &bull; Node {currentNodeIndex + 1}
                  </div>
                </div>
              </div>
            )}

            {/* Case 2: Vendor / Liquidity Shop */}
            {isShopNode && (
              <div className="relative flex flex-col items-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-cyan-400/80 bg-gradient-to-br from-cyan-950 to-slate-900 p-2 shadow-[0_0_24px_rgba(6,182,212,0.5)]">
                  <Store className="h-12 w-12 text-cyan-300 animate-pulse" />
                  <div className="absolute bottom-1 right-2 text-sm">💵</div>
                </div>

                <div className="mt-2 flex flex-col items-center rounded-lg border border-cyan-400/60 bg-black/80 px-3 py-1 text-center shadow-lg">
                  <div className="flex items-center gap-1 font-display text-[9px] font-black tracking-wider text-cyan-300 uppercase">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    <span>LIQUIDITY SHOP</span>
                  </div>
                  <div className="font-display text-xs font-extrabold text-white">
                    Hardware &amp; Relics
                  </div>
                </div>
              </div>
            )}

            {/* Case 3: Mystery Event / Gamble */}
            {isEventNode && (
              <div className="relative flex flex-col items-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-purple-400/80 bg-gradient-to-br from-purple-950 to-indigo-950 p-2 shadow-[0_0_24px_rgba(168,85,247,0.5)]">
                  <HelpCircle className="h-12 w-12 text-purple-300 animate-bounce" />
                  <div className="absolute top-1 right-2 text-xs">✨</div>
                </div>

                <div className="mt-2 flex flex-col items-center rounded-lg border border-purple-400/60 bg-black/80 px-3 py-1 text-center shadow-lg">
                  <div className="flex items-center gap-1 font-display text-[9px] font-black tracking-wider text-purple-300 uppercase">
                    <Sparkles className="h-3 w-3 text-purple-400" />
                    <span>SMART CONTRACT</span>
                  </div>
                  <div className="font-display text-xs font-extrabold text-white">
                    Risk &amp; Reward Anomaly
                  </div>
                </div>
              </div>
            )}

            {/* Case 4: Rest / Miner Retreat */}
            {nodeType === ('rest' as any) && (
              <div className="relative flex flex-col items-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-950 to-orange-950 p-2 shadow-[0_0_24px_rgba(245,158,11,0.5)]">
                  <Flame className="h-12 w-12 text-amber-400 animate-pulse" />
                  <div className="absolute top-1 left-2 text-xs">☕</div>
                </div>

                <div className="mt-2 flex flex-col items-center rounded-lg border border-amber-400/60 bg-black/80 px-3 py-1 text-center shadow-lg">
                  <div className="font-display text-[9px] font-black tracking-wider text-amber-300 uppercase">
                    MINER RETREAT
                  </div>
                  <div className="font-display text-xs font-extrabold text-white">
                    Rig Cooling Station
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────
          LOOT VACUUM FX (6-8 floating currency particles arcing upward to top HUD)
         ─────────────────────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {vacuumParticles.map((p) => (
          <div
            key={p.id}
            className="absolute text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{
              left: `${p.startX}px`,
              top: `${p.startY}px`,
              animation: `lootVacuumArc 0.62s cubic-bezier(0.25, 1, 0.5, 1) ${p.delayMs}ms forwards`,
            }}
          >
            {p.icon}
          </div>
        ))}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────
          BOTTOM HUD: WARPING PROGRESS BAR & TAP TO SKIP HINT
         ─────────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-30 flex flex-col items-center border-t border-purple-500/20 bg-black/60 px-4 py-2.5 backdrop-blur-md">
        {/* Progress Bar Track */}
        <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 transition-all duration-75"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Tap to Skip Hint Pill */}
        <div className="mt-2 flex items-center justify-between w-full max-w-md text-[10px] font-black tracking-wider uppercase text-slate-300">
          <span className="flex items-center gap-1 text-cyan-300">
            <FastForward className="h-3 w-3 animate-pulse" />
            {isAutoMode ? 'AUTO-WARPING ROAD (0.8s)' : 'BLOCKCHAIN HIGHWAY'}
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-slate-200">
            TAP ANYWHERE TO SKIP &gt;&gt;
          </span>
        </div>
      </div>
    </div>
  )
}
