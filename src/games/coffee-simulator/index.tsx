import type { CSSProperties, PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  coffeeRecipes,
  createRandomOrder,
  createPathData,
  emptyAmounts,
  getExpectedSequence,
  getOrderTarget,
  getTotalAmount,
  ingredients,
  latteArtTemplates,
  maxDrinkAmount,
  pourStepAmount,
  scoreOrder,
  sweetnessOptions,
  targetDrinkAmount,
  temperatureOptions,
  updateIngredientAmount,
  type CoffeeOrder,
  type CoffeeRecipe,
  type Ingredient,
  type IngredientAmounts,
  type IngredientId,
  type OrderScore,
  type StrokePoint,
  type SweetnessId,
  type TemperatureId,
} from './logic';
import styles from './styles.module.css';

const highScoreKey = 'tiny-games:coffee-simulator:high-score';
const pourIntervalMs = 110;

export default function CoffeeSimulatorGame() {
  const [order, setOrder] = useState<CoffeeOrder>(() => createRandomOrder());
  const [amounts, setAmounts] = useState<IngredientAmounts>(emptyAmounts);
  const amountsRef = useRef<IngredientAmounts>(emptyAmounts);
  const [stroke, setStroke] = useState<StrokePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<OrderScore | null>(null);
  const [servedCount, setServedCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedSweetness, setSelectedSweetness] = useState<SweetnessId>('half');
  const [selectedTemperature, setSelectedTemperature] = useState<TemperatureId>('hot');
  const [pourSequence, setPourSequence] = useState<IngredientId[]>([]);
  const [pouringIngredientId, setPouringIngredientId] = useState<IngredientId | null>(null);
  const pourTimerRef = useRef<number | null>(null);
  const [highScore, setHighScore] = useLocalStorage<number>(highScoreKey, 0);

  const recipe = order.recipe;
  const targetAmounts = useMemo(() => getOrderTarget(order), [order]);
  const expectedSequence = useMemo(() => getExpectedSequence(order), [order]);
  const totalAmount = getTotalAmount(amounts);
  const artTemplate = recipe.artPattern ? latteArtTemplates[recipe.artPattern] : null;
  const cupLayers = ingredients.filter((ingredient) => amounts[ingredient.id] > 0);
  const averageScore = servedCount > 0 ? Math.round(totalScore / servedCount) : 0;
  const userPath = useMemo(() => createPathData(stroke), [stroke]);
  const guidePath = useMemo(() => createPathData(artTemplate?.points ?? []), [artTemplate]);
  const canServe = totalAmount > 0 && !result;
  const volumeLabel = getVolumeLabel(totalAmount);

  const cupStyle = {
    '--fill-level': `${Math.min(100, (totalAmount / targetDrinkAmount) * 100)}%`,
  } as CSSProperties;

  useEffect(() => {
    amountsRef.current = amounts;
  }, [amounts]);

  useEffect(() => () => stopPouring(), []);

  function clearCup() {
    stopPouring();
    setAmounts(emptyAmounts);
    amountsRef.current = emptyAmounts;
    setStroke([]);
    setResult(null);
    setPourSequence([]);
    setIsDrawing(false);
  }

  function resetGame() {
    stopPouring();
    setOrder(createRandomOrder(recipe.id));
    setAmounts(emptyAmounts);
    amountsRef.current = emptyAmounts;
    setStroke([]);
    setResult(null);
    setServedCount(0);
    setTotalScore(0);
    setSelectedSweetness('half');
    setSelectedTemperature('hot');
    setPourSequence([]);
    setIsDrawing(false);
  }

  function serveCoffee() {
    if (!canServe) {
      return;
    }

    stopPouring();
    const nextResult = scoreOrder(amounts, order, stroke, selectedSweetness, selectedTemperature, pourSequence);
    const nextTotalScore = totalScore + nextResult.finalScore;
    const nextServedCount = servedCount + 1;
    const nextAverageScore = Math.round(nextTotalScore / nextServedCount);

    setResult(nextResult);
    setTotalScore(nextTotalScore);
    setServedCount(nextServedCount);
    setHighScore(Math.max(highScore, nextResult.finalScore, nextAverageScore));
  }

  function nextOrder() {
    stopPouring();
    setOrder(createRandomOrder(recipe.id));
    setSelectedSweetness('half');
    setSelectedTemperature('hot');
    clearCup();
  }

  function pourIngredient(ingredientId: IngredientId, shouldRecord = false) {
    const currentAmounts = amountsRef.current;
    const nextAmounts = updateIngredientAmount(currentAmounts, ingredientId, pourStepAmount);

    if (nextAmounts[ingredientId] === currentAmounts[ingredientId]) {
      return;
    }

    amountsRef.current = nextAmounts;
    setAmounts(nextAmounts);

    if (shouldRecord) {
      setPourSequence((currentSequence) => (
        currentSequence[currentSequence.length - 1] === ingredientId
          ? currentSequence
          : [...currentSequence, ingredientId]
      ));
    }
  }

  function startPouring(ingredientId: IngredientId) {
    if (result || pourTimerRef.current !== null) {
      return;
    }

    pourIngredient(ingredientId, true);
    setPouringIngredientId(ingredientId);
    pourTimerRef.current = window.setInterval(() => {
      pourIngredient(ingredientId);
    }, pourIntervalMs);
  }

  function stopPouring() {
    if (pourTimerRef.current !== null) {
      window.clearInterval(pourTimerRef.current);
      pourTimerRef.current = null;
    }

    setPouringIngredientId(null);
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
      description="扮演咖啡主理人，根据随机顾客菜单按住按钮加入浓缩、牛奶、厚椰乳、鲜橙汁等原料，并匹配指定甜度、温度和制作顺序。部分饮品还需要用鼠标完成拉花。"
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
            <p>顾客会随机指定甜度和加冰、常温或热饮。加冰订单会把冰块计入目标比例；甜度和温度会共同影响偏好得分。</p>
            <p>原料需要按照菜单步骤加入。按住原料按钮开始倒入，松开鼠标停止；顺序错乱、漏步骤或加入无关原料都会扣分。</p>
            <p>需要拉花的饮品会额外比较你的鼠标轨迹与样例路径，并合入最终得分。</p>
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
          <ScoreCard label="杯量观察" value={volumeLabel} />
        </section>

        <section className={styles.orderBoard} aria-label="顾客点单">
          <div className={styles.customerBubble}>
            <span>顾客：{recipe.customer}</span>
            <h2>{recipe.name}</h2>
            <p>{recipe.request}</p>
            <div className={styles.orderSpecs} aria-label="顾客个性化要求">
              <strong>甜度：{order.sweetness.label}</strong>
              <strong>温度：{order.temperature.label}</strong>
            </div>
          </div>
          <div className={styles.menuHint}>
            <strong>菜单提示</strong>
            <p>{recipe.hint}</p>
            <div className={styles.targetTags} aria-label="目标配方比例">
              {ingredients
                .filter((ingredient) => targetAmounts[ingredient.id] > 0)
                .map((ingredient) => (
                  <span key={ingredient.id}>
                    {ingredient.shortName}
                  </span>
                ))}
            </div>
            <div className={styles.sequenceGuide} aria-label="推荐制作步骤">
              <strong>制作步骤</strong>
              <ol>
                {expectedSequence.map((ingredientId) => (
                  <li key={ingredientId}>{getIngredientShortName(ingredientId)}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className={styles.preferencePanel} aria-label="甜度和温度选择">
          <PreferenceGroup
            disabled={Boolean(result)}
            label="选择甜度"
            options={sweetnessOptions}
            selectedId={selectedSweetness}
            onSelect={(id) => setSelectedSweetness(id as SweetnessId)}
          />
          <PreferenceGroup
            disabled={Boolean(result)}
            label="选择温度"
            options={temperatureOptions}
            selectedId={selectedTemperature}
            onSelect={(id) => setSelectedTemperature(id as TemperatureId)}
          />
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
                target={targetAmounts[ingredient.id]}
                isPouring={pouringIngredientId === ingredient.id}
                onPourStart={() => startPouring(ingredient.id)}
                onPourStop={stopPouring}
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
                  按菜单步骤长按加入原料，凭杯中变化判断比例，选好甜度和温度，
                  {artTemplate ? '完成拉花后点击出杯。' : '确认杯量后即可出杯。'}
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

type PreferenceOption = {
  id: string;
  label: string;
  description: string;
};

type PreferenceGroupProps = {
  disabled: boolean;
  label: string;
  options: PreferenceOption[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function PreferenceGroup({
  disabled,
  label,
  options,
  selectedId,
  onSelect,
}: PreferenceGroupProps) {
  return (
    <div className={styles.preferenceGroup}>
      <h2>{label}</h2>
      <div className={styles.preferenceButtons}>
        {options.map((option) => (
          <button
            className={option.id === selectedId ? styles.preferenceButtonActive : undefined}
            disabled={disabled}
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

type IngredientControlProps = {
  amount: number;
  disabled: boolean;
  ingredient: Ingredient;
  isPouring: boolean;
  target: number;
  onPourStart: () => void;
  onPourStop: () => void;
};

function IngredientControl({
  amount,
  disabled,
  ingredient,
  isPouring,
  target,
  onPourStart,
  onPourStop,
}: IngredientControlProps) {
  const progressStyle = {
    '--ingredient-color': ingredient.color,
    '--ingredient-level': `${Math.min(100, (amount / maxDrinkAmount) * 100)}%`,
  } as CSSProperties;
  const cardClassName = [
    styles.ingredientCard,
    isPouring ? styles.ingredientCardPouring : '',
  ].filter(Boolean).join(' ');

  return (
    <article className={cardClassName} style={progressStyle}>
      <div>
        <span className={styles.ingredientDot} />
        <h3>{ingredient.name}</h3>
        <p>{ingredient.description}</p>
      </div>
      <div className={styles.ingredientStats}>
        <span>{getAmountLevelLabel(amount)}</span>
        <span>{target > 0 ? '菜单需要' : '非配方原料'}</span>
      </div>
      <div className={styles.ingredientMeter} aria-hidden="true">
        <span />
      </div>
      <div className={styles.ingredientActions}>
        <button
          className={styles.pourButton}
          disabled={disabled}
          type="button"
          onPointerCancel={onPourStop}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            onPourStart();
          }}
          onPointerLeave={onPourStop}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }

            onPourStop();
          }}
        >
          {isPouring ? '正在加入...' : '按住加入'}
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
        <div>
          <dt>偏好得分</dt>
          <dd>{result.preferenceScore}</dd>
        </div>
        <div>
          <dt>甜度</dt>
          <dd>{result.sweetnessScore}</dd>
        </div>
        <div>
          <dt>温度</dt>
          <dd>{result.temperatureScore}</dd>
        </div>
        <div>
          <dt>步骤</dt>
          <dd>{result.sequenceScore}</dd>
        </div>
      </dl>
      <p className={styles.feedbackLine}>
        {diffIngredient
          ? `${diffIngredient.shortName}偏差最大：目标 ${Math.round(biggestDiff.targetPercent)}%，当前 ${Math.round(biggestDiff.actualPercent)}%。`
          : `${recipe.name} 完成。`}
      </p>
      <p className={styles.feedbackLine}>
        推荐步骤：
        {result.expectedSequence.map((ingredientId) => getIngredientShortName(ingredientId)).join(' → ')}
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

function getIngredientShortName(ingredientId: IngredientId) {
  return ingredients.find((ingredient) => ingredient.id === ingredientId)?.shortName ?? ingredientId;
}

function getAmountLevelLabel(amount: number) {
  if (amount <= 0) {
    return '尚未加入';
  }

  if (amount < 12) {
    return '少量';
  }

  if (amount < 32) {
    return '适中';
  }

  if (amount < 55) {
    return '偏多';
  }

  return '很多';
}

function getVolumeLabel(totalAmount: number) {
  if (totalAmount <= 0) {
    return '空杯';
  }

  if (totalAmount < targetDrinkAmount * 0.55) {
    return '偏少';
  }

  if (totalAmount < targetDrinkAmount * 0.9) {
    return '接近半满';
  }

  if (totalAmount <= targetDrinkAmount * 1.12) {
    return '接近标准';
  }

  return '偏满';
}
