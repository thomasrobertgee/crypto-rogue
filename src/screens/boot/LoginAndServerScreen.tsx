import { useState, useEffect } from 'react'
import { useMetaStore, type ServerConfig, type ServerRegion, type AuthAccountType } from '../../state/useMetaStore'
import { SERVERS_CONFIG, SERVER_REGIONS } from '../../config/servers.config'
import { AudioSynth } from '../../engine/AudioSynth'
import { LiveYoshinoSkyBackground } from '../../components/boot/LiveYoshinoSkyBackground'
import { enableImmersiveMode } from '../../utils/fullscreen'
import { LoginModal } from '../LoginModal'
import { TitleScreen } from '../TitleScreen'
import {
  Globe,
  Wifi,
  ChevronRight,
  X,
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
        className="relative z-10 flex items-center justify-between px-5 pt-3 pr-12 safe-area-top-header pt-safe"
        style={{ paddingTop: 'max(var(--safe-top, env(safe-area-inset-top)), 12px)' }}
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
          <LoginModal onLogin={handleLogin} />
        ) : (
          /* Step B: Logged in -> Title & Server Gate Screen */
          <TitleScreen
            selectedServer={selectedServer}
            onSelectServerClick={() => {
              AudioSynth.unlock()
              AudioSynth.playCoinInject()
              setShowServerModal(true)
            }}
            onEnterGame={handleStartGame}
          />
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
