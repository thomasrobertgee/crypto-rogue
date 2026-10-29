import { useMemo, useState } from 'react'
import {
  Users,
  Trophy,
  MessageSquareHeart,
  Crown,
  Medal,
  Flame,
  Server,
  Key,
  Gem,
  ArrowUpRight,
  Sparkles,
  Swords,
  CheckCircle2,
  Heart,
  Send,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { GROWTH_EVENT_ROTATION } from '../config/economy.config'
import { HERO_MAP, type HeroId } from '../config/heroes.config'
import { COIN_MAP } from '../config/coins.config'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtNum, fmtUsd } from '../engine/format'
import { useMetaStore } from '../state/useMetaStore'
import { TopCurrencyBar, BossAvatarSvg } from '../components/GameArtwork'
import { RedAlertBadge } from '../components/WorldDioramaArt'
import { TURF_DISTRICTS } from '../config/turfWars.config'
import { GuildHeistModal } from './GuildHeistModal'

type SocialSubTab = 'syndicate' | 'turf' | 'leagues' | 'wall'

const RIVAL_NAMES = [
  'SatoshiWhale99', '0xMevBot', 'DiamondApe', 'RugPullSurvivor', 'MoonBagHolder',
  'GasFeeMaxi', 'LeverageKing', 'ShortTheSec', 'YieldFarmer42', 'ZkRollupChad',
  'FlashLoanGod', 'PumpSignalVIP', 'ColdWalletPro', 'HashrateBaron', 'DeFiDegen88',
  'SolanaSniper', 'ValidatorNode7', 'LiquidatorPrime', 'ArbitrageFox', 'MempoolShark',
  'BlockZeroOG', 'QuantumHodler', 'GenesisMiner', 'WhaleWatcher', 'AlphaLeak',
]

interface SyndicateDesk {
  id: string
  name: string
  motto: string
  level: number
  members: string
  buff: string
  badge: string
}

const SYNDICATES: SyndicateDesk[] = [
  {
    id: 'satoshi_whales',
    name: 'Satoshi Whale Syndicate',
    motto: 'Never sell the Genesis block. Coordinated green candles only.',
    level: 8,
    members: '29/30',
    buff: '+15% Raid Boss Damage & +10% Idle Patrol Speed',
    badge: '🐋',
  },
  {
    id: 'ape_cartel',
    name: 'Degen Ape Liquidity Cartel',
    motto: '100x leverage on every meme coin. Lambos or ramen.',
    level: 7,
    members: '28/30',
    buff: '+20% Meme Crit Multiplier & +5% Chest Luck',
    badge: '🦍',
  },
  {
    id: 'zk_citadel',
    name: 'Zero-Knowledge Quant Desk',
    motto: 'Algorithmic arbitrage and sub-millisecond orderbook sniping.',
    level: 9,
    members: '30/30',
    buff: '-25% Rebalance Gas Fee & +12% Global Mastery',
    badge: '⚡',
  },
]

export interface GuildMercenary {
  id: string
  name: string
  ownerName: string
  badge: string
  type: 'hero' | 'coin'
  starLevel: number
  buffDescription: string
}

export const GUILD_MERCENARIES: GuildMercenary[] = [
  {
    id: 'merc_satoshi',
    name: 'Satoshi Nakamoto',
    ownerName: 'SatoshiWhale99',
    badge: '👑',
    type: 'hero',
    starLevel: 5,
    buffDescription: '+50% Global Yield & +100% Up-Candle Multiplier',
  },
  {
    id: 'merc_roxy',
    name: 'Degen Ape Roxy',
    ownerName: 'DiamondApe',
    badge: '🦍',
    type: 'hero',
    starLevel: 5,
    buffDescription: '300% Ape Crit & +50% YOLO Profit Surge',
  },
  {
    id: 'merc_dogezilla',
    name: 'DogeZilla Prime',
    ownerName: 'ZkRollupChad',
    badge: '⚡',
    type: 'coin',
    starLevel: 5,
    buffDescription: '2x Tick Speed & Mega-Candle Vaporizer',
  },
  {
    id: 'merc_fortuna',
    name: 'Lady Fortuna',
    ownerName: 'ArbitrageFox',
    badge: '💎',
    type: 'hero',
    starLevel: 5,
    buffDescription: 'Streak Luck Aura & +40% Hashrate Payout',
  },
  {
    id: 'merc_oracle',
    name: 'Quantum AI Oracle',
    ownerName: 'AlphaLeak',
    badge: '🔮',
    type: 'hero',
    starLevel: 5,
    buffDescription: 'Haste Overdrive & -40% Boss Cooldown',
  },
]

interface WallPost {
  id: string
  trader: string
  avatar: string
  badge: string
  timestamp: string
  actionText: string
  highlight: string
  rarityColor: string
  salutes: number
}

