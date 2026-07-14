export type Point = {
  x: number;
  y: number;
};

export type Rect = Point & {
  width: number;
  height: number;
};

export type GameStatus = 'running' | 'won' | 'lost';
export type AdultMood = 'patrol' | 'chasing' | 'distracted' | 'stunned';
export type SkillId = 'poop' | 'pee';
export type PropKind = 'rattle' | 'duck' | 'ball';
export type MapId = 'sunny-bedroom' | 'living-maze' | 'moon-nursery';
export type InteractionKind = 'laundry-basket' | 'light-switch' | 'music-box';

export type Adult = Point & {
  id: number;
  angle: number;
  mood: AdultMood;
  target: Point;
  distractedMs: number;
  stunnedMs: number;
};

export type FloorEffect = Point & {
  id: number;
  kind: SkillId;
  remainingMs: number;
};

export type RoomProp = Point & {
  id: number;
  kind: PropKind;
  collected: boolean;
};

export type SceneInteraction = Point & {
  id: number;
  kind: InteractionKind;
  cooldownMs: number;
};

export type FurnitureItem = Rect & {
  id: string;
  label: string;
  kind: string;
};

export type RoomMap = {
  id: MapId;
  name: string;
  subtitle: string;
  className: string;
  cribPoint: Point;
  adultSpawns: Point[];
  furniture: FurnitureItem[];
  propSpawns: Array<Point & { kind: PropKind }>;
  interactionSpawns: Array<Point & { kind: InteractionKind }>;
};

export type GameState = {
  status: GameStatus;
  mapId: MapId;
  player: Point;
  adults: Adult[];
  pacifier: Point;
  effects: FloorEffect[];
  props: RoomProp[];
  interactions: SceneInteraction[];
  heldProp: PropKind | null;
  cooldowns: Record<SkillId, number>;
  remainingMs: number;
  captures: number;
  nextEffectId: number;
  hiddenMs: number;
  blackoutMs: number;
  message: string;
};

export type InputVector = Point;

export const roomWidth = 100;
export const roomHeight = 72;
export const gameDurationMs = 90_000;
export const playerRadius = 1.7;
export const adultRadius = 2.25;

