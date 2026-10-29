import React, { useState } from 'react'
import {
  type RigItem,
  RIG_SLOT_CONFIG,
  RIG_RARITY_CONFIG,
  RIG_CORPORATE_SETS,
  getRigItemUpgradeCost,
  REFORGE_COST,
} from '../../config/equipment.config'
import { useMetaStore } from '../../state/useMetaStore'
import { AudioSynth } from '../../engine/AudioSynth'
import { AudioHaptics } from '../../utils/audioHaptics'
import {
  X,
  Zap,
  Wrench,
  Trash2,
  ArrowUpCircle,
  RefreshCw,
} from 'lucide-react'

interface RigEquipmentModalProps {
  item: RigItem
  isEquipped: boolean
  onClose: () => void
  onItemChanged?: (updatedItem: RigItem | null) => void
}

export const RigEquipmentModal: React.FC<RigEquipmentModalProps> = ({
  item: initialItem,
  isEquipped,
  onClose,
  onItemChanged,
}) => {
  const meta = useMetaStore()
  const [selectedAffixIndex, setSelectedAffixIndex] = useState<number>(0)
  const [isReforging, setIsReforging] = useState(false)
  const [reforgeSuccess, setReforgeSuccess] = useState(false)

  // Find latest live item from store
  const liveItem: RigItem =
    (isEquipped
      ? meta.equippedRig[initialItem.slot]
      : meta.rigInventory.find((i) => i.id === initialItem.id)) ?? initialItem

  const slotMeta = RIG_SLOT_CONFIG[liveItem.slot]
  const rarityMeta = RIG_RARITY_CONFIG[liveItem.rarity]
  const corporateSet = liveItem.setId ? RIG_CORPORATE_SETS[liveItem.setId] : null
  const upgradeCost = getRigItemUpgradeCost(liveItem)
  const canUpgrade =
    liveItem.level < rarityMeta.maxLevel &&
    meta.hashrate >= upgradeCost.hashrate &&
    (meta.solderWire ?? 0) >= upgradeCost.solderWire

  const canReforge =
    liveItem.secondaryAffixes.length > 0 &&
    (meta.solderWire ?? 0) >= REFORGE_COST.solderWire &&
    meta.hashrate >= REFORGE_COST.hashrate

  const handleEquipToggle = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    AudioHaptics.vibrateGreenTick()
    if (isEquipped) {
      meta.unequipRigItem(liveItem.slot)
      onItemChanged?.(null)
      onClose()
    } else {
      meta.equipRigItem(liveItem)
      onItemChanged?.(liveItem)
      onClose()
    }
  }

  const handleUpgrade = () => {
    if (!canUpgrade) return
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    AudioHaptics.vibrateGreenTick()
    const ok = meta.upgradeRigItem(liveItem.id)
    if (ok) {
      const updated = isEquipped
        ? meta.equippedRig[liveItem.slot]
        : meta.rigInventory.find((i) => i.id === liveItem.id)
      if (updated) onItemChanged?.(updated)
    }
  }

  const handleReforge = () => {
    if (!canReforge || isReforging) return
    AudioSynth.unlock()
    setIsReforging(true)
    AudioHaptics.playCounterPump()
    AudioHaptics.vibrateCounterPump()

    window.setTimeout(() => {
      const ok = meta.reforgeRigItemAffix(liveItem.id, selectedAffixIndex)
      setIsReforging(false)
      if (ok) {
        setReforgeSuccess(true)
        AudioSynth.playGreenCandle()
        window.setTimeout(() => setReforgeSuccess(false), 1600)
        const updated = isEquipped
          ? meta.equippedRig[liveItem.slot]
          : meta.rigInventory.find((i) => i.id === liveItem.id)
        if (updated) onItemChanged?.(updated)
      }
    }, 450)
  }

  const handleSalvage = () => {
    AudioSynth.unlock()
    AudioSynth.playRedDump()
    AudioHaptics.vibrateRedCounter()
    meta.salvageRigItem(liveItem.id)
    onItemChanged?.(null)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3.5 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[370px] flex-col overflow-hidden rounded-3xl border-[3.5px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] shadow-[0_16px_40px_rgba(44,24,16,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div
          className={`flex items-center justify-between border-b-2 border-[#3E2723] bg-gradient-to-r ${rarityMeta.bgGradient} px-4 py-3`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-white text-2xl shadow-inner"
              style={{ borderColor: rarityMeta.borderColor }}
            >
              {slotMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`rounded-md border px-1.5 py-0.2 font-display text-[9px] font-black uppercase tracking-wider ${rarityMeta.badgeBg}`}
                >
                  {rarityMeta.name}
                </span>
                <span className="font-display text-[10px] font-black text-[#6E5A4F]">
                  {slotMeta.shortName} • Lv.{liveItem.level}/{rarityMeta.maxLevel}
                </span>
                {isEquipped && (
                  <span className="rounded-md border border-emerald-600 bg-emerald-500 px-1.5 py-0.2 font-display text-[9px] font-black uppercase text-white shadow-xs">
                    ✓ Equipped
                  </span>
                )}
              </div>
              <h3 className="font-display text-sm font-black text-[#2C1810] leading-tight">
                {liveItem.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] text-[#6E5A4F] transition active:scale-95 hover:bg-[#F3E9D8]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[70vh]">
          {/* Corporate Set Badge */}
          {corporateSet && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/90 px-3 py-1.5 text-[10px]">
              <div className="flex items-center gap-1.5 font-display font-black text-emerald-900">
                <span>{corporateSet.icon}</span>
                <span>{corporateSet.name}</span>
              </div>
              <span className="font-display font-bold text-emerald-700">
                {corporateSet.twoPieceBonus.label}
              </span>
            </div>
          )}

          {/* Flavor Text */}
          <p className="text-[11px] font-medium italic text-[#6E5A4F] leading-snug">
            "{liveItem.flavor}"
          </p>

          {/* Primary Stat Card */}
          <div className="rounded-2xl border-2 border-[#3E2723] bg-gradient-to-r from-amber-50 to-orange-50 p-3 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-display font-black uppercase text-[#92400E]">
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-600 fill-current" />
                Primary Core Specification
              </span>
              <span>Lv.{liveItem.level}</span>
            </div>
            <div className="mt-1 font-display text-base font-black text-[#2C1810]">
              {liveItem.primaryStat.label}
            </div>
            <div className="mt-0.5 text-[10px] font-bold text-[#78350F]">
              {slotMeta.description}
            </div>
          </div>

          {/* Secondary Affixes & Reforging Section */}
          <div className="rounded-2xl border-2 border-[#3E2723] bg-[#F7F3EB] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-display text-[10px] font-black uppercase text-[#2C1810]">
                <Wrench className="h-3.5 w-3.5 text-[#b45309]" />
                Secondary Affixes (Tap to Reforge)
              </span>
              <span className="font-display text-[9px] font-bold text-[#6E5A4F]">
                🧵 {meta.solderWire ?? 0} Solder Wire
              </span>
            </div>

            {liveItem.secondaryAffixes.length === 0 ? (
              <div className="text-center py-2 text-[11px] font-bold text-[#8C7A6B]">
                No secondary affixes on Common gear.
              </div>
            ) : (
              <div className="space-y-1.5">
                {liveItem.secondaryAffixes.map((affix, idx) => {
                  const isSelected = selectedAffixIndex === idx
                  return (
                    <button
                      key={affix.id}
                      type="button"
                      onClick={() => setSelectedAffixIndex(idx)}
                      className={`flex w-full items-center justify-between rounded-xl border-2 px-3 py-2 text-left transition ${
                        isSelected
                          ? 'border-[#0284c7] bg-[#eff6ff] shadow-xs'
                          : 'border-[#E2D5C1] bg-[#FFFDF9] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${
                            isSelected
                              ? 'bg-[#0284c7] text-white'
                              : 'bg-[#E2D5C1] text-[#6E5A4F]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-display text-[11px] font-black text-[#2C1810]">
                          {affix.label}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="font-display text-[9px] font-black uppercase text-[#0284c7]">
                          Selected
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Reforge Action Button */}
            {liveItem.secondaryAffixes.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  disabled={!canReforge || isReforging}
                  onClick={handleReforge}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-display font-black uppercase transition active:scale-98 ${
                    canReforge && !isReforging
                      ? 'btn-3d-cyan text-white shadow-xs'
                      : 'border border-[#E2D5C1] bg-[#E2D5C1] text-[#8C7A6B] cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${isReforging ? 'animate-spin' : ''}`} />
                    <span>{reforgeSuccess ? '✓ REFORGED!' : 'REFORGE SELECTED AFFIX'}</span>
                  </span>
                  <span className="text-[10px]">
                    🧵 {REFORGE_COST.solderWire} • ⚡ {REFORGE_COST.hashrate}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Level Up & Star Upgrade Section */}
          <div className="rounded-2xl border-2 border-[#3E2723] bg-[#FFFDF9] p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-display font-black uppercase text-[#2C1810]">
              <span className="flex items-center gap-1">
                <ArrowUpCircle className="h-3.5 w-3.5 text-[#16a34a]" />
                Hardware Overclock Level
              </span>
              <span>
                Lv.{liveItem.level} / {rarityMeta.maxLevel}
              </span>
            </div>

            <button
              type="button"
              disabled={!canUpgrade}
              onClick={handleUpgrade}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-display font-black uppercase transition active:scale-98 ${
                canUpgrade
                  ? 'btn-3d-green text-white shadow-xs'
                  : 'border border-[#E2D5C1] bg-[#E2D5C1] text-[#8C7A6B] cursor-not-allowed'
              }`}
            >
              <span>
                {liveItem.level >= rarityMeta.maxLevel
                  ? 'MAX LEVEL OVERCLOCK'
                  : `LEVEL UP (Lv.${liveItem.level} → ${liveItem.level + 1})`}
              </span>
              {liveItem.level < rarityMeta.maxLevel && (
                <span className="text-[10px]">
                  ⚡ {upgradeCost.hashrate.toLocaleString()} • 🧵 {upgradeCost.solderWire}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions: Equip/Unequip & Salvage */}
        <div className="border-t-2 border-[#3E2723] bg-[#F7F3EB] p-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSalvage}
            title="Salvage into Solder Wire"
            className="flex items-center justify-center gap-1 rounded-2xl border-2 border-[#3E2723] bg-rose-100 hover:bg-rose-200 px-3 py-2.5 font-display text-xs font-black text-rose-900 shadow-xs active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>SALVAGE (+{rarityMeta.salvageSolderWire}🧵)</span>
          </button>

          <button
            type="button"
            onClick={handleEquipToggle}
            className={`flex-1 rounded-2xl py-2.5 font-display text-xs font-black uppercase shadow-xs transition active:scale-98 ${
              isEquipped
                ? 'border-2 border-[#78350f] bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'btn-3d-gold text-white'
            }`}
          >
            {isEquipped ? 'Unequip Part' : 'Equip into Rig'}
          </button>
        </div>
      </div>
    </div>
  )
}
