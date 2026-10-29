import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Flame, Lock, Sparkles, TrendingUp, Trophy } from 'lucide-react'
import type { EnemyConfig } from '../types/game.types'
import type { Candle } from '../engine/combat'
import { COIN_MAP } from '../config/coins.config'
import { HERO_MAP } from '../config/heroes.config'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtUsd } from '../engine/format'
import { useMetaStore } from '../state/useMetaStore'
import { TopHud } from '../components/battle/TopHud'
import {
  BossArena,
  type FloatingTextSpec,
  type ProjectileSpec,
} from '../components/battle/BossArena'
import { CoinMascotSvg, HashrateIcon, SatoshiGemIcon } from '../components/GameArtwork'
import { HeroChibiSvg } from '../components/WorldDioramaArt'

interface TutorialBattleScreenProps {
  /** Fired after the First Victory Payout + 3s Live Ticker transition. App routes to the stripped-down Home Screen. */
  onComplete: () => void
}

/* ───────────────────────── Deterministic Battle Script ─────────────────────────
   100% scripted — no RNG, so the player cannot lose. */
const SCAMMER: EnemyConfig = {
  id: 'street_scammer',
  name: 'Street Scammer',
  hp: 500,
  attack: 5,
  attackCooldown: 3,
  portrait: 'scammer',
}
const ENEMY_MAX_HP = 500
const START_TVL = 1000
const TICK_MS = 1500
const FINISHER_DMG = 500

interface ScriptedTick {
  dmg: number
  enemyHp: number
  charge: number
}
const TICKS: ScriptedTick[] = [
  { dmg: 120, enemyHp: 380, charge: 35 },
  { dmg: 130, enemyHp: 250, charge: 70 },
  { dmg: 100, enemyHp: 150, charge: 100 },
]

const BASE_CLOSES = [1000, 985, 992, 978, 990, 1004, 996, 1008, 994, 1000]
function buildCandles(completedTicks: number, finisherDone: boolean): Candle[] {
  const out: Candle[] = []
  let prev = 1000
  for (const c of BASE_CLOSES) {
    out.push({ o: prev, c, h: Math.max(prev, c) + 6, l: Math.min(prev, c) - 6 })
    prev = c
  }
  let tvl = START_TVL
  for (let i = 0; i < completedTicks; i++) {
    const next = tvl + TICKS[i].dmg
    out.push({ o: tvl, c: next, h: next + 10, l: tvl - 8 })
    tvl = next
  }
  if (finisherDone) {
    out.push({ o: tvl, c: tvl + FINISHER_DMG, h: tvl + FINISHER_DMG + 40, l: tvl - 10 })
  }
  return out
}

type TutStage = 'bubbles' | 'ticking' | 'skill_prompt' | 'finisher' | 'victory' | 'loading'

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface BubbleCopy {
  text: string
  cta: string
  targets: string[]
}
const BUBBLES: BubbleCopy[] = [
  {
    text: "Welcome to Crypto Rogues! Let's show this Street Scammer how real algorithmic trading works.",
    cta: 'Next ->',
    targets: [],
  },
  {
    text: 'This is your Active Wallet! Your equipped coins automatically roll the market every tick to build capacity and fire profit damage.',
    cta: 'Next ->',
    targets: ['[data-tutorial="wallet"]'],
  },
  {
    text: "Green Candles deal direct damage to the enemy's Liquidation Bar. Watch your Margin HP at the top—if it hits zero, you're liquidated!",
    cta: 'Next ->',
    targets: ['[data-tutorial="chart-box"]', '[data-tutorial="enemy-hp"]'],
  },
  {
    text: "⚠️ WATCH OUT FOR RED CANDLES: When the market dumps or your coins roll Red, the enemy strikes back and deals Margin Damage to you! Keep an eye on your Margin HP bar at the top.",
    cta: 'Start Trading! ->',
    targets: ['[data-tutorial="chart-box"]', '[data-tutorial="margin-hp"]'],
  },
]
const SKILL_TARGETS = ['[data-tutorial="skill-btn"]']

