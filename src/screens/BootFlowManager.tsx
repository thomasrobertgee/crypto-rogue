import { useState } from 'react'
import { GeeGamesSplash } from './boot/GeeGamesSplash'
import { ParallaxLoadingScreen } from './boot/ParallaxLoadingScreen'
import { LoginAndServerScreen } from './boot/LoginAndServerScreen'

export type BootStep = 'splash' | 'loading' | 'login_server'

interface BootFlowManagerProps {
  onComplete: () => void
  initialStep?: BootStep
}

export function BootFlowManager({
  onComplete,
  initialStep,
}: BootFlowManagerProps) {
  const [bootStep, setBootStep] = useState<BootStep>(() => {
    if (initialStep) return initialStep
    const params = new URLSearchParams(window.location.search)
    const paramStep = params.get('bootStep') as BootStep
    if (paramStep && ['splash', 'loading', 'login_server'].includes(paramStep)) {
      return paramStep
    }
    return 'splash'
  })

  if (bootStep === 'splash') {
    return <GeeGamesSplash onFinish={() => setBootStep('loading')} />
  }

  if (bootStep === 'loading') {
    return <ParallaxLoadingScreen onFinish={() => setBootStep('login_server')} />
  }

  return <LoginAndServerScreen onEnterGame={onComplete} />
}
