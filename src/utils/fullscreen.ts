/**
 * Triggers native immersive fullscreen mode across modern browsers (Chromium, WebKit, Gecko).
 * Hides Android system clock and status bar for native game feel.
 */
export const enableImmersiveMode = () => {
  const docEl = document.documentElement as HTMLElement & {
    requestFullscreen?: (options?: FullscreenOptions) => Promise<void>
    webkitRequestFullscreen?: () => Promise<void>
    mozRequestFullScreen?: () => Promise<void>
    msRequestFullscreen?: () => Promise<void>
  }
  const isFs = Boolean(
    document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement,
  )

  if (!isFs) {
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions).catch(() => {
        // Fallback without options if rejected
        docEl.requestFullscreen?.().catch(() => {})
      })
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen().catch(() => {})
    } else if (docEl.mozRequestFullScreen) {
      docEl.mozRequestFullScreen().catch(() => {})
    } else if (docEl.msRequestFullscreen) {
      docEl.msRequestFullscreen().catch(() => {})
    }
  }
}
