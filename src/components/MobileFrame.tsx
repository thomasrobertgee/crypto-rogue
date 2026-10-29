import type { ReactNode } from 'react'

/** Mobile viewport container: strict 9:16 portrait (416x740 max) centered with Midnight Arcade bezel on desktop. */
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#0d0914] m-0 p-0 md:p-4 md:bezel-bg">
      <main
        id="game-viewport"
        className="relative flex flex-col w-full h-[100dvh] max-w-none max-h-none rounded-none m-0 p-0 overflow-hidden select-none
                   bg-[#F4EFE6] text-[#2C1810]
                   md:max-w-md md:h-[880px] md:rounded-[36px] md:shadow-2xl md:my-auto md:border md:border-white/10 md:ring-[10px] md:ring-[#3E2723]"
      >
        {children}
      </main>
    </div>
  )
}
