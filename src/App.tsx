import { useState, useEffect } from 'react'
import { MobileFrame } from './components/MobileFrame'
import { BottomTabBar, type HubTabId } from './components/BottomTabBar'
import { DevCheatToolbar } from './components/DevCheatToolbar'
import { TutorialOverlay } from './components/tutorial/TutorialOverlay'
import { BootFlowManager } from './screens/BootFlowManager'
import { TutorialIntroScreen } from './screens/TutorialIntroScreen'
import { TutorialBattleScreen } from './screens/TutorialBattleScreen'
import { CampaignHubScreen } from './screens/CampaignHubScreen'
import { BaseHqScreen } from './screens/BaseHqScreen'
import { MissionsScreen } from './screens/MissionsScreen'
import { ExchangeShopScreen } from './screens/ExchangeShopScreen'
import { SocialHubScreen } from './screens/SocialHubScreen'
import { BattleRunScreen } from './screens/BattleRunScreen'
import { useMetaStore, type TutorialStep } from './state/useMetaStore'
import { useRunStore } from './state/useRunStore'
import { enableImmersiveMode } from './utils/fullscreen'
import {
  checkAndTriggerReEngagementNotifications,
  subscribeToInAppNotifications,
  type AppNotification,
} from './utils/notifications'

export default function App() {
  // Dev deep links for QA: ?skipBoot=1&tutorial=not_started|scripted_battle|completed
  const [hasBootedSession, setHasBootedSession] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const forced = params.get('tutorial') as TutorialStep | null
    if (forced) useMetaStore.getState().setTutorialStep(forced)
    if (params.has('devAll')) {
      useMetaStore.setState({
        devUnlockAllUi: true,
        highestStageCleared: 10,
        currentStage: 10,
        ownedHeroes: { rookie_satoshi: 1, lady_fortuna: 1, jordan_belfort: 1 },
      })
    }
    return params.has('skipBoot')
  })
  const tutorialStep = useMetaStore((s) => s.tutorialStep)
  const [activeTab, setActiveTab] = useState<HubTabId>('run')
  const [inAppNotice, setInAppNotice] = useState<AppNotification | null>(null)

  useEffect(() => {
    // True game immersive fullscreen: trigger on first user interaction anywhere
    const handleFirstTap = () => {
      enableImmersiveMode()
      window.removeEventListener('pointerdown', handleFirstTap)
      window.removeEventListener('touchstart', handleFirstTap)
      window.removeEventListener('click', handleFirstTap)
    }

    window.addEventListener('pointerdown', handleFirstTap, { passive: true })
    window.addEventListener('touchstart', handleFirstTap, { passive: true })
    window.addEventListener('click', handleFirstTap, { passive: true })

    // Track fullscreen status on document to dynamically toggle body.is-fullscreen class
    const updateFullscreenClass = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement,
      )
      document.body.classList.toggle('is-fullscreen', isFs)
    }

    document.addEventListener('fullscreenchange', updateFullscreenClass)
    document.addEventListener('webkitfullscreenchange', updateFullscreenClass)
    updateFullscreenClass()

    checkAndTriggerReEngagementNotifications()
    const interval = window.setInterval(() => {
      checkAndTriggerReEngagementNotifications()
    }, 60000)
    const unsub = subscribeToInAppNotifications((notif) => {
      setInAppNotice(notif)
      window.setTimeout(() => setInAppNotice(null), 4500)
    })
    return () => {
      window.removeEventListener('pointerdown', handleFirstTap)
      window.removeEventListener('touchstart', handleFirstTap)
      window.removeEventListener('click', handleFirstTap)
      document.removeEventListener('fullscreenchange', updateFullscreenClass)
      document.removeEventListener('webkitfullscreenchange', updateFullscreenClass)
      window.clearInterval(interval)
      unsub()
    }
  }, [])

  useEffect(() => {
    ;(window as any).__setActiveTab = setActiveTab
    ;(window as any).__metaStore = useMetaStore
    ;(window as any).__runStore = useRunStore
    ;(window as any).__setInBattleRun = setInBattleRun
    ;(window as any).__activeTab = activeTab
  }, [activeTab])
  const [inBattleRun, setInBattleRun] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('testTraversal')) {
      useMetaStore.getState().setTutorialStep('completed')
      useRunStore.getState().startRun(1)
      useRunStore.getState().finishMarketLoading()
      useRunStore.setState({ pendingSkillDrafts: 0 })
      useRunStore.getState().startTraversal()
      return true
    }
    return params.has('battle')
  })

  const handleResetToHub = () => {
    setInBattleRun(false)
    setActiveTab('run')
  }

  const handleReplayBoot = () => {
    setInBattleRun(false)
    setHasBootedSession(false)
  }

  if (!hasBootedSession) {
    return (
      <MobileFrame>
        <DevCheatToolbar
          onResetToHub={handleResetToHub}
          onReplayBootFlow={handleReplayBoot}
        />
        <BootFlowManager onComplete={() => setHasBootedSession(true)} />
      </MobileFrame>
    )
  }

  // FTUE Phase 2: "Fall from Grace" cutscene -> scripted Tutorial Battle (routing is driven by `tutorialStep`)
  if (tutorialStep === 'not_started' || tutorialStep === 'intro_cutscene') {
    return (
      <MobileFrame>
        <DevCheatToolbar onResetToHub={handleResetToHub} onReplayBootFlow={handleReplayBoot} />
        <TutorialIntroScreen
          onFinish={() => useMetaStore.getState().setTutorialStep('scripted_battle')}
        />
      </MobileFrame>
    )
  }

  if (tutorialStep === 'scripted_battle') {
    return (
      <MobileFrame>
        <DevCheatToolbar onResetToHub={handleResetToHub} onReplayBootFlow={handleReplayBoot} />
        <TutorialBattleScreen onComplete={handleResetToHub} />
      </MobileFrame>
    )
  }

  if (inBattleRun) {
    return (
      <MobileFrame>
        <DevCheatToolbar
          onResetToHub={handleResetToHub}
          onReplayBootFlow={handleReplayBoot}
        />
        <BattleRunScreen onReturnToHub={() => setInBattleRun(false)} />
      </MobileFrame>
    )
  }

  return (
    <MobileFrame>
      <DevCheatToolbar
        onResetToHub={handleResetToHub}
        onReplayBootFlow={handleReplayBoot}
      />
      {inAppNotice && (
        <div className="pointer-events-none absolute top-3 left-3 right-3 z-50 flex items-start gap-2.5 rounded-2xl border-2 border-[#16a34a] border-b-4 bg-[#14532d]/95 p-3 text-white shadow-2xl backdrop-blur-md animate-bounce">
          <div className="text-xl">🔔</div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-xs font-black text-[#4ade80]">{inAppNotice.title}</div>
            <div className="text-[10px] font-semibold text-emerald-100">{inAppNotice.body}</div>
          </div>
        </div>
      )}
      <div className="flex h-full w-full flex-col overflow-hidden arcade-screen-bg">
        <div className="min-h-0 flex-1 overflow-hidden">
          {activeTab === 'exchange' && <ExchangeShopScreen />}
          {activeTab === 'base' && <BaseHqScreen />}
          {activeTab === 'run' && (
            <CampaignHubScreen
              onStartBattleRun={() => setInBattleRun(true)}
              onNavigateTab={setActiveTab}
            />
          )}
          {activeTab === 'missions' && <MissionsScreen />}
          {activeTab === 'social' && <SocialHubScreen />}
        </div>

        <BottomTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      <TutorialOverlay activeTab={activeTab} onNavigateTab={setActiveTab} />
    </MobileFrame>
  )
}
