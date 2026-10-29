import type { RelicConfig } from '../types/game.types'

export const RELICS: RelicConfig[] = [
  {
    id: 'overclocked_asic', name: 'Overclocked ASIC', rarity: 'common', icon: 'Cpu', shopPrice: 60,
    description: 'Every Green roll makes that coin tick 5% faster for 3 ticks.',
    trigger: 'onGreen', effects: [{ kind: 'tickSpeed', value: -0.05, durationTicks: 3, target: 'self' }],
  },
  {
    id: 'dead_cat_bounce', name: 'Dead Cat Bounce', rarity: 'uncommon', icon: 'Cat', shopPrice: 90,
    description: 'After a Red roll, that coin gets +15% Up chance on its next roll.',
    trigger: 'onRed', effects: [{ kind: 'modifyUpChance', value: 15, durationTicks: 1, target: 'self' }],
  },
  {
    id: 'stop_loss_subroutine', name: 'Stop-Loss Subroutine', rarity: 'common', icon: 'OctagonX', shopPrice: 70,
    description: 'Red rolls lose 25% less cash.',
    trigger: 'onRed', effects: [{ kind: 'reduceLoss', value: 0.25, isFraction: true, target: 'self' }],
  },
  {
    id: 'leverage_injector', name: 'Leverage Injector', rarity: 'rare', icon: 'Syringe', shopPrice: 140,
    description: 'Green rolls gain +50% more, but Red rolls lose +25% more.',
    trigger: 'onBattleStart',
    effects: [
      { kind: 'modifyUpMultiplier', value: 0.5, isFraction: true, target: 'allAllies' },
      { kind: 'modifyDownMultiplier', value: 0.25, isFraction: true, target: 'allAllies' },
    ],
  },
  {
    id: 'wash_trading_bot', name: 'Wash Trading Bot', rarity: 'uncommon', icon: 'Bot', shopPrice: 100,
    description: 'Flat rolls generate $5 Run Cash and deal 5 damage.',
    trigger: 'onFlat',
    effects: [
      { kind: 'gainCash', value: 5, target: 'player' },
      { kind: 'bonusDamage', value: 5, target: 'enemy' },
    ],
  },
  {
    id: 'gas_fee_skimmer', name: 'Gas Fee Skimmer', rarity: 'common', icon: 'Fuel', shopPrice: 50,
    description: 'Mid-battle Rebalances cost no Gas Fee and instead grant +$150 bonus cash.',
    trigger: 'onRebalance', effects: [{ kind: 'gainCash', value: 150, target: 'player' }],
  },
  {
    id: 'diamond_hands_script', name: 'Diamond Hands Script', rarity: 'epic', icon: 'Gem', shopPrice: 200,
    description: 'Below 30% Margin HP, all coins lose 75% less on Red rolls for the rest of the battle.',
    trigger: 'onLowHP', threshold: 0.3, maxTriggersPerBattle: 1,
    effects: [{ kind: 'reduceLoss', value: 0.75, isFraction: true, target: 'allAllies' }],
  },
  {
    id: 'whale_alert_radar', name: 'Whale Alert Radar', rarity: 'rare', icon: 'Radar', shopPrice: 150,
    description: 'Below 50% Margin HP, gain a 25 HP shield once per battle.',
    trigger: 'onLowHP', threshold: 0.5, maxTriggersPerBattle: 1,
    effects: [{ kind: 'shieldMargin', value: 25, target: 'player' }],
  },
  {
    id: 'pump_group_chat', name: 'Pump Group Chat', rarity: 'uncommon', icon: 'MessagesSquare', shopPrice: 110,
    description: 'Whenever a coin rolls Green, all OTHER coins gain +3% Up chance for 2 ticks.',
    trigger: 'onGreen', effects: [{ kind: 'modifyUpChance', value: 3, durationTicks: 2, target: 'allAllies' }],
  },
  {
    id: 'mev_frontrunner', name: 'MEV Frontrunner', rarity: 'epic', icon: 'FastForward', shopPrice: 220,
    description: '15% chance on Green to trigger the roll again.',
    trigger: 'onGreen', procChance: 0.15, effects: [{ kind: 'retriggerRoll', value: 1, target: 'self' }],
  },
  {
    id: 'cold_storage_backup', name: 'Cold Storage Backup', rarity: 'legendary', icon: 'Snowflake', shopPrice: 300,
    description: 'Below 20% Margin HP, heal 30% of max Margin HP once per battle.',
    trigger: 'onLowHP', threshold: 0.2, maxTriggersPerBattle: 1,
    effects: [{ kind: 'healMargin', value: 0.3, isFraction: true, target: 'player' }],
  },
  {
    id: 'flash_loan_exploit', name: 'Flash Loan Exploit', rarity: 'mythical', icon: 'Skull', shopPrice: 450,
    description: 'On Rebalance, deal damage equal to 20% of total allocated cash.',
    trigger: 'onRebalance', maxTriggersPerBattle: 3,
    effects: [{ kind: 'bonusDamage', value: 0.2, isFraction: true, target: 'enemy' }],
  },
  {
    id: 'hype_train_bot', name: 'Hype Train Bot', rarity: 'rare', icon: 'Flame', shopPrice: 160,
    description: 'Meme rally hype feeds all coins +20% pump gains on Green rolls.',
    trigger: 'onGreen',
    effects: [{ kind: 'modifyUpMultiplier', value: 0.2, isFraction: true, target: 'allAllies' }],
  },
  {
    id: 'dark_pool_short', name: 'Dark Pool Short', rarity: 'epic', icon: 'EyeOff', shopPrice: 210,
    description: 'Red rolls deal 40% counter-damage to enemy.',
    trigger: 'onRed',
    effects: [{ kind: 'bonusDamage', value: 0.4, isFraction: true, target: 'enemy' }],
  },
]

export const RELIC_MAP: Record<string, RelicConfig> = Object.fromEntries(RELICS.map((r) => [r.id, r]))
