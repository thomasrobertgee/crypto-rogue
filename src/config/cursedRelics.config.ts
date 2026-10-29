export type CursedRelicId = 'tornado_mixer' | '100x_degen_margin'

export interface CursedRelicConfig {
  id: CursedRelicId
  name: string
  title: string
  curseTitle: string
  rarity: 'cursed'
  icon: string
  shopPrice: number
  description: string
  blessingDesc: string
  curseDesc: string
}

export const CURSED_RELICS: CursedRelicConfig[] = [
  {
    id: 'tornado_mixer',
    name: 'Tornado Mixer',
    title: 'Anonymized Liquidity Shredder',
    curseTitle: 'SLOT 1 PRIVACY LOCK',
    rarity: 'cursed',
    icon: 'Tornado',
    shopPrice: 180,
    description: 'Locks Slot 1 completely, but Slots 2, 3, and 4 permanently run at 100% Overdrive speed & power.',
    blessingDesc: 'Slots 2, 3 & 4 gain +100% permanent Overdrive speed & damage',
    curseDesc: 'Slot 1 is completely frozen and cannot tick or roll',
  },
  {
    id: '100x_degen_margin',
    name: '100x Degenerate Margin',
    title: 'Terminal Liquidation Protocol',
    curseTitle: '1 MAX MARGIN HP',
    rarity: 'cursed',
    icon: 'Skull',
    shopPrice: 220,
    description: 'Reduces your Max Margin HP to 1, but deploys a regenerating 350 Margin Shield Barrier at the start of every node.',
    blessingDesc: 'Grants a 350 Margin Shield Barrier at the start of every node',
    curseDesc: 'Your Max Margin HP is set to exactly 1 (Zero room for unshielded error)',
  },
]

export const CURSED_RELIC_MAP: Record<CursedRelicId, CursedRelicConfig> = Object.fromEntries(
  CURSED_RELICS.map((r) => [r.id, r]),
) as Record<CursedRelicId, CursedRelicConfig>
