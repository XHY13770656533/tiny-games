import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  advanceGame,
  createInitialState,
  getInteractionIcon,
  getInteractionLabel,
  getPropIcon,
  getPropLabel,
  getRoomMap,
  roomHeight,
  roomMaps,
  type Adult,
  type GameState,
  type InputVector,
  type MapId,
  type Point,
  type Rect,
  useHeldProp,
  useNearbyInteraction,
  useSkill,
} from './logic';
import styles from './styles.module.css';

const directionKeys: Record<string, keyof typeof directions> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} satisfies Record<string, InputVector>;

export default function FindPacifierGame() {
  const [game, setGame] = useState<GameState>(() => createInitialState());
  const inputRef = useRef<InputVector>({ x: 0, y: 0 });
  const activeDirectionsRef = useRef(new Set<keyof typeof directions>());
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (game.status !== 'running') {
      lastFrameRef.current = null;
      return undefined;
    }

    let frameId = 0;
    function tick(now: number) {
      const previous = lastFrameRef.current ?? now;
      lastFrameRef.current = now;
      setGame((current) => advanceGame(current, inputRef.current, now - previous));
      frameId = window.requestAnimationFrame(tick);
    }
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [game.status]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const direction = directionKeys[event.code];
      if (direction) {
        event.preventDefault();
        activeDirectionsRef.current.add(direction);
        updateInputVector();
        return;
      }
      if (event.repeat) return;
      if (event.code === 'Digit1' || event.code === 'KeyJ') {
        event.preventDefault();
        setGame((current) => useSkill(current, 'poop'));
      } else if (event.code === 'Digit2' || event.code === 'KeyK') {
        event.preventDefault();
        setGame((current) => useSkill(current, 'pee'));
      } else if (event.code === 'KeyE' || event.code === 'Space') {
        event.preventDefault();
        setGame((current) => useHeldProp(current));
      } else if (event.code === 'KeyF') {
        event.preventDefault();
        setGame((current) => useNearbyInteraction(current));
      } else if (event.code === 'KeyR') {
        setGame((current) => createInitialState(current.mapId));
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      const direction = directionKeys[event.code];
      if (!direction) return;
      activeDirectionsRef.current.delete(direction);
      updateInputVector();
    }

    function clearInput() {
      activeDirectionsRef.current.clear();
      updateInputVector();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearInput);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearInput);
    };
  }, []);

  function updateInputVector() {
    let x = 0;
    let y = 0;
    activeDirectionsRef.current.forEach((direction) => {
      x += directions[direction].x;
      y += directions[direction].y;
    });
    inputRef.current = { x, y };
  }

  function resetGame(mapId: MapId = game.mapId) {
    activeDirectionsRef.current.clear();
    inputRef.current = { x: 0, y: 0 };
    lastFrameRef.current = null;
    setGame(createInitialState(mapId));
  }

  function handleDirectionStart(direction: keyof typeof directions) {
    activeDirectionsRef.current.add(direction);
    updateInputVector();
  }

  function handleDirectionEnd(direction: keyof typeof directions) {
    activeDirectionsRef.current.delete(direction);
    updateInputVector();
  }

  const secondsLeft = Math.ceil(game.remainingMs / 1000);
  const danger = game.adults.some((adult) => adult.mood === 'chasing');
  const roomMap = getRoomMap(game.mapId);

  return (
    <GameLayout
      title="找奶嘴"
      description="扮演偷偷溜出摇篮的婴儿，在限时内穿过家具重重的房间找到奶嘴。躲开大人的视线，用特殊技能和散落玩具争取逃跑机会。"
      actions={
        <>
          <label className={styles.mapPicker}>
            <span>选择地图</span>
            <select value={game.mapId} onChange={(event) => resetGame(event.target.value as MapId)}>
              {roomMaps.map((map) => <option key={map.id} value={map.id}>{map.name}</option>)}
            </select>
          </label>
          <button className="button" type="button" onClick={() => resetGame()}>
            随机奶嘴重开
          </button>
        </>
      }
      aside={<GameGuide />}
    >
      <div className={styles.wrapper}>
        <section className={styles.hud} aria-label="游戏状态">
          <HudItem label="剩余时间" value={`${secondsLeft} 秒`} danger={secondsLeft <= 15} />
          <HudItem label="当前地图" value={roomMap.name} />
          <HudItem label="大人数量" value={`${game.adults.length} 人`} />
          <HudItem label="被抓次数" value={`${game.captures} 次`} />
          <HudItem label="当前道具" value={game.heldProp ? `${getPropIcon(game.heldProp)} ${getPropLabel(game.heldProp)}` : '空手'} />
        </section>

        <div className={`${styles.message} ${danger ? styles.dangerMessage : ''}`} aria-live="polite">
          <span>{danger ? '⚠️' : '💭'}</span>
          <strong>{danger ? '被发现了！快跑！' : game.message}</strong>
        </div>

        <section
          className={[
            styles.room,
            styles[`map-${roomMap.className}`],
            game.blackoutMs > 0 ? styles.roomDark : '',
          ].join(' ')}
          aria-label={`俯视房间地图，剩余 ${secondsLeft} 秒，${game.message}`}
        >
          <div className={styles.wallTop} aria-hidden="true" />
          <div className={styles.rug} aria-hidden="true"><span>软软的地毯</span></div>
          <div className={styles.window} aria-hidden="true"><span /><span /><span /></div>
          <div className={styles.door} aria-hidden="true">门</div>

          {roomMap.furniture.map((item) => <Furniture key={item.id} item={item} />)}

          {game.interactions.map((interaction) => (
            <span
              key={interaction.id}
              className={`${styles.interaction} ${interaction.cooldownMs > 0 ? styles.interactionCooling : ''}`}
              style={positionStyle(interaction)}
              title={`${getInteractionLabel(interaction.kind)}${interaction.cooldownMs > 0 ? '（恢复中）' : '（靠近按 F）'}`}
            >
              <span>{getInteractionIcon(interaction.kind)}</span>
              <small>{interaction.cooldownMs > 0 ? Math.ceil(interaction.cooldownMs / 1000) : 'F'}</small>
            </span>
          ))}

          {game.props.filter((prop) => !prop.collected).map((prop) => (
            <span
              key={prop.id}
              className={styles.roomProp}
              style={positionStyle(prop)}
              title={`可利用道具：${getPropLabel(prop.kind)}`}
            >
              {getPropIcon(prop.kind)}
            </span>
          ))}

          {game.effects.map((effect) => (
            <span
              key={effect.id}
              className={`${styles.floorEffect} ${effect.kind === 'poop' ? styles.poopEffect : styles.peeEffect}`}
              style={positionStyle(effect)}
              aria-hidden="true"
            >
              {effect.kind === 'poop' ? '💩' : '💧'}
            </span>
          ))}

          <span className={styles.pacifier} style={positionStyle(game.pacifier)} aria-label="目标奶嘴">
            <span>奶嘴</span>
            🍼
          </span>

          {game.adults.map((adult) => <AdultView key={adult.id} adult={adult} />)}

          <span
            className={`${styles.baby} ${game.hiddenMs > 0 ? styles.babyHidden : ''}`}
            style={positionStyle(game.player)}
            aria-label={game.hiddenMs > 0 ? '藏起来的婴儿' : '你操控的婴儿'}
          >
            <span className={styles.babyTuft}>〰</span>
            <span className={styles.babyFace}>•ᴗ•</span>
          </span>

          {game.status !== 'running' ? (
            <div className={styles.overlay}>
              <span className={styles.resultIcon}>{game.status === 'won' ? '🍼' : '🕰️'}</span>
              <strong>{game.status === 'won' ? '奶嘴找到了！' : '寻找失败'}</strong>
              <p>{game.message}</p>
              <small>被大人捉住 {game.captures} 次</small>
              <button className="button" type="button" onClick={() => resetGame()}>再玩一次</button>
            </div>
          ) : null}
        </section>

        <section className={styles.controls} aria-label="游戏操作">
          <DPad onStart={handleDirectionStart} onEnd={handleDirectionEnd} />
          <div className={styles.skillControls}>
            <SkillButton
              icon="💩"
              label="拉屎"
              keyHint="1 / J"
              cooldownMs={game.cooldowns.poop}
              onClick={() => setGame((current) => useSkill(current, 'poop'))}
            />
            <SkillButton
              icon="💦"
              label="撒尿"
              keyHint="2 / K"
              cooldownMs={game.cooldowns.pee}
              onClick={() => setGame((current) => useSkill(current, 'pee'))}
            />
            <button
              className={styles.propButton}
              type="button"
              disabled={!game.heldProp}
              onClick={() => setGame((current) => useHeldProp(current))}
            >
              <span>{game.heldProp ? getPropIcon(game.heldProp) : '🧸'}</span>
              <strong>{game.heldProp ? `使用${getPropLabel(game.heldProp)}` : '寻找玩具'}</strong>
              <small>E / 空格</small>
            </button>
            <button
              className={styles.interactButton}
              type="button"
              disabled={game.hiddenMs > 0}
              onClick={() => setGame((current) => useNearbyInteraction(current))}
            >
              <span>✨</span>
              <strong>{game.hiddenMs > 0 ? `藏身 ${(game.hiddenMs / 1000).toFixed(1)} 秒` : '场景互动'}</strong>
              <small>靠近设施 · F</small>
            </button>
          </div>
        </section>
      </div>
    </GameLayout>
  );
}

