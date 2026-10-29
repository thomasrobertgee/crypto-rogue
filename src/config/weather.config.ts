export type MarketWeatherId = 'retail_fomo' | 'crypto_winter' | 'volatility_storm' | 'dark_pool_fog'

export interface MarketWeatherConfig {
  id: MarketWeatherId
  name: string
  icon: string
  badgeLabel: string
  flavor: string
  description: string
  bgPill: string
  textColor: string
  borderColor: string
}

export const MARKET_WEATHERS: Record<MarketWeatherId, MarketWeatherConfig> = {
  retail_fomo: {
    id: 'retail_fomo',
    name: 'Retail FOMO',
    icon: '☀️',
    badgeLabel: 'BULL SUN',
    flavor: 'Retail euphoria floods the orderbook with rapid-fire market buys.',
    description: 'All coins tick +20% faster, but enemy attack cooldown reduced 20%.',
    bgPill: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    textColor: 'text-amber-950',
    borderColor: 'border-amber-700',
  },
  crypto_winter: {
    id: 'crypto_winter',
    name: 'Crypto Winter',
    icon: '🌧️',
    badgeLabel: 'LIQUIDITY FREEZE',
    flavor: 'Sub-zero sentiment chills the market. Idle capital slowly evaporates.',
    description: 'Coins lose -3% capacity/sec unless they roll a Green Candle.',
    bgPill: 'bg-gradient-to-r from-sky-600 to-blue-500',
    textColor: 'text-sky-50',
    borderColor: 'border-sky-800',
  },
  volatility_storm: {
    id: 'volatility_storm',
    name: 'Volatility Storm',
    icon: '⚡',
    badgeLabel: 'HIGH VOLATILITY',
    flavor: 'Turbulent macroeconomic headwinds tear through the orderbook.',
    description: 'Flat (0%) rolls disabled; Green & Red candle magnitudes are boosted by 1.5x.',
    bgPill: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500',
    textColor: 'text-white',
    borderColor: 'border-purple-800',
  },
  dark_pool_fog: {
    id: 'dark_pool_fog',
    name: 'Dark Pool Fog',
    icon: '🌫️',
    badgeLabel: 'DARK POOL FOG',
    flavor: 'Dense institutional shadows veil the orderbook depth and intentions.',
    description: 'Enemy attack timer is hidden (???); Short & Red-roll passives deal +50% damage.',
    bgPill: 'bg-gradient-to-r from-slate-700 to-zinc-800',
    textColor: 'text-slate-100',
    borderColor: 'border-slate-600',
  },
}

export const ALL_WEATHER_IDS: MarketWeatherId[] = [
  'retail_fomo',
  'crypto_winter',
  'volatility_storm',
  'dark_pool_fog',
]

/** Returns the 1-based floor number (Floor 1: 1..10, Floor 2: 11..20, Floor 3: 21..30). */
export function getFloorNumber(nodeIndex: number): number {
  return Math.min(3, Math.max(1, Math.ceil(nodeIndex / 10)))
}

/** Rolls 3 distinct weathers for Floor 1, Floor 2, and Floor 3. */
export function rollFloorWeathers(): Record<number, MarketWeatherId> {
  const pool = [...ALL_WEATHER_IDS].sort(() => Math.random() - 0.5)
  return {
    1: pool[0] ?? 'retail_fomo',
    2: pool[1] ?? 'volatility_storm',
    3: pool[2] ?? 'dark_pool_fog',
  }
}
