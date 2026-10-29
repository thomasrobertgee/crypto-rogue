import { useMemo } from 'react'
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Server,
  Key,
  Gem,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { GROWTH_EVENT_ROTATION } from '../config/economy.config'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtNum } from '../engine/format'
import { useMetaStore } from '../state/useMetaStore'
import { TopCurrencyBar } from '../components/GameArtwork'

const RIVAL_NAMES = [
  'SatoshiWhale99', '0xMevBot', 'DiamondApe', 'RugPullSurvivor', 'MoonBagHolder',
  'GasFeeMaxi', 'LeverageKing', 'ShortTheSec', 'YieldFarmer42', 'ZkRollupChad',
  'FlashLoanGod', 'PumpSignalVIP', 'ColdWalletPro', 'HashrateBaron', 'DeFiDegen88',
  'SolanaSniper', 'ValidatorNode7', 'LiquidatorPrime', 'ArbitrageFox', 'MempoolShark',
  'BlockZeroOG', 'QuantumHodler', 'GenesisMiner', 'WhaleWatcher', 'AlphaLeak',
]

export function EventsLiveOpsScreen() {
  const meta = useMetaStore()
  const activeWeek = meta.activeGrowthWeek ?? 1
  const activeEvent =
    GROWTH_EVENT_ROTATION.find((e) => e.week === activeWeek) ?? GROWTH_EVENT_ROTATION[0]

  const playerPts = meta.growthPointsByWeek?.[activeWeek] ?? 0

  // Dynamic 50-player micro-bracket scaling around the player's current score
  const bracket = useMemo(() => {
    const baseAnchor = Math.max(120, Math.round(playerPts * 1.18 + 60))
    const rivals = Array.from({ length: 49 }, (_, idx) => {
      const name =
        RIVAL_NAMES[idx % RIVAL_NAMES.length] +
        (idx >= RIVAL_NAMES.length ? `_${idx + 1}` : '')
      const factor = Math.pow(0.935, idx)
      const jitter = ((idx * 17 + activeWeek * 31) % 19) - 9
      const pts = Math.max(5, Math.round(baseAnchor * factor + jitter))
      return { id: `rival_${idx}`, name, points: pts, isPlayer: false }
    })

    const all = [
      ...rivals,
      { id: 'player', name: 'YOU (TRADER)', points: playerPts, isPlayer: true },
    ]
    all.sort((a, b) => b.points - a.points || (a.isPlayer ? -1 : 1))
    return all.map((entry, idx) => ({ ...entry, rank: idx + 1 }))
  }, [playerPts, activeWeek])

  const playerEntry = bracket.find((b) => b.isPlayer)!
  const rank3Score = bracket[2]?.points ?? 0
  const rank1Score = bracket[0]?.points ?? 0
  const pointsToTop3 = Math.max(0, rank3Score - playerPts + (playerEntry.rank > 3 ? 5 : 0))
  const pointsToRank1 = Math.max(0, rank1Score - playerPts + (playerEntry.rank > 1 ? 5 : 0))

  const handleSelectWeek = (week: 1 | 2 | 3) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    meta.setActiveGrowthWeek(week)
  }

  const handleSimulateBoost = () => {
    AudioSynth.unlock()
    AudioSynth.playGreenCandle()
    const bonus = activeWeek === 1 ? 40 : activeWeek === 2 ? 50 : 100
    meta.addGrowthEventPoints(activeWeek, bonus)
  }

  return (
    <div className="flex h-full w-full flex-col gap-2.5 overflow-y-auto arcade-screen-bg p-3">
      {/* Top 3 Glossy Currency Pill Capsules */}
      <TopCurrencyBar
        hashrate={meta.hashrate}
        gems={meta.gems}
        silverKeys={meta.silverKeys}
        quantumKeys={meta.quantumKeys}
        isVipAdFree={meta.isVipAdFree}
      />

      {/* Server Shard Badge */}
      <div className="flex items-center justify-between rounded-xl border border-[#38bdf8]/40 bg-[#141b2d] px-3 py-1.5 shadow-inner">
        <div className="flex items-center gap-1.5 font-display text-[11px] font-bold text-[#38bdf8]">
          <Server className="h-3.5 w-3.5 animate-pulse" />
          <span>Exchange Floor #042 • Bracket #07 (50/50 Traders)</span>
        </div>
        <span className="rounded-full bg-[#22ff99]/20 px-2 py-0.5 font-display text-[9px] font-extrabold text-[#22ff99]">
          LIVE
        </span>
      </div>

      {/* Toggleable 3-Week Growth Event Loop Switcher */}
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#141b2d] p-1.5 border border-white/10">
        {GROWTH_EVENT_ROTATION.map((ev) => {
          const isSelected = ev.week === activeWeek
          return (
            <button
              key={ev.id}
              type="button"
              onClick={() => handleSelectWeek(ev.week)}
              className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-1 text-center transition-all ${
                isSelected
                  ? 'btn-3d-gold active:border-b-0 active:translate-y-0.5'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="font-display text-[9px] font-extrabold uppercase">
                WEEK {ev.week}
              </span>
              <span className="truncate w-full font-display text-[10px] font-extrabold">
                {ev.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Event Card & Top 3 Target Callout */}
      <div className="flex flex-col gap-2 rounded-2xl arcade-card p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#facc15] bg-gradient-to-b from-[#ca8a04] to-[#854d0e] text-[#fef08a] shadow">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-sm font-extrabold text-[#2C1810]">
                {activeEvent.name}
              </h2>
              <p className="text-[11px] font-semibold text-[#6E5A4F]">{activeEvent.description}</p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[9px] font-bold uppercase text-[#6E5A4F]">Your Score</div>
            <div className="font-display text-sm font-extrabold text-[#0284c7]">
              {fmtNum(playerPts)} pts
            </div>
          </div>
        </div>

        {/* Dynamic Points Needed to Break Into Rank #1-#3 Banner */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#121728] px-3 py-2 shadow-inner">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#22ff99]" />
            <div className="text-[11px] font-semibold">
              {playerEntry.rank <= 3 ? (
                <span className="font-bold text-[#22ff99]">
                  You are Rank #{playerEntry.rank} (Mythical Key Zone!)
                  {playerEntry.rank > 1 && ` · ${fmtNum(pointsToRank1)} pts to #1`}
                </span>
              ) : (
                <span className="text-white/90">
                  Need{' '}
                  <strong className="font-display text-xs font-extrabold text-[#fde047]">
                    +{fmtNum(pointsToTop3)} pts
                  </strong>{' '}
                  for <strong className="text-[#22ff99]">Rank #1–#3</strong> Mythical Key Payout!
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimulateBoost}
            className="shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10px] font-extrabold btn-3d-purple active:border-b-0 active:translate-y-0.5"
            title="Simulate earning event points"
          >
            <Sparkles className="h-3 w-3" /> +PTS
          </button>
        </div>

        {/* End-of-Week Payout Tiers */}
        <div className="grid grid-cols-3 gap-1.5">
          {activeEvent.rankRewards.slice(0, 3).map((r, i) => {
            const qKeys = r.reward.find((x) => x.currency === 'quantumKey')?.amount ?? 0
            const gems = r.reward.find((x) => x.currency === 'gems')?.amount ?? 0
            return (
              <div
                key={i}
                className="flex flex-col items-center rounded-xl border border-white/15 bg-[#121728] p-2 text-center shadow-inner"
              >
                <div className="flex items-center gap-1 font-display text-[10px] font-extrabold text-white">
                  <Crown
                    className={`h-3.5 w-3.5 ${
                      i === 0
                        ? 'text-[#fde047]'
                        : i === 1
                          ? 'text-slate-300'
                          : 'text-amber-500'
                    }`}
                  />
                  {r.rankFrom === r.rankTo ? `RANK #1` : `RANK #${r.rankFrom}-#${r.rankTo}`}
                </div>
                <div className="mt-0.5 flex items-center gap-1 font-display text-[10px] font-bold text-[#c084fc]">
                  <Key className="h-3 w-3" /> +{qKeys} Keys
                </div>
                <div className="flex items-center gap-1 font-display text-[9px] font-bold text-[#fde047]">
                  <Gem className="h-2.5 w-2.5" /> +{fmtNum(gems)} Gems
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 50-Player Micro-Bracket Leaderboard */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden rounded-2xl arcade-card p-2.5">
        <div className="flex items-center justify-between px-2 font-display text-[10px] font-extrabold uppercase text-[#6E5A4F]">
          <span>Rank &amp; Trader ({bracket.length}/50)</span>
          <span>Weekly Score</span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {bracket.map((row) => {
            const isTop3 = row.rank <= 3
            return (
              <div
                key={row.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold ${
                  row.isPlayer
                    ? 'border-[#22ff99] bg-[#064e3b] font-extrabold text-[#22ff99] shadow-md'
                    : isTop3
                      ? 'border-[#facc15]/50 bg-gradient-to-r from-[#854d0e]/50 to-[#1e293b] text-white'
                      : 'border-white/10 bg-[#141b2d] text-white/85'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-7 font-display text-xs font-extrabold ${
                      isTop3 ? 'text-[#fde047]' : 'text-white/50'
                    }`}
                  >
                    #{row.rank}
                  </span>
                  {isTop3 && <Medal className="h-4 w-4 shrink-0 text-[#fde047]" />}
                  <span className="truncate font-display">{row.name}</span>
                  {isTop3 && (
                    <span className="rounded-full bg-[#a855f7]/30 px-1.5 py-0.5 font-display text-[8px] font-extrabold text-[#e9d5ff]">
                      KEY PRIZE
                    </span>
                  )}
                </div>

                <span className="flex shrink-0 items-center gap-1 font-display font-extrabold text-[#38bdf8]">
                  <Flame className="h-3.5 w-3.5 text-[#fb7185]" /> {fmtNum(row.points)} pts
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
