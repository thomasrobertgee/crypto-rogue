/**
 * Cosmetic Candlestick & Chart FX Skins Configuration
 * 4 Visual themes transforming trading arena charts and combat feedback.
 */

export type ChartSkinId = 'default' | 'retro_8bit' | 'cyber_laser' | 'sovereign_gold'

export interface ChartSkinConfig {
  id: ChartSkinId
  name: string
  subtitle: string
  icon: string
  tag: string
  bullColor: string
  bullBodyColor: string
  bullAreaGrad: [string, string]
  bearColor: string
  bearBodyColor: string
  bearAreaGrad: [string, string]
  gridColor: string
  bgTint: string
  priceColor: string
  fontFamily: string
  glowBlur: number
  glowColorBull: string
  glowColorBear: string
  hasSparkles?: boolean
  description: string
  howToUnlock: string
  rarity: 'common' | 'rare' | 'epic' | 'mythical'
}

export const CHART_SKINS: ChartSkinConfig[] = [
  {
    id: 'default',
    name: 'Emerald Classic',
    subtitle: 'Wall Street Standard',
    icon: '📊',
    tag: 'STANDARD',
    bullColor: '#22ff99',
    bullBodyColor: 'rgba(34, 255, 153, 0.85)',
    bullAreaGrad: ['rgba(34, 255, 153, 0.18)', 'rgba(34, 255, 153, 0.0)'],
    bearColor: '#fb7185',
    bearBodyColor: 'rgba(251, 113, 133, 0.85)',
    bearAreaGrad: ['rgba(251, 113, 133, 0.18)', 'rgba(251, 113, 133, 0.0)'],
    gridColor: 'rgba(255, 255, 255, 0.08)',
    bgTint: 'rgba(15, 23, 42, 0.95)',
    priceColor: 'rgba(255, 255, 255, 0.55)',
    fontFamily: 'Inter, sans-serif',
    glowBlur: 0,
    glowColorBull: 'transparent',
    glowColorBear: 'transparent',
    description: 'Clean emerald green bull candles and crimson red bear wicks with standard orderbook depth.',
    howToUnlock: 'Default Unlocked',
    rarity: 'common',
  },
  {
    id: 'retro_8bit',
    name: '8-Bit Arcade',
    subtitle: 'Pixel Pit Trader',
    icon: '👾',
    tag: 'RETRO',
    bullColor: '#39ff14',
    bullBodyColor: 'rgba(57, 255, 20, 0.9)',
    bullAreaGrad: ['rgba(57, 255, 20, 0.22)', 'rgba(57, 255, 20, 0.0)'],
    bearColor: '#ff007f',
    bearBodyColor: 'rgba(255, 0, 127, 0.9)',
    bearAreaGrad: ['rgba(255, 0, 127, 0.22)', 'rgba(255, 0, 127, 0.0)'],
    gridColor: 'rgba(57, 255, 20, 0.14)',
    bgTint: 'rgba(8, 18, 10, 0.97)',
    priceColor: '#39ff14',
    fontFamily: '"Press Start 2P", monospace, monospace',
    glowBlur: 4,
    glowColorBull: '#39ff14',
    glowColorBear: '#ff007f',
    description: 'Pixel-stepped neon lime and magenta candles with retro phosphor green CRT scanlines.',
    howToUnlock: 'Unlocked in Base HQ',
    rarity: 'rare',
  },
  {
    id: 'cyber_laser',
    name: 'Cyberpunk Laser',
    subtitle: 'Neo-Tokyo Synth Grid',
    icon: '⚡',
    tag: 'CYBERPUNK',
    bullColor: '#00f0ff',
    bullBodyColor: 'rgba(0, 240, 255, 0.85)',
    bullAreaGrad: ['rgba(0, 240, 255, 0.25)', 'rgba(0, 240, 255, 0.0)'],
    bearColor: '#ff0055',
    bearBodyColor: 'rgba(255, 0, 85, 0.85)',
    bearAreaGrad: ['rgba(255, 0, 85, 0.25)', 'rgba(255, 0, 85, 0.0)'],
    gridColor: 'rgba(0, 240, 255, 0.16)',
    bgTint: 'rgba(10, 10, 26, 0.97)',
    priceColor: '#00f0ff',
    fontFamily: 'Inter, sans-serif',
    glowBlur: 10,
    glowColorBull: '#00f0ff',
    glowColorBear: '#ff0055',
    description: 'Blinding cyan and hot-pink neon saber candles pulsing against a high-contrast synth grid.',
    howToUnlock: 'Special Shop / Season Pass',
    rarity: 'epic',
  },
  {
    id: 'sovereign_gold',
    name: 'Sovereign Gold',
    subtitle: 'Whale Executive Apex',
    icon: '👑',
    tag: 'WHALE PASS EXCLUSIVE',
    bullColor: '#ffd700',
    bullBodyColor: 'rgba(255, 215, 0, 0.92)',
    bullAreaGrad: ['rgba(255, 215, 0, 0.32)', 'rgba(255, 215, 0, 0.0)'],
    bearColor: '#e11d48',
    bearBodyColor: 'rgba(225, 29, 72, 0.9)',
    bearAreaGrad: ['rgba(225, 29, 72, 0.28)', 'rgba(225, 29, 72, 0.0)'],
    gridColor: 'rgba(255, 215, 0, 0.18)',
    bgTint: 'rgba(28, 20, 8, 0.98)',
    priceColor: '#ffd700',
    fontFamily: 'Inter, sans-serif',
    glowBlur: 14,
    glowColorBull: '#ffd700',
    glowColorBear: '#e11d48',
    hasSparkles: true,
    description: 'Gilded 24k gold bull candlesticks and royal ruby bear wicks with floating golden spark particles!',
    howToUnlock: 'Whale Executive Season Pass ($24.99)',
    rarity: 'mythical',
  },
]

export const CHART_SKIN_MAP: Record<ChartSkinId, ChartSkinConfig> = CHART_SKINS.reduce(
  (acc, skin) => {
    acc[skin.id] = skin
    return acc
  },
  {} as Record<ChartSkinId, ChartSkinConfig>,
)
