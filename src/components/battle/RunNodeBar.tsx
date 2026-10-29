import { useState } from 'react'
import {
  Swords,
  HelpCircle,
  ShoppingBag,
  Skull,
  Flame,
  Map,
  X,
} from 'lucide-react'
import type { StageNodeConfig, NodeType } from '../../types/game.types'
import { useRunStore } from '../../state/useRunStore'
import { RUN_SKILL_MAP, getSkillTierEffect } from '../../config/runSkills.config'
import { HybridStarBadge } from './SkillDraftModal'

interface RunNodeBarProps {
  stageNumber: number
  stageName: string
  nodes: StageNodeConfig[]
  currentNodeIndex: number // 1..30
}

function getNodeIcon(type: NodeType, small = false) {
  const cls = small ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'
  switch (type) {
    case 'battle':
      return <Swords className={cls} />
    case 'elite':
      return <Flame className={cls} />
    case 'event':
      return <HelpCircle className={cls} />
    case 'shop':
      return <ShoppingBag className={cls} />
    case 'boss':
      return <Skull className={cls} />
  }
}

function getNodeLabel(type: NodeType) {
  switch (type) {
    case 'battle':
      return 'Battle'
    case 'elite':
      return 'Elite'
    case 'event':
      return 'Shady Event'
    case 'shop':
      return 'Black Market'
    case 'boss':
      return 'Boss'
  }
}

