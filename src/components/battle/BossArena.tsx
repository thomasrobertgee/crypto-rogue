import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Clock, Skull } from 'lucide-react'
import type { EnemyConfig } from '../../types/game.types'
import type { Candle } from '../../engine/combat'
import type { MarketWeatherConfig } from '../../config/weather.config'
import { HERO_MAP, type HeroId } from '../../config/heroes.config'
import { CHART_SKIN_MAP } from '../../config/chartSkins.config'
import { useMetaStore } from '../../state/useMetaStore'
import { fmtNum, fmtUsd } from '../../engine/format'
import {
  StageLandscapeSvg,
  HeroChibiSvg,
  BossMonsterSvg,
} from '../WorldDioramaArt'
import { PetSprite } from '../PetSprite'
import type { PetId } from '../../config/pets.config'

export interface ProjectileSpec {
  id: number
  slot: number
  isGreen: boolean
  isCrit: boolean
  createdAt: number
  isEnemyProjectile?: boolean
}

export interface FloatingTextSpec {
  id: number
  text: string
  subtext?: string
  color: 'green' | 'red' | 'cyan' | 'gold' | 'violet'
  slot?: number // 0..3 or undefined (boss area)
  isCrit?: boolean
  createdAt: number
}

interface BossArenaProps {
  stageNumber?: number
  heroId?: HeroId
  enemy: EnemyConfig
  enemyHp: number
  enemyMaxHp: number
  attackTimer: number
  hazardTimer: number
  ultimateTimer?: number
  ironWillArmor?: number
  candles: Candle[]
  currentCandle: Candle
  projectiles: ProjectileSpec[]
  floatingTexts: FloatingTextSpec[]
  screenShake: boolean
  heroHitFlash?: boolean
  hazardBanner: { name: string; description: string } | null
  marketWeather?: MarketWeatherConfig | null
  megaCandleActive?: boolean
  isBearMarket?: boolean
  equippedPetId?: PetId | null
}

const FLOAT_COLOR_CLASS: Record<FloatingTextSpec['color'], string> = {
  green: 'text-[#22ff99] drop-shadow-[0_2px_8px_rgba(34,255,153,0.9)]',
  red: 'text-[#fb7185] drop-shadow-[0_2px_8px_rgba(251,113,133,0.9)]',
  cyan: 'text-[#38bdf8] drop-shadow-[0_2px_8px_rgba(56,189,248,0.9)]',
  gold: 'text-[#fde047] drop-shadow-[0_2px_8px_rgba(253,224,71,0.9)]',
  violet: 'text-[#c084fc] drop-shadow-[0_2px_8px_rgba(192,132,252,0.9)]',
}

