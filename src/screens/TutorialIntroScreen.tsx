import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FastForward, ChevronsRight } from 'lucide-react'
import { HeroChibiSvg, BossMonsterSvg } from '../components/WorldDioramaArt'
import { AudioSynth } from '../engine/AudioSynth'

interface TutorialIntroScreenProps {
  /** Fired when the cutscene ends (Skip or after the Market Ambush) and the scripted Tutorial Battle should begin. */
  onFinish: () => void
}

const TOTAL_SCENES = 4

/* ───────────────────────── Small animation hooks ───────────────────────── */

/** Eases a number from `from` to `to` after `delayMs`, restarting whenever `runKey` changes. */
function useAnimatedNumber(from: number, to: number, durationMs: number, delayMs: number, runKey: number) {
  const [value, setValue] = useState(from)
  useEffect(() => {
    setValue(from)
    let raf = 0
    let start = 0
    const begin = window.setTimeout(() => {
      const step = (now: number) => {
        if (!start) start = now
        const t = Math.min(1, (now - start) / durationMs)
        const eased = 1 - Math.pow(1 - t, 2)
        setValue(from + (to - from) * eased)
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delayMs)
    return () => {
      window.clearTimeout(begin)
      cancelAnimationFrame(raf)
    }
  }, [from, to, durationMs, delayMs, runKey])
  return value
}

/** Typewriter reveal for dialogue lines. */
function useTypewriter(text: string, active: boolean, charMs = 32, startDelayMs = 400) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(0)
    if (!active) return
    let i = 0
    let interval = 0
    const begin = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1
        setCount(i)
        if (i >= text.length) window.clearInterval(interval)
      }, charMs)
    }, startDelayMs)
    return () => {
      window.clearTimeout(begin)
      window.clearInterval(interval)
    }
  }, [text, active, charMs, startDelayMs])
  return { shown: text.slice(0, count), done: count >= text.length }
}

