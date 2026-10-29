import React, { useState } from 'react'
import { Lock } from 'lucide-react'
import { AudioSynth } from '../engine/AudioSynth'
import { useNotificationBadges } from '../state/useNotificationBadges'
import { useRunStore } from '../state/useRunStore'
import { useMetaStore } from '../state/useMetaStore'
import { getUiUnlockState } from '../config/unlocks.config'
import { RedAlertBadge } from './WorldDioramaArt'

export type HubTabId = 'exchange' | 'base' | 'run' | 'missions' | 'social'

interface BottomTabBarProps {
  activeTab: HubTabId
  onSelectTab: (tab: HubTabId) => void
}

/**
 * Icon-Only Chunky Bottom Navigation Dock with oversized 40px+ glossy 3D game icons,
 * red [!] notification badges, and progressive stage-based locks with padlocks (🔒).
 */
export function BottomTabBar({ activeTab, onSelectTab }: BottomTabBarProps) {
  const badges = useNotificationBadges()
  const runInProgress = useRunStore((s) => s.isActive)
  const meta = useMetaStore()
  const unlocks = getUiUnlockState(meta)
  const [lockToast, setLockToast] = useState<string | null>(null)

  const showLockNotice = (msg: string) => {
    setLockToast(msg)
    window.setTimeout(() => setLockToast(null), 2000)
  }

  const tabs: Array<{
    id: HubTabId
    title: string
    isUnlocked: boolean
    unlockLabel: string
    activePill: string
    inactivePill: string
    hasAlert?: boolean
    icon: React.ReactNode
    dataTutorial?: string
  }> = [
    {
      id: 'exchange',
      title: 'Exchange Shop & Vaults',
      isUnlocked: unlocks.shopTabUnlocked,
      unlockLabel: 'Stage 1',
      activePill:
        'bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] border-[3px] border-[#422006] border-b-[6px] border-b-[#291303] shadow-[0_6px_14px_rgba(2,132,199,0.45)] -translate-y-1.5 scale-105',
      inactivePill:
        'bg-gradient-to-b from-[#fff6e6] to-[#fed7aa] border-[2.5px] border-[#78350f] border-b-[5px] border-b-[#451a03]',
      hasAlert: badges.exchangeTab,
      icon: <Storefront3DIcon />,
    },
    {
      id: 'base',
      title: 'Base HQ (Heroes, Coins, Algos & Real Estate)',
      isUnlocked: unlocks.baseTabUnlocked,
      unlockLabel: 'Unlocked',
      dataTutorial: 'bottom-tab-base',
      activePill:
        'bg-gradient-to-b from-[#fde047] via-[#facc15] to-[#d97706] border-[3px] border-[#422006] border-b-[6px] border-b-[#291303] shadow-[0_6px_14px_rgba(217,119,6,0.45)] -translate-y-1.5 scale-105',
      inactivePill:
        'bg-gradient-to-b from-[#fff6e6] to-[#fed7aa] border-[2.5px] border-[#78350f] border-b-[5px] border-b-[#451a03]',
      hasAlert: badges.baseHqTab,
      icon: <BaseFortress3DIcon />,
    },
    {
      id: 'run',
      title: 'Trade Run Campaign',
      isUnlocked: unlocks.runTabUnlocked,
      unlockLabel: 'Unlocked',
      dataTutorial: 'bottom-tab-run',
      activePill:
        'bg-gradient-to-b from-[#4ade80] via-[#22c55e] to-[#15803d] border-[3px] border-[#422006] border-b-[6px] border-b-[#14532d] shadow-[0_6px_14px_rgba(20,83,45,0.45)] -translate-y-1.5 scale-105',
      inactivePill:
        'bg-gradient-to-b from-[#fff6e6] to-[#fed7aa] border-[2.5px] border-[#78350f] border-b-[5px] border-b-[#451a03]',
      hasAlert: runInProgress,
      icon: <BattleRocketSwords3DIcon />,
    },
    {
      id: 'missions',
      title: 'Daily Raid Missions & Auto-Sweep',
      isUnlocked: unlocks.missionsTabUnlocked,
      unlockLabel: 'Stage 3',
      activePill:
        'bg-gradient-to-b from-[#fb7185] via-[#f43f5e] to-[#be123c] border-[3px] border-[#422006] border-b-[6px] border-b-[#291303] shadow-[0_6px_14px_rgba(225,29,72,0.45)] -translate-y-1.5 scale-105',
      inactivePill:
        'bg-gradient-to-b from-[#fff6e6] to-[#fed7aa] border-[2.5px] border-[#78350f] border-b-[5px] border-b-[#451a03]',
      hasAlert: badges.missionsTab,
      icon: <VaultRadarTarget3DIcon />,
    },
    {
      id: 'social',
      title: 'Social Syndicate & League Trophy',
      isUnlocked: unlocks.socialTabUnlocked,
      unlockLabel: 'Stage 5',
      activePill:
        'bg-gradient-to-b from-[#c084fc] via-[#a855f7] to-[#6b21a8] border-[3px] border-[#422006] border-b-[6px] border-b-[#291303] shadow-[0_6px_14px_rgba(147,51,234,0.45)] -translate-y-1.5 scale-105',
      inactivePill:
        'bg-gradient-to-b from-[#fff6e6] to-[#fed7aa] border-[2.5px] border-[#78350f] border-b-[5px] border-b-[#451a03]',
      hasAlert: badges.eventsTab,
      icon: <GuildShieldTrophy3DIcon />,
    },
  ]

  return (
    <nav
      aria-label="Main Game Navigation"
      className="relative z-30 grid shrink-0 grid-cols-5 items-center gap-1.5 border-t-[3.5px] border-[#78350f] bg-gradient-to-b from-[#fff6e6] via-[#ffedd5] to-[#fde68a] px-2.5 pt-2 shadow-[0_-6px_18px_rgba(66,32,6,0.24)] safe-area-bottom-dock"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      {lockToast && (
        <div className="pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-[#FFFDF9] px-3.5 py-1 font-display text-[11px] font-extrabold text-[#2C1810] shadow-lg animate-bounce">
          {lockToast}
        </div>
      )}

      {tabs.map((t) => {
        const active = activeTab === t.id
        const locked = !t.isUnlocked
        return (
          <button
            key={t.id}
            type="button"
            data-tutorial={t.dataTutorial}
            title={locked ? `${t.title} (Locked - Clears after ${t.unlockLabel})` : t.title}
            aria-label={t.title}
            onClick={() => {
              AudioSynth.unlock()
              if (locked) {
                AudioSynth.playRelicTrigger()
                showLockNotice(
                  unlocks.isTutorialLockdown
                    ? '🔒 Complete Tutorial to unlock!'
                    : `🔒 Unlocks after clearing ${t.unlockLabel}!`,
                )
                return
              }
              AudioSynth.playCoinInject()
              onSelectTab(t.id)
            }}
            className={`group relative flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 h-12 ${
              locked
                ? 'cursor-not-allowed border-2 border-[#8D7B68] border-b-4 border-b-[#5C4D3C] bg-gradient-to-b from-[#E2D5C1] to-[#C9B9A3] opacity-75'
                : active
                ? t.activePill
                : t.inactivePill
            }`}
          >
            {/* Specular Top Gloss Highlight */}
            {!locked && (
              <span className="pointer-events-none absolute top-1 left-2.5 right-2.5 h-2 rounded-full bg-white/45" />
            )}

            {/* Oversized 40px+ Glossy 3D Game Icon OR Padlock when locked */}
            {locked ? (
              <div className="flex flex-col items-center justify-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#5C4D3C] bg-[#FFFDF9]/90 text-[#3E2723] shadow-xs">
                  <Lock className="h-4 w-4 stroke-[2.5]" />
                </div>
                <span className="mt-0.5 font-display text-[8px] font-black uppercase tracking-tight text-[#3E2723]">
                  {t.unlockLabel}
                </span>
              </div>
            ) : (
              <div className="relative flex items-center justify-center drop-shadow-[0_2px_2px_rgba(66,32,6,0.45)]">
                {t.icon}
              </div>
            )}

            {!locked && t.hasAlert && <RedAlertBadge className="-top-2 -right-1" />}
          </button>
        )
      })}
    </nav>
  )
}

