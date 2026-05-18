import type { CSSProperties, PointerEvent } from 'react';
import { useMemo, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  clearIngredientAmount,
  coffeeRecipes,
  createPathData,
  emptyAmounts,
  getIngredientPercent,
  getRandomRecipe,
  getTotalAmount,
  ingredientStep,
  ingredients,
  latteArtTemplates,
  maxDrinkAmount,
  scoreOrder,
  targetDrinkAmount,
  updateIngredientAmount,
  type CoffeeRecipe,
  type Ingredient,
  type IngredientAmounts,
  type OrderScore,
  type StrokePoint,
} from './logic';
import styles from './styles.module.css';

const highScoreKey = 'tiny-games:coffee-simulator:high-score';

export default function CoffeeSimulatorGame() {
  const [recipe, setRecipe] = useState<CoffeeRecipe>(() => getRandomRecipe());
  const [amounts, setAmounts] = useState<IngredientAmounts>(emptyAmounts);
  const [stroke, setStroke] = useState<StrokePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<OrderScore | null>(null);
  const [servedCount, setServedCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage<number>(highScoreKey, 0);

  const totalAmount = getTotalAmount(amounts);
  const artTemplate = recipe.artPattern ? latteArtTemplates[recipe.artPattern] : null;
  const cupLayers = ingredients.filter((ingredient) => amounts[ingredient.id] > 0);
  const averageScore = servedCount > 0 ? Math.round(totalScore / servedCount) : 0;
  const userPath = useMemo(() => createPathData(stroke), [stroke]);
  const guidePath = useMemo(() => createPathData(artTemplate?.points ?? []), [artTemplate]);
  const canServe = totalAmount > 0 && !result;

  const cupStyle = {
    '--fill-level': `${Math.min(100, (totalAmount / targetDrinkAmount) * 100)}%`,
  } as CSSProperties;

  function changeIngredientAmount(ingredientId: Ingredient['id'], delta: number) {
    if (result) {
      return;
    }

    setAmounts((currentAmounts) => updateIngredientAmount(currentAmounts, ingredientId, delta));
  }

  function clearIngredient(ingredientId: Ingredient['id']) {
    if (result) {
      return;
    }

    setAmounts((currentAmounts) => clearIngredientAmount(currentAmounts, ingredientId));
  }

  function clearCup() {
    setAmounts(emptyAmounts);
    setStroke([]);
    setResult(null);
    setIsDrawing(false);
  }

  function resetGame() {
    setRecipe(getRandomRecipe(recipe.id));
    setAmounts(emptyAmounts);
    setStroke([]);
    setResult(null);
    setServedCount(0);
    setTotalScore(0);
    setIsDrawing(false);
  }

  function serveCoffee() {
    if (!canServe) {
      return;
    }

    const nextResult = scoreOrder(amounts, recipe, stroke);
    const nextTotalScore = totalScore + nextResult.finalScore;
    const nextServedCount = servedCount + 1;
    const nextAverageScore = Math.round(nextTotalScore / nextServedCount);

    setResult(nextResult);
    setTotalScore(nextTotalScore);
    setServedCount(nextServedCount);
    setHighScore(Math.max(highScore, nextResult.finalScore, nextAverageScore));
  }

  function nextOrder() {
    setRecipe(getRandomRecipe(recipe.id));
    clearCup();
  }

  function clearArt() {
    if (result) {
      return;
    }

    setStroke([]);
    setIsDrawing(false);
  }

  function handleArtPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (!artTemplate || result) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setStroke([getPointerPoint(event)]);
    setIsDrawing(true);
  }

  function handleArtPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!isDrawing || !artTemplate || result) {
      return;
    }

    const nextPoint = getPointerPoint(event);
    setStroke((currentStroke) => {
      const lastPoint = currentStroke[currentStroke.length - 1];

      if (lastPoint && Math.hypot(nextPoint.x - lastPoint.x, nextPoint.y - lastPoint.y) < 1.2) {
        return currentStroke;
      }

      return [...currentStroke, nextPoint];
    });
  }

  function handleArtPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDrawing(false);
  }

  return (
    <GameLayout
      title="咖啡模拟器"
      description="扮演咖啡主理人，根据随机顾客菜单点选加入浓缩、牛奶、奶泡等原料；比例越接近配方得分越高。部分饮品还需要用鼠标完成拉花，图案越贴近样例越加分。"
      actions={
        <button className="button" type="button" onClick={resetGame}>
          重新开店
        </button>
      }
      aside={
        <div className={styles.asideContent}>
          <section>
            <h2>评分规则</h2>
            <p>每杯目标容量为 {targetDrinkAmount} ml。系统会先按所有原料的百分比与菜单配方比较，再加入容量接近度。</p>
            <p>需要拉花的饮品会额外比较你的鼠标轨迹与样例路径，最终分数为原料 70% + 拉花 30%。</p>
          </section>
          <section>
            <h2>今日菜单</h2>
            <ul className={styles.recipeList}>
              {coffeeRecipes.map((coffeeRecipe) => (
                <li className={coffeeRecipe.id === recipe.id ? styles.activeRecipe : undefined} key={coffeeRecipe.id}>
                  <strong>{coffeeRecipe.name}</strong>
                  <span>{coffeeRecipe.artPattern ? `${latteArtTemplates[coffeeRecipe.artPattern].name}拉花` : '无需拉花'}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <section className={styles.scoreboard} aria-label="咖啡店得分状态">
          <ScoreCard label="当前杯数" value={`${servedCount} 杯`} />
          <ScoreCard label="平均分" value={servedCount > 0 ? `${averageScore}` : '待出杯'} />
          <ScoreCard label="最高记录" value={`${highScore}`} />
          <ScoreCard label="当前容量" value={`${totalAmount} / ${targetDrinkAmount} ml`} />
        </section>

        <section className={styles.orderBoard} aria-label="顾客点单">
          <div className={styles.customerBubble}>
            <span>顾客：{recipe.customer}</span>
            <h2>{recipe.name}</h2>
            <p>{recipe.request}</p>
          </div>
          <div className={styles.menuHint}>
            <strong>菜单提示</strong>
            <p>{recipe.hint}</p>
            <div className={styles.targetTags} aria-label="目标配方比例">
              {ingredients
                .filter((ingredient) => recipe.target[ingredient.id] > 0)
                .map((ingredient) => (
                  <span key={ingredient.id}>
                    {ingredient.shortName} {recipe.target[ingredient.id]}%
                  </span>
                ))}
            </div>
          </div>
        </section>

        <section className={styles.workbench} aria-label="咖啡制作台">
          <div className={styles.cupPanel}>
            <div className={styles.machine} aria-hidden="true">
              <span className={styles.machineLight} />
              <span className={styles.portafilter} />
              <span className={styles.steamWand} />
            </div>
            <div className={styles.cupWrap}>
              <div className={styles.cup} style={cupStyle} aria-label="当前杯中原料">
                <div className={styles.cupFill}>
                  {cupLayers.map((ingredient) => (
                    <span
                      className={styles.cupLayer}
                      key={ingredient.id}
                      style={{
                        '--ingredient-color': ingredient.color,
                        '--layer-size': amounts[ingredient.id],
                      } as CSSProperties}
                      title={`${ingredient.name} ${amounts[ingredient.id]} ml`}
                    />
                  ))}
                </div>
                <span className={styles.cupShine} />
              </div>
              <div className={styles.saucer} />
            </div>
          </div>

          <div className={styles.ingredientGrid} aria-label="原料控制">
            {ingredients.map((ingredient) => (
              <IngredientControl
                amount={amounts[ingredient.id]}
                disabled={Boolean(result)}
                ingredient={ingredient}
                key={ingredient.id}
                percent={getIngredientPercent(amounts, ingredient.id)}
                target={recipe.target[ingredient.id]}
                onAdd={(delta) => changeIngredientAmount(ingredient.id, delta)}
                onClear={() => clearIngredient(ingredient.id)}
              />
            ))}
          </div>
        </section>

        <section className={styles.artAndResult}>
          <div className={styles.artPanel}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Latte Art</p>
                <h2>{artTemplate ? `拉花：${artTemplate.name}` : '本杯无需拉花'}</h2>
              </div>
              <button disabled={!artTemplate || Boolean(result) || stroke.length === 0} type="button" onClick={clearArt}>
                重画
              </button>
            </div>
            <p className={styles.artDescription}>
              {artTemplate
                ? artTemplate.description
                : '客人更在意口味比例。你仍可以把注意力放在原料控制上。'}
            </p>
            <svg
              className={[styles.artCanvas, artTemplate ? styles.artCanvasActive : ''].filter(Boolean).join(' ')}
              role="img"
              viewBox="0 0 100 100"
              aria-label={artTemplate ? `${artTemplate.name}拉花绘制区域` : '无需拉花的咖啡表面'}
              onPointerDown={handleArtPointerDown}
              onPointerLeave={handleArtPointerUp}
              onPointerMove={handleArtPointerMove}
              onPointerUp={handleArtPointerUp}
            >
              <defs>
                <radialGradient id="coffee-foam" cx="50%" cy="42%" r="62%">
                  <stop offset="0%" stopColor="#fff7ed" />
                  <stop offset="58%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#b45309" />
                </radialGradient>
              </defs>
              <circle className={styles.artFoam} cx="50" cy="50" r="45" />
              {artTemplate ? <path className={styles.guidePath} d={guidePath} /> : null}
              {userPath ? <path className={styles.userPath} d={userPath} /> : null}
            </svg>
          </div>

          <div className={styles.resultPanel} aria-live="polite">
            {result ? (
              <ResultSummary result={result} recipe={recipe} onNextOrder={nextOrder} />
            ) : (
              <div className={styles.pendingResult}>
                <p className={styles.eyebrow}>Service</p>
                <h2>准备出杯</h2>
                <p>
                  调整原料到接近菜单提示的比例，
                  {artTemplate ? '完成拉花后点击出杯。' : '确认容量后即可出杯。'}
                </p>
                <button className="button" disabled={!canServe} type="button" onClick={serveCoffee}>
                  出杯评分
                </button>
                <button className={styles.secondaryButton} type="button" onClick={clearCup}>
                  清空重做
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </GameLayout>
  );
}

type ScoreCardProps = {
  label: string;
  value: string;
};

function ScoreCard({ label, value }: ScoreCardProps) {
  return (
    <div className={styles.scoreCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type IngredientControlProps = {
  amount: number;
  disabled: boolean;
  ingredient: Ingredient;
  percent: number;
  target: number;
  onAdd: (delta: number) => void;
  onClear: () => void;
};

function IngredientControl({
  amount,
  disabled,
  ingredient,
  percent,
  target,
  onAdd,
  onClear,
}: IngredientControlProps) {
  const progressStyle = {
    '--ingredient-color': ingredient.color,
    '--ingredient-level': `${Math.min(100, (amount / maxDrinkAmount) * 100)}%`,
  } as CSSProperties;

  return (
    <article className={styles.ingredientCard} style={progressStyle}>
      <div>
        <span className={styles.ingredientDot} />
        <h3>{ingredient.name}</h3>
        <p>{ingredient.description}</p>
      </div>
      <div className={styles.ingredientStats}>
        <span>{amount} ml</span>
        <span>当前 {Math.round(percent)}%</span>
        <span>目标 {target}%</span>
      </div>
      <div className={styles.ingredientMeter} aria-hidden="true">
        <span />
      </div>
      <div className={styles.ingredientActions}>
        <button disabled={disabled || amount <= 0} type="button" onClick={() => onAdd(-ingredientStep)}>
          -{ingredientStep}
        </button>
        <button disabled={disabled} type="button" onClick={() => onAdd(ingredientStep)}>
          +{ingredientStep}
        </button>
        <button disabled={disabled || amount <= 0} type="button" onClick={onClear}>
          清零
        </button>
      </div>
    </article>
  );
}

type ResultSummaryProps = {
  result: OrderScore;
  recipe: CoffeeRecipe;
  onNextOrder: () => void;
};

function ResultSummary({ result, recipe, onNextOrder }: ResultSummaryProps) {
  const biggestDiff = [...result.ingredientScore.details]
    .sort((first, second) => second.diff - first.diff)[0];
  const diffIngredient = ingredients.find((ingredient) => ingredient.id === biggestDiff.id);

  return (
    <div className={styles.resultSummary}>
      <p className={styles.eyebrow}>Result</p>
      <h2>{result.title}</h2>
      <div
        className={styles.scoreRing}
        style={{ '--score-value': `${result.finalScore}%` } as CSSProperties}
        aria-label={`最终得分 ${result.finalScore}`}
      >
        <strong>{result.finalScore}</strong>
        <span>分</span>
      </div>
      <p>{result.message}</p>
      <dl className={styles.resultStats}>
        <div>
          <dt>原料得分</dt>
          <dd>{result.ingredientScore.score}</dd>
        </div>
        <div>
          <dt>容量</dt>
          <dd>{result.ingredientScore.totalAmount} ml</dd>
        </div>
        <div>
          <dt>拉花得分</dt>
          <dd>{result.artScore.required ? result.artScore.score : '无需'}</dd>
        </div>
      </dl>
      <p className={styles.feedbackLine}>
        {diffIngredient
          ? `${diffIngredient.shortName}偏差最大：目标 ${Math.round(biggestDiff.targetPercent)}%，当前 ${Math.round(biggestDiff.actualPercent)}%。`
          : `${recipe.name} 完成。`}
      </p>
      {result.artScore.required ? <p className={styles.feedbackLine}>{result.artScore.message}</p> : null}
      <button className="button" type="button" onClick={onNextOrder}>
        接待下一位顾客
      </button>
    </div>
  );
}

function getPointerPoint(event: PointerEvent<SVGSVGElement>): StrokePoint {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}
