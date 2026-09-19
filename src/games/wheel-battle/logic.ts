export type GamePhase =
  | 'hangar'
  | 'assembly'
  | 'combat'
  | 'spinning'
  | 'boss-intro'
  | 'defeat'
  | 'settlement';

export type EnemyType = 'scout' | 'gunship' | 'elite';
export type Lane = 'left' | 'mid' | 'right';
export type SectorId =
  | 'repair'
  | 'armor'
  | 'aegis'
  | 'regen'
  | 'rapid'
  | 'spread'
  | 'pierce'
  | 'missile'
  | 'laser'
  | 'cluster'
  | 'overclock'
  | 'purge'
  | 'emp'
  | 'bulkhead'
  | 'time-dilation'
  | 'salvage'
  | 'drone'
  | 'bounty';

export type UpgradableSectorId =
  | 'repair'
  | 'armor'
  | 'aegis'
  | 'rapid'
  | 'spread'
  | 'pierce'
  | 'missile'
  | 'overclock'
  | 'purge'
  | 'time-dilation';

export type UpgradeLevel = 1 | 2 | 3;
export type SectorCategory = 'survive' | 'fire' | 'burst' | 'tempo';
export type BossId = 'iron-beetle' | 'twin-drones' | 'crimson-carrier';
export type PrepTab = 'hangar' | 'assembly';

export type WheelSector = {
  id: SectorId;
  weight: number;
};

export type MetaProgress = {
  coins: number;
  upgrades: Record<UpgradableSectorId, UpgradeLevel>;
  unlockedSectors: SectorId[];
};

export type ActiveEffects = {
  aegisMs: number;
  regenMs: number;
  regenAccMs: number;
  rapidMs: number;
  spreadMs: number;
  pierceShots: number;
  missileRemaining: number;
  missileCooldownMs: number;
  laserMs: number;
  laserAccMs: number;
  overclockMs: number;
  empMs: number;
  bulkheadMs: number;
  bulkheadLane: Lane | null;
  timeDilationMs: number;
  salvageMs: number;
  droneMs: number;
  droneCooldownMs: number;
  bountyTriggered: boolean;
};

export type Vec = { x: number; y: number };

export type Player = {
  position: Vec;
  hp: number;
  armor: number;
  fireCooldownMs: number;
  iFrameMs: number;
  targetId: number | null;
};

export type Enemy = {
  id: number;
  type: EnemyType;
  lane: Lane;
  position: Vec;
  hp: number;
  maxHp: number;
  shield: number;
  fireCooldownMs: number;
  hoverMs: number;
};

export type Telegraph = {
  id: string;
  label: string;
  remainMs: number;
};

export type BossState = {
  id: BossId;
  hp: number;
  maxHp: number;
  phase: number;
  patternTimerMs: number;
  telegraph: Telegraph | null;
  extra: Record<string, number>;
};

export type Bullet = {
  id: number;
  faction: 'player' | 'enemy';
  position: Vec;
  velocity: Vec;
  damage: number;
  pierceLeft: number;
  homing: boolean;
  ignoreShield: boolean;
};

export type Checkpoint = {
  score: number;
  kills: number;
  leaks: number;
  energy: number;
  spinCharges: number;
  bossPhasesCleared: number;
};

export type WheelBattleState = {
  phase: GamePhase;
  levelIndex: number;
  waveIndex: number;
  elapsedMs: number;
  levelElapsedMs: number;
  spawnCooldownMs: number;
  score: number;
  kills: number;
  leaks: number;
  energy: number;
  spinCharges: number;
  maxSpinCharges: 3;
  spinUsed: number;
  paused: boolean;
  spinningMs: number;
  pendingSpinId: SectorId | null;
  nextWave: Telegraph | null;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  boss: BossState | null;
  effects: ActiveEffects;
  wheel: WheelSector[];
  wheelLocked: boolean;
  meta: MetaProgress;
  lastSpinId: SectorId | null;
  lastSpinMessage: string;
  runGold: number;
  goldAwarded: boolean;
  runWon: boolean;
  bossPhasesCleared: number;
  checkpoint: Checkpoint;
  log: string[];
  nextEntityId: number;
};

export type SectorDef = {
  id: SectorId;
  name: string;
  shortName: string;
  category: SectorCategory;
  color: string;
  unlock: string;
  upgradable: boolean;
  description: string;
};

export type SectorPower = {
  heal: number;
  overflowArmor: number;
  armor: number;
  armorCap: number;
  aegisMs: number;
  rapidMs: number;
  fireIntervalMs: number;
  spreadMs: number;
  spreadDamage: number;
  pierceShots: number;
  pierceBonus: number;
  missileCount: number;
  missileDamage: number;
  overclockMs: number;
  overclockDamage: number;
  overclockTaken: number;
  purgeDamage: number;
  timeDilationMs: number;
  timeDilationFactor: number;
};

type WaveConfig = {
  durationMs: number;
  spawnEveryMs: number;
  label: string;
};

const laneX: Record<Lane, number> = { left: 22, mid: 50, right: 78 };
const lanes: Lane[] = ['left', 'mid', 'right'];
const playerX = 50;
const playerY = 86;
const leakY = 92;
const maxHp = 100;
const baseFireInterval = 220;
const playerBulletDamage = 8;
const iFrameMs = 350;
const energyCap = 100;
const spinAnimMs = 1100;
const maxEnemies = 10;
const maxBullets = 80;
const maxLog = 8;
const minSectors = 4;
const maxSectors = 7;
const minWeight = 8;
const maxWeight = 40;

export const starterSectors: SectorId[] = ['repair', 'armor', 'rapid', 'spread'];
export const upgradableSectors: UpgradableSectorId[] = [
  'repair',
  'armor',
  'aegis',
  'rapid',
  'spread',
  'pierce',
  'missile',
  'overclock',
  'purge',
  'time-dilation',
];

export const sectorCatalog: SectorDef[] = [
  { id: 'repair', name: '紧急维修', shortName: '维修', category: 'survive', color: '#22c55e', unlock: '开局', upgradable: true, description: '立刻回复生命，满血时转为护甲。' },
  { id: 'armor', name: '装甲镀层', shortName: '装甲', category: 'survive', color: '#f59e0b', unlock: '开局', upgradable: true, description: '立刻获得护甲，先于生命承受伤害。' },
  { id: 'aegis', name: '相位护盾', shortName: '护盾', category: 'survive', color: '#38bdf8', unlock: '第 1 关 Boss', upgradable: true, description: '短时完全无敌，仍可开火。' },
  { id: 'regen', name: '再生立场', shortName: '再生', category: 'survive', color: '#86efac', unlock: '第 1 关 Boss', upgradable: false, description: '持续回复生命，适合覆盖一整波。' },
  { id: 'rapid', name: '速射强化', shortName: '速射', category: 'fire', color: '#f97316', unlock: '开局', upgradable: true, description: '大幅加快射速。' },
  { id: 'spread', name: '散射弹幕', shortName: '散射', category: 'fire', color: '#fb7185', unlock: '开局', upgradable: true, description: '额外覆盖左右航道。' },
  { id: 'pierce', name: '穿甲弹', shortName: '穿甲', category: 'fire', color: '#a3e635', unlock: '第 1 关 Boss', upgradable: true, description: '子弹穿透，对护盾和 Boss 加成。' },
  { id: 'missile', name: '追踪导弹', shortName: '导弹', category: 'fire', color: '#818cf8', unlock: '第 2 关 Boss', upgradable: true, description: '自动补追踪弹，适合分摊多目标。' },
  { id: 'laser', name: '切割激光', shortName: '激光', category: 'fire', color: '#ef4444', unlock: '第 3 关开场', upgradable: false, description: '持续灼烧锁定目标，无视小护盾。' },
  { id: 'cluster', name: '集束炸弹', shortName: '集束', category: 'burst', color: '#facc15', unlock: '第 2 关 Boss', upgradable: false, description: '在锁定目标处范围爆炸。' },
  { id: 'overclock', name: '过载核心', shortName: '过载', category: 'burst', color: '#e11d48', unlock: '第 2 关开场', upgradable: true, description: '提高伤害，但承伤增加。' },
  { id: 'purge', name: '清屏脉冲', shortName: '清屏', category: 'burst', color: '#c084fc', unlock: '第 2 关 Boss', upgradable: true, description: '清除敌弹并伤害场上敌机。' },
  { id: 'emp', name: 'EMP 干扰', shortName: 'EMP', category: 'burst', color: '#22d3ee', unlock: '第 2 关开场', upgradable: false, description: '炮艇和 Boss 停火，精英护盾关闭。' },
  { id: 'bulkhead', name: '航道闸门', shortName: '闸门', category: 'burst', color: '#94a3b8', unlock: '第 2 关开场', upgradable: false, description: '封锁漏敌最多的航道，越线敌机被弹回。' },
  { id: 'time-dilation', name: '时缓立场', shortName: '时缓', category: 'tempo', color: '#7dd3fc', unlock: '第 3 关开场', upgradable: true, description: '减慢敌机推进和敌弹。' },
  { id: 'salvage', name: '回收协议', shortName: '回收', category: 'tempo', color: '#fde68a', unlock: '第 3 关开场', upgradable: false, description: '击坠能量提高，漏敌不再浪费能量节奏。' },
  { id: 'drone', name: '护航无人机', shortName: '无人机', category: 'tempo', color: '#2dd4bf', unlock: '第 2 关 Boss', upgradable: false, description: '左右航道部署自动炮台。' },
  { id: 'bounty', name: '打捞协议', shortName: '打捞', category: 'tempo', color: '#fbbf24', unlock: '第 3 关开场', upgradable: false, description: '本局结算金币提高，并立刻获得能量。' },
];

