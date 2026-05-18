export type IngredientId = 'espresso' | 'milk' | 'foam' | 'water' | 'chocolate' | 'syrup';

export type Ingredient = {
  id: IngredientId;
  name: string;
  shortName: string;
  description: string;
  color: string;
};

export type IngredientAmounts = Record<IngredientId, number>;

export type ArtPatternId = 'heart' | 'rosetta' | 'tulip';

export type StrokePoint = {
  x: number;
  y: number;
};

export type LatteArtTemplate = {
  id: ArtPatternId;
  name: string;
  description: string;
  points: StrokePoint[];
};

export type CoffeeRecipe = {
  id: string;
  name: string;
  customer: string;
  request: string;
  hint: string;
  target: IngredientAmounts;
  artPattern?: ArtPatternId;
};

export type IngredientScoreDetail = {
  id: IngredientId;
  targetPercent: number;
  actualPercent: number;
  diff: number;
};

export type IngredientScore = {
  score: number;
  ratioScore: number;
  volumeScore: number;
  totalAmount: number;
  details: IngredientScoreDetail[];
};

export type LatteArtScore = {
  required: boolean;
  score: number;
  distance: number;
  message: string;
};

export type OrderScore = {
  finalScore: number;
  ingredientScore: IngredientScore;
  artScore: LatteArtScore;
  title: string;
  message: string;
};

export const targetDrinkAmount = 100;
export const maxDrinkAmount = 140;
export const ingredientStep = 5;

export const ingredients: Ingredient[] = [
  {
    id: 'espresso',
    name: '浓缩咖啡',
    shortName: '浓缩',
    description: '提供咖啡主体和苦甜香气，是多数配方的基底。',
    color: '#7c2d12',
  },
  {
    id: 'milk',
    name: '蒸汽牛奶',
    shortName: '牛奶',
    description: '让口感变得顺滑，也会稀释咖啡强度。',
    color: '#fef3c7',
  },
  {
    id: 'foam',
    name: '奶泡',
    shortName: '奶泡',
    description: '形成轻盈顶部，并为拉花提供白色纹理。',
    color: '#fff7ed',
  },
  {
    id: 'water',
    name: '热水',
    shortName: '热水',
    description: '拉长杯量，适合美式和清爽口感。',
    color: '#bae6fd',
  },
  {
    id: 'chocolate',
    name: '巧克力酱',
    shortName: '巧克力',
    description: '带来摩卡风味，过量会压住咖啡香。',
    color: '#92400e',
  },
  {
    id: 'syrup',
    name: '风味糖浆',
    shortName: '糖浆',
    description: '补充甜感和香气，少量即可改变整体平衡。',
    color: '#f59e0b',
  },
];

export const ingredientIds = ingredients.map((ingredient) => ingredient.id);

export const emptyAmounts: IngredientAmounts = {
  espresso: 0,
  milk: 0,
  foam: 0,
  water: 0,
  chocolate: 0,
  syrup: 0,
};

export const latteArtTemplates: Record<ArtPatternId, LatteArtTemplate> = {
  heart: {
    id: 'heart',
    name: '爱心',
    description: '从杯底中心起笔，绕出左右两瓣后收回尖端。',
    points: [
      { x: 50, y: 74 },
      { x: 35, y: 62 },
      { x: 29, y: 44 },
      { x: 38, y: 31 },
      { x: 50, y: 40 },
      { x: 62, y: 31 },
      { x: 71, y: 44 },
      { x: 65, y: 62 },
      { x: 50, y: 74 },
    ],
  },
  rosetta: {
    id: 'rosetta',
    name: '树叶',
    description: '左右摆动形成叶片，最后从中线向上收笔。',
    points: [
      { x: 50, y: 78 },
      { x: 37, y: 68 },
      { x: 63, y: 61 },
      { x: 36, y: 54 },
      { x: 64, y: 47 },
      { x: 37, y: 40 },
      { x: 62, y: 33 },
      { x: 50, y: 24 },
    ],
  },
  tulip: {
    id: 'tulip',
    name: '郁金香',
    description: '连续推入三层花瓣，再用中心线把花瓣串起。',
    points: [
      { x: 50, y: 76 },
      { x: 34, y: 61 },
      { x: 50, y: 49 },
      { x: 66, y: 61 },
      { x: 50, y: 76 },
      { x: 50, y: 56 },
      { x: 38, y: 44 },
      { x: 50, y: 33 },
      { x: 62, y: 44 },
      { x: 50, y: 56 },
      { x: 50, y: 25 },
    ],
  },
};

