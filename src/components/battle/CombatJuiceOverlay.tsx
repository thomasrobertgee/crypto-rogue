import { useEffect, useRef } from 'react'

export type CombatJuiceItemKind = 'green' | 'crit' | 'redCounter' | 'interrupt'

export interface CombatJuiceSpawnEvent {
  id: number
  kind: CombatJuiceItemKind
  text: string
  subtext?: string
  slot?: number
}

interface ActiveFctParticle {
  id: number
  kind: CombatJuiceItemKind
  text: string
  subtext?: string
  x: number
  y: number
  vx: number
  vy: number
  ay: number
  ageMs: number
  lifeMs: number
  baseScale: number
}

interface SparkParticle {
  x: number
  y: number
  vx: number
  vy: number
  ay: number
  size: number
  color: string
  alpha: number
  ageMs: number
  lifeMs: number
}

interface CombatJuiceOverlayProps {
  events: CombatJuiceSpawnEvent[]
}

export function CombatJuiceOverlay({ events }: CombatJuiceOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fctContainerRef = useRef<HTMLDivElement | null>(null)
  const seenIdsRef = useRef<Set<number>>(new Set())
  const fctsRef = useRef<ActiveFctParticle[]>([])
  const sparksRef = useRef<SparkParticle[]>([])

  // Ingest newly spawned combat juice events
  useEffect(() => {
    const canvas = canvasRef.current
    const width = canvas?.clientWidth || 380
    const height = canvas?.clientHeight || 260

    for (const ev of events) {
      if (seenIdsRef.current.has(ev.id)) continue
      seenIdsRef.current.add(ev.id)

      if (seenIdsRef.current.size > 200) {
        const firstId = seenIdsRef.current.values().next().value
        if (firstId !== undefined) seenIdsRef.current.delete(firstId)
      }

      const randArc = (Math.random() - 0.5) * 52

      if (ev.kind === 'crit') {
        // Critical / 10x Mega-Pump hit: Scale 1.6x with golden burst & "10X PUMP! 🔥" callout
        const startX = width * 0.66 + (Math.random() - 0.5) * 34
        const startY = height * 0.34 + (Math.random() - 0.5) * 18
        fctsRef.current.push({
          id: ev.id,
          kind: 'crit',
          text: ev.text,
          subtext: ev.subtext ?? '10X PUMP! 🔥',
          x: startX,
          y: startY,
          vx: randArc * 0.7,
          vy: -68,
          ay: 32,
          ageMs: 0,
          lifeMs: 1050,
          baseScale: 1.6,
        })

        // Spawn golden burst particles
        for (let i = 0; i < 18; i++) {
          const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.25
          const speed = 55 + Math.random() * 95
          sparksRef.current.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 20,
            ay: 160,
            size: 3 + Math.random() * 3.5,
            color: i % 2 === 0 ? '#FACC15' : '#FB923C',
            alpha: 1,
            ageMs: 0,
            lifeMs: 520 + Math.random() * 240,
          })
        }
      } else if (ev.kind === 'green') {
        // Normal Green tick: Float upward with a slight random horizontal arc
        const startX = width * 0.64 + (Math.random() - 0.5) * 40
        const startY = height * 0.42 + (Math.random() - 0.5) * 20
        fctsRef.current.push({
          id: ev.id,
          kind: 'green',
          text: ev.text,
          subtext: ev.subtext,
          x: startX,
          y: startY,
          vx: randArc,
          vy: -56 - Math.random() * 18,
          ay: 18,
          ageMs: 0,
          lifeMs: 850,
          baseScale: 1.0,
        })

        // Subtle emerald sparks
        for (let i = 0; i < 7; i++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4
          const speed = 35 + Math.random() * 55
          sparksRef.current.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            ay: 120,
            size: 2.2 + Math.random() * 2,
            color: '#4ADE80',
            alpha: 1,
            ageMs: 0,
            lifeMs: 380 + Math.random() * 160,
          })
        }
      } else if (ev.kind === 'redCounter') {
        // Red Candle Counter-Strike: Crimson jagged text with a downward gravity slam on the player's Margin HP bar
        const startX = width * 0.34 + (Math.random() - 0.5) * 36
        const startY = height * 0.24
        fctsRef.current.push({
          id: ev.id,
          kind: 'redCounter',
          text: ev.text,
          subtext: ev.subtext ?? 'COUNTER SLAM!',
          x: startX,
          y: startY,
          vx: (Math.random() - 0.5) * 24,
          vy: 28,
          ay: 260, // Heavy downward gravity slam toward the player's Margin HP bar
          ageMs: 0,
          lifeMs: 920,
          baseScale: 1.18,
        })

        // Crimson jagged shrapnel sparks
        for (let i = 0; i < 12; i++) {
          const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.6
          const speed = 40 + Math.random() * 80
          sparksRef.current.push({
            x: startX,
            y: startY + 18,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            ay: 240,
            size: 2.5 + Math.random() * 2.8,
            color: i % 2 === 0 ? '#EF4444' : '#FCA5A5',
            alpha: 1,
            ageMs: 0,
            lifeMs: 440 + Math.random() * 180,
          })
        }
      } else if (ev.kind === 'interrupt') {
        const startX = width * 0.5
        const startY = height * 0.28
        fctsRef.current.push({
          id: ev.id,
          kind: 'interrupt',
          text: ev.text,
          subtext: ev.subtext,
          x: startX,
          y: startY,
          vx: 0,
          vy: -38,
          ay: 10,
          ageMs: 0,
          lifeMs: 1100,
          baseScale: 1.35,
        })
      }
    }
  }, [events])

  // 60 FPS requestAnimationFrame physics loop for Canvas sparks + DOM FCT nodes
  useEffect(() => {
    let rafId = 0
    let lastTs = performance.now()

    const step = (now: number) => {
      const dtMs = Math.min(50, Math.max(1, now - lastTs))
      const dtSec = dtMs / 1000
      lastTs = now

      const canvas = canvasRef.current
      if (canvas) {
        const dpr = window.devicePixelRatio || 1
        const cw = canvas.clientWidth || 380
        const ch = canvas.clientHeight || 260
        if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
          canvas.width = Math.round(cw * dpr)
          canvas.height = Math.round(ch * dpr)
        }
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.save()
          ctx.scale(dpr, dpr)
          ctx.clearRect(0, 0, cw, ch)

          const nextSparks: SparkParticle[] = []
          for (const sp of sparksRef.current) {
            sp.ageMs += dtMs
            if (sp.ageMs >= sp.lifeMs) continue
            sp.vy += sp.ay * dtSec
            sp.x += sp.vx * dtSec
            sp.y += sp.vy * dtSec
            const progress = sp.ageMs / sp.lifeMs
            sp.alpha = Math.max(0, 1 - progress * progress)

            ctx.globalAlpha = sp.alpha
            ctx.fillStyle = sp.color
            ctx.beginPath()
            ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2)
            ctx.fill()
            nextSparks.push(sp)
          }
          sparksRef.current = nextSparks
          ctx.restore()
        }
      }

      // Update FCT physics and render directly into DOM nodes for crisp typography
      const container = fctContainerRef.current
      if (container) {
        const nextFcts: ActiveFctParticle[] = []
        for (const fct of fctsRef.current) {
          fct.ageMs += dtMs
          if (fct.ageMs >= fct.lifeMs) continue
          fct.vy += fct.ay * dtSec
          fct.x += fct.vx * dtSec
          fct.y += fct.vy * dtSec
          nextFcts.push(fct)
        }
        fctsRef.current = nextFcts

        // Synchronize child DOM elements by id
        const activeMap = new Map(nextFcts.map((f) => [String(f.id), f]))
        Array.from(container.children).forEach((child) => {
          const el = child as HTMLElement
          const fid = el.dataset.fctId
          if (!fid || !activeMap.has(fid)) {
            container.removeChild(el)
          }
        })

        for (const fct of nextFcts) {
          let el = container.querySelector(`[data-fct-id="${fct.id}"]`) as HTMLElement | null
          if (!el) {
            el = document.createElement('div')
            el.dataset.fctId = String(fct.id)
            el.className = 'pointer-events-none absolute left-0 top-0 flex flex-col items-center select-none will-change-transform'

            if (fct.subtext) {
              const sub = document.createElement('span')
              sub.className =
                fct.kind === 'crit'
                  ? 'rounded-full border border-[#78350F] bg-gradient-to-r from-[#FACC15] via-[#FB923C] to-[#EF4444] px-1.5 py-0.2 font-display text-[8px] font-black uppercase tracking-wider text-white shadow-sm'
                  : fct.kind === 'redCounter'
                    ? 'rounded-sm border border-black bg-[#dc2626] px-1 font-display text-[7.5px] font-black uppercase tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                    : 'font-display text-[8px] font-black uppercase tracking-wider text-[#FDE047]'
              sub.textContent = fct.subtext
              el.appendChild(sub)
            }

            const main = document.createElement('span')
            main.className =
              fct.kind === 'crit'
                ? 'font-display text-sm font-black tracking-tight text-[#FACC15] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] game-text-outline-sm'
                : fct.kind === 'green'
                  ? 'font-display text-xs font-black tracking-tight text-[#4ADE80] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)] game-text-outline-sm'
                  : fct.kind === 'redCounter'
                    ? 'font-display text-sm font-black tracking-tight text-[#ef4444] [-webkit-text-stroke:2px_#000] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                    : 'font-display text-xs font-black tracking-wider text-[#38BDF8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] game-text-outline-sm'
            main.textContent = fct.text
            el.appendChild(main)
            container.appendChild(el)
          }

          const progress = fct.ageMs / fct.lifeMs
          // Pop-in spring animation on crits & counter-slams
          let springScale = fct.baseScale
          if (progress < 0.16) {
            const t = progress / 0.16
            springScale = fct.baseScale * (0.4 + 0.85 * Math.sin(t * Math.PI * 0.75))
          } else if (progress < 0.28) {
            const t = (progress - 0.16) / 0.12
            springScale = fct.baseScale * (1.25 - 0.25 * t)
          }
          const opacity = progress > 0.72 ? Math.max(0, 1 - (progress - 0.72) / 0.28) : 1
          const jitterRotate = fct.kind === 'redCounter' ? Math.sin(fct.ageMs * 0.04) * 5 : 0

          el.style.transform = `translate3d(${Math.round(fct.x)}px, ${Math.round(fct.y)}px, 0) translate(-50%, -50%) scale(${springScale.toFixed(2)}) rotate(${jitterRotate.toFixed(1)}deg)`
          el.style.opacity = opacity.toFixed(2)
        }
      }

      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div ref={fctContainerRef} className="absolute inset-0" />
    </div>
  )
}
