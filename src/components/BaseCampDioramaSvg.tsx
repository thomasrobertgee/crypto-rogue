import React from 'react'
import type { BaseLocationId, FurnitureId } from '../config/base.config'
import type { HeroId } from '../config/heroes.config'
import { HeroChibiSvg } from './WorldDioramaArt'

interface BaseCampDioramaSvgProps {
  locationId: BaseLocationId
  furnitureLevels: Record<FurnitureId, number>
  ownedHeroes: Record<string, number>
  equippedHeroId: HeroId
  activeTipHeroId: string | null
  activeQuip: { heroId: string; text: string; rewardText: string } | null
  onTapHero: (heroId: string) => void
}

export const BaseCampDioramaSvg: React.FC<BaseCampDioramaSvgProps> = ({
  locationId,
  furnitureLevels,
  ownedHeroes,
  activeTipHeroId,
  activeQuip,
  onTapHero,
}) => {
  const unlockedHeroIds = Object.keys(ownedHeroes).filter((k) => (ownedHeroes[k] ?? 0) > 0)

  const deskLvl = furnitureLevels?.trading_desk ?? 1
  const fireLvl = furnitureLevels?.campfire_bar ?? 1
  const dishLvl = furnitureLevels?.satellite_dish ?? 1

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* 1. FULL-BLEED 2D CARTOON REAL ESTATE ENVIRONMENT SVG */}
      <svg
        viewBox="0 0 400 720"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          {/* Outskirts Tent Sunset Sky */}
          <linearGradient id="tentSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="38%" stopColor="#fde047" />
            <stop offset="68%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
          {/* Suburban Garage Warm Interior */}
          <linearGradient id="garageBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="55%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d6d3d1" />
          </linearGradient>
          {/* Cyber Loft Sunset Brick */}
          <linearGradient id="loftBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="45%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
          {/* Miami Penthouse Tropical Sunset */}
          <linearGradient id="miamiBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#f472b6" />
            <stop offset="75%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          {/* Lunar Citadel Space & Dome */}
          <linearGradient id="lunarBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="45%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          {/* Lush Ground */}
          <linearGradient id="campGrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="45%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>

        {/* ───────── LOCATION 1: OUTSKIRTS TENT CAMP (DEFAULT) ───────── */}
        {locationId === 'outskirts_tent' && (
          <g>
            <rect width="400" height="720" fill="url(#tentSky)" />
            {/* Warm Golden Sun */}
            <circle cx="290" cy="155" r="52" fill="#fef08a" opacity="0.85" />
            {/* Distant City Skyline Silhouette on the Horizon */}
            <g fill="#7c2d12" opacity="0.32">
              <rect x="25" y="250" width="26" height="90" />
              <rect x="55" y="220" width="32" height="120" />
              <polygon points="71,195 55,220 87,220" />
              <rect x="92" y="240" width="28" height="100" />
              <rect x="125" y="210" width="38" height="130" />
              <rect x="168" y="235" width="25" height="105" />
              <rect x="285" y="230" width="34" height="110" />
              <rect x="325" y="245" width="28" height="95" />
            </g>
            {/* Rolling Hills */}
            <path
              d="M-20 350 Q110 295 230 340 T420 330 L420 720 L-20 720 Z"
              fill="#4ade80"
              stroke="#14532d"
              strokeWidth="3"
            />
            <path
              d="M-20 400 Q180 355 420 395 L420 720 L-20 720 Z"
              fill="url(#campGrass)"
              stroke="#14532d"
              strokeWidth="3"
            />
            {/* Sandy Camp Clearing */}
            <ellipse
              cx="200"
              cy="520"
              rx="168"
              ry="86"
              fill="#fde68a"
              stroke="#ca8a04"
              strokeWidth="3"
            />
            {/* Patched Trader Tent on Left-Back */}
            <g transform="translate(36, 355)">
              <polygon
                points="0,95 62,10 128,95"
                fill="#fb923c"
                stroke="#422006"
                strokeWidth="3.5"
              />
              <polygon
                points="62,10 62,95 128,95"
                fill="#ea580c"
                stroke="#422006"
                strokeWidth="3"
              />
              {/* Tent Door Flap */}
              <polygon points="44,95 62,46 80,95" fill="#451a03" />
              {/* Funny Patch on Tent */}
              <rect
                x="22"
                y="48"
                width="20"
                height="15"
                rx="3"
                fill="#fde047"
                stroke="#422006"
                strokeWidth="2"
                transform="rotate(-12 32 55)"
              />
            </g>
          </g>
        )}

        {/* ───────── LOCATION 2: SUBURBAN GARAGE ───────── */}
        {locationId === 'suburban_garage' && (
          <g>
            <rect width="400" height="720" fill="url(#garageBg)" />
            {/* Garage Door Panels in Back */}
            <rect
              x="35"
              y="165"
              width="330"
              height="195"
              rx="10"
              fill="#fffdf5"
              stroke="#422006"
              strokeWidth="4"
            />
            <line x1="35" y1="215" x2="365" y2="215" stroke="#78350f" strokeWidth="3" />
            <line x1="35" y1="265" x2="365" y2="265" stroke="#78350f" strokeWidth="3" />
            <line x1="35" y1="315" x2="365" y2="315" stroke="#78350f" strokeWidth="3" />
            {/* Concrete Floor */}
            <path
              d="M-10 385 L410 385 L410 720 L-10 720 Z"
              fill="#e7e5e4"
              stroke="#422006"
              strokeWidth="4"
            />
            <ellipse
              cx="200"
              cy="525"
              rx="165"
              ry="82"
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="3"
            />
            {/* Stacked Pizza Boxes */}
            <g transform="translate(55, 420)">
              <rect x="0" y="12" width="44" height="10" fill="#fca5a5" stroke="#422006" strokeWidth="2" />
              <rect x="3" y="4" width="44" height="10" fill="#fef08a" stroke="#422006" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* ───────── LOCATION 3: DOWNTOWN CYBER-LOFT ───────── */}
        {locationId === 'cyber_loft' && (
          <g>
            <rect width="400" height="720" fill="url(#loftBg)" />
            {/* Loft Panorama Window overlooking City */}
            <rect
              x="28"
              y="155"
              width="344"
              height="210"
              rx="14"
              fill="#1e1b4b"
              stroke="#422006"
              strokeWidth="5"
            />
            {/* Glowing Skyline inside window */}
            <rect x="55" y="210" width="38" height="150" fill="#312e81" />
            <rect x="105" y="185" width="48" height="175" fill="#4338ca" />
            <rect x="170" y="220" width="40" height="140" fill="#3730a3" />
            <rect x="235" y="190" width="52" height="170" fill="#4f46e5" />
            <rect x="300" y="215" width="45" height="145" fill="#312e81" />
            {/* Warm Hardwood Loft Floor */}
            <path
              d="M-10 385 L410 385 L410 720 L-10 720 Z"
              fill="#fed7aa"
              stroke="#422006"
              strokeWidth="4"
            />
            <ellipse
              cx="200"
              cy="525"
              rx="168"
              ry="84"
              fill="#fff6e6"
              stroke="#9a3412"
              strokeWidth="3"
            />
          </g>
        )}

        {/* ───────── LOCATION 4: MIAMI BULL PENTHOUSE ───────── */}
        {locationId === 'miami_penthouse' && (
          <g>
            <rect width="400" height="720" fill="url(#miamiBg)" />
            <circle cx="200" cy="215" r="65" fill="#fef08a" opacity="0.9" />
            {/* Infinity Pool Deck */}
            <path
              d="M-10 375 L410 375 L410 720 L-10 720 Z"
              fill="#bae6fd"
              stroke="#0284c7"
              strokeWidth="4"
            />
            <ellipse
              cx="200"
              cy="525"
              rx="172"
              ry="88"
              fill="#fffbeb"
              stroke="#d97706"
              strokeWidth="3.5"
            />
            {/* Golden Bull Statue on Left */}
            <circle cx="65" cy="400" r="24" fill="#facc15" stroke="#422006" strokeWidth="3" />
          </g>
        )}

        {/* ───────── LOCATION 5: LUNAR CITADEL ───────── */}
        {locationId === 'lunar_citadel' && (
          <g>
            <rect width="400" height="720" fill="url(#lunarBg)" />
            {/* Blue Earth in the Lunar Sky */}
            <circle cx="305" cy="175" r="44" fill="#38bdf8" stroke="#bae6fd" strokeWidth="3" />
            <path d="M285 160 Q305 150 320 170 T295 195 Z" fill="#4ade80" />
            {/* Glass Biodome Arch */}
            <path
              d="M 15 410 A 190 230 0 0 1 385 410"
              fill="rgba(224,242,254,0.18)"
              stroke="#7dd3fc"
              strokeWidth="4"
            />
            {/* Lunar Regolith & High-Tech Floor */}
            <path
              d="M-10 390 Q200 365 410 390 L410 720 L-10 720 Z"
              fill="#e2e8f0"
              stroke="#334155"
              strokeWidth="4"
            />
            <ellipse
              cx="200"
              cy="525"
              rx="170"
              ry="86"
              fill="#f8fafc"
              stroke="#0284c7"
              strokeWidth="3.5"
            />
          </g>
        )}

        {/* ───────── UPGRADABLE FURNITURE PROPS IN THE CAMP ───────── */}
        {/* Prop 1: Satellite Dish (Back-Right) */}
        <g transform="translate(308, 355)">
          <line x1="22" y1="55" x2="22" y2="25" stroke="#422006" strokeWidth="4" />
          <ellipse
            cx="22"
            cy="22"
            rx="22"
            ry="13"
            fill={dishLvl >= 4 ? '#38bdf8' : '#e2e8f0'}
            stroke="#422006"
            strokeWidth="3"
            transform="rotate(-20 22 22)"
          />
          <circle cx="28" cy="14" r="4" fill="#ef4444" />
        </g>

        {/* Prop 2: Trading Desk & Monitors (Back-Center) */}
        <g transform="translate(158, 378)">
          <rect
            x="0"
            y="24"
            width="84"
            height="28"
            rx="5"
            fill="#b45309"
            stroke="#422006"
            strokeWidth="3"
          />
          <rect
            x="10"
            y="2"
            width="30"
            height="22"
            rx="3"
            fill="#0f172a"
            stroke="#422006"
            strokeWidth="2.5"
          />
          <polyline
            points="14,18 20,12 26,15 35,6"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
          />
          {deskLvl >= 2 && (
            <>
              <rect
                x="44"
                y="2"
                width="30"
                height="22"
                rx="3"
                fill="#0f172a"
                stroke="#422006"
                strokeWidth="2.5"
              />
              <polyline
                points="48,17 55,9 61,13 70,5"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
            </>
          )}
        </g>

        {/* Prop 3: Center Burning Fiat Campfire / Espresso Bar */}
        <g transform="translate(168, 505)">
          {/* Wooden Logs */}
          <rect
            x="4"
            y="32"
            width="56"
            height="12"
            rx="6"
            fill="#78350f"
            stroke="#422006"
            strokeWidth="3"
            transform="rotate(-14 32 38)"
          />
          <rect
            x="4"
            y="32"
            width="56"
            height="12"
            rx="6"
            fill="#92400e"
            stroke="#422006"
            strokeWidth="3"
            transform="rotate(14 32 38)"
          />
          {/* Animated Flickering Campfire Flames */}
          <path
            d="M14 34 Q32 -8 50 34 Z"
            fill="#f97316"
            stroke="#422006"
            strokeWidth="3"
          />
          <path d="M21 34 Q32 6 43 34 Z" fill="#fde047" />
          {fireLvl >= 3 && (
            <circle cx="32" cy="12" r="4" fill="#fff" opacity="0.85" />
          )}
        </g>
      </svg>

      {/* 2. ALL OWNED COLLECTIBLE TRADER HEROES GROUNDED CLEANLY ON THE CAMP LAWN */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* HERO 1: ROOKIE SATOSHI — Grounded on the left-center camp lawn */}
        {unlockedHeroIds.includes('rookie_satoshi') && (
          <div
            onClick={() => onTapHero('rookie_satoshi')}
            className="pointer-events-auto absolute left-[34%] top-[58%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            {activeTipHeroId === 'rookie_satoshi' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 animate-bounce whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] px-2.5 py-0.5 font-display text-[10px] font-black text-[#2C1810] shadow-md">
                💬 +💎
              </div>
            )}
            <div className="relative animate-float-slow transition-transform group-active:scale-90">
              <HeroChibiSvg heroId="rookie_satoshi" size={92} />
            </div>
          </div>
        )}

        {/* HERO 2: DEGEN APE ROXY — Grounded on the right-center camp lawn */}
        {unlockedHeroIds.includes('degen_ape_roxy') && (
          <div
            onClick={() => onTapHero('degen_ape_roxy')}
            className="pointer-events-auto absolute left-[66%] top-[58%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            {activeTipHeroId === 'degen_ape_roxy' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 animate-bounce whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] px-2.5 py-0.5 font-display text-[10px] font-black text-[#2C1810] shadow-md">
                💬 +💎
              </div>
            )}
            <div className="relative animate-bounce transition-transform group-active:scale-90">
              <HeroChibiSvg heroId="degen_ape_roxy" size={88} />
            </div>
          </div>
        )}

        {/* HERO 3: JORDAN THE WOLF — Grounded on the left lawn clearing */}
        {unlockedHeroIds.includes('jordan_the_wolf') && (
          <div
            onClick={() => onTapHero('jordan_the_wolf')}
            className="pointer-events-auto absolute left-[20%] top-[63%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            {activeTipHeroId === 'jordan_the_wolf' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 animate-bounce whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] px-2.5 py-0.5 font-display text-[10px] font-black text-[#2C1810] shadow-md">
                💬 +💎
              </div>
            )}
            <div className="relative animate-float-slow transition-transform group-active:scale-90">
              <HeroChibiSvg heroId="jordan_the_wolf" size={84} />
            </div>
          </div>
        )}

        {/* HERO 4: QUANTUM AI ORACLE — Grounded on the right lawn clearing */}
        {unlockedHeroIds.includes('quantum_ai_oracle') && (
          <div
            onClick={() => onTapHero('quantum_ai_oracle')}
            className="pointer-events-auto absolute left-[80%] top-[63%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            {activeTipHeroId === 'quantum_ai_oracle' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 animate-bounce whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] px-2.5 py-0.5 font-display text-[10px] font-black text-[#2C1810] shadow-md">
                💬 +💎
              </div>
            )}
            <div className="relative animate-float-slow transition-transform group-active:scale-90">
              <HeroChibiSvg heroId="quantum_ai_oracle" size={84} />
            </div>
          </div>
        )}

        {/* HERO 5: LADY FORTUNA — Grounded near the center-left camp patio */}
        {unlockedHeroIds.includes('lady_fortuna') && (
          <div
            onClick={() => onTapHero('lady_fortuna')}
            className="pointer-events-auto absolute left-[46%] top-[55%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            {activeTipHeroId === 'lady_fortuna' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 animate-bounce whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] px-2.5 py-0.5 font-display text-[10px] font-black text-[#2C1810] shadow-md">
                💬 +💎
              </div>
            )}
            <div className="relative animate-float-slow transition-transform group-active:scale-90">
              <HeroChibiSvg heroId="lady_fortuna" size={86} />
            </div>
          </div>
        )}

        {/* HERO 6: SATOSHI NAKAMOTO — Grounded near the center-right camp patio */}
        {unlockedHeroIds.includes('satoshi_nakamoto') && (
          <div
            onClick={() => onTapHero('satoshi_nakamoto')}
            className="pointer-events-auto absolute left-[56%] top-[54%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            {activeTipHeroId === 'satoshi_nakamoto' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 animate-bounce whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] px-2.5 py-0.5 font-display text-[10px] font-black text-[#2C1810] shadow-md">
                💬 +💎
              </div>
            )}
            <div className="relative animate-float-slow transition-transform group-active:scale-90">
              <HeroChibiSvg heroId="satoshi_nakamoto" size={88} />
            </div>
          </div>
        )}

        {/* Active Speech Quip & Free Loot Drop Banner */}
        {activeQuip && (
          <div className="pointer-events-none absolute left-1/2 top-[43%] z-30 w-[86%] max-w-[320px] -translate-x-1/2 rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-2.5 text-center shadow-2xl animate-bounce">
            <div className="font-display text-xs font-black text-[#16a34a]">
              {activeQuip.rewardText}
            </div>
            <p className="mt-0.5 text-[11px] font-bold text-[#2C1810]">
              &ldquo;{activeQuip.text}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
