import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  attemptCurrentRiver,
  clampFeedAmount,
  createInitialState,
  defaultLevelConfig,
  getCurrentRiver,
  getPonyHeight,
  getRemainingRiverCount,
  type AttemptRecord,
  type PonyRiverGameState,
} from './logic';
import styles from './styles.module.css';

type AnimationPhase = 'idle' | 'crossing' | 'success' | 'failed';

const quickFeedOptions = [0, 1, 2, 3, 4, 5];

function createGame() {
  return createInitialState(defaultLevelConfig);
}

export default function PonyRiverGame() {
  const [game, setGame] = useState<PonyRiverGameState>(() => createGame());
  const [plannedFeed, setPlannedFeed] = useState(0);
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [lastOutcome, setLastOutcome] = useState<AttemptRecord | null>(null);
  const timersRef = useRef<number[]>([]);

  const currentRiver = getCurrentRiver(game);
  const remainingRivers = getRemainingRiverCount(game);
  const ponyHeight = getPonyHeight(defaultLevelConfig.baseHeight, plannedFeed);
  const isBusy = phase === 'crossing';
  const isTerminal = game.status !== 'playing';
  const canControl = !isBusy && !isTerminal;
  const visibleFeedOptions = useMemo(
    () => Array.from(new Set([...quickFeedOptions, game.fodder])).filter((amount) => amount <= game.fodder),
    [game.fodder],
  );

  const stageClassName = [
    styles.stage,
    styles[`phase-${phase}`],
    game.status === 'won' ? styles.won : '',
    game.status === 'lost' ? styles.lost : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ponyStyle = {
    '--height-scale': Math.min(1.78, 1 + plannedFeed * 0.085).toFixed(2),
  } as CSSProperties;

  const statusText = getStatusText(game, phase, plannedFeed, lastOutcome);

  useEffect(() => () => clearTimers(), []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function updatePlannedFeed(value: number) {
    if (!canControl) {
      return;
    }

    setPlannedFeed(clampFeedAmount(value, game.fodder));
  }

  function resetGame() {
    clearTimers();
    setGame(createGame());
    setPlannedFeed(0);
    setPhase('idle');
    setLastOutcome(null);
  }

  function handleAttempt() {
    if (!canControl) {
      return;
    }

    clearTimers();
    const nextGame = attemptCurrentRiver(game, plannedFeed, defaultLevelConfig);
    const outcome = nextGame.history[0] ?? null;
    setLastOutcome(outcome);
    setPhase('crossing');

    timersRef.current = [
      window.setTimeout(() => {
        setGame(nextGame);
        setPlannedFeed(0);
        setPhase(outcome?.success ? 'success' : 'failed');
      }, 1050),
      window.setTimeout(() => {
        setPhase('idle');
      }, 2300),
    ];
  }

  return (
    <GameLayout
      title="小马过河"
      description="你有一只初始身高 1 米的小马和有限草料。每捆草料能让小马临时长高 1 米；每过一条隐藏深度的小河后身高恢复，并可能捡到新的草料。猜错一次，小马就会被河水吞没。"
      actions={
        <button className="button" type="button" onClick={resetGame}>
          重新开始
        </button>
      }
      aside={
        <div>
          <h2>玩法说明</h2>
          <p>本局共有 {defaultLevelConfig.riverCount} 条小河，玩家只能知道剩余数量、当前草料和历史结果，不能提前看到下一条河的深度。</p>
          <p>选择要喂的小草料数量后点击过河。小马身高大于等于河深即可通过，并获得 0-{defaultLevelConfig.maxReward} 捆随机草料。</p>
          <p>每过一条河，小马会恢复到 {defaultLevelConfig.baseHeight} 米；如果某次身高不足，本关立即失败。</p>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <section className={styles.dashboard} aria-label="小马过河当前状态">
          <StatusCard label="剩余小河" value={`${remainingRivers} / ${defaultLevelConfig.riverCount}`} />
          <StatusCard label="剩余草料" value={`${game.fodder} 捆`} />
          <StatusCard label="喂食后身高" value={`${ponyHeight} 米`} />
        </section>

        <section className={stageClassName} aria-label="小马过河动画舞台">
          <div className={styles.sky} aria-hidden="true">
            <span className={styles.cloudOne} />
            <span className={styles.cloudTwo} />
            <span className={styles.sun} />
          </div>

          <div className={styles.messagePanel} aria-live="polite">
            <strong>{getStatusTitle(game.status, phase)}</strong>
            <span>{statusText}</span>
          </div>

          <div className={styles.riverScene}>
            <div className={styles.leftBank}>
              <span className={styles.bankLabel}>起点</span>
            </div>
            <div className={styles.river} aria-label="隐藏深度的小河">
              <span className={styles.rippleOne} />
              <span className={styles.rippleTwo} />
              <span className={styles.rippleThree} />
              <span className={styles.depthSign}>
                {lastOutcome
                && phase !== 'crossing'
                && (isTerminal || currentRiver?.id !== lastOutcome.riverId)
                  ? `${lastOutcome.riverDepth} 米`
                  : '深度 ?'}
              </span>
            </div>
            <div className={styles.rightBank}>
              <span className={styles.bankLabel}>对岸</span>
            </div>
          </div>

          <div className={styles.ponyTrack}>
            <Pony style={ponyStyle} />
          </div>

          {plannedFeed > 0 && canControl ? (
            <div className={styles.feedRain} aria-hidden="true">
              <span>+{plannedFeed} 米</span>
              <i />
              <i />
              <i />
            </div>
          ) : null}

          {lastOutcome && phase === 'success' ? (
            <div className={styles.rewardBubble} aria-hidden="true">
              +{lastOutcome.reward} 草料
            </div>
          ) : null}
          {lastOutcome && phase === 'failed' ? <div className={styles.splash} aria-hidden="true" /> : null}
        </section>

        <section className={styles.controls} aria-label="喂草料并尝试过河">
          <div className={styles.feedHeader}>
            <div>
              <p className={styles.eyebrow}>Feed</p>
              <h2>本次喂 {plannedFeed} 捆草料</h2>
            </div>
            <p>喂得越多越安全，但后面的河可能更需要草料。</p>
          </div>

          <div className={styles.sliderRow}>
            <button
              className={styles.stepButton}
              disabled={!canControl || plannedFeed <= 0}
              type="button"
              onClick={() => updatePlannedFeed(plannedFeed - 1)}
            >
              -1
            </button>
            <input
              aria-label="选择本次喂给小马的草料数量"
              disabled={!canControl}
              max={game.fodder}
              min={0}
              type="range"
              value={plannedFeed}
              onChange={(event) => updatePlannedFeed(Number(event.target.value))}
            />
            <button
              className={styles.stepButton}
              disabled={!canControl || plannedFeed >= game.fodder}
              type="button"
              onClick={() => updatePlannedFeed(plannedFeed + 1)}
            >
              +1
            </button>
          </div>

          <div className={styles.quickFeed}>
            {visibleFeedOptions.map((amount) => (
              <button
                className={amount === plannedFeed ? styles.quickFeedActive : ''}
                disabled={!canControl}
                key={amount}
                type="button"
                onClick={() => updatePlannedFeed(amount)}
              >
                {amount === 0 ? '不喂' : `${amount} 捆`}
              </button>
            ))}
          </div>

          <button
            className={styles.crossButton}
            disabled={!canControl}
            type="button"
            onClick={handleAttempt}
          >
            {plannedFeed === 0 ? '不喂草，直接过河' : `喂 ${plannedFeed} 捆草料并过河`}
          </button>
        </section>

        <section className={styles.history} aria-label="已过河流记录">
          <div className={styles.historyHeading}>
            <h2>过河记录</h2>
            <span>最近结果会揭示真实河深</span>
          </div>
          {game.history.length > 0 ? (
            <ol>
              {game.history.map((record) => (
                <li className={record.success ? styles.recordSuccess : styles.recordFailed} key={record.riverId}>
                  <strong>第 {record.riverId} 条河</strong>
                  <span>河深 {record.riverDepth} 米</span>
                  <span>身高 {record.ponyHeight} 米</span>
                  <span>{record.success ? `通过，获得 ${record.reward} 捆` : '失败，小马被淹没'}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p>还没有尝试过河。第一条河的深度仍是未知数。</p>
          )}
        </section>
      </div>
    </GameLayout>
  );
}

type StatusCardProps = {
  label: string;
  value: string;
};

function StatusCard({ label, value }: StatusCardProps) {
  return (
    <div className={styles.statusCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type PonyProps = {
  style: CSSProperties;
};

function Pony({ style }: PonyProps) {
  return (
    <div className={styles.pony} style={style} aria-label="小马">
      <span className={styles.tail} />
      <span className={styles.body} />
      <span className={styles.neck} />
      <span className={styles.head}>
        <i className={styles.ear} />
        <i className={styles.eye} />
        <i className={styles.muzzle} />
      </span>
      <span className={styles.mane} />
      <span className={styles.legOne} />
      <span className={styles.legTwo} />
      <span className={styles.legThree} />
      <span className={styles.legFour} />
      <span className={styles.ponyShadow} />
    </div>
  );
}

function getStatusTitle(status: PonyRiverGameState['status'], phase: AnimationPhase) {
  if (status === 'won') {
    return '通关成功';
  }

  if (status === 'lost') {
    return '过关失败';
  }

  if (phase === 'crossing') {
    return '正在过河';
  }

  if (phase === 'success') {
    return '安全抵达';
  }

  return '深度未知';
}

function getStatusText(
  game: PonyRiverGameState,
  phase: AnimationPhase,
  plannedFeed: number,
  lastOutcome: AttemptRecord | null,
) {
  if (phase === 'crossing') {
    return `小马带着 ${plannedFeed} 捆草料长到 ${getPonyHeight(defaultLevelConfig.baseHeight, plannedFeed)} 米，正试着趟过水面。`;
  }

  if (game.status === 'won') {
    return '小马已经通过全部小河，带着剩余草料抵达终点。';
  }

  if (game.status === 'lost' && lastOutcome) {
    return `第 ${lastOutcome.riverId} 条河实际深 ${lastOutcome.riverDepth} 米，小马只有 ${lastOutcome.ponyHeight} 米，没有成功过河。`;
  }

  if (phase === 'success' && lastOutcome) {
    return `第 ${lastOutcome.riverId} 条河深 ${lastOutcome.riverDepth} 米，小马成功过河并获得 ${lastOutcome.reward} 捆草料。`;
  }

  const currentRiver = getCurrentRiver(game);
  return currentRiver
    ? `第 ${currentRiver.id} 条河就在前方。你只知道还剩 ${getRemainingRiverCount(game)} 条河，下一条河深仍然保密。`
    : '没有剩余小河了。';
}
