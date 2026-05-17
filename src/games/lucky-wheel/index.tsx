import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  applyItem,
  buildWheelGradient,
  createInitialEffects,
  createInitialInventory,
  formatCoins,
  getLevel,
  getRewardMultiplier,
  getSegmentCenterAngle,
  getSpinCost,
  initialCoins,
  levels,
  luckyItems,
  specialEvents,
  spinWheel,
  wheelSegments,
  type ActiveEffects,
  type Inventory,
  type LuckyItemId,
} from './logic';
import styles from './styles.module.css';

const maxLogLength = 7;

const effectLabels: Array<{ key: keyof ActiveEffects; label: string; unit: string }> = [
  { key: 'doubleRewardSpins', label: '双倍奖励', unit: '次' },
  { key: 'bonusMultiplierSpins', label: '放大奖励', unit: '次' },
  { key: 'highRewardBoostSpins', label: '高奖概率', unit: '次' },
  { key: 'freeSpins', label: '免费转动', unit: '次' },
  { key: 'lossShieldCharges', label: '金币护盾', unit: '层' },
  { key: 'lossReductionSpins', label: '损失减半', unit: '次' },
  { key: 'noBlankSpins', label: '避开空奖', unit: '次' },
  { key: 'costDiscountSpins', label: '费用折扣', unit: '次' },
  { key: 'rewardSurgeSpins', label: '黄金时刻', unit: '次' },
  { key: 'rewardDampenerSpins', label: '黑洞减益', unit: '次' },
];

