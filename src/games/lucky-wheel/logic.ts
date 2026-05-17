export type WheelSegmentType = 'coin' | 'blank' | 'item' | 'special';
export type CoinTier = 'small' | 'medium' | 'large' | 'jackpot';

export type LuckyItemId =
  | 'fortune-firework'
  | 'double-badge'
  | 'lucky-magnet'
  | 'free-spin'
  | 'coin-shield'
  | 'safe-box'
  | 'reward-amplifier'
  | 'oracle-pointer';

export type SpecialEventId =
  | 'coin-rain'
  | 'treasure-tax'
  | 'golden-hour'
  | 'lucky-wind'
  | 'discount-festival'
  | 'black-hole';

export type LevelConfig = {
  id: number;
  name: string;
  targetCoins: number;
  spinCost: number;
  rewardMultiplier: number;
  description: string;
};

export type WheelSegment = {
  id: string;
  label: string;
  type: WheelSegmentType;
  weight: number;
  color: string;
  description: string;
  coinReward?: number;
  tier?: CoinTier;
};

export type LuckyItem = {
  id: LuckyItemId;
  name: string;
  shortName: string;
  description: string;
};

export type SpecialEvent = {
  id: SpecialEventId;
  name: string;
  tone: 'good' | 'bad' | 'mixed';
  description: string;
};

export type ActiveEffects = {
  doubleRewardSpins: number;
  bonusMultiplierSpins: number;
  highRewardBoostSpins: number;
  freeSpins: number;
  lossShieldCharges: number;
  lossReductionSpins: number;
  noBlankSpins: number;
  costDiscountSpins: number;
  rewardSurgeSpins: number;
  rewardDampenerSpins: number;
};

export type Inventory = Record<LuckyItemId, number>;

export type SpinResult = {
  segment: WheelSegment;
  coins: number;
  coinDelta: number;
  inventory: Inventory;
  effects: ActiveEffects;
  messages: string[];
  awardedItem?: LuckyItem;
  specialEvent?: SpecialEvent;
};

export type ItemUseResult = {
  coins: number;
  coinDelta: number;
  inventory: Inventory;
  effects: ActiveEffects;
  message: string;
};

export const initialCoins = 160;

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: '新手小镇',
    targetCoins: 360,
    spinCost: 30,
    rewardMultiplier: 1,
    description: '低成本熟悉奖池，攒到 360 金币即可过关。',
  },
  {
    id: 2,
    name: '霓虹集市',
    targetCoins: 760,
    spinCost: 45,
    rewardMultiplier: 1.15,
    description: '奖励开始放大，特殊事件会更明显地影响收益节奏。',
  },
  {
    id: 3,
    name: '星辉赌场',
    targetCoins: 1300,
    spinCost: 65,
    rewardMultiplier: 1.35,
    description: '目标提高，合理使用概率类道具更容易追上进度。',
  },
  {
    id: 4,
    name: '黄金穹顶',
    targetCoins: 2100,
    spinCost: 90,
    rewardMultiplier: 1.6,
    description: '转动成本较高，护盾和折扣能显著降低风险。',
  },
  {
    id: 5,
    name: '命运之巅',
    targetCoins: 3200,
    spinCost: 120,
    rewardMultiplier: 2,
    description: '最终关卡，大奖收益极高，但黑洞与税务事件也更痛。',
  },
];

export const wheelSegments: WheelSegment[] = [
  {
    id: 'coin-small',
    label: '小额金币',
    type: 'coin',
    weight: 24,
    color: '#facc15',
    coinReward: 55,
    tier: 'small',
    description: '最常见的金币奖励，提供稳定收入。',
  },
  {
    id: 'blank',
    label: '无奖励',
    type: 'blank',
    weight: 22,
    color: '#cbd5e1',
    description: '本次没有获得奖励，只扣除转动费用。',
  },
  {
    id: 'item',
    label: '随机道具',
    type: 'item',
    weight: 16,
    color: '#38bdf8',
    description: '随机获得 1 个可主动使用的道具。',
  },
  {
    id: 'coin-medium',
    label: '中额金币',
    type: 'coin',
    weight: 16,
    color: '#f97316',
    coinReward: 115,
    tier: 'medium',
    description: '中等概率的金币奖励，收益明显高于转动费用。',
  },
  {
    id: 'special',
    label: '特殊区域',
    type: 'special',
    weight: 12,
    color: '#a855f7',
    description: '触发随机特殊事件，可能改变金币、倍率、概率或费用。',
  },
  {
    id: 'coin-large',
    label: '大额金币',
    type: 'coin',
    weight: 8,
    color: '#22c55e',
    coinReward: 210,
    tier: 'large',
    description: '较低概率的大额奖励，是快速过关的关键。',
  },
  {
    id: 'coin-jackpot',
    label: '超级大奖',
    type: 'coin',
    weight: 2,
    color: '#ef4444',
    coinReward: 460,
    tier: 'jackpot',
    description: '概率最低、奖励最高的金币档位。',
  },
];

