import React, { useState } from 'react'
import {
  type RigItem,
  type RigSlot,
  type RigSetId,
  RIG_SLOT_CONFIG,
  RIG_RARITY_CONFIG,
  RIG_CORPORATE_SETS,
} from '../../config/equipment.config'
import { useMetaStore } from '../../state/useMetaStore'
import { AudioSynth } from '../../engine/AudioSynth'
import { AudioHaptics } from '../../utils/audioHaptics'
import { RigEquipmentModal } from '../modals/RigEquipmentModal'
import {
  Cpu,
  Zap,
  Shield,
  Activity,
  Layers,
  Wrench,
  Check,
  TrendingUp,
  Flame,
  Award,
} from 'lucide-react'

const RIG_SLOTS_ORDER: RigSlot[] = [
  'gpu',
  'cooling_fan',
  'power_supply',
  'motherboard',
  'ssd',
  'asic_processor',
]

export const MiningRigPanel: React.FC = () => {
  const meta = useMetaStore()
  const equippedRig = meta.equippedRig ?? {}
  const rigInventory = meta.rigInventory ?? []
  const solderWire = meta.solderWire ?? 0

  const [_selectedSlot, setSelectedSlot] = useState<RigSlot | null>(null)
  const [inspectItem, setInspectItem] = useState<{ item: RigItem; isEquipped: boolean } | null>(
    null,
  )
  const [filterSlot, setFilterSlot] = useState<string>('all')

  const aggregatedStats = meta.getEquippedRigStats()
  const activeSets = meta.getActiveSetBonuses()

  const handleSlotClick = (slot: RigSlot) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    AudioHaptics.vibrateGreenTick()
    const equipped = equippedRig[slot]
    if (equipped) {
      setInspectItem({ item: equipped, isEquipped: true })
    } else {
      setSelectedSlot(slot)
      setFilterSlot(slot)
    }
  }

  const handleInventoryItemClick = (item: RigItem) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    AudioHaptics.vibrateGreenTick()
    setInspectItem({ item, isEquipped: false })
  }

  const filteredInventory = rigInventory.filter(
    (item) => filterSlot === 'all' || item.slot === filterSlot,
  )

  return (
    <div className="flex flex-col gap-3 pb-8 select-none">
      {/* ── 1. Top Power Score & Solder Wire Stats Banner ── */}
      <div className="rounded-3xl border-[3px] border-[#3E2723] border-b-[5px] bg-[#FFFDF9] p-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2.5">
          <div>
            <span className="font-display text-[10px] font-black uppercase tracking-wider text-[#9a3412]">
              MINING RIG CHASSIS POWER
            </span>
            <div className="flex items-center gap-1.5 font-display text-lg font-black text-[#2C1810]">
              <Cpu className="h-5 w-5 text-amber-600 stroke-[2.5]" />
              <span>{aggregatedStats.totalPowerScore.toLocaleString()} RIG RATING</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-display text-[9px] font-black uppercase text-[#6E5A4F]">
              REFORGE MATERIAL
            </span>
            <div className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-display text-xs font-black text-amber-900 shadow-xs">
              <span>🧵 {solderWire} Solder Wire</span>
            </div>
          </div>
        </div>

        {/* Core Stat Aggregate Pills */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[10px] font-display font-extrabold text-[#2C1810]">
          <div className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/70 p-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-600 fill-current" />
            <span>+{aggregatedStats.flatAtk} Flat ATK</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-cyan-200 bg-cyan-50/70 p-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-600" />
            <span>+{aggregatedStats.tickSpeedPct}% Tick Rate</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50/70 p-1.5">
            <Shield className="h-3.5 w-3.5 text-amber-600 fill-current" />
            <span>+{aggregatedStats.flatHp} Base HP</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50/70 p-1.5">
            <Layers className="h-3.5 w-3.5 text-purple-600" />
            <span>+{aggregatedStats.overdriveCap} Overdrive</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/70 p-1.5">
            <Flame className="h-3.5 w-3.5 text-rose-600 fill-current" />
            <span>+{aggregatedStats.critChance}% Crit ({aggregatedStats.critMultiplier}x)</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50/70 p-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-orange-600" />
            <span>+${aggregatedStats.startingCash} Start Cash</span>
          </div>
        </div>
      </div>

      {/* ── 2. Corporate Set Bonuses Tracker Card ── */}
      <div className="rounded-2xl border-2 border-[#3E2723] bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#1c1917] p-3 text-white shadow-md">
        <div className="flex items-center justify-between border-b border-stone-700/80 pb-1.5">
          <span className="flex items-center gap-1.5 font-display text-[10px] font-black uppercase tracking-wider text-amber-400">
            <Award className="h-3.5 w-3.5" />
            Corporate Hardware Protocol Set Bonuses
          </span>
          <span className="text-[9px] font-bold text-stone-400">
            {activeSets.length} Active
          </span>
        </div>

        <div className="mt-2 space-y-1.5">
          {(Object.keys(RIG_CORPORATE_SETS) as RigSetId[]).map((setId) => {
            const setCfg = RIG_CORPORATE_SETS[setId]
            const activeSet = activeSets.find((s) => s.setId === setId)
            const count = activeSet?.pieces ?? 0
            const twoPieceActive = count >= 2
            const fourPieceActive = count >= 4

            return (
              <div
                key={setId}
                className={`flex items-center justify-between rounded-xl border p-2 transition ${
                  twoPieceActive
                    ? 'border-emerald-500/80 bg-emerald-950/40'
                    : 'border-stone-800 bg-stone-900/60 opacity-65'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{setCfg.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-[11px] font-black text-white">
                        {setCfg.name}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 font-display text-[9px] font-black ${
                          twoPieceActive
                            ? 'bg-emerald-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {count}/4 Pieces
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold text-stone-300">
                      (2) {setCfg.twoPieceBonus.label}
                      {setCfg.fourPieceBonus && ` • (4) ${setCfg.fourPieceBonus.label}`}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {twoPieceActive ? (
                    <span className="flex items-center gap-1 font-display text-[9px] font-black uppercase text-emerald-400">
                      <Check className="h-3 w-3 stroke-[3]" /> {fourPieceActive ? '4-Pc Active' : '2-Pc Active'}
                    </span>
                  ) : (
                    <span className="font-display text-[9px] font-bold text-stone-500 uppercase">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 3. Cybernetic 6-Slot Rig Chassis Grid ── */}
      <div className="rounded-3xl border-[3px] border-[#3E2723] border-b-[5px] bg-[#FFFDF9] p-3.5 shadow-md">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-display text-xs font-black uppercase tracking-wider text-[#2C1810]">
            INSTALLED RIG HARDWARE (6 SLOTS)
          </span>
          <span className="text-[10px] font-extrabold text-[#9a3412]">
            Tap slot to inspect or reforge
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {RIG_SLOTS_ORDER.map((slot) => {
            const slotMeta = RIG_SLOT_CONFIG[slot]
            const item = equippedRig[slot]
            const rarityMeta = item ? RIG_RARITY_CONFIG[item.rarity] : null

            return (
              <div
                key={slot}
                data-tutorial={`rig-slot-${slot}`}
                onClick={() => handleSlotClick(slot)}
                className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 transition active:scale-[0.98] cursor-pointer shadow-xs ${
                  item && rarityMeta
                    ? `border-[#3E2723] bg-gradient-to-b ${rarityMeta.bgGradient} hover:border-[#0284c7]`
                    : 'border-dashed border-[#B89B7A] bg-[#F7F3EB]/80 hover:border-[#3E2723]'
                }`}
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{slotMeta.icon}</span>
                    <span className="font-display text-[10px] font-black uppercase text-[#6E5A4F]">
                      {slotMeta.shortName}
                    </span>
                  </div>
                  {item && rarityMeta ? (
                    <span
                      className={`rounded-md border px-1.5 py-0.2 font-display text-[9px] font-black uppercase ${rarityMeta.badgeBg}`}
                    >
                      Lv.{item.level}
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#E2D5C1] px-1.5 py-0.2 font-display text-[8.5px] font-black uppercase text-[#8C7A6B]">
                      EMPTY
                    </span>
                  )}
                </div>

                {/* Item Details or Empty Prompt */}
                {item && rarityMeta ? (
                  <div className="my-2">
                    <h4 className="font-display text-xs font-black text-[#2C1810] line-clamp-1 leading-tight">
                      {item.name}
                    </h4>
                    <div className="mt-1 font-display text-[10px] font-extrabold text-[#78350F] line-clamp-1">
                      {item.primaryStat.label}
                    </div>
                    {item.setId && (
                      <div className="mt-1 flex items-center gap-1 font-display text-[9px] font-bold text-emerald-800">
                        <span>{RIG_CORPORATE_SETS[item.setId]?.icon}</span>
                        <span className="truncate">{RIG_CORPORATE_SETS[item.setId]?.name}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="my-3 text-center">
                    <div className="font-display text-[10px] font-extrabold text-[#8C7A6B]">
                      + Tap to Equip
                    </div>
                  </div>
                )}

                {/* Slot Footer Action Cue */}
                <div className="border-t border-[#3E2723]/10 pt-1 text-right font-display text-[9px] font-black text-[#9a3412]">
                  {item ? 'Inspect / Reforge →' : 'Install Part'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 4. Rig Hardware Inventory Drawer ── */}
      <div className="rounded-3xl border-[3px] border-[#3E2723] border-b-[5px] bg-[#FFFDF9] p-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2">
          <div className="flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-[#9a3412]" />
            <span className="font-display text-xs font-black uppercase text-[#2C1810]">
              HARDWARE INVENTORY ({rigInventory.length})
            </span>
          </div>
          <span className="font-display text-[10px] font-bold text-[#6E5A4F]">
            Tap to equip or salvage
          </span>
        </div>

        {/* Filter Pills */}
        <div className="my-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilterSlot('all')}
            className={`shrink-0 rounded-xl px-2.5 py-1 font-display text-[10px] font-black uppercase transition ${
              filterSlot === 'all'
                ? 'border-2 border-[#3E2723] bg-[#FEF08A] text-[#2C1810] shadow-xs'
                : 'border border-[#E2D5C1] bg-[#F7F3EB] text-[#6E5A4F]'
            }`}
          >
            All ({rigInventory.length})
          </button>
          {RIG_SLOTS_ORDER.map((slot) => {
            const count = rigInventory.filter((i) => i.slot === slot).length
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setFilterSlot(slot)}
                className={`shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1 font-display text-[10px] font-black uppercase transition ${
                  filterSlot === slot
                    ? 'border-2 border-[#3E2723] bg-[#FEF08A] text-[#2C1810] shadow-xs'
                    : 'border border-[#E2D5C1] bg-[#F7F3EB] text-[#6E5A4F]'
                }`}
              >
                <span>{RIG_SLOT_CONFIG[slot].icon}</span>
                <span>{RIG_SLOT_CONFIG[slot].shortName} ({count})</span>
              </button>
            )
          })}
        </div>

        {/* Inventory Item Grid */}
        {filteredInventory.length === 0 ? (
          <div className="text-center py-6 text-xs font-bold text-[#8C7A6B]">
            No unequipped hardware in this category. Complete Campaign runs or Salvage to acquire more!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto pr-1">
            {filteredInventory.map((item) => {
              const rarityMeta = RIG_RARITY_CONFIG[item.rarity]
              const slotMeta = RIG_SLOT_CONFIG[item.slot]
              const setCfg = item.setId ? RIG_CORPORATE_SETS[item.setId] : null

              return (
                <div
                  key={item.id}
                  onClick={() => handleInventoryItemClick(item)}
                  className={`flex items-center justify-between rounded-2xl border-2 border-[#3E2723] bg-gradient-to-r ${rarityMeta.bgGradient} p-2.5 transition active:scale-[0.98] cursor-pointer hover:border-[#0284c7] shadow-xs`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-white text-xl shadow-inner"
                      style={{ borderColor: rarityMeta.borderColor }}
                    >
                      {slotMeta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`rounded-md border px-1.5 py-0.2 font-display text-[8.5px] font-black uppercase ${rarityMeta.badgeBg}`}
                        >
                          {rarityMeta.name}
                        </span>
                        <span className="font-display text-[9.5px] font-black text-[#6E5A4F]">
                          Lv.{item.level}
                        </span>
                        {setCfg && (
                          <span className="flex items-center gap-0.5 rounded bg-emerald-100 px-1 py-0.2 font-display text-[8.5px] font-bold text-emerald-800">
                            {setCfg.icon} {setCfg.name}
                          </span>
                        )}
                      </div>
                      <h5 className="font-display text-xs font-black text-[#2C1810] truncate leading-tight">
                        {item.name}
                      </h5>
                      <p className="font-display text-[10px] font-bold text-[#78350F] truncate">
                        {item.primaryStat.label}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <span className="btn-3d-gold px-2.5 py-1 font-display text-[10px] font-black uppercase text-white shadow-xs">
                      Equip
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Equipment Inspector & Reforge Modal */}
      {inspectItem && (
        <RigEquipmentModal
          item={inspectItem.item}
          isEquipped={inspectItem.isEquipped}
          onClose={() => setInspectItem(null)}
          onItemChanged={() => {
            // State automatically synced from Zustand
          }}
        />
      )}
    </div>
  )
}
