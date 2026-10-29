import { useState, useEffect } from 'react'
import { useMetaStore, type ServerConfig, type ServerRegion, type AuthAccountType } from '../../state/useMetaStore'
import { SERVERS_CONFIG, SERVER_REGIONS } from '../../config/servers.config'
import { AudioSynth } from '../../engine/AudioSynth'
import { LiveYoshinoSkyBackground } from '../../components/boot/LiveYoshinoSkyBackground'
import { enableImmersiveMode } from '../../utils/fullscreen'
import {
  Globe,
  Wifi,
  ChevronRight,
  X,
  User,
  ShieldCheck,
  Check,
  LogOut,
  Link as LinkIcon,
} from 'lucide-react'

interface LoginAndServerScreenProps {
  onEnterGame: () => void
}

export function LoginAndServerScreen({ onEnterGame }: LoginAndServerScreenProps) {
  const meta = useMetaStore()
  const { authAccount, selectedServer } = meta

  const [showServerModal, setShowServerModal] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<ServerRegion>(selectedServer.region)
  const [showLinkModal, setShowLinkModal] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('autologin') === 'guest' && !authAccount.type) {
      handleLogin('guest')
    }
    if (params.get('serverModal') === 'true') {
      setShowServerModal(true)
    }
  }, [])

  // Handle Login
  const handleLogin = (type: Exclude<AuthAccountType, null>) => {
    enableImmersiveMode()
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    let handle = 'Trader'
    if (type === 'guest') {
      const randNum = Math.floor(1000 + Math.random() * 9000)
      handle = `Guest_${randNum}`
    } else if (type === 'google') {
      handle = 'trader.alex@gmail.com'
    } else if (type === 'x') {
      handle = '@cryptowolf'
    } else if (type === 'facebook') {
      handle = 'Alex Trader'
    }

    meta.setAuthAccount({
      type,
      handle,
      uid: `${type}_${Date.now().toString(36)}`,
    })
  }

  const handleSwitchAccount = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    meta.setAuthAccount({
      type: null,
      handle: '',
      uid: '',
    })
  }

  const handleLinkAccount = (type: 'google' | 'x' | 'facebook') => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    let handle = '@verified_trader'
    if (type === 'google') handle = 'trader.pro@gmail.com'
    else if (type === 'x') handle = '@cryptopro'
    meta.bindGuestAccount(type, handle)
    setShowLinkModal(false)
  }

  const handleSelectServer = (server: ServerConfig) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    meta.setSelectedServer(server)
    setShowServerModal(false)
  }

  const handleStartGame = () => {
    enableImmersiveMode()
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    // Routing is driven by `tutorialStep` in App: 'not_started' → Intro Cutscene → Scripted Battle; 'completed' → Home.
    onEnterGame()
  }

  // Filter servers by chosen region tab
  const regionServers = SERVERS_CONFIG.filter((s) => s.region === selectedRegion)

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#F4EFE6] select-none">
      {/* ── Live Animated Yoshino Sakura Sky Background (Sun/Moon Day & Night Cycle) ── */}
      <LiveYoshinoSkyBackground />

      {/* ── Top Bar: User Identity & Account Actions ── */}
      <div
        className="relative z-10 flex items-center justify-between p-4 pr-12 safe-area-top-header"
        style={{ paddingTop: 'max(var(--safe-top, env(safe-area-inset-top)), 14px)' }}
      >
        {authAccount.type ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border-2 border-[#3E2723] bg-[#FFFDF9]/95 px-3 py-1 shadow-[0_3px_8px_rgba(44,24,16,0.2)] backdrop-blur-md">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 border border-amber-300 text-xs font-black text-amber-800">
                {authAccount.type === 'guest'
                  ? '👤'
                  : authAccount.type === 'google'
                    ? 'G'
                    : authAccount.type === 'x'
                      ? '𝕏'
                      : 'f'}
              </span>
              <span className="font-display font-black text-xs text-[#2C1810]">
                {authAccount.handle}
              </span>
              <span className="rounded bg-[#E2D5C1] px-1.5 py-0.2 font-display text-[9px] font-bold text-[#6E5A4F] uppercase">
                {authAccount.type}
              </span>
            </div>

            {/* If Guest, offer link button */}
            {authAccount.type === 'guest' && (
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="flex items-center gap-1 rounded-full border-2 border-[#3E2723] bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-extrabold text-[#92400E] shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition active:scale-95"
              >
                <LinkIcon className="h-3 w-3" />
                <span>Link</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSwitchAccount}
              title="Switch Account"
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#FFFDF9] text-[#6E5A4F] shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition hover:text-[#2C1810] active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1 rounded-full border-2 border-[#3E2723] bg-[#FFFDF9]/95 px-2.5 py-1 text-[10px] font-extrabold text-[#2C1810] shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
          <Wifi className="h-3 w-3 text-emerald-600" />
          <span>{selectedServer.pingMs ?? 24}ms</span>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
        {/* Step A: Not logged in -> "SIGN IN TO TRADE" Modal */}
        {!authAccount.type ? (
          <div className="w-full max-w-[340px] rounded-3xl border-3 border-[#3E2723] bg-[#FFFDF9] p-5 shadow-[0_12px_32px_rgba(44,24,16,0.35),inset_0_2px_0_#ffffff]">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-13 w-13 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-amber-300 to-amber-500 shadow-inner">
                <ShieldCheck className="h-7 w-7 text-[#2C1810]" />
              </div>
              <h2 className="font-display font-black text-lg text-[#2C1810] tracking-wide uppercase">
                SIGN IN TO TRADE
              </h2>
              <p className="mt-1 font-sans text-xs font-semibold text-[#6E5A4F]">
                Link your account to protect your crypto tokens and cross-device portfolio.
              </p>
            </div>

            {/* Social Buttons */}
            <div className="mt-4 space-y-2.5">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleLogin('google')}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#3E2723] bg-white px-4 py-2.5 shadow-[0_3px_0_#3E2723] transition active:translate-y-0.5 active:shadow-none hover:bg-slate-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-display font-extrabold text-xs text-[#2C1810]">
                  Continue with Google
                </span>
              </button>

              {/* X (Twitter) */}
              <button
                type="button"
                onClick={() => handleLogin('x')}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#3E2723] bg-black px-4 py-2.5 text-white shadow-[0_3px_0_#3E2723] transition active:translate-y-0.5 active:shadow-none hover:bg-neutral-900"
              >
                <span className="font-sans font-black text-sm">𝕏</span>
                <span className="font-display font-extrabold text-xs">
                  Continue with X
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleLogin('facebook')}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#3E2723] bg-[#1877F2] px-4 py-2.5 text-white shadow-[0_3px_0_#0f4c97] transition active:translate-y-0.5 active:shadow-none hover:bg-[#166fe5]"
              >
                <span className="font-sans font-black text-sm">f</span>
                <span className="font-display font-extrabold text-xs">
                  Continue with Facebook
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-3.5 flex items-center justify-center">
              <div className="w-full border-t border-[#E2D5C1]" />
              <span className="absolute bg-[#FFFDF9] px-2 font-display text-[10px] font-black uppercase text-[#8C7A6B]">
                OR FAST PLAY
              </span>
            </div>

            {/* Prominent Play as Guest Button */}
            <button
              type="button"
              onClick={() => handleLogin('guest')}
              className="btn-3d-gold flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 active:scale-95"
            >
              <User className="h-4 w-4 text-white" />
              <span className="font-display font-black text-xs uppercase tracking-wide">
                Play as Guest (No Verification)
              </span>
            </button>
          </div>
        ) : (
          /* Step B: Logged in -> Server Gate Screen */
          <div className="flex w-full max-w-[340px] flex-col items-center">
            {/* Title */}
            <div className="mb-6 flex flex-col items-center">
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider game-text-outline uppercase drop-shadow-[0_4px_16px_rgba(44,24,16,0.6)]">
                CRYPTO ROGUES
              </h1>
            </div>

            {/* Selected Server Card */}
            <button
              type="button"
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playCoinInject()
                setShowServerModal(true)
              }}
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

            {/* Giant Pulsing Gold [ ENTER GAME ] Button */}
            <div className="mt-5 w-full">
              <button
                type="button"
                onClick={handleStartGame}
                className="btn-3d-gold w-full py-3.5 text-center rounded-2xl shadow-[0_8px_28px_rgba(245,158,11,0.6)] active:scale-95 transition-transform hover:brightness-105"
              >
                <span className="font-display font-black text-lg tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  🚀 ENTER GAME
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Info ── */}
      <div
        className="relative z-10 flex items-center justify-between px-6 pb-6 text-[10px] font-bold text-amber-100/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] safe-area-bottom-dock"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <span>Crypto Rogues © 2026 Gee Games</span>
        <span>Secure Enclave v1.4</span>
      </div>

      {/* ── Server Selection Modal ── */}
      {showServerModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[82vh] w-full max-w-[340px] flex-col rounded-3xl border-3 border-[#3E2723] bg-[#FFFDF9] shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#3E2723] bg-[#FEF3C7] px-4 py-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#92400E]" />
                <h3 className="font-display font-black text-base text-[#2C1810] uppercase">
                  SELECT SERVER GATE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#FFFDF9] text-[#2C1810] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Region Tabs */}
            <div className="grid grid-cols-4 gap-1 border-b-2 border-[#E2D5C1] bg-[#F4EFE6] p-1.5">
              {SERVER_REGIONS.map((region) => {
                const isSelected = region === selectedRegion
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => {
                      AudioSynth.unlock()
                      AudioSynth.playCoinInject()
                      setSelectedRegion(region)
                    }}
                    className={`rounded-xl py-1.5 text-center font-display text-[11px] font-black transition ${
                      isSelected
                        ? 'border-2 border-[#3E2723] bg-[#FFFDF9] text-[#2C1810] shadow-sm'
                        : 'text-[#6E5A4F] hover:text-[#2C1810]'
                    }`}
                  >
                    {region === 'North America' ? 'NA' : region}
                  </button>
                )
              })}
            </div>

            {/* Server List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {regionServers.map((server) => {
                const isCurrent = server.id === selectedServer.id
                return (
                  <button
                    key={server.id}
                    type="button"
                    onClick={() => handleSelectServer(server)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-3 text-left transition active:scale-[0.98] ${
                      isCurrent
                        ? 'border-amber-600 bg-[#FEF3C7] shadow-sm'
                        : 'border-[#3E2723] bg-white hover:bg-amber-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-sm text-[#2C1810]">
                          {server.name}
                        </span>
                        {/* Status badge */}
                        <span
                          className={`rounded px-1.5 py-0.2 font-display text-[9px] font-extrabold uppercase ${
                            server.status === 'new'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : server.status === 'busy'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {server.status === 'new' && 'New'}
                          {server.status === 'busy' && 'Busy'}
                          {server.status === 'full' && 'Full'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-[#6E5A4F]">
                        <span>Capacity: {server.loadPct}%</span>
                        <span>•</span>
                        <span className="text-emerald-700">Ping: {server.pingMs}ms</span>
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <div className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                          <Check className="h-3 w-3" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#8C7A6B]" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Bottom Caution Notice */}
            <div className="border-t-2 border-[#E2D5C1] bg-[#FFFDF9] px-4 py-2.5 text-center text-[10px] font-bold text-[#6E5A4F]">
              ⚠️ Max 1 Character per Server Gate. Ladder progression is bound to server realm.
            </div>
          </div>
        </div>
      )}

      {/* ── Link Account Modal (for Guests) ── */}
      {showLinkModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border-3 border-[#3E2723] bg-[#FFFDF9] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E2D5C1]">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-amber-600" />
                <h3 className="font-display font-black text-sm text-[#2C1810] uppercase">
                  LINK GUEST ACCOUNT
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#FFFDF9] text-[#2C1810]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="mt-3 font-sans text-xs font-semibold text-[#6E5A4F]">
              Link your current guest wallet to a permanent social login to preserve your characters.
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleLinkAccount('google')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#3E2723] bg-white py-2 text-xs font-extrabold text-[#2C1810] shadow-[0_2px_0_#3E2723] active:translate-y-0.5 active:shadow-none"
              >
                <span>Link Google Account</span>
              </button>
              <button
                type="button"
                onClick={() => handleLinkAccount('x')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#3E2723] bg-black py-2 text-xs font-extrabold text-white shadow-[0_2px_0_#3E2723] active:translate-y-0.5 active:shadow-none"
              >
                <span>Link X Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