export const luckyItems: LuckyItem[] = [
  {
    id: 'fortune-firework',
    name: '财富礼花',
    shortName: '礼花',
    description: '立即获得一笔金币，关卡越高收益越高。',
  },
  {
    id: 'double-badge',
    name: '双倍星章',
    shortName: '双倍',
    description: '下 1 次金币奖励变为 2 倍。',
  },
  {
    id: 'lucky-magnet',
    name: '幸运磁铁',
    shortName: '磁铁',
    description: '接下来 3 次转动提高大额金币和超级大奖概率。',
  },
  {
    id: 'free-spin',
    name: '免费转动券',
    shortName: '免费',
    description: '下 1 次转动不消耗金币。',
  },
  {
    id: 'coin-shield',
    name: '金币护盾',
    shortName: '护盾',
    description: '抵消下一次特殊事件造成的金币损失。',
  },
  {
    id: 'safe-box',
    name: '保险箱',
    shortName: '保险',
    description: '接下来 3 次转动中，特殊事件金币损失减半。',
  },
  {
    id: 'reward-amplifier',
    name: '奖励放大器',
    shortName: '放大',
    description: '接下来 4 次转动的正向金币收益提高 50%。',
  },
  {
    id: 'oracle-pointer',
    name: '预言指针',
    shortName: '预言',
    description: '下 1 次转动不会落在无奖励区域。',
  },
];

export const specialEvents: SpecialEvent[] = [
  {
    id: 'coin-rain',
    name: '金币雨',
    tone: 'good',
    description: '立即获得一笔金币奖励。',
  },
  {
    id: 'treasure-tax',
    name: '宝藏税',
    tone: 'bad',
    description: '立即损失一部分金币，可被护盾或保险箱缓解。',
  },
  {
    id: 'golden-hour',
    name: '黄金时刻',
    tone: 'good',
    description: '接下来 3 次正向金币收益提高 50%。',
  },
  {
    id: 'lucky-wind',
    name: '幸运顺风',
    tone: 'good',
    description: '接下来 4 次大额金币和超级大奖概率提升。',
  },
  {
    id: 'discount-festival',
    name: '折扣庆典',
    tone: 'good',
    description: '接下来 3 次转动费用降低 40%。',
  },
  {
    id: 'black-hole',
    name: '黑洞扰动',
    tone: 'mixed',
    description: '立即损失金币，并让接下来 2 次金币奖励减半。',
  },
];

export const emptyEffects: ActiveEffects = {
  doubleRewardSpins: 0,
  bonusMultiplierSpins: 0,
  highRewardBoostSpins: 0,
  freeSpins: 0,
  lossShieldCharges: 0,
  lossReductionSpins: 0,
  noBlankSpins: 0,
  costDiscountSpins: 0,
  rewardSurgeSpins: 0,
  rewardDampenerSpins: 0,
};

export function createInitialInventory(): Inventory {
  return luckyItems.reduce((inventory, item) => {
    inventory[item.id] = 0;
    return inventory;
  }, {} as Inventory);
}

export function createInitialEffects(): ActiveEffects {
  return { ...emptyEffects };
}

export function getLevel(index: number) {
  return levels[Math.min(levels.length - 1, Math.max(0, index))];
}

export function getSpinCost(level: LevelConfig, effects: ActiveEffects) {
  if (effects.freeSpins > 0) {
    return 0;
  }

  const discount = effects.costDiscountSpins > 0 ? 0.6 : 1;
  return Math.max(1, Math.round(level.spinCost * discount));
}

export function getRewardMultiplier(level: LevelConfig, effects: ActiveEffects) {
  let multiplier = level.rewardMultiplier;

  if (effects.doubleRewardSpins > 0) {
    multiplier *= 2;
  }

  if (effects.bonusMultiplierSpins > 0) {
    multiplier *= 1.5;
  }

  if (effects.rewardSurgeSpins > 0) {
    multiplier *= 1.5;
  }

  if (effects.rewardDampenerSpins > 0) {
    multiplier *= 0.5;
  }

  return multiplier;
}

export function getAdjustedSegments(effects: ActiveEffects) {
  return wheelSegments
    .filter((segment) => !(effects.noBlankSpins > 0 && segment.type === 'blank'))
    .map((segment) => {
      let weight = segment.weight;

      if (effects.highRewardBoostSpins > 0) {
        if (segment.tier === 'jackpot') {
          weight *= 3;
        } else if (segment.tier === 'large') {
          weight *= 2.35;
        } else if (segment.tier === 'medium') {
          weight *= 1.25;
        } else if (segment.type === 'blank') {
          weight *= 0.65;
        }
      }

      return { ...segment, weight };
    });
}

