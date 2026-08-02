export type WorldSide = 'top' | 'bottom';
export type RunnerRole = 'entity' | 'shadow';
export type ObstacleType = 'barrier' | 'phaseGate';
export type PickupType = 'coin' | 'shadowEnergy';
export type GameStatus = 'ready' | 'running' | 'crashed';

export type Obstacle = {
  id: number;
  side: WorldSide;
  type: ObstacleType;
  x: number;
  width: number;
};

export type Pickup = {
  id: number;
  side: WorldSide;
  type: PickupType;
  x: number;
  width: number;
};

export type CrashInfo = {
  obstacleId: number;
  side: WorldSide;
  role: RunnerRole;
  type: ObstacleType;
  message: string;
};

export type MirrorFlyerState = {
  status: GameStatus;
  realSide: WorldSide;
  jumpElapsedMs: number | null;
  obstacles: Obstacle[];
  nextObstacleId: number;
  spawnInMs: number;
  pickups: Pickup[];
  nextPickupId: number;
  spawnPickupInMs: number;
  coins: number;
  coinBonus: number;
  shadowEnergy: number;
  dashRemainingMs: number;
  elapsedMs: number;
  score: number;
  speed: number;
  crash: CrashInfo | null;
};

export const runnerX = 18;
export const runnerHitboxWidth = 4.2;
export const obstacleHitboxInset = 1.25;
export const pickupHitboxInset = 0.55;
export const jumpDurationMs = 880;
export const obstacleStartX = 106;
export const obstacleWidth = 5.6;
export const pickupStartX = 108;
export const pickupWidth = 3.4;
export const normalClearance = 0.38;
export const maxShadowEnergy = 100;
export const energyPerPickup = 25;
export const coinScoreBonus = 18;
export const dashDurationMs = 2400;
export const dashSpeedMultiplier = 1.72;

const baseSpeed = 0.014;
const maxSpeed = 0.04;
const speedRampPerMs = 0.00000036;
const minSpawnDelayMs = 1180;
const maxSpawnDelayMs = 1880;
const minPickupSpawnDelayMs = 780;
const maxPickupSpawnDelayMs = 1560;

export function createInitialState(): MirrorFlyerState {
  return {
    status: 'ready',
    realSide: 'top',
    jumpElapsedMs: null,
    obstacles: [],
    nextObstacleId: 1,
    spawnInMs: 650,
    pickups: [],
    nextPickupId: 1,
    spawnPickupInMs: 420,
    coins: 0,
    coinBonus: 0,
    shadowEnergy: 0,
    dashRemainingMs: 0,
    elapsedMs: 0,
    score: 0,
    speed: baseSpeed,
    crash: null,
  };
}

export function startRun(): MirrorFlyerState {
  return {
    ...createInitialState(),
    status: 'running',
  };
}

export function requestJump(state: MirrorFlyerState): MirrorFlyerState {
  if (state.status !== 'running' || state.jumpElapsedMs !== null) {
    return state;
  }

  return {
    ...state,
    jumpElapsedMs: 0,
  };
}

export function flipWorld(state: MirrorFlyerState): MirrorFlyerState {
  if (state.status !== 'running') {
    return state;
  }

  return {
    ...state,
    realSide: getOppositeSide(state.realSide),
  };
}

export function requestDash(state: MirrorFlyerState): MirrorFlyerState {
  if (state.status !== 'running' || !canTriggerDash(state)) {
    return state;
  }

  return {
    ...state,
    shadowEnergy: 0,
    dashRemainingMs: dashDurationMs,
  };
}

export function canTriggerDash(state: MirrorFlyerState): boolean {
  return (
    state.status === 'running'
    && state.shadowEnergy >= maxShadowEnergy
    && state.dashRemainingMs <= 0
  );
}

export function isDashing(state: MirrorFlyerState): boolean {
  return state.dashRemainingMs > 0;
}

export function getShadowEnergyRatio(shadowEnergy: number): number {
  return Math.min(1, Math.max(0, shadowEnergy / maxShadowEnergy));
}

export function advanceRun(
  state: MirrorFlyerState,
  deltaMs: number,
  random: () => number = Math.random,
): MirrorFlyerState {
  if (state.status !== 'running') {
    return state;
  }

  const elapsedMs = state.elapsedMs + deltaMs;
  const dashRemainingMs = Math.max(0, state.dashRemainingMs - deltaMs);
  const dashing = dashRemainingMs > 0;
  const baseRunSpeed = Math.min(maxSpeed, baseSpeed + elapsedMs * speedRampPerMs);
  const speed = dashing ? baseRunSpeed * dashSpeedMultiplier : baseRunSpeed;
  const jumpElapsedMs = updateJumpElapsed(state.jumpElapsedMs, deltaMs);
  const movedObstacles = state.obstacles
    .map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - speed * deltaMs,
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -8);

  let obstacles = movedObstacles;
  let spawnInMs = state.spawnInMs - deltaMs;
  let nextObstacleId = state.nextObstacleId;

  while (spawnInMs <= 0) {
    obstacles = [...obstacles, createObstacle(nextObstacleId, random)];
    nextObstacleId += 1;
    spawnInMs += getSpawnDelay(elapsedMs, random);
  }

  const movedPickups = state.pickups
    .map((pickup) => ({
      ...pickup,
      x: pickup.x - speed * deltaMs,
    }))
    .filter((pickup) => pickup.x + pickup.width > -8);

  let pickups = movedPickups;
  let spawnPickupInMs = state.spawnPickupInMs - deltaMs;
  let nextPickupId = state.nextPickupId;

  while (spawnPickupInMs <= 0) {
    pickups = [...pickups, createPickup(nextPickupId, random)];
    nextPickupId += 1;
    spawnPickupInMs += getPickupSpawnDelay(elapsedMs, random);
  }

  const collection = collectPickups(pickups, state.realSide);
  const coins = state.coins + collection.coinsCollected;
  const coinBonus = state.coinBonus + collection.coinsCollected * coinScoreBonus;
  const shadowEnergy = Math.min(
    maxShadowEnergy,
    state.shadowEnergy + collection.energyCollected * energyPerPickup,
  );

  const nextState: MirrorFlyerState = {
    ...state,
    jumpElapsedMs,
    obstacles,
    nextObstacleId,
    spawnInMs,
    pickups: collection.remainingPickups,
    nextPickupId,
    spawnPickupInMs,
    coins,
    coinBonus,
    shadowEnergy,
    dashRemainingMs,
    elapsedMs,
    score: Math.floor(elapsedMs / 100) + coinBonus,
    speed,
  };

  if (dashing) {
    return nextState;
  }

  const crash = detectCrash(nextState);

  if (!crash) {
    return nextState;
  }

  return {
    ...nextState,
    status: 'crashed',
    crash,
  };
}