export const levels = [
  { id: 1, name: '流星航线', bossId: 'iron-beetle' as BossId, bossName: '铁甲甲虫', description: '学会攒次数，在波次到来前转动。' },
  { id: 2, name: '裂空峡谷', bossId: 'twin-drones' as BossId, bossName: '双子无人机', description: '三路同时推进，把次数留到双目标阶段。' },
  { id: 3, name: '赤红母舰', bossId: 'crimson-carrier' as BossId, bossName: '赤红母舰', description: '看预报窗口再转，护盾和激光都有对策。' },
];

const wavePlans: WaveConfig[][] = [
  [
    { durationMs: 22000, spawnEveryMs: 2800, label: '中路侦察机' },
    { durationMs: 34000, spawnEveryMs: 2200, label: '混编推进' },
    { durationMs: 36000, spawnEveryMs: 1800, label: '三路压迫' },
  ],
  [
    { durationMs: 16000, spawnEveryMs: 1700, label: '左右夹击' },
    { durationMs: 28000, spawnEveryMs: 1400, label: '炮艇群' },
    { durationMs: 30000, spawnEveryMs: 1250, label: '精英压迫' },
  ],
  [
    { durationMs: 14000, spawnEveryMs: 1800, label: '精锐试探' },
    { durationMs: 24000, spawnEveryMs: 1500, label: '护盾编队' },
    { durationMs: 26000, spawnEveryMs: 1300, label: '母舰前哨' },
  ],
];

const bossUnlocks: Record<BossId, SectorId[]> = {
  'iron-beetle': ['aegis', 'pierce', 'regen'],
  'twin-drones': ['missile', 'purge', 'cluster', 'drone'],
  'crimson-carrier': [],
};

const levelPrepUnlocks: SectorId[][] = [
  [],
  ['overclock', 'bulkhead', 'emp'],
  ['time-dilation', 'salvage', 'laser', 'bounty'],
];

const categoryLabels: Record<SectorCategory, string> = {
  survive: '生存',
  fire: '火力',
  burst: '爆发',
  tempo: '节奏',
};

export function getCategoryLabel(category: SectorCategory) {
  return categoryLabels[category];
}

export function createDefaultMeta(): MetaProgress {
  return {
    coins: 0,
    upgrades: {
      repair: 1,
      armor: 1,
      aegis: 1,
      rapid: 1,
      spread: 1,
      pierce: 1,
      missile: 1,
      overclock: 1,
      purge: 1,
      'time-dilation': 1,
    },
    unlockedSectors: [...starterSectors],
  };
}

export function normalizeMeta(raw: Partial<MetaProgress> | null | undefined): MetaProgress {
  const fallback = createDefaultMeta();
  const upgrades = { ...fallback.upgrades, ...raw?.upgrades };
  (Object.keys(upgrades) as UpgradableSectorId[]).forEach((id) => {
    const level = Number(upgrades[id]);
    upgrades[id] = level >= 3 ? 3 : level >= 2 ? 2 : 1;
  });

  const unlocked = Array.from(
    new Set([...(raw?.unlockedSectors ?? []), ...starterSectors].filter((id) => sectorCatalog.some((item) => item.id === id))),
  );

  return {
    coins: Math.max(0, Math.round(raw?.coins ?? 0)),
    upgrades,
    unlockedSectors: unlocked,
  };
}

export function createDefaultWheel(): WheelSector[] {
  return [
    { id: 'repair', weight: 28 },
    { id: 'armor', weight: 24 },
    { id: 'rapid', weight: 22 },
    { id: 'spread', weight: 26 },
  ];
}

export function createEmptyEffects(): ActiveEffects {
  return {
    aegisMs: 0,
    regenMs: 0,
    regenAccMs: 0,
    rapidMs: 0,
    spreadMs: 0,
    pierceShots: 0,
    missileRemaining: 0,
    missileCooldownMs: 0,
    laserMs: 0,
    laserAccMs: 0,
    overclockMs: 0,
    empMs: 0,
    bulkheadMs: 0,
    bulkheadLane: null,
    timeDilationMs: 0,
    salvageMs: 0,
    droneMs: 0,
    droneCooldownMs: 0,
    bountyTriggered: false,
  };
}

export function createInitialState(meta: MetaProgress): WheelBattleState {
  const normalized = normalizeMeta(meta);
  return {
    phase: 'hangar',
    levelIndex: 0,
    waveIndex: 0,
    elapsedMs: 0,
    levelElapsedMs: 0,
    spawnCooldownMs: 700,
    score: 0,
    kills: 0,
    leaks: 0,
    energy: 0,
    spinCharges: 0,
    maxSpinCharges: 3,
    spinUsed: 0,
    paused: false,
    spinningMs: 0,
    pendingSpinId: null,
    nextWave: { id: 'wave-0', label: wavePlans[0][0].label, remainMs: 0 },
    player: createPlayer(),
    enemies: [],
    bullets: [],
    boss: null,
    effects: createEmptyEffects(),
    wheel: createDefaultWheel(),
    wheelLocked: false,
    meta: normalized,
    lastSpinId: null,
    lastSpinMessage: '在机库升级效果，或到组装页配置转盘。',
    runGold: 0,
    goldAwarded: false,
    runWon: false,
    bossPhasesCleared: 0,
    checkpoint: createCheckpoint(0, 0, 0, 0, 0, 0),
    log: ['进入机库。补给金币只在整局结束后发放。'],
    nextEntityId: 1,
  };
}

export function getSector(id: SectorId) {
  return sectorCatalog.find((item) => item.id === id) ?? sectorCatalog[0];
}

export function isUpgradable(id: SectorId): id is UpgradableSectorId {
  return upgradableSectors.includes(id as UpgradableSectorId);
}

export function getUpgradeLevel(meta: MetaProgress, id: SectorId): UpgradeLevel {
  if (!isUpgradable(id)) {
    return 1;
  }

  return meta.upgrades[id];
}

export function getSectorPower(id: SectorId, level: UpgradeLevel): SectorPower {
  const power: SectorPower = {
    heal: 22,
    overflowArmor: 10,
    armor: 28,
    armorCap: 80,
    aegisMs: 1800,
    rapidMs: 6500,
    fireIntervalMs: 110,
    spreadMs: 7000,
    spreadDamage: 6,
    pierceShots: 8,
    pierceBonus: 0.35,
    missileCount: 5,
    missileDamage: 16,
    overclockMs: 5500,
    overclockDamage: 1.45,
    overclockTaken: 1.2,
    purgeDamage: 24,
    timeDilationMs: 3200,
    timeDilationFactor: 0.45,
  };

  if (id === 'repair') {
    if (level >= 2) {
      power.heal = 30;
      power.overflowArmor = 14;
    }
    if (level >= 3) {
      power.heal = 40;
      power.overflowArmor = 18;
    }
  }

  if (id === 'armor') {
    if (level >= 2) {
      power.armor = 38;
      power.armorCap = 90;
    }
    if (level >= 3) {
      power.armor = 50;
      power.armorCap = 100;
    }
  }

  if (id === 'aegis') {
    power.aegisMs = level === 3 ? 3000 : level === 2 ? 2300 : 1800;
  }

  if (id === 'rapid') {
    if (level >= 2) {
      power.fireIntervalMs = 100;
      power.rapidMs = 8000;
    }
    if (level >= 3) {
      power.fireIntervalMs = 90;
      power.rapidMs = 10000;
    }
  }

  if (id === 'spread') {
    if (level >= 2) {
      power.spreadDamage = 8;
      power.spreadMs = 8500;
    }
    if (level >= 3) {
      power.spreadDamage = 10;
      power.spreadMs = 10000;
    }
  }

  if (id === 'pierce') {
    if (level >= 2) {
      power.pierceShots = 11;
      power.pierceBonus = 0.45;
    }
    if (level >= 3) {
      power.pierceShots = 14;
      power.pierceBonus = 0.55;
    }
  }

  if (id === 'missile') {
    if (level >= 2) {
      power.missileCount = 7;
      power.missileDamage = 20;
    }
    if (level >= 3) {
      power.missileCount = 9;
      power.missileDamage = 24;
    }
  }

  if (id === 'overclock') {
    if (level >= 2) {
      power.overclockDamage = 1.6;
      power.overclockTaken = 1.15;
    }
    if (level >= 3) {
      power.overclockDamage = 1.8;
      power.overclockTaken = 1.1;
    }
  }

  if (id === 'purge') {
    power.purgeDamage = level === 3 ? 48 : level === 2 ? 34 : 24;
  }

  if (id === 'time-dilation') {
    if (level >= 2) {
      power.timeDilationMs = 4000;
      power.timeDilationFactor = 0.38;
    }
    if (level >= 3) {
      power.timeDilationMs = 5000;
      power.timeDilationFactor = 0.32;
    }
  }

  return power;
}