function HudItem({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`${styles.hudItem} ${danger ? styles.hudDanger : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Furniture({ item }: { item: Rect & { id: string; label: string; kind: string } }) {
  return (
    <div
      className={`${styles.furniture} ${styles[`furniture-${item.kind}`]}`}
      style={rectStyle(item)}
      aria-hidden="true"
    >
      <span>{item.label}</span>
    </div>
  );
}

function AdultView({ adult }: { adult: Adult }) {
  const moodLabel = {
    patrol: '巡视中',
    chasing: '正在追你',
    distracted: '被声音吸引',
    stunned: '被干扰',
  }[adult.mood];

  return (
    <div
      className={`${styles.adult} ${styles[`adult-${adult.mood}`]}`}
      style={{ ...positionStyle(adult), '--facing': `${adult.angle}rad` } as CSSProperties}
      title={`大人：${moodLabel}`}
      aria-label={`大人，${moodLabel}`}
    >
      {adult.mood === 'chasing' ? <span className={styles.alert}>!</span> : null}
      {adult.mood === 'stunned' ? <span className={styles.stars}>✦ ✧</span> : null}
      <span className={styles.adultHair} />
      <span className={styles.adultFace}>•︵•</span>
      <span className={styles.adultBody} />
    </div>
  );
}

function DPad({
  onStart,
  onEnd,
}: {
  onStart: (direction: keyof typeof directions) => void;
  onEnd: (direction: keyof typeof directions) => void;
}) {
  function bind(direction: keyof typeof directions) {
    return {
      onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onStart(direction);
      },
      onPointerUp: () => onEnd(direction),
      onPointerCancel: () => onEnd(direction),
      onPointerLeave: (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.buttons === 0) onEnd(direction);
      },
    };
  }

  return (
    <div className={styles.dpad} aria-label="移动方向">
      <button type="button" className={styles.up} aria-label="向上移动" {...bind('up')}>▲</button>
      <button type="button" className={styles.left} aria-label="向左移动" {...bind('left')}>◀</button>
      <span className={styles.dpadCenter}>✦</span>
      <button type="button" className={styles.right} aria-label="向右移动" {...bind('right')}>▶</button>
      <button type="button" className={styles.down} aria-label="向下移动" {...bind('down')}>▼</button>
    </div>
  );
}

function SkillButton({
  icon,
  label,
  keyHint,
  cooldownMs,
  onClick,
}: {
  icon: string;
  label: string;
  keyHint: string;
  cooldownMs: number;
  onClick: () => void;
}) {
  const coolingDown = cooldownMs > 0;
  return (
    <button className={styles.skillButton} type="button" disabled={coolingDown} onClick={onClick}>
      <span>{icon}</span>
      <strong>{coolingDown ? `${(cooldownMs / 1000).toFixed(1)} 秒` : label}</strong>
      <small>{coolingDown ? '冷却中' : keyHint}</small>
    </button>
  );
}

function GameGuide() {
  return (
    <div className={styles.guide}>
      <section>
        <h2>如何移动</h2>
        <p>电脑使用 WASD 或方向键；手机可按住方向盘。家具和墙壁都无法穿过。</p>
      </section>
      <section>
        <h2>躲避大人</h2>
        <p>家具能挡住视线。大人会随机巡视，发现你后会加速追赶，被碰到会回到摇篮并损失 5 秒。</p>
      </section>
      <section>
        <h2>逃跑手段</h2>
        <ul>
          <li><b>💩 拉屎：</b>留下较久的陷阱，熏晕踩到的大人。</li>
          <li><b>💦 撒尿：</b>制造湿滑区域，让大人短暂滑倒。</li>
          <li><b>🪇 场景玩具：</b>靠近自动拾取，使用后把大人引向声源。</li>
        </ul>
      </section>
      <section>
        <h2>场景互动</h2>
        <ul>
          <li><b>🧺 衣篓：</b>短暂藏身，大人无法发现你。</li>
          <li><b>💡 灯开关：</b>关灯后大人的视野明显缩短。</li>
          <li><b>🎵 音乐盒：</b>把所有大人引向音乐声源。</li>
        </ul>
        <p>靠近设施按 F 或点击“场景互动”。每局地图与奶嘴位置相互独立，重开后奶嘴会随机出现在无碰撞区域。</p>
      </section>
    </div>
  );
}

function positionStyle(point: Point) {
  return {
    left: `${point.x}%`,
    top: `${(point.y / roomHeight) * 100}%`,
  };
}

function rectStyle(rect: Rect) {
  return {
    left: `${rect.x}%`,
    top: `${(rect.y / roomHeight) * 100}%`,
    width: `${rect.width}%`,
    height: `${(rect.height / roomHeight) * 100}%`,
  };
}
