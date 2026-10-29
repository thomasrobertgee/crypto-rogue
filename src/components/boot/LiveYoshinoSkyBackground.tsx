import React, { useId } from 'react'

/**
 * LiveYoshinoSkyBackground
 * 
 * An animated background depicting a complete Day & Night cycle:
 * 1. The Sun curves smoothly through the sky from dawn (bottom-left) to midday zenith, descending to dusk (bottom-right).
 * 2. As dusk settles, stars twinkle and the Moon rises (bottom-left), curving through the night sky to midnight zenith, then sets (bottom-right) as dawn returns.
 * 3. A graceful Yoshino Sakura tree (Prunus × yedoensis) with gnarled textured trunk and lush white blossom clouds sways gently in the breeze on the left hillside, beautifully framing the screen.
 * 4. A continuous cascade of pure white sakura petals blows across the screen in the wind with 3D fluttering.
 * 5. Smooth ambient lighting transitions for the rolling hills and sky between sunny golden daylight and cool silver moonlight.
 */

// Full Day & Night loop duration in seconds
const CYCLE_SECONDS = 26

// Staggered wind-blown petals
const PETAL_COUNT = 36

interface PetalSpec {
  id: number
  startX: number
  startY: number
  size: number
  duration: number
  delay: number
  variant: number
  opacity: number
}

function generatePetals(count: number): PetalSpec[] {
  const petals: PetalSpec[] = []
  for (let i = 0; i < count; i++) {
    const seed = (i * 9301 + 49297) % 233280
    const rnd1 = seed / 233280
    const rnd2 = ((seed * 9301 + 49297) % 233280) / 233280
    const rnd3 = ((seed * 1337 + 12345) % 233280) / 233280
    const rnd4 = ((seed * 49297 + 9301) % 233280) / 233280

    petals.push({
      id: i,
      startX: -15 + rnd1 * 30, // Start around the tree on the left
      startY: 5 + rnd2 * 70, // Dispersed throughout the upper to lower sky
      size: 6 + Math.floor(rnd3 * 9), // 6px to 14px
      duration: 6.5 + rnd4 * 6, // 6.5s to 12.5s wind sweep
      delay: -(rnd1 * 14), // Staggered delays so screen is always filled
      variant: i % 4,
      opacity: 0.7 + rnd2 * 0.3,
    })
  }
  return petals
}

const PETALS_DATA = generatePetals(PETAL_COUNT)

// Background stars
const STARS_DATA = Array.from({ length: 42 }).map((_, i) => {
  const seed = (i * 7919 + 104729) % 233280
  const x = (seed % 1000) / 10
  const y = (((seed * 31) % 1000) / 10) * 0.52 // Top 52% of sky
  const size = 1 + (i % 3)
  const isSparkle = i % 4 === 0
  const animDelay = -(i * 0.35)
  return { id: i, x, y, size, isSparkle, animDelay }
})

