import { useState, useEffect } from 'react'
import {
  X,
  Clock,
  Sparkles,
} from 'lucide-react'
import {
  EXPEDITION_CONTRACTS,
  calculateGreatSuccessChance,
  type ExpeditionContract,
} from '../../config/expeditions.config'
import { HERO_MAP, type HeroId } from '../../config/heroes.config'
import { useMetaStore } from '../../state/useMetaStore'
import { AudioSynth } from '../../engine/AudioSynth'
import { fmtNum } from '../../engine/format'
import {
  SatoshiGemIcon,
  HashrateIcon,
} from '../GameArtwork'
import { HeroChibiSvg } from '../WorldDioramaArt'

interface ExpeditionsModalProps {
  onClose: () => void
}

interface ClaimResultModalData {
  contractTitle: string
  greatSuccess: boolean
  rewards: {
    blueprints: number
    heroFragments: number
    heroFragmentHeroId: HeroId
    gems: number
    hashrate: number
  }
}

function formatRemainingTime(msRemaining: number): string {
  if (msRemaining <= 0) return 'READY TO CLAIM!'
  const totalSec = Math.floor(msRemaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export function ExpeditionsModal({ onClose }: ExpeditionsModalProps) {
  const meta = useMetaStore()
  const [now, setNow] = useState(() => Date.now())
  const [selectedSlotPicker, setSelectedSlotPicker] = useState<{
    contractId: string
    slotIndex: number
  } | null>(null)
  const [stagedHeroes, setStagedHeroes] = useState<Record<string, HeroId[]>>({})
  const [claimResult, setClaimResult] = useState<ClaimResultModalData | null>(null)

  // Live timer tick every second
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const ownedHeroes = meta.ownedHeroes ?? { rookie_satoshi: 1 }
  const heroStars = meta.heroStars ?? { rookie_satoshi: 1 }
  const activeExpeditions = meta.expeditions ?? []

  // List of all currently busy heroes across in-progress expeditions
  const busyHeroes = new Set<HeroId>(activeExpeditions.flatMap((e) => e.assignedHeroIds))

  // Available unequipped bench heroes (not main equipped hero, not busy on another expedition)
  const availableBenchHeroes = (Object.keys(ownedHeroes) as HeroId[]).filter(
    (hid) => (ownedHeroes[hid] ?? 0) > 0 && hid !== meta.equippedHeroId && !busyHeroes.has(hid),
  )

  const handleSelectHeroForSlot = (contractId: string, slotIndex: number, heroId: HeroId) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    const current = stagedHeroes[contractId] ? [...stagedHeroes[contractId]] : []
    current[slotIndex] = heroId
    setStagedHeroes({ ...stagedHeroes, [contractId]: current })
    setSelectedSlotPicker(null)
  }

  const handleRemoveHeroFromSlot = (contractId: string, slotIndex: number) => {
    const current = stagedHeroes[contractId] ? [...stagedHeroes[contractId]] : []
    current.splice(slotIndex, 1)
    setStagedHeroes({ ...stagedHeroes, [contractId]: current })
  }

  const handleDispatch = (contract: ExpeditionContract) => {
    const heroes = stagedHeroes[contract.id] ?? []
    if (heroes.length < contract.requiredSlots) return

    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    const ok = meta.startExpedition(contract.id, heroes)
    if (ok) {
      setStagedHeroes({ ...stagedHeroes, [contract.id]: [] })
    }
  }

  const handleInstantSpeedUp = (contractId: string) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    meta.speedUpExpedition(contractId)
  }

  const handleClaim = (contract: ExpeditionContract) => {
    AudioSynth.unlock()
    const res = meta.claimExpedition(contract.id)
    if (res && res.success) {
      AudioSynth.playVictory()
      setClaimResult({
        contractTitle: contract.title,
        greatSuccess: res.greatSuccess,
        rewards: res.rewards,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] shadow-2xl">
        {/* Top Header */}
        <div className="relative flex items-center justify-between border-b-2 border-[#3E2723] bg-gradient-to-r from-[#78350f] via-[#92400e] to-[#78350f] px-4 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white/30 bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-xl shadow">
              🗺️
            </div>
            <div>
              <h2 className="font-display text-sm font-black tracking-wide text-white drop-shadow">
                OFFSHORE ARBITRAGE EXPEDITIONS
              </h2>
              <p className="text-[10px] font-semibold text-[#fef08a]">
                Deploy unequipped bench Heroes • Star levels boost Great Success!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-black/25 text-white/80 hover:bg-black/40 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Contracts List */}
        <div className="flex-1 space-y-3.5 overflow-y-auto p-3.5">
          {EXPEDITION_CONTRACTS.map((contract) => {
            const active = activeExpeditions.find((e) => e.id === contract.id)
            const isRunning = Boolean(active)
            const msRemaining = active ? Math.max(0, active.startTime + active.durationMs - now) : 0
            const isReadyToClaim = isRunning && msRemaining <= 0
            const progressPct = active
              ? Math.min(100, Math.round(((now - active.startTime) / active.durationMs) * 100))
              : 0

            const staged = stagedHeroes[contract.id] ?? []
            const greatSuccessPct = isRunning
              ? active!.greatSuccessChance
              : calculateGreatSuccessChance(staged, heroStars)

            return (
              <div
                key={contract.id}
                className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FBF8F2] p-3 shadow-md"
              >
                {/* Header: Destination & Duration */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{contract.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xs font-black text-[#2C1810]">
                          {contract.title}
                        </span>
                        <span className="rounded-full bg-[#e0e7ff] px-1.5 py-0.2 font-display text-[9px] font-extrabold text-[#3730a3]">
                          {contract.city}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-[#6E5A4F] line-clamp-1">
                        {contract.description}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full border border-[#E2D5C1] bg-[#FFFDF9] px-2 py-0.5 font-display text-[10px] font-black text-[#854d0e]">
                    <Clock className="h-3 w-3" />
                    {contract.durationHours}H Route
                  </span>
                </div>

                {/* Guaranteed Rewards Pill Row */}
                <div className="mb-2.5 flex items-center gap-2 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] px-2.5 py-1.5 text-[10px] font-extrabold">
                  <span className="font-display text-[9px] font-black text-[#6E5A4F] uppercase">
                    Target Loot:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-[#2C1810]">
                    <span className="inline-flex items-center gap-1 text-[#7e22ce]">
                      📐 +{contract.rewards.blueprints} Blueprints
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#ea580c]">
                      🧩 +{contract.rewards.heroFragments} Frags
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[#0284c7]">
                      <SatoshiGemIcon size={12} />
                      +{contract.rewards.gems}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[#b45309]">
                      <HashrateIcon size={12} />
                      +{contract.rewards.hashrate}
                    </span>
                  </div>
                </div>

                {/* Hero Slots Assignment & Great Success Preview */}
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[10px] font-extrabold text-[#6E5A4F]">
                      Required Heroes:
                    </span>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: contract.requiredSlots }).map((_, slotIdx) => {
                        const assignedHeroId = isRunning
                          ? active!.assignedHeroIds[slotIdx]
                          : staged[slotIdx]
                        const heroCfg = assignedHeroId ? HERO_MAP[assignedHeroId] : null
                        const stars = assignedHeroId ? (heroStars[assignedHeroId] ?? 1) : 1

                        if (heroCfg) {
                          return (
                            <div
                              key={slotIdx}
                              className="group relative flex items-center gap-1.5 rounded-xl border-2 border-[#78350f] bg-gradient-to-b from-[#FFFDF9] to-[#F3E9D8] px-2 py-1 shadow-sm"
                            >
                              <div className="h-6 w-6">
                                <HeroChibiSvg heroId={heroCfg.id} size={24} />
                              </div>
                              <div>
                                <div className="font-display text-[9px] font-extrabold text-[#2C1810] leading-none">
                                  {heroCfg.name.split(' ')[0]}
                                </div>
                                <div className="text-[8px] font-black text-[#f59e0b] leading-none">
                                  {'★'.repeat(stars)}
                                </div>
                              </div>
                              {!isRunning && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHeroFromSlot(contract.id, slotIdx)}
                                  className="ml-1 text-[#ef4444] hover:text-[#b91c1c]"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          )
                        }

                        return (
                          <button
                            key={slotIdx}
                            type="button"
                            disabled={isRunning}
                            onClick={() =>
                              setSelectedSlotPicker({ contractId: contract.id, slotIndex: slotIdx })
                            }
                            className="flex items-center gap-1.5 rounded-xl border-2 border-dashed border-[#b45309] bg-[#FFFDF9] px-2.5 py-1 text-[10px] font-bold text-[#b45309] hover:bg-[#fffbeb] active:scale-95 transition-all"
                          >
                            <span>+ Assign Hero</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Great Success Pill */}
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 font-display text-[9px] font-black text-[#b45309]">
                      <Sparkles className="h-2.5 w-2.5 text-[#f59e0b]" />
                      Great Success: {greatSuccessPct}%
                    </span>
                    <span className="text-[8px] font-bold text-[#6E5A4F]">
                      1.5x Loot Multiplier
                    </span>
                  </div>
                </div>

                {/* Status & Action Control */}
                {isRunning ? (
                  <div className="space-y-2">
                    {/* Live Progress Bar */}
                    <div className="flex items-center justify-between font-display text-[10px] font-extrabold text-[#2C1810]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#b45309] animate-spin" />
                        {isReadyToClaim ? 'ARBITRAGE COMPLETE!' : `IN PROGRESS: ${formatRemainingTime(msRemaining)}`}
                      </span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full border border-[#E2D5C1] bg-[#F3E9D8] p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] via-[#10b981] to-[#3b82f6] transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {isReadyToClaim ? (
                        <button
                          type="button"
                          onClick={() => handleClaim(contract)}
                          className="flex-1 btn-3d-green py-2.5 font-display text-xs font-black uppercase text-white game-text-outline-sm animate-pulse shadow-lg"
                        >
                          🎁 Claim Arbitrage Loot!
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled
                            className="flex-1 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] py-2 text-center font-display text-xs font-bold text-[#6E5A4F]"
                          >
                            Contract Running ({formatRemainingTime(msRemaining)})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInstantSpeedUp(contract.id)}
                            className="btn-3d-gold px-3 py-2 font-display text-[10px] font-black text-white game-text-outline-sm shadow"
                            title="Instant speedup for QA testing or rewarded ads"
                          >
                            ⚡ Instant Finish (Test)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      disabled={staged.length < contract.requiredSlots}
                      onClick={() => handleDispatch(contract)}
                      className={`w-full py-2.5 rounded-2xl font-display text-xs font-black uppercase tracking-wider transition-all ${
                        staged.length >= contract.requiredSlots
                          ? 'btn-3d-gold text-white game-text-outline-sm shadow-md active:scale-98'
                          : 'border border-[#E2D5C1] bg-[#E5D7C5] text-[#8C7A6B] cursor-not-allowed'
                      }`}
                    >
                      {staged.length >= contract.requiredSlots
                        ? `🚀 Dispatch Heroes (${contract.durationHours}H)`
                        : `Assign ${contract.requiredSlots} Unequipped Hero${contract.requiredSlots > 1 ? 'es' : ''} to Dispatch`}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Hero Picker Dropdown / Modal Overlay */}
        {selectedSlotPicker && (
          <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/60 p-3 animate-fade-in">
            <div className="flex flex-col rounded-3xl border-2 border-[#3E2723] bg-[#FFFDF9] p-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2 mb-2">
                <span className="font-display text-xs font-black text-[#2C1810]">
                  SELECT UNEQUIPPED BENCH HERO
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSlotPicker(null)}
                  className="text-xs font-black text-[#6E5A4F]"
                >
                  Cancel
                </button>
              </div>

              {availableBenchHeroes.length === 0 ? (
                <div className="py-6 text-center text-xs font-semibold text-[#6E5A4F]">
                  No unequipped bench Heroes available!
                  <div className="text-[10px] text-[#b45309] mt-1">
                    Heroes currently equipped as your Main Trader or deployed on active expeditions cannot be assigned.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                  {availableBenchHeroes.map((hid) => {
                    const hCfg = HERO_MAP[hid]
                    const stars = heroStars[hid] ?? 1
                    const lvl = ownedHeroes[hid] ?? 1
                    return (
                      <button
                        key={hid}
                        type="button"
                        onClick={() =>
                          handleSelectHeroForSlot(
                            selectedSlotPicker.contractId,
                            selectedSlotPicker.slotIndex,
                            hid,
                          )
                        }
                        className="flex items-center gap-2 rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#FFFDF9] to-[#F3E9D8] p-2 hover:bg-[#fffbeb] active:scale-95 transition-all text-left"
                      >
                        <div className="h-8 w-8 shrink-0">
                          <HeroChibiSvg heroId={hid} size={32} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-display text-[10px] font-black text-[#2C1810] truncate">
                            {hCfg.name}
                          </div>
                          <div className="text-[9px] font-extrabold text-[#6E5A4F]">
                            Lv.{lvl} • <span className="text-[#f59e0b]">{'★'.repeat(stars)}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Claim Rewards Popup */}
        {claimResult && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
            <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border-[3px] border-[#3E2723] bg-[#FFFDF9] p-5 text-center shadow-2xl animate-pop-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-3xl shadow-lg mb-2">
                🎉
              </div>

              {claimResult.greatSuccess && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full border-2 border-[#166534] bg-[#4ade80] px-3 py-1 font-display text-xs font-black text-white game-text-outline-sm shadow animate-bounce">
                  <Sparkles className="h-4 w-4" />
                  GREAT SUCCESS! 1.5x BONUS LOOT!
                </div>
              )}

              <h3 className="font-display text-base font-black text-[#2C1810]">
                {claimResult.contractTitle} Complete!
              </h3>
              <p className="text-[11px] font-semibold text-[#6E5A4F] mb-4">
                Your offshore arbitrage operations returned with massive profits:
              </p>

              {/* Rewards Grid */}
              <div className="grid w-full grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-2">
                  <span className="text-xl">📐</span>
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-[#7e22ce]">
                      +{claimResult.rewards.blueprints}
                    </div>
                    <div className="text-[9px] font-semibold text-[#6E5A4F]">Blueprints</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-2">
                  <span className="text-xl">🧩</span>
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-[#ea580c]">
                      +{claimResult.rewards.heroFragments}
                    </div>
                    <div className="text-[9px] font-semibold text-[#6E5A4F]">Hero Frags</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-2">
                  <SatoshiGemIcon size={20} />
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-[#0284c7]">
                      +{claimResult.rewards.gems}
                    </div>
                    <div className="text-[9px] font-semibold text-[#6E5A4F]">Satoshi Gems</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-2">
                  <HashrateIcon size={20} />
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-[#b45309]">
                      +{fmtNum(claimResult.rewards.hashrate)}
                    </div>
                    <div className="text-[9px] font-semibold text-[#6E5A4F]">Hashrate</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setClaimResult(null)}
                className="btn-3d-green w-full py-2.5 font-display text-xs font-black uppercase tracking-wider text-white game-text-outline-sm shadow-md"
              >
                Collect Loot &amp; Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
