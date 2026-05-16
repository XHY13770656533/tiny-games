import { useEffect, useMemo, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  createMemory,
  getNextIdleSceneIndex,
  idleScenes,
  interactionResponses,
  type PetInteraction,
} from './logic';
import styles from './styles.module.css';

const interactionOrder: PetInteraction[] = ['feed', 'drink', 'play'];
const reactionDurationMs = 2600;

export default function ElectronicPetGame() {
  const [idleSceneIndex, setIdleSceneIndex] = useState(0);
  const [activeInteraction, setActiveInteraction] = useState<PetInteraction | null>(null);
  const [memories, setMemories] = useState<string[]>([]);

  const idleScene = idleScenes[idleSceneIndex];
  const reaction = activeInteraction ? interactionResponses[activeInteraction] : null;
  const visibleMessage = reaction?.message ?? idleScene.message;
  const visibleTitle = reaction?.title ?? idleScene.title;
  const petPose = reaction ? 'center' : idleScene.pose;
  const petMotion = reaction?.motion ?? idleScene.motion;

  const stageClassName = useMemo(
    () => [styles.pet, styles[`pose-${petPose}`], styles[`motion-${petMotion}`]].join(' '),
    [petMotion, petPose],
  );

  useEffect(() => {
    if (activeInteraction) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIdleSceneIndex((currentIndex) => getNextIdleSceneIndex(currentIndex));
    }, 3200);

    return () => window.clearInterval(timer);
  }, [activeInteraction]);

  useEffect(() => {
    if (!activeInteraction) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActiveInteraction(null);
    }, reactionDurationMs);

    return () => window.clearTimeout(timer);
  }, [activeInteraction]);

  function handleInteraction(action: PetInteraction) {
    const response = interactionResponses[action];
    setActiveInteraction(action);
    setIdleSceneIndex(1);
    setMemories((currentMemories) => [
      createMemory(response),
      ...currentMemories.filter((memory) => memory !== createMemory(response)),
    ].slice(0, 4));
  }

  return (
    <GameLayout
      title="电子宠物"
      description="陪伴一只名叫小糯的软乎乎小动物。它没有生命值、健康度或失败惩罚，只会根据你的喂食、喝水和玩耍做出回应；没有互动时，它会自己散步、探索和休息。"
      aside={
        <div>
          <h2>玩法说明</h2>
          <p>点击下方三个互动按钮观察小糯的反应。你不需要照顾数值，只需要陪它玩一会儿。</p>
          <p>停止操作后，小糯会自动切换空闲行为，例如走来走去、闻闻空气、蹦跳或休息。</p>
        </div>
      }
    >
      <div className={styles.wrapper}>
        <section className={styles.stage} aria-label="电子宠物活动区">
          <div className={styles.roomDecor} aria-hidden="true">
            <span className={styles.cloudOne} />
            <span className={styles.cloudTwo} />
            <span className={styles.plant} />
          </div>

          <div className={styles.speechBubble} aria-live="polite">
            <strong>{visibleTitle}</strong>
            <span>{visibleMessage}</span>
          </div>

          {reaction ? <div className={styles.activeItem}>{reaction.itemLabel}</div> : null}

          <div className={styles.petTrack}>
            <div className={stageClassName} aria-label="小糯，电子宠物">
              <div className={styles.earLeft} />
              <div className={styles.earRight} />
              <div className={styles.body}>
                <span className={styles.eyeLeft} />
                <span className={styles.eyeRight} />
                <span className={styles.nose} />
                <span className={styles.mouth} />
                <span className={styles.cheekLeft} />
                <span className={styles.cheekRight} />
              </div>
              <div className={styles.tail} />
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

        <section className={styles.memories} aria-label="最近互动">
          <h2>最近互动</h2>
          {memories.length > 0 ? (
            <ul>
              {memories.map((memory) => (
                <li key={memory}>{memory}</li>
              ))}
            </ul>
          ) : (
            <p>还没有互动记录。先和小糯打个招呼吧。</p>
          )}
        </section>
      </div>
    </GameLayout>
  );
}
