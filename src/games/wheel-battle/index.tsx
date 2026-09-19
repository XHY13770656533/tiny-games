import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  addSector,
  beginSpin,
  canSpin,
  canUpgrade,
  createDefaultMeta,
  createInitialState,
  equalizeWheel,
  getActiveEffectLabels,
  getArmorCap,
  getCategoryLabel,
  getSegmentCenterAngle,
  getSector,
  getSectorPower,
  getTelegraph,
  getUpgradeLevel,
  isCombatPhase,
  isUpgradable,
  levels,
  lockWheelAndStartLevel,
  normalizeMeta,
  recommendedWheel,
  removeSector,
  resizeSector,
  retryLevel,
  sectorCatalog,
  settleRun,
  tick,
  upgradeCost,
  upgradeSector,
  buildWheelGradient,
  type MetaProgress,
  type SectorId,
  type UpgradeLevel,
  type WheelBattleState,
} from './logic';
import { drawBattlefield } from './render';
import styles from './styles.module.css';

const highScoreKey = 'tiny-games:wheel-battle:high-score';
const coinsKey = 'tiny-games:wheel-battle:coins';
const upgradesKey = 'tiny-games:wheel-battle:upgrades';
const unlockedKey = 'tiny-games:wheel-battle:unlocked';
const maxFrameDeltaMs = 48;
const spinTurns = 4;

