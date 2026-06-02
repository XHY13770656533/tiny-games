import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  advanceEcosystem,
  createInitialState,
  formatElapsedTime,
  getEcosystemMood,
  getSafeSheepCount,
  killRandomWolf,
  meadowHeight,
  setEcosystemStatus,
  sheepReproductionMs,
  wolfStarveMs,
  type EcosystemState,
  type Sheep,
  type Wolf,
} from './logic';
import styles from './styles.module.css';

const maxFrameDeltaMs = 64;

export default function WolfSheepGame() {
  const [ecosystem, setEcosystem] = useState<EcosystemState>(() => createInitialState());
  const lastFrameTimeRef = useRef<number | null>(null);

  const safeSheepCount = useMemo(() => getSafeSheepCount(ecosystem.sheep), [ecosystem.sheep]);
  const mood = getEcosystemMood(ecosystem);
  const isRunning = ecosystem.status === 'running';

  useEffect(() => {
    if (!isRunning) {
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
      setEcosystem((currentEcosystem) => advanceEcosystem(currentEcosystem, deltaMs));
      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [isRunning]);

  function resetGame() {
    setEcosystem(createInitialState());
  }

  function togglePause() {
    setEcosystem((currentEcosystem) => (
      setEcosystemStatus(currentEcosystem, currentEcosystem.status === 'running' ? 'paused' : 'running')
    ));
  }

  function handleKillWolf() {
    setEcosystem((currentEcosystem) => killRandomWolf(currentEcosystem));
  }

  return (
    <GameLayout
      title="狼吃羊"
      description="观察一个固定草场里的捕食生态：白色小球是羊，灰色小球是狼。狼会主动追逐并吃掉羊，安全的羊会繁殖，吃到羊的狼会诞生新狼，长时间抓不到羊的狼会饿死。"
      actions={
        <>
          <button className="button" type="button" onClick={handleKillWolf} disabled={ecosystem.wolves.length === 0}>
            随机杀死一只狼
          </button>
          <button className={styles.secondaryButton} type="button" onClick={togglePause}>
            {isRunning ? '暂停观察' : '继续模拟'}
          </button>
          <button className={styles.secondaryButton} type="button" onClick={resetGame}>
            重新开始
          </button>
        </>
      }
      aside={
        <div className={styles.asideContent}>
          <section>
            <h2>生态规则</h2>
            <ul>
              <li>羊周围没有狼时进入安全状态，安全计时满 {(sheepReproductionMs / 1000).toFixed(1)} 秒会生出新羊。</li>
              <li>狼会追逐最近的羊，吃掉羊后立刻刷新饥饿值，并在附近生出新狼。</li>
              <li>狼超过 {(wolfStarveMs / 1000).toFixed(1)} 秒没有吃到羊就会饿死，羊不会饿死。</li>
            </ul>
          </section>
          <section>
            <h2>玩家目标</h2>
            <p>用“随机杀死一只狼”按钮干预狼群数量。狼太多会吃光羊，狼太少又会让羊快速扩张，尽量让两种数量长期共存。</p>
          </section>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <section className={styles.dashboard} aria-label="生态统计">
          <MetricCard label="羊群" value={String(ecosystem.sheep.length)} detail={`${safeSheepCount} 只处于安全状态`} />
          <MetricCard label="狼群" value={String(ecosystem.wolves.length)} detail={`${ecosystem.wolvesKilledByPlayer} 只被玩家清除`} />
          <MetricCard label="被吃掉的羊" value={String(ecosystem.sheepEaten)} detail={`新生狼 ${ecosystem.wolvesBorn} 只`} />
          <MetricCard label="饿死的狼" value={String(ecosystem.wolvesStarved)} detail={`已模拟 ${formatElapsedTime(ecosystem.elapsedMs)}`} />
        </section>

        <section className={styles.statusPanel} aria-live="polite">
          <span className={isRunning ? styles.runningBadge : styles.pausedBadge}>
            {isRunning ? '模拟中' : '已暂停'}
          </span>
          <strong>{mood}</strong>
        </section>

        <section className={styles.meadow} aria-label={`狼吃羊草场，当前有 ${ecosystem.sheep.length} 只羊和 ${ecosystem.wolves.length} 只狼`}>
          <div className={styles.landscape} aria-hidden="true">
            <span className={styles.treeOne} />
            <span className={styles.treeTwo} />
            <span className={styles.pond} />
          </div>

          {ecosystem.sheep.map((sheep) => (
            <SheepView key={sheep.id} sheep={sheep} />
          ))}

          {ecosystem.wolves.map((wolf) => (
            <WolfView key={wolf.id} wolf={wolf} />
          ))}
        </section>

        <section className={styles.eventPanel} aria-label="生态事件">
          <h2>最近事件</h2>
          <ul>
            {ecosystem.eventLog.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
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
    <article className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function SheepView({ sheep }: { sheep: Sheep }) {
  const className = [
    styles.animal,
    styles.sheep,
    sheep.isSafe ? styles.safeSheep : styles.alertSheep,
  ].join(' ');

  return (
    <span
      className={className}
      style={getAnimalStyle(sheep)}
      title={sheep.isSafe ? '安全羊：正在累积繁殖计时' : '危险羊：附近有狼'}
      aria-hidden="true"
    >
      <span className={styles.safeRing} />
    </span>
  );
}

function WolfView({ wolf }: { wolf: Wolf }) {
  const foodRatio = Math.max(0, 1 - wolf.hungerMs / wolfStarveMs);
  const style = {
    ...getAnimalStyle(wolf),
    '--food-ratio': foodRatio.toFixed(2),
  } as CSSProperties;

  return (
    <span className={[styles.animal, styles.wolf].join(' ')} style={style} title="狼：正在追逐最近的羊" aria-hidden="true">
      <span className={styles.hungerBar} />
    </span>
  );
}

function getAnimalStyle(animal: { x: number; y: number }) {
  return {
    '--x': `${animal.x}%`,
    '--y': `${(animal.y / meadowHeight) * 100}%`,
  } as CSSProperties;
}
