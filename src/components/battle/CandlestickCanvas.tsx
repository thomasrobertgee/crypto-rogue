import { useEffect, useRef } from 'react'
import type { Candle } from '../../engine/combat'
import { CHART_SKIN_MAP, type ChartSkinId } from '../../config/chartSkins.config'
import { fmtUsd } from '../../engine/format'

export interface CandlestickCanvasProps {
  candles: Candle[]
  currentCandle?: Candle
  skinId?: ChartSkinId
  megaCandleActive?: boolean
  className?: string
  width?: number
  height?: number
  showPriceAxis?: boolean
}

export function CandlestickCanvas({
  candles,
  currentCandle,
  skinId = 'default',
  megaCandleActive = false,
  className = '',
  width,
  height,
  showPriceAxis = true,
}: CandlestickCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewBoundsRef = useRef<{ min: number; max: number; initialized: boolean }>({
    min: 0,
    max: 0,
    initialized: false,
  })
  const sparklesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }>>([])
  const animFrameRef = useRef<number | null>(null)

  const skin = CHART_SKIN_MAP[skinId] ?? CHART_SKIN_MAP.default

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isDestroyed = false

    const render = () => {
      if (isDestroyed) return
      const W = canvas.width
      const H = canvas.height
      if (W === 0 || H === 0) return

      ctx.clearRect(0, 0, W, H)

      // Background Tint
      ctx.fillStyle = skin.bgTint
      ctx.fillRect(0, 0, W, H)

      // Grid Lines
      ctx.strokeStyle = skin.gridColor
      ctx.lineWidth = 1
      ctx.beginPath()

      if (skin.id === 'retro_8bit') {
        // CRT horizontal scanlines
        for (let y = 0; y < H; y += 8) {
          ctx.moveTo(0, y)
          ctx.lineTo(W, y)
        }
        for (let x = 0; x < W; x += 24) {
          ctx.moveTo(x, 0)
          ctx.lineTo(x, H)
        }
      } else {
        // Standard / Synth grid
        const gridX = W / 5
        const gridY = H / 4
        for (let x = gridX; x < W; x += gridX) {
          ctx.moveTo(x, 0)
          ctx.lineTo(x, H)
        }
        for (let y = gridY; y < H; y += gridY) {
          ctx.moveTo(0, y)
          ctx.lineTo(W, y)
        }
      }
      ctx.stroke()

      // Dynamic Auto-Scaling Viewport
      const effectiveCurCandle = currentCandle ?? (candles.length > 0 ? candles[candles.length - 1] : { o: 1000, h: 1050, l: 950, c: 1020 })
      const all = [...candles.slice(-20), effectiveCurCandle]

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
        const anchor = Number.isFinite(effectiveCurCandle?.c) && effectiveCurCandle.c > 0 ? effectiveCurCandle.c : 1000
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

        const rawSpan = Math.max(1, dataMax - dataMin)
        const targetMin = Math.max(0, dataMin - rawSpan * 0.18)
        const targetMax = dataMax + rawSpan * 0.18

        const vb = viewBoundsRef.current
        if (!vb.initialized || !Number.isFinite(vb.min) || !Number.isFinite(vb.max)) {
          vb.min = targetMin
          vb.max = targetMax
          vb.initialized = true
        } else {
          const minLerp = targetMin < vb.min ? 0.38 : 0.12
          const maxLerp = targetMax > vb.max ? 0.38 : 0.12
          vb.min = vb.min + (targetMin - vb.min) * minLerp
          vb.max = vb.max + (targetMax - vb.max) * maxLerp
        }

        const padTop = 20
        const padBottom = 10
        const chartH = Math.max(32, H - padTop - padBottom)
        const viewRange = Math.max(1, vb.max - vb.min)
        const toY = (v: number) => {
          const rawY = padTop + chartH - ((v - vb.min) / viewRange) * chartH
          return Math.max(padTop - 2, Math.min(H - padBottom + 2, rawY))
        }

        // Y-Axis Price Labels
        if (showPriceAxis) {
          ctx.save()
          ctx.font = skin.id === 'retro_8bit' ? '700 7px monospace' : '700 8px Inter, sans-serif'
          ctx.fillStyle = skin.priceColor
          ctx.textAlign = 'right'
          ctx.fillText(fmtUsd(vb.max), W - 6, padTop + 4)
          ctx.fillText(fmtUsd((vb.max + vb.min) * 0.5), W - 6, padTop + chartH * 0.5 + 3)
          ctx.fillText(fmtUsd(vb.min), W - 6, H - padBottom)
          ctx.restore()
        }

        // Live dashed tracker line
        if (Number.isFinite(effectiveCurCandle?.c)) {
          const curY = toY(effectiveCurCandle.c)
          const curUp = effectiveCurCandle.c >= effectiveCurCandle.o
          ctx.save()
          ctx.setLineDash([3, 3])
          ctx.strokeStyle = curUp ? skin.bullColor : skin.bearColor
          ctx.globalAlpha = 0.5
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(6, curY)
          ctx.lineTo(W - (showPriceAxis ? 40 : 10), curY)
          ctx.stroke()
          ctx.restore()
        }

        const chartLeft = 8
        const chartWidth = Math.max(60, W - (showPriceAxis ? 48 : 16))
        const maxSlots = 21
        const stepX = chartWidth / maxSlots
        const bodyW = Math.max(4, stepX * 0.65)

        // Area Depth Fill
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

        // Candlesticks
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

          const wickTop = Math.min(rawYHigh, top - 2)
          const wickBottom = Math.max(rawYLow, bottom + 2)

          ctx.save()
          if (skin.glowBlur > 0) {
            ctx.shadowBlur = skin.glowBlur
            ctx.shadowColor = isUp ? skin.glowColorBull : skin.glowColorBear
          }

          // Wick
          ctx.strokeStyle = color
          ctx.lineWidth = skin.id === 'retro_8bit' ? 2 : 1.8
          ctx.beginPath()
          ctx.moveTo(xCenter, wickTop)
          ctx.lineTo(xCenter, wickBottom)
          ctx.stroke()

          // Body
          ctx.fillStyle = bodyColor
          ctx.fillRect(xCenter - bodyW / 2, top, bodyW, bh)
          ctx.strokeStyle = color
          ctx.lineWidth = 1.2
          ctx.strokeRect(xCenter - bodyW / 2, top, bodyW, bh)

          // 8-Bit Pixel Caps
          if (skin.id === 'retro_8bit') {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(xCenter - 1, wickTop, 2, 2)
            ctx.fillRect(xCenter - 1, wickBottom - 2, 2, 2)
          }

          ctx.restore()
        })

        // Sovereign Gold Particle Sparks
        if (skin.hasSparkles || megaCandleActive) {
          // Spawn new particles occasionally
          if (Math.random() < (megaCandleActive ? 0.8 : 0.35)) {
            sparklesRef.current.push({
              x: chartLeft + Math.random() * chartWidth,
              y: padTop + Math.random() * chartH,
              vx: (Math.random() - 0.5) * 1.5,
              vy: -Math.random() * 2 - 0.5,
              life: 0,
              maxLife: 20 + Math.random() * 25,
              color: skin.bullColor,
            })
          }
        }

        // Draw and update particles
        if (sparklesRef.current.length > 0) {
          ctx.save()
          sparklesRef.current = sparklesRef.current.filter((p) => {
            p.x += p.vx
            p.y += p.vy
            p.life++
            const alpha = Math.max(0, 1 - p.life / p.maxLife)
            ctx.fillStyle = p.color
            ctx.globalAlpha = alpha
            ctx.shadowColor = p.color
            ctx.shadowBlur = 6
            ctx.beginPath()
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
            ctx.fill()
            return p.life < p.maxLife
          })
          ctx.restore()
        }
      }

      // If sparkles active, continue animation loop
      if (skin.hasSparkles || megaCandleActive || sparklesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      isDestroyed = true
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [candles, currentCandle, skinId, megaCandleActive, skin, showPriceAxis])

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        if (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height)) {
          canvas.width = Math.round(rect.width)
          canvas.height = Math.round(rect.height)
        }
      }
    }
    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={width ?? 320}
      height={height ?? 110}
      className={`block w-full h-full ${className}`}
    />
  )
}
