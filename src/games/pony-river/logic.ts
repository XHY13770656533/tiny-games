export type RiverChallenge = {
  id: number;
  depth: number;
  reward: number;
};

export type AttemptRecord = {
  riverId: number;
  fedFodder: number;
  ponyHeight: number;
  riverDepth: number;
  reward: number;
  success: boolean;
};

export type PonyRiverStatus = 'playing' | 'won' | 'lost';

export type PonyRiverGameState = {
  rivers: RiverChallenge[];
  currentRiverIndex: number;
  fodder: number;
  status: PonyRiverStatus;
  history: AttemptRecord[];
};

export type LevelConfig = {
  riverCount: number;
  initialFodder: number;
  baseHeight: number;
  minDepth: number;
  maxDepth: number;
  maxReward: number;
};

export const defaultLevelConfig: LevelConfig = {
  riverCount: 8,
  initialFodder: 16,
  baseHeight: 1,
  minDepth: 2,
  maxDepth: 7,
  maxReward: 3,
};

function randomInt(min: number, max: number, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function createRiverChallenges(
  config: LevelConfig = defaultLevelConfig,
  random = Math.random,
): RiverChallenge[] {
  return Array.from({ length: config.riverCount }, (_, index) => ({
    id: index + 1,
    depth: randomInt(config.minDepth, config.maxDepth, random),
    reward: randomInt(0, config.maxReward, random),
  }));
}

export function createInitialState(
  config: LevelConfig = defaultLevelConfig,
  random = Math.random,
): PonyRiverGameState {
  return {
    rivers: createRiverChallenges(config, random),
    currentRiverIndex: 0,
    fodder: config.initialFodder,
    status: 'playing',
    history: [],
  };
}

export function getRemainingRiverCount(state: PonyRiverGameState) {
  return Math.max(0, state.rivers.length - state.currentRiverIndex);
}

export function getCurrentRiver(state: PonyRiverGameState) {
  return state.rivers[state.currentRiverIndex] ?? null;
}

export function getPonyHeight(baseHeight: number, fedFodder: number) {
  return baseHeight + fedFodder;
}

export function canCrossRiver(ponyHeight: number, riverDepth: number) {
  return ponyHeight >= riverDepth;
}

export function clampFeedAmount(value: number, availableFodder: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.floor(value), 0), Math.max(0, availableFodder));
}

export function attemptCurrentRiver(
  state: PonyRiverGameState,
  fedFodder: number,
  config: LevelConfig = defaultLevelConfig,
): PonyRiverGameState {
  if (state.status !== 'playing') {
    return state;
  }

  const currentRiver = getCurrentRiver(state);
  if (!currentRiver) {
    return { ...state, status: 'won' };
  }

  const safeFedFodder = clampFeedAmount(fedFodder, state.fodder);
  const ponyHeight = getPonyHeight(config.baseHeight, safeFedFodder);
  const success = canCrossRiver(ponyHeight, currentRiver.depth);
  const record: AttemptRecord = {
    riverId: currentRiver.id,
    fedFodder: safeFedFodder,
    ponyHeight,
    riverDepth: currentRiver.depth,
    reward: success ? currentRiver.reward : 0,
    success,
  };

  if (!success) {
    return {
      ...state,
      fodder: state.fodder - safeFedFodder,
      status: 'lost',
      history: [record, ...state.history],
    };
  }

  const nextRiverIndex = state.currentRiverIndex + 1;
  return {
    ...state,
    currentRiverIndex: nextRiverIndex,
    fodder: state.fodder - safeFedFodder + currentRiver.reward,
    status: nextRiverIndex >= state.rivers.length ? 'won' : 'playing',
    history: [record, ...state.history],
  };
}
