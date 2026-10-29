import { useState } from 'react'
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import type { RunEventChoice, RunEventConfig, RunEventOutcome } from '../../types/game.types'
import { RELICS, RELIC_MAP } from '../../config/relics.config'
import { pickByRarity } from '../../engine/economy'
import { fmtUsd } from '../../engine/format'
import { DynamicIcon } from '../DynamicIcon'
import { ModalMarginHpBar } from './ModalMarginHpBar'

interface ShadyEventModalProps {
  event: RunEventConfig
  totalCash: number
  marginHp: number
  maxMarginHp: number
  onApplyOutcome: (outcome: RunEventOutcome, cost?: { cash?: number; marginHp?: number }) => string[]
  onContinue: () => void
}

const RISK_BADGE: Record<RunEventChoice['risk'], string> = {
  safe: 'bg-[#dcfce7] text-[#166534] border-[#15803d]',
  risky: 'bg-[#fef3c7] text-[#92400e] border-[#d97706]',
  degen: 'bg-[#ffe4e6] text-[#9f1239] border-[#be123c]',
}

export function ShadyEventModal({
  event,
  totalCash,
  marginHp,
  maxMarginHp,
  onApplyOutcome,
  onContinue,
}: ShadyEventModalProps) {
  const [resolved, setResolved] = useState<{
    outcome: RunEventOutcome
    logs: string[]
  } | null>(null)

  const handleChoose = (choice: RunEventChoice) => {
    if (resolved) return
    let r = Math.random()
    let picked = choice.outcomes[choice.outcomes.length - 1]
    for (const o of choice.outcomes) {
      if (r < o.chance) {
        picked = o
        break
      }
      r -= o.chance
    }
    const logs = onApplyOutcome(picked, choice.cost)
    setResolved({ outcome: picked, logs })
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-[#F3E8FF] text-[#7E22CE] shadow-xs">
              <DynamicIcon name={event.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-[9.5px] font-black uppercase tracking-wider text-[#7E22CE]">
                SHADY ENCOUNTER
              </span>
              <h2 className="truncate font-display text-sm font-black text-[#2C1810]">
                {event.title}
              </h2>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-[#86efac] bg-[#dcfce7] px-2.5 py-1 text-right shadow-xs">
            <div className="font-display text-[8.5px] font-black uppercase text-[#166534]">Portfolio</div>
            <div className="font-display text-xs font-black text-[#15803d]">{fmtUsd(totalCash)}</div>
          </div>
        </div>

        {/* Live Reactive Margin HP Bar */}
        <ModalMarginHpBar currentHp={marginHp} maxHp={maxMarginHp} />

        <p className="rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3 text-xs font-semibold leading-relaxed text-[#2C1810]">
          {event.description}
        </p>

        {!resolved ? (
          <div className="flex flex-col gap-2">
            {event.choices.map((c) => {
              const cashCost = c.cost?.cash ?? 0
              const hpCost = c.cost?.marginHp ?? 0
              const canAfford = totalCash >= cashCost && marginHp > hpCost

              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handleChoose(c)}
                  className={`flex flex-col gap-1 rounded-2xl p-3 text-left transition active:translate-y-0.5 ${
                    canAfford
                      ? 'border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] hover:bg-[#FEF3C7] text-[#2C1810] shadow-xs'
                      : 'cursor-not-allowed border border-[#E2D5C1] bg-[#F3E9D8] opacity-55 text-[#6E5A4F]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xs font-extrabold text-[#2C1810]">
                      {c.label}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-display text-[9px] font-black uppercase ${
                        RISK_BADGE[c.risk]
                      }`}
                    >
                      {c.risk}
                    </span>
                  </div>

                  {c.cost && (
                    <div className="font-display text-[10px] font-extrabold text-[#b45309]">
                      Cost: {cashCost > 0 ? fmtUsd(cashCost) : ''}{' '}
                      {hpCost > 0 ? `-${hpCost} Margin HP` : ''}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border-2 border-[#15803d] bg-[#dcfce7] p-3">
              <div className="flex items-center gap-1.5 font-display text-xs font-extrabold text-[#166534]">
                <Sparkles className="h-4 w-4" /> OUTCOME
              </div>
              <p className="mt-1 text-xs font-bold text-[#2C1810]">{resolved.outcome.text}</p>
              {resolved.logs.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1 border-t border-[#86efac] pt-2 font-display text-[11px] font-extrabold text-[#166534]">
                  {resolved.logs.map((l, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16a34a]" />
                      {l}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="w-full rounded-2xl py-3 font-display text-xs font-black tracking-wider text-white btn-3d-green game-text-outline-sm active:translate-y-0.5"
            >
              CONTINUE RUN
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#E2D5C1] pt-2 font-display text-[10px] font-extrabold text-[#6E5A4F]">
          <span className="flex items-center gap-1 text-[#2C1810]">
            <AlertCircle className="h-3.5 w-3.5 text-[#d97706]" /> Portfolio: {fmtUsd(totalCash)}
          </span>
          <span className="text-[#2C1810]">Margin HP: {Math.ceil(marginHp)}</span>
        </div>
      </div>
    </div>
  )
}

export { RELICS, RELIC_MAP, pickByRarity }