const INITIAL_WALL_POSTS: WallPost[] = [
  {
    id: 'post_1',
    trader: 'SatoshiWhale99',
    avatar: '🐋',
    badge: 'VIP 5',
    timestamp: '2m ago',
    actionText: 'pulled a MYTHICAL Coin from the Venture Capital Vault!',
    highlight: '✨ SatoshiGenesis (S-Grade Mythical)',
    rarityColor: 'bg-rose-100 border-rose-600 text-rose-900',
    salutes: 48,
  },
  {
    id: 'post_2',
    trader: 'ZkRollupChad',
    avatar: '⚡',
    badge: 'Rank #1',
    timestamp: '9m ago',
    actionText: 'liquidated Node 30/30 Final Boss with 0 Margin HP lost!',
    highlight: '🏆 Stage 5 Cleared • 3★ Satoshi Consensus Halo',
    rarityColor: 'bg-amber-100 border-amber-600 text-amber-900',
    salutes: 34,
  },
  {
    id: 'post_3',
    trader: 'DiamondApe',
    avatar: '🦍',
    badge: 'Syndicate Officer',
    timestamp: '18m ago',
    actionText: 'forged 3x Epic Stacks in the Portfolio Foundry!',
    highlight: '🔥 Legendary DogeRocket Unlocked!',
    rarityColor: 'bg-purple-100 border-purple-600 text-purple-900',
    salutes: 29,
  },
  {
    id: 'post_4',
    trader: 'FlashLoanGod',
    avatar: '🦊',
    badge: 'VIP 3',
    timestamp: '31m ago',
    actionText: 'dealt 420,000 DMG to the Syndicate Raid Boss!',
    highlight: '⚔️ Sovereign Bear Leviathan (Phase 3)',
    rarityColor: 'bg-emerald-100 border-emerald-600 text-emerald-900',
    salutes: 21,
  },
]