export function getArmorCap(meta: MetaProgress) {
  return getSectorPower('armor', getUpgradeLevel(meta, 'armor')).armorCap;
}

export function upgradeCost(currentLevel: UpgradeLevel) {
  if (currentLevel === 1) {
    return 60;
  }

  if (currentLevel === 2) {
    return 120;
  }

  return null;
}

export function canUpgrade(meta: MetaProgress, id: SectorId) {
  if (!isUpgradable(id) || !meta.unlockedSectors.includes(id)) {
    return false;
  }

  const cost = upgradeCost(meta.upgrades[id]);
  return cost !== null && meta.coins >= cost;
}

export function upgradeSector(meta: MetaProgress, id: SectorId): MetaProgress {
  if (!canUpgrade(meta, id) || !isUpgradable(id)) {
    return meta;
  }

  const cost = upgradeCost(meta.upgrades[id]);
  if (cost === null) {
    return meta;
  }

  const nextLevel = (meta.upgrades[id] + 1) as UpgradeLevel;
  return {
    ...meta,
    coins: meta.coins - cost,
    upgrades: { ...meta.upgrades, [id]: nextLevel },
  };
}

export function unlockSectors(meta: MetaProgress, ids: SectorId[]): MetaProgress {
  return {
    ...meta,
    unlockedSectors: Array.from(new Set([...meta.unlockedSectors, ...ids])),
  };
}

export function normalizeWheel(sectors: WheelSector[]) {
  const unique: WheelSector[] = [];
  for (const sector of sectors) {
    if (!unique.some((item) => item.id === sector.id)) {
      unique.push({ id: sector.id, weight: clamp(Math.round(sector.weight), minWeight, maxWeight) });
    }
  }

  const limited = unique.slice(0, maxSectors);
  while (limited.length < minSectors) {
    const missing = starterSectors.find((id) => !limited.some((item) => item.id === id));
    limited.push({ id: missing ?? 'repair', weight: minWeight });
  }

  return redistribute(limited, limited[0].id, limited[0].weight);
}

export function addSector(sectors: WheelSector[], id: SectorId) {
  if (sectors.some((item) => item.id === id) || sectors.length >= maxSectors) {
    return sectors;
  }

  return normalizeWheel([...sectors, { id, weight: minWeight }]);
}

export function removeSector(sectors: WheelSector[], id: SectorId) {
  if (sectors.length <= minSectors || !sectors.some((item) => item.id === id)) {
    return sectors;
  }

  return normalizeWheel(sectors.filter((item) => item.id !== id));
}

export function resizeSector(sectors: WheelSector[], id: SectorId, nextWeight: number) {
  return redistribute(sectors, id, nextWeight);
}

export function equalizeWheel(sectors: WheelSector[]) {
  const base = Math.floor(100 / sectors.length);
  const remainder = 100 - base * sectors.length;
  return sectors.map((sector, index) => ({
    ...sector,
    weight: base + (index < remainder ? 1 : 0),
  }));
}

export function recommendedWheel(unlocked: SectorId[]) {
  const preferred: SectorId[] = ['repair', 'armor', 'rapid', 'spread', 'pierce', 'aegis', 'missile'];
  const picked = preferred.filter((id) => unlocked.includes(id)).slice(0, 4);
  while (picked.length < minSectors) {
    const extra = unlocked.find((id) => !picked.includes(id));
    if (!extra) {
      break;
    }
    picked.push(extra);
  }

  return equalizeWheel(picked.map((id) => ({ id, weight: 25 })));
}

