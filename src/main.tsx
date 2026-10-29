import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useMetaStore } from './state/useMetaStore'
import { useRunStore } from './state/useRunStore'

if (typeof window !== 'undefined') {
  ;(window as unknown as { __metaStore: typeof useMetaStore; __runStore: typeof useRunStore }).__metaStore = useMetaStore
  ;(window as unknown as { __metaStore: typeof useMetaStore; __runStore: typeof useRunStore }).__runStore = useRunStore

  // Register Progressive Web App Service Worker
  if ('serviceWorker' in navigator) {
    const registerSW = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] ServiceWorker registered successfully with scope:', reg.scope)
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err)
        })
    }
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
