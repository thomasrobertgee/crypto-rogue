import React, { useMemo } from 'react'
import { Sparkles, Star } from 'lucide-react'
import {
  RUN_SKILLS,
  MAX_SKILL_STARS,
  getHybridStarSlots,
  getSkillTierEffect,
  getEligibleMythicSkillEvolutions,
  getPartnerSkillForSynergy,
  type RunSkillConfig,
  type RunSkillRarity,
  type MythicSkillEvolutionConfig,
} from '../../config/runSkills.config'
import {
  getEligibleEvolutions,
  type EvolutionConfig,
} from '../../config/evolutions.config'
import { useRunStore } from '../../state/useRunStore'
import { useMetaStore } from '../../state/useMetaStore'
import { DynamicIcon } from '../DynamicIcon'
import { AudioSynth } from '../../engine/AudioSynth'

const RARITY_STYLES: Record<
  RunSkillRarity,
  {
    badge: string
    frame: string
    headerBg: string
    glow: string
    label: string
  }
> = {
  common: {
    badge: 'bg-emerald-600 text-white border-emerald-400 font-black',
    frame:
      'border-2 border-emerald-400 bg-gradient-to-b from-emerald-500/15 via-teal-400/10 to-emerald-600/20 shadow-[0_0_10px_rgba(52,211,153,0.2)] ring-1 ring-emerald-300/40 hover:brightness-105',
    headerBg: 'bg-emerald-700/15 border-emerald-700/30',
    glow: 'shadow-[0_0_10px_rgba(52,211,153,0.2)]',
    label: 'COMMON',
  },
  rare: {
    badge: 'bg-sky-600 text-white border-sky-400 font-black',
    frame:
      'border-2 border-sky-400 bg-gradient-to-b from-sky-500/15 via-cyan-400/10 to-blue-600/20 shadow-[0_0_12px_rgba(56,189,248,0.25)] ring-1 ring-sky-300/40 hover:brightness-105',
    headerBg: 'bg-sky-700/15 border-sky-700/30',
    glow: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    label: 'RARE',
  },
  epic: {
    badge: 'bg-purple-600 text-white border-purple-400 font-black',
    frame:
      'border-2 border-purple-400 bg-gradient-to-b from-purple-900/15 via-purple-600/10 to-violet-800/20 shadow-[0_0_12px_rgba(192,132,252,0.3)] ring-1 ring-purple-300/50 hover:brightness-105',
    headerBg: 'bg-purple-700/15 border-purple-700/30',
    glow: 'shadow-[0_0_12px_rgba(192,132,252,0.3)]',
    label: 'EPIC',
  },
  legendary: {
    badge: 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 font-black',
    frame:
      'border-2 border-amber-400 bg-gradient-to-b from-amber-500/15 via-yellow-400/10 to-amber-600/20 shadow-[0_0_15px_rgba(251,191,36,0.35)] ring-1 ring-amber-300/50 hover:brightness-105',
    headerBg: 'bg-amber-600/20 border-amber-700/40',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.35)]',
    label: 'LEGENDARY',
  },
  mythical: {
    badge: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400 font-black',
    frame:
      'border-2 border-rose-400 bg-gradient-to-b from-rose-500/20 via-pink-500/15 to-rose-700/25 shadow-[0_0_16px_rgba(244,63,94,0.4)] ring-1 ring-rose-300/50 hover:brightness-105',
    headerBg: 'bg-rose-600/20 border-rose-700/40',
    glow: 'shadow-[0_0_16px_rgba(244,63,94,0.4)]',
    label: 'MYTHICAL',
  },
}

/**
 * Renders the 0..6 Hybrid Star Tier display:
 * - 0 Stars: ☆☆☆
 * - 1 Star:  ★☆☆
 * - 2 Stars: ★★☆
 * - 3 Stars: ★★★
 * - 4 Stars: 🔴★★ (1 Red Star + 2 Gold Stars)
 * - 5 Stars: 🔴🔴★ (2 Red Stars + 1 Gold Star)
 * - 6 Stars: 🔴🔴🔴 (3 Red Stars)
 */
