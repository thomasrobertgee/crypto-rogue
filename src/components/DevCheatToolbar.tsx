import { useState, useEffect } from 'react'
import {
  Settings,
  Gem,
  Key,
  Cpu,
  Unlock,
  RotateCcw,
  Crown,
  Sparkles,
  Flame,
  X,
  Wrench,
} from 'lucide-react'
import { COINS } from '../config/coins.config'
import { RELICS } from '../config/relics.config'
import { STAGES } from '../config/stages.config'
import { addCoins } from '../engine/economy'
import { AudioSynth } from '../engine/AudioSynth'
import { useMetaStore } from '../state/useMetaStore'
import { useRunStore } from '../state/useRunStore'
import { BotSimLabModal } from './modals/BotSimLabModal'
import { BotSimulatorEngine } from '../simulation/BotSimulatorEngine'
import { requestNotificationPermission } from '../utils/notifications'
import type { RigItem, RigSlot } from '../config/equipment.config'

interface DevCheatToolbarProps {
  onResetToHub?: () => void
  onReplayBootFlow?: () => void
}

export function DevCheatToolbar({ onResetToHub, onReplayBootFlow }: DevCheatToolbarProps) {
  const [open, setOpen] = useState(false)
  const [showBotSimLab, setShowBotSimLab] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const meta = useMetaStore()

  useEffect(() => {
    ;(window as any).__openBotSimLab = () => setShowBotSimLab(true)
    ;(window as any).BotSimulatorEngine = BotSimulatorEngine
  }, [])

  const showNotice = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const handleGrantGems = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    useMetaStore.setState((s) => ({ gems: s.gems + 10000 }))
    showNotice('Granted +10,000 Satoshi Gems!')
  }

  const handleGrantKeys = () => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    useMetaStore.setState((s) => ({
      silverKeys: s.silverKeys + 50,
      quantumKeys: s.quantumKeys + 50,
    }))
    showNotice('Granted +50 Silver Keys & +50 Quantum Keys!')
  }

  const handleGrantHashrate = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    useMetaStore.setState((s) => ({ hashrate: s.hashrate + 50000 }))
    showNotice('Granted +50,000 Hashrate!')
  }

  const handleUnlockAllStages = () => {
    AudioSynth.unlock()
    AudioSynth.playMythicalDrop()
    useMetaStore.setState({
      currentStage: STAGES.length,
      highestStageCleared: STAGES.length,
      unlockedSlots: 4,
      unlockedRelicSlots: 5,
      unlockedFeatures: [
        'gachaShop',
        'foundry',
        'growthEvents',
        'idleRig',
        'dailyQuests',
      ],
    })
    showNotice(`Unlocked All ${STAGES.length} Stages, 4 Coin & 5 Algo Slots!`)
  }

  const handleUnlockAllArsenal = () => {
    AudioSynth.unlock()
    AudioSynth.playMythicalDrop()
    const s = useMetaStore.getState()
    let coins = [...s.ownedCoins]
    for (const cfg of COINS) {
      coins = addCoins(coins, cfg.id, cfg.rarity, 3)
    }
    const allRelics = RELICS.map((r) => r.id)
    useMetaStore.setState({
      ownedCoins: coins,
      ownedRelics: allRelics,
    })
    showNotice('Granted 3x of All 15 Coins & All 12 Relics!')
  }

  const handleToggleVip = () => {
    AudioSynth.unlock()
    const nextVip = !meta.isVipAdFree
    meta.setVip(nextVip)
    showNotice(nextVip ? 'VIP Ad-Free & 4x Speed ENABLED' : 'VIP Ad-Free DISABLED')
  }

  const handleTriggerBossOffer = () => {
    AudioSynth.unlock()
    meta.triggerMarginCallOffer()
    showNotice('Triggered 2h Whale Bailout Flash Offer!')
  }

  const handleUnlockHeroesAndBases = () => {
    AudioSynth.unlock()
    AudioSynth.playMythicalDrop()
    useMetaStore.setState({
      ownedHeroes: {
        rookie_satoshi: 5,
        degen_ape_roxy: 4,
        jordan_the_wolf: 3,
        quantum_ai_oracle: 3,
      },
      unlockedLocationIds: [
        'outskirts_tent',
        'suburban_garage',
        'cyber_loft',
        'miami_penthouse',
        'lunar_citadel',
      ],
      missionTickets: {
        whale_liquidity_heist: 5,
        asic_overclock_trial: 5,
        corporate_espionage: 5,
      },
    })
    showNotice('Unlocked All 4 Camp Heroes, 5 Bases & +5 Raid Tickets!')
  }

  const handleGrantSolderWire = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    useMetaStore.setState((s) => ({ solderWire: (s.solderWire ?? 0) + 100 }))
    showNotice('Granted +100 Solder Wire!')
  }

  const handleGrantFullLegendaryRig = () => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    const legendarySet: Record<RigSlot, RigItem> = {
      gpu: {
        id: `rig_gpu_legendary_${Date.now()}`,
        name: 'RTX 4090 Hash Monster',
        slot: 'gpu',
        rarity: 'legendary',
        level: 10,
        stars: 3,
        setId: 'nvidia_protocol',
        icon: '🖥️',
        flavor: '24GB of high-speed GDDR6X VRAM crunching gigahashes in cold silence.',
        primaryStat: { type: 'flatAtk', value: 95, label: '+95 Flat ATK & +28% Green DMG' },
        secondaryAffixes: [
          { id: 'aff_1', type: 'critMultiplier', value: 0.45, label: '+0.45x Crit Multiplier' },
          { id: 'aff_2', type: 'greenDamagePct', value: 20, label: '+20% Green Candle DMG' },
          { id: 'aff_3', type: 'tickSpeedPct', value: 8, label: '+8% Tick Speed' },
        ],
      },
      cooling_fan: {
        id: `rig_fan_legendary_${Date.now()}`,
        name: 'N-Vidia Cryo-Flow Dual',
        slot: 'cooling_fan',
        rarity: 'legendary',
        level: 10,
        stars: 3,
        setId: 'nvidia_protocol',
        icon: '❄️',
        flavor: 'Aerospace-grade reverse vapor chambers cycling liquid nitrogen over the dies.',
        primaryStat: { type: 'tickSpeedPct', value: 16, label: '+16% Global Tick Speed' },
        secondaryAffixes: [
          { id: 'aff_4', type: 'greenDamagePct', value: 15, label: '+15% Green Candle DMG' },
          { id: 'aff_5', type: 'critChance', value: 6, label: '+6% Crit Chance' },
        ],
      },
      power_supply: {
        id: `rig_psu_legendary_${Date.now()}`,
        name: 'AntMiner P21D Server Power',
        slot: 'power_supply',
        rarity: 'legendary',
        level: 10,
        stars: 3,
        setId: 'antminer_asic',
        icon: '⚡',
        flavor: 'Heavy copper busbars built to survive power grid brownouts during Flash Crashes.',
        primaryStat: { type: 'flatHp', value: 250, label: '+250 Flat Margin HP & +22% HP' },
        secondaryAffixes: [
          { id: 'aff_6', type: 'marginHpPct', value: 18, label: '+18% Margin HP' },
          { id: 'aff_7', type: 'flatHp', value: 120, label: '+120 Margin HP' },
        ],
      },
      motherboard: {
        id: `rig_mobo_legendary_${Date.now()}`,
        name: 'N-Vidia Quantum PCB-99',
        slot: 'motherboard',
        rarity: 'legendary',
        level: 10,
        stars: 3,
        setId: 'nvidia_protocol',
        icon: '📟',
        flavor: 'Optical data interconnects eliminating bus latency between coin wallet slots.',
        primaryStat: { type: 'overdriveCap', value: 45, label: '+45% Max Coin Capacity Cap' },
        secondaryAffixes: [
          { id: 'aff_8', type: 'critChance', value: 7, label: '+7% Crit Chance' },
          { id: 'aff_9', type: 'startingCash', value: 350, label: '+$350 Starting Cash' },
        ],
      },
      ssd: {
        id: `rig_ssd_legendary_${Date.now()}`,
        name: 'AntMiner Ultra-Fast Sync ROM',
        slot: 'ssd',
        rarity: 'legendary',
        level: 10,
        stars: 3,
        setId: 'antminer_asic',
        icon: '💾',
        flavor: 'Zero-latency cold storage firmware pre-loading orderbook buy-walls.',
        primaryStat: { type: 'startingCash', value: 500, label: '+$500 Starting Cash & -25% Reroll' },
        secondaryAffixes: [
          { id: 'aff_10', type: 'startingCash', value: 250, label: '+$250 Starting Cash' },
          { id: 'aff_11', type: 'greenDamagePct', value: 14, label: '+14% Green Candle DMG' },
        ],
      },
      asic_processor: {
        id: `rig_asic_legendary_${Date.now()}`,
        name: 'N-Vidia H100 Tensor Die',
        slot: 'asic_processor',
        rarity: 'legendary',
        level: 10,
        stars: 3,
        setId: 'nvidia_protocol',
        icon: '🖲️',
        flavor: '4th-Gen Tensor cores executing real-time candlestick predictive regressions.',
        primaryStat: { type: 'critChance', value: 14, label: '+14% Crit Chance & +0.5x Multiplier' },
        secondaryAffixes: [
          { id: 'aff_12', type: 'critMultiplier', value: 0.5, label: '+0.50x Crit Multiplier' },
          { id: 'aff_13', type: 'tickSpeedPct', value: 6, label: '+6% Tick Speed' },
        ],
      },
    }

    useMetaStore.setState((s) => ({
      equippedRig: { ...legendarySet },
      rigInventory: [
        ...s.rigInventory.filter((item) => !Object.values(legendarySet).some((l) => l.id === item.id)),
        ...Object.values(legendarySet),
      ],
      solderWire: (s.solderWire ?? 0) + 500,
    }))
    showNotice('Granted Full 6-Slot Legendary Rig Set + 500 Solder Wire!')
  }

  const handleResetSave = () => {
    AudioSynth.unlock()
    meta.resetProgress()
    useRunStore.setState({
      isActive: false,
      currentStageId: 1,
      currentNodeIndex: 1,
      marginHp: 100,
      maxMarginHp: 100,
      unallocatedCash: 1000,
      slotAllocations: [0, 0, 0, 0],
      allocationMode: 'inject',
      combatSpeed: 1,
      bailoutUsed: false,
      runRelics: [],
      nextBattleEffects: [],
    })
    onResetToHub?.()
    onReplayBootFlow?.()
    setOpen(false)
    showNotice('Save Reset to Stage 1 Onboarding & Boot Pipeline!')
  }

  return (
    <>
      {/* Top-Right High-Contrast Tactile Gear Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Dev Cheat / Economy Tester Toolbar"
        aria-label="Toggle Dev Cheat / Economy Tester Toolbar"
        className={`absolute right-2 top-1.5 z-50 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#3E2723] border-b-[3px] transition active:scale-90 shadow-sm ${
          open
            ? 'bg-[#FDE047] text-[#3E2723]'
            : 'bg-[#F5E6C8] text-[#3E2723] hover:bg-[#FDE68A]'
        }`}
      >
        <Settings className={`h-3.5 w-3.5 stroke-[2.5] text-[#3E2723] ${open ? 'animate-spin' : ''}`} />
      </button>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-12 z-50 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-[#FFFDF9] px-3.5 py-1 font-display text-[11px] font-extrabold text-[#2C1810] shadow-lg">
          {toast}
        </div>
      )}

      {/* Dev Cheat / Economy Tester Toolbar Overlay */}
      {open && (
        <div
          className="absolute inset-0 z-50 flex items-start justify-end bg-black/65 p-3 pt-10 pb-4 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex w-full max-w-xs max-h-[calc(100%-3.25rem)] flex-col overflow-hidden rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3 text-[#2C1810] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#E2D5C1] pb-2">
              <div className="flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-[#D97706]" />
                <div>
                  <h3 className="font-display text-xs font-extrabold tracking-wider text-[#2C1810]">
                    DEV CHEAT / ECONOMY TESTER
                  </h3>
                  <p className="text-[10px] font-semibold text-[#6E5A4F]">
                    Stage {meta.currentStage}/{STAGES.length} · {meta.unlockedSlots}/4 Coins ·{' '}
                    {meta.unlockedRelicSlots ?? 1}/5 Algos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[#E2D5C1] bg-[#F3E9D8] p-1 text-[#3E2723]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 pt-1.5 pb-2 grid grid-cols-2 gap-1.5 font-display text-[11px] font-extrabold scrollbar-visible">
              {/* Monte Carlo Bot Sim & Balance Lab */}
              <button
                type="button"
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  setOpen(false)
                  setShowBotSimLab(true)
                }}
                className="col-span-2 flex items-center justify-between rounded-xl border-2 border-[#7c3aed] bg-gradient-to-r from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe] px-3 py-2 text-left text-[#5b21b6] font-display text-[11px] font-black uppercase transition active:scale-95 shadow-sm hover:brightness-105"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base animate-pulse">🧪</span>
                  <span>Monte Carlo Bot Sim Lab</span>
                </div>
                <span className="rounded-full bg-[#7c3aed] px-2 py-0.5 text-[9px] font-black text-white shadow-xs">
                  OPEN LAB
                </span>
              </button>

              {/* Unlock All UI (Dev Toggle) */}
              <button
                type="button"
                onClick={() => {
                  AudioSynth.unlock()
                  meta.toggleDevUnlockAllUi()
                  showNotice(
                    !meta.devUnlockAllUi
                      ? '🔓 DEV: All UI Tabs, Slots & Features UNLOCKED!'
                      : '🔒 DEV: Stage-Based Progression RESTORED',
                  )
                }}
                className={`col-span-2 flex items-center justify-between rounded-xl border-2 px-3 py-2 text-left transition active:scale-95 ${
                  meta.devUnlockAllUi
                    ? 'border-[#16a34a] bg-[#dcfce7] text-[#15803d]'
                    : 'border-[#78350f]/30 bg-[#fef3c7] text-[#92400e]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{meta.devUnlockAllUi ? '🔓' : '🔒'}</span>
                  <span>Unlock All UI (Dev)</span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs"
                  style={{ backgroundColor: meta.devUnlockAllUi ? '#16a34a' : '#78350f' }}
                >
                  {meta.devUnlockAllUi ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleGrantGems}
                className="flex items-center gap-1.5 rounded-xl border border-[#F59E0B] bg-[#FEF3C7] px-2.5 py-2 text-left text-[#92400E] transition active:scale-95"
              >
                <Gem className="h-3.5 w-3.5 shrink-0" />
                <span>+10,000 Gems</span>
              </button>

              <button
                type="button"
                onClick={handleGrantKeys}
                className="flex items-center gap-1.5 rounded-xl border border-[#C084FC] bg-[#F3E8FF] px-2.5 py-2 text-left text-[#6B21A8] transition active:scale-95"
              >
                <Key className="h-3.5 w-3.5 shrink-0" />
                <span>+50 Keys (S&amp;Q)</span>
              </button>

              <button
                type="button"
                onClick={handleGrantHashrate}
                className="flex items-center gap-1.5 rounded-xl border border-[#38BDF8] bg-[#E0F2FE] px-2.5 py-2 text-left text-[#075985] transition active:scale-95"
              >
                <Cpu className="h-3.5 w-3.5 shrink-0" />
                <span>+50,000 H/s</span>
              </button>

              <button
                type="button"
                onClick={handleUnlockAllStages}
                className="flex items-center gap-1.5 rounded-xl border border-[#4ADE80] bg-[#DCFCE7] px-2.5 py-2 text-left text-[#166534] transition active:scale-95"
              >
                <Unlock className="h-3.5 w-3.5 shrink-0" />
                <span>Unlock All Stages</span>
              </button>

              <button
                type="button"
                onClick={handleUnlockAllArsenal}
                className="flex items-center gap-1.5 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2.5 py-2 text-left text-[#2C1810] transition active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#D97706]" />
                <span>+All Coins/Relics</span>
              </button>

              <button
                type="button"
                onClick={handleToggleVip}
                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left transition active:scale-95 ${
                  meta.isVipAdFree
                    ? 'border-[#D97706] bg-[#FDE047] text-[#2C1810]'
                    : 'border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                }`}
              >
                <Crown className="h-3.5 w-3.5 shrink-0" />
                <span>{meta.isVipAdFree ? 'VIP: ON (4x)' : 'VIP: OFF'}</span>
              </button>

              {/* Audio Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = meta.audioEnabled === false
                  meta.setAudioEnabled(next)
                  showNotice(next ? '🔊 Audio Synthesizers ENABLED' : '🔇 Audio MUTED')
                }}
                className={`flex items-center justify-between rounded-xl border-2 px-2.5 py-2 text-left transition active:scale-95 ${
                  meta.audioEnabled !== false
                    ? 'border-[#16a34a] bg-[#dcfce7] text-[#15803d]'
                    : 'border-[#78716c] bg-[#f5f5f4] text-[#78716c]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{meta.audioEnabled !== false ? '🔊' : '🔇'}</span>
                  <span>Audio</span>
                </div>
                <span
                  className="rounded-full px-1.5 py-0.2 text-[9px] font-black uppercase text-white shadow-xs"
                  style={{ backgroundColor: meta.audioEnabled !== false ? '#16a34a' : '#78716c' }}
                >
                  {meta.audioEnabled !== false ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Haptics Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = meta.hapticsEnabled === false
                  meta.setHapticsEnabled(next)
                  showNotice(next ? '📳 Mobile Haptics ENABLED' : '📳 Mobile Haptics DISABLED')
                }}
                className={`flex items-center justify-between rounded-xl border-2 px-2.5 py-2 text-left transition active:scale-95 ${
                  meta.hapticsEnabled !== false
                    ? 'border-[#0284c7] bg-[#e0f2fe] text-[#0369a1]'
                    : 'border-[#78716c] bg-[#f5f5f4] text-[#78716c]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📳</span>
                  <span>Haptics</span>
                </div>
                <span
                  className="rounded-full px-1.5 py-0.2 text-[9px] font-black uppercase text-white shadow-xs"
                  style={{ backgroundColor: meta.hapticsEnabled !== false ? '#0284c7' : '#78716c' }}
                >
                  {meta.hapticsEnabled !== false ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Web Notifications Toggle */}
              <button
                type="button"
                onClick={async () => {
                  if (meta.notificationsEnabled) {
                    meta.setNotificationsEnabled(false)
                    showNotice('🔔 Web Notifications DISABLED')
                  } else {
                    const granted = await requestNotificationPermission()
                    showNotice(granted ? '🔔 Web Notifications ENABLED!' : '⚠️ Permission Denied')
                  }
                }}
                className={`col-span-2 flex items-center justify-between rounded-xl border-2 px-3 py-2 text-left transition active:scale-95 ${
                  meta.notificationsEnabled
                    ? 'border-[#7c3aed] bg-[#f5f3ff] text-[#6d28d9]'
                    : 'border-[#78716c] bg-[#f5f5f4] text-[#78716c]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{meta.notificationsEnabled ? '🔔' : '🔕'}</span>
                  <span>Re-Engagement Web Notifications</span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-xs"
                  style={{ backgroundColor: meta.notificationsEnabled ? '#7c3aed' : '#78716c' }}
                >
                  {meta.notificationsEnabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </button>

              {/* Solder Wire Cheat */}
              <button
                type="button"
                onClick={handleGrantSolderWire}
                className="col-span-2 flex items-center justify-between rounded-xl border border-[#06b6d4] bg-[#ecfeff] px-2.5 py-2 text-left text-[#0e7490] transition active:scale-95"
              >
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 shrink-0 text-[#0891b2]" />
                  <span>+100 Solder Wire (Reforging)</span>
                </div>
                <span className="font-display text-xs font-black text-[#0891b2]">
                  🧵 {meta.solderWire ?? 0}
                </span>
              </button>

              {/* Full Legendary Rig Cheat */}
              <button
                type="button"
                onClick={handleGrantFullLegendaryRig}
                className="col-span-2 flex items-center justify-between rounded-xl border-2 border-[#d97706] bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fed7aa] px-3 py-2 text-left text-[#b45309] font-display text-[11px] font-black uppercase transition active:scale-95 shadow-sm hover:brightness-105"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base animate-pulse">⛏️</span>
                  <span>Grant Full Legendary 6-Slot Rig</span>
                </div>
                <span className="rounded-full bg-[#d97706] px-2 py-0.5 text-[9px] font-black text-white shadow-xs">
                  EQUIP ALL
                </span>
              </button>

              <button
                type="button"
                onClick={handleUnlockHeroesAndBases}
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-[#4ADE80] bg-[#DCFCE7] px-2.5 py-2 text-[#166534] transition active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Unlock All 4 Camp Heroes &amp; 5 Real Estate Bases</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  useRunStore.setState({
                    currentNodeIndex: 5,
                    isEnteringMarket: false,
                    pendingSkillDrafts: 0,
                  })
                  setOpen(false)
                  showNotice('Jumped to Node 5 (Boss Node)!')
                }}
                className="col-span-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#dc2626] bg-[#fee2e2] px-2 py-2 text-[#991b1b] transition active:scale-95"
              >
                <Flame className="h-3.5 w-3.5 shrink-0 text-[#dc2626]" />
                <span>Jump to Boss Node 5</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  useRunStore.setState({ marginHp: 0 })
                  setOpen(false)
                  showNotice('Margin HP Set to 0 (Defeat Triggered)!')
                }}
                className="col-span-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#991b1b] bg-[#fef2f2] px-2 py-2 text-[#7f1d1d] transition active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0 text-[#991b1b]" />
                <span>Liquidate Margin HP</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerBossOffer}
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-[#F59E0B] bg-[#FEF3C7] px-2.5 py-2 text-[#92400E] transition active:scale-95"
              >
                <Flame className="h-3.5 w-3.5 shrink-0 text-[#E11D48]" />
                <span>Trigger 2h Boss Bailout Offer</span>
              </button>

              {onReplayBootFlow && (
                <button
                  type="button"
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playCoinInject()
                    setOpen(false)
                    onReplayBootFlow()
                  }}
                  className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-[#38BDF8] bg-[#E0F2FE] px-2.5 py-2 text-[#0369A1] transition active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>Replay Boot Pipeline (Splash &rarr; Download &rarr; Server)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetSave}
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-[#F43F5E] bg-[#FFE4E6] px-2.5 py-2.5 text-[#9F1239] transition active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span>RESET SAVE (TEST STAGE 1 ONBOARDING)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monte Carlo Bot Simulation & Balance Lab Modal */}
      <BotSimLabModal
        isOpen={showBotSimLab}
        onClose={() => setShowBotSimLab(false)}
      />
    </>
  )
}
