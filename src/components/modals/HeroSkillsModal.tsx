import { useState } from 'react'
import {
  X,
  Zap,
  TrendingUp,
  Flame,
  Briefcase,
  DollarSign,
  BarChart3,
  Crown,
  Coins,
  Gem,
  Sparkles,
  Cpu,
  WifiOff,
  Binary,
  RotateCcw,
  Sun,
  ShieldCheck,
  Lock,
  Sliders,
  Check,
  Shield,
  Heart,
  Swords,
  Timer,
  AlertCircle,
} from 'lucide-react'
import { HERO_MAP, type HeroId } from '../../config/heroes.config'
import {
  HERO_SKILLS_BY_HERO,
  MAX_HERO_SKILL_LEVEL,
  MAX_HERO_SKILL_STARS,
  getHeroSkillLevelUpCost,
  getHeroSkillAscensionCost,
  scalePassiveMastery,
  type HeroSkillConfig,
} from '../../config/heroSkills.config'
import { useMetaStore } from '../../state/useMetaStore'
import { AudioSynth } from '../../engine/AudioSynth'

interface HeroSkillsModalProps {
  heroId: HeroId
  onClose: () => void
}

function getSkillIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'Zap':
      return <Zap className={className} />
    case 'TrendingUp':
      return <TrendingUp className={className} />
    case 'Flame':
      return <Flame className={className} />
    case 'Briefcase':
      return <Briefcase className={className} />
    case 'DollarSign':
      return <DollarSign className={className} />
    case 'BarChart3':
      return <BarChart3 className={className} />
    case 'Crown':
      return <Crown className={className} />
    case 'Coins':
      return <Coins className={className} />
    case 'Gem':
      return <Gem className={className} />
    case 'Sparkles':
      return <Sparkles className={className} />
    case 'Cpu':
      return <Cpu className={className} />
    case 'WifiOff':
      return <WifiOff className={className} />
    case 'Binary':
      return <Binary className={className} />
    case 'RotateCcw':
      return <RotateCcw className={className} />
    case 'Sun':
      return <Sun className={className} />
    case 'ShieldCheck':
      return <ShieldCheck className={className} />
    case 'Lock':
      return <Lock className={className} />
    case 'Sliders':
      return <Sliders className={className} />
    default:
      return <Zap className={className} />
  }
}

