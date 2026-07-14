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

export type GameState = {
  status: GameStatus;
  player: Point;
  adults: Adult[];
  pacifier: Point;
  effects: FloorEffect[];
  props: RoomProp[];
  heldProp: PropKind | null;
  cooldowns: Record<SkillId, number>;
  remainingMs: number;
  captures: number;
  nextEffectId: number;
  message: string;
};

export type InputVector = Point;

export const roomWidth = 100;
export const roomHeight = 64;
export const gameDurationMs = 75_000;
export const playerRadius = 1.7;
export const adultRadius = 2.25;
export const cribPoint: Point = { x: 20.5, y: 52 };

export const furniture: Array<Rect & { id: string; label: string; kind: string }> = [
  { id: 'crib', label: '摇篮', kind: 'crib', x: 3, y: 45, width: 15, height: 14 },
  { id: 'bed', label: '大床', kind: 'bed', x: 3, y: 4, width: 26, height: 16 },
  { id: 'wardrobe', label: '衣柜', kind: 'wardrobe', x: 35, y: 3, width: 12, height: 11 },
  { id: 'sofa', label: '沙发', kind: 'sofa', x: 65, y: 5, width: 27, height: 11 },
  { id: 'table', label: '茶几', kind: 'table', x: 70, y: 23, width: 15, height: 10 },
  { id: 'toybox', label: '玩具箱', kind: 'toybox', x: 82, y: 47, width: 12, height: 10 },
  { id: 'dresser', label: '矮柜', kind: 'dresser', x: 34, y: 49, width: 18, height: 9 },
];

const pacifierSpawns: Point[] = [
  { x: 55, y: 8 },
  { x: 90, y: 35 },
  { x: 59, y: 55 },
  { x: 24, y: 35 },
  { x: 50, y: 28 },
];

const adultSpawns: Point[] = [
  { x: 55, y: 18 },
  { x: 91, y: 28 },
  { x: 58, y: 45 },
];

const propSpawns: Array<Point & { kind: PropKind }> = [
  { x: 31, y: 22, kind: 'rattle' },
  { x: 91, y: 42, kind: 'duck' },
  { x: 60, y: 37, kind: 'ball' },
];

const playerSpeed = 18;
const adultPatrolSpeed = 5.2;
const adultChaseSpeed = 11.4;
const adultVisionDistance = 29;
const captureDistance = playerRadius + adultRadius;

export function createInitialState(random: () => number = Math.random): GameState {
  const adultCount = random() < 0.48 ? 1 : 2;
  const shuffledAdults = [...adultSpawns].sort(() => random() - 0.5);
  const pacifier = pacifierSpawns[Math.floor(random() * pacifierSpawns.length)] ?? pacifierSpawns[0];

  return {
    status: 'running',
    player: { ...cribPoint },
    adults: shuffledAdults.slice(0, adultCount).map((point, index) => ({
      id: index + 1,
      ...point,
      angle: random() * Math.PI * 2,
      mood: 'patrol',
      target: randomWalkTarget(random),
      distractedMs: 0,
      stunnedMs: 0,
    })),
    pacifier: { ...pacifier },
    effects: [],
    props: propSpawns.map((prop, index) => ({ ...prop, id: index + 1, collected: false })),
    heldProp: null,
    cooldowns: { poop: 0, pee: 0 },
    remainingMs: gameDurationMs,
    captures: 0,
    nextEffectId: 1,
    message: '奶嘴就在房间里。轻一点，别让大人看见！',
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
  const remainingMs = Math.max(0, state.remainingMs - safeDelta);
  const player = moveCircle(
    state.player,
    normalize(input),
    playerSpeed * deltaSeconds,
    playerRadius,
  );
  const effects = state.effects
    .map((effect) => ({ ...effect, remainingMs: effect.remainingMs - safeDelta }))
    .filter((effect) => effect.remainingMs > 0);
  const cooldowns = {
    poop: Math.max(0, state.cooldowns.poop - safeDelta),
    pee: Math.max(0, state.cooldowns.pee - safeDelta),
  };

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
    const nextAdult = advanceAdult(adult, player, effects, safeDelta, random);
    if (distance(nextAdult, player) <= captureDistance && nextAdult.stunnedMs <= 0) {
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
      heldProp,
      cooldowns,
      remainingMs: 0,
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
      heldProp,
      cooldowns,
      remainingMs,
      status: 'won',
      message: '找到了！终于可以安心睡觉啦。',
    };
  }

  if (captured) {
    return {
      ...state,
      player: { ...cribPoint },
      adults: adults.map((adult) => ({
        ...adult,
        mood: 'patrol',
        target: randomWalkTarget(random),
      })),
      effects,
      props,
      heldProp,
      cooldowns,
      remainingMs: Math.max(0, remainingMs - 5_000),
      captures: state.captures + 1,
      message: '被捉住了！回到摇篮，并损失 5 秒。',
    };
  }

  return {
    ...state,
    player,
    adults,
    effects,
    props,
    heldProp,
    cooldowns,
    remainingMs,
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

export function hasLineOfSight(from: Point, to: Point) {
  return !furniture.some((item) => segmentIntersectsRect(from, to, expandRect(item, 0.8)));
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

function advanceAdult(
  adult: Adult,
  player: Point,
  effects: FloorEffect[],
  deltaMs: number,
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

  const seesPlayer = distance(next, player) <= adultVisionDistance && hasLineOfSight(next, player);
  if (seesPlayer) {
    next = { ...next, mood: 'chasing', target: { ...player }, distractedMs: 0 };
  } else if (next.distractedMs > 0) {
    next = { ...next, mood: 'distracted' };
  } else if (next.mood !== 'patrol' || distance(next, next.target) < 2.5) {
    next = { ...next, mood: 'patrol', target: randomWalkTarget(random) };
  }

  let speed = next.mood === 'chasing' ? adultChaseSpeed : adultPatrolSpeed;
  const poopNearby = effects.some((effect) => effect.kind === 'poop' && distance(effect, next) < 7);
  if (poopNearby) speed *= 0.55;

  const direction = normalize({ x: next.target.x - next.x, y: next.target.y - next.y });
  const moved = moveCircle(next, direction, speed * deltaSeconds, adultRadius);

  return {
    ...next,
    ...moved,
    angle: Math.atan2(direction.y, direction.x),
  };
}

function moveCircle(point: Point, direction: Point, amount: number, radius: number): Point {
  const proposedX = clamp(point.x + direction.x * amount, radius, roomWidth - radius);
  const proposedY = clamp(point.y + direction.y * amount, radius, roomHeight - radius);

  const xOnly = { x: proposedX, y: point.y };
  const afterX = collidesFurniture(xOnly, radius) ? point : xOnly;
  const yOnly = { x: afterX.x, y: proposedY };
  return collidesFurniture(yOnly, radius) ? afterX : yOnly;
}

function collidesFurniture(point: Point, radius: number) {
  return furniture.some((item) => (
    point.x + radius > item.x
    && point.x - radius < item.x + item.width
    && point.y + radius > item.y
    && point.y - radius < item.y + item.height
  ));
}

function randomWalkTarget(random: () => number): Point {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const point = { x: 5 + random() * 90, y: 4 + random() * 56 };
    if (!collidesFurniture(point, adultRadius)) return point;
  }
  return { x: 56, y: 34 };
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