/** Tab 1: Oversized Treasure Storefront 3D Icon (42x42) */
function Storefront3DIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" className="overflow-visible">
      {/* Store Base & Golden Chest */}
      <rect
        x="7"
        y="20"
        width="34"
        height="22"
        rx="5"
        fill="#f59e0b"
        stroke="#422006"
        strokeWidth="3"
      />
      <rect
        x="10"
        y="24"
        width="28"
        height="15"
        rx="3"
        fill="#fef3c7"
        stroke="#422006"
        strokeWidth="2.5"
      />
      {/* Striped Shop Awning */}
      <path
        d="M4 21 L9 9 H39 L44 21 Z"
        fill="#ef4444"
        stroke="#422006"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M15 9 L13 21 H21 L22 9 Z" fill="#fffdf5" />
      <path d="M27 9 L28 21 H36 L34 9 Z" fill="#fffdf5" />
      {/* Glowing Cyan Satoshi Gem inside Storefront */}
      <polygon
        points="24,23 31,30 24,39 17,30"
        fill="#38bdf8"
        stroke="#422006"
        strokeWidth="2.5"
      />
      <polygon points="24,25 28,30 24,33" fill="#bae6fd" />
    </svg>
  )
}

/** Tab 2: Oversized Upgradable House / Fortress HQ 3D Icon (42x42) */
function BaseFortress3DIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" className="overflow-visible">
      {/* Fortress Battlements */}
      <rect
        x="8"
        y="18"
        width="32"
        height="24"
        rx="4"
        fill="#fde68a"
        stroke="#422006"
        strokeWidth="3"
      />
      {/* Chunky Red/Orange Pitched Roof */}
      <polygon
        points="4,22 24,6 44,22"
        fill="#f97316"
        stroke="#422006"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Golden Shield Crest on Roof */}
      <circle
        cx="24"
        cy="17"
        r="5"
        fill="#fde047"
        stroke="#422006"
        strokeWidth="2.5"
      />
      {/* Arched Wooden Fortress Door */}
      <path
        d="M18 42 V30 A6 6 0 0 1 30 30 V42 Z"
        fill="#92400e"
        stroke="#422006"
        strokeWidth="3"
      />
      <circle cx="27" cy="36" r="1.8" fill="#fde047" />
    </svg>
  )
}

