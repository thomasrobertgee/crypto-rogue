import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, HelpCircle, CheckCircle2, XCircle, Award } from 'lucide-react'
import { useMetaStore } from '../../state/useMetaStore'
import { AudioSynth } from '../../engine/AudioSynth'

interface DailyPuzzleModalProps {
  onClose: () => void
}

interface OracleScenario {
  id: string
  headline: string
  source: string
  candles: Array<{ o: number; h: number; l: number; c: number }>
  truth: 'long' | 'short'
  analysis: string
}

const SCENARIOS: OracleScenario[] = [
  {
    id: 'fed_rate_pause',
    headline: 'FED CHAIR SURPRISE 50BPS RATE CUT: LIQUIDITY FLOODGATES CREAK OPEN!',
    source: 'Bloomberg Degen Terminal',
    candles: [
      { o: 62000, h: 63200, l: 61800, c: 62900 },
      { o: 62900, h: 64100, l: 62500, c: 63800 },
      { o: 63800, h: 65500, l: 63600, c: 65100 },
      { o: 65100, h: 67200, l: 64800, c: 66900 },
      { o: 66900, h: 69400, l: 66500, c: 69000 },
    ],
    truth: 'long',
    analysis: 'Classic Bullish Momentum breakout! The sudden liquidity injection blew through the $68K resistance wall.',
  },
  {
    id: 'sec_subpoena',
    headline: 'EMERGENCY: SEC DELIVERS 42 TARGET SUBPOENAS TO TOP MEMECOIN INFLUENCERS!',
    source: 'CryptoPanic Alpha Feed',
    candles: [
      { o: 54000, h: 54400, l: 52800, c: 53100 },
      { o: 53100, h: 53500, l: 51200, c: 51800 },
      { o: 51800, h: 52200, l: 49800, c: 50400 },
      { o: 50400, h: 50800, l: 48500, c: 48900 },
      { o: 48900, h: 49200, l: 46100, c: 46800 },
    ],
    truth: 'short',
    analysis: 'Severe regulatory cascading liquidation event. Long leverage flushed across all derivatives exchanges!',
  },
  {
    id: 'satoshi_wallet_awakens',
    headline: 'GENESIS BLOCK WALLET FROM 2009 TRANSFERS 10,000 BTC AFTER 17 YEARS OF DORMANT SILENCE!',
    source: 'WhaleAlert On-Chain Bot',
    candles: [
      { o: 71000, h: 72000, l: 70500, c: 71800 },
      { o: 71800, h: 72200, l: 69800, c: 70100 },
      { o: 70100, h: 70500, l: 67200, c: 67800 },
      { o: 67800, h: 68400, l: 64500, c: 65200 },
      { o: 65200, h: 66000, l: 61800, c: 62400 },
    ],
    truth: 'short',
    analysis: 'Market panicked over potential OG Satoshi whale dump. Heavy capitulation and margin call cascades triggered.',
  },
  {
    id: 'etf_inflow_record',
    headline: 'SPOT ETF DAILY INFLOWS SMASH $1.8 BILLION: INSTITUTIONAL CASH FLOOD!',
    source: 'CoinDesk Macro Desk',
    candles: [
      { o: 58000, h: 59200, l: 57900, c: 58900 },
      { o: 58900, h: 60400, l: 58700, c: 60100 },
      { o: 60100, h: 61800, l: 59900, c: 61500 },
      { o: 61500, h: 63400, l: 61200, c: 63000 },
      { o: 63000, h: 65200, l: 62800, c: 64900 },
    ],
    truth: 'long',
    analysis: 'Institutional bidding floor was impenetrable. Shorter books were entirely consumed in a textbook squeeze!',
  },
]

