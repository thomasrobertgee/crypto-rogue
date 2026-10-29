import type { ReactNode } from 'react'

/** Mobile viewport container: strict 9:16 portrait (416x740 max) centered with Midnight Arcade bezel on desktop. */
/** Responsive viewport container:
 * - Phone screens (<640px): 100% full-bleed edge-to-edge (w-full h-[100dvh])
 * - Tablets & wide displays (sm/md/lg): Centered mobile play boundary (max-w-[500px] w-full h-[100dvh] mx-auto relative overflow-hidden shadow-2xl)
 * - Full-bleed ambient dark night-sky / purple crypto gradient (#0d0914) across outer pillar margins
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#0d0914] bg-[radial-gradient(ellipse_at_top,_#1c112b_0%,_#0d0914_70%,_#07040b_100%)] m-0 p-0 relative">
      <main
        id="game-viewport"
        className="relative flex flex-col w-full h-[100dvh] mx-auto overflow-hidden select-none
                   bg-[#F4EFE6] text-[#2C1810]
                   sm:max-w-[500px] sm:shadow-2xl"
      >
        {children}
      </main>
    </div>
  )
}
