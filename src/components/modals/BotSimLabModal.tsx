import { useState } from 'react'
import {
  BarChart3,
  Check,
  Copy,
  Flame,
  Sparkles,
  Shield,
  Zap,
  X,
} from 'lucide-react'
import {
  BotSimulatorEngine,
  BOT_COHORTS,
  type BotCohortId,
  type SimulationResults,
} from '../../simulation/BotSimulatorEngine'
import { AudioSynth } from '../../engine/AudioSynth'

interface BotSimLabModalProps {
  isOpen: boolean
  onClose: () => void
}

type SimTab = 'progression' | 'meta' | 'economy' | 'report'

export function BotSimLabModal({ isOpen, onClose }: BotSimLabModalProps) {
  const [botCount, setBotCount] = useState<number>(100)
  const [simDays, setSimDays] = useState<number>(14)
  const [activeTab, setActiveTab] = useState<SimTab>('progression')

  // Simulation execution state
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [progressPct, setProgressPct] = useState<number>(0)
  const [currentSimDay, setCurrentSimDay] = useState<number>(0)
  const [results, setResults] = useState<SimulationResults | null>(null)
  const [stockpileDayTab, setStockpileDayTab] = useState<30 | 60 | 90>(30)

  // Copy report state
  const [copied, setCopied] = useState<boolean>(false)

  const handleStartSimulation = async () => {
    if (isRunning) return
    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    setIsRunning(true)
    setProgressPct(0)
    setResults(null)

    const engine = new BotSimulatorEngine(botCount, simDays)

    try {
      const res = await engine.runSimulation((pct, day) => {
        setProgressPct(pct)
        setCurrentSimDay(day)
      })
      setResults(res)
      AudioSynth.playChestOpen()
    } catch (e) {
      console.error('Simulation error:', e)
    } finally {
      setIsRunning(false)
    }
  }

  const handleCopyReport = () => {
    if (!results) return
    navigator.clipboard.writeText(results.reportMarkdown)
    setCopied(true)
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    window.setTimeout(() => setCopied(false), 3000)
  }

  if (!isOpen) return null

  const cohorts: BotCohortId[] = ['f2p_casual', 'f2p_grinder', 'minnow', 'dolphin', 'whale']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative flex max-h-[95vh] w-full max-w-[500px] flex-col overflow-hidden rounded-3xl border-[3px] border-[#7c3aed] border-b-[6px] border-b-[#5b21b6] bg-gradient-to-b from-[#1e1035] via-[#120824] to-[#0a0414] text-white shadow-2xl">
        {/* Header Marquee */}
        <div className="relative border-b-2 border-[#7c3aed]/40 bg-gradient-to-r from-[#4c1d95] via-[#5b21b6] to-[#4c1d95] p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🧪</span>
              <div>
                <div className="flex items-center gap-1.5 font-display text-[11px] font-black uppercase tracking-wider text-[#c4b5fd]">
                  <span>MONTE CARLO BOT SIM & BALANCE LAB</span>
                  <span className="rounded-full bg-[#10b981] px-1.5 py-0.2 text-[8px] font-black text-black">
                    HEADLESS
                  </span>
                </div>
                <div className="text-[10px] font-extrabold text-[#ddd6fe]">
                  Fast-Forward Multi-Cohort Economy & Combat Simulator
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#c4b5fd]/40 bg-[#2e1065] text-[#c4b5fd] hover:bg-[#3b0764] active:scale-95"
            >
              <X className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Config Controls Bar */}
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-[#7c3aed]/30 bg-[#2e1065]/80 px-2.5 py-1.5">
            {/* Bot Count Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-[#c4b5fd]">Bots:</span>
              <div className="flex gap-0.5">
                {[50, 100, 250, 500].map((count) => (
                  <button
                    key={count}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setBotCount(count)}
                    className={`rounded-lg px-1.5 py-0.5 text-[9px] font-black transition ${
                      botCount === count
                        ? 'bg-[#8b5cf6] text-white shadow'
                        : 'bg-[#1e1035] text-[#a78bfa] hover:bg-[#3b0764]'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector: 7, 14, 30, 60, 90 Days */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-[#c4b5fd]">Days:</span>
              <div className="flex gap-0.5">
                {[7, 14, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setSimDays(days)}
                    className={`rounded-lg px-1.5 py-0.5 text-[9px] font-black transition ${
                      simDays === days
                        ? 'bg-[#8b5cf6] text-white shadow'
                        : 'bg-[#1e1035] text-[#a78bfa] hover:bg-[#3b0764]'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              disabled={isRunning}
              onClick={handleStartSimulation}
              className={`rounded-xl px-3 py-1 font-display text-[10px] font-black uppercase text-white shadow transition active:scale-95 ${
                isRunning
                  ? 'bg-amber-600 animate-pulse'
                  : 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:brightness-110 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              }`}
            >
              {isRunning ? 'RUNNING...' : '🚀 SIMULATE'}
            </button>
          </div>

          {/* Real-time Progress Bar */}
          {isRunning && (
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold text-[#a78bfa]">
                <span>Simulating Cohorts: Day {currentSimDay} / {simDays} ({progressPct}% Complete)...</span>
                <span>{progressPct}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full border border-[#7c3aed]/50 bg-[#1e1035]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#10b981] transition-all duration-150"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 4 Diagnostic Sub-Tabs */}
        <div className="grid grid-cols-4 border-b border-[#7c3aed]/30 bg-[#0f051d] p-1 text-[10px] font-black">
          <button
            type="button"
            onClick={() => setActiveTab('progression')}
            className={`flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'progression'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span className="text-sm">📈</span>
            <span>Progression</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'meta'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span className="text-sm">⚖️</span>
            <span>Meta Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('economy')}
            className={`flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'economy'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span className="text-sm">💰</span>
            <span>Economy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'report'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span className="text-sm">📄</span>
            <span>AI Report</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 text-stone-200">
          {!results && !isRunning && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-5xl animate-bounce">🧪</span>
              <h4 className="mt-3 font-display text-sm font-black text-white">Monte Carlo Lab Ready</h4>
              <p className="max-w-xs mt-1 text-xs text-stone-400">
                Configure bot count and simulated days (up to 90 Days), then click <strong className="text-[#a78bfa]">🚀 SIMULATE</strong> to run hundreds of fast-forward headless player journeys.
              </p>
              <button
                type="button"
                onClick={handleStartSimulation}
                className="mt-4 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] px-6 py-2.5 font-display text-xs font-black uppercase text-white shadow-lg active:scale-95"
              >
                RUN INITIAL SIMULATION
              </button>
            </div>
          )}

          {results && activeTab === 'progression' && (
            <div className="flex flex-col gap-3.5">
              {/* Cohort Stage Milestones Table (Extended to Day 60 & Day 90) */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1.5">
                  <div className="flex items-center gap-1 font-display text-xs font-black text-[#fef08a]">
                    <BarChart3 className="h-3.5 w-3.5 text-[#a855f7]" />
                    <span>Cohort Stage Progression (90-Day Pacing)</span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-400">Avg Stage Reached</span>
                </div>

                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left font-mono text-[8.5px]">
                    <thead>
                      <tr className="border-b border-stone-700/60 text-stone-400">
                        <th className="py-1">Cohort</th>
                        <th className="py-1">Spend</th>
                        <th className="py-1">D1</th>
                        <th className="py-1">D3</th>
                        <th className="py-1">D7</th>
                        <th className="py-1">D14</th>
                        <th className="py-1">D30</th>
                        <th className="py-1">D60</th>
                        <th className="py-1">D90</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {cohorts.map((cId) => {
                        const cfg = BOT_COHORTS[cId]
                        const prog = results.progression.dayStages[cId]
                        return (
                          <tr key={cId} className="hover:bg-white/5">
                            <td className="py-1.5 font-bold" style={{ color: cfg.color }}>
                              {cfg.name}
                            </td>
                            <td className="py-1.5 text-stone-400">${cfg.spendUsd.toFixed(2)}</td>
                            <td className="py-1.5 font-bold text-white">S{prog.day1}</td>
                            <td className="py-1.5 font-bold text-white">S{prog.day3}</td>
                            <td className="py-1.5 font-bold text-white">S{prog.day7}</td>
                            <td className="py-1.5 font-bold text-[#fde047]">S{prog.day14}</td>
                            <td className="py-1.5 font-bold text-[#4ade80]">S{prog.day30}</td>
                            <td className="py-1.5 font-bold text-[#38bdf8]">S{prog.day60}</td>
                            <td className="py-1.5 font-bold text-[#c084fc]">S{prog.day90}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Combat Tension & Interception Card */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5">
                  <div className="text-[10px] font-bold text-stone-300">Combat Tension Index</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#4ade80]">
                      {results.combatTension.avgHpRemainingPct}%
                    </span>
                    <span className="text-[9px] text-stone-400">Avg HP on Win</span>
                  </div>
                  <div className="mt-1.5 flex gap-1 text-[8.5px] font-mono">
                    <span className="text-emerald-400">{results.combatTension.hpDistribution.safePct}% Safe</span>
                    <span>•</span>
                    <span className="text-amber-400">{results.combatTension.hpDistribution.tensePct}% Tense</span>
                    <span>•</span>
                    <span className="text-rose-400">{results.combatTension.hpDistribution.dangerPct}% Clutch</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5">
                  <div className="text-[10px] font-bold text-stone-300">Active Interceptions</div>
                  <div className="mt-1 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-amber-300 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Counter-Pumps:
                      </span>
                      <span className="font-black text-white">{results.combatTension.counterPumpInterruptsCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-cyan-300 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Pet Blocks:
                      </span>
                      <span className="font-black text-white">{results.combatTension.petSavesCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Choke-Point Nodes Table */}
              <div className="rounded-2xl border border-rose-900/50 bg-[#250914]/80 p-3 shadow-md">
                <div className="flex items-center justify-between border-b border-rose-900/30 pb-1.5">
                  <div className="flex items-center gap-1 font-display text-xs font-black text-rose-400">
                    <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                    <span>Deadliest Choke-Point Nodes</span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-400">Wipe Rate %</span>
                </div>

                <div className="mt-2 flex flex-col gap-1.5">
                  {results.progression.topChokePoints.map((cp, idx) => (
                    <div
                      key={`${cp.stage}_${cp.nodeNum}`}
                      className="flex items-center justify-between rounded-xl border border-rose-950/60 bg-black/40 px-2.5 py-1.5 text-[9.5px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-rose-400">#{idx + 1}</span>
                        <div>
                          <div className="font-bold text-white">
                            Stage {cp.stage} - Node {cp.nodeNum} ({cp.enemyName})
                          </div>
                          <div className="text-[8px] text-stone-400 font-mono">
                            {cp.wipes} wipes / {cp.totalAttempts} runs • Fatal: {cp.fatalHeavyAttacks} Heavy, {cp.fatalRedCounters} Red, {cp.fatalBossUltimates} Ult
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-rose-700 bg-rose-950/80 px-2 py-0.5 font-mono text-xs font-black text-rose-300">
                        {cp.wipeRatePct}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {results && activeTab === 'meta' && (
            <div className="flex flex-col gap-3.5">
              {/* Meta Skills */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1.5">
                  <span className="font-display text-xs font-black text-[#c4b5fd]">In-Run Upgrade Skills</span>
                  <span className="text-[9px] font-mono text-stone-400">Win Rate / Pick Rate</span>
                </div>

                <div className="mt-2 flex flex-col gap-1.5">
                  {results.metaBalance.allSkills.slice(0, 8).map((sk) => (
                    <div
                      key={sk.id}
                      className="flex items-center justify-between rounded-xl border border-stone-800 bg-black/30 px-2.5 py-1 text-[9.5px]"
                    >
                      <div>
                        <div className="font-bold text-white">{sk.name}</div>
                        <div className="text-[8px] text-stone-400 font-mono">
                          {sk.encounters} runs • Pick: {sk.pickRatePct}%
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-1.5 py-0.2 text-[8px] font-black uppercase ${
                            sk.balanceStatus === 'overpowered'
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : sk.balanceStatus === 'underpowered'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          }`}
                        >
                          {sk.balanceStatus}
                        </span>
                        <span className="font-mono font-black text-white">{sk.winRatePct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta Coins */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1.5">
                  <span className="font-display text-xs font-black text-[#c4b5fd]">Coins Performance</span>
                  <span className="text-[9px] font-mono text-stone-400">Win Rate</span>
                </div>

                <div className="mt-2 flex flex-col gap-1.5">
                  {results.metaBalance.allCoins.slice(0, 6).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-stone-800 bg-black/30 px-2.5 py-1 text-[9.5px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="rounded bg-white/10 px-1 text-[8px] font-mono text-stone-400 uppercase">
                          {c.rarity}
                        </span>
                      </div>
                      <span className="font-mono font-black text-[#fde047]">{c.winRatePct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {results && activeTab === 'economy' && (
            <div className="flex flex-col gap-3.5">
              {/* Feature Engagement: Pets, Rig Gear-Score & Wheel Spins */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1.5">
                  <span className="font-display text-xs font-black text-[#fde047]">
                    Feature Engagement (Pets, Rig & Spins)
                  </span>
                  <span className="text-[9px] font-mono text-stone-400">Day 30 / 60 / 90</span>
                </div>

                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left font-mono text-[8.5px]">
                    <thead>
                      <tr className="border-b border-stone-700/60 text-stone-400">
                        <th className="py-1">Cohort</th>
                        <th className="py-1">Pet Lv (30/60/90)</th>
                        <th className="py-1">Gear-Score (30/60/90)</th>
                        <th className="py-1">Gala Wheel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {cohorts.map((cId) => {
                        const cfg = BOT_COHORTS[cId]
                        const fe = results.economy.featureEngagement[cId]
                        const wp = results.economy.seasonWheelPulls[cId]
                        return (
                          <tr key={cId}>
                            <td className="py-1 font-bold" style={{ color: cfg.color }}>
                              {cfg.name}
                            </td>
                            <td className="py-1 text-white">
                              {fe.avgPetLevelDay30} / {fe.avgPetLevelDay60} / {fe.avgPetLevelDay90}
                            </td>
                            <td className="py-1 text-cyan-300">
                              {fe.avgGearScoreDay30?.toLocaleString()} / {fe.avgGearScoreDay60?.toLocaleString()} / {fe.avgGearScoreDay90?.toLocaleString()}
                            </td>
                            <td className="py-1 text-amber-300 font-bold">
                              {wp.avgPulls} pulls
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Season 1 100-Pull Lady Fortuna Milestone */}
              <div className="rounded-2xl border border-amber-600/50 bg-[#2d1b06]/80 p-3 shadow-md">
                <div className="flex items-center justify-between border-b border-amber-800/40 pb-1.5">
                  <div className="flex items-center gap-1 font-display text-xs font-black text-[#fde047]">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Season 1 Fortuna 100-Pull Attainment</span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-400">Target: 100 Pulls</span>
                </div>

                <div className="mt-2 flex flex-col gap-2">
                  {cohorts.map((cId) => {
                    const cfg = BOT_COHORTS[cId]
                    const wp = results.economy.seasonWheelPulls[cId]
                    const pct = Math.min(100, wp.avgPulls)
                    return (
                      <div key={cId} className="flex flex-col gap-0.5 text-[9px]">
                        <div className="flex items-center justify-between font-mono font-bold">
                          <span style={{ color: cfg.color }}>{cfg.name}</span>
                          <span>
                            {wp.avgPulls} / 100 Pulls ({wp.reached100MilestonePct}% guarantee)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-black/50 overflow-hidden border border-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Currency Stockpiles Table with Day Selector */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1.5">
                  <span className="font-display text-xs font-black text-[#c4b5fd]">
                    Unspent Stockpiles
                  </span>
                  <div className="flex gap-1">
                    {([30, 60, 90] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setStockpileDayTab(d)}
                        className={`rounded px-1.5 py-0.2 text-[8px] font-bold ${
                          stockpileDayTab === d ? 'bg-[#8b5cf6] text-white' : 'bg-black/40 text-stone-400'
                        }`}
                      >
                        Day {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left font-mono text-[8.5px]">
                    <thead>
                      <tr className="border-b border-stone-700/60 text-stone-400">
                        <th className="py-1">Cohort</th>
                        <th className="py-1">⚡ Hashrate</th>
                        <th className="py-1">💎 Gems</th>
                        <th className="py-1">📐 Blueprints</th>
                        <th className="py-1">🔧 Wire</th>
                        <th className="py-1">🦴 Treats</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {cohorts.map((cId) => {
                        const cfg = BOT_COHORTS[cId]
                        const st = stockpileDayTab === 90
                          ? results.economy.stockpiles[cId].day90
                          : stockpileDayTab === 60
                          ? results.economy.stockpiles[cId].day60
                          : results.economy.stockpiles[cId].day30
                        return (
                          <tr key={cId}>
                            <td className="py-1 font-bold" style={{ color: cfg.color }}>
                              {cfg.name}
                            </td>
                            <td className="py-1 text-white">{st.hashrate.toLocaleString()}</td>
                            <td className="py-1 text-[#38bdf8]">{st.gems}</td>
                            <td className="py-1 text-[#fde047]">{st.blueprints}</td>
                            <td className="py-1 text-emerald-300">{st.solderWire}</td>
                            <td className="py-1 text-amber-300">{st.petTreats}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 90-Day Health Diagnostics */}
              <div className="flex flex-col gap-1.5">
                {cohorts.slice(0, 4).map((cId) => {
                  const cfg = BOT_COHORTS[cId]
                  const lh = results.economy.longTermHealth[cId]
                  return (
                    <div
                      key={cId}
                      className="rounded-xl border border-stone-800 bg-[#120824] p-2 text-[9px]"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span style={{ color: cfg.color }}>{cfg.name}</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[8px] font-black uppercase ${
                            lh.status === 'healthy'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : lh.status === 'hyperinflation'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-700'
                          }`}
                        >
                          {lh.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-stone-400">{lh.details}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {results && activeTab === 'report' && (
            <div className="flex flex-col gap-3">
              {/* 1-Tap Copy Full Summary to Clipboard Button */}
              <button
                type="button"
                onClick={handleCopyReport}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 font-display text-xs font-black uppercase text-white shadow-xl transition active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:brightness-110'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>✅ COPIED! PASTE INTO CHAT FOR AI ANALYSIS</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 stroke-[2.5]" />
                    <span>📋 COPY FULL SUMMARY TO CLIPBOARD</span>
                  </>
                )}
              </button>

              {/* Markdown Display Block */}
              <div className="relative rounded-2xl border border-stone-800 bg-black/60 p-3 font-mono text-[9px] text-stone-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">
                {results.reportMarkdown}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