export function buildWheelGradient(sectors: WheelSector[]) {
  const total = sectors.reduce((sum, sector) => sum + sector.weight, 0);
  let current = 0;

  return `conic-gradient(${sectors
    .map((sector) => {
      const start = (current / total) * 360;
      current += sector.weight;
      const end = (current / total) * 360;
      return `${getSector(sector.id).color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
    })
    .join(', ')})`;
}

export function getSegmentCenterAngle(sectors: WheelSector[], id: SectorId) {
  const total = sectors.reduce((sum, sector) => sum + sector.weight, 0);
  let current = 0;

  for (const sector of sectors) {
    const start = (current / total) * 360;
    current += sector.weight;
    const end = (current / total) * 360;
    if (sector.id === id) {
      return (start + end) / 2;
    }
  }

  return 0;
}

export function lockWheelAndStartLevel(state: WheelBattleState, levelIndex: number): WheelBattleState {
  const nextMeta = unlockSectors(state.meta, levelPrepUnlocks[levelIndex] ?? []);
  const next: WheelBattleState = {
    ...state,
    phase: 'combat',
    levelIndex,
    waveIndex: 0,
    levelElapsedMs: 0,
    spawnCooldownMs: 500,
    paused: false,
    spinningMs: 0,
    pendingSpinId: null,
    wheelLocked: true,
    meta: nextMeta,
    enemies: [],
    bullets: [],
    boss: null,
    effects: {
      ...createEmptyEffects(),
      bountyTriggered: state.effects.bountyTriggered,
    },
    player: createPlayer(),
    nextWave: {
      id: `wave-${levelIndex}-0`,
      label: `${levels[levelIndex].name} · ${wavePlans[levelIndex][0].label}`,
      remainMs: 900,
    },
  };
  next.checkpoint = createCheckpoint(next.score, next.kills, next.leaks, next.energy, next.spinCharges, next.bossPhasesCleared);
  return appendLog(next, `进入第 ${levelIndex + 1} 关「${levels[levelIndex].name}」，转盘已锁定。`);
}

export function retryLevel(state: WheelBattleState) {
  const restored: WheelBattleState = {
    ...state,
    phase: 'assembly',
    wheelLocked: false,
    paused: false,
    spinningMs: 0,
    pendingSpinId: null,
    score: state.checkpoint.score,
    kills: state.checkpoint.kills,
    leaks: state.checkpoint.leaks,
    energy: state.checkpoint.energy,
    spinCharges: state.checkpoint.spinCharges,
    bossPhasesCleared: state.checkpoint.bossPhasesCleared,
    enemies: [],
    bullets: [],
    boss: null,
    effects: {
      ...createEmptyEffects(),
      bountyTriggered: state.effects.bountyTriggered,
    },
    player: createPlayer(),
    goldAwarded: false,
  };

  return appendLog(restored, `第 ${state.levelIndex + 1} 关重开，本局金币尚未结算。`);
}

export function canSpin(state: WheelBattleState) {
  return (
    (state.phase === 'combat' || state.phase === 'spinning' || state.phase === 'boss-intro') &&
    !state.paused &&
    state.spinningMs <= 0 &&
    state.spinCharges >= 1 &&
    state.wheel.length > 0
  );
}

export function beginSpin(state: WheelBattleState, random = Math.random): WheelBattleState {
  if (!canSpin(state)) {
    return state;
  }

  const selected = pickWeighted(state.wheel, random);
  return {
    ...state,
    spinCharges: state.spinCharges - 1,
    spinUsed: state.spinUsed + 1,
    spinningMs: spinAnimMs,
    pendingSpinId: selected.id,
    lastSpinId: selected.id,
    player: {
      ...state.player,
      iFrameMs: Math.max(state.player.iFrameMs, 500),
    },
  };
}

export function tick(state: WheelBattleState, dtMs: number): WheelBattleState {
  if (state.paused) {
    return state;
  }

  if (state.phase !== 'combat' && state.phase !== 'spinning' && state.phase !== 'boss-intro') {
    return state;
  }

  let next: WheelBattleState = {
    ...state,
    elapsedMs: state.elapsedMs + dtMs,
    levelElapsedMs: state.levelElapsedMs + dtMs,
    player: { ...state.player, position: { ...state.player.position } },
    effects: { ...state.effects },
    enemies: state.enemies.map((enemy) => ({ ...enemy, position: { ...enemy.position } })),
    bullets: state.bullets.map((bullet) => ({
      ...bullet,
      position: { ...bullet.position },
      velocity: { ...bullet.velocity },
    })),
    boss: state.boss ? { ...state.boss, extra: { ...state.boss.extra }, telegraph: state.boss.telegraph ? { ...state.boss.telegraph } : null } : null,
    nextWave: state.nextWave ? { ...state.nextWave } : null,
  };

  if (next.spinningMs > 0) {
    next.spinningMs = Math.max(0, next.spinningMs - dtMs);
    if (next.spinningMs === 0 && next.pendingSpinId) {
      next = applySectorEffect(next, next.pendingSpinId);
      next.pendingSpinId = null;
    }
  }

  next = tickEffects(next, dtMs);
  next.player.iFrameMs = Math.max(0, next.player.iFrameMs - dtMs);
  next.player.fireCooldownMs = Math.max(0, next.player.fireCooldownMs - dtMs);

  next = tickWaves(next, dtMs);
  next = tickEnemies(next, dtMs);
  next = tickBoss(next, dtMs);
  next = autoTarget(next);
  next = autoFire(next, dtMs);
  next = tickDrones(next, dtMs);
  next = tickMissiles(next, dtMs);
  next = tickLaser(next, dtMs);
  next = tickBullets(next, dtMs);
  next = resolveCollisions(next);
  next = resolveLeaks(next);
  return checkOutcome(next);
}

export function applySectorEffect(state: WheelBattleState, id: SectorId): WheelBattleState {
  const next = { ...state, effects: { ...state.effects }, player: { ...state.player } };
  const power = getSectorPower(id, getUpgradeLevel(state.meta, id));
  const cap = getArmorCap(state.meta);
  let message = `转盘停在「${getSector(id).name}」。`;

  if (id === 'repair') {
    if (next.player.hp >= maxHp) {
      next.player.armor = Math.min(cap, next.player.armor + power.overflowArmor);
      message += `满血，转为护甲 +${power.overflowArmor}。`;
    } else {
      const healed = Math.min(power.heal, maxHp - next.player.hp);
      next.player.hp += healed;
      message += `回复 ${healed} 生命。`;
    }
  } else if (id === 'armor') {
    next.player.armor = Math.min(cap, next.player.armor + power.armor);
    message += `护甲 +${power.armor}。`;
  } else if (id === 'aegis') {
    next.effects.aegisMs = power.aegisMs;
    message += `无敌 ${formatSeconds(power.aegisMs)}。`;
  } else if (id === 'regen') {
    next.effects.regenMs = 3000;
    next.effects.regenAccMs = 0;
    message += '再生立场展开。';
  } else if (id === 'rapid') {
    next.effects.rapidMs = keepFireCap(next.effects, 'rapidMs', power.rapidMs);
    message += `射速提升 ${formatSeconds(power.rapidMs)}。`;
  } else if (id === 'spread') {
    next.effects.spreadMs = keepFireCap(next.effects, 'spreadMs', power.spreadMs);
    message += `散射覆盖左右航道 ${formatSeconds(power.spreadMs)}。`;
  } else if (id === 'pierce') {
    next.effects.pierceShots = power.pierceShots;
    message += `穿甲弹 ${power.pierceShots} 发。`;
  } else if (id === 'missile') {
    next.effects.missileRemaining = power.missileCount;
    next.effects.missileCooldownMs = 200;
    message += `追踪导弹 ${power.missileCount} 枚。`;
  } else if (id === 'laser') {
    next.effects.laserMs = keepFireCap(next.effects, 'laserMs', 4000);
    next.effects.laserAccMs = 0;
    message += '切割激光启动。';
  } else if (id === 'cluster') {
    const target = getTargetPosition(next);
    const { state: exploded, hits } = explodeAt(next, target, 18, 36);
    Object.assign(next, exploded);
    message += `集束爆炸，命中 ${hits} 个目标。`;
  } else if (id === 'overclock') {
    next.effects.overclockMs = keepFireCap(next.effects, 'overclockMs', power.overclockMs);
    message += `伤害 ×${power.overclockDamage.toFixed(2)}，承伤提高。`;
  } else if (id === 'purge') {
    const remainingEnemies = next.enemies.map((enemy) => ({ ...enemy, hp: enemy.hp - power.purgeDamage }));
    next.enemies = remainingEnemies.filter((enemy) => enemy.hp > 0);
    const killed = remainingEnemies.length - next.enemies.length;
    if (killed > 0) {
      for (let index = 0; index < killed; index += 1) {
        grantEnergy(next, 16);
        next.kills += 1;
        next.score += 40;
      }
    }
    if (next.boss && next.boss.hp > 0) {
      damageBoss(next, power.purgeDamage, false);
    }
    next.bullets = next.bullets.filter((bullet) => bullet.faction === 'player');
    message += '清屏脉冲扫过战场。';
  } else if (id === 'emp') {
    next.effects.empMs = 2400;
    next.enemies = next.enemies.map((enemy) => ({ ...enemy, shield: 0 }));
    message += 'EMP 干扰：敌方停火。';
  } else if (id === 'bulkhead') {
    next.effects.bulkheadMs = 5000;
    next.effects.bulkheadLane = pickLeakiestLane(next);
    message += `闸门封锁${laneLabel(next.effects.bulkheadLane)}航道。`;
  } else if (id === 'time-dilation') {
    next.effects.timeDilationMs = power.timeDilationMs;
    message += `时缓 ${formatSeconds(power.timeDilationMs)}。`;
  } else if (id === 'salvage') {
    next.effects.salvageMs = 6000;
    message += '回收协议：击坠能量提高。';
  } else if (id === 'drone') {
    next.effects.droneMs = 8000;
    next.effects.droneCooldownMs = 0;
    message += '护航无人机就位。';
  } else if (id === 'bounty') {
    if (!next.effects.bountyTriggered) {
      next.effects.bountyTriggered = true;
      message += '打捞协议生效，本局金币 +18%。';
    } else {
      message += '打捞协议已生效，改为补充能量。';
    }
    grantEnergy(next, 12);
  }

  next.lastSpinMessage = message;
  return appendLog(next, message);
}

export function settleRun(state: WheelBattleState, won: boolean): WheelBattleState {
  if (state.goldAwarded) {
    return { ...state, phase: 'settlement', runWon: won };
  }

  const leftoverScore = state.player.hp * 2 + state.spinCharges * 80;
  const gold = computeRunGold(state, won);
  const nextMeta: MetaProgress = {
    ...state.meta,
    coins: state.meta.coins + gold,
  };

  return appendLog(
    {
      ...state,
      phase: 'settlement',
      runWon: won,
      score: state.score + leftoverScore,
      runGold: gold,
      goldAwarded: true,
      paused: true,
      wheelLocked: false,
      meta: nextMeta,
    },
    won ? `通关结算：补给金币 +${gold}。` : `失败结算：补给金币 +${gold}。`,
  );
}

export function computeRunGold(state: WheelBattleState, won: boolean) {
  let gold = 40;
  gold += Math.floor(state.kills * 0.4);
  gold += state.bossPhasesCleared * 25;
  gold += Math.floor(state.player.hp * 0.4);
  gold += state.spinCharges * 8;
  gold += won ? 80 : 0;
  gold -= state.leaks * 2;
  if (state.effects.bountyTriggered) {
    gold = Math.round(gold * 1.18);
  }
  return Math.max(25, gold);
}

export function formatSeconds(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function laneLabel(lane: Lane | null) {
  if (lane === 'left') {
    return '左';
  }
  if (lane === 'right') {
    return '右';
  }
  return '中';
}

function createPlayer(): Player {
  return {
    position: { x: playerX, y: playerY },
    hp: maxHp,
    armor: 0,
    fireCooldownMs: 0,
    iFrameMs: 0,
    targetId: null,
  };
}

function createCheckpoint(
  score: number,
  kills: number,
  leaks: number,
  energy: number,
  spinCharges: number,
  bossPhasesCleared: number,
): Checkpoint {
  return { score, kills, leaks, energy, spinCharges, bossPhasesCleared };
}

function redistribute(sectors: WheelSector[], id: SectorId, nextWeight: number) {
  const current = sectors.find((sector) => sector.id === id);
  if (!current) {
    return sectors;
  }

  const clamped = clamp(Math.round(nextWeight), minWeight, maxWeight);
  const others = sectors.filter((sector) => sector.id !== id);
  const remaining = 100 - clamped;
  const minOthers = others.length * minWeight;
  const maxOthers = others.length * maxWeight;
  const usable = clamp(remaining, minOthers, maxOthers);
  const selfWeight = 100 - usable;
  const otherSum = others.reduce((sum, sector) => sum + sector.weight, 0) || others.length;

  const next = sectors.map((sector) => {
    if (sector.id === id) {
      return { ...sector, weight: selfWeight };
    }

    const ratio = sector.weight / otherSum;
    return { ...sector, weight: clamp(Math.round(usable * ratio), minWeight, maxWeight) };
  });

  const drift = 100 - next.reduce((sum, sector) => sum + sector.weight, 0);
  if (drift !== 0) {
    const adjustable = next.find((sector) => sector.id !== id) ?? next[0];
    adjustable.weight = clamp(adjustable.weight + drift, minWeight, maxWeight);
  }

  return next;
}

function pickWeighted(sectors: WheelSector[], random: () => number) {
  const total = sectors.reduce((sum, sector) => sum + sector.weight, 0);
  let roll = random() * total;
  for (const sector of sectors) {
    roll -= sector.weight;
    if (roll <= 0) {
      return sector;
    }
  }
  return sectors[sectors.length - 1];
}

function keepFireCap(effects: ActiveEffects, key: keyof ActiveEffects, duration: number) {
  const fireKeys: Array<keyof ActiveEffects> = ['rapidMs', 'spreadMs', 'laserMs', 'overclockMs'];
  const active = fireKeys.filter((item) => Number(effects[item]) > 0 || item === key);
  if (active.length > 3) {
    const dropping = fireKeys
      .filter((item) => item !== key)
      .sort((left, right) => Number(effects[left]) - Number(effects[right]))[0];
    if (dropping) {
      (effects[dropping] as number) = 0;
    }
  }
  return duration;
}

function tickEffects(state: WheelBattleState, dtMs: number) {
  const effects = state.effects;
  effects.aegisMs = Math.max(0, effects.aegisMs - dtMs);
  effects.rapidMs = Math.max(0, effects.rapidMs - dtMs);
  effects.spreadMs = Math.max(0, effects.spreadMs - dtMs);
  effects.laserMs = Math.max(0, effects.laserMs - dtMs);
  effects.overclockMs = Math.max(0, effects.overclockMs - dtMs);
  effects.empMs = Math.max(0, effects.empMs - dtMs);
  effects.bulkheadMs = Math.max(0, effects.bulkheadMs - dtMs);
  effects.timeDilationMs = Math.max(0, effects.timeDilationMs - dtMs);
  effects.salvageMs = Math.max(0, effects.salvageMs - dtMs);
  effects.droneMs = Math.max(0, effects.droneMs - dtMs);

  if (effects.bulkheadMs === 0) {
    effects.bulkheadLane = null;
  }

  if (effects.regenMs > 0) {
    effects.regenMs = Math.max(0, effects.regenMs - dtMs);
    effects.regenAccMs += dtMs;
    while (effects.regenAccMs >= 500 && state.player.hp < maxHp) {
      effects.regenAccMs -= 500;
      state.player.hp = Math.min(maxHp, state.player.hp + 3);
    }
  }

  return state;
}

function tickWaves(state: WheelBattleState, dtMs: number) {
  const plan = wavePlans[state.levelIndex];
  const waveEnds = plan.reduce<number[]>((ends, wave, index) => {
    const previous = index === 0 ? 0 : ends[index - 1];
    ends.push(previous + wave.durationMs);
    return ends;
  }, []);

  if (state.boss) {
    return state;
  }

  if (state.waveIndex >= plan.length || state.levelElapsedMs >= waveEnds[plan.length - 1]) {
    state.waveIndex = plan.length;
    if (!state.nextWave || state.nextWave.id !== 'boss') {
      state.enemies = [];
      state.bullets = state.bullets.filter((bullet) => bullet.faction === 'player');
      state.nextWave = {
        id: 'boss',
        label: `${levels[state.levelIndex].bossName}即将抵达`,
        remainMs: 1200,
      };
      return appendLog(state, `${levels[state.levelIndex].bossName}即将抵达，预留转动窗口。`);
    }

    state.nextWave.remainMs = Math.max(0, state.nextWave.remainMs - dtMs);
    if (state.nextWave.remainMs <= 0 && !state.boss) {
      state.boss = createBoss(levels[state.levelIndex].bossId);
      state.nextWave = { id: 'boss-fight', label: `${levels[state.levelIndex].bossName}交战中`, remainMs: 0 };
      return appendLog(state, `${levels[state.levelIndex].bossName}进入战场。`);
    }
    return state;
  }

  const currentWave = Math.max(
    0,
    plan.findIndex((_, index) => state.levelElapsedMs < waveEnds[index]),
  );

  if (currentWave !== state.waveIndex) {
    state.waveIndex = currentWave;
    state.nextWave = {
      id: `wave-${state.levelIndex}-${currentWave}`,
      label: plan[currentWave].label,
      remainMs: 900,
    };
  } else if (state.nextWave && state.nextWave.id !== 'boss' && state.nextWave.id !== 'boss-fight') {
    state.nextWave.remainMs = Math.max(0, state.nextWave.remainMs - dtMs);
  }

  state.spawnCooldownMs -= dtMs;
  if (state.spawnCooldownMs <= 0 && state.enemies.length < maxEnemies) {
    spawnEnemy(state);
    state.spawnCooldownMs = plan[currentWave].spawnEveryMs;
  }

  return state;
}

function spawnEnemy(state: WheelBattleState) {
  const wave = state.waveIndex;
  const level = state.levelIndex;
  let type: EnemyType;
  let lane: Lane;

  if (level === 0 && state.levelElapsedMs < 40000) {
    type = 'scout';
    lane = 'mid';
  } else if (wave === 0) {
    type = Math.random() < 0.12 + level * 0.08 ? 'gunship' : 'scout';
    lane = level === 0 ? 'mid' : pickLane();
  } else if (wave === 1) {
    type = Math.random() < 0.08 + level * 0.08 ? 'gunship' : 'scout';
    lane = pickLane();
  } else {
    const roll = Math.random();
    type = roll < 0.12 ? 'elite' : roll < 0.45 + level * 0.08 ? 'gunship' : 'scout';
    lane = pickLane();
  }

  const stats = enemyStats(type);
  state.enemies.push({
    id: state.nextEntityId,
    type,
    lane,
    position: { x: laneX[lane], y: -4 },
    hp: stats.hp,
    maxHp: stats.hp,
    shield: type === 'elite' ? 24 : 0,
    fireCooldownMs: (state.levelIndex === 0 ? 900 : 400) + Math.random() * 600,
    hoverMs: 0,
  });
  state.nextEntityId += 1;
}

function tickEnemies(state: WheelBattleState, dtMs: number) {
  const slow = timeScale(state);
  for (const enemy of state.enemies) {
    const speed = (enemy.type === 'scout' ? (state.levelIndex === 0 ? 0.012 : 0.018) : enemy.type === 'gunship' ? 0.013 : 0.011);
    if (enemy.type === 'gunship' && enemy.position.y >= 26 && enemy.hoverMs < 3200) {
      enemy.hoverMs += dtMs;
      enemy.position.x += Math.sin(state.elapsedMs / 220) * 0.012 * (enemy.lane === 'right' ? -1 : 1);
    } else {
      enemy.position.y += speed * dtMs * slow;
    }

    if (enemy.type === 'elite') {
      enemy.position.x = laneX[enemy.lane] + Math.sin(state.elapsedMs / 260 + enemy.id) * 3.2;
    }

    enemy.fireCooldownMs -= dtMs;
    if (enemy.fireCooldownMs <= 0 && state.effects.empMs <= 0) {
      fireEnemy(state, enemy);
    enemy.fireCooldownMs = enemy.type === 'scout'
      ? state.levelIndex === 0 ? 2600 : 1700
      : enemy.type === 'gunship'
        ? state.levelIndex === 0 ? 1400 : 900
        : 1400;
    }
  }
  return state;
}

function fireEnemy(state: WheelBattleState, enemy: Enemy) {
  if (state.bullets.length >= maxBullets) {
    return;
  }

  const toPlayer = normalize({ x: playerX - enemy.position.x, y: playerY - enemy.position.y });
  const speed = (state.levelIndex === 0 ? 0.02 : 0.028) * timeScale(state);
  const damage = enemy.type === 'scout' ? 8 : enemy.type === 'gunship' ? 10 : 12;
  const spread = state.levelIndex === 0 ? (Math.random() - 0.5) * 0.28 : 0;

  if (enemy.type === 'elite') {
    for (const angle of [-0.4, -0.2, 0, 0.2, 0.4]) {
      pushBullet(state, {
        faction: 'enemy',
        position: { ...enemy.position },
        velocity: rotate(toPlayer, angle, speed),
        damage,
        pierceLeft: 0,
        homing: false,
        ignoreShield: false,
      });
    }
    return;
  }

  pushBullet(state, {
    faction: 'enemy',
    position: { ...enemy.position },
    velocity: rotate(toPlayer, spread, speed),
    damage,
    pierceLeft: 0,
    homing: false,
    ignoreShield: false,
  });
}

function tickBoss(state: WheelBattleState, dtMs: number) {
  if (!state.boss || state.boss.hp <= 0) {
    return state;
  }

  const boss = state.boss;
  boss.patternTimerMs += dtMs;
  if (boss.telegraph) {
    boss.telegraph.remainMs = Math.max(0, boss.telegraph.remainMs - dtMs);
  }

  if (boss.id === 'iron-beetle') {
    tickIronBeetle(state, dtMs);
  } else if (boss.id === 'twin-drones') {
    tickTwinDrones(state, dtMs);
  } else {
    tickCrimson(state, dtMs);
  }

  return state;
}

function createBoss(id: BossId): BossState {
  if (id === 'iron-beetle') {
    return { id, hp: 720, maxHp: 720, phase: 1, patternTimerMs: 0, telegraph: null, extra: { x: 50, y: 16 } };
  }
  if (id === 'twin-drones') {
    return {
      id,
      hp: 840,
      maxHp: 840,
      phase: 1,
      patternTimerMs: 0,
      telegraph: null,
      extra: { leftHp: 420, rightHp: 420, leftX: 22, leftY: 18, rightX: 78, rightY: 18 },
    };
  }
  return { id, hp: 1600, maxHp: 1600, phase: 1, patternTimerMs: 0, telegraph: null, extra: { x: 50, y: 14, summoned: 0 } };
}

function tickIronBeetle(state: WheelBattleState, _dtMs: number) {
  const boss = state.boss;
  if (!boss) {
    return;
  }

  const nextPhase = boss.hp / boss.maxHp <= 0.55 ? 2 : 1;
  if (nextPhase !== boss.phase) {
    boss.phase = nextPhase;
    state.bossPhasesCleared += 1;
    state.score += 400;
    boss.telegraph = { id: 'rain', label: '弹雨将至', remainMs: 1500 };
    appendLog(state, '铁甲甲虫进入弹雨阶段。');
  }

  boss.extra.x = 50 + Math.sin(state.elapsedMs / 700) * 8;

  if (state.effects.empMs > 0) {
    return;
  }

  if (boss.phase === 1 && boss.patternTimerMs >= 800) {
    boss.patternTimerMs = 0;
    fireBossVolley(state, { x: boss.extra.x, y: boss.extra.y }, 3, 0.16, 14);
  }

  if (boss.phase === 2 && boss.telegraph && boss.telegraph.remainMs === 0) {
    for (let index = 0; index < 6; index += 1) {
      pushBullet(state, {
        faction: 'enemy',
        position: { x: 18 + index * 13, y: 8 },
        velocity: { x: 0, y: 0.032 * timeScale(state) },
        damage: 14,
        pierceLeft: 0,
        homing: false,
        ignoreShield: false,
      });
    }
    boss.telegraph = { id: 'rain', label: '弹雨将至', remainMs: 2800 };
  }
}

function tickTwinDrones(state: WheelBattleState, dtMs: number) {
  const boss = state.boss;
  if (!boss) {
    return;
  }

  const leftAlive = boss.extra.leftHp > 0;
  const rightAlive = boss.extra.rightHp > 0;
  const enraged = Number(leftAlive) + Number(rightAlive) === 1;
  if (enraged && boss.phase === 1) {
    boss.phase = 2;
    state.bossPhasesCleared += 1;
    state.score += 400;
    appendLog(state, '残机进入狂暴。');
  }

  if (enraged) {
    if (leftAlive) {
      boss.extra.leftY = Math.min(36, boss.extra.leftY + 0.006 * dtMs);
    }
    if (rightAlive) {
      boss.extra.rightY = Math.min(36, boss.extra.rightY + 0.006 * dtMs);
    }
  }

  if (state.effects.empMs > 0) {
    return;
  }

  const interval = enraged ? 600 : 1000;
  if (boss.patternTimerMs >= interval) {
    boss.patternTimerMs = 0;
    if (leftAlive) {
      fireBossVolley(state, { x: boss.extra.leftX, y: boss.extra.leftY }, 4, 0.22, 14);
    }
    if (rightAlive) {
      const toPlayer = normalize({ x: playerX - boss.extra.rightX, y: playerY - boss.extra.rightY });
      const speed = 0.03 * timeScale(state);
      pushBullet(state, {
        faction: 'enemy',
        position: { x: boss.extra.rightX, y: boss.extra.rightY },
        velocity: { x: toPlayer.x * speed, y: toPlayer.y * speed },
        damage: 14,
        pierceLeft: 0,
        homing: false,
        ignoreShield: false,
      });
    }
  }
}

function tickCrimson(state: WheelBattleState, _dtMs: number) {
  const boss = state.boss;
  if (!boss) {
    return;
  }

  const ratio = boss.hp / boss.maxHp;
  const nextPhase = ratio > 0.7 ? 1 : ratio > 0.35 ? 2 : 3;
  if (nextPhase !== boss.phase) {
    boss.phase = nextPhase;
    state.bossPhasesCleared += 1;
    state.score += 400;
    if (nextPhase === 2) {
      boss.telegraph = { id: 'ring', label: '环形弹幕将至', remainMs: 2000 };
      appendLog(state, '母舰弹幕核心启动。');
    }
    if (nextPhase === 3) {
      boss.telegraph = { id: 'laser', label: '激光充能', remainMs: 1200 };
      appendLog(state, '母舰过载核心暴露。');
    }
  }

  if (state.effects.empMs > 0) {
    return;
  }

  if (boss.phase === 1 && boss.patternTimerMs >= 900) {
    boss.patternTimerMs = 0;
    fireBossVolley(state, { x: 50, y: 14 }, 2, 0.1, 14);
  }

  if (boss.phase === 2 && boss.telegraph && boss.telegraph.remainMs === 0) {
    for (let index = 0; index < 12; index += 1) {
      const angle = (Math.PI * 2 * index) / 12;
      pushBullet(state, {
        faction: 'enemy',
        position: { x: 50, y: 16 },
        velocity: { x: Math.cos(angle) * 0.026, y: Math.sin(angle) * 0.026 },
        damage: 14,
        pierceLeft: 0,
        homing: false,
        ignoreShield: false,
      });
    }
    const toPlayer = normalize({ x: playerX - 50, y: playerY - 16 });
    pushBullet(state, {
      faction: 'enemy',
      position: { x: 50, y: 16 },
      velocity: { x: toPlayer.x * 0.02, y: toPlayer.y * 0.02 },
      damage: 14,
      pierceLeft: 0,
      homing: true,
      ignoreShield: false,
    });
    boss.telegraph = { id: 'ring', label: '环形弹幕将至', remainMs: 3200 };
  }

  if (boss.phase === 3) {
    if (boss.extra.summoned < 2 && state.enemies.filter((enemy) => enemy.type === 'elite').length < 2) {
      for (const lane of ['left', 'right'] as Lane[]) {
        const stats = enemyStats('elite');
        state.enemies.push({
          id: state.nextEntityId,
          type: 'elite',
          lane,
          position: { x: laneX[lane], y: 6 },
          hp: stats.hp,
          maxHp: stats.hp,
          shield: 24,
          fireCooldownMs: 600,
          hoverMs: 0,
        });
        state.nextEntityId += 1;
      }
      boss.extra.summoned = 2;
    }

    if (boss.telegraph && boss.telegraph.remainMs === 0 && boss.telegraph.id === 'laser') {
      hurtPlayer(state, 26);
      appendLog(state, '母舰激光命中基地。');
      boss.telegraph = { id: 'laser', label: '激光充能', remainMs: 4200 };
    }
  }
}

function fireBossVolley(state: WheelBattleState, origin: Vec, count: number, spread: number, damage: number) {
  const toPlayer = normalize({ x: playerX - origin.x, y: playerY - origin.y });
  const start = -spread * ((count - 1) / 2);
  for (let index = 0; index < count; index += 1) {
    pushBullet(state, {
      faction: 'enemy',
      position: { ...origin },
      velocity: rotate(toPlayer, start + spread * index, 0.03 * timeScale(state)),
      damage,
      pierceLeft: 0,
      homing: false,
      ignoreShield: false,
    });
  }
}

function autoTarget(state: WheelBattleState) {
  let bestId: number | null = null;
  let bestScore = -Infinity;

  for (const enemy of state.enemies) {
    const threat = enemy.position.y * 2 + enemy.hp * 0.05;
    if (threat > bestScore) {
      bestScore = threat;
      bestId = enemy.id;
    }
  }

  if (state.boss && state.boss.hp > 0) {
    const bossThreat = 180;
    if (bossThreat > bestScore) {
      bestId = -1;
    }
    if (state.boss.id === 'twin-drones') {
      const leftThreat = state.boss.extra.leftHp > 0 ? 170 + state.boss.extra.leftY : -Infinity;
      const rightThreat = state.boss.extra.rightHp > 0 ? 170 + state.boss.extra.rightY : -Infinity;
      if (leftThreat >= rightThreat && leftThreat > bestScore) {
        bestId = -2;
      } else if (rightThreat > bestScore) {
        bestId = -3;
      }
    }
  }

  state.player.targetId = bestId;
  return state;
}

function autoFire(state: WheelBattleState, _dtMs: number) {
  if (state.player.fireCooldownMs > 0) {
    return state;
  }

  const power = getSectorPower('rapid', getUpgradeLevel(state.meta, 'rapid'));
  const interval = state.effects.rapidMs > 0 ? power.fireIntervalMs : baseFireInterval;
  const spreadPower = getSectorPower('spread', getUpgradeLevel(state.meta, 'spread'));
  const origin = { x: playerX, y: playerY - 4 };
  const target = getTargetPosition(state);
  const dir = normalize({ x: target.x - origin.x, y: target.y - origin.y });
  const usingPierce = state.effects.pierceShots > 0;
  const damage = scaledDamage(state, playerBulletDamage);
  const speed = 0.062;

  pushBullet(state, {
    faction: 'player',
    position: { ...origin },
    velocity: { x: dir.x * speed, y: dir.y * speed },
    damage,
    pierceLeft: usingPierce ? 3 : 0,
    homing: false,
    ignoreShield: usingPierce,
  });

  if (usingPierce) {
    state.effects.pierceShots = Math.max(0, state.effects.pierceShots - 1);
  }

  if (state.effects.spreadMs > 0) {
    for (const x of [22, 78]) {
      const spreadDir = normalize({ x: x - origin.x, y: 8 - origin.y });
      pushBullet(state, {
        faction: 'player',
        position: { ...origin },
        velocity: { x: spreadDir.x * speed, y: spreadDir.y * speed },
        damage: scaledDamage(state, spreadPower.spreadDamage),
        pierceLeft: 0,
        homing: false,
        ignoreShield: false,
      });
    }
  }

  state.player.fireCooldownMs = interval;
  return state;
}

function tickDrones(state: WheelBattleState, dtMs: number) {
  if (state.effects.droneMs <= 0) {
    return state;
  }

  state.effects.droneCooldownMs -= dtMs;
  if (state.effects.droneCooldownMs > 0) {
    return state;
  }

  for (const x of [22, 78]) {
    const target = state.enemies
      .slice()
      .sort((left, right) => Math.abs(left.position.x - x) - Math.abs(right.position.x - x) || right.position.y - left.position.y)[0];
    const aim = target ? target.position : { x, y: 10 };
    const dir = normalize({ x: aim.x - x, y: aim.y - 88 });
    pushBullet(state, {
      faction: 'player',
      position: { x, y: 88 },
      velocity: { x: dir.x * 0.05, y: dir.y * 0.05 },
      damage: scaledDamage(state, 5),
      pierceLeft: 0,
      homing: false,
      ignoreShield: false,
    });
  }

  state.effects.droneCooldownMs = 260;
  return state;
}

function tickMissiles(state: WheelBattleState, dtMs: number) {
  if (state.effects.missileRemaining <= 0) {
    return state;
  }

  state.effects.missileCooldownMs -= dtMs;
  if (state.effects.missileCooldownMs > 0) {
    return state;
  }

  const power = getSectorPower('missile', getUpgradeLevel(state.meta, 'missile'));
  const target = getTargetPosition(state);
  const origin = { x: playerX, y: playerY - 4 };
  const dir = normalize({ x: target.x - origin.x, y: target.y - origin.y });
  pushBullet(state, {
    faction: 'player',
    position: { ...origin },
    velocity: { x: dir.x * 0.048, y: dir.y * 0.048 },
    damage: scaledDamage(state, power.missileDamage),
    pierceLeft: 0,
    homing: true,
    ignoreShield: false,
  });
  state.effects.missileRemaining -= 1;
  state.effects.missileCooldownMs = 900;
  return state;
}

function tickLaser(state: WheelBattleState, dtMs: number) {
  if (state.effects.laserMs <= 0) {
    return state;
  }

  state.effects.laserAccMs += dtMs;
  while (state.effects.laserAccMs >= 200) {
    state.effects.laserAccMs -= 200;
    const target = getTargetEntity(state);
    if (target?.type === 'enemy') {
      hurtEnemy(state, target.enemy, 6, true);
    } else if (target?.type === 'boss') {
      damageBoss(state, 6, true);
    }
  }
  return state;
}

function tickBullets(state: WheelBattleState, dtMs: number) {
  const slow = timeScale(state);
  state.bullets = state.bullets.filter((bullet) => {
    if (bullet.homing && bullet.faction === 'player') {
      const target = getTargetPosition(state);
      const dir = normalize({ x: target.x - bullet.position.x, y: target.y - bullet.position.y });
      bullet.velocity.x = dir.x * 0.05;
      bullet.velocity.y = dir.y * 0.05;
    }
    if (bullet.homing && bullet.faction === 'enemy') {
      const dir = normalize({ x: playerX - bullet.position.x, y: playerY - bullet.position.y });
      bullet.velocity.x += dir.x * 0.0015;
      bullet.velocity.y += dir.y * 0.0015;
    }

    const factor = bullet.faction === 'enemy' ? slow : 1;
    bullet.position.x += bullet.velocity.x * dtMs * factor;
    bullet.position.y += bullet.velocity.y * dtMs * factor;
    return bullet.position.y > -8 && bullet.position.y < 108 && bullet.position.x > -8 && bullet.position.x < 108;
  });

  if (state.bullets.length > maxBullets) {
    state.bullets = state.bullets.filter((bullet, index) => bullet.faction === 'player' || index > state.bullets.length - maxBullets);
  }

  return state;
}

function resolveCollisions(state: WheelBattleState) {
  const remaining: Bullet[] = [];

  for (const bullet of state.bullets) {
    let consumed = false;
    if (bullet.faction === 'player') {
      for (const enemy of state.enemies) {
        if (hits(bullet.position, 1.6, 1.6, enemy.position, enemySize(enemy.type).w, enemySize(enemy.type).h)) {
          hurtEnemy(state, enemy, bullet.damage, bullet.ignoreShield);
          if (bullet.pierceLeft > 0) {
            bullet.pierceLeft -= 1;
          } else {
            consumed = true;
          }
          break;
        }
      }

      if (!consumed && state.boss && state.boss.hp > 0) {
        const hitboxes = getBossHitboxes(state.boss);
        const hit = hitboxes.find((box) => hits(bullet.position, 1.6, 1.6, box.position, box.w, box.h));
        if (hit) {
          damageBoss(state, bullet.damage, bullet.ignoreShield, hit.part);
          if (bullet.pierceLeft > 0) {
            bullet.pierceLeft -= 1;
          } else {
            consumed = true;
          }
        }
      }
    } else if (hits(bullet.position, 1.6, 1.6, state.player.position, 5.2, 6)) {
      hurtPlayer(state, bullet.damage);
      consumed = true;
    }

    if (!consumed) {
      remaining.push(bullet);
    }
  }

  state.bullets = remaining;
  state.enemies = state.enemies.filter((enemy) => {
    if (enemy.hp > 0) {
      return true;
    }
    registerKill(state, enemy.type);
    return false;
  });

  return state;
}

function resolveLeaks(state: WheelBattleState) {
  const remaining: Enemy[] = [];
  for (const enemy of state.enemies) {
    if (enemy.position.y < leakY) {
      remaining.push(enemy);
      continue;
    }

    if (state.effects.bulkheadMs > 0 && enemy.lane === state.effects.bulkheadLane) {
      enemy.position.y = 70;
      remaining.push(enemy);
      continue;
    }

    const damage = enemy.type === 'scout'
      ? state.levelIndex === 0 ? 6 : 10
      : enemy.type === 'gunship'
        ? state.levelIndex === 0 ? 12 : 18
        : 28;
    hurtPlayer(state, damage);
    state.leaks += 1;
    state.score = Math.max(0, state.score - (enemy.type === 'scout' ? 15 : enemy.type === 'gunship' ? 35 : 70));
  }
  state.enemies = remaining;
  return state;
}

function hurtEnemy(state: WheelBattleState, enemy: Enemy, damage: number, ignoreShield: boolean) {
  let remaining = damage;
  if (!ignoreShield && enemy.shield > 0 && state.effects.empMs <= 0) {
    const absorbed = Math.min(enemy.shield, remaining);
    enemy.shield -= absorbed;
    remaining -= absorbed;
  }
  enemy.hp -= remaining;
}

function damageBoss(state: WheelBattleState, damage: number, ignoreShield: boolean, part?: 'left' | 'right' | 'body') {
  const boss = state.boss;
  if (!boss) {
    return;
  }

  let applied = damage;
  const piercePower = getSectorPower('pierce', getUpgradeLevel(state.meta, 'pierce'));
  if (ignoreShield || state.effects.overclockMs > 0) {
    applied *= 1 + (ignoreShield ? piercePower.pierceBonus : 0);
  } else if (boss.id === 'crimson-carrier' && boss.phase === 1) {
    applied *= 0.5;
  }

  applied = Math.round(applied);
  if (boss.id === 'twin-drones') {
    if (part === 'left' || (!part && boss.extra.leftHp >= boss.extra.rightHp)) {
      boss.extra.leftHp = Math.max(0, boss.extra.leftHp - applied);
    } else {
      boss.extra.rightHp = Math.max(0, boss.extra.rightHp - applied);
    }
    boss.hp = boss.extra.leftHp + boss.extra.rightHp;
  } else {
    boss.hp = Math.max(0, boss.hp - applied);
  }
}

function hurtPlayer(state: WheelBattleState, amount: number) {
  if (state.effects.aegisMs > 0 || state.player.iFrameMs > 0 || state.player.hp <= 0) {
    return;
  }

  const taken = state.effects.overclockMs > 0
    ? Math.round(amount * getSectorPower('overclock', getUpgradeLevel(state.meta, 'overclock')).overclockTaken)
    : amount;
  let remaining = taken;
  if (state.player.armor > 0) {
    const absorbed = Math.min(state.player.armor, remaining);
    state.player.armor -= absorbed;
    remaining -= absorbed;
  }
  state.player.hp = Math.max(0, state.player.hp - remaining);
  state.player.iFrameMs = iFrameMs;
}

function registerKill(state: WheelBattleState, type: EnemyType) {
  const energy = type === 'scout' ? 12 : type === 'gunship' ? 22 : 40;
  const score = type === 'scout' ? 30 : type === 'gunship' ? 70 : 150;
  state.kills += 1;
  state.score += score;
  grantEnergy(state, energy);
}

function grantEnergy(state: WheelBattleState, amount: number) {
  const gained = state.effects.salvageMs > 0 ? Math.round(amount * 1.8) : amount;
  state.energy += gained;
  while (state.energy >= energyCap) {
    state.energy -= energyCap;
    if (state.spinCharges < state.maxSpinCharges) {
      state.spinCharges += 1;
      appendLog(state, `能量满条，转动次数 ${state.spinCharges}/3。`);
    } else {
      state.score += Math.round(energyCap * 0.3);
    }
  }
}

function checkOutcome(state: WheelBattleState): WheelBattleState {
  if (state.player.hp <= 0) {
    return appendLog({ ...state, phase: 'defeat', paused: true }, '基地被打穿。可以选择本关重开，或结束本局领取金币。');
  }

  if (state.boss && state.boss.hp <= 0) {
    const boss = state.boss;
    state.score += state.levelIndex === 0 ? 1200 : state.levelIndex === 1 ? 1600 : 2200;
    state.boss = null;
    state.enemies = [];
    state.bullets = state.bullets.filter((bullet) => bullet.faction === 'player');
    state.meta = unlockSectors(state.meta, bossUnlocks[boss.id]);
    state.bossPhasesCleared += 1;
    appendLog(state, `击败${levels[state.levelIndex].bossName}。`);

    if (state.levelIndex >= levels.length - 1) {
      return settleRun(state, true);
    }

    return appendLog(
      {
        ...state,
        phase: 'assembly',
        levelIndex: state.levelIndex + 1,
        wheelLocked: false,
        paused: false,
        spinningMs: 0,
        pendingSpinId: null,
        nextWave: null,
      },
      `转盘解锁新效果，整备后进入第 ${state.levelIndex + 2} 关。`,
    );
  }

  if (state.phase === 'spinning' && state.spinningMs <= 0) {
    state.phase = 'combat';
  }

  return state;
}

function explodeAt(state: WheelBattleState, origin: Vec, radius: number, damage: number) {
  let hits = 0;
  for (const enemy of state.enemies) {
    if (distance(enemy.position, origin) <= radius) {
      hurtEnemy(state, enemy, damage, false);
      hits += 1;
    }
  }
  if (state.boss && distance(getBossCenter(state.boss), origin) <= radius + 8) {
    damageBoss(state, damage, false);
    hits += 1;
  }
  state.enemies = state.enemies.filter((enemy) => {
    if (enemy.hp > 0) {
      return true;
    }
    registerKill(state, enemy.type);
    return false;
  });
  return { state, hits };
}

function getTargetPosition(state: WheelBattleState): Vec {
  const target = getTargetEntity(state);
  if (target?.type === 'enemy') {
    return target.enemy.position;
  }
  if (target?.type === 'boss') {
    return target.position;
  }
  return { x: 50, y: 12 };
}

function getTargetEntity(state: WheelBattleState) {
  if (state.player.targetId && state.player.targetId > 0) {
    const enemy = state.enemies.find((item) => item.id === state.player.targetId);
    if (enemy) {
      return { type: 'enemy' as const, enemy };
    }
  }
  if (state.boss && state.boss.hp > 0) {
    if (state.boss.id === 'twin-drones') {
      if (state.player.targetId === -2 && state.boss.extra.leftHp > 0) {
        return { type: 'boss' as const, position: { x: state.boss.extra.leftX, y: state.boss.extra.leftY }, part: 'left' as const };
      }
      if (state.player.targetId === -3 && state.boss.extra.rightHp > 0) {
        return { type: 'boss' as const, position: { x: state.boss.extra.rightX, y: state.boss.extra.rightY }, part: 'right' as const };
      }
    }
    return { type: 'boss' as const, position: getBossCenter(state.boss), part: 'body' as const };
  }
  return null;
}

function getBossCenter(boss: BossState): Vec {
  if (boss.id === 'twin-drones') {
    if (boss.extra.leftHp >= boss.extra.rightHp) {
      return { x: boss.extra.leftX, y: boss.extra.leftY };
    }
    return { x: boss.extra.rightX, y: boss.extra.rightY };
  }
  return { x: boss.extra.x ?? 50, y: boss.extra.y ?? 16 };
}

function getBossHitboxes(boss: BossState) {
  if (boss.id === 'twin-drones') {
    const boxes: Array<{ position: Vec; w: number; h: number; part: 'left' | 'right' | 'body' }> = [];
    if (boss.extra.leftHp > 0) {
      boxes.push({ position: { x: boss.extra.leftX, y: boss.extra.leftY }, w: 8, h: 8, part: 'left' });
    }
    if (boss.extra.rightHp > 0) {
      boxes.push({ position: { x: boss.extra.rightX, y: boss.extra.rightY }, w: 8, h: 8, part: 'right' });
    }
    return boxes;
  }
  if (boss.id === 'crimson-carrier') {
    return [{ position: { x: 50, y: 14 }, w: 22, h: 14, part: 'body' as const }];
  }
  return [{ position: { x: boss.extra.x ?? 50, y: boss.extra.y ?? 16 }, w: 14, h: 10, part: 'body' as const }];
}

function scaledDamage(state: WheelBattleState, base: number) {
  if (state.effects.overclockMs <= 0) {
    return base;
  }
  return Math.round(base * getSectorPower('overclock', getUpgradeLevel(state.meta, 'overclock')).overclockDamage);
}

function timeScale(state: WheelBattleState) {
  if (state.effects.timeDilationMs <= 0) {
    return 1;
  }
  return getSectorPower('time-dilation', getUpgradeLevel(state.meta, 'time-dilation')).timeDilationFactor;
}

function enemyStats(type: EnemyType) {
  if (type === 'gunship') {
    return { hp: 36 };
  }
  if (type === 'elite') {
    return { hp: 80 };
  }
  return { hp: 12 };
}

function enemySize(type: EnemyType) {
  if (type === 'gunship') {
    return { w: 6, h: 5 };
  }
  if (type === 'elite') {
    return { w: 7, h: 7 };
  }
  return { w: 4, h: 4 };
}

function pickLeakiestLane(state: WheelBattleState): Lane {
  const scores: Record<Lane, number> = { left: 0, mid: 0, right: 0 };
  for (const enemy of state.enemies) {
    scores[enemy.lane] += enemy.position.y;
  }
  return (Object.entries(scores) as Array<[Lane, number]>).sort((left, right) => right[1] - left[1])[0][0];
}

function pickLane(): Lane {
  return lanes[Math.floor(Math.random() * lanes.length)];
}

function pushBullet(state: WheelBattleState, bullet: Omit<Bullet, 'id'>) {
  if (state.bullets.length >= maxBullets && bullet.faction === 'enemy') {
    return;
  }
  state.bullets.push({ ...bullet, id: state.nextEntityId });
  state.nextEntityId += 1;
}

function hits(a: Vec, aw: number, ah: number, b: Vec, bw: number, bh: number) {
  return Math.abs(a.x - b.x) < (aw + bw) / 2 && Math.abs(a.y - b.y) < (ah + bh) / 2;
}

function distance(a: Vec, b: Vec) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(vec: Vec) {
  const length = Math.hypot(vec.x, vec.y) || 1;
  return { x: vec.x / length, y: vec.y / length };
}

function rotate(vec: Vec, angle: number, speed: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: (vec.x * cos - vec.y * sin) * speed, y: (vec.x * sin + vec.y * cos) * speed };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function appendLog(state: WheelBattleState, entry: string) {
  state.log = [entry, ...state.log].slice(0, maxLog);
  return state;
}

export function getActiveEffectLabels(state: WheelBattleState) {
  const labels: string[] = [];
  if (state.effects.aegisMs > 0) labels.push(`护盾 ${formatSeconds(state.effects.aegisMs)}`);
  if (state.effects.regenMs > 0) labels.push(`再生 ${formatSeconds(state.effects.regenMs)}`);
  if (state.effects.rapidMs > 0) labels.push(`速射 ${formatSeconds(state.effects.rapidMs)}`);
  if (state.effects.spreadMs > 0) labels.push(`散射 ${formatSeconds(state.effects.spreadMs)}`);
  if (state.effects.pierceShots > 0) labels.push(`穿甲 ${state.effects.pierceShots}发`);
  if (state.effects.missileRemaining > 0) labels.push(`导弹 ${state.effects.missileRemaining}`);
  if (state.effects.laserMs > 0) labels.push(`激光 ${formatSeconds(state.effects.laserMs)}`);
  if (state.effects.overclockMs > 0) labels.push(`过载 ${formatSeconds(state.effects.overclockMs)}`);
  if (state.effects.empMs > 0) labels.push(`EMP ${formatSeconds(state.effects.empMs)}`);
  if (state.effects.bulkheadMs > 0) labels.push(`闸门${laneLabel(state.effects.bulkheadLane)} ${formatSeconds(state.effects.bulkheadMs)}`);
  if (state.effects.timeDilationMs > 0) labels.push(`时缓 ${formatSeconds(state.effects.timeDilationMs)}`);
  if (state.effects.salvageMs > 0) labels.push(`回收 ${formatSeconds(state.effects.salvageMs)}`);
  if (state.effects.droneMs > 0) labels.push(`无人机 ${formatSeconds(state.effects.droneMs)}`);
  if (state.effects.bountyTriggered) labels.push('打捞协议');
  return labels;
}

export function getTelegraph(state: WheelBattleState) {
  return state.boss?.telegraph ?? state.nextWave;
}

export function isCombatPhase(phase: GamePhase) {
  return phase === 'combat' || phase === 'spinning' || phase === 'boss-intro';
}