export function HeroSkillsModal({ heroId, onClose }: HeroSkillsModalProps) {
  const meta = useMetaStore()
  const heroCfg = HERO_MAP[heroId]
  const skills = HERO_SKILLS_BY_HERO[heroId] ?? []

  const equippedSkill = meta.getHeroEquippedSkill(heroId)
  const [selectedSkillId, setSelectedSkillId] = useState<string>(equippedSkill?.id || skills[0]?.id || '')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }

  const selectedSkill: HeroSkillConfig =
    skills.find((s) => s.id === selectedSkillId) || skills[0]

  const heroStars = meta.heroStars?.[heroId] ?? 1
  const heroFrags = meta.heroFragments?.[heroId] ?? 0
  const isSelectedUnlocked = meta.isHeroSkillUnlocked(heroId, selectedSkill.id)
  const isSelectedEquipped = equippedSkill?.id === selectedSkill.id
  const mastery = meta.getHeroSkillMastery(selectedSkill.id)
  const scaledPassive = scalePassiveMastery(selectedSkill.basePassiveMastery, mastery.level, mastery.stars)

  const canLevelUp =
    isSelectedUnlocked &&
    mastery.level < MAX_HERO_SKILL_LEVEL &&
    meta.hashrate >= getHeroSkillLevelUpCost(mastery.level).hashrate &&
    (meta.furnitureBlueprints ?? 0) >= getHeroSkillLevelUpCost(mastery.level).blueprints

  const levelUpCost = getHeroSkillLevelUpCost(mastery.level)
  const ascensionCost = getHeroSkillAscensionCost(mastery.stars)
  const canAscend =
    isSelectedUnlocked &&
    mastery.stars < MAX_HERO_SKILL_STARS &&
    meta.hashrate >= ascensionCost.hashrate &&
    heroFrags >= ascensionCost.fragments

  const totalPassiveMastery = meta.getHeroAggregatedPassiveMastery(heroId)

  const handleEquip = (skill: HeroSkillConfig) => {
    AudioSynth.unlock()
    if (!meta.isHeroSkillUnlocked(heroId, skill.id)) {
      showToast(`🔒 Requires ${skill.unlockMinHeroStars}★ Hero Ascension to unlock!`)
      return
    }
    AudioSynth.playCoinInject()
    meta.equipHeroSkill(heroId, skill.id)
    showToast(`✓ Equipped ${skill.name}!`)
  }

  const handleLevelUp = () => {
    if (!canLevelUp) return
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    if (meta.upgradeHeroSkillLevel(selectedSkill.id)) {
      showToast(`⚡ ${selectedSkill.name} Leveled Up to Lv.${mastery.level + 1}!`)
    }
  }

  const handleAscend = () => {
    if (!canAscend) return
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    if (meta.ascendHeroSkillStar(selectedSkill.id)) {
      showToast(`⭐ ${selectedSkill.name} Ascended to ${mastery.stars + 1}★! (+25% Stats)`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border-2 border-[#3E2723] border-b-6 bg-[#FFFDF9] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E2D5C1] bg-gradient-to-r from-[#F3E9D8] via-[#FFFDF9] to-[#F3E9D8] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#3E2723] text-white shadow-xs"
              style={{ backgroundColor: heroCfg.accentColor }}
            >
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-sm font-black uppercase tracking-wide text-[#2C1810]">
                  ⚡ Hero Skill Arsenal
                </h2>
                <span className="rounded-md border border-[#E2D5C1] bg-[#FFFDF9] px-1.5 py-0.5 font-display text-[9px] font-black uppercase text-[#6E5A4F]">
                  {skills.length} Skills Available
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#6E5A4F]">
                {heroCfg.name} • {heroCfg.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] text-[#6E5A4F] transition-all hover:bg-[#F3E9D8] active:translate-y-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Global Stacked Passive Mastery Banner */}
        <div className="border-b border-[#E2D5C1] bg-gradient-to-r from-[#eff6ff] via-[#f0fdf4] to-[#fefce8] px-3.5 py-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-display text-[10px] font-black uppercase tracking-tight text-[#166534]">
              <Sparkles className="h-3 w-3 fill-current text-[#16a34a]" />
              Permanent Stacked Passive Mastery (All Unlocked Skills Empower Hero):
            </span>
            <div className="flex items-center gap-2 font-display text-[10px] font-black text-[#2C1810]">
              <span>⚡ {meta.hashrate.toLocaleString()}</span>
              <span>📘 {meta.furnitureBlueprints ?? 0}</span>
              <span>🧩 {heroFrags}</span>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#374151]">
            {(totalPassiveMastery.marginHpPct ?? 0) > 0 && (
              <span className="rounded-md border border-[#bbf7d0] bg-white px-1.5 py-0.5 text-[#15803d]">
                +{totalPassiveMastery.marginHpPct}% Margin HP
              </span>
            )}
            {(totalPassiveMastery.coinDamagePct ?? 0) > 0 && (
              <span className="rounded-md border border-[#fed7aa] bg-white px-1.5 py-0.5 text-[#c2410c]">
                +{totalPassiveMastery.coinDamagePct}% Coin DMG
              </span>
            )}
            {(totalPassiveMastery.greenRollOddsPct ?? 0) > 0 && (
              <span className="rounded-md border border-[#bbf7d0] bg-white px-1.5 py-0.5 text-[#16a34a]">
                +{totalPassiveMastery.greenRollOddsPct}% Green Odds
              </span>
            )}
            {(totalPassiveMastery.tickSpeedPct ?? 0) > 0 && (
              <span className="rounded-md border border-[#bae6fd] bg-white px-1.5 py-0.5 text-[#0369a1]">
                +{totalPassiveMastery.tickSpeedPct}% Tick Speed
              </span>
            )}
            {(totalPassiveMastery.critDamagePct ?? 0) > 0 && (
              <span className="rounded-md border border-[#fbcfe8] bg-white px-1.5 py-0.5 text-[#be185d]">
                +{totalPassiveMastery.critDamagePct}% Crit Mult
              </span>
            )}
            {(totalPassiveMastery.damageReductionPct ?? 0) > 0 && (
              <span className="rounded-md border border-[#ddd6fe] bg-white px-1.5 py-0.5 text-[#6d28d9]">
                +{totalPassiveMastery.damageReductionPct}% Dmg Reduction
              </span>
            )}
            {(totalPassiveMastery.bountyCashPct ?? 0) > 0 && (
              <span className="rounded-md border border-[#fef08a] bg-white px-1.5 py-0.5 text-[#a16207]">
                +{totalPassiveMastery.bountyCashPct}% Bounty Cash
              </span>
            )}
            {(totalPassiveMastery.shieldCapacityPct ?? 0) > 0 && (
              <span className="rounded-md border border-[#bfdbfe] bg-white px-1.5 py-0.5 text-[#1d4ed8]">
                +{totalPassiveMastery.shieldCapacityPct}% Shield Cap
              </span>
            )}
            {(totalPassiveMastery.interruptWindowBonus ?? 0) > 0 && (
              <span className="rounded-md border border-[#fed7aa] bg-white px-1.5 py-0.5 text-[#b45309]">
                +{Math.round((totalPassiveMastery.interruptWindowBonus ?? 0) * 100)}% Interrupt Window
              </span>
            )}
          </div>
        </div>

        {/* Body Container: Skills Tabs & Detailed Inspector */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {/* Skill Selector Row / Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {skills.map((sk) => {
              const isUnlocked = meta.isHeroSkillUnlocked(heroId, sk.id)
              const isEquipped = equippedSkill?.id === sk.id
              const isSelected = selectedSkill.id === sk.id
              const skMastery = meta.getHeroSkillMastery(sk.id)

              return (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playCoinInject()
                    setSelectedSkillId(sk.id)
                  }}
                  className={`relative flex flex-col items-center rounded-2xl border-2 p-2.5 text-center transition-all ${
                    isSelected
                      ? 'border-[#3E2723] border-b-4 bg-[#FFFDF9] shadow-md scale-[1.02]'
                      : 'border-[#E2D5C1] bg-[#F3E9D8]/60 hover:bg-[#F3E9D8] opacity-85'
                  }`}
                >
                  {/* Status Badges */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    {isEquipped && (
                      <span className="rounded-full bg-[#16a34a] p-0.5 text-white shadow-xs" title="Equipped in Battle">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                    {!isUnlocked && (
                      <span className="rounded-full bg-[#6E5A4F] p-0.5 text-white" title={`Requires ${sk.unlockMinHeroStars}★ Hero`}>
                        <Lock className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#3E2723] text-white shadow-xs"
                    style={{ backgroundColor: sk.accentColor }}
                  >
                    {getSkillIcon(sk.iconName, 'w-5 h-5 fill-current')}
                  </div>

                  <span className="mt-1.5 font-display text-[11px] font-black leading-tight text-[#2C1810]">
                    {sk.name}
                  </span>

                  {/* Level & Stars */}
                  <div className="mt-1 flex items-center gap-1">
                    <span className="rounded-md bg-[#3E2723] px-1 py-0.2 text-[9px] font-black text-amber-300">
                      Lv.{skMastery.level}
                    </span>
                    <span className="text-[9px] font-black text-amber-500">
                      {'★'.repeat(skMastery.stars)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detailed Inspector Card */}
          <div className="rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] text-white shadow-md"
                  style={{ backgroundColor: selectedSkill.accentColor }}
                >
                  {getSkillIcon(selectedSkill.iconName, 'w-6 h-6 fill-current')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-black text-[#2C1810]">
                      {selectedSkill.name}
                    </h3>
                    <span className="rounded-md border border-[#E2D5C1] bg-[#F3E9D8] px-1.5 py-0.5 font-display text-[10px] font-black text-[#6E5A4F]">
                      Slot #{selectedSkill.slotIndex + 1}
                    </span>
                    {isSelectedEquipped && (
                      <span className="rounded-md bg-[#22c55e] px-1.5 py-0.5 font-display text-[9px] font-black uppercase text-white shadow-xs">
                        ✓ Equipped
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-[#8c786a]">
                    {selectedSkill.tagline}
                  </p>
                  <div className="mt-1 flex items-center gap-2 font-display text-[10px] font-extrabold text-[#6E5A4F]">
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <Timer className="h-3 w-3" />
                      Charges Every {Math.max(2, selectedSkill.skillChargeTicks - Math.floor(mastery.level / 2))} Ticks
                    </span>
                    <span>•</span>
                    <span>Grade: Lv.{mastery.level}/{MAX_HERO_SKILL_LEVEL}</span>
                    <span>•</span>
                    <span className="text-amber-500">Tier: {mastery.stars}★/{MAX_HERO_SKILL_STARS}★</span>
                  </div>
                </div>
              </div>

              {/* Equip Button */}
              {isSelectedUnlocked ? (
                <button
                  type="button"
                  onClick={() => handleEquip(selectedSkill)}
                  className={`shrink-0 rounded-xl px-3 py-2 font-display text-[10px] font-black uppercase tracking-wider transition-all ${
                    isSelectedEquipped
                      ? 'border-2 border-[#166534] bg-[#22c55e] text-white cursor-default shadow-xs'
                      : 'btn-3d-amber text-[#2C1810] active:translate-y-0.5'
                  }`}
                >
                  {isSelectedEquipped ? '✓ EQUIPPED' : 'EQUIP SKILL'}
                </button>
              ) : (
                <div className="flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] font-black text-amber-800">
                  <Lock className="h-3 w-3" />
                  <span>Unlocks at {selectedSkill.unlockMinHeroStars}★ (Hero is {heroStars}★)</span>
                </div>
              )}
            </div>

            {/* Active Combat Action Box */}
            <div className="mt-3.5 rounded-xl border border-[#bae6fd] bg-[#f0f9ff] p-3">
              <div className="flex items-center gap-1.5 font-display text-[10px] font-black uppercase tracking-wide text-[#0369a1]">
                <Zap className="h-3.5 w-3.5 fill-current text-[#0284c7]" />
                Active Combat Trigger (Fires at 100% Charge in Battle)
              </div>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-[#1e293b]">
                {selectedSkill.description}
              </p>
              <div className="mt-1.5 flex items-center gap-2 font-display text-[10px] font-extrabold text-[#0284c7]">
                <span>⚡ Action: {selectedSkill.actionSummary}</span>
              </div>
            </div>

            {/* Passive Mastery Bonus Box */}
            <div className="mt-2.5 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-display text-[10px] font-black uppercase tracking-wide text-[#166534]">
                  <ShieldCheck className="h-3.5 w-3.5 fill-current text-[#16a34a]" />
                  Permanent Passive Mastery (Stacks Permanently on Hero)
                </span>
                <span className="text-[9px] font-bold text-[#15803d]">
                  Scales with Lv.{mastery.level} & {mastery.stars}★
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {scaledPassive.marginHpPct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <Heart className="h-3 w-3 text-red-500 fill-current" />
                    <span>+{scaledPassive.marginHpPct}% Margin HP</span>
                  </div>
                )}
                {scaledPassive.coinDamagePct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <Swords className="h-3 w-3 text-amber-600 fill-current" />
                    <span>+{scaledPassive.coinDamagePct}% Coin Damage</span>
                  </div>
                )}
                {scaledPassive.greenRollOddsPct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span>+{scaledPassive.greenRollOddsPct}% Green Roll Odds</span>
                  </div>
                )}
                {scaledPassive.greenRollDamagePct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <Zap className="h-3 w-3 text-emerald-600 fill-current" />
                    <span>+{scaledPassive.greenRollDamagePct}% Green Damage</span>
                  </div>
                )}
                {scaledPassive.tickSpeedPct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <Timer className="h-3 w-3 text-cyan-600" />
                    <span>+{scaledPassive.tickSpeedPct}% Global Tick Speed</span>
                  </div>
                )}
                {scaledPassive.critDamagePct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <Flame className="h-3 w-3 text-rose-500 fill-current" />
                    <span>+{scaledPassive.critDamagePct}% Crit Multiplier</span>
                  </div>
                )}
                {scaledPassive.damageReductionPct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <Shield className="h-3 w-3 text-purple-600" />
                    <span>+{scaledPassive.damageReductionPct}% Damage Reduction</span>
                  </div>
                )}
                {scaledPassive.bountyCashPct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <DollarSign className="h-3 w-3 text-yellow-600" />
                    <span>+{scaledPassive.bountyCashPct}% Bounty Cash</span>
                  </div>
                )}
                {scaledPassive.shieldCapacityPct && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <ShieldCheck className="h-3 w-3 text-blue-600" />
                    <span>+{scaledPassive.shieldCapacityPct}% Shield Cap</span>
                  </div>
                )}
                {scaledPassive.interruptWindowBonus && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#dcfce7] bg-white px-2 py-1 text-[10px] font-bold text-[#166534]">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    <span>+{Math.round(scaledPassive.interruptWindowBonus * 100)}% Interrupt Window</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[9px] font-medium text-[#166534]/80 italic">
                * Mastery passives remain 100% active even if you equip a different skill!
              </p>
            </div>

            {/* Upgrade & Star Ascension Action Buttons */}
            {isSelectedUnlocked && (
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E2D5C1]">
                {/* Level Up Button */}
                <button
                  type="button"
                  disabled={!canLevelUp}
                  onClick={handleLevelUp}
                  className={`flex items-center justify-between rounded-xl border-2 px-3 py-2 text-left transition-all ${
                    canLevelUp
                      ? 'border-[#3E2723] bg-gradient-to-r from-amber-400 to-amber-500 text-[#2C1810] shadow-md hover:from-amber-300 hover:to-amber-400 active:translate-y-0.5'
                      : 'border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F] opacity-75 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <span className="font-display text-[10px] font-black uppercase">
                      {mastery.level >= MAX_HERO_SKILL_LEVEL ? 'MAX LEVEL' : `LEVEL UP (Lv.${mastery.level} → ${mastery.level + 1})`}
                    </span>
                    <div className="text-[9px] font-bold">
                      Boosts Active & Passive Potency
                    </div>
                  </div>
                  {mastery.level < MAX_HERO_SKILL_LEVEL && (
                    <div className="flex flex-col items-end text-[9px] font-black">
                      <span>⚡ {levelUpCost.hashrate.toLocaleString()}</span>
                      <span>📘 {levelUpCost.blueprints} Blueprints</span>
                    </div>
                  )}
                </button>

                {/* Star Ascension Button */}
                <button
                  type="button"
                  disabled={!canAscend}
                  onClick={handleAscend}
                  className={`flex items-center justify-between rounded-xl border-2 px-3 py-2 text-left transition-all ${
                    canAscend
                      ? 'border-[#3E2723] bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-md hover:from-rose-300 hover:to-rose-400 active:translate-y-0.5'
                      : 'border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F] opacity-75 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <span className="font-display text-[10px] font-black uppercase">
                      {mastery.stars >= MAX_HERO_SKILL_STARS ? 'MAX STARS' : `ASCEND (${mastery.stars}★ → ${mastery.stars + 1}★)`}
                    </span>
                    <div className="text-[9px] font-bold">
                      +25% Multiplier to All Stats
                    </div>
                  </div>
                  {mastery.stars < MAX_HERO_SKILL_STARS && (
                    <div className="flex flex-col items-end text-[9px] font-black">
                      <span>⚡ {ascensionCost.hashrate.toLocaleString()}</span>
                      <span>🧩 {ascensionCost.fragments} Fragments</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full border-2 border-[#3E2723] bg-[#2C1810] px-4 py-1.5 font-display text-xs font-black text-amber-300 shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
