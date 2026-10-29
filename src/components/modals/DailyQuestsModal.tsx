import { X, Gift, CheckCircle2, ClipboardList, Gem, Key, Cpu } from 'lucide-react'
import {
  DAILY_QUESTS,
  DAILY_QUEST_TRACK_MAX,
  DAILY_TRACK_MILESTONES,
} from '../../config/economy.config'
import { AudioSynth } from '../../engine/AudioSynth'
import { useMetaStore } from '../../state/useMetaStore'

interface DailyQuestsModalProps {
  onClose: () => void
}

export function DailyQuestsModal({ onClose }: DailyQuestsModalProps) {
  const meta = useMetaStore()

  const totalPoints = DAILY_QUESTS.filter((q) =>
    meta.claimedDailyQuestIds.includes(q.id),
  ).reduce((sum, q) => sum + q.points, 0)

  const progressPct = Math.min(100, (totalPoints / DAILY_QUEST_TRACK_MAX) * 100)

  const handleClaimQuest = (questId: string) => {
    AudioSynth.unlock()
    if (meta.claimDailyQuest(questId)) {
      AudioSynth.playGreenCandle()
    }
  }

  const handleClaimMilestone = (points: number) => {
    AudioSynth.unlock()
    if (meta.claimDailyMilestone(points)) {
      AudioSynth.playChestOpen()
    }
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90%] w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white shadow">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-[10px] font-black uppercase tracking-wider text-[#0284c7]">
                DAILY TRADER OPERATIONS
              </span>
              <h3 className="font-display text-base font-extrabold text-[#2C1810]">
                100-PT DAILY QUESTS
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] text-[#2C1810] hover:bg-[#fde68a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Top 100-Point Milestone Progress Bar & Clickable Reward Chests */}
        <div className="flex flex-col gap-2.5 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3">
          <div className="flex items-center justify-between font-display text-xs">
            <span className="font-extrabold text-[#2C1810]">Daily Activity Score</span>
            <span className="font-black text-[#0284c7]">
              {totalPoints} / {DAILY_QUEST_TRACK_MAX} PTS
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full border border-[#3E2723]/40 bg-[#E5DEC9]">
            <div
              className="h-full bg-gradient-to-r from-[#0284c7] via-[#16a34a] to-[#eab308] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* 5 Clickable Milestone Chests (20, 40, 60, 80, 100 pts) */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {DAILY_TRACK_MILESTONES.map((ms) => {
              const claimed = meta.claimedDailyMilestones.includes(ms.points)
              const unlocked = totalPoints >= ms.points && !claimed
              const gemReward = ms.reward.find((r) => r.currency === 'gems')?.amount ?? 0
              const keyReward = ms.reward.find(
                (r) => r.currency === 'silverKey' || r.currency === 'quantumKey',
              )

              return (
                <button
                  key={ms.points}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => handleClaimMilestone(ms.points)}
                  className={`flex flex-col items-center justify-between gap-1 rounded-xl p-1.5 text-center transition ${
                    claimed
                      ? 'border border-[#86efac] bg-[#dcfce7] text-[#166534]'
                      : unlocked
                        ? 'btn-3d-gold animate-bounce text-[#2C1810]'
                        : 'border border-[#E2D5C1] bg-[#FFFDF9] text-[#6E5A4F]'
                  }`}
                >
                  <span className="font-display text-[9px] font-extrabold">{ms.points}PT</span>
                  {claimed ? (
                    <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                  ) : (
                    <Gift className="h-4 w-4 text-[#d97706]" />
                  )}
                  <div className="flex flex-col font-display text-[9px] font-extrabold leading-tight">
                    <span>+{gemReward}G</span>
                    {keyReward && (
                      <span>
                        +{keyReward.amount}
                        {keyReward.currency === 'quantumKey' ? 'Q' : 'S'}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 5 Daily Tasks (20 pts each) */}
        <div className="flex flex-col gap-2">
          {DAILY_QUESTS.map((q) => {
            const current = meta.dailyMetrics[q.metric] ?? 0
            const claimed = meta.claimedDailyQuestIds.includes(q.id)
            const ready = current >= q.target && !claimed
            const barPct = Math.min(100, (current / q.target) * 100)
            const r = q.reward[0]

            return (
              <div
                key={q.id}
                className="flex items-center justify-between gap-2.5 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xs font-extrabold text-[#2C1810]">
                      {q.description}
                    </span>
                    <span className="rounded-full border border-[#7dd3fc] bg-[#e0f2fe] px-2 py-0.5 font-display text-[9px] font-extrabold text-[#0369a1]">
                      +{q.points} PTS
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full border border-[#E2D5C1] bg-[#FFFDF9]">
                      <div
                        className="h-full bg-gradient-to-r from-[#0284c7] to-[#16a34a] transition-all"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="font-display text-[10px] font-bold text-[#6E5A4F]">
                      {Math.min(current, q.target)}/{q.target}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 font-display text-[10px] font-extrabold text-[#b45309]">
                    {r.currency === 'gems' ? (
                      <Gem className="h-3 w-3 text-[#d97706]" />
                    ) : r.currency === 'silverKey' || r.currency === 'quantumKey' ? (
                      <Key className="h-3 w-3 text-[#7e22ce]" />
                    ) : (
                      <Cpu className="h-3 w-3 text-[#0284c7]" />
                    )}
                    <span>
                      Reward: +{r.amount}{' '}
                      {r.currency === 'gems'
                        ? 'Satoshi Gems'
                        : r.currency === 'silverKey'
                          ? 'Silver Key'
                          : 'Hashrate'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => handleClaimQuest(q.id)}
                  className={`shrink-0 rounded-xl px-3 py-2 font-display text-xs font-black ${
                    claimed
                      ? 'border border-[#86efac] bg-[#dcfce7] text-[#166534]'
                      : ready
                        ? 'btn-3d-green text-white game-text-outline-sm active:translate-y-0.5'
                        : 'cursor-not-allowed border border-[#E2D5C1] bg-[#E5DEC9] text-[#8C7A6B]'
                  }`}
                >
                  {claimed ? 'DONE' : ready ? 'CLAIM' : 'GO'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
