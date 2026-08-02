import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  advanceRun,
  canTriggerDash,
  createInitialState,
  flipWorld,
  getJumpHeight,
  getRoleForSide,
  getShadowEnergyRatio,
  isDashing,
  maxShadowEnergy,
  requestDash,
  requestJump,
  runnerX,
  startRun,
  type MirrorFlyerState,
  type Obstacle,
  type Pickup,
  type RunnerRole,
  type WorldSide,
} from './logic';
import styles from './styles.module.css';

const highScoreKey = 'tiny-games:mirror-flyer:high-score';
const maxFrameDeltaMs = 48;

export default function MirrorFlyerGame() {
  const [game, setGame] = useState<MirrorFlyerState>(() => createInitialState());
  const [highScore, setHighScore] = useLocalStorage<number>(highScoreKey, 0);
  const lastFrameTimeRef = useRef<number | null>(null);

  const jumpHeight = getJumpHeight(game.jumpElapsedMs);
  const topRole = getRoleForSide(game.realSide, 'top');
  const bottomRole = getRoleForSide(game.realSide, 'bottom');
  const statusLabel = getStatusLabel(game);
  const speedLabel = `${(game.speed * 1000).toFixed(1)}%/秒`;
  const realSideLabel = game.realSide === 'top' ? '上半场' : '下半场';
  const bestScore = Math.max(highScore, game.score);
  const energyRatio = getShadowEnergyRatio(game.shadowEnergy);
  const dashReady = canTriggerDash(game);
  const dashing = isDashing(game);

  const upcomingHint = useMemo(() => {
    if (dashing) {
      return '暗影冲刺中：加速前进，并无视所有障碍。';
    }

    const nextObstacle = game.obstacles
      .filter((obstacle) => obstacle.x + obstacle.width > runnerX)
      .sort((a, b) => a.x - b.x)[0];
    const nextPickup = game.pickups
      .filter((pickup) => pickup.x + pickup.width > runnerX)
      .sort((a, b) => a.x - b.x)[0];

    if (nextPickup && (!nextObstacle || nextPickup.x < nextObstacle.x)) {
      const lane = nextPickup.side === 'top' ? '上方' : '下方';
      const role = getRoleForSide(game.realSide, nextPickup.side);

      if (nextPickup.type === 'coin') {
        return role === 'entity'
          ? `${lane}金币对准实体，直接冲过去拾取。`
          : `${lane}金币在影子一侧，翻转后才能由实体拾取。`;
      }

      return role === 'shadow'
        ? `${lane}暗影能量交给影子拾取，积攒冲刺条。`
        : `${lane}暗影能量在实体一侧，翻转后交给影子吸收。`;
    }

    if (!nextObstacle) {
      return '观察上下两条路线，等待下一组障碍或拾取物进入视野。';
    }

    const role = getRoleForSide(game.realSide, nextObstacle.side);
    const lane = nextObstacle.side === 'top' ? '上方' : '下方';

    if (nextObstacle.type === 'phaseGate') {
      return role === 'entity'
        ? `${lane}相位门正对实体，准备翻转世界让影子穿过。`
        : `${lane}相位门当前交给影子，可以保持路线。`;
    }

    return `${lane}普通路障接近，提前跳跃会让实体和影子同步越障。`;
  }, [dashing, game.obstacles, game.pickups, game.realSide]);

  const stageStyle = {
    '--jump-offset': `${jumpHeight * 6.4}rem`,
    '--stripe-speed': `${Math.max(0.36, 1.95 - game.speed * 30)}s`,
  } as CSSProperties;

  const energyStyle = {
    '--energy-ratio': String(dashing ? 1 : energyRatio),
  } as CSSProperties;

  useEffect(() => {
    if (game.status !== 'running') {
      lastFrameTimeRef.current = null;
      return undefined;
    }

    let frameId = 0;

    function tick(now: number) {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = now;
      }

      const deltaMs = Math.min(maxFrameDeltaMs, now - lastFrameTimeRef.current);
      lastFrameTimeRef.current = now;
      setGame((currentGame) => advanceRun(currentGame, deltaMs));
      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [game.status]);

  useEffect(() => {
    if (game.status === 'crashed') {
      setHighScore((currentHighScore) => Math.max(currentHighScore, game.score));
    }
  }, [game.score, game.status, setHighScore]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault();
        handleJump();
        return;
      }

      if (event.code === 'KeyF' || event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault();
        handleFlip();
        return;
      }

      if (event.code === 'KeyD' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        event.preventDefault();
        handleDash();
        return;
      }

      if (event.code === 'Enter') {
        event.preventDefault();
        setGame(startRun());
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleJump() {
    setGame((currentGame) => {
      if (currentGame.status === 'ready') {
        return requestJump(startRun());
      }

      return requestJump(currentGame);
    });
  }

  function handleFlip() {
    setGame((currentGame) => flipWorld(currentGame));
  }

  function handleDash() {
    setGame((currentGame) => requestDash(currentGame));
  }

  function resetGame() {
    setGame(createInitialState());
  }

  return (
    <GameLayout
      title="镜像飞侠"
      description="在上下对称的双世界中奔跑。实体拾取金币，影子吸收暗影能量；能量攒满后可主动冲刺，加速并无视障碍。"
      actions={
        <>
          <button className="button" type="button" onClick={() => setGame(startRun())}>
            {game.status === 'running' ? '重新起跑' : '开始奔跑'}
          </button>
          <button className={styles.headerButton} type="button" onClick={resetGame}>
            重置
          </button>
        </>
      }
      aside={
        <div className={styles.asideContent}>
          <section>
            <h2>操作方式</h2>
            <ul>
              <li>跳跃：空格、W、方向键上，或点击“跳跃”。</li>
              <li>翻转：F、S、方向键下，或点击“翻转世界”。</li>
              <li>冲刺：D、Shift，或点击“暗影冲刺”（能量满时可用）。</li>
              <li>按 Enter 可以快速重新起跑。</li>
            </ul>
          </section>
          <section>
            <h2>镜像规则</h2>
            <p>
              初始上半场是真实世界，实体在上方奔跑；下半场是镜像世界，影子同步做出镜像跳跃。翻转后真实世界会交换到另一侧，实体和影子的身份也随之互换。
            </p>
          </section>
          <section>
            <h2>拾取与冲刺</h2>
            <ul>
              <li>金色硬币：只可由实体拾取，增加得分。</li>
              <li>紫色暗影能量：只可由影子吸收，填满能量条。</li>
              <li>能量满后主动触发冲刺：短时加速，并无视所有障碍。</li>
            </ul>
          </section>
          <section>
            <h2>障碍类型</h2>
            <ul>
              <li>蓝紫路障：实体或影子碰到都会失败，需要提前跳过。</li>
              <li>红色相位门：影子可以穿过，实体无法通过，看到它对准实体时要翻转世界。</li>
            </ul>
          </section>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <section className={styles.scoreboard} aria-label="镜像飞侠状态">
          <MetricCard label="状态" value={statusLabel} detail={upcomingHint} />
          <MetricCard label="得分" value={String(game.score)} detail={`金币 ${game.coins} 枚 · 存活加分`} />
          <MetricCard label="最高分" value={String(bestScore)} detail="本地保存" />
          <MetricCard label="真实世界" value={realSideLabel} detail={`当前速度 ${speedLabel}`} />
        </section>

        <section className={styles.energyPanel} style={energyStyle} aria-label="暗影能量">
          <div className={styles.energyHeader}>
            <span>暗影能量</span>
            <strong>
              {dashing
                ? '冲刺中'
                : dashReady
                  ? '可冲刺'
                  : `${Math.round(game.shadowEnergy)} / ${maxShadowEnergy}`}
            </strong>
          </div>
          <div
            className={[
              styles.energyTrack,
              dashReady ? styles.energyReady : '',
              dashing ? styles.energyDashing : '',
            ].join(' ')}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maxShadowEnergy}
            aria-valuenow={dashing ? maxShadowEnergy : Math.round(game.shadowEnergy)}
            aria-label="暗影能量累计条"
          >
            <div className={styles.energyFill} />
          </div>
          <p>
            {dashing
              ? '冲刺持续期间无视障碍，结束后能量重新累计。'
              : dashReady
                ? '能量已满，按 D / Shift 或点击下方按钮触发暗影冲刺。'
                : '影子拾取紫色能量球可累计；实体负责捡金色硬币。'}
          </p>
        </section>

        <section
          className={[styles.stage, dashing ? styles.stageDashing : ''].join(' ')}
          style={stageStyle}
          aria-label="镜像飞侠跑酷场景"
        >
          <WorldPanel side="top" role={topRole} />
          <WorldPanel side="bottom" role={bottomRole} />
          <div className={styles.axisLine} aria-hidden="true">
            <span>Mirror Axis</span>
          </div>

          {game.obstacles.map((obstacle) => (
            <ObstacleView key={obstacle.id} obstacle={obstacle} faded={dashing} />
          ))}

          {game.pickups.map((pickup) => (
            <PickupView key={pickup.id} pickup={pickup} />
          ))}

          <Runner side="top" role={topRole} dashing={dashing} />
          <Runner side="bottom" role={bottomRole} dashing={dashing} />

          {game.status !== 'running' ? (
            <div className={styles.overlay} aria-live="polite">
              <strong>{game.status === 'crashed' ? '镜像断裂' : '准备穿越镜面跑道'}</strong>
              <p>{game.crash?.message ?? '点击开始奔跑，或直接按空格起跳开始。'}</p>
              <button className="button" type="button" onClick={() => setGame(startRun())}>
                {game.status === 'crashed' ? '再跑一次' : '开始奔跑'}
              </button>
            </div>
          ) : null}
        </section>

        <section className={styles.controlDeck} aria-label="跑酷操作">
          <button className={styles.controlButton} type="button" onClick={handleJump} disabled={game.status === 'crashed'}>
            <span>跳跃</span>
            <small>Space / W / ↑</small>
          </button>
          <button className={styles.controlButton} type="button" onClick={handleFlip} disabled={game.status !== 'running'}>
            <span>翻转世界</span>
            <small>F / S / ↓</small>
          </button>
          <button
            className={[styles.controlButton, styles.dashButton, dashReady ? styles.dashReady : ''].join(' ')}
            type="button"
            onClick={handleDash}
            disabled={!dashReady}
          >
            <span>{dashing ? '冲刺中' : '暗影冲刺'}</span>
            <small>D / Shift</small>
          </button>
        </section>
      </div>
    </GameLayout>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

type WorldPanelProps = {
  side: WorldSide;
  role: RunnerRole;
};

function WorldPanel({ side, role }: WorldPanelProps) {
  const isReal = role === 'entity';

  return (
    <div
      className={[
        styles.world,
        side === 'top' ? styles.topWorld : styles.bottomWorld,
        isReal ? styles.realWorld : styles.mirrorWorld,
      ].join(' ')}
      aria-hidden="true"
    >
      <div className={styles.worldLabel}>
        <span>{isReal ? '真实世界' : '镜像世界'}</span>
        <strong>{role === 'entity' ? '实体' : '影子'}</strong>
      </div>
      <div className={styles.trackStripes} />
    </div>
  );
}

type RunnerProps = {
  side: WorldSide;
  role: RunnerRole;
  dashing: boolean;
};

function Runner({ side, role, dashing }: RunnerProps) {
  return (
    <div
      className={[
        styles.runner,
        side === 'top' ? styles.topRunner : styles.bottomRunner,
        role === 'entity' ? styles.entityRunner : styles.shadowRunner,
        dashing ? styles.runnerDashing : '',
      ].join(' ')}
      aria-label={`${side === 'top' ? '上方' : '下方'}${role === 'entity' ? '实体' : '影子'}`}
    >
      <span className={styles.runnerCape} />
      <span className={styles.runnerBody}>{role === 'entity' ? '实' : '影'}</span>
      <span className={styles.runnerTrail} />
    </div>
  );
}

type ObstacleViewProps = {
  obstacle: Obstacle;
  faded: boolean;
};

function ObstacleView({ obstacle, faded }: ObstacleViewProps) {
  const isPhaseGate = obstacle.type === 'phaseGate';
  const style = {
    left: `${obstacle.x}%`,
    width: `${obstacle.width}%`,
  };

  return (
    <div
      className={[
        styles.obstacle,
        obstacle.side === 'top' ? styles.topObstacle : styles.bottomObstacle,
        isPhaseGate ? styles.phaseGate : styles.barrier,
        faded ? styles.obstacleFaded : '',
      ].join(' ')}
      style={style}
      aria-hidden="true"
    >
      <span>{isPhaseGate ? '相' : ''}</span>
    </div>
  );
}

type PickupViewProps = {
  pickup: Pickup;
};

function PickupView({ pickup }: PickupViewProps) {
  const isCoin = pickup.type === 'coin';
  const style = {
    left: `${pickup.x}%`,
    width: `${pickup.width}%`,
  };

  return (
    <div
      className={[
        styles.pickup,
        pickup.side === 'top' ? styles.topPickup : styles.bottomPickup,
        isCoin ? styles.coinPickup : styles.energyPickup,
      ].join(' ')}
      style={style}
      aria-hidden="true"
    >
      <span>{isCoin ? '币' : '能'}</span>
    </div>
  );
}

function getStatusLabel(game: MirrorFlyerState) {
  if (game.status === 'ready') {
    return '待命';
  }

  if (game.status === 'crashed') {
    return '失败';
  }

  if (isDashing(game)) {
    return '冲刺中';
  }

  return '奔跑中';
}
