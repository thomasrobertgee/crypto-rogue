import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Sparkles } from 'lucide-react'
import { useMetaStore } from '../../state/useMetaStore'
import { HeroChibiSvg } from '../WorldDioramaArt'
import type { HubTabId } from '../BottomTabBar'

interface TutorialOverlayProps {
  activeTab: HubTabId
  onNavigateTab: (tab: HubTabId) => void
}

interface SpotlightRect {
  x: number
  y: number
  w: number
  h: number
}

interface StepGuidance {
  targetSelector: string
  text: string
  title: string
  arrowDirection: 'up' | 'down'
  fallbackNavigate?: HubTabId
}

export function TutorialOverlay({ activeTab, onNavigateTab }: TutorialOverlayProps) {
  const meta = useMetaStore()
  const tutorialStep = meta.tutorialStep

  const rootRef = useRef<HTMLDivElement | null>(null)
  const scrolledTargetRef = useRef<string | null>(null)
  const [rect, setRect] = useState<SpotlightRect | null>(null)
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 416, h: 740 })
  const [, setPollCount] = useState(0)

  const isTutorialActive =
    tutorialStep === 'upgrade_hero' ||
    tutorialStep === 'upgrade_coin' ||
    tutorialStep === 'ready_stage_1'

  // Determine the active target and guidance text based on tutorialStep + activeTab + DOM state
  let guidance: StepGuidance | null = null

  if (tutorialStep === 'upgrade_hero') {
    if (activeTab !== 'base') {
      guidance = {
        targetSelector: '[data-tutorial="bottom-tab-base"]',
        title: 'Step 1: Power Up',
        text: "Great fight! Let's use our loot to power up. Tap the Base HQ tab!",
        arrowDirection: 'down',
        fallbackNavigate: 'base',
      }
    } else {
      // In Base HQ
      guidance = {
        targetSelector: '[data-tutorial="hero-level-up-btn"]',
        title: 'Step 1: Hero Upgrade',
        text: "Tap LEVEL UP to boost Rookie Satoshi's Hodl Aura!",
        arrowDirection: 'down',
      }
    }
  } else if (tutorialStep === 'upgrade_coin') {
    if (activeTab !== 'base') {
      guidance = {
        targetSelector: '[data-tutorial="bottom-tab-base"]',
        title: 'Step 2: Crypto Upgrade',
        text: 'Tap the Base HQ tab to upgrade your starting crypto!',
        arrowDirection: 'down',
        fallbackNavigate: 'base',
      }
    } else {
      // In Base HQ
      const coinLevelUpBtnExists = typeof document !== 'undefined' && Boolean(document.querySelector('[data-tutorial="coin-level-up-btn"]'))
      const coinCardExists = typeof document !== 'undefined' && Boolean(document.querySelector('[data-tutorial="coin-card-bitcrumb"]'))

      if (coinLevelUpBtnExists) {
        guidance = {
          targetSelector: '[data-tutorial="coin-level-up-btn"]',
          title: 'Step 2: BitCrumb Level Up',
          text: 'Tap LEVEL UP to upgrade BitCrumb to Lv.2!',
          arrowDirection: 'down',
        }
      } else if (!coinCardExists) {
        // Still on Heroes sub-tab
        guidance = {
          targetSelector: '[data-tutorial="subtab-coins"]',
          title: 'Step 2: Crypto Roster',
          text: 'Now tap the Coins tab to upgrade your starting crypto!',
          arrowDirection: 'up',
        }
      } else {
        // On Coins sub-tab, drawer not opened yet
        guidance = {
          targetSelector: '[data-tutorial="coin-card-bitcrumb"]',
          title: 'Step 2: Select BitCrumb',
          text: 'Select BitCrumb to inspect its power!',
          arrowDirection: 'down',
        }
      }
    }
  } else if (tutorialStep === 'ready_stage_1') {
    if (activeTab !== 'run') {
      guidance = {
        targetSelector: '[data-tutorial="bottom-tab-run"]',
        title: 'Step 3: Return to Camp',
        text: 'Tap the Trade Run tab to return to camp!',
        arrowDirection: 'down',
        fallbackNavigate: 'run',
      }
    } else {
      guidance = {
        targetSelector: '[data-tutorial="start-run-btn"]',
        title: 'Stage 1 Ready!',
        text: "You're ready! Enter Stage 1: Genesis Block and start your climb!",
        arrowDirection: 'down',
      }
    }
  }

  // Periodic DOM poll (150ms) to track drawer openings, tab switches, and responsive rects
  useEffect(() => {
    if (!isTutorialActive) return
    const iv = window.setInterval(() => setPollCount((c) => (c + 1) % 10000), 180)
    return () => window.clearInterval(iv)
  }, [isTutorialActive])

  // Measure target bounding rect relative to the MobileFrame container
  useLayoutEffect(() => {
    if (!isTutorialActive || !guidance) {
      setRect(null)
      return
    }

    const measure = () => {
      const root = rootRef.current?.parentElement
      if (!root) return
      const rootRect = root.getBoundingClientRect()
      setDims((prev) =>
        prev.w === rootRect.width && prev.h === rootRect.height
          ? prev
          : { w: rootRect.width, h: rootRect.height },
      )

      if (!guidance) return
      const el = root.querySelector(guidance.targetSelector) as HTMLElement | null
      if (!el) {
        setRect(null)
        return
      }

      // Smooth scroll target into view if not already scrolled for this target
      const isFixedDock = guidance.targetSelector.includes('bottom-tab')
      if (!isFixedDock && scrolledTargetRef.current !== guidance.targetSelector) {
        scrolledTargetRef.current = guidance.targetSelector
        el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
      }

      const elRect = el.getBoundingClientRect()
      const nextRect: SpotlightRect = {
        x: Math.max(0, elRect.left - rootRect.left - 4),
        y: Math.max(0, elRect.top - rootRect.top - 4),
        w: elRect.width + 8,
        h: elRect.height + 8,
      }

      setRect((prev) => {
        if (
          prev &&
          Math.abs(prev.x - nextRect.x) < 1 &&
          Math.abs(prev.y - nextRect.y) < 1 &&
          Math.abs(prev.w - nextRect.w) < 1 &&
          Math.abs(prev.h - nextRect.h) < 1
        ) {
          return prev
        }
        return nextRect
      })
    }

    measure()
    const t = window.setTimeout(measure, 120)
    const root = rootRef.current?.parentElement
    if (root) {
      root.addEventListener('scroll', measure, { capture: true, passive: true })
    }
    window.addEventListener('scroll', measure, { capture: true, passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t)
      if (root) {
        root.removeEventListener('scroll', measure, { capture: true })
      }
      window.removeEventListener('scroll', measure, { capture: true })
      window.removeEventListener('resize', measure)
    }
  }, [isTutorialActive, guidance?.targetSelector, activeTab])

  if (!isTutorialActive || !guidance) return null

  const handleSpotlightClick = () => {
    if (!guidance) return
    if (guidance.fallbackNavigate) {
      onNavigateTab(guidance.fallbackNavigate)
      return
    }
    const el = document.querySelector(guidance.targetSelector) as HTMLElement | null
    if (el) el.click()
  }

  // Calculate speech bubble card position & dynamic pointing arrow
  let cardStyle: React.CSSProperties = {}
  let arrowStyle: React.CSSProperties | null = null
  let dynamicArrowDirection: 'up' | 'down' = 'down'

  // Detect whether target is inside an open modal drawer or bottom sheet
  const isInsideModal =
    typeof document !== 'undefined' &&
    (Boolean(document.querySelector('[data-modal="coin-detail"], [role="dialog"], .backdrop-blur-sm')) ||
      Boolean(guidance?.targetSelector.includes('coin-level-up-btn')) ||
      Boolean(guidance?.targetSelector.includes('hero-level-up-btn')))

  if (rect) {
    const isTargetInLowerHalf = rect.y > dims.h * 0.55
    if (isTargetInLowerHalf || isInsideModal) {
      // Anchor the tutorial dialogue bubble to the TOP of the screen (top-16 to top-20)
      // pointing downward toward the highlighted button, never covering active modal stats
      cardStyle = { top: '4.5rem' }
      arrowStyle = { left: rect.x + rect.w / 2, top: Math.max(130, rect.y - 36) }
      dynamicArrowDirection = 'down'
    } else {
      // Place card below target, arrow between target and card pointing UP at target
      cardStyle = { top: rect.y + rect.h + 24 }
      arrowStyle = { left: rect.x + rect.w / 2, top: rect.y + rect.h + 2 }
      dynamicArrowDirection = 'up'
    }
  } else {
    // Fallback top anchoring
    cardStyle = { top: '4.5rem' }
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-[60] overflow-hidden select-none"
    >
      {/* SVG Spotlight Mask Cutout */}
      {rect ? (
        <svg
          className="pointer-events-auto absolute inset-0 h-full w-full"
          width={dims.w}
          height={dims.h}
        >
          <defs>
            <mask id="ftueHomeSpotlightMask">
              <rect width={dims.w} height={dims.h} fill="white" />
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                rx="18"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width={dims.w}
            height={dims.h}
            fill="rgba(0,0,0,0.65)"
            mask="url(#ftueHomeSpotlightMask)"
          />
        </svg>
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-black/60" />
      )}

      {/* Pulsing golden glow outline around spotlighted element */}
      {rect && (
        <div
          className="pointer-events-none absolute z-[65] rounded-2xl border-[3px] border-[#fde047] shadow-[0_0_20px_rgba(250,204,21,0.85)]"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            animation: 'spotlightPulse 1.2s ease-in-out infinite',
          }}
        />
      )}

      {/* Target Hit forwarder button on top of spotlight */}
      {rect && (
        <button
          type="button"
          aria-label={guidance.title}
          onClick={handleSpotlightClick}
          className="pointer-events-auto absolute z-[70] cursor-pointer rounded-2xl"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
          }}
        />
      )}

      {/* Animated Arrow pointing at Target */}
      {arrowStyle && (
        <div
          className="pointer-events-none absolute z-[70] -translate-x-1/2 animate-bounce text-[#fde047] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
          style={arrowStyle}
        >
          {dynamicArrowDirection === 'down' ? (
            <ArrowDown className="h-8 w-8 stroke-[3.5]" />
          ) : (
            <ArrowUp className="h-8 w-8 stroke-[3.5]" />
          )}
        </div>
      )}

      {/* Satoshi Speech Bubble Card */}
      <div
        className="pointer-events-auto absolute inset-x-0 z-[70] flex justify-center px-3"
        style={cardStyle}
      >
        <div
          onClick={handleSpotlightClick}
          className="relative w-[92%] max-w-md cursor-pointer rounded-2xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 sm:p-5 text-[#2C1810] shadow-[0_12px_32px_rgba(0,0,0,0.65)] active:translate-y-0.5"
        >
          <div className="flex items-start gap-3">
            {/* Satoshi Chibi Avatar Plaque */}
            <div className="-mt-9 shrink-0 rounded-full border-[3px] border-[#3E2723] bg-gradient-to-b from-[#fde68a] to-[#fbbf24] p-0.5 shadow-md">
              <div className="h-[58px] w-[58px] overflow-hidden rounded-full">
                <div className="-mt-1 -ml-1">
                  <HeroChibiSvg heroId="rookie_satoshi" size={66} className="!animate-none" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-display text-xs font-black uppercase tracking-[0.16em] text-[#b45309]">
                <Sparkles className="h-3.5 w-3.5 text-[#f59e0b]" />
                <span>{guidance.title}</span>
              </div>
              <p className="mt-1 font-display text-[15px] sm:text-base font-medium leading-relaxed text-[#2C1810]">
                {guidance.text}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#E2D5C1] pt-2.5 text-[11px] font-extrabold uppercase text-[#b45309]">
            <span>Guided Tutorial</span>
            <span className="flex items-center gap-1 rounded-full border border-[#b45309] bg-[#fde047] px-2.5 py-1 font-black text-[#2C1810] shadow-xs text-xs">
              Tap Highlighted Target ▶
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