export function RunNodeBar({
  stageNumber,
  stageName,
  nodes,
  currentNodeIndex,
}: RunNodeBarProps) {
  const [showFullMap, setShowFullMap] = useState(false)
  const runLevel = useRunStore((s) => s.runLevel)
  const runXp = useRunStore((s) => s.runXp)
  const runXpToNext = useRunStore((s) => s.runXpToNext)
  const activeRunSkills = useRunStore((s) => s.activeRunSkills)

  const totalNodes = nodes.length // 30
  // Sliding 5-node window around currentNodeIndex (1..30)
  const windowSize = 5
  const startIdx = Math.max(
    0,
    Math.min(totalNodes - windowSize, currentNodeIndex - 3),
  )
  const visibleNodes = nodes.slice(startIdx, startIdx + windowSize)

  const xpPct = Math.min(100, Math.round((runXp / Math.max(1, runXpToNext)) * 100))
  const draftedSkillEntries = Object.entries(activeRunSkills)

  return (
    <>
      {/* Streamlined Single-Row Battle Top Strip: Stage/Node + Mini Trail + Live Level XP Pill */}
      <div className="flex w-full items-center justify-between gap-1.5 border-b border-[#E2D5C1] bg-[#FFFDF9] px-2.5 py-1 pr-11 text-[#2C1810]">
        {/* Left: Stage & Node Counter */}
        <button
          type="button"
          onClick={() => setShowFullMap(true)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-[#3E2723] bg-[#F3E9D8] px-2 py-0.5 font-display text-[10px] font-black text-[#2C1810] active:scale-95"
          title="Tap to view 30-Node Adventure Map"
        >
          <span className="text-[#b45309]">S{stageNumber}</span>
          <span className="text-[#6E5A4F]">•</span>
          <span>
            {currentNodeIndex}/{totalNodes}
          </span>
        </button>

        {/* Center: Compact 5-Node Sliding Trail */}
        <div className="flex items-center gap-0.5">
          {visibleNodes.map((node, i) => {
            const idx = node.index + 1 // 1..30
            const isCleared = idx < currentNodeIndex
            const isCurrent = idx === currentNodeIndex
            const isBoss = node.type === 'boss'
            return (
              <div key={node.index} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowFullMap(true)}
                  title={`Node ${idx}: ${getNodeLabel(node.type)}`}
                  className={`relative flex h-5 w-5 items-center justify-center rounded-md border text-[8px] transition-all ${
                    isCurrent
                      ? isBoss
                        ? 'border-[#881337] bg-[#fb7185] text-white shadow scale-105'
                        : 'border-[#14532d] bg-[#22c55e] text-white shadow scale-105'
                      : isCleared
                        ? 'border-[#16a34a] bg-[#bbf7d0] text-[#15803d]'
                        : isBoss
                          ? 'border-[#9f1239] bg-[#ffe4e6] text-[#be123c]'
                          : 'border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                  }`}
                >
                  {getNodeIcon(node.type, true)}
                </button>
                {i < visibleNodes.length - 1 && (
                  <div
                    className={`h-0.5 w-1 ${
                      isCleared ? 'bg-[#16a34a]' : 'bg-[#E2D5C1]'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Right: Compact Level & XP Progress Pill + Map Icon (Clears the gear button on right) */}
        <button
          type="button"
          onClick={() => setShowFullMap(true)}
          className="flex min-w-[84px] items-center gap-1 rounded-full border border-[#3E2723] bg-[#F3E9D8] px-1.5 py-0.5 active:scale-95"
          title="View Equipped Algo Upgrades & Adventure Map"
        >
          <span className="font-display text-[9px] font-black text-[#6b21a8] shrink-0">
            LV.{runLevel}
          </span>
          <div className="relative h-2 w-7 overflow-hidden rounded-full border border-[#3E2723]/60 bg-[#2C1810]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#fde047] transition-all duration-300"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <Map className="h-3 w-3 shrink-0 text-[#78350f]" />
        </button>
      </div>

      {/* Full 30-Node Adventure Map & Active Skills Modal */}
      {showFullMap && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm"
          onClick={() => setShowFullMap(false)}
        >
          <div
            className="max-h-[86vh] w-full max-w-[385px] overflow-y-auto rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#b45309]">
                  Stage {stageNumber} • {stageName}
                </div>
                <h3 className="font-display text-lg font-extrabold text-[#2C1810]">
                  30-NODE ADVENTURE TRAIL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullMap(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#fde047] text-[#2C1810]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 3 Floors of 10 Nodes */}
            {[
              { title: 'Floor 1: Market Entry (Nodes 1–10)', range: [0, 10] },
              { title: 'Floor 2: Elite Orderbook (Nodes 11–20)', range: [10, 20] },
              { title: 'Floor 3: High Volatility (Nodes 21–30)', range: [20, 30] },
            ].map((floor) => (
              <div
                key={floor.title}
                className="mb-2.5 rounded-2xl border-2 border-[#E2D5C1] bg-[#F3E9D8] p-2.5"
              >
                <div className="mb-1.5 font-display text-[11px] font-black text-[#2C1810]">
                  {floor.title}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {nodes.slice(floor.range[0], floor.range[1]).map((node) => {
                    const idx = node.index + 1
                    const isCleared = idx < currentNodeIndex
                    const isCurrent = idx === currentNodeIndex
                    const isBoss = node.type === 'boss'
                    return (
                      <div
                        key={node.index}
                        className={`flex flex-col items-center justify-center rounded-xl border-2 py-1.5 px-1 text-center ${
                          isCurrent
                            ? 'border-[#14532d] bg-[#4ade80] text-white shadow-md scale-105'
                            : isCleared
                              ? 'border-[#16a34a] bg-[#bbf7d0] text-[#15803d]'
                              : isBoss
                                ? 'border-[#9f1239] bg-[#ffe4e6] text-[#be123c]'
                                : 'border-[#E2D5C1] bg-[#FFFDF9] text-[#2C1810]'
                        }`}
                      >
                        <div className="flex items-center gap-0.5 font-display text-[9px] font-black">
                          <span>#{idx}</span>
                          {getNodeIcon(node.type, true)}
                        </div>
                        <span className="text-[8px] font-bold truncate max-w-full">
                          {getNodeLabel(node.type)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Active Drafted Algo Upgrades */}
            <div className="mt-2 rounded-2xl border-2 border-[#7e22ce] bg-[#faf5ff] p-2.5">
              <div className="font-display text-xs font-black text-[#581c87] mb-1.5 flex items-center justify-between">
                <span>Equipped Run Algo Upgrades</span>
                <span>LEVEL {runLevel} ({runXp}/{runXpToNext} XP)</span>
              </div>
              {draftedSkillEntries.length === 0 ? (
                <p className="text-[11px] font-bold text-[#6b21a8]">
                  Defeat nodes to earn Run XP and draft 3-Card Algo Upgrades!
                </p>
              ) : (
                <div className="space-y-1.5">
                  {draftedSkillEntries.map(([skId, stars]) => {
                    const sk = RUN_SKILL_MAP[skId]
                    if (!sk) return null
                    const tierEffect = getSkillTierEffect(sk, stars)
                    return (
                      <div
                        key={skId}
                        className="flex items-center justify-between rounded-xl border border-[#c084fc] bg-white px-2.5 py-1.5"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-display text-[11px] font-black text-[#2C1810]">
                            {sk.name}
                          </div>
                          <div className="text-[9px] font-bold text-[#6b21a8] truncate">
                            {tierEffect.description}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <HybridStarBadge stars={stars} size="sm" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