export function SocialHubScreen() {
  const meta = useMetaStore()
  const [subTab, setSubTab] = useState<SocialSubTab>('syndicate')

  // ── Sub-View 1: Guild Syndicates State ──
  const [joinedSyndicateId, setJoinedSyndicateId] = useState<string>('satoshi_whales')
  const [checkedInToday, setCheckedInToday] = useState(false)
  const [raidBossHp, setRaidBossHp] = useState(1380000)
  const raidBossMaxHp = 2000000
  const [raidStrikesLeft, setRaidStrikesLeft] = useState(2)
  const [syndicateToast, setSyndicateToast] = useState<string | null>(null)
  const [showGuildHeistModal, setShowGuildHeistModal] = useState(false)

  // ── Sub-View 3: Trader Wall State ──
  const [wallPosts, setWallPosts] = useState<WallPost[]>(INITIAL_WALL_POSTS)
  const [salutedIds, setSalutedIds] = useState<string[]>([])
  const [hasFlexedToday, setHasFlexedToday] = useState(false)

  const currentSyndicate =
    SYNDICATES.find((s) => s.id === joinedSyndicateId) ?? SYNDICATES[0]
  const powerScore = meta.getTotalPowerScore()
  const equippedHero = HERO_MAP[meta.equippedHeroId ?? 'rookie_satoshi'] ?? HERO_MAP.rookie_satoshi

  // ── Sub-View 2: Exchange Leagues (50-Player Micro-Bracket) ──
  const activeWeek = meta.activeGrowthWeek ?? 1
  const activeEvent =
    GROWTH_EVENT_ROTATION.find((e) => e.week === activeWeek) ?? GROWTH_EVENT_ROTATION[0]
  const playerPts = meta.growthPointsByWeek?.[activeWeek] ?? 0

  const bracket = useMemo(() => {
    const baseAnchor = Math.max(120, Math.round(playerPts * 1.18 + 60))
    const rivals = Array.from({ length: 49 }, (_, idx) => {
      const name =
        RIVAL_NAMES[idx % RIVAL_NAMES.length] +
        (idx >= RIVAL_NAMES.length ? `_${idx + 1}` : '')
      const factor = Math.pow(0.935, idx)
      const jitter = ((idx * 17 + activeWeek * 31) % 19) - 9
      const pts = Math.max(5, Math.round(baseAnchor * factor + jitter))
      return { id: `rival_${idx}`, name, points: pts, isPlayer: false }
    })

    const all = [
      ...rivals,
      { id: 'player', name: 'YOU (TRADER)', points: playerPts, isPlayer: true },
    ]
    all.sort((a, b) => b.points - a.points || (a.isPlayer ? -1 : 1))
    return all.map((entry, idx) => ({ ...entry, rank: idx + 1 }))
  }, [playerPts, activeWeek])

  const playerEntry = bracket.find((b) => b.isPlayer)!
  const rank3Score = bracket[2]?.points ?? 0
  const rank1Score = bracket[0]?.points ?? 0
  const pointsToTop3 = Math.max(0, rank3Score - playerPts + (playerEntry.rank > 3 ? 5 : 0))
  const pointsToRank1 = Math.max(0, rank1Score - playerPts + (playerEntry.rank > 1 ? 5 : 0))

  const showToast = (msg: string) => {
    setSyndicateToast(msg)
    window.setTimeout(() => setSyndicateToast(null), 2400)
  }

  // Phase 2: Mercenary Desk States & Handlers
  const [showPostPicker, setShowPostPicker] = useState(false)

  const handlePostMercenary = (type: 'hero' | 'coin', id: string) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    meta.postSyndicateMercenary(type, id)
    setShowPostPicker(false)
    showToast(`Posted to Syndicate Loan Pool! Earning +500 Hashrate/Day.`)
  }

  const handleClaimLentHashrate = () => {
    AudioSynth.unlock()
    const amount = meta.claimSyndicateLendingHashrate()
    if (amount > 0) {
      AudioSynth.playChestOpen()
      showToast(`Claimed +${fmtNum(amount)} Hashrate from Mercenary Loan Pool!`)
    }
  }

  const handleReclaimMercenary = () => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    meta.reclaimSyndicateMercenary()
    showToast('Mercenary reclaimed from Syndicate pool.')
  }

  const handleBorrowMercenary = (merc: GuildMercenary) => {
    AudioSynth.unlock()
    AudioSynth.playVictory()
    const ok = meta.borrowSyndicateMercenary({
      id: merc.id,
      name: merc.name,
      type: merc.type,
      starLevel: merc.starLevel,
      buffDescription: merc.buffDescription,
      ownerName: merc.ownerName,
    })
    if (ok) {
      showToast(`🤝 Borrowed ${merc.name} (Lv.50 5★) for your next Stage Run!`)
    } else {
      showToast('Daily Guild Mercenary borrow limit reached (1/Day).')
    }
  }

  // Guild Syndicate Actions
  const handleDailyCheckIn = () => {
    if (checkedInToday) return
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    setCheckedInToday(true)
    useMetaStore.setState((s) => ({
      gems: s.gems + 35,
      hashrate: s.hashrate + 300,
    }))
    showToast('Syndicate Check-In: +35 Satoshi Gems & +300 Hashrate!')
  }

  const handleRaidStrike = () => {
    if (raidStrikesLeft <= 0 || raidBossHp <= 0) return
    AudioSynth.unlock()
    AudioSynth.playGreenCandle()
    const dmg = Math.round(powerScore * 85)
    setRaidBossHp((hp) => Math.max(0, hp - dmg))
    setRaidStrikesLeft((n) => n - 1)
    useMetaStore.setState((s) => ({
      gems: s.gems + 25,
      silverKeys: s.silverKeys + 1,
    }))
    showToast(`Dealt ${fmtNum(dmg)} Raid DMG! Earned +25 Gems & +1 Vault Key!`)
  }

  // Trader Wall Actions
  const handleSalutePost = (postId: string) => {
    if (salutedIds.includes(postId)) return
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    setSalutedIds((prev) => [...prev, postId])
    setWallPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, salutes: p.salutes + 1 } : p)),
    )
    useMetaStore.setState((s) => ({ gems: s.gems + 10 }))
    showToast('Saluted Fellow Trader! +10 Satoshi Gems!')
  }

  const handleFlexAchievement = () => {
    if (hasFlexedToday) return
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    setHasFlexedToday(true)
    const newPost: WallPost = {
      id: `post_player_${Date.now()}`,
      trader: `YOU (${equippedHero.name.split(' ')[0]})`,
      avatar: '👑',
      badge: `Power ${fmtNum(powerScore)}`,
      timestamp: 'Just now',
      actionText: `reached Stage ${meta.currentStage} with ${meta.ownedCoins.length} Portfolio Coins!`,
      highlight: `⚡ ${equippedHero.name} • Global Yield x${meta.getGlobalYield().toFixed(2)}`,
      rarityColor: 'bg-emerald-100 border-emerald-600 text-emerald-900',
      salutes: 1,
    }
    setWallPosts((prev) => [newPost, ...prev])
    useMetaStore.setState((s) => ({ gems: s.gems + 20 }))
    showToast('Posted to Trader Wall! +20 Satoshi Gems!')
  }

  return (
    <div className="relative flex h-full w-full flex-col gap-2 overflow-hidden arcade-screen-bg p-3 select-none text-[#2C1810]">
      {/* Top Currency Bar */}
      <div className="relative z-10 shrink-0">
        <TopCurrencyBar
          hashrate={meta.hashrate}
          gems={meta.gems}
          silverKeys={meta.silverKeys}
          quantumKeys={meta.quantumKeys}
          isVipAdFree={meta.isVipAdFree}
        />
      </div>

      {/* 3-Tab Sub-View Switcher: Guild Syndicates | Exchange Leagues | Trader Wall */}
      <div className="relative z-10 grid shrink-0 grid-cols-3 gap-1.5 rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setSubTab('syndicate')}
          className={`relative flex items-center justify-center gap-1 rounded-xl py-1.5 px-1 font-display text-[10px] font-black transition-all ${
            subTab === 'syndicate'
              ? 'btn-3d-gold text-white game-text-outline-sm'
              : 'text-[#6E5A4F] hover:bg-[#F3E9D8]'
          }`}
        >
          {!checkedInToday && <RedAlertBadge className="-top-1 -right-1" />}
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Syndicate</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('turf')}
          className={`relative flex items-center justify-center gap-1 rounded-xl py-1.5 px-1 font-display text-[10px] font-black transition-all ${
            subTab === 'turf'
              ? 'btn-3d-gold text-white game-text-outline-sm'
              : 'text-[#6E5A4F] hover:bg-[#F3E9D8]'
          }`}
        >
          <Shield className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span className="truncate">Turf Wars</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('leagues')}
          className={`relative flex items-center justify-center gap-1 rounded-xl py-1.5 px-1 font-display text-[10px] font-black transition-all ${
            subTab === 'leagues'
              ? 'btn-3d-gold text-white game-text-outline-sm'
              : 'text-[#6E5A4F] hover:bg-[#F3E9D8]'
          }`}
        >
          <Trophy className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Leagues (50)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('wall')}
          className={`relative flex items-center justify-center gap-1 rounded-xl py-1.5 px-1 font-display text-[10px] font-black transition-all ${
            subTab === 'wall'
              ? 'btn-3d-gold text-white game-text-outline-sm'
              : 'text-[#6E5A4F] hover:bg-[#F3E9D8]'
          }`}
        >
          <MessageSquareHeart className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Trader Wall</span>
        </button>
      </div>

      {syndicateToast && (
        <div className="relative z-20 shrink-0 rounded-2xl border-2 border-[#15803d] bg-[#dcfce7] px-3 py-1.5 text-center font-display text-xs font-black text-[#166534] shadow">
          {syndicateToast}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-VIEW 1: GUILD SYNDICATES
         ═══════════════════════════════════════════════════════════════════════════ */}
      {subTab === 'syndicate' && (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5">
          {/* Active Syndicate Trading Desk Banner */}
          <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3.5 shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-3xl shadow-inner">
                  {currentSyndicate.badge}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[#7e22ce] px-2 py-0.2 font-display text-[9px] font-black text-white">
                      DESK Lv.{currentSyndicate.level}
                    </span>
                    <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-2 py-0.2 font-display text-[9px] font-black text-[#6E5A4F]">
                      {currentSyndicate.members} Traders
                    </span>
                  </div>
                  <h2 className="font-display text-base font-extrabold text-[#2C1810] mt-0.5">
                    {currentSyndicate.name}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#6E5A4F]">
                    {currentSyndicate.motto}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2.5 py-1.5 text-[10px] font-extrabold text-[#166534]">
              <Shield className="h-3.5 w-3.5 shrink-0 text-[#16a34a]" />
              <span>Syndicate Buff: {currentSyndicate.buff}</span>
            </div>

            {/* Daily Check-In / Donation Button */}
            <div className="mt-2.5">
              <button
                type="button"
                disabled={checkedInToday}
                onClick={handleDailyCheckIn}
                className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 font-display text-xs font-black transition-all ${
                  checkedInToday
                    ? 'border border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                    : 'btn-3d-green text-white game-text-outline-sm'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  {checkedInToday
                    ? 'Daily Syndicate Check-In Complete'
                    : 'Daily Desk Check-In & Donate'}
                </span>
                <span className="rounded-xl bg-black/20 px-2 py-0.5 text-[10px]">
                  {checkedInToday ? 'CLAIMED' : '+35 💎 & +300 ⚡'}
                </span>
              </button>
            </div>
          </div>

          {/* 🏦 ASYNCHRONOUS GUILD HEIST: THE CENTRAL CLEARING HOUSE */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#b45309] border-b-4 bg-gradient-to-b from-[#292524] to-[#0c0a09] p-3.5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-500 bg-black/60 text-3xl shadow-inner">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-red-600 px-2 py-0.2 font-display text-[8.5px] font-black uppercase text-white">
                      WEEKLY SYNDICATE HEIST
                    </span>
                    <span className="rounded-full bg-amber-400/20 border border-amber-400 px-1.5 py-0.2 text-[8.5px] font-black text-amber-300">
                      {meta.syndicateHeistAttemptsLeft ?? 2}/2 Today
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-black text-amber-300 mt-0.5">
                    The Central Clearing House
                  </h3>
                  <p className="text-[10px] text-stone-300 font-semibold">
                    Cooperative $500,000,000 HP Bar • 60s Blitz Raids
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  setShowGuildHeistModal(true)
                }}
                className="btn-3d-gold flex items-center gap-1 rounded-2xl px-3 py-2 font-display text-xs font-black uppercase text-white shadow transition-all active:scale-95"
              >
                <span>ENTER HEIST</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Boss HP Bar Preview */}
            <div className="mt-2.5">
              <div className="flex justify-between text-[9.5px] font-bold text-stone-300 mb-1">
                <span>CLEARING HOUSE LIQUIDATION:</span>
                <span className="text-amber-400 font-display font-black">
                  {fmtUsd(meta.syndicateHeistBossHp ?? 442500000)} / $500M ({Math.round(((meta.syndicateHeistBossHp ?? 442500000) / 500000000) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-amber-500/40 bg-black/70">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400"
                  style={{ width: `${Math.max(0, Math.min(100, ((meta.syndicateHeistBossHp ?? 442500000) / 500000000) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 🐋 WHALE DIVIDEND CRATES (SYNDICATE CHAT BROADCASTS) */}
          {meta.whaleDividendCrates && meta.whaleDividendCrates.length > 0 && (
            <div className="rounded-3xl border-2 border-amber-600 border-b-4 bg-gradient-to-b from-[#fef3c7] to-[#fffbeb] p-3.5 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">🐋</span>
                  <div>
                    <h3 className="font-display text-xs font-black text-[#92400e] uppercase tracking-wide">
                      Whale Dividend Crates
                    </h3>
                    <p className="text-[10px] font-semibold text-[#b45309]">
                      Syndicate members who buy &gt;= $9.99 share cash drops with the desk!
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-400 px-2 py-0.5 font-display text-[9px] font-black text-amber-950 shadow-xs">
                  {meta.whaleDividendCrates.filter((c) => !c.claimedByPlayer).length} READY
                </span>
              </div>

              <div className="mt-2.5 space-y-2">
                {meta.whaleDividendCrates.map((crate) => {
                  return (
                    <div
                      key={crate.id}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-amber-300 bg-white/90 p-2.5 shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-xs font-black text-[#451a03] truncate">
                            {crate.buyerName}
                          </span>
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[8px] font-black text-amber-800 truncate">
                            {crate.bundleName}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] font-extrabold text-[#15803d]">
                          <span>+{crate.gems} 💎</span>
                          <span>+{crate.hashrate} ⚡</span>
                          <span className="text-stone-400">• {crate.salutesCount} 🫡</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            AudioSynth.unlock()
                            AudioSynth.playCoinInject()
                            meta.saluteWhaleBuyer(crate.id)
                          }}
                          className="flex items-center gap-1 rounded-xl border border-amber-400 bg-amber-50 px-2 py-1.5 font-display text-[10px] font-black text-amber-900 active:scale-95 hover:bg-amber-100"
                          title="Send Salute"
                        >
                          <span>🫡</span>
                          <span>Salute</span>
                        </button>

                        <button
                          type="button"
                          disabled={crate.claimedByPlayer}
                          onClick={() => {
                            AudioSynth.unlock()
                            if (meta.claimWhaleDividend(crate.id)) {
                              AudioSynth.playChestOpen()
                            }
                          }}
                          className={`rounded-xl px-2.5 py-1.5 font-display text-[10px] font-black transition active:scale-95 ${
                            crate.claimedByPlayer
                              ? 'border border-stone-200 bg-stone-100 text-stone-400'
                              : 'btn-3d-green text-white game-text-outline-sm shadow'
                          }`}
                        >
                          {crate.claimedByPlayer ? 'Claimed' : 'Claim Drop'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Syndicate Raid Boss Card */}
          <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3.5 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <BossAvatarSvg name="The Whale" portrait="Fish" size={50} />
                <div>
                  <span className="rounded-full bg-[#e11d48] px-2 py-0.2 font-display text-[9px] font-black uppercase text-white">
                    SYNDICATE CO-OP RAID BOSS
                  </span>
                  <h3 className="font-display text-sm font-extrabold text-[#2C1810] mt-0.5">
                    Sovereign Bear Leviathan
                  </h3>
                  <p className="text-[10px] font-semibold text-[#6E5A4F]">
                    All 30 Syndicate members combine DPS to liquidate the Raid Boss!
                  </p>
                </div>
              </div>
            </div>

            {/* Raid Boss HP Progress Bar */}
            <div className="mb-1 flex items-center justify-between font-display text-[11px] font-extrabold text-[#2C1810]">
              <span>Raid Boss Liquidity Pool</span>
              <span>
                ${fmtNum(raidBossHp)} / ${fmtNum(raidBossMaxHp)}
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full border border-[#E2D5C1] bg-[#F3E9D8] p-0.5 mb-2.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f43f5e] via-[#fb923c] to-[#fde047] transition-all duration-300"
                style={{ width: `${Math.round((raidBossHp / raidBossMaxHp) * 100)}%` }}
              />
            </div>

            <button
              type="button"
              disabled={raidStrikesLeft <= 0}
              onClick={handleRaidStrike}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 font-display text-xs font-black transition-all ${
                raidStrikesLeft <= 0
                  ? 'border border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                  : 'btn-3d-red text-white game-text-outline-sm'
              }`}
            >
              <Swords className="h-4 w-4" />
              <span>
                {raidStrikesLeft > 0
                  ? `LAUNCH RAID STRIKE (${raidStrikesLeft}/2 Left) • +25 Gems`
                  : 'ALL DAILY RAID STRIKES DEPLOYED (0/2)'}
              </span>
            </button>
          </div>

          {/* 🤝 SYNDICATE MERCENARY DESK (LENDING & BORROWING) */}
          <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3.5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-xl shadow-inner">
                  🤝
                </div>
                <div>
                  <h3 className="font-display text-xs font-black text-[#2C1810]">
                    SYNDICATE MERCENARY DESK
                  </h3>
                  <p className="text-[10px] font-semibold text-[#6E5A4F]">
                    Lend hero/coin for passive Hashrate • Borrow 5★ mercenaries!
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 font-display text-[9px] font-black text-[#854d0e]">
                DAILY DESK
              </span>
            </div>

            {/* PART 1: LENDING SECTION */}
            <div className="rounded-2xl border border-[#E2D5C1] bg-[#FBF8F2] p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-[10px] font-black text-[#2C1810] uppercase">
                  1. Your Lent Mercenary
                </span>
                <span className="text-[9px] font-bold text-[#166534]">
                  Earns +500 Hashrate / Day
                </span>
              </div>

              {meta.syndicateLentItem ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#b45309] bg-[#FFFDF9] p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {meta.syndicateLentItem.type === 'hero' ? '🦸' : '🪙'}
                    </span>
                    <div>
                      <div className="font-display text-xs font-black text-[#2C1810]">
                        {meta.syndicateLentItem.type === 'hero'
                          ? (HERO_MAP[meta.syndicateLentItem.id as HeroId]?.name ?? meta.syndicateLentItem.id)
                          : (COIN_MAP[meta.syndicateLentItem.id]?.name ?? meta.syndicateLentItem.id)}
                      </div>
                      <div className="text-[9px] font-semibold text-[#6E5A4F]">
                        Generating passive Hashrate in Syndicate pool
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleClaimLentHashrate}
                      className="btn-3d-gold px-2.5 py-1 text-[10px] font-black text-white game-text-outline-sm shadow"
                    >
                      Claim ⚡
                    </button>
                    <button
                      type="button"
                      onClick={handleReclaimMercenary}
                      className="rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2 py-1 text-[10px] font-bold text-[#6E5A4F] hover:bg-[#E5D7C5]"
                    >
                      Reclaim
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-dashed border-[#b45309] bg-[#FFFDF9] p-2">
                  <span className="text-[10px] font-semibold text-[#6E5A4F]">
                    No mercenary posted yet.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPostPicker(true)}
                    className="btn-3d-gold px-3 py-1 text-[10px] font-black text-white game-text-outline-sm shadow"
                  >
                    + Post Hero / Coin
                  </button>
                </div>
              )}
            </div>

            {/* PART 2: BORROWING SECTION */}
            <div className="rounded-2xl border border-[#E2D5C1] bg-[#FBF8F2] p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-[10px] font-black text-[#2C1810] uppercase">
                  2. Borrow Guildmate Mercenary (1/Day)
                </span>
                <span className="text-[9px] font-bold text-[#b45309]">
                  {meta.borrowedMercenary ? 'Active for Next Run!' : 'Available Today'}
                </span>
              </div>

              {meta.borrowedMercenary ? (
                <div className="flex items-center justify-between rounded-xl border border-[#16a34a] bg-[#dcfce7] p-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">🤝</span>
                    <div className="min-w-0">
                      <div className="font-display text-xs font-black text-[#166534]">
                        {meta.borrowedMercenary.name} (Lv.50 {meta.borrowedMercenary.starLevel}★)
                      </div>
                      <div className="text-[9px] font-semibold text-[#15803d] truncate">
                        Lent by {meta.borrowedMercenary.ownerName} • {meta.borrowedMercenary.buffDescription}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#16a34a] px-2 py-0.5 font-display text-[9px] font-black text-white">
                    EQUIPPED
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {GUILD_MERCENARIES.map((merc) => (
                    <div
                      key={merc.id}
                      className="flex items-center justify-between rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2 gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{merc.badge}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-display text-xs font-black text-[#2C1810]">
                            <span className="truncate">{merc.name}</span>
                            <span className="text-[#f59e0b] shrink-0">{'★'.repeat(merc.starLevel)}</span>
                            <span className="rounded-full bg-[#e0e7ff] px-1.5 py-0.2 text-[8px] font-bold text-[#3730a3] shrink-0">
                              {merc.ownerName}
                            </span>
                          </div>
                          <div className="text-[9px] font-semibold text-[#6E5A4F] truncate">
                            {merc.buffDescription}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleBorrowMercenary(merc)}
                        className="btn-3d-green shrink-0 px-2.5 py-1 text-[10px] font-black text-white game-text-outline-sm shadow"
                      >
                        Borrow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Switch / Browse Trading Syndicates */}
          <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3">
            <div className="font-display text-xs font-extrabold text-[#2C1810] mb-2">
              Browse Top Trading Syndicates
            </div>
            <div className="space-y-1.5">
              {SYNDICATES.map((syn) => {
                const isJoined = syn.id === joinedSyndicateId
                return (
                  <div
                    key={syn.id}
                    className="flex items-center justify-between rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{syn.badge}</span>
                      <div className="min-w-0">
                        <div className="font-display text-xs font-extrabold text-[#2C1810] truncate">
                          {syn.name} (Lv.{syn.level})
                        </div>
                        <div className="text-[9px] font-semibold text-[#6E5A4F] truncate">
                          {syn.buff}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isJoined}
                      onClick={() => {
                        AudioSynth.playCoinInject()
                        setJoinedSyndicateId(syn.id)
                        showToast(`Joined ${syn.name}!`)
                      }}
                      className={`shrink-0 rounded-xl px-2.5 py-1 font-display text-[10px] font-black ${
                        isJoined
                          ? 'bg-[#16a34a] text-white'
                          : 'border border-[#3E2723] bg-[#fde047] text-[#2C1810]'
                      }`}
                    >
                      {isJoined ? 'JOINED' : 'SWITCH'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-VIEW: FINANCIAL DISTRICT TURF WARS (Interactive 5-Territory Map)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {subTab === 'turf' && (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5">
          {/* Turf War Header */}
          <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155] p-3.5 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-400/20 text-2xl shadow">
                  🗺️
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-black text-amber-300">
                      FINANCIAL DISTRICT TURF WARS
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[8px] font-black text-emerald-400">
                      WEEKLY CYCLE
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-300">
                    Deploy Influence Points to seize global financial capitals!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-full border border-amber-400 bg-black/40 px-2 py-0.5 font-display text-[10px] font-black text-amber-300">
                  ⚡ {meta.syndicateInfluencePoints ?? 0} IP
                </span>
              </div>
            </div>
          </div>

          {/* 5 Global Territories Map List */}
          <div className="space-y-2">
            {TURF_DISTRICTS.map((district) => {
              const isClaimedByPlayerSyndicate = (meta.claimedTurfDistricts ?? []).includes(district.id)
              const isTargeted = meta.targetTurfDistrictId === district.id
              const influenceProgress = isClaimedByPlayerSyndicate ? district.totalInfluenceRequired : Math.round(district.totalInfluenceRequired * 0.65)
              const pct = Math.min(100, Math.round((influenceProgress / district.totalInfluenceRequired) * 100))

              return (
                <div
                  key={district.id}
                  className={`rounded-2xl border-2 p-3 transition-all ${
                    isClaimedByPlayerSyndicate
                      ? 'border-emerald-600 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] shadow-md ring-2 ring-emerald-500/40'
                      : isTargeted
                        ? 'border-amber-500 bg-amber-50/50 shadow'
                        : 'border-[#3E2723] bg-[#FFFDF9]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#FFFDF9] to-[#F3E9D8] text-2xl shadow-inner">
                        {district.flagEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-sm font-black text-[#2C1810]">
                            {district.name}
                          </span>
                          {isClaimedByPlayerSyndicate && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.2 font-display text-[8px] font-black text-white">
                              CONTROLLED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-bold text-[#6E5A4F]">
                          {district.subtitle} • {district.city}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isClaimedByPlayerSyndicate ? (
                        <span className="rounded-lg bg-emerald-100 border border-emerald-600 px-2 py-0.5 font-display text-[9px] font-black text-emerald-800">
                          ACTIVE BONUS
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={(meta.syndicateInfluencePoints ?? 0) < 250}
                          onClick={() => {
                            AudioSynth.unlock()
                            if (meta.deployTurfInfluence(district.id, 250)) {
                              AudioSynth.playCoinInject()
                              showToast(`⚡ Deployed 250 Influence Points to ${district.name}!`)
                            }
                          }}
                          className={`rounded-xl px-2.5 py-1 font-display text-[10px] font-black uppercase shadow-xs ${
                            (meta.syndicateInfluencePoints ?? 0) >= 250
                              ? 'btn-3d-amber text-[#2C1810] active:scale-95'
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed border'
                          }`}
                        >
                          DEPLOY 250 IP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* District Influence Progress Bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between font-display text-[9px] font-extrabold text-[#6E5A4F]">
                      <span>Control Influence</span>
                      <span>{fmtNum(influenceProgress)} / {fmtNum(district.totalInfluenceRequired)} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-[#3E2723]/30 bg-[#E2D5C1]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isClaimedByPlayerSyndicate
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Weekly Guild Passive */}
                  <div className="mt-2 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                    <div className="flex items-center gap-1 font-display text-[10px] font-black text-indigo-700">
                      <span>✨ WEEKLY 30-MEMBER PASSIVE:</span>
                      <span>{district.weeklyPassive}</span>
                    </div>
                    <div className="text-[9px] font-semibold text-[#6E5A4F] mt-0.5">
                      {district.weeklyPassiveDesc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-VIEW 2: EXCHANGE LEAGUES (50-Player Bracketed Leaderboard)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {subTab === 'leagues' && (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {/* Server Shard Badge */}
          <div className="flex shrink-0 items-center justify-between rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-3 py-1.5">
            <div className="flex items-center gap-1.5 font-display text-[11px] font-extrabold text-[#2C1810]">
              <Server className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>Exchange Floor #042 • Bracket #07 (50/50 Traders)</span>
            </div>
            <span className="rounded-full bg-[#16a34a] px-2 py-0.2 font-display text-[9px] font-black text-white">
              LIVE
            </span>
          </div>

          {/* 3-Week Rotating Growth Event Switcher */}
          <div className="grid shrink-0 grid-cols-3 gap-1.5 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-1">
            {GROWTH_EVENT_ROTATION.map((ev) => {
              const isSelected = ev.week === activeWeek
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playCoinInject()
                    meta.setActiveGrowthWeek(ev.week)
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl py-1 px-1 text-center transition-all ${
                    isSelected
                      ? 'btn-3d-gold text-white game-text-outline-sm'
                      : 'text-[#6E5A4F] hover:bg-[#FFFDF9]'
                  }`}
                >
                  <span className="font-display text-[8px] font-black uppercase">
                    WEEK {ev.week}
                  </span>
                  <span className="truncate w-full font-display text-[10px] font-black">
                    {ev.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Event Card & Top 3 Target Callout */}
          <div className="flex shrink-0 flex-col gap-1.5 rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-2.5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-[#2C1810]">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xs font-extrabold text-[#2C1810]">
                    {activeEvent.name}
                  </h2>
                  <p className="text-[10px] font-semibold text-[#6E5A4F]">
                    {activeEvent.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[9px] font-black uppercase text-[#6E5A4F]">Your Score</div>
                <div className="font-display text-sm font-black text-[#0284c7]">
                  {fmtNum(playerPts)} pts
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2.5 py-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#2C1810]">
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#16a34a]" />
                {playerEntry.rank <= 3 ? (
                  <span className="font-black text-[#15803d]">
                    Rank #{playerEntry.rank} (Mythical Key Zone!)
                    {playerEntry.rank > 1 && ` · ${fmtNum(pointsToRank1)} pts to #1`}
                  </span>
                ) : (
                  <span>
                    Need{' '}
                    <strong className="font-display font-black text-[#b45309]">
                      +{fmtNum(pointsToTop3)} pts
                    </strong>{' '}
                    for <strong className="text-[#15803d]">Rank #1–#3</strong> Mythical Key Payout!
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playGreenCandle()
                  const bonus = activeWeek === 1 ? 40 : activeWeek === 2 ? 50 : 100
                  meta.addGrowthEventPoints(activeWeek, bonus)
                }}
                className="shrink-0 flex items-center gap-1 rounded-xl px-2 py-1 font-display text-[9px] font-black btn-3d-purple text-white"
              >
                <Sparkles className="h-3 w-3" /> +PTS
              </button>
            </div>

            {/* End-of-Week Payout Tiers */}
            <div className="grid grid-cols-3 gap-1.5">
              {activeEvent.rankRewards.slice(0, 3).map((r, i) => {
                const qKeys = r.reward.find((x) => x.currency === 'quantumKey')?.amount ?? 0
                const gems = r.reward.find((x) => x.currency === 'gems')?.amount ?? 0
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-1.5 text-center"
                  >
                    <div className="flex items-center gap-1 font-display text-[9px] font-extrabold text-[#2C1810]">
                      <Crown className="h-3 w-3 text-[#d97706]" />
                      {r.rankFrom === r.rankTo ? `RANK #1` : `RANK #${r.rankFrom}-#${r.rankTo}`}
                    </div>
                    <div className="flex items-center gap-1 font-display text-[9px] font-black text-[#7e22ce]">
                      <Key className="h-2.5 w-2.5" /> +{qKeys} Keys • <Gem className="h-2.5 w-2.5" /> +
                      {fmtNum(gems)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 50-Player Scrollable Micro-Bracket */}
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-2">
            <div className="flex items-center justify-between px-2 font-display text-[9px] font-black uppercase text-[#6E5A4F]">
              <span>Rank &amp; Trader ({bracket.length}/50)</span>
              <span>Weekly Score</span>
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto pr-0.5">
              {bracket.map((row) => {
                const isTop3 = row.rank <= 3
                return (
                  <div
                    key={row.id}
                    className={`flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-xs font-semibold ${
                      row.isPlayer
                        ? 'border-[#15803d] bg-[#dcfce7] font-extrabold text-[#166534]'
                        : isTop3
                          ? 'border-[#E2D5C1] bg-gradient-to-r from-[#fef08a] to-[#F3E9D8] text-[#2C1810]'
                          : 'border-[#E2D5C1] bg-[#F3E9D8] text-[#2C1810]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 font-display text-xs font-black text-[#b45309]">
                        #{row.rank}
                      </span>
                      {isTop3 && <Medal className="h-3.5 w-3.5 shrink-0 text-[#d97706]" />}
                      <span className="truncate font-display text-xs">{row.name}</span>
                      <span className="rounded-full bg-[#f3e8ff] px-1.5 py-0.2 font-display text-[8px] font-black text-[#7e22ce] shrink-0">
                        🗼 Fl.{row.isPlayer ? (meta.highestTowerFloorCleared ?? 0) : Math.max(1, 35 - row.rank * 2)}
                      </span>
                    </div>

                    <span className="flex shrink-0 items-center gap-1 font-display text-xs font-black text-[#0284c7]">
                      <Flame className="h-3 w-3 text-[#f59e0b]" />
                      {fmtNum(row.points)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-VIEW 3: TRADER WALL (Community Feed & Salutes)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {subTab === 'wall' && (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {/* Top Flex Status Bar */}
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-2.5 shadow-xs">
            <div>
              <div className="font-display text-xs font-extrabold text-[#2C1810]">
                Syndicate &amp; Server Trader Wall
              </div>
              <div className="text-[10px] font-semibold text-[#6E5A4F]">
                Salute fellow traders for free Satoshi Gems (+10 Gems each)!
              </div>
            </div>
            <button
              type="button"
              disabled={hasFlexedToday}
              onClick={handleFlexAchievement}
              className={`shrink-0 flex items-center gap-1 rounded-xl px-3 py-2 font-display text-[10px] font-black ${
                hasFlexedToday
                  ? 'border border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                  : 'btn-3d-green text-white game-text-outline-sm'
              }`}
            >
              <Send className="h-3 w-3" />
              <span>{hasFlexedToday ? 'FLEXED' : 'FLEX (+20 Gems)'}</span>
            </button>
          </div>

          {/* Community Feed Cards */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {wallPosts.map((post) => {
              const saluted = salutedIds.includes(post.id)
              return (
                <div
                  key={post.id}
                  className="rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#fde047] text-lg">
                        {post.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-xs font-extrabold text-[#2C1810]">
                            {post.trader}
                          </span>
                          <span className="rounded-full bg-[#F3E9D8] border border-[#E2D5C1] px-1.5 py-0.2 font-display text-[8px] font-black text-[#6E5A4F]">
                            {post.badge}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-[#6E5A4F]">
                          {post.timestamp}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={saluted}
                      onClick={() => handleSalutePost(post.id)}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10px] font-black transition-all ${
                        saluted
                          ? 'border border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                          : 'btn-3d-amber text-[#2C1810] active:translate-y-0.5'
                      }`}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          saluted ? 'fill-rose-500 text-rose-500' : 'text-rose-600'
                        }`}
                      />
                      <span>{saluted ? `${post.salutes} Saluted` : `Salute (+10 Gems)`}</span>
                    </button>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-[#2C1810]">{post.actionText}</p>
                  <div
                    className={`mt-1.5 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2.5 py-1.5 font-display text-xs font-extrabold text-[#2C1810]`}
                  >
                    {post.highlight}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Post to Syndicate Pool Modal */}
      {showPostPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border-[3px] border-[#3E2723] bg-[#FFFDF9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D5C1] px-4 py-3 bg-[#FBF8F2]">
              <span className="font-display text-xs font-black text-[#2C1810]">
                POST MERCENARY TO LOAN POOL
              </span>
              <button
                type="button"
                onClick={() => setShowPostPicker(false)}
                className="text-xs font-black text-[#6E5A4F]"
              >
                Cancel
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              <div className="text-[10px] font-bold text-[#6E5A4F] uppercase mb-1">
                Owned Heroes (Earns +500 ⚡/day):
              </div>
              {Object.keys(meta.ownedHeroes ?? {}).map((hid) => {
                const hCfg = HERO_MAP[hid as HeroId]
                if (!hCfg) return null
                return (
                  <button
                    key={hid}
                    type="button"
                    onClick={() => handlePostMercenary('hero', hid)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-2 hover:bg-[#ffedd5] active:scale-98 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🦸</span>
                      <div className="text-left font-display text-xs font-black text-[#2C1810]">
                        {hCfg.name}
                      </div>
                    </div>
                    <span className="btn-3d-gold px-2 py-0.5 text-[9px] font-black text-white">
                      Post Hero
                    </span>
                  </button>
                )
              })}

              <div className="text-[10px] font-bold text-[#6E5A4F] uppercase mt-3 mb-1">
                Equipped Coins:
              </div>
              {meta.equippedCoinIds.filter(Boolean).map((cid) => {
                const stack = meta.ownedCoins.find((c) => c.id === cid)
                if (!stack) return null
                const cCfg = COIN_MAP[stack.coinId]
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => handlePostMercenary('coin', stack.coinId)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-2 hover:bg-[#ffedd5] active:scale-98 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🪙</span>
                      <div className="text-left font-display text-xs font-black text-[#2C1810]">
                        {cCfg?.name ?? stack.coinId} ({stack.rarity})
                      </div>
                    </div>
                    <span className="btn-3d-gold px-2 py-0.5 text-[9px] font-black text-white">
                      Post Coin
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Guild Syndicate Heist Raid Modal */}
      <GuildHeistModal
        isOpen={showGuildHeistModal}
        onClose={() => setShowGuildHeistModal(false)}
      />
    </div>
  )
}
