import React, { useMemo } from 'react'
import { Sparkles, Star } from 'lucide-react'
import {
  RUN_SKILLS,
  MAX_SKILL_STARS,
  getHybridStarSlots,
  getSkillTierEffect,
  type RunSkillConfig,
  type RunSkillRarity,
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
    badge: 'bg-emerald-600 text-white border-emerald-900',
    frame:
      'border-[3px] border-emerald-700 border-b-[6px] border-b-emerald-950 bg-gradient-to-b from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]',
    headerBg: 'bg-emerald-700/15 border-emerald-700/30',
    glow: 'shadow-[0_6px_18px_rgba(16,185,129,0.35)]',
    label: 'COMMON',
  },
  rare: {
    badge: 'bg-sky-600 text-white border-sky-900',
    frame:
      'border-[3px] border-sky-700 border-b-[6px] border-b-sky-950 bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]',
    headerBg: 'bg-sky-700/15 border-sky-700/30',
    glow: 'shadow-[0_6px_18px_rgba(14,165,233,0.4)]',
    label: 'RARE',
  },
  epic: {
    badge: 'bg-purple-600 text-white border-purple-950',
    frame:
      'border-[3px] border-purple-700 border-b-[6px] border-b-purple-950 bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff]',
    headerBg: 'bg-purple-700/15 border-purple-700/30',
    glow: 'shadow-[0_6px_20px_rgba(147,51,234,0.45)]',
    label: 'EPIC',
  },
  legendary: {
    badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-[#422006] border-[#422006]',
    frame:
      'border-[3px] border-[#b45309] border-b-[6px] border-b-[#451a03] bg-gradient-to-b from-[#fffbeb] via-[#fef08a] to-[#fde047]',
    headerBg: 'bg-amber-600/20 border-amber-700/40',
    glow: 'shadow-[0_8px_24px_rgba(245,158,11,0.55)]',
    label: 'LEGENDARY',
  },
  mythical: {
    badge: 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white border-[#4c0519]',
    frame:
      'border-[3px] border-[#be123c] border-b-[6px] border-b-[#4c0519] bg-gradient-to-b from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3]',
    headerBg: 'bg-rose-600/20 border-rose-700/40',
    glow: 'shadow-[0_8px_26px_rgba(225,29,72,0.55)]',
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
  | { kind: 'evolution'; data: EvolutionConfig }
  | { kind: 'skill'; data: RunSkillConfig }

export const SkillDraftModal: React.FC<SkillDraftModalProps> = ({ onPicked }) => {
  const pendingDrafts = useRunStore((s) => s.pendingSkillDrafts)
  const runLevel = useRunStore((s) => s.runLevel)
  const activeRunSkills = useRunStore((s) => s.activeRunSkills)
  const selectRunSkill = useRunStore((s) => s.selectRunSkill)
  const evolveCoin = useRunStore((s) => s.evolveCoin)

  // Roll 3 choices: inject secret Golden Hard-Fork Evolution if recipe requirements are met, else regular skills
  const choices = useMemo<DraftItem[]>(() => {
    if (pendingDrafts <= 0) return []
    const meta = useMetaStore.getState()
    const equippedCoinIds = meta.equippedCoinIds
    const ownedCoins = meta.ownedCoins
    const runRelics = useRunStore.getState().runRelics
    const evolvedCoins = useRunStore.getState().evolvedCoins

    const eligibleEvos = getEligibleEvolutions({
      equippedCoinIds,
      ownedCoins,
      activeRunSkills,
      runRelics,
      evolvedCoins,
    })

    const picked: DraftItem[] = []
    if (eligibleEvos.length > 0) {
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
  }, [pendingDrafts, runLevel, activeRunSkills])

  if (pendingDrafts <= 0 || choices.length === 0) return null

  const handleSelectSkill = (skillId: string) => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    selectRunSkill(skillId)
    onPicked?.(skillId)
  }

  const handleSelectEvolution = (evo: EvolutionConfig) => {
    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    evolveCoin(evo.id, evo.baseCoinId)
    onPicked?.(evo.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 select-none">
      <div className="w-full max-w-[390px] rounded-3xl border-[3.5px] border-[#3E2723] border-b-[7px] bg-gradient-to-b from-[#FFFDF9] via-[#FEF3C7] to-[#FDE68A] p-4 shadow-2xl text-[#2C1810]">
        {/* Simplified Top Header Badge strictly showing the Level Number */}
        <div className="flex flex-col items-center text-center mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#3E2723] border-b-4 bg-gradient-to-r from-[#fde047] to-[#f59e0b] px-4 py-1 font-display text-sm font-black uppercase tracking-wider text-[#2C1810] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#78350f]" />
            <span>LEVEL {runLevel}</span>
          </div>
        </div>

        {/* 3 Vertical / Tactile Skill Draft Cards */}
        <div className="space-y-2.5">
          {choices.map((item) => {
            if (item.kind === 'evolution') {
              const evo = item.data
              return (
                <button
                  key={evo.id}
                  type="button"
                  onClick={() => handleSelectEvolution(evo)}
                  className="group relative w-full rounded-2xl p-3 text-left transition-all active:translate-y-1 border-[3px] border-[#b45309] border-b-[6px] border-b-[#451a03] bg-gradient-to-b from-[#fffbeb] via-[#fef08a] to-[#fde047] shadow-[0_0_24px_rgba(245,158,11,0.7)] ring-2 ring-[#f59e0b]"
                >
                  <div className="flex items-start gap-3">
                    {/* Left Emblem */}
                    <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#fef08a] to-[#f59e0b] shadow-md">
                      <DynamicIcon name={evo.icon} className="h-7 w-7 text-[#451a03]" />
                      <span className="absolute -top-2 -left-2 rounded-full border border-[#78350f] bg-[#e11d48] px-1.5 py-0.2 font-display text-[8px] font-black text-white shadow animate-pulse">
                        EVO!
                      </span>
                    </div>

                    {/* Center Name, Category, & Description */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="rounded-full border border-[#78350f] bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 px-2 py-0.2 font-display text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                          ⚡ GOLDEN HARD-FORK
                        </span>
                        <span className="rounded-full border border-[#78350f] bg-[#451a03] px-2 py-0.2 font-display text-[8.5px] font-black text-[#fde047]">
                          2x SPEED + MEGA
                        </span>
                      </div>

                      <div className="font-display text-sm font-black text-[#451a03] leading-tight">
                        {evo.name} ({evo.ticker})
                      </div>
                      <p className="mt-0.5 text-[11px] font-bold text-[#78350f] leading-snug">
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

            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => handleSelectSkill(skill.id)}
                className={`group relative w-full rounded-2xl p-3 text-left transition-all active:translate-y-1 ${st.frame} ${st.glow}`}
              >
                <div className="flex items-start gap-3">
                  {/* Left Emblem */}
                  <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-[#FFFDF9] shadow-md">
                    <DynamicIcon
                      name={skill.icon}
                      className="h-7 w-7 text-[#2C1810]"
                    />
                    {isUpgrade && (
                      <span
                        className={`absolute -top-2 -left-2 rounded-full border border-[#3E2723] px-1.5 py-0.2 font-display text-[8px] font-black text-white shadow ${
                          nextStar >= 4 ? 'bg-[#e11d48]' : 'bg-[#f59e0b] text-[#2C1810]'
                        }`}
                      >
                        {nextStar >= 4 ? 'RED STAR!' : 'STAR UP!'}
                      </span>
                    )}
                  </div>

                  {/* Center Name, Category, Hybrid Star Row & Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`rounded-full border px-2 py-0.2 font-display text-[9px] font-black uppercase tracking-wider ${st.badge}`}
                      >
                        {st.label} • {skill.category}
                      </span>

                      {/* Hybrid Star Level (☆☆☆ -> ★☆☆ -> ★★☆ -> ★★★ -> 🔴★★ -> 🔴🔴★ -> 🔴🔴🔴) */}
                      <HybridStarBadge stars={nextStar} />
                    </div>

                    <div className="font-display text-sm font-extrabold text-[#2C1810] leading-tight">
                      {skill.name}
                    </div>
                    <p className="mt-0.5 text-[11px] font-bold text-[#422006] leading-snug">
                      {tierEffect.description}
                    </p>
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
