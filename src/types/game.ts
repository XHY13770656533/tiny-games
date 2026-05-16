export type GameCategory = 'strategy' | 'puzzle' | 'reflex' | 'casual';
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'available' | 'planned';

export type GameMeta = {
  id: string;
  title: string;
  description: string;
  path: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  status: GameStatus;
  tags: string[];
  accentColor: string;
};

export const categoryLabels: Record<GameCategory, string> = {
  strategy: '策略',
  puzzle: '益智',
  reflex: '反应',
  casual: '休闲',
};

export const difficultyLabels: Record<GameDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export const statusLabels: Record<GameStatus, string> = {
  available: '可玩',
  planned: '规划中',
};