export const coffeeRecipes: CoffeeRecipe[] = [
  {
    id: 'americano',
    name: '美式咖啡',
    customer: '赶早会的程序员',
    request: '想要一杯清爽但咖啡味明显的美式。',
    hint: '浓缩打底，热水占主要杯量，不需要拉花。',
    target: {
      espresso: 35,
      water: 60,
      milk: 0,
      foam: 5,
      chocolate: 0,
      syrup: 0,
    },
  },
  {
    id: 'cafe-latte',
    name: '拿铁',
    customer: '正在写手账的客人',
    request: '想要一杯顺滑温柔的拿铁，最好有爱心拉花。',
    hint: '牛奶比例最高，浓缩适中，顶部保留少量奶泡。',
    target: {
      espresso: 25,
      milk: 55,
      foam: 15,
      water: 0,
      chocolate: 0,
      syrup: 5,
    },
    artPattern: 'heart',
  },
  {
    id: 'cappuccino',
    name: '卡布奇诺',
    customer: '喜欢传统意式风味的常客',
    request: '要一杯奶泡厚实、比例均衡的卡布奇诺，图案要像树叶。',
    hint: '浓缩、牛奶、奶泡接近三分结构，奶泡略高。',
    target: {
      espresso: 30,
      milk: 35,
      foam: 30,
      water: 0,
      chocolate: 5,
      syrup: 0,
    },
    artPattern: 'rosetta',
  },
  {
    id: 'mocha',
    name: '摩卡',
    customer: '刚下课的甜食爱好者',
    request: '想要巧克力味明显但不要太腻的摩卡，顶部可以做郁金香。',
    hint: '巧克力要存在感，牛奶和浓缩仍然是主体。',
    target: {
      espresso: 25,
      milk: 40,
      foam: 10,
      water: 0,
      chocolate: 20,
      syrup: 5,
    },
    artPattern: 'tulip',
  },
  {
    id: 'caramel-macchiato',
    name: '焦糖玛奇朵',
    customer: '想犒劳自己的设计师',
    request: '要一杯香甜分层感强的焦糖玛奇朵，不必拉花。',
    hint: '糖浆偏多，牛奶和奶泡托住浓缩香气。',
    target: {
      espresso: 28,
      milk: 42,
      foam: 18,
      water: 0,
      chocolate: 0,
      syrup: 12,
    },
  },
];

export function clampAmount(value: number, min = 0, max = maxDrinkAmount) {
  return Math.max(min, Math.min(max, value));
}

export function getTotalAmount(amounts: IngredientAmounts) {
  return ingredientIds.reduce((sum, ingredientId) => sum + amounts[ingredientId], 0);
}

export function updateIngredientAmount(
  amounts: IngredientAmounts,
  ingredientId: IngredientId,
  delta: number,
) {
  const totalAmount = getTotalAmount(amounts);
  const currentAmount = amounts[ingredientId];
  const nextIngredientAmount = clampAmount(currentAmount + delta, 0, maxDrinkAmount);
  const nextTotalAmount = totalAmount - currentAmount + nextIngredientAmount;
  const allowedIngredientAmount = nextTotalAmount > maxDrinkAmount
    ? maxDrinkAmount - (totalAmount - currentAmount)
    : nextIngredientAmount;

  return {
    ...amounts,
    [ingredientId]: clampAmount(allowedIngredientAmount, 0, maxDrinkAmount),
  };
}

export function clearIngredientAmount(amounts: IngredientAmounts, ingredientId: IngredientId) {
  return {
    ...amounts,
    [ingredientId]: 0,
  };
}

export function getIngredientPercent(amounts: IngredientAmounts, ingredientId: IngredientId) {
  const totalAmount = getTotalAmount(amounts);

  if (totalAmount <= 0) {
    return 0;
  }

  return (amounts[ingredientId] / totalAmount) * 100;
}