export const HybridStarBadge: React.FC<{ stars: number; size?: 'sm' | 'md' }> = ({
  stars,
  size = 'md',
}) => {
  const slots = getHybridStarSlots(stars)
  const iconCls = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
  const textCls = size === 'sm' ? 'text-[10px]' : 'text-[11px]'

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-[#3E2723]/40 bg-[#FFFDF9] px-2 py-0.5 shadow-2xs"
      title={`${stars} Star Tier`}
    >
      {slots.map((slotType, idx) => {
        if (slotType === 'red') {
          return (
            <span
              key={idx}
              className={`inline-flex items-center justify-center leading-none ${textCls} drop-shadow-[0_1px_2px_rgba(225,29,72,0.5)]`}
            >
              🔴
            </span>
          )
        }
        if (slotType === 'gold') {
          return (
            <Star
              key={idx}
              className={`${iconCls} fill-[#facc15] text-[#422006] stroke-[2.2]`}
            />
          )
        }
        return (
          <Star
            key={idx}
            className={`${iconCls} fill-transparent text-[#a8a29e] stroke-[2]`}
          />
        )
      })}
    </div>
  )
}

interface SkillDraftModalProps {
  onPicked?: (skillId: string) => void
}

type DraftItem =
  | { kind: 'mythicEvolution'; data: MythicSkillEvolutionConfig }
  | { kind: 'evolution'; data: EvolutionConfig }
  | { kind: 'skill'; data: RunSkillConfig }