export function getJumpHeight(jumpElapsedMs: number | null): number {
  if (jumpElapsedMs === null) {
    return 0;
  }

  const progress = Math.min(1, Math.max(0, jumpElapsedMs / jumpDurationMs));
  return Math.sin(progress * Math.PI) ** 0.72;
}

export function getRoleForSide(realSide: WorldSide, side: WorldSide): RunnerRole {
  return realSide === side ? 'entity' : 'shadow';
}

export function getOppositeSide(side: WorldSide): WorldSide {
  return side === 'top' ? 'bottom' : 'top';
}

function updateJumpElapsed(jumpElapsedMs: number | null, deltaMs: number) {
  if (jumpElapsedMs === null) {
    return null;
  }

  const nextJumpElapsedMs = jumpElapsedMs + deltaMs;
  return nextJumpElapsedMs >= jumpDurationMs ? null : nextJumpElapsedMs;
}

function createObstacle(id: number, random: () => number): Obstacle {
  return {
    id,
    side: random() < 0.5 ? 'top' : 'bottom',
    type: random() < 0.3 ? 'phaseGate' : 'barrier',
    x: obstacleStartX,
    width: obstacleWidth,
  };
}

function createPickup(id: number, random: () => number): Pickup {
  return {
    id,
    side: random() < 0.5 ? 'top' : 'bottom',
    type: random() < 0.55 ? 'coin' : 'shadowEnergy',
    x: pickupStartX,
    width: pickupWidth,
  };
}

function getSpawnDelay(elapsedMs: number, random: () => number) {
  const pressure = Math.min(1, elapsedMs / 90000);
  const maxDelay = maxSpawnDelayMs - pressure * 330;
  const minDelay = minSpawnDelayMs - pressure * 220;
  return minDelay + random() * (maxDelay - minDelay);
}

function getPickupSpawnDelay(elapsedMs: number, random: () => number) {
  const pressure = Math.min(1, elapsedMs / 75000);
  const maxDelay = maxPickupSpawnDelayMs - pressure * 280;
  const minDelay = minPickupSpawnDelayMs - pressure * 180;
  return minDelay + random() * (maxDelay - minDelay);
}

function collectPickups(pickups: Pickup[], realSide: WorldSide) {
  let coinsCollected = 0;
  let energyCollected = 0;
  const remainingPickups: Pickup[] = [];

  for (const pickup of pickups) {
    if (!isRunnerOverlappingPickup(pickup)) {
      remainingPickups.push(pickup);
      continue;
    }

    const role = getRoleForSide(realSide, pickup.side);

    if (pickup.type === 'coin' && role === 'entity') {
      coinsCollected += 1;
      continue;
    }

    if (pickup.type === 'shadowEnergy' && role === 'shadow') {
      energyCollected += 1;
      continue;
    }

    remainingPickups.push(pickup);
  }

  return {
    remainingPickups,
    coinsCollected,
    energyCollected,
  };
}

function detectCrash(state: MirrorFlyerState): CrashInfo | null {
  const jumpHeight = getJumpHeight(state.jumpElapsedMs);

  for (const obstacle of state.obstacles) {
    if (!isRunnerOverlapping(obstacle)) {
      continue;
    }

    const role = getRoleForSide(state.realSide, obstacle.side);

    if (obstacle.type === 'phaseGate') {
      if (role === 'entity') {
        return {
          obstacleId: obstacle.id,
          side: obstacle.side,
          role,
          type: obstacle.type,
          message: '实体撞上相位门。让影子经过这类障碍，或在接近前翻转世界。',
        };
      }

      continue;
    }

    if (jumpHeight < normalClearance) {
      return {
        obstacleId: obstacle.id,
        side: obstacle.side,
        role,
        type: obstacle.type,
        message: role === 'entity'
          ? '实体碰到路障。提前跳跃，让实体和影子一起越过普通障碍。'
          : '影子碰到镜像路障。你的跳跃会被同步镜像，也要照顾下方路线。',
      };
    }
  }

  return null;
}

function isRunnerOverlapping(obstacle: Obstacle) {
  return isHorizontalOverlap(
    obstacle.x,
    obstacle.width,
    obstacleHitboxInset,
  );
}

function isRunnerOverlappingPickup(pickup: Pickup) {
  return isHorizontalOverlap(
    pickup.x,
    pickup.width,
    pickupHitboxInset,
  );
}

function isHorizontalOverlap(x: number, width: number, inset: number) {
  const runnerLeft = runnerX - runnerHitboxWidth / 2;
  const runnerRight = runnerX + runnerHitboxWidth / 2;
  const left = x + inset;
  const right = x + width - inset;

  return left < runnerRight && right > runnerLeft;
}