export function spinWheel(
  level: LevelConfig,
  coins: number,
  inventory: Inventory,
  effects: ActiveEffects,
  random = Math.random,
): SpinResult {
  const cost = getSpinCost(level, effects);
  const selectedSegment = pickWeighted(getAdjustedSegments(effects), random);
  let nextCoins = coins - cost;
  let nextInventory = { ...inventory };
  let nextEffects = consumeSpinEffects(effects);
  let coinDelta = -cost;
  const messages = [`消耗 ${cost} 金币，转盘停在「${selectedSegment.label}」。`];
  let awardedItem: LuckyItem | undefined;
  let specialEvent: SpecialEvent | undefined;

  if (selectedSegment.type === 'coin') {
    const reward = Math.round((selectedSegment.coinReward ?? 0) * getRewardMultiplier(level, effects));
    nextCoins += reward;
    coinDelta += reward;
    messages.push(`获得 ${reward} 金币。`);
  }

  if (selectedSegment.type === 'blank') {
    messages.push('这次没有额外收益。');
  }

  if (selectedSegment.type === 'item') {
    awardedItem = pickWeighted(
      luckyItems.map((item) => ({ ...item, weight: 1 })),
      random,
    );
    nextInventory = addItem(nextInventory, awardedItem.id, 1);
    messages.push(`获得道具「${awardedItem.name}」。`);
  }

  if (selectedSegment.type === 'special') {
    specialEvent = pickWeighted(
      specialEvents.map((event) => ({ ...event, weight: 1 })),
      random,
    );
    const eventResult = applySpecialEvent(specialEvent, level, nextCoins, nextEffects, effects);
    nextCoins = eventResult.coins;
    nextEffects = eventResult.effects;
    coinDelta += eventResult.coinDelta;
    messages.push(`触发「${specialEvent.name}」：${eventResult.message}`);
  }

  return {
    segment: selectedSegment,
    coins: Math.max(0, nextCoins),
    coinDelta,
    inventory: nextInventory,
    effects: nextEffects,
    messages,
    awardedItem,
    specialEvent,
  };
}

export function applyItem(
  itemId: LuckyItemId,
  level: LevelConfig,
  coins: number,
  inventory: Inventory,
  effects: ActiveEffects,
): ItemUseResult | null {
  if (inventory[itemId] <= 0) {
    return null;
  }

  const nextInventory = addItem(inventory, itemId, -1);
  const nextEffects = { ...effects };
  let nextCoins = coins;
  let coinDelta = 0;
  let message = '';

  if (itemId === 'fortune-firework') {
    coinDelta = Math.round(120 * level.rewardMultiplier);
    nextCoins += coinDelta;
    message = `使用「财富礼花」，立即获得 ${coinDelta} 金币。`;
  }

  if (itemId === 'double-badge') {
    nextEffects.doubleRewardSpins += 1;
    message = '使用「双倍星章」，下 1 次金币奖励变为 2 倍。';
  }

  if (itemId === 'lucky-magnet') {
    nextEffects.highRewardBoostSpins += 3;
    message = '使用「幸运磁铁」，接下来 3 次大额奖励概率提升。';
  }

  if (itemId === 'free-spin') {
    nextEffects.freeSpins += 1;
    message = '使用「免费转动券」，下 1 次转动免费。';
  }

  if (itemId === 'coin-shield') {
    nextEffects.lossShieldCharges += 1;
    message = '使用「金币护盾」，下一次金币损失事件会被抵消。';
  }

  if (itemId === 'safe-box') {
    nextEffects.lossReductionSpins += 3;
    message = '使用「保险箱」，接下来 3 次转动中金币损失减半。';
  }

  if (itemId === 'reward-amplifier') {
    nextEffects.bonusMultiplierSpins += 4;
    message = '使用「奖励放大器」，接下来 4 次正向金币收益提高 50%。';
  }

  if (itemId === 'oracle-pointer') {
    nextEffects.noBlankSpins += 1;
    message = '使用「预言指针」，下 1 次转动不会落在无奖励区域。';
  }

  return {
    coins: nextCoins,
    coinDelta,
    inventory: nextInventory,
    effects: nextEffects,
    message,
  };
}