export const roomMaps: RoomMap[] = [
  {
    id: 'sunny-bedroom',
    name: '阳光卧室',
    subtitle: '家具分区清晰，屏风与沙发形成多条绕行路线。',
    className: 'sunny',
    cribPoint: { x: 19.5, y: 63 },
    adultSpawns: [{ x: 55, y: 15 }, { x: 91, y: 37 }, { x: 61, y: 61 }],
    furniture: [
      { id: 'crib', label: '摇篮', kind: 'crib', x: 3, y: 56, width: 14, height: 13 },
      { id: 'bed', label: '大床', kind: 'bed', x: 3, y: 5, width: 25, height: 15 },
      { id: 'wardrobe', label: '衣柜', kind: 'wardrobe', x: 34, y: 3, width: 11, height: 12 },
      { id: 'bookshelf', label: '书架', kind: 'wardrobe', x: 50, y: 3, width: 9, height: 9 },
      { id: 'sofa', label: '沙发', kind: 'sofa', x: 66, y: 4, width: 28, height: 11 },
      { id: 'armchair', label: '扶手椅', kind: 'sofa', x: 51, y: 19, width: 11, height: 10 },
      { id: 'table', label: '茶几', kind: 'table', x: 73, y: 21, width: 14, height: 10 },
      { id: 'screen', label: '屏风', kind: 'screen', x: 31, y: 29, width: 6, height: 20 },
      { id: 'ottoman', label: '脚凳', kind: 'table', x: 55, y: 45, width: 10, height: 8 },
      { id: 'dresser', label: '矮柜', kind: 'dresser', x: 33, y: 59, width: 19, height: 9 },
      { id: 'toybox', label: '玩具箱', kind: 'toybox', x: 83, y: 58, width: 12, height: 10 },
    ],
    propSpawns: [
      { x: 31, y: 22, kind: 'rattle' },
      { x: 91, y: 51, kind: 'duck' },
      { x: 68, y: 40, kind: 'ball' },
    ],
    interactionSpawns: [
      { x: 22, y: 48, kind: 'laundry-basket' },
      { x: 62, y: 4, kind: 'light-switch' },
      { x: 76, y: 53, kind: 'music-box' },
    ],
  },
  {
    id: 'living-maze',
    name: '客厅迷阵',
    subtitle: '长沙发与餐桌切割空间，狭窄通道适合甩开追逐。',
    className: 'living',
    cribPoint: { x: 19.5, y: 10 },
    adultSpawns: [{ x: 61, y: 12 }, { x: 94, y: 18 }, { x: 55, y: 64 }],
    furniture: [
      { id: 'crib', label: '摇篮', kind: 'crib', x: 3, y: 4, width: 14, height: 13 },
      { id: 'cabinet-a', label: '电视柜', kind: 'dresser', x: 26, y: 3, width: 25, height: 7 },
      { id: 'sofa-a', label: '长沙发', kind: 'sofa', x: 24, y: 18, width: 34, height: 9 },
      { id: 'sofa-b', label: '转角沙发', kind: 'sofa', x: 51, y: 27, width: 10, height: 19 },
      { id: 'table-a', label: '圆茶几', kind: 'table', x: 33, y: 34, width: 13, height: 11 },
      { id: 'dining', label: '餐桌', kind: 'table', x: 70, y: 12, width: 20, height: 15 },
      { id: 'chair-a', label: '餐椅', kind: 'sofa', x: 65, y: 9, width: 6, height: 7 },
      { id: 'chair-b', label: '餐椅', kind: 'sofa', x: 89, y: 29, width: 6, height: 7 },
      { id: 'shelf', label: '展示架', kind: 'wardrobe', x: 4, y: 29, width: 9, height: 25 },
      { id: 'island', label: '吧台', kind: 'dresser', x: 67, y: 49, width: 28, height: 8 },
      { id: 'plant', label: '绿植', kind: 'plant', x: 17, y: 58, width: 9, height: 10 },
      { id: 'toybox', label: '玩具角', kind: 'toybox', x: 34, y: 59, width: 14, height: 10 },
    ],
    propSpawns: [
      { x: 17, y: 22, kind: 'ball' },
      { x: 63, y: 61, kind: 'rattle' },
      { x: 91, y: 42, kind: 'duck' },
    ],
    interactionSpawns: [
      { x: 16, y: 52, kind: 'laundry-basket' },
      { x: 58, y: 7, kind: 'light-switch' },
      { x: 54, y: 55, kind: 'music-box' },
    ],
  },
  {
    id: 'moon-nursery',
    name: '月夜育婴室',
    subtitle: '成排婴儿床和储物柜构成回廊，视线短但转角更多。',
    className: 'moon',
    cribPoint: { x: 20.5, y: 64 },
    adultSpawns: [{ x: 51, y: 21 }, { x: 78, y: 64 }, { x: 50, y: 40 }],
    furniture: [
      { id: 'crib', label: '我的摇篮', kind: 'crib', x: 4, y: 58, width: 14, height: 11 },
      { id: 'crib-a', label: '婴儿床', kind: 'crib', x: 4, y: 5, width: 17, height: 12 },
      { id: 'crib-b', label: '婴儿床', kind: 'crib', x: 29, y: 5, width: 17, height: 12 },
      { id: 'crib-c', label: '婴儿床', kind: 'crib', x: 54, y: 5, width: 17, height: 12 },
      { id: 'crib-d', label: '婴儿床', kind: 'crib', x: 79, y: 5, width: 17, height: 12 },
      { id: 'changing-a', label: '护理台', kind: 'dresser', x: 4, y: 28, width: 22, height: 8 },
      { id: 'changing-b', label: '护理台', kind: 'dresser', x: 74, y: 28, width: 22, height: 8 },
      { id: 'shelf-a', label: '奶粉柜', kind: 'wardrobe', x: 35, y: 27, width: 9, height: 18 },
      { id: 'shelf-b', label: '尿布柜', kind: 'wardrobe', x: 56, y: 27, width: 9, height: 18 },
      { id: 'playpen', label: '游戏围栏', kind: 'toybox', x: 23, y: 52, width: 24, height: 15 },
      { id: 'rocker', label: '摇椅', kind: 'sofa', x: 55, y: 54, width: 13, height: 12 },
      { id: 'supply', label: '用品车', kind: 'table', x: 77, y: 50, width: 10, height: 9 },
      { id: 'linen', label: '布草柜', kind: 'wardrobe', x: 88, y: 48, width: 8, height: 20 },
    ],
    propSpawns: [
      { x: 25, y: 22, kind: 'duck' },
      { x: 50, y: 49, kind: 'ball' },
      { x: 71, y: 64, kind: 'rattle' },
    ],
    interactionSpawns: [
      { x: 20, y: 43, kind: 'laundry-basket' },
      { x: 50, y: 21, kind: 'light-switch' },
      { x: 72, y: 42, kind: 'music-box' },
    ],
  },
];