export function getRandomRecipe(previousRecipeId?: string) {
  const candidates = previousRecipeId
    ? coffeeRecipes.filter((recipe) => recipe.id !== previousRecipeId)
    : coffeeRecipes;
  const pool = candidates.length > 0 ? candidates : coffeeRecipes;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function scoreIngredients(amounts: IngredientAmounts, recipe: CoffeeRecipe): IngredientScore {
  const totalAmount = getTotalAmount(amounts);
  const details = ingredientIds.map((ingredientId) => {
    const actualPercent = getIngredientPercent(amounts, ingredientId);
    const targetPercent = recipe.target[ingredientId];

    return {
      id: ingredientId,
      targetPercent,
      actualPercent,
      diff: Math.abs(actualPercent - targetPercent),
    };
  });

  const totalDiff = details.reduce((sum, detail) => sum + detail.diff, 0);
  const ratioScore = totalAmount <= 0 ? 0 : clampAmount(Math.round(100 - totalDiff * 1.15), 0, 100);
  const volumeScore = clampAmount(Math.round(100 - Math.abs(totalAmount - targetDrinkAmount) * 2), 0, 100);
  const score = Math.round(ratioScore * 0.78 + volumeScore * 0.22);

  return {
    score,
    ratioScore,
    volumeScore,
    totalAmount,
    details,
  };
}

export function createPathData(points: StrokePoint[]) {
  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

export function scoreLatteArt(stroke: StrokePoint[], patternId?: ArtPatternId): LatteArtScore {
  if (!patternId) {
    return {
      required: false,
      score: 100,
      distance: 0,
      message: '这杯咖啡不需要拉花，专注比例即可。',
    };
  }

  if (stroke.length < 8) {
    return {
      required: true,
      score: 0,
      distance: 100,
      message: '拉花线条太短，客人还看不出图案。',
    };
  }

  const templatePoints = resampleStroke(latteArtTemplates[patternId].points, 48);
  const strokePoints = resampleStroke(stroke, 48);
  const forwardDistance = getAverageDistance(templatePoints, strokePoints);
  const reversedDistance = getAverageDistance(templatePoints, [...strokePoints].reverse());
  const distance = Math.min(forwardDistance, reversedDistance);
  const score = clampAmount(Math.round(100 - distance * 2.35), 0, 100);

  return {
    required: true,
    score,
    distance,
    message: getArtScoreMessage(score),
  };
}

export function scoreOrder(
  amounts: IngredientAmounts,
  recipe: CoffeeRecipe,
  stroke: StrokePoint[],
): OrderScore {
  const ingredientScore = scoreIngredients(amounts, recipe);
  const artScore = scoreLatteArt(stroke, recipe.artPattern);
  const finalScore = artScore.required
    ? Math.round(ingredientScore.score * 0.7 + artScore.score * 0.3)
    : ingredientScore.score;
  const title = getFinalScoreTitle(finalScore);

  return {
    finalScore,
    ingredientScore,
    artScore,
    title,
    message: getFinalScoreMessage(finalScore, ingredientScore.score, artScore),
  };
}

function resampleStroke(points: StrokePoint[], targetCount: number) {
  if (points.length <= 1) {
    return Array.from({ length: targetCount }, () => points[0] ?? { x: 50, y: 50 });
  }

  const distances = [0];
  let totalDistance = 0;

  for (let index = 1; index < points.length; index += 1) {
    totalDistance += getDistance(points[index - 1], points[index]);
    distances.push(totalDistance);
  }

  if (totalDistance === 0) {
    return Array.from({ length: targetCount }, () => points[0]);
  }

  return Array.from({ length: targetCount }, (_, sampleIndex) => {
    const targetDistance = (totalDistance * sampleIndex) / (targetCount - 1);
    const nextIndex = distances.findIndex((distance) => distance >= targetDistance);

    if (nextIndex <= 0) {
      return points[0];
    }

    const previousDistance = distances[nextIndex - 1];
    const nextDistance = distances[nextIndex];
    const segmentProgress = (targetDistance - previousDistance) / (nextDistance - previousDistance || 1);
    const previousPoint = points[nextIndex - 1];
    const nextPoint = points[nextIndex];

    return {
      x: previousPoint.x + (nextPoint.x - previousPoint.x) * segmentProgress,
      y: previousPoint.y + (nextPoint.y - previousPoint.y) * segmentProgress,
    };
  });
}

function getAverageDistance(firstPoints: StrokePoint[], secondPoints: StrokePoint[]) {
  const count = Math.min(firstPoints.length, secondPoints.length);

  if (count === 0) {
    return 100;
  }

  const totalDistance = firstPoints
    .slice(0, count)
    .reduce((sum, point, index) => sum + getDistance(point, secondPoints[index]), 0);

  return totalDistance / count;
}

function getDistance(firstPoint: StrokePoint, secondPoint: StrokePoint) {
  return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function getArtScoreMessage(score: number) {
  if (score >= 90) {
    return '拉花线条和样例非常接近，客人忍不住先拍照。';
  }

  if (score >= 72) {
    return '图案轮廓清楚，细节还有一点可调整。';
  }

  if (score >= 45) {
    return '能看出大致方向，但线条偏离了样例。';
  }

  return '图案还不稳定，需要更贴近样例轨迹。';
}

function getFinalScoreTitle(score: number) {
  if (score >= 90) {
    return '主理人级出杯';
  }

  if (score >= 75) {
    return '客人满意';
  }

  if (score >= 55) {
    return '勉强过关';
  }

  return '需要返工';
}

function getFinalScoreMessage(score: number, ingredientScore: number, artScore: LatteArtScore) {
  if (score >= 90) {
    return '比例和呈现都很接近菜单要求，这杯可以放进招牌推荐。';
  }

  if (ingredientScore < 60) {
    return '主要问题在原料比例，先对照菜单调整每种材料的占比。';
  }

  if (artScore.required && artScore.score < 60) {
    return '味道已经接近，拉花还需要更贴近样例线条。';
  }

  if (score >= 75) {
    return '整体表现不错，微调几下就能变成精品出杯。';
  }

  return '这杯有可取之处，但距离客人的点单还有明显差距。';
}