export const SkillDraftModal: React.FC<SkillDraftModalProps> = ({ onPicked }) => {
  const pendingDrafts = useRunStore((s) => s.pendingSkillDrafts)
  const runLevel = useRunStore((s) => s.runLevel)
  const activeRunSkills = useRunStore((s) => s.activeRunSkills)
  const activeMythicEvolutions = useRunStore((s) => s.activeMythicEvolutions)
  const selectRunSkill = useRunStore((s) => s.selectRunSkill)
  const selectMythicEvolution = useRunStore((s) => s.selectMythicEvolution)
  const evolveCoin = useRunStore((s) => s.evolveCoin)

  // Roll 3 choices: guarantee fused Mythic Skill Evolution if both prerequisites are held, then Golden Hard-Fork Evolution, else regular skills
  const choices = useMemo<DraftItem[]>(() => {
    if (pendingDrafts <= 0) return []
    const meta = useMetaStore.getState()
    const equippedCoinIds = meta.equippedCoinIds
    const ownedCoins = meta.ownedCoins
    const runRelics = useRunStore.getState().runRelics
    const evolvedCoins = useRunStore.getState().evolvedCoins

    const picked: DraftItem[] = []

    // 1. Guarantee fused Mythic Skill Evolution when both prerequisite skills are held
    const eligibleMythics = getEligibleMythicSkillEvolutions(
      activeRunSkills,
      activeMythicEvolutions ?? [],
    )
    for (const mythic of eligibleMythics) {
      if (picked.length < 2) {
        picked.push({ kind: 'mythicEvolution', data: mythic })
      }
    }

    // 2. Check Golden Hard-Fork Coin Evolution
    const eligibleEvos = getEligibleEvolutions({
      equippedCoinIds,
      ownedCoins,
      activeRunSkills,
      runRelics,
      evolvedCoins,
    })

    if (eligibleEvos.length > 0 && picked.length < 3) {
      picked.push({ kind: 'evolution', data: eligibleEvos[0] })
    }

    const eligibleSkills = RUN_SKILLS.filter(
      (sk) => (activeRunSkills[sk.id] ?? 0) < MAX_SKILL_STARS,
    )
    const pool = [...eligibleSkills]
    while (picked.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length)
      picked.push({ kind: 'skill', data: pool.splice(idx, 1)[0] })
    }
    return picked
    // Re-roll whenever pendingDrafts changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDrafts, runLevel, activeRunSkills, activeMythicEvolutions])

  if (pendingDrafts <= 0 || choices.length === 0) return null

  const handleSelectSkill = (skillId: string) => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    selectRunSkill(skillId)
    onPicked?.(skillId)
  }

  const handleSelectMythic = (mythicId: string) => {
    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    selectMythicEvolution(mythicId)
    onPicked?.(mythicId)
  }

  const handleSelectEvolution = (evo: EvolutionConfig) => {
    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    evolveCoin(evo.id, evo.baseCoinId)
    onPicked?.(evo.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 select-none">
      <div className="w-[92%] max-w-[430px] rounded-3xl border-[3.5px] border-[#3E2723] border-b-[7px] bg-gradient-to-b from-[#FFFDF9] via-[#FEF3C7] to-[#FDE68A] p-4 sm:p-5 shadow-2xl text-[#2C1810]">
        {/* Arcade Header Redesign */}
        <div className="flex flex-col items-center text-center mb-3.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-500/15 px-3 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>ENGINE LEVEL {runLevel}</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-black uppercase tracking-wide text-[#2C1810] drop-shadow-xs">
            ALGO STRATEGY DRAFT
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#78350f]">
            Select an algorithm to inject into your trading engine
          </p>
        </div>

        {/* 3 Vertical / Tactile Skill Draft Cards */}
        <div className="space-y-3">
          {choices.map((item) => {
            if (item.kind === 'mythicEvolution') {
              const mythic = item.data
              return (
                <button
                  key={mythic.id}
                  type="button"
                  onClick={() => handleSelectMythic(mythic.id)}
                  className="group relative w-full rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] border-2 border-rose-400 bg-gradient-to-b from-rose-500/20 via-pink-500/15 to-rose-700/25 shadow-[0_0_20px_rgba(244,63,94,0.45)] ring-2 ring-rose-400/80 hover:brightness-105"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#881337] bg-gradient-to-b from-[#facc15] via-[#fb7185] to-[#e11d48] shadow-md">
                      <DynamicIcon name={mythic.icon} className="h-7 w-7 text-white" />
                      <span className="absolute -top-2 -left-2 rounded-full border border-[#4c0519] bg-[#facc15] px-2 py-0.5 font-display text-[9px] font-black text-[#451a03] shadow animate-bounce">
                        MYTHIC!
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="rounded-full border border-[#4c0519] bg-gradient-to-r from-[#e11d48] via-[#db2777] to-[#d97706] px-2.5 py-0.5 font-display text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                          🌟 MYTHIC EVOLUTION
                        </span>
                        <span className="rounded-full border border-[#78350f] bg-[#fef08a] px-2 py-0.2 font-display text-[8.5px] font-black text-[#78350f]">
                          SYNERGY FUSION
                        </span>
                      </div>

                      <div className="font-display text-[15px] font-black text-[#881337] leading-tight">
                        🌟 {mythic.name}
                      </div>
                      <p className="mt-1 text-[14px] leading-snug font-medium text-slate-800">
                        {mythic.description}
                      </p>
                      <div className="mt-1.5 font-display text-[9.5px] font-extrabold text-[#9f1239]">
                        Fused: {mythic.prereqSkillNames[0]} + {mythic.prereqSkillNames[1]}
                      </div>
                    </div>
                  </div>
                </button>
              )
            }

            if (item.kind === 'evolution') {
              const evo = item.data
              return (
                <button
                  key={evo.id}
                  type="button"
                  onClick={() => handleSelectEvolution(evo)}
                  className="group relative w-full rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] border-2 border-amber-400 bg-gradient-to-b from-amber-500/20 via-yellow-400/15 to-amber-600/25 shadow-[0_0_18px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/80 hover:brightness-105"
                >
                  <div className="flex items-start gap-3">
                    {/* Left Emblem */}
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#fef08a] to-[#f59e0b] shadow-md">
                      <DynamicIcon name={evo.icon} className="h-7 w-7 text-[#451a03]" />
                      <span className="absolute -top-2 -left-2 rounded-full border border-[#78350f] bg-[#e11d48] px-2 py-0.5 font-display text-[9px] font-black text-white shadow animate-pulse">
                        EVO!
                      </span>
                    </div>

                    {/* Center Name, Category, & Description */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="rounded-full border border-[#78350f] bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 px-2.5 py-0.5 font-display text-[9.5px] font-black uppercase tracking-wider text-white shadow-xs">
                          ⚡ GOLDEN HARD-FORK
                        </span>
                        <span className="rounded-full border border-[#78350f] bg-[#451a03] px-2 py-0.2 font-display text-[8.5px] font-black text-[#fde047]">
                          2x SPEED + MEGA
                        </span>
                      </div>

                      <div className="font-display text-[15px] font-black text-[#451a03] leading-tight">
                        {evo.name} ({evo.ticker})
                      </div>
                      <p className="mt-1 text-[14px] leading-snug font-medium text-slate-800">
                        {evo.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            }

            const skill = item.data
            const curStars = activeRunSkills[skill.id] ?? 0
            const nextStar = Math.min(MAX_SKILL_STARS, curStars + 1)
            const tierEffect = getSkillTierEffect(skill, nextStar)
            const st = RARITY_STYLES[skill.rarity]
            const isUpgrade = curStars > 0
            const synergyInfo = getPartnerSkillForSynergy(
              skill.id,
              activeRunSkills,
              activeMythicEvolutions ?? [],
            )
            const isSynergyReady = Boolean(synergyInfo?.partnerOwned && curStars === 0)

            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => handleSelectSkill(skill.id)}
                className={`group relative w-full rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] ${st.frame} ${st.glow}`}
              >
                <div className="flex items-start gap-3">
                  {/* Left Emblem */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-[#FFFDF9] shadow-md">
                    <DynamicIcon
                      name={skill.icon}
                      className="h-7 w-7 text-[#2C1810]"
                    />
                    {isUpgrade && (
                      <span
                        className={`absolute -top-2.5 -left-2 rounded-full border px-2 py-0.5 font-display text-[9.5px] font-black uppercase tracking-wider shadow-md ${
                          nextStar >= 4
                            ? 'border-rose-800 bg-rose-600 text-white animate-pulse'
                            : 'border-amber-600 bg-amber-400 text-amber-950'
                        }`}
                      >
                        {nextStar >= 4 ? '★ RED STAR!' : 'STAR UP! ★'}
                      </span>
                    )}
                  </div>

                  {/* Center Name, Category, Hybrid Star Row & Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-display text-[9.5px] font-black uppercase tracking-wider ${st.badge}`}
                      >
                        {st.label} • {skill.category}
                      </span>

                      {/* Hybrid Star Level (☆☆☆ -> ★☆☆ -> ★★☆ -> ★★★ -> 🔴★★ -> 🔴🔴★ -> 🔴🔴🔴) */}
                      <HybridStarBadge stars={nextStar} size="md" />
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="font-display text-[15px] font-black text-[#2C1810] leading-tight">
                        {skill.name}
                      </div>
                      {isSynergyReady && (
                        <span className="shrink-0 rounded-full border border-[#78350f] bg-gradient-to-r from-[#fde047] via-[#facc15] to-[#f59e0b] px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-wider text-[#451a03] shadow-sm animate-pulse">
                          [ 🔗 SYNERGY READY! ]
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[14px] leading-snug font-medium text-slate-800">
                      {tierEffect.description}
                    </p>
                    {isSynergyReady && synergyInfo && (
                      <div className="mt-1.5 rounded-lg border border-amber-600/40 bg-amber-100/90 px-2 py-0.5 font-display text-[9.5px] font-black text-[#92400e]">
                        Unlocks 🌟 {synergyInfo.evo.name} on next draft!
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