const fmtMoney = (n: number) =>
  `$${Math.max(0, n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

/* ───────────────────────── Shared UI bits ───────────────────────── */

function CaptionCard({
  title,
  children,
  delayMs = 300,
}: {
  title?: string
  children: React.ReactNode
  delayMs?: number
}) {
  return (
    <div
      className="absolute inset-x-4 bottom-14 z-30 rounded-2xl border-[3px] border-[#3E2723] border-b-[5px] bg-[#FFFDF9] px-4 py-3 text-[#2C1810] shadow-[0_10px_24px_rgba(0,0,0,0.45)] opacity-0"
      style={{ animation: `fadeUpIn 0.5s ease-out ${delayMs}ms forwards` }}
    >
      {title && (
        <div className="mb-0.5 font-display text-[10px] font-black uppercase tracking-[0.18em] text-[#b45309]">
          {title}
        </div>
      )}
      <div className="font-display text-[13px] font-extrabold leading-snug text-[#2C1810]">{children}</div>
    </div>
  )
}

/** Deterministic skyline window lights (no Math.random so re-renders are stable). */
function SkylineBuildings({ fill, lit, y = 430 }: { fill: string; lit: string; y?: number }) {
  const buildings = useMemo(
    () => [
      { x: 0, w: 46, h: 190 },
      { x: 46, w: 38, h: 250 },
      { x: 84, w: 52, h: 170 },
      { x: 136, w: 40, h: 290 },
      { x: 176, w: 56, h: 210 },
      { x: 232, w: 36, h: 260 },
      { x: 268, w: 50, h: 180 },
      { x: 318, w: 40, h: 240 },
      { x: 358, w: 50, h: 200 },
    ],
    [],
  )
  return (
    <g>
      {buildings.map((b, bi) => (
        <g key={bi}>
          <rect x={b.x} y={y - b.h + 190} width={b.w} height={b.h} fill={fill} />
          {Array.from({ length: Math.floor(b.h / 22) }).map((_, r) =>
            Array.from({ length: Math.floor(b.w / 14) }).map((__, c) =>
              (r * 7 + c * 3 + bi) % 3 !== 0 ? (
                <rect
                  key={`${r}_${c}`}
                  x={b.x + 5 + c * 13}
                  y={y - b.h + 190 + 8 + r * 22}
                  width={6}
                  height={9}
                  fill={lit}
                  opacity={0.9}
                />
              ) : null,
            ),
          )}
        </g>
      ))}
    </g>
  )
}

function GoldStack({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <g key={i}>
          <ellipse cx={x} cy={y - i * 7} rx={22} ry={7} fill="#B45309" stroke="#2C1810" strokeWidth={1.5} />
          <ellipse cx={x} cy={y - i * 7 - 3} rx={22} ry={7} fill="#FDE047" stroke="#2C1810" strokeWidth={1.5} />
          <ellipse cx={x - 5} cy={y - i * 7 - 4} rx={7} ry={2} fill="#FFFBEB" opacity={0.8} />
        </g>
      ))}
    </g>
  )
}

/* ───────────────────────── SCENE 1: The Penthouse High-Roller ───────────────────────── */
function SceneOne({ runKey }: { runKey: number }) {
  const portfolio = useAnimatedNumber(0, 999_999_999, 1800, 300, runKey)
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1e1b4b]">
      <svg viewBox="0 0 400 720" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="pentSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="55%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="pentFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b2a1a" />
            <stop offset="100%" stopColor="#1c1209" />
          </linearGradient>
          <radialGradient id="pentGlow" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="720" fill="url(#pentSky)" />
        <SkylineBuildings fill="#1f1646" lit="#fde047" y={470} />
        {/* Window frame mullions */}
        <rect x="0" y="0" width="400" height="520" fill="none" stroke="#2C1810" strokeWidth="10" />
        <line x1="133" y1="0" x2="133" y2="520" stroke="#2C1810" strokeWidth="6" />
        <line x1="266" y1="0" x2="266" y2="520" stroke="#2C1810" strokeWidth="6" />
        {/* Penthouse floor */}
        <rect y="520" width="400" height="200" fill="url(#pentFloor)" />
        <rect y="520" width="400" height="8" fill="#F59E0B" />
        <ellipse cx="200" cy="600" rx="170" ry="26" fill="rgba(253,224,71,0.18)" />
        <circle cx="200" cy="400" r="190" fill="url(#pentGlow)" />

        {/* Floating green holo-charts */}
        {[
          { x: 14, y: 150, w: 118, h: 80 },
          { x: 268, y: 120, w: 118, h: 80 },
          { x: 262, y: 290, w: 120, h: 76 },
        ].map((p, i) => (
          <g key={i}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="10" fill="rgba(6,78,59,0.55)" stroke="#34d399" strokeWidth="2" />
            <polyline
              points={`${p.x + 8},${p.y + p.h - 12} ${p.x + p.w * 0.25},${p.y + p.h - 28} ${p.x + p.w * 0.45},${p.y + p.h - 22} ${p.x + p.w * 0.65},${p.y + p.h - 46} ${p.x + p.w * 0.85},${p.y + 16} ${p.x + p.w - 8},${p.y + 10}`}
              fill="none"
              stroke="#4ade80"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="400"
              style={{ animation: `drawLine 1.6s ease-out ${0.2 + i * 0.25}s both` }}
            />
            <text x={p.x + 10} y={p.y + 16} fill="#bbf7d0" fontSize="10" fontWeight="800">
              ▲ +{(i + 1) * 4200}%
            </text>
          </g>
        ))}

        <GoldStack x={50} y={585} n={6} />
        <GoldStack x={92} y={600} n={4} />
        <GoldStack x={350} y={585} n={7} />
        <GoldStack x={308} y={602} n={3} />
      </svg>

      {/* Portfolio banner */}
      <div className="absolute inset-x-4 top-12 z-20 rounded-2xl border-[3px] border-[#3E2723] border-b-[5px] bg-[#0F172A]/90 px-3 py-2 text-center shadow-xl">
        <div className="font-display text-[9px] font-black uppercase tracking-[0.25em] text-emerald-300">
          Portfolio Value
        </div>
        <div className="font-display text-[26px] font-black leading-none text-[#4ade80] drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">
          {fmtMoney(portfolio)}
        </div>
        <div className="mt-0.5 font-display text-[10px] font-extrabold text-amber-300">
          🏆 #1 Whale of Wall Street
        </div>
      </div>

      {/* Satoshi the high-roller */}
      <div className="absolute left-1/2 top-[40%] z-10 -translate-x-1/2">
        <HeroChibiSvg heroId="rookie_satoshi" size={170} />
        <div className="absolute -right-6 top-6 text-2xl animate-bounce">💎</div>
        <div className="absolute -left-6 top-12 text-xl animate-bounce" style={{ animationDelay: '0.4s' }}>
          🥂
        </div>
      </div>

      <CaptionCard>
        Charts green. Gold stacked to the ceiling. Satoshi was untouchable… <span className="text-[#b45309]">or so he thought.</span>
      </CaptionCard>
    </div>
  )
}

/* ───────────────────────── SCENE 2: The Rug-Pull Wipeout ───────────────────────── */
function SceneTwo({ runKey }: { runKey: number }) {
  const balance = useAnimatedNumber(999_999_999, 0, 2100, 1100, runKey)
  const [liquidated, setLiquidated] = useState(false)
  useEffect(() => {
    setLiquidated(false)
    const t1 = window.setTimeout(() => AudioSynth.playBossAlarm(), 150)
    const t2 = window.setTimeout(() => {
      AudioSynth.playRedDump()
    }, 750)
    const t3 = window.setTimeout(() => setLiquidated(true), 3300)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [runKey])

  const candles = [
    { x: 24, top: 150, h: 40 },
    { x: 62, top: 128, h: 46 },
    { x: 100, top: 108, h: 40 },
    { x: 138, top: 86, h: 54 },
    { x: 176, top: 70, h: 44 },
    { x: 214, top: 56, h: 40 },
    { x: 252, top: 40, h: 36 },
  ]

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#1c0a0a] via-[#450a0a] to-[#7f1d1d]"
      style={{ animation: 'screenShakeHard 0.45s ease-in-out 0.75s 2' }}
    >
      {/* Red alarm flash */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[#ef4444] opacity-0" style={{ animation: 'alarmFlash 0.7s ease-in-out infinite' }} />

      {/* Boss: The Sovereign Bear Whale (shadowy silhouette w/ red glare) */}
      <div className="absolute right-3 top-9 z-10 flex flex-col items-center opacity-0" style={{ animation: 'fadeUpIn 0.6s ease-out 0.1s forwards' }}>
        <div className="brightness-[0.28] contrast-125 drop-shadow-[0_0_22px_rgba(239,68,68,0.9)]">
          <BossMonsterSvg stage={2} enemyName="The Sovereign Bear Whale" size={160} />
        </div>
        <span className="-mt-3 whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-[#450a0a] px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-wider text-[#fecaca]">
          The Sovereign Bear Whale
        </span>
      </div>

      {/* Chart board getting smashed */}
      <div className="absolute left-3 top-[24%] z-10 h-[250px] w-[250px] overflow-hidden rounded-2xl border-[3px] border-[#3E2723] bg-[#0F172A]/90 shadow-2xl">
        <div className="absolute left-2 top-1 font-display text-[9px] font-black uppercase tracking-wider text-emerald-300">
          📈 SATOSHI/USD
        </div>
        <svg viewBox="0 0 290 250" className="absolute inset-0 h-full w-full">
          {[50, 100, 150, 200].map((y) => (
            <line key={y} x1="0" x2="290" y1={y} y2={y} stroke="rgba(255,255,255,0.07)" />
          ))}
          {candles.map((c) => (
            <g key={c.x}>
              <line x1={c.x + 10} x2={c.x + 10} y1={c.top - 10} y2={c.top + c.h + 12} stroke="#22ff99" strokeWidth="2" />
              <rect x={c.x} y={c.top} width="20" height={c.h} rx="2" fill="#22ff99" />
            </g>
          ))}
        </svg>
        {/* The giant crimson red candle slamming through the chart */}
        <div className="absolute inset-y-0 left-[58%] w-[54px] -translate-x-1/2">
          <div
            className="absolute inset-x-0 top-0 h-full opacity-0"
            style={{ animation: 'candleSlam 0.75s cubic-bezier(0.5, 0, 0.9, 0.4) 0.55s forwards' }}
          >
            <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-[#fb7185]" />
            <div className="absolute inset-x-0 top-[6%] bottom-[2%] rounded-md border-[3px] border-[#7f1d1d] bg-gradient-to-b from-[#fb7185] via-[#e11d48] to-[#7f1d1d] shadow-[0_0_30px_rgba(244,63,94,0.95)]" />
          </div>
          <div
            className="absolute bottom-[4%] left-1/2 h-24 w-24 rounded-full border-4 border-[#fb7185] opacity-0"
            style={{ animation: 'shockRing 0.8s ease-out 1.15s forwards' }}
          />
        </div>
      </div>

      {/* Satoshi crumpling under the crash */}
      <div className="absolute bottom-[26%] left-4 z-10 opacity-90">
        <div style={{ animation: 'screenShakeHard 0.5s ease-in-out 1.2s 3' }}>
          <HeroChibiSvg heroId="rookie_satoshi" size={96} />
        </div>
        <div className="absolute -right-2 -top-3 text-xl">😱</div>
      </div>

      {/* Balance ticker */}
      <div className="absolute inset-x-4 bottom-14 z-30 rounded-2xl border-[3px] border-[#3E2723] border-b-[5px] bg-[#0F172A]/95 px-3 py-2.5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.5)]">
        <div className="font-display text-[9px] font-black uppercase tracking-[0.25em] text-rose-300">
          ⚠ Rug-Pull Detected — Balance
        </div>
        <div className={`font-display text-[26px] font-black leading-none ${liquidated ? 'text-[#f43f5e]' : 'text-[#fb7185]'} drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]`}>
          {liquidated ? '$0.00' : fmtMoney(balance)}
        </div>
        {liquidated && (
          <div
            className="mt-1 inline-block rounded-lg border-[3px] border-[#fecaca] bg-[#be123c] px-3 py-0.5 font-display text-sm font-black uppercase tracking-widest text-white shadow-[0_0_18px_rgba(244,63,94,0.9)]"
            style={{ animation: 'stampIn 0.45s cubic-bezier(0.3, 1.5, 0.6, 1) forwards' }}
          >
            LIQUIDATED!
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── SCENE 3: Kicked to the Outskirts ───────────────────────── */
function SceneThree({ runKey }: { runKey: number }) {
  const [landed, setLanded] = useState(false)
  useEffect(() => {
    setLanded(false)
    const t = window.setTimeout(() => {
      setLanded(true)
      AudioSynth.playRedDump()
    }, 1350)
    return () => window.clearTimeout(t)
  }, [runKey])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg viewBox="0 0 400 720" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="outSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="40%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        <rect width="400" height="720" fill="url(#outSky)" />
        <circle cx="300" cy="150" r="48" fill="#FEF3C7" opacity="0.9" />
        {/* City skyline + gate wall (top-left) */}
        <g transform="translate(-10, -20) scale(0.95)">
          <SkylineBuildings fill="#7c5a8a" lit="#fde68a" y={420} />
        </g>
        <rect x="0" y="372" width="190" height="100" fill="#A8A29E" stroke="#2C1810" strokeWidth="4" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 48 + 4} y="364" width="30" height="14" fill="#D6D3D1" stroke="#2C1810" strokeWidth="3" />
        ))}
        <path d="M60 472 L60 418 Q95 380 130 418 L130 472 Z" fill="#451a03" stroke="#2C1810" strokeWidth="4" />
        <text x="95" y="404" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FDE047">
          WALL ST
        </text>
        {/* Ground */}
        <rect y="470" width="400" height="250" fill="url(#dirt)" />
        <path d="M0 470 Q100 455 200 470 T400 466 L400 482 L0 486 Z" fill="#65A30D" stroke="#2C1810" strokeWidth="3" />
        <path d="M80 720 Q160 590 230 560 Q290 540 330 500" fill="none" stroke="#92400E" strokeWidth="46" strokeLinecap="round" opacity="0.5" />
        {/* Patched-up tent (right) */}
        <g transform="translate(262, 470)">
          <path d="M0 150 L68 20 L136 150 Z" fill="#D6B98C" stroke="#2C1810" strokeWidth="4" strokeLinejoin="round" />
          <path d="M68 20 L100 150 L68 150 Z" fill="#B8956A" />
          <rect x="22" y="96" width="26" height="22" fill="#F87171" stroke="#2C1810" strokeWidth="2.5" transform="rotate(-8 35 107)" />
          <rect x="84" y="74" width="24" height="26" fill="#60A5FA" stroke="#2C1810" strokeWidth="2.5" transform="rotate(10 96 87)" />
          <path d="M68 150 L68 112 L90 150 Z" fill="#451a03" />
          <line x1="68" y1="20" x2="68" y2="2" stroke="#2C1810" strokeWidth="4" />
          <path d="M68 2 L92 8 L68 14 Z" fill="#F43F5E" stroke="#2C1810" strokeWidth="2" />
        </g>
        {/* Tiny campfire */}
        <ellipse cx="236" cy="640" rx="30" ry="8" fill="rgba(0,0,0,0.3)" />
        <path d="M226 636 Q236 606 246 636 Z" fill="#F97316" stroke="#2C1810" strokeWidth="2.5" />
        <path d="M231 636 Q236 618 241 636 Z" fill="#FDE047" />
      </svg>

      {/* Boot kick + "OUT!" */}
      <div className="absolute left-[30%] top-[39%] z-20 flex items-center gap-1 opacity-0" style={{ animation: 'fadeUpIn 0.3s ease-out 0.1s forwards' }}>
        <span className="rounded-lg border-2 border-[#3E2723] bg-[#FFFDF9] px-2 py-0.5 font-display text-[11px] font-black text-[#be123c]">
          YOU'RE BANNED!
        </span>
        <span className="text-2xl">🥾</span>
      </div>

      {/* Satoshi tumbling out of the city gate and landing face-first */}
      <div className="absolute left-[34%] top-[58%] z-10">
        <div className="opacity-0" style={{ animation: 'kickedOut 1.35s cubic-bezier(0.3, 0.6, 0.5, 1) 0.35s forwards' }}>
          <HeroChibiSvg heroId="rookie_satoshi" size={118} className="!animate-none" />
        </div>
        {landed && (
          <>
            <div className="absolute -left-6 bottom-0 h-3 w-8 rounded-full bg-[#D6B98C] animate-ping" />
            <div className="absolute -right-8 bottom-1 h-4 w-10 rounded-full bg-[#D6B98C] animate-ping" style={{ animationDelay: '0.1s' }} />
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-2xl font-black text-[#fde047] game-text-outline"
              style={{ animation: 'stampIn 0.35s ease-out forwards' }}
            >
              THUD!
            </div>
          </>
        )}
      </div>

      <CaptionCard title="Outskirts • 0 Gems • 0 Hashrate" delayMs={1500}>
        No portfolio. No penthouse. Just dirt, a patched-up tent… and a very bruised ego.
      </CaptionCard>
    </div>
  )
}

/* ───────────────────────── SCENE 4: The Vow & Ambush ───────────────────────── */
const VOW_TEXT = "I'll trade my way back to the top and liquidate them all!"

function SceneFour({ runKey, ambush }: { runKey: number; ambush: boolean }) {
  const { shown, done } = useTypewriter(VOW_TEXT, !ambush, 34, 700)
  const speechRef = useRef(false)
  useEffect(() => {
    if (!speechRef.current && done) {
      speechRef.current = true
      AudioSynth.playRelicTrigger()
    }
  }, [done])
  useEffect(() => {
    speechRef.current = false
  }, [runKey])

  useEffect(() => {
    if (ambush) AudioSynth.playBossAlarm()
  }, [ambush])

  return (
    <div className="absolute inset-0 overflow-hidden" style={ambush ? { animation: 'screenShakeHard 0.4s ease-in-out 0.5s 2' } : undefined}>
      <svg viewBox="0 0 400 720" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="vowSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="45%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="vowGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
        </defs>
        <rect width="400" height="720" fill="url(#vowSky)" />
        <circle cx="200" cy="380" r="120" fill="#FDE68A" opacity="0.35" />
        <circle cx="200" cy="380" r="70" fill="#FEF3C7" opacity="0.7" />
        <g opacity="0.85" transform="translate(0, -10)">
          <SkylineBuildings fill="#2a1f4d" lit="#fde68a" y={540} />
        </g>
        <path d="M0 520 C100 470 200 500 400 460 L400 720 L0 720 Z" fill="url(#vowGround)" stroke="#2C1810" strokeWidth="4" />
        <path d="M140 720 Q200 610 240 520 L270 520 Q250 620 300 720 Z" fill="#92400E" opacity="0.65" />
      </svg>

      {/* Determined Satoshi with fire in his eyes + cracked smartphone */}
      <div
        className="absolute left-[18%] top-[36%] z-10"
        style={{ transition: 'transform 0.4s ease-out', transform: ambush ? 'translateX(-14px) scale(0.92)' : 'none' }}
      >
        <div className="relative">
          <HeroChibiSvg heroId="rookie_satoshi" size={170} />
          <span className="pointer-events-none absolute left-[36%] top-[31%] h-3 w-3 rounded-full bg-[#fb923c] blur-[2px] animate-pulse" />
          <span className="pointer-events-none absolute left-[56%] top-[31%] h-3 w-3 rounded-full bg-[#fb923c] blur-[2px] animate-pulse" />
          <span className="pointer-events-none absolute left-[34%] top-[24%] text-[13px] animate-bounce">🔥</span>
          <span className="pointer-events-none absolute left-[55%] top-[24%] text-[13px] animate-bounce" style={{ animationDelay: '0.2s' }}>🔥</span>
          {/* Cracked smartphone in hand */}
          <svg
            viewBox="0 0 60 100"
            className="absolute -right-12 top-[44%] h-[90px] w-[54px] -rotate-12 drop-shadow-lg"
          >
            <rect x="3" y="3" width="54" height="94" rx="9" fill="#1f2937" stroke="#2C1810" strokeWidth="3" />
            <rect x="8" y="12" width="44" height="76" rx="3" fill="#0F172A" />
            <polyline points="12,70 22,60 30,66 40,42 48,30" fill="none" stroke="#fb7185" strokeWidth="2.5" />
            <polyline points="12,46 22,52 30,44 40,52 48,40" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.7" />
            <path d="M30 12 L26 34 L38 46 L30 60 L40 88 M26 34 L10 40 M38 46 L52 52 M30 60 L14 74" fill="none" stroke="#e5e7eb" strokeWidth="1.3" />
            <text x="30" y="82" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fecaca">
              -100%
            </text>
          </svg>
        </div>
      </div>

      {/* Vow speech bubble */}
      {!ambush && (
        <div className="absolute inset-x-4 top-12 z-20 rounded-2xl border-[3px] border-[#3E2723] border-b-[5px] bg-[#FFFDF9] px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.4)]">
          <div className="mb-0.5 font-display text-[10px] font-black uppercase tracking-[0.18em] text-[#b45309]">
            Rookie Satoshi
          </div>
          <div className="min-h-[54px] font-display text-[15px] font-extrabold leading-snug text-[#2C1810]">
            “{shown}
            {!done && <span className="animate-pulse">▍</span>}
            {done && '”'}
          </div>
          <div className="absolute -bottom-2.5 left-14 h-4 w-4 rotate-45 border-b-[3px] border-r-[3px] border-[#3E2723] bg-[#FFFDF9]" />
        </div>
      )}

      {/* MARKET AMBUSH */}
      {ambush && (
        <>
          <div className="pointer-events-none absolute inset-0 z-20 bg-[#ef4444] opacity-0" style={{ animation: 'alarmFlash 0.5s ease-in-out 4' }} />
          <div
            className="absolute inset-x-3 top-14 z-30 rounded-2xl border-[3px] border-[#7f1d1d] border-b-[6px] bg-[#fde047] px-3 py-2 text-center shadow-[0_0_30px_rgba(239,68,68,0.8)]"
            style={{ animation: 'stampIn 0.45s cubic-bezier(0.3, 1.5, 0.6, 1) forwards' }}
          >
            <div className="font-display text-[22px] font-black uppercase tracking-wider text-[#be123c]">⚠️ MARKET AMBUSH!</div>
            <div className="font-display text-[11px] font-extrabold text-[#2C1810]">A wild enemy blocks the road…</div>
          </div>
          <div className="absolute right-[6%] top-[42%] z-10 flex flex-col items-center opacity-0" style={{ animation: 'jumpInRight 0.8s cubic-bezier(0.3, 0.7, 0.4, 1) 0.2s forwards' }}>
            <BossMonsterSvg stage={1} enemyName="Street Scammer" size={150} />
            <span className="-mt-3 rounded-full border-2 border-[#3E2723] bg-[#ffe4e6] px-2.5 py-0.5 font-display text-[11px] font-black text-[#be123c] shadow-md">
              Lv.1 Street Scammer
            </span>
          </div>
        </>
      )}
    </div>
  )
}

/* ───────────────────────── Main cutscene controller ───────────────────────── */
export function TutorialIntroScreen({ onFinish }: TutorialIntroScreenProps) {
  // Dev deep link for QA: ?introScene=1..4 (4 = vow), 5 = ambush
  const devScene = useRef(Number(new URLSearchParams(window.location.search).get('introScene') ?? 0)).current
  const [scene, setScene] = useState(devScene > 0 ? Math.min(devScene, 4) - 1 : 0)
  const [runKey, setRunKey] = useState(0)
  const [canContinue, setCanContinue] = useState(false)
  const [ambush, setAmbush] = useState(devScene >= 5)
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onFinish()
  }, [onFinish])

  // Per-scene "Tap to Continue" unlock delay
  useEffect(() => {
    setCanContinue(false)
    const delays = [2200, 3600, 2800, 4300]
    const t = window.setTimeout(() => setCanContinue(true), delays[scene] ?? 2500)
    return () => window.clearTimeout(t)
  }, [scene, runKey])

  // Auto-advance into the Tutorial Battle after the ambush banner lands
  useEffect(() => {
    if (!ambush) return
    const t = window.setTimeout(finish, 2600)
    return () => window.clearTimeout(t)
  }, [ambush, finish])

  const advance = () => {
    AudioSynth.unlock()
    if (ambush) {
      finish()
      return
    }
    if (!canContinue) return
    AudioSynth.playCoinInject()
    if (scene < TOTAL_SCENES - 1) {
      setScene((s) => s + 1)
      setRunKey((k) => k + 1)
    } else {
      setAmbush(true)
    }
  }

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation()
    AudioSynth.unlock()
    finish()
  }

  return (
    <div onClick={advance} className="relative h-full w-full cursor-pointer select-none overflow-hidden bg-black">
      <div key={`${scene}_${runKey}`} className="absolute inset-0" style={{ animation: 'fadeUpIn 0.45s ease-out both' }}>
        {scene === 0 && <SceneOne runKey={runKey} />}
        {scene === 1 && <SceneTwo runKey={runKey} />}
        {scene === 2 && <SceneThree runKey={runKey} />}
        {scene === 3 && <SceneFour runKey={runKey} ambush={ambush} />}
      </div>

      {/* Panel progress pips */}
      <div className="pointer-events-none absolute left-3 top-3 z-40 flex items-center gap-1.5">
        {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full border border-[#3E2723] transition-all ${
              i === scene ? 'w-6 bg-[#fde047]' : i < scene ? 'w-2 bg-[#f59e0b]' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* [ Skip >> ] (kept left of the dev gear button) */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-11 top-2 z-50 flex items-center gap-1 rounded-full border-2 border-[#3E2723] bg-[#FFFDF9]/95 px-2.5 py-1 font-display text-[11px] font-black text-[#2C1810] shadow-md transition active:scale-95"
      >
        <span>Skip</span>
        <FastForward className="h-3 w-3" />
      </button>

      {/* [ Tap to Continue ] */}
      {canContinue && !ambush && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center">
          <span className="flex animate-pulse items-center gap-1 rounded-full border-2 border-[#3E2723] bg-[#FFFDF9]/95 px-3 py-1 font-display text-[11px] font-black uppercase tracking-wider text-[#2C1810] shadow-lg">
            Tap to Continue <ChevronsRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )}
    </div>
  )
}
