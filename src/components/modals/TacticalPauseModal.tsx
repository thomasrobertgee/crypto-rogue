import { useState } from 'react'
import {
  X,
  Play,
  Volume2,
  VolumeX,
  LogOut,
  Skull,
  Shield,
  Heart,
  Coins,
} from 'lucide-react'
import type { EnemyConfig } from '../../types/game.types'
import { HERO_MAP, type HeroId } from '../../config/heroes.config'
import { HERO_SKINS, type HeroSkinConfig } from '../../config/heroSkins.config'
import { RELIC_MAP } from '../../config/relics.config'
import { RUN_SKILLS, type RunSkillConfig } from '../../config/runSkills.config'
import { AudioSynth } from '../../engine/AudioSynth'
import { fmtNum, fmtUsd } from '../../engine/format'
import { useMetaStore } from '../../state/useMetaStore'
import { DynamicIcon } from '../DynamicIcon'
import { BossMonsterSvg } from '../WorldDioramaArt'

const HERO_SKIN_MAP: Record<string, HeroSkinConfig> = Object.fromEntries(
  HERO_SKINS.map((s) => [s.id, s]),
)
const RUN_SKILL_MAP: Record<string, RunSkillConfig> = Object.fromEntries(
  RUN_SKILLS.map((s) => [s.id, s]),
)

interface TacticalPauseModalProps {
  stageNumber: number
  nodeIndex: number
  enemy: EnemyConfig
  enemyHp: number
  enemyMaxHp: number
  marginHp: number
  maxMarginHp: number
  shield: number
  portfolio: number
  equippedHeroId: HeroId
  equippedHeroStars: number
  equippedSkinId?: string
  runRelics: string[]
  activeRunSkills: Record<string, number>
  onResume: () => void
  onCashOut: () => void
}

