import type { ReactNode } from 'react'

/** Mobile viewport container: strict 9:16 portrait (416x740 max) centered with Midnight Arcade bezel on desktop. */
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden bezel-bg p-0 sm:p-4">
      <main
        id="game-viewport"
        className="relative flex h-dvh max-h-[740px] w-full max-w-[416px] flex-col overflow-hidden select-none
                   bg-[#F4EFE6] text-[#2C1810]
                   sm:h-[min(92dvh,740px)] sm:rounded-[2.25rem] sm:ring-[10px] sm:ring-[#3E2723] sm:shadow-bezel"
        style={{
          aspectRatio: '9 / 16',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {children}
      </main>
    </div>
  )
}
