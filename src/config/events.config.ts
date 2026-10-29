import type { RunEventConfig } from '../types/game.types'

export const RUN_EVENTS: RunEventConfig[] = [
  {
    id: 'influencer_dm', title: 'The Influencer DM', icon: 'MessageCircle', minStage: 1,
    description: '"Hey king 👑 got an early allocation for you. 100x guaranteed. Just send $50."',
    choices: [
      {
        id: 'ape', label: 'Send $50 and ape in', risk: 'degen', cost: { cash: 50 },
        outcomes: [
          { chance: 0.3, text: 'It actually pumped! You walk away with $200.', effects: [{ type: 'cash', amount: 200 }] },
          { chance: 0.7, text: 'Rugged. The account is deleted.', effects: [{ type: 'nothing' }] },
        ],
      },
      {
        id: 'expose', label: 'Screenshot & expose them', risk: 'safe',
        outcomes: [{ chance: 1, text: 'Clout acquired. Followers tip you $20.', effects: [{ type: 'cash', amount: 20 }] }],
      },
    ],
  },
  {
    id: 'hard_fork', title: 'The Hard Fork', icon: 'GitFork', minStage: 2,
    description: 'The community splits. One of your coins can follow the new chain — or stay loyal.',
    choices: [
      {
        id: 'fork', label: 'Follow the fork', risk: 'risky',
        outcomes: [
          { chance: 0.6, text: 'The fork wins. Your coin upgrades a tier!', effects: [{ type: 'upgradeCoin', tiers: 1 }] },
          { chance: 0.4, text: 'Ghost chain. Your coin is lost.', effects: [{ type: 'loseCoin' }] },
        ],
      },
      {
        id: 'stay', label: 'Stay on the original chain', risk: 'safe',
        outcomes: [{ chance: 1, text: 'Loyalty rewarded: +10 Margin HP.', effects: [{ type: 'marginHp', amount: 10 }] }],
      },
    ],
  },
  {
    id: 'phishing_airdrop', title: 'Phishing Airdrop', icon: 'Fish', minStage: 1,
    description: 'A mysterious token appeared in your wallet. "Claim your rewards at totally-legit-dex.io"',
    choices: [
      {
        id: 'claim', label: 'Connect wallet & claim', risk: 'degen',
        outcomes: [
          { chance: 0.25, text: 'Somehow legit. A free relic!', effects: [{ type: 'gainRelic', rarity: 'rare' }] },
          { chance: 0.75, text: 'Wallet drained. Lose 40% of your cash.', effects: [{ type: 'cash', amount: -0.4, isFraction: true }] },
        ],
      },
      {
        id: 'burn', label: 'Burn the token', risk: 'safe',
        outcomes: [{ chance: 1, text: 'Security conscious. Next battle +5% Up chance.', effects: [{ type: 'buffNextBattle', effect: { kind: 'modifyUpChance', value: 5, target: 'allAllies' } }] }],
      },
    ],
  },
  {
    id: 'margin_call_bailout', title: 'Margin Call Bailout', icon: 'LifeBuoy', minStage: 3,
    description: 'A shadowy lender offers to top up your margin... for a price.',
    choices: [
      {
        id: 'accept', label: 'Accept the bailout', risk: 'risky',
        outcomes: [{ chance: 1, text: 'Heal 40% Margin HP, but lose a relic as collateral.', effects: [{ type: 'marginHp', amount: 0.4, isFraction: true }, { type: 'loseRelic' }] }],
      },
      {
        id: 'pay', label: 'Pay $75 for a smaller top-up', risk: 'safe', cost: { cash: 75 },
        outcomes: [{ chance: 1, text: 'Heal 20% Margin HP.', effects: [{ type: 'marginHp', amount: 0.2, isFraction: true }] }],
      },
      {
        id: 'decline', label: 'Decline', risk: 'safe',
        outcomes: [{ chance: 1, text: 'You stay proud. And poor.', effects: [{ type: 'nothing' }] }],
      },
    ],
  },
  {
    id: 'exchange_hack', title: 'Exchange Hack', icon: 'ShieldAlert', minStage: 2,
    description: 'Your exchange just got hacked. Withdrawals are "temporarily paused".',
    choices: [
      {
        id: 'panic', label: 'Panic withdraw everything', risk: 'risky',
        outcomes: [
          { chance: 0.5, text: 'Got out in time! Keep everything plus a $30 bounty.', effects: [{ type: 'cash', amount: 30 }] },
          { chance: 0.5, text: 'Too late. Lose 30% of your cash.', effects: [{ type: 'cash', amount: -0.3, isFraction: true }] },
        ],
      },
      {
        id: 'wait', label: 'Wait for the insurance fund', risk: 'safe',
        outcomes: [{ chance: 1, text: 'Insurance covers you, but next battle starts with 10 less Margin HP.', effects: [{ type: 'marginHp', amount: -10 }] }],
      },
    ],
  },
  {
    id: 'dark_web_tip', title: 'Dark Web Tip', icon: 'Spline', minStage: 4,
    description: 'An anon on a .onion forum sells "insider alpha" about the next boss.',
    choices: [
      {
        id: 'buy', label: 'Buy the alpha ($60)', risk: 'risky', cost: { cash: 60 },
        outcomes: [
          { chance: 0.7, text: 'Real intel. Next battle: +25% Up multiplier.', effects: [{ type: 'buffNextBattle', effect: { kind: 'modifyUpMultiplier', value: 0.25, isFraction: true, target: 'allAllies' } }] },
          { chance: 0.3, text: 'Fed honeypot. Next battle: coins tick 20% slower.', effects: [{ type: 'debuffNextBattle', effect: { kind: 'tickSpeed', value: 0.2, target: 'allAllies' } }] },
        ],
      },
      {
        id: 'ignore', label: 'Log off', risk: 'safe',
        outcomes: [{ chance: 1, text: 'Nothing happens.', effects: [{ type: 'nothing' }] }],
      },
    ],
  },
  {
    id: 'regulatory_audit', title: 'Regulatory Audit', icon: 'FileSearch', minStage: 3,
    description: 'The SEC wants to see your books. All of them.',
    choices: [
      {
        id: 'comply', label: 'Comply fully (pay 15% fine)', risk: 'safe',
        outcomes: [{ chance: 1, text: 'Clean record. Gain 5 Satoshi Gems for compliance.', effects: [{ type: 'cash', amount: -0.15, isFraction: true }, { type: 'gems', amount: 5 }] }],
      },
      {
        id: 'shred', label: 'Shred the evidence', risk: 'degen',
        outcomes: [
          { chance: 0.5, text: 'They found nothing. Gain an Epic relic from the "lost" files.', effects: [{ type: 'gainRelic', rarity: 'epic' }] },
          { chance: 0.5, text: 'Caught! Lose 25 Margin HP and a coin is seized.', effects: [{ type: 'marginHp', amount: -25 }, { type: 'loseCoin' }] },
        ],
      },
    ],
  },
  {
    id: 'asic_overheat', title: 'ASIC Overheat', icon: 'Flame', minStage: 2,
    description: 'Your mining rig is smoking. You could push it harder... or let it cool.',
    choices: [
      {
        id: 'overclock', label: 'Overclock it anyway', risk: 'risky',
        outcomes: [
          { chance: 0.6, text: 'Blazing hashrate! +500 Hashrate and coins tick 15% faster next battle.', effects: [{ type: 'hashrate', amount: 500 }, { type: 'buffNextBattle', effect: { kind: 'tickSpeed', value: -0.15, target: 'allAllies' } }] },
          { chance: 0.4, text: 'It catches fire. Lose 20 Margin HP.', effects: [{ type: 'marginHp', amount: -20 }] },
        ],
      },
      {
        id: 'cool', label: 'Let it cool down', risk: 'safe',
        outcomes: [{ chance: 1, text: 'Steady output: +150 Hashrate.', effects: [{ type: 'hashrate', amount: 150 }] }],
      },
    ],
  },
]

export const EVENT_MAP: Record<string, RunEventConfig> = Object.fromEntries(RUN_EVENTS.map((e) => [e.id, e]))