export function TacticalPauseModal({
  stageNumber,
  nodeIndex,
  enemy,
  enemyHp,
  enemyMaxHp,
  marginHp,
  maxMarginHp,
  shield,
  portfolio,
  equippedHeroId,
  equippedHeroStars,
  equippedSkinId,
  runRelics,
  activeRunSkills,
  onResume,
  onCashOut,
}: TacticalPauseModalProps) {
  const [isMuted, setIsMuted] = useState(AudioSynth.muted)
  const [confirmCashOut, setConfirmCashOut] = useState(false)
  const [seedInput, setSeedInput] = useState('')
  const [seedStatus, setSeedStatus] = useState<string | null>(null)
  const exportSaveSeed = useMetaStore((s) => s.exportSaveSeed)
  const importSaveSeed = useMetaStore((s) => s.importSaveSeed)

  const hero = HERO_MAP[equippedHeroId] ?? HERO_MAP.rookie_satoshi
  const heroSkin = equippedSkinId ? HERO_SKIN_MAP[equippedSkinId] : null
  const enemyHpPct = Math.max(0, Math.min(100, (enemyHp / Math.max(1, enemyMaxHp)) * 100))
  const marginHpPct = Math.max(0, Math.min(100, (marginHp / Math.max(1, maxMarginHp)) * 100))

  const handleToggleAudio = () => {
    AudioSynth.unlock()
    const nextMuted = !isMuted
    AudioSynth.setMuted(nextMuted)
    setIsMuted(nextMuted)
    if (!nextMuted) {
      AudioSynth.playCoinInject()
    }
  }

  const handleCashOutClick = () => {
    AudioSynth.unlock()
    if (!confirmCashOut) {
      setConfirmCashOut(true)
      AudioSynth.playBossAlarm()
      return
    }
    onCashOut()
  }

  const draftedSkillEntries = Object.entries(activeRunSkills).filter(([, count]) => count > 0)

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md animate-fade-in select-none"
      onClick={onResume}
    >
      <div
        className="flex max-h-[92%] w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-3xl border-[3.5px] border-[#3E2723] border-b-[7px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E2D5C1] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white shadow-xs">
              <span className="text-base font-black">⏸️</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-[9px] font-black uppercase tracking-wider text-[#b45309]">
                  MARKET HALTED
                </span>
                <span className="rounded-full bg-[#fef3c7] border border-[#f59e0b] px-1.5 py-0.2 font-display text-[8px] font-black text-[#b45309]">
                  STAGE {stageNumber} • NODE {nodeIndex + 1}/30
                </span>
              </div>
              <h3 className="font-display text-sm font-black text-[#2C1810]">
                TACTICAL BATTLE INTEL
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onResume}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] text-[#2C1810] shadow-xs transition-transform active:scale-90"
            title="Resume Trading"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 1. ENEMY INTEL DOSSIER */}
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-[#3E2723] bg-[#FFF8EE] p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Skull className="h-4 w-4 text-[#e11d48]" />
              <span className="font-display text-xs font-black text-[#2C1810]">
                TARGET INTEL: {enemy.name}
              </span>
            </div>
            {enemy.isBoss ? (
              <span className="rounded-full border border-[#7e22ce] bg-[#f3e8ff] px-2 py-0.2 font-display text-[8px] font-black text-[#7e22ce] shadow-2xs">
                👑 FLOOR BOSS
              </span>
            ) : (
              <span className="rounded-full border border-[#3E2723] bg-[#F3E9D8] px-2 py-0.2 font-display text-[8px] font-black text-[#6E5A4F]">
                ⚔️ MARKET MINION
              </span>
            )}
          </div>

          {/* Enemy Art & Liquidation HP Bar */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-[#ffe4e6] shadow-xs overflow-hidden">
              <BossMonsterSvg stage={stageNumber} enemyName={enemy.name} size={54} />
            </div>
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] font-display font-black text-[#2C1810]">
                <span>LIQUIDATION HP</span>
                <span>
                  ${fmtNum(Math.ceil(enemyHp))} / ${fmtNum(enemyMaxHp)} ({Math.round(enemyHpPct)}%)
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full border border-[#3E2723] bg-[#F3E9D8]">
                <div
                  className="h-full bg-gradient-to-r from-[#e11d48] to-[#f97316] transition-all"
                  style={{ width: `${enemyHpPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Attack Specs Breakdown */}
          <div className="flex flex-col gap-1 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2 text-[9px] font-display font-bold text-[#6E5A4F]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#ea580c] font-black">
                <span>⚠️ Heavy Dump:</span>
              </span>
              <span className="font-black text-[#dc2626]">
                -{enemy.attack} HP (every {enemy.attackCooldown}s)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#b91c1c] font-black">
                <span>🔻 Red Candle Counter:</span>
              </span>
              <span className="font-black text-[#dc2626]">
                -{enemy.counterAttackDmg ?? Math.max(1, Math.round(enemy.attack * 0.5))} HP per Red Roll
              </span>
            </div>
            {enemy.isBoss && (
              <div className="flex items-center justify-between border-t border-[#E2D5C1] pt-1">
                <span className="flex items-center gap-1 text-[#7e22ce] font-black">
                  <span>☠️ Black Swan Ult:</span>
                </span>
                <span className="font-black text-[#7e22ce]">
                  -{enemy.ultimateDmg ?? Math.round(enemy.attack * 1.5)} HP + 15% HP & -20% Cap
                </span>
              </div>
            )}
            {enemy.hazard && (
              <div className="flex flex-col border-t border-[#E2D5C1] pt-1 text-[8.5px]">
                <span className="font-black text-[#be123c]">
                  ⚡ Hazard ({enemy.hazard.name}):
                </span>
                <span className="font-medium text-[#881337] leading-tight">
                  {enemy.hazard.description}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. PLAYER RUN BUILD BREAKDOWN */}
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-[#3E2723] bg-[#FDF6E9] p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-black text-[#2C1810]">
              TRADER STATUS & ACTIVE BUILDS
            </span>
            <span className="flex items-center gap-1 font-display text-[10px] font-black text-[#15803d]">
              <Coins className="h-3 w-3" /> TVL: {fmtUsd(portfolio)}
            </span>
          </div>

          {/* Margin HP Status */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-display font-black text-[#2C1810]">
              <span className="flex items-center gap-1 text-[#f43f5e]">
                <Heart className="h-3 w-3 fill-[#f43f5e]" /> MARGIN HP
              </span>
              <span>
                {Math.ceil(marginHp)} / {maxMarginHp} ({Math.round(marginHpPct)}%)
                {shield > 0 && (
                  <span className="ml-1 text-[#0284c7]">
                    <Shield className="inline h-2.5 w-2.5" /> +{Math.ceil(shield)}
                  </span>
                )}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full border border-[#3E2723] bg-[#F3E9D8]">
              <div
                className="h-full bg-gradient-to-r from-[#4ade80] to-[#16a34a] transition-all"
                style={{ width: `${marginHpPct}%` }}
              />
            </div>
          </div>

          {/* Hero & Equipped Skin */}
          <div className="flex items-center justify-between rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] px-2 py-1.5 text-[9px] font-display">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">🦸</span>
              <div className="truncate">
                <span className="font-black text-[#2C1810]">{hero.name}</span>
                <span className="ml-1 font-extrabold text-[#d97706]">({equippedHeroStars}★)</span>
                {heroSkin && (
                  <span className="ml-1 text-[8px] font-black text-[#7e22ce]">
                    • {heroSkin.name}
                  </span>
                )}
              </div>
            </div>
            {heroSkin && (
              <span className="shrink-0 rounded bg-[#dcfce7] px-1.5 py-0.2 font-black text-[8px] text-[#15803d]">
                {heroSkin.passiveBonusText}
              </span>
            )}
          </div>

          {/* Active Algo Relics Rack */}
          <div className="flex flex-col gap-1">
            <span className="font-display text-[9px] font-black uppercase text-[#6E5A4F]">
              ACTIVE ALGO RELICS ({runRelics.length}/5)
            </span>
            <div className="flex flex-wrap gap-1">
              {runRelics.length === 0 ? (
                <span className="text-[8.5px] italic text-[#6E5A4F]">No Relics acquired yet</span>
              ) : (
                runRelics.map((rId) => {
                  const relic = RELIC_MAP[rId]
                  if (!relic) return null
                  return (
                    <div
                      key={rId}
                      title={`${relic.name}: ${relic.description}`}
                      className="flex items-center gap-1 rounded-lg border border-[#3E2723] bg-[#FFFDF9] px-1.5 py-0.5 text-[8.5px] font-display font-black text-[#2C1810] shadow-2xs"
                    >
                      <DynamicIcon name={relic.icon} className="h-3 w-3 text-[#b45309]" />
                      <span className="truncate max-w-[90px]">{relic.name}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Drafted In-Run Algorithmic Upgrades */}
          {draftedSkillEntries.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-[#E2D5C1] pt-1">
              <span className="font-display text-[9px] font-black uppercase text-[#6E5A4F]">
                DRAFTED ALGO UPGRADES ({draftedSkillEntries.length})
              </span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {draftedSkillEntries.map(([skillId, count]) => {
                  const skill = RUN_SKILL_MAP[skillId]
                  if (!skill) return null
                  const tierIdx = Math.min(2, Math.max(0, count - 1))
                  const desc = skill.tiers[tierIdx]?.description ?? ''
                  return (
                    <div
                      key={skillId}
                      title={`${skill.name} (${count}x): ${desc}`}
                      className="flex items-center gap-1 rounded-md border border-[#cbd5e1] bg-white px-1.5 py-0.5 text-[8px] font-display font-extrabold text-[#334155]"
                    >
                      <span>⚡</span>
                      <span className="truncate max-w-[85px]">{skill.name}</span>
                      <span className="rounded bg-[#f1f5f9] px-1 font-black text-[#0f172a]">
                        {count}x
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. TACTICALLY CLEAR ACTION BUTTONS */}
        <div className="flex flex-col gap-2 pt-1">
          {/* [ ▶️ RESUME TRADING ] (Large Green Primary Button) */}
          <button
            type="button"
            onClick={onResume}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#14532d] border-b-4 bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#15803d] font-display text-sm font-black uppercase tracking-wider text-white shadow-lg transition-transform active:translate-y-0.5 active:shadow-md"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>RESUME TRADING</span>
          </button>

          {/* Secondary Action Row: [ 🔊 AUDIO TOGGLE ] & [ 🏳️ CASH OUT ] */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-b-4 font-display text-[10px] font-black uppercase shadow-xs transition-all active:translate-y-0.5 ${
                isMuted
                  ? 'border-[#3E2723] bg-[#F3E9D8] text-[#6E5A4F]'
                  : 'border-[#3E2723] bg-[#f3e8ff] text-[#7e22ce]'
              }`}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span>{isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}</span>
            </button>

            <button
              type="button"
              onClick={handleCashOutClick}
              className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-b-4 font-display text-[10px] font-black uppercase shadow-xs transition-all active:translate-y-0.5 ${
                confirmCashOut
                  ? 'border-[#881337] bg-[#e11d48] text-white animate-pulse'
                  : 'border-[#881337] bg-[#ffe4e6] text-[#be123c]'
              }`}
              title="Bankroll Hashrate and exit run"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{confirmCashOut ? 'CONFIRM CASH OUT?' : 'CASH OUT & LEAVE'}</span>
            </button>
          </div>

          {confirmCashOut && (
            <div className="rounded-xl border border-[#e11d48] bg-[#fff1f2] p-1.5 text-center font-display text-[8.5px] font-black text-[#be123c] animate-fade-in">
              ⚠️ Tapping again will bankroll all earned Hashrate and safely return to Base Camp!
            </div>
          )}

          {/* Cross-Device Wallet Seed Save Transfer */}
          <div className="mt-1 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display text-[9px] font-black uppercase tracking-wider text-[#2C1810]">
                🔐 Wallet Seed Backup (CR-SAVE-v2:)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <button
                type="button"
                onClick={() => {
                  const seed = exportSaveSeed()
                  setSeedInput(seed)
                  navigator.clipboard?.writeText(seed).catch(() => {})
                  AudioSynth.playCoinInject()
                  setSeedStatus('✅ Copied CR-SAVE-v2 Seed!')
                }}
                className="rounded-xl border border-[#3E2723] bg-[#22c55e] py-1.5 font-display text-[9px] font-black text-white shadow-2xs"
              >
                📤 Export Save Seed
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = importSaveSeed(seedInput)
                  setSeedStatus(res.ok ? `✅ ${res.message}` : `❌ ${res.message}`)
                }}
                className="rounded-xl border border-[#3E2723] bg-[#0284c7] py-1.5 font-display text-[9px] font-black text-white shadow-2xs"
              >
                📥 Import Save Seed
              </button>
            </div>
            <input
              type="text"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="Paste CR-SAVE-v2:... seed string"
              className="w-full rounded-lg border border-[#3E2723] bg-[#FFFDF9] px-2 py-1 font-mono text-[9px] font-bold text-[#2C1810] outline-none"
            />
            {seedStatus && (
              <div className="mt-1 font-display text-[8.5px] font-black text-[#166534]">
                {seedStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
