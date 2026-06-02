export type AnimalId = number;

export type Sheep = {
  id: AnimalId;
  x: number;
  y: number;
  wanderAngle: number;
  breedChargeMs: number;
  isSafe: boolean;
};

export type Wolf = {
  id: AnimalId;
  x: number;
  y: number;
  wanderAngle: number;
  hungerMs: number;
};

export type EcosystemStatus = 'running' | 'paused';

export type EcosystemState = {
  status: EcosystemStatus;
  elapsedMs: number;
  nextAnimalId: AnimalId;
  sheep: Sheep[];
  wolves: Wolf[];
  sheepBorn: number;
  sheepEaten: number;
  wolvesBorn: number;
  wolvesStarved: number;
  wolvesKilledByPlayer: number;
  eventLog: string[];
};

export const meadowWidth = 100;
export const meadowHeight = 68;
export const safeRadius = 18;
export const sheepReproductionMs = 6200;
export const wolfStarveMs = 11500;
export const initialSheepCount = 18;
export const initialWolfCount = 4;
export const maxSheepCount = 82;
export const maxWolfCount = 24;

const sheepWanderSpeed = 3.7;
const sheepFleeSpeed = 9.4;
const wolfChaseSpeed = 12.6;
const wolfPatrolSpeed = 5.2;
const fleeRadius = 24;
const eatDistance = 2.8;
const maxEventLogItems = 7;
const newbornSpread = 3.8;

export function createInitialState(random: () => number = Math.random): EcosystemState {
  let nextAnimalId = 1;
  const sheep: Sheep[] = [];
  const wolves: Wolf[] = [];

  for (let index = 0; index < initialSheepCount; index += 1) {
    sheep.push(createSheep(nextAnimalId, randomPoint(random), random));
    nextAnimalId += 1;
  }

  for (let index = 0; index < initialWolfCount; index += 1) {
    wolves.push(createWolf(nextAnimalId, randomPoint(random), random));
    nextAnimalId += 1;
  }

  return {
    status: 'running',
    elapsedMs: 0,
    nextAnimalId,
    sheep,
    wolves,
    sheepBorn: 0,
    sheepEaten: 0,
    wolvesBorn: 0,
    wolvesStarved: 0,
    wolvesKilledByPlayer: 0,
    eventLog: ['生态模拟开始：羊会在安全时繁殖，狼会追逐并捕食羊。'],
  };
}

