import { ChevronRight, Globe } from 'lucide-react'
import { HeroChibiSvg } from '../components/WorldDioramaArt'
import type { ServerConfig } from '../state/useMetaStore'

export interface TitleScreenProps {
  selectedServer: ServerConfig
  onSelectServerClick: () => void
  onEnterGame: () => void
  className?: string
}

export function TitleScreen({
  selectedServer,
  onSelectServerClick,
  onEnterGame,
  className = '',
}: TitleScreenProps) {
  return (
    <div className={`flex w-full max-w-[340px] flex-col items-center select-none ${className}`}>
      {/* Title */}
      <div className="mb-2 flex flex-col items-center text-center">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider game-text-outline uppercase drop-shadow-[0_4px_16px_rgba(44,24,16,0.6)]">
          CRYPTO ROGUES
        </h1>
        <span className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          Decentralized Roguelite
        </span>
      </div>

      {/* Animated Satoshi Mascot Idle Bobbing Sprite in the Center Empty Space */}
      <div className="my-4 flex flex-col items-center justify-center animate-bounce duration-1000">
        <div className="relative flex flex-col items-center drop-shadow-[0_12px_24px_rgba(44,24,16,0.35)]">
          <HeroChibiSvg heroId="rookie_satoshi" size={118} />
          <span className="mt-1 whitespace-nowrap rounded-full border-2 border-[#3E2723] bg-[#FEF3C7] px-3 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-[#92400E] shadow-sm">
            Rookie Satoshi Lv.1
          </span>
        </div>
      </div>

      {/* Selected Server Card */}
      <button
        type="button"
        onClick={onSelectServerClick}
        className="group relative flex w-full items-center justify-between rounded-2xl border-3 border-[#3E2723] bg-[#FFFDF9] px-3.5 py-3 shadow-[0_8px_20px_rgba(44,24,16,0.3)] transition active:scale-[0.98] hover:border-amber-600"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-gradient-to-b from-amber-200 to-amber-400 text-amber-900 shadow-inner">
            <Globe className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-display font-black text-sm text-[#2C1810]">
                {selectedServer.name}
              </span>
              {/* Status Pill */}
              <span
                className={`rounded-full px-1.5 py-0.2 font-display text-[9px] font-extrabold uppercase ${
                  selectedServer.status === 'new'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : selectedServer.status === 'busy'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {selectedServer.status === 'new' && '🟢 New'}
                {selectedServer.status === 'busy' && '🟡 Busy'}
                {selectedServer.status === 'full' && '🔴 Full'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#6E5A4F]">
              <span>{selectedServer.region}</span>
              <span>•</span>
              <span className="text-emerald-700 font-extrabold">
                {selectedServer.pingMs ?? 24}ms Ping
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0">
          <ChevronRight className="h-5 w-5" />
        </div>
      </button>

      {/* Giant Pulsing Gold [ ENTER GAME ] Button (Upgraded Ergonomic Touch Target h-[56px]) */}
      <div className="mt-4 w-full">
        <button
          type="button"
          onClick={onEnterGame}
          className="btn-3d-gold flex h-[56px] w-full items-center justify-center rounded-2xl shadow-xl active:scale-95 transition-transform hover:brightness-105"
        >
          <span className="font-display font-black text-lg tracking-wide text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            🚀 ENTER GAME
          </span>
        </button>
      </div>
    </div>
  )
}

export default TitleScreen
