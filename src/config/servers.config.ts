import type { ServerConfig, ServerRegion } from '../state/useMetaStore'

export const SERVERS_CONFIG: ServerConfig[] = [
  // Oceania
  { id: 'oceania_47', name: 'Oceania #47', region: 'Oceania', status: 'new', loadPct: 22, pingMs: 24 },
  { id: 'oceania_46', name: 'Oceania #46', region: 'Oceania', status: 'busy', loadPct: 74, pingMs: 28 },
  { id: 'oceania_45', name: 'Oceania #45', region: 'Oceania', status: 'full', loadPct: 98, pingMs: 31 },
  { id: 'oceania_42', name: 'Oceania #42', region: 'Oceania', status: 'full', loadPct: 99, pingMs: 33 },

  // North America
  { id: 'na_47', name: 'NA East #47', region: 'North America', status: 'new', loadPct: 35, pingMs: 108 },
  { id: 'na_46', name: 'NA West #46', region: 'North America', status: 'busy', loadPct: 82, pingMs: 122 },
  { id: 'na_44', name: 'NA Central #44', region: 'North America', status: 'full', loadPct: 97, pingMs: 114 },
  { id: 'na_41', name: 'NA East #41', region: 'North America', status: 'full', loadPct: 100, pingMs: 105 },

  // Europe
  { id: 'eu_47', name: 'EU Central #47', region: 'Europe', status: 'new', loadPct: 28, pingMs: 152 },
  { id: 'eu_46', name: 'EU West #46', region: 'Europe', status: 'busy', loadPct: 79, pingMs: 145 },
  { id: 'eu_43', name: 'EU North #43', region: 'Europe', status: 'full', loadPct: 96, pingMs: 160 },

  // Asia
  { id: 'asia_47', name: 'Asia East #47', region: 'Asia', status: 'new', loadPct: 41, pingMs: 68 },
  { id: 'asia_46', name: 'Asia South #46', region: 'Asia', status: 'busy', loadPct: 86, pingMs: 82 },
  { id: 'asia_44', name: 'Tokyo #44', region: 'Asia', status: 'full', loadPct: 99, pingMs: 74 },
  { id: 'asia_41', name: 'Singapore #41', region: 'Asia', status: 'full', loadPct: 100, pingMs: 85 },
]

export const SERVER_REGIONS: ServerRegion[] = [
  'Oceania',
  'North America',
  'Europe',
  'Asia',
]

export const DEFAULT_SERVER: ServerConfig = SERVERS_CONFIG[0]
