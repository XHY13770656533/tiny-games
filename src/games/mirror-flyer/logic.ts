export type WorldSide = 'top' | 'bottom';
export type RunnerRole = 'entity' | 'shadow';
export type ObstacleType = 'barrier' | 'phaseGate';
export type GameStatus = 'ready' | 'running' | 'crashed';

export type Obstacle = {
  id: number;
  side: WorldSide;
  type: ObstacleType;
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
  elapsedMs: number;
  score: number;
  speed: number;
  crash: CrashInfo | null;
};

export const runnerX = 18;
export const runnerWidth = 5.8;
export const jumpDurationMs = 780;
export const obstacleStartX = 106;
export const obstacleWidth = 5.6;
export const normalClearance = 0.56;

const baseSpeed = 0.022;
const maxSpeed = 0.038;
const speedRampPerMs = 0.0000007;
const minSpawnDelayMs = 1040;
const maxSpawnDelayMs = 1680;

export function createInitialState(): MirrorFlyerState {
  return {
    status: 'ready',
    realSide: 'top',
    jumpElapsedMs: null,
    obstacles: [],
    nextObstacleId: 1,
    spawnInMs: 650,
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

export function advanceRun(
  state: MirrorFlyerState,
  deltaMs: number,
  random: () => number = Math.random,
): MirrorFlyerState {
  if (state.status !== 'running') {
    return state;
  }

  const elapsedMs = state.elapsedMs + deltaMs;
  const speed = Math.min(maxSpeed, baseSpeed + elapsedMs * speedRampPerMs);
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

  const nextState: MirrorFlyerState = {
    ...state,
    jumpElapsedMs,
    obstacles,
    nextObstacleId,
    spawnInMs,
    elapsedMs,
    score: Math.floor(elapsedMs / 100),
    speed,
  };
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
  return Math.sin(progress * Math.PI);
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

function getSpawnDelay(elapsedMs: number, random: () => number) {
  const pressure = Math.min(1, elapsedMs / 90000);
  const maxDelay = maxSpawnDelayMs - pressure * 330;
  const minDelay = minSpawnDelayMs - pressure * 220;
  return minDelay + random() * (maxDelay - minDelay);
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
  const runnerLeft = runnerX - runnerWidth / 2;
  const runnerRight = runnerX + runnerWidth / 2;
  return obstacle.x < runnerRight && obstacle.x + obstacle.width > runnerLeft;
}
