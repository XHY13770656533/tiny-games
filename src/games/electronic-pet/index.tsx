import type { CSSProperties, PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  clampPetX,
  createMemory,
  formatPetText,
  getNextIdleSceneIndex,
  idleScenes,
  interactionResponses,
  petProfiles,
  type PetInteraction,
  type PetSpecies,
} from './logic';
import styles from './styles.module.css';

const interactionOrder: PetInteraction[] = ['feed', 'drink', 'play'];
const reactionDurationMs = 3200;
const cursorFocusDurationMs = 1500;

type PointerState = {
  x: number;
  y: number;
  lookX: number;
  lookY: number;
};

const initialPointerState: PointerState = {
  x: 50,
  y: 50,
  lookX: 0,
  lookY: 0,
};

export default function ElectronicPetGame() {
  const [selectedPetId, setSelectedPetId] = useState<PetSpecies>('fox');
  const [idleSceneIndex, setIdleSceneIndex] = useState(0);
  const [activeInteraction, setActiveInteraction] = useState<PetInteraction | null>(null);
  const [memories, setMemories] = useState<string[]>([]);
  const [petX, setPetX] = useState(50);
  const [pointerState, setPointerState] = useState<PointerState>(initialPointerState);
  const [isCursorActive, setIsCursorActive] = useState(false);
  const cursorTimeoutRef = useRef<number | null>(null);
  const lastChaseAtRef = useRef(0);

  const selectedPet = petProfiles.find((profile) => profile.id === selectedPetId) ?? petProfiles[0];
  const idleScene = idleScenes[idleSceneIndex];
  const reaction = activeInteraction ? interactionResponses[activeInteraction] : null;
  const isChasingCursor = isCursorActive && !reaction;
  const visibleTitle = isChasingCursor ? '发现鼠标' : (reaction?.title ?? idleScene.title);
  const visibleMessage = isChasingCursor
    ? `${selectedPet.name}盯住了你的鼠标，身体也跟着悄悄靠近。`
    : formatPetText(reaction?.message ?? idleScene.message, selectedPet.name);
  const petMotion = reaction?.motion ?? (isChasingCursor ? 'curious' : idleScene.motion);

  const petClassName = useMemo(
    () => [styles.pet, styles[`animal-${selectedPet.themeClass}`]].join(' '),
    [selectedPet.themeClass],
  );

  const spriteClassName = useMemo(
    () => [styles.sprite, styles[`motion-${petMotion}`]].join(' '),
    [petMotion],
  );

  const stageClassName = useMemo(
    () => [
      styles.stage,
      reaction ? styles[`interaction-${reaction.action}`] : '',
      isChasingCursor ? styles.cursorActive : '',
    ]
      .filter(Boolean)
      .join(' '),
    [isChasingCursor, reaction],
  );

  const petStyle = {
    '--pet-x': `${petX}%`,
    '--look-x': pointerState.lookX.toFixed(2),
    '--look-y': pointerState.lookY.toFixed(2),
    '--pet-accent': selectedPet.accentColor,
  } as CSSProperties;

  const stageStyle = {
    '--cursor-x': `${pointerState.x}%`,
    '--cursor-y': `${pointerState.y}%`,
    '--pet-accent': selectedPet.accentColor,
  } as CSSProperties;

  useEffect(() => {
    if (activeInteraction || isCursorActive) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIdleSceneIndex((currentIndex) => {
        const nextIndex = getNextIdleSceneIndex(currentIndex);
        setPetX(idleScenes[nextIndex].x);
        return nextIndex;
      });
    }, 3800);

    return () => window.clearInterval(timer);
  }, [activeInteraction, isCursorActive]);

  useEffect(() => {
    if (!activeInteraction) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActiveInteraction(null);
    }, reactionDurationMs);

    return () => window.clearTimeout(timer);
  }, [activeInteraction]);

  useEffect(() => {
    setMemories([]);
    setActiveInteraction(null);
    setPetX(50);
    setPointerState(initialPointerState);
    setIsCursorActive(false);
  }, [selectedPetId]);

  useEffect(() => () => {
    if (cursorTimeoutRef.current) {
      window.clearTimeout(cursorTimeoutRef.current);
    }
  }, []);

  function handleInteraction(action: PetInteraction) {
    const response = interactionResponses[action];
    setActiveInteraction(action);
    setIsCursorActive(false);
    setPetX(50);
    setIdleSceneIndex(1);
    setMemories((currentMemories) => [
      createMemory(response, selectedPet.name),
      ...currentMemories.filter((memory) => memory !== createMemory(response, selectedPet.name)),
    ].slice(0, 5));
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const lookX = Math.max(-1, Math.min(1, (x - petX) / 34));
    const lookY = Math.max(-1, Math.min(1, (y - 58) / 28));

    setPointerState({ x, y, lookX, lookY });
    setIsCursorActive(true);

    if (cursorTimeoutRef.current) {
      window.clearTimeout(cursorTimeoutRef.current);
    }

    cursorTimeoutRef.current = window.setTimeout(() => {
      setIsCursorActive(false);
      setPointerState((currentState) => ({ ...currentState, lookX: 0, lookY: 0 }));
    }, cursorFocusDurationMs);

    const now = window.performance.now();
    if (!activeInteraction && now - lastChaseAtRef.current > 420) {
      lastChaseAtRef.current = now;
      setPetX(clampPetX(x + (x > petX ? -7 : 7)));
    }
  }

  function handlePointerLeave() {
    setIsCursorActive(false);
    setPointerState((currentState) => ({ ...currentState, lookX: 0, lookY: 0 }));
  }

  return (
    <GameLayout
      title="电子宠物"
      description="选择一只小动物进行陪伴。它们没有生命值、健康度或失败惩罚，只会根据你的喂食、喝水、玩耍和鼠标移动做出生动回应；没有互动时，也会自己散步、探索、伸懒腰和休息。"
      aside={
        <div>
          <h2>玩法说明</h2>
          <p>先选择小动物，再点击喂食、喝水或玩耍。每种互动都会触发真实道具动画和宠物动作。</p>
          <p>把鼠标移进活动区时，小动物会用眼睛追踪鼠标，并主动靠近想要抓住它。</p>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <section className={styles.selector} aria-label="选择电子宠物">
          {petProfiles.map((profile) => (
            <button
              className={[
                styles.petOption,
                selectedPetId === profile.id ? styles.petOptionActive : '',
              ].filter(Boolean).join(' ')}
              key={profile.id}
              style={{ '--pet-accent': profile.accentColor } as CSSProperties}
              type="button"
              onClick={() => setSelectedPetId(profile.id)}
            >
              <span>{profile.name}</span>
              <strong>{profile.speciesName}</strong>
              <small>{profile.tagline}</small>
            </button>
          ))}
        </section>

        <section
          className={stageClassName}
          style={stageStyle}
          aria-label="电子宠物活动区"
          onPointerLeave={handlePointerLeave}
          onPointerMove={handlePointerMove}
        >
          <div className={styles.roomDecor} aria-hidden="true">
            <span className={styles.cloudOne} />
            <span className={styles.cloudTwo} />
            <span className={styles.plant} />
            <span className={styles.floorToy} />
          </div>

          <div className={styles.speechBubble} aria-live="polite">
            <strong>{visibleTitle}</strong>
            <span>{visibleMessage}</span>
          </div>

          <InteractionAnimation action={activeInteraction} label={reaction?.itemLabel} />
          {isCursorActive && !reaction ? <span className={styles.cursorToy} aria-hidden="true" /> : null}

          <div className={styles.petTrack}>
            <div className={petClassName} style={petStyle} aria-label={`${selectedPet.name}，${selectedPet.speciesName}`}>
              <div className={spriteClassName}>
                <div className={styles.earLeft} />
                <div className={styles.earRight} />
                <div className={styles.body}>
                  <span className={styles.facePatch} />
                  <span className={styles.eyeLeft}>
                    <span className={styles.pupil} />
                  </span>
                  <span className={styles.eyeRight}>
                    <span className={styles.pupil} />
                  </span>
                  <span className={styles.nose} />
                  <span className={styles.mouth} />
                  <span className={styles.whiskerLeft} />
                  <span className={styles.whiskerRight} />
                  <span className={styles.cheekLeft} />
                  <span className={styles.cheekRight} />
                  <span className={styles.forePawLeft} />
                  <span className={styles.forePawRight} />
                </div>
                <div className={styles.tail} />
              </div>
              <div className={styles.shadow} />
            </div>
          </div>
        </section>

        <section className={styles.controls} aria-label="电子宠物互动操作">
          {interactionOrder.map((action) => {
            const response = interactionResponses[action];
            return (
              <button
                className={styles.interactionButton}
                key={action}
                type="button"
                onClick={() => handleInteraction(action)}
              >
                <span>{response.title}</span>
                <small>{response.itemLabel}</small>
              </button>
            );
          })}
        </section>

        <section className={styles.memories} aria-label="宠物信息和最近互动">
          <div>
            <h2>{selectedPet.name} 的性格</h2>
            <p>{selectedPet.personality}</p>
          </div>
          <div>
            <h2>最近互动</h2>
            {memories.length > 0 ? (
              <ul>
                {memories.map((memory) => (
                  <li key={memory}>{memory}</li>
                ))}
              </ul>
            ) : (
              <p>还没有互动记录。先和 {selectedPet.name} 打个招呼吧。</p>
            )}
          </div>
        </section>
      </div>
    </GameLayout>
  );
}

type InteractionAnimationProps = {
  action: PetInteraction | null;
  label?: string;
};

function InteractionAnimation({ action, label }: InteractionAnimationProps) {
  if (!action) {
    return null;
  }

  if (action === 'feed') {
    return (
      <div className={styles.feedAnimation} aria-hidden="true">
        <span className={styles.treat}>{label}</span>
        <span className={styles.crumbOne} />
        <span className={styles.crumbTwo} />
        <span className={styles.crumbThree} />
      </div>
    );
  }

  if (action === 'drink') {
    return (
      <div className={styles.drinkAnimation} aria-hidden="true">
        <span className={styles.waterBowl}>{label}</span>
        <span className={styles.rippleOne} />
        <span className={styles.rippleTwo} />
        <span className={styles.dropOne} />
      </div>
    );
  }

  return (
    <div className={styles.playAnimation} aria-hidden="true">
      <span className={styles.yarnBall}>{label}</span>
      <span className={styles.yarnTrail} />
      <span className={styles.starOne} />
      <span className={styles.starTwo} />
    </div>
  );
}