export const LiveYoshinoSkyBackground: React.FC = () => {
  const uniqueId = useId().replace(/:/g, '')

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* ── CSS Keyframes & Day/Night Celestial Engine ── */}
      <style>{`
        /* 1. DAY-NIGHT CELESTIAL CYCLE: SUN ARC */
        @keyframes sunOrbit_${uniqueId} {
          /* Dawn: Sun rises on bottom-left */
          0% {
            left: 4%;
            top: 55%;
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0;
          }
          4% {
            left: 10%;
            top: 40%;
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.95;
          }
          /* Morning Ascent */
          14% {
            left: 24%;
            top: 22%;
            transform: translate(-50%, -50%) scale(1.02);
            opacity: 1;
          }
          /* High Noon Peak Zenith */
          25% {
            left: 50%;
            top: 10%;
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
          /* Afternoon Descent */
          36% {
            left: 76%;
            top: 22%;
            transform: translate(-50%, -50%) scale(1.02);
            opacity: 1;
          }
          /* Dusk / Sunset */
          46% {
            left: 90%;
            top: 40%;
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.95;
          }
          /* Sun dips below horizon on right */
          50% {
            left: 96%;
            top: 55%;
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0;
          }
          /* Night phase: Sun remains hidden below horizon */
          50.1%, 100% {
            left: 4%;
            top: 55%;
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0;
          }
        }

        /* 2. DAY-NIGHT CELESTIAL CYCLE: MOON ARC */
        @keyframes moonOrbit_${uniqueId} {
          /* Day phase: Moon remains hidden */
          0%, 50% {
            left: 4%;
            top: 55%;
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0;
          }
          /* Dusk / Nightfall: Moon rises on bottom-left */
          50.1% {
            left: 4%;
            top: 55%;
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0;
          }
          54% {
            left: 10%;
            top: 40%;
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.95;
          }
          /* Night Ascent */
          64% {
            left: 24%;
            top: 22%;
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          /* Midnight Peak Zenith */
          75% {
            left: 50%;
            top: 10%;
            transform: translate(-50%, -50%) scale(1.06);
            opacity: 1;
          }
          /* Late Night Descent */
          86% {
            left: 76%;
            top: 22%;
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          /* Pre-dawn Descent */
          96% {
            left: 90%;
            top: 40%;
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.95;
          }
          /* Moon dips below horizon on right */
          100% {
            left: 96%;
            top: 55%;
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0;
          }
        }

        /* 3. SKY GRADIENT CROSS-FADES */
        @keyframes skyDawn_${uniqueId} {
          0%, 100% { opacity: 0.95; }
          10% { opacity: 0.25; }
          20%, 38% { opacity: 0; }
          45% { opacity: 0.55; }
          50% { opacity: 0.9; }
          56% { opacity: 0.2; }
          62%, 92% { opacity: 0; }
          97% { opacity: 0.65; }
        }

        @keyframes skyNoon_${uniqueId} {
          0% { opacity: 0; }
          8% { opacity: 0.75; }
          16%, 35% { opacity: 1; }
          43% { opacity: 0.35; }
          50%, 100% { opacity: 0; }
        }

        @keyframes skyDusk_${uniqueId} {
          0%, 36% { opacity: 0; }
          42% { opacity: 0.75; }
          48% { opacity: 1; }
          54% { opacity: 0.6; }
          60%, 100% { opacity: 0; }
        }

        @keyframes skyNight_${uniqueId} {
          0%, 46% { opacity: 0; }
          52% { opacity: 0.85; }
          60%, 90% { opacity: 1; }
          96% { opacity: 0.35; }
          100% { opacity: 0; }
        }

        @keyframes starsTwinkle_${uniqueId} {
          0%, 48% { opacity: 0; }
          53% { opacity: 0.65; }
          60%, 88% { opacity: 1; }
          95% { opacity: 0.25; }
          100% { opacity: 0; }
        }

        /* 4. YOSHINO SAKURA BREEZE SWAY */
        @keyframes sakuraTreeSway_${uniqueId} {
          0%, 100% {
            transform: rotate(0deg) skewX(0deg);
          }
          30% {
            transform: rotate(1.4deg) skewX(0.7deg);
          }
          60% {
            transform: rotate(-0.7deg) skewX(-0.4deg);
          }
          85% {
            transform: rotate(1.8deg) skewX(1deg);
          }
        }

        /* 5. BLOWING SAKURA PETAL WIND DYNAMICS (SWEEPING ACROSS SCREEN) */
        @keyframes petalDriftA_${uniqueId} {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) rotateY(0deg) scale(0.65);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          40% {
            transform: translate3d(180px, 40px, 0) rotate(180deg) rotateY(180deg) scale(1);
          }
          75% {
            transform: translate3d(360px, 15px, 0) rotate(370deg) rotateY(360deg) scale(0.95);
            opacity: 0.95;
          }
          100% {
            transform: translate3d(530px, 85px, 0) rotate(540deg) rotateY(540deg) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes petalDriftB_${uniqueId} {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) rotateX(0deg) scale(0.6);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          35% {
            transform: translate3d(150px, -30px, 0) rotate(130deg) rotateX(150deg) scale(0.9);
          }
          70% {
            transform: translate3d(330px, 30px, 0) rotate(300deg) rotateX(320deg) scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: translate3d(510px, 10px, 0) rotate(460deg) rotateX(460deg) scale(0.75);
            opacity: 0;
          }
        }

        @keyframes petalDriftC_${uniqueId} {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.75);
            opacity: 0;
          }
          8% {
            opacity: 0.95;
          }
          50% {
            transform: translate3d(210px, 55px, 0) rotate(230deg) scale(1.1);
          }
          80% {
            transform: translate3d(380px, 75px, 0) rotate(420deg) scale(0.95);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(550px, 130px, 0) rotate(600deg) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes petalDriftD_${uniqueId} {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.65);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          35% {
            transform: translate3d(130px, 18px, 0) rotate(110deg) scale(0.85);
          }
          65% {
            transform: translate3d(280px, -20px, 0) rotate(270deg) scale(1.05);
          }
          100% {
            transform: translate3d(480px, 55px, 0) rotate(470deg) scale(0.8);
            opacity: 0;
          }
        }

        /* 6. CORONA PULSES */
        @keyframes sunPulse_${uniqueId} {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        @keyframes moonGlow_${uniqueId} {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 16px rgba(224, 242, 254, 0.75)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 0 26px rgba(224, 242, 254, 0.95)); }
        }

        /* 7. AMBIENT NIGHT TINT ON HILLS */
        @keyframes hillNightFilter_${uniqueId} {
          0%, 46% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(0.85) saturate(1.2) hue-rotate(-15deg); }
          60%, 90% { filter: brightness(0.48) saturate(0.75) hue-rotate(-30deg); }
          96% { filter: brightness(0.75) saturate(1.1) hue-rotate(-10deg); }
          100% { filter: brightness(1) saturate(1); }
        }
      `}</style>

      {/* ── Layer 1: Dynamic Sky Gradients ── */}
      {/* Dawn / Sunrise Sky */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#312E81] via-[#FB7185] via-40% to-[#FDE047]"
        style={{ animation: `skyDawn_${uniqueId} ${CYCLE_SECONDS}s ease-in-out infinite` }}
      />
      {/* Bright Sunny Day Sky */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0284C7] via-[#38BDF8] via-45% to-[#BAE6FD]"
        style={{ animation: `skyNoon_${uniqueId} ${CYCLE_SECONDS}s ease-in-out infinite` }}
      />
      {/* Sunset / Dusk Sky */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#1E1B4B] via-[#E11D48] via-35% via-[#F97316] to-[#FBBF24]"
        style={{ animation: `skyDusk_${uniqueId} ${CYCLE_SECONDS}s ease-in-out infinite` }}
      />
      {/* Deep Midnight Starry Sky */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0B1329] via-50% to-[#1E1B4B]"
        style={{ animation: `skyNight_${uniqueId} ${CYCLE_SECONDS}s ease-in-out infinite` }}
      />

      {/* ── Layer 2: Starfield (Twinkling during Night) ── */}
      <div
        className="absolute inset-0"
        style={{ animation: `starsTwinkle_${uniqueId} ${CYCLE_SECONDS}s ease-in-out infinite` }}
      >
        {STARS_DATA.map((st) => (
          <div
            key={st.id}
            className="absolute rounded-full bg-white transition-opacity"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: `${st.size}px`,
              height: `${st.size}px`,
              boxShadow: st.isSparkle
                ? '0 0 6px 2px rgba(255, 255, 255, 0.95), 0 0 12px 4px rgba(186, 230, 253, 0.65)'
                : '0 0 3px 1px rgba(255, 255, 255, 0.6)',
              opacity: st.isSparkle ? 0.95 : 0.75,
              animation: `sunPulse_${uniqueId} ${2 + (st.id % 3)}s ease-in-out infinite`,
              animationDelay: `${st.animDelay}s`,
            }}
          />
        ))}

        {/* Delicate Constellation Sparkle Accents */}
        <div
          className="absolute text-white font-black text-xs select-none"
          style={{
            left: '82%',
            top: '16%',
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.95))',
          }}
        >
          ✦
        </div>
        <div
          className="absolute text-cyan-200 font-black text-[10px] select-none"
          style={{
            left: '26%',
            top: '12%',
            filter: 'drop-shadow(0 0 6px rgba(186,230,253,0.95))',
          }}
        >
          ✦
        </div>
      </div>

      {/* ── Layer 3: The Sun (Curving Dawn to Dusk) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '124px',
          height: '124px',
          animation: `sunOrbit_${uniqueId} ${CYCLE_SECONDS}s linear infinite`,
        }}
      >
        {/* Outer Radiant Sun Corona */}
        <div
          className="absolute inset-0 -m-6 rounded-full bg-gradient-to-r from-amber-300/40 via-yellow-200/50 to-orange-400/40 blur-xl"
          style={{ animation: `sunPulse_${uniqueId} 4s ease-in-out infinite` }}
        />
        {/* Golden Sun Core Orb */}
        <div className="relative h-full w-full rounded-full bg-gradient-to-b from-white via-[#FEF08A] to-[#F59E0B] shadow-[0_0_55px_rgba(253,224,71,0.9),0_0_110px_rgba(245,158,11,0.6)]">
          {/* Inner Light Flare Highlight */}
          <div className="absolute top-2.5 left-2.5 h-9 w-9 rounded-full bg-white/85 blur-[2px]" />
        </div>
      </div>

      {/* ── Layer 4: The Moon (Curving Dusk to Dawn) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '106px',
          height: '106px',
          animation: `moonOrbit_${uniqueId} ${CYCLE_SECONDS}s linear infinite`,
        }}
      >
        {/* Outer Lunar Aura Bloom */}
        <div
          className="absolute inset-0 -m-5 rounded-full bg-cyan-100/35 blur-2xl"
          style={{ animation: `moonGlow_${uniqueId} 5s ease-in-out infinite` }}
        />
        {/* Silver Moon Orb with Delicate Crater Silhouettes */}
        <div className="relative h-full w-full rounded-full bg-gradient-to-b from-white via-[#F1F5F9] to-[#CBD5E1] shadow-[0_0_40px_rgba(224,242,254,0.9),0_0_80px_rgba(186,230,253,0.5)] overflow-hidden">
          {/* Soft Lunar Maria Silhouettes */}
          <div className="absolute top-5 left-4 h-7 w-7 rounded-full bg-[#94A3B8]/25 blur-[1px]" />
          <div className="absolute top-11 left-10 h-8 w-8 rounded-full bg-[#94A3B8]/20 blur-[1px]" />
          <div className="absolute top-6 left-14 h-5 w-5 rounded-full bg-[#94A3B8]/25 blur-[1px]" />
          <div className="absolute bottom-4 left-6 h-6 w-8 rounded-full bg-[#94A3B8]/15 blur-[1px]" />
          {/* Subtle Crescent Rim Light */}
          <div className="absolute inset-0 rounded-full border-2 border-white/60" />
        </div>
      </div>

      {/* ── Layer 5: Distant Mountains & Rolling Hills ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ animation: `hillNightFilter_${uniqueId} ${CYCLE_SECONDS}s ease-in-out infinite` }}
      >
        {/* Rolling Hills SVG with natural contours */}
        <svg
          viewBox="0 0 800 320"
          className="absolute bottom-20 w-[140%] -left-[20%] h-64 opacity-90"
          preserveAspectRatio="none"
        >
          {/* Far Gentle Mountain Ridge */}
          <path
            d="M0 320 L0 180 Q120 120 220 160 T460 140 T680 170 T800 130 L800 320 Z"
            fill="#86EFAC"
            opacity="0.65"
          />
          {/* Mid Rolling Green Hills */}
          <path
            d="M0 320 L0 200 C150 140 280 180 420 150 C580 120 680 190 800 160 L800 320 Z"
            fill="#4ADE80"
            opacity="0.85"
          />
          {/* Front Grassy Meadow Mound */}
          <path
            d="M0 320 L0 230 C180 160 320 230 520 180 C680 140 760 210 800 190 L800 320 Z"
            fill="#22C55E"
          />
        </svg>

        {/* Foreground Meadow Strip with natural rolling crest */}
        <svg
          viewBox="0 0 800 120"
          className="absolute bottom-0 inset-x-0 w-full h-28"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120 L0 35 C180 15 320 45 500 25 C660 8 740 30 800 20 L800 120 Z"
            fill="#16A34A"
          />
          <path
            d="M0 120 L0 50 C150 30 300 55 480 38 C640 22 720 45 800 35 L800 120 Z"
            fill="#14532D"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* ── Layer 6: Graceful Yoshino Sakura Tree (Prunus × yedoensis) ── */}
      {/* Situated gracefully on the far-left hill edge to frame the UI */}
      <div
        className="absolute -bottom-6 -left-14 w-[300px] h-[600px] pointer-events-none origin-bottom-left"
        style={{
          animation: `sakuraTreeSway_${uniqueId} 7.5s ease-in-out infinite`,
        }}
      >
        <svg
          viewBox="0 0 280 500"
          className="w-full h-full overflow-visible drop-shadow-[0_8px_16px_rgba(44,24,16,0.3)]"
        >
          <defs>
            {/* Trunk Wood Grain Gradient */}
            <linearGradient id={`sakuraTrunk_${uniqueId}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2A160D" />
              <stop offset="40%" stopColor="#4A2B18" />
              <stop offset="75%" stopColor="#5D3A24" />
              <stop offset="100%" stopColor="#20110A" />
            </linearGradient>

            {/* Blossom Cloud Gradients: Pristine White with Whisper-Pink Accents */}
            <radialGradient id={`blossomDeep_${uniqueId}`} cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#FCE7F3" />
              <stop offset="85%" stopColor="#FBCFE8" />
              <stop offset="100%" stopColor="#F472B6" />
            </radialGradient>

            <radialGradient id={`blossomPure_${uniqueId}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#FFF1F2" />
              <stop offset="90%" stopColor="#FCE7F3" />
              <stop offset="100%" stopColor="#FDA4AF" />
            </radialGradient>

            <radialGradient id={`blossomHighlight_${uniqueId}`} cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FFE4E6" />
            </radialGradient>
          </defs>

          {/* ── Tree Trunk & Natural Gnarled Limbs (Framing from Left) ── */}
          {/* Main Trunk anchored to bottom-left */}
          <path
            d="M30 500 C34 440 26 370 42 300 C52 250 68 210 78 170 C88 135 96 100 102 70 C106 85 112 105 120 130 C130 165 145 200 152 230 C138 270 125 320 115 380 C108 420 112 460 118 500 Z"
            fill={`url(#sakuraTrunk_${uniqueId})`}
            stroke="#1B0F08"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Root Flares */}
          <path d="M15 500 C24 485 28 475 35 465 L42 500 Z" fill="#1B0F08" />
          <path d="M106 500 C112 480 118 472 132 500 Z" fill="#1B0F08" />

          {/* Upper Reach Branch (Bowing toward Center Sky) */}
          <path
            d="M98 120 C118 95 145 78 175 65 C198 56 220 54 242 48 C225 60 205 68 185 78 C160 90 138 105 122 125 Z"
            fill={`url(#sakuraTrunk_${uniqueId})`}
            stroke="#1B0F08"
            strokeWidth="2.5"
          />

          {/* Left Arching Limb */}
          <path
            d="M52 280 C36 245 22 210 16 175 C12 155 18 135 25 118 C28 132 35 150 45 168 C55 185 70 208 80 225 Z"
            fill={`url(#sakuraTrunk_${uniqueId})`}
            stroke="#1B0F08"
            strokeWidth="2.5"
          />

          {/* Twig Tendrils */}
          <path d="M175 65 C188 45 204 32 218 24" stroke="#2A160D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M102 70 C98 50 88 35 75 22" stroke="#2A160D" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M35 150 C26 128 20 108 12 92" stroke="#2A160D" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* ── Billowing Yoshino Sakura Blossom Clouds (White & Whisper-Pink) ── */}
          {/* Back Cluster Layer */}
          <g opacity="0.95">
            <ellipse cx="50" cy="150" rx="36" ry="28" fill={`url(#blossomDeep_${uniqueId})`} />
            <ellipse cx="98" cy="105" rx="46" ry="34" fill={`url(#blossomDeep_${uniqueId})`} />
            <ellipse cx="155" cy="75" rx="52" ry="36" fill={`url(#blossomDeep_${uniqueId})`} />
            <ellipse cx="215" cy="55" rx="42" ry="30" fill={`url(#blossomDeep_${uniqueId})`} />
          </g>

          {/* Main Canopy Blossom Clouds */}
          <g>
            {/* Top Arched Cloud */}
            <circle cx="115" cy="68" r="38" fill={`url(#blossomPure_${uniqueId})`} />
            <circle cx="150" cy="52" r="36" fill={`url(#blossomPure_${uniqueId})`} />
            <circle cx="190" cy="46" r="34" fill={`url(#blossomPure_${uniqueId})`} />
            <circle cx="230" cy="42" r="28" fill={`url(#blossomPure_${uniqueId})`} />

            {/* Left Cluster */}
            <circle cx="38" cy="130" r="32" fill={`url(#blossomPure_${uniqueId})`} />
            <circle cx="65" cy="118" r="36" fill={`url(#blossomPure_${uniqueId})`} />
            <circle cx="24" cy="165" r="24" fill={`url(#blossomPure_${uniqueId})`} />

            {/* Center Mid-Canopy */}
            <circle cx="85" cy="85" r="34" fill={`url(#blossomPure_${uniqueId})`} />
            <circle cx="170" cy="80" r="38" fill={`url(#blossomPure_${uniqueId})`} />
            <circle cx="130" cy="100" r="32" fill={`url(#blossomPure_${uniqueId})`} />
          </g>

          {/* Front Highlight Puffs (Snow-White Highlights) */}
          <g>
            <circle cx="108" cy="55" r="24" fill={`url(#blossomHighlight_${uniqueId})`} />
            <circle cx="140" cy="42" r="25" fill={`url(#blossomHighlight_${uniqueId})`} />
            <circle cx="180" cy="38" r="24" fill={`url(#blossomHighlight_${uniqueId})`} />
            <circle cx="52" cy="108" r="22" fill={`url(#blossomHighlight_${uniqueId})`} />
            <circle cx="165" cy="65" r="26" fill={`url(#blossomHighlight_${uniqueId})`} />
          </g>

          {/* Detailed 5-Petal Yoshino Flower Accents */}
          <g transform="translate(138, 58) scale(0.85)">
            <circle cx="0" cy="-6" r="3.8" fill="#FFFFFF" />
            <circle cx="6" cy="-2" r="3.8" fill="#FFFFFF" />
            <circle cx="4" cy="5" r="3.8" fill="#FFFFFF" />
            <circle cx="-4" cy="5" r="3.8" fill="#FFFFFF" />
            <circle cx="-6" cy="-2" r="3.8" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="1.8" fill="#FACC15" />
          </g>
          <g transform="translate(195, 48) scale(0.8)">
            <circle cx="0" cy="-6" r="3.8" fill="#FFFFFF" />
            <circle cx="6" cy="-2" r="3.8" fill="#FFFFFF" />
            <circle cx="4" cy="5" r="3.8" fill="#FFFFFF" />
            <circle cx="-4" cy="5" r="3.8" fill="#FFFFFF" />
            <circle cx="-6" cy="-2" r="3.8" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="1.8" fill="#FACC15" />
          </g>
          <g transform="translate(70, 115) scale(0.75)">
            <circle cx="0" cy="-6" r="3.8" fill="#FFFFFF" />
            <circle cx="6" cy="-2" r="3.8" fill="#FFFFFF" />
            <circle cx="4" cy="5" r="3.8" fill="#FFFFFF" />
            <circle cx="-4" cy="5" r="3.8" fill="#FFFFFF" />
            <circle cx="-6" cy="-2" r="3.8" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="1.8" fill="#FACC15" />
          </g>
        </svg>
      </div>

      {/* ── Layer 7: Animated Blowing White Leaves & Petals (Sakura Fubuki) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PETALS_DATA.map((p) => {
          const animName =
            p.variant === 0
              ? `petalDriftA_${uniqueId}`
              : p.variant === 1
                ? `petalDriftB_${uniqueId}`
                : p.variant === 2
                  ? `petalDriftC_${uniqueId}`
                  : `petalDriftD_${uniqueId}`

          return (
            <div
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                left: `${p.startX}%`,
                top: `${p.startY}%`,
                width: `${p.size}px`,
                height: `${Math.round(p.size * 1.35)}px`,
                animation: `${animName} ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
                animationDelay: `${p.delay}s`,
                opacity: p.opacity,
              }}
            >
              {/* Pristine White Yoshino Petal SVG with Soft Pink Base Rim */}
              <svg
                viewBox="0 0 24 32"
                className="w-full h-full drop-shadow-[0_2px_4px_rgba(44,24,16,0.2)]"
              >
                <path
                  d="M12 0 C17 3 24 10 24 20 C24 27 18 32 12 32 C6 32 0 27 0 20 C0 10 7 3 12 0 Z"
                  fill="#FFFFFF"
                />
                {/* Whisper Pink Gradient Notch Accent */}
                <path
                  d="M12 18 C15 22 18 26 18 29 C16 31 14 32 12 32 C10 32 8 31 6 29 C6 26 9 22 12 18 Z"
                  fill="#FCE7F3"
                  opacity="0.8"
                />
                {/* Delicate Petal Spine Highlight */}
                <path
                  d="M12 4 L12 28"
                  stroke="#FFF1F2"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
            </div>
          )
        })}
      </div>

      {/* ── Layer 8: Light Vignette Overlay for Crisp Readability ── */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
    </div>
  )
}
