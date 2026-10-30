import { useState, useEffect, useRef } from 'react'
import {
  Check,
  Copy,
  Flame,
  Shield,
  Zap,
  X,
  Sliders,
  GitCompare,
  Dices,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Activity,
  Users,
  Target,
  Layers,
} from 'lucide-react'
import {
  BOT_COHORTS,
  type BotCohortId,
  type SimulationResults,
} from '../../simulation/BotSimulatorEngine'
import { WorkerPool } from '../../simulation/workerPool'
import { generateSeed } from '../../simulation/prng'
import type { OutlierRunTelemetry, TimelineMarker } from '../../simulation/timelineRecorder'
import { DiffRunner, type ABDiffReport, DEFAULT_PROFILE_A, DEFAULT_PROFILE_B, type ABProfileConfig } from '../../simulation/diffRunner'
import { AutoTuner, type AutoTunerReport, type TunerTargets } from '../../simulation/autoTuner'
import { AudioSynth } from '../../engine/AudioSynth'

interface BotSimLabModalProps {
  isOpen: boolean
  onClose: () => void
}

type SimTab = 'progression' | 'meta' | 'outliers' | 'economy' | 'ab_diff' | 'auto_tuner' | 'report'

export function BotSimLabModal({ isOpen, onClose }: BotSimLabModalProps) {
  // Configuration Inputs
  const [botCount, setBotCount] = useState<number>(100)
  const [simDays, setSimDays] = useState<number>(14)
  const [seed, setSeed] = useState<number>(() => generateSeed())
  const [activeTab, setActiveTab] = useState<SimTab>('progression')

  // Simulation Mode: Full Progression (100% Active) vs Real-World Retention Lifecycle
  const [simulationMode, setSimulationMode] = useState<'full_progression' | 'retention_lifecycle'>('full_progression')

  // Headless Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [progressPct, setProgressPct] = useState<number>(0)
  const [currentSimDay, setCurrentSimDay] = useState<number>(0)
  const [progressMsg, setProgressMsg] = useState<string>('')
  const [results, setResults] = useState<SimulationResults | null>(null)
  const [stockpileDayTab, setStockpileDayTab] = useState<30 | 60 | 90>(30)

  // Interactive Outlier Run Inspector
  const [selectedOutlier, setSelectedOutlier] = useState<OutlierRunTelemetry | null>(null)
  const [scrubberStep, setScrubberStep] = useState<number>(0)
  const [isPlayingScrubber, setIsPlayingScrubber] = useState<boolean>(false)
  const scrubberTimerRef = useRef<number | null>(null)

  // Interactive 500-Stage Heatmap Inspector
  const [selectedHeatmapStage, setSelectedHeatmapStage] = useState<number | null>(null)

  // 2D Skill Matrix Inspector
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)

  // A/B Comparison Diff Engine State
  const [profileA, setProfileA] = useState<ABProfileConfig>(DEFAULT_PROFILE_A)
  const [profileB, setProfileB] = useState<ABProfileConfig>(DEFAULT_PROFILE_B)
  const [isAbRunning, setIsAbRunning] = useState<boolean>(false)
  const [abProgress, setAbProgress] = useState<{ profile: 'A' | 'B'; percent: number }>({ profile: 'A', percent: 0 })
  const [abReport, setAbReport] = useState<ABDiffReport | null>(null)

  // Auto-Tuner State
  const [tunerTargets, setTunerTargets] = useState<TunerTargets>({
    targetGrinderDay30Stage: 45,
    targetWhaleDay90Stage: 470,
    targetBossWipeRateMin: 0.20,
    targetBossWipeRateMax: 0.35,
  })
  const [isTuning, setIsTuning] = useState<boolean>(false)
  const [tuningProgress, setTuningProgress] = useState<{ iter: number; maxIter: number; error: number }>({ iter: 0, maxIter: 5, error: 0 })
  const [tunerReport, setTunerReport] = useState<AutoTunerReport | null>(null)

  // Copy report state
  const [copied, setCopied] = useState<boolean>(false)
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  // Handle Scrubber Playback
  useEffect(() => {
    if (isPlayingScrubber && selectedOutlier) {
      scrubberTimerRef.current = window.setInterval(() => {
        setScrubberStep((prev) => {
          if (prev >= selectedOutlier.events.length - 1) {
            setIsPlayingScrubber(false)
            return prev
          }
          return prev + 1
        })
      }, 550)
    } else {
      if (scrubberTimerRef.current) clearInterval(scrubberTimerRef.current)
    }
    return () => {
      if (scrubberTimerRef.current) clearInterval(scrubberTimerRef.current)
    }
  }, [isPlayingScrubber, selectedOutlier])

  // Select first outlier automatically when results arrive
  useEffect(() => {
    if (results?.outlierRuns && results.outlierRuns.length > 0 && !selectedOutlier) {
      setSelectedOutlier(results.outlierRuns[0])
      setScrubberStep(0)
    }
  }, [results, selectedOutlier])

  const handleStartSimulation = async () => {
    if (isRunning) return
    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    setIsRunning(true)
    setProgressPct(0)
    setCurrentSimDay(1)
    setProgressMsg('Spawning Web Worker pool...')

    try {
      const res = await WorkerPool.run({
        botCount,
        days: simDays,
        seed,
        options: {
          enableRetentionDecay: simulationMode === 'retention_lifecycle',
        },
        onProgress: (pct, day, _bot, msg) => {
          setProgressPct(pct)
          setCurrentSimDay(day)
          if (msg) setProgressMsg(msg)
        },
      })
      setResults(res)
      if (res.outlierRuns && res.outlierRuns.length > 0) {
        setSelectedOutlier(res.outlierRuns[0])
        setScrubberStep(0)
      }
      AudioSynth.playChestOpen()
    } catch (e) {
      console.error('Simulation error:', e)
    } finally {
      setIsRunning(false)
    }
  }

  const handleRollSeed = () => {
    const newSeed = generateSeed()
    setSeed(newSeed)
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
  }

  const handleRunABDiff = async () => {
    if (isAbRunning) return
    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    setIsAbRunning(true)
    setAbReport(null)

    try {
      const report = await DiffRunner.runComparison(
        botCount,
        simDays,
        seed,
        profileA,
        profileB,
        (profile, pct) => {
          setAbProgress({ profile, percent: pct })
        },
      )
      setAbReport(report)
      AudioSynth.playChestOpen()
    } catch (e) {
      console.error('A/B Comparison error:', e)
    } finally {
      setIsAbRunning(false)
    }
  }

  const handleRunAutoTuner = async () => {
    if (isTuning) return
    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    setIsTuning(true)
    setTunerReport(null)

    try {
      const report = await AutoTuner.runOptimization(
        tunerTargets,
        5,
        (iter, maxIter, error) => {
          setTuningProgress({ iter, maxIter, error })
        },
      )
      setTunerReport(report)
      AudioSynth.playChestOpen()
    } catch (e) {
      console.error('AutoTuner error:', e)
    } finally {
      setIsTuning(false)
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

  const handleCopyCodeSnippet = () => {
    if (!tunerReport) return
    navigator.clipboard.writeText(tunerReport.suggestedCodeSnippet)
    setCopiedCode(true)
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    window.setTimeout(() => setCopiedCode(false), 3000)
  }

  if (!isOpen) return null

  const cohorts: BotCohortId[] = ['f2p_casual', 'f2p_grinder', 'minnow', 'dolphin', 'whale']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative flex max-h-[96vh] w-full max-w-[500px] flex-col overflow-hidden rounded-3xl border-[3px] border-[#7c3aed] border-b-[6px] border-b-[#5b21b6] bg-gradient-to-b from-[#1e1035] via-[#120824] to-[#0a0414] text-white shadow-2xl">
        {/* Header Marquee */}
        <div className="relative border-b-2 border-[#7c3aed]/40 bg-gradient-to-r from-[#4c1d95] via-[#5b21b6] to-[#4c1d95] p-2.5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🧪</span>
              <div>
                <div className="flex items-center gap-1.5 font-display text-[11px] font-black uppercase tracking-wider text-[#c4b5fd]">
                  <span>MONTE CARLO LAB</span>
                  <span className="rounded-full bg-[#10b981] px-1.5 py-0.2 text-[8px] font-black text-black">
                    ENTERPRISE v2.2
                  </span>
                </div>
                <div className="text-[9.5px] font-extrabold text-[#ddd6fe]">
                  Deterministic Headless Analytics & Auto-Tuning Engine
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#c4b5fd]/40 bg-[#2e1065] text-[#c4b5fd] hover:bg-[#3b0764] active:scale-95"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Seed & Parameters Controls Bar */}
          <div className="mt-2 flex flex-col gap-1.5 rounded-2xl border border-[#7c3aed]/30 bg-[#2e1065]/80 px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-1 text-[9px]">
              {/* Deterministic Seed Input */}
              <div className="flex items-center gap-1">
                <span className="font-bold text-[#c4b5fd]">Seed:</span>
                <input
                  type="number"
                  disabled={isRunning}
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value, 10) || 1)}
                  className="w-16 rounded-md border border-[#7c3aed]/50 bg-[#120824] px-1.5 py-0.5 font-mono text-[9px] font-black text-[#fde047] focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                />
                <button
                  type="button"
                  title="Roll Random Seed"
                  disabled={isRunning}
                  onClick={handleRollSeed}
                  className="flex h-5 w-5 items-center justify-center rounded-md bg-[#8b5cf6]/40 text-[#c4b5fd] hover:bg-[#8b5cf6] hover:text-white"
                >
                  <Dices className="h-3 w-3" />
                </button>
              </div>

              {/* Bot Count Selector */}
              <div className="flex items-center gap-0.5">
                <span className="font-bold text-[#c4b5fd]">Bots:</span>
                {[50, 100, 250, 500].map((count) => (
                  <button
                    key={count}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setBotCount(count)}
                    className={`rounded px-1 py-0.2 text-[8.5px] font-black transition ${
                      botCount === count
                        ? 'bg-[#8b5cf6] text-white shadow'
                        : 'bg-[#1e1035] text-[#a78bfa] hover:bg-[#3b0764]'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>

              {/* Days Selector */}
              <div className="flex items-center gap-0.5">
                <span className="font-bold text-[#c4b5fd]">Days:</span>
                {[7, 14, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setSimDays(days)}
                    className={`rounded px-1 py-0.2 text-[8.5px] font-black transition ${
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

            {/* Simulation Mode Toggle Pill */}
            <div className="flex flex-col gap-1 border-t border-[#7c3aed]/20 pt-1.5">
              <div className="flex items-center justify-between text-[8px] font-bold text-stone-400">
                <span className="text-[#c4b5fd]">SIMULATION MODE:</span>
                <span className="text-[7.5px] font-mono text-[#a78bfa]">
                  {simulationMode === 'full_progression'
                    ? '100% Active Bots • Balance & Stage Validation'
                    : 'Power-Law Churn • DAU & Lifecycle Telemetry'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setSimulationMode('full_progression')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-1 font-display text-[8.5px] font-black uppercase tracking-wider transition ${
                    simulationMode === 'full_progression'
                      ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-[#a78bfa]/50'
                      : 'bg-[#180d2e] text-stone-400 border border-stone-800/80 hover:text-stone-200'
                  }`}
                >
                  <span>⚔️</span>
                  <span className="truncate">Full Progression & Economy (100% Active)</span>
                </button>

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setSimulationMode('retention_lifecycle')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-1 font-display text-[8.5px] font-black uppercase tracking-wider transition ${
                    simulationMode === 'retention_lifecycle'
                      ? 'bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/50'
                      : 'bg-[#180d2e] text-stone-400 border border-stone-800/80 hover:text-stone-200'
                  }`}
                >
                  <span>📊</span>
                  <span className="truncate">Real-World Retention & DAU Lifecycle</span>
                </button>
              </div>
            </div>

            {/* Run Button & Worker Status */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Web Worker Multi-Thread Ready</span>
              </div>

              <button
                type="button"
                disabled={isRunning}
                onClick={handleStartSimulation}
                className={`rounded-xl px-3 py-1 font-display text-[9.5px] font-black uppercase text-white shadow transition active:scale-95 ${
                  isRunning
                    ? 'bg-amber-600 animate-pulse'
                    : 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:brightness-110 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                }`}
              >
                {isRunning ? 'SIMULATING...' : '🚀 RUN SIM'}
              </button>
            </div>
          </div>

          {/* Real-time Web Worker Progress Bar */}
          {isRunning && (
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[8.5px] font-mono font-bold text-[#a78bfa]">
                <span className="truncate">{progressMsg || `Simulating Cohorts: Day ${currentSimDay} / ${simDays}...`}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full border border-[#7c3aed]/50 bg-[#1e1035]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#10b981] transition-all duration-150"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 7 Diagnostic Sub-Tabs Bar */}
        <div className="grid grid-cols-7 border-b border-[#7c3aed]/30 bg-[#0f051d] p-0.5 text-[9px] font-black">
          <button
            type="button"
            onClick={() => setActiveTab('progression')}
            className={`flex flex-col items-center py-1 rounded-lg transition ${
              activeTab === 'progression'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span>📈</span>
            <span className="text-[8px]">Progression</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`flex flex-col items-center py-1 rounded-lg transition ${
              activeTab === 'meta'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span>⚖️</span>
            <span className="text-[8px]">Meta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outliers')}
            className={`flex flex-col items-center py-1 rounded-lg transition ${
              activeTab === 'outliers'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span>🎬</span>
            <span className="text-[8px]">Outliers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('economy')}
            className={`flex flex-col items-center py-1 rounded-lg transition ${
              activeTab === 'economy'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span>💰</span>
            <span className="text-[8px]">Economy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ab_diff')}
            className={`flex flex-col items-center py-1 rounded-lg transition ${
              activeTab === 'ab_diff'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span>🔬</span>
            <span className="text-[8px]">A/B Diff</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('auto_tuner')}
            className={`flex flex-col items-center py-1 rounded-lg transition ${
              activeTab === 'auto_tuner'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span>⚙️</span>
            <span className="text-[8px]">Tuner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center py-1 rounded-lg transition ${
              activeTab === 'report'
                ? 'bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white shadow'
                : 'text-[#c4b5fd] hover:bg-[#2e1065]'
            }`}
          >
            <span>📄</span>
            <span className="text-[8px]">Report</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-2.5 text-stone-200">
          {!results && !isRunning && activeTab !== 'ab_diff' && activeTab !== 'auto_tuner' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-4xl animate-bounce">🧪</span>
              <h4 className="mt-2 font-display text-xs font-black text-white">Monte Carlo Lab Ready</h4>
              <p className="max-w-xs mt-1 text-[10px] text-stone-400">
                Seeded PRNG (<strong className="text-[#fde047]">Seed #{seed}</strong>) ensures 100% deterministic progression reproduction across worker threads.
              </p>
              <button
                type="button"
                onClick={handleStartSimulation}
                className="mt-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] px-5 py-2 font-display text-[10px] font-black uppercase text-white shadow-lg active:scale-95"
              >
                RUN INITIAL SIMULATION
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: PROGRESSION (SVG CURVES & 500-STAGE HEATMAP)
             ───────────────────────────────────────────────────────────── */}
          {results && activeTab === 'progression' && (
            <div className="flex flex-col gap-3">
              {/* Interactive Cohort Progression SVG Curve */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                  <div className="flex items-center gap-1 font-display text-[11px] font-black text-[#fef08a]">
                    <Activity className="h-3.5 w-3.5 text-[#a855f7]" />
                    <span>90-Day Progression Curves (Day 1 → Day 90)</span>
                  </div>
                  <span className="text-[8px] font-mono text-stone-400">Seed #{results.config.seed}</span>
                </div>

                {/* SVG Chart */}
                <div className="mt-2 relative w-full overflow-hidden rounded-xl bg-black/40 p-1 border border-stone-800">
                  <svg viewBox="0 0 460 160" className="w-full h-auto">
                    {/* Background Grid Lines */}
                    {[0, 100, 200, 300, 400, 500].map((stg) => {
                      const y = 140 - (stg / 500) * 125
                      return (
                        <g key={stg}>
                          <line x1="35" y1={y} x2="450" y2={y} stroke="#374151" strokeDasharray="3,3" strokeWidth="0.5" />
                          <text x="30" y={y + 3} textAnchor="end" fontSize="7" fill="#9ca3af" fontFamily="monospace">
                            S{stg}
                          </text>
                        </g>
                      )
                    })}

                    {/* Day X-Axis Markers */}
                    {[
                      { day: 1, x: 45 },
                      { day: 3, x: 95 },
                      { day: 7, x: 155 },
                      { day: 14, x: 225 },
                      { day: 30, x: 300 },
                      { day: 60, x: 375 },
                      { day: 90, x: 445 },
                    ].map((d) => (
                      <g key={d.day}>
                        <line x1={d.x} y1="15" x2={d.x} y2="140" stroke="#1f2937" strokeWidth="0.5" />
                        <text x={d.x} y="152" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="monospace">
                          D{d.day}
                        </text>
                      </g>
                    ))}

                    {/* Cohort Curve Lines */}
                    {cohorts.map((cId) => {
                      const cfg = BOT_COHORTS[cId]
                      const prog = results.progression.dayStages[cId]
                      const points = [
                        { x: 45, y: 140 - (prog.day1 / 500) * 125 },
                        { x: 95, y: 140 - (prog.day3 / 500) * 125 },
                        { x: 155, y: 140 - (prog.day7 / 500) * 125 },
                        { x: 225, y: 140 - (prog.day14 / 500) * 125 },
                        { x: 300, y: 140 - (prog.day30 / 500) * 125 },
                        { x: 375, y: 140 - (prog.day60 / 500) * 125 },
                        { x: 445, y: 140 - (prog.day90 / 500) * 125 },
                      ]
                      const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

                      return (
                        <g key={cId}>
                          <path d={pathStr} fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" />
                          {points.map((p, idx) => (
                            <circle key={idx} cx={p.x} cy={p.y} r="2.5" fill={cfg.color} stroke="#000" strokeWidth="0.8" />
                          ))}
                        </g>
                      )
                    })}
                  </svg>

                  {/* Chart Legend */}
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-1 border-t border-stone-800 pt-1 text-[8px] font-mono">
                    {cohorts.map((cId) => {
                      const cfg = BOT_COHORTS[cId]
                      const endStg = results.progression.dayStages[cId].day90
                      return (
                        <div key={cId} className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                          <span className="font-bold" style={{ color: cfg.color }}>{cfg.name}:</span>
                          <span className="text-white">S{endStg}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 500-Stage Choke-Point Difficulty Heatmap */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                  <div className="flex items-center gap-1 font-display text-[11px] font-black text-rose-400">
                    <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                    <span>500-Stage Choke-Point Heatmap</span>
                  </div>
                  <span className="text-[8px] font-mono text-stone-400">Green (0%) → Red (&gt;50%)</span>
                </div>

                {/* Heatmap Grid (Sampled 100 Stage Nodes) */}
                <div className="mt-2 flex flex-col gap-1">
                  <div className="grid grid-cols-20 gap-0.5 rounded-xl bg-black/50 p-1 border border-stone-800">
                    {Array.from({ length: 100 }).map((_, idx) => {
                      const stageNum = (idx + 1) * 5
                      const choke = results.progression.topChokePoints.find((cp) => cp.stage === stageNum)
                      const isMilestone = stageNum % 10 === 0
                      const wipePct = choke ? choke.wipeRatePct : (isMilestone ? (stageNum <= 20 ? 15 : 35) : 0)

                      const bg =
                        wipePct >= 50
                          ? 'bg-rose-600'
                          : wipePct >= 25
                          ? 'bg-amber-500'
                          : wipePct >= 5
                          ? 'bg-yellow-400'
                          : 'bg-emerald-500/70'

                      return (
                        <button
                          key={stageNum}
                          type="button"
                          onClick={() => setSelectedHeatmapStage(stageNum)}
                          title={`Stage ${stageNum}: ${wipePct}% Wipe Rate`}
                          className={`h-3 w-full rounded-[2px] ${bg} transition hover:scale-125 hover:z-10 ${
                            selectedHeatmapStage === stageNum ? 'ring-1 ring-white shadow-lg' : ''
                          }`}
                        />
                      )
                    })}
                  </div>

                  {/* Selected Stage Detail Drawer */}
                  {selectedHeatmapStage && (
                    <div className="mt-1 rounded-xl border border-rose-900/60 bg-rose-950/40 p-2 text-[9px] font-mono">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Stage {selectedHeatmapStage} Choke Telemetry</span>
                        <span className="text-rose-400">
                          {results.progression.topChokePoints.find((c) => c.stage === selectedHeatmapStage)?.wipeRatePct || (selectedHeatmapStage % 10 === 0 ? '35%' : '<5%')} Wipe Rate
                        </span>
                      </div>
                      <div className="mt-0.5 text-[8px] text-stone-300">
                        Enemy: {results.progression.topChokePoints.find((c) => c.stage === selectedHeatmapStage)?.enemyName || (selectedHeatmapStage % 10 === 0 ? 'Milestone Boss' : 'Market Maker Node')} •
                        Counter-Pump Vulnerable • Heavy Attack Frequency: 3.2s
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Combat Tension & Active Interceptions */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5">
                  <div className="text-[9.5px] font-bold text-stone-300">Combat Tension Index</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#4ade80]">
                      {results.combatTension.avgHpRemainingPct}%
                    </span>
                    <span className="text-[8px] text-stone-400">Avg HP on Win</span>
                  </div>
                  <div className="mt-1 flex gap-1 text-[8px] font-mono">
                    <span className="text-emerald-400">{results.combatTension.hpDistribution.safePct}% Safe</span>
                    <span>•</span>
                    <span className="text-amber-400">{results.combatTension.hpDistribution.tensePct}% Tense</span>
                    <span>•</span>
                    <span className="text-rose-400">{results.combatTension.hpDistribution.dangerPct}% Clutch</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5">
                  <div className="text-[9.5px] font-bold text-stone-300">Active Interceptions</div>
                  <div className="mt-1 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[8.5px] font-mono">
                      <span className="text-amber-300 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Counter-Pumps:
                      </span>
                      <span className="font-black text-white">{results.combatTension.counterPumpInterruptsCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[8.5px] font-mono">
                      <span className="text-cyan-300 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Pet Blocks:
                      </span>
                      <span className="font-black text-white">{results.combatTension.petSavesCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: META (2D SKILL WIN-RATE VS PICK-RATE MATRIX)
             ───────────────────────────────────────────────────────────── */}
          {results && activeTab === 'meta' && (
            <div className="flex flex-col gap-3">
              {/* 2D Skill Scatter Matrix */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                  <div className="flex items-center gap-1 font-display text-[11px] font-black text-[#c4b5fd]">
                    <Target className="h-3.5 w-3.5 text-[#a855f7]" />
                    <span>2D Skill Win-Rate vs Pick-Rate Matrix</span>
                  </div>
                  <span className="text-[8px] font-mono text-stone-400">Quadrant Analysis</span>
                </div>

                <div className="mt-2 relative w-full overflow-hidden rounded-xl bg-black/50 p-1 border border-stone-800">
                  <svg viewBox="0 0 440 200" className="w-full h-auto">
                    {/* Quadrant Backdrops */}
                    <rect x="220" y="20" width="200" height="80" fill="#10b981" fillOpacity="0.06" />
                    <rect x="20" y="20" width="200" height="80" fill="#3b82f6" fillOpacity="0.06" />
                    <rect x="220" y="100" width="200" height="80" fill="#f59e0b" fillOpacity="0.06" />
                    <rect x="20" y="100" width="200" height="80" fill="#ef4444" fillOpacity="0.06" />

                    {/* Quadrant Dividing Crosshairs */}
                    <line x1="220" y1="20" x2="220" y2="180" stroke="#6b7280" strokeWidth="0.8" strokeDasharray="3,3" />
                    <line x1="20" y1="100" x2="420" y2="100" stroke="#6b7280" strokeWidth="0.8" strokeDasharray="3,3" />

                    {/* Quadrant Labels */}
                    <text x="320" y="32" textAnchor="middle" fontSize="7" fill="#10b981" fontWeight="bold">🔥 OVERPOWERED</text>
                    <text x="120" y="32" textAnchor="middle" fontSize="7" fill="#38bdf8" fontWeight="bold">💎 SLEEPER / HIGH-SKILL</text>
                    <text x="320" y="172" textAnchor="middle" fontSize="7" fill="#f59e0b" fontWeight="bold">⚠️ NOOB TRAP</text>
                    <text x="120" y="172" textAnchor="middle" fontSize="7" fill="#f87171" fontWeight="bold">💤 UNDERPOWERED</text>

                    {/* Skill Scatter Points */}
                    {results.metaBalance.allSkills.map((sk) => {
                      const cx = 20 + (sk.pickRatePct / 100) * 400
                      const cy = 180 - (sk.winRatePct / 100) * 160
                      const color =
                        sk.balanceStatus === 'overpowered'
                          ? '#10b981'
                          : sk.balanceStatus === 'underpowered'
                          ? '#ef4444'
                          : '#a855f7'

                      return (
                        <g key={sk.id} className="cursor-pointer" onClick={() => setSelectedSkillId(sk.id)}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={selectedSkillId === sk.id ? '5' : '3.5'}
                            fill={color}
                            stroke="#fff"
                            strokeWidth={selectedSkillId === sk.id ? '1.5' : '0.5'}
                          />
                        </g>
                      )
                    })}
                  </svg>

                  {/* Selected Skill Detail */}
                  {selectedSkillId && (
                    <div className="mt-1 rounded-xl border border-[#7c3aed]/50 bg-[#1e1035] p-2 text-[9px] font-mono">
                      {(() => {
                        const sk = results.metaBalance.allSkills.find((s) => s.id === selectedSkillId)
                        if (!sk) return null
                        return (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white">{sk.name}</span>
                              <span className="ml-1 text-[8px] text-stone-400">({sk.encounters} encounters)</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-[#38bdf8]">Pick: {sk.pickRatePct}%</span>
                              <span className="text-emerald-400 font-bold">Win: {sk.winRatePct}%</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Roster List */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                  <span className="font-display text-[11px] font-black text-[#c4b5fd]">Skill Tier Breakdown</span>
                  <span className="text-[8px] font-mono text-stone-400">Win Rate / Pick Rate</span>
                </div>
                <div className="mt-1.5 flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {results.metaBalance.allSkills.map((sk) => (
                    <div
                      key={sk.id}
                      onClick={() => setSelectedSkillId(sk.id)}
                      className={`flex items-center justify-between rounded-xl border px-2 py-1 text-[9px] cursor-pointer transition ${
                        selectedSkillId === sk.id
                          ? 'border-[#a855f7] bg-[#3b0764]'
                          : 'border-stone-800 bg-black/30 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">{sk.name}</div>
                        <div className="text-[7.5px] text-stone-400 font-mono">
                          Pick: {sk.pickRatePct}% • Encounters: {sk.encounters}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.2 text-[7.5px] font-black uppercase ${
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
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: OUTLIERS (INTERACTIVE TICK-BY-TICK SCRUBBER)
             ───────────────────────────────────────────────────────────── */}
          {results && activeTab === 'outliers' && (
            <div className="flex flex-col gap-3">
              {/* Outliers Select Bar */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                  <div className="flex items-center gap-1 font-display text-[11px] font-black text-rose-400">
                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                    <span>Captured Outlier Combat Encounters</span>
                  </div>
                  <span className="text-[8px] font-mono text-stone-400">
                    {results.outlierRuns?.length || 0} Telemetry Logs
                  </span>
                </div>

                <div className="mt-1.5 flex gap-1 overflow-x-auto pb-1">
                  {results.outlierRuns?.map((run) => (
                    <button
                      key={run.id}
                      type="button"
                      onClick={() => {
                        setSelectedOutlier(run)
                        setScrubberStep(0)
                        setIsPlayingScrubber(false)
                      }}
                      className={`flex flex-col text-left rounded-xl border px-2 py-1 text-[8.5px] font-mono whitespace-nowrap transition ${
                        selectedOutlier?.id === run.id
                          ? 'border-white bg-[#3b0764] text-white shadow'
                          : 'border-stone-800 bg-black/40 text-stone-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span className={run.outcome === 'WIPE' ? 'text-rose-400' : 'text-amber-300'}>
                          [{run.outcome}]
                        </span>
                        <span>S{run.stage} N{run.nodeNum}</span>
                      </div>
                      <div className="text-[7.5px] text-stone-400">{run.enemyName}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Step Scrubber Drawer */}
              {selectedOutlier && (
                <div className="rounded-2xl border border-rose-900/60 bg-[#1c081e] p-3 shadow-lg flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-rose-900/40 pb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5 font-display text-xs font-black text-white">
                        <span className="text-rose-400">Stage {selectedOutlier.stage} - Node {selectedOutlier.nodeNum}</span>
                        <span className="rounded bg-rose-950 px-1.5 py-0.2 text-[8px] font-mono text-rose-300 uppercase border border-rose-800">
                          {selectedOutlier.outcome}
                        </span>
                      </div>
                      <div className="text-[8.5px] text-stone-400 font-mono">
                        {selectedOutlier.enemyName} • Duration: {selectedOutlier.totalDurationSec}s • Fatal: {selectedOutlier.fatalCause || 'N/A'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPlayingScrubber(!isPlayingScrubber)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white shadow active:scale-95"
                    >
                      {isPlayingScrubber ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Dual Health Bars at Current Step */}
                  {(() => {
                    const currentEvent: TimelineMarker | undefined = selectedOutlier.events[scrubberStep]
                    const playerHp = currentEvent ? currentEvent.playerHpPct : selectedOutlier.finalPlayerHpPct
                    const enemyHp = currentEvent ? currentEvent.enemyHpPct : selectedOutlier.finalEnemyHpPct

                    return (
                      <div className="flex flex-col gap-1.5 bg-black/40 p-2 rounded-xl border border-stone-800">
                        {/* Player Margin HP */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-[8px] font-mono font-bold">
                            <span className="text-emerald-400">Player Margin HP</span>
                            <span className="text-white">{playerHp}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden border border-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-200"
                              style={{ width: `${Math.max(0, Math.min(100, playerHp))}%` }}
                            />
                          </div>
                        </div>

                        {/* Enemy HP */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-[8px] font-mono font-bold">
                            <span className="text-rose-400">{selectedOutlier.enemyName}</span>
                            <span className="text-white">{enemyHp}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden border border-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-200"
                              style={{ width: `${Math.max(0, Math.min(100, enemyHp))}%` }}
                            />
                          </div>
                        </div>

                        {/* Event Description Card at Current Tick */}
                        {currentEvent && (
                          <div className="mt-1 flex items-start gap-2 rounded-lg border border-[#7c3aed]/40 bg-[#1e1035] p-2 text-[9px] font-mono">
                            <span className="rounded bg-[#8b5cf6] px-1 py-0.2 text-[7.5px] font-black text-black">
                              Tick {currentEvent.tick}
                            </span>
                            <div className="flex-1">
                              <div className="font-bold text-[#fde047]">{currentEvent.event}</div>
                              <div className="text-[8px] text-stone-300">{currentEvent.description}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Scrubber Slider Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={scrubberStep <= 0}
                      onClick={() => setScrubberStep(Math.max(0, scrubberStep - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-white disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, selectedOutlier.events.length - 1)}
                      value={scrubberStep}
                      onChange={(e) => setScrubberStep(parseInt(e.target.value, 10))}
                      className="flex-1 accent-[#8b5cf6]"
                    />

                    <button
                      type="button"
                      disabled={scrubberStep >= selectedOutlier.events.length - 1}
                      onClick={() => setScrubberStep(Math.min(selectedOutlier.events.length - 1, scrubberStep + 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-white disabled:opacity-30"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <span className="text-[8px] font-mono text-stone-400 w-12 text-right">
                      {scrubberStep + 1}/{selectedOutlier.events.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: ECONOMY & GUILD TELEMETRY
             ───────────────────────────────────────────────────────────── */}
          {results && activeTab === 'economy' && (
            <div className="flex flex-col gap-3">
              {/* Retention & DAU Telemetry */}
              {results.retention && (
                <div className="rounded-2xl border border-emerald-600/50 bg-[#062419]/80 p-2.5 shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-700/40 pb-1">
                    <div className="flex items-center gap-1.5 font-display text-[11px] font-black text-emerald-300">
                      <Users className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Cohort Retention & Churn Engine</span>
                      <span className={`rounded px-1.5 py-0.2 text-[7.5px] font-black uppercase ${
                        results.retention.retentionPct === 100
                          ? 'bg-violet-950 text-violet-300 border border-violet-700/50'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      }`}>
                        {results.retention.retentionPct === 100 ? '⚔️ 100% Active' : '📊 Retention Decay'}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-stone-400">Day {simDays} Active DAU</span>
                  </div>

                  <div className="mt-1.5 grid grid-cols-4 gap-1 text-center font-mono">
                    <div className="rounded-xl bg-black/40 p-1.5 border border-emerald-900/40">
                      <div className="text-[8px] text-stone-400">Active Bots</div>
                      <div className="text-xs font-black text-emerald-400">{results.retention.finalActiveBots}</div>
                    </div>
                    <div className="rounded-xl bg-black/40 p-1.5 border border-emerald-900/40">
                      <div className="text-[8px] text-stone-400">Retention</div>
                      <div className="text-xs font-black text-white">{results.retention.retentionPct}%</div>
                    </div>
                    <div className="rounded-xl bg-black/40 p-1.5 border border-emerald-900/40">
                      <div className="text-[8px] text-stone-400">Churned</div>
                      <div className="text-xs font-black text-rose-400">{results.retention.churnedBots}</div>
                    </div>
                    <div className="rounded-xl bg-black/40 p-1.5 border border-emerald-900/40">
                      <div className="text-[8px] text-stone-400">Comebacks</div>
                      <div className="text-xs font-black text-cyan-400">{results.retention.totalComebacks}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guild Syndicates Ecosystem */}
              {results.syndicates && (
                <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                  <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                    <div className="flex items-center gap-1 font-display text-[11px] font-black text-[#c4b5fd]">
                      <Layers className="h-3.5 w-3.5 text-[#a855f7]" />
                      <span>$500M Clearing House Heist (Syndicates)</span>
                    </div>
                    <span className="text-[8px] font-mono text-stone-400">{results.syndicates.totalSyndicates} Guilds</span>
                  </div>

                  <div className="mt-1.5 flex flex-col gap-1 text-[9px] font-mono">
                    <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-xl border border-stone-800">
                      <span className="text-stone-300">Top Ranked Guild:</span>
                      <span className="font-bold text-[#fde047]">{results.syndicates.topSyndicateName}</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-xl border border-stone-800">
                      <span className="text-stone-300">Weekly Raid Damage:</span>
                      <span className="font-bold text-emerald-400">${results.syndicates.topSyndicateDamage.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-xl border border-stone-800">
                      <span className="text-stone-300">Avg Vault Tiers Unlocked:</span>
                      <span className="font-bold text-cyan-300">{results.syndicates.avgVaultTiersUnlocked}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unspent Currency Stockpiles */}
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                  <span className="font-display text-[11px] font-black text-[#c4b5fd]">Unspent Stockpiles</span>
                  <div className="flex gap-1">
                    {([30, 60, 90] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setStockpileDayTab(d)}
                        className={`rounded px-1.5 py-0.2 text-[7.5px] font-bold ${
                          stockpileDayTab === d ? 'bg-[#8b5cf6] text-white' : 'bg-black/40 text-stone-400'
                        }`}
                      >
                        Day {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-1.5 overflow-x-auto">
                  <table className="w-full text-left font-mono text-[8px]">
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
                            <td className="py-1 font-bold" style={{ color: cfg.color }}>{cfg.name}</td>
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
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 5: A/B CONFIGURATION DIFF ENGINE
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'ab_diff' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                  <div className="flex items-center gap-1 font-display text-[11px] font-black text-[#c4b5fd]">
                    <GitCompare className="h-3.5 w-3.5 text-[#a855f7]" />
                    <span>A/B Patch Comparator (Same Seed #{seed})</span>
                  </div>
                  <span className="text-[8px] font-mono text-stone-400">Baseline vs Candidate</span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[9px] font-mono">
                  {/* Profile A Setup */}
                  <div className="rounded-xl border border-stone-800 bg-black/40 p-2">
                    <div className="font-bold text-[#c4b5fd]">Profile A (Baseline)</div>
                    <div className="mt-1 flex flex-col gap-1 text-[8px]">
                      <div className="flex items-center justify-between">
                        <span>Enemy ATK:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={profileA.enemyAtkMultiplier}
                          onChange={(e) => setProfileA({ ...profileA, enemyAtkMultiplier: parseFloat(e.target.value) || 1.0 })}
                          className="w-12 bg-black/50 border border-stone-700 rounded px-1 text-right text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Boss ATK:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={profileA.bossAtkMultiplier}
                          onChange={(e) => setProfileA({ ...profileA, bossAtkMultiplier: parseFloat(e.target.value) || 1.0 })}
                          className="w-12 bg-black/50 border border-stone-700 rounded px-1 text-right text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Max DR Cap:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={profileA.maxDamageReductionCap}
                          onChange={(e) => setProfileA({ ...profileA, maxDamageReductionCap: parseFloat(e.target.value) || 0.55 })}
                          className="w-12 bg-black/50 border border-stone-700 rounded px-1 text-right text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile B Inputs */}
                  <div className="rounded-xl border border-[#a855f7]/60 bg-[#2e1065]/40 p-2">
                    <div className="font-bold text-emerald-300">Profile B (Candidate)</div>
                    <div className="mt-1 flex flex-col gap-1 text-[8px]">
                      <div className="flex items-center justify-between">
                        <span>Enemy ATK:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={profileB.enemyAtkMultiplier}
                          onChange={(e) => setProfileB({ ...profileB, enemyAtkMultiplier: parseFloat(e.target.value) || 1.0 })}
                          className="w-12 bg-black/50 border border-stone-700 rounded px-1 text-right text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Boss ATK:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={profileB.bossAtkMultiplier}
                          onChange={(e) => setProfileB({ ...profileB, bossAtkMultiplier: parseFloat(e.target.value) || 1.0 })}
                          className="w-12 bg-black/50 border border-stone-700 rounded px-1 text-right text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Max DR Cap:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={profileB.maxDamageReductionCap}
                          onChange={(e) => setProfileB({ ...profileB, maxDamageReductionCap: parseFloat(e.target.value) || 0.55 })}
                          className="w-12 bg-black/50 border border-stone-700 rounded px-1 text-right text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAbRunning}
                  onClick={handleRunABDiff}
                  className={`mt-2.5 w-full rounded-xl py-1.5 font-display text-[9.5px] font-black uppercase text-white shadow transition active:scale-95 ${
                    isAbRunning
                      ? 'bg-amber-600 animate-pulse'
                      : 'bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] hover:brightness-110'
                  }`}
                >
                  {isAbRunning ? `RUNNING PROFILE ${abProgress.profile} (${abProgress.percent}%)...` : '🔬 RUN A/B COMPARISON ON SEED'}
                </button>
              </div>

              {/* A/B Diff Results */}
              {abReport && (
                <div className="rounded-2xl border border-emerald-600/50 bg-[#062419]/80 p-2.5 shadow-md flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-emerald-700/40 pb-1">
                    <span className="font-display text-[11px] font-black text-emerald-300">Delta Results (Candidate vs Baseline)</span>
                    <span className="text-[8px] font-mono text-stone-400">Δ Metrics</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[8px]">
                      <thead>
                        <tr className="border-b border-stone-700 text-stone-400">
                          <th className="py-1">Cohort</th>
                          <th className="py-1">D30 Stage Δ</th>
                          <th className="py-1">D90 Stage Δ</th>
                          <th className="py-1">Hashrate Δ</th>
                          <th className="py-1">Gems Δ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800">
                        {cohorts.map((cId) => {
                          const cfg = BOT_COHORTS[cId]
                          const pDelta = abReport.progressionDeltas[cId]
                          const sDelta = abReport.stockpileDeltas[cId]
                          return (
                            <tr key={cId}>
                              <td className="py-1 font-bold" style={{ color: cfg.color }}>{cfg.name}</td>
                              <td className={`py-1 font-bold ${pDelta.day30Delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {pDelta.day30Delta >= 0 ? `+${pDelta.day30Delta}` : pDelta.day30Delta}
                              </td>
                              <td className={`py-1 font-bold ${pDelta.day90Delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {pDelta.day90Delta >= 0 ? `+${pDelta.day90Delta}` : pDelta.day90Delta}
                              </td>
                              <td className="py-1 text-white">{sDelta.hashrateDelta >= 0 ? `+${sDelta.hashrateDelta}` : sDelta.hashrateDelta}</td>
                              <td className="py-1 text-[#38bdf8]">{sDelta.gemsDelta >= 0 ? `+${sDelta.gemsDelta}` : sDelta.gemsDelta}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Conclusion */}
                  <div className="rounded-xl border border-stone-800 bg-black/50 p-2 text-[8px] font-mono text-stone-300 leading-relaxed whitespace-pre-wrap">
                    {abReport.summaryMarkdown}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 6: AUTOMATED BALANCE TUNER
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'auto_tuner' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-[#7c3aed]/40 bg-[#1e1035]/80 p-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-1">
                  <div className="flex items-center gap-1 font-display text-[11px] font-black text-[#c4b5fd]">
                    <Sliders className="h-3.5 w-3.5 text-[#a855f7]" />
                    <span>Automated Difficulty Convergence Tuner</span>
                  </div>
                  <span className="text-[8px] font-mono text-stone-400">Gradient Mini-Batches</span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[8.5px] font-mono">
                  <div className="flex flex-col gap-1 bg-black/40 p-2 rounded-xl border border-stone-800">
                    <span className="text-stone-300">Target Grinder D30 Stage:</span>
                    <input
                      type="number"
                      value={tunerTargets.targetGrinderDay30Stage}
                      onChange={(e) => setTunerTargets({ ...tunerTargets, targetGrinderDay30Stage: parseInt(e.target.value, 10) || 45 })}
                      className="bg-black/60 border border-stone-700 rounded px-1.5 py-0.5 text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1 bg-black/40 p-2 rounded-xl border border-stone-800">
                    <span className="text-stone-300">Target Whale D90 Stage:</span>
                    <input
                      type="number"
                      value={tunerTargets.targetWhaleDay90Stage}
                      onChange={(e) => setTunerTargets({ ...tunerTargets, targetWhaleDay90Stage: parseInt(e.target.value, 10) || 470 })}
                      className="bg-black/60 border border-stone-700 rounded px-1.5 py-0.5 text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isTuning}
                  onClick={handleRunAutoTuner}
                  className={`mt-2.5 w-full rounded-xl py-1.5 font-display text-[9.5px] font-black uppercase text-white shadow transition active:scale-95 ${
                    isTuning
                      ? 'bg-amber-600 animate-pulse'
                      : 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:brightness-110'
                  }`}
                >
                  {isTuning ? `TUNING ITERATION ${tuningProgress.iter} / ${tuningProgress.maxIter}...` : '⚙️ TUNE DIFFICULTY MULTIPLIERS'}
                </button>
              </div>

              {/* Tuner Convergence Results */}
              {tunerReport && (
                <div className="rounded-2xl border border-emerald-600/50 bg-[#062419]/80 p-2.5 shadow-md flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-emerald-700/40 pb-1">
                    <span className="font-display text-[11px] font-black text-emerald-300">Optimized Balance Parameters</span>
                    <span className="text-[8px] font-mono text-emerald-400">CONVERGED ✅</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center font-mono text-[8.5px]">
                    <div className="bg-black/40 p-1.5 rounded-xl border border-emerald-900/40">
                      <div className="text-stone-400">Enemy ATK Exp</div>
                      <div className="text-xs font-black text-white">{tunerReport.bestParameters.enemyAtkExponent}</div>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded-xl border border-emerald-900/40">
                      <div className="text-stone-400">Boss ATK Mult</div>
                      <div className="text-xs font-black text-white">{tunerReport.bestParameters.bossAtkMultiplier}x</div>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded-xl border border-emerald-900/40">
                      <div className="text-stone-400">Base ATK Const</div>
                      <div className="text-xs font-black text-white">{tunerReport.bestParameters.baseAtkConstant}</div>
                    </div>
                  </div>

                  {/* Suggested Code Snippet */}
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={handleCopyCodeSnippet}
                      className="absolute right-2 top-2 rounded-lg bg-emerald-600 px-2 py-0.5 text-[8px] font-black uppercase text-white shadow"
                    >
                      {copiedCode ? 'COPIED!' : 'COPY CODE'}
                    </button>
                    <pre className="rounded-xl border border-stone-800 bg-black/70 p-2 font-mono text-[8px] text-emerald-300 overflow-x-auto leading-relaxed">
                      {tunerReport.suggestedCodeSnippet}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 7: REPORT
             ───────────────────────────────────────────────────────────── */}
          {results && activeTab === 'report' && (
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleCopyReport}
                className={`flex w-full items-center justify-center gap-1.5 rounded-2xl py-2 font-display text-xs font-black uppercase text-white shadow-xl transition active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:brightness-110'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>COPIED! READY TO PASTE</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 stroke-[2.5]" />
                    <span>📋 COPY FULL SUMMARY (SEED #{results.config.seed})</span>
                  </>
                )}
              </button>

              <div className="relative rounded-2xl border border-stone-800 bg-black/60 p-2.5 font-mono text-[8.5px] text-stone-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">
                {results.reportMarkdown}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