export function BossArena({
  stageNumber = 1,
  heroId = 'rookie_satoshi',
  enemy,
  enemyHp,
  enemyMaxHp,
  attackTimer,
  hazardTimer,
  ultimateTimer = 0,
  ironWillArmor = 2,
  candles,
  currentCandle,
  projectiles,
  floatingTexts,
  screenShake,
  heroHitFlash = false,
  hazardBanner,
  marketWeather,
  megaCandleActive,
  isBearMarket,
  equippedPetId,
}: BossArenaProps) {
  const [weatherTooltipOpen, setWeatherTooltipOpen] = useState(false)
  const [trailingEnemyHp, setTrailingEnemyHp] = useState(enemyHp)

  useEffect(() => {
    if (enemyHp < trailingEnemyHp) {
      const timer = setTimeout(() => {
        setTrailingEnemyHp(enemyHp)
      }, 400)
      return () => clearTimeout(timer)
    } else {
      setTrailingEnemyHp(enemyHp)
    }
  }, [enemyHp, trailingEnemyHp])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const equippedSkinId = useMetaStore((s) => s.equippedChartSkin) ?? 'default'
  const skin = CHART_SKIN_MAP[equippedSkinId] ?? CHART_SKIN_MAP.default
  // Dynamic Auto-Scaling Viewport (Auto-Zoom) smoothed bounds
  const viewBoundsRef = useRef<{ min: number; max: number; initialized: boolean }>({
    min: 900,
    max: 1100,
    initialized: false,
  })

  const hpPct = Math.max(0, Math.min(100, (enemyHp / Math.max(1, enemyMaxHp)) * 100))
  const trailingEnemyPct = Math.max(0, Math.min(100, (trailingEnemyHp / Math.max(1, enemyMaxHp)) * 100))
  const rawAtkPct = Math.max(
    0,
    Math.min(100, (attackTimer / Math.max(0.1, enemy.attackCooldown)) * 100),
  )
  const isLatencyJitter = enemy.affix?.id === 'latency_jitter' || enemy.affix?.id === 'multi_affix'
  // Latency Jitter: Hides heavy attack cast bar until 50% charged!
  const isJitterHidden = isLatencyJitter && rawAtkPct < 50
  const atkPct = isJitterHidden ? 0 : rawAtkPct
  const ultCooldown = enemy.ultimateCooldown ?? 14
  const ultPct = enemy.isBoss
    ? Math.max(0, Math.min(100, (ultimateTimer / Math.max(0.1, ultCooldown)) * 100))
    : 0
  const hazPct = enemy.hazard
    ? Math.max(0, Math.min(100, (hazardTimer / Math.max(0.1, enemy.hazard.interval)) * 100))
    : 0

  const isHeavyInterruptible = atkPct >= 75 && atkPct < 100
  const isUltInterruptible = enemy.isBoss && ultPct >= 75 && ultPct < 100
  const hasGreenProjectiles = projectiles.some((p) => p.isGreen && !p.isEnemyProjectile)

  const hero = HERO_MAP[heroId] ?? HERO_MAP.rookie_satoshi

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (
      canvas.width !== Math.floor(rect.width * dpr) ||
      canvas.height !== Math.floor(rect.height * dpr)
    ) {
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
    }
    ctx.save()
    ctx.scale(dpr, dpr)
    const W = rect.width
    const H = rect.height

    ctx.clearRect(0, 0, W, H)

    // Background grid lines styled according to equipped chart skin
    ctx.strokeStyle = skin.gridColor
    ctx.lineWidth = 1
    if (skin.id === 'retro_8bit') {
      for (let y = 0; y < H; y += 8) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
      for (let x = 0; x < W; x += 24) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
    } else {
      for (let y = 20; y < H; y += 24) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
      for (let x = 24; x < W; x += 34) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
    }

    // Dynamic Auto-Scaling Viewport (Auto-Zoom) for Candlesticks
    const all = [...candles.slice(-20), currentCandle]
    if (all.length > 0) {
      let dataMin = Infinity
      let dataMax = -Infinity
      for (const c of all) {
        if (Number.isFinite(c.l) && c.l < dataMin) dataMin = c.l
        if (Number.isFinite(c.h) && c.h > dataMax) dataMax = c.h
        if (Number.isFinite(c.o)) {
          if (c.o < dataMin) dataMin = c.o
          if (c.o > dataMax) dataMax = c.o
        }
        if (Number.isFinite(c.c)) {
          if (c.c < dataMin) dataMin = c.c
          if (c.c > dataMax) dataMax = c.c
        }
      }
      const anchor = Number.isFinite(currentCandle?.c) && currentCandle.c > 0 ? currentCandle.c : 1000
      if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) {
        dataMin = anchor * 0.92
        dataMax = anchor * 1.08
      }

      const minSpan = Math.max(30, anchor * 0.08)
      if (dataMax - dataMin < minSpan) {
        const mid = (dataMax + dataMin) * 0.5
        dataMin = mid - minSpan * 0.5
        dataMax = mid + minSpan * 0.5
      }

      // Add 18% headroom at top & bottom so wicks/candles never clip or wrap at edges
      const rawSpan = Math.max(1, dataMax - dataMin)
      const targetMin = Math.max(0, dataMin - rawSpan * 0.18)
      const targetMax = dataMax + rawSpan * 0.18

      const vb = viewBoundsRef.current
      if (!vb.initialized || !Number.isFinite(vb.min) || !Number.isFinite(vb.max)) {
        vb.min = targetMin
        vb.max = targetMax
        vb.initialized = true
      } else {
        // Zoom out faster when price action pushes toward top/bottom edge; zoom in smoothly when range contracts
        const minLerp = targetMin < vb.min ? 0.38 : 0.12
        const maxLerp = targetMax > vb.max ? 0.38 : 0.12
        vb.min = vb.min + (targetMin - vb.min) * minLerp
        vb.max = vb.max + (targetMax - vb.max) * maxLerp
      }

      const padTop = 22
      const padBottom = 10
      const chartH = Math.max(32, H - padTop - padBottom)
      const viewRange = Math.max(1, vb.max - vb.min)
      const toY = (v: number) => {
        const rawY = padTop + chartH - ((v - vb.min) / viewRange) * chartH
        return Math.max(padTop - 2, Math.min(H - padBottom + 2, rawY))
      }

      // Subtle right-hand auto-zoom Y-axis price guide labels
      ctx.save()
      ctx.font = skin.id === 'retro_8bit' ? '700 7px monospace' : '700 8px Inter, sans-serif'
      ctx.fillStyle = skin.priceColor
      ctx.textAlign = 'right'
      ctx.fillText(fmtUsd(vb.max), W - 6, padTop + 6)
      ctx.fillText(fmtUsd((vb.max + vb.min) * 0.5), W - 6, padTop + chartH * 0.5 + 3)
      ctx.fillText(fmtUsd(vb.min), W - 6, H - padBottom)
      ctx.restore()

      // Live current price dashed tracker line
      if (Number.isFinite(currentCandle?.c)) {
        const curY = toY(currentCandle.c)
        const curUp = currentCandle.c >= currentCandle.o
        ctx.save()
        ctx.setLineDash([3, 3])
        ctx.strokeStyle = curUp ? skin.bullColor : skin.bearColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(8, curY)
        ctx.lineTo(W - 42, curY)
        ctx.stroke()
        ctx.restore()
      }

      const chartLeft = 10
      const chartWidth = Math.max(80, W - 52)
      const maxSlots = 21
      const stepX = chartWidth / maxSlots
      const bodyW = Math.max(5, stepX * 0.65)

      // Soft luminous gradient fill under the candlestick path for orderbook depth
      if (all.length > 1) {
        ctx.save()
        ctx.beginPath()
        all.forEach((c, idx) => {
          const x = chartLeft + idx * stepX + stepX * 0.5
          const y = toY(c.c)
          if (idx === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        const lastX = chartLeft + (all.length - 1) * stepX + stepX * 0.5
        const firstX = chartLeft + stepX * 0.5
        ctx.lineTo(lastX, H - padBottom)
        ctx.lineTo(firstX, H - padBottom)
        ctx.closePath()
        const areaGrad = ctx.createLinearGradient(0, padTop, 0, H - padBottom)
        const isBullish = all[all.length - 1].c >= all[0].o
        const gradStops = isBullish ? skin.bullAreaGrad : skin.bearAreaGrad
        areaGrad.addColorStop(0, gradStops[0])
        areaGrad.addColorStop(1, gradStops[1])
        ctx.fillStyle = areaGrad
        ctx.fill()
        ctx.restore()
      }

      all.forEach((c, idx) => {
        const xCenter = chartLeft + idx * stepX + stepX * 0.5
        const isUp = c.c >= c.o
        const color = isUp ? skin.bullColor : skin.bearColor
        const bodyColor = isUp ? skin.bullBodyColor : skin.bearBodyColor
        const rawYHigh = toY(c.h)
        const rawYLow = toY(c.l)
        const yOpen = toY(c.o)
        const yClose = toY(c.c)

        const top = Math.min(yOpen, yClose)
        const bh = Math.max(2, Math.abs(yClose - yOpen))
        const bottom = top + bh

        // Ensure wicks extend visibly past the candle body
        const wickTop = Math.min(rawYHigh, top - 2)
        const wickBottom = Math.max(rawYLow, bottom + 2)

        ctx.save()
        if (skin.glowBlur > 0) {
          ctx.shadowBlur = skin.glowBlur
          ctx.shadowColor = isUp ? skin.glowColorBull : skin.glowColorBear
        }

        // Draw upper & lower wick line
        ctx.strokeStyle = color
        ctx.lineWidth = skin.id === 'retro_8bit' ? 2 : 1.8
        ctx.beginPath()
        ctx.moveTo(xCenter, wickTop)
        ctx.lineTo(xCenter, wickBottom)
        ctx.stroke()

        // Draw candlestick solid body
        ctx.fillStyle = bodyColor
        ctx.fillRect(xCenter - bodyW / 2, top, bodyW, bh)
        ctx.strokeStyle = color
        ctx.lineWidth = 1.2
        ctx.strokeRect(xCenter - bodyW / 2, top, bodyW, bh)

        if (skin.id === 'retro_8bit') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(xCenter - 1, wickTop, 2, 2)
          ctx.fillRect(xCenter - 1, wickBottom - 2, 2, 2)
        }
        ctx.restore()
      })
    }

    // Projectiles streaking across the Trading Chart Box
    const now = performance.now()
    for (const p of projectiles) {
      const t = Math.min(1, (now - p.createdAt) / 380)
      if (t >= 1) continue

      if (p.isEnemyProjectile) {
        // Crimson Bear Claw / Dump Candle projectile firing from enemy -> hero/player
        const startX = W * 0.85
        const startY = H * 0.35
        const targetX = ((p.slot + 0.5) / 4) * W * 0.8 + W * 0.1
        const targetY = H - 6
        const x = startX + (targetX - startX) * t
        const y = startY + (targetY - startY) * (t * (2 - t))

        ctx.save()
        ctx.shadowColor = '#ef4444'
        ctx.shadowBlur = 18
        ctx.fillStyle = '#dc2626'
        const w = 11
        const h = 20
        ctx.fillRect(x - w / 2, y - h / 2, w, h)
        ctx.strokeStyle = '#fca5a5'
        ctx.lineWidth = 1.8
        ctx.beginPath()
        ctx.moveTo(x, y - h / 2 - 5)
        ctx.lineTo(x, y + h / 2 + 5)
        ctx.stroke()
        // Bear claw slash marks
        ctx.strokeStyle = '#fee2e2'
        ctx.beginPath()
        ctx.moveTo(x - 4, y - 6)
        ctx.lineTo(x + 4, y + 6)
        ctx.stroke()
        ctx.restore()
      } else {
        const startX = ((p.slot + 0.5) / 4) * W
        const startY = H - 6
        const targetX = W * 0.85
        const targetY = H * 0.35
        const x = startX + (targetX - startX) * t
        const y = startY + (targetY - startY) * (t * (2 - t))

        const color = p.isGreen ? skin.bullColor : skin.bearColor
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = p.isCrit ? 18 : skin.glowBlur > 0 ? 12 : 10
        ctx.fillStyle = color
        const w = p.isCrit ? 10 : 7
        const h = p.isCrit ? 22 : 15
        ctx.fillRect(x - w / 2, y - h / 2, w, h)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(x, y - h / 2 - 4)
        ctx.lineTo(x, y + h / 2 + 4)
        ctx.stroke()
        ctx.restore()
      }
    }

    ctx.restore()
  })

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden py-1 transition-transform ${
        screenShake ? 'translate-x-1 -translate-y-0.5' : ''
      }`}
    >
      {/* 1. Bright 2D Natural Stage Landscape Backdrop (Sunset Hills & Lawn) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <StageLandscapeSvg stage={stageNumber} mode="battle" />
      </div>

      {/* 2. Streamlined Top Boss Header & Liquidation HP Bar */}
      <div
        data-tutorial="enemy-hp"
        className="relative z-20 mx-3 flex shrink-0 flex-col gap-1 rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9]/95 px-2.5 py-1 text-[#2C1810] shadow-md"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Skull className="h-3.5 w-3.5 shrink-0 text-[#e11d48]" />
            <span className="truncate font-display text-xs font-extrabold tracking-wide text-[#2C1810]">
              {enemy.name}
            </span>
            {enemy.hazard && (
              <span className="rounded-full bg-[#ffe4e6] border border-[#e11d48] px-1.5 py-0.2 font-display text-[8px] font-black text-[#be123c]">
                {enemy.hazard.name}
              </span>
            )}
            {enemy.affix && (
              <span
                className="rounded-full bg-[#f3e8ff] border border-[#a855f7] px-1.5 py-0.2 font-display text-[8px] font-black text-[#7e22ce] shadow-xs"
                title={enemy.affix.description}
              >
                ⚡ {enemy.affix.name}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="font-display text-[11px] font-black text-[#2C1810]">
              ${fmtNum(Math.ceil(enemyHp))} / ${fmtNum(enemyMaxHp)}
            </span>
            <span className="flex items-center gap-0.5 rounded-full border border-[#3E2723] bg-[#fde047] px-1.5 py-0.2 font-display text-[8px] font-black text-[#2C1810]">
              <Clock className="h-2.5 w-2.5" /> {marketWeather?.id === 'dark_pool_fog' ? '???' : `-${enemy.attack} HP`}
            </span>
          </div>
        </div>

        {/* Liquidation HP Bar with Delayed Trailing Damage Bar */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-[#3E2723] bg-[#F3E9D8] shadow-inner">
          {/* Delayed bright white/gold trailing damage bar (400ms delay before smooth shrink) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#fef08a] transition-all duration-500 ease-out"
            style={{ width: `${trailingEnemyPct}%` }}
          />
          {/* Main active enemy HP bar */}
          <div
            className="relative h-full bg-gradient-to-r from-[#e11d48] via-[#fb7185] to-[#f59e0b] transition-all duration-150"
            style={{ width: `${hpPct}%` }}
          />
          {marketWeather?.id === 'dark_pool_fog' ? (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-500/60 animate-pulse" />
          ) : (
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-[#0284c7] transition-all duration-75"
              style={{ width: `${atkPct}%` }}
            />
          )}
          {enemy.hazard && (
            <div
              className="absolute top-0 left-0 h-0.5 bg-[#7e22ce] transition-all duration-75"
              style={{ width: `${hazPct}%` }}
            />
          )}
        </div>

        {/* Telegraphed Heavy Attack Bar (Orange "⚠️ HEAVY DUMP" charge bar over 5–6s) */}
        <div className={`relative mt-0.5 flex flex-col gap-0.5 rounded-lg border px-1.5 py-0.5 transition-all ${
          isHeavyInterruptible
            ? 'border-[#f59e0b] bg-[#fef3c7] shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse'
            : 'border-[#E2D5C1] bg-[#FDF6E9]'
        }`}>
          <div className="flex items-center justify-between text-[8px] font-display font-black leading-none">
            <span className="flex items-center gap-1 text-[#b45309]">
              <span>⚠️ HEAVY DUMP</span>
              <span className="text-[#dc2626]">(-{enemy.attack} HP)</span>
            </span>
            <div className="flex items-center gap-1">
              {isHeavyInterruptible && (
                <span className="rounded bg-[#ea580c] px-1 text-[7px] text-white animate-bounce">
                  ⚡ COUNTER-PUMP READY!
                </span>
              )}
              {isJitterHidden ? (
                <span className="text-[#a855f7] font-black animate-pulse">
                  ??? JITTER
                </span>
              ) : (
                <span className="text-[#78350f]">
                  {Math.max(0, enemy.attackCooldown - attackTimer).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full border border-[#3E2723]/30 bg-[#E2D5C1]">
            <div
              className={`h-full transition-all duration-75 ${
                isHeavyInterruptible
                  ? 'bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#ef4444]'
                  : 'bg-gradient-to-r from-[#f59e0b] to-[#ea580c]'
              }`}
              style={{ width: `${atkPct}%` }}
            />
          </div>
        </div>

        {/* Boss-Only Secondary Black Swan Ultimate Charge Bar (Purple or Iron Will Golden Bar) */}
        {enemy.isBoss && (
          <div className={`relative mt-0.5 flex flex-col gap-0.5 rounded-lg border px-1.5 py-0.5 transition-all ${
            enemy.hasIronWill
              ? 'border-2 border-amber-400 bg-amber-950/40 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
              : isUltInterruptible
                ? 'border-[#9333ea] bg-[#f3e8ff] shadow-[0_0_10px_rgba(147,51,234,0.5)] animate-pulse'
                : 'border-[#E2D5C1] bg-[#FAF5FF]'
          }`}>
            <div className="flex items-center justify-between text-[8px] font-display font-black leading-none">
              <span className={`flex items-center gap-1 ${enemy.hasIronWill ? 'text-amber-300' : 'text-[#7e22ce]'}`}>
                {enemy.hasIronWill ? (
                  <>
                    <span>🔒 IRON WILL ULTIMATE</span>
                    <span className="text-amber-400">(-{enemy.ultimateDmg ?? Math.round(enemy.attack * 1.5)} HP + 50%)</span>
                    <span className="ml-1 rounded bg-amber-500/30 px-1 py-0.2 text-[7px] text-amber-200 border border-amber-400/50">
                      {ironWillArmor >= 2 ? '🛡️🛡️ 2/2' : ironWillArmor === 1 ? '🛡️💥 1/2' : '💥 BROKEN'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>☠️ BLACK SWAN ULTIMATE</span>
                    <span className="text-[#9333ea]">(-{enemy.ultimateDmg ?? Math.round(enemy.attack * 1.5)} HP + 15%)</span>
                  </>
                )}
              </span>
              <div className="flex items-center gap-1">
                {isUltInterruptible && (
                  <span className={`rounded px-1 text-[7px] text-white animate-bounce ${
                    enemy.hasIronWill ? 'bg-amber-500 font-black' : 'bg-[#9333ea]'
                  }`}>
                    {enemy.hasIronWill
                      ? ironWillArmor > 1
                        ? '⚡ CRACK ARMOR (1/2)!'
                        : '⚡ SHATTER CAST NOW!'
                      : '⚡ INTERRUPT NOW!'}
                  </span>
                )}
                <span className={enemy.hasIronWill ? 'text-amber-200 font-mono' : 'text-[#6b21a8]'}>
                  {Math.max(0, (enemy.ultimateCooldown ?? 14) - (ultimateTimer ?? 0)).toFixed(1)}s
                </span>
              </div>
            </div>
            <div className={`relative h-1.5 w-full overflow-hidden rounded-full border ${
              enemy.hasIronWill ? 'border-amber-400/60 bg-black/70' : 'border-[#3E2723]/30 bg-[#E2D5C1]'
            }`}>
              <div
                className={`h-full transition-all duration-75 ${
                  enemy.hasIronWill
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-gradient-to-r from-[#a855f7] via-[#9333ea] to-[#7e22ce]'
                }`}
                style={{ width: `${ultPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. CENTERED 50%-OPACITY TRADING CHART BOX WITH DYNAMIC AUTO-ZOOM (Slightly reduced height to give Bottom HUD +50% room) */}
      <div
        data-tutorial="chart-box"
        className={`relative z-20 mx-3 my-1 flex-1 min-h-[115px] rounded-2xl backdrop-blur-[2px] border-2 shadow-inner overflow-hidden transition-all ${
          isBearMarket
            ? 'border-purple-600/90 bg-[#160b24]/90 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
            : skin.id === 'sovereign_gold'
            ? 'border-amber-400/90 bg-[#1c1408]/80 shadow-[0_0_18px_rgba(251,191,36,0.3)]'
            : skin.id === 'cyber_laser'
            ? 'border-cyan-400/80 bg-[#0a0a1a]/80 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
            : skin.id === 'retro_8bit'
            ? 'border-[#39ff14]/80 bg-[#08120a]/80 shadow-[0_0_12px_rgba(57,255,20,0.2)]'
            : 'border-[#3E2723]/80 bg-[#0F172A]/50'
        }`}
      >
        {/* Top Live Terminal Watermark + Dynamic Market Weather Pill */}
        <div className="absolute top-1 left-2.5 right-2.5 z-30 flex items-center justify-between text-[8px] font-display font-black uppercase tracking-wider text-white/75">
          <span>📈 AUTO-ZOOM ORDERBOOK</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#22ff99]">LIVE TICKER</span>
            {marketWeather && (
              <button
                type="button"
                onClick={() => {
                  setWeatherTooltipOpen((o) => !o)
                  window.setTimeout(() => setWeatherTooltipOpen(false), 3500)
                }}
                className={`pointer-events-auto flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider shadow-sm transition-transform active:scale-95 ${marketWeather.bgPill} ${marketWeather.textColor} ${marketWeather.borderColor}`}
                title="Tap to inspect Market Weather"
              >
                <span>{marketWeather.icon}</span>
                <span>{marketWeather.badgeLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Auto-fading Market Weather Tooltip inside Chart Box */}
        {weatherTooltipOpen && marketWeather && (
          <div
            onClick={() => setWeatherTooltipOpen(false)}
            className="absolute top-7 right-2.5 z-40 max-w-[210px] rounded-xl border-2 border-[#3E2723] bg-[#FFFDF9]/95 p-2 font-display text-[#2C1810] shadow-xl animate-fade-in cursor-pointer"
          >
            <div className="flex items-center gap-1 font-black text-[10px]">
              <span>{marketWeather.icon}</span>
              <span>{marketWeather.name}</span>
            </div>
            <p className="mt-0.5 text-[9px] font-bold text-[#b45309] leading-tight">
              {marketWeather.description}
            </p>
          </div>
        )}

        {/* Evolved Coin Mega-Candle Burst Screen-Clearing Beam */}
        {megaCandleActive && (
          <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-r from-transparent via-amber-400/35 to-transparent animate-pulse">
            <div className="h-full w-12 bg-gradient-to-t from-[#22ff99] via-[#fde047] to-[#fb7185] opacity-80 blur-[2px] animate-pulse" />
            <div className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-[#fde047] bg-[#78350f]/90 px-3 py-1 font-display text-xs font-black text-[#fde047] shadow-[0_0_18px_rgba(250,204,21,0.9)] animate-bounce">
              ⚡ MEGA-CANDLE BURST! ⚡
            </div>
          </div>
        )}

        {/* HTML5 Candlestick & Projectile Canvas Inside the Box */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* Hazard Trigger Alert Banner Inside Chart Box */}
        {hazardBanner && (
          <div className="pointer-events-none absolute top-6 inset-x-3 z-30 flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#fb7185] bg-[#4c0519]/95 px-2.5 py-1 font-display text-[10px] font-black text-white shadow-lg animate-bounce">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#fde047]" />
            <span className="truncate">
              {hazardBanner.name.toUpperCase()}: {hazardBanner.description}
            </span>
          </div>
        )}

        {/* ALL Floating Damage & Outcome Numbers Strictly Inside the Centered Chart Box */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {floatingTexts.map((f, idx) => {
            const leftPct = f.slot !== undefined ? 16 + f.slot * 22 : 50
            const bottomPx = 14 + (idx % 3) * 20
            return (
              <div
                key={f.id}
                style={{ left: `${leftPct}%`, bottom: `${bottomPx}px` }}
                className={`-translate-x-1/2 absolute flex flex-col items-center font-display font-black transition-all duration-500 animate-pulse game-text-outline-sm whitespace-nowrap ${
                  FLOAT_COLOR_CLASS[f.color]
                } ${f.isCrit ? 'text-base scale-110' : 'text-xs'}`}
              >
                <span>{f.text}</span>
                {f.subtext && (
                  <span className="text-[9px] font-bold text-white drop-shadow">{f.subtext}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. DUEL AREA ON THE GREEN LAWN STRIP DIRECTLY BELOW THE CHART BOX */}
      <div className="relative z-20 mx-3 flex shrink-0 items-center justify-between px-4 pt-0 pb-0.5">
        {/* Left: Player's Lead Hero with Hit-Flash & Lunge and equipped Pet companion */}
        <div
          className={`relative flex items-center gap-1 transition-all duration-150 ${
            heroHitFlash
              ? 'brightness-150 saturate-200 contrast-125 scale-95 drop-shadow-[0_0_14px_rgba(239,68,68,0.9)]'
              : ''
          } ${hasGreenProjectiles ? 'translate-x-3 scale-105' : ''}`}
        >
          <div className="relative flex flex-col items-center">
            <HeroChibiSvg heroId={heroId} size={66} />
            <span className="-mt-2 rounded-full border border-[#3E2723] bg-[#FFFDF9] px-2 py-0.2 font-display text-[9px] font-extrabold text-[#2C1810] shadow-xs">
              {hero.name.split(' ')[0]}
            </span>
          </div>
          {equippedPetId && (
            <div className="-mt-4 flex flex-col items-center">
              <PetSprite petId={equippedPetId} size={38} />
            </div>
          )}
        </div>

        {/* Open Center Duel Lane between Hero & Boss */}
        <div className="pointer-events-none flex-1" />

        {/* Right: Enemy Boss on the Lawn with Recoil */}
        <div
          className={`relative flex flex-col items-center transition-all duration-150 ${
            screenShake ? 'scale-95 translate-x-1' : ''
          }`}
        >
          <BossMonsterSvg
            stage={stageNumber}
            enemyName={enemy.name}
            isHit={screenShake}
            size={70}
          />
          <span className="-mt-2 rounded-full border border-[#3E2723] bg-[#ffe4e6] px-2 py-0.2 font-display text-[9px] font-extrabold text-[#be123c] max-w-[110px] truncate shadow-xs">
            {enemy.name}
          </span>
        </div>
      </div>
    </div>
  )
}
