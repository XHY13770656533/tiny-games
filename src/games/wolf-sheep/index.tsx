import type { CSSProperties, ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  addAnimalAtRandom,
  advanceEcosystem,
  animalProfiles,
  createInitialState,
  formatElapsedTime,
  getEcosystemMood,
  getSpeciesCounts,
  habitatLabels,
  meadowHeight,
  setEcosystemStatus,
  speciesOrder,
  type Animal,
  type EcosystemState,
  type SpeciesId,
} from './logic';
import styles from './styles.module.css';

const maxFrameDeltaMs = 64;

export default function WolfSheepGame() {
  const [ecosystem, setEcosystem] = useState<EcosystemState>(() => createInitialState());
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<SpeciesId>('rabbit');
  const lastFrameTimeRef = useRef<number | null>(null);

  const counts = useMemo(() => getSpeciesCounts(ecosystem.animals), [ecosystem.animals]);
  const selectedProfile = animalProfiles[selectedSpeciesId];
  const isRunning = ecosystem.status === 'running';
  const mood = getEcosystemMood(ecosystem);

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

  function handleSpeciesChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedSpeciesId(event.target.value as SpeciesId);
  }

  function handlePlaceAnimal() {
    setEcosystem((currentEcosystem) => addAnimalAtRandom(currentEcosystem, selectedSpeciesId));
  }

  return (
    <GameLayout
      title="狼吃羊生态"
      description="从狼与羊扩展出的多物种生态模拟。野兔、绵羊、梅花鹿、狐狸和灰狼拥有不同寿命、速度、体型、生命值、食物和天敌，会自动捕食、觅食、逃离危险，并根据环境偏好繁殖。"
      actions={
        <>
          <label className={styles.speciesPicker}>
            <span>投放物种</span>
            <select value={selectedSpeciesId} onChange={handleSpeciesChange}>
              {speciesOrder.map((speciesId) => (
                <option key={speciesId} value={speciesId}>
                  {animalProfiles[speciesId].name}
                </option>
              ))}
            </select>
          </label>
          <button className="button" type="button" onClick={handlePlaceAnimal}>
            随机投放{selectedProfile.name}
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
            <h2>物种属性</h2>
            <div className={styles.profileList}>
              {speciesOrder.map((speciesId) => (
                <SpeciesProfile key={speciesId} speciesId={speciesId} count={counts[speciesId]} />
              ))}
            </div>
          </section>
          <section>
            <h2>环境偏好</h2>
            <p>树林、湖泊、丘陵和草地会影响动物的移动方向、觅食效率和繁殖进度。玩家只能选择物种，投放位置会随机生成。</p>
          </section>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <section className={styles.dashboard} aria-label="生态统计">
          {speciesOrder.map((speciesId) => (
            <MetricCard
              key={speciesId}
              label={animalProfiles[speciesId].name}
              value={String(counts[speciesId])}
              detail={`已投放 ${ecosystem.placed[speciesId]} / 新生 ${ecosystem.births[speciesId]}`}
              speciesId={speciesId}
            />
          ))}
        </section>

        <section className={styles.statusPanel} aria-live="polite">
          <span className={isRunning ? styles.runningBadge : styles.pausedBadge}>
            {isRunning ? '模拟中' : '已暂停'}
          </span>
          <strong>{mood}</strong>
          <small>
            已模拟 {formatElapsedTime(ecosystem.elapsedMs)} · 捕食死亡 {ecosystem.deaths.predation} · 饥饿死亡 {ecosystem.deaths.starvation} · 自然死亡 {ecosystem.deaths.oldAge}
          </small>
        </section>

        <section className={styles.meadow} aria-label={`生态地图，当前共有 ${ecosystem.animals.length} 只动物`}>
          <MapEnvironment />
          {ecosystem.animals.map((animal) => (
            <AnimalView key={animal.id} animal={animal} />
          ))}
        </section>

        <section className={styles.legendPanel} aria-label="地图图例">
          <EnvironmentLegend />
          <div className={styles.eventPanel}>
            <h2>最近事件</h2>
            <ul>
              {ecosystem.eventLog.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </GameLayout>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  speciesId: SpeciesId;
};

function MetricCard({ label, value, detail, speciesId }: MetricCardProps) {
  const profile = animalProfiles[speciesId];

  return (
    <article className={styles.metricCard} style={{ '--species-color': profile.color } as CSSProperties}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function AnimalView({ animal }: { animal: Animal }) {
  const profile = animalProfiles[animal.speciesId];
  const hpRatio = Math.max(0, animal.hp / profile.maxHp);
  const hungerRatio = Math.max(0, 1 - animal.hungerMs / profile.hungerLimitMs);
  const className = [
    styles.animal,
    styles[`animal-${animal.speciesId}`],
    styles[`state-${animal.state}`],
  ].join(' ');
  const style = {
    '--x': `${animal.x}%`,
    '--y': `${(animal.y / meadowHeight) * 100}%`,
    '--animal-size': `${profile.size}rem`,
    '--animal-color': profile.color,
    '--hp-ratio': hpRatio.toFixed(2),
    '--hunger-ratio': hungerRatio.toFixed(2),
  } as CSSProperties;

  return (
    <span
      className={className}
      style={style}
      title={`${profile.name} · ${getStateLabel(animal.state)} · 生命 ${Math.ceil(animal.hp)}/${profile.maxHp}`}
      aria-hidden="true"
    >
      <span className={styles.animalLabel}>{profile.shortName}</span>
      <span className={styles.hpBar} />
      <span className={styles.hungerBar} />
    </span>
  );
}

function SpeciesProfile({ speciesId, count }: { speciesId: SpeciesId; count: number }) {
  const profile = animalProfiles[speciesId];
  const preyText = profile.preySpecies.length > 0
    ? profile.preySpecies.map((preyId) => animalProfiles[preyId].name).join('、')
    : profile.foodHabitats.map((habitatId) => habitatLabels[habitatId]).join('、');
  const predatorText = profile.predatorSpecies.length > 0
    ? profile.predatorSpecies.map((predatorId) => animalProfiles[predatorId].name).join('、')
    : '无';
  const habitatText = Object.entries(profile.preferredHabitats)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([habitatId]) => habitatLabels[habitatId as keyof typeof habitatLabels])
    .join('、');

  return (
    <article className={styles.profileCard} style={{ '--species-color': profile.color } as CSSProperties}>
      <div>
        <span>{profile.shortName}</span>
        <strong>{profile.name}</strong>
        <small>当前 {count} 只</small>
      </div>
      <p>{profile.description}</p>
      <dl>
        <div>
          <dt>生命</dt>
          <dd>{profile.maxHp}</dd>
        </div>
        <div>
          <dt>速度</dt>
          <dd>{profile.speed.toFixed(1)}</dd>
        </div>
        <div>
          <dt>寿命</dt>
          <dd>{(profile.lifespanMs / 1000).toFixed(0)} 秒</dd>
        </div>
        <div>
          <dt>繁殖</dt>
          <dd>{(profile.reproductionMs / 1000).toFixed(1)} 秒</dd>
        </div>
        <div>
          <dt>食物</dt>
          <dd>{preyText}</dd>
        </div>
        <div>
          <dt>天敌</dt>
          <dd>{predatorText}</dd>
        </div>
        <div>
          <dt>环境</dt>
          <dd>{habitatText}</dd>
        </div>
      </dl>
    </article>
  );
}

function MapEnvironment() {
  return (
    <div className={styles.environment} aria-hidden="true">
      <span className={styles.forestWest}>树林</span>
      <span className={styles.forestNorth}>树林</span>
      <span className={styles.lake}>湖泊</span>
      <span className={styles.hill}>丘陵</span>
      <span className={styles.grassLabel}>草地</span>
    </div>
  );
}

function EnvironmentLegend() {
  return (
    <div className={styles.environmentLegend}>
      <h2>环境</h2>
      <ul>
        <li><span className={styles.legendGrass} />草地：野兔、绵羊主要觅食地。</li>
        <li><span className={styles.legendForest} />树林：鹿和狐狸更容易稳定生活。</li>
        <li><span className={styles.legendLake} />湖泊：鹿会靠近取食，其他动物移动变慢。</li>
        <li><span className={styles.legendHill} />丘陵：绵羊适应较好，其他动物略受影响。</li>
      </ul>
    </div>
  );
}

function getStateLabel(state: Animal['state']) {
  if (state === 'hunting') {
    return '正在捕食';
  }

  if (state === 'fleeing') {
    return '正在逃离天敌';
  }

  return '正在觅食';
}