export function buildWheelGradient(segments: WheelSegment[]) {
  const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
  let current = 0;

  return `conic-gradient(${segments
    .map((segment) => {
      const start = (current / totalWeight) * 360;
      current += segment.weight;
      const end = (current / totalWeight) * 360;
      return `${segment.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
    })
    .join(', ')})`;
}

export function getSegmentCenterAngle(segmentId: string) {
  const totalWeight = wheelSegments.reduce((sum, segment) => sum + segment.weight, 0);
  let current = 0;

  for (const segment of wheelSegments) {
    const start = (current / totalWeight) * 360;
    current += segment.weight;
    const end = (current / totalWeight) * 360;

    if (segment.id === segmentId) {
      return (start + end) / 2;
    }
  }

  return 0;
}

export function formatCoins(value: number) {
  return `${Math.max(0, Math.round(value)).toLocaleString('zh-CN')} 金币`;
}

function consumeSpinEffects(effects: ActiveEffects): ActiveEffects {
  return {
    ...effects,
    doubleRewardSpins: decrease(effects.doubleRewardSpins),
    bonusMultiplierSpins: decrease(effects.bonusMultiplierSpins),
    highRewardBoostSpins: decrease(effects.highRewardBoostSpins),
    freeSpins: decrease(effects.freeSpins),
    lossReductionSpins: decrease(effects.lossReductionSpins),
    noBlankSpins: decrease(effects.noBlankSpins),
    costDiscountSpins: decrease(effects.costDiscountSpins),
    rewardSurgeSpins: decrease(effects.rewardSurgeSpins),
    rewardDampenerSpins: decrease(effects.rewardDampenerSpins),
  };
}

function applySpecialEvent(
  event: SpecialEvent,
  level: LevelConfig,
  coins: number,
  effectsAfterSpin: ActiveEffects,
  effectsBeforeSpin: ActiveEffects,
) {
  let nextCoins = coins;
  let nextEffects = { ...effectsAfterSpin };
  let coinDelta = 0;
  let message = '';

  if (event.id === 'coin-rain') {
    coinDelta = Math.round(150 * level.rewardMultiplier);
    nextCoins += coinDelta;
    message = `金币雨落下，获得 ${coinDelta} 金币。`;
  }

  if (event.id === 'treasure-tax') {
    const rawLoss = Math.max(45, Math.round(coins * 0.18));
    const lossResult = resolveLoss(rawLoss, effectsBeforeSpin, nextEffects);
    coinDelta = -lossResult.loss;
    nextEffects = lossResult.effects;
    nextCoins -= lossResult.loss;
    message = lossResult.blocked
      ? '宝藏税被金币护盾抵消，没有损失金币。'
      : `缴纳宝藏税，损失 ${lossResult.loss} 金币。`;
  }

  if (event.id === 'golden-hour') {
    nextEffects.rewardSurgeSpins += 3;
    message = '黄金时刻开启，接下来 3 次正向金币收益提高 50%。';
  }

  if (event.id === 'lucky-wind') {
    nextEffects.highRewardBoostSpins += 4;
    message = '幸运顺风吹起，接下来 4 次大额奖励概率提升。';
  }

  if (event.id === 'discount-festival') {
    nextEffects.costDiscountSpins += 3;
    message = '折扣庆典开始，接下来 3 次转动费用降低 40%。';
  }

  if (event.id === 'black-hole') {
    const rawLoss = Math.max(60, Math.round(coins * 0.12));
    const lossResult = resolveLoss(rawLoss, effectsBeforeSpin, nextEffects);
    coinDelta = -lossResult.loss;
    nextEffects = lossResult.effects;
    nextEffects.rewardDampenerSpins += 2;
    nextCoins -= lossResult.loss;
    message = lossResult.blocked
      ? '黑洞扰动的金币损失被护盾抵消，但接下来 2 次金币奖励仍会减半。'
      : `黑洞吞走 ${lossResult.loss} 金币，接下来 2 次金币奖励减半。`;
  }

  return {
    coins: Math.max(0, nextCoins),
    effects: nextEffects,
    coinDelta,
    message,
  };
}

function resolveLoss(
  rawLoss: number,
  effectsBeforeSpin: ActiveEffects,
  effectsAfterSpin: ActiveEffects,
) {
  const effects = { ...effectsAfterSpin };

  if (effectsBeforeSpin.lossShieldCharges > 0) {
    effects.lossShieldCharges = Math.max(0, effects.lossShieldCharges - 1);
    return { loss: 0, effects, blocked: true };
  }

  const loss = effectsBeforeSpin.lossReductionSpins > 0 ? Math.round(rawLoss * 0.5) : rawLoss;
  return { loss, effects, blocked: false };
}

function addItem(inventory: Inventory, itemId: LuckyItemId, count: number): Inventory {
  return {
    ...inventory,
    [itemId]: Math.max(0, inventory[itemId] + count),
  };
}

function pickWeighted<T extends { weight: number }>(entries: T[], random: () => number) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * totalWeight;

  for (const entry of entries) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry;
    }
  }

  return entries[entries.length - 1];
}

function decrease(value: number) {
  return Math.max(0, value - 1);
}