export function TutorialBattleScreen({ onComplete }: TutorialBattleScreenProps) {
  const equippedHeroId = 'rookie_satoshi' as const
  const hero = HERO_MAP[equippedHeroId]
  const bitcrumb = COIN_MAP.bitcrumb

  // Dev-only deep links for QA: ?tutStage=bubble0|bubble1|bubble2|ticking2|skill|finisher|victory
  const dev = useRef(new URLSearchParams(window.location.search).get('tutStage')).current

  const [stage, setStage] = useState<TutStage>(() => {
    if (dev === 'ticking2') return 'ticking'
    if (dev === 'skill') return 'skill_prompt'
    if (dev === 'victory') return 'victory'
    return 'bubbles'
  })
  const [bubbleIdx, setBubbleIdx] = useState(dev === 'bubble1' ? 1 : dev === 'bubble2' ? 2 : dev === 'bubble3' ? 3 : 0)
  const [tickIdx, setTickIdx] = useState(dev === 'ticking2' ? 2 : dev === 'skill' ? 3 : dev === 'victory' ? 3 : 0)
  const [finisherDone, setFinisherDone] = useState(dev === 'victory')
  const [skillUsed, setSkillUsed] = useState(dev === 'victory')
  const [megaCandle, setMegaCandle] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextSpec[]>([])
  const [projectiles, setProjectiles] = useState<ProjectileSpec[]>([])
  const [rects, setRects] = useState<Rect[]>([])
  const [dims, setDims] = useState({ w: 416, h: 740 })
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [coinProgress, setCoinProgress] = useState(0)
  const [, setFrame] = useState(0)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const nextIdRef = useRef(1)
  const tickStartRef = useRef(0)
  const rewardsGrantedRef = useRef(false)
  const completedRef = useRef(false)

  /* ───── Derived scripted state ───── */
  const lastTick = tickIdx > 0 ? TICKS[tickIdx - 1] : null
  const enemyHp = finisherDone ? 0 : lastTick ? lastTick.enemyHp : ENEMY_MAX_HP
  const skillChargePct = skillUsed ? 0 : lastTick ? lastTick.charge : 0
  const isSkillReady = skillChargePct >= 100
  const tvl = START_TVL + TICKS.slice(0, tickIdx).reduce((a, t) => a + t.dmg, 0) + (finisherDone ? FINISHER_DMG : 0)
  const capacityPct = 40 + tickIdx * 6
  const candles = buildCandles(tickIdx, finisherDone)
  const lastClose = candles[candles.length - 1].c
  const wobble = stage === 'ticking' ? Math.sin(performance.now() / 160) * 5 : 0
  const currentCandle: Candle = {
    o: lastClose,
    c: lastClose + wobble,
    h: lastClose + Math.abs(wobble) + 6,
    l: lastClose - Math.abs(wobble) - 4,
  }

  /* ───── Floating text / projectile helpers ───── */
  const spawnFloat = useCallback(
    (text: string, color: FloatingTextSpec['color'], subtext?: string, isCrit?: boolean, slot?: number) => {
      const id = nextIdRef.current++
      setFloatingTexts((prev) => [...prev.slice(-6), { id, text, subtext, color, slot, isCrit, createdAt: performance.now() }])
      window.setTimeout(() => setFloatingTexts((prev) => prev.filter((f) => f.id !== id)), 1600)
    },
    [],
  )
  const spawnProjectile = useCallback((isCrit: boolean) => {
    const id = nextIdRef.current++
    setProjectiles((prev) => [...prev.slice(-4), { id, slot: 0, isGreen: true, isCrit, createdAt: performance.now() }])
    window.setTimeout(() => setProjectiles((prev) => prev.filter((p) => p.id !== id)), 600)
  }, [])

  /* ───── Frame loop: drives the coin tick ring, candle wobble & projectile flight ───── */
  useEffect(() => {
    if (stage !== 'ticking' && stage !== 'finisher') return
    const iv = window.setInterval(() => {
      setFrame((f) => (f + 1) % 100000)
      if (stage === 'ticking') {
        setCoinProgress(Math.min(1, (performance.now() - tickStartRef.current) / TICK_MS))
      }
    }, 40)
    return () => window.clearInterval(iv)
  }, [stage])

  /* ───── STEP B: Fixed-math auto-battle ticks (1.5s / 3.0s / 4.5s) ───── */
  useEffect(() => {
    if (stage !== 'ticking') return
    tickStartRef.current = performance.now()
    const t = window.setTimeout(() => {
      const spec = TICKS[tickIdx]
      if (!spec) return
      AudioSynth.playGreenCandle()
      spawnProjectile(false)
      spawnFloat(`+${fmtUsd(spec.dmg)} DMG`, 'green', 'BitCrumb rolled GREEN!', false, 0)
      setScreenShake(true)
      window.setTimeout(() => setScreenShake(false), 180)
      setTickIdx(tickIdx + 1)
      if (tickIdx + 1 >= TICKS.length) {
        // STEP C: Tick 3 resolved (enemy 30%, skill 100%) → AUTO-PAUSE and spotlight the Hero Skill button
        setStage('skill_prompt')
        AudioSynth.playRelicTrigger()
      }
    }, TICK_MS)
    return () => window.clearTimeout(t)
  }, [stage, tickIdx, spawnFloat, spawnProjectile])

  /* ───── Spotlight measurement ───── */
  const overlayActive = stage === 'bubbles' || stage === 'skill_prompt'

  useLayoutEffect(() => {
    if (!overlayActive) {
      setRects((prev) => (prev.length === 0 ? prev : []))
      return
    }

    const measure = () => {
      const root = rootRef.current
      if (!root) return
      const rr = root.getBoundingClientRect()
      setDims((prev) =>
        prev.w === rr.width && prev.h === rr.height ? prev : { w: rr.width, h: rr.height },
      )

      const targets = stage === 'bubbles' ? BUBBLES[bubbleIdx].targets : SKILL_TARGETS
      const out: Rect[] = []
      for (const sel of targets) {
        const el = root.querySelector(sel)
        if (!el) continue
        const r = el.getBoundingClientRect()
        out.push({
          x: r.left - rr.left - 4,
          y: r.top - rr.top - 4,
          w: r.width + 8,
          h: r.height + 8,
        })
      }
      setRects((prev) => {
        if (prev.length === 0 && out.length === 0) return prev
        if (
          prev.length === out.length &&
          prev.every(
            (p, i) =>
              Math.abs(p.x - out[i].x) < 0.5 &&
              Math.abs(p.y - out[i].y) < 0.5 &&
              Math.abs(p.w - out[i].w) < 0.5 &&
              Math.abs(p.h - out[i].h) < 0.5,
          )
        ) {
          return prev
        }
        return out
      })
    }

    measure()
    const t = window.setTimeout(measure, 150)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [overlayActive, stage, bubbleIdx])

  /* ───── Handlers ───── */
  const handleNextBubble = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    if (bubbleIdx < BUBBLES.length - 1) {
      setBubbleIdx(bubbleIdx + 1)
    } else {
      setStage('ticking') // [ Start Trading! -> ] unpauses the battle
    }
  }

  const handleHeroSkill = () => {
    if (stage !== 'skill_prompt' || !isSkillReady) return
    AudioSynth.unlock()
    AudioSynth.playMythicalDrop()
    setSkillUsed(true)
    setStage('finisher')
    setMegaCandle(true)
    spawnProjectile(true)
    spawnFloat(`+${fmtUsd(FINISHER_DMG)} CRIT DAMAGE!`, 'gold', 'GENESIS PUMP MEGA-CANDLE!', true)
    window.setTimeout(() => {
      setFinisherDone(true)
      setScreenShake(true)
      AudioSynth.playChestOpen()
      window.setTimeout(() => setScreenShake(false), 450)
    }, 750)
    window.setTimeout(() => setMegaCandle(false), 1500)
    window.setTimeout(() => {
      setStage('victory')
      AudioSynth.playMythicalDrop()
    }, 2000)
  }

  // STEP D: Continue → grant payout, 3s Live Ticker transition, tutorialStep = 'upgrade_hero'
  const handleContinue = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    if (!rewardsGrantedRef.current) {
      rewardsGrantedRef.current = true
      useMetaStore.setState((s) => ({ hashrate: s.hashrate + 500, gems: s.gems + 100 }))
    }
    setLoadingProgress(0)
    setStage('loading')
  }

  useEffect(() => {
    if (stage !== 'loading') return
    const start = performance.now()
    const duration = 3000
    const iv = window.setInterval(() => {
      const elapsed = performance.now() - start
      setLoadingProgress(Math.min(100, Math.round((elapsed / duration) * 100)))
      if (elapsed >= duration) {
        window.clearInterval(iv)
        if (!completedRef.current) {
          completedRef.current = true
          useMetaStore.getState().setTutorialStep('upgrade_hero')
          onComplete()
        }
      }
    }, 50)
    return () => window.clearInterval(iv)
  }, [stage, onComplete])

  /* ───── Spotlight card layout ───── */
  const cardText = stage === 'skill_prompt' ? '⚡ Skill at 100%! Activate your Hero Skill for MASS GAINS!' : BUBBLES[bubbleIdx].text

  let cardStyle: React.CSSProperties = {}
  let arrow: { dir: 'up' | 'down'; x: number; y: number } | null = null
  if (rects.length > 0 && overlayActive) {
    const minTop = Math.min(...rects.map((r) => r.y))
    const maxBottom = Math.max(...rects.map((r) => r.y + r.h))
    const first = rects[0]
    const centerX = Math.min(dims.w - 24, Math.max(24, first.x + first.w / 2))
    if (stage === 'skill_prompt' || bubbleIdx === 1) {
      // Target at the bottom → card sits above it, arrow points down
      cardStyle = { bottom: dims.h - minTop + 36 }
      arrow = { dir: 'down', x: stage === 'skill_prompt' ? first.x + first.w / 2 : Math.min(first.x + 70, centerX), y: minTop - 32 }
    } else {
      // Target at the top → card sits below it, arrow points up
      cardStyle = { top: maxBottom + 38 }
      arrow = { dir: 'up', x: dims.w / 2, y: maxBottom + 4 }
    }
  }
  const centered = overlayActive && rects.length === 0

  /* ───── Bottom HUD constants ───── */
  const fundRadius = 22
  const fundCirc = 2 * Math.PI * fundRadius
  const tickRadius = 17.5
  const tickCirc = 2 * Math.PI * tickRadius

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full select-none flex-col overflow-hidden bg-[#fef3c7]"
    >
      {/* Tutorial banner strip */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-[#3E2723] bg-gradient-to-r from-[#fde047] to-[#f59e0b] px-3 py-1 pr-12">
        <span className="font-display text-[10px] font-black uppercase tracking-wider text-[#2C1810]">
          📘 Tutorial Battle • Market Ambush
        </span>
        <span className="rounded-full border border-[#3E2723] bg-[#FFFDF9] px-1.5 font-display text-[9px] font-black text-[#2C1810]">
          Stage 1
        </span>
      </div>

      <div data-tutorial="margin-hp" className="shrink-0">
        <TopHud
          marginHp={100}
          maxMarginHp={100}
          shield={0}
          totalPortfolio={tvl}
          startPortfolio={START_TVL}
          runRelics={[]}
          relicPulses={{}}
        />
      </div>

      {/* Duel arena (live chart box, enemy bar, hero & enemy) */}
      <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
        <div className="relative min-h-[54%] flex-1">
          <BossArena
            stageNumber={1}
            heroId={equippedHeroId}
            enemy={SCAMMER}
            enemyHp={enemyHp}
            enemyMaxHp={ENEMY_MAX_HP}
            attackTimer={0}
            hazardTimer={0}
            candles={candles}
            currentCandle={currentCandle}
            projectiles={projectiles}
            floatingTexts={floatingTexts}
            screenShake={screenShake}
            hazardBanner={null}
          />
        </div>

        {/* Bottom live HUD: Active Wallet + Hero Skill (same layout as the real battle) */}
        <div className="flex min-h-[116px] shrink-0 flex-col justify-center border-t-[3.5px] border-[#3E2723] bg-gradient-to-b from-[#FFFDF9] via-[#FDF6E9] to-[#F3E9D8] px-2.5 py-2.5 text-[#2C1810] shadow-[0_-8px_20px_rgba(44,24,16,0.28)]">
          <div className="flex w-full items-center justify-between gap-1.5">
            {/* Active Wallet */}
            <div data-tutorial="wallet" className="flex items-center gap-1.5 rounded-2xl p-0.5">
              {[0, 1, 2, 3].map((slot) => {
                if (slot > 0) {
                  return (
                    <div key={slot} className="flex flex-col items-center gap-0.5">
                      <div className="flex h-13 w-13 items-center justify-center rounded-full border-2 border-dashed border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]">
                        <Lock className="h-3.5 w-3.5 opacity-60" />
                      </div>
                      <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-1.5 font-display text-[8px] font-bold text-[#6E5A4F]">
                        SLOT {slot + 1}
                      </span>
                    </div>
                  )
                }
                const fundDash = fundCirc * (1 - capacityPct / 100)
                const tickDash = tickCirc * (1 - coinProgress)
                return (
                  <div key={slot} className="relative flex flex-col items-center">
                    <div className="relative flex h-13 w-13 items-center justify-center overflow-hidden rounded-full bg-[#FFFDF9] shadow-md">
                      <div
                        className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#059669]/65 via-[#10b981]/50 to-[#34d399]/35 transition-all duration-300"
                        style={{ height: `${capacityPct}%` }}
                      />
                      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full -rotate-90" viewBox="0 0 52 52">
                        <defs>
                          <linearGradient id="tutEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#22ff99" />
                          </linearGradient>
                        </defs>
                        <circle cx="26" cy="26" r={fundRadius} fill="none" stroke="#E2D5C1" strokeWidth="3.4" />
                        <circle
                          cx="26"
                          cy="26"
                          r={fundRadius}
                          fill="none"
                          stroke="url(#tutEmerald)"
                          strokeWidth="3.6"
                          strokeDasharray={fundCirc}
                          strokeDashoffset={fundDash}
                          strokeLinecap="round"
                        />
                        <circle cx="26" cy="26" r={tickRadius} fill="none" stroke="rgba(44,24,16,0.10)" strokeWidth="1.8" />
                        <circle
                          cx="26"
                          cy="26"
                          r={tickRadius}
                          fill="none"
                          stroke="#059669"
                          strokeWidth="2.0"
                          strokeDasharray={tickCirc}
                          strokeDashoffset={tickDash}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="relative z-10">
                        <CoinMascotSvg coin={bitcrumb} size={30} />
                      </div>
                    </div>
                    <span className="relative z-20 -mt-2 rounded-full border border-[#14532d] bg-[#064e3b] px-1.5 font-display text-[9px] font-black text-[#6ee7b7] shadow-xs">
                      {Math.round(capacityPct)}%
                    </span>
                    <span className="mt-0.5 font-display text-[8.5px] font-black leading-none text-[#15803d]">
                      {fmtUsd(START_TVL * (capacityPct / 100))}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Hero Skill + locked AUTO + speed */}
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                data-tutorial="skill-btn"
                disabled={!(stage === 'skill_prompt' && isSkillReady)}
                onClick={handleHeroSkill}
                title={`${hero.activeSkillName}: ${hero.activeSkillDesc}`}
                className={`relative flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-full border-[2.2px] border-b-[4px] border-[#3E2723] shadow-md transition-all ${
                  isSkillReady && !skillUsed
                    ? 'animate-bounce cursor-pointer bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#ea580c] text-[#2C1810] shadow-[0_0_14px_rgba(245,158,11,0.8)]'
                    : 'cursor-not-allowed bg-[#F3E9D8] text-[#6E5A4F]'
                }`}
              >
                <Sparkles className={`h-4 w-4 ${isSkillReady && !skillUsed ? 'text-[#2C1810]' : 'text-[#b45309]'}`} />
                <span className="mt-0.5 font-display text-[10px] font-black leading-none">{skillChargePct}%</span>
                <span className="font-display text-[7.5px] font-extrabold uppercase tracking-tighter">
                  {isSkillReady && !skillUsed ? 'SKILL!' : 'CHARGE'}
                </span>
              </button>

              <div className="flex w-[66px] flex-col gap-1">
                <div className="flex h-6 w-full items-center justify-center gap-1 rounded-lg border-2 border-[#E2D5C1] bg-[#F3E9D8] font-display text-[9px] font-black uppercase text-[#6E5A4F]">
                  <Lock className="h-2.5 w-2.5 text-[#b45309]" />
                  <span>AUTO</span>
                </div>
                <div className="flex w-full items-center gap-0.5">
                  {['1x', '2x', '4x'].map((s, i) => (
                    <div
                      key={s}
                      className={`flex h-5 flex-1 items-center justify-center rounded-md border font-display text-[8.5px] font-black ${
                        i === 0
                          ? 'border-[#3E2723] bg-[#7e22ce] text-white'
                          : 'border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Genesis Pump Mega-Candle sweeping through the chart box */}
      {megaCandle && <MegaCandleOverlay rootRef={rootRef} />}

      {/* ═══════════ STEP A / C: Spotlight overlay + Satoshi dialogue ═══════════ */}
      {overlayActive && (
        <>
          {centered ? (
            <div className="pointer-events-none absolute inset-0 z-[55] bg-black/65" />
          ) : (
            <svg className="pointer-events-none absolute inset-0 z-[55]" width={dims.w} height={dims.h}>
              <defs>
                <mask id="tutSpotlightMask">
                  <rect width={dims.w} height={dims.h} fill="white" />
                  {rects.map((r, i) => (
                    <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} rx="16" fill="black" />
                  ))}
                </mask>
              </defs>
              <rect width={dims.w} height={dims.h} fill="rgba(0,0,0,0.65)" mask="url(#tutSpotlightMask)" />
            </svg>
          )}

          {/* Pulsing glow outlines around spotlighted zones */}
          {rects.map((r, i) => (
            <div
              key={i}
              className="pointer-events-none absolute z-[56] rounded-2xl"
              style={{ left: r.x, top: r.y, width: r.w, height: r.h, animation: 'spotlightPulse 1.2s ease-in-out infinite' }}
            />
          ))}

          {/* Click blocker: nothing outside the spotlight card is interactive */}
          <div className="absolute inset-0 z-[57]" />

          {/* In "skill_prompt" only the Hero Skill button punches through the blocker */}
          {stage === 'skill_prompt' && rects[0] && (
            <button
              type="button"
              aria-label="Activate Hero Skill"
              onClick={handleHeroSkill}
              className="absolute z-[59] cursor-pointer rounded-full"
              style={{ left: rects[0].x, top: rects[0].y, width: rects[0].w, height: rects[0].h }}
            />
          )}

          {/* Animated pointer arrow */}
          {arrow && (
            <div
              className="pointer-events-none absolute z-[58] -translate-x-1/2 animate-bounce text-[#fde047] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
              style={{ left: arrow.x, top: arrow.y }}
            >
              {arrow.dir === 'down' ? (
                <ArrowDown className="h-7 w-7 stroke-[3.5]" />
              ) : (
                <ArrowUp className="h-7 w-7 stroke-[3.5]" />
              )}
            </div>
          )}

          {/* Satoshi dialogue card */}
          <div
            className={`absolute inset-x-3 z-[58] ${centered ? 'top-1/2 -translate-y-1/2' : ''}`}
            style={centered ? undefined : cardStyle}
          >
            <div className="relative rounded-2xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] px-3 pb-3 pt-2.5 text-[#2C1810] shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
              <div className="flex items-start gap-2.5">
                <div className="-mt-9 shrink-0 rounded-full border-[3px] border-[#3E2723] bg-gradient-to-b from-[#fde68a] to-[#fbbf24] p-0.5 shadow-md">
                  <div className="h-[58px] w-[58px] overflow-hidden rounded-full">
                    <div className="-mt-1 -ml-1">
                      <HeroChibiSvg heroId={equippedHeroId} size={66} className="!animate-none" />
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[10px] font-black uppercase tracking-[0.16em] text-[#b45309]">
                    Rookie Satoshi
                  </div>
                  <p className="mt-0.5 font-display text-[13px] font-extrabold leading-snug text-[#2C1810]">{cardText}</p>
                </div>
              </div>
              {stage === 'bubbles' ? (
                <button
                  type="button"
                  onClick={handleNextBubble}
                  className="btn-3d-gold mt-2.5 ml-auto flex items-center justify-center rounded-xl px-4 py-1.5 font-display text-xs font-black uppercase tracking-wide active:translate-y-0.5"
                >
                  {BUBBLES[bubbleIdx].cta}
                </button>
              ) : (
                <div className="mt-2 text-right font-display text-[10px] font-black uppercase tracking-wider text-[#b45309]">
                  Tap the glowing skill button ▶
                </div>
              )}
              {stage === 'bubbles' && (
                <div className="mt-1.5 flex justify-center gap-1">
                  {BUBBLES.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full ${i === bubbleIdx ? 'w-4 bg-[#f59e0b]' : 'w-1.5 bg-[#E2D5C1]'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══════════ STEP D: Tutorial Clear payout modal ═══════════ */}
      {stage === 'victory' && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/65 p-5 backdrop-blur-[2px]">
          <div
            className="w-full max-w-[330px] rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-5 text-center text-[#2C1810] shadow-2xl"
            style={{ animation: 'stampIn 0.5s cubic-bezier(0.3, 1.4, 0.6, 1) forwards' }}
          >
            <div className="mx-auto -mt-12 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] shadow-lg">
              <Trophy className="h-8 w-8 text-[#2C1810]" />
            </div>
            <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-wide text-[#15803d]">
              TUTORIAL CLEAR!
            </h2>
            <p className="mt-0.5 font-display text-xs font-extrabold text-[#6E5A4F]">
              Street Scammer liquidated. First blood to Satoshi!
            </p>

            <div className="mt-3 flex items-stretch justify-center gap-2">
              <div className="flex flex-1 flex-col items-center rounded-2xl border-2 border-[#3E2723] bg-[#F3E9D8] px-2 py-2">
                <HashrateIcon size={26} />
                <span className="mt-1 font-display text-lg font-black text-[#2C1810]">+500</span>
                <span className="font-display text-[10px] font-black uppercase text-[#6E5A4F]">Hashrate</span>
              </div>
              <div className="flex flex-1 flex-col items-center rounded-2xl border-2 border-[#3E2723] bg-[#F3E9D8] px-2 py-2">
                <SatoshiGemIcon size={26} />
                <span className="mt-1 font-display text-lg font-black text-[#2C1810]">+100</span>
                <span className="font-display text-[10px] font-black uppercase text-[#6E5A4F]">Gems</span>
              </div>
            </div>

            <p className="mt-3 flex items-center justify-center gap-1 font-display text-[11px] font-extrabold text-[#b45309]">
              <Flame className="h-3.5 w-3.5 text-[#e11d48]" />
              Enough to upgrade your Hero &amp; BitCrumb!
            </p>

            <button
              type="button"
              onClick={handleContinue}
              className="btn-3d-green mt-4 w-full rounded-2xl py-3 font-display text-base font-black uppercase tracking-wider active:translate-y-0.5"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* 3-second Live Ticker loading transition → Home */}
      {stage === 'loading' && <LiveTickerLoading progress={loadingProgress} />}
    </div>
  )
}

/* ───────────────────────── Sub-components ───────────────────────── */

/** Giant golden Genesis Pump candle shooting up through the Trading Chart Box. */
function MegaCandleOverlay({ rootRef }: { rootRef: React.RefObject<HTMLDivElement | null> }) {
  const [box, setBox] = useState<Rect | null>(null)
  useLayoutEffect(() => {
    const root = rootRef.current
    const el = root?.querySelector('[data-tutorial="chart-box"]')
    if (!root || !el) return
    const rr = root.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    setBox({ x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height })
  }, [rootRef])
  if (!box) return null
  return (
    <div
      className="pointer-events-none absolute z-[40] overflow-hidden rounded-2xl"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      <div className="absolute inset-0 animate-pulse bg-[#fde047]/20" />
      <div
        className="absolute bottom-0 left-[62%] h-[96%] w-[46px] origin-bottom -translate-x-1/2"
        style={{ animation: 'megaCandleRise 1.4s ease-out forwards' }}
      >
        <div className="absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 bg-[#fef9c3]" />
        <div className="absolute inset-x-0 bottom-[2%] top-[8%] rounded-md border-[3px] border-[#92400e] bg-gradient-to-t from-[#f59e0b] via-[#fde047] to-[#fffbeb] shadow-[0_0_40px_14px_rgba(253,224,71,0.9)]" />
      </div>
      <div className="absolute inset-x-0 top-2 text-center font-display text-[11px] font-black uppercase tracking-[0.2em] text-[#fef08a] drop-shadow-[0_0_8px_rgba(245,158,11,1)]">
        ★ Genesis Pump ★
      </div>
    </div>
  )
}

function LiveTickerLoading({ progress }: { progress: number }) {
  const bars = [
    { x: 16, top: 44, bot: 68, hTop: 38, hBot: 72, green: true },
    { x: 44, top: 34, bot: 52, hTop: 28, hBot: 58, green: true },
    { x: 72, top: 40, bot: 58, hTop: 34, hBot: 64, green: false },
    { x: 100, top: 24, bot: 46, hTop: 18, hBot: 50, green: true },
    { x: 128, top: 18, bot: 36, hTop: 12, hBot: 42, green: true },
    { x: 156, top: 26, bot: 42, hTop: 20, hBot: 48, green: false },
    { x: 184, top: 14, bot: 32, hTop: 8, hBot: 36, green: true },
    { x: 212, top: 8, bot: 24, hTop: 4, hBot: 28, green: true },
    { x: 240, top: 4, bot: 18, hTop: 2, hBot: 22, green: true },
  ]
  return (
    <div className="absolute inset-0 z-[80] flex flex-col items-center justify-center bg-[#0F172A]/95 p-6 text-center backdrop-blur-md">
      <div className="w-full max-w-[330px] rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-5 text-[#2C1810] shadow-2xl">
        <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#16a34a]/40 bg-[#dcfce7] px-3 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-[#15803d]">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>SYNCING LIVE TICKER...</span>
        </div>
        <h2 className="font-display text-lg font-extrabold">HEADING BACK TO CAMP</h2>
        <p className="mt-0.5 text-xs font-semibold text-[#6E5A4F]">Loot secured. Time to upgrade your gear!</p>

        <div className="relative my-4 h-28 w-full overflow-hidden rounded-2xl border-2 border-[#3E2723] bg-[#0F172A] p-3">
          <svg className="h-full w-full" viewBox="0 0 260 80">
            {bars.map((c, idx) => {
              const visible = progress >= (idx + 1) * 10 - 8
              return (
                <g
                  key={c.x}
                  style={{
                    opacity: visible ? 1 : 0.12,
                    transform: visible ? 'translateY(0px)' : 'translateY(8px)',
                    transition: 'all 220ms ease-out',
                  }}
                >
                  <line x1={c.x} y1={c.hTop} x2={c.x} y2={c.hBot} stroke={c.green ? '#22c55e' : '#ef4444'} strokeWidth="2" />
                  <rect
                    x={c.x - 7}
                    y={c.top}
                    width="14"
                    height={Math.max(6, c.bot - c.top)}
                    rx="2"
                    fill={c.green ? '#22c55e' : '#ef4444'}
                  />
                </g>
              )
            })}
          </svg>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full border-2 border-[#3E2723] bg-[#F3E9D8]">
          <div
            className="h-full bg-gradient-to-r from-[#22c55e] to-[#f59e0b] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 font-display text-[11px] font-extrabold text-[#b45309]">
          PREPARING HOME SCREEN... {progress}%
        </div>
      </div>
    </div>
  )
}