const playerSpeed = 18;
const adultPatrolSpeed = 5.2;
const adultChaseSpeed = 11.4;
const adultVisionDistance = 29;
const captureDistance = playerRadius + adultRadius;

export function createInitialState(
  mapId?: MapId,
  random: () => number = Math.random,
): GameState {
  const map = mapId
    ? getRoomMap(mapId)
    : roomMaps[Math.floor(random() * roomMaps.length)] ?? roomMaps[0];
  const adultCount = random() < 0.48 ? 1 : 2;
  const shuffledAdults = [...map.adultSpawns].sort(() => random() - 0.5);
  const pacifier = randomFloorPoint(map, random, map.cribPoint, 28);

  return {
    status: 'running',
    mapId: map.id,
    player: { ...map.cribPoint },
    adults: shuffledAdults.slice(0, adultCount).map((point, index) => ({
      id: index + 1,
      ...point,
      angle: random() * Math.PI * 2,
      mood: 'patrol',
      target: randomWalkTarget(map, random),
      distractedMs: 0,
      stunnedMs: 0,
    })),
    pacifier: { ...pacifier },
    effects: [],
    props: map.propSpawns.map((prop, index) => ({ ...prop, id: index + 1, collected: false })),
    interactions: map.interactionSpawns.map((interaction, index) => ({
      ...interaction,
      id: index + 1,
      cooldownMs: 0,
    })),
    heldProp: null,
    cooldowns: { poop: 0, pee: 0 },
    remainingMs: gameDurationMs,
    captures: 0,
    nextEffectId: 1,
    hiddenMs: 0,
    blackoutMs: 0,
    message: `${map.name}已经布置好，奶嘴随机藏在某个角落。轻一点！`,
  };
}

export function advanceGame(
  state: GameState,
  input: InputVector,
  deltaMs: number,
  random: () => number = Math.random,
): GameState {
  if (state.status !== 'running') {
    return state;
  }

  const safeDelta = Math.min(deltaMs, 50);
  const deltaSeconds = safeDelta / 1000;
  const map = getRoomMap(state.mapId);
  const remainingMs = Math.max(0, state.remainingMs - safeDelta);
  const player = moveCircle(
    state.player,
    state.hiddenMs > 0 ? { x: 0, y: 0 } : normalize(input),
    playerSpeed * deltaSeconds,
    playerRadius,
    map,
  );
  const effects = state.effects
    .map((effect) => ({ ...effect, remainingMs: effect.remainingMs - safeDelta }))
    .filter((effect) => effect.remainingMs > 0);
  const cooldowns = {
    poop: Math.max(0, state.cooldowns.poop - safeDelta),
    pee: Math.max(0, state.cooldowns.pee - safeDelta),
  };
  const hiddenMs = Math.max(0, state.hiddenMs - safeDelta);
  const blackoutMs = Math.max(0, state.blackoutMs - safeDelta);
  const interactions = state.interactions.map((interaction) => ({
    ...interaction,
    cooldownMs: Math.max(0, interaction.cooldownMs - safeDelta),
  }));

  let message = state.message;
  let heldProp = state.heldProp;
  const props = state.props.map((prop) => {
    if (!prop.collected && !heldProp && distance(player, prop) < 3.4) {
      heldProp = prop.kind;
      message = `捡到了${getPropLabel(prop.kind)}，按 E 或点击道具按钮制造声响。`;
      return { ...prop, collected: true };
    }
    return prop;
  });

  let captured = false;
  const adults = state.adults.map((adult) => {
    const nextAdult = advanceAdult(adult, player, effects, safeDelta, hiddenMs, blackoutMs, map, random);
    if (hiddenMs <= 0 && distance(nextAdult, player) <= captureDistance && nextAdult.stunnedMs <= 0) {
      captured = true;
    }
    return nextAdult;
  });

  if (remainingMs <= 0) {
    return {
      ...state,
      player,
      adults,
      effects,
      props,
      interactions,
      heldProp,
      cooldowns,
      remainingMs: 0,
      hiddenMs,
      blackoutMs,
      status: 'lost',
      message: '时间到了，大人把奶嘴收进了柜子。',
    };
  }

  if (distance(player, state.pacifier) <= playerRadius + 1.6) {
    return {
      ...state,
      player,
      adults,
      effects,
      props,
      interactions,
      heldProp,
      cooldowns,
      remainingMs,
      hiddenMs,
      blackoutMs,
      status: 'won',
      message: '找到了！终于可以安心睡觉啦。',
    };
  }

  if (captured) {
    return {
      ...state,
      player: { ...map.cribPoint },
      adults: adults.map((adult) => ({
        ...adult,
        mood: 'patrol',
        target: randomWalkTarget(map, random),
      })),
      effects,
      props,
      interactions,
      heldProp,
      cooldowns,
      remainingMs: Math.max(0, remainingMs - 5_000),
      captures: state.captures + 1,
      hiddenMs: 0,
      blackoutMs,
      message: '被捉住了！回到摇篮，并损失 5 秒。',
    };
  }

  return {
    ...state,
    player,
    adults,
    effects,
    props,
    interactions,
    heldProp,
    cooldowns,
    remainingMs,
    hiddenMs,
    blackoutMs,
    message,
  };
}