export const DailyPuzzleModal: React.FC<DailyPuzzleModalProps> = ({ onClose }) => {
  const meta = useMetaStore()
  const todayDateStr = new Date().toISOString().slice(0, 10)
  const alreadyPlayed = meta.lastOraclePuzzleDate === todayDateStr

  // Deterministically select today's scenario using date hash
  const scenarioIndex =
    Math.abs(
      todayDateStr.split('-').reduce((acc, part) => acc * 31 + parseInt(part, 10), 7),
    ) % SCENARIOS.length
  const scenario = SCENARIOS[scenarioIndex]

  const [visibleCandles, setVisibleCandles] = useState<number>(1)
  const [userGuess, setUserGuess] = useState<'long' | 'short' | null>(null)
  const [revealed, setRevealed] = useState(alreadyPlayed)

  // 5-second chart reveal animation (1 candle every 800ms)
  useEffect(() => {
    if (visibleCandles < 4 && !revealed) {
      const timer = setTimeout(() => {
        setVisibleCandles((c) => Math.min(4, c + 1))
      }, 750)
      return () => clearTimeout(timer)
    }
  }, [visibleCandles, revealed])

  const handleGuess = (guess: 'long' | 'short') => {
    if (alreadyPlayed || revealed) return
    AudioSynth.unlock()
    setUserGuess(guess)
    setRevealed(true)
    setVisibleCandles(5) // Reveal the 5th concluding candle!

    const isWin = guess === scenario.truth
    if (isWin) {
      AudioSynth.playRareLootFanfare()
    } else {
      AudioSynth.playRedDump()
    }
    meta.submitDailyOraclePrediction(isWin)
  }

  const currentStreak = meta.oracleStreak ?? 0
  const patrolSpeedBonusPct = meta.getOraclePatrolSpeedBonus()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border-[3.5px] border-[#3E2723] border-b-[7px] bg-[#1a1423] text-white shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b-2 border-white/10 bg-[#281b3b] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#fde047] bg-[#fde047]/20 text-xl shadow">
              🔮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-black text-[#fde047] tracking-wide">
                  DAILY MARKET ORACLE
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                  LIVE TERMINAL
                </span>
              </div>
              <p className="text-[10.5px] font-semibold text-white/70">
                Call the 5th Candle: Long or Short?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Oracle Streak Banner */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#35224e] px-4 py-2">
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-[#fde047]" />
            <span className="font-display text-xs font-black text-[#fde047]">
              ORACLE STREAK: {currentStreak} DAYS
            </span>
          </div>
          <span className="rounded-full border border-emerald-400/40 bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-black text-emerald-400">
            +{patrolSpeedBonusPct}% Idle Patrol Speed
          </span>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-3.5 p-4">
          {/* Breaking Headline */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-display text-[9px] font-black uppercase tracking-wider text-amber-400">
                📰 {scenario.source}
              </span>
              <span className="text-[9px] text-white/50">{todayDateStr}</span>
            </div>
            <p className="mt-1 font-display text-xs font-extrabold text-white leading-snug">
              &ldquo;{scenario.headline}&rdquo;
            </p>
          </div>

          {/* Interactive Historical Candlestick Canvas */}
          <div className="relative flex h-48 w-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-white/15 bg-[#0d0914] p-3 shadow-inner">
            {/* Gridlines */}
            <div className="absolute inset-0 grid grid-rows-4 grid-cols-5 opacity-15 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border border-white/40" />
              ))}
            </div>

            <div className="relative z-10 flex h-full w-full items-end justify-around pb-2">
              {scenario.candles.slice(0, visibleCandles).map((c, i) => {
                const isGreen = c.c >= c.o
                const minPrice = 45000
                const maxPrice = 75000
                const heightRange = maxPrice - minPrice
                const bodyTop = Math.max(c.o, c.c)
                const bodyBot = Math.min(c.o, c.c)
                const bodyHeightPct = Math.max(6, ((bodyTop - bodyBot) / heightRange) * 100 * 2.5)
                const botPosPct = ((bodyBot - minPrice) / heightRange) * 100
                const isFinal5th = i === 4

                return (
                  <div key={i} className="relative flex flex-col items-center justify-end h-full w-12">
                    {/* Wick */}
                    <div
                      className={`w-[2px] rounded-full ${
                        isGreen ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                      style={{ height: '75%' }}
                    />
                    {/* Candle Body */}
                    <div
                      className={`absolute w-8 rounded-sm shadow-md transition-all duration-300 ${
                        isGreen
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 border border-emerald-300'
                          : 'bg-gradient-to-t from-rose-700 to-rose-500 border border-rose-300'
                      } ${isFinal5th ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                      style={{
                        height: `${bodyHeightPct}%`,
                        bottom: `${Math.min(70, Math.max(5, botPosPct))}%`,
                      }}
                    >
                      {isFinal5th && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-display text-[8px] font-black uppercase text-yellow-300 whitespace-nowrap">
                          5TH RESULT
                        </span>
                      )}
                    </div>
                    <span className="mt-1 font-display text-[8px] font-black text-white/50">
                      T+{i + 1}
                    </span>
                  </div>
                )
              })}

              {visibleCandles < 5 && (
                <div className="relative flex flex-col items-center justify-center h-full w-12 border-2 border-dashed border-yellow-400/50 rounded-xl bg-yellow-400/5 animate-pulse">
                  <HelpCircle className="h-6 w-6 text-yellow-400" />
                  <span className="mt-1 font-display text-[8px] font-black text-yellow-400">
                    ???
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Decision Buttons OR Result Display */}
          {!revealed ? (
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-center font-display text-[11px] font-black uppercase text-white/80">
                Place Your Daily Prediction:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleGuess('long')}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-400 border-b-4 border-b-emerald-700 bg-gradient-to-b from-emerald-500 to-emerald-700 py-3.5 font-display text-sm font-black text-white shadow-lg active:translate-y-0.5 hover:brightness-110 transition-all"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>📈 CALL LONG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGuess('short')}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-400 border-b-4 border-b-rose-700 bg-gradient-to-b from-rose-500 to-rose-700 py-3.5 font-display text-sm font-black text-white shadow-lg active:translate-y-0.5 hover:brightness-110 transition-all"
                >
                  <TrendingDown className="h-5 w-5" />
                  <span>📉 CALL SHORT</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 rounded-2xl border-2 border-white/20 bg-white/5 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {(userGuess ?? (alreadyPlayed ? scenario.truth : null)) === scenario.truth ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="font-display text-xs font-black text-emerald-400">
                        ORACLE PREDICTION CORRECT!
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-rose-400" />
                      <span className="font-display text-xs font-black text-rose-400">
                        MARKET FAKEOUT DETECTED!
                      </span>
                    </>
                  )}
                </div>
                <span className="font-display text-[11px] font-extrabold text-[#fde047]">
                  +50 Gems Claimed!
                </span>
              </div>
              <p className="text-[11px] font-semibold text-white/80 leading-relaxed">
                {scenario.analysis}
              </p>
              <div className="mt-1 flex items-center justify-between rounded-xl bg-white/10 px-3 py-1.5 text-[10px] font-display font-black text-white/90">
                <span>Next Oracle Puzzle in:</span>
                <span className="text-[#fde047]">Tomorrow 00:00 UTC</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
