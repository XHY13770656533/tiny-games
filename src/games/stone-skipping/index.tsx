import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  createStoneOptions,
  getInitialSpeedMps,
  getSpinRps,
  getStoneQuality,
  getStoneShapeLabel,
  simulateStoneSkip,
  type SkipRecord,
  type SkipResult,
  type StoneProfile,
  type ThrowControls,
} from './logic';
import styles from './styles.module.css';

type HighScore = {
  score: number;
  skips: number;
  distance: number;
};

const initialControls: ThrowControls = {
  angleDeg: 11,
  power: 72,
  spin: 66,
};

export default function StoneSkippingGame() {
  const [stoneOptions, setStoneOptions] = useState<StoneProfile[]>(() => createStoneOptions());
  const [selectedStoneId, setSelectedStoneId] = useState(() => stoneOptions[0]?.id ?? '');
  const [controls, setControls] = useState<ThrowControls>(initialControls);
  const [lastResult, setLastResult] = useState<SkipResult | null>(null);
  const [throwCount, setThrowCount] = useState(0);
  const [highScore, setHighScore] = useLocalStorage<HighScore | null>('tiny-games:stone-skipping:high-score', null);

  const selectedStone = stoneOptions.find((stone) => stone.id === selectedStoneId) ?? stoneOptions[0];
  const speedMps = getInitialSpeedMps(controls.power);
  const spinRps = getSpinRps(controls.spin);
  const quality = selectedStone ? getStoneQuality(selectedStone) : 0;
  const bestDistance = Math.max(highScore?.distance ?? 0, lastResult?.totalDistanceMeters ?? 0);

  const trajectory = useMemo(() => {
    if (!lastResult) {
      return {
        points: '50,94 54,78 56,64 55,50',
        records: [] as Array<SkipRecord & { screenX: number; screenY: number }>,
      };
    }

    return buildTrajectory(lastResult.skips, lastResult.totalDistanceMeters);
  }, [lastResult]);

  function updateControl(key: keyof ThrowControls, value: number) {
    setControls((currentControls) => ({
      ...currentControls,
      [key]: value,
    }));
  }

  function refreshStones() {
    const nextOptions = createStoneOptions();
    setStoneOptions(nextOptions);
    setSelectedStoneId(nextOptions[0]?.id ?? '');
    setLastResult(null);
  }

  function resetGame() {
    setControls(initialControls);
    setStoneOptions(createStoneOptions());
    setSelectedStoneId('');
    setLastResult(null);
    setThrowCount(0);
  }

  function handleThrow() {
    if (!selectedStone) {
      return;
    }

    const result = simulateStoneSkip(selectedStone, controls);
    setLastResult(result);
    setThrowCount((currentCount) => currentCount + 1);
    setHighScore((currentHighScore) => {
      if (!currentHighScore || result.score > currentHighScore.score) {
        return {
          score: result.score,
          skips: result.skips.length,
          distance: result.totalDistanceMeters,
        };
      }

      return currentHighScore;
    });
  }

  return (
    <GameLayout
      title="打水漂模拟器"
      description="第一人称站在湖边挑选石头，调整入水角、力度和转速后投掷。系统会按石头质量、扁平度、入水角、升力冲量、旋转稳定性与能量衰减近似模拟每一次弹跳。"
      actions={
        <>
          <button className="button" type="button" onClick={handleThrow}>
            投掷石头
          </button>
          <button className={styles.headerButton} type="button" onClick={resetGame}>
            重新开始
          </button>
        </>
      }
      aside={
        <div className={styles.asideContent}>
          <section>
            <h2>物理近似</h2>
            <p>
              每次触水都会计算水面动压、石头投影面积和质量带来的升力冲量；角度越接近 10-14 度、转速越稳定、石头越薄越圆，越容易继续弹起。
            </p>
          </section>
          <section>
            <h2>调参提示</h2>
            <ul>
              <li>低角度更容易贴水，但低于 4 度可能只会擦水失速。</li>
              <li>高力度提升初速，也会让远端弹跳更吃角度稳定性。</li>
              <li>转速提供陀螺稳定；不规则石头需要更高转速来抵消翻滚。</li>
            </ul>
          </section>
          <section>
            <h2>本地纪录</h2>
            <p>
              {highScore
                ? `最高 ${highScore.score} 分，${highScore.skips} 次弹跳，${highScore.distance.toFixed(1)} 米。`
                : '还没有纪录，先投出第一块石头。'}
            </p>
          </section>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <section className={styles.scoreboard} aria-label="当前投掷状态">
          <MetricCard label="初速度" value={`${speedMps.toFixed(1)} m/s`} detail="由力度决定" />
          <MetricCard label="转速" value={`${spinRps.toFixed(1)} r/s`} detail="影响姿态稳定" />
          <MetricCard label="石头适性" value={`${Math.round(quality * 100)}%`} detail="形状综合评分" />
          <MetricCard label="最好距离" value={`${bestDistance.toFixed(1)} m`} detail={`${throwCount} 次投掷`} />
        </section>

        <section className={styles.hero} aria-label="第一人称打水漂湖面">
          <div className={styles.sky} aria-hidden="true">
            <span className={styles.sun} />
            <span className={styles.cloudOne} />
            <span className={styles.cloudTwo} />
          </div>
          <div className={styles.horizon} aria-hidden="true" />
          <div className={styles.farBank} aria-hidden="true" />
          <div className={styles.lake} aria-hidden="true" />
          <div className={styles.dock} aria-hidden="true" />

          <svg className={styles.trajectorySvg} viewBox="0 0 100 100" role="img" aria-label="水漂弹跳轨迹">
            <polyline className={styles.trajectoryPath} points={trajectory.points} />
            {trajectory.records.map((record) => (
              <g key={record.index}>
                <ellipse
                  className={styles.splashRing}
                  cx={record.screenX}
                  cy={record.screenY}
                  rx={3.2 + record.splashSize * 1.7}
                  ry={0.9 + record.splashSize * 0.55}
                />
                <circle className={styles.skipDot} cx={record.screenX} cy={record.screenY} r={0.62} />
              </g>
            ))}
            {trajectory.records.length > 0 ? (
              <circle
                className={styles.stoneMarker}
                cx={trajectory.records[trajectory.records.length - 1].screenX}
                cy={trajectory.records[trajectory.records.length - 1].screenY}
                r="1.2"
              />
            ) : null}
          </svg>

          <div className={styles.hand} aria-hidden="true">
            <span className={styles.thumb} />
            <span
              className={[
                styles.stoneInHand,
                selectedStone ? styles[`stone-${selectedStone.shape}`] : '',
              ].filter(Boolean).join(' ')}
              style={getStoneStyle(selectedStone)}
            />
          </div>

          <div className={styles.resultBanner} aria-live="polite">
            {lastResult ? (
              <>
                <strong>{lastResult.grade}</strong>
                <span>
                  {lastResult.skips.length} 次弹跳，{lastResult.totalDistanceMeters.toFixed(1)} 米，{lastResult.score} 分。
                </span>
              </>
            ) : (
              <>
                <strong>站在湖边</strong>
                <span>挑选一块石头，调整参数后观察它在水面上的弹跳轨迹。</span>
              </>
            )}
          </div>
        </section>

        <section className={styles.controlPanel} aria-label="投掷参数">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Throw Setup</p>
              <h2>调整出手姿态</h2>
            </div>
            <p>{getControlAdvice(controls, selectedStone)}</p>
          </div>

          <div className={styles.controlGrid}>
            <ControlSlider
              label="入水角"
              max={24}
              min={3}
              suffix="度"
              value={controls.angleDeg}
              onChange={(value) => updateControl('angleDeg', value)}
            />
            <ControlSlider
              label="力度"
              max={100}
              min={25}
              suffix="%"
              value={controls.power}
              onChange={(value) => updateControl('power', value)}
            />
            <ControlSlider
              label="转速"
              max={100}
              min={0}
              suffix="%"
              value={controls.spin}
              onChange={(value) => updateControl('spin', value)}
            />
          </div>

          <button className={styles.throwButton} type="button" onClick={handleThrow}>
            以 {controls.angleDeg} 度、{controls.power}% 力度、{controls.spin}% 转速投掷
          </button>
        </section>

        <section className={styles.stoneShelf} aria-label="选择本次投掷的石头">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Stone Tray</p>
              <h2>本次可选石头</h2>
            </div>
            <button className={styles.refreshButton} type="button" onClick={refreshStones}>
              刷新石头
            </button>
          </div>

          <div className={styles.stoneGrid}>
            {stoneOptions.map((stone) => (
              <StoneOption
                isSelected={stone.id === selectedStone?.id}
                key={stone.id}
                stone={stone}
                onSelect={() => setSelectedStoneId(stone.id)}
              />
            ))}
          </div>
        </section>

        <section className={styles.resultLog} aria-label="最近一次投掷结果">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Replay</p>
              <h2>物理回放</h2>
            </div>
            {lastResult ? <span>{lastResult.endingReason}</span> : <span>投掷后会列出每次触水数据。</span>}
          </div>

          {lastResult ? (
            <>
              <p className={styles.openingComment}>{lastResult.openingComment}</p>
              <div className={styles.recordGrid}>
                {lastResult.skips.length > 0 ? (
                  lastResult.skips.slice(0, 12).map((record) => (
                    <article className={styles.recordCard} key={record.index}>
                      <strong>第 {record.index} 跳</strong>
                      <span>{record.distanceMeters.toFixed(1)} m</span>
                      <small>
                        速度 {record.speedMps.toFixed(1)} m/s · 入水 {record.angleDeg.toFixed(1)} 度 · 接触质量{' '}
                        {Math.round(record.contactQuality * 100)}%
                      </small>
                    </article>
                  ))
                ) : (
                  <p className={styles.emptyText}>没有形成有效弹跳。降低入水角、提高转速，或换一块更薄更平的石头。</p>
                )}
              </div>
            </>
          ) : (
            <p className={styles.emptyText}>还没有投掷记录。随机生成的石头会让每一局拥有不同手感。</p>
          )}
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

type ControlSliderProps = {
  label: string;
  min: number;
  max: number;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
};

function ControlSlider({ label, min, max, suffix, value, onChange }: ControlSliderProps) {
  return (
    <label className={styles.controlItem}>
      <span>
        {label}
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        max={max}
        min={min}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small>
        {min}
        {suffix} - {max}
        {suffix}
      </small>
    </label>
  );
}

type StoneOptionProps = {
  stone: StoneProfile;
  isSelected: boolean;
  onSelect: () => void;
};

function StoneOption({ stone, isSelected, onSelect }: StoneOptionProps) {
  const quality = getStoneQuality(stone);
  const className = [
    styles.stoneCard,
    isSelected ? styles.stoneSelected : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={className} type="button" onClick={onSelect}>
      <span
        className={[styles.stonePreview, styles[`stone-${stone.shape}`]].join(' ')}
        style={getStoneStyle(stone)}
      />
      <span className={styles.stoneTitle}>
        <strong>{stone.name}</strong>
        <small>{getStoneShapeLabel(stone.shape)}</small>
      </span>
      <span className={styles.stoneNumbers}>
        <small>{stone.massGrams}g</small>
        <small>{stone.diameterCm.toFixed(1)}cm</small>
        <small>{stone.thicknessCm.toFixed(1)}cm 厚</small>
      </span>
      <span className={styles.statList}>
        <StoneStat label="扁平" value={stone.flatness} />
        <StoneStat label="圆整" value={stone.roundness} />
        <StoneStat label="稳定" value={stone.balance} />
        <StoneStat label="适性" value={quality} />
      </span>
    </button>
  );
}

type StoneStatProps = {
  label: string;
  value: number;
};

function StoneStat({ label, value }: StoneStatProps) {
  return (
    <span className={styles.stoneStat}>
      <small>{label}</small>
      <i>
        <b style={{ '--stat-value': `${Math.round(value * 100)}%` } as CSSProperties} />
      </i>
    </span>
  );
}

function getStoneStyle(stone?: StoneProfile) {
  return {
    '--stone-color': stone?.color ?? '#64748b',
    '--stone-flatness': stone ? 0.55 + stone.flatness * 0.45 : 0.85,
    '--stone-roundness': stone ? `${42 + stone.roundness * 30}%` : '62%',
  } as CSSProperties;
}

function buildTrajectory(skips: SkipRecord[], totalDistance: number) {
  const maxDistance = Math.max(12, totalDistance * 1.08);
  const maxLateral = Math.max(3, ...skips.map((record) => Math.abs(record.lateralMeters))) + 1.5;
  const records = skips.map((record) => {
    const distanceRatio = Math.min(1, record.distanceMeters / maxDistance);
    const perspective = 1 - distanceRatio * 0.48;

    return {
      ...record,
      screenX: roundForSvg(50 + (record.lateralMeters / maxLateral) * 34 * perspective),
      screenY: roundForSvg(91 - Math.sqrt(distanceRatio) * 61),
    };
  });
  const points = [
    '50,94',
    ...records.map((record) => `${record.screenX},${record.screenY}`),
  ].join(' ');

  return { points, records };
}

function roundForSvg(value: number) {
  return Math.round(value * 10) / 10;
}

function getControlAdvice(controls: ThrowControls, stone?: StoneProfile) {
  if (!stone) {
    return '先选择一块石头。';
  }

  const quality = getStoneQuality(stone);
  if (controls.angleDeg > 18) {
    return '角度偏陡，除非力度很高，否则容易第一次触水就损失能量。';
  }

  if (controls.angleDeg < 5) {
    return '角度很贴水，适合薄石片；厚石头可能会擦水后失速。';
  }

  if (controls.spin < 35 && quality < 0.65) {
    return '这块石头不够稳定，建议提高转速来减少翻滚。';
  }

  if (controls.power < 48) {
    return '力度偏低，适合练习近距离连续弹跳。';
  }

  return '参数比较均衡，可以投掷观察水面回放。';
}
