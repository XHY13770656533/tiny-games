import GameLayout from '../GameLayout/GameLayout';
import styles from './GamePlaceholder.module.css';

type GamePlaceholderProps = {
  title: string;
  description: string;
  milestones: string[];
};

export default function GamePlaceholder({
  title,
  description,
  milestones,
}: GamePlaceholderProps) {
  return (
    <GameLayout
      title={title}
      description={description}
      aside={
        <div>
          <h2>实现建议</h2>
          <p>后续实现时请优先拆分纯逻辑函数，再接入 UI、键盘或 Canvas 事件。</p>
        </div>
      }
    >
      <div className={styles.placeholder}>
        <p className={styles.badge}>规划中</p>
        <h2>{title} 的游戏骨架已预留</h2>
        <p>{description}</p>
        <ol>
          {milestones.map((milestone) => (
            <li key={milestone}>{milestone}</li>
          ))}
        </ol>
      </div>
    </GameLayout>
  );
}