export function advanceEcosystem(
  state: EcosystemState,
  deltaMs: number,
  random: () => number = Math.random,
): EcosystemState {
  if (state.status !== 'running') {
    return state;
  }

  const elapsedMs = state.elapsedMs + deltaMs;
  const deltaSeconds = deltaMs / 1000;
  let nextAnimalId = state.nextAnimalId;
  const events: string[] = [];

  const updatedSheep: Sheep[] = [];
  let sheepBornThisFrame = 0;

  for (const sheep of state.sheep) {
    const movedSheep = moveSheep(sheep, state.wolves, deltaSeconds, random);
    let sheepAfterBreeding = movedSheep;

    if (
      movedSheep.isSafe
      && movedSheep.breedChargeMs >= sheepReproductionMs
      && state.sheep.length + sheepBornThisFrame < maxSheepCount
    ) {
      sheepAfterBreeding = {
        ...movedSheep,
        breedChargeMs: movedSheep.breedChargeMs - sheepReproductionMs,
      };
      updatedSheep.push(createSheep(nextAnimalId, nearbyPoint(movedSheep, random), random));
      nextAnimalId += 1;
      sheepBornThisFrame += 1;
    }

    updatedSheep.push(sheepAfterBreeding);
  }

  const eatenSheepIds = new Set<AnimalId>();
  const updatedWolves: Wolf[] = [];
  let sheepEatenThisFrame = 0;
  let wolvesBornThisFrame = 0;
  let wolvesStarvedThisFrame = 0;

  for (const wolf of state.wolves) {
    const availableSheep = updatedSheep.filter((sheep) => !eatenSheepIds.has(sheep.id));
    const movedWolf = moveWolf(wolf, availableSheep, deltaSeconds, deltaMs, random);
    const caughtSheep = findNearestSheep(movedWolf, availableSheep);
    let wolfAfterHunt = movedWolf;

    if (caughtSheep && caughtSheep.distance <= eatDistance) {
      eatenSheepIds.add(caughtSheep.item.id);
      sheepEatenThisFrame += 1;
      wolfAfterHunt = {
        ...movedWolf,
        hungerMs: 0,
      };

      if (state.wolves.length + wolvesBornThisFrame < maxWolfCount) {
        updatedWolves.push(createWolf(nextAnimalId, nearbyPoint(wolfAfterHunt, random), random));
        nextAnimalId += 1;
        wolvesBornThisFrame += 1;
      }
    }

    if (wolfAfterHunt.hungerMs >= wolfStarveMs) {
      wolvesStarvedThisFrame += 1;
      continue;
    }

    updatedWolves.push(wolfAfterHunt);
  }

  const survivingSheep = updatedSheep.filter((sheep) => !eatenSheepIds.has(sheep.id));

  if (sheepBornThisFrame > 0) {
    events.push(`${sheepBornThisFrame} 只安全的小羊出生。`);
  }

  if (sheepEatenThisFrame > 0) {
    events.push(`${sheepEatenThisFrame} 只羊被狼吃掉，狼群添了 ${wolvesBornThisFrame} 只新狼。`);
  }

  if (wolvesStarvedThisFrame > 0) {
    events.push(`${wolvesStarvedThisFrame} 只狼因为太久没有捕食而饿死。`);
  }

  return {
    ...state,
    elapsedMs,
    nextAnimalId,
    sheep: survivingSheep,
    wolves: updatedWolves,
    sheepBorn: state.sheepBorn + sheepBornThisFrame,
    sheepEaten: state.sheepEaten + sheepEatenThisFrame,
    wolvesBorn: state.wolvesBorn + wolvesBornThisFrame,
    wolvesStarved: state.wolvesStarved + wolvesStarvedThisFrame,
    eventLog: addEvents(state.eventLog, elapsedMs, events),
  };
}

export function killRandomWolf(
  state: EcosystemState,
  random: () => number = Math.random,
): EcosystemState {
  if (state.wolves.length === 0) {
    return state;
  }

  const killedIndex = Math.floor(random() * state.wolves.length);
  const wolves = state.wolves.filter((_, index) => index !== killedIndex);

  return {
    ...state,
    wolves,
    wolvesKilledByPlayer: state.wolvesKilledByPlayer + 1,
    eventLog: addEvents(state.eventLog, state.elapsedMs, ['玩家随机清除了一只狼。']),
  };
}

export function setEcosystemStatus(
  state: EcosystemState,
  status: EcosystemStatus,
): EcosystemState {
  if (state.status === status) {
    return state;
  }

  return {
    ...state,
    status,
  };
}

export function getSafeSheepCount(sheep: Sheep[]) {
  return sheep.filter((item) => item.isSafe).length;
}

export function getEcosystemMood(state: EcosystemState) {
  if (state.sheep.length === 0) {
    return '羊群已经灭绝，剩余狼会陆续饿死。';
  }

  if (state.wolves.length === 0) {
    return '狼群已被清空，羊群会快速繁殖。';
  }

  const ratio = state.sheep.length / state.wolves.length;

  if (ratio < 2.2) {
    return '狼偏多，羊群压力很大。';
  }

  if (ratio > 8) {
    return '羊偏多，可以少量保留狼来控制数量。';
  }

  return '生态暂时平衡，继续观察数量变化。';
}

