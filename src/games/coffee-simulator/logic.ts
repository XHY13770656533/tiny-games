export type IngredientId =
  | 'espresso'
  | 'milk'
  | 'foam'
  | 'water'
  | 'chocolate'
  | 'syrup'
  | 'coconutMilk'
  | 'orangeJuice'
  | 'blackTea'
  | 'ice';

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

export type SweetnessId = 'none' | 'light' | 'half' | 'standard' | 'extra';

export type SweetnessPreference = {
  id: SweetnessId;
  label: string;
  description: string;
};

export type TemperatureId = 'iced' | 'room' | 'hot';

export type TemperaturePreference = {
  id: TemperatureId;
  label: string;
  description: string;
};

export type CoffeeOrder = {
  recipe: CoffeeRecipe;
  sweetness: SweetnessPreference;
  temperature: TemperaturePreference;
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
  preferenceScore: number;
  sweetnessScore: number;
  temperatureScore: number;
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
  {
    id: 'coconutMilk',
    name: '厚椰乳',
    shortName: '椰乳',
    description: '带来生椰香气和更轻盈的奶感，适合生椰拿铁。',
    color: '#fef9c3',
  },
  {
    id: 'orangeJuice',
    name: '鲜橙汁',
    shortName: '橙汁',
    description: '提供酸甜果香，适合橙 C 美式这类清爽特调。',
    color: '#fb923c',
  },
  {
    id: 'blackTea',
    name: '红茶底',
    shortName: '红茶',
    description: '增加茶香和回甘，可制作鸳鸯咖啡或茶咖特调。',
    color: '#a16207',
  },
  {
    id: 'ice',
    name: '冰块',
    shortName: '冰块',
    description: '用于加冰订单。冰块会占用杯量，放多会稀释风味。',
    color: '#e0f2fe',
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
  coconutMilk: 0,
  orangeJuice: 0,
  blackTea: 0,
  ice: 0,
};

export const sweetnessOptions: SweetnessPreference[] = [
  { id: 'none', label: '无糖', description: '不额外增加甜味，突出咖啡本身。' },
  { id: 'light', label: '三分糖', description: '轻微甜感，适合清爽型饮品。' },
  { id: 'half', label: '五分糖', description: '甜度适中，甜感和咖啡味平衡。' },
  { id: 'standard', label: '七分糖', description: '偏甜但仍保留咖啡和奶香。' },
  { id: 'extra', label: '全糖', description: '甜感明显，适合甜品型咖啡。' },
];

export const temperatureOptions: TemperaturePreference[] = [
  { id: 'iced', label: '加冰', description: '需要加入冰块，做成冷饮口感。' },
  { id: 'room', label: '常温', description: '不加冰也不加热，保持温和口感。' },
  { id: 'hot', label: '热饮', description: '热出杯，不应加入冰块。' },
];

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
    request: '想要一杯清爽但咖啡味明显的美式，按我说的温度和甜度来。',
    hint: '浓缩打底，热水占主要杯量，不需要拉花。',
    target: createAmounts({
      espresso: 35,
      water: 60,
      foam: 5,
    }),
  },
  {
    id: 'cafe-latte',
    name: '拿铁',
    customer: '正在写手账的客人',
    request: '想要一杯顺滑温柔的拿铁，最好有爱心拉花。',
    hint: '牛奶比例最高，浓缩适中，顶部保留少量奶泡。',
    target: createAmounts({
      espresso: 25,
      milk: 55,
      foam: 15,
      syrup: 5,
    }),
    artPattern: 'heart',
  },
  {
    id: 'coconut-latte',
    name: '生椰拿铁',
    customer: '刚健身结束的客人',
    request: '想要椰香明显、咖啡味不要丢的生椰拿铁。',
    hint: '厚椰乳是主体，牛奶辅助顺滑，浓缩比例不能太低。',
    target: createAmounts({
      espresso: 24,
      coconutMilk: 48,
      milk: 16,
      foam: 7,
      syrup: 5,
    }),
    artPattern: 'heart',
  },
  {
    id: 'orange-c-americano',
    name: '橙 C 美式',
    customer: '想要清爽果咖的客人',
    request: '来一杯橙 C 美式，橙香要亮，咖啡也要能喝出来。',
    hint: '鲜橙汁和热水拉开清爽感，浓缩负责尾段苦甜。',
    target: createAmounts({
      espresso: 28,
      orangeJuice: 38,
      water: 24,
      syrup: 10,
    }),
  },
  {
    id: 'flat-white',
    name: '馥芮白',
    customer: '懂咖啡的通勤客',
    request: '要一杯奶感细腻、咖啡味更集中的馥芮白。',
    hint: '浓缩比例高于拿铁，牛奶细腻，奶泡只要薄薄一层。',
    target: createAmounts({
      espresso: 34,
      milk: 56,
      foam: 8,
      syrup: 2,
    }),
    artPattern: 'rosetta',
  },
  {
    id: 'cappuccino',
    name: '卡布奇诺',
    customer: '喜欢传统意式风味的常客',
    request: '要一杯奶泡厚实、比例均衡的卡布奇诺，图案要像树叶。',
    hint: '浓缩、牛奶、奶泡接近三分结构，奶泡略高。',
    target: createAmounts({
      espresso: 30,
      milk: 35,
      foam: 30,
      chocolate: 5,
    }),
    artPattern: 'rosetta',
  },
  {
    id: 'mocha',
    name: '摩卡',
    customer: '刚下课的甜食爱好者',
    request: '想要巧克力味明显但不要太腻的摩卡，顶部可以做郁金香。',
    hint: '巧克力要存在感，牛奶和浓缩仍然是主体。',
    target: createAmounts({
      espresso: 25,
      milk: 40,
      foam: 10,
      chocolate: 20,
      syrup: 5,
    }),
    artPattern: 'tulip',
  },
  {
    id: 'caramel-macchiato',
    name: '焦糖玛奇朵',
    customer: '想犒劳自己的设计师',
    request: '要一杯香甜分层感强的焦糖玛奇朵，不必拉花。',
    hint: '糖浆偏多，牛奶和奶泡托住浓缩香气。',
    target: createAmounts({
      espresso: 28,
      milk: 42,
      foam: 18,
      syrup: 12,
    }),
  },
  {
    id: 'dirty',
    name: 'Dirty',
    customer: '喜欢层次感的摄影师',
    request: '想喝冰牛奶托住热浓缩的 Dirty，层次要明显。',
    hint: '牛奶占大头，浓缩直接覆盖在上层，奶泡和水都很少。',
    target: createAmounts({
      espresso: 32,
      milk: 58,
      foam: 4,
      syrup: 6,
    }),
  },
  {
    id: 'sea-salt-cheese-latte',
    name: '海盐芝士拿铁',
    customer: '爱尝新品的学生',
    request: '要一杯有咸甜奶盖感的海盐芝士拿铁，可以做郁金香。',
    hint: '奶泡代表芝士奶盖口感，糖浆提供甜感，咖啡和牛奶保持平衡。',
    target: createAmounts({
      espresso: 24,
      milk: 42,
      foam: 24,
      syrup: 10,
    }),
    artPattern: 'tulip',
  },
  {
    id: 'yuanyang-coffee',
    name: '鸳鸯咖啡',
    customer: '下午犯困的编辑',
    request: '想要咖啡和红茶都有存在感的鸳鸯咖啡。',
    hint: '红茶底与牛奶形成茶咖基底，浓缩不要过低。',
    target: createAmounts({
      espresso: 24,
      blackTea: 32,
      milk: 32,
      foam: 6,
      syrup: 6,
    }),
  },
  {
    id: 'coconut-mocha',
    name: '生椰摩卡',
    customer: '想喝甜品咖啡的常客',
    request: '巧克力和椰香都要明显，但不要完全盖住咖啡。',
    hint: '厚椰乳与巧克力酱共同做主体，浓缩负责平衡甜感。',
    target: createAmounts({
      espresso: 24,
      coconutMilk: 34,
      chocolate: 20,
      milk: 12,
      foam: 6,
      syrup: 4,
    }),
    artPattern: 'heart',
  },
  {
    id: 'black-tea-latte',
    name: '红茶拿铁咖啡',
    customer: '想要茶香奶咖的客人',
    request: '红茶香明显一点，咖啡只要做出尾韵就好。',
    hint: '红茶底和牛奶占主要比例，浓缩做低比例点缀。',
    target: createAmounts({
      espresso: 18,
      blackTea: 38,
      milk: 34,
      foam: 6,
      syrup: 4,
    }),
    artPattern: 'rosetta',
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

export function createAmounts(partialAmounts: Partial<IngredientAmounts>): IngredientAmounts {
  return {
    ...emptyAmounts,
    ...partialAmounts,
  };
}

export function getRandomRecipe(previousRecipeId?: string) {
  const candidates = previousRecipeId
    ? coffeeRecipes.filter((recipe) => recipe.id !== previousRecipeId)
    : coffeeRecipes;
  const pool = candidates.length > 0 ? candidates : coffeeRecipes;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function createRandomOrder(previousRecipeId?: string): CoffeeOrder {
  return {
    recipe: getRandomRecipe(previousRecipeId),
    sweetness: sweetnessOptions[Math.floor(Math.random() * sweetnessOptions.length)],
    temperature: temperatureOptions[Math.floor(Math.random() * temperatureOptions.length)],
  };
}

export function getOrderTarget(order: CoffeeOrder): IngredientAmounts {
  const icePercent = order.temperature.id === 'iced' ? 12 : 0;
  const baseScale = (100 - icePercent) / 100;
  const target = ingredientIds.reduce<IngredientAmounts>((nextTarget, ingredientId) => {
    if (ingredientId === 'ice') {
      return {
        ...nextTarget,
        ice: icePercent,
      };
    }

    return {
      ...nextTarget,
      [ingredientId]: Number((order.recipe.target[ingredientId] * baseScale).toFixed(1)),
    };
  }, { ...emptyAmounts });

  return target;
}

export function scoreIngredients(amounts: IngredientAmounts, order: CoffeeOrder): IngredientScore {
  const totalAmount = getTotalAmount(amounts);
  const targetAmounts = getOrderTarget(order);
  const details = ingredientIds.map((ingredientId) => {
    const actualPercent = getIngredientPercent(amounts, ingredientId);
    const targetPercent = targetAmounts[ingredientId];

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

export function scoreSweetness(selectedSweetness: SweetnessId, targetSweetness: SweetnessId) {
  const selectedIndex = sweetnessOptions.findIndex((option) => option.id === selectedSweetness);
  const targetIndex = sweetnessOptions.findIndex((option) => option.id === targetSweetness);

  if (selectedIndex < 0 || targetIndex < 0) {
    return 0;
  }

  const distance = Math.abs(selectedIndex - targetIndex);
  return clampAmount(100 - distance * 32, 0, 100);
}

export function scoreTemperature(selectedTemperature: TemperatureId, targetTemperature: TemperatureId) {
  if (selectedTemperature === targetTemperature) {
    return 100;
  }

  if (
    (selectedTemperature === 'room' && targetTemperature === 'hot')
    || (selectedTemperature === 'hot' && targetTemperature === 'room')
  ) {
    return 55;
  }

  return 15;
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
  order: CoffeeOrder,
  stroke: StrokePoint[],
  selectedSweetness: SweetnessId,
  selectedTemperature: TemperatureId,
): OrderScore {
  const ingredientScore = scoreIngredients(amounts, order);
  const artScore = scoreLatteArt(stroke, order.recipe.artPattern);
  const sweetnessScore = scoreSweetness(selectedSweetness, order.sweetness.id);
  const temperatureScore = scoreTemperature(selectedTemperature, order.temperature.id);
  const preferenceScore = Math.round(sweetnessScore * 0.45 + temperatureScore * 0.55);
  const finalScore = artScore.required
    ? Math.round(ingredientScore.score * 0.58 + artScore.score * 0.27 + preferenceScore * 0.15)
    : Math.round(ingredientScore.score * 0.8 + preferenceScore * 0.2);
  const title = getFinalScoreTitle(finalScore);

  return {
    finalScore,
    ingredientScore,
    artScore,
    preferenceScore,
    sweetnessScore,
    temperatureScore,
    title,
    message: getFinalScoreMessage(finalScore, ingredientScore.score, artScore, preferenceScore),
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

function getFinalScoreMessage(
  score: number,
  ingredientScore: number,
  artScore: LatteArtScore,
  preferenceScore: number,
) {
  if (score >= 90) {
    return '比例和呈现都很接近菜单要求，这杯可以放进招牌推荐。';
  }

  if (ingredientScore < 60) {
    return '主要问题在原料比例，先对照菜单调整每种材料的占比。';
  }

  if (artScore.required && artScore.score < 60) {
    return '味道已经接近，拉花还需要更贴近样例线条。';
  }

  if (preferenceScore < 60) {
    return '饮品主体不错，但甜度或温度没有贴合顾客要求。';
  }

  if (score >= 75) {
    return '整体表现不错，微调几下就能变成精品出杯。';
  }

  return '这杯有可取之处，但距离客人的点单还有明显差距。';
}