export default function LuckyWheelGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [coins, setCoins] = useState(initialCoins);
  const [inventory, setInventory] = useState<Inventory>(() => createInitialInventory());
  const [effects, setEffects] = useState<ActiveEffects>(() => createInitialEffects());
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([
    `带着 ${formatCoins(initialCoins)} 开始挑战幸运转盘。`,
  ]);

  const level = getLevel(levelIndex);
  const spinCost = getSpinCost(level, effects);
  const rewardMultiplier = getRewardMultiplier(level, effects);
  const progress = Math.min(100, Math.round((coins / level.targetCoins) * 100));
  const isLevelComplete = coins >= level.targetCoins;
  const isFinalLevel = levelIndex === levels.length - 1;
  const hasWon = isLevelComplete && isFinalLevel;
  const inventoryCount = luckyItems.reduce((sum, item) => sum + inventory[item.id], 0);
  const activeEffectEntries = effectLabels.filter(({ key }) => effects[key] > 0);

  const wheelBackground = useMemo(() => buildWheelGradient(wheelSegments), []);
  const stageStyle = {
    '--wheel-rotation': `${wheelRotation}deg`,
    '--level-progress': `${progress}%`,
  } as CSSProperties;

  function appendLog(entries: string[]) {
    setLog((currentLog) => [...entries, ...currentLog].slice(0, maxLogLength));
  }

  function handleSpin() {
    if (coins < spinCost || isLevelComplete) {
      return;
    }

    const result = spinWheel(level, coins, inventory, effects);
    const centerAngle = getSegmentCenterAngle(result.segment.id);

    setCoins(result.coins);
    setInventory(result.inventory);
    setEffects(result.effects);
    setSelectedSegmentId(result.segment.id);
    setWheelRotation((currentRotation) => currentRotation + 1440 + (360 - centerAngle));

    appendLog([
      ...result.messages,
      result.coins >= level.targetCoins
        ? isFinalLevel
          ? '最终目标达成，幸运转盘挑战通关！'
          : `已达到 ${level.name} 的过关目标，可以进入下一关。`
        : `当前余额：${formatCoins(result.coins)}。`,
    ]);
  }

  function handleUseItem(itemId: LuckyItemId) {
    const result = applyItem(itemId, level, coins, inventory, effects);

    if (!result) {
      return;
    }

    setCoins(result.coins);
    setInventory(result.inventory);
    setEffects(result.effects);
    appendLog([
      result.message,
      result.coins >= level.targetCoins
        ? isFinalLevel
          ? '金币目标已满足，可以完成最终挑战。'
          : `金币已达到 ${level.name} 目标，可以进入下一关。`
        : `当前余额：${formatCoins(result.coins)}。`,
    ]);
  }

  function handleNextLevel() {
    if (!isLevelComplete || isFinalLevel) {
      return;
    }

    const nextLevel = getLevel(levelIndex + 1);
    setLevelIndex((currentLevelIndex) => currentLevelIndex + 1);
    appendLog([`进入第 ${nextLevel.id} 关「${nextLevel.name}」，目标提升至 ${formatCoins(nextLevel.targetCoins)}。`]);
  }

  function resetGame() {
    setLevelIndex(0);
    setCoins(initialCoins);
    setInventory(createInitialInventory());
    setEffects(createInitialEffects());
    setWheelRotation(0);
    setSelectedSegmentId(null);
    setLog([`重新开始：带着 ${formatCoins(initialCoins)} 挑战幸运转盘。`]);
  }

  return (
    <GameLayout
      title="幸运转盘"
      description="消耗金币转动幸运转盘，累积金币达到每关目标即可过关。转盘中包含多档金币、无奖励、随机道具与特殊事件，道具和事件会改变收益倍率、奖励概率、转动费用或风险。"
      actions={
        <button className="button" type="button" onClick={resetGame}>
          重新开始
        </button>
      }
      aside={
        <div className={styles.asideContent}>
          <section>
            <h2>5 个关卡</h2>
            <ol className={styles.asideList}>
              {levels.map((item) => (
                <li className={item.id === level.id ? styles.currentAsideItem : undefined} key={item.id}>
                  <strong>{item.name}</strong>
                  <span>
                    目标 {formatCoins(item.targetCoins)}，费用 {formatCoins(item.spinCost)}
                  </span>
                  <small>{item.description}</small>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2>8 种道具</h2>
            <ul className={styles.asideList}>
              {luckyItems.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>6 种特殊事件</h2>
            <ul className={styles.asideList}>
              {specialEvents.map((event) => (
                <li key={event.id}>
                  <strong>{event.name}</strong>
                  <small>{event.description}</small>
                </li>
              ))}
            </ul>
          </section>
        </div>
      }
    >
      <div className={styles.wrapper} style={stageStyle}>
        <section className={styles.statusPanel} aria-label="关卡状态">
          <div>
            <span>第 {level.id} 关</span>
            <strong>{level.name}</strong>
          </div>
          <div>
            <span>当前金币</span>
            <strong>{formatCoins(coins)}</strong>
          </div>
          <div>
            <span>本次费用</span>
            <strong>{formatCoins(spinCost)}</strong>
          </div>
          <div>
            <span>金币倍率</span>
            <strong>{rewardMultiplier.toFixed(2)}x</strong>
          </div>
        </section>

        <section className={styles.goalCard} aria-label="过关目标">
          <div className={styles.goalHeader}>
            <div>
              <span>过关目标</span>
              <strong>{formatCoins(level.targetCoins)}</strong>
            </div>
            <span>{progress}%</span>
          </div>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            aria-label={`${level.name} 过关进度`}
          >
            <span />
          </div>
          <p>
            {hasWon
              ? '恭喜通关！你已经完成 5 个关卡。'
              : isLevelComplete
                ? '目标已达成，点击进入下一关继续挑战。'
                : coins < spinCost
                  ? '金币不足以继续转动，尝试使用背包里的金币类道具或重新开始。'
                  : level.description}
          </p>
        </section>

        <section className={styles.playArea}>
          <div className={styles.wheelColumn}>
            <div className={styles.pointer} aria-hidden="true" />
            <div
              className={styles.wheel}
              style={{ background: wheelBackground }}
              aria-label="幸运转盘"
            >
              <div className={styles.wheelCenter}>
                <span>Lucky</span>
                <strong>Spin</strong>
              </div>
              {wheelSegments.map((segment, index) => (
                <span
                  className={[
                    styles.segmentLabel,
                    selectedSegmentId === segment.id ? styles.segmentLabelActive : '',
                  ].filter(Boolean).join(' ')}
                  key={segment.id}
                  style={{
                    '--segment-angle': `${(360 / wheelSegments.length) * index}deg`,
                  } as CSSProperties}
                >
                  {segment.label}
                </span>
              ))}
            </div>
            <button
              className={styles.spinButton}
              type="button"
              disabled={coins < spinCost || isLevelComplete}
              onClick={handleSpin}
            >
              {isLevelComplete ? '目标已达成' : `转动 -${spinCost}`}
            </button>
            {isLevelComplete && !isFinalLevel ? (
              <button className={styles.nextButton} type="button" onClick={handleNextLevel}>
                进入下一关
              </button>
            ) : null}
          </div>

          <div className={styles.sideColumn}>
            <section className={styles.inventoryCard} aria-label="道具背包">
              <div className={styles.cardHeading}>
                <h2>道具背包</h2>
                <span>{inventoryCount} 件</span>
              </div>
              <div className={styles.itemGrid}>
                {luckyItems.map((item) => (
                  <button
                    className={styles.itemButton}
                    key={item.id}
                    type="button"
                    disabled={inventory[item.id] <= 0 || hasWon}
                    onClick={() => handleUseItem(item.id)}
                  >
                    <span>{item.shortName}</span>
                    <strong>x{inventory[item.id]}</strong>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.effectCard} aria-label="当前效果">
              <div className={styles.cardHeading}>
                <h2>当前效果</h2>
                <span>{activeEffectEntries.length} 个</span>
              </div>
              {activeEffectEntries.length > 0 ? (
                <div className={styles.effectTags}>
                  {activeEffectEntries.map(({ key, label, unit }) => (
                    <span key={key}>
                      {label} {effects[key]}{unit}
                    </span>
                  ))}
                </div>
              ) : (
                <p>暂无持续效果。使用道具或触发特殊事件可改变倍率、概率或费用。</p>
              )}
            </section>
          </div>
        </section>

        <section className={styles.infoGrid} aria-label="转盘奖池">
          {wheelSegments.map((segment) => (
            <article className={styles.segmentCard} key={segment.id}>
              <span style={{ '--segment-color': segment.color } as CSSProperties}>{segment.label}</span>
              <strong>{segment.weight}% 权重</strong>
              <p>{segment.description}</p>
            </article>
          ))}
        </section>

        <section className={styles.logCard} aria-label="游戏日志" aria-live="polite">
          <div className={styles.cardHeading}>
            <h2>事件日志</h2>
            <span>最近 {log.length} 条</span>
          </div>
          <ol>
            {log.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ol>
        </section>
      </div>
    </GameLayout>
  );
}