function moveSheep(
  sheep: Sheep,
  wolves: Wolf[],
  deltaSeconds: number,
  random: () => number,
): Sheep {
  const nearestWolf = findNearestWolf(sheep, wolves);
  const isSafe = !nearestWolf || nearestWolf.distance > safeRadius;
  const isFleeing = Boolean(nearestWolf && nearestWolf.distance < fleeRadius);
  const targetAngle = nearestWolf
    ? Math.atan2(sheep.y - nearestWolf.item.y, sheep.x - nearestWolf.item.x)
    : sheep.wanderAngle;
  const wanderAngle = isFleeing
    ? targetAngle + (random() - 0.5) * 0.28
    : sheep.wanderAngle + (random() - 0.5) * 0.75 * deltaSeconds;
  const speed = isFleeing ? sheepFleeSpeed : sheepWanderSpeed;
  const moved = moveWithinBounds(sheep, wanderAngle, speed * deltaSeconds);

  return {
    ...sheep,
    ...moved,
    breedChargeMs: isSafe
      ? Math.min(sheepReproductionMs * 1.15, sheep.breedChargeMs + deltaSeconds * 1000)
      : Math.max(0, sheep.breedChargeMs - deltaSeconds * 1450),
    isSafe,
  };
}

function moveWolf(
  wolf: Wolf,
  sheep: Sheep[],
  deltaSeconds: number,
  deltaMs: number,
  random: () => number,
): Wolf {
  const targetSheep = findNearestSheep(wolf, sheep);
  const angle = targetSheep
    ? Math.atan2(targetSheep.item.y - wolf.y, targetSheep.item.x - wolf.x)
    : wolf.wanderAngle + (random() - 0.5) * 0.9 * deltaSeconds;
  const speed = targetSheep ? wolfChaseSpeed : wolfPatrolSpeed;
  const moved = moveWithinBounds(wolf, angle, speed * deltaSeconds);

  return {
    ...wolf,
    ...moved,
    hungerMs: wolf.hungerMs + deltaMs,
  };
}

function moveWithinBounds(
  animal: Pick<Sheep | Wolf, 'x' | 'y' | 'wanderAngle'>,
  angle: number,
  distance: number,
) {
  let x = animal.x + Math.cos(angle) * distance;
  let y = animal.y + Math.sin(angle) * distance;
  let wanderAngle = angle;

  if (x < 2 || x > meadowWidth - 2) {
    x = clamp(x, 2, meadowWidth - 2);
    wanderAngle = Math.PI - wanderAngle;
  }

  if (y < 2 || y > meadowHeight - 2) {
    y = clamp(y, 2, meadowHeight - 2);
    wanderAngle = -wanderAngle;
  }

  return { x, y, wanderAngle };
}

function createSheep(id: AnimalId, point: Point, random: () => number): Sheep {
  return {
    id,
    x: point.x,
    y: point.y,
    wanderAngle: randomAngle(random),
    breedChargeMs: random() * sheepReproductionMs * 0.55,
    isSafe: true,
  };
}

function createWolf(id: AnimalId, point: Point, random: () => number): Wolf {
  return {
    id,
    x: point.x,
    y: point.y,
    wanderAngle: randomAngle(random),
    hungerMs: random() * wolfStarveMs * 0.35,
  };
}

type Point = {
  x: number;
  y: number;
};

function randomPoint(random: () => number): Point {
  return {
    x: 8 + random() * (meadowWidth - 16),
    y: 8 + random() * (meadowHeight - 16),
  };
}

function nearbyPoint(point: Point, random: () => number): Point {
  return {
    x: clamp(point.x + (random() - 0.5) * newbornSpread * 2, 3, meadowWidth - 3),
    y: clamp(point.y + (random() - 0.5) * newbornSpread * 2, 3, meadowHeight - 3),
  };
}

function findNearestWolf(point: Point, wolves: Wolf[]) {
  return findNearest(point, wolves);
}

function findNearestSheep(point: Point, sheep: Sheep[]) {
  return findNearest(point, sheep);
}

function findNearest<T extends Point>(point: Point, items: T[]) {
  let nearest: { item: T; distance: number } | null = null;

  for (const item of items) {
    const distance = getDistance(point, item);

    if (!nearest || distance < nearest.distance) {
      nearest = { item, distance };
    }
  }

  return nearest;
}

function getDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomAngle(random: () => number) {
  return random() * Math.PI * 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function addEvents(eventLog: string[], elapsedMs: number, events: string[]) {
  if (events.length === 0) {
    return eventLog;
  }

  const stampedEvents = events.map((event) => `${formatElapsedTime(elapsedMs)} ${event}`);
  return [...stampedEvents, ...eventLog].slice(0, maxEventLogItems);
}

export function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