export function useSkill(state: GameState, skill: SkillId): GameState {
  if (state.status !== 'running' || state.cooldowns[skill] > 0) {
    return state;
  }

  const duration = skill === 'poop' ? 7_000 : 4_600;
  const cooldown = skill === 'poop' ? 9_000 : 11_000;

  return {
    ...state,
    effects: [
      ...state.effects,
      {
        id: state.nextEffectId,
        kind: skill,
        x: state.player.x,
        y: state.player.y,
        remainingMs: duration,
      },
    ],
    cooldowns: { ...state.cooldowns, [skill]: cooldown },
    nextEffectId: state.nextEffectId + 1,
    message: skill === 'poop'
      ? '便便陷阱放好了，大人踩到会被熏晕。'
      : '地板湿滑，大人踩到会滑倒。',
  };
}

export function useHeldProp(state: GameState): GameState {
  if (state.status !== 'running' || !state.heldProp) {
    return state;
  }

  const distractionMs = state.heldProp === 'rattle' ? 5_200 : state.heldProp === 'duck' ? 6_200 : 4_500;
  const target = { ...state.player };

  return {
    ...state,
    adults: state.adults.map((adult) => ({
      ...adult,
      mood: 'distracted',
      target,
      distractedMs: distractionMs,
    })),
    heldProp: null,
    message: `${getPropLabel(state.heldProp)}发出了声响，大人被引开了！`,
  };
}

export function useNearbyInteraction(state: GameState): GameState {
  if (state.status !== 'running' || state.hiddenMs > 0) {
    return state;
  }

  const nearby = state.interactions
    .filter((interaction) => interaction.cooldownMs <= 0)
    .map((interaction) => ({ interaction, distance: distance(state.player, interaction) }))
    .filter(({ distance: interactionDistance }) => interactionDistance <= 6)
    .sort((a, b) => a.distance - b.distance)[0]?.interaction;

  if (!nearby) {
    return { ...state, message: '附近没有可互动的设施，靠近带有光圈的场景物件再试试。' };
  }

  const interactions = state.interactions.map((interaction) => (
    interaction.id === nearby.id ? { ...interaction, cooldownMs: 16_000 } : interaction
  ));

  if (nearby.kind === 'laundry-basket') {
    return {
      ...state,
      interactions,
      player: { x: nearby.x, y: nearby.y },
      hiddenMs: 4_500,
      message: '藏进衣篓了！4.5 秒内大人看不到你，但你也不能移动。',
    };
  }

  if (nearby.kind === 'light-switch') {
    return {
      ...state,
      interactions,
      blackoutMs: 8_000,
      message: '啪！房间暗下来了，大人的视野大幅缩短。',
    };
  }

  return {
    ...state,
    interactions,
    adults: state.adults.map((adult) => ({
      ...adult,
      mood: 'distracted',
      target: { x: nearby.x, y: nearby.y },
      distractedMs: 6_000,
    })),
    message: '音乐盒响了，大人循着音乐走过去了！',
  };
}

export function getRoomMap(mapId: MapId) {
  return roomMaps.find((map) => map.id === mapId) ?? roomMaps[0];
}

export function hasLineOfSight(from: Point, to: Point, map: RoomMap) {
  return !map.furniture.some((item) => segmentIntersectsRect(from, to, expandRect(item, 0.8)));
}

export function getPropLabel(kind: PropKind) {
  if (kind === 'rattle') return '拨浪鼓';
  if (kind === 'duck') return '发条鸭';
  return '弹力球';
}

export function getPropIcon(kind: PropKind) {
  if (kind === 'rattle') return '🪇';
  if (kind === 'duck') return '🐤';
  return '🔴';
}

export function getInteractionLabel(kind: InteractionKind) {
  if (kind === 'laundry-basket') return '衣篓藏身';
  if (kind === 'light-switch') return '关灯';
  return '音乐盒';
}

