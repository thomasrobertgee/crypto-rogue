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
      {/* 1. FULL-BLEED HIGH-TECH "BLOCKCHAIN OUTSKIRTS" & REAL ESTATE ENVIRONMENT SVG */}
      <svg
        viewBox="0 0 400 720"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          {/* High-Tech Blockchain Outskirts Sunset Sky */}
          <linearGradient id="tentSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="24%" stopColor="#2e1065" />
            <stop offset="48%" stopColor="#6b21a8" />
            <stop offset="72%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Soft Dark-Purple Sunset Horizon Glow Separating City from Sky */}
          <radialGradient id="purpleHorizonGlow" cx="50%" cy="46%" r="55%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#4c1d95" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#1e1b4b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          {/* Textured Campsite Dirt Clearing Gradient */}
          <radialGradient id="texturedDirtGrad" cx="50%" cy="48%" r="52%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="48%" stopColor="#5c280b" />
            <stop offset="82%" stopColor="#3e1b08" />
            <stop offset="100%" stopColor="#271004" />
          </radialGradient>

          {/* Dynamic Warm Yellow Ambient Campfire Lighting on Ground */}
          <radialGradient id="campfireAmbientGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.65" />
            <stop offset="38%" stopColor="#f59e0b" stopOpacity="0.38" />
            <stop offset="72%" stopColor="#ea580c" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>

          {/* Warm Campfire Illumination Cast onto Front of Tent */}
          <linearGradient id="tentFireReflection" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#fb923c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9a3412" stopOpacity="0" />
          </linearGradient>

          {/* Clip Paths for Scrolling Neon Billboards */}
          <clipPath id="billboardClipLeft">
            <rect x="44" y="218" width="54" height="14" rx="2" />
          </clipPath>
          <clipPath id="billboardClipRight">
            <rect x="282" y="224" width="60" height="14" rx="2" />
          </clipPath>

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
          {/* Outskirts Emerald Night-Lawn */}
          <linearGradient id="campGrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="45%" stopColor="#166534" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>
        </defs>

        {/* ───────── LOCATION 1: HIGH-TECH "BLOCKCHAIN OUTSKIRTS" TENT CAMP (DEFAULT) ───────── */}
        {locationId === 'outskirts_tent' && (
          <g>
            {/* Sunset Twilight Sky */}
            <rect width="400" height="720" fill="url(#tentSky)" />

            {/* Soft Dark-Purple Sunset Horizon Glow Separating City from Sky */}
            <ellipse cx="200" cy="275" rx="250" ry="110" fill="url(#purpleHorizonGlow)" />
            <rect x="0" y="255" width="400" height="75" fill="#2e1065" opacity="0.42" />

            {/* Setting Cyber-Sun Disc */}
            <circle cx="235" cy="215" r="46" fill="#fde047" opacity="0.78" />
            <circle cx="235" cy="215" r="34" fill="#fffbeb" opacity="0.88" />

            {/* ═══ DYSTOPIAN CYBERPUNK SKYLINE SILHOUETTES ═══ */}
            <g>
              {/* Far Background Towers */}
              <rect x="8" y="215" width="32" height="135" fill="#17153b" />
              <rect x="102" y="198" width="36" height="152" fill="#17153b" />
              <rect x="172" y="210" width="34" height="140" fill="#17153b" />
              <rect x="248" y="202" width="32" height="148" fill="#17153b" />
              <rect x="352" y="212" width="38" height="138" fill="#17153b" />

              {/* Foreground Detailed Cyberpunk Skyscrapers */}
              {/* Building 1: Left Mega-Block */}
              <polygon points="40,350 40,205 52,192 98,192 98,350" fill="#0f172a" stroke="#312e81" strokeWidth="1.2" />
              <line x1="70" y1="192" x2="70" y2="168" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="70" cy="167" r="2" fill="#ef4444" className="animate-pulse" />

              {/* Building 1 Randomized Window Grid (Warm Gold & Cyber Blue) */}
              <g>
                <rect x="48" y="240" width="5" height="7" fill="#fde047" opacity="0.85" />
                <rect x="57" y="240" width="5" height="7" fill="#38bdf8" opacity="0.75" />
                <rect x="75" y="240" width="5" height="7" fill="#fde047" opacity="0.9" />
                <rect x="84" y="240" width="5" height="7" fill="#06b6d4" opacity="0.8" />

                <rect x="48" y="252" width="5" height="7" fill="#06b6d4" opacity="0.7" />
                <rect x="66" y="252" width="5" height="7" fill="#fde047" opacity="0.85" />
                <rect x="75" y="252" width="5" height="7" fill="#38bdf8" opacity="0.9" />

                <rect x="57" y="264" width="5" height="7" fill="#f59e0b" opacity="0.85" />
                <rect x="66" y="264" width="5" height="7" fill="#38bdf8" opacity="0.75" />
                <rect x="84" y="264" width="5" height="7" fill="#fde047" opacity="0.9" />

                <rect x="48" y="276" width="5" height="7" fill="#fde047" opacity="0.8" />
                <rect x="75" y="276" width="5" height="7" fill="#06b6d4" opacity="0.85" />
                <rect x="84" y="276" width="5" height="7" fill="#f59e0b" opacity="0.75" />
              </g>

              {/* Building 2: Central Citadel Spire */}
              <polygon points="132,350 132,182 154,162 176,182 176,350" fill="#090d16" stroke="#4c1d95" strokeWidth="1.2" />
              <line x1="154" y1="162" x2="154" y2="140" stroke="#a855f7" strokeWidth="1.8" />
              {/* Building 2 Window Grid */}
              <g>
                <rect x="139" y="212" width="5" height="6" fill="#38bdf8" opacity="0.85" />
                <rect x="148" y="212" width="5" height="6" fill="#fde047" opacity="0.9" />
                <rect x="162" y="212" width="5" height="6" fill="#38bdf8" opacity="0.75" />
                <rect x="139" y="224" width="5" height="6" fill="#f59e0b" opacity="0.85" />
                <rect x="155" y="224" width="5" height="6" fill="#06b6d4" opacity="0.9" />
                <rect x="162" y="224" width="5" height="6" fill="#fde047" opacity="0.8" />
                <rect x="144" y="238" width="5" height="6" fill="#fde047" opacity="0.85" />
                <rect x="155" y="238" width="5" height="6" fill="#38bdf8" opacity="0.8" />
                <rect x="139" y="252" width="5" height="6" fill="#06b6d4" opacity="0.75" />
                <rect x="162" y="252" width="5" height="6" fill="#f59e0b" opacity="0.9" />
              </g>

              {/* Building 3: Right Exchange Monolith */}
              <polygon points="278,350 278,200 346,200 346,350" fill="#0f172a" stroke="#1e3a8a" strokeWidth="1.2" />
              {/* Building 3 Window Grid */}
              <g>
                <rect x="286" y="246" width="6" height="6" fill="#fde047" opacity="0.9" />
                <rect x="296" y="246" width="6" height="6" fill="#38bdf8" opacity="0.8" />
                <rect x="316" y="246" width="6" height="6" fill="#f59e0b" opacity="0.85" />
                <rect x="328" y="246" width="6" height="6" fill="#06b6d4" opacity="0.9" />

                <rect x="286" y="258" width="6" height="6" fill="#06b6d4" opacity="0.75" />
                <rect x="306" y="258" width="6" height="6" fill="#fde047" opacity="0.9" />
                <rect x="316" y="258" width="6" height="6" fill="#38bdf8" opacity="0.85" />

                <rect x="296" y="270" width="6" height="6" fill="#f59e0b" opacity="0.85" />
                <rect x="306" y="270" width="6" height="6" fill="#06b6d4" opacity="0.8" />
                <rect x="328" y="270" width="6" height="6" fill="#fde047" opacity="0.9" />
              </g>

              {/* ═══ ANIMATED NEON BILLBOARD SIGNS ON SKYLINE ═══ */}
              {/* Billboard 1: "BUY HIGH SELL LOW" (Scrolling Neon Pink/Cyan on Left Tower) */}
              <rect
                x="43"
                y="217"
                width="56"
                height="16"
                rx="2.5"
                fill="#1e1b4b"
                stroke="#ec4899"
                strokeWidth="1.5"
              />
              <g clipPath="url(#billboardClipLeft)">
                <text
                  x="46"
                  y="227.5"
                  fill="#f472b6"
                  fontSize="6.8"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  BUY HIGH SELL LOW • BUY HIGH SELL LOW
                  <animate attributeName="x" values="46;-22;46" dur="6s" repeatCount="indefinite" />
                </text>
              </g>

              {/* Billboard 2: "HODL" (Pulsing Neon Emerald/Gold on Center Spire) */}
              <rect
                x="136"
                y="188"
                width="36"
                height="15"
                rx="2.5"
                fill="#052e16"
                stroke="#22c55e"
                strokeWidth="1.5"
              />
              <text
                x="154"
                y="198.5"
                textAnchor="middle"
                fill="#4ade80"
                fontSize="8.5"
                fontWeight="900"
                fontFamily="monospace"
              >
                HODL
                <animate attributeName="opacity" values="1;0.55;1" dur="1.8s" repeatCount="indefinite" />
              </text>

              {/* Billboard 3: "GAS: 69 GWEI" (Scrolling Cyber Cyan/Amber on Right Monolith) */}
              <rect
                x="281"
                y="223"
                width="62"
                height="16"
                rx="2.5"
                fill="#082f49"
                stroke="#22d3ee"
                strokeWidth="1.5"
              />
              <g clipPath="url(#billboardClipRight)">
                <text
                  x="284"
                  y="233.5"
                  fill="#67e8f9"
                  fontSize="7"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  GAS: 69 GWEI • GAS: 69 GWEI
                  <animate attributeName="x" values="284;230;284" dur="5.5s" repeatCount="indefinite" />
                </text>
              </g>
            </g>

            {/* Rolling Outskirts Hills */}
            <path
              d="M-20 350 Q110 298 230 340 T420 330 L420 720 L-20 720 Z"
              fill="#14532d"
              stroke="#052e16"
              strokeWidth="2.5"
            />
            <path
              d="M-20 400 Q180 355 420 395 L420 720 L-20 720 Z"
              fill="url(#campGrass)"
              stroke="#052e16"
              strokeWidth="3"
            />

            {/* ═══ TEXTURED CAMPSITE DIRT CLEARING RINGED WITH GLOWING PEBBLES & FIBER CABLES ═══ */}
            <g>
              {/* Outer Dark Earth & Fiber Cable Trench */}
              <ellipse
                cx="200"
                cy="522"
                rx="174"
                ry="90"
                fill="#1c0d06"
                stroke="#451a03"
                strokeWidth="3"
              />
              {/* Main Textured Dirt Clearing */}
              <ellipse
                cx="200"
                cy="520"
                rx="166"
                ry="84"
                fill="url(#texturedDirtGrad)"
                stroke="#78350f"
                strokeWidth="2.5"
              />
              {/* Inner Textured Soil Rings & Gravel Contours */}
              <ellipse
                cx="200"
                cy="520"
                rx="132"
                ry="64"
                fill="none"
                stroke="#9a3412"
                strokeWidth="1.5"
                strokeDasharray="18 10 8 12"
                opacity="0.55"
              />
              <ellipse
                cx="200"
                cy="518"
                rx="92"
                ry="44"
                fill="#92400e"
                opacity="0.35"
              />

              {/* Perimeter Fiber-Optic Cables Ringing the Clearing */}
              <path
                d="M 42 505 Q 115 602 225 602 Q 325 602 362 512"
                fill="none"
                stroke="#0f172a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 42 505 Q 115 602 225 602 Q 325 602 362 512"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="8 12"
              >
                <animate attributeName="stroke-dashoffset" from="40" to="0" dur="2.5s" repeatCount="indefinite" />
              </path>

              {/* Glowing Bioluminescent & Cyber Pebbles Ringing the Clearing */}
              <g>
                <ellipse cx="52" cy="492" rx="4.5" ry="2.8" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
                <ellipse cx="78" cy="566" rx="5" ry="3" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
                <ellipse cx="136" cy="592" rx="4" ry="2.5" fill="#22d3ee" stroke="#0f172a" strokeWidth="1" />
                <ellipse cx="268" cy="590" rx="5.5" ry="3" fill="#fde047" stroke="#0f172a" strokeWidth="1" />
                <ellipse cx="332" cy="558" rx="4.5" ry="2.8" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
                <ellipse cx="352" cy="495" rx="4" ry="2.5" fill="#4ade80" stroke="#0f172a" strokeWidth="1" />
              </g>

              {/* Dynamic Warm Yellow Ambient Campfire Lighting Cast onto the Ground */}
              <ellipse
                cx="208"
                cy="512"
                rx="135"
                ry="68"
                fill="url(#campfireAmbientGlow)"
              />
            </g>

            {/* ═══ TRAILING SERVER CABLES (Terminal -> Mining Rig -> Battery Pack) ═══ */}
            <g fill="none" strokeLinecap="round">
              {/* Main Armored Conduit from Trading Terminal (225, 415) to Battery Pack (65, 470) */}
              <path d="M 225 418 C 165 445, 118 442, 68 468" stroke="#0f172a" strokeWidth="5" />
              <path d="M 225 418 C 165 445, 118 442, 68 468" stroke="#22c55e" strokeWidth="1.6" strokeDasharray="6 8">
                <animate attributeName="stroke-dashoffset" from="0" to="28" dur="1.4s" repeatCount="indefinite" />
              </path>
              {/* Secondary High-Voltage Cable from Terminal (250, 418) to Mining Rig (292, 442) */}
              <path d="M 248 418 C 268 432, 280 438, 296 445" stroke="#0f172a" strokeWidth="4.5" />
              <path d="M 248 418 C 268 432, 280 438, 296 445" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 7">
                <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" />
              </path>
              {/* Tertiary Cable from Battery Pack to Campfire Generator Sensor */}
              <path d="M 72 476 C 110 502, 145 508, 182 508" stroke="#1e293b" strokeWidth="3.5" />
            </g>

            {/* ═══ SATOSHI'S PATCHED TRADER TENT WITH WARM CAMPFIRE ILLUMINATION ═══ */}
            <g transform="translate(68, 342)">
              {/* Tent Ground Shadow */}
              <ellipse cx="64" cy="96" rx="68" ry="12" fill="rgba(0,0,0,0.45)" />
              {/* Left Shaded Tent Slope */}
              <polygon
                points="0,95 62,10 128,95"
                fill="#c2410c"
                stroke="#271004"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              {/* Right Tent Slope Facing the Campfire */}
              <polygon
                points="62,10 62,95 128,95"
                fill="#ea580c"
                stroke="#271004"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Dynamic Warm Campfire Glow Cast onto Front of Tent */}
              <polygon
                points="62,10 62,95 128,95"
                fill="url(#tentFireReflection)"
                className="animate-pulse"
              />
              {/* Tent Door Flap */}
              <polygon points="44,95 62,46 80,95" fill="#1c0d06" stroke="#271004" strokeWidth="2" />
              {/* Stitched Crypto Patch on Tent */}
              <rect
                x="22"
                y="48"
                width="20"
                height="15"
                rx="3"
                fill="#fde047"
                stroke="#271004"
                strokeWidth="2"
                transform="rotate(-12 32 55)"
              />
            </g>

            {/* ═══ STACKED MINING BATTERY CRATES WITH BLINKING LEDS ═══ */}
            <g transform="translate(36, 442)">
              <ellipse cx="22" cy="44" rx="26" ry="7" fill="rgba(0,0,0,0.45)" />
              {/* Base Battery Crate */}
              <rect
                x="0"
                y="20"
                width="42"
                height="24"
                rx="3"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="2"
              />
              <line x1="6" y1="26" x2="36" y2="26" stroke="#475569" strokeWidth="2" />
              <line x1="6" y1="31" x2="36" y2="31" stroke="#475569" strokeWidth="2" />
              {/* Alternating Blinking Green & Amber Status LEDs */}
              <circle cx="9" cy="38" r="2.4" fill="#22c55e">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.0s" repeatCount="indefinite" />
              </circle>
              <circle cx="18" cy="38" r="2.4" fill="#f59e0b">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1.0s" repeatCount="indefinite" />
              </circle>
              <circle cx="27" cy="38" r="2.4" fill="#22c55e">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.0s" repeatCount="indefinite" />
              </circle>
              <circle cx="35" cy="38" r="2.4" fill="#f59e0b">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1.0s" repeatCount="indefinite" />
              </circle>
              {/* Top Battery Crate */}
              <rect
                x="5"
                y="3"
                width="34"
                height="18"
                rx="3"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="2"
              />
              <rect x="9" y="8" width="16" height="6" rx="1" fill="#020617" />
              <line x1="11" y1="11" x2="23" y2="11" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2,1" />
              <rect x="11" y="0" width="4" height="3.5" rx="1" fill="#f59e0b" />
              <rect x="25" y="0" width="4" height="3.5" rx="1" fill="#ef4444" />
            </g>

            {/* ═══ UPGRADED ASIC MINING RIG WITH SPINNING SVG FAN BLADES & BLINKING LEDS ═══ */}
            <g transform="translate(284, 422)">
              {/* Ground Shadow */}
              <ellipse cx="36" cy="46" rx="40" ry="8" fill="rgba(0,0,0,0.5)" />
              {/* Heavy Metallic Server Rack Frame */}
              <rect
                x="0"
                y="4"
                width="72"
                height="40"
                rx="5"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="2.5"
              />
              {/* Top Specular Bevel */}
              <line x1="5" y1="7" x2="67" y2="7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

              {/* 3 Spinning SVG Fan Units */}
              {[15, 36, 57].map((cx, i) => (
                <g key={i} transform={`translate(${cx}, 22)`}>
                  <circle cx="0" cy="0" r="9.5" fill="#020617" stroke="#475569" strokeWidth="1.5" />
                  <g className="animate-fan-spin">
                    <line x1="-7" y1="0" x2="7" y2="0" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="0" y1="-7" x2="0" y2="7" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="-5" y1="-5" x2="5" y2="5" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="5" y1="-5" x2="-5" y2="5" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" />
                  </g>
                  <circle cx="0" cy="0" r="2.5" fill="#cbd5e1" />
                </g>
              ))}

              {/* Alternating Blinking Green/Amber LED Strip */}
              <circle cx="10" cy="38" r="2" fill="#22c55e" className="animate-pulse" />
              <circle cx="18" cy="38" r="2" fill="#f59e0b">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="26" cy="38" r="2" fill="#22c55e">
                <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="34" cy="38" r="2" fill="#f59e0b" className="animate-pulse" />
              <circle cx="42" cy="38" r="2" fill="#22c55e">
                <animate attributeName="opacity" values="1;0.25;1" dur="0.9s" repeatCount="indefinite" />
              </circle>
              <text x="50" y="40" fill="#38bdf8" fontSize="5.5" fontWeight="900" fontFamily="monospace">
                ASIC
              </text>
            </g>

            {/* ═══ CAMP SHIBA COMPANION WITH GENTLE WAG & BREATHING ═══ */}
            <g transform="translate(136, 434)" className="animate-idle-breathe">
              <ellipse cx="14" cy="18" rx="16" ry="5" fill="rgba(0,0,0,0.4)" />
              {/* Wagging Curled Tail */}
              <g className="animate-tail-wag">
                <path d="M26 10 Q33 3 28 0 Q23 0 25 7" fill="#f59e0b" stroke="#271004" strokeWidth="2" />
              </g>
              {/* 2-Tone Golden Fur Body */}
              <ellipse cx="14" cy="11" rx="14" ry="9.5" fill="#f59e0b" stroke="#271004" strokeWidth="2" />
              <ellipse cx="14" cy="13" rx="9" ry="5.5" fill="#fef3c7" />
              {/* Bobbing Head */}
              <g className="animate-head-bob">
                <circle cx="6" cy="8" r="7.5" fill="#f59e0b" stroke="#271004" strokeWidth="2" />
                <ellipse cx="3.5" cy="10" rx="4.5" ry="3.5" fill="#fef3c7" />
                <circle cx="1.8" cy="9.5" r="1.3" fill="#0f172a" />
                <path d="M5 7 Q7 5 9 7" fill="none" stroke="#271004" strokeWidth="1.5" strokeLinecap="round" />
                <polygon points="4,3 7,0 9,4" fill="#d97706" stroke="#271004" strokeWidth="1.5" />
                <polygon points="8,3 11,0 12,4" fill="#d97706" stroke="#271004" strokeWidth="1.5" />
              </g>
            </g>
          </g>
        )}

        {/* ───────── LOCATION 2: SUBURBAN GARAGE ───────── */}
        {locationId === 'suburban_garage' && (
          <g>
            <rect width="400" height="720" fill="url(#garageBg)" />
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
          </g>
        )}

        {/* ───────── LOCATION 3: DOWNTOWN CYBER-LOFT ───────── */}
        {locationId === 'cyber_loft' && (
          <g>
            <rect width="400" height="720" fill="url(#loftBg)" />
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
            <rect x="55" y="210" width="38" height="150" fill="#312e81" />
            <rect x="105" y="185" width="48" height="175" fill="#4338ca" />
            <rect x="170" y="220" width="40" height="140" fill="#3730a3" />
            <rect x="235" y="190" width="52" height="170" fill="#4f46e5" />
            <rect x="300" y="215" width="45" height="145" fill="#312e81" />
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
          </g>
        )}

        {/* ───────── LOCATION 5: LUNAR CITADEL ───────── */}
        {locationId === 'lunar_citadel' && (
          <g>
            <rect width="400" height="720" fill="url(#lunarBg)" />
            <circle cx="305" cy="175" r="44" fill="#38bdf8" stroke="#bae6fd" strokeWidth="3" />
            <path d="M285 160 Q305 150 320 170 T295 195 Z" fill="#4ade80" />
            <path
              d="M 15 410 A 190 230 0 0 1 385 410"
              fill="rgba(224,242,254,0.18)"
              stroke="#7dd3fc"
              strokeWidth="4"
            />
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
        <g transform="translate(314, 352)">
          <line x1="22" y1="55" x2="22" y2="25" stroke="#1e293b" strokeWidth="4" />
          <ellipse
            cx="22"
            cy="22"
            rx="22"
            ry="13"
            fill={dishLvl >= 4 ? '#38bdf8' : '#cbd5e1'}
            stroke="#0f172a"
            strokeWidth="3"
            transform="rotate(-20 22 22)"
          />
          <circle cx="28" cy="14" r="3.5" fill="#ef4444" className="animate-pulse" />
        </g>

        {/* Prop 2: Trading Desk & Terminal Monitors (Back-Center) */}
        <g transform={locationId === 'outskirts_tent' ? 'translate(195, 370)' : 'translate(158, 378)'}>
          <ellipse cx="42" cy="52" rx="46" ry="8" fill="rgba(0,0,0,0.45)" />
          <rect
            x="0"
            y="24"
            width="84"
            height="28"
            rx="5"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="3"
          />
          <line x1="4" y1="27" x2="80" y2="27" stroke="#64748b" strokeWidth="1.5" />
          <rect
            x="10"
            y="2"
            width="30"
            height="22"
            rx="3"
            fill="#020617"
            stroke="#38bdf8"
            strokeWidth="2"
          />
          <polyline
            points="14,18 20,12 26,15 35,6"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
          />
          <circle cx="35" cy="6" r="1.8" fill="#4ade80" className="animate-pulse" />
          {deskLvl >= 2 && (
            <>
              <rect
                x="44"
                y="2"
                width="30"
                height="22"
                rx="3"
                fill="#020617"
                stroke="#38bdf8"
                strokeWidth="2"
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

        {/* Prop 3: Center Burning Fiat Campfire with Dynamic Flickering Flame Paths */}
        <g transform={locationId === 'outskirts_tent' ? 'translate(178, 475)' : 'translate(168, 505)'}>
          {/* Stone Firepit Ring */}
          <ellipse cx="32" cy="40" rx="36" ry="11" fill="rgba(0,0,0,0.5)" />
          {/* Crossed Charred Logs */}
          <rect
            x="4"
            y="32"
            width="56"
            height="12"
            rx="6"
            fill="#78350f"
            stroke="#271004"
            strokeWidth="2.8"
            transform="rotate(-14 32 38)"
          />
          <rect
            x="4"
            y="32"
            width="56"
            height="12"
            rx="6"
            fill="#92400e"
            stroke="#271004"
            strokeWidth="2.8"
            transform="rotate(14 32 38)"
          />
          {/* Firepit Stones */}
          <circle cx="8" cy="40" r="5.5" fill="#57534e" stroke="#1c1917" strokeWidth="2" />
          <circle cx="20" cy="43" r="6" fill="#78716c" stroke="#1c1917" strokeWidth="2" />
          <circle cx="44" cy="43" r="6" fill="#57534e" stroke="#1c1917" strokeWidth="2" />
          <circle cx="56" cy="40" r="5.5" fill="#78716c" stroke="#1c1917" strokeWidth="2" />

          {/* Multi-Layered Animated Flickering Flame Paths */}
          <g className="animate-campfire" style={{ transformOrigin: '32px 36px' }}>
            <path
              d="M12 36 C10 14, 24 2, 32 -12 C40 2, 54 14, 52 36 Z"
              fill="#ea580c"
              stroke="#7c2d12"
              strokeWidth="2.2"
            />
            <path
              d="M17 36 C16 18, 25 8, 32 -3 C39 8, 48 18, 47 36 Z"
              fill="#f97316"
            />
            <path
              d="M22 36 C22 22, 27 14, 32 6 C37 14, 42 22, 42 36 Z"
              fill="#fde047"
            />
            <path
              d="M27 36 Q32 18 37 36 Z"
              fill="#fef9c3"
            />
            {fireLvl >= 3 && (
              <circle cx="32" cy="14" r="4" fill="#ffffff" opacity="0.85" />
            )}
          </g>

          {/* Rising Ember Sparks */}
          <circle cx="24" cy="-4" r="2.2" fill="#fde047" opacity="0.9">
            <animate attributeName="cy" values="-2;-20;-2" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.95;0.15;0.95" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="38" cy="-8" r="1.8" fill="#fb923c" opacity="0.85">
            <animate attributeName="cy" values="-6;-26;-6" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.85;0.1;0.85" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="31" cy="-14" r="2" fill="#facc15" opacity="0.8">
            <animate attributeName="cy" values="-10;-32;-10" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.85;0;0.85" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>

      {/* 2. ALL OWNED COLLECTIBLE TRADER HEROES GROUNDED CLEANLY ON THE CAMP LAWN */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* HERO 1: ROOKIE SATOSHI — Centered in the camp lawn clearing */}
        {unlockedHeroIds.includes('rookie_satoshi') && (
          <div
            onClick={() => onTapHero('rookie_satoshi')}
            className="pointer-events-auto absolute left-[48%] top-[53%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            {activeTipHeroId === 'rookie_satoshi' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 animate-bounce whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] px-2.5 py-0.5 font-display text-[10px] font-black text-[#2C1810] shadow-md">
                💬 +💎
              </div>
            )}
            <div className="relative transition-transform group-active:scale-90">
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
            <div className="relative transition-transform group-active:scale-90">
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
            <div className="relative transition-transform group-active:scale-90">
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
            <div className="relative transition-transform group-active:scale-90">
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
            <div className="relative transition-transform group-active:scale-90">
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
            <div className="relative transition-transform group-active:scale-90">
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