/** Tab 3: Oversized Battle Swords + Golden Rocket Emblem (42x42) */
function BattleRocketSwords3DIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 52 52" className="overflow-visible">
      {/* Outer Radiant Golden Halo */}
      <circle
        cx="26"
        cy="26"
        r="21"
        fill="#fde047"
        stroke="#422006"
        strokeWidth="3"
      />
      <circle cx="26" cy="26" r="16" fill="#22c55e" stroke="#422006" strokeWidth="2.5" />
      {/* Crossed Battle Swords */}
      <path
        d="M11 39 L38 12 M14 12 L41 39"
        stroke="#fffdf5"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M11 39 L38 12 M14 12 L41 39"
        stroke="#422006"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Center Bullish Rocket / Upward Arrow */}
      <polygon
        points="26,7 36,23 30,23 30,38 22,38 22,23 16,23"
        fill="#f59e0b"
        stroke="#422006"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <polygon points="26,11 31,20 26,20" fill="#fef08a" />
    </svg>
  )
}

/** Tab 4: Oversized Target / Vault Radar Raid 3D Icon (42x42) */
function VaultRadarTarget3DIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" className="overflow-visible">
      {/* Outer Bullseye Ring */}
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="#f43f5e"
        stroke="#422006"
        strokeWidth="3"
      />
      <circle
        cx="24"
        cy="24"
        r="12"
        fill="#fffdf5"
        stroke="#422006"
        strokeWidth="2.5"
      />
      <circle
        cx="24"
        cy="24"
        r="6.5"
        fill="#fde047"
        stroke="#422006"
        strokeWidth="2.5"
      />
      {/* Crosshairs */}
      <line x1="24" y1="3" x2="24" y2="11" stroke="#422006" strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="37" x2="24" y2="45" stroke="#422006" strokeWidth="3" strokeLinecap="round" />
      <line x1="3" y1="24" x2="11" y2="24" stroke="#422006" strokeWidth="3" strokeLinecap="round" />
      <line x1="37" y1="24" x2="45" y2="24" stroke="#422006" strokeWidth="3" strokeLinecap="round" />
      {/* Golden Dart / Lightning Hit */}
      <polygon
        points="26,16 39,7 34,21 24,24"
        fill="#38bdf8"
        stroke="#422006"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Tab 5: Oversized Guild Shield & Golden Trophy 3D Icon (42x42) */
function GuildShieldTrophy3DIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" className="overflow-visible">
      {/* Royal Syndicate Shield */}
      <path
        d="M24 5 L41 11 V24 C41 34 33 41 24 44 C15 41 7 34 7 24 V11 Z"
        fill="#a855f7"
        stroke="#422006"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M24 9 L37 14 V24 C37 31 31 37 24 40 C17 37 11 31 11 24 V14 Z"
        fill="#7e22ce"
      />
      {/* Golden Trophy Cup inside Shield */}
      <path
        d="M16 15 H32 V22 C32 27 28 30 24 30 C20 30 16 27 16 22 Z"
        fill="#fde047"
        stroke="#422006"
        strokeWidth="2.5"
      />
      <rect
        x="21"
        y="30"
        width="6"
        height="5"
        fill="#f59e0b"
        stroke="#422006"
        strokeWidth="2.5"
      />
      <rect
        x="17"
        y="34"
        width="14"
        height="4"
        rx="2"
        fill="#fde047"
        stroke="#422006"
        strokeWidth="2.5"
      />
    </svg>
  )
}
