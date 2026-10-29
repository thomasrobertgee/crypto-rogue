/**
 * Weekend "Meme-Coin Frenzy" Spin Wheel Configuration
 * 8-Slice Wheel with Physics Deceleration + Cumulative Milestone Bar
 */

export interface WheelSlice {
  id: string
  label: string
  sublabel: string
  icon: string
  type: 'gems' | 'silverKey' | 'quantumKey' | 'hashrate' | 'fragments'
  amount: number
  color: string
  weight: number
  isJackpot?: boolean
}

export const MEME_WHEEL_SLICES: WheelSlice[] = [
  {
    id: 'slice_gems_50',
    label: '50 Gems',
    sublabel: '💎 Satoshi Stash',
    icon: '💎',
    type: 'gems',
    amount: 50,
    color: '#3b82f6',
    weight: 25,
  },
  {
    id: 'slice_silver_key',
    label: '1x Silver Key',
    sublabel: '🗝️ Vault Key',
    icon: '🗝️',
    type: 'silverKey',
    amount: 1,
    color: '#94a3b8',
    weight: 20,
  },
  {
    id: 'slice_hashrate_2k',
    label: '2,000 HR',
    sublabel: '⚡ Mining Surge',
    icon: '⚡',
    type: 'hashrate',
    amount: 2000,
    color: '#10b981',
    weight: 20,
  },
  {
    id: 'slice_frags_5',
    label: '5x Frags',
    sublabel: '🧩 Hero Shards',
    icon: '🧩',
    type: 'fragments',
    amount: 5,
    color: '#a855f7',
    weight: 15,
  },
  {
    id: 'slice_gems_200',
    label: '200 Gems',
    sublabel: '💎 Big Bag',
    icon: '💎',
    type: 'gems',
    amount: 200,
    color: '#6366f1',
    weight: 10,
  },
  {
    id: 'slice_quantum_key',
    label: '1x Quantum',
    sublabel: '🔮 Quantum Key',
    icon: '🔮',
    type: 'quantumKey',
    amount: 1,
    color: '#ec4899',
    weight: 5,
  },
  {
    id: 'slice_jackpot_10k',
    label: '10,000 HR!',
    sublabel: '🎰 JACKPOT',
    icon: '🎰',
    type: 'hashrate',
    amount: 10000,
    color: '#eab308',
    weight: 2,
    isJackpot: true,
  },
  {
    id: 'slice_frags_15',
    label: '15x Frags',
    sublabel: '🧩 Mega Shards',
    icon: '🧩',
    type: 'fragments',
    amount: 15,
    color: '#f97316',
    weight: 3,
  },
]

export interface WheelMilestone {
  spinsRequired: number
  label: string
  rewardDescription: string
  gems: number
  silverKeys: number
  quantumKeys: number
  heroFragments: number
  isMythical?: boolean
}

export const WHEEL_MILESTONES: WheelMilestone[] = [
  {
    spinsRequired: 5,
    label: '5 Spins',
    rewardDescription: '+200 💎 + 2x 🗝️ Silver Keys',
    gems: 200,
    silverKeys: 2,
    quantumKeys: 0,
    heroFragments: 0,
  },
  {
    spinsRequired: 15,
    label: '15 Spins',
    rewardDescription: '+500 💎 + 10x 🧩 Hero Fragments',
    gems: 500,
    silverKeys: 0,
    quantumKeys: 0,
    heroFragments: 10,
  },
  {
    spinsRequired: 30,
    label: '30 Spins',
    rewardDescription: '+1,000 💎 + 3x 🔮 Quantum Keys',
    gems: 1000,
    silverKeys: 0,
    quantumKeys: 3,
    heroFragments: 0,
  },
  {
    spinsRequired: 50,
    label: '50 Spins',
    rewardDescription: '🌟 MYTHICAL CHEST: +2,500 💎 + 5x 🔮 + 50x 🧩',
    gems: 2500,
    silverKeys: 0,
    quantumKeys: 5,
    heroFragments: 50,
    isMythical: true,
  },
]

export const WHEEL_TOP_UPS = [
  { id: 'wheel_pack_3', tokens: 3, price: '$1.99', badge: 'POPULAR' },
  { id: 'wheel_pack_10', tokens: 10, price: '$4.99', badge: 'BEST VALUE (+33%)' },
]