export default function WheelBattleGame() {
  const [highScore, setHighScore] = useLocalStorage(highScoreKey, 0);
  const [coins, setCoins] = useLocalStorage(coinsKey, 0);
  const [upgrades, setUpgrades] = useLocalStorage(upgradesKey, createDefaultMeta().upgrades);
  const [unlocked, setUnlocked] = useLocalStorage(unlockedKey, createDefaultMeta().unlockedSectors);
  const meta = useMemo(
    () => normalizeMeta({ coins, upgrades, unlockedSectors: unlocked }),
    [coins, upgrades, unlocked],
  );
  const [game, setGame] = useState<WheelBattleState>(() => createInitialState(meta));
  const [wheelRotation, setWheelRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef(game);
  const lastFrameRef = useRef<number | null>(null);
  const lastHudRef = useRef(0);
  const spinRequestRef = useRef(false);
  const pauseRequestRef = useRef(false);

  gameRef.current = game;

  useEffect(() => {
    setCoins(game.meta.coins);
    setUpgrades(game.meta.upgrades);
    setUnlocked(game.meta.unlockedSectors);
  }, [game.meta, setCoins, setUpgrades, setUnlocked]);

  useEffect(() => {
    if (game.phase === 'settlement') {
      setHighScore((current) => Math.max(current, game.score));
    }
  }, [game.phase, game.score, setHighScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    function resize() {
      const target = canvasRef.current;
      if (!target?.parentElement) {
        return;
      }
      const width = target.parentElement.clientWidth;
      const height = Math.round(width * 1.15);
      const dpr = window.devicePixelRatio || 1;
      target.width = Math.floor(width * dpr);
      target.height = Math.floor(height * dpr);
      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [game.phase]);

  useEffect(() => {
    if (!isCombatPhase(game.phase)) {
      lastFrameRef.current = null;
      paint(game);
      return undefined;
    }

    let frameId = 0;

    function loop(now: number) {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = now;
      }
      const delta = Math.min(maxFrameDeltaMs, now - lastFrameRef.current);
      lastFrameRef.current = now;
      let current = gameRef.current;

      let didInput = false;
      if (pauseRequestRef.current) {
        current = { ...current, paused: !current.paused };
        pauseRequestRef.current = false;
        didInput = true;
      }

      if (spinRequestRef.current) {
        const spun = beginSpin(current);
        if (spun.spinUsed !== current.spinUsed && spun.pendingSpinId) {
          const center = getSegmentCenterAngle(spun.wheel, spun.pendingSpinId);
          setWheelRotation((rotation) => {
            const target = (360 - center) % 360;
            return (Math.floor(rotation / 360) + spinTurns) * 360 + target;
          });
        }
        current = spun;
        spinRequestRef.current = false;
        didInput = true;
      }

      const next = current.paused ? current : tick(current, delta);
      gameRef.current = next;
      paint(next);

      if (!isCombatPhase(next.phase) || didInput || now - lastHudRef.current > 50) {
        lastHudRef.current = now;
        setGame(next);
      }

      if (isCombatPhase(next.phase)) {
        frameId = window.requestAnimationFrame(loop);
      }
    }

    frameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frameId);
  }, [game.phase]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        handleSpin();
        return;
      }
      if (event.code === 'Escape' || event.code === 'KeyP') {
        event.preventDefault();
        togglePause();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function updateGame(updater: (current: WheelBattleState) => WheelBattleState) {
    setGame((current) => {
      const next = updater(gameRef.current.phase === current.phase ? gameRef.current : current);
      gameRef.current = next;
      return next;
    });
  }

  function paint(next: WheelBattleState) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || (!isCombatPhase(next.phase) && next.phase !== 'defeat')) {
      return;
    }
    drawBattlefield(ctx, next, canvas.width, canvas.height, next.elapsedMs);
  }

  function handleSpin() {
    spinRequestRef.current = true;
  }

  function togglePause() {
    pauseRequestRef.current = true;
  }

  function enterBattle() {
    updateGame((current) => lockWheelAndStartLevel({ ...current, wheel: current.wheel }, current.levelIndex));
  }

  function resetRun() {
    const next = createInitialState(gameRef.current.meta);
    gameRef.current = next;
    setWheelRotation(0);
    setGame(next);
  }

  function leaveToHangar() {
    if (isCombatPhase(gameRef.current.phase) || gameRef.current.phase === 'defeat') {
      const settled = gameRef.current.goldAwarded ? gameRef.current : settleRun(gameRef.current, false);
      persistAndReset(settled.meta);
      return;
    }
    resetRun();
  }

  function persistAndReset(nextMeta: MetaProgress) {
    setCoins(nextMeta.coins);
    setUpgrades(nextMeta.upgrades);
    setUnlocked(nextMeta.unlockedSectors);
    const next = createInitialState(nextMeta);
    gameRef.current = next;
    setWheelRotation(0);
    setGame(next);
  }

  const level = levels[Math.min(game.levelIndex, levels.length - 1)];
  const telegraph = getTelegraph(game);
  const effects = getActiveEffectLabels(game);
  const armorCap = getArmorCap(game.meta);
  const wheelBackground = useMemo(() => buildWheelGradient(game.wheel), [game.wheel]);
  const inPrep = game.phase === 'hangar' || game.phase === 'assembly';
  const inCombat = isCombatPhase(game.phase) || game.phase === 'defeat';
  const bestScore = Math.max(highScore, game.score);

  return (
    <GameLayout
      title="转盘大作战"
      description="战前组装转盘，战斗中战机自动开火。能量满一次就存一次转动机会，在波次和 Boss 窗口按下强化；一局结束后用金币升级部分效果。"
      actions={
        <>
          {inCombat ? (
            <button className="button" type="button" onClick={togglePause}>
              {game.paused ? '继续' : '暂停'}
            </button>
          ) : null}
          <button className="button" type="button" onClick={leaveToHangar}>
            返回机库
          </button>
        </>
      }
      aside={
        <div>
          <section>
            <h2>怎么玩</h2>
            <p>战斗中不需要走位。飞机自动开火，你只在合适的窗口按「转动」或空格。</p>
          </section>
          <section>
            <h2>三关 Boss</h2>
            <ol className={styles.asideList}>
              {levels.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>
                  <small>{item.bossName}：{item.description}</small>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2>养成</h2>
            <p>金币只在整局结束时发放。10 种效果可升到 Lv3，其余靠时机。不和幸运转盘互通。</p>
          </section>
        </div>
      }
    >
      <div
        className={styles.wrapper}
        style={{ '--wheel-rotation': `${wheelRotation}deg` } as CSSProperties}
      >
        <div className={styles.topBar}>
          {inPrep ? (
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${game.phase === 'hangar' ? styles.tabActive : ''}`} type="button" onClick={() => updateGame((current) => ({ ...current, phase: 'hangar' }))}>
                机库
              </button>
              <button className={`${styles.tab} ${game.phase === 'assembly' ? styles.tabActive : ''}`} type="button" onClick={() => updateGame((current) => ({ ...current, phase: 'assembly' }))}>
                组装
              </button>
            </div>
          ) : (
            <strong>{level.name}</strong>
          )}
          <span className={styles.goldChip}>补给金币 {game.meta.coins}</span>
        </div>

        {inPrep && game.phase === 'hangar' ? (
          <HangarPanel
            game={game}
            onUpgrade={(id) => updateGame((current) => {
              const nextMeta = upgradeSector(current.meta, id);
              return { ...current, meta: nextMeta, lastSpinMessage: `已升级「${getSector(id).name}」，下一局战斗生效。` };
            })}
          />
        ) : null}

        {inPrep && game.phase === 'assembly' ? (
          <AssemblyPanel
            game={game}
            wheelBackground={wheelBackground}
            onAdd={(id) => updateGame((current) => ({ ...current, wheel: addSector(current.wheel, id) }))}
            onRemove={(id) => updateGame((current) => ({ ...current, wheel: removeSector(current.wheel, id) }))}
            onResize={(id, weight) => updateGame((current) => ({ ...current, wheel: resizeSector(current.wheel, id, weight) }))}
            onEqualize={() => updateGame((current) => ({ ...current, wheel: equalizeWheel(current.wheel) }))}
            onRecommend={() => updateGame((current) => ({ ...current, wheel: recommendedWheel(current.meta.unlockedSectors) }))}
            onEnter={enterBattle}
          />
        ) : null}

        {inCombat ? (
          <div className={styles.combatLayout}>
            <div>
              <section className={styles.statusPanel} aria-label="战场状态">
                <div>
                  <span>生命</span>
                  <strong>{game.player.hp}</strong>
                  <div className={styles.barTrack}><span className={styles.barFill} style={{ '--bar': game.player.hp } as CSSProperties} /></div>
                </div>
                <div>
                  <span>护甲</span>
                  <strong>{game.player.armor}/{armorCap}</strong>
                  <div className={styles.barTrack}><span className={`${styles.barFill} ${styles.armorFill}`} style={{ '--bar': Math.min(100, (game.player.armor / armorCap) * 100) } as CSSProperties} /></div>
                </div>
                <div>
                  <span>能量</span>
                  <strong>{game.energy}/100</strong>
                  <div className={styles.barTrack}><span className={`${styles.barFill} ${styles.energyFill}`} style={{ '--bar': game.energy } as CSSProperties} /></div>
                </div>
                <div>
                  <span>转动次数</span>
                  <strong>{game.spinCharges}/3</strong>
                </div>
                <div>
                  <span>分数</span>
                  <strong>{game.score}</strong>
                </div>
              </section>
              <div className={styles.canvasWrap}>
                {telegraph && telegraph.remainMs > 0 ? (
                  <div className={styles.telegraph}>
                    {telegraph.label}
                    {telegraph.remainMs > 0 ? ` · ${(telegraph.remainMs / 1000).toFixed(1)}s` : ''}
                  </div>
                ) : null}
                <canvas ref={canvasRef} aria-label="转盘大作战战场" />
              </div>
              <p className={styles.muted} aria-live="polite">
                {game.lastSpinMessage} 击坠 {game.kills} · 漏敌 {game.leaks} · 最高分 {bestScore}
              </p>
            </div>
            <div className={styles.wheelColumn}>
              <div className={styles.wheelStage}>
                <div className={styles.pointer} aria-hidden="true" />
                <div className={styles.wheel} style={{ background: wheelBackground }} aria-label="自制转盘" />
                <div className={styles.wheelCenter}>SPIN</div>
              </div>
              <button className={styles.spinButton} type="button" disabled={!canSpin(game)} onClick={handleSpin}>
                {game.spinCharges > 0 ? `转动（${game.spinCharges}）` : '次数不足'}
              </button>
              <div className={styles.effectTags}>
                {effects.length > 0 ? effects.map((label) => <span className={styles.effectTag} key={label}>{label}</span>) : <span className={styles.muted}>暂无持续效果</span>}
              </div>
              {game.phase === 'defeat' ? (
                <div className={styles.overlay}>
                  <strong>基地被摧毁</strong>
                  <p>本关重开不会发放金币；结束本局才会结算养成。</p>
                  <button className={styles.primaryButton} type="button" onClick={() => updateGame(retryLevel)}>本关重开</button>
                  <button className={styles.ghostButton} type="button" onClick={() => updateGame((current) => settleRun(current, false))}>结束本局</button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {game.phase === 'settlement' ? (
          <div className={styles.overlay}>
            <strong>{game.runWon ? '通关赤红母舰' : '本局结束'}</strong>
            <p>分数 {game.score} · 最高分 {bestScore} · 补给金币 +{game.runGold}</p>
            <p>击坠 {game.kills} · 漏敌 {game.leaks} · 转动 {game.spinUsed} 次</p>
            <button className={styles.primaryButton} type="button" onClick={resetRun}>返回机库</button>
          </div>
        ) : null}

        <section className={styles.logCard} aria-live="polite">
          <div className={styles.cardHeading}>
            <strong>战报</strong>
            <span>{game.log.length} 条</span>
          </div>
          <ol>
            {game.log.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ol>
        </section>
      </div>
    </GameLayout>
  );
}

function HangarPanel({
  game,
  onUpgrade,
}: {
  game: WheelBattleState;
  onUpgrade: (id: SectorId) => void;
}) {
  return (
    <div className={styles.hangarGrid}>
      {sectorCatalog.map((sector) => {
        const unlocked = game.meta.unlockedSectors.includes(sector.id);
        const level = getUpgradeLevel(game.meta, sector.id);
        const cost = isUpgradable(sector.id) ? upgradeCost(level) : null;
        return (
          <article className={`${styles.card} ${unlocked ? '' : styles.locked}`} key={sector.id}>
            <div className={styles.cardHeading}>
              <h3>{sector.name}</h3>
              <span>{getCategoryLabel(sector.category)}</span>
            </div>
            <small>{unlocked ? `解锁：${sector.unlock}` : `未解锁 · ${sector.unlock}`}</small>
            <p className={styles.muted}>{sector.description}</p>
            {sector.upgradable ? (
              <>
                <strong>Lv{level} {powerSummary(sector.id, level)}</strong>
                <button
                  className={styles.upgradeButton}
                  type="button"
                  disabled={!canUpgrade(game.meta, sector.id)}
                  onClick={() => onUpgrade(sector.id)}
                >
                  {cost === null ? '已满级' : `升级 Lv${level + 1} · ${cost} 金币`}
                </button>
              </>
            ) : (
              <small>靠时机，不提供升级</small>
            )}
          </article>
        );
      })}
    </div>
  );
}

function AssemblyPanel({
  game,
  wheelBackground,
  onAdd,
  onRemove,
  onResize,
  onEqualize,
  onRecommend,
  onEnter,
}: {
  game: WheelBattleState;
  wheelBackground: string;
  onAdd: (id: SectorId) => void;
  onRemove: (id: SectorId) => void;
  onResize: (id: SectorId, weight: number) => void;
  onEqualize: () => void;
  onRecommend: () => void;
  onEnter: () => void;
}) {
  const unused = game.meta.unlockedSectors.filter((id) => !game.wheel.some((sector) => sector.id === id));
  return (
    <div className={styles.assemblyLayout}>
      <div>
        {game.wheel.map((sector) => (
          <div className={styles.sliderRow} key={sector.id}>
            <div className={styles.cardHeading}>
              <strong>{getSector(sector.id).name}</strong>
              <span>{sector.weight}%</span>
            </div>
            <input
              type="range"
              min={8}
              max={40}
              value={sector.weight}
              aria-label={`${getSector(sector.id).name} 权重`}
              onChange={(event) => onResize(sector.id, Number(event.target.value))}
            />
            <button className={styles.ghostButton} type="button" disabled={game.wheel.length <= 4} onClick={() => onRemove(sector.id)}>
              移除
            </button>
          </div>
        ))}
        <div className={styles.actionsRow}>
          <button className={styles.ghostButton} type="button" onClick={onEqualize}>平均分配</button>
          <button className={styles.ghostButton} type="button" onClick={onRecommend}>推荐方案</button>
          <button className={styles.primaryButton} type="button" onClick={onEnter}>进入战斗</button>
        </div>
        <div className={styles.effectTags}>
          {unused.map((id) => (
            <button className={styles.itemButton} key={id} type="button" disabled={game.wheel.length >= 7} onClick={() => onAdd(id)}>
              加入 {getSector(id).shortName}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.wheelColumn}>
        <div className={styles.wheelStage}>
          <div className={styles.pointer} aria-hidden="true" />
          <div className={styles.wheel} style={{ background: wheelBackground }} />
          <div className={styles.wheelCenter}>PREP</div>
        </div>
        <p className={styles.muted}>4–7 格，总和 100。进入战斗后不能再改。</p>
      </div>
    </div>
  );
}

function powerSummary(id: SectorId, level: UpgradeLevel) {
  const power = getSectorPower(id, level);
  if (id === 'repair') return `治疗 ${power.heal}`;
  if (id === 'armor') return `护甲 +${power.armor}`;
  if (id === 'aegis') return `无敌 ${(power.aegisMs / 1000).toFixed(1)}s`;
  if (id === 'rapid') return `间隔 ${power.fireIntervalMs}ms`;
  if (id === 'spread') return `侧弹 ${power.spreadDamage}`;
  if (id === 'pierce') return `${power.pierceShots} 发`;
  if (id === 'missile') return `${power.missileCount} 枚`;
  if (id === 'overclock') return `×${power.overclockDamage.toFixed(2)}`;
  if (id === 'purge') return `范围 ${power.purgeDamage}`;
  if (id === 'time-dilation') return `${(power.timeDilationMs / 1000).toFixed(1)}s`;
  return '';
}