export function getInteractionIcon(kind: InteractionKind) {
  if (kind === 'laundry-basket') return '🧺';
  if (kind === 'light-switch') return '💡';
  return '🎵';
}

function advanceAdult(
  adult: Adult,
  player: Point,
  effects: FloorEffect[],
  deltaMs: number,
  hiddenMs: number,
  blackoutMs: number,
  map: RoomMap,
  random: () => number,
): Adult {
  const deltaSeconds = deltaMs / 1000;
  let next = {
    ...adult,
    stunnedMs: Math.max(0, adult.stunnedMs - deltaMs),
    distractedMs: Math.max(0, adult.distractedMs - deltaMs),
  };

  const touchedEffect = effects.find((effect) => distance(effect, adult) < 3.4);
  if (touchedEffect) {
    return {
      ...next,
      mood: 'stunned',
      stunnedMs: Math.max(next.stunnedMs, touchedEffect.kind === 'poop' ? 2_800 : 2_000),
    };
  }

  if (next.stunnedMs > 0) {
    return { ...next, mood: 'stunned' };
  }

  const visionDistance = blackoutMs > 0 ? adultVisionDistance * 0.34 : adultVisionDistance;
  const seesPlayer = hiddenMs <= 0
    && distance(next, player) <= visionDistance
    && hasLineOfSight(next, player, map);
  if (next.distractedMs > 0) {
    next = { ...next, mood: 'distracted' };
  } else if (seesPlayer) {
    next = { ...next, mood: 'chasing', target: { ...player }, distractedMs: 0 };
  } else if (next.mood !== 'patrol' || distance(next, next.target) < 2.5) {
    next = { ...next, mood: 'patrol', target: randomWalkTarget(map, random) };
  }

  let speed = next.mood === 'chasing' ? adultChaseSpeed : adultPatrolSpeed;
  const poopNearby = effects.some((effect) => effect.kind === 'poop' && distance(effect, next) < 7);
  if (poopNearby) speed *= 0.55;

  const direction = normalize({ x: next.target.x - next.x, y: next.target.y - next.y });
  const moved = moveCircle(next, direction, speed * deltaSeconds, adultRadius, map);
  const isBlocked = distance(moved, next) < speed * deltaSeconds * 0.12;

  return {
    ...next,
    ...moved,
    target: isBlocked && next.mood === 'patrol' ? randomWalkTarget(map, random) : next.target,
    angle: Math.atan2(direction.y, direction.x),
  };
}

function moveCircle(point: Point, direction: Point, amount: number, radius: number, map: RoomMap): Point {
  const proposedX = clamp(point.x + direction.x * amount, radius, roomWidth - radius);
  const proposedY = clamp(point.y + direction.y * amount, radius, roomHeight - radius);

  const xOnly = { x: proposedX, y: point.y };
  const afterX = collidesFurniture(xOnly, radius, map) ? point : xOnly;
  const yOnly = { x: afterX.x, y: proposedY };
  return collidesFurniture(yOnly, radius, map) ? afterX : yOnly;
}

function collidesFurniture(point: Point, radius: number, map: RoomMap) {
  return map.furniture.some((item) => (
    point.x + radius > item.x
    && point.x - radius < item.x + item.width
    && point.y + radius > item.y
    && point.y - radius < item.y + item.height
  ));
}

function randomWalkTarget(map: RoomMap, random: () => number): Point {
  return randomFloorPoint(map, random);
}

function randomFloorPoint(
  map: RoomMap,
  random: () => number,
  awayFrom?: Point,
  minimumDistance = 0,
): Point {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const point = { x: 4 + random() * 92, y: 4 + random() * 64 };
    if (
      !collidesFurniture(point, adultRadius + 0.8, map)
      && (!awayFrom || distance(point, awayFrom) >= minimumDistance)
    ) return point;
  }
  return { x: 50, y: 50 };
}

function normalize(vector: Point): Point {
  const length = Math.hypot(vector.x, vector.y);
  return length > 1 ? { x: vector.x / length, y: vector.y / length } : vector;
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function expandRect(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2,
  };
}

function segmentIntersectsRect(from: Point, to: Point, rect: Rect) {
  const steps = Math.ceil(distance(from, to) / 1.5);
  for (let index = 1; index < steps; index += 1) {
    const ratio = index / steps;
    const point = {
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
    };
    if (
      point.x >= rect.x
      && point.x <= rect.x + rect.width
      && point.y >= rect.y
      && point.y <= rect.y + rect.height
    ) return true;
  }
  return false;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
